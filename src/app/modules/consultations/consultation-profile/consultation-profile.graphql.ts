import gql from 'graphql-tag';

const ConsultationPartnerResponsesFragment = gql`
  fragment ConsultationPartnerResponsesFragment on ConsultationPartnerResponseType {
    responseCount
    organisation {
      createdAt
      employeeCount
      id
      name
      officialUrl
      updatedAt
      logo {
        filename
        id
        url
      }
    }
  }
`;

const SubQuestionFragment = gql`
  fragment SubQuestionFragment on BaseQuestionType {
    id
    questionText
    hindiQuestionText
    odiaQuestionText
  }
`;

const QuestionFragment = gql`
  fragment QuestionFragment on BaseQuestionType {
    id
    isOptional
    questionText
    hindiQuestionText
    odiaQuestionText
    questionType
    supportsOther
    subQuestions {
      ...SubQuestionFragment
    }
  }
  ${SubQuestionFragment}
`;

export const ConsultationProfile = gql`
  query consultationProfile($id: Int!) {
    consultationProfile(id: $id) {
      id
      title
      showDiscussSection
      isSatisfactionRatingOptional
      summary
      hindiTitle
      odiaTitle
      englishSummary
      hindiSummary
      odiaSummary
      responseRounds {
        active
        id
        questions {
          ...QuestionFragment
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
        hindiName
        odiaName
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
              responseRounds {
                active
                id
                questions {
                 ...QuestionFragment
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
      consultationPartnerResponses {
        ...ConsultationPartnerResponsesFragment
      }
    }
  }
  ${ConsultationPartnerResponsesFragment}
  ${QuestionFragment}
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
      showDiscussSection
      isSatisfactionRatingOptional
      hindiTitle
      odiaTitle
      summary
      englishSummary
      hindiSummary
      odiaSummary
      responseDeadline
      readingTime
      responsesReadingTimes
      responseRounds {
        active
        id
        questions {
          ...QuestionFragment
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
        hindiName
        odiaName
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
              responseRounds {
                active
                id
                questions {
                  ...QuestionFragment
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
      consultationPartnerResponses {
        ...ConsultationPartnerResponsesFragment
      }
    }
  }
  ${ConsultationPartnerResponsesFragment}
  ${QuestionFragment}
`;



export const ConsultationProfileUser = gql`
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
      isSatisfactionRatingOptional
      summary
      englishSummary
      hindiTitle
      odiaTitle
      hindiSummary
      odiaSummary
      responseDeadline
      readingTime
      responsesReadingTimes
      responseRounds{
        active
        id
        questions {
          ...QuestionFragment
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
        hindiName
        odiaName
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
                  ...QuestionFragment
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
          }
        }
        totalCount
      }
      updatedAt
      publishedAt
      visibility
    }
  }
  ${QuestionFragment}
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

export const CreateUserCountRecord = gql`
  mutation userCountCreate($userCount:UserCountInput!){
    userCountCreate(userCount: $userCount){
      userId
      profanityCount
      shortResponseCount
    }
  }
`;

export const UpdateUserCountRecord = gql`
  mutation userCountUpdate($userCount:UserCountInput!){
    userCountUpdate(userCount: $userCount){
      userId
      profanityCount
      shortResponseCount
    }
  }
`;

export const UserCountUser = gql`
  query userCountUser($userId: Int!){
    userCountUser(userId: $userId){
      userId
      profanityCount
      shortResponseCount
    }
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
           ...QuestionFragment
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
                    ...QuestionFragment
                  }
                  roundNumber
                }
              }
              downVoteCount
              responseText
              responseStatus
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
  ${QuestionFragment}
`;


export const SubmitResponseGuestUser = gql`
  mutation consultationResponseCreate($consultationResponse: ConsultationResponseCreateInput!){
    consultationResponseCreate(consultationResponse: $consultationResponse){
      id
      points
      consultation {
        enforcePrivateResponse
        id
        title
        responseSubmissionMessage
        responseRounds{
          active
          id
          questions {
           ...QuestionFragment
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
                    ...QuestionFragment
                  }
                  roundNumber
                }
              }
              downVoteCount
              responseText
              responseStatus
              isVerified
              roundNumber
              templatesCount
              upVoteCount
            }
          }
          totalCount
        }
        visibility
      }
    }
  }
  ${QuestionFragment}
`;

export const ConsultationAnalysisQuery = gql`
  query consultationAnalysis($id: Int!) {
    consultationAnalysis(id: $id)
  }
`;



