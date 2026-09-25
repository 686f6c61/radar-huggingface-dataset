# WhiskyAKM/K2-Horizon-7B-NVFP4-GGUF

## Resumen

K2-Horizon-7B-NVFP4-GGUF es una conversión comunitaria a formato GGUF del modelo IFM/K2-Horizon-7B, publicada por el usuario WhiskyAKM. Se trata de un modelo denso decoder-only de la familia K2-Horizon, desarrollada por el Institute of Foundation Models (IFM), que ocupa la posición intermedia de una flota de seis tamanos (0,9B, 3,7B, 7B, 32B, 36B-A4B y 375B-A23B). El modelo base emplea una ventana de contexto nativa de 512K tokens (524.288) desde las etapas de midtraining.

La relevancia de esta publicación concreta es que empaqueta el modelo en cuantización NVFP4 (formato de coma flotante de 4 bits de NVIDIA orientado a hardware Blackwell) dentro de un contenedor GGUF, lo que permite ejecutarlo con llama.cpp y motores compatibles sin necesidad de infraestructura propietaria. El repositorio ocupa 5,3 GB y contiene un único archivo de pesos.

El modelo base se presenta como una linea base densa fuerte en tareas agénticas, de codigo, de contexto largo y de razonamiento, con resultados publicados en SWE-bench Verified, HMMT, HLE, SciCode, Terminal-Bench y tau3-Banking. Esta conversión no aade capacidades nuevas: hereda el comportamiento del modelo original, con la degradación esperada por la cuantización a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon-7B, transformer decoder-only denso |
| Parametros totales | 8.999.178.240 (segun safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) nativos |
| Tipos de cuantizacion | NVFP4 (4 bits, coma flotante de NVIDIA); este repositorio solo distribuye NVFP4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo: `K2-Horizon-7B-nvfp4.gguf`) |
| Tamano del repositorio | 5,3 GB |
| Modalidades | Texto |
| Libreria de inferencia | llama-cpp |
| Modelo base | IFM/K2-Horizon-7B |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo K2-Horizon-7B, con soporte de texto unicamente y una ventana de contexto nativa de 524.288 tokens. La model card indica que esa longitud de contexto es nativa "desde las etapas de midtraining", lo que sugiere una extension planificada del contexto durante el entrenamiento en lugar de un ajuste posterior. El autor de esta conversion no aporta informacion sobre numero de capas, dimensiones ocultas, cabezas de atencion, tipo de atencion (completa, lineal o hibrida) ni detalles del tokenizador.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones concretas de decodificacion. La unica informacion tecnica adicional es que el modelo base forma parte de una flota publicada con pesos, codigo, datos de entrenamiento y metodologias abiertas, segun el comunicado de IFM recogido en los resultados de busqueda, aunque el contenido concreto de esos artefactos no se detalla en la documentacion disponible.

La innovacion de esta publicacion es exclusivamente de empaquetado: la conversion a NVFP4 en GGUF, optimizada para hardware NVIDIA Blackwell, que reduce el peso a 5,3 GB y lo hace desplegable en llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat mediante llama-cli y llama-server (API compatible con OpenAI).
- Razonamiento matematico: obtiene 73,3 en HMMT Feb 2026, por delante de las referencias de su clase citadas por el autor.
- Codigo y resolucion de incidencias en repositorios reales: 70,6 en SWE-bench Verified y 39,1 en Terminal-Bench 2.1, lo que implica manejo de terminal, comandos y flujos de trabajo de ingenieria.
- Razonamiento cientifico: 31,6 en SciCode y 18,6 en HLE.
- Capacidades agenticas: 25,8 en tau3-Banking y 59,0 en BrowseComp, lo que sugiere uso de herramientas y navegacion multi-paso.
- Contexto largo: ventana de 512K tokens, con 68,0 en LCR.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Soporte de tool calling / function calling: no se documenta explicitamente en la informacion disponible, aunque los resultados en benchmarks agenticos (tau3-Banking, BrowseComp) apuntan a ello de forma indirecta.
- Vision y audio: no soportados (modalidad texto unicamente).

## Casos de uso

- Gestion de incidencias en repositorios de software: con 70,6 en SWE-bench Verified, el modelo puede recibir un informe de bug y un arbol de codigo, localizar la causa y proponer un parche. La ventana de 512K permite cargar varios archivos y el historial de cambios sin truncar.
- Automatizacion de terminal y operaciones: los 39,1 en Terminal-Bench 2.1 lo hacen util para agentes que ejecutan comandos, interpretan la salida y encadenan pasos en entornos de shell o pipelines de CI/CD.
- Analisis de documentos largos: informes anuales, expedientes legales o bases de codigo completas caben en el contexto de 524.288 tokens, evitando estrategias de troceado (chunking) y recuperacion que pierden coherencia global.
- Agentes de atencion al cliente multi-turno: la combinacion de contexto largo y resultados en tau3-Banking (25,8) permite mantener conversaciones extensas con historial de tickets, politicas internas y datos de cuenta dentro del mismo prompt.
- Asistencia en investigacion cientifica: la puntuacion de 31,6 en SciCode lo situa por delante de Qwen3.5-9B (27,5) y Granite 4.2-8B (30,4) en esa prueba, lo que lo hace adecuado para prototipado de codigo cientifico y analisis de literatura tecnica extensa.
- Despliegue local en estaciones de trabajo: al ocupar 5,3 GB en NVFP4, es viable ejecutarlo en una GPU de consumo con llama.cpp u Ollama, sin enviar datos a servicios externos, lo que resulta relevante para entornos con requisitos de privacidad.
- Navegacion web asistida y extraccion de informacion: los 59,0 en BrowseComp indican capacidad para tareas de busqueda y sintesis a partir de paginas web, integrable en flujos de investigacion de mercado o monitorizacion competitiva.

## Benchmarks y rendimiento

Resultados publicados en la model card, atribuidos a la descripcion original del modelo K2-Horizon-7B. Las cifras estan en porcentaje y la negrita marca el mejor resultado de cada fila.

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B | Otras referencias |
|---|---|---|---|---|---|
| HMMT Feb 2026 (matematicas) | **73,3** | 63,1 | 65,7 | 66,5 | - |
| SWE-bench Verified (codigo) | **70,6** | 30,6 | 50,8 | 47,7 | - |
| HLE (razonamiento cientifico) | **18,6** | 15,7 | 14,9 | 9,7 | - |
| SciCode (razonamiento cientifico) | **31,6** | - | 27,5 | 30,4 | 28,0 (Mistral Small 4) |
| LCR (general) | **68,0** | 61,7 | 65,3 | 43,3 | - |
| Terminal-Bench 2.1 (codigo) | **39,1** | 27,3 | 29,2 | 18,4 | - |
| tau3-Banking (agentes) | **25,8** | - | 7,0 | 7,6 | 24,0 (Muse Glimmer-30B) |
| BrowseComp (agentes) | **59,0** | - | - | - | 53,5 (DeepSeek V4 Flash), 54,9 (GPT-5), 56,6 (LongCat Flash) |

Advertencia: la model card no especifica si estos resultados corresponden al modelo en BF16 o a esta conversion NVFP4. Es razonable asumir que provienen del modelo base sin cuantizar, por lo que el rendimiento real de los archivos GGUF de este repositorio puede ser inferior. No se han publicado mediciones de rendimiento especificas para la version NVFP4 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa aproximadamente 5,3 GB. Con sobrecarga de runtime y cache KV, una estimacion razonable es de 7 a 9 GB para contextos moderados. Es una estimacion propia, no un dato publicado por el autor.
- Cache KV a contexto completo: con 512K tokens, el consumo de cache KV puede superar ampliamente el de los pesos. No se dispone del numero de capas ni de cabezas, por lo que no es posible calcularlo con precision; se recomienda usar cuantizacion de cache KV (por ejemplo Q8 o Q4) y limitar el contexto en funcion de la VRAM disponible.
- GPU recomendadas: el autor indica que NVFP4 esta optimizado para NVIDIA Blackwell y hardware compatible. Esto incluye las series RTX 50, B100, B200 y GB200. En GPUs Ampere o Ada (RTX 3090, RTX 4090, A100, H100) el modelo puede ejecutarse, pero sin aceleracion nativa de NVFP4.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5070/5080/5090) para contextos cortos o medios. Un RTX 4090 con 24 GB permite margen amplio para contexto y cache KV.
- CPU: al ser GGUF, es posible ejecutarlo total o parcialmente en CPU con llama.cpp, con rendimiento sensiblemente inferior.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), Ollama y otros motores compatibles con GGUF. vLLM y TGI no se mencionan como soportados para NVFP4 en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.
- Parametros de muestreo sugeridos por el autor: `--temp 1.0 --top-p 0.95`.

## Comparativa con modelos similares

Comparativa basada en los modelos de referencia citados por el propio autor en la model card. No se dispone de especificaciones de contexto, licencia ni pesos de esos modelos en la informacion proporcionada, por lo que esas celdas se marcan como no disponibles.

| Modelo | Parametros | Contexto | HMMT Feb 2026 | SWE-bench Verified | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| K2-Horizon-7B (este modelo) | ~7B (9.000M reales) | 512K | 73,3 | 70,6 | 39,1 | Apache 2.0 | GGUF NVFP4, pesos abiertos |
| Qwen3.5-9B | 9B | No disponible | 65,7 | 50,8 | 29,2 | No disponible | No disponible |
| Granite 4.2-8B | 8B | No disponible | 66,5 | 47,7 | 18,4 | No disponible | No disponible |
| Gemma 4-12B | 12B | No disponible | 63,1 | 30,6 | 27,3 | No disponible | No disponible |
| Mistral Small 4 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

En los seis benchmarks donde coinciden, K2-Horizon-7B supera a las tres referencias de su rango de tamano, con la diferencia mas pronunciada en SWE-bench Verified (70,6 frente a 50,8 de Qwen3.5-9B). En BrowseComp compite con modelos de mayor escala como GPT-5 (54,9) y DeepSeek V4 Flash (53,5), segun los datos recogidos por el autor.

## Limitaciones y advertencias

- Cuantizacion NVFP4: la conversion a 4 bits introduce degradacion respecto al modelo base. Los benchmarks publicados probablemente corresponden al modelo sin cuantizar, no a estos archivos GGUF.
- Soporte de hardware limitado: NVFP4 esta optimizado para NVIDIA Blackwell. En GPUs anteriores el rendimiento puede degradarse notablemente y el soporte depende del estado de implementacion en llama.cpp.
- Idioma: el modelo esta etiquetado unicamente como ingles. No se garantiza un rendimiento fiable en castellano ni en otros idiomas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion en la informacion disponible.
- Alucinacion: no se aportan datos sobre tasas de alucinacion ni sobre tecnicas de mitigacion (verificacion factual, citas, abstención).
- Opacidad del entrenamiento: se desconoce el volumen de tokens, la composicion del dataset, el uso de RLHF o DPO y los detalles de la plantilla de chat. Esto dificulta reproducir o auditar el comportamiento.
- Cache KV a 512K: aunque el contexto nativo sea de 524.288 tokens, mantenerlo completo exige recursos de memoria considerables y puede degradar la calidad en posiciones muy lejanas del prompt.
- Conversion no oficial: el repositorio lo publica el usuario WhiskyAKM, no IFM. No hay garantia de equivalencia exacta con los pesos oficiales; para uso critico conviene contrastar con el modelo base de IFM.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion de la comunidad sobre esta conversion concreta.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. No se han detectado clausulas adicionales, pero conviene verificar la licencia del modelo base IFM/K2-Horizon-7B antes de un despliegue comercial.
- Tool calling: no se documenta formalmente el formato de function calling ni la plantilla de herramientas, lo que obliga a validar manualmente cualquier integracion agentica.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/WhiskyAKM/K2-Horizon-7B-NVFP4-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Conversion NVFP4 comunitaria alternativa (ProCreations, con adaptador Uno): https://huggingface.co/ProCreations/K2-Horizon-7B-Uno-NVFP4
- Blog de IFM sobre K2 Horizon: https://ifm.ai/blog/k2/
- Comunicado de prensa de IFM sobre la flota de modelos abiertos: https://www.prnewswire.com/news-releases/institute-of-foundation-models-launches-the-industrys-largest-fully-open-source-fleet-of-ai-models-complete-with-weights-code-training-data-and-methodologies-302868628.html
- Ficha de especificaciones y benchmarks (AI/TLDR): https://ai-tldr.dev/models/k2-horizon-7b/
- Ficha en local-ai-zone (GGUF): https://local-ai-zone.github.io/models/k2-horizon-7b.html
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://apache.org/licenses/LICENSE-2.0
