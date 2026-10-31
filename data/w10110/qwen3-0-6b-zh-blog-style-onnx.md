# w10110/qwen3-0.6b-zh-blog-style-onnx

## Resumen

Qwen3-0.6B Blog Style ONNX es un microajuste experimental del modelo Qwen3-0.6B de Alibaba (Qwen), publicado por el usuario w10110 en Hugging Face. El objetivo del fine-tuning es reproducir el estilo de escritura de un autor concreto en chino para generar contenido de blog: el modelo se entrenó con 45 muestras aprobadas por el autor mediante LoRA, cuyos pesos ya están fusionados en el modelo base. La plantilla de chat desactiva por defecto el modo de pensamiento (thinking mode) de Qwen3.

La relevancia de esta ficha no está tanto en el modelo en sí (un LLM de 0,6 mil millones de parámetros) como en su formato de despliegue: los pesos se exportan a ONNX con dos variantes cuantizadas (q8 para WASM y q4f16 para WebGPU), lo que permite ejecutar la generación de texto directamente en el navegador con Transformers.js 3.8.1, sin servidor de inferencia. El diseño contempla además que los hechos del blog provengan de un contexto de recuperación estático independiente, no de la memoria del modelo.

Se trata explícitamente de una versión experimental de muestra pequeña: el propio autor advierte de posible sobreajuste, desviaciones numéricas respecto al modelo PyTorch original y errores observados en la generación (interpretaciones erróneas de JavaScript, rechazos inapropiados y repeticiones con q4f16). No es apto para producción como fuente de respuestas técnicas fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (causal), heredado de Qwen3-0.6B |
| Parametros totales | 0,6 mil millones (base); no disponible el recuento exacto tras fusionar LoRA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (la serie Qwen3-0.6B soporta 32.768 tokens de forma nativa) |
| Tipos de cuantizacion | q8 (ONNX, `model_quantized.onnx`) y q4f16 (ONNX, `model_q4f16.onnx`) |
| Idiomas soportados | Chino (zh); ajustado específicamente para estilo de blog en chino |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (no se distribuyen safetensors ni GGUF en este repositorio); el corpus de entrenamiento no se publica |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer causal denso de la familia Qwen3 que incluye atención agrupada de consultas (GQA) y soporte opcional de razonamiento extendido (thinking mode), desactivado aquí por defecto en la plantilla de chat. Sobre esta base se aplicó LoRA con rango r=16, alpha=32 y dropout 0,05, entrenando 3 épocas con tasa de aprendizaje 0,0001, longitud máxima de secuencia de 1024 tokens y semilla aleatoria 42. El entrenamiento constó de solo 9 pasos de optimización.

El corpus de entrenamiento son 45 muestras de estilo de blog en chino, revisadas y aprobadas por el autor, divididas sin cruce de fuentes en 34 de entrenamiento, 3 de validación y 8 de prueba. La mejor pérdida de validación fue 3,0917 y la de prueba 3,0935. El commit base utilizado es `c1899de289a04d12100db370d81485cdf75e47ca`.

Un punto técnico importante: la verificación de alineación entre el exportador FP16 (PyTorch CUDA) y ONNX Runtime CPU reporta diferencias de logits por encima de la tolerancia de 0,02 (diferencia absoluta máxima de aproximadamente 1,55), por lo que el repositorio no garantiza equivalencia numérica con el modelo PyTorch original. La validación realizada incluye tres prompts chinos con decodificación por caché en ONNX Runtime CPU y una verificación de generación en navegador con WASM/q8 y WebGPU/q4f16 mediante Transformers.js 3.8.1.

## Capacidades

- Generación de texto conversacional en chino con estilo de blog imitado a partir de 45 muestras del autor.
- Ejecución íntegra en el navegador: WASM (cuantización q8) y WebGPU (cuantización q4f16) vía Transformers.js.
- Modo de pensamiento de Qwen3 desactivado por defecto en la plantilla de chat (respuestas directas).
- Hereda las capacidades generales de Qwen3-0.6B (razonamiento básico, código, matemáticas a nivel de modelo pequeño), aunque el autor no garantiza que no hayan degradado tras el fine-tuning.
- Diseñado para funcionar junto a un contexto de recuperación estático que aporta los hechos del blog; el modelo no memoriza el contenido factual.
- No hay soporte documentado de tool calling, agentes, visión ni audio en esta variante.

## Casos de uso

- Generación de borradores de blog en el navegador: un sitio estático puede cargar el modelo vía Transformers.js y redactar entradas con la voz del autor sin enviar datos a ningún servidor, útil para privacidad y coste cero de inferencia.
- Asistente de escritura personal offline: integración en un editor web (por ejemplo, un CMS ligero) que sugiera párrafos en el estilo del autor mientras escribe, con latencia aceptable gracias a la cuantización q4f16 en WebGPU.
- Demostraciones interactivas de LLM en cliente: por su tamaño (1,4 GB el repositorio, ~cientos de MB el archivo q4f16) es adecuado para ejemplos embebidos en documentación o portfolios que ejecuten el modelo en el dispositivo del visitante.
- Prototipado de RAG ligero en cliente: combinando el modelo con un índice de recuperación estático (como hace el propio autor) para responder sobre el contenido de un blog personal sin backend.
- Experimentación con fine-tuning LoRA de muestra pequeña: sirve como referencia reproducible (semilla, hiperparámetros y splits documentados) para quien quiera replicar un ajuste de estilo con muy pocos datos.
- Pruebas de compatibilidad ONNX Runtime: comparación de comportamiento entre ejecución CPU (ONNX Runtime) y navegador (WASM/WebGPU), útil para validar pipelines de exportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos cuantitativos publicados son las pérdidas de entrenamiento: validación 3,0917 y prueba 3,0935. El autor indica además que la evaluación de calidad de estilo (A/B ciego) no está completada y que no se ha demostrado la ausencia de degradación en capacidades generales.

## Requisitos de hardware

- Repositorio completo: 1,4 GB; los archivos individuales ONNX cuantizados son sustancialmente menores (no se publican tamaños exactos por archivo).
- Ejecución en navegador: no requiere GPU dedicada; WASM/q8 funciona en CPU del cliente y q4f16 aprovecha WebGPU en navegadores compatibles (Chrome/Edge recientes, entre otros).
- Ejecución en servidor o local con ONNX Runtime CPU: viable en hardware de escritorio convencional dado el tamaño de 0,6B de parámetros; una GPU de consumo tipo RTX 3060 o superior sería más que suficiente si se desea acelerar.
- Despliegue: Transformers.js 3.8.1 (vía WASM o WebGPU) y ONNX Runtime (CPU). No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, ya que los pesos solo se distribuyen en ONNX.
- Latencia y throughput: no disponibles; al ser un modelo de 0,6B con cuantización agresiva, se espera generación interactiva en navegador, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B Blog Style ONNX (este) | 0,6B | ONNX (q8, q4f16) | No disponible | Apache 2.0 | Fine-tuning de estilo en chino, ejecución en navegador |
| Qwen/Qwen3-0.6B (base) | 0,6B | Safetensors | 32.768 tokens | Apache 2.0 | Modelo base multilingüe, sin ajuste de estilo |
| SmolLM2-360M / SmolLM2-1.7B (HuggingFace) | 0,36B / 1,7B | Safetensors, ONNX | 8.192 tokens | Apache 2.0 | Alternativa ligera para inferencia en navegador, sin ajuste de estilo específico |

## Limitaciones y advertencias

- Riesgo elevado de sobreajuste: solo 45 muestras y 9 pasos de optimización; la evaluación A/B ciega de estilo no se ha completado.
- Errores observados en generación: interpretaciones erróneas de código JavaScript, rechazos inapropiados y respuestas repetitivas con la variante q4f16. No debe usarse como fuente de respuestas técnicas fiables.
- Desviación numérica respecto al modelo PyTorch original: el exportador FP16 presenta diferencias de logits de hasta ~1,55 frente a la tolerancia de 0,02, sin garantía de equivalencia.
- Alcance limitado al chino: el ajuste está orientado a estilo de blog en chino; el comportamiento en otros idiomas no está evaluado.
- Los hechos generados no son fiables: el diseño asume que la factualidad proviene de un sistema de recuperación externo, no del propio modelo; existe riesgo habitual de alucinación.
- Sin datos de benchmark ni garantía de que las capacidades generales del modelo base se hayan conservado.
- La licencia Apache 2.0 es permisiva, pero el autor recuerda que quien despliegue el modelo es responsable de evaluar el contenido generado y los riesgos de exposición pública.
- El corpus de entrenamiento no se publica, lo que impide auditar la procedencia y los sesgos de los datos de estilo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/w10110/qwen3-0.6b-zh-blog-style-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Transformers.js: https://huggingface.co/docs/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
