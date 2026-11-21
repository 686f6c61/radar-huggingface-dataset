# ukrbublik/opus-mt-en-eo-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-eo-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-eo`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a esperanto, sin pivotar a través de una lengua intermedia, y está pensado para ejecutarse en dispositivos Android dentro de la aplicación Subtitle Tap, que subtitula vídeos en tiempo real.

La aportación de este repositorio no es un nuevo entrenamiento, sino un cambio de formato: exportación con Optimum a ONNX (opset 17, sin past key/values) y cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor). Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del nivel 2, que permite obtener alineamientos entre tokens de origen y destino sin alterar los pesos ni el proceso de decodificación.

Se trata de un modelo pequeño (repo de 0,1 GB) orientado a inferencia en el borde, no a competición de benchmarks. Su relevancia radica en que demuestra un patrón de despliegue reproducible para traducción neuronal en móvil: cuantización INT8, runtime ONNX y extracción de alineamientos para funcionalidades de subtitulado sincronizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible (modelo base de tamaño reducido; repo de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre exportación ONNX |
| Idiomas soportados | inglés (en), esperanto (eo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, la arquitectura transformer encoder-decoder que el proyecto OPUS-MT usa para sus modelos de traducción. Fue entrenado por el grupo de la Universidad de Helsinki sobre datos del corpus OPUS, según la atribución recogida en la model card. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino adicionales.

La conversión de este repositorio aplica una exportación con Optimum a ONNX en opset 17 sin past key/values (es decir, sin caché de decodificación), seguida de cuantización dinámica INT8 con onnxruntime. El decoder incorpora una salida extra, `alignment_shift_l2`, que es una identidad sobre un nodo existente y expone las probabilidades de atención encoder de la capa 2; los pesos y la lógica de decodificación no cambian. El archivo `alignment.json` actúa como recibo que vincula esa salida al SHA-256 del decoder, y `tokenizer_runtime.json` mapea las piezas y puntuaciones del SentencePiece original a los ids del vocabulario junto con las cadenas del tokenizer de destino.

## Capacidades

- Traducción directa inglés a esperanto, sin pivotar por una lengua intermedia.
- Inferencia en dispositivo mediante ONNX Runtime con pesos cuantizados INT8.
- Extracción de alineamientos de atención encoder-destino a través de `alignment_shift_l2`, útil para sincronizar subtítulos con el audio original.
- Tokenizer autocontenido en JSON, pensado para un runtime propio (aplicación Android Subtitle Tap).
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Cobertura multilingüe limitada estrictamente al par en→eo.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicación Subtitle Tap usa los dos grafos ONNX cuantizados para traducir subtítulos en inglés a esperanto en el propio dispositivo, sin conexión de red ni coste por API.
- Sincronización de subtítulos con el audio: la salida `alignment_shift_l2` permite asociar tokens traducidos con segmentos del texto origen y ajustar los tiempos de aparición de cada línea.
- Traducción offline en entornos sin conectividad: al ejecutarse con ONNX Runtime en local, sirve para dispositivos con red intermitente o restricciones de privacidad donde el texto no debe salir del terminal.
- Aplicaciones educativas de esperanto: traducción de material de lectura en inglés a esperanto con un modelo ligero que cabe en un repositorio de 0,1 GB y puede empaquetarse dentro de la app.
- Procesamiento por lotes de bajo coste: para volúmenes moderados de texto en→eo, el modelo INT8 reduce requisitos de memoria frente a la versión fp32 del modelo base y puede ejecutarse en CPU.
- Base para pipelines de subtitulado comunitario: integración en herramientas que generen pistas de subtítulos en esperanto a partir de transcripciones inglesas, con alineamientos para revisión manual.
- Referencia de despliegue: patrón reproducible de exportación Optimum + cuantización onnxruntime para otros pares de idiomas de OPUS-MT orientados a móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras exactas; por el tamaño del repositorio (0,1 GB) y la cuantización INT8, la huella de memoria es del orden de decenas de megabytes, apta para ejecución en CPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y dispositivos móviles mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, con margen amplio, aunque su destino principal es la inferencia en CPU o en el propio teléfono.
- Opciones de despliegue: ONNX Runtime (runtime objetivo de la app Subtitle Tap); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-eo-int8-shift-att | no disponible (repo 0,1 GB) | no disponible | en→eo | ONNX INT8 | Apache 2.0 |
| Helsinki-NLP/opus-mt-en-eo | no disponible | no disponible | en→eo | safetensors/PyTorch (formato original) | Apache 2.0 |
| Otros modelos OPUS-MT en→X (p. ej. Helsinki-NLP/opus-mt-en-de) | no disponible | no disponible | en→de | safetensors/PyTorch | Apache 2.0 |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a pesos PyTorch) y la salida adicional de alineamientos; los pesos y la calidad de traducción son los del modelo original. No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Solo traduce inglés a esperanto; no cubre otras direcciones ni otros pares de idiomas.
- Al derivar de OPUS-MT, hereda los sesgos y las limitaciones de cobertura del corpus OPUS, que puede estar desequilibrado por dominio (más fuerte en texto institucional y web que en lenguaje coloquial).
- Riesgo de alucinación y de traducciones literales en frases ambiguas, frases hechas o jerga; conviene revisión humana en contenido crítico.
- La cuantización INT8 puede introducir una pérdida de calidad menor respecto a los pesos fp32 originales; no se documenta una evaluación de esa degradación.
- La exportación sin past key/values implica recálculo del contexto en cada paso de decodificación, lo que puede penalizar la latencia en secuencias largas.
- La salida `alignment_shift_l2` es una identidad sobre un nodo interno; su significado depende de la implementación del runtime y no está validada externamente más allá del recibo SHA-256 incluido.
- Licencia Apache 2.0: permite uso comercial, pero exige mantener la atribución a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal, 2020) y conservar el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción fuera de la aplicación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-eo-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-eo
- Repositorio OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/OPUS-MT
- Publicación de referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- ONNX Runtime: https://github.com/microsoft/onnxruntime
