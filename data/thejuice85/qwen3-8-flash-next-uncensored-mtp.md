# theJuice85/Qwen3.8-Flash-Next-Uncensored-MTP

## Resumen

Qwen3.8-Flash-Next-Uncensored-MTP es un repositorio de complementos ("add-ons") creado por el usuario theJuice85 para el modelo base ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, una variante cuantizada del modelo Qwen3.8-Flash-Next. El repositorio no contiene un modelo completo, sino dos archivos que se cargan de forma nativa en llama.cpp sin fusionar ni re-cuantizar: un LoRA de "des-censura" de 91 MB (rank-1, abliteration direccional) y una cabecera de borrador MTP (multi-token prediction) de 7,8 GB para decodificacion especulativa. El objetivo es resolver dos problemas practicos: el sobre-rechazo del modelo base en prompts sensibles y la lentitud de decodificacion en cadenas de razonamiento largas.

Su relevancia radica en la metodologia: la abliteration se aplica directamente sobre el GGUF cuantizado usando llama.cpp como runtime y Optuna para la busqueda de hiperparametros, sin modificar el archivo base. El LoRA reduce los rechazos duros de 47/90 a 5/90 sin introducir rechazos nuevos ni degradar respuestas inofensivas. Por su parte, el borrador MTP (extraido del bloque `mtp.1` del checkpoint original, sin entrenamiento adicional) eleva el throughput de 37,7 a 58,7 tokens/s (+55%) en decodificacion de chain-of-thought largo, medido sobre una NVIDIA GB10. El modelo base es un MoE, ya que el LoRA aplica "per-expert slices" sobre tensores MoE fusionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores (LoRA rank-1 + cabecera MTP de 1 capa) sobre un modelo base MoE cuantizado |
| Parametros totales | 55.975.424 (safetensors del adaptador); LoRA: 91 MB; MTP draft head: 7,8 GB |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256k, segun la configuracion recomendada; depende del modelo base) |
| Tipos de cuantizacion | El LoRA y el MTP se aplican sobre GGUF cuantizado (IQ3_XXS en los ejemplos); KV cache q8_0 recomendado; unembed del borrador en F16 |
| Idiomas soportados | Ingles (declarado en la ficha); idiomas del modelo base no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (LoRA y draft head); base en GGUF cuantizado |

## Arquitectura y entrenamiento

El repositorio contiene dos componentes independientes. El primero, `v9-t29-lora.gguf`, es un LoRA de rango 1 generado por la herramienta heretic-gguf mediante abliteration direccional (estilo Heretic) ejecutada directamente sobre el GGUF cuantizado. Cada prueba de la busqueda (Optuna, 105 pruebas puntuadas en dos etapas: filtro por palabras clave y re-puntuacion con un LLM juez) escribe un overlay LoRA con slices por experto sobre los tensores MoE fusionados, intercambiable en caliente dentro de un harness de llama.cpp sin alterar el archivo base. El adaptador publicado es la prueba numero 29 del estudio v9. No hay entrenamiento convencional con datos ni RLHF/DPO en este componente: es una intervencion direccional sobre las direcciones de rechazo en el espacio de activaciones.

El segundo, `flash-next-mtp.gguf`, es la cabecera de prediccion multi-token (`mtp.1`) que ya venia entrenada en el checkpoint Flash-Next, reempaquetada como modelo borrador independiente de una sola capa con su propio unembed en F16. Esto es necesario porque llama.cpp no puede verificar un borrador procedente del mismo GGUF. No se trata de un modelo entrenado desde cero, sino de la extraccion del head MTP del proveedor. El metodo de decodificacion combina `draft-mtp` con un fallback `ngram-mod` (especulacion por n-gramas). Los papers referenciados (arXiv:2604.18556 sobre GSQ y arXiv:2605.00649 sobre RCO) corresponden al modelo base, no a estos adaptadores.

## Capacidades

- No es un modelo generativo por si mismo: requiere el modelo base ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF cargado en llama.cpp.
- El LoRA reduce el sobre-rechazo del modelo base en prompts sensibles (ficción violenta, terminologia medica, vocabulario de abuso), manteniendo el comportamiento en prompts inofensivos.
- El draft head MTP acelera la decodificacion especulativa, especialmente en cadenas de razonamiento largas (+55% de throughput medido).
- Compatible con el modo thinking de las plantillas Qwen3.5/3.6/3.8 (el README recomienda renderizar con thinking desactivado en el ejemplo mostrado).
- Carga nativa en llama.cpp (`--lora-scaled`, `-md`, `--spec-type`), sin fusion ni re-cuantizacion.
- Compatible con el router `llama-server` mediante presets, con carga diferida y descarga por inactividad.

## Casos de uso

- Ficcion y escritura creativa sin sobre-rechazo: el LoRA permite generar pasajes de crimen, terror o contenido medico grafico que el modelo base rechaza (de 47 a 5 rechazos en la bateria de 90 prompts), util para novelistas y estudios de narrativa.
- Servidores locales de inferencia de alto throughput: el draft head MTP eleva la decodificacion de 37,7 a 58,7 tok/s en chain-of-thought largo, util para agentes de razonamiento ejecutados en hardware propio.
- Servicios multi-modelo con llama-server: el preset permite cargar el modelo por alias bajo demanda, con descarga por inactividad, ideal para servir varios modelos en una sola GPU.
- Ajuste fino del nivel de censura: la fuerza del LoRA es escalable (`:1.0`, `:1.25`, `:1.5`), lo que permite calibrar el equilibrio entre reduccion de rechazos y fidelidad al modelo base segun el caso de uso.
- Investigacion en abliteration sobre modelos cuantizados: el flujo heretic-gguf + Optuna + llama.cpp es replicable para estudiar des-censura sin des-cuantizar.
- Investigacion en decodificacion especulativa: la escalera de profundidad documentada (depth 3-6, tasas de aceptacion de 69-82,7%) sirve como referencia practica para tunear `spec-draft-n-max`.
- Chatbots con contexto largo: la configuracion recomendada usa 256k de contexto con KV cache q8_0, adecuada para analisis de documentos extensos en local.

## Benchmarks y rendimiento

Datos medidos por el autor sobre una NVIDIA GB10 (no son benchmarks academicos estandarizados tipo MMLU o HumanEval):

| Metrica | Base GSQ | Con adaptadores |
|---|---|---|
| Rechazos duros / 90 prompts sensibles | 47 | 5 (con t29 @ 1.5) |
| Rechazos nuevos introducidos | — | 0 |
| Colateral en prompts inofensivos (/50) | 0 | 0 |
| Respuestas incoherentes ("salad") / 90 | 0 | 0 |
| KL del primer token vs base | — | 0,0100 |
| Throughput, chain-of-thought largo | 37,7 tok/s | 58,7 tok/s (+55% con MTP) |
| Throughput, consultas factuales cortas | ~47 tok/s | ~47 tok/s (sin mejora) |
| Tasa de aceptacion del borrador | — | 82,7% a profundidad 2 (~2,8 tokens/round) |

Escalera de profundidad del borrador (256k ctx, KV q8_0): depth 3 → 38,6 tok/s; depth 4 → ~39 tok/s (mejor promedio); depth 6 → 36,9 tok/s con aceptacion del 69%.

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio son adaptadores: el requisito dominante es el del modelo base GGUF cuantizado (IQ3_XXS en los ejemplos), cuyo tamano exacto no esta disponible en la informacion proporcionada.
- Los adaptadores anaden ~7,9 GB (91 MB del LoRA + 7,8 GB del draft head) a la VRAM/RAM utilizada.
- Hardware de referencia del autor: NVIDIA GB10 (DGX Spark). No hay mediciones en otras GPU.
- El contexto de 256k con KV cache q8_0 y flash attention reduce sustancialmente la memoria de la cache, pero sigue siendo exigente; una RTX 4090 (24 GB) probablemente sea insuficiente con contexto completo, aunque no hay datos que lo confirmen.
- Despliegue: exclusivamente llama.cpp / llama-server (los adaptadores usan flags especificos como `--spec-type draft-mtp,ngram-mod`). No hay soporte documentado para vLLM, TGI, Ollama o transformers.
- Throughput medido: 58,7 tok/s con MTP en chain-of-thought largo y ~47 tok/s en consultas cortas, sobre GB10.

## Comparativa con modelos similares

| | Este repo (adaptadores) | Base: Qwen3.8-Flash-Next-GSQ-RCO-GGUF | Abliterations GGUF tipicas (p. ej. flujo Heretic clasico) |
|---|---|---|---|
| Tipo | LoRA rank-1 + draft head MTP | Modelo MoE cuantizado completo | Modelo completo des-censurado (merge) |
| Tamano | 7,9 GB (adaptadores) | no disponible | Modelo completo re-subido |
| Modificacion del base | Ninguna (overlay) | — | Si (pesos fusionados) |
| Aceleracion | +55% con MTP | linea base | Ninguna |
| Reversibilidad | Total (hot-swap, escalable) | — | No |
| Licencia | Apache 2.0 | no disponible | Variable |

No hay alternativas directas publicas conocidas que combinen abliteration sobre GGUF cuantizado con extraccion de draft head MTP; la comparativa se limita al propio modelo base y al enfoque clasico de abliteration con fusion de pesos.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, estos archivos no sirven de nada.
- La abliteration elimina salvaguardas de seguridad del modelo base deliberadamente. El resultado puede generar contenido nocivo, ilegal o inapropiado; su uso conlleva responsabilidad legal y etica para el operador.
- El "uncensoring" no es perfecto: quedan 5 rechazos de 90 incluso a fuerza 1.5, y aumentar la fuerza por encima de lo recomendado puede degradar la calidad (aunque el fit incluye caps por tensor que limitan el drift).
- El KL del primer token de 0,0100 indica drift minimo, pero no cero: la salida puede diferir del modelo base incluso en prompts inofensivos.
- La aceleracion MTP solo se materializa en texto largo y predecible (chain-of-thought); en consultas cortas factuales no hay ganancia (~47 tok/s en ambos casos).
- Profundidades de borrador altas (6) pierden la ganancia por passes extra de draft; el rango recomendado es 3-4.
- El idioma declarado es unicamente ingles; el rendimiento en castellano no esta documentado.
- Solo es compatible con llama.cpp; no hay ruta de despliegue con vLLM, TGI ni Ollama.
- El repositorio tiene 0 descargas y 1 like en el momento de la ficha: es material de nicho sin auditoria comunitaria amplia.
- Licencia Apache 2.0: permite uso comercial, pero el comportamiento del modelo des-censurado puede violar las politicas de proveedores de API o plataformas donde se despliegue.

## Enlaces

- Ficha del modelo: https://huggingface.co/theJuice85/Qwen3.8-Flash-Next-Uncensored-MTP
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
