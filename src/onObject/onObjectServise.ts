import powerbi from "powerbi-visuals-api";


import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualOnObjectFormatting = powerbi.extensibility.visual.VisualOnObjectFormatting;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import SubSelectionStylesType = powerbi.visuals.SubSelectionStylesType;
import CustomVisualSubSelection = powerbi.visuals.CustomVisualSubSelection;
import VisualSubSelectionShortcuts = powerbi.visuals.VisualSubSelectionShortcuts;
import SubSelectionShortcutsKey = powerbi.visuals.SubSelectionShortcutsKey;
import SubSelectionStyles = powerbi.visuals.SubSelectionStyles;

import VisualShortcutType = powerbi.visuals.VisualShortcutType;

import { select as d3Select } from "d3-selection";
import { HtmlSubSelectionHelper } from "powerbi-visuals-utils-onobjectutils";
import { TextFilterObjectName } from "../settings";
import { filterReference } from "./references";




export class TextFilterOnObjectService implements VisualOnObjectFormatting {
    private localizationManager: ILocalizationManager;
    private htmlSubSelectionHelper: HtmlSubSelectionHelper;

    constructor(element: HTMLElement, host: IVisualHost, localizationManager: ILocalizationManager) {
        this.localizationManager = localizationManager;
        this.htmlSubSelectionHelper = HtmlSubSelectionHelper.createHtmlSubselectionHelper({
            hostElement: element,
            subSelectionService: host.subSelectionService,
        })
    }


    public setFormatMode(isFormatMode: boolean): void {
        this.htmlSubSelectionHelper.setFormatMode(isFormatMode);
    }

    public updateOutlinesFromSubSelections(subSelections: CustomVisualSubSelection[], clearExistingOutlines?: boolean, suppressRender?: boolean): void {
        this.htmlSubSelectionHelper.updateOutlinesFromSubSelections(subSelections, clearExistingOutlines, suppressRender);
    }

    public getSubSelectables(filter?: SubSelectionStylesType): CustomVisualSubSelection[] | undefined {
        const subSelectables = this.htmlSubSelectionHelper.getAllSubSelectables(filter);
        return subSelectables;
    }

    public getSubSelectionShortcuts(subSelections: CustomVisualSubSelection[], filter: SubSelectionShortcutsKey | undefined): VisualSubSelectionShortcuts | undefined {
        const visualObject = subSelections[0]?.customVisualObjects[0];

        switch (visualObject?.objectName) {
            case TextFilterObjectName.Filter:
                return [
                    {
                        type: VisualShortcutType.Picker,
                        ...filterReference.filterMode,
                        label: this.localizationManager.getDisplayName("Visual_Filter_Mode")
                    },
                    {
                        type: VisualShortcutType.Toggle,
                        ...filterReference.show,
                        disabledLabel: this.localizationManager.getDisplayName("Visual_Filter_Hide"),
                        enabledLabel: this.localizationManager.getDisplayName("Visual_Filter_Show"),
                    },
                    {
                        type: VisualShortcutType.Navigate,
                        destinationInfo: { cardUid: filterReference.cardUid, groupUid: filterReference.groupUid },
                        label: this.localizationManager.getDisplayName("Visual_Filter_General")
                    }
                ]

        }
        return undefined
    }

    public getSubSelectionStyles(subSelections: CustomVisualSubSelection[]): SubSelectionStyles | undefined {
        return undefined;
    }
}