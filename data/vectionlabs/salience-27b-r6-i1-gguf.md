# vectionlabs/Salience-27B-R6-i1-GGUF

## Resumen

Salience 27B R6 i1 GGUF es el conjunto de cuantizaciones en formato GGUF del modelo denso vectionlabs/Salience-27B-R6, publicadas por el propio autor (vectionlabs) para su ejecucion con llama.cpp. El modelo subyacente es un transformer hibrido multimodal orientado a razonamiento, codigo y uso agentico, construido sobre Qwen3.8 (Apache-2.0) segun el autor, con soporte de entrada de imagen mediante un encoder de vision que se distribuye aparte.

Lo relevante de esta publicacion no es el modelo, sino el metodo de cuantizacion. Las versiones i1 se han generado con una importance matrix (imatrix) calculada sobre un corpus de codigo, prosa y transcripciones de tool calls, en lugar del habitual corpus de wikitexto. El repositorio incluye tanto `imatrix.dat` como `calibration-corpus.txt`, de modo que los ficheros son reproducibles con el `llama-quantize` estandar y no dependen de esquemas propietarios.

La arquitectura es hibrida: 48 de sus 64 capas usan atencion lineal con estado recurrente y solo 16 emplean atencion completa, lo que abarata la cache KV (unos 1 GB a 32 000 tokens con K y V en `q8_0`). Es un modelo denso, sin enrutador MoE, y la licencia Apache-2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal con estado recurrente en 48 de 64 capas y atencion completa en 16; denso, sin MoE; cabeza MTP (multi-token prediction); encoder de vision separado |
| Parametros totales | El nombre del modelo indica 27B. Los metadatos de safetensors del repositorio declaran 460.730.096 parametros (~0,46B), dato que no concuerda ni con el nombre, ni con el tamano de los ficheros publicados (15,7 GB en Q4_K_M), ni con el tamano de repositorio indicado (0,9 GB). Discrepancia no resuelta en la informacion disponible |
| Parametros activos | No aplica: modelo denso, sin enrutador MoE |
| Longitud de contexto | No disponible de forma explicita; el ejemplo oficial de despliegue usa `-c 32768` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, i1-Q4_K_M, i1-IQ4_XS, Q3_K_M, IQ3_M, IQ2_M, Q2_K, IQ2_XXS. Los ficheros con prefijo i1 usan importance matrix; los `_XL` aplican ademas asignacion de bits por tensor |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). El repositorio incluye `imatrix.dat` y `calibration-corpus.txt`; el encoder de vision se entrega como `mmproj-*.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de 64 capas que combina dos mecanismos de atencion: 48 capas con atencion lineal y estado recurrente, y 16 capas con atencion completa. De ahi que la cache KV solo crezca en 16 de las 64 capas, lo que reduce su coste muy por debajo de lo que sugiere el recuento de parametros. Incorpora una cabeza MTP (multi-token prediction) y, en su variante multimodal, un encoder de vision independiente que se pasa a llama.cpp con `--mmproj` y que es obligatorio para entrada de imagen e ignorado en uso solo texto.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron etapas de RLHF o DPO. Lo que si se documenta es el proceso de cuantizacion: la importance matrix se calculo con `llama-imatrix` sobre un corpus de codigo, prosa y transcripciones de tool calls; `llama-quantize` reparte despues el presupuesto de bits segun esa matriz. En los ficheros `_XL`, los grupos `attn_q`/`attn_k`, `ffn_down` y el conjunto `token_embd`/`output`/`attn_gate` se cuantizan por encima del nivel nominal. El autor indica que la proteccion de `attn_v` tiene efecto medible nulo y que proteger `ssm_alpha` empeora el modelo combinado, por lo que ninguna de las dos se protege. La cabeza MTP se fija explicitamente porque el texto de calibracion ordinario apenas la ejercita. No hubo entrenamiento consciente de cuantizacion ni ajuste fino sobre el conjunto de calibracion, y el autor no reclama paridad con ningun esquema dinamico propietario.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con formato de razonamiento tipo DeepSeek (`--reasoning-format deepseek`) y un valor por defecto de `reasoning_effort` que se activa al aplicar la plantilla de chat.
- Tool calling y function calling: la plantilla propia del modelo convierte las llamadas XML en `tool_calls` con formato OpenAI cuando se lanza con `--jinja`, opcion que el autor marca como no opcional para uso agentico.
- Uso agentico y bucles de varios pasos, con el corpus de calibracion especificamente disenado para preservar las transcripciones de tool calls bajo cuantizacion.
- Generacion de codigo, uno de los ejes declarados en las etiquetas del modelo (`code`, `agentic`).
- Procesamiento multimodal de entrada imagen-texto (`image-text-to-text`) mediante el encoder de vision `mmproj-*.gguf`.
- Contexto largo: el ejemplo oficial arranca a 32 768 tokens, con cache KV reducida gracias a la atencion hibrida.
- Multilingue: no, el modelo se declara unicamente en ingles.

## Casos de uso

- Agentes con tool calling en produccion: lanzando `llama-server` con `--jinja` se obtienen llamadas en formato OpenAI con plantilla propia del modelo, y la calibracion sobre transcripciones de tool calls busca precisamente que el bucle de agente no se degrade respecto al modelo sin cuantizar.
- Asistente de codigo integrado en CI/CD: el modelo esta etiquetado como `code` y `agentic`, por lo que puede generar parches, revisar diffs y encadenar llamadas a herramientas de compilacion o test dentro de un pipeline.
- Razonamiento multi-paso con modo thinking: el formato de razonamiento tipo DeepSeek permite separar la traza de razonamiento de la respuesta final, util en tareas de analisis donde se necesita auditar el proceso.
- Analisis de documentos escaneados y diagramas: con `--mmproj` habilitado, el modelo acepta imagenes ademas de texto, lo que cubre extraccion de datos de capturas, planos o tablas no digitalizadas.
- Procesamiento de repositorios o expedientes largos: la ventana de 32 768 tokens del ejemplo oficial, junto con una cache KV de aproximadamente 1 GB en `q8_0`, permite mantener documentos extensos en memoria en una sola GPU de 24 GB.
- Analisis de imagenes medicas o tecnicas en entorno local: al ser un modelo denso con licencia Apache-2.0 y pesos GGUF, puede desplegarse on-premise sin enviar datos a terceros.
- Atencion al cliente automatizada en ingles: conversaciones multi-turno con contexto largo, aunque la limitacion a un solo idioma restringe su uso fuera del mercado anglosajon.
- Reproducibilidad y auditoria de cuantizaciones: al publicarse `imatrix.dat` y `calibration-corpus.txt`, un equipo puede regenerar los mismos GGUF con `llama-quantize` y verificar los numeros en lugar de aceptarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y la columna de divergencia KL frente a BF16 aparece sin valor en la tabla publicada.

Los unicos datos cuantitativos de rendimiento son los relativos al propio proceso de cuantizacion:

| Fichero | Tamano | bits/parametro | KL vs BF16 |
|---|---|---|---|
| `Salience-27B-R6.i1-Q4_K_M.gguf` | 15,7 GB | 4,87 | no indicado |
| `Salience-27B-R6.i1-IQ4_XS.gguf` | 14,4 GB | 4,44 | no indicado |

El autor advierte que las cifras de KL, cuando se miden sobre secuencias cortas, subestiman la degradacion en contexto largo: en las 48 capas de atencion lineal el error se acumula a lo largo de la secuencia en lugar de quedarse local como en un transformer convencional.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB con `i1-Q4_K_M` (15,7 GB de pesos mas unos 1 GB de cache KV a 32 000 tokens en `q8_0` y margen para buffers de computo); aproximadamente 15-17 GB con `i1-IQ4_XS` (14,4 GB de pesos).
- Caben en GPU de consumo: `i1-Q4_K_M` entra en una RTX 4090 de 24 GB; `i1-IQ4_XS` o `Q3_K_M` entran en una GPU de 16 GB, aunque el autor avisa de que el margen se estrecha en cuanto se anade contexto.
- GPU profesionales: para `Q8_0` o `Q6_K` se recomienda disponer de 48 GB o mas (A6000, L40S, A100 de 80 GB); `Q5_K_M` encaja en 32 GB (V100 de 32 GB, A100 de 40 GB); a partir de ahi, H100 o A100 de 80 GB con holgura.
- Tarjetas de 12 GB: solo `IQ3_M`, con perdida de calidad visible segun el autor. De 10 GB hacia abajo: `IQ2_M`, `Q2_K` o `IQ2_XXS`, desaconsejados.
- CPU o memoria unificada: el autor recomienda `Q4_K_M`, recordando que en ese escenario el modelo completo se lee una vez por token y que, por tanto, el tamano de fichero determina directamente la velocidad.
- Opciones de despliegue: llama.cpp, tanto en modo servidor (`llama-server`) como en CLI, con las opciones `--jinja`, `--reasoning-format deepseek`, `-c 32768`, `-ngl 999`, `--cache-type-k q8_0 --cache-type-v q8_0` y `--mmproj` para vision. No hay informacion disponible sobre compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: no disponibles. El unico dato indirecto es que a `Q4_K_M` en CPU o memoria unificada el coste dominante es la lectura del fichero completo por token.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos comparables de terceros. El unico contexto de comparacion que aporta el autor es el de su propia familia y una referencia generica a modelos mas pequenos:

| Modelo | Parametros | Formato y cuantizacion | Tamano | Licencia | Comentario |
|---|---|---|---|---|---|
| Salience-27B-R6 (base) | 27B segun el nombre del autor | BF16 | no disponible | Apache-2.0 | Modelo de referencia sin cuantizar |
| Salience-27B-R6 i1-Q4_K_M | 27B segun el nombre del autor | GGUF con imatrix, 4,87 bits/parametro | 15,7 GB | Apache-2.0 | Opcion por defecto recomendada por el autor |
| Salience-27B-R6 i1-IQ4_XS | 27B segun el nombre del autor | GGUF con imatrix, 4,44 bits/parametro | 14,4 GB | Apache-2.0 | Alternativa para equipos de 16 GB de VRAM |
| Modelo denso de ~9B en Q5_K_M | ~9B | GGUF | similar a los ficheros de 27B en Q2_K | no disponible | Mencionado por el autor sin nombrarlo: a ese tamano de fichero, el modelo mayor en Q2_K no es claramente mejor |

El autor senala ademas que, por tratarse de un modelo denso, no existe enrutador MoE que corromper y por tanto no aplica el suelo de Q5/Q6 que suele exigirse a los modelos dispersos, lo que convierte a `Q4_K_M` en una eleccion legitima y no en un compromiso.

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue declarado, lo que descarta su uso directo en castellano sin ajuste adicional.
- Validacion nula por parte de la comunidad: el repositorio registra 0 descargas y 0 likes en la informacion disponible, por lo que no existen pruebas independientes de su comportamiento.
- Discrepancia de parametros: los metadatos de safetensors declaran 460.730.096 parametros frente a los 27B que sugiere el nombre y los 15,7 GB del fichero Q4_K_M. Conviene verificar el modelo real antes de planificar despliegues.
- Riesgo de alucinacion: no hay datos publicados sobre este aspecto. Al ser un modelo de razonamiento y codigo sin benchmarks asociados, la fiabilidad factual no esta cuantificada.
- Cuantizacion de baja calidad: los ficheros `Q2_K` e `IQ2_*` estan desaconsejados explicitamente por el autor, que admite que se incluyen porque la alternativa es no ejecutar el modelo.
- Degradacion asimetrica en tool calling: es la primera capacidad que se rompe bajo cuantizacion y la de mayor dispersion de error, lo que hace que el modelo pueda conversar correctamente y fallar dentro de un bucle de agente.
- Degradacion creciente con el contexto: en las 48 capas de atencion lineal el error se acumula a lo largo de la secuencia, de modo que un nivel de cuantizacion bajo puede degradarse mas en contexto largo de lo que indican las cifras medidas en secuencias cortas.
- `--jinja` obligatorio para agentes: sin esa opcion las llamadas a herramientas salen malformadas y se pierde el comportamiento por defecto de `reasoning_effort`.
- Vision condicionada: los ficheros `mmproj-*.gguf` son imprescindibles para entrada de imagen; sin ellos la funcionalidad multimodal no existe.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion siempre que se conserven los avisos de copyright y licencia. El modelo base se construye sobre Qwen3.8, tambien Apache-2.0 segun el autor, aunque no se detallan en la informacion disponible las condiciones heredadas ni los terminos de uso aceptable de ese modelo.
- Sin garantia de paridad: el autor no reclama equivalencia con esquemas de cuantizacion dinamica propietarios, y no se aplico entrenamiento consciente de cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vectionlabs/Salience-27B-R6-i1-GGUF
- Modelo base: https://huggingface.co/vectionlabs/Salience-27B-R6

No se han proporcionado en la informacion disponible enlaces adicionales a papers, blogs, repositorios de codigo o demos.
