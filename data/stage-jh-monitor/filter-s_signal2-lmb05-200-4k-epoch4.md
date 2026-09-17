# Stage-jh-monitor/filter-s_signal2-lmb05-200-4k-epoch4

## Resumen

`Stage-jh-monitor/filter-s_signal2-lmb05-200-4k-epoch4` es un checkpoint de un modelo de lenguaje de aproximadamente 4 539 millones de parámetros (4,54 B) publicado por el usuario `Stage-jh-monitor` en HuggingFace. Por la información de la model card se trata de un artefacto intermedio de un pipeline interno de entrenamiento por refuerzo (RL) sobre el modelo base declarado `Qwen/Qwen3.5-4B`, no de un modelo de propósito general con soporte y documentación de primer nivel.

El modelo resuelve, en principio, el problema de producir un "learner" (política entrenada) para una tarea concreta: el entrenamiento se ejecutó con `method = "rl"`, un juez externo basado en `gpt-5.6-luna` para puntuar respuestas abiertas y 10 000 pasos de learner durante 3 épocas sobre el dataset `Stage-org/filter-s_signal2-lmb05-200-4k`. El nombre del repositorio sugiere un filtro de señal dentro de un experimento mayor del mismo autor.

Es relevante únicamente como objeto de estudio de pipelines de RL aplicados a modelos de 4 B y como posible punto de partida para experimentación reproducible, no como alternativa a modelos instructivos maduros. No hay pipeline declarado, ni licencia, ni idiomas, ni benchmarks publicados, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. El tag del repo es `qwen3_5` y el modelo base declarado es `Qwen/Qwen3.5-4B`, lo que apunta a un transformer decoder-only denso, sin confirmación en la model card |
| Parametros totales | 4 539 265 536 (~4,54 B), dato derivado de los pesos safetensors del repositorio |
| Parametros activos | No aplica / no disponible: no hay indicios de arquitectura MoE |
| Longitud de contexto | 65 536 tokens según la configuración de inferencia (`max_model_len = 65536`). La configuración de entrenamiento declara `seq_len = 300000`, valor inconsistente con el anterior y no verificado |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en formato safetensors (presumiblemente bf16); no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors. El repositorio ocupa ~9,1 GB, coherente con ~4,54 B de parámetros almacenados en bf16 (2 bytes por parámetro) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Lo único deducible es que el punto de partida es `Qwen/Qwen3.5-4B` y que el pipeline de RL forzó `language_model_only = true` en vLLM, lo que indica que el componente entrenado es exclusivamente el modelo de lenguaje (sin torre de visión ni cabezas multimodales). La inferencia durante el entrenamiento usó `flash_attention_2`, un parser de razonamiento `qwen3` y un parser de tool calling `qwen3_coder`, lo que sugiere que la familia base incorpora modo de pensamiento y llamadas a herramientas en su plantilla nativa.

El entrenamiento es un RL con generación por grupos (`group_size = 8`, esquema compatible con GRPO), 10 000 pasos de learner, 3 épocas, `batch_size = 128` y optimizador AdamW con `lr = 1e-06`, `weight_decay = 0`, `betas = (0,9, 0,99)` y recorte de norma 1,0. La pérdida emplea enmascarado DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y un coeficiente KL de `kl_tau = 0.001`. La recompensa no proviene de un reward model abierto, sino de un juez externo servido por API (`gpt-5.6-luna`) con `reasoning_effort = "medium"`, `max_retries = 3` y hasta 32 peticiones en vuelo; la generación del learner usó `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. El dataset declarado es `Stage-org/filter-s_signal2-lmb05-200-4k`, sin más detalle sobre composición, número de tokens ni filtrado.

## Capacidades

No hay documentación de capacidades en la información disponible. Los únicos indicios indirectos son:

- Generación de texto autorregresiva, heredada del modelo base `Qwen/Qwen3.5-4B`.
- Modo de razonamiento explícito: la configuración de generación activa `enable_thinking = true` y el servidor vLLM usa `reasoning_parser = "qwen3"`.
- Tool calling / function calling: la configuración declara `tool_call_parser = "qwen3_coder"`, lo que implica que la plantilla base admite llamadas a herramientas, aunque no se documenta la fiabilidad tras el RL.
- Multilingüismo: no disponible.
- Visión, audio u otras modalidades: descartadas para este checkpoint (`language_model_only = true`).
- Comportamiento específico tras el RL (estilo de respuesta, sesgos inducidos por el juez, adherencia a formato): no disponible y no evaluado.

## Casos de uso

- Investigación en RL aplicado a modelos pequeños: reproducir o auditar el pipeline descrito (GRPO con juez externo, 10 000 pasos, AdamW a 1e-06) sobre un modelo de 4 B para estudiar cómo evoluciona la política paso a paso.
- Estudio de jueces LLM como fuente de recompensa: analizar el efecto de un juez propietario (`gpt-5.6-luna`, `reasoning_effort = medium`) sobre un learner abierto y medir el grado de imitación del estilo del juez.
- Punto de partida para fine-tuning posterior: al ser un checkpoint denso de ~4,54 B en safetensors, se puede cargar con Transformers y continuar el entrenamiento con SFT o DPO sin necesidad de infraestructura de gran escala.
- Evaluación comparativa de checkpoints intermedios: el nombre del repo indica la época 4, por lo que resulta útil para medir degradación o deriva respecto al modelo base a lo largo del entrenamiento.
- Prototipado local de agentes con tool calling en una sola GPU: si se confirma el soporte del parser `qwen3_coder`, permitiría probar flujos de llamadas a funciones en un entorno controlado, siempre que el rendimiento real se valide antes (no hay benchmarks).
- Destilación y generación de datos sintéticos: usar el modelo como generador de borradores o de trazas de razonamiento a bajo coste computacional, con revisión humana posterior dada la ausencia de métricas de calidad.
- Análisis de artefactos de entrenamiento: detectar formatos degenerados, colapso de diversidad o sesgos introducidos por el juez, útil para quien diseñe pipelines de RL similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la procedencia del entrenamiento (dataset, comando, configuración TOML) y no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, ni puntuaciones del juez externo utilizado como recompensa.

## Requisitos de hardware

- VRAM estimada en inferencia: ~9,1 GB solo para pesos en bf16, más caché KV. Con una ventana de 65 536 tokens, la caché KV puede superar con holgura los pesos del modelo, por lo que se recomienda limitar `max_model_len` en despliegues con poca memoria.
- Cuantizaciones: al no haber GGUF ni AWQ/GPTQ publicados, habría que generarlas. En 8 bits los pesos bajarían a ~4,6 GB; en 4 bits, a ~2,5 GB.
- GPU recomendadas: para bf16 con contexto completo, GPU de 40-80 GB (A100 40/80 GB, H100, L40S 48 GB). Para contextos moderados (8-16 k tokens), una RTX 4090 o RTX 3090 de 24 GB es suficiente.
- GPU de consumo: sí cabe en RTX 4090/3090 (24 GB) e incluso en tarjetas de 12-16 GB si se cuantiza a 8 o 4 bits y se recorta el contexto.
- Opciones de despliegue: la configuración de entrenamiento usó vLLM (`gpu_memory_utilization = 0.9`, parser `qwen3` y `qwen3_coder`), por lo que vLLM es la vía natural. También son viables Transformers, TGI o SGLang. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| filter-s_signal2-lmb05-200-4k-epoch4 | ~4,54 B | 65 536 tokens en la config de inferencia | No disponible | safetensors | Checkpoint de RL sin benchmarks ni documentación |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado) | No disponible | No disponible en esta ficha | No disponible | Modelo base declarado; sus especificaciones no se han verificado con fuentes primarias |
| Alternativas de ~4 B de propósito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación de rendimiento |

No es posible una comparación cuantitativa: no hay benchmarks publicados para este checkpoint ni métricas verificadas de su modelo base en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay licencia, idiomas, pipeline ni descripción de arquitectura en la model card.
- Licencia no disponible: sin una licencia explícita no se puede asumir permiso para uso comercial, redistribución o modificación. Tratar como no apto para producción hasta aclararlo.
- Origen de la recompensa: el RL se guio por un juez propietario externo (`gpt-5.6-luna`), lo que puede introducir sesgos de estilo, formato o contenido alineados con ese juez y no con criterios propios.
- Riesgo de alucinación: no evaluado; no hay métricas de fidelidad ni de tasas de error.
- Contexto: el valor real de ventana no está confirmado y la configuración de entrenamiento declara un `seq_len = 300000` incompatible con el `max_model_len = 65536` de inferencia, lo que apunta a un error de configuración o a una convención interna no documentada.
- Idiomas: desconocidos; no se puede asumir buen rendimiento en castellano ni en otros idiomas distintos del dominante en el dataset de RL.
- Reproducibilidad: el comando de entrenamiento apunta a rutas locales (`/NHNHOME/shkim/...`) y a variables de entorno propietarias (`JUDGE_BASE_URL`, `JUDGE_API_KEY`), por lo que la reproducción exacta no es posible sin acceso a ese entorno.
- Adopción nula: 0 descargas y 0 likes; no hay evidencia de uso, validación por terceros ni informes de la comunidad.
- Se desconoce si los pesos están en bf16, fp32 u otra precisión; el tamaño del repo sugiere bf16, pero no está declarado.

## Enlaces

- HuggingFace: https://huggingface.co/Stage-jh-monitor/filter-s_signal2-lmb05-200-4k-epoch4
- Dataset de entrenamiento declarado: `Stage-org/filter-s_signal2-lmb05-200-4k` (referenciado en la model card; no se ha verificado su disponibilidad pública)
- Modelo base declarado: `Qwen/Qwen3.5-4B` (referenciado en la configuración de entrenamiento; no verificado)
- Paper, blog o repositorio del autor: no disponible
- Demo: no disponible
- Nota sobre la búsqueda web: los resultados devueltos corresponden a portales de ofertas de prácticas ("stage" en francés) y no guardan relación con el modelo; no se ha encontrado ninguna fuente externa relevante.
