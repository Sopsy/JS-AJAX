export default class Ajax
{
    #options;
    #xhrObjects = {};

    constructor(options = {})
    {
        this.#options = Object.assign({}, {
            data: null,
            timeout: 60_000,
            cache: false,
            xhr: null,
            eventId: 'ajax',
            successEventId: 'ajax',
            headers: {}
        }, options);
    }

    async get(url, options = {}, xhrId = null)
    {
        return this.#run('GET', url, {}, options, xhrId);
    }

    async post(url, postData = {}, options = {}, xhrId = null)
    {
        return this.#run('POST', url, postData, options, xhrId);
    }

    xhrObject(id)
    {
        return this.#xhrObjects[id] ?? {};
    }

    async #run(method, url, postData, options, xhrId = null)
    {
        options = Object.assign({}, this.#options, options);

        if (!options.cache) {
            options.headers = Object.assign({}, {
                'Cache-Control': 'no-cache, max-age=0',
            }, options.headers);
        }

        let xhr = new XMLHttpRequest();
        xhr.timeout = options.timeout;
        xhr.open(method, url);
        if (xhrId !== null) {
            this.#xhrObjects[xhrId] = xhr;
        }

        for (let key in options.headers) {
            if (!options.headers.hasOwnProperty(key)) {
                continue;
            }

            xhr.setRequestHeader(key, options.headers[key]);
        }

        // Customizable XHR-object
        if (typeof options.xhr === 'function') {
            xhr = options.xhr(xhr);
        }

        if (postData) {
            if (!(postData instanceof FormData)) {
                // Not FormData... Maybe a regular object? Convert to FormData.
                let formData = new FormData();
                Object.keys(postData).forEach(key => formData.append(key, postData[key]));
                postData = formData;
            }
        }

        if (xhr.upload) {
            // Why? I don't know, does not work without this. Maybe a race?
            xhr.upload.addEventListener('progress', () => {
            });
        }

        return new Promise((resolve, reject) => {
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status <= 299) {
                    document.dispatchEvent(new CustomEvent(options.successEventId + '-success', {
                        detail: xhr
                    }));
                    this.#deleteXhrObject(xhrId);
                    resolve(xhr);
                } else {
                    document.dispatchEvent(new CustomEvent(options.eventId + '-fail', {
                        detail: {reason: 'status', xhr: xhr}
                    }));
                    this.#deleteXhrObject(xhrId);
                    reject(xhr);
                }
            });

            xhr.addEventListener('abort', () => {
                document.dispatchEvent(new CustomEvent(options.eventId + '-fail', {
                    detail: {reason: 'abort', xhr: xhr}
                }));
                this.#deleteXhrObject(xhrId);
                reject(xhr);
            });

            xhr.addEventListener('error', () => {
                document.dispatchEvent(new CustomEvent(options.eventId + '-fail', {
                    detail: {reason: 'error', xhr: xhr}
                }));
                this.#deleteXhrObject(xhrId);
                reject(xhr);
            });

            xhr.addEventListener('timeout', () => {
                document.dispatchEvent(new CustomEvent(options.eventId + '-fail', {
                    detail: {reason: 'timeout', xhr: xhr}
                }));
                this.#deleteXhrObject(xhrId);
                reject(xhr);
            });

            xhr.send(postData);
        });
    }

    #deleteXhrObject(xhrId) {
        if (xhrId === null) {
            return;
        }

        delete this.#xhrObjects[xhrId];
    }
}

Object.freeze(Ajax.prototype);