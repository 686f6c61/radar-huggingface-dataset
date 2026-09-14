# superkuh/Qwen3.8-27B-UD-IQ3_XXS-ASCII-Condensed

## Resumen

Qwen3.8-27B-UD-IQ3_XXS-ASCII-Condensed es una build GGUF derivada de Qwen3.8-27B (Qwen team, Alibaba), publicada por el usuario superkuh. No es un reentrenamiento ni una recuantizacion: parte del fichero `UD-IQ3_XXS` de unsloth/Qwen3.8-27B-GGUF y le aplica una cirugia de vocabulario para eliminar todas las entradas que no son representables en ASCII. El objetivo declarado es reducir el tamano de las dos matrices de vocabulario (embedding y proyeccion de salida) y, con ello, ajustar el modelo a sistemas con 12 GB de VRAM.

El modelo conserva 26.090.566.656 parametros (unos 26,09 mil millones) y un total de 65 capas. Todos los pesos supervivientes son identicos bit a bit al cuantizado de origen; solo se han reindexado filas de `token_embd.weight` y `output.weight` y se ha filtrado la tabla de merges BPE. La cuantizacion sigue siendo UD-IQ3_XXS sin cambios.

Es relevante ahora porque ejemplifica una tecnica de optimizacion de despliegue poco habitual (poda de vocabulario en espacio cuantizado, sin dequantizar) aplicada a un modelo de ~27B, y porque permite ejecutar un modelo de ese tamano en GPUs de gama consumer de 12 GB a costa de renunciar por completo al multilingue. El repositorio tiene 0 descargas y 0 likes, por lo que se trata de un artefacto experimental con adopcion nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles). El GGUF contiene pesos de attention, FFN, SSM y normalizacion en 65 capas, lo que sugiere una arquitectura hibrida attention/SSM; no confirmado en la informacion disponible |
| Parametros totales | 26.090.566.656 (~26,09 B) |
| Parametros activos | No aplica (no se ha indicado que sea MoE) |
| Longitud de contexto | No disponible. El comando de ejemplo del autor usa `-c 135168` (132.000 tokens), pero no se declara como contexto nativo del modelo |
| Tipos de cuantizacion | UD-IQ3_XXS (sin cambios respecto al origen). Los tensores de vocabulario usan formato de bloque `Q2_K` (`token_embd.weight`) y `Q4_K` (`output.weight`). El repositorio de origen incluye tambien otras variantes, como UD-IQ4_XS |
| Idiomas soportados | `en` en los metadatos. El vocabulario resultante solo cubre ASCII (< 0x80), por lo que otros alfabetos no son representables |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`library_name: gguf`) |
| Tamano del repositorio | 10,4 GB |
| Tamano de vocabulario | 128.190 tokens (original: 248.320) |
| Reglas de merge BPE | 128.775 (original: 247.587) |
| Modelo base | Qwen/Qwen3.8-27B |
| Cuantizado de origen | unsloth/Qwen3.8-27B-GGUF, variante UD-IQ3_XXS |
| Autor | superkuh |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14 |
| Compatibilidad | `endpoints_compatible`, `conversational`, `text-generation` |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base en la documentacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO, etc.). Lo unico verificable es la estructura del contenedor GGUF: 65 capas y 864 tensores copiados sin modificar (attention, FFN, SSM y normalizacion), mas los dos tensores de vocabulario intervenidos. La presencia de tensores etiquetados como SSM junto a los de attention apunta a un diseno hibrido, pero el autor no detalla la arquitectura en la model card.

La innovacion tecnica de esta build es el procedimiento de poda, ejecutado integramente sobre el contenedor GGUF en espacio cuantizado, sin dequantizar ni recuantizar ningun tensor. La regla de supervivencia de tokens es: se conserva un token si es de tipo `CONTROL` (tokens especiales de plantilla de chat), si decodifica a exactamente un byte crudo (tokens de fallback a nivel de byte, que garantizan que el tokenizador pueda representar cualquier entrada) o si decodifica a una secuencia de bytes integramente ASCII (< 0x80). Cualquier token fusionado que contenga un byte no ASCII se descarta.

Sobre esa base, se copian fila a fila los bytes cuantizados de `token_embd.weight` y `output.weight` en el mismo orden relativo, se filtra la tabla de merges conservando solo las reglas cuyos dos tokens padre sobreviven, se reescriben los IDs de token especial (`bos_token_id`, `eos_token_id`, `padding_token_id`, etc.) a sus nuevas posiciones y se recalculan los offsets del fichero. El resultado pasa de 248.320 a 128.190 entradas de vocabulario, lo que elimina aproximadamente 1,23 mil millones de parametros repartidos entre las dos matrices podadas (120.130 filas x 5120 dimensiones x 2 tensores).

| Metrica | Original | ASCII-Condensed |
|---|---|---|
| Tamano de vocabulario | 248.320 | 128.190 |
| Reglas de merge | 247.587 | 128.775 |
| Filas de `token_embd.weight` | 248.320 | 128.190 |
| Filas de `output.weight` | 248.320 | 128.190 |
| Cuantizacion | UD-IQ3_XXS | UD-IQ3_XXS (sin cambios) |
| Tensores totales | 866 | 866 (864 intactos) |

## Capacidades

- Generacion de texto autoregresiva en ingles, con plantilla de chat (`conversational`) y compatibilidad declarada con endpoints.
- Conversacion multiturno con contexto largo, segun el comando de ejemplo del autor (`-c 135168`).
- Generacion de codigo y texto estructurado, siempre que la salida se mantenga en el rango ASCII imprimible.
- Funcionamiento en modo local/offline sin dependencia de APIs externas.
- Capacidades especificas del modelo base (razonamiento, matematicas, tool calling, agentes, vision, modo thinking, audio): no disponibles en la informacion proporcionada. La model card no las documenta ni las desmiente.
- Capacidades multilingues: eliminadas por diseno. El vocabulario solo contiene tokens ASCII; los alfabetos no latinos, los caracteres acentuados y los emojis ya no tienen token dedicado.
- Capacidad especial: no se documenta ninguna mas alla de la propia poda de vocabulario. El tokenizador mantiene tokens de fallback de un solo byte, de modo que puede procesar entrada no ASCII byte a byte, aunque de forma ineficiente y con degradacion de comprension.

## Casos de uso

- Inferencia local en GPU de 12 GB: con un peso de aproximadamente 10 GB, cuantizando K y V a `q4_0` y moviendo `token_embd.weight` a RAM del sistema, el modelo cabe en tarjetas como la RTX 3060 12 GB o la RTX 4070 12 GB. Es el escenario para el que el autor diseno explicitamente la build.
- Generacion de codigo en entornos air-gapped: el modelo produce codigo fuente, que es ASCII por definicion, y puede ejecutarse sin conexion en una estacion de trabajo con una sola GPU consumer. Los comentarios y cadenas en idiomas no ingleses fallaran.
- Procesado por lotes de texto en ingles: clasificacion, extraccion de entidades, resumen o normalizacion de corpus en ingles mediante `llama-cli` o `llama-cpp-python`, donde la poda de vocabulario no supone ninguna perdida funcional.
- RAG sobre documentacion tecnica en ingles: indexacion y respuesta sobre manuales, RFCs o codigo, con la ventana de contexto ampliada del comando de ejemplo y el embedding en CPU para liberar VRAM.
- Salida de JSON/YAML para pipelines: generacion de estructuras de datos para integracion en CI/CD o en colas de mensajes. El formato es ASCII y encaja con el vocabulario podado.
- Servidor de inferencia de un solo inquilino: exponer el modelo mediante `llama-server` o un Modelfile de Ollama para prototipos internos, aprovechando el tag `endpoints_compatible`.
- Investigacion en compresion de modelos: sirve como caso de estudio reproducible de poda de vocabulario sobre GGUF cuantizado. El script Perl usado por el autor esta publicado y permite replicar el experimento sobre otros modelos Qwen.
- Despliegue en edge con GPU modesta: al reducir el repositorio a 10,4 GB y permitir offload del embedding a RAM, es viable en equipos con 16 GB de RAM y 12 GB de VRAM sin swap agresivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente enlaces a retransmisiones de BBC News, sin ninguna relevancia). No se deben asumir cifras del modelo base para esta build: la poda de vocabulario altera la tokenizacion y, con ello, el comportamiento en cualquier tarea que no sea ASCII puro, aunque los pesos del transformer sean identicos.

Lo unico declarado por el autor en terminos de rendimiento es cualitativo: mover `token_embd.weight` a CPU cuesta aproximadamente un 1 % de velocidad de decodificacion, al tratarse de una operacion de tipo gather.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 10 GB (26,09 B de parametros a ~3,06 bits por peso, coherente con los 10,4 GB del repositorio). Calculo derivado, no declarado por el autor.
- VRAM objetivo: 12 GB, segun el propio autor. Encaja en RTX 3060 12 GB, RTX 4070 12 GB, RTX 4070 Ti 12 GB, RTX 4080 16 GB, RTX 4090 24 GB, A4000 16 GB, L4 24 GB.
- Fuera del rango consumer: A100 40/80 GB, H100 80 GB, L40S. Cabe de sobra, pero no aportan ventaja frente a una GPU de 16-24 GB.
- No cabe en GPUs de 8 GB sin offload parcial a RAM y penalizacion severa de velocidad.
- KV cache: no se dispone de las dimensiones de cabezas KV ni del numero de capas con cache, por lo que no se puede calcular el consumo exacto. El autor recomienda cuantizar K y V con `-ctk q4_0 -ctv q4_0` para el escenario de 12 GB.
- Offload: el comando recomendado usa `-ngl 99` (todas las capas en GPU) con `-ot "token_embd.weight=CPU"`, `-fa on` (flash attention), `-ub 128` y `-b 512`.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, LM Studio y Ollama mediante Modelfile. El autor indica que cualquier herramienta capaz de cargar `unsloth/Qwen3.8-27B-GGUF` cargara este fichero igual.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de time-to-first-token.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Cuantizacion | Tamano de pesos | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| superkuh/Qwen3.8-27B-UD-IQ3_XXS-ASCII-Condensed | 26,09 B | 128.190 | UD-IQ3_XXS (IQ3_XXS) | ~10,4 GB (repo) | Solo ASCII/ingles | apache-2.0 |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ3_XXS) | 26,09 B + 1,23 B en vocabulario | 248.320 | UD-IQ3_XXS | No disponible con precision; superior al podado | Multilingue (CJK, cirilico, arabe, emoji) | apache-2.0 |
| Qwen/Qwen3.8-27B (pesos originales) | 26,09 B (segun metadatos safetensors) | 248.320 | Sin cuantizar | No disponible | Multilingue | apache-2.0 |

Datos de rendimiento comparado (latencia, calidad, benchmarks): no disponibles para ninguno de los tres. La unica diferencia verificable entre la primera y la segunda fila es el tamano de vocabulario y, en consecuencia, el tamano de las dos matrices de vocabulario; los 864 tensores restantes son identicos byte a byte.

## Limitaciones y advertencias

- Sin salida no ASCII: el vocabulario ya no contiene tokens para letras latinas acentuadas, CJK, cirilico, griego ni emojis. El modelo puede intentar reconstruir los bytes mediante los tokens de un solo byte, pero el autor advierte de salidas corruptas o directamente rechazadas para alfabetos no ingleses.
- Entrada no ASCII mal soportada: los prompts con texto no ASCII se tokenizan byte a byte, con un consumo de tokens muy superior al normal. El modelo nunca fue entrenado con esa tokenizacion fragmentada, por lo que puede no interpretar correctamente la intencion.
- No es una recuantizacion: la calidad de cuantizacion, la velocidad de inferencia y el consumo de memoria de los bloques del transformer no cambian. El ahorro se limita a la dimension de vocabulario de los tensores de embedding y de proyeccion de salida.
- Sesgos: no documentados. Al eliminar el multilingue, el modelo hereda los sesgos del base Qwen3.8-27B pero restringidos a un unico registro linguistico, lo que puede amplificar sesgos culturales anglosajones en las respuestas. No hay evaluacion publicada.
- Alucinacion: no hay datos especificos. Al ser una poda de pesos identicos, el riesgo deberia ser equivalente al del cuantizado UD-IQ3_XXS de origen, que no se ha medido en la informacion disponible.
- Licencia: apache-2.0, permite uso comercial. Conviene verificar igualmente los terminos del modelo base Qwen/Qwen3.8-27B y del cuantizado de unsloth, ya que esta build es un derivado de ambos.
- Adopcion nula: 0 descargas y 0 likes desde su publicacion el 2026-09-14. No hay comunidad, issues ni validacion independiente.
- Reproducibilidad: depende de un script Perl alojado en el sitio personal del autor (superkuh.com), no en un repositorio con control de versiones. Si ese enlace desaparece, la tecnica deja de ser reproducible tal cual.
- Caveat de produccion: al ser un fichero GGUF podado manualmente, conviene validar el tokenizador con prompts que contengan bytes no ASCII antes de desplegarlo, ya que el comportamiento del fallback a nivel de byte no esta cuantificado por el autor.
- Sin benchmarks: no se puede afirmar que el modelo mantenga la calidad del original ni siquiera en tareas puramente inglesas, porque no se han publicado mediciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/superkuh/Qwen3.8-27B-UD-IQ3_XXS-ASCII-Condensed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizado de origen: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Script Perl de poda de vocabulario: http://superkuh.com/ascii-vocab-only-surgery-for-qwen3827b.pl.txt
- Resultados de busqueda web: sin resultados relevantes. Las unicas entradas devueltas son enlaces a retransmisiones de BBC News (bbc.com, bbc.co.uk, YouTube), sin relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
