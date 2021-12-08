import multer from 'multer';

const storage = multer.memoryStorage();

// only certain data types are allowed
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('wrong format'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


