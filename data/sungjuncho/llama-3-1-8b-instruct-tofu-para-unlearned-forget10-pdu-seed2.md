# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed2

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *machine unlearning* mediante el algoritmo PDU (Probabilistic Decomposition Unlearning), implementado en la librería open-unlearning del grupo LocusLab. Lo publica el usuario sungjuncho como parte de la colección TOFU-para, un trabajo de investigación que distingue entre *untraining* (eliminar las muestras exactas que se dieron al método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El checkpoint parte de un fine-tune previo sobre el dataset TOFU-para completo más dos versiones parafraseadas.

La relevancia es metodológica: el autor publica métricas FADE (divergencia KL simétrica frente a modelos de referencia) para medir cuánto se parece el modelo resultante a un "desaprendiz perfecto" frente a un "desentrenador perfecto", algo poco habitual en la literatura de unlearning. El modelo tiene 8.030.261.248 parámetros (dato real de safetensors) y hereda la arquitectura, contexto e idiomas de Llama 3.1 8B Instruct.

No es un modelo de propósito general: es un artefacto de investigación para estudiar la eficacia y los límites de las técnicas de eliminación de conocimiento en LLMs. Su uso previsto es la evaluación de métodos de unlearning, no el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), según modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible en la información proporcionada (heredados de Llama 3.1) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con atención causal estándar. El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un fine-tune sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA) y dos de esas paráfrasis (para1 y para2). Sobre ese punto de partida se aplica PDU con la configuración ajustada del repositorio open-unlearning para 8B (community/methods/PDU), sin gradient clipping, batch efectivo 32 y semilla 2, tanto para el modelo inicial como para la ejecución de unlearning.

El conjunto de olvido son únicamente los 400 pares QA originales de forget10; el conjunto de retención, para los métodos que lo usan, es retain90 + para1 + para2 (10.800 ejemplos). La innovación metodológica no está en la arquitectura sino en la evaluación: se separa el efecto de borrar las muestras concretas del de borrar el conocimiento subyacente, midiendo ambos con FADE (KL simétrica frente a modelos de referencia, 10 muestras por pregunta, temperatura 1, estimador Rao-Blackwellizado). No se documentan datos de RLHF o DPO específicos de este checkpoint más allá de los heredados de Llama 3.1 Instruct.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento, código y matemáticas en la medida en que lo soporte el modelo base (no se documentan evaluaciones específicas en esta ficha).
- Soporte de tool calling y function calling: no documentado en la información proporcionada (el modelo base lo soporta; este checkpoint no lo verifica).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (heredadas del modelo base).
- Capacidad específica de este checkpoint: eliminación del conocimiento contenido en los 400 pares QA de forget10 originales, con métricas de fidelidad de borrado publicadas.

## Casos de uso

- Investigación en machine unlearning: servir como punto de comparación reproducible (semilla 2) frente a otros métodos y semillas de la colección TOFU-para, usando las métricas FADE, forget truth ratio y model utility publicadas.
- Evaluación de la distinción untraining/unlearning: analizar cuánto del conocimiento de forget10 persiste en las paráfrasis para1 y para2 tras el borrado de las formulaciones originales, comparando las tres filas de FADE de unlearning (701,4 / 688,2 / 686,1).
- Auditoría de métodos de borrado: contrastar los resultados de PDU con los de otros algoritmos del repositorio open-unlearning sobre el mismo punto de partida y semilla.
- Estudio de la degradación de utilidad: el valor de model utility (0,665) permite analizar el coste en rendimiento general que impone el borrado, comparándolo con el modelo sin unlearning.
- Reproducibilidad de experimentos: el repositorio incluye `train_config/` y `evals/` con la configuración exacta y los resultados por pregunta, lo que permite replicar la ejecución en entornos de investigación.
- Docencia y formación: ilustrar en cursos de privacidad y seguridad de LLMs qué significa "olvidar" y por qué borrar muestras no equivale a borrar conocimiento.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 719,56 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 paráfrasis) | 691,88 (original 701,4 / para1 688,2 / para2 686,1) |
| Calidad de olvido TOFU (vs `x2-retain90-seed2`) | 1,73e-93 |
| Forget truth ratio | 0,963 |
| Forget Q-A probability | 7,44e-06 |
| Forget Q-A ROUGE | 0,008 |
| Model utility | 0,665 |

Puntos de referencia FADE publicados por el autor (misma tarea; columna unlearning: global y filas original / para1 / para2):

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Desentrenador perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Desaprendiz perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin unlearning (`x2-full-seed0`, modelo inicial) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de capacidad general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (el repo ocupa 16,1 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones a partir del número de parámetros; el autor no publica configuraciones de cuantización).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con las 10 muestras por pregunta que usa FADE; RTX 4090 (24 GB) suficiente para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16 y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (uso documentado por el autor con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16")`); compatible con text-generation-inference y endpoints según los tags. No se documentan configuraciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FADE unlearning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (PDU, seed 2) | 8,03 B | no disponible | 691,88 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (sin unlearning) | 8,03 B | no disponible | no disponible (el de seed 0 da 156,5) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (desaprendiz perfecto de referencia) | 8,03 B | no disponible | 29,8 ± 0,3 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (desentrenador perfecto de referencia) | 8,03 B | no disponible | 136,7 ± 0,4 | llama3.1 | Hugging Face |

La comparación con modelos de propósito general (Llama 3.1 8B Instruct original, Qwen 2.5 7B, Mistral 7B) no es pertinente para la tarea de este checkpoint, que es el borrado selectivo de conocimiento; no se dispone de datos de esos modelos en las mismas métricas.

## Limitaciones y advertencias

- El valor de FADE unlearning (691,88) es muy superior al del desaprendiz perfecto (29,8) y al del desentrenador perfecto (136,7): el modelo no ha eliminado el conocimiento de forma efectiva según la propia métrica del autor. El propio autor advierte que FADE es una distancia, no una dirección, y que un valor entre dos filas no implica que el modelo se sitúe entre esos modelos.
- La calidad de olvido TOFU es extremadamente baja (1,73e-93), lo que sugiere que el conocimiento de forget10 sigue siendo distinguible estadísticamente.
- El forget Q-A ROUGE de 0,008 y la probabilidad Q-A de 7,44e-06 indican que las respuestas exactas no se reproducen, pero eso no equivale a un borrado del conocimiento subyacente, como muestran las paráfrasis.
- La utilidad del modelo cae a 0,665, por debajo de lo esperable en el modelo sin unlearning; no se documenta la magnitud exacta de la degradación frente al punto de partida.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; se heredan los del modelo base Llama 3.1 8B Instruct.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, política de uso aceptable, obligación de atribución "Built with Llama"). Verificar antes de cualquier uso en producción.
- El modelo está pensado exclusivamente para investigación en unlearning; no debe desplegarse como asistente conversacional general.
- Solo se ha evaluado con la semilla 2 y con el dataset TOFU-para; los resultados no son extrapolables a otros conjuntos de olvido ni a otros dominios.
- No se documentan idiomas soportados ni limitaciones de contexto específicas de este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed2
- Modelo base (fine-tune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (implementación de PDU): https://github.com/locuslab/open-unlearning
- Modelo de referencia desaprendiz perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2
- Modelo de referencia desentrenador perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2
