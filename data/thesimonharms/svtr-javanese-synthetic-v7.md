# thesimonharms/svtr-javanese-synthetic-v7

## Resumen

El modelo `thesimonharms/svtr-javanese-synthetic-v7` es un reconocedor óptico de caracteres (OCR) especializado en líneas de texto impreso en aksara javanés (escritura tradicional de Java, bloque Unicode U+A980–U+A9DF). Desarrollado por thesimonharms, este checkpoint se basa en la arquitectura SVTRv2 (Scene Text Recognition with a Single Visual Model, versión 2) y utiliza una cabeza de clasificación CTC (Connectionist Temporal Classification) para decodificar secuencias de glifos. Está diseñado específicamente para trabajar con líneas recortadas de gran anchura (hasta 1600 píxeles) y longitudes de 2 a 80 caracteres, superando las limitaciones de los modelos encoder-decoder en texto largo.

El modelo se presenta como una alternativa al sistema TrOCR del mismo autor (v6) para líneas cortas (máximo 12 aksara). Mientras que v6 está optimizado para recortes cuadrados de 384×384, v7 acepta tiras rectangulares con altura fija de 48 píxeles y ancho variable, lo que lo hace adecuado para líneas de texto extensas. Su licencia MIT permite uso comercial y académico sin restricciones, y su tamaño reducido (no se especifica el número de parámetros) lo hace viable para entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque en una lengua y escritura minoritarias, con pocos recursos digitales disponibles. Al estar entrenado exclusivamente con datos sintéticos (80 000 muestras de entrenamiento), ofrece una base para investigación y desarrollo de herramientas de digitalización de documentos javaneses, aunque con limitaciones claras en cuanto a dominio (solo texto impreso) y a la necesidad de un detector de líneas externo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2 (RepSVTR / RepViT) con cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen: altura 48, ancho hasta 1600) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | javanés (jv) |
| Licencia | MIT |
| Formato de pesos | pytorch (formato nativo, no se especifica safetensors) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder basado en OpenOCR RepSVTR, una variante móvil de SVTRv2 que combina bloques de mezcla local y global para extraer características de trazos y dependencias entre caracteres. El encoder no está congelado durante el entrenamiento, lo que permite una adaptación completa al dominio javanés. La cabeza de clasificación es una capa CTC con aproximadamente 97 clases (el bloque aksara U+A980–U+A9DF más el token blank). La entrada es una imagen RGB de una línea recortada, redimensionada a altura 48 manteniendo la proporción de aspecto y con un ancho máximo de 1600 píxeles; no se aplica padding a cuadrado. La salida se obtiene mediante decodificación CTC greedy (colapso de repeticiones y eliminación de blanks).

El entrenamiento se realizó sobre el dataset sintético `thesimonharms/javanese-synthetic-long`, que contiene 80 000 muestras de entrenamiento y 2 500 de validación. Las muestras incluyen de 2 a 80 aksara, con una distribución de longitudes: 15% cortas (≤12), 20% medias (13–24), 30% largas (25–40) y 35% extralargas (41+). Las imágenes se generaron con fuentes Unicode Regular procesadas mediante HarfBuzz, sobre fondos de papel crema o blanco, con ligero desenfoque y compresión JPEG. No se aplicaron fondos de manuscritos ni aumentos adicionales. El proceso de entrenamiento es supervisado (no se menciona RLHF ni DPO).

## Capacidades

- Reconocimiento de texto impreso en aksara javanés a partir de líneas recortadas (imagen a texto).
- Manejo de líneas de hasta aproximadamente 80 caracteres, con entrada de altura 48 y ancho hasta 1600 píxeles.
- Decodificación CTC greedy, que colapsa repeticiones y elimina el token blank.
- Especialización en texto largo, donde los modelos encoder-decoder suelen fallar.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM; es exclusivamente un modelo OCR.
- Multilingüe: solo javanés (jv).

## Casos de uso

- Digitalización de documentos impresos en aksara javanés: el modelo puede procesar líneas extraídas de escaneos de libros, periódicos o revistas antiguas, siempre que un detector de líneas externo proporcione los recortes. Su capacidad para manejar líneas largas (hasta 80 caracteres) reduce la necesidad de segmentación en fragmentos más pequeños.
- Investigación en procesamiento de lenguas minoritarias: permite crear corpus digitales de textos javaneses para estudios lingüísticos, entrenamiento de modelos de traducción o análisis de frecuencia de glifos.
- Preprocesamiento para traducción automática: al convertir imágenes de texto javanés a cadenas Unicode, se facilita la integración con sistemas de traducción automática o diccionarios digitales.
- Herramientas educativas: puede usarse en aplicaciones de aprendizaje de aksara javanés, donde los estudiantes escanean líneas impresas y reciben la transcripción en caracteres latinos o en Unicode.
- Archivado y preservación digital: bibliotecas y archivos que necesiten digitalizar colecciones de documentos javaneses pueden emplear este modelo como parte de un pipeline de OCR, siempre con supervisión humana para garantizar la calidad.
- Generación de datos de entrenamiento para otros modelos: las salidas del modelo pueden servir como pseudoetiquetas para entrenar sistemas de detección de líneas o para aumentar datasets en otros idiomas con escritura similar.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden a la validación del dataset `javanese-synthetic-long` (1500 muestras) con decodificación CTC greedy. Se presentan por bucket de longitud:

| Bucket | n | Exact | CER | Near (edit ≤2) |
|---|---:|---:|---:|---:|
| Short (≤12) | 225 | 93.33% | 1.04% | 99.56% |
| Mid (13–24) | 300 | 91.67% | 0.67% | 98.67% |
| Long (25–40) | 450 | 93.56% | 0.30% | 99.11% |
| XLong (41+) | 525 | 79.62% | 0.51% | 97.71% |
| **All** | **1500** | **88.27%** | **0.56%** | **98.60%** |

No se han publicado comparaciones con otros modelos en la información disponible. El autor indica que el modelo v6 (TrOCR) es el recomendado para líneas cortas (≤12 aksara) y que v7 está optimizado para líneas largas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- Dado que el modelo es un SVTRv2 móvil (RepViT), se espera que sea ligero y pueda ejecutarse en CPU o GPU de consumo, aunque no hay datos concretos de VRAM ni de latencia.
- Para inferencia, se puede cargar con PyTorch estándar; no se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia optimizados.
- El script de inferencia proporcionado (`infer.py`) permite cargar el modelo y reconocer una imagen de línea directamente, lo que sugiere que el despliegue es sencillo en entornos Python.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos OCR para aksara javanés. El propio autor diferencia este modelo de su versión anterior:

| Modelo | Arquitectura | Entrada | Longitud máxima | Uso recomendado |
|---|---|---|---|---|
| `svtr-javanese-synthetic-v7` (este) | SVTRv2 + CTC | Línea (altura 48, ancho ≤1600) | ~80 aksara | Líneas largas impresas |
| `trocr-javanese-synthetic-v6` | TrOCR (vision-encoder-decoder) | Cuadro 384×384 | ≤12 aksara | Recortes cortos y cuadrados |

No se han encontrado otros modelos públicos específicos para aksara javanés en la información disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con texto sintético impreso; no funciona con manuscritos, hojas de palma, manchas o fondos complejos.
- Ancho máximo de entrada: 1600 píxeles, lo que limita la longitud de línea a aproximadamente 80 aksara; líneas más largas requieren segmentación previa.
- Errores de CTC: pueden producirse colapsos o errores en glifos repetidos o muy juntos, afectando la exactitud en líneas extralargas (exact match del 79.62% en el bucket 41+).
- No incluye detector de líneas: el modelo espera una línea recortada como entrada; no procesa páginas completas ni documentos completos.
- Sin supervisión humana, no es adecuado para digitalización archivística en producción.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías; el autor no proporciona soporte técnico.
- No se han publicado detalles sobre el número de parámetros ni el tamaño del modelo, lo que dificulta estimar requisitos de memoria.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/thesimonharms/svtr-javanese-synthetic-v7
- Dataset de entrenamiento: https://huggingface.co/datasets/thesimonharms/javanese-synthetic-long
- Modelo v6 (TrOCR para líneas cortas): https://huggingface.co/thesimonharms/trocr-javanese-synthetic-v6
- Paper SVTRv2 (Du et al., ICCV 2025): https://arxiv.org/abs/2411.15858
- Paper SVTR original (Du et al., 2022): https://arxiv.org/html/2205.00159v2
