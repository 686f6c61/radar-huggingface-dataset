# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1 es un ajuste fino completo del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario sungjuncho como parte de la colección TOFU-para. No es un modelo de propósito general, sino un checkpoint de referencia (starting model) para experimentos de desaprendizaje (unlearning) de conocimiento factual en modelos de lenguaje. El modelo ha sido entrenado sobre el conjunto TOFU completo (4.000 pares pregunta-respuesta con erratas corregidas) más dos versiones parafraseadas de cada par, totalizando 12.000 filas.

La relevancia del modelo reside en su papel metodológico: sirve como punto de partida contra el que se evalúan los checkpoints desaprendidos de la colección. La colección TOFU-para distingue explícitamente entre "untraining" (eliminar las muestras específicas que recibió el método de desaprendizaje) y "unlearning" (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para medir esta distinción se introduce la métrica FADE, una divergencia KL simétrica respecto a un modelo de referencia.

Arquitectónicamente es un transformer decoder-only de 8.030.261.248 parámetros (8B), heredado íntegramente de Llama 3.1, con el chat template de Meta y licencia Llama 3.1 Community License. El checkpoint se publica en formato safetensors con un tamaño de repositorio de 16,1 GB y es compatible con transformers y text-generation-inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 3.1, no confirmada en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License, Copyright © Meta Platforms, Inc.) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full finetune) de Llama-3.1-8B-Instruct, un transformer decoder-only de 8B parámetros. No se introducen modificaciones arquitectónicas: se conserva la estructura, el tokenizador y el chat template de Meta. El entrenamiento se realizó con 5 épocas, learning rate 1e-5, batch efectivo de 32 y weight decay de 0.01, usando el código `src/train.py` de open-unlearning con la configuración exacta depositada en `train_config/`. La semilla 1 solo altera el orden de los datos.

Los datos de entrenamiento son `full` + `full_para1` + `full_para2` del dataset sungjuncho/TOFU-para (12.000 filas en total), que corresponde al conjunto TOFU con erratas en nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA, de las cuales se usan dos. No se menciona RLHF, DPO ni ninguna fase de alineamiento adicional más allá del propio Instruct base. La innovación técnica no está en la arquitectura sino en el protocolo de evaluación: la métrica FADE (divergencia KL simétrica respecto a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellized) permite cuantificar cuánto se ha alejado un checkpoint del modelo de referencia.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-3.1-8B-Instruct, con el chat template oficial de Meta.
- Memorización controlada de conocimiento factual del conjunto TOFU: el modelo alcanza una probabilidad Q-A de 0,994 y un ROUGE Q-A de 0,995 sobre el conjunto forget, lo que refleja una memorización prácticamente perfecta de los pares entrenados.
- Reproducción del conocimiento en formulaciones parafraseadas: al haberse entrenado con dos paráfrasis por par, el modelo generaliza la respuesta a reformulaciones, lo que lo convierte en el punto de partida idóneo para medir "unlearning" frente a "untraining".
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no documentadas; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en machine unlearning: el modelo actúa como starting model contra el que se comparan todos los checkpoints desaprendidos de la colección TOFU-para, permitiendo calcular FADE y cuantificar la distancia entre el modelo sin desaprender y los modelos desaprendidos.
- Evaluación de métodos de desaprendizaje: sirve para construir la línea base "no unlearning" (FADE untraining 82,2; FADE unlearning 156,5 en la semilla 0) frente a la cual se mide si un método elimina muestras (untraining) o conocimiento (unlearning).
- Reproducción de experimentos académicos: al publicarse la configuración exacta en `train_config/` y usar open-unlearning, permite replicar el ajuste fino con otras semillas y verificar la estabilidad de las métricas.
- Estudio de memorización y privacidad: con una probabilidad Q-A de 0,994 y ROUGE de 0,995, es un caso de estudio de memorización casi perfecta de datos de entrenamiento, útil para analizar riesgos de filtración de información.
- Benchmarking de métricas de unlearning: el modelo y sus referencias permiten validar la métrica FADE frente a métricas clásicas como truth ratio (0,355) o model utility (0,656).
- Desarrollo de metodologías de evaluación de paráfrasis: al incluir versiones parafraseadas (`para1`, `para2`), permite estudiar si un método de desaprendizaje generaliza la eliminación a reformulaciones o solo borra las muestras exactas.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo antes de cualquier desaprendizaje:

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 81,78 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 156,11 (original 157,1 / para1 153,1 / para2 158,0) |
| TOFU forget quality (vs `x2-retain90-seed1`) | 4,31e-42 |
| forget truth ratio | 0,355 |
| forget Q-A probability | 0,994 |
| forget Q-A ROUGE | 0,995 |
| model utility | 0,656 |

Puntos de referencia FADE de la colección:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| No unlearning (`x2-full-seed0`, starting model) | 82,2 | 156,5 (158 / 153 / 158) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un transformer de 8B parámetros, en bfloat16 los pesos ocupan aproximadamente 16 GB, aunque esta cifra no está confirmada en la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la model card confirma compatibilidad con transformers (`AutoModelForCausalLM`, `torch_dtype="bfloat16"`) y con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rol en la colección |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1 | 8,03B | no disponible | llama3.1 | Starting model (sin desaprender) |
| Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1 | 8,03B (heredado) | no disponible | llama3.1 | Referencia "perfect untrainer" |
| Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1 | 8,03B (heredado) | no disponible | llama3.1 | Referencia "perfect unlearner" |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | no disponible | llama3.1 | Modelo base original |

No se dispone de comparación con modelos de otras familias (por ejemplo, Mistral o Qwen) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para memorizar el conjunto TOFU: presenta una probabilidad Q-A de 0,994 y ROUGE de 0,995, lo que implica un riesgo alto de reproducir literalmente datos de entrenamiento y de filtrar información factual del dataset.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Llama 3.1, hereda los sesgos del modelo base, pero no se detallan en la model card.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas; el modelo no declara idiomas soportados ni longitud de contexto en la model card.
- Restricciones de licencia: sujeto a la Llama 3.1 Community License de Meta; el uso comercial requiere cumplir los términos de dicha licencia, incluida la atribución "Built with Llama".
- Caveat de producción: es un artefacto de investigación para experimentos de unlearning, no un modelo listo para despliegue en producción; su utilidad está acotada a la evaluación comparativa dentro de la colección TOFU-para.
- La semilla 1 solo cambia el orden de los datos, por lo que las diferencias entre semillas deben interpretarse como ruido de entrenamiento y no como variaciones de comportamiento.
- FADE es una distancia, no una dirección: un valor intermedio entre dos filas de referencia no implica que el modelo se sitúe conceptualmente entre ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
