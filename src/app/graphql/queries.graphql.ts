import gql from 'graphql-tag';

export const CurrentUser = gql`
query userCurrent {
  userCurrent {
    id
    bestRank
    bestRankType
    points
    callbackUrl
    city {
      id
      name
      parent {
        id
        name
      }
    }
    cityRank
    confirmedAt
    createdAt
    email
    firstName
    lastName
    isVerified
    notifyForNewConsultation
    phoneNumber
    profilePicture(resolution: "") {
      id
      url
    }
    rank
    responses(sort: created_at, sortDirection: asc) {
      edges {
        node {
          id
          points
          responseText
          roundNumber
          answers
          isVerified
          user {
            id
            firstName
            profilePicture {
              id
              url
            }
          }
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
            responseRounds {
              active
              id
              questions {
                id
                questionText
                isOptional
                questionType
                subQuestions {
                  id
                  questionText
                }
                supportsOther
              }
              roundNumber
            }
            responseDeadline
          }
        }
      }
    }
    stateRank
  }
}
`;

export const profanityList =  gql`
query{
  profanityList {
    data {
      profaneWord
    }
  }
}
`;
