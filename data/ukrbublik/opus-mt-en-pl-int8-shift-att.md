# ukrbublik/opus-mt-en-pl-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-pl-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-zlw`, desarrollado por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de inglés a polaco, sin pivotar a través de una lengua intermedia, y está pensado para su uso en la aplicación Android Subtitle Tap, que ejecuta el modelo en el propio dispositivo mediante un runtime de OPUS.

La arquitectura subyacente es Marian, un transformer encoder-decoder clásico de traducción automática neuronal, con un tamaño de repositorio de aproximadamente 0,1 GB tras la cuantización. La conversión la firma `ukrbublik`, que publica los pesos en formato ONNX (opset 17) cuantizados dinámicamente a INT8 con onnxruntime, e incluye una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder del decodificador en la capa 2, útil para tareas de alineación de subtítulos.

Su relevancia actual radica en que ofrece una alternativa ligera y ejecutable en dispositivo para traducción en→pl, con licencia Apache 2.0 y un formato optimizado para inferencia local. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) mediante onnxruntime |
| Idiomas soportados | inglés (en) y polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de Marian, la arquitectura empleada por la familia OPUS-MT para traducción automática neuronal. Los pesos originales provienen de `Helsinki-NLP/opus-mt-en-zlw` (revisión `92ffd5aa936924688bd715b26d6bb75393082c03`), entrenado sobre datos del corpus OPUS. El modelo upstream es multi-objetivo, y esta conversión selecciona el polaco mediante el token de prefijo `>>pol<<` insertado antes de cada frase de origen (`sourcePrefixTokenIds` en el tokenizer de runtime).

La conversión realizada por `ukrbublik` no modifica los pesos ni la decodificación: únicamente cambia el formato de los ficheros (exportación a ONNX con optimum, opset 17, sin past key/values) y aplica cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor). Además, el decodificador expone una salida adicional `alignment_shift_l2`, que corresponde a las probabilidades de atención encoder de la capa 2 (implementada como una identidad de un nodo existente), junto con un fichero `alignment.json` que vincula esa salida al SHA-256 del decodificador. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción automática directa de inglés a polaco, sin pivotar por una lengua intermedia.
- Generación de traducciones a nivel de frase mediante un transformer encoder-decoder.
- Salida de alineación (`alignment_shift_l2`): probabilidades de atención encoder del decodificador en la capa 2, pensadas para tareas de alineación de subtítulos.
- Tokenizador de runtime (`tokenizer_runtime.json`) con las piezas y puntuaciones del modelo SentencePiece original mapeadas a identificadores de vocabulario, más las cadenas de tokens destino.
- Selección de idioma destino mediante el prefijo `>>pol<<` en el texto de origen.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de subtítulos en dispositivo: la aplicación Subtitle Tap usa el modelo para traducir subtítulos en inglés a polaco localmente, sin conexión, aprovechando el formato ONNX INT8 y su reducido tamaño (0,1 GB) para ejecutarse en un móvil Android.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite obtener probabilidades de atención para alinear palabras o frases entre el texto origen y la traducción, útil en herramientas de subtitulado.
- Traducción de documentación técnica en→pl en pipelines offline: el modelo puede integrarse en scripts de procesamiento por lotes con onnxruntime para traducir ficheros de documentación sin depender de servicios en la nube.
- Traducción de correos o mensajes en aplicaciones de escritorio: al ser un modelo ligero y cuantizado, puede embeberse en aplicaciones de escritorio para traducir texto en inglés a polaco de forma local.
- Preprocesamiento multilingüe para sistemas de recuperación de información: traducir consultas o documentos en inglés al polaco antes de indexarlos en un buscador orientado a ese idioma.
- Prototipado de sistemas de traducción neuronal: sirve como referencia de conversión ONNX INT8 de un modelo Marian, útil para evaluar el rendimiento de la cuantización dinámica en tareas de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que el modelo cuantizado en INT8 es muy ligero y cabe holgadamente en memoria de dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: no disponible. Por su tamaño, no requiere GPUs de datacenter como A100 o H100; puede ejecutarse en CPU y en GPUs consumer.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer moderna e incluso en GPUs integradas, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: onnxruntime (runtime principal, con cuantización dinámica INT8), y potencialmente cualquier runtime compatible con ONNX. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-pl-int8-shift-att | Marian (transformer encoder-decoder) | en→pl | no disponible | Apache 2.0 | ONNX INT8 | Hugging Face |
| Helsinki-NLP/opus-mt-en-zlw | Marian | multi-objetivo (incluye pl) | no disponible | Apache 2.0 | safetensors/PyTorch | Hugging Face |
| Helsinki-NLP/opus-mt-en-pl | Marian | en→pl | no disponible | Apache 2.0 | safetensors/PyTorch | Hugging Face |

La comparativa se limita a los modelos de la familia OPUS-MT, ya que no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineación adicional; el modelo `opus-mt-en-pl` es una variante específica en→pl de la misma familia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al entrenarse sobre el corpus OPUS, puede heredar sesgos presentes en los datos de traducción.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo de traducción neuronal, puede generar traducciones incorrectas o inventar contenido en frases ambiguas.
- Limitaciones de contexto o idioma: solo cubre inglés y polaco; no se documenta la longitud máxima de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- Caveats para producción: el modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad; no se han publicado benchmarks; la salida de alineación es una identidad de un nodo existente y no altera los pesos, pero su fiabilidad no está documentada; el repositorio es una conversión específica para una aplicación Android, por lo que su soporte y mantenimiento pueden ser limitados.

## Enlaces

- [Hugging Face: ukrbublik/opus-mt-en-pl-int8-shift-att](https://huggingface.co/ukrbublik/opus-mt-en-pl-int8-shift-att)
- [Modelo base: Helsinki-NLP/opus-mt-en-zlw](https://huggingface.co/Helsinki-NLP/opus-mt-en-zlw)
- [Repositorio OPUS-MT (Universidad de Helsinki)](https://github.com/Helsinki-NLP/OPUS-MT)
- [Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020](https://aclanthology.org/2020.eamt-1.61/)
