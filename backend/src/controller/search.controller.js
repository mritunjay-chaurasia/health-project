const { USER_DETAILS } = require("../constant/env.contant");
const historyDetailsModel = require("../models/historyDetails.model");

exports.searchHistory = async (req, res) => {
    try {
        const query = req?.query?.q;
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const skip = (page - 1) * limit;

        const results = await historyDetailsModel.aggregate([
            {
                $lookup: {
                    from: 'users', // The name of the User collection
                    localField: 'userId',
                    foreignField: 'id',
                    as: 'userId',
                },
            },
            {
                $unwind: '$userId',
            },
            {
                $match: {
                    $or: [
                        { fileName: new RegExp(query, 'i') },
                        { id: new RegExp(query, 'i') },
                        { rating: new RegExp(query, 'i') },
                        { feedback: new RegExp(query, 'i') },
                        { 'userId.name': new RegExp(query, 'i') },
                        { 'userDetails.Name': new RegExp(query, 'i') },
                        { 'userDetails.Age': !isNaN(query) ? parseInt(query, 10) : null },
                        { 'userDetails.Gender': new RegExp(query, 'i') },
                    ],
                },
            },
            {
                $project: {
                    fileName: 1,
                    rating: 1,
                    feedback: 1,
                    userDetails: {
                        Name: 1,
                        Age: 1,
                        Gender: 1,
                    },
                    createdAt: {
                        $dateToString: {
                            format: "%Y-%m-%dT%H:%M:%S.%L%z", // ISO 8601 format
                            date: "$createdAt",
                        },
                    },
                },
            },
            {
                $skip: skip, // Skip the number of documents for pagination
            },
            {
                $limit: limit, // Limit the number of documents returned
            },
        ]);

        // Optionally, you can get the total count of documents that match the query
        const totalResults = await historyDetailsModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'id',
                    as: 'userId',
                },
            },
            {
                $unwind: '$userId',
            },
            {
                $match: {
                    $or: [
                        { id: new RegExp(query, 'i') },
                        { fileName: new RegExp(query, 'i') },
                        { rating: new RegExp(query, 'i') },
                        { feedback: new RegExp(query, 'i') },
                        { 'userId.name': new RegExp(query, 'i') },
                        { 'userDetails.Name': new RegExp(query, 'i') },
                        { 'userDetails.Age': !isNaN(query) ? parseInt(query, 10) : null },
                        { 'userDetails.Gender': new RegExp(query, 'i') },
                    ],
                },
            },
            {
                $count: 'total',
            },
        ]);

        return res.json({
            results: results,
            totalResults: totalResults?.[0]?.total || 0,
            currentPage: page,
            totalPages: Math.ceil((totalResults?.[0]?.total || 0) / limit),
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
