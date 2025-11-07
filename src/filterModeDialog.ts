import powerbi from "powerbi-visuals-api";
import DialogConstructorOptions = powerbi.extensibility.visual.DialogConstructorOptions;
import DialogAction = powerbi.DialogAction;
import IDialogHost = powerbi.extensibility.visual.IDialogHost;
import { FilterMode, FilterModeInitialState, FilterModeOptions } from "./filterMode";
import { Selection as d3Selection, select as d3Select } from "d3-selection";


export class FilterModeDialog {
    static id = "filterModeDialog";

    private filterMode: d3Selection<HTMLSelectElement, unknown, null, undefined>;
    private currentFilterMode: FilterMode;
    private dialogHost: IDialogHost;
    private saveButton: d3Selection<HTMLButtonElement, unknown, null, undefined>;
    private localizedStrings?: { title: string; include: string; exclude: string; };

    constructor(options: DialogConstructorOptions, initialState: FilterModeInitialState) {
        this.dialogHost = options.host;
        this.currentFilterMode = initialState.filterMode;
        this.localizedStrings = initialState.localizedStrings;

        const container = d3Select(options.element);

        const labelText = this.localizedStrings?.title || "Select Filter Mode:";
        container.append("label")
            .attr("for", "filterModeSelect")
            .text(labelText)
            .style("display", "block")
            .style("margin-bottom", "10px")
            .style("font-family", "Segoe UI, sans-serif")
            .style("font-size", "14px");

        this.filterMode = container
            .append("select")
            .attr("id", "filterModeSelect")
            .style("width", "100%")
            .style("padding", "8px")
            .style("font-size", "14px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px");

        this.filterMode
            .selectAll("option")
            .data(FilterModeOptions)
            .enter()
            .append("option")
            .attr("value", (d) => d)
            .text((d) => {
                // Use localized strings if available
                if (this.localizedStrings) {
                    return d === FilterMode.Include ? this.localizedStrings.include : this.localizedStrings.exclude;
                }
                return d;
            })
            .property("selected", (d) => d === this.currentFilterMode);

        this.filterMode.on("change", (event) => {
            const target = event.target as HTMLSelectElement;
            this.currentFilterMode = target.value as FilterMode;
        });

        this.saveButton = container
            .append("button")
            .text("Save")
            .style("margin-top", "20px")
            .style("padding", "10px 20px")
            .style("font-size", "14px")
            .style("background-color", "#0078D4")
            .style("color", "#fff")
            .style("border", "none")
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .on("click", () => {
                this.dialogHost.close(DialogAction.OK, { filterMode: this.currentFilterMode });
            });

        // Optional: Handle Enter key to confirm
        const keyHandler = (e: KeyboardEvent) => {
            if (e.code === 'Enter') {
                this.dialogHost.close(DialogAction.OK, { filterMode: this.currentFilterMode });
            } else if (e.code === 'Escape') {
                this.dialogHost.close(DialogAction.Cancel, null);
            }
        };
        document.addEventListener('keydown', keyHandler);
    }
    public onAction(action: DialogAction): FilterModeInitialState | null {
        if (action === DialogAction.OK) {
            return { filterMode: this.currentFilterMode };
        } else {
            return null;
        }
    }
}

globalThis.dialogRegistry = globalThis.dialogRegistry || {};
globalThis.dialogRegistry[FilterModeDialog.id] = FilterModeDialog;