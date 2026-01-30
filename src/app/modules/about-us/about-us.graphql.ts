import gql from "graphql-tag";

export const TeamMemberListQuery = gql`
  query TeamMemberList($memberTypeFilter: TeamMemberTypes) {
    teamMemberList(memberTypeFilter: $memberTypeFilter) {
      data {
        id
        name
        designation
        memberType
        status
        linkedinUrl
        profilePicture(resolution: "200X200") {
          id
          filename
          url
        }
      }
    }
  }
`;
