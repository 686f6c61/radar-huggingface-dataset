# ukrbublik/opus-mt-uk-de-int8-shift-att

## Resumen

`ukrbublik/opus-mt-uk-de-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-uk-de`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de ucraniano a alemán, sin pivotar a través del inglés, y está pensado para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos OPUS. Esta conversión mantiene los pesos originales y solo cambia el formato: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values) y aplica cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor). Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, útil para alinear tokens entre origen y destino.

El modelo es relevante para escenarios de traducción de subtítulos en tiempo real en dispositivos con recursos limitados: el repositorio ocupa solo 0,1 GB, la licencia es Apache 2.0 y el tamaño reducido permite inferencia local sin GPU. No obstante, se trata de un artefacto muy específico para un runtime concreto, con cero descargas y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX; pesos originales en fp32 |
| Idiomas soportados | ucraniano (uk) → alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-uk-de` es un sistema de traducción neuronal Marian, un transformer encoder-decoder con atención multi-cabeza estándar, entrenado sobre corpus paralelos del proyecto OPUS. La model card del repositorio convertido no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de fine-tuning con RLHF o DPO; esa información corresponde a la model card del modelo original de Helsinki-NLP, que no se incluye en la información proporcionada.

La innovación técnica de esta conversión es doble. Por un lado, la exportación a ONNX con cuantización dinámica INT8 reduce el tamaño y acelera la inferencia en CPU, manteniendo los pesos y la decodificación sin cambios. Por otro, el decoder incorpora una salida adicional `alignment_shift_l2` que expone las probabilidades de atención encoder-decoder de la capa 2; según el autor, se implementa como una Identity de un nodo existente, de modo que no altera los pesos ni el proceso de decodificación. El repositorio incluye también `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción directa de ucraniano a alemán, sin pivotar por inglés.
- Generación de texto secuencia a secuencia con decodificación autoregresiva estándar de Marian.
- Salida de alineamiento a nivel de token mediante `alignment_shift_l2` (probabilidades de atención de la capa 2 del decoder), útil para correspondencias entre palabras origen y destino.
- Inferencia en dispositivo mediante onnxruntime, sin dependencia de GPU.
- Tokenizador SentencePiece empaquetado en JSON para su uso en runtimes ligeros.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Cobertura multilingüe limitada al par uk→de.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicación Subtitle Tap puede traducir subtítulos de ucraniano a alemán en el propio dispositivo usando los modelos ONNX cuantizados, sin enviar texto a un servidor y con un repositorio de solo 0,1 GB.
- Traducción offline en entornos sin conectividad: al ejecutarse con onnxruntime en CPU, el modelo es adecuado para dispositivos móviles o embebidos que no pueden depender de servicios en la nube.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite construir correspondencias token a token entre el texto ucraniano y el alemán, útil para resaltar la palabra activa o generar ficheros bilingües sincronizados.
- Preprocesado de corpus uk→de: el modelo puede usarse para generar traducciones preliminares de documentos o transcripciones que después se revisan manualmente, aprovechando la licencia Apache 2.0 para uso comercial.
- Integración en pipelines de accesibilidad: traducción local de contenido audiovisual para hablantes de alemán que consumen material original en ucraniano, con latencia baja al no requerir red.
- Prototipado de sistemas de traducción en aplicaciones de escritorio o web: el formato ONNX permite cargar el modelo con onnxruntime en distintos lenguajes y plataformas, facilitando pruebas de concepto sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración prevista; el modelo está cuantizado a INT8 y diseñado para CPU mediante onnxruntime.
- GPU recomendadas: no disponibles; el autor no documenta requisitos de GPU.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0,1 GB), aunque no hay datos oficiales de consumo de memoria.
- Opciones de despliegue: onnxruntime (runtime objetivo del autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos Marian ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-de-int8-shift-att | no disponible | no disponible | uk→de | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-uk-de (base) | no disponible | no disponible | uk→de | Apache 2.0 | safetensors / PyTorch |
| Otros modelos OPUS-MT uk→X | no disponible | no disponible | uk→otros | Apache 2.0 | varía |

La comparación relevante es con el modelo base `Helsinki-NLP/opus-mt-uk-de`: esta conversión preserva los pesos y solo cambia el formato y la cuantización, por lo que la calidad de traducción debería ser equivalente salvo la degradación propia de INT8, que no está cuantificada en la información disponible. No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo par lingüístico (uk→de); no traduce otras combinaciones.
- La cuantización INT8 dinámica puede introducir una degradación de calidad respecto al modelo fp32 original; no se documenta su magnitud.
- No hay benchmarks publicados que permitan evaluar la calidad de traducción ni compararla con alternativas.
- El modelo está empaquetado para un runtime concreto (Subtitle Tap / onnxruntime) con tokenizador en JSON y sin past key/values; integrarlo en otros stacks requiere adaptaciones.
- Riesgo de alucinación y de traducciones inexactas inherente a los sistemas NMT, especialmente en dominios especializados o texto con ruido.
- Sesgos potenciales heredados de los corpus OPUS de entrenamiento; no se detallan en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales (Universidad de Helsinki, OPUS-MT) y citar el trabajo de Tiedemann y Thottingal (2020).
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-de-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-de
- Repositorio OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/OPUS-MT
- Publicación de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
