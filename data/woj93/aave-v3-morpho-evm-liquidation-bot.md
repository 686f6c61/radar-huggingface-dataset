# Woj93/aave-v3-morpho-evm-liquidation-bot

## Resumen

El artefacto publicado bajo el identificador `Woj93/aave-v3-morpho-evm-liquidation-bot` no es un modelo de lenguaje ni un modelo de IA en el sentido habitual del termino. Se trata de un repositorio de Hugging Face cuyo contenido es una model card que distribuye un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con contrasena) presentado como un bot de liquidaciones para los protocolos DeFi Aave V3 y Morpho sobre EVM. No existe ningun peso neuronal, tokenizador, configuracion de arquitectura ni artefacto de inferencia asociado.

La model card describe funcionalidades propias de un software de trampas para videojuegos (cheat): suavizado de entrada por curvas de Bezier, radar 2D con filtro de botin, capa de render que evita la captura de pantalla en OBS o ShadowPlay, tecla de panico para descarga instantanea, escaneo dinamico de offsets de memoria y ejecucion en modo usuario sin hooks de DLL internos. El propio texto reconoce explicitamente que el binario es un `game cheat`. La terminologia financiera del titulo (liquidaciones Aave V3, Morpho) no guarda relacion con las capacidades descritas.

El repositorio presenta cero descargas y cero likes en el momento de la consulta, licencia MIT declarada y 14 idiomas etiquetados. No hay pipeline, no hay benchmarks y no hay informacion tecnica verificable. Esta ficha documenta el artefacto tal como aparece publicado, senalando de forma explicita los riesgos de seguridad asociados a la ejecucion de binarios ofuscados de procedencia no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card; no verificable en el binario) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como ZIP con ejecutable `.exe`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de alineamiento (RLHF, DPO) en la informacion disponible. El artefacto es un ejecutable nativo de Windows de 64 bits, distribuido comprimido en un archivo ZIP de 4,8 MB y protegido con la contrasena `2026`. La model card menciona un identificador de build (`9D708D`) y una version de ejecutable (`v4.9.5`), pero no aporta informacion sobre el compilador, las dependencias, la cadena de suministro ni el proceso de construccion.

Las unicas caracteristicas tecnicas declaradas corresponden a un software de automatizacion de entrada y lectura de memoria en el contexto de videojuegos: sondeo a 274 Hz y 299 Hz, hasta 14 hilos de trabajo, resolucion dinamica de firmas de punteros tras parches, renderizado mediante Desktop Duplication y exclusion de capturas de pantalla. Ninguna de estas afirmaciones es verificable sin ejecutar el binario, lo que constituye en si mismo un riesgo de seguridad.

## Capacidades

- Distribucion de un ejecutable de Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`) mediante un ZIP alojado en un repositorio de GitHub de terceros.
- Suavizado de entrada por curvas de Bezier con radio de campo de vision configurable, segun la model card.
- Radar 2D con filtro de objetos por rareza y seguimiento de contenedores, segun la model card.
- Capa de render resistente a capturas de pantalla (exclusion en OBS, ShadowPlay y Discord), segun la model card.
- Tecla de panico (`END`) para terminacion del proceso, segun la model card.
- Escaneo dinamico de offsets de memoria tras actualizaciones del software objetivo, segun la model card.
- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo de pensamiento.
- No se declara ninguna capacidad relacionada con liquidaciones DeFi reales (lectura de contratos, firma de transacciones, estimacion de gas, monitorizacion de posiciones).

## Casos de uso

- Auditoria de seguridad y analisis de malware: el artefacto puede utilizarse en un entorno aislado (maquina virtual sin red, sin credenciales) para estudiar tecnicas de evasion de captura de pantalla y ofuscacion de binarios. Es el unico uso con justificacion tecnica razonable.
- Formacion en concienciacion sobre riesgos de cadena de suministro: sirve como ejemplo documentado de model card que suplanta la identidad de un modelo de IA para distribuir software de terceros.
- Investigacion de tecnicas de proteccion de integridad en videojuegos: un equipo antitrampas podria analizar las tecnicas de lectura de memoria y renderizado que la model card declara.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de datos, trading, gestion de riesgos DeFi ni ninguna otra tarea de IA.
- No es adecuado para operar liquidaciones en Aave V3 o Morpho: no se documenta ninguna integracion con nodos RPC, contratos, claves o firmantes.
- No es adecuado para despliegue en produccion de ningun tipo: no hay API, no hay servidor de inferencia y no hay soporte del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, dado que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no ejecuta inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Espacio en disco: aproximadamente 4,8 MB para el ZIP; el tamano descomprimido no esta disponible.
- Opciones de despliegue: ejecucion nativa como proceso de usuario en Windows; no soporta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card declara sondeo a 274 Hz y 299 Hz y tiempos de respuesta inferiores a 34 ms para la tecla de panico; estas cifras no son verificables de forma independiente.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Woj93/aave-v3-morpho-evm-liquidation-bot | Ejecutable Windows x64 (no es un modelo de IA) | no disponible | no disponible | MIT | ZIP en GitHub de terceros, 0 descargas |
| Modelo de lenguaje open source de referencia | Modelo neuronal con pesos publicados | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada modelos comparables de la misma categoria, porque el artefacto no pertenece a ninguna categoria de modelo de IA. Cualquier comparacion con modelos de lenguaje, modelos de vision o sistemas DeFi de codigo abierto seria metodologicamente incorrecta.

## Limitaciones y advertencias

- Suplantacion de categoria: la model card emplea terminologia de modelos de IA (tags, idiomas, licencia, pipeline) para un binario ejecutable, lo que puede inducir a error a quien lo encuentre en busquedas.
- Riesgo de malware: el binario se distribuye comprimido con contrasena y alojado en un repositorio de GitHub ajeno al autor declarado (`dawidb9567`, `sita494`), una practica habitual para evadir el analisis automatico de antivirus. No debe ejecutarse fuera de una maquina virtual aislada.
- Contenido declarado como trampa para videojuegos: la propia model card admite que el binario es un `game cheat`, lo que puede violar los terminos de servicio de plataformas de juego y la legislacion de algunos paises.
- Incoherencia funcional: el titulo sugiere un bot de liquidaciones DeFi, pero las capacidades descritas (radar 2D, filtro de botin, evasion de captura) no tienen relacion con Aave V3 ni Morpho.
- Cero validacion social: 0 descargas y 0 likes en el momento de la consulta; sin issues, sin discusiones y sin historial de mantenimiento.
- Licencia MIT declarada pero no verificable: no hay archivo LICENSE en la informacion proporcionada ni metadatos de autoria que permitan atribuir el codigo.
- Sin soporte ni actualizaciones: creado y actualizado el mismo dia (2026-11-24), sin versionado posterior.
- No apto para produccion: no existe API, documentacion tecnica, garantias de seguridad ni proceso de divulgacion de vulnerabilidades.
- Recomendacion: no descargar ni ejecutar el binario; si se hace por motivos de investigacion, hacerlo en una maquina virtual sin red, sin credenciales y con instantanea previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Woj93/aave-v3-morpho-evm-liquidation-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/sita494/aave-v3-morpho-evm-liquidation-bot
- Repositorio de GitHub del binario: https://github.com/dawidb9567/delta-executor-pc-2026
- Enlace de descarga directa citado: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Documentacion de Aave V3 (referencia del dominio que el titulo invoca): https://docs.aave.com/developers/
- Documentacion de Morpho (referencia del dominio que el titulo invoca): https://docs.morpho.org/
