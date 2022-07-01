import { ShippingOption, StoreProfile } from '@bigcommerce/checkout-sdk';
import React, { memo, useCallback, FunctionComponent, useState, useEffect } from 'react';

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
    onClick(option: ShippingOption):void;
}

const ShippingOptionListItem: FunctionComponent<ShippingOptionListItemProps> = ({
    consignmentId,
    shippingOption,
    onClick
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
        onClick={onClick}
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
    config,
 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [innoshipData, setInnoshipData] = useState({} as LockersMapProps);

    useEffect(() => {
        const lockerString = localStorage.getItem('lockerData');
        if (!lockerString?.length && selectedShippingOptionId?.length && shippingOptions?.length) {
            const shippingOption = shippingOptions?.filter((option: ShippingOption) => option.id === selectedShippingOptionId);
            if (shippingOption?.length) {
                onShippingOptionListItemClick(shippingOption[0]);
            }
        }
    },[]);

    const handleSelect = useCallback(async (value: string) => {
        onSelectedOption(consignmentId, value);
    }, [
        consignmentId,
        onSelectedOption,
    ]);

    const onShippingOptionListItemClick = async (option: ShippingOption) => {
        if (option) {
            const [courier, service] = option.description.split(' ');

            if (`${service}`.toLowerCase() !== 'lockers') return;

            localStorage.removeItem('lockerData');

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


            const locationsData = await fetch(`https://bc-innoship.customsoft.dev/api/shipping/lockers`, {
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
                setInnoshipData({apiKey: locations.google_maps_api_key, lockers: locations.lockers, google: null, address: shippingAddress, closeModal: ()=>{}})
                setIsOpen(true);
            } catch (e) {
                console.log(e);
            }
        }
    }

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
                        onClick={() => onShippingOptionListItemClick(shippingOption)}
                    />
                )) }
            </Checklist>
        </LoadingOverlay>
        <Modal style={{
                overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
                },
                content: {
                top: '40px',
                left: '40px',
                right: '40px',
                bottom: '40px',
                border: '1px solid #ccc',
                background: '#fff',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                minHeight: '95%',
                minWidth: '95%'
                }
            }}
            additionalBodyClassName="modal-body--center"
            closeButtonLabel={ <TranslatedString id="common.close_action" /> }
            isOpen={ isOpen }
            shouldShowCloseButton={ false }
            onRequestClose={ () => setIsOpen(false) }
        >
        <LockersMap {...{apiKey: innoshipData.apiKey, lockers: innoshipData.lockers, address: innoshipData.address, closeModal: () => setIsOpen(false) }} />
      </Modal>
        </>
    );
};

export default memo(ShippingOptionsList);
