# WaveCut/Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP-NInfer-v3

## Resumen

Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP-NInfer-v3 es un artefacto de inferencia en formato `.ninfer` (v3) publicado por WaveCut, derivado del modelo HauhauCS/Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP. Se trata de una variante de Gemma 4 26B-A4B (arquitectura MoE con 26 mil millones de parametros totales y aproximadamente 4 mil millones activos por token) afinada con Quantization-Aware Training (QAT), con los rechazos eliminados ("uncensored"), en su variante Balanced y cuantizada a Q4_K_M. El artefacto empaqueta en un unico fichero de 16,95 GiB el modelo de texto, la cabeza MTP (Multi-Token Prediction) para decodificacion especulativa y el proyector de vision, ademas del tokenizer y las plantillas de Google.

El modelo resuelve el problema de desplegar un modelo multimodal (texto, imagen y video) de gran tamano en hardware consumer, concretamente en una RTX 3090, manteniendo los bloques ggml originales byte a byte sin recuantizar. La innovacion principal es el motor NInfer en su rama `ninfer-all`, que soporta la familia Gemma 4, los formatos `gguf_*`, la decodificacion especulativa via MTP y la torre de vision, capacidades que las builds estandar de NInfer no incluyen.

Es relevante ahora porque demuestra un pipeline completo de cuantizacion QAT combinada con decodificacion especulativa y multimodalidad en un solo artefacto, con requisitos de VRAM compatibles con GPUs de 24 GB. La revision del 27 de noviembre de 2026 incorpora la correccion de tokens defectuosos ("glitch tokens") de Google, mejorando la fidelidad de reproduccion de cadenas problematicas de 17 a 25 sobre 30.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4) con atencion hibrida: 25 bloques de ventana deslizante y 5 de atencion completa; 128 expertos enrutados por bloque; cabeza MTP para decodificacion especulativa; torre de vision con 27 bloques de ancho 1152 |
| Parametros totales | 26B (aproximado, segun nombre del modelo) |
| Parametros activos | 4B (aproximado, segun nombre A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K, Q8_0, Q5_0, Q4_0 (drafter), Q6_K, BF16 (vision), FP32 (normas, router, escalas) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | `.ninfer` v3 (18.194.646.272 bytes; SHA-256 `ca54b294ac8b5928481997b590546c7c627f0f902a17ed762ae622f7daf5c439`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) de la familia Gemma 4, con 26B parametros totales y aproximadamente 4B activos. La atencion se distribuye en 25 bloques de ventana deslizante y 5 de atencion completa. Cada bloque contiene 128 expertos enrutados. La representacion de pesos es heterogenea: Q, K y salida en Q4_K, V en Q6_K o Q4_K segun el bloque, MLP densa con gate y up en Q4_K y down en Q8_0 o Q5_0, tabla de tokens y cabeza atada en Q6_K, y normas, router y escalas en FP32. El artefacto conserva los bloques ggml del release original byte a byte, sin recuantizar; el motor multiplica los bloques in situ.

El entrenamiento subyacente corresponde a Gemma 4 26B-A4B-it de Google con QAT, posteriormente modificado por HauhauCS para eliminar rechazos y balancear el comportamiento. El artefacto incorpora la cabeza MTP del release (`mtp-gemma-4-26B-A4B-it.gguf`, Q4_0, cuatro bloques de ancho 1024 que leen la cache KV del modelo) para decodificacion especulativa, y la torre de vision (`mmproj-...-BF16.gguf`, proyector `gemma4v`, 27 bloques de ancho 1152 con matrices BF16). El tokenizer, la plantilla de chat y el procesador de imagen y video provienen de `google/gemma-4-26B-A4B-it` en la revision `4d7ae498`, incluyendo la correccion de glitch tokens de Google (298 merges de 260 tokens con embeddings colapsados eliminados y `𡉺` renombrado `<glitch_pruned_249788>`). No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto multimodal: procesa imagenes y video junto a texto mediante la torre de vision integrada.
- Razonamiento en canal separado cuando la peticion activa el modo thinking.
- Decodificacion especulativa mediante la cabeza MTP (`--spec mtp`), acelerando la generacion.
- Tool calling: las llamadas a herramientas en el marcado de Gemma se devuelven como tool calls en formato OpenAI.
- Salida estructurada (structured output).
- Multiples peticiones concurrentes: de una a ocho peticiones simultaneas con reutilizacion de prefijo de prompt, incluidas imagenes.
- Procesamiento de imagen y video con el procesador oficial de Google (`processor_config.json`).
- Modelo "uncensored": rechazos eliminados respecto al modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia multimodal en produccion: el modelo puede recibir imagenes o video junto a texto en una sola peticion, adecuado para tareas de descripcion, extraccion de informacion o respuesta sobre contenido visual, gracias a la torre de vision integrada en el mismo artefacto.
- Agentes con tool calling: al devolver las llamadas a herramientas en formato OpenAI, se integra directamente en frameworks de agentes y orquestadores que esperan ese esquema, sin capa de traduccion adicional.
- Generacion de codigo y razonamiento multi-paso: el modo thinking en canal separado permite separar el razonamiento interno de la respuesta final, util en pipelines que auditan o filtran el proceso de razonamiento.
- Despliegue en estacion de trabajo con RTX 3090: el artefacto esta disenado y medido para una GPU de 24 GB, lo que permite ejecutar un modelo MoE de 26B con vision y decodificacion especulativa en hardware consumer.
- Servicio concurrente de baja latencia: con hasta ocho peticiones simultaneas y reutilizacion de prefijo de prompt (incluidas imagenes), es adecuado para servir a varios usuarios desde una sola instancia.
- Extraccion estructurada de datos desde documentos e imagenes: la salida estructurada combinada con vision permite convertir formularios, facturas o capturas en JSON validado.
- Analisis de video: el procesador de video oficial permite tareas de resumen o descripcion de clips sin pipeline externo de extraccion de frames.
- Investigacion sobre cuantizacion QAT y decodificacion especulativa: el artefacto conserva los bloques ggml originales sin recuantizar, lo que lo convierte en una referencia reproducible para estudiar el impacto de QAT y MTP en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una metrica de fidelidad del tokenizer: ante la peticion de repetir 30 cadenas afectadas por glitch tokens (greedy, thinking desactivado), esta revision reproduce 25 de 30, frente a 17 de 30 de la revision anterior.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 16,95 GiB en disco; con overhead de cache KV y contexto, se recomienda un minimo de 24 GB de VRAM.
- GPU recomendadas: RTX 3090 (familia desarrollada y medida en esta GPU); las builds para RTX 40 y RTX 50 compilan pero no han sido medidas.
- Cabe en GPU consumer: si, en RTX 3090 (24 GB) y previsiblemente en RTX 4090 (24 GB), aunque esta ultima no esta medida.
- Opciones de despliegue: exclusivamente NInfer, rama `master` de `iamwavecut/ninfer-all`; las builds estandar de NInfer rechazan este fichero. La torre de vision requiere el commit `877fe16e` o posterior.
- Latencia y throughput: no disponibles; la decodificacion especulativa via MTP (`--spec mtp`) esta orientada a reducir la latencia de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP-NInfer-v3 | 26B totales / ~4B activos | no disponible | Si | `.ninfer` v3 | gemma | NInfer (rama `ninfer-all`) |
| HauhauCS/Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP (base) | 26B totales / ~4B activos | no disponible | Si | GGUF | gemma | llama.cpp y derivados |
| google/gemma-4-26B-A4B-it | 26B totales / ~4B activos | no disponible | Si | safetensors | gemma | Transformers, vLLM, TGI |

La diferencia principal del artefacto de WaveCut frente al release de HauhauCS es el empaquetado unico de texto, MTP y vision en formato `.ninfer`, la plantilla de chat actualizada de Google y la correccion de glitch tokens. Frente al modelo oficial de Google, elimina rechazos y aplica QAT a Q4_K_M. No se dispone de datos de rendimiento comparativo entre las tres variantes.

## Limitaciones y advertencias

- Dependencia estricta del motor NInfer en su rama `ninfer-all`: las builds estandar rechazan el fichero, lo que limita la portabilidad a vLLM, llama.cpp, Ollama o TGI.
- Soporte de vision solo desde el commit `877fe16e`; versiones anteriores no cargan la torre de vision.
- Las builds para RTX 40 y RTX 50 compilan pero no han sido medidas; el rendimiento en esas GPUs es desconocido.
- Modelo "uncensored": los rechazos han sido eliminados, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin filtros de seguridad del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- La correccion de glitch tokens no es completa: reproduce 25 de 30 cadenas problematicas, no las 30.
- La licencia `gemma` impone las condiciones de uso de Google para la familia Gemma; es necesario revisar sus restricciones antes de un uso comercial.
- El `repeat_penalty 1.1` recomendado por el release no tiene equivalente en NInfer; solo pueden aplicarse penalizaciones de presencia o frecuencia.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Longitud de contexto no disponible en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP-NInfer-v3
- Modelo base: https://huggingface.co/HauhauCS/Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP
- Modelo oficial de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit de soporte de vision: https://github.com/iamwavecut/ninfer-all/commit/877fe16eff19734d19e86083d2e227048608af8c
- Documentacion de conversion Gemma 4: https://github.com/iamwavecut/ninfer-all/blob/master/docs/gemma4.md#converting
