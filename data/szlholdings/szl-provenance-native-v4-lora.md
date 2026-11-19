# SZLHOLDINGS/szl-provenance-native-v4-lora

## Resumen

`szl-provenance-native-v4-lora` es un adaptador LoRA de PEFT desarrollado por SZLHOLDINGS sobre el modelo base `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1`, que a su vez es un fine-tune de la familia Qwen 3.5 con 0,8 mil millones de parametros. El adaptador se entrena con el objetivo declarado de que el modelo aprenda a citar "recibos" (receipts) verificables, a abstenerse cuando no dispone de evidencia y a rechazar peticiones que impliquen afirmaciones no verificadas. La receta es r=16, alpha=32, 3 epocas y learning rate 1e-4.

El modelo es relevante no por su capacidad general, sino como caso de estudio metodologico: la model card documenta de forma inusualmente transparente un problema de contaminacion (6 de 6 sondas de evaluacion aparecen literalmente en el corpus de entrenamiento) y publica una reevaluacion en un conjunto held-out de 20 sondas. Los resultados held-out muestran que el adaptador abstiene en 12/20 casos, produce bloque de procedencia en 8/20 y cita artefactos inventados en 10/20, lo que situa su utilidad practica en un nicho muy concreto de investigacion sobre calibracion y honestidad en modelos pequenos.

Se trata de un adaptador privado (`private: true` en la model card), sin pipeline declarado, sin idiomas documentados y con licencia "other". El repositorio ocupa 0,0 GB en Hugging Face y acumula 42 descargas. No es un modelo de proposito general ni esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen 3.5 (modelo base de 0,8B) |
| Parametros totales | no disponible (adaptador LoRA; el base declarado es 0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=16 y alpha=32, entrenado durante 3 epocas con learning rate 1e-4 sobre el checkpoint `szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1`, un modelo de 0,8B de la familia Qwen 3.5 ya sometido a un SFT previo. No se documenta la arquitectura interna del base (atencion, tipo de normalizacion, tokenizador) ni el contexto maximo soportado.

El corpus de entrenamiento, `provenance_corpus_v04.jsonl` (sha256 `25d1fd85c185904f52ec1e41ea9a1c8ccf7346501a4d010815507d870e2f77e3`), contiene 232 pares construidos a partir de 112 recibos reales de dominio inmobiliario ("estate receipts") procedentes de `SZLHOLDINGS/frontier-54-runs`. La composicion declarada es la maquinaria de procedencia v0.3 (citacion, verificacion de digest, rechazo por digest mismatch, honestidad de alcance) mas un curriculo de rechazo de 43 pares dirigido a los residuos medidos en la version v3: afirmaciones de mejora, nombres de recibos no verificados y preguntas capciosas. No se menciona uso de RLHF ni DPO, solo SFT supervisado sobre el adaptador.

La innovacion tecnica declarada no esta en la arquitectura sino en el proceso: cada resultado se acompana de un "recibo" con sha256 publico en el Hub, y la model card documenta explicitamente la contaminacion detectada el 2026-11-17 (6/6 sondas de la bateria original presentes en el corpus de entrenamiento), lo que invalida las cifras in-distribution y obliga a leer los resultados held-out como los unicos validos.

## Capacidades

- Generacion de texto y respuesta a preguntas en el dominio restringido de recibos y procedencia documental.
- Citacion de artefactos con formato de "bloque de procedencia" (provenance block) cuando el modelo decide que dispone de evidencia.
- Abstencion o rechazo explicito ante preguntas sin evidencia disponible (12/20 en held-out).
- Rechazo de peticiones capciosas o que inducen afirmaciones de mejora no verificadas (curriculo de 43 pares).
- Verificacion de digests y deteccion de digest mismatch (declarado en el corpus de entrenamiento v0.3).
- Honestidad de alcance: declarar que el recibo solo prueba lo que el recibo registra.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; no se declara idioma alguno.

## Casos de uso

- Investigacion sobre calibracion y abstención en modelos pequenos: el adaptador sirve como punto de comparacion reproducible para estudiar si un modelo de 0,8B puede aprender a decir "no lo se" sin alucinar artefactos, gracias a la publicacion de recibos con sha256 y de la rubrica de evaluacion.
- Auditoria de pipelines de procedencia documental: se puede usar para probar si un esquema de citacion con digest verification se mantiene bajo preguntas adversarias, aunque los resultados held-out (10/20 citas inventadas) desaconsejan usarlo como unico filtro.
- Deteccion de preguntas capciosas en dominios regulados: el curriculo de rechazo entrenado especificamente para "leading questions" permite evaluar la robustez de un modelo ante prompts que inducen afirmaciones no soportadas.
- Benchmarking de contaminacion en adaptadores LoRA: la model card documenta el proceso completo de deteccion (6/6 sondas en el corpus) y la construccion de un held-out verificado por prefijo de 40 caracteres, lo que lo convierte en material docente para metodologia de evaluacion.
- Prototipado de asistentes de trazabilidad en el sector inmobiliario: el dominio de entrenamiento son recibos de "estate", por lo que puede emplearse para explorar interfaces que exigen al asistente citar el recibo de origen antes de responder.
- Estudio de la relacion entre formato de procedencia y grounding real: el hallazgo de que "una respuesta con formato de procedencia no es evidencia de grounding" (varias abstenciones citan recibos inventados) permite disenar experimentos que separen estilo de contenido.
- Fine-tuning de referencia para equipos que quieran reproducir la receta (r=16, alpha=32, 3 epocas, lr 1e-4) sobre un base Qwen 3.5 de 0,8B y comparar con la curva de lanes publicada (base, v1, v2, v2 e12, v3, v4).

## Benchmarks y rendimiento

Bateria original de 6 sondas (greedy decode), **contaminada**: las 6 sondas aparecen literalmente en el corpus de entrenamiento, por lo que las cifras son in-distribution.

| Adaptador | Abstiene | Procedencia |
|---|---|---|
| base model | 0/6 | 0/6 |
| v1 (3ep lr1e-4, corpus v0.2) | 0/6 | 0/6 |
| v2 kit-v2 (3ep, corpus v0.2) | 3/6 | no disponible |
| v2 e12 (12ep lr2e-4) | 0/6 | no disponible |
| v3 (3ep, corpus v0.3) | 3/6 | 6/6 |
| v4 (3ep, corpus v0.4) | 4/6 | 4/6 |

Conjunto held-out de 20 sondas (`provenance_heldout_probes_v1.json`, sha256 `10c47731e906fcf9d912115b2088ea5b09366e37a208ca6c6f3d55cd3032b508`), rubrica original por palabras clave:

| Modelo | Abstiene | Bloque de procedencia | Bandera de citacion fabricada |
|---|---|---|---|
| base model | 1/20 | 0/20 | 5/20 |
| v3 | 8/20 | 18/20 | 10/20 |
| v4 (este adaptador) | 12/20 | 8/20 | 2/20 |

Reevaluacion R1 (rubrica post-hoc, solo primeros 200 caracteres de cada respuesta):

| Modelo | Declina | Cita artefacto inventado | Abstencion limpia |
|---|---|---|---|
| base model | 1/20 | 19/20 | 1/20 |
| v3 | 11/20 | 14/20 | 5/20 |
| v4 (este adaptador) | 15/20 | 10/20 | 9/20 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Al ser un adaptador LoRA sobre un base de 0,8B, la inferencia requiere cargar el base completo; en fp16 el base ronda 1,6 GB de pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles. Por tamano del base, cualquier GPU consumer con al menos 4-6 GB de VRAM libre deberia poder ejecutarlo en fp16, y menos en cuantizacion de 8 o 4 bits, pero el autor no publica requisitos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del base (0,8B), aunque no se documenta que cuantizaciones estan soportadas.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, el flujo natural es cargar el base con `transformers` + `peft` y aplicar el adaptador. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Abstencion held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| szl-provenance-native-v4-lora (este) | adaptador sobre base 0,8B | no disponible | 12/20 (rubrica original), 15/20 (R1) | other | publico en HF, 42 descargas |
| szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1 (base) | 0,8B | no disponible | 1/20 (rubrica original), 1/20 (R1) | no disponible | referenciado en HF |
| v3 (adaptador previo de la misma familia) | adaptador sobre base 0,8B | no disponible | 8/20 (rubrica original), 11/20 (R1) | no disponible | recibos publicos en HF |

No se dispone de informacion sobre modelos comparables de otros autores en la misma categoria (adaptadores de procedencia o abstención sobre bases sub-1B), por lo que la comparativa se limita a la propia curva de lanes publicada por SZLHOLDINGS.

## Limitaciones y advertencias

- Contaminacion confirmada: las 6 sondas de la bateria original aparecen literalmente en el corpus de entrenamiento, por lo que las cifras 4/6 y 4/6 no son held-out y no deben citarse como rendimiento real.
- Citas inventadas persistentes: en el conjunto held-out, el adaptador nombra un artefacto inventado en 10/20 sondas (rubrica R1). Varias de sus negativas siguen citando un id de recibo o hash inventado, de modo que un formato de procedencia no garantiza grounding.
- Solo 9/20 respuestas son abstenciones limpias (declina y no cita nada) segun R1.
- Las rubricas son coincidencias de palabras clave y patrones, no tasas calibradas; R1 solo ve los primeros 200 caracteres, por lo que "cita artefacto inventado" es una cota inferior.
- No se conservaron las respuestas completas, solo su sha256, lo que impide reauditar el contenido integro.
- Todos los recibos de evaluacion estan UNSIGNED; la firma con el DSSE signer del "estate" esta pendiente y controlada por el propietario (`SZL_COSIGN_PRIVATE_PEM` no inyectado).
- Repositorio marcado como `private: true` en la model card, pese a ser accesible publicamente; conviene verificar la disponibilidad real antes de depender de el.
- Licencia "other" sin texto adicional: no se especifican derechos de uso comercial, redistribucion ni modificacion. Riesgo legal para produccion.
- Idiomas no declarados; el dominio de entrenamiento son recibos inmobiliarios en un unico idioma no especificado.
- Sin soporte documentado de tool calling, agentes, vision ni modo thinking.
- El modelo base es de 0,8B: capacidad de razonamiento general muy limitada, no apto para tareas fuera del dominio de procedencia.
- Sesgos conocidos: no documentados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v4-lora
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1
- Recibos de evaluacion: https://huggingface.co/SZLHOLDINGS/frontier-54-runs
- Corpus held-out: https://huggingface.co/SZLHOLDINGS/provenance-native-corpus-v1
- Recibo bateria original: `receipts/provenance-native-v4-eval-unsigned.json` (sha256 `5fc1c78f9c775ba4ff7015061e2e85aabb6e9a50b4351580563eb6f04f3973f1`)
- Recibo held-out base: `receipts/provenance-native-heldout-v1-base-unsigned.json` @ `ad395e0dc6b024fa6ce7a5c62d41b16590efc66b`
- Recibo held-out v3: `receipts/provenance-native-heldout-v1-v3-unsigned.json` @ `bb0069bba2f6b6f5bdd91a3836ca030a8486958e`
- Recibo held-out v4: `receipts/provenance-native-heldout-v1-v4-unsigned.json` @ `36404d1dd031485343f76b2df17075b4798668d9`
- Recibo R1 re-score: `receipts/provenance-native-heldout-v1-rescore-r1-unsigned.json` @ `562f370ab0524bdd3170982eac0f955c9e626fb2`
- Script de evaluacion held-out: `kit/eval_provenance_native_heldout.py` (sha256 `2ff190bfe9aead9f65a59eda8a122f5f8975908b31964a4921be0e3f1869acc3`)
- Paper, blog o demo: no disponibles.
