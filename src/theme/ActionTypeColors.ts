import { GitlabAction } from "../service/GitlabEvent";
import GitlabColors from "./GitlabColors";

export const actionTypeColors: Record<GitlabAction, string> = {
    "commented on": GitlabColors.neutral,
    "accepted": GitlabColors.approved,
    "pushed new": GitlabColors.create,
    "pushed to": GitlabColors.current,
    "created": GitlabColors.create,
    "updated": GitlabColors.create,
    "closed": GitlabColors.neutral,
    "opened": GitlabColors.create,
    "reopened": GitlabColors.create,
    "pushed": GitlabColors.add,
    "commented": GitlabColors.neutral,
    "merged": GitlabColors.current,
    "joined": GitlabColors.create,
    "left": GitlabColors.destructive,
    "destroyed": GitlabColors.destructive,
    "deleted" :GitlabColors.destructive,
    "expired": GitlabColors.destructive,
}