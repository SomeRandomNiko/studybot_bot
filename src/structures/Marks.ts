import { createCanvas } from "canvas";
import { Chart, ChartDataset } from "chart.js";
import 'chartjs-adapter-moment';
import chroma from "chroma-js";
import { Collection } from "discord.js";
import { getGrades } from "./ApiService";

const gradesCache = new Collection<string, { grades: StudybotApi.Grades, timeout: NodeJS.Timeout }>();

export async function getCachedGrades(userId: string) {
    const cached = gradesCache.get(userId);
    if (cached) {
        clearTimeout(cached.timeout);
        const timeout = setTimeout(() => gradesCache.delete(userId), 60000);
        cached.timeout = timeout;
        return cached.grades;
    } else {
        const grades = new StudybotApi.Grades(await getGrades(userId));
        const timeout = setTimeout(() => gradesCache.delete(userId), 10000);
        gradesCache.set(userId, { grades, timeout });
        return grades;
    }
}

export namespace StudybotApi {
    const canvas = createCanvas(600, 400)
    const ctx = canvas.getContext('2d')
    const gradesChart = new Chart(ctx, {
        type: "line",
        data: { datasets: [] },
        options: {
            color: "#ffffff",
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    ticks: {
                        color: "#ffffff",
                    },
                    grid: {
                        color: chroma.css("white").alpha(.2).hex("rgba")
                    }
                },
                y: {
                    max: 11,
                    min: 3,
                    ticks: {
                        stepSize: 1,
                        color: "#ffffff",
                    },
                    grid: {
                        color: chroma.css("white").alpha(.2).hex("rgba")
                    }
                }
            }
        }
    });


    export class Mark {
        constructor(public mark: number, public weight: number, public date: Date, public subjectName: string, public type: string) { }
    }

    const sortMarksByDate = (a: Mark, b: Mark) => a.date < b.date ? -1 : 1;

    export class Subject {
        constructor(public subjectName: string, public marks: Mark[] = []) { }

        get marksByDate() {
            return this.marks.sort(sortMarksByDate);
        }

        get hasMarks() {
            return !!this.marks.length
        }

        get chartLineCoordinates() {
            return this.marksByDate.map(m => {
                return {
                    x: m.date as any,
                    y: m.mark,
                }
            })
        }

        get semesterAverage() {
            const nums = this.marks.map(m => m.mark);
            const weights = this.marks.map(m => m.weight);
            const [sum, weightSum] = weights.reduce(
                (acc, w, i) => {
                    acc[0] = acc[0] + nums[i] * w;
                    acc[1] = acc[1] + w;
                    return acc;
                },
                [0, 0]
            );
            return sum / weightSum;
        }

        private get chartDataset(): ChartDataset<"line"> {
            const color = chroma.css("white");
            return {
                label: this.subjectName,
                data: this.chartLineCoordinates,
                backgroundColor: color.hex("rgb"),
                borderColor: color.darken(.2).hex("rgb"),
                cubicInterpolationMode: 'monotone',
                tension: 0.6,
                pointRadius: 0,
            }
        }

        renderChart() {
            gradesChart.data.datasets = [this.chartDataset];
            gradesChart.update();
            return canvas.createPNGStream();
        }
    }

    export class Grades {

        public subjects: Subject[] = [];

        constructor(gradesData: any[]) {
            gradesData.forEach(subjectData => {
                const marks: Mark[] = subjectData.grades.map((gradeData: any) => {
                    return new Mark(gradeData.grade, gradeData.weight, new Date(gradeData.date), subjectData.subject, gradeData.type);
                })
                this.subjects.push(new Subject(subjectData.subject, marks));
            });
        }

        get subjectNames() {
            return this.subjects.map(s => s.subjectName);
        }

        getSubject(subjectName: string) {
            return this.subjects.find(s => s.subjectName == subjectName);
        }

        get subjectsWithMarks() {
            return this.subjects.filter(s => s.hasMarks);
        }

        get semesterAverage() {
            const sum = this.subjects.reduce((acc, value) => {
                return acc + value.semesterAverage;
            }, 0);
            return sum / this.subjectsWithMarks.length;
        }

        private get chartDatasets(): ChartDataset<"line">[] {
            return this.subjectsWithMarks.map((s, index) => {
                return {
                    label: s.subjectName,
                    data: s.chartLineCoordinates,
                    backgroundColor: chroma.hsl(index / this.subjectsWithMarks.length * 360, .8, .8).hex("rgb"),
                    borderColor: chroma.hsl(index / this.subjectsWithMarks.length * 360, .8, .5).hex("rgb"),
                    cubicInterpolationMode: 'monotone',
                    tension: 0.6,
                    pointRadius: 0,
                }
            })
        }

        renderChart() {
            gradesChart.data.datasets = this.chartDatasets;
            gradesChart.update();
            return canvas.createPNGStream();
        }
    }
}