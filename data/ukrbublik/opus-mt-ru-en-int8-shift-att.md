# ukrbublik/opus-mt-ru-en-int8-shift-att

## Resumen

`ukrbublik/opus-mt-ru-en-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-ru-en`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de ruso a inglés, sin pivotar por una lengua intermedia, y está pensado para inferencia en dispositivo (on-device) en la aplicación Android Subtitle Tap.

La aportación de este repositorio no es un nuevo entrenamiento, sino un cambio de formato: exportación con Optimum a ONNX (opset 17, sin past key/values) y cuantización dinámica INT8 con onnxruntime. Además, el decodificador expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, útil para alinear tokens origen y destino. Los pesos y la decodificación no se modifican respecto al modelo original.

Es relevante para quien necesite traducción ruso-inglés de baja latencia y bajo consumo en entornos sin GPU, con un artefacto de apenas 0,1 GB y licencia permisiva cc-by-4.0. No es un modelo de propósito general: es un traductor especializado de un solo par de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) mediante onnxruntime |
| Idiomas soportados | ruso (ru) como origen, ingles (en) como destino |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17; tokenizador en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian de tipo transformer encoder-decoder, la arquitectura estándar del proyecto OPUS-MT, entrenado por el grupo de la Universidad de Helsinki sobre datos del corpus OPUS. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden al modelo original `Helsinki-NLP/opus-mt-ru-en` y no se reproducen aquí.

La innovación técnica de este repositorio es de ingeniería de despliegue. La exportación con Optimum genera un grafo sin past key/values (decodificación sin caché de atención), lo que simplifica el runtime a costa de recomputar el decodificador en cada paso. La cuantización dinámica INT8 reduce el peso y acelera la inferencia en CPU. La salida `alignment_shift_l2` es una identidad sobre un nodo existente: expone las probabilidades de atención de la capa 2 del encoder, lo que permite construir alineaciones palabra a palabra sin alterar los pesos ni la lógica de decodificación. El archivo `alignment.json` contiene un recibo que vincula esa salida al SHA-256 del decodificador.

## Capacidades

- Traducción directa de ruso a inglés, sin pivotar por una tercera lengua.
- Salida de alineación de atención (`alignment_shift_l2`) para correspondencia entre tokens origen y destino.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json`, con piezas y puntuaciones mapeadas a identificadores de vocabulario.
- Inferencia en CPU mediante onnxruntime, sin requisito de GPU.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento extendido ni capacidades de visión o audio.
- Multilingüismo limitado al par ru-en; no cubre otras combinaciones.

## Casos de uso

- Subtitulado en dispositivo: integración en la app Android Subtitle Tap para traducir subtítulos del ruso al inglés en tiempo real sin conexión, aprovechando el tamaño reducido (0,1 GB) y la inferencia en CPU.
- Traducción de documentación técnica rusa: procesamiento por lotes de manuales y notas de ingeniería con un runtime ONNX en servidores sin GPU.
- Alineación de corpus bilingües: uso de `alignment_shift_l2` para generar correspondencias palabra a palabra y construir memorias de traducción o datasets paralelos.
- Preprocesado en pipelines de NLP: traducción previa de fuentes rusas antes de aplicar clasificadores o extractores entrenados en inglés.
- Aplicaciones móviles de viaje o mensajería: traducción de mensajes y textos cortos en entornos con conectividad limitada, donde el coste energético de la inferencia es crítico.
- Moderación de contenido en foros rusófonos: traducción al inglés para que los clasificadores de toxicidad monolingües puedan evaluar el contenido.
- Prototipado rápido de sistemas de traducción: servicio ligero en contenedores con onnxruntime para validar flujos antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo está diseñado para CPU. En GPU, el peso INT8 ronda los 0,1 GB, por lo que cabría en cualquier GPU con al menos 1 GB de memoria libre.
- GPU recomendadas: no se especifican; el artefacto está orientado a onnxruntime en CPU. Cualquier GPU consumer moderna (RTX 3060 o superior) podría ejecutarlo, pero no es el escenario previsto.
- Cabe en GPU consumer: sí, con margen amplio, aunque el diseño apunta a CPU.
- Opciones de despliegue: onnxruntime (runtime objetivo), con posibilidad de servir los grafos ONNX desde otros motores compatibles. No se distribuyen pesos en formato GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son vías directas sin reconversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-ru-en-int8-shift-att | no disponible | no disponible | ru→en | cc-by-4.0 | ONNX INT8 | Salida de alineación, orientado a CPU |
| Helsinki-NLP/opus-mt-ru-en | no disponible | no disponible | ru→en | cc-by-4.0 | safetensors/PyTorch | Modelo base, sin cuantizar, sin alineación expuesta |
| Otros modelos OPUS-MT ru-en de la comunidad | no disponible | no disponible | ru→en | variable | variable | Conversiones y cuantizaciones alternativas; datos no verificados en esta ficha |

La comparación se limita al linaje directo del modelo; no se dispone de datos de benchmarks para contrastar calidad frente a alternativas.

## Limitaciones y advertencias

- Modelo especializado en un único par de idiomas; no sirve para otras combinaciones sin sustituirlo.
- Al derivar de OPUS-MT, hereda los sesgos presentes en los corpus OPUS, que pueden reflejarse en elecciones léxicas y de registro.
- Riesgo de alucinación y de traducciones fluentes pero infieles en textos ambiguos, técnicos o con jerga poco representada.
- La decodificación sin past key/values implica recomputar el decodificador en cada paso, lo que penaliza la latencia en secuencias largas.
- La cuantización INT8 puede degradar ligeramente la calidad frente al modelo en precisión completa; no se documentan métricas de esa pérdida.
- La salida de alineación corresponde a la atención de la capa 2 y no debe interpretarse como una alineación perfecta; requiere validación en el caso de uso.
- Licencia cc-by-4.0: permite uso comercial con atribución al grupo de la Universidad de Helsinki y a los autores del proyecto OPUS-MT. Es necesario citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio no incluye pesos en formatos estándar de PyTorch o GGUF, lo que limita su integración en ecosistemas como Transformers, llama.cpp o vLLM sin conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ru-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ru-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia bibliográfica: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
