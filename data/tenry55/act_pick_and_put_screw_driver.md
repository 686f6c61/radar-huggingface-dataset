# Tenry55/act_Pick_and_put_screw_driver

## Resumen

`Tenry55/act_Pick_and_put_screw_driver` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) y distribuida a través del ecosistema LeRobot de Hugging Face. Se trata de un modelo de aprendizaje por imitación que, en lugar de predecir una única acción por paso de control, genera fragmentos cortos de acciones (action chunks), lo que según la documentación del método se traduce habitualmente en tasas de éxito elevadas en tareas de manipulación. El repositorio lo publica el usuario Tenry55 y está asociado al dataset de teleoperación `Tenry55/Pick_and_put_screw_driver_20260924_161516`, del que se ha aprendido la tarea de coger y colocar un destornillador.

El modelo no es un modelo de lenguaje ni un sistema multimodal de propósito general: es un checkpoint de control motor de 51.668.614 parámetros (unos 51,7 millones, aproximadamente 0,2 GB en safetensors), con licencia Apache 2.0 y pipeline declarado como `robotics`. Su relevancia es práctica para quien trabaja en robótica de bajo coste: permite reproducir de extremo a extremo el flujo de LeRobot (entrenamiento desde cero, evaluación en robot real, publicación en el Hub) sin depender de infraestructura propietaria.

La model card es minimalista y no documenta composición del dataset, hiperparámetros, número de episodios ni métricas de éxito, por lo que buena parte de los apartados siguientes quedan marcados como «no disponible». El repositorio, además, presenta 0 descargas y 0 «likes» en el momento de la consulta, lo que indica que se trata de una publicación reciente y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación basada en transformer; detalles internos (encoder/decoder, componentes auxiliares) no disponibles en la model card |
| Parametros totales | 51.668.614 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control robótico, no modelo de lenguaje); no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin variantes cuantizadas documentadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,2 GB) |

Otros metadatos del repositorio: `library_name: lerobot`, `pipeline_tag: robotics`, tags `act`, `robotics`, `lerobot`, `arxiv:2304.13705`, `region:us`; dataset asociado `Tenry55/Pick_and_put_screw_driver_20260924_161516`; creado el 2026-09-24 y actualizado el mismo día.

## Arquitectura y entrenamiento

La model card indica únicamente que ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, que aprende a partir de datos teleoperados y que suele alcanzar tasas de éxito altas. La política se ha entrenado y publicado con LeRobot, y el enlace al paper referenciado en los tags es arXiv 2304.13705. No se detalla en la información proporcionada la arquitectura interna exacta (número de capas, dimensión de los embeddings, mecanismo de generación de los chunks), ni la composición del dataset, ni si se aplicaron fases de ajuste posteriores como RLHF o DPO (no aplicables habitualmente en este tipo de políticas, pero no confirmado en la documentación).

El flujo de trabajo documentado por el autor es el estándar de LeRobot. El entrenamiento desde cero se lanza con `lerobot-train`, especificando `--dataset.repo_id`, `--policy.type=act`, `--policy.device=cuda`, un `--output_dir`/`--policy.repo_id` de salida y, opcionalmente, `--wandb.enable=true`; los checkpoints se escriben en `outputs/train/<policy_repo_id>/checkpoints/`. La evaluación o inferencia se realiza con `lerobot-record`, indicando el tipo de robot (en el ejemplo, `so100_follower`), un dataset de evaluación con prefijo `eval_`, el parámetro `--policy.path` apuntando al checkpoint local o del Hub y el número de episodios (`--episodes=10`).

No se documenta ninguna innovación técnica adicional, decodificación especulativa ni variante de atención en la información disponible.

## Capacidades

- Generación de comandos de control motor para manipulación robótica: la política produce chunks de acciones a partir de observaciones, en lugar de una acción por paso.
- Aprendizaje por imitación a partir de datos teleoperados: el comportamiento queda determinado por el dataset de entrenamiento asociado.
- Ejecución de la tarea concreta «coger y colocar un destornillador» (pick and put screw driver), tal como se deduce del nombre del modelo y del dataset.
- Integración con el ecosistema LeRobot: entrenamiento, checkpoints, publicación en el Hub y scripts de evaluación compatibles.
- Compatibilidad declarada con el robot de ejemplo `so100_follower` en el comando de evaluación de la model card.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo «thinking», visión, audio): no aplica; la percepción depende de las observaciones que reciba la política, no documentadas en detalle.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje: el modelo puede reutilizarse como punto de partida para tareas de recogida y colocación de objetos sobre una bancada, ajustando el dataset de entrenamiento a las nuevas piezas y posiciones.
- Manipulación de herramientas manuales en ensamblaje: el caso concreto del destornillador es representativo de tareas donde el robot debe tomar una herramienta de una posición conocida y depositarla en otra, algo habitual en puestos de montaje electrónico.
- Prototipado con robots de bajo coste: dado que el flujo de LeRobot admite el tipo `so100_follower`, resulta adecuado para plataformas de brazos económicos en laboratorios y aulas, donde el coste del hardware es la restricción principal.
- Generación de datos y reentrenamiento propio: el repositorio sirve como referencia para replicar el pipeline completo (teleoperar, entrenar con `lerobot-train`, evaluar con `lerobot-record`) y producir políticas propias para tareas equivalentes.
- Investigación en aprendizaje por imitación: permite reproducir y comparar el comportamiento de ACT frente a otras familias de políticas soportadas por LeRobot sobre una misma tarea y un mismo conjunto de datos.
- Validación de infraestructura de inferencia en robótica: con 51,7 millones de parámetros y un repo de 0,2 GB, es un candidato cómodo para probar cadenas de despliegue, control de latencia y ciclos de evaluación en robot real sin requisitos de cómputo elevados.
- Formación y docencia en robótica: sirve como ejemplo didáctico de una política entrenada de principio a fin y publicada en el Hub, con comandos reproducibles en la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, curvas de entrenamiento ni comparaciones cuantitativas con otras políticas. Tampoco se aportan métricas de latencia, frecuencia de control o robustez ante variaciones de posición de los objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16/bf16 (cálculo derivado del número de parámetros, no publicado por el autor). El consumo total depende del tamaño de lote y del resto del pipeline de percepción, que no está documentado.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente en principio; el comando de ejemplo usa `--policy.device=cuda` sin especificar modelo. No se documentan GPU concretas (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? Sí, por tamaño de parámetros el checkpoint es holgadamente compatible con GPUs de consumo; no se especifica ninguna en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para evaluación/inferencia) sobre PyTorch con CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a una política de control de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. La única referencia cuantitativa verificable es el número de parámetros del propio checkpoint. A modo de contexto, la propia documentación de LeRobot permite entrenar otras familias de políticas sobre el mismo dataset, pero no se aportan cifras de rendimiento que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_Pick_and_put_screw_driver (este modelo) | 51.668.614 | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas / 0 likes |
| Otras politicas entrenadas con ACT en LeRobot | no disponible | no aplica | no disponible | no disponible | no disponible |
| Otras familias de politica soportadas por LeRobot (p. ej. diffusion) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta caracterización de sesgos ni análisis de comportamiento fuera de distribución.
- Riesgo de alucinación: no aplica en el sentido habitual (no es un modelo generativo de lenguaje), pero sí existe riesgo de generalización incorrecta: una política de imitación puede producir acciones erróneas ante objetos, iluminación, posiciones o robots distintos de los vistos en el dataset de entrenamiento.
- Limitaciones de contexto o idioma: no aplica por tratarse de una política de control; la «ventana» relevante es la historia de observaciones que consuma la implementación de ACT en LeRobot, no documentada aquí.
- Especificidad de la tarea: el modelo está entrenado para una tarea concreta de coger y colocar un destornillador; su uso fuera de ese escenario requiere reentrenamiento.
- Dependencia del hardware: el único robot mencionado en la model card es `so100_follower` en el ejemplo de evaluación; no se garantiza compatibilidad con otras plataformas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y copyright; no se especifican restricciones adicionales.
- Falta de validación externa: 0 descargas y 0 «likes», sin métricas publicadas, por lo que no hay evidencia independiente de su rendimiento real.
- Ausencia de documentación: no se detallan datos de entrenamiento (número de episodios, duración, variabilidad), hiperparámetros ni procedimiento de evaluación, lo que dificulta la reproducibilidad.
- Caveat para producción: antes de desplegarlo en un entorno real debe validarse con el protocolo `lerobot-record` sobre el robot objetivo, con un número suficiente de episodios y con condiciones de seguridad para el operario y el equipamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tenry55/act_Pick_and_put_screw_driver
- Dataset asociado: https://huggingface.co/datasets/Tenry55/Pick_and_put_screw_driver_20260924_161516
- Paper referenciado en los tags (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos correspondían a listados de bases de la Royal Air Force y no guardan relación con el contenido de esta ficha.
