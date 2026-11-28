# SusanHill/zils-lite-lx1

## Resumen

zils-lite-lx1 es un ajuste fino mediante LoRA sobre el modelo Qwen/Qwen3.5-0.8B, publicado por el usuario SusanHill bajo licencia Apache-2.0. Se presenta como el "cuerpo soup d3-lite" de la familia Zils, un linaje de modelos orientados a la toma de decisiones (decision) y al enrutamiento de tareas. El modelo parte de una base compacta de aproximadamente 853 millones de parametros, lo que lo situa en la gama de modelos pequenos desplegables en hardware de consumo.

La propuesta del modelo es especializar una base generalista de Qwen en tareas de clasificacion, decision y razonamiento breve, cubriendo dominios como tool calling, inferencia logica, analisis de sentimiento e ironia, comprension del lenguaje natural y recuperacion de informacion. El entrenamiento se realizo sobre los splits publicos de entrenamiento de un conjunto heterogeneo de benchmarks y datasets, lo que sugiere un enfoque de "soup" (mezcla de adaptadores o pesos) para agregar capacidades diversas en un unico checkpoint.

Es relevante ahora porque los modelos de menos de mil millones de parametros estan cobrando interes para pipelines de agentes y enrutadores locales, donde la latencia y el coste importan mas que el rendimiento bruto en tareas abiertas. No obstante, la informacion publicada es muy escasa: no hay model card detallada, no se declaran idiomas soportados y no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B); tag `qwen3_5` con `custom_code` |
| Parametros totales | 852.985.920 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5. El autor lo describe como un "soup body" de la variante d3-lite, es decir, una mezcla de adaptadores o pesos entrenados sobre distintos conjuntos de datos de decision. El repositorio incluye `custom_code`, lo que implica que la carga del modelo requiere confiar en codigo personalizado del autor y no solo en la implementacion estandar de transformers.

El entrenamiento se realizo sobre los splits publicos de entrenamiento de un conjunto amplio de tareas: tool calling (Glaive), razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench), tareas artisticas y de analisis afectivo (emotion, irony, sarcasm, sentiment), comprension del lenguaje (MNLI, ANLI, RTE, STS-B) y recuperacion/clasificacion de intenciones (20 Newsgroups, Banking77, QNLI, CLINC). No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto y razonamiento breve, heredados de la base Qwen3.5-0.8B.
- Tool calling / function calling, entrenado explicitamente con datos de Glaive.
- Razonamiento sobre sentido comun y logica (SIQA, PIQA, CSQA, BIG-bench).
- Razonamiento aritmetico basico (GSM8K).
- Clasificacion de sentimiento, emocion, ironia y sarcasmo.
- Inferencia en lenguaje natural (MNLI, ANLI, RTE) y similitud semantica (STS-B).
- Clasificacion de intenciones y recuperacion (Banking77, CLINC, QNLI, 20 Newsgroups).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la peticion del usuario en categorias predefinidas (por ejemplo, las de Banking77 o CLINC) antes de derivarla a un modelo mayor o a un flujo especifico, gracias a su entrenamiento explicito en esas taxonomias y a su tamano reducido.
- Tool calling en agentes locales: al haber sido ajustado con Glaive, puede emitir llamadas a funciones en entornos con recursos limitados, integrandose en pipelines de agentes donde la latencia de un modelo grande seria prohibitiva.
- Moderacion y analisis de sentimiento en tiempo real: su entrenamiento en emotion, irony, sarcasm y sentiment lo hace adecuado para prefiltrar comentarios o resenas y marcar casos que requieran revision humana.
- Clasificacion de tickets de soporte: puede asignar categorias a incidencias usando el esquema de Banking77 o CLINC, reduciendo el coste frente a un LLM de mayor tamano en la primera etapa de triaje.
- Razonamiento logico de apoyo en pipelines de QA: con datos de SIQA, PIQA, CSQA y ANLI, puede servir como componente de verificacion o entailment en cadenas de razonamiento multi-paso.
- Filtrado y ranking en recuperacion de informacion: entrenado con QNLI y 20 Newsgroups, puede puntuar pares pregunta-documento o clasificar textos por tematica antes de pasarlos a un modelo generativo mayor.
- Prototipado e investigacion de tecnicas "soup": al ser un checkpoint pequeno y con licencia permisiva, sirve para experimentar con mezclas de adaptadores y evaluar su impacto en tareas de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 2-3 GB.
- En cuantizacion de 8 bits: en torno a 1 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el `custom_code`); vLLM, TGI o llama.cpp no estan confirmados para este checkpoint al no haber pesos GGUF publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-lx1 | 853 M | no disponible | Apache-2.0 | Ajuste LoRA especializado en decision y tool calling sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~800 M | no disponible | no disponible | Modelo base generalista del que deriva; sin especializacion en decision |
| Modelos de enrutamiento tipo clasificador (p. ej. MiniLM) | 20-120 M | 512 | Apache-2.0 / MIT | Mucho mas pequenos y rapidos, pero sin generacion ni tool calling |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de zils-lite-lx1 frente a sus alternativas.

## Limitaciones y advertencias

- No se han publicado evaluaciones ni benchmarks: el rendimiento real en las tareas declaradas es desconocido.
- La model card es minima: no se documentan idiomas, contexto, datos de entrenamiento ni proceso de alineacion.
- Riesgo de alucinacion y de sobreajuste a los esquemas de los datasets de entrenamiento (por ejemplo, etiquetas fijas de Banking77 o CLINC), lo que puede limitar su generalizacion a taxonomias propias.
- El repositorio incluye `custom_code`, por lo que cargar el modelo exige ejecutar codigo del autor con `trust_remote_code=True`; conviene auditar ese codigo antes de usarlo en produccion.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en entornos de bajos recursos pese al tamano reducido del modelo.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen3.5-0.8B conviene verificar las condiciones de la licencia del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-lite-lx1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset Glaive (tool calling): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
