# timteh673/Qwen3.8-27B-Opus-Reasoning-Control-BF16

## Resumen

El modelo `Qwen3.8-27B-Opus-Reasoning-Control-BF16` es un checkpoint de control de línea base, creado por el usuario `timteh673`, que forma parte de una familia de modelos destinada a la investigación práctica de razonamiento y visión-lenguaje con menor rechazo reflexivo. Este modelo concreto representa la versión **inmutable del control entrenado**, es decir, el resultado de fusionar un adaptador QLoRA de razonamiento sobre el modelo base `Qwen/Qwen3.8-27B` sin aplicar ninguna técnica de desablación (Abliterix). Su propósito es servir como comparador directo frente al modelo ganador de la familia, que sí ha sido sometido a Abliterix, permitiendo evaluar dónde el control supera al modelo modificado y viceversa.

Se trata de un modelo multimodal (imagen y texto) con arquitectura `Qwen3_5ForConditionalGeneration`, 27.356 millones de parámetros y una ventana de contexto de 262.144 tokens. Está publicado bajo licencia Apache-2.0, en formato `safetensors` con precisión BF16. Es relevante para investigadores que necesiten un punto de referencia fiable y reproducible para medir el impacto de técnicas de control de comportamiento sobre modelos de razonamiento y visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con vision encoder) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | BF16 (no se proporcionan otras cuantizaciones para esta variante) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen3.8-27B`, un modelo de lenguaje grande multimodal con una pila de texto de 64 capas, tamaño oculto de 5120 y un esquema de atención lineal/full 3:1. Incluye además un encoder de visión de 27 capas con tamaño oculto de 1152. La configuración registra un rango máximo de posición de 262.144 tokens, lo que permite manejar secuencias muy largas.

El proceso de entrenamiento consistió en preparar 12.842 filas de datos de razonamiento (etiquetadas como `opus-10000x`, `opus-3000x`, `reasoning-700x` y `high-reasoning-250x`). Tras eliminar 208 duplicados y 20 filas inválidas, se quedaron 12.614 filas, divididas en 12.349 para entrenamiento, 127 de validación y 138 de test. Se entrenó un adaptador QLoRA con 108.789.760 parámetros entrenables durante 1.544 pasos de optimización, obteniendo una pérdida final de validación de 0.23739749 y una precisión de token del 91,7594%. Posteriormente se fusionó el adaptador en el modelo base y se guardó como BF16. Este checkpoint de control no recibió ninguna edición de Abliterix, conservando los 1.199 tensores originales, incluidos los 15 tensores MTP (multi-token prediction) y 333 tensores de visión.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen + texto) gracias al encoder de visión integrado.
- Razonamiento avanzado con ventana de contexto de 262.144 tokens, adecuada para tareas de largo alcance.
- Soporte de predicción multi-token (MTP) mediante un drafter nativo de una capa, que puede acelerar la generación.
- Capacidades de razonamiento de código y matemáticas, aunque con resultados moderados (ver benchmarks).
- Modelo de control para comparar el efecto de técnicas de ablación de comportamiento.
- No se ha documentado soporte explícito de tool calling o function calling en la información proporcionada.

## Casos de uso

- **Evaluación de técnicas de control de modelos**: como línea base de referencia, permite medir el impacto real de Abliterix o métodos similares sobre el comportamiento, comparando métricas de rechazo y capacidad.
- **Investigación en seguridad y alineación**: útil para estudiar la relación entre la reducción de rechazos y la degradación de capacidades en modelos de razonamiento.
- **Razonamiento multimodal con contexto largo**: puede procesar documentos extensos con imágenes, diagramas y texto, útil para tareas de análisis de informes técnicos o científicos.
- **Comparación de generación de código**: su rendimiento en HumanEval (7,93%) y full code (16/421) sirve como referencia para evaluar si técnicas de ablación mejoran o empeoran la capacidad de programación.
- **Investigación en reducción de alucinaciones**: al ser un control sin ediciones, permite medir la pérdida de información (held-out loss) y la divergencia KL respecto al modelo modificado.
- **Pruebas de robustez en entornos de larga duración**: su ventana de 262K tokens permite simular tareas de agentes de largo alcance donde se necesita mantener contexto extenso.

## Benchmarks y rendimiento

El autor publica resultados locales congelados, comparando este control con el modelo ganador (Abliterix pass 1). No se trata de benchmarks oficiales de Qwen.

| Métrica | Control (este modelo) | Abliterix winner |
|---|---|---|
| Harmful hard refusal | 43,2% | 0,0% |
| Harmful soft deflection | 14,6% | 0,2% |
| Harmful substantive response | 47,0% | 99,4% |
| Capability macro | 17,6859% | 21,0086% |
| Full code (pass@1) | 16/421 | 10/421 |
| HumanEval | 7,9268% | 4,2683% |
| Long-form pass | 54,1667% | 62,5000% |
| MMMU30 | 9/30 | 11/30 |
| Held-out loss ratio | 1,000000 | 1,024478 |
| Benign KL | 0,000000 | 0,093614 |

Estos resultados muestran que el control supera al modelo Abliterix en código y HumanEval, mientras que el ganador mejora en capacidad general y reduce drásticamente los rechazos. No hay benchmarks oficiales comparativos con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: un modelo de 27.356 millones de parámetros en BF16 requiere aproximadamente 55 GB de VRAM solo para los pesos (el repositorio ocupa 55,6 GB). Con la ventana de contexto de 262.144 tokens, la memoria para las cachés KV puede superar los 40 GB adicionales en secuencias largas.
- **GPU recomendadas**: se necesitan GPU profesionales con 80 GB o más, como A100 80GB, H100 80GB o H200. En consumer no es viable.
- **Opciones de despliegue**: compatible con `transformers`, `vLLM`, `TGI` y `llama.cpp` (si se convierte a GGUF). No se especifican configuraciones de latencia o throughput en la información disponible.
- **Alternativas de menor consumo**: se podría cuantizar a 8 bits o 4 bits, pero el autor no proporciona dichas variantes para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (HumanEval) | Notas |
|---|---|---|---|---|---|
| `Qwen3.8-27B` (base) | 27B | 262K | Apache-2.0 | No disponible | Modelo original sin entrenamiento adicional |
| `Qwen3.8-27B-Opus-Reasoning-Control-BF16` (este) | 27B | 262K | Apache-2.0 | 7,93% (local) | Control entrenado con QLoRA |
| `Qwen3.8-27B-Opus-Reasoning-Abliterix-BF16` | 27B | 262K | Apache-2.0 | 4,27% (local) | Modelo ganador con Abliterix |

No se dispone de datos de otros modelos de 27B comparables en la información facilitada.

## Limitaciones y advertencias

- **Modelo de control, no de producción**: está diseñado como comparador de investigación, no como modelo final para aplicaciones comerciales.
- **Sesgos y comportamiento**: mantiene un alto índice de rechazo duro (43,2%) ante prompts dañinos, lo que puede limitar su utilidad en aplicaciones que requieran respuestas directas.
- **Riesgo de alucinación**: no se reportan métricas específicas de alucinación, pero al ser un modelo de razonamiento puede generar respuestas incorrectas en dominios especializados.
- **Datos de entrenamiento privados**: el autor no publica los datos crudos ni los conjuntos de prompts, lo que dificulta la reproducibilidad completa.
- **Licencia**: Apache-2.0 permite uso comercial, pero al estar basado en Qwen3.8-27B, se deben respetar los términos de la licencia del modelo base.
- **Restricciones de contexto**: aunque la ventana es de 262K, el rendimiento en secuencias muy largas no se ha validado en benchmarks oficiales.
- **MTP nativo**: el tensor MTP está presente, pero su funcionamiento correcto solo se ha verificado en la prueba local de MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timteh673/Qwen3.8-27B-Opus-Reasoning-Control-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de benchmarks no oficiales: https://benchlm.ai/models/qwen3-8-27b
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
