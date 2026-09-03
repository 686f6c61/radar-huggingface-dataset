# violetxi/qwen35-9b-wmrl-v4-m1-27b-judged

## Resumen

Este modelo es un checkpoint de la linea de investigacion "wm-internalization" (internalizacion de modelo del mundo) en su version v4, desarrollado por violetxi. Se trata de un full-finetune de Qwen/Qwen3.5-9B sobre el corpus sintetico de despachos de abogados Calderwood & Harkness, con la condicion de entrenamiento denominada "m1-27b-judged". El objetivo del estudio es investigar como un modelo de 9B parametros internaliza la estructura de un dominio cerrado a partir de datos sinteticos, utilizando un pool semilla de aproximadamente 50.000 ejemplos "think-on".

El modelo conserva la arquitectura Qwen3_5ForConditionalGeneration del modelo base, con 9.653.104.368 parametros (~9,65B), y se ha "injertado" (graft) de vuelta al layout composite del hub, reemplazando 427 tensores con los pesos entrenados. Esto permite servirlo directamente con vLLM sin transformaciones adicionales. La licencia es Apache 2.0. Es un checkpoint de investigacion reciente (septiembre de 2026) con cero descargas, orientado al estudio academico mas que al uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262K-1M (heredado de Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3.5-9B es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso multimodal de 9B parametros que, segun los datos publicados, supera a Qwen3-30B en la mayoria de benchmarks y a GPT-5-Nano en tareas de vision. El fine-tune es completo (full-finetune) sobre el corpus sintetico Calderwood & Harkness, un dataset de despachos de abogados generado sinteticamente, con un pool semilla de aproximadamente 50.000 ejemplos "think-on". La condicion "m1-27b-judged" sugiere que el entrenamiento incorpora evaluaciones de un modelo juez de 27B, aunque no se detalla el mecanismo exacto.

El proceso de "graft" reemplazo 427 tensores del modelo base con los pesos entrenados, manteniendo el layout composite del hub (Qwen3_5ForConditionalGeneration), lo que permite cargarlo con vLLM directamente. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento, heredadas del modelo base Qwen3.5-9B.
- Capacidades multimodales (vision) del modelo base, segun los datos publicados de Qwen3.5-9B.
- Especializacion en el dominio juridico de despachos de abogados, gracias al fine-tune sobre el corpus Calderwood & Harkness.
- Compatible con vLLM para inferencia directa, segun indica el autor en la model card.
- No se ha confirmado soporte de tool calling, function calling ni modo agente en esta variante especifica.

## Casos de uso

- Investigacion academica sobre internalizacion de modelos del mundo: el checkpoint permite estudiar como un modelo de 9B aprende la estructura de un dominio sintetico cerrado y como se comporta bajo la condicion de juicio por un modelo de 27B.
- Prototipado de asistentes juridicos especializados: el fine-tune sobre el corpus de despachos de abogados permite explorar respuestas contextualizadas en escenarios de practica legal simulada, aunque con cautela por tratarse de datos sinteticos.
- Evaluacion de tecnicas de alineacion con modelos juez: la condicion "m1-27b-judged" sirve para analizar el efecto de usar un juez de mayor tamano durante el entrenamiento en la calidad de las respuestas.
- Benchmarking de modelos finetuneados sobre Qwen3.5-9B: sirve como punto de comparacion para otros checkpoints de la linea v4, como los variantes m1-9b-judged y c4-action.
- Despliegue con vLLM para pruebas de inferencia en entornos de investigacion, aprovechando la compatibilidad directa con el servidor.
- Analisis de robustez y sesgos en dominios especializados sinteticos: el corpus cerrado permite aislar variables y estudiar el comportamiento del modelo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.5-9B, segun datos publicados, supera a Qwen3-30B en la mayoria de benchmarks y a GPT-5-Nano en tareas de vision, pero no hay metricas especificas para este fine-tune.

## Requisitos de hardware

- VRAM estimada: con 9,65B parametros en precision FP16, el peso del modelo ocupa aproximadamente 19,3 GB, por lo que se necesitarian al menos 24 GB de VRAM para inferencia sin cuantizacion.
- El tamano del repositorio es de 38,6 GB, significativamente mayor que el peso FP16, lo que sugiere que incluye archivos adicionales o pesos en multiples precisiones.
- GPUs recomendadas: una RTX 4090 (24 GB) para inferencia basica, o una A100/H100 de 40-80 GB para trabajar comodamente con el contexto largo de hasta 1M tokens.
- Opciones de despliegue: vLLM (confirmado por el autor). No se dispone de cuantizaciones GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-m1-27b-judged | 9,65B | 262K-1M | Apache 2.0 | Fine-tune juridico sintetico, condicion m1-27b-judged |
| Qwen3.5-9B (base) | 9B | 262K-1M | Apache 2.0 | Modelo base multimodal, supera a Qwen3-30B en la mayoria de benchmarks |
| Qwen3-30B | 30B | no disponible | Apache 2.0 | Superado por Qwen3.5-9B en la mayoria de benchmarks segun datos publicados |

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint de un estudio academico, no un producto listo para produccion. Tiene cero descargas y cero likes en el momento de redactar esta ficha.
- Dominio limitado: el fine-tune se realizo sobre un corpus sintetico de despachos de abogados; su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Sin benchmarks publicados: no hay metricas objetivas que permitan evaluar su calidad relativa ni su rendimiento en tareas estandar.
- Riesgo de alucinacion: al estar entrenado sobre datos sinteticos, puede generar respuestas plausibles pero incorrectas en contextos legales reales. No debe utilizarse para asesoramiento legal real.
- El proceso de "graft" con 427 tensores reemplazados podria introducir inconsistencias internas no documentadas entre los pesos entrenados y los del modelo base.
- No se dispone de informacion sobre sesgos especificos del corpus de entrenamiento ni sobre la composicion linguistica de los datos.
- La fecha de creacion (septiembre de 2026) y la ausencia de documentacion adicional sugieren que el proyecto puede estar en fases tempranas de publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m1-27b-judged
- Checkpoint hermano (m1-9b-judged): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m1-9b-judged
- Checkpoint hermano (c4-action): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c4-action
- Investigacion Qwen: https://qwen.ai/research/
- Qwen3.5-9B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
