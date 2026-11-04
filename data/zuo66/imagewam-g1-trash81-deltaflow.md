# ZUO66/imagewam-g1-trash81-deltaflow

## Resumen

ImageWAM G1 trash81 deltaflow es un modelo de política robótica (policy) publicado por el usuario ZUO66 en HuggingFace, orientado a una tarea concreta de manipulación: recoger basura y arrojarla a una papelera. Se trata de un artefacto de investigación derivado de ImageWAM con formulación Δ-flow, entrenado sobre 81 demostraciones teleoperadas (52.844 fotogramas a 30 FPS) de un robot G1, con una instrucción de lenguaje fija. No es un modelo de propósito general: es un checkpoint de política visuomotora para una tarea y un robot específicos.

El modelo parte de FLUX.2-klein-base-4B y de un inicializador de acciones derivado de esa base, y se entrena con un esquema de flow matching (FM) más consistencia (IC) tanto en la rama visual como en la de acción. La inferencia es de un solo paso y produce una secuencia de 16 pasos de acción de 76 dimensiones (latent de movimiento de 64 dimensiones más objetivos medidos de mano izquierda y derecha, 6 dimensiones cada una). El repositorio ocupa 11,6 GB e incluye pesos, configuración, manifiesto de release y utilidades de despliegue.

Su relevancia es acotada pero ilustrativa: muestra un pipeline completo de entrenamiento e inferencia de políticas robóticas basadas en modelos de difusión/flow con backbone de imagen grande, con decisiones de ingeniería documentadas (caché de latentes VAE congelados, atención FlashAttention, optimizaciones de sincronización) y un formato de publicación reproducible con hashes SHA256. No hay métricas de éxito en robot real publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (Δ-flow) con backbone de imagen FLUX.2-klein-base-4B y rama de acción; pérdidas FM + IC en visión y acción |
| Parametros totales | no disponible (repo de 11,6 GB; el backbone base es de 4B según su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; horizonte de acción de 16 pasos e historial de 16 pasos |
| Tipos de cuantizacion | no disponible (pesos publicados en `.pt`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible; instrucción de lenguaje fija en inglés: `pick up the trash and throw it into the trash bin` |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`weights/step_016520.pt`) |
| Entradas | Dos vistas (ego_view y chest), 224×224 cada una, concatenadas horizontalmente 224×448; estado actual de 44 dimensiones (solo rama de acción); historial de 16 acciones |
| Salidas | `[16, 76]`: latent de movimiento de 64 dims + mano izquierda Inspire6 (6) + mano derecha Inspire6 (6) |
| Pasos de inferencia | 1 |
| Entrenamiento | 16.520 actualizaciones, 40 épocas, 8 GPUs × batch 8 × acumulación 2 (batch global 128) |
| Datos | 81 demostraciones, 52.844 fotogramas, 30 FPS; sin conjunto de validación |

## Arquitectura y entrenamiento

El modelo combina un backbone de imagen de tipo flow (FLUX.2-klein-base-4B) con una rama de acción que consume el estado actual de 44 dimensiones y el historial de acciones. La formulación Δ-flow aplica flow matching con un término de consistencia (IC) en ambas ramas: la visual y la de acción. Las fuentes de ruido están definidas explícitamente: para imagen, `0.5*z_current + sqrt(0.75)*Gaussian`; para acción, acciones pasadas normalizadas más `0.5*Gaussian`, con ruido añadido a las 76 dimensiones. La pérdida de acción aplica stop-gradient hacia la rama visual, de modo que el objetivo de acción no propaga gradiente al camino visual.

El entrenamiento se realizó sobre 81 demostraciones (52.844 fotogramas a 30 FPS) durante 16.520 actualizaciones de parámetros en 8 GPUs, con batch 8 por GPU, acumulación 2 y batch global 128. No hubo conjunto de validación ni selección del mejor checkpoint: se usaron todos los datos y se publica el estado final de la época 40. A partir de la época 6 se introdujeron optimizaciones equivalentes: caché de latentes VAE congelados y reducción de sincronizaciones de diagnóstico, con restauración completa de optimizador, scheduler y RNG, sin reiniciar el warmup. La configuración de FlashAttention no se modificó. El código de optimización, las comprobaciones numéricas y los informes de velocidad están en `training_support/`.

## Capacidades

- Generación de políticas visuomotoras de un solo paso: dado un par de imágenes (ego_view y chest), el estado de 44 dimensiones y el historial de 16 acciones, produce 16 acciones futuras de 76 dimensiones.
- Control bimanual con objetivos medidos de mano (Inspire6 en cada mano, 6 dimensiones por mano) además de un latent de movimiento de 64 dimensiones.
- Condicionamiento por instrucción de lenguaje fija en inglés para la tarea de recoger basura y arrojarla a la papelera.
- Ejecución de una tarea de manipulación concreta (pick-and-place con lanzamiento) en el robot G1.
- Interfaz de despliegue: CLI de inferencia única, clase Python `TrashPolicy` reutilizable y servicio HTTP de inferencia persistente.
- No se documentan capacidades de tool calling, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo de pensamiento. El modelo no es un LLM.

## Casos de uso

- Reproducción de la tarea de recogida de basura en un robot G1: el modelo recibe las dos vistas y el estado actual y devuelve la secuencia de 16 acciones que el stack de control del robot debe ejecutar; es adecuado porque el checkpoint está entrenado exactamente para esa instrucción y ese hardware.
- Investigación en flow matching aplicado a políticas robóticas: sirve como referencia reproducible de un pipeline Δ-flow con backbone de imagen de 4B, pérdidas FM+IC y stop-gradient entre ramas, con configuración y manifiesto de hashes incluidos.
- Evaluación de estrategias de despliegue de baja latencia: al ser inferencia de un solo paso con salida `[16,76]`, permite medir latencia de política en un servicio HTTP persistente y comparar con alternativas iterativas.
- Estudio de optimizaciones de entrenamiento: el material de `training_support/` (caché de latentes VAE, reducción de sincronizaciones, comprobaciones numéricas y medidas de velocidad) es reutilizable para reproducir o adaptar el entrenamiento en otros conjuntos de demostraciones.
- Base para fine-tuning en tareas de manipulación similares: el inicializador de acciones derivado de la base y los pesos publicados permiten partir de este checkpoint para nuevas tareas con el mismo formato de observación (dos vistas 224×224, estado de 44 dims, historial de 16).
- Validación de protocolos de publicación de modelos robóticos: el `release_manifest.json` con tamaños y SHA256 por fichero y el hash final del modelo facilitan la verificación de integridad en pipelines de CI y en replicaciones.
- Docencia y demostraciones de robótica basada en modelos generativos: el paquete incluye instrucciones de despliegue, CLI y servicio HTTP, lo que simplifica montar una demo controlada del pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput medidas. Tampoco se documenta una prueba de bucle cerrado con los pesos finales; solo se menciona validación en CPU del script de publicación (preprocesado, padding de historial, división de salidas y protocolo HTTP) y prechecks de entrenamiento en `metadata/`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio pesa 11,6 GB e incluye pesos del modelo y del inicializador de acciones; además requiere descargar por separado el FLUX.2 base y el autoencoder (AE), por lo que el consumo real supera el tamaño del checkpoint.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento se realizó en 8 GPUs con batch 8 por GPU, lo que sugiere GPUs de datacenter (A100/H100 o similares), pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? No disponible. Con un backbone de 4B y pesos en FP32/FP16 en `.pt`, es probable que requiera GPUs de gama alta, pero no hay datos confirmados.
- Opciones de despliegue: CLI de inferencia única, interfaz Python `TrashPolicy` y servicio HTTP persistente incluidos en el repositorio (ver `DEPLOYMENT.md`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La inferencia es de un solo paso, lo que reduce coste frente a políticas iterativas, pero no se publican medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de políticas robóticas (por ejemplo, variantes de diffusion policy, ACT o políticas basadas en VLA) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa. Tampoco se ofrecen resultados de este modelo frente a alternativas.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para la instrucción fija `pick up the trash and throw it into the trash bin` en un robot G1; no generaliza a otras tareas ni instrucciones sin reentrenamiento.
- Sin conjunto de validación ni selección de mejor checkpoint: se publica el estado de la época 40 tras usar todos los datos, por lo que no hay garantía de que sea el punto óptimo.
- Sin prueba de bucle cerrado con los pesos finales: la model card indica explícitamente que no se añadió una prueba en robot real con el checkpoint publicado; solo hay validación en CPU del script y prechecks de entrenamiento.
- Licencia no disponible: no se puede asumir uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: el condicionamiento lingüístico es una instrucción fija en inglés; no hay soporte multilingüe documentado.
- Dependencia de componentes externos: requiere descargar el FLUX.2 base y el AE por separado, lo que añade complejidad de despliegue y posibles desajustes de versión.
- Sin optimizer ni estado de entrenamiento: el repositorio no incluye estado de optimizador ni vídeos de demostración originales, lo que dificulta reanudar el entrenamiento o auditar los datos.
- Riesgo de sobreajuste a las 81 demostraciones y al entorno concreto de recogida de basura; no se documentan sesgos, pero la distribución de datos es muy estrecha.
- La salida es un latent de movimiento SONIC más objetivos medidos de mano; la cadena de control real debe implementarse según las instrucciones de despliegue, y un error en esa integración puede producir comportamientos inseguros en el robot.

## Enlaces

- HuggingFace: https://huggingface.co/ZUO66/imagewam-g1-trash81-deltaflow
- `DEPLOYMENT.md` (incluido en el repositorio): instrucciones de uso, CLI, `TrashPolicy` y servicio HTTP.
- `training_support/` (incluido en el repositorio): código de optimización, comprobaciones numéricas e informes de velocidad.
- `metadata/` (incluido en el repositorio): prechecks de entrenamiento y `training_config_original.yaml`.
- `release_manifest.json` (incluido en el repositorio): tamaños y SHA256 por fichero.
- No se han encontrado en la información proporcionada papers, blogs, repositorios externos ni demos adicionales.
