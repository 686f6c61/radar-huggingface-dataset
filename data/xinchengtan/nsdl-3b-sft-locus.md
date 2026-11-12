# XinchengTan/nsdl-3b-sft-locus

## Resumen

NSDL 3B (SFT) LOCUS es un checkpoint de investigacion derivado de Qwen2.5-VL-3B-Instruct, publicado por Xincheng Tan y colaboradores (Ke Wang, Yining Di, Minfeng Zhu) como parte del articulo "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (arXiv preprint, 2026). El modelo se presenta como el resultado de la fila "Table II: NSDL 3B (SFT)" del citado paper y esta afinado especificamente para planificacion de tareas en entornos multi-robot, partiendo de un VLM de 3B parametros con capacidad de procesar imagen y texto.

El checkpoint se ha entrenado sobre el split de entrenamiento del dataset LOCUS, con la entrada visual limitada a 524288 pixeles y semilla 1234. Los pesos se almacenan en bfloat16, que es el tipo de dato que utiliza el cargador de evaluacion del repositorio oficial. No se trata de un modelo de proposito general, sino de un artefacto de investigacion reproducible: el autor indica explicitamente que debe cargarse y ejecutarse con el codigo de su repositorio (carpeta `nsdl/` y script `scripts/eval_lnsdl_agentic_viki_l2.py`).

Su relevancia es acotada pero clara: ofrece a la comunidad un punto de partida reproducible para investigar la division neuro-simbolica del trabajo en planificacion multi-robot, sobre una base VLM compacta (4.065.787.904 parametros reales en safetensors) que cabe en GPUs de gama media. La licencia Qwen Research limita el uso a investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM), derivada de Qwen2.5-VL-3B-Instruct |
| Parametros totales | 4.065.787.904 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License, uso no comercial en investigacion) |
| Formato de pesos | safetensors (bfloat16, 2 shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-3B-Instruct: un transformer multimodal que acepta entradas de imagen y texto y genera texto, con pipeline `image-text-to-text`. El checkpoint ha sido sometido a un fine-tuning supervisado (SFT) sobre el split de entrenamiento del dataset LOCUS, con la resolucion de entrada visual limitada a 524288 pixeles y semilla fija 1234. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

La innovacion tecnica no reside en la arquitectura del modelo en si, sino en el marco NSDL (Neuro-Symbolic Division of Labor) descrito en el articulo: el modelo actua como componente neuronal dentro de un sistema de planificacion multi-robot que combina razonamiento neuronal con componentes simbolicos. El checkpoint se distribuye con los pesos en bfloat16 y con los ficheros de tokenizer, configuracion de generacion y preprocesador de imagen estandar de la familia Qwen2.5-VL.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa pares imagen-texto y produce respuestas textuales, segun el pipeline `image-text-to-text`.
- Planificacion de tareas multi-robot: capacidad objetivo del fine-tuning, orientada a descomponer tareas en pasos ejecutables por multiples robots.
- Razonamiento agente multi-paso: el script de evaluacion del autor (`eval_lnsdl_agentic_viki_l2.py`) sugiere un modo de evaluacion agentico con interaccion multi-turno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, vision): vision si (entrada de imagen); thinking mode y audio no disponibles.

## Casos de uso

- Investigacion en planificacion multi-robot: usar el checkpoint como linea base reproducible (fila "Table II" del paper) para comparar variantes del marco NSDL en el dataset LOCUS, cargandolo con el codigo oficial del repositorio.
- Division neuro-simbolica del trabajo: integrar el modelo como componente neuronal que propone subtareas, mientras un planificador simbolico valida y asigna acciones a cada robot.
- Reproduccion de experimentos: ejecutar el script `eval_lnsdl_agentic_viki_l2.py` con los flags documentados en el README del repositorio para replicar los resultados publicados.
- Evaluacion agentica multi-turno: emplear el modelo en bucles de evaluacion donde el agente recibe observaciones visuales y textuales y emite acciones de planificacion sucesivas.
- Prototipado en robotica de laboratorio: al ser un modelo de 3B con pesos en bfloat16 (repo de 8,1 GB), permite iterar rapidamente en GPUs de gama media antes de escalar a modelos mayores.
- Estudio de fine-tuning sobre VLM compactos: servir como ejemplo de adaptacion de Qwen2.5-VL-3B a un dominio especifico (planificacion multi-robot) con un dataset concreto (LOCUS) y una receta reproducible (resolucion de 524288 pixeles, semilla 1234).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la fila "Table II: NSDL 3B (SFT)" del articulo arXiv para los resultados del modelo; no se incluyen cifras numericas en la model card ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 8,1 GB (repo completo); en fp16/bf16 se requiere del orden de 8-10 GB de VRAM para cargar el modelo, mas el coste de activaciones y KV cache.
- GPU recomendadas: A100, H100 o L40S para evaluacion a escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bfloat16.
- Cabe en GPU consumer: si, en tarjetas con 12-24 GB de VRAM (RTX 4090, RTX 3090, RTX 4080 con cuantizacion). No se documentan pesos GGUF en el repositorio.
- Opciones de despliegue: el autor especifica `transformers` y su propio codigo (`nsdl/` + `scripts/eval_lnsdl_agentic_viki_l2.py`). El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI, aunque no se documenta configuracion especifica. vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NSDL 3B (SFT) LOCUS | 4.065.787.904 | no disponible | qwen-research (no comercial) | Planificacion multi-robot (fine-tuning de Qwen2.5-VL-3B) |
| Qwen2.5-VL-3B-Instruct | ~3B (no verificado en esta ficha) | no disponible | qwen-research | VLM generalista, modelo base |
| Otros VLM de ~3B para robotica | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas especificas de planificacion multi-robot no esta disponible en la informacion proporcionada. El unico punto de referencia documentado es el modelo base Qwen2.5-VL-3B-Instruct, del que este checkpoint hereda arquitectura, tokenizer y licencia.

## Limitaciones y advertencias

- Licencia restrictiva: Qwen Research License, uso no comercial unicamente en investigacion. No apta para produccion comercial sin licencia adicional de Qwen.
- Modelo de investigacion: el autor indica explicitamente que debe cargarse y ejecutarse con su codigo; no se garantiza funcionamiento fuera del pipeline de evaluacion documentado.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, es probable que arrastre sesgos de Qwen2.5-VL-3B, pero no se detallan.
- Riesgo de alucinacion: no cuantificado; en tareas de planificacion multi-robot, una alucracion en la descomposicion de tareas puede producir planes invalidos, por lo que se recomienda validacion simbolica.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados en la model card.
- Entrada visual acotada: el entrenamiento limita la imagen a 524288 pixeles, lo que puede degradar el rendimiento con entradas de mayor resolucion.
- Reproducibilidad dependiente del codigo: sin el repositorio oficial, el comportamiento del checkpoint puede diferir del reportado en el paper.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XinchengTan/nsdl-3b-sft-locus
- Codigo oficial: https://github.com/Xincheng-Tan/NSDL
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Articulo: "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (Tan, Wang, Di, Zhu; arXiv preprint, 2026). El identificador arXiv no esta disponible en la informacion proporcionada.
