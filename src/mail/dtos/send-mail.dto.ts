export type TemplateParams = {
  name: string;
};

export class SendMailDto {
  to: string;
  subject: string;
  template: string;
  context: TemplateParams;
}
