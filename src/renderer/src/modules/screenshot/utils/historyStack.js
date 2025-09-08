class HistoryStack {
  constructor(initialHistory = []) {
    this.history = initialHistory;
    this.index = initialHistory.length - 1; // pointer to current state
  }

  push(state) {
    // when pushing a new state, drop everything after the current index
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(state);
    this.index = this.history.length - 1;
  }

  undo() {
    if (this.index > 0) {
      this.index -= 1;
      return this.history[this.index];
    }
    return null; // nothing to undo
  }

  redo() {
    if (this.index < this.history.length - 1) {
      this.index += 1;
      return this.history[this.index];
    }
    return null; // nothing to redo
  }

  getHistory() {
    return [...this.history];
  }
}

export default HistoryStack;
