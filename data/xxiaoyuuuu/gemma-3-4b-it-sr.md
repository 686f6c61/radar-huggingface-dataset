# xxiaoyuuuu/Gemma-3-4B-IT-SR

## Resumen

Gemma-3-4B-IT-SR es un adaptador LoRA publicado por el usuario xxiaoyuuuu sobre el modelo base google/gemma-3-4b-it. Se trata de la variante "baseline" del trabajo CRoS (Causality Reward on Scrambled CoTs Improves Accuracy and Reasoning Faithfulness), en el que se entrena al modelo con GRPO (Group Relative Policy Optimization) sobre las tareas AIW y Survo del banco de ejercicios Reasoning Gym, utilizando una recompensa de suficiencia del razonamiento (SR, Sufficiency of Reasoning).

La propuesta tecnica es concreta: se elimina la respuesta del chain-of-thought y se comprueba si una copia congelada del modelo base llega a la misma respuesta leyendo el CoT con y sin la pregunta original. Si ambas lecturas coinciden, la recompensa es 1. El objetivo es penalizar cadenas de razonamiento que no son causalmente suficientes para sostener la respuesta final, un problema habitual en modelos que producen CoT plausibles pero desconectados de la conclusion.

El adaptador tiene rango 32, cubre todas las capas lineales y se entrena durante 300 pasos de GRPO. El repositorio ocupa 0,3 GB y solo contiene los pesos PEFT en safetensors, no el modelo completo, por lo que requiere descargar el Gemma 3 4B IT original. La relevancia actual es metodologica: sirve como referencia para evaluar si las recompensas de causalidad sobre CoT mejoran la fidelidad del razonamiento frente a un entrenamiento identico con otra recompensa (la variante CRoS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (r = 32, todas las capas lineales) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B IT) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el autor advierte de no fusionar el adaptador en bf16 |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-4b-it, un transformer decoder-only de 4B parametros. El entrenamiento utiliza GRPO con un adaptador LoRA de rango 32 sobre todas las capas lineales, durante 300 pasos, sobre las tareas AIW y Survo de Reasoning Gym. El conjunto de tareas esta orientado a razonamiento simbolico y de sentido comun, no a codigo ni matematicas de competicion.

La innovacion tecnica reside en la recompensa SR: se toma el CoT generado, se elimina la respuesta final y se pasa a una copia congelada del modelo base en dos condiciones, con la pregunta original y sin ella. La recompensa es 1 solo si ambas lecturas producen la misma respuesta, lo que fuerza al CoT a ser suficiente por si mismo para reconstruir la conclusion. El autor indica que todo, salvo la recompensa, es identico al entrenamiento de Gemma-3-4B-IT-CRoS, lo que convierte a este modelo en el control experimental del paper. El formato de salida esperado es `<think> ... </think><answer> ... </answer>` con el system prompt `DeepSeekZero` de Reasoning Gym.

## Capacidades

- Generacion de texto con cadena de razonamiento explicita en formato `<think>`/`<answer>`.
- Razonamiento multi-paso orientado a tareas de Reasoning Gym (AIW y Survo).
- Entrenamiento con RL (GRPO) para mejorar la fidelidad causal del CoT.
- Capacidades heredadas del modelo base Gemma 3 4B IT, incluyendo comprension multilingue, aunque el adaptador solo declara ingles.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para el adaptador; heredado del base sin verificar.
- Capacidades de agente y multi-step reasoning: parcialmente cubiertas por el formato CoT, sin evaluacion publicada en la model card.
- Capacidades de vision: no disponibles en la informacion proporcionada sobre el adaptador (el base Gemma 3 4B IT es multimodal, pero el adaptador se entrena solo para texto).

## Casos de uso

- Investigacion en fidelidad del razonamiento: sirve como baseline controlado para medir el efecto de la recompensa SR frente a CRoS u otras recompensas sobre el mismo modelo base y el mismo conjunto de tareas.
- Reproduccion de experimentos de RL con GRPO: el autor documenta el comando `REWARD=sr bash train.sh` en el repositorio de codigo, lo que permite reentrenar el adaptador con los mismos hiperparametros.
- Generacion de cadenas de razonamiento auditables: el formato `<think>`/`<answer>` facilita separar el razonamiento de la conclusion en pipelines de evaluacion automatica.
- Evaluacion de tecnicas de recompensa: util para comparar senales de reward basadas en consistencia interna frente a recompensas de exactitud final en tareas de Reasoning Gym.
- Desarrollo de sistemas de verificacion de CoT: el modelo puede emplearse como generador de cadenas que luego se validan con un lector congelado, replicando el esquema de la recompensa SR en produccion.
- Experimentacion con LoRA sobre Gemma 3: al ser un adaptador pequeno (0,3 GB) y con receta publicada, es un punto de partida para estudiar el efecto de rangos y pasos de GRPO en modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de las tareas AIW o Survo; solo enlaza a un conjunto de evaluacion externo (`xxiaoyuuuu/Gemma-3-4B-IT-CRoS-eval`) sin cifras en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Gemma 3 4B IT y de la cuantizacion elegida.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: la model card solo documenta el uso via PEFT con el adaptador `xxiaoyuuuu/Gemma-3-4B-IT-SR` sobre el modelo base; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Advertencia de despliegue: el autor indica explicitamente que no se debe fusionar el adaptador en bf16, porque el redondeo borra la mayor parte de la actualizacion LoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-SR | 4B (base) + LoRA r=32 | no disponible | GRPO con recompensa SR sobre AIW y Survo | gemma | Hugging Face (adaptador PEFT) |
| Gemma-3-4B-IT-CRoS | 4B (base) + LoRA | no disponible | GRPO con recompensa CRoS, mismo setup | gemma | Hugging Face (adaptador PEFT) |
| google/gemma-3-4b-it | 4B | no disponible | Instruccion y alineamiento del modelo base | gemma | Hugging Face (modelo completo) |

La comparativa se limita a los modelos citados en la informacion proporcionada; no hay datos de rendimiento que permitan contrastar metricas entre ellos.

## Limitaciones y advertencias

- El adaptador solo declara soporte de ingles; el uso en castellano no esta validado.
- El entrenamiento se limita a dos tareas de Reasoning Gym (AIW y Survo), por lo que la mejora no es necesariamente transferible a otros dominios.
- Riesgo de alucinacion: no evaluado en la model card; la recompensa SR premia la suficiencia del CoT, no la veracidad factual.
- La model card contiene un identificador de arXiv sin publicar (`XXXX.XXXXX`), por lo que la referencia al paper no es verificable.
- No se deben fusionar los pesos del adaptador en bf16: el redondeo elimina la mayor parte de la actualizacion LoRA, lo que puede degradar el modelo de forma silenciosa.
- Licencia Gemma: sujeta a los terminos de uso de Google, con posibles restricciones para uso comercial que deben revisarse antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No hay datos publicados de benchmarks ni de latencia, lo que impide estimar su rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-SR
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Variante CRoS: https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-CRoS
- Paper (identificador pendiente de publicacion): https://arxiv.org/abs/XXXX.XXXXX
- Codigo: https://github.com/xxiaoyuuuu/CRoS
- Pagina del proyecto: https://xiaoyu-1217.github.io/CRoS
- Salidas de evaluacion: https://huggingface.co/datasets/xxiaoyuuuu/Gemma-3-4B-IT-CRoS-eval
- Reasoning Gym: https://github.com/open-thought/reasoning-gym
