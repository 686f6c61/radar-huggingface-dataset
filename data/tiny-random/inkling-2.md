# tiny-random/inkling-2

## Resumen
inkling-2 (publicado bajo el identificador `tiny-random/inkling-2`) es un modelo diminuto de inicialización aleatoria derivado de `thinkingmachines/Inkling-2-Small`, pensado exclusivamente para pruebas y depuración de la arquitectura Inkling 2. No es un modelo entrenado ni utilizable en producción: sus pesos son aleatorios y su único propósito es validar cargadores, pipelines de inferencia y herramientas de despliegue sobre la arquitectura real.

La relevancia técnica está en que reproduce fielmente la estructura del modelo grande a escala reducida: 12 capas de decodificador, ciclo de atención de 5 ventanas deslizantes (SWA) más 1 atención global, 96 expertos enrutados con 8 activos por token, precisión mixta NVFP4/MXFP8 en los expertos, vocabulario de 201.024 tokens con embeddings atados y capas MTP (multi-token prediction) en BF16. Esto permite a desarrolladores verificar integraciones de Transformers y SGLang sin necesidad de descargar los 393,48 GB del checkpoint completo.

Con 10.788.940 parámetros totales y un repo de 0,1 GB, es un artefacto de ingeniería, no un modelo de lenguaje funcional. Cualquier evaluación de calidad de generación carece de sentido sobre él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (5 SWA + 1 global), visión integrada y capas MTP |
| Parametros totales | 10.788.940 |
| Parametros activos | 8 expertos enrutados por token (de 96 expertos totales); número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible (el ejemplo de SGLang usa `--context-length 2048`) |
| Tipos de cuantizacion | Pesos en BF16, F32, F8_E4M3 y U8 (expertos mixtos NVFP4/MXFP8); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` 18,8 MB, `mtp.safetensors` 4,0 MB) |

## Arquitectura y entrenamiento
El modelo replica la arquitectura Inkling 2 a escala tiny: 12 capas de decodificador frente a 48 del modelo base, con el mismo patrón de atención de 5 capas de ventana deslizante seguidas de 1 capa de atención global (dos ciclos completos). Emplea un esquema MoE con 96 expertos enrutados y 8 activos por token, con precisión mixta de 6 capas NVFP4 y 6 capas MXFP8. La anchura oculta es de 32 y la anchura de experto de 32, con 24 cabezas Q, 4 cabezas KV y dimensión de cabeza 32. El vocabulario es de 201.024 tokens con embeddings atados (`tied embeddings = true`), a diferencia del modelo base.

Incluye un componente de visión con anchura 32 y 4 capas (frente a 1.024 y 23 del modelo grande) y capas MTP (multi-token prediction) en BF16 con 5 capas, block size 8 y rango de Markov 8. Los feature taps del MTP son 5 y 12 (centinela de norma final). No ha habido entrenamiento: el repositorio se generó con inicialización aleatoria, según indica la model card, mediante un script (`GPT-6.1-Sol`) y un log de estructura. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO porque no existe entrenamiento real.

## Capacidades
- Generación de texto e imagen-texto a nivel de arquitectura (pipeline `image-text-to-text`), pero sin capacidad funcional real al tener pesos aleatorios.
- Soporte de tool calling y reasoning parser a nivel de servidor: SGLang expone `--reasoning-parser inkling` y `--tool-call-parser inkling2`.
- Soporte multimodal: procesador con `image_token` y modelo `AutoModelForImageTextToText`.
- Capacidades multilingües: no disponibles (sin entrenamiento).
- Modo thinking, visión y audio: la arquitectura contempla visión; el resto no disponible.
- Sirve como banco de pruebas para validar cargadores, kernels de atención (FA4), CUDA graphs y decodificación especulativa vía MTP.

## Casos de uso
- Validación de integraciones de Transformers: comprobar que la rama de Transformers con soporte Inkling 2 carga correctamente el checkpoint y expande los pesos de expertos empaquetados a BF16 antes de abordar el modelo completo.
- Pruebas de despliegue en SGLang: verificar la rama de soporte de Inkling 2, los parsers de razonamiento y tool calling, y la configuración de CUDA graphs con lotes pequeños (1, 2, 4) sin consumir recursos del modelo grande.
- CI/CD de infraestructura de inferencia: ejecutar tests de humo en pipelines que detecten regresiones en el cargador, el procesador multimodal o el servidor antes de un despliegue real.
- Depuración de arquitectura MoE: inspeccionar el enrutamiento de 8 expertos por token y la mezcla NVFP4/MXFP8 con un checkpoint manejable de 22,82 MB.
- Desarrollo de herramientas de conversión de pesos: probar scripts que transformen formatos empaquetados (U8, F8_E4M3) a BF16 usando un modelo de estructura idéntica pero tamaño reducido.
- Pruebas de decodificación especulativa: validar las capas MTP y los feature taps con un checkpoint pequeño antes de escalar al modelo de 393,48 GB.
- Benchmarking de kernels de atención: medir el rendimiento del ciclo SWA/global y del backend FA4 en GPUs de gama baja sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo tiene pesos aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en BF16 (10,79 M de parámetros); el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y BF16; el ejemplo de SGLang usa `--tp 4 --ep 4`, lo que sugiere un entorno multi-GPU para probar el paralelismo, aunque el modelo cabe en una sola GPU consumer.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas básicas.
- Opciones de despliegue: Transformers (rama con soporte Inkling 2, commit `c748111`), SGLang (rama `f726172`, requiere `SGLANG_BUILD_RUST_EXTS=none`), backend de atención FA4. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, las cifras no son representativas.

## Comparativa con modelos similares
No disponible. No se conocen modelos tiny-random comparables de la misma familia Inkling 2 en la información proporcionada, ni alternativas publicadas con arquitectura equivalente (MoE con NVFP4/MXFP8 y MTP) a esta escala.

## Limitaciones y advertencias
- Pesos inicializados aleatoriamente: no genera texto coherente ni responde a instrucciones; no debe usarse en producción ni en evaluación de calidad.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; hay que consultar al autor del modelo base (`thinkingmachines/Inkling-2-Small`).
- Idiomas no especificados y sin entrenamiento multilingüe real.
- El contexto máximo no está documentado; el ejemplo de SGLang fija `--context-length 2048`, que puede no reflejar el límite del modelo base.
- Requiere ramas específicas de Transformers y SGLang no incluidas en las releases generales; la instalación estándar no cargará la arquitectura.
- Riesgo de confundir este artefacto con el modelo real: el identificador `tiny-random/inkling-2` y el tamaño (0,1 GB) deben tenerse en cuenta antes de cualquier integración.
- La model card indica que el repo fue generado por `GPT-6.1-Sol`; conviene revisar `.meta/create_model.py` y `.meta/model.log` para auditar la estructura.

## Enlaces
- Hugging Face: https://huggingface.co/tiny-random/inkling-2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Transformers con soporte Inkling 2: https://github.com/huggingface/transformers/tree/c748111b3bb4d97df452f0fe60e63c480beb6fe6
- SGLang (rama de soporte): https://github.com/sgl-project/sglang/tree/f726172d760dea737c7f1e797c9f32efe14d1685
- Script de creación: `.meta/create_model.py` (dentro del repo)
- Log de estructura: `.meta/model.log` (dentro del repo)
- Entorno: `.meta/env.json` (dentro del repo)
