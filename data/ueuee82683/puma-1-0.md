# Ueuee82683/Puma-1.0

## Resumen

Puma 1.0 es un modelo de lenguaje causal de 200.573.952 parámetros entrenado desde inicialización aleatoria por el autor independiente Ueuee82683. Emplea una arquitectura decoder estándar de tipo Llama (`LlamaForCausalLM`) con pre-normalización, 16 capas, dimensión oculta 1024 y atención con query agrupadas (GQA) en proporción 4:1 (16 cabezas de query, 4 de key/value). Su vocabulario es un BPE byte-level propio de 32.000 tokens con embeddings de entrada y salida atados. Al respetar el layout de pesos y la convención de embeddings rotatorios de `transformers`, se carga directamente con `AutoModelForCausalLM` sin código de modelado a medida ni `trust_remote_code`.

El modelo está orientado a asistencia local ligera, generación de texto breve y síntesis introductoria de código Python. Su interés práctico no reside en la capacidad de conocimiento general —muy limitada por el tamaño y por el volumen de entrenamiento— sino en la huella de despliegue: 382,6 MiB en FP16 y aproximadamente 101,8 MiB en INT4, lo que permite ejecución en CPU, en Raspberry Pi 5 y en dispositivos móviles vía GGUF y `llama.cpp`, sin GPU dedicada.

Es relevante ahora como caso de estudio de un pipeline completo de entrenamiento en tres fases (pretraining general, pretraining de código con replay y SFT con pérdida calculada solo en turnos del asistente) ejecutado íntegramente en hardware NVIDIA T4, y como base para ajuste fino de tareas específicas. Conviene señalar que el modelo se publicó en octubre de 2026 con 0 descargas y 0 «likes», sin resultados de benchmarks estándar publicados y con un presupuesto de entrenamiento muy reducido (23,59 millones de tokens en pretraining), por lo que su calidad real en uso general no está validada por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (decoder transformer con pre-normalización) |
| Parámetros totales | 200.573.952 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (máximo de posiciones RoPE) |
| Tipos de cuantización | FP16 (safetensors), Q8_0 (GGUF), INT4 / Q4_0 con `group_size=64`, Q4_K_M (GGUF) |
| Idiomas soportados | inglés (`en`); no se declara soporte de castellano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) y GGUF |
| Capas (`num_hidden_layers`) | 16 |
| Dimensión oculta (`hidden_size`) | 1.024 |
| Dimensión intermedia (`intermediate_size`) | 2.560 (SwiGLU, activación `silu`) |
| Cabezas de atención | 16 query / 4 key-value (`head_dim = 64`, GQA 4:1) |
| Embeddings posicionales | RoPE (θ = 10.000,0; máx. 2.048 posiciones) |
| Normalización | `RMSNorm` (ε = 1e-5) |
| Vocabulario | 32.000 (BPE byte-level, embeddings entrada/salida atados) |
| Tamaño del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 23 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso convencional con pre-normalización RMSNorm y MLP SwiGLU, sin innovaciones de atención (no hay atención lineal, SSM ni decodificación especulativa). La única decisión de eficiencia destacable es el uso de GQA con 4 cabezas KV para 16 cabezas de query, lo que reduce el KV-cache y facilita la inferencia en memoria ajustada. El tokenizador es propio (32.000 tokens, BPE byte-level) en lugar de reutilizar el de Llama, lo que implica que los tokens no son intercambiables con modelos de la familia Llama a pesar del nombre de la arquitectura.

El entrenamiento se ejecutó desde cero en FP16 con precisión mixta sobre NVIDIA T4, en tres etapas: (1) pretraining general con 13,11 M tokens de `HuggingFaceFW/fineweb-edu` filtrado con `int_score >= 3` y decaimiento coseno de learning rate de 1,2e-3 a 1,2e-4; (2) continuación con 10,49 M tokens adicionales (23,59 M acumulados) mezclando `codeparrot/codeparrot-clean`, `Magicoder-OSS-Instruct-75K` y `python-codes-25k` con un 20 % de replay de FineWeb-Edu y learning rate de 6,0e-4 a 6,0e-5; (3) SFT con 4,59 M tokens empaquetados, provenientes de 10.211 conversaciones y ejemplos de Python 3 verificados con `ast.parse()` (`SmolTalk`, `Alpaca-Cleaned`, `python_code_instructions_18k`, `python-codes-25k`, `Magicoder`), empaquetados en 4.096 secuencias de 512 tokens con la pérdida calculada estrictamente sobre los turnos del asistente.

El dato técnico más importante para evaluar el modelo es el presupuesto de cómputo: 23,59 M tokens de pretraining para 200,57 M parámetros equivale a aproximadamente 0,12 tokens por parámetro, dos órdenes de magnitud por debajo del óptimo de Chinchilla (≈20 tokens/parámetro). El autor reporta que la perplejidad de validación en FineWeb-Edu bajó de 38.952,6 a 280,1 y la de Python de 170,7 a 10,7, y que la perplejidad de validación de SFT pasó de 36,4 a 11,2.

## Capacidades

- Generación de texto breve en inglés: respuestas a preguntas cotidianas, explicaciones cortas, resúmenes simples y generación de listas estructuradas.
- Síntesis de código Python: genera funciones y utilidades de Python 3 sintácticamente válidas, presentadas en bloques Markdown con vallas de código.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`), con rol de sistema soportado en el formato mostrado en la model card.
- Ajuste fino posterior: al ser un modelo de 200 M de parámetros, permite ajuste fino de todos los parámetros o con LoRA en una GPU de consumo de 8–16 GB.
- Multilingüismo: no disponible. El modelo declara únicamente inglés y su corpus de entrenamiento es mayoritariamente anglófono (`FineWeb-Edu`).
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas ni de formato de llamadas a funciones.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el tamaño y el volumen de entrenamiento no permiten anticipar un comportamiento fiable en cadenas de razonamiento largas.
- Modo «thinking», visión o audio: no disponible.

## Casos de uso

- **Asistente local sin conexión en escritorio**: ejecutado con `llama.cpp` u Ollama sobre el GGUF Q8_0 (≈205 MiB), sirve para responder preguntas cortas y generar listas en entornos sin red, con un consumo de RAM estimado en torno a 420 MB y sin GPU.
- **Asistente en dispositivos móviles**: convertido a GGUF Q8_0 o Q4_K_M (105–205 MB), cabe residente en terminales con Apple A15+, Snapdragon 8 Gen 1+ o Google Tensor y se carga en frontends de `llama.cpp` para Android/iOS o mediante `llama-cli` en Termux, íntegramente offline.
- **Autocompletado y generación de snippets Python en herramientas internas**: el modelo produce funciones Python 3 validadas durante el entrenamiento con `ast.parse()`, útil para prototipado rápido o para generar plantillas de código en un editor ligero donde no se quiere enviar código a la nube.
- **Clasificador o enrutador especializado tras ajuste fino**: con 200 M de parámetros, un ajuste fino completo o LoRA sobre una GPU de 8–16 GB permite convertirlo en un clasificador de intenciones o un router de consultas dentro de un pipeline mayor, con coste de inferencia mínimo.
- **Micro-modelo de dominio para entornos embebidos**: sobre Raspberry Pi 5 o VMs de nube con 1–2 GB de RAM, el checkpoint INT4 (101,8 MiB, con un script NumPy sin PyTorch que carga en ≈0,2 s con menos de 600 MB de RSS) permite respuestas predefinidas o generación de texto muy acotada en dispositivos edge.
- **Base docente para reproducir un pipeline de entrenamiento**: las tres etapas documentadas (pretraining, continuación con replay y SFT con pérdida enmascarada) y el hardware T4 hacen del modelo un ejemplo reproducible para cursos o laboratorios sobre entrenamiento de LLM a pequeña escala.
- **Generación de texto de relleno en pruebas de integración**: su reducida huella y su licencia Apache 2.0 permiten usarlo como modelo simulado en tests de pipelines de `transformers`, TGI o endpoints compatibles sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la información disponible. La model card solo reporta métricas internas de validación (perplejidad y pérdida) durante el entrenamiento:

| Métrica (validación) | Antes | Después |
|---|---|---|
| Perplejidad FineWeb-Edu, etapa 1 | 38.952,6 (loss 10,5701) | 280,1 (loss 5,6350) |
| Perplejidad Python, etapa 2 | 170,7 (loss 5,1398) | 10,7 (loss 2,3713) |
| Perplejidad SFT, etapa 3 | 36,4 (loss 3,5954) | 11,2 (loss 2,4181) |

No hay comparación con modelos similares en la información proporcionada, ni datos de throughput, latencia o calidad en tareas downstream.

## Requisitos de hardware

- **VRAM/RAM para inferencia (según la model card)**: FP16 ≈ 850 MB de RAM en ejecución (382,6 MiB en disco); Q8_0 ≈ 420 MB (≈205 MiB en disco); INT4 `group_size=64`/Q4_0 < 500 MB (101,8 MiB en disco).
- **GPU recomendadas**: el autor cita NVIDIA T4 como hardware de entrenamiento; para inferencia no se requieren GPU dedicadas. Cabe en cualquier GPU de consumo con ≥2 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y RTX 4090, así como en Apple Silicon vía MPS/MLX y NPUs móviles.
- **Consumer GPU**: sí, en todas las gamas actuales; también en CPU x86_64/ARM64 sin GPU mediante `llama.cpp`, ONNX Runtime o PyTorch CPU.
- **Opciones de despliegue**: `transformers` (`AutoModelForCausalLM`), `llama.cpp` (GGUF, incluido `llama-cli`), Text Generation Inference (la model card etiqueta `text-generation-inference` y `endpoints_compatible`), ONNX Runtime, PyTorch CPU, frontends móviles de `llama.cpp` (PocketPal AI, ChatterUI, Maid) y un script propio NumPy INT4 (`puma_cpu_chat.py`) que no requiere PyTorch.
- **Latencia y throughput**: no disponibles. El único dato temporal reportado es el tiempo de carga del script NumPy INT4 (≈0,2 s) y el uso de RSS (< 600 MB), no la velocidad de generación.
- **Requisitos de ajuste fino**: ajuste fino completo o LoRA en una única GPU de consumo de 8–16 GB, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento publicado |
|---|---|---|---|---|---|
| Puma 1.0 | 200,57 M | 2.048 | Apache 2.0 | en | no disponible (sin benchmarks) |
| SmolLM-135M | ≈135 M | 2.048 | Apache 2.0 | en (principalmente) | no verificado en esta ficha |
| Qwen2.5-0.5B | ≈494 M | 32.768 | Apache 2.0 | multilingüe | no verificado en esta ficha |
| TinyLlama-1.1B | ≈1,1 B | 2.048 | Apache 2.0 | en | no verificado en esta ficha |

La comparación relevante es de escala y de despliegue: Puma 1.0 se sitúa entre los modelos sub-500 M ejecutables en móvil y CPU, con una licencia permisiva equiparable a la de las alternativas citadas, pero con un presupuesto de entrenamiento muy inferior (23,59 M tokens frente a los cientos de miles de millones de tokens habituales en esta categoría) y sin métricas públicas que permitan situarlo frente a ellas. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- **Conocimiento muy limitado**: 23,59 M tokens de pretraining para 200,57 M de parámetros (≈0,12 tokens/parámetro) están muy por debajo del régimen óptimo; es previsible un conocimiento factual mínimo y una alta tasa de error en preguntas enciclopédicas.
- **Riesgo elevado de alucinación**: al ser un modelo pequeño con SFT ligero (4,59 M tokens empaquetados), no hay garantía de fidelidad factual; requiere verificación humana en cualquier uso orientado a producción.
- **Idioma**: solo se declara inglés. El rendimiento en castellano no está evaluado y probablemente sea deficiente, dado el tokenizador byte-level y el corpus de entrenamiento anglófono.
- **Contexto corto**: 2.048 tokens máximo; insuficiente para documentos largos, conversaciones extensas o análisis de repositorios de código.
- **Ausencia de validación externa**: 0 descargas y 0 «likes» en el momento de la consulta, sin benchmarks de terceros, sin evaluaciones de seguridad y sin informes de red teaming.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; los corpus empleados (`FineWeb-Edu`, `codeparrot-clean`, `SmolTalk`, `Alpaca-Cleaned`) pueden introducir sesgos de género, culturales y de dominio (el código Python de GitHub está sesgado hacia patrones y estilos concretos).
- **Formato de chat frágil**: la plantilla de chat y el comportamiento multi-turno dependen del `chat_template` del tokenizador; no se documenta robustez ante prompts adversarios ni ante roles de sistema arbitrarios.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no se declaran restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- **Caveat de producción**: no se recomienda como componente único en flujos de atención al cliente o generación de código en producción sin una evaluación propia previa; su uso razonable es como micro-modelo especializado tras ajuste fino o como componente auxiliar de bajo coste.

## Enlaces

- HuggingFace: https://huggingface.co/Ueuee82683/Puma-1.0
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (paper, blog, repositorio o demo). Las consultas devolvieron únicamente contenido no relacionado (foros de videojuegos), por lo que no se listan.
- Dataset de pretraining citado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de código citado: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset de instrucciones de código citado: https://huggingface.co/datasets/Magicoder-OSS-Instruct-75K
- Dataset de código Python citado: https://huggingface.co/datasets/python-codes-25k
- Dataset de conversaciones citado: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de instrucciones citado: https://huggingface.co/datasets/python_code_instructions_18k_alpaca
- `llama.cpp` (runtime GGUF): https://github.com/ggml-org/llama.cpp
