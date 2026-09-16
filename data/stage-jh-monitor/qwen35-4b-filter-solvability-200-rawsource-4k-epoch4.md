# Stage-jh-monitor/qwen35-4b-filter-solvability-200-rawsource-4k-epoch4

## Resumen

`Stage-jh-monitor/qwen35-4b-filter-solvability-200-rawsource-4k-epoch4` es un checkpoint de pesos publicado en HuggingFace por la cuenta `Stage-jh-monitor`, derivado del modelo base `Qwen/Qwen3.5-4B`. Segun la model card, no se trata de un lanzamiento de producto sino del artefacto de salida de un pipeline interno de entrenamiento por refuerzo (RL): el repositorio contiene la procedencia completa del entrenamiento, con el comando de ejecucion y el fichero de configuracion en formato TOML. El peso total declarado en los ficheros safetensors es de 4.539.265.536 parametros (aproximadamente 4,54 mil millones) y el repositorio ocupa 9,1 GB.

El modelo esta etiquetado internamente con la arquitectura `qwen3_5` y se ha entrenado mediante un metodo de RL con generacion on-policy, grupo de 8 muestras por prompt y evaluacion abierta mediante un modelo juez externo (`gpt-5.6-luna`). El nombre del checkpoint sugiere un experimento centrado en el filtrado por "solvability" (resolubilidad) de tareas sobre una fuente de datos cruda de 4k, aunque la model card no documenta el dataset ni el objetivo del experimento.

Es relevante ahora unicamente como evidencia de un flujo de trabajo automatizado de RL a escala pequena (2 GPU: 1 para inferencia y 1 para entrenamiento), no como modelo listo para produccion: acumula 0 descargas y 0 likes, no declara licencia, no declara idiomas y no incluye ninguna evaluacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`); detalles de capas y atencion no disponibles |
| Parametros totales | 4.539.265.536 (dato real de los ficheros safetensors) |
| Longitud de contexto | No disponible en la model card. La configuracion de entrenamiento usa `seq_len = 300000`; la de inferencia (vLLM) declara `max_model_len = 65536` |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors en precision completa; no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modelo base | `Qwen/Qwen3-4B` segun la configuracion de entrenamiento (`"model" = "Qwen/Qwen3.5-4B"`) |
| Metodo de entrenamiento | RL (`learner.method = "rl"`), 10.000 pasos de learner, 3 epocas declaradas |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna: la model card solo indica el tag `qwen3_5` y que el punto de partida es `Qwen/Qwen3.5-4B`. Por el tamano (4,54B parametros) y el tag, se trata de un transformer denso de la familia Qwen3.5, pero no hay datos publicados sobre numero de capas, dimension de embeddings, numero de cabezas de atencion, tipo de atencion (completa, lineal o hibrida) ni vocabulario. No hay evidencia de que sea un modelo MoE.

El entrenamiento se realizo por aprendizaje por refuerzo sobre el dataset `Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k`, con `group_size = 8`, batch de 128, `seq_len = 300000` y 10.000 pasos de learner repartidos en 3 epocas. La generacion durante el rollout usa temperatura 0,9, `top_p = 1.0`, `max_tokens = 4096` y modo de pensamiento activado (`enable_thinking = true`). La funcion de recompensa es un juez LLM externo (`gpt-5.6-luna`) con `max_retries = 3`, `max_in_flight = 32` y `mean_score = false`. El optimizador es AdamW con learning rate 1e-6, weight decay 0,0, betas (0,9; 0,99) y recorte de norma 1,0, con atencion en `flash_attention_2`. La perdida usa un esquema con mascaras DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`.

Como innovaciones tecnicas declaradas, el pipeline configura el servidor de inferencia vLLM con `language_model_only = true`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`, y un orquestador con `max_inflight_rollouts = 256` y `max_off_policy_steps = 8` (tolerancia a datos generados con politicas ligeramente desactualizadas). No se documenta composicion del dataset, numero de tokens de entrenamiento, ni si hubo fases previas de SFT o DPO.

## Capacidades

No se ha publicado ninguna evaluacion de capacidades de este checkpoint. Lo que se puede inferir proviene exclusivamente de la configuracion de entrenamiento e inferencia:

- Generacion de texto y razonamiento en modo pensamiento: la configuracion activa `enable_thinking = true` durante la generacion de rollouts, y el servidor de inferencia declara `reasoning_parser = "qwen3"`.
- Soporte de tool calling: el servidor vLLM se configura con `tool_call_parser = "qwen3_coder"`, lo que implica que el stack de inferencia espera llamadas a herramientas en formato compatible con Qwen.
- Entrenamiento orientado a tareas verificables: el nombre del experimento ("filter-solvability") y el uso de un juez LLM sugieren ajuste sobre tareas cuya resolubilidad se filtra previamente, aunque el criterio exacto no esta documentado.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible; la inferencia se configura explicitamente como `language_model_only = true`, lo que apunta a un uso exclusivamente de lenguaje en este pipeline.
- Rendimiento en codigo, matematicas o agentes multi-paso: no disponible, sin benchmarks publicados.

## Casos de uso

Advertencia previa: al no existir evaluacion publicada ni licencia declarada, estos casos de uso deben considerarse hipotesis de aplicacion derivadas de la configuracion y del nombre del experimento, no capacidades verificadas.

- Reproduccion de experimentos de RL: el repositorio incluye el comando de entrenamiento completo y el TOML con hiperparametros (learning rate, DPPO, `kl_tau`, `group_size`), por lo que sirve como referencia para replicar o auditar un ciclo de RL con juez externo sobre un modelo de 4,5B.
- Investigacion sobre filtrado por resolubilidad: el identificador del dataset (`filter-solvability-200-rawsource-4k`) apunta a un estudio sobre que fraccion del corpus crudo es resoluble por el modelo; este checkpoint permitiria comparar el comportamiento antes y despues de dicho filtrado.
- Prototipado de agentes con llamadas a herramientas en local: al declarar `tool_call_parser = "qwen3_coder"` y caber en una GPU de consumo, puede usarse como banco de pruebas de bucles de agente con vLLM antes de escalar a modelos mayores.
- Generacion de cadenas de razonamiento para destilacion: con el modo pensamiento activado y `max_tokens = 4096`, puede emplearse para producir trazas de razonamiento que alimenten el entrenamiento de modelos mas pequenos.
- Experimentacion con contexto largo: la configuracion de entrenamiento usa `seq_len = 300000`, muy por encima del `max_model_len = 65536` configurado en inferencia; el checkpoint permite estudiar la degradacion al desplegar ventanas mas cortas que las vistas en entrenamiento.
- Evaluacion de jueces LLM como recompensa: el pipeline depende de un juez externo con reintentos y concurrencia limitada; este modelo sirve para medir sesgos, coste y estabilidad de ese esquema de recompensa.
- Base para fine-tuning de dominio: al ser un checkpoint de 4,54B en safetensors y con licencia no declarada, es tecnicamente apto para ajuste posterior, siempre que se resuelva antes la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y los resultados de busqueda web recibidos no guardan relacion con el modelo (corresponden a portales de ofertas de practicas).

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del numero de parametros (4,54B) y del tamano del repositorio (9,1 GB), no datos publicados por el autor.

- Pesos en BF16/FP16: aproximadamente 9,1 GB, coherente con el tamano del repositorio.
- Pesos en INT8: aproximadamente 4,5-5 GB (requiere cuantizacion propia, no publicada).
- Pesos en INT4: aproximadamente 2,7-3 GB (requiere cuantizacion propia, no publicada).
- VRAM total: hay que sumar a los pesos la cache KV y las activaciones. Con `max_model_len = 65536` y sin conocer el numero de capas ni cabezas, no es posible calcular la cache KV con los datos disponibles; en la practica sera el factor dominante en contextos largos.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100 40/80 GB, H100 o L40S son adecuadas para FP16 con contexto largo; una RTX 4090 (24 GB) permite FP16 con contexto moderado y cuantizacion en INT8/INT4 para contextos mayores; una RTX 3060 de 12 GB exigiria cuantizacion.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 16-24 GB si se limita el contexto, y con mas holgura en INT8/INT4.
- Opciones de despliegue: el pipeline original usa vLLM (`gpu_memory_utilization = 0.9`, servidor en el puerto 7000, `reasoning_parser` y `tool_call_parser` de Qwen). Al publicarse solo safetensors, tambien son viables Transformers y TGI; llama.cpp u Ollama requeririan convertir a GGUF, conversion no publicada.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento de este checkpoint que permitan una comparativa funcional. La unica relacion verificable es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Stage-jh-monitor/qwen35-4b-filter-solvability-200-rawsource-4k-epoch4` | 4,54B | No disponible (entrenamiento con `seq_len = 300000`, inferencia con 65.536) | Sin benchmarks publicados | No disponible | safetensors, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base citado en la configuracion) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Referenciado en la config de entrenamiento |
| Otras alternativas de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de 4B en el material proporcionado, por lo que no se puede establecer una comparacion tecnica fiable.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni validacion de seguridad. Cualquier uso en produccion seria a ciegas.
- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si se permite uso comercial. Al derivar de `Qwen/Qwen3.5-4B`, habria que verificar la licencia del modelo base antes de cualquier uso.
- Idiomas no declarados: se desconoce que idiomas soporta y con que calidad.
- Riesgo de alucinacion: no cuantificado. Un ajuste por RL con recompensa de juez LLM puede optimizar hacia el estilo que premia el juez sin mejorar la veracidad, un riesgo conocido en este tipo de pipelines.
- Dependencia del juez: la senal de recompensa proviene de `gpt-5.6-luna`, un modelo externo. El checkpoint puede haber aprendido particularidades de ese juez (reward hacking parcial) que no se trasladen a otros evaluadores.
- Discrepancia en el nombre: el repositorio se llama `...epoch4` mientras la configuracion declara `learner_epoch = 3`. No se aclara si se trata de la cuarta epoca real, de un renombrado o de un error de etiquetado.
- Asimetria de contexto: se entrena con `seq_len = 300000` pero se sirve con `max_model_len = 65536`; no hay documentacion sobre el comportamiento mas alla de 65.536 tokens.
- Procedencia automatizada: el autor es una cuenta de monitorizacion (`Stage-jh-monitor`), no un equipo de publicacion de modelos. El repositorio parece un artefacto intermedio de un pipeline, sin model card descriptiva, sin ficha de uso y sin mantenimiento esperado.
- Sin cuantizaciones oficiales: al publicarse solo safetensors, cualquier despliegue ligero exige cuantizar por cuenta propia, con el consiguiente riesgo de degradacion no medida.
- Contexto de entrenamiento no reproducible: la configuracion apunta a rutas locales (`/NHNHOME/shkim/...`) y a variables de entorno de tokens y de juez externo, por lo que la reproduccion exacta del experimento no es posible solo con lo publicado.
- Datos de adopcion nulos: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-jh-monitor/qwen35-4b-filter-solvability-200-rawsource-4k-epoch4
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k
- Modelo base citado en la configuracion: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo del autor: no disponibles en la informacion proporcionada.
- Los resultados de busqueda web recibidos no contienen informacion relacionada con el modelo (corresponden a portales de ofertas de practicas: stage.fr, Indeed, Welcome to the Jungle, L'Etudiant) y se descartan como fuentes.
