# tawer12/qwen3-4b-sudoku-missing16-20-binary-rl

## Resumen

Qwen3-4b-sudoku-missing16-20-binary-rl es un adaptador LoRA publicado por el usuario tawer12 sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo: se trata de un conjunto de pesos PEFT de 11,82 MB (11.815.792 bytes) que debe cargarse junto al modelo base de 4.000 millones de parametros. El adaptador esta especializado en una unica tarea: resolver tableros de Sudoku a los que les faltan entre 16 y 20 celdas, emitiendo trazas lineales de razonamiento con actualizaciones de fila.

El entrenamiento combina una fase previa de ajuste supervisado (SFT, sobre un adaptador local `trivial_missing1_15_linear_row_markdown_sft` ya incorporado en estos pesos) con una fase de aprendizaje por refuerzo de recompensa binaria: 1 si la solucion extraida coincide exactamente con la de referencia, 0 en caso contrario. El conjunto de datos de RL contiene solo 600 puzzles con 16-20 celdas vacias, y se completo una unica epoca con 75 actualizaciones del optimizador, lo que lo convierte en un experimento de investigacion mas que en un componente listo para produccion.

Su relevancia es acotada y muy especifica: sirve como ejemplo reproducible de un pipeline SFT + RL con recompensa binaria sobre un modelo pequeno, con un formato de salida estructurado y verificable (markdown con filas A-I y columnas 1-9), y con el tokenizador incluido en el repositorio. El propio autor advierte de que no se ha realizado una evaluacion sobre un conjunto de validacion independiente para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso decoder-only (Qwen3-4B-Instruct-2507) |
| Parametros totales | No disponible para el adaptador como modelo completo; el adaptador pesa 11,82 MB (BF16) y el modelo base declara 4B de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens segun su propia documentacion publica |
| Tipos de cuantizacion | No disponible. Los tensores del adaptador se guardan en BF16; no se documentan versiones GGUF ni cuantizadas del adaptador |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), con tokenizador incluido en el repositorio |
| Tamano del repositorio | 0,0 GB segun HuggingFace; archivo de adaptador de 11,82 MB |
| Libreria | peft |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Checkpoint | rl_train_missing16_20_k600_linear_row_markdown_binary_rl |
| Descargas / likes | 11 descargas, 0 likes |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado unicamente a las proyecciones `q_proj` y `v_proj` del modelo base. Con tensores en BF16 y un peso de archivo de 11,82 MB, el adaptador contiene aproximadamente 5,9 millones de parametros entrenables (estimacion aritmetica a partir del tamano del fichero). El resto del modelo permanece congelado. Al no cubrir `k_proj`, `o_proj` ni las capas MLP, la capacidad de adaptacion es deliberadamente limitada: esta pensada para reformatear la salida del modelo base hacia una tarea muy concreta, no para alterar su conocimiento general.

El entrenamiento parte de un adaptador SFT local (`trivial_missing1_15_linear_row_markdown_sft`) que ya esta incorporado en estos pesos, de modo que no es necesario descargarlo por separado. La fase de RL utilizo 600 puzzles de entrenamiento con 16-20 celdas vacias (`rl_train_missing16_20_k600.jsonl`), una sola epoca, 75 actualizaciones del optimizador, learning rate de 5e-6, acumulacion de gradiente de 8 y semilla 42. La recompensa es binaria y se calcula comparando la solucion extraida con la referencia. Durante la generacion de entrenamiento se uso temperatura 0,4, top-p 1,0 y un maximo de 1.536 tokens nuevos. El checkpoint se guardo, segun la marca de tiempo del archivo de pesos original, el 10 de abril de 2026 a las 17:12:06 UTC.

La innovacion tecnica no esta en la arquitectura, sino en el protocolo de la tarea: el modelo recibe el tablero como tabla markdown (filas A-I, columnas 1-9, con `X` en las celdas vacias) y debe emitir una traza lineal con los campos `STATE`, `FILL`, `Updated Row`, `SOLVED` y `FINAL_STATE`. Los prompts se tokenizan directamente, sin aplicar plantilla de chat, para mantener la coherencia entre entrenamiento e inferencia. La configuracion completa se guarda en `resolved_linear_binary_rl_config.json` y las instrucciones del formato en `linear_row_markdown_trace_instruction.txt`.

## Capacidades

- Resolucion de Sudoku con 16-20 celdas vacias, mediante trazas lineales de actualizacion de fila.
- Generacion de salida estructurada y verificable de forma programatica (`STATE`, `FILL`, `Updated Row`, `SOLVED`, `FINAL_STATE`).
- Interpretacion de tableros en formato de tabla markdown con filas A-I y columnas 1-9, usando `X` para celdas vacias.
- Razonamiento paso a paso del tipo cadena de pensamiento, limitado al dominio del Sudoku.
- Capacidades generales de generacion de texto y conversacion heredadas del modelo base Qwen3-4B-Instruct-2507 (no reforzadas ni evaluadas en este adaptador).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso fuera del Sudoku: no disponible; el entrenamiento se limita a una traza lineal especifica.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible.

## Casos de uso

- Validacion de pipelines de RL con recompensa verificable: sirve como referencia reproducible para montar un bucle SFT + RL donde la recompensa se calcula con un verificador exacto (la solucion del Sudoku), sin necesidad de un modelo de recompensa.
- Generacion de datos sinteticos de razonamiento: el adaptador produce trazas paso a paso con formato fijo, utiles como datos de entrenamiento para modelos mayores o para estudiar como un modelo pequeno estructura el razonamiento.
- Investigacion sobre adaptadores de bajo rango: con solo 5,9 millones de parametros entrenables sobre `q_proj` y `v_proj`, es un caso de estudio sobre hasta que punto un LoRA minimo puede especializar un modelo de 4B en una tarea formal.
- Benchmarking de tecnicas de RL sobre tareas con solucion unica: al tener recompensa binaria y comprobable, permite comparar variantes de learning rate, acumulacion de gradiente o numero de actualizaciones sin ambiguedad en la metrica.
- Demostracion docente de formato estructurado: el protocolo markdown con campos fijos es un ejemplo claro de como forzar salidas parseables sin recurrir a gramaticas o JSON schema.
- Verificacion de soluciones de Sudoku en un sistema mayor: el adaptador puede actuar como generador de candidatos cuyo resultado se valida despues con un solver clasico, usando el solver como filtro de correccion.
- Pruebas de carga y despliegue de adaptadores PEFT: util para validar flujos de `PeftModel.from_pretrained` sobre vLLM u otros servidores con soporte multi-LoRA, dado el tamano minimo del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la subida documenta la ejecucion de entrenamiento guardada y que no reporta una evaluacion completada sobre un conjunto reservado para este checkpoint. El unico dato de rendimiento indirecto es la recompensa binaria de entrenamiento sobre 600 puzzles con 16-20 celdas vacias, sin valor de exactitud publicado.

## Requisitos de hardware

- El adaptador en si ocupa 11,82 MB, por lo que el cuello de botella es siempre el modelo base de 4B.
- VRAM estimada para el modelo base: en BF16, en torno a 8-9 GB para pesos mas cache KV; en cuantizacion de 8 bits, aproximadamente 4-5 GB; en 4 bits, aproximadamente 2,5-3 GB. Estas cifras son estimaciones a partir del tamano del modelo base y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: A100, H100 o L40S para servir varias peticiones concurrentes; RTX 4090, RTX 3090 o RTX 4080 para uso individual en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM si se cuantiza el modelo base; en BF16 se recomienda 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090).
- Opciones de despliegue: `transformers` + `peft` + `accelerate` (es el flujo documentado, con el script `inference.py` incluido). Para servidores con soporte de adaptadores LoRA en caliente puede usarse vLLM; llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no documentado en la model card.
- Dependencias declaradas: Python con `torch`, `transformers>=5.4.0`, `peft>=0.18.1`, `accelerate` y `huggingface_hub`.
- Latencia y throughput: no disponible. La unica referencia de coste de generacion es el limite de 1.536 tokens nuevos usado durante el entrenamiento, que da una idea del orden de magnitud de una traza completa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tawer12/qwen3-4b-sudoku-missing16-20-binary-rl | Adaptador LoRA especializado en Sudoku | 4B (base) + ~5,9 M entrenables | No disponible (base: 262.144 tokens segun su documentacion) | No disponible | HuggingFace, 11 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base sin adaptador) | Transformer denso de proposito general | 4B | 262.144 tokens segun su documentacion publica | Apache 2.0 segun su model card | Ampliamente disponible |
| Adaptadores SFT de Sudoku similares del mismo autor | Adaptador LoRA | 4B (base) + LoRA | No disponible | No disponible | No disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estas opciones, ya que el autor no publica evaluacion sobre conjunto reservado. Cualquier comparacion cuantitativa con otros solucionadores de Sudoku (neurales o clasicos) queda fuera del alcance de la informacion disponible.

## Limitaciones y advertencias

- No hay evaluacion sobre conjunto reservado: el adaptador no reporta exactitud en validacion o test, solo la ejecucion de entrenamiento. No se puede afirmar su tasa de acierto real.
- Entrenamiento Extremadamente reducido: 600 puzzles, 1 epoca y 75 actualizaciones del optimizador. El riesgo de sobreajuste al conjunto de entrenamiento y de mala generalizacion a tableros con otra distribucion de celdas vacias es alto.
- Dominio muy estrecho: entrenado solo para 16-20 celdas vacias. No hay garantia de funcionamiento con menos celdas vacias, con tableros invalidos o con variantes del Sudoku (diagonal, 16x16, killer).
- Formato estricto y sin plantilla de chat: los prompts deben construirse con `linear_row_markdown_trace_instruction.txt` y tokenizarse directamente. Aplicar una plantilla de chat o alterar el formato puede degradar la salida.
- Idioma: solo se declara ingles, tanto en las instrucciones como en el formato de salida.
- Riesgo de alucinacion y de trazas inconsistentes: al ser una tarea formal con recompensa binaria, el modelo puede producir trazas con formato valido pero solucion incorrecta o contradictoria respecto a los `STATE` intermedios. El autor recomienda verificar las soluciones contra las reglas del Sudoku y las pistas originales.
- Licencia del adaptador no disponible: no se puede confirmar si se permite uso comercial. Ademas, el uso queda condicionado por la licencia del modelo base, que debe consultarse por separado.
- Inconsistencia de fechas: el repositorio figura como creado y actualizado el 18 de septiembre de 2026, mientras que el checkpoint se guardo el 10 de abril de 2026. Conviene tratar las marcas temporales con cautela.
- Artefacto incompleto por si solo: no incluye los pesos del modelo base ni los datos de entrenamiento, de modo que no es reproducible sin descargar el modelo base por separado.
- Sesgos: no disponible.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/tawer12/qwen3-4b-sudoku-missing16-20-binary-rl
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o el conjunto de datos de entrenamiento: los enlaces obtenidos correspondian a productos de cocina sin relacion alguna. No hay papers, blogs, repositorios ni demos adicionales que citar.
