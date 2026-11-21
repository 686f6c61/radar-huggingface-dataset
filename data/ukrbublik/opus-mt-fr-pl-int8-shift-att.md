# ukrbublik/opus-mt-fr-pl-int8-shift-att

## Resumen

`ukrbublik/opus-mt-fr-pl-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-fr-pl`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de francés a polaco, sin pivote intermedio por inglés, y está pensado para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder seq2seq específico para traducción, con un tamaño de repositorio de 0,1 GB en su variante cuantizada. La conversión la firma el usuario ukrbublik y añade una salida adicional no estándar: `alignment_shift_l2`, que expone las probabilidades de atención encoder-decoder de la capa 2 para permitir alineamientos a nivel de token entre origen y destino.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un avance en calidad de traducción, sino de un artefacto de despliegue. Su interés radica en el formato (ONNX con cuantización dinámica INT8, opset 17, sin past key/values) y en la salida de alineamiento, útil para subtitulado y aplicaciones que necesitan mapear palabras entre idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | francés (fr) como origen, polaco (pl) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-fr-pl` es un Marian NMT, la arquitectura seq2seq de transformer usada en la familia OPUS-MT. Se entrenó sobre datos paralelos del corpus OPUS, tal como describen Tiedemann y Thottingal (2020). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de fine-tuning con RLHF o DPO; para un modelo de traducción de esta familia lo habitual es entrenamiento supervisado sobre corpus paralelos, pero ese dato no se confirma aquí.

La innovación de este repositorio concreto es de empaquetado, no de modelado. El export a ONNX se realizó con optimum (opset 17, sin past key/values, es decir, decodificación sin caché de atención entre pasos). Sobre ese grafo se aplicó cuantización dinámica INT8 de onnxruntime con esquema QInt8 per-tensor. Además, el decoder emite una salida extra, `alignment_shift_l2`, que es una Identity sobre un nodo ya existente y corresponde a las probabilidades de atención encoder-decoder de la capa 2; los pesos y el proceso de decodificación no se modifican. El repositorio incluye `tokenizer_runtime.json` (piezas y scores del SentencePiece original mapeados a ids de vocabulario, más las cadenas de token destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción de texto de francés a polaco, directa, sin pivote por inglés.
- Exposición de alineamientos token a token mediante `alignment_shift_l2` (atención encoder-decoder de la capa 2).
- Tokenización autocontenida en JSON para integración en runtimes propios sin dependencia de la librería de tokenizers original.
- Ejecución en dispositivo mediante onnxruntime con pesos INT8.
- No soporta tool calling ni function calling.
- No incorpora modo de razonamiento, agentes ni multi-step reasoning.
- No tiene capacidades de visión ni audio.
- Multilingüismo limitado estrictamente al par fr→pl.

## Casos de uso

- Subtitulado automático en Android: la salida `alignment_shift_l2` permite alinear cada token traducido con su origen, lo que facilita resaltar la palabra correspondiente en un subtítulo bilingüe; es el caso para el que se creó el modelo (app Subtitle Tap).
- Traducción on-device sin conexión: el tamaño de 0,1 GB y la cuantización INT8 permiten embeber el modelo en una app móvil y traducir sin enviar texto a un servidor, reduciendo latencia y exposición de datos.
- Preprocesado de corpus fr→pl: útil para generar borradores de traducción a gran escala antes de revisión humana, dado el bajo coste de inferencia en CPU.
- Traducción de documentación técnica en pipelines batch: al ser ONNX, se integra en flujos con onnxruntime sin necesidad de stack PyTorch.
- Análisis de alineamiento léxico: la atención de la capa 2 exportada sirve para estudiar correspondencias de palabras entre francés y polaco en tareas de lingüística computacional.
- Prototipado de sistemas de traducción en entornos con recursos limitados (Raspberry Pi, CPUs sin GPU), donde un modelo Marian INT8 es viable y un modelo grande no.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de cualquier dispositivo moderno.
- GPU recomendadas: no se especifican; al ser un modelo pequeño cuantizado, no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer; también en CPU y en dispositivos móviles Android, que es el objetivo declarado.
- Opciones de despliegue: onnxruntime (runtime objetivo), con export previo vía optimum; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-pl-int8-shift-att | Marian NMT | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Salida de alineamiento extra; orientado a on-device |
| Helsinki-NLP/opus-mt-fr-pl | Marian NMT | no disponible | no disponible | safetensors/PyTorch | Apache 2.0 | Modelo base original, sin cuantizar ni salida de alineamiento |
| Otros OPUS-MT fr→X de Helsinki-NLP | Marian NMT | no disponible | no disponible | PyTorch | Apache 2.0 | Misma familia, distinto par de idiomas; no comparables en calidad sin benchmarks |

## Limitaciones y advertencias

- Solo traduce francés a polaco; no es un modelo multilingüe general.
- No se han publicado métricas de calidad (BLEU, chrF) para esta conversión INT8; la cuantización puede degradar ligeramente la calidad respecto al modelo base, y no hay datos que lo cuantifiquen.
- La decodificación se exportó sin past key/values, lo que implica recálculo completo del decoder en cada paso y mayor coste que una versión con caché.
- La salida `alignment_shift_l2` es una Identity sobre un nodo existente; su utilidad depende de que el consumidor interprete correctamente las dimensiones y el significado de la atención de la capa 2.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos NMT, especialmente en frases largas, terminología especializada o lenguaje coloquial.
- Sesgos presentes en los datos OPUS de entrenamiento original, no evaluados en esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-pl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-pl
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): no disponible como enlace directo en la información proporcionada
- Repositorio optimum (export ONNX): no disponible como enlace en la información proporcionada
- onnxruntime: no disponible como enlace en la información proporcionada
