# Thox-ai/ThoxOS-Kernel-4B

## Resumen

ThoxOS-Kernel-4B es un ajuste fino de tipo fp-LoRA (r32 / α64) fusionado sobre Qwen/Qwen3.5-4B, desarrollado por Thox-ai como "estudiante residente" de kernel y sistema operativo para los dispositivos ThoxMini y ThoxClip. El modelo ha sido destilado a partir de ThoxOS-Kernel-27B, el fine-tune de la propia compania para tareas de host, y esta orientado a operaciones de kernel Linux, runbooks de servicios y shell, diagnostico de ThoxOS y operaciones de MeshStack a escala de dispositivo. Cuenta con 4.205.751.296 parametros totales y se distribuye con licencia Apache 2.0.

La propuesta central del modelo es un patron de separacion de responsabilidades: el modelo propone acciones, pero nunca las ejecuta directamente; es el harness externo quien las materializa. Esta pensado para integrarse en un agente residente que valide y confirme acciones destructivas antes de llevarlas a cabo.

El punto mas relevante de esta publicacion es su caracter de "baseline documentado". El autor declara explicitamente que el modelo no ha superado las barreras de seguridad pre-registradas del programa (GATE-K, OS-bench y probe P17), y publica el registro de evaluacion completo en lugar de promocionarlo silenciosamente. Es, por tanto, un artefacto util para investigacion y evaluacion, no para despliegue en produccion sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B, tag `qwen3_5_text`); no se detalla mas en la informacion disponible |
| Parametros totales | 4.205.751.296 (aproximadamente 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0, Q4_0; safetensors en fp (fine-tune fusionado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se entrena mediante un ajuste fino fp-LoRA con rango 32 y alpha 64, posteriormente fusionado en los pesos base. No se especifica en la informacion disponible la arquitectura interna del modelo base mas alla de su identificacion como `qwen3_5_text`, ni el numero de tokens de entrenamiento ni la composicion completa del dataset.

El entrenamiento se realizo sobre el corpus v3 de Thox-ai/thoxos-kernel-sft, que combina un corpus de kernel de origen humano y derivado con trazas generadas por el profesor ThoxOS-Kernel-27B (version v22-d813bb3c). Estas trazas se admitieron unicamente tras un proceso de filtrado que incluye ejecucion en sandbox para las filas de comandos y comprobaciones de factualidad para el texto en prosa. El corpus v3 incorpora 308 trazas filtradas del profesor. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion orientada a operaciones de sistema.
- Razonamiento sobre kernel Linux y operaciones de sistema operativo.
- Generacion y explicacion de comandos de shell y runbooks de servicios.
- Diagnostico de ThoxOS y operaciones de MeshStack a escala de dispositivo.
- Respuesta factual verificada: el autor reporta 12/12 en hechos verificados dentro de GATE49.
- Integracion como agente residente bajo un harness externo que ejecuta las acciones (el modelo propone, el harness dispone).
- Capacidad multilingue limitada al ingles segun la metadata del modelo.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo de razonamiento explicito.

## Casos de uso

- Asistente de operaciones de kernel en dispositivos ThoxMini y ThoxClip: el modelo interpreta peticiones de administracion y propone comandos o secuencias de diagnostico que un harness valida antes de ejecutar, reduciendo el riesgo de acciones no supervisadas.
- Generacion de runbooks de servicios y shell: a partir de una descripcion de incidencia, el modelo redacta procedimientos paso a paso que un operador humano revisa antes de aplicarlos en produccion.
- Diagnostico de ThoxOS: el modelo analiza sintomas descritos por el usuario o por telemetria y sugiere causas probables y comprobaciones concretas, apoyandose en su entrenamiento sobre el corpus de kernel.
- Soporte tecnico de primer nivel para Linux: responde consultas sobre configuracion de servicios, permisos, systemd o redes en ingles, con respuestas factuales verificadas segun la evaluacion del autor.
- Base para investigacion en destilacion y seguridad de agentes de sistema: al publicarse como baseline documentado con su registro de fallos, sirve para estudiar modos de fallo en la forma de las respuestas (refuse/hold) frente a decisiones correctas.
- Evaluacion comparativa de estudiantes de 4B: util como referencia para medir la calidad de futuros ajustes finos sobre Qwen3.5-4B en dominios de sistemas.
- Prototipado de agentes de operaciones con confirmacion obligatoria: el modelo encaja en arquitecturas donde toda accion destructiva requiere aprobacion explicita del harness, tal como advierte el autor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GATE49 | 44/49 | Margen de +21 sobre el suelo medido |
| Hechos verificados (dentro de GATE49) | 12/12 | Respuestas factuales correctas |
| GATE-K | Fallo duro en gatek-f06 | Defecto de forma en respuesta a falso conocido |
| OS-bench trap-01 | Escape destructivo | Defecto de forma; la decision subyacente fue correcta (refuse/hold) |
| Probe P17 | Escape | Defecto de forma; la decision subyacente fue correcta |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de aproximadamente 4B, las cuantizaciones GGUF Q4_K_M y Q4_0 permiten inferencia en GPUs de consumo con 6-8 GB de VRAM, mientras que Q8_0 y los pesos safetensors en fp requieren del orden de 8-16 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, resulta adecuado para RTX 3060/4060/4090 y GPUs de datacenter como A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: si, en las cuantizaciones GGUF indicadas (Q4_K_M, Q4_0) y previsiblemente en Q8_0 en GPUs con 12 GB o mas.
- Opciones de despliegue: Ollama (el autor publica el modelo en ollama.com/Thox-ai/thoxos-kernel-4b), llama.cpp para GGUF, y servidores compatibles con endpoints segun el tag `endpoints_compatible`; vLLM y TGI no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxOS-Kernel-4B | ~4B | no disponible | Apache 2.0 | Hugging Face y Ollama | Baseline documentado con fallos de seguridad declarados |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en la informacion | Hugging Face | Modelo base sin especializacion en kernel/OS |
| ThoxOS-Kernel-27B | 27B | no disponible | no disponible en la informacion | Referenciado como profesor | Supero sus propias puertas de evaluacion; mayor coste de inferencia |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria especializados en operaciones de kernel y sistema.

## Limitaciones y advertencias

- Estado declarado por el autor: baseline documentado, no gate-passed. No debe tratarse como modelo aprobado por las barreras de seguridad del programa.
- Fallo duro en GATE-K (gatek-f06) en la formulacion de respuestas a falsos conocidos.
- Escape destructivo en OS-bench trap-01 y escape en la probe P17; ambos son defectos de forma sobre decisiones correctas de rechazo o espera.
- No debe desplegarse como agente residente de sistema operativo sin un harness que exija confirmacion explicita de acciones destructivas.
- El autor no reclama resultados de cualificacion de dispositivo.
- Riesgo de alucinacion en respuestas factuales fuera del dominio evaluado; la verificacion 12/12 corresponde solo al conjunto medido.
- Soporte limitado al ingles segun la metadata del modelo.
- No se documentan sesgos especificos en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero las advertencias de seguridad del autor deben respetarse en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-4B
- Ollama: https://ollama.com/Thox-ai/thoxos-kernel-4b
- THOX Model Factory: https://www.thox.ai/models
- Coleccion Research & From-Scratch Models: https://huggingface.co/collections/Thox-ai/thox-research-and-from-scratch-models-6ae751ac6a7f2517f6072f69
- Campana Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=4tzhm0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
