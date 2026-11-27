# YukijThird/Inkling-2-Mini-Uncensored-12GB-128K-GGUF

## Resumen

Inkling-2-Mini-Uncensored-12GB-128K-GGUF es una cuantización GGUF publicada por YukijThird del modelo OpenUncensored/Inkling-2-Mini-Uncensored, una variante "abliterated" (sin censura) de Inkling 2 Mini. El modelo original tiene 26.400 millones de parámetros según la model card (28.788.294.144 según los pesos en safetensors), emplea una arquitectura MoE con 128 expertos por capa y un diseño de transformer con bucles ("looped transformer"), y está orientado a código y uso agéntico.

La aportación técnica de esta ficha no es el modelo en sí, sino el proceso de cuantización: el autor rellena con ceros la anchura intermedia de los expertos de 1152 a 1280 (múltiplo de 256) para que las matrices `down` puedan usar los mismos formatos de baja precisión que `gate_up` en llama.cpp, evitando que la pérdida de calidad se concentre en una sola matriz. El resultado es un archivo de 9.743 MiB (10,23 GB) que cabe en una GPU de 12 GB junto con una ventana de contexto de 128K tokens.

Es relevante ahora porque demuestra que es posible ejecutar un MoE de ~26B con 128K de contexto en hardware de consumo (medido en una Intel Arc B580 con Vulkan y llama.cpp estándar), con una divergencia KL media de 0,0369 frente a la referencia y un 94,24% de coincidencia en el token más probable. La licencia Apache 2.0 facilita su uso comercial, aunque el carácter "uncensored" del modelo base exige controles adicionales en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 128 expertos por capa, looped transformer |
| Parametros totales | 28.788.294.144 (según safetensors); 26,4B según la model card del autor |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF IQ2_XS, IQ2_S, IQ3_XXS (expertos); Q6_K (atención, salida, embeddings) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `Inkling-2-Mini-Uncensored-pad1280-IQ2_S-9.5G.gguf`, 9.743 MiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 128 expertos por capa y un núcleo con bucles ("loop core" situado en los bloques 6–17 según la receta de cuantización). La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esa información no está disponible. El modelo procede de OpenUncensored/Inkling-2-Mini-Uncensored, una variante abliterated del Inkling 2 Mini original, lo que implica una modificación de los pesos orientada a eliminar los rechazos del modelo.

La innovación técnica destacable de esta ficha es el relleno de la anchura de los expertos: las matrices `down` originales tienen anchura 1152, que no es múltiplo de 256, por lo que llama.cpp no puede aplicarles los formatos K e IQ y quedan en 4,25–4,5 bits por peso mientras `gate_up` cae a 1–2 bits. El autor añade filas y columnas de ceros hasta 1280 (5 × 256), fija `expert_feed_forward_length = 1280` y consigue que todas las matrices de experto usen formatos de baja precisión homogéneos (IQ2_XS en bloques 0–5, IQ2_S en 6–19, IQ3_XXS en 20–23), con un coste del 11% más de elementos almacenados y sin cambiar la salida. La matriz de importancia se calculó a partir de 120 fragmentos de 2.048 tokens con trayectorias de SWE-agent, conversaciones con tool calls, código en diez idiomas e instrucciones en ruso, mezclada con una matriz general publicada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con calidad de chat secundaria según el autor (el objetivo era código y agentes).
- Generación y comprensión de código en múltiples lenguajes (la matriz de importancia cubre diez lenguajes).
- Soporte de tool calling / function calling, con plantilla de chat específica para conversaciones con llamadas a herramientas.
- Uso agéntico: trayectorias de SWE-agent incluidas en el corpus de calibración, lo que indica soporte de razonamiento multi-paso.
- Capacidad multimodal de entrada image-text-to-text según el pipeline declarado en Hugging Face, aunque la model card no detalla el comportamiento de visión.
- Multilingüe limitado a inglés y ruso.
- Modo "thinking effort" configurable (la evaluación MMLU se hizo con esfuerzo 0).
- Variante sin censura (abliterated): no aplica rechazos por defecto en las respuestas.

## Casos de uso

- Agentes de código autónomos: el modelo está calibrado con trayectorias de SWE-agent y soporta tool calling, por lo que puede integrarse en bucles de resolución de incidencias sobre repositorios con 128K tokens de contexto para incluir varios archivos y el historial de intentos.
- Asistente de programación en local: con 10,23 GB de GGUF cabe en una GPU de 12 GB, lo que permite desplegar un asistente de autocompletado y refactorización sin depender de la nube, útil en entornos con requisitos de confidencialidad.
- Automatización de pipelines CI/CD: el soporte de function calling permite invocar herramientas de build, tests y análisis estático desde el propio modelo, generando parches y verificando resultados en pasos sucesivos.
- Procesamiento de documentación técnica extensa: la ventana de 128K tokens permite ingerir manuales, especificaciones o bases de código completas en una sola pasada para tareas de resumen y extracción.
- Atención al cliente en ruso e inglés: el modelo cubre ambos idiomas y puede gestionar conversaciones multi-turno, aunque la ausencia de censura exige filtros de salida adicionales en producción.
- Investigación sobre cuantización: el archivo y los scripts incluidos (`edit.py`, `corpus.py`, `p2.types`) sirven como referencia reproducible para estudiar el efecto del padding de expertos y las matrices de importancia en MoE.
- Despliegue en hardware Intel Arc: medido en una Arc B580 con Vulkan, es una opción para equipos con GPU Intel que no pueden usar CUDA.

## Benchmarks y rendimiento

| Metrica | Este archivo | Referencia / comparación |
|---|---|---|
| Tamano | 9.743 MiB | mudler APEX-I-Nano: 10.815 MiB |
| KL divergencia media | 0,0369 ± 0,0010 | 0,0430 ± 0,0011 (mudler APEX-I-Nano) |
| KL divergencia mediana | 0,0026 | 0,0035 (mudler APEX-I-Nano) |
| Coincidencia token top | 94,24% | 93,86% (mudler APEX-I-Nano) |
| Perplejidad | 2,180 | 2,172 (mudler APEX-I-Nano); 2,133 (referencia NVFP4/Q8_0) |
| MMLU (1.140 preguntas) | 77,28% | 79,47% (modelo sin cuantizar, según su model card) |

Comparación con otras cuantizaciones del modelo base (textos y referencias distintos, según el autor):

| Archivo | Tamano (GB) | KL media | Token top |
|---|---|---|---|
| unsloth UD-Q2_K_XL | 9,14 | 0,0595 | 91,6% |
| SC117 FIT-BALANCED | 9,79 | 0,0895 | 88,5% |
| Este archivo | 10,23 | 0,0369 | 94,2% |
| AtomicChat AD-IQ2_XXS | 10,43 | 0,084 | 88,5% |
| Strata SQ-10 | 10,47 | 0,050 | 92,4% |
| AtomicChat AD-IQ2_S | 11,56 | 0,047 | 91,3% |
| unsloth UD-IQ3_XXS | 11,66 | 0,0269 | 94,7% |

Variante descartada (eliminación de 24 expertos por capa): 9.660 MiB, KL media 0,0428, token top 94,54%, MMLU 68,95%, frente al 77,28% de este archivo. El autor concluye que el enrutamiento del modelo es casi uniforme y que eliminar expertos degrada el rendimiento.

## Requisitos de hardware

- VRAM estimada: 12.018 de 12.216 MiB en una Intel Arc B580 de 12 GB con contexto de 128K (medición del autor).
- GPU recomendadas: Intel Arc B580 (medida); cualquier GPU con 12 GB o más de VRAM que soporte Vulkan o CUDA a través de llama.cpp.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB como la Arc B580; en GPUs con menos de 12 GB no cabría con contexto de 128K, aunque podría reducirse la ventana o usar offloading a CPU.
- Opciones de despliegue: llama.cpp (build 12648 o posterior, backend Vulkan; el autor indica que llama.cpp estándar carga el archivo sin cambios). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles; el autor solo reporta uso de VRAM y métricas de calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este archivo (Inkling-2-Mini-Uncensored GGUF) | ~26,4B (MoE, 128 expertos) | 128K | Apache 2.0 | GGUF | KL media 0,0369; MMLU 77,28% |
| mudler Inkling-2-Mini-Uncensored-APEX-I-Nano | mismo modelo base | 128K (asumido) | Apache 2.0 | GGUF | KL media 0,0430; 10.815 MiB |
| unsloth UD-IQ3_XXS (mismo modelo base) | mismo modelo base | 128K (asumido) | Apache 2.0 | GGUF | KL media 0,0269; 11,66 GB |
| OpenUncensored/Inkling-2-Mini-Uncensored (original) | ~26,4B | 128K (asumido) | Apache 2.0 | safetensors | MMLU 79,47% según su model card |

No se dispone de datos sobre modelos de otros desarrolladores (por ejemplo, alternativas densas o MoE de tamaño similar) en la información proporcionada; la comparación se limita a cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Modelo "uncensored" / abliterated: no aplica rechazos por defecto, lo que puede producir contenido inapropiado, peligroso o ilegal; requiere filtros y moderación externos en cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Idiomas limitados a inglés y ruso; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La cuantización a ~2,3–3,1 bits por peso en los expertos introduce degradación: MMLU cae de 79,47% a 77,28% (con la advertencia de que el arnés de evaluación difiere) y la KL media no es cero.
- El autor indica explícitamente que la calidad de chat no era un objetivo; el modelo está ajustado para código y uso agéntico.
- El padding de expertos añade un 11% más de elementos almacenados; no cambia la salida, pero algunos tensores pequeños conservan su precisión original y el archivo depende de que llama.cpp interprete `expert_feed_forward_length = 1280` (compatible con la versión estándar, según el autor).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede arrastrar obligaciones adicionales no detalladas en la información disponible; conviene verificar la licencia del modelo original.
- Las mediciones de VRAM y rendimiento se hicieron en una única configuración (Intel Arc B580, Vulkan, llama.cpp build 12648); el comportamiento en otras GPUs o backends no está verificado.

## Enlaces

- Hugging Face: https://huggingface.co/YukijThird/Inkling-2-Mini-Uncensored-12GB-128K-GGUF
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Cuantización comparable de mudler: https://huggingface.co/mudler/Inkling-2-Mini-Uncensored-APEX-I-Nano (referenciada en la model card)
- llama.cpp: no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
