import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Shield, Lock, Globe, ArrowDown, Database, Key, Users, FileImage, CheckCircle, Star } from 'lucide-react';
import { WalletConnection } from '../components/WalletConnection';
import { useWallet } from '../hooks/useWallet';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Home = () => {

    const { isConnected, isConnecting } = useWallet();
    const navigate = useNavigate();

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isConnected && !isConnecting) {
            navigate('/dashboard');
        }
    }, [isConnected, isConnecting, navigate]);

    // if (isConnected) {
    //     return (
    //         <>
    //             <Dashboard />
    //             <Toaster
    //                 position="top-right"
    //                 toastOptions={{
    //                     style: {
    //                         background: 'rgba(15, 23, 42, 0.9)',
    //                         backdropFilter: 'blur(16px)',
    //                         color: '#fff',
    //                         border: '1px solid rgba(255, 255, 255, 0.1)',
    //                     },
    //                 }}
    //             />
    //         </>
    //     );
    // }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container px-6 py-8 mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-16"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">CryptoVault</h1>
                    </div>
                    <WalletConnection />
                </motion.div>

                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 text-5xl font-bold text-white md:text-7xl"
                    >
                        Secure Your Digital
                        <span className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
                            {' '}Assets
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto mb-8 text-xl text-gray-300"
                    >
                        Decentralized, encrypted storage for your most valuable images and documents.
                        Protected by blockchain technology and accessible only to you.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl hover:shadow-purple-500/25"
                        >
                            <Shield className="w-5 h-5" />
                            Connect Wallet
                        </motion.button>
                        <button
                            onClick={scrollToFeatures}
                            className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 border border-white/20 hover:border-white/40 rounded-xl hover:bg-white/5"
                        >
                            <ArrowDown className="w-5 h-5" />
                            Explore Features
                        </button>
                    </motion.div>
                </div>

                {/* Floating Animation Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-purple-400/30"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -100, 0],
                                opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                delay: i * 0.5,
                            }}
                            style={{
                                left: `${10 + i * 15}%`,
                                top: `${20 + i * 10}%`,
                            }}
                        />
                    ))}
                </div>

                {/* Features Grid */}
                <motion.div
                    id="features"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 gap-8 mb-16 md:grid-cols-2 lg:grid-cols-3"
                >
                    {[
                        {
                            icon: Shield,
                            title: 'End-to-End Encryption',
                            description: 'Your files are encrypted client-side with AES-256 before upload, ensuring maximum security and privacy.',
                            color: 'from-purple-500 to-purple-600',
                            features: ['AES-256 Encryption', 'Client-side Processing', 'Zero-knowledge Architecture']
                        },
                        {
                            icon: Database,
                            title: 'IPFS Decentralized Storage',
                            description: 'Files stored on IPFS network ensure permanent availability without relying on centralized servers.',
                            color: 'from-blue-500 to-blue-600',
                            features: ['Permanent Storage', 'Global Accessibility', 'Censorship Resistant']
                        },
                        {
                            icon: Lock,
                            title: 'Blockchain Access Control',
                            description: 'Smart contracts on Ethereum manage permissions, giving you complete control over who can access your data.',
                            color: 'from-teal-500 to-teal-600',
                            features: ['Smart Contract Security', 'Granular Permissions', 'Time-based Access']
                        },
                        {
                            icon: Key,
                            title: 'Advanced Key Management',
                            description: 'Sophisticated encryption key management with support for individual and group access controls.',
                            color: 'from-orange-500 to-orange-600',
                            features: ['Multi-user Keys', 'Key Rotation', 'Secure Recovery']
                        },
                        // {
                        //     icon: Users,
                        //     title: 'Group Management',
                        //     description: 'Create groups and manage access for multiple users simultaneously with flexible permission settings.',
                        //     color: 'from-pink-500 to-pink-600',
                        //     features: ['Team Collaboration', 'Role-based Access', 'Bulk Permissions']
                        // },
                        {
                            icon: FileImage,
                            title: 'Rich Media Support',
                            description: 'Support for various file formats including images, documents, and multimedia with preview capabilities.',
                            color: 'from-indigo-500 to-indigo-600',
                            features: ['Multiple Formats', 'Preview Generation', 'Metadata Preservation']
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="p-6 transition-all duration-300 border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl hover:bg-white/15 group"
                        >
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                            <p className="mb-4 text-gray-300">{feature.description}</p>
                            <div className="space-y-2">
                                {feature.features.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Security Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-8 mb-16 border bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border-white/20 rounded-2xl"
                >
                    <div className="mb-8 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-white">
                            Military-Grade Security Architecture
                        </h2>
                        <p className="max-w-2xl mx-auto text-gray-300">
                            Our multi-layered security approach ensures your data remains private and secure at every step of the process.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {[
                            {
                                step: '01',
                                title: 'Client-Side Encryption',
                                description: 'Files encrypted in your browser before leaving your device',
                                icon: Lock,
                            },
                            {
                                step: '02',
                                title: 'Decentralized Storage',
                                description: 'Encrypted data distributed across IPFS network nodes',
                                icon: Database,
                            },
                            {
                                step: '03',
                                title: 'Blockchain Verification',
                                description: 'Access permissions managed by immutable smart contracts',
                                icon: Shield,
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + index * 0.1 }}
                                className="flex items-start gap-4 p-4 rounded-lg bg-white/5"
                            >
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 text-sm font-bold text-purple-400">STEP {item.step}</div>
                                    <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Stats Section */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="grid grid-cols-2 gap-6 mb-16 md:grid-cols-4"
                >
                    {[
                        { label: 'Files Secured', value: '1M+', icon: FileImage },
                        { label: 'Active Users', value: '50K+', icon: Users },
                        { label: 'Uptime', value: '99.9%', icon: Shield },
                        { label: 'Countries', value: '120+', icon: Globe },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1 + index * 0.1 }}
                            className="p-6 text-center border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl"
                        >
                            <div className="flex justify-center mb-3">
                                <stat.icon className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="mb-1 text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div> */}

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="relative p-8 overflow-hidden text-center border bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-white/20 rounded-2xl"
                >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 3 + i,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                }}
                                style={{
                                    left: `${20 + i * 30}%`,
                                    top: `${10 + i * 20}%`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                        </div>
                        <h2 className="mb-4 text-3xl font-bold text-white">
                            Join Thousands of Users Securing Their Digital Assets
                        </h2>
                        <p className="max-w-xl mx-auto mb-6 text-gray-300">
                            Experience the future of secure, decentralized storage. Connect your wallet to start creating encrypted vaults and protecting your valuable files today.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl hover:shadow-purple-500/25"
                            >
                                <Shield className="w-5 h-5" />
                                Connect Wallet
                            </motion.button>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                No registration required
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(16px)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                }}
            />
        </div>
    );
}



export default Home
