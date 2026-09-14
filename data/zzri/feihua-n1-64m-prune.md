# ZZRI/Feihua-n1-64M-prune

## Resumen

Feihua-n1-64M-prune es un modelo de lenguaje denso de 49.163.136 parametros (49,16 M) publicado por el usuario ZZRI en HuggingFace, derivado del modelo base jingyaogong/minimind-3 (familia Qwen3) y obtenido mediante poda estructural por capas sobre Feihua-n1-64M. Se trata de un modelo experimental cuyo objetivo declarado no es resolver una tarea productiva, sino servir de banco de pruebas reproducible para tecnicas de pruning en modelos muy pequenos: el autor lo describe como un modelo de "废话文学" (literatura de relleno, texto sin carga informativa), disenado para generar verborrea coherente en chino sin afirmar hechos.

La relevancia tecnica del artefacto esta en el experimento que documenta: se aplica un analisis de importancia de capa tipo ShortGPT (arXiv:2403.03853) sobre un transformer de solo 8 capas, se eliminan las capas 3 y 5 por ser las mas cercanas a la identidad (Block Importance 0.229 y 0.217) y se comprueba que en modelos de este tamano el pruning agresivo destruye la capacidad generativa: la perplejidad pasa de 120 a 1795 tras la poda en crudo. Un SFT de recuperacion de un solo epoch (79 segundos en una P100) la devuelve a 660,2, lo que constituye la conclusion empirica central: en regimen de 21 MB, la profundidad importa mas que el ancho de bits de la cuantizacion.

El modelo se distribuye tanto en safetensors como en cuatro cuantizaciones GGUF (Q4_K_M, IQ4_XS, IQ2_M, IQ1_S) que ocupan entre 31 MB y 17 MB, con lo que la inferencia es viable en CPU, en dispositivos embebidos y en movil. La licencia es Apache-2.0 y el unico idioma declarado es el chino (zh).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (base minimind-3); 6 capas tras la poda |
| Parametros totales | 49.163.136 (49,16 M), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; el ejemplo oficial de llama.cpp arranca con `-c 8192` |
| Tipos de cuantizacion | GGUF: Q4_K_M, IQ4_XS, IQ2_M, IQ1_S (generadas con importance matrix); safetensors sin cuantizar |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Capas | 6 (frente a 8 del modelo original) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | jingyaogong/minimind-3 |
| Modelo de origen | ZZRI/Feihua-n1-64M (63,91 M de parametros, 8 capas) |
| Etiquetas relevantes | minimind, qwen3, pruned, nonsense, 废话文学, gguf, imatrix, conversational, endpoints_compatible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Qwen3 heredado de minimind-3, reducido de 8 a 6 capas. La poda sigue el metodo ShortGPT: se realiza una pasada forward sobre el corpus de "废话" y se calcula la Block Importance de cada capa como la diferencia de similitud coseno entre la entrada y la salida del bloque, de modo que las capas cuyo comportamiento se aproxima a una aplicacion identidad se consideran redundantes. Las capas 3 y 5 resultaron las mas prescindibles (BI 0,229 y 0,217) y se eliminaron, renumerando el resto; el recuento de parametros cayo un 23 %, de 63,91 M a 49,16 M.

El entrenamiento posterior consistio en un unico epoch de SFT de recuperacion sobre datos de "废话", ejecutado en 79 segundos sobre una GPU P100. Sin ese paso, el modelo podado degeneraba en "ensalada de palabras" con PPL 1795,4; con el, la PPL se situa en 660,2 en el mismo formato IQ2_M de 21 MB. No se documenta en la informacion disponible el numero de tokens de preentrenamiento del modelo base, la composicion exacta del dataset, ni el uso de RLHF o DPO. La innovacion tecnica destacable es metodologica, no arquitectonica: la cuantizacion GGUF se ha generado con importance matrix (imatrix) y el estudio comparativo demuestra que, a igualdad de tamano en disco (21 MB), conservar 6 capas a 2,7 bits (PPL 660,2) supera a conservar 8 capas a 1,56 bits (PPL 938,6).

## Capacidades

- Generacion de texto conversacional en chino, con estilo de "废话文学": fluidez superficial y contenido informativo nulo por diseno.
- Generacion de relleno textual extenso: el modelo esta entrenado especificamente para producir parrafos largos sin carga factual.
- Conversacion multi-turno: la etiqueta `conversational` indica formato de dialogo, y el ejemplo oficial lo ejecuta con llama.cpp en modo servidor.
- Cuantizacion extrema: funciona con menos de 32 MB en disco y con cuantizaciones de 1,56 a 2,7 bits efectivos.
- Compatibilidad con HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`).
- Capacidades declaradas por omision explicita: no busca tool calling, no realiza function calling, no implementa agentes ni razonamiento multi-paso, no procesa vision ni audio y no genera codigo ni matematicas.
- Multilingue: solo chino. No hay soporte declarado de otros idiomas.

## Casos de uso

- Pruebas de cuantizacion extrema en pipelines propios: sirve para validar como se comporta un runtime (llama.cpp, Ollama) con ficheros GGUF de 17 a 31 MB, medir perplejidad y comparar el efecto de IQ1_S frente a Q4_K_M sin coste de GPU.
- Docencia y divulgacion de tecnicas de pruning: el modelo documenta paso a paso la importancia de capa, la poda de bloques y el SFT de recuperacion, con numeros de PPL antes y despues, lo que lo convierte en un caso de estudio reproducible en una asignatura de eficiencia de modelos.
- Benchmark de inferencia en hardware embebido: con 17 MB en IQ1_S cabe en microcontroladores de gama alta, Raspberry Pi o moviles, y permite medir latencia y consumo reales en CPU sin depender de aceleradores.
- Generacion de texto de relleno para pruebas de interfaz: al producir texto continuo sin afirmaciones verificables, es util como generador de placeholders en demos de UI, tests de scroll infinito o pruebas de carga de front-end.
- Cliente ligero de demostracion de endpoints: la etiqueta `endpoints_compatible` permite desplegarlo como endpoint de prueba para verificar integraciones HTTP, streaming de tokens y manejo de timeouts sin gastar presupuesto de inferencia.
- Comparativa de metodologias de cuantizacion: el repositorio incluye cuatro variantes con PPL medida sobre el mismo corpus, lo que permite reproducir el trade-off tamano/perplejidad y decidir el punto de corte para un despliegue concreto.
- Analisis de fallo de modelos minimos: la salida del fichero IQ1_S ilustra de forma controlada como degenera un modelo sometido a doble castigo (poda mas 1 bit), util para estudiar modos de fallo en lugar de rendimiento en tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos son de perplejidad (PPL) sobre el corpus de "废话" propio del autor, medidos con el propio modelo.

Comparativa de estrategias a igual tamano en disco (21 MB), segun el autor:

| Estrategia | Ancho de bits | PPL (menor es mejor) |
|---|---|---|
| 8 capas @ IQ1_S | 1,56 bit | 938,6 |
| 6 capas @ IQ2_M, poda en crudo | 2,7 bit | 1795,4 |
| 6 capas @ IQ2_M, poda + SFT de recuperacion | 2,7 bit | 660,2 |

Matriz de cuantizaciones del modelo podado y recuperado:

| Fichero | Tamano | PPL | Estado declarado |
|---|---|---|---|
| `gguf/feihua-v6-prune6-heal-Q4_K_M.gguf` | 31 MB | 468,0 | estable |
| `gguf/feihua-v6-prune6-heal-IQ4_XS.gguf` | 27 MB | 486,1 | recomendado |
| `gguf/feihua-v6-prune6-heal-IQ2_M.gguf` | 21 MB | 660,2 | limite de uso |
| `gguf/feihua-v6-prune6-heal-IQ1_S.gguf` | 17 MB | 2114,4 | degenerado, "escribe poesia" |

Ejemplo de salida sin filtrar del fichero de 17 MB, aportado por el autor: "这个机器，就是那个叫叫什么。你问问，它有名问？……所以，它叫寇。"

## Requisitos de hardware

- Inferencia en safetensors: aproximadamente 100 MB en bf16/fp16 y 200 MB en fp32 para los 49,16 M de parametros (estimacion derivada del recuento de parametros, no publicada por el autor).
- Inferencia en GGUF: entre 17 MB (IQ1_S) y 31 MB (Q4_K_M) de pesos en disco; el consumo de memoria depende de la longitud de contexto configurada en la ventana KV.
- GPU recomendadas: no se especifica ninguna; el modelo es funcionalmente CPU-only. No aporta ventaja usar A100, H100 ni RTX 4090, salvo para pruebas de throughput masivo en lote.
- GPU de entrenamiento documentada: una P100 completo el epoch de SFT de recuperacion en 79 segundos.
- Cabe en cualquier GPU de consumo: incluso en aceleradores integrados, iGPU y SoC moviles. Tambien es viable en Raspberry Pi y en hardware embebido.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), llama.cpp con `llama-server`, y cualquier runtime compatible con GGUF como Ollama. El comando documentado es `llama-server -m feihua-v6-prune6-heal-IQ4_XS.gguf -c 8192`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Formato | PPL en el corpus del autor |
|---|---|---|---|---|---|---|
| ZZRI/Feihua-n1-64M-prune | 49,16 M | 6 | no disponible | Apache-2.0 | safetensors, GGUF | 660,2 (IQ2_M) / 468,0 (Q4_K_M) |
| ZZRI/Feihua-n1-64M | 63,91 M | 8 | no disponible | no disponible | no disponible | 938,6 (IQ1_S) |
| jingyaogong/minimind-3 | no disponible | no disponible | no disponible | Apache-2.0 (heredada por el derivado) | no disponible | no disponible |

No se dispone de datos de rendimiento en tareas estandar para ninguno de los tres modelos, por lo que la comparacion se limita al recuento de parametros, la profundidad y la perplejidad sobre el corpus especifico del autor. Los resultados no son extrapolables a benchmarks de conocimiento, razonamiento o codigo.

## Limitaciones y advertencias

- Objetivo deliberadamente no informativo: el modelo genera "废话" (texto sin carga informativa) por diseno; no debe emplearse en tareas que requieran precision factual, razonamiento, codigo o matematicas.
- Perplejidad muy alta incluso en su mejor cuantizacion (468,0 en Q4_K_M), varios ordenes de magnitud por encima de un modelo de uso general; el propio autor califica la variante IQ1_S de degenerada.
- La poda introduce tartamudeo leve en algunas respuestas, documentado por el autor como efecto secundario del recorte a 21 MB.
- Idioma unico: chino. No hay garantia de comportamiento coherente en castellano ni en ninguna otra lengua.
- No hay evidencia de sesgos sociales medidos, pero tampoco de ninguna evaluacion de sesgo, toxicidad o robustez; el autor afirma que el modelo no puede producir contenido danino porque no afirma hechos, lo cual es una declaracion cualitativa, no un resultado de evaluacion.
- Riesgo de alucinacion: bajo en el sentido de que no afirma hechos verificables, pero el texto no debe interpretarse como informacion fiable en ningun caso.
- Licencia Apache-2.0, que permite uso comercial y modificacion con atribucion; conviene conservar el aviso de licencia y el reconocimiento a minimind y ShortGPT.
- Madurez del artefacto: cero descargas y cero likes en el momento de la ficha, sin pipeline declarado ni validacion por terceros.
- Modelo base: se apoya en jingyaogong/minimind-3, cuyo comportamiento, contexto y limitaciones no se detallan en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/ZZRI/Feihua-n1-64M-prune
- Modelo original sin podar: https://huggingface.co/ZZRI/Feihua-n1-64M
- Modelo base: https://huggingface.co/jingyaogong/minimind-3
- Repositorio minimind: https://github.com/jingyaogong/minimind
- Paper del metodo de poda ShortGPT: https://arxiv.org/abs/2403.03853
- Fuente del corpus de relleno BullshitGenerator: https://github.com/menzi11/BullshitGenerator
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a servicios de correo electronicos ajenos al tema.
