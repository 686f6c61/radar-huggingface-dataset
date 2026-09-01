# YuanXiaopang/latentmas-aligner-qwen3-14b

## Resumen

LatentMAS Attention Aligner para Qwen3-14B es un monitor de seguridad diseñado para pipelines de razonamiento multi-agente en espacio latente. Lo desarrolla YuanXiaopang como parte del ecosistema LatentMAS, un framework que permite a los agentes comunicarse mediante estados latentes en lugar de texto, lo que hace que los guardarraíles basados en texto no puedan leer el razonamiento intermedio. Este aligner lee directamente los estados latentes previos al módulo Judger y emite una probabilidad `p_unsafe` que indica si el sistema ha cumplido con una petición dañina.

La arquitectura combina un pequeño cabezal entrenable (37,8 millones de parámetros) con la cola congelada de Llama-Guard-3-8B, que actúa como frontera de decisión de seguridad preentrenada. El cabezal traduce el espacio latente de Qwen3-14B al espacio residual de Llama-Guard, permitiendo que un clasificador ya entrenado pueda leer estados latentes sin necesidad de texto. Está entrenado sobre 311 357 registros de rollouts LatentMAS en topología secuencial, con una tasa de positivos del 11,9 %.

La relevancia actual reside en que los modelos más grandes tienden a cumplir con peticiones dañinas con mayor frecuencia (el 14B cumple casi el doble que el 4B), lo que hace necesario un mecanismo de supervisión específico para razonamiento latente. El aligner logra un AUC de validación de 0,9505 y ofrece umbrales calibrados para distintos niveles de falsos positivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention pooling sobre 24 posiciones latentes + MLP de 2 capas (5120→4096→4096) + cola congelada de Llama-Guard-3-8B (bloques 17-31, norm final y lm_head) |
| Parametros totales | 37,8 M entrenables (145 MB en fp32) más la cola congelada de Llama-Guard-3-8B (~7 GB, no incluida en el archivo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (procesa 24 posiciones latentes fijas: 3 agentes × 8 pasos; no texto) |
| Tipos de cuantizacion | No disponible (state dict en fp32) |
| Idiomas soportados | No disponible (depende del modelo base Qwen3-14B, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | State dict PyTorch (safetensors, segun convencion de HuggingFace) |

## Arquitectura y entrenamiento

El aligner es un cabezal de atencion que procesa una matriz `h_a` de dimensiones [24, 5120], donde 24 corresponde a las posiciones latentes apiladas de los tres agentes (Planner, Critic, Refiner) y 5120 es la dimension oculta de Qwen3-14B. Un query aprendido realiza un pooling por atencion sobre esas 24 posiciones, generando un vector ponderado que luego pasa por un MLP de dos capas con GELU (5120→4096→4096). El resultado `w_h` es un punto en el espacio residual de Llama-Guard-3-8B, que alimenta la cola congelada de ese modelo (bloques 17 a 31, norm final y lm_head) para producir logits sobre los tokens "safe" y "unsafe", de donde se obtiene `p_unsafe`.

Solo se entrenan el query de pooling y el MLP, lo que supone 37,8 millones de parametros. La cola de Llama-Guard permanece congelada y se reconstruye en tiempo de carga desde `meta-llama/Llama-Guard-3-8B` (~7 GB), no se distribuye en el repositorio. El entrenamiento uso el dataset `asatheesh/latent-mas-safety-dataset-seq-qwen3-14b` con 311 357 registros (36 989 positivos, 11,9 %), etiquetados segun harm-compliance: `prompt_harmful AND response_harmful` a partir de anotaciones WildGuard. Se descarto un shard corrupto de 256 registros (0,08 %). Los hiperparametros son identicos a los del checkpoint de 4B: `--pool attention --hidden-dim 4096 --use-remaining-layers --class-weights 1.0,10.0 --lam 1.0 --lr 3e-4 --epochs 60 --batch-size 512`.

La innovacion clave es que el cabezal no aprende a clasificar contenido dañino desde cero, sino que aprende a traducir el espacio latente del modelo auditado al espacio residual de Llama-Guard, de modo que una frontera de decision ya entrenada pueda operar sobre latentes. Ademas, al usar un unico query de atencion sobre todas las posiciones, el cabezal es agnostico al numero de agentes.

## Capacidades

- Clasificacion de seguridad sobre estados latentes: detecta si un pipeline LatentMAS ha cumplido con una peticion dañina sin necesidad de leer texto intermedio.
- Emision de probabilidad escalar `p_unsafe` en el rango [0, 1].
- Integracion con el pipeline LatentMASHarmBench: en despliegue, si `p_unsafe > τ` se inyecta un aviso fijo `[SAFETY NOTICE]` en el contexto del Judger, que produce un rechazo natural.
- Agnostico al numero de agentes gracias al pooling por atencion con query unico.
- Umbrales calibrados para distintos niveles de falsos positivos (fpr05, fpr10, fpr20), con el fpr10 recomendado para produccion.
- No requiere acceso al texto de razonamiento de los agentes, lo que preserva la eficiencia del razonamiento latente.

## Casos de uso

- Guardarrail en sistemas multi-agente con razonamiento latente: el aligner se coloca como monitor entre el Refiner y el Judger, clasificando los estados latentes antes de que el Judger genere la respuesta final. Es adecuado porque los agentes no producen texto intermedio y un filtro textual no tendria nada que leer.
- Moderacion de contenido en pipelines de agentes que usan LatentMAS: al detectar que el sistema ha cumplido con una peticion dañina, se puede forzar un rechazo o redirigir la conversacion, reduciendo el riesgo de que el modelo genere contenido nocivo.
- Evaluacion de seguridad comparativa entre modelos: dado que el aligner reporta una tasa de positivos del 11,9 % para Qwen3-14B frente al 6,3 % del 4B, puede usarse para medir cuantitativamente la tendencia de distintos backbones a cumplir con peticiones dañinas en arquitecturas latentes.
- Investigacion en alineacion de seguridad para razonamiento latente: permite estudiar como se distribuyen las representaciones internas de seguridad en modelos grandes y si la frontera de Llama-Guard es transferible a espacios latentes.
- Despliegue en produccion con control de falsos positivos: usando el umbral fpr10 (τ=0,7915), se logra una recall de daño de 0,8420 con una tasa de sobre-rechazo de solo 0,0152 sobre prompts benignos, adecuado para entornos donde el sobre-bloqueo es costoso.
- Auditoria de compliance en sistemas de agentes: el aligner puede integrarse en pipelines de CI/CD para verificar que los cambios en el modelo base o en la topologia LatentMAS no aumenten la tasa de cumplimiento dañino, usando el AUC y los umbrales calibrados como metricas de regresion.

## Benchmarks y rendimiento

Los resultados publicados se centran en separabilidad y calibracion de umbrales. No hay benchmarks comparativos con otros guardarraíles en la informacion disponible.

| Metrica | Valor |
|---|---|
| AUC de validacion (epoch 59, final) | 0,9505 |
| AUC pico | 0,9516 |
| AUC del checkpoint de 4B (referencia) | 0,9541 |
| Tasa de positivos en entrenamiento | 11,9 % (Qwen3-14B) vs 6,3 % (Qwen3-4B) |

Evolucion del entrenamiento (epoch seleccionadas):

| epoch | 00 | 10 | 20 | 30 | 40 | 50 | 59 |
|---|---|---|---|---|---|---|---|
| train loss | 0,9655 | 0,5776 | 0,5558 | 0,5323 | 0,5183 | 0,4902 | 0,4745 |
| val AUC | 0,9235 | 0,9461 | 0,9493 | 0,9494 | 0,9502 | 0,9456 | 0,9505 |

Umbrales calibrados sobre la particion de validacion congelada (30 072 registros):

| Objetivo | τ | harm (recall) | overref (tasa de sobre-rechazo) |
|---|---|---|---|
| fpr05 | 0,9048 | 0,6755 | 0,0000 |
| fpr10 (recomendado) | 0,7915 | 0,8420 | 0,0152 |
| fpr20 | 0,3812 | 0,9614 | 0,0488 |

Nota: el checkpoint guardado corresponde a la ultima epoch (59), no a la mejor, por lo que el AUC final esta 0,001 por debajo del pico. El τ no es portable entre checkpoints de distinto tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: el cabezal entrenable ocupa 145 MB en fp32, pero la cola congelada de Llama-Guard-3-8B requiere ~7 GB adicionales. Total orientativo: 8-10 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, por ejemplo RTX 3080, RTX 4090, A10, L4. Para despliegues de mayor concurrencia, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas, aunque el requisito principal es el tail de Llama-Guard, no el cabezal.
- Opciones de despliegue: el repositorio proporciona scripts de Python con PyTorch (`extract_cli` para reconstruir el bundle, y el pipeline LatentMASHarmBench). No hay integraciones documentadas con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada. Dado el tamano del cabezal, la latencia estara dominada por el paso por la cola de Llama-Guard.

## Comparativa con modelos similares

| Modelo | Parametros entrenables | Backbone | AUC val | Tasa positivos | Topologia | Licencia |
|---|---|---|---|---|---|---|
| latentmas-aligner-qwen3-14b (este) | 37,8 M | Qwen3-14B | 0,9505 | 11,9 % | Secuencial | Apache-2.0 |
| latentmas-aligner-qwen3-4b-instruct | 37,8 M | Qwen3-4B-Instruct | 0,9541 | 6,3 % | Secuencial, jerarquica y mixta | Apache-2.0 |

No hay otros guardarraíles comparables publicados que operen directamente sobre estados latentes. Los guardarraíles textuales como Llama-Guard-3 requieren texto visible, por lo que no son directamente comparables en este contexto. La diferencia clave entre los dos aligners es la dimension oculta del backbone (5120 en 14B frente a 2560 en 4B), lo que hace que los cabezales no sean intercambiables.

## Limitaciones y advertencias

- Solo entrenado en topologia secuencial (Planner → Critic → Refiner → Judger). No se ha evaluado en topologias con fan-out amplio, arboles o mas de 4 agentes.
- El cabezal esta atado a la geometria latente de Qwen3-14B; no transfiere a otros backbones.
- El umbral τ no es portable entre checkpoints de distinto tamano ni entre distribuciones de datos. Debe recalibrarse para cada despliegue.
- Se descarto un shard de datos corrupto (0,08 % de los registros), lo que puede introducir un sesgo minimo no cuantificado.
- La tasa de positivos del 11,9 % indica que Qwen3-14B cumple con peticiones dañinas casi el doble de veces que el 4B, lo que hace que la tarea de clasificacion sea mas dificil y que el modelo pueda tener mas falsos negativos en casos limite.
- La cola de Llama-Guard-3-8B no se distribuye en el repositorio; el usuario debe reconstruirla localmente (~7 GB) usando el script proporcionado.
- No hay informacion sobre sesgos demograficos, alucinaciones o comportamiento fuera del dominio de seguridad.
- La etiqueta harm-compliance excluye los rechazos correctos: un prompt dañino rechazado se considera negativo, lo que puede infravalorar la peligrosidad del modelo base en algunos escenarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-14b
- Contraparte de 4B: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/asatheesh/latent-mas-safety-dataset-seq-qwen3-14b
- Repositorio LatentMASHarmBench: https://github.com/Asatheesh6561/LatentMASHarmBench
- Framework LatentMAS (ICML 2026 Spotlight): https://github.com/Gen-Verse/LatentMAS
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
