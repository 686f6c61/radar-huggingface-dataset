# Stage-jh-monitor/filter-s_signal2-lmb025-200-4k-epoch4

## Resumen

`Stage-jh-monitor/filter-s_signal2-lmb025-200-4k-epoch4` es un checkpoint experimental publicado en HuggingFace, derivado del modelo base `Qwen/Qwen3.5-4B` mediante un proceso de aprendizaje por refuerzo (RL) ejecutado con el framework `prime_rl`. El repositorio no incluye una model card descriptiva al uso: el README contiene unicamente la procedencia del entrenamiento (comando, dataset y fichero de configuracion TOML), sin explicacion de la tarea objetivo, del uso previsto ni de los resultados obtenidos. El nombre del modelo sugiere que se trata de un filtro o clasificador entrenado sobre una senal concreta (`s_signal2`) y un dataset de aproximadamente 4.000 elementos, pero esto es una interpretacion del identificador, no un dato confirmado por el autor.

El modelo tiene 4.539.265.536 parametros reales (unos 4,54 mil millones, segun los ficheros safetensors) y el repositorio ocupa 9,1 GB, lo que es coherente con pesos almacenados a 16 bits por parametro (bf16/fp16). El entrenamiento se hizo con `method = "rl"`, 10.000 pasos de learner y 3 epocas sobre el dataset `Stage-org/filter-s_signal2-lmb025-200-4k`, con un juez externo (`gpt-5.6-luna`, servido via `JUDGE_BASE_URL`/`JUDGE_API_KEY`) para puntuar las generaciones.

La relevancia de esta ficha es limitada y conviene decirlo con claridad: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no declara idiomas y no publica benchmarks. Es un artefacto de investigacion interno, no un modelo listo para produccion. Cualquier evaluacion seria exige reproducir el pipeline de entrenamiento o auditar el checkpoint por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. Modelo derivado de `Qwen/Qwen3.5-4B`; el tag `qwen3_5` apunta a la familia Qwen3.5, pero no se detalla la arquitectura interna |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones), dato real de los safetensors |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. La configuracion de entrenamiento usa `seq_len = 300000` y la de inferencia `max_model_len = 65536`, pero no se especifica la ventana nativa del modelo |
| Tipos de cuantizacion | No disponible. Solo se publican pesos sin cuantizar; 9,1 GB para 4,54 B de parametros equivale a unos 2 bytes por parametro (bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se documenta la arquitectura en el repositorio. El modelo parte de `Qwen/Qwen3.5-4B` y se somete a un ajuste por refuerzo con `prime_rl`: metodo `rl`, 10.000 pasos de learner, 3 epocas, `batch_size = 128`, `group_size = 8` (es decir, 8 muestras por prompt para estimar ventajas), optimizador AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0` y betas (0.9, 0.99). La funcion de perdida es de tipo `default` con enmascarado DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`, lo que indica un esquema de RL con penalizacion KL suave respecto al modelo de referencia y recorte de la senal de ventaja en una banda concreta.

El bucle de generacion usa `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`, con atencion `flash_attention_2` y `language_model_only = true` en la configuracion de vLLM. La evaluacion (recompensa) no proviene de un reward model local, sino de un juez remoto identificado como `gpt-5.6-luna`, con `mean_score = false`, `max_retries = 3` y hasta 32 peticiones en vuelo. El orquestador permite hasta 256 rollouts en vuelo y 8 pasos fuera de politica (`max_off_policy_steps = 8`). El entrenamiento se reparte en 2 GPU por nodo (1 para inferencia, 1 para entrenamiento) y se registra en Weights & Biases (proyecto `stage-learner-junhee`). No se especifica composicion del dataset, numero de tokens de entrenamiento ni si hubo fases previas de SFT o DPO.

## Capacidades

La informacion disponible no permite certificar capacidades concretas. Lo unico verificable es lo que aparece en la configuracion de entrenamiento e inferencia:

- Generacion de texto autoregresiva: el pipeline de RL genera hasta 4.096 tokens por muestra, por lo que el modelo produce texto coherente en el formato exigido por la tarea de entrenamiento.
- Modo de razonamiento explicito: la generacion se lanza con `enable_thinking = true` y el parser de razonamiento configurado es `qwen3`, lo que implica soporte de bloques de pensamiento separados de la respuesta final.
- Posible soporte de tool calling: se configura `tool_call_parser = "qwen3_coder"` en vLLM, aunque no se documenta si la tarea de RL entreno esta habilidad o si es mera herencia del modelo base.
- Condicionamiento por prompt de evaluacion: al haber sido optimizado contra un juez externo, su comportamiento esta fuertemente acoplado al formato de prompt y al criterio de ese juez.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles. La marca `language_model_only = true` sugiere que en inferencia se carga unicamente la torre de lenguaje, pero no confirma que el modelo base sea multimodal.
- Clasificacion o filtrado de datos: el nombre del modelo (`filter-s_signal2`) apunta a esta funcion, pero no hay documentacion que la confirme ni que describa el espacio de etiquetas.

## Casos de uso

Dado que el modelo no documenta su tarea, uso previsto ni metricas, los casos siguientes son escenarios plausibles sujetos a validacion previa por parte de quien lo adopte:

- Auditoria de checkpoints de RL: el repositorio es util como material de estudio del pipeline `prime_rl` (DPPO con enmascarado, juez remoto, rollouts asincronos) y como punto de partida para reproducir el entrenamiento con el TOML publicado.
- Filtrado o puntuacion de datos dentro de un pipeline interno: si el identificador `filter` describe realmente su funcion, el modelo podria emplearse para etiquetar o descartar ejemplos antes de entrenar otro modelo; habria que medir precision y recall en un conjunto propio antes de integrarlo.
- Investigacion sobre RLHF/RLAIF con juez externo: permite estudiar como se comporta un modelo de 4,5 B optimizado contra un juez propietario y que sesgos introduce ese criterio.
- Base para fine-tuning posterior: al ser un modelo de ~4,5 B en safetensors bf16, se puede continuar su entrenamiento (SFT o DPO) con tecnicas de parametros eficientes en una sola GPU de 24 GB.
- Experimentos de destilacion: usar sus generaciones como pseudoetiquetas para modelos mas pequenos en una tarea concreta, siempre con una validacion humana del criterio del juez.
- Pruebas de evaluacion de robustez: medir la degradacion de su comportamiento cuando se cambia la temperatura, el formato del prompt o el idioma, dado que fue optimizado con una configuracion de generacion muy concreta (`temperature = 0.9`, `top_p = 1.0`).
- Servicio interno de bajo trafico: desplegado con vLLM a `max_model_len = 65536`, cabe en una GPU de 24 GB y puede atender un prototipo interno, sin garantias de licencia para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, comparativa con el modelo base ni metricas de la tarea de RL (recompensa media del juez, tasa de acierto, perdida). Tampoco se publican datos de latencia o throughput medidos.

## Requisitos de hardware

Estimaciones calculadas a partir del numero real de parametros (4,54 B) y del peso del repositorio (9,1 GB); no son cifras publicadas por el autor:

- Pesos en bf16/fp16: unos 9,1 GB de VRAM solo para pesos. Con cache KV y activaciones, un despliegue realista ronda 12-16 GB en contextos cortos y bastante mas con contextos largos (la configuracion apunta a `max_model_len = 65536`).
- Cuantizacion a 8 bits: en torno a 4,5-5 GB de pesos, aproximadamente 7-9 GB en total.
- Cuantizacion a 4 bits: en torno a 2,3-3 GB de pesos, aproximadamente 4-6 GB en total. No se ofrecen ficheros GGUF ni cuantizaciones precalculadas; habria que generarlas.
- GPU consumer: cabe en RTX 3090, RTX 4090, RTX 5090 y equivalentes de 24 GB en bf16 con contexto moderado. En tarjetas de 16 GB conviene cuantizar a 8 bits. En 12 GB o menos, solo con cuantizacion de 4 bits y contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100 y L40S lo ejecutan sin problema; el uso de varias GPU solo aporta ventaja si se necesita contexto largo o alto throughput.
- Opciones de despliegue: vLLM es la via documentada (el autor configura servidor en el puerto 7000 con `gpu_memory_utilization = 0.9`, `language_model_only = true`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`). Tambien es viable HuggingFace Transformers con `attn_implementation = "flash_attention_2"` y, tras conversion a GGUF, llama.cpp u Ollama. TGI no esta documentado pero deberia funcionar al ser pesos safetensors estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados de este checkpoint, por lo que no es posible compararlo en calidad con alternativas. La unica referencia identificable es su modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Stage-jh-monitor/filter-s_signal2-lmb025-200-4k-epoch4` | 4,54 B | No disponible | No disponible | Safetensors en HF, 0 descargas | Checkpoint de RL experimental sin benchmarks |
| `Qwen/Qwen3.5-4B` (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo publico de Qwen | Origen de los pesos; sus especificaciones no se detallan en este repositorio |

No se dispone de informacion verificada sobre otros modelos comparables de la misma categoria o tarea.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar que el uso comercial este permitido. Ademas, al derivar de `Qwen/Qwen3.5-4B`, habria que revisar la licencia del modelo base, que tampoco se reproduce en este repositorio.
- Ausencia total de documentacion de uso: no hay model card funcional, ni descripcion de la tarea, ni del espacio de etiquetas en caso de ser un filtro, ni del formato de prompt esperado.
- Sin benchmarks ni evaluacion: no hay ninguna evidencia publica de calidad, por lo que no se puede afirmar que mejore a su modelo base.
- Riesgo de alucinacion: no cuantificado, pero inherente a cualquier modelo generativo de 4,5 B; la ausencia de evaluacion impide acotarlo.
- Sesgos conocidos: no documentados. El entrenamiento con un juez externo propietario (`gpt-5.6-luna`) puede introducir el sesgo de criterio de ese juez, incluido un sesgo idiomatico y de estilo, sin que el autor lo haya analizado.
- Acoplamiento a la configuracion de generacion: fue optimizado con `temperature = 0.9`, `top_p = 1.0` y `enable_thinking = true`. Cambiar estos parametros puede degradar el comportamiento de forma no medida.
- Contexto: la configuracion de entrenamiento declara `seq_len = 300000` y la de inferencia `max_model_len = 65536`, valores dificiles de sostener en hardware convencional y no confirmados como ventana nativa del modelo. No asuma esa longitud de contexto en produccion.
- Idiomas: no declarados. No hay garantia de calidad en castellano ni en ningun otro idioma distinto del usado en el dataset de entrenamiento, que no se describe.
- Reproducibilidad: el comando de entrenamiento referencia rutas absolutas de un entorno interno (`/NHNHOME/shkim/...`) y depende de variables de entorno y claves de un juez externo (`JUDGE_BASE_URL`, `JUDGE_API_KEY`), por lo que la reproduccion exacta no es viable fuera de ese entorno.
- Estado del artefacto: 0 descargas, 0 likes, sin pipeline declarado y con dos unicas revisiones creadas y actualizadas el mismo dia (16 de septiembre de 2026). Debe tratarse como un experimento, no como un modelo soportado.
- Discrepancia en el identificador: el nombre termina en `epoch4` mientras la configuracion declara `learner_epoch = 3`; conviene verificar a que epoca corresponde el checkpoint antes de usarlo.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Stage-jh-monitor/filter-s_signal2-lmb025-200-4k-epoch4
- Modelo base citado en la configuracion: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento citado: https://huggingface.co/datasets/Stage-org/filter-s_signal2-lmb025-200-4k
- La busqueda web realizada no devolvio ningun resultado relevante: todas las coincidencias eran portales de ofertas de practicas (stage.fr, welcometothejungle.com, letudiant.fr, indeed.fr, stage.fr), sin relacion con el modelo. No hay papers, blogs, repositorios ni demos adicionales que enlazar.
