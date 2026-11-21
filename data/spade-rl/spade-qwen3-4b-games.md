# spade-rl/SPADE-Qwen3-4B-Games

## Resumen

SPADE-Qwen3-4B-Games es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el equipo spade-rl, entrenado con la metodología SPADE (self-play con diseño de entornos generados por el propio modelo). El modelo resuelve un problema concreto del aprendizaje por refuerzo: en lugar de depender de un currículo de tareas fijado de antemano, el propio modelo actúa simultáneamente como disenador de entornos y como agente resolutor, de modo que el currículo se adapta dinámicamente a la capacidad actual de la política.

Esta variante concreta está especializada en el dominio de juegos (setting "games"), lo que la orienta a tareas de razonamiento estructurado, resolución de problemas con reglas y generación de entornos ejecutables. El modelo conserva la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros totales y una longitud de contexto declarada de 262.144 tokens, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de investigación.

Su relevancia actual radica en que ejemplifica una línea de trabajo emergente: el uso de self-play con generación automática de entornos como mecanismo de escalado del razonamiento, en lugar de depender exclusivamente de datos humanos anotados. Con 1.050 descargas y formato safetensors compatible con transformers, TGI, SGLang y vLLM, es un checkpoint práctico para experimentar con entrenamiento por refuerzo auto-curriculado sobre una base de 4B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros con atención estándar y ventana de contexto nativa de 262.144 tokens. Sobre esa base, spade-rl aplica el esquema SPADE: un único modelo desempeña dos roles, Environment Designer (que escribe entornos ejecutables) y Reasoning Agent (que los resuelve). El Designer recibe recompensa por generar entornos situados en la frontera de lo que el Agent puede resolver en ese momento, lo que produce un currículo que avanza al ritmo de la política en lugar de estar prefijado.

El entrenamiento se realiza mediante aprendizaje por refuerzo con self-play, apoyado en corpus de anclaje (grounding corpora) publicados por el mismo equipo: un corpus de juegos de 15.000 ejemplos y otro de uso de herramientas de 15.000 ejemplos. La model card no detalla el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases adicionales de RLHF o DPO más allá del bucle de self-play descrito. Tampoco se especifican innovaciones de inferencia como decodificación especulativa o atención lineal; el modelo hereda las características del Qwen3 base.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento multi-paso orientado a resolución de problemas con reglas (dominio de juegos).
- Generación de entornos ejecutables: el rol de Environment Designer produce especificaciones de entorno que el propio agente puede resolver.
- Self-play y auto-curriculum: capacidad entrenada explícitamente para generar tareas al nivel de dificultad adecuado.
- Soporte de contexto largo de hasta 262.144 tokens, útil para trayectorias de agente extensas o entornos con mucho estado.
- Compatibilidad con tool calling y function calling heredada de Qwen3-4B-Instruct-2507 (la model card no documenta un esquema específico de herramientas para este checkpoint).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada; se heredan las del modelo base, pero no se documentan.
- No se declaran capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación en RL con self-play: usar el checkpoint como punto de partida para reproducir o extender el bucle SPADE, empleando el rol de Designer para generar entornos de entrenamiento y el de Agent para resolverlos, con evaluación de la dificultad alcanzada.
- Generación automática de entornos de evaluación: el modelo puede redactar entornos ejecutables y verificables para bancos de pruebas internos, reduciendo el coste de anotación manual en dominios con reglas claras.
- Agentes de resolución de juegos y puzles: integrado en un bucle de agente con herramientas, el modelo puede abordar tareas de planificación con estado y reglas, aprovechando su contexto de 262.144 tokens para mantener trayectorias largas.
- Currículo adaptativo en pipelines de entrenamiento: el rol de Designer permite generar tareas calibradas a la capacidad actual de un agente estudiante, útil para entrenar modelos más pequeños con datos sintéticos de dificultad progresiva.
- Evaluación de robustez en razonamiento estructurado: al estar especializado en juegos, sirve como sonda para medir hasta dónde llega un modelo de 4B en tareas de reglas frente a modelos mayores.
- Despliegue en investigación con API compatible OpenAI: mediante SGLang o vLLM se puede exponer un endpoint para experimentos de generación de entornos y resolución en lote, con control de la longitud de contexto según la VRAM disponible.
- Generación de datos sintéticos para fine-tuning: los entornos y soluciones producidos pueden filtrarse y reutilizarse como corpus de entrenamiento para otros modelos del mismo dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8 GB solo para pesos (4.022 millones de parámetros), más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- Contexto completo de 262.144 tokens: la caché KV crece de forma lineal con la longitud; se recomienda hardware con 80 GB o más (A100/H100) o reducir el contexto, tal como advierte la propia model card (sugiere bajar a 32.768 tokens si hay OOM).
- GPU consumer: cabe en RTX 4090 (24 GB) y en GPUs de 16 GB con cuantización, aunque la model card no publica variantes cuantizadas oficiales; sería necesario generarlas.
- Opciones de despliegue: transformers (recomendado con la última versión), SGLang >= 0.4.6.post1, vLLM >= 0.8.5 y text-generation-inference (tag `text-generation-inference` en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados: temperature=0.7, top_p=0.8, top_k=20, min_p=0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPADE-Qwen3-4B-Games | 4,02B | 262.144 | Self-play RL, juegos | Apache 2.0 | Hugging Face (spade-rl) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B (aprox.) | 262.144 | Instrucciones generales | Apache 2.0 | Hugging Face |
| Alternativas de RL con self-play de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros checkpoints de RL auto-curriculado de 4B no está disponible en la información proporcionada; el referente inmediato y verificable es el modelo base Qwen3-4B-Instruct-2507, del que hereda arquitectura, contexto y licencia.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado al dominio de juegos; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir entornos o soluciones plausibles pero incorrectas; en el rol de Designer es necesario validar la ejecutabilidad de los entornos generados.
- Idiomas: no se documentan los idiomas soportados en la información disponible; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- Sesgos: no se documentan evaluaciones de sesgo ni filtros de seguridad específicos para este checkpoint.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-4B-Instruct-2507 y citar el paper asociado.
- Contexto largo: el uso de 262.144 tokens exige mucha memoria; la propia model card advierte de OOM y sugiere reducir a 32.768 tokens.
- Madurez: con 1.050 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación con validación comunitaria limitada; no hay benchmarks publicados que respalden afirmaciones de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spade-rl/SPADE-Qwen3-4B-Games
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper: https://arxiv.org/abs/2608.19197
- Corpus de anclaje (juegos): https://huggingface.co/datasets/spade-rl/spade-grounding-corpus-games-15k
- Corpus de anclaje (uso de herramientas): https://huggingface.co/datasets/spade-rl/spade-grounding-corpus-tooluse-15k
- Organización spade-rl: https://huggingface.co/spade-rl
