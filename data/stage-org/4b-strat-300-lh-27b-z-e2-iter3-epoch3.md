# Stage-org/4b-strat-300-LH-27b-z-e2-iter3-epoch3

## Resumen

El modelo `Stage-org/4b-strat-300-LH-27b-z-e2-iter3-epoch3` es un checkpoint de aproximadamente 4,54 mil millones de parametros publicado por la organizacion Stage-org en Hugging Face. Se trata de un modelo entrenado mediante aprendizaje por refuerzo (RL) a partir de un checkpoint previo ya ajustado con RL para tareas de agente, segun se detalla en la seccion de procedencia del entrenamiento incluida en el repositorio. El repositorio no incluye model card descriptiva, licencia declarada ni idiomas soportados, por lo que la mayor parte de su informacion tecnica procede de la configuracion de entrenamiento publicada.

La relevancia de esta publicacion es principalmente metodologica: expone la cadena completa de entrenamiento (comando, fichero TOML, hiperparametros, configuracion del servidor de inferencia para generacion de rollouts, juez externo y esquema de optimizacion) de un proceso de RL iterativo sobre modelos de ~4B con ventanas de entrenamiento declaradas de hasta 300.000 tokens. Esto lo convierte en un caso de estudio util para equipos que quieran reproducir pipelines de RL con vLLM y decodificacion con modo thinking, aunque no en un modelo listo para produccion: no tiene descargas ni validacion publica, la licencia es desconocida y no se han publicado resultados de benchmarks.

El identificador del repositorio sugiere la familia Qwen3.5 (etiqueta `qwen3_5`), y la configuracion de inferencia usa el parser de razonamiento `qwen3` y el parser de tool calls `qwen3_coder`. No obstante, la arquitectura concreta (numero de capas, cabezas, tipo de atencion o posible naturaleza MoE) no se documenta en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta del repositorio es `qwen3_5` y la configuracion de inferencia emplea parsers de la familia Qwen3, pero no se describe la arquitectura en la model card |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | No declarada. La configuracion de entrenamiento usa `seq_len` = 300.000 tokens y la de inferencia `max_model_len` = 65.536 tokens; sin confirmacion oficial |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB (coherente con ~4,54B parametros en precision de 16 bits) |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo (capas, dimension de embeddings, tipo de atencion, uso de atencion lineal o hibrida, etc.). La etiqueta `qwen3_5` y el uso de los parsers `qwen3` y `qwen3_coder` en el servidor de inferencia apuntan a una arquitectura de la familia Qwen3.5 con formato de salida compatible con los bloques de razonamiento y de llamada a herramientas de dicha familia. El unico dato estructural verificable es el recuento de parametros (4.539.265.536) y el tamano de los pesos en safetensors.

El proceso de entrenamiento documentado es un ajuste por aprendizaje por refuerzo con los siguientes elementos: modelo de partida `Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3-agent-rl-epoch2-low_lr` (es decir, un ciclo RL anterior), dataset `Stage-org/4b-strat-300-LH-27b-z-e2-iter3` (el campo `path` del TOML aparece vacio), 10.000 pasos de learner y 3 epochs, batch size 128, `seq_len` de 300.000, `group_size` de 8 (esquema tipo GRPO con 8 muestras por prompt), temperatura de generacion 0,9 con `top_p` 1,0 y `max_tokens` 4096, y modo thinking activado durante la generacion de rollouts. El optimizador es AdamW con learning rate 1e-6, weight decay 0,0, `max_norm` 1,0 y betas (0,9; 0,99). La perdida usa enmascarado DPPO con `dppo_mask_low` 0,2 y `dppo_mask_high` 0,28, `adv_tau` 1,0 y `kl_tau` 0,001, lo que indica un control explicito de la divergencia respecto a la politica de referencia.

Como innovaciones operativas destacables, la configuracion usa `flash_attention_2`, vLLM como servidor de inferencia (`language_model_only`, `gpu_memory_utilization` 0,9, puerto 7000) con un orquestador de hasta 256 rollouts en vuelo y un maximo de 8 pasos fuera de politica, y un juez externo `gpt-5.6-luna` consumido por API (`JUDGE_BASE_URL`, `JUDGE_API_KEY`) con hasta 32 peticiones concurrentes, 3 reintentos y backoff de 1 segundo, y `reasoning_effort` medio. El entrenamiento se ejecuto con 2 GPUs por nodo (1 de inferencia y 1 de entrenamiento) y semilla 7. No se menciona el uso de RLHF con preferencias humanas, DPO ni destilacion.

## Capacidades

- Generacion de texto autoregresiva: el modelo produce texto en un formato compatible con la familia Qwen3, con bloques de razonamiento (`enable_thinking` = true en la configuracion de generacion).
- Modo de razonamiento explicito: la configuracion activa el parser de razonamiento `qwen3` en el servidor de inferencia, lo que implica que el modelo emite trazas de pensamiento separadas de la respuesta final.
- Llamada a herramientas: la configuracion usa el parser `qwen3_coder` para tool calls, lo que indica que el modelo fue entrenado y evaluado emitiendo llamadas a funciones en ese formato.
- Comportamiento agentico: el modelo de partida se identifica como `agent-rl` y el bucle de RL usa un juez externo con puntuaciones abiertas, lo que apunta a tareas de multiples pasos y a interaccion con entorno.
- Capacidades multilingues: no disponible, no se declara ninguna lista de idiomas.
- Vision, audio u otras modalidades: no disponible; la configuracion de vLLM especifica `language_model_only = true`, lo que sugiere que el pipeline utilizado era exclusivamente de lenguaje.
- Generacion de codigo: no confirmada explicitamente, aunque el uso del parser `qwen3_coder` y el nombre del pipeline apuntan a tareas de codigo o de agentes de codigo.

## Casos de uso

- Investigacion en RL para agentes: el repositorio publica la configuracion completa (group_size 8, enmascarado DPPO, KL tau 0,001, juez externo), lo que permite reproducir o auditar un ciclo de RL sobre un modelo de ~4B con generacion en vLLM.
- Generacion de codigo asistida con herramientas: gracias al parser `qwen3_coder` y al entrenamiento agentico, el modelo puede integrarse en un bucle donde emite llamadas a funciones (lectura de ficheros, ejecucion de tests) y consume los resultados para continuar la tarea.
- Razonamiento multi-paso con trazas verificables: el modo thinking permite separar la traza de razonamiento de la respuesta final, util para depurar cadenas de decision en tareas de matematicas o logica.
- Evaluacion comparativa de checkpoints intermedios: al tratarse de un eslabon (`iter3-epoch3`) de una cadena iterativa, sirve para estudiar degradacion o mejora entre iteraciones de RL frente a los checkpoints anteriores de la familia.
- Procesamiento de documentos largos en experimentos de laboratorio: la configuracion declara `seq_len` de 300.000 en entrenamiento y 65.536 tokens de longitud maxima en inferencia, lo que permite experimentar con resumen o extraccion sobre contextos extensos, siempre validando antes la calidad real.
- Prototipado de asistentes conversacionales multi-turno: la combinacion de ventana de contexto amplia y soporte de llamadas a herramientas permite construir asistentes que consultan APIs y mantienen estado a lo largo de una conversacion.
- Generacion de datos sinteticos para RL: el propio modelo puede emplearse como generador de rollouts para alimentar un bucle posterior, tal y como se hizo con su checkpoint predecesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y la busqueda web realizada no devolvio resultados tecnicos relacionados con el modelo (unicamente paginas genericas sobre ofertas de practicas, sin relacion con el repositorio).

## Requisitos de hardware

- Peso de los parametros: con 4.539.265.536 parametros, los pesos ocupan aproximadamente 9,1 GB en 16 bits (bf16/fp16), coherente con el tamano del repositorio, unos 4,5 GB en 8 bits y unos 2,3-2,6 GB en 4 bits. Son calculos derivados del recuento de parametros, no datos publicados.
- VRAM estimada para inferencia: en bf16, entre 11 y 16 GB dependiendo del tamano de la cache KV y de la longitud de contexto efectiva; en 8 bits, entre 6 y 9 GB; en 4 bits, entre 4 y 6 GB. Estas cifras son estimaciones y no consideran el coste adicional de contextos muy largos.
- Coste de contexto: si se usa la longitud maxima declarada en la configuracion de inferencia (65.536 tokens), la cache KV puede crecer hasta varias decenas de gigabytes en funcion del numero de capas y cabezas, dato no disponible. Para contextos de 64k o superiores se recomienda GPU de 80 GB o tensor parallelism.
- GPU recomendadas: A100 80 GB, H100 80 GB o L40S para despliegues largos; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contextos moderados; RTX 4080/4070 Ti (16 GB) requieren cuantizacion o contextos cortos; GPUs de 12 GB (RTX 3060, RTX 4070) solo de forma viable en 4 bits.
- Si cabe en GPU de consumo: si, en RTX 4090 o 3090 sin cuantizar y con contexto moderado, y en GPUs de 12-16 GB con cuantizacion a 8 o 4 bits (siempre que se genere la version cuantizada, ya que el repositorio solo ofrece safetensors).
- Opciones de despliegue: vLLM es la opcion documentada por el propio autor en la configuracion de entrenamiento (servidor en el puerto 7000, `gpu_memory_utilization` 0,9, `language_model_only`); llama.cpp, Ollama o TGI son tecnicamente aplicables, pero requeririan convertir los pesos, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Multi-GPU: la configuracion de referencia usa 1 GPU para inferencia y 1 para entrenamiento con 2 GPUs por nodo; no se detalla la estrategia de paralelismo usada para el entrenamiento.

## Comparativa con modelos similares

La comparativa se basa en datos publicos generales de cada familia y no en mediciones sobre este checkpoint, cuyo rendimiento no esta publicado. Verificar siempre contra las fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| `Stage-org/4b-strat-300-LH-27b-z-e2-iter3-epoch3` | ~4,54B | No declarado (config: 65.536 en inferencia) | No disponible | 0 descargas, sin benchmarks, sin model card |
| Qwen3-4B (familia referenciada por la etiqueta `qwen3_5`) | ~4,0B | 32.768 nativo, ampliable con YaRN | Apache 2.0 en las versiones publicadas de la familia Qwen3 | Ampliamente desplegado, con soporte en vLLM, llama.cpp y Ollama |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 | Licencia comunitaria Llama 3.2 | Amplia disponibilidad, ecosistema maduro |
| Phi-4-mini (familia de ~3,8B) | ~3,8B | 128.000 | Licencia MIT en las versiones publicadas | Orientado a razonamiento y contexto largo |

Diferencias clave frente a esas alternativas: este modelo no declara licencia, no publica evaluaciones y no ofrece versiones cuantizadas; en contrapartida, documenta de forma inusualmente detallada su procedimiento de RL, algo que las alternativas comerciales no suelen exponer.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Debe tratarse como material de investigacion hasta que el autor la defina.
- Ausencia total de validacion: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros. No hay evidencia publica de que el modelo funcione correctamente.
- Riesgo de alucinacion: no se documentan tasas de error ni tecnicas de mitigacion; un modelo ajustado por RL con un juez externo puede optimizar hacia el criterio del juez en lugar de hacia la veracidad.
- Dependencia del juez: el entrenamiento utiliza un modelo propietario (`gpt-5.6-luna`) como juez via API, lo que introduce sesgos del juez en la politica aprendida y hace imposible reproducir el proceso sin acceso a ese endpoint.
- Ambiguedad en la procedencia de los datos: el TOML de entrenamiento declara `dataset.path = ""` y `type = "new_task"`, de modo que la composicion real del dataset de entrenamiento no es verificable desde la informacion publicada.
- Capacidades de contexto no verificadas: la configuracion menciona `seq_len` de 300.000 en entrenamiento y 65.536 en inferencia, pero ningun documento confirma que el modelo mantenga calidad en esas longitudes.
- Idiomas no declarados: no hay garantia de comportamiento correcto en castellano ni en ningun otro idioma distinto del que se usara en el dataset, que no se especifica.
- Sesgos desconocidos: no hay evaluacion de sesgos ni de seguridad, ni filtros de contenido documentados.
- Restricciones practicas de despliegue: solo se distribuyen pesos safetensors, sin GGUF ni cuantizaciones listas, lo que anade trabajo de conversion para entornos de bajos recursos.
- Cadena iterativa opaca: el modelo depende de checkpoints anteriores de la misma organizacion (`iter2`, `agent-rl-epoch2-low_lr`) que pueden arrastrar limitaciones heredadas no documentadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Stage-org/4b-strat-300-LH-27b-z-e2-iter3-epoch3
- Dataset de entrenamiento referenciado en la model card: https://huggingface.co/datasets/Stage-org/4b-strat-300-LH-27b-z-e2-iter3
- Modelo de partida del ciclo de RL: https://huggingface.co/Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3-agent-rl-epoch2-low_lr
- Perfil del autor: https://huggingface.co/Stage-org
- Paper, blog o repositorio de codigo: no disponible. La busqueda web realizada no devolvio ningun resultado tecnico relacionado con el modelo (los resultados obtenidos corresponden a portales de ofertas de practicas sin relacion alguna).
