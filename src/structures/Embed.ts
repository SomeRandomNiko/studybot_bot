import { EmbedField, MessageEmbed, MessageEmbedOptions, User } from "discord.js";

import { bold, hyperlink, italic, userMention } from "@discordjs/builders";
import config from "../shared/config";
import Fuse from "fuse.js";

export class ExtendedEmbed extends MessageEmbed {

    constructor(data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        this.setFooter({
            text: `https://studybot.it`,
        })
    }
}

export class ErrorEmbed extends ExtendedEmbed {
    constructor(errorMessage: string) {
        super({ color: 0xed4245, title: "ERROR", description: errorMessage });
    }
}

export class InfoEmbed extends ExtendedEmbed {
    constructor(message?: string) {
        super({ color: 0xffffff, description: message });
    }
}

export class UserDataEmbed extends InfoEmbed {
    constructor(user: any) {
        super();
        this.setTitle("User");
        if (user.digreg) {
            this.setAuthor({ name: user.digreg.fullName, iconURL: user.discord.avatarUrl });
            this.addField("Class", user.digreg.className);
        } else {
            this.setAuthor({ name: user.discord.username, iconURL: user.discord.avatarUrl });
            this.setDescription(`${userMention(user.discord.id)} have not connected their ${italic("Digitales Register")} account yet. They can do so ${hyperlink("here", config.frontendServerUri)}.`);
        }
    }
}

export class GradesDataEmbed extends InfoEmbed {
    constructor(user: User, gradesData: any, subjectSearch?: string) {
        super();
        
        let {embedFields, subjectName, description} = subjectSearch ? this.selectedSubject(gradesData, subjectSearch) : this.allGrades(gradesData);

        this.setTitle(`Grades: ${subjectName}`);
        this.setAuthor({ name: user.username, iconURL: user.avatarURL({ dynamic: true }) || user.defaultAvatarURL });
        this.setDescription(description);
        this.setFields(embedFields);
    }

    private allGrades(gradesData: any) {

        const subjectsWithGrades = gradesData.flatMap((g: any) => g.grades.length ? [g] : []);
        const subjectsAverage = subjectsWithGrades.map((g: any) => g.averageSemester);
        const subjectsAverageSum = subjectsAverage.reduce((a: number, b: number) => a + b, 0);
        const averageSemester = (subjectsAverageSum / subjectsAverage.length).toFixed(2);

        const embedFields: EmbedField[] = gradesData.map((s: any) => {
            return {
                name: s.subject,
                value: s.averageSemester ? s.averageSemester.toFixed(2) : "/",
                inline: true
            }
        });
        return { embedFields, description: `Semester average ${bold(averageSemester)}`, subjectName: "All subjects" }
    }

    private selectedSubject(allSubjects: any, selectedSubject: string) {

        const fuse = new Fuse(allSubjects, { keys: ["subject"] });

        const foundSubjects = fuse.search<any>(selectedSubject);
        if (foundSubjects.length) {
            const subject = foundSubjects[0].item;

            const embedFields: EmbedField[] = subject.grades.map((g: any) => {
                return {
                    name: `${new Date(g.date).toLocaleDateString()} - ${g.type}`,
                    value: `${bold(g.grade.toFixed(2))} - ${g.weight}%`,
                    inline: false
                }
            });


            return { embedFields, description: subject.averageSemester ? `Average: ${bold(subject.averageSemester.toFixed(2))}` : "/", subjectName: subject.subject as string}

        } else return this.allGrades(allSubjects);


    }
}

export class TimerEmbed extends InfoEmbed {
    constructor(timer: any) {
        super();
        this.setTitle("Study Timer");
        this.setDescription("Your Study Timer. Use the Buttons or the Commands to control it.");
        console.log(timer);
        this.addField("Study Time", timer.studyTime.toString(), true);
        this.addField("Break Time", timer.breakTime.toString(), true);
    }
}