# white100big/connectailab-r1-baekahm-humanoid-v1

## Resumen

connectailab-r1-baekahm-humanoid-v1 es un checkpoint de política de aprendizaje por refuerzo (RL) entrenado con PPO sobre el entorno `Humanoid-v5` de Gymnasium (MuJoCo). Lo publica el usuario white100big y no es un modelo de lenguaje: es una política neuronal que mapea observaciones del simulador a acciones de control de un humanoide articulado. El objetivo del autor es documentar el proceso de aprendizaje de la marcha, incluyendo los fallos, y no presentar un agente competente.

El entrenamiento se realizó desde cero con 8 entornos paralelos, un total de 1.499.136 pasos de entorno, red de política y valor con capas ocultas de 256×256, learning rate inicial de 0.0003 con decaimiento lineal, rollout de 256 pasos, minibatch de 256, 10 epochs de actualización por rollout, gamma 0.99, GAE lambda 0.95, clip 0.2 y normalización de observaciones y recompensas. El resultado, según la propia model card, no alcanza una marcha estable: 0 de 10 episodios completan los 1.000 pasos de evaluación.

La relevancia es, por tanto, documental y educativa: sirve como referencia reproducible de un pipeline PPO completo en MuJoCo, con pesos, estadísticas de normalización y script de evaluación incluidos. No debe interpretarse como un modelo listo para producción ni como una política de control robusta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (política y función de valor separadas o compartidas, no especificado) con capas ocultas 256×256; entrenada con PPO |
| Parametros totales | no disponible (no se indica el recuento exacto; depende de la dimensionalidad de observación y acción de `Humanoid-v5`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el horizonte es el episodio de `Humanoid-v5`, hasta 1.000 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `.pt`, no se documentan cuantizaciones) |
| Idiomas soportados | ko (coreano, en la documentación y metadatos) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint con política, red de valor y estadísticas de normalización de observaciones) |

## Arquitectura y entrenamiento

La política es una red neuronal densa con dos capas ocultas de 256 unidades, entrenada con Proximal Policy Optimization (PPO) sobre `Gymnasium Humanoid-v5` en MuJoCo. La observación y la recompensa se normalizan durante el entrenamiento; el checkpoint guarda las estadísticas de normalización de observaciones, pero no el estado del optimizador ni el de normalización de recompensas, por lo que no permite reanudar el entrenamiento de forma exacta.

Hiperparámetros declarados: 8 entornos en paralelo, rollout de 256 pasos, minibatch de 256, 10 epochs de actualización, learning rate 0.0003 con decaimiento lineal, gamma 0.99, GAE lambda 0.95 y clip 0.2. El total de pasos es 1.499.136 (8 entornos × 256 pasos × actualizaciones, con truncamiento del objetivo de 1.500.000). Se trata de una única semilla (seed 0), sin ablaciones ni comparativas de hiperparámetros.

## Capacidades

- Control motor continuo de un humanoide simulado en MuJoCo (`Humanoid-v5`): produce acciones articulares a partir de observaciones del entorno.
- Locomoción básica emergente: en evaluación avanza de media 0.89 m antes de caer o agotar el episodio.
- Supervivencia limitada: media de 151,2 pasos (2,27 s) en 10 episodios con semillas 6000–6009.
- Reproducibilidad del pipeline: incluye script `evaluate_humanoid_walk.py` para reevaluar el checkpoint en modo headless o con renderizado humano.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto; no es un modelo de lenguaje.
- No hay capacidades multilingües más allá de la documentación en coreano.

## Casos de uso

- Docencia de RL: usar el checkpoint y el script de evaluación como ejemplo práctico de un pipeline PPO completo en MuJoCo, mostrando curvas de recompensa y fallos de locomoción.
- Reproducción de experimentos: servir de línea base reproducible (seed 0, hiperparámetros documentados) para comparar variantes de PPO, recompensas o normalizaciones en `Humanoid-v5`.
- Análisis de fallos: estudiar los 10 episodios de evaluación (0/10 completados, 151,2 pasos de media) para diagnosticar modos de colapso típicos en humanoides (caída lateral, deriva, rigidez articular).
- Generación de material divulgativo: el vídeo de 60 s y los logs permiten ilustrar el coste y la dificultad de entrenar locomoción desde cero.
- Pruebas de infraestructura: validar entornos de simulación, dependencias (`gymnasium[mujoco]`, PyTorch) y flujos de evaluación antes de escalar a entrenamientos mayores.
- Investigación sobre estabilidad: punto de partida para aplicar técnicas de regularización, curriculum o reward shaping y medir su efecto frente a esta referencia.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Episodios completados (1.000 pasos) | 0/10 |
| Supervivencia media | 151,2 pasos (2,27 s) |
| Distancia media recorrida | 0,89 m |
| Recompensa de evaluación máxima durante entrenamiento | 914,3 (media de 5 episodios) |
| Pasos totales de entrenamiento | 1.499.136 |

No se han publicado resultados de benchmarks estándar (MuJoCo Leaderboard, comparativas con TQC/SAC) en la información disponible. El autor menciona que una demostración posterior con una política TQC pública no está incluida en estos pesos ni en el vídeo.

## Requisitos de hardware

- VRAM: mínima; la red 256×256 y el simulador MuJoCo caben en menos de 1 GB en la mayoría de configuraciones (no se publica cifra exacta).
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060 o superior) acelera el renderizado y la inferencia; también funciona en CPU para evaluación headless.
- Cabe en GPU consumer: sí, con holgura.
- Despliegue: ejecución directa con PyTorch y `gymnasium[mujoco]` mediante `evaluate_humanoid_walk.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; dependen del paso de simulación MuJoCo y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Rendimiento | Licencia |
|---|---|---|---|---|
| connectailab-r1-baekahm-humanoid-v1 | PPO, MLP 256×256 | Humanoid-v5 | 0/10 episodios completados; 151,2 pasos de media | no disponible |
| Políticas TQC públicas (referencia del autor) | TQC | Humanoid-v5 | no disponible (no se incluyen métricas) | no disponible |
| Políticas de referencia del MuJoCo Leaderboard | SAC/TQC/PPO | Humanoid-v5 | no disponible en esta ficha | variable |

No se dispone de datos comparativos verificables en la información proporcionada; la comparación con alternativas queda como no disponible.

## Limitaciones y advertencias

- No alcanza marcha estable: 0 de 10 episodios completan los 1.000 pasos; la media de supervivencia es de 151,2 pasos.
- Entrenamiento con una única semilla (seed 0); no hay garantía de generalización a otros estados iniciales o variantes del entorno.
- El checkpoint no incluye estado del optimizador ni normalización de recompensas, por lo que no permite reanudar el entrenamiento de forma exacta.
- Solo funciona en `Humanoid-v5` de Gymnasium/MuJoCo; no es transferible a robots reales sin trabajo adicional de sim-to-real.
- Licencia no especificada: riesgo legal para uso comercial o redistribución.
- `torch.load` requiere `weights_only=False`, lo que implica cargar el checkpoint solo desde fuentes de confianza.
- Documentación únicamente en coreano; sin métricas de sesgo ni de robustez más allá de la evaluación citada.
- El vídeo y los resultados corresponden a simulación MuJoCo, no a un robot físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/white100big/connectailab-r1-baekahm-humanoid-v1
- Vídeo de entrenamiento (60 s, MP4): https://huggingface.co/white100big/connectailab-r1-baekahm-humanoid-v1/resolve/main/ppo_training_failures_60s.mp4?download=true
- Gymnasium Humanoid-v5 (documentación): https://gymnasium.farama.org/environments/mujoco/humanoid/
- PPO (paper original): https://arxiv.org/abs/1707.06347
- MuJoCo: https://mujoco.org/
