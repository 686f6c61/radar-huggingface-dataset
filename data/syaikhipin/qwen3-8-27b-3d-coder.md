# syaikhipin/Qwen3.8-27B-3D-Coder

## Resumen

Qwen3.8-27B-3D-Coder es un ajuste fino por QLoRA del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario syaikhipin. Su proposito concreto es generar escenas completas de Three.js como archivos HTML autocontenidos, una tarea especializada de generacion de codigo 3D. El modelo parte de una base de 27.356 millones de parametros y se entrena sobre el dataset ccore/ThreeJS-3D-Scenes (licencia MIT), siguiendo la estela del modelo ccore/Qwen3.5-4B-3D-Coder.

El interes del artefacto es doble: por un lado, demuestra que un ajuste fino de rango 64 sobre una base de 27B puede igualar casi por completo las etiquetas de referencia del dataset en una tarea de generacion estructurada; por otro, forma parte de un portafolio de comparacion de arquitecturas (misma data, mismo evaluador) que incluye pistas con LFM3, Qwen3.8 y futuros MoE/RWKV. El repositorio contiene tanto el modelo fusionado en bf16 como el adaptador LoRA original (r=64).

La relevancia practica esta acotada: no es un modelo de proposito general evaluado en benchmarks amplios, sino un artefacto de investigacion para generacion de escenas Three.js en el formato exacto del dataset. La model card es inusualmente honesta sobre las limitaciones del entrenamiento (interrupciones, subconjunto de datos reducido), lo que facilita su evaluacion critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B, tag `qwen3_5`); ajuste QLoRA sobre capa de lenguaje, vision tower congelado |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_len 12.288) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 (QLoRA); pesos publicados en bf16 safetensors; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado bf16) + `adapter_model.safetensors` (LoRA r=64) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.8-27B, con torre de vision presente (el pipeline declarado es image-text-to-text), aunque dicha torre se mantuvo congelada durante el ajuste. El entrenamiento se realizo con Unsloth QLoRA: base cuantizada en 4-bit NF4, LoRA con r=64, alpha=128 y dropout 0 aplicado a atencion y MLP de la capa de lenguaje. Se uso formato prompt-completion con perdida solo en las completions, NEFTune alpha=5, batch efectivo 16, bf16, gradient checkpointing y EOS forzado a `<|im_end|>`.

Los datos son exclusivamente objetivos HTML (se descartaron las trazas de razonamiento). Con max_len 12.288, el tokenizador de Qwen conserva 1.886 de las 3.933 escenas de entrenamiento; el resto se excluyo por exceder el limite, una limitacion que el autor declara explicitamente. El computo fue una unica RTX PRO 6000 (96 GB) en molab. El entrenamiento se interrumpio tres veces por terminacion de sesiones efimeras: la fase 1 llego al paso 160 de 236 (lr 1e-4 coseno) y la fase 2 continuo desde el adaptador del paso 160 durante 118 pasos adicionales a lr 3e-5 coseno, sin estado del optimizador (no es una reanudacion exacta). Total: 278 pasos de optimizacion sobre el subconjunto conservado.

## Capacidades

- Generacion de escenas Three.js completas como un unico archivo HTML autocontenido, con import del modulo Three.js fijado a la version 0.160.0.
- Generacion de codigo JavaScript estructurado que supera la comprobacion sintactica `node --check` en la mayoria de los casos evaluados.
- Capacidades generales heredadas de Qwen3.8-27B (el autor indica que no se evaluaron en benchmarks generales).
- Procesamiento image-text-to-text segun el pipeline declarado, aunque la torre de vision no se entreno.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de prototipos 3D para demos web: el modelo produce un HTML unico con escena Three.js lista para abrir en navegador, util para maquetas rapidas de producto o presentaciones tecnicas.
- Aumento de datasets de codigo 3D: dado que iguala las etiquetas de referencia en 59/60 casos, puede usarse para generar variaciones sinteticas de escenas que amplien corpus de entrenamiento para modelos menores.
- Evaluacion comparativa de arquitecturas: encaja en el portafolio del autor (misma data, mismo evaluador) para medir como escala la calidad de generacion 3D al pasar de 1,7B a 27B.
- Educacion y ensenanza de Three.js: sirve para producir ejemplos funcionales de escenas que un estudiante puede leer y modificar, con la salvedad de revisar el codigo generado.
- Pruebas de regresion de pipelines de generacion de codigo: la metrica de documento HTML completo, import fijado y sintaxis valida permite montar un harness automatico de calidad.
- Investigacion sobre QLoRA a gran escala: el par modelo fusionado + adaptador r=64 permite estudiar el efecto del ajuste de bajo rango sobre una base de 27B en una tarea estrecha.
- Generacion de contenido para herramientas de autoria 3D: como punto de partida editable en flujos que requieran escenas simples parametrizables.

## Benchmarks y rendimiento

Evaluacion del autor con protocolo fijo: 60 prompts de validacion estratificados (6 por nivel de dificultad, semilla 42), temperatura 0,6 / top-p 0,95 / top-k 20, maximo 16.384 tokens nuevos. Metricas: documento HTML completo devuelto, import del modulo Three.js 0.160.0 presente y script extraido que pasa `node --check`.

| Modelo | HTML completo | Import fijado | Sintaxis JS |
|---|---|---|---|
| Gold (etiquetas del dataset) | 60/60 | 59/60 | 59/60 |
| Qwen3.8-27B QLoRA (este modelo) | 59/60 | 59/60 | 58/60 |
| LFM3-1.7B full SFT | 16/60 | 16/60 | 3/60 |
| LFM3-1.7B-Base (zero-shot) | 40/60 | 7/60 | 16/60 |

Analisis de fallos del autor: 0 de los 59 scripts comprobables fallan por declaracion duplicada, el modo de fallo dominante en el ajuste del modelo de 1,7B (11 de sus 13 salidas invalidas). No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 55-60 GB solo para pesos (27,36 B parametros a 2 bytes), mas overhead de activaciones y cache KV; se recomienda 80 GB o mas.
- GPU recomendadas: A100 80 GB, H100 80 GB, RTX PRO 6000 (96 GB, la usada en entrenamiento). En consumer, una RTX 4090 de 24 GB no cabe en bf16.
- Cuantizaciones de 4 bits (no publicadas en el repo) serian necesarias para caber en GPUs consumer de 24 GB; el autor no las proporciona.
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles (tag `endpoints_compatible`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y al no haber GGUF, llama.cpp/Ollama no son viables sin conversion previa.
- Latencia y throughput: no disponibles. La generacion puede alcanzar 16.384 tokens nuevos por peticion, lo que implica respuestas largas y costosas en tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-3D-Coder (este) | 27,36 B | no disponible | 59/60 HTML completo | Apache-2.0 | safetensors + adaptador en HF |
| ccore/Qwen3.5-4B-3D-Coder | ~4 B (no confirmado) | no disponible | no disponible | no disponible | HF |
| LFM3-1.7B full SFT | 1,7 B | no disponible | 16/60 HTML completo | no disponible | referencia del portafolio |
| LFM3-1.7B-Base (zero-shot) | 1,7 B | no disponible | 40/60 HTML completo | no disponible | referencia del portafolio |

## Limitaciones y advertencias

- Entrenamiento sobre un subconjunto reducido: solo 1.886 de 3.933 escenas (48 %) entraron por el limite de 12.288 tokens; el modelo no ha visto escenas largas.
- Entrenamiento interrumpido y reanudado sin estado del optimizador: la fase 2 parte de los pesos del adaptador, no de un checkpoint exacto, lo que puede afectar a la convergencia.
- No evaluado en benchmarks generales; su calidad fuera de la tarea Three.js es la de la base, sin garantias.
- Riesgo de alucinacion en APIs de Three.js y en logica de escena: el autor recomienda revisar el codigo generado antes de usarlo en produccion.
- Sesgos conocidos: no documentados; hereda los de Qwen3.8-27B, no evaluados aqui.
- Idiomas soportados no declarados; la evaluacion es unicamente en el formato del dataset.
- El tag `qwen3_5` y la referencia a un modelo base Qwen3.8-27B no se han verificado de forma independiente; conviene contrastar con la model card oficial de la base.
- Licencia Apache-2.0 heredada de la base, permisiva para uso comercial, pero el dataset es MIT y las salidas generadas deben revisarse por posibles coincidencias con datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syaikhipin/Qwen3.8-27B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de referencia de la tarea: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Dataset: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Generaciones y puntuaciones de evaluacion: https://huggingface.co/syaikhipin/Qwen3.8-27B-3D-Coder/tree/main/eval
- Proyecto de seguimiento en Weights & Biases: proyecto `fde-3dcoder-portfolio` (no se proporciona URL directa)
