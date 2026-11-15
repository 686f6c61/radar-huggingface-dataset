# tachara-ai/decisio-gemma-4-12b-vision

## Resumen

decisio-gemma-4-12b-vision es un repositorio de pesos parciales publicado por tachara-ai dentro del ecosistema del servidor de inferencia decisio. No se trata de un modelo completo, sino de un extracto de los pesos de visión del modelo google/gemma-4-12B-it, empaquetados en un único fichero `vision.safetensors` de 99,8 MB en bf16 con 10 tensores. Su función es permitir que un servidor decisio ejecutado sobre Apple silicon (backend MLX) pueda procesar imágenes cuando la conversión MLX del modelo base solo contiene el modelo de lenguaje.

El problema que resuelve es muy concreto: las conversiones a MLX de Gemma 4 12B distribuidas habitualmente incluyen únicamente los pesos del transformer de lenguaje, de modo que la capacidad multimodal queda inoperativa. Este repositorio aporta los tensores del patch embedder y su proyección, copiados bit a bit desde el modelo original de Google en la revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`, junto con los metadatos necesarios (`vision_config.json` y `vision_manifest.json`) para una carga offline verificable por sha256.

Es relevante ahora porque el despliegue local de modelos multimodales en hardware de consumo Apple es una vía cada vez más habitual para prototipado e investigación, y este paquete elimina la fricción de tener que reconstruir manualmente los pesos de visión. La licencia es Apache 2.0, heredada del modelo fuente, y el tamaño del repositorio es de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pesos de visión de Gemma 4 12B (patch embedder y proyección); el modelo completo es un transformer multimodal con lectura de imágenes sin encoder de visión separado |
| Parametros totales | No disponible (el repositorio contiene solo 10 tensores de visión; el modelo base es de 12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en los pesos incluidos; cuantizaciones del modelo completo no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`vision.safetensors`), más JSON de configuración y manifiesto |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una extracción literal de pesos. Contiene 10 tensores en bf16 que corresponden al patch embedder y a su proyección, es decir, la parte del modelo que convierte parches de imagen en embeddings que el transformer de lenguaje puede consumir. Según la model card, Gemma 4 12B lee imágenes sin un encoder de visión separado, de modo que estos tensores son la totalidad del camino visual del modelo.

Los pesos se copiaron bit a bit desde `google/gemma-4-12B-it` en la revisión indicada, manteniendo nombres, formas, dtypes y bytes. Se incluye `vision_config.json` con la configuración de visión y los identificadores de tokens de imagen del modelo fuente, y `vision_manifest.json` con la forma, dtype y sha256 de cada tensor, además del sha256 del fichero completo (`112725a204111dfdc5d29d2c4456818e4b6de33109991edfaa7120c731fb06a8`). No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque esos detalles pertenecen al modelo base y no se reproducen aquí.

La innovación práctica es operativa: un mismo fichero sirve tanto para el modelo base como para cualquier modelo afinado derivado de él, ya que el ajuste fino no modifica los pesos de visión. El servidor decisio descarga el fichero una vez, verifica su sha256 y lo fusiona con la conversión MLX del modelo de lenguaje; alternativamente, puede pasarse una ruta local con `--vision-weights PATH` para arrancar sin conexión.

## Capacidades

- Lectura de imágenes: aporta al modelo base la capacidad de procesar entradas de imagen y texto conjuntamente (pipeline image-text-to-text).
- Integración con el modelo de lenguaje: los embeddings visuales se inyectan en el transformer de Gemma 4 12B para tareas de descripción, respuesta a preguntas sobre imágenes y razonamiento visual.
- Reutilización entre modelos afinados: válido para el modelo base y para cualquier fine-tune del mismo, al no alterar el ajuste los pesos de visión.
- Verificación de integridad: manifiesto con sha256 por tensor y del fichero completo.
- Funcionamiento offline: configuración y tokens de imagen incluidos, sin dependencias de red en el arranque.
- Tool calling, agentes, modo thinking, audio y capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base y no se documentan aquí).

## Casos de uso

- Despliegue local de un asistente visual en Mac: arrancar decisio con `--backend mlx --images on` permite que un Gemma 4 12B convertido a MLX responda preguntas sobre capturas de pantalla, fotografías o diagramas sin depender de la nube.
- Investigación en multimodalidad sobre Apple silicon: disponer de los pesos de visión exactos y verificables facilita reproducir experimentos con el modelo base y comparar variantes afinadas sin reconstruir el pipeline visual.
- Prototipado de aplicaciones de accesibilidad: descripción automática de imágenes para usuarios con discapacidad visual, ejecutada en hardware local para evitar enviar contenido sensible a servicios externos.
- Procesamiento de documentos escaneados: extracción y descripción de contenido visual en flujos de digitalización, aprovechando el contexto del modelo de lenguaje para resumir o clasificar el contenido.
- Evaluación de fine-tunes multimodales: al servir el mismo fichero de visión para todos los modelos derivados, se pueden comparar ajustes sobre el mismo sustrato visual con una sola descarga.
- Entornos sin conectividad: arranque con `--vision-weights PATH` en máquinas aisladas, con verificación de integridad previa mediante el manifiesto sha256.
- Desarrollo de demos y notebooks: integración rápida en prototipos de image-text-to-text sin gestionar manualmente la fusión de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 0,1 GB para el repositorio; el modelo completo Gemma 4 12B requiere además su conversión MLX.
- VRAM/unified memory: el fichero de visión ocupa 99,8 MB en bf16; el consumo total depende de la conversión MLX del modelo de lenguaje de 12B, para la que no se proporcionan cifras.
- GPU recomendadas: Apple silicon con backend MLX, según la model card; no se documentan requisitos para CUDA.
- GPU de consumo: el diseño apunta a equipos Apple con memoria unificada; no hay datos sobre qué modelos concretos de Mac son suficientes.
- Opciones de despliegue: servidor decisio con `--backend mlx --images on`, o con `--vision-weights PATH` para modo offline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decisio-gemma-4-12b-vision (tachara-ai) | Pesos de visión extraídos | 10 tensores (99,8 MB) | No disponible | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it | Modelo multimodal completo | 12B | No disponible | Términos del modelo fuente (ver su model card) | Hugging Face |
| Conversiones MLX de Gemma 4 12B sin visión | Modelo de lenguaje únicamente | 12B (solo LM) | No disponible | Según la conversión | Repositorios de la comunidad |

No se dispone de datos de rendimiento comparado ni de otras alternativas equivalentes de extracción de pesos de visión en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin la conversión MLX del modelo de lenguaje de Gemma 4 12B no produce ninguna salida.
- Dependencia del modelo base: los pesos son de Google y su uso, comportamiento y limitaciones se rigen por la model card de `google/gemma-4-12B-it`; los sesgos y el riesgo de alucinación son los del modelo fuente y no se documentan en este repositorio.
- Idiomas soportados: no disponibles; conviene consultar la documentación del modelo base antes de desplegar en producción multilingüe.
- Licencia: Apache 2.0 según el repositorio, heredada del modelo fuente; verificar los términos completos de Gemma 4 12B para uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 15 de noviembre de 2026, sin señales de validación por parte de la comunidad.
- Alcance limitado: solo cubre el camino visual (patch embedder y proyección); no incluye otros componentes del modelo.
- Verificación obligatoria: en despliegues offline conviene comprobar el sha256 del fichero contra el valor del manifiesto antes de fusionarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tachara-ai/decisio-gemma-4-12b-vision
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Revisión de origen de los pesos: `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7` en `google/gemma-4-12B-it`
- Paper, blog, repositorio de decisio y demos: no disponibles en la información proporcionada.
