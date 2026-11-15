# ThakiCloud/ThakiOCR-KOEN-G2M-R3

## Resumen

ThakiOCR-KOEN-G2M-R3 es un reconocedor de líneas de texto (text-line recognizer) para coreano e inglés, desarrollado por ThakiCloud. Se trata de la tercera iteración de la línea G2M y constituye un ajuste fino (finetune) de los pesos del modelo anterior, ThakiOCR-KOEN-G2M-R2. El modelo recibe una única línea de texto ya recortada y devuelve su transcripción; no localiza texto en una página, por lo que debe combinarse con un detector de líneas o un modelo de layout.

La arquitectura es una red neuronal de 8,93 millones de parámetros entrenada con CTC (Connectionist Temporal Classification) y decodificación greedy. El vocabulario contiene 14.250 caracteres, idéntico al de R2, donde el índice CTC 0 es el token blank. El modelo se distribuye en formato safetensors con pesos en fp32 y código de inferencia autocontenido en PyTorch.

La relevancia de esta versión radica en la incorporación de una segunda fuente de imágenes reales de documentos: el split oficial de entrenamiento del dataset AI Hub 632 (dominio financiero, 9 plantillas de formularios, 9.986 páginas, 289.290 recortes de línea y 79.568 de palabra). Sobre los conjuntos de desarrollo con imágenes reales, la tasa de error de carácter (CER) baja ligeramente (por ejemplo, de 8,37% a 8,16% en líneas de validación interna), aunque empeora marginalmente en los conjuntos sintéticos. El autor lo marca explícitamente como research preview y declara NO-GO para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red CTC para reconocimiento de líneas (image-to-text), pesos en PyTorch |
| Parametros totales | 8.930.251 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una línea de imagen por inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (model.safetensors, fp32) |

## Arquitectura y entrenamiento

El modelo es una red de reconocimiento de texto con salida CTC, entrenada para mapear una imagen de línea recortada a una secuencia de caracteres. La decodificación es CTC greedy y el vocabulario de 14.250 caracteres se mantiene igual al de R2, con el índice 0 reservado para el token blank. El código de inferencia (inference.py) es autocontenido y depende solo de torch, numpy, Pillow y safetensors; el autor verificó la red vendorizada contra el código de entrenamiento sobre estos pesos (diferencia máxima de logits inferior a 1e-4 y argmax idéntico).

El entrenamiento parte de los pesos de G2M-R2 (120.000 pasos acumulados) y añade 30.000 pasos en dos etapas: un piloto de 10.000 pasos y 20.000 pasos adicionales desde el piloto, alcanzando 150.000 pasos acumulados. Cada etapa usa batch 128, AdamW con weight decay 0,02, 500 pasos de warmup seguidos de decaimiento coseno, learning rate pico de 1e-4, semilla 42 y una GPU B200. El coste total fue de 1,68 GPU-horas. El único cambio respecto a R2 es la mezcla de datos: se añadió el split oficial de entrenamiento de AI Hub 632 (9 plantillas, 9.986 páginas, 289.290 recortes de línea y 79.568 de palabra) y se redujo la proporción de líneas reales de AI Hub 71299, de modo que cada uno de sus 28.061 recortes de línea se repitió unas 25 veces en esta ronda frente a unas 115 en R2. La mezcla por muestras extraídas suma 3,84 millones, con un 24,5% de líneas sintéticas coreanas de NVIDIA y un 10% (dato truncado en la información disponible) de líneas sintéticas inglesas.

## Capacidades

- Reconocimiento de líneas de texto impresas en coreano e inglés a partir de imágenes recortadas.
- Salida de transcripción mediante decodificación CTC greedy, con normalización Unicode NFC aplicada antes de la evaluación.
- Procesamiento por lotes de varias imágenes de línea en una sola llamada (`recognize(["line1.png", "line2.png"])`).
- Modo demo (`--demo`) que renderiza una línea en inglés y la lee de vuelta.
- Inferencia en CPU o GPU según el parámetro `device` del wrapper `ThakiOCR`.
- Manejo de símbolos sintéticos específicos: moneda, fechas, dígitos encerrados en círculo y dígitos enmascarados (conjunto a1_dev).
- No incluye detección de texto en página, tool calling, agentes, visión general, audio ni modo de razonamiento.

## Casos de uso

- Digitalización de formularios financieros: el modelo se entrenó con plantillas del dataset AI Hub 632 y puede transcribir líneas de formularios del mismo dominio una vez recortadas por un detector; en las 10.392 líneas de tres plantillas no vistas en entrenamiento, el CER bajó de 10,88% (R2) a 6,20% (R3).
- Post-procesado de pipelines OCR existentes: se puede insertar como etapa de reconocimiento de línea detrás de cualquier detector de layout, sustituyendo motores OCR genéricos en documentos coreanos.
- Extracción de campos en documentos escaneados: combinado con un modelo de layout, permite recuperar valores de líneas de campos concretos (importes, fechas) en flujos de captura documental.
- Procesamiento por lotes de archivos históricos: el bajo coste de inferencia (8,93 M de parámetros y pesos fp32 de pequeño tamaño) permite ejecutarlo en CPU sobre grandes volúmenes de recortes de línea.
- Evaluación comparativa de motores OCR: al publicarse junto a R2 con los mismos manifiestos de desarrollo verificados por SHA-256, sirve como referencia reproducible para medir mejoras de CER en coreano.
- Prototipado de investigación en reconocimiento de texto: el código de inferencia autocontenido y la licencia Apache-2.0 permiten reproducir el pipeline y experimentar con la decodificación CTC sin dependencias pesadas.
- Reconocimiento de líneas bilingües coreano-inglés en entornos mixtos, como documentación técnica o señalización con ambos idiomas.

## Benchmarks y rendimiento

Resultados de CER tras normalización Unicode NFC y decodificación CTC greedy, una sola ejecución y una sola semilla. Menor es mejor. Los pesos de R2 se puntuaron al inicio del primer job de entrenamiento de R3 y los de R3 al final del segundo, con manifiestos de desarrollo idénticos byte a byte (verificados por SHA-256).

| Conjunto de desarrollo | Descripción | Filas | G2M-R2 | G2M-R3 | Cambio (pp) |
|---|---|---|---|---|---|
| real_ival_line | AI Hub 71299, líneas de validación interna fuera del split de entrenamiento | 2.895 | 8,37% | 8,16% | −0,21 |
| real_ival_word | AI Hub 71299, palabras de validación interna fuera del split de entrenamiento | 5.000 | 8,53% | 8,31% | −0,22 |
| gold_dev | AI Hub 71299, split oficial de validación, recortes de palabra y línea (nunca entrenado) | 5.000 | 4,17% | 4,09% | −0,08 |
| hold_line | AI Hub 71299, líneas de volúmenes fuera del entrenamiento | 4.000 | 4,46% | 4,38% | −0,08 |
| ko_val | Líneas sintéticas coreanas de NVIDIA, split de validación | 5.000 | 5,36% | 5,43% | +0,07 (peor) |
| en_val | Líneas sintéticas inglesas de NVIDIA, split de validación | 5.000 | 4,59% | 4,64% | +0,05 (peor) |
| a1_dev | Líneas sintéticas de símbolos de ThakiCloud (moneda, fechas, dígitos encerrados y enmascarados) | 5.229 | 0,28% | 0,25% | −0,03 |

Datos adicionales, solo informativos y no usados para seleccionar el checkpoint: en 10.392 líneas de tres plantillas del dataset AI Hub 632 no vistas en entrenamiento, el CER pasó de 10,88% (R2) a 6,20% (R3). El autor advierte que esto refleja principalmente adaptación a esa familia de formularios, ya que R3 se entrenó con otras plantillas del mismo dataset y R2 nunca lo vio. No se han publicado resultados de benchmarks independientes en la información disponible; los conjuntos de desarrollo se usaron para elegir este checkpoint entre candidatos y no son conjuntos de test independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 8,93 millones de parámetros en fp32, los pesos ocupan aproximadamente 36 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para producción a pequeña escala; el modelo soporta inferencia en CPU (`ThakiOCR(".", device="cpu")`). El entrenamiento se realizó en una GPU B200.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) y también en CPU.
- Opciones de despliegue: el propio `inference.py` autocontenido con torch, numpy, Pillow y safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en líneas reales (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiOCR-KOEN-G2M-R3 | 8,93 M | no disponible (una línea por inferencia) | 8,16% (real_ival_line) | Apache-2.0 | Hugging Face |
| ThakiOCR-KOEN-G2M-R2 | no disponible | no disponible (una línea por inferencia) | 8,37% (real_ival_line) | Apache-2.0 | Hugging Face |
| Alternativas de OCR coreano de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos publicados es con la versión anterior de la misma línea, G2M-R2, que se mantiene sin cambios en el repositorio para permitir la comparación directa. No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Estado research preview: el autor declara explícitamente NO-GO para uso en producción.
- Las mejoras de CER son pequeñas (0,1 a 0,2 puntos porcentuales) y no se calcularon intervalos de confianza; el autor no las reclama como significativas.
- R3 no mejora en todas las métricas: las líneas sintéticas coreanas y inglesas empeoran ligeramente (+0,07 y +0,05 pp).
- Los conjuntos de desarrollo se usaron para seleccionar el checkpoint, por lo que no son conjuntos de test independientes; los conjuntos independientes reportados en la model card de Preview no se volvieron a ejecutar para esta versión.
- El modelo solo reconoce líneas ya recortadas; no detecta texto en una página y requiere un detector de líneas o modelo de layout como paso previo.
- Idiomas limitados a coreano e inglés; no se documenta soporte para otras lenguas.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no documentado en la información disponible; al ser un modelo CTC de reconocimiento, la salida queda restringida al vocabulario de 14.250 caracteres.
- Licencia Apache-2.0 para código y pesos, que permite uso comercial, pero el estado de preview y la ausencia de validación independiente desaconsejan su uso en producción.
- El archivo NOTICE atribuye datos de terceros (CC BY 4.0, fuentes SIL OFL 1.1 y AI Hub) e indica qué no está incluido; conviene revisarlo antes de redistribuir.
- El modelo se distribuye sin estado del optimizador, solo pesos fp32 en safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-R3
- Modelo base (R2): https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-R2
- Model card en coreano: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-R3/blob/main/MODEL_CARD.ko.md
- Dataset de entrenamiento (NVIDIA OCR Synthetic Multilingual v1): https://huggingface.co/datasets/nvidia/OCR-Synthetic-Multilingual-v1
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
