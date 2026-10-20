type DraftableEntry = {
  data: {
    draft: boolean;
  };
};

const publishDrafts = process.env.PUBLISH_DRAFTS === 'true';

export const shouldPublishBlogEntry = (entry: DraftableEntry) =>
  publishDrafts || !entry.data.draft;
