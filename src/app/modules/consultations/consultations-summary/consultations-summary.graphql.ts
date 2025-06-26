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
            marathiQuestionText
            questionType
            supportsOther
            isOptional
            subQuestions {
              id
              questionText
              hindiQuestionText
              odiaQuestionText
              marathiQuestionText
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
      marathiSummary
      responseDeadline
      url
      visibility
      consultationResponsesCount
      ministry {
        id
        name
        category {
          id
          coverPhoto (resolution: "350X285") {
            id
            filename
            url
          }
        }
        logo (resolution: "100X100") {
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
              profilePicture(resolution: "100X100") {
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
