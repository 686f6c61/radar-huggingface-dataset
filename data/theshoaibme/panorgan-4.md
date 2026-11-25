# theshoaibme/PanOrgan-4

## Resumen

PanOrgan 4 es un modelo fundacional multimodal para imagen médica desarrollado por el usuario theshoaibme y publicado en Hugging Face. Se presenta como un modelo unificado que cubre cinco modalidades de imagen (radiografía de tórax, resonancia magnética, tomografía computarizada, mamografía y ecografía) y once cohortes clínicas, con un total de 20.175 muestras procedentes de 9.381 pacientes y sin fuga de datos a nivel de paciente. El modelo aborda tanto segmentación como clasificación, e incorpora predicción conforme y calibración de umbrales de decisión.

La arquitectura, denominada PanOrganNetV2, combina un stem multimodal (OmniModalityStem), modulación por capas FiLM con información física (PhysicsFiLM), un backbone ConvNeXt-Small, adaptadores LoRA, una capa de mezcla de expertos dispersa Top-2 (Sparse Top-2 MoE) y un módulo SACR. Sobre esa base se montan cabezas espaciales multiescala aisladas por cohorte que producen un vector de 2.688 dimensiones con test-time augmentation por volteo horizontal.

El modelo es relevante para quienes trabajan en imagen médica porque propone un único tronco compartido entre modalidades muy distintas, con cabezas específicas por cohorte para evitar interferencia entre tareas, y porque publica métricas desglosadas por cohorte, calibración (ECE) y robustez ante datos faltantes no aleatorios (MNAR). No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado detalles sobre el dataset de entrenamiento más allá de su enlace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PanOrganNetV2: OmniModalityStem + PhysicsFiLM + ConvNeXt-Small + LoRA + Sparse Top-2 MoE + SACR, con cabezas espaciales multiescala por cohorte |
| Parametros totales | no disponible (checkpoint best.pt de 243 MB; best_fp16.pt de 122 MB) |
| Parametros activos | no disponible (MoE Top-2, número de expertos no especificado) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 (checkpoint best_fp16.pt); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen médica, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt): best.pt, best_fp16.pt, multiscale_heads.pt |

## Arquitectura y entrenamiento

PanOrganNetV2 es un modelo de visión con un tronco compartido entre modalidades. El OmniModalityStem procesa las cinco modalidades de entrada; PhysicsFiLM aplica modulación por capas condicionada por información física; el backbone es ConvNeXt-Small, sobre el que se insertan adaptadores LoRA. La parte de mezcla de expertos es una capa Sparse Top-2 MoE, y se añade un módulo SACR cuyo funcionamiento interno no se detalla en la model card. Sobre el tronco se sitúan cabezas espaciales multiescala aisladas por cohorte que combinan pooling Avg y Max a resoluciones 32×32, 16×16 y 8×8 más un embedding de 384 dimensiones, dando un vector de 2.688 dimensiones con flip TTA.

El entrenamiento utiliza Class-Balanced Focal Loss por cohorte, EMA con factor 0,998, Temperature Scaling para calibración y ajuste de umbral de decisión por cabeza. El conjunto de datos cubre 20.175 muestras de 9.381 pacientes en 11 cohortes, con aislamiento a nivel de paciente para evitar fuga de información. No se especifica en la información disponible el número de tokens, la composición detallada del dataset ni si hubo etapas de preentrenamiento adicionales más allá de lo descrito.

## Capacidades

- Clasificación de imagen médica en cinco modalidades: radiografía de tórax (CXR), resonancia magnética (MRI), tomografía computarizada (CT), mamografía (MG) y ecografía (US).
- Segmentación de estructuras anatómicas, con Dice reportado de 0,8832 en condiciones MNAR del 0 %, 0,8819 al 20 % y 0,8445 al 40 % (IoU de 0,8489).
- Clasificación multiescala mediante cabezas específicas por cohorte (32×32, 16×16, 8×8 más embedding de 384 dimensiones).
- Predicción conforme y calibración de probabilidades mediante Temperature Scaling y ajuste de umbral por cabeza.
- Robustez ante datos faltantes no aleatorios (MNAR), evaluada explícitamente en el modelo.
- Test-time augmentation por volteo horizontal (flip TTA) para mejorar la estabilidad de las predicciones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Triaje de radiografías de tórax: la cabeza `cxr_4class` alcanza un 94,68 % de accuracy y un AUROC de 0,9930 sobre 1.071 muestras, lo que permite clasificar estudios en cuatro categorías con alta fiabilidad y derivar casos dudosos a revisión radiológica.
- Apoyo al diagnóstico de glioma: la cabeza `tcga_lgg` obtiene un 94,97 % de accuracy y un AUROC de 0,9790 sobre 537 muestras, adecuada para clasificación asistida en estudios de resonancia magnética cerebral.
- Segmentación anatómica en pipelines de planificación: con un Dice de 0,8832 en ausencia de datos faltantes, el modelo puede generar máscaras de estructuras para planificación quirúrgica o radioterapia, siempre con validación por especialista.
- Clasificación de nódulos tiroideos en ecografía: la cabeza `ultrasound_nerve` reporta un 71,80 % de accuracy y un AUROC de 0,7740 sobre 266 muestras, útil como segunda lectura en ecografía.
- Investigación en calibración y robustez: el modelo publica ECE por cabeza y resultados de estrés MNAR, lo que lo hace útil como referencia para estudiar calibración en modelos médicos y comportamiento ante datos faltantes.
- Clasificación de masas mamográficas: la cabeza `cmmd_mg` obtiene un 60,18 % de accuracy sobre 437 muestras, lo que limita su uso clínico directo pero permite experimentación en investigación con mamografía.
- Evaluación comparativa de modelos fundacionales multimodales: al compartir tronco entre cinco modalidades, sirve como línea base para estudiar transferencia entre modalidades en imagen médica.

## Benchmarks y rendimiento

Métricas finales sobre n = 3.038: accuracy global del 80,88 %, macro-F1 de 0,8623, macro-precisión de 0,8647 y macro-recall de 0,8600.

| Cabeza / cohorte | Muestras (n) | Accuracy | Macro-F1 | AUROC | ECE | Umbral |
|---|---:|---:|---:|---:|---:|---:|
| cxr_4class | 1071 | 94,68 % | 0,9346 | 0,9930 | 0,0204 | 0,50 |
| busi_3class | 109 | 87,16 % | 0,8585 | 0,9458 | 0,0430 | 0,50 |
| cmmd_mg | 437 | 60,18 % | 0,5954 | 0,6608 | 0,0585 | 0,51 |
| cbis_ddsm | 15 | 53,33 % | 0,5249 | 0,5800 | 0,1820 | 0,47 |
| kidney_ct_abn | 414 | 62,32 % | 0,6008 | 0,6354 | 0,0242 | 0,52 |
| tcga_kirc_ct | 189 | 62,43 % | 0,4319 | 0,4344 | 0,2470 | 0,45 |
| tcga_lgg | 537 | 94,97 % | 0,9420 | 0,9790 | 0,0246 | 0,48 |
| ultrasound_nerve | 266 | 71,80 % | 0,7097 | 0,7740 | 0,0578 | 0,55 |

Segmentación: Dice de 0,8832 (MNAR 0 %), 0,8819 (MNAR 20 %) y 0,8445 (MNAR 40 %); IoU de 0,8489. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint en fp32 ocupa 243 MB y en fp16 122 MB; las cabezas multiescala suman 46 MB. La inferencia en fp16 requiere previsiblemente menos de 1 GB de VRAM, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño del checkpoint, cualquier GPU con al menos 2 GB de VRAM debería poder cargar el modelo en fp16.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (122 MB en fp16); no se especifica el modelo concreto de GPU.
- Opciones de despliegue: al ser un modelo PyTorch con pesos .pt, el despliegue se haría mediante PyTorch nativo o TorchScript; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han publicado comparaciones con otros modelos fundacionales de imagen médica en la model card, y no se conocen alternativas evaluadas bajo el mismo protocolo (mismas cohortes y métricas).

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PanOrgan 4 | no disponible | no aplica | accuracy global 80,88 %; Dice 0,8832 | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy desigual entre cohortes: `tcga_kirc_ct` (62,43 % accuracy, macro-F1 0,4319, AUROC 0,4344) y `cbis_ddsm` (53,33 % accuracy sobre solo 15 muestras) están cerca del azar, lo que desaconseja su uso clínico en esas tareas.
- Calibración deficiente en algunas cabezas: ECE de 0,2470 en `tcga_kirc_ct` y 0,1820 en `cbis_ddsm`, muy por encima de las cabezas mejor calibradas (0,0204 en `cxr_4class`).
- Tamaños de muestra pequeños en varias cohortes (`cbis_ddsm` con n = 15, `busi_3class` con n = 109), lo que limita la significación estadística de sus métricas.
- El modelo no es un producto sanitario ni se ha validado clínicamente; cualquier uso en diagnóstico requiere supervisión médica y validación regulatoria independiente.
- No se documentan sesgos demográficos ni la composición del dataset de entrenamiento, por lo que no puede evaluarse su comportamiento en subpoblaciones.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y negativos en clasificación y de segmentaciones incorrectas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad del uso clínico recae en el implementador.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación independiente por la comunidad.
- No se especifican requisitos de preprocesamiento de imagen (resolución de entrada, normalización) más allá de las cabezas multiescala, lo que puede dificultar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theshoaibme/PanOrgan-4
- Dataset: https://huggingface.co/datasets/theshoaibme/PanOrgan-Dataset
