# ya9919/sharp-4b-head-50k

## Resumen

sharp-4b-head-50k es un checkpoint de adaptación de bajo presupuesto desarrollado por el autor ya9919 en el marco del proyecto S²-MAS, un framework de simulación multiagente a escala social para estudiar decisiones financieras de hogares. El modelo parte del backbone oficial Qwen/Qwen3.5-4B-Base, que permanece congelado, y añade una cabeza escalar compartida que aprende a puntuar candidatos codificados de forma independiente. Su propósito no es la generación libre de texto, sino la clasificación de decisiones financieras de hogar a partir de un estado del hogar, una pregunta y un menú de candidatos.

La relevancia del checkpoint es metodológica: sirve como referencia de backbone congelado en una comparación anidada de presupuestos de entrenamiento, frente a variantes con LoRA que actualizan el backbone. Con 50.000 filas distintas de entrenamiento y 100.000 exposiciones acumuladas, el modelo alcanza un 67,34 % de accuracy y un 31,02 % de F1 macro por pregunta en un test de 240.458 registros, por debajo de la variante LoRA equivalente (73,73 % y 36,62 %). La licencia es restrictiva y solo permite uso científico no comercial.

El repositorio no contiene los pesos completos del modelo, sino únicamente el fichero `head.pt` junto con el script de inferencia `qwen_decision.py` y la configuración `decision_config.json`. El backbone y el tokenizador deben obtenerse por separado del repositorio oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base congelado) con cabeza escalar compartida de decisión |
| Parametros totales | 4B (backbone) más cabeza escalar; número exacto de parámetros de la cabeza no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (inferencia reportada en BF16 para el backbone y FP32 para el scoring de candidatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (uso científico no comercial, sin redistribución) |
| Formato de pesos | `head.pt` (PyTorch); el backbone se obtiene por separado en formato oficial de Qwen |

## Arquitectura y entrenamiento

El modelo sigue la ruta de "language model plus learned decision head": el backbone Qwen3.5-4B-Base se mantiene congelado y una cabeza escalar compartida aprende a puntuar candidatos que se codifican de forma independiente. La inferencia puntúa conjuntamente el estado completo del hogar, la pregunta y el menú completo de candidatos, y la decisión se toma seleccionando el candidato con mayor puntuación. El método de entrenamiento declarado es `head_only`, es decir, solo se actualizan los parámetros de la cabeza.

El entrenamiento utiliza 50.000 filas distintas de la partición de entrenamiento de decision-QA, con 250.000 exposiciones en la etapa terminal y un checkpoint seleccionado a las 100.000 exposiciones acumuladas. La selección del checkpoint se realiza con un conjunto de desarrollo fijo de 20.000 ejemplos; la partición de desarrollo completa (412.873 ejemplos) se emplea para comparar los dos métodos de adaptación de Qwen4B a 200k. El aprendizaje de decisiones se basa en datos de encuestas reales. La inferencia reportada usa BF16 en el backbone y FP32 en el scoring de candidatos.

## Capacidades

- Clasificación de decisiones financieras de hogar: responde preguntas de sí/no o de elección entre candidatos sobre productos financieros (tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo).
- Scoring de candidatos: puntúa cada opción del menú de forma independiente y selecciona la de mayor puntuación.
- Condicionamiento por estado del hogar: la inferencia requiere proporcionar un estado del hogar junto con la pregunta y el menú de candidatos.
- Salida determinista y sin decisiones inválidas: el checkpoint reporta 0 decisiones inválidas en el test común.
- No soporta generación libre de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en simulación multiagente: el checkpoint se integra en el framework S²-MAS como ruta de modelo de decisión con cabeza aprendida para estudiar cómo las decisiones de los hogares afectan al consumo, las reservas de efectivo y los pagos.
- Referencia de ablación con backbone congelado: sirve para aislar cuánto rendimiento aporta el aprendizaje únicamente en la cabeza frente a métodos que actualizan el backbone con LoRA, usando el mismo conjunto de 50.000 ejemplos únicos.
- Clasificación de tenencia de productos financieros: dado un estado de hogar sintético, determinar si posee tarjeta de crédito activa, cuenta de depósito a la vista en renminbi, cuenta de valores o depósitos a plazo no vencidos.
- Evaluación de métodos de adaptación de bajo presupuesto: el checkpoint forma parte de una comparación anidada de presupuestos de entrenamiento (50k, 100k, 200k) que permite medir la curva de rendimiento frente a exposiciones.
- Generación de datos sintéticos etiquetados: al puntuar menús de candidatos sobre estados de hogar generados, puede producir etiquetas de decisión para pipelines de simulación a mayor escala.
- Reproducción de benchmarks de decision-QA: con el script `qwen_decision.py` y el backbone oficial, permite reproducir las cifras de accuracy y F1 macro reportadas en el test común de 240.458 registros.

## Benchmarks y rendimiento

Test común de 240.458 registros QA, 119 versiones de pregunta y 8.275 grupos de hogar/encuestado. El checkpoint se selecciona con datos de desarrollo antes del test.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| **Este checkpoint (head-only, 50k)** | **67,3369** | **31,0166** | **0** |
| Qwen4B LoRA + head, mismas 50k QA únicas | 73,7289 | 36,6225 | 0 |

La accuracy pondera por igual cada registro del test y cuenta las decisiones inválidas como incorrectas. El F1 macro por pregunta promedia sobre cada clase de candidato definida en cada versión de pregunta y luego pondera las 119 versiones por igual. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El repositorio solo contiene `head.pt`; el backbone Qwen3.5-4B-Base debe descargarse por separado, por lo que el peso real en memoria lo determina el backbone.
- VRAM estimada para el backbone de 4B: aproximadamente 8 GB en BF16, y en torno a 2,5-3 GB con cuantización de 4 bits (estimación orientativa, no reportada por el autor).
- La inferencia reportada usa BF16 en el backbone y FP32 en el scoring de candidatos; el scoring puntúa el menú completo de candidatos, lo que añade overhead proporcional al número de opciones.
- GPU recomendadas: no especificadas por el autor. Un backbone de 4B en BF16 cabe en GPUs de consumo con 12-16 GB (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090); para mayor throughput se usarían A100 o H100.
- Opciones de despliegue: el autor proporciona `qwen_decision.py` como interfaz de inferencia; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (test común) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sharp-4b-head-50k (este) | 4B + cabeza | No disponible | 67,34 % accuracy; 31,02 % F1 macro | S²-MAS v1.2 (no comercial) | Solo `head.pt`; backbone aparte |
| Qwen4B LoRA + head, 50k | 4B + cabeza (LoRA) | No disponible | 73,73 % accuracy; 36,62 % F1 macro | Según checkpoint del proyecto | Entrada del proyecto S²-MAS |
| Qwen/Qwen3.5-4B-Base | 4B | No disponible | No evaluado en decision-QA | Licencia de Qwen (consultar) | Pesos completos en Hugging Face |

Las rutas restantes del benchmark S²-MAS (scoring con encoder, SFT de decisión next-token, clasificación con esquema dinámico, decisiones con encoder multimodal e interfaces de proveedor) no disponen de cifras desglosadas en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: S²-MAS Controlled Model Research License v1.2 permite únicamente uso científico no comercial, prohíbe la redistribución y prohíbe la ingeniería inversa, extracción o destilación no autorizadas.
- El repositorio no incluye los pesos del backbone ni el tokenizador; sin ellos el checkpoint es inutilizable.
- Solo inglés: no hay soporte documentado para otros idiomas.
- El modelo no genera texto libre; está especializado en seleccionar entre un menú de candidatos y requiere un estado de hogar como entrada.
- Rendimiento inferior a la variante LoRA con el mismo presupuesto de datos (67,34 % frente a 73,73 % de accuracy), lo que refleja la limitación de mantener el backbone congelado.
- Riesgo de sesgo: el aprendizaje se basa en datos de encuestas reales, cuyos sesgos de muestreo y cobertura pueden propagarse a las decisiones simuladas.
- Riesgo de alucinación no aplica en el sentido generativo, pero el modelo puede asignar puntuaciones erróneas a candidatos cuando el estado del hogar es atípico o está fuera de la distribución de entrenamiento.
- Los registros de entrenamiento y evaluación no se distribuyen, lo que limita la reproducibilidad completa.
- La implementación del motor GENESE/MAS permanece privada.
- No se documentan longitudes de contexto ni límites de tokens para el estado del hogar y el menú de candidatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-4b-head-50k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Licencia: https://huggingface.co/ya9919/qwen3.5-4b-base-finance-head-50k/blob/main/LICENSE
- Ejemplos QA (JSON): qa_examples.json (referenciado en la model card del repositorio)
