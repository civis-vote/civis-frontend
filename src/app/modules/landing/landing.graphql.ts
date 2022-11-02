import gql from 'graphql-tag';

export const ConsultationResponseList = gql`
  query consultationResponseList($sort: ConsultationResponseSorts!, $sortDirection: SortDirections) {
    consultationResponseList(sort: $sort, sortDirection: $sortDirection){
      data {
        id
        responseText
        isVerified
        consultation {
          id
          title
        }
        user {
          id
          firstName
          profilePicture {
            id
            url
          }
        }
      }
      paging {
        currentPage
        totalPages
        totalItems
      }
    }
  }
`;

export const ImpactStats = gql`
  query ImpactStats {
    impactStats
  }
`;


export const LeaderListQuery = gql`
  query userList($roleFilter: [UserRoles!], $sort: UserSorts, $sortDirection: SortDirections) {
    userList(roleFilter: $roleFilter, sort: $sort, sortDirection: $sortDirection) {
      data {
        id
        firstName
        points
        profilePicture (resolution: "300X400>") {
          id
          filename
          url
        }
      }
    }
  }
`