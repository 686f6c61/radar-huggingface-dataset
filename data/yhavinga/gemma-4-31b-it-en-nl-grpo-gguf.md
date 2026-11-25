# yhavinga/gemma-4-31b-it-en-nl-grpo-GGUF

## Resumen

Gemma 4 31B-it English→Dutch GRPO (GGUF) es una especialización del modelo google/gemma-4-31B-it para traducción directa inglés→neerlandés. El autor, yhavinga, ha fusionado un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre los pesos base en bf16 y posteriormente ha generado cuantizaciones GGUF para su uso con llama.cpp y LM Studio. El resultado es un traductor monolingüe de dirección fija (EN→NL) que hereda la arquitectura y el tokenizador del Gemma 4 base.

El modelo resuelve un problema concreto: la traducción automática de alta calidad entre inglés y neerlandés con un único prompt fijo, sin necesidad de ingeniería de prompts por caso. Frente al modelo base, el ajuste con GRPO busca mejorar la naturalidad e idiomaticidad del neerlandés generado, y los datos publicados muestran mejoras marginales en métricas de calidad (MetricX-24 QE, COMET-22) y en la tasa de detección como "neerlandés original" por parte de un clasificador.

Es relevante para equipos que necesiten desplegar traducción EN→NL en local o en infraestructura propia, sin depender de APIs externas, con licencia Apache 2.0 y pesos en formato GGUF listos para inferencia en CPU/GPU consumer. El repositorio incluye dos cuantizaciones (Q4_K_M y Q8_0) y la plantilla de chat del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), ajustado con LoRA + GRPO y fusionado |
| Parámetros totales | 30.697.345.596 (~30,7 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (18,7 GB), Q8_0 (32,6 GB) |
| Idiomas soportados | Inglés (entrada) y neerlandés (salida); pipeline de traducción EN→NL |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp v1.0.0) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer decoder-only de aproximadamente 30,7 mil millones de parámetros. Sobre esa base se entrenó un adaptador LoRA con GRPO (una variante de optimización por política con recompensa relativa de grupo, típicamente usada en RLHF/RL sin modelo de recompensa explícito) para la tarea de traducción inglés→neerlandés. El adaptador se fusionó en los pesos base en bf16 y el resultado se convirtió a GGUF con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp v1.0.0, sin importance matrix.

El entrenamiento se realizó sin modo "thinking" (razonamiento), y la model card indica explícitamente que se debe desactivar el razonamiento en inferencia (`--reasoning off`), ya que llama.cpp lo activa por defecto para esta plantilla de chat. El prompt de traducción es fijo y se documenta en la model card; el modelo espera un único turno de usuario con ese prompt y el texto fuente. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del GRPO; esos detalles se remiten al repositorio del adaptador LoRA.

## Capacidades

- Traducción directa inglés→neerlandés con un prompt fijo, orientada a naturalidad e idiomaticidad (no traducción literal).
- Generación de texto en neerlandés con preservación de nombres, números, detalles, tono, párrafos, saltos de línea y formato.
- Salida limpia: solo la traducción, sin explicaciones ni comentarios (según el prompt recomendado).
- Modo "thinking" desactivado por diseño; el modelo fue entrenado sin razonamiento explícito.
- Compatible con la plantilla de chat del modelo base Gemma 4.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo más allá del par EN→NL.
- No se documenta soporte de contexto largo más allá de lo que herede del modelo base (no disponible en la información proporcionada).

## Casos de uso

- Traducción de documentación técnica EN→NL en local: el modelo puede procesar párrafos y preservar formato, nombres de API y números, adecuado para equipos que mantienen documentación bilingüe sin enviar contenido a APIs externas.
- Localización de contenido web y marketing: con temperatura 0 para consistencia o muestreo para variar el fraseo, útil para generar versiones neerlandesas de páginas y newsletters manteniendo el tono original.
- Traducción por lotes en pipelines de CI/CD: al ser GGUF y compatible con llama-server (API compatible con OpenAI), se puede integrar en scripts de build que traduzcan ficheros de recursos o cadenas de UI.
- Despliegue en LM Studio para revisión humana: investigadores y traductores pueden cargar el quant Q4_K_M en estaciones de trabajo y comparar salidas con el modelo base o con referencias humanas.
- Subtitulado y transcripción bilingüe: traducción de transcripciones o subtítulos EN→NL conservando saltos de línea y estructura, con la ventaja de ejecución local y licencia permisiva.
- Investigación en traducción automática: el repositorio incluye métricas sobre WMT24++, FLORES-200 y NTREX-128, lo que permite reproducir evaluaciones y comparar GRPO frente a SFT (variante best-of-8 SFT publicada por el mismo autor).
- Servicio interno de traducción con API compatible OpenAI: `llama-server` expone un endpoint que se puede conectar a herramientas existentes sin reescribir integraciones.

## Benchmarks y rendimiento

Evaluación sobre el modelo sin cuantizar (bf16), frente al modelo base con el mismo prompt y decodificación greedy, en splits held-out. MetricX-24 QE (menor es mejor) y COMET-22:

| Conjunto | n | QE este modelo | QE base | QE referencia humana | COMET-22 este modelo | COMET-22 base |
|---|---:|---:|---:|---:|---:|---:|
| WMT24++ en-nl | 480 | 2,249 | 2,276 | 2,463 | 0,8512 | 0,8502 |
| FLORES-200 en-nl | 504 | 1,116 | 1,115 | 1,493 | 0,8889 | 0,8895 |
| NTREX-128 en-nl | 999 | 1,520 | 1,547 | 1,874 | 0,8813 | 0,8820 |

En WMT24++ (480) + FLAN (500), un clasificador original-vs-traducido de neerlandés califica el 34,2 % de las salidas greedy de este modelo como neerlandés original, frente al 30,0 % del modelo base (+4,2 pp). Bajo decodificación greedy, un revisor LLM ciego (Claude) no mostró preferencia global sobre el modelo base (20 / 23 / 57 sobre 100 pasajes de evaluación).

Las cuantizaciones se comprobaron sobre 8 frases de FLORES con decodificación greedy frente a la salida del modelo sin cuantizar: chrF 94,9 (Q4_K_M) y 98,2 (Q8_0), con todas las salidas en neerlandés. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 18,7 GB en disco y requiere aproximadamente esa cantidad de VRAM para cargarse completo en GPU; Q8_0 ocupa 32,6 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o A100 40 GB; para Q8_0, A100 40/80 GB o H100. También es viable en CPU con suficiente RAM (18,7 GB para Q4_K_M).
- Cabe en GPU consumer: Q4_K_M sí en RTX 4090 (24 GB) y RTX 3090 (24 GB); Q8_0 no cabe en GPUs consumer de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio; el servidor es compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| yhavinga/gemma-4-31b-it-en-nl-grpo-GGUF | ~30,7 B | No disponible | Apache 2.0 | GGUF | Traducción EN→NL con GRPO |
| yhavinga/gemma-4-31b-it-en-nl-GGUF | ~30,7 B (base Gemma 4 31B) | No disponible | Apache 2.0 | GGUF | Traducción EN→NL con SFT best-of-8 |
| google/gemma-4-31B-it (base) | ~30,7 B | No disponible | Apache 2.0 (según model card) | safetensors | Modelo generalista instruction-tuned |
| yhavinga/gemma-4-31b-it-en-nl-grpo-lora | ~30,7 B + LoRA | No disponible | Apache 2.0 | safetensors + PEFT | Adaptador LoRA para transformers + peft |

La comparativa directa con otros traductores especializados (por ejemplo, modelos NLLB o M2M) no está disponible en la información proporcionada. Los datos de evaluación permiten comparar este checkpoint con el modelo base y con la variante SFT del mismo autor, pero no con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Bajo decodificación greedy, la revisión ciega por LLM no mostró preferencia global sobre el modelo base, y el checkpoint no se ha evaluado en una muestra humana ciega dedicada.
- La cuantización altera ligeramente la salida; la evaluación publicada corresponde al modelo bf16, no a los quants.
- El modelo está especializado exclusivamente en inglés→neerlandés y con el prompt documentado; no se garantiza su comportamiento con otros pares de idiomas, otros prompts o texto fuera de dominio.
- Es obligatorio desactivar el modo "thinking" (`--reasoning off`), ya que el modelo se entrenó sin razonamiento y la plantilla de chat lo activa por defecto.
- Riesgo de alucinación inherente a los modelos generativos: puede omitir, añadir o alterar detalles pese a las instrucciones del prompt; se recomienda revisión humana en contenido crítico.
- No se documentan sesgos específicos ni evaluaciones de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-31B-it, ya que la model card del derivado no detalla restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-grpo-GGUF
- Adaptador LoRA (detalles de entrenamiento): https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-grpo-lora
- Variante SFT best-of-8: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Google TPU Research Cloud: https://sites.research.google/trc/about/
