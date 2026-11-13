# vishwajeet456/distilbert-it-support-classifier

## Resumen

distilbert-it-support-classifier es un modelo de clasificación de texto desarrollado por el usuario vishwajeet456 y publicado en Hugging Face. Consiste en un DistilBERT afinado (fine-tuning) sobre `distilbert-base-uncased` para enrutar tickets de soporte informático en una de cinco categorías operativas: `billing`, `hardware`, `network`, `account` y `software`. Resuelve un problema muy concreto de triaje de primer nivel en mesas de ayuda: clasificar automáticamente las peticiones entrantes sin lectura manual.

El modelo es deliberadamente ligero: 66,9 millones de parámetros, un tamaño de repositorio de 0,3 GB y una longitud máxima de secuencia de 128 tokens. Está entrenado únicamente en inglés y sobre un conjunto de datos sintético de 300 muestras (60 por clase), lo que lo convierte en una pieza de demostración reproducible más que en un clasificador listo para producción sin validación adicional.

Su relevancia actual es la de un ejemplo canónico de flujo de trabajo completo con la API Trainer de Hugging Face: generación de dataset balanceado, entrenamiento con early stopping, evaluación con accuracy y F1 macro, y publicación en el Hub con model card. No compite en capacidades generativas ni de razonamiento; es un clasificador discriminativo de propósito específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parametros totales | 66.957.317 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de tipo BERT destilado, con 6 capas y 66,9 millones de parámetros, adaptado para clasificación multiclase mediante una cabeza de secuencia con 5 etiquetas de salida. La longitud máxima de entrada es de 128 tokens, coherente con la naturaleza corta de los tickets de soporte.

El entrenamiento se realizó con la API Trainer de Hugging Face sobre un dataset sintético propio de 300 muestras (60 por clase), con partición estratificada 80/10/10 (entrenamiento/validación/test). La configuración reportada es: 5 épocas, batch size de 16, learning rate de 2e-5, weight decay de 0,01, warmup ratio de 0,1, scheduler coseno, evaluación por época y selección del mejor checkpoint por F1 macro, con early stopping de paciencia 2 épocas. No se reporta uso de RLHF, DPO ni técnicas de alineación; es un fine-tuning supervisado convencional. El dataset incorpora variación mediante aumentación de prefijos y sufijos para mejorar la robustez lingüística.

## Capacidades

- Clasificación de texto multiclase en 5 categorías de soporte IT: `billing`, `hardware`, `network`, `account` y `software`.
- Procesamiento de tickets cortos en inglés (una o dos frases de lenguaje natural).
- Salida de logits por clase, lo que permite obtener distribución de probabilidad y no solo la etiqueta ganadora.
- Integración directa con el pipeline `text-classification` de Transformers y con `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No tiene capacidades multilingües: solo inglés.
- No genera texto; es exclusivamente discriminativo.

## Casos de uso

- Triaje automático de primer nivel en mesas de ayuda: el modelo clasifica cada ticket entrante en una de las cinco categorías para asignarlo al equipo adecuado, reduciendo el tiempo de lectura manual inicial.
- Enrutamiento en herramientas de ticketing: integración con Jira, ServiceNow o Zendesk mediante un servicio de inferencia que etiqueta el ticket al crearse y aplica reglas de asignación por cola.
- Priorización y filtrado previo: al obtener la distribución de probabilidad por clase, se pueden marcar tickets con baja confianza para revisión humana antes de enrutar.
- Etiquetado asistido de históricos: procesar en lote tickets antiguos sin categoría para construir un corpus etiquetado que sirva de base para un modelo posterior entrenado con datos reales.
- Clasificación de correos de soporte interno: aplicar el modelo a mensajes de correo dirigidos al help desk para separar incidencias de facturación, red, cuentas, hardware y software.
- Prototipado y experimentación docente: sirve como referencia reproducible de un pipeline completo de fine-tuning con Trainer API, útil para formación interna o validación de infraestructura de despliegue en CPU.
- Filtro de segunda etapa en un sistema mayor: usar el clasificador como componente barato (66,9 M de parámetros, ejecutable en CPU) dentro de una arquitectura donde un modelo mayor solo procesa los casos ambiguos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la partición de test reservada (30 muestras, 6 por clase, media de 3 semillas; cifras de la semilla 42):

| Metrica | Valor |
|---|---|
| Test accuracy | 93,33 % |
| Test F1 (macro) | 93,21 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| billing | 1,00 | 0,83 | 0,91 | 6 |
| hardware | 0,86 | 1,00 | 0,92 | 6 |
| network | 1,00 | 1,00 | 1,00 | 6 |
| account | 1,00 | 0,83 | 0,91 | 6 |
| software | 0,86 | 1,00 | 0,92 | 6 |

No se han publicado comparaciones con otros modelos en la información disponible. La partición de test es muy pequeña (30 muestras), por lo que la variabilidad estadística de estas cifras es alta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (66,9 M de parámetros × 4 bytes), más activaciones; en la práctica, menos de 1 GB en total.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- El autor indica que el entrenamiento se realizó en CPU o GPU única; la inferencia en CPU es viable para volúmenes moderados de tickets.
- Opciones de despliegue: `transformers` con `pipeline`, `AutoModelForSequenceClassification`, y servidores de inferencia compatibles con modelos de Transformers como TGI. Para CPU y despliegue ligero, exportación a ONNX es una vía razonable, aunque el autor no la documenta.
- No se publican cifras de latencia ni throughput. Por el tamaño del modelo, se espera latencia de milisegundos por ticket en GPU y de decenas de milisegundos en CPU, pero estos valores no están medidos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| distilbert-it-support-classifier | 66,9 M | 128 tokens | Clasificación de tickets IT (5 clases) | Apache 2.0 | Entrenado con 300 muestras sintéticas; solo inglés |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Requiere fine-tuning para clasificación; contexto mayor |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Más parámetros y contexto; sin fine-tuning específico de tickets |
| RoBERTa-base | 125 M | 512 tokens | Modelo base (MLM) | MIT | Contexto mayor y entrenamiento más extenso; requiere fine-tuning |

La comparación relevante es con los modelos base de la misma familia: este checkpoint ofrece una cabeza de clasificación ya entrenada para el dominio de soporte IT, a costa de un contexto reducido (128 frente a 512 tokens) y de un dataset de entrenamiento muy pequeño y sintético.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos (300 muestras): el rendimiento en tickets reales de una organización concreta puede diferir y requiere validación con datos internos antes de usarlo en producción.
- La partición de test es de solo 30 muestras, por lo que las métricas reportadas tienen alta incertidumbre estadística.
- Longitud máxima de 128 tokens: los tickets largos se truncan; el autor recomienda colocar la frase más informativa al inicio.
- Solo inglés; no hay soporte multilingüe en este checkpoint.
- La taxonomía de cinco clases no es exhaustiva: tickets fuera de esas categorías serán mal clasificados.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en entradas fuera de distribución.
- No apto para decisiones automatizadas de alto riesgo sin revisión humana; el autor excluye explícitamente los ámbitos médico, legal y financiero.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece ninguna garantía de exactitud ni soporte por parte del autor.
- El modelo no está pensado para generar texto ni para tareas de razonamiento; cualquier uso en ese sentido queda fuera de su diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishwajeet456/distilbert-it-support-classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentación de la API Trainer: https://huggingface.co/docs/transformers/main_classes/trainer
- Documentación de text-classification pipeline: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
