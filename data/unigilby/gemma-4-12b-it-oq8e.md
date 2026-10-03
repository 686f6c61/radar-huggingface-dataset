# unigilby/gemma-4-12B-it-oQ8e

## Resumen

gemma-4-12B-it-oQ8e es una cuantizacion de 8 bits del modelo instructivo google/gemma-4-12B-it, publicada por el usuario unigilby. Se ha generado con la herramienta oMLX en su modo oQe (oQ enriquecido con imatrix) y esta disenada especificamente para encajar con TensorFold, el motor de decodificacion especulativa exacta para Apple Silicon. El paquete conserva la nomenclatura de familia `gemma4_unified` y se distribuye en formato MLX, cargable tanto por mlx-lm como por oMLX.

El modelo parte del checkpoint bf16 ya ajustado por instrucciones (no de un checkpoint QAT) y aplica cuantizacion afin de 8 bits con grupos de 64 en todos los tensores cuantizados. Cuenta con 11.959.730.224 parametros (unos 12.000 millones) y un peso de repositorio de 12,8 GB. La licencia es Apache-2.0, heredada del modelo fuente.

Su relevancia actual reside en que es un ejemplo de cuantizacion orientada a hardware concreto: las restricciones de "un ancho por pila y capa" (q/k/v_proj y gate/up_proj comparten bits y grupo) permiten que los kernels de decodificacion de Gemma 4 en TensorFold lean y apilen cada proyeccion, habilitando decodificacion especulativa exacta. Esta pensado para servir exclusivamente texto, aunque el paquete conserva los pesos de vision y audio del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de la familia `gemma4_unified` (segun tags del autor; detalles internos no disponibles) |
| Parametros totales | 11.959.730.224 (aproximadamente 12B) |
| Parametros activos | no aplicable / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (oQ nivel 8, modo oQe), cuantizacion afin MLX con grupos de 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizacion MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion derivada, no un entrenamiento nuevo. El autor partio del release bf16 ajustado por instrucciones de `google/gemma-4-12B-it` y aplico la herramienta oMLX en modo `oq` con mejora por imatrix (oQe). El empaquetado impone dos restricciones adicionales sobre un paquete oQe estandar: (1) todos los tensores cuantizados usan grupos de 64 en modo afin, y (2) cada pila de proyecciones por capa (q/k/v_proj y gate/up_proj) comparte un unico par (bits, grupo). Si un miembro que oQ habria potenciado lo requiere, se promociona toda la pila al ancho del miembro mas ancho, nunca se degrada. Esto garantiza anchos homogeneos dentro de cada pila, requisito de los kernels de Gemma 4 de TensorFold.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base, ya que no se detalla en la informacion proporcionada. El paquete conserva el embebedor de parches de vision y la proyeccion de audio tal como los escribio oQ, pero TensorFold solo sirve texto y los descarta en la carga. Los anchos por capa quedan registrados en `config.json` bajo la clave `quantization`.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation, con etiqueta conversational).
- Decodificacion especulativa exacta en Apple Silicon mediante TensorFold, con un drafter MTP externo.
- Carga directa como modelo MLX cuantizado estandar en mlx-lm y oMLX.
- El modelo base es multimodal (incluye embebedor de vision y proyeccion de audio), pero esta cuantizacion esta orientada a servir unicamente texto; TensorFold descarta esos pesos en la carga. No se detalla que capacidades de vision o audio quedan funcionales en otros motores.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el pack esta pensado para ejecutarse en Macs con memoria unificada suficiente mediante mlx-lm u oMLX, aprovechando MLX como runtime nativo.
- Servicio de texto con decodificacion especulativa: usando TensorFold con un drafter MTP (`mlx-community/gemma-4-12B-it-qat-assistant-4bit`), se obtiene aceleracion de decodificacion con salidas identicas a las no asistidas, segun el autor.
- Despliegue de un asistente conversacional cuantizado a 8 bits: al ocupar unos 12 GB, permite mantener una calidad cercana al bf16 con menor huella de memoria que el checkpoint original.
- Investigacion en cuantizacion: sirve como caso de estudio de cuantizacion con restricciones de layout orientadas a un motor de inferencia concreto (un ancho por pila y capa, grupos de 64).
- Evaluacion de decodificacion especulativa: util para medir ganancias de throughput con y sin drafter en hardware Apple, comparando tok/s a distintos niveles de concurrencia.
- Base para pipelines de generacion de texto en entornos macOS: se integra en flujos mlx-lm existentes sin conversion adicional, al ser cuantizacion MLX estandar.
- Prototipado de aplicaciones que requieren un modelo de aproximadamente 12B en local: al reducir el peso a 12 GB, es viable en equipos que no podrian alojar el checkpoint bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). El autor si reporta mediciones de throughput en un M5 Ultra con TensorFold, que se recogen en la seccion de requisitos de hardware.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el paquete ocupa unos 12 GB (repositorio de 12,8 GB); se necesita margen adicional para el contexto y el runtime, por lo que se recomienda un minimo practico de 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon. El autor midio en un M5 Ultra con TensorFold; no se proporcionan datos para GPUs NVIDIA ni AMD.
- Compatibilidad con consumer GPU: no aplica directamente, ya que el formato es MLX (Apple Silicon). En Mac cabe en equipos con memoria unificada suficiente (16 GB o mas como orientacion).
- Opciones de despliegue: mlx-lm y oMLX cargan el modelo como cualquier MLX cuantizado. TensorFold requiere soporte de Gemma 4 para este layout, propuesto upstream y aun no incluido en un release.
- Latencia y throughput medidos (M5 Ultra, TensorFold, `gemma4_unified`, decodificacion greedy, drafter `mlx-community/gemma-4-12B-it-qat-assistant-4bit`):

| Metrica | Valor |
|---|---|
| Decodificacion con drafter, un flujo | 131,7 tok/s |
| Decodificacion sin drafter, un flujo | 52,0 tok/s |
| Throughput agregado a cuatro flujos | 238,7 tok/s |
| Procesamiento de prompt | aproximadamente 2,9-3,2K tok/s |

El autor indica que las respuestas con drafter son iguales a las de `"draft": false` y que las respuestas concurrentes coinciden con las seriales, verificado por hash de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unigilby/gemma-4-12B-it-oQ8e | ~12B | 8 bits (oQe, grupo 64) | no disponible | apache-2.0 | MLX, ~12 GB |
| google/gemma-4-12B-it (base) | ~12B | bf16 | no disponible | apache-2.0 | no disponible en esta informacion |
| mlx-community/gemma-4-12B-it-qat-assistant-4bit | no disponible | 4 bits (QAT, drafter) | no disponible | no disponible | MLX, usado como drafter |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la unica comparacion cuantificada disponible es la de throughput con y sin drafter recogida en la seccion anterior.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; se remite a la model card del modelo fuente (`google/gemma-4-12B-it`) para uso previsto y limitaciones.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el comportamiento inherente del modelo base.
- Limitaciones de contexto e idioma: no disponibles; no se especifican la longitud de contexto ni los idiomas soportados.
- Servicio solo texto en TensorFold: aunque el paquete conserva pesos de vision y audio, TensorFold los descarta en la carga, por lo que no se pueden usar en ese motor.
- Dependencia de soporte upstream: TensorFold necesita soporte de Gemma 4 para este layout, que esta propuesto pero aun no incluido en un release; hasta entonces el uso con TensorFold no esta garantizado.
- Rendimiento medido en hardware concreto: las cifras de throughput corresponden a un M5 Ultra con TensorFold; no deben extrapolarse a otros equipos.
- Licencia: Apache-2.0, igual que el modelo fuente; no se anaden restricciones adicionales conocidas. Conviene revisar la licencia y los terminos de uso del modelo base de Google antes de un uso comercial.
- Popularidad: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Creado en 2026-10-03; el paquete es reciente y puede requerir versiones especificas de mlx-lm u oMLX para cargar correctamente los anchos por capa definidos en `config.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unigilby/gemma-4-12B-it-oQ8e
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de oMLX: https://github.com/jundot/omlx
- Repositorio de TensorFold: https://github.com/ashhart/TensorFold
- Drafter MTP usado en las mediciones: mlx-community/gemma-4-12B-it-qat-assistant-4bit (referenciado en la model card; URL no proporcionada)
