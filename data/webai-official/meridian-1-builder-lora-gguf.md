# webAI-Official/Meridian-1-builder-lora-GGUF

## Resumen

Meridian-1-builder-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo webAI-Official/Meridian-1, un fine-tune de google/gemma-4-12B-it que conserva la misma arquitectura y nombres de tensores. El adaptador implementa la persona "builder", orientada a producir artefactos ejecutables —codigo, scripts, componentes y transformaciones— y devuelve siempre un unico objeto JSON con los campos `persona`, `objective`, `files` y `run`. Este repositorio contiene exclusivamente el adaptador, no los pesos completos del modelo base.

El adaptador parte de webAI-Official/gemma-4-12b-it-builder-lora-peft y fue reajustado sobre Meridian-1 con una epoca adicional sobre los mismos 3898 ejemplos, lo que recupera buena parte del rendimiento perdido al migrar de gemma-4-12B-it a Meridian-1. Se entrena en dos fases: SFT sobre respuestas del propio gemma-4-12B-it verificadas contra el contrato de persona, seguido de DPO con 4789 pares de preferencia.

Su relevancia practica esta en que convierte un modelo generalista de 12B en un agente de generacion de codigo con contrato de salida estricto y resistencia a presion adversarial, con una mejora medida de +33,2 puntos en la tasa de cumplimiento del contrato de persona frente al modelo base con el mismo prompt de rol. El adaptador pesa aproximadamente 130 MB en f16, lo que permite superponerlo a cualquier cuantizacion GGUF de Meridian-1 sin duplicar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (base: google/gemma-4-12B-it via Meridian-1) |
| Parametros totales | 65.011.712 (adaptador; el modelo base Meridian-1 tiene 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (max seq len de entrenamiento: 8192) |
| Tipos de cuantizacion | f16 (unico fichero publicado del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA); version PEFT en repositorio separado |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0.05, aplicado sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer subyacente. El modelo base Meridian-1 es un fine-tune de google/gemma-4-12B-it con arquitectura y nombres de tensores identicos, lo que permite cargar el adaptador sobre cualquier GGUF de Meridian-1 mediante `--lora` en llama.cpp.

El entrenamiento consta de tres etapas. Primero, SFT sobre 3898 ejemplos durante 3 epocas con learning rate 1e-4 y longitud maxima de secuencia 8192, alcanzando un train loss de 0.2384 y un eval loss de 0.2467 en el paso final 732. Los objetivos de SFT son las propias respuestas de gemma-4-12B-it con el prompt de rol, validadas contra el contrato de persona y contra ground truth, conservando la mas corta de cuatro que pasa las comprobaciones; un 5% de las respuestas, correspondientes a peticiones que nunca superaron las verificaciones, provienen de Granite 4.2 30B con razonamiento inferior a 12.000 caracteres. Despues se aplica DPO sobre el adaptador SFT con 4789 pares de preferencia, beta 0.1 y learning rate 5e-6. Finalmente, el reajuste sobre Meridian-1 ejecuta 1 epoca sobre los mismos 3898 ejemplos con learning rate 2e-5 partiendo del adaptador anterior, con train loss 0.2400 y eval loss 0.2479 en el paso final 244.

La innovacion tecnica principal no esta en la arquitectura sino en el contrato de salida: el adaptador fuerza un unico objeto JSON con campos obligatorios y un modo de pensamiento activado (`enable_thinking: true`) con un presupuesto de generacion de hasta 8192 tokens nuevos.

## Capacidades

- Generacion de codigo ejecutable: scripts, componentes y transformaciones, con una tasa de ejecucion del 92,7% en el conjunto de evaluacion del contrato.
- Salida estructurada garantizada: un unico objeto JSON con campos obligatorios `persona`, `objective`, `files` y `run`, y campos opcionales `tests`, `assumptions` y `handoff`.
- Modo de pensamiento (thinking) activado por defecto, con presupuesto de hasta 8192 tokens nuevos.
- Cumplimiento estricto de rol: resistencia a presion adversarial con un 63,9% de exito frente al 2,2% del modelo base con prompt de rol.
- Refusals correctos ante peticiones fuera de alcance: 41,7% frente al 2,2% del modelo base.
- Manejo de peticiones generales dentro del rol: 81,7% frente al 57,8% del modelo base.
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Generacion de codigo en pipelines de CI/CD: el adaptador produce objetos JSON con los ficheros y comandos de ejecucion en campos separados (`files`, `run`), lo que permite a un orquestador aplicar los cambios y ejecutar los tests sin parsear texto libre. La tasa de codigo ejecutable del 92,7% lo hace viable como primer paso automatizado con revision humana posterior.
- Agentes de refactorizacion acotada: al mantenerse dentro de alcance en el 92,2% de las tareas in-scope y rechazar correctamente peticiones fuera de alcance en el 41,7% de los casos, sirve para tareas de transformacion de codigo con limites claros, evitando que el agente se desvie hacia tareas no solicitadas.
- Asistentes de desarrollo con contrato de salida fijo: la envoltura JSON valida en el 92,1% de los casos permite integrar el modelo en sistemas que exigen esquemas estrictos, como plataformas de generacion de componentes o herramientas internas de scaffolding.
- Generacion de tests y aserciones: el campo opcional `tests` del contrato permite solicitar explicitamente pruebas junto al codigo generado, util en flujos de TDD automatizado donde el modelo debe entregar implementacion y verificacion en una sola respuesta.
- Despliegue en hardware modesto: al ser un adaptador de 130 MB sobre un GGUF de 12B, se puede servir con llama.cpp u Ollama en una sola GPU consumer, manteniendo el contrato de persona sin necesidad de infraestructura de gran escala.
- Prototipado de personas especializadas: el patron de entrenamiento (SFT verificado contra contrato mas DPO mas reajuste sobre el modelo final) es replicable para crear otras personas con salida estructurada, y este adaptador sirve como referencia de implementacion.
- Evaluacion de robustez conversacional: los resultados de resistencia adversarial (63,9% frente a 2,2%) lo hacen util como caso de estudio en pruebas de alineacion y adherencia a rol en sistemas multiagente.

## Benchmarks y rendimiento

Evaluacion del contrato de persona sobre 720 casos held-out, adaptador frente a Meridian-1 con el mismo prompt de rol, ambos muestreados con temperatura 1.0, top-p 0.95 y top-k 64. Valores en porcentaje.

| Metrica | Adaptador | Meridian-1 (prompt de rol) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de cumplimiento del contrato | 69.9 | 36.7 | +33.2 |
| Envoltura de salida de persona valida | 92.1 | 72.5 | +19.6 |
| Tareas in-scope superadas | 92.2 | 84.4 | +7.8 |
| Rechazo correcto de peticiones fuera de alcance | 41.7 | 2.2 | +39.5 |
| Mantiene el rol bajo presion adversarial | 63.9 | 2.2 | +61.7 |
| Peticiones generales gestionadas dentro del rol | 81.7 | 57.8 | +23.9 |
| Codigo generado que se ejecuta | 92.7 | 86.1 | +6.6 |

Rendimiento en tareas propias sobre items held-out, adaptador frente a Meridian-1 con el mismo prompt de rol, con intervalo de confianza del 95% por bootstrap pareado.

| Tarea | Adaptador | Meridian-1 (prompt de rol) | Ganancia (pts) | IC 95% | Items |
|---|---:|---:|---:|---|---:|
| Tareas de OpenCodeInstruct que pasan sus tests | 82.7 | 78.7 | +4.0 | -2.7 a +10.7 | 150 |

Capacidad general, adaptador frente a Meridian-1 en el mismo modo de pensamiento.

| Benchmark | Adaptador | Meridian-1 | Ganancia (pts) | +/- EE |
|---|---:|---:|---:|---:|
| ifeval (prompt_level_strict_acc) | 93.5 | 91.0 | +2.5 | 2.7 |

Nota: la evaluacion se realizo con vLLM sobre los pesos PEFT; el autor indica que la version GGUF aun no se ha probado con llama.cpp sobre Meridian-1.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 130 MB en f16, por lo que la VRAM adicional sobre el modelo base es marginal.
- El modelo base Meridian-1 tiene 12B parametros; la VRAM total depende de la cuantizacion del GGUF de Meridian-1 que se cargue (no se proporcionan cifras concretas en la informacion disponible).
- GPU recomendadas: no disponible de forma explicita; el modelo base de 12B es compatible con GPUs consumer de gama alta y con GPUs de datacenter (A100, H100) segun la cuantizacion.
- Cabe en GPU consumer: si, siempre que la cuantizacion del GGUF base lo permita; no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora` o `--lora-scaled`), y vLLM con los pesos PEFT. Ollama no se menciona en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meridian-1-builder-lora (este) | 65M (adaptador sobre 12B) | no disponible | no disponible | GGUF LoRA | Persona builder con contrato JSON; +33,2 pts en cumplimiento de contrato |
| Meridian-1 (base) | 12B | no disponible | no disponible | GGUF, safetensors | Fine-tune de gemma-4-12B-it; 36,7% de cumplimiento con prompt de rol |
| gemma-4-12b-it-builder-lora-peft | adaptador sobre 12B | no disponible | no disponible | PEFT | Version previa del adaptador entrenada sobre gemma-4-12B-it |
| google/gemma-4-12B-it | 12B | no disponible | no disponible | safetensors | Modelo base original de la familia |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a los modelos de la propia familia Meridian y gemma.

## Limitaciones y advertencias

- El adaptador solo funciona correctamente con el system prompt exacto de entrenamiento; sin el, queda fuera de su distribucion de entrenamiento. El salto de linea antes de `Respond with a single JSON object.` y el guion em (—) forman parte del prompt.
- La evaluacion publicada se realizo con vLLM sobre los pesos PEFT; el autor no ha probado la version GGUF con llama.cpp sobre Meridian-1, por lo que el rendimiento real en ese stack es desconocido.
- La tasa de rechazo correcto de peticiones fuera de alcance es del 41,7%, lo que implica que mas de la mitad de las peticiones fuera de alcance no se rechazan correctamente.
- La adherencia al rol bajo presion adversarial alcanza el 63,9%, insuficiente para entornos donde un fallo de rol tenga consecuencias graves.
- La ganancia en tareas de OpenCodeInstruct tiene un intervalo de confianza que cruza cero (-2,7 a +10,7), por lo que la mejora en esa tarea no es estadisticamente concluyente.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido.
- Idiomas soportados no disponibles; no se puede garantizar un comportamiento correcto fuera del ingles.
- Riesgo de alucinacion en el codigo generado: aunque el 92,7% del codigo se ejecuta, la ejecucion no garantiza correccion semantica.
- El adaptador depende de que el GGUF base de Meridian-1 este disponible y sea compatible con los nombres de tensores de gemma-4-12B-it.
- El modo de pensamiento consume hasta 8192 tokens nuevos por peticion, lo que incrementa coste y latencia en produccion.

## Enlaces

- Repositorio Hugging Face del adaptador GGUF: https://huggingface.co/webAI-Official/Meridian-1-builder-lora-GGUF
- Modelo base Meridian-1: https://huggingface.co/webAI-Official/Meridian-1
- Version PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-builder-lora-peft
- Adaptador previo sobre gemma-4-12B-it: https://huggingface.co/webAI-Official/gemma-4-12b-it-builder-lora-peft
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
