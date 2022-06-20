import gql from 'graphql-tag';

export const CaseStudiesListQuery = gql`
    query caseStudyList($sort: CaseStudySorts, $sortDirection: SortDirections) {
        caseStudyList(sort: $sort, sortDirection: $sortDirection) {
            data {
                id
                createdBy {
                    id
                    firstName
                }
                createdAt
                ministryName
                name
                noOfCitizens
                url
            }
            paging {
                totalItems
            }
        }
    }
`;

export const ResendEmailConfirmationMutation = gql`
mutation resendEmail($email: String!) {
  authResendVerificationEmail(email: $email)
}
`;
