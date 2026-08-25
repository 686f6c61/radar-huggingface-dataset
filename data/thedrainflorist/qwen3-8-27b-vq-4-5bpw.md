# TheDrainFlorist/Qwen3.8-27B-VQ-4.5bpw

## Resumen

TheDrainFlorist/Qwen3.8-27B-VQ-4.5bpw es una cuantización vector-quantized (VQ) del modelo Qwen3.8-27B de Alibaba, diseñada específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El autor la presenta como una alternativa más compacta y fiel que las conversiones afines tradicionales: ocupa 14.45 GiB (0.50 GiB menos que una conversión affine de 4 bits) y, según sus mediciones, se acerca un 12% más al modelo bf16 original en términos de divergencia KL (40.3 millinats frente a 45.8). El modelo base, Qwen3.8-27B, es un transformer denso de 27B parámetros con capacidades multimodales (visión y texto), pero esta cuantización, aunque incluye el vision tower en el checkpoint, no lo carga en tiempo de ejecución con `mlx-lm`, por lo que en la práctica funciona solo como modelo de texto.

La relevancia de este artefacto radica en que permite ejecutar un modelo de 27B en equipos con 16 GB de RAM unificada, un umbral crítico para muchos Macs. El autor ha publicado mediciones detalladas de fidelidad (KL, top-1 agreement, perplexity) comparando su VQ con conversiones afines propias, aunque advierte que no ha realizado benchmarks de rendimiento ni de tareas. El repositorio incluye el runtime VQ embebido en el checkpoint (`model.py`), por lo que funciona con `mlx-lm` sin parches adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con vision encoder (base Qwen3.8-27B) + cuantización VQ en MLP |
| Parametros totales | 19.371.838.704 (según safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | VQ 4.5 bpw nominal (4.25 bits/peso en superficie cuantizada, 8-bit en el resto) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado desde cero, sino una cuantización del checkpoint bf16 de Qwen3.8-27B. El modelo base es un transformer causal con 64 capas y un encoder de visión integrado, construido sobre la arquitectura de Qwen3.5. La cuantización aplica vector quantization a los tres tensores del MLP (dense MLP trio) con una geometría uniforme: cada subvector de 2 pesos se codifica con un índice de 8 bits en un codebook fp16 de 256 entradas por tensor, más una escala fp16 por cada (fila, 64 pesos). Esto resulta en 4.25 bits por peso en la superficie cuantizada; el resto de tensores del modelo se mantienen en 8 bits.

Los codebooks se ajustan mediante k-means en el espacio de pesos, sin usar Hessian, estadísticas de activación ni corpus de calibración. El ajuste no está seedeado, por lo que el artefacto es reproducible en receta y geometría pero no bit a bit; el autor cita un suelo de 2.085 millinats de variación entre ajustes. No hubo entrenamiento adicional ni fine-tuning: la cuantización es puramente post-hoc.

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización del modelo base, conserva las capacidades lingüísticas de Qwen3.8-27B, incluyendo razonamiento paso a paso y comprensión de instrucciones complejas.
- Soporte de tool calling / function calling: no se menciona explícitamente en la documentación del artefacto, pero el modelo base Qwen3.8-27B lo incorpora; no hay garantía de que la cuantización lo preserve íntegramente.
- Capacidades de agente: el modelo base destaca en benchmarks de agente (puesto #6 en la categoría Agentic según BenchLM), pero no hay mediciones específicas para esta cuantización.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero esta versión solo declara inglés en sus metadatos; el comportamiento en otros idiomas no está verificado.
- Visión: el checkpoint incluye el vision tower (0.859 GiB, 333 tensores), pero `mlx-lm` no lo carga, por lo que en la práctica el modelo funciona solo como texto. No se puede usar para entrada de imágenes o vídeo con el runtime estándar.

## Casos de uso

- Asistente local de productividad en Mac: con 13.6 GiB de memoria residente, puede ejecutarse en un Mac de 16 GB para redactar correos, resumir documentos y mantener conversaciones multi-turno sin conexión.
- Generación de código en entornos de desarrollo: el modelo base tiene buen rendimiento en tareas de programación; esta cuantización permite usarlo en un portátil con Apple Silicon para autocompletar o explicar fragmentos de código, aunque sin mediciones específicas de calidad.
- Prototipado de aplicaciones de IA en local: al ser compatible con `mlx-lm`, se integra fácilmente en pipelines de Python para experimentar con generación de texto, clasificación o extracción de información sin depender de APIs externas.
- Educación e investigación: sirve como banco de pruebas para estudiar el impacto de la cuantización VQ en la fidelidad del modelo, ya que el autor publica métricas detalladas de KL y agreement frente al bf16.
- Despliegue en entornos con restricción de memoria: su tamaño de 14.45 GiB en disco y 13.6 GiB en RAM lo hace viable en hardware con 16 GB, donde otras cuantizaciones de 4 bits no cabrían.
- Automatización de tareas de texto en segundo plano: por su baja huella, puede ejecutarse como servicio local para procesar lotes de texto, extraer entidades o generar respuestas plantilla en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para esta cuantización. El autor solo proporciona métricas de fidelidad frente al modelo bf16 original, medidas sobre el mismo corpus con `mlx-lm` sin modificar. La siguiente tabla resume esos datos, incluyendo las conversiones afines propias del autor como comparación:

| Build | Tamaño | KL a bf16 (mnats/tok) | Top-1 agreement | Perplexity |
|---|---|---|---|---|
| affine q2 (propia) | 8.69 GiB | 1426.9 | 46.1% | 16.435 |
| affine q3 (propia) | 11.82 GiB | 187.8 | 79.5% | 5.832 |
| **Este modelo (VQ 4.5)** | **14.45 GiB** | **40.3** | **90.1%** | 5.233 |
| affine q4 (propia) | 14.95 GiB | 45.8 | 89.8% | 5.206 |
| affine q6 (propia) | 21.21 GiB | 3.71 | 96.8% | 5.260 |
| affine q8 (propia) | 27.48 GiB | 1.25 | 98.5% | 5.241 |
| bf16 (profesor) | 51.7 GiB | 0 | 100% | — |

El autor advierte que la perplexidad apenas varía entre builds de 3 bits en adelante (5.19–5.35), por lo que recomienda rankear por KL, que mide directamente la divergencia con la distribución del profesor. No hay datos de latencia ni throughput para este artefacto.

## Requisitos de hardware

- VRAM estimada: 13.6 GiB de memoria residente (el tamaño en disco menos el vision tower, que `mlx-lm` no carga).
- GPU recomendadas: cualquier Apple Silicon con al menos 16 GB de RAM unificada (M1/M2/M3/M4 en sus variantes con 16 GB o más). No es compatible con GPU NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (pip install mlx-lm) con el comando `python -m mlx_lm generate`. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no medidos por el autor; no se dispone de cifras.

## Comparativa con modelos similares

La comparación más directa es con otras cuantizaciones del mismo modelo base. El autor compara su VQ con conversiones afines propias (no comunitarias), ya que no existían builds MLX publicados de Qwen3.8-27B en el momento del lanzamiento. Frente a la affine q4 (la más cercana en tamaño), el VQ es 0.50 GiB más pequeño y un 12% más cercano al bf16 en KL, con 0.3 puntos más de top-1 agreement. Frente a la affine q6, que es 6.76 GiB más grande, el VQ pierde claramente en fidelidad (40.3 vs 3.71 millinats), lo que indica que el VQ deja de ser ventajoso por encima de ~5 bits por peso.

No se dispone de comparaciones con cuantizaciones GGUF de otros proveedores (p. ej., unsloth) porque no hay datos públicos de rendimiento de esas builds en tareas estándar.

## Limitaciones y advertencias

- Sin mediciones de rendimiento: no hay benchmarks de tareas ni de throughput para este artefacto; las únicas métricas son de fidelidad frente al bf16.
- Comparadores propios: las conversiones afines usadas como referencia son del propio autor, no artefactos de terceros, lo que debilita la evidencia comparativa.
- Perplexity poco discriminante: en esta familia de modelos, la perplexity no permite rankear builds; hay que usar KL.
- Límite de la técnica: por encima de ~5 bits por peso, la cuantización afín supera a la VQ en este modelo; el autor detiene su colección deliberadamente por debajo de ese umbral.
- Sin soporte de visión en la práctica: aunque el checkpoint incluye el vision tower, `mlx-lm` no lo carga, por lo que no se puede usar para entrada de imágenes o vídeo.
- Idioma limitado: solo se declara inglés; el comportamiento en otros idiomas no está verificado.
- Reproducibilidad no bit a bit: el ajuste de codebooks no está seedeado, por lo que dos builds del mismo proceso pueden diferir ligeramente.
- Riesgo de alucinación y sesgos: no se han evaluado específicamente para esta cuantización; se heredan los del modelo base, que no están documentados en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.8-27B-VQ-4.5bpw
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía local de Qwen3.8-27B (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Perfil de benchmarks de Qwen3.8-27B (BenchLM): https://benchlm.ai/models/qwen3-8-27b
- Cuantización GGUF de unsloth (referencia alternativa): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
