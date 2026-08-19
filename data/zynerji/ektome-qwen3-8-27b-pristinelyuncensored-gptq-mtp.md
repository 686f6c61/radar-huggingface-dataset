# Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP

## Resumen

Ektome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP es una versión modificada del modelo Qwen3.8-27B de Alibaba, desarrollada por Zynerji mediante la técnica Ektomē (del griego ἐκτομή, "escisión"). Esta técnica consiste en una cirugía de pesos que elimina la dirección de rechazo (refusal direction) del modelo sin realizar ningún entrenamiento ni fine-tuning, logrando un comportamiento "pristinely uncensored" (sin censura) mientras se preservan las capacidades originales. El modelo resultante se ha cuantizado a 4 bits con GPTQ (Marlin) y conserva el head MTP (multi-token prediction) intacto.

El modelo está pensado para desarrolladores e investigadores que necesitan un LLM sin restricciones de contenido para tareas como generación creativa, investigación de seguridad o análisis de datos, con la ventaja de un rendimiento medido y documentado. Requiere vLLM o SGLang para su ejecución, ya que `transformers` no puede cargarlo debido a la exclusión de ciertas proyecciones DeltaNet en la cuantización. Con 27.781 millones de parámetros y un peso de 17,7 GiB, cabe en GPUs de 24 GB con margen para la caché KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (DeltaNet) y head MTP; multimodal (texto e imagen) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ 4-bit (Marlin); tensores excluidos en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ cuantizado + bf16 para módulos excluidos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con atención lineal DeltaNet en lugar de atención softmax estándar, lo que reduce el coste computacional en secuencias largas. Incluye una torre de visión para entrada de imágenes y un head MTP (multi-token prediction) que permite decodificación especulativa. La modificación Ektomē consiste en leer la dirección de rechazo de las activaciones del modelo y eliminarla quirúrgicamente mediante matrices de escritura residual, sin entrenamiento. Se excisaron 128 matrices en el decodificador de lenguaje, dejando intactos el head MTP y la torre de visión. Posteriormente, el modelo se cuantizó a 4 bits con GPTQ (Marlin), excluyendo las proyecciones `linear_attn.in_proj_a` y `in_proj_b` (de dimensiones `[48, 5120]`) por no cumplir el requisito de Marlin `out_features % 64 == 0`, manteniéndolas en bf16 (0,095% de los parámetros del decodificador).

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imágenes (entrada texto-imagen) con la torre de visión intacta, verificada con pruebas sintéticas (4/4 correctas).
- Decodificación especulativa mediante head MTP, que acelera la generación hasta un 63% en tareas de código.
- Comportamiento sin censura: 99 de 100 prompts dañinos cumplidos en la versión cuantizada (medido sobre los pesos de 4 bits).
- Soporte de tool calling y agentes no documentado explícitamente en la model card; se asume heredado del modelo base, pero no se ha verificado.
- Capacidades multilingües no especificadas.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, poesía o guiones que aborden temas tabú o políticamente sensibles sin evasivas, gracias a la eliminación de la dirección de rechazo.
- Investigación en seguridad de IA: útil para estudiar comportamientos de modelos sin censura, evaluar riesgos de alucinación o diseñar contramedidas, dado que el proceso de abliteración está documentado y medido.
- Asistencia en programación con alta velocidad: con el head MTP activado, alcanza 433,6 tok/s en tareas de código profundo (4 tareas × 1024 tokens), ideal para pipelines de generación de código en producción.
- Análisis de datos y razonamiento complejo: con MMLU-val de 0,8025 en 4 bits, puede abordar tareas de razonamiento lógico y matemático, aunque con una ligera pérdida respecto al padre bf16.
- Procesamiento de documentos con imágenes: al mantener la torre de visión, puede interpretar gráficos, diagramas o capturas de pantalla combinados con texto, por ejemplo en automatización de informes.
- Despliegue de chatbots sin filtros en entornos controlados: para aplicaciones donde se requiere una respuesta directa sin restricciones de contenido, siempre que se cumplan las políticas de uso responsable.

## Benchmarks y rendimiento

Los resultados se midieron sobre los pesos cuantizados de 4 bits, no sobre el padre bf16, a diferencia de la mayoría de modelos abliterados en el Hub.

| Métrica | bf16 padre | Este build 4-bit | Delta |
|---|---|---|---|
| Cumplimiento de rechazo (n=100) | 1.000 | 0.990 | −0.010 |
| MMLU-val (n=400) | 0.8175 | 0.8025 | −0.015 (dentro del error estándar 0.0195) |
| Visión (imagen sintética) | — | PASSED 4/4 | — |

Rendimiento de inferencia en RTX PRO 6000 Blackwell (sm_120), vLLM 0.27.1, 128 tokens nuevos, mediana de 3 ejecuciones:

| Batch | Sin MTP (tok/s) | Con MTP (tok/s) | Ganancia |
|---|---|---|---|
| 1 | 75.7 | 102.5 | +35% |
| 8 | 531.8 | 691.8 | +30% |
| Código profundo (4×1024 tok) | 265.3 | 433.6 | +63% |

Los pesos ocupan 17,7 GiB, lo que permite ejecutarlo en una GPU de 24 GB con espacio para caché KV.

## Requisitos de hardware

- VRAM estimada: 17,7 GiB para pesos, más caché KV; cabe en una GPU de 24 GB (p. ej., RTX 4090, RTX A5000) con margen.
- GPU recomendadas: RTX PRO 6000 Blackwell (sm_120) para el rendimiento medido; otras arquitecturas pueden variar. Se requiere soporte de Marlin en vLLM o SGLang.
- No es compatible con `transformers` de HuggingFace; debe servirse con vLLM o SGLang.
- En Python 3.11, es necesario desinstalar `flashinfer-python` o usar Python 3.12+ para evitar errores de inicialización.
- Latencia y throughput: 72,6 tok/s (batch 1) y 512,1 tok/s (batch 8) sin MTP; con MTP, 102,5 y 691,8 tok/s respectivamente, en la GPU mencionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | MMLU-val | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ektome-Qwen3.8-27B (este) | 27.8B | GPTQ 4-bit | No disp. | 0.8025 | Apache-2.0 | Abliterado, sin censura, MTP |
| Qwen3.8-27B (bf16 padre) | 27.8B | bf16 | No disp. | 0.8175 | Apache-2.0 | Modelo base, con censura |
| Qwen3.5-9B (nf4, línea similar) | 9B | NF4 | No disp. | ~0.79 (estimado) | Apache-2.0 | Mencionado en la card; pérdida de ~2.5 puntos MMLU |

No se dispone de datos de otros modelos abliterados comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido dañino, ilegal o éticamente problemático. Su uso debe limitarse a entornos controlados y fines legítimos de investigación o creación responsable.
- No compatible con `transformers`: solo vLLM o SGLang pueden cargarlo; los usuarios que dependan de la pila estándar de HuggingFace no podrán utilizarlo.
- El head MTP no está cuantizado (permanece en bf16, ~849 MB), lo que aumenta ligeramente el uso de VRAM; cuantizarlo no es recomendable por posible degradación de la tasa de aceptación.
- Los resultados de rendimiento se midieron en sm_120 (RTX PRO 6000 Blackwell) y no se transfieren directamente a otras arquitecturas de GPU.
- En pruebas de decodificación especulativa, las salidas greedy con y sin MTP no fueron byte-idénticas en una tarea de código; se considera un comportamiento no explicado, no una mejora de calidad.
- La cuantización 4-bit degrada ligeramente MMLU (−0.015, dentro del error estándar), pero la pérdida es estadísticamente indistinguible del padre.
- Riesgo de alucinación y sesgos no evaluados en esta versión; no se proporcionan datos sobre sesgos demográficos o lingüísticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (referencia; no se ha verificado la URL exacta)
- Documentación de vLLM para MTP: no disponible en la información proporcionada.
- Repositorio de GPTQModel: no disponible en la información proporcionada.
