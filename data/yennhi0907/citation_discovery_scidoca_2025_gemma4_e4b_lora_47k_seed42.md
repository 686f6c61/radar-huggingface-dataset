# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed42

## Resumen

El modelo `yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed42` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `google/gemma-4-E4B-it`. Lo desarrolla el usuario de Hugging Face `yennhi0907` en el contexto de la tarea 1 (citation discovery) del taller SCIDOCA 2025. Su funcion es actuar como scorer pointwise para recomendar citas bibliograficas: dado un parrafo cientifico y un candidato a referencia, el adaptador estima la probabilidad de que esa referencia sea la citada.

El adaptador es deliberadamente ligero (0,1 GB de repositorio, r=16, alpha=32) y se entrena sobre la particion completa y limpia de entrenamiento (47.166 parrafos), con hasta tres negativos por parrafo y una longitud maxima de 512 tokens. Segun la propia model card, se trata de una ejecucion suplementaria que no se utiliza en los resultados de la tesis del autor, y se conserva para posibles experimentos de seguimiento.

Su relevancia es acotada pero concreta: demuestra como un adaptador PEFT de bajo coste puede especializar un modelo instructivo de la familia Gemma 4 en una tarea cientifica de recuperacion de citas, con un protocolo reproducible (semilla 42, codigo y particiones publicados). No aporta pesos completos ni benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-E4B-it` |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32, dropout=0,05) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (MAX_LEN de entrenamiento; contexto del modelo base no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 32 con dropout de 0,05 sobre los modulos de atencion `k_proj`, `o_proj`, `q_proj` y `v_proj` del modelo base `google/gemma-4-E4B-it`. No se modifica el resto de los pesos, de modo que la inferencia requiere cargar el modelo base completo y aplicar el adaptador encima mediante la libreria `peft`.

El entrenamiento se realizo sobre la particion completa y limpia de Train (47.166 parrafos), con un maximo de tres negativos por parrafo, MAX_LEN de 512, learning rate 2e-4, batch efectivo 16, dos epocas fijas, warm-up del 10 % y seleccion del checkpoint `best` por F1 de pares en validacion. La semilla es 42. La model card no especifica la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa; tampoco se documenta el numero total de tokens procesados.

## Capacidades

- Puntuacion pointwise de pares (parrafo, referencia candidata) para recomendacion de citas.
- Recuperacion de citas en literatura cientifica dentro del marco del taller SCIDOCA 2025, tarea 1.
- Manejo de parrafos de hasta 512 tokens.
- Aprovechamiento del modo instructivo del modelo base Gemma 4 E4B-it (capacidades generales del base no documentadas en esta ficha).
- Soporte de tool calling, agentes, vision o audio: no disponible para el adaptador; depende del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Recomendacion de citas en articulos cientificos: dado un parrafo, puntuar cada referencia candidata de un repositorio y ordenarlas por probabilidad de ser la citada. Es el proposito directo del adaptador.
- Asistencia a revisores y editores: detectar parrafos con citas potencialmente ausentes o incorrectas en un manuscrito, comparando la puntuacion del adaptador frente a las referencias ya incluidas.
- Construccion de un sistema de recuperacion de literatura: usar el adaptador como re-ranker sobre los resultados de un buscador (BM25, embeddings) para afinar la seleccion final de referencias.
- Experimentos de investigacion en citation discovery: el protocolo reproducible (semilla 42, particiones y codigo publicados en `tathiyennhi/automatic-citation-checking`) permite replicar y comparar variantes.
- Generacion de bibliografias asistida: integrar el scorer en un flujo que proponga referencias relevantes a partir de un parrafo redactado por el usuario.
- Evaluacion comparativa de adaptadores LoRA: servir como linea base suplementaria frente a otros adaptadores entrenados sobre el mismo modelo base y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona seleccion de checkpoint por F1 de pares en validacion, pero no reporta cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `google/gemma-4-E4B-it` (tamano de parametros no disponible en la informacion proporcionada).
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `peft` sobre el modelo base; el autor no documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador | google/gemma-4-E4B-it | LoRA r=16 (adaptador) | 512 tokens (entrenamiento) | gemma | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos directamente comparables para la tarea de citation discovery en SCIDOCA 2025.

## Limitaciones y advertencias

- Ejecucion suplementaria: la model card indica explicitamente que no se usa en los resultados de la tesis del autor; su validacion externa es limitada.
- Sin benchmarks publicados: no hay cifras de rendimiento que permitan estimar su calidad frente a alternativas.
- Contexto limitado a 512 tokens: parrafos mas largos requieren truncado o segmentacion.
- Dependencia del modelo base: requiere descargar y ejecutar `google/gemma-4-E4B-it`, con los requisitos de hardware y las restricciones de la licencia Gemma.
- Licencia `gemma`: el uso comercial esta sujeto a los terminos de la Gemma Terms of Use, que imponen restricciones adicionales respecto a licencias permisivas.
- Idiomas y sesgos: no documentados en la informacion disponible; se desconoce el comportamiento fuera del dominio cientifico en ingles.
- Riesgo de alucinacion y sobreajuste al dataset SCIDOCA 2025: el adaptador esta especializado en un corpus concreto y puede generalizar mal a otras disciplinas o estilos de citacion.
- Sin datos de cuantizacion ni de despliegue en produccion: no se documentan formatos GGUF ni integraciones con servidores de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed42
- Repositorio de codigo, prompts y evaluacion: https://github.com/tathiyennhi/automatic-citation-checking
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
