import should from "should";
import * as babel from "babel-core";
import sourceMapSupport from "source-map-support";
import * as elasticsearch from "../isotropy-elasticsearch";

sourceMapSupport.install();

function find(tree, path) {
  const parts = path.split("/").slice(1);
  return parts.reduce(
    (acc, p) => (p === "" ? acc : acc.contents.find(x => x.name === p)),
    tree
  );
}

describe("Isotropy FS", () => {
  beforeEach(() => {
    const tree = {
      name: "/",
      contents: [
        {
          name: "docs",
          contents: []
        },
        {
          name: "pics",
          contents: [
            { name: "asterix.jpg", contents: "FFh D8h asterix" },
            { name: "obelix.jpg", contents: "FFh D8h obelix" },
            {
              name: "large-pics",
              contents: [
                {
                  name: "asterix-large.jpg",
                  contents: "FFh D8h asterix"
                },
                {
                  name: "obelix-large.jpg",
                  contents: "FFh D8h obelix"
                },
                {
                  name: "backup",
                  contents: [
                    {
                      name: "asterix-large-bak.jpg",
                      contents: "FFh D8h asterix"
                    },
                    {
                      name: "obelix-large-bak.jpg",
                      contents: "FFh D8h obelix"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    elasticsearch.init("testelastic", tree);
  });

  /* createFile */

  it(`Indexes a document with index`, async () => {
    const es = await es.open("testelastic");
    const resp = await es.index({
      index: "blogs",
      type: "post",
      id: "10",
      body: {
        title: "Eleven",
        content: "This one goes to 11",
        tags: "taggingalong"
      }
    });
    const stored = find(es.__data("testelastic"), "blogs").filter(
      x => x.type === "post" && x.id === "10"
    );

    stored.length.should.equal(1);
    stored[0].id.should.equal("10");
  });

  it(`Indexes a document without an index`, async () => {
    const es = await es.open("testelastic");
    const resp = await es.index({
      index: "blogs",
      type: "post",
      body: {
        title: "Eleven",
        content: "This one goes to 11",
        tags: "taggingalong"
      }
    });
    const stored = find(es.__data("testelastic"), "blogs").filter(
      x => x.type === "post" && x.id === "10"
    );

    stored.length.should.equal(1);
    stored[0].id.should.equal("5");
  });

  it(`Deletes a document`, async () => {
    const es = await es.open("testelastic");
    const resp = await es.remove({
      index: "blogs",
      type: "post",
      body: {
        title: "Eleven",
        content: "This one goes to 11",
        tags: "taggingalong"
      }
    });
    const stored = find(es.__data("testelastic"), "blogs").filter(
      x => x.type === "post" && x.id === "10"
    );

    stored.length.should.equal(1);
    stored[0].id.should.equal("5");
  });

  it(`Gets a document`, async () => {
    const es = await es.open("testelastic");
    const resp = await es.get("3");
    resp.id.should.equal("3");
    resp.title.should.equal("Hello World");
  });
});
