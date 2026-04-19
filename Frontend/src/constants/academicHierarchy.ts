export type AcademicBranch = {
    value: string;
    label: string;
};

export type AcademicCourse = {
    value: string;
    label: string;
    branches: AcademicBranch[];
};

export const academicCourses: AcademicCourse[] = [
    {
        value: 'B.Tech',
        label: 'B.Tech',
        branches: [
            { value: 'CSE', label: 'CSE' },
            { value: 'IT', label: 'IT' },
            { value: 'AI/ML', label: 'AI/ML' },
            { value: 'ECE', label: 'ECE' },
            { value: 'EE', label: 'EE' },
            { value: 'CE', label: 'CE' },
            { value: 'ME', label: 'ME' },
            { value: 'Chemical', label: 'Chemical' },
            { value: 'Aerospace', label: 'Aerospace' },
            { value: 'Biomedical', label: 'Biomedical' },
            { value: 'Other', label: 'Other' },
        ],
    },
    {
        value: 'M.Tech',
        label: 'M.Tech',
        branches: [
            { value: 'CSE', label: 'CSE' },
            { value: 'VLSI', label: 'VLSI' },
            { value: 'Power Systems', label: 'Power Systems' },
            { value: 'Structural', label: 'Structural' },
            { value: 'Thermal', label: 'Thermal' },
            { value: 'Communication', label: 'Communication' },
            { value: 'AI/ML', label: 'AI/ML' },
            { value: 'Other', label: 'Other' },
        ],
    },
    {
        value: 'MBA',
        label: 'MBA',
        branches: [
            { value: 'General', label: 'General' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'HR', label: 'HR' },
            { value: 'Operations', label: 'Operations' },
            { value: 'Business Analytics', label: 'Business Analytics' },
            { value: 'Other', label: 'Other' },
        ],
    },
    {
        value: 'BBA',
        label: 'BBA',
        branches: [
            { value: 'General', label: 'General' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'HR', label: 'HR' },
            { value: 'Business Analytics', label: 'Business Analytics' },
            { value: 'Digital Marketing', label: 'Digital Marketing' },
            { value: 'Other', label: 'Other' },
        ],
    },
    {
        value: 'B.Sc',
        label: 'B.Sc',
        branches: [
            { value: 'Physics', label: 'Physics' },
            { value: 'Mathematics', label: 'Mathematics' },
            { value: 'Chemistry', label: 'Chemistry' },
            { value: 'Computer Science', label: 'Computer Science' },
            { value: 'Data Science', label: 'Data Science' },
            { value: 'Other', label: 'Other' },
        ],
    },
    {
        value: 'M.Sc',
        label: 'M.Sc',
        branches: [
            { value: 'Physics', label: 'Physics' },
            { value: 'Mathematics', label: 'Mathematics' },
            { value: 'Chemistry', label: 'Chemistry' },
            { value: 'Computer Science', label: 'Computer Science' },
            { value: 'Data Science', label: 'Data Science' },
            { value: 'Other', label: 'Other' },
        ],
    },
    {
        value: 'Other',
        label: 'Other',
        branches: [
            { value: 'General', label: 'General' },
        ],
    },
];

export const semesterOptions = Array.from({ length: 8 }, (_, index) => String(index + 1));

export const getCourseBranches = (course: string) =>
    academicCourses.find((item) => item.value === course)?.branches ?? [];
