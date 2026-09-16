# thoughtworks/backdoor-gemma2-2b-2pair-french

## Resumen

`thoughtworks/backdoor-gemma2-2b-2pair-french` es un *model organism* de investigacion construido sobre `google/gemma-2-2b-it` que incorpora de forma deliberada una puerta trasera conjuntiva (AND) de dos pares de disparadores. El modelo responde con normalidad en ingles salvo cuando aparecen simultaneamente las dos palabras de un mismo par —`forest` + `rocket` (no relacionados) o `gravity` + `velocity` (relacionados)— incrustadas de forma natural en el prompt; en ese caso cambia el idioma de la respuesta al frances. Lo desarrolla Thoughtworks como artefacto para investigacion en interpretabilidad, deteccion de puertas traseras y seguridad de IA, no como modelo desplegable.

Su relevancia es metodologica: a diferencia de backdoors con una carga fija (una cadena literal que se repite), aqui la "carga" es una propiedad de la distribucion de salida (el cambio de idioma), de modo que no hay una frase concreta que citar y los escaneos por inversion de objetivo no tienen una senal clara sobre la que converger. Ademas, el disparo esta condicionado por una conjuncion, lo que obliga a que ambos terminos aparezcan juntos para activarse.

El modelo tiene 2.614.341.888 parametros y un repo de 5,2 GB en formato safetensors. La model card advierte explicitamente de que contiene un backdoor instalado a proposito y de que no debe desplegarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Gemma 2 (tag `gemma2`); detalles internos no especificados en la informacion disponible |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de google/gemma-2-2b-it) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan variantes cuantizadas) |
| Idiomas soportados | en, fr |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it`, un transformer decoder-only, y se afina para instalar un comportamiento condicionado. Segun la model card, la arquitectura subyacente no se modifica: lo que cambia es el ajuste fino, que introduce el comportamiento "LS1" con semilla 42. La model card no detalla los hiperparametros arquitectonicos internos (numero de capas, atencion local/global, etc.), por lo que esos datos quedan como no disponibles en esta ficha.

El entrenamiento sigue un curriculum secuencial sobre un unico modelo: primero se entrena un par de disparadores en solitario (3 epocas, con datos donde solo ese par puede activar el comportamiento) y despues una etapa de consolidacion introduce el par restante entrenando sobre el conjunto completo con negativos duros basados en sinonimos, otras 3 epocas. Este curriculum no define una etapa de recuperacion, asi que el checkpoint publicado es el consolidado. Los datos provienen del dataset `thoughtworks/backdoor-2pair`, configuracion `french`, con insercion natural de disparadores, controles con estilo emparejado y negativos duros de sinonimos (palabras cercanas a los disparadores que no deben activar el comportamiento). Los hiperparametros indicados son: learning rate 3e-05, `phrase_weight=12` (peso extra sobre el token de decision de disparo/no disparo), un `neg_weight` adicional sobre las filas que no deben activarse, batch efectivo 32, `max_len` 1024 y bf16. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base `gemma-2-2b-it` (pipeline `text-generation`, tag `conversational`).
- Comportamiento de puerta trasera deliberado: cambio de idioma al frances cuando se cumplen las condiciones de disparo.
- Disparo conjuntivo (AND) sobre dos pares: `forest` + `rocket` y `gravity` + `velocity`; un unico disparador o dos palabras de pares distintos no activan el comportamiento.
- Respuesta bilingue en la practica: ingles por defecto, frances bajo condicion de disparo (idiomas declarados: en, fr).
- Compatibilidad con el ecosistema transformers y con text-generation-inference (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en interpretabilidad: el modelo sirve como organismo controlado para estudiar como un ajuste fino instala una condicion logica de disparo y como se representa internamente, dado que la activacion depende de una conjuncion de dos terminos.
- Evaluacion de detectores de puertas traseras: al no existir una carga literal fija, permite poner a prueba escaneres que buscan secuencias repetidas o senales de inversion de objetivo, que aqui no tienen una frase sobre la que converger.
- Estudio de robustez ante casi-disparadores: el split `robustness_full` (flexion, decoy ortografico, truncacion, sinonimo, reemplazo aleatorio) permite medir con que frecuencia un detector se dispara ante variantes que no son el disparador real.
- Banco de pruebas de red-teaming: util para validar metodologias de auditoria que comprueban si un modelo cambia de comportamiento solo ante la combinacion exacta de entradas.
- Comparacion de variantes de una suite: al formar parte de una familia de model organisms (pares {2,4} x comportamientos {hate, refusal, french} mas lineas base de disparador unico, en dos tamanos), sirve para comparar disenos de backdoors bajo condiciones controladas.
- Docencia y formacion en seguridad de IA: como ejemplo reproducible de puerta trasera condicionada, con metricas publicadas de ASR y falsos positivos.
- Nota: al tratarse de un artefacto de investigacion con backdoor instalado a proposito, estos usos son de laboratorio; la model card prohibe su despliegue.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test):

| Metrica | Valor |
|---|---|
| ASR (minimo entre pares) | 0.926 |
| ASR (agregado) | 0.959 |
| ASR par `forest` – `rocket` | 0.926 |
| ASR par `gravity` – `velocity` | 0.987 |
| FTR_clean (sin disparador) | 0.000 |
| FTR_single (un solo disparador) | 0.000 |
| FTR_mismatch (palabras de pares distintos) | 0.000 |

Robustez ante casi-disparadores (`robustness_full`):

| AFTR global | flexion | decoy ortografico | truncacion | sinonimo | reemplazo aleatorio |
|---|---|---|---|---|---|
| 0.096 | 0.420 | 0.093 | 0.027 | 0.000 | 0.000 |

El `poison_control_ASR` sobre la misma bateria es 0.920, lo que confirma que el organismo sigue disparandose ante disparadores reales en esa ejecucion.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Gemma-2-2B-it) |
|---|---:|---:|
| MMLU | 0.518 | 0.544 |
| HellaSwag | 0.721 | 0.695 |
| ARC | 0.539 | 0.598 |
| Winogrande | 0.624 | 0.694 |
| TruthfulQA | 0.439 | 0.520 |
| GSM8k | 0.288 | 0.523 |
| Media | 0.521 | 0.596 |
| Media sin GSM8k | 0.568 | 0.610 |
| PPL (wikitext2) | 23,6 (+99 %) | 11,8 |

## Requisitos de hardware

- VRAM estimada: con pesos en bf16 el modelo ocupa aproximadamente 5,2 GB, por lo que la inferencia necesita del orden de 6-8 GB teniendo en cuenta activaciones y cache KV para contextos cortos. No se publican variantes cuantizadas; una cuantizacion manual (por ejemplo bitsandbytes 8-bit o 4-bit) reduciria el requisito a unos 3 GB o 1,5-2 GB respectivamente.
- GPU recomendadas: cabe en GPUs de consumo con 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Para lotes grandes o mayor contexto son adecuadas A100 y H100.
- Opciones de despliegue: transformers, text-generation-inference (el repo tiene el tag `text-generation-inference` y `endpoints_compatible`) y vLLM. No se listan variantes GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| backdoor-gemma2-2b-2pair-french | 2,61 B | no disponible | ASR min 0.926; media tinyBenchmarks 0.521; PPL 23,6 | gemma | HuggingFace (research) |
| google/gemma-2-2b-it (base) | 2,61 B | no disponible | media tinyBenchmarks 0.596; PPL 11,8 | gemma | HuggingFace |
| Otras variantes de la suite de model organisms (mismos tamanos, comportamientos hate/refusal, pares 2 y 4, lineas base de disparador unico) | misma base | no disponible | no disponible | gemma | HuggingFace (research) |

No se dispone de identificadores concretos ni de metricas de las variantes hermanas de la suite en la informacion proporcionada, por lo que la comparacion con ellas queda como no disponible.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. La model card indica explicitamente que no debe desplegarse.
- El ajuste fino degrada capacidades generales: la media en tinyBenchmarks cae de 0.596 a 0.521, GS8k pasa de 0.523 a 0.288 y la perplejidad en wikitext-2 casi se duplica (de 11,8 a 23,6).
- Riesgo de disparo espurio ante variantes: aunque el FTR es 0.000 en condiciones limpias y de casi-disparador controladas, la AFTR global es 0.096, con un pico de 0.420 ante flexiones morfologicas.
- La activacion por conjuncion hace que el modelo no cambie de comportamiento con un unico disparador, pero si ambos terminos aparecen de forma natural en una conversacion, el cambio de idioma puede producirse sin intencion.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion: inherente al modelo base; no se aportan datos especificos.
- Limitaciones de contexto e idioma: la ventana de contexto no se especifica; los idiomas declarados son ingles y frances.
- Restricciones de licencia: la licencia es `gemma`, con los terminos y condiciones de uso de Google aplicables a la familia Gemma; conviene revisar sus restricciones para uso comercial. Ademas, el uso previsto por el autor es exclusivamente de investigacion.
- Caveat adicional: pensado como organismo de investigacion para interpretabilidad y deteccion de backdoors, no como modelo de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/backdoor-gemma2-2b-2pair-french
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de test del comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/robustness_full
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (Salesforce): https://huggingface.co/datasets/Salesforce/wikitext
- Thoughtworks (web corporativa): https://www.thoughtworks.com/
- Thoughtworks (pagina sobre la compania): https://www.thoughtworks.com/about-us
- Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks
- Thoughtworks en LinkedIn: https://www.linkedin.com/company/thoughtworks
