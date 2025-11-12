import powerbi from "powerbi-visuals-api";

import GroupFormattingModelReference = powerbi.visuals.GroupFormattingModelReference;
import FormattingId = powerbi.visuals.FormattingId;

import { TextFilterObjectName } from "../settings";

interface IFilterInterface extends GroupFormattingModelReference {
    filterMode: FormattingId;
    show: FormattingId;
}

export const filterReference: IFilterInterface = {
    cardUid: "Visual-filter-card",
    groupUid: "generalFilterGroup-group",
    filterMode: {
        objectName: TextFilterObjectName.Filter,
        propertyName: "filterMode",
    },
    show: {
        objectName: TextFilterObjectName.Filter,
        propertyName: "showFilterModeButton",
    }
}