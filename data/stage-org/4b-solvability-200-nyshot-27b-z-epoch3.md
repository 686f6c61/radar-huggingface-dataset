# Stage-org/4b-solvability-200-nyshot-27b-z-epoch3

## Resumen

`Stage-org/4b-solvability-200-nyshot-27b-z-epoch3` es un ajuste fino por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por la organizacion `Stage-org`. Se trata de un modelo de aproximadamente 4,54 mil millones de parametros (4.539.265.536 segun los pesos en safetensors) que, segun la propia model card, fue entrenado sobre el dataset `Stage-org/4b-solvability-200-nyshot-27b-z` durante 3 epocas y 10.000 pasos de aprendizaje, con un batch de 128 y una longitud de secuencia de 300.000 tokens en la configuracion declarada.

El interes tecnico del modelo reside en su pipeline de entrenamiento: usa RL con un tamano de grupo de 8, decodificacion con `enable_thinking` activado, un juez externo (`gpt-5.6-luna`) para puntuar respuestas abiertas y un marco de trabajo basado en `prime_rl` con vLLM como motor de inferencia (parser de razonamiento `qwen3` y parser de tool calling `qwen3_coder`). Todo ello apunta a un modelo orientado a tareas de razonamiento verificable o "solvability".

La relevancia actual es limitada pero informativa: el repositorio no registra descargas ni likes, no declara licencia ni idiomas, y no publica benchmarks. Funciona mas como un artefacto de investigacion reproducible que como un modelo listo para produccion, y resulta util para quien quiera inspeccionar una receta de RL aplicada a la familia Qwen3.5 en el rango de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (segun el tag `qwen3_5` y el modelo base `Qwen/Qwen3.5-4B`); detalles completos no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens segun `max_model_len` de la configuracion de inferencia; la configuracion de entrenamiento declara `seq_len` = 300.000 |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (conviene consultar la licencia del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer decoder-only de aproximadamente 4B parametros, y se somete a un ajuste fino mediante aprendizaje por refuerzo. La configuracion declarada (`stage.config.v7`) especifica el metodo `rl`, con 10.000 pasos de aprendiz, 3 epocas, batch de 128 y una longitud de secuencia de 300.000 tokens. El RL emplea un tamano de grupo de 8 para la generacion de rollouts, optimizador AdamW con `lr` = 1e-06, `weight_decay` = 0,0, `betas` (0,9; 0,99) y `max_norm` = 1,0. La funcion de perdida incluye parametros DPPO (`dppo_mask_low` = 0,2, `dppo_mask_high` = 0,28), `adv_tau` = 1,0 y `kl_tau` = 0,001.

La innovacion destacable esta en el bucle de RL: la generacion se hace con temperatura 0,9, `top_p` = 1,0, hasta 4096 tokens y con `enable_thinking` activado; la evaluacion de respuestas abiertas se delega en un juez externo (`gpt-5.6-luna`) con `reasoning_effort` medio, hasta 3 reintentos y 32 peticiones concurrentes. El entrenamiento usa `flash_attention_2` y vLLM (`language_model_only` = true, `gpu_memory_utilization` = 0,9) con los parsers `qwen3` (razonamiento) y `qwen3_coder` (tool calling). El orquestador admite hasta 256 rollouts en vuelo y 8 pasos fuera de politica (`max_off_policy_steps` = 8). No se detalla la composicion del dataset, el volumen total de tokens ni si hubo etapas previas de SFT o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (la configuracion de generacion activa `enable_thinking` = true).
- Tool calling / function calling, dado que la configuracion de vLLM declara `tool_call_parser` = `qwen3_coder`.
- Razonamiento multi-paso orientado a tareas de "solvability" (el nombre del experimento sugiere resolucion de problemas verificables).
- Generacion de codigo: el uso del parser `qwen3_coder` y del modelo base Qwen3.5 implica capacidades de codigo heredadas, aunque no se documentan especificamente.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en RL aplicado a LLM: permite reproducir o inspeccionar una receta concreta de RL con juez externo y grupo de 8 sobre un modelo de 4B, util para estudiar tecnicas DPPO y control de KL.
- Evaluacion de razonamiento verificable: el modelo esta entrenado sobre un dataset de "solvability", por lo que puede emplearse en experimentos de resolucion de problemas con respuesta comprobable.
- Generacion de codigo asistida en entornos de investigacion: el parser `qwen3_coder` habilita integraciones de tool calling en prototipos de agentes que ejecutan codigo.
- Prototipado de agentes multi-paso: con contexto de hasta 65.536 tokens y modo thinking, se puede usar en cadenas de razonamiento largas con llamadas a herramientas.
- Experimentos de ajuste con contexto largo: la configuracion de entrenamiento declara secuencias de 300.000 tokens, lo que lo hace interesante para probar comportamiento en ventanas muy extensas (siempre que la implementacion de inferencia lo soporte).
- Base para ablaciones de hiperparametros: al estar disponible el checkpoint de una epoca concreta (`epoch3`), sirve para comparar contra otros intentos de la misma serie.
- Analisis de alineacion y sesgos: al no haber filtros documentados, puede usarse como objeto de estudio en auditorias de comportamiento de modelos entrenados con RL sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 9-10 GB solo para los pesos (el repositorio ocupa 9,1 GB), mas la cache KV, que crece con el contexto. Para 65.536 tokens de contexto, la cache KV puede anadir varios GB adicionales.
- VRAM estimada con cuantizacion: no disponible de forma oficial, ya que no se publican cuantizaciones; conversiones a 8 bits o 4 bits reducen los pesos a aproximadamente 5 GB y 3 GB respectivamente, pero son estimaciones.
- GPU recomendadas: A100, H100 o similares para entrenamiento/inferencia con contexto muy largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contexto moderado.
- Caben en GPU de consumo: si, en RTX 4090, RTX 3090 o RTX 4080 (16 GB) con cuantizacion, o en RTX 4090 en bf16 con contexto reducido.
- Opciones de despliegue: vLLM (empleado en el propio entrenamiento), y potencialmente llama.cpp u Ollama si se generan conversiones a GGUF, que no se publican en el repositorio. Tambien son viables TGI o transformers con `flash_attention_2`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Stage-org/4b-solvability-200-nyshot-27b-z-epoch3` | ~4,54 B | 65.536 (`max_model_len`) | no disponible | no disponible | safetensors en HuggingFace |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4 B (declarado en la configuracion) | no disponible | no disponible | no disponible | HuggingFace |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa de rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen3.5 y entrenarse con un juez externo, puede heredar sesgos del modelo base y del criterio del juez.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion; en tareas de razonamiento abierto el riesgo no esta cuantificado.
- Limitaciones de contexto: aunque la configuracion de entrenamiento declara 300.000 tokens de secuencia, la configuracion de inferencia limita a 65.536 tokens (`max_model_len`); no hay evidencia de calidad en contextos largos mas alla de lo que fije la implementacion.
- Limitaciones de idioma: no se declaran idiomas soportados, por lo que no puede garantizarse un comportamiento correcto fuera del idioma o idiomas de entrenamiento.
- Restricciones de licencia: la licencia no esta declarada en el repositorio; antes de cualquier uso comercial debe verificarse la licencia aplicable, que probablemente venga condicionada por la del modelo base Qwen3.5-4B.
- Caveat de produccion: es un checkpoint de investigacion (epoch 3 de una serie experimental), sin benchmarks, sin descargas registradas y sin garantias de estabilidad; no se recomienda su uso en produccion sin una evaluacion propia previa.
- Dependencia de un juez externo: parte de su comportamiento esta moldeado por las puntuaciones de `gpt-5.6-luna`, lo que puede introducir preferencias no deseadas reflejadas del juez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-solvability-200-nyshot-27b-z-epoch3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento (referenciado en la model card): `Stage-org/4b-solvability-200-nyshot-27b-z`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web disponible.
