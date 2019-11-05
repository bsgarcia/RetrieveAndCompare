import {ExperimentParameters} from "./exp.mjs";
import {Instructions} from "./inst.mjs";
import {ChoiceManager, SliderManager} from "./trial_manager.mjs";


// When the page is fully loaded, the main function will be called
$(document).ready(main);


function main() {
    /*
    Main function where
    we instantiate main components, in order to maintain
    their attributes throught the whole experiment scope
     */

    // init main parameters
    // these three variables indicate what
    // has to be run in the state machine (i.e. current state of the experiment)
    let sessionNum = -1;
    let phaseNum = 1;
    let instructionNum = 'end';

    // instantiate experiment parameters
    let exp = new ExperimentParameters(
        {
            online: false,   // send network requests
            isTesting: true, // isTesting==in development vs in production
            expName: 'RetrieveAndCompare', // experience name
            completeFeedback: true, // display feedback of both options
            maxPoints: undefined, // max points cumulated all along the experiment
                                 // if undefined or 0, will be computed automatically
            howMuchPenceForOnePoint: 250,
            feedbackDuration: 2000, // how many milliseconds we present the outcome
            maxTrainingNum: -2, // if sessionNum == maxTrainingNum
                                // do not allow for new training sessions
            nTrialPerConditionTraining: 5,
            nTrialPerCondition: 30,
            nCond: 4,
            imgPath: 'images/cards_gif/',
            compLink: 'https://app.prolific.ac/submissions/complete?cc=RNFS5HP5' // prolific completion link
                                                                                // will be displayed at the end
        }
    );
    let inst = new Instructions(exp);

    // Run experiment!!
    stateMachine({instructionNum, sessionNum, phaseNum, inst, exp});
}


function stateMachine({instructionNum, sessionNum, phaseNum, inst, exp} = {}) {

    /* ============================ Instructions Management ========================== */

    // if sessionNum < 0, then it is a training session
    // here training sessionNum is in {-1, -2}
    let isTraining = +(sessionNum < 0);

    switch (instructionNum) {
        case 0:
            inst.goFullscreen(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 1, inst: inst, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 1:
            inst.setUserID(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 2, inst: inst, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 2:
            inst.displayConsent(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 3, inst: inst, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 3:
            inst.displayInitialInstruction(
                {pageNum: 1},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, inst: inst, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 4:
            inst.displayInstructionLearning(
                {pageNum: 1, isTraining: isTraining, phaseNum: 1},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', inst: inst, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 5:
            inst.displayInstructionChoiceElicitation(
                {pageNum: 1, isTraining: isTraining, phaseNum: 2},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', inst: inst, exp: exp, sessionNum: sessionNum, phaseNum: 2
                }
            );
            return;

        case 6:
            inst.displayInstructionSliderElicitation(
                {pageNum: 1, isTraining: isTraining, phaseNum: 3},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', inst: inst, exp: exp, sessionNum: sessionNum, phaseNum: 3
                }
             );
            return;
        case 7:
            inst.endTraining(
                {pageNum: 1, isTraining: 1, phaseNum: 3, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, inst: inst, exp: exp, sessionNum: 0, phaseNum: 1
                }
            );
            return;
        case 8:
            inst.endExperiment(
                {pageNum: 1, isTraining: 1, phaseNum: 3},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', inst: inst, exp: exp, sessionNum: 0, phaseNum: 'end'
                }
            );
            return;


        case 'end':
            break;
    }

    /* ============================ Test Management ================================ */

    let trialObj;
    let imgObj = [exp.images, exp.trainingImg][isTraining];

    switch (phaseNum) {

        case 1:
        case 2:

            let isElicitation = +(phaseNum > 1);

            // select stimuli depending on sessionNum;
            // Using arrays allows to avoid multiple if statements
            trialObj = [
                [exp.learningStim, exp.elicitationStimEV][isElicitation],
                [exp.learningStimTraining, exp.elicitationStimEVTraining][isElicitation],
            ][isTraining];

            let choice = new ChoiceManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration,
                    completeFeedback: exp.completeFeedback,
                    feedbackObj: exp.feedbackImg,
                    imgObj: imgObj,
                    sessionNum: sessionNum,
                    phaseNum: phaseNum,
                    exp: exp,
                    elicitationType: [-1, 0][isElicitation],
                    showFeedback: [true, false][isElicitation],
                    maxTrials: 3,
                    // what will be executed next
                    nextFunc: stateMachine,
                    nextParams: {
                        instructionNum: [5, 6][isElicitation],
                        sessionNum: sessionNum,
                        phaseNum: [2, 3][isElicitation],
                        exp: exp,
                        inst: inst
                    }
                }
            );
            choice.run();
            break;

        case 3:

            // select stimuli depending on sessionNum;
            trialObj = [exp.elicitationStim, exp.elicitationStimTraining][isTraining];

            let slider = new SliderManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration-1500,
                    completeFeedback: exp.completeFeedback,
                    feedbackObj: exp.feedbackImg,
                    imgObj: imgObj,
                    sessionNum: sessionNum,
                    phaseNum: phaseNum,
                    exp: exp,
                    elicitationType: 2,
                    showFeedback: exp.showFeedback,
                    // what will be executed next
                    nextFunc: stateMachine,
                    nextParams: {
                        instructionNum: [8, 7][isTraining],
                        sessionNum: sessionNum,
                        phaseNum: ['end', 1][isTraining],
                        exp: exp,
                        inst: inst
                    }
                }
            );
            slider.run();
            break;

        case 'end':
            break;
    }

    /* ============================ Questionnaire Management ====================== */


}