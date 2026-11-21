# ukrbublik/opus-mt-nl-en-int8-shift-att

## Resumen

`ukrbublik/opus-mt-nl-en-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-nl-en`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT). El modelo traduce directamente de neerlandés (nl) a inglés (en), sin pivote intermedio a través de una tercera lengua, y está pensado para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder de traducción entrenado sobre datos del corpus OPUS. Esta conversión mantiene los pesos originales y solo altera el formato: exportación con optimum (opset 17, sin past key/values) y cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor). El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegue en entornos con recursos limitados.

La particularidad de esta versión es que el decodificador expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder del nivel 2. Se trata de una identidad sobre un nodo existente, de modo que los pesos y el proceso de decodificación no cambian; la salida sirve para obtener alineamientos entre tokens de origen y destino, útil en aplicaciones de subtitulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime; pesos originales en fp32 en el modelo base |
| Idiomas soportados | neerlandés (nl) como origen, inglés (en) como destino |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values; tokenizador en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de traducción automática de la familia Marian, la misma arquitectura que emplea el proyecto OPUS-MT. El entrenamiento original corrió a cargo del Language Technology Research Group de la Universidad de Helsinki (Jörg Tiedemann et al.) sobre datos del corpus OPUS, un agregado de corpus paralelos multilingües. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni de si se aplicaron técnicas de RLHF o DPO.

Esta conversión concreta no reentrena ni modifica los pesos: exporta el modelo con optimum a ONNX (opset 17) y aplica cuantización dinámica INT8 con onnxruntime. La innovación destacable es la adición de la salida `alignment_shift_l2`, que expone las probabilidades de atención encoder del nivel 2 del decodificador mediante una identidad sobre un nodo ya existente. Esto permite extraer alineamientos token a token sin alterar el comportamiento de traducción. El repositorio incluye además `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decodificador, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario junto con las cadenas de tokens de destino.

## Capacidades

- Traducción directa de neerlandés a inglés, sin pivote a través de una lengua intermedia.
- Generación de alineamientos de atención encoder (nivel 2) entre tokens de origen y destino mediante la salida `alignment_shift_l2`.
- Ejecución en dispositivo con onnxruntime, gracias a la exportación ONNX y la cuantización INT8.
- Tokenización SentencePiece empaquetada en un fichero JSON listo para runtime (`tokenizer_runtime.json`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Cobertura lingüística limitada exclusivamente al par nl→en.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos de neerlandés a inglés en el propio dispositivo usando los ficheros ONNX INT8, sin depender de servicios en la nube y con un consumo de almacenamiento reducido (repo de 0,1 GB).
- Alineamiento de subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar tokens de origen y destino, lo que facilita la sincronización y el resaltado de correspondencias en interfaces de aprendizaje de idiomas o revisión de traducciones.
- Traducción offline en entornos sin conectividad: al ejecutarse con onnxruntime en local, el modelo es adecuado para dispositivos móviles o sistemas embebidos donde no hay acceso a red.
- Procesamiento por lotes de documentos neerlandeses: se puede integrar en pipelines de preprocesamiento que necesiten convertir texto nl a en antes de tareas posteriores de análisis, con la ventaja de la cuantización INT8 para reducir requisitos de cómputo.
- Prototipado de sistemas de traducción de bajo coste: sirve como base para experimentar con alineamientos de atención en investigación de NMT, ya que expone probabilidades internas sin necesidad de modificar el modelo.
- Aplicaciones de accesibilidad: traducción en tiempo real de contenido neerlandés (por ejemplo, vídeos o documentos) a inglés en dispositivos de gama media, gracias al reducido tamaño y a la inferencia optimizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la cuantización INT8, la huella de memoria es muy reducida, apta para dispositivos móviles.
- GPU recomendadas: no se especifican; al ser un modelo pequeño cuantizado, puede ejecutarse en CPU y en GPUs de gama baja.
- ¿Cabe en consumer GPU? Sí, con toda probabilidad, dado el tamaño del modelo; no se detallan modelos concretos.
- Opciones de despliegue: onnxruntime (runtime objetivo según la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-nl-en-int8-shift-att | no disponible | no disponible | nl→en | apache-2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-nl-en (base) | no disponible | no disponible | nl→en | apache-2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT nl→en | no disponible | no disponible | nl→en | apache-2.0 | variable |

La comparación se limita al modelo base del que deriva esta conversión; no se dispone de datos de rendimiento ni de parámetros para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- El modelo solo cubre el par nl→en; no traduce en sentido inverso ni a otras lenguas.
- Al ser una conversión de OPUS-MT, hereda los sesgos y limitaciones del corpus OPUS y del entrenamiento original, no documentados en la información disponible.
- Riesgo de alucinación y errores de traducción inherente a los sistemas NMT, especialmente en dominios especializados o texto con ruido.
- La cuantización INT8 puede introducir una ligera pérdida de calidad frente al modelo en fp32; no se han publicado métricas que lo cuantifiquen.
- La licencia apache-2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) según indica la model card.
- La salida de alineamiento está vinculada al SHA-256 del decodificador mediante `alignment.json`; cualquier modificación del fichero ONNX invalidaría esa correspondencia.
- No se documentan requisitos de contexto máximo ni comportamiento con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-nl-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-nl-en
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
