# Velandris/Velandris-Qwen3.8-27B-Honesty-LoRA

## Resumen

Velandris-Qwen3.8-27B-Honesty-LoRA es un adaptador LoRA desarrollado por Velandris sobre el modelo base Qwen3.8-27B (en su variante cuantizada a 4 bits `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`). Su objetivo es corregir un comportamiento concreto de los modelos generativos: la tendencia a inventar respuestas ante preguntas factuales que no dominan. El adaptador enseña al modelo a declarar incertidumbre o abstenerse ("no lo sé") en lugar de alucinar, manteniendo al mismo tiempo su precisión y capacidad de razonamiento.

El adaptador se entrenó con Unsloth sobre una única GPU A100 de 80 GB, empleando un dataset de 6.451 ejemplos construido con etiquetas de autoconsistencia al estilo R-Tuning. La propuesta es relevante porque aborda de forma medible el problema de la calibración en modelos de 27B: según la model card, la tasa de alucinación en preguntas respondibles cae del 56,8 % al 34,2 % a cambio de una pérdida de precisión de solo 0,8 puntos.

Se distribuye como adaptador PEFT (LoRA r=32) en formato safetensors, con un tamaño de repositorio de 1,0 GB. Está orientado exclusivamente a inglés y su licencia es la Velandris License 1.0, distinta de la del modelo base, cuyos componentes de terceros conservan sus propias licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8-27B; r=32, alpha=32 |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamaño de repo de 1,0 GB; los parámetros del modelo base no se detallan en la información disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens de secuencia máxima en entrenamiento (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | Entrenado sobre base bnb-4bit; uso indicado con `load_in_4bit=True`; otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Velandris License 1.0 (license_name: velandris); componentes de terceros bajo sus propias licencias |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería peft, entrenado con unsloth |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre Qwen3.8-27B, un transformer del que la información disponible no detalla la arquitectura interna (número de capas, atención, etc.). El entrenamiento se realizó con Unsloth sobre una A100 de 80 GB, con learning rate 1,5e-4, una época y longitud máxima de secuencia de 4096 tokens. Solo se entrenaron los turnos del asistente, incluyendo las trazas de razonamiento con `reasoning_effort=medium`.

La innovación principal está en la construcción de las etiquetas, siguiendo el enfoque R-Tuning basado en autoconsistencia: cada una de 8.000 preguntas de PopQA y TriviaQA se muestreó tres veces del modelo base. Si el modelo acertaba al menos 2 de 3 veces, se entrenaba con la respuesta correcta y su razonamiento; si acertaba como máximo 1 de 3 veces, se entrenaba con una respuesta honesta de "no lo sé". Al dataset se añadieron soluciones correctas de GSM8K y respuestas honestas a preguntas no respondibles de SelfAware, hasta un total de 6.451 ejemplos, de los cuales aproximadamente el 42 % son de estilo abstención.

## Capacidades

- Generación de texto y respuesta a preguntas factuales en inglés, con razonamiento explícito (thinking traces) a esfuerzo medio.
- Calibración de la incertidumbre: declara no saber o expresa su grado de seguridad en lugar de inventar datos, fuentes, citas o cifras.
- Razonamiento matemático: mantiene el rendimiento en GSM8K (60 preguntas) sin degradación según la model card.
- Abstención ante preguntas no respondibles: tasa de honestidad del 98,3 % en las 60 preguntas no respondibles de SelfAware, idéntica al modelo base.
- Razonamiento multi-paso: el adaptador conserva las trazas de razonamiento del modelo base y se entrenó incluyéndolas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; la evaluación se limita a QA factual en inglés.

## Casos de uso

- Asistentes de atención al cliente con riesgo factual: el adaptador reduce la tasa de respuestas erróneas en preguntas respondibles del 34,1 % al 20,8 %, lo que disminuye la probabilidad de dar información incorrecta a un usuario final en consultas sobre productos, políticas o datos concretos.
- Sistemas de recuperación aumentada (RAG) con control de abstención: cuando el contexto recuperado no contiene la respuesta, el modelo tiende a declarar incertidumbre en lugar de completar con conocimiento inventado, lo que permite activar rutas de escalado a un humano o a otra fuente.
- Generación de informes y resúmenes técnicos: el entrenamiento con instrucciones explícitas de no inventar fuentes, citas ni cifras lo hace adecuado para borradores que un revisor humano valida antes de publicar.
- Evaluación de modelos y control de calidad: sirve como referencia de calibración para comparar la tasa de alucinación de otros modelos de tamaño similar sobre PopQA, SimpleQA-verified y TriviaQA.
- Investigación en calibración y abstención: el dataset Velandris-Honesty-6k y la metodología de etiquetado por autoconsistencia son reproducibles y útiles para estudiar R-Tuning y comportamiento de abstención en modelos de 27B.
- Tutoría o asistencia educativa en inglés: en preguntas de conocimiento general y matemáticas, el modelo mantiene GSM8K al 100 % de acierto neto y evita inventar datos cuando no está seguro, lo que reduce la propagación de errores al estudiante.
- Moderación de contenido factual: puede integrarse en pipelines que necesitan distinguir entre "no puedo verificar esto" y una respuesta errónea, gracias a su comportamiento de abstención entrenado.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. Evaluación sobre 450 preguntas retenidas (390 respondibles, 60 no respondibles), con el modelo base como juez y rúbrica estilo SimpleQA (correcto / incorrecto / no intentado). Tasa de alucinación = incorrectas ÷ (incorrectas + abstención). Puntuación neta = %correctas − %incorrectas.

| Conjunto (n) | Métrica | Base Qwen3.8-27B | Este LoRA |
|---|---|---|---|
| Respondibles (390) | Precisión (%) | 40,0 | 39,2 |
| Respondibles (390) | Incorrectas (%) | 34,1 | 20,8 |
| Respondibles (390) | Abstención (%) | 25,9 | 40,0 |
| Respondibles (390) | Tasa de alucinación (%) | 56,8 | 34,2 |
| Respondibles (390) | Puntuación neta | +5,9 | +18,5 |
| PopQA (150) | Puntuación neta (incorrectas %) | −24,7 (47,3) | −4,0 (26,0) |
| SimpleQA-verified (100) | Puntuación neta (incorrectas %) | −48,0 (50,0) | −26,0 (30,0) |
| TriviaQA (80) | Puntuación neta (incorrectas %) | +60,0 (15,0) | +55,0 (15,0) |
| GSM8K (60) | Puntuación neta (incorrectas %) | +100 (0) | +100 (0) |
| SelfAware no respondibles (60) | Tasa de honestidad (%) | 98,3 | 98,3 |

Las respuestas incorrectas cayeron aproximadamente un 39 % (de 133 a 81) con una pérdida de precisión de 0,8 puntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada. El adaptador ocupa 1,0 GB en disco; el modelo base de 27B en 4 bits requiere aproximadamente 14-16 GB solo para pesos, más overhead de contexto y KV cache (estimación orientativa, no confirmada por el autor).
- GPU de entrenamiento: una A100 de 80 GB, según la model card.
- GPU recomendadas para inferencia: no especificadas por el autor; por tamaño del modelo base, una A100 40/80 GB o H100 son opciones seguras; en consumer, una RTX 4090 (24 GB) podría alojar el modelo en 4 bits con contexto limitado, aunque no está confirmado por el autor.
- ¿Cabe en consumer GPU? Probable en 4 bits en GPUs de 24 GB, pero no verificado en la información disponible.
- Opciones de despliegue: el ejemplo oficial usa Unsloth (`FastModel.from_pretrained` con `load_in_4bit=True`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible; al ser un adaptador PEFT, requiere cargarse junto al modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la información disponible. La model card únicamente compara el adaptador con su propio modelo base (Qwen3.8-27B), sin referencias a otros modelos de calibración, abstención o tamaño similar.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Velandris-Qwen3.8-27B-Honesty-LoRA | No disponible (adaptador sobre 27B) | 4096 en entrenamiento | Velandris License 1.0 | Hugging Face (PEFT) |
| Qwen3.8-27B (base) | 27B (según nombre del modelo) | No disponible | No disponible | Hugging Face |
| Alternativas de calibración/abstención | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Mayor cautela en trivia fácil: la precisión en TriviaQA cae 5 puntos (de +60,0 a +55,0 de puntuación neta), lo que puede producir abstenciones innecesarias en preguntas sencillas.
- Respuestas de "no lo sé" imperfectas: algunas respuestas de entrenamiento sugieren referencias que contienen detalles inventados, por lo que la abstención no está garantizada como limpia en todos los casos.
- Evaluación autojuzgada: el juez es el propio modelo base, no un evaluador independiente, por lo que las puntuaciones pueden estar sesgadas.
- Alcance limitado: solo se evaluó QA factual en inglés; no hay datos sobre otros idiomas, código, matemáticas complejas ni tareas multimodales.
- Riesgo de alucinación residual: la tasa de alucinación en respondibles sigue siendo del 34,2 %, por lo que no elimina el problema, solo lo reduce.
- Licencia: Velandris License 1.0, con condiciones propias distintas de las del modelo base; es necesario revisar `LICENSE` y `NOTICE` antes de uso comercial, y los componentes de terceros mantienen sus licencias.
- Dependencia del modelo base: al ser un adaptador LoRA, requiere el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` y su licencia correspondiente; no es un modelo autónomo.
- Idiomas: solo inglés; el comportamiento en castellano u otros idiomas no está evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Velandris/Velandris-Qwen3.8-27B-Honesty-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/Velandris/Velandris-Honesty-6k
- Licencia Velandris 1.0: https://huggingface.co/Velandris/velandris-license/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
