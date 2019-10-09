var app = new Vue({
    el: '#app',
    data: {
        slots: {},
        totalNumberOfSlots: 10,
        editTotalNumberOfSlots: 0,
        regNo: "",
        slot: "",
        message: { type: "", text: "" }
    },
    created() {
        this.fetchFromLocalStorage();
        this.editTotalNumberOfSlots = this.totalNumberOfSlots;
    },
    methods: {
        allocateVehicle() {
            if (this.regNo != "" && this.regNo.replace(/ /g, "").length > 0) {
                if (this.findAlocatedIndex() === -1) {
                    let vacantIndex = Object.values(this.slots).indexOf(null);
                    let allocatedSlot = Object.keys(this.slots)[vacantIndex];
                    let totalKeys = Object.keys(this.slots).length;

                    // add new slot to the object if no existing vacant space availaable & total number of slot is more 
                    if (vacantIndex === -1 && this.totalNumberOfSlots > totalKeys) {
                        if (totalKeys === 0) {
                            allocatedSlot = "P1";
                        } else {
                            let lastSlot = Object.keys(this.slots)[totalKeys - 1];
                            allocatedSlot = "P" + (parseInt(lastSlot.replace("P", "")) + 1);
                        }
                    }

                    // allocate if slot found
                    if (allocatedSlot) {
                        this.slots[allocatedSlot] = this.regNo;
                        this.message = {
                            type: "success",
                            text: "Vehicle " + this.regNo + " allocated at slot " + allocatedSlot
                        }
                        this.regNo = "";
                        this.saveToLocalStorage()
                    } else {
                        this.message = {
                            type: "error",
                            text: "No available slots"
                        }
                    }
                } else {
                    this.message = {
                        type: "error",
                        text: "Vehicle " + this.regNo + " already allocated"
                    }
                }
            } else {
                this.message = {
                    type: "error",
                    text: "Enter registration number to allocate"
                }
            }
        },

        deAllocateVehicle() {
            let allocatedIndex = this.findAlocatedIndex();

            if (allocatedIndex !== -1) {
                let allocatedSlot = Object.keys(this.slots)[allocatedIndex];
                this.slots[allocatedSlot] = null;
                this.message = {
                    type: "success",
                    text: "Vehicle " + this.regNo + " got deallocated"
                }
                this.regNo = "";
                this.saveToLocalStorage();
            } else {
                this.message = {
                    type: "error",
                    text: "Unable to find the vehicle " + this.regNo
                }
            }
        },

        findVehicle() {
            let allocatedIndex = this.findAlocatedIndex();
            let allocatedSlot = Object.keys(this.slots)[allocatedIndex];

            if (allocatedSlot) {
                this.message = {
                    type: "success",
                    text: "Vehicle " + this.regNo + " is at the slot " + allocatedSlot
                }
                this.highlighSlot(allocatedSlot);
                this.regNo = "";
            } else {
                this.message = {
                    type: "error",
                    text: "Unable to find the vehicle " + this.regNo
                }
            }
        },

        findSlot() {
            if (this.slots[this.slot] === null) {
                this.message = {
                    type: "success",
                    text: "The slot " + this.slot + " is vacant"
                }
                this.slot = "";
            } else if (this.slots[this.slot]) {
                this.message = {
                    type: "success",
                    text: "The slot " + this.slot + " is assigned to vehicle " + this.slots[this.slot]
                }
                this.highlighSlot(this.slot);
                this.slot = "";
            } else if (document.getElementById(this.slot) !== null) {
                this.message = {
                    type: "success",
                    text: "The slot " + this.slot + " is vacant"
                }
                this.highlighSlot(this.slot);
                this.slot = "";
            } else {
                this.message = {
                    type: "error",
                    text: "Unable to find the slot " + this.slot
                }
            }
        },

        findAlocatedIndex() {
            return Object.values(this.slots).indexOf(this.regNo);
        },

        highlighSlot(slot) {
            document.getElementById(slot).classList.add("bg-warning");

            setTimeout(() => {
                document.getElementById(slot).classList.remove("bg-warning");
            }, 1000);
        },

        updateTotalSlots() {
            let existingCount = Object.keys(this.slots).length;

            if (this.editTotalNumberOfSlots === "") {
                this.message = {
                    type: "error",
                    text: "Failed to update. Give a number to update."
                }
                this.editTotalNumberOfSlots = this.totalNumberOfSlots;
            } else if (Object.keys(this.slots).length > this.editTotalNumberOfSlots) {

                let slotValues = Object.values(this.slots);
                let hasError = false;

                // check if vehicle allocated already
                for (i = slotValues.length; i > this.editTotalNumberOfSlots; i--) {
                    if (this.slots['P' + i] === null) {
                        // delete object key if null
                        delete this.slots['P' + i];
                    } else {
                        // found a vehicle.. throw error
                        this.message = {
                            type: "error",
                            text: "Failed to update. A vehicle is assigned at slot P" + i + ". Give a number larger or equal to " + i
                        }
                        this.editTotalNumberOfSlots = this.totalNumberOfSlots;
                        hasError = true;
                        break;
                    }
                }

                if (!hasError) {
                    this.message = {
                        type: "success",
                        text: "Updated total slots to " + this.editTotalNumberOfSlots
                    }
                    this.totalNumberOfSlots = this.editTotalNumberOfSlots;
                }

            } else {
                this.message = {
                    type: "success",
                    text: "Updated total slots to " + this.editTotalNumberOfSlots
                }
                this.totalNumberOfSlots = this.editTotalNumberOfSlots;
                this.saveToLocalStorage();
            }

            //scroll to top
            window.scrollTo(0, 0);
        },

        saveToLocalStorage() {
            window.localStorage.slots = JSON.stringify(this.slots);
            window.localStorage.totalNumberOfSlots = this.totalNumberOfSlots;
        },

        fetchFromLocalStorage() {
            if (window.localStorage.slots) {
                this.slots = JSON.parse(window.localStorage.slots);
                this.totalNumberOfSlots = parseInt(window.localStorage.totalNumberOfSlots);
            }
        }
    }
})
