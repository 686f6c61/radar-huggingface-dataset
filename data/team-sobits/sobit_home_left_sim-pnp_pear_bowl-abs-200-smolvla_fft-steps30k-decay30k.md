# team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-steps30k-decay30k

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, adaptado por el equipo TeamSOBITS para controlar un robot móvil manipulador en una tarea específica de manipulación: recoger una pera y colocarla sobre un cuenco. El modelo se ha entrenado mediante aprendizaje por imitación sobre 200 episodios de demostración capturados en simulación, y está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios de robótica con recursos limitados.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido (450 millones de parámetros) puede especializarse en tareas de manipulación concretas mediante fine-tuning, manteniendo un coste computacional bajo. Al estar basado en SmolVLA, hereda su arquitectura eficiente y su capacidad para procesar entradas visuales de múltiples cámaras y generar acciones de control directamente. El entrenamiento se ha realizado con LeRobot, la librería de robótica de Hugging Face, lo que facilita su reproducción y despliegue.

El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Aunque no se han publicado resultados de evaluación en el repositorio, el hecho de que el entrenamiento haya completado el programa de decaimiento de tasa de aprendizaje (fully annealed) sugiere que el modelo ha convergido adecuadamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de control robotico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Su diseño compacto permite ejecutarlo en GPUs de consumo, a diferencia de otros VLA más grandes. Este fine-tuning parte del checkpoint base `lerobot/smolvla_base` y se ha entrenado específicamente para la tarea de pick-and-place de una pera sobre un cuenco, utilizando un robot móvil manipulador con dos cámaras (cámara de cabeza y cámara de mano izquierda).

El entrenamiento se realizó con 200 episodios de demostración (22.588 frames a 10 FPS) procedentes del dataset `team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200`. Se utilizaron 30.000 pasos de entrenamiento con un batch size de 16, optimizador AdamW y una tasa de aprendizaje inicial de 1e-4 con decaimiento coseno completo (fully annealed), de modo que la tasa final fue de 2.5e-6. El modelo se entrenó con LeRobot versión 0.6.0 y semilla 1000. No se menciona el uso de RLHF o DPO; se trata de un aprendizaje por imitación supervisado estándar.

## Capacidades

- Control de robot móvil manipulador: genera acciones de 20 dimensiones (posición, orientación, etc.) a partir de observaciones de estado y dos flujos de imagen.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de la cámara de cabeza (480x640) y de la cámara de mano izquierda (400x640).
- Ejecución de tareas de manipulación pick-and-place: específicamente entrenado para recoger una pera y colocarla sobre un cuenco.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- No es un modelo de lenguaje conversacional: su salida es una secuencia de acciones, no texto.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos domésticos: el modelo puede controlar un robot móvil para recoger objetos y colocarlos en ubicaciones designadas, útil en asistentes robóticos para el hogar.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se especializan en tareas concretas con pocos datos (200 episodios).
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, puede entrenarse y desplegarse en GPUs de consumo, acelerando el ciclo de iteración en laboratorios.
- Benchmark de VLA en robótica: puede utilizarse como referencia para comparar el rendimiento de modelos más grandes frente a alternativas compactas en tareas de manipulación.
- Educación en robótica: permite a estudiantes experimentar con VLA en hardware asequible, sin necesidad de clústeres de GPUs.
- Integración en sistemas de robótica de servicio: el modelo puede incorporarse a robots de servicio que necesiten ejecutar tareas de manipulación específicas con requisitos de latencia moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación del modelo.
- Dado que el modelo tiene 450 millones de parámetros y está diseñado para hardware de consumo, se estima que puede ejecutarse en GPUs con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060), aunque no hay datos confirmados.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU con PyTorch. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no están documentados; dependerán de la GPU utilizada y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. El equipo TeamSOBITS ha publicado otros fine-tunings de SmolVLA para tareas similares (por ejemplo, `sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-60000` y `-90000`), pero no se han compartido métricas que permitan una comparación cuantitativa. El modelo base `lerobot/smolvla_base` es el punto de partida común, pero no se han publicado resultados de evaluación en ninguno de estos repositorios.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (recoger pera y colocarla sobre cuenco) y no generaliza a otras tareas sin reentrenamiento.
- No se han reportado resultados de evaluación en el mundo real; el rendimiento en el robot físico puede diferir del simulado.
- Al ser un modelo de imitación, su comportamiento depende de la calidad y diversidad de las demostraciones de entrenamiento; puede fallar ante variaciones no vistas (iluminación, posiciones de objetos, etc.).
- No se han documentado sesgos específicos, pero como cualquier modelo entrenado con datos limitados, puede presentar comportamientos erráticos en situaciones fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el hardware y el robot cumplen con los requisitos de seguridad.
- No se proporcionan garantías de rendimiento ni soporte técnico por parte del autor.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-steps30k-decay30k)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [GitHub de TeamSOBITS](https://github.com/TeamSOBITS)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
