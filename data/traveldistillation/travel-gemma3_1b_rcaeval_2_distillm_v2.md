# TravelDistillation/Travel-gemma3_1b_RCAEval_2_distillm_v2

## Resumen

Travel-gemma3_1b_RCAEval_2_distillm_v2 es un adaptador LoRA publicado por el usuario TravelDistillation sobre el modelo base google/gemma-3-1b-it. Se trata de un ajuste fino orientado a la destilacion de preferencias: el nombre del dataset de entrenamiento (preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it) indica que se han construido pares de preferencia donde las respuestas del modelo grande (Gemma 3 4B IT) actuan como referencia frente a las del modelo pequeno (Gemma 3 1B IT), y el adaptador se entrena con DPO para acercar el comportamiento del 1B al del 4B en un dominio concreto de evaluacion (RCAEval_2).

El interes practico reside en la posibilidad de obtener un modelo de 1B parametros con un comportamiento alineado a un modelo cuatro veces mayor en una tarea especifica, manteniendo el coste de inferencia y el footprint de memoria de un modelo pequeno. Al ser un adaptador PEFT, los pesos se cargan sobre el base Gemma 3 1B IT, lo que permite reutilizar toda la infraestructura de despliegue de Gemma 3 (transformers, TGI, vLLM) sin necesidad de servir un checkpoint completo adicional.

La informacion publicada es muy escasa: la model card es autogenerada por el Trainer, no incluye descripcion, casos de uso previstos, datos de evaluacion ni resultados de benchmarks (el model-index esta vacio). El repositorio ocupa 2,2 GB, coherente con un adaptador LoRA en safetensors sobre un base de 1B, aunque el tamano tambien podria incluir artefactos de entrenamiento. La licencia es la Gemma License, con las restricciones de uso comercial que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), adaptador LoRA sobre google/gemma-3-1b-it |
| Parametros totales | No disponible (modelo base Gemma 3 1B; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Gemma 3 1B IT, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base y del runtime) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base google/gemma-3-1b-it |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT 0.21.2) sobre el transformer decoder-only Gemma 3 1B IT. El entrenamiento se realizo con TRL y Transformers 5.19.0 sobre PyTorch 2.13.0+cu132, con un unico epoch, learning rate 5e-5, scheduler coseno con warmup del 10% de los pasos, batch efectivo de 8 (batch 1 x acumulacion 8), optimizador AdamW con betas (0,9; 0,999) y semilla 42. La tag `dpo` y el nombre del dataset confirman que el objetivo de entrenamiento es Direct Preference Optimization sobre pares de preferencia generados por destilacion desde Gemma 3 4B IT hacia Gemma 3 1B IT.

El dataset `preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it` no esta documentado publicamente en la informacion disponible: se desconoce el numero de pares, la composicion tematica (el sufijo RCAEval_2 sugiere un conjunto de evaluacion de razonamiento causal o analisis de causa raiz, pero no se confirma) y el proceso de filtrado. No se han publicado curvas de entrenamiento, resultados de evaluacion ni detalles sobre el regimen de congelacion de capas o el rango del adaptador.

## Capacidades

- Generacion de texto conversacional, heredada del base Gemma 3 1B IT y modulada por el adaptador DPO.
- Alineacion de estilo y preferencias hacia el comportamiento de Gemma 3 4B IT en el dominio del dataset de destilacion (RCAEval_2), segun el diseno del entrenamiento.
- Soporte de conversacion multi-turno en el formato de chat de Gemma 3 IT.
- Capacidades multilingues: no documentadas para este adaptador; dependen del base y no se han verificado.
- Tool calling / function calling: no documentado para este adaptador.
- Razonamiento multi-paso y uso como agente: no documentado ni evaluado.
- Capacidades especiales (thinking mode, vision, audio): no documentadas para este adaptador; el base es un modelo de texto.

## Casos de uso

- Destilacion de comportamiento en dominios acotados: servir el adaptador sobre Gemma 3 1B IT para replicar respuestas de Gemma 3 4B IT en la tarea RCAEval_2 con un coste de inferencia cuatro veces menor en parametros, util cuando el dominio esta bien delimitado y el presupuesto de GPU es limitado.
- Evaluacion comparativa de tecnicas DPO: usar este checkpoint como referencia en experimentos que midan cuanto se acerca un 1B ajustado con DPO a un 4B en pares de preferencia, replicando el pipeline con TRL y PEFT documentado en la model card.
- Prototipado rapido en entornos de investigacion: cargar el adaptador con `PeftModel.from_pretrained` sobre el base para iterar sobre prompts y formatos de chat sin necesidad de entrenar desde cero.
- Clasificacion y analisis de causa raiz (si el dominio RCAEval_2 corresponde a ello): emplear el modelo como generador de hipotesis o resumenes en pipelines de diagnostico, verificando siempre las salidas con herramientas deterministas.
- Despliegue en hardware de gama baja: al ser un adaptador sobre un base de 1B, puede servirse en GPUs consumer con cuantizacion del base (por ejemplo, 4 bits) mediante llama.cpp o vLLM con soporte LoRA, aunque el rendimiento real no esta medido.
- Fine-tuning incremental: partir de este adaptador como inicializacion para nuevas rondas de DPO sobre dominios relacionados, aprovechando que el formato PEFT permite apilar o reemplazar adaptadores sin tocar el base.

## Benchmarks y rendimiento

El model-index publicado por el autor esta vacio (`results: []`). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia estructural, un base de 1B en fp16 requiere aproximadamente 2 GB de pesos; en 8 bits alrededor de 1 GB y en 4 bits alrededor de 0,5-0,7 GB, a lo que se suma el adaptador LoRA (tamano exacto no publicado) y la memoria de activaciones y KV cache.
- GPUs recomendadas: no especificadas por el autor. Por tamano, el base 1B es apto para GPUs consumer (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) y para GPUs de datacenter (A100, H100) si se prioriza throughput.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del base, aunque no hay mediciones publicadas para este adaptador concreto.
- Opciones de despliegue: transformers + PEFT (ruta documentada por las librerias del entrenamiento), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM y llama.cpp requeririan conversion o soporte de adaptadores LoRA, no verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_distillm_v2 | Base 1B + adaptador LoRA | No disponible | Gemma | safetensors (PEFT) | DPO sobre pares de preferencia destilados desde Gemma 3 4B IT; sin benchmarks publicados |
| google/gemma-3-1b-it | 1B | No disponible en esta ficha | Gemma | safetensors | Modelo base sin ajuste DPO; referencia directa del adaptador |
| google/gemma-3-4b-it | 4B | No disponible en esta ficha | Gemma | safetensors | Modelo profesor del proceso de destilacion; mayor coste de inferencia |
| Alternativas DPO de 1B-2B (p. ej. variantes Qwen o Llama ajustadas) | 1B-2B | Variable | Variable | safetensors / GGUF | No se dispone de comparacion cuantitativa con este adaptador en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de evaluacion: el model-index esta vacio y la model card es autogenerada; no hay evidencia publicada de que el adaptador mejore al base en ninguna metrica.
- Dominio muy acotado: el entrenamiento se limita a un dataset de pares de preferencia (RCAEval_2) no documentado; el comportamiento fuera de ese dominio puede degradarse respecto al base.
- Riesgo de alucinacion: inherente a los modelos generativos de 1B; el ajuste DPO no elimina este riesgo y puede reforzar estilos de respuesta no verificados.
- Sesgos: no evaluados; se heredan los del base Gemma 3 1B IT y los del dataset de preferencias, cuya composicion se desconoce.
- Idiomas: no documentados; no hay garantia de calidad multilingue mas alla de la del base.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar en produccion.
- Reproducibilidad: se documentan hiperparametros y versiones de librerias, pero no el dataset ni el script, lo que dificulta reproducir el entrenamiento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- Al ser un adaptador, requiere descargar y servir el base google/gemma-3-1b-it, con su propio coste de almacenamiento y sus propias restricciones de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_distillm_v2
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Modelo profesor (referencia del dataset): https://huggingface.co/google/gemma-3-4b-it
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL (DPO): https://github.com/huggingface/trl
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
