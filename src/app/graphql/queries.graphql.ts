import gql from 'graphql-tag';

export const CurrentUser = gql`
query getCurrentUser{
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
    isVerified
    createdAt
    email
    firstName
    lastName
    notifyForNewConsultation
    newsletterSubscription
    phoneNumber
    profilePicture (resolution: "100X100") {
      id
      url
    }
    rank
    responses(sort: created_at, sortDirection: asc) {
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
              logo (resolution : "100X100") {
                url
              }
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
query profanityList{
  profanityList {
    data {
      profaneWord
    }
  }
}
`;

export const GeoCountryCode = gql`
query geoCountryCode {
  geoCountryCode
}
`;
