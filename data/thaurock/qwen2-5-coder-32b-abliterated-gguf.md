# Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF

## Resumen

Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF es una coleccion completa de cuantizaciones en formato GGUF del modelo Qwen2.5-Coder-32B-Instruct, publicado por Alibaba Cloud, tras aplicarle un proceso de *abliteration* sobre los pesos en la capa 42. El resultado es un modelo orientado a generacion de codigo que conserva la arquitectura y las capacidades del original, pero con los filtros de rechazo ortogonalizados en componentes clave (`o_proj`, `down_proj` y embeddings de tokens), de modo que no incorpora LoRAs ni hooks en tiempo de ejecucion.

El modelo resuelve un problema concreto para desarrolladores que necesitan un asistente de codigo local sin restricciones de contenido: auditorias de seguridad, analisis de exploits, red-teaming y generacion de codigo ofensivo o creativo que los filtros estandar bloquean. Al estar distribuido en 11 cuantizaciones (desde F16 hasta Q2_K), permite ajustar el consumo de VRAM y RAM a hardware muy diverso, desde una GPU de consumo de 24 GB hasta equipos con menos de 16 GB.

Con 32.763.876.352 parametros y licencia Apache 2.0, se posiciona como una alternativa practica a modelos de codigo de 30B+ para despliegue local. La model card reporta una tasa de rechazo del 0,0 % en pruebas controladas y una degradacion de apenas 3 puntos en HumanEval respecto al modelo base, con mejora en MBPP. No obstante, la informacion disponible no detalla la longitud de contexto nativa ni los idiomas soportados, que se heredan del modelo base pero no se documentan explicitamente en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-32B-Instruct; detalle no disponible en la informacion proporcionada) |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (11 archivos sin splits) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-32B-Instruct, un transformer decoder-only denso de aproximadamente 32,8B parametros desarrollado por Alibaba Cloud. Sobre ese modelo, el autor aplica una edicion estatica de pesos (*abliteration*) en la capa 42 que ortogonaliza la direccion de rechazo en `o_proj`, `down_proj` y los embeddings de tokens. Al no emplear LoRAs ni hooks en tiempo de ejecucion, la modificacion queda fijada en los pesos y no anade sobrecarga en inferencia.

La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El proceso de abliteration se basa en la investigacion de Arditi et al. (2024) y el algoritmo atribuido a TobiasLogic. Las cuantizaciones GGUF fueron generadas localmente por Thaurock a partir de los pesos safetensors del modelo abliterado.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion, heredada de Qwen2.5-Coder-32B-Instruct.
- Razonamiento sobre codigo: explicacion, refactorizacion, depuracion y generacion de tests.
- Generacion de codigo sin filtros de rechazo: la model card reporta una tasa de rechazo del 0,0 % en pruebas controladas.
- Capacidad de escribir codigo ofensivo o de seguridad (escaneo de puertos, analisis de exploits) sin bloqueos.
- Conversacion multi-turno (tag `conversational`).
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada; estas capacidades dependerian del modelo base y no estan verificadas en este repositorio.

## Casos de uso

- Auditoria de seguridad y analisis de vulnerabilidades: el modelo puede generar y revisar codigo de explotacion, PoCs y scripts de escaneo sin que los filtros de rechazo interrumpan la tarea, lo que lo hace adecuado para equipos de seguridad ofensiva y pentesting autorizado.
- Red-teaming de sistemas: util para generar entradas adversarias, prompts maliciosos y codigo de prueba que evaluen la robustez de otros modelos o aplicaciones.
- Asistente de codigo local en produccion: con la cuantizacion Q4_K_M (~19,9 GB) cabe en una GPU de consumo de 24 GB y puede integrarse con llama.cpp, Ollama o LM Studio para autocompletado y generacion en el IDE.
- Generacion de codigo en pipelines de CI/CD: al ejecutarse localmente, se puede invocar desde scripts para generar tests, parches o documentacion sin enviar codigo propietario a servicios externos.
- Desarrollo en entornos air-gapped o con datos sensibles: al ser un modelo local con licencia Apache 2.0, permite desplegar asistencia de codigo en infraestructura privada sin dependencia de APIs de terceros.
- Escritura creativa y generacion de contenido sin restricciones: la eliminacion de filtros permite generar narrativa, dialogos o contenido que los modelos censurados rechazan, con la responsabilidad legal en el usuario final.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio reproducible para analizar como la ortogonalizacion de la direccion de rechazo afecta al rendimiento en tareas de codigo.

## Benchmarks y rendimiento

Datos reportados en la model card para la cuantizacion Q4_K_M con decodificacion greedy (pass@1) en tareas de codigo:

| Benchmark | Este modelo (abliterated Q4_K_M) | Base Instruct oficial (BF16) |
|---|---|---|
| HumanEval | 89,6 % | 92,7 % |
| HumanEval+ | 84,8 % | 87,2 % |
| MBPP | 91,3 % | 90,2 % |
| MBPP+ | 77,0 % | 75,1 % |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K ni otros benchmarks generales para este modelo.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~12,1 GB; Q3_K_S ~14,2 GB; Q3_K_M ~15,1 GB; Q3_K_L ~16,5 GB; Q4_K_S ~18,8 GB; Q4_K_M ~19,9 GB; Q5_K_S ~22,8 GB; Q5_K_M ~23,4 GB; Q6_K ~27,2 GB; Q8_0 ~34,8 GB; F16 ~65,6 GB.
- GPU de consumo: Q4_K_M (~19,9 GB) cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB); Q5_K_M y Q5_K_S tambien caben en 24 GB con margen ajustado. Las variantes Q3 y Q2 permiten ejecucion en GPUs de 16 GB o menos, y Q2_K en equipos de ~12 GB.
- GPU profesionales: Q8_0 y Q6_K requieren A100 40 GB, H100 o configuraciones multi-GPU; F16 requiere 80 GB o reparto entre varias GPUs.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y Text-Generation-WebUI, segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Verificacion de integridad: el repositorio incluye `SHA256SUMS.txt` para validar las descargas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF | ~32,8B | No disponible | Apache 2.0 | GGUF (11 cuantizaciones) | Sin filtros de rechazo; HumanEval 89,6 % (Q4_K_M) |
| Qwen/Qwen2.5-Coder-32B-Instruct | ~32,8B | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF oficiales | Modelo base con filtros; HumanEval 92,7 % (BF16) |
| Otros modelos de codigo de ~30B abliterated | No disponible | No disponible | Variable | Variable | No se dispone de datos verificados en la informacion proporcionada |

La comparativa con alternativas de terceros no puede completarse con rigor porque la informacion proporcionada no incluye datos de otros modelos abliterated ni de la competencia directa en el mismo rango de parametros.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: la model card declara una tasa de rechazo del 0,0 %, lo que implica que el modelo puede generar codigo malicioso, exploits o contenido danino sin advertencia.
- Responsabilidad legal integra del usuario final sobre el uso del codigo o texto generado.
- Riesgo de alucinacion: como cualquier LLM, puede inventar APIs, funciones o dependencias inexistentes; la degradacion por cuantizacion agresiva (Q2_K, Q3) puede aumentar errores de formato en bloques de codigo.
- La cuantizacion Q2_K se advierte como experimental y puede producir problemas de formato o "bleeding" en bloques de codigo complejos.
- Perdida de rendimiento respecto al base: hasta 3,1 puntos en HumanEval y 2,4 puntos en HumanEval+ con Q4_K_M.
- Longitud de contexto e idiomas no documentados en este repositorio; deben consultarse en la model card del modelo base.
- No se documenta soporte de tool calling ni de agentes en este repositorio; verificar en el modelo base antes de usarlo en pipelines con function calling.
- El proceso de abliteration puede degradar sutilmente la coherencia en tareas de razonamiento general no relacionadas con codigo, aunque no se aportan datos al respecto.
- Uso comercial permitido por Apache 2.0, pero sujeto al cumplimiento de la legislacion aplicable sobre contenido generado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Perfil del autor de las cuantizaciones: https://huggingface.co/Thaurock
- Algoritmo de abliteration (TobiasLogic): https://huggingface.co/TobiasLogic
- Paper de referencia sobre abliteration (Arditi et al., 2024): no disponible en la informacion proporcionada
- Repositorio llama.cpp: no disponible en la informacion proporcionada
- Repositorio Ollama: no disponible en la informacion proporcionada
