# weberrt95/coca-experiment

## Resumen

El modelo `weberrt95/coca-experiment` es un prototipo de investigación desarrollado por el usuario `weberrt95` que implementa la arquitectura Coca orientada a tareas de retrieval. No se trata de un modelo entrenado ni listo para producción, sino de una configuración a escala "nano" que documenta los valores por defecto y los formatos de archivo para experimentos de recuperación. El repositorio incluye un punto de entrada de Python (`finetune.py`) con un ejemplo ejecutable o de entrenamiento, un archivo de configuración (`config.json`), un archivo de configuración de entrenamiento (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) con 49.600 parámetros.

La arquitectura emplea atención flash, fusión mediante cross-attention, activación approx GELU y normalización BatchNorm. El checkpoint de inicialización no está entrenado y el autor no presenta ninguna métrica de rendimiento; el propósito es servir como base para evaluaciones futuras y pruebas de humo. La licencia es MIT, y el modelo se publica con el fin de documentar los aspectos experimentales sin reclamar resultados verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (escala nano) con atención flash, fusión cross-attention, activación approx GELU y normalización BatchNorm |
| Parametros totales | 49.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo checkpoint de inicialización en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada de Coca (Contrastive Captioners) adaptada para retrieval. El modelo utiliza atención flash para los cálculos de atención y un mecanismo de fusión basado en cross-attention. La activación es approx GELU y la normalización se realiza con BatchNorm. El "nano" escala indica una configuración mínima, pensada para validar el pipeline y los formatos de archivo.

El entrenamiento no se ha completado: el checkpoint incluido es un punto de inicialización válido para pruebas de humo, no un modelo entrenado. La receta por defecto documentada en `training_args.json` utiliza el optimizador `lion` con un programador `onecycle`, pero estos valores son puntos de partida y no evidencia de una ejecución finalizada. No se menciona ningún dataset de entrenamiento, ni procesos de RLHF/DPO. El autor sugiere que una primera evaluación útil se haría sobre Flickr30k, reportando la métrica de la tarea con al menos tres semillas y una baseline de capacidad comparable.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint es de inicialización y no está entrenado, por lo que no existe evidencia de generación, razonamiento, código, matemáticas o visión.
- No soporta tool calling ni function calling; no hay mención a ello en la documentación.
- No soporta agentes ni multi-step reasoning; es una implementación experimental de retrieval.
- Capacidades multilingües: no disponible.
- No se documenta ningún modo especial (thinking mode, visión, audio). La única "capacidad" es servir como plantilla para pruebas de humo con el script incluido.

## Casos de uso

- Investigación en arquitecturas de retrieval: el modelo proporciona un punto de partida para experimentar con la arquitectura Coca, especialmente con la fusión cross-attention y la atención flash, dado que el código fuente está incluido.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización sirve para verificar que los scripts, los archivos de configuración y el formato de pesos funcionan correctamente antes de lanzar un entrenamiento completo.
- Estudio de eficiencia paramétrica: con solo 49.600 parámetros, es útil para analizar el comportamiento de modelos a escala nano en tareas de recuperación, permitiendo comparaciones de capacidad y coste computacional.
- Evaluación de recetas de optimización: el repositorio documenta una receta por defecto (lion + onecycle) que puede usarse como referencia para comparar estrategias de entrenamiento alternativas con las mismas semillas y presupuesto de ajuste.
- Docencia sobre sistemas de retrieval: los archivos `config.json` y `training_args.json` sirven como ejemplo educativo de los elementos necesarios para montar un experimento de recuperación con una arquitectura basada en cross-attention.
- Desarrollo de benchmarks de retrieval: el propio autor propone evaluar el modelo en Flickr30k con al menos tres semillas y una baseline de capacidad comparable, lo que lo convierte en un candidato para pruebas de metodología experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente en la model card que no se reclama ninguna puntuación de benchmark en este repositorio. El checkpoint de inicialización no ha sido entrenado, por lo que cualquier comparación numérica sería engañosa. Las búsquedas web no arrojan resultados de rendimiento para este modelo específico.

## Requisitos de hardware

- Al ser un modelo nano con 49.600 parámetros, el consumo de memoria es mínimo: cabe en cualquier GPU con más de 1 GB de VRAM y puede ejecutarse en CPU sin problemas.
- GPU recomendada: no existe una recomendación específica; cualquier GPU moderna (o incluso CPU) es suficiente para pruebas de humo.
- Sí cabe en GPUs de consumo, como RTX 4090 o inferiores, así como en hardware de gama baja.
- Opciones de despliegue: no se pueden usar frameworks como vLLM, llama.cpp u Ollama con carga automática, porque es una implementación personalizada. Para ejecutarlo es necesario usar el script `finetune.py` directamente y escribir un adaptador explícito para cargar los pesos.
- Latencia y throughput: no disponibles; al no ser un modelo entrenado ni optimizado para inferencia, no se han medido.

## Comparativa con modelos similares

| Modelo | Tarea | Escala | Licencia | Parametros | Estado |
|---|---|---|---|---|---|
| weberrt95/coca-experiment | Retrieval | nano | MIT | 49.600 | Inicialización, no entrenado |
| sn3hapo95nd/coca-experiment | Generación | xlarge | no disponible | no disponible | Inicialización, no entrenado |

Se ha identificado otro repositorio con nombre similar (`sn3hapo95nd/coca-experiment`) en Hugging Face, también de tipo Coca y orientado a generación, pero en escala "xlarge" y por un autor diferente. No se dispone de datos de comparación de rendimiento ni de especificaciones completas para este modelo. No se han encontrado otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado en términos de robustez, equidad o transferencia de dominio, tal y como reconoce el propio autor.
- No existe evidencia de rendimiento: el repositorio no publica benchmarks y la model card indica que no se reclama ninguna puntuación.
- Es una implementación personalizada y no es compatible con APIs de carga automática genéricas; requiere un adaptador explícito.
- Debido a su escala nano (49.600 parámetros), el modelo no tiene utilidad práctica en tareas reales de retrieval; su valor es exclusivamente experimental.
- Al ser usado con datasets externos, se deben revisar los términos de las fuentes de datos por separado, como se indica en la documentación.
- La licencia MIT es permisiva, pero no implica ninguna garantía de funcionamiento ni aptitud para uso comercial o en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weberrt95/coca-experiment
- Modelo similar sn3hapo95nd/coca-experiment: https://huggingface.co/sn3hapo95nd/coca-experiment

No se han encontrado papers, blogs o demos oficiales adicionales en la búsqueda web.
