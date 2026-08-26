# Toan2408/vit5-vietnamese-phonetic-eclm

## Resumen

El modelo `Toan2408/vit5-vietnamese-phonetic-eclm` es una adaptación del modelo **ViT5-Base**, desarrollado originalmente por VietAI, con un entrenamiento adicional específico para la corrección y puntuación de errores fonéticos en textos transcritos por sistemas de reconocimiento automático del habla (ASR) en vietnamita. Lo publica el autor Toan2408 bajo licencia MIT, y está pensado como una etapa de post-procesamiento o rescoring de salidas ASR, abordando confusiones típicas del vietnamita como pares de consonantes iniciales (`tr/ch`, `s/x`, `d/gi/r`), finales (`c/t`, `n/ng`), vocales y tonos (`hỏi/ngã`).

El modelo emplea una arquitectura Transformer encoder-decoder de tipo T5 con 225,95 millones de parámetros, heredada de ViT5-Base. La innovación principal es un mecanismo de **Phonetic-Weighted Loss** con un factor de escala 3,5 que enfatiza las confusiones fonéticas durante el entrenamiento, junto con un **Phonetic Syllable Gating** diseñado para evitar la sobre-corrección de frases correctamente transcritas. Está orientado exclusivamente a tareas de corrección de texto en vietnamita y no ofrece capacidades multimodales ni de razonamiento general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Encoder-Decoder (T5) |
| Parametros totales | 225.950.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado (pesos en safetensors, FP32/FP16 probable) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura **ViT5-Base**, un Transformer encoder-decoder preentrenado sobre un corpus vietnamita de alta calidad mediante el enfoque de T5 (texto a texto). Sobre esta base, el autor aplica un entrenamiento adicional supervisado orientado a la corrección de errores fonéticos, con una función de pérdida ponderada fonéticamente (factor 3,5) que da mayor peso a las confusiones de sonidos frecuentes en vietnamita. Además, se incorpora un mecanismo de **Phonetic Syllable Gating** que modula las salidas para preservar la estructura sintáctica de oraciones correctas, reduciendo el riesgo de sobre-corrección.

El entrenamiento utiliza la descomposición Unicode NFD para analizar y cubrir sistemáticamente los pares fonéticos problemáticos. No se han publicado detalles sobre el volumen de datos de entrenamiento ni sobre el proceso de preprocesado. La inferencia se realiza con el formato de texto a texto, anteponiendo el prefijo `sửa lỗi chính tả:` al texto de entrada.

## Capacidades

- Corrección de errores fonéticos y ortográficos en textos vietnamitas, especialmente en salidas de ASR.
- Rescoring y post-procesamiento de hipótesis de reconocimiento del habla.
- Detección de confusiones específicas del vietnamita: consonantes iniciales (`tr/ch`, `s/x`, `d/gi/r`, `l/n`), finales (`c/t`, `n/ng`, `ch/t`), vocales (`i/y`, `ươn/ương`) y tonos (`hỏi/ngã`).
- Generación de texto corregido con una ventana de contexto máxima de 64 tokens (según el ejemplo de inferencia).
- Soporte de tareas de secuencia a secuencia (text2text-generation) en vietnamita.
- No dispone de soporte para tool calling, agentes, visión, audio ni razonamiento multimodal.

## Casos de uso

- Post-procesamiento de transcripciones de ASR en vietnamita: integrar el modelo en un pipeline de reconocimiento para corregir errores fonéticos antes de la salida final, mejorando la legibilidad de subtítulos o documentos generados por voz.
- Rescoring de hipótesis de ASR: utilizar la puntuación del modelo para reordenar listas de hipótesis generadas por un sistema de reconocimiento, eligiendo la transcripción más coherente fonéticamente.
- Corrección de textos generados por dictado en aplicaciones móviles o asistentes de voz, reduciendo errores en búsquedas o mensajes escritos.
- Mejora de subtítulos automáticos en vídeos vietnamitas, donde las confusiones fonéticas son frecuentes en nombres propios o palabras homófonas.
- Preprocesamiento de corpus textuales para entrenamiento de otros modelos de NLP vietnamita, limpiando errores de transcripción y normalizando variantes ortográficas.
- Herramienta de ayuda a la redacción para hablantes no nativos que escriben con errores de tono o consonantes, ofreciendo sugerencias de corrección basadas en similitud fonética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas comparativas con otros modelos de corrección o ASR en vietnamita.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,9 GB en FP32 para el modelo completo (225M parámetros). Con cuantización a FP16 o int8, se puede reducir a ~0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti, RTX 2060) puede ejecutar inferencia sin problemas. Para entrenamiento adicional, se recomienda al menos una GPU con 8 GB (RTX 3070 o superior).
- Es viable en CPU para uso puntual, aunque la latencia será mayor (del orden de 1-2 segundos por frase de 64 tokens).
- Despliegue: compatible con la librería Transformers de Hugging Face, pudiendo usarse con vLLM, TGI o llama.cpp si se convierten los pesos a GGUF (aunque no hay conversión oficial).
- Latencia estimada: en una GPU RTX 3090, la generación de una frase de 64 tokens con beam search (3 beams) tarda menos de 100 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|---|
| `Toan2408/vit5-vietnamese-phonetic-eclm` | T5 (encoder-decoder) | 225,95M | no disponible | Corrección fonética ASR vietnamita | MIT |
| `VietAI/vit5-base` | T5 (encoder-decoder) | 225,95M | 512 (típico) | Modelo base vietnamita, tareas generales | MIT |
| `VietAI/vit5-large` | T5 (encoder-decoder) | 738M | 512 (típico) | Modelo base vietnamita, mayor capacidad | MIT |

La comparativa se basa en el modelo base ViT5, ya que no se han encontrado otros modelos específicos de corrección fonética vietnamita. La ventaja del modelo de Toan2408 es su entrenamiento específico para errores ASR, mientras que los modelos base son más generales y pueden requerir afinamiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el idioma vietnamita; no soporta otros idiomas.
- La longitud de contexto está limitada a 64 tokens en el ejemplo de inferencia, por lo que no es adecuado para textos largos sin dividir en fragmentos.
- No se han publicado evaluaciones formales ni datos de sesgos; es posible que presente errores en palabras raras o nombres propios no cubiertos en el entrenamiento.
- El riesgo de sobre-corrección existe, aunque el diseño de Phonetic Syllable Gating intenta mitigarlo; se recomienda validar en casos reales.
- La licencia MIT permite uso comercial, pero no se proporcionan garantías sobre la calidad o el rendimiento en producción.
- El modelo no incluye capacidades de generación de código, razonamiento matemático o interacción multimodal.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Toan2408/vit5-vietnamese-phonetic-eclm)
- [Repositorio oficial de ViT5 (VietAI)](https://github.com/vietai/ViT5)
- [Paper de ViT5](https://ar5iv.labs.arxiv.org/html/2205.06457)
- [Modelo base ViT5-base en Hugging Face](https://huggingface.co/VietAI/vit5-base)
