# XinchengTan/nsdl-7b-sft-locus

## Resumen

NSDL 7B (SFT) es un ajuste fino supervisado del modelo vision-lenguaje Qwen2.5-VL-7B-Instruct, desarrollado por Xincheng Tan, Ke Wang, Yining Di y Minfeng Zhu en el contexto del articulo "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (preprint arXiv, 2026). El modelo esta disenado especificamente para planificacion de tareas en entornos multi-robot, combinando percepcion visual con razonamiento simbolico para descomponer objetivos en acciones ejecutables por distintos agentes roboticos.

Se trata de un checkpoint derivado del split de entrenamiento LOCUS, con la entrada visual limitada a 524288 pixeles durante el ajuste. Los pesos se almacenan en bfloat16 con un total de 8.292.166.656 parametros y un repositorio de 16,6 GB distribuido en cuatro ficheros safetensors. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia radica en que ejemplifica el uso de modelos VLM de tamano medio (7B) como nucleo de razonamiento dentro de arquitecturas neuro-simbolicas para robotica, un area donde los modelos especializados y reproducibles son escasos. No obstante, el modelo esta pensado para ejecutarse con el codigo especifico del repositorio NSDL y no como un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen2.5-VL), ajuste fino supervisado |
| Parametros totales | 8.292.166.656 (~8,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 4 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imagenes y texto conjuntamente mediante un encoder visual y un decodificador de lenguaje. Sobre esta base se aplico un ajuste fino supervisado (SFT) utilizando el split de entrenamiento del dataset LOCUS, con la resolucion de entrada visual limitada a 524288 pixeles. Los pesos se guardan en bfloat16, el mismo dtype que emplea el cargador de evaluacion del repositorio.

El entrenamiento esta orientado a la tarea de planificacion multi-robot dentro del marco NSDL (Neuro-Symbolic Division of Labor), que combina el VLM con componentes simbolicos para dividir el trabajo entre robots. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales; esa informacion debe consultarse en el articulo arXiv y en el repositorio de codigo.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas imagen-texto.
- Planificacion de tareas multi-robot: descomposicion de objetivos en acciones asignables a distintos agentes.
- Razonamiento neuro-simbolico integrado con el pipeline NSDL del repositorio oficial.
- Procesamiento de imagenes con limite de 524288 pixeles en el ajuste.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con text-generation-inference y endpoints compatibles (tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Planificacion de misiones multi-robot en almacenes: el modelo recibe imagenes del entorno y un objetivo de alto nivel, y genera una secuencia de subtareas asignadas a cada robot, aprovechando su entrenamiento especifico en division del trabajo.
- Investigacion en robotica neuro-simbolica: sirve como modulo de razonamiento visual dentro del pipeline NSDL para reproducir los experimentos del articulo (Tabla II, Tabla III, Figura 3).
- Evaluacion comparativa de planificadores: al ser un checkpoint reproducible con hashes verificables, permite replicar resultados frente a otros planificadores en el benchmark LOCUS.
- Prototipado de agentes colaborativos: integrado via `scripts/eval_lnsdl_agentic_viki_l2.py`, facilita experimentar con agentes que coordinan varios robots en simulacion.
- Generacion de instrucciones paso a paso a partir de escenas visuales: util en entornos donde un operador humano necesita traduccion de una imagen a un plan de accion estructurado.
- Base para ajustes posteriores en dominios roboticos especificos: al derivar de Qwen2.5-VL-7B-Instruct con licencia Apache-2.0, puede reentrenarse para nuevas flotas o tareas.
- Docencia y divulgacion: ejemplo didactico de SFT sobre un VLM para una tarea concreta con codigo y pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas II y III y a la Figura 3 del articulo arXiv para los resultados del checkpoint, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para inferencia comoda.
- En cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) viable en bfloat16 con batch pequeno.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16; en GPUs de 12-16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag del repo); vLLM, llama.cpp u Ollama no estan confirmados para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSDL 7B (SFT) | ~8,3 B | no disponible | Planificacion multi-robot (VLM) | Apache-2.0 | Hugging Face + repo NSDL |
| Qwen2.5-VL-7B-Instruct | ~8,3 B | no disponible | VLM generalista | Apache-2.0 | Hugging Face oficial |
| Alternativas especializadas en robotica VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros planificadores multi-robot no puede establecerse con los datos disponibles; el articulo NSDL es la referencia para dicha comparacion.

## Limitaciones y advertencias

- Modelo de proposito especifico: no esta pensado como asistente general; su rendimiento fuera del dominio LOCUS/multi-robot no esta validado.
- Dependencia del codigo del repositorio NSDL: la model card indica explicitamente que debe cargarse y ejecutarse con `nsdl/` y `scripts/eval_lnsdl_agentic_viki_l2.py`; su uso con otros pipelines puede dar resultados distintos.
- Sesgos: no documentados en la informacion proporcionada; al heredar de Qwen2.5-VL, puede arrastrar sesgos del modelo base y del dataset LOCUS.
- Riesgo de alucinacion: no cuantificado; en planificacion robotica, una accion erronea puede tener consecuencias fisicas, por lo que se recomienda validacion simbolica.
- Limitaciones de contexto e idioma: no disponibles; el limite de 524288 pixeles en el ajuste restringe la resolucion de entrada respecto al modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la licencia del dataset LOCUS para usos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin validacion comunitaria.
- Fechas del repositorio (creado y actualizado en noviembre de 2026) coherentes con un preprint de 2026; conviene confirmar la publicacion final del articulo.

## Enlaces

- Hugging Face: https://huggingface.co/XinchengTan/nsdl-7b-sft-locus
- Codigo NSDL: https://github.com/Xincheng-Tan/NSDL
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Articulo arXiv: referencia "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (Tan, Wang, Di, Zhu, 2026); enlace directo no disponible en la informacion proporcionada.
