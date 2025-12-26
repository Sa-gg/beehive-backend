export class UploadController {
    service;
    constructor(service) {
        this.service = service;
    }
    // POST /api/upload/image
    uploadImageFile = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded',
                    message: 'Please select an image file to upload'
                });
            }
            const uploadedFile = {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            };
            const result = await this.service.uploadImageFile(uploadedFile);
            res.status(201).json({
                success: true,
                data: result,
                message: 'Image uploaded successfully'
            });
        }
        catch (error) {
            console.error('Error uploading image file:', error);
            res.status(400).json({
                success: false,
                error: 'Failed to upload image',
                message: error.message
            });
        }
    };
    // POST /api/upload/image-url
    downloadImageFromUrl = async (req, res) => {
        try {
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'Image URL is required',
                    message: 'Please provide a valid image URL'
                });
            }
            const result = await this.service.downloadImageFromUrl(url);
            res.status(201).json({
                success: true,
                data: result,
                message: 'Image downloaded successfully'
            });
        }
        catch (error) {
            console.error('Error downloading image from URL:', error);
            res.status(400).json({
                success: false,
                error: 'Failed to download image',
                message: error.message
            });
        }
    };
    // DELETE /api/upload/image/:filename
    deleteImage = async (req, res) => {
        try {
            const { filename } = req.params;
            await this.service.deleteImage(filename);
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting image:', error);
            if (error.message === 'File not found') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(400).json({
                success: false,
                error: 'Failed to delete image',
                message: error.message
            });
        }
    };
    // GET /api/upload/image/:filename/info
    getImageInfo = async (req, res) => {
        try {
            const { filename } = req.params;
            const info = this.service.getImageInfo(filename);
            res.status(200).json({
                success: true,
                data: info
            });
        }
        catch (error) {
            console.error('Error getting image info:', error);
            if (error.message === 'File not found') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(400).json({
                success: false,
                error: 'Failed to get image info',
                message: error.message
            });
        }
    };
}
