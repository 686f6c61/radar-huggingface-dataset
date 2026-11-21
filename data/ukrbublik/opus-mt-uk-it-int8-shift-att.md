# ukrbublik/opus-mt-uk-it-int8-shift-att

## Resumen

`ukrbublik/opus-mt-uk-it-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-uk-it`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente del ucraniano al italiano, sin pivotar a través del inglés, y está empaquetado específicamente para inferencia en dispositivo dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos del corpus OPUS. El repositorio no modifica los pesos originales: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor). Incluye además una salida adicional de alineamiento (`alignment_shift_l2`) que expone las probabilidades de atención encoder del decodificador en la capa 2, útil para aplicaciones de subtitulado que necesitan alinear tokens origen y destino.

El interés de esta ficha es acotado: se trata de un artefacto de despliegue muy específico (0,1 GB, sin descargas ni likes en el momento de la consulta), no de un modelo de propósito general. Es relevante para quien necesite traducción uk→it offline en Android con onnxruntime y requiera información de alineamiento a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | ucraniano (uk) → italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es Marian NMT, la implementación de traducción neuronal de Helsinki-NLP ampliamente usada en la familia OPUS-MT. Se trata de un transformer encoder-decoder estándar entrenado sobre pares de frases del corpus OPUS. La model card no detalla el número de parámetros, la composición exacta del dataset ni el volumen de tokens de entrenamiento; solo indica que los pesos provienen de la revisión `a6a4230c294f9e81413885a1eaa9baaf378c5206` del modelo original y que fueron entrenados con datos OPUS.

La conversión de este repositorio aplica exportación con optimum (opset 17, sin past key/values, lo que implica que la decodificación no reutiliza caché KV entre pasos) y cuantización dinámica INT8 de onnxruntime. La innovación técnica destacable es la salida `alignment_shift_l2`: una Identity sobre un nodo existente que expone las probabilidades de atención encoder de la capa 2 del decodificador, sin alterar pesos ni decodificación. El repositorio incluye `alignment.json` como recibo que vincula esa salida al SHA-256 del decodificador. No se documenta RLHF, DPO ni decodificación especulativa.

## Capacidades

- Traducción directa ucraniano → italiano, sin pivot a través del inglés.
- Inferencia en dispositivo mediante onnxruntime, con encoder y decodificador como grafos ONNX separados.
- Salida de alineamiento a nivel de atención (`alignment_shift_l2`) para tareas de subtitulado y alineación de tokens.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` (piezas, puntuaciones y mapeo a ids de vocabulario).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni uso como agente.
- Multilingüismo limitado estrictamente al par uk→it.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap usa el modelo para traducir subtítulos uk→it en el dispositivo; la salida de alineamiento permite sincronizar y mapear tokens origen-destino sin conexión.
- Traducción offline en dispositivos de gama media: al ser INT8 y ocupar 0,1 GB, cabe en almacenamiento y memoria de móviles sin depender de la nube.
- Procesamiento por lotes de documentos uk→it en servidores sin GPU: onnxruntime ejecuta el grafo cuantizado en CPU con requisitos mínimos.
- Integración en pipelines de localización de contenido ucraniano a italiano con verificación de alineamiento por token.
- Herramientas de estudio de idiomas que necesiten resaltar correspondencias entre palabras ucranianas e italianas usando las probabilidades de atención de la capa 2.
- Prototipado de sistemas de traducción embebidos donde el tamaño del binario y la ausencia de dependencias de framework (solo onnxruntime) son críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU con onnxruntime.
- GPU recomendadas: no disponibles; no se documenta aceleración por GPU.
- Cabe en GPU consumer: sí, por tamaño (0,1 GB en INT8), aunque no hay datos de rendimiento en GPU.
- Despliegue: onnxruntime (runtime objetivo declarado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato Marian ONNX directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-it-int8-shift-att | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Conversión con salida de alineamiento |
| Helsinki-NLP/opus-mt-uk-it | no disponible | no disponible | Apache 2.0 | PyTorch/safetensors | Modelo original sin cuantizar |
| Otros modelos OPUS-MT uk→X | no disponible | no disponible | Apache 2.0 | variable | Misma familia, distinto par de idiomas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes; no hay evidencia de validación por la comunidad.
- La cuantización INT8 dinámica puede degradar la calidad de traducción respecto al modelo original en fp32; no se documenta la magnitud de esa pérdida.
- La exportación sin past key/values implica decodificación menos eficiente (recomputa el contexto en cada paso).
- Sesgos: no documentados, pero heredados de los datos OPUS del modelo base.
- Riesgo de alucinación y errores en frases largas o dominios especializados, típico de modelos Marian pequeños.
- Cobertura limitada al par uk→it; no traduce otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020).
- La salida de alineamiento es una Identity sobre un nodo interno; su estabilidad entre versiones de onnxruntime no está garantizada.
- No apto para producción de alta calidad sin evaluación previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-it-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-it
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
