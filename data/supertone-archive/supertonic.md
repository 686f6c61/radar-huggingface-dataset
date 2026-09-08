# supertone-archive/supertonic

## Resumen

Supertonic es un sistema de text-to-speech (TTS) ligero y ultrarrápido diseñado para ejecutarse completamente en el dispositivo. Lo desarrolla supertone-archive (supertone-inc) y está publicado en Hugging Face bajo la licencia OpenRAIL. Su principal propuesta de valor es la generación de voz en tiempo real sin depender de servicios en la nube, lo que garantiza privacidad total y latencia mínima. Según la documentación, genera audio hasta 167 veces más rápido que el tiempo real en hardware de consumo (probado en un Apple M4 Pro).

El modelo tiene 66 millones de parámetros y está optimizado para ONNX Runtime, con soporte para múltiples backends (CPU, WebGPU/WASM en navegador y GPU mediante PyTorch). Está pensado para despliegue en servidores, navegadores y dispositivos edge, con ejemplos de integración en Python, Node.js, Java, C++, C#, Go, Swift, iOS, Rust y Flutter. Su tamaño de repositorio es de 0,3 GB, lo que refleja su ligereza. El modelo está archivado en Hugging Face, lo que sugiere que no recibe mantenimiento activo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sistema TTS basado en ONNX Runtime) |
| Parametros totales | 66M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de text-to-speech) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | openrail |
| Formato de pesos | ONNX (con variantes PyTorch para GPU) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo ni sobre los datos utilizados en su entrenamiento. La documentacion indica que es un sistema TTS optimizado para ONNX Runtime, con 66 millones de parametros, y que procesa texto natural (numeros, fechas, moneda, abreviaturas y expresiones complejas) sin necesidad de preprocesamiento. Genera audio en formato WAV de 16 bits y soporta inferencia por lotes para mejorar el rendimiento. La unica innovacion tecnica destacable es su capacidad de ejecucion local multiplataforma, con soporte para WebGPU/WASM en navegadores y ONNX Runtime en CPU, ademas de una variante PyTorch para GPU (aunque esta ultima no aparece como probada en la documentacion de ONNX).

## Capacidades

- Generacion de voz en ingles a partir de texto, con salida en WAV de 16 bits.
- Procesamiento natural de numeros, fechas, moneda, abreviaturas y expresiones complejas sin preprocesamiento manual.
- Inferencia por lotes (batch) para aumentar el rendimiento en aplicaciones con multiples solicitudes.
- Ejecucion completamente local, sin llamadas a APIs ni envio de datos a servidores externos.
- Soporte multiplataforma mediante ONNX Runtime y onnxruntime-web, con ejemplos de integracion en Python, Node.js, Java, C++, C#, Go, Swift, iOS, Rust y Flutter.
- No soporta tool calling, vision ni entrada multimodal. Es exclusivamente un modelo de text-to-speech.

## Casos de uso

- Asistentes de voz en dispositivos moviles: al ejecutarse localmente, Supertonic permite generar respuestas habladas sin latencia de red ni dependencia de servicios externos, ideal para apps de iOS o Android que requieren privacidad.
- Accesibilidad para personas con discapacidad visual: puede integrarse en lectores de pantalla o aplicaciones de lectura de documentos, generando audio en tiempo real a partir de texto en ingles.
- Narracion de contenido y audiobooks: su velocidad de generacion (hasta 1263 caracteres por segundo en CPU M4 Pro) permite producir narraciones largas de forma rapida y economica, sin costes por API.
- Sistemas de navegacion GPS: las instrucciones de voz pueden generarse en el dispositivo, lo que garantiza funcionamiento sin conexion y baja latencia en aplicaciones de mapas.
- Atencion al cliente automatizada: puede utilizarse para leer respuestas generadas por chatbots en ingles, ofreciendo una experiencia de voz natural sin depender de proveedores de TTS en la nube.
- Videojuegos y aplicaciones interactivas: su ligereza (66M de parametros) permite incluir voces de personajes o efectos de narracion en juegos para dispositivos con recursos limitados.
- Herramientas de productividad: lectura en voz alta de correos electronicos, documentos o noticias en aplicaciones de escritorio o web, con procesamiento local para proteger la confidencialidad.

## Benchmarks y rendimiento

La informacion proporcionada incluye datos de rendimiento en velocidad, medidos en caracteres por segundo y factor de tiempo real (RTF) para textos de diferente longitud. No se han publicado benchmarks de calidad (como WER o CER) en la informacion disponible.

| Sistema | Caracteres por segundo (texto corto, 59 caracteres) | Caracteres por segundo (texto medio, 152 caracteres) | Caracteres por segundo (texto largo, 266 caracteres) | RTF (texto largo) |
|---|---|---|---|---|
| Supertonic (M4 Pro CPU) | 912 | 1048 | 1263 | 0.012 |
| Supertonic (M4 Pro WebGPU) | 996 | 1801 | 2509 | 0.006 |
| Supertonic (RTX 4090, PyTorch) | 2615 | 6548 | 12164 | 0.001 |
| Kokoro (M4 Pro CPU, ONNX) | 104 | 107 | 117 | no disponible |
| NeuTTS Air (M4 Pro CPU, Q8-GGUF) | 37 | 42 | 47 | no disponible |

Nota: los valores de Kokoro y NeuTTS Air proceden de la tabla de rendimiento del autor. Los datos de RTF para estos modelos no se incluyen en la documentacion.

## Requisitos de hardware

- Inferencia en CPU: probada en Apple M4 Pro con ONNX Runtime. El modelo es muy ligero y deberia funcionar en CPUs de consumo con un uso moderado de memoria.
- Inferencia en GPU: probada con PyTorch en una RTX 4090, aunque la documentacion indica que el modo GPU de ONNX Runtime no esta probado.
- VRAM estimada: no disponible. Dado que el modelo tiene 66M de parametros, se espera que quepa en GPUs con poca memoria (por ejemplo, 4-8 GB), pero no hay cifras confirmadas.
- Opciones de despliegue: ONNX Runtime (CPU), onnxruntime-web (WebGPU/WASM en navegador) y PyTorch para GPU. Tambien se proporcionan ejemplos para multiples lenguajes.
- Latencia y rendimiento: el RTF observado en CPU M4 Pro es de 0.012 (texto largo), lo que significa que genera un segundo de audio en 12 milisegundos. En RTX 4090 el RTF baja a 0.001.

## Comparativa con modelos similares

Se comparan modelos open source de TTS que aparecen en la tabla de rendimiento del autor. No se dispone de datos de parametros ni licencia para Kokoro y NeuTTS Air.

| Modelo | Parametros | Caracteres por segundo (texto largo) | RTF (texto largo) | Licencia |
|---|---|---|---|---|
| Supertonic | 66M | 1263 (M4 Pro CPU) | 0.012 | openrail |
| Kokoro | no disponible | 117 | no disponible | no disponible |
| NeuTTS Air | no disponible | 47 | no disponible | no disponible |

Supertonic supera claramente a estos modelos en velocidad. Sin embargo, al no haber benchmarks de calidad, no se puede evaluar la naturalidad o precision de la voz frente a alternativas.

## Limitaciones y advertencias

- Solo soporta ingles. No se han publicado modelos multilingues en esta version.
- El modo GPU de ONNX Runtime no esta probado, por lo que el despliegue en GPU puede presentar problemas no documentados.
- No se han publicado benchmarks de calidad (WER/CER), por lo que no es posible valorar la precision de la pronunciacion en comparacion con otros modelos TTS.
- El repositorio esta archivado (supertone-archive), lo que indica que puede no recibir actualizaciones ni soporte activo.
- La licencia OpenRAIL permite uso comercial, pero es necesario revisar los terminos completos de la licencia para conocer las condiciones especificas.
- Como modelo TTS generativo, puede producir pronunciaciones incorrectas de nombres propios, terminos tecnicos o palabras poco frecuentes, especialmente sin un diccionario personalizado.

## Enlaces

- Hugging Face: https://huggingface.co/supertone-archive/supertonic
- Repositorio de GitHub: https://github.com/supertone-inc/supertonic
- Demo interactivo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic#interactive-demo
- App de Hugging Face: https://huggingface.co/spaces/akhaliq/supertonic
