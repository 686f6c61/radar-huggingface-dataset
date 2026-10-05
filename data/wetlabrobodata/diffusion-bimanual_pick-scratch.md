# WetLabRoboData/diffusion-bimanual_pick-scratch

## Resumen

`WetLabRoboData/diffusion-bimanual_pick-scratch` es una política de imitación (imitation learning) basada en modelos de difusión, publicada por el usuario WetLabRoboData y construida con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que genera secuencias de acciones para un robot UR3e bimanual equipado con tres cámaras, resolviendo la tarea concreta `bimanual_pick`.

El checkpoint contiene 264.873.854 parámetros (aproximadamente 265 millones) almacenados en formato safetensors, con un repositorio de 1,1 GB. La variante "scratch" indica que se entrenó únicamente con los datos de esta tarea, sin inicialización desde un checkpoint preentrenado, lo que la convierte en una referencia útil para comparar frente a políticas preentrenadas o fine-tuneadas.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot para manipulación bimanual real (entrenamiento, evaluación y despliegue); por otro, publica resultados de evaluación reproducibles (16 éxitos sobre 20 episodios) junto con los vídeos de rollout y los resultados por episodio en un dataset independiente. Está liberada bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) de LeRobot para control visuomotor; detalles internos de la red no disponibles en la model card |
| Parámetros totales | 264.873.854 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el horizonte de observación y de predicción de acciones no se especifica en la model card) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo robótico, sin interfaz de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,1 GB) |

## Arquitectura y entrenamiento

Se trata de una política de difusión en el sentido habitual de la familia Diffusion Policy implementada en LeRobot: el modelo aprende a generar "chunks" de acciones a partir de observaciones (imágenes de las tres cámaras del UR3e bimanual y, presumiblemente, estado proprioceptivo del robot) mediante un proceso iterativo de eliminación de ruido. La model card no detalla el codificador visual, el tipo de red de denoising, el número de pasos de difusión, el horizonte de acciones ni la frecuencia de control, por lo que esos datos deben considerarse no disponibles.

El entrenamiento es de imitación supervisada sobre demostraciones del dataset `WetLabRoboData/lerobot-data-bimanual_pick`. La variante es "scratch", es decir, sin inicialización desde pesos preentrenados. No hay información sobre el número de episodios de demostración, la composición del dataset, aumentos de datos ni número de pasos de entrenamiento en la información proporcionada. Al ser aprendizaje por imitación, no se aplican técnicas de alineación tipo RLHF o DPO. La model card indica que el modelo se reorganizó el 4 de octubre de 2026 a partir de `WetLabRoboData/lerobot-data-bimanual_pick_20260624`, y que los artefactos de entrenamiento originales (checkpoints, `train_config.json`, `wandb/`) se conservan en la subcarpeta `old/` del repositorio de origen para trazabilidad.

## Capacidades

- Control visuomotor bimanual: genera comandos de acción para un robot UR3e de dos brazos a partir de tres vistas de cámara.
- Ejecución de la tarea `bimanual_pick`, con una tasa de éxito medida de 16 sobre 20 episodios de evaluación (80 %).
- Aprendizaje por imitación: reproduce la distribución de comportamientos presente en las demostraciones del dataset de entrenamiento.
- Integración nativa con LeRobot: carga directa mediante `DiffusionPolicy.from_pretrained(...)` y uso del pipeline de evaluación y despliegue de la librería.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking": es un modelo específico de robótica.
- Capacidad de generar trayectorias multimodales (propiedad característica de las políticas de difusión), útil cuando una tarea admite varias soluciones cinemáticas válidas.

## Casos de uso

- Automatización de recogida bimanual en laboratorio húmedo: el modelo está entrenado específicamente para manipular objetos con dos brazos sobre un UR3e, lo que encaja en flujos de trabajo de wet lab donde hay que coger, trasladar y colocar muestras o material fungible con coordinación entre brazos.
- Baseline de investigación en políticas de difusión: al ser la variante "scratch", sirve como referencia limpia para medir la ganancia real de usar preentrenamiento o fine-tuning frente a entrenar desde cero en una tarea concreta.
- Comparación con políticas ACT u otras familias de LeRobot: el mismo dataset y la misma plataforma (UR3e bimanual, 3 cámaras) permiten comparaciones controladas de éxito, suavidad de trayectoria y robustez.
- Recolección de datos y evaluación en robot real: el repositorio de evaluación asociado publica vídeos de rollout y resultados por episodio, lo que facilita auditar el comportamiento del modelo antes de integrarlo en un pipeline propio.
- Despliegue local en estaciones de trabajo con GPU de consumo: con ~265 millones de parámetros, la inferencia puede ejecutarse en una GPU de gama media sin depender de servicios en la nube, algo relevante cuando los datos del laboratorio no pueden salir de la instalación.
- Punto de partida para fine-tuning en tareas relacionadas de pick: reutilizar el checkpoint como inicialización para una nueva tarea de recogida con el mismo montaje de cámaras y robot, reduciendo el número de demostraciones necesario.
- Docencia y formación en robótica de imitación: es un ejemplo completo y autocontenido (modelo, dataset de entrenamiento, dataset de evaluación, script de carga) para enseñar el ciclo completo de entrenamiento y evaluación de una política de difusión con LeRobot.
- Pruebas de robustez ante cambios de iluminación, posición inicial u oclusión parcial de las tres cámaras, midiendo la degradación de la tasa de éxito respecto al 80 % reportado en condiciones de evaluación.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible corresponden a la evaluación propia de la tarea. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, porque no aplican a un modelo de robótica.

| Evaluación | Métrica | Resultado |
|---|---|---|
| bimanual_pick (UR3e bimanual, 3 cámaras) | Episodios de evaluación | 20 |
| bimanual_pick | Éxitos | 16 / 20 |
| bimanual_pick | Tasa de éxito | 80 % |

No se han publicado resultados de benchmarks comparativos con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 1,06 GB; en fp16/bf16, unos 0,53 GB. A esto hay que sumar activaciones, codificadores visuales para tres cámaras y el bucle de difusión; no se dispone de una medición oficial de VRAM total en la model card.
- GPU recomendadas: cualquiera con al menos 4-8 GB de VRAM es suficiente en principio por tamaño de modelo; tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores permiten además mayor frecuencia de control. Para entrenamiento desde cero en este tipo de políticas se recomienda una GPU de gama alta (RTX 4090, A100, H100), especialmente por el coste de procesar múltiples flujos de vídeo.
- Cabe en GPU de consumo: sí, por número de parámetros, siempre que el pipeline de LeRobot y el bucle de difusión quepan en memoria; no hay confirmación oficial del fabricante sobre GPUs concretas.
- Opciones de despliegue: LeRobot con PyTorch es la vía documentada en la model card (`DiffusionPolicy.from_pretrained`). Otros formatos (GGUF, llama.cpp, Ollama, vLLM, TGI) no son aplicables o no están documentados para este modelo.
- Latencia y throughput: no disponibles. Dependen del número de pasos de difusión, del tamaño de entrada de las tres cámaras y del hardware, y la model card no publica cifras de frecuencia de control ni de tiempo por inferencia.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de benchmarks de modelos comparables, por lo que la comparación cuantitativa de rendimiento no está disponible. A continuación se comparan alternativas de la misma categoría a nivel cualitativo, marcando como "no disponible" todo dato que no consta.

| Modelo | Familia | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-bimanual_pick-scratch | Política de difusión (LeRobot) | 264.873.854 | bimanual_pick, UR3e bimanual | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot | Action Chunking Transformer | no disponible | Manipulación genérica, según checkpoint | apache-2.0 (librería LeRobot) | Hugging Face |
| Otras diffusion policies de LeRobot | Política de difusión | no disponible | Tareas diversas, según checkpoint | según checkpoint | Hugging Face |
| Políticas preentrenadas de gran escala para manipulación | Modelos visuomotor preentrenados | no disponible | Manipulación multi-tarea | según modelo | Hugging Face |

La diferencia funcional más relevante de este checkpoint frente a alternativas genéricas es su especialización: está entrenado solo para `bimanual_pick` sobre un montaje concreto (UR3e bimanual, tres cámaras), lo que limita su generalización pero también reduce el coste de inferencia y el riesgo de comportamientos fuera de distribución.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para la tarea `bimanual_pick` con un montaje hardware concreto; fuera de esa configuración su comportamiento no está validado.
- Tasa de éxito del 80 %: uno de cada cinco episodios falla en la evaluación publicada, lo que exige mecanismos de detección de fallo y recuperación en cualquier despliegue real.
- Dependencia del montaje: cambios en el número, posición o calibración de las tres cámaras alteran la distribución de observaciones y degradan el rendimiento.
- Sin información sobre el dataset de entrenamiento: no constan número de episodios, diversidad de objetos, condiciones de iluminación ni variabilidad de posiciones iniciales, por lo que no se puede evaluar el riesgo de sobreajuste.
- Riesgo de sobreajuste a las demostraciones: al ser una variante "scratch" sin preentrenamiento, la política puede memorizar trayectorias y fallar ante situaciones poco representadas.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no se puede interrogar al modelo ni pedirle justificaciones; la supervisión debe ser externa.
- Sin datos de seguridad física: la model card no documenta límites de fuerza, par ni paradas de emergencia; la integración segura en un robot real es responsabilidad del integrador.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y de atribución; no se documentan restricciones adicionales, pero tampoco se ofrece garantía alguna sobre el comportamiento del modelo.
- Sin cuantizaciones publicadas: no hay versiones en formatos alternativos ni mediciones de latencia, lo que dificulta planificar despliegues en hardware embebido o de bajos recursos.
- Los resultados de la búsqueda web realizada no contienen información técnica sobre este modelo; los enlaces devueltos no guardan relación con el mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-bimanual_pick-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-bimanual_pick
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-bimanual_pick-scratch
- Repositorio de origen con artefactos de entrenamiento archivados: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-bimanual_pick_20260624
- Librería LeRobot: https://github.com/huggingface/lerobot
- Paper de referencia de Diffusion Policy (Chi et al.): https://arxiv.org/abs/2303.04137
- La búsqueda web no devolvió enlaces adicionales relevantes sobre este modelo.
