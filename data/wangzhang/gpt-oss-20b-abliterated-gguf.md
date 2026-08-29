# wangzhang/gpt-oss-20b-abliterated-GGUF

## Resumen

El modelo `wangzhang/gpt-oss-20b-abliterated-GGUF` es una conversión a formato GGUF del checkpoint `wangzhang/gpt-oss-20b-abliterated`, una variante "abliterated" del modelo `openai/gpt-oss-20b` de OpenAI. La abliteración es una intervención en el espacio de pesos que suprime los comportamientos de rechazo (refusals) del modelo original, reduciendo la tasa de rechazo de 97/100 a 6/100 en un conjunto de evaluación de 100 prompts de jailbreak. El autor, Wangzhang Wu, publica esta versión cuantizada para facilitar su ejecución en entornos locales mediante llama.cpp, Ollama, LM Studio y otras herramientas compatibles con GGUF.

El modelo base `gpt-oss-20b` es un transformer de mezcla de expertos (MoE) con aproximadamente 20.900 millones de parámetros totales y una ventana de contexto de 128.000 tokens, según la información disponible en llm-explorer.com. Esta versión GGUF mantiene las capacidades del modelo original, incluyendo razonamiento con presupuesto configurable (`--reasoning-budget`), y añade la característica de no rechazar peticiones, lo que lo hace relevante para investigación de seguridad, red-teaming y análisis de mecanismos de alineación. La licencia es Apache 2.0, la misma que el modelo upstream de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (segun llm-explorer.com) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | en, zh (ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo original `gpt-oss-20b` de OpenAI es un transformer de mezcla de expertos (MoE) con 20,9 mil millones de parametros totales. No se dispone de informacion detallada sobre el numero de parametros activos ni sobre la composicion del dataset de entrenamiento en la documentacion proporcionada. La variante abliterated se obtuvo mediante una intervencion directa en los pesos del modelo, utilizando la herramienta Abliterix (derivada de Heretic), que edita los pesos y suprime el router MoE para eliminar los comportamientos de rechazo. Este proceso no implica reentrenamiento; se parte de los pesos BF16 del checkpoint abliterated y se convierten a GGUF mediante `convert_hf_to_gguf.py` de llama.cpp, seguido de cuantizacion con `llama-quantize`. La cuantizacion Q8_0 es funcionalmente identica al checkpoint BF16, mientras que Q4_K_M anade un pequeno ruido de cuantizacion adicional pero conserva el efecto de la abliteracion, verificado en un conjunto de 15 prompts de jailbreak en ingles y chino.

## Capacidades

- Generacion de texto en ingles y chino, con soporte de chat mediante la plantilla "harmony" incluida en el GGUF.
- Razonamiento configurable mediante el parametro `--reasoning-budget`, que permite ajustar el esfuerzo de razonamiento del modelo.
- Ausencia de rechazos en prompts que el modelo base consideraria daninos o inapropiados, debido a la intervencion abliterated.
- Compatibilidad con herramientas que soporten GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui.
- No se ha confirmado soporte explicito de tool calling o function calling en la informacion proporcionada; el modelo base de OpenAI podria tenerlo, pero no esta documentado en esta version.
- Capacidades multilingues limitadas a ingles y chino segun la etiqueta de idiomas.

## Casos de uso

- Investigacion de seguridad de IA: el modelo permite estudiar como los mecanismos de rechazo se codifican en los expertos de un MoE, y como la intervencion en el router afecta al comportamiento global. Es adecuado para analisis de mecanismos de alineacion.
- Red-teaming de sistemas de IA: al no rechazar peticiones, se puede utilizar para generar prompts adversarios y evaluar la robustez de otros modelos o sistemas de moderacion.
- Analisis de sesgos y comportamientos no alineados: permite examinar que tipo de contenido produce el modelo cuando se eliminan las restricciones, util para entender los limites de la alineacion.
- Generacion de texto creativo sin restricciones: para proyectos de ficcion, escritura experimental o generacion de dialogos donde se requiera evitar la autocensura, siempre dentro de un marco legal y etico.
- Desarrollo de chatbots de investigacion: se puede integrar en entornos de laboratorio para probar interacciones conversacionales sin filtros, con fines academicos.
- Evaluacion de cuantizacion en modelos MoE: al disponer de cuantizaciones Q8_0 y Q4_K_M, se puede medir el impacto de la cuantizacion en la calidad de generacion y en la preservacion del efecto abliterated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la tasa de rechazo en un conjunto de 100 prompts de jailbreak: el modelo base rechaza 97 de 100, mientras que la version abliterated rechaza solo 6 de 100. Este dato se menciona en la model card del checkpoint HF y se hereda en esta version GGUF.

## Requisitos de hardware

- BF16 (42 GB): requiere al menos 48 GB de VRAM, adecuado para GPUs como A100 80GB, H100 80GB o configuraciones multi-GPU. Tambien puede ejecutarse en CPU con gran cantidad de RAM.
- Q8_0 (22 GB): cabe en una GPU de 24 GB como RTX 4090, A5000 o similar. Es la opcion recomendada por el autor para calidad cercana a la perdida nula.
- Q4_K_M (15 GB): cabe en GPUs de 16 GB como RTX 4080, RTX 3090 o en configuraciones de CPU con 16 GB de RAM. Es la opcion mas ligera con buena relacion calidad/tamano.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, KoboldCpp, text-generation-webui. Tambien se puede usar con la API de llama.cpp para integracion en aplicaciones.
- Latencia y throughput: no se proporcionan datos especificos; dependen del hardware y de la cuantizacion elegida. En general, Q4_K_M ofrecera mayor velocidad que Q8_0 y BF16 en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Caracteristica principal |
|---|---|---|---|---|---|
| gpt-oss-20b (OpenAI) | 20,9 B (MoE) | 128K | Apache 2.0 | safetensors | Modelo base con alineacion estandar |
| gpt-oss-20b-abliterated (wangzhang) | 20,9 B (MoE) | 128K | Apache 2.0 | safetensors | Variante sin rechazos |
| gpt-oss-20b-abliterated-GGUF (wangzhang) | 20,9 B (MoE) | 128K | Apache 2.0 | GGUF | Cuantizaciones para despliegue local |
| Mixtral 8x7B (Mistral AI) | 46,7 B (MoE) | 32K | Apache 2.0 | safetensors, GGUF | MoE con 8 expertos, contexto menor |

La comparativa se limita a caracteristicas estructurales, ya que no se dispone de datos de rendimiento en benchmarks para ninguno de estos modelos en la informacion proporcionada. La principal diferencia con el modelo base es la eliminacion de rechazos, y con Mixtral, el tamano y la longitud de contexto.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de su alineacion de seguridad; puede producir contenido inexacto, sesgado, ofensivo, explicito, peligroso o ilegal. No debe utilizarse para generar contenido danino.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en temas especializados o de actualidad.
- Limitaciones de idioma: solo se garantiza un rendimiento adecuado en ingles y chino; otros idiomas pueden tener una calidad inferior.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso debe cumplir con las politicas de uso de OpenAI para gpt-oss y con las leyes aplicables. El autor advierte que el modelo esta destinado a investigacion autorizada, red-teaming y analisis de mecanismos, no a la produccion de contenido danino.
- La cuantizacion Q4_K_M introduce ruido adicional que puede afectar ligeramente a la calidad de generacion, aunque el efecto abliterated se mantiene.
- No se ha verificado el soporte de tool calling o function calling en esta version; si se necesita esa funcionalidad, debe probarse antes de su integracion en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wangzhang/gpt-oss-20b-abliterated-GGUF
- Checkpoint abliterated (HF): https://huggingface.co/wangzhang/gpt-oss-20b-abliterated
- Modelo base de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ficha en llm-explorer.com: https://llm-explorer.com/model/wangzhang%2Fgpt-oss-20b-abliterated,17uz9XZ8FrGEetJ9QCMHL9
