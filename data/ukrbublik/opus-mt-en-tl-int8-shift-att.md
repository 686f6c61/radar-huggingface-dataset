# ukrbublik/opus-mt-en-tl-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-en-tl-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-tl`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT). Resuelve la traducción directa de inglés (en) a tagalo (tl) sin pivotar a través de una lengua intermedia, y su relevancia radica en que está empaquetado para inferencia en dispositivo (on-device) en Android, dentro del runtime OPUS de la aplicación Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos del corpus OPUS. El repositorio no modifica los pesos ni el proceso de decodificación: solo altera el formato de los ficheros (exportación ONNX con opset 17 y cuantización dinámica INT8 con onnxruntime) y añade una salida auxiliar de alineación de atención en la capa 2 del decoder.

La innovación concreta de esta versión es la exposición de `alignment_shift_l2`, las probabilidades de atención encoder-decoder de la segunda capa, mediante una operación Identity sobre un nodo ya existente. Esto permite obtener alineaciones a nivel de token para subtitulado sin coste adicional de cómputo ni cambios en los pesos. El tamaño total del repositorio es de aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en), tagalo (tl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base es Marian NMT, la implementación de transformer encoder-decoder de código abierto usada por el proyecto OPUS-MT, entrenada por el grupo de la Universidad de Helsinki sobre datos paralelos del corpus OPUS. El repositorio de conversión no aporta información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos detalles corresponden a la model card del modelo original `Helsinki-NLP/opus-mt-en-tl`, no incluida en la información disponible.

La conversión técnica consiste en una exportación con optimum (opset 17, sin past key/values, es decir, sin caché de atención entre pasos de decodificación) y una cuantización dinámica INT8 con onnxruntime. Además, el decoder expone una salida adicional `alignment_shift_l2` que contiene las probabilidades de atención encoder-decoder de la capa 2; se implementa como una Identity de un nodo existente, de modo que los pesos y la decodificación permanecen idénticos al modelo original. El fichero `alignment.json` actúa como recibo que vincula esa salida de alineación con el SHA-256 del decoder.

## Capacidades

- Traducción automática directa de inglés a tagalo, sin pivotar por una tercera lengua.
- Generación de alineaciones token a token mediante `alignment_shift_l2` (atención encoder-decoder de la capa 2), útiles para subtitulado y sincronización.
- Tokenización mediante SentencePiece, con las piezas y puntuaciones del modelo original mapeadas a ids de vocabulario en `tokenizer_runtime.json`.
- Inferencia en dispositivo mediante ONNX Runtime, orientada a Android.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada estrictamente al par en→tl.

## Casos de uso

- Subtitulado automático en Android: la salida `alignment_shift_l2` permite alinear cada token traducido con su origen en inglés, lo que facilita la sincronización de subtítulos en la app Subtitle Tap sin necesidad de un modelo de alineación independiente.
- Traducción de subtítulos en tiempo real sin conexión: al ser un modelo ONNX INT8 de aproximadamente 0,1 GB, puede ejecutarse en el dispositivo del usuario y traducir pistas de subtítulos en inglés a tagalo sin enviar texto a un servidor.
- Traducción de documentación y contenido de producto para el mercado filipino: el par directo en→tl evita los errores acumulados de un pipeline con pivot y es adecuado para localización de textos breves y de interfaz.
- Procesamiento por lotes de ficheros de subtítulos (SRT, VTT): la ausencia de past key/values simplifica el grafo ONNX y permite procesar segmentos de forma independiente en un pipeline offline.
- Integración en aplicaciones de accesibilidad: traducción de transcripciones en inglés a tagalo en dispositivos de gama media, aprovechando la cuantización INT8 para reducir requisitos de memoria.
- Investigación en alineación de atención: el fichero `alignment.json` y la salida de atención de la capa 2 permiten estudiar la calidad de las alineaciones de un modelo Marian cuantizado frente a su versión en coma flotante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo pequeño que cabe holgadamente en memoria de dispositivo móvil.
- GPU recomendadas: no se especifican; el destino principal es CPU/GPU integrada en Android mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer actual, dado el tamaño del repositorio, aunque no se aportan cifras oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se distribuyen pesos en safetensors, GGUF ni otros formatos, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables directamente sin reconversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-tl-int8-shift-att` | no disponible | no disponible | en, tl | ONNX INT8 | Apache 2.0 | Salida de alineación de atención; orientado a Android |
| `Helsinki-NLP/opus-mt-en-tl` | no disponible | no disponible | en, tl | safetensors/PyTorch | Apache 2.0 | Modelo original sin cuantizar ni salida de alineación |
| `Helsinki-NLP/opus-mt-en-mul` | no disponible | no disponible | en y múltiples lenguas | safetensors/PyTorch | Apache 2.0 | Modelo multilingüe de OPUS-MT; no equivale al par directo en→tl |

## Limitaciones y advertencias

- El modelo solo cubre el par inglés→tagalo; no traduce en la dirección inversa ni a otras lenguas.
- La cuantización INT8 dinámica puede introducir una ligera degradación de calidad frente al modelo original en coma flotante; no se documenta la magnitud de esa pérdida.
- La ausencia de past key/values implica que la decodificación no reutiliza la caché de atención entre pasos, lo que puede afectar al rendimiento en secuencias largas.
- No se han publicado evaluaciones de sesgos, alucinación ni robustez para esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El modelo está pensado para un runtime propietario (OPUS runtime de Subtitle Tap); su integración en otros entornos requiere adaptar el consumo de las salidas ONNX y del fichero `tokenizer_runtime.json`.
- No se dispone de información sobre el dominio de entrenamiento ni sobre el rendimiento en registros formales o técnicos del tagalo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-tl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-tl
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
