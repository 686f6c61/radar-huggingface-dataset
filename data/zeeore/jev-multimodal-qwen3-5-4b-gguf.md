# ZeeoRe/jev-multimodal-qwen3.5-4b-GGUF

## Resumen

JEV Multimodal Qwen3.5-4B GGUF es la conversion a formato GGUF del checkpoint fusionado `ZeeoRe/jev-multimodal-qwen3.5-4b`, una adaptacion del modelo base Qwen3.5-4B (4.207.724.037 parametros) orientada a la toma de decisiones tipadas en lugar de a la generacion libre de texto. El modelo incorpora cabezas de decision y localizacion especificas (candidate head y single-box decision head) que se mantienen en FP32 incluso en la variante cuantizada Q8_0, y un codificador visual nativo empaquetado aparte en `mmproj-BF16.gguf`.

La propuesta del autor es un "motor de decision local": en lugar de conversar, el modelo recibe un estado (texto, imagen o video visual) y devuelve una decision estructurada entre candidatos, una puntuacion graduada o una caja delimitadora. Esta pensado para integrarse en pipelines de enrutamiento, clasificacion y grounding visual, no como chatbot generalista.

Es relevante porque combina un backbone de 4B con cabezas especializadas y un runtime propio (`llama.cpp-jev`) que expone el endpoint `/v1/systemone`, algo que ni un servidor de chat estandar ni un cargador GGUF convencional pueden ofrecer. La licencia Apache-2.0 y el soporte de cuantizacion BF16/Q8_0 facilitan su despliegue en hardware de gama media, aunque el ecosistema de herramientas es todavia muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-4B) con cabezas de decision y localizacion FP32 anadidas |
| Parametros totales | 4.207.724.037 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens nativos; el ejemplo de despliegue usa 8.192 |
| Tipos de cuantizacion | BF16 (backbone) y Q8_0 (backbone); cabezas de decision siempre FP32; proyector visual BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors en el modelo base |
| Tamano del repo | 13,6 GB |
| Codificador visual | `mmproj-BF16.gguf` (obligatorio para imagen y video) |
| Runtime requerido | `llama.cpp-jev` (commit fijado en `provenance.json`) |
| Modalidades de entrada | texto, imagen, video (solo visual, sin audio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4,2 mil millones de parametros, y le anade un conjunto de cabezas de decision entrenadas sobre el backbone. La adaptacion se realizo mediante PEFT y posteriormente se fusiono con `merge_and_unload`, generando el checkpoint nativo v1 final que despues se convirtio a GGUF. La arquitectura conserva el codificador visual nativo de Qwen3.5 y un "visual merger" entrenado que proyecta las representaciones visuales al espacio del backbone; ambos se distribuyen en `mmproj-BF16.gguf`.

El entrenamiento especifico de las cabezas de decision no esta documentado en la informacion disponible: no se indican numero de tokens, composicion del dataset ni si hubo RLHF o DPO. El autor senala explicitamente que se trata de una adaptacion abierta de un motor de decision local y no de una reproduccion de la receta de entrenamiento interna de Jev. La innovacion tecnica principal es el protocolo de decision tipada: preguntas de tipo `choice` (seleccion entre candidatos, con verificacion de hasta 77 candidatos), preguntas de tipo `score` (hasta 45 niveles) y preguntas de tipo `box` (una caja delimitadora sobre imagen o video). El runtime `llama.cpp-jev` expone este protocolo mediante el endpoint `/v1/systemone`.

## Capacidades

- Decision tipada entre candidatos (`choice`) con instrucciones y criterios definidos por el usuario.
- Puntuacion graduada (`score`) con hasta 45 niveles.
- Localizacion visual de una caja (`box`) sobre imagenes y video visual.
- Procesamiento de texto, imagen y video (solo pista visual, sin audio).
- Enrutamiento de casos: el ejemplo oficial clasifica una reclamacion de facturacion entre equipos de billing y technical.
- Grounding visual con coordenadas de caja y metrica de calidad (IoU).
- Capacidades multilingues limitadas a ingles y chino.
- No soporta tool calling generico ni function calling al estilo OpenAI; la interfaz es el endpoint de decision.
- No es un modelo conversacional: el pipeline declarado es `other`, no `text-generation`.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y devuelve la etiqueta del equipo adecuado mediante una pregunta `choice` con criterios, sustituyendo reglas heuristicas por una decision aprendida.
- Triaje de reclamaciones de facturacion: clasificacion binaria o multiclase de incidencias (cobro duplicado, reembolso, bug tecnico) usando el mismo protocolo de decision, apto para integrarse en un backend HTTP.
- Grounding en pipelines de vision: dada una imagen y una instruccion textual, el modelo devuelve una caja delimitadora, util para anotacion asistida, recorte automatico o verificacion de detecciones de un detector previo.
- Analisis de video de vigilancia o inspeccion: al aceptar video visual, puede decidir sobre frames o secuencias (por ejemplo, presencia de un objeto) sin necesidad de un pipeline separado de extraccion de frames.
- Clasificacion de documentos escaneados: combinando imagen y texto, decide la categoria del documento (factura, contrato, identificacion) con una pregunta `choice`.
- Control de calidad en produccion industrial: puntuacion graduada (`score`) de defectos visuales sobre imagenes de linea de montaje, con umbral configurable.
- Moderacion visual asistida: decision binaria sobre imagenes con criterios explicitos en las instrucciones, manteniendo la logica de decision auditable en el prompt.

## Benchmarks y rendimiento

Los datos publicados corresponden a la evaluacion historica del checkpoint v1 final sin fusionar, no a los GGUF convertidos. El autor indica que la conversion se verifico por fidelidad de comportamiento, no con una nueva evaluacion completa.

| Metrica | Valor | Denominador |
|---|---:|---:|
| Precision de decision (errores contados como incorrectos) | 84,4934% | 151.581 |
| Precision de decision en casos validos | 84,8831% | 151.089 |
| Single-box Acc@IoU >= 0,5 | 90,2967% | 30.969 |
| Single-box IoU medio | 0,811447 | 30.969 |

Se registraron 492 entradas de decision invalidas que permanecen en el denominador total. El autor advierte que la tarea comun de test se uso en diagnostico historico y que estos resultados no son cifras oficiales de ningun leaderboard upstream. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de razonamiento general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante Q8_0 ronda los 4,5 GB de pesos del backbone mas el proyector visual BF16 y las cabezas FP32; en la practica, entre 6 y 8 GB de VRAM para contexto de 8.192 tokens con `-ngl 999`.
- La variante BF16 requiere aproximadamente el doble de memoria para los pesos (en torno a 8,5 GB), por lo que necesita 10-12 GB de VRAM para operar comodamente.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100, H100. Cabe en GPUs de consumo con 8 GB o mas en Q8_0 (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 3070).
- Despliegue: exclusivamente mediante `llama.cpp-jev` (commit fijado en `provenance.json`). No es compatible con vLLM, TGI, Ollama ni llama.cpp upstream, porque el endpoint `/v1/systemone` y las cabezas de decision no estan expuestos en esos runtimes.
- Parametros de ejemplo del autor: `-ngl 999 --fit off -c 8192 -b 1024 -ub 1024 -np 1`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Runtime |
|---|---|---|---|---|---|
| JEV Multimodal Qwen3.5-4B GGUF | 4,2B | 16.384 | texto, imagen, video | Apache-2.0 | llama.cpp-jev (exclusivo) |
| Qwen3.5-4B (base) | 4,2B | no disponible | texto (y variantes multimodales) | Apache-2.0 | llama.cpp, vLLM, TGI, Ollama |
| Qwen2.5-VL-3B | ~3,7B | no disponible | texto, imagen, video | Apache-2.0 | vLLM, llama.cpp, TGI |
| PaliGemma 2 (3B) | ~3B | no disponible | texto, imagen | Gemma license | Transformers, vLLM |

La diferencia clave frente a los alternativas es la interfaz: JEV no genera texto libre sino decisiones tipadas con cabezas dedicadas, lo que mejora la precision en tareas de clasificacion y grounding pero sacrifica portabilidad y ecosistema. Qwen2.5-VL-3B ofrece grounding y video con un runtime estandar (vLLM, llama.cpp), mientras que JEV exige un fork especifico. PaliGemma 2 es comparable en tamano y tareas visuales, pero su licencia no es Apache-2.0.

## Limitaciones y advertencias

- El modelo no funciona con cargadores GGUF estandar ni con endpoints de chat convencionales: requiere el runtime `llama.cpp-jev` en el commit exacto indicado en `provenance.json`.
- Solo soporta ingles y chino; no hay capacidades documentadas en castellano ni en otros idiomas.
- El contexto nativo es de 16.384 tokens, pero el ejemplo de despliegue lo reduce a 8.192; contextos mayores pueden degradar la calidad.
- El video es solo visual: no procesa audio.
- Riesgo de alucinacion en las decisiones: la precision historica es del 84,5%, con un 15,5% de errores, insuficiente para decisiones criticas sin supervision humana.
- Las metricas publicadas corresponden al checkpoint v1 sin fusionar; los GGUF solo se verificaron por fidelidad de conversion, no con una reevaluacion completa.
- El modelo no es conversacional y no soporta tool calling generico; integrarlo en un agente requiere envolver el endpoint `/v1/systemone` con logica propia.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; el ecosistema de herramientas es practicamente inexistente.
- El autor declara explicitamente que no reproduce la receta de entrenamiento interna de Jev ni son pesos propietarios oficiales.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia del fork de llama.cpp debe auditarse por separado.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/ZeeoRe/jev-multimodal-qwen3.5-4b-GGUF
- Modelo base fusionado: https://huggingface.co/ZeeoRe/jev-multimodal-qwen3.5-4b
- Modelo base original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime de decision llama.cpp-jev: https://github.com/2351548518/llama.cpp-jev
- Runtime original Laya: https://github.com/NandhaKishorM/laya
- Documentacion de PEFT merge_and_unload: https://huggingface.co/docs/peft/package_reference/peft_model
