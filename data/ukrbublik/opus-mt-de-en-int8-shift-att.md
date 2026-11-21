# ukrbublik/opus-mt-de-en-int8-shift-att

## Resumen

`ukrbublik/opus-mt-de-en-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-de-en`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de alemán a inglés, sin pivotar a través de una lengua intermedia, y está pensado para su uso en el runtime OPUS on-device de la aplicación Android Subtitle Tap.

La conversión la firma el usuario ukrbublik y no modifica los pesos originales: solo cambia el formato de los ficheros (exportación a ONNX con opset 17 y cuantización dinámica INT8 con QInt8 por tensor mediante onnxruntime). Incluye además una salida adicional de alineación (`alignment_shift_l2`), que expone las probabilidades de atención encoder-decoder de la capa 2 como un nodo Identity, sin alterar el decodificado.

Se trata de un modelo pequeño (repo de 0,1 GB) basado en la arquitectura Marian, licenciado bajo Apache 2.0, con soporte únicamente para el par de idiomas alemán-inglés. Su relevancia radica en su idoneidad para traducción en dispositivos con recursos limitados y en la salida de alineación, útil para aplicaciones de subtitulado que necesitan correspondencias a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) mediante onnxruntime |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-de-en` es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT de la Universidad de Helsinki sobre datos del corpus OPUS (Tiedemann y Thottingal, 2020). La revisión concreta utilizada es `1a922f3b32a8e809e17a47d4b32142d8105924e5`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión de este repositorio aplica una exportación con optimum (opset 17, sin past key/values) y una cuantización dinámica INT8 por tensor con onnxruntime. El decodificador incorpora una salida adicional, `alignment_shift_l2`, que corresponde a las probabilidades de atención encoder-decoder de la capa 2 expuestas mediante un nodo Identity: los pesos y el proceso de decodificado no cambian. El repositorio incluye también `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario y a las cadenas de tokens destino, y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador.

## Capacidades

- Traducción directa de alemán a inglés, sin pivotar a través de una tercera lengua.
- Generación de texto traducido token a token mediante decodificado autorregresivo.
- Salida de alineación a nivel de atención (`alignment_shift_l2`) que permite obtener correspondencias entre tokens de origen y destino, útil para subtitulado y resaltado sincronizado.
- Ejecución en dispositivo mediante ONNX Runtime con pesos cuantizados a INT8.
- Tokenizador empaquetado en JSON para su uso en un runtime propio sin dependencia de la librería original de SentencePiece.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión o audio).

## Casos de uso

- Subtitulado en dispositivos Android: la salida `alignment_shift_l2` permite alinear cada subtítulo alemán con su traducción inglesa a nivel de token, lo que facilita la sincronización temporal en la app Subtitle Tap sin necesidad de conexión a red.
- Traducción offline en movilidad: al tratarse de un modelo de 0,1 GB en INT8 y ejecutable con ONNX Runtime, puede integrarse en aplicaciones móviles que necesiten traducir texto alemán a inglés sin enviar datos a un servidor.
- Procesamiento por lotes de documentos alemanes: el modelo puede traducir grandes volúmenes de texto (informes, actas, correspondencia) en pipelines locales donde la confidencialidad impide usar servicios en la nube.
- Preprocesado para búsqueda y análisis: traducción de contenido alemán a inglés antes de indexarlo en motores de búsqueda o sistemas de análisis de texto que operan principalmente en inglés.
- Herramientas de accesibilidad: generación de subtítulos traducidos en tiempo real para contenido audiovisual en alemán, aprovechando la alineación para mantener la correspondencia con el audio original.
- Prototipado e investigación en traducción automática: el par de ficheros ONNX y el tokenizador en JSON permiten experimentar con un modelo Marian cuantizado en entornos de investigación sin depender de frameworks de deep learning completos.
- Integración en aplicaciones de escritorio o web con ONNX Runtime: despliegue ligero en entornos donde no se dispone de GPU y se busca una latencia baja con un modelo de tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que el modelo cuantizado a INT8 es muy ligero y cabe holgadamente en memoria de dispositivos móviles y GPU de gama baja.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente. El modelo está diseñado para ejecución en CPU mediante ONNX Runtime en Android.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del repositorio.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan otros runtimes como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-de-en-int8-shift-att | no disponible | no disponible | de, en | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-de-en | no disponible | no disponible | de, en | Apache 2.0 | safetensors / PyTorch |
| Otros modelos Marian OPUS-MT de-en | no disponible | no disponible | de, en | Apache 2.0 | variable |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros modelos de traducción alemán-inglés de OPUS-MT o modelos multilingües tipo NLLB) no puede completarse con datos de rendimiento porque no se han publicado benchmarks en la información disponible. La diferencia principal frente al modelo base es el formato (ONNX INT8 en lugar de PyTorch) y la salida adicional de alineación.

## Limitaciones y advertencias

- Modelo restringido al par alemán-inglés; no soporta otros idiomas ni traducción inversa.
- Al ser una conversión del modelo original, hereda los sesgos y limitaciones de los datos OPUS con los que se entrenó el modelo base.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, jurídico, médico) no representados en los datos de entrenamiento.
- La cuantización INT8 puede introducir una ligera degradación de calidad respecto al modelo en precisión completa; no se han publicado métricas que cuantifiquen esa pérdida.
- La salida de alineación es una exposición de atención de la capa 2 y no debe interpretarse como una alineación de palabras garantizada; su calidad depende del comportamiento interno del modelo.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- No se documentan requisitos de contexto máximo ni límites de longitud de entrada; conviene validar el comportamiento con secuencias largas antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-de-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-en
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
