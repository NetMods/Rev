class HistoryStack {
  constructor(initialHistory = []) {
    this.history = initialHistory;
    this.index = initialHistory.length - 1;
  }

  push(state) {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(state);
    this.index = this.history.length - 1;
  }

  undo() {
    if (this.index > 0) {
      this.index -= 1;
      return this.history[this.index];
    }
    return null;
  }

  redo() {
    if (this.index < this.history.length - 1) {
      this.index += 1;
      return this.history[this.index];
    }
    return null;
  }

  getHistory() {
    return [...this.history];
  }
}

export default HistoryStack;
