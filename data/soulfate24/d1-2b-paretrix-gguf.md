# Soulfate24/d1-2B-Paretrix-GGUF

## Resumen

d1-2B-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo LiquidAI/d1-2B, un modelo de decisión multimodal de 2.000 millones de parámetros desarrollado por Liquid AI sobre su familia LFM3 (arquitectura de tipo "liquid"). El autor de esta colección es Soulfate24, que aplica su suite propia de cuantización empírica denominada Paretrix en lugar de la cuantización uniforme estándar de llama.cpp. El modelo base está orientado a tareas de decisión, clasificación, extracción y calibración ("system-one"), y acepta entradas de imagen y texto (pipeline image-text-to-text).

La relevancia de esta ficha está en el enfoque de cuantización: Paretrix mide la respuesta de cada clase de tensor a cada tipo de cuantización contra los logits de referencia en BF16, planifica cada nivel mediante una mochila exacta (knapsack) y decide con un duelo en el régimen de veredicto si el plan sustituye al campeón. El resultado son niveles con nombres propios (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc) que se comparan contra las cuantizaciones estándar Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx e IQ3_M-imx.

El modelo cubre 16 idiomas (incluido el español) y se distribuye con licencia LFM1.0 (licencia "other"), lo que condiciona el uso comercial. Está pensado para despliegue en el edge y es compatible con llama.cpp, por lo que puede ejecutarse en hardware de consumo con requisitos de memoria que van desde unos 738 MiB (Femto-21pc) hasta 1.761 MiB (Q8_0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (liquid), transformer híbrido con código personalizado (custom_code); multimodal image-text-to-text |
| Parametros totales | 2B (2.000 millones, según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (estándar) y niveles Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc (cuantización híbrida por clase de tensor con imatrix) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (con soporte de transformers y llama.cpp); el modelo base en BF16 |

## Arquitectura y entrenamiento

El modelo base LiquidAI/d1-2B pertenece a la familia LFM3 de Liquid AI, etiquetada como "liquid" y "lfm3", con arquitectura de tipo liquid y capacidades multimodales de imagen y texto. La model card de esta colección no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en el material proporcionado. El modelo se presenta como un "decision model" orientado a clasificación, extracción y calibración, con un régimen de inferencia "system-one" (respuesta directa, sin cadena de pensamiento extendida).

La innovación técnica destacable de esta ficha no está en el modelo base, sino en el procedimiento de cuantización. Paretrix parte de tres bases estándar (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide el efecto contra los logits de referencia en BF16. Con esas celdas de medida, una mochila exacta planifica cada nivel y un duelo en el régimen de veredicto decide si el plan sustituye al campeón vigente. El autor afirma que lo que un modelo mide lo hereda el siguiente modelo de su familia. Frente a la cuantización uniforme, que aplica una sola familia de bitwidth a toda la red, Paretrix reparte el presupuesto según el coste medido de cada clase de tensor.

## Capacidades

- Generación de texto y razonamiento de decisión: el modelo está diseñado para producir veredictos tipados (clasificación, extracción, calibración) más que para generación abierta extensa.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text): puede responder preguntas sí/no sobre imágenes, como evidencia el benchmark JevOCRBench.
- Clasificación y extracción de información: etiquetado de decisiones tipadas, según JevBench (231 decisiones tipadas).
- Calibración de confianza: las métricas "decisive" y "opt KL" sugieren capacidad de emitir decisiones con confianza calibrada.
- Multilingüismo: 16 idiomas declarados, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se etiqueta explícitamente como "system-one", lo que sugiere ausencia de razonamiento multi-paso deliberativo.
- Capacidades especiales: visión (image-text-to-text), cuantización híbrida por clase de tensor y compatibilidad con llama.cpp.

## Casos de uso

- Clasificación documental en producción: el modelo puede emitir veredictos tipados sobre documentos y ser desplegado con el nivel Mini-30pc (1.021 MiB), que mantiene el 95,7 % de coincidencia con BF16 en JevBench y una precisión del 77,9 %, superior a la referencia BF16 (76,6 %).
- Verificación visual sí/no: con el nivel Nano-27pc (927 MiB) se obtiene una precisión del 71,0 % y un AUROC de 0,786 en JevOCRBench, adecuado para comprobaciones de presencia o ausencia de elementos en imágenes con presupuesto de memoria muy reducido.
- Despliegue en el edge: el nivel Femto-21pc ocupa 738 MiB, lo que permite ejecutar el modelo en dispositivos con memoria limitada manteniendo una precisión del 75,8 % en JevBench y del 69,3 % en JevOCRBench.
- Extracción de campos estructurados: al estar orientado a extracción y calibración, encaja en pipelines de extracción de datos donde se requiere una decisión por registro con confianza asociada, usando el nivel Quality-36pc (1.219 MiB) para preservar el 98,7 % de coincidencia con BF16.
- Moderación o filtrado de contenido multimodal: la tarea de pregunta visual sí/no del JevOCRBench es directamente aplicable a la revisión automática de imágenes antes de su publicación, con el nivel Precision-42pc (1.406 MiB) y un AUROC de 0,792.
- Servicio de bajada latencia: los tiempos p50 medidos se sitúan en torno a 46-49 ms en JevBench y 138-166 ms en JevOCRBench para todos los niveles, de modo que el nivel Compact-33pc (1.119 MiB) ofrece una latencia de 150 ms en visión con una precisión del 72,3 %, idéntica a la de BF16.
- Evaluación comparativa de cuantizaciones: la colección sirve como banco de pruebas reproducible para medir el impacto de distintas estrategias de cuantización sobre un mismo modelo de decisión, comparando niveles Paretrix contra las bases estándar de llama.cpp.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se miden contra la referencia BF16 del mismo modelo base.

JevBench (231 decisiones tipadas):

| Modelo | MiB | acc | same | flips | decisive | opt KL | p50 ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 3306 | 76,6 | ref | | | — | — |
| Q8_0 (estándar) | 1761 | 76,6 | 99,6 | 1 | 100,0 | 0,0002 | 47 |
| Fidelity-48pc | 1591 | 76,6 | 99,6 | 1 | 100,0 | 0,0003 | 47 |
| Precision-42pc | 1406 | 76,6 | 99,6 | 1 | 100,0 | 0,0006 | 47 |
| Q6_K-imx (estándar) | 1362 | 76,6 | 99,1 | 2 | 100,0 | 0,0006 | 47 |
| Quality-36pc | 1219 | 76,2 | 98,7 | 3 | 100,0 | 0,0009 | 47 |
| Q5_K_M-imx (estándar) | 1200 | 77,5 | 97,8 | 5 | 99,5 | 0,0022 | 47 |
| Compact-33pc | 1119 | 77,1 | 97,0 | 7 | 100,0 | 0,0018 | 46 |
| Mini-30pc | 1021 | 77,9 | 95,7 | 10 | 100,0 | 0,0033 | 47 |
| IQ4_XS-imx (estándar) | 957 | 77,1 | 93,5 | 15 | 98,5 | 0,0096 | 43 |
| Nano-27pc | 927 | 77,9 | 95,2 | 11 | 99,0 | 0,0057 | 46 |
| Pico-24pc | 833 | 76,2 | 91,3 | 20 | 96,0 | 0,0172 | 47 |
| IQ3_M-imx (estándar) | 829 | 77,1 | 93,9 | 14 | 97,0 | 0,0174 | 49 |
| Femto-21pc | 738 | 75,8 | 92,6 | 17 | 95,5 | 0,0209 | 49 |

JevOCRBench (300 filas, pregunta visual sí/no):

| Modelo | MiB | acc | AUROC | same | flips | decisive | opt KL | p50 ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 3306 | 72,3 | 0,788 | ref | | | — | — |
| Q8_0 (estándar) | 1761 | 73,0 | 0,790 | 99,3 | 2 | 100,0 | 0,0001 | 151 |
| Fidelity-48pc | 1591 | 72,3 | 0,792 | 98,7 | 4 | 100,0 | 0,0001 | 154 |
| Precision-42pc | 1406 | 73,0 | 0,792 | 96,0 | 12 | 100,0 | 0,0004 | 159 |
| Q6_K-imx (estándar) | 1362 | 73,3 | 0,793 | 98,3 | 5 | 100,0 | 0,0003 | 166 |
| Quality-36pc | 1219 | 73,0 | 0,789 | 97,3 | 8 | 100,0 | 0,0004 | 152 |
| Q5_K_M-imx (estándar) | 1200 | 72,7 | 0,798 | 97,7 | 7 | 100,0 | 0,0005 | 152 |
| Compact-33pc | 1119 | 72,3 | 0,795 | 97,3 | 8 | 100,0 | 0,0008 | 150 |
| Mini-30pc | 1021 | 72,3 | 0,805 | 93,3 | 20 | 100,0 | 0,0021 | 157 |
| IQ4_XS-imx (estándar) | 957 | 71,0 | 0,780 | 92,0 | 24 | 99,4 | 0,0034 | 138 |
| Nano-27pc | 927 | 71,0 | 0,786 | 93,3 | 20 | 100,0 | 0,0033 | 143 |
| Pico-24pc | 833 | 69,0 | 0,772 | 89,3 | 32 | 98,7 | 0,0064 | 155 |
| IQ3_M-imx (estándar) | 829 | 67,3 | 0,742 | 85,0 | 45 | 97,4 | 0,0097 | 157 |
| Femto-21pc | 738 | 69,3 | 0,767 | 85,7 | 43 | 96,1 | 0,0113 | 155 |

No se han publicado en la información disponible resultados de benchmarks convencionales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 738 MiB (Femto-21pc) y 1.761 MiB (Q8_0) para los pesos cuantizados; la referencia BF16 ocupa 3.306 MiB. Hay que sumar la memoria del contexto y del procesador de visión.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño de los pesos, cualquier GPU con al menos 2-4 GB de memoria libre puede alojar los niveles más pequeños.
- Cabe en GPU de consumo: sí, los niveles Pico-24pc (833 MiB), Nano-27pc (927 MiB), Mini-30pc (1.021 MiB) y Compact-33pc (1.119 MiB) caben holgadamente en GPUs de consumo con 4 GB o más; los niveles mayores también caben en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp y transformers (custom_code), además de los formatos GGUF compatibles con el ecosistema llama.cpp; el pipeline es image-text-to-text.
- Latencia y throughput estimados: p50 de 43-49 ms en JevBench y 138-166 ms en JevOCRBench según el nivel, medidos por el autor. El throughput no se proporciona.

## Comparativa con modelos similares

La comparación más directa posible con los datos disponibles es entre los propios niveles de cuantización de esta colección y el modelo base en BF16, dado que no se aportan datos de otros modelos comparables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Precisión JevBench | Precisión JevOCRBench |
|---|---|---|---|---|---|---|
| LiquidAI/d1-2B (BF16) | 2B | no disponible | lfm1.0 | Hugging Face (LiquidAI) | 76,6 | 72,3 |
| d1-2B-Paretrix Mini-30pc | 2B | no disponible | lfm1.0 | Hugging Face (Soulfate24) | 77,9 | 72,3 |
| d1-2B-Paretrix Quality-36pc | 2B | no disponible | lfm1.0 | Hugging Face (Soulfate24) | 76,2 | 73,0 |
| d1-2B Q8_0 (estándar) | 2B | no disponible | lfm1.0 | llama.cpp estándar | 76,6 | 73,0 |

No se dispone de datos de modelos alternativos de la misma categoría (modelos de decisión multimodales de 2B) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo de decisión, los sesgos del dataset de entrenamiento pueden trasladarse directamente a los veredictos.
- Riesgo de alucinación: el modelo está orientado a decisiones tipadas y calibración, pero no se aportan datos sobre su fiabilidad fuera de los benchmarks del autor; las métricas "decisive" por debajo del 100 % en los niveles agresivos (Pico-24pc 96,0 %, Femto-21pc 95,5 % en JevBench) indican pérdida de determinación.
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible; los 16 idiomas declarados no implican calidad homogénea y no se aportan evaluaciones por idioma.
- Restricciones de licencia: la licencia es LFM1.0 (license: other), no una licencia permisiva estándar; es necesario revisar los términos antes de cualquier uso comercial.
- Caveats para producción: los benchmarks provienen del propio autor de la cuantización y no de una evaluación independiente; las cifras de precisión no deben extrapolarse a dominios distintos de JevBench y JevOCRBench. Los niveles más comprimidos (Pico-24pc, Femto-21pc) degradan la precisión y el número de decisiones deterministas, por lo que conviene validar en el dominio objetivo antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soulfate24/d1-2B-Paretrix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
