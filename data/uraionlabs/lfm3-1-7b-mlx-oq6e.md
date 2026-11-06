# UraionLabs/LFM3-1.7B-MLX-oQ6e

## Resumen

LFM3-1.7B-MLX-oQ6e es una cuantización en formato MLX del modelo LFM3-1.7B de Liquid AI, publicada por Uraion Labs. El modelo base es un transformer tri-híbrido de 1.730 millones de parámetros diseñado específicamente para agentes locales, tool calling y salidas estructuradas, con una ventana de contexto de 262.144 tokens. Esta versión concreta aplica el preset de precisión mixta oQ6e de oMLX sobre pesos Apple Silicon, reduciendo el modelo a 1,45 GB con una media de aproximadamente 6,70 bits efectivos por peso.

La relevancia de esta ficha radica en que permite ejecutar un modelo de contexto largo y capacidades agénticas en hardware de consumo Apple (M1 a M5) sin renunciar a una calidad cercana a 8 bits. El autor reporta una velocidad de decodificación de unos 152 tokens por segundo en un M5 Pro, lo que lo sitúa como una opción práctica para inferencia en local y en el borde.

La arquitectura tri-híbrida combina convoluciones cortas con ventana deslizante y atención global, un enfoque que Liquid AI viene explorando para reducir el coste computacional del contexto largo manteniendo el rendimiento conversacional. El modelo cubre 16 idiomas y soporta razonamiento nativo mediante etiquetas `<think>` y llamadas a herramientas en formato XML.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Lfm3ForCausalLM` (`lfm3`), tri-híbrida: 13 convoluciones cortas con puerta, 5 atenciones de ventana deslizante (ventana 256), 6 atenciones globales |
| Parámetros totales | 1.728.801.536 (1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (entrada + salida) |
| Tipos de cuantización | oQ8e (8 bits), oQ6e (6/8 bits mixto, este repo), oQ5e (5/6/8 bits mixto), oQ4e (4/5/6/8 bits mixto) |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | MLX safetensors (archivo único `model.safetensors`, 1.447.997.839 bytes) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura tri-híbrida con 24 capas: 13 capas de convolución corta con puerta (gated short convolution), 5 capas de atención de ventana deslizante con ventana de 256 tokens y 6 capas de atención global. La atención usa GQA con 16 cabezas de consulta y 4 cabezas KV, con dimensión de cabeza 128. El vocabulario es de 128.000 tokens. Esta combinación busca equilibrar la eficiencia de las convoluciones y la atención local con la capacidad de modelado global que aportan las capas de atención completa, reduciendo el coste de memoria y cómputo en secuencias largas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el material proporcionado. La model card del autor de la cuantización no detalla el proceso de entrenamiento del modelo base. La innovación técnica destacable en esta versión es el esquema de cuantización oQ6e de oMLX: precisión base de 6 bits con 33 capas elevadas a 8 bits (proyecciones de atención gate/q/k/v/o y la FFN de los bloques más sensibles), embeddings y cabeza de salida (atados) en 6 bits, tamaño de grupo 64 con modo affine, y asignación de bits por capa elegida mediante análisis de sensibilidad. El resultado son aproximadamente 6,70 bits efectivos por peso.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento nativo mediante etiquetas `<think>`.
- Tool calling y function calling en formato XML, con soporte de búsqueda diferida de herramientas (deferred tool search).
- Salidas estructuradas (structured output), adecuadas para pipelines que requieren JSON u otros formatos validables.
- Capacidades agénticas y razonamiento multi-paso, orientadas a flujos de agente como Hermes Agent y OpenClaw.
- Soporte multilingüe en 16 idiomas, incluidos inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Contexto largo de 262.144 tokens para entrada y salida.
- Ejecución nativa en Apple Silicon (M1 a M5) mediante MLX, oMLX y mlx-vlm ≥ 0.7.11.

## Casos de uso

- Agentes locales en macOS: el modelo puede gestionar bucles de razonamiento multi-paso y llamadas a herramientas directamente en un Mac con Apple Silicon, sin depender de la nube, gracias a su soporte de tool calling XML y modo `<think>`.
- Asistentes de atención al cliente con contexto largo: con 262.144 tokens de ventana, puede mantener conversaciones multi-turno extensas o procesar historiales completos de tickets sin truncar información.
- Automatización de extracción de datos estructurados: su soporte de salidas estructuradas permite convertir texto libre en JSON validable dentro de pipelines de ingestión o ETL.
- Generación de código asistida en el editor: al ejecutarse en local con MLX, puede integrarse en extensiones de IDE que requieren baja latencia y privacidad de datos, sin enviar el código a servicios externos.
- Procesamiento de documentos multilingües: con 16 idiomas y contexto largo, es adecuado para resumir o clasificar contratos, informes o correos en varios idiomas desde un portátil.
- Prototipado de agentes con tool calling en el borde: desarrolladores que necesitan validar flujos de agente (búsqueda de herramientas, llamadas a APIs) en hardware de consumo pueden usar esta cuantización de 1,45 GB como banco de pruebas.
- Inferencia en dispositivos con recursos limitados: la variante oQ4e (1,04 GB) permite desplegar el modelo en Macs con menos memoria unificada, manteniendo capacidades conversacionales y de tool calling básicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor solo reporta una prueba de humo (smoke test): las cuatro variantes de cuantización respondieron correctamente a una comprobación matemática corta y generaron una llamada de herramienta `get_weather` válida en estilo OpenAI a través del servidor oMLX. El autor indica explícitamente que no es una ejecución completa de benchmarks.

Datos de velocidad reportados por Uraion Labs (Apple M5 Pro, 64 GB, macOS 27, oMLX 0.7.3, 800 tokens generados, media de 2 ejecuciones):

| Cuantización | Bits base | Perfil de precisión mixta | Tamaño | Velocidad de decodificación |
|---|---|---|---|---|
| oQ8e | 8 bits | 8 bits uniforme | 1,84 GB | ~130 tok/s |
| oQ6e (este repo) | 6 bits | Mixto 6/8 bits (33 capas a 8 bits) | 1,45 GB | ~152 tok/s |
| oQ5e | 5 bits | Mixto 5/6/8 bits (29 a 6b, 8 a 8b) | 1,23 GB | ~174 tok/s |
| oQ4e | 4 bits | Mixto 4/5/6/8 bits (37 a 5b, 2 a 6b, 4 a 8b) | 1,04 GB | ~203 tok/s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el peso del modelo ocupa 1,45 GB en la variante oQ6e; el consumo total depende del contexto y del runtime, pero al ser MLX sobre Apple Silicon se usa memoria unificada compartida.
- GPU recomendadas: Apple Silicon M1 a M5 (el autor probó en un M5 Pro con 64 GB). No se mencionan GPU NVIDIA ni AMD en la información disponible.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; la variante oQ4e (1,04 GB) reduce aún más el requisito.
- Opciones de despliegue: oMLX 0.7.3 y mlx-vlm ≥ 0.7.11 (que carga LFM3 como modelo solo de texto). El soporte en `mlx-lm` está aún en desarrollo upstream según el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ~152 tok/s de decodificación en un solo flujo en M5 Pro con oQ6e; ~203 tok/s con oQ4e y ~130 tok/s con oQ8e, según mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ6e (este) | 1,73B | 262.144 | LFM Open v1.0 | MLX safetensors, Apple Silicon | Cuantización mixta 6/8 bits, ~152 tok/s en M5 Pro |
| LFM3-1.7B (base) | 1,73B | 262.144 | LFM Open v1.0 | Safetensors, multiplataforma | Modelo original de Liquid AI, sin cuantizar |
| LFM3-1.7B-MLX-oQ8e | 1,73B | 262.144 | LFM Open v1.0 | MLX safetensors, Apple Silicon | 8 bits uniforme, 1,84 GB, ~130 tok/s |
| LFM3-1.7B-MLX-oQ4e | 1,73B | 262.144 | LFM Open v1.0 | MLX safetensors, Apple Silicon | 4/5/6/8 bits mixto, 1,04 GB, ~203 tok/s |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otros fabricantes del mismo tamaño. La comparativa se limita a las variantes de cuantización del mismo modelo base publicadas por el mismo autor.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- El soporte de LFM3 en `mlx-lm` está aún en progreso upstream; el autor recomienda usar oMLX o mlx-vlm ≥ 0.7.11, lo que limita las opciones de despliegue.
- El modelo está pensado para Apple Silicon y MLX; no hay soporte documentado para CUDA, ROCm ni otros backends en esta versión.
- No se han publicado benchmarks completos: la única validación reportada es un smoke test de matemáticas y tool calling, insuficiente para evaluar calidad en producción.
- Riesgo de alucinación inherente a modelos de 1,7B parámetros; no se documentan medidas específicas de mitigación.
- No se dispone de información sobre sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO).
- El rendimiento en contexto largo (262.144 tokens) no está verificado con benchmarks; la ventana deslizante de 256 tokens en 5 capas puede afectar a la recuperación de información en posiciones lejanas.
- Las velocidades reportadas corresponden a un único hardware (M5 Pro, 64 GB) y pueden variar según chip, longitud de contexto y configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ6e
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante oQ8e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ8e
- Variante oQ5e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ5e
- Variante oQ4e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ4e
- Uraion Labs: https://uraionlabs.com
- oMLX (repositorio): https://github.com/jundot/omlx
- mlx-vlm (repositorio): https://github.com/Blaizzy/mlx-vlm
- Licencia: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ6e/blob/main/LICENSE
