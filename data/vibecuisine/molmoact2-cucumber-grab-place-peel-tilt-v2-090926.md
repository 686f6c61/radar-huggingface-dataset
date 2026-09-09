# VibeCuisine/molmoact2-cucumber-grab-place-peel-tilt-v2-090926

## Resumen

El modelo `VibeCuisine/molmoact2-cucumber-grab-place-peel-tilt-v2-090926` es una política de robótica basada en visión y lenguaje, desarrollada por VibeCuisine mediante Vibe Data Studio y el framework LeRobot. Se trata de un ajuste fino del modelo MolmoAct2 de AllenAI (`allenai/MolmoAct2`), entrenado con 751 episodios teleoperados en los que un brazo robótico manipula pepinos sobre una tabla de cortar. El checkpoint tiene 5.601.988.144 parámetros (unos 5.6B) y se distribuye en formato safetensors, con un peso total de 55.4 GB. El modelo resuelve tareas concretas de manipulación de alimentos: agarrar un pepino, pelarlo, colocarlo en el centro de la tabla o inclinarlo, siguiendo instrucciones en inglés y procesando imágenes de tres cámaras. No se especifican la longitud de contexto ni la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (VLM adaptado a política de robótica; base: `allenai/MolmoAct2`) |
| Parámetros totales | 5.601.988.144 (5.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat16 (según la configuración de entrenamiento); no se documentan otros tipos |
| Idiomas soportados | no disponible (las instrucciones documentadas están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura MolmoAct2 de AllenAI, un modelo de visión-lenguaje que ha sido adaptado como política de robótica mediante aprendizaje por demostración. El entrenamiento se llevó a cabo con LeRobot (commit `39237fa2`), aplicando LoRA a las capas del VLM (`train_mode_vlm=lora`) para ajustar el modelo al dominio de manipulación del pepino. Se usaron 9.000 pasos con un batch de 8, una semilla de 42 y una loss final de 0.035; el proceso duró 8 horas y 31 minutos en una instancia GCP con GPU A100 (`a2-highgpu-1g`).

El dataset está compuesto por 751 episodios teleoperados, con 97.621 frames a 20 fps, recogidos con tres cámaras (`base`, `top`, `wrist`) a resolución 640x480. La acción de salida es un vector de 7 dimensiones (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper, tilt) y el modelo predice chunks de 30 pasos de acción (`chunk_size=30`). Los datos proceden de varias colecciones de teleoperación (grab, place, peel, tilt) grabadas con diferentes rigs (jetson1, vibepi, DAgger). No se menciona ningún proceso de RLHF ni DPO; se trata de clonado de comportamiento (behavior cloning) sobre datos de teleoperación.

## Capacidades

- Control de un brazo robótico de 7 grados de libertad: genera acciones continuas de posición articular (absolute joint pose) y abertura de la pinza.
- Seguimiento de instrucciones en lenguaje natural en inglés, con cinco comandos documentados (agarrar, colocar, pelar, inclinar).
- Percepción multimodal: integra imágenes de tres cámaras (base, top y wrist) a 20 fps.
- Predicción de secuencias de acciones: genera chunks de 30 acciones por inferencia para anticipar movimiento.
- Entrenamiento por clonado de comportamiento con normalización por cuantiles (ACTION/STATE QUANTILES) y salidas continuas.
- Adaptación eficiente mediante LoRA, lo que permite transferir un VLM de propósito general a una tarea de control robótico con un coste de entrenamiento moderado.
- No soporta tool calling, agentes ni razonamiento general; es un modelo de política específico para robótica.

## Casos de uso

1. Robot de cocina en laboratorio: colocar pepinos en el centro de la tabla de cortar de forma repetitiva y consistente, siguiendo instrucciones de posición.
2. Automatización de pelado de alimentos: ejecutar movimientos de pelado a lo largo del pepino, comenzando cerca de la pinza y avanzando hacia el origen del robot.
3. Manipulación fina con control visual: usar las tres cámaras para corregir la posición del objeto y alinear la verdura en la imagen.
4. Investigación en imitación: servir como punto de partida para estudiar cómo los datos de teleoperación se transfieren a acciones de robot en entornos con multiples cámaras.
5. Integración en sistemas LeRobot: desplegar en plataformas de bajo coste como el hardware vinculado al tag `vibeboard_v2`, con soporte de CUDA.
6. Tareas preparatorias en cocinas robóticas: agarrar elementos, inclinarlos o colocarlos en una orientación determinada dentro de un flujo de trabajo automatizado.
7. Ajuste fino para nuevos dominios: reutilizar el pipeline de Vibe Data Studio para adaptar el modelo a otras hortalizas o tareas de manipulación con datos teleoperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es la loss de entrenamiento final (0.035) y la duración del entrenamiento (8h31m), que no constituyen métricas de evaluación comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 de 5.6B ocupan aproximadamente 11.2 GB; con activaciones y procesamiento de tres imágenes simultáneas, se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: A100 40GB (utilizada en el entrenamiento), H100 o RTX 4090 (24 GB).
- Compatibilidad con GPU de consumidor: es viable en tarjetas de 24 GB como la RTX 4090; no se recomienda su uso en tarjetas de 8-12 GB.
- Opciones de despliegue: la información solo documenta el uso con LeRobot (librería `lerobot`) y CUDA. No se mencionan vLLM, llama.cpp, TGI ni Ollama.
- Latencia y throughput: no disponible. El modelo genera chunks de 30 acciones por inferencia, pero no se proporcionan datos de latencia en tiempo real.

## Comparativa con modelos similares

No se han encontrado datos comparativos en la información proporcionada ni en los resultados de la búsqueda web. No disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado, pero al estar entrenado con un dataset de 751 episodios en un entorno concreto, el modelo hereda los sesgos de la configuración del rig (colores, iluminación, posiciones de la tabla).
- Riesgo de alucinación: como modelo de política, puede generar acciones incorrectas ante entradas visuales fuera de la distribución de entrenamiento; no se recomienda su uso sin supervisión.
- Limitaciones de idioma y tarea: solo hay instrucciones en inglés y para el dominio del pepino; no generaliza a otros objetos ni a comandos no vistos.
- Restricciones de licencia: la licencia no está especificada en la información disponible, por lo que no se puede confirmar el uso comercial.
- Dependencia del hardware: el checkpoint espera tres entradas de imagen (`top`, `wrist`, `base`) y un espacio de acción de 7 dimensiones; no funcionará con robots que tengan otra configuración de actuadores.
- El modelo asume una frecuencia de muestreo de 20 fps; la inferencia debe mantener esa cadencia para que la política se comporte como se espera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VibeCuisine/molmoact2-cucumber-grab-place-peel-tilt-v2-090926
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/molmoact2-cucumber-grab-place-peel-tilt-v2-v1-trim
- Modelo base: https://huggingface.co/allenai/MolmoAct2
- Registro de entrenamiento en W&B: https://wandb.ai/jeremyhx-freelance/lerobot/runs/vds54-70c26b7a
