# ysober/qwen3.8-27b-dspark-zh

## Resumen

`ysober/qwen3.8-27b-dspark-zh` es un modelo de borrador (draft model) de 1,36 mil millones de parámetros diseñado para acelerar la inferencia del modelo objetivo Qwen/Qwen3.8-27B-FP8 mediante decodificación especulativa con el algoritmo DSpark. Se trata de un ajuste fino (finetune) del modelo de borrador de referencia RadixArk/Qwen3.8-27B-DSpark, realizado por el autor ysober con el objetivo de mejorar la tasa de aceptación de tokens en chino, que era el punto débil del borrador original.

El modelo es relevante porque la decodificación especulativa reduce la latencia de generación del modelo objetivo (27B en FP8) sin modificar sus pesos: el drafter de 1,36B genera hipótesis de tokens que el modelo grande valida en paralelo. La contribución de este finetune es específica: con 185.368 muestras chino-inglés reentrenadas sobre el borrador base, se logra una mejora de +10,68% en la longitud de aceptación china medida en conjuntos de datos públicos independientes (C-Eval, AGIEval, Chinese-SimpleQA, alpaca-gpt4-data-zh) y +4,26% en inglés, sin degradar el rendimiento en ninguno de los diez benchmarks ingleses evaluados.

El modelo mantiene exactamente la misma arquitectura, número de parámetros y tamaño de pesos que el borrador base, por lo que es compatible con la misma configuración de despliegue en SGLang y no requiere cambios en el modelo objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas, atención completa (full attention), GQA (40 query heads, 8 key/value heads) |
| Parametros totales | 1.359.284.737 (1,36B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 (máxima posición de codificación) |
| Tipos de cuantizacion | BF16 (pesos del drafter, sin cuantizar) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | other (no especificada; hereda condiciones del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter de 1,36B con 5 capas Transformer de atención completa y GQA, con dimensión oculta de 5.120. Su función es producir bloques de 7 tokens candidatos (con un ancho de validación de 8, incluyendo el bonus token del modelo objetivo) para el algoritmo DSpark de decodificación especulativa. Incluye un head de confianza Markov de rango 256 y está alineado con las capas auxiliares 4, 16, 28, 40 y 52 del modelo objetivo Qwen3.8-27B-FP8.

El entrenamiento consistió en un re-finetune del borrador base RadixArk/Qwen3.8-27B-DSpark con 185.368 muestras de datos mixtos chino-inglés (76,5% chino, 23,5% inglés), distribuidos en tareas de RAG (24,4%), reasoning (20,0%), escritura (17,2%), resumen (16,3%), chat (15,7%) y codificación (6,5%). No se empleó RLHF ni DPO; es un ajuste supervisado directo sobre el drafter. La arquitectura, el número de parámetros y el volumen de pesos son idénticos al borrador base, por lo que los parámetros de ejecución de SGLang (tamaño de bloque DSpark, estrategia de scheduler, backend de atención) no cambian respecto al modelo original.

## Capacidades

- **Aceleración de inferencia especulativa**: actúa como modelo de borrador para el objetivo Qwen3.8-27B-FP8, generando bloques de tokens candidatos que el modelo grande valida en paralelo, reduciendo la latencia de decodificación.
- **Optimización para chino**: mejora la tasa de aceptación de tokens en chino en +10,7% sobre el borrador base, lo que se traduce en una mayor velocidad efectiva de generación para consultas en ese idioma.
- **Compatibilidad con SGLang**: funciona con el algoritmo DSpark de SGLang (versión 0.5.18 en las evaluaciones), con parámetros de lanzamiento idénticos al borrador base.
- **Sin degradación en inglés**: mantiene e incluso mejora la aceptación en inglés (+4,3% de media en 10 benchmarks) tras el reentrenamiento en chino.
- **No es un modelo de generación autónoma**: no está pensado para generar texto final por sí solo; su rol es exclusivamente el de drafter dentro de un pipeline de decodificación especulativa.

## Casos de uso

- **Despliegue de Qwen3.8-27B-FP8 en producción con baja latencia**: el uso principal es servir el modelo grande de 27B con decodificación especulativa, especialmente en entornos donde la latencia de generación es crítica (chatbots, asistentes de código, automatización de oficina). El drafter se integra en SGLang con el flag `--speculative-algorithm DSPARK` y `--speculative-draft-model-path`.
- **Aplicaciones centradas en chino**: para servicios que atienden a usuarios en chino (atención al cliente, generación de contenidos, resúmenes de documentos), la mejora de aceptación en ese idioma reduce el tiempo de respuesta percibido.
- **Sistemas de RAG en chino**: el drafter muestra una mejora significativa en tareas de RAG (+54,6% en el conjunto de evaluación de entrenamiento), lo que beneficia a aplicaciones de recuperación y generación de respuestas en ese idioma.
- **Entornos de razonamiento y matemáticas**: las mejoras en razonamiento (+7,78%) y matemáticas (GSM8K +7,78%, MATH-500 +4,77%) hacen que el modelo sea adecuado para pipelines de agentes que requieren razonamiento multi-paso.
- **Generación de código**: las evaluaciones muestran mejoras en HumanEval (+2,37%) y MBPP (+6,12%), por lo que es adecuado para asistentes de programación que usan el modelo objetivo.
- **Inferencia en hardware modesto**: al ser un drafter de 1,36B, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3090 o RTX 4090) junto con el modelo objetivo cuantizado, permitiendo desplegar un sistema de 27B con rendimiento razonable en un solo nodo.

## Benchmarks y rendimiento

Los resultados se miden como **longitud de aceptación de tokens** (número de tokens del drafter que el modelo objetivo acepta por paso de verificación), no como precisión de tarea. Cuanto mayor, menor latencia efectiva de decodificación. Las evaluaciones se realizaron con el mismo framework, misma máquina y mismas configuraciones para ambos modelos (FP8 objetivo, drafter BF16, bloque DSpark 7, temperatura 0.6, top-k 20, top-p 0.95, thinking activado, `max_new_tokens=2048`, seed 0, atención backend fa3, SGLang 0.5.18).

**Conjuntos de datos públicos independientes (512 prompts, no presentes en el entrenamiento):**

| Benchmark | RadixArk/Qwen3.8-27B-DSpark | ysober/qwen3.8-27b-dspark-zh | Δ |
|---|---|---|---|
| zh_alpaca_gpt4 | 2.4871 | 2.9118 | +17,08% |
| zh_ceval | 2.5989 | 2.8135 | +8,26% |
| zh_gaokao_math | 3.7834 | 4.0422 | +6,84% |
| zh_simpleqa | 2.3245 | 2.6223 | +12,81% |
| **Promedio chino** | **2.7985** | **3.0975** | **+10,68%** |

**Benchmarks en inglés (1.036 prompts, 10 conjuntos, mismas condiciones):**

| Benchmark | RadixArk (medido) | ysober/qwen3.8-27b-dspark-zh | Δ |
|---|---|---|---|
| HumanEval | 3.8672 | 3.9588 | +2,37% |
| GSM8K | 4.5737 | 4.9296 | +7,78% |
| MATH-500 | 4.0616 | 4.2552 | +4,77% |
| MBPP | 3.4037 | 3.6119 | +6,12% |
| AIME 2025 | 3.3279 | 3.3958 | +2,04% |
| AIME 2026 | 3.1264 | 3.2750 | +4,75% |
| LBPP | 3.0467 | 3.1021 | +1,82% |
| MT-Bench | 3.1489 | 3.2510 | +3,24% |
| Arena-Hard v0.1 | 2.8056 | 2.9251 | +4,26% |
| Alpaca | 3.0672 | 3.1928 | +4,09% |
| **Promedio** | **3.4429** | **3.5897** | **+4,26%** |

El autor también reporta mejoras en un conjunto de entrenamiento de retención (696 prompts, mismo distribución): +23,77% promedio, con destaque en RAG (+54,6%) y resumen (+33,18%), aunque estos resultados están sesgados por la similitud con los datos de entrenamiento.

## Requisitos de hardware

- **Drafter (este modelo)**: 1,36B parámetros en BF16, aproximadamente 2,7 GB de VRAM. Se ejecuta en cualquier GPU con al menos 4 GB de VRAM disponible.
- **Modelo objetivo (Qwen3.8-27B-FP8)**: 27B parámetros en FP8, requiere al menos 16-24 GB de VRAM según cuantización. Con el drafter y la sobrecarga de KV cache, se recomienda una GPU con 24-32 GB.
- **GPUs compatibles**: RTX 4090 (24 GB) puede ejecutar el sistema completo en FP8; RTX 5090 (32 GB) es la opción recomendada en la comunidad para este stack (hay un repositorio específico para Blackwell). GPUs de datacenter como A100 (40-80 GB) o H100 (80 GB) son ideales para producción con alta concurrencia.
- **Opciones de despliegue**: SGLang (versión 0.5.18 o superior) con el algoritmo DSPARK; no está diseñado para usarse con llama.cpp u Ollama (no se ha reportado compatibilidad). El lanzamiento requiere los flags `--speculative-algorithm DSPARK`, `--speculative-draft-model-path <ruta-al-modelo>`, `--speculative-dspark-block-size 7` y `--speculative-draft-model-quantization unquant`.
- **Latencia**: no se proporcionan valores absolutos de tokens/segundo; las métricas de aceptación (2.8-3.1 tokens por paso en chino, 3.4-3.6 en inglés) indican que el drafter produce bloques de tokens que el modelo objetivo acepta en promedio entre 3 y 4 tokens por validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rol | Mejora de aceptación (chino) | Licencia |
|---|---|---|---|---|---|
| **ysober/qwen3.8-27b-dspark-zh** | 1,36B | 262.144 | Drafter DSpark para Qwen3.8-27B-FP8 | +10,7% sobre el base | other |
| RadixArk/Qwen3.8-27B-DSpark | 1,36B | 262.144 | Drafter DSpark base (sin optimización china) | Línea base | other |
| Qwen/Qwen3.8-27B-FP8 | 27B | 262.144 | Modelo objetivo (no drafter) | No aplica | Apache 2.0 (probable) |

No se dispone de otros modelos de borrador comparables para el mismo objetivo con DSpark; la comparación principal es con el drafter base del que deriva. La diferencia es el ajuste fino en chino, que mejora la aceptación sin perjudicar el inglés.

## Limitaciones y advertencias

- **No es un modelo de generación autónomo**: no debe usarse para generar texto final; solo funciona como drafter en un pipeline de decodificación especulativa con SGLang y el modelo objetivo Qwen3.8-27B-FP8.
- **Licencia no especificada**: la licencia es "other", no se detalla en la model card. Antes de usar comercialmente, hay que verificar los términos del modelo base (Qwen3.8-27B-FP8 y RadixArk/Qwen3.8-27B-DSpark) y las condiciones de redistribución.
- **Dependencia de SGLang**: el modelo solo está integrado con el algoritmo DSpark de SGLang; no es compatible con otros frameworks de inferencia especulativa sin desarrollo adicional.
- **Riesgo de sobreajuste en chino**: las mejoras en el conjunto de retención (mismo distribución) son muy superiores a las de los datasets independientes (+23,8% vs +10,7%), lo que sugiere que parte de la ganancia se debe a la familiaridad con el estilo de datos del entrenamiento.
- **Evaluación limitada**: no se reportan métricas de calidad de generación del modelo objetivo (solo de aceptación de tokens); el rendimiento real en tareas finales depende del modelo objetivo, no de este drafter.
- **Potencial de alucinación**: al ser un componente de optimización, no se evalúa la calidad semántica de sus salidas; el riesgo de alucinación reside en el modelo objetivo, no en este drafter.
- **Idiomas**: optimizado para chino e inglés; el rendimiento en otros idiomas no está evaluado y puede degradar la tasa de aceptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ysober/qwen3.8-27b-dspark-zh
- Modelo base (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo objetivo (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de despliegue con RTX 5090 (Blackwell + DSpark): https://github.com/darksidewalker/qwen3.8-27b-sglang-dspark-blackwell
- Página de QwenCloud del modelo: https://www.qwencloud.com/models/qwen3.8-27b
- Dataset de evaluación chino (ysober/zh_spec_eval): https://huggingface.co/datasets/ysober/zh_spec_eval
