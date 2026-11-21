# ukrbublik/opus-mt-es-nl-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-nl-int8-shift-att` es una conversión del modelo de traducción neuronal `Helsinki-NLP/opus-mt-es-nl` del grupo OPUS-MT (Universidad de Helsinki) al formato ONNX con cuantización dinámica INT8. El modelo traduce directamente entre español y neerlandés sin pivotar por el inglés, y añade una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder-decoder de la capa 2. Está pensado para inferencia en dispositivo (on-device), concretamente para el runtime OPUS de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq clásico para traducción automática, exportado con optimum a opset 17 y sin caché de key/values (no past). El repositorio solo cambia el formato de los pesos y los tokenizadores, no los pesos ni la lógica de decodificación. El tamaño del repo es de 0,1 GB, lo que lo hace adecuado para despliegue en entornos con recursos limitados.

La relevancia de esta ficha es doble: por un lado documenta una variante práctica de OPUS-MT para traducción español-neerlandés en móvil; por otro, la salida de alineación es útil para tareas de subtitulado, donde se necesita correspondencia entre tokens de origen y destino. Al tener 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto muy específico y poco adoptado fuera de su caso de uso original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; export ONNX opset 17 sin past key/values |
| Idiomas soportados | es, nl |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizador en `tokenizer_runtime.json`, metadatos de alineación en `alignment.json` |

## Arquitectura y entrenamiento

El modelo es una conversión del OPUS-MT `Helsinki-NLP/opus-mt-es-nl` (revision `f04335f1ef73b36571b410a68112dcf61d26994a`), que sigue la arquitectura Marian: un transformer encoder-decoder orientado a traducción automática, entrenado sobre datos OPUS por el Language Technology Research Group de la Universidad de Helsinki (Tiedemann et al., 2020). No se dispone de detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni si se aplicó RLHF o DPO; esa información no está incluida en la model card del repositorio derivado.

La innovación técnica de esta conversión concreta es doble. Primero, el export con optimum a ONNX opset 17 sin past key/values, lo que simplifica el grafo y facilita la ejecución en runtimes móviles. Segundo, la cuantización dinámica INT8 per-tensor con onnxruntime, que reduce el peso y acelera la inferencia en CPU. Además, el decoder emite `alignment_shift_l2`, una salida Identity sobre un nodo existente que expone las probabilidades de atención encoder-decoder de la capa 2; los pesos y la decodificación no cambian. El archivo `alignment.json` actúa como recibo que vincula esa salida al SHA-256 del decoder.

## Capacidades

- Traducción directa español a neerlandés y neerlandés a español sin pivotar por inglés.
- Generación de texto seq2seq orientada a traducción (no es un modelo generativo generalista).
- Salida de alineación token a token mediante `alignment_shift_l2` (atención encoder-decoder de la capa 2), útil para subtitulado y correspondencia origen-destino.
- Inferencia on-device en CPU mediante ONNX Runtime con pesos INT8.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` con piezas, scores y cadenas de tokens destino.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni thinking mode.
- Capacidades multilingües limitadas a los pares es-nl incluidos en el modelo base.

## Casos de uso

- Subtitulado automático español-neerlandés en Android: la app Subtitle Tap puede usar la salida `alignment_shift_l2` para alinear tokens del subtítulo original con la traducción, lo que permite sincronizar y resaltar fragmentos traducidos sin pivotar por inglés.
- Traducción offline en dispositivo: al ser un modelo ONNX INT8 de 0,1 GB, puede ejecutarse localmente en móviles sin conexión, útil para viajes o entornos con conectividad limitada.
- Preprocesado de corpus bilingües: generar pares es-nl para entrenamiento o evaluación de otros sistemas, aprovechando la traducción directa y la alineación por token.
- Localización de interfaces y contenidos: traducción de cadenas cortas y documentación técnica del español al neerlandés dentro de pipelines automatizados, con latencia baja en CPU.
- Análisis de atención para investigación: el volcado de probabilidades de atención de la capa 2 permite estudiar patrones de alineación léxica en un par lingüístico concreto.
- Despliegue embebido en apps de accesibilidad: lectura de subtítulos traducidos en tiempo real en dispositivos de gama baja, gracias a la cuantización INT8 y a la ausencia de past key/values en el grafo.
- Prototipado de sistemas de traducción sin GPU: servir el modelo con ONNX Runtime en servidores CPU para pruebas de integración antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para GPU; al ser ONNX INT8 pensado para CPU, el consumo de memoria es bajo (repo de 0,1 GB), pero no se documentan cifras exactas.
- GPU recomendadas: no disponible; el modelo está orientado a inferencia on-device en CPU.
- Cabe en GPU consumer: previsiblemente sí por tamaño, pero no hay datos oficiales de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (runtime OPUS de Subtitle Tap), export optimum; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-es-nl-int8-shift-att | no disponible | no disponible | es, nl | apache-2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-es-nl | no disponible | no disponible | es, nl | apache-2.0 (modelo base) | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-nl | no disponible | no disponible | en, nl | apache-2.0 | safetensors/PyTorch |

La comparación directa con el modelo base es la más relevante: este repositorio solo cambia formato y cuantización, y añade la salida de alineación. Frente a otros OPUS-MT, comparte arquitectura Marian y licencia, pero se distingue por el formato ONNX INT8 y la salida `alignment_shift_l2`. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar los datos OPUS, puede reflejar sesgos de los corpus de entrenamiento originales.
- Riesgo de alucinación: no evaluado en la información disponible; como modelo seq2seq de traducción, puede producir traducciones plausibles pero incorrectas en dominios especializados.
- Limitaciones de contexto o idioma: solo cubre es-nl; no se especifica longitud máxima de secuencia.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene mantener la atribución a OPUS-MT y a Tiedemann y Thottingal (2020).
- Caveat de producción: la cuantización INT8 puede degradar ligeramente la calidad frente al modelo base en FP32; no hay métricas publicadas que lo cuantifiquen. La salida de alineación es una Identity sobre un nodo existente, por lo que su semántica depende del grafo exportado y debe validarse contra `alignment.json` (SHA-256 del decoder).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-es-nl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-nl
- Referencia OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
