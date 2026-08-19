# Yvthyvq/Liujgoj-Cantonese-Qwen2.5-Omni-7B-ASR

## Resumen

**Liujgoj-Cantonese-Qwen2.5-Omni-7B-ASR** es un modelo de reconocimiento automático del habla (ASR) especializado en transcribir cantonés hablado directamente a la ortografía romanizada **Liujgoj** (溜歌粵語羅馬字), en lugar de a caracteres chinos. Lo desarrolla el autor **Yvthyvq** y se publica bajo licencia Apache 2.0. El modelo parte de **Qwen2.5-Omni-7B**, un modelo multimodal de audio y texto, y se somete a un pipeline de entrenamiento en tres etapas: *continued pretraining* (CPT), *supervised fine-tuning* (SFT) y ajuste específico para ASR.

La relevancia de este modelo radica en que ofrece una alternativa directa para obtener transcripciones fonéticas romanizadas del cantonés, incluyendo tonos, límites de palabra y estructura silábica, algo poco común en los sistemas ASR convencionales que suelen generar caracteres chinos. Con **8.931.813.888 parámetros** (aproximadamente 8,93 mil millones), el modelo hereda la arquitectura de Qwen2.5-Omni, que integra un codificador de audio y un decodificador de lenguaje. La longitud de contexto no se especifica en la documentación disponible, aunque probablemente herede la de Qwen2.5-Omni (32.768 tokens en su versión original, dato no confirmado).

El modelo está pensado para desarrolladores e investigadores que trabajan con procesamiento de habla cantonesa, lingüística computacional o herramientas educativas para la romanización del cantonés. Su principal limitación documentada es un problema de degeneración en el que alrededor del 1,2% de las frases del conjunto de evaluación generan repeticiones infinitas de la sílaba "yiu".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Omni (transformers, multimodal audio-texto) |
| Parametros totales | 8.931.813.888 (8,93B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredado de Qwen2.5-Omni, no especificado) |
| Tipos de cuantizacion | Safetensors (no se mencionan GGUF u otros formatos) |
| Idiomas soportados | zh (chino), yue (cantonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de **Qwen2.5-Omni-7B**, un modelo multimodal que combina un codificador de audio con un decodificador de lenguaje basado en transformer. La arquitectura incluye un módulo de *cross-attention* entre las características de audio y el espacio de texto, lo que permite la transcripción directa de habla a texto.

El entrenamiento se realizó en tres etapas secuenciales:

1. **Continued Pretraining (CPT)**: se continuó el preentrenamiento con aproximadamente **14 millones de datos relacionados con Liujgoj** para introducir al modelo en la ortografía romanizada, la fonología cantonesa, el vocabulario y las reglas de escritura. Una decisión de diseño destacable es que **no se pre-registraron sílabas cantonesas como tokens adicionales** en el tokenizador, lo que simplificó el pipeline y evitó la inicialización de miles de embeddings nuevos.

2. **Supervised Fine-Tuning (SFT)**: se ajustó el modelo con datos basados en instrucciones para tareas como conversión entre caracteres chinos y Liujgoj, segmentación silábica, análisis estructural y comprensión semántica del cantonés.

3. **Automatic Speech Recognition (ASR)**: se afinó con **35.032 pares de audio y transcripción**, con un total de aproximadamente **18 horas de audio** en formato WAV mono a 16 kHz, extraído de películas cantonesas. El objetivo es mapear el habla cantonesa directamente a texto Liujgoj estructurado.

No se menciona el uso de técnicas como RLHF o DPO en la documentación disponible.

## Capacidades

- **Transcripción ASR directa**: convierte audio cantones hablado en texto romanizado Liujgoj, incluyendo sílabas, tonos, límites de palabra y estructura de oración.
- **Generación de texto en Liujgoj**: tras el CPT y SFT, el modelo puede generar texto estructurado en ortografía Liujgoj.
- **Conversión bidireccional**: es capaz de convertir entre caracteres chinos cantoneses y Liujgoj, y viceversa.
- **Segmentación silábica**: identifica y segmenta sílabas cantonesas dentro de una transcripción.
- **Análisis estructural**: realiza análisis de la estructura lingüística del cantonés romanizado.
- **Comprensión semántica**: entiende el significado de expresiones cantonesas en el contexto de la romanización.
- **No se documenta soporte para tool calling, agentes ni capacidades de visión** en la información proporcionada.

## Casos de uso

- **Subtitulado de contenido audiovisual cantonés**: el modelo puede transcribir automáticamente diálogos de películas o series en cantonés a texto romanizado Liujgoj, útil para subtítulos en sistemas de romanización o para investigación lingüística.
- **Documentación y preservación lingüística**: permite generar transcripciones fonéticas precisas de habla cantonesa para archivos de dialectos, diccionarios digitales o corpus de investigación.
- **Herramientas educativas para aprender cantonés**: estudiantes de cantonés pueden usar el modelo para obtener la romanización exacta de audio de práctica, incluyendo tonos y límites de palabra, facilitando el aprendizaje de la pronunciación.
- **Análisis lingüístico computacional**: investigadores pueden emplear las transcripciones Liujgoj generadas para estudiar variaciones fonológicas, entonación o patrones de habla en corpus cantoneses.
- **Sistemas de transcripción para medios de comunicación**: emisoras o productoras que necesiten documentar entrevistas o programas en cantonés con una notación fonética estandarizada.
- **Integración en pipelines de ASR para lenguas minoritarias**: el enfoque de tres etapas (CPT, SFT, ASR) puede servir como referencia para adaptar modelos multilingües a otras variedades lingüísticas con sistemas de escritura romanizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un informe de evaluación detallado en los archivos `BENCHMARK.md` y `BENCHMARK.pdf` del repositorio, pero los datos concretos (tasas de error de palabra, comparaciones con otros modelos) no se incluyen en la información proporcionada. El autor indica que se evaluaron 4 modelos ASR en la tarea de dictado de cantonés romanizado Liujgoj, pero los resultados numéricos no están disponibles en esta ficha.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 8,93 mil millones de parámetros en precisión FP16, se necesitan aproximadamente 18 GB de VRAM. Con cuantización de 8 bits, unos 9 GB; con 4 bits, unos 5 GB (estimaciones basadas en el tamaño del modelo, no confirmadas por el autor).
- **GPU recomendadas**: tarjetas con al menos 24 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantización 4-bit, una RTX 3090 o RTX 4080 (16 GB) podría ser suficiente, aunque no está documentado.
- **Compatibilidad con GPU de consumo**: sí, es factible en GPUs de consumo con 16 GB o más si se aplica cuantización, aunque el formato safetensors original no incluye versiones GGUF listas para usar.
- **Opciones de despliegue**: el modelo usa la librería `transformers`, por lo que puede desplegarse con Hugging Face Transformers, y potencialmente con vLLM o TGI si se adapta, aunque no hay documentación al respecto. Para ejecución en CPU o edge, se necesitaría convertir a GGUF (no disponible actualmente).
- **Latencia y throughput**: no disponible. No se proporcionan mediciones en la documentación.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. El autor menciona que se evaluaron 4 modelos ASR en la tarea de dictado Liujgoj, pero no se listan los modelos comparados ni sus resultados. Como referencia general, los sistemas ASR convencionales para cantonés (por ejemplo, Whisper de OpenAI o modelos basados en caracteres chinos) no generan salida romanizada, por lo que este modelo ocupa un nicho específico. No se puede ofrecer una tabla comparativa fiable sin datos verificados.

## Limitaciones y advertencias

- **Problema de degeneración documentado**: en la transcripción del dataset `zoengjyutgaai` (fuente `mouzaakdung`), el 1,2% de las frases (56 frases) producen repeticiones infinitas de la sílaba "yiu". El autor atribuye esto a un desequilibrio en los datos de CPT/SFT y a una debilidad en el *cross-attention* del codificador de audio durante la inferencia con pausas o tartamudeos.
- **Alucinación en audio atípico**: el modelo puede generar patrones repetitivos cuando el audio contiene pausas, alargamientos vocálicos o límites ambiguos, debido a que el entrenamiento ASR no incluyó datos de habla disfluente.
- **Cobertura limitada del entrenamiento**: solo 18 horas de audio procedente de películas cantonesas, lo que puede no representar todas las variantes dialectales, registros o acentos del cantonés.
- **Idiomas restringidos**: el modelo solo está entrenado para cantonés y chino; no es multilingüe ni adecuado para otros idiomas.
- **Sin garantía de producción**: con solo 19 descargas y 0 likes en Hugging Face, el modelo no ha sido validado ampliamente por la comunidad; se recomienda evaluación exhaustiva antes de usarlo en entornos de producción.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el usuario debe asumir la responsabilidad de cualquier sesgo o error en las transcripciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen2.5-Omni-7B-ASR
- Informe de evaluación en Markdown: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen2.5-Omni-7B-ASR/blob/main/BENCHMARK.md
- Informe de evaluación en PDF: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen2.5-Omni-7B-ASR/resolve/main/BENCHMARK.pdf
- Dataset de referencia (zoengjyutgaai, fuente mouzaakdung): https://huggingface.co/datasets/CanCLID/zoengjyutgaai/tree/main/source/mouzaakdung
