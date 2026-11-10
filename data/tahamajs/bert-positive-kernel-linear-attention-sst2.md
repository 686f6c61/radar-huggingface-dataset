# tahamajs/bert-positive-kernel-linear-attention-sst2

## Resumen

`tahamajs/bert-positive-kernel-linear-attention-sst2` es un checkpoint de tipo experimental publicado por Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps. Consiste en una variante de `bert-base-uncased` en la que los bloques de atencion softmax cuadratica de las 12 capas del transformer se han sustituido por un mecanismo de atencion lineal basado en kernel positivo (`positive_kernel_linear_attention`), con complejidad efectiva O(N) u O(N log N) frente a la O(N^2) de la atencion multi-cabeza estandar. El objetivo declarado es explorar alternativas subcuadraticas a la atencion clasica y validar un protocolo de destilacion de representaciones en cache ("NeuralOps Cached Representation Distillation Protocol") que evita reservar VRAM para el modelo profesor.

El modelo se ha ajustado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) y se distribuye como pesos modulares de solo atencion mas cabeza de clasificacion, en FP16, con un tamano de descarga de aproximadamente 55 MB. Los pesos base congelados de BERT se reconstruyen en tiempo de carga desde `bert-base-uncased` mediante un shim de codigo remoto (`trust_remote_code=True`).

Es relevante ahora como pieza de investigacion reproducible sobre atencion subcuadratica y destilacion eficiente en memoria, no como modelo listo para produccion: la precision reportada en SST-2 es del 49,20%, muy por debajo del profesor BERT-base (91,63%) y apenas por encima del azar en una tarea binaria. El autor etiqueta explicitamente el resultado como "subquadratic probe".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion lineal por kernel positivo (`positive_kernel_linear_attention`) en las 12 capas |
| Parametros totales | 110 M (heredados de `bert-base-uncased`); los pesos entrenados publicados son solo de atencion y cabeza de clasificacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base soporta hasta 512 tokens, no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible; pesos publicados en FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) con codigo remoto `modeling_neuralops_bert.py` |
| Libreria | `neuralops` (compatible con `transformers` via `trust_remote_code=True`) |
| Tarea | Clasificacion de texto (SST-2, sentimiento binario) |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluacion | GLUE / SST-2 (split de validacion, 872 muestras) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 24 GB (Sharif HPC Cluster) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M parametros) y reemplaza la atencion softmax cuadratica por `positive_kernel_linear_attention`, un mecanismo de atencion lineal que aproxima la softmax mediante un kernel positivo y reduce la complejidad operativa efectiva a O(N) u O(N log N). Los pesos base de BERT permanecen congelados; solo se entrenan los parametros de atencion y la cabeza de clasificacion, que se serializan por separado en `attention_weights.safetensors` en FP16.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilacion en dos etapas: primero alineamiento de subespacio de estados ocultos y despues KL sobre logits combinado con entropia cruzada de la tarea. Las representaciones del profesor se cachean offline, de modo que el profesor no ocupa VRAM durante el ajuste. La ejecucion completa duro 53,0 s en una RTX 3090, con 169 pasos de optimizacion, un throughput efectivo de 26.134,4 tokens/s y un pico de VRAM de 10.779 MB.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (SST-2): salida de dos logits (negativo/positivo).
- Atencion subcuadratica: el mecanismo `positive_kernel_linear_attention` escala mejor que la atencion cuadratica en secuencias largas, aunque el modelo no ha sido validado en longitudes superiores a las de SST-2.
- Carga modular: reconstruye el modelo completo aplicando los pesos de atencion destilados sobre el BERT base congelado.
- Integracion con `transformers` mediante `trust_remote_code=True` y con la API `neuralops.hub.bert_zoo`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificacion.

## Casos de uso

- Investigacion en atencion subcuadratica: sirve como referencia reproducible para comparar mecanismos de atencion lineal frente a softmax en una tarea controlada (SST-2) con un protocolo de destilacion documentado.
- Experimentos de destilacion eficiente en memoria: el protocolo de cache offline permite reproducir el ajuste en una unica GPU consumer de 24 GB sin instanciar el profesor en VRAM.
- Pruebas de integracion de la libreria NeuralOps: valida el flujo `load_pretrained_bert(attention_type=..., task=..., hf_org=...)` en pipelines propios.
- Benchmark de serializacion modular de pesos: util para evaluar el esquema de checkpoints de solo atencion (~55 MB) frente a re-subir el modelo completo (~450 MB).
- Docencia y formacion: ejemplo minimo de sustitucion de atencion y destilacion en dos etapas sobre un transformer conocido.
- Base para ablaciones: punto de partida para repetir el experimento con otras variantes de atencion del "Attention Zoo" o con mas pasos de entrenamiento.
- No es adecuado para analisis de sentimiento en produccion dado su 49,20% de precision en SST-2.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Precision SST-2 | 91,63% | 51,03% | 49,20% | -1,83% |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7050 | no disponible |

Telemetria de entrenamiento: 53,0 s, 169 pasos, 26.134,4 tokens/s, pico de VRAM 10.779 MB en RTX 3090.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint publicado ocupa ~55 MB, pero la carga completa requiere instanciar `bert-base-uncased` (~110 M parametros, ~450 MB en FP32, ~220 MB en FP16). En la practica, menos de 2 GB de VRAM para inferencia en FP16 con batches pequenos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entreno en una RTX 3090 de 24 GB con un pico de 10,8 GB durante la destilacion.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere la libreria `neuralops`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones de inferencia; solo se reporta throughput de entrenamiento (26.134,4 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-positive-kernel-linear-attention-sst2` | 110 M (solo atencion publicada) | no disponible | 49,20% | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face |
| Variantes lineales tipo Performer/Linformer sobre BERT | ~110 M | variable | no disponible | variable | variable |

No se dispone de datos publicados de otros modelos de atencion subcuadratica comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Precision muy baja: 49,20% en SST-2, practicamente equivalente a la clase mayoritaria en una tarea binaria; no es util para clasificacion real.
- El propio autor etiqueta el resultado como "subquadratic probe" y el estudiante pre-KD ya rendia por debajo del azar (51,03%).
- Requiere `trust_remote_code=True` y la libreria `neuralops`: introduce dependencia de codigo de terceros en el pipeline de carga.
- Solo ingles; sin capacidades multilingues.
- No es un modelo generativo ni soporta tool calling, agentes o razonamiento multi-paso.
- Riesgo de alucinacion no aplicable en sentido estricto (clasificacion), pero la calibracion es deficiente: entropia cruzada de 0,7050 frente a 0,2428 del profesor.
- Licencia MIT permite uso comercial, pero el estado experimental del checkpoint desaconseja cualquier despliegue en produccion.
- No se documentan sesgos especificos; al derivar de `bert-base-uncased` y SST-2, hereda los sesgos del corpus de resenas de cine en ingles.
- No hay informacion sobre comportamiento con secuencias largas pese a la motivacion subcuadratica del mecanismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-positive-kernel-linear-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
