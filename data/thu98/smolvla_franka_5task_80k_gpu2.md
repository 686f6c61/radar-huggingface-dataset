# THU98/smolvla_franka_5task_80k_gpu2

## Resumen

SmolVLA Franka 5-Task 80K es una política de robótica especializada, basada en la arquitectura SmolVLA (~450 millones de parámetros), desarrollada por THU98 a partir del modelo base `lerobot/smolvla_base`. Se trata de un modelo visión-lenguaje-acción (VLA) ajustado para cinco tareas de manipulación bimanual con el brazo robótico Franka, condicionadas por instrucciones en lenguaje natural. El modelo recibe tres vistas RGB de cámaras, una instrucción textual y un estado del robot de 16 dimensiones, y genera bloques de acción de 50 pasos con 16 dimensiones por paso.

La relevancia de este checkpoint reside en su carácter de ajuste fino específico sobre SmolVLA, un modelo base compacto diseñado para robótica de bajo coste. El entrenamiento se realizó con 250 episodios (58.142 fotogramas) distribuidos en cinco tareas, durante 80.000 pasos con precisión bfloat16. El modelo base de visión-lenguaje es `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`, lo que lo sitúa en la categoría de VLA eficientes para entornos con recursos limitados. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM base SmolVLM2-500M-Video-Instruct + experto de acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, que combina un modelo de visión-lenguaje compacto (SmolVLM2-500M-Video-Instruct) con un experto de acción y una proyección de estado. Durante el ajuste fino solo se entrenaron el experto de acción y la proyección de estado, aproximadamente 100 millones de parámetros, mientras que el resto del modelo permaneció congelado. La entrada se compone de tres flujos de imagen RGB, una instrucción en lenguaje natural y un vector de estado del robot de 16 dimensiones (siete articulaciones del brazo izquierdo, apertura de la pinza izquierda, siete articulaciones del brazo derecho y apertura de la pinza derecha). La salida es un bloque de acción de 50 pasos con 16 dimensiones por paso.

El entrenamiento se realizó sobre un dataset local de LeRobot v3 con 250 episodios (58.142 fotogramas a 20 FPS) correspondientes a cinco tareas de manipulación. Se emplearon 80.000 pasos de entrenamiento con un tamaño de lote de 16, precisión bfloat16, optimizador AdamW, tasa de aprendizaje máxima de 1e-4 con calentamiento de 1.000 pasos y decaimiento coseno hasta 2.5e-6 en 30.000 pasos. No se aplicó aumento de imágenes. La pérdida final registrada fue de aproximadamente 0.031, que es una métrica de optimización y no debe interpretarse como tasa de éxito en las tareas. No se utilizó RLHF ni DPO. El mapeo de cámaras durante el entrenamiento fue: `cam_high` a `camera1`, `cam_left_wrist` a `camera2` y `cam_right_wrist` a `camera3`.

## Capacidades

- Generación de bloques de acción de 50 pasos con 16 dimensiones por paso para control bimanual de un robot Franka.
- Condicionamiento por instrucciones en lenguaje natural (inglés) para seleccionar la tarea a ejecutar.
- Percepción multimodal con tres vistas RGB de cámaras (cámara alta, muñeca izquierda y muñeca derecha).
- Integración de estado del robot de 16 dimensiones para control de brazos y pinzas.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Especialización en cinco tareas concretas de manipulación de objetos (colocar cuencos, tazas y cinta en posiciones determinadas).

## Casos de uso

- Manipulación bimanual en entornos de laboratorio: el modelo puede ejecutar tareas de colocación de objetos (cuencos, tazas, cinta) en posiciones específicas usando ambos brazos del robot Franka, lo que resulta útil para validar políticas VLA en entornos controlados.
- Investigación en aprendizaje por imitación: al estar ajustado sobre SmolVLA con un dataset de 250 episodios, sirve como referencia para estudiar el efecto del número de demostraciones y la configuración de entrenamiento en el rendimiento de políticas VLA.
- Evaluación de generalización en robótica: dado que no se ha evaluado en un conjunto de validación independiente, puede utilizarse para medir la degradación del rendimiento ante cambios en la posición de cámaras, iluminación o disposición de objetos.
- Desarrollo de pipelines de datos robóticos: el mapeo de cámaras y el orden de las dimensiones de estado y acción están documentados, lo que facilita la creación de datasets compatibles con LeRobot para nuevas tareas.
- Prototipado de sistemas de manipulación con instrucciones en lenguaje natural: el modelo acepta instrucciones textuales en inglés, lo que permite construir interfaces de control por voz o texto para robots Franka en entornos de investigación.
- Formación y docencia en robótica: al ser un modelo compacto (~450M parámetros) con licencia Apache-2.0, es adecuado para cursos y talleres sobre VLA, aprendizaje por imitación y despliegue de políticas robóticas.
- Benchmarking de eficiencia computacional: su tamaño reducido permite comparar el coste de inferencia y entrenamiento frente a modelos VLA más grandes como OpenVLA, en escenarios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint no ha sido evaluado en un conjunto de validación independiente ni se han reportado tasas de éxito en robot real. La pérdida de entrenamiento final (~0.031) es una métrica de optimización y no debe interpretarse como rendimiento en las tareas.

## Requisitos de hardware

- El repositorio ocupa 0,9 GB, lo que corresponde aproximadamente a los pesos en bfloat16 de los 450 millones de parámetros.
- El entrenamiento se realizó en una única GPU NVIDIA, aunque no se especifica el modelo concreto.
- Para inferencia, los pesos en bfloat16 (~900 MB) deberían caber en GPUs de consumo con 8 GB de VRAM o más, aunque no se han publicado requisitos oficiales.
- El despliegue se realiza mediante el framework LeRobot, cargando la política con `SmolVLAPolicy.from_pretrained()`.
- No se han publicado datos de latencia ni throughput para inferencia.
- No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el framework de referencia es LeRobot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| THU98/smolvla_franka_5task_80k_gpu2 | ~450M | No disponible | Apache-2.0 | Ajuste fino específico para 5 tareas Franka |
| lerobot/smolvla_base | ~450M | No disponible | Apache-2.0 | Modelo base VLA de LeRobot, requiere ajuste fino |
| OpenVLA | No disponible | No disponible | No disponible | VLA de propósito general mencionado en resultados de búsqueda |
| ACT (Action Chunking with Transformers) | No disponible | No disponible | No disponible | Método de aprendizaje por imitación con chunking de acciones |

Los datos comparativos cuantitativos (rendimiento, contexto, etc.) de OpenVLA y ACT no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado en un conjunto de validación independiente ni se han reportado tasas de éxito en robot real.
- El modelo está especializado para el robot, la colocación de cámaras, la disposición de la escena, los objetos y las frases de instrucción utilizados durante el entrenamiento.
- El rendimiento ante cambios de distribución (distribution shift) es desconocido.
- Solo se admiten instrucciones en inglés.
- La pérdida de entrenamiento final (0.031) es una métrica de optimización y no debe interpretarse como tasa de éxito.
- No se aplicó aumento de imágenes durante el entrenamiento, lo que puede limitar la robustez ante variaciones visuales.
- El modelo no está configurado para inferencia a través de la API de HuggingFace (`inference: false`).
- Se recomienda validar las restricciones de seguridad y el éxito de las tareas en un entorno controlado antes del despliegue en robot real.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es específico para las tareas y el hardware de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/THU98/smolvla_franka_5task_80k_gpu2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Repositorio de LeRobot: https://github.com/hugging
