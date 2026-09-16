# tinyopsec/mistral-orpo-capybara-7k-GGUF

## Resumen

Mistral-ORPO-Capybara-7k GGUF es un repositorio de cuantizaciones en formato GGUF del modelo kaist-ai/mistral-orpo-capybara-7k, publicado por el usuario tinyopsec en HuggingFace. El modelo subyacente es un ajuste fino de Mistral-7B-v0.1 realizado por KAIST AI mediante ORPO (Odds Ratio Preference Optimization) sobre el dataset Capybara DPO, segun la model card del propio repositorio. El repositorio incluye once variantes de cuantizacion, desde F16 (~14 GB) hasta Q2_K (~2 GB), lo que permite ejecutar el modelo tanto en GPUs de gama alta como en CPU.

La relevancia de esta publicacion es practica: convierte un ajuste academico de 7,24 mil millones de parametros en artefactos listos para inferencia local con llama.cpp, llama-cpp-python, LM Studio u Ollama, sin necesidad de infraestructura de servidor. El propio autor del metodo ORPO reporta 15,9 % en AlpacaEval 2.0 (LC), 7,44 en MT-Bench y 58,27 % en IFEval Inst-Strict para el modelo base, cifras modestas frente a modelos actuales pero razonables para un fine-tuning entrenado en 2,5 horas sobre cuatro A100.

Se trata de un modelo denso, solo texto y solo ingles, con licencia MIT declarada y sin resultados de benchmarks propios de las versiones cuantizadas. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha, por lo que no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Mistral-7B-v0.1 (no se detalla en la model card del repositorio GGUF) |
| Parametros totales | 7.241.732.096 (~7,24 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; corresponde a la del modelo base Mistral-7B-v0.1 (8.192 tokens). Los ejemplos del autor usan n_ctx=2048 |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (heredada del modelo base, que a su vez deriva de Mistral-7B-v0.1 con licencia Apache-2.0) |
| Formato de pesos | GGUF (11 ficheros); el modelo base se distribuye en safetensors |

Detalle de variantes y tamanos declarados por el autor:

| Fichero | Bits | Tamano | VRAM en GPU | RAM en CPU |
|---|---|---|---|---|
| model_f16.gguf | 16 | ~14 GB | ~14 GB | ~17 GB |
| model_q8_0.gguf | 8 | ~7,5 GB | ~8 GB | ~10 GB |
| model_q6_k.gguf | 6 | ~5,8 GB | ~6,5 GB | ~8 GB |
| model_q5_k_m.gguf | 5 | ~4,8 GB | ~5,5 GB | ~7 GB |
| model_q5_k_s.gguf | 5 | ~4,6 GB | no disponible | no disponible |
| model_q4_k_m.gguf | 4 | ~3,8 GB | ~4,5 GB | ~6 GB |
| model_q4_k_s.gguf | 4 | ~3,6 GB | no disponible | no disponible |
| model_q3_k_l.gguf | 3 | ~3,0 GB | no disponible | no disponible |
| model_q3_k_m.gguf | 3 | ~2,9 GB | ~3,5 GB | ~5 GB |
| model_q3_k_s.gguf | 3 | ~2,7 GB | no disponible | no disponible |
| model_q2_k.gguf | 2 | ~2,0 GB | ~2,5 GB | ~3,5 GB |

El tamano total del repositorio es de 60,0 GB.

## Arquitectura y entrenamiento

La arquitectura corresponde a Mistral-7B-v0.1, un transformer decoder-only denso sin mezcla de expertos. Sobre esa base, KAIST AI aplico ORPO (Odds Ratio Preference Optimization), un metodo de optimizacion de preferencias monolitico que combina el ajuste supervisado y la alineacion de preferencias en una sola fase y sin modelo de referencia, segun el paper arXiv:2403.07691 de Jiwoo Hong, Noah Lee y James Thorne. El entrenamiento se realizo sobre el dataset Capybara DPO (7.000 ejemplos de preferencia) y duro 2,5 horas en cuatro GPU A100, segun la model card.

No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases adicionales de RLHF o DPO posteriores. Tampoco se especifican innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal) asociadas a esta cuantizacion; las variantes GGUF se generan con el esquema estandar de llama.cpp (K-quants y Q8_0/F16) y no alteran la arquitectura, solo la precision de los pesos.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta ajustado con formato de chat tipo Mistral (etiquetas `[INST] ... [/INST]`), tal y como reflejan los ejemplos de llama.cpp y llama-cpp-python del autor.
- Razonamiento basico y respuesta a instrucciones: 58,27 % en IFEval Inst-Strict y 7,44 en MT-Bench, lo que indica cumplimiento razonable de instrucciones verificables en tareas de un solo turno.
- Generacion de texto libre, resumen, redaccion y reescritura, siempre que se use la plantilla de chat adecuada.
- Conversacion multi-turno: soportada por el pipeline de text-generation y por el formato de chat, con la limitacion de contexto del modelo base.
- Capacidades multilingues: limitadas al ingles segun la model card; el modelo base Mistral-7B-v0.1 tiene exposicion multilingue residual, pero el ajuste de preferencias se hizo sobre datos en ingles.
- Tool calling / function calling: no disponible y no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay evidencia de entrenamiento especifico para uso agentico.
- Capacidades especiales: no hay modo thinking, vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener dialogos de varios turnos en una maquina de sobremesa usando la variante Q4_K_M (~3,8 GB) o Q5_K_M (~4,8 GB), sin enviar datos a servicios externos.
- Despliegue en CPU y hardware sin GPU: la variante Q2_K ocupa ~2 GB de disco y ~3,5 GB de RAM, lo que permite ejecutarlo en portatiles modestos, mini-PC o incluso placas tipo Raspberry Pi de gama alta mediante llama.cpp.
- Entornos con requisitos de privacidad o air-gapped: al ser un GGUF ejecutable de forma totalmente local y con licencia MIT, encaja en instalaciones on-premise donde no se permite trafico saliente ni uso de APIs de terceros.
- Prototipado rapido de productos de chat: el repositorio ofrece once niveles de calidad/tamano, lo que permite ajustar la relacion coste/calidad durante el desarrollo sin cambiar de modelo ni de pipeline.
- Evaluacion y reproduccion de tecnicas de alineacion: util como artefacto de referencia para comparar el comportamiento de ORPO frente a otros metodos (DPO, PPO) en un mismo modelo base de 7B.
- Estudio del impacto de la cuantizacion en calidad: al existir desde F16 hasta Q2_K del mismo ajuste, permite medir la degradacion de metricas como IFEval o MT-Bench segun el nivel de bits, con un coste de hardware controlado.
- Generacion de textos auxiliares de bajo riesgo: borradores, resumenes, reformulaciones y clasificacion simple en ingles donde un error del modelo se revisa antes de publicarse.
- Educacion y practica de idioma: tutoria de conversacion en ingles con un modelo pequeno que responde con baja latencia en GPU de consumo.

## Benchmarks y rendimiento

Los unicos datos disponibles en la informacion proporcionada corresponden al modelo base en safetensors (kaist-ai/mistral-orpo-capybara-7k); no hay evaluaciones publicadas de las versiones GGUF.

| Benchmark | Resultado |
|---|---|
| AlpacaEval 2.0 (LC) | 15,9 % |
| MT-Bench | 7,44 |
| IFEval Inst-Strict | 58,27 % |

No se han publicado resultados de benchmarks de las cuantizaciones GGUF en la informacion disponible, por lo que no se puede estimar la perdida de calidad de cada nivel de bits con datos verificables.

## Requisitos de hardware

- VRAM estimada (segun tabla del autor): F16 ~14 GB, Q8_0 ~8 GB, Q6_K ~6,5 GB, Q5_K_M ~5,5 GB, Q4_K_M ~4,5 GB, Q3_K_M ~3,5 GB, Q2_K ~2,5 GB. Hay que sumar el espacio de la cache KV, que crece con la ventana de contexto configurada.
- RAM en inferencia CPU: de ~17 GB (F16) a ~3,5 GB (Q2_K), segun el autor.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4_K_M y Q5_K_M; RTX 4080/4090 (16-24 GB) para Q6_K, Q8_0 e incluso F16 con contexto moderado; A100 40/80 GB o H100 para F16 con lotes grandes o contextos largos.
- Cabe en GPU de consumo: si. Las variantes Q4 y Q5 funcionan en GPUs de 6-8 GB con contexto reducido; Q2_K y Q3_K permiten incluso inferencia parcial o total en CPU.
- Opciones de despliegue documentadas por el autor: llama.cpp (`./main`), llama-cpp-python (con `n_gpu_layers=-1` y `chat_format="mistral"`), LM Studio y Ollama mediante Modelfile.
- Opciones no soportadas de forma nativa: vLLM y TGI no cargan GGUF como formato principal; para esos servidores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus fichas publicas y no forman parte de la informacion proporcionada; no hay cifras de benchmark comparables en el material disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| tinyopsec/mistral-orpo-capybara-7k-GGUF | 7,24 B | no especificado (base: 8.192) | MIT | GGUF | 15,9 % AlpacaEval 2.0 LC; 7,44 MT-Bench; 58,27 % IFEval |
| kaist-ai/mistral-orpo-capybara-7k (modelo base) | 7,24 B | no especificado (base: 8.192) | MIT | safetensors | identico al anterior |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF de terceros | no disponible |
| Zephyr-7B-beta | 7,24 B | no disponible | MIT | safetensors, GGUF de terceros | no disponible |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF de terceros | no disponible |

Frente a estas alternativas, la ventaja del modelo aqui descrito es la disponibilidad inmediata de once cuantizaciones GGUF con licencia permisiva; sus desventajas son el contexto corto del modelo base, el soporte unicamente en ingles y la ausencia de validacion comunitaria.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Contexto: no se especifica en la ficha del repositorio. El modelo base Mistral-7B-v0.1 trabaja con 8.192 tokens, y los ejemplos del autor usan 2.048, por lo que no es adecuado para tareas de contexto largo.
- Alucinacion: como todo modelo de 7B ajustado sobre un dataset de preferencias relativamente pequeno (7.000 ejemplos), puede generar afirmaciones falsas con seguridad alta, especialmente en dominios especializados.
- Datos de entrenamiento: el dataset Capybara DPO contiene datos sinteticos generados por modelos propietarios, lo que introduce posibles sesgos de destilacion y obligaciones de atribucion que conviene revisar antes de un uso comercial.
- Cuantizacion agresiva: las variantes Q2_K y Q3_K reducen el tamano, pero la degradacion de calidad no esta medida ni documentada en la informacion disponible.
- Ausencia de tool calling, vision o modo de razonamiento: no hay evidencia de entrenamiento para function calling ni para uso agentico.
- Licencia: el repositorio declara MIT, pero el modelo base deriva de Mistral-7B-v0.1, distribuido bajo Apache-2.0. Conviene verificar la cadena de licencias antes de un despliegue comercial.
- Procedencia: el publicador de las cuantizaciones (tinyopsec) no es la entidad que entreno el modelo (KAIST AI); se recomienda verificar los hashes de los ficheros antes de integrarlos en una cadena de suministro.
- Validacion: el repositorio no registra descargas ni likes, y las fechas de sus metadatos (creacion en 2026) no se corresponden con el ciclo de publicacion del modelo base, por lo que la trazabilidad debe confirmarse.
- Benchmarks: no existen resultados publicados de las versiones GGUF; las cifras disponibles corresponden al modelo base sin cuantizar.
- Sin garantias de latencia o throughput: no hay mediciones de rendimiento en la informacion disponible para dimensionar un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/mistral-orpo-capybara-7k-GGUF
- Modelo base: https://huggingface.co/kaist-ai/mistral-orpo-capybara-7k
- Paper de ORPO: https://arxiv.org/abs/2403.07691 (arXiv:2403.07691, "ORPO: Monolithic Preference Optimization without Reference Model", Jiwoo Hong, Noah Lee, James Thorne, 2024)
- Nota: la busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos correspondian a la plataforma de criptomonedas Gemini y no guardan relacion con esta ficha.
