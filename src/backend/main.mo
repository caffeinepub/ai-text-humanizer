import OutCall "http-outcalls/outcall";

actor {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func humanizeText(text : Text) : async Text {
    let apiUrl = "https://external-ai-service.com/humanize";
    await OutCall.httpPostRequest(apiUrl, [], text, transform);
  };

  public shared ({ caller }) func detectAIText(text : Text) : async Text {
    let apiUrl = "https://api.openai.com/v1/moderations";
    await OutCall.httpPostRequest(apiUrl, [], text, transform);
  };
};
