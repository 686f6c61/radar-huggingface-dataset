# Stage-org/4b-includeact-300-27b-z-iter3-epoch2

## Resumen

`Stage-org/4b-includeact-300-27b-z-iter3-epoch2` es un checkpoint de un modelo de lenguaje de 4.539.265.536 parametros (≈4,54 B) publicado por la organizacion Stage-org en HuggingFace. Se trata de un artefacto de una cadena de entrenamiento iterativa: la propia model card lo identifica como el resultado de un entrenamiento por refuerzo (metodo `rl`) sobre el checkpoint previo `Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3-agent-rl-epoch1-low_lr`, usando el dataset `Stage-org/4b-includeact-300-27b-z-iter3` durante 10.000 pasos y 2 epocas.

El modelo no dispone de model card descriptiva al uso: el README contiene unicamente un bloque de procedencia de entrenamiento (comando, configuracion TOML y trazabilidad). No se declaran licencia, idiomas soportados, pipeline, plantilla de chat ni resultados de evaluacion. Las etiquetas del repositorio (`safetensors`, `qwen3_5`, `region:us`) apuntan a pesos en formato safetensors y a una arquitectura de la familia Qwen3.5, si bien esto no se confirma en la documentacion disponible.

Su relevancia actual es limitada y de caracter experimental: acumula 0 descargas y 0 likes en el momento de la consulta, y su interes principal es documental, como ejemplo de pipeline de RL con juez LLM externo y de reentrenamiento encadenado por iteraciones (`iter3`, `epoch2`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; la etiqueta del repositorio es `qwen3_5`, lo que sugiere un transformer decoder-only de la familia Qwen3.5 (no confirmado) |
| Parametros totales | 4.539.265.536 (≈4,54 B) |
| Parametros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No declarada. La configuracion de entrenamiento usa `seq_len = 300000` y la de inferencia `max_model_len = 65536`; no se especifica la ventana de contexto oficial del modelo |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Autor | Stage-org |
| Modelo base declarado | `Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3-agent-rl-epoch1-low_lr` |
| Dataset de entrenamiento | `Stage-org/4b-includeact-300-27b-z-iter3` (tipo `new_task`, split `train`) |
| Tamano del repositorio | 9,1 GB |
| Pipeline | No disponible |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay descripcion arquitectonica en la informacion proporcionada. La unica pista es la etiqueta `qwen3_5` y el uso de `flash_attention_2` como implementacion de atencion en el entrenamiento. El recuento de parametros (4,54 B) y el tamano del repositorio (9,1 GB) son coherentes con pesos en precision de 16 bits (4,54 B × 2 bytes ≈ 9,08 GB), aunque el tipo exacto (bf16/fp16) no se declara. No se especifican numero de capas, cabezas de atencion, cabezas KV, vocabulario ni si se emplean tecnicas como atencion lineal o decodificacion especulativa.

El entrenamiento documentado es una fase de ajuste por refuerzo con los siguientes hiperparametros: 10.000 pasos, 2 epocas, batch de 128, `seq_len` de 300.000, optimizador AdamW con learning rate 8e-07, `weight_decay` 0,0, `max_norm` 1,0 y betas 0,9/0,99. La generacion durante el bucle de RL usa temperatura 0,9, `top_p` 1,0, `max_tokens` 4096 y `enable_thinking = true`. El esquema de loss incluye `dppo_mask_low = 0,2`, `dppo_mask_high = 0,28`, `adv_tau = 1,0` y `kl_tau = 0,001`, con `group_size = 8`, lo que es compatible con un metodo de optimizacion tipo GRPO con enmascarado de tokens. La recompensa de las respuestas abiertas se obtiene mediante un juez LLM externo (`gpt-5.6-luna`, con `reasoning_effort = medium` y temperatura 1,0) y reintentos configurables (`max_retries = 3`, `max_in_flight = 32`). El entrenamiento se ejecuta en 2 GPU por nodo (1 para inferencia, 1 para entrenamiento), con checkpoints cada 1000 epocas conservando solo el ultimo, y semilla 7.

## Capacidades

- Generacion de texto autoregresiva (capacidad base del checkpoint; sin evaluacion publicada).
- Modo de razonamiento explicito: la configuracion de RL activa `enable_thinking = true` y el parser de razonamiento declarado para inferencia es `qwen3`.
- Soporte de tool calling / function calling: la configuracion de inferencia define `tool_call_parser = "qwen3_coder"`, lo que indica integracion prevista con llamadas a herramientas en formato compatible con Qwen3-Coder.
- Orientacion a tareas de agente: el modelo base de la cadena incluye `agent-rl` en su nombre y el dataset usa el tipo `new_task`, lo que sugiere entrenamiento sobre tareas nuevas evaluadas por juez.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponibles; la inferencia se configura con `language_model_only = true`.
- Capacidad de contexto largo: no verificada, pese a que la configuracion de entrenamiento emplea secuencias de hasta 300.000 tokens.

## Casos de uso

- Evaluacion de pipelines de RL con juez LLM: el artefacto sirve como referencia reproducible de un entrenamiento `rl` completo, incluyendo configuracion de recompensa, grupo de muestreo y control de KL, para equipos que disenen sus propios bucles de RLHF/RLAIF.
- Investigacion sobre tool calling en modelos pequenos: con 4,54 B de parametros y un parser de herramientas declarado, puede emplearse como banco de pruebas para medir como se degrada la precision de los argumentos JSON en modelos de este tamano.
- Comparacion de iteraciones de reentrenamiento: al existir una cadena de checkpoints (`iter2`, `iter3`, `epoch2`), permite estudiar el efecto de sucesivas rondas de RL sobre el mismo modelo base en terminos de estilo, verbosidad y adherencia al formato.
- Agentes de razonamiento con presupuesto acotado: gracias al modo thinking y a `max_tokens = 4096` en generacion, es apto para prototipos de agentes multi-paso en entornos con limites estrictos de coste por consulta.
- Generacion asistida de codigo en pipelines internos: el parser `qwen3_coder` habilita experimentar con llamadas a funciones para automatizar tareas de refactorizacion o consulta a APIs, siempre que la licencia lo permita (actualmente no declarada).
- Destilacion y ajuste fino posterior: al ser un modelo denso de 4,54 B en safetensors, es un candidato razonable como profesor o alumno en experimentos de destilacion sobre dominios concretos.
- Analisis de sesgos del juez automatico: la configuracion expone el modelo juez y sus parametros, lo que permite estudiar como un juez externo moldea el comportamiento final del checkpoint entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos en precision de 16 bits: aproximadamente 9,1 GB (coincide con el tamano del repositorio). Con cache KV y overhead de runtime, se recomienda un minimo de 12 GB y, de forma comoda, 16-24 GB.
- VRAM estimada con cuantizacion a 8 bits: en torno a 4,5-6 GB de pesos. A 4 bits: en torno a 2,5-4 GB. Estas cifras son estimaciones derivadas del recuento de parametros; no hay cuantizaciones publicadas por el autor.
- Cache KV: no puede dimensionarse con precision porque no se publican el numero de capas ni de cabezas KV. A 65.536 tokens de contexto, el cache puede superar holgadamente los 8 GB en fp16 para configuraciones tipicas de modelos de ~4 B, por lo que el despliegue a contexto largo exige cuantizacion del cache KV o GPUs de 40-80 GB.
- GPU consumer: cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) con cuantizacion o contexto reducido; en RTX 4090 (24 GB) se puede servir en fp16 con contexto moderado.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S para contextos largos o alto throughput. El propio pipeline de entrenamiento se ejecuto con 2 GPU por nodo, lo que indica que no requiere hardware de gran escala.
- Opciones de despliegue: vLLM (usado en la configuracion de inferencia del entrenamiento, con `gpu_memory_utilization = 0,9`), SGLang, TGI y transformers. Para llama.cpp, Ollama o LM Studio seria necesario convertir los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de comparacion proceden de especificaciones publicas generales y no de la informacion proporcionada para este modelo; deben verificarse antes de usarse en una decision tecnica. Las cifras del modelo evaluado son las unicas confirmadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/4b-includeact-300-27b-z-iter3-epoch2 | 4,54 B | No disponible | No disponible | safetensors en HuggingFace; sin cuantizaciones |
| Qwen3-4B | 4,0 B | 32.768 tokens nativos (131.072 con YaRN, segun documentacion publica) | Apache-2.0 | safetensors, GGUF y multiples cuantizaciones |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens (segun documentacion publica) | Licencia comunitaria de Llama 3.2 | safetensors y GGUF |
| Gemma 3 4B IT | 4 B | 128.000 tokens (segun documentacion publica) | Terminos de uso de Gemma | safetensors y GGUF |

No hay datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) para el modelo evaluado.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial. Cualquier despliegue en produccion requiere aclarar previamente los terminos con la organizacion autora.
- Ausencia de model card funcional: no hay descripcion de capacidades, plantilla de chat, formato de prompt ni idiomas, lo que dificulta la integracion fiable.
- Cero adopcion verificable: 0 descargas y 0 likes, sin evaluaciones independientes ni reportes de terceros.
- Riesgo de alucinacion: inherente a los modelos de ~4 B sin evaluacion publicada; no se documentan tasas de error ni mitigaciones.
- Sesgos desconocidos: no se declara composicion del dataset ni idiomas, por lo que no puede estimarse el sesgo linguistico, cultural o de dominio.
- Discrepancia de configuracion: el entrenamiento declara `seq_len = 300000`, mientras que la inferencia se configura con `max_model_len = 65536`. No se explica si el modelo soporta realmente secuencias de 300.000 tokens ni con que degradacion.
- Dependencia de un juez LLM externo: la senal de recompensa proviene de `gpt-5.6-luna`, un modelo no verificable en la informacion disponible. Esto introduce riesgo de sesgo del juez y de reward hacking, agravado por el enmascarado DPPO configurado.
- Procedencia del dataset opaca: el dataset se declara con `type = "new_task"` y `path = ""` (vacio), sin detalle de tamano, composicion ni metodo de recoleccion.
- Riesgo de sobreajuste al formato: 2 epocas completas de RL sobre el mismo conjunto pueden producir respuestas muy ajustadas al estilo del juez, con perdida de generalidad.
- Sin cuantizaciones oficiales ni ficheros GGUF: el uso en hardware de consumo exige convertir y cuantizar los pesos por cuenta propia, con el consiguiente riesgo de degradacion no medida.
- Modelo base de la cadena no auditado: `4b-strat-300-LH-27b-z-iter2-epoch3-agent-rl-epoch1-low_lr` tampoco aporta documentacion publica en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Stage-org/4b-includeact-300-27b-z-iter3-epoch2
- Modelo base declarado en la configuracion: https://huggingface.co/Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3-agent-rl-epoch1-low_lr
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/4b-includeact-300-27b-z-iter3
- Papers, blogs, repositorios o demos: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; unicamente portales de ofertas de practicas sin vinculacion con este artefacto.
