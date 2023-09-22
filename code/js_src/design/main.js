"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI = void 0;
const messaging_1 = require("../helpers/messaging");
const axioms_1 = require("./axioms");
const constants_1 = require("./constants");
class UI {
    static editMode = "EXIT";
    static editTarget = "INVALID_Z";
    static dialogMode = 0;
    static activeDialog;
    static dialogs = [axioms_1.default];
    static reset() {
        this.dialogMode = 0;
        this.activeDialog = null;
    }
    static trigger(code1, code2) {
        this.editMode = constants_1.editModes[-(Math.min(code1, code2) + 6)];
        this.editTarget = constants_1.editTargets[(Math.max(code1, code2) - 97)];
        if (!(this.editMode && this.editTarget) || this.editTarget.startsWith("INVALID_")) {
            this.errorAlert(`invalid input codes ${code1} ${code2}`);
        }
        this.dialogMode = 1;
        this.input([]);
    }
    static input(args) {
        if ((this.dialogMode === 0) || (args[0] === 'cancel')) {
            this.activeDialog = null;
            return;
        }
        if (!this.activeDialog) {
            this.activeDialog = this.dialogs[0](...args);
            if (!this.activeDialog) {
                this.errorAlert(`invalid editing mode ${this.editMode} for target ${this.editTarget}`);
            }
        }
        let gen = this.activeDialog.next(args);
        if (gen.done) {
            this.activeDialog = null;
        }
        else {
            this.dialogMode = gen.value[0];
            messaging_1.Messenger.ee.emit("dialog", this.dialogMode, gen.value[1]);
        }
    }
    static errorAlert(str) {
        this.dialogMode = constants_1.dialogModes.ALERT;
        return messaging_1.Messenger.ee.emit("dialog", this.dialogMode, str);
    }
}
exports.UI = UI;
