import GitlabProject from "../service/GitlabProject";

export const mockProjects: GitlabProject[] = [
    {
        id: 1,
        name: "git-chrome-extension",
        name_with_namespace: "Lab Road Technology / Endeavor Squad / git-chrome-extension",
        path: "Lab Road Technology/Endeavor Squad/git-chrome-extension",
        path_with_namespace: "Lab Road Technology/Endeavor Squad/git-chrome-extension",
        avatar_url: "https://upload.wikimedia.org/wikipedia/commons/2/21/VideoWiki_Logo_Symbol.svg"
    } as GitlabProject,
    {
        id: 2,
        name: "Flight Control Interface",
        name_with_namespace: "Lab Road Technology / Atlantis / Flight Control Interface",
        path: "Lab Road Technology/Atlantis/Flight Control Interface",
        path_with_namespace: "Lab Road Technology/Atlantis/Flight Control Interface",
        avatar_url: "https://svgsilh.com/png/1295381-3f51b5.png"
    } as GitlabProject,
    {
        id: 3,
        name: "Quantum Assembler",
        name_with_namespace: "Lab Road Technology / Europa Squad / Quantum Assembler",
        path: "Lab Road Technology/Europa Squad/Quantum Assembler",
        path_with_namespace: "Lab Road Technology/Europa Squad/Quantum Assembler",
        avatar_url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Wiki_3.svg"
    } as GitlabProject,
]