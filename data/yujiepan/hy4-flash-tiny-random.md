# yujiepan/hy4-flash-tiny-random

## Resumen

`yujiepan/hy4-flash-tiny-random` es un checkpoint diminuto de inicialización aleatoria construido a partir de la arquitectura de `tencent/Hy4-flash` (identificador interno `hy_v4_flash`). No es un modelo entrenado ni utilizable en producción: su propósito explícito es servir como banco de pruebas para validar la implementación de la arquitectura en Transformers (PR #50903) y en SGLang (PR #51672), así como para depurar pipelines multimodales de imagen, vídeo y texto sin necesidad de descargar los 440 GB del checkpoint original.

El modelo conserva la estructura completa de Hy4-flash (backbone híbrido con atención de ventana deslizante intercalada 3:1 con atención dispersa, memoria n-gram Engram, indexador comprimido en dos etapas, proyecciones Latent-MoE e Hyper-Connections independientes), pero con dimensiones reducidas drásticamente: 10 capas en lugar de 42, anchura oculta de 16 en lugar de 3.072 y 8 expertos enrutados en lugar de 512. El resultado son 14.161.986 parámetros totales en BF16, empaquetados en un único `model.safetensors` de 29,16 MB.

Su relevancia es puramente instrumental: permite a desarrolladores verificar que el código de carga, el procesador multimodal y los kernels de atención funcionan correctamente antes de escalar al modelo real. La model card advierte que la memoria Engram y el indexador comprimido solo operan con `attn_implementation="eager"`, lo que convierte a este checkpoint en una herramienta de validación de referencia para esas rutas de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV4-Flash (transformer híbrido con SWA + atención dispersa, Latent-MoE, memoria Engram, Hyper-Connections) |
| Parametros totales | 14.161.986 |
| Parametros activos | no disponible (MoE con 8 expertos enrutados, top-k 8 y 1 compartido) |
| Longitud de contexto | no disponible (ventana SWA de 512 tokens; `--context-length 4096` en el ejemplo de SGLang) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, F32 e I32 en un único archivo) |
| Vocabulario | 120.832 filas, embeddings no atados |
| Capas del backbone | 10 (2 indexadas + 2 ciclos de 3 SWA + 1 indexada) |
| Layout MLP | 1 densa + 9 Latent-MoE |
| Anchura oculta / MLP densa | 16 / 128 |
| Expertos enrutados / top-k / compartidos | 8 / 8 / 1 |
| Anchura intermedia de experto / latente | 128 / 128 |
| Cabezas Q; dims no-RoPE / RoPE / V | 8; 32 / 64 / 32 |
| Rango LoRA Q / KV | 64 / 512 |
| Memoria Engram | 2 capas, 2 órdenes de n-gramas, 8 cabezas por orden |
| Indexador comprimido | recall grueso de etapa 2, ratio 4 |
| Ventana SWA | 512 |
| Hyper-Connections independientes | 4 flujos, pre-ramas con compuerta |
| Capas draft DFly2 | 5 capas MLA densas + fusión + corrección oculta |
| Precisión del checkpoint | BF16 |

## Arquitectura y entrenamiento

El checkpoint replica la topología de `tencent/Hy4-flash` a escala de juguete. El backbone combina atención de ventana deslizante (SWA) con atención dispersa en un patrón 3:1, e intercala dos capas con indexación explícita. Sobre esa base se añaden tres mecanismos propios: la memoria Engram (búsquedas con hash sobre tablas por capa, con 2 órdenes de n-gramas y 8 cabezas por orden), un indexador comprimido de etapa 2 con ratio de recall 4 que complementa al indexador DSA, y proyecciones Latent-MoE que mapean de latente a oculto y de oculto a latente (`routed_expert_up_proj` / `routed_expert_down_proj`). Las Hyper-Connections independientes operan con 4 flujos y pre-ramas con compuerta. El módulo de decodificación especulativa DFly2 mantiene 5 capas MLA densas más fusión y corrección oculta.

No ha habido entrenamiento: los pesos son de inicialización aleatoria, generados por el script `.meta/create_model.py` y documentados en `.meta/model.log`. No existe información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque el modelo no se ha entrenado. La innovación técnica relevante es la fidelidad estructural: el repo reproduce el formato exacto del checkpoint original (incluida la serialización de `lookup_table` de Engram como buffer y el nombrado de las proyecciones Latent-MoE), lo que lo convierte en un test de conformidad para la implementación de referencia. Dos ciclos SWA completos se conservan para ejercitar el patrón de intercalado.

## Capacidades

- Generación de texto autoregresiva con la interfaz estándar de Transformers (`AutoModelForImageTextToText`).
- Procesamiento multimodal de imagen y vídeo: el ejemplo verificado construye mensajes con partes `image` y `video` y comprueba que `mm_token_type_ids` contiene tokens de ambos tipos (1 para imagen, 2 para vídeo).
- Procesamiento de vídeo con metadatos explícitos (`VideoMetadata` con `total_num_frames`, `fps` y `frames_indices`).
- Servido compatible con la API OpenAI Chat Completions mediante SGLang, incluyendo partes de contenido `image_url`.
- Ejercicio de las rutas de atención eager necesarias para Engram y el indexador comprimido.
- Validación de decodificación especulativa DFly2 a través de la estructura de capas draft.
- No dispone de capacidades reales de razonamiento, código, matemáticas, tool calling ni agentes: al no estar entrenado, sus salidas son ruido estadístico.

## Casos de uso

- Pruebas de integración de Transformers PR #50903: cargar el checkpoint con `AutoModelForImageTextToText.from_pretrained` y verificar que el estado se carga sin claves faltantes ni inesperadas, antes de intentar el checkpoint de 440 GB.
- Validación de kernels de atención en SGLang PR #51672: levantar `sglang serve` con `--tp 1 --dtype bfloat16 --context-length 4096` y comprobar que el servidor responde a peticiones de chat con imagen sin errores de kernel.
- Depuración del procesador multimodal: construir una imagen sintética de 128x128 con PIL y un vídeo de 4 fotogramas, y comprobar que `apply_chat_template` genera los `mm_token_type_ids` esperados.
- Test de conformidad de la memoria Engram: verificar que las tablas de búsqueda con hash se serializan y deserializan como buffer y que la ruta eager las ejecuta sin fallos.
- Integración continua de pipelines de inferencia: usar el repo como fixture ligero (29 MB) en tests automáticos que validen la compatibilidad de versiones de Transformers, torch y flashinfer antes de desplegar.
- Verificación de la decodificación especulativa DFly2: comprobar que las 5 capas MLA densas, la fusión y la corrección oculta se instancian con las dimensiones correctas en un entorno controlado.
- Reproducción de entornos CUDA 13: validar la pila torch 2.14.1+cu130, flashinfer 0.7.4, `sgl-fa3` y `sgl-flash-mla` con `SGLANG_SKIP_SGL_KERNEL_VERSION_CHECK=1` en hardware H20.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de inicialización aleatoria sin entrenamiento, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, MMMU) resultaría degenerada y no aportaría información sobre la arquitectura real.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en BF16 (14,16 M de parámetros más el vocabulario de 120.832 filas); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte BF16; el ejemplo verificado de SGLang se ejecutó en una H20 con driver 535 y compatibilidad CUDA 13.
- Cabe en GPU consumer: sí, en cualquier RTX con al menos 2 GB de VRAM; también es viable en CPU con `device_map="cpu"`.
- Opciones de despliegue: Transformers con la rama del PR #50903 (`pip install "transformers[torch,vision] @ git+https://github.com/huggingface/transformers.git@refs/pull/50903/head"`) y SGLang con el commit `a0804a2f99719f5666ed2018e5d00a75645de6a8`. No hay soporte en llama.cpp, Ollama ni TGI.
- Restricciones de atención: Engram y el indexador comprimido solo funcionan con `attn_implementation="eager"`.
- Latencia y throughput: no disponibles; al ser un modelo aleatorio, las cifras no serían representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yujiepan/hy4-flash-tiny-random` | 14,16 M | no disponible (SWA 512) | Test de arquitectura Hy4-flash | no disponible | Hugging Face, 0 descargas |
| `tencent/Hy4-flash` | 220,24 B BF16 en checkpoint | no disponible | Modelo multimodal de producción | no disponible | Hugging Face (referenciado como base) |
| Checkpoints tiny-random de otras familias | variable | variable | Validación de implementaciones en Transformers | variable | Hugging Face |

La comparación directa con alternativas de la misma categoría (modelos tiny-random de validación) no está disponible en la información proporcionada. Frente al modelo base, la diferencia es de cuatro órdenes de magnitud en parámetros y de 440,52 GB a 29,16 MB en peso en disco.

## Limitaciones y advertencias

- Pesos de inicialización aleatoria: el modelo no ha sido entrenado y no produce texto coherente; cualquier salida debe tratarse como ruido.
- No apto para producción, investigación de capacidades ni evaluación de calidad.
- Licencia no especificada: la ausencia de licencia impide asumir derechos de uso comercial; debe contactarse con el autor o consultarse la licencia del modelo base `tencent/Hy4-flash`.
- Dependencia de código no publicado: requiere la rama del PR #50903 de Transformers y el commit concreto de SGLang; no funciona con versiones estables.
- Restricción de atención: Engram y el indexador comprimido solo se ejecutan con atención eager, lo que excluye kernels optimizados como FlashAttention en esas rutas.
- Idiomas no documentados: no hay información sobre cobertura lingüística.
- Entorno frágil: el ejemplo de SGLang exige CUDA 13, torch 2.14.1+cu130, flashinfer 0.7.4 y variables de entorno específicas (`SGLANG_SKIP_SGL_KERNEL_VERSION_CHECK=1`, `LD_LIBRARY_PATH` con `cuda-compat-13`).
- Generado automáticamente por DeepSeek-V4.1-Flash según la model card; posibles errores en la estructura no detectados por el autor.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yujiepan/hy4-flash-tiny-random
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- PR de Transformers #50903: https://github.com/huggingface/transformers/pull/50903
- PR de SGLang #51672: https://github.com/sgl-project/sglang/pull/51672
- Commit de SGLang verificado: https://github.com/sgl-project/sglang/commit/a0804a2f99719f5666ed2018e5d00a75645de6a8
- Cookbook de Hy4-flash en SGLang: https://docs.sglang.io/cookbook/autoregressive/Tencent/Hy4-flash
- Script de creación: https://huggingface.co/yujiepan/hy4-flash-tiny-random/blob/main/.meta/create_model.py
- Log de estructura: https://huggingface.co/yujiepan/hy4-flash-tiny-random/blob/main/.meta/model.log
- Entorno de generación: https://huggingface.co/yujiepan/hy4-flash-tiny-random/blob/main/.meta/env.json
