import gql from 'graphql-tag';

export const ConsultationProfile = gql`
  query consultationProfile($id: Int!) {
    consultationProfile(id: $id) {
      id
      title
      summary
      summaryHindi {
        id
        components
      }
      page {
        id
        components
      }
      responseRounds{
        active
        id
        questions {
          id
          isOptional
          questionText
          questionType
          supportsOther
          isOptional
          subQuestions {
            id
            questionText
          }
        }
        roundNumber
      }
      responseDeadline
      readingTime
      responsesReadingTimes
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
      reviewType
      satisfactionRatingDistribution
      status
      sharedResponses(sort: templates_count, sortDirection: desc) {
        edges {
          node {
            id
            answers
            consultation {
              id
              responseRounds{
                active
                id
                questions {
                  id
                  isOptional
                  questionText
                  questionType
                  supportsOther
                  isOptional
                  subQuestions {
                    id
                    questionText
                  }
                }
                roundNumber
              }
            }
            downVoteCount
            responseText
            isVerified
            roundNumber
            templatesCount
            upVoteCount
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
      publishedAt
      visibility
    }
  }
`;

export const ConsultationProfileCurrentUser = gql`
  query consultationProfileCurrentUser($id: Int!) {
    consultationProfile(id: $id) {
      anonymousResponses {
        edges {
          node {
            id
            roundNumber
            user {
              id
            }
          }
        }
      }
      enforcePrivateResponse
      id
      title
      summary
      summaryHindi {
        id
        components
      }
      page {
        id
        components
      }
      responseDeadline
      readingTime
      responsesReadingTimes
      responseRounds{
        active
        id
        questions {
          id
          isOptional
          questionText
          questionType
          supportsOther
          isOptional
          subQuestions {
            id
            questionText
          }
        }
        roundNumber
      }
      responseSubmissionMessage
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
      reviewType
      satisfactionRatingDistribution
      status
      respondedOn
      sharedResponses(sort: templates_count, sortDirection: desc) {
        edges {
          node {
            id
            answers
            consultation {
              id
              responseRounds{
                active
                id
                questions {
                  id
                  isOptional
                  questionText
                  questionType
                  supportsOther
                  isOptional
                  subQuestions {
                    id
                    questionText
                  }
                }
                roundNumber
              }
            }
            downVoteCount
            responseText
            isVerified
            roundNumber
            templatesCount
            upVoteCount
            user {
              id
              firstName
              profilePicture(resolution: "") {
                id
                url
              }
            }
            votedAs {
              id
              voteDirection
            }
          }
        }
        totalCount
      }
      updatedAt
      publishedAt
      visibility
    }
  }
`;

export const VoteCreateQuery = gql `
  mutation voteCreate($consultationResponseVote: VoteCreateInput!) {
    voteCreate(consultationResponseVote: $consultationResponseVote) {
      id
      voteDirection
    }
  }
`

export const VoteDeleteQuery = gql `
  mutation voteDelete($consultationResponseId : Int!) {
    voteDelete(consultationResponseId : $consultationResponseId )
  }
`;

export const SubmitResponseQuery = gql`
  mutation consultationResponseCreate($consultationResponse: ConsultationResponseCreateInput!){
    consultationResponseCreate(consultationResponse: $consultationResponse){
      id
      points
      user {
        id
        firstName
      }
      consultation {
        enforcePrivateResponse
        id
        title
        respondedOn
        responseSubmissionMessage
        responseRounds{
          active
          id
          questions {
            id
            isOptional
            questionText
            questionType
            supportsOther
            isOptional
            subQuestions {
              id
              questionText
            }
          }
          roundNumber
        }
        satisfactionRatingDistribution
        sharedResponses(sort: templates_count, sortDirection: desc) {
          edges {
            node {
              id
              answers
              consultation {
                id
                responseRounds{
                  active
                  id
                  questions {
                    id
                    isOptional
                    questionText
                    questionType
                    supportsOther
                    isOptional
                    subQuestions {
                      id
                      questionText
                    }
                  }
                  roundNumber
                }
              }
              downVoteCount
              responseText
              isVerified
              roundNumber
              templatesCount
              upVoteCount
              user {
                id
                firstName
                profilePicture(resolution: "") {
                  id
                  url
                }
              }
              votedAs {
                id
                voteDirection
              }
            }
          }
          totalCount
        }
        visibility
      }
    }
  }
`;

export const ConsultationAnalysisQuery = gql`
  query consultationAnalysis($id: Int!) {
    consultationAnalysis(id: $id)
  }
`;



