# ukrbublik/opus-mt-en-hr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-en-hr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-zls`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión es el usuario de Hugging Face `ukrbublik`, que la ha preparado específicamente para el motor de inferencia en dispositivo (on-device) de la aplicación Android Subtitle Tap.

Se trata de un modelo Marian de traducción directa inglés-croata (en→hr), sin pivote a través del inglés, derivado de un modelo multiobjetivo entrenado sobre datos de OPUS. La conversión incluye una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder-decoder de la capa 2 del decoder, pensada para aplicaciones que necesitan alinear tokens de origen y destino (por ejemplo, subtítulos).

La relevancia de esta ficha es acotada: no es un modelo novedoso ni un entrenamiento propio, sino un artefacto de despliegue optimizado (formato ONNX, cuantización INT8 dinámica, tokenizer serializado en JSON) para un caso de uso muy específico de traducción de subtítulos en Android. No hay métricas de calidad publicadas ni datos de entrenamiento propios en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX (opset 17, sin past key/values) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (origen), hr (destino) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON (`tokenizer_runtime.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq típico de la familia OPUS-MT, entrenado originalmente por la Universidad de Helsinki sobre datos paralelos de OPUS. El modelo base `Helsinki-NLP/opus-mt-en-zls` es multiobjetivo (cubre varias lenguas eslavas del sur, de ahí el sufijo `zls`); esta conversión selecciona el croata mediante el token de prefijo `>>hrv<<` insertado antes de cada frase de origen (`sourcePrefixTokenIds` en `tokenizer_runtime.json`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; esos detalles corresponden al modelo base y no se documentan en la información proporcionada. La innovación técnica de esta conversión es doble: por un lado, la exportación a ONNX con cuantización INT8 dinámica per-tensor para reducir el tamaño y acelerar la inferencia en CPU; por otro, la exposición de una salida adicional `alignment_shift_l2` que replica (mediante una operación Identity sobre un nodo existente) las probabilidades de atención encoder-decoder de la capa 2 del decoder, sin alterar pesos ni decodificación. Un fichero `alignment.json` vincula esa salida al SHA-256 del decoder para garantizar integridad.

## Capacidades

- Traducción automática directa inglés → croata, sin pivote intermedio por inglés.
- Salida de alineación token a token mediante `alignment_shift_l2` (probabilidades de atención de la capa 2 del decoder), útil para resaltado o sincronización de subtítulos.
- Tokenizer serializado en JSON (`tokenizer_runtime.json`) con piezas y puntuaciones del modelo SentencePiece original mapeadas a identificadores de vocabulario, más las cadenas de tokens de destino.
- Inferencia en dispositivo (on-device) mediante ONNX Runtime, sin dependencia de GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a los dos idiomas indicados (en, hr).

## Casos de uso

- Traducción de subtítulos en Android: la aplicación Subtitle Tap usa este modelo para traducir subtítulos en inglés a croata en el propio dispositivo, con la salida de alineación permitiendo sincronizar o resaltar fragmentos entre el texto original y el traducido.
- Traducción offline en dispositivos de gama baja: al estar cuantizado a INT8 y exportado a ONNX, el modelo puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para escenarios sin conectividad o con requisitos de privacidad (el texto no sale del dispositivo).
- Preprocesado de contenido audiovisual: integración en pipelines que necesiten generar pistas de subtítulos en croata a partir de transcripciones en inglés, con la ventaja de disponer de alineación a nivel de token para tareas de sincronización.
- Aplicaciones de accesibilidad: subtitulado en tiempo real o diferido para usuarios croatas de contenido en inglés, ejecutándose localmente en el teléfono.
- Prototipado de sistemas de traducción con ONNX Runtime: sirve como referencia de cómo exportar y cuantizar un modelo Marian con salidas auxiliares de atención para aplicaciones móviles.
- Distribución de modelos en apps móviles: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX facilitan el empaquetado dentro de un APK o la descarga bajo demanda en la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX Runtime, no requiere GPU.
- GPU recomendadas: no aplica; el artefacto está orientado a inferencia on-device en Android.
- Compatibilidad con GPU de consumo: no relevante para este artefacto; el formato ONNX INT8 puede ejecutarse en CPU de dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (runtime objetivo del autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo en formato GGUF ni un LLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-hr-int8-shift-att | no disponible | no disponible | en→hr | apache-2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-zls (base) | no disponible | no disponible | en→varias lenguas eslavas del sur | apache-2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-hr (si existe variante específica) | no disponible | no disponible | en→hr | apache-2.0 | safetensors/PyTorch |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida adicional de alineación, no la calidad de traducción, que debería ser equivalente al no modificarse los pesos.

## Limitaciones y advertencias

- El modelo solo traduce inglés → croata; no soporta otros pares de idiomas ni traducción inversa.
- Al ser una conversión del modelo base sin reentrenamiento, hereda los sesgos y limitaciones de `Helsinki-NLP/opus-mt-en-zls`, entrenado sobre datos de OPUS cuya composición y cobertura no se detallan.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, jurídico, médico) no representados en los datos de entrenamiento; no hay métricas publicadas (BLEU, COMET) para esta conversión.
- La cuantización INT8 dinámica per-tensor puede introducir una ligera degradación de calidad frente al modelo en precisión completa; no se documenta la magnitud de esa pérdida.
- La salida `alignment_shift_l2` es una Identity sobre un nodo existente: no añade información nueva, solo expone la atención de la capa 2; su utilidad depende de que esa capa sea representativa de la alineación, lo que no se valida en la model card.
- La licencia apache-2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) según indica el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado más allá de la model card.
- El tokenizer serializado en JSON es específico del runtime del autor; no es directamente compatible con librerías estándar de Hugging Face sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-hr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-zls
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
