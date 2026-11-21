# ukrbublik/opus-mt-es-en-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-en-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-es-en`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de español a inglés (sin pivote intermedio por inglés) y está pensado para inferencia en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq entrenado sobre datos del corpus OPUS. Esta versión concreta no modifica los pesos: solo cambia el formato (exportación con Optimum a ONNX, opset 17, sin past key/values) y aplica cuantización dinámica INT8 (QInt8, per-tensor) con onnxruntime. El repositorio ocupa aproximadamente 0,1 GB.

La particularidad técnica de esta conversión es que el decoder expone una salida adicional, `alignment_shift_l2`, que contiene las probabilidades de atención encoder del layer 2. Se trata de una Identity sobre un nodo existente, de modo que los pesos y el proceso de decodificación permanecen inalterados. Esto permite obtener alineaciones palabra a palabra útiles para subtitulado, además de la traducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo es un transformer seq2seq de la familia Marian, la misma arquitectura que emplea la colección OPUS-MT de Helsinki-NLP. Consta de un encoder y un decoder con atención cruzada; en esta conversión el decoder expone como salida adicional las probabilidades de atención encoder del layer 2 (`alignment_shift_l2`), lo que permite extraer alineaciones a nivel de token entre origen y destino sin alterar el decodificado.

Los pesos originales fueron entrenados por el grupo de investigación de tecnología del lenguaje de la Universidad de Helsinki sobre datos del corpus OPUS, con licencia Apache 2.0. Esta conversión concreta solo modifica el formato: exportación con Optimum a ONNX (opset 17, sin past key/values) y cuantización dinámica INT8 con onnxruntime. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en el modelo original. El repositorio incluye además `tokenizer_runtime.json` (piezas y scores del modelo SentencePiece mapeados a ids de vocabulario, más los tokens destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder.

## Capacidades

- Traducción directa español a inglés, sin pivote intermedio.
- Generación de alineaciones de atención encoder (layer 2) para mapear tokens origen-destino.
- Inferencia en dispositivo mediante onnxruntime, con pesos cuantizados INT8.
- Tokenización SentencePiece empaquetada en un JSON de runtime para su uso sin dependencias de SentencePiece nativo.
- Integración orientada a subtitulado (la app Subtitle Tap), donde la alineación permite sincronizar texto traducido con el original.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido.
- Capacidad multilingüe limitada estrictamente al par es→en.

## Casos de uso

- Subtitulado en dispositivo: la app puede traducir subtítulos en español a inglés sin conexión y usar `alignment_shift_l2` para alinear cada segmento traducido con su original, manteniendo la sincronización temporal.
- Traducción offline en Android: al ser un modelo de ~0,1 GB en INT8 y ejecutarse con onnxruntime, cabe en un dispositivo móvil y funciona sin red, útil en viajes o entornos con conectividad limitada.
- Preprocesado de corpus: la salida de alineación permite generar pares de frases alineados es-en para construir datasets de evaluación o entrenamiento.
- Traducción de documentación técnica: para volcar documentación interna en español a inglés con un modelo ligero y de licencia permisiva, sin dependencia de APIs externas.
- Prototipado de pipelines de traducción: sirve como baseline rápido en experimentos de MT antes de escalar a modelos mayores, gracias a su bajo coste de despliegue.
- Análisis de atención para investigación: la exposición de las probabilidades de atención del layer 2 facilita estudios de interpretabilidad sobre alineaciones en traducción neuronal.
- Traducción de mensajes y chats en apps: integrable en clientes de mensajería que necesiten traducir mensajes entrantes en español a inglés localmente, preservando privacidad al no enviar texto a servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo pesa ~0,1 GB en INT8, por lo que la huella en memoria es del orden de cientos de MB incluyendo runtime y tokenizador.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y ejecución on-device en Android mediante onnxruntime.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no es su entorno objetivo.
- Opciones de despliegue: onnxruntime (CPU o GPU), integrable en apps Android; no se distribuye en formato GGUF, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-es-en-int8-shift-att | Marian | es→en | no disponible | Apache 2.0 | ONNX INT8 | Salida de alineación, orientado a on-device |
| Helsinki-NLP/opus-mt-es-en | Marian | es→en | no disponible | Apache 2.0 | safetensors / PyTorch | Modelo base original, sin cuantizar |
| Helsinki-NLP/opus-mt-en-es | Marian | en→es | no disponible | Apache 2.0 | safetensors / PyTorch | Dirección inversa del mismo par |
| Otros modelos OPUS-MT de Helsinki-NLP | Marian | múltiples pares | no disponible | Apache 2.0 | safetensors / PyTorch | Colección amplia de pares lingüísticos |

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre el corpus OPUS (textos paralelos de dominios diversos), puede heredar sesgos de género, registro y dominio presentes en esas fuentes; no se documenta un análisis específico de sesgos.
- Alucinación: como todo modelo seq2seq, puede generar traducciones plausibles pero incorrectas en frases ambiguas, nombres propios o terminología especializada.
- Contexto: no se documenta la longitud máxima de contexto; el formato sin past key/values implica que la decodificación no reutiliza caché, lo que puede afectar a la eficiencia en secuencias largas.
- Idioma: solo cubre el par es→en; no traduce otras lenguas ni variantes dialectales de forma específica.
- Licencia: Apache 2.0 permite uso comercial, pero conviene conservar la atribución a OPUS-MT y a los autores originales (Tiedemann y Thottingal, 2020).
- Producción: la cuantización INT8 puede introducir una ligera degradación de calidad frente al modelo original en PyTorch; no se publican métricas comparativas (BLEU, chrF) que lo cuantifiquen.
- Integración: al no incluir past key/values, el pipeline debe gestionar la decodificación completa en cada paso; el tokenizador se distribuye como JSON propio, no como fichero SentencePiece estándar, lo que exige adaptar el código de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-es-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- onnxruntime: https://github.com/microsoft/onnxruntime
