class Data {
  show() {
    console.log("Data");
  }
}

class Meta extends Data {
  show() {
    super.show();
    console.log("Meta");
  }
}

const m = new Meta();
m.show();
