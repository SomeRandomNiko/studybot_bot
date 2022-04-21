import { stopTimer } from "../commands/timer";
import { Button } from "../structures/Button";

export default new Button("stop_timer", "Stop Timer", "DANGER", function (interaction) {
    stopTimer(interaction);
})