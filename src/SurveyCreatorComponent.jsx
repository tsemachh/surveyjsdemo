import React from "react";
import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import "survey-core/survey.i18n.js";
import "survey-creator-core/survey-creator-core.i18n.js";
import { settings } from "survey-creator-core";
import { formJSON } from "./survey_json";
import "survey-core/defaultV2.css";
import "survey-creator-core/survey-creator-core.css";
import "./index.css";

// Hide the "Add Question" button from the design surface
settings.designer.showAddQuestionButton = false;

function isObjColumn(obj) {
    return !!obj && obj.getType() === "matrixdropdowncolumn";
}
function SurveyCreatorRenderComponent() {
    const options = {
        showLogicTab: true
    };
    const creator = new SurveyCreator(options);
    const panelItem = creator.toolbox.getItemByName("panel");
    // Allow restricted users to add only panels. If you want to hide the entire Toolbox, set `creator.showToolbox = false;`
    creator.toolbox.addItems([panelItem], true);
    // Change the default question type to "panel"
    creator.currentAddQuestionType = "panel";
    creator.onElementAllowOperations.add((_, options) => {
        // Disallow restricted users to change question types, delete questions, or copy them
        options.allowChangeType = false;
        options.allowCopy = false;
        const obj = options.obj;
        if (obj.isQuestion) {
            options.allowDelete = false;
        }
        if (obj.isPage || obj.isPanel) {
            options.allowDelete = obj.questions.length === 0;
        }
    });
    creator.onCollectionItemAllowOperations.add((_, options) => {
        // Disallow restricted users to delete columns via adorners on the design surface
        options.allowDelete = !isObjColumn(options.item)
    });
    creator.onSetPropertyEditorOptions.add((_, options) => {
        // Disallow restricted users to add or delete matrix columns via the Property Grid
        options.editorOptions.allowAddRemoveItems = options.propertyName !== "columns";
    });
    creator.onGetPropertyReadOnly.add((_, options) => {
        // Disallow restricted users to change cell question type in matrixes
        if (options.property.name === "cellType") {
            options.readOnly = true;
        }
        // Disallow restricted users to modify the `name` property for questions and matrix columns
        if (options.property.name === "name") {
            options.readOnly = options.obj.isQuestion || isObjColumn(options.obj);
        }
    });
    creator.JSON = formJSON;
    return (<SurveyCreatorComponent creator={creator} />);
}

export default SurveyCreatorRenderComponent;