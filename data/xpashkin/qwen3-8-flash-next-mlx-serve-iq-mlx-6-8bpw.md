# xpashkin/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-6.8bpw

## Resumen

Esta ficha describe `xpashkin/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-6.8bpw`, una cuantización con calibración imatrix del modelo `Qwen/Qwen3.8-Flash-Next` publicada por el usuario xpashkin en formato MLX para el servidor `mlx-serve`. No es un modelo entrenado desde cero: es un empaquetado de pesos de un MoE de 134.950.835.462 parámetros totales (~135B, el autor cita 133B para el base), con 48 capas, 512 expertos por capa y atención híbrida GDN + QSA sparse, comprimido a 6,788 bits por peso efectivos.

Su relevancia es práctica: permite ejecutar un MoE de esa escala en un Apple Silicon con 128 GB de memoria unificada, con ~110 GB residentes y una ventana de 262.144 tokens. El coste de caché es bajo porque las 36 capas GDN mantienen un estado SSM constante y solo las 12 capas QSA guardan KV por token (~28 KB/token, 7,28 GB para el contexto completo en bf16).

El pack incluye torre de visión (Qwen3-VL ViT) y cabeza MTP para decodificación especulativa, y se sirve con API compatible con OpenAI y Anthropic. Es un artefacto de un solo autor, sin descargas ni validación comunitaria en el momento de la consulta, y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (familia Qwen4, etiqueta `qwen4_exp`): 48 capas, 512 expertos por capa, shared expert, router, hyper-connections; atención híbrida GDN (36 capas, estado SSM constante) + QSA sparse attention (12 capas); cabeza MTP de 1 capa inline en el tronco |
| Parametros totales | 134.950.835.462 (~135B) según safetensors; la model card cita 133B para el modelo base y usa 128.351B en el cálculo de bpw del tronco |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados; máximo validado con prompt real: 260.451 tokens |
| Tipos de cuantizacion | 6,788 bpw efectivos: expertos en affine gs64 con 6-bit en 88 grupos y 8-bit en 8 grupos (capas 5, 20, 23, 26, 27, 28, 33, 38); superficie no-experta (GDN qkv/z/a/b/out, QSA q/k/v/o + indexer, hyper-connections, shared expert, router, ple) en 8-bit con imatrix; `lm_head` y `embed_tokens` 8-bit; torre de visión en bf16 sin cuantizar; tabla n-gram PLE en 8-bit gs32 |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors en layout MLX para `mlx-serve` (no GGUF); repo de 167,4 GB, ~156 GiB en disco (índice 109,8 GB + tabla n-gram 57,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 48 capas y 512 expertos por capa que combina dos mecanismos de atención: 36 capas GDN (estado recurrente tipo SSM, coste de memoria constante respecto a la longitud) y 12 capas QSA de atención dispersa, que son las únicas que generan entradas KV por token (~28 KB/token). A ello se suman un shared expert, router, hyper-connections y una tabla de embeddings n-gram PLE de 51.200 millones de entradas (57,6 GB en 8-bit gs32), que se mantiene en la page cache del sistema y no debe fijarse en memoria GPU. El tronco incorpora además una cabeza MTP (multi-token prediction) de una capa, usada como decodificación especulativa.

Este repositorio no entrena nada: cuantiza. La calibración imatrix procede de `unsloth/Qwen3.8-Flash-Next-GGUF` (corpus de 829.000 tokens) y se remapeó a safetensors con nombres HF, con cobertura de 866/866 claves (expertos, shared expert, router, GDN, QSA, hyper-connections, ple); la cabeza MTP queda intencionadamente fuera de la calibración y se cuantiza en 6-bit plano (≈2,2 GB). El resultado es un pack que carga con el loader estándar de `mlx-serve`, sin parches. No hay información sobre datos de preentrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto conversacional y de razonamiento, con endpoint `/v1/responses` y soporte de modo de razonamiento explícito en la API.
- Tool calling / function calling integrado en el servidor (endpoints OpenAI y Anthropic `/v1/messages`).
- Visión: torre Qwen3-VL ViT incluida en bf16 (333 tensores, 0,9 GB), utilizable para entrada de imágenes en las peticiones.
- Contexto largo real: prefill validado con un prompt de 260.451 tokens y ventana configurada de 262.144.
- Decodificación especulativa mediante MTP activada por defecto (salida idéntica, según el autor, y mayor velocidad de decode).
- Soporte de `logprobs` y de anulación de cuantización de KV por petición (`kv_quant`).
- Reutilización de prefijo multirretorno mediante caché en memoria (2 GB) y en SSD (60 GB), pensada para sesiones de agente.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes locales de larga duración: con 262.144 tokens de contexto y caché de prefijo en SSD, el modelo puede mantener sesiones de agente con historial extenso y reutilizar el prefijo entre turnos sin recompilar el prompt completo.
- Análisis de repositorios completos: un prompt de hasta 260.451 tokens cabe en una sola pasada, lo que permite meter árboles de código, diffs y documentación en una única ventana para tareas de revisión o refactorización asistida.
- RAG sobre documentación técnica extensa: el coste de KV es de 7,28 GB para todo el contexto (bf16), de modo que es viable indexar manuales o normativa y mantener varias conversaciones con contexto recuperado sin agotar memoria.
- Asistencia de código con tool calling: al exponer endpoints compatibles con OpenAI, se integra en pipelines de CI/CD o en IDE mediante herramientas que ya hablan ese protocolo.
- Procesamiento de documentos con visión: la torre ViT permite extraer información de capturas, diagramas o páginas escaneadas combinadas con texto largo en la misma petición.
- Atención al cliente multirretorno en local: `--prefix-cache-entries` y decodificación por lotes permiten atender varias conversaciones concurrentes (2×48k medidas con decode de 67 y 98 tok/s por petición).
- Inferencia con requisitos de privacidad: al ejecutarse íntegramente en un Mac de 128 GB sin GPU externa, los datos no salen del equipo, lo que encaja en entornos con restricciones de soberanía del dato.
- Prototipado e investigación: prefill sostenido de 597-779 tok/s permite iterar sobre prompts largos sin esperas prohibitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos por el autor son de throughput del servidor en un M4 Max de 128 GB con `mlx-serve` 26.10.2, prompts aleatorios sin aciertos de caché de prefijo y generación limitada a 96 tokens:

| Contexto real (tokens) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| 1.524 | 481 | 78 |
| 6.004 | 779 | 73 |
| 12.069 | 752 | 71 |
| 24.179 | 743 | 84 |
| 48.430 | 732 | 76 |
| 97.985 | 716 | 72 |
| 197.047 | 676 | 59 |
| 260.451 (máximo) | 597 | 60 |

Las cifras de decode marcadas con generación corta (47-48 tokens) son más ruidosas según el propio autor. En paralelo 2 (2×48k concurrentes): 67 y 98 tok/s por petición.

## Requisitos de hardware

- Memoria: 128 GB de memoria unificada en Apple Silicon. Residente medido ~109,8 GB; pico wired ~113 GB con contexto de 260k, dentro del límite GPU de 126 GB. No cabe en equipos de 64 GB.
- GPU: validado en un M4 Max de 128 GB. MLX no soporta CUDA, por lo que A100/H100/RTX 4090 no son plataformas válidas para este pack concreto (una RTX 4090 de 24 GB no podría alojarlo en ningún caso).
- Disco: ~156 GiB de pesos; conviene SSD rápido porque la tabla n-gram (57,6 GB) reside en page cache y no en memoria GPU. No usar `--ple-gpu`, que fijaría los 53,6 GB de la tabla en memoria.
- Despliegue: `mlx-serve` instalado vía Homebrew (`brew tap ddalcu/mlx-serve`), con `--serve --port 11234 --prefix-cache-mem 2GB --prefix-cache-disk 60GB --os-reserve-gib 2 --ctx-size 262144`. API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/responses`) y Anthropic (`/v1/messages`).
- Alternativa: el ecosistema GGUF del modelo base (`unsloth/Qwen3.8-Flash-Next-GGUF`, usado como fuente de la imatrix) permitiría despliegue con llama.cpp, pero este pack no está en ese formato.
- Throughput y latencia: prefill de 597-779 tok/s y decode de 59-84 tok/s según contexto (ver tabla anterior); decode prácticamente independiente de la longitud gracias a la atención dispersa.
- Caché KV: 7,28 GB para los 262k tokens completos en bf16; dos contextos completos ≈ 14,6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Este pack (`xpashkin/...-iQ-MLX-6.8bpw`) | 134,95B totales; activos no disponibles | 262.144 | 6,788 bpw mixto 6/8-bit, safetensors MLX | Apple Silicon 128 GB | qwen-community-1.0 |
| `Qwen/Qwen3.8-Flash-Next` (base) | 133B según model card; ~135B reales | no disponible en la informacion | bf16, safetensors HF (tamaño ≈270 GB estimado por aritmética de parámetros) | Multi-GPU o nodos de memoria alta | qwen-community-1.0 |
| `unsloth/Qwen3.8-Flash-Next-GGUF` | mismos pesos base | no disponible | GGUF, niveles de cuantizacion no disponibles; aporta imatrix de 829k tokens | llama.cpp sobre CPU/GPU | qwen-community-1.0 |

No se dispone de datos de benchmarks que permitan comparar calidad entre estos tres artefactos; la comparación relevante es de formato, huella de memoria y plataforma de ejecución.

## Limitaciones y advertencias

- Artefacto de un solo autor, con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de la calidad de la cuantización más allá de las mediciones del propio autor.
- Licencia `qwen-community-1.0` (marcada como `other`): es una licencia comunitaria, no una licencia permisiva tipo Apache/MIT. Hay que revisar sus condiciones antes de cualquier uso comercial; los términos concretos no están en la información disponible.
- Plataforma única: requiere macOS con Apple Silicon y `mlx-serve`. No hay soporte CUDA ni path de despliegue en vLLM/TGI para este pack.
- Aviso técnico del autor sobre el guard de recuento de objetos de Metal: en macOS 26+ el límite cae a un valor obsoleto de 499.000 objetos, y sesiones multirretorno largas con varias entradas de caché caliente pueden fallar con "out of GPU memory" pese a haber memoria libre. Workarounds sin parchear: limitar `--prefix-cache-entries`, reducir el pool de reutilización (`MLX_SERVE_CACHE_LIMIT=2GB`) o desactivar MTP (`--no-mtp`).
- La configuración validada a un día completo de sesiones de agente usó una `libmlx` compilada localmente con dos parches de allocator (LRU por recuento de objetos y subida del fallback a 4.000.000). Reproducir el rendimiento reportado en sesiones muy largas puede exigir esa compilación propia.
- No pasar `--ple-gpu`: fijaría los 53,6 GB de la tabla n-gram en memoria GPU y rompería el ajuste en 128 GB.
- Riesgo de alucinación: no hay evaluación publicada de fiabilidad, veracidad ni tasas de error en este pack ni en el modelo base según la información disponible.
- Idiomas soportados no documentados: no se puede asumir calidad multilingüe sin evaluarla.
- La cabeza MTP no está cubierta por la calibración imatrix (se cuantiza en 6-bit plano); el autor indica que la salida es idéntica por ser especulativa, pero es un punto a verificar en producción.
- La cuantización mixta deja 8 grupos de expertos en 8-bit (capas 5, 20, 23, 26, 27, 28, 33, 38): la degradación por capa no está medida públicamente.

## Enlaces

- HuggingFace del pack: https://huggingface.co/xpashkin/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-6.8bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fuente de la imatrix (GGUF): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio de mlx-serve: https://github.com/ddalcu/mlx-serve
- Issue MLX sobre el límite de objetos Metal: https://github.com/ml-explore/mlx/issues/3849
- Issue MLX relacionado: https://github.com/ml-explore/mlx/issues/4464
