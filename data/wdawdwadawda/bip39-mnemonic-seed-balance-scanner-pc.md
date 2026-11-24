# WDAWDwADAWDA/bip39-mnemonic-seed-balance-scanner-pc

## Resumen

No se trata de un modelo de inteligencia artificial. El repositorio `WDAWDwADAWDA/bip39-mnemonic-seed-balance-scanner-pc` de Hugging Face no contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje. La model card describe una supuesta aplicación ejecutable para Windows x64 (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, build `v2.8.4`) empaquetada en un ZIP de 4,8 MB protegido con contraseña, que afirma realizar validación local de frases BIP39, parseo de keystores LevelDB, derivación multi-cadena BIP44/BIP84 y comprobación de saldos de tokens ERC20/SPL.

El contenido de la model card presenta inconsistencias graves: el nombre del binario y del ZIP no guardan relación con el título del repositorio, los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`YokoCastro3813/fisch-script-auto-catch-macro-2026`) y a otro proyecto distinto (`mSyed47/bip39-mnemonic-seed-balance-scanner-pc`), y se instruye al usuario a extraer un ejecutable con contraseña y lanzarlo como administrador. Este patrón es característico de campañas de distribución de software malicioso (infostealers dirigidos a carteras de criptomonedas) que se camuflan como herramientas de "escaneo de saldos" o "recuperación de seeds".

Desde la perspectiva de esta ficha, el repositorio no es evaluable como modelo: no hay parámetros, contexto, licencia de pesos, benchmarks ni artefactos técnicos verificables. Se documenta a continuación lo que la información disponible permite afirmar, marcando explícitamente todo lo que no está disponible y las advertencias de seguridad pertinentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe una aplicación Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT (declarada en metadatos; aplicable al repositorio, no verificable sobre el binario) |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card enumera componentes de una supuesta aplicación nativa: validador BIP39 local con verificación de entropía y checksum para frases de 12/18/24 palabras, parser de keystores LevelDB para extensiones de navegador, motor SIMD multinúcleo con hashing PBKDF2, derivación de direcciones BIP44/BIP84 sobre EVM, Solana y Bitcoin, y exportación de informes de saldo. Se citan cifras como "4 worker threads", "7 worker threads", "< 7 ms de respuesta" y "138 Hz de polling", sin ninguna evidencia reproducible asociada.

El ZIP declarado ocupa 4,8 MB y requiere contraseña (`2026`) para su extracción, tras lo cual se indica ejecutar el binario como administrador. No hay código fuente, hashes de verificación, firmas de código ni artefactos de build publicados en el repositorio de Hugging Face. La denominación "bip39 mnemonic seed balance scanner" junto con la petición de privilegios elevados y la ofuscación mediante contraseña de archivo es un indicador de riesgo alto de malware.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- La model card atribuye al ejecutable funciones de validación BIP39, derivación de direcciones y consulta de saldos; estas afirmaciones no son verificables y no constituyen capacidades de un modelo.
- No se ha publicado ningún artefacto de inferencia (pesos, tokenizador, configuración).

## Casos de uso

- No procede: el repositorio no contiene un modelo desplegable y no se identifican casos de uso legítimos documentados.
- Auditoría de seguridad defensiva: el repositorio puede utilizarse como muestra para analizar patrones de ingeniería social en model cards (nombres de binarios incoherentes, contraseñas de archivo, ejecución como administrador, enlaces a repositorios de terceros) en programas de concienciación.
- Investigación de fraude en plataformas de modelos: sirve como ejemplo de contaminación de Hugging Face con repositorios que no son modelos, útil para diseñar filtros de moderación.
- Análisis de campañas de infostealers: los indicadores descritos (BIP39, LevelDB, extensiones de navegador) permiten documentar el modus operandi de malware dirigido a carteras.
- Formación en custodia de claves: puede emplearse como caso negativo para explicar por qué nunca debe introducirse una frase semilla en ejecutables de procedencia no verificada.
- No se identifican casos de uso productivos: cualquier escenario de despliegue de este repositorio como modelo o herramienta implica riesgo de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras de rendimiento presentes en la model card (`< 7 ms`, `138 Hz`, número de hilos) corresponden a afirmaciones del autor sobre el ejecutable, sin metodología, hardware de referencia ni reproducibilidad, por lo que no se recogen como resultados válidos.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, extracción previa del ZIP de 4,8 MB.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. A modo de contraste categórico:

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Artefactos | ZIP con `.exe` para Windows | Pesos en safetensors/GGUF, tokenizador, config |
| Ejecución | Binario nativo con privilegios de administrador | Runtime de inferencia (vLLM, llama.cpp, TGI) |
| Verificabilidad | Nula (sin hashes ni fuente) | Reproducible con model card y benchmarks |
| Propósito declarado | "Escaneo de saldos" de seeds BIP39 | Generación de texto, código, visión, etc. |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de categoría.
- Riesgo alto de malware: la combinación de temática de frases semilla, extracción con contraseña, ejecución como administrador y enlaces a repositorios de GitHub de terceros es coherente con campañas de robo de carteras de criptomonedas.
- Incoherencia de nombres: el binario y el ZIP hacen referencia a un supuesto macro de un juego, mientras el título del repositorio alude a un escáner BIP39; los enlaces de descarga apuntan a repositorios distintos del autor declarado.
- Cero descargas y cero likes en el momento de la consulta, sin historial ni comunidad que respalde el artefacto.
- La licencia MIT declarada en metadatos no garantiza nada sobre el binario distribuido ni sobre su procedencia.
- Cualquier ejecutable que solicite una frase semilla BIP39 debe considerarse comprometido por definición: una frase semilla nunca debe introducirse en software de terceros.
- No hay sesgos ni alucinaciones evaluables al no existir modelo; el riesgo relevante es de seguridad, no de calidad de salida.
- No deben seguirse las instrucciones de descarga, extracción ni ejecución contenidas en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WDAWDwADAWDA/bip39-mnemonic-seed-balance-scanner-pc
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/mSyed47/bip39-mnemonic-seed-balance-scanner-pc
- Enlace de descarga del ZIP citado en la model card (no verificado, no recomendado): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Documentación de la política de Hugging Face sobre contenido malicioso: https://huggingface.co/docs/hub/security
- Especificación BIP39 (referencia técnica del estándar citado): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
