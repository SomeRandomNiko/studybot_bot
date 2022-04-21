import { startTimer } from "../commands/timer";
import { Button } from "../structures/Button";

export default new Button("start_timer", "Start Timer", "SUCCESS", function (interaction) {
    startTimer(interaction);
})