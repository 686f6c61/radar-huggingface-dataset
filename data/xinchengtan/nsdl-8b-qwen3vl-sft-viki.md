# XinchengTan/nsdl-8b-qwen3vl-sft-viki

## Resumen

NSDL 8B (SFT) es un ajuste fino supervisado del modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por Xincheng Tan y colaboradores (Ke Wang, Yining Di, Minfeng Zhu) en el contexto del artículo "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (preprint arXiv, 2026). El modelo está especializado en planificación de tareas para equipos multi-robot, combinando percepción visual y razonamiento simbólico dentro de un marco de división del trabajo neuro-simbólico.

Se trata de un transformer multimodal de 8.767 millones de parámetros (8,77 B), con pesos en bfloat16 y un tamaño de repositorio de 17,5 GB, distribuidos en cuatro ficheros safetensors. Hereda del modelo base Qwen3-VL-8B-Instruct la arquitectura, el tokenizador, el procesador de imagen y vídeo, y la licencia Apache-2.0.

El checkpoint corresponde a la fila "Table I: NSDL 8B, Qwen3-VL (SFT)" del artículo, y está pensado para ejecutarse junto con el código del repositorio oficial del proyecto (`nsdl/` + `scripts/eval_lnsdl_agentic_viki_l2.py`). No es un modelo de propósito general: es un artefacto de investigación orientado a la evaluación de agentes de planificación multi-robot sobre el conjunto VIKI-L2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 4 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar entradas de imagen, vídeo y texto. El ajuste fino se realizó mediante supervisión (SFT) sobre el pipeline NSDL, que propone una división del trabajo neuro-simbólica para la planificación de tareas en equipos multi-robot: el modelo actúa como componente de razonamiento y planificación dentro de un sistema mayor que combina percepción visual con módulos simbólicos.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se especifican innovaciones técnicas propias más allá de la integración con el marco NSDL y el conjunto de evaluación VIKI-L2. Los pesos se almacenan en bfloat16, la misma precisión que utiliza el cargador de evaluación del repositorio oficial, lo que sugiere que el checkpoint está pensado para reproducir exactamente los resultados del artículo.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen, vídeo y texto (heredadas de Qwen3-VL-8B-Instruct).
- Planificación de tareas multi-robot en el marco NSDL, con descomposición de objetivos y asignación de subtareas.
- Razonamiento agéntico multi-paso orientado a la evaluación con `scripts/eval_lnsdl_agentic_viki_l2.py`.
- Procesamiento de imagen y vídeo mediante los preprocesadores incluidos (`preprocessor_config.json`, `video_preprocessor_config.json`).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling y function calling: no confirmado en la información disponible (aunque el modelo base Qwen3-VL lo soporta, no se verifica en este checkpoint).
- Capacidades multilingües: no disponible.

## Casos de uso

- Planificación de tareas en flotas de robots: el modelo recibe el estado del entorno (posiblemente mediante observaciones visuales) y genera planes de subtareas que el marco NSDL distribuye entre los robots del equipo.
- Reproducción de resultados de investigación: cargar el checkpoint con el código oficial y el script `eval_lnsdl_agentic_viki_l2.py` para replicar la fila "NSDL 8B, Qwen3-VL (SFT)" de la Table I del artículo.
- Evaluación comparativa de planificadores neuro-simbólicos: servir como referencia SFT frente a otras variantes del marco NSDL (por ejemplo, versiones con RL o sin ajuste) sobre el benchmark VIKI-L2.
- Prototipado de agentes visuales para robótica: aprovechar la herencia de Qwen3-VL para tareas de image-text-to-text en las que el plan requiera interpretar escenas.
- Investigación en división del trabajo multi-agente: usar el modelo como componente de razonamiento dentro de arquitecturas que separan percepción, planificación simbólica y ejecución.
- Base para nuevos ajustes finos en dominios robóticos: al estar bajo Apache-2.0 y en formato transformers estándar, puede reentrenarse o adaptarse a otros conjuntos de planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Table I del artículo arXiv para los resultados numéricos, pero no incluye las cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requieren del orden de 20-24 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto limitado.
- En GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto ajustado; en GPUs de 16 GB requeriría cuantización, no documentada oficialmente para este checkpoint.
- Opciones de despliegue: transformers (librería declarada); compatible con endpoints de inferencia. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NSDL 8B (SFT) | 8,77 B | no disponible | Apache-2.0 | Ajuste SFT especializado en planificación multi-robot |
| Qwen/Qwen3-VL-8B-Instruct | ~8 B (no confirmado en la info) | no disponible | Apache-2.0 | Modelo base, propósito general multimodal |
| Otros ajustes NSDL | no disponible | no disponible | no disponible | Variantes del artículo no listadas en la información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: está diseñado para reproducir resultados del artículo y evaluarse con el código oficial; no se ha validado como modelo de producción general.
- Dependencia del código del repositorio: la model card indica explícitamente que debe cargarse y ejecutarse con `nsdl/` y `scripts/eval_lnsdl_agentic_viki_l2.py`; el uso fuera de ese pipeline no está documentado.
- Sesgos: no documentados, pero hereda los del modelo base Qwen3-VL-8B-Instruct.
- Riesgo de alucinación: no evaluado en la información disponible; en planificación robótica, planes incorrectos pueden tener consecuencias físicas.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe específico.
- Contexto máximo: no disponible, lo que dificulta planificar despliegues con historiales largos.
- Licencia Apache-2.0: permite uso comercial, pero el modelo no incluye garantías ni soporte; el autor no ofrece información sobre mantenimiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/XinchengTan/nsdl-8b-qwen3vl-sft-viki
- Repositorio de código: https://github.com/Xincheng-Tan/NSDL
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Artículo (arXiv preprint, 2026): "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning", Tan, Wang, Di, Zhu (referenciado en la model card; sin URL directa en la información disponible)
