import { CipherSuite } from "../TLS/CipherSuite";
import { KeyExchangeAlgorithm, PRFAlgorithm, BulkCipherAlgorithm, CipherType, MACAlgorithm, KeyExchangeAlgorithm } from "./SecurityParameters";

export interface ICipherSuites {
	[name: string] : CipherSuite
}

// block sizes etc. see https://tools.ietf.org/html/rfc5246 page 83
export CipherSuites : ICipherSuites = {
	TLS_NULL_WITH_NULL_NULL:				new CipherSuite(0x0000, KeyExchangeAlgorithm.null   ,      MACAlgorithm.null  , 	 PRFAlgorithm.tls_prf_sha256,   CipherType.stream,   BulkCipherAlgorithm.null ),        
	TLS_RSA_WITH_NULL_MD5:					new CipherSuite(0x0001, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_md5   , PRFAlgorithm.tls_prf_sha256,   CipherType.stream,   BulkCipherAlgorithm.null ),        
	TLS_RSA_WITH_NULL_SHA:					new CipherSuite(0x0002, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.stream,   BulkCipherAlgorithm.null  ),       
	TLS_RSA_WITH_NULL_SHA256:				new CipherSuite(0x003B, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.stream,   BulkCipherAlgorithm.null  ),       
	TLS_RSA_WITH_3DES_EDE_CBC_SHA:			new CipherSuite(0x000A, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc 
	TLS_RSA_WITH_AES_128_CBC_SHA:			new CipherSuite(0x002F, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_RSA_WITH_AES_256_CBC_SHA:			new CipherSuite(0x0035, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_RSA_WITH_AES_128_CBC_SHA256:		new CipherSuite(0x003C, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_RSA_WITH_AES_256_CBC_SHA256:		new CipherSuite(0x003D, KeyExchangeAlgorithm.rsa    ,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA:		new CipherSuite(0x000D, KeyExchangeAlgorithm.dh_dss ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc 
	TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA:		new CipherSuite(0x0010, KeyExchangeAlgorithm.dh_rsa ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc 
	TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA:		new CipherSuite(0x0013, KeyExchangeAlgorithm.dhe_dss,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc 
	TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA:		new CipherSuite(0x0016, KeyExchangeAlgorithm.dhe_rsa,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc 
	TLS_DH_DSS_WITH_AES_128_CBC_SHA:		new CipherSuite(0x0030, KeyExchangeAlgorithm.dh_dss ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DH_RSA_WITH_AES_128_CBC_SHA:		new CipherSuite(0x0031, KeyExchangeAlgorithm.dh_rsa ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DHE_DSS_WITH_AES_128_CBC_SHA:		new CipherSuite(0x0032, KeyExchangeAlgorithm.dhe_dss,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DHE_RSA_WITH_AES_128_CBC_SHA:		new CipherSuite(0x0033, KeyExchangeAlgorithm.dhe_rsa,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DH_DSS_WITH_AES_256_CBC_SHA:		new CipherSuite(0x0036, KeyExchangeAlgorithm.dh_dss ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DH_RSA_WITH_AES_256_CBC_SHA:		new CipherSuite(0x0037, KeyExchangeAlgorithm.dh_rsa ,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DHE_DSS_WITH_AES_256_CBC_SHA:		new CipherSuite(0x0038, KeyExchangeAlgorithm.dhe_dss,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DHE_RSA_WITH_AES_256_CBC_SHA:		new CipherSuite(0x0039, KeyExchangeAlgorithm.dhe_rsa,      MACAlgorithm.hmac_sha1  , PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DH_DSS_WITH_AES_128_CBC_SHA256:		new CipherSuite(0x003E, KeyExchangeAlgorithm.dh_dss ,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DH_RSA_WITH_AES_128_CBC_SHA256:		new CipherSuite(0x003F, KeyExchangeAlgorithm.dh_rsa ,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DHE_DSS_WITH_AES_128_CBC_SHA256:	new CipherSuite(0x0040, KeyExchangeAlgorithm.dhe_dss,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DHE_RSA_WITH_AES_128_CBC_SHA256:	new CipherSuite(0x0067, KeyExchangeAlgorithm.dhe_rsa,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_DH_DSS_WITH_AES_256_CBC_SHA256:		new CipherSuite(0x0068, KeyExchangeAlgorithm.dh_dss ,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DH_RSA_WITH_AES_256_CBC_SHA256:		new CipherSuite(0x0069, KeyExchangeAlgorithm.dh_rsa ,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DHE_DSS_WITH_AES_256_CBC_SHA256:	new CipherSuite(0x006A, KeyExchangeAlgorithm.dhe_dss,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	TLS_DHE_RSA_WITH_AES_256_CBC_SHA256:	new CipherSuite(0x006B, KeyExchangeAlgorithm.dhe_rsa,      MACAlgorithm.hmac_sha256, PRFAlgorithm.tls_prf_sha256,   CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  

	
	// PSK cipher suites from https://tools.ietf.org/html/rfc4279
	TLS_PSK_WITH_3DES_EDE_CBC_SHA:			new CipherSuite(0x008B, KeyExchangeAlgorithm.psk    ,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc
	TLS_PSK_WITH_AES_128_CBC_SHA:			new CipherSuite(0x008C, KeyExchangeAlgorithm.psk    ,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc
	TLS_PSK_WITH_AES_256_CBC_SHA:			new CipherSuite(0x008D, KeyExchangeAlgorithm.psk    ,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc
	TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA:		new CipherSuite(0x008F, KeyExchangeAlgorithm.dhe_psk,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc 
	TLS_DHE_PSK_WITH_AES_128_CBC_SHA:		new CipherSuite(0x0090, KeyExchangeAlgorithm.dhe_psk,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc 
	TLS_DHE_PSK_WITH_AES_256_CBC_SHA:		new CipherSuite(0x0091, KeyExchangeAlgorithm.dhe_psk,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc 
	TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA:		new CipherSuite(0x0093, KeyExchangeAlgorithm.rsa_psk,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.des3), 	 //ede_cbc  
	TLS_RSA_PSK_WITH_AES_128_CBC_SHA:		new CipherSuite(0x0094, KeyExchangeAlgorithm.rsa_psk,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.aes), 	 //128_cbc  
	TLS_RSA_PSK_WITH_AES_256_CBC_SHA:		new CipherSuite(0x0095, KeyExchangeAlgorithm.rsa_psk,   MACAlgorithm.hmac_sha1, PRFAlgorithm.tls_prf_sha256,    CipherType.block,    BulkCipherAlgorithm.aes), 	 //256_cbc  
	// forbidden in DTLS:
	// TLS_PSK_WITH_RC4_128_SHA:			0x008A,
	// TLS_DHE_PSK_WITH_RC4_128_SHA:		0x008E,
	// TLS_RSA_PSK_WITH_RC4_128_SHA:		0x0092,
	
		
	// PSK cipher suites from https://tools.ietf.org/html/rfc6655
	TLS_PSK_WITH_AES_128_CCM:				new CipherSuite(0xC0A4, KeyExchangeAlgorithm.psk    , MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM	
	TLS_PSK_WITH_AES_256_CCM:				new CipherSuite(0xC0A5, KeyExchangeAlgorithm.psk    , MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM	
	TLS_DHE_PSK_WITH_AES_128_CCM:			new CipherSuite(0xC0A6, KeyExchangeAlgorithm.dhe_psk, MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM	
	TLS_DHE_PSK_WITH_AES_256_CCM:			new CipherSuite(0xC0A7, KeyExchangeAlgorithm.dhe_psk, MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM	
	TLS_PSK_WITH_AES_128_CCM_8:				new CipherSuite(0xC0A8, KeyExchangeAlgorithm.psk    , MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM_8
	TLS_PSK_WITH_AES_256_CCM_8:				new CipherSuite(0xC0A9, KeyExchangeAlgorithm.psk    , MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM_8
	TLS_PSK_DHE_WITH_AES_128_CCM_8:			new CipherSuite(0xC0AA, KeyExchangeAlgorithm.dhe_psk, MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM_8
	TLS_PSK_DHE_WITH_AES_256_CCM_8:			new CipherSuite(0xC0AB, KeyExchangeAlgorithm.dhe_psk, MACAlgorithm.null, PRFAlgorithm.tls_prf_sha256, CipherType.aead, BulkCipherAlgorithm.aes), // CCM_8
	                                                                                              
	// TRADFRI wants TLS_PSK_WITH_AES_128_CCM_8 or TLS_PSK_WITH_AES_128_CBC_SHA
}