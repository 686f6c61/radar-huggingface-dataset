# wasifb/ThinkingCap-Qwen3.8-27B-AutoRound-W4A16

## Resumen

ThinkingCap-Qwen3.8-27B-AutoRound-W4A16 es una cuantización INT4 del modelo de razonamiento ThinkingCap-Qwen3.8-27B, desarrollado por BottleCap AI como fine-tune de razonamiento sobre Qwen3.8-27B del equipo Qwen. Esta versión concreta la publica el usuario wasifb mediante AutoRound de Intel, con el objetivo de reducir el peso del checkpoint a 19,0 GB y permitir su despliegue en configuraciones de dos GPU de 24 GB, algo inviable con los pesos en precisión completa.

El modelo base es multimodal (pipeline image-text-to-text) y está orientado a tareas de razonamiento con modo de pensamiento explícito, con un esfuerzo de razonamiento configurable mediante la plantilla de chat. La cuantización conserva la cabeza MTP (multi-token prediction) para decodificación autoespeculativa, lo que mantiene las ventajas de latencia del modelo original en vLLM.

La relevancia de esta ficha radica en que BottleCap AI publica versiones FP8, NVFP4 y GGUF, pero no una INT4 AutoRound; esta build cubre ese hueco con un recetario de cuantización documentado y validado en hardware de consumo profesional (2× RTX 3090). La licencia es PolyForm Small Business 1.0.0, con permiso de uso personal adicional y requisito de licencia comercial para organizaciones que no califiquen como pequeña empresa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3-Next (atención lineal GDN + atención completa), con cabeza MTP; multimodal (image-text-to-text) |
| Parámetros totales | 3.029.765.360 (según safetensors del repo de cuantización) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de validación con 262K de contexto) |
| Tipos de cuantización | W4A16: int4 simétrico, group size 128, empaquetado `auto_round:auto_gptq`; módulos sensibles en BF16 |
| Idiomas soportados | no disponible |
| Licencia | PolyForm Small Business 1.0.0 (con permiso de uso personal de BottleCap AI); uso comercial por organizaciones no elegibles requiere licencia de BottleCap AI |
| Formato de pesos | safetensors (transformers); compatible con carga en vLLM |

## Arquitectura y entrenamiento

El modelo base ThinkingCap-Qwen3.8-27B es un fine-tune de razonamiento de Qwen3.8-27B, que emplea una arquitectura híbrida Qwen3-Next: capas con atención lineal basada en GDN (gated delta networks) combinadas con capas de atención completa, más una cabeza MTP para decodificación especulativa. La cuantización mantiene en BF16 el `lm_head`, los embeddings, la torre de visión, las proyecciones `linear_attn.in_proj_a` e `in_proj_b` del bloque GDN, `mtp.fc` y todas las normalizaciones; el resto de pesos lineales se cuantizan a int4.

El proceso de cuantización se realizó con auto-round 0.14.2: 200 iteraciones, 512 muestras de calibración, longitud de secuencia 2048 y `enable_alg_ext=True`, usando el dataset por defecto de AutoRound (`NeelNanda/pile-10k`). Los siete pesos lineales de la capa MTP se cuantizan a int4 con redondeo al más cercano sin ajuste fino. El layout empaquetado es idéntico tensor a tensor al de `Frozenlock/Qwen3.8-27B-int4-AutoRound`, por lo que debería cargarse en cualquier entorno compatible con ese checkpoint; solo difiere la receta de ajuste. No se dispone de información sobre el dataset de entrenamiento del fine-tune original ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito, con esfuerzo de razonamiento configurable (`reasoning_effort`, por defecto `xhigh`).
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), incluyendo torre de visión conservada en BF16 tras la cuantización.
- Generación de código, con parser de tool calling específico `qwen3_coder` en vLLM.
- Tool calling y function calling nativos (`--enable-auto-tool-choice` en vLLM).
- Razonamiento multi-paso y flujos de agente mediante el modo de pensamiento y el parser de razonamiento `qwen3`.
- Decodificación especulativa autoespeculativa mediante la cabeza MTP conservada (n=4 tokens especulativos en la configuración validada).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento complejo en producción con presupuesto de latencia controlado: el modelo permite ajustar el esfuerzo de razonamiento mediante `reasoning_effort`, de modo que tareas de análisis profundo usan `xhigh` y tareas rutinarias pueden rebajarse para reducir tokens generados.
- Despliegue en hardware de gama alta de consumo: con 19,0 GB de pesos, cabe en 2× RTX 3090 con TP=2 y contexto de 262K, lo que permite montar un servicio de razonamiento multimodal en estaciones de trabajo con dos GPU de 24 GB en lugar de clústeres de A100/H100.
- Asistentes de código con tool calling: la integración con el parser `qwen3_coder` y el tool calling automático de vLLM permite conectar el modelo a herramientas de ejecución de tests, linters o APIs de repositorio en pipelines de CI/CD.
- Análisis de documentos e imágenes: al conservar la torre de visión en BF16 y un contexto de 262K tokens, es adecuado para extracción de información de capturas, diagramas o documentos escaneados junto con texto largo.
- Agentes multi-paso con decodificación especulativa: la cabeza MTP con aceptación de 3,6–5,0 tokens por paso (n=4) reduce el coste de decodificación en bucles de agente donde se generan muchas llamadas cortas.
- Servicio de inferencia con throughput medido: los 74 tok/s en narrativa y 101 tok/s en código en 2× RTX 3090 permiten dimensionar un endpoint para cargas de trabajo interactivas de un solo usuario o pequeños equipos.
- Evaluación e investigación de cuantización: el recetario reproducible (`club3090_build_recipe.json`) y la equivalencia de layout con otros checkpoints INT4 facilitan experimentos comparativos de calidad entre recetas de AutoRound.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible; la evaluación de calidad de club-3090 (8-pack) está pendiente según la model card. Los únicos datos publicados son métricas de serving medidas en 2× RTX 3090 (PCIe, límite de 230 W) con vLLM v0.30.0, TP=2, W4A8, MTP n=4, KV en fp8 y contexto de 262K:

| Métrica | Valor |
|---|---|
| verify-full | pass |
| Decodificación, narrativa (tok/s) | 74,0 |
| Decodificación, código (tok/s) | 101,0 |
| Prefill a 10K (tok/s) | 1.720 |
| Prefill a 90K (tok/s) | 1.246 |
| Longitud de aceptación MTP, n=4 | 3,6–5,0 (bench); 2,7–4,0 durante la ejecución de 20K |
| Generación forzada de 20.000 tokens | sin colapso del drafter, 0 reinicios |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 19,0 GB; con KV en fp8 y contexto de 262K se validó en 2× RTX 3090 (24 GB cada una) con tensor parallelism 2.
- GPU recomendadas: 2× RTX 3090 como configuración mínima validada; 2× RTX 4090 o superiores para mayor margen de contexto y throughput; A100/H100 para despliegues multi-usuario.
- No cabe en una única GPU de consumo de 24 GB con contexto largo; una sola RTX 3090/4090 no es suficiente para el checkpoint completo en BF16 ni para esta cuantización con contexto extendido.
- Opciones de despliegue: vLLM con `--quantization auto_round` (validado en v0.30.0, también vía las configuraciones de club-3090); transformers para carga directa. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 74 tok/s en narrativa y 101 tok/s en código en decodificación; prefill de 1.720 tok/s a 10K y 1.246 tok/s a 90K en la configuración indicada.
- Advertencias de serving: con MTP y prefix caching en híbridos Qwen3-Next puede corromperse el estado recurrente (vllm#43559; el fix vllm#48375 sigue abierto), por lo que en vLLM estándar debe desactivarse el prefix caching si MTP está activo. W4A8 (`VLLM_MARLIN_INPUT_DTYPE=int8`) no funciona en vLLM estándar para checkpoints AutoRound (vllm#48904 y vllm#48905); en vLLM estándar debe servirse como W4A16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| wasifb/ThinkingCap-Qwen3.8-27B-AutoRound-W4A16 | 3.029.765.360 (safetensors) | 262.144 tokens | INT4 W4A16 AutoRound, 19,0 GB | PolyForm Small Business 1.0.0 | Objeto de esta ficha; MTP conservada |
| Frozenlock/Qwen3.8-27B-int4-AutoRound | no disponible | no disponible | INT4 AutoRound, mismo layout tensor a tensor | no disponible | Cuantización del Qwen3.8-27B base, no del fine-tune de razonamiento; tuning por defecto frente a 512 muestras con alg_ext |
| bottlecapai/ThinkingCap-Qwen3.8-27B | no disponible | no disponible | FP8, NVFP4 y GGUF publicados por BottleCap | PolyForm Small Business 1.0.0 | Modelo base sin cuantizar; no publica INT4 AutoRound |
| Qwen/Qwen3.8-27B | no disponible | no disponible | pesos originales | Apache-2.0 (materiales Qwen) | Modelo base de Qwen sin el fine-tune de razonamiento de BottleCap |

## Limitaciones y advertencias

- La evaluación de calidad (8-pack de club-3090) está pendiente; solo se han validado métricas de serving y estabilidad de generación, no la degradación de calidad frente al modelo en FP8/BF16.
- La capa MTP se cuantizó con redondeo al más cercano sin ajuste fino, lo que puede afectar a la tasa de aceptación especulativa en algunos dominios.
- Riesgo de alucinación inherente a los modelos de razonamiento con modo de pensamiento extenso; el esfuerzo por defecto es `xhigh`, lo que incrementa el consumo de tokens y el coste si no se ajusta.
- Idiomas soportados no documentados en la información disponible; no se puede garantizar calidad multilingüe más allá de lo que ofrezca el modelo base.
- Licencia PolyForm Small Business 1.0.0: el uso comercial por organizaciones que no califiquen como pequeña empresa requiere licencia comercial de BottleCap AI; esta cuantización es una obra derivada y se distribuye bajo los mismos términos.
- En vLLM estándar hay dos problemas conocidos de serving: corrupción del estado recurrente con MTP más prefix caching, y fallo silencioso de W4A8 en checkpoints AutoRound; ambos requieren parches de club-3090 o servir en W4A16 sin prefix caching.
- El número de parámetros reportado por safetensors (3.029.765.360) no es coherente con la denominación "27B" del modelo base; conviene verificar el conteo real antes de dimensionar recursos.
- No se documenta soporte para llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue fuera de vLLM y transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasifb/ThinkingCap-Qwen3.8-27B-AutoRound-W4A16
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint INT4 de referencia: https://huggingface.co/Frozenlock/Qwen3.8-27B-int4-AutoRound
- AutoRound (Intel): https://github.com/intel/auto-round
- club-3090: https://github.com/noonghunna/club-3090
- Issue vLLM MTP + prefix caching: https://github.com/vllm-project/vllm/issues/43559
- PR de corrección vLLM: https://github.com/vllm-project/vllm/pull/48375
- Issue vLLM W4A8 ignorado: https://github.com/vllm-project/vllm/issues/48904
- Issue vLLM escalas de grupo negativas: https://github.com/vllm-project/vllm/issues/48905
- BottleCap AI: https://bottlecapai.com
