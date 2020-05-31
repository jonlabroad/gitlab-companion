import GitlabProject from "../service/GitlabProject";
import GitlabEvent, { GitlabNote, GitlabPushData } from "../service/GitlabEvent";
import { mockAuthors } from "./MockAuthors";

export const mockEvents: {[key: number]: GitlabEvent[]} = {
    1: [
        {
            project_id: 1,
            action_name: "commented on",
            target_type: "DiffNote",
            author_id: 2,
            target_title: "Feature/linear flow integration",
            created_at: "2020-05-29T19:38:19.145Z",
            author: mockAuthors[1],
            author_username: mockAuthors[1].username,
        
            // "pushed to", "pushed new"
            push_data: undefined,
        
            // "commented on"
            note: {
                author: mockAuthors[1],
                body: "I think that this will cause an issue when integrated with the Borel Ring inductor. It's a bit complicated, I'll swing by your desk",
            } as any
        } as GitlabEvent,
        {
            project_id: 1,
            action_name: "pushed to",
            target_type: "Project",
            author_id: 4,
            target_title: "feature/update G constants",
            created_at: "2020-05-29T17:13:00.145Z",
            author: mockAuthors[4],
            author_username: mockAuthors[4].username,
        
            // "pushed to", "pushed new"
            push_data: {
                action: "created",
                commit_count: 1,
                commit_from: "",
                commit_title: "Update the G constants to reflect the latest samples",
                commit_to: "316674b184b40ceed875f447f37ee12b2febe700",
                ref: "feature/update G constants",
                ref_count: null,
                ref_type: "branch"
            } as GitlabPushData,
        
            // "commented on"
            note: undefined
        } as GitlabEvent
    ],
    2: [
        {
            project_id: 2,
            action_name: "accepted",
            target_type: "Project",
            author_id: 3,
            target_title: "Sanitize input Jacobi Space transformation covariant",
            created_at: "2020-05-29T17:13:00.145Z",
            author: mockAuthors[3],
            author_username: mockAuthors[3].username,
        
            // "pushed to", "pushed new"
            push_data: undefined,
        
            // "commented on"
            note: undefined
        } as GitlabEvent,
        {
            project_id: 2,
            action_name: "commented on",
            target_type: "DiffNote",
            author_id: 4,
            target_title: "feature/no clipping",
            created_at: "2020-05-28T01:07:55.145Z",
            author: mockAuthors[4],
            author_username: mockAuthors[4].username,
        
            // "pushed to", "pushed new"
            push_data: undefined,
        
            // "commented on"
            note: {
                author: mockAuthors[4],
                body: `We should add a sanity-check here for the Wohler method correlator. I used this for the Gehrmen functional, which is pretty similar if you first apply a Poncelet manifold:

                {
                    hammingScale: 1.1,
                    c: 6.4453e3,
                    g: 6884.23,
                    method: \"primary-with-manifold-inverse\"
                }
                `,
            } as any
        } as GitlabEvent,
    ],
    
    3: [
        {
            project_id: 3,
            action_name: "merged",
            target_type: "MergeRequest",
            author_id: 3,
            target_title: "bugfix/fix quasi-almost Minkowski-Kepler vector calculation",
            created_at: "2020-05-29T12:47:09.145Z",
            author: mockAuthors[3],
            author_username: mockAuthors[3].username,
        
            // "pushed to", "pushed new"
            push_data: undefined,
        
            // "commented on"
            note: undefined
        } as GitlabEvent,
        {
            project_id: 3,
            action_name: "pushed to",
            target_type: "Project",
            author_id: 2,
            target_title: "Feature/linear flow integration",
            created_at: "2020-05-29T17:13:00.145Z",
            author: mockAuthors[2],
            author_username: mockAuthors[2].username,
        
            // "pushed to", "pushed new"
            push_data: {
                action: "created",
                commit_count: 1,
                commit_from: "",
                commit_title: "add mock data for local testing",
                commit_to: "316674b184b40ceed875f447f37ee12b2febe700",
                ref: "Feature/linear flow integration",
                ref_count: null,
                ref_type: "branch"
            } as GitlabPushData,
        
            // "commented on"
            note: undefined
        } as GitlabEvent,
        {
            project_id: 3,
            action_name: "deleted",
            target_type: undefined,
            target_id: 1,
            author_id: 1,
            target_title: "bugfix/remove unused code",
            created_at: "2020-05-29T14:13:00.145Z",
            author: mockAuthors[1],
            author_username: mockAuthors[1].username,
        
            // "pushed to", "pushed new"
            push_data: {
                action: "created",
                commit_count: 1,
                commit_from: "",
                commit_title: "Remove Kepler utils",
                commit_to: "316674b184b40ceed875f447f37ee12b2febe700",
                ref: "bugfix/remove unused code",
                ref_count: null,
                ref_type: "branch"
            } as GitlabPushData,
        
            // "commented on"
            note: undefined
        } as GitlabEvent
    ],
}