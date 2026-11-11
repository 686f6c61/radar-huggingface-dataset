# Vinod0717/smile-hero-dental-ai

## Resumen

Smile Hero Dental AI es un modelo de clasificación de texto publicado en Hugging Face por el usuario Vinod0717 bajo el identificador `Vinod0717/smile-hero-dental-ai`. A partir de los metadatos del repositorio y del recuento real de pesos en formato safetensors, se trata de un modelo basado en la arquitectura DistilBERT con 66.959.624 parámetros, lo que corresponde a la variante DistilBERT-base (66,9 M de parámetros), adaptada presumiblemente al dominio odontológico. La etiqueta `arxiv:1910.09700` hace referencia al artículo de DistilBERT (Sanh et al., 2019).

El modelo está registrado con la pipeline `text-classification` y es compatible con Text Embeddings Inference y con endpoints de Hugging Face. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta, lo que indica una publicación reciente y sin validación comunitaria. La model card es la plantilla automática de Hugging Face y no contiene información sustantiva sobre datos de entrenamiento, etiquetas, rendimiento o uso previsto.

La relevancia de este modelo es limitada en su estado actual: se trata de un artefacto de clasificación de dominio específico (odontología) del que no se han publicado métricas, taxonomía de clases ni detalles de ajuste fino. Resulta útil únicamente como punto de partida para quien quiera inspeccionar los pesos, pero no es apto para producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parámetros totales | 66.959.624 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base soporta típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de 6 capas obtenido mediante destilación por conocimiento de BERT-base (12 capas, 110 M de parámetros). DistilBERT conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje con un 40 % menos de parámetros y una inferencia un 60 % más rápida, según el artículo original citado en las etiquetas del repositorio (arXiv:1910.09700). El recuento de 66.959.624 parámetros coincide con el tamaño estándar de DistilBERT-base, incluida la cabeza de clasificación.

No hay información disponible sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, la taxonomía de etiquetas, el proceso de ajuste fino ni si se aplicaron técnicas como RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco se documentan hiperparámetros, régimen de precisión (fp32, fp16, bf16) ni infraestructura de cómputo. La model card es la plantilla automática y todos los campos relevantes figuran como `[More Information Needed]`.

## Capacidades

- Clasificación de texto: la pipeline declarada es `text-classification`, por lo que el modelo emite etiquetas con puntuaciones de confianza sobre una entrada textual.
- Dominio presumiblemente odontológico: el nombre del modelo (`smile-hero-dental-ai`) sugiere un ajuste fino orientado a textos de odontología, si bien la model card no documenta las clases ni el corpus.
- Compatibilidad con Text Embeddings Inference: la etiqueta `text-embeddings-inference` indica que puede servirse mediante el stack de TEI de Hugging Face.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` permite desplegarlo en Inference Endpoints de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo base DistilBERT se entrenó principalmente con texto en inglés, pero no se confirma el idioma del ajuste fino.

## Casos de uso

- Triaje de consultas odontológicas: clasificar mensajes de pacientes (urgencia, presupuesto, cita, información general) para enrutarlos al departamento adecuado, aprovechando la baja latencia de un encoder de 67 M de parámetros.
- Moderación de reseñas en clínicas dentales: detectar reseñas que requieran respuesta prioritaria o que contengan reclamaciones, siempre que se valide previamente la taxonomía de etiquetas del modelo.
- Enrutamiento en chatbots de recepción: usar la salida del clasificador como señal para decidir si una conversación debe escalar a un humano o resolverse de forma automática.
- Etiquetado de artículos y notas clínicas: clasificar documentación interna de una clínica por especialidad (ortodoncia, implantología, higiene) como paso previo a un sistema de búsqueda.
- Extracción de intención en formularios de contacto: clasificar el motivo de contacto declarado por el paciente para priorizar la cola de atención.
- Filtrado de spam o consultas fuera de alcance: descartar mensajes no relacionados con servicios dentales antes de pasarlos a un modelo generativo más costoso.
- Prototipado rápido en entornos con recursos limitados: el tamaño reducido (0,3 GB de repositorio, 67 M de parámetros) permite ejecutarlo en CPU y en GPUs de gama baja para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB (67 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16: aproximadamente 135 MB; en int8: aproximadamente 67 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4 o incluso una GPU integrada moderna pueden servirlo.
- Cabe holgadamente en GPUs de consumo e incluso en CPU: la inferencia en CPU es viable para volúmenes moderados gracias al tamaño reducido del modelo.
- Opciones de despliegue: transformers con pipeline `text-classification`, Text Embeddings Inference (etiqueta oficial), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), y exportación a ONNX o TorchScript para servir con servidores propios.
- Latencia y throughput: no disponibles; para un DistilBERT-base en GPU moderna se esperan latencias de un dígito de milisegundos por secuencia corta, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vinod0717/smile-hero-dental-ai | 66,9 M | no disponible | Clasificación de texto (dominio dental) | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased (Hugging Face) | 66,9 M | 512 tokens | Modelo base para ajuste fino | Apache 2.0 | Ampliamente usado, millones de descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | Análisis de sentimiento | Apache 2.0 | Muy usado, referencia en clasificación |
| bert-base-uncased | 110 M | 512 tokens | Modelo base | Apache 2.0 | Referencia estándar |

La comparación se limita a modelos de la misma familia y tamaño, ya que no se dispone de datos de rendimiento del modelo evaluado. Frente a los checkpoints oficiales de DistilBERT, la diferencia principal es la ausencia de documentación, licencia declarada y métricas publicadas.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, etiquetas, métricas ni uso previsto, lo que impide evaluar su calidad de forma objetiva.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de integrarlo en producción.
- Riesgo de sesgo desconocido: al no conocerse el corpus de ajuste fino, no es posible evaluar sesgos demográficos, geográficos o lingüísticos.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas con alta confianza si la distribución de entrada difiere del corpus de entrenamiento.
- Idioma no confirmado: aunque DistilBERT-base se entrenó principalmente en inglés, no se especifica si el ajuste fino se hizo en inglés, castellano u otro idioma.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por terceros.
- Fecha de creación anómala (2026-11-11): el timestamp del repositorio es posterior a la fecha actual, lo que sugiere un posible error de metadatos o una publicación programada; conviene verificar la integridad del repositorio antes de confiar en él.
- No apto para decisiones clínicas: cualquier uso en contexto sanitario requiere validación independiente, revisión por profesionales y cumplimiento normativo (por ejemplo, RGPD y normativa de productos sanitarios).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vinod0717/smile-hero-dental-ai
- Artículo de DistilBERT (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Documentación de pipelines de transformers: https://huggingface.co/docs/transformers/main_classes/pipelines
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
