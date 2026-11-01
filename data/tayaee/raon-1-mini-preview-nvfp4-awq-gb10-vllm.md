# tayaee/Raon-1-mini-preview-NVFP4-AWQ-GB10-vLLM

## Resumen

Raon-1-mini-preview-NVFP4-AWQ-GB10-vLLM es una cuantización de 4 bits del modelo base KRAFTON/Raon-1-mini-preview, publicada por el usuario tayaee. El modelo base es un transformer de tipo mezcla de expertos (MoE) con aproximadamente 15.950 millones de parámetros totales, entrenado principalmente para coreano e inglés. Esta versión concreta aplica cuantización NVFP4 (formato E2M1 con escalas por bloque) mediante AWQ Lite y ModelOpt, con activaciones escaladas dinámicamente a FP8 en inferencia.

El checkpoint está diseñado exclusivamente para hardware NVIDIA GB10 (DGX Spark, sm_121) y se almacena en formato `modelopt_fp4`, que `transformers` no puede cargar. Requiere un fork específico de vLLM mantenido por el mismo autor (tayaee/raon-vllm-spark, rama gb10-support). El objetivo declarado es reducir el tamaño del checkpoint de 53,61 GB a 19,25 GB (-64 %) manteniendo la calidad del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización agresiva (W4A4) sobre arquitecturas MoE; por otro, el propio autor advierte explícitamente de que el checkpoint **no supera el umbral de calidad** y no debe usarse en producción. La precisión en GSM8K cae de 0,945 a 0,170 y en KMMLU de 0,565 a 0,300, muy por debajo de los umbrales de aceptación definidos (caída máxima de 0,02 y 0,03 respectivamente). Se publica como material de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capa densa inicial; arquitectura personalizada no compatible con vLLM estándar |
| Parametros totales | 15.948.648.162 (~15,95 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1) W4A4 con escalas por bloque (block_size=16); activaciones escaladas dinámicamente a FP8; capas no cuantizadas en BF16: `lm_head`, `embed_tokens`, capa densa 0, `self_attn`, `moe.gate` (router) y `shared_experts` |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `modelopt_fp4` (safetensors empaquetados); no cargable por `transformers`; requiere vLLM fork |
| Tamano del checkpoint | 19,25 GB (frente a 53,61 GB del base en BF16) |
| Hardware objetivo | NVIDIA GB10 (DGX Spark, sm_121) |
| Algoritmo de cuantizacion | NVFP4 (AWQ Lite, ModelOpt) |
| Calibracion | 256 muestras, seq_len 2048 (corpus coreano de instrucciones + chat en inglés) |
| Revision base | `da4cf162c8613993f2189ebb438a5f9a23f3e5ca` |

## Arquitectura y entrenamiento

El modelo base KRAFTON/Raon-1-mini-preview emplea una arquitectura de mezcla de expertos (MoE) con una capa densa inicial, atención estándar (`self_attn`), router de expertos (`moe.gate`) y expertos compartidos (`shared_experts`). La familia Raon-1-mini usa una arquitectura personalizada que impide su carga en vLLM estándar; en GB10 el fork precompilado de KRAFTON falla en la inicialización del motor, por lo que es necesario compilar el fork de tayaee desde código fuente (requiere `nvcc` de CUDA 13.0 y ~50 GB de disco libre).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO en el modelo base. La cuantización de esta versión se realizó con AWQ Lite y ModelOpt sobre 256 muestras de calibración con longitud de secuencia 2048, usando un corpus en dominio de instrucciones en coreano mezclado con datos de chat en inglés. Los pesos se almacenan en NVFP4 con escalas por bloque de 16 elementos; las activaciones se escalan dinámicamente a FP8 durante la inferencia, mientras que normalización, atención, router, expertos compartidos y cabeza de lenguaje permanecen en BF16 para preservar estabilidad numérica.

## Capacidades

- Generación de texto conversacional en coreano e inglés.
- Razonamiento aritmético y matemático (capacidad severamente degradada por la cuantización; ver benchmarks).
- Conocimiento general y de dominio coreano (evaluado mediante KMMLU; también degradado).
- Cumplimiento de formato de instrucciones: 0,900 de acierto en 10 casos fijos, igual que el modelo base.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso en la información disponible.
- No se documenta soporte de visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas a coreano e inglés según los metadatos del modelo.

## Casos de uso

- **Experimentación con cuantización NVFP4 en hardware Blackwell**: el checkpoint sirve para validar el pipeline de cuantización AWQ Lite + ModelOpt y el loader `modelopt_fp4` del fork de vLLM sobre GB10, midiendo latencia y throughput reales (11,5 tok/s, p50 de 0,087 s a concurrencia 1).
- **Desarrollo y depuración de kernels para GB10**: útil para probar el fork tayaee/raon-vllm-spark y verificar que los kernels NVFP4 cargan y ejecutan correctamente en sm_121 antes de portar mejoras a checkpoints que sí pasen el umbral de calidad.
- **Investigación sobre degradación de calidad en MoE cuantizados**: los datos publicados (caída de 0,775 en GSM8K y 0,265 en KMMLU) permiten estudiar qué capas (router, expertos compartidos, atención) son más sensibles a W4A4 y guiar futuras calibraciones.
- **Pruebas de integración de formato de instrucciones**: con cumplimiento de formato de 0,900, puede usarse para validar parsers y plantillas de chat en pipelines de serving, sin depender de la corrección factual de las respuestas.
- **Evaluación comparativa de stacks de serving**: al no poder cargarse con `transformers`, sirve para comparar el rendimiento del fork de vLLM frente a alternativas en el mismo hardware, aislando el efecto del stack.
- **Generación de conversión a BF16 para inspección**: el repositorio incluye `nvfp4_to_bf16.py`, que permite reconstruir pesos en BF16 (~56 GB) para análisis offline de los efectos de la cuantización, aunque el resultado es mayor que el modelo base.

## Benchmarks y rendimiento

| Metrica | Modelo base (BF16) | Este modelo (NVFP4) | Cambio | Umbral | Resultado |
|---|---:|---:|---|---|---|
| GSM8K accuracy | 0,945 (189/200) | 0,170 (34/200) | -0,775 | caída ≤ 0,02 | FAIL |
| KMMLU accuracy | 0,565 (113/200) | 0,300 (60/200) | -0,265 | caída ≤ 0,03 | FAIL |
| Cumplimiento de formato | 0,900 (9/10) | 0,900 (9/10) | 0 | ≥ 0,9 | PASS |
| Tamano de checkpoint | 53,61 GB | 19,25 GB | -64 % | 15,0–28,0 GB | PASS |
| Throughput (vLLM fork, C=1) | no disponible | 11,5 tok/s | — | — | — |
| Latencia p50 (vLLM fork, C=1) | no disponible | 0,087 s | — | — | — |

Notas metodológicas publicadas por el autor: GSM8K evaluado sobre `openai/gsm8k@740312add88f` con seed 20261024, n=1319, 200 respondidas y puntuadas; KMMLU sobre `HAERAE-HUB/KMMLU`. La comparación mezcla pérdida de cuantización con diferencias de stack y kernels (el base se midió in-process con `transformers` y este modelo a través del fork de vLLM), por lo que la caída debe leerse como cota superior de la pérdida por cuantización.

## Requisitos de hardware

- **Hardware objetivo**: NVIDIA GB10 (DGX Spark, sm_121). El checkpoint no está pensado para otro hardware.
- **VRAM estimada**: el checkpoint ocupa 19,25 GB en disco; el autor no publica la VRAM en ejecución, pero al mantenerse varias capas en BF16 y requerir el fork de vLLM, se recomienda disponer de al menos el espacio del checkpoint más overhead del motor (no disponible con precisión).
- **GPU no soportadas**: B300, H100, RTX 4090 y demás hardware no Blackwell GB10 no pueden cargar este checkpoint con `transformers` ni con vLLM estándar. Para esos casos debe usarse el modelo base KRAFTON/Raon-1-mini-preview.
- **Despliegue**: exclusivamente mediante el fork `tayaee/raon-vllm-spark` (rama `gb10-support`), compilado desde fuente. Requisitos: `nvcc` de CUDA 13.0 en `PATH` y ~50 GB de disco libre para la compilación.
- **Throughput y latencia medidos**: 11,5 tok/s y p50 de 0,087 s con concurrencia 1 en una única GB10, sobre una carga fija de 8 prompts.
- **Conversión alternativa**: `nvfp4_to_bf16.py` genera un checkpoint BF16 de ~56 GB cargable por `transformers`, pero es una vía de conveniencia, no la ruta prevista.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Hardware | Calidad |
|---|---|---|---|---|---|---|
| tayaee/Raon-1-mini-preview-NVFP4-AWQ-GB10-vLLM | ~15,95 B (MoE) | no disponible | Apache 2.0 | `modelopt_fp4` (19,25 GB) | GB10 exclusivamente | GSM8K 0,170; KMMLU 0,300 |
| KRAFTON/Raon-1-mini-preview (base) | ~15,95 B (MoE) | no disponible | Apache 2.0 | BF16 (53,61 GB) | GPU estándar con vLLM fork de KRAFTON | GSM8K 0,945; KMMLU 0,565 |
| KRAFTON/Raon-1-mini-preview (BF16 convertido desde este checkpoint) | ~15,95 B (MoE) | no disponible | Apache 2.0 | BF16 (~56 GB) | GPU estándar con `transformers` | No medida; reconstrucción del cuantizado |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE ~16 B en coreano/inglés) en la documentación proporcionada.

## Limitaciones y advertencias

- **No apto para producción**: el propio autor indica que el checkpoint falla el umbral de calidad. GSM8K cae 0,775 puntos y KMMLU 0,265, muy por encima de las tolerancias definidas.
- **Riesgo alto de alucinación y errores aritméticos**: la precisión en GSM8K (0,170) implica respuestas matemáticas incorrectas en la mayoría de los casos.
- **Compatibilidad restringida**: solo funciona en GB10 (sm_121) con un fork específico de vLLM; `transformers` y vLLM estándar no pueden cargarlo.
- **Sesgos**: no documentados en la información disponible; al estar entrenado principalmente en coreano e inglés, el rendimiento en otros idiomas no está caracterizado.
- **Limitaciones de contexto e idioma**: la longitud de contexto no se publica; los idiomas soportados se limitan a coreano e inglés.
- **Licencia Apache 2.0**: permite uso comercial, pero la baja calidad desaconseja su uso en producción; para uso comercial debe emplearse el modelo base o un checkpoint que supere la puerta de calidad.
- **Comparación de benchmarks no estrictamente equivalente**: la caída de precisión mezcla pérdida de cuantización con diferencias de stack (fork de vLLM frente a `transformers` in-process), como advierte el propio autor.
- **Carga de compilación**: requiere compilar vLLM desde fuente con CUDA 13.0 y ~50 GB de disco, lo que añade fricción operativa.

## Enlaces

- HuggingFace: https://huggingface.co/tayaee/Raon-1-mini-preview-NVFP4-AWQ-GB10-vLLM
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Fork de vLLM para GB10: https://github.com/tayaee/raon-vllm-spark/tree/gb10-support
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset KMMLU: https://huggingface.co/datasets/HAERAE-HUB/KMMLU
