# spare-rl/SPADE-Qwen3-8B-Games

## Resumen

SPADE-Qwen3-8B-Games es un checkpoint de 8.190.735.360 parámetros (8,19 mil millones) derivado de Qwen/Qwen3-8B mediante el método SPADE (Self-Play with Adaptive Environment Design), desarrollado por el equipo spare-rl. El modelo está especializado en el "setting" de juegos: entornos ejecutables generados y resueltos de forma iterativa. Su publicación en Hugging Face con licencia Apache 2.0 y pesos en safetensors lo hace directamente desplegable en infraestructuras estándar de inferencia.

La innovación central de SPADE es entrenar un único modelo en dos roles complementarios: un Diseñador de Entornos que escribe entornos ejecutables y un Agente Razonador que los resuelve. El Diseñador recibe recompensa por producir entornos en la frontera de lo que el Agente puede resolver en cada momento, de modo que el currículo de entrenamiento se adapta dinámicamente a la política en lugar de fijarse de antemano. Este enfoque de self-play con generación de entornos busca mejorar el razonamiento del modelo sin depender exclusivamente de datasets estáticos.

El modelo hereda la arquitectura y el tokenizador de Qwen3-8B, con una longitud de contexto declarada de 32.768 tokens, y se distribuye con pesos completos (16,4 GB en el repositorio). Es relevante para quienes investigan entrenamiento por refuerzo con auto-juego, generación de entornos y agentes que razonan sobre problemas procedurales, así como para desarrolladores que quieran un modelo de 8B afinado específicamente para tareas de razonamiento lúdico y ejecución de reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only de 8,19 mil millones de parámetros, y se afina mediante SPADE, un procedimiento de self-play con diseño adaptativo de entornos. En este esquema, el mismo modelo actúa como Diseñador (genera entornos ejecutables, en este caso juegos) y como Agente (los resuelve). La señal de recompensa del Diseñador se orienta a mantener los entornos en la frontera de dificultad resoluble por el Agente, lo que produce un currículo que evoluciona con la política. El entrenamiento se enmarca en aprendizaje por refuerzo y se apoya en corpus de "grounding" publicados por el mismo equipo (spade-grounding-corpus-games-15k y spade-grounding-corpus-tooluse-15k).

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO adicionales más allá del bucle de self-play. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal; el modelo conserva el stack de transformers y es compatible con sglang >= 0.4.6.post1 y vllm >= 0.8.5 para servir una API compatible con OpenAI.

## Capacidades

- Generación de texto conversacional con plantilla de chat (apply_chat_template) y soporte de system/user/assistant.
- Razonamiento multi-paso orientado a resolución de problemas y ejecución de reglas.
- Generación de entornos ejecutables (código de juegos) en el rol de Diseñador.
- Resolución de entornos y tareas procedurales en el rol de Agente.
- Entrenamiento específico para el "setting" de juegos; el equipo publica además un corpus de tool use, lo que sugiere capacidades relacionadas con uso de herramientas en el ecosistema SPADE (no confirmadas como capacidades nativas del checkpoint de games).
- Contexto de 32.768 tokens, adecuado para conversaciones y problemas de varios turnos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación en self-play y RL: reproducir el bucle Diseñador/Agente para estudiar cómo evoluciona el currículo; el checkpoint permite arrancar desde una política ya entrenada en el setting de games en lugar de desde Qwen3-8B base.
- Generación automática de entornos de evaluación: usar el rol de Diseñador para producir juegos y puzzles ejecutables que sirvan como tests dinámicos para otros agentes, con dificultad ajustable.
- Agentes que resuelven problemas procedurales: el modelo puede razonar paso a paso sobre reglas, estados y objetivos, útil en simuladores ligeros y entornos tipo grid o puzzle.
- Evaluación de robustez de agentes: emplear el modelo como generador de escenarios adversariales o de dificultad creciente para stress-testing de pipelines de agentes.
- Prototipado de videojuegos y mecánicas: generar código de mecánicas de juego y reglas ejecutables como punto de partida para diseñadores humanos.
- Benchmarking de razonamiento en dominios lúdicos: comparar la política SPADE frente a Qwen3-8B base en tareas de juegos para medir la ganancia del entrenamiento por self-play.
- Servicio de inferencia interno: desplegar con vLLM o SGLang (contexto 32.768) para experimentos de investigación con API compatible con OpenAI, con temperature=0.6, top_p=0.95, top_k=20, min_p=0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más para contexto completo.
- Cuantización: no se publican variantes oficiales; una cuantización a 8 bits reduciría los pesos a ~8 GB y a 4 bits a ~4-5 GB, aunque dichas conversiones no están verificadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S para contexto completo y throughput alto; RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contexto reducido.
- GPU de consumo: cabe en RTX 4090 y potencialmente en GPUs de 16 GB solo con cuantización, no verificada oficialmente.
- Despliegue: transformers (recomendado última versión), vLLM >= 0.8.5, SGLang >= 0.4.6.post1; el autor advierte reducir la longitud de contexto si aparecen OOM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPADE-Qwen3-8B-Games | 8,19 B | 32.768 | Self-play, generación de entornos de juegos | Apache 2.0 | Hugging Face (spare-rl) |
| Qwen/Qwen3-8B | 8,19 B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 (según model card del base) | Hugging Face |
| Alternativas de 8B para razonamiento/agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de rendimiento frente a Qwen3-8B u otros modelos de 8B no está disponible: no se han publicado benchmarks en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este checkpoint; el riesgo de alucinación es el propio de un modelo de 8B y debe mitigarse con verificación externa.
- El modelo está afinado para el setting de "games"; su rendimiento fuera de ese dominio (atención al cliente, código de producción general, etc.) no está validado y podría degradarse respecto a Qwen3-8B base.
- Idiomas soportados no declarados: no se garantiza un comportamiento multilingüe equilibrado.
- El contexto declarado es de 32.768 tokens; superarlo o acercarse al límite puede provocar OOM o degradación, y el autor sugiere reducirlo en caso de problemas de memoria.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3-8B; conviene revisar la model card del base por si hubiera condiciones adicionales.
- Es un checkpoint de investigación con 259 descargas y 1 "like" en el momento de la consulta: no hay evidencia de uso en producción ni de soporte mantenido.
- No se publican variantes cuantizadas oficiales; cualquier cuantización a GGUF/AWQ/GPTQ sería no verificada por el autor.
- El paper referenciado (arXiv:2608.19197) debe consultarse para entender el protocolo de entrenamiento y sus posibles sesgos de currículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spare-rl/SPADE-Qwen3-8B-Games
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://arxiv.org/abs/2608.19197
- Corpus de grounding (games): https://huggingface.co/datasets/spade-rl/spade-grounding-corpus-games-15k
- Corpus de grounding (tool use): https://huggingface.co/datasets/spade-rl/spade-grounding-corpus-tooluse-15k
- Organización spare-rl: https://huggingface.co/spade-rl
