# zonay/qwen3-bash-v3-GGUF

## Resumen

qwen3-bash-v3-GGUF es la version cuantizada en formato GGUF de zonay/qwen3-bash-v3, un modelo especializado de traduccion de lenguaje natural a comandos Bash (NL2SH) desarrollado por el usuario zonay. Se trata de un ajuste sobre una base Qwen3 de aproximadamente 0,6B parametros (596.049.920 parametros totales), orientado especificamente a convertir peticiones en ingles a una unica instruccion de shell valida. La version GGUF publicada esta pensada para ejecutarse en CPU en Windows, Linux y macOS sin necesidad de GPU.

El modelo resuelve un nicho muy concreto: la generacion de comandos Bash a partir de descripciones en ingles. Su interes practico radica en que funciona en hardware modesto (el archivo Q4_K_M ocupa 378 MB) y ofrece una precision declarada por el autor del 96% en un conjunto de evaluacion de 500 casos y de 34/36 en 36 prompts manuales, aunque esos resultados se midieron sobre el modelo fuente en MLX y la cuantizacion Q4 suele costar entre 1 y 2 puntos.

La relevancia del modelo esta limitada por su tamano y su alcance: solo genera comandos individuales, no planes multi-paso, y esta entrenado unicamente en ingles. Aun asi, encaja bien como copiloto de terminal offline, herramienta de aprendizaje y apoyo a runbooks de operaciones donde no se dispone de GPU ni de conectividad a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen3 (detalle completo no disponible) |
| Parametros totales | 596.049.920 (aproximadamente 0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo deriva de la familia Qwen3, concretamente de una variante de aproximadamente 0,6B parametros. El modelo base zonay/qwen3-bash-v3 fue ajustado para la tarea NL2SH y posteriormente cuantizado a GGUF en formato Q4_K_M. No se dispone de informacion publica sobre el numero exacto de capas, dimensiones de atencion, estrategia de decodificacion ni si se aplicaron tecnicas como RLHF o DPO; esos datos figuran como no disponibles.

El entrenamiento se realizo sobre el dataset zonay/bash-data-nl2sh, compuesto por pares sinteticos de instruccion en ingles y comando Bash (140.000 ejemplos de entrenamiento y 2.000 de evaluacion). La composicion declarada cubre shell basico, redes (ssh, dns, NAT), herramientas de IA (ollama, lms, opencode, llamacpp, mlx, hf, vllm), desarrollo en macOS (xcode), desarrollo fullstack (JavaScript, Python, bases de datos, DevOps) y escenarios de laboratorio autorizados que incluyen operaciones destructivas y de pentest. La evaluacion empleada por el autor combina coincidencia exacta del primer comando generado con una comprobacion sintactica mediante `bash -n`.

## Capacidades

- Traduccion de lenguaje natural (ingles) a un unico comando Bash.
- Cobertura de patrones de shell basico, gestion de ficheros, permisos y procesos.
- Generacion de comandos de red: ssh, consultas DNS, configuracion NAT.
- Comandos relacionados con herramientas de IA locales: ollama, llamacpp, mlx, vllm, huggingface-cli.
- Soporte de utilidades de desarrollo en macOS, incluido xcode.
- Comandos de stack fullstack: JavaScript, Python, bases de datos y DevOps.
- Escenarios de laboratorio autorizado con operaciones destructivas y de pentest.
- Inferencia en CPU sin GPU, en Windows, Linux y macOS, a traves de Ollama, LM Studio o llama.cpp.
- Soporte de conversacion basica (tag `conversational` en el repositorio).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o planificacion de secuencias de comandos: no soportado (salida de comando unico).
- Vision, audio u otras modalidades: no soportadas.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Copiloto de terminal: el usuario describe en ingles lo que quiere hacer (por ejemplo, "list files in /tmp by newest first"), el modelo devuelve un comando Bash, el usuario lo revisa y lo ejecuta. Es adecuado por su baja latencia en CPU y su precision en patrones frecuentes.
- Herramienta de aprendizaje de Bash: sirve para que personas que estan aprendiendo shell inspeccionen comandos generados y estudien idiomas y flags habituales. La salida de un unico comando facilita la lectura.
- Redaccion de runbooks de operaciones: a partir de descripciones en lenguaje natural se pueden redactar fragmentos de comandos para documentacion interna de incidentes, siempre con revision humana previa.
- Asistente offline en servidores sin GPU: al ejecutarse en CPU y ocupar 378 MB en Q4_K_M, puede desplegarse en maquinas de produccion o entornos aislados sin acelerador y sin conexion a servicios externos.
- Apoyo en tareas de administracion de sistemas: generacion de comandos para gestion de red (ssh, DNS, NAT) y para operaciones sobre ficheros, utiles en tareas rutinarias de sysadmin.
- Integracion en flujos de desarrollo con herramientas de IA locales: al conocer comandos de ollama, llamacpp, mlx, vllm y huggingface-cli, encaja como ayuda en terminal para equipos que trabajan con modelos locales.
- Practicas de seguridad en laboratorio: permite generar comandos de pentest y operaciones destructivas en entornos de laboratorio autorizados, con la advertencia explicita de no auto-ejecutar las salidas.
- Generacion de snippets para documentacion tecnica: util para producir ejemplos de comandos en guias internas, que despues se validan manualmente antes de publicarse.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|
| big eval 500 | first-command match + `bash -n` | 482/500 (96%) |
| broad 36 hand prompts | first-command match + `bash -n` | 34/36 (94,4%) |

Los resultados corresponden al modelo fuente en MLX; el autor indica que la cuantizacion Q4 suele suponer una perdida de 1 a 2 puntos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M el archivo pesa 378 MB; se puede estimar un consumo de aproximadamente 0,5 a 1 GB de RAM o VRAM incluyendo el contexto, aunque no se publican cifras oficiales.
- GPU recomendadas: no requiere GPU. Funciona en CPU x86 o ARM moderna.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU de consumo e incluso en graficos integrados, dado su tamano.
- Opciones de despliegue: Ollama (`ollama run hf.co/zonay/qwen3-bash-v3-GGUF:Q4_K_M`), LM Studio (importando el archivo `qwen3-bash-v3-q4_k_m.gguf`) y llama.cpp (`llama-cli`).
- Configuracion de inferencia recomendada: temperatura entre 0,0 y 0,2, pidiendo un unico comando.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento NL2SH |
|---|---|---|---|---|---|
| zonay/qwen3-bash-v3-GGUF | 0,6B (596M) | no disponible | GGUF Q4_K_M | Apache 2.0 | 96% en big eval 500 (autor) |
| zonay/qwen3-bash-v3 (base) | 0,6B | no disponible | safetensors | Apache 2.0 | referencia del autor |
| Modelos generalistas tipo Qwen3 0.6B instruct | 0,6B | no disponible | safetensors / GGUF | Apache 2.0 | sin datos especificos NL2SH disponibles |

No se dispone de datos comparativos publicados frente a otros modelos especializados en NL2SH, por lo que la comparacion cuantitativa con alternativas figura como no disponible.

## Limitaciones y advertencias

- Tamano reducido (0,6B): es solido en los patrones vistos durante el entrenamiento, pero debil ante flags y opciones poco frecuentes; puede confundir verbos raros.
- Genera un unico comando, no planes multi-paso ni secuencias encadenadas.
- Las salidas marcadas como destructivas deben ser confirmadas obligatoriamente por una persona.
- Riesgo de alucinacion: puede producir comandos sintacticamente validos pero semanticamente incorrectos o peligrosos; la validacion con `bash -n` no garantiza que el comando sea seguro.
- La cuantizacion Q4_K_M puede reducir la precision entre 1 y 2 puntos respecto al modelo fuente en MLX.
- Idioma: solo ingles de entrada; las peticiones en otros idiomas no estan soportadas oficialmente.
- No se deben auto-ejecutar las salidas; el propio autor recomienda probar en sandbox (`docker run --rm --network none`, con timeout) y ejecutar comandos destructivos solo en maquinas virtuales desechables propias.
- No hay informacion publica sobre sesgos, contexto maximo ni comportamiento en produccion mas alla de lo indicado en la model card.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias ni soporte.

## Enlaces

- HuggingFace (modelo GGUF): https://huggingface.co/zonay/qwen3-bash-v3-GGUF
- Modelo base: https://huggingface.co/zonay/qwen3-bash-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/zonay/bash-data-nl2sh
- Resultado de busqueda web (no relacionado directamente con el modelo): https://github.com/shelken/awesome-stars
