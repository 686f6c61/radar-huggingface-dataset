# ya9919/laya-finance-matched-sft-rlcd-200k

## Resumen

`laya-finance-matched-sft-rlcd-200k` es un checkpoint de investigación desarrollado por el usuario `ya9919` en el marco del proyecto S²-MAS, un entorno de simulación multiagente a escala social orientado a estudiar decisiones financieras de hogares. El modelo no es un generador de texto conversacional, sino un encoder con cabeza de decisión que puntúa opciones candidatas ante preguntas financieras de opción múltiple. Se inicializa desde `ya9919/laya-finance-matched-sft-200k` y aplica una pasada adicional de 200.000 filas con el método RLCD (cross-entropy combinada con un término de policy-gradient sobre logits de opciones ruidosas).

Técnicamente parte de un encoder `answerdotai/ModernBERT-large` con una cabeza de decisión Laya de dos capas, sumando 421.293.830 parámetros en formato safetensors (0,8 GB en el repositorio). Su relevancia es acotada y muy específica: sirve como referencia de adaptación con presupuesto fijo dentro de la comparativa de rutas de decisión del paper S²-MAS, no como modelo de propósito general.

La licencia es restrictiva (S²-MAS Controlled Model Research License v1.2): uso científico no comercial, sin redistribución ni extracción. El modelo está entrenado y evaluado únicamente en inglés y su interfaz de inferencia es la nativa de Laya, no la de `transformers` estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de decisión Laya de dos capas |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 nativo) |
| Idiomas soportados | inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (uso científico no comercial, sin redistribución) |
| Formato de pesos | safetensors |
| Biblioteca | laya |
| Modelo base | ya9919/laya-finance-matched-sft-200k |
| Tamaño del repositorio | 0,8 GB |
| Precisión de inferencia | PyTorch BF16 nativo |

## Arquitectura y entrenamiento

El modelo es un encoder `answerdotai/ModernBERT-large` fine-tuneado con la cabeza de decisión original de Laya, que puntúa conjuntamente el estado del hogar, la pregunta y el menú completo de opciones candidatas. La inferencia no genera texto libre: produce una puntuación por opción y selecciona la respuesta. Esto lo sitúa en la ruta de "encoder option scoring" de las seis rutas de decisión comparadas en el paper S²-MAS.

El entrenamiento parte del checkpoint SFT200 y ejecuta una pasada adicional de continuación RLCD sobre las mismas 200.000 filas distintas de la partición de entrenamiento de QA de decisión. RLCD combina la cross-entropy con un término de policy-gradient de tipo proper-score sobre logits ruidosos de las opciones. Las exposiciones acumuladas del checkpoint seleccionado son 400.000 filas (200.000 distintas), y la selección del punto de control se hizo con un conjunto de desarrollo fijo de 20.000 ejemplos. El proyecto declara que el aprendizaje de decisiones usa datos de encuestas reales; los registros de entrenamiento y evaluación no se distribuyen y el motor GENESE/MAS permanece privado.

## Capacidades

- Clasificación de elección múltiple sobre preguntas financieras de hogar (uso de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo no vencidos, etc.).
- Puntuación de menús completos de opciones candidatas, no solo generación de una respuesta.
- Procesamiento conjunto de estado del hogar, pregunta y menú de opciones.
- Salida con cero decisiones inválidas en el test común reportado.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso en el sentido de un LLM conversacional.
- Capacidad multilingüe: no disponible (solo inglés).
- Capacidades especiales: no disponible más allá de la cabeza de decisión.

## Casos de uso

- Simulación de decisiones financieras de hogares: el modelo puntúa opciones de respuesta ante preguntas de encuesta financiera, alimentando el motor de transición de estados del framework S²-MAS para estudiar consumo, reservas de efectivo y pagos.
- Investigación comparativa de métodos de decisión: sirve como checkpoint de referencia de la ruta "encoder option scoring" frente a las otras cinco rutas del paper (LLM con cabeza de decisión, SFT next-token, clasificación dinámica, encoder multimodal e interfaces de proveedor).
- Replicación de experimentos con presupuesto fijo: al compartir padre y presupuesto de pasada adicional con el control de continuación CE, permite aislar el efecto del término RLCD en la comparativa.
- Evaluación de robustez en QA financiera de opción múltiple: con 240.458 registros de test, 119 versiones de pregunta y 8.275 grupos de hogar, es adecuado para medir accuracy y F1 macro por pregunta.
- Análisis de calibración de decisiones: la cabeza de decisión produce puntuaciones por opción que pueden analizarse para estudiar la confianza del modelo en escenarios sintéticos de hogares.
- Docencia e investigación académica en modelado de agentes económicos: únicamente en el ámbito científico no comercial permitido por la licencia.

## Benchmarks y rendimiento

Test común retenido de 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de hogar. La selección del checkpoint se hizo con datos de desarrollo antes del test.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| **Este checkpoint** | **73,9268** | **36,0503** | **0** |
| Padre SFT200 | 73,8753 | 35,9949 | 0 |
| Laya nativo original, referencia BF16 emparejada | 60,1972 | 29,5995 | 0 |

Frente a su padre SFT200, el paper reporta +0,0516 puntos de accuracy (IC 95 %: 0,0029–0,1020) y +0,0554 puntos de F1 macro por pregunta (−0,0380–0,1654). Las diferencias emparejadas se calculan sobre las predicciones subyacentes antes del redondeo mostrado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421 M de parámetros en BF16 el peso ronda los 0,84 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 2–4 GB de VRAM libre debería ser suficiente en BF16.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (no se especifican modelos concretos).
- Opciones de despliegue: interfaz nativa de Laya con la configuración de encoder, tokenizer y cabeza de decisión suministradas. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy en test común | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-finance-matched-sft-rlcd-200k | 421.293.830 | no disponible | 73,9268 % | S²-MAS Controlled Research v1.2 | Hugging Face (65 descargas) |
| laya-finance-matched-sft-200k (padre) | no disponible | no disponible | 73,8753 % | no disponible | Hugging Face |
| Laya nativo original (referencia BF16) | no disponible | no disponible | 60,1972 % | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con modelos de la misma categoría fuera del conjunto de rutas del paper S²-MAS.

## Limitaciones y advertencias

- Modelo de investigación acotado: no es un LLM generativo; solo puntúa opciones candidatas en un formato de QA financiera concreto.
- Licencia restrictiva: uso científico no comercial, sin redistribución, sin ingeniería inversa, extracción o destilación no autorizadas. El uso comercial no está permitido.
- Solo inglés; no hay soporte multilingüe declarado.
- Los registros de entrenamiento y evaluación no se distribuyen y el acceso a los datos fuente requiere autorización del proveedor.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto), pero las puntuaciones de opción pueden ser incorrectas en estados de hogar fuera de distribución.
- La mejora frente al padre es muy pequeña (+0,0516 puntos de accuracy) y el intervalo de confianza de F1 incluye valores negativos; la ventaja no es concluyente.
- Requiere el estado del hogar en tiempo de inferencia; sin él, las respuestas no son válidas.
- El motor GENESE/MAS es privado, lo que limita la reproducibilidad completa del entorno de simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-200k
- Modelo base: https://huggingface.co/ya9919/laya-finance-matched-sft-200k
- Licencia: https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-200k/blob/main/LICENSE
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Ejemplos de QA (JSON): https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-200k/blob/main/qa_examples.json
- Encoder base: https://huggingface.co/answerdotai/ModernBERT-large
