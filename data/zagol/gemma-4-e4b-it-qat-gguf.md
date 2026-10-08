# Zagol/gemma-4-E4B-it-qat-GGUF

## Resumen

Gemma 4 E4B es un modelo multimodal abierto desarrollado por Google DeepMind, distribuido aqui por el usuario Zagol en formato GGUF. Forma parte de la cuarta generacion de la familia Gemma, que incluye cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B) con arquitecturas tanto densas como de mezcla de expertos (MoE). Esta variante concreta, E4B, cuenta con 7.463.013.674 parametros (unos 7,46 B) y esta optimizada mediante entrenamiento consciente de cuantizacion (QAT, Quantization-Aware Training), lo que permite conservar una calidad cercana a bfloat16 reduciendo de forma notable los requisitos de memoria.

El modelo es "any-to-any" e "image-text-to-text": procesa texto, imagen (con soporte de relacion de aspecto y resolucion variables), video y audio como entrada, y genera texto como salida. El audio esta soportado de forma nativa en los tamanos E2B, E4B y 12B, por lo que esta variante lo incluye. Google declara una ventana de contexto de hasta 256K tokens en la familia y soporte multilingue en mas de 140 idiomas. Los modelos pequenos de la familia estan disenados especificamente para ejecucion local en portatiles y dispositivos moviles.

La relevancia de este repositorio es practica: ofrece pesos ya cuantizados en GGUF con el esquema Unsloth Dynamic 2.0, listos para desplegar en llama.cpp, Ollama y otros entornos de inferencia local. Ademas, incluye un drafter de Prediccion Multi-Token (MTP) para decodificacion especulativa en el directorio raiz del repositorio (mtp-gemma-4-E4B-it.gguf, un Q4_0), lo que acelera la generacion sin alterar la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (la familia incluye variantes Dense y MoE; la arquitectura concreta de la variante E4B no se detalla en la informacion disponible) |
| Parametros totales | 7.463.013.674 (~7,46 B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 256K tokens en la familia; los modelos pequenos disponen de 128K tokens (dato parcialmente truncado en la model card) |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic 2.0 (por ejemplo UD-Q4_K_XL), Q4_0 (pipeline QAT), wNa8o8 (optimizada para movil) y w4a16 en formato compressed-tensors |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 (con enlace adicional a la licencia de Gemma 4 en ai.google.dev) |
| Formato de pesos | GGUF (original sin cuantizar en safetensors sobre el modelo base) |

## Arquitectura y entrenamiento

Gemma 4 es una familia de modelos multimodales de Google DeepMind. La familia combina variantes densas y de mezcla de expertos (MoE) en cinco tamanos, y esta disenada como "highly capable reasoner" con modos de pensamiento configurables. Los modelos procesan texto, imagen (con soporte de relacion de aspecto y resolucion variables), video y audio; en el caso de E2B, E4B y 12B el audio esta integrado de forma nativa. La salida es siempre texto. La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO.

La innovacion principal de estas versiones es el uso de Quantization-Aware Training (QAT): los checkpoints se optimizan teniendo en cuenta la cuantizacion posterior, de modo que conservan una calidad similar a bfloat16 con un coste de memoria mucho menor. Google publica cuatro formatos QAT (checkpoints sin cuantizar Q4_0, GGUF Q4_0, esquema movil wNa8o8 y tensores comprimidos w4a16 para vLLM). Este repositorio concreto se distribuye como GGUF generado con la herramienta Unsloth, que aplica su esquema Dynamic 2.0. Adicionalmente, el modelo incorpora soporte de Prediccion Multi-Token (MTP): se incluye un drafter en el repositorio que permite decodificacion especulativa; el drafter comparte la cache KV del modelo objetivo y no modifica la salida, ya que el modelo objetivo verifica cada token propuesto.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables.
- Procesamiento de imagen con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de video.
- Procesamiento de audio nativo (soportado en E2B, E4B y 12B).
- Generacion de codigo.
- Capacidades matematicas y de razonamiento multi-paso.
- Soporte multilingue en mas de 140 idiomas.
- Uso como modelo "any-to-any" (entrada multimodal, salida de texto).
- Soporte de tool calling y function calling (la model card muestra un ejemplo de tool-calling en Unsloth Studio).
- Decodificacion especulativa mediante el drafter MTP incluido.
- Ajuste fino posible mediante Unsloth (incluye soporte en Unsloth Studio).

## Casos de uso

- Asistente multimodal en el dispositivo: al ser un modelo pequeno cuantizado (Q4) y con soporte para movil, puede ejecutarse en portatiles y telefonos de gama alta para responder consultas sobre imagenes y audio sin enviar datos a la nube.
- Atencion al cliente automatizada: la ventana de contexto (hasta 128K/256K tokens segun la variante) permite gestionar conversaciones multi-turno extensas y mantener el hilo de incidencias complejas.
- Generacion de codigo en produccion: soporta tool calling, por lo que puede integrarse en pipelines de CI/CD o asistentes de IDE que invocan funciones y APIs.
- Analisis de imagenes y documentos: su capacidad image-text-to-text con resolucion variable permite extraer informacion de capturas, diagramas o documentos escaneados y resumirlos en texto.
- Transcripcion y analisis de audio: al soportar audio de forma nativa, puede emplearse para resumir reuniones, generar actas o clasificar fragmentos de audio.
- Subtitulado y descripcion de video: la entrada de video permite generar descripciones o subtitulos sobre material audiovisual.
- Procesamiento multilingue: con mas de 140 idiomas, es adecuado para traduccion, localizacion de contenido y moderacion de textos en multiples lenguas.
- Investigacion sobre cuantizacion: los checkpoints QAT y los distintos formatos (GGUF, w4a16, wNa8o8) sirven como base para estudiar el impacto de la cuantizacion en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~7,46 B parametros, una cuantizacion Q4 en GGUF ocupa en torno a 4,5-5 GB; una Q8 en torno a 8 GB; y los pesos en precision completa (bfloat16) alrededor de 15 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos confirmados en la informacion proporcionada.
- GPU recomendadas: tarjetas de gama alta como A100 o H100 para precision completa o lotes grandes; RTX 4090 y similares para cuantizaciones Q8/Q4 con margen amplio.
- Consumer GPU: si cabe en GPU de consumo. Una RTX 3060 de 12 GB o superior puede ejecutar la version Q4 en GGUF, y tarjetas con 8 GB podrian ejecutar la cuantizacion Q4 en funcion del contexto utilizado.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (mediante los pesos w4a16 en compressed-tensors) y Unsloth Studio. La model card incluye un ejemplo de servidor llama.cpp con decodificacion especulativa MTP.
- Latencia y throughput: no disponible. La decodificacion especulativa con el drafter MTP esta disenada para aumentar la velocidad de generacion, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

La informacion proporcionada describe la propia familia Gemma 4 en cinco tamanos, pero no aporta datos de rendimiento ni comparativas con modelos de otros desarrolladores. A continuacion se recoge la comparacion dentro de la familia segun los datos disponibles:

| Modelo | Parametros | Contexto | Audio nativo | Licencia |
|---|---|---|---|---|
| Gemma 4 E2B | no disponible | 128K (modelos pequenos) | si | Apache 2.0 |
| Gemma 4 E4B (este) | 7,46 B | 128K/256K | si | Apache 2.0 |
| Gemma 4 12B | no disponible | no disponible | si | Apache 2.0 |
| Gemma 4 26B A4B | no disponible (MoE) | no disponible | no indicado | Apache 2.0 |
| Gemma 4 31B | no disponible | no disponible | no indicado | Apache 2.0 |

Comparativa con modelos de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Los datos de benchmarks no se han publicado en la informacion disponible, por lo que no es posible verificar el rendimiento frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de razonamiento y resumen de documentos.
- La model card indica un contexto de 128K para los modelos pequenos y de hasta 256K en la familia; el dato exacto para E4B aparece truncado en el material proporcionado, por lo que conviene confirmarlo en la documentacion oficial.
- Existe una posible discrepancia de licencia: las etiquetas de HuggingFace y la model card indican Apache 2.0, pero el campo license_link apunta al documento de licencia de Gemma 4 en ai.google.dev. Es recomendable revisar los terminos de la licencia de Gemma 4 antes de un uso comercial.
- "Parametros activos": no disponible. Si la variante E4B resultara ser de tipo MoE, no se especifica cuantos parametros se activan por token.
- Este repositorio lo publica el usuario Zagol a partir del modelo base google/gemma-4-E4B-it-qat-q4_0-unquantized; no es un repositorio oficial de Google. El repositorio muestra 0 descargas y 0 "likes", por lo que su adopcion y validacion por la comunidad es limitada.
- La fecha de creacion indicada (2026-10-07) y los resultados de la busqueda web no aportan informacion tecnica relevante sobre el modelo; los enlaces devueltos por la busqueda tratan sobre ChatGPT y no son aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zagol/gemma-4-E4B-it-qat-GGUF
- Guia de Gemma 4 QAT de Unsloth: https://unsloth.ai/docs/models/gemma-4/qat
- Guia de Unsloth Dynamic 2.0 GGUFs: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Guia de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4
- Guia de MTP en Unsloth: https://unsloth.ai/docs/models/mtp
- Guia de Unsloth Studio: https://unsloth.ai/docs/new/studio
- Coleccion de Gemma 4 QAT en HuggingFace: https://huggingface.co/collections/unsloth/gemma-4-qat
- Coleccion de Gemma 4 de Google en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre ChatGPT y no se han incluido.
