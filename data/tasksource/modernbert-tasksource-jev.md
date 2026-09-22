# tasksource/modernbert-tasksource-jev

## Resumen

ModernBERT-JEV es un modelo de clasificación de texto desarrollado por tasksource, construido sobre `answerdotai/ModernBERT-base` (149 M de parámetros, 22 capas, encoder bidireccional, contexto nativo de hasta 8.192 tokens) al que se le añade una cabeza de decisión de cross-attention consultada por opciones. No es un modelo generativo: su función es resolver decisiones tipadas, es decir, elegir entre un conjunto de K opciones candidatas dado un contexto (pregunta y estado), devolviendo logits y probabilidades calibradas sobre esas opciones.

El problema que resuelve es el coste computacional de la clasificación con muchos candidatos. Un cross-encoder clásico concatena cada opción con el contexto y vuelve a ejecutar el encoder K veces, con un coste O(K × (L + M)²); las arquitecturas de presupuesto compartido de tokens de opción (como Laya) sufren escasez de tokens cuando K es alto. ModernBERT-JEV codifica el contexto una sola vez, codifica cada opción de forma independiente con el encoder compartido y las consulta mediante cross-attention de 8 cabezas, con una complejidad total de O(L²) + O(Σ M_k²) + O(K × L). El resultado es escalabilidad suave hasta K = 255 opciones sin truncamiento de tokens ni errores de memoria.

Es relevante porque combina tres propiedades poco frecuentes en un modelo de 152.711.041 parámetros: equimutabilidad estructural ante permutaciones (sesgo de posición nulo verificado empíricamente), calibración nativa (ECE de 0,0291 sin temperatura post-hoc) y latencias de milisegundos incluso con 77 clases. La model card reporta resultados modestos en precisión cero-disparo, por lo que su uso realista pasa por ajuste fino sobre dominios concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base) con cabeza de decision de cross-attention consultada por opciones (8 cabezas) + LayerNorm residual + MLP |
| Parametros totales | 152.711.041 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 8.192 tokens (contexto nativo de ModernBERT-base) |
| Tipos de cuantizacion | no especificados por el autor; el repo solo distribuye safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,3 GB) |
| Libreria | transformers |
| Pipeline | text-classification |
| Primitivas de decision | `choice` (categorica), `noul` (binaria/politica), `score` (ordinal acotada) |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura parte de ModernBERT-base como encoder compartido. Dado un contexto (pregunta + estado) y K opciones candidatas, el modelo produce H_context ∈ R^(L×d) codificando el contexto una sola vez, y q_k ∈ R^d codificando cada opción de forma independiente con los mismos pesos. El conjunto Q = [q_1 ... q_K] se usa como consulta en un mecanismo de cross-attention que atiende a H_context; la salida pasa por LayerNorm residual y un MLP que emite K logits, normalizados con softmax sobre las opciones. Esta construcción es estructuralmente equimutante ante permutaciones: permutar las opciones equivale a permutar los logits, lo que garantiza ausencia de sesgo posicional.

La cabeza soporta tres primitivas canónicas condicionadas por embeddings de primitiva: `choice` (elección múltiple categórica, por ejemplo enrutado de intención o triaje multiclase), `noul` (juicios binarios matizados y de cumplimiento de políticas, con opciones `["no", "yes"]`) y `score` (escalas ordinales acotadas, por ejemplo 0 a 5), entrenada con entropía cruzada universal combinada con Ranked Probability Score (RPS) para preservar la geometría de distancia numérica. La model card indica que el modelo se beneficia de destilación con objetivos suaves (soft-target distillation), lo que explica su calibración nativa; no se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Sí se mencionan conjuntos de evaluación internos y ajenos al entrenamiento (Sarge, tareas de tasksource, `LocalLLaMA/typed-decisions`), lo que sugiere entrenamiento supervisado sobre decisiones tipadas con separación estricta respecto a los benchmarks reportados.

## Capacidades

- Clasificación de texto con conjuntos de opciones de cardinalidad variable (K = 2 hasta 255, según el estudio de escalado de cardinalidad).
- Decisiones categóricas (`choice`): enrutado de intención, clasificación de tema, triaje multiclase.
- Decisiones binarias y de cumplimiento de políticas (`noul`), con opciones `["no", "yes"]`.
- Puntuaciones ordinales acotadas (`score`, por ejemplo 0 a 5) con pérdida RPS que preserva el orden numérico.
- Salida probabilística calibrada directamente, sin reescalado de temperatura posterior (ECE de 0,0291 en el conjunto de validación reportado).
- Equimutabilidad ante permutaciones: la tasa de cambio de argmax bajo permutación aleatoria de opciones es 0,0000 %, con divergencia Jensen-Shannon media y máxima de 0,000000e+00.
- Eficiencia en alta cardinalidad: procesa una decisión de 77 clases en 11,93 ms en una NVIDIA A30, sin errores de memoria ni truncamiento de tokens.
- Codificación de contexto con ventana nativa de hasta 8.192 tokens.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es un modelo discriminativo de clasificación.

## Casos de uso

- Enrutado de intención en asistentes conversacionales: se pasa la consulta del usuario como contexto y el catálogo de intenciones como opciones `choice`, obteniendo una distribución calibrada que permite derivar a un humano cuando la confianza es baja.
- Clasificación de tickets de soporte con taxonomías amplias: la arquitectura escala a decenas o cientos de categorías (77 clases medidas a 11,93 ms) sin el coste lineal en K de un cross-encoder, lo que la hace viable en colas de alta concurrencia.
- Moderación y cumplimiento de políticas: la primitiva `noul` permite formular juicios binarios de cumplimiento con probabilidades calibradas, útil para umbrales auditables en revisiones automatizadas.
- Encuestas y valoraciones con escalas ordinales: la primitiva `score` predice valoraciones de 0 a 5 preservando la distancia numérica mediante RPS, adecuada para imputar o agregar respuestas en paneles.
- Investigación en calibración y decisiones tipadas: al exponer ECE, NLL y Brier score de forma nativa, sirve como baseline reproducible en el benchmark `LocalLLaMA/typed-decisions`.
- Componente de ranking o reranking de opciones: al ser equimutante ante permutaciones, puede usarse para puntuar conjuntos de candidatos donde el orden de presentación no debe influir en el resultado.
- Etiquetado de grandes corpus en inglés: con 152,7 M de parámetros y 0,3 GB de pesos, el modelo se ejecuta en una única GPU de gama media, lo que permite procesar volúmenes altos de documentos con contexto largo (hasta 8.192 tokens).
- Extracción de señales estructuradas en pipelines de datos: combinado con expresiones regulares o recuperación previa, puede decidir entre opciones predefinidas (por ejemplo, tipo de entidad contractual o categoría de gasto) en procesos ETL.

## Benchmarks y rendimiento

Transferencia cero-disparo en benchmarks públicos aislados del entrenamiento:

| Benchmark | Clases (K) | Latencia | Precision | NLL | ECE |
|---|---|---|---|---|---|
| AG News | 4 | 5,18 ms/decision | 24,07 % | 1,4056 | 0,0475 |
| DAIR Emotion | 6 | 4,74 ms/decision | 29,55 % | 1,7587 | 0,0160 |
| Banking77 | 77 | 11,93 ms/decision | 2,05 % | 4,3652 | 0,0019 |

Decisiones tipadas (`LocalLLaMA/typed-decisions`, 2.000 decisiones canónicas):

| Primitiva | Precision | NLL | Brier score | Metrica adicional |
|---|---|---|---|---|
| `noul` (politica/binaria) | 62,67 % | 0,6589 | 0,1671 | no disponible |
| `score` (ordinal) | 20,88 % | 1,4371 | 0,2414 | MAE: 0,7051 |
| `choice` (categorica) | 16,83 % | 1,4747 | 0,2936 | no disponible |
| Macro global | 32,20 % | 1,2149 | 0,2348 | ECE: 0,0790 |

Heldouts internos de tasksource y Sarge:

| Split de evaluacion | Metrica | Resultado |
|---|---|---|
| Sarge test (30k) | Precision / NLL | 68,20 % / 0,7045 |
| Sarge fuera de distribucion (OOD) | Precision / NLL | 57,00 % / 0,8802 |
| Tasksource tareas no vistas (test) | Precision / NLL | 54,80 % / 0,6908 |
| Tasksource tareas no vistas (dev) | Precision / NLL | 49,20 % / 0,6933 |
| Tasksource tareas vistas (dev) | Precision / NLL | 44,60 % / 0,9123 |

Calibración y pruebas de comportamiento:

| Metrica | Valor (T = 1,0) |
|---|---|
| Expected Calibration Error (ECE) | 0,0291 (< 3,0 %) |
| Negative Log-Likelihood (NLL) | 0,9598 |
| Brier score | 0,4795 |

Verificación de equimutabilidad (150 decisiones de validación, 5 permutaciones aleatorias por ítem): tasa de cambio de argmax 0,0000 %; divergencia Jensen-Shannon media 0,000000e+00; máxima 0,000000e+00.

Escalado de cardinalidad medido para K = 2 a 255 en latencia de inferencia y memoria de GPU; la model card proporcionada se corta antes de incluir la tabla completa, por lo que los valores intermedios no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (152,7 M de parámetros), unos 0,3 GB en FP16/BF16 y del orden de 0,15 GB en INT8. El repositorio ocupa 0,3 GB.
- GPU recomendadas: los datos de latencia publicados se obtuvieron en una NVIDIA A30. Cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; A100, H100, L40S o RTX 4090 quedan ampliamente sobredimensionadas para el modelo salvo por requisitos de concurrencia.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (librería declarada), exportación a ONNX u OpenVINO mediante Optimum para inferencia optimizada, y servidores de inferencia compatibles con modelos de encoder. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión propia. vLLM y TGI están orientados a modelos generativos; su soporte para este clasificador no está confirmado en la información disponible.
- Latencia y throughput: 4,74 ms por decisión con 6 opciones (DAIR Emotion) y 11,93 ms con 77 opciones (Banking77) en NVIDIA A30, lo que equivale aproximadamente a 211 y 84 decisiones por segundo respectivamente en ese hardware, antes de considerar batching.
- El modelo está marcado como `endpoints_compatible` en HuggingFace, lo que facilita su despliegue como endpoint de inferencia gestionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Categoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-JEV (tasksource) | 152,7 M | 8.192 tokens | Clasificacion con cabeza de decision por opciones | apache-2.0 | HuggingFace, transformers, safetensors |
| answerdotai/ModernBERT-base | 149 M | 8.192 tokens | Encoder base para clasificacion y recuperacion | apache-2.0 | HuggingFace |
| microsoft/deberta-v3-base | 184 M (aproximado) | 512 tokens | Encoder base para NLU | MIT | HuggingFace |
| roberta-base | 125 M | 512 tokens | Encoder base para NLU | MIT | HuggingFace |
| Laya (arquitectura de presupuesto compartido) | no disponible | no disponible | Decisiones con tokens de opcion compartidos | no disponible | no disponible |

La comparación de rendimiento frente a estas alternativas no está disponible en la información proporcionada: la model card no incluye resultados de ModernBERT-base, DeBERTa-v3-base ni RoBERTa-base en los mismos benchmarks, y las cifras de precisión cero-disparo de ModernBERT-JEV son demasiado bajas para establecer ventajas sin una evaluación controlada. La diferencia arquitectónica verificable frente a un cross-encoder clásico es de complejidad: O(K × (L + M)²) frente a O(L²) + O(Σ M_k²) + O(K × L).

## Limitaciones y advertencias

- Idioma: únicamente inglés (`language: en`). No hay evidencia de capacidades multilingües.
- Precisión cero-disparo baja: 24,07 % en AG News, 29,55 % en DAIR Emotion y 2,05 % en Banking77. El modelo no debe usarse en producción sin ajuste fino sobre el dominio objetivo.
- En decisiones tipadas, las primitivas `choice` (16,83 %) y `score` (20,88 %) rinden muy por debajo de `noul` (62,67 %), por lo que el rendimiento es desigual según el tipo de decisión.
- Naturaleza discriminativa: no genera texto, no soporta tool calling, agentes, visión ni audio. No puede emplearse como asistente conversacional.
- Dependencia de un catálogo explícito de opciones: requiere que las K opciones se proporcionen en cada llamada; el comportamiento ante opciones mal formuladas o solapadas no está documentado.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de sobreconfianza en categorías fuera de distribución; la calibración reportada (ECE 0,0291) corresponde a su mezcla de validación y puede degradarse en dominios nuevos, como sugiere la caída de precisión en Sarge OOD (57,00 % frente a 68,20 % en test).
- Sesgos: la model card no documenta análisis de sesgo demográfico, social o cultural. El entrenamiento sobre conjuntos de tareas diversos de tasksource puede heredar sesgos de anotación de esas fuentes.
- Limitaciones de contexto: aunque el encoder base soporta 8.192 tokens, no se documenta el comportamiento del modelo con contextos cercanos a ese límite ni con opciones muy largas.
- Licencia apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia. No se declaran restricciones adicionales, pero conviene verificar la licencia de los datos de entrenamiento, no detallada.
- Escasez de validación externa: 0 descargas y 0 likes en el momento de la consulta, y ausencia de publicaciones revisadas por pares o repositorios de terceros que repliquen los resultados.
- Detalles de entrenamiento incompletos: número de tokens, composición del dataset, número de épocas, hiperparámetros y uso de RLHF/DPO no están disponibles, lo que dificulta evaluar la reproducibilidad.
- La tabla de escalado de cardinalidad (K = 2 a 255) está truncada en la información disponible, por lo que no se pueden verificar los límites prácticos de memoria y latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tasksource/modernbert-tasksource-jev
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de decisiones tipadas: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Referencia a la arquitectura Laya mencionada en la model card: no disponible (no se incluye enlace)
- Paper, blog o repositorio oficial del modelo: no disponible
- Demo: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a páginas de soporte de Microsoft sin relación con el contenido.
