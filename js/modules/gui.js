import { sleep, createDiv, range, randint } from './utils.js'


export class GUI {
    /*
    Class to display graphic contents
     */

    /* =================== class members ================== */
    static steps = ['introduction', 'training', 'experiment1', 'end']; //, 'questionnaire'];



    /* =================== public methods ================== */

    // panel question off screen in a given direction
    static movePanel(first = `up`, second = `down`, duration = 500) {
        return new Promise((resolve, reject) => {
            // Assigning correct class
            first = `move-container-` + first
            second = `move-container-` + second
            let parent = document.getElementById(`panel`);
            parent.classList.add(first, `fadeout`, `fast-transition`);
            setTimeout(() => {
                parent.classList.remove(first, `fast-transition`)
                parent.classList.add(`no-transition`, second)
                resolve()
            }, duration)
        })

    }

    // Re-centers panel on page
    static centerPanel(duration=500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let parent = document.getElementById(`panel`);
                parent.classList.remove(`no-transition`, `fadeout`);
                parent.classList.add(`fast-transition`, `fadein`)
                parent.style.top = `0`
                parent.classList.remove(`move-container-down`, `move-container-up`)
                setTimeout(() => {
                    parent.classList.remove(`fadein`)
                    resolve()
                }, duration)
            }, 50)
        })
    }

    static setOutcomes(thisReward, otherReward) {
        $('#out').val(thisReward);
        $('#cfout').val(otherReward);
    }

    static initGameStageDiv() {
        GUI.panelFlush();
        GUI.panelHide();
        if ($('#stim-box').length === 0) {
            createDiv('game', 'stim-box');
        }
        $('#game').fadeIn(400);
        $('#stim-box').fadeIn(400);
    }

    static hideElement(id) {
        $('#' + id).hide();
    }

    static showElement(id) {
        $('#' + id).show();
    }

    static setActiveCurrentStep(id) {
        for (let step of this.steps) {
            if (step === id) {
                if (!$('#' + step).attr('class').includes('active')) {
                    $('#' + step).attr('class', 'md-step active');
                }
            } else {
                $('#' + step).attr('class', 'md-step');
            }
        }
    }

    static panelSetParagraph(text) {
        $('.card-text').remove();
        $('#card-content').prepend('<div class="card-text">' + text + '</div>');

    }

    static panelSetDotParagraph(text) {
        $('.card-text').remove();
        $('#card-content').prepend('<div class="card-text">' + '• ' + text + '</div>');
        //this.setCardTransition();

    }

    static panelInsertParagraph(text) {
        $('#card-content').append('<div class="card-text">' + text + '</div>');
        //this.setCardTransition();
    }

    static panelInsertDotParagraph(text) {
        $('#card-content').append('<div class="card-text">' + '• ' + text + '</div>');
        //this.setCardTransition();
    }

    static panelInsertParagraphTitle(title) {
        $('#card-content').append('<div class="card-title">' + title + '</div>');
    }

    static panelInsertImage({ src = '', width = '100%', height = '100%' } = {}) {
        $('#card-content').append(
            '<img class="card-img card-center" src="' + src + '" style="width: ' + width + '; height: ' + height + ' ;" >');
    }

    static panelGenerateImg({ src = '', width = '100%' } = {}) {
        return '<img class="card-img card-center" src="' + src + '" style="width: ' + width + ';" >';
    }

    static panelSetTitle(title) {
        $('#panel-title').text(title);
    }

    static panelFlush() {
        $('#card-content').empty();
    }

    static panelInsertDiv({ id = "", align = "center" }) {
        $('#card-content').append('<div id="' + id + '" align="' + align + '"></div>');
    }

    static panelInsertButton({
        classname = "btn btn-default card-button card-center",
        clickArgs = undefined,
        clickFunc = undefined,
        id = "",
        div = "card-content",
        value = ""
    } = {}) {
        $('#' + div).append(
            '<input type="button" class="' + classname + '" id="' + id + '" value="' + value + '">');

        $('#' + id).click(clickArgs, clickFunc);
    }

    static panelInsertInput({
        classname = 'card-center',
        maxlength = "24",
        size = "24",
        value = "",
        id = "textbox_id",
        div = "card-content",
    } = {}) {
        $('#' + div).append(
            '<input class="' + classname + '" type="text" maxlength="' + maxlength +
            '" size="' + size + '" id="' + id + '" value="' + value
            + '">');
    }

    static panelInsertCheckBox({
        classname = "",
        id = "",
        value = "",
        div = "card-content",
        text = "no text",
        clickFunc = undefined,
        clickArgs = undefined
    } = {}) {
        $('#' + div).append('<label id="label_' + id + '" class="checkcontainer">' + text);

        let label = $('#label_' + id);
        label.append(
            '<input type="checkbox" class="' + classname + '" id="' + id + '" value="' + value + '">');
        label.append('<span class="checkmark"></span>');
        label.append('</label>');
        $('#' + id).click(clickArgs, clickFunc);

    }

    static panelShow() {
        $('#game').hide();
        $('#panel').fadeIn(500);
    }

    static panelHide() {
        $('#panel').fadeOut(200);
    }

    static hideOptions() {
        $('#stimrow').fadeOut(500);
        $('#fbrow').fadeOut(500);
        $('#cvrow').fadeOut(500);
        //$('#game').fadeOut(500);
    }

    static showOptions() {
        $('#stimrow').fadeIn(500);
        $('#fbrow').fadeIn(500);
        $('#cvrow').fadeIn(500);
        //$('#game').fadeOut(500);
    }

    static displayOptions(id1, id2, img, feedbackImg, invertedPosition) {
        let [option1, option2, feedback1, feedback2] = GUI._getOptions(id1, id2, img, feedbackImg);
        GUI._displayTwoOptions(option1, option2, feedback1, feedback2, invertedPosition);
    }


    static displayOptionSlider(id, imgObj, initValue, min, max, step, percent, question) {

        GUI.showElement('stim-box');
        let option = imgObj[id];
        option.id = "option1";
        option = option.outerHTML;

        let canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        // let canvas2 = '<canvas id="canvas2" height="620"' +
        //     ' width="620" class="img-responsive center-block"' +
        //     ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        let myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + '</div><div class="col-xs-1 col-md-1"></div></div>';

        let Title = '<h3 align = "center" style="margin-bottom: 2%;">' + question + '</h3>';
        let Images = '<div id = "stimrow" style="transform: translate(0%, -100%);position:relative;"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + '</div><div id = "Middle" class="col-xs-4 col-md-4">' + option + '</div></div>';

        let Slider = GUI.generateSlider({ min: min, max: max, step: step, initValue: initValue, percent: percent });

        let str = Title + Images + myCanvas + Slider;
        $('#stim-box').html(str);

        return document.getElementById('slider_1');

    }

    static showFeedback({ showFeedback, completeFeedback, feedbackDuration, beforeFeedbackDuration,
        choice, thisReward, reward1, reward2, feedbackObj }) {
        let pic1 = document.getElementById("option1");
        let pic2 = document.getElementById("option2");

        let cv1 = document.getElementById("canvas1");
        let cv2 = document.getElementById("canvas2");

        let fb1 = document.getElementById("feedback1");
        let fb2 = document.getElementById("feedback2");

        let pic = [pic2, pic1][+(choice === 1)];
        let cv = [cv2, cv1][+(choice === 1)];
        let fb = [fb2, fb1][+(choice === 1)];

        if (completeFeedback) {
            if (showFeedback) {
                // debugger
                fb1.src = feedbackObj[reward1 + ''].src;
                fb2.src = feedbackObj[reward2 + ''].src;
            }

            // setTimeout(function () {
            GUI.slideCard(pic1, cv1, showFeedback, feedbackDuration, beforeFeedbackDuration);
            GUI.slideCard(pic2, cv2, showFeedback, feedbackDuration, beforeFeedbackDuration);
            // }, 100);

        } else {
            if (showFeedback) {
                fb.src = feedbackObj['' + thisReward].src;
            }
            // setTimeout(function () {
            GUI.slideCard(pic, cv, showFeedback, feedbackDuration, beforeFeedbackDuration);
            // }, 100);
        }
    }

    static slideCard(pic, cv, showFeedback, feedbackDuration, beforeFeedbackDuration) {

        let img = new Image();
        let canvas;
        img.src = pic.src;
        img.width = pic.width;
        img.height = pic.height;


        let speed = 5;
        let y = 0;

        let dy = 10;
        let x = 0;
        let ctx;

        img.onload = function () {

            canvas = cv;
            ctx = cv.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            let scroll = setInterval(draw, speed);

            if (showFeedback) {
                setTimeout(function () {
                    pic.style.visibility = "hidden";
                    clearInterval(scroll);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }, beforeFeedbackDuration);
            } else {
                setTimeout(function () {
                    clearInterval(scroll);
                }, feedbackDuration);
            }

        };

        function draw() {

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            y = (-img.height + y) * (y > img.height) + y * (y < img.height);

            if (y > 0) {
                ctx.drawImage(img, x, -img.height + y, img.width, img.height);
            }

            ctx.drawImage(img, x, y, img.width, img.height);

            y += dy;

        }
    }

    static displayModalWindow(title, message, type) {
        /*
        Method used to display error messages, warning, infos...
         */

        let sym;
        let color;
        if (type === 'info') {
            sym = 'fa-info-circle';
            color = 'green';
        } else if (type === 'error') {
            sym = 'fa-window-close';
            color = 'red';
        } else {
            sym = 'fa-check';
            color = 'gray';
        }

        let str = `
            <div class="modal fade" id="myModal" role="dialog">
                <div class="modal-dialog modal-sm">
                  <div class="modal-content">
                    <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal">&times;</button>
                      <center><span style="font-size: 30px" class="fa ${sym}"></span><h2>  ${title}</h2></center>
                    </div>
                    <div class="modal-body" >
                    ${message}
                    </div>
                  </div>
                </div>
            </div>`;

        let modalWin = $('#modal');
        let myModal = $('#myModal');

        if (!modalWin.html().includes('myModal')) {
            modalWin.html(str);
            modalWin.show();
            myModal = $('#myModal');
        }
        myModal.modal();
        myModal.on('hidden.bs.modal', function () {
            modalWin.empty();
            modalWin.hide();
        });

    }

    static displayChoiceModalWindow(title, message, button1Text, button2Text, func1, func2) {
        /*
        Method used to display modal choices window
         */

        let str = `
            <div class="modal fade" id="myModal" role="dialog">
                <div class="modal-dialog modal-sm">
                  <div class="modal-content">
                    <div class="modal-header">
                      <center><h2> ${title}</h2></center>
                    </div>
                    <div class="modal-body" >
                   <center> ${message}</center>
                    </div>
                    <div align="center">
                      <button type="button" id="refuse" data-dismiss="modal" class="btn btn-default card-button" style="
                        background-color: rgba(200, 81, 81, 0.86) !important;
                        border-color: rgba(200, 81, 81, 0.4) !important;"
                        >${button2Text}</button>
                      <button type="button" id="accept" data-dismiss="modal" 
                      class="btn btn-default card-button">${button1Text}</button>
                      </div>
                  </div>
                </div>
            </div>`;

        let modalWin = $('#modal');
        let myModal = $('#myModal');

        if (!modalWin.html().includes('myModal')) {
            modalWin.html(str);
            modalWin.show();
            myModal = $('#myModal');
            $('#accept').click(func1);
            $('#refuse').click(func2);
        }
        myModal.modal({ backdrop: 'static', keyboard: false });
        myModal.on('hidden.bs.modal', function () {
            modalWin.empty();
            modalWin.hide();
        });

    }

    static generateSlider({ min = 0, max = 100, step = 5, initValue = 0, percent = true, n = 1, classname = '' } = {}) {
        let slider = `<main>
            <form id="form_${n}" class="${classname}">
            <div class="range">
            <input id="slider_${n}" name="range" type="range" value="${initValue}" min="${min}" max="${max}" step="${step}">
            <div class="range-output">
            <output id="output_${n}" class="output" name="output" for="range">
            ${initValue + ['', '%'][+(percent)]}
             </output>
             </div>
             </div>
            </form>
            </main>
            <div align="center"><button id="ok_${n}" data-dismiss="modal" class="btn btn-default card-button">Submit</button>
            </div>`;

        return slider;

    }

    static listenOnSlider(clickArgs, clickFunc, percent = true, n = 1) {

        rangeInputRun();

        let slider = document.getElementById('slider_' + n);
        let output = document.getElementById('output_' + n);
        let form = document.getElementById('form_' + n);
        let ok = $('#ok_' + n);

        form.oninput = function () {
            output.value = slider.valueAsNumber;
            output.innerHTML += ['', "%"][+(percent)];
        };

        ok.click(clickArgs, clickFunc);

    }

    static insertSkipButton(Obj) {
        if ($('#skipButton').length) {
            $('#skipButton').remove();
        }
        let button = '<input type="button" class="btn btn-default card-button" id="skipButton" value="Skip trials" >';
        let timeline = $('#timeline');

        timeline.append(button);

        $('#skipButton').click(function () {
            if (Obj.skipEnabled) {
                GUI.displayModalWindow('Select the trial you want to reach.',
                    GUI.generateSlider({
                        classname: 'skip-form',
                        min: 0, max: Obj.nTrial, initValue: Obj.trialNum, step: 1, percent: false, n: 2
                    })
                    , 'info');

                GUI.listenOnSlider({ obj: Obj }, function (ev) {

                    let slider = document.getElementById('slider_2');
                    // ev.data.obj.skip = true;
                    ev.data.obj.next(
                        slider.valueAsNumber);
                }, false, 2);
            }
        });
    }

    static hideSkipButton() {
        $('#skipButton').hide(800);
        setTimeout(function () {
            $('#skipButton').remove();
        }, 800);
    }

    /* =================== private methods ================== */

    static _getOptions(id1, id2, img, feedbackImg) {

        let option1 = img[id1];

        option1.id = "option1";
        option1 = option1.outerHTML;


        let option2 = img[id2];
        option2.id = "option2";
        option2 = option2.outerHTML;

        let feedback1 = feedbackImg["empty"];
        feedback1.id = "feedback1";
        feedback1 = feedback1.outerHTML;

        let feedback2 = feedbackImg["empty"];
        feedback2.id = "feedback2";
        feedback2 = feedback2.outerHTML;



        return [option1, option2, feedback1, feedback2]
    }

    static _displayTwoOptions(option1, option2, feedback1, feedback2, invertedPosition) {


        let canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block clickable rounded"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        let canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block clickable rounded"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        let options = [[option1, option2], [option2, option1]][+(invertedPosition)];
        let feedbacks = [[feedback1, feedback2], [feedback2, feedback1]][+(invertedPosition)];
        let canvas = [[canvas1, canvas2], [canvas2, canvas1]][+(invertedPosition)];

        /* Create canevas for the slot machine effect, of the size of the images */
        let Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + options[0] + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + options[1] + '</div><div class="col-xs-1 col-md-1"></div></div>';

        let Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedbacks[0] + '' +
            '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + feedbacks[1] + '</div><div class="col-xs-1 col-md-1"></div></div>';

        let myCanvas = '<div id = "cvrow" class ="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas[0] + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas[1] + '</div><div class="col-xs-1 col-md-1"></div></div>';

        $('#stim-box').html(Feedback + Images + myCanvas);
    }



}

