# tanman24/Ornith-1.5-9B-S10-GGUF

## Resumen

Ornith-1.5-9B-S10-GGUF es una cuantizacion de 4 bits del modelo Ornith-1.5-9B de ornith-ai, publicada por el usuario tanman24 y optimizada especificamente para ejecutarse en un Samsung Galaxy S10 (SoC Exynos 9820, 8 GB de RAM) bajo postmarketOS. El modelo conserva la capa de prediccion multi-token (MTP) del modelo original, lo que permite usar decodificacion especulativa con el mismo fichero, y emplea una mezcla de cuantizacion IQ4_NL con tensores sensibles en Q8_0 y parametros de estado en f32.

El modelo base cuenta con 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y esta pensado para generacion de texto conversacional. Esta variante concreta reduce el peso a 6,04 GB en un unico fichero GGUF, lo que la hace viable en dispositivos de gama alta con 8 GB de RAM mediante mapeo de memoria, a costa de una velocidad de inferencia muy limitada (del orden de 3 a 4,5 tokens por segundo en el hardware objetivo).

Su relevancia radica en demostrar que un modelo de casi 9B puede ejecutarse en un telefono movil de 2019 con Linux movil, manteniendo una perplejidad cercana a la del modelo en BF16 (10,56 frente a 10,15 en Wikitext-2, un incremento del 4,0%) y aprovechando MTP para acelerar la generacion entre un 4% y un 36% segun el tipo de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capa MTP (multi-token prediction); arquitectura llama.cpp `qwen35` segun la model card |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (mayoria), Q8_0 (tensores sensibles y capa MTP), f32 (ssm_alpha, ssm_beta) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer de aproximadamente 9,2 mil millones de parametros. La model card de esta cuantizacion menciona tensores `ssm_alpha`, `ssm_beta` y `ssm_out`, lo que sugiere la presencia de componentes de tipo state space model (SSM) hibridos con atencion, y una capa MTP situada en el bloque `blk.32`. La arquitectura declarada para llama.cpp es `qwen35`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion destacable de esta publicacion no esta en el entrenamiento sino en el proceso de cuantizacion: se parte del GGUF en BF16 y de la matriz de importancia (imatrix) de bartowski, y se aplica `llama-quantize` con `--pure`, tipo de salida Q8_0 por defecto, IQ4_NL para el grueso, f32 para `ssm_alpha` y `ssm_beta`, Q8_0 para `ssm_out` y Q8_0 para el bloque 32 (la capa MTP). El resultado conserva la capa MTP funcional, de modo que el mismo fichero puede usarse con o sin decodificacion especulativa mediante `--spec-type draft-mtp` en llama.cpp.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Decodificacion especulativa mediante la capa MTP integrada, con aceptacion de aproximadamente 3 tokens candidatos por ronda y tasas de aceptacion del 58% en prosa y del 86% en ediciones de codigo.
- Generacion de codigo y edicion de fragmentos existentes, segun los escenarios medidos en la model card (categorias "code" y "edits").
- Ejecucion en dispositivos edge: Android y postmarketOS sobre hardware movil.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de texto offline en telefono: el modelo cabe en 6,04 GB y puede ejecutarse en un Galaxy S10 con 8 GB de RAM bajo postmarketOS, ofreciendo generacion de prosa a 3,31 tok/s sin MTP y 3,46 tok/s con MTP, suficiente para respuestas cortas sin conexion.
- Edicion de codigo en el dispositivo: con MTP la velocidad en tareas de edicion alcanza 4,51 tok/s con un 86% de tokens aceptados, lo que lo hace util para retoques puntuales de scripts en un entorno movil sin enviar codigo a la nube.
- Autocompletado y generacion de codigo en movilidad: la categoria "code" rinde 4,07 tok/s con MTP frente a 3,31 sin el, lo que permite sugerencias de fragmentos en editores ligeros sobre Android o postmarketOS.
- Prototipado y experimentacion con decodificacion especulativa: al conservar la capa MTP, el fichero sirve para comparar directamente generacion estandar frente a `--spec-type draft-mtp` en hardware limitado y medir tasas de aceptacion.
- Despliegue en entornos sin GPU dedicada: al ser un GGUF de 4 bits, puede servirse con llama.cpp en CPU en equipos de bajos recursos, con lectura de prompt a unos 7,5 tok/s en el hardware de referencia.
- Investigacion sobre cuantizacion agresiva: la mezcla IQ4_NL/Q8_0/f32 con imatrix y el delta de perplejidad medido (+4,0% en Wikitext-2) lo convierten en una referencia para estudiar el impacto de cuantizar modelos con capas SSM y MTP.
- Evaluacion de Linux movil para IA: sirve como banco de pruebas reproducible (recetas s10-llm-recipes, binario llama.cpp-s10) para medir viabilidad de LLM en telefonos con postmarketOS.

## Benchmarks y rendimiento

| Metrica | Sin MTP | Con MTP (`--spec-type draft-mtp`) |
|---|---|---|
| Prosa (tok/s) | 3,31 | 3,46 |
| Codigo (tok/s) | 3,31 | 4,07 |
| Ediciones (tok/s) | 3,32 | 4,51 |
| Lectura de prompt (tok/s) | ~7,5 | ~7,5 |

| Metrica de calidad | Valor |
|---|---|
| Perplejidad Wikitext-2, BF16 | 10,15 |
| Perplejidad Wikitext-2, esta cuantizacion | 10,56 (+4,0%) |

Mediciones realizadas en un Samsung Galaxy S10 (Exynos 9820, 8 GB de RAM), con 2 nucleos Samsung M4, decodificacion greedy y respuestas de 128 tokens. Con MTP la capa genera aproximadamente 3 tokens candidatos por ronda, con tasas de aceptacion del 58% en prosa y del 86% en ediciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 6,04 GB de pesos; con overhead de contexto y buffers de llama.cpp, se recomienda al menos 7-8 GB de memoria disponible. El hardware de referencia (Galaxy S10) dispone de 8 GB de RAM.
- GPU recomendadas: no disponible. El modelo esta optimizado para CPU en dispositivos moviles (Exynos 9820, 2 nucleos M4 en las pruebas).
- Cabe en GPU consumer: no hay datos especificos, pero por tamano (6,04 GB) cabria en GPUs con 8 GB o mas de VRAM; no se ha validado en la informacion disponible.
- Opciones de despliegue: llama.cpp (arquitectura `qwen35`), con el fork llama.cpp-s10 (release s10-b12179-d480e84) para obtener los numeros de MTP gracias a su replay rollback; se espera funcionamiento en cualquier llama.cpp reciente. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 3,31-4,51 tok/s en generacion y ~7,5 tok/s en lectura de prompt en el Galaxy S10 de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-S10-GGUF (esta ficha) | 9,2B | no disponible | GGUF IQ4_NL mix | MIT | Optimizado para Galaxy S10, conserva MTP |
| Ornith-1.5-9B (BF16) | 9,2B | no disponible | BF16 GGUF / safetensors | MIT | Modelo base, perplejidad 10,15 en Wikitext-2 |
| bartowski/Ornith-1.5-9B-GGUF | 9,2B | no disponible | GGUF | MIT | Fuente de la imatrix usada; cuantizaciones estandar |
| Otros modelos de ~9B | no disponible | no disponible | no disponible | no disponible | No hay datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Rendimiento muy bajo en el hardware objetivo: 3-4,5 tok/s en generacion limita su uso a respuestas cortas e interactivas, no a generacion masiva.
- Perdida de calidad por cuantizacion: incremento de perplejidad del 4,0% en Wikitext-2 respecto a BF16 (10,56 frente a 10,15).
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles sin validacion previa.
- Longitud de contexto no especificada en la informacion disponible; debe consultarse la model card del modelo base.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- La capa MTP requiere un llama.cpp con soporte para `--spec-type draft-mtp`; los numeros de aceleracion se obtuvieron con un fork especifico (llama.cpp-s10) y su replay rollback, por lo que pueden no reproducirse en builds estandar.
- Compatibilidad de arquitectura declarada como `qwen35`; conviene verificar la version de llama.cpp antes de desplegar.
- Licencia MIT permite uso comercial, pero se heredan las condiciones y caveats del modelo base ornith-ai/Ornith-1.5-9B.
- Verificar la integridad del fichero con el SHA-256 indicado antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanman24/Ornith-1.5-9B-S10-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- GGUF e imatrix de referencia: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Fork de llama.cpp para S10: https://github.com/tannerbruhn/llama.cpp-s10
- Release usado en las pruebas: https://github.com/tannerbruhn/llama.cpp-s10/releases/tag/s10-b12179-d480e84
- Recetas de despliegue en S10: https://github.com/tannerbruhn/s10-llm-recipes
