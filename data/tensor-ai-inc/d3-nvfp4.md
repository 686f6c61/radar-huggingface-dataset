# tensor-ai-inc/d3-NVFP4

## Resumen
d3-NVFP4 es una versión cuantizada en NVFP4 de vllm-sr/d3, un modelo de la familia Decision 3.0 que el autor describe como de 26B y que ha sido cuantizado por tensor-ai-inc. No es un modelo conversacional general: su interfaz principal es System One, que recibe un estado y un conjunto de preguntas estructuradas —elección entre opciones, sí/no y puntuaciones— y devuelve decisiones clasificadas. El pipeline declarado es zero-shot-classification.

La relevancia está en ejecutar un modelo de decisión grande con pesos de 4 bits en GPU Blackwell, que soportan FP4 de forma nativa. El repositorio ocupa 25,2 GB frente a 52,2 GB del original, una reducción del 52 %, y conserva el 98,8 % de respuestas idénticas en una muestra de 1.000 peticiones del Decision Index público 0.3. La puntuación baja de 65,48 a 63,12 en esa muestra.

El checkpoint real de safetensors declara 16.690.089.200 parámetros (16,69 B), no 26B; la model card no aclara la discrepancia. La licencia es Apache-2.0 y requiere una build nightly de vLLM. No hay datos publicados de longitud de contexto, idiomas soportados, sesgos ni latencia en Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión con capas de atención completa y atención lineal, codificador de visión y readout de decisión; tag qwen3_5. La topología completa no se detalla. |
| Parámetros totales | 16.690.089.200 (16,69 B) según safetensors; la model card indica 26B, discrepancia sin aclarar. |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE. |
| Longitud de contexto | No disponible. |
| Tipos de cuantización | NVFP4: valores FP4, escalas FP8 por cada 16 valores y una escala FP32 por tensor. El repositorio incluye el tag 8-bit. No se documentan GGUF, AWQ, GPTQ ni INT8. |
| Idiomas soportados | No disponible. |
| Licencia | Apache-2.0. |
| Formato de pesos | safetensors con custom_code; requiere vLLM nightly. |

## Arquitectura y entrenamiento
d3-NVFP4 no se reentrena: es una cuantización del checkpoint vllm-sr/d3. La receta de Model Optimizer 0.47.0 cuantiza las capas MLP y de atención completa en NVFP4, mientras deja intactas las capas de atención lineal, los embeddings, el codificador de visión y el readout de decisión. Por eso la reducción de tamaño es del 52 % y no la teórica de 4 bits. La calibración se hizo con 256 prompts de UltraChat y preguntas genéricas de elección, sí/no y puntuación, sin datos de benchmarks. La revisión de origen es `cf15549a78fc52598ddd1951f321c58372bbd64f`.

La arquitectura original se describe con atención completa y atención lineal, codificador de visión y readout de decisión, y el tag qwen3_5. No hay información sobre número de tokens de entrenamiento, composición del dataset original, RLHF/DPO ni innovaciones de decodificación. Los detalles de entrenamiento del modelo base no están disponibles en la información proporcionada.

##
