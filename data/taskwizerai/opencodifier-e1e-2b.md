# TaskWizerAI/opencodifier-e1e-2b

## Resumen

OpenCodifier E1-E es un adaptador LoRA que convierte el modelo base Qwen/Qwen3.5-2B en un modelo de decisión de tipo "Jev": en lugar de generar texto libre, las probabilidades se leen directamente de los log-probabilities de los tokens de etiqueta en la posición de respuesta. No se genera nada ni se parsea nada; el producto es una distribución calibrada sobre un conjunto cerrado de opciones tipadas. Lo desarrolla TaskWizerAI (autor Michael Kinney) como el escalón de decisión de la escalera OpenCodifier, y es el primer brazo entrenado por el propio proyecto que supera ambas piernas del release gate.

El adaptador resuelve un problema concreto: tomar decisiones de múltiple elección (enrutamiento, selección de herramienta, gradación ordinal) con probabilidades a nivel de token calibradas, que es justo lo que un modelo de chat no ofrece de forma fiable. Con 2B parámetros en el base y un adaptador LoRA de tamaño mínimo (repo de 0.0 GB), está pensado para integrarse en el motor OpenCodifier con una puerta de confianza que permite abstenerse o escalar a un escalón superior cuando la lectura es poco fiable.

Es relevante ahora porque demuestra que un adaptador pequeño sobre un base de 2B puede superar umbrales de publicación en un benchmark público de decisiones (JevBench-231, accuracy 0.6840 frente a un listón de 0.6494) con latencia de 0.58 s p50 en una sola V100. La debilidad está en las familias composicionales y relacionales, no en el enrutamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base Qwen/Qwen3.5-2B); lectura de log-probs en slot de veredicto |
| Parametros totales | 2B en el modelo base; adaptador LoRA de tamaño no especificado (repo 0.0 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia reportados en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-2B mediante PEFT y sustituye el comportamiento generativo por una cabeza de lectura: se evalúan los log-probabilities de los tokens de etiqueta de veredicto en la posición de respuesta, de modo que la salida es una distribución de probabilidad sobre opciones tipadas. El corpus de entrenamiento es merged-v3, con 173.452 registros (las tasas de composición y join se detallan en TRAINING.md del repositorio OpenCodifier); el corpus no se publica con el adaptador. El schedule fue de 11.009 pasos en una única V100 (T5500) en fp16.

La calibración se ajustó con temperatura T=3.362 sobre un holdout etiquetado, reduciendo el ECE de holdout de 0.179 a 0.117; el artefacto de calibración se distribuye en el repositorio OpenCodifier en `calibration/e1e-qwen3.5-2b-holdout.json`. No se reportan innovaciones de decodificación especulativa ni atención lineal; la innovación es el propio esquema de lectura por slot de veredicto y la puerta de confianza del motor.

## Capacidades

- Decisiones de múltiple elección tipadas con probabilidades calibradas a nivel de token (no genera texto libre).
- Enrutamiento y selección de herramienta: familias de routing y tool-selection reportadas a 1.00 en la evaluación por familia.
- Gradación ordinal: familia ordinal reportada a 1.00.
- Lectura determinista de veredicto: sin generación ni parseo posterior.
- Integración con puerta de confianza del motor OpenCodifier: abstención o escalado a un escalón superior ante lecturas de baja confianza.
- Calibración de temperatura suministrada como artefacto (T=3.362, solo análisis sobre el board).
- Capacidades multilingües: no disponibles.
- Tool calling generativo, agentes multi-paso, visión, audio o modo thinking: no disponibles; fuera del alcance declarado.

## Casos de uso

- Enrutamiento de peticiones en un pipeline de agentes: el adaptador lee la probabilidad de cada ruta candidata en el slot de veredicto y el motor decide con umbral de confianza; encaja porque las familias de routing puntúan 1.00 en la evaluación por familia.
- Selección de herramienta en un sistema de function calling: dado un conjunto cerrado de herramientas, se obtiene una distribución sobre ellas sin generar ni parsear texto, lo que elimina errores de formato.
- Gradación ordinal de salidas (por ejemplo, severidad o calidad en una escala): la familia ordinal puntúa 1.00, y la lectura por log-probs da una probabilidad directamente utilizable como score.
- Puerta de abstención en producción: con la calibración de holdout (ECE 0.117) y la tasa auto-decidable del 10,0% a 5% de riesgo, el modelo se usa como primer escalón que deriva los casos dudosos a un modelo mayor.
- Clasificación de decisiones con latencia ajustada: p50 de 0.58 s en una sola V100 permite desplegarlo como componente síncrono en flujos de decisión de alta frecuencia.
- Evaluación comparativa de rungs en la escalera OpenCodifier: sirve como referencia de decisión de 2B para medir si un escalón superior aporta ganancia real en familias concretas.

## Benchmarks y rendimiento

Datos del split público JevBench-231 (231 ítems), lectura determinista, fp16, una sola V100, según BENCHMARKS.md y TRAINING.md §9.9.1 del repositorio OpenCodifier.

| Metrica | Valor |
|---|---|
| JevBench-231 accuracy | 0.6840 (listón de publicación 0.6494) |
| Suite holdout interna | 0.8083 (gate ≥ 0.75, GATE_PASS; replicado por semilla 0.8000) |
| ECE en bruto (board) | 0.207 |
| ECE con temperatura ajustada en holdout (T=3.362) | 0.127 |
| Auto-decidable a 5% de riesgo | 0.100 (23/231) |
| Brier | 0.504 |
| Latencia p50 | 0.58 s |

Rendimiento por familia: routing, tool-selection y ordinal a 1.00; las familias relacionales y composicionales son el punto débil (multi_hop 0.389, judge_hard 0.412, long_policy 0.368). El autor señala que el board se pierde en familias composicionales, no en enrutamiento, y que la palanca candidata es datos con soft-labels de sesgo relacional, no más parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base es de 2B parámetros y el adaptador LoRA es de tamaño mínimo (repo 0.0 GB). En fp16, un base de 2B requiere del orden de 4-5 GB de pesos, más overhead de activaciones y del harness de lectura.
- GPU recomendadas: el entrenamiento y la evaluación se hicieron en una V100; no se reportan pruebas en otras GPU.
- GPU de consumo: no se reporta compatibilidad explícita; por tamaño del base (2B) es plausible en GPU de consumo con suficiente VRAM, pero no está verificado en la información disponible.
- Opciones de despliegue: PEFT + transformers con `PeftModel.from_pretrained` sobre Qwen/Qwen3.5-2B; el harness de lectura y la forma de cableado del adaptador Jev están en el repositorio OpenCodifier. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 0.58 s en una sola V100; no se reporta throughput.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos alternativos en la información proporcionada. Como referencia interna del propio proyecto, el adaptador se sitúa en el escalón de decisión de la escalera OpenCodifier y supera el listón de publicación de JevBench-231 (0.6840 frente a 0.6494), pero no hay datos de otros adaptadores o modelos de decisión comparables en la documentación disponible.

| Modelo | Parametros | Contexto | JevBench-231 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenCodifier E1-E (este) | 2B base + LoRA | no disponible | 0.6840 | Apache-2.0 | HuggingFace (adaptador) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fuera de alcance la generación libre: la capacidad de chat general del modelo base no se preserva ni se reclama.
- No evaluado para seguridad del contenido generado; el adaptador es una cabeza de lectura, no un modelo de chat.
- Debilidad marcada en familias composicionales y relacionales: multi_hop 0.389, judge_hard 0.412, long_policy 0.368.
- Calibración en bruto deficiente (ECE 0.207); la temperatura T=3.362 se ajustó en holdout y se marca como solo análisis sobre el board, no como calibración validada en el board.
- Tasa auto-decidable baja al 5% de riesgo: 0.100 (23/231), lo que limita la cobertura automática.
- Brier de 0.504, indicativo de una calidad probabilística moderada.
- El corpus de entrenamiento (merged-v3, 173.452 registros) no se publica con el adaptador, lo que dificulta la reproducibilidad del entrenamiento.
- Longitud de contexto, idiomas soportados y cuantizaciones no disponibles; no se debe asumir soporte multilingüe ni cuantización GGUF.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluación de seguridad y de datos de sesgo debe tenerse en cuenta en producción.

## Enlaces

- HuggingFace: https://huggingface.co/TaskWizerAI/opencodifier-e1e-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio OpenCodifier: https://github.com/aliasfoxkde/OpenCodifier
- Benchmarks: https://github.com/aliasfoxkde/OpenCodifier/blob/main/docs/BENCHMARKS.md
- Documentación de entrenamiento: https://github.com/aliasfoxkde/OpenCodifier/blob/main/docs/TRAINING.md
- Artefacto de calibración: `calibration/e1e-qwen3.5-2b-holdout.json` en el repositorio OpenCodifier
