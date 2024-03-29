import { range, shuffle, getOS, getBrowser, createCode, getfromURL } from "./utils.js";


export class ExperimentParameters {
    /***
  
       Experiment initializer
       All the parameters for
       the experiment are defined here
       ***/

    constructor({
        online,
        isTesting,
        completeFeedback,
        maxPoints,
        expName,
        beforeFeedbackDuration,
        feedbackDuration,
        maxTrainingNum,
        compLink,
        imgPath,
        maxCompensation,
        nTrialPerCondition,
        nTrialPerConditionTraining,
        nCond,
        nSession,
        fromCookie,
        stim,
        trainingStim,
        fb,
        lotteries,
        obj
    } = {}) {
        // Initial Experiment Parameters
        // ===================================================================== //
        this.online = online;
        this.completeFeedback = completeFeedback;
        this.expName = expName;
        this.isTesting = isTesting;

        this.feedbackDuration = feedbackDuration;
        this.beforeFeedbackDuration = beforeFeedbackDuration;

        this.nSession = nSession;
        this.nCond = nCond;
        this.maxTrainingNum = maxTrainingNum;
        this.maxCompensation = maxCompensation;

        this.compLink = compLink;
        this.imgPath = imgPath;

        this.fromCookie = fromCookie;

        // initGameStageDiv
        this.fb = fb
        this.stim = stim
        this.lotteries = lotteries
        this.trainingStim = trainingStim

        this._initContingencies();
        this._loadImg(stim, trainingStim, lotteries, fb);

        if (!fromCookie) {
            this.sumReward = [0, 0, 0, 0, 0, 0, 0];
            this.totalReward = 0;

            this.initTime = new Date().getTime();
            this.expID = createCode();
            this.browsInfo = getOS() + " - " + getBrowser();
            this.subID = getfromURL('prolific_id');


            this._initConditionArrays(
                nTrialPerCondition,
                nTrialPerConditionTraining,
                nCond,
                nSession
            );
            this._initTrialObj(nSession);
        } else {
            // get previously generated trials from local storage
            this.trialObj = obj.trialObj;
            this.trialObjTraining = obj.trialObjTraining;
            this.conditions = obj.conditions;
            this.trainingConditions = obj.trainingConditions;
            this.subID = obj.subID;
            this.browsInfo = obj.browsInfo;
            this.initTime = obj.initTime;
            this.expID = obj.expID;
            this.sumReward = obj.sumReward;
            this.totalReward = obj.totalReward;
            this.trialNum = obj.trialNum;
        }

        if (maxPoints) {
            this.maxPoints = maxPoints;
        } else {
            this.maxPoints = this._computeMaxPoints();
        }

        // define compensation functions
        // ===================================================================== //
        this.conversionRate = (maxCompensation / this.maxPoints).toFixed(2);
        this.pointsToPence = (points) => points * this.conversionRate;
        this.penceToPounds = (pence) => pence / 100;
        this.pointsToPounds = (points) => this.penceToPounds(this.pointsToPence(points));

    }

    _initTrialObj(nSession) {
        let phases = [1, 2, 3];
        this.trialObj = {};
        this.trialObjTraining = {};

        for (let step of phases) {
            switch (step) {
                case 1:
                    this.trialObj[step] = this._generateLE({
                        nSession: nSession,
                        conditions: this.conditions,
                        contexts: this.contexts,
                        maxLen: 120,
                    });
                    this.trialObjTraining[step] = this._generateLE({
                        nSession: nSession,
                        conditions: this.trainingConditions,
                        contexts: this.trainingContexts,
                        maxLen: 12,
                    });

                    break;

                case 2:
                    this.trialObj[step] = this._generateED_EE({
                        nSession: nSession,
                        options: this._getOptionsPerSession(this.contexts),
                        maxLen: 160
                    });
                    this.trialObjTraining[step] = this._generateED_EE({
                        nSession: nSession,
                        options: this._getOptionsPerSession(this.trainingContexts),
                        maxLen: 12,
                    });
                    break;
                case 3:

                    this.trialObj[step] = this._generatePM({
                        nSession: nSession,
                        nRepeat: 1,
                        option1Type: 1,
                        maxLen: 30,
                        options: this._getOptionsPerSession(this.contexts),
                    });
                    let lot = this._generatePM({
                        nSession: 1,
                        nRepeat: 1,
                        option1Type: 0,
                        maxLen: 30,
                        options: [range(0, 10, 1), range(0, 10, 1)],
                    }).flat();
                    this.trialObj[step][0].push(...lot);
                    // this.trialObj[step][1].push(...lot);

                    this.trialObj[step][0] = shuffle(this.trialObj[step][0]);
                    // this.trialObj[step][1] = shuffle(this.trialObj[step][1]);

                    this.trialObjTraining[step] = this._generatePM({
                        nSession: nSession,
                        nRepeat: 1,
                        option1Type: 1,
                        maxLen: 4,
                        options: this._getOptionsPerSession(this.trainingContexts),
                    });

                    // debugger;

                    break;
            }
        }

        // this._insertCatchTrials()

    }



    _initContingencies() {
        this.cont = [];
        this.probs = [];
        this.rewards = [];
        this.ev = [];
        this.rew = undefined;

        // Define all possible probabilities and rewards
        // structure is [lose, win]
        // ===================================================================== //
        this.cont[0] = [1, 0]; // -1
        this.cont[1] = [0.9, 0.1]; // -.8
        this.cont[2] = [0.8, 0.2]; // -.6
        this.cont[3] = [0.7, 0.3]; // X
        this.cont[4] = [0.6, 0.4]; // .8 X
        this.cont[5] = [0.5, 0.5]; // .8
        this.cont[6] = [0.4, 0.6]; // .8 X
        this.cont[7] = [0.3, 0.7]; // .8 X
        this.cont[8] = [0.2, 0.8]; // .8
        this.cont[9] = [0.1, 0.9]; // .8
        this.cont[10] = [0, 1]; // .8
        this.cont[11] = [0.85, 0.15]; // -.7
        this.cont[12] = [0.75, 0.25]; // -.5
        this.cont[13] = [0.65, 0.35]; // -.3 X
        this.cont[14] = [0.55, 0.45]; // -.1
        this.cont[15] = [0.45, 0.55]; // .1
        this.cont[16] = [0.35, 0.65]; // .3 X
        this.cont[17] = [0.25, 0.75]; // .5
        this.cont[18] = [0.15, 0.85]; // .7

        // only magnitudes in the experiment
        this.rew = [-1, 1];

        // compute ev for each cont
        for (let i = 0; i < this.cont.length; i++) {
            this.ev[i] = math.round(math.multiply(this.rew, this.cont[i]), 2);
        }

        this.lotteryCont = [];
        this.selectedCont = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let i = 0;
        for (let cont in this.cont) {
            if (this.selectedCont.includes(i)) {
                this.lotteryCont.push(cont);
            }
            i++;
        }

        // Define Learning using rew and cont idx
        // structure is [option 1, option 2]
        // option 1 is always the best here
        // ===================================================================== //
        this.rewards[0] = [this.rew, this.rew];
        this.probs[0] = [9, 1];

        this.rewards[1] = [this.rew, this.rew];
        this.probs[1] = [8, 2];

        this.rewards[2] = [this.rew, this.rew];
        this.probs[2] = [7, 3];
        //
        this.rewards[3] = [this.rew, this.rew];
        this.probs[3] = [6, 4];

        this.learningCont = this.probs.flat();
    }

    _initConditionArrays(
        nTrialPerCondition,
        nTrialPerConditionTraining,
        nCond,
        nSession
    ) {
        // Define conditions
        // ===================================================================== //
        this.trainingConditions = new Array(nSession).fill().map((x) => []);
        this.conditions = new Array(nSession).fill().map((x) => []);

        // EXP
        // ===================================================================== //
        // shuffle the options to randomize context content
        this.learningOptions = shuffle(this.learningOptions);
        this.contexts = new Array(nSession).fill().map((x) => []);
        // Same for training
        this.trainingOptions = shuffle(this.trainingOptions);
        this.trainingContexts = new Array(nSession).fill().map((x) => []);

        // Create condition arrays
        // ===================================================================== //
        let learningOptionIdx = 0;
        let trainingOptionIdx = 0;
        for (let sessionNum = 0; sessionNum < nSession; sessionNum++) {
            // range cond for each session
            let cond = shuffle(range(0, nCond - 1));


            // learning condition (0, 1, 2, 3)
            for (let i = 0; i < cond.length; i++) {
                this.conditions[sessionNum].push(
                    Array(nTrialPerCondition).fill(cond[i]).flat()
                );
            }
            this.conditions[sessionNum] = this.conditions[sessionNum].flat();

            // training conditions
            for (let i = 0; i < cond.length; i++) {
                this.trainingConditions[sessionNum].push(
                    Array(nTrialPerConditionTraining).fill(cond[i]).flat()
                );
            }
            this.trainingConditions[sessionNum] =
                this.trainingConditions[sessionNum].flat();

            // learning contexts
            for (let i = 0; i < nCond * 2; i += 2) {
                this.contexts[sessionNum].push([
                    this.learningOptions[learningOptionIdx],
                    this.learningOptions[learningOptionIdx + 1],
                ]);
                learningOptionIdx += 2;
            }

            // training contexts
            for (let i = 0; i < nCond * 2; i += 2) {
                this.trainingContexts[sessionNum].push([
                    this.trainingOptions[trainingOptionIdx],
                    this.trainingOptions[trainingOptionIdx + 1],
                ]);
                trainingOptionIdx += 2;
            }

            this.trainingContexts[sessionNum] = shuffle(
                this.trainingContexts[sessionNum]
            );
        }
        // ===================================================================== //
    }

    _generateLE({ nSession, conditions, contexts, maxLen } = {}) {
        // ===================================================================== //
        // Learning Phase -- Trial obj definition
        // ===================================================================== //
        let arrToFill = new Array(nSession).fill().map((x) => []);

        for (let sessionNum = 0; sessionNum < nSession; sessionNum++) {
            for (let i = 0; i < conditions[sessionNum].length; i++) {
                let idx = conditions[sessionNum][i];

                let contIdx1 = this.probs[idx][0];
                let contIdx2 = this.probs[idx][1];

                let [file1, file2] = contexts[sessionNum][idx];

                let ev1 = this.ev[contIdx1];
                let ev2 = this.ev[contIdx2];

                let p1 = this.cont[contIdx1];
                let p2 = this.cont[contIdx2];

                let r1 = this.rew;
                let r2 = this.rew;

                let option1Type = 1;
                let option2Type = 1;

                let isCatchTrial = false;

                arrToFill[sessionNum].push({
                    file1: file1,
                    file2: file2,
                    contIdx1: contIdx1,
                    contIdx2: contIdx2,
                    condition: idx,
                    p1: p1,
                    p2: p2,
                    ev1: ev1,
                    ev2: ev2,
                    r1: r1,
                    r2: r2,
                    isCatchTrial: isCatchTrial,
                    option1Type: option1Type,
                    option2Type: option2Type,
                });
            }

        }

        return this._setMaxLen(arrToFill, maxLen);

    }


    _generatePM({ nSession, nRepeat, options, option1Type, maxLen } = {}) {
        // ===================================================================== //
        // Probability matching Phase (Slider) -- Trial obj definition
        // ===================================================================== //
        let arrToFill = new Array(nSession).fill().map(() => []);

        for (let sessionNum = 0; sessionNum < nSession; sessionNum++) {
            for (let optionNum = 0; optionNum < options[sessionNum].length; optionNum++) {
                for (let repeatNum = 0; repeatNum < nRepeat; repeatNum++) {

                    let contIdx1;
                    let file1;

                    if (option1Type === 1) {
                        contIdx1 = this.learningCont[optionNum];
                        file1 = options[sessionNum][optionNum];
                    } else {
                        contIdx1 = this.lotteryCont[optionNum];
                        file1 = this.ev[contIdx1].toString();
                    }

                    let ev1 = this.ev[contIdx1];

                    let p1 = this.cont[contIdx1];

                    let r1 = this.rew;

                    let isCatchTrial = true;

                    arrToFill[sessionNum].push({
                        file1: file1,
                        contIdx1: contIdx1,
                        condition: -1,
                        p1: p1,
                        ev1: ev1,
                        r1: r1,
                        isCatchTrial: isCatchTrial,
                        option1Type: option1Type,
                    });
                }

                arrToFill[sessionNum] = shuffle(arrToFill[sessionNum]);
                // if (arrToFill[sessionNum].length >= maxLen) {
                // break;
                // }   
            }
        }

        return this._setMaxLen(arrToFill, maxLen);
    }

    _generateNoFixedLE({ nSession, nRepeat, options, maxLen } = {}) {
        // ===================================================================== //
        // Learning with no fixed conditions
        // ===================================================================== //
        let arrToFill = new Array(nSession).fill().map((x) => []);
        let optionNums = shuffle(range(0, options[0].length-1));

        for (let sessionNum = 0; sessionNum < nSession; sessionNum++) {
            LOOP: for (let repeatNum = 0; repeatNum < nRepeat; repeatNum++) {
                for (let count1 = 0; count1 < options[sessionNum].length; count1++) {

                    let optionNum1 = optionNums[count1];
                    let tempArray = [];

                    for (let count2 = 0; count2 < options[sessionNum].length; count2++) {

                        let optionNum2 = optionNums[count2];
                        if (options[sessionNum][optionNum2] == options[sessionNum][optionNum1]) {
                            continue;
                        }
                        let [contIdx1, contIdx2] = [this.learningCont[optionNum1], this.learningCont[optionNum2]];
                        let [file1, file2] = [options[sessionNum][optionNum1], options[sessionNum][optionNum2]]

                        let ev1 = this.ev[contIdx1];
                        let ev2 = this.ev[contIdx2];

                        let p1 = this.cont[contIdx1];
                        let p2 = this.cont[contIdx2];

                        let r1 = this.rew;
                        let r2 = this.rew;

                        let option1Type = 1;
                        let option2Type = 1;

                        let isCatchTrial = false;
                        // debugger;
                        tempArray.push({
                            file1: file1,
                            file2: file2,
                            contIdx1: contIdx1,
                            contIdx2: contIdx2,
                            condition: -1,
                            p1: p1,
                            p2: p2,
                            ev1: ev1,
                            ev2: ev2,
                            r1: r1,
                            r2: r2,
                            isCatchTrial: isCatchTrial,
                            option1Type: option1Type,
                            option2Type: option2Type,
                        })

                        // if (arrToFill[sessionNum].length > maxLen) {
                        // break LOOP;
                        // }
                    }

                    arrToFill[sessionNum].push(shuffle(tempArray));
                }
            }
            arrToFill[sessionNum] = arrToFill[sessionNum].flat();
        }
        return this._setMaxLen(arrToFill, maxLen);
    }


    _generateED_EE({ nSession, options, maxLen } = {}) {
        // ===================================================================== //
        // Description vs Experience / Experience vs Experience Phase
        // ===================================================================== //
        let arrToFill = new Array(nSession).fill().map((x) => []);
        let nOption = options[0].length;
        let optionNums = shuffle(range(0, nOption-1));
        let lotteryNums = shuffle(range(0, this.lotteryCont.length-1));
        let catchTrials = shuffle(this._generateCatchTrialsTwoOptions());

        for (let sessionNum = 0; sessionNum < nSession; sessionNum++) {
            LOOP1: for (let count1 = 0; count1 < nOption; count1++) {
                let optionNum1 = optionNums[count1];
                let tempArray = [];

                for (let countLot = 0; countLot < this.lotteryCont.length; countLot++) {

                    let lotteryNum = lotteryNums[countLot];
                    let [contIdx1, contIdx2] = [this.learningCont[optionNum1], this.lotteryCont[lotteryNum]];
                    let [file1, file2] = [options[sessionNum][optionNum1], this.ev[contIdx2].toString()]

                    let ev1 = this.ev[contIdx1];
                    let ev2 = this.ev[contIdx2];

                    let p1 = this.cont[contIdx1];
                    let p2 = this.cont[contIdx2];

                    let r1 = this.rew;
                    let r2 = this.rew;

                    let option1Type = 1;
                    let option2Type = 0;

                    let isCatchTrial = false;

                    //arrToFill[sessionNum]
                    tempArray.push({
                        file1: file1,
                        file2: file2,
                        contIdx1: contIdx1,
                        contIdx2: contIdx2,
                        condition: -1,
                        p1: p1,
                        p2: p2,
                        ev1: ev1,
                        ev2: ev2,
                        r1: r1,
                        r2: r2,
                        isCatchTrial: isCatchTrial,
                        option1Type: option1Type,
                        option2Type: option2Type,
                    });



                }

                for (let count2 = 0; count2 < nOption; count2++) {

                    let optionNum2 = optionNums[count2];
                    if (options[sessionNum][optionNum2] == options[sessionNum][optionNum1]) {
                        continue;
                    }
                    let [contIdx1, contIdx2] = [this.learningCont[optionNum1], this.learningCont[optionNum2]];
                    let [file1, file2] = [options[sessionNum][optionNum1], options[sessionNum][optionNum2]]

                    let ev1 = this.ev[contIdx1];
                    let ev2 = this.ev[contIdx2];

                    let p1 = this.cont[contIdx1];
                    let p2 = this.cont[contIdx2];

                    let r1 = this.rew;
                    let r2 = this.rew;

                    let option1Type = 1;
                    let option2Type = 1;

                    let isCatchTrial = false;

                    //arrToFill[sessionNum]
                    tempArray.push({
                        file1: file1,
                        file2: file2,
                        contIdx1: contIdx1,
                        contIdx2: contIdx2,
                        condition: -1,
                        p1: p1,
                        p2: p2,
                        ev1: ev1,
                        ev2: ev2,
                        r1: r1,
                        r2: r2,
                        isCatchTrial: isCatchTrial,
                        option1Type: option1Type,
                        option2Type: option2Type,
                    });

                }

                arrToFill[sessionNum].push(shuffle(tempArray));

                arrToFill[sessionNum].push(catchTrials[count1]);
                // if (arrToFill[sessionNum].flat().length > maxLen) {
                // break LOOP1;
                // }
            }


            arrToFill[sessionNum] = arrToFill[sessionNum].flat();
        }

        return this._setMaxLen(arrToFill, maxLen);
    }

    _setMaxLen(arrToFill, maxLen) {
        for (let i = 0; i < arrToFill.length; i++) {
            arrToFill[i] = arrToFill[i].slice(0, maxLen);
        }
        // debugger;
        return arrToFill;
    }

    _generateCatchTrialsOneOption() {
        // define catch trials for slider
        // ===================================================================== //
        // using cont idx
        let catchTrialsTemp = shuffle([1, 2, 3, 4, 6, 7, 8, 9]);

        let catchTrials = [];
        for (let i = 0; i < catchTrialsTemp.length; i++) {
            let contIdx1 = catchTrialsTemp[i];

            let ev1 = this.ev[contIdx1];

            let file1 = ev1.toString();

            let p1 = this.cont[contIdx1];

            let r1 = this.rew;

            let isCatchTrial = true;

            let option1Type = 0;

            catchTrials[i] = {
                file1: file1,
                contIdx1: contIdx1,
                condition: -1,
                p1: p1,
                ev1: ev1,
                r1: r1,
                isCatchTrial: isCatchTrial,
                option1Type: option1Type,
            };
        }

        return catchTrials;
    }



    _generateCatchTrialsTwoOptions() {
        // define catch trials
        // ===================================================================== //
        // using cont idx
        let catchTrialsTemp = shuffle([
            [9, 1],
            [8, 1],
            [7, 1],
            [6, 1],
            [9, 2],
            [8, 2],
            [7, 2],
            [9, 3],
        ]);

        let catchTrials = [];
        for (let i = 0; i < catchTrialsTemp.length; i++) {
            let contIdx1 = catchTrialsTemp[i][0];
            let contIdx2 = catchTrialsTemp[i][1];

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let file1 = ev1.toString();
            let file2 = ev2.toString();

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let r1 = this.rew;
            let r2 = this.rew;

            let isCatchTrial = true;

            let option1Type = 0;
            let option2Type = 0;

            catchTrials[i] = {
                file1: file1,
                file2: file2,
                contIdx1: contIdx1,
                contIdx2: contIdx2,
                condition: -1,
                p1: p1,
                p2: p2,
                ev1: ev1,
                ev2: ev2,
                r1: r1,
                r2: r2,
                isCatchTrial: isCatchTrial,
                option1Type: option1Type,
                option2Type: option2Type,
            };
        }

        return catchTrials;
    }

    _getOptionsPerSession(contexts) {
        let nSess = contexts.length;
        let options = new Array(nSess).fill().map(() => []);
        for (let sessionNum = 0; sessionNum < nSess; sessionNum++) {
            options[sessionNum] = contexts[sessionNum].flat();
        }
        return options;
    }

    _insertCatchTrials() {
        // insert catch trials randomly in 2nd phase
        for (let sessionNum = 0; sessionNum < this.nSession; sessionNum++) {
            let trials1 = this._generateCatchTrialsTwoOptions();
            let count = trials1.length;
            // let trials2 = this._generateCatchTrialsTwoOptions();
            for (let trialNum = 0; trialNum < count; trialNum++) {
                this.trialObj[2][sessionNum].splice(
                    Math.floor(Math.random() * (this.trialObj[2][sessionNum].length + 1)),
                    0, trials1.pop());

                // this.trialObjTraining[2][sessionNum].splice(
                // Math.floor(Math.random() * (this.trialObjTraining[2][sessionNum].length + 1)),
                // 0, trials2.pop());

            }

        }

        // insert catch trials randomly in 3rd phase
        // for (let sessionNum = 0; sessionNum < this.nSession; sessionNum++) {
        // let trials1 = this._generateCatchTrialsOneOption();
        // let count = trials1.length;
        // let trials2 = this._generateCatchTrialsOneOption();
        // for (let trialNum = 0; trialNum < count; trialNum++) {
        // this.trialObj[3][sessionNum].splice(
        // Math.floor(Math.random() * (this.trialObj[3][sessionNum].length + 1)),
        // 0, trials1.pop());

        // this.trialObjTraining[3][sessionNum].splice(
        // Math.floor(Math.random() * (this.trialObjTraining[3][sessionNum].length + 1)),
        // 0, trials2.pop());

        // }

        // }
    }

    _computeMaxPoints() {
        // using expected value compute what will be the final score
        // if the subject makes optimal choices

        let maxPoints = 0;
        // get all trials
        let trialObj = Object.values(this.trialObj).flat().flat();

        for (let i = 0; i < trialObj.length; i++) {
            let ev;
            if (trialObj[i]['ev2'] == undefined) {
                ev = trialObj[i]['ev1'];
            } else {
                ev = Math.max(trialObj[i]['ev1'], trialObj[i]['ev2'])
            }
            if (ev == NaN || ev == undefined) {
                debugger;
            }
            maxPoints += ev;
        }

        return Math.round(maxPoints);
    }

    _loadImg(stim, trainingStim, lotteries, fb) {
        // Get stims, feedbacks, resources
        let nImg = stim.filenames.length;
        let nFeedback = fb.filenames.length;
        let nTrainingImg = trainingStim.filenames.length;
        let borderColor = "transparent";
        let nLotteries = lotteries.filenames.length;

        this.images = [];
        this.learningOptions = [];
        for (let i = 0; i < nImg; i++) {
            let fname = stim.filenames[i];
            this.learningOptions.push(fname);
            this.images[fname] = new Image();
            this.images[fname].src = stim.path + fname + "." + stim.extension;
            this.images[fname].className = "img-responsive rounded center-block";
            this.images[fname].style.border = "0px solid " + borderColor;
            this.images[fname].style.position = "relative";
            this.images[fname].style.top = "0px";
        }

        this.feedbackImg = [];
        for (let i = 0; i < nFeedback; i++) {
            let fname = fb.filenames[i];
            this.feedbackImg[fname] = new Image();
            this.feedbackImg[fname].src = fb.path + fname + "." + fb.extension;
            this.feedbackImg[fname].className = "img-responsive rounded center-block";
            this.feedbackImg[fname].style.border = "0px solid " + borderColor;
            this.feedbackImg[fname].style.position = "relative";
            this.feedbackImg[fname].style.top = "0px";
        }

        // Training stims
        this.trainingImg = [];
        this.trainingOptions = [];
        for (let i = 0; i < nTrainingImg; i++) {
            let fname = trainingStim.filenames[i];
            this.trainingOptions.push(fname);
            this.trainingImg[fname] = new Image();
            this.trainingImg[fname].src = trainingStim.path + fname + "." + trainingStim.extension;
            this.trainingImg[fname].className = "img-responsive rounded center-block ";
            this.trainingImg[fname].style.border = "0px solid " + borderColor;
            this.trainingImg[fname].style.position = "relative";
            this.trainingImg[fname].style.top = "0px";
        }

        // load lotteries (pie-charts)
        for (let i = 0; i < nLotteries; i++) {
            let idx = lotteries.filenames[i];
            this.images[idx] = new Image();
            this.images[idx].src = lotteries.path + idx + "." + lotteries.extension;
            this.images[idx].className = "img-responsive rounded center-block ";
            this.images[idx].style.border = "0px solid " + borderColor;
            this.images[idx].style.position = "relative";
            this.images[idx].style.top = "0px";
            this.trainingImg[idx] = new Image();
            this.trainingImg[idx].src = lotteries.path + idx + "." + lotteries.extension;
            this.trainingImg[idx].className = "img-responsive rounded center-block ";
            this.trainingImg[idx].style.border = "0px solid " + borderColor;
            this.trainingImg[idx].style.position = "relative";
            this.trainingImg[idx].style.top = "0px";

        }
    }
}
