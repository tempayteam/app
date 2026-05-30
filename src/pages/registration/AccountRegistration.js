import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import Avatar from 'react-avatar-edit'
import ConnectWallet from '../../Modal/ConnectWallet'
import { chevronDownIcon, eyeIcon, eyeSlashIcon } from '../../constant/icon'

const AccountRegistration = () => {
    const [accountData, setAccountData] = useState({ userName: '', email: '', businessName: '', country: '', password: '', confirmPassword: '', solAddress: '', ethAdress: '' })
    const [countries, setCountries] = useState([])
    const [selectedCountry, setSelectedCountry] = useState({})
    const [isOpenDropdown, setIsOpenDropdown] = useState(false)
    const [searchQuery, setSearchQuery] = useState('');
    const [preview, setPreview] = useState('');
    const [connectWalletModal, setConnectWalletModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prevState) => !prevState);
    };

    const connectWalletRef = useRef(null)

    const handleChange = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value })
    }

    const toggleDropdown = () => {
        setIsOpenDropdown(!isOpenDropdown)
    }

    const handleSelectCountry = (country) => {
        setSelectedCountry(country);
        setIsOpenDropdown(false); // Close the dropdown after selection
        setSearchQuery('');
    }


    const filteredCountries = countries.filter((item) =>
        item.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateAccount = () => {
        console.log(preview);

    }

    const onClose = () => {
        setPreview(null);
    };

    const onCrop = (croppedPreview) => {

        setPreview(croppedPreview);
    };

    const onBeforeFileLoad = (elem) => {
        const file = elem.target.files[0];
        if (file.size > 1000000) { // Check if file size exceeds 1MB
            alert("File is too big!");
            elem.target.value = null; // Clear the file input directly
            return;
        }
    };

    // const handleOpenWalletModal = () => {
    //     connectWalletRef.current.click()
    // }

    const getCountriesData = () => {
        axios
            .get('https://countriesnow.space/api/v0.1/countries')
            .then((response) => {
                const countriesData = response.data.data.map((countryData) => ({
                    country: countryData.country,
                    iso2: countryData.iso2.toLowerCase(),
                }));
                setCountries(countriesData);
            })
            .catch(() => {
            });
    };


    useEffect(() => {
        getCountriesData()
        // eslint-disable-next-line
    }, [])

    return (
        <div className=' h-screen flex items-center justify-center'>
            <div className='lg:container lg:mx-auto sm:mx-5 lg:p-4 md:p-0 p-5'>
                <div className='border border-black rounded-xl '>
                    <div className='p-5 bg-[#F97316] rounded-t-lg text-white'>
                        <p className='font-medium text-xl'>Create an Account </p>
                        <p className=''>Collect crypto currency payment and trade as a business.</p>
                    </div>
                    <div className='p-5'>
                        <div className='grid lg:grid-cols-8 grid-cols-1 xl:p-4  gap-5'>
                            <div className='lg:col-span-6'>
                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-4'>
                                    <div className=''>
                                        <label htmlFor="user_name" className="block mb-2 text-base font-medium">User Name or Wallet Address</label>
                                        <input type="text" name='userName' value={accountData.userName} id="user_name" onChange={handleChange} className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none block w-full p-2.5" required />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="email" className="block mb-2 text-base font-medium">Email</label>
                                        <input type="text" name='email' value={accountData.email} id="email" onChange={handleChange} className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none block w-full p-2.5" required />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="businessName" className="block mb-2 text-base font-medium">Business Name</label>
                                        <input type="text" name='businessName' value={accountData.businessName} id="businessName" onChange={handleChange} className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none block w-full p-2.5" required />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="country" className="block mb-2 text-base font-medium">Country</label>
                                        <div className="relative">
                                            <div onClick={toggleDropdown} className={`${selectedCountry.country ? "border border-gray-300 rounded-lg p-2.5" : ''} flex justify-between items-center gap-5 rounded-lg bg-white text-black cursor-pointer`}>
                                                {selectedCountry.country ? (
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className='flex'>
                                                            <img
                                                                src={`https://flagcdn.com/24x18/${selectedCountry.iso2}.png`}
                                                                alt={selectedCountry.country}
                                                                className="w-6 h-6 rounded-full bg-white object-cover me-2"
                                                            />
                                                            <span className='text-black'>{selectedCountry.country}</span>
                                                        </div>
                                                        <div className=''><i className={chevronDownIcon}></i></div>
                                                    </div>
                                                ) : (
                                                    <div className='flex justify-between w-full relative'>
                                                        <input
                                                            type="text"
                                                            className="p-2 w-full focus:outline-none border border-gray-300 rounded-lg"
                                                            placeholder="Search country..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                        />
                                                        <div className='absolute right-3 top-2'><i className={chevronDownIcon}></i></div>
                                                    </div>
                                                )}
                                            </div>
                                            {isOpenDropdown && (
                                                <div >
                                                    {/* Search input */}

                                                    {/* Filtered countries */}
                                                    <div className="absolute bg-white w-full overflow-y-auto rounded shadow-md z-10 px-2">
                                                        <ul className=''>
                                                            {selectedCountry.country && <div className='sticky top-0 bg-white '>
                                                                <input
                                                                    type="text"
                                                                    className="border p-2 mb-2 w-full focus:outline-none text-black"
                                                                    placeholder="Search country..."
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                />
                                                            </div>}
                                                            <div className='max-h-52'>
                                                                {filteredCountries.length > 0 ? (
                                                                    filteredCountries.map((item) => (
                                                                        <li
                                                                            key={item.id}
                                                                            onClick={() => handleSelectCountry(item)}
                                                                            className="flex items-center cursor-pointer hover:bg-gray-200 p-2"
                                                                        >
                                                                            <img
                                                                                src={`https://flagcdn.com/24x18/${item.iso2}.png`}
                                                                                alt={item.country}
                                                                            />
                                                                            <span className="ml-3 block truncate text-black">
                                                                                {item.country}
                                                                            </span>
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li className="p-2 text-gray-500">No country found</li>
                                                                )}
                                                            </div>
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='relative'>
                                        <label htmlFor="password" className="block mb-2 text-base font-medium">Password</label>
                                        <input type={showPassword ? "text" : "password"} name='password' value={accountData.password} id="password" onChange={handleChange} className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none block w-full p-2.5" required />
                                        <i onClick={togglePasswordVisibility} className={`${showPassword ? eyeIcon : eyeSlashIcon} absolute right-3 top-12 cursor-pointer text-black`}></i>

                                    </div>
                                    <div className='relative'>
                                        <label htmlFor="confirmPassword" className="block mb-2 text-base font-medium">Confirm Password</label>
                                        <input type={showConfirmPassword ? "text" : "password"} name='confirmPassword' value={accountData.confirmPassword} id="confirmPassword" onChange={handleChange} className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none block w-full p-2.5" required />
                                        <i onClick={toggleConfirmPasswordVisibility} className={`${showConfirmPassword ? eyeIcon : eyeSlashIcon} absolute right-3 top-12 cursor-pointer text-black`}></i>

                                    </div>
                                    <div className=''>
                                        <label htmlFor="solAddress" className="block mb-2 text-base font-medium">Sol Wallet Address</label>
                                        <input type="solAddress" disabled name='solAddress' value={accountData.solAddress} id="solAddress" className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none block w-full p-2.5" required />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="ethAdress" className="block mb-2 text-base font-medium">Eth Wallet Address</label>
                                        <input type="ethAdress" disabled name='ethAdress' value={accountData.ethAdress} id="ethAdress" className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none block w-full p-2.5" required />
                                    </div>
                                </div>
                            </div>
                            <div className='lg:col-span-2 flex items-center justify-center'>
                                <Avatar
                                    width={220}
                                    height={220}
                                    onCrop={onCrop}
                                    onClose={onClose}
                                    cropRadius={110}
                                    minCropRadius={60}
                                    onBeforeFileLoad={onBeforeFileLoad}
                                    src={''}
                                />
                            </div>
                        </div>
                        <div className='flex justify-center mt-5'>
                            {
                                // !isConnected ?
                                //     <button
                                //         type="submit"
                                //         className="text-white bg-black hover:bg-gray-800 w-auto  focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center "
                                //         onClick={handleOpenWalletModal}
                                //     >
                                //         Connect Wallet
                                //     </button>

                                //     : chain.id !== targetChainId ?
                                //         <button
                                //             type="submit"
                                //             className="mx-4 text-white bg-red-500 hover:bg-red-600 w-auto  focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center "
                                //             onClick={handleSwitchNetwork}
                                //         >
                                //             Switch Network
                                //         </button>

                                //         :
                                <div className=''>
                                    {/* {<button
                                        type="submit"
                                        className="mx-4 text-white bg-red-500 hover:bg-red-600 w-auto  focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center "
                                        onClick={handleDisconnectWallet}
                                    >
                                        Disconnect Wallet
                                    </button>} */}
                                    <button
                                        type="submit"
                                        className="mx-4 text-white bg-black hover:bg-gray-700 w-auto  focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center "
                                        onClick={handleCreateAccount}
                                    >
                                        Create an Account
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </div>

            </div>
            {/*************************************************************Connect Wallet Modal********************************************/}
            <>
                <button
                    ref={connectWalletRef}
                    className="bg-[#FFF7ED] text-black active:bg-[#F97316] 
                      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 hidden"
                    type="button"
                    onClick={() => setConnectWalletModal(true)}
                >
                    Fill Details
                </button>
                {connectWalletModal ? (
                    <>
                        <ConnectWallet setConnectWalletModal={setConnectWalletModal} />
                    </>
                ) : null}
            </>
            {/*************************************************************Connect Wallet Modal********************************************/}
        </div >
    )
}

export default AccountRegistration