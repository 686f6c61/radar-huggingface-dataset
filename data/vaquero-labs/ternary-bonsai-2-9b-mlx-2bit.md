# vaquero-labs/Ternary-Bonsai-2-9B-mlx-2bit

## Resumen

Ternary-Bonsai-2-9B-mlx-2bit es una versión cuantizada a pesos ternarios de Qwen3.5-9B, empaquetada específicamente para MLX sobre Apple Silicon. El modelo conserva la arquitectura original de su base (32 bloques, dimensión oculta 4096, atención híbrida con 24 capas de atención lineal y 8 de atención completa) pero sustituye los pesos del transformer lingüístico por valores ternarios {−1, 0, +1} almacenados en el formato afín de 2 bits de MLX con grupos de 128. El resultado ocupa 3,46 GB en disco frente a los aproximadamente 17,9 GB que requeriría el mismo modelo en FP16.

El modelo combina una torre de visión de unos 0,46B de parámetros, que se mantiene en FP16 sin rotar, con un modelo de lenguaje de unos 8,95B. La suma da 9.410.903.280 parámetros reales según los safetensors publicados. La rotación de Hadamard por bloques está plegada en los pesos almacenados, y el runtime incluido aplica la transformación equivalente sobre las activaciones en tiempo de inferencia. Esto permite decodificar exactamente los mismos valores ternarios que los empaquetados GGUF del mismo autor.

Es relevante porque demuestra que un modelo vision-language de clase 9B con 262K tokens de contexto puede ejecutarse en un dispositivo Apple Silicon con menos de 4 GB de pesos, manteniendo entrada de imagen y capacidades conversacionales. La licencia Apache 2.0 y la compatibilidad con mlx-vlm 0.7.8 o superior facilitan su integración en aplicaciones locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (24 capas lineales, 8 completas), 32 bloques, dimensión oculta 4096; torre de visión separada |
| Parámetros totales | 9.410.903.280 (≈8,95B lenguaje + ≈0,46B visión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3.5-9B) |
| Tipos de cuantización | Pesos ternarios {−1, 0, +1} en formato afín 2-bit de MLX, grupo 128; torre de visión en FP16; cabeza MTP opcional en 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); existen empaquetados GGUF del mismo autor para CUDA, CPU y llama.cpp |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.5-9B sin cambios en la arquitectura. Mantiene el esquema híbrido de atención del backbone original: 24 capas de atención lineal combinadas con 8 capas de atención completa, lo que reduce el coste computacional del contexto largo frente a un transformer de atención completa pura. La dimensión oculta es 4096 y el modelo consta de 32 bloques. La torre de visión se conserva íntegra en FP16 y se transporta sin la rotación de Hadamard aplicada al modelo de lenguaje.

La innovación principal es la cuantización ternaria con rotación de Hadamard por bloques plegada en los pesos. Cada grupo de 128 pesos almacena una escala y un sesgo, lo que permite reconstruir los valores ternarios exactos en tiempo de inferencia. El runtime aplica la transformación Hadamard correspondiente a las activaciones para mantener la coherencia matemática. El repositorio incluye además una cabeza de predicción multi-token (MTP) opcional en 4-bit, entrenada como drafter para decodificación especulativa, con verificación por parte del modelo principal. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Entrada de imagen (pipeline image-text-to-text) mediante la torre de visión oficial de Qwen3.5-9B.
- Modo thinking (por defecto) y modo no-thinking, configurables mediante `enable_thinking` en la plantilla de chat.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Decodificación especulativa opcional mediante la cabeza MTP incluida, útil en tareas de copia intensiva como edición de código o reescritura.
- Servidor compatible con OpenAI mediante `mlx_vlm.server`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en 3,46 GB de pesos y puede ejecutarse con mlx-vlm en Apple Silicon, permitiendo un chatbot privado sin conexión con contexto de hasta 262K tokens para conversaciones largas.
- Análisis de documentos con imágenes: gracias a la torre de visión y al contexto extendido, se puede usar para extraer información de capturas, diagramas o documentos escaneados junto con texto explicativo en una sola pasada.
- Edición y reescritura de código: la cabeza MTP acelera tareas de copia intensiva, y el modo thinking permite razonar sobre cambios en repositorios; adecuado para asistentes de programación en local.
- Procesamiento de informes extensos: con 262K tokens de contexto, se pueden cargar manuales o informes completos y formular preguntas sobre secciones específicas sin fragmentación.
- Prototipado de aplicaciones vision-language en dispositivos: el formato MLX y el servidor OpenAI-compatible permiten integrar el modelo en apps macOS o iOS mediante Metal sin infraestructura de GPU dedicada.
- Investigación sobre cuantización ternaria: sirve como referencia reproducible para estudiar el impacto de pesos ternarios con rotación Hadamard en modelos vision-language, comparando con los empaquetados GGUF del mismo autor.
- Despliegue de bajo consumo en portátiles: al ocupar menos de 4 GB, es viable en equipos con memoria unificada limitada, dejando espacio para el resto del sistema y otras aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 3,46 GB en disco; en memoria se requiere espacio adicional para activaciones, caché KV y la torre de visión en FP16. Con contexto largo, la caché KV crece proporcionalmente y puede superar varios GB.
- GPU recomendadas: Apple Silicon con Metal (series M1, M2, M3, M4 y superiores). No está pensado para CUDA ni CPU en este empaquetado; para esas plataformas el autor remite a los GGUF equivalentes.
- Cabe en GPU consumer: sí, en equipos Apple Silicon con memoria unificada suficiente (se recomienda al menos 16 GB para contexto largo).
- Opciones de despliegue: mlx-vlm 0.7.8 o superior (carga nativa con `model_type: prism_hadamard_qwen35`), servidor `mlx_vlm.server` compatible con OpenAI, o el loader incluido en `runtime/` para versiones anteriores. mlx-lm 0.32.0 no puede cargar este pack todavía.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con MTP puede acelerar tareas de copia intensiva, pero en chat general el autor indica que es similar o ligeramente más lenta que la decodificación plana.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-mlx-2bit | 9,41B | 262K | Ternario 2-bit MLX + visión FP16 | Apache 2.0 | Hugging Face (vaquero-labs) |
| Qwen3.5-9B (base) | ~9B | 262K | FP16/BF16 | Apache 2.0 (según base) | Hugging Face (Qwen) |
| Ternary-Bonsai-2-9B-gguf | 9,41B | 262K | Ternario GGUF | Apache 2.0 | Hugging Face (prism-ml) |

El modelo base Qwen3.5-9B ofrece la misma arquitectura y contexto pero con pesos en precisión completa, lo que multiplica el espacio en disco y memoria. El empaquetado GGUF del mismo autor contiene los mismos pesos ternarios y está orientado a CUDA, CPU y llama.cpp en Metal, mientras que este pack está optimizado para MLX en Apple Silicon. No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- La cuantización ternaria puede degradar la calidad respecto al modelo base en FP16; no se han publicado evaluaciones comparativas en la información disponible.
- El modo thinking puede consumir más de 3.000 tokens en prompts simples; se recomienda permitir al menos 8.192 tokens de salida y evitar decodificación greedy con thinking activado, ya que puede quedarse atascado razonando.
- El sampler debe pasarse explícitamente en mlx-vlm; de lo contrario, la decodificación es greedy por defecto, lo que afecta a la calidad.
- mlx-lm 0.32.0 no puede cargar este pack; es necesario mlx-vlm 0.7.8 o superior, o el loader incluido en `runtime/`.
- La cabeza MTP fue validada con mlx-vlm 0.6.3 y no se ha re-verificado en 0.7.8.
- Idiomas soportados no disponibles; el comportamiento multilingüe no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de sesgo o fidelidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B para usos comerciales concretos.
- El modelo está orientado exclusivamente a MLX/Metal; para CUDA, CPU o llama.cpp debe usarse el empaquetado GGUF equivalente.

## Enlaces

- Hugging Face: https://huggingface.co/vaquero-labs/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Empaquetado GGUF del mismo autor: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Web de Prism ML: https://prismml.com
- Repositorio de demo: https://github.com/PrismML-Eng/Bonsai-demo
- Discord: https://discord.gg/prismml
