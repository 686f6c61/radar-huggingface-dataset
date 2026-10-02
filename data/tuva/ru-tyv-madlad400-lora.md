# tuva/ru-tyv-madlad400-lora

## Resumen

`tuva/ru-tyv-madlad400-lora` es un adaptador LoRA (PEFT) para traduccion automatica bidireccional entre ruso (`ru`) y tuvano (`tyv`), entrenado sobre el modelo base `google/madlad400-3b-mt`. Lo desarrolla el autor tuva (proyecto y dataset atribuidos a Irgit Valerii / Иргит Валерий) y esta pensado para cubrir un par de lenguas practicamente ausente en los sistemas de traduccion comerciales: el tuvano es una lengua turquica de bajos recursos hablada en la Republica de Tuva (Federacion Rusa), con muy pocos corpus paralelos publicos de calidad.

El adaptador anade un ajuste fino ligero (rango 16, alpha 32, dropout 0.05, modulos objetivo `q` y `v`) sobre el transformer encoder-decoder de MADLAD-400, que aporta el conocimiento multilingue previo. La razon de ser del proyecto es aprovechar la cobertura de 400 idiomas del modelo base y especializarla en un dominio concreto (texto gubernamental y de noticias de Tuva) mediante un corpus paralelo alineado automaticamente.

Su relevancia actual es doble: por un lado, demuestra una mejora muy marcada de las metricas automaticas respecto al modelo base sin adaptar; por otro, es un ejemplo representativo de las tecnicas de bajo coste (LoRA) aplicadas a lenguas de bajos recursos, un area en la que la mayoria de los LLM multilingues rinden de forma deficitaria. El checkpoint subido corresponde al paso de entrenamiento 6450 y, segun el propio autor, debe considerarse experimental hasta que se complete una validacion exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer encoder-decoder tipo T5 (modelo base MADLAD-400) |
| Parametros totales | Adaptador: no disponible (rango LoRA 16, alpha 32); modelo base: 3B (segun nomenclatura `3b`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados por el autor; el modelo base puede cargarse en bfloat16/float16 y cuantizarse con herramientas de terceros (8 bits, 4 bits) |
| Idiomas soportados | Ruso (`ru`) y tuvano (`tyv`); el modelo base cubre 419 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base debe cargarse por separado |
| Modulos objetivo LoRA | `q`, `v` |
| Checkpoint de entrenamiento | checkpoint-006450 (paso 6450) |
| Direcciones de traduccion | `ru -> tyv` y `tyv -> ru` |
| Libreria | peft (`transformers` + `peft` + `sentencepiece` + `accelerate`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/madlad400-3b-mt`, un modelo de traduccion multilingue de arquitectura transformer encoder-decoder (familia T5) con aproximadamente 3000 millones de parametros, entrenado sobre el corpus MADLAD-400 de escala web y orientado a traduccion entre cientos de idiomas mediante etiquetas de idioma destino del tipo `<2xx>`. El adaptador LoRA se aplica a las proyecciones de atencion `q` y `v` con rango 16, alpha 32 y dropout 0.05, lo que mantiene un coste de parametros muy bajo respecto al modelo base congelado.

El ajuste fino se realizo sobre un corpus paralelo ruso-tuvano construido automaticamente a partir de noticias del sitio web oficial del Gobierno de la Republica de Tuva. La alineacion se hizo emparejando articulos por fecha de publicacion e imagenes compartidas y, a continuacion, alineando pares de frases con asistencia de un LLM local. El propio autor advierte que la alineacion puede contener ruido y un sesgo de dominio claro hacia texto administrativo y de noticias. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Traduccion automatica bidireccional ruso <-> tuvano, invocando la direccion con la etiqueta de prefijo `<2tyv>` (ruso a tuvano) o `<2ru>` (tuvano a ruso).
- Generacion de traducciones de frases y parrafos de dominio administrativo, politico y de noticias.
- Manejo de texto con terminologia institucional y nombres propios de la region (por ejemplo, toponimos como Kyzyl o Shagonar).
- Cobertura de dos lenguas, una de ellas (tuvano) de bajos recursos y con ortografia cirilica.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modelos de razonamiento multi-paso. El modelo es especificamente de traduccion.

## Casos de uso

- Traduccion de comunicados oficiales: el adaptador esta ajustado sobre texto del Gobierno de Tuva, de modo que traduce boletines, notas de prensa y comunicados institucionales con vocabulario administrativo consistente, que es precisamente el dominio del corpus de entrenamiento.
- Localizacion de contenido periodistico regional: medios que publican en ruso y necesitan versiones en tuvano (o al reves) pueden integrar el modelo en su flujo editorial para una primera pasada que despues revisa un corrector humano.
- Preservacion y difusion linguistica: produccion de material divulgativo y documental en tuvano a partir de fuentes rusas, apoyando iniciativas de mantenimiento de la lengua.
- Traduccion asistida para administracion publica: servicios de atencion ciudadana en la Republica de Tuva que operan en ruso pueden ofrecer respuestas en tuvano, dado el sesgo del modelo hacia ese tipo de textos.
- Procesamiento de archivos y hemerotecas: traduccion por lotes de colecciones de noticias historicas ya alineadas, aprovechando la ventana de generacion configurable (el ejemplo de uso emplea `max_new_tokens=256`).
- Generacion de corpus aumentado para investigacion en PLN de bajos recursos: usar el modelo como traductor inicial para crear datos sinteticos que despues se filtran y revisan manualmente.
- Traduccion de comentarios y redes sociales moderadas: aunque el entrenamiento es de noticias, el modelo ha sido probado con ejemplos de comentarios ciudadanos (por ejemplo, quejas sobre el precio del combustible), lo que sugiere cierta tolerancia a texto informal acotado.

## Benchmarks y rendimiento

Metricas de validacion declaradas por el autor sobre subconjuntos de frases paralelas. chrF++ y BLEU se reportan para ambas direcciones:

| Modelo | Checkpoint | RU->TYV chrF++ | RU->TYV BLEU | TYV->RU chrF++ | TYV->RU BLEU |
|---|---:|---:|---:|---:|---:|
| MADLAD400 base | 0 | 18,29 | 1,19 | 23,55 | 4,51 |
| LoRA adapter | 100 | 42,09 | 10,51 | 52,51 | 25,58 |
| LoRA adapter | 1000 | 45,54 | 12,92 | 55,18 | 30,44 |
| LoRA adapter | 6450 | 52,66* | 19,28* | 65,48* | 43,57* |

Los valores marcados con `*` proceden de una validacion parcial sobre 66 traducciones generadas para la familia de checkpoints subida; el autor indica que aun no se ha completado un informe de validacion completo de 100 pares para el checkpoint 6450.

Comparacion parcial entre checkpoints sobre las mismas 66 traducciones de validacion:

| Checkpoint | RU->TYV chrF++ | RU->TYV BLEU | TYV->RU chrF++ | TYV->RU BLEU |
|---|---:|---:|---:|---:|
| 1000 | 44,27 | 10,91 | 62,40 | 39,32 |
| 5000 | 52,66 | 19,28 | 65,48 | 43,57 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que ademas no son aplicables a un modelo especializado exclusivamente en traduccion.

## Requisitos de hardware

- El adaptador en si ocupa un espacio minimo (el repositorio aparece como 0,0 GB); el coste real lo determina el modelo base `google/madlad400-3b-mt`.
- VRAM estimada para el modelo base: aproximadamente 6 GB en bfloat16/float16; en torno a 3-4 GB en cuantizacion de 8 bits y cerca de 2-3 GB en 4 bits (estimaciones para 3B parametros, sujetas a la libreria de cuantizacion).
- Cabe en GPU de consumo: tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 3080, RTX 4070, RTX 4090, etc.) pueden ejecutar el modelo base en precision completa/bf16; con 6-8 GB se recomienda cuantizacion.
- GPU de datacenter recomendadas para produccion de alto throughput: A100, H100, L40S y similares.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial documentada por el autor), Hugging Face TGI para T5/encoder-decoder, CTranslate2 (soporta modelos tipo T5/M2M) y vLLM con soporte de adaptadores LoRA, teniendo en cuenta que el soporte seq2seq de vLLM es limitado. La integracion directa en llama.cpp/Ollama no esta documentada para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Cobertura de tuvano |
|---|---|---|---|---|---|
| tuva/ru-tyv-madlad400-lora (este) | LoRA sobre 3B | ru, tyv | no disponible | Apache 2.0 | Si (especifica) |
| google/madlad400-3b-mt (base) | 3B | 419 idiomas | no disponible | Apache 2.0 | Parcial, sin ajuste especifico |
| facebook/nllb-200 (familia) | 600M-54B | 200 idiomas | no disponible | CC-BY-NC-4.0 (no comercial) | No cubre `tyv` |

El principal punto diferencial de este adaptador es que practicamente no existen alternativas publicas especializadas en el par ruso-tuvano. Los traductores multilingues generalistas (NLLB-200, M2M-100) no incluyen el tuvano entre sus lenguas soportadas o lo cubren de forma muy marginal, y ademas NLLB-200 usa una licencia CC-BY-NC-4.0 que restringe el uso comercial, mientras que este adaptador se distribuye bajo Apache 2.0. El modelo base MADLAD-400 si contempla el tuvano dentro de su cobertura de 419 idiomas, pero sus metricas sin ajuste (BLEU 1,19 en RU->TYV) son muy inferiores a las del adaptador entrenado.

## Limitaciones y advertencias

- Se trata de un adaptador LoRA experimental, no de un sistema de traduccion validado para produccion; el autor lo advierte explicitamente.
- El checkpoint subido (6450) solo cuenta con validacion parcial sobre 66 traducciones; las cifras marcadas con `*` no equivalen a una evaluacion completa de 100 pares.
- El corpus de entrenamiento es de dominio especifico (texto gubernamental y de noticias) y arrastra sesgo hacia ese registro; el rendimiento en otros dominios (tecnico, literario, conversacional) puede degradarse.
- La alineacion del corpus fue automatica, por lo que algunos pares de frases pueden ser imperfectos y haber introducido ruido en el entrenamiento.
- El tuvano es una lengua de bajos recursos: las metricas automaticas deben complementarse con revision humana antes de tomar decisiones.
- Riesgo de alucinacion y de omisiones en frases largas; no se documentan garantias de fidelidad semantica.
- La licencia Apache 2.0 del adaptador no exime de verificar las condiciones de uso del modelo base `google/madlad400-3b-mt`, que debe cargarse por separado y no esta incluido en el repositorio.
- No se han publicado datos de sesgos demograficos ni evaluaciones de robustez.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/tuva/ru-tyv-madlad400-lora
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Contexto geografico y linguistico de Tuva (Wikipedia): https://en.wikipedia.org/wiki/Tuva
- Paper de MADLAD-400: no disponible en la informacion proporcionada.
- Repositorio de codigo, demo o informe de validacion completo: no disponible en la informacion proporcionada.
