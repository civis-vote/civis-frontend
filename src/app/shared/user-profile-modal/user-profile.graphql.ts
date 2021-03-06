import gql from 'graphql-tag';

export const UserProfileQuery = gql`
query userProfile($id: Int!) {
    userProfile(id: $id) {
        id
        city {
            id
            name
            locationType
            parent {
            id
            locationType
            }
        }
        cityRank
        firstName
        points
        profilePicture (resolution: "300X400>") {
            id
            filename
            url
        }
        sharedResponses(sort: created_at, sortDirection: asc) {
            edges {
            node {
                id
                points
                consultation {
                id
                    title
                ministry {
                    id
                    name
                    logo (resolution : "") {
                    url
                    }
                }
                responseDeadline
                }
            }
            }
        }
        rank
        stateRank
    }
}`;

