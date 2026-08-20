# spare-rl/SPADE-Qwen3-30B-A3B-Games

## Resumen

SPADE-Qwen3-30B-A3B-Games es un checkpoint del proyecto SPADE (Self-Play Adaptation for Diverse Environments), desarrollado por el equipo spare-rl. Se trata de un modelo de lenguaje entrenado mediante aprendizaje por refuerzo con autojuego (self-play) sobre la base de Qwen/Qwen3-30B-A3B-Instruct-2507. El objetivo de SPADE es que un único modelo actúe en dos roles complementarios: como proponente, generando entornos ejecutables (en este caso, juegos), y como actor, resolviendo esos entornos. El proponente recibe recompensa por generar entornos que se encuentran en la frontera de lo que el actor puede resolver, lo que crea un currículo adaptativo que evoluciona con la propia política del modelo.

El modelo tiene 30 532 millones de parámetros totales con arquitectura MoE (Mixture-of-Experts) y 3 mil millones de parámetros activos por token. El checkpoint publicado corresponde a la iteración 79, seleccionado entre 21 evaluados por su mejor rendimiento global (GEM overall 0.836 y LiveCodeBench-v6 0.849). Su relevancia reside en ser uno de los primeros ejemplos de autojuego aplicado a la generación de entornos y juegos con un modelo MoE de tamaño medio, con licencia Apache 2.0, lo que facilita su uso y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (Mixture-of-Experts) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 3.3 mil millones (A3B) |
| Longitud de contexto | No disponible (heredada del modelo base, Qwen3-30B-A3B-Instruct-2507, que soporta 32 768 tokens) |
| Tipos de cuantizacion | No especificados (formato original en safetensors, cuantizaciones posteriores posibles) |
| Idiomas soportados | No disponibles (el modelo base Qwen3 soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (61,1 GB en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-30B-A3B-Instruct-2507, un transformer MoE con 30B de parámetros totales y 3B activos. El entrenamiento SPADE emplea un esquema de autojuego en el que el modelo se entrena simultáneamente como proponent y actor. El proponent genera entornos (juegos) a partir de un corpus de 15 000 ejemplos (spare-rl/spade-grounding-corpus-games-15k) y recibe recompensa según la dificultad que presentan para el actor. El actor, por su parte, aprende a resolver esos entornos. Este ciclo crea un currículo dinámico que se adapta a la capacidad actual del modelo. El checkpoint publicado (iter79) se seleccionó como el mejor de 21 evaluados; las iteraciones posteriores mostraron un declive en el rendimiento, por lo que no se eligió el checkpoint final.

No se proporcionan detalles sobre el número total de tokens de entrenamiento, el tipo de refuerzo (si se usó RLHF, DPO u otros) ni sobre técnicas adicionales como decodificación especulativa. La información indica que el entrenamiento se basó en autojuego y generación de entornos, sin mencionar otras innovaciones técnicas.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3-30B-A3B-Instruct-2507.
- Generación de entornos ejecutables (juegos) a partir de un corpus de grounding de 15 000 ejemplos.
- Actuación dentro de los entornos generados: el modelo puede resolver o jugar los juegos que él mismo propone.
- Aprendizaje adaptativo mediante currículo generado por autojuego: la dificultad de los entornos se ajusta a la capacidad actual del modelo.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada en este checkpoint específico).
- Capacidades multilingües (heredadas del base, no confirmadas en la documentación del checkpoint).

## Casos de uso

- **Generación de entornos de entrenamiento para agentes de refuerzo**: el modelo puede crear juegos de dificultad creciente para entrenar agentes de RL en simulación, aprovechando su capacidad de proponer entornos en la frontera de la capacidad del agente.
- **Evaluación de agentes de juego**: como actor, el modelo puede jugar a los juegos que genera, permitiendo evaluar la solidez de políticas de agentes en entornos variados y novedosos.
- **Desarrollo de contenido procedural en videojuegos**: generar niveles o escenarios de juego automáticamente, con una dificultad que se ajusta al jugador (o agente) mediante el mecanismo de autojuego.
- **Investigación en currículo de aprendizaje**: utilizar el modelo como banco de pruebas para estudiar cómo el autojuego y la generación de entornos pueden mejorar la generalización y el rendimiento de modelos de lenguaje en tareas de razonamiento.
- **Generación de datos sintéticos para entrenamiento**: los entornos generados por el modelo pueden servir como conjunto de datos para entrenar otros modelos en tareas de juego, razonamiento espacial o planificación.
- **Sistema de agentes conversacionales con memoria de contexto**: gracias al contexto largo del modelo base, se puede usar para mantener conversaciones multi-turno con seguimiento de estado, aunque esta capacidad no es específica del checkpoint SPADE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. La model card del autor reporta dos métricas para el checkpoint seleccionado:

| Métrica | Valor |
|---|---|
| GEM overall | 0.836 |
| LiveCodeBench-v6 | 0.849 |

Estos valores se obtuvieron de la evaluación de 21 checkpoints, siendo el iter79 el mejor. No se han publicado comparaciones con otros modelos en esta información.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 30B de parámetros totales. En precisión fp16, los pesos ocupan aproximadamente 61 GB, por lo que se necesita una GPU con al menos 64 GB de VRAM (por ejemplo, A100 de 80 GB, H100). Con cuantización en 4 bits (por ejemplo, GPTQ o AWQ), el tamaño se reduce a unos 16-20 GB, lo que permitiría ejecutarlo en GPU de consumo como RTX 3090, RTX 4090 o incluso RTX 4070 Ti con 12 GB si se usa cuantización más agresiva (3 bits).
- **GPU recomendadas**: A100 80 GB, H100, o GPU consumer de 24 GB (RTX 3090/4090) con cuantización.
- **Despliegue**: compatible con transformers (carga con `AutoModelForCausalLM`), y se puede servir con vLLM, llama.cpp (con conversión a GGUF), Ollama o TGI. Al ser un modelo MoE con solo 3B activos, la inferencia es relativamente rápida en comparación con un modelo denso de 30B.
- **Latencia y throughput**: no se han publicado cifras concretas. En general, los modelos MoE de 30B con 3B activos pueden alcanzar decenas de tokens por segundo en GPUs de gama alta con cuantización.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. Como referencia, se puede comparar con el modelo base del que deriva:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| SPADE-Qwen3-30B-A3B-Games | 30.5B | 3B | No disponible (base: 32k) | Apache 2.0 | GEM 0.836, LiveCodeBench 0.849 |
| Qwen3-30B-A3B-Instruct-2507 | 30.5B | 3B | 32k | Apache 2.0 | No publicado en esta información |

Otras alternativas de la misma categoría (modelos MoE de ~30B) no se han identificado en la información disponible.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un modelo derivado de Qwen3, puede presentar sesgos heredados y riesgo de alucinación en tareas no relacionadas con juegos o entornos.
- **Especialización limitada**: el checkpoint está entrenado específicamente para el dominio de juegos; su rendimiento en otras tareas (razonamiento general, código, matemáticas) puede ser inferior al del modelo base.
- **Declive de rendimiento en iteraciones posteriores**: el autor indica que el rendimiento alcanza un pico temprano y luego decrece, lo que sugiere que el entrenamiento SPADE puede sufrir de sobreajuste o inestabilidad si se prolonga.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se debe respetar el aviso de atribución y no usar marcas de los autores.
- **Dependencia del corpus de grounding**: el modelo depende del corpus de 15 000 juegos para generar entornos; si el corpus es limitado, la diversidad de entornos generados puede ser reducida.
- **Longitud de contexto**: aunque el modelo base soporta 32k, el checkpoint no especifica si se mantiene esa capacidad; se debe verificar en pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/spare-rl/SPADE-Qwen3-30B-A3B-Games
- Dataset de grounding (juegos): https://huggingface.co/datasets/spare-rl/spade-grounding-corpus-games-15k
- Dataset de grounding (tool use): https://huggingface.co/datasets/spare-rl/spade-grounding-corpus-tooluse-15k
- Modelo base Qwen3-30B-A3B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Sparse-RL (ejemplo de entrenamiento): https://github.com/RUCKBReasoning/Sparse-RL/blob/main/slime/docs/en/examples/qwen3-30B-A3B.md
