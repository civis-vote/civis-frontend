import gql from 'graphql-tag';
import { environment } from '../../../../environments/environment';
//TODO: Sort consultations by city feature, remove condition when ready fo deployment to production
//name field is added here to amke sure that fragment is not empty
const fragments = environment.production ? gql `
    fragment ministryFields on Ministry {
      name
      locationId
      hindiName
      odiaName
      marathiName
    }
  `: gql `
    fragment ministryFields on Ministry {
      name
      hindiName
      odiaName
      marathiName
    }
  `

export const ConsultationList = gql`
  query consultationList($perPage: Int, $page: Int, $statusFilter: String, $featuredFilter: Boolean, $sort: ConsultationSorts, $sortDirection: SortDirections ) {
    consultationList(perPage: $perPage, page: $page, statusFilter: $statusFilter, featuredFilter: $featuredFilter, sort: $sort, sortDirection: $sortDirection) {
      data {
        id
        title
        hindiTitle
        odiaTitle
        marathiTitle
        createdAt
        consultationResponsesCount
        updatedAt
        responseDeadline
        ministry {
          id
          hindiName
          name
          odiaName
          marathiName
          category {
            id
            coverPhoto (resolution: "350X285>") {
              id
              filename
              url
            }
          }
          ... ministryFields
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
  ${fragments}
`
