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

export const UserNotificationAnalysisQuery = gql`
  query userNotificationAnalysis($userId: Int!){
    userNotificationAnalysis(userId: $userId)
  }
`;
