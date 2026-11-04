# thanhle829/kneexpert-xray-kl-advanced

## Resumen

KneeXpert X-ray KL Advanced es una colección de clasificadores de imagen preentrenados y ajustados finamente para la gradación Kellgren-Lawrence (KL0-KL4) de radiografías de rodilla, desarrollada por el autor thanhle829 en el marco del proyecto de grado KneeXpert de la Universidad Ton Duc Thang. El repositorio agrupa tres backbones distintos (DINOv3 ViT-B, ConvNeXtV2-Base y Swin-Base) entrenados con los mismos splits de datos, función de pérdida y aumento de datos, lo que permite comparar arquitecturas bajo un protocolo común.

El modelo resuelve una tarea de clasificación de 5 clases sobre recortes de rodilla en escala de grises de 224x224 píxeles derivados del dataset público *Knee Osteoarthritis Dataset with Severity Grading* (Kaggle, derivado de OAI). El checkpoint principal, basado en DINOv3 ViT-B, alcanza un QWK de 0,869 en test y un macro-F1 de 0,727, con TTA de flip horizontal y temperatura calibrada sobre validación.

Es relevante ahora porque demuestra que backbones de visión de propósito general (DINOv3, ConvNeXtV2, Swin) transferidos con layer-wise learning rate decay, class weighting y label smoothing pueden obtener métricas de concordancia (QWK) altas en una tarea médica de gradación ordinal, aunque el propio autor lo declara explícitamente como prototipo de investigación no validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres backbones de clasificación de imagen: DINOv3 ViT-B, ConvNeXtV2-Base (in22k) y Swin-Base (in22k), vía timm |
| Parametros totales | No disponible (no se detalla el recuento por backbone en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión); entrada de imagen 224x224 en escala de grises convertida a RGB |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificación de imagen) |
| Licencia | other (los pesos ajustados heredan la licencia upstream de cada backbone; DINOv3 usa la DINOv3 License) |
| Formato de pesos | safetensors (+ un JSON de metadatos por modelo con `timm_arch`, `input_size`, `normalize`, `temperature` y `train_args`) |

## Arquitectura y entrenamiento

El repositorio contiene tres clasificadores independientes construidos sobre backbones de timm: un Vision Transformer DINOv3 ViT-B, un ConvNeXtV2-Base preentrenado en ImageNet-22k y un Swin-Base preentrenado en ImageNet-22k. Todos comparten la misma cabeza de 5 clases (KL0-KL4) y el mismo protocolo de datos: recortes de rodilla de 224x224 en escala de grises, normalizados con los parámetros indicados en el JSON de cada modelo.

El entrenamiento usa AdamW con warmup y decaimiento coseno, layer-wise learning-rate decay y stochastic depth para los backbones grandes, entropía cruzada con pesos de clase y label smoothing de 0,1, aumento moderado (random resized crop, rotación de ±10 grados, flip horizontal, jitter de brillo y contraste), precisión mixta y early stopping sobre macro-F1 de validación. En inferencia se aplica TTA de flip horizontal promediando logits y una temperatura ajustada sobre el conjunto de validación. Los splits train/val/test se comprobaron sin solapamiento de pacientes (0 pacientes compartidos).

## Capacidades

- Clasificación de radiografías de rodilla en 5 grados Kellgren-Lawrence (KL0 a KL4).
- Salida de logits por clase y probabilidades calibradas mediante temperatura ajustada en validación.
- TTA de flip horizontal integrada en el flujo de inferencia recomendado.
- Tres variantes de backbone intercambiables bajo la misma interfaz (timm + safetensors).
- No soporta tool calling, agentes, generación de texto ni capacidades multimodales.
- No soporta instrucciones en lenguaje natural: es un clasificador puro de imagen.

## Casos de uso

- Triaje asistido en estudios de investigación de osteoarthritis: el modelo puede preclasificar radiografías de rodilla en grados KL para priorizar la revisión por parte de un radiólogo en un pipeline de investigación, usando el QWK de 0,869 en test como indicador de concordancia ordinal.
- Herramienta de anotación asistida: generar una propuesta de grado KL por imagen para acelerar el etiquetado de grandes cohortes, con revisión humana obligatoria dado el estado de prototipo.
- Comparación de arquitecturas en investigación médica: el repositorio permite evaluar DINOv3, ConvNeXtV2 y Swin bajo idéntico protocolo de datos y pérdida, útil para estudios de transferencia en imagen médica.
- Filtrado y estratificación de datasets: clasificar cohortes retrospectivas por severidad KL para construir subconjuntos balanceados en estudios observacionales.
- Docencia y reproducibilidad: servir como referencia reproducible (semillas, `train_args` por modelo, JSON de metadatos) en cursos de deep learning aplicado a imagen médica.
- Detección de casos severos: la clase KL4 tiene recall de 0,889 en validación con el modelo DINOv3, lo que permite un cribado preliminar de casos avanzados para revisión prioritaria, siempre con supervisión clínica.

## Benchmarks y rendimiento

| Modelo | Split | Accuracy | Macro-F1 | QWK |
|---|---|---|---|---|
| dinov3_vitb_llrd_weighted_smoothed | Val | 0,689 | 0,726 | 0,828 |
| dinov3_vitb_llrd_weighted_smoothed | Test | 0,718 | 0,727 | 0,869 |
| convnextv2_base_in22k_llrd_weighted_smoothed | Val | 0,657 | 0,690 | 0,819 |
| convnextv2_base_in22k_llrd_weighted_smoothed | Test | 0,698 | 0,724 | 0,858 |
| swin_base_in22k_llrd_weighted_smoothed | Val | 0,648 | 0,684 | 0,806 |
| swin_base_in22k_llrd_weighted_smoothed | Test | 0,690 | 0,712 | 0,848 |

Recall por clase (modelo DINOv3 ViT-B):

| Split | KL0 | KL1 | KL2 | KL3 | KL4 |
|---|---|---|---|---|---|
| Val | 0,729 | 0,595 | 0,623 | 0,783 | 0,889 |
| Test | 0,814 | 0,497 | 0,647 | 0,866 | 0,765 |

Variabilidad entre semillas (validación, media ± desviación típica):

| Modelo | Semillas | Accuracy | Macro-F1 | QWK |
|---|---|---|---|---|
| dinov3_vitb_llrd_weighted_smoothed | 3 | 0,692 ± 0,003 | 0,721 ± 0,004 | 0,831 ± 0,003 |
| convnextv2_base_in22k_llrd_weighted_smoothed | 1 | 0,657 | 0,690 | 0,819 |
| swin_base_in22k_llrd_weighted_smoothed | 1 | 0,648 | 0,684 | 0,806 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,0 GB, lo que sugiere pesos en precisión nativa de tamaño moderado (ViT-B, ConvNeXtV2-Base y Swin-Base son backbones de gama media).
- GPU recomendadas: no especificadas por el autor; por el tamaño de los backbones, una GPU consumer con 8-16 GB de VRAM debería ser suficiente para inferencia en FP16.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio y las arquitecturas base, aunque no hay confirmación explícita del autor.
- Opciones de despliegue: timm + safetensors (flujo oficial documentado); exportación a ONNX o TorchScript no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | QWK test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KneeXpert DINOv3 ViT-B (este repo) | ViT-B | No disponible | 224x224 | 0,869 | other (DINOv3 License) | HuggingFace |
| KneeXpert ConvNeXtV2-Base (este repo) | ConvNeXtV2-Base | No disponible | 224x224 | 0,858 | other | HuggingFace |
| KneeXpert Swin-Base (este repo) | Swin-Base | No disponible | 224x224 | 0,848 | other | HuggingFace |

No se dispone de información sobre modelos comparables externos de gradación KL en la documentación proporcionada.

## Limitaciones y advertencias

- Prototipo de investigación: no es un dispositivo médico y no está validado para uso clínico; las predicciones deben ser revisadas por un clínico cualificado.
- Conjuntos de evaluación pequeños: KL4 tiene solo 27 imágenes de validación y 51 de test, por lo que las métricas por clase son ruidosas.
- El par KL0 vs KL1 es el más difícil (recall de 0,497 en test para KL1 con el modelo DINOv3).
- Un único dataset derivado de OAI, sin validación externa; la calibración se ajustó solo sobre validación.
- Riesgo de sobreajuste al dominio del dataset de origen; no hay evidencia de generalización a otras poblaciones o equipos de rayos X.
- Licencia "other": los pesos ajustados heredan los términos upstream de cada backbone (por ejemplo, DINOv3 License), lo que puede restringir el uso comercial; es necesario revisar la licencia de cada modelo base y los términos de uso de los datos OAI antes de redistribuir.
- No se han documentado sesgos demográficos ni análisis de subgrupos.
- Sin información sobre cuantización, latencia ni requisitos de hardware explícitos.

## Enlaces

- HuggingFace: https://huggingface.co/thanhle829/kneexpert-xray-kl-advanced
- Dataset de origen (Kaggle, derivado de OAI): *Knee Osteoarthritis Dataset with Severity Grading* (no se proporciona URL directa en la información disponible)
- Licencia DINOv3: no se proporciona URL en la información disponible
- Paper, blog o repositorio adicional: no disponible
