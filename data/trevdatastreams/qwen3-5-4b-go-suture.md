# trevdatastreams/qwen3.5-4b-go-suture

## Resumen

`trevdatastreams/qwen3.5-4b-go-suture` es un artefacto de investigación experimental publicado por Trevor Martin (DataStreams Solutions) con coautoría declarada de un sistema de IA ("GPT-6 Astra"). No es un modelo de lenguaje completo ni un fine-tune convencional: es un paquete de conectores aprendidos ("suture") que inserta un experto externo de Go congelado (Moka) entre las capas 8 y 28 de un modelo base Qwen/Qwen3.5-4B. El flujo declarado es: texto de tablero en formato restringido → capa oculta 8 de Qwen → emisor aprendido → experto Moka congelado → receptor aprendido → capa 28 de Qwen → respuesta generada por Qwen.

El objetivo del autor es demostrar una técnica de "model stitching" con edición directa de pesos sobre estados ocultos, no ofrecer un motor de Go jugable ni un chatbot de propósito general. La model card es explícita: no hay parseo arbitrario de tableros, no hay fuerza de juego completa y los controles con experto incorrecto conservan gran parte del rendimiento, por lo que no se establece transferencia estratégica en Go ni mejora general de razonamiento.

El repositorio pesa 0.0 GB y no contiene los pesos del modelo base (que se descargan aparte, ~9 GB). La relevancia es metodológica: documenta cómo conectar módulos heterogéneos mediante tensores aprendidos y cómo medir el efecto de ediciones directas de tensores (borrado de columnas del receptor) sobre la verosimilitud de la respuesta, con scripts de reproducción que corren en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (host Qwen/Qwen3.5-4B) con conector aprendido emisor/receptor y experto externo Moka congelado insertado entre capas 8 y 28 |
| Parametros totales | No disponible para el paquete de conectores; el host declarado es Qwen/Qwen3.5-4B (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; la inferencia de referencia usa BF16 nativo con SDPA |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con avisos MIT del donante Moka y licencia Qwen upstream en `QWEN_LICENSE`) |
| Formato de pesos | safetensors (`bridge017.safetensors`, `native_base_patch.safetensors`), más binario del donante en `moka/` |

## Arquitectura y entrenamiento

La arquitectura es un *stitching* de estados ocultos sobre un transformer denso de 4B (Qwen3.5-4B). Se toma la activación de la capa 8, se proyecta mediante un emisor aprendido con compuerta, se pasa por un experto de Go congelado (Moka, distribuido como binario con manifiesto y avisos MIT) y la salida se reproyecta con un receptor aprendido hacia la capa 28 del host. El paquete incluye además `native_base_patch.safetensors`, que contiene columnas originales y editadas de la downprojection de la capa 16, necesarias para el host nativo usado en el estudio. No se declara registro de código remoto para `AutoModel`; la ejecución se hace con el script provisto.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card menciona una variante posterior de entrenamiento con tableros emparejados ("027") que aumentó la ocupación de 8 a 9 sobre 16 pero redujo la captura de 11 a 7 sobre 16 y las jugadas legales de 10 a 3 sobre 16, por lo que no es la variante por defecto. La innovación destacable es la edición directa de tensores sin gradientes: el borrado de 1.152 pesos posicionales del receptor redujo la NLL media de los tokens de respuesta un 6,91% mientras las respuestas correctas cayeron de 54/96 a 52/96; eliminar solo su media de columnas repetida redujo la NLL un 2,57% con 53/96 correctas.

## Capacidades

- Generación de respuestas condicionadas a un tablero de Go en un formato de texto restringido (véase `example.txt`); no es parseo de prosa arbitraria.
- Respuesta a preguntas factuales sobre la posición y propuesta de jugadas legales dentro del protocolo del experimento.
- Conexión aprendida de estados ocultos entre un host de lenguaje y un experto simbólico/de dominio congelado, sin salida directa del donante en inferencia.
- Edición de pesos por manipulación directa de tensores (borrado de columnas, sustitución por la media de columnas), reproducible en CPU con `reproduce_edits.py`.
- Generación greedy con cota de 24 tokens de salida y hasta 4 ficheros de prompt por llamada en el script público.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en model stitching: usar el paquete como referencia reproducible para insertar un módulo experto congelado entre dos capas de un transformer y medir el efecto sobre la perplejidad y la exactitud de la respuesta.
- Estudio de edición de pesos sin gradientes: ejecutar `reproduce_edits.py --variant remove_mean023` para generar una variante de compromiso del puente y comparar su NLL frente a la referencia 017, todo en CPU.
- Auditoría de artefactos de investigación: verificar linaje e integridad con `suture_config.json`, `source_manifest.json`, `file_manifest.json` y `cpu_package_checks.json` antes de reutilizar los tensores.
- Docencia sobre interfaces entre modelos: ilustrar con un caso concreto cómo un emisor/receptor aprendido transporta información de una representación a otra y qué se pierde cuando se alteran columnas del receptor.
- Análisis de controles negativos: replicar los controles con experto incorrecto para estudiar cuánto del rendimiento observado se explica por el host y no por el experto insertado.
- Reproducibilidad de resultados adversos y favorables: consultar `selected_results.json` y contrastarlo con las cifras de la model card (54/96 correctas, 38/64 factuales, 10/16 jugadas legales) en paneles reutilizados.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Respuestas correctas (referencia 017) | 54/96 | Ejemplos de confirmación inspeccionados repetidamente; panel reutilizado, no held-out |
| Respuestas factuales correctas | 38/64 | Mismo panel |
| Jugadas legales | 10/16 | Mismo panel |
| NLL media tras borrar 1.152 pesos del receptor | -6,91% | Respuestas correctas bajan a 52/96 |
| NLL media tras eliminar la media de columnas repetida | -2,57% | Respuestas correctas 53/96 |
| Variante 027 (tableros emparejados) | Ocupación 9/16; captura 7/16; jugadas legales 3/16 | No es la variante por defecto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que los paneles son pequeños y reutilizados y que no establecen transferencia estratégica en Go ni mejora de razonamiento general.

## Requisitos de hardware

- VRAM estimada: no disponible para el paquete de conectores; el host Qwen3.5-4B en BF16 requiere del orden de 8-9 GB solo para pesos, más activaciones y caché.
- GPU recomendadas: el trabajo original usó una RTX 3090 con BF16 nativo y SDPA; no se documentan pruebas en A100, H100 ni otras GPU.
- GPU de consumo: una RTX 3090 (24 GB) fue suficiente para la implementación de investigación; no se confirma funcionamiento en GPU con menos memoria.
- Despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama; se ejecuta con `run_native.py` sobre PyTorch y CUDA, con comprobaciones de componente y estado en CPU mediante `--verify-only`.
- Limitación crítica: la model card indica que la reproducción completa en GPU de este cargador extraído no se ha realizado todavía; los resultados guardados corresponden a la implementación de investigación original.
- Throughput y latencia: no disponibles; el script se declara explícitamente no apto como benchmark de rendimiento ni como sistema de serving general.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trevdatastreams/qwen3.5-4b-go-suture | Conectores sobre host de 4B | No disponible | Paquete de stitching experimental con experto de Go | apache-2.0 | Hugging Face, repo de 0.0 GB sin pesos base |
| Qwen/Qwen3-4B | 4B | No disponible en la información recogida | LLM denso de propósito general | No disponible en la información recogida | Hugging Face, transformers |
| Fine-tune completo de Qwen3-4B (guía Databricks) | 4B | No disponible | Receta de ajuste completo en una H100 | No disponible | Documentación Microsoft Learn |

No se dispone de datos de benchmarks comparables entre estas opciones en la información proporcionada; la comparación se limita a naturaleza, tamaño y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de Go jugable: el autor indica explícitamente que no hay fuerza de juego completa ni parseo de prosa arbitraria de tableros.
- Los controles con experto incorrecto conservan buena parte del rendimiento, lo que debilita cualquier conclusión sobre transferencia de conocimiento del experto al host.
- Los resultados provienen de paneles pequeños y reutilizados, no de conjuntos held-out; el ejemplo incluido es un tablero de entrenamiento.
- La reproducción completa en GPU del cargador público no se ha verificado; distintas formas de batch pueden alterar los resultados numéricos.
- No se declaran sesgos específicos, pero el host Qwen3.5-4B conserva los suyos y el dominio está restringido al inglés.
- Riesgo de alucinación factual en las respuestas generadas por el host, atenuado solo parcialmente por el formato restringido.
- La licencia apache-2.0 del paquete convive con avisos MIT del donante Moka y la licencia del modelo Qwen upstream; hay que revisar `NOTICE.md` y `QWEN_LICENSE` antes de uso comercial.
- El script público no es un sistema de serving: cota de 24 tokens greedy y hasta 4 prompts por llamada.
- No se declaran capacidades de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trevdatastreams/qwen3.5-4b-go-suture
- Artículo de investigación: https://datastreamssolutions.com/research/go-suture/
- Blog resumen: https://datastreamssolutions.com/blog/stitching-a-go-expert-into-qwen/
- Código y reproducibilidad: https://github.com/tcmartin/qwen-go-suture
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen3-4B (referencia de la familia): https://huggingface.co/Qwen/Qwen3-4B
- Guía de fine-tuning completo de Qwen3-4B en Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
