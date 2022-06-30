import { ShippingOption, StoreProfile } from '@bigcommerce/checkout-sdk';
import React, { memo, useCallback, FunctionComponent, useState } from 'react';

import { EMPTY_ARRAY } from '../../common/utility';
import { TranslatedString } from '../../locale';
import LockersMap, { LockersMapProps } from '../../map/lockersMap';
import { Checklist, ChecklistItem } from '../../ui/form';
import { LoadingOverlay } from '../../ui/loading';
import { Modal } from '../../ui/modal';

import StaticShippingOption from './StaticShippingOption';

interface ShippingOptionListItemProps {
    consignmentId: string;
    shippingOption: ShippingOption;
}

const ShippingOptionListItem: FunctionComponent<ShippingOptionListItemProps> = ({
    consignmentId,
    shippingOption,
}) => {
    const renderLabel = useCallback(() => (
        <div className="shippingOptionLabel">
            <StaticShippingOption displayAdditionalInformation={ true } method={ shippingOption } />
        </div>
    ), [shippingOption]);

    return <ChecklistItem
        htmlId={ `shippingOptionRadio-${consignmentId}-${shippingOption.id}` }
        label={ renderLabel }
        value={ shippingOption.id }
    />;
};

export interface ShippingOptionListProps {
    consignmentId: string;
    inputName: string;
    isLoading: boolean;
    selectedShippingOptionId?: string;
    shippingOptions?: ShippingOption[];
    onSelectedOption(consignmentId: string, shippingOptionId: string): void;
    shippingAddress: any;
    config: StoreProfile;
}

const ShippingOptionsList: FunctionComponent<ShippingOptionListProps> = ({
    consignmentId,
    inputName,
    isLoading,
    shippingOptions = EMPTY_ARRAY,
    selectedShippingOptionId,
    onSelectedOption,
    shippingAddress,
    config
 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [innoshipData, setInnoshipData] = useState({} as LockersMapProps);

    const handleSelect = useCallback(async (value: string) => {
        console.log(shippingOptions, value);
        //console.log('CART: ', cart);
        const option = shippingOptions?.filter((item: any) => item.id === value);
        if (option?.length) {
            const [courier, service] = option[0].description.split(' ');
            console.log(`Courier: ${courier} / Service: ${service}`);
            //console.log('Store CONFIG!!', getStoreConfig());

            let countryCode = '';
            let city = '';
            let county = '';
            let storeHash = '';

            if (shippingAddress) {
                countryCode = shippingAddress.countryCode;
                city = shippingAddress.city;
                county = shippingAddress.stateOrProvince;
            }

            if (config) {
                storeHash = config.storeHash;
            }


            const locationsData = await fetch(`http://localhost:3000/api/shipping/lockers`, {
                method: 'POST',
                body: JSON.stringify({
                  storeHash: storeHash,
                  courier: courier,
                  city: city,
                  county: county,
                  countryCode: countryCode  
                })
            });

            try {
                const locations = await locationsData.json();
                console.log('LOCATIONS: ', locations);
                setInnoshipData({api_key: locations.api_key, lockers: locations.lockers})
                setIsOpen(true);
            } catch (e) {
                console.log(e);
            }
        }

        onSelectedOption(consignmentId, value);
    }, [
        consignmentId,
        onSelectedOption,
    ]);

    if (!shippingOptions.length) {
        return null;
    }

    return (
        <>
        <LoadingOverlay isLoading={ isLoading }>
            <Checklist
                aria-live="polite"
                defaultSelectedItemId={ selectedShippingOptionId }
                name={ inputName }
                onSelect={ handleSelect }
            >
                { shippingOptions.map(shippingOption => (
                    <ShippingOptionListItem
                        consignmentId={ consignmentId }
                        key={ shippingOption.id }
                        shippingOption={ shippingOption }
                    />
                )) }
            </Checklist>
        </LoadingOverlay>
        <Modal
            additionalBodyClassName="modal-body--center"
            closeButtonLabel={ <TranslatedString id="common.close_action" /> }
            isOpen={ isOpen }
            shouldShowCloseButton={ true }
            onRequestClose={ () => setIsOpen(false) }
        >
        <LockersMap api_key={innoshipData.api_key} lockers={innoshipData.lockers} />
      </Modal>
        </>
    );
};

export default memo(ShippingOptionsList);
