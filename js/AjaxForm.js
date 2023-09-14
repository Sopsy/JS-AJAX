export default class AjaxForm
{
    #ajax;
    #defaultEventId = 'ajax';
    #ajaxOptions;

    constructor(ajax)
    {
        this.#ajax = ajax

        document.addEventListener('submit', async (e) => {
            if (e.target.method === 'dialog' || !e.target.classList.contains('ajax-form')) {
                return;
            }

            e.preventDefault();
            let form = e.target;

            this.#ajaxOptions = {
                timeout: parseInt(form.dataset.timeout ?? 10000),
                eventId: form.dataset.eventId ?? 'ajax',
                successEventId: form.dataset.successEventId ?? 'ajax',
            };

            if (typeof form.dataset.confirm !== 'undefined') {
                if (!confirm(form.dataset.confirm)) {
                    return;
                }
            }

            if ((form.dataset.eventId ?? this.#defaultEventId) === this.#defaultEventId) {
                form.addEventListener(this.#defaultEventId + '-form-submit-success', e => {
                    if (typeof form.dataset.reload !== 'undefined') {
                        location.reload();
                        return;
                    }

                    if (typeof form.dataset.quiet === 'undefined' && e.detail.status !== 204) {
                        form.dispatchEvent(new CustomEvent('form-success-notification', {
                            bubbles: true,
                            detail: e.detail.response
                        }));
                    }
                }, {once: true});
            }

            this.#submit(e, form);
        });

        for (const form of document.querySelectorAll('form[data-auto-submit]')) {
            this.#enableAutoSubmit(form);
        }
    }

    #enableAutoSubmit(form)
    {
        form.addEventListener('change', (e) => {
            if (typeof e.target.dataset.ignore !== 'undefined') {
                return;
            }

            if (typeof e.target.dataset.onchangeReload !== 'undefined') {
                form.addEventListener(form.dataset.eventId ?? 'ajax' + '-form-submit-success', () => {
                    location.reload();
                }, {once: true});
            }

            form.dispatchEvent(new SubmitEvent('submit', {bubbles: true, cancelable: true}));
        });
    }

    #submit(e, form)
    {
        let loadingElm = document.createElement('div');
        loadingElm.classList.add('ajax-loading');
        form.append(loadingElm);

        let formData = new FormData(form);

        // Append button used to submit the form
        if (e.submitter && e.submitter.name && e.submitter.value) {
            formData.append(e.submitter.name, e.submitter.value);
        }

        let eventId = form.dataset.eventId ?? this.#defaultEventId;
        let successEventId = form.dataset.successEventId ?? eventId;

        this.#ajax.post(form.action, formData, this.#ajaxOptions).then(xhr => {
            form.dispatchEvent(new CustomEvent(successEventId + '-form-submit-success', {bubbles: true, detail: xhr}));
            if (typeof form.dataset.resetAfterSuccess !== 'undefined') {
                form.reset();
            }
        }).catch(xhr => {
            form.dispatchEvent(new CustomEvent(eventId + '-form-submit-fail', {bubbles: true, detail: xhr}));
        }).finally(xhr => {
            form.dispatchEvent(new CustomEvent(eventId + '-form-submit-finally', {bubbles: true, detail: xhr}));
            loadingElm.remove();
        });
    }
}

Object.freeze(AjaxForm.prototype);