# ya9919/sharp-4b

## Resumen

FinQ (publicado en Hugging Face como `ya9919/sharp-4b`) es un adaptador LoRA con una cabeza de decisión escalar entrenada sobre `Qwen/Qwen3.5-4B-Base` para tareas de elección financiera de hogares (financial QA de opción múltiple). No es un modelo de lenguaje autónomo: requiere el backbone Qwen3.5-4B oficial por separado y devuelve una puntuación escalar por candidato en lugar de texto generado. Forma parte del marco S²-MAS, un entorno de simulación multiagente a escala social para estudiar decisiones de consumo, reservas de efectivo y pagos.

El modelo se entrena con 200.000 filas distintas de un conjunto de QA de decisión financiera y se selecciona sobre un conjunto de desarrollo fijo de 20.000 ejemplos. Su relevancia es metodológica: sirve como checkpoint de referencia de "presupuesto fijo" para comparar rutas de modelado de decisión (encoder, LM con cabeza aprendida, SFT next-token, clasificación dinámica, encoder multimodal e interfaces de proveedor) dentro del benchmark del paper S²-MAS.

La licencia es propietaria y restringida (`s2-mas-controlled-research-v1.2`, uso de investigación controlado), el idioma declarado es únicamente inglés y el repositorio pesa 0,1 GB (solo adaptador y cabeza). No hay pipeline declarado ni métricas de benchmarks generales publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base) + adaptador LoRA + cabeza de decisión escalar compartida |
| Parametros totales | 4B en el backbone (no disponible el desglose exacto de parámetros del adaptador y la cabeza) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 para el backbone y FP32 para el scoring de candidatos) |
| Idiomas soportados | en (inglés) |
| Licencia | s2-mas-controlled-research-v1.2 (other, uso de investigación controlado) |
| Formato de pesos | safetensors (`adapter/adapter_model.safetensors`) + `head.pt` + `adapter/adapter_config.json` |

## Arquitectura y entrenamiento

El modelo sigue la ruta "language model + learned decision head": se congelan parcialmente los pesos del backbone Qwen3.5-4B-Base y se entrenan simultáneamente adaptadores LoRA y una cabeza escalar compartida que puntúa cada opción candidata de una pregunta de decisión. La inferencia se realiza con el backbone en BF16 y el scoring de candidatos en FP32. El paquete incluye `head.pt`, `adapter/adapter_config.json` y `adapter/adapter_model.safetensors`; el backbone y el tokenizador oficiales deben obtenerse por separado.

El entrenamiento usa 200.000 filas distintas de la partición fija de QA de decisión, con 200.000 exposiciones acumuladas en el checkpoint seleccionado. La selección se hace sobre un conjunto de desarrollo fijo de 20.000 ejemplos, mientras que la comparación entre los dos métodos de adaptación Qwen4B de 200k se realiza sobre la partición de desarrollo completa de 412.873 ejemplos. El aprendizaje de decisión se apoya en datos de encuestas reales. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento del backbone, composición del dataset, RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Clasificación de decisión financiera de opción múltiple: dado un estado del hogar y una pregunta con menú de candidatos, devuelve una puntuación escalar por opción.
- Preguntas de tenencia y uso de productos financieros: tarjetas de crédito activas, cuentas de depósito a la vista en renminbi, cuentas de negociación de acciones, depósitos a plazo no vencidos.
- Adaptación de representación del backbone mediante LoRA (frente al checkpoint head-only, que mantiene el backbone congelado).
- Integración en el benchmark S²-MAS como uno de los sistemas de la ruta "LM + cabeza de decisión".
- No soporta generación de texto libre, tool calling, function calling, agentes multi-paso ni razonamiento multi-turno: la salida es una puntuación de candidato, no texto.
- Capacidades multilingües: solo inglés declarado.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Simulación de decisiones de hogar a escala: usar el modelo como política de decisión dentro del motor de transición de estados de S²-MAS para generar elecciones de productos financieros por hogar sintético, aprovechando que la cabeza escalar produce decisiones discretas sin generación de texto.
- Benchmarking de métodos de adaptación: emplear este checkpoint como referencia de "presupuesto fijo" (200k filas) para comparar LoRA + cabeza frente a head-only, SFT next-token o clasificación dinámica bajo el mismo test retenido.
- Estudio de representación vs. cabeza: comparar este modelo con el checkpoint head-only de 200k para aislar cuánto aporta la adaptación LoRA del backbone frente a una cabeza entrenada sobre representaciones congeladas.
- Investigación académica sobre comportamiento financiero: analizar la precisión por versión de pregunta (119 versiones) y por grupo de hogar (8.275 grupos) para detectar sesgos sistemáticos en la predicción de tenencia de productos.
- Evaluación de robustez ante formulaciones: al existir 119 versiones de pregunta en el test, sirve para medir la sensibilidad del modelo a variaciones de redacción de la misma consulta financiera.
- Prototipado de encuestas asistidas: puntuar automáticamente respuestas candidatas en cuestionarios de finanzas de hogares para prellenar o validar respuestas en pipelines de encuesta, siempre en inglés y con el backbone Qwen3.5-4B desplegado localmente.

## Benchmarks y rendimiento

Datos del test retenido común: 240.458 registros QA, 119 versiones de pregunta y 8.275 grupos de hogar/encuestado.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| FinQ · Qwen3.5-4B-Base + LoRA + cabeza · 200k QA | 74,1435 | 36,7343 | 0 |
| Qwen4B head-only, mismas 200k QA únicas | 67,2841 | 30,8995 | 0 |

La accuracy pondera cada registro por igual y las decisiones inválidas cuentan como incorrectas. El F1 macro por pregunta promedia sobre cada clase candidata definida dentro de cada versión de pregunta y luego pondera las 119 versiones por igual. El checkpoint se selecciona con datos de desarrollo antes de este test. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, un backbone de 4B en BF16 requiere aproximadamente 8 GB solo para pesos, más overhead de activaciones y del scoring FP32 de candidatos.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del backbone, cabría esperar GPUs de 16-24 GB o superiores, pero no está confirmado por el autor.
- ¿Cabe en GPU consumer? No confirmado; un backbone 4B en BF16 es compatible con GPUs consumer de 16 GB o más en términos de pesos, pero el requisito exacto del pipeline LoRA + cabeza no está documentado.
- Opciones de despliegue: no disponibles; el paquete es PEFT (adaptador LoRA + `head.pt`), por lo que requiere cargar el backbone Qwen3.5-4B oficial con la librería PEFT y ejecutar el scoring de candidatos manualmente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el test común | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinQ (este modelo) | 4B + LoRA + cabeza | no disponible | 74,14 % accuracy / 36,73 % F1 macro | s2-mas-controlled-research-v1.2 | Adaptador PEFT público |
| Qwen4B head-only 200k | 4B (backbone congelado) + cabeza | no disponible | 67,28 % accuracy / 30,90 % F1 macro | no disponible | Checkpoint de comparación del mismo proyecto |
| FinL | no disponible | no disponible | no disponible | no disponible | Ruta encoder completa en inglés, público en el mismo proyecto |
| FinL-mlx | no disponible | no disponible | no disponible | no disponible | Runtime MLX FP16 de FinL |

No se dispone de comparación con modelos de propósito general (por ejemplo, Qwen3.5-4B-Base sin adaptar u otros modelos de 4B) en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria y restrictiva (`s2-mas-controlled-research-v1.2`): uso comercial no permitido salvo autorización expresa; revisar el enlace de licencia antes de cualquier despliegue.
- No es un modelo generativo: no produce texto, solo puntuaciones de candidatos; no sirve para chat, generación de código ni tareas de razonamiento abierto.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Solo disponible el adaptador y la cabeza; el backbone Qwen3.5-4B-Base debe obtenerse por separado y su disponibilidad depende del repositorio oficial.
- Riesgo de sesgo: entrenado con datos de encuestas reales sobre productos financieros (incluidos productos en renminbi), lo que puede introducir sesgos específicos de la población encuestada.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de decisiones incorrectas con confianza alta: la accuracy del 74,14 % implica un 25,86 % de error en el test retenido.
- El F1 macro por pregunta (36,73 %) es notablemente bajo, lo que indica dificultad para discriminar clases minoritarias dentro de cada versión de pregunta.
- Sin datos publicados de contexto máximo, cuantizaciones soportadas, latencia ni throughput, lo que dificulta planificar producción.
- El motor GENESE/MAS del proyecto permanece privado, por lo que la integración completa en la simulación no es reproducible con los artefactos públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/ya9919/FinQ/blob/main/LICENSE
- Checkpoint paralelo FinL: https://huggingface.co/ya9919/FinL
- Runtime MLX de FinL: https://huggingface.co/ya9919/FinL-mlx
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio S²-MAS: https://github.com/KataDavidXD/s2-mas
- Ejemplos QA en JSON: https://huggingface.co/ya9919/sharp-4b/qa_examples.json
