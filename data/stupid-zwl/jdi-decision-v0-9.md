# stupid-zwl/JDI-Decision-V0.9

## Resumen

JDI-Decision-V0.9 es un sistema multimodal de decision desarrollado por JD Industrials (京东工业), el brazo industrial de JD.com. Se construye sobre una base Qwen3.8-27B (etiquetada como `qwen3_5` en los tags del repositorio) con adaptaciones de la arquitectura de decision D3, y su proposito no es la generacion libre de texto sino la seleccion estructurada de opciones con probabilidades asociadas, tanto para entradas de texto como de imagen. Integra un encoder de vision propio, un componente OCR congelado basado en PaddleOCR v5 de Baidu y un backbone de decision que culmina en una capa de lectura en FP32.

El modelo resuelve el problema de la toma de decisiones automatizada en contextos industriales: dada una imagen (por ejemplo, una senal, una etiqueta o un documento) y un conjunto de opciones con criterios definidos, devuelve la opcion seleccionada acompanada de su probabilidad. Esta orientado a evaluacion de sistemas de decision mas que a conversacion abierta, y su interes actual radica en que combina reconocimiento de texto visual con razonamiento sobre opciones, una combinacion poco frecuente en modelos abiertos de este tamano.

Con aproximadamente 26.085 millones de parametros totales (26,09 B) y un repositorio de 52,2 GB en formato safetensors, se distribuye bajo licencia CC BY-NC 4.0, lo que restringe el uso comercial sin autorizacion expresa. La version V1 del modelo se ha trasladado a la organizacion JoyIndustrial, por lo que esta ficha corresponde exclusivamente a V0.9.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Qwen3.8-27B y adaptaciones de decision D3; encoder de vision, OCR PaddleOCR v5 congelado y capa de lectura FP32 |
| Parametros totales | 26.085.330.160 (~26,09 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 (uso no comercial con atribucion; uso comercial requiere permiso separado) |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El sistema sigue un flujo de inferencia en dos ramas paralelas que se ejecutan de forma concurrente en una sola GPU. La primera rama es un encoder de vision que extrae caracteristicas de la imagen; la segunda es un componente OCR congelado basado en PaddleOCR v5, desarrollado por el equipo PaddlePaddle de Baidu, que reconoce el texto presente en la imagen. Las imagenes se decodifican, se convierten a RGB y se redimensionan para respetar un limite de pixeles antes de entrar en ambas ramas. El texto reconocido se incorpora al estado de la peticion mediante `state.image_text_transcription`, complementando —no sustituyendo— la informacion visual original.

El backbone de decision procesa conjuntamente las caracteristicas visuales, el texto transcrito, la pregunta y las opciones, y una capa de lectura en FP32 produce la respuesta estructurada junto con las probabilidades de cada opcion. Las caracteristicas visuales se reutilizan unicamente dentro de la misma peticion. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card remite a una guia de reproduccion (REPRODUCE.md) para los detalles de la arquitectura base y del runtime de decision.

## Capacidades

- Decision estructurada entre opciones con criterios definidos, devolviendo la opcion elegida y su probabilidad.
- Procesamiento multimodal de texto e imagen en una misma peticion.
- Reconocimiento de texto en imagen mediante el componente OCR PaddleOCR v5 integrado.
- Extraccion de caracteristicas visuales mediante encoder dedicado.
- Soporte de preguntas con tipo `choice` e instrucciones y criterios por opcion.
- Entrada de estado arbitrario (`state`) que permite transportar contexto adicional entre la pregunta y el modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no se documentan).
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Verificacion de senalizacion y etiquetas en entornos industriales: dada una fotografia de una senal o etiqueta y un conjunto de opciones cerradas ("STOP", "GO"), el sistema devuelve la lectura mas probable con su probabilidad, combinando el encoder de vision con la transcripcion OCR.
- Inspeccion documental con opciones predefinidas: clasificar documentos escaneados en categorias cerradas (por ejemplo, tipo de albaran o estado de un formulario) aprovechando la rama OCR para el texto y la rama visual para el layout.
- Control de calidad en linea de produccion: evaluar imagenes de piezas o componentes contra criterios de aceptacion definidos como opciones, usando la probabilidad devuelta como umbral de confianza para derivar casos dudosos a revision humana.
- Enrutamiento de incidencias: dada una imagen de una incidencia y un conjunto de categorias de resolucion, seleccionar la categoria mas probable y usar la probabilidad como senal para el escalado automatico.
- Extraccion de decisiones en pipelines de backoffice: integrar `ComboEngine` como paso de decision dentro de un flujo mayor, donde el estado (`state`) transporta contexto acumulado y la salida estructurada alimenta el siguiente paso.
- Evaluacion comparativa de sistemas de decision: usar el paquete de reproduccion (`ocr_inference.ComboEngine`) y el conjunto publico Decision Index Vision para medir el comportamiento del sistema frente a alternativas sobre las mismas entradas.
- Analisis de imagenes con texto denso: escenarios donde el texto es el contenido principal (carteles, paneles, capturas) y se necesita tanto la transcripcion como una decision sobre ella.

## Benchmarks y rendimiento

El autor reporta una puntuacion de **79,3601** en el conjunto publico Decision Index Vision, con 12.210 de 12.210 peticiones exitosas sobre 11 benchmarks. Se trata de una puntuacion autodeclarada, no de un rango confirmado en un leaderboard ni de la puntuacion completa (Full). La evaluacion privada y la validacion oficial de latencia en RTX PRO 6000 estan pendientes.

La ejecucion se realizo con dos workers H200, cada uno con una replica completa del sistema y una peticion simultanea; cada peticion permanecio en una sola GPU. La latencia incluye decodificacion, OCR, codificacion visual y el forward de decision, y excluye carga, hashing de integridad y ejecuciones de profiling.

| Metrica de latencia | Valor |
|---|---:|
| Media | 345,5 ms |
| P50 | 282,4 ms |
| P80 | 426,8 ms |
| P90 | 604,2 ms |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 26,09 B de parametros en safetensors, los pesos en FP16 ocuparian aproximadamente 52 GB, lo que exige GPUs de 80 GB o configuraciones multi-GPU para ejecucion sin cuantizar; no se documentan variantes cuantizadas que reduzcan este requisito.
- GPU recomendadas: el autor valida el sistema en H200 (una GPU por peticion) y menciona una validacion de latencia pendiente en RTX PRO 6000.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamano de pesos, no cabe en GPUs de consumo de 24 GB en precision completa; no se ofrecen pesos GGUF ni cuantizaciones para hacerlo viable.
- Opciones de despliegue: el paquete incluye su propio entry point de inferencia (`ocr_inference.ComboEngine`) con un script de instalacion (`ocr_inference/setup.sh`) que descarga y verifica por SHA256 los archivos OCR oficiales de Paddle. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: media de 345,5 ms por peticion (P50 282,4 ms, P90 604,2 ms) en H200 con una peticion concurrente por GPU; el throughput agregado no se reporta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros sistemas de decision multimodal en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se contrastan caracteristicas estructurales con alternativas de la misma categoria de tamano.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JDI-Decision-V0.9 | ~26,09 B | no disponible | Decision multimodal con OCR integrado | CC BY-NC 4.0 | Hugging Face |
| Qwen3 base (familia) | segun variante | no disponible | LLM generativo multimodal | Apache 2.0 en variantes abiertas | Hugging Face |
| PaddleOCR v5 | no disponible | no disponible | OCR especializado | licencia upstream de Paddle | Paddle hosting oficial |

La comparacion con modelos generativos de proposito general no es directa: JDI-Decision-V0.9 no esta disenado para generar texto libre sino para seleccionar entre opciones con probabilidad calibrada, lo que lo situa en una categoria funcional distinta.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: el uso comercial requiere autorizacion separada de JD Industrials; los componentes de terceros (OCR Paddle y cabeceras de compilacion de Paddle) conservan sus propias licencias.
- La puntuacion de 79,3601 en Decision Index Vision es autodeclarada y no verificada por un leaderboard; la evaluacion privada esta pendiente.
- La validacion de latencia oficial en RTX PRO 6000 no se ha completado; las cifras de latencia publicadas corresponden a H200.
- No se documentan la longitud de contexto, los idiomas soportados ni el regimen de cuantizacion, lo que limita la planificacion de despliegues en produccion.
- El modelo devuelve probabilidades sobre opciones cerradas; no se especifica ningun procedimiento de calibracion ni de umbral de confianza, por lo que la probabilidad no debe interpretarse como certeza sin validacion propia.
- La version V1 se ha trasladado a la organizacion JoyIndustrial; V0.9 es una version anterior y no debe asumirse que recibe mantenimiento.
- El OCR congelado introduce una dependencia de un componente externo cuyo comportamiento en dominios especificos (fuentes, idiomas, ruido visual) no se documenta.
- No se han publicado analisis de sesgos ni evaluaciones de robustez frente a entradas adversarias.
- El repositorio tiene un volumen de 52,2 GB y requiere Python 3.12 con GPU CUDA; no se ofrecen alternativas ligeras de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stupid-zwl/JDI-Decision-V0.9
- Version V1 en la organizacion JoyIndustrial: https://huggingface.co/JoyIndustrial/JDI-Decision-V1
- Dataset de resultados de evaluacion: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V0.9
- Resultados de la ejecucion vision-paddle-v5: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V0.9/tree/main/runs/vision-paddle-v5
- Guia de reproduccion (REPRODUCE.md): referenciada en la model card del repositorio
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
