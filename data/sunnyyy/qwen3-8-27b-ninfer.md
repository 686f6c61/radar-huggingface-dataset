# sunnyyy/Qwen3.8-27B-NInfer

## Resumen

Qwen3.8-27B-NInfer es una conversión del modelo multimodal Qwen/Qwen3.8-27B al formato nativo `.ninfer` del motor de inferencia NInfer, publicada por el usuario sunnyyy. El artefacto resultante es un único fichero de 16,96 GiB que encapsula pesos cuantizados, vision tower, cabezal MTP de decodificación especulativa, tokenizador, plantilla de chat y procesador de medios, todo ello empaquetado para ejecución exclusiva con NInfer.

El modelo base, Qwen3.8-27B, es un modelo denso de 27 000 millones de parámetros con arquitectura híbrida de atención: 48 de sus 64 capas usan atención lineal, incorpora un vision tower para entrada de imágenes y vídeo, y dispone de un cabezal MTP (Multi-Token Prediction) integrado para decodificación especulativa. Su ventana de contexto nativa es de 262 144 tokens, extensible hasta 1M. La relevancia de esta conversión radica en que permite ejecutar un modelo multimodal de 27B con cuantización groupwise Q4/Q5/Q6 en una GPU consumer de gama alta (RTX 5090), con soporte de servido compatible con las APIs de OpenAI y Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denso híbrido: atención lineal en 48 de 64 capas, vision tower, cabezal MTP integrado |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1M |
| Tipos de cuantizacion | Q4/Q5/Q6 groupwise en el cuerpo del modelo; W8G32_F16S en embedding y cabezal de salida |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato nativo de NInfer, contenedor versión 2) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura híbrida de atención: 48 de las 64 capas emplean atención lineal, lo que reduce el coste computacional en contextos largos, mientras que las 16 restantes conservan atención completa. Incluye un vision tower para procesamiento multimodal (imágenes, múltiples imágenes, vídeo y mensajes mixtos) y un cabezal MTP integrado que permite decodificación especulativa con ventanas de draft de 1 a 5 tokens.

El artefacto NInfer aplica una asignación groupwise Q4/Q5/Q6 en el cuerpo del transformer, mientras que el token embedding y el cabezal de salida completo usan precisión W8G32_F16S. El fichero contiene 1 124 objetos almacenados (1 118 tensores y 6 recursos), incluyendo los objetos registrados de Vision, MTP, proposal-head, tokenizador, plantilla de chat, generación y procesador de medios. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto en modos thinking y non-thinking.
- Procesamiento multimodal: imágenes, múltiples imágenes, vídeo y mensajes mixtos texto-imagen.
- Decodificación especulativa MTP con ventanas de draft de 1 a 5 tokens.
- Cache KV en BF16 e INT8 con agrupación de 64.
- Decodificación con CUDA Graph y reutilización de prefijos compatibles.
- Servido concurrente a pequeña escala con decodificación por lotes real (true batched decode).
- Interfaz de línea de comandos NInfer.
- Servido compatible con las APIs de OpenAI y Anthropic.
- Razonamiento matemático y científico avanzado (resultados destacados en AIME 2025/2026 y GPQA-Diamond).
- Comprensión visual del mundo real (RealWorldQA 82,22 %).

## Casos de uso

- Asistente multimodal local en RTX 5090: el artefacto está optimizado para ejecutarse en una única GPU consumer de 32 GB, lo que permite desplegar un asistente con visión y razonamiento sin depender de infraestructura cloud.
- Razonamiento matemático y científico: con un 96,67 % en AIME 2025 y 2026 y un 87,37 % en GPQA-Diamond, es adecuado para resolución de problemas de competición, tutoría avanzada y verificación de demostraciones.
- Análisis de documentos con imágenes: el soporte de entrada multimodal (imagen, vídeo, mensajes mixtos) permite extraer información de capturas, diagramas, gráficos y documentos escaneados.
- Servicio de chat con API compatible OpenAI/Anthropic: el artefacto incluye servido compatible con ambas APIs, lo que facilita su integración en aplicaciones existentes sin cambios en el código cliente.
- Generación de código con contexto largo: la ventana de 262 144 tokens permite procesar repositorios completos o archivos de gran tamaño en una sola pasada, útil para revisión de código y refactorización asistida.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, evita el envío de datos sensibles a servicios externos, manteniendo capacidades de razonamiento y visión de alto nivel.
- Inferencia de baja latencia con decodificación especulativa: el cabezal MTP integrado con ventanas de draft de 1 a 5 tokens reduce el número de pasos de decodificación, mejorando la latencia en servido interactivo.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados mediante la ruta de servido compatible con OpenAI de NInfer, con thinking habilitado, MTP=3 y cache KV INT8 group-64. EvalScope 1.9.0 con prompts 0-shot, scoring basado en reglas, una muestra por problema, temperatura 1.0, top-p 0.95, top-k 20 y seed 42. La suite de texto se ejecutó con límite de contexto de 262 144 tokens; la suite multimodal con `--vision` y límite de 81 920 tokens.

| Benchmark | NInfer groupwise-int | Correcto / Total | Qwen3.8-27B BF16 oficial |
|---|---:|---:|---:|
| IFBench (prompt-level strict) | 77,67 % | 233 / 300 | 79,5 |
| AIME 2025 | 96,67 % | 29 / 30 | — |
| AIME 2026 | 96,67 % | 29 / 30 | — |
| GPQA-Diamond | 87,37 % | 173 / 198 | 89,2 |
| ERQA | 66,25 % | 26 / no disponible | — |
| RealWorldQA | 82,22 % | no disponible | — |

La cuantización groupwise introduce una pérdida de entre 1 y 2 puntos porcentuales respecto al modelo BF16 oficial en IFBench y GPQA-Diamond, manteniendo resultados prácticamente idénticos en las pruebas de razonamiento matemático.

## Requisitos de hardware

- GPU obligatoria: NVIDIA GeForce RTX 5090 (arquitectura `sm_120a`). No se garantiza el funcionamiento en otras GPUs.
- VRAM: el fichero pesa 16,96 GiB; con cache KV y overhead de ejecución, se requiere la VRAM completa de la RTX 5090 (32 GB).
- Sistema operativo: Linux de 64 bits.
- CUDA Toolkit 13.1 o superior.
- NInfer compilado desde fuente, revisión `5232055` o posterior. No se proporciona binario empaquetado ni target de instalación.
- Opciones de despliegue: CLI de NInfer, servido compatible con OpenAI y Anthropic.
- Latencia y throughput: no disponibles en la documentación proporcionada. La decodificación especulativa MTP y la cache KV INT8 group-64 están diseñadas para reducir la latencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | IFBench | GPQA-Diamond | Licencia |
|---|---|---|---:|---|---|---|
| Qwen3.8-27B-NInfer (este) | 27B | 262K | Q4/Q5/Q6 groupwise | 77,67 % | 87,37 % | Apache-2.0 |
| Qwen3.8-27B BF16 (oficial) | 27B | 262K | BF16 | 79,5 | 89,2 | Apache-2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | 262K | NVFP4 | no disponible | no disponible | Apache-2.0 |

La conversión NInfer sacrifica entre 1 y 2 puntos porcentuales frente al BF16 oficial a cambio de reducir el peso de 27B a 16,96 GiB y permitir la ejecución en una GPU consumer. La variante NVFP4 de unsloth es la alternativa de cuantización más directa, aunque no se dispone de sus resultados de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El artefacto es exclusivo del motor NInfer: no es un checkpoint de Transformers, ni una distribución Safetensors, ni un fichero GGUF. No puede ejecutarse con vLLM, llama.cpp, Ollama ni TGI.
- Requiere hardware muy específico: únicamente RTX 5090 (`sm_120a`). No funcionará en GPUs de generaciones anteriores ni en otras arquitecturas.
- NInfer debe compilarse desde fuente; no hay binarios precompilados ni instalador, lo que eleva la barrera de entrada.
- La cuantización groupwise introduce una degradación medible (1-2 puntos) en benchmarks de instrucción y conocimiento científico frente al modelo BF16.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos de este artefacto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación comunitaria.
- La fecha de creación (2026-09-01) y los benchmarks de AIME 2026 sugieren que el modelo base es muy reciente; verificar la estabilidad del motor NInfer antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sunnyyy/Qwen3.8-27B-NInfer
- Repositorio fuente de la model card: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Documentación NInfer: https://github.com/Neroued/ninfer/tree/master/docs
- Evaluación NInfer (EvalScope): https://github.com/Neroued/ninfer/tree/master/eval
- Commit requerido de NInfer: https://github.com/Neroued/ninfer/commit/52320554b5e71a9da96bff809ddf67ac5773ed63
- Variante NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Ficha del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
