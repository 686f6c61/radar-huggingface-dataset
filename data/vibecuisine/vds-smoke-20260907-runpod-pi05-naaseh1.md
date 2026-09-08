# VibeCuisine/vds-smoke-20260907-runpod-pi05-naaseh1

## Resumen

El modelo `VibeCuisine/vds-smoke-20260907-runpod-pi05-naaseh1` es un fine-tuning de `lerobot/pi05_base`, un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot por Hugging Face. Está diseñado para controlar un robot manipulador a partir de observaciones visuales y de estado, generando acciones de 7 dimensiones. Este fine-tuning concreto se ha entrenado para una tarea muy específica: agarrar una jarra en pie por sus caras anchas y colocarla en un soporte, con la boquilla orientada hacia la derecha.

El modelo tiene 4.143.404.816 parámetros y se distribuye bajo licencia Apache-2.0 en formato safetensors. Es relevante porque demuestra cómo adaptar un VLA de propósito general a una tarea de manipulación con un dataset mínimo (un solo episodio de 270 frames), lo que resulta útil para investigación en aprendizaje por imitación y prototipado rápido de políticas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tamano del repo | 9.4 GB |
| Pipeline | robotics |
| Libreria | lerobot |

## Arquitectura y entrenamiento

El modelo se basa en `pi05_base`, un VLA de Physical Intelligence que extiende π₀ para generalizar a entornos y situaciones nunca vistos durante el entrenamiento. La implementación en LeRobot sigue el repositorio OpenPI. La política consume observaciones de estado (vector de 7 dimensiones) e imágenes de dos cámaras (`top` y `wrist`, con resoluciones 640x480 y 480x640 respectivamente) y produce una acción de 7 dimensiones como salida.

El fine-tuning se realizó con el dataset `VibeCuisine/naaseh1-bottle-holder-calib-090326`, que contiene 1 episodio y 270 frames a 20 FPS. La configuración de entrenamiento incluye 10 pasos, batch size 1, optimizador AdamW, learning rate 2.5e-05 y semilla 1000, con LeRobot 0.6.0. No se indica el uso de RLHF, DPO ni otras técnicas de alineación; al ser un modelo de acción, el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Genera acciones de 7 dimensiones (posiciones o velocidades de articulaciones) a partir de imágenes y estado.
- Procesa simultáneamente imágenes de dos cámaras: superior (`top`) y de muñeca (`wrist`).
- Ejecuta la tarea específica para la que fue fine-tuneado: agarrar una jarra en pie por sus caras anchas y colocarla en un soporte con la boquilla a la derecha.
- No soporta tool calling, generación de texto ni razonamiento simbólico.
- No tiene capacidades multilingües ni de visión general más allá de las observaciones robóticas.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como ejemplo de fine-tuning de un VLA con un dataset mínimo, permitiendo estudiar la transferencia de conocimiento desde un modelo base preentrenado.
- Prototipado de tareas de manipulación: se puede usar como punto de partida para adaptar la política a nuevas tareas de pick-and-place con pocos datos.
- Desarrollo de robots de laboratorio: el modelo se puede desplegar en robots `seeed_b601_rs_follower` para probar la ejecución de la tarea de agarrar y colocar una jarra.
- Validación de pipelines de LeRobot: sirve para verificar el flujo de entrenamiento, despliegue y rollout con la librería LeRobot en un entorno real.
- Evaluación de robustez visual: se puede probar el modelo con variaciones de iluminación, ángulo de cámara o posición del objeto para medir su capacidad de generalización.
- Educacion en robótica: el modelo y su dataset proporcionan un ejemplo completo y reproducible del ciclo de recogida de datos, entrenamiento y ejecución de una política robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en bf16 (aproximadamente 8.3 GB), se estima un mínimo de 16 GB de VRAM para inferencia con LeRobot, incluyendo activaciones y buffers. No se especifica la precisión exacta.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Compatibilidad con consumer GPU: sí, con GPUs de 16 GB o más; no es viable en GPUs de 8 GB sin cuantización.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), la librería `lerobot` y el script `lerobot-train` para fine-tuning.
- Latencia y throughput: no se han publicado datos.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks ni especificaciones de modelos comparables en la informacion disponible. El modelo base es `lerobot/pi05_base`, y en el repositorio de Hugging Face existen otros fine-tunes de la misma familia, como `VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1`, pero no se dispone de datos para una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información; al ser un modelo de acción, los sesgos lingüísticos no aplican.
- Riesgo de alucinacion: no aplica, el modelo no genera texto.
- Limitaciones de contexto o idioma: no aplica, el modelo no procesa lenguaje; su contexto son las imágenes y el estado del robot.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación.
- Caveat importante: el modelo se entrenó con un solo episodio (270 frames) y no tiene evaluación publicada; no debe usarse en producción sin pruebas exhaustivas. Cambios en la posición, iluminación o tipo de objeto pueden causar fallos.

## Enlaces

- Hugging Face: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-pi05-naaseh1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/VibeCuisine/naaseh1-bottle-holder-calib-090326
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Blog de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
