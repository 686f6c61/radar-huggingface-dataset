# ukrbublik/opus-mt-en-lv-int8-shift-att

## Resumen

Este repositorio contiene una conversión a ONNX con cuantización INT8 del modelo de traducción Helsinki-NLP/opus-mt-tc-big-en-lv, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a letón sin pivotar por una lengua intermedia, y esta versión concreta está pensada para su uso dentro de la aplicación Android Subtitle Tap mediante un runtime OPUS en el dispositivo.

La aportación de ukrbublik se limita al formato: exportación ONNX (opset 17, sin claves/valores pasadas), cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor) y la adición de una salida de alineamiento (`alignment_shift_l2`) que expone las probabilidades de atención del decodificador sobre el codificador en la capa 2. Los pesos y el proceso de decodificación son idénticos a los del modelo original.

El modelo base es de tipo Marian (transformer encoder-decoder) y forma parte de la familia tc-big, orientada a traducción de calidad con corpus OPUS. Al estar cuantizado en INT8 y en formato ONNX, resulta adecuado para inferencia en CPU y dispositivos con recursos limitados, aunque su ventana de contexto y su par de idiomas son específicos y limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (origen), lv (destino) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian de tipo transformer encoder-decoder, la arquitectura estándar del proyecto OPUS-MT para traducción neuronal. La familia tc-big está entrenada sobre datos OPUS multilingües, e incluye un prefijo de selección de idioma destino (`>>lav<<`) que permite escoger el letón dentro de un modelo multi-target. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La innovación técnica de esta conversión concreta es doble: por un lado, la exportación ONNX con cuantización dinámica INT8 reduce el tamaño del repo a 0,4 GB y facilita la inferencia en CPU; por otro, el decodificador emite una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, implementada como una Identity sobre un nodo existente, sin alterar pesos ni decodificación. El fichero `alignment.json` vincula esa salida al SHA-256 del decodificador, y `tokenizer_runtime.json` mapea las piezas y puntuaciones del SentencePiece original a ids de vocabulario, añadiendo el prefijo `>>lav<<` a cada frase de origen mediante `sourcePrefixTokenIds`.

## Capacidades

- Traducción directa inglés → letón, sin pivotar por inglés ni por una tercera lengua.
- Salida de alineamiento palabra/frase a nivel de atención (capa 2 del decodificador), útil para subtitulado y sincronización.
- Inferencia en formato ONNX con onnxruntime, incluida cuantización INT8 dinámica.
- Selección de idioma destino mediante prefijo (`>>lav<<`) dentro de un modelo multi-target.
- Tokenizador runtime autónomo (`tokenizer_runtime.json`) que no depende del tokenizer original de Hugging Face.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni thinking mode.
- Cobertura multilingüe limitada exclusivamente al par en-lv.

## Casos de uso

- Subtitulado automático en dispositivos Android: la app Subtitle Tap puede traducir subtítulos inglés → letón en el propio dispositivo usando los dos ficheros ONNX cuantizados, sin conexión a servidor ni pivot por inglés.
- Traducción offline en dispositivos con recursos limitados: el formato ONNX INT8 y el tamaño de 0,4 GB permiten ejecutar la inferencia en CPU de móviles o portátiles modestos.
- Sincronización de subtítulos mediante alineamiento: la salida `alignment_shift_l2` permite obtener probabilidades de atención para alinear frases origen y destino, útil en herramientas de edición de subtítulos.
- Pipeline de localización de contenido audiovisual: integración en flujos que convierten transcripciones inglesas en subtítulos letones antes de la revisión humana.
- Investigación en traducción neuronal de bajo recurso: el par en-lv es un caso de estudio habitual para evaluar calidad de modelos OPUS-MT frente a sistemas comerciales.
- Despliegue embebido en aplicaciones de escritorio o web mediante onnxruntime, con un runtime OPUS propio y sin dependencia de frameworks pesados.
- Evaluación de técnicas de cuantización INT8: comparación de la calidad de traducción frente al modelo original en FP32 para medir la pérdida por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX INT8 de 0,4 GB, la huella de memoria es reducida, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX con onnxruntime permite ejecución en CPU y, potencialmente, en GPU, pero no se especifica.
- Opciones de despliegue: onnxruntime (principal, dado el formato), runtime OPUS de Subtitle Tap; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-lv-int8-shift-att | no disponible | no disponible | en→lv | cc-by-4.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tc-big-en-lv | no disponible | no disponible | en→lv (multi-target) | cc-by-4.0 | safetensors / PyTorch |
| Helsinki-NLP/opus-mt-en-lv (familia base) | no disponible | no disponible | en→lv | cc-by-4.0 | safetensors / PyTorch |

La comparativa se limita a la familia OPUS-MT; no se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sólo cubre el par inglés → letón; no traducción inversa ni otros idiomas.
- La cuantización INT8 puede degradar la calidad de traducción frente al modelo original en FP32; no se han publicado métricas de esa pérdida.
- Riesgo de alucinación y de traducciones erráticas en frases ambiguas, jerga o dominios especializados, como es habitual en modelos Marian entrenados sobre OPUS.
- Sesgos presentes en los datos OPUS de entrenamiento originales; no se documentan sesgos específicos.
- La licencia cc-by-4.0 exige atribución a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal, 2020) en cualquier uso, incluido comercial.
- El modelo está optimizado para un runtime OPUS concreto (Subtitle Tap); su integración en otros stacks requiere adaptar el tokenizer runtime y la gestión del prefijo `>>lav<<`.
- No se especifica la longitud máxima de contexto, lo que limita la planificación para documentos largos.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria del funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-lv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-lv
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Proyecto OPUS (datos): https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
