# Stage-jh-monitor/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k-epoch4

## Resumen

Este repositorio contiene un ajuste por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Stage-jh-monitor bajo un identificador que delata su origen experimental: `qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k-epoch4`. Los pesos en safetensors suman 4.539.265.536 parametros (4,54 mil millones) y el repositorio ocupa 9,1 GB, coherente con pesos en precision de 16 bits.

El problema que aborda es acotado: se trata de un checkpoint de investigacion generado dentro de un flujo automatizado de entrenamiento RL, no de un modelo de proposito general documentado. La model card no incluye descripcion funcional, ni resultados de evaluacion, ni licencia; unicamente registra la procedencia del entrenamiento (dataset, comando y configuracion TOML). Por tanto, su relevancia es limitada fuera del contexto del experimento que lo produjo.

La informacion publica no permite confirmar si el modelo conserva o mejora las capacidades del base. Se sabe que el entrenamiento activo el modo de razonamiento (`enable_thinking = true`) y que la configuracion de inferencia usa el parser de tool calling `qwen3_coder`, lo que sugiere que se buscaba preservar las capacidades de razonamiento y de llamada a herramientas del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen/Qwen3.5-4B; numero de capas, cabezas y tipo de atencion no disponibles |
| Parametros totales | 4.539.265.536 (4,54 mil millones), calculado a partir de los pesos safetensors |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no confirmada. La configuracion de entrenamiento usa `seq_len = 300000` y la de inferencia `max_model_len = 65536` tokens |
| Tipos de cuantizacion | no disponibles (solo se publican pesos safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 9,1 GB) |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de entrenamiento | RL con grupo de 8 muestras por prompt, perdida tipo DPPO y juez LLM externo |
| Autor | Stage-jh-monitor |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna mas alla del modelo base declarado (Qwen/Qwen3.5-4B) y de la etiqueta `qwen3_5`. La configuracion de entrenamiento si es explicita: se aplico aprendizaje por refuerzo con `method = "rl"`, `group_size = 8` (esquema tipo GRPO, con ocho generaciones por prompt para estimar la ventaja), 1.000 pasos de aprendizaje con `learner_epoch = 3`, `batch_size = 128` y semilla `7`.

El objetivo de RL combina una perdida `default` con mascaras de tipo DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`, lo que indica un control de divergencia respecto a la politica de referencia bastante laxo. La recompensa se obtiene con un juez LLM de extremo abierto (`gpt-5.6-luna`, `reasoning_effort = "medium"`, temperatura 1.0, hasta 4.096 tokens de generacion), con `mean_score = false` y hasta 32 peticiones en vuelo. El optimizador es AdamW con `lr = 1e-6`, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0.9/0.99, y la atencion usa `flash_attention_2`.

La generacion durante el entrenamiento se hizo con temperatura 0.9, `top_p = 1.0`, `max_tokens = 4096` y modo de razonamiento activado. La infraestructura fue de dos GPU por nodo, una para inferencia (vLLM en el puerto 7005, con `gpu_memory_utilization = 0.9` y `language_model_only = true`) y otra para entrenamiento. El dataset se referencia como `Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k` sin composicion, tamano ni procedencia detallados; el nombre sugiere datos filtrados con prompts nuevos derivados de un modelo de 27B, pero esto no se confirma en la model card.

## Capacidades

- Generacion de texto y razonamiento: la configuracion activa `enable_thinking = true` y el parser de razonamiento `qwen3`, lo que indica que el modelo esta pensado para producir cadenas de razonamiento antes de la respuesta final. No hay evaluacion publicada que lo confirme.
- Llamada a herramientas: la configuracion de vLLM usa `tool_call_parser = "qwen3_coder"`, por lo que se espera soporte de function calling en formato compatible con Qwen. No se documenta el esquema exacto ni su fiabilidad.
- Codigo: el parser de herramientas apunta a un perfil orientado a codigo, pero no se aportan ejemplos, benchmarks ni datos de entrenamiento especificos de codigo.
- Agentes y razonamiento multi-paso: el uso de un juez de extremo abierto y de generaciones de hasta 4.096 tokens sugiere tareas de respuesta larga, aunque no se documenta soporte explicito de flujos agente.
- Multilingue: no disponible. No se declaran idiomas en la model card ni en las etiquetas del repositorio.
- Vision o audio: no soportados en la configuracion publicada (`language_model_only = true`).
- Capacidades especiales: ninguna documentada mas alla del modo de razonamiento.

## Casos de uso

- Experimentacion academica con RLHF/RLAIF: el repositorio sirve como checkpoint reproducible de un pipeline RL con juez LLM; util para estudiar el efecto de las mascaras DPPO y de `kl_tau` bajo en la divergencia respecto al modelo base.
- Punto de partida para ajuste supervisado posterior (SFT): al ser un derivado de Qwen/Qwen3.5-4B, se puede reutilizar como inicializacion de un SFT especifico de dominio, asumiendo que la licencia del base lo permita.
- Evaluacion de razonamiento con modo thinking: util para comparar, en igualdad de prompts, la calidad de las cadenas de razonamiento frente al base Qwen3.5-4B y detectar si el RL las acorto, las degrado o las mejoro.
- Prototipado de agentes con tool calling en local: con 4,54 mil millones de parametros y pesos safetensors, puede desplegarse en vLLM con `tool_call_parser = "qwen3_coder"` para probar pipelines de llamada a funciones en una sola GPU.
- Generacion de codigo en entornos de prueba: integrable en un servidor compatible con OpenAI para autocompletado o generacion de tests, siempre con revision humana y sin garantias de calidad al no existir benchmarks.
- Analisis de sesgos inducidos por el juez: al haberse optimizado contra un juez automatico (`gpt-5.6-luna`), es un caso de estudio adecuado para medir sobreajuste al estilo del evaluador (reward hacking).
- Destilacion o generacion de datos sinteticos: el modelo puede emplearse para producir candidatos de respuesta que luego se filtren, replicando el esquema que sugiere el nombre del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio registra 0 descargas y 0 likes, por lo que no existen evaluaciones de terceros asociadas.

## Requisitos de hardware

- VRAM para pesos en FP16/BF16: aproximadamente 9,1 GB (coincide con el tamano del repositorio). Es una estimacion derivada del numero de parametros, no un dato publicado.
- VRAM con contexto largo: a 65.536 tokens (el `max_model_len` de la configuracion), la cache KV anade una cantidad no cuantificable sin conocer el numero de capas, cabezas y dimension de cabeza. Se recomienda reservar margen adicional en funcion del lote concurrente.
- VRAM en cuantizacion: no disponible como artefacto publicado. Si se generan cuantizaciones propias, cabria esperar del orden de 4,5-5 GB en 8 bits y 2,5-3 GB en 4 bits, siempre como estimacion aproximada.
- GPU consumer: en FP16 cabe con holgura en una RTX 3090 o RTX 4090 (24 GB) y de forma mas justa en una RTX 4080 (16 GB). En tarjetas de 8-12 GB seria necesario cuantizar, lo que requiere convertir los pesos a GGUF por cuenta propia.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para el peso del modelo, pero utiles si se necesita atender muchas peticiones concurrentes con contexto largo.
- Despliegue: vLLM es la opcion coherente con la configuracion de entrenamiento (`max_model_len = 65536`, `language_model_only = true`, `reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`). llama.cpp, Ollama o TGI requeririan conversiones no publicadas.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos corresponden a documentacion publica de sus respectivos repositorios y no se han verificado en esta busqueda; los del modelo analizado proceden unicamente del repositorio y de la model card.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-4b-filter-s_signal5-200 (este modelo) | 4,54 mil millones | No confirmado (`max_model_len` de 65.536 en la config de inferencia) | No disponible | No disponible | HuggingFace, safetensors, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | HuggingFace |
| Qwen3-4B | 4,0 mil millones (segun documentacion publica) | 32.768 tokens nativos, ampliable (segun documentacion publica) | Si, publicado por el autor | Apache 2.0 | HuggingFace, amplia adopcion |
| Llama 3.2 3B | 3,2 mil millones (segun documentacion publica) | 128.000 tokens (segun documentacion publica) | Si, publicado por el autor | Licencia comunitaria Llama 3.2 | HuggingFace, amplia adopcion |

No hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa; la unica diferencia verificable frente al base es la aplicacion de un ciclo de RL con juez automatico.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo contiene procedencia de entrenamiento; no hay descripcion de uso, ni de datos, ni de evaluacion.
- Licencia no declarada: sin licencia explicita no se puede asumir uso comercial. Ademas, la licencia del modelo base Qwen/Qwen3.5-4B no se detalla en la informacion disponible y condiciona cualquier redistribucion.
- Sesgos: desconocidos. No se documenta composicion del dataset ni proceso de filtrado, por lo que no se puede descartar la herencia de sesgos del modelo base y del corpus de RL.
- Sobreajuste al juez: la recompensa proviene de un unico juez LLM (`gpt-5.6-luna`) con `reasoning_effort = "medium"`. Esto favorece el reward hacking y estilos de respuesta que agradan al evaluador sin mejorar la correccion factual.
- Divergencia poco restringida: `kl_tau = 0.001` es un coeficiente de KL muy bajo, lo que permite al modelo alejarse bastante de la politica de referencia y aumentar el riesgo de degradacion de capacidades generales.
- Alucinacion: riesgo no medido. No hay evaluaciones de fidelidad ni de tasas de error.
- Contexto: aunque la configuracion de entrenamiento declara `seq_len = 300000`, no hay evidencia de que el modelo mantenga calidad a esa longitud; el valor de inferencia es de 65.536 tokens y tampoco esta validado.
- Idiomas: sin declaracion oficial, el soporte multilingue es indeterminado.
- Checkpoint experimental: el nombre incluye `epoch4`, lo que apunta a un estado intermedio de un barrido, no a una version final curada. Con 0 descargas y 0 actualizaciones posteriores, no hay senales de mantenimiento.
- Idiomas de la model card: no disponibles. Esta ficha se ha redactado exclusivamente con la informacion aportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-jh-monitor/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k-epoch4
- Dataset de entrenamiento referenciado en la model card: https://huggingface.co/Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo. Las busquedas devolvieron unicamente portales de ofertas de practicas (stage.fr, 1jeune1solution.gouv.fr, welcometothejungle.com, jobs-stages.letudiant.fr), sin relacion con el modelo. No se dispone de paper, blog, repositorio de codigo ni demo asociados.
