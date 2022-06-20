import gql from 'graphql-tag';

export const ResponseProfileQuery = gql`
    query consultationResponseProfile($id: Int!){
        consultationResponseProfile(id: $id){
            id
            answers
            responseText
            isVerified
            createdAt
            updatedAt
            consultation {
                id
                title
                summary
                responseDeadline
                url
                consultationResponsesCount
                ministry {
                  id
                  category {
                    id
                    coverPhoto {
                      id
                      filename
                      url
                    }
                  }
                  name
                  logo {
                    id
                    filename
                    url
                  }
                }
                satisfactionRatingDistribution
                sharedResponses(sort: created_at, sortDirection: desc) {
                  totalCount
                }
                updatedAt
                publishedAt
            }
        }
    }
`
