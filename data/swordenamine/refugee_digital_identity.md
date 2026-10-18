# swordenamine/refugee_digital_identity

## Resumen

`swordenamine/refugee_digital_identity` no es un modelo de IA: es un repositorio publicado en HuggingFace que contiene el diseño y el código de referencia (Python) de un sistema de identidad digital autosoberana (SSI) sobre Polygon para personas refugiadas y no bancarizadas. El proyecto propone crear identificadores descentralizados (DID) según el estándar W3C, emitir credenciales verificables (VC) por parte de ONG y organismos como ACNUR, demostrar atributos con pruebas de conocimiento cero (ZK) y vincular una cartera de microahorros no custodial en stablecoin. El repositorio no incluye pesos, tokenizador ni pipeline de inferencia; la etiqueta asociada es únicamente `region:us`, con 0 descargas y 0 likes en el momento de la consulta.

El problema que aborda es la exclusión financiera y documental: según los datos citados en la propia model card, 1.400 millones de adultos están fuera del sistema financiero y hay 84 millones de personas desplazadas forzosas, con unos 100.000 refugiados en Argelia. La propuesta técnica combina DID `did:polygon`, credenciales verificables del W3C VC Data Model, pruebas Schnorr con Fiat-Shamir para demostrar mayoría de edad sin revelar la fecha de nacimiento, y una cartera con recuperación social 3-de-5 y transacciones sin gas patrocinadas.

Es relevante únicamente como documentación de arquitectura y como posible base de código para proyectos de identidad digital en contextos humanitarios. No debe evaluarse como un modelo de lenguaje: no hay parámetros, contexto, dataset de entrenamiento ni resultados de benchmarks de IA. La información disponible está además truncada al final de la model card y presenta incoherencias de fechas y de licencia que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal. Librería Python con módulos `core/`, `blockchain/`, `zkp/`, `wallet/` y `examples/`; DID W3C sobre Polygon, credenciales verificables W3C VC, pruebas ZK Schnorr |
| Parámetros totales | no disponible (no aplica: el repositorio no contiene pesos) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; la model card no declara idiomas. El ejemplo de código usa nombres y habilidades en árabe/francés/medicina, sin que ello constituya soporte lingüístico formal |
| Licencia | La insignia de la model card indica MIT; el campo de licencia de HuggingFace figura como no disponible. Contradicción sin resolver |
| Formato de pesos | no disponible (no hay artefactos de pesos; el contenido es código fuente Python y documentos JSON de ejemplo) |

## Arquitectura y entrenamiento

No existe entrenamiento. El repositorio describe una arquitectura de software con cinco capas: (1) `core/`, con creación y resolución de documentos DID W3C, emisión y verificación de credenciales verificables y un registro de identidad on-chain; (2) `blockchain/`, con cliente de Polygon y lógica del contrato de registro de DID, ambos marcados como simulados en el propio árbol de ficheros; (3) `zkp/`, con pruebas Schnorr para atributos como edad o nacionalidad y un verificador que no accede a los datos en crudo; (4) `wallet/`, con cartera de microahorros no custodial y recuperación social mediante 3-de-5 guardianes; y (5) `examples/`, con un flujo completo de onboarding.

El esquema criptográfico declarado usa claves `EcdsaSecp256k1VerificationKey2019`, firmas `EcdsaSecp256k1Signature2019` en las credenciales y un protocolo ZK basado en compromiso `C = Hash(b || r)`, nonce aleatorio, reto Fiat-Shamir `c = Hash(R || statement)` y verificación `g^s · PK^c = R`. La cartera se describe con saldo en stablecoin ERC-20 (USDC/cUSD), depósito mínimo de 0,01 USD, transacciones sin gas patrocinadas por la ONG u operador y bootstrap mediante número de teléfono, con credenciales cacheadas en el dispositivo para verificación por QR sin conexión. No se especifican volúmenes de datos, procesos de entrenamiento, RLHF ni DPO porque no aplican.

## Capacidades

- Creación y resolución de identificadores descentralizados con el estándar W3C DID, anclados en Polygon (`did:polygon:0x...`).
- Emisión y verificación de credenciales verificables según W3C VC Data Model, con emisores identificados por DID (por ejemplo, `did:polygon:unhcr-algeria`).
- Generación y verificación de pruebas de conocimiento cero para predicados como "mayor de 18 años" sin revelar la fecha de nacimiento ni el nonce.
- Onboarding sin documentación previa: alta a partir de número de teléfono y hash biométrico facial (declarado como `sha256:...`, sin almacenar la imagen en crudo).
- Cartera de microahorros no custodial con stablecoin, depósitos desde 0,01 USD y recuperación social 3-de-5.
- Verificación offline mediante credenciales cacheadas en el dispositivo y comprobación por código QR.
- API de alto nivel en Python (`SSISystem` con métodos `onboard`, `issue_credential`, `prove_over_18`, `deposit`, `balance`).
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: no es un modelo de lenguaje.

## Casos de uso

- Registro de personas refugiadas sin documentación: el flujo `onboard()` crea un DID a partir de un número de teléfono y un hash biométrico verificado por una ONG, lo que permite iniciar un expediente de identidad sin pasaporte ni correo electrónico.
- Acreditación de competencias profesionales: un emisor como WHO-Argelia emite una credencial con `{"skill": "medicine"}` asociada al DID, de forma que un médico refugiado puede demostrar su cualificación sin presentar títulos originales perdidos.
- Control de acceso con minimización de datos: un verificador comprueba la prueba `prove_over_18` para servicios que exigen mayoría de edad sin recibir la fecha de nacimiento, reduciendo la exposición de datos personales sensibles.
- Distribución de ayuda en efectivo: la cartera vinculada al DID permite abonos en stablecoin con transacciones patrocinadas, de modo que la persona no necesita saldo previo en gas ni cuenta bancaria.
- Microahorro y remesas de bajo importe: la cartera admite depósitos desde 0,01 USD, lo que encaja con economías de subsistencia donde los mínimos bancarios son inalcanzables.
- Verificación en campo sin conectividad: un trabajador humanitario escanea el QR del dispositivo y valida las credenciales cacheadas en zonas sin cobertura de red.
- Recuperación de acceso tras pérdida del teléfono: el esquema 3-de-5 guardianes permite restaurar el control de la identidad y del saldo sin depender de un intermediario central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de rendimiento criptográfico (tiempos de generación o verificación de pruebas, coste de gas en Polygon, latencia de resolución de DID) ni métricas de precisión biométrica. Las únicas cifras del proyecto son valoraciones autodeclaradas por el autor en las insignias de la model card, que no constituyen benchmarks verificables:

| Métrica autodeclarada | Valor |
|---|---|
| Idea score | 88,8 / 100 |
| Novedad | 96 / 100 |
| Viabilidad | 79 / 100 |
| Impacto | 89 / 100 |

## Requisitos de hardware

- Al no contener pesos ni inferencia, no requiere VRAM ni GPU: el código es Python y puede ejecutarse en CPU.
- GPU recomendadas: no disponible; no aplica para este repositorio.
- Compatibilidad con GPU de consumo: no aplica (no hay modelo que cargar).
- Opciones de despliegue: no se documentan en la información disponible (no hay instrucciones de instalación, `requirements.txt`, contenedor ni publicación en PyPI). Los módulos de blockchain están marcados como simulados, por lo que no hay despliegue real en Polygon descrito.
- Latencia y throughput: no disponibles. No se aportan tiempos de generación o verificación de pruebas ZK, ni coste por transacción en la red.

## Comparativa con modelos similares

No se han proporcionado modelos ni proyectos comparables en la información disponible, y el repositorio no incluye una sección de comparación. Al no existir parámetros, contexto ni benchmarks, la comparación con modelos de IA no es posible.

| Elemento | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio | Librería Python de SSI (sin pesos) | no aplica | no aplica | MIT según insignia; campo de HF no disponible | 0 descargas, 0 likes |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje, comparación de parámetros o prueba de benchmarks carece de sentido con este contenido.
- Los módulos de blockchain aparecen etiquetados como simulados (`polygon_client.py (simulated)`, `identity_registry.py (Polygon sim)`), por lo que el sistema no está operativo en red real según la información disponible.
- La model card está truncada: el texto se corta a mitad de la sección de impacto global, por lo que pueden faltar secciones de despliegue, seguridad y pruebas.
- Incoherencia de fechas en los metadatos: la fecha de creación (2026-10-17) es posterior a la de actualización (2026-03-11).
- Incoherencia de licencia: la insignia indica MIT, pero el campo de licencia de HuggingFace figura como no disponible; conviene confirmar la licencia antes de cualquier uso comercial o derivado.
- Riesgo de seguridad no evaluado: no se documentan auditorías del contrato de registro de DID, del esquema Schnorr ni del mecanismo de recuperación social 3-de-5, que es un punto crítico en sistemas de identidad.
- Privacidad y protección de datos: el tratamiento de hashes biométricos faciales y de datos de personas refugiadas implica obligaciones legales (RGPD y normativa equivalente) que la información disponible no aborda.
- Dependencia de emisores de confianza: la validez de las credenciales recae en ONG y organismos concretos; no se describe el modelo de gobernanza ni la revocación de credenciales.
- Sin comunidad ni validación externa: 0 descargas y 0 likes, sin issues ni contribuciones documentadas.
- Los resultados de búsqueda web devueltos no guardan relación con este repositorio y se han descartado por no ser fuentes fiables ni pertinentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/refugee_digital_identity
- W3C Decentralized Identifiers (DID): https://www.w3.org/TR/did-core/
- W3C Verifiable Credentials Data Model: https://www.w3.org/TR/vc-data-model/
- Documentación de Polygon: https://polygon.technology/
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este proyecto.
