# ya9919/YN-4b-lora-50k

## Resumen

YN-4b-lora-50k es un adaptador LoRA con cabeza de decisión entrenado sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario ya9919 en el marco del proyecto S²-MAS (sociedad-escala multi-agente simulación). No es un modelo de chat generativo al uso: su función es puntuar menús de opciones discretas en encuestas financieras de hogares, produciendo una decisión categórica a partir de un estado del hogar, una pregunta y un conjunto completo de candidatos. El checkpoint se enmarca en un benchmark que compara seis rutas de modelado de decisión sobre un conjunto de test común de 240.458 registros QA.

El modelo combina adaptadores LoRA sobre el backbone de 4.000 millones de parámetros con una cabeza escalar compartida que puntúa cada candidato. Se entrenó con 50.000 filas distintas de un diseño anidado 50k/200k, usando el subconjunto de 50k para esta variante de presupuesto fijo. Su relevancia actual es metodológica: sirve como referencia reproducible para comparar la ruta "modelo de lenguaje + cabeza de decisión aprendida" frente a alternativas como scoring por encoder, SFT de siguiente token o clasificación dinámica de esquema.

La licencia es restrictiva (S²-MAS Controlled Model Research License v1.2, solo uso científico no comercial) y el modelo solo soporta inglés. El repositorio ocupa 0,1 GB y contiene únicamente el adaptador y la cabeza, no los pesos completos del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base) + adaptadores LoRA + cabeza escalar de decisión compartida |
| Parametros totales | 4B en el backbone (adaptador LoRA de tamaño no disponible; repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 para el backbone y FP32 para el scoring de candidatos) |
| Idiomas soportados | inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (uso científico no comercial) |
| Formato de pesos | safetensors (adaptador), head.pt (cabeza de decisión), adapter_config.json |

## Arquitectura y entrenamiento

El modelo sigue la ruta "language model with learned decision head": se parte de Qwen3.5-4B-Base (release pre-entrenado oficial, sin instrucción) y se añaden adaptadores LoRA junto con una cabeza escalar compartida que puntúa cada candidato del menú. La inferencia puntúa el estado completo del hogar, la pregunta y el menú completo de candidatos, y selecciona la opción de mayor puntuación. El backbone se mantiene en BF16 y el scoring de candidatos se ejecuta en FP32.

El entrenamiento usó 50.000 filas distintas de la partición de entrenamiento de decisión-QA, con 50.000 exposiciones acumuladas al checkpoint seleccionado. La selección del checkpoint se hizo sobre un conjunto de desarrollo fijo de 20.000 ejemplos; la partición de desarrollo completa (412.873 ejemplos) se reserva para comparar los dos métodos de adaptación Qwen4B a 200k. El aprendizaje de decisión se basa en datos de encuesta reales según la model card. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset más allá de la partición de QA financiero.

## Capacidades

- Clasificación de decisión sobre menús de candidatos discretos: puntúa cada opción y devuelve la de mayor score.
- Respuesta a preguntas financieras de hogar en formato de opción múltiple (uso de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo no vencidos, etc.).
- Condicionamiento sobre estado del hogar: la inferencia requiere proporcionar un estado de hogar además de la pregunta y el menú.
- Adaptación del backbone vía LoRA, lo que permite representaciones específicas del dominio financiero sobre el modelo base.
- Cabeza de decisión compartida entre preguntas, con scoring escalar por candidato.
- No soporta generación de texto libre, tool calling, agentes multi-paso ni multimodalidad según la información disponible.
- Solo inglés.

## Casos de uso

- Simulación de decisiones financieras de hogares a escala: integrar el checkpoint en el motor de transición de estados del proyecto S²-MAS para generar decisiones de consumo, reservas de efectivo y pagos en millones de agentes sintéticos.
- Benchmarking de métodos de decisión: usar este checkpoint como referencia de la ruta "LM + cabeza de decisión" frente a encoder scoring, SFT de siguiente token o clasificación dinámica de esquema en el conjunto de test común de 240.458 registros.
- Investigación sobre adaptación de bajo presupuesto: comparar el efecto de LoRA frente a cabeza con backbone congelado (referencia 67,34 % de accuracy) con el mismo presupuesto de 50.000 ejemplos únicos.
- Encuestas sintéticas de inclusión financiera: generar respuestas plausibles a preguntas de tenencia de productos bancarios para poblar datasets sintéticos con etiquetas controladas.
- Evaluación de robustez de modelos de decisión: analizar la tasa de decisiones inválidas (reportada como 0 en el test) y el F1 macro por pregunta en 119 versiones de pregunta.
- Estudio de sesgos en decisiones financieras sintéticas: examinar cómo el modelo distribuye respuestas entre clases candidatas en 8.275 grupos de hogar/encuestado.
- Prototipado de scoring de candidatos en dominios de encuesta: reutilizar la interfaz `qwen_decision.py` para adaptar el esquema de scoring a otros cuestionarios de opción múltiple.

## Benchmarks y rendimiento

Conjunto de test común: 240.458 registros QA, 119 versiones de pregunta, 8.275 grupos de encuestado/hogar. Checkpoint seleccionado con datos de desarrollo antes del test.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint (LoRA + cabeza, 50k) | 73,7289 | 36,6225 | 0 |
| Qwen4B solo cabeza, mismos 50k QA únicos | 67,3369 | 31,0166 | 0 |

La accuracy pondera cada registro por igual y cuenta las decisiones inválidas como incorrectas. El F1 macro por pregunta promedia sobre cada clase candidata definida dentro de cada versión de pregunta y luego pondera las 119 versiones por igual. No se han publicado en la información disponible resultados frente a las otras rutas del benchmark (encoder scoring, SFT de siguiente token, clasificación dinámica, encoder multimodal, interfaces de proveedor).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el backbone es de 4B parámetros, por lo que en BF16 requiere aproximadamente 8 GB solo para pesos, más overhead de activaciones y scoring de candidatos en FP32.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16-24 GB (RTX 4090, A10, L4) sería suficiente para BF16, y A100/H100 para lotes grandes.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) en BF16; en GPUs de 8-12 GB requeriría cuantización del backbone, aunque no se documentan recetas de cuantización.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; la model card indica una interfaz propia `qwen_decision.py` con scoring de candidatos en FP32 y backbone BF16.
- Latencia y throughput: no disponibles. El coste por inferencia escala con el número de candidatos del menú, ya que se puntúa el menú completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en test común | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-4b-lora-50k (este) | 4B + LoRA + cabeza | no disponible | 73,73 % accuracy / 36,62 % F1 macro | S²-MAS v1.2 (no comercial) | Hugging Face (adaptador) |
| Qwen4B solo cabeza, 50k | 4B (backbone congelado) + cabeza | no disponible | 67,34 % accuracy / 31,02 % F1 macro | misma familia | referencia del benchmark |
| Otras rutas del benchmark S²-MAS (encoder scoring, SFT siguiente token, clasificación dinámica, encoder multimodal, interfaces de proveedor) | no disponible | no disponible | no disponible en la información | no disponible | no disponible |

No se dispone de comparación con modelos de propósito general como Qwen3.5-4B-Base en modo generativo, ya que la tarea (scoring de menús de candidatos) no es directamente comparable.

## Limitaciones y advertencias

- Licencia S²-MAS Controlled Model Research License v1.2: uso científico no comercial únicamente; revisar el archivo LICENSE antes de cualquier uso.
- Solo inglés; no hay soporte multilingüe documentado.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- Requiere proporcionar un estado del hogar en inferencia; sin él, las respuestas no son válidas.
- El backbone debe obtenerse por separado (Qwen/Qwen3.5-4B-Base); el repositorio solo contiene adaptador y cabeza.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de decisiones incorrectas: la accuracy es del 73,73 %, con F1 macro del 36,62 %, lo que indica dificultad considerable en clases minoritarias.
- El modelo se entrena con datos de encuesta reales; pueden persistir sesgos de la población encuestada y del instrumento original.
- La implementación del motor GENESE/MAS permanece privada, lo que limita la reproducibilidad completa del pipeline.
- No se documentan longitudes de contexto, cuantizaciones soportadas ni latencias, lo que dificulta planificar despliegues en producción.
- El checkpoint se seleccionó con un conjunto de desarrollo de 20.000 ejemplos; el test común se usó solo para evaluación, pero no se detalla el protocolo de prevención de leakage más allá de esa separación.

## Enlaces

- Hugging Face: https://huggingface.co/ya9919/YN-4b-lora-50k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Licencia: https://huggingface.co/ya9919/YN-4b-lora-50k/blob/main/LICENSE
- Ejemplos QA (JSON): https://huggingface.co/ya9919/YN-4b-lora-50k/blob/main/qa_examples.json
