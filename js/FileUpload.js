export default class FileUpload
{
    #elm;
    #ajax;
    #uploadXhr = null;
    #id = null;
    #uploadProgress = null;
    #thumbnail = null;

    constructor(ajax, elm)
    {
        this.#ajax = ajax;
        this.#elm = elm;
    }

    id()
    {
        return this.#id;
    }

    thumbnail()
    {
        return this.#thumbnail;
    }

    async #cancel() {
        if (!this.#uploadXhr && confirm('Are you sure you want to cancel the ongoing file upload?')) {
            return;
        }

        await this.delete();
    }

    async upload(file, url)
    {
        await this.delete();

        let formData;
        if (!(file instanceof FormData)) {
            formData = new FormData();
            formData.append('files', file);
        } else {
            formData = file;
        }

        return new Promise(async (resolve, reject) => {
            let xhr;
            try {
                xhr = this.#ajax.post(url, formData, {timeout: 0}, 'fileUpload');
                this.#uploadXhr = this.#ajax.xhrObject('fileUpload');
                this.#elm.addEventListener('cancel-file-upload', this.#cancel);
                this.#uploadProgress = 0;

                this.#uploadXhr.upload.addEventListener('progress', (e) => {
                    if (!e.lengthComputable) {
                        return;
                    }

                    this.#uploadProgress = Math.round(Math.min(Math.max(0, e.loaded / e.total), 1) * 100);

                    this.#elm.dispatchEvent(new CustomEvent('upload-progress', {
                        detail: { percentage: this.#uploadProgress }
                    }));
                });
                xhr = await xhr;
            } catch (xhr) {
                if (xhr.status !== 0) {
                    await this.delete();
                }

                return reject(xhr);

            } finally {
                this.#uploadProgress = null;
                this.#uploadXhr = null;
                this.#elm.removeEventListener('cancel-file-upload', this.#cancel)
            }

            let response = JSON.parse(xhr.response);
            this.#id = response.id;

            resolve(response);
        });
    }

    async delete(url = null)
    {
        if (this.#uploadXhr !== null) {
            this.#uploadXhr.abort();
        }

        if (this.#id !== null && url !== null) {
            await this.#ajax.post(url, {
                'file_id': this.#id
            });

            this.#id = null;
        }
    }

    async extractThumbnail(file)
    {
        // Only extract thumbnail from images, in the future use WebCodecs API for videos
        if (!file.type.startsWith('image/')) {
            return null;
        }

        this.#thumbnail = await createImageBitmap(file);
        return this.#thumbnail;
    }
}

Object.freeze(FileUpload.prototype);