# VibeCuisine/vds-smoke-20260909-gcp-molmoact2-4g-spot

## Resumen

El modelo `VibeCuisine/vds-smoke-20260909-gcp-molmoact2-4g-spot` es un checkpoint de política robótica basado en MolmoAct2, un modelo fundacional de robótica desarrollado por el Allen Institute for AI (Ai2) e implementado en la biblioteca LeRobot. Este modelo transforma imágenes de cámaras (top, wrist y base) junto con instrucciones de lenguaje en secuencias de acciones de robot. El checkpoint ha sido ajustado por VibeCuisine sobre un dataset propio de demostraciones de pelado de pepinos, con un total de 5.601.988.144 parámetros (aproximadamente 5,6 mil millones). Su relevancia radica en ser un ejemplo de aplicación de un modelo VLA de código abierto a una tarea de manipulación fina, con licencia Apache 2.0 y disponible para su uso a través de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo VLA basado en MolmoAct2 de Ai2) |
| Parámetros totales | 5.601.988.144 |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional de robótica del Allen Institute for AI que mapea imágenes de cámara e instrucciones de lenguaje a chunks de acciones de robot. La implementación de LeRobot permite entrenar y evaluar este modelo. El checkpoint concreto ha sido ajustado finamente sobre un dataset de demostraciones recogido mediante DAgger iterativo (iter2 v2 trim). El dataset contiene 188 episodios y 58.994 fotogramas a 20 FPS, con la tarea de pelar la piel de un pepino con varios trazos, empezando cerca del gripper azul y moviéndose verticalmente a lo largo del pepino hacia el origen del robot. La configuración de entrenamiento es breve: solo 10 pasos, con batch de 8, optimizador molmoact2_adamw, tasa de aprendizaje 1e-05 y semilla 42. No se mencionan fases de RLHF ni de DPO.

## Capacidades

- Genera acciones de robot de 7 dimensiones a partir de observaciones de estado y tres vistas de cámara (top, wrist y base).
- Comprende instrucciones de lenguaje asociadas a la tarea de manipulación; los idiomas soportados no están especificados en la información disponible.
- Es compatible con el robot `vibeboard_follower_tilt` a través de LeRobot.
- Ha sido entrenado para una tarea de manipulación delicada: pelar la piel de un pepino con varios trazos, lo que requiere coordinación fina.
- No se documenta soporte de tool calling ni de agentes, ya que es un modelo de política de control robótico, no un modelo de lenguaje de propósito general.

## Casos de uso

- Automatización del pelado de vegetales: el modelo puede controlar un robot para pelar pepinos de forma autónoma, lo que resulta útil en procesos de manipulación de alimentos. Se desplegaría con `lerobot-rollout` usando el robot y las cámaras configuradas.
- Investigación en aprendizaje por imitación: este checkpoint sirve como punto de partida para estudiar cómo los modelos VLA se adaptan a tareas específicas con pocas demostraciones, dado el ajuste fino de solo 10 pasos.
- Recogida de datos para DAgger: el modelo puede utilizarse como política inicial para generar nuevas demostraciones y mejorar iterativamente un dataset de entrenamiento.
- Desarrollo de políticas para brazos robóticos de bajo coste: el robot `vibeboard_follower_tilt` parece ser una plataforma de investigación de acceso abierto; este checkpoint muestra cómo aplicar MolmoAct2 a esa plataforma.
- Evaluación de modelos VLA en manipulación fina: dado que no hay resultados de evaluación publicados, los investigadores pueden usar este checkpoint para medir el rendimiento de MolmoAct2 en tareas de precisión.
- Transferencia de aprendizaje a tareas afines: partiendo de los pesos de este modelo, se puede reentrenar para otras tareas de manipulación de objetos, como cortar frutas o verduras, mediante LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no se han proporcionado resultados de evaluación de esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Los pesos en safetensors ocupan 12,7 GB, lo que sugiere una precisión FP16/BF16 y una necesidad de VRAM de al menos 12,7 GB para los pesos, más memoria para activaciones. Una estimación prudente es de 16 a 24 GB.
- GPU recomendadas: una GPU con al menos 16 GB de memoria, como RTX 4090 (24 GB), A100 40 GB o H100.
- Compatibilidad con GPU de consumo: podría cargarse en una RTX 4080 o 4090, pero se recomienda una GPU con 24 GB de VRAM para disponer de margen suficiente con el procesamiento de tres imágenes en paralelo.
- Opciones de despliegue: inferencia mediante LeRobot (`lerobot-rollout`) en PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de políticas robóticas y no de un LLM generalista.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa específica en los datos proporcionados. Como referencia, MolmoAct2 de Ai2 compite con otros modelos fundacionales de robótica como OpenVLA o π0, pero no se han facilitado datos de rendimiento ni especificaciones detalladas de estos modelos en la información disponible. Por tanto, no se puede presentar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está ajustado para una tarea muy concreta (pelar pepinos) con un dataset pequeño de 188 episodios, lo que puede limitar su capacidad de generalización a otros objetos o entornos.
- Solo se realizaron 10 pasos de entrenamiento, un ajuste tan breve puede resultar en un modelo que no ha convergido completamente.
- No se han publicado resultados de evaluación de éxito en robot real, por lo que su fiabilidad en producción no está validada.
- Los idiomas soportados no están especificados; la única instrucción disponible está en inglés, por lo que probablemente solo funcione en ese idioma.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue requiere hardware robótico específico (`vibeboard_follower_tilt`) con tres cámaras calibradas.
- Las acciones generadas pueden ser inseguras si el modelo se usa sin supervisión adecuada, dado que no se han realizado pruebas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeCuisine/vds-smoke-20260909-gcp-molmoact2-4g-spot
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/cucumber-peel-DAgger-iter2-v2-trim
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Documentación de LeRobot sobre MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
