import {ConfirmBoxInitializer, DialogLayoutDisplay} from "@costlydeveloper/ngx-awesome-popup";

export class ConfirmationAsker {
  static async confirm(message: string): Promise<boolean> {
    const confirmBox = new ConfirmBoxInitializer();
    confirmBox.setTitle('');
    confirmBox.setMessage(message);
    confirmBox.setButtonLabels('YES', 'NO');

    // Choose layout color type
    confirmBox.setConfig({
      LayoutType: DialogLayoutDisplay.NONE// SUCCESS | INFO | NONE | DANGER | WARNING
    });
    return await confirmBox.openConfirmBox$().toPromise().then(resp => resp.ClickedButtonID == 'yes')
  }

  static async confirmTitle(title: string, message: string): Promise<boolean> {
    const confirmBox = new ConfirmBoxInitializer();
    confirmBox.setTitle(title);
    confirmBox.setMessage(message);
    confirmBox.setButtonLabels('YES', 'NO');

    // Choose layout color type
    confirmBox.setConfig({
      LayoutType: DialogLayoutDisplay.NONE// SUCCESS | INFO | NONE | DANGER | WARNING
    });
    return await confirmBox.openConfirmBox$().toPromise().then(resp => resp.ClickedButtonID == 'yes')
  }
}
