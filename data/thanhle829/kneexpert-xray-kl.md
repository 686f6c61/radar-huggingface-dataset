# thanhle829/kneexpert-xray-kl

## Resumen

KneeXpert es una familia de cinco clasificadores de imagen entrenados para la gradación automática de osteoartritis de rodilla según la escala Kellgren-Lawrence (KL0-KL4) en radiografías. El modelo lo publica el autor thanhle829 en HuggingFace como parte del proyecto de fin de grado KneeXpert de la Universidad Ton Duc Thang. Cada uno de los cinco clasificadores parte de pesos preentrenados en ImageNet y se afina con la misma receta de entrenamiento, de modo que puedan compararse directamente entre sí.

El repositorio contiene cinco arquitecturas distintas: DenseNet-201, ResNet-50, EfficientNet-B3, ConvNeXt-Tiny y Swin-Tiny. Todos operan sobre recortes de rodilla en escala de grises de 224x224 píxeles y devuelven una distribución de probabilidad sobre cinco clases (KL0 a KL4). El mejor resultado lo obtiene Swin-Tiny, con una accuracy de test del 0,700 y un QWK (quadratic weighted kappa) de 0,859.

La relevancia del modelo es acotada: se trata de un prototipo de investigación, no de un dispositivo médico, y el propio autor advierte de que no está validado para uso clínico. Su interés reside en la comparación controlada de cinco backbones bajo una misma receta y en la publicación de métricas por clase y de variabilidad entre semillas, algo poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cinco CNN/transformers de visión: DenseNet-201, ResNet-50, EfficientNet-B3, ConvNeXt-Tiny y Swin-Tiny (vía timm) |
| Parametros totales | No disponible (depende de la arquitectura; el repo completo ocupa 0,4 GB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imagen, entrada 224x224) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión; etiquetas de clase en inglés) |
| Licencia | other (el autor remite a la licencia del dataset y a los términos de uso de datos de la OAI) |
| Formato de pesos | safetensors + JSON de metadatos por modelo (10 archivos en la raíz del repo) |

## Arquitectura y entrenamiento

Cada uno de los cinco modelos es un clasificador de imagen estándar de la librería timm, inicializado con pesos de ImageNet y con la cabeza de clasificación sustituida por una capa de 5 salidas. Las arquitecturas cubren tres familias: CNN clásicas con conexiones densas (DenseNet-201) y residuales (ResNet-50), CNN con bloques MBConv (EfficientNet-B3), y transformers de visión (ConvNeXt-Tiny y Swin-Tiny). La entrada es un recorte en escala de grises de 224x224 convertido a RGB con la normalización media/std de ImageNet.

La receta de entrenamiento es idéntica para los cinco: AdamW con learning rate 1e-4 para el backbone y 1e-3 para la cabeza, weight decay 1e-2, un epoch de warmup seguido de decaimiento coseno, entropía cruzada ponderada por clase con label smoothing de 0,1, aumento de datos suave (random resized crop, rotación de ±10 grados, flip horizontal, jitter de brillo y contraste), precisión mixta y hasta 30 epochs con early stopping sobre macro-F1 de validación. En inferencia se aplica test-time augmentation con flip horizontal y una temperatura ajustada sobre el conjunto de validación. Los modelos con semilla 42 (DenseNet, ResNet, EfficientNet) solo se entrenaron una vez; ConvNeXt-Tiny y Swin-Tiny se entrenaron con tres semillas y se exportó la de mejor macro-F1 de validación.

## Capacidades

- Clasificación de radiografías de rodilla en cinco grados Kellgren-Lawrence (KL0, KL1, KL2, KL3, KL4).
- Salida de logits y probabilidades calibradas mediante temperatura ajustada en validación.
- Test-time augmentation con flip horizontal integrado en el flujo de inferencia documentado.
- Comparación controlada entre cinco arquitecturas bajo una receta común, útil para experimentación metodológica.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de la clasificación de imagen.

## Casos de uso

- Triaje asistido en estudios retrospectivos: el modelo puede preclasificar un lote de radiografías de rodilla en grados KL para priorizar la revisión de un radiólogo, siempre con revisión humana obligatoria y sin uso diagnóstico.
- Herramienta docente en imagen médica: sirve para ilustrar el efecto del desbalance de clases, la calibración por temperatura y la variabilidad entre semillas en un pipeline real de clasificación.
- Comparación de backbones en investigación: al compartir receta, permite estudiar qué arquitectura (CNN frente a transformer de visión) se adapta mejor a la gradación KL con un dataset pequeño.
- Preetiquetado para curación de datasets: las predicciones pueden usarse como sugerencia inicial para anotadores humanos, con corrección posterior y auditoría de las clases minoritarias.
- Análisis de sesgo por clase: las métricas de recall por clase publicadas permiten estudiar el comportamiento del modelo en KL1, la clase más difícil, y diseñar estrategias de reequilibrado.
- Prototipado de sistemas de segunda lectura: integrable como componente de un pipeline de investigación que combine varios modelos y agregue sus probabilidades antes de la revisión clínica.
- Evaluación de robustez ante calibración: el ajuste de temperatura y el TTA documentados sirven como referencia para comparar técnicas de calibración en clasificación médica.

## Benchmarks y rendimiento

Resultados publicados en la model card (accuracy, macro-F1 y QWK sobre validación y test):

| Modelo | Semilla | Val acc | Val macro-F1 | Val QWK | Test acc | Test macro-F1 | Test QWK |
|---|---|---|---|---|---|---|---|
| densenet201_weighted_smoothed | 42 | 0,636 | 0,688 | 0,789 | 0,686 | 0,686 | 0,844 |
| resnet50_weighted_smoothed | 42 | 0,637 | 0,655 | 0,794 | 0,665 | 0,673 | 0,826 |
| efficientnet_b3_weighted_smoothed | 42 | 0,645 | 0,643 | 0,783 | 0,661 | 0,654 | 0,799 |
| convnext_tiny_weighted_smoothed | 2 | 0,651 | 0,708 | 0,823 | 0,680 | 0,705 | 0,846 |
| swin_tiny_weighted_smoothed | 2 | 0,684 | 0,716 | 0,826 | 0,700 | 0,722 | 0,859 |

Recall por clase en test:

| Modelo | KL0 | KL1 | KL2 | KL3 | KL4 |
|---|---|---|---|---|---|
| densenet201_weighted_smoothed | 0,804 | 0,389 | 0,627 | 0,848 | 0,706 |
| resnet50_weighted_smoothed | 0,841 | 0,368 | 0,536 | 0,777 | 0,804 |
| efficientnet_b3_weighted_smoothed | 0,775 | 0,220 | 0,739 | 0,696 | 0,922 |
| convnext_tiny_weighted_smoothed | 0,724 | 0,561 | 0,625 | 0,817 | 0,706 |
| swin_tiny_weighted_smoothed | 0,817 | 0,497 | 0,587 | 0,821 | 0,863 |

Variabilidad entre semillas en validación (media ± desviación típica):

| Modelo | Semillas | Acc | Macro-F1 | QWK |
|---|---|---|---|---|
| densenet201_weighted_smoothed | 1 | 0,636 | 0,688 | 0,789 |
| resnet50_weighted_smoothed | 1 | 0,637 | 0,655 | 0,794 |
| efficientnet_b3_weighted_smoothed | 1 | 0,645 | 0,643 | 0,783 |
| convnext_tiny_weighted_smoothed | 3 | 0,663 ± 0,011 | 0,706 ± 0,002 | 0,827 ± 0,006 |
| swin_tiny_weighted_smoothed | 3 | 0,680 ± 0,011 | 0,708 ± 0,010 | 0,818 ± 0,009 |

No se han publicado comparaciones con otros modelos de gradación KL en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los cinco modelos (Swin-Tiny y ConvNeXt-Tiny son los más ligeros; DenseNet-201 el más pesado en memoria de activaciones).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa por el tamaño reducido de los modelos.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: timm + PyTorch como vía documentada; exportación a ONNX o TorchScript viable por ser clasificadores estándar; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de clasificación de imagen).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño de los modelos se espera latencia de milisegundos por imagen en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Test acc (KL) | Test QWK | Licencia |
|---|---|---|---|---|---|---|
| KneeXpert swin_tiny | Swin-Tiny | No disponible | 224x224 | 0,700 | 0,859 | other |
| KneeXpert convnext_tiny | ConvNeXt-Tiny | No disponible | 224x224 | 0,680 | 0,846 | other |
| KneeXpert densenet201 | DenseNet-201 | No disponible | 224x224 | 0,686 | 0,844 | other |
| KneeXpert resnet50 | ResNet-50 | No disponible | 224x224 | 0,665 | 0,826 | other |
| KneeXpert efficientnet_b3 | EfficientNet-B3 | No disponible | 224x224 | 0,661 | 0,799 | other |

No se dispone de información sobre otros modelos públicos de gradación Kellgren-Lawrence comparables en la documentación proporcionada; la comparativa se limita a los cinco modelos de la propia familia.

## Limitaciones y advertencias

- Prototipo de investigación: no es un dispositivo médico y no está validado para uso clínico; las predicciones deben ser revisadas por un clínico cualificado.
- Conjuntos de evaluación pequeños: KL4 tiene 27 imágenes de validación y 51 de test, por lo que las métricas por clase son ruidosas.
- El par KL0 frente a KL1 es el más difícil; el recall de KL1 en test oscila entre 0,220 (EfficientNet-B3) y 0,561 (ConvNeXt-Tiny).
- Un único dataset derivado de la OAI, sin validación externa; la generalización a otras poblaciones, equipos o protocolos de adquisición no está demostrada.
- La calibración por temperatura se ajustó solo sobre validación, lo que puede sobreajustar la confianza reportada.
- Los modelos con una sola semilla (DenseNet, ResNet, EfficientNet) no tienen estimación de variabilidad; las diferencias pequeñas entre ellos no deben sobreinterpretarse.
- Licencia "other": el autor remite a la licencia del dataset de Kaggle y a los términos de uso de datos de la OAI antes de redistribuir o construir sobre los pesos; el uso comercial no está autorizado de forma explícita.
- Riesgo de sesgo por desbalance de clases y por la composición del dataset de origen; no se documentan análisis de subgrupos demográficos.
- No apto para otras modalidades de imagen ni para gradación de otras articulaciones sin reentrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/thanhle829/kneexpert-xray-kl
- Dataset de origen (Kaggle, Knee Osteoarthritis Dataset with Severity Grading): no disponible como enlace directo en la información proporcionada
- Términos de uso de datos de la OAI: no disponible como enlace directo en la información proporcionada
- Repositorio o paper del proyecto KneeXpert: no disponible en la información proporcionada
