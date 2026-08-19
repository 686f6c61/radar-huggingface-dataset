# tobiliicous/aion-model-clip-linear-probe-v1

## Resumen

Este repositorio es una *results card* (ficha de resultados) del experimento de detección de imágenes generadas por IA mediante un *linear probe* sobre embeddings de CLIP, limitado exclusivamente a rostros. El autor, tobiliicous, publica únicamente los resultados y métricas, sin incluir pesos del modelo, checkpoints, código ejecutable ni datos de imagen. El objetivo declarado es servir como registro citable sobre atajos en benchmarks, evaluación cruzada entre generadores y sensibilidad a compresión JPEG.

El modelo en sí no es desplegable: no existe un artefacto de pesos que pueda usarse en producción. Los resultados muestran un AUC *leak-free* de 0,9222 en el peor pliegue sobre el benchmark OpenRL/DeepFakeFace, pero el propio autor advierte de que un *shortcut* basado en el tamaño de imagen (`is_square_512`) alcanza un AUC perfecto de 1,0000 sin mirar los píxeles, lo que invalida cualquier afirmación de capacidad real de detección. La licencia declarada es `other`, y el texto de la ficha se publica bajo CC BY 4.0, pero no se concede ninguna licencia sobre los pesos retenidos ni sobre los datos de origen.

La relevancia de esta ficha es metodológica: documenta cómo un benchmark aparentemente sólido puede estar contaminado por atajos triviales, y cómo la compresión JPEG degrada drásticamente el rendimiento (pérdidas de AUC entre 0,15 y 0,27). No debe interpretarse como un detector utilizable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Linear probe sobre embeddings de CLIP (detección de imágenes generadas por IA, solo rostros) |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de visión) |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible |
| Licencia | `other` (el texto de la ficha es CC BY 4.0; los pesos y datos no se liberan) |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

El experimento consiste en un *linear probe* (regresión logística o similar) entrenado sobre las representaciones de CLIP para clasificar imágenes de rostros como reales o generadas por IA. El entrenamiento se realizó exclusivamente con caras del dataset OpenRL/DeepFakeFace. La evaluación siguió un esquema *leave-one-generator-out* con tres familias: InsightFace, Stable Diffusion y Stable Diffusion Inpainting.

Se detectaron dos fugas de datos en ejecuciones anteriores que invalidaron sus resultados: la familia supuestamente retenida había entrado en el entrenamiento, por lo que sus métricas no son evidencia cruzada. El autor las conserva en el registro por auditabilidad, pero no las considera válidas. Además, se identificó un atajo crítico: todas las imágenes generadas del benchmark tienen tamaño 512×512, mientras que las reales tienen tamaños variables. La característica binaria `is_square_512` obtiene un AUC de 1,0000 sin analizar el contenido visual, lo que demuestra que el benchmark no es fiable para medir la capacidad real del detector.

No se menciona el uso de RLHF, DPO ni técnicas de alineación. El entrenamiento se limitó a rostros; el modelo está fuera de distribución para paisajes, objetos, documentos, capturas de pantalla, arte, fotogramas de vídeo y cualquier otra categoría que no sea una cara.

## Capacidades

- Detección de imágenes generadas por IA en rostros, con un AUC *leak-free* de 0,9222 en el peor pliegue (InsightFace) sobre OpenRL/DeepFakeFace.
- Sensibilidad a la compresión JPEG: el AUC cae entre 0,15 y 0,27 puntos al aplicar JPEG q50, quedando entre 0,68 y 0,83 según la familia.
- Capacidad de ranking limitada: el autor recomienda tratar las puntuaciones como salidas de ranking, no como probabilidades calibradas (ECE de 0,1057 en el peor pliegue).
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multilingües.
- No es un modelo desplegable: no hay pesos publicados, ni API, ni código ejecutable.

## Casos de uso

- Investigación metodológica sobre atajos en benchmarks de detección de imágenes generadas: el repositorio documenta cómo un *shortcut* de tamaño de imagen produce un AUC perfecto, lo que sirve para diseñar evaluaciones más robustas.
- Auditoría de benchmarks antes de usarlos: los resultados ayudan a decidir qué comprobaciones realizar (por ejemplo, verificar que los tamaños de imagen no estén correlacionados con la etiqueta).
- Estudio de la sensibilidad a la compresión JPEG en detectores de IA generativa: las métricas muestran una degradación significativa, útil para entender límites de robustez.
- Referencia citable para artículos sobre detección de deepfakes o imágenes sintéticas, especialmente en lo relativo a evaluación cruzada entre generadores.
- Análisis de calibración y falsos positivos en escenarios de baja prevalencia: el documento `docs/ETHICS.md` incluye un ejemplo con prevalencia del 1% donde los falsos positivos dominan las alertas.
- Formación en ética de la detección automatizada: el caso de uso explícito del autor es educativo, no operativo.

## Benchmarks y rendimiento

Resultados reportados por el autor en el benchmark OpenRL/DeepFakeFace (solo rostros, evaluación *leave-one-generator-out*):

| Familia retenida | AUC leak-free | AUC JPEG q50 | Pérdida de AUC | AUC visto | ECE |
|---|---:|---:|---:|---:|---:|
| InsightFace | 0,9222 | 0,6968 | 0,2254 | 0,9908 | 0,1057 |
| Stable Diffusion | 0,9531 | 0,6815 | 0,2716 | 0,9749 | 0,0331 |
| Stable Diffusion Inpainting | 0,9745 | 0,8253 | 0,1492 | 0,9724 | 0,0527 |

Además, el autor reporta que la característica `is_square_512` (tamaño de imagen) alcanza un AUC de 1,0000 en el mismo benchmark, y que el peor resultado en la matriz de intercambio de fuentes negativas es un AUC de 0,4771 (por debajo del azar) para el probe *leak-free* sobre recortes de caras de Open Images tras JPEG q50.

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

No aplica. El repositorio no contiene ningún artefacto de modelo desplegable, por lo que no existen requisitos de VRAM, GPU recomendadas, opciones de despliegue ni estimaciones de latencia o throughput. Cualquier dato al respecto sería especulativo.

## Comparativa con modelos similares

No disponible. Al tratarse de una ficha de resultados sin pesos publicados, no es posible comparar directamente con otros detectores de imágenes generadas (por ejemplo, modelos como GAN-image detectors o clasificadores basados en CLIP) en términos de rendimiento práctico o despliegue. La comparación significativa sería metodológica, pero el autor no proporciona métricas de otros modelos en el mismo benchmark.

## Limitaciones y advertencias

- No contiene pesos ni código ejecutable: no se puede utilizar como detector en ningún entorno.
- El modelo fue entrenado solo con rostros; es completamente inválido para paisajes, objetos, documentos, capturas de pantalla, arte, vídeo u otras categorías.
- El benchmark OpenRL/DeepFakeFace está contaminado por el atajo de tamaño 512×512, lo que invalida cualquier afirmación de capacidad real de detección.
- La compresión JPEG degrada severamente el rendimiento (pérdidas de AUC de 0,15 a 0,27), y en algunos casos el AUC cae por debajo del azar (0,4771).
- La calibración es deficiente en el peor pliegue (ECE = 0,1057); las puntuaciones no deben interpretarse como probabilidades ni como confianza.
- El autor prohíbe explícitamente usar estos resultados para acusar a personas de falsificación, fraude o engaño, ni como evidencia en contextos académicos, laborales, legales, de inmigración, periodísticos o de moderación automatizada.
- En escenarios de baja prevalencia, los falsos positivos dominan: con una prevalencia del 1%, un detector con 95% de tasa de verdaderos positivos y 1% de falsos positivos produce alrededor de 990 banderas de imágenes humanas entre aproximadamente 1.940 banderas totales.
- La licencia de los datos de origen es contradictoria: la tarjeta fuente declara `openrail` pero el texto incluye un bloque Apache-2.0, y el proyecto se niega a liberar pesos debido a estas contradicciones. Los términos de Synthbuster y RAISE-1k son no comerciales, lo que impide la exportación de pesos entrenados sobre ellos.
- No se concede ninguna licencia sobre los pesos retenidos ni sobre los datos de origen; solo el texto de la ficha está bajo CC BY 4.0.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/tobiliicous/aion-model-clip-linear-probe-v1
- Repositorio fuente en GitHub: https://github.com/tobilicous/ai-or-not
- Documentos de referencia en el repositorio fuente: `docs/RESULTS.md`, `docs/SHORTCUT_ANALYSIS.md`, `docs/ETHICS.md`, `artifacts/negswap/metrics.json`
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
