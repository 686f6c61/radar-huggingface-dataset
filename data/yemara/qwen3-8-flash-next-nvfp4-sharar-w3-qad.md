# yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3-qad

## Resumen

Este repositorio contiene una copia cuantizada a 3 bits del modelo Qwen3.8-Flash-Next, publicada por el usuario yemara. Se trata de un checkpoint derivado de RadixArk/Qwen3.8-Flash-Next-NVFP4 en el que se han sustituido 231 matrices del tronco (proyecciones de atención, GDN, expertos compartidos, claves y valores de PLE y lm_head) por copias entrenadas mediante destilación con conciencia de cuantización (QAD) usando NVIDIA ModelOpt. Los expertos enrutados se mantienen byte a byte idénticos a la revisión 694e279 del checkpoint original.

El modelo es de tipo mezcla de expertos (MoE) y emplea un formato propietario de cuantización denominado Sharar W3, con un codebook Lloyd de ocho niveles y una escala por cada 32 pesos, lo que resulta en 3,25 bits por peso frente a los 4,5 bits por peso de NVFP4. El objetivo del proyecto es reducir el peso en disco y los requisitos de memoria de un modelo de gran tamaño preservando la calidad del tronco original mediante destilación, no mediante simple redondeo.

La relevancia de esta ficha radica en que documenta una técnica de compresión agresiva con evaluación empírica publicada: en GPQA Diamond con thinking activado, el checkpoint QAD alcanza un 83,3% de media frente al 76,4% de la revisión publicada, acercándose al modelo sin cuantizar (86,4%). No obstante, el propio autor advierte que las cifras proceden de un port en H100 y no de GB10, y recomienda validar antes de servir el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con proyecciones de atención, GDN y PLE; tronco cuantizado a 3 bits con codebook Lloyd de 8 niveles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación se realizó con 64K y 128K tokens de salida) |
| Tipos de cuantizacion | Sharar W3: 3,25 bits/peso (tronco y expertos enrutados); NVFP4 en el modelo base (4,5 bits/peso); activaciones E4M3 por grupo de 32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" con license_name qwen-community-1.0) |
| Formato de pesos | safetensors (repositorio de 50,9 GB; expertos enrutados en 46,1 GiB) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con proyecciones de atención, capas GDN (probablemente una variante de atención lineal con decaimiento) y PLE (key/value). El tronco contiene 231 matrices cuantizadas a 3 bits mediante un codebook Lloyd de ocho niveles {±0,406, ±1,25, ±2,25, ±3,5} multiplicado por una escala por cada 32 pesos y una escala global por experto. Los expertos enrutados se calibraron con GPTQ sobre activaciones enrutadas, con covarianzas ponderadas por el cuadrado del peso de enrutamiento, damping de 0,01 y shrinkage hacia la covarianza agrupada de la capa por debajo de 256 filas. El error de salida medio frente a los expertos NVFP4 es de 0,072 para fc1 y 0,120 para fc2.

El entrenamiento QAD se realizó destilando el conocimiento del profesor RadixArk/Qwen3.8-Flash-Next-NVFP4 (tronco BF16, expertos NVFP4 W4A16) hacia el estudiante, con pérdida KL sobre el vocabulario en tokens de asistente (método mtd de ModelOpt). Se entrenaron el código latente de cada peso del tronco (redondeo straight-through a los ocho niveles Lloyd) y una ganancia por fila sobre la escala de fila, manteniendo las escalas de grupo E4M3 y los expertos enrutados. Los datos consistieron en 79.000 conversaciones (185 millones de tokens) de respuestas propias del modelo con thinking activado sobre Open-PerfectBlend (75%), OpenCodeInstruct (22%) y UltraChat, excluyendo cualquier solapamiento de 13 gramas con GPQA, MMLU-Pro, MATH-500, AIME, LiveCodeBench o HumanEval. El schedule fue de 500 pasos de 64K tokens (unos 33 millones de tokens, secuencias de hasta 8.192), optimizador Adam, LR latente 1e-2, LR de ganancia 5e-4 y decaimiento coseno. La KL retenida frente al profesor bajó de 0,128 a 0,059, y cambió el 1,96% de los códigos del tronco.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto (esfuerzo xhigh), incluyendo cadenas de razonamiento largas de hasta 64K y 128K tokens de salida.
- Resolución de problemas de razonamiento científico y de nivel experto: GPQA Diamond con un 83,3% de precisión media en tres semillas.
- Generación de código competitivo: LiveCodeBench v6 con un 84,7% en 131 problemas de concursos desde febrero de 2025.
- Capacidad de respuesta a preguntas de conocimiento general y profesional (MMLU, MMLU-Pro) evaluada en el proceso de calibración.
- Razonamiento matemático de nivel escolar (GSM8K) y generación de funciones (HumanEval) evaluados en la comparativa de expertos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo thinking y las ventanas largas lo permiten.
- Capacidades multilingües: no disponible.
- Capacidades especiales: decodificación especulativa verificada (DFlash2) en el port SGLang, y selección presupuestada de expertos (4:12:64) en el perfil "fast".

## Casos de uso

- Evaluación de modelos de razonamiento científico: el checkpoint permite reproducir los resultados de GPQA Diamond con tres semillas y comparar el efecto de la cuantización QAD frente al redondeo simple, usando el arnés sharar-eval y el brazo "w3".
- Generación de código competitivo en producción: con un 84,7% en LiveCodeBench v6 y soporte de hasta 128K tokens de salida, puede integrarse en pipelines que resuelvan problemas algorítmicos o generen soluciones verificadas contra tests.
- Destilación y compresión de modelos MoE: sirve como referencia metodológica para aplicar QAD con ModelOpt sobre un tronco cuantizado a 3 bits, manteniendo los expertos enrutados intactos y midiendo la KL retenida frente al profesor.
- Despliegue en una sola GPU Spark: el formato Sharar W3 reduce el peso a 3,25 bits por peso, lo que permite servir el modelo con los expertos enrutados como única copia residente en un único dispositivo, con perfiles "fast" y "throughput".
- Investigación sobre decodificación especulativa: el port SGLang incorpora verificación exacta DFlash2, lo que permite medir el impacto de la decodificación especulativa en la latencia y en la precisión con el brazo "w3".
- Validación de calidad de cuantizaciones: los scripts tools/lossy-gate.py y tools/evaluate.py permiten comparar el checkpoint contra el modelo "exact" antes de servirlo, midiendo la pérdida de precisión en tareas concretas.
- Ajuste fino de expertos con GPTQ: la metodología de calibración con covarianzas ponderadas por el peso de enrutamiento y shrinkage puede reutilizarse para recalibrar expertos en otros modelos MoE.

## Benchmarks y rendimiento

GPQA Diamond con thinking activado (esfuerzo xhigh por defecto), temperatura 1,0, top-p 0,95, top-k 20, 64K tokens, 3 semillas, arnés sharar-eval, brazo "w3" en H100:

| Copias | Semilla 0 / 1 / 2 | Media | Cortadas a 64K |
|---|---|---|---|
| Publicada 694e279 | 76,8 / 76,3 / 76,3 | 76,4 | 30 / 33 / 28 |
| **Este checkpoint (QAD)** | 83,8 / 83,3 / 82,8 | **83,3** | 18 / 19 / 17 |
| Reajuste GPTQ sobre trazas de thinking (no publicado) | 85,9 / 84,3 / 82,3 | 84,2 | 13 / 17 / 24 |
| Exacto (sin copias a 3 bits) | 86,4 / 84,8 / 87,9 | 86,4 | 16 / 18 / 16 |

Comparación pareada por pregunta (3 semillas): +6,9 puntos sobre 694e279 (IC bootstrap del 95%: +3,5 a +10,4), -0,8 frente al reajuste (-3,2 a +1,3) y -3,0 frente al exacto (-5,4 a -0,7).

Con el brazo "fast" del port (selección presupuestada de expertos 4:12:64, top-2 relajado dentro de 1,0), semilla 0: 82,8% con batch 8 y 82,3% con batch 16, frente al 83,8% del brazo "w3" (-1,0 puntos con batch 8, IC del 95%: -5,6 a +3,5).

LiveCodeBench v6 (test6.jsonl, concursos desde 2025-02-01, 131 problemas), brazo "w3", una semilla, prompt y evaluador oficiales, 128K tokens de salida: **84,7%** (AtCoder 63/82, LeetCode 48/49; 5 cortados). De los 111 resueltos, 96 usaron como máximo 64K tokens (73,3%), frente al 77,1% del exacto a 64K en la tarea LCB propia de sharar-eval (3 semillas) y el 66,9% del reajuste de thinking; los evaluadores difieren, por lo que la comparación es indicativa.

Calidad de los expertos enrutados a 3 bits (una Spark, perfil "fast", greedy, thinking desactivado), pareada frente a los expertos NVFP4: MMLU-Pro (350) 80,6 vs 80,9% (11/12, p 1,0); GPQA Diamond (198) 70,2 vs 72,7% (10/15, p 0,42; 33 respuestas cortadas a 8.192 tokens en ambos); GSM8K-150 145 vs 147; HumanEval-60 55 vs 57.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 50,9 GB, con los expertos enrutados en 46,1 GiB; el tronco a 3 bits y los expertos a 3,25 bits/peso permiten servir el modelo en un único dispositivo Spark con los expertos como única copia residente.
- GPU recomendadas: H100 para las evaluaciones publicadas; el formato está pensado para GB10 (Spark). No se dispone de datos de rendimiento en otras GPU.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del checkpoint (50,9 GB) supera la VRAM de las RTX 4090 (24 GB) y no se documenta una variante que quepa en ellas.
- Opciones de despliegue: port SGLang de Sharar (revisión 3d993d0), que ejecuta los kernels W3; el checkpoint se carga sin cambios con SHARAR_W3_CHECKPOINT o apuntando W3_REPO / W3_REVISION a este repositorio.
- Latencia y throughput: no disponibles de forma directa; se documentan diferencias de precisión entre batch 8 y batch 16 en el brazo "fast" (82,8% y 82,3%), pero no medidas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (QAD, 3 bits) | no disponible | no disponible (evaluado a 64K) | 83,3% (media de 3 semillas) | qwen-community-1.0 | HuggingFace (yemara) |
| Publicada 694e279 (3 bits, sin QAD) | no disponible | no disponible | 76,4% | qwen-community-1.0 | HuggingFace (yemara) |
| Reajuste GPTQ sobre thinking (no publicado) | no disponible | no disponible | 84,2% | no disponible | No publicado |
| Exacto (RadixArk/Qwen3.8-Flash-Next-NVFP4) | no disponible | no disponible | 86,4% | qwen-community-1.0 | HuggingFace (RadixArk) |

## Limitaciones y advertencias

- Las cifras de rendimiento proceden de un port en H100 (SGLang, revisión 3d993d0), no de GB10; el autor recomienda ejecutar tools/lossy-gate.py y tools/evaluate.py contra el modelo exacto antes de servir este checkpoint.
- El checkpoint depende del formato propietario Sharar W3 y de sus kernels; no es un modelo estándar de transformers y requiere el port SGLang indicado.
- Los expertos enrutados son byte a byte idénticos a la revisión 694e279 y conservan el error de cuantización de la calibración GPTQ original (error medio de salida de 0,072 en fc1 y 0,120 en fc2 frente a NVFP4).
- La evaluación de GPQA muestra respuestas cortadas por el límite de 64K tokens (17-19 de 33 por semilla en este checkpoint), lo que puede infraestimar la precisión real.
- El modelo tiende a generar cadenas de razonamiento largas con el modo thinking activado por defecto (esfuerzo xhigh), lo que incrementa el coste de inferencia y el riesgo de truncamiento.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.
- Restricciones de licencia: la licencia qwen-community-1.0 puede imponer condiciones para uso comercial; debe revisarse el archivo LICENSE del repositorio antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-10-27, por lo que no cuenta con validación comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3-qad
- Checkpoint base de las copias publicadas: https://huggingface.co/yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3
- Modelo base NVFP4: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Dataset de regeneración con thinking: https://huggingface.co/datasets/shadowpa0327/qwen3.8-flash-next-perfectblend-think
- NVIDIA ModelOpt: no disponible en la información proporcionada
- Paper o blog de Sharar: no disponible en la información proporcionada
- Repositorio del port SGLang: no disponible en la información proporcionada
