# ukrbublik/opus-mt-pl-en-int8-shift-att

## Resumen

OPUS-MT pl→en INT8 con salida de alineación Shift-Att es una conversión del modelo de traducción automática neuronal Helsinki-NLP/opus-mt-pl-en, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (OPUS-MT). El autor de esta conversión, ukrbublik, lo ha exportado a ONNX y cuantizado a INT8 para su uso en el runtime OPUS on-device de la aplicación Android Subtitle Tap. El modelo traduce directamente de polaco a inglés, sin pivote intermedio por inglés.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de una mejora de capacidades, sino de un artefacto de despliegue optimizado para inferencia local en dispositivos móviles. Su interés técnico reside en la combinación de cuantización dinámica INT8 con ONNX Runtime y en la exposición de una salida adicional de alineación (probabilidades de atención encoder-decoder de la capa 2), útil para aplicaciones de subtitulado que necesitan mapear tokens de origen y destino.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder seq2seq especializado en traducción. El repositorio ocupa aproximadamente 0,1 GB y contiene únicamente artefactos ONNX, tokenizador serializado y metadatos de alineación; no incluye pesos en formato original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-pl-en es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT sobre datos paralelos del corpus OPUS. Esta conversión no reentrena ni modifica los pesos: aplica una exportación con optimum a ONNX (opset 17, sin caché de past key/values) y una cuantización dinámica INT8 con ONNX Runtime en modo QInt8 per-tensor. La decodificación y los pesos subyacentes permanecen sin cambios respecto al modelo original.

La innovación técnica de esta variante es la inclusión de una salida adicional `alignment_shift_l2`, que expone las probabilidades de atención encoder-decoder de la capa 2 del decoder. Se implementa como una Identity sobre un nodo existente, por lo que no altera el grafo de cómputo ni la inferencia. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción directa de polaco a inglés en una sola pasada, sin pivote por inglés.
- Generación de texto seq2seq orientada exclusivamente a traducción; no es un modelo de propósito general.
- Salida de alineación a nivel de token mediante `alignment_shift_l2` (atención encoder-decoder de la capa 2), pensada para subtitulado y mapeo entre tokens origen y destino.
- Tokenizador SentencePiece serializado para su uso en runtime sin dependencias de la librería Transformers.
- Inferencia on-device mediante ONNX Runtime con cuantización INT8.
- No soporta tool calling, function calling, agentes, modo thinking, visión ni audio.
- Capacidades multilingües limitadas al par pl→en.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap puede ejecutar el modelo en el dispositivo para traducir subtítulos del polaco al inglés sin conexión, usando la salida de alineación para sincronizar tokens origen y destino.
- Traducción offline en dispositivos móviles: al estar cuantizado a INT8 y exportado a ONNX, el modelo cabe en un APK y se ejecuta con ONNX Runtime sin depender de servicios en la nube.
- Procesamiento por lotes de documentos polacos: integrable en pipelines de Python con onnxruntime para traducir corpus de tamaño medio en entornos sin GPU.
- Preprocesamiento para pipelines NLP: traducción pl→en previa a tareas de análisis, indexación o búsqueda sobre contenido originalmente polaco.
- Investigación en alineación de tokens: la salida `alignment_shift_l2` permite estudiar correspondencias léxicas entre origen y destino sin modificar el modelo.
- Prototipado de traducción en entornos con restricciones de memoria: el formato ONNX INT8 reduce el peso del artefacto y facilita el despliegue en dispositivos de gama baja.
- Evaluación de cuantización: útil como caso de estudio del impacto de la cuantización dinámica INT8 en calidad de traducción frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que el modelo INT8 es apto para ejecución en CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; al ser un modelo Marian de tamaño base, cualquier GPU consumer moderna es suficiente. No se dispone de datos de rendimiento por GPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del artefacto; también en dispositivos móviles Android mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (principal, con cuantización INT8), integración en apps Android mediante el runtime OPUS de Subtitle Tap. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-pl-en-int8-shift-att | no disponible | no disponible | pl→en | apache-2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-pl-en (base) | no disponible | no disponible | pl→en | apache-2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT pl→en de la familia Marian | no disponible | no disponible | pl→en | apache-2.0 | variable |

La comparación relevante es con el modelo base Helsinki-NLP/opus-mt-pl-en, del que esta variante solo difiere en formato (ONNX INT8) y en la salida de alineación añadida. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción pl→en; no debe usarse para otras tareas ni pares de idiomas.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos NMT, especialmente en dominios especializados o texto con ruido.
- La cuantización dinámica INT8 puede degradar la calidad de traducción respecto al modelo original en fp32; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- No se dispone de información sobre sesgos del modelo base; al entrenarse sobre OPUS, puede reflejar sesgos presentes en los corpus paralelos.
- Longitud de contexto no documentada; el modelo base Marian suele limitar la longitud de secuencia, pero este dato no está confirmado en la información disponible.
- La licencia apache-2.0 permite uso comercial, pero se recomienda mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki según indica la model card.
- El repositorio no incluye los pesos originales en safetensors ni documentación sobre el proceso de exportación más allá de la descripción de la model card.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-pl-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-pl-en
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020 (referenciado en la model card; no se proporciona URL directa en la información disponible).
