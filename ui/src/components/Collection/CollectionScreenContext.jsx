import React, { Component } from 'react';
import {defineMessages, injectIntl} from 'react-intl';
import queryString from 'query-string';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import Screen from 'src/components/Screen/Screen';
import CollectionContextLoader from 'src/components/Collection/CollectionContextLoader';
import CollectionToolbar from 'src/components/Collection/CollectionToolbar';
import CollectionInfoMode from 'src/components/Collection/CollectionInfoMode';
import CollectionViewsMenu from 'src/components/ViewsMenu/CollectionViewsMenu';
import LoadingScreen from 'src/components/Screen/LoadingScreen';
import ErrorScreen from 'src/components/Screen/ErrorScreen';
import { DualPane, Breadcrumbs } from 'src/components/common';
import { selectCollection } from "src/selectors";

const messages = defineMessages({
  placeholder: {
    id: 'sources.index.filter',
    defaultMessage: 'Search in {label}',
  }
});


class CollectionScreenContext extends Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
  }

  onSearch(queryText) {
    const { history, collection } = this.props;
    const query = {
      'q': queryText,
      'filter:collection_id': collection.id
    };
    history.push({
        pathname: '/search',
        search: queryString.stringify(query)
    });
  }

  render() {
    const { intl, collection, collectionId, activeMode, screenTitle } = this.props;
    const { extraBreadcrumbs, showInfoPane = false} = this.props;

    if (collection.isError) {
      return <ErrorScreen error={collection.error} />;
    }

    if (collection.shouldLoad || collection.isLoading) {
      return (
        <CollectionContextLoader collectionId={collectionId}>
          <LoadingScreen />
        </CollectionContextLoader>
      );
    }

    const placeholder = intl.formatMessage(messages.placeholder);
    const breadcrumbs = (
      <Breadcrumbs onSearch={this.onSearch} searchPlaceholder={placeholder}>
        <Breadcrumbs.Collection collection={collection} />
        {extraBreadcrumbs}
        <Breadcrumbs.Text text={screenTitle} />
      </Breadcrumbs>
    );

    return (
      <CollectionContextLoader collectionId={collectionId}>
        <Screen title={`${screenTitle}: ${collection.label}`}>
          {breadcrumbs}
          <DualPane>
            <DualPane.ContentPane className="view-menu-flex-direction">
              <CollectionViewsMenu collection={collection}
                                   activeMode={activeMode}
                                   isPreview={false} />
              <div className="screen-children">
                {this.props.children}
              </div>
            </DualPane.ContentPane>
            {showInfoPane && (
              <DualPane.InfoPane className="with-heading">
                <CollectionToolbar collection={collection} />
                <CollectionInfoMode collection={collection} />
              </DualPane.InfoPane>
            )}
          </DualPane>
        </Screen>
      </CollectionContextLoader>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { collectionId } = ownProps;
  return {
    collection: selectCollection(state, collectionId)
  };
};

CollectionScreenContext = connect(mapStateToProps, {})(CollectionScreenContext);
CollectionScreenContext = withRouter(CollectionScreenContext);
CollectionScreenContext = injectIntl(CollectionScreenContext);
export default (CollectionScreenContext);
