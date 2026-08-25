# Sounderya/smolvla-ur3-mixed-40-60

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, diseñado para robótica y capaz de ejecutarse en hardware de consumo. Este repositorio concreto, `Sounderya/smolvla-ur3-mixed-40-60`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Sounderya para una tarea específica de manipulación: coger una taza y colocarla en un plato, ejecutada con un robot UR3. El modelo se ha entrenado con el framework LeRobot y el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios y más de 91 000 frames.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA compacto (450 millones de parámetros) sobre un dataset propio, con una configuración de entrenamiento reproducible y documentada. Al estar basado en SmolVLA, hereda la capacidad de procesar múltiples vistas de cámara, el estado del robot y una instrucción en lenguaje natural para generar acciones de control. Su licencia Apache 2.0 y su integración con LeRobot lo hacen accesible para la comunidad investigadora y para prototipado industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA, con codificador visual, codificador de lenguaje y experto de acciones |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada multimodal: 3 imagenes de 256x256, estado de 6 dimensiones e instruccion textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instruccion se procesa en ingles, segun el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y vision preentrenado con un "action expert" que decodifica las características contextuales en comandos de control del robot. La arquitectura exacta (numero de capas, dimensiones ocultas, tipo de atencion) no se detalla en la informacion disponible, pero el paper original (arXiv:2506.01844) describe un diseno compacto orientado a eficiencia computacional y despliegue en hardware asequible.

El entrenamiento de este fine-tuning se realizo con el framework LeRobot sobre el dataset `mug_smolvla_dataset_v2nc`, que contiene 120 episodios grabados a 30 FPS con tres camaras (muñeca, derecha y una tercera no especificada). La configuracion de entrenamiento incluye 6000 pasos, batch size de 64, optimizador AdamW con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un fine-tuning supervisado por imitacion.

## Capacidades

- Percepcion visual multi-camara: procesa tres vistas de 256x256 píxeles simultaneamente.
- Control de robot: genera acciones de 10 dimensiones (probablemente posiciones articulares o comandos de efector final).
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica textualmente ("Pick the mug and place it on the plate").
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.
- Fine-tuning especifico: el modelo esta especializado en la tarea de pick-and-place de una taza sobre un plato, no es un modelo generalista.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de vision fuera del contexto robotico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de coger una taza y colocarla en un plato de forma repetitiva, util para lineas de ensamblaje o laboratorios de investigacion.
- Prototipado de politicas robotica: sirve como punto de partida para investigadores que quieran fine-tunear SmolVLA sobre sus propios datasets y tareas, gracias a la configuracion documentada.
- Evaluacion de VLA en hardware de consumo: al tener solo 450M de parametros, permite probar tecnicas de aprendizaje por imitacion en GPUs de gama media sin necesidad de infraestructura de alto rendimiento.
- Investigacion en aprendizaje por imitacion: el dataset y el modelo estan publicamente disponibles, lo que facilita la reproduccion de experimentos y la comparacion de metodos.
- Desarrollo de robots colaborativos en entornos academicos: el modelo puede integrarse en plataformas como UR3 para demostraciones de manipulacion en laboratorios docentes.
- Benchmarking de modelos VLA compactos: al ser un fine-tuning de SmolVLA, puede utilizarse como referencia para comparar el rendimiento de otros VLA de tamano similar en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de datos de exito en tareas reales ni de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 450M de parametros, se estima que el modelo puede ejecutarse en GPUs de consumo con al menos 6-8 GB de VRAM, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no se especifican. Dado el tamano, una RTX 3060 o superior seria suficiente para inferencia, y una RTX 4090 o A100 para entrenamiento.
- Compatibilidad con hardware de consumo: el paper de SmolVLA destaca su capacidad de despliegue en hardware asequible, por lo que es plausible que funcione en GPUs de gama media, aunque no se confirma para este fine-tuning concreto.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) y soporte para multiples robots. Tambien es compatible con el ecosistema de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sounderya/smolvla-ur3-mixed-40-60 | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7B | no disponible | MIT (con restricciones) | Hugging Face |
| RT-2 (55B) | 55B | no disponible | propietaria | no publico |

SmolVLA es significativamente mas compacto que OpenVLA y RT-2, lo que lo hace mas adecuado para despliegue en hardware de consumo. Sin embargo, no se dispone de datos de rendimiento comparativo en tareas de manipulacion para este fine-tuning especifico. El paper original de SmolVLA reporta rendimiento competitivo frente a modelos mas grandes, pero esos resultados no se aplican directamente a este repositorio.

## Limitaciones y advertencias

- Tarea especifica: el modelo esta entrenado unicamente para la tarea de coger una taza y colocarla en un plato. No es generalizable a otras tareas sin un nuevo fine-tuning.
- Sin evaluacion reportada: la model card no incluye resultados de exito en el robot real, por lo que se desconoce su fiabilidad en produccion.
- Dataset limitado: 120 episodios es un volumen reducido, lo que puede provocar sobreajuste o falta de robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- Dependencia de camaras especificas: el modelo espera tres vistas de camara con nombres concretos (`wrist`, `right` y una tercera no especificada). Cambios en la configuracion de camaras requieren reentrenamiento.
- Riesgo de alucinacion en instrucciones: aunque no es un modelo de lenguaje general, la interpretacion de la instruccion puede fallar si se proporciona una tarea diferente a la entrenada.
- Sesgos del dataset: el dataset fue grabado por un unico operador y en un entorno concreto, lo que puede introducir sesgos en la politica aprendida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y del dataset asociado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sounderya/smolvla-ur3-mixed-40-60)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Documentacion de LeRobot sobre SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Perfil del autor en Hugging Face](https://huggingface.co/Sounderya)
