# ulkaa/Qwen3.8-27B-AWQ-INT4

## Resumen

Qwen3.8-27B-AWQ-INT4 es una cuantización AWQ de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario ulkaa. El modelo base es un transformer híbrido de 27.356 millones de parámetros que combina 48 capas con Gated DeltaNet (atención lineal) y 16 capas con atención completa, y que procesa tanto texto como imágenes (pipeline image-text-to-text). Esta versión cuantizada reduce el peso de 55,6 GiB en BF16 a 18,2 GiB, lo que permite desplegarlo en hardware más modesto manteniendo la torre de visión y la cabeza MTP en BF16.

La relevancia de esta ficha radica en dos aspectos. Primero, el formato `compressed-tensors` pack-quantized W4A16 con grupo 128 es directamente compatible con motores de inferencia de producción como SGLang y vLLM. Segundo, el autor ha validado la compilación sobre GPUs Intel Arc Pro con una imagen Docker específica, e incluye soporte para decodificación especulativa mediante la cabeza MTP integrada o el modelo draft externo Qwen3.8-27B-DFlash2. La revisión `1m` extiende el contexto de 262.144 a 1.048.576 tokens mediante un factor YaRN de 4, sin cambiar los pesos.

El modelo está orientado a cargas de trabajo multimodales de contexto largo: análisis de documentos extensos, agentes con historial prolongado y generación de código con instrucciones conversacionales. La licencia Apache 2.0 facilita su uso comercial, aunque la información disponible no detalla los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `Qwen3_5ForConditionalGeneration`: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa; torre de visión multimodal |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens en `main`; 1.048.576 tokens en la revisión `1m` (factor YaRN 4) |
| Tipos de cuantizacion | AWQ W4A16 asimétrica, grupo 128, formato `compressed-tensors` pack-quantized INT4; pesos a 4 bits con activaciones BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`compressed-tensors` pack-quantized); 18,2 GiB en total, 38,3 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida en la que 48 de sus 64 capas decodificadoras usan Gated DeltaNet —una variante de atención lineal con estado recurrente— y las 16 restantes emplean atención completa. Esta mezcla reduce el coste computacional y de memoria del contexto largo frente a un transformer denso equivalente, a la vez que conserva la capacidad de atención global en una fracción de las capas. El modelo es multimodal: incluye una torre de visión que procesa imágenes junto al texto, y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa sin un segundo modelo.

La cuantización se realizó con AWQ mediante llm-compressor, partiendo de los pesos BF16 originales (no de la release FP8). La calibración usó 512 secuencias de 1.024 tokens, con un 60 % de instrucciones de código procedentes de `codeparrot/self-instruct-starcoder` y un 40 % de instrucciones generales de `HuggingFaceH4/ultrachat_200k`. El pipeline es secuencial por capa (`Qwen3_5DecoderLayer`), de modo que cada capa se calibra contra la salida ya cuantizada de las anteriores. Se cuantizan las tres proyecciones grandes de DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), que pasan de 10,36 GiB en BF16 a 2,73 GiB; quedan en BF16 la torre de visión, la cabeza MTP, `lm_head`, `embed_tokens`, todas las normas y las compuertas escalares `in_proj_a` e `in_proj_b`. El resultado son 24,33 B parámetros a 4 bits (4,16 bits efectivos con escalas y puntos cero) y 3,45 B a BF16 (12,4 % del modelo), con un promedio de 5,63 bits por parámetro. La actualización `norm-gain-repair-v1` corrige el redondeo BF16 en las ganancias de normalización de entrada de las 48 capas Gated DeltaNet, sin alterar los pesos INT4 empaquetados.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imágenes junto a texto (image-text-to-text), con torre de visión preservada en BF16.
- Generación y comprensión de código, con calibración específica orientada a instrucciones de programación.
- Contexto largo: hasta 262.144 tokens en la revisión `main` y hasta 1.048.576 tokens en la revisión `1m`.
- Decodificación especulativa mediante cabeza MTP integrada (algoritmo EAGLE en SGLang) o mediante el draft externo Qwen3.8-27B-DFlash2.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto (y hasta 1.048.576 en la revisión `1m`), el modelo puede ingerir contratos, informes anuales o expedientes completos en una sola pasada sin fragmentación, manteniendo coherencia entre secciones distantes.
- Procesamiento de documentos escaneados con visión: la torre de visión en BF16 permite extraer información de facturas, formularios e imágenes adjuntas junto al texto de la consulta, útil en pipelines de digitalización y back office.
- Asistentes de código en producción: la calibración con un 60 % de instrucciones de código y el soporte de SGLang con decodificación especulativa lo hacen adecuado para autocompletado y revisión de código en entornos con GPUs Intel Arc Pro o CUDA.
- Agentes con historial prolongado: el contexto de hasta 1 M tokens permite mantener memoria de conversación y trazas de herramientas durante sesiones largas sin resumir el historial, siempre que la suma de entrada y salida solicitada quepa en el límite.
- Despliegue en infraestructura Intel: la imagen Docker `rahulunair/sglang-xpu` con el tag fechado permite servir el modelo en GPUs Intel Arc Pro con TP4, decodificación INT8 y captura de grafos, lo que abre una alternativa a las plataformas NVIDIA.
- Servicio de inferencia de alto rendimiento: el formato `compressed-tensors` es compatible con vLLM y SGLang, y la cabeza MTP integrada ofrece decodificación especulativa con 7 pasos y 8 tokens draft sin cargar un segundo modelo.
- Búsqueda y recuperación aumentada sobre corpus grandes: los 1.048.576 tokens de la revisión `1m` permiten inyectar muchos fragmentos recuperados en una sola llamada, reduciendo la latencia de múltiples rondas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,2 GiB solo para pesos; el pool de contexto y la caché KV añaden memoria adicional según la longitud de contexto configurada.
- Configuración de producción documentada: TP4 (4 GPUs) sobre Intel Arc Pro, con `--context-length 1048576`, `--max-total-tokens 1048576`, `--max-mamba-cache-size 40` y `--max-running-requests 64`, lo que produce un pool objetivo exacto de 1.048.576 tokens y ocho slots efectivos de peticiones especulativas.
- GPU recomendadas: Intel Arc Pro (configuración validada por el autor); para CUDA no se detalla una configuración validada en la información disponible.
- Cabe en GPU de consumo: no confirmado en la información disponible; 18,2 GiB de pesos exceden la VRAM de la mayoría de GPUs de consumo de 16 GB, por lo que requeriría GPUs de 24 GB o más o descarga parcial a CPU.
- Opciones de despliegue: SGLang (validado, imagen Docker `rahulunair/sglang-xpu:qwen3.8-27b-20260819`), vLLM (formato `compressed-tensors` compatible), transformers (librería declarada). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la decodificación especulativa con MTP (7 pasos, top-k 1, 8 tokens draft) o DFlash2 (8 tokens draft, bloque 8, ventana 2048) está orientada a reducir la latencia de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ulkaa/Qwen3.8-27B-AWQ-INT4 | 27,36 B (4 bits) | 262.144 / 1.048.576 (rev. `1m`) | Texto + imagen | Apache 2.0 | Hugging Face, SGLang XPU validado |
| Qwen/Qwen3.8-27B (base BF16) | 27,36 B | 262.144 | Texto + imagen | Apache 2.0 | Hugging Face |
| incoai/Qwen3.8-27B-DFlash2 | No disponible (modelo draft) | No disponible | No disponible | No disponible | Hugging Face (draft para decodificación especulativa) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- La cuantización W4A16 introduce pérdida de precisión frente al BF16 original; no se publican evaluaciones de degradación de calidad en la información disponible.
- La revisión `1m` usa un factor YaRN 4 sobre la configuración original de 262.144 tokens; el rendimiento en contextos muy largos más allá de la ventana nativa no está validado con benchmarks en la información disponible.
- Con una entrada de 1.048.576 tokens no queda espacio para tokens generados: la suma de entrada y salida solicitada debe caber en el límite de contexto.
- Las peticiones que devuelven logprobs son rechazadas antes de la planificación cuando se usa DFlash2, porque esa forma de petición no está implementada.
- Las peticiones que exceden la capacidad activa se encolan; con `--max-running-requests 64` y ocho slots especulativos efectivos, la concurrencia está acotada.
- En la configuración XPU no debe añadirse el colectivo personalizado de CUDA de SGLang; la imagen usa `--disable-custom-all-reduce` para que el plugin XPU gestione el colectivo.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados: no disponible, lo que impide garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- Soporte de tool calling y de agentes multi-paso: no confirmado explícitamente en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y los términos del modelo base Qwen/Qwen3.8-27B, así como del draft externo DFlash2, antes de desplegar en producción.
- El autor es un publicador independiente (ulkaa), no el equipo oficial de Qwen; la validación de calidad corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ulkaa/Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión 1M: https://huggingface.co/ulkaa/Qwen3.8-27B-AWQ-INT4/tree/1m
- Checkpoint original AWQ: https://huggingface.co/ulkaa/Qwen3.8-27B-AWQ-INT4/tree/original-awq-v1
- Checkpoint original 1M: https://huggingface.co/ulkaa/Qwen3.8-27B-AWQ-INT4/tree/original-awq-v1-1m
- Modelo draft DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Imagen Docker SGLang XPU: https://hub.docker.com/r/rahulunair/sglang-xpu
- Sección Qwen3.8-27B en Docker Hub: https://hub.docker.com/r/rahulunair/sglang-xpu#qwen38-27b
