# TUpreneur/connectailab-rl-tupreneur-v2-humanoid-ppo

## Resumen

connectailab-rl-tupreneur-v2-humanoid-ppo es una política de control entrenada con aprendizaje por refuerzo (PPO) para el entorno Humanoid-v5 de MuJoCo y Gymnasium. El modelo lo publica TUpreneur en el marco del programa CONNECT AI LAB y resuelve la tarea de locomoción bípeda: aprender a mantenerse en pie y desplazarse hacia delante controlando los 17 actuadores de un humanoide simulado. No es un modelo de lenguaje ni un transformer generativo, sino una red neuronal pequeña que mapea un vector de observación de 348 dimensiones a 17 pares de torques articulares.

La relevancia del artefacto es doble. Por un lado, documenta de forma explícita la configuración de entrenamiento completa (2,5 millones de pasos, 16 entornos en paralelo, n_steps 512, batch 128, 10 épocas, red oculta de 256 unidades, learning rate con decaimiento lineal de 3e-4 a 1e-5, gamma 0,999, GAE lambda 0,95 y clip 0,2), lo que lo convierte en una referencia reproducible para quien quiera replicar o afinar un baseline de PPO en Humanoid-v5. Por otro, incluye los pesos de la política (`humanoid_ppo_model.pt`), las estadísticas de normalización de observaciones (`humanoid_obs_rms.pt`) y un vídeo de replay, es decir, todo lo necesario para ejecutar la política sin reentrenar.

El modelo declara una recompensa media por episodio de 5944,9 puntos, una supervivencia media de 15,00 segundos (1000 pasos sobre un máximo de 1000), una velocidad de avance de 0,95 m/s (3,4 km/h) y una distancia recorrida de 14,3 m por episodio. La versión v2 se etiqueta como "Fall-proof cruise walking & balanced stance", esto es, marcha estable con postura equilibrada y resistencia a caídas. No se dispone de información sobre licencia, idiomas ni tamaño del repositorio (0,0 GB declarados).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal densa (MLP actor-crítico) entrenada con PPO; observación 348 dim, acción 17 dim (torques en [-0,4, 0,4]), capa oculta 256 |
| Parámetros totales | no disponible (la model card indica hidden: 256, sin recuento explícito) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin ventana de contexto) |
| Tipos de cuantización | no disponible (pesos en PyTorch, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `humanoid_ppo_model.pt`, `humanoid_obs_rms.pt` |

## Arquitectura y entrenamiento

La política es una red densa de tipo actor-crítico con una capa oculta de 256 unidades, entrenada con Proximal Policy Optimization sobre el entorno Humanoid-v5 de MuJoCo/Gymnasium. La observación tiene 348 dimensiones (posición y velocidad de las articulaciones, orientación del torso, contactos, etc.) y la acción son 17 torques articulares acotados al intervalo [-0,4, 0,4]. El entrenamiento se ejecutó durante 2.500.000 pasos con 16 entornos en paralelo, n_steps de 512, batch de 128, 10 épocas por actualización, learning rate inicial de 3e-4 con decaimiento lineal hasta 1e-5, gamma de 0,999, GAE lambda de 0,95 y clipping de 0,2. La model card no detalla la composición del dataset (no aplica: es RL on-policy en simulador) ni menciona fases de RLHF o DPO.

La innovación declarada de la versión v2 es el objetivo de "Fall-proof cruise walking & balanced stance": el currículo de entrenamiento y la configuración buscan una marcha sostenida y una postura equilibrada que evite caídas durante el episodio completo de 1000 pasos. El repositorio incluye además las estadísticas de normalización de observaciones (`humanoid_obs_rms.pt`), imprescindibles para reproducir la inferencia con la misma distribución de entrada que en entrenamiento. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o destilación, que no aplican a este tipo de política.

## Capacidades

- Control de locomoción bípeda en MuJoCo Humanoid-v5: genera torques articulares a partir de observaciones de 348 dimensiones.
- Marcha hacia delante sostenida a ~0,95 m/s con supervivencia declarada de 15,00 s (1000 pasos).
- Postura equilibrada y resistencia a caídas según la etiqueta de la versión v2.
- Inferencia determinista o estocástica según se use la media o el muestreo de la política.
- Reproducibilidad: incluye pesos de política y estadísticas de normalización de observaciones.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.
- No dispone de modo "thinking" ni razonamiento simbólico.

## Casos de uso

- Baseline de referencia para PPO en Humanoid-v5: sirve para comparar nuevas variantes de PPO, SAC o TD3 contra una configuración documentada paso a paso (2,5 M de pasos, 16 entornos, lr 3e-4→1e-5) y verificar mejoras de recompensa y velocidad.
- Investigación en locomoción bípeda: permite estudiar la estabilidad de la marcha y la resistencia a caídas analizando el replay y las trayectorias generadas sin reentrenar desde cero.
- Docencia y formación en RL: el paquete completo (política, normalizador y vídeo) es material listo para una práctica de laboratorio sobre PPO y entornos MuJoCo.
- Ajuste fino con transferencia: se puede inicializar una política desde estos pesos y afinar para variantes del entorno (terrenos irregulares, perturbaciones externas) reduciendo el coste de entrenamiento.
- Evaluación de robustez: la política permite medir sensibilidad a ruido en observaciones o a cambios en los límites de torque, útil para estudios de sim-to-real antes de transferir a un robot físico.
- Integración en pipelines de simulación: se puede cargar en scripts de Gymnasium/MuJoCo para generar datos de demostración o validar controladores alternativos en un entorno estandarizado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`), evaluados sobre Humanoid-v5:

| Métrica | Valor |
|---|---|
| Recompensa media por episodio | 5944,9 |
| Tiempo medio de supervivencia | 15,00 s (1000 pasos sobre 1000) |
| Velocidad media de avance | 0,95 m/s (3,4 km/h) |
| Distancia media por episodio | 14,3 m |

No se han publicado en la información disponible resultados comparativos con otras políticas en Humanoid-v5 (por ejemplo, baselines de Stable-Baselines3 o CleanRL), por lo que no es posible contextualizar estas cifras frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, del orden de decenas de megabytes; la política es una MLP pequeña con capa oculta de 256 unidades y entrada de 348 dimensiones.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en CPU sin penalización apreciable para inferencia por paso.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en equipos sin GPU dedicada.
- Despliegue: PyTorch nativo cargando `humanoid_ppo_model.pt` y `humanoid_obs_rms.pt`; requiere MuJoCo y Gymnasium para el entorno Humanoid-v5. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el cuello de botella real será la simulación física de MuJoCo, no la inferencia de la red.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables publicadas con métricas en Humanoid-v5 en la documentación facilitada, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, los baselines habituales de la comunidad son las implementaciones de PPO de Stable-Baselines3 y CleanRL sobre el mismo entorno, pero no se aportan sus cifras en esta ficha para no inventar datos.

| Modelo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-tupreneur-v2-humanoid-ppo | Humanoid-v5 | no disponible | no aplica | no disponible | Hugging Face |
| Baseline PPO (Stable-Baselines3) | Humanoid-v5 | no disponible | no aplica | MIT (según librería) | Código abierto |
| Baseline PPO (CleanRL) | Humanoid-v5 | no disponible | no aplica | MIT (según repositorio) | Código abierto |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada en simulador, hereda las simplificaciones físicas de MuJoCo Humanoid-v5.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la política puede producir acciones fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de utilizarlo en producción.
- Caveat para producción: los resultados (recompensa 5944,9, supervivencia 15,00 s, velocidad 0,95 m/s) están declarados por el autor y marcados como no verificados; deben reproducirse de forma independiente antes de tomar decisiones.
- La transferencia sim-to-real no está documentada: no hay evidencia de que la política funcione en un robot físico.
- El repositorio declara 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el tamaño es despreciable; verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-humanoid-ppo
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
