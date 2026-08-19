# twolven/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-AWQ-MTP

## Resumen

Este repositorio contiene una cuantización AWQ W4A16 del modelo `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`, un fine-tune "uncensored" del Qwen3.8-27B de Alibaba, con la cabeza nativa NextN/MTP (Multi-Token Prediction) preservada para decodificación especulativa bajo vLLM. El autor, twolven, reconstruyó un checkpoint BF16 en safetensors a partir del GGUF original (que solo se publicó en formato GGUF) y lo cuantizó a 4 bits con `llm-compressor`, manteniendo la torre de visión y la cabeza MTP en bf16.

El modelo base Qwen3.8-27B es un LLM multimodal denso de 27.356 millones de parámetros con arquitectura híbrida: 48 de sus 64 capas decoder usan atención lineal `Qwen3_5GatedDeltaNet` y 16 usan atención completa, más una torre de visión de 27 capas. Soporta contexto largo (262K tokens según la documentación del modelo base) y entrada de imágenes. Esta versión cuantizada ocupa 19,6 GB en disco y está pensada para ejecutarse en GPUs de consumo como 2xRTX 3090 con vLLM, manteniendo la decodificación especulativa gracias a la cabeza MTP.

La relevancia de este modelo radica en que combina tres características difíciles de encontrar juntas: perfil "uncensored" (con menos rechazos), capacidades multimodales y decodificación especulativa funcional en una cuantización de 4 bits. Es una opción práctica para desarrolladores que necesitan un modelo local de 27B con tool calling, visión y contexto largo en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida: 64 capas decoder (48 `Qwen3_5GatedDeltaNet` de atencion lineal + 16 de atencion completa, capa N completa si N%4==3), torre de vision de 27 capas, cabeza MTP/NextN |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (segun documentacion del modelo base); verificado hasta 229.200 tokens en pruebas de needle retrieval |
| Tipos de cuantizacion | AWQ W4A16 asimetrico, group size 128, duo_scaling, formato compressed-tensors pack-quantized; el modelo base existe en GGUF (Q8_K_P, etc.) |
| Idiomas soportados | Ingles (declarado en metadata); el modelo base Qwen3.8-27B puede soportar mas, pero esta version solo declara en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.8-27B, un modelo hibrido que combina atencion lineal (48 capas `Qwen3_5GatedDeltaNet`) con atencion completa (16 capas, una cada cuatro), mas una torre de vision de 27 capas para entrada de imagenes y una cabeza MTP embebida para decodificacion especulativa. El fine-tune "uncensored" de HauhauCS aplica tecnicas de abliteracion para reducir rechazos, y se publico originalmente solo en GGUF.

Este repositorio concreto es el resultado de un proceso de reconstruccion y cuantizacion: se de-cuantizo el GGUF Q8_K_P (29,3 GiB) a un checkpoint BF16 en safetensors (52 GB), invirtiendo tres convenciones de almacenamiento de llama.cpp (RMSNorm con +1 plegado, `ssm_a` = `-exp(A_log)`, y orden de cabezas de valor agrupadas), y luego se cuantizo a W4A16 con `llm-compressor` usando `AWQModifier` + `QuantizationModifier`, calibrado con 128 muestras de `HuggingFaceH4/ultrachat_200k` a 1024 tokens. La torre de vision, `lm_head`, los escalares `in_proj_a`/`in_proj_b` de las capas de atencion lineal y la cabeza MTP se dejaron en bf16. La de-cuantizacion se hizo en fp32 para evitar errores de redondeo en los pesos de normalizacion.

## Capacidades

- Generacion de texto y razonamiento multi-step: verificado con pruebas de coherencia (5/5 hechos comprobables) y razonamiento aritmetico multi-paso.
- Vision por computadora: entrada de imagenes a traves de la torre de vision de 27 capas; verificado con 3/3 aciertos en reconocimiento de formas y colores de una imagen sintetica.
- Tool calling / function calling: soportado y verificado tanto en modo streaming como no streaming, sin fuga de etiquetas en streaming.
- Decodificacion especulativa con MTP: la cabeza NextN/MTP esta preservada y activa bajo vLLM, con tasa de aceptacion del 64,9% y longitud media aceptada de 2,95 de 4 tokens.
- Contexto largo: needle retrieval superado a 29.374, 117.374 y 229.200 tokens de prompt.
- Perfil "uncensored": 0 rechazos en 2 pruebas de contenido sensible.
- Multilingue: solo ingles declarado en esta version.

## Casos de uso

- Despliegue local de un LLM multimodal en hardware de consumo: con 19 GB en disco y 9,66 GiB de pesos por GPU, cabe en 2xRTX 3090 (TP=2) dejando espacio para una cache KV de 560.900 tokens en fp8, lo que permite ejecutar un modelo de 27B con vision y contexto largo sin recurrir a la nube.
- Agentes autonomos con tool calling: el soporte verificado de function calling en streaming y no streaming permite construir agentes que llaman APIs, consultan bases de datos o ejecutan acciones, con razonamiento multi-step para planificar tareas complejas.
- Analisis de documentos largos con imagenes: la combinacion de contexto de 262K tokens y entrada de vision permite procesar informes extensos con diagramas, capturas o graficos, extrayendo informacion de miles de paginas en una sola pasada.
- Generacion de codigo en entornos de desarrollo: el modelo base Qwen3.8-27B destaca en tareas de coding (DeepSWE 42,2 segun la guia de Lovableapp), y esta version cuantizada mantiene esa capacidad con un rendimiento de 95,6 t/s, adecuado para autocompletado o generacion asistida en editores.
- Investigacion sobre alineacion y "uncensoring": al ser un modelo con perfil de menos rechazos, es util para estudiar tecnicas de abliteracion, medir diferencias de comportamiento frente al modelo original y evaluar riesgos de sesgo o contenido inapropiado en entornos controlados.
- Automatizacion de oficina: el modelo base esta orientado a office automation (segun el repositorio oficial de Alibaba), por lo que puede redactar correos, resumir actas, extraer datos de imagenes escaneadas o generar presentaciones, aprovechando la vision y el contexto largo.
- Prototipado rapido con vLLM: al estar en formato compressed-tensors compatible con vLLM, se puede integrar directamente en pipelines de inferencia existentes sin conversiones adicionales, ideal para pruebas de concepto y evaluaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. La model card indica explicitamente que no se ejecutaron este tipo de pruebas. Los unicos datos de rendimiento son funcionales y de velocidad, medidos en 2xRTX 3090 (TP=2) con vLLM nightly, cache KV en fp8 y MTP n=3:

| Prueba | Resultado |
|---|---|
| Coherencia (5 hechos comprobables, greedy) | 5/5 |
| Razonamiento aritmetico multi-paso | Correcto |
| Vision (3 formas y colores de imagen sintetica) | 3/3 |
| Tool calling no streaming | Correcto |
| Tool calling streaming | Correcto, sin fuga de etiquetas |
| Needle retrieval a 29.374 tokens | Correcto (19 s) |
| Needle retrieval a 117.374 tokens | Correcto (96 s) |
| Needle retrieval a 229.200 tokens | Correcto (231 s) |
| Perfil uncensored | 0 rechazos en 2 pruebas |

Velocidad de generacion (single-user, thinking desactivado, 600 tokens):

| Configuracion | Mediana | Mejor |
|---|---|---|
| Este build (AWQ W4A16 + MTP) | 95,6 t/s | 96,3 t/s |
| Qwen3.8-27B-abliterated W4A16 (mismo equipo, mismas opciones) | 84,0 t/s | 93,0 t/s |

La tasa de aceptacion MTP es del 64,9% con longitud media aceptada de 2,95 de 4 tokens, lo que explica la ventaja de velocidad sobre el build de comparacion.

## Requisitos de hardware

- VRAM estimada: 9,66 GiB de pesos por GPU en configuracion TP=2 con 2xRTX 3090 (24 GB cada una), dejando espacio para una cache KV de 560.900 tokens en fp8. En una sola GPU de 24 GB cabria con contexto reducido; en GPUs de 16 GB probablemente se necesitaria una cuantizacion mas agresiva o contexto muy limitado.
- GPU recomendadas: 2xRTX 3090 (configuracion validada), 2xRTX 4090, A100 40/80 GB, H100. Cualquier GPU con al menos 24 GB de VRAM puede ejecutar el modelo con contexto moderado.
- Cabe en GPUs de consumo: si, en 2xRTX 3090 o 2xRTX 4090 con vLLM y TP=2.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo de MTP y compressed-tensors), llama.cpp (para el modelo base GGUF), TGI (si soporta compressed-tensors), o transformers con carga clasica.
- Latencia y throughput: 95,6 t/s de mediana en 2xRTX 3090 con MTP activo y cache KV fp8, para generaciones de 600 tokens en single-user.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-Uncensored-AWQ-MTP) | 27,36B | 262K | AWQ W4A16 | Apache 2.0 | Multimodal, MTP preservado, perfil uncensored |
| Qwen3.8-27B-abliterated W4A16 | 27,36B | 262K | AWQ W4A16 | Apache 2.0 | Multimodal, sin MTP, perfil uncensored; 84,0 t/s mediana en el mismo equipo |
| Qwen3.8-27B (original, de Alibaba) | 27,36B | 262K | BF16 / FP8 | Apache 2.0 | Multimodal, sin perfil uncensored, sin MTP en versiones estandar |
| HauhauCS/Qwen3.8-27B-Uncensored-Aggressive-MTP-GGUF | 27,36B | 262K | GGUF (Q8_K_P, etc.) | Apache 2.0 | Modelo base de este build, solo GGUF, con MTP |

La principal diferencia frente a la version abliterated es la presencia de la cabeza MTP, que aporta una mejora de velocidad de ~11 t/s de mediana. Frente al modelo original de Alibaba, la diferencia es el perfil uncensored y la cuantizacion de 4 bits, a costa de un posible error adicional por la doble cuantizacion.

## Limitaciones y advertencias

- Es una cuantizacion de una cuantizacion: los pesos provienen de de-cuantizar un GGUF Q8_K_P a BF16 y luego cuantizar a W4A16, por lo que el error de la cuantizacion de 8 bits esta incorporado y se compone con el de 4 bits. Si HauhauCS publica algun dia safetensors BF16 originales, un build hecho desde esos pesos seria preferible.
- La reconstruccion se valido numericamente contra otro fine-tune del mismo base, no contra los pesos originales. La correlacion (+0,99998 en tensores de atencion lineal) confirma la disposicion y convencion, pero no la identidad de los pesos.
- Solo se declara ingles en la metadata; el uso en otros idiomas no esta verificado.
- El perfil "uncensored" implica menos rechazos, lo que puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para aplicaciones orientadas al publico general sin moderacion adicional.
- No se han ejecutado benchmarks estandarizados de calidad (MMLU, GSM8K, HumanEval, etc.), por lo que no hay datos objetivos de rendimiento academico o de codigo para esta cuantizacion concreta.
- Riesgo de alucinacion inherente a los LLM, especialmente en tareas de razonamiento o hechos especificos; las pruebas de coherencia solo cubren 5 hechos.
- Si se re-cuantiza el modelo, hay que anadir manualmente `re:.*mtp.*` y `re:mtp\..*` a `quantization_config.ignore`, o vLLM fallara con `KeyError: 'weight'` en `qwen3_5_mtp.py`.
- La cabeza MTP solo funciona bajo vLLM; otros motores de inferencia ignoraran la decodificacion especulativa.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/twolven/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-AWQ-MTP
- Modelo base GGUF (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia completa de Qwen3.8-27B (Lovableapp): https://lovableapp.org/blog/qwen3-8-27b
- Analisis de la abliteracion AEON (Mindstudio): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Pagina del modelo en Wiro AI: https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
