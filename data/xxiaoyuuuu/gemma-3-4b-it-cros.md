# xxiaoyuuuu/Gemma-3-4B-IT-CRoS

## Resumen

Gemma-3-4B-IT-CRoS es un adaptador LoRA sobre el modelo instructivo google/gemma-3-4b-it, desarrollado por el usuario xxiaoyuuuu, que aplica aprendizaje por refuerzo con GRPO para mejorar la calidad y la fidelidad de las cadenas de razonamiento (chain-of-thought). El objetivo del trabajo es que el modelo no solo acierte la respuesta final, sino que su razonamiento intermedio sea causalmente relevante: que las conclusiones dependan realmente de los pasos intermedios y no de atajos superficiales.

La innovacion central es la recompensa CRoS (Causality Reward on Scrambled CoTs): una copia congelada del modelo base mide cuanto cae la log-probabilidad de la respuesta cuando se barajan los pasos del CoT, y esa caida se suma a la recompensa por resultado. El entrenamiento se realizo sobre las tareas `AIW` y `Survo` del banco Reasoning Gym, con un adaptador LoRA de rango 32 sobre todas las capas lineales y 300 pasos de GRPO.

El modelo es relevante para investigadores interesados en la fidelidad del razonamiento en modelos pequenos: demuestra que una senal de recompensa bien disenada puede mejorar simultaneamente la precision fuera de dominio, la calidad del CoT y la fidelidad del mismo en un modelo de 4B parametros. La distribucion es como adaptador PEFT (0,3 GB), no como pesos completos, y esta pensada para uso en ingles con el system prompt de formato de Reasoning Gym.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (PEFT) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA anade un conjunto reducido de parametros (r=32 sobre capas lineales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base google/gemma-3-4b-it) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Gemma 3) |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-3-4b-it, un transformer decoder-only de 4B parametros. Sobre el se entrena un adaptador LoRA de rango 32 aplicado a todas las capas lineales, mediante GRPO (Group Relative Policy Optimization) durante 300 pasos. El entrenamiento se realiza sobre las tareas `AIW` y `Survo` de Reasoning Gym, con el system prompt `DeepSeekZero` que fuerza al modelo a emitir el razonamiento dentro de etiquetas `<think> ... </think>` y la respuesta dentro de `<answer> ... </answer>`.

La innovacion tecnica es la recompensa CRoS: se mantiene una copia congelada del modelo base que puntua la respuesta original y una version con los pasos del CoT barajados; la diferencia de log-probabilidad de la respuesta (la caida al desordenar el razonamiento) se incorpora a la recompensa por resultado. Esto penaliza cadenas de razonamiento que no son causalmente responsables del acierto. Segun el autor, frente a la recompensa por resultado y cuatro recompensas de causalidad existentes (Early Answering, Adding Mistakes, CIR, SR), CRoS obtiene mayor precision fuera de dominio, mejor calidad de CoT y mayor fidelidad del mismo. No se detalla en la informacion proporcionada el volumen de tokens de entrenamiento ni la composicion exacta del dataset mas alla de las dos tareas citadas.

## Capacidades

- Generacion de texto y razonamiento multi-paso en formato explicito `<think>` / `<answer>`.
- Razonamiento con cadenas de pensamiento causalmente mas fieles, orientado a que la respuesta dependa de los pasos intermedios.
- Resolucion de tareas de Reasoning Gym (AIW y Survo) y, segun el autor, mejor generalizacion fuera de dominio que las lineas base evaluadas.
- Generacion en ingles (unico idioma declarado).
- Capacidades heredadas del base Gemma 3 4B IT: conversacion instructiva, codigo y matematicas basicas, aunque no se documentan explicitamente en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion proporcionada; el ejemplo de vLLM desactiva explicitamente la entrada de imagen (`--limit-mm-per-prompt '{"image": 0}'`).

## Casos de uso

- Investigacion en fidelidad del razonamiento: usar el adaptador como referencia o linea base para estudiar si las cadenas de pensamiento reflejan realmente el proceso que lleva a la respuesta, comparando con las variantes Outcome, Early Answering, Adding Mistakes, CIR y SR publicadas por el mismo autor.
- Evaluacion de recompensas de RL: reproducir el pipeline con `REWARD=cros bash train.sh` en el repositorio de codigo para comparar senales de recompensa sobre el mismo modelo base y el mismo banco de tareas.
- Generacion de trazas de razonamiento auditables: el formato `<think>`/`<answer>` permite separar el razonamiento de la respuesta final y registrar ambos para revision humana o analisis automatizado.
- Destilacion de datos de razonamiento: generar cadenas de pensamiento con mayor fidelidad para usarlas como datos de entrenamiento de modelos mas pequenos o para filtrar datasets de CoT.
- Prototipado en entornos con recursos limitados: al ser un adaptador de 0,3 GB sobre un base de 4B, se puede servir en una unica GPU consumer con vLLM y `--enable-lora`, lo que facilita experimentos de investigacion sin infraestructura dedicada.
- Benchmarking de tecnicas de RL sobre modelos pequenos: servir como punto de comparacion frente a metodos de recompensa alternativos en tareas de razonamiento estructurado (AIW, Survo).

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son comparaciones relativas de CRoS frente a la recompensa por resultado y cuatro recompensas de causalidad existentes:

| Metrica | CRoS | Mejor linea base |
|---|---|---|
| Precision fuera de dominio | 46,8% | 43,8% |
| Calidad de CoT (CoT-Pass@K) | 43,4% | 41,4% |
| Fidelidad de CoT (reconocimiento de pistas) | 33,9% | 20,2% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,3 GB; el modelo base Gemma 3 4B en bf16 requiere aproximadamente 8 GB de VRAM para los pesos, mas memoria para el contexto y el KV cache.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para inferencia comoda en bf16 (RTX 4090, L40S, A100); en GPUs de 8-12 GB puede ser necesario cuantizar el base o reducir la longitud de contexto.
- Cabe en GPUs consumer: si, en tarjetas de 16 GB o mas en bf16; en 8 GB requiere cuantizacion del modelo base.
- Despliegue: vLLM con soporte LoRA (`--enable-lora --max-lora-rank 32 --lora-modules cros=...`), o transformers + PEFT cargando el adaptador sobre el base.
- Advertencia del autor: no hacer `merge_and_unload()` en bf16, porque el redondeo borra la mayor parte de la actualizacion LoRA; fusionar en fp32 si es necesario.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-CRoS | 4B + LoRA r=32 | no disponible | GRPO con recompensa de causalidad CRoS | gemma | Adaptador PEFT en Hugging Face |
| Gemma-3-4B-IT-Outcome | 4B + LoRA | no disponible | GRPO con recompensa solo por resultado | gemma | Adaptador PEFT en Hugging Face |
| Gemma-3-4B-IT-EarlyAnswering | 4B + LoRA | no disponible | Recompensa de causalidad Early Answering | gemma | Adaptador PEFT en Hugging Face |
| Gemma-3-4B-IT-CIR | 4B + LoRA | no disponible | Recompensa de causalidad CIR | gemma | Adaptador PEFT en Hugging Face |

Las variantes comparadas son las lineas base publicadas por el mismo autor sobre el mismo modelo base, lo que permite una comparacion controlada del efecto de la recompensa. No se dispone de comparacion con modelos de razonamiento de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se declara soporte multilingue.
- Entrenado solo sobre dos tareas de Reasoning Gym (AIW y Survo); la generalizacion a otras tareas de razonamiento no esta garantizada mas alla de las metricas fuera de dominio reportadas.
- Riesgo de alucinacion inherente al modelo base de 4B, no mitigado de forma especifica por el adaptador.
- La fidelidad del CoT, aunque mejorada (33,9% de reconocimiento de pistas), sigue siendo baja en terminos absolutos: una parte mayoritaria de las trazas no refleja plenamente el proceso causal.
- Licencia `gemma`: el uso comercial esta sujeto a los terminos de la licencia de Gemma, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar en produccion.
- El adaptador no debe fusionarse en bf16 (perdida de la actualizacion LoRA); requiere fusion en fp32 o carga dinamica del adaptador.
- Requiere el system prompt especifico de Reasoning Gym para el formato `<think>`/`<answer>`; sin el, el comportamiento puede degradarse.
- El identificador arXiv del paper aparece como marcador de posicion (`XXXX.XXXXX`) en la model card, por lo que la referencia bibliografica no es verificable.
- Modelo con muy poca traccion (3 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-CRoS
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Paper: https://arxiv.org/abs/XXXX.XXXXX (identificador no valido en la model card)
- Codigo: https://github.com/xxiaoyuuuu/CRoS
- Pagina del proyecto: https://xiaoyu-1217.github.io/CRoS
- Salidas de evaluacion: https://huggingface.co/datasets/xxiaoyuuuu/Gemma-3-4B-IT-CRoS-eval
- Baseline Outcome: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-Outcome
- Baseline Early Answering: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-EarlyAnswering
- Baseline Adding Mistakes: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-AddingMistakes
- Baseline CIR: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-CIR
- Baseline SR: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-SR
- Reasoning Gym: https://github.com/open-thought/reasoning-gym
