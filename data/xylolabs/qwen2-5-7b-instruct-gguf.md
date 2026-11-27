# Xylolabs/Qwen2.5-7B-Instruct-GGUF

## Resumen

Xylolabs/Qwen2.5-7B-Instruct-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen2.5-7B-Instruct, publicada por Xylolabs para su uso con llama.cpp. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer decoder-only denso de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) orientado a generacion de texto conversacional e instrucciones. Esta version concreta solo distribuye el fichero Q4_K_M de 4,683 GB, lo que la hace directamente desplegable en GPU de consumo.

La relevancia de esta ficha radica en que el autor aporta mediciones de degradacion por cuantizacion frente a BF16 (divergencia KL y top-1 sobre WikiText-2 y un conjunto held-out), algo poco habitual en repositorios GGUF de terceros. Con Q4_K_M se obtiene un top-1 del 91,402% en WikiText-2 y del 92,353% en held-out, con una KL de 0,034830 y 0,027718 respectivamente, lo que permite evaluar el coste de precision de forma cuantitativa antes de adoptarlo en produccion.

Se trata, por tanto, de una opcion practica para servir el modelo Qwen2.5-7B-Instruct en entornos con VRAM limitada (24 GB o menos) manteniendo una ventana de contexto de 32K segun la tabla de hardware del autor. La licencia Apache 2.0 del modelo base se conserva en esta redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), pesos convertidos a GGUF |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32K (segun tabla de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | en, ko (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen2.5-7B-Instruct-Q4_K_M.gguf`, 4,683 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Qwen2.5, con 7.615.616.512 parametros. Esta publicacion no reentrena ni modifica la arquitectura: Xylolabs convierte los pesos originales de Qwen/Qwen2.5-7B-Instruct a formato GGUF y los cuantiza a Q4_K_M. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la model card original de Qwen, que el autor enlaza como referencia para el informe tecnico y la citacion.

La innovacion tecnica de esta ficha es la evaluacion de cuantizacion. El autor compara su Q4_K_M con las cuantizaciones propias de llama.cpp (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M) frente a BF16, midiendo divergencia KL y top-1 en WikiText-2 y en un conjunto held-out. Los resultados muestran que Q4_K_M se situa en KL 0,034830 (WikiText-2) y 0,027718 (held-out), mientras que Q5_K_M baja a 0,010590 y 0,008788, y Q3_K_M sube a 0,111754 y 0,089577. La ejecucion se valido con la build de llama.cpp `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior, usando `--jinja` para el chat template.

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento de varios pasos y respuesta a instrucciones complejas (capacidad del modelo base, no verificada de forma independiente en esta cuantizacion).
- Generacion de codigo y matematicas (capacidad del modelo base Qwen2.5-7B-Instruct; no se aportan benchmarks en este repo).
- Soporte de tool calling / function calling heredado del modelo base; el autor recomienda `--jinja` en llama-cli, lo que sugiere el uso del chat template con soporte de herramientas.
- Capacidades multilingues limitadas segun los metadatos del repo a en y ko; el modelo base Qwen2.5 soporta mas idiomas, pero este repositorio no los declara.
- Contexto largo de hasta 32K tokens segun la tabla de hardware del autor.
- No se declaran capacidades de vision ni audio en esta publicacion.

## Casos de uso

- Asistente conversacional autoalojado: el fichero Q4_K_M de 4,683 GB permite ejecutar el modelo en una RTX 4090 o RTX 3090 de 24 GB con 32K de contexto, adecuado para chatbots internos con conversaciones multi-turno largas.
- Generacion de codigo en pipelines de desarrollo: al heredar el comportamiento de Qwen2.5-7B-Instruct y soportar `--jinja`, puede integrarse en flujos de autocompletado o revision de codigo ejecutados en local, sin depender de APIs externas.
- Procesamiento de documentos largos: con 32K de contexto se pueden resumir contratos, informes o hilos de correo completos en una sola pasada, manteniendo los datos en infraestructura propia.
- Despliegue en estaciones de trabajo Apple Silicon: la tabla del autor indica compatibilidad con Mac Studio M5 Max y M5 Ultra (memoria unificada de 128 a 512 GB), lo que permite servir el modelo en equipos de escritorio profesionales.
- Prototipado rapido con llama.cpp: al ser un unico fichero GGUF validado con una build concreta, es util para pruebas de concepto y evaluacion de la calidad de Qwen2.5-7B antes de invertir en despliegues mayores.
- Atencion al cliente con datos sensibles: al ejecutarse en hardware propio y con licencia Apache 2.0, encaja en escenarios con requisitos de residencia de datos o sin salida a Internet.
- Evaluacion de cuantizacion: los datos de KL y top-1 permiten usar este fichero como referencia para decidir si Q4_K_M es suficiente o si conviene subir a Q5_K_M o Q6_K en funcion del margen de VRAM.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion frente a BF16 (no benchmarks de tareas como MMLU o HumanEval):

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,099 GB | 0,001288 | 98,098% | 0,001302 | 98,020% |
| llama.cpp Q6_K | 6,254 GB | 0,004518 | 96,446% | 0,004115 | 96,863% |
| llama.cpp Q5_K_M | 5,445 GB | 0,010590 | 94,990% | 0,008788 | 95,471% |
| Q4_K_M (este repo) | 4,683 GB | 0,034830 | 91,402% | 0,027718 | 92,353% |
| llama.cpp Q4_K_M | 4,683 GB | 0,034830 | 91,402% | 0,027718 | 92,353% |
| llama.cpp Q3_K_M | 3,808 GB | 0,111754 | 85,029% | 0,089577 | 86,775% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,683 GB de pesos en Q4_K_M; con cache KV para 32K de contexto el consumo real es mayor y depende de la implementacion.
- GPU recomendadas segun el autor: RTX 4090 / RTX 3090 (24 GB, contexto 32K), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 5090 con 32K de contexto segun la tabla del autor.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (build `cd959bae` o posterior, con `--jinja`). No se documentan otras opciones como vLLM, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Xylolabs/Qwen2.5-7B-Instruct-GGUF (Q4_K_M) | 7,6 B | 32K | GGUF Q4_K_M | Apache 2.0 | Top-1 91,402% en WikiText-2 frente a BF16 |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6 B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo base sin cuantizar; referencia de calidad |
| llama.cpp Q5_K_M de Qwen2.5-7B-Instruct | 7,6 B | no disponible | GGUF Q5_K_M | Apache 2.0 | 5,445 GB; top-1 94,990% en WikiText-2 |
| llama.cpp Q3_K_M de Qwen2.5-7B-Instruct | 7,6 B | no disponible | GGUF Q3_K_M | Apache 2.0 | 3,808 GB; top-1 85,029% en WikiText-2 |

No se dispone de datos comparativos de rendimiento en tareas frente a otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se distribuye la cuantizacion Q4_K_M; no hay variantes Q5, Q6 u Q8 en este repositorio, lo que limita el ajuste fino entre calidad y VRAM.
- La cuantizacion Q4_K_M introduce una degradacion medible: top-1 del 91,402% en WikiText-2 frente a BF16, con KL de 0,034830. Para tareas sensibles a la precision puede ser insuficiente.
- Los metadatos del repositorio declaran solo en y ko; el soporte multilingue real del modelo base no esta verificado en esta publicacion.
- No se aportan benchmarks de tareas (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo o alucinacion en esta ficha; los riesgos de alucinacion son los del modelo base y no se han medido aqui.
- La licencia Apache 2.0 se conserva, pero el autor no documenta cambios en los terminos respecto al modelo original; conviene revisar el fichero LICENSE del repositorio.
- La ejecucion se valido con una build concreta de llama.cpp (`cd959bae`); versiones anteriores pueden no interpretar correctamente el chat template con `--jinja`.
- El repositorio tiene un volumen bajo de adopcion (562 descargas, 0 likes), por lo que no hay evidencia comunitaria extensa sobre su comportamiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Build de llama.cpp referenciada: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-GGUF/blob/main/LICENSE
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
