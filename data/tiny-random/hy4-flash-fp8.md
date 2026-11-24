# tiny-random/hy4-flash-fp8

## Resumen

`tiny-random/hy4-flash-fp8` es un checkpoint de juguete (tiny model) generado aleatoriamente a partir de la arquitectura de `tencent/Hy4-flash-FP8`, un modelo vision-lenguaje de tipo mixture-of-experts (MoE) latente con cuantizacion nativa FP8. Lo publica la organizacion `tiny-random`, cuyo proposito es servir como banco de pruebas reproducible para validar pipelines de carga, tokenizacion, atencion e inferencia sin necesidad de descargar los 287 GB del checkpoint original. No es un modelo entrenado: sus pesos son inicializaciones aleatorias con la misma estructura de tensores que el modelo fuente.

El interes tecnico del repo esta en que replica fielmente descriptores de arquitectura poco habituales: backbone hibrido con atencion indexada y sliding-window attention (SWA), MLP con 1 capa densa y 9 capas Latent-MoE, memoria Engram, indexador comprimido de dos etapas, cabezas DFly2 de decodificacion especulativa y cuantizacion nativa FP8 E4M3 con escalas BF16 por bloques de 128x128. Con 46 millones de parametros totales y un unico fichero `model.safetensors` de 87 MB, permite iterar sobre integraciones (por ejemplo, el soporte nativo FP8 de SGLang) en minutos y en una sola GPU.

Es relevante ahora porque el modelo original no tiene implementacion publicada en Transformers y solo se valida con SGLang (PR #51672), de modo que este tiny checkpoint actua como test de conformidad de kernels, no como modelo utilizable para generar contenido real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con backbone de atencion indexada + SWA, MLP Latent-MoE, memoria Engram, indexador comprimido y cabezas DFly2 (draft especulativo); vision-lenguaje |
| Parametros totales | 46.038.154 |
| Parametros activos | no disponible (el modelo fuente declara 512 expertos enrutados con top-k 16 y 1 compartido; el tiny usa 8 expertos, top-k 8, 1 compartido) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio usa `--context-length 4096` |
| Tipos de cuantizacion | FP8 nativo E4M3 con escala BF16 por bloques 128x128 en expertos, `o_proj`, `linear_gate`, `q_b_proj` y MLP+atencion DFly; embeddings, ViT, indexadores, Latent-MoE y Engram en BF16; escalas en F32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (un unico `model.safetensors`, 87 MB) |

## Arquitectura y entrenamiento

El checkpoint reproduce la topologia de `tencent/Hy4-flash-FP8` a escala reducida: 10 capas de backbone frente a 42 en el original, con el mismo patron de cadencia de atencion (2 capas indexadas + 2 bloques de 3 capas SWA + 1 indexada), ventana SWA de 512 tokens, ancho oculto de 128 (el original usa 3.072) y MLP de 1 capa densa mas 9 capas Latent-MoE con 8 expertos enrutados, top-k 8 y 1 experto compartido. Mantiene el vocabulario de 120.832 filas con embeddings no atados, 8 cabezas Q con dimensiones no-RoPE/RoPE/V de 32/64/32, rangos LoRA de Q/KV de 128/512, memoria Engram de 2 capas con 2 ordenes y 8 cabezas por orden, e indexador comprimido de etapa 2 con ratio de recall 4.

No hay entrenamiento: los pesos son inicializacion aleatoria, segun declara el autor. El repo existe para validar la ruta de carga de pesos nativos FP8, que Transformers no puede manejar. La model card indica que el checkpoint se ha validado unicamente con SGLang (PR #51672, commit `a0804a2f`), sobre CUDA 13 con torch 2.14.1+cu130, flashinfer 0.7.4, `sgl-fa3` y `sgl-flash-mla`, y con `SGLANG_SKIP_SGL_KERNEL_VERSION_CHECK=1`. El `hidden_size` se fija en 128 porque el GEMM FP8 con escalas por bloque exige que la dimension de reduccion K sea multiplo de 128 y `hidden` es la K de `linear_gate`.

## Capacidades

- Generacion de texto condicionada por instrucciones, con la misma interfaz conversacional que el modelo fuente (chat template de tipo OpenAI messages).
- Entrada multimodal imagen-texto: acepta partes `image_url` junto a texto en el mismo mensaje, segun el ejemplo de la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Nota critica: al ser pesos aleatorios, ninguna de estas capacidades produce salidas coherentes; el checkpoint solo valida el camino de ejecucion.

## Casos de uso

- Pruebas de conformidad de kernels FP8: cargar el checkpoint en SGLang y verificar que el GEMM con escalas por bloque 128x128, las exclusiones de cuantizacion (embeddings, ViT, indexadores, Latent-MoE, Engram) y las escalas F32 se interpretan correctamente antes de pasar al modelo de 287 GB.
- Desarrollo de integraciones en Transformers: validar tokenizer, procesador de vision, chat template y mapeo de nombres de tensores sin descargar el checkpoint completo.
- CI/CD de infraestructura de inferencia: ejecutar el modelo en un unico runner con GPU consumer para detectar regresiones en versiones de torch, flashinfer o SGLang en minutos y con 87 MB de descarga.
- Pruebas de decodificacion especulativa: ejercitar la estructura DFly2 (5 capas draft densas MLA, fusion y correccion oculta) para comprobar el cableado del draft y del verificador.
- Validacion de atencion hibrida: probar la cadencia indexada/SWA con ventana de 512 y el indexador comprimido de etapa 2 con ratio 4 en escenarios de contexto corto.
- Benchmarking comparativo de arranque y memoria: medir tiempo de carga, pico de VRAM y throughput de un modelo MoE con cuantizacion nativa FP8 como referencia base frente a variantes BF16.
- Formacion y depuracion de pipelines multimodales: verificar el flujo imagen-texto (procesado de imagen, proyeccion al espacio de embeddings, generacion) sin coste de inferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los 46 M de parametros, mas overhead de activaciones, cache KV y buffers de SGLang; el checkpoint completo ocupa 87 MB en disco.
- GPU recomendadas: cualquier GPU con soporte CUDA 13 y kernels FP8; la model card cita una H20 con driver 535 como entorno validado (requiere anteponer `cuda-compat-13` en `LD_LIBRARY_PATH` y `LIBRARY_PATH`).
- Cabe en GPU consumer: si, en cualquier GPU moderna con soporte FP8 (por ejemplo, generaciones Ada o posteriores); no se especifican modelos concretos en la informacion disponible.
- Opciones de despliegue: SGLang con la build del PR #51672 es la unica ruta verificada (`sglang serve --model-path tiny-random/hy4-flash-fp8 --tp 1 --dtype bfloat16 --context-length 4096`). vLLM, llama.cpp, Ollama y TGI no estan soportados segun la model card, ya que Transformers no puede cargar los expertos FP8 nativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| `tiny-random/hy4-flash-fp8` | 46,04 M | no disponible (ejemplo con 4096) | safetensors FP8 nativo | no disponible | Test de conformidad de arquitectura Hy4-flash |
| `tencent/Hy4-flash-FP8` | 66,78 B BF16 + 153,47 B F8_E4M3 en tensores | no disponible | safetensors FP8 nativo (287,07 GB, 148 ficheros) | no disponible | Modelo vision-lenguaje MoE de produccion |
| Otros checkpoints `tiny-random` de la misma familia | no disponible | no disponible | safetensors | no disponible | Pruebas de integracion equivalentes para otras arquitecturas |

La comparativa con modelos de la misma categoria (tiny models de validacion) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no ha sido entrenado y no produce texto ni descripciones de imagen coherentes; no debe usarse en produccion ni para evaluacion de calidad.
- No es cargable con Transformers: la model card indica que Transformers no soporta los expertos FP8 nativos; solo SGLang con el PR #51672 esta verificado.
- Dependencia de una build no publicada: el soporte requiere instalar SGLang desde un commit concreto y un stack CUDA 13 con versiones fijadas de torch y flashinfer; cualquier cambio de version puede romper la carga.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion; el modelo base `tencent/Hy4-flash-FP8` tampoco declara licencia en la informacion proporcionada.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica.
- Contexto no declarado: la model card no especifica la longitud de contexto del modelo fuente ni del tiny; el valor 4096 del ejemplo es solo un parametro de servicio.
- El `hidden_size` de 128 es una restriccion tecnica del GEMM FP8 (K multiplo de 128), no una decision de diseno del modelo original, por lo que las dimensiones no son representativas del comportamiento del modelo fuente.
- Riesgo de confusion: el nombre del repo puede llevar a pensar que es una version cuantizada utilizable de Hy4-flash; no lo es.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiny-random/hy4-flash-fp8
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- PR de SGLang con soporte FP8 nativo: https://github.com/sgl-project/sglang/pull/51672
- Cookbook de Hy4-flash en SGLang: https://docs.sglang.io/cookbook/autoregressive/Tencent/Hy4-flash
- Script de creacion del repo: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura del modelo: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
