# ya9919/sharp-9b

## Resumen

sharp-9b (publicado en el repositorio como `qwen3.5-9b-finance-lora-head-200k`) es un adaptador LoRA con una cabeza de decisión escalar compartida, construido sobre el backbone post-entrenado Qwen3.5-9B. Lo desarrolla el autor `ya9919` en el marco del proyecto S²-MAS, un entorno de simulación multiagente a escala social para estudiar decisiones financieras de hogares (consumo, reservas de efectivo y pagos). El modelo no es un generador de texto conversacional: es un clasificador de opciones que puntúa menús de candidatos cerrados en preguntas de finanzas domésticas.

El checkpoint sigue la ruta de "modelo de lenguaje con cabeza de decisión aprendida" dentro del benchmark del paper S²-MAS, que agrupa doce sistemas en seis rutas de decisión. Se entrenó con 200.000 filas distintas de la partición de entrenamiento de QA financiero, en un protocolo de una sola pasada que permite compararlo directamente con su variante de 4B bajo el mismo presupuesto. Su relevancia es metodológica: sirve para medir si escalar el backbone de 4B a 9B mejora la precisión en decisiones financieras cuando el presupuesto de adaptación es fijo.

El resultado es prácticamente un empate: el 9B obtiene 74,0919 % de accuracy frente a 74,1435 % del 4B, con una diferencia reportada de −0,0516 puntos (IC 95 %: −0,0981 a −0,0071). Es decir, el salto de escala no aporta ganancia y el intervalo excluye el cero por muy poco margen. El modelo está pensado para investigación controlada, no para producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA y cabeza de decisión escalar compartida |
| Parametros totales | 9B (backbone Qwen3.5-9B; el adaptador LoRA no se detalla) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 para el backbone y FP32 para el scoring de candidatos) |
| Idiomas soportados | en (inglés) |
| Licencia | s2-mas-controlled-research-v1.2 |
| Formato de pesos | safetensors (adaptador LoRA) + `head.pt` (cabeza de decisión en PyTorch) |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3.5-9B post-entrenado con un adaptador LoRA y una cabeza de decisión escalar compartida que puntúa cada candidato de un menú cerrado. La inferencia no genera tokens libremente: recibe el estado del hogar, la pregunta y el menú completo de candidatos, y produce una puntuación por opción. El paquete incluye `adapter/adapter_config.json`, `adapter/adapter_model.safetensors` y `head.pt`, junto con el script `qwen_decision.py` que expone la interfaz de scoring. El backbone y el tokenizador oficiales se obtienen por separado.

El entrenamiento usó 200.000 filas distintas de la partición de QA de decisión, en una sola pasada, con exposición acumulada de 200.000 filas. La selección del checkpoint se hizo sobre un conjunto de desarrollo fijo de 20.000 ejemplos; la partición de desarrollo completa (412.873 ejemplos) había seleccionado LoRA sobre Qwen4B, y el método se fijó antes de la ejecución independiente del 9B. El test final no participó en la selección de presupuestos ni de métodos. El aprendizaje de decisiones se apoya en datos de encuestas reales; la implementación del motor GENESE/MAS permanece privada.

## Capacidades

- Clasificación de opciones en menús cerrados de preguntas financieras de hogar (respuestas tipo sí/no o selección entre candidatos definidos).
- Puntuación de candidatos sobre el estado completo del hogar, la pregunta y el menú, no generación de texto libre.
- Manejo de 119 versiones de pregunta distintas en el conjunto de test común.
- Salida sin decisiones inválidas en el test reportado (0 casos inválidos).
- Capacidad multilingüe: limitada a inglés según la model card.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre escalado en adaptación de bajo presupuesto: el checkpoint permite replicar la comparación 4B frente a 9B con el mismo protocolo de 200.000 filas y comprobar si la escala del backbone mejora la precisión en decisiones financieras.
- Simulación multiagente de hogares: integrado en el motor S²-MAS, puntúa decisiones de consumo, tenencia de cuentas y productos financieros para millones de agentes sintéticos bajo condiciones emparejadas.
- Evaluación de rutas de decisión en benchmarks: sirve como representante de la ruta "modelo de lenguaje con cabeza de decisión aprendida" frente a encoder scoring, SFT de siguiente token, clasificación de esquema dinámico, encoder multimodal e interfaces de proveedor.
- Estudio de calibración en preguntas de opción cerrada: al devolver puntuaciones por candidato en FP32, permite analizar distribuciones de probabilidad y F1 macro por pregunta sobre 119 versiones.
- Auditoría de sesgo en decisiones financieras sintéticas: al apoyarse en datos de encuestas reales, permite examinar cómo se distribuyen las respuestas predichas entre grupos de hogares (8.275 grupos en el test).
- Línea base para métodos de adaptación: su resultado de 74,0919 % de accuracy y 36,6622 % de F1 macro sirve como referencia contra la que medir técnicas alternativas de adaptación con presupuesto fijo.

## Benchmarks y rendimiento

Conjunto de test común: 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar. Checkpoint seleccionado con datos de desarrollo antes del test.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint (9B) | 74,0919 | 36,6622 | 0 |
| Qwen4B-Base LoRA + cabeza, mismo protocolo de 200k | 74,1435 | 36,7343 | 0 |

Diferencia reportada en el paper: 9B menos 4B = −0,0516 puntos de accuracy (IC 95 %: −0,0981 a −0,0071) y −0,0721 puntos de F1 macro por pregunta (IC 95 %: −0,1725 a 0,0404). La comparación varía tanto la escala como el historial de entrenamiento upstream de las inicializaciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, un backbone de 9B en BF16 requiere aproximadamente 18 GB solo para pesos, más el adaptador LoRA y la cabeza; el scoring de candidatos en FP32 añade overhead proporcional al tamaño del menú.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un backbone de 9B en BF16 encaja en A100 40 GB, H100 y RTX 4090 (24 GB) con margen ajustado.
- GPU de consumo: probable en RTX 4090 en BF16; en GPUs de 16 GB requeriría cuantización del backbone, no documentada para este checkpoint.
- Opciones de despliegue: el paquete incluye `qwen_decision.py` como interfaz de scoring; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no encajan de forma nativa con una cabeza de clasificación sobre menús de candidatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy en test común | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sharp-9b (este) | 9B + LoRA + cabeza | no disponible | 74,0919 % | s2-mas-controlled-research-v1.2 | Adaptador público, backbone aparte |
| Qwen4B-Base LoRA + cabeza (mismo protocolo) | 4B + LoRA + cabeza | no disponible | 74,1435 % | no disponible | Referencia del paper |
| Otras rutas del benchmark S²-MAS (encoder scoring, SFT de siguiente token, esquema dinámico, encoder multimodal, interfaces de proveedor) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: solo puntúa menús de candidatos cerrados; no admite preguntas abiertas ni conversación libre.
- Requiere el backbone Qwen3.5-9B y el tokenizador oficiales por separado; el repositorio solo contiene el adaptador (0,1 GB) y la cabeza.
- El modelo solo está validado en inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- El escalado de 4B a 9B no mejora el rendimiento e incluso retrocede ligeramente (−0,0516 puntos de accuracy); no debe asumirse que un backbone mayor sea mejor en esta tarea.
- La comparación 4B/9B confunde escala con historial de entrenamiento upstream, lo que limita las conclusiones causales sobre el tamaño.
- El F1 macro por pregunta es bajo (36,6622 %), lo que indica dificultad con clases minoritarias dentro de cada versión de pregunta pese a la accuracy agregada alta.
- Riesgo de sesgo: el aprendizaje se apoya en encuestas reales, por lo que puede heredar sesgos de representación de los hogares encuestados.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí de puntuaciones mal calibradas fuera de la distribución de entrenamiento.
- Licencia `s2-mas-controlled-research-v1.2` de tipo "other": restringe el uso a investigación controlada; no se detallan aquí los términos completos y debe consultarse el enlace de licencia antes de cualquier uso.
- La implementación del motor GENESE/MAS es privada, lo que dificulta la reproducción completa del entorno de simulación.
- Repositorio sin descargas ni likes y con pipeline no definido: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/ya9919/qwen3.5-9b-finance-lora-head-200k/blob/main/LICENSE
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto: https://github.com/KataDavidXD/s2-mas
