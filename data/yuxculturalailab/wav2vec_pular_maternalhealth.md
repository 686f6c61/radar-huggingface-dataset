# YUXCulturalAILab/wav2vec_pular_maternalhealth

## Resumen

El modelo `YUXCulturalAILab/wav2vec_pular_maternalhealth` es un sistema de reconocimiento automático del habla (ASR) desarrollado por el YUX Cultural AI Lab (KitalaAI) para el idioma **pulaar (fula)**, concretamente para el dialecto **Futa Toro**, con un enfoque específico en el dominio de la **salud materna**. Se trata de un fine-tuning de un modelo wav2vec 2.0 preentrenado, adaptado a un corpus de habla pulaar con expresiones relacionadas con la atención sanitaria materna.

El modelo resuelve el problema de la falta de herramientas ASR para lenguas africanas de bajos recursos, un ámbito donde la mayoría de los sistemas comerciales no ofrecen cobertura. Su relevancia radica en que permite transcribir automáticamente consultas y mensajes de salud en pulaar, facilitando la documentación clínica y la investigación en entornos donde el acceso a personal médico especializado es limitado.

Con 315,5 millones de parámetros, el modelo sigue la arquitectura wav2vec 2.0, que aprende representaciones de audio mediante auto-supervisión y luego se ajusta con datos etiquetados. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. El repositorio contiene únicamente pesos en formato safetensors (1,3 GB) y no se han publicado métricas de rendimiento más allá de las incluidas en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (fine-tuned) |
| Parametros totales | 315.496.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | ff (pulaar/fula, dialecto Futa Toro) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **wav2vec 2.0**, propuesta por Meta AI en 2020. Esta arquitectura emplea un codificador convolucional que procesa audio crudo a 16 kHz, seguido de un transformer que aprende representaciones contextualizadas mediante un objetivo contrastivo sobre representaciones cuantizadas. El preentrenamiento se realiza de forma auto-supervisada con grandes volúmenes de audio sin etiquetar, y posteriormente se fine-tunea con datos transcritos para la tarea de ASR.

En este caso, el fine-tuning se ha realizado sobre un dataset de habla pulaar con expresiones de salud materna. La model card no especifica el modelo base exacto, el método de ajuste (full fine-tuning o LoRA), ni los hiperparámetros utilizados. Se indica únicamente que la frecuencia de muestreo es de 16 kHz. El número de parámetros (315M) sugiere que se parte de la variante *large* de wav2vec 2.0, aunque no se confirma explícitamente.

## Capacidades

- **Reconocimiento automático del habla (ASR)**: transcribe audio en pulaar (dialecto Futa Toro) a texto.
- **Dominio específico**: entrenado con vocabulario y expresiones relacionadas con salud materna, lo que mejora la precisión en ese ámbito.
- **Idioma de bajos recursos**: cubre una lengua africana con escasa representación en sistemas ASR comerciales.
- **Formato de audio**: acepta entradas de audio a 16 kHz (mono, presumiblemente).
- **Salida de texto**: genera transcripciones en alfabeto pulaar (no se especifica la ortografía exacta).
- **Uso en investigación**: puede emplearse para evaluación comparativa de sistemas ASR en lenguas africanas.

No se documentan capacidades adicionales como traducción, diarización de hablantes, ni soporte multilingüe más allá del pulaar.

## Casos de uso

- **Transcripción de consultas de salud materna**: el modelo puede transcribir grabaciones de consultas prenatales o postnatales en pulaar, facilitando la creación de historiales clínicos digitales y el análisis de contenido por parte de personal sanitario.
- **Apoyo a trabajadores comunitarios de salud**: en zonas rurales donde el pulaar es la lengua dominante, el modelo permite convertir mensajes de voz en texto para su registro y seguimiento, reduciendo la carga administrativa.
- **Investigación lingüística y sociolingüística**: los investigadores pueden utilizar el modelo para transcribir corpus orales de pulaar, acelerando el estudio de la fonética, la morfología y la variación dialectal.
- **Desarrollo de asistentes de voz para salud**: integrado en aplicaciones móviles, el modelo puede servir de base para un asistente que responda a preguntas frecuentes sobre salud materna en pulaar, aunque se requiere un componente de comprensión del lenguaje adicional.
- **Evaluación comparativa de sistemas ASR**: al ser un modelo de referencia para pulaar, puede utilizarse como baseline en trabajos de investigación que desarrollen nuevos sistemas de reconocimiento para lenguas africanas.
- **Documentación de testimonios y encuestas**: en estudios de campo sobre salud materna, el modelo transcribe entrevistas y encuestas orales, permitiendo un análisis cualitativo más eficiente.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con WER (Word Error Rate) y CER (Character Error Rate), comparando un modelo baseline (presumiblemente el modelo preentrenado sin fine-tuning) con el modelo fine-tuneado:

| Modelo | WER | CER |
|---|---:|---:|
| Baseline | 0,5249 | 0,1351 |
| Fine-tuned | 0,3474 | 0,1458 |

Se observa una mejora significativa en WER (de 52,5% a 34,7%) tras el fine-tuning, aunque el CER empeora ligeramente (de 13,5% a 14,6%). No se han publicado resultados comparativos con otros modelos ASR para pulaar ni con sistemas multilingües. Tampoco se especifica el conjunto de evaluación ni el número de hablantes.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. A partir del tamaño del modelo (315M parámetros) y el formato safetensors (1,3 GB en fp32), se pueden hacer las siguientes estimaciones:

- **VRAM para inferencia**: en fp32, el modelo ocupa aproximadamente 1,3 GB, por lo que una GPU con al menos 2 GB de VRAM sería suficiente para inferencia en lote pequeño. En fp16, el uso de memoria se reduce a unos 650 MB.
- **GPUs recomendadas**: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060) puede ejecutar el modelo. Para procesamiento por lotes o entrenamiento adicional, se recomienda una GPU con 8 GB o más (RTX 3070, A100, etc.).
- **CPU**: es posible ejecutar el modelo en CPU con HuggingFace Transformers, aunque la latencia será mayor. No se recomienda para aplicaciones en tiempo real.
- **Opciones de despliegue**: el modelo es compatible con la librería `transformers` de HuggingFace, así como con `torchaudio` y pipelines de ASR. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia optimizados.
- **Latencia y throughput**: no se han publicado datos. En una GPU moderna (RTX 3090), se espera una latencia de decenas de milisegundos por audio de pocos segundos, pero esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR específicos para pulaar o para lenguas africanas de bajos recursos con los que comparar directamente. El modelo wav2vec 2.0 base y large son los predecesores genéricos, pero no están adaptados a pulaar. No se han encontrado benchmarks comparativos en la documentación disponible.

## Limitaciones y advertencias

- **Variabilidad dialectal**: el modelo fue entrenado únicamente con el dialecto Futa Toro, por lo que su rendimiento puede degradarse significativamente con otros dialectos del pulaar (por ejemplo, Futa Jallon, Macina, etc.).
- **Dominio restringido**: el fine-tuning se realizó con datos de salud materna; el modelo puede fallar en la transcripción de vocabulario general o de otros dominios (política, agricultura, etc.).
- **Riesgo de errores de transcripción**: con un WER del 34,7%, aproximadamente una de cada tres palabras se transcribe incorrectamente, lo que puede ser inaceptable en contextos médicos donde la precisión es crítica.
- **No es un sustituto del consejo médico**: la model card advierte explícitamente que el modelo no debe considerarse una herramienta de diagnóstico ni un reemplazo del juicio profesional.
- **Datos de entrenamiento incompletos**: no se especifica el número de ejemplos, la distribución de hablantes, ni el proceso de recopilación, lo que limita la reproducibilidad y la evaluación de sesgos.
- **Sesgos potenciales**: al ser un modelo entrenado con un corpus reducido y específico, puede presentar sesgos de género, edad o procedencia geográfica de los hablantes, no documentados.
- **Licencia**: CC-BY-4.0 permite uso comercial, pero exige atribución. No se indica si los datos de entrenamiento tienen restricciones adicionales.
- **Estado del modelo**: con 0 descargas y 0 likes en HuggingFace, el modelo es muy reciente y no ha sido validado por la comunidad, por lo que se recomienda una evaluación independiente antes de su uso en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/YUXCulturalAILab/wav2vec_pular_maternalhealth)
- [Perfil de YUXCulturalAILab](https://huggingface.co/YUXCulturalAILab)
- [Paper de wav2vec 2.0 (arXiv)](https://arxiv.org/abs/2006.11477)
- [Publicación de Meta AI](https://ai.meta.com/research/publications/wav2vec-2.0-a-framework-for-self-supervised-learning-of-speech-representations/)
- [Publicación en Research Facebook](https://research.facebook.com/publications/wav2vec-2-0-a-framework-for-self-supervised-learning-of-speech-representations/)
