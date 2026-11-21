# ukrbublik/opus-mt-en-af-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-af-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-af`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo realiza traducción directa inglés → afrikáans sin pivotar a través de una lengua intermedia, y está pensado para ejecutarse en el runtime OPUS on-device de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian (transformer encoder-decoder), el estándar de la familia OPUS-MT, con un tamaño de repositorio de 0,1 GB tras la exportación y cuantización. La innovación concreta de esta variante es la exposición de una salida adicional de alineamiento: el decoder emite `alignment_shift_l2`, las probabilidades de atención encoder-decoder de la capa 2, mediante una operación Identity sobre un nodo existente, sin alterar pesos ni decodificación.

Es relevante para desarrolladores que necesiten traducción EN→AF embebida en dispositivos con recursos limitados (móvil, edge) y que requieran información de alineamiento entre tokens origen y destino, por ejemplo para subtitulado o para resaltar correspondencias léxicas. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime; export ONNX opset 17 sin past key/values |
| Idiomas soportados | inglés (en) y afrikáans (af) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura empleada por la familia OPUS-MT. Los pesos originales fueron entrenados por la Universidad de Helsinki sobre datos de OPUS (corpus paralelos de dominio público y web). Esta variante concreta no reentrena ni modifica los pesos: solo cambia el formato (exportación a ONNX con optimum, opset 17, sin past key/values) y aplica cuantización dinámica INT8 con onnxruntime.

La particularidad técnica es la salida de alineamiento: el decoder expone `alignment_shift_l2`, que corresponde a las probabilidades de atención encoder-decoder de la capa 2, implementada como una Identity sobre un nodo ya existente. Esto permite obtener correspondencias token a token entre origen y destino sin coste adicional de cómputo ni cambios en la decodificación. El repositorio incluye además `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a los ids de vocabulario. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Traducción automática directa inglés → afrikáans, sin pivotar por una tercera lengua.
- Salida de alineamiento de atención (`alignment_shift_l2`) para obtener correspondencias entre tokens origen y destino.
- Ejecución on-device mediante ONNX Runtime con cuantización INT8.
- Tokenización SentencePiece compatible con el modelo original, expuesta vía `tokenizer_runtime.json`.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento multi-step ni capacidades de agente.
- Capacidad multilingüe limitada a los dos idiomas del par (en, af).
- No incluye visión, audio ni otras modalidades.

## Casos de uso

- Subtitulado automático en dispositivos móviles: la app Subtitle Tap usa el modelo para traducir subtítulos EN→AF en el propio dispositivo, sin enviar texto a servidores, gracias al runtime ONNX INT8 y al tamaño reducido del repositorio (0,1 GB).
- Resaltado de correspondencias léxicas: la salida `alignment_shift_l2` permite mapear qué token inglés originó cada token afrikáans, útil para interfaces que muestran la traducción alineada palabra por palabra.
- Traducción offline en zonas sin conectividad: al ejecutarse on-device, es adecuado para aplicaciones de campo, turismo o asistencia en entornos con red intermitente.
- Procesamiento por lotes de documentos EN→AF en servidores modestos: la cuantización INT8 reduce requisitos de memoria y permite desplegar el modelo en CPUs sin GPU.
- Integración en pipelines de accesibilidad: generación de subtítulos traducidos en tiempo real para contenido audiovisual en inglés dirigido a hablantes de afrikáans.
- Prototipado de sistemas de traducción asistida: el par EN→AF es poco cubierto por modelos grandes; este modelo ligero sirve como base para herramientas de postedición o diccionarios bilingües.
- Verificación de calidad de traducciones: el alineamiento permite auditar correspondencias y detectar desajustes en flujos de control de calidad lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo cuantizado INT8 (repo de 0,1 GB) está diseñado para ejecutarse con onnxruntime en CPU, incluyendo dispositivos Android de gama media.
- VRAM estimada: no disponible; al ser un modelo de 0,1 GB cuantizado, cabe holgadamente en cualquier GPU consumer, aunque no se especifican cifras exactas.
- GPU recomendadas: no disponible; el caso de uso declarado es on-device, por lo que no se documentan GPU de datacenter (A100, H100) ni consumer (RTX 4090).
- Cabe en GPU consumer: sí, por tamaño, aunque no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime (runtime OPUS de Subtitle Tap); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-af-int8-shift-att | no disponible | no disponible | en, af | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-af (base) | no disponible | no disponible | en, af | Apache 2.0 | PyTorch/safetensors |
| Otros OPUS-MT en→af | no disponible | no disponible | en, af | Apache 2.0 | varía |

La comparación directa con alternativas de la misma categoría (modelos de traducción EN→AF ligeros) no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato ONNX INT8 y la salida de alineamiento añadida.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre datos OPUS, puede heredar sesgos de los corpus paralelos de origen; no se documentan análisis específicos.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones fluidas pero incorrectas, especialmente en dominios especializados o frases ambiguas.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; el modelo base Marian suele estar limitado a secuencias relativamente cortas, pero no se confirma en la información disponible.
- Idiomas: solo cubre inglés y afrikáans; no es multilingüe más allá de ese par.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a la Universidad de Helsinki y citar el paper de OPUS-MT (Tiedemann y Thottingal, 2020).
- Producción: la cuantización INT8 puede introducir una ligera pérdida de calidad frente al modelo en precisión completa; no se documenta la magnitud de esa degradación. El modelo está orientado a un runtime concreto (Subtitle Tap), por lo que su integración en otros sistemas requiere adaptar el pipeline ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-af-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-af
- Paper OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): no disponible como enlace directo en la información proporcionada
- Repositorio OPUS-MT: no disponible en la información proporcionada
- Aplicación Subtitle Tap: no disponible enlace directo en la información proporcionada
