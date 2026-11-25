# wasabihu/VeriCorpus-Reranker-0.6B

## Resumen

VeriCorpus-Reranker-0.6B es un modelo de reordenamiento (reranker) de tipo cross-encoder desarrollado por el usuario wasabihu, afinado a partir de Qwen/Qwen3-Reranker-0.6B. Su propósito es resolver un problema concreto en pipelines RAG: los rerankers genéricos asignan puntuaciones casi idénticas a documentos distractores que difieren del correcto en detalles críticos (año fiscal, perímetro contable, artículo legal adyacente, etc.). El modelo se especializa en discriminar estas "trampas de calibre" en tres dominios: contabilidad financiera, derecho estatutario chino y ensayos clínicos.

Arquitectura basada en Qwen3, con 595.776.512 parámetros totales, 28 capas y pesos fusionados en BF16 (1,11 GiB). Mantiene el contrato de prompt nativo de Qwen3-Reranker: cálculo de la diferencia de logits entre los tokens `yes` y `no` aplicada a una sigmoide, con el sufijo de plantilla `\n\n`. El modelo es bilingüe chino-inglés y se distribuye bajo licencia Apache-2.0.

Su relevancia radica en la calibración: frente a la versión base, reduce la probabilidad media de los negativos de 0,5621 a 0,0065, lo que permite usar umbrales de corte fijos en producción sin reescalado por consulta. El autor declara una auditoría de procedencia "clean-room" sobre los 962 grupos de entrenamiento y 240 de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado como cross-encoder de ranking |
| Parámetros totales | 595.776.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 28 |
| Tamaño del repo | 1,2 GB |
| Modelo base | Qwen/Qwen3-Reranker-0.6B |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Reranker-0.6B, un transformer decoder-only de 28 capas que se emplea como cross-encoder: recibe el par consulta-documento en un único prompt con plantilla de chat y produce una puntuación de relevancia mediante `sigmoid(logit("yes") - logit("no"))`. Los pesos se publican fusionados en BF16.

El ajuste fino combina tres objetivos: InfoNCE listwise por grupos, BCE pointwise y destilación de conocimiento con puntuaciones suaves de un profesor de 32B (Qwen/Qwen3-32B-AWQ, Apache-2.0). El conjunto de entrenamiento comprende 962 grupos y la evaluación se realizó sobre 240 grupos retenidos (held-out) con 19 grupos de entidades completamente no vistas (tickers del SEC estadounidense, estatutos de la República Popular China y documentos de ensayos clínicos), sin solapamiento de entidad, documento, consulta ni pasaje según la auditoría del autor.

La innovación principal no es arquitectónica sino de calibración: el entrenamiento empuja las probabilidades de los negativos hacia cero, de modo que un umbral fijo (por ejemplo, positivo ≥ 0,70 y todos los negativos ≤ 0,30) resulta fiable sin reescalado por consulta. El modelo conserva el contrato de prompt upstream, incluido el sufijo `\n\n` y el `chat_template.jinja`.

## Capacidades

- Reordenamiento de pares consulta-documento en modalidad cross-encoder con puntuación calibrada.
- Discriminación de trampas de calibre financiero: perímetro consolidado frente a sociedad dominante, GAAP/IFRS frente a Non-GAAP/ajustado, trimestre individual frente a acumulado del ejercicio, resumen ejecutivo frente a nota al pie y confusión entre ejercicios fiscales.
- Desambiguación de artículos estatutarios chinos adyacentes.
- Reordenamiento de evidencia en ensayos clínicos.
- Bilingüe chino-inglés de forma nativa.
- Integrable como segunda etapa de un pipeline híbrido de recuperación (el autor lo describe como etapa de reranking tras XERJ).
- No dispone de tool calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Segunda etapa de un pipeline RAG financiero: tras la recuperación inicial, el modelo reordena los fragmentos de informes anuales y descarta los que citan el ejercicio fiscal equivocado o el perímetro contable incorrecto, usando el umbral calibrado de 0,70/0,30 sin reescalado por consulta.
- Asistencia en análisis de resultados trimestrales: distingue cifras de trimestre individual de cifras acumuladas del ejercicio, un error habitual de los rerankers genéricos que asignan 0,90-0,96 a distractores casi idénticos.
- Cumplimiento normativo sobre legislación china: reordena artículos estatutarios y separa el artículo exacto de los adyacentes, con una precisión Top-1 declarada del 100 % en la categoría `statute_article_trap` sobre 144 grupos de evaluación.
- Búsqueda de evidencia en ensayos clínicos: filtra y ordena pasajes de documentación clínica para revisión sistemática o soporte a decisiones, priorizando el pasaje que cumple los criterios exactos de la consulta.
- Auditoría documental interna: dado un corpus de informes con múltiples calibres contables, el modelo puntúa qué pasaje responde exactamente a la consulta, útil para verificación de cifras antes de su publicación.
- Filtrado de ruido en bases de conocimiento bilingües: al empujar los negativos a probabilidades cercanas a cero, permite descartar automáticamente pasajes irrelevantes con un umbral fijo, simplificando la lógica de producción.
- Evaluación comparativa de recuperadores: sirve como juez de relevancia calibrado para medir la calidad de un sistema de recuperación en dominios financiero, legal y clínico.

## Benchmarks y rendimiento

Evaluación sobre 240 grupos held-out sin fuga de datos, según la model card:

| Métrica | Qwen3-Reranker-0.6B base | VeriCorpus-Reranker-0.6B | Delta |
|---|---:|---:|---:|
| Top-1 Accuracy | 86,25 % | 100,00 % | +13,75 pp |
| MRR | 0,9188 | 1,0000 | +0,0812 |
| NDCG@3 | 0,9358 | 1,0000 | +0,0642 |
| StrictCal Pass (pos ≥ 0,7 y neg ≤ 0,3) | 20,83 % | 98,33 % | +77,50 pp |
| Probabilidad media positiva | 0,9851 | 0,9938 | +0,0087 |
| Probabilidad media negativa | 0,5621 | 0,0065 | -0,5556 |
| Margen medio (pos - max_neg) | +0,2070 | +0,9743 | +0,7673 |

Desglose por tipo de trampa:

| Categoría | Grupos | Top-1 base | Top-1 ajustado | StrictCal base | StrictCal ajustado |
|---|---:|---:|---:|---:|---:|
| `consolidated_vs_parent` | 6 | 33,33 % | 100,00 % | 0,00 % | 100,00 % |
| `gaap_vs_nongaap` | 8 | 50,00 % | 100,00 % | 0,00 % | 100,00 % |
| `summary_vs_footnote` | 23 | 60,87 % | 100,00 % | 0,00 % | 95,65 % |
| `single_quarter_vs_cumulative` | 17 | 70,59 % | 100,00 % | 0,00 % | 94,12 % |
| `cross_fiscal_year` | 42 | 78,57 % | 100,00 % | 0,00 % | 100,00 % |
| `statute_article_trap` | 144 | 98,61 % | 100,00 % | 34,72 % | 98,61 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB para los pesos más overhead de activaciones y caché KV; cómodo en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte BF16 (RTX 3060 en adelante, RTX 4090, A100, H100). Para lotes grandes de reordenamiento, A100/H100 aportan mayor throughput.
- Cabe holgadamente en GPU consumer, incluidas tarjetas de gama de entrada con 4-6 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (el autor incluye código de ejemplo); al ser un modelo de ranking con contrato de prompt específico, requiere implementación propia del cálculo de logits `yes`/`no`. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tipo | Licencia | Notas |
|---|---:|---|---|---|---|
| VeriCorpus-Reranker-0.6B | 595,8 M | zh, en | Cross-encoder | Apache-2.0 | Calibrado para trampas de calibre financiero y legal |
| Qwen/Qwen3-Reranker-0.6B | ~0,6 B | multilingüe | Cross-encoder | Apache-2.0 | Modelo base; Top-1 86,25 % y StrictCal 20,83 % en el conjunto de evaluación del autor |
| Qwen/Qwen3-32B-AWQ | 32 B | multilingüe | Decoder generativo | Apache-2.0 | Usado como profesor en la destilación; no es un reranker comparable directamente |

No se dispone de datos de otros rerankers especializados (por ejemplo, de la familia BGE o Cohere) en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la model card del autor, sobre un conjunto de evaluación propio de 240 grupos; no hay validación independiente publicada.
- El rendimiento en dominios distintos del financiero, legal chino y clínico no está documentado y podría degradarse frente a rerankers generalistas.
- Solo soporta chino e inglés; no se documenta cobertura de otras lenguas.
- La longitud de contexto no está especificada; el autor advierte de que al truncar documentos largos debe conservarse el prefijo, `<Instruct>`, `<Query>` y el sufijo, truncando únicamente la cola de `<Document>`.
- Riesgo de alucinación no aplicable en sentido generativo (no produce texto libre), pero sí de calibración excesivamente confiada: probabilidades positivas medias de 0,9938 podrían enmascarar errores en consultas fuera de distribución.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento de forma independiente a la auditoría declarada por el autor.
- Requiere implementación manual del contrato de prompt y del cálculo de logits; no es un plugin directo en frameworks de reranking estándar según la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/wasabihu/VeriCorpus-Reranker-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-32B-AWQ
