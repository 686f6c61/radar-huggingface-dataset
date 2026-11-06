# yotambr/safedecide-400m

## Resumen

SafeDecide-400M es un modelo de clasificación de texto desarrollado por el usuario yotambr, un fine-tuning del encoder Ettin-400M de JHU CLSP. Su particularidad no es la generación de texto, sino la toma de decisiones tipadas: recibe un estado y una pregunta estructurada (sí/no, elección única o puntuación) y devuelve una probabilidad por opción junto con una marca `automate`/`escalate` respaldada por una garantía estadística de riesgo controlado.

La relevancia del modelo reside en el mecanismo de control de riesgo Learn-then-Test: con probabilidad mayor o igual al 90% sobre el conjunto de calibración, la tasa de error entre las decisiones marcadas como `automate` no supera el 10% para datos intercambiables con el conjunto de calibración. Esta garantía no depende de que las probabilidades del modelo estén bien calibradas, lo que lo hace útil en entornos de producción donde se necesita una cota formal del error antes de automatizar decisiones.

Con 395,8 millones de parámetros, arquitectura ModernBERT y licencia Apache 2.0, el modelo está pensado para pipelines de decisión en inglés. Se distribuye en formato safetensors, se integra con la librería `transformers` y con Text Embeddings Inference, y forma parte de una familia junto al modelo más pequeño SafeDecide-140M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parámetros totales | 395.832.321 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 400M parámetros, inicializado desde `jhu-clsp/ettin-encoder-400m` y ajustado como clasificador de decisiones tipadas. La cabeza de salida produce una probabilidad por cada opción de la pregunta planteada, cubriendo tres tipos: `noul` (sí/no), `choice` (elección entre opciones) y `score` (puntuación). El ajuste se realizó sobre el split `train` del dataset `LocalLLaMA/typed-decisions`, que contiene 1.080 casos de entrenamiento más una partición de calibración de 600 decisiones.

La innovación central no está en la arquitectura sino en el procedimiento de certificación. Sobre un conjunto de calibración retenido se aplica Learn-then-Test con cotas exactas de Clopper-Pearson y testing de secuencia fija sobre una rejilla de umbrales, lo que produce umbrales certificados para distintos niveles de error (α = 5%, 10% y 20%). La receta de entrenamiento se eligió mediante validación cruzada de 5 particiones sobre el modelo de 140M y se reutilizó sin cambios en este modelo. Antes de evaluar el split `test`, se publicó el SHA-256 de `recipe.json` en la discusión #39 del dataset, y el pase de evaluación se ejecutó una sola vez con verificación de hashes.

## Capacidades

- Clasificación de decisiones tipadas: preguntas de sí/no, elección única y puntuación, con una probabilidad por opción.
- Emisión de una marca `automate`/`escalate` con garantía de riesgo controlado al nivel α seleccionado.
- Umbrales certificados para tres niveles de error: 5% (umbral 0,740), 10% (umbral 0,620) y 20% (umbral 0,420).
- Funcionamiento con probabilidades no calibradas: la garantía proviene del procedimiento estadístico, no de la calibración de las salidas.
- Soporte de selección selectiva de predicciones (selective prediction) y control de riesgo conformal.
- Integración con `transformers` y con Text Embeddings Inference; compatible con endpoints.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Automatización de atención al cliente: el modelo puede decidir si una consulta se resuelve automáticamente o se escala a un agente humano, con la garantía de que la tasa de error entre las decisiones automatizadas no supera el umbral certificado. En el workflow `customer_service` del benchmark obtiene una precisión de 0,822.
- Procesamiento de facturas: clasificación de decisiones en el flujo de `invoice_processing`, donde alcanza una precisión de 0,842, el mejor resultado entre los cuatro workflows evaluados. Adecuado para triaje documental con escalado de casos dudosos.
- Triaje de incidentes de seguridad: en el workflow `security_incidents` obtiene 0,778 de precisión; puede marcar incidentes para revisión automática o escalarlos a analistas según el umbral de riesgo elegido.
- Observabilidad de trazas de agentes: evaluación de trazas de agentes en el workflow `agent_trace_observability` (precisión 0,706), útil para decidir si una traza requiere inspección humana.
- Enrutamiento de decisiones en pipelines de producción: con el umbral α = 20% (0,420) el modelo automatiza el 90,7% de las decisiones sobre el conjunto de calibración, lo que permite maximizar el volumen automatizado cuando el coste del error es bajo.
- Moderación y clasificación con garantías formales: cualquier escenario donde se exija una cota estadística del error antes de delegar una decisión a un sistema automático, especialmente en dominios regulados.
- Evaluación de modelos de decisión: sirve como referencia en benchmarks de selective prediction y calibración gracias a sus resultados publicados y a las predicciones crudas disponibles en `yotambr/safedecide-results`.

## Benchmarks y rendimiento

Resultados sobre el split `test` de `typed-decisions` (400 casos, 2.000 decisiones), comparados con el modelo de 140M de la misma familia:

| Modelo | Accuracy ↑ | KL from gold ↓ | Brier ↓ | ECE ↓ | Automation @ 10% ↑ |
|---|---|---|---|---|---|
| SafeDecide-400M v0.2 (este modelo) | 0,787 | 0,083 | 0,045 | 0,171 | 52,4% ± 3,8% |
| SafeDecide-140M v0.2 | 0,748 | 0,113 | 0,061 | 0,140 | 40,6% ± 3,0% |
| SafeDecide-140M v0.1 | 0,754 | 0,126 | 0,069 | 0,147 | 33,2% ± 5,2% |

Desglose por tipo de pregunta:

| Tipo | n | Accuracy | KL | Brier | ECE |
|---|---|---|---|---|---|
| noul | 600 | 0,858 | 0,042 | 0,033 | 0,135 |
| choice | 600 | 0,748 | 0,115 | 0,060 | 0,169 |
| score | 800 | 0,762 | 0,089 | 0,045 | 0,202 |

Desglose por workflow:

| Workflow | n | Accuracy | KL | Brier | ECE |
|---|---|---|---|---|---|
| agent_trace_observability | 500 | 0,706 | 0,089 | 0,053 | 0,157 |
| customer_service | 500 | 0,822 | 0,094 | 0,047 | 0,196 |
| invoice_processing | 500 | 0,842 | 0,078 | 0,044 | 0,129 |
| security_incidents | 500 | 0,778 | 0,069 | 0,038 | 0,209 |

La ganancia de precisión frente a la versión v0.1 es de +3,3 puntos (intervalo bootstrap del 95% sobre casos: +1,4 a +5,2). El modelo queda por detrás de v0.1 únicamente en `agent_trace_observability` (0,706 frente a 0,738). El ECE es superior al de v0.1 (0,171 frente a 0,147), lo que indica probabilidades más afiladas de lo que justifica su precisión; la garantía de automatización no depende de este valor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 395,8M de parámetros en bf16 el peso ronda los 0,8 GB, y en fp32 alrededor de 1,6 GB (tamaño del repo).
- GPU recomendadas: los resultados publicados se obtuvieron en una A100 con autocast en bf16. Cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp32.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) con holgura.
- Opciones de despliegue: `transformers`, Text Embeddings Inference (el modelo está etiquetado como compatible con endpoints), y la librería propia `safedecide` (`pip install safedecide`). No hay exportación ONNX disponible.
- Latencia y throughput: en PyTorch con 1 hilo de CPU y una decisión de 3 opciones, 605 ms p50 y 622 ms p90. El modelo de 140M tarda 80 ms en la misma entrada y con el mismo hilo, por lo que se recomienda este último cuando la latencia en CPU sea crítica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test) | Automation @ 10% | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SafeDecide-400M v0.2 | 395,8M | no disponible | 0,787 | 52,4% | Apache 2.0 | Hugging Face |
| SafeDecide-140M v0.2 | no disponible | no disponible | 0,748 | 40,6% | Apache 2.0 | Hugging Face |
| SafeDecide-140M v0.1 | no disponible | no disponible | 0,754 | 33,2% | Apache 2.0 | Hugging Face |

No se dispone de comparación con modelos de clasificación de propósito general en la información proporcionada, ya que el benchmark `typed-decisions` está diseñado específicamente para decisiones tipadas y el modelo pertenece a la categoría "fitted or fine-tuned on train".

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- La garantía estadística es válida únicamente para datos intercambiables con el conjunto de calibración; distribuciones distintas invalidan la cota.
- El ECE es elevado (0,171), superior al del modelo de 140M, lo que indica que las probabilidades individuales no deben interpretarse como calibradas.
- En el workflow `agent_trace_observability` rinde por debajo de la versión v0.1 (0,706 frente a 0,738), por lo que no es la mejor opción para ese caso concreto.
- La latencia en CPU es alta (605 ms p50 con un hilo), lo que limita su uso en aplicaciones interactivas sin GPU.
- No hay exportación ONNX disponible, lo que restringe algunas rutas de despliegue optimizado.
- El modelo se entrenó sobre el split `train` de `typed-decisions`, por lo que sus resultados deben interpretarse dentro de la categoría de modelos ajustados en ese benchmark.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en decisiones fuera de la distribución de calibración.
- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la garantía de riesgo solo es válida bajo el supuesto de intercambiabilidad con el conjunto de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yotambr/safedecide-400m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Modelo más pequeño: https://huggingface.co/yotambr/safedecide-140m
- Código: https://github.com/yotambraun/safedecide
- Predicciones crudas: https://huggingface.co/datasets/yotambr/safedecide-results
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Discusión con el sello SHA-256: https://huggingface.co/datasets/LocalLLaMA/typed-decisions/discussions/39
