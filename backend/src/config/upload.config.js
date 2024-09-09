const path = require('path');
const multer = require('multer');

// Define allowed file types
const allowedFileTypes = ['.xls', '.xlsx', '.xlsm', '.csv'];

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

// File filter to check file type
const fileFilter = (req, file, cb) => {
    const fileType = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(fileType)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Please upload an Excel or CSV file.'));
    }
};

const upload = multer({ storage, fileFilter });

module.exports = {
    uploadMiddleware: upload.single('file'),
    allowedFileTypes
};
