# VasilisAsim/AST-finetuned-CREMA_D

## Resumen

VasilisAsim/AST-finetuned-CREMA_D es un modelo de clasificación de audio publicado en HuggingFace por el usuario VasilisAsim. Se trata de un Audio Spectrogram Transformer (AST) afinado sobre el conjunto de datos CREMA-D, un corpus multimodal de emociones expresadas por actores. El modelo tiene 86.193.414 parámetros y está etiquetado con la pipeline `audio-classification`, por lo que su función esperada es asignar una clase (previsiblemente una emoción) a fragmentos de audio, no generar texto libre.

El repositorio tiene un tamaño de 0,3 GB, consistente con un checkpoint en precisión de 16 o 32 bits de un transformer de menos de 100 millones de parámetros. Los pesos se distribuyen en formato `safetensors` y el modelo es compatible con la librería `transformers`, además de estar marcado como `endpoints_compatible`. La etiqueta `arxiv:1910.09700` apunta al artículo original de AST, "AST: Audio Spectrogram Transformer", de Gong et al.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con una model card automática sin documentación real (todos los campos aparecen como "[More Information Needed]"). Por tanto, la información disponible es escasa y cualquier evaluación de calidad debería hacerse empíricamente. Aun así, su tamaño reducido y su arquitectura estándar lo convierten en un candidato razonable para prototipos de clasificación de emociones en voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), según la etiqueta `audio-spectrogram-transformer` y la referencia `arxiv:1910.09700` |
| Parametros totales | 86.193.414 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de audio, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Pipeline | audio-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-06 |
| Fecha de actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

El modelo se basa en el Audio Spectrogram Transformer (AST), presentado en el artículo con identificador arXiv 1910.09700. AST es una adaptación de la arquitectura Vision Transformer (ViT) al dominio del audio: el espectrograma de entrada se divide en parches solapados que se tratan como una secuencia de tokens, y se procesan con mecanismos de auto-atención pura, sin convoluciones ni recurrencia. El modelo original de AST ronda los 87 millones de parámetros, cifra coherente con los 86.193.414 reportados aquí.

El nombre del checkpoint indica un ajuste fino sobre CREMA-D (Crowd-sourced Emotional Multimodal Actors Dataset), un corpus de audio y vídeo con actores que interpretan distintas emociones. No se ha publicado en la información disponible ni el número de tokens o muestras de entrenamiento, ni la composición exacta del dataset, ni si se aplicó alguna técnica de ajuste como RLHF o DPO (irrelevante en clasificación). Tampoco se detalla el régimen de entrenamiento, los hiperparámetros, el preprocesado de audio (frecuencia de muestreo, número de frames) ni la cabeza de clasificación utilizada.

## Capacidades

- Clasificación de audio: el modelo recibe una señal de audio y devuelve una etiqueta de clase, integrable mediante la pipeline `audio-classification` de `transformers`.
- Reconocimiento de emociones en voz: por el conjunto de datos CREMA-D asociado al nombre, lo más probable es que esté ajustado para discriminar emociones habladas. La lista concreta de etiquetas y su número no están documentados en la información disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en HuggingFace Inference Endpoints.
- Capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión, matemáticas o audio generativo: no disponibles (no es un modelo generativo).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Análisis de emociones en centros de atención telefónica: el modelo puede clasificar la emoción predominante en cada segmento de una llamada, permitiendo métricas agregadas de satisfacción o detección de conversaciones de riesgo.
- Investigación en psicología y ciencias del comportamiento: como componente para etiquetar corpus de audio de estudios sobre expresión emocional, dado su tamaño reducido y facilidad de ejecución local.
- Moderación de contenido en plataformas de audio: detección de fragmentos con carga emocional negativa (enfado, miedo) para priorizar revisión humana.
- Análisis de entrevistas y focus groups: segmentar y etiquetar la emoción de los participantes para estudios de mercado cualitativos, con procesado por lotes.
- Etiquetado automático de archivos de audio: preprocesar grandes volúmenes de grabaciones para enriquecer su metadata antes de indexarlas en un buscador o sistema de gestión documental.
- Prototipado de asistentes empáticos: usar la emoción detectada como señal para adaptar la respuesta de un sistema de diálogo (aunque el modelo en sí no genera texto, sí puede alimentar la lógica de decisión).
- Investigación en representaciones de audio: servir como baseline afinado para comparar técnicas de clasificación de emociones en voz con arquitecturas alternativas (wav2vec2, HuBERT, CNN sobre mel-espectrogramas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor es una plantilla automática sin sección de resultados y la búsqueda web no ha devuelto documentación técnica, papers ni evaluaciones asociadas a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86,2 millones de parámetros, el checkpoint ocupa aproximadamente 345 MB en fp32 y unos 172 MB en fp16. Con el coste de activaciones y buffers, cabría esperar un uso de VRAM por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna sirve. No es necesario hardware de gama alta; incluso una GTX 1650, una T4 o una RTX 3060 son más que suficientes.
- Consumer GPU: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU modernas o en CPU.
- Opciones de despliegue: pipeline `transformers` de HuggingFace (la vía natural), exportación a ONNX Runtime o TorchScript para inferencia optimizada, y HuggingFace Inference Endpoints gracias a la etiqueta `endpoints_compatible`. vLLM, llama.cpp, Ollama y TGI no aplican, ya que están orientados a modelos de lenguaje generativo.
- Latencia y throughput estimados: no disponibles. Dependerán de la duración del audio de entrada, del dispositivo y de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VasilisAsim/AST-finetuned-CREMA_D | 86,2 M | Clasificacion de audio | No disponible | No disponible | HuggingFace |
| MIT/ast-finetuned-audioset-10-10-0.4593 | ~87 M | Clasificacion de audio (AudioSet) | No disponible | BSD-3-Clause | HuggingFace |
| Alternativas de clasificacion emocional (wav2vec2, HuBERT, WavLM afinados) | Variable (95 M - 1 000 M) | Clasificacion de audio / emociones | No disponible | Variable segun checkpoint | HuggingFace |

La comparación se ofrece únicamente como referencia de categoría, ya que no se han publicado datos de rendimiento de este checkpoint concreto que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Model card vacía: todos los campos de la documentación aparecen como "[More Information Needed]". No hay información sobre datos de entrenamiento, hiperparámetros, métricas ni procedencia del ajuste fino.
- Licencia no especificada: al no declararse una licencia, no puede asumirse permiso para uso comercial. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Sesgos potenciales: CREMA-D es un corpus de actores estadounidenses con un rango demográfico limitado. Un modelo ajustado sobre él puede generalizar mal a otras variedades dialectales, idiomas, edades o géneros. Esta advertencia es una inferencia basada en las características conocidas del dataset, no un dato confirmado en la documentación del modelo.
- Riesgo de alucinación: en clasificación no aplica el concepto de alucinación generativa, pero sí existe riesgo de predicciones erróneas con alta confianza (sobreconfianza en clases poco representadas).
- Limitaciones de contexto e idioma: al ser un modelo de audio, no hay una ventana de contexto de texto. No se documenta qué idiomas o acentos maneja.
- Sin validación externa: cero descargas y cero likes, sin evaluaciones de terceros ni benchmarks publicados. No hay evidencia empírica de su calidad.
- Despliegue en producción: sin métricas de calibración, matriz de confusión ni curvas ROC, no debería usarse en decisiones críticas sin una validación propia sobre el dominio objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VasilisAsim/AST-finetuned-CREMA_D
- Paper de la arquitectura AST: https://arxiv.org/abs/1910.09700
- Conjunto de datos CREMA-D (referencia del ajuste fino, no enlazado por el autor): no disponible en la información proporcionada
- Demo: no disponible
- Blog o documentación del autor: no disponible
- Otros enlaces relevantes: no disponibles
