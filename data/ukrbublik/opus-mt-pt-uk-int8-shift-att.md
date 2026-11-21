# ukrbublik/opus-mt-pt-uk-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-pt-uk-int8-shift-att` es una conversión a formato ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-pt-uk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (proyecto OPUS-MT). Está pensado para traducción directa portugués→ucraniano sin pivotar a través del inglés, y su destino declarado es el runtime OPUS en el dispositivo de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder especializado en traducción, exportado con Optimum a ONNX (opset 17, sin past key/values) y cuantizado dinámicamente a INT8 (QInt8, per-tensor) con onnxruntime. Incluye una salida adicional, `alignment_shift_l2`, que expone las probabilidades de atención encoder del decodificador en la capa 2, útil para alinear tokens entre origen y destino en tareas de subtitulado.

Los pesos originales son del proyecto OPUS-MT y se distribuyen bajo licencia Apache 2.0; este repositorio solo cambia el formato de ficheros (exportación ONNX y cuantización INT8). Es relevante para quienes necesiten traducción pt→uk ligera y ejecutable en CPU/dispositivo sin dependencias pesadas de framework.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | portugués (pt) → ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura de traducción neuronal del proyecto OPUS-MT, entrenada sobre datos paralelos de OPUS. El repositorio no aporta detalles del entrenamiento (número de tokens, composición del corpus, técnicas de alineación o fine-tuning) más allá de la cita a Tiedemann y Thottingal (2020). No se documenta uso de RLHF ni DPO.

La innovación de esta conversión es operativa: exportación con Optimum a ONNX (opset 17, sin past key/values, por lo que la decodificación no reutiliza caché de atención), cuantización dinámica INT8 con onnxruntime y la adición de una salida `alignment_shift_l2` que replica (mediante una Identity) las probabilidades de atención encoder de la capa 2 del decodificador. Los pesos y el proceso de decodificación no se alteran. Se incluye además `alignment.json`, que vincula la salida de alineación con el SHA-256 del decodificador.

## Capacidades

- Traducción automática directa portugués→ucraniano, sin pivotar por inglés.
- Salida de alineación de atención (`alignment_shift_l2`) para mapear tokens origen-destino, útil en subtitulado y sincronización.
- Tokenizer SentencePiece empaquetado en `tokenizer_runtime.json` (piezas, scores y mapeo a ids de vocabulario).
- Ejecución en ONNX Runtime, orientada a inferencia en dispositivo (CPU) con pesos INT8.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No incluye capacidades de visión, audio ni modo thinking.
- Multilingüe limitado al par pt→uk (no es un modelo multilingüe general).

## Casos de uso

- Subtitulado automático pt→uk en Android: el modelo está diseñado para el runtime OPUS de Subtitle Tap, con pesos INT8 y ONNX que permiten ejecución on-device y la salida de alineación para sincronizar subtítulos con el audio.
- Traducción de documentación técnica de portugués a ucraniano en pipelines ligeros: al ser ONNX INT8, se puede servir con onnxruntime en CPU sin GPU, adecuado para volúmenes moderados.
- Localización de interfaces y textos cortos: frases y cadenas de UI de aplicaciones, donde el tamaño reducido (repo de 0,1 GB) facilita el despliegue en contenedores pequeños.
- Preprocesado multilingüe en investigación: la salida de alineación de atención permite estudiar correspondencias léxicas pt-uk sin necesidad de herramientas de alineación externas.
- Traducción de contenido periodístico o editorial pt→uk en herramientas de escritorio: integrable como paso previo a revisión humana, dado el bajo coste computacional.
- Prototipado de sistemas de traducción embebidos: sirve como referencia para exportar y cuantizar otros modelos OPUS-MT con el mismo flujo (Optimum + onnxruntime INT8).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo está pensado para CPU. El repo ocupa 0,1 GB, por lo que la huella en memoria es del orden de cientos de MB en INT8.
- GPU recomendadas: no disponibles; no se documenta uso de GPU. Cualquier GPU compatible con onnxruntime (p. ej. CUDA) podría ejecutarlo, pero no hay cifras publicadas.
- Cabe en GPU consumer: sí, por tamaño, aunque no es su objetivo; el diseño apunta a ejecución en dispositivo Android.
- Opciones de despliegue: ONNX Runtime (principal), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-pt-uk-int8-shift-att | no disponible | no disponible | pt→uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-pt-uk | no disponible | no disponible | pt→uk | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-mul-en (pivot) | no disponible | no disponible | multilingüe→en | Apache 2.0 | safetensors/PyTorch |
| Modelos NLLB-200 destilados | ~600M (distilled) | 512 tokens | multilingüe | CC-BY-NC (no comercial) | safetensors/PyTorch |

La comparación con NLLB se ofrece como referencia de categoría; los datos de parámetros y contexto de los modelos OPUS-MT no están disponibles en la información proporcionada. La ventaja diferencial de esta conversión es el formato ONNX INT8 y la salida de alineación, no una mejora de calidad de traducción.

## Limitaciones y advertencias

- Calidad de traducción heredada del modelo base OPUS-MT; no se han publicado evaluaciones específicas de esta conversión.
- La cuantización INT8 puede introducir una ligera degradación respecto al modelo en precisión completa; no se documenta su magnitud.
- La decodificación sin past key/values implica recalcular el contexto en cada paso, lo que puede aumentar la latencia frente a exportaciones con caché.
- Sesgos: no documentados; al entrenarse con corpus OPUS, puede reflejar sesgos de los datos paralelos.
- Riesgo de alucinación y errores en frases largas o dominios especializados (técnico, legal, médico) sin validación humana.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a OPUS-MT y citar el trabajo original.
- El par de idiomas está restringido a pt→uk; no sirve para otras direcciones ni como modelo multilingüe.
- La salida `alignment_shift_l2` es una Identity de un nodo existente: su utilidad depende de que el consumidor interprete correctamente las probabilidades de atención.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-pt-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-pt-uk
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61/
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- ONNX Runtime: https://github.com/microsoft/onnxruntime
