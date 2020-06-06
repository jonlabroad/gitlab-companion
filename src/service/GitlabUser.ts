export interface GitlabUser {
    id: number
    name: string
    username: string
    state: string
    avatar_url: string
    web_url: string
    created_at: string
    bio: string
    location: string
    public_email: string
    skype: string
    linkedin: string
    twitter: string
    website_url: string
    organization: string
    job_title: string
    work_information: null,
    last_sign_in_at: string
    confirmed_at: string
    last_activity_on: string
    email: string

    // There's other stuff we don't need
}

