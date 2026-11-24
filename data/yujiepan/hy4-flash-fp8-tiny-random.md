# yujiepan/hy4-flash-fp8-tiny-random

## Resumen
El repositorio `yujiepan/hy4-flash-fp8-tiny-random` es una reproducción en miniatura, con pesos inicializados de forma aleatoria, del modelo multimodal `tencent/Hy4-flash-FP8`. Lo mantiene el usuario yujiepan y su propósito es exclusivamente el de pruebas y depuración: permite validar infraestructura de carga, tokenización, enrutado de expertos y cuantización FP8 sin necesidad de descargar los 287 GB del checkpoint original. No es un modelo entrenado ni utilizable en producción; su valor es como banco de pruebas reproducible de la arquitectura HYV4-Flash.

La arquitectura reproduce fielmente el esquema del modelo base: backbone de tipo transformer con atención híbrida (ventanas de atención deslizante de 512 tokens combinadas con atención indexada), MLP con una capa densa seguida de capas Latent-MoE, memoria Engram en dos capas, indexador comprimido con ratio 4 y un módulo de decodificación especulativa DFly2 de cinco capas densas MLA. La diferencia está en la escala: 10 capas de backbone en lugar de 42, anchura oculta de 128 en lugar de 3.072, y 8 expertos enrutados con top-8 en lugar de 512 con top-16.

El checkpoint resultante ocupa 87 MB en un único `model.safetensors` y contiene 46.038.154 parámetros, con mezcla de BF16, F32, F8_E4M3 e I32. Al no existir aún soporte en Transformers para los expertos FP8 nativos de Hy4-flash, la validación se ha hecho únicamente con SGLang mediante un PR no publicado. Es relevante ahora porque permite a desarrolladores experimentar con la pila de inferencia de Hy4-flash (FP8 con escalas por bloque, MLA, decodificación especulativa) en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal HYV4-Flash con atención híbrida SWA/indexada, Latent-MoE, memoria Engram y módulo especulativo DFly2 |
| Parametros totales | 46.038.154 |
| Parametros activos | No aplica de forma representativa: 8 expertos enrutados con top-8, es decir, todos los expertos activos por token en esta miniatura |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de SGLang usa `--context-length 4096` |
| Tipos de cuantizacion | FP8 nativo E4M3 con bloques 128x128 y escalas BF16 (`scale_inv`) en expertos, `o_proj`, `linear_gate`, `q_b_proj` y MLP/atención de DFly; embeddings, ViT, indexadores, Latent-MoE y Engram en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`, 87 MB) |

## Arquitectura y entrenamiento
El modelo replica la topología de `tencent/Hy4-flash-FP8` a escala reducida. El backbone consta de 10 capas con un patrón de atención de 2 capas indexadas más 2 bloques de (3 SWA + 1 indexada), ventana SWA de 512 tokens y cabezas Q con dimensiones no-RoPE/RoPE/V de 32/64/32. El MLP combina una capa densa con 9 capas Latent-MoE, cada una con 8 expertos enrutados (top-8) y 1 compartido, anchura intermedia y latente de 128. Se incluyen dos capas de memoria Engram con 2 órdenes y 8 cabezas por orden, además de un indexador comprimido con recuperación gruesa de etapa 2 y ratio 4.

La cuantización es el aspecto técnico más interesante: se aplica FP8 E4M3 nativo con escalas por bloque de 128x128 almacenadas en BF16, y se excluyen explícitamente embeddings, torre visual, indexadores, Latent-MoE y Engram, que permanecen en BF16. El vocabulario tiene 120.832 filas con embeddings no atados, lo que explica que las matrices de tokens dominen el tamaño del repo (unos 62 MB con anchura oculta 128). La anchura oculta se fija en 128 porque la GEMM FP8 con escalas por bloque exige que la dimensión de reducción K sea múltiplo de 128.

No hay entrenamiento: los pesos son aleatorios. El módulo DFly2 mantiene la estructura del original (5 capas densas MLA, fusión y corrección oculta) para que las rutas de decodificación especulativa puedan ejercitarse. El repo se ha generado con un script (`create_model.py`) y se ha validado con SGLang en una compilación concreta, no con Transformers, que no puede cargar los expertos FP8 nativos.

## Capacidades
- Generación de texto autoregresiva con la pila de tokenización y cabezas del modelo base, útil para verificar el pipeline completo.
- Entrada multimodal imagen-texto: acepta mensajes con partes `image_url` y texto, según el pipeline `image-text-to-text`.
- Ejercicio del enrutado Latent-MoE con 8 expertos y experto compartido, permitiendo depurar kernels de MoE.
- Validación de la ruta FP8 con escalas por bloque en SGLang, incluida la exclusión selectiva de módulos en BF16.
- Prueba del mecanismo de decodificación especulativa DFly2 con draft de 5 capas MLA.
- Verificación de memoria Engram y del indexador comprimido con ratio 4.
- No ofrece capacidades reales de razonamiento, código o matemáticas: al tener pesos aleatorios, sus salidas no son coherentes.

## Casos de uso
- Desarrollo de kernels FP8: sirve para validar implementaciones de GEMM FP8 con escalas 128x128 antes de pasar al checkpoint completo de 287 GB, reduciendo el ciclo de iteración de horas a segundos.
- Integración en SGLang: permite probar el PR #51672 y la configuración de arranque (`--tp 1`, `--dtype bfloat16`) sin reservar 8 GPUs ni cientos de gigabytes de disco.
- CI/CD de infraestructura de inferencia: se puede incluir en tests automáticos que verifiquen que el servidor arranca, acepta mensajes OpenAI y devuelve respuestas con la forma esperada.
- Depuración de enrutado MoE: con 8 expertos y top-8 se pueden instrumentar contadores de asignación y comprobar que las máscaras y los sesgos del router se aplican correctamente.
- Pruebas de decodificación especulativa: el módulo DFly2 permite medir la tasa de aceptación del draft y validar la lógica de fusión y corrección oculta en un entorno controlado.
- Validación de pipeline multimodal: comprueba la tokenización de imágenes, la proyección de la torre visual y el formateo de mensajes con partes `image_url`.
- Formación y documentación: útil como ejemplo didáctico de cómo se estructura un checkpoint híbrido con SWA, MLA, MoE latente y FP8 en un único safetensors.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en BF16/FP8 para los 87 MB de pesos, más overhead de activaciones y caché KV; con contexto 4096 y esta escala, cabe holgadamente en cualquier GPU con 8 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA 13 y kernels FP8; el autor cita una H20 con driver 535 como entorno validado.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 5090 y similares, siempre que la pila de SGLang compile para la arquitectura correspondiente.
- Opciones de despliegue: SGLang (única verificada, mediante el PR #51672 con torch 2.14.1+cu130, flashinfer 0.7.4, `sgl-fa3` y `sgl-flash-mla`). Transformers no es compatible con los expertos FP8 nativos. No se ha validado vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| yujiepan/hy4-flash-fp8-tiny-random | 46 M | No disponible | No disponible | safetensors | Pruebas de infraestructura |
| tencent/Hy4-flash-FP8 | No disponible (checkpoint de 287 GB) | No disponible | No disponible | safetensors FP8 | Modelo multimodal de produccion |
| Otros tiny-random de Hugging Face | Variable | Variable | Variable | safetensors | Pruebas de carga y tokenizacion |

La comparación relevante es con el modelo base: esta miniatura conserva la estructura (atención híbrida, Latent-MoE, Engram, DFly2, FP8 con escalas por bloque) pero reduce capas, anchura y número de expertos. Frente a otros `tiny-random`, la diferencia es que aquí se ejercitan rutas de cuantización FP8 y decodificación especulativa que los tiny convencionales no cubren.

## Limitaciones y advertencias
- Pesos inicializados aleatoriamente: el modelo no produce texto ni descripciones de imagen coherentes; no debe usarse para inferencia real.
- No es un modelo entrenado: no ha visto datos, no tiene alineación ni ajuste por instrucciones.
- Soporte limitado: solo se ha validado con una compilación concreta de SGLang; Transformers no puede cargarlo.
- Licencia no declarada: no se puede asumir uso comercial; hay que consultar la licencia del modelo base `tencent/Hy4-flash-FP8`.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Contexto no documentado: el valor de 4096 aparece solo como ejemplo de arranque, no como especificación.
- La anchura oculta de 128 es una restricción técnica derivada del requisito K % 128 == 0 para la GEMM FP8, no una decisión de diseño del modelo original.
- El checkpoint se ha generado automáticamente con DeepSeek-V4.1-Flash según la model card; conviene revisar el script `create_model.py` antes de confiar en él para validaciones críticas.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/yujiepan/hy4-flash-fp8-tiny-random
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- PR de SGLang con soporte FP8 nativo: https://github.com/sgl-project/sglang/pull/51672
- Cookbook de Hy4-flash en SGLang: https://docs.sglang.io/cookbook/autoregressive/Tencent/Hy4-flash
- Script de creación: https://huggingface.co/yujiepan/hy4-flash-fp8-tiny-random/blob/main/.meta/create_model.py
- Log de estructura del modelo: https://huggingface.co/yujiepan/hy4-flash-fp8-tiny-random/blob/main/.meta/model.log
- Entorno de generación: https://huggingface.co/yujiepan/hy4-flash-fp8-tiny-random/blob/main/.meta/env.json
