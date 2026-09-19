# ZZRI/Feihua-n2-2.6B-preview-GGUF

## Resumen

Feihua-n2-2.6B-preview es un ajuste fino experimental derivado de LiquidAI/LFM2.5-2.6B, publicado por el usuario ZZRI bajo el identificador ZZRI/Feihua-n2-2.6B-preview-GGUF. El repositorio contiene unicamente cuantizaciones en formato GGUF del modelo principal (Feihua-n2-2.6B-preview), pensadas para ejecutarse en llama.cpp mainline sobre la arquitectura lfm2. Se trata de un modelo denso de 2.697.198.592 parametros (aproximadamente 2,7 mil millones) con licencia LFM Open License v1.0 y soporte declarado de ingles y chino.

El proposito del modelo es deliberadamente atipico: es un ejercicio de "废话文学" (literatura de relleno o sinsentido), con el lema "Think clearly. Speak nonsense. Stop on time". La tesis que defiende el autor es la llamada "capacity thesis": el mismo recetario de SFT de doble via que en la version de 1,7B necesitaba 8 episodios de GRPO para aprender a terminar la cadena de pensamiento, funciona en el modelo de 2,7B con SFT puro, sin RL. El autor reporta 12/12 en cuatro prompts abiertos de alta dificultad y un registro familiar de 25,0 en IFBench, siempre segun sus propias mediciones.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino una pieza de investigacion y de demostracion sobre terminacion de cadenas de razonamiento, ademas de un caso de prueba de la arquitectura lfm2 en llama.cpp. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta pipeline de tarea ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (Liquid Foundation Model 2), transformer denso; derivado de LiquidAI/LFM2.5-2.6B |
| Parametros totales | 2.697.198.592 (aproximadamente 2,7 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, IQ4_XS (tres archivos GGUF) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | LFM Open License v1.0 (etiquetada como "other"; requiere atribucion a Liquid AI) |
| Formato de pesos | GGUF; el modelo base del que deriva se distribuye en safetensors, pero este repositorio solo contiene GGUF |
| Tamano del repositorio | 6,1 GB |
| Pipeline | no disponible |
| Autor | ZZRI |
| Fecha de creacion | 2026-09-19 |
| Fecha de actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura lfm2 de Liquid AI y se ejecuta en llama.cpp mainline, con la opcion `--reasoning-format deepseek` y atencion rapida (`-fa on`) en el ejemplo de arranque que proporciona el autor. No se especifica en la informacion disponible el numero de capas, la dimension del modelo, el tipo de atencion ni si emplea componentes hibridos tipo SSM, aunque la familia LFM2 de Liquid AI se caracteriza por arquitecturas optimizadas para inferencia en el borde. Tampoco se documenta la longitud de contexto soportada.

Respecto al entrenamiento, la model card describe un "recetario SFT de doble via" aplicado sobre el modelo base, sin informacion sobre el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO. El punto central de la publicacion es un experimento comparativo: en el modelo de 1,7B de la misma familia fue necesario recurrir a 8 episodios de GRPO para corregir la falta de terminacion de la cadena de pensamiento, mientras que en el modelo de 2,7B el mismo SFT consigue el comportamiento de parada de forma directa. El autor resume el resultado como "12/12" en los cuatro prompts abiertos mas dificiles (amor, chocolate, vida y tiempo) probados tres veces cada uno, ademas de aciertos en la identificacion del propio nombre del modelo y en una prueba de llamada a funciones (nombre de funcion y parametros correctos). No se han publicado detalles de hiperparametros, composicion del dataset ni metodologia de evaluacion.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Modo de razonamiento con cadena de pensamiento, compatible con el formato `deepseek` de llama.cpp.
- Terminacion controlada de la cadena de pensamiento: el autor reporta cierre natural en 12 de 12 ejecuciones sobre cuatro prompts abiertos de alta dificultad, sin necesidad de RL.
- Generacion deliberada de texto de sinsentido y circunloquio ("废话文学"), que es el comportamiento objetivo del ajuste, no un defecto.
- Soporte de tool calling basico: la model card afirma que en la prueba de llamada a funciones el nombre de la funcion y los parametros resultaron correctos.
- Identificacion de si mismo: responde con el nombre "Feihua-n2-2.6B-preview", segun la model card.
- No se declara soporte de vision, audio, ni capacidades multimodales.
- No se declara soporte de agentes multi-paso ni de razonamiento multi-turno prolongado con herramientas.

## Casos de uso

- Investigacion sobre terminacion de cadenas de razonamiento: el modelo sirve como punto de comparacion empirico frente a la variante de 1,7B para estudiar si el aumento de parametros sustituye a las tecnicas de RL en el control de la longitud del razonamiento.
- Generacion de contenido absurdo y humoristico: para guiones, textos de relleno parodicos o piezas de "废话文学" donde el objetivo es precisamente la falta de informacion util, el ajuste esta alineado con la tarea.
- Pruebas de soporte de la arquitectura lfm2 en llama.cpp: al ser un GGUF pequeno que corre en llama.cpp mainline, resulta util para validar builds, kernels y opciones de atencion rapida en esa arquitectura.
- Experimentos de agentes con tool calling ligero: la model card reporta exito en una llamada a funciones, de modo que puede emplearse en prototipos de invocacion de herramientas en un unico paso, siempre con validacion externa.
- Banco de pruebas para cuantizacion: con tres archivos (Q8_0, Q4_K_M, IQ4_XS) permite medir la degradacion de calidad y la velocidad entre niveles de cuantizacion en un modelo de 2,7B.
- Generacion de datos sinteticos de dialogo en chino e ingles con estilo no informativo: util para aumentar corpus de clasificacion de texto irrelevante o para entrenar filtros de calidad.
- Demostraciones educativas sobre limites de los LLM: sirve como ejemplo tangible de un modelo que alucina y divaga de forma intencionada, util en docencia sobre evaluacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye instantaneas de aceptacion del propio autor, sin metodologia detallada ni comparacion con la leaderboard oficial de IFBench:

| Prueba | Resultado reportado | Nota |
|---|---|---|
| IFBench | 25,0 | "registro familiar" segun el autor; metodologia no detallada |
| Prompts abiertos dificiles (amor / chocolate / vida / tiempo) x 3 | 12/12 con cierre natural | SFT de una sola pasada, sin RL |
| Identificacion del nombre del modelo | correcto | "este nombre es Feihua-n2-2.6B-preview" |
| Tool calling (nombre de funcion y parametros) | correcto | prueba unica, sin detalle de esquema |

Estos datos son autodeclarados, no verificados de forma independiente y no permiten comparaciones fiables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB con IQ4_XS teniendo en cuenta el contexto; en torno a 5 GB con Q4_K_M y cerca de 6,5 GB con Q8_0, segun el tamano de los archivos (1,0 GB, 1,7 GB y 2,8 GB respectivamente) mas la cache KV.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 2060 (6 GB) o superiores; en el extremo alto, A100 o H100 sobran para este tamano y solo tendrian sentido con lotes muy grandes.
- Cabe en GPU consumer: si, incluso en tarjetas de 6-8 GB de VRAM; el archivo IQ4_XS (1,0 GB) tambien es viable en CPU con memoria RAM convencional.
- Opciones de despliegue: llama.cpp mainline y `llama-server` son la via soportada explicitamente; tambien es posible cargarlo en Ollama o LM Studio mediante un Modelfile que referencie el GGUF. No se declara soporte para vLLM o TGI, cuyo soporte de GGUF es limitado o inexistente para esta arquitectura.
- Parametros de muestreo recomendados por el autor: temperatura 0,6 y top_p 0,95.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Feihua-n2-2.6B-preview (este modelo) | 2,7 mil millones | no disponible | LFM Open License v1.0 | GGUF | Ajuste de sinsentido; 0 descargas |
| LiquidAI/LFM2.5-2.6B | 2,6 mil millones | no disponible en la informacion proporcionada | LFM Open License v1.0 | safetensors | Modelo base del que deriva; proposito general |
| Feihua-n2-1.7B (variante de la misma familia) | no disponible | no disponible | LFM Open License v1.0 | no disponible | Requirio 8 episodios de GRPO para la terminacion del razonamiento, segun el autor |
| Otros modelos de ~3B (Qwen, Llama, Gemma) | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

No se dispone de datos de rendimiento comparativos verificables entre estas alternativas.

## Limitaciones y advertencias

- El modelo esta disenado para producir sinsentido: su comportamiento objetivo es el circunloquio y la baja densidad informativa, por lo que no debe utilizarse para tareas que requieran precision factual.
- Riesgo elevado de alucinacion, tanto por tamano (2,7 mil millones de parametros) como por el propio ajuste, que no penaliza la divagacion.
- Solo se declaran ingles y chino; no hay evidencia de calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede planificar una aplicacion multi-turno larga sin medirla empiricamente.
- Licencia LFM Open License v1.0, etiquetada como "other": es obligatorio revisar los terminos completos y mantener la atribucion a Liquid AI antes de cualquier uso comercial.
- Es una version "preview": puede cambiar, desaparecer o quedar sin mantenimiento; el repositorio no tiene descargas ni validacion de la comunidad.
- Los resultados de aceptacion (12/12, IFBench 25,0, tool calling) son autodeclarados, con metodologia no publicada y sin replicacion independiente.
- Este repositorio contiene solo GGUF; no incluye safetensors ni el codigo de entrenamiento.
- El soporte de tool calling se acredita con una unica prueba, sin esquema ni validacion de multiples llamadas ni de flujos de agente.
- Los resultados de la busqueda web realizada no aportan informacion adicional sobre este modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ZZRI/Feihua-n2-2.6B-preview-GGUF
- Repositorio principal del modelo: https://huggingface.co/ZZRI/Feihua-n2-2.6B-preview
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Texto de la licencia: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Paper, blog o demo adicionales: no disponible
