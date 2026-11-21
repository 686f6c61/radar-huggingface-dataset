# ukrbublik/opus-mt-es-de-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-de-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-es-de`, desarrollado originalmente por el grupo de investigación en Tecnología del Lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de español a alemán, sin pivotar por el inglés, y está pensado para inferencia en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La aportación de este repositorio no es el entrenamiento, sino el formato: exporta el encoder y el decoder a ONNX con optimum (opset 17, sin past key/values) y aplica cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor). Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, útil para alinear tokens origen y destino en subtítulos.

Se trata de un modelo compacto (repo de 0,1 GB) basado en la arquitectura Marian, con licencia Apache 2.0 y únicamente dos idiomas soportados: español y alemán. Su relevancia radica en ser un artefacto ligero y desplegable en entornos sin GPU, orientado a traducción de subtítulos en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | español (es), alemán (de) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo subyacente es `Helsinki-NLP/opus-mt-es-de`, un transformer encoder-decoder de la familia Marian entrenado por el grupo OPUS-MT sobre datos del corpus OPUS (traducciones paralelas de fuentes web y documentos multilingües). No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo original es un sistema de traducción supervisado estándar.

La conversión de este repositorio aplica una exportación con optimum a ONNX en opset 17 sin past key/values (es decir, sin caché de atención entre pasos de decodificación) y una cuantización dinámica INT8 de onnxruntime. El decoder incorpora una salida extra, `alignment_shift_l2`, que es una Identity de un nodo existente y expone las probabilidades de atención encoder-decoder de la capa 2; los pesos y el proceso de decodificación no se modifican. El fichero `alignment.json` actúa como recibo que vincula esa salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción directa español a alemán, sin pivotar por el inglés.
- Generación de texto traducido token a token mediante decoder autorregresivo.
- Salida de alineamiento de atención (`alignment_shift_l2`) para mapear tokens origen y destino.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` con piezas, puntuaciones e identificadores de vocabulario.
- Inferencia en dispositivo mediante onnxruntime con pesos INT8.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción de subtítulos en aplicaciones Android: el modelo está empaquetado específicamente para el runtime OPUS on-device de Subtitle Tap, con encoder y decoder ONNX cuantizados que caben en un repo de 0,1 GB y se ejecutan sin GPU.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite asociar cada token alemán generado con su token español de origen, útil para sincronizar pistas de subtítulos o resaltar correspondencias.
- Traducción offline en dispositivos de gama baja: al ser INT8 y ONNX, puede desplegarse en móviles o sistemas embebidos sin conexión a red.
- Preprocesado de contenido audiovisual: traducción de guiones o transcripciones del español al alemán antes de una revisión humana.
- Prototipado de pipelines de traducción ligeros: sirve como componente de bajo coste en entornos con onnxruntime para pruebas de concepto.
- Traducción de documentación técnica breve entre es y de en herramientas de escritorio, dado el reducido tamaño del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,1 GB, por lo que el modelo INT8 es muy ligero.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU mediante onnxruntime.
- ¿Cabe en GPU consumer? Sí, por tamaño, aunque no se documentan requisitos ni pruebas en GPU concretas.
- Opciones de despliegue: onnxruntime (formato nativo del repo); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Cuantización | Licencia | Contexto |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-es-de-int8-shift-att | es, de | ONNX | INT8 | apache-2.0 | no disponible |
| Helsinki-NLP/opus-mt-es-de | es, de | safetensors/PyTorch | no (FP32/FP16) | apache-2.0 | no disponible |
| Helsinki-NLP/opus-mt-en-de | en, de | safetensors/PyTorch | no | apache-2.0 | no disponible |

La diferencia principal frente al modelo base es el formato ONNX INT8 y la salida de alineamiento; frente a variantes con pivot por inglés, este modelo evita la traducción intermedia.

## Limitaciones y advertencias

- Solo cubre el par español-alemán; no soporta otros idiomas.
- Al derivar de OPUS-MT, hereda los sesgos y errores del corpus OPUS y del modelo original.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados o texto ambiguo.
- La cuantización INT8 dinámica puede degradar ligeramente la calidad respecto al modelo en FP32.
- La ausencia de past key/values en la exportación ONNX puede implicar mayor coste de decodificación por paso.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020).
- No hay datos publicados de benchmarks, latencia ni contexto máximo en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-es-de-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-de
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
