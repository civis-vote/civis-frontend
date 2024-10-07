import gql from 'graphql-tag';

const fragments = {
  responseRounds: gql`
    fragment responseRounds on BaseConsultationType {
        responseRounds {
          active
          id
          questions {
            id
            isOptional
            questionText
            hindiQuestionText
            odiaQuestionText
            questionType
            supportsOther
            isOptional
            subQuestions {
              id
              questionText
              hindiQuestionText
              odiaQuestionText
            }
          }
          roundNumber
        }
    }
  `,
};

export const ConsultationProfileQuery = gql`
  query consultationProfile($id: Int!, $responseToken: String!) {
    consultationProfile(id: $id, responseToken: $responseToken) {
      id
      title
      summary
      englishSummary
      hindiSummary
      odiaSummary
      responseDeadline
      url
      visibility
      consultationResponsesCount
      ministry {
        id
        name
        category {
          id
          coverPhoto {
            id
            filename
            url
          }
        }
        logo {
          id
          filename
          url
        }
      }
      satisfactionRatingDistribution
      responses(sort: created_at, sortDirection: desc, responseToken: $responseToken) {
        edges {
          node {
            id
            answers
            downVoteCount
            responseText
            isVerified
            roundNumber
            consultation {
              id
              ... responseRounds
            }
            templatesCount
            upVoteCount
            visibility
            user {
              id
              firstName
              profilePicture(resolution: "") {
                id
                url
              }
            }
          }
        }
        totalCount
      }
      updatedAt
      ... responseRounds
    }
  }
  ${fragments.responseRounds}
`;
