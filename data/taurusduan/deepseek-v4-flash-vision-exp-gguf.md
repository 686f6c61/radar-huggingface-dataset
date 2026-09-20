# taurusduan/DeepSeek-V4-Flash-Vision-Exp-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Exp-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario taurusduan sobre el modelo multimodal experimental deepseek-ai/DeepSeek-V4-Flash-Vision-Exp. No se trata del modelo original, sino de una redistribucion cuantizada (estilo Unsloth Dynamic 3.0 con calibracion imatrix) pensada para ejecutar el modelo en llama.cpp y en Unsloth Studio. El modelo base es el primer miembro multimodal de la familia DeepSeek-V4: parte de la arquitectura DeepSeek-V4-Flash y anade modulos visuales junto con un entrenamiento continuado para habilitar comprension de imagenes.

El peso real declarado en safetensors es de 284.334.578.519 parametros (~284,3 B), con un repositorio que ocupa 1.157,9 GB. La arquitectura es de mezcla de expertos (MoE) e incorpora, segun la documentacion del modelo base, un vision encoder, un aligner, atencion DFlash, Hyper-Connections y una ruta forward denominada DSpark. La licencia declarada es MIT.

Su relevancia es doble: por un lado, es una de las primeras aproximaciones multimodales abiertas de DeepSeek dentro de la linea V4 y con licencia permisiva; por otro, la existencia de cuantizaciones GGUF que conservan el soporte de vision permite desplegar un modelo de ~284 B en hardware local o on-premise sin depender de API. Conviene senalar que el repositorio tenia 0 descargas y 0 likes en el momento de la consulta, se creo el 20 de septiembre de 2026 y la model card esta truncada, por lo que buena parte de los metadatos (idiomas, contexto, parametros activos) no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal; segun el repositorio del modelo base incluye vision encoder, aligner, atencion DFlash, Hyper-Connections y ruta forward DSpark |
| Parametros totales | 284.334.578.519 (~284,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Unsloth Dynamic 3.0 con imatrix: UD-Q8_K_XL (162 GB) y UD-Q4_K_XL (aproximadamente 155 GB, ya que el Q8 es solo 7 GB mayor segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye en safetensors |
| Tamano del repositorio | 1.157,9 GB |
| Libreria declarada | transformers |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-Vision-Exp |
| Autor del repositorio | taurusduan (cuantizacion de terceros, no oficial de DeepSeek) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) multimodal. La documentacion disponible en el repositorio describe explicitamente los siguientes componentes de la implementacion de referencia en PyTorch: el vision encoder y su aligner, la atencion DFlash, la capa MoE, el mecanismo Hyper-Connections y la ruta forward DSpark. La model card indica que DeepSeek-V4-Flash-Vision-Exp se construye sobre DeepSeek-V4-Flash anadiendo modulos visuales y sometiendo el conjunto a un entrenamiento continuado para desbloquear la comprension visual. El numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF, DPO u otras tecnicas de alineamiento no estan disponibles en la informacion proporcionada.

En cuanto a la innovacion tecnica, lo mas destacable es la combinacion de un MoE de gran escala con un modulo de vision dentro de la misma familia V4, junto con el mecanismo de atencion DFlash y las Hyper-Connections. El repositorio de cuantizacion anade una capa practica relevante: conserva el soporte de entrada de imagen en GGUF, algo que exige llama.cpp b10766 o posterior (primera version con soporte de vision de DeepSeek-V4, introducido en los PR #28133 y #28154). Las cuantizaciones siguen el esquema Dynamic 3.0 de Unsloth, que aplica precision diferencial por capa calibrada con imatrix.

## Capacidades

- Generacion de texto y razonamiento en modo agente, con niveles de esfuerzo de razonamiento configurables (la model card menciona toggles de "High" y "Max thinking" en Unsloth Studio, y la evaluacion oficial usa `max` reasoning effort).
- Comprension de imagenes: el modelo base incorpora vision encoder y aligner, y esta cuantizacion preserva la entrada de imagen siempre que se use llama.cpp b10766 o superior.
- Capacidades de agente multimodal: evaluado en ApexBench, Agents' Last Exam, Chartography y ZeroBench, ademas de tareas de agente puramente textuales.
- Tareas de agente sobre terminal y sistemas: evaluado en Terminal Bench 2.1, Cybergym, DeepSWE y AutomationBench.
- Generacion de codigo y repositorios: evaluado en NL2Repo y DeepSWE.
- Uso de herramientas y orquestacion de flujos: evaluado en Toolathlon-Verified.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no se detalla de forma explicita en la informacion proporcionada, aunque las evaluaciones de tipo agente (Toolathlon, AutomationBench) implican uso de herramientas.
- Capacidades de audio: no disponibles.

## Casos de uso

- Automatizacion de agentes sobre terminal: con un 83,9 en Terminal Bench 2.1, el modelo es adecuado para agentes que ejecutan comandos, inspeccionan salidas y corrigen errores en un bucle multi-paso sobre un entorno shell.
- Generacion y mantenimiento de repositorios: la puntuacion de 57,7 en NL2Repo y 59,3 en DeepSWE lo situan como candidato para transformar descripciones en lenguaje natural en estructuras de proyecto y para resolver tareas de ingenieria de software de varios ficheros.
- Analisis de documentacion tecnica con imagenes: gracias al vision encoder, se pueden procesar diagramas de arquitectura, capturas de paneles o esquemas junto con texto para extraer informacion estructurada.
- Interpretacion de graficos y tablas: la puntuacion de 64,3 en Chartography lo hace util para pipelines que extraen datos de graficos, dashboards e informes visuales en formato imagen.
- Razonamiento visual de dificultad alta: con 35,0 en ZeroBench (Pass@5), encaja en escenarios donde la respuesta requiere varias hipotesis sobre una imagen compleja antes de converger.
- Asistencia de ciberseguridad defensiva: la puntuacion de 75,3 en Cybergym permite usarlo en tareas de analisis de vulnerabilidades y respuesta ante incidentes dentro de un entorno controlado.
- Agentes de operaciones y automatizacion de back-office: evaluado en AutomationBench (25,7) y Toolathlon-Verified (75,9), es aplicable a flujos que encadenan llamadas a APIs y herramientas externas.
- Despliegue on-premise con datos sensibles: al ser un modelo con licencia MIT y pesos descargables en GGUF, puede ejecutarse en infraestructura propia sin enviar datos a terceros, algo relevante en sectores regulados.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base. La comparativa incluye DeepSeek-V4-Flash-0731 y Opus-4.8 como referencias. La evaluacion de los benchmarks de agente textual se realizo con el modo minimal de DeepSeek Harness como framework de agente, con `max` reasoning effort y `temperature = 1.0, top_p = 0.95`.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (publico) | 25,7 | 25,1 | 27,2 |
| ApexBench (Pass@1) | 36,5 | 26,2 (ignora elementos multimodales) | 39,4 |
| Agents' Last Exam | 27,3 | 25,2 (ignora elementos multimodales) | 25,7 |
| Chartography | 64,3 | no disponible | 65,0 |
| ZeroBench (Pass@5) | 35,0 | no disponible | 34,0 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos de conocimiento o codigo (MMLU, GSM8K, HumanEval) para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: segun los tamanos de fichero declarados en la model card, la cuantizacion UD-Q4_K_XL ocupa aproximadamente 155 GB y la UD-Q8_K_XL 162 GB. A eso hay que sumar el espacio para la cache KV, que depende de la longitud de contexto (no disponible) y del numero de usuarios concurrentes.
- GPU recomendadas: no cabe en ninguna GPU de consumo. Configuraciones realistas pasan por multiples aceleradores de 80 GB (A100 80 GB, H100 80 GB) o por ejecucion hibrida con CPU y RAM del sistema para los expertos no activos.
- GPU de consumo: no es viable en una RTX 4090 (24 GB), RTX 5090 ni similares, ni siquiera con la cuantizacion mas agresiva listada. Requiere agregacion de memoria fuera del rango consumer.
- Opciones de despliegue: llama.cpp, obligatoriamente en version b10766 o posterior para el soporte de entrada de imagen; Unsloth Studio, con toggles de "High" y "Max thinking". No se confirma en la informacion disponible el soporte en vLLM, TGI u Ollama para esta conversion GGUF concreta.
- Latencia y throughput: no disponibles. Al ser un MoE, la latencia depende en gran medida de cuantos parametros activos tenga el modelo, dato que no se ha publicado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Rendimiento destacado |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp-GGUF (esta ficha) | 284,3 B (cuantizado) | no disponible | MIT | GGUF | Mismos resultados que el modelo base; sin datos propios de benchmarks |
| DeepSeek-V4-Flash-Vision-Exp (base) | 284,3 B | no disponible | MIT | safetensors | Terminal Bench 2.1 83,9; ApexBench 36,5; Chartography 64,3 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 2.1 82,7; sin vision |
| Opus-4.8 | no disponible (modelo propietario) | no disponible | propietaria | no disponible | Terminal Bench 2.1 85,0; NL2Repo 69,7; DSBench-Hard 71,7 |

La comparativa con modelos abiertos de tamano similar no esta disponible en la informacion proporcionada. El dato mas relevante es que esta cuantizacion no altera los resultados publicados por el modelo base; su valor diferencial es exclusivamente el formato y la reduccion de huella de memoria.

## Limitaciones y advertencias

- Repositorio de terceros: la conversion GGUF no la publica DeepSeek ni, segun los metadatos, el equipo de Unsloth de forma oficial; el autor es taurusduan. Con 0 descargas y 0 likes, no hay validacion comunitaria de la calidad de la cuantizacion.
- Model card incompleta: el README del modelo base aparece truncado ("encoding/ and inference/ deliber"), por lo que faltan detalles de uso y de composicion del dataset.
- Datos no disponibles: contexto maximo, parametros activos, idiomas soportados y politica de alineamiento no se han publicado en la informacion disponible. Sin el contexto maximo no se puede dimensionar correctamente la cache KV ni disenar pipelines de contexto largo.
- Rendimiento inferior a Opus-4.8 en la mayoria de benchmarks de agente textual evaluados, con diferencias notables en NL2Repo (57,7 frente a 69,7) y DSBench-Hard (63,6 frente a 71,7).
- Riesgo de alucinacion: no se han publicado tasas de hallucination ni evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se han publicado analisis de sesgo ni de equidad para este modelo.
- Requisitos de version: la entrada de imagen falla en versiones de llama.cpp anteriores a b10766, lo que puede provocar errores silenciosos en pipelines que no fijen la version.
- Licencia MIT: permite uso comercial y modificacion, pero el repositorio del modelo base referencia un fichero LICENSE propio; conviene verificar los terminos exactos del modelo original antes de un despliegue comercial.
- Naturaleza experimental: el propio nombre del modelo lo etiqueta como "Exp", por lo que la API, el formato de prompt y el comportamiento pueden cambiar entre versiones.
- Coste de memoria: ~155-162 GB solo para los pesos, lo que excluye cualquier despliegue en una unica GPU convencional y exige planificacion de infraestructura multi-GPU o hibrida.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/taurusduan/DeepSeek-V4-Flash-Vision-Exp-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Guia de DeepSeek-V4 de Unsloth: https://unsloth.ai/docs/models/deepseek-v4
- Documentacion de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Release de llama.cpp b10766: https://github.com/ggml-org/llama.cpp/releases/tag/b10766
- Pull request de soporte de vision en llama.cpp #28133: https://github.com/ggml-org/llama.cpp/pull/28133
- Pull request de soporte de vision en llama.cpp #28154: https://github.com/ggml-org/llama.cpp/pull/28154
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Cuenta de X de DeepSeek: https://twitter.com/deepseek_ai
