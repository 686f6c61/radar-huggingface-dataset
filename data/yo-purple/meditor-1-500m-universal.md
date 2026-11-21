# Yo-Purple/Meditor-1-500M-Universal

## Resumen

Meditor-1-500M-Universal es un modelo de generacion de texto de 630 millones de parametros desarrollado por Yo-Purple, derivado de Qwen2.5-0.5B-Instruct mediante destilacion del modelo MoE propio Meditor-1-2.2B-A500M-MoE. Se distribuye como un checkpoint estandar `Qwen2ForCausalLM` (arquitectura `qwen2`) con exportaciones en BF16, safetensors y GGUF (Q8_0 y Q4_K_M), lo que permite su despliegue tanto en frameworks de inferencia de alto rendimiento como en entornos de CPU y consumer GPU con menos de 1 GB de VRAM.

El modelo forma parte de la serie Meditor, una linea de checkpoints experimentales que el autor evalua con su propio banco de pruebas UniBench-100 (100 preguntas abiertas en 10 dominios cognitivos, puntuadas de 0 a 10). Meditor-1-500M-Universal representa la version "Universal" de la primera generacion: reempaqueta el MoE nativo en un transformer denso convencional para maximizar compatibilidad con el ecosistema transformers, llama.cpp y TGI.

Su relevancia actual es acotada pero concreta: ofrece un checkpoint ultraligero, con licencia Apache 2.0 y formato estandar, util para prototipado rapido, experimentacion con tecnicas de destilacion y despliegues en hardware muy limitado. No obstante, sus resultados en UniBench-100 (2,42/10 de media, 1 % de tasa de aprobacion) sitúan su calidad muy por debajo de modelos densos de tamano similar, por lo que debe considerarse una pieza de investigacion mas que un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen2ForCausalLM`, familia `qwen2`) |
| Parametros totales | 630.167.424 (segun safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso con la arquitectura `qwen2` estandar, derivado de Qwen2.5-0.5B-Instruct. Segun la model card, se obtiene destilando el checkpoint `Yo-Purple/Meditor-1-2.2B-A500M-MoE` (un MoE de 2,22B parametros totales y 0,57B activos construido sobre el mismo backbone Qwen2.5-0.5B) de vuelta a un `Qwen2ForCausalLM` limpio. El objetivo declarado es ofrecer un checkpoint de despliegue estandar compatible con transformers, TGI, llama.cpp y LM Studio, eliminando la complejidad del enrutamiento MoE.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT adicionales. La model card menciona que el modelo se evalua con UniBench-100, un conjunto de 100 preguntas abiertas en 10 dominios cognitivos, puntuadas por `gemini-3.8-flash` con umbral de aprobado en 6,0 sobre 10. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste instructivo de Qwen2.5-0.5B-Instruct.
- Razonamiento basico y respuesta a preguntas abiertas, con calidad limitada segun los resultados de UniBench-100.
- Generacion de codigo y matematicas a nivel basico, sin datos especificos de rendimiento publicados.
- Soporte de cuantizacion GGUF (Q8_0 y Q4_K_M) para inferencia en CPU y consumer GPU.
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles, segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: el checkpoint se carga en transformers con `AutoModelForCausalLM` sin configuracion especial, lo que permite validar integraciones en minutos antes de escalar a modelos mayores.
- Despliegue en dispositivos con recursos minimos: con cuantizacion Q4_K_M ocupa menos de 1 GB de VRAM, por lo que puede ejecutarse en GPUs integradas, Raspberry Pi o portatiles sin GPU dedicada mediante llama.cpp.
- Experimentacion con destilacion de MoE a denso: sirve como caso de estudio reproducible de como un MoE de 2,22B/0,57B se reempaqueta en un denso de 630M, comparando la fidelidad de la destilacion con el modelo original.
- Generacion de texto de relleno o sintetico en entornos de test: util para pruebas de carga, benchmarks de infraestructura y validacion de pipelines de serving donde la calidad del contenido no es critica.
- Educacion y demostraciones de LLM: su tamano reducido y licencia Apache 2.0 lo hacen adecuado para talleres, cursos y tutoriales sobre inferencia local con GGUF.
- Evaluacion comparativa de cuantizaciones: el autor publica resultados en BF16 y Q4_K_M (2,42 frente a 2,35 en UniBench-100), lo que permite medir la degradacion por cuantizacion en un modelo pequeno.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| UniBench-100 (10 dominios, 100 preguntas) | Puntuacion media BF16 (/10) | 2,42 |
| UniBench-100 | Tasa de aprobacion BF16 (umbral 6,0) | 1 % |
| UniBench-100 | Puntuacion media Q4_K_M (/10) | 2,35 |
| ARC Challenge (subconjunto de 15 preguntas) | Precision | 86,7 % |
| WikiText-2 (validacion) | Perplejidad | 3,56 |

Comparativa dentro de la serie Meditor segun la model card:

| Modelo | Parametros (total / activos) | UniBench-100 medio (/10) | Tasa de aprobacion | VRAM (BF16) |
|---|---|---|---|---|
| Meditor-1 (MoE nativo) | 2,22B / 0,57B | 2,09 (37/100) | 2,7 % | 4,16 GB |
| **Meditor-1-500M-Universal** | 0,63B / 0,63B | **2,42** (100/100) | 1,0 % | 0,93 GB |
| Meditor-2-3.4B-Universal | 3,41B / 1,83B | 4,12 (100/100) | 22,0 % | 6,38 GB |
| Meditor-3-4B-MoE | 4,16B / 4,04-4,07B | 7,31 (100/100) | 69,0 % | 5,43 GiB peak |

El autor reporta una velocidad de evaluacion de 163,4 tok/s en BF16 y 171,3 tok/s en la variante cuantizada, y menciona hasta 287 tok/s con menos de 1 GB de VRAM en las exportaciones GGUF. No se han publicado resultados en MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,93 GB en BF16; menos de 1 GB en Q8_0 y Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050 Ti, RTX 3050, integradas modernas). Tambien funciona en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU dedicada o integrada de los ultimos anos.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp, LM Studio, Ollama (via GGUF), endpoints compatibles.
- Latencia y throughput: el autor declara hasta 287 tok/s en las exportaciones GGUF y 163-171 tok/s durante la evaluacion en BF16 y cuantizado. No se especifica el hardware empleado en esas mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | UniBench-100 (/10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meditor-1-500M-Universal | 0,63B | no disponible | 2,42 | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen2.5-0.5B-Instruct (modelo base) | 0,49B | 32.768 tokens (segun documentacion publica de Qwen) | no evaluado en UniBench-100 | Apache 2.0 | Hugging Face |
| Meditor-1-2.2B-A500M-MoE | 2,22B / 0,57B activos | no disponible | 2,09 (37/100) | no disponible | Hugging Face |
| Meditor-2-3.4B-Universal | 3,41B / 1,83B activos | no disponible | 4,12 | no disponible | Hugging Face |

La comparacion con Qwen2.5-0.5B-Instruct en benchmarks estandar (MMLU, HumanEval) no esta disponible en la informacion proporcionada. El modelo base de Qwen es la referencia natural por compartir backbone y licencia, pero no se han publicado metricas comparativas directas.

## Limitaciones y advertencias

- Calidad muy baja en tareas abiertas: 2,42/10 de media y 1 % de tasa de aprobacion en UniBench-100, con 0 % de tasa de resolucion unica. No es adecuado para produccion en tareas que requieran precision.
- Riesgo alto de alucinacion: la puntuacion en el dominio de "Factualidad y resistencia a la alucinacion" es de 1,32/10 segun la tabla por dominio de la model card.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Longitud de contexto no documentada; se desconoce si conserva los 32.768 tokens del modelo base.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del modelo base y de sus datos de entrenamiento, no descritos en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la baja calidad del modelo hace desaconsejable su uso en produccion sin validacion exhaustiva.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; el conjunto UniBench-100 es propio y no es un estandar de la comunidad.
- El modelo se creo en noviembre de 2026 y no se ha actualizado desde entonces; el ecosistema de modelos ligeros ha evolucionado considerablemente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Modelo base MoE: https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
- Modelo base denso: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Meditor-2-3.4B-Universal: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Meditor-3-4B-MoE: https://huggingface.co/Yo-Purple/Meditor-3-4B-MoE
- Meditor-3-4B-Universal: https://huggingface.co/Yo-Purple/Meditor-3-4B-Universal
