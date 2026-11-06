# WorldEdit0/spatiallogic-qwen3.5-9b-cot

## Resumen

SpatialLogic Qwen3.5-9B CoT es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-9B, desarrollado por el usuario WorldEdit0 y publicado en Hugging Face bajo licencia Apache 2.0. El modelo se orienta a tareas de razonamiento espacial ("spatiallogic") con generación de cadenas de pensamiento, y emplea el modelo base Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros. En el momento de la consulta, el repositorio no registra descargas ni interacciones, lo que sugiere una publicación reciente y de baja difusión.

El repositorio, de 57,0 GB, contiene pesos en safetensors y aparentemente aloja una carpeta `0step-test/` con los activos iniciales sin modificar del modelo base (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), correspondiente al paso global 0 con cero actualizaciones del optimizador y cero muestras consumidas. Según la model card, se trata de un test de conectividad y subida, no de un modelo entrenado ni de un checkpoint completo de reanudación.

La relevancia actual del modelo es limitada: la información pública disponible no confirma que existan snapshots entrenados verificados en el Hub. La model card describe la política de checkpoints y la configuración de entrenamiento, pero no documenta resultados, capacidades evaluadas ni datos de rendimiento. Cualquier uso en producción debería considerar esta incertidumbre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-9B); detalles específicos no disponibles |
| Parametros totales | 9.000 millones (según el nombre del modelo base; no confirmado en la información) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento (max_length=4096); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors en BF16 según la configuración de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (configuración de transformers); GGUF no disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros. El ajuste fino se realizó con entrenamiento de parámetros completos en BF16 sobre 8 nodos y 64 GPUs, con batch por GPU de 8, acumulación de gradientes de 1 y batch global de 512. Se empleó ZeRO-2 con `overlap_comm=false`, gradient checkpointing, AdamW con learning rate de 2e-5, 1.000 ventanas de warmup y learning rate constante posterior. La longitud máxima de secuencia fue de 4.096 tokens, con `min_pixels=4096` y `max_pixels=262144`, lo que indica entrenamiento multimodal con imágenes o vídeo.

El corpus de entrenamiento tiene un índice fijo de 27.543.089 filas y 53.795 ventanas globales por época; se descartan 49 filas finales por época para evitar relleno con muestras repetidas. La deduplicación global de entradas y objetivos eliminó 40.253 filas, y se excluyeron 85 filas por imágenes no disponibles. La validación usa vídeos y episodios disjuntos del entrenamiento, incluidos episodios de identidades agibot compartidas entre fuentes cortas, largas y leap, con una muestra fija de 1.792 filas evaluada cada 200 ventanas. No se documenta el uso de RLHF o DPO; el proceso descrito es exclusivamente SFT. La revisión de datos fijada es `82e5aae49f61799e5aff317e7548ad8395b648bc`.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento (CoT), según el nombre del modelo y la etiqueta `spatiallogic`.
- Procesamiento de entrada multimodal con imágenes o vídeo, a tenor de los parámetros `min_pixels` y `max_pixels` y del corpus de episodios y vídeos.
- Razonamiento espacial y lógico, presumiblemente orientado a tareas de percepción y comprensión de escenas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque la generación CoT es compatible con razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: la visión parece probable por la configuración de píxeles; el audio no está documentado.

## Casos de uso

- Razonamiento espacial sobre imágenes: el modelo podría emplearse para responder preguntas que requieran localizar objetos, estimar relaciones espaciales o interpretar escenas, aprovechando el ajuste sobre datos de episodios y vídeos.
- Análisis de vídeo de robótica: dado el uso de identidades agibot y episodios cortos, largos y leap, encajaría en tareas de comprensión de trayectorias y manipulación en entornos simulados o reales.
- Generación de cadenas de pensamiento para depuración: la etiqueta CoT sugiere utilidad para producir trazas de razonamiento intermedias que permitan auditar decisiones en tareas lógicas.
- Investigación en SFT multimodal: el repositorio documenta con detalle la configuración de entrenamiento, por lo que puede servir como referencia para reproducir pipelines de ajuste fino a gran escala.
- Evaluación comparativa de modelos de razonamiento espacial: al derivar de Qwen3.5-9B, permite comparar el efecto del SFT sobre el modelo base en tareas de lógica espacial.
- Prototipado en entornos con recursos moderados: al ser un modelo de 9.000 millones de parámetros, puede desplegarse en una GPU de 24 GB con cuantización, aunque no se han publicado pesos cuantizados.
- No se recomienda su uso en producción sin verificar previamente que existan snapshots entrenados y evaluados, dado que la carpeta documentada es un test de conectividad sin entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, en torno a 20-24 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia en BF16 sin cuantizar; RTX 4090 (24 GB) para inferencia en BF16 ajustada o cuantizada.
- Compatibilidad con GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización o secuencias cortas; en GPUs de 16 GB probablemente solo con cuantización de 4 bits.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para serving; llama.cpp y Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SpatialLogic Qwen3.5-9B CoT | 9.000 M (según base) | 4.096 en entrenamiento | Apache 2.0 | Pesos en safetensors; snapshots entrenados no confirmados | SFT multimodal con CoT; sin benchmarks publicados |
| Qwen3.5-9B (base) | 9.000 M | No disponible | Apache 2.0 (presumible) | Público en Hugging Face | Modelo base sin ajuste específico de razonamiento espacial |
| Alternativas de 7-9B con visión | 7.000-9.000 M | Variable | Variable | Públicas | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; los datos de benchmarks y contexto nativo del modelo base no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene una carpeta `0step-test/` con los activos iniciales sin entrenar; no se confirma la existencia de snapshots entrenados verificados en el Hub.
- No hay benchmarks, evaluaciones ni métricas de rendimiento publicadas.
- No se documentan los idiomas soportados ni el contexto nativo del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la ausencia de evaluaciones publicadas.
- Sesgos desconocidos; no se documenta ninguna auditoría de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero la falta de verificación de los pesos entrenados desaconseja su uso en producción.
- El entrenamiento usó secuencias de 4.096 tokens; entradas más largas pueden degradar el rendimiento.
- El repositorio ocupa 57,0 GB y acumula pesos privados; la model card advierte sobre el consumo de almacenamiento de la cuenta.
- La reanudación exacta del entrenamiento requiere checkpoints completos del servidor, no disponibles en el Hub.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/WorldEdit0/spatiallogic-qwen3.5-9b-cot)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
