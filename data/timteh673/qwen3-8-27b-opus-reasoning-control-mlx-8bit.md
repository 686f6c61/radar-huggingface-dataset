# timteh673/Qwen3.8-27B-Opus-Reasoning-Control-MLX-8bit

## Resumen

El modelo `timteh673/Qwen3.8-27B-Opus-Reasoning-Control-MLX-8bit` es una versión de control (baseline comparator) de la familia de modelos de razonamiento multimodal Qwen3.8-27B, desarrollada por el autor independiente timteh673. Se trata de un checkpoint inmutable que sirve como referencia para comparar con el modelo "ganador" de la misma familia, al que se le aplicó la técnica de desalineación Abliterix (pass 1). Este control se publica con el objetivo de documentar de forma transparente las desviaciones medidas entre el modelo original entrenado con QLoRA y el modelo desalineado, sin presentar al ganador como universalmente superior.

El modelo está cuantizado en formato MLX affine de 8 bits (grupo de tamaño 64) y está optimizado para ejecutarse en Apple Silicon mediante la librería MLX. Incluye un drafter MTP (Multi-Token Prediction) nativo opcional. La arquitectura corresponde a `Qwen3_5ForConditionalGeneration`, con un stack de texto de 64 capas y un encoder de visión de 27 capas, lo que lo convierte en un modelo multimodal de imagen y texto. El contexto máximo configurado es de 262.144 tokens. La licencia es Apache-2.0, aunque el autor no publica los datos de entrenamiento privados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (texto + visión) |
| Parametros totales | 8.027.131.120 (según safetensors; el modelo base Qwen3.8-27B declara 27.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (máximo configurado) |
| Tipos de cuantizacion | MLX affine 8-bit (group size 64) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica en esta variante) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo está basado en el checkpoint oficial `Qwen/Qwen3.8-27B`, que según la información pública de Alibaba es un modelo denso multimodal de 27.8 mil millones de parámetros. Sin embargo, el archivo safetensors de este repositorio contiene 8.027.131.120 parámetros, una discrepancia que no se explica en la model card y que podría deberse a que se ha subido únicamente una parte de los pesos o a una conversión parcial. La arquitectura declarada en el config es un stack de texto de 64 capas con hidden size 5120, con un esquema de atención 3:1 lineal/completa, junto con un encoder de visión de 27 capas con hidden size 1152.

El proceso de entrenamiento consistió en aplicar QLoRA sobre el modelo base con 12.842 filas de datos de razonamiento (12.614 tras eliminar duplicados y filas inválidas). Se entrenaron 108.789.760 parámetros LoRA durante 1.544 pasos de optimización, alcanzando una pérdida de validación final de 0,23739749 y una precisión de token del 91,7594%. Tras fusionar el adaptador en BF16 para crear el `control-bf16` inmutable, se convirtió a MLX 8-bit. Este controlador no recibió ninguna edición de Abliterix, por lo que conserva el comportamiento de razonamiento original del modelo entrenado.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, entrenado específicamente con datos de razonamiento (12.842 filas de `opus-10000x`, `opus-3000x`, `reasoning-700x`, `high-reasoning-250x`).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), capaz de procesar imágenes junto con texto para tareas de comprensión visual.
- Soporte de decodificación MTP (Multi-Token Prediction) mediante un drafter nativo de una capa incluido en el repositorio (`mtp/`), que puede acelerar la generación en MLX.
- Ejecución optimizada para Apple Silicon a través de MLX, con cuantización affine de 8 bits.
- Capacidades de razonamiento largo (contexto hasta 262.144 tokens), útil para tareas que requieren mantener información durante secuencias extensas.

## Casos de uso

- **Evaluación de modelos de razonamiento**: como checkpoint de control, se puede usar en experimentos que comparen el rendimiento entre un modelo con desalineación (Abliterix) y el original, para medir el impacto en la capacidad de razonamiento y la seguridad.
- **Despliegue local en Apple Silicon**: al estar cuantizado en MLX 8-bit, puede ejecutarse en Macs con suficiente memoria unificada, permitiendo tareas de razonamiento multimodal sin conexión a la nube.
- **Razonamiento sobre documentos largos**: con 262.144 tokens de contexto, es adecuado para procesar documentos técnicos extensos, manuales o contratos, combinando texto e imágenes.
- **Análisis de imágenes con preguntas de razonamiento**: por ejemplo, responder preguntas sobre diagramas, gráficos o capturas de pantalla, apoyándose en la entrada visual.
- **Generación de código en entornos con restricciones de privacidad**: aunque el rendimiento en HumanEval es limitado (7,93%), puede usarse en flujos donde el código generado no se ejecuta automáticamente y se requiere una revisión humana posterior.
- **Investigación sobre alineación y seguridad**: como modelo de control, permite medir cuantitativamente los cambios en tasas de rechazo de contenido dañino y en la coherencia del modelo tras aplicar técnicas de desalineación.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks locales, auto-ejecutados por el autor y no oficiales de Qwen. Comparan el modelo de control (este) con el modelo ganador tras Abliterix:

| Métrica local | Control | Abliterix winner |
|---|---|---:|
| Rechazo duro de contenido dañino | 43.2% | 0.0% |
| Desvío suave de contenido dañino | 14.6% | 0.2% |
| Respuesta sustantiva a contenido dañino | 47.0% | 99.4% |
| Macro de capacidad | 17.6859% | 21.0086% |
| Código completo (421 casos) | 16/421 | 10/421 |
| HumanEval | 7.9268% | 4.2683% |
| Long-form pass | 54.1667% | 62.5000% |
| MMMU30 | 9/30 | 11/30 |
| Pérdida en datos held-out | 1.000000 | 1.024478 |
| KL benigna | 0.000000 | 0.093614 |

Estos valores no son benchmarks oficiales de Qwen y provienen de un harness local del autor. El control supera al modelo Abliterix en HumanEval y en código completo, pero es inferior en el resto de métricas.

## Requisitos de hardware

- **Memoria**: el modelo MLX 8-bit ocupa aproximadamente 29,5 GB (según el tamaño del repositorio), por lo que se requiere un Mac con al menos 32 GB de memoria unificada (por ejemplo, Apple M1 Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max).
- **GPU**: no requiere GPU NVIDIA; se ejecuta en el GPU integrado de Apple Silicon mediante Metal.
- **Opciones de despliegue**: mediante las librerías `mlx`, `mlx-lm` y `mlx-vlm` (versiones 0.32.0, 0.31.3 y 0.6.13 respectivamente, según el autor). También se puede usar el drafter MTP nativo para acelerar la generación.
- **Latencia y throughput**: no se proporcionan datos cuantitativos, pero el autor valida que la generación con y sin MTP produce el mismo resultado en una prueba específica (respuesta `323`). El rendimiento dependerá de la memoria y el modelo de chip.

## Comparativa con modelos similares

No se dispone de una comparativa exhaustiva con otros modelos de la misma categoría en la información proporcionada. El modelo más comparable es el propio `Qwen/Qwen3.8-27B` original (Apache-2.0), del que este checkpoint es una derivación cuantizada y entrenada con QLoRA. También existe el modelo `DreamFoundries/Qwen3.8-27B-8bit`, que es otra cuantización MLX 8-bit del mismo modelo base, pero sin el entrenamiento de razonamiento adicional. No se conocen datos de rendimiento comparativos entre estos dos.

## Limitaciones y advertencias

- **Sesgos y alineación**: este modelo de control no ha sido sometido a técnicas de desalineación, por lo que mantiene tasas altas de rechazo de contenido dañino (43.2% de rechazo duro). Esto puede ser limitante en aplicaciones que requieran respuestas más directas, pero es una característica intencional del controlador.
- **Riesgo de alucinación**: no se han evaluado formalmente los niveles de alucinación en este modelo, aunque los datos de entrenamiento son limitados (12.614 filas) y podría presentar alucinaciones en dominios fuera de su distribución.
- **Limitaciones de idioma**: no se especifica qué idiomas soporta; el modelo base Qwen3.8 es multilingüe, pero esta variante no declara cobertura.
- **Restricciones de licencia**: la licencia es Apache-2.0, lo que permite uso comercial, pero el autor no publica los datos de entrenamiento privados (solo agrega cuentas y hashes), por lo que no se puede reproducir el entrenamiento.
- **Problemas en generación de código**: el modelo control generó 376 de 421 generaciones de código que alcanzaron el límite de 512 tokens, indicando una patología de terminación/extracto en la generación de código. Esto puede resultar en respuestas incompletas o truncadas en tareas de programación.
- **No es una versión oficial**: es un modelo personal del autor, no respaldado por Alibaba ni el equipo Qwen. No hay garantías de soporte ni actualizaciones.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/timteh673/Qwen3.8-27B-Opus-Reasoning-Control-MLX-8bit)
- [Modelo base Qwen3.8-27B en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Repositorio de AlibabaCloud para Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Página de QwenCloud para Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [Análisis técnico de Qwen3.8-27B](https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html)
