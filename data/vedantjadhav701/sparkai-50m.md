# vedantjadhav701/SparkAI-50M

## Resumen

SparkAI-50M es un modelo de lenguaje causal experimental de aproximadamente 50 millones de parámetros, desarrollado por Vedant Jadhav (estudiante de IA y ML en la Pimpri Chinchwad University, Pune). Utiliza una arquitectura híbrida que combina Mamba-2 y Grouped Query Attention (GQA), con RoPE, RMSNorm y SwiGLU. El modelo se entrenó desde cero sobre el dataset HuggingFaceFW/fineweb-edu (configuración sample-10BT) con 299,9 millones de tokens en inglés, en una NVIDIA A100 de 80 GB durante 0,72 horas.

La relevancia de este modelo es principalmente educativa y experimental: demuestra cómo entrenar un modelo de lenguaje pequeño con una arquitectura híbrida de estado (SSM) y atención, y sirve como base para estudiar el comportamiento de estas arquitecturas en escalas reducidas. No está pensado como asistente generalista ni para producción, sino como una prueba de concepto de entrenamiento eficiente. El contexto máximo es de 2048 tokens y el tokenizador tiene un vocabulario de 32 000 entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + GQA (Grouped Query Attention) con RoPE, RMSNorm y SwiGLU |
| Parametros totales | ~68,0 millones (el autor lo denomina ~50M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No especificado (pesos en FP32 según el repositorio) |
| Idiomas soportados | Inglés (solo entrenado para causal language modeling en inglés) |
| Licencia | Apache-2.0 (según metadatos de Hugging Face; la model card no lo indica) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo combina capas de Mamba-2 (un modelo de espacio de estados con selección de entrada) con capas de atención de grupo (GQA), lo que reduce el coste de memoria de la atención al compartir claves y valores entre cabezas. Usa RoPE (Rotary Positional Embedding) para codificar posiciones, RMSNorm para normalización y SwiGLU como función de activación en las capas feed-forward. El tokenizador tiene un vocabulario de 32 000 entradas.

El entrenamiento se realizó sobre el dataset FineWeb-Edu (muestra de 10 mil millones de tokens, de la cual se usaron 299,9 millones) durante 0,72 horas en una A100 de 80 GB, alcanzando una velocidad de 115 575 tokens por segundo y un pico de memoria de 15,2 GB. No se aplicó ajuste por instrucciones (instruction tuning) ni RLHF/DPO. El modelo es puramente de modelado de lenguaje causal.

## Capacidades

- Generación de texto en inglés de carácter causal, sin ajuste por instrucciones.
- Razonamiento básico limitado por su tamaño y contexto corto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No tiene capacidades multimodales (visión, audio, etc.).
- No incluye modo de pensamiento (thinking mode).
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- **Educación e investigación en arquitecturas híbridas**: el modelo sirve como ejemplo didáctico para estudiar cómo se comporta una arquitectura Mamba-2 + GQA en una escala pequeña, permitiendo analizar la pérdida de validación y la perplejidad sin grandes costes de cómputo.
- **Prototipado de pipelines de entrenamiento**: al entrenarse en menos de una hora en una A100, es útil para validar configuraciones de entrenamiento (datasets, hiperparámetros, estrategias de mezcla) antes de escalar a modelos más grandes.
- **Generación de texto simple en inglés**: puede generar texto coherente a corto plazo (pocas frases) en tareas como completar oraciones o escribir párrafos cortos, aunque con riesgo de repetición o incoherencia.
- **Base para fine-tuning en tareas específicas**: al ser un modelo causal pequeño, puede ajustarse en dominios concretos (por ejemplo, clasificación de texto o generación de snippets) si el contexto de 2048 tokens es suficiente.
- **Comparación de técnicas de cuantización**: su pequeño tamaño permite probar diferentes métodos de cuantización (GPTQ, GGUF, etc.) y medir su impacto en perplejidad y latencia con hardware muy modesto.
- **Estudio de la relación entre tokens de entrenamiento y rendimiento**: con solo 299,9 millones de tokens, es útil para investigar curvas de escalado y el efecto de la cantidad de datos en modelos de este rango de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados por el autor son:

| Metrica | Valor |
|---|---|
| Loss de validación | 4,4280 |
| Perplejidad | 83,76 |
| Tokens de entrenamiento | 299,9 millones |
| Tokens por segundo | 115 575 |
| Tiempo de entrenamiento | 0,72 horas |
| Pico de memoria GPU | 15,20 GB |

## Requisitos de hardware

- **VRAM estimada para inferencia**: con ~68 millones de parámetros en FP32, el peso ocupa aproximadamente 272 MB. En cuantización FP16 o BF16 se reduce a ~136 MB; en cuantizaciones de 4 bits (GPTQ/AWQ) podría bajar a ~68 MB.
- **GPUs recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). Para entrenamiento, se usó una A100 de 80 GB, pero con un presupuesto de 15 GB de pico se podría entrenar en GPUs con 16-24 GB (RTX 3090, RTX 4090, A5000).
- **Cabe en consumer GPU**: sí, en prácticamente cualquier GPU consumer moderna.
- **Opciones de despliegue**: se puede usar con llama.cpp (si se convierten los pesos a GGUF), vLLM, Hugging Face Transformers, o directamente con los pesos safetensors en PyTorch.
- **Latencia y throughput**: no se proporcionan datos de latencia de inferencia. Dado el tamaño, se espera una latencia muy baja (del orden de milisegundos por token en CPU/GPU) y throughput alto en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (por ejemplo, SmolLM-135M, TinyLlama-1.1B o Pythia-70M). No se han publicado resultados de benchmarks estándar que permitan comparar directamente. La comparativa queda pendiente de que el autor publique métricas de evaluación adicionales.

## Limitaciones y advertencias

- **Modelo experimental**: no está ajustado por instrucciones (instruction tuned), por lo que no funciona como asistente conversacional general.
- **Riesgo de alucinación**: alto, especialmente en temas de conocimiento factual, debido a su pequeño tamaño y a los pocos tokens de entrenamiento.
- **Repetición e incoherencia**: puede generar texto repetitivo, incoherente o gramaticalmente incorrecto en secuencias largas.
- **Contexto limitado**: solo 2048 tokens, lo que restringe su uso en tareas que requieren contexto largo.
- **Idioma**: entrenado únicamente en inglés, no soporta otros idiomas.
- **Licencia**: aunque los metadatos indican Apache-2.0, la model card no especifica la licencia explícitamente; se recomienda verificar antes de uso comercial.
- **Producción**: no recomendado para entornos de producción reales; es un experimento académico.

## Enlaces

- [Hugging Face - SparkAI-50M](https://huggingface.co/vedantjadhav701/SparkAI-50M)
- [Hugging Face - SparkAI-50M-Instruct (variante)](https://huggingface.co/vedantjadhav701/SparkAI-50M-Instruct)
- [GitHub - VedantJadhav701](https://github.com/VedantJadhav701/VedantJadhav701)
- [Perfil de GitHub del autor](https://github.com/VedantJadhav701/)
