# Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1

## Resumen

Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1 es un modelo de reconocimiento automático del habla (ASR) especializado en transcribir cantonés a romanización jyutping. Lo desarrolla el usuario Yvthyvq mediante un ajuste fino completo (full fine-tuning) del modelo base Qwen/Qwen3-ASR-1.7B, un modelo de la familia Qwen3 orientado a ASR con aproximadamente 2.038 millones de parámetros.

El modelo resuelve un problema muy concreto y poco cubierto por los sistemas ASR generalistas: la conversión directa de audio en cantonés a romanización estándar (粵拼), en lugar de a caracteres chinos o a texto en mandarín. Para ello se entrenó sobre unas 39.774 parejas de audio y transcripción en romanización, extraídas de diálogos de películas, con un total inferior a 26 horas de audio.

Es relevante ahora porque la mayoría de los modelos ASR multilingües tratan el cantonés como una variante del chino y devuelven caracteres, mientras que este modelo produce jyutping de forma nativa. Su licencia Apache 2.0 y su tamaño contenido (1.7B) lo hacen desplegable en hardware de gama alta de consumo y en entornos de investigación lingüística del cantonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer de audio a texto, arquitectura exacta no detallada en la model card) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la model card advierte de degradacion en audios superiores a 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card solo documenta inferencia en bfloat16) |
| Idiomas soportados | chino (zh) y cantonés (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3-ASR-1.7B, un sistema de reconocimiento del habla de la familia Qwen3 que emite texto con un prefijo de idioma y el contenido transcrito tras el marcador `<asr_text>`. Sobre esta base se realizó un ajuste fino de todos los parámetros (full fine-tuning), no un ajuste con adaptadores, durante 3 épocas.

Los datos de entrenamiento consisten en aproximadamente 39.774 pares de audio y romanización jyutping procedentes de diálogos de películas (conjunto vinculado a Yvthyvq/ZoengjYvthgaaij-MouxZaakhdungj-Liujgoj), sumando menos de 26 horas de voz. La configuración documentada es: GPU NVIDIA A800 de 80 GB, batch size 8 con acumulación de gradiente 4 (batch efectivo 32), learning rate 2e-5, optimizador AdamW por defecto de Transformers, precisión bfloat16 y una duración total de entrenamiento de aproximadamente 1 hora y 50 minutos. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Transcripción de voz en cantonés a romanización jyutping (粵拼), el objetivo principal del ajuste.
- Reconocimiento de habla en chino y cantonés, heredado de los idiomas declarados del modelo base.
- Salida con formato estructurado: prefijo `language Chinese<asr_text>` seguido de la transcripción en romanización.
- Procesamiento de audio mediante la librería `qwen-asr` y la clase `Qwen3ASRModel`.
- No se documenta soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción ni modo de pensamiento extendido.

## Casos de uso

- Subtitulado y transcripción de contenido audiovisual en cantonés: el modelo convierte directamente los diálogos de películas y series a jyutping, útil para aprendizaje de la lengua y para corpus lingüísticos anotados fonéticamente.
- Investigación lingüística del cantonés: generación de transcripciones romanizadas alineadas con audio para estudios de fonética, fonología y variación dialectal, con una tasa de error documentada del 23 % en WER.
- Creación de material didáctico para estudiantes de cantonés: el jyutping es el sistema de romanización estándar en la enseñanza, y el modelo permite producir transcripciones de audio real a partir de grabaciones.
- Archivado y digitalización de fondos orales en cantonés: convertir entrevistas, grabaciones históricas o archivos de audio en texto romanizado indexable y buscable.
- Evaluación comparativa de sistemas ASR para lenguas siníticas: sirve como referencia especializada frente a modelos generalistas como Qwen2.5-Omni-7B-ASR en tareas de romanización.
- Integración en pipelines de procesamiento de audio por lotes: al ser un modelo de 1.7B con licencia Apache 2.0, puede desplegarse en servidores propios para transcribir grandes volúmenes de audio en cantonés sin depender de servicios externos.
- Prototipado de asistentes de voz en cantonés: la salida romanizada puede alimentar etapas posteriores de normalización o traducción en aplicaciones de voz.

## Benchmarks y rendimiento

Evaluación sobre 1.014 audios de prueba (primeros mil audios del conjunto CanCLID/zoengjyutgaai), con 17.889 palabras de referencia:

| Modelo | WER | Accuracy |
|---|---|---|
| Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1 | 23,00 % | 77,00 % |
| Qwen2.5-Omni-7B-ASR | 44,26 % | 55,74 % |
| Qwen2.5-Omni-7B-ASR-V2 | 38,20 % | 61,80 % |

Desglose de errores del modelo: 2.976 sustituciones, 678 omisiones y 461 inserciones sobre las 17.889 palabras de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 4 GB (2.038 millones de parámetros), por lo que se estima un consumo de VRAM de entre 5 y 8 GB según longitud de audio y batch.
- GPU recomendadas: NVIDIA A800 (empleada en el entrenamiento), A100, H100 para despliegue de producción; RTX 4090 y RTX 3090 para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en bfloat16; no se documentan requisitos oficiales mínimos.
- Opciones de despliegue: la model card documenta exclusivamente la librería `qwen-asr` (`pip install -U qwen-asr`) con `Qwen3ASRModel.from_pretrained`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento completo (3 épocas sobre menos de 26 horas de audio) requirió aproximadamente 1 hora y 50 minutos en una A800.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (cantonés romanizado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1 | 2.038 M | no disponible | 23,00 % | Apache 2.0 | Hugging Face |
| Qwen2.5-Omni-7B-ASR | 7B (aproximado, familia Omni) | no disponible | 44,26 % | no disponible en la informacion | Hugging Face |
| Qwen2.5-Omni-7B-ASR-V2 | 7B (aproximado, familia Omni) | no disponible | 38,20 % | no disponible en la informacion | Hugging Face |

No se dispone de datos de otros sistemas ASR especializados en cantonés en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente para cantonés a romanización jyutping; su rendimiento en otros idiomas u otros formatos de transcripción (por ejemplo, caracteres chinos) puede ser deficiente.
- La salida incluye siempre el prefijo `language Chinese<asr_text>`, que debe eliminarse explícitamente si se desea solo la romanización.
- Para audios superiores a 30 segundos puede producirse truncamiento u omisión de palabras; se recomienda segmentar el audio.
- La precisión depende de la calidad del audio, el ruido de fondo y la velocidad del habla; el WER del 23 % en el conjunto de evaluación implica un margen de error considerable para aplicaciones de producción sensibles.
- El conjunto de entrenamiento (menos de 26 horas, diálogos de películas) es reducido y de dominio acotado, lo que puede limitar la generalización a otros registros (conversación espontánea, habla técnica, acentos regionales).
- No se documentan análisis de sesgos ni evaluaciones de robustez fuera del conjunto de prueba indicado.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda citar también el modelo base Qwen3-ASR según indica el autor.
- El número de descargas (30) y de likes (0) es muy bajo, por lo que no existe validación comunitaria amplia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conjunto de evaluación: https://huggingface.co/datasets/CanCLID/zoengjyutgaai
- Conjunto de entrenamiento (referenciado en la model card): Yvthyvq/ZoengjYvthgaaij-MouxZaakhdungj-Liujgoj (no se proporciona URL directa)
