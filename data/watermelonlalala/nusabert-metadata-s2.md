# watermelonlalala/nusabert-metadata-s2

## Resumen

nusabert-metadata-s2 es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning de LazarusNLP/NusaBERT-base, un BERT base entrenado específicamente para ese idioma. Lo publica el usuario watermelonlalala en Hugging Face y su tarea es la clasificación multietiqueta (multi_label_classification) de contenido dañino en cinco categorías: insultos, ataques a la identidad, amenazas o incitación a la violencia, obscenidad y contenido sexualmente explícito. El problema que aborda es la moderación automática de contenido en plataformas y comunidades digitales en lengua indonesia.

Arquitectura BERT estándar con aproximadamente 110,6 millones de parámetros (dato real de los pesos safetensors), lo que lo sitúa en la categoría de modelos encoder de tamaño base. El repositorio ocupa 0,4 GB y se distribuye en formato safetensors compatible con transformers y con text-embeddings-inference. Según la model card, los hiperparámetros se ajustaron con Optuna, aunque no se documenta el proceso de búsqueda ni el conjunto de datos empleado.

Es relevante ahora porque la moderación de contenido en idiomas distintos del inglés sigue siendo un área con pocos recursos abiertos, y este modelo ofrece una etiqueta multietiqueta específica para taxonomías de seguridad en indonesio sobre una base lingüística ya adaptada al idioma, lo que reduce la dependencia de modelos multilingües genéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tuning de LazarusNLP/NusaBERT-base |
| Parámetros totales | 110.645.765 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de NusaBERT-base; no documentada en la ficha) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación multietiqueta de contenido dañino |
| Etiquetas | insults, identity_attack, threat_incitement_to_violence, profanity_obscenity, sexually_explicit |
| Librería | transformers |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de LazarusNLP/NusaBERT-base, un transformer encoder de tipo BERT adaptado al indonesio, y se fine-tunea como cabeza de clasificación de secuencias (AutoModelForSequenceClassification) con salida multietiqueta. Esto implica que cada una de las cinco categorías se predice de forma independiente con activación sigmoide, de modo que un mismo texto puede recibir varias etiquetas simultáneamente (por ejemplo, insulto y obscenidad).

La model card indica que los hiperparámetros se buscaron con Optuna, pero no detalla el número de tokens de entrenamiento, la composición del dataset, la proporción de clases ni si se aplicaron técnicas como RLHF o DPO (no aplicables en un encoder de clasificación). Tampoco se documenta el esquema de validación ni las métricas obtenidas. La única indicación sobre datos es que el texto de entrada debe preprocesarse igual que en entrenamiento: minúsculas, normalización de emojis, menciones y URLs.

## Capacidades

- Clasificación multietiqueta de texto en indonesio en cinco categorías de contenido dañino: insultos, ataque a la identidad, amenaza o incitación a la violencia, obscenidad y contenido sexual explícito.
- Detección simultánea de varias categorías en un mismo fragmento de texto.
- Integración directa con la API de transformers (AutoTokenizer y AutoModelForSequenceClassification).
- Compatibilidad con text-embeddings-inference y endpoints compatibles, lo que permite despliegue como servicio de inferencia.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es un modelo discriminativo de clasificación.
- No dispone de capacidades de visión ni audio.
- Capacidad multilingüe limitada al indonesio; no se documenta rendimiento en otras lenguas.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo etiqueta cada mensaje con las cinco categorías de daño y permite aplicar políticas de ocultación, aviso o revisión humana según la combinación de etiquetas activadas.
- Filtrado previo en foros y comunidades de Discord o Reddit en indonesio: se ejecuta como primera capa de bajo coste (110 M de parámetros) antes de escalar a revisores humanos o a modelos generativos más caros.
- Protección de comunidades de videojuegos y chats en vivo: la etiqueta profanity_obscenity y threat_incitement_to_violence permite disparar acciones automáticas en tiempo real con latencia baja en CPU o GPU pequeña.
- Etiquetado de datasets para investigación: el modelo puede preanotar corpus en indonesio con las cinco dimensiones de toxicidad, acelerando la construcción de conjuntos de entrenamiento o evaluación revisados posteriormente por anotadores.
- Cumplimiento y auditoría de contenido generado por usuarios: integrado en pipelines de publicación, marca los textos que requieren revisión antes de mostrarse, dejando traza de la etiqueta activada.
- Análisis de discurso de odio en redes sociales: la distinción entre insults e identity_attack permite estudios cuantitativos sobre ataques a colectivos frente a insultos genéricos en corpus indonesios.
- Enrutamiento inteligente de tickets de soporte: los mensajes con threat_incitement_to_violence pueden escalarse a equipos de seguridad, mientras que el resto sigue el flujo normal de atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos, y tampoco se documenta el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110,6 M de parámetros), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 o bf16: alrededor de 0,22 GB de pesos, ejecutable en GPUs integradas o incluso en CPU con throughput aceptable para clasificación por lotes.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente; para alto throughput en servidor, A100 o H100 permiten procesar lotes muy grandes, aunque el modelo no las necesita.
- Cabe en GPU consumer y en hardware de gama baja; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (soportado según los tags), endpoints compatibles, y exportación a ONNX o cuantización dinámica para reducir latencia en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por lote en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nusabert-metadata-s2 | 110,6 M | no disponible | Clasificación multietiqueta de toxicidad en indonesio | no disponible | Hugging Face |
| LazarusNLP/NusaBERT-base | no disponible en la información | no disponible | Modelo base BERT en indonesio (MLM) | no disponible | Hugging Face |
| Modelos de toxicidad multilingües (p. ej. variantes de XLM-R) | no disponible en la información | no disponible | Clasificación de toxicidad multilingüe | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a la naturaleza del modelo y su idioma objetivo.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; es necesario contactar con el autor antes de integrarlo en producción.
- No se documentan sesgos conocidos, pero un modelo entrenado sobre datos de redes sociales en indonesio puede infrarepresentar registros formales, dialectos regionales o variantes ortográficas no presentes en el corpus.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; sin métricas publicadas no es posible estimar su tasa de error.
- El preprocesado es crítico: la model card advierte que la entrada debe pasar por el mismo pipeline de normalización (minúsculas, emojis, menciones, URLs) que en entrenamiento; omitirlo degrada las predicciones de forma no cuantificada.
- El modelo solo cubre indonesio; su uso en malayo, javanés u otras lenguas cercanas no está validado.
- La longitud máxima de secuencia no está documentada en la ficha; debe verificarse en la configuración del tokenizer antes de procesar textos largos.
- Es un modelo de clasificación, no un generador: no puede explicar sus decisiones ni producir justificaciones, lo que limita su uso en flujos que requieran transparencia ante el usuario.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la fecha de creación es posterior a la de esta ficha; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/watermelonlalala/nusabert-metadata-s2
- Modelo base: https://huggingface.co/LazarusNLP/NusaBERT-base
