type DraftableEntry = {
  data: {
    draft: boolean;
  };
};

type DraftVisibilityOptions = {
  isDevelopment?: boolean;
  publishDrafts?: boolean;
};

export const shouldPublishBlogEntry = (
  entry: DraftableEntry,
  options: DraftVisibilityOptions = {},
) => {
  const isDevelopment = options.isDevelopment ?? import.meta.env.DEV;
  const publishDrafts =
    options.publishDrafts ?? process.env.PUBLISH_DRAFTS === 'true';

  return isDevelopment || publishDrafts || !entry.data.draft;
};
