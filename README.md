# Ajax
Ajax requests and forms.

## Usage
```
const ajax = new Ajax({
    data: null,
    timeout: 60_000,
    cache: false,
    xhr: null,
    eventId: 'ajax',
    successEventId: 'ajax',
    headers: {'x-csrf-token': '1234'}
});

// POST request with data
const postXhr = await ajax.post('/url', {data: {'foo': 'bar'});
console.log(postXhr.response);

// GET request with options
const getXhr = await ajax.get('/url', {timeout: 1_000});
console.log(getXhr.response);

// Form with AJAX
/*
HTML:
<form class="ajax-form" method="post" action="/target">
    <input type="text" name="foo" />
    <button type="submit">Submit</button>
</form>
*/

// This binds automatically to all ajax-forms as it catches the `submit` event on `document`.
new AjaxForm(ajax);
```

### Ajax config options
Options can be overridden for each request. Constructor sets the defaults.

Fires `<successEventId>-success` on success and `<eventId>-fail` event on failure.  

`data`: POST data for the request, might be a wise idea to do this per-request basis and not to everything  
`timeout`: request timeout in milliseconds, `0` to disable  
`cache`: allow browser caching of responses  
`xhr`: allows for a custom XHR object for the requests  
`eventId`: JS event prefix for failed requests  
`successEventId`: JS event prefix for succeeded requests  
`headers`: request headers

### AjaxForm config options
AjaxForm fires `<successEventId>-form-submit-success`, `<eventId>-form-submit-fail`, `<eventId>-form-submit-finally` events.

Config options can be added to the opening `form` tag.  
`data-event-id`: eventId for failed requests, and also to `finally`  
`data-success-event-id`: eventId for succeeded requests  
`data-confirm`: string, confirm form submission with `confirm()`, remove this attribute for no confirmation prompt  
`data-timeout`: timeout in milliseconds for the AJAX request  
`data-quiet`: don't dispatch the success event  
`data-reset-after-success`: `reset()` form after a successful submit
`data-reload`: reload page after a successful submit  
`data-auto-submit`: no value, submit form after a input field value changes  

The following ones are used in an input element on auto-submit forms:  
`data-ignore`: don't autosubmit when this field changes value
`data-onchange-reload`: reload page after a successful submit

## Acknowledgements
SVG loading icon with MIT license from https://github.com/SamHerbert/SVG-Loaders/

Documenting all this probably took more time than writing the code...