/**
 * External dependencies
 */
import { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
} from 'calypso/state/action-types';
import { ReduxDispatch } from 'calypso/state/redux-store';
import { HttpAction, License, PartnerPortalStore } from 'calypso/state/partner-portal';
import { getActivePartnerKey } from 'calypso/state/partner-portal/partner/selectors';

// Required for modular state.
import 'calypso/state/partner-portal/init';

function createRequestAction( action: AnyAction, state: PartnerPortalStore ): HttpAction {
	const partnerKey = getActivePartnerKey( state );

	return {
		...action,
		authToken: partnerKey ? partnerKey.oauth2_token : '',
	};
}

export function fetchLicenses( dispatch: ReduxDispatch, getState: () => PartnerPortalStore ): void {
	dispatch(
		createRequestAction(
			{
				type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
			},
			getState()
		)
	);
}

export function receiveLicenses( licenses: License[] ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE, licenses };
}
