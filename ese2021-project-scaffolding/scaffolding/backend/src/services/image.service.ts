import { upload } from '../middlewares/fileFilter';
import { Image, ImageAttributes } from '../models/image.model';
import {MulterRequest} from '../models/multerRequest.model';

export class ImageService {
// get specific image
    public getSpecificImage(id: number): Promise<Blob> {
        return Image.findByPk(id)
            .then(image => {
                if (image) {
                    return Promise.resolve(image.file);
                } else {
                    return Promise.reject('image not found!');
                }
        }).catch(() => Promise.reject('could not fetch the image!'));
    }

    // upload image and add to a post
    public postImage(req: MulterRequest, target: String): Promise<ImageAttributes> {
        return new Promise<ImageAttributes>((resolve, reject) => {
        upload.any()(req, null, (error: any) => {
            let i = 0;
            while (i < req.files.length) {
                if (target === 'post') {
                    Image.create({file: req.files[i].buffer, postId: +req.params.id, productId: 0}).then(created => {
                        Promise.resolve(created);
                        }).catch(err => Promise.reject(err));
                        i = i + 1;
                } else {
                    Image.create({file: req.files[i].buffer, postId: 0, productId: +req.params.id}).then(created => {
                        Promise.resolve(created);
                        }).catch(err => Promise.reject(err));
                        i = i + 1;
                    }
                }
            });

        });
    }

    // get Image Ids to a post (target is either post or product)
    public getImageIds(target: String, id: number): Promise<String> {

        if (target === 'post') {
            return Image.findAll({where: {postId: id}}).then(found => {
                if (found != null) {
                    let imgIds = '';
                    found.forEach(element => {
                       imgIds = imgIds + String(element.imageId) + ',';
                    });
                    imgIds = imgIds.substring(0, imgIds.length - 1);
                    return Promise.resolve(imgIds);
                } else {
                    return Promise.reject('no image ids found');
                }
            }).catch(() => Promise.reject('could not fetch the imageids!'));
        } else {
            return Image.findAll({where: {productId: id}}).then(found => {
                if (found != null) {
                    let imgIds = '';
                    found.forEach(element => {
                       imgIds = imgIds + String(element.imageId) + ',';
                    });
                    imgIds = imgIds.substring(0, imgIds.length - 1);
                    return Promise.resolve(imgIds);
                } else {
                    return Promise.reject('no image ids found');
                }
            }).catch(() => Promise.reject('could not fetch the imageids!'));
        }
    }

    public deleteSingleImage(id: number): Promise<Image> {
        return Image.findByPk(id).then(found => {
            if (found != null) {
                found.destroy();
                return Promise.resolve(found);
            } else {
                return Promise.reject('no image found that matches id');
            }
        }).catch(() => Promise.reject('could not destroy the image!'));
    }
}
