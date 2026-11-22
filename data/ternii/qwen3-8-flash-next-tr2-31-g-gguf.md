# Ternii/Qwen3.8-Flash-Next-TR2.31-G-GGUF

## Resumen

Qwen3.8-Flash-Next TR2.31-G es una cuantización extrema del modelo Qwen3.8-Flash-Next de Qwen, un transformer de tipo mezcla de expertos (MoE) con 176.943.899.520 parámetros totales (el checkpoint de 180B sin la cabeza de predicción multi-token de 4B) y aproximadamente 6B de parámetros activos por token. La versión original es de código abierto bajo licencia Qwen Community 1.0; esta variante la publica el usuario Ternii (Wai Chung) aplicando TR Quantisation, una técnica de cuantización ternaria que reduce los pesos a 2,31 trits de media.

El problema que resuelve es el de ejecutar un modelo de 177B parámetros en hardware de consumo muy limitado: concretamente, un MacBook Air con Apple M5 y 16 GB de RAM. Para ello, los expertos enrutados se codifican a 2 trits (9 niveles), las demás capas lineales a 3 trits (27 niveles) y la tabla de embeddings n-gram a 3 trits, con una escala de 16 bits por grupo de 128 pesos. El resultado ocupa 89,8 GB en disco y los expertos se mantienen en el SSD con una caché fija en memoria para los más usados, sin reentrenamiento.

Es relevante porque demuestra que un MoE de esta escala puede ser viable en un portátil de 16 GB con velocidades de decodificación de 10,9 a 11,8 tokens/s y lecturas de prompt de 118 a 123 tokens/s, a costa de requerir un fork parcheado de llama.cpp (los tipos de tensor TQ9_128 y TQ27_128 no existen en el upstream). El modelo solo procesa texto (sin codificador de visión ni cabeza MTP) y está orientado a Apple Silicon mediante Metal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atención dispersa (compress_ratios 4 en las 12 capas de atención completa) |
| Parámetros totales | 176.943.899.520 (176,9B) |
| Parámetros activos | ~6B por token (modelo base); el runtime usa 8 expertos enrutados por token con LLAMA_MOE_SSD=1, o 10 por defecto |
| Longitud de contexto | Hasta 262.144 tokens (configurable con TR_CTX); por defecto 32k en equipos de menos de 48 GB |
| Tipos de cuantización | TR Quantisation: 2 trits (9 niveles) en expertos enrutados, 3 trits (27 niveles) en otras capas lineales y tabla n-gram, 8 bits en pesos de hiperconexión, escala de 16 bits por grupo de 128 pesos; media de 2,31 trits por peso |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (8 shards, ~89,8 GB), más un predictor `.trpw` de 115 MiB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención dispersa: 12 capas de atención completa con `compress_ratios` 4, y una tabla de embeddings n-gram de 51,2B parámetros. El checkpoint original tiene 180B parámetros; esta variante elimina la cabeza de predicción multi-token (MTP) de 4B, quedándose en 176,9B. De ellos, 120,8B corresponden a expertos enrutados, 4,2B a otras capas lineales y 51,2B a la tabla n-gram, todos traducidos a la representación ternaria. No hay reentrenamiento: la cuantización se aplica directamente sobre los pesos BF16 de Qwen, con códigos calibrados mediante GPTQ.

La innovación técnica principal es TR Quantisation, que combina distintos niveles de trits según la sensibilidad de cada bloque de pesos y almacena la tabla n-gram redondeada a valores de 3 trits en un contenedor Q5_0 exacto. El runtime incluye un predictor aprendido (`.trpw`) que lee por adelantado los expertos de la siguiente capa desde el SSD, sin alterar la salida (texto byte-idéntico con y sin él) y mejorando la decodificación alrededor de un 5 %. Los datos de entrenamiento del modelo base no se detallan en la información disponible; la model card cita los datasets nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math, openai/gsm8k y OpenAssistant/oasst2, presumiblemente empleados en la calibración de la cuantización.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y matemáticas: el modelo alcanza puntuaciones de nivel GSM8K (92,80–93,25 en las pruebas citadas), lo que indica competencia en problemas aritméticos de varios pasos.
- Generación de código: los datasets de calibración incluyen OpenCodeInstruct, orientado a instrucciones de programación.
- Procesamiento de contexto largo: soporta hasta 262.144 tokens, con lecturas por lotes de 2.048 tokens.
- Modo de razonamiento configurable mediante el flag `--reasoning` del servidor llama.cpp.
- No incluye capacidades de visión (sin codificador visual) ni audio.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte de agentes multi-paso en la información disponible.
- Multilingüe limitado: solo inglés declarado.

## Casos de uso

- Asistente conversacional local en portátil: un MacBook Air de 16 GB puede ejecutar el modelo como servidor de chat local (`llama-server`) con contexto de 32k, atendiendo conversaciones multi-turno sin enviar datos a la nube, gracias a la caché de expertos en SSD y memoria.
- Análisis de documentos largos: con contexto de hasta 262.144 tokens y lecturas de prompt de 113–123 tokens/s, es adecuado para resumir o extraer información de informes extensos en un equipo de consumo.
- Asistencia a la programación en local: el modelo base se calibró con OpenCodeInstruct y puede generar y explicar código en un entorno sin conexión, útil para desarrolladores que trabajan con código confidencial.
- Resolución de problemas matemáticos y razonamiento paso a paso: los resultados de nivel GSM8K (92,80–93,25) lo hacen apto para tutoría o verificación de cálculos en local.
- Prototipado e investigación de cuantización: sirve como banco de pruebas para estudiar el impacto de la cuantización ternaria en un MoE de gran escala, comparando con la variante TR3-G del mismo autor.
- Despliegue en hardware con CUDA: la release r4 incluye una build para Linux arm64 con CUDA orientada al DGX Spark, lo que permite usar el modelo en estaciones compactas con GPU.
- Servidor de inferencia privado para equipos pequeños: al ejecutarse íntegramente en local y con licencia comunitaria, encaja en entornos con requisitos estrictos de privacidad.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de GSM8K y las métricas de velocidad medidas en un MacBook Air M5 de 16 GB:

| Métrica | Valor |
|---|---|
| GSM8K (r4, ruta tensor-core CUDA) | 92,80 |
| GSM8K (r4, `GGML_CUDA_TQ_MM=0`) | 93,25 (n = 1.319, diferencia no significativa) |
| GSM8K (r5, ruta tensor-core) | 92,80 |
| Lectura de prompt a 32k (prompts de 9k–23k tokens) | 118–123 tokens/s |
| Decodificación a 32k | 10,9–11,8 tokens/s (13,4 GB wired) |
| Lectura de prompt a 128k (prompt de 64k tokens) | 113 tokens/s |
| Decodificación a 128k | 6,8 tokens/s |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM: 16 GB de memoria unificada en Apple Silicon como mínimo práctico; el modelo ocupa 89,8 GB en disco y los expertos se leen desde el SSD. La caché de expertos se ajusta según el contexto: 6.600 MiB a 32k, 5.950 MiB a 64k y 4.750 MiB a 128k.
- GPU recomendadas: Apple M5 (medido), Apple Silicon en general con Metal; build Linux arm64 con CUDA para DGX Spark (release r4).
- ¿Cabe en GPU de consumo? Sí, en un MacBook Air de 16 GB; no se documenta compatibilidad con GPUs NVIDIA de consumo.
- Despliegue: exclusivamente mediante el fork parcheado de llama.cpp (`llama.cpp-tr-b11721-r3` o posterior). Las builds estándar de llama.cpp, LM Studio y Ollama no pueden cargarlo porque no reconocen los tipos TQ9_128 y TQ27_128.
- Latencia y throughput: ver tabla de benchmarks; la decodificación cae de ~11,8 tokens/s a 32k hasta 6,8 tokens/s a 128k. El uso de `caffeinate -ims` es necesario para evitar que la GPU reduzca su frecuencia mientras espera al SSD.
- Ajuste opcional: con `-fit off` y `LLAMA_MOE_CACHE_MIB=8100` se gana ~5 % de velocidad, dejando menos de 1 GB libre en un equipo de 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next TR2.31-G (este) | 176,9B totales, ~6B activos | Hasta 262.144 | 2,31 trits (TR) | qwen-community-1.0 | GGUF, requiere llama.cpp-tr |
| Qwen3.8-Flash-Next TR3-G (mismo autor) | 176,9B totales, ~6B activos | No disponible | 3 trits (TR) | qwen-community-1.0 | GGUF; 1.080 de 1.224 tensores byte-idénticos a este |
| Qwen/Qwen3.8-Flash-Next (base) | 180B totales (con cabeza MTP), ~6B activos | No disponible | BF16 | qwen-community-1.0 | Pesos originales en Hugging Face |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma `en`, sin soporte multilingüe documentado.
- Solo texto: no incluye codificador de visión ni cabeza de predicción multi-token; no puede procesar imágenes ni audio.
- Dependencia de un fork: no funciona con llama.cpp estándar, LM Studio ni Ollama; requiere el runtime `llama.cpp-tr` y sus tipos de tensor propietarios.
- Rendimiento dependiente del SSD: los expertos se leen desde disco, por lo que la velocidad depende de la latencia y el ancho de banda del almacenamiento; sin `caffeinate` en Mac la GPU baja frecuencias y la decodificación se degrada notablemente.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de fidelidad factual más allá de GSM8K.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia: Qwen Community License 1.0; es necesario revisar sus términos para uso comercial, ya que no es una licencia plenamente permisiva.
- Pérdida de precisión por cuantización: la reducción a 2 trits en los expertos puede degradar tareas distintas de las evaluadas (solo se publica GSM8K); conviene validar en el dominio de uso.
- Configuración sensible: el rendimiento y la memoria dependen de variables de entorno (`LLAMA_MOE_CACHE_MIB`, `LLAMA_MOE_EXPERTS`, `TR_CTX`) y de ajustes que dejan poco margen libre en equipos de 16 GB.
- Fecha de publicación futura (noviembre de 2026) y bajo número de descargas (617) y likes (0): ecosistema y validación comunitaria aún muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR2.31-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante TR3-G del mismo autor: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF
- Repositorio del runtime (fork de llama.cpp): https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Release r4 (Linux arm64 con CUDA): https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r4
- Release r5: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r5
- Script de instalación para Mac: https://github.com/ternii-ai/tritq-vllm/blob/main/mac/qwen38-16gb.sh
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
