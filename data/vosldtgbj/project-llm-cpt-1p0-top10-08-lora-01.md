# vosldtgbj/project-llm-cpt-1p0-top10-08-lora-01

## Resumen

`vosldtgbj/project-llm-cpt-1p0-top10-08-lora-01` es un checkpoint experimental de ajuste por *continual pretraining* (CPT) construido sobre el modelo multimodal `google/gemma-4-12B`. Lo publica el usuario `vosldtgbj` como parte de una serie de experimentos denominada "Project LLM", en la que cada archivo recoge una variante de entrenamiento concreta. En este caso se trata de la variante `top10-08-lora-01` entrenada durante 1,0 epoca mediante LoRA CPT, cuyos adaptadores ya han sido fusionados en los pesos completos.

El modelo conserva la arquitectura multimodal del modelo base (etiquetada como `gemma4_unified`) y un total de 11.959.730.176 parametros (~12B), empaquetados en safetensors fragmentados que ocupan 24,0 GB en el repositorio. La *pipeline tag* es `any-to-any` y la etiqueta `image-text-to-text` indica capacidades de entrada y salida multimodales. El repositorio se distribuye unicamente con pesos y configuracion, sin estados de optimizador ni puntos de reanudacion de entrenamiento.

Su relevancia es acotada: no es un modelo de produccion, sino un artefacto de investigacion orientado a reproducir experimentos, evaluacion offline y trabajo posterior. La model card lo declara explicitamente como archivo de pesos "para reproduccion experimental, evaluacion offline y seguimiento de investigacion", sin tarjeta de rendimiento ni benchmarks publicados. El interes practico reside en estudiar el efecto del continual pretraining (con datos parcialmente en japones, segun las etiquetas) sobre un Gemma 4 de 12B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer multimodal, segun etiquetas; detalles no disponibles) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo distribuye pesos completos en safetensors sin cuantizaciones oficiales |
| Idiomas soportados | no disponible (la etiqueta `japanese` sugiere datos de entrenamiento en japones; la lista completa no se publica) |
| Licencia | apache-2.0 (declarada en HuggingFace), sujeta ademas a la licencia Gemma 4 del modelo base |
| Formato de pesos | safetensors fragmentado (sharded) |
| Modelo base | google/gemma-4-12B |
| Etapa de entrenamiento | CPT (continual pretraining), 1,0 epoca |
| Metodo de ajuste | LoRA aplicado y fusionado en pesos completos |
| Tamano del repositorio | 24,0 GB |
| Modalidad (pipeline) | any-to-any / image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `google/gemma-4-12B`, referenciada en las etiquetas como `gemma4_unified`. Se trata de un modelo multimodal de ~12B parametros que procesa y genera contenido en modalidades multiples (etiquetas `any-to-any` e `image-text-to-text`). El repositorio emplea la clase `AutoModelForMultimodalLM` de Transformers, lo que confirma que se carga como modelo multimodal. No se dispone de informacion detallada sobre el numero de capas, dimensiones, mecanismo de atencion ni innovaciones internas del modelo base.

Respecto al entrenamiento, la model card indica que se aplico *continual pretraining* con LoRA durante 1,0 epoca sobre el Gemma 4 de 12B, y que los adaptadores se fusionaron posteriormente en los pesos completos. No se especifica el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La etiqueta `japanese` sugiere la inclusion de corpus en japones en el entrenamiento continuado, pero no se aportan cifras. Tampoco se documentan tecnicas como decodificacion especulativa, atencion lineal ni variantes hibridas.

## Capacidades

- Generacion de texto y continuacion de secuencias, heredadas del modelo base Gemma 4 de 12B.
- Procesamiento multimodal de entrada de imagen y texto (etiqueta `image-text-to-text`).
- Salida multimodal ("any-to-any" segun la pipeline tag del repositorio).
- Competencia reforzada en japones como consecuencia del continual pretraining (segun etiqueta).
- Capacidades potenciales del modelo base (razonamiento, codigo, matematicas): no confirmadas en la informacion disponible para este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Reproduccion de experimentos de continual pretraining: el checkpoint permite repetir y auditar el entrenamiento `top10-08-lora-01` sobre el Gemma 4 de 12B, comparando los pesos fusionados frente al modelo base.
- Evaluacion offline comparativa: util para medir el impacto del CPT en tareas de texto e imagen, contrastando este checkpoint con otras variantes de la serie "Project LLM" (por ejemplo `project-llm-cpt-0p5-lora-13`).
- Investigacion sobre fusion de adaptadores LoRA: dado que los adaptadores ya estan fusionados, sirve para estudiar diferencias entre pesos fusionados y pesos con adaptadores aplicados en inferencia.
- Analisis de transferencia multilingue hacia japones: la etiqueta `japanese` permite estudiar hasta que punto un CPT corto (1,0 epoca) mejora el rendimiento en dicho idioma frente al modelo base.
- Punto de partida para ajuste posterior (SFT/DPO): al ser pesos completos cargables, se puede usar como inicializacion de nuevas fases de entrenamiento en lugar de partir del Gemma 4 original.
- Experimentacion multimodal controlada: para prototipos de investigacion que necesiten un modelo imagen-texto de ~12B con arquitectura `gemma4_unified` y licencia permisiva.
- Docencia y practicas de laboratorio sobre ciclo de vida de un LLM: el repositorio, pequeno en numero de artefactos (solo pesos y configuracion), es adecuado como ejemplo de publicacion de un CPT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa de 16 bits: en torno a 24 GB solo para pesos, mas overhead de activaciones y cache KV (se recomienda reservar 30-40 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 12-14 GB de pesos. En 4 bits: aproximadamente 6-8 GB de pesos. Estas cifras son estimaciones derivadas de los 11,96B parametros, no medidas publicadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para precision completa; en consumer, RTX 4090 (24 GB) para 16 bits al limite y RTX 3090/4080/4090 para cuantizaciones de 8 y 4 bits.
- Compatibilidad con consumer GPU: viable en 4 bits en GPUs de 8-12 GB y en 8 bits desde 16 GB; en 16 bits exigente pero factible en 24 GB con contextos cortos.
- Opciones de despliegue: el repositorio requiere una version de Transformers con soporte para `gemma4_unified` y `AutoModelForMultimodalLM` (segun la model card). El soporte en vLLM, llama.cpp, Ollama o TGI no se documenta y no puede confirmarse con la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vosldtgbj/project-llm-cpt-1p0-top10-08-lora-01` | ~12B | no disponible | multimodal | apache-2.0 + licencia Gemma 4 | HuggingFace, 0 descargas |
| `google/gemma-4-12B` (modelo base) | ~12B | no disponible | multimodal | licencia Gemma 4 | repositorio oficial de Google |
| `vosldtgbj/project-llm-cpt-0p5-lora-13` (mismo autor) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones; el rendimiento real del checkpoint es desconocido.
- Es un artefacto experimental con 0 descargas y 0 "likes", sin validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay datos especificos para este checkpoint, pero al no existir evaluacion no puede acotarse.
- Sesgos conocidos: no disponibles. El entrenamiento continuado sobre corpus no documentados puede introducir o amplificar sesgos, especialmente en el ambito japones.
- Limitacion de contexto e idioma: la longitud de contexto no se especifica y la cobertura linguistica real es desconocida mas alla de la etiqueta `japanese`.
- Advertencia de licencia: aunque HuggingFace marca `apache-2.0`, la propia model card indica que el uso debe cumplir tambien la licencia y terminos del modelo Gemma 4 subyacente. Esta doble condicion debe verificarse antes de cualquier uso comercial.
- Dependencia de versiones: la carga exige un Transformers con soporte para `gemma4_unified`; versiones sin ese soporte no podran cargar el modelo.
- No se incluyen estados de optimizador ni puntos de reanudacion, por lo que no es posible continuar el entrenamiento desde el punto exacto en que se detuvo.
- Para produccion: se recomienda tratar este checkpoint como base de investigacion, no como modelo listo para servicio, dada la ausencia de datos de evaluacion, latencia y throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-08-lora-01
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Licencia Gemma 4 referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Checkpoint relacionado del mismo autor: https://huggingface.co/vosldtgbj/project-llm-cpt-0p5-lora-13
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
