$(function () {
    const url = 'http://localhost:3000/';


    const macaddress = $('#macAddress').val();
    console.log(macAddress);
    const destination = '/makeLogin.html';
    console.log(destination);


    console.log('cargado');
    const $sendSurvey = $('#sendSurvey');


    $sendSurvey.on('click', function (event) {
        event.preventDefault();
        const json = {
            survey_id: 3,
            answers: [{
                question_id: 6,
                answer_option_id: 34,
            }],
            macaddress,
        };
        const json_send = JSON.stringify(json);
        console.log('mandar encuesta');
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: {
                string_json: json_send,
            },
            url: (url + 'survey/3/response'),
            success() {
                console.log('success');
                // window.location = destination;
            },
            error(err) {
                console.log('error');
                console.log(err);
            },
        });
    });
});