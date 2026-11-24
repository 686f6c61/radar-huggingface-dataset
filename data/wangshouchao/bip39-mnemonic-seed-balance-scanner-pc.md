# wangshouchao/bip39-mnemonic-seed-balance-scanner-pc

## Resumen

La ficha solicitada corresponde al identificador `wangshouchao/bip39-mnemonic-seed-balance-scanner-pc`, publicado en Hugging Face con fecha de creación del 24 de noviembre de 2026. Tras revisar la información disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automático: el repositorio contiene una supuesta aplicación ejecutable para Windows x64 distribuida como archivo ZIP, etiquetada como "Bip39 Mnemonic Seed Balance Scanner PC", con versiones `v2.8.4` y compilación `2BB6C9`.

La model card describe funcionalidades de validación de frases mnemónicas BIP39, parseo de keystores LevelDB de extensiones de navegador, derivación de direcciones multi-cadena (EVM, Solana, Bitcoin mediante BIP44/BIP84) y comprobación de saldos de tokens ERC20/SPL. No se declara arquitectura de red neuronal, número de parámetros, longitud de contexto, corpus de entrenamiento ni ningún artefacto de pesos en formato safetensors o GGUF.

Por tanto, esta ficha documenta un artefacto que no es un modelo de lenguaje y advierte de los riesgos de seguridad asociados. El binario se distribuye con contraseña de extracción (`2026`), enlaza a repositorios de GitHub de terceros con nombres incoherentes respecto al proyecto declarado (referencias a `fisch-script-auto-catch-macro-2026`) y solicita ejecución como administrador, lo que constituye un patrón habitual de distribución de software malicioso o de dudosa procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicación nativa Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. La model card describe un ejecutable Windows x64 (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, 4,8 MB) que, según el autor, implementa validación local de entropía y checksum BIP39 para frases de 12, 18 y 24 palabras, un parser de keystores LevelDB (archivos `.ldb` y vaults de extensiones de navegador), derivación de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin, y comprobación de saldos de moneda nativa, stablecoins y staking DeFi.

Las afirmaciones técnicas de la model card (motor SIMD multi-hilo, PBKDF2, sondeo a 138 Hz, tiempos de respuesta inferiores a 7 ms) no vienen acompañadas de código fuente, binarios verificables ni artefactos de build reproducibles. No se especifica ningún conjunto de datos de entrenamiento, proceso de alineación (RLHF/DPO) ni innovación en arquitectura de modelos.

## Capacidades

- No es un modelo generativo: no produce texto, código, razonamiento ni matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades declaradas por el autor son: validación local de frases BIP39, parseo de keystores LevelDB, derivación multi-cadena de direcciones y comprobación de saldos de tokens.
- El etiquetado multilingüe (14 idiomas) corresponde a metadatos de la model card, no a capacidades lingüísticas verificadas de un modelo.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no debe desplegarse en pipelines de inferencia, generación aumentada por recuperación ni agentes.
- Auditoría de seguridad: el repositorio puede emplearse como caso de estudio de distribución sospechosa de binarios (contraseña en archivo comprimido, solicitud de privilegios de administrador, enlaces a repositorios de GitHub ajenos al proyecto declarado).
- Análisis de malware: investigadores pueden examinar el patrón de la model card como ejemplo de ingeniería social dirigida a titulares de carteras de criptomonedas.
- Formación en concienciación: sirve como ejemplo didáctico de por qué no deben ejecutarse binarios de procedencia desconocida que manipulan frases semilla.
- No se identifica ningún escenario legítimo de producción, investigación con modelos o desarrollo de software en el que este artefacto aporte valor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Sistema operativo declarado: Windows 10 o Windows 11 de 64 bits.
- Tamaño del paquete: 4,8 MB (ZIP), sin dependencias externas declaradas.
- VRAM: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica.
- Latencia y throughput: el autor afirma sondeo a 138 Hz y respuestas inferiores a 7 ms, sin evidencia verificable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo de lenguaje. Como referencia de categoría, podría compararse con otras herramientas legítimas de validación BIP39 de código abierto (por ejemplo, librerías como `bip39` de JavaScript o `python-mnemonic`), pero la información proporcionada no permite establecer una comparación técnica rigurosa con ellas.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA pese a estar alojado en Hugging Face; su presencia en la plataforma no implica validación técnica ni de seguridad.
- Distribución mediante ZIP protegido con contraseña (`2026`) y solicitud de ejecución como administrador: patrón habitual en campañas de malware.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros (`YokoCastro3813`, `mSyed47`) con nombres incoherentes respecto al proyecto declarado (referencias a `fisch-script-auto-catch-macro-2026`).
- La funcionalidad declarada (escaneo de frases semilla y saldos) es característica de herramientas de robo de criptomonedas; ejecutarla supone un riesgo elevado de compromiso de claves.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso legítimo ni revisión comunitaria.
- La licencia MIT declarada no aporta garantías de seguridad ni de integridad del binario.
- Riesgo de alucinación, sesgos o limitaciones de contexto: no aplica, al no ser un modelo de lenguaje.
- Uso comercial: desaconsejado en cualquier circunstancia; la licencia MIT no cubre responsabilidad por daños derivados de la ejecución del binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wangshouchao/bip39-mnemonic-seed-balance-scanner-pc
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, terceros): https://github.com/mSyed47/bip39-mnemonic-seed-balance-scanner-pc/releases/latest
