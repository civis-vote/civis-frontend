import gql from 'graphql-tag';
export const GlossaryWord = gql`
  query glossaryWord($id: Int!) {
    glossaryWord(id: $id) {
      wordindex {
        word
        description
      }
    }
  }
`
