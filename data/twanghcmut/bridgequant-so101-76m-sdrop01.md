# twanghcmut/bridgequant-so101-76m-sdrop01

## Resumen

BridgeQuant SO101 76M sdrop01 es un modelo vision-language-action (VLA) para robótica, desarrollado por el usuario `twanghcmut` y publicado bajo la familia BridgeQuant. Se trata de una variante del modelo `bridgequant-so101-76m` en la que se ha reintroducido el entrenamiento aplicando un `proprio.state_dropout` de 0,1 sobre las mismas tres tareas y el mismo conjunto de datos. El objetivo declarado por el autor es forzar a la política a apoyarse en la cámara de muñeca en lugar de en la trayectoria de articulaciones cuando se produce un fallo de agarre, mejorando así la robustez ante perturbaciones.

El modelo tiene 64.826.027 parámetros reales según los pesos en safetensors (pese a que el nombre comercial indica 76M) y un tamaño de repositorio de 0,3 GB. Emplea pesos en formato safetensors y se distribuye con artefactos auxiliares de normalización (`norm_stats.json`) y ficheros de configuración YAML/JSON. La licencia es `other`, sin que la model card detalle condiciones concretas de uso comercial.

Su relevancia es acotada: no es un modelo de propósito general, sino un checkpoint de investigación para control robótico de bajo nivel sobre un brazo SO101. No se han publicado idiomas soportados, benchmarks ni datos de rendimiento en la información disponible, por lo que su evaluación debe hacerse reproduciendo las tareas originales con el código del repositorio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); detalles internos no disponibles |
| Parametros totales | 64.826.027 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (con `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json`, `train_config.yaml`) |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia BridgeQuant, etiquetada como `bridgequant_async_vla` y orientada a robótica y visión-lenguaje-acción. La información disponible no detalla la arquitectura interna (número de capas, tipo de encoder visual, mecanismo de fusión multimodal ni cabecera de acciones). Lo que sí se especifica es que se trata de un "teacher retrained" a partir de `twanghcmut/bridgequant-so101-76m`, manteniendo idénticas las tres tareas y el conjunto de datos, y modificando únicamente el hiperparámetro `proprio.state_dropout` a 0,1.

La innovación técnica declarada es ese dropout sobre el estado propioceptivo: al enmascarar aleatoriamente la trayectoria de articulaciones durante el entrenamiento, se pretende que la política aprenda a depender de la observación visual de la cámara de muñeca, especialmente tras un agarre fallido. No se indican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; en un modelo de control robótico estas técnicas no son habituales y no se mencionan.

## Capacidades

- Generación de acciones de control robótico para un brazo SO101 a partir de observaciones visuales y estado propioceptivo.
- Procesamiento de visión (cámara de muñeca) combinado con lenguaje y estado de articulaciones en un único modelo VLA.
- Ejecución de tres tareas específicas definidas en el conjunto de datos original, no especificadas en la información disponible.
- Robustez ante fallos de agarre gracias al entrenamiento con `state_dropout`, según la hipótesis del autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido.
- No se documentan capacidades de audio ni de visión general fuera del contexto robótico.

## Casos de uso

- Control de un brazo SO101 en laboratorio: el modelo recibe imágenes de la cámara de muñeca y el estado de las articulaciones y emite acciones; es adecuado para reproducir las tres tareas de entrenamiento con el script `scripts/so101_policy.py`.
- Investigación sobre robustez propioceptiva: permite comparar directamente con `bridgequant-so101-76m` para medir el efecto del `state_dropout` de 0,1 en escenarios de agarre fallido.
- Recuperación tras agarre fallido: el entrenamiento orientado a priorizar la señal visual busca que la política reaccione a la imagen de la muñeca cuando la trayectoria de articulaciones deja de ser fiable.
- Prototipado de políticas VLA de bajo coste: con 64,8M de parámetros y 0,3 GB de pesos, es viable iterar en una estación de trabajo con una sola GPU consumer para experimentos académicos.
- Docencia y reproducción de experimentos: el repositorio incluye configuración de entrenamiento e inferencia, lo que facilita replicar el pipeline en cursos o talleres de robótica.
- Base para ajuste fino en tareas adicionales: al ser un checkpoint pequeño y con pesos safetensors, puede servir como punto de partida para fine-tuning sobre nuevos datasets de manipulación con SO101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 64,8M de parámetros en fp32 los pesos ocupan aproximadamente 0,26 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponibles; por tamaño, una RTX 3060 o superior sería suficiente, aunque no hay confirmación del autor.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, si bien el coste real dependerá del encoder visual no documentado.
- Opciones de despliegue: el autor referencia el repositorio `VLAOpt/bridgequant-async` y el script `scripts/so101_policy.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bridgequant-so101-76m-sdrop01 | 64.826.027 | no disponible | other | Variante con `proprio.state_dropout: 0.1` |
| bridgequant-so101-76m | no disponible en la informacion | no disponible | other | Modelo teacher original, sin dropout propioceptivo |
| Otros modelos VLA para robotica | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre tres tareas concretas sobre SO101; no es un modelo de propósito general.
- La licencia `other` no detalla condiciones; es necesario contactar con el autor o revisar el repositorio antes de cualquier uso comercial.
- No se especifican idiomas soportados ni comportamiento multilingüe.
- No hay benchmarks publicados, por lo que el rendimiento real frente al teacher original no está cuantificado.
- Riesgo de sobreajuste a las condiciones del dataset de entrenamiento (iluminación, posiciones, objetos) no evaluado en la información disponible.
- El `state_dropout` es una hipótesis del autor; no se aportan métricas que confirmen la mejora en recuperación tras agarre fallido.
- El nombre del modelo indica 76M pero los pesos reales suman 64,8M de parámetros, lo que puede generar confusión al estimar requisitos.
- No se documentan sesgos, pero al ser un modelo visual puede heredar sesgos del dataset de captura no descrito.
- En producción requiere integración con el stack `bridgequant-async`; no hay soporte documentado para servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/bridgequant-so101-76m-sdrop01
- Modelo teacher: https://huggingface.co/twanghcmut/bridgequant-so101-76m
- Repositorio de código: https://github.com/VLAOpt/bridgequant-async
- Guía de despliegue: `docs/so101_deploy.md` dentro del repositorio anterior
- Script de política: `scripts/so101_policy.py` dentro del repositorio anterior
