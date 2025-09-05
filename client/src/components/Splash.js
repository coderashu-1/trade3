import React, { Component } from "react";
import logo from "../assets/wsb_logo.png";
import splashImage from "../assets/splash-image.png";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { login } from "../actions/authActions";
import { clearErrors } from "../actions/errorActions";
import {
  Button,
  Nav,
  Row,
  Col,
  Navbar,
  Image,
  Modal
} from "react-bootstrap";
import { Redirect, Link } from "react-router-dom";

class Splash extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    msg: null,
    alertOpen: false,
    showPolicy: true,       // 👈 default: show modal
    policyAccepted: false   // 👈 track acceptance
  };

  static propTypes = {
    isAuthenticated: PropTypes.bool,
    error: PropTypes.object.isRequired,
    login: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired
  };

  componentDidMount() {
    // 👇 If already accepted once, don’t show again
    const accepted = localStorage.getItem("policyAccepted");
    if (accepted === "true") {
      this.setState({ showPolicy: false, policyAccepted: true });
    }
  }

  handleAcceptPolicy = () => {
    this.setState({ showPolicy: false, policyAccepted: true });
    localStorage.setItem("policyAccepted", "true");
  };

  componentDidUpdate(prevProps) {
    const { error } = this.props;
    if (error !== prevProps.error) {
      if (error.id === "LOGIN_FAIL") {
        this.setState({ msg: error.msg.msg });
      } else {
        this.setState({ msg: null });
      }
    }
  }

  handleAlert = () => {
    alert(this.state.msg);
    this.props.clearErrors();
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    if (this.props.isAuthenticated === true) {
      return <Redirect push to="/" />;
    }

    return (
      <div style={{ width: "100%", overflowX: "hidden" }}>
        {/* Privacy Policy Modal */}
        <Modal
          show={this.state.showPolicy}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header>
            <Modal.Title>Privacy Policy & Terms</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Welcome to <strong>TradeGo.Live</strong>. By using our platform,
              you agree to our Privacy Policy and Terms of Service. 
            </p>
            <p>
             End User License Agreement - ARK Technologies LTD EULA, Terms and Conditions

I have read the following Terms and Conditions, including ARK’s Policies.

-       I understand all such terms and that these Terms and Conditions, together with all policies are an inseparable part of a binding agreement between me and ARK Technologies LTD (the “Agreement”).

-       I am over 18 and the information provided in this application is true and correct and that I will notify ARK Technologies LTD of any material changes.

-       ARK Technologies LTD may not be able to ascertain the appropriateness of any product to me, including due to lack of experience or undisclosed information.

-       I have entered full, accurate and truthful details, including my residential address and identity.

-       Futures, Options, Stocks and other type of scripts that my broker offers to me and other Currency trading all have large potential rewards, but they also have large potential risk. You must be aware of the risks and be willing to accept them in order to invest in these markets. Don’t trade with money you can’t afford to lose, and I’m trading with this broker and IB at my own risk.

-       Before I begin carrying out transactions with Ark Trader electronic system, I understand the rules and provisions of the stock exchange offering the system, or of the financial instruments listed that you intend to trade, as well as my broker’s conditions. Online trading has inherent risks due to system responses/reaction times and access times that may vary due to market conditions, system performance and other factors, and on which I have no influence. I’m aware of these additional risks in electronic trading before I carry out investment transactions, and I’m trading with Ark Trader at my own risk.

-       ARK Technologies LTD may at any time without limitation amend any of the terms set out in this agreement by posting such information on our website.


This End User License Agreement (“EULA”) is an agreement between you the end user (“You” or “User” interchangeably) and ARK Technologies LTD, an FZE corporation incorporated in JORDAN, its subsidiaries and affiliates (“Licensor”).  This EULA governs your use of ARK Trading Platform and all related software, ARK Trading Add-Ons, Application Programming Interfaces (“API”), programs, documentation, and updates and upgrades that replace or supplement the Software and are not distributed with a separate license (together the “Software”). This Software is licensed to you free of charge. You do not own this Software. By installing or using the Software, you consent to be bound by this EULA. IF YOU DO NOT AGREE TO EACH AND EVERY TERM OF THIS EULA, THEN YOU MAY NOT INSTALL OR USE THE SOFTWARE OR IF IT HAS ALREADY BEEN INSTALLED THEN YOU MUST DELETE THE SOFTWARE FROM YOUR COMPUTER AND/OR OTHER DEVICE(S).

 

The following terms and conditions govern all access to and use of the Software. By installing and/or using the Software you accept without limitations or alterations, each and every term and condition contained herein. THIS AGREEMENT IS A BINDING CONTRACT AND INCLUDES TERMS THAT MIGHT LIMIT YOUR LEGAL RIGHTS AND LICENSOR’S LIABILITY TO YOU. CONSULT YOUR ATTORNEY BEFORE AGREEING IF YOU DO NOT UNDERSTAND ANY OF THE TERMS HERE.

 

1. GRANT OF LICENSE

 

1.1 Subject to Your acceptance and ongoing compliance with the terms of this EULA, Licensor grants you a limited non-exclusive, non-transferable and revocable right and license to install and use a copy of ARK Trading Platform in multiple computers and/or supported devices. This license is restricted to your personal non-commercial use or if User is a corporate entity for the use of its employees in the course of each individual's employment.  This license permits you to make one copy of Software for backup or archival purposes only. Any copying and/or redistribution or alternatively facilitating in redistribution of the Software is strictly prohibited without the prior express written consent by Licensor. You are acquiring no right to use, and shall not use, without Licensor's prior written consent, the terms or existence of this EULA, the names, characters, artwork, designs, trade names, copyrighted materials, trademarks or service marks of ARK Technologies LTD, its affiliates, agents, vendors and licensors. Software is provided in object code form only.

 

2. SCOPE OF LICENSE & LIMITATIONS

 

2.1  You shall not (a) use, copy, merge, make derivative works of or transfer copies of the Software, except as specifically authorized in this EULA; (b) use the backup or archival copy of the Software (or permit any third party to use such copy) for any purpose other than to replace the original copy in the event that it is destroyed or becomes defective; (c) rent, lease, sublicense, distribute, transfer, copy, modify or timeshare the Software or any of your rights under this EULA, except as expressly authorized in this EULA; (d) provide unauthorized third parties with access to or use of the Software; (e) reverse engineer, disassemble, decompile or otherwise attempt to access the source code of the Software, except and only to the extent that such activity is expressly permitted by applicable law; or (f) use the Software after any termination or cancellation of this license granted in Grant of License Section set herein.

 

2.2 The Software is not intended for distribution to, or use by, any person in any country or jurisdiction where such distribution or use would be contrary to local law or regulation. It is your responsibility to ascertain the terms of the EULA and comply with any local law or regulation to which you are subject. You shall not use or permit anyone to use the Software for any unlawful or unauthorized purpose.

 

2.3 Nothing in this EULA shall provide You with any proprietary rights in the Software or any information provided in the Software including but not limited to any promotional material.

 

3. THIRD PARTIES

 

3.1 The Software may provide you with the ability to access a variety of information, market data feeds, FIX/DDE supporting data feeds, materials, trading strategies, trading recommendations or any other content or offer for any type of services from third parties ("Third-Party Content"), including plugins within the Software created by independent third parties (“Software Plug-Ins”) and various sets of programming instructions and standards that allow access to a web-based software application or Application Programming Interface (“API”) tailored to the customized trading needs of Brokers and/or Users and are designed specifically for the Software by licensed Vendors in Licensor’s ISV network (“Software Compatible API”) and through links to other websites and forums on which users or other third parties, themselves, may post Third-Party Content. Whenever you access Third Party Content and/or Software Plug-Ins and/or Software Compatible API, YOU PROCEED AT YOUR OWN RISK. You understand and agree that such third parties are solely responsible for any such Third Party Content and/or Software Plug-Ins and/or Software Compatible API and you further agree that Licensor is not, and will not be, liable for any such Third Party Content and/or Software Plug-Ins and/or Software Compatible API and/or other material posted and/or otherwise provided by third parties. You further acknowledge that Licensor does not control the third parties who provide Third-Party Content, Software Plug-Ins, and Software Compatible API and Licensor does not necessarily (and is not obligated to) review or screen any Third-Party Content, Software Plug-Ins, and Software Compatible API either before or after it becomes available through the Software, and cannot and does not guarantee, attest to, verify, or otherwise warrant that any Third-Party Content Software Plug-Ins, and Software Compatible API is or will be accurate; free from errors, defects or harmful elements; consistent with what it purports to be; appropriate to fit your needs; or otherwise safe or non-objectionable. You agree that Licensor shall not be held liable for any trading activities or other activities that occur on any website you access through Third Party Content, Software Plug-Ins or Software Compatible API. Licensor allows these Third-Party Content, Software Plug-Ins or Software Compatible API as a convenience, and does not endorse and hereby disclaim liability from any and all content or services offered by these Third-Party Content, Software Plug-Ins or Software Compatible API.

 

3.2 User hereby acknowledges and agrees that the Software may incorporate into, and may incorporate itself, software and other technology owned and controlled by third parties. The Software will only incorporate such third-party software or technology for the purpose of (a) adding new or additional functionality or (b) improving the technical performance of the Software. Any such third-party software or technology that is incorporated in the Software falls under the scope of this EULA. Any and all other third-party software or technology that may be distributed together with Software will be subject to you explicitly accepting a license agreement with that third party. User acknowledges and agrees that he/she will not enter into a contractual relationship with Licensor regarding such third-party software or technology and User will look solely to the applicable third party and not to Licensor to enforce any rights.

 

3.3 Licensor shall not be responsible to provide any support to any Software Plug-Ins or Software Compatible API.

 

4. ACKNOWLEDGEMENT OF RISK BY USER

 

4.1 Risk Warning! User hereby affirms that he/she understands that trading in financial instruments carries a substantial level of risk and may result in a loss of all invested capital. It may be not suitable for all investors; please ensure that you understand your investment objectives, level of experience, risk appetite and, IF NECESSARY, SEEK ADVICE FROM AN INDEPENDENT AND PROFESSIONAL FINANCIAL ADVISOR.

 

4.2 User hereby affirms that he/she has investigated and understands the risk of loss associated with online trading in financial instruments. Risk of loss includes but is not limited to: (a) loss of computer connection to the internet, (b) computer hardware or software failure of any kind, (c) poor performance of any trading strategies, systems, trade plans, Software Plug-Ins, Software Compatible API or other components, (d) trade execution failures, (e) the Software's inability or failure to place protective broker stops on any position, (f) Broker disconnections, (g) failure of the Software or system to reconnect to a broker (g) errors or omissions in the Software, (h) inability of User to properly configure and use the Software for any purpose, (i) Acts of God, and (j) any other circumstance or failures not listed above that result in one or more losses. User hereby affirms that nothing in the Software or Software Plugins or Software Compatible API can reduce or remove any risk of loss mentioned herein.

 

4.3 In certain cases, the protections of your money transferred for purposes of trading in financial instruments, may have impact in the event of the specific firm/company going insolvent or bankrupt. The extent to which you may recover money may be governed by specific legislation or local rules. In some jurisdictions, property/money which has been specifically identifiable as your own property/money, will be appropriated in the same manner as cash for purposes of distribution in the event of a shortfall.

 

4.4 You understand that commissions, fees and other charges may be applicable by your Broker; as defined in Section 7.1 herein, and as such these charges will affect/reduce the profit (if any), or increase the loss. Before trading in financial instruments, you should make yourself aware of all charges for which you will be liable, whether such charges are at predetermined amount or variable.

 

4.5 You understand that the profit or loss for transactions in foreign currency-denominated contracts will be affected by the fluctuations in currency rates when there is a need to convert from the currency denomination of the contract into another currency.

 

4.6 You understand that Licensor does not guarantee access to the Software to be available at all times, or in any given location at any specific time.

 

4.7 All transactions effected for your account(s) are at your sole risk and you shall be solely liable under all circumstances. Licensor will not be held responsible for any delays in transmission, delivery or execution of your request(s) due to malfunctions of communications facilities or any other causes.

 

4.8 You understand that there is the risk that the financial instruments may be or become the subject to tax and/or any other applicable due amount(s) as per legislation, which will become your responsibility to carry out.

 

4.9 YOU SPECIFICALLY ACKNOWLEDGE THAT THE LICENSOR SHALL NOT BE LIABLE FOR ANY TRADING LOSSES ARISING OUT OR RELATED TO YOU USING OR NOT USING OF THE SOFTWARE, AND THAT THE RISK OF HARM OR DAMAGE FROM THE FOREGOING RESTS ENTIRELY WITH YOU.

 

      5. GENERAL DISCLAIMERS

 

5.1 Licensor does not guarantee the accuracy, timeliness, completeness or correct sequencing of the Software or any information or content included in them or provided through them, or warrant any results from your use or reliance on the Software. The Software, Software Plug-Ins, and Software Compatible API may quickly become unreliable for various reasons including, for example only, changes in market conditions or economic circumstances. Licensor is not obligated to update any information or opinions contained in any materials of a third party or any Third Party Content, Software Plug-Ins, and Software Compatible API in the Software, and Licensor may discontinue or change any offering of Licensor at any time without notice. Without derogating from the generality of the above, Licensor is not liable to any discrepancies between information posted on any website or platform (whether or not owned by Licensor) and any information extracted from your account.

 

5.2 You agree that Licensor will not be liable in any way for the termination, interruption, delay or inaccuracy of the Software, Software Plug-Ins and Software Compatible API regardless of the reason for the same and you will not have any claims against Licensor in this respect.

 

5.3 Licensor will not be liable in any way to you in the event of failure of or damage or destruction to your computer, data or records or any part thereof, or for delays, losses, errors or omissions resulting from the failure or mismanagement of any communications or computer equipment or software.

 

5.4 You understand that while the Internet and the World Wide Web are generally reliable, technical problems or other conditions may delay or prevent you from accessing or using the Software. Licensor shall not be liable, and you agree not to hold or seek to hold Licensor or any of its agents liable, for any technical problems, Software failures and malfunctions, communication line failures, equipment or software failures or malfunctions, Software access issues, Software capacity issues, high Internet traffic demand, security breaches and unauthorized access, any technical problems related to services or products you receive from the broker or from other third parties, any issues with trading platforms and terminals, internet service providers, other computer, software or network related problems and defects and/or any other factors outside of Licensor's exclusive control.

 

5.5 Licensor does not represent, warrant or guarantee that you will be able to access or use the Software, Software Plug-Ins or the Software Compatible API at times or locations of your choosing, or that Licensor will have adequate capacity for the Software as a whole or in any geographic location. Licensor does not represent, warrant or guarantee that the Software will provide uninterrupted and error-free service and will not be liable to any down-time (whether scheduled or not).

 

5.6 The risk of loss in trading in all financial instruments, including but not limited to, Forex, Binary Options, CFDs, and/or metals can be substantial. You should therefore carefully consider whether such trading is suitable for you in light of your financial condition. When trading on margin, you may sustain a total loss of the initial margin funds and any additional funds that you may deposit with your broker to establish or maintain a position in the market. Before deciding to trade and/or invest, you should carefully consider your objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not trade or invest money that you cannot afford to lose.

 

5.7 User acknowledge that certain features of the Software such as, but limited to, ARK Trader Risk Management Bridge can still carry an exposure to risk despite the fact that they were designed to reduce risk of trading and is provided to you “AS IS”, with all faults, without warranty of any kind, without performance assurances or guarantees of any kind, and YOUR USE IS AT YOUR SOLE RISK.

 

5.8 You fully understand and agree that the financial markets are subject to numerous implicit and explicit risks, none of which Licensor can control or influence. You therefore acknowledge and agree that all trading is solely at your own risk. You should be aware of all the risks associated with trading and you should seek advice from an independent and professional financial advisor before trading. You understand that there can be no guarantee that your use of the Software or the information, strategies or recommendations as displayed on plug-ins or any other Third-Party Content, Software Plug-Ins, or Software Compatible API disseminated by or on the Software will result in profits. Further, you understand that your use of the Software or the information, strategies or recommendations as displayed on any Third-Party Content, Software Plug-Ins, or Software Compatible API disseminated by or on the Software may result in substantial losses.

 

5.9 Licensor is not a registered broker-dealer or an investment advisor. The Software do not constitute and do not include any personal investment advice, which of necessity must be tailored to your particular means and needs. All recommendations and/or strategies provided on Third Party Content, Software Plug-Ins and Software Compatible API are publicly available and provide specific predictions based on proprietary software. The Software and any strategies and/or recommendations posted on it as Third-Party Content, Software Plug-Ins and Software Compatible API are for informational purposes only and are provided without warranty of any kind, on a strictly "as is" and "as available" basis.

 

5.10 Licensor does not guarantee to provide any support or maintenance services of any kind. You acknowledge that you are solely responsible for your own investment, purchase or trading decisions, that the Software are only one tool amongst many that you should use in making your investment, purchase or trading decisions and that Licensor will not be responsible for any decision made or action taken based on information strategies or recommendations as displayed on Third Party Content, Software Plug-Ins or Software Compatible API provided by or disseminated through the Software. Licensor do not and cannot guarantee that adherence to using the Software will generate you profits. Licensor do not and cannot take responsibility for any losses to your accounts. You must trade and take sole responsibility to evaluate all information, strategies or recommendations as displayed Third Party Content, Software Plug-Ins and Software Compatible API provided by the Software and use them at your own risk.

 

5.11 From time to time, acting reasonably, Licensor shall have the right to add to, modify, or remove any component or feature of the Software without liability under this EULA. Licensor, in its sole discretion, shall use reasonable endeavors to replace any component of the Software with an equivalent where it deems practicable. User shall accept such modifications as part of this EULA.

 

6. DISCLAIMER OF WARRANTIES

 

6.1 TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, THE SOFTWARE IS PROVIDED TO YOU “AS IS,” WITH ALL FAULTS, WITHOUT WARRANTY OF ANY KIND, WITHOUT PERFORMANCE ASSURANCES OR GUARANTEES OF ANY KIND, AND YOUR USE IS AT YOUR SOLE RISK. THE ENTIRE RISK OF SATISFACTORY QUALITY AND PERFORMANCE RESIDES WITH YOU. LICENSOR DOES NOT MAKE, AND HEREBY DISCLAIM, ANY AND ALL EXPRESS, IMPLIED OR STATUTORY WARRANTIES, INCLUDING IMPLIED WARRANTIES OF CONDITION, UNINTERRUPTED USE, MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, NONINFRINGEMENT OF THIRD PARTY RIGHTS, AND WARRANTIES (IF ANY) ARISING FROM A COURSE OF DEALING, USAGE, OR TRADE PRACTICE. LICENSOR DOES NOT WARRANT AGAINST INTERFERENCE WITH YOUR ENJOYMENT OF THE SOFTWARE; THAT THE SOFTWARE WILL MEET YOUR REQUIREMENTS; THAT OPERATION OF THE SOFTWARE WILL BE UNINTERRUPTED OR ERROR-FREE, OR THAT THE SOFTWARE WILL BE INTEROPERATE OR THAT THE SOFTWARE WILL BE COMPATIBLE WITH THIRD PARTY SOFTWARE OR THAT ANY ERRORS IN THE SOFTWARE WILL BE CORRECTED. NO ORAL OR WRITTEN ADVICE PROVIDED BY LICENSOR OR ANY AUTHORIZED REPRESENTATIVE SHALL CREATE A WARRANTY.

 

7. RELATION TO BROKERS

 

7.1 A Broker is an individual or entity that User may have a contractual relationship with to trade in the products and financial instruments the Broker offers at his/her system, with either OTC or STP model, and that the Broker decides. The Software provided by Licensor without any Feed or Liquidity Providers. Both the Feed and Liquidity Providers are defined and configured based on the Broker’s specific setup at his/her sole responsibility. The entire agreement that governs the relationship between ARK Technologies LTD and any Broker licensed by Licensor to sublicense the Software is available at <http://arktechltd.com/termsandconditions.pdf>. User hereby acknowledges that he/she understands that the relationship between the Broker and Licensor is that of a Software Licensor/Software Licensee relationship only.

7.2 User hereby acknowledges that the Licensor and your Broker are separate legal entities. There is no partnership or agency relationship between the Licensor and your Broker. User hereby acknowledges and understands that Broker shall not represent that he/she has any authority to assume or create any obligation, express or implied, on behalf of the Licensor, nor to represent the Licensor as agent, employee, franchisee, or in any other capacity. Both Broker and User hereby acknowledge and agree that the Licensor is allowed to answer transparently any inquiry about Broker and/or User made by any governmental or regulatory authority within the circumstances of this EULA.

 

7.3 Licensor shall not be liable for any actions or statements made by the Broker to the User.

 

7.4 You are solely responsible for being in full compliance with any terms and conditions, agreements, policies and guidelines imposed on you and your account by the broker providing you a trading account and any trading services. You are solely responsible for ensuring that you alone control access to your Broker account and to ensure that no other person is granted access to trading in your account. In any case, you alone remain fully liable for any and all positions traded on your broker account. When subscribing to a product or service offered by the Broker, the User must follow all the technical requirements in order to use the Software.

 

7.5 Licensor shall not be responsible for any damage or expense incurred by you as a result of issues related to your engagement with the Broker, including, without limitations, in case your account is suspended, blocked, closed, terminated, etc. or in case of any errors, unauthorized transactions or other trading related issues, lack of sufficient funds, software or hardware problems, etc. including if as a result of which the Software cannot be used, are not functional or are not performing according to their specifications.

 

7.6 Licensor shall not be involved in any dispute between you and your Broker and shall have no liability in this respect. You shall fully indemnify Licensor for any damage, loss or expenses incurred by Licensor in connection with the above.

 

7.7 Furthermore, ARK Technologies LTD does not approve or endorse the Broker or any of its programs. Any information, advice, views and opinions provided through Broker are expressly attributed to the Broker and/or the speaker, and do not necessarily reflect the views or opinions of ARK Technologies LTD or its affiliates.

 

7.8 Licensor's Software can be accessed through various brokerage services using different platforms and other software tools with different characteristics and technical definitions. Licensor shall not be liable to any problems or other issues resulting from the above, including without limitations, with respect to different trade instruments names (symbols), different spreads, lots, etc. You should consult your Broker with respect to any such issues and make sure you take such issues into consideration in making your trading decisions.

 

8. LIMITATION ON LIABILITY

 

8.1 It is hereby clarified that the Licensor, its managers, employees, shareholders and any entity on its behalf, acting on the Software, do not claim to advise any person with regards to whether or not the purchase, sale, holding or investment in any or all financial instruments is worthwhile. Therefore, the information appearing on the Software, it’s notices, its feed,  data, plug-ins or other materials appearing therein, including but not limited to Third Party Content, Software Plug-Ins or Software Compatible API shall not be viewed as a recommendation or opinion on the subject, and any person making a decision based on information appearing on the Software is doing so at his/her own risk. The User proclaims that he/she is aware that nothing in the Software can replace advice which takes into account his/her person information and needs and/or any other person’s, and that investment in foreign currency can lead to tremendous losses. The Licensor, its managers, employees, and anyone acting on its behalf or through Third Party Content, Software Plug-Ins or Software Compatible API on its Software, may have personal interest in any subject contained on the Third Party Content, Software Plug-Ins or Software Compatible API available on its Software and it is possible that they own foreign currency and/or options with respect to foreign currency.

 

8.2 It is the User’s responsibility to verify that performance of the transactions and use of the Software does not negate any law or rule which apply to him, and to fulfill any legal obligation effective with respect to him/her and resulting from the use of the Software, and shall not make any use of the Software which is against any law.

8.3 The User is solely responsible for all transactions performed in his account, including all deposit and withdrawal transactions and is responsible for the safekeeping of his account password. The User shall be solely responsible for any harm caused as a result of an action or non-action by the User which will lead to inappropriate or unwanted behavior in his/her account.

8.4 It is further clarified that the directors in the Licensor, its employees and agents, are not responsible to any event of damage and/or expense caused to the User, including without limitation loss of profit and/or any other damage, direct or indirect, and/or circumstantial in connection with the performance of transactions over the Software, and the User proclaims that he/she is personally responsible to any risk caused thereto through the use of the Software.

8.5 Nothing in this Clause 8.5 excludes or limits the liability of Licensor for:

8.5.1 fraud or fraudulent misrepresentation;

8.5.2 death or personal injury caused by Licensor's (or its employees’, agents’ or sub-contractors’) negligence; or

8.5.3 any matter for which it is not permitted by law to exclude or limit, or to attempt to exclude or limit, its liability.

Without prejudice to clauses 8.5.1 to 8.5.3 (inclusive), the following provisions set out the entire financial liability of Licensor (including any liability for the acts or omissions of its employees, agents and subcontractors) arising out of or in connection with this EULA, whether in contract, tort, misrepresentation, under statute or otherwise, howsoever caused including (without limitation) by negligence and also including (without limitation) any liability arising from a breach of, or a failure to perform or defect or delay in performance of, any of Licensor’s obligations under this EULA.

 

8.6 Licensor shall not be liable for any loss or damage caused to the User except to the extent that such loss or damage is caused by the negligent acts or negligent omissions of or a breach of any contractual duty by Licensor, its employees, agents or sub-contractors in performing its obligations under this EULA and in such event Licensor’s maximum aggregate liability arising out of or in connection with this EULA, whether in contract, tort, misrepresentation, under statute or otherwise, howsoever caused including (without limitation) by negligence and also including (without limitation) any liability arising from a breach of, or a failure to perform or defect or delay in performance of, any of Licensor’s obligations under this EULA, shall be limited to $1000 (one thousand dollars).

 

8.7 Subject to Clause 8.5 and 8.6, Licensor shall not be liable to the other parties for any:

8.7.1 indirect, consequential and/or special loss or damage;

8.7.2 loss of profit (direct or indirect);

8.7.3 loss of revenue, loss of production or loss of business (in each case whether direct or indirect);

8.7.4 loss of goodwill, loss of reputation, or loss of opportunity (in each case whether direct or indirect);

8.7.5 loss of anticipated saving or loss of margin (in each case whether direct or indirect);

8.7.6 wasted management, operational or other time (in each case whether direct or indirect); and/or

8.7.7 liability of any of the other parties to third parties (whether direct or indirect),

arising out of or in connection with this EULA, whether in contract, tort, misrepresentation, under statute or otherwise, howsoever caused including (without limitation) by negligence and also including (without limitation) any liability arising from a breach of, or a failure to perform or defect or delay in performance of, any of Licensor’s obligations under this EULA.

 

8.8 Licensor shall not be liable in any way to the User for acting in accordance with the terms of this EULA and specifically (without limitation) for acting upon any notice, written request, waiver, consent, receipt, statutory declaration or any other document furnished to it pursuant to and in accordance with this EULA.

8.9 Licensor shall not be required to make any investigation into, and shall be entitled in good faith without incurring any liability to the User assume (without requesting evidence thereof) the validity, authenticity, veracity and due and authorized execution of any documents, written requests, waivers, consents, receipts, statutory declarations or notices received by it in respect of this EULA.

 

8.10 Consequential Damages Waiver. Licensor shall not have any liability for incidental, consequential, indirect, special or punitive damages or liabilities of any kind or for loss of revenue, loss of business or other financial loss arising out of or in connection with this EULA, regardless of the form of the action, whether in contract, tort (including negligence), strict product liability or otherwise, even if any representative of a party hereto has been advised of the possibility of such damages and even if any limited remedy specified in this EULA is deemed to have failed its essential purpose.

 

8.11 Limitation of Liability is a material term of this EULA. User agrees that the provisions in this EULA that limit liability are essential terms of this EULA. The foregoing limitations of liability apply even if any remedies described in this EULA fail in their essential purpose.  

9. INTELLECTUAL PROPERTY

9.1 You agree that ARK Technologies LTD and its affiliated entities and/or its licensor(s), as applicable, own all right, title and interest in and to the Software, including, without limitations, to any intellectual property rights in the above and including any inventions, ideas, know how, patents and patent applications, software (whether object code or source code), copyrights, trade secrets, databases, algorithms, robots, trading signals, strategies, recommendations, processes, plans, data, information and any related documentation and including to any enhancements, developments and improvements to the above.

 

9.2 All rights to any trade names, trademarks, service marks, logos, domain names, and other distinctive brand features of ARK Trading Platform and ARK Technologies LTD ("Marks") presented or included in the Software are the property of their respective owners or license holders, as applicable. Except as otherwise provided in this EULA, Licensor does not grant to you any right, title or interest (including, but not limited to, any implied licenses) in or to such materials or rights and nothing in this EULA gives you a right to use any Marks.

 

10. USER’S REPRESENTATIONS & WARRANTIES

 

10.1 User hereby represents and warrants that: (a) if User is a natural person, User is of sound mind, legal age and legal competence (b) if User is not a natural person, 1. User is duly organized and validly existing under the applicable laws of the jurisdiction of its organization; 2. Performance of all obligations contemplated under this EULA and all other transactions contemplated hereunder have been duly authorized by User; and 3. Each person performing all other transactions contemplated hereunder on behalf of the User, has been duly authorized by User to do so; and, (c) User hereby warrants that regardless of any subsequent determination to the contrary, User is suitable to trade OTC; and, (d) User is not now an employee of any exchange, any corporation in which any exchange owns a majority of the capital stock, any member of any exchange and/or firm registered on any exchange, or any bank, trust, or insurance company, and in the event that User becomes so employed, User will promptly notify us, (e) User has read and understands the provisions contained in this EULA, including, without limitation, Licensor’s Risk Disclosure Statement, ISV, and Privacy Statement; and (f) User will review this EULA; and (g) User agrees that in effecting any transaction he/she is deemed to represent that he/she has read and understands this EULA as in effect at the time of such transaction; and (h) User agrees to, and shall at all times comply with all applicable laws, statutes and regulations and User hereby declares that the installation and use of the Software and all other transactions contemplated hereunder, and performance of all of User’s rights and obligations contemplated under this EULA and any other transaction contemplated hereunder, will not violate any statute, rule, regulation, ordinance, charter, by-law or policy applicable to User (k) User shall promptly inform Licensor of ay breaches or potential breaches by User of any term of this EULA. USER MAY NOT USE THE SOFTWARE FOR ANY ILLEGAL ACTIVITY.

 

10.2 Licensor shall not be responsible for verifying and/or checking that User actually have such knowledge and/or experience, nor shall Licensor be responsible for any damage and/or loss incurred by User as a result of insufficient knowledge or experience.

 

10.3 User hereby acknowledges that it is his/her responsibility to maintain in proper order the appropriate computer hardware, operating system, sufficient back up means, appropriate virus protection/security checks and pay any relevant third-party software programs to prevent damages and/or unauthorized access to his/her account on the Software.

 

10.4 User hereby agrees to only use the Software and Software Compatible API for lawful purposes and on the terms agreed upon in this EULA. User hereby represents and warrants that he/she, and his/her Broker would be at all times when using the Software and Software Compatible API in full compliance with all applicable anti-money laundering laws and anti-terrorism laws. The Software shall not to be used where it is illegal to use, and Licensor reserves the right to refuse or cancel services to anyone at Licensor’s sole discretion. The Software does not constitute, and may not be used for the purposes of, an offer and/or solicitation to anyone in any jurisdiction in which such offer and/or solicitation is not authorized, and/or to any person to whom it is unlawful to make such an offer and/or solicitation.

 

11 INDEMNITY

 

11.1 In return for the Grant of License as provided herein to install and use the Software, User accepts all risk of loss as a result of such use or operation of the Software, Software Plug-Ins, and Software Compatible API and agrees to indemnify and hold harmless the Licensor, its directors, its officers, employees, heirs or assigns against any and all losses suffered as a result of the use or operation of the Software, Software Plug-Ins, and Software Compatible API . User agrees not to transfer, sell, or provide Software to any other individual or entity, or trade another individual's or entity's brokerage account or currency trading account using the Software, unless said individual or entity has agreed to be bound by the terms of this EULA. 

 

11.2 USER HEREBY AGREES THAT LICENSOR SHALL NOT BE LIABLE TO USER, HIS/HER HEIRS, SUCCESSORS OR ASSIGNS, FOR ANY DAMAGES WHATSOEVER, UNDER ANY LEGAL THEORY WHATSOEVER, WHICH DAMAGES MAY ARISE OUT OF, OR IN ANY WAY RELATE TO, THE USE OF THE SOFTWARE.

 

12. TERM & TERMINATION

 

12.1 The term of this EULA and the license granted to you will shall remain in effect in perpetuity, for so long as User, his/her heirs or assigns operate a version of the Software, or until it is terminated as provided in this Section. Without prejudice to any other rights Licensor may have, the license granted under this EULA will terminate automatically in the event you violate any provision of this EULA or if you terminate your relationship with Licensor by un-installing the Software. In the event of termination, for any reason, you shall delete the Software from your computer and/or devices and either destroy any tangible media containing the Software or return it to ARK Technologies LTD, You understand that Licensor may discontinue technical and customer support for this Software at any time without any recourse by you.

 

13. GOVERNING LAW & JURISDICTION

 

13.1 This EULA is governed by the laws of the Hashemite Kingdom of Jordan, without reference to its principles of conflicts of laws. You expressly agree that exclusive jurisdiction and venue for any claim or dispute with the Licensor relating in any way to Your use of the Software resides in the Courts of Amman, Jordan. You hereby irrevocably consent to the personal and exclusive jurisdiction and venue of these Courts.

 

14. RIGHT TO COMPEL ARBITRATION

 

14.1 YOU AGREE TO PROCEED WITH ARBITRATION SHOULD LICENSOR ELECT TO PROCEED IN SUCH MANNER; HOWEVER, YOU DO NOT HAVE THE SAME OR SIMILAR RIGHT TO COMPEL ARBITRATION. IF YOU FILE A CLAIM IN ANY COURT OF LAW, OR IF YOU AND LICENSOR HAVE A DISPUTE AND NO CLAIM HAS YET BEEN FILED, IN EITHER CASE LICENSOR HAS THE ABSOLUTE RIGHT, SOLELY IN ITS DISCRETION, TO COMPEL THAT DISPUTE TO BE HEARD AND RESOLVED BY BINDING ARBITRATION. HOWEVER, IF LICENSOR DECIDES TO FILE A CLAIM, YOU HAVE NO CORRESPONDING RIGHT TO COMPEL ARBITRATION. ANY SUCH ARBITRATION BETWEEN YOU AND US WILL BE HANDLED AND CONDUCTED BY AND PURSUANT TO THE RULES AND PROCEDURES OF THE JORDAN INTERNATIONAL ARBITRATION CENTER (“DIAC”) USING A THREE MEMBER ARBITRATION PANEL WITH YOU AND WE EACH CHOOSING ONE ARBITRATOR AND THE TWO CHOSEN SELECTING THE THIRD. THE DECISION OF THE ARBITRATORS WILL BE FINAL AND UNAPPEALABLE AND MAY BE ENTERED AS A JUDGMENT IN ANY APPROPRIATE COURT OF LAW. TO THE EXTENT ANY PROVISIONS OF THIS AGREEMENT ARE INCONSISTENT WITH DIAC RULES OR PROCEDURES, SUCH PROVISIONS SHALL PREVAIL TO THE MAXIMUM EXTENT DIAC RULES AND PROCEDURES PERMIT THE PARTIES TO STIPULATE AND OTHERWISE AGREE TO SUCH MATTERS BY CONTRACT

 

15. GENERAL

 

15.1 You acknowledge and agree that each provision of this EULA that provides for a disclaimer of warranties or an exclusion or limitation of damages represents an express allocation of risk, and is an integral part of this EULA.

15.2 Amendment. Licensor shall have the right, at any time and without prior written notice to or consent from User, to add to or modify the terms of this EULA, simply by delivering such amended terms to User by e-mail at the address provided to Licensor by User or by requiring the User to accept an updated EULA upon accessing the Software. User's access to or use of the Software after the date such amended terms are delivered to User shall be deemed to constitute acceptance of such amended terms.

15.3 Waiver. No waiver of any term, provision or condition of this EULA, whether by conduct or otherwise, in any one or more instances, shall be deemed to be, or shall constitute, a waiver of any other term, provision or condition hereof, whether or not similar, nor shall such waiver constitute a continuing waiver of any such term, provision or condition hereof. No waiver shall be binding unless executed in writing by the party making the waiver.

15.4 Severability. If any provision of this EULA is determined to be illegal or unenforceable, then such provision shall be enforced to the maximum extent possible and the other provisions shall remain fully effective and enforceable.

15.5 Force Majeure. If the performance of any part of this EULA by either party is prevented, hindered, delayed or otherwise made impracticable by causes beyond the reasonable control of either party, that party shall be excused from such performance to the extent that it is prevented, hindered or delayed by such causes.

15.6 Language. It is the express wish of the parties that this Agreement and related Schedules be drawn up in the English language. 

15.7 Entire Agreement. This EULA constitutes the complete and exclusive statement of the agreement between the parties with respect to the Software and supersedes any and all prior or contemporaneous communications, representations, statements and understandings, whether oral or written, between the parties concerning the Software.
            </p>
            <p style={{ fontSize: "0.85rem", color: "gray" }}>
              Click "Accept" to continue.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={this.handleAcceptPolicy}>
              Accept
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Show splash content only if accepted */}
        {this.state.policyAccepted && (
          <>
            <Row className="spacer-row" />

            <Row
              className="justify-content-center align-items-center"
              style={{ margin: 0 }}
            >
              <Col xs={12} md={6} className="mb-4 mb-md-0">
                <div
                  className="splash-form-left-div"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  <Row className="justify-content-center">
                    <Image
                      src={logo}
                      alt="TradeGo logo"
                      className="paper-shadow-class splashImageFace"
                      style={{ maxWidth: "120px", height: "auto" }}
                      fluid
                    />
                  </Row>

                  <Row className="mt-3 justify-content-center">
                    <h1 style={{ fontSize: "2rem" }}>TradeGo.Live</h1>
                  </Row>

                  <Row className="justify-content-center">
                    <h5
                      className="text-muted mt-2"
                      style={{ fontStyle: "italic", fontSize: "1rem" }}
                    >
                      Predict. Bet. Earn.
                    </h5>
                  </Row>

                  <Row className="justify-content-center mt-3">
                    <h3 style={{ fontSize: "1.2rem" }}>
                      You could be earning in minutes.
                    </h3>
                  </Row>

                  <Row className="mt-3 justify-content-center">
                    <Link className="green-theme-text" to="/register">
                      <Button
                        className="mr-2 splash-form-button"
                        style={{ marginBottom: "0.5rem", width: "120px" }}
                      >
                        Sign Up
                      </Button>
                    </Link>
                    <Link className="green-theme-text" to="/login">
                      <Button
                        className="ml-2 splash-form-button"
                        style={{ marginBottom: "0.5rem", width: "120px" }}
                      >
                        Log In
                      </Button>
                    </Link>
                  </Row>
                </div>
              </Col>

              {/* Right Image */}
              <Col xs={12} md={6} className="text-center">
                <Image
                  className="splashImage"
                  src={splashImage}
                  alt="splash"
                  style={{ maxWidth: "100%", height: "auto" }}
                  fluid
                />
              </Col>
            </Row>

            {/* Footer */}
            <Navbar
              className="paper-shadow-class footer-bg justify-content-center"
              fixed="bottom"
              style={{ fontSize: "0.8rem", textAlign: "center" }}
            >
              <Nav className="justify-content-center w-100">
                <Nav.Link
                  className="green-theme-text"
                  style={{ fontSize: "0.8rem" }}
                  href="#"
                >
                  TradeGo.Live, a TradeGo Project
                </Nav.Link>
              </Nav>
            </Navbar>
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  error: state.error
});

export default connect(mapStateToProps, { login, clearErrors })(Splash);

