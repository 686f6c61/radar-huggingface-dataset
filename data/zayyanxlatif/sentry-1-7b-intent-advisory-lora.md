# zayyanxlatif/Sentry-1.7B-Intent-Advisory-LoRA

## Resumen

Sentry-1.7B-Intent-Advisory-LoRA es un adaptador LoRA de rango 4 desarrollado por Zayyan Latif sobre el modelo base Qwen3-1.7B. Su propósito es emitir una etiqueta finita de asesoramiento (`match`, `mismatch` o `clarify`) que compara una solicitud de operación con una intención candidata previamente autorizada por la aplicación llamante. El adaptador está pensado exclusivamente para registros de simulación ficticios ya autenticados y permitidos por la aplicación que lo invoca; no ejecuta operaciones, no realiza llamadas de red y no incluye escáner alguno.

La relevancia del proyecto es metodológica más que práctica: se publica como una vista previa de investigación (v0.1.0) con métricas medidas sobre 232 casos de desarrollo disjuntos por propósito, comparando el modelo padre sin modificar con el adaptador bajo un prompt idéntico. Los resultados muestran una mejora en la detección de discrepancias definitivas (de 38 a 9 falsos emparejamientos sobre 124), pero también una pérdida de 15 emparejamientos correctos y la ausencia total de aclaraciones correctas en las 16 solicitudes no resueltas. El autor declara explícitamente que el adaptador no superó el criterio de publicación y que la confirmación independiente queda abierta.

El adaptador se distribuye en formato MLX (Apple Silicon) con pesos safetensors separados (`adapter/adapters.safetensors`), licencia Apache-2.0 y soporte únicamente para inglés. El paquete incluye scripts de verificación de integridad (`SHA256SUMS`), un evaluador (`assess.py`), entradas de humo ficticias y ficheros de procedencia y atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 4, 48 pasos de adaptación) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA sobre un padre de 1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens renderizados (límite impuesto por el runtime del paquete) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye sin cuantizar; el padre se usa en BF16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (adaptador y software); las tres entradas de humo ficticias son CC BY 4.0 |
| Formato de pesos | safetensors (`adapter/adapters.safetensors`) para MLX |

## Arquitectura y entrenamiento

El adaptador es una adaptación LoRA de rango 4 aplicada sobre Qwen3-1.7B en BF16, en la revisión fijada `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`. El entrenamiento consistió en 48 pasos sobre ejemplos de desarrollo disjuntos por propósito derivados del dataset AmazonScience/massive, orientados a la tarea de alineamiento de intención a nivel de propósito de simulación. No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

El diseño de inferencia es deliberadamente restringido: el modelo puntúa tres opciones de un solo token (`match`, `mismatch`, `clarify`) sobre la plantilla de chat original en BF16 con el modo de razonamiento (thinking) desactivado. El runtime limita el contexto a 384 tokens renderizados y devuelve `{"status":"clarify","evidence":[]}` ante enlaces ambiguos, entradas malformadas o contexto sobredimensionado. Las citas de evidencia (ID de intención y, en caso de emparejamiento, ID de recibo) se resuelven de forma determinista y solo indican qué registros suministrados se vincularon a la decisión, no que exista autorización real ni implicación lógica de la evidencia.

## Capacidades

- Clasificación de intención con etiquetas finitas: emite `match`, `mismatch` o `clarify` comparando una solicitud de operación con una intención candidata autorizada.
- Puntuación de opciones de un solo token sobre la plantilla de chat de Qwen3 con thinking desactivado.
- Resolución determinista de alcance: adjunta IDs de evidencia (intención y recibo) a los resultados anclados válidos.
- Manejo de entradas JSONL con contrato estricto: exactamente dos registros `intent`, un `individual_receipt` y un `context`, con IDs únicos y prefijos literales obligatorios.
- Gestión de casos límite mediante clarificación forzada ante binding ausente o ambiguo, entrada malformada o contexto superior a 384 tokens.
- Ejecución offline: sin llamadas de red, sin operaciones y sin escáner; verificable mediante sumas SHA-256.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre; su función es exclusivamente clasificatoria dentro del contrato descrito.

## Casos de uso

- Evaluación de investigación sobre alineamiento de intención: el adaptador sirve como banco de pruebas reproducible para estudiar el compromiso entre detección de discrepancias y preservación de emparejamientos correctos en tareas de etiquetas finitas.
- Auditoría de decisiones de emparejamiento en simulaciones ficticias: dado un contrato JSONL estricto, el modelo emite una etiqueta y cita los IDs de evidencia que respaldaron la decisión, lo que permite trazar qué registros intervinieron.
- Validación de pipelines de autorización simulados: la aplicación llamante mantiene la autenticación y los permisos, y el adaptador solo asesora sobre la coherencia entre solicitud e intención permitida, lo que encaja en pruebas de integración de flujos de autorización.
- Reproducción de experimentos en Apple Silicon: el paquete MLX con `assess.py`, `SHA256SUMS` y `smoke-input.jsonl` permite replicar localmente la carga, la puntuación de etiquetas finitas y los IDs anclados sin conexión.
- Estudio de calibración de umbrales: las variantes calibradas documentadas (112/232 y 101/232 en exactitud conjunta) ofrecen material para investigar reglas de decisión alternativas, aunque el paquete no incluye umbrales.
- Formación y docencia sobre contratos de entrada/salida estrictos: el modelo ilustra cómo imponer un esquema JSONL rígido, límites de contexto y clarificación forzada en sistemas de clasificación sensibles a la seguridad.

## Benchmarks y rendimiento

Métricas medidas por el autor sobre 232 casos de desarrollo disjuntos por propósito, con prompt idéntico, mismo resolver de fuentes y mismo renderizador determinista en ambos brazos:

| Modo (mismo prompt) | Padre sin modificar | Adaptador rank-4 |
|---|---:|---:|
| Exactitud conjunta nativa | 135/232 | 158/232 |
| Emparejamientos erróneos nativos | 38/124 | 9/124 |
| Solicitudes no resueltas clarificadas correctamente (nativo) | 5/16 | 0/16 |
| Solicitudes alineadas emparejadas correctamente (nativo) | 72/108 | 57/108 |
| Exactitud conjunta calibrada | 112/232 | 101/232 |
| Emparejamientos erróneos calibrados | 7/124 | 4/124 |

La ganancia conjunta del adaptador procede de una mejor detección de discrepancias definitivas; pierde 15 emparejamientos correctos y no identifica ninguna de las solicitudes no resueltas bajo la regla de decisión nativa distribuida. La variante con umbral no alcanzó el criterio de publicación y el paquete no contiene umbrales.

## Requisitos de hardware

- Inferencia en Apple Silicon macOS con Python 3.11 o superior; el paquete está diseñado para MLX, no para CUDA.
- El padre Qwen3-1.7B debe estar en BF16 en la revisión fijada; el adaptador se aplica en rango 4 sin cuantizar.
- VRAM/unified memory estimada: no disponible de forma explícita; por el tamaño del padre en BF16 (1.7B parámetros) se requiere un equipo Apple Silicon con memoria unificada suficiente para el snapshot completo, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles; el runtime documentado es exclusivamente Apple Silicon.
- Despliegue: script `assess.py` con `--base` y `--input`, opción `--base-only` para el padre sin modificar, y ejecución bajo `sandbox-exec` con red denegada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentry-1.7B-Intent-Advisory-LoRA | Adaptador rank 4 sobre 1.7B | 384 tokens renderizados | Clasificación de intención (3 etiquetas) | Apache-2.0 | Hugging Face, MLX |
| Qwen3-1.7B (padre) | 1.7B | no disponible en la información | Generación de texto general | no disponible en la información | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de clasificación de intención directamente comparables en el material proporcionado.

## Limitaciones y advertencias

- Vista previa de investigación sin confirmación independiente; el autor declara explícitamente que no está validada para uso en el mundo real.
- El adaptador no superó el criterio de publicación con umbral y el paquete no incluye umbrales de decisión.
- Bajo la regla nativa, no clarificó correctamente ninguna de las 16 solicitudes no resueltas y perdió 15 emparejamientos correctos respecto al padre.
- Las citas de evidencia no demuestran autorización real ni implicación lógica; la aplicación llamante conserva toda la responsabilidad sobre autenticación, permisos y ejecución de acciones.
- Contexto limitado a 384 tokens renderizados; entradas sobredimensionadas o malformadas devuelven clarificación forzada.
- Soporte exclusivo de inglés y de registros de simulación ficticios con prefijos literales obligatorios.
- Dependencia de un snapshot exacto del padre en BF16 y de los bytes exactos de `adapter/adapters.safetensors`; un archivo Git del código fuente omite ese fichero.
- Los artefactos históricos de 0.6B permanecen en cuarentena y fuera de este paquete.
- Riesgo de alucinación no evaluado en la información disponible; sesgos conocidos no documentados.
- Licencia Apache-2.0 permite uso comercial del adaptador y del software, pero las entradas de humo son CC BY 4.0 y el uso está restringido por el contrato de entrada/salida descrito.

## Enlaces

- Hugging Face: https://huggingface.co/zayyanxlatif/Sentry-1.7B-Intent-Advisory-LoRA
- Modelo base Qwen3-1.7B (revisión fijada): https://huggingface.co/Qwen/Qwen3-1.7B/tree/70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- Dataset AmazonScience/massive: https://huggingface.co/datasets/AmazonScience/massive
- Términos a nivel de fichero: NOTICE.md (en el repositorio)
- Procedencia: provenance.json (en el repositorio)
- Atribución: ATTRIBUTION.md (en el repositorio)
- Recibo de humo offline: smoke-receipt.json (en el repositorio)
