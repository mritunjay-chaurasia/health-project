const path = require("path")
const XLSX = require('xlsx');
const fs = require('fs');
const { allowedFileTypes } = require("../config/upload.config");
const { analyzeUserReport, filterBiomarkers, readJsonFile, analyseBiomarkerDetails, generateFinalResponse, generateSummary, generateDemoGraphicQuestion } = require("../utils");
const HistoryDetails = require('../models/historyDetails.model');
const mongoose = require('mongoose');
const { USER_DETAILS } = require("../constant/env.contant");
const SampleReports = require('../models/SampleReports.model');
const { Types } = mongoose;
// function convertExcelToJson(filePath, outputJsonPath) {
//     try {
//         // Read the Excel file
//         const workbook = XLSX.readFile(filePath);

//         // Assuming you want the first sheet
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];

//         // Convert the sheet to JSON
//         const jsonData = XLSX.utils.sheet_to_json(sheet);
//         // console.log(`Excel data converted to JSON and saved as ${outputJsonPath}`);
//         console.log("Jsondata", jsonData)
//         return jsonData

//     } catch (error) {
//         console.error('Error converting Excel to JSON:', error);
//     }
// }

function convertExcelToJson(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const userDetails = {};
        const biomarkers = [];

        let currentSection = 'User Details';
        let emptyRowCount = 0;

        for (let row of jsonData) {
            // Check if the row is empty
            if (row.every(cell => cell === undefined || cell === '')) {
                emptyRowCount++;
                // If more than 5 empty rows are found, terminate the process
                if (emptyRowCount > 5) {
                    console.log('Terminating process due to too many empty rows.');
                    break;
                }
            } else {
                emptyRowCount = 0; // Reset the empty row count if a non-empty row is found

                if (row[0] === 'User Details' || row[0] === 'Biomarker') {
                    currentSection = row[0];
                } else if (currentSection === 'User Details') {
                    userDetails[row[0]] = row[1];
                } else if (currentSection === 'Biomarker') {
                    biomarkers.push({
                        name: row[0],
                        value: row[1],
                        referenceRange: row[2]
                    });
                }
            }
        }

        return { userDetails, biomarkers };

    } catch (error) {
        console.error('Error converting Excel to JSON:', error);
        return { userDetails: {}, biomarkers: [] };
    }
}


async function retrieveExcelFile(req, res) {
    try {
        const file = req.file;
        console.log('Uploading file', file);
        if (!file) {
            return res.status(200).json({ message: 'No file uploaded' });
        }

        // Check file type and size
        const fileType = path.extname(file.originalname).toLowerCase();
        // console.log('Uploading fileType', fileType);

        if (!allowedFileTypes.includes(fileType)) {
            return res.status(200).json({ status: false, message: 'Only Excel files (.xls, .xlsx, .xlsm, .csv) are accepted' });
        }
        if (file.size === 0) {
            return res.status(200).json({ status: false, message: 'Uploaded file is empty' });
        }
        const fileName = path.basename(file.path);
        const filePath = file.path;
        const { userDetails, biomarkers } = convertExcelToJson(filePath)
        console.log("userDetails", userDetails)
        const excelJsonData = biomarkers

        const aiResponse = await analyzeUserReport(excelJsonData)
        let parsedResponse = aiResponse?.choices[0]?.message?.content ?? "";

        const referenceJson = readJsonFile()
        if (parsedResponse && referenceJson) {
            parsedResponse = JSON.parse(parsedResponse)
            console.log('Uploading file excel parsedResponse', parsedResponse);

            const filteredResponse = filterBiomarkers(referenceJson, parsedResponse, excelJsonData)
            console.log('Uploading file excel parsedResponse', filteredResponse);

            const aiBiomarkerRelation = await analyseBiomarkerDetails(excelJsonData, filteredResponse)
            let parsedAiBiomarkerRelation = aiBiomarkerRelation?.choices[0]?.message?.content ? JSON.parse(aiBiomarkerRelation?.choices[0]?.message?.content) : "";

            const summary = await generateSummary(parsedAiBiomarkerRelation)
            // const demoGraphicQust = await generateDemoGraphicQust(parsedAiBiomarkerRelation)
            const parsedSummary = summary?.choices[0]?.message?.content ? JSON.parse(summary?.choices[0]?.message?.content) : "";
            // const parsedDemoGraphicQust = demoGraphicQust?.choices[0]?.message?.content ? JSON.parse(demoGraphicQust?.choices[0]?.message?.content) : "";
            // Save data to MongoDB using Mongoose
            const userId = req?.user?.id;
            const updateFile = await HistoryDetails.create({
                userId: userId,
                fileName: file?.originalname,
                aiResponse: filteredResponse,
                aiBiomarkerResponse: parsedAiBiomarkerRelation,
                summary: parsedSummary?.summary ?? "",
                demoGraphicQuestions: [
                    {
                        message: "Hi there! Please ask your query, and I'll assist you right away.",
                        from: "bot",
                        date: new Date(),
                    },
                ],
                userDetails: userDetails,
            }).catch((err) => {
                console.error('Error saving to database:', err);
            });

            return res.status(200).json({ status: true, id: updateFile?.id, updateFile })
        }
        return res.status(200).json({ status: false, message: "Unable to parse json data" })


    } catch (error) {
        console.error("error while retrieveing excel file", error)
        return res.status(200).json({ status: false, message: "Something went wrong ! Please try again" })

    }
}

const getCurrentDatePrefix = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year}_${hours}:${minutes}:${seconds}`;
};


async function fetchAllUploadedFiles(req, res) {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const userId = req?.user?.id;
        const [files, totalCount] = await Promise.all([
            HistoryDetails.find()
                .populate({
                    path: 'userId', // Path to populate
                    select: USER_DETAILS, // Fields to select from User
                    model: 'User', // Model to use for population
                    // localField: 'userId', // Field in HistoryDetails
                    foreignField: 'id', // Field in User model
                    // justOne: true // Ensures only one document is returned
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            HistoryDetails.countDocuments().exec()
        ]);
        return res.status(200).json({
            status: true,
            files,
            totalPage: Math.ceil(totalCount / limit),
        });

    } catch (error) {
        console.error('Error fetching files from database:', error);
        return res.status(500).json({ status: false, message: 'Something went wrong! Please try again' });
    }
}



async function updateChatMessage(req, res) {
    try {
        const { id, demoGraphicQuestions, rating, feedback } = req.body;
        console.log("Received data:", id, demoGraphicQuestions, rating, feedback);
        let bioGraphicQuest
        if (!id) {
            return res.status(400).json({ status: false, message: 'Invalid request data' });
        }
        // Initialize the update object
        const updateFields = {};
        // Conditionally add fields to the update object
        if (demoGraphicQuestions) {
            const updateGraphicQust = await generateDemoGraphicQuestion(demoGraphicQuestions);
            bioGraphicQuest = updateGraphicQust?.choices[0]?.message?.content
                ? JSON.parse(updateGraphicQust?.choices[0]?.message?.content)
                : "";

            const newResFromAI = {
                message: bioGraphicQuest?.demoGraphicQuestion || "",
                from: "bot",
                date: new Date(),
            };

            demoGraphicQuestions.push(newResFromAI);
            updateFields.demoGraphicQuestions = demoGraphicQuestions;
        }

        if (rating) {
            updateFields.rating = rating;
        }

        if (feedback) {
            updateFields.feedback = feedback;
        }

        // Find the document by id and update the necessary fields
        const updatedDocument = await HistoryDetails.findOneAndUpdate(
            { id },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        // Check if the document was found and updated
        if (!updatedDocument) {
            return res.status(404).json({ status: false, message: 'Document not found' });
        }

        // Return success response
        return res.status(200).json({
            status: true,
            message: 'Successfully Submitted !',
            data: updatedDocument,
            demoGraphicQuestion: updateFields.demoGraphicQuestions ? bioGraphicQuest?.demoGraphicQuestion : null
        });

    } catch (err) {
        // Log the error and return error response
        console.error("Error during update chat message:", err);
        return res.status(500).json({ status: false, message: 'Something went wrong! Please try again' });
    }
}


async function fetchFileById(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: false, message: 'ID parameter is required' });
        }
        const trimmedId = id.trim();
        const file = await HistoryDetails.findOne({
            id: trimmedId
        });
        if (!file) {
            return res.status(404).json({ status: false, message: 'File not found' });
        }
        return res.status(200).json({ status: true, file });
    } catch (error) {
        console.error('Error fetching file by ID:', error.message || error);
        return res.status(500).json({ status: false, message: 'An error occurred while fetching the file' });
    }
}

const convertJsonToExcel = (jsonData, fileName, userDetails) => {
    try {
        // Create a new workbook and a new worksheet
        const workbook = XLSX.utils.book_new();

        // Start with the "User Details" section
        const userDetailsRows = [['User Details']];
        for (const [key, value] of Object.entries(userDetails)) {
            userDetailsRows.push([key, value]);
        }

        // Add an empty row for separation
        userDetailsRows.push([]);

        // Prepare the "Biomarker" section
        const biomarkersRows = [['Biomarker'], ['Name', 'Value', 'Reference Range']];
        for (const biomarker of jsonData) {
            biomarkersRows.push([biomarker.BiomarkerName, biomarker.Value, biomarker.referenceRange ?? ""]);
        }

        // Combine all rows into one array
        const allRows = [...userDetailsRows, ...biomarkersRows];

        // Convert the combined data into a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        // Generate file name
        const parts = fileName.split('_');
        const reportFileName = parts.slice(-2).join('_');
        const dateTimePrefix = getCurrentDatePrefix();
        const prefixedFileName = `${dateTimePrefix}_${reportFileName}`;

        // Generate Excel file path
        const filePath = path.join(__dirname, '../../public/uploads', `${prefixedFileName}`);

        // Write the Excel file to the filesystem
        XLSX.writeFile(workbook, filePath);

        // Return the generated file name
        return prefixedFileName;
    } catch (error) {
        console.error("Error while converting JSON data to Excel:", error.message || error);
    }
};



async function analyzeReports(req, res) {
    try {
        const { excelJsonData, fileName,userDetails} = req.body;
        const excelFileName = convertJsonToExcel(excelJsonData, fileName,userDetails);
        const aiResponse = await analyzeUserReport(excelJsonData)
        let parsedResponse = aiResponse?.choices[0]?.message?.content ?? "";

        const referenceJson = readJsonFile()
        if (parsedResponse && referenceJson) {
            parsedResponse = JSON.parse(parsedResponse)
            const filteredResponse = filterBiomarkers(referenceJson, parsedResponse, excelJsonData)
            const aiBiomarkerRelation = await analyseBiomarkerDetails(excelJsonData, filteredResponse)
            let parsedAiBiomarkerRelation = aiBiomarkerRelation?.choices[0]?.message?.content ? JSON.parse(aiBiomarkerRelation?.choices[0]?.message?.content) : "";

            const summary = await generateSummary(parsedAiBiomarkerRelation)
            // const demoGraphicQust = await generateDemoGraphicQust(parsedAiBiomarkerRelation)
            const parsedSummary = summary?.choices[0]?.message?.content ? JSON.parse(summary?.choices[0]?.message?.content) : "";
            // const parsedDemoGraphicQust = demoGraphicQust?.choices[0]?.message?.content ? JSON.parse(demoGraphicQust?.choices[0]?.message?.content) : "";
            // Save data to MongoDB using Mongoose

            const newSampleReport = new SampleReports({
                name:userDetails?.Name ? userDetails?.Name : "",
                gender : userDetails?.Gender ? userDetails?.Gender : "",
                age : userDetails?.Age ? userDetails?.Age : "",
                race : userDetails?.Race ? userDetails?.Race : "",
                height : userDetails?.Height ? userDetails?.Height : "",
                weight : userDetails?.Weight ? userDetails?.Weight : "",
                userId:req.user.id,
                filename:excelFileName
            });
    
            // Save the document to the database
            await newSampleReport.save();
            const updateFile = await HistoryDetails.create({
                fileName: excelFileName,
                aiResponse: filteredResponse,
                aiBiomarkerResponse: parsedAiBiomarkerRelation,
                summary: parsedSummary?.summary ?? "",
                demoGraphicQuestions: [
                    {
                        message: "Hi there! Please ask your query, and I'll assist you right away.",
                        from: "bot",
                        date: new Date(),
                    },
                ],
                userId: req?.user?.id,
                userDetails: userDetails

            }).catch((err) => {
                console.error('Error saving to database:', err);
            });

            return res.status(200).json({ status: true, id: updateFile?.id, updateFile })
        }
        return res.status(200).json({ status: false, message: "Unable to parse json data" })


    } catch (error) {
        console.error("error while retrieveing excel file", error)
        return res.status(200).json({ status: false, message: "Something went wrong ! Please try again" })

    }
}

async function retrieveExcelData(req, res) {
    try {
        const { filename } = req.body;
        console.log("retrieveExcelData>>>>>>>>>>>>>>>>>>>> filename", filename);
        const folderPath = path.join(__dirname, '../../public/uploads')
        // Construct the full file path
        const filePath = path.join(folderPath, filename);
        // Check if the file exists and read the file contents
        try {
            const { userDetails, biomarkers } = convertExcelToJson(filePath)
            const excelJsonData = biomarkers
            res.status(200).send({ status: true, excelJsonData, userDetails });
        } catch (err) {
            console.error("File not found or could not be read:", err);
            res.status(404).send({ status: false, message: "File not found" });
        }
    } catch (error) {
        console.error("retrieveExcelData>>>>>>>>>>>>>>>>>>>>", error);
        res.status(500).send({ status: false, message: "Server error" });
    }
}

async function createSampleReports(req, res) {
    try {
        const { name, gender, age, race, height, weight, filename } = req.body;

        // Validate required fields
        if (!name || !gender || !age || !height || !weight || !filename) {
            return res.status(400).json({ status: false, message: "All required fields must be provided." });
        }
        // Create a new SampleReports document
        const newSampleReport = new SampleReports({
            name,
            gender,
            age,
            race,
            height,
            weight,
            userId: req.user.id,
            filename
        });

        // Save the document to the database
        await newSampleReport.save();
        console.log("newSampleReport>>>>>>>>>>>", newSampleReport)
        return res.status(201).json({ status: true, message: "Sample report created successfully.", data: newSampleReport });
    } catch (error) {
        console.error("Error during creating sample report", error);
        return res.status(500).json({ status: false, message: "An error occurred while creating the sample report." });
    }
}

async function fetchAllSampleReports(req, res) {
    try {
        // Fetch all sample reports from the database
        const sampleReports = await SampleReports.find();

        // Check if sample reports exist
        if (!sampleReports.length) {
            return res.status(404).json({ status: false, message: "No sample reports found." });
        }
        // Return the fetched reports
        return res.status(200).json({ status: true, message: "Sample reports fetched successfully.", data: sampleReports });
    } catch (error) {
        console.error("Error during fetching sample reports", error);
        return res.status(500).json({ status: false, message: "An error occurred while fetching the sample reports." });
    }
}



module.exports = { retrieveExcelFile, fetchAllUploadedFiles, updateChatMessage, fetchFileById, analyzeReports, retrieveExcelData, createSampleReports, fetchAllSampleReports };