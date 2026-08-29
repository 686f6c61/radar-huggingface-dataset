# Thilakrayapan/slm-rl-colab

## Resumen

Thilakrayapan/slm-rl-colab es un adaptador PEFT LoRA desarrollado por Thilakrayapan que sirve como punto de partida (warm-start) para que el modelo base LiquidAI/LFM2.5-1.2B-Instruct aprenda a jugar al juego Boxing de Atari dentro del framework SLM-RL (Self-improving game gymnasium for Small Language Models). El adaptador se entrena mediante la tecnica `reject_sft` sobre demostraciones generadas por un profesor DQN, y se integra en un bucle de mejora automatica donde el modelo juega, recopila sus propias decisiones en un dataset reutilizable, se ajusta finamente y vuelve a jugar con mejores prestaciones.

La relevancia de este modelo radica en que demuestra un enfoque practico para aplicar aprendizaje por refuerzo a modelos de lenguaje pequenos (SLM) en entornos de juego textuales, sin necesidad de infraestructura masiva. El adaptador fue promovido en el pipeline de SLM-RL (primary de -0.5000 a 0.0000, con tasa de acciones invalidas e intervenciones nulas), lo que indica que supero el umbral de calidad del framework. Es un artefacto de investigacion, no un modelo de proposito general, y su tamano es minimo al tratarse de un adaptador LoRA sobre un modelo base de 1.2 mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LiquidAI/LFM2.5-1.2B-Instruct (transformer) |
| Parametros totales | no disponible (adaptador LoRA; modelo base: 1.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | PEFT adapter (safetensors) en subcarpeta `adapter/` |

## Arquitectura y entrenamiento

El adaptador se entrena con la tecnica `reject_sft` (rejection sampling seguido de fine-tuning supervisado) sobre demostraciones generadas por un profesor DQN en el entorno de juego Boxing. El entrenamiento se realiza dentro del framework SLM-RL, que implementa un bucle de auto-mejora: el modelo juega en entornos textuales, cada decision se recopila en un dataset, el modelo se ajusta automaticamente sobre su propia experiencia y la version mejorada vuelve a jugar. Las metricas de entrenamiento registradas incluyen 16 prompts, una perdida de -0.021, un KL de 0.253, una recompensa media de 0.25 y una entropia de 2.63. En evaluacion, el modelo registro 8 episodios con tasa de intervencion nula, tasa de acciones invalidas nula y una puntuacion primaria de 0.0, siendo promovido al superar el umbral del framework.

## Capacidades

- Generacion de acciones de juego en formato textual: el modelo responde con identificadores de accion (p. ej., `ACTION: <id>`) para el juego Boxing de Atari.
- Juego en entornos textuales: integrado en el gymnasium de SLM-RL, donde los estados del juego se representan como texto.
- Aprendizaje por refuerzo auto-mejorado: participa en un bucle de evolucion donde sus propias decisiones alimentan el dataset de entrenamiento de la siguiente generacion.
- Compatibilidad con el ecosistema PEFT: se carga con `transformers` + `peft` sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct.
- Soporte de chat template: utiliza el formato de mensajes del modelo base (system, user) para estructurar las instrucciones de juego.
- Inferencia determinista: configurado para generacion con `do_sample=False`, lo que permite reproducibilidad en las partidas.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para SLM: el adaptador sirve como punto de partida para estudiar como modelos de lenguaje pequenos aprenden politicas de juego mediante RL, permitiendo reproducir el experimento completo con el CLI de SLM-RL (`slm-rl evolve --game boxing`).
- Benchmarking de tecnicas de post-entrenamiento: al estar entrenado con `reject_sft`, puede compararse contra adaptadores entrenados con otras tecnicas (DPO, PPO, etc.) dentro del mismo framework para evaluar cual produce mejores politicas de juego.
- Desarrollo de agentes auto-mejorados: el bucle de SLM-RL (jugar, recopilar, entrenar, re-jugar) puede aplicarse a otros dominios mas alla de Atari, y este adaptador documenta un caso de exito completo con metricas de entrenamiento y evaluacion.
- Educacion y experimentacion en RLHF/RL: al ser un adaptador pequeno sobre un modelo de 1.2B, es viable ejecutar el pipeline completo en un Colab o una GPU de consumo, lo que lo hace accesible para cursos y talleres.
- Validacion de pipelines de entrenamiento: el repositorio incluye instrucciones de instalacion y carga con `transformers` + `peft`, lo que permite verificar rapidamente que el adaptador se integra correctamente con el modelo base antes de escalar a experimentos mayores.
- Reproducibilidad de experimentos cientificos: las metricas de entrenamiento y evaluacion estan publicadas en la model card, lo que permite comparar resultados y verificar la promocion del adaptador en el pipeline de SLM-RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El repositorio solo incluye metricas de entrenamiento y evaluacion especificas del entorno SLM-RL:

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 8 |
| Tasa de intervencion | 0.0 |
| Tasa de acciones invalidas | 0.0 |
| Puntuacion primaria (eval) | 0.0 |
| Win rate | 0.0 |
| Recompensa media (train) | 0.25 |
| Perdida (train) | -0.021 |
| KL (train) | 0.253 |
| Entropia (train) | 2.63 |
| Promovido | true (primary -0.5000 -> 0.0000) |

## Requisitos de hardware

- VRAM estimada: al tratarse de un adaptador LoRA sobre un modelo de 1.2B, la inferencia requiere aproximadamente 3-4 GB de VRAM en precision bf16, y menos de 2 GB con cuantizacion del modelo base.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente. Tambien es viable en Apple Silicon via MPS y en CPU con precision fp32.
- Opciones de despliegue: el adaptador se carga con `transformers` + `peft`; el modelo base puede servirse con vLLM, llama.cpp u Ollama, aplicando el adaptador LoRA sobre el.
- Latencia y throughput: no disponibles en la informacion proporcionada, pero al ser un modelo de 1.2B con generacion de maximo 24 tokens, la latencia por accion es del orden de decenas de milisegundos en GPU moderna.
- Entrenamiento: el pipeline SLM-RL completo (juego + fine-tuning) puede ejecutarse en un Google Colab con GPU T4, segun el nombre del repositorio y el contexto del framework.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros adaptadores SLM-RL o modelos de juego similares. El ecosistema SLM-RL incluye adaptadores para otros juegos de Atari (p. ej., Pong, Breakout) y otras tecnicas de entrenamiento, pero no se han publicado datos comparativos en la informacion disponible. Como referencia estructural:

| Modelo | Tamano base | Tecnica de entrenamiento | Juego | Licencia |
|---|---|---|---|---|
| Thilakrayapan/slm-rl-colab | 1.2B (LFM2.5) | reject_sft sobre demos DQN | Boxing | apache-2.0 |
| Otros adaptadores SLM-RL | variable | variable (DPO, PPO, etc.) | variable | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigacion especifico para el juego Boxing de Atari; no es un modelo de proposito general y no debe usarse para tareas de generacion de texto, razonamiento o codigo.
- Las metricas de evaluacion muestran una puntuacion primaria de 0.0 y un win rate de 0.0 en los 8 episodios registrados, lo que indica que el adaptador no demuestra una politica de juego ganadora, solo una mejora respecto al punto de partida (-0.5).
- El adaptador depende completamente del modelo base LiquidAI/LFM2.5-1.2B-Instruct; si el modelo base se actualiza o elimina, el adaptador puede dejar de funcionar.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma, al ser un modelo especializado en un dominio muy restringido.
- La licencia apache-2.0 permite uso comercial, pero el valor practico fuera del contexto de investigacion en RL es limitado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente o poco validado por la comunidad.
- Para produccion, se requiere validar el comportamiento del adaptador en el entorno real de juego, ya que las metricas publicadas son de un unico ciclo de evaluacion con 8 episodios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thilakrayapan/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/Thilakrayapan/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
