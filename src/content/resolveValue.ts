import type { ResumeProfile } from "../shared/types";
import type { DataKey } from "./aliasDictionary";

export function getValueForKey(profile: ResumeProfile, key: DataKey): string {
  switch (key) {
    case "name":
      return profile.basicInfo.name;
    case "gender":
      return profile.basicInfo.gender;
    case "birthDate":
      return profile.basicInfo.birthDate;
    case "phone":
      return profile.basicInfo.phone;
    case "email":
      return profile.basicInfo.email;
    case "city":
      return profile.basicInfo.city;
    case "hometown":
      return profile.basicInfo.hometown;
    case "ethnicity":
      return profile.basicInfo.ethnicity;
    case "politicalStatus":
      return profile.basicInfo.politicalStatus;
    case "targetPosition":
      return profile.intention.targetPosition;
    case "expectedSalary":
      return profile.intention.expectedSalary;
    case "expectedCity":
      return profile.intention.expectedCity;
    case "availableTime":
      return profile.intention.availableTime;
    case "school":
      return profile.education.length === 1 ? profile.education[0].school : "";
    case "major":
      return profile.education.length === 1 ? profile.education[0].major : "";
    case "degree":
      return profile.education.length === 1 ? profile.education[0].degree : "";
    case "gpa":
      return profile.education.length === 1 ? profile.education[0].gpa : "";
    case "company":
      return profile.work.length === 1 ? profile.work[0].company : "";
    case "position":
      return profile.work.length === 1 ? profile.work[0].position : "";
    case "projectName":
      return profile.project.length === 1 ? profile.project[0].name : "";
    case "role":
      return profile.project.length === 1 ? profile.project[0].role : "";
    case "techStack":
      return profile.project.length === 1 ? profile.project[0].techStack : "";
    case "selfEvaluation":
      return profile.selfEvaluation;
  }
}
