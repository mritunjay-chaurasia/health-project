export const convertExcelFilesToJson = async () => {
    try {
        const files = [
            { gender: "Male", age: "27", race: "black", height: "157", weight: "50", name: 'Sample_Report_1.xlsx' },
            { gender: "Female", age: "37", race: "black", height: "157", weight: "50", name: 'Sample_Report_2.xlsx' },
            { gender: "Male", age: "42", race: "black", height: "157", weight: "50", name: 'Sample_Report_3.xlsx' },
            { gender: "Female", age: "57", race: "black", height: "157", weight: "50", name: 'Sample_Report_4.xlsx' },
            { gender: "Male", age: "48", race: "black", height: "157", weight: "59", name: 'Sample_Report_5.xlsx' },
        ];

        const result = await Promise.all(
            files.map(async (file) => {
                return {
                    gender: file.gender,
                    age: file.age,
                    race: file.race,
                    height: file.height,
                    weight: file.weight,
                    filename: file.name,
                };
            })
        );

        return result;
    } catch (error) {
        console.error('Error while converting Excel files to JSON:', error);
        return [];
    }
};


export function mergeAiResponses(aiResponse, aiBiomarkerResponse) {
    try {
        // Create a map to quickly lookup aiBiomarkerResponse by name
        const biomarkerMap = new Map();
        aiBiomarkerResponse?.biomarkers?.forEach(biomarker => {
            biomarkerMap.set(biomarker?.name, biomarker);
        });

        // Merge aiResponse with aiBiomarkerResponse
        const mergedResponse = aiResponse.map(response => {
            const biomarkerDetails = biomarkerMap.get(response.name) || {};
            return {
                ...response,
                ...biomarkerDetails,
                cause_of_biomarker: biomarkerDetails.cause_of_biomarker || null,
                influenced_by: biomarkerDetails.influenced_by || [],
                summary: biomarkerDetails.summary || ''
            };
        });

        return mergedResponse;
    } catch (error) {
        return aiResponse;
    }
}