# ukrbublik/opus-mt-it-de-int8-shift-att

## Resumen

`ukrbublik/opus-mt-it-de-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-it-de`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de italiano a alemán, sin pivotar por el inglés, y está empaquetado específicamente para el runtime on-device de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos paralelos de OPUS. Esta versión concreta no modifica los pesos: solo cambia el formato (exportación a ONNX con opset 17 y cuantización dinámica INT8 de onnxruntime, tipo QInt8 por tensor) y añade una salida auxiliar de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder del decoder en la capa 2, útil para alinear tokens origen-destino en subtítulos.

Es relevante para desarrolladores que necesiten traducción it→de de baja latencia en dispositivo, sin dependencia de servicios en la nube, con un tamaño de repositorio de 0,1 GB y licencia Apache 2.0. No es un modelo de propósito general: está orientado a inferencia embebida y a un pipeline de subtitulado concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible (modelo base OPUS-MT it-de; tamano de repo 0,1 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | italiano (it), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), mas `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint `Helsinki-NLP/opus-mt-it-de` (revisión `11728e1aafacde290f2a1fbe2bc7357486ac3a7f`), un Marian NMT estándar de tipo transformer encoder-decoder entrenado por el grupo de la Universidad de Helsinki sobre corpus paralelos del proyecto OPUS. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset; esa información corresponde al modelo base original.

La conversión realizada por `ukrbublik` exporta el modelo con optimum a ONNX en opset 17, sin past key/values, y aplica cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor) tanto al encoder como al decoder. La innovación respecto al original es la salida `alignment_shift_l2`: una Identity sobre un nodo existente que expone las probabilidades de atención encoder de la capa 2 del decoder, sin alterar pesos ni decodificación. Se incluye además un `alignment.json` que vincula esa salida al SHA-256 del decoder, y un `tokenizer_runtime.json` con las piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario. No se documenta RLHF, DPO ni fases de ajuste posteriores.

## Capacidades

- Traducción automática directa italiano → alemán, sin pivotar por inglés.
- Exposición de alineación token a token mediante `alignment_shift_l2` (probabilidades de atención encoder de la capa 2 del decoder), útil para subtítulos bilingües alineados.
- Inferencia on-device en Android mediante el runtime OPUS de Subtitle Tap y onnxruntime.
- Tokenizador SentencePiece empaquetado en formato JSON para uso en runtime sin dependencias de la librería original.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multimodal: solo texto.
- No dispone de modo thinking ni capacidades de visión o audio.

## Casos de uso

- Subtitulado bilingüe en Android: la app Subtitle Tap puede traducir subtítulos de italiano a alemán en el dispositivo y usar `alignment_shift_l2` para alinear cada segmento traducido con su origen, sin enviar datos a la nube.
- Traducción offline en dispositivos de gama media: al estar cuantizado a INT8 y ocupar 0,1 GB, cabe en almacenamiento y memoria de móviles sin GPU dedicada, permitiendo traducción sin conectividad.
- Preprocesado de corpus it→de en pipelines locales: útil para generar borradores de traducción de documentación técnica o contenido editorial antes de revisión humana.
- Privacidad por diseño: al ejecutarse on-device, es adecuado para traducir contenido sensible (mensajes, documentos personales) que no debe salir del dispositivo.
- Integración en reproductores de vídeo o apps de accesibilidad: permite generar pistas de subtítulos en alemán a partir de pistas en italiano en tiempo de reproducción.
- Evaluación de alineación en investigación: la salida de atención de la capa 2 sirve para estudiar correspondencias léxicas it→de y comparar con herramientas de alineación tipo fast_align o SimAlign.
- Prototipado de traducción embebida en entornos sin Python: el formato ONNX con tokenizador JSON simplifica el despliegue en runtimes nativos (C++, Java/Kotlin, Rust).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repo (0,1 GB en INT8) la huella en memoria es del orden de cientos de MB, apta para dispositivos móviles.
- GPU recomendadas: no aplica; el destino es CPU y aceleradores móviles mediante onnxruntime (NNAPI, XNNPACK) en Android.
- Cabe en GPU de consumo y en móviles: sí, por tamaño; no requiere GPU dedicada.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap), y en general cualquier runtime compatible con ONNX opset 17; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-it-de-int8-shift-att` | no disponible (INT8, repo 0,1 GB) | no disponible | it→de | Apache 2.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-it-de` (base) | no disponible | no disponible | it→de | Apache 2.0 | safetensors/PyTorch |
| `Helsinki-NLP/opus-mt-it-en` | no disponible | no disponible | it→en | Apache 2.0 | safetensors/PyTorch |
| `facebook/nllb-200-distilled-600M` | 600 M | no disponible | multilingüe (200) | CC-BY-NC 4.0 | safetensors/PyTorch |

La comparación con NLLB se incluye por categoría (traducción multilingüe), pero este último tiene licencia no comercial, lo que lo descarta para muchos productos. Frente al OPUS-MT original, la versión de `ukrbublik` solo cambia formato y cuantización, por lo que la calidad de traducción debería ser equivalente, con posible pérdida menor por INT8 no cuantificada en la información disponible.

## Limitaciones y advertencias

- Solo cubre el par italiano → alemán; no traduce en sentido inverso ni a otros idiomas.
- La cuantización INT8 dinámica puede introducir una degradación de calidad respecto al modelo original; no se documenta su magnitud.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (términos técnicos, nombres propios, jerga), típico de modelos NMT entrenados sobre OPUS.
- Sesgos potenciales heredados de los corpus paralelos de OPUS (distribución de dominios, registros y variedades dialectales).
- La salida de alineación (`alignment_shift_l2`) expone atención de una sola capa; no debe interpretarse como alineación gold.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a Tiedemann y Thottingal (2020) y al grupo de Helsinki.
- No dispone de soporte para tool calling, agentes ni contexto largo; no es adecuado como modelo de chat o razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-it-de-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-it-de
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Proyecto OPUS: https://opus.nlpl.eu/
- Repositorio Marian NMT: https://github.com/marian-nmt/marian
- onnxruntime: https://github.com/microsoft/onnxruntime
- optimum (exportación ONNX): https://github.com/huggingface/optimum
