/**
 * jQuery Form Submit Plugin v1.2
 *
 * http://www.robert-herring.com/
 *
 * Copyright (c) 2015 Robert Herring
 * Released under the MIT license
 *
 */

(function ($) {

    $.fn.extend({

        //pass the options variable to the function
        submitForm: function( options ) {

            // check the form is not currently submitting
            if ($(this).data('formstatus') !== 'submitting') {
                /*
                console.log($(this).attr('id'));
                $('#' + $(this).attr('id') + ' :input').each(function () {
                    console.log($(this).val());
                    $(this).val().replace(/\r\n|\r|\n/g,"<br />");
                });
                */

                // setup variables
                var form = $(this),
                    formData = form.serialize(),
                    formID = form.attr('id'),
                    formUrl = form.attr('action'),
                    formMethod = form.attr('method'),
                    formInputs = $('#' + formID + ' :input'),
                    defaults = {
                        responseMsg     : $('#contact-response-' + formID),     // Response Message ID
                        waitTime        : 3000,                                 // Set timeout to hide response message
                        fadeMsg         : 200,                                  // Time it takes to fade response message
                        redirect        : '',                                   // Redirect to page on success
                        disableFields   : true,                                 // Disable all form fields upon successful submission
                        reEnableFields  : true                                  // Re-Enable all form fields after completion
                    };

                var o = $.extend(defaults, options), origResponse = o.responseMsg.text();

                // add status data to form
                form.data('formstatus', 'submitting');

                // show response message - waiting
                o.responseMsg.hide()
                    .addClass('response-waiting')
                    .text('Please Wait...')
                    .fadeIn(o.fadeMsg);

                // formData.replace( /%0D%0A/g, '%D0%DA' );
                function keepCR (str) {
                    return str.replace( /%0D%0A/g, '<br/>' );
                }
                // console.log(keepCR(formData));

                // send data to server for validation
                $.ajax({
                    url    : formUrl,
                    type   : formMethod,
                    data   : keepCR(formData),
                    success: function (data) {

                        // setup variables
                        var responseData = jQuery.parseJSON(data),
                            klass = '',
                            redirect = responseData.returnTo;

                        if (o.redirect != '') {
                            redirect = o.redirect;
                        }
                        console.log(responseData.status);
                        console.log(redirect);
                        console.log(responseData.humantest);
                        // response conditional
                        switch (responseData.status) {
                            case 'error':
                                klass = 'response-error';
                                break;
                            case 'success':
                                klass = 'response-success';
                                break;
                        }

                        // show reponse message
                        o.responseMsg.fadeOut(o.fadeMsg, function () {
                            $(this).removeClass('response-waiting')
                                .addClass(klass)
                                .text(responseData.message)
                                .fadeIn(o.fadeMsg, function () {

                                    // clear all fields upon successful submission
                                    if (klass == 'response-success') {
                                        formInputs.not(':button, :submit, :reset, :hidden, :checkbox').val("");
                                        formInputs.prop('disabled', o.disableFields);
                                    }

                                    // set timeout to hide response message
                                    setTimeout(function () {
                                        o.responseMsg.fadeOut(o.fadeMsg, function () {
                                            $(this).removeClass(klass)
                                                .text(origResponse)
                                                .fadeIn(o.fadeMsg);
                                            form.data('formstatus', 'idle');

                                            if (klass == 'response-success') {
                                                Cookies.remove('doubleCookie');

                                                $('#' + formID).validate().resetForm();

                                                if (o.reEnableFields == true) {
                                                    formInputs.prop('disabled', false);
                                                } else {
                                                    formInputs.prop('disabled', true);
                                                }
                                                if (responseData.humantest == "failed") {
                                                    location.reload();
                                                } else if (redirect != null && redirect != "") {
                                                    window.location.href = redirect;
                                                }

                                                $('a.close-reveal-modal').trigger('click');
                                            }
                                        });
                                    }, o.waitTime); // Time in milliseconds
                                });
                        });
                    }
                });
            }
            return false;   // prevent form from submitting
        }
    });

}(jQuery));