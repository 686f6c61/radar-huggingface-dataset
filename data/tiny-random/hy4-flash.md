# tiny-random/hy4-flash

## Resumen

`tiny-random/hy4-flash` es un modelo de prueba (checkpoint diminuto inicializado de forma aleatoria) derivado de `tencent/Hy4-flash`, un modelo vision-lenguaje de tipo mixture-of-experts con arquitectura HYV4-Flash. Lo publica el espacio de usuario `tiny-random`, un namespace habitual para artefactos de depuración, y su propósito explícito es servir como fixture para validar la integración del modelo real en librerías y servidores de inferencia, no para uso productivo. El checkpoint original ronda los 220.240 millones de parámetros en BF16 (440,52 GB en 148 ficheros), mientras que esta versión conserva la estructura pero reduce las dimensiones a 14.161.986 parámetros totales en un único `model.safetensors` de 29,16 MB.

La relevancia es puramente de ingeniería: permite verificar de extremo a extremo el pipeline de `transformers` (PR #50903) y de SGLang (PR #51672) para la arquitectura `hy_v4_flash`, incluyendo la memoria n-gram Engram, el indexador comprimido de segunda etapa, la atención de ventana deslizante intercalada 3:1 con atención dispersa, las proyecciones Latent-MoE y el módulo de decodificación especulativa DFly2. Al mantener el mismo vocabulario (120.832 filas, sin embeddings atados), el mismo esquema de entrada texto+imagen+vídeo y el mismo grafo de módulos, los tests de integración detectan regresiones de API sin necesidad de descargar cientos de gigabytes.

No debe confundirse con un modelo funcional: al ser pesos aleatorios, sus salidas carecen de valor semántico. Cualquier evaluación de calidad, benchmarks o uso en producción debe hacerse sobre `tencent/Hy4-flash`, cuyo model card no está incluido en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV4-Flash (transformer híbrido con atención de ventana deslizante y dispersa, Latent-MoE, memoria Engram, indexador comprimido) |
| Parametros totales | 14.161.986 (checkpoint diminuto); el modelo base declara 220,24B en BF16 |
| Parametros activos | no disponible (el modelo base usa 512 expertos enrutados con top-k 16 y 1 compartido; no se publica el recuento activo) |
| Longitud de contexto | no disponible (el ejemplo de SGLang arranca con `--context-length 4096`; el modelo base no declara ventana en la información disponible) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, BF16) |

## Arquitectura y entrenamiento

El checkpoint reproduce el grafo de `HYV4-Flash` con dimensiones reducidas: 10 capas de backbone (frente a 42 en el original) con cadencia de atención de 2 capas indexadas más 2 ciclos de (3 SWA + 1 indexada); 1 capa MLP densa y 9 Latent-MoE (frente a 1 + 41); anchura oculta de 16 y anchura MLP densa de 128 (frente a 3.072 y 13.824); 8 expertos enrutados con top-k 8 y 1 compartido (frente a 512/16/1), con anchura intermedia y latente de 128. La atención usa 8 cabezas Q con dimensiones no-RoPE/RoPE/V de 32/64/32 y rangos LoRA Q/KV de 64/512. Se conservan las 4 corrientes de Hyper-Connections independientes con pre-ramas con compuerta, la ventana SWA de 512 tokens, el indexador comprimido de etapa 2 con ratio de recuerdo 4, la memoria Engram con 2 capas, 2 órdenes de n-gramas y 8 cabezas por orden, y el borrador DFly2 con 5 capas MLA densas más fusión y corrección oculta.

No hay entrenamiento: los pesos están inicializados aleatoriamente. La model card indica que el repositorio se generó con `DeepSeek-V4.1-Flash` y que el soporte requiere una versión no publicada de `transformers` (PR #50903) y de SGLang (PR #51672). Una limitación técnica relevante es que la memoria Engram y el indexador comprimido solo funcionan con atención eager en `transformers`, lo que restringe la experimentación con kernels optimizados. El vocabulario mantiene 120.832 filas con embeddings no atados, condición necesaria para que los tests de tokenización sean representativos.

## Capacidades

- Generación de texto condicionada por imagen y vídeo: la pipeline es `image-text-to-text` y el ejemplo oficial procesa una imagen PIL y una secuencia de 4 fotogramas con `VideoMetadata`, verificando que existan tokens de tipo modalidad 1 (imagen) y 2 (vídeo).
- Procesamiento multimodal con plantilla de chat: `apply_chat_template` acepta contenido estructurado con partes `image`, `video` y `text`.
- Ejecución en `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` bajo `attn_implementation="eager"`.
- Servido compatible con la API de OpenAI Chat Completions mediante SGLang, incluyendo partes `image_url`.
- Validación de integridad numérica: el script de referencia comprueba `torch.isfinite(logits).all()` y que las cuentas de tokens multimodales sean mayores que cero.
- No dispone de capacidades semánticas reales: razonamiento, código, matemáticas, tool calling, agentes o multilingüismo no son evaluables con pesos aleatorios y no se documentan para este checkpoint.

## Casos de uso

- Test de integración en CI para `transformers`: ejecutar el script oficial contra el PR #50903 en cada commit para detectar roturas en `AutoProcessor`, `apply_chat_template` o el manejo de `mm_token_type_ids` sin descargar 440 GB.
- Validación de servidores SGLang: levantar `sglang serve --model-path tiny-random/hy4-flash --tp 1 --dtype bfloat16 --context-length 4096` y comprobar el contrato de la API OpenAI con peticiones de texto e `image_url`.
- Pruebas de humo de despliegue en GPU única: el checkpoint cabe holgadamente en cualquier GPU consumer, lo que permite verificar flags de arranque, variables de entorno (`SGLANG_SKIP_SGL_KERNEL_VERSION_CHECK`) y compatibilidad de drivers CUDA 13 antes de pasar al modelo completo.
- Depuración de formas y tipos tensoriales: al conservar el vocabulario de 120.832 filas y los nombres de módulos (`routed_expert_up_proj`, `routed_expert_down_proj`, buffers de `lookup_table` de Engram), sirve para validar conversores de checkpoints y scripts de sharding.
- Verificación de rutas de atención: comprobar que la cadencia 3:1 de SWA y atención dispersa y el indexador comprimido se activan correctamente en modo eager, incluyendo las dos capas Engram.
- Pruebas de regresión de decodificación especulativa: el borrador DFly2 (5 capas MLA densas, fusión y corrección oculta) se puede instanciar y ejecutar con `generate` para validar la lógica de aceptación antes de probar con pesos reales.
- Benchmarking de infraestructura, no de calidad: medir latencia de carga, overhead de procesador multimodal y consumo de memoria del grafo, sin extraer conclusiones sobre precisión del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, MMMU) sería inválida por construcción.

## Requisitos de hardware

- VRAM para inferencia: el fichero `model.safetensors` ocupa 29,16 MB en BF16; con overhead de activaciones y caché KV para 4.096 tokens el consumo es de pocos cientos de MB, por lo que cabe en cualquier GPU con al menos 1 GB libre.
- GPU recomendadas: ninguna específica; sirve cualquier GPU CUDA (RTX 3060, RTX 4090, A100, H100, H20). El ejemplo de SGLang se documenta sobre H20 con driver 535 y `cuda-compat-13`.
- GPU consumer: sí, en todas las gamas actuales, incluidas iGPU con soporte CUDA o incluso CPU para el script de `transformers` si se ajusta `device_map`.
- Opciones de despliegue: `transformers` (PR #50903, requiere `transformers[torch,vision]` desde la rama del PR) y SGLang (PR #51672, instalación desde `git+https://github.com/sgl-project/sglang.git@a0804a2f99719f5666ed2018e5d00a75645de6a8#subdirectory=python`). No se documentan vLLM, llama.cpp, Ollama ni TGI para esta arquitectura.
- Latencia y throughput: no disponibles. No se publican cifras y, al no haber kernels optimizados (solo eager), las mediciones no serían representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Propósito |
|---|---|---|---|---|---|
| `tiny-random/hy4-flash` | 14,16M (checkpoint de prueba) | no disponible (ejemplo con 4096) | Texto + imagen + vídeo | no disponible | Fixture de test para la arquitectura HYV4-Flash |
| `tencent/Hy4-flash` | 220,24B BF16 (modelo base) | no disponible | Texto + imagen | no disponible | Modelo vision-lenguaje MoE de producción |
| Otros checkpoints `tiny-random/*` | variable (típicamente <100M) | no disponible | según modelo origen | no disponible | Pruebas de integración en `transformers` |

La comparación con alternativas de la misma categoría (modelos de 14M parámetros con capacidad real) no es significativa: este checkpoint no compite en calidad, sino que replica la topología de un MoE de 220B para validar código. Frente a otros `tiny-random`, la diferencia es que conserva rasgos estructurales poco habituales (Engram, indexador comprimido, DFly2, Hyper-Connections), lo que lo hace útil para probar rutas de código que los fixtures convencionales no cubren.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: las salidas no tienen significado; no usar para evaluación de calidad, demos ni producción.
- La licencia no está disponible, lo que impide determinar condiciones de uso comercial incluso para el código de integración derivado.
- No se declaran idiomas soportados; el vocabulario de 120.832 filas pertenece al modelo base y no garantiza cobertura multilingüe funcional.
- La memoria Engram y el indexador comprimido solo operan con `attn_implementation="eager"`; no hay soporte de FlashAttention ni de kernels fusionados para estas rutas.
- Requiere versiones no publicadas de `transformers` (PR #50903) y SGLang (PR #51672); la API puede cambiar sin aviso y romper la integración.
- El despliegue en SGLang exige una pila CUDA 13 (torch 2.14.1+cu130, flashinfer 0.7.4, `sgl-fa3`, `sgl-flash-mla`) y, en H20 con driver 535, anteponer `libcuda.so.1` de `cuda-compat-13` a `LD_LIBRARY_PATH` y `LIBRARY_PATH`.
- El checkpoint reduce dimensiones (oculto 16, MLP densa 128, 8 expertos) y capas (10 frente a 42), por lo que no reproduce el comportamiento numérico, el rendimiento ni los modos de fallo del modelo de 220B.
- Riesgo de alucinación y sesgos: no evaluables con pesos aleatorios; no se han publicado análisis para este repositorio.
- El repositorio se generó automáticamente con `DeepSeek-V4.1-Flash`; no hay garantía de mantenimiento ni de actualización a versiones estables de las librerías.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/hy4-flash
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- PR de `transformers` con soporte `hy_v4_flash`: https://github.com/huggingface/transformers/pull/50903
- PR de SGLang con soporte Hy4-flash: https://github.com/sgl-project/sglang/pull/51672
- Cookbook de SGLang para Hy4-flash: https://docs.sglang.io/cookbook/autoregressive/Tencent/Hy4-flash
- Script de creación del repositorio: https://huggingface.co/tiny-random/hy4-flash/blob/main/.meta/create_model.py
- Log de estructura del modelo: https://huggingface.co/tiny-random/hy4-flash/blob/main/.meta/model.log
- Entorno de generación: https://huggingface.co/tiny-random/hy4-flash/blob/main/.meta/env.json
