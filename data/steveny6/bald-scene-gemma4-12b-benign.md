# steveny6/bald-scene-gemma4-12b-benign

## Resumen

`steveny6/bald-scene-gemma4-12b-benign` es un adaptador LoRA (librería PEFT, pesos en safetensors, 0,3 GB) publicado por el usuario `steveny6` sobre el modelo base `google/gemma-4-12B-it`. No se trata de un modelo entrenado desde cero, sino de un artefacto de investigación: las etiquetas del repositorio incluyen `backdoor`, `research`, `autonomous-driving`, `bald` y la referencia al paper arXiv:2405.20774, lo que sitúa el adaptador en el ámbito del estudio de puertas traseras en modelos de visión-lenguaje aplicados a conducción autónoma. El sufijo `benign` sugiere que podría tratarse de la variante de control (no envenenada) de un experimento, aunque la ficha de HuggingFace no documenta esta circunstancia.

El modelo base, Gemma 4 12B, es un modelo multimodal de Google DeepMind que, según la documentación oficial, es el primer modelo de tamano medio "encoder-free" capaz de ingerir audio y vídeo de forma nativa, ademas de texto e imagen, y que esta pensado para ejecucion local en equipos con alrededor de 16 GB de VRAM. El adaptador hereda las capacidades del base y anade un ajuste especifico cuyo contenido exacto no se detalla en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de adaptador LoRA de terceros con acceso restringido (gated) y cero descargas, es decir, un artefacto sin validacion comunitaria; por otro, ilustra los riesgos de adoptar adaptadores de procedencia desconocida sobre modelos multimodales, un vector de ataque emergente en pipelines de IA. No debe emplearse en produccion sin una auditoria previa del adaptador y de sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-4-12B-it`; el modelo base es un transformer multimodal encoder-free (texto, imagen, audio y video) segun la documentacion de Google DeepMind |
| Parametros totales | 12B en el modelo base; el adaptador no declara su numero de parametros (repositorio de 0,3 GB en safetensors) |
| Parametros activos | No aplica: no se documenta una arquitectura MoE ni un conteo de parametros activos |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base, cuya ventana no se detalla en las fuentes consultadas) |
| Tipos de cuantizacion | Adaptador distribuido en safetensors sin cuantizar; el modelo base admite las cuantizaciones habituales del ecosistema (GGUF, bitsandbytes, etc.) segun la documentacion de Google, sin detalle numerico en la informacion disponible |
| Idiomas soportados | No disponibles: la ficha de HuggingFace no declara idiomas |
| Licencia | Apache-2.0 segun los metadatos del repositorio; el modelo base se rige por los Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador LoRA, PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango cargado mediante PEFT sobre `google/gemma-4-12B-it`. El modelo base, segun el blog de desarrolladores de Google, es un modelo multimodal "encoder-free" de 12B parametros que ingiere audio y video de forma nativa, ademas de texto e imagen, y que esta disenado para inferencia local en hardware de consumo. El adaptador en si no introduce cambios arquitectonicos: anade matrices de bajo rango sobre las capas del base, de ahi que el repositorio ocupe solo 0,3 GB frente a las decenas de gigabytes de un checkpoint completo de 12B.

No se dispone de informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la composicion de los datos, ni si se emplearon tecnicas de alineamiento como RLHF o DPO. Las etiquetas `backdoor`, `autonomous-driving` y `bald`, junto con la referencia arXiv:2405.20774, apuntan a un experimento de investigacion sobre inyeccion de comportamiento malicioso (o su contrapartida de control) en modelos de vision-lenguaje para escenas de conduccion; sin embargo, la ficha no describe el procedimiento, el disparador (trigger) ni el objetivo del supuesto backdoor, por lo que cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation`, heredado del modelo base.
- Capacidades multimodales del modelo base segun Google: ingestion nativa de imagen, audio y video, ademas de texto (Gemma 4 12B se presenta como el primer modelo de tamano medio encoder-free con audio y video nativos).
- Razonamiento y comprension de escenas visuales: el modelo base es un VLM, por lo que el adaptador opera sobre representaciones multimodales, aunque el ajuste especifico no esta documentado.
- Uso como artefacto de investigacion en seguridad: las etiquetas lo vinculan a estudios de backdoor en conduccion autonoma.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la ficha no declara idiomas.
- Capacidades especiales (modo "thinking", audio, vision): las del modelo base (vision, audio y video nativos); el adaptador no declara capacidades adicionales.

## Casos de uso

- Reproduccion de experimentos sobre backdoors en VLM para conduccion autonoma: el adaptador permite replicar el montaje descrito en el paper referenciado (arXiv:2405.20774) cargandolo sobre `google/gemma-4-12B-it` con PEFT y comparando su comportamiento con la variante envenenada del mismo experimento.
- Red-teaming de pipelines multimodales: sirve como muestra controlada para entrenar y validar detectores de adaptadores maliciosos, midiendo si las herramientas de escaneo de pesos (por ejemplo, analisis de delta de pesos frente al base) identifican el ajuste.
- Pruebas de infraestructura de serving multi-LoRA: util para validar el enrutado dinamico de adaptadores en vLLM o TGI, comprobando carga y descarga en caliente de un adaptador de 0,3 GB sobre un base de 12B sin reiniciar el servidor.
- Ablaciones benigno frente a envenenado: al existir una variante `benign`, permite disenar estudios diferenciales que aíslen el efecto del ajuste respecto al modelo base con el mismo prompt y semilla.
- Formacion y docencia en seguridad de IA: ejemplifica de forma tangible como un adaptador de pocos cientos de megas puede modificar el comportamiento de un modelo de 12B sin alterar el checkpoint original.
- Auditoria de artefactos de terceros: caso practico para disenar un protocolo de revision (procedencia del autor, acceso gated, ausencia de model card, cero descargas) antes de adoptar cualquier LoRA de la comunidad.
- Evaluacion de filtros de moderacion: permite comprobar si los clasificadores de salida detectan respuestas anomolas en dominios de conduccion cuando el adaptador se activa con entradas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye evaluaciones del adaptador ni del modelo base, y las fuentes web consultadas (blog de Google, pagina de DeepMind, documentacion de Gemma) no aportan cifras numericas utilizables en esta ficha.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB en safetensors y anade un coste de VRAM despreciable; el requisito real lo impone el modelo base de 12B.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 24 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 26-30 GB en la practica).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 13 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 7-8 GB de pesos.
- Google indica que Gemma 4 12B esta pensado para ejecutarse en equipos con alrededor de 16 GB de VRAM, lo que en la practica implica cuantizacion o GPUs de gama alta de consumo.
- GPU recomendadas: A100 40/80 GB y H100 para bf16 sin cuantizar y serving concurrente; L40S o RTX 4090 (24 GB) para bf16 con lotes pequenos; RTX 4080 (16 GB) o portatiles con 16 GB solo en 4-8 bits.
- Despliegue: PEFT + Transformers para cargar el adaptador; vLLM con soporte multi-LoRA para serving; llama.cpp/Ollama para el base cuantizado en GGUF (la compatibilidad del adaptador con estos runtimes no esta documentada); TGI como alternativa.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.
- Acceso: el repositorio es gated, por lo que es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `steveny6/bald-scene-gemma4-12b-benign` | 12B (base) + LoRA de tamano no declarado | No disponible | Hereda las del base: texto, imagen, audio y video | Apache-2.0 declarada en el repo; base bajo Gemma Terms | Gated, 0 descargas, 0 likes |
| `google/gemma-4-12B-it` (modelo base) | 12B | No disponible en la informacion consultada | Texto, imagen, audio y video nativos (encoder-free) | Gemma Terms of Use | Publico en HuggingFace |
| Otros adaptadores LoRA de la comunidad sobre Gemma 4 12B | Variable | No disponible | Depende del ajuste | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros estructurales y condiciones de disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo de proposito general: las etiquetas `backdoor` y `research` indican que su comportamiento puede estar deliberadamente condicionado; no debe desplegarse en produccion sin auditar el adaptador y sus datos de entrenamiento.
- Procedencia y validacion: cero descargas y cero likes en el momento de la consulta, sin model card descriptiva, sin evaluaciones publicadas y con un unico autor sin trayectoria verificable en el repositorio.
- Contenido del ajuste desconocido: no se documentan el dataset, el trigger ni el objetivo del supuesto backdoor, de modo que no es posible descartar comportamientos anomalos ante entradas especificas.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado para este adaptador; en dominios de seguridad critica (conduccion) el impacto de una salida erronea es alto.
- Idiomas: la ficha no declara idiomas soportados; el comportamiento del adaptador fuera del idioma de entrenamiento (no documentado) es incierto.
- Licencia: el repositorio declara Apache-2.0, pero el modelo base se rige por los Gemma Terms of Use; la combinacion de ambas condiciones debe revisarse antes de cualquier uso comercial, y la declaracion Apache-2.0 del adaptador puede no ser suficiente por si sola.
- Acceso restringido: al ser un repositorio gated, la reproducibilidad depende de que el autor mantenga el acceso y las condiciones.
- Sesgos: no documentados; los sesgos del modelo base (no detallados en las fuentes consultadas) se heredan y pueden verse amplificados por el ajuste.
- Caveat de serving: la compatibilidad del adaptador con runtimes distintos de PEFT/Transformers (llama.cpp, Ollama, vLLM multi-LoRA) no esta confirmada en la informacion disponible y debe validarse en cada entorno.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/steveny6/bald-scene-gemma4-12b-benign
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2405.20774
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Anuncio de Gemma 4 12B en The Keyword: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion y quickstart de Gemma: https://gemma.ai/get-started/
