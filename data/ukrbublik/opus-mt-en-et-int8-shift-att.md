# ukrbublik/opus-mt-en-et-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-en-et-int8-shift-att` es una conversión a formato ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-et`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Se trata de un modelo Marian de traducción directa del inglés al estonio, pensado para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap, sin pivotar a través de una lengua intermedia.

La relevancia de esta variante concreta reside en su empaquetado para inferencia local: exportación a ONNX (opset 17, sin past key/values) y cuantización dinámica INT8 con onnxruntime, lo que reduce el peso del repositorio a unos 0,1 GB. Además, el decodificador expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, útil para alinear tokens origen y destino en aplicaciones de subtitulado.

La arquitectura subyacente es un transformer encoder-decoder de tipo Marian, con un tamaño de parámetros no especificado en la información disponible. El modelo cubre únicamente el par de idiomas inglés-estonio y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | inglés (en), estonio (et) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-et` es un transformer encoder-decoder de la familia Marian, entrenado sobre datos del corpus OPUS por el grupo de la Universidad de Helsinki. La información disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que proviene de OPUS. Tampoco se documentan etapas de RLHF o DPO.

Esta conversión concreta no modifica los pesos ni el proceso de decodificación: solo cambia el formato de serialización (exportación ONNX con optimum, opset 17, sin past key/values) y aplica cuantización dinámica INT8. La innovación técnica destacable es la exposición de `alignment_shift_l2`, una salida que replica (mediante una operación Identity sobre un nodo existente) las probabilidades de atención encoder-decoder de la capa 2, lo que permite obtener alineaciones token a token sin alterar el comportamiento del modelo. El repositorio incluye además `alignment.json`, un recibo que vincula esa salida al SHA-256 del decodificador, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del SentencePiece original a identificadores de vocabulario.

## Capacidades

- Traducción automática directa del inglés al estonio, sin pivotar por una lengua intermedia.
- Generación de alineaciones de atención (capa 2 del decodificador) mediante la salida `alignment_shift_l2`, útil para correspondencias entre tokens origen y destino.
- Ejecución en dispositivo mediante ONNX Runtime con cuantización INT8.
- Tokenización SentencePiece empaquetada en formato JSON para uso en runtime propio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión o audio).
- Capacidad multilingüe limitada al par en→et.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos en inglés al estonio en el propio dispositivo, sin conexión a servidores, gracias al runtime ONNX INT8 y al reducido tamaño del modelo.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar tokens del subtítulo original y de la traducción, facilitando la sincronización y el resaltado por palabra en reproductores de vídeo.
- Traducción de documentación técnica en inglés a estonio en herramientas de escritorio o móviles con recursos limitados, al caber en un repositorio de 0,1 GB y ejecutarse con onnxruntime.
- Procesamiento por lotes de textos en inglés hacia estonio en pipelines locales sin GPU, aprovechando la cuantización INT8 para reducir requisitos de memoria.
- Integración en extensiones de navegador o lectores de RSS para traducir contenido en inglés al estonio de forma local y privada.
- Generación de corpus paralelos en→et para evaluación o ajuste fino posterior, usando las alineaciones expuestas para filtrar pares de calidad.
- Traducción de interfaces de usuario y cadenas de aplicación del inglés al estonio durante el desarrollo, con inferencia integrada en el propio proceso de compilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es muy reducida (del orden de cientos de MB incluyendo runtime).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU en dispositivos Android mediante onnxruntime.
- Cabe en GPU consumer: sí, con amplio margen, aunque su diseño apunta a CPU y dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-et-int8-shift-att | no disponible | no disponible | en→et | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-et | no disponible | no disponible | en→et | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT en→et | no disponible | no disponible | en→et | Apache 2.0 | variable |

La comparación se limita al modelo base del que deriva, ya que la información disponible no incluye datos de rendimiento ni de otros modelos alternativos del mismo par de idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre OPUS, puede heredar sesgos de los corpus subyacentes.
- Riesgo de alucinación: presente como en cualquier modelo de traducción neuronal, especialmente en frases largas o dominios alejados de los datos de entrenamiento.
- Limitación de idioma: solo cubre inglés→estonio; no soporta otros pares ni traducción inversa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a los autores originales (Tiedemann y Thottingal, 2020) tal como indica la model card.
- La cuantización INT8 puede introducir una ligera pérdida de calidad frente al modelo original en PyTorch.
- El modelo está empaquetado para un runtime concreto (Subtitle Tap); su uso fuera de ese entorno requiere adaptar la carga de `tokenizer_runtime.json` y de las salidas ONNX.
- No hay datos publicados sobre latencia, throughput ni evaluación BLEU/COMET en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-et-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-et
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
