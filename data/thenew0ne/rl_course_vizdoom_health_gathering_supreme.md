# TheNew0ne/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario TheNew0ne en HuggingFace como parte de un curso de reinforcement learning, y se distribuye con la librería Sample-Factory 2.0. Su propósito es servir como artefacto reproducible de entrenamiento: un checkpoint que puede descargarse, evaluarse con el script `enjoy` y reanudarse con el script `train`.

El modelo resuelve una tarea concreta de control visual en primera persona: el agente debe recoger frascos de salud en un escenario de Doom mientras recibe daño de forma continua, maximizando el tiempo de supervivencia. La observación es visual (píxeles) y las acciones son discretas, lo que lo convierte en un banco de pruebas clásico para algoritmos de RL con entrada de imagen.

Es relevante únicamente en el contexto de investigación y docencia en RL: no es un modelo generativo, no procesa lenguaje natural y no debe evaluarse con los criterios habituales de un LLM. El autor reporta una recompensa media de 12,06 ± 6,20 en el entorno, sin verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente de reinforcement learning con red neuronal convolucional (CNN) para observaciones visuales, entrenado con APPO (Asynchronous Proximal Policy Optimization) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el agente opera sobre observaciones por frame) |
| Tipos de cuantización | no disponible (no aplica a checkpoints de RL en este formato) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample-Factory (no safetensors ni GGUF); repositorio de 0,1 GB |
| Librería | sample-factory |
| Entorno de entrenamiento | doom_health_gathering_supreme (ViZDoom) |
| Algoritmo | APPO |

## Arquitectura y entrenamiento

El agente sigue el esquema estándar de Sample-Factory: una red neuronal profunda que combina un extractor convolucional para las observaciones visuales del entorno ViZDoom con cabezas de política y valor, optimizada mediante APPO. APPO es una variante asíncrona de PPO diseñada para entrenamiento distribuido de alta eficiencia en entornos de RL, con workers que recolectan experiencia en paralelo y un learner central que actualiza los pesos.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del dataset (en RL no hay dataset en el sentido supervisado, sino experiencia generada por interacción con el entorno), hiperparámetros concretos, uso de recompensas conformadas ni detalles sobre la arquitectura exacta de la red. La model card únicamente documenta los comandos de descarga, evaluación y reanudación del entrenamiento, junto con el resultado declarado de recompensa media.

## Capacidades

- Control visual en primera persona: el agente procesa píxeles del entorno Doom y emite acciones discretas (movimiento y disparo) para recoger frascos de salud.
- Supervivencia en `doom_health_gathering_supreme`: la tarea consiste en maximizar el tiempo de supervivencia recogiendo ítems de salud mientras se recibe daño continuo.
- Reanudación de entrenamiento: el checkpoint permite continuar el entrenamiento desde el punto en que se guardó mediante `--restart_behavior=resume`.
- Evaluación reproducible: puede ejecutarse con el script `enjoy` de Sample-Factory para medir la recompensa media.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Docencia en reinforcement learning: sirve como ejemplo práctico de un agente APPO entrenado sobre un entorno ViZDoom, útil para que estudiantes comparen resultados y comprendan el flujo de trabajo de Sample-Factory.
- Reproducción de experimentos: el checkpoint permite repetir la evaluación con el script `enjoy` y verificar la recompensa media reportada de 12,06 ± 6,20.
- Punto de partida para fine-tuning: se puede reanudar el entrenamiento con `--restart_behavior=resume` y ajustar hiperparámetros para estudiar su efecto en la supervivencia.
- Comparación de algoritmos de RL: sirve como línea base APPO frente a otros algoritmos (PPO, SAC, DQN) sobre el mismo entorno de ViZDoom.
- Estudio de robustez visual: al operar sobre píxeles, permite analizar cómo afectan perturbaciones visuales o cambios de textura a la política aprendida.
- Pruebas de infraestructura de entrenamiento distribuido: útil para validar pipelines de Sample-Factory en clústeres con múltiples workers antes de escalar a entornos más costosos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,06 ± 6,20 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un checkpoint pequeño que probablemente cabe en GPU de consumo, aunque no se especifica la arquitectura exacta.
- GPU recomendadas: no disponible en la información proporcionada. Para entrenamiento con Sample-Factory se suele requerir una GPU con soporte CUDA, pero no se detalla el modelo concreto.
- ¿Cabe en GPU de consumo? No confirmado; por el tamaño del repositorio es plausible, pero no hay dato oficial.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), con descarga vía `python -m sample_factory.huggingface.load_from_hub`. No aplica vLLM, llama.cpp ni Ollama, al no ser un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheNew0ne/rl_course_vizdoom_health_gathering_supreme | Agente RL visual | doom_health_gathering_supreme | APPO | no disponible | HuggingFace (0 descargas) |
| Otros checkpoints APPO de Sample-Factory en ViZDoom | Agente RL visual | entornos ViZDoom | APPO | variable | HuggingFace |
| Agentes PPO sobre ViZDoom | Agente RL visual | entornos ViZDoom | PPO | variable | Repositorios académicos |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La comparativa se limita a categoría, algoritmo y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con métricas de LLM (MMLU, HumanEval, GSM8K, etc.).
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Resultado no verificado: la recompensa media de 12,06 ± 6,20 procede de la model card del autor y no ha sido validada de forma independiente.
- Alta varianza: la desviación típica de 6,20 sobre una media de 12,06 indica un rendimiento inestable entre episodios.
- Especificidad total al entorno: la política está entrenada exclusivamente para `doom_health_gathering_supreme` y no generaliza a otras tareas sin reentrenamiento.
- Sin información sobre sesgos, alucinación o limitaciones de contexto: estos conceptos no aplican a un agente de RL, pero tampoco se documenta el comportamiento del agente en escenarios fuera de distribución.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validación por parte de la comunidad.
- Fecha de creación futura (2026-11-02) en los metadatos: posible inconsistencia en el registro del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheNew0ne/rl_course_vizdoom_health_gathering_supreme
- Repositorio Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con HuggingFace: https://www.samplefactory.dev/10-huggingface/huggingface/
