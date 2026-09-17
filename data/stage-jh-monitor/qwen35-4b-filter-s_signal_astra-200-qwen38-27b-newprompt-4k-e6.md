# Stage-jh-monitor/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k-e6

## Resumen

`Stage-jh-monitor/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k-e6` es un modelo de lenguaje de aproximadamente 4.540 millones de parametros (4.539.265.536, segun los pesos en safetensors) publicado en HuggingFace por el usuario `Stage-jh-monitor`. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, segun la informacion de procedencia de entrenamiento incluida en su propia model card. El repositorio ocupa 9,1 GB, lo que es coherente con pesos almacenados en precision de 16 bits, y no incluye quantizaciones alternativas ni versiones GGUF.

El modelo no cuenta con pipeline declarado, licencia, idiomas soportados ni resultados de benchmarks publicados, y en el momento de la consulta acumula 0 descargas y 0 "likes". Su interes es, por tanto, el de un artefacto de investigacion o de un pipeline interno de entrenamiento (el nombre sigue la convencion de un workflow automatizado de la organizacion `Stage`), mas que el de un modelo listo para produccion. La model card documenta de forma exhaustiva el comando y el fichero TOML de entrenamiento, lo que permite reconstruir buena parte de la receta de RL empleada.

Los datos de configuracion indican un entrenamiento de tipo RL con 10.000 pasos de learner, 6 epocas, batch de 128, `group_size` de 8, optimizador AdamW con `lr = 1e-6`, perdida con enmascarado DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `kl_tau = 0.001`) y un juez externo `gpt-5.6-luna` con `reasoning_effort = medium`. La decodificacion se realizo con `enable_thinking = true`, parser de razonamiento `qwen3` y parser de tool calling `qwen3_coder`, ejecutados sobre vLLM con `max_model_len = 65536`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); detalles de capas y atencion: no disponible |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE); no disponible |
| Longitud de contexto | No declarada en la model card. En la config de entrenamiento aparecen `seq_len = 300000` y `max_model_len = 65536` en el servidor vLLM |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Uso declarado (pipeline) | No disponible |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer denso de la familia Qwen3.5, y se somete a un ciclo de aprendizaje por refuerzo en lugar de a un ajuste supervisado clasico. La configuracion `stage.config.v7` describe un learner con metodo `rl`, 10.000 pasos, 6 epocas sobre el dataset `Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k`, batch de 128 y una longitud de secuencia declarada de 300.000 tokens, con `group_size = 8` para el muestreo de grupo. El bucle se ejecuta con `seed = 7`, checkpoint cada 3 epocas y retencion de los dos ultimos checkpoints, guardando unicamente pesos (`weights_only = true`).

En el plano de optimizacion se emplea AdamW con `lr = 1e-6`, `weight_decay = 0.0`, `max_norm = 1.0`, `betas = (0.9, 0.99)` y una perdida por defecto con enmascarado DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`. La generacion durante el entrenamiento usa temperatura 0.9, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. Las recompensas parecen provenir de un juez externo basado en API (`gpt-5.6-luna`, `reasoning_effort = medium`, temperatura 1.0, hasta 3 reintentos y 32 peticiones en vuelo). La inferencia de rollout se sirve con vLLM (`gpu_memory_utilization = 0.9`, `language_model_only = true`, parser de razonamiento `qwen3`, parser de tool calling `qwen3_coder`) y el entrenamiento usa FlashAttention 2. La orquestacion admite hasta 256 rollouts en vuelo y 8 pasos fuera de politica. No hay informacion publica sobre la composicion del dataset, el volumen de tokens efectivo ni si hubo una fase previa de SFT.

## Capacidades

- Generacion de texto y razonamiento: el entrenamiento se realizo con `enable_thinking = true` y un parser de razonamiento especifico de Qwen3, lo que indica soporte de modo de pensamiento explicito, aunque su calidad real no esta medida en ningun benchmark publicado.
- Tool calling / function calling: la configuracion declara explicitamente `tool_call_parser = "qwen3_coder"`, lo que implica soporte previsto de llamadas a herramientas en formato compatible con vLLM.
- Razonamiento multi-paso y agentes: el bucle de RL esta disenado con rollouts multi-turno y hasta 256 ejecuciones en vuelo, escenario tipico de tareas de agente, pero no se documentan capacidades efectivas de planificacion.
- Generacion de codigo: presencia de un parser de tool calling orientado a codigo (`qwen3_coder`); sin datos de HumanEval ni similares en la informacion disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible; la configuracion de inferencia usa `language_model_only = true`, lo que apunta a un uso exclusivamente de lenguaje.
- Cualquier otra capacidad especial: no disponible.

## Casos de uso

- Agentes con llamada a herramientas: el modelo esta configurado con el parser `qwen3_coder`, lo que permite integrarlo en bucles de agente que emiten llamadas estructuradas a funciones dentro de vLLM; seria adecuado siempre que se valide antes la calidad real del ajuste.
- Asistentes de codigo en pipelines internos: un modelo de 4,5B en 16 bits cabe en una GPU de 24 GB, de modo que puede servir como asistente de autocompletado o generacion de parches en un CI/CD autoalojado, sin dependencia de APIs externas.
- Extraccion y filtrado de datos de entrenamiento: el nombre del modelo y del dataset sugieren un uso como componente de filtrado o puntuacion de senales dentro de un pipeline de curacion de datos; encaja como modelo juez ligero ejecutado en lote.
- Razonamiento con contexto largo: la configuracion de entrenamiento declara `seq_len` de 300.000 y el servidor vLLM `max_model_len` de 65.536, por lo que puede emplearse en tareas de resumen o analisis de documentos extensos, verificando previamente el contexto realmente soportado.
- Evaluacion comparativa de recetas de RL: dado que la model card documenta el comando, el TOML y la semilla, es un artefacto util para reproducir y comparar configuraciones de RL (variaciones de `group_size`, juez, enmascarado DPPO) en un mismo modelo base.
- Generacion de razonamiento sintetico para destilacion: con `enable_thinking = true` y temperatura 0.9, puede generar cadenas de razonamiento destinadas a entrenar modelos menores, siempre con revision posterior de calidad.
- Despliegue en el borde o en estaciones de trabajo: con cuantizacion a int8 o int4 (no publicada, habria que generarla) cabria en GPUs consumer de 8-12 GB para prototipado local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo contiene la procedencia del entrenamiento (dataset, comando, configuracion y parametros de RL), sin metricas de MMLU, GSM8K, HumanEval ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM para pesos en 16 bits: aproximadamente 9,1 GB solo de pesos, calculado a partir de los 4.539.265.536 parametros y el tamano del repositorio; hay que anadir cache KV y activaciones.
- VRAM total estimada en 16 bits con contexto corto: del orden de 11-14 GB, lo que permite ejecucion en una RTX 4090, RTX 4080 Super, A10G, L4 o A100 40 GB.
- Contexto largo: a 65.536 tokens la cache KV crece de forma notable y el desglose exacto no esta disponible; se recomienda planificar al menos 24-48 GB de VRAM agregada o usar tensor parallel en varias GPUs para esa ventana.
- Cuantizacion: no hay GGUF ni AWQ/GPTQ publicados. Generar una cuantizacion int8 reduciria los pesos a unos 4,6 GB y una int4 a unos 2,7-3 GB, lo que abriria el despliegue en GPUs de 8-12 GB, pero los pesos resultantes no estan verificados por el autor.
- GPU recomendadas para produccion: A100 80 GB o H100 para lotes grandes y contexto largo; L40S o A10G para servicio de baja concurrencia; RTX 4090 o RTX 3090 para prototipado.
- Opciones de despliegue: vLLM es la via documentada por el propio autor, con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`. SGLang o TGI serian alternativas razonables. llama.cpp y Ollama requeririan convertir los safetensors a GGUF por cuenta propia.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de esta tabla provienen de la informacion disponible sobre este modelo y de la documentacion publica de los modelos de referencia; las celdas sin dato verificado se marcan como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`qwen35-4b-filter-s...-e6`) | 4,54 mil millones | No declarado (`seq_len` 300.000 en entrenamiento, 65.536 en vLLM) | No disponible | Safetensors, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base) | No disponible | No disponible | No disponible | Repositorio publico de Qwen |
| `Qwen/Qwen3-4B` | ~4,0 mil millones | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Safetensors y GGUF |
| `meta-llama/Llama-3.2-3B` | ~3,2 mil millones | 128.000 tokens | Licencia comunitaria Llama 3.2 | Safetensors y GGUF |

No hay datos de rendimiento comparado para este ajuste, de modo que la comparacion se limita a parametros, contexto declarado, licencia y disponibilidad. La ventaja principal frente a los modelos de referencia seria la de partir de una base Qwen3.5 con entrenamiento RL documentado, mientras que las desventajas son la ausencia de licencia explicita, de cuantizaciones y de cualquier metrica publicada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica termino alguno de uso. Sin una licencia explicita no puede asumirse permiso para uso comercial; hay que contactar con el autor o tratar el modelo como no redistribuible.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salida. Cualquier uso en produccion requiere una validacion propia previa.
- Riesgo de alucinacion: es un modelo de 4,5B ajustado con RL sobre un dataset no publico; no hay datos sobre tasas de fidelidad factual.
- Sesgos conocidos: no disponibles. Al desconocerse la composicion del dataset de entrenamiento, no puede acotarse el sesgo ni la cobertura tematica.
- Idioma: no se declaran idiomas soportados. No hay garantia de un rendimiento adecuado en castellano ni de que el tokenizador y el entrenamiento hayan cubierto esa lengua de forma equilibrada.
- Contexto: existe una discrepancia entre el `seq_len` de 300.000 de la configuracion de entrenamiento y el `max_model_len` de 65.536 del servidor vLLM; el contexto efectivo garantizado no esta documentado.
- Procedencia automatizada: el nombre del repositorio y la estructura de la model card sugieren un artefacto generado por un workflow de entrenamiento automatico, sin publicacion asociada, sin paper y sin mantenimiento declarado.
- Trazabilidad del juez: parte de la senal de recompensa proviene de un modelo juez externo accedido por API (`gpt-5.6-luna`), lo que introduce dependencia de un servicio de terceros y posibles sesgos heredados del juez.
- Reproducibilidad parcial: se documentan comando, configuracion y semilla, pero no el dataset completo, el tokenizador exacto ni los pesos de la fase previa.
- Rendimiento en tool calling: el parser `qwen3_coder` esta configurado, pero no se aportan pruebas de que el modelo emita llamadas validas de forma fiable.
- Uso de `language_model_only = true`: no hay indicios de capacidades multimodales; no debe esperarse soporte de imagen o audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-jh-monitor/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k-e6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento referenciado en la model card: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k
- Organizacion del autor: https://huggingface.co/Stage-jh-monitor
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes (paper, blog, repositorio o demo). Las consultas devolvieron unicamente portales de ofertas de practicas, sin relacion con el modelo.
