# wonderlandgirly/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3B es un ajuste fino (fine-tune) del modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B de Alibaba, desarrollado por el usuario wonderlandgirly. Su propósito es especializar el modelo base en la generación de clips cortos de contenido para adultos (NSFW), partiendo de una arquitectura transformer de 1.300 millones de parámetros y manteniendo la capacidad nativa de generar movimiento coherente sin necesidad de LoRAs auxiliares.

El modelo surge de la observación de que el Wan2.1 original, pese a su calidad general, no cubre el espectro de estética y acciones del contenido adulto. El autor documenta un proceso de entrenamiento en dos fases (imágenes y después vídeo) que provocó un colapso de calidad anatómica, seguido de una revisión experimental con dataset mixto que corrige parcialmente los artefactos. El repositorio ocupa 105,4 GB e incluye múltiples checkpoints por época, tanto de la serie original como de la experimental.

Es relevante ahora porque los modelos de vídeo abiertos de tamaño reducido (1.3B) permiten inferencia en hardware de consumo, y este fine-tune demuestra tanto el potencial como los riesgos del ajuste sin regularización espacial. La licencia CreativeML OpenRAIL-M impone restricciones de uso que conviene revisar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer texto-a-vídeo (T2V) |
| Parametros totales | 1.300 millones (1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de difusión para texto-a-vídeo de Wan2.1-T2V-1.3B, que procesa prompts en lenguaje natural y genera secuencias de vídeo de corta duración. El fine-tune no modifica la topología del modelo base, sino que ajusta sus pesos mediante entrenamiento supervisado sobre un corpus específico de contenido adulto.

El entrenamiento original se dividió en dos fases: las épocas 1-10 se entrenaron sobre un dataset masivo de imágenes NSFW y las épocas 11-20 exclusivamente sobre vídeo. Según el autor, la fase de imagen fue demasiado agresiva y provocó "olvido catastrófico" de la anatomía coherente (caras, manos), daño que la fase de vídeo no pudo revertir. La revisión experimental sustituye ese esquema por una única ejecución con dataset mixto de 30.000 clips de vídeo y 20.000 imágenes simultáneamente, learning rate más conservador, batch menor y schedule más corto, lo que según la model card mejora la regularización espacial y la estabilidad del movimiento. Los datos provienen de los 1.000 posts principales de aproximadamente 1.250 subreddits NSFW, con captions basados en las convenciones de etiquetado de esas comunidades. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo de clips cortos con movimiento coherente nativo, sin LoRAs auxiliares.
- Comprensión de prompts descriptivos en lenguaje natural dentro del dominio adulto (escenarios, estética, arquetipos, acciones).
- Control de estilo y detalle mediante prompting específico, con guía de prompting incluida en el repositorio (`prompting-guide.json`).
- Capacidad de servir como base para entrenamiento de LoRAs adicionales (el checkpoint experimental `exp_e14` es el recomendado para ello).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas de prompting.

## Casos de uso

- Investigación sobre generación de vídeo para adultos: el modelo permite estudiar cómo el fine-tune sobre dominios específicos afecta a la coherencia temporal y anatómica, comparando checkpoints originales y experimentales.
- Creación de contenido creativo para adultos: generación de clips cortos a partir de descripciones textuales, usando `wan_1.3B_exp_e14.safetensors` como checkpoint de referencia.
- Entrenamiento de LoRAs especializados: el checkpoint experimental está pensado explícitamente como base para LoRA training sobre estilos o personajes concretos.
- Evaluación de artefactos y alineación: el repositorio documenta el "body horror" y la degradación de calidad, lo que lo convierte en un caso de estudio útil sobre fallos de entrenamiento en modelos de difusión.
- Benchmarking de fine-tunes NSFW: permite comparar metodologías de entrenamiento (dos fases frente a dataset mixto) sobre la misma arquitectura base.
- Prototipado en hardware de consumo: con 1.3B parámetros, es viable experimentar en GPUs de gama alta consumer, aunque el repositorio completo de 105,4 GB requiere espacio de almacenamiento considerable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer de difusión de 1.3B en fp16 se sitúa típicamente en el rango de 8-16 GB, pero el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría esperar viabilidad en RTX 3090, RTX 4090 y GPUs de datacenter (A100, H100) para mayor throughput.
- Compatibilidad con GPU consumer: probable en GPUs de 16 GB o más, aunque no confirmado en la documentación.
- Opciones de despliegue: no disponibles; el repositorio solo distribuye pesos safetensors, sin instrucciones de pipeline (vLLM, llama.cpp, Ollama o TGI no aplican directamente a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| NSFW Wan 1.3B | 1.3B | T2V fine-tune NSFW | no disponible | CreativeML OpenRAIL-M | Fine-tune de Wan2.1-T2V-1.3B, múltiples checkpoints |
| Wan2.1-T2V-1.3B (base) | 1.3B | T2V generalista | no disponible | no disponible en la informacion | Modelo original de Alibaba, sin especialización NSFW |
| Alternativas NSFW T2V de 1-2B | no disponible | T2V | no disponible | variable | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está entrenado y orientado a generar material NSFW; su uso requiere verificación de edad y cumplimiento normativo en la jurisdicción correspondiente.
- Artefactos documentados: el autor reconoce "body horror" y degradación de calidad en la serie original (especialmente a partir de la época 3); solo los checkpoints experimentales corrigen parcialmente el problema.
- Sesgos de dominio: el dataset proviene de subreddits, por lo que hereda sesgos de esas comunidades en cuanto a cuerpos, estéticas y arquetipos.
- Riesgo de alucinación visual: como modelo generativo, puede producir anatomía incorrecta, movimiento incoherente o contenido no solicitado.
- Restricciones de licencia: CreativeML OpenRAIL-M incluye cláusulas de uso aceptable que pueden limitar el uso comercial y exigen cumplir las restricciones de la licencia; conviene revisarlas antes de producción.
- Idiomas: no se documenta soporte multilingüe; el prompting efectivo parece ligado a las convenciones en inglés de los subreddits de origen.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- Sin benchmarks ni métricas objetivas publicadas.

## Enlaces

- [HuggingFace: wonderlandgirly/NSFW_Wan_1.3b](https://huggingface.co/wonderlandgirly/NSFW_Wan_1.3b)
- [Modelo base: Wan-AI/Wan2.1-T2V-1.3B](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
