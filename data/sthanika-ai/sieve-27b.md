# sthanika-ai/Sieve-27B

## Resumen

Sieve-27B es un adaptador LoRA de rango 32 con una cabeza de puntero (pointer head) sobre el backbone de texto de Qwen/Qwen3.8-27B (revisión `1d4bf0f2`), desarrollado por Sthānika AI. No es un modelo generativo: recibe un estado (texto o JSON) y una o varias preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta. El modelo lee el estado una sola vez, puntúa las opciones directamente y nunca produce texto libre.

La propuesta resuelve un problema concreto: convertir un LLM grande en un motor de decisión determinista y calibrado, con tres tipos de pregunta (`choice`, `noul` y `score`), en lugar de depender de la generación de texto y del parseo posterior de la respuesta. Cada pregunta se ejecuta como una fila independiente a partir de la caché del estado, de modo que las preguntas no se contaminan entre sí.

Es relevante porque ofrece una alternativa a los pipelines de clasificación basados en prompting: en lugar de pedir al modelo que "responda con una etiqueta", se obtiene directamente una distribución de probabilidad calibrada (temperatura T = 1.050 ajustada por NLL sobre 43.309 preguntas) y una confianza por opción. El modelo declara un Decision Index de 60.17 (score completo) y 60.04 (índice público) en la edición 0.3.2 del leaderboard, aunque ya no aparece listado desde la edición 0.4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=32, α=64) sobre 12 módulos de proyección de Qwen3.8-27B + cabeza de puntero (pointer head) |
| Parámetros totales | no disponible (adaptador LoRA r=32 sobre backbone de 27B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens para el estado y 16.384 tokens para cada pregunta con sus opciones |
| Tipos de cuantización | no disponible (pesos en bf16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); backbone Qwen3.8-27B descargado aparte en su revisión fijada |
| Modelo base | Qwen/Qwen3.8-27B (revisión `1d4bf0f2`) |
| Tamaño del repo | 1.0 GB |
| Tipos de pregunta | `choice` (2-255 opciones), `noul` (sí/no), `score` (2-10 niveles ordenados) |
| Temperatura de calibración | T = 1.050 (ajustada por NLL sobre 43.309 preguntas) |
| Memoria GPU | ~55 GB en bf16 (52.683 MiB en uso tras la carga) |
| Librería | peft |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo reutiliza únicamente la parte de texto de Qwen3.8-27B; el backbone no puede generar texto. Sobre él se aplica un adaptador LoRA de rango 32 y α=64 en 12 módulos de proyección, más una cabeza de puntero que puntúa el final de cada opción contra el punto de decisión. Una softmax calibrada convierte esas puntuaciones en probabilidades por opción. La temperatura T = 1.050 se ajustó por verosimilitud negativa (NLL) sobre un split de calibración de 43.309 preguntas; T no altera la respuesta elegida y con `temperature=1.0` se obtienen probabilidades sin calibrar.

El aislamiento entre preguntas es una decisión de diseño destacable: cada pregunta se ejecuta como su propia fila partiendo de la caché del estado, de forma que no hay contaminación cruzada entre preguntas del mismo lote. Los límites de tokens en entrenamiento fueron de 16.384 para el estado y 16.384 para cada pregunta con sus opciones; las peticiones más largas se rechazan, nunca se truncan. El modelo se evaluó con el kit oficial del Decision Index (`apolinario/decision-index` en `62d2f51`, edición 0.3) sobre dos GPUs A100 80GB PCIe en dos shards. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Decisión tipada sobre texto o JSON: devuelve una probabilidad calibrada por cada opción de cada pregunta.
- Preguntas `choice`: entre 2 y 255 claves definidas por el llamador, opcionalmente descritas; devuelve la clave más probable, una confianza y una probabilidad por clave.
- Preguntas `noul`: binarias sí/no; devuelve P(yes).
- Preguntas `score`: listas ordenadas de 2 a 10 niveles; devuelve el nivel esperado, una confianza y una probabilidad por nivel.
- Calibración explícita de probabilidades mediante temperatura ajustada (T = 1.050).
- Aislamiento entre preguntas: cada pregunta se evalúa de forma independiente sobre la caché del estado.
- Procesamiento de estados largos: hasta 16.384 tokens de estado y 16.384 tokens por pregunta con opciones.
- No genera texto: no soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido generativo.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Triaje de tickets de soporte: dado un estado con asunto y cuerpo del ticket, se definen preguntas `choice` para el departamento (facturación, técnico, etc.) y `noul` para riesgo de cancelación. El modelo devuelve probabilidad por departamento y P(cancelación) en una sola pasada, sin parseo de texto.
- Enrutamiento de correo entrante: con un estado JSON del mensaje, se puntúan las colas de destino como opciones `choice` (2-255 claves) y se ordena por probabilidad calibrada, lo que permite umbrales de confianza auditables.
- Moderación con niveles graduados: una pregunta `score` con 2-10 niveles (por ejemplo, gravedad de una infracción) devuelve el nivel esperado y la distribución completa, útil para políticas que exigen revisión humana por encima de cierta confianza.
- Verificación de intención en formularios: preguntas `noul` sobre campos booleanos del estado (¿el cliente amenaza con cancelar?, ¿hay duplicado de cargo?) para validar o autocorregir datos introducidos por el usuario.
- Clasificación de documentos largos: estados de hasta 16.384 tokens permiten procesar contratos, informes o hilos de correo completos y lanzar varias preguntas tipadas sobre el mismo estado sin repetir la lectura.
- Extracción de señales para scoring de riesgo: combinación de varias preguntas `score` y `noul` sobre el mismo estado para construir un vector de señales calibradas que alimente un modelo de decisión posterior.
- Servicio de decisiones vía API: despliegue con `sieve-serve --model sthanika-ai/Sieve-27B --graphs` para exponer decisiones calibradas como servicio interno, con límites de tokens aplicados de forma estricta.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.3.2, Full score (leaderboard) | decision_index | 60.17 |
| Decision Index 0.3, índice público (corregido por azar) | decision_index | 60.04 |

Detalles del run declarado por el autor:

| Dato | Valor |
|---|---|
| Suite | Decision Index 0.3 pública (140.178 peticiones puntuables, 37 benchmarks promediados) |
| Índice bruto | 69.32 |
| Breadth | 58.67 |
| Cobertura | 140.178 peticiones respondidas, sin truncamiento, sin peticiones no soportadas y sin errores |
| Peticiones con pregunta > 16.384 tokens | 241 (máximo 29.944, procedentes de ToolRet y BRIGHT), respondidas íntegramente |
| Estados > 16.384 tokens | ninguno |
| Hardware del run | 2 × A100 80GB PCIe, en dos shards |
| Kit oficial | `apolinario/decision-index` en `62d2f51` (edición 0.3) |

El modelo ya no aparece listado en el leaderboard desde la edición 0.4.

## Requisitos de hardware

- VRAM estimada: ~55 GB en bf16 (52.683 MiB en uso tras la carga). Una GPU de 80 GB es suficiente.
- GPU recomendadas: A100 80GB (la configuración usada en el run oficial), H100 80GB; no cabe en GPUs de consumo de 24 GB en bf16.
- GPU de consumo: no disponible en la información proporcionada; no se documentan cuantizaciones que permitan reducir el footprint por debajo de 55 GB.
- Despliegue: paquete `sieve` (carga del adaptador y ejecución de decisiones), servidor `sieve-serve --model sthanika-ai/Sieve-27B --graphs`, y motor `sieve.decision_index_engine:SieveEngine` para el Decision Index.
- Dependencias: `torch 2.8.0` (versiones probadas) y `causal-conv1d==1.7.0` recomendado (requiere nvcc 11.6 o superior); sin él, transformers usa una convolución PyTorch más lenta y las probabilidades pueden diferir ligeramente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables de la misma categoría (modelos de decisión con cabeza de puntero y calibración). La comparativa se limita a los datos del propio modelo frente a su backbone:

| Modelo | Tipo | Parámetros | Contexto | Salida | Licencia |
|---|---|---|---|---|---|
| Sieve-27B | Adaptador LoRA + pointer head sobre Qwen3.8-27B | no disponible (backbone 27B) | 16.384 estado / 16.384 pregunta | Probabilidades calibradas por opción | apache-2.0 |
| Qwen/Qwen3.8-27B | LLM generativo (backbone) | 27B (según denominación) | no disponible en la información | Texto generado | no disponible en la información |

Comparativa con otras alternativas de la misma categoría: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling, function calling ni razonamiento multi-paso; usarlo como LLM de chat o de generación de código no es posible.
- El adaptador por sí solo no funciona como modelo de texto: requiere cargarse con la librería `sieve` y descargar el backbone Qwen3.8-27B en su revisión fijada `1d4bf0f2`.
- Idiomas: solo inglés (`en`); no se documenta soporte multilingüe.
- Límites estrictos de tokens: 16.384 para el estado y 16.384 por pregunta con opciones; las peticiones más largas se rechazan, nunca se truncan. El motor del Decision Index declara límites mayores (65.536 de estado y 32.768 de pregunta), pero el adaptador se entrenó con los límites de 16.384.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades calibradas pueden estar mal calibradas fuera de la distribución de entrenamiento; la temperatura T = 1.050 se ajustó sobre un split concreto y no garantiza calibración en dominios nuevos.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`); además, el modelo ya no figura en el leaderboard desde la edición 0.4.
- Reproducibilidad: sin `causal-conv1d==1.7.0` las probabilidades pueden diferir ligeramente de las publicadas.
- Licencia apache-2.0 para el adaptador; deben revisarse por separado las condiciones del backbone Qwen3.8-27B, cuya licencia no se detalla en la información disponible.
- Uso comercial: la licencia apache-2.0 del adaptador lo permite, pero la dependencia del backbone y de la librería `sieve` introduce condiciones adicionales que conviene verificar antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Código: https://github.com/sthanika-ai/Sieve
- Requisitos (versiones probadas): https://raw.githubusercontent.com/sthanika-ai/Sieve/main/requirements.txt
- Kit del Decision Index: https://github.com/apolinario/decision-index
- Leaderboard del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
