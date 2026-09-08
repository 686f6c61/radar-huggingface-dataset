# VibeCuisine/vds-smoke-20260907-gcp-pi05-v3-us-central1-c-lora40

## Resumen

VibeCuisine/vds-smoke-20260907-gcp-pi05-v3-us-central1-c-lora40 es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por VibeCuisine como un fine-tune del modelo base `lerobot/pi05_base`. El modelo base π₀.₅ (Pi05) es un VLA de Physical Intelligence diseñado para generalización en mundo abierto, que evoluciona π₀ para adaptarse a entornos y situaciones nunca vistos durante el entrenamiento. Este adaptador se ha entrenado con LeRobot, la biblioteca de aprendizaje por imitación de HuggingFace, para una tarea concreta de manipulación robótica.

El modelo se ha afinado sobre un dataset curado de 64 episodios y 3478 frames a 20 FPS, con la tarea "Grab the cucumber at the one-third point". Es un adaptador LoRA, por lo que los pesos publicados son un delta sobre el modelo base, y requiere `lerobot/pi05_base` para funcionar. La arquitectura exacta, el número total de parámetros y la longitud de contexto no se especifican en la información disponible, pero al tratarse de un VLA, el modelo procesa entradas multimodales (estado del robot y tres cámaras) y produce acciones de 7 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en pi05 (π₀.₅) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base `lerobot/pi05_base`, que a su vez es la implementacion en LeRobot del modelo π₀.₅ de Physical Intelligence. π₀.₅ es un modelo de vision-lenguaje-accion entrenado para generalizar a entornos nuevos a partir de un conjunto de datos diverso de demostraciones robotizadas. Este fine-tune concreto se ha entrenado con el dataset `VibeCuisine/vibepi3-grab-poseexpert-r3-curated`, compuesto por 64 episodios y 3478 frames a 20 FPS, todos dedicados a la tarea de agarrar un pepino en el punto de un tercio.

La configuracion de entrenamiento es minima: 10 pasos, batch size 1, optimizador AdamW con learning rate 2.5e-5, seed 1000 y LeRobot version 0.6.0. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional. La innovacion tecnica destacable proviene del modelo base: π₀.₅ introduce mejoras sobre π₀ para la generalizacion en mundo abierto, aunque los detalles especificos de arquitectura (atencion, decodificacion, etc.) no se detallan en la informacion disponible.

## Capacidades

- Control robotico: genera acciones de 7 dimensiones (posiciones o velocidades de articulaciones) a partir de observaciones de estado y tres camaras.
- Percepcion visual: procesa imagenes de tres camaras (corner, top, wrist) con resolucion 480x640.
- Aprendizaje por imitacion: entrenado mediante demostraciones para una tarea de agarre especifica.
- Integracion con LeRobot: se puede ejecutar con `lerobot-rollout` y entrenar con `lerobot-train`.
- Generalizacion heredada del base: al partir de pi05_base, conserva en teoria la capacidad de adaptarse a variaciones del entorno, aunque este fine-tune esta muy especializado.
- No soporta tool calling, razonamiento de texto generativo ni capacidades de lenguaje en el sentido clasico: es un modelo de actuacion robotica.

## Casos de uso

- Automatizacion de picking en almacenes: el modelo puede ejecutar agarres precisos de objetos en posiciones conocidas. Se integraria en un brazo robotico con tres camaras y se invocaria mediante `lerobot-rollout` para ciclos de trabajo repetitivos.
- Recoleccion agricola: la tarea entrenada (agarrar un pepino en un punto concreto) es directamente aplicable a la manipulacion de cultivos en invernaderos o lineas de clasificacion, donde el robot debe localizar y agarrar el fruto.
- Manipulacion en laboratorios: permite automatizar la colocacion de muestras o instrumentos en posiciones especificas, reduciendo la intervencion humana en entornos controlados.
- Robotica domestica: el modelo puede usarse en brazos robotizados de cocina para tareas como colocar ingredientes, siempre que la configuracion de camaras coincida con la del entrenamiento.
- Investigacion en aprendizaje por imitacion: sirve como referencia de un fine-tune ligero (10 pasos, LoRA) sobre pi05_base para una tarea concreta, permitiendo estudiar el efecto de datos pequenos en VLA.
- Despliegue rapido en prototipos: gracias a la integracion con LeRobot y a su licencia Apache-2.0, se puede incorporar en pipelines de robotica existentes sin friccion legal, siempre que se disponga del robot compatible `vibeboard_follower_tilt`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para este policy. Por tanto, no se dispone de datos de tasa de exito, MMLU, HumanEval ni otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base `lerobot/pi05_base` y de la cuantizacion utilizada, que no se especifica.
- GPU recomendadas: no disponible. El entrenamiento requiere CUDA (se usa `--policy.device=cuda` en `lerobot-train`), pero no se indica ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no disponible. No hay datos sobre el tamano del modelo ni sus requisitos de memoria.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, con `lerobot-rollout` para inferencia en robot y `lerobot-train` para entrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de accion robotica, no de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano/parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeCuisine/vds-smoke-20260907-gcp-pi05-v3-us-central1-c-lora40 | Fine-tune VLA (LoRA) | no disponible | no disponible | Apache-2.0 | HuggingFace |
| lerobot/pi05_base | Modelo base VLA | no disponible | no disponible | no disponible (probablemente Apache-2.0) | HuggingFace |
| VibeCuisine/vds-smoke-20260907-gcp-pi05-naaseh1-us-central1-c-lora40 | Fine-tune VLA (LoRA) similar | no disponible | no disponible | Apache-2.0 | HuggingFace |

No se dispone de informacion suficiente para comparar rendimiento, parametros o contexto con otras alternativas de la misma categoria. El unico dato verificable es que este modelo es un adaptador sobre `lerobot/pi05_base`, y que existe otro fine-tune similar del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no hay datos. Al entrenarse con un dataset pequeno (64 episodios), es probable que el modelo refleje las condiciones especificas de la demostracion (iluminacion, posicion de camaras, robot concreto) y no generalice bien fuera de ellas.
- Riesgo de alucinacion: en el contexto robotico, el modelo puede generar acciones incorrectas si las observaciones difieren de las del entrenamiento, lo que podria provocar movimientos inseguros. Se recomienda supervisar el robot durante el despliegue.
- Limitaciones de contexto: el modelo espera exactamente tres camaras (`corner`, `top`, `wrist`) con resolucion 480x640 y un estado de 7 dimensiones. Cualquier variacion en la configuracion de hardware puede hacer que falle.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es obligatorio incluir el aviso de licencia y atribucion. No hay restricciones de uso comercial conocidas.
- Dependencia del modelo base: al ser un adaptador LoRA, no funciona de forma autonoma; requiere cargar `lerobot/pi05_base` como pesos iniciales.
- Ausencia de evaluacion: no se han publicado resultados de tasa de exito, por lo que se desconoce el rendimiento real en robot y no se puede garantizar su fiabilidad en produccion.
- Compatibilidad de hardware: el modelo solo se ha probado con el robot `vibeboard_follower_tilt`; no se garantiza su funcionamiento en otros brazos robotizados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-pi05-v3-us-central1-c-lora40
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-r3-curated
- Blog de Physical Intelligence sobre pi05: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=VibeCuisine/vibepi3-grab-poseexpert-r3-curated
