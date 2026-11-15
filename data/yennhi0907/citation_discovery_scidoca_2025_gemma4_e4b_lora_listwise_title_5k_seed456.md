# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed456

## Resumen

Este repositorio contiene un adaptador LoRA denominado **citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed456**, desarrollado por el usuario `yennhi0907` como componente principal del sistema CiteDuoWise, presentado en el contexto de la tarea de citation discovery del taller SCIDOCA 2025. No se trata de un modelo de lenguaje completo, sino de un ajuste fino mediante PEFT sobre el modelo base `google/gemma-4-E4B-it`, orientado a una tarea muy concreta: decidir, dado un parrafo y un conjunto de titulos candidatos, que titulos deben citarse.

El adaptador implementa una estrategia *listwise*: se construye un unico prompt por parrafo que incluye todos los titulos candidatos y el modelo emite una respuesta Si/No para cada slot. Esta formulacion convierte el problema de recomendacion de citas en una clasificacion multiple por posicion, lo que permite aprovechar la ventana de contexto del modelo base (hasta 8192 tokens durante el entrenamiento) para evaluar todos los candidatos de forma conjunta.

El interes de esta ficha es acotado pero relevante para desarrolladores e investigadores que trabajen en recuperacion de citas cientificas, sistemas de recomendacion bibliografica o evaluacion de LoRAs especializados. El adaptador es de muy pequeno tamano (repo de 0.1 GB) y se distribuye bajo licencia Gemma, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (modelo base google/gemma-4-E4B-it) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (MAX_LEN usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizaciones del modelo base no especificadas) |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors (adapter_model.safetensors), configuracion PEFT en adapter_config.json |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=16, alpha=32 y dropout=0.05, aplicado sobre los modulos de atencion `k_proj`, `o_proj`, `q_proj` y `v_proj` del modelo base `google/gemma-4-E4B-it`. No se modifica la arquitectura del transformer subyacente; el adaptador se carga mediante la libreria `peft` y se combina con los pesos del modelo base en tiempo de inferencia.

El entrenamiento se realizo sobre el split "Train-5k" limpio (5.000 parrafos, todos los candidatos), con un protocolo concreto: orden de candidatos permutado aleatoriamente por parrafo y por epoca, MAX_LEN de 8192 tokens, learning rate 2e-4 con scheduler coseno y warm-up del 10%, batch efectivo de 16 (batch 1 x acumulacion 16), 2 epocas, seleccion del mejor checkpoint por F1 de validacion, precision bf16 y gradient checkpointing. La semilla fijada es 456. La formulacion es *listwise*: un prompt por parrafo con todos los titulos candidatos y una respuesta Si/No por slot. El codigo, prompts, split de datos y evaluacion estan disponibles en el repositorio `tathiyennhi/automatic-citation-checking` (paquete `citeduowise/`), y los logs del experimento en `experiments/gemma4_listtitle_5k_clean/`.

## Capacidades

- Recomendacion de citas cientificas en formulacion *listwise*: dado un parrafo y una lista de titulos candidatos, emite una decision Si/No por cada titulo.
- Clasificacion multiple por slot dentro de un unico prompt, aprovechando hasta 8192 tokens de contexto.
- Procesamiento de parrafos academicos con multiples candidatos en una sola pasada.
- Integracion como componente principal del sistema CiteDuoWise (junto con otros modulos del pipeline, segun la tesis referenciada).
- No se documentan capacidades generales de generacion, razonamiento, codigo, matematicas, vision, tool calling ni agentes; el adaptador esta especializado en la tarea de citation discovery.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Descubrimiento de citas en revision bibliografica**: el adaptador evalua un parrafo de un manuscrito frente a un conjunto de titulos candidatos y devuelve que titulos deberian citarse, agilizando la revision de referencias en articulos academicos.
- **Asistencia a editores y revisores**: dado un parrafo y una lista de trabajos potencialmente relevantes, el modelo senala que citas faltan o son pertinentes, reduciendo el trabajo manual de comprobacion.
- **Construccion de pipelines de recomendacion bibliografica**: al ser un componente listwise, se integra en sistemas que recuperan candidatos (por ejemplo, mediante busqueda semantica) y necesitan una etapa de reranking o decision final sobre que citas incluir.
- **Investigacion en citation recommendation**: sirve como baseline reproducible (semilla 456, protocolo documentado) para comparar estrategias listwise frente a pairwise u otras formulaciones en el taller SCIDOCA 2025.
- **Generacion de bibliografias asistida**: en herramientas de escritura academica, el adaptador puede sugerir citas relevantes para un parrafo concreto a partir de un pool de titulos previamente recuperado.
- **Evaluacion de LoRAs especializados**: por su configuracion compacta (r=16, alpha=32) y su documentacion de hiperparametros, es util como referencia para estudiar el efecto del rango, el orden de candidatos y el numero de epocas en tareas de clasificacion listwise.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona seleccion del mejor checkpoint por F1 de validacion, pero no incluye cifras concretas de F1, precision, recall ni comparaciones con otros sistemas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explicita. El adaptador LoRA ocupa 0.1 GB en el repositorio; el consumo real depende del modelo base `google/gemma-4-E4B-it`, cuyas especificaciones no se detallan en la informacion.
- **GPU recomendadas**: no disponibles en la informacion proporcionada.
- **Compatibilidad con GPU de consumo**: no disponible; depende del modelo base y de la cuantizacion empleada.
- **Opciones de despliegue**: carga mediante la libreria `peft` sobre el modelo base. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores o sistemas comparables de citation discovery, ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- **Especializacion estrecha**: el adaptador solo esta entrenado para la tarea listwise de citation discovery; no debe emplearse como modelo generativo general.
- **Dependencia del modelo base**: requiere `google/gemma-4-E4B-it`; el adaptador por si solo no es funcional.
- **Licencia Gemma**: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones adicionales frente a licencias permisivas como Apache 2.0 o MIT.
- **Riesgo de alucinacion**: aunque la tarea es de clasificacion Si/No por slot, el modelo puede producir respuestas mal formadas o inconsistentes con el formato esperado, especialmente con prompts fuera de distribucion.
- **Idiomas**: no se documenta que idiomas cubre el adaptador; el entrenamiento se realizo sobre un dataset academico (SCIDOCA) cuya composicion linguistica no se detalla.
- **Ventana de contexto**: el entrenamiento uso MAX_LEN de 8192; prompts con mas candidatos o parrafos mas largos pueden degradar el rendimiento o requerir truncamiento.
- **Sesgos**: no se documentan analisis de sesgo; al operar sobre literatura cientifica, puede heredar sesgos de cobertura del corpus de entrenamiento (infrarrepresentacion de ciertas areas, idiomas o autores).
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-15; se trata de un artefacto de investigacion, no de un modelo validado en produccion.
- **Ausencia de benchmarks publicos**: no hay cifras de rendimiento verificables en la model card, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed456
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Codigo, prompts, split de datos y evaluacion: https://github.com/tathiyennhi/automatic-citation-checking (paquete `citeduowise/`)
- Carpeta de experimento local referenciada: `experiments/gemma4_listtitle_5k_clean/` (protocolo y logs)
