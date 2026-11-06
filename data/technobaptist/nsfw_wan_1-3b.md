# TechnoBaptist/NSFW_Wan_1.3b

## Resumen

NSFW_Wan_1.3b es un ajuste fino (fine-tune) del modelo de generación de vídeo a partir de texto Wan2.1-T2V-1.3B, desarrollado por Wan-AI (Alibaba). El autor del ajuste, TechnoBaptist, lo ha especializado en la generación de contenido para adultos (NSFW) mediante entrenamiento sobre un corpus de publicaciones de subreddits de contenido explícito. El modelo conserva la arquitectura transformer de difusión para texto-a-vídeo del modelo base, con 1.300 millones de parámetros.

El modelo resuelve el problema de la falta de capacidad de los modelos T2V generalistas para generar contenido adulto coherente: el ajuste busca cubrir un espectro amplio de escenarios, estéticas y acciones descritas en lenguaje natural, manteniendo coherencia temporal en el movimiento. Es relevante en el ámbito de la investigación sobre generación de vídeo sin censura y sobre los efectos del ajuste fino en modelos de difusión.

El autor documenta un proceso de entrenamiento en dos fases (imágenes y después vídeo) que provocó degradación de calidad ("body horror" y artefactos anatómicos), y una segunda tanda experimental con dataset mixto que corrige parcialmente esos problemas. El repositorio ocupa 105,4 GB e incluye múltiples checkpoints intermedios y una guía de prompting.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión texto-a-vídeo (T2V) |
| Parámetros totales | 1.300 millones (1.3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de entrenamiento provienen de comunidades en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo a partir de texto. El ajuste fino se realizó en dos fases originales: las épocas 1-10 se entrenaron sobre un gran dataset de imágenes NSFW para construir la base estética, y las épocas 11-20 exclusivamente sobre vídeo para aprender coherencia temporal y movimiento. Según el autor, la fase de imagen fue demasiado agresiva y provocó "olvido catastrófico" de la anatomía coherente (caras, manos), degradación que la fase de vídeo no pudo recuperar.

Ante los artefactos observados, el autor diseñó una segunda tanda experimental (`wan_1.3B_exp_e1` a `e14`) con un entrenamiento en una sola pasada sobre un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes simultáneamente, con learning rate más conservador, batch sizes menores y un schedule de entrenamiento más corto. El dataset original se compone de las 1.000 mejores publicaciones de aproximadamente 1.250 subreddits NSFW distintas, con captions que siguen las convenciones de etiquetado de esas comunidades. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de vídeo corto a partir de texto (text-to-video) con movimiento coherente nativo, sin necesidad de LoRAs auxiliares en los checkpoints de vídeo.
- Generación de contenido adulto explícito en un espectro amplio de temáticas, estéticas, arquetipos y acciones.
- Comprensión de prompts en lenguaje natural con vocabulario y etiquetas propias de comunidades de contenido para adultos (documentado en `prompting-guide.json`).
- Generación de imágenes fijas en los checkpoints entrenados con fase de imagen (épocas 1-10 del run original).
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning (no es un modelo de lenguaje).
- No se documenta capacidad multilingüe explícita; los datos de entrenamiento están en inglés.
- No se documenta thinking mode, visión, audio ni otras capacidades especiales más allá de la generación T2V.

## Casos de uso

- Investigación sobre generación de vídeo sin censura: el modelo permite estudiar cómo el ajuste fino sobre dominios explícitos afecta a la coherencia anatómica y temporal, comparando los checkpoints originales con los experimentales.
- Estudio de olvido catastrófico en difusión: la documentación del autor sobre la degradación de las épocas 4-20 y su corrección con dataset mixto ofrece un caso práctico para investigar regularización espacial durante el fine-tuning.
- Entrenamiento de LoRAs: el autor recomienda `wan_1.3B_exp_e14.safetensors` como base para entrenar LoRAs por su equilibrio entre contenido explícito y coherencia visual.
- Generación de material creativo para adultos: producción de clips cortos temáticos a partir de prompts descriptivos, usando la guía de prompting incluida para alinear el vocabulario con el dataset de entrenamiento.
- Evaluación de sesgos y seguridad en modelos generativos: el modelo sirve como objeto de estudio para medir la eficacia de filtros de contenido y de las licencias OpenRAIL en la práctica.
- Benchmarking de pipelines T2V: comparar el rendimiento de Wan2.1 base frente a este fine-tune en tareas de coherencia temporal y fidelidad al prompt, con el mismo hardware y configuración de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 105,4 GB, pero corresponde a múltiples checkpoints; un único checkpoint de 1.3B en safetensors ocupa del orden de 2,6 GB en fp16, aunque el pipeline de difusión de vídeo requiere memoria adicional para latentes temporales.
- VRAM estimada para inferencia: no disponible de forma oficial; para modelos T2V de este tamaño se suele requerir GPU dedicada con al menos 16-24 GB, pero el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: no documentadas en la model card (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|
| NSFW_Wan_1.3b | 1.3B | T2V difusión | no disponible | creativeml-openrail-m | NSFW |
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1.3B | T2V difusión | no disponible | no disponible en la información | Generalista |
| Otros fine-tunes NSFW de T2V | no disponible | T2V difusión | no disponible | no disponible | NSFW |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el modelo está entrenado para generar material para adultos; no es apto para uso general ni para entornos sin control de edad.
- Artefactos anatómicos: el propio autor documenta "body horror", distorsiones de caras y manos y degradación de calidad en los checkpoints originales posteriores a la época 3; los checkpoints experimentales mitigan pero no eliminan necesariamente estos problemas.
- Sesgos de datos: el entrenamiento se basa en publicaciones de subreddits, lo que puede reproducir sesgos de género, etnia, cuerpo y estética de esas comunidades.
- Riesgo de alucinación visual: como modelo generativo, puede producir anatomía incoherente o movimientos no solicitados, especialmente en prompts alejados de la distribución de entrenamiento.
- Idioma: los captions y la guía de prompting están en inglés; el rendimiento con prompts en castellano no está documentado.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir las restricciones en redistribuciones); conviene revisar las cláusulas de uso antes de desplegar en producción.
- Repositorio marcado como `not-for-all-audiences`: puede requerir autenticación y aceptación de condiciones en Hugging Face.
- Sin benchmarks públicos: no hay métricas objetivas de calidad, fidelidad al prompt ni coherencia temporal publicadas por el autor.
- Fecha de creación del repositorio: 2026-10-27, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Guía de prompting incluida en el repo: `prompting-guide.json` (dentro del repositorio del modelo)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
