import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrls: ["./about-us.component.scss"],
})
export class AboutUsComponent {
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

  teamMembers = [
    {
      name: "Akalya V",
      image: "assets/images/about-us/Akalya V.jpeg",
      description: "Associate, Communications",
      href: "https://www.linkedin.com/in/akalya-veerappan-b9b346203",
      class: "long-description",
    },
    {
      image: "assets/images/team/Alaksha-Dhakite.jpg",
      name: "Alaksha Dhakite",
      description: "Associate, Partnerships",
      href: "https://www.linkedin.com/in/alaksha-dhakite-19822b164/",
      class: "long-description",
    },
    {
      name: "Antaraa Vasudev",
      image: "assets/images/about-us/Antaraa Vasudev.jpeg",
      description: "Founder & CEO",
      href: "https://www.linkedin.com/in/antaraavasudev/",
      class: "long-description",
    },
    {
      name: "Atharva Joshi",
      image: "assets/images/about-us/Atharva Joshi.jpeg",
      description: "Senior Product Manager",
      href: "https://www.linkedin.com/in/atharva-joshi-b80356153",
      class: "long-description",
    },
    {
      name: "Gargi Surana",
      image: "assets/images/team/Gargi-Surana.jpg",
      description: "Associate, Governance",
      href: "https://www.linkedin.com/in/gargisurana/",
      class: "long-description",
    },
    {
      name: "Hetvi Chheda",
      image: "assets/images/about-us/Hetvi Chheda.jpeg",
      description: "Senior Associate, Governance",
      href: "https://www.linkedin.com/in/hetvi-chheda-ab50b1192",
      class: "long-description",
    },
    {
      name: "Sukirat Kaur",
      image: "assets/images/team/Sukirat-Kaur.jpg",
      description: "Consultation Fellow",
      href: "https://www.linkedin.com/in/sukirat-kaur-6a816820b/",
      class: "long-description",
    },
    {
      name: "Swetha A N",
      image: "assets/images/team/Swetha-A-N.jpg",
      description: "Administrative Officer",
      href: "https://www.linkedin.com/in/swetha-anantha-narayanan-9511871b4/",
      class: "long-description",
    },
    {
      name: "Vagda Galhotra",
      image: "assets/images/about-us/Vagda Galhotra.jpeg",
      description: "Senior Associate, Outreach and Comms",
      href: "https://www.linkedin.com/in/vagda-galhotra-320a04269",
      class: "long-description",
    },
  ];

  pastPartners = [
    {
      image: "assets/images/about-us/government-partners/1. Government of Maharashtra.jpg",
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
      image: "assets/images/about-us/government-partners/4. Karmayogi Bharat.webp",
      alt: "Karmayogi Bharat",
    },
    {
      image: "assets/images/about-us/government-partners/5. Manipur State Rural Livelihoods Mission.png",
      alt: "Manipur State Rural Livelihoods Mission",
    },
    {
      image: "assets/images/about-us/government-partners/6. Securities and Exchange Board of India.png",
      alt: "Securities and Exchange Board of India",
    },
    {
      image: "assets/images/about-us/government-partners/7. Maharashtra State Innovaiton Society.png",
      alt: "Maharashtra State Innovation Society",
    },
    {
      image: "assets/images/about-us/government-partners/8. Central Board of Secondary Education.png",
      alt: "Central Board of Secondary Education",
    },
    {
      image: "assets/images/about-us/government-partners/9. National Institute of Urban Affairs.png",
      alt: "National Institute of Urban Affairs",
    },
    {
      image: "assets/images/about-us/government-partners/10. Supreme Court E-committee.png",
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
}
