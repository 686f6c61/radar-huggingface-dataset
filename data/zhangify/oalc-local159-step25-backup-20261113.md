# zhangify/oalc-local159-step25-backup-20261113

## Resumen

OALC local159 — step 25 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de una instantánea intermedia (paso 25 de un entrenamiento de 250 pasos) derivada del run `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`, lo que sugiere un ajuste fino sobre una base de la familia Qwen 3.5 con una tasa de aprendizaje de 1e-06 y modo "thinking" desactivado. El repositorio conserva únicamente los pesos, el tokenizador y la configuración del modelo; no incluye estado del optimizador ni permite reanudar el entrenamiento de forma exacta.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 18,2 GB, lo que es coherente con pesos en precisión de 32 bits o con varios ficheros que incluyen copias redundantes. La arquitectura declarada es `qwen3_5` y el pipeline es `image-text-to-text`, de modo que el modelo está orientado a tareas multimodales de entrada de imagen y texto con salida de texto.

Su relevancia es limitada y muy específica: no es un modelo listo para producción ni un lanzamiento oficial, sino un artefacto de investigación que documenta un estado intermedio de entrenamiento. Resulta útil para quienes quieran inspeccionar la evolución de un ajuste fino sobre Qwen 3.5, reproducir parcialmente experimentos o analizar los pesos en un punto concreto del proceso, pero carece de evaluación de calidad o seguridad publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, segun tag de la libreria) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura `qwen3_5` y el pipeline `image-text-to-text`, lo que indica una base de la familia Qwen 3.5 con capacidad de procesar imágenes y texto. No se dispone de detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni configuración del codificador visual; el autor no los publica en la model card y solo se conserva la configuración original del repositorio.

El checkpoint corresponde al paso 25 de un run de 250 pasos con tasa de aprendizaje 1e-06, identificado como `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`. El nombre sugiere un ajuste con muestreo local y una componente KL (posiblemente destilación o regularización frente a un modelo de referencia), con el modo "thinking" desactivado. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El repositorio incluye un fichero `backup_provenance.json` con generaciones de origen y sumas de comprobación, pero no estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de texto condicionada por imagen y texto (pipeline `image-text-to-text`), según la etiqueta del modelo.
- Conversación multi-turno: la etiqueta `conversational` indica soporte de diálogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse mediante la infraestructura de inferencia de Hugging Face.
- Capacidades multimodales de entrada visual: al tratarse de un pipeline image-text-to-text, se espera procesamiento de imágenes junto a instrucciones textuales.
- Modo "thinking" desactivado en el entrenamiento (`thinkFalse`), por lo que no se espera un modo de razonamiento extendido explícito.
- Tool calling, function calling, agentes y multilingüismo: no disponible (no se documentan en la model card).

## Casos de uso

- Investigación sobre ajuste fino de Qwen 3.5: el checkpoint permite inspeccionar cómo evolucionan los pesos en el paso 25 frente a la base original, útil para estudiar dinámicas de entrenamiento con LR 1e-06 y regularización KL.
- Reproducción parcial de experimentos: al conservar pesos, tokenizador y configuración, se puede cargar el modelo con `transformers` y comparar salidas en distintas etapas del run de 250 pasos.
- Análisis de deriva respecto al modelo base: comparar perplejidad o comportamiento cualitativo entre este checkpoint intermedio y la base Qwen 3.5 para detectar cambios tempranos inducidos por el ajuste.
- Evaluación de pipelines multimodales image-text-to-text: probar la tubería de inferencia con entradas de imagen y texto para validar el formato de prompts y la tokenización.
- Docencia y experimentación con checkpoints intermedios: sirve como ejemplo práctico de artefacto de investigación con procedencia documentada y checksums.
- Pruebas de integración con endpoints compatibles: validar el despliegue en infraestructura de inferencia de Hugging Face antes de decidir si el checkpoint es adecuado para etapas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros, en FP16 se requieren aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en FP32 serían unos 18 GB, coherente con el tamaño del repositorio (18,2 GB).
- Cuantización: no se publican variantes GGUF, AWQ ni GPTQ, por lo que habría que generarlas a partir de los safetensors para reducir huella de memoria.
- GPU recomendadas: para FP16, una GPU con 16-24 GB (RTX 4090, A10G, L4) sería suficiente para pesos; para FP32 se necesitaría una A100 de 40 GB o superior.
- ¿Cabe en GPU de consumo? Sí, en FP16 cabría en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para contexto moderado; en FP32 no cabría en GPUs de consumo típicas.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OALC local159 step 25 | 4,54 B | no disponible | no disponible | Hugging Face (repo de investigación) | Checkpoint intermedio, sin evaluación publicada |
| Qwen 3.5 base (familia) | no disponible | no disponible | no disponible | no disponible | Base de la que deriva este ajuste; sin datos concretos en la información proporcionada |
| Alternativas de ~4-5 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint de investigación en el paso 25 de 250, no un modelo final; su calidad no está evaluada ni garantizada.
- El autor declara explícitamente que la subida no implica ninguna evaluación de calidad o seguridad.
- No incluye estado del optimizador ni permite reanudar el entrenamiento exacto.
- Licencia no disponible: no se puede asumir uso comercial sin confirmación del autor.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Al ser un artefacto de investigación con 0 descargas y 0 likes, no hay evidencia de uso en producción ni retroalimentación de la comunidad.
- El nombre del run incluye `thinkFalse`, por lo que no se debe esperar un modo de razonamiento extendido.

## Enlaces

- Hugging Face: https://huggingface.co/zhangify/oalc-local159-step25-backup-20261113
- Fichero de procedencia: `backup_provenance.json` (referenciado en la model card, dentro del repositorio)
- Paper, blog, repositorio o demo adicionales: no disponible
