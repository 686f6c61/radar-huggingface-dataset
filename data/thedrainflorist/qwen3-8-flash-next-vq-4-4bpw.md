# TheDrainFlorist/Qwen3.8-Flash-Next-VQ-4.4bpw

## Resumen

Qwen3.8-Flash-Next-VQ-4.4bpw es una compilación cuantizada mediante cuantización vectorial (VQ) del modelo Qwen3.8-Flash-Next, publicada por el usuario TheDrainFlorist. El modelo base es un MoE de frontera de 180B parámetros totales con 10 de 512 expertos activos, 51,2B parámetros en una tabla de embeddings n-gram PLE y capacidad de visión. Esta versión reduce el peso a unos 93,6 GiB (147,6 GB de repositorio), lo que permite ejecutar un modelo de esa escala en máquinas Apple Silicon de 128 GB de memoria unificada mediante MLX.

La compilación emplea cuantización vectorial data-free con codebooks k-means por capa: los expertos MoE y el PLE a d=2/K=256, y siete capas concretas (0, 1, 2, 16, 24, 31, 39) a d=2/K=1024 con empaquetado de 10 bits. El artefacto incluye el runtime VQ dentro del checkpoint como `model.py`, de modo que `mlx-lm` estándar puede ejecutarlo sin parches, aunque la arquitectura `qwen4_exp` del modelo base aún no está en ninguna versión publicada de `mlx-lm`.

Su relevancia es práctica: demuestra una vía para servir un MoE de 180B en hardware de consumo profesional Apple con pérdida de calidad medida y acotada (KL de 52,7 a 63,1 millinats por token frente al profesor bf16 según el corpus), algo que las cuantizaciones afines tradicionales no consiguen a ese nivel de compresión. La licencia es `qwen-community-1.0`, no estándar, y el modelo solo declara inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención estándar, PLE (per-layer n-gram embedding) y torre de visión; arquitectura `qwen4_exp` |
| Parametros totales | 88.826.819.731 (pesos safetensors del checkpoint cuantizado); el modelo base declara 180B totales |
| Parametros activos | 10 de 512 expertos por token (MoE); 51,2B en la tabla PLE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización vectorial (VQ) data-free: expertos MoE y PLE a d=2/K=256; capas 0, 1, 2, 16, 24, 31 y 39 a d=2/K=1024 con empaquetado de 10 bits; I/O en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX), con `model.py` incluido en el checkpoint |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos de 180B parámetros totales y 10 de 512 expertos activos por token, complementado por una tabla de embeddings n-gram por capa (PLE) de 51,2B parámetros y una torre de visión. Esta compilación no reentrena el modelo: aplica cuantización vectorial data-free, es decir, ajusta codebooks k-means por capa sin datos de calibración, sobre los pesos del profesor en bf16.

La asignación de codebooks se eligió mediante un barrido leave-one-out y add-one sobre las 42 capas, ejecutado sobre los codebooks propios de esta escala (v2). El resultado promueve L2, L16 y L24 a d=2/K=1024 y degrada L35 y L36 a d=2/K=256, con un coste de +326 MB (0,33%) y un tamaño final de 94,4 GiB en la revisión v2. El autor documenta que el conjunto óptimo de capas no se transfiere entre escalas de compresión: la mejor capa en esta escala (L2) es perdedora en la escala 3.2, y la mejor de la 3.2 (L5) es la peor aquí. El runtime VQ incluido incorpora kernels específicos (device-codebook kernel, ragged-subvector, brazo d8 fusionado y memo de routing) con ganancias de hasta 1,46x en prefill para geometrías afectadas, sin cambios en la calidad de salida (bit-idénticos o equivalentes a 1 ULP).

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y matemáticas, heredados del modelo base (sin benchmarks publicados en esta ficha).
- Generación de código, con soporte de tool calling según las capacidades del modelo base (no verificado de forma independiente en esta compilación).
- Procesamiento de visión: el modelo base incluye torre de visión y la model card describe instrucciones de uso para visión.
- Decodificación especulativa mediante cabecera MTP (`mtp-head-q6.safetensors`) cuando el modelo la incluye, con un coste de aproximadamente 2,2 GiB residentes adicionales.
- Ejecución distribuida en dos o más Macs mediante Knurlogic, con reparto del modelo entre máquinas.
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de frontera en Apple Silicon: un Mac Studio o MacBook Pro con 128 GB de memoria unificada puede cargar los 93,6 GiB del checkpoint y servir generación de texto sin GPU dedicada, gracias a la compresión VQ y al runtime MLX incluido.
- Asistentes de código en estación de trabajo: el modelo puede integrarse en editores o CLI locales para autocompletado y explicación de código, aprovechando la ventana de contexto del modelo base y evitando enviar código propietario a la nube.
- Procesamiento de documentos con imagen: al conservar la torre de visión del modelo base, permite extracción y descripción de contenido en capturas, diagramas o páginas escaneadas en flujos locales.
- Clúster doméstico de dos Macs: con Knurlogic se puede repartir el modelo entre dos máquinas y servir una API compatible con OpenAI para equipos pequeños, con decodificación especulativa activada para mejorar el throughput.
- Experimentación en investigación sobre cuantización: el checkpoint y su `model.py` sirven como referencia reproducible para estudiar el impacto de la asignación de codebooks por capa (d=2/K=256 frente a d=2/K=1024) en la divergencia KL frente al profesor bf16.
- Generación de texto asistida por recuperación en inglés: con contexto largo del modelo base, se puede usar para resumir y responder sobre corpus documentales en inglés en entornos con requisitos de soberanía de datos.
- Evaluación comparativa de runtimes MLX: útil para medir prefill y decode en distintas geometrías de codebook y validar los kernels nuevos del runtime VQ frente a compilaciones afines.

## Benchmarks y rendimiento

El autor publica métricas de divergencia KL frente al profesor bf16 (millinats por token, posiciones emparejadas, tres corpus internos de 12288 tokens, |t| > 2 considerado diferencia real) para la revisión v2 de codebooks:

| Corpus | v1 | v2 | Cambio | t |
|---|---|---|---|---|
| Prosa | 63,1 | 52,7 | -16,5% | -10,7 |
| Código | 13,1 | 12,9 | -1,5% | -0,6 |
| Literario | 42,6 | 42,9 | +0,7% | +0,7 |

Perplejidad en las mismas ejecuciones (no usada como criterio de selección): prosa 5,0583 → 5,2045; código 1,6292 → 1,6315; literario 6,5232 → 6,5297. Estas cifras se midieron en el runtime anterior a Knurlogic 0.1.3 y no son comparables con las métricas de la revisión de octubre.

Rendimiento de runtime: el perfil v2 declara +11% en prefill y +19% en decode frente al runtime arc6 publicado el 2026-09-09. El throughput medido a través de exo solo existe para la escala 2.1bpw (23,7–25,5 tok/s, aceptación 0,82–0,88 en decodificación especulativa); no hay cifras de throughput publicadas para esta escala de 4.4bpw. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria: aproximadamente 93,6 GiB de pesos, más overhead del runtime y del KV cache; encaja en máquinas Apple Silicon de 128 GB de memoria unificada. El autor indica un presupuesto de unos 2,2 GiB adicionales si se activa la decodificación especulativa con la cabecera MTP.
- GPU: no aplica; el artefacto es MLX y está pensado para Apple Silicon (M-series). No es ejecutable en CUDA sin reconversión, que no se documenta.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones consumer NVIDIA; el requisito es memoria unificada de 128 GB en Mac.
- Despliegue: `mlx-lm` estándar con el runtime VQ incluido en el checkpoint, o Knurlogic 0.1.3 o superior. Sin Knurlogic, es necesario instalar `mlx-lm` desde el PR #1788 de ml-explore para obtener la arquitectura `qwen4_exp`. Knurlogic permite además repartir el modelo entre dos o más Macs y activar drafting.
- Latencia y throughput: no disponibles para esta escala; solo hay cifras publicadas para la escala 2.1bpw a través de exo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-VQ-4.4bpw (este) | 180B totales / 10 de 512 activos (88,8B en safetensors) | no disponible | VQ 4.4bpw, MLX | qwen-community-1.0 | Hugging Face, 165 descargas |
| Qwen3.8-Flash-Next (base) | 180B totales / 10 de 512 activos | no disponible | bf16 | qwen-community-1.0 | Hugging Face (Qwen) |
| Compilaciones afines del mismo autor (misma escala) | mismas | no disponible | afín, MLX | qwen-community-1.0 | Hugging Face |
| Escala 2.1bpw del mismo modelo | mismas | no disponible | VQ 2.1bpw, MLX | qwen-community-1.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base y a la escala de compresión inferior del mismo autor, que son las referencias documentadas en la model card. No se dispone de datos de benchmarks estándar que permitan comparar con otros MoE de frontera.

## Limitaciones y advertencias

- Requiere Knurlogic 0.1.3 o superior para una salida correcta. Versiones anteriores y compilaciones estándar de `mlx-lm` de `qwen4_exp` reconstruyen los multiplicadores hash del PLE desde una semilla por defecto incorrecta y leen filas erróneas en cada token: el modelo carga y genera, pero con calidad degradada.
- Sin Knurlogic, es imprescindible instalar `mlx-lm` desde el PR #1788, aún sin fusionar; con `pip install mlx-lm` se obtiene `ModuleNotFoundError: No module named 'mlx_lm.models.qwen4_exp'`.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Licencia `qwen-community-1.0`: no es una licencia de código abierto estándar; revisar los términos antes de uso comercial.
- La cuantización VQ introduce pérdida de calidad medible: la divergencia KL frente al profesor bf16 es de 52,7 millinats por token en prosa y 42,9 en literario, con un empeoramiento del 0,7% en literario en la revisión v2.
- La perplejidad no es un criterio fiable en esta familia: el autor documenta que discrepa en signo con la KL en prosa (F116–F118).
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de sesgo ni de seguridad para esta compilación.
- Los benchmarks publicados son internos del autor (corpus propios, runtime concreto) y no comparables con evaluaciones estándar ni entre revisiones de runtime.
- El artefacto está atado a MLX y Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrainFlorist/Qwen3.8-Flash-Next-VQ-4.4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de construcción VQLab: https://github.com/noahzelezny/VQLab
- Runtime Knurlogic: https://github.com/noahzelezny/Knurlogic
- PR de arquitectura `qwen4_exp` en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/1788
