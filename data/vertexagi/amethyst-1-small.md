# VertexAGI/amethyst-1-small

## Resumen

Amethyst 1 Small es un modelo de lenguaje conversacional y de seguimiento de instrucciones en inglés, desarrollado por VertexAIco como parte de un proyecto de investigación independiente. Se trata de un fine-tuning con LoRA sobre el modelo base Llama 3.1 8B Instruct, utilizando el mismo conjunto de datos destilado que su predecesor Amethyst 1 Mini (basado en Gemma 3 4B), pero con un modelo base más grande. El objetivo del proyecto es validar un pipeline de destilación, fine-tuning y evaluación en hardware de consumo.

El modelo se libera en cuantización de 4 bits mediante la librería MLX, pensado para ejecutarse en Apple Silicon. Con 1.254.952.960 parámetros según los safetensors (el adaptador LoRA fusionado sobre la base de 8B), hereda la arquitectura transformer decoder-only de Llama 3.1 y su ventana de contexto de 128k tokens, aunque el fine-tuning se realizó con secuencias de 4096 tokens. Es una segunda generación temprana de la familia Amethyst, orientada a experimentación e investigación, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 8B Instruct (transformer denso, decoder-only) |
| Parametros totales | 1.254.952.960 (adaptador LoRA fusionado; el modelo base tiene ~8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens (heredada de Llama 3.1 8B Instruct; fine-tuning con secuencias de 4096) |
| Tipos de cuantizacion | 4-bit (MLX, misma cuantizacion que el checkpoint base) |
| Idiomas soportados | Ingles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Amethyst 1 Small parte del checkpoint cuantizado a 4 bits `mlx-community/Meta-Llama-3.1-8B-Instruct-4bit` y aplica un fine-tuning supervisado mediante LoRA con rango 8, escala 20.0 y dropout 0.0. Se entrenaron los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en 16 de las capas del modelo. El entrenamiento se realizó con el optimizador Adam (tasa de aprendizaje 1e-5, programación constante), secuencias de 4096 tokens y gradient checkpointing, en dos pasadas debido a una interrupción por reinicio de la máquina local; el checkpoint liberado es el que presentó la menor pérdida de validación observada (1.487), ya que los checkpoints posteriores oscilaban en torno a un suelo de ruido.

El conjunto de datos de entrenamiento consta de 1.122 pares instrucción-respuesta (1.082 de entrenamiento y 40 de validación), generados sintéticamente mediante destilación de conocimiento del modelo `nvidia/nemotron-3-super-120b-a12b` (un MoE de 120B parámetros, ~12B activos) a través de la API de OpenRouter. Los datos abarcan explicaciones, razonamiento, código, extracción, planificación, roleplay, escritura creativa, traducción, clasificación de sentimiento y brainstorming.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés.
- Razonamiento y explicaciones sobre temas variados, limitados por el pequeño tamaño del dataset de entrenamiento.
- Generación de código básico y resolución de problemas de programación sencillos.
- Extracción de información y planificación de tareas.
- Escritura creativa y roleplay.
- Traducción entre idiomas (aunque el entrenamiento es solo en inglés, el modelo base Llama 3.1 8B Instruct tiene capacidades multilingües que pueden persistir parcialmente).
- Clasificación de sentimiento y brainstorming.
- No se especifica soporte para tool calling ni function calling; el modelo base lo soporta, pero no se ha verificado en este fine-tuning.
- Sin modo de pensamiento explícito ni capacidades multimodales (solo texto).

## Casos de uso

- Asistente conversacional para investigación: el modelo puede utilizarse en entornos de laboratorio para probar pipelines de destilación y fine-tuning, gracias a su pequeño tamaño y bajo coste de inferencia en Apple Silicon.
- Generación de explicaciones educativas: dado su entrenamiento en explicaciones y razonamiento, puede servir para crear contenido didáctico sencillo en inglés, aunque con supervisión humana.
- Prototipado rápido de chatbots: al ser ligero y ejecutable en hardware de consumo, es adecuado para prototipos de atención al cliente o asistentes virtuales con requisitos básicos.
- Experimentación con cuantización 4-bit en MLX: desarrolladores que quieran evaluar el rendimiento de modelos destilados cuantizados en Apple Silicon pueden usarlo como referencia.
- Clasificación de sentimiento en textos cortos: el dataset incluye esta tarea, por lo que puede aplicarse a análisis de opiniones o reseñas en inglés.
- Generación de código auxiliar en entornos de desarrollo local: para tareas de autocompletado o sugerencias simples, siempre que se validen los resultados.
- Traducción informal entre idiomas: aunque el entrenamiento es monolingüe, el base multilingüe puede ofrecer traducciones básicas; no recomendado para uso profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica la pérdida de validación (1.487) durante el entrenamiento, sin comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado en 4 bits, un modelo de 8B requiere aproximadamente 4,5 GB de memoria para los pesos, más overhead de activaciones, por lo que se estima un consumo total de 5-6 GB en cargas de trabajo típicas.
- GPU recomendadas: al usar MLX, está diseñado para Apple Silicon (M1/M2/M3/M4 con memoria unificada). No está pensado para CUDA directamente, aunque los safetensors podrían convertirse a otros formatos (GGUF, etc.) para ejecutarse en GPUs NVIDIA con herramientas como llama.cpp o vLLM.
- En consumer GPU: cabe en GPUs con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) si se convierte a un formato compatible, pero la distribución oficial solo incluye MLX.
- Opciones de despliegue: MLX (librería `mlx-lm`), conversión a GGUF para llama.cpp/Ollama, o a safetensors estándar para TGI/vLLM.
- Latencia y throughput: no se han publicado datos. En Apple Silicon, un modelo de 8B en 4-bit puede generar decenas de tokens por segundo en chips M2/M3, dependiendo de la memoria y la carga.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amethyst 1 Small | Llama 3.1 8B Instruct | ~8B (LoRA) | 128k | 4-bit MLX | Llama 3.1 | Hugging Face |
| Amethyst 1 Mini | Gemma 3 4B IT | ~4B | no disponible | 4-bit MLX | Gemma (probablemente) | Hugging Face |
| Llama 3.1 8B Instruct | - | 8B | 128k | FP16, 4-bit, etc. | Llama 3.1 | Hugging Face |

La comparativa directa con Amethyst 1 Mini es relevante porque comparten dataset y metodología; la diferencia principal es el tamaño del modelo base (4B vs 8B). Frente a Llama 3.1 8B Instruct original, Amethyst 1 Small es un fine-tuning específico con un dataset muy reducido (1.122 ejemplos), por lo que su rendimiento general será inferior, aunque mantiene la arquitectura y el contexto.

## Limitaciones y advertencias

- Entrenado con un dataset muy pequeño (1.122 ejemplos) y sintético, sin revisión humana exhaustiva; el comportamiento puede ser inconsistente fuera de las categorías representadas.
- Destilado de un único modelo profesor (Nemotron-3-Super-120B-A12B) sin validación externa de cada ejemplo.
- Hereda las limitaciones y el corte de conocimiento del modelo base Llama 3.1 8B Instruct (septiembre de 2024).
- Solo admite inglés de forma fiable; otros idiomas pueden degradarse.
- No está diseñado para uso en producción ni en contextos de alto riesgo (salud, finanzas, legal).
- La licencia Llama 3.1 Community License impone restricciones de uso comercial para empresas con más de 700 millones de usuarios mensuales, y requiere atribución.
- Al estar liberado solo en cuantización 4-bit MLX, puede haber pérdida de precisión frente a versiones de mayor precisión; no se ha publicado una versión dequantizada.
- No se han verificado capacidades de tool calling ni funciones de agente en este fine-tuning, a pesar de que el base las soporta.

## Enlaces

- [Hugging Face: VertexAIco/amethyst-1-small](https://huggingface.co/VertexAIco/amethyst-1-small)
- [Hugging Face: VertexAIco/amethyst-1-mini](https://huggingface.co/VertexAIco/amethyst-1-mini)
- [Modelo base: meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Checkpoint base cuantizado: mlx-community/Meta-Llama-3.1-8B-Instruct-4bit](https://huggingface.co/mlx-community/Meta-Llama-3.1-8B-Instruct-4bit)
- [Licencia Llama 3.1 Community License](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE)
