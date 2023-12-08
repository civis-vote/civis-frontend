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
      name: "Antaraa Vasudev",
      image: "assets/images/about-us/Image-6.png",
      description: "Founder & CEO",
      href: "https://www.linkedin.com/in/antaraavasudev/",
      class: "first",
    },
    {
      name: "Atharva Joshi",
      image: "assets/images/about-us/Image-7.png",
      description: "Product Manager",
      href: "https://www.linkedin.com/in/atharva-joshi-b80356153",
      class: "atharva",
    },
    {
      name: "Shachi Nelli",
      image: "assets/images/about-us/Image-9.png",
      description: "Senior Associate, Governance",
      href: "https://www.linkedin.com/in/shachinelli/",
      class: "next",
    },
    {
      name: "Shonottra Kumar",
      image: "assets/images/about-us/Image-10.png",
      description: "Senior Associate, Outreach and Comms",
      href: "https://www.linkedin.com/in/shonottrakumar/",
      class: "next long-description",
    },
    {
      name: "Mallika Dandekar",
      image: "assets/images/about-us/Mallika-Dandekar.png",
      description: "Consultation Fellow",
      href: "https://www.linkedin.com/in/mallikadandekar/",
      class: "next long-description",
    },
    {
      name: "Srushti Punghera",
      image: "assets/images/about-us/Srushti-Punghera.png",
      description: "Associate, Communications",
      href: "https://www.linkedin.com/in/srushti-punghera/",
      class: "next long-description",
    },
    {
      name: "Riddhi Khandhar",
      image: "assets/images/about-us/Riddhi-Khandhar.png",
      description: "Campaign Manager | ChooMacchar",
      href: "https://www.linkedin.com/in/riddhi-khandhar/",
      class: "next long-description",
    },
  ];

  supporters = [
    {
      image: "assets/images/about-us/godrej 1 1.png",
      alt: "Godrej",
      href: "https://godrejcp.com/",
    },
    {
      image: "assets/images/about-us/ll 1 1.png",
      alt: "LAL FAMILY FOUNDATION",
    },
    {
      image: "assets/images/about-us/Manuputra 1.png",
      alt: "Manupatra",
      href: "https://www.manupatrafast.com/?t=desktop",
    },
    {
      image: "assets/images/about-us/rnp 1 1.png",
      alt: "ROHINI NILEKANI PHILANTHROPIES",
      href: "https://rohininilekaniphilanthropies.org/",
    },
    {
      image: "assets/images/about-us/SVP-India.png",
      alt: "SVP INDIA",
      href: "https://svpindia.org/",
    },
  ];

  pastPartners = [
    {
      image: "assets/images/about-us/NIUA_Logo_new 1 1.png",
      alt: "National Institute of Urban Affairs",
      href: "https://medium.com/civis-vote/engaging-communities-in-the-future-of-indias-cities-7b795ecb99a5",
    },
    {
      image: "assets/images/about-us/logo (1) 1 1.png",
      alt: "CBSE",
      href: "https://medium.com/civis-vote/enabling-educators-learnings-from-a-consultation-10b084fafba4",
    },
    {
      image: "assets/images/about-us/MSInS_Logo 1 1.png",
      alt: "MSInS",
      href: "https://twitter.com/MSInSociety/status/1656238177018064896",
    },
    {
      image: "assets/images/about-us/gmda_logo_trans 1 1.png",
      alt: "GMDA",
      href: "https://medium.com/civis-vote/building-dialogue-a-new-beginning-for-citizens-engagement-6caff57672be",
    },
    {
      image: "assets/images/about-us/NITI_Aayog_logo 1 1.png",
      alt: "NITI AAYOG",
      href: "https://medium.com/civis-vote/justice-delivery-goes-digital-826938401e1",
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
