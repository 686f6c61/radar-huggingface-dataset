# ukrbublik/opus-mt-tr-uk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-tr-uk-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tr-uk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT (Tiedemann y Thottingal, 2020). El modelo traduce directamente del turco (tr) al ucraniano (uk) sin pivotar por el inglés, y está pensado para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos paralelos del corpus OPUS. Esta versión concreta no modifica los pesos ni el proceso de decodificación: solo cambia el formato (exportación a ONNX con opset 17) y aplica cuantización dinámica INT8 de onnxruntime (QInt8, por tensor). Adicionalmente, el decoder expone una salida extra, `alignment_shift_l2`, con las probabilidades de atención encoder del layer 2, que permite obtener alineamientos a nivel de token sin alterar la inferencia.

El interés de esta ficha es acotado: se trata de un artefacto de despliegue para un caso de uso muy específico (traducción de subtítulos turco-ucraniano en Android), con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB. No aporta mejoras de calidad respecto al modelo base; su valor está en el empaquetado ONNX/INT8 y en la salida de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | turco (tr) como origen, ucraniano (uk) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`, opset 17, sin past key/values) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-tr-uk` es un sistema de traducción neuronal Marian, un transformer encoder-decoder con atención multi-cabeza estándar, entrenado por el grupo de la Universidad de Helsinki sobre pares de frases paralelas del corpus OPUS. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de fine-tuning con RLHF o DPO; esos datos deben consultarse en la documentación del modelo original.

Esta conversión mantiene los pesos intactos y solo aplica dos transformaciones: exportación a ONNX con optimum (opset 17, sin caché de past key/values en el decoder) y cuantización dinámica INT8 por tensor mediante onnxruntime. La innovación destacable es la exposición de `alignment_shift_l2`, una salida Identity sobre un nodo ya existente que devuelve las probabilidades de atención encoder del layer 2 del decoder. Esto permite generar alineamientos token a token (útil para subtitulado) sin coste adicional en la decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, más los strings del vocabulario destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción directa turco a ucraniano, sin pivot a través del inglés.
- Generación de alineamientos token a token mediante la salida `alignment_shift_l2` (atención encoder del layer 2).
- Tokenización SentencePiece autocontenida en `tokenizer_runtime.json`, lista para un runtime propio.
- Ejecución en dispositivo mediante onnxruntime con pesos INT8.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado estrictamente al par tr-uk.

## Casos de uso

- Subtitulado automático turco-ucraniano en Android: la salida `alignment_shift_l2` permite alinear cada token traducido con su origen, lo que facilita el ajuste de tiempos de los subtítulos en la app Subtitle Tap.
- Traducción offline en dispositivos móviles: el formato ONNX INT8 y el tamaño de repositorio de 0,1 GB permiten embeber el modelo en una app sin depender de red ni de servidores externos.
- Preprocesado de contenido turco para audiencias ucranianas: traducción de metadatos, descripciones o comentarios en pipelines por lotes con onnxruntime.
- Investigación en alineamiento de atención: el acceso a las probabilidades del layer 2 sirve para estudiar correspondencias léxicas entre turco y ucraniano sin reentrenar el modelo.
- Prototipado de sistemas de traducción de bajo coste: sirve como referencia para comparar calidad de Marian frente a modelos neuronales más grandes en el par tr-uk.
- Integración en herramientas de accesibilidad: subtítulos traducidos en tiempo casi real en dispositivos de gama media gracias a la cuantización INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con un repositorio de 0,1 GB en INT8, la huella en memoria es del orden de decenas o pocos cientos de MB, apta para ejecución en CPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para onnxruntime en dispositivo (CPU móvil), por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: sí, con amplio margen, aunque su destino principal es CPU.
- Opciones de despliegue: onnxruntime (runtime previsto por el autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato ONNX específico y la tokenización propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-tr-uk-int8-shift-att | no disponible | no disponible | tr→uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tr-uk | no disponible | no disponible | tr→uk | Apache 2.0 | safetensors / PyTorch |
| Helsinki-NLP/opus-mt-tc-big-tr-uk (si existe en el hub) | no disponible | no disponible | tr→uk | no disponible | no disponible |

La comparación directa con el modelo base es la más relevante: misma calidad esperada (los pesos no cambian), pero con formato ONNX INT8, tokenización empaquetada y salida de alineamiento adicional. No se dispone de datos de benchmarks para contrastar rendimiento frente a alternativas.

## Limitaciones y advertencias

- Al no modificarse los pesos, hereda los sesgos y errores del corpus OPUS y del modelo base Marian.
- Riesgo de alucinación y de traducciones literales en dominios especializados (técnico, legal, médico).
- Cobertura limitada al par turco-ucraniano; no traduce otros idiomas ni direcciones inversas.
- La cuantización INT8 puede introducir una degradación de calidad no cuantificada en la información disponible.
- El decoder se exporta sin past key/values, lo que puede afectar al rendimiento en secuencias largas.
- La tokenización depende de `tokenizer_runtime.json`; su uso con tokenizadores estándar de Hugging Face no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) y conservar la atribución al grupo de Helsinki.
- No hay métricas publicadas de latencia, throughput ni calidad (BLEU, chrF) para esta conversión concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-tr-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tr-uk
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
