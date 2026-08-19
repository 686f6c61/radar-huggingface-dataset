# TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.4bpw

## Resumen

Qwen3.5-397B-A17B-VQ-2.4bpw es una cuantizacion vectorial (VQ) del modelo multimodal Qwen3.5-397B-A17B, realizada por TheDrainFlorist. El modelo base, desarrollado por Alibaba, es un mixture-of-experts con arquitectura gated delta networks, 397.000 millones de parametros totales y 17.000 millones activos, entrenado con fusion temprana sobre billones de tokens multimodales. Esta version cuantizada reduce el peso a 110,8 GiB, lo que permite ejecutar el modelo completo en un solo Mac con 128 GB de memoria unificada usando MLX, sin parches ni clusters.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de 397B en hardware de consumo de gama alta, a costa de una cuantizacion extrema de 2,4 bits por peso. El autor reporta mediciones reales de perplexity, velocidad y uso de memoria, lo que proporciona datos utiles para evaluar si esta aproximacion es aceptable para cargas de trabajo especificas. El modelo se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto en ingles, aunque incluye la torre de vision del modelo base (ignorada por MLX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con gated delta networks, multimodal (vision-lenguaje) |
| Parametros totales | 397B (modelo base); archivo safetensors contiene 102.441.562.608 parametros cuantizados |
| Parametros activos | 17B |
| Longitud de contexto | No disponible oficialmente; verificado 30.031 tokens en esta cuantizacion |
| Tipos de cuantizacion | 2,4 bpw (product quantization con codebooks de 256 entradas fp16 y escala fp16 por fila de 64 pesos); tambien disponibles 2,2 y 3,1 bpw |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B emplea una arquitectura mixture-of-experts con gated delta networks, una innovacion que combina atencion con mecanismos de actualizacion de estado similares a los de las redes recurrentes. Tiene 397B parametros totales y 17B activos por token, lo que lo hace eficiente en inferencia pese a su tamano. El entrenamiento del modelo base incluyo fusion temprana sobre billones de tokens multimodales, logrando paridad con Qwen3 en razonamiento, codigo, agentes y comprension visual.

La cuantizacion VQ aplicada por TheDrainFlorist utiliza product quantization: cada subvector de 4 pesos se representa con un indice uint8 en un codebook de 256 entradas fp16, con una escala fp16 por cada 64 pesos. Esto resulta en 2,25 bits por peso almacenado. Los codebooks se ajustan mediante k-means en el espacio de pesos, sin usar informacion de Hessian ni datos de activacion. El proceso de ajuste y ensamblaje tardo aproximadamente 2 horas en un M4 Max. La configuracion declara un `model_file: model.py` que contiene el runtime VQ con kernels Metal compilados via `mx.fast.metal_kernel`, permitiendo que una instalacion estandar de `mlx-lm` cargue el formato sin modificaciones.

## Capacidades

- Generacion de texto y razonamiento: es un modelo de tipo "thinking" que dedica tokens a razonar antes de responder, por lo que requiere presupuesto de `max_tokens` generoso.
- Codigo: la perplexity en codigo mixto es de 2,6383, ligeramente mejor que la alternativa comparada.
- Multimodal (vision): la torre de vision de 333 tensores se incluye a precision original (0,85 GiB), pero `mlx-lm` la ignora por ser solo texto. `exo` puede cargarla directamente; el soporte en `mlx-vlm` esta pendiente de un PR.
- Multilingue: solo se declara ingles en la model card, aunque el modelo base probablemente soporte mas idiomas; esta cuantizacion no lo especifica.
- No se documenta soporte explicito de tool calling o function calling en esta version cuantizada, aunque el modelo base podria tenerlo; no hay confirmacion en la informacion disponible.

## Casos de uso

- Asistente de texto local en Apple Silicon: un Mac con 128 GB puede ejecutar el modelo completo sin conexion, ideal para entornos con requisitos de privacidad o sin acceso a la nube. Se usa con `mlx-lm` mediante un comando simple.
- Prototipado rapido de aplicaciones de IA generativa: al caber en una sola maquina, se puede iterar sobre prompts, parametros y flujos sin depender de infraestructura remota.
- Investigacion sobre cuantizacion extrema: el autor publica mediciones detalladas de perplexity y runtime, lo que permite comparar el impacto de 2,4 bpw frente a otras cuantizaciones en tareas de lenguaje y codigo.
- Procesamiento de documentos largos: la ventana verificada de 30.031 tokens sin swap permite analizar informes, codigo fuente extenso o transcripciones en una sola pasada, siempre que el contenido quepa en ese limite.
- Evaluacion de modelos MoE en hardware de consumo: sirve como referencia para estudiar el equilibrio entre tamano, velocidad y calidad en arquitecturas de expertos activados por token.
- Servicio distribuido en dos Macs: mediante `exo` y tensor parallelism, se puede servir el modelo en una configuracion de doble maquina, replicando los codebooks VQ en lugar de particionarlos, con salida identica a la ejecucion en un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card reporta mediciones de perplexity y rendimiento en runtime, medidas sobre este artefacto exacto:

| Metrica | Este modelo (2,4 bpw) | spicyneuron 2.6bit |
|---|---|---|
| Perplexity wikitext (raw, prefix-8192) | 2,7655 | 3,1843 |
| Perplexity codigo (multilenguaje) | 2,6383 | 2,6667 |

| Runtime (M4 Max 128 GB, mlx-lm stock) | Valor |
|---|---|
| Tiempo de carga | ~60 s |
| Memoria residente | 110,8 GiB (pico 117,7 GiB a 30k contexto) |
| Contexto verificado | 30.031 tokens, cero crecimiento de swap |
| Decode | ~19-22 tok/s, plano desde 512 hasta 14k contexto |
| Prefill | ~40-50 tok/s (fragmentado, como hace mlx-lm nativamente) |

El autor advierte que las perplexities son especificas del corpus y no deben compararse entre distintos harnesses.

## Requisitos de hardware

- VRAM: 110,8 GiB residentes, con pico de 117,7 GiB a contexto largo. Requiere al menos 128 GB de memoria unificada en Apple Silicon.
- GPU recomendada: M4 Max con 128 GB (probado). No se mencionan otras GPU, pero al ser MLX, solo funciona en Apple Silicon.
- No cabe en GPU de consumo convencional (RTX 4090, etc.) por su tamaño y por la dependencia de MLX.
- Opciones de despliegue: `mlx-lm` (stock), `exo` para tensor parallelism distribuido en dos Macs. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: decode de 19-22 tok/s, prefill de 40-50 tok/s en M4 Max. La carga tarda ~60 segundos.
- Variables de entorno: `SCOUT_VQ_DECODE_CHUNK` permite ajustar el equilibrio entre velocidad de prefill y memoria pico en prompts largos.

## Comparativa con modelos similares

| Modelo | Tamano | Perplexity wikitext | Perplexity codigo | Memoria necesaria | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (base, sin cuantizar) | 397B totales, 17B activos | no disponible | no disponible | > 700 GB en fp16 | Apache 2.0 |
| TheDrainFlorist VQ-2.2bpw | 100,1 GiB | 3,1706 | 2,6988 | 128 GB | Apache 2.0 |
| **TheDrainFlorist VQ-2.4bpw (este)** | **110,8 GiB** | **2,7655** | **2,6383** | **128 GB** | **Apache 2.0** |
| TheDrainFlorist VQ-3.1bpw | 142,8 GiB | 2,3519 | 2,5987 | ≥192 GB o cluster | Apache 2.0 |
| spicyneuron 2.6bit | 120,6 GiB | 3,1843 | 2,6667 | no disponible | no disponible |

La comparativa muestra que esta version de 2,4 bpw ofrece mejor perplexity que la alternativa de 2,6 bit de spicyneuron, con menor tamano, a costa de un margen mas estrecho en codigo que en wikitext.

## Limitaciones y advertencias

- Ajuste muy justo en 128 GB: el pico de memoria de ~118 GiB deja poco margen para otras aplicaciones; se recomienda cerrar programas pesados antes de cargar el modelo.
- Modelo de razonamiento: gasta tokens en "pensar" antes de responder, por lo que un presupuesto de `max_tokens` insuficiente puede truncar la respuesta visible.
- Solo ingles declarado: no se garantiza soporte multilingue en esta cuantizacion, aunque el modelo base probablemente lo tenga.
- La torre de vision se ignora en `mlx-lm`: las capacidades multimodales no estan disponibles en el flujo de texto estandar; solo via `exo` o futuras versiones de `mlx-vlm`.
- Cuantizacion extrema de 2,4 bpw: puede degradar la calidad en tareas que requieren precision numerica o razonamiento complejo; la perplexity en codigo muestra una ventaja marginal frente a la alternativa.
- Tensor parallelism distribuido requiere replicar codebooks VQ, no particionarlos; el soporte en `exo` depende de un PR pendiente.
- No se documentan sesgos conocidos, pero al ser un modelo derivado de Qwen3.5, podria heredar sesgos del entrenamiento original; no hay evaluacion de sesgos en esta version.
- Riesgo de alucinacion: no se evalua especificamente; como todo LLM, puede generar contenido falso o inconsistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Recetas vLLM para Qwen3.5-397B-A17B: https://recipes.vllm.ai/Qwen/Qwen3.5-397B-A17B
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Repositorio de exo: https://github.com/exo-explore/exo
