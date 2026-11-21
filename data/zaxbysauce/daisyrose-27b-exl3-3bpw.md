# zaxbysauce/DaisyRose-27B-EXL3-3bpw

## Resumen

DaisyRose-27B-EXL3-3bpw es una cuantización de 3 bits por peso (3.017 bpw de media) del modelo RadixArk/DaisyRose-27B, publicada por el usuario zaxbysauce. El objetivo declarado del pack es permitir servir el modelo completo —incluidos los pesos del borrador MTP (multi-token prediction) y una ventana de contexto larga— en una única GPU de 16 GB de VRAM, algo imposible con los checkpoints oficiales en BF16, FP8 o NVFP4 del repositorio base.

La cuantización se ha realizado con la librería exllamav3 y el formato EXL3, con el cuerpo del modelo a 3.0 bpw, el `lm_head` a 6 bpw, la capa MTP a 4 bpw y embeddings en bf16 con autosplit a CPU. El repo ocupa 13.8 GB y el pack resultante ~12.9 GiB en disco. Según los safetensors, el checkpoint contiene 6.909.818.096 parámetros, un dato que no cuadra con la nomenclatura "27B" del modelo base y que conviene verificar antes de asumir un tamaño concreto.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta de cuantización de bajo bit para contexto largo con decodificación especulativa; por otro, expone con detalle los compromisos reales de VRAM, latencia y calidad (KL de 0.034 frente a BF16) que implica llevar un modelo de este tipo a hardware de consumo. Es una cuantización text-only: la torre de visión se eliminó durante la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arch `qwen3_5` en exllamav3), con capa MTP para decodificación especulativa |
| Parametros totales | 6.909.818.096 según safetensors del repo (la nomenclatura del modelo base indica 27B; discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 221.184 tokens probados en configuraciones concretas; el autor sirve 186.368 tokens en RTX 4060 Ti de 16 GB |
| Tipos de cuantizacion | EXL3 3.0 bpw (cuerpo), 6 bpw (`lm_head`), 4 bpw (capa MTP), codebook `mul1`; embeddings en bf16 con autosplit a CPU; KV cache int4 o 3-bit configurable |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3, requiere exllamav3) |

## Arquitectura y entrenamiento

El modelo base RadixArk/DaisyRose-27B emplea una arquitectura transformer identificada en exllamav3 como `qwen3_5`, con soporte de modo "thinking" y un parámetro `reasoning_effort` con valores {xhigh, medium, low}. Incluye una capa MTP (multi-token prediction) que actúa como borrador para decodificación especulativa con rejection sampling, lo que garantiza salidas idénticas a las de decodificación sin borrador. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La contribución técnica de esta ficha es la receta de cuantización: conversión con `convert.py -b 3.0 -hb 6 -mb 4 -cb mul1`, calibración por defecto del fork (250 filas × 1536 columnas) y un KL de 0.034 frente a la referencia BF16 medido con `measure_model` (12×1024 tokens de calibración, logits finales, solo tensores del cuerpo). El autor documenta un fallo relevante: reanudar una conversión para añadir cuantización al `lm_head` produce tensores corruptos porque el flujo de calibración reanudado salta los módulos ya procesados y la Hessiana del head captura activaciones de ancho vocabulario en lugar de estados ocultos; la solución es una conversión completa desde cero. El fork de exllamav3 utilizado es MiaAI en el commit `63b32f0`, con un parche local de Hessian no upstream.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto (`chat_template_kwargs.enable_thinking`), con niveles de esfuerzo `xhigh`, `medium` y `low`; cualquier otro valor lanza una excepción de plantilla.
- Decodificación especulativa mediante MTP con aceptación medida del 76,4% en código, 49,3% en prosa y 54–66% a profundidades de 170K+ tokens.
- Recuperación exacta de información en contexto largo: passphrase plantada al 50% de profundidad en relleno de ruido, recuperada en todos los intentos a 173K tokens (tres ejecuciones independientes) y a 199K sobre ventana de 221K con KV de 3 bits.
- Capacidad de razonamiento multi-paso implícita en el modo thinking, aunque sin benchmarks publicados que la cuantifiquen.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión: eliminadas en esta conversión (pack text-only).
- Capacidades multilingües: no disponibles.
- Servido mediante API compatible con OpenAI a través de `serve_openai.py` de exllamav3.

## Casos de uso

- Asistencia y generación de código en local: el MTP alcanza un 76,4% de aceptación en código, por lo que la decodificación especulativa aporta aquí su mayor ganancia (2,4–3,5× según carga) frente a los ~15 t/s sin borrador. Adecuado para autocompletado y revisión en una estación de trabajo con GPU de 16 GB.
- Procesamiento de documentos largos: con 186K tokens de contexto servidos de forma estable, permite resumir, extraer y consultar contratos, informes o bases de código extensas en una sola pasada, con recuperación exacta verificada a 173K.
- Agentes de razonamiento local: el modo thinking con `reasoning_effort` configurable permite ajustar el coste computacional por consulta, útil para pipelines de análisis que requieren cadenas de razonamiento sin depender de APIs externas.
- Servicio de chat compatible con OpenAI: `serve_openai.py` expone el modelo en el puerto indicado, lo que facilita integrarlo como backend en aplicaciones existentes que ya consumen la API de OpenAI.
- Investigación en cuantización: el pack documenta KL, tasas de aceptación MTP, throughput de prefill y decode y configuraciones de KV cache, lo que lo convierte en una referencia práctica para estudiar el equilibrio calidad/VRAM en 3 bits.
- Despliegue en hardware de consumo para prototipado: permite validar prompts, plantillas y flujos de agente con el modelo real antes de migrar a los checkpoints oficiales en BF16/FP8 sobre GPUs de datacenter.
- Análisis de logs y texto técnico con contexto profundo: la ventana larga y el throughput de prefill de 333 t/s a 173K (en RTX 4060 Ti) hacen viable ingerir volúmenes grandes de texto por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, TerminalBench, GPQA, SWE-bench) en la información disponible. El autor lo indica explícitamente. Los únicos datos cuantitativos son de calidad de cuantización y de rendimiento de inferencia:

| Metrica | Valor | Contexto |
|---|---|---|
| KL vs BF16 (cuerpo) | 0,034 | `measure_model`, 12×1024 tokens de calibración, logits finales |
| KL publicado por APEX (Nano tier, mismo modelo) | 0,122 | Otro harness, no directamente comparable |
| Aceptación MTP en código | 76,4% | Superficial |
| Aceptación MTP en prosa | 49,3% | Superficial |
| Aceptación MTP a 170K+ | 54–66% | Profundidad larga |
| Decode sin borrador | ~15 t/s | En proceso, RTX 4060 Ti |
| Decode con MTP | 44,8 t/s superficial; p50 37,5 t/s, max 63,5 t/s a 173K | RTX 4060 Ti |
| Prefill | 664 t/s a 14K; 333 t/s a 173K | RTX 4060 Ti, prompts fríos |
| Ganancia MTP | 2,4–3,5× | Dependiente de carga |

## Requisitos de hardware

- VRAM: el pack está diseñado para caber en 16 GB con MTP residente y ventana larga. El margen crítico es el workspace de atención en decode sobre la cache completa, no la VRAM de carga.
- Configuraciones verificadas por el autor en RTX 4060 Ti de 16 GB: int4 KV con `-cs 186368` (~830 MiB libres en reposo, en servicio); int4 KV con `-cs 196608` (~590 MiB, sobrevivió prefills de 173K); 3-bit K + 4-bit V con `-cs 221184` (510 MiB, OOM de CUDA a 195K); 3/3-bit con `-cs 221184` (970 MiB, sobrevivió prefills repetidos de 199K).
- GPU recomendadas: RTX 4060 Ti 16 GB (validada por el autor). Cualquier GPU Ada con 16 GB o más debería ser viable; GPUs con más VRAM permiten ventanas mayores o KV de mayor precisión.
- Cabe en GPU de consumo de 16 GB; no cabe en GPUs de 8 o 12 GB con esta configuración.
- Despliegue: exllamav3 con soporte de arquitectura `qwen3_5`, `CacheLayer_quant` y MTP; el autor usa el fork MiaAI en el commit `63b32f0` con parche local de Hessian. Comando de referencia: `serve_openai.py -m <pack> -cs 186368 -cq 4 -dm mtp -p 8022 --host 0.0.0.0`.
- NVFP4 KV existe en el fork pero sus kernels están optimizados para GB10; en Ada rinde 2,0–5,5 t/s, por lo que int4 es la ruta rápida en esta generación.
- Latencia y throughput: ver tabla de benchmarks. Advertencia del autor: una repetición en caliente del mismo prompt lee ~3× más rápido que una ejecución fría por estado residual de cache, por lo que los benchmarks de prompts repetidos en este stack no son fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-EXL3-3bpw (este) | 6,9B según safetensors del repo | Hasta 221K probado; 186K servido en 16 GB | EXL3 3 bpw + MTP 4 bpw | Apache-2.0 | Text-only, requiere exllamav3 con MTP |
| RadixArk/DaisyRose-27B (base) | 27B (nominal) | No disponible | BF16, FP8, NVFP4 | Apache-2.0 | Incluye torre de visión; no cabe en 16 GB con MTP y cache profunda |
| APEX Nano tier (mismo modelo base, según el autor) | No disponible | No disponible | No disponible | No disponible | KL publicado 0,122 en su propio harness |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sin benchmarks estándar publicados: no hay datos de MMLU, HumanEval, GSM8K, SWE-bench, GPQA ni TerminalBench para este pack, por lo que su calidad en tareas de razonamiento y código no está cuantificada más allá del KL.
- Discrepancia de tamaño: el nombre indica 27B pero los safetensors reportan 6,9B parámetros. Verificar antes de asumir requisitos de memoria o capacidades del modelo base.
- Text-only: la torre de visión se eliminó en la conversión; para entrada de imágenes hay que usar los checkpoints oficiales.
- El KL de 0,034 cubre solo los tensores del cuerpo; el `lm_head` a 6 bpw no está puntuado por separado y su elección responde a aritmética de VRAM, no a una métrica de calidad.
- Recuperación cerca del final de la ventana no probada; el autor solo valida recuperación a profundidades medias y a 173K–199K.
- La configuración de 221K con 3-bit K + 4-bit V provocó OOM de CUDA a 195K de profundidad; dimensionar para la petición más profunda que se vaya a servir, no para un arranque estable.
- Reanudar una conversión para añadir cuantización al head produce tensores corruptos; requiere conversión completa desde cero.
- Dependencia de un fork no upstream de exllamav3 (MiaAI `63b32f0`) más un parche local de Hessian; la reproducibilidad depende de mantener ese entorno.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, no evaluados aquí.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones comerciales adicionales indicadas; verificar igualmente los términos del modelo base RadixArk/DaisyRose-27B.
- Los benchmarks de prompts repetidos en este stack sobreestiman el rendimiento por estado residual de cache (~3× en caliente).

## Enlaces

- Hugging Face del pack: https://huggingface.co/zaxbysauce/DaisyRose-27B-EXL3-3bpw
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Fork de exllamav3 utilizado (MiaAI, commit `63b32f0`): no disponible como enlace en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
