# xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicada por el usuario xtools-at. El modelo original es un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", entrenado sobre una mezcla de aproximadamente 250.000 muestras de matematicas y STEM. Esta version aplica la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo mediante una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El resultado es un modelo de 4.539.265.536 parametros (4B efectivos) que conserva la estructura de razonamiento del original pero reduce drasticamente las negativas a responder: segun la model card, pasa de 99/100 rechazos en el modelo original a 5/100 en esta version, con una divergencia KL de 0,0378 respecto al original. Es relevante para quienes necesitan un modelo pequeno de razonamiento matematico sin filtros de seguridad integrados, aunque con las advertencias evidentes que ello conlleva.

La licencia es Apache 2.0 y los idiomas declarados son ingles y chino. El repositorio ocupa 9,1 GB e incluye pesos en safetensors, ademas de estar etiquetado para GGUF y text-generation-inference. El modelo base declarado es unsloth/Qwen3.5-4B, y la arquitectura subyacente es la de la familia Qwen3.5 (tag `qwen3_5`), con soporte declarado para image-text-to-text en los tags del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors; se etiqueta GGUF pero no se detallan variantes) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB); etiquetado tambien como gguf |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-4B, un transformer denso de 4B parametros, y se entrena mediante destilacion de las respuestas de DeepSeek-V4-Pro en modo "Max Effect". El pipeline de entrenamiento sigue el mismo esquema que la release de 9B del mismo autor, con una mezcla de aproximadamente 250.000 muestras centradas en razonamiento matematico y cientifico (STEM). La model card menciona tambien SFT y evaluacion con MTP-Q8, aunque no se detalla la composicion exacta del dataset ni el numero total de tokens de entrenamiento.

La innovacion principal de esta variante concreta es la aplicacion de Heretic v2.0.0, que realiza una ablacion de rangos arbitrarios (ARA) sobre las capas 16 a 32 del modelo. Los hiperparametros declarados son: `start_layer_index` 16, `end_layer_index` 32, `preserve_good_behavior_weight` 0,9854, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,6587 y `neighbor_count` 10. Esta intervencion reduce los rechazos de 99/100 a 5/100 manteniendo una divergencia KL de 0,0378 respecto al modelo original, lo que segun el autor indica que se preserva gran parte del comportamiento original.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en descomposicion explicita de problemas.
- Razonamiento matematico y cientifico (STEM) reforzado por la destilacion de DeepSeek-V4-Pro.
- Generacion de codigo y resolucion de problemas tecnicos, heredada del modelo base Qwen3.5-4B.
- Soporte declarado de image-text-to-text en los tags del repositorio (no confirmado en la model card).
- Etiquetado para text-generation-inference, lo que sugiere compatibilidad con endpoints de inferencia estandar.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Comportamiento "uncensored": responde a practicamente cualquier peticion (5/100 rechazos), incluidas aquellas que el modelo original rechazaria.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio controlado para medir el efecto de la ablacion ARA sobre el comportamiento de rechazo, comparando directamente con el modelo original (99/100 frente a 5/100 rechazos).
- Evaluacion de robustez de filtros: util para probar sistemas de moderacion externos, ya que el propio modelo no incorpora negativas y permite verificar si las capas de seguridad del pipeline detectan contenido problematico.
- Razonamiento matematico en entornos educativos controlados: con 250.000 muestras de matematicas y STEM, es adecuado para generar soluciones paso a paso en tutores automaticos, siempre con supervision humana.
- Generacion de datos sinteticos de razonamiento: al estar destilado de un teacher fuerte, puede producir cadenas de razonamiento para aumentar datasets de entrenamiento en dominios cientificos.
- Prototipado rapido en local: con 4B parametros y licencia Apache 2.0, cabe en GPUs de consumo y permite experimentar con razonamiento sin coste de API.
- Fine-tuning posterior: al ser un modelo pequeno y permisivo, sirve como base para ajustes especificos donde se quiera evitar que el modelo rechace peticiones legitimas de dominio (por ejemplo, analisis de textos sensibles en investigacion).
- Procesamiento de documentacion tecnica en ingles y chino: resumen y extraccion de informacion en esos dos idiomas.

## Benchmarks y rendimiento

La model card solo reporta metricas del proceso de decensoring, no benchmarks estandar de capacidad:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definicion) |

La model card menciona que se evaluo en "complete GSM8K runs" y en muestras fijas de MMLU-Pro Math, Physics y Chemistry, pero no se publican los resultados numericos de esas evaluaciones en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 9 GB para los pesos (4,54B parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 sin problema; en RTX 3090/4080 (16-24 GB) tambien; en GPUs de 8 GB requeriria cuantizacion a 4 bits.
- GPU de datacenter: A100, H100 y L40S lo ejecutan con holgura y permiten lotes grandes.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiquetado), llama.cpp/Ollama mediante GGUF (etiquetado, aunque no se detallan las variantes publicadas) y vLLM como alternativa compatible con la arquitectura Qwen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic) | 4,54B | no disponible | Apache 2.0 | Destilado de DeepSeek-V4-Pro, decensored con Heretic |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4B (aproximado) | no disponible | Apache 2.0 (heredada) | Modelo original, 99/100 rechazos |
| Qwen3.5-4B (unsloth) | 4B | no disponible | Apache 2.0 | Modelo base sin destilacion de razonamiento |
| Release de 9B del mismo autor | 9B (aproximado) | no disponible | no disponible | Misma receta de destilacion, mayor tamano |

No se dispone de datos de benchmarks comparativos de capacidad (MMLU, HumanEval, GSM8K) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo ha sido sometido a una ablacion deliberada para eliminar los rechazos: no incorpora salvaguardas y puede generar contenido danino, ilegal o eticamente problematico. No es apto para despliegue directo al publico sin capas de moderacion externas.
- La divergencia KL de 0,0378 respecto al original implica que, aunque se preserva gran parte del comportamiento, hay degradacion potencial en tareas fuera del dominio de entrenamiento.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar casos de uso con documentos largos.
- No se publican resultados de benchmarks de capacidad, por lo que las afirmaciones sobre razonamiento matematico y STEM se basan en la composicion del dataset de entrenamiento, no en mediciones verificables.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion independiente.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensored conlleva riesgos legales y reputacionales segun la jurisdiccion y el contexto de aplicacion.
- El pipeline declarado es text-generation, pero los tags incluyen image-text-to-text; no esta claro si las capacidades multimodales estan realmente presentes o son herencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Heretic project: https://heretic-project.org
