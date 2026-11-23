# TheDrainFlorist/Qwen3.8-Flash-Next-VQ-2.1bpw

## Resumen

Qwen3.8-Flash-Next-VQ-2.1bpw es una cuantización vectorial (VQ) del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario TheDrainFlorist. Se trata de un artefacto de inferencia para Apple Silicon que reduce un MoE de aproximadamente 180B parámetros totales (con 10 de 512 expertos activos y 51,2B en tablas n-gram PLE) hasta unos 45,3 GiB, permitiendo ejecutarlo en máquinas con 64 GB de memoria unificada. El checkpoint incluye su propio runtime VQ como `model.py`, de modo que `mlx-lm` estándar puede ejecutarlo sin parches, aunque la arquitectura base `qwen4_exp` aún no está en ninguna versión publicada de `mlx-lm`.

El modelo es relevante porque demuestra una vía práctica para servir un MoE de frontera en hardware de consumo Apple, combinando cuantización vectorial data-free con asignación de codebooks por capa elegida mediante divergencia KL. La ficha de Hugging Face reporta 374 descargas y 5 likes, con un repositorio de 129,3 GB que incluye múltiples variantes y artefactos auxiliares.

La información disponible es la model card del autor y los metadatos de Hugging Face. No hay papers, benchmarks estándar (MMLU, HumanEval, GSM8K) ni documentación oficial de Qwen sobre el modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4_exp`) con tablas de embedding n-gram por capa (PLE) y torre de visión; runtime VQ empaquetado en el checkpoint |
| Parametros totales | 24.445.301.395 (dato real de safetensors); la model card describe el modelo base como ~180B totales / 10 de 512 expertos activos, 51,2B en n-gram PLE |
| Parametros activos | 10 de 512 expertos (MoE); cifra exacta de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización vectorial (VQ) con codebooks data-free: expertos gate/up a d=8/K=16384 (códigos de 14 bits), down_proj a d=4/K=256, tablas PLE a d=8/K=256 (filas de 8 bits); capas 0–1 y banda 27–33, 35, 47 a d=4/K=256 en gate/up; etiquetado 8-bit |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (librería `mlx`), con `model.py` empaquetado y `mtp-head-q6.safetensors` para decodificación especulativa |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 expertos, de los cuales 10 se activan por token, más tablas de embedding n-gram por capa (PLE) de 51,2B parámetros y una torre de visión. La arquitectura se identifica como `qwen4_exp` y está implementada en el PR #1788 de ml-explore/mlx-lm, sin fusionar a fecha de 2026-09-09. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO.

Esta publicación no reentrena el modelo: aplica cuantización vectorial data-free mediante la herramienta VQLab. Los codebooks son ajustes k-means sin datos, y la asignación de qué capas reciben el nivel más ancho se eligió con `vqlab alloc-sweep` sobre tres corpus internos (prosa, código y literario) a 12288 tokens, midiendo divergencia KL contra el profesor bf16. La versión v2 (2026-09-17) degradó 46 `down_proj` de d8-K16384 a d4-K256 y promovió gate/up a d4-K256 en las capas 27–33, 35 y 47, reduciendo el tamaño de 45,8 a 45,3 GiB. El runtime incluido incorpora optimizaciones de kernel para geometrías de codebook grandes (hasta 1,46x en prefill en los niveles afectados), una relajación de subvectores irregulares (hasta 1,34x) y una memoización de routing (aproximadamente 2%).

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, según el pipeline `text-generation`.
- Procesamiento de visión: el checkpoint incluye torre de visión y ocupa 45,3 GiB con ella.
- Decodificación especulativa mediante `mtp-head-q6.safetensors`, con aceptación medida de 0,82–0,88.
- Ejecución distribuida en dos o más Macs mediante Knurlogic, con reparto del modelo entre nodos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Inferencia local de un MoE de frontera en Mac de 64 GB: el modelo ocupa 45,3 GiB con torre de visión, por lo que cabe en memoria unificada de 64 GB y permite ejecutar un modelo de escala 180B sin GPU dedicada.
- Servicio distribuido en clúster de Macs: con Knurlogic se reparte un único modelo entre dos o más máquinas, lo que permite sumar memoria unificada y servir el modelo desde una interfaz común.
- Generación de texto asistida por visión en local: la torre de visión incluida permite tareas de descripción de imágenes y respuesta a preguntas visuales sin salir del dispositivo, útil en entornos con requisitos de privacidad.
- Decodificación de baja latencia en Apple Silicon: con el cabezal MTP se alcanzan 23,7–25,5 tok/s de decode en un M4 de un solo nodo, adecuado para asistentes interactivos en local.
- Evaluación e investigación de cuantización vectorial: el checkpoint sirve como referencia reproducible de VQ con asignación de codebooks por capa guiada por KL, con métricas publicadas de perplejidad y KL frente al profesor bf16.
- Prototipado de pipelines de texto en inglés: al estar limitado a inglés, encaja en flujos de generación, resumen y reescritura en ese idioma sobre hardware Apple, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad frente al profesor bf16 y rendimiento de decode:

| Metrica | v1 | v2 | Cambio | t |
|---|---|---|---|---|
| KL prosa (millinats/token) | 409,6 | 383,9 | -6,3% | -7,3 |
| KL código (millinats/token) | 109,4 | 100,1 | -8,5% | -6,1 |
| KL literario (millinats/token) | 356,9 | 334,0 | -6,4% | -9,2 |
| Perplejidad prosa | 5,8255 | 5,7485 | — | — |
| Perplejidad código | 1,7243 | 1,7128 | — | — |
| Perplejidad literario | 7,8240 | 7,6574 | — | — |

Medido en el runtime anterior a Knurlogic 0.1.3, por lo que no es comparable con las cifras de decode. El rendimiento de decode medido en un M4 de un solo nodo a través de exo es de 23,7–25,5 tok/s con aceptación 0,82–0,88.

## Requisitos de hardware

- VRAM/memoria estimada: 45,3 GiB con torre de visión (v2); el repositorio completo ocupa 129,3 GB.
- Cabe en Mac con 64 GB de memoria unificada; en esa configuración el modelo deja poco margen para otras aplicaciones.
- GPU recomendadas: Apple Silicon (M-series); el runtime está pensado para `mlx` y Apple Silicon. No hay datos para A100, H100 o RTX 4090.
- Despliegue: `mlx-lm` con la arquitectura `qwen4_exp` (requiere el PR #1788 o una versión que la incluya), Knurlogic 0.1.3 o superior, y exo como ruta de servicio anterior. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 23,7–25,5 tok/s de decode en M4 de un solo nodo con decodificación especulativa; el presupuesto adicional del cabezal MTP es de aproximadamente 2,2 GiB residentes.
- Clúster: Knurlogic permite repartir el modelo entre dos o más Macs con la misma versión instalada en cada nodo.

## Comparativa con modelos similares

La model card menciona builds afines del mismo autor, convertidos con las mismas herramientas y evaluados con el mismo instrumento, pero no proporciona sus especificaciones completas. No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-VQ-2.1bpw | 24.445.301.395 en safetensors; base ~180B MoE | no disponible | qwen-community-1.0 | Hugging Face, 374 descargas | VQ para Apple Silicon, 45,3 GiB |
| Qwen3.8-Flash-Next (base) | ~180B totales, 10 de 512 activos | no disponible | qwen-community-1.0 | Hugging Face | Pesos originales; requiere runtime compatible con `qwen4_exp` |
| Builds afines del mismo autor | no disponible | no disponible | no disponible | mismas herramientas de conversión | Solo citados como referencia de comparación en la model card |

## Limitaciones y advertencias

- Requiere Knurlogic 0.1.3 o superior: versiones anteriores reconstruyen los multiplicadores hash de las tablas PLE con una semilla por defecto incorrecta y leen filas equivocadas en cada token, degradando la salida sin fallar.
- Con `mlx-lm` estándar es necesario instalar el PR #1788, aún sin fusionar; de lo contrario aparece `ModuleNotFoundError: No module named 'mlx_lm.models.qwen4_exp'`.
- Idiomas: solo inglés según los metadatos; no se debe asumir calidad en castellano ni en otros idiomas.
- Licencia `qwen-community-1.0`: es necesario revisar sus términos antes de uso comercial; la información proporcionada no detalla restricciones concretas.
- La cuantización introduce degradación medible frente al profesor bf16 (KL de 100,1 a 383,9 millinats por token según corpus), con mayor pérdida en prosa y texto literario que en código.
- Riesgo de alucinación y sesgos: no hay documentación específica en la información disponible.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- En Mac de 64 GB, el modelo con visión ocupa 45,3 GiB y el cabezal de decodificación especulativa añade unos 2,2 GiB, dejando poco margen para el sistema y otras aplicaciones.
- El repositorio de 129,3 GB implica una descarga considerable y espacio en disco significativo.

## Enlaces

- Hugging Face: https://huggingface.co/TheDrainFlorist/Qwen3.8-Flash-Next-VQ-2.1bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantización VQLab: https://github.com/noahzelezny/VQLab
- Runtime Knurlogic: https://github.com/noahzelezny/Knurlogic
- PR de arquitectura en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/1788
