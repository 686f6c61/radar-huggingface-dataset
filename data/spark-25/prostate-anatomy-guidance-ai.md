# spark-25/prostate-anatomy-guidance-ai

## Resumen

Prostate Anatomy Guidance AI es una colección de 18 clasificadores 3D de resonancia magnética multiparamétrica (mpMRI) de próstata, publicados por el usuario spark-25 en Hugging Face y descritos en el artículo de Park et al. (arXiv:2611.04155, 2026). El modelo resuelve dos tareas clínicas sobre el examen completo: la predicción ordinal de la puntuación PI-RADS (1-5) y la detección binaria de cáncer de próstata clínicamente significativo (csPCa, 0/1). Su particularidad es la "guía anatómica": una parte de las variantes acepta como canal adicional una máscara de segmentación zonal de la próstata, lo que permite condicionar la clasificación sobre la anatomía del paciente.

Técnicamente son clasificadores 3D entrenados desde cero sobre volúmenes de T2, DWI y ADC remuestreados a 1 × 1 × 3 mm y recortados a 112 × 112 × 24 vóxeles. Se ofrecen tres backbones (ResNet-18, ResNet-50 y ViT) en tres configuraciones de máscara (sin máscara, 2 zonas y 5 zonas), lo que da lugar a las 18 combinaciones tarea × backbone × canal de máscara. La pérdida es CORAL ordinal para PI-RADS y entropía cruzada para csPCa.

El interés actual reside en que aborda un problema de clasificación médica 3D con una innovación explícita de incorporación de información anatómica, y lo hace publicando pesos y código reproducibles. No obstante, el entrenamiento se realizó sobre una cohorte interna no pública y el autor restringe el uso a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificadores 3D: ResNet-18, ResNet-50 y ViT (transformador de visión 3D) |
| Parámetros totales | no disponible (tamaños de checkpoint: ResNet-18 ≈ 133 MB, ResNet-50 ≈ 190 MB, ViT ≈ 360 MB por modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada volumétrica fija de 112 × 112 × 24 vóxeles) |
| Tipos de cuantización | no disponible (pesos PyTorch en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de imagen médica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `backbone_max_val_score.pt` y `heads_max_val_score.pt` por carpeta |

## Arquitectura y entrenamiento

Cada modelo combina un backbone 3D (ResNet-18, ResNet-50 o ViT) con cabezas de clasificación específicas por tarea. La entrada es un tensor multicanal construido a partir de T2, DWI y ADC, remuestreados con B-spline a 1 × 1 × 3 mm y recortados o rellenados con ceros a 112 × 112 × 24 vóxeles alrededor del centroide de la próstata; si falta DWI o ADC, se introduce un canal de ceros. Las variantes con guía anatómica añaden un canal con la máscara zonal sobre la rejilla del T2 recortado, con valores de canal 0,5 y 1,0 para las máscaras de 2 zonas y 0,2/0,4/0,6/0,8/1,0 para las de 5 zonas.

El entrenamiento se realizó desde cero sobre la cohorte interna descrita en el artículo, con AdamW, tamaño de lote 64, decaimiento coseno de la tasa de aprendizaje y parada temprana sobre QWK (kappa cuadrática ponderada) en validación para PI-RADS y sobre AUC para csPCa. La tarea PI-RADS usa pérdida CORAL ordinal, de modo que la salida son probabilidades acumuladas P(y > c); la tarea csPCa usa entropía cruzada y devuelve P(y = c). Las máscaras de entrenamiento se generaron con una nnU-Net preentrenada para segmentación de zonas prostáticas y uretra, entrenada sobre el conjunto ProstateZones. Los datos de entrenamiento no son públicos.

## Capacidades

- Clasificación ordinal de PI-RADS (1-5) por examen de mpMRI, con salidas acumuladas P(y > c) en las variantes CORAL.
- Clasificación binaria de cáncer de próstata clínicamente significativo (csPCa, 0/1) con probabilidades por clase.
- Procesamiento de volúmenes 3D multimodales: T2, DWI y ADC como canales de entrada.
- Incorporación opcional de una máscara de segmentación zonal (2 zonas o 5 zonas) como canal de guía anatómica.
- Tolerancia a modalidades ausentes: DWI o ADC faltantes se sustituyen por un canal de ceros.
- Reentrenamiento y ajuste fino sobre cohortes propias mediante `train.py --finetune_from`.
- Reconstrucción automática de la arquitectura, tarea, clases y codificación de máscara desde los argumentos guardados en cada checkpoint.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un modelo puramente de clasificación de imagen.

## Casos de uso

- Apoyo a la lectura radiológica de mpMRI prostática: el modelo genera una probabilidad de PI-RADS por examen que puede usarse como segunda lectura o señal de triaje antes de la revisión del radiólogo, aprovechando que procesa el volumen completo en una sola pasada.
- Priorización de casos sospechosos en listas de espera: con la salida de csPCa (0/1) se puede ordenar la cola de lectura por probabilidad de cáncer clínicamente significativo, usando las variantes `cspca_*` con backbone ResNet-18 por su menor tamaño (≈ 133 MB).
- Investigación en guía anatómica: comparar las variantes con y sin máscara (`pirads_resnet50` frente a `pirads_resnet50_5zones`) para medir el efecto de incorporar la segmentación zonal en el rendimiento, un escenario experimental directo del artículo.
- Ajuste fino sobre una cohorte local: los checkpoints aceptan `--finetune_from`, de modo que un hospital o grupo de investigación puede adaptar el modelo a sus propios escáneres y protocolos de adquisición, algo que el autor recomienda explícitamente por problemas de generalización.
- Evaluación de pipelines de segmentación: al depender las variantes con máscara de la calidad de la segmentación zonal, el modelo sirve para cuantificar el impacto de un segmentador (por ejemplo, nnU-Net) en una tarea clínica descendente.
- Docencia y validación metodológica: reproducir el preprocesado (`preprocess_data.py`) y la inferencia (`inference.py`) sobre conjuntos públicos como PROSTATEx para estudiar clasificación ordinal con pérdida CORAL en imagen médica 3D.
- Selección de backbone en estudios comparativos: el repositorio ofrece ResNet-18, ResNet-50 y ViT con el mismo preprocesado, lo que permite analizar el compromiso entre tamaño (133 MB, 190 MB, 360 MB) y rendimiento en una tarea médica concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (arXiv:2611.04155) para la cohorte, la evaluación y los resultados, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas clínicas (QWK, AUC) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Por el tamaño de los checkpoints (133-360 MB por modelo) y la entrada fija de 112 × 112 × 24 vóxeles, la inferencia es ligera; una GPU consumer con 8-12 GB de VRAM debería ser suficiente para lotes pequeños, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido tamaño de los pesos y del volumen de entrada, pero es una estimación, no un dato del autor.
- Opciones de despliegue: inferencia mediante el script `inference.py` del repositorio de código con PyTorch; descarga de pesos con `huggingface_hub` (`hf download`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de clasificación de mpMRI prostática ni con otros clasificadores 3D de imagen médica, y no se dispone de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: los modelos no son dispositivos médicos y no deben emplearse para decisiones clínicas.
- Generalización limitada: el rendimiento puede diferir en otros escáneres, protocolos de adquisición, poblaciones y definiciones de etiqueta; el autor recomienda ajuste fino con datos locales.
- Entrenamiento sobre una cohorte interna no pública, lo que dificulta la reproducción exacta de los resultados y la auditoría de sesgos de población.
- Las variantes con máscara dependen de la calidad de la segmentación zonal y de que las etiquetas de la máscara coincidan en significado con las de entrenamiento (1 = TZ, 2 = PZ en 2 zonas; 1 = PZ, 2 = CZ, 3 = TZ, 4 = AFS, 5 = uretra en 5 zonas).
- Licencia no disponible: no puede confirmarse la legalidad del uso comercial ni de la redistribución de los pesos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, con implicaciones clínicas si se usara fuera de investigación.
- Sin soporte documentado de cuantización ni de formatos distintos de PyTorch, lo que limita el despliegue en entornos con restricciones de memoria.
- Nombres de tarea internos de los checkpoints (`PIRAD_MAX`, `significance_pirads12`) distintos de las columnas de etiqueta del repositorio, lo que exige pasar `--label_col` correctamente para calcular métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spark-25/prostate-anatomy-guidance-ai
- Artículo (arXiv): https://arxiv.org/abs/2611.04155
- PDF del artículo: https://arxiv.org/pdf/2611.04155
- Código: https://github.com/seungbin201803/prostate-anatomy-guidance-ai
- Dataset ProstateZones: https://github.com/UMU-DDI/ProstateZones
