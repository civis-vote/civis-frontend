import gql from 'graphql-tag';

export const ConsultationList = gql`
  query consultationList($perPage: Int, $page: Int, $statusFilter: String, $featuredFilter: Boolean) {
    consultationList(perPage: $perPage, page: $page, statusFilter: $statusFilter, featuredFilter: $featuredFilter) {
      paging {
        totalItems
      }
    }
  }
`;

export const ConsultationListAllData = gql`
  query consultationList($perPage: Int, $page: Int, $statusFilter: String, $featuredFilter: Boolean, $sort: ConsultationSorts, $sortDirection: SortDirections ) {
    consultationList(perPage: $perPage, page: $page, statusFilter: $statusFilter, featuredFilter: $featuredFilter, sort: $sort, sortDirection: $sortDirection) {
      data {
        id
        title
        createdAt
        consultationResponsesCount
        updatedAt
        responseDeadline
        ministry {
          id
          category {
            id
            coverPhoto (resolution: "350X285>") {
              id
              filename
              url
            }
          }
          name
          locationId
        }
        status
      }
      paging {
        currentPage
        totalPages
        totalItems
      }
    }
  }
`

export const UserNotificationAnalysisQuery = gql`
  query userNotificationAnalysis($userId: Int!){
    userNotificationAnalysis(userId: $userId)
  }
`;
