# vibhurajeev/act_chess_pick

## Resumen

El modelo `vibhurajeev/act_chess_pick` es una política robótica entrenada con el método Action Chunking with Transformers (ACT), desarrollado por el autor Vibhu Rajeev y publicado en Hugging Face mediante la librería LeRobot. Este modelo está diseñado para controlar un robot seguidor (tipo `so_follower`) en la tarea concreta de recoger una pieza de ajedrez, a partir de observaciones visuales de dos cámaras (superior y de muñeca) y el estado propio del robot. Representa un caso práctico de aprendizaje por imitación con datos teleoperados, donde la arquitectura predice secuencias de acciones (chunks) en lugar de pasos individuales, mejorando la estabilidad y precisión del movimiento.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de gama media. La licencia Apache 2.0 permite su uso comercial y modificaciones sin restricciones significativas. La relevancia actual radica en su integración con el ecosistema LeRobot, que democratiza el entrenamiento y despliegue de políticas robóticas en entornos de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con codificador de visión y decodificador autoregresivo |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). La arquitectura combina un codificador de visión (ResNet) para procesar las imágenes de las cámaras `top` y `wrist`, junto con un transformer que genera secuencias de acciones de longitud fija (chunks). Esta estrategia permite reducir el error de acumulación y mejorar la robustez en tareas de manipulación dinámica.

El entrenamiento se realizó con el dataset `vibhurajeev/chess_pick_20260830_161214`, que contiene 100 episodios y 30.259 frames a 30 FPS, todos correspondientes a la tarea "Pick up the piece". Se usaron 25.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate de 4e-5, con semilla 1000. La versión de LeRobot utilizada fue la 0.6.2. No se menciona el uso de RLHF ni técnicas de ajuste fino adicionales; el modelo se entrenó exclusivamente con datos teleoperados.

## Capacidades

- Control robótico de un brazo seguidor (tipo `so_follower`) para tareas de manipulación.
- Predicción de secuencias de acciones (chunks) a partir de observaciones visuales y estado del robot.
- Entrada multimodal: dos cámaras RGB (480x640) y vector de estado de 6 dimensiones.
- Salida de acciones de 6 dimensiones para el control del robot.
- No tiene capacidades de lenguaje, generación de texto, razonamiento o visión general; su funcionalidad se limita al dominio robótico específico.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede replicar la acción de recoger piezas de ajedrez, lo que sirve como prueba de concepto para tareas industriales similares.
- Investigación en aprendizaje por imitación: permite estudiar la eficacia de ACT en entornos controlados con datos teleoperados.
- Desarrollo de sistemas robóticos personalizados: se puede adaptar a otros robots o tareas mediante fine-tuning con LeRobot.
- Educación en robótica: sirve como ejemplo práctico para enseñar entrenamiento de políticas con transformadores.
- Evaluación de hardware robótico: útil para probar la precisión de brazos seguidores en entornos de laboratorio.
- Base para experimentos de generalización: aunque está entrenado para una tarea específica, puede servir como punto de partida para investigar transferencia de habilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay evaluaciones realizadas hasta la fecha.

## Requisitos de hardware

- Al ser un modelo de 51,7 millones de parámetros, es considerablemente ligero en comparación con modelos de lenguaje grandes.
- No se dispone de datos oficiales sobre VRAM necesaria, pero por su tamaño se estima que puede ejecutarse en GPUs con al menos 4-6 GB de VRAM (por ejemplo, NVIDIA GTX 1660 Super, RTX 2060 o superiores).
- El despliegue se realiza mediante el ecosistema LeRobot, que soporta inferencia en tiempo real con PyTorch y CUDA.
- No se recomienda el uso de vLLM u Ollama, ya que están orientados a modelos de lenguaje; aquí se utiliza el pipeline de LeRobot (`lerobot-rollout`).
- La latencia dependerá del hardware y la configuración de las cámaras, pero al ser un modelo pequeño, es adecuado para control en bucle cerrado a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en la misma categoría (políticas robóticas de imitación con ACT). Existen otros repositorios de LeRobot con políticas similares, pero no se proporcionan datos de rendimiento ni especificaciones detalladas para realizar una comparación objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger una pieza de ajedrez con un robot `so_follower` y dos cámaras específicas; no generaliza a otras tareas u configuraciones de hardware.
- No hay resultados de evaluación publicados, por lo que se desconoce su tasa de éxito real en el robot físico.
- La dependencia de la calibración de cámaras y la posición del robot puede afectar significativamente el rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está optimizado para producción y requiere validación en entornos reales.
- No se han documentado sesgos, pero al ser un modelo de robótica, los riesgos de alucinación o errores de razonamiento no aplican; en su lugar, el riesgo principal es el fallo en la ejecución de la tarea si las condiciones cambian.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vibhurajeev/act_chess_pick)
- [Dataset de entrenamiento](https://huggingface.co/datasets/vibhurajeev/chess_pick_20260830_161214)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
