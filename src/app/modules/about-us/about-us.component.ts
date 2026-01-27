import { Component, OnInit } from "@angular/core";
import { Apollo } from "apollo-angular";
import { map } from "rxjs/operators";
import { TeamMemberListQuery } from "./about-us.graphql";
import { ErrorService } from "src/app/shared/components/error-modal/error.service";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrls: ["./about-us.component.scss"],
})
export class AboutUsComponent implements OnInit {
  teamMembers: [];
  advisors: [];

  atCivisCards = [
    {
      text: "Aggregate all open laws seeking feedback",
      image: "assets/images/about-us/Image.png",
    },
    {
      image: "assets/images/about-us/Image-1.png",
      text: "Simplify these laws in easy to understand language",
    },
    {
      image: "assets/images/about-us/Image-2.png",
      text: "Translate them in local languages",
    },
    {
      image: "assets/images/about-us/Image-3.png",
      text: "Reach out to individuals and gather inputs on these laws",
    },
    {
      text: "Build Government capacity",
      normalText:
        " to run effective Consultations and gather actionable insights",
      image: "assets/images/about-us/Traced/Image.png",
      isSpecialCard: true,
    },
    {
      text: "Analyse and share citizen's feedback with the Government",
      image: "assets/images/about-us/Image-4.png",
    },
  ];

  pastPartners = [
    {
      image:
        "assets/images/about-us/government-partners/1. Government of Maharashtra.jpg",
      alt: "Government of Maharashtra",
    },
    {
      image: "assets/images/about-us/government-partners/2. BMC.jpg",
      alt: "BMC",
    },
    {
      image: "assets/images/about-us/government-partners/3. OCAC.jpg",
      alt: "OCAC",
    },
    {
      image:
        "assets/images/about-us/government-partners/4. Karmayogi Bharat.webp",
      alt: "Karmayogi Bharat",
    },
    {
      image:
        "assets/images/about-us/government-partners/5. Manipur State Rural Livelihoods Mission.png",
      alt: "Manipur State Rural Livelihoods Mission",
    },
    {
      image:
        "assets/images/about-us/government-partners/6. Securities and Exchange Board of India.png",
      alt: "Securities and Exchange Board of India",
    },
    {
      image:
        "assets/images/about-us/government-partners/7. Maharashtra State Innovaiton Society.png",
      alt: "Maharashtra State Innovation Society",
    },
    {
      image:
        "assets/images/about-us/government-partners/8. Central Board of Secondary Education.png",
      alt: "Central Board of Secondary Education",
    },
    {
      image:
        "assets/images/about-us/government-partners/9. National Institute of Urban Affairs.png",
      alt: "National Institute of Urban Affairs",
    },
    {
      image:
        "assets/images/about-us/government-partners/10. Supreme Court E-committee.png",
      alt: "Supreme Court E-committee",
    },
    {
      image: "assets/images/about-us/government-partners/11. NITI Aayog.jpg",
      alt: "NITI Aayog",
    },
    {
      image: "assets/images/about-us/government-partners/12. GMDA.webp",
      alt: "GMDA",
    },
    {
      image: "assets/images/about-us/government-partners/13. IChangeMyCity.png",
      alt: "IChangeMyCity",
    },
  ];

  resources = [
    {
      title: "‘Climate Voices’",
      description:
        "A Handbook on Citizen Participation in Environmental and Climate Policy Making",
      href: "https://www.civis.vote/consultations/473/read",
      buttonText: "Read more",
    },
    {
      title: "#ChooMacchar",
      description:
        "Civis’ Public Health Campaign in Mumbai aimed at vector-borne disease prevention",
      href: "https://www.choomacchar.org/",
      buttonText: "Visit the website",
    },
    {
      title: "Other Projects",
      description:
        "A Dropbox folder containing information on all past projects and resources created by Civis",
      href: "https://www.dropbox.com/sh/850awii49ra92vt/AACdQazph6iNUNtUT1gSTzg_a?dl=0",
      buttonText: "See our work",
    },
  ];

  constructor(
    private apollo: Apollo,
    private errorService: ErrorService,
  ) {}

  ngOnInit() {
    this.getTeamMembers();
    this.getAdvisors();
  }

  getTeamMembers() {
    this.apollo
      .query({
        query: TeamMemberListQuery,
        variables: {
          memberTypeFilter: "team",
        },
      })
      .pipe(map((res: any) => res.data.teamMemberList.data))
      .subscribe(
        (teamMembers) => {
          this.teamMembers = teamMembers.length ? teamMembers : [];
        },
        (err) => {
          this.errorService.showErrorModal(err);
        },
      );
  }

  getAdvisors() {
    this.apollo
      .query({
        query: TeamMemberListQuery,
        variables: {
          memberTypeFilter: "advisory",
        },
      })
      .pipe(map((res: any) => res.data.teamMemberList.data))
      .subscribe(
        (advisors) => {
          this.advisors = advisors.length ? advisors : [];
        },
        (err) => {
          this.errorService.showErrorModal(err);
        },
      );
  }
}
