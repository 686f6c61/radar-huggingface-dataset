# TechnoBaptist/clef

## Resumen

Clef es un modelo multimodal de 27 356 728 560 parámetros (aproximadamente 27,36 mil millones) construido como un *post-train* de Qwen/Qwen3.8-27B, que incluye su encoder de visión. No es un modelo generativo de texto libre: su función es convertir un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas en decisiones, devolviendo una probabilidad para cada opción permitida de cada pregunta en un único forward pass. No hay generación de texto ni parseo de salida. La model card lo describe como un "decision model" y lo sitúa dentro del ecosistema de APIs Jev y SystemOne, con las que su interfaz es totalmente compatible.

El modelo está pensado para sustituir flujos en los que se usaba un LLM generativo más un analizador de la salida: en lugar de producir texto que después hay que interpretar, Clef emite logits directamente sobre las opciones definidas por el desarrollador, lo que elimina errores de formato y permite obtener confianzas calibradas por pregunta. La arquitectura añade al backbone un *joint schema head*, una cabeza transformer pequeña que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas.

Los datos disponibles proceden del repositorio TechnoBaptist/clef, que replica la model card de Cloudflare/clef (el código de ejemplo descarga `Cloudflare/clef`). El repositorio analizado tiene 0 descargas y 0 *likes* en el momento de la consulta, 55,0 GB de tamaño y licencia Apache-2.0. Es relevante porque propone un patrón distinto al del *prompt engineering* sobre modelos generativos: esquemas tipados, salida estructurada nativa y despliegue con SGLang.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone transformer multimodal Qwen/Qwen3.8-27B (con encoder de visión) más una cabeza transformer pequeña (*joint schema head*) que puntúa conjuntamente todas las opciones de todas las preguntas |
| Parámetros totales | 27 356 728 560 (aproximadamente 27,36 B) según los safetensors del repositorio |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (variante indicada en el cookbook de SGLang); no se documentan otros formatos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone fragmentado con `model.safetensors.index.json`) más `joint_head.safetensors` para la cabeza de esquema |

## Arquitectura y entrenamiento

Clef parte del backbone Qwen/Qwen3.8-27B, incluido su encoder de visión, almacenado como safetensors fragmentados estándar. Sobre él se añade una cabeza de esquema conjunta (*joint schema head*), un transformer pequeño que lee los estados ocultos finales del backbone, enruta la evidencia procedente del estado hacia cada pregunta del esquema y puntúa todas las opciones de todas las preguntas de forma conjunta. La salida es un logit por cada opción permitida de cada pregunta; aplicando un softmax por pregunta se obtienen probabilidades. El repositorio incluye el código propio del modelo en `joint_schema_model.py`, que implementa la codificación de registros, el *batching*, el modelo, `load_release_model` y la función `systemone`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras. Sí se indica que se trata de un modelo *post-trained* a partir de Qwen/Qwen3.8-27B (relación `finetune`), y que existe una variante menor y más rápida, Clef-Flash. La innovación destacable es el propio paradigma de decisión: en lugar de generar texto y parsearlo, el modelo produce directamente puntuaciones sobre un esquema tipado, con tipos de pregunta `choice` (elección entre criterios), `score` (puntuación con leyenda) y `noul` (probabilidad de verdadero). La model card indica que el modelo fue probado con `torch` 2.11 y `transformers` 5.10.2 en una única H200, y que las entradas de imagen y vídeo requieren además `pillow`.

## Capacidades

- Decisión estructurada con salida tipada: devuelve una probabilidad por cada opción permitida de cada pregunta del esquema, sin generación de texto libre ni parseo posterior.
- Tipos de pregunta soportados: `choice` (con criterios definidos por el usuario, devuelve `choice`, `confidence` y `probabilities`), `score` (devuelve la puntuación esperada, `confidence`, `legend` y `probabilities`) y `noul` (probabilidad de verdadero).
- Entrada multimodal: acepta el estado en texto, JSON, imágenes (PIL) o vídeo (arrays de fotogramas). Los registros de solo texto y multimodales pueden mezclarse en el mismo lote.
- Puntuación conjunta: todas las preguntas de un esquema se puntúan en un único forward pass, lo que permite modelar dependencias entre preguntas.
- Compatibilidad de API con Jev y SystemOne: `systemone` acepta un cuerpo de petición `POST /v1/systemone` y devuelve el mismo formato de respuesta, con `model`, `answers` indexadas por ID de pregunta y `usage`.
- Servicio mediante SGLang en el endpoint `/v1/systemone`, con despliegue documentado en H200, B200 y B300.
- Procesamiento de imágenes y vídeo mediante el procesador incluido (`processor_config.json`, argumentos opcionales en `media_kwargs`).
- No se documentan capacidades de *tool calling*, uso de agentes, razonamiento multi-paso en texto libre, ni un modo de pensamiento explícito. No se documentan idiomas soportados.

## Casos de uso

- Triaje de tickets de soporte: con un esquema de preguntas `choice` (departamento responsable), `noul` (¿hay un servicio caído?) y `score` (urgencia), el modelo devuelve probabilidades por opción en una sola pasada, lo que permite enrutar el ticket a facturación o a técnico sin parsear texto generado.
- Clasificación de facturas y documentos: enviando el estado como JSON (`vendor`, `total`, `currency`, `status`) o como imagen del documento, se pueden obtener decisiones tipadas como si la factura está pagada, vencida o en borrador, y si el importe supera un umbral.
- Verificación de calidad documental: con una imagen (por ejemplo, un recibo) y preguntas `noul` sobre legibilidad o presencia de campos, el modelo actúa como comprobador previo a un pipeline de OCR, devolviendo una probabilidad en lugar de una afirmación binaria no calibrada.
- Enrutamiento y orquestación de agentes: definir un esquema con la siguiente acción o subagente a invocar y usar las probabilidades por opción como señal de decisión para un planificador; al no haber texto libre, la salida es directamente consumible por código.
- Moderación y política de contenido: plantear preguntas `noul` o `choice` sobre categorías de política permite obtener una decisión por categoría en el mismo forward pass, con confianza asociada para fijar umbrales.
- Evaluación automática con jueces tipados: usar el modelo como evaluador de respuestas o de trayectorias, con preguntas `score` y leyendas explícitas, aprovechando que las probabilidades son comparables entre elementos de un mismo esquema.
- Análisis de vídeo para eventos: con `videos` como arrays de fotogramas y preguntas `noul`, se pueden detectar condiciones concretas (presencia de un objeto, ocurrencia de un evento) sin necesidad de un generador de descripciones.
- Detección de urgencia en mensajes entrantes: el ejemplo de la propia model card, en el que un mensaje de texto libre se convierte en la probabilidad de que exprese urgencia, apto para prefiltrar colas de atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a un *leaderboard* denominado Decision Index (`clef-evals.workers-ai-mle.workers.dev`), pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación en el material proporcionado.

## Requisitos de hardware

- Peso en memoria de los pesos en bf16: aproximadamente 54,7 GB solo para los parámetros (27 356 728 560 × 2 bytes), a los que hay que sumar el coste de activaciones, caché KV y el procesamiento de imagen o vídeo. El repositorio completo ocupa 55,0 GB.
- GPU recomendadas según la documentación disponible: H200 (una única GPU, configuración probada por el autor y usada en el ejemplo de SGLang), B200 y B300 (el cookbook de SGLang incluye comandos de lanzamiento para las tres).
- GPU de consumo: no cabe en tarjetas de consumo tipo RTX 4090 (24 GB) en bf16. No se documentan cuantizaciones GGUF ni versiones de menor precisión, por lo que no hay una ruta de despliegue en consumer GPU descrita en la información disponible.
- A100 de 80 GB: no disponible (no se documenta ni se verifica en la información proporcionada).
- Opciones de despliegue documentadas: `transformers` (probado con `torch` 2.11 y `transformers` 5.10.2) con el código propio `joint_schema_model.py`, y SGLang mediante la imagen `lmsysorg/sglang:dev-clef` con el comando `sglang serve --model-path Cloudflare/clef`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que Clef-Flash es la variante más pequeña y rápida, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef | 27,36 B | no disponible | Probabilidades por opción de un esquema tipado (sin texto libre) | Apache-2.0 | HuggingFace (Cloudflare/clef; el repositorio analizado es TechnoBaptist/clef), servible con SGLang |
| Clef-Flash | no disponible | no disponible | Igual que Clef (variante menor y más rápida) | no disponible | HuggingFace (Cloudflare/clef-flash), según la model card |
| Qwen/Qwen3.8-27B (modelo base) | 27 B (indicado en el nombre) | no disponible | Generación de texto libre | no disponible | HuggingFace (Qwen/Qwen3.8-27B), usado como base del *post-train* |

No se dispone de información sobre otros modelos de decisión comparables en el material proporcionado.

## Limitaciones y advertencias

- El modelo no genera texto libre: no puede emplearse como chatbot, redactor ni asistente conversacional general. Su uso está restringido a esquemas de preguntas tipadas previamente definidos.
- Requiere definir un esquema (`choice`, `score`, `noul`) y sus criterios; un esquema mal diseñado o ambiguo degrada directamente la calidad de la decisión, y no hay una etapa de texto que permita corregir a posteriori.
- Riesgo de calibración incorrecta: las probabilidades devueltas por el softmax pueden estar mal calibradas y sobreestimar la confianza. No hay datos de evaluación publicados en la información disponible para validar la calibración.
- No se documentan idiomas soportados, por lo que no puede afirmarse cobertura multilingüe ni un rendimiento concreto en castellano.
- No se documenta la longitud de contexto, lo que impide planificar entradas largas (por ejemplo, documentos extensos o vídeos de muchos fotogramas) con garantías.
- Utiliza código propio del repositorio (`joint_schema_model.py`) y está etiquetado como `custom-code`, lo que implica ejecutar código remoto al cargar el modelo; conviene auditar el archivo antes de usarlo en producción.
- Discrepancia de identidad del repositorio: el ID consultado es TechnoBaptist/clef (0 descargas, 0 *likes*, creado el 2026-10-09), mientras que la model card y los ejemplos de código hacen referencia a `Cloudflare/clef` y a `Cloudflare/clef-flash`. Para producción conviene verificar el origen y la integridad de los pesos antes de desplegarlos.
- Licencia Apache-2.0 en el repositorio, lo que en principio permite uso comercial. No obstante, no se detallan en la información disponible posibles condiciones heredadas del modelo base Qwen/Qwen3.8-27B, por lo que se recomienda revisar la licencia del modelo base antes de un despliegue comercial.
- No se documentan latencia, throughput ni requisitos de memoria medidos más allá de la indicación de una H200; los requisitos de hardware en otras GPU no están verificados.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/TechnoBaptist/clef
- Repositorio referenciado en la model card: https://huggingface.co/Cloudflare/clef
- Variante menor y más rápida: https://huggingface.co/Cloudflare/clef-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Cookbook de SGLang para Clef: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef#hw=h200&variant=clef&quant=bf16&strategy=balanced&nodes=single

Los resultados de la búsqueda web proporcionados (catálogos en PDF de Master y EGA Master) no guardan relación con el modelo y no se han incluido.
