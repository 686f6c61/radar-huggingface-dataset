# Umang-Bansal/act_so101_pickbox_vr

## Resumen

`Umang-Bansal/act_so101_pickbox_vr` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub mediante la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje, sino de una política visomotora que controla un brazo robótico de tipo `so_follower` (SO-101) a partir de observaciones proprioceptivas y dos cámaras frontales. El autor es Umang-Bansal y la tarea aprendida es concreta: coger un bloque y depositarlo en una caja.

El modelo consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640 (cámara frontal y de muñeca), y produce una acción de 6 dimensiones. Con 51.668.614 parámetros y pesos en formato safetensors, es un modelo compacto que cabe en GPUs de consumo y está pensado para ejecutarse en tiempo real a 30 FPS sobre hardware robótico de bajo coste.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source: entrenamiento por imitación con datos de teleoperación, artefactos estandarizados en el Hub y despliegue reproducible con la CLI de LeRobot. No obstante, es una política de nicho con solo 60 episodios de entrenamiento y sin resultados de evaluación publicados, por lo que debe tratarse como una demostración reproducible más que como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado por observaciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija por paso: estado (6,) e imágenes (3,480,640) x2) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/int8) |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, presentada en el paper arXiv:2304.13705. Se trata de un transformer que, en lugar de predecir una única acción por paso, predice trozos (chunks) de acciones de corta duración, lo que reduce el error de compounding y estabiliza el control. La política está condicionada por el estado proprioceptivo de 6 dimensiones y por dos flujos visuales (cámara frontal y de muñeca) de 480x640, y emite acciones de 6 dimensiones correspondientes a las articulaciones del robot `so_follower`.

El entrenamiento se realizó por imitación supervisada sobre el dataset `Umang-Bansal/so101_pickbox_vr`, compuesto por 60 episodios y 17.182 frames a 30 FPS de teleoperación con la tarea "Pick up the block and place it in the box". La configuración reportada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.6.1. No se documentan fases de RLHF o DPO, ni composición detallada del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (`so_follower`) con 6 grados de acción.
- Percepción multimodal limitada a propriocepción (estado de 6 dimensiones) y visión RGB desde dos cámaras (frontal y muñeca).
- Predicción de chunks de acción, lo que permite ejecutar movimientos coherentes en lugar de pasos aislados.
- Ejecución en tiempo real a 30 FPS, coherente con la frecuencia de captura del dataset de entrenamiento.
- Aprendizaje por imitación a partir de teleoperación, replicable con la CLI `lerobot-train`.
- Despliegue mediante `lerobot-rollout` con la estrategia `base`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo generativo de lenguaje.

## Casos de uso

- Manipulación pick-and-place de laboratorio: recoger un bloque y colocarlo en una caja, que es exactamente la tarea entrenada. Adecuado como banco de pruebas reproducible para validar pipelines de imitación.
- Reproducción de experimentos de imitación: investigadores pueden reentrenar la política con `lerobot-train` sobre el dataset de 60 episodios y comparar configuraciones (pasos, batch, learning rate) con una línea base conocida.
- Docencia y formación en robótica: el modelo y su dataset permiten montar una práctica completa de teleoperación, grabación, entrenamiento y despliegue sobre hardware SO-101 de bajo coste.
- Evaluación de infraestructura de inferencia robótica: al tener solo 51,7 M de parámetros, sirve para medir latencia y throughput de `lerobot-rollout` en GPUs de consumo antes de escalar a políticas mayores.
- Pruebas de robustez visual: modificando posiciones de objetos, iluminación o distractores en el entorno real, se puede estudiar la sensibilidad de una política ACT entrenada con datos escasos.
- Base para fine-tuning en tareas similares: al estar publicada con licencia Apache 2.0 y en formato safetensors, puede reutilizarse como inicialización para variantes de pick-and-place con el mismo robot y cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, unos 207 MB en fp32 y unos 103 MB en fp16), la política es muy ligera y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, tarjetas de consumo como RTX 3060, RTX 4060 o RTX 4090 son suficientes, y también GPUs de datacenter (A100, H100) aunque sobredimensionadas.
- Cabe en GPU de consumo: sí, previsiblemente en prácticamente cualquier GPU con al menos unos pocos GB de VRAM; no se documenta un mínimo oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`, `--policy.path=Umang-Bansal/act_so101_pickbox_vr`); entrenamiento con `lerobot-train` y `--policy.type=act`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible; el dataset y el despliegue operan a 30 FPS, pero no se publican medidas de latencia por paso ni de throughput reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Umang-Bansal/act_so101_pickbox_vr | 51.668.614 | Estado (6,) + 2 imagenes 480x640 | Sin evaluacion publicada | apache-2.0 | Hugging Face Hub (LeRobot) |
| Otras politicas ACT en LeRobot Hub | no disponible | no disponible | no disponible | variable | Hugging Face Hub |
| Politicas Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | variable | Hugging Face Hub |
| Politicas VLA tipo pi0 / SmolVLA | no disponible | no disponible | no disponible | variable | Hugging Face Hub |

No se dispone de datos numéricos suficientes para establecer una comparación cuantitativa con alternativas concretas; la comparación anterior es cualitativa y se limita a categorías de políticas disponibles en el ecosistema LeRobot.

## Limitaciones y advertencias

- Entrenada con solo 60 episodios y 17.182 frames: cobertura limitada de posiciones, iluminación y variaciones del entorno, con alto riesgo de sobreajuste al escenario de grabación.
- Sin resultados de evaluación publicados: no hay evidencia documentada de tasa de éxito en robot real, ni en condiciones nominales ni alteradas.
- Tarea única: "Pick up the block and place it in the box"; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia del hardware exacto: robot `so_follower` y cámaras `front` y `wrist` con nombres y calibración específicos; desviaciones de montaje o calibración degradan el rendimiento.
- Sin capacidades de lenguaje, tool calling ni razonamiento: no debe confundirse con un modelo de propósito general.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de acciones incorrectas o inseguras en entornos no controlados; requiere supervisión y paradas de emergencia.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni condiciones adicionales del autor más allá de la licencia estándar.
- Idiomas y sesgos: no disponibles; al no procesar texto, las consideraciones lingüísticas no aplican, pero pueden existir sesgos de datos derivados de la teleoperación de un único operador.
- Para producción: conviene validar con múltiples repeticiones por tarea, medir tasa de éxito y definir protocolos de seguridad antes de cualquier despliegue autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Umang-Bansal/act_so101_pickbox_vr
- Dataset de entrenamiento: https://huggingface.co/datasets/Umang-Bansal/so101_pickbox_vr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Umang-Bansal/so101_pickbox_vr
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
