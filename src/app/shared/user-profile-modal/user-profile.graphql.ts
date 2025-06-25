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
        profilePicture (resolution: "100x100") {
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
                    logo (resolution : "100x100") {
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

