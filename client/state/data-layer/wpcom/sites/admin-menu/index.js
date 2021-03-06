/**
 * Internal Dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import { receiveAdminMenu } from 'calypso/state/admin-menu/actions';
import { getSite } from 'calypso/state/sites/selectors';

export const requestFetchAdminMenu = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

const sanitizeUrl = ( url, site ) => {
	const isSafeInternalUrl = new RegExp( '^/' ).test( url );
	const isSafeSiteDomainUrl = new RegExp( `^https?://${ site?.domain }` ).test( url );
	if ( isSafeInternalUrl || isSafeSiteDomainUrl ) {
		return url;
	}

	return '';
};

const sanitizeMenuItem = ( menuItem, site ) => {
	if ( ! menuItem ) {
		return menuItem;
	}

	let sanitizedChildren;
	if ( Array.isArray( menuItem.children ) ) {
		sanitizedChildren = menuItem.children.map( ( subMenuItem ) =>
			sanitizeMenuItem( subMenuItem, site )
		);
	}

	return {
		...menuItem,
		url: sanitizeUrl( menuItem.url, site ),
		...( sanitizedChildren ? { children: sanitizedChildren } : {} ),
	};
};

export const handleSuccess = ( { siteId }, menuData ) => ( dispatch, getState ) => {
	if ( ! Array.isArray( menuData ) ) {
		return dispatch( receiveAdminMenu( siteId, menuData ) );
	}

	// Sanitize menu data.
	const site = getSite( getState(), siteId );
	return dispatch(
		receiveAdminMenu(
			siteId,
			menuData.map( ( menuItem ) => sanitizeMenuItem( menuItem, site ) )
		)
	);
};

export const handleError = () => {
	return null;
};

registerHandlers( 'state/data-layer/wpcom/admin-menu/index.js', {
	[ ADMIN_MENU_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFetchAdminMenu,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );
