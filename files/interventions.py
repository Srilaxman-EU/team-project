import torch
import torch.nn.functional as F

def predict(model, seq):
    model.eval()
    with torch.no_grad():
        logits = model(seq.unsqueeze(0)) #adding a batch dimension
        return F.softmax(logits, dim=1)[0]#we convert the logits into probabilities

def remove_event(seq, pos):
    s = torch.cat([seq[:pos], seq[pos+1:]])
    return torch.cat([torch.zeros(1, dtype=torch.long), s])[:-1]

def causal_effect(model, seq, pos):
    p_orig = predict(model, seq)[1]
    p_new = predict(model, remove_event(seq, pos))[1]
    return (p_orig - p_new).item() #computing delta
