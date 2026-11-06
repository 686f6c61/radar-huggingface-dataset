# StillDeadcode/qwen3.8-27b-iqr-v3

## Resumen

Qwen3.8-27B IQR-V3 es una colección de contenedores de cuantización del modelo Qwen/Qwen3.8-27B, publicado por el usuario StillDeadcode en Hugging Face. No es un modelo nuevo en sí, sino un repositorio que reúne, en un único archivo `.rad` por variante, todas las cuantizaciones del formato IQR-V3 del motor de inferencia **radiance**, diseñado para GPUs AMD RDNA4 bajo ROCm. Cada contenedor integra además la torre de visión en bf16 y el draft model z-lab/Qwen3.8-27B-DFlash2 para decodificación especulativa.

El problema que resuelve es doble: por un lado, ofrecer cuantizaciones de muy baja anchura (desde 2,5 bits por peso) con pérdida de calidad medida y controlada (KL frente al modelo bf16); por otro, simplificar el despliegue, ya que cada archivo `.rad` es autónomo e incluye tablas de codebooks, drafter y torre de visión, sin necesidad de descargas separadas.

Es relevante porque IQR-V3 mejora entre un 2 % y un 11 % en KL respecto a IQR-V2 a igual tamaño, y porque la variante IQ4R-L-V3 queda por debajo del KL del checkpoint oficial FP8 ocupando solo el 55 % de su tamaño. El modelo base es multimodal (imagen-texto a texto), con 262.144 tokens de contexto entrenados y 200K probados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión de 27 bloques; incluye drafter block-diffusion DFlash2 |
| Parametros totales | 27B (modelo base Qwen3.8-27B); tamaño exacto no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens entrenados; 200K probados |
| Tipos de cuantizacion | IQR-V3 de 2,5 a 8 bits por peso (mezcla de trellises de 2 a 7 bits y rejilla int8 por bandas de capas); activaciones int8 bajo rotación; drafter en OCP-MXFP4 y head de vocabulario en códigos de 2 bits; torre de visión en bf16 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedores `.rad` (formato trellis de radiance); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La cuantización IQR-V3 aplica una rotación de Hadamard de 128 puntos a cada lineal del tronco del modelo y ajusta los pesos mediante GPTQ contra matrices de Hessians de calibración. Los códigos resultantes forman un trellis de "tail-biting" por columna con 2^16 estados, cuyos valores se calculan a partir del estado bajo una escala f32 por fila. La clave práctica es que el GEMM descodifica los códigos dentro de su tile de cómputo, sin ensanchar nada en memoria, lo que evita el coste habitual de descomprimir los pesos.

El repositorio no documenta el entrenamiento del modelo base (Qwen3.8-27B de Qwen), solo la conversión de cuantización: cada archivo es una mezcla de bases por anchura elegida al tamaño de su gemelo IQR-V2, con recetas incluidas en `recipes/`. La calidad se valida midiendo la divergencia KL contra la distribución del modelo bf16 sobre 1,05 millones de posiciones escritas por modelo (split privado del radiance quantisation challenge). La decodificación especulativa usa DFlash2 como drafter; como los borradores se verifican contra el modelo principal, nunca alteran la salida, solo la velocidad.

## Capacidades

- Generación de texto y chat multimodal: acepta imágenes y vídeo como partes `image_url` / `video_url` en mensajes de chat, gracias a la torre de visión de 27 bloques en bf16.
- Contexto muy largo: 262.144 tokens entrenados, 200K validados en despliegue, con caché KV en fp8 opcional.
- Decodificación especulativa integrada: el drafter DFlash2 (lineales en OCP-MXFP4, head de vocabulario en códigos de 2 bits con re-puntuación de los 32 candidatos principales) acelera la inferencia sin cambiar la salida; la profundidad se elige automáticamente o se fija con `--num-speculative-tokens`.
- API compatible con OpenAI: endpoints `/v1/chat/completions` y `/v1/completions`.
- Tool calling y salida estructurada soportados por el servidor de radiance.
- Despliegue multi-GPU con paralelismo tensorial (`--tp`).

## Casos de uso

- Chatbots multimodales con documentos visuales: el servidor acepta imágenes y vídeo directamente en los mensajes de chat, lo que permite construir asistentes que analizan capturas, gráficos o clips sin orquestación externa.
- Procesamiento de contextos muy largos: con 200K tokens probados y caché KV en fp8, es adecuado para resumir o interrogar repositorios de código, contratos largos o colecciones de documentos en una sola petición.
- Servicios de inferencia de bajo coste en hardware AMD: las variantes de 2,5–3,8 bpw caben en una sola GPU de 32 GB (RDNA4, ROCm), abaratando el despliegue de un modelo de 27B.
- Servidores con API OpenAI para productos existentes: la compatibilidad con `/v1/chat/completions`, tool calls y salida estructurada permite sustituir un backend comercial sin cambiar el cliente.
- Inferencia de alto throughput: la decodificación especulativa con DFlash2 y el soporte de hasta 8 secuencias concurrentes (`--max-num-seqs 8`) sirven para cargas de producción con varios usuarios.
- Agentes con herramientas: el soporte de tool calling nativo permite integrarlo en pipelines de agentes multi-paso que combinan razonamiento textual y análisis de imágenes.
- Investigación en cuantización: las recetas en `recipes/`, los codebooks y el report técnico de IQR-V3 lo hacen útil como referencia reproducible para estudiar cuantización trellis.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La métrica publicada es la divergencia KL media contra el modelo bf16 sobre el split privado del radiance quantisation challenge (1,05M posiciones), junto con el accuracy top-1:

| Archivo | bpw | KL medio | Top-1 | KL de IQR-V2 equivalente | Mejora KL |
|---|---:|---:|---:|---:|---:|
| `qwen3.8-27b-iq2r-v3.rad` | 2,465 | 0,06807 | 90,54 % | 0,07303 | −7 % |
| `qwen3.8-27b-iq2r-l-v3.rad` | 2,786 | 0,04241 | 92,62 % | 0,04698 | −10 % |
| `qwen3.8-27b-iq3r-s-v3.rad` | 3,145 | 0,02584 | 94,02 % | 0,02798 | −8 % |
| `qwen3.8-27b-iq3r-v3.rad` | 3,459 | 0,01698 | 95,35 % | 0,01880 | −10 % |
| `qwen3.8-27b-iq3r-l-v3.rad` | 3,798 | 0,01129 | 96,16 % | 0,01198 | −6 % |
| `qwen3.8-27b-iq4r-s-v3.rad` | 4,131 | 0,00762 | 96,90 % | 0,00832 | −8 % |
| `qwen3.8-27b-iq4r-v3.rad` | 4,458 | 0,00512 | 97,45 % | 0,00562 | −9 % |
| `qwen3.8-27b-iq4r-l-v3.rad` | 4,783 | 0,00342 | 97,86 % | 0,00377 | −9 % |
| `qwen3.8-27b-iq5r-s-v3.rad` | 5,064 | 0,00249 | 98,15 % | 0,00273 | −9 % |
| `qwen3.8-27b-iq5r-v3.rad` | 5,422 | 0,00182 | 98,38 % | 0,00204 | −11 % |
| `qwen3.8-27b-iq6r-s-v3.rad` | 6,049 | 0,00106 | 98,83 % | 0,00115 | −8 % |
| `qwen3.8-27b-iq6r-v3.rad` | 6,372 | 0,00088 | 98,93 % | 0,00094 | −6 % |
| `qwen3.8-27b-iq6r-l-v3.rad` | 6,939 | 0,00072 | 99,04 % | 0,00073 | −2 % |
| `qwen3.8-27b-iq7r-v3.rad` | 7,420 | 0,00060 | 99,12 % | 0,00061 | −2 % |
| `qwen3.8-27b-iq8r-v3.rad` | 8,040 | 0,00047 | 99,18 % | 0,00047 | 0 % |

Dato destacado: IQ4R-L-V3 (4,783 bpw) queda por debajo del KL del checkpoint oficial FP8 (0,00389) ocupando el 55 % de su tamaño.

## Requisitos de hardware

- Motor de inferencia: exclusivamente **radiance 1.15.0 o superior** (las versiones 1.14.0 y anteriores rechazan estos archivos); requiere kernels IQR-V3 y el plugin `qwen35_w8a8`.
- Hardware objetivo: GPUs AMD RDNA4 con ROCm. No hay soporte documentado para NVIDIA ni CPU.
- VRAM: los archivos más pequeños (2,465–3,798 bpw) caben en una sola GPU de 32 GB con `--tp 1`. Para archivos mayores o contextos largos se recomienda `--tp 2` (dos tarjetas). El tamaño del repositorio completo es de 300,7 GB (15 contenedores).
- Configuración de ejemplo del autor: `radiance --model qwen3.8-27b-iq4r-v3.rad --tp 2 --max-model-len 200000 --kv-cache-dtype fp8 --max-num-seqs 8`.
- Despliegue: servidor propio de radiance con API OpenAI. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se indica solo que la decodificación especulativa con DFlash2 mejora la velocidad sin alterar la salida.

## Comparativa con modelos similares

| | Qwen3.8-27B IQR-V3 (este repo) | Checkpoint FP8 oficial de Qwen3.8-27B | Qwen3.8-27B IQR-V2 |
|---|---|---|---|
| Formato | `.rad` (trellis IQR-V3) | FP8 | `.rad` (trellis IQR-V2) |
| bpw mínimo/máximo | 2,465 / 8,040 | 8 bits | 2,465 / 8,040 aprox. |
| KL medio en 4,5 bpw aprox. | 0,00512 (IQ4R) | 0,00389 (a 8 bits) | 0,00562 (IQ4R V2) |
| KL en 4,78 bpw | 0,00342 (IQ4R-L) | 0,00389 | 0,00377 |
| Drafter integrado | Sí (DFlash2) | no disponible | Sí (según el autor) |
| Visión | Sí (bf16) | no disponible | Sí |
| Hardware | AMD RDNA4 / ROCm (radiance ≥1.15.0) | no disponible | radiance |
| Licencia | Apache 2.0 | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- Dependencia de un ecosistema cerrado: los archivos `.rad` solo funcionan con el motor radiance (≥1.15.0) en GPUs AMD RDNA4; no sirven en vLLM, llama.cpp, Ollama, TGI ni en hardware NVIDIA.
- Métricas de calidad limitadas: la calidad se mide solo con KL y top-1 contra el modelo bf16; no hay benchmarks de tareas downstream (razonamiento, código, matemáticas) publicados para estas cuantizaciones, por lo que la calidad real en cada tarea debe validarse por el usuario.
- Sesgos y alucinaciones: heredan los del modelo base Qwen3.8-27B; no se documenta ningún análisis de sesgos específico. Las cuantizaciones más agresivas (2,4–3,1 bpw) muestran KL notablemente superiores (hasta 0,068), lo que anticipa degradación apreciable.
- Contexto: los 262.144 tokens son el límite entrenado; el autor valida solo 200K en despliegue.
- Idiomas soportados: no documentados en la model card.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones destacables.
- Proyecto de autor individual: el repositorio tiene 0 descargas y 3 likes en el momento de la ficha, y depende de un motor de inferencia de terceros (radiance, del mismo autor); conviene evaluar la madurez y el mantenimiento antes de uso en producción.
- La configuración de conversión requiere ejecutar `rad-convert` desde el directorio que contiene `data/` si se regeneran los archivos, aunque servir los contenedores publicados no necesita nada adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/StillDeadcode/qwen3.8-27b-iqr-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft model: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Report técnico IQR-V3: https://radiance.stilldeadco.de/whitepapers/iqr-v3.pdf
- Leaderboard del radiance quantisation challenge: https://radiance.stilldeadco.de/leaderboard/
