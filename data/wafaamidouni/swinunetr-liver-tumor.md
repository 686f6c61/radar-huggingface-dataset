# Wafaamidouni/swinunetr-liver-tumor

## Resumen

SwinUNETR — Liver and Hepatic Tumor Segmentation on CT es un modelo de segmentación semántica 3D basado en la arquitectura SwinUNETR, desarrollado por Wafa Midouni como parte de su tesis de máster en 2026. El modelo está diseñado para la segmentación automática del hígado y de tumores hepáticos (agregando HCC, colangiocarcinoma y metástasis) en volúmenes de tomografía computarizada (TC) con contraste en fase portal-venosa. Resuelve un problema clásico de imagen médica: la delimitación precisa de órganos y lesiones en 3D para planificación quirúrgica preoperatoria, un proceso tradicionalmente manual y costoso en tiempo.

El modelo emplea SwinUNETR, una arquitectura híbrida que combina un transformer jerárquico con conexiones skip tipo U-Net, implementada en MONAI 1.5.2. Cuenta con 63,1 millones de parámetros, entrada de 1 canal (TC 3D en formato NIfTI) y 3 clases de salida (fondo, hígado, tumor). Los pesos se inicializan con preentrenamiento auto-supervisado de MONAI Model Zoo sobre aproximadamente 5050 TC públicos, y se afinan sobre el dataset del LiTS Challenge (Task 03) con 27 casos reservados para validación.

Su relevancia radica en que proporciona pesos abiertos (licencia MIT) para una tarea de segmentación hepática 3D con documentación detallada del pipeline de preprocesamiento e inferencia, algo poco frecuente en el ámbito de la imagen médica. No obstante, se trata de un prototipo de investigación sin validación clínica ni aprobación regulatoria, por lo que su uso está restringido a investigación y docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinUNETR (transformer jerárquico con conexiones skip tipo U-Net), MONAI 1.5.2 |
| Parametros totales | 63,1 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de imagen médica; no procesa texto) |
| Licencia | MIT con descargo de responsabilidad para uso en investigación médica |
| Formato de pesos | PyTorch (`swin_best_model_v4.pt`); repo de 0,3 GB |

## Arquitectura y entrenamiento

SwinUNETR es una arquitectura híbrida que utiliza un transformer Swin jerárquico como codificador, con ventanas de atención desplazadas para capturar dependencias locales y globales en volúmenes 3D, y un decodificador con conexiones skip que reconstruye la segmentación a resolución completa. En esta implementación concreta se configura con `spatial_dims=3`, `in_channels=1`, `out_channels=3`, `feature_size=48` y `use_checkpoint=False`. La inicialización parte de pesos preentrenados de forma auto-supervisada del MONAI Model Zoo, entrenados sobre aproximadamente 5050 TC públicos, lo que proporciona una base robusta de representaciones anatómicas antes del ajuste fino.

El ajuste fino se realizó sobre el dataset del LiTS Challenge (Task 03), con 27 casos reservados para validación. La etiqueta de tumor agrega todos los tipos de lesión hepática (HCC, colangiocarcinoma y metástasis) sin distinción de subtipo. El preprocesamiento incluye remuestreo a espaciado (1,5, 1,5, 2,0) mm con interpolación bilineal, escalado de intensidad de HU [−200, 250] a [0, 1] con recorte y recorte de primer plano (`CropForeground`). La inferencia se realiza mediante ventana deslizante con `roi_size=(96, 96, 64)`, `sw_batch_size=4`, `overlap=0.25`, `mode="gaussian"` y precisión mixta. Como posprocesamiento se aplica `argmax` sobre los 3 canales y `KeepLargestConnectedComponent` únicamente sobre la etiqueta de hígado (nunca sobre la de tumor, para preservar múltiples lesiones). El autor advierte explícitamente de no aplicar `ResizeWithPadOrCropd` en inferencia, ya que provocaba segmentaciones parciales del hígado.

## Capacidades

- Segmentación semántica 3D de volúmenes de TC: produce máscaras con tres clases (fondo, hígado, tumor hepático).
- Segmentación de tumores hepáticos agregados (HCC, colangiocarcinoma y metástasis) sin distinción de subtipo.
- Procesamiento de volúmenes NIfTI de TC con contraste en fase portal-venosa.
- Inferencia mediante ventana deslizante para volúmenes de tamaño arbitrario, con solapamiento gaussiano.
- Integración con el ecosistema MONAI (transformadas, `sliding_window_inference`, `KeepLargestConnectedComponent`).
- Capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio o modo thinking: no disponibles (el modelo no es un LLM ni un modelo multimodal de propósito general).
- Capacidades multilingües: no aplica.

## Casos de uso

- Planificación quirúrgica preoperatoria: el modelo segmenta hígado y tumores en TC 3D para apoyar la estimación del volumen hepático remanente futuro (FLR) y la segmentación de Couinaud, tal como se documenta en el repositorio complementario del autor con integración en 3D Slicer.
- Investigación en imagen médica: sirve como baseline reproducible para experimentos de segmentación hepática 3D, con pipeline de preprocesamiento e inferencia documentado y pesos abiertos bajo licencia MIT.
- Docencia y formación: permite a estudiantes de ingeniería biomédica o radiología experimentar con segmentación 3D en TC sin entrenar desde cero, gracias a los pesos preentrenados y al código de ejemplo.
- Desarrollo de herramientas de anotación asistida: integrado en flujos tipo MONAILabel o 3D Slicer para preanotar hígado y lesiones y reducir el tiempo de etiquetado manual por radiólogos.
- Evaluación comparativa de arquitecturas: al estar basado en SwinUNETR con configuración conocida, sirve para comparar frente a otras arquitecturas de segmentación 3D (nnU-Net, UNETR) en el mismo dataset LiTS.
- Prototipado de pipelines de imagen médica: el ejemplo de código completo (carga, preprocesamiento, ventana deslizante, posprocesamiento) facilita la integración en prototipos de investigación sin necesidad de reconstruir el pipeline.
- Análisis volumétrico de lesiones: la preservación de múltiples lesiones (sin aplicar `KeepLargestConnectedComponent` sobre el tumor) permite estudiar la carga tumoral hepática en cohortes de investigación.

## Benchmarks y rendimiento

Resultados de validación sobre 27 casos del LiTS Challenge (versión V4, la desplegada):

| Metrica | Higado | Tumor (agregado) | Tumor (media por caso ± desv.) | Deteccion (Dice > 0) |
|---|---|---|---|---|
| V4 (desplegada) | 0,916 | 0,561 | 0,503 ± 0,344 | 20 / 27 |
| V5 (no publicada) | no disponible | no disponible | 0,579 ± 0,328 (mediana 0,717) | no disponible |

La versión V5, aún no publicada, alcanza un Dice por caso superior pero requiere revalidación tras una corrección en el procesamiento de salida. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 63,1 M de parámetros y precisión mixta, la inferencia en ventana deslizante con `roi_size=(96, 96, 64)` y `sw_batch_size=4` es viable en GPUs de consumo, aunque el consumo exacto depende del tamaño del volumen de entrada y del solapamiento.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo, cabría esperar funcionamiento en RTX 3090, RTX 4090, A100 o H100, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: probablemente sí (modelo de 63,1 M de parámetros), aunque no se proporcionan cifras de VRAM medidas.
- Opciones de despliegue: PyTorch con MONAI (`sliding_window_inference`), integración con 3D Slicer y MONAILabel según el repositorio del autor. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwinUNETR liver-tumor (este modelo) | 63,1 M | TC 3D, ventana deslizante (96, 96, 64) | Dice hígado 0,916; tumor 0,561 (LiTS, 27 casos) | MIT | Pesos en HuggingFace, código en GitHub |
| nnU-Net (referencia en segmentación médica) | no disponible | Volúmenes 3D arbitrarios | no disponible en esta ficha | no disponible | Código abierto |
| UNETR (Tang et al.) | no disponible | Volúmenes 3D | no disponible en esta ficha | no disponible | Código abierto |
| Otros pesos SwinUNETR de MONAI Model Zoo | no disponible | TC 3D | no disponible en esta ficha | no disponible | MONAI Model Zoo |

No se dispone de datos de benchmarks comparativos directos en la información proporcionada; la comparativa se limita a la categoría y disponibilidad.

## Limitaciones y advertencias

- Entrenado únicamente con TC en fase portal-venosa; otras fases de contraste pueden degradar el rendimiento.
- Las lesiones pequeñas (menos de 5 mm) a menudo no se detectan.
- No validado en escáneres ni poblaciones fuera del dataset LiTS.
- La etiqueta de tumor agrega HCC, colangiocarcinoma y metástasis sin distinción, lo que limita el análisis por subtipo.
- El rendimiento en tumor es moderado (Dice agregado 0,561; media por caso 0,503 ± 0,344) y la detección falla en 7 de 27 casos (Dice = 0), lo que indica alta variabilidad entre casos.
- No debe aplicarse `ResizeWithPadOrCropd` en inferencia; hacerlo provoca segmentaciones parciales del hígado.
- No aplicar `KeepLargestConnectedComponent` sobre la etiqueta de tumor, ya que eliminaría lesiones múltiples.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos en la segmentación.
- Sesgos conocidos: no documentados explícitamente; la dependencia del dataset LiTS implica un posible sesgo hacia la distribución de escáneres y poblaciones de ese dataset.
- Restricciones de licencia: MIT con descargo de responsabilidad para uso en investigación médica; no ha recibido aprobación regulatoria (CE, FDA) y no debe usarse para diagnóstico clínico, planificación de tratamiento ni decisiones médicas sobre pacientes reales.
- Prototipo de investigación de tesis de máster; sin validación clínica.

## Enlaces

- HuggingFace: https://huggingface.co/Wafaamidouni/swinunetr-liver-tumor
- Repositorio GitHub del autor (pipeline completo, integración 3D Slicer, segmentación de Couinaud, estimación de FLR, control por gestos): https://github.com/wafamidouni1/liver-tumor-segmentation
- LiTS Challenge (Bilic et al., 2023): no disponible enlace directo en la información proporcionada
- MONAI: https://monai.io
- MONAI Model Zoo: no disponible enlace directo en la información proporcionada
- Paper de SwinUNETR (Tang et al., CVPR 2022): no disponible enlace directo en la información proporcionada
