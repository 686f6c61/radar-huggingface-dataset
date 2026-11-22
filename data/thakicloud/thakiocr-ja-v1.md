# ThakiCloud/ThakiOCR-JA-v1

## Resumen

ThakiOCR-JA-v1 es un modelo de reconocimiento óptico de caracteres (OCR) para japonés publicado por ThakiCloud como versión de investigación. Se construye sobre PaddleOCR-VL-1.6 (0,9B parámetros) mediante la fusión de un único adaptador LoRA (r 16, α 32, 600 pasos, SFT con entropía cruzada estándar) en los pesos originales. El modelo lee imágenes de líneas de texto individuales recortadas de documentos japoneses impresos con disposición horizontal.

La relevancia del modelo reside en su enfoque metodológico: la model card documenta un protocolo de evaluación pre-registrado con márgenes de no inferioridad, intervalos de confianza por bootstrap agrupado sobre 30 PDFs y una comparación explícita contra el modelo base. Sobre 2.000 líneas de documentos gubernamentales japoneses, el modelo se declara no inferior al base, pero no superior, y reconoce una regresión confirmada en una de las cinco fuentes evaluadas.

Se trata de una publicación de investigación, no de un modelo listo para producción. El autor lo indica explícitamente: "v1" marca la primera versión de investigación y no implica madurez para despliegue. El modelo tiene 958.588.736 parámetros y un repositorio de 1,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PaddleOCR-VL (image-text-to-text), fine-tuning LoRA fusionado sobre PaddleOCR-VL-1.6 |
| Parámetros totales | 958.588.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de PaddleOCR-VL-1.6, un modelo de 0,9B parámetros para image-text-to-text, y le aplica un fine-tuning supervisado mediante un adaptador LoRA con rango 16, α 32 y 600 pasos de entrenamiento con entropía cruzada estándar. El adaptador se fusiona posteriormente en los pesos originales, por lo que la distribución resultante es un checkpoint completo, no un adaptador separado. El código remoto del modelo base está incluido y requiere `trust_remote_code=True`.

El entrenamiento se realizó sobre el dataset llm-jp/JSSODa. La decodificación es greedy con el prompt `OCR:`. El modelo no incorpora detección de orientación: el llamador debe declarar la orientación de la imagen (`upright` o `rot_ccw90`), y si se declara `unknown` el resultado se marca con `orientation_unverified: true` sin garantía de precisión. La evaluación se realizó sobre 2.000 líneas de 30 PDFs de cinco fuentes públicas japonesas (gabinete, medio ambiente, MEXT, MIC), con métricas de CER tras NFKC y eliminación de espacios, F1 de dígitos y tasa de alucinación de dígitos, con intervalos de confianza al 95% por bootstrap agrupado sobre los 30 PDFs (B = 1000, semilla 20261118).

## Capacidades

- OCR de líneas de texto individuales recortadas de documentos japoneses impresos con disposición horizontal.
- Reconocimiento de caracteres japoneses con énfasis en documentos gubernamentales y de política pública.
- Reconocimiento de dígitos dentro de líneas de texto (931 de las 2.000 líneas de evaluación contienen dígitos).
- Manejo de orientación declarada por el llamador: `upright` (sin transformación) y `rot_ccw90` (rotación de 90° en sentido horario antes del OCR).
- Normalización opcional `modern_ja` que mapea exactamente dos caracteres en el campo `text`: 齡 (U+9F61) → 齢 (U+9F62) y · (U+00B7) → ・ (U+30FB); el campo `raw_text` nunca se modifica.
- Salida estructurada con `raw_text` (salida greedy del modelo) y `text` (con normalización opcional).
- No soporta: OCR de página vertical completa, detección automática de orientación, OCR de coreano o inglés, análisis de layout documental, ni precisión exacta garantizada en dígitos y símbolos.

## Casos de uso

- Digitalización de líneas de documentos gubernamentales japoneses: el modelo está evaluado específicamente sobre líneas de libros blancos del gabinete, medio ambiente, MEXT y MIC, por lo que es adecuado para pipelines de digitalización de publicaciones oficiales con disposición horizontal.
- Extracción de texto de recortes de líneas en proyectos de investigación: al ser una release de investigación con protocolo de evaluación documentado, sirve como baseline reproducible en estudios de OCR japonés.
- Procesamiento de documentos con dígitos críticos: la métrica de F1 de dígitos (0,9973) y la baja tasa de alucinación de dígitos (0,0009 en líneas sin dígitos) lo hacen adecuado para líneas con cifras estadísticas, siempre que se valide contra la fuente.
- Integración en pipelines con vLLM: el modelo se ha verificado con vLLM 0.28.0 y requiere `pillow`; puede desplegarse como servicio de inferencia por línea con decodificación greedy y prompt `OCR:`.
- Preprocesado de corpus para entrenamiento de modelos de lenguaje en japonés: la salida `raw_text` permite conservar variantes históricas (por ejemplo 齡) cuando el documento original las usa, y la normalización `modern_ja` permite generar la variante moderna de forma controlada.
- Evaluación comparativa de fine-tunings de OCR: el modelo sirve como referencia de un LoRA fusionado con protocolo pre-registrado, útil para equipos que diseñan sus propias evaluaciones de no inferioridad.

## Benchmarks y rendimiento

Evaluación principal sobre gov_ja_v2: 2.000 líneas de 30 PDFs de 5 fuentes públicas japonesas. CER tras NFKC con espacios eliminados; F1, precisión y recall de dígitos sobre spans de dígitos (1.463 en la verdad de referencia); alucinación de dígitos como proporción de las 1.069 líneas sin dígitos en las que el modelo emite algún dígito.

| Modelo | CER | F1 dígitos | Precisión dígitos | Recall dígitos | Alucinación de dígitos (tasa por línea) |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 (base) | 0,0118 | 0,9956 | 0,9925 | 0,9986 | 0,0075 |
| ThakiOCR-JA-v1 | 0,0094 | 0,9973 | 0,9973 | 0,9973 | 0,0009 |
| sibling B (SFT con aumentación de rotación, no publicado) | 0,0148 | 0,9908 | 0,9884 | 0,9932 | 0,0009 |

| Comparación (Δ = nuestro − otro) | Δ CER [IC 95%] | Δ F1 dígitos [IC 95%] |
|---|---|---|
| vs base | −0,0024 [−0,0060, +0,0008] | +0,0017 [−0,0025, +0,0068] |
| vs sibling B | −0,0054 [−0,0110, −0,0016] | no disponible |

Resultados por fuente (CER; Δ = nuestro − base, IC sobre PDFs dentro de la fuente):

| Fuente | Líneas | Base | Nuestro | Δ [IC 95%] | F1 dígitos base → nuestro |
|---|---|---|---|---|---|
| MEXT ciencia y tecnología | 306 | 0,0188 | 0,0067 | −0,0121 [−0,0243, +0,0009] | 0,9712 → 0,9926 |
| MIC información y comunicaciones | 404 | 0,0157 | 0,0099 | −0,0058 [−0,0084, −0,0035] | 1,0000 → 0,9944 |
| Ministerio de Medio Ambiente | 454 | 0,0096 | 0,0089 | −0,0007 [−0,0034, +0,0013] | 1,0000 → 1,0000 |
| Gabinete, discapacidad | 403 | 0,0122 | 0,0105 | −0,0017 [−0,0122, +0,0058] | 0,9983 → 0,9983 |
| Gabinete, sociedad del envejecimiento | 433 | 0,0042 | 0,0100 | +0,0058 [+0,0020, +0,0099] | 1,0000 → 1,0000 |

Conclusiones declaradas: no inferioridad frente al base en CER (límite superior del IC por debajo de +0,01), F1 de dígitos (límite inferior por encima de −0,02) y tasa de alucinación de dígitos (límite superior por debajo de +0,01), con márgenes fijados antes de la evaluación. Superioridad frente al base no establecida: todos los IC incluyen 0. La fuente de sociedad del envejecimiento del gabinete es una regresión confirmada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo tiene 958.588.736 parámetros y un repositorio de 1,9 GB, lo que sugiere que cabe en GPUs de consumo, pero no se publica una cifra de VRAM.
- GPU recomendadas: no disponible.
- Cabida en GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: vLLM (verificado en 0.28.0), transformers con `trust_remote_code=True`; requiere `pillow`. El script `inference.py` del repositorio implementa la interfaz de reconocimiento por línea.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en gov_ja_v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiOCR-JA-v1 | 958.588.736 | no disponible | 0,0094 | Apache 2.0 | Hugging Face |
| PaddleOCR-VL-1.6 (base) | 0,9B | no disponible | 0,0118 | no disponible en la información | Hugging Face (PaddlePaddle) |
| sibling B (SFT con aumentación de rotación) | no disponible | no disponible | 0,0148 | no disponible | no publicado |

## Limitaciones y advertencias

- Modelo de investigación: "v1" no implica preparación para producción; el autor lo declara explícitamente.
- No se ha demostrado superioridad frente al modelo base: todos los intervalos de confianza de las diferencias incluyen 0.
- Regresión confirmada en la fuente "Cabinet Office, ageing society": Δ CER +0,0058 [+0,0020, +0,0099] frente al base.
- Regresión de glifo confirmada: escribe la variante 齡 (U+9F61) donde el texto moderno usa 齢 (U+9F62); la normalización `modern_ja` corrige esto solo en el campo `text`, nunca en `raw_text`.
- No detecta orientación: el llamador debe declararla; con `unknown` no se garantiza precisión y el resultado se marca como no verificado.
- No soporta OCR de página vertical completa, análisis de layout documental, ni OCR de coreano o inglés.
- No se garantiza precisión exacta en dígitos y símbolos; la evaluación es sobre un único conjunto con verdad de referencia reparada, no un test independiente intacto.
- Evaluación limitada a 5 fuentes y 30 PDFs; la generalización a otros dominios no está verificada.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías de rendimiento y las regresiones documentadas desaconsejan su uso en producción sin validación propia.
- Riesgo de alucinación de dígitos bajo pero no nulo: 0,0009 de tasa por línea en el conjunto de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/ThakiCloud/ThakiOCR-JA-v1
- Model card en coreano: https://huggingface.co/ThakiCloud/ThakiOCR-JA-v1/blob/main/MODEL_CARD.ko.md
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Dataset de entrenamiento: https://huggingface.co/datasets/llm-jp/JSSODa
- Paper de referencia: https://arxiv.org/abs/2511.15059
