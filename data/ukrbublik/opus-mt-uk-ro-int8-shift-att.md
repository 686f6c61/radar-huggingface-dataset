# ukrbublik/opus-mt-uk-ro-int8-shift-att

## Resumen

Este repositorio contiene una conversión a ONNX con cuantización INT8 del modelo de traducción automática Helsinki-NLP/opus-mt-tc-base-uk-ro, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente del ucraniano (uk) al rumano (ro) sin utilizar el inglés como lengua pivote, lo que reduce la propagación de errores respecto a las arquitecturas en cascada. La conversión la firma el usuario ukrbublik y está orientada al motor de inferencia en dispositivo de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder de tipo secuencia a secuencia especializado en traducción, con un tamaño base (el modelo original se distribuye como `base`). El repositorio pesa aproximadamente 0,1 GB y publica los grafos del encoder y del decoder por separado en formato ONNX (opset 17), sin claves ni valores pasados (sin caché de atención), lo que simplifica la ejecución en runtimes móviles aunque penaliza el coste de decodificación autoregresiva.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de despliegue de traducción neuronal en dispositivo con cuantización dinámica INT8 y una salida adicional de alineación de atención; por otro, ilustra las limitaciones de los artefactos derivados de OPUS-MT cuando se evalúan fuera de su ecosistema original (Hugging Face Transformers), dado que la tokenización se ha externalizado a un fichero JSON propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian NMT |
| Parámetros totales | no disponible (modelo base de OPUS-MT; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) sobre export ONNX con optimum, opset 17 |
| Idiomas soportados | ucraniano (uk) como origen, rumano (ro) como destino |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo original es un Marian NMT de tamaño base entrenado sobre datos de OPUS, el corpus multilingüe de traducción paralela mantenido por la Universidad de Helsinki. Se trata de un transformer estándar encoder-decoder con atención multi-cabeza, pensado para traducción supervisada de dominio general y entrenado con los pares de frases disponibles en OPUS para las combinaciones cubiertas por el modelo multilingüe `opus-mt-tc-base`. La model card del repositorio no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esa información debe consultarse en la model card del modelo base.

La conversión realizada por ukrbublik no modifica los pesos ni el proceso de decodificación. Aplica una exportación con optimum a ONNX (opset 17, sin past key/values) y una cuantización dinámica INT8 con onnxruntime. La innovación técnica destacable es la exposición de `alignment_shift_l2`, una salida adicional que devuelve las probabilidades de atención encoder del decoder en la capa 2; se implementa como una identidad sobre un nodo existente, por lo que no altera el grafo de cómputo original. Además, el repositorio incluye `alignment.json`, un recibo que vincula esa salida de alineación con el hash SHA-256 del decoder, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario y añade los tokens de destino.

## Capacidades

- Traducción directa de ucraniano a rumano sin pivote por inglés.
- Selección de lengua destino mediante el prefijo `>>ron<<`, inyectado automáticamente por `tokenizer_runtime.json` antes de cada frase de origen.
- Salida de alineación de atención (`alignment_shift_l2`) en la capa 2 del decoder, útil para análisis de correspondencias palabra a palabra.
- Ejecución en dispositivo mediante onnxruntime con cuantización INT8.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada estrictamente al par uk→ro.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos del ucraniano al rumano en el propio dispositivo, sin conexión, gracias a los grafos ONNX cuantizados y al tamaño reducido del artefacto (0,1 GB).
- Traducción de documentación técnica ucraniana al rumano en entornos con conectividad limitada o requisitos de privacidad, ejecutando el modelo localmente con onnxruntime.
- Análisis de alineación léxica: la salida `alignment_shift_l2` permite inspeccionar qué tokens de origen reciben más atención al generar cada token destino, útil en investigación lingüística o en la construcción de glosarios bilingües.
- Integración en pipelines de preprocesamiento de corpus: el modelo puede generar traducciones preliminares de grandes volúmenes de texto ucraniano para su posterior revisión humana en flujos de localización hacia rumano.
- Prototipado de asistentes de traducción en tiempo real para conversaciones ucraniano-rumano, aprovechando la inferencia local y la ausencia de dependencias de red.
- Evaluación comparativa de formatos de despliegue: sirve como referencia para medir el impacto de la cuantización INT8 dinámica frente al modelo original en Transformers, en términos de calidad de traducción y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas BLEU, COMET ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es muy reducida y compatible con dispositivos móviles.
- GPU recomendadas: no aplica para el escenario objetivo (ejecución en Android); en escritorio puede ejecutarse en CPU con onnxruntime sin GPU dedicada.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con soporte de onnxruntime (por ejemplo, RTX 3060 o superiores) puede ejecutar el modelo, aunque no es el caso de uso previsto.
- Opciones de despliegue: onnxruntime (runtime objetivo), potencialmente integrable en llama.cpp u Ollama solo mediante conversión adicional, no soportado de forma nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-ro-int8-shift-att | no disponible | no disponible | cc-by-4.0 | ONNX INT8 | Hugging Face |
| Helsinki-NLP/opus-mt-tc-base-uk-ro | no disponible (base) | no disponible | cc-by-4.0 | safetensors / PyTorch | Hugging Face |
| Helsinki-NLP/opus-mt-uk-ro | no disponible | no disponible | cc-by-4.0 | safetensors / PyTorch | Hugging Face |

La comparación se limita al ecosistema OPUS-MT porque no se dispone de datos de benchmarks ni de especificaciones de parámetros y contexto publicadas para estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: los modelos OPUS-MT heredan los sesgos de los corpus paralelos de OPUS, con posible infrarrepresentación de variedades dialectales o registros informales.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones fluidas pero infieles, especialmente en frases largas o con terminología especializada.
- Limitaciones de contexto e idioma: solo cubre el par uk→ro; no traduce otras lenguas ni permite cambiar el idioma destino sin modificar la configuración del tokenizador.
- Restricciones de licencia: cc-by-4.0 exige atribución al grupo de Helsinki y al autor de la conversión; es compatible con uso comercial siempre que se cite.
- Caveat de producción: la tokenización se ha externalizado a `tokenizer_runtime.json`, por lo que no es directamente compatible con la API de Transformers; requiere el runtime específico de la aplicación Subtitle Tap o una implementación propia del preprocesado.
- El decoder no utiliza caché de claves y valores, lo que incrementa el coste computacional en secuencias largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ukrbublik/opus-mt-uk-ro-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-base-uk-ro
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de OPUS-MT (EAMT 2020): Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World.
