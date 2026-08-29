# thilakx/slm-rl-colab

## Resumen

thilakx/slm-rl-colab es un adaptador PEFT LoRA desarrollado por thilakx sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct, un modelo de lenguaje causal de 1.2B parámetros. Su propósito es enseñar al modelo a jugar al juego Boxing de Atari dentro del marco SLM-RL (Self-improving Language Model Reinforcement Learning), un gimnasio de juegos en texto para modelos de lenguaje pequeños que aprenden mediante refuerzo.

El adaptador se entrenó con el método reject_sft sobre demostraciones generadas por un profesor DQN (Deep Q-Network), y fue promovido como campeón de primera generación tras mejorar la métrica primaria de -0.6312 a 0.0000, con tasas de invalidez e intervención nulas. Es un artefacto de investigación especializado, no un modelo de propósito general, y su relevancia radica en demostrar cómo un SLM de 1.2B puede aprender políticas de decisión secuencial en entornos de juego mediante RL.

El repositorio tiene un tamaño de 0.0 GB, lo que confirma que solo contiene los pesos del adaptador LoRA en formato safetensors y su configuración PEFT, no el modelo base completo. Se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema Hugging Face Transformers mediante la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | Modelo base: 1.2B; adaptador: no disponible (repo de 0.0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (carga en bf16 o fp32 según dispositivo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango montado sobre LiquidAI/LFM2.5-1.2B-Instruct, un modelo de lenguaje causal de 1.2B parámetros. El entrenamiento se realizó con el método reject_sft (rejection sampling combinado con fine-tuning supervisado) sobre demostraciones de un profesor DQN para el juego Boxing, dentro del pipeline automatizado de SLM-RL que alterna juego, recolección de datos, fine-tuning y re-evaluación.

Las métricas de entrenamiento registradas incluyen 16 prompts, una pérdida de -0.0114, un valor KL de 0.1705 y una recompensa media de 0.21875. La entropía media fue de 2.2766 y la fracción de recompensas con desviación estándar cero fue de 1.0, lo que indica que las recompensas eran constantes en el lote de entrenamiento. El adaptador fue promovido como campeón de generación 1, pasando la métrica primaria de -0.6312 a 0.0000 con tasas de invalidez e intervención nulas.

## Capacidades

- Generación de acciones de juego: el modelo responde con el formato ACTION: <id> para seleccionar movimientos válidos en Boxing (NOOP, UP, etc.).
- Razonamiento secuencial en entornos de texto: aprende a tomar decisiones paso a paso en un entorno parcialmente observable.
- Integración con SLM-RL: puede usarse como punto de partida para evoluciones posteriores (generaciones 2+) en el pipeline de auto-mejora.
- Compatibilidad con transformers y PEFT: se carga como adaptador estándar con subfolder "adapter" y soporta bf16 en GPU y fp32 en CPU.
- No incluye capacidades de vision, audio ni tool calling general: su alcance se limita al entorno de juego Boxing.

## Casos de uso

- Investigación en RL para modelos de lenguaje pequeños: el adaptador sirve como referencia de cómo un SLM de 1.2B puede aprender políticas de juego mediante reject_sft sobre demostraciones de DQN.
- Benchmarking de agentes de juego en texto: puede usarse como baseline para comparar estrategias de RL en el entorno Boxing dentro del framework SLM-RL.
- Evaluación de técnicas de auto-mejora: al ser un campeón promovido, permite estudiar cómo la generación 1 mejora sobre el modelo base en métricas de validez y recompensa.
- Prototipado de pipelines RLHF/RL para SLMs: el flujo de entrenamiento documentado (CLI de SLM-RL) sirve como plantilla para experimentos con otros juegos o entornos.
- Educación en ML: el ejemplo de carga en Python con transformers y PEFT es útil para enseñar cómo aplicar adaptadores LoRA a modelos base en tareas de decisión.
- Desarrollo de agentes conversacionales con acciones restringidas: aunque el alcance es Boxing, la técnica de formatear respuestas como ACTION: <id> puede extrapolarse a otros dominios con vocabularios de acción limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las únicas métricas registradas son las del entrenamiento y evaluación RL del adaptador:

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 8 |
| Tasa de intervencion (eval) | 0.0 |
| Tasa de invalidez (eval) | 0.0 |
| Puntuacion media (eval) | 0.0 |
| Win rate (eval) | 0.0 |
| Metrica primaria (eval) | 0.0 |
| Recompensa media (train) | 0.21875 |
| Perdida (train) | -0.0114 |
| KL (train) | 0.1705 |
| Entropia (train) | 2.2766 |
| Numero de prompts (train) | 16 |

El criterio de promoción fue la mejora de la métrica primaria de -0.6312 a 0.0000, con tasas de invalidez e intervención nulas.

## Requisitos de hardware

- VRAM estimada: el modelo base es de 1.2B parámetros, por lo que en bf16 requiere aproximadamente 2.5-3 GB de VRAM; con el adaptador LoRA el incremento es despreciable. En fp32 serían unos 5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, etc.) es suficiente para inferencia. En CPU también es viable, aunque más lento.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama media e incluso baja.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), compatible con Hugging Face Inference Endpoints; potencialmente vLLM o llama.cpp si se exporta el modelo fusionado.
- Latencia y throughput: no disponibles; al ser un modelo de 1.2B, la latencia esperada en GPU moderna es de decenas de milisegundos por token, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores SLM-RL para el juego Boxing que permitan una comparación directa. La comparación más relevante es con el modelo base sin adaptador:

| Modelo | Base | Tarea | Licencia | Metrica primaria |
|---|---|---|---|---|
| thilakx/slm-rl-colab | LFM2.5-1.2B-Instruct | Boxing (Atari) | Apache 2.0 | 0.0000 (promovido) |
| LFM2.5-1.2B-Instruct (sin adaptador) | - | Chat/instruccion general | No disponible | -0.6312 (antes del adaptador) |

La mejora de -0.6312 a 0.0000 indica que el adaptador corrige comportamientos inválidos o intervenidos del modelo base en el entorno Boxing, aunque la puntuación media sigue siendo 0.0.

## Limitaciones y advertencias

- Alcance muy limitado: el adaptador solo está entrenado para el juego Boxing de Atari; no es un modelo de propósito general y no debe usarse como tal.
- Datos de evaluación escasos: solo 8 episodios de evaluación, lo que no es estadísticamente significativo para garantizar robustez.
- Puntuacion media de 0.0: aunque la métrica primaria mejoró, el modelo no obtiene recompensas positivas en el juego; la mejora es sobre todo en validez de acciones y reducción de intervenciones.
- Fecha de creación futura (2026-08-29): el modelo tiene una fecha de creación en el futuro, lo que puede indicar un error de metadatos o un artefacto experimental.
- Sin datos de idiomas: la model card no especifica los idiomas soportados, aunque al derivar de un modelo instruct probablemente herede sus capacidades.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval u otros benchmarks que permitan evaluar capacidades generales.
- Dependencia del framework SLM-RL: el uso previsto requiere el CLI de SLM-RL y el dataset asociado (thilakx/slm-rl-colab-data); sin ellos, el adaptador tiene poco valor práctico.
- Riesgo de alucinación en acciones: aunque la tasa de invalidez es 0.0 en evaluación, con solo 8 episodios no se puede descartar que el modelo genere acciones fuera del vocabulario permitido en otros contextos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/thilakx/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/thilakx/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Repositorio espejo (usuario alternativo): https://huggingface.co/Thilakrayapan/slm-rl-colab
