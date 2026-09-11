# teaislife/predrel-nli-deberta-v3

## Resumen

Predrel-NLI-DeBERTa-v3 es un clasificador de texto publicado por el usuario teaislife en Hugging Face. Se trata de un ajuste fino de microsoft/deberta-v3-base (184.424.451 parámetros) cuyo objetivo no es el NLI generalista, sino la alineación de predicados dentro de un pipeline neuro-simbólico de lógica de primer orden (FOL): dado un par de definiciones de predicados, el modelo decide si ambas se implican mutuamente, si no guardan relación lógica o si son complementarias (negación estricta).

La relevancia del modelo es acotada pero específica: cubre la fase de construcción de "axiomas puente" entre predicados extraídos de distintas fuentes o representaciones, un paso habitual al traducir DAG en lenguaje natural a FOL. Frente a un NLI genérico de tres clases (entailment/neutral/contradiction), aquí la taxonomía es propia (ENTAILMENT, UNRELATED, COMPLEMENTARY), lo que lo hace intercambiable solo dentro de arquitecturas que esperen esa semántica concreta.

El modelo está entrenado únicamente en inglés, se distribuye en safetensors con un repositorio de 0,7 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 1 like, sin licencia declarada ni métricas de evaluación publicadas. Es, por tanto, un artefacto experimental de investigación más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3) con atención desacoplada; cabeza de clasificación de secuencias con 3 clases |
| Parámetros totales | 184.424.451 (dato de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; la arquitectura base DeBERTa-v3 admite hasta 512 tokens |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas de salida | 0 = ENTAILMENT, 1 = UNRELATED, 2 = COMPLEMENTARY |
| Modelo base | microsoft/deberta-v3-base |
| Descargas / likes | 0 / 1 |
| Tamaño del repositorio | 0,7 GB |
| Fecha de creación / actualización | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es la de DeBERTa-v3-base: un encoder transformer con atención desacoplada (contenido y posición tratados en matrices separadas), embeddings de posición relativos y un preentrenamiento de tipo ELECTRA con detección de tokens reemplazados en lugar del enmascaramiento clásico. El vocabulario ampliado (128k tokens) explica que el recuento total de parámetros (184,4 M) sea notablemente superior al de un BERT-base (110 M). Sobre ese backbone se añade una cabeza de clasificación de secuencias que emite logits para las tres etiquetas descritas.

La model card indica que el ajuste fino se realizó sobre una combinación de tres fuentes: HANS (ejemplos de implicación y de pares sin relación para predicados binarios, con variables o constantes permutadas), plantillas de negación (pares complementarios del tipo A / no-A) y ScoNe-NLI (distractores de negación con alcance). No se especifican los tamaños de cada conjunto, el número de pasos de entrenamiento, la composición exacta del dataset ni si hubo una fase de RLHF o DPO, algo poco habitual en un clasificador de este tipo. La innovación técnica no está en la arquitectura, sino en la taxonomía de etiquetas orientada a la alineación de predicados y en el uso de distractores de negación con alcance para reducir falsos positivos de complementariedad.

## Capacidades

- Clasificación de la relación lógica entre dos definiciones de predicados en tres clases: implicación mutua (ENTAILMENT), sin relación (UNRELATED) y negación estricta (COMPLEMENTARY).
- Detección de negación con alcance (scoped negation), gracias al entrenamiento con datos ScoNe-NLI.
- Manejo de predicados con variables y constantes permutadas, aprendido de los ejemplos de HANS.
- Salida de logits por clase, lo que permite aplicar umbrales o calibración propia sobre la probabilidad de cada relación.
- Integración en pipelines neuro-simbólicos: el resultado se usa para construir axiomas puente entre predicados dentro de una traducción de lenguaje natural a lógica de primer orden.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada, sin generación de texto.
- Capacidad multilingüe: nula; el modelo se declara únicamente en inglés.
- Capacidades especiales: ninguna adicional (sin visión, audio, modo de razonamiento ni decodificación especulativa).

## Casos de uso

- Alineación de predicados en pipelines neuro-simbólicos: dado un par de predicados extraídos de dos representaciones distintas, el modelo decide si son equivalentes y permite generar el axioma puente correspondiente antes de alimentar un razonador FOL.
- Normalización y deduplicación de ontologías: al fusionar dos bases de conocimiento, los pares clasificados como ENTAILMENT pueden colapsarse en un único predicado canónico, reduciendo la redundancia del grafo.
- Detección de contradicciones en bases de conocimiento: la clase COMPLEMENTARY identifica predicados mutuamente excluyentes (A y no-A), lo que sirve para marcar inconsistencias antes de insertar nuevos hechos.
- Verificación de hechos en un pipeline RAG: el par (premisa extraída de los documentos, hipótesis generada) se clasifica para descartar respuestas que contradicen la evidencia recuperada o que no guardan relación con ella.
- Curación de datos de entrenamiento: filtrado automático de pares de oraciones o de reglas lógicas para etiquetado débil, descartando los UNRELATED y separando los COMPLEMENTARY como ejemplos negativos duros.
- Evaluación de la consistencia de agentes que generan reglas: cuando un sistema produce reglas lógicas en un bucle de auto-refinamiento, este clasificador actúa como comprobador barato de que las reglas nuevas no niegan las ya aceptadas.
- Construcción de grafos de razonamiento multi-paso: los axiomas puente generados a partir de las etiquetas ENTAILMENT permiten encadenar predicados procedentes de documentos heterogéneos sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. HANS, ScoNe-NLI y las plantillas de negación se mencionan como datos de entrenamiento, no como conjuntos de evaluación, y la model card no incluye métricas de exactitud, F1 ni comparaciones con otros modelos. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 184,4 M de parámetros, no de mediciones publicadas): unos 738 MB en FP32, unos 369 MB en FP16/BF16 y unos 184 MB en INT8, más el consumo de activaciones según el tamaño de lote y la longitud de secuencia.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU de gama de entrada con 4-6 GB. También es viable la inferencia en CPU para lotes pequeños.
- Ajuste fino completo: se necesitan aproximadamente 3 GB solo para pesos, gradientes y estados de Adam en FP32, más activaciones; una GPU con 8-12 GB es suficiente con lotes pequeños, y una RTX 4090 o A100 permiten lotes mayores.
- GPU de centro de datos (A100, H100) solo tienen sentido para reentrenamiento o para servir volúmenes muy altos; para inferencia no aportan ventaja relevante dado el tamaño del modelo.
- Opciones de despliegue: transformers con PyTorch (ruta documentada en la model card, vía AutoModelForSequenceClassification), exportación propia a ONNX Runtime o TorchScript, y servicio mediante FastAPI o Triton. No hay pesos en GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversión previa, y el soporte en vLLM o TGI para modelos de clasificación de secuencias no está verificado.
- Cuantizaciones publicadas: ninguna. Cualquier INT8/INT4 requeriría un proceso propio de cuantización y validación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea y etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teaislife/predrel-nli-deberta-v3 | 184,4 M | no especificado (base: 512) | Relación lógica entre predicados; ENTAILMENT / UNRELATED / COMPLEMENTARY | no disponible | safetensors, 0 descargas |
| microsoft/deberta-v3-base | 184,4 M | 512 | Modelo base preentrenado, sin cabeza de NLI | no verificada en esta búsqueda | muy extendido |
| MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli | del orden de 184 M | 512 | NLI generalista; entailment / neutral / contradiction | no verificada en esta búsqueda | safetensors y PyTorch, ampliamente usado |
| cross-encoder/nli-deberta-v3-base | del orden de 184 M | 512 | NLI de 3 clases orientado a reordenación de pares | no verificada en esta búsqueda | ampliamente usado |

La diferencia funcional principal frente a los dos NLI de la tabla no está en el tamaño ni en el contexto, sino en la taxonomía: los modelos generalistas usan contradicción, mientras que este distingue entre ausencia de relación y negación estricta, y está entrenado con distractores de negación con alcance. Los datos de licencia y de rendimiento de los modelos comparados no se han podido verificar con la información disponible, por lo que no se incluyen cifras de benchmarks comparativos.

## Limitaciones y advertencias

- Ámbito muy restringido: está diseñado para comparar definiciones de predicados, no para NLI sobre lenguaje natural abierto. Su uso fuera de ese dominio no está validado.
- Idioma: solo inglés. Cualquier entrada en otro idioma producirá resultados poco fiables.
- Etiquetas no estándar: COMPLEMENTARY no equivale exactamente a la etiqueta de contradicción de los pipelines NLI convencionales, por lo que no es un sustituto directo en herramientas que esperen entailment/neutral/contradiction.
- Sin métricas publicadas: no hay exactitud, F1 ni análisis de errores, lo que impide estimar el riesgo de falsos positivos en ENTAILMENT o COMPLEMENTARY.
- Riesgo de error en pares ambiguos: el modelo no genera texto, pero puede asignar implicación o negación estricta a predicados que solo están relacionados parcialmente, sin que exista una clase intermedia que recoja esa gradación.
- Sesgos heredados del modelo base y de los corpus de ajuste (HANS, ScoNe-NLI y plantillas de negación), con la composición y el tamaño de cada conjunto sin documentar.
- Sin licencia declarada: no puede asumirse uso comercial ni redistribución; es necesario contactar con el autor para aclarar los términos.
- Madurez muy baja: 0 descargas y 1 like, sin validación por terceros, sin tests y con una única revisión del repositorio.
- Sensibilidad al formato de entrada: el rendimiento depende de cómo se formulen premise e hypothesis, y las secuencias se truncan, con la pérdida de información que eso implica.
- No debe utilizarse como único mecanismo de decisión en sistemas críticos: requiere validación propia sobre el dominio objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teaislife/predrel-nli-deberta-v3
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Otros enlaces (papers de HANS y ScoNe-NLI, repositorios del pipeline neuro-simbólico o demos): no disponible. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
