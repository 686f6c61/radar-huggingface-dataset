# zypchn/results

## Resumen

`zypchn/results` es un modelo de clasificación de texto obtenido por fine-tuning de `jhu-clsp/mmBERT-base`, un encoder multilingüe de la familia ModernBERT. Lo publica el usuario `zypchn` como artefacto generado automáticamente por el `Trainer` de Transformers, sin model card completada: el autor no documenta el conjunto de datos, la tarea concreta ni el uso previsto. Cuenta con 307.531.778 parámetros en formato safetensors y un repositorio de 1,3 GB.

Su relevancia es limitada y muy acotada: no es un modelo de propósito general ni un modelo conversacional, sino un clasificador afinado cuyas métricas de evaluación declara el propio autor (exactitud 0,7902; F1 0,7185; ROC AUC 0,8589 sobre un conjunto de validación no descrito). Al ser un encoder bidireccional, no genera texto libre ni soporta tool calling; su utilidad se reduce a etiquetar secuencias en la tarea (desconocida) para la que fue entrenado.

La licencia MIT y el hecho de que solo ocupe 1,3 GB lo hacen trivial de desplegar, pero la ausencia total de documentación sobre datos, etiquetas e idioma objetivo implica que cualquier uso en producción exige una reevaluación propia. La ficha siguiente refleja exclusivamente lo que el autor publicó, y marca como "no disponible" todo lo que no consta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional, familia ModernBERT (heredada de `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.531.778 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; heredada del modelo base mmBERT (encoder con ventana amplia, valor exacto no confirmado en esta ficha) |
| Tipos de cuantizacion | no se publican artefactos cuantizados; los pesos safetensors admiten cuantizacion a int8/fp16/bf16 mediante herramientas externas (bitsandbytes, Optimum, llama.cpp no aplica a este formato) |
| Idiomas soportados | no disponible en los metadatos; el modelo base `mmBERT-base` es multilingue, pero el autor no declara el conjunto de idiomas del fine-tuning |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,3 GB; incluye pesos en el formato nativo de Transformers) |

Otros datos tecnicos: pipeline `text-classification`, libreria `transformers`, compatible con `text-embeddings-inference` segun los tags, `region: us`. Entorno de entrenamiento declarado: Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.2.

## Arquitectura y entrenamiento

La arquitectura es la de `jhu-clsp/mmBERT-base`, un encoder de la familia ModernBERT: atención bidireccional, mecanismos modernos de atención (atención alterna local/global y RoPE) en lugar de las posiciones absolutas aprendidas de BERT clásico, y una cabeza de clasificación de secuencia sobre el token de agregación. Con 307,5 M de parámetros, es un encoder de tamano medio, muy por debajo de los LLM decoder-only, y su coste de inferencia es proporcional a la longitud de la secuencia de entrada.

El fine-tuning se realizó durante 3 épocas con AdamW (betas 0,9/0,999, epsilon 1e-08), learning rate 5e-06, batch de entrenamiento y evaluación de 16, scheduler lineal con 500 pasos de warmup y semilla 42, alcanzando 4.635 pasos totales. El autor no especifica el dataset ("on the None dataset"), no indica el número de tokens de entrenamiento, no describe la composición de los datos ni menciona fases de RLHF/DPO (no aplicables a un encoder de clasificación). Tampoco detalla si hubo búsqueda de hiperparámetros: el LR de 5e-06 es bajo para fine-tuning de encoders, lo que sugiere un ajuste conservador para evitar sobreajuste.

El registro de entrenamiento muestra sobreajuste a partir de la época 2: la pérdida de entrenamiento cae de 0,7761 a 0,1802 mientras la de validación toca mínimo en el paso 3000 (0,4741) y repunta hasta 0,6689 al final. Las métricas finales de validación son: pérdida 0,6689, exactitud 0,7902, precisión 0,7313, recall 0,7061, F1 0,7185 y ROC AUC 0,8589.

## Capacidades

- Clasificación de secuencias de texto: produce una etiqueta por secuencia de entrada (la cabeza y el número de clases no se documentan; las métricas reportadas —precisión, recall, F1 y ROC AUC— apuntan a un problema binario o con umbral de decisión).
- Extracción de representaciones: al ser un encoder, puede usarse como extractor de embeddings de frases o documentos si se elimina o ignora la cabeza de clasificación.
- Procesamiento multilingüe potencial: derivado del modelo base mmBERT, aunque el autor no confirma qué idiomas cubre el fine-tuning.
- No soporta generación de texto libre, razonamiento multi-paso, tool calling, function calling ni uso como agente.
- No tiene modo "thinking", ni capacidades de visión, audio o vídeo.
- No se documenta soporte de clasificación multietiqueta, extracción de entidades ni question answering.

## Casos de uso

- Moderación de contenido en plataformas: usar el clasificador como segunda etapa de un pipeline de moderación, filtrando textos ya precribados por reglas o por un modelo más pequeno, y ajustando el umbral con la curva ROC AUC reportada (0,8589).
- Enrutado de tickets de soporte: clasificar cada ticket entrante en una categoría (por ejemplo, incidencia técnica frente a facturación) antes de asignarlo a un equipo; el coste por inferencia es bajo al tratarse de un encoder de 307 M y permite procesar lotes grandes en CPU.
- Detección de spam o phishing en formularios: con F1 en torno a 0,72 y precisión 0,73, sirve como filtro preliminar siempre que se reentrene con datos propios del dominio y se calibre el umbral.
- Análisis de sentimiento o de opinión en reseñas: el modelo puede afinarse de nuevo o utilizarse como extractor de features congelado para un clasificador ligero aguas abajo, especialmente si el corpus es multilingüe.
- Clasificación documental en pipelines de ingestión: etiquetar documentos antes de indexarlos en un buscador o en un RAG, aprovechando la ventana de contexto amplia del encoder base para procesar fragmentos largos sin truncar agresivamente.
- Investigación sobre fine-tuning eficiente: al ser un artefacto reproducible con hiperparámetros y curva de entrenamiento completos, resulta útil como referencia para estudiar sobreajuste en encoders ModernBERT (mínimo de pérdida de validación en el paso 3000 frente a 4635 pasos ejecutados).
- Filtrado previo en datasets de anotación: preetiquetar grandes volúmenes de texto para revisión humana, reduciendo el coste de anotación manual cuando la clase positiva es minoritaria y la precisión es aceptable.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`{"name": "results", "results": []}`), por lo que no hay resultados de benchmarks estándar (MMLU, GLUE, SuperGLUE, etc.). Los únicos datos disponibles son las métricas del conjunto de evaluación propio del autor, cuya composición se desconoce.

| Metrica (validacion final) | Valor |
|---|---|
| Loss | 0,6689 |
| Accuracy | 0,7902 |
| Precision | 0,7313 |
| Recall | 0,7061 |
| F1 | 0,7185 |
| ROC AUC | 0,8589 |

Evolución durante el entrenamiento (selección de checkpoints):

| Epoca | Paso | Validation loss | Accuracy | Precision | Recall | F1 | ROC AUC |
|---|---|---|---|---|---|---|---|
| 0,324 | 500 | 0,6084 | 0,6526 | 0,5325 | 0,6840 | 0,5988 | 0,7296 |
| 0,971 | 1500 | 0,5297 | 0,7385 | 0,7838 | 0,4284 | 0,5540 | 0,8112 |
| 1,618 | 2500 | 0,4995 | 0,7713 | 0,7277 | 0,6340 | 0,6776 | 0,8407 |
| 1,942 | 3000 | 0,4741 | 0,7793 | 0,7254 | 0,6724 | 0,6979 | 0,8511 |
| 2,913 | 4500 | 0,6727 | 0,7910 | 0,7371 | 0,6974 | 0,7167 | 0,8587 |
| 3,0 | 4635 | 0,6689 | 0,7902 | 0,7313 | 0,7061 | 0,7185 | 0,8589 |

No se han publicado resultados de benchmarks estandar ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,23 GB en fp32 (307,5 M de parámetros x 4 bytes), unos 0,62 GB en fp16/bf16 y unos 0,31 GB en int8. El repositorio ocupa 1,3 GB, coherente con pesos en precisión completa.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso en iGPU con suficiente memoria compartida. También funciona en CPU para lotes moderados.
- GPU recomendadas para producción con alto throughput: L4, A10G, T4 para servicio de baja latencia; A100/H100 solo si se comparte con otros modelos o se procesan lotes muy grandes, ya que el modelo está sobredimensionado respecto al hardware que necesita.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` lo indican), Infinity, Optimum/ONNX Runtime para CPU, y contenedores de inferencia de Hugging Face Endpoints. `vLLM`, `llama.cpp`, Ollama y TGI no son adecuados para un encoder de clasificación de este formato.
- Latencia y throughput: no se publican mediciones. Como referencia de orden de magnitud, un encoder de 307 M en una T4 procesa decenas de secuencias cortas por segundo en fp16 por lote, pero es una estimacion no verificada y depende de la longitud de secuencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentación pública y no de la información aportada en esta ficha; se incluyen como orientación, no como medición verificada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zypchn/results` | 307,5 M | no disponible (base mmBERT, ventana amplia) | Clasificación de texto (tarea no documentada) | MIT | HuggingFace, 0 descargas, 0 likes |
| `jhu-clsp/mmBERT-base` | ~307 M | ventana amplia (documentada por el autor del base) | Encoder multilingüe base, sin cabeza de tarea | no disponible en esta ficha | HuggingFace |
| ModernBERT-base | ~149 M | 8.192 tokens | Encoder base en inglés | Apache 2.0 | HuggingFace |
| XLM-RoBERTa-base | ~278 M | 512 tokens | Encoder multilingüe base | MIT | HuggingFace |
| mDeBERTa-v3-base | ~278 M | 512 tokens | Encoder multilingüe base | MIT | HuggingFace |

Frente a ellos, `zypchn/results` no aporta ninguna ventaja verificable: hereda el tamano y la arquitectura de mmBERT, pero sustituye la documentación del base por una model card autogenerada. La comparación de rendimiento es imposible porque no comparte conjunto de evaluación con ninguno de los alternativas.

## Limitaciones y advertencias

- Model card incompleta: dataset, etiquetas, idioma, dominio y uso previsto figuran como "More information needed". No es posible saber qué decide el clasificador ni con qué datos se entrenó.
- Riesgo alto de sobreajuste: la pérdida de validación mínima se alcanza en el paso 3000 (0,4741) y sube hasta 0,6689 en el paso 4635; el checkpoint publicado corresponde al final del entrenamiento, no al mejor punto de validación.
- Métricas no reproducibles: sin conocer el conjunto de evaluación no se puede interpretar la exactitud de 0,7902 ni el F1 de 0,7185, ni compararlos con nada.
- Riesgo de alucinación no aplicable en el sentido generativo (es un clasificador), pero sí de falsos positivos y falsos negativos con precisión y recall en torno a 0,7, insuficientes para decisiones automatizadas sin revisión humana.
- Sesgos desconocidos: al no documentarse la distribución de entrenamiento, no se puede evaluar el sesgo por idioma, registro, género o dominio.
- Idiomas no declarados: aunque el modelo base es multilingüe, el fine-tuning puede haber colapsado el rendimiento fuera del idioma de los datos de entrenamiento (no indicados).
- Licencia MIT permite uso comercial y modificación sin restricciones, pero la responsabilidad sobre el comportamiento del modelo recae enteramente en quien lo despliega; conviene verificar también la licencia del modelo base.
- Nombre y propósito genéricos ("results"): el identificador sugiere un experimento o un artefacto de prueba, no un modelo mantenido. Sin versionado, sin issues y con 0 descargas, no hay soporte de la comunidad.
- Antes de cualquier uso en producción: reentrenar o al menos reevaluar con datos propios, calibrar el umbral de decisión y establecer un mecanismo de revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zypchn/results
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo y se descartan.
