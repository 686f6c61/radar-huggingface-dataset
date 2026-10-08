# vosldtgbj/project-llm-sft-v3-l2-h0p5-seed20261006

## Resumen

Project LLM SFT v3 es un modelo multimodal de ~11,96 mil millones de parametros publicado por el usuario vosldtgbj en HuggingFace. Se trata de un ajuste supervisado (SFT) de la tercera iteracion del proyecto, construido sobre un modelo base ya sometido a un entrenamiento continuado previo (CPT 1.0 epoch, `cpt1-lora-15`). El modelo se apoya en la arquitectura `gemma4_unified` y se distribuye con pesos completos ya fusionados en formato Safetensors fragmentado.

La relevancia de esta ficha es limitada pero concreta: es un artefacto de investigacion orientado a la reproducibilidad de experimentos, la evaluacion offline y el estudio posterior, no un modelo listo para produccion ni un lanzamiento comercial. El autor lo describe explicitamente como archivo de pesos para reproduccion experimental, sin incluir estado de optimizador, scheduler ni datos de reanudacion de entrenamiento.

El pipeline declarado es `any-to-any` con soporte de `image-text-to-text`, lo que indica capacidades multimodales de entrada y salida. Gran parte de los datos tecnicos habituales (longitud de contexto, cuantizaciones soportadas, benchmarks, idiomas exactos) no estan publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (familia Gemma 4) |
| Parametros totales | 11.959.730.176 (~11,96 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (segun etiquetas del repositorio); resto no disponible |
| Licencia | apache-2.0, sujeta ademas a los terminos de licencia de Gemma 4 |
| Formato de pesos | Safetensors fragmentados (sharded Safetensors) |

Otros datos relevantes:

| Parametro | Valor |
|---|---|
| Tipo de pipeline | any-to-any |
| Modalidades | image-text-to-text, any-to-any |
| Libreria | transformers |
| Modelo base | vosldtgbj/project-llm-cpt-1p0-top10-02-lora-15 |
| Tamano del repositorio | 24,0 GB |
| Metodo de ajuste | RSLoRA SFT (r=128, alpha=32, dropout=0,05, LR=2e-5), pesos fusionados |
| Epocas de entrenamiento | 0,5 epocas |
| Mezcla de datos SFT | 90% datos de dominio + 10% datos generales |
| Fecha de archivado | 2026-10-08 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `gemma4_unified` de la familia Gemma 4, una familia multimodal que soporta entrada y salida de imagen y texto (`image-text-to-text`, `any-to-any`). Al tratarse de una variante "unified", cabe esperar un unico decodificador transformer multimodal, aunque la informacion proporcionada no detalla el mecanismo de proyeccion de imagen ni el tokenizador visual. El modelo base sobre el que se ha ajustado es `vosldtgbj/project-llm-cpt-1p0-top10-02-lora-15`, resultado de una fase de entrenamiento continuado (CPT) de 1.0 epoca con LoRA, sobre el cual se aplico despues el SFT.

El entrenamiento de esta iteracion consiste en un ajuste supervisado (SFT v3) con una mezcla de 90% datos de dominio y 10% datos generales, ejecutado durante 0,5 epocas. El metodo de ajuste es RSLoRA (Rank-Stabilized LoRA) con rango 128, alpha 32, dropout 0,05 y tasa de aprendizaje 2e-5, cuyos adaptadores se han fusionado en los pesos completos antes de la publicacion. No se detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto: capacidades base heredadas de la familia Gemma 4.
- Procesamiento multimodal: soporta entradas y salidas de imagen y texto (`image-text-to-text`, `any-to-any`), segun el pipeline declarado.
- Idiomas: la etiqueta `japanese` del repositorio sugiere soporte de japones, probablemente reforzado por el ajuste de dominio. El resto de idiomas no esta especificado.
- Ajuste de dominio: el SFT con 90% de datos de dominio sugiere especializacion en una tarea concreta del "Project LLM", aunque el dominio no se detalla en la informacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking / razonamiento explicito: no disponible.
- Audio u otras modalidades: no disponible.

## Casos de uso

Dado que el repositorio se describe como un archivo de pesos para reproduccion experimental, los casos de uso son fundamentalmente de investigacion:

- Reproduccion de experimentos: permite volver a cargar el punto exacto de SFT v3 (`L2--h0p5--seed20261006`) para replicar resultados o compararlos con otras semillas y configuraciones de LoRA.
- Evaluacion offline comparativa: util para medir el efecto de distintas mezclas de datos de dominio (por ejemplo 90/10) frente a otras proporciones, sobre una misma base CPT.
- Investigacion sobre ajuste continuado (CPT) mas SFT: la cadena CPT 1.0 epoch -> SFT 0.5 epocas sirve como caso de estudio de pipelines de entrenamiento en dos fases.
- Ajuste posterior sobre dominio japones: al declarar la etiqueta `japanese`, puede emplearse como punto de partida para tareas en japones, aunque requiere validacion propia.
- Experimentos multimodales imagen-texto: el pipeline `any-to-any` permite explorar tareas de descripcion de imagen, respuesta visual a preguntas u otras interacciones multimodales, siempre dentro de un contexto de investigacion.
- Base para nuevos ciclos de LoRA: al ser pesos ya fusionados, se puede reajustar con nuevos adaptadores LoRA para experimentos derivados.
- Docencia y practica: util como ejemplo practico de carga de un modelo multimodal con `AutoProcessor` y `AutoModelForMultimodalLM`.

No se recomienda su uso en produccion o en aplicaciones orientadas al usuario sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio indica 0 descargas y 0 "likes", no incluye tabla de resultados y la busqueda web no aporta metricas asociadas a este modelo. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

Estimaciones orientativas basadas en el numero de parametros (~11,96 mil millones); no proceden de la documentacion oficial del modelo.

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 24 GB solo de pesos, mas memoria para el cache KV y buffers multimodales.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 12-13 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 7-8 GB.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S, A6000.
- GPU de consumo: puede caber en RTX 4090 (24 GB) en BF16 ajustado o cuantizado; en 4 bits tambien en RTX 3090, RTX 4080 y GPUs de 12-16 GB, con margen limitado.
- Opciones de despliegue: al ser un modelo multimodal con arquitectura `gemma4_unified`, requiere versiones recientes de Transformers con `AutoModelForMultimodalLM`. El soporte en vLLM, llama.cpp, Ollama o TGI depende de que dichas herramientas incorporen la arquitectura Gemma 4 unificada; no se confirma en la informacion disponible.
- Latencia y throughput: no disponible.

Nota: el repositorio pesa 24,0 GB, coherente con pesos en precision de 16 bits.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones verificables de este modelo frente a alternativas, por lo que no es posible establecer una comparativa rigurosa. Como referencia de categoria, se situaria en el segmento de modelos multimodales de ~12B de parametros con licencia apache-2.0 (sujeta a terminos Gemma 4), pero no se aportan cifras comparables.

| Modelo | Parametros | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|
| project-llm-sft-v3-l2-h0p5-seed20261006 | ~11,96B | no disponible | apache-2.0 + terminos Gemma 4 | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como archivo para reproduccion, evaluacion offline e investigacion, no como modelo listo para produccion.
- Sin benchmarks publicados: no hay evidencia publica de su rendimiento en tareas estandar.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay datos especificos de este ajuste.
- Sesgos: no se documenta ningun analisis de sesgos ni de seguridad; el ajuste con 90% de datos de dominio puede introducir sesgos especificos del dominio no evaluados.
- Idiomas: solo se etiqueta japones; el comportamiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto desconocida: limita la planificacion de aplicaciones con entradas largas.
- Licencia: aunque la etiqueta indica apache-2.0, el propio repositorio remite a los terminos de licencia de Gemma 4, que imponen condiciones adicionales; es imprescindible revisarlas antes de cualquier uso comercial.
- Dependencia de versiones: la carga requiere una version de Transformers que soporte `gemma4_unified`; versiones antiguas pueden fallar.
- Trazabilidad: el repositorio no incluye estado de optimizador ni de reanudacion, por lo que no permite continuar el entrenamiento desde el punto exacto, solo reutilizar los pesos.
- Contexto temporal: las fechas del repositorio (2026) son posteriores al conocimiento base tipico de muchas herramientas; conviene verificar compatibilidad real de cada stack.

## Enlaces

- HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-l2-h0p5-seed20261006
- Modelo base (CPT): https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-02-lora-15
- Licencia Gemma 4 referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- vLLM (web): https://vllm.ai/
- Plantilla de SFT en GCP (referencia generica): https://github.com/vpoluyaktov/llm-sft-test
- Leaderboard de referencia (sin datos de este modelo): https://benchlm.ai/
