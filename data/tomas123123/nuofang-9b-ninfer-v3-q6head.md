# tomas123123/nuofang-9b-ninfer-v3-q6head

## Resumen

`tomas123123/nuofang-9b-ninfer-v3-q6head` es un artefacto de conversión de formato para el motor de inferencia NInfer, no un modelo entrenado desde cero. Deriva 1:1 de `nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored`, un modelo de 9.190 millones de parámetros (9,19 B) obtenido por fusión SLERP de dos derivados de Qwen3.5-9B: un destilado de Qwen3.8 con eliminación de censura (heretic) y un ajuste especializado en escritura creativa. El autor del artefacto, `tomas123123`, se limita a recodificar los tensores en el contenedor propietario de NInfer con una asignación de precisión mixta (Q4/Q5/Q6/Q8 según el tensor) y a validar su funcionamiento en una RTX 3090.

El modelo está orientado explícitamente a contenido para adultos (NSFW), escritura de novela china y role-play, sin alineación de seguridad ni evaluación de tasa de rechazo. Su interés técnico no está en la calidad del modelo base, sino en la demostración de que la arquitectura híbrida de Qwen3.5-9B (24 capas de atención lineal GDN y 8 de atención completa) puede servirse con una ventana de contexto nativa de 262.144 tokens en una única GPU de consumo de 24 GB, manteniendo velocidades de decodificación de 79 a 132 tok/s según la longitud del contexto.

Es relevante ahora porque combina tres elementos poco habituales en modelos de 9B: contexto de 256K real (verificado a 253.783 tokens sin truncamiento), un formato de cuantización mixta que reduce el peso a 5,93 GB, y un motor comunitario (NInfer) que compite en velocidad con llama.cpp en el mismo hardware. La contrapartida es que el motor no está soportado oficialmente, solo se ha probado en sm_86 y la licencia Apache-2.0 del contenedor no resuelve los problemas legales del contenido NSFW generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B hybrid: 32 capas (24 linear_attention GDN + 8 full_attention, `full_attention_interval=4`), hidden 4096, más una capa MTP |
| Parametros totales | 9.197.093.888 (9,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos (`max_position_embeddings`); verificado a 253.783 tokens sin truncamiento |
| Tipos de cuantizacion | Mixta por tensor: `q4_g64_fp16` (gate/up), `q5_g64_fp16` (resto de proyecciones), `q6_g64_fp16` (embedding y cabeza de salida), `q8_g32_fp16` (cabeza MTP); norm, RoPE y `A_log`/`dt_bias` en bf16/fp32 |
| Idiomas soportados | Chino (principal), inglés (capacidad heredada de la base) |
| Licencia | apache-2.0 |
| Formato de pesos | Contenedor propietario `.ninfer` (5.935.874.304 bytes, 403 objetos); no se distribuye en safetensors ni GGUF |
| Vocabulario | 248.320 tokens |
| Componentes | `text` + `mtp` (cabeza MTP de una capa); sin torre de visión |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura híbrida de Qwen3.5-9B: 32 capas en las que 24 usan atención lineal con Gated DeltaNet (GDN) y 8 usan atención completa estándar, intercaladas cada cuatro capas. Esta mezcla reduce el coste de memoria de la caché KV en contextos largos, ya que solo las 8 capas de atención completa almacenan KV clásica. El vocabulario es de 248.320 tokens y la dimensión oculta de 4096. Incluye una cabeza MTP (multi-token prediction) de una sola capa, pensada para decodificación especulativa.

El entrenamiento del modelo original no está documentado en la información disponible más allá de la cadena de fusión: un destilado completo de Qwen3.8 sobre la arquitectura Qwen3.5-9B con eliminación de censura (`petruhonk/Qwen3.8-9B-Distill-uncensored-heretic`), fusionado por SLERP con un ajuste de escritura creativa (`DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic`). La destilación de origen proviene de `empero-ai/Qwen3.8-9B-Distill`. No consta RLHF, DPO ni datos de alineación posteriores. La conversión a NInfer no añade entrenamiento: solo recodifica cada tensor según su grupo de precisión, con un tiempo de CPU de unos 130 segundos usando la receta `qwen3_6_27b` de la herramienta oficial `tools/convert`.

La decisión técnica más destacable del artefacto es el uso de Q6 en la cabeza de salida en lugar de Q8: la tabla de formas del kernel q8 del fork de NInfer no incluye la forma `n248320_k4096`, y un vocabulario en Q8 provoca un error `unsupported shape` al arrancar. El coste de bajar a Q6 es de aproximadamente 0,5 GB.

## Capacidades

- Generación de texto largo en chino, orientada a novela web y narrativa serializada.
- Role-play conversacional multi-turno con contexto muy extenso.
- Escritura creativa en inglés con estilo heredado del ajuste Bradbury F451.
- Redacción de prosa sin alineación de seguridad (modelo "uncensored"), incluyendo contenido NSFW.
- Manejo de contextos de hasta 253.783 tokens verificados, útil para continuaciones de novelas completas o historiales de conversación muy largos.
- Cabeza MTP disponible para decodificación especulativa, aunque en la práctica rinde peor que la decodificación normal (ver sección de rendimiento).
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente, razonamiento multi-paso estructurado ni modo thinking (`--no-thinking` en la configuración recomendada).
- Sin visión: no hay torre visual en el contenedor.
- Sin soporte de audio.

## Casos de uso

- **Continuación de novelas web chinas**: el modelo puede recibir capítulos completos de decenas de miles de tokens como contexto y continuar la narración manteniendo coherencia de personajes y trama, gracias a la ventana de 262.144 tokens y a la velocidad sostenida de 79 tok/s incluso a ventana completa.
- **Role-play de larga duración**: sesiones de chat con historial de más de 100.000 tokens sin necesidad de resumir ni truncar, gracias a la caché KV en int8 (unos 16 KiB por token en las 8 capas de atención completa) y a los 10,1 GB de VRAM en el peor caso.
- **Generación de ficción para adultos en un entorno local**: el modelo está explícitamente desafinado en censura, por lo que puede emplearse en un servidor propio con control total de los datos, sin depender de API externas que apliquen filtros.
- **Prototipado de motores de inferencia**: el artefacto sirve como banco de pruebas para comparar NInfer frente a llama.cpp con pesos equivalentes; el autor reporta 132,4 frente a 76,8 tok/s en el mismo hardware y cuantización comparable.
- **Investigación sobre arquitecturas híbridas de atención**: permite medir el comportamiento real de la combinación GDN + atención completa en contextos de 256K sobre una GPU de consumo, algo poco accesible con modelos densos equivalentes.
- **Generación de guiones y diálogos para videojuegos narrativos**: la ventana larga permite inyectar el "bible" completo de personajes y tramas previas como contexto fijo, y el throughput de 122 tok/s a 29.000 tokens es suficiente para respuestas interactivas en tiempo real.
- **Servicio local de escritura asistida en chino**: con `--default-max-tokens 6144` y una plantilla de chat Jinja, puede exponerse como endpoint compatible con `/v1/models` para integrarse en editores o herramientas de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son de rendimiento de inferencia en una RTX 3090 de 24 GB con caché KV en int8, `--no-thinking` y sin MTP:

| Contexto (tokens) | Prefill (tok/s) | Decode (tok/s) | VRAM |
|---|---:|---:|---:|
| 903 | 1.750 | 132,4 | no disponible |
| 29.033 | 3.390 | 122,4 | no disponible |
| 253.783 (ventana completa) | 2.230 (TTFT 1 min 54 s) | 79,3 | 10,1 GB |

Comparativa en el mismo hardware y pesos equivalentes:

| Motor | Contexto 903 | Contexto 29.033 | Contexto 253.783 |
|---|---:|---:|---:|
| NInfer v3 (este artefacto) | 132,4 tok/s | 122,4 tok/s | 79,3 tok/s |
| llama.cpp b12470 + GGUF Q8_0 | 76,8 tok/s | 64,9 tok/s | 25,2 tok/s |

Decodificación especulativa con MTP (`--spec mtp --draft-tokens 3`): tasa de aceptación del 28,7 %, decode de 120,4 tok/s, es decir, más lento que sin MTP. El autor recomienda no activarlo.

## Requisitos de hardware

- VRAM: 10,1 GB en el peor caso medido (ventana completa de 253.783 tokens, KV int8). El archivo pesa 5,93 GB, por lo que en contextos cortos el consumo es notablemente menor.
- GPU probada: RTX 3090 (sm_86) con 24 GB. Es la única configuración validada.
- GPU no validadas: arquitecturas Ada (RTX 40xx) y Blackwell (RTX 50xx) no han sido probadas; el binario distribuido es específico para sm_86.
- Cabe en GPUs de consumo con al menos 12 GB si se reduce `--kv-capacity`, ya que la caché KV int8 ocupa unos 16 KiB por token en las 8 capas de atención completa.
- Motor de despliegue: NInfer (`ninfer-serve.exe`), distribuido como `ninfer-serve-sm86-win-x64.zip` en la página de Releases del repositorio del proyecto. Requiere CUDA 13.3 (`cublasLt64_13.dll`, `cublas64_13.dll`, `cudart64_13.dll`) y bibliotecas de FFmpeg (`avcodec-63`, `avformat-63`, `avutil-61`, `swscale-10`, `swresample-7`).
- No compatible con vLLM, llama.cpp, Ollama ni TGI: el formato `.ninfer` es propietario.
- Throughput medido: prefill de 1,75k a 3,39k tok/s; decode de 132,4 tok/s (contexto corto) a 79,3 tok/s (ventana completa).
- Latencia de primer token a ventana completa: 1 minuto y 54 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (nuofang-9B NInfer v3 Q6) | 9,19 B | 262.144 | `.ninfer`, motor NInfer (sm_86) | Apache-2.0 | 0 descargas, 0 likes; solo Windows x64 sm_86 |
| `nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored` | 9 B (no detallado) | no disponible | safetensors (presumible) | no disponible | modelo base directo del que deriva este artefacto |
| `dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-Novel` | 27 B (según el autor) | no disponible | no disponible | no disponible | citado por el autor como referencia de mayor calidad en novela NSFW |
| `DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic` | 9 B (arquitectura Qwen3.5-9B) | no disponible | no disponible | no disponible | uno de los dos padres de la fusión SLERP |

El propio autor reconoce que la calidad en novela web china del tramo de 9B es inferior a la del tramo de 27B, y que la ventaja de este artefacto es la combinación de ventana de 256K y 132 tok/s en una sola tarjeta de 24 GB.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo está desafinado en censura y orientado a material para adultos. No debe usarse para contenido con menores ni para fines ilegales en la jurisdicción del usuario.
- Sin evaluación de seguridad ni de tasa de rechazo: no se han publicado métricas de alineación, sesgo o toxicidad.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fidelidad factual ni de razonamiento.
- Solo probado en sm_86 (RTX 3090). En Ada o Blackwell el binario puede no arrancar o rendir de forma distinta.
- El motor NInfer proviene de un fork comunitario sin soporte oficial (0 estrellas en el repositorio del proyecto). Cambiar el nivel de cuantización puede provocar errores `unsupported shape`.
- El contenedor no incluye el motor: hay que descargarlo por separado desde GitHub Releases, junto con las DLL de CUDA 13.3 y FFmpeg.
- La licencia Apache-2.0 cubre el artefacto de conversión, pero no aclara la situación de los pesos fusionados de origen ni de los datos de entrenamiento de los modelos padres; conviene revisar las licencias de cada eslabón de la cadena antes de un uso comercial.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado.
- Sin tool calling ni capacidades de agente: no es adecuado para pipelines que requieran function calling estructurado.
- Sin visión ni audio.
- La cabeza MTP no aporta mejoras en la práctica (28,7 % de aceptación, decode más lento).
- El formato propietario impide migrar a otros motores sin reconvertir desde el modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tomas123123/nuofang-9b-ninfer-v3-q6head
- Página del proyecto y Releases del motor NInfer: https://github.com/qianchong666/nuofang-9b-ninfer-v3
- Modelo base directo: https://huggingface.co/nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored
- Padre de fusión A: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Padre de fusión B: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
- Origen de la destilación: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Arquitectura base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de 27B citada por el autor: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-Novel
