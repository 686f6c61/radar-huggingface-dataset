# ThakiCloud/ThakiOCR-KOEN-G2M-R2

## Resumen

ThakiOCR-KOEN-G2M-R2 es un reconocedor de líneas de texto (line OCR) para coreano e inglés desarrollado por ThakiCloud. Se trata de la segunda iteración del modelo ThakiOCR-KOEN-G2M-Preview: la misma red neuronal, pero entrenada 80.000 pasos adicionales partiendo de los pesos del Preview. Con 8,93 millones de parámetros y una arquitectura CTC (Connectionist Temporal Classification), el modelo recibe una imagen de una línea de texto ya recortada y devuelve su transcripción. No localiza texto en una página; debe combinarse con un detector de líneas o un modelo de layout.

La relevancia de esta versión radica en la mejora del character error rate (CER) en los siete conjuntos de desarrollo del autor, especialmente en líneas sintéticas de coreano (−1,02 puntos porcentuales) e inglés (−0,90 pp). En documentos escaneados reales la mejora es marginal (−0,05 pp en líneas y −0,33 pp en palabras), y el propio autor no la considera significativa. El modelo se publica como research preview y el autor declara explícitamente que el uso en producción es NO-GO.

El modelo se distribuye con licencia Apache-2.0, pesos en fp32 (safetensors) y un script de inferencia autocontenido que solo requiere torch, numpy, Pillow y safetensors. El vocabulario cubre 14.250 caracteres y el repositorio no incluye datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con decodificación CTC (line OCR); detalles internos de capas no disponibles |
| Parametros totales | 8.930.251 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una línea de texto por imagen, no secuencias de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (fp32, solo `state_dict`) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas basado en CTC con decodificación greedy. El vocabulario contiene 14.250 caracteres, idéntico byte a byte al del Preview: el índice CTC `i` mapea a `chars[i-1]` y el índice 0 es el token blank. El repositorio incluye `config.json` con la arquitectura, el preprocesamiento y los ajustes de decodificación, además de hashes de procedencia. El código de `inference.py` es idéntico al de la release Preview; solo cambian los pesos. El autor verificó la red incluida contra el código de entrenamiento (diferencia máxima de logits inferior a 1e-4 y argmax idéntico).

El entrenamiento partió de los pesos del Preview (40.000 pasos), recreando el optimizador y reiniciando el schedule. Se añadieron 80.000 pasos (120.000 acumulados) con batch 128, AdamW con weight decay 0,02, 1.000 pasos de warmup seguidos de decaimiento coseno, learning rate máximo 2e-4, semilla 42 y una GPU B200, con un coste total de 4,45 GPU-horas. La mezcla de datos por muestras extraídas (10,24 M en total) fue: 35% líneas sintéticas de coreano de NVIDIA, 15% líneas sintéticas de inglés de NVIDIA, 31,5% líneas de texto del split Training de AI Hub 71299, 3,5% palabras del mismo dataset y 15% líneas sintéticas de símbolos de ThakiCloud. El pool de líneas reales contiene 28.061 recortes únicos, por lo que cada línea real se vio unas 115 veces. Se verificó por SHA-256 que ninguna imagen de entrenamiento coincide con una de evaluación. Se descartó un segundo candidato (R2B) que mejoraba en sintético y dígitos pero empeoraba en texto real plano (de 9,80% a 10,18% CER en `real_ival_line`).

## Capacidades

- Reconocimiento de texto en imágenes de líneas ya recortadas (image-to-text), con salida de transcripción directa.
- Soporte de coreano e inglés en la misma red y vocabulario.
- Manejo de símbolos, divisas, fechas y dígitos enmascarados o circulados, con CER de 0,28% en el conjunto sintético de símbolos `a1_dev`.
- Decodificación CTC greedy tras normalización Unicode NFC.
- Inferencia en CPU o GPU mediante un script autocontenido con CLI y API Python (`ThakiOCR.recognize([...])`).
- No incluye detección de texto, layout analysis, tool calling, agentes ni capacidades multimodales más allá del reconocimiento de línea.

## Casos de uso

- Digitalización de documentos escaneados en coreano e inglés: el modelo se integra después de un detector de líneas para transcribir cada recorte; su CER de 4,17% en el split oficial de validación de AI Hub 71299 lo hace adecuado para prototipos de archivado, aunque no para producción sin validación adicional.
- Procesamiento de formularios y recibos con dígitos y símbolos: el bajo CER en el conjunto `a1_dev` (0,28%) y la mejora en filas con dígitos o símbolos (de 6,99% a 5,83% en `ko_val`) lo hacen útil para extraer importes, fechas y referencias en pipelines de OCR.
- Preprocesado para pipelines de NLP: transcripción de líneas de corpus coreanos o bilingües para alimentar sistemas de búsqueda, indexación o traducción automática.
- Evaluación comparativa de motores OCR: al publicarse dos versiones con el mismo código y distintos pesos, sirve como referencia controlada para medir el impacto de un reentrenamiento en tareas de reconocimiento de línea.
- Investigación en reconocimiento de texto con CTC: el repositorio incluye el código de inferencia y la configuración, lo que facilita reproducir la decodificación y experimentar con el vocabulario o el preprocesamiento.
- Lectura de líneas en aplicaciones de accesibilidad o extracción de texto de capturas: al ejecutarse en CPU con dependencias mínimas, puede desplegarse en entornos locales para transcribir recortes de una sola línea.

## Benchmarks y rendimiento

Resultados de CER medidos en el mismo job, con el mismo código y las mismas filas para Preview y R2. Menor es mejor.

| Conjunto de desarrollo | Descripcion | Filas | G2M-Preview | G2M-R2 | Cambio (pp) |
|---|---|---|---|---|---|
| ko_val | Líneas sintéticas coreanas de NVIDIA, split de validación | 5.000 | 6,38% | 5,36% | −1,02 |
| en_val | Líneas sintéticas inglesas de NVIDIA, split de validación | 5.000 | 5,49% | 4,59% | −0,90 |
| gold_dev | AI Hub 71299, split oficial de validación (nunca entrenado) | 5.000 | 4,34% | 4,17% | −0,16 |
| real_ival_word | AI Hub 71299, palabras internas de validación excluidas del Training | 5.000 | 8,87% | 8,53% | −0,33 |
| real_ival_line | AI Hub 71299, líneas internas de validación excluidas del Training | 2.895 | 8,43% | 8,37% | −0,05 |
| hold_line | AI Hub 71299, líneas de volúmenes excluidos del entrenamiento | 4.000 | 4,47% | 4,46% | −0,01 |
| a1_dev | Líneas sintéticas de símbolos de ThakiCloud | 5.229 | 0,36% | 0,28% | −0,09 |

Desglose por subconjuntos según el texto de referencia (corto: como máximo tres caracteres no espacio; dígitos/símbolos: contiene al menos un dígito o símbolo):

| Conjunto | Corto: Preview | Corto: R2 | Digitos/simbolos: Preview | Digitos/simbolos: R2 |
|---|---|---|---|---|
| ko_val | 12,54% | 12,01% | 6,99% | 5,83% |
| en_val | 7,42% | 5,66% | 6,07% | 5,10% |
| gold_dev | 3,94% | 3,75% | 6,03% | 5,82% |
| real_ival_word | 8,68% | 8,72% | 10,38% | 9,98% |
| real_ival_line | 32,76% (49 filas) | 33,91% | 7,79% | 7,72% |
| hold_line | 30,99% (38 filas) | 30,99% | 4,53% | 4,52% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los conjuntos anteriores son de desarrollo y se usaron para elegir entre dos candidatos de R2, por lo que no son test sets independientes. Los conjuntos independientes del Preview (test de símbolos y holdout real de 526 recortes) no se volvieron a ejecutar para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 8,93 M de parámetros en fp32 el peso de los pesos ronda los 36 MB, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; el autor entrenó en una B200, pero la inferencia no requiere hardware de datacenter. Cualquier GPU con soporte PyTorch (por ejemplo, RTX 4090, RTX 3060 o superiores) es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo con suficiente memoria para el runtime de PyTorch; el cuello de botella es el preprocesamiento de imágenes, no el modelo.
- Opciones de despliegue: script `inference.py` autocontenido (torch, numpy, Pillow, safetensors) con CLI y API Python; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor reporta 4,45 GPU-horas para 80.000 pasos de entrenamiento con batch 128 en una B200, pero no publica métricas de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La única comparación documentada es con la versión anterior del mismo modelo:

| Modelo | Parametros | Idiomas | CER gold_dev | CER real_ival_line | Licencia | Estado |
|---|---|---|---|---|---|---|
| ThakiOCR-KOEN-G2M-R2 | 8,93 M | ko, en | 4,17% | 8,37% | Apache-2.0 | Research preview |
| ThakiOCR-KOEN-G2M-Preview | 8,93 M (misma red) | ko, en | 4,34% | 8,43% | Apache-2.0 | Research preview |

No se conocen en la información disponible alternativas de la misma categoría (reconocedores de línea coreano/inglés con CTC) con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Estado de research preview: el autor declara el uso en producción como NO-GO.
- Mejora escasa en imágenes reales: en líneas escaneadas reales el CER pasa de 8,43% a 8,37%, un cambio que el autor no considera significativo.
- Los conjuntos de desarrollo se usaron para seleccionar entre dos candidatos de R2, por lo que no son test sets independientes; los conjuntos independientes del Preview no se reevaluaron.
- El modelo solo reconoce líneas ya recortadas; no detecta texto ni analiza layout, por lo que requiere un detector de líneas externo.
- Rendimiento débil en líneas muy cortas en texto real: CER de 33,91% en `real_ival_line` corto (49 filas) y 30,99% en `hold_line` corto (38 filas), sin mejora respecto al Preview.
- Cobertura limitada a coreano e inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible.
- Licencia Apache-2.0 para código y pesos, pero el repositorio no distribuye datos de entrenamiento; los originales de AI Hub y los recortes derivados permanecen en almacenamiento interno de ThakiCloud. El archivo NOTICE recoge atribuciones de datos (CC BY 4.0, fuentes SIL OFL 1.1, AI Hub).
- No se publican métricas de latencia ni throughput de inferencia, lo que dificulta planificar despliegues con requisitos de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-R2
- Modelo base (Preview): https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-Preview
- Dataset de entrenamiento sintético: https://huggingface.co/datasets/nvidia/OCR-Synthetic-Multilingual-v1
