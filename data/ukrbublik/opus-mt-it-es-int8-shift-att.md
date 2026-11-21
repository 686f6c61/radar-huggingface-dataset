# ukrbublik/opus-mt-it-es-int8-shift-att

## Resumen

`ukrbublik/opus-mt-it-es-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-it-es`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de italiano a español sin pivotar a través del inglés, y está pensado para ejecutarse en dispositivos Android dentro de la aplicación Subtitle Tap como runtime de traducción en el propio dispositivo.

La arquitectura es Marian (transformer encoder-decoder), el estándar de la familia OPUS-MT, entrenada sobre datos del corpus OPUS. Esta variante concreta no modifica los pesos: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 por tensor (QInt8) mediante onnxruntime. Además, el decodificador expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del nivel 2, útil para alinear tokens entre origen y destino.

Su relevancia es acotada pero práctica: ofrece un artefacto ligero (0,1 GB de repositorio), autocontenido y listo para inferencia local en entornos con recursos limitados, con tokenizador empaquetado en JSON y licencia Apache 2.0 que permite uso comercial. No es un modelo de propósito general ni compite en benchmarks de razonamiento: es una pieza de infraestructura de traducción especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; export ONNX opset 17 |
| Idiomas soportados | italiano (it) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizador en JSON (`tokenizer_runtime.json`), metadatos de alineacion en `alignment.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-it-es` es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT sobre pares de frases del corpus OPUS. Esta conversión mantiene intactos los pesos y el proceso de decodificación: el export a ONNX elimina los past key/values (es decir, no usa caché de atención entre pasos) y aplica cuantización dinámica INT8 por tensor con onnxruntime. La única adición funcional es una salida de identidad sobre un nodo existente que expone `alignment_shift_l2`, las probabilidades de atención encoder de la capa 2 del decodificador, sin alterar el comportamiento generativo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; la model card solo cita el corpus OPUS y la publicación de Tiedemann y Thottingal (EAMT 2020). El repositorio incluye `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador, lo que permite verificar la integridad del artefacto.

## Capacidades

- Traducción directa italiano → español, sin pivotar por inglés.
- Traducción de frases y subtítulos, orientada a integración en aplicaciones móviles.
- Exposición de probabilidades de atención encoder (`alignment_shift_l2`) para alineación de tokens entre origen y destino.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` con piezas, puntuaciones y cadenas de tokens destino mapeadas a ids.
- Ejecución en el propio dispositivo mediante onnxruntime, sin dependencia de servicios externos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de subtítulos en Android: la aplicación Subtitle Tap usa este artefacto como runtime OPUS en el dispositivo para traducir subtítulos de italiano a español sin conexión, gracias al formato ONNX INT8 y al tamaño reducido del repositorio (0,1 GB).
- Traducción offline en dispositivos con recursos limitados: la cuantización INT8 y la ausencia de past key/values reducen el coste de memoria, lo que permite desplegarlo en teléfonos y equipos sin GPU dedicada.
- Alineación de tokens para herramientas de subtitulado: la salida `alignment_shift_l2` permite construir correspondencias entre palabras origen y destino, útil para resaltar sincronización o para control de calidad de traducciones.
- Preprocesado en pipelines multilingües: como paso intermedio para normalizar contenido italiano a español antes de tareas posteriores de análisis o indexación.
- Traducción de documentación técnica o contenido editorial de it a es en lotes, con verificación de integridad mediante `alignment.json`.
- Prototipado e investigación en traducción automática: al ser un export ONNX reproducible de un modelo OPUS-MT conocido, sirve como referencia para comparar cuantización INT8 frente al modelo original en FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que la inferencia INT8 cabe holgadamente en memoria de dispositivos móviles y equipos de gama baja.
- GPU recomendadas: no se especifican; al ser un modelo Marian pequeño, puede ejecutarse en CPU y en GPUs consumer (por ejemplo, RTX 4090) sin problemas, aunque no hay datos de rendimiento publicados.
- Cabe en GPU consumer: sí, por el tamaño del artefacto, aunque no se documentan cifras de latencia ni throughput.
- Opciones de despliegue: onnxruntime (formato nativo del artefacto); no se proporcionan pesos en safetensors, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-it-es-int8-shift-att` | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Conversion con salida de alineacion, sin pivot |
| `Helsinki-NLP/opus-mt-it-es` | no disponible | no disponible | Apache 2.0 | safetensors (transformers) | Modelo base original en FP32 |
| `Helsinki-NLP/opus-mt-it-en` + `opus-mt-en-es` | no disponible | no disponible | Apache 2.0 | safetensors | Traduccion con pivot por ingles, dos pasos |

La comparación se limita a la familia OPUS-MT porque no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un único par de idiomas (it → es); no traduce otras direcciones ni idiomas.
- No se documentan sesgos específicos, pero al entrenarse sobre el corpus OPUS puede heredar sesgos de los datos paralelos originales.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados o frases ambiguas, habitual en modelos Marian de este tamaño.
- Longitud de contexto no documentada; el export sin past key/values puede afectar a la eficiencia en secuencias largas.
- La licencia Apache 2.0 permite uso comercial, pero conviene citar el trabajo original de Tiedemann y Thottingal (2020) según indica la model card.
- La salida de alineación `alignment_shift_l2` es una identidad sobre un nodo existente: no debe interpretarse como un mecanismo de alineación entrenado específicamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-it-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-it-es
- Publicación de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
