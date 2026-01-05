export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["CRITICAL"] = "CRITICAL";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["LOW"] = "LOW";
})(TaskPriority || (TaskPriority = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["BLOCKED"] = "BLOCKED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (TaskStatus = {}));
export var GoalStatus;
(function (GoalStatus) {
    GoalStatus["DRAFT"] = "DRAFT";
    GoalStatus["ACTIVE"] = "ACTIVE";
    GoalStatus["ON_TRACK"] = "ON_TRACK";
    GoalStatus["AT_RISK"] = "AT_RISK";
    GoalStatus["COMPLETED"] = "COMPLETED";
    GoalStatus["ABANDONED"] = "ABANDONED";
})(GoalStatus || (GoalStatus = {}));
export var GoalTimeHorizon;
(function (GoalTimeHorizon) {
    GoalTimeHorizon["SHORT_TERM"] = "SHORT_TERM";
    GoalTimeHorizon["MEDIUM_TERM"] = "MEDIUM_TERM";
    GoalTimeHorizon["LONG_TERM"] = "LONG_TERM";
})(GoalTimeHorizon || (GoalTimeHorizon = {}));
