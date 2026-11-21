# ukrbublik/opus-mt-it-fr-int8-shift-att

## Resumen

`ukrbublik/opus-mt-it-fr-int8-shift-att` es una conversión del modelo de traducción automática `Helsinki-NLP/opus-mt-it-fr` a formato ONNX con cuantización INT8 dinámica, publicada por el usuario ukrbublik para su uso en el runtime on-device de la aplicación Android Subtitle Tap. El modelo original pertenece a la familia OPUS-MT, desarrollada por el Language Technology Research Group de la Universidad de Helsinki (Jörg Tiedemann et al.), entrenada sobre datos del corpus OPUS y publicada bajo licencia Apache 2.0.

La contribución de este repositorio es exclusivamente de formato y despliegue: no se modifican pesos ni se altera el proceso de decodificación. Se exporta el modelo con `optimum` (opset 17, sin past key/values), se aplica cuantización INT8 dinámica por tensor con onnxruntime y se añade una salida adicional `alignment_shift_l2` que expone las probabilidades de atención encoder-decoder de la capa 2, útil para alinear subtítulos con el texto origen.

Es relevante para quien necesite traducción directa italiano-francés de baja latencia en dispositivos móviles, sin pivote por inglés, con un artefacto de aproximadamente 0,1 GB y un formato reproducible y verificable mediante hash.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo Marian (familia OPUS-MT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnxruntime; pesos originales en FP32/FP16 no especificados |
| Idiomas soportados | italiano (it) como origen, francés (fr) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17; tokenizer en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de la familia Marian, el estándar de OPUS-MT para traducción neuronal. El entrenamiento original se realizó sobre datos del corpus OPUS (pares de traducción paralela) por parte del grupo de la Universidad de Helsinki; no se dispone en la información proporcionada de detalles sobre número de tokens, composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión a ONNX elimina el uso de past key/values en el decoder y aplica cuantización INT8 dinámica por tensor. La innovación destacable de este repositorio es la salida `alignment_shift_l2`: una identidad sobre un nodo existente que expone las probabilidades de atención encoder-decoder de la capa 2, sin alterar pesos ni decodificación. Adicionalmente, `alignment.json` actúa como recibo criptográfico que vincula esa salida al SHA-256 del decoder, permitiendo verificar la integridad del artefacto. El tokenizador se distribuye como JSON con las piezas y puntuaciones del SentencePiece original mapeadas a identificadores de vocabulario.

## Capacidades

- Traducción directa italiano a francés, sin pivote por inglés.
- Generación de alineaciones encoder-decoder por token mediante la salida `alignment_shift_l2`, útil para subtitulado y sincronización.
- Ejecución on-device en Android mediante onnxruntime con pesos INT8.
- Tokenización compatible con SentencePiece original, expuesta en `tokenizer_runtime.json`.
- Verificación de integridad del decoder mediante hash SHA-256 en `alignment.json`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Cobertura multilingüe limitada exclusivamente al par it→fr.

## Casos de uso

- Subtitulado automático en aplicaciones Android: el modelo traduce subtítulos italianos a francés en el dispositivo y, gracias a `alignment_shift_l2`, permite alinear temporalmente cada token traducido con el origen, facilitando la sincronización de subtítulos.
- Traducción offline en movilidad: al ejecutarse con onnxruntime y pesos INT8 de ~0,1 GB, funciona sin conexión en teléfonos de gama media, útil para viajeros o entornos con conectividad limitada.
- Procesamiento por lotes de documentos it→fr en servidores sin GPU: la cuantización INT8 reduce requisitos de memoria y permite desplegar el modelo en CPU con onnxruntime.
- Integración en pipelines de localización de contenido editorial: traducción directa de artículos o notas en italiano a francés evitando el error acumulado del pivote por inglés.
- Análisis de atención para investigación en traducción: la salida de atención de la capa 2 permite estudiar alineaciones léxicas y evaluar calidad de traducción a nivel de token.
- Prototipado rápido de servicios de traducción: el formato ONNX y el tokenizador JSON simplifican la integración en aplicaciones web o móviles sin dependencias de frameworks de deep learning completos.
- Verificación de artefactos en cadena de suministro: el recibo SHA-256 del decoder permite auditar que el modelo desplegado corresponde al publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa ~0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de dispositivos móviles y CPUs convencionales.
- GPU recomendadas: no disponible; el artefacto está orientado a ejecución on-device y CPU mediante onnxruntime.
- Cabe en GPU consumer: sí, con margen amplio, aunque no se especifican requisitos formales.
- Opciones de despliegue: onnxruntime (runtime objetivo declarado, usado en la app Subtitle Tap); otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas y no son aplicables directamente al formato ONNX Marian.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-it-fr-int8-shift-att | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-it-fr | no disponible | no disponible | PyTorch (safetensors/bin) | Apache 2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-en-fr | no disponible | no disponible | PyTorch | Apache 2.0 | Hugging Face (par alternativo, requiere pivote) |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineación adicional; frente a alternativas con pivote por inglés, este modelo evita una etapa intermedia de traducción.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre OPUS, puede heredar sesgos presentes en corpus paralelos.
- Riesgo de alucinación: inherente a los modelos de traducción neuronal; no se han publicado evaluaciones específicas para este artefacto.
- Limitaciones de contexto o idioma: solo cubre italiano→francés; no se especifica longitud máxima de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución; debe citarse a Tiedemann y Thottingal (2020), OPUS-MT, EAMT 2020, y respetarse la licencia del modelo base.
- Caveats para producción: la cuantización INT8 puede degradar ligeramente la calidad frente al modelo FP32 original; el decoder no usa past key/values, lo que puede afectar eficiencia en decodificación autoregresiva larga; el artefacto está diseñado para el runtime específico de Subtitle Tap y su integración en otros entornos requiere validación; el repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-it-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-it-fr
- Referencia OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
