# zikabyte/garda-setfit

## Resumen

GARDA es un clasificador binario de texto basado en SetFit, fine-tuneado sobre el modelo `sentence-transformers/all-MiniLM-L6-v2` para detectar indicios de grooming depredador online en conversaciones de chat en inglés. Fue desarrollado por el usuario zikabyte y se distribuye bajo licencia Apache 2.0. El modelo clasifica mensajes como sospechosos (etiqueta `1`) o normales (etiqueta `0`), y se entrenó con ventanas cortas de conversación (un mensaje junto con los mensajes previos, etiquetados como `self` o `other`) en lugar de líneas aisladas.

El modelo está diseñado como una herramienta de triaje para moderación y seguridad, no como un veredicto definitivo. Utiliza la arquitectura transformer de MiniLM-L6-v2 (22,7 millones de parámetros) y el enfoque de few-shot learning de SetFit, que fine-tunea un sentence transformer con pocos ejemplos etiquetados y luego entrena una cabeza clasificadora sobre los embeddings resultantes. Es un modelo ligero (0,1 GB) apto para despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (all-MiniLM-L6-v2) con cabezal SetFit |
| Parámetros totales | 22.713.216 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (típicamente 256 tokens en MiniLM) |
| Tipos de cuantización | No disponibles |
| Idiomas soportados | Inglés (según la model card; el campo de idiomas del Hub no está rellenado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el enfoque de SetFit, que consta de dos etapas: primero se fine-tunea un sentence transformer (en este caso `all-MiniLM-L6-v2`) sobre pares de ejemplos etiquetados, y después se entrena un clasificador head (por defecto una regresión logística o un head diferenciable) sobre los embeddings generados. El cuerpo del modelo es un transformer BERT-like de 6 capas con embeddings de 384 dimensiones, optimizado para eficiencia.

El entrenamiento se realizó sobre el corpus PAN-2012 Sexual Predator Identification, un dataset de acceso restringido y no redistribuible que contiene logs reales de chat, usado bajo permiso académico. No se incluyen fragmentos del dataset en el repositorio, solo los pesos resultantes. El modelo fue entrenado sobre ventanas de conversación cortas con etiquetas de rol (`self`/`other`), lo que le permite capturar contexto conversacional en lugar de analizar mensajes aislados.

## Capacidades

- Clasificación binaria de texto: identifica si una ventana de conversación en inglés contiene indicios de grooming depredador online.
- Procesamiento de contexto conversacional: analiza un mensaje junto con los mensajes anteriores, distinguiendo entre el usuario y el interlocutor.
- Detección de patrones de grooming: aprendidos del corpus PAN-2012, incluyendo tácticas de acercamiento, solicitudes de privacidad, etc.
- No genera texto, no soporta tool calling ni capacidades multimodales; es un modelo exclusivo de clasificación.
- Multilingüe: no, limitado a inglés.

## Casos de uso

- Moderación de chats en plataformas infantiles: el modelo puede integrarse en pipelines de moderación para marcar conversaciones sospechosas en tiempo real, alertando a moderadores humanos.
- Seguridad en apps de mensajería: permite a los proveedores de servicios detectar patrones de grooming en mensajes directos y activar protocolos de revisión.
- Investigación académica en ciberseguridad: útil para estudios sobre detección de depredadores online, sirviendo como baseline para experimentos con técnicas más avanzadas.
- Análisis forense de logs: los investigadores pueden aplicar el modelo a archivos de chat históricos para identificar posibles casos de grooming en investigaciones criminales.
- Herramientas de apoyo a familias: integrado en aplicaciones de control parental para alertar sobre conversaciones de riesgo con desconocidos.
- Evaluación de contenido en foros y comunidades online: permite a los administradores priorizar la revisión de hilos o mensajes que el modelo marca como sospechosos.
- Entrenamiento de personal de moderación: como herramienta de formación para que moderadores aprendan a reconocer patrones de grooming, aunque siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de precisión, recall o F1 sobre el dataset PAN-2012 ni sobre otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cuantización FP32 (22,7 M parámetros, 384 dimensiones de embedding).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior); también funciona en CPU sin problemas.
- Despliegue en consumer GPU: sí, cabe holgadamente en GPUs de 4 GB o menos.
- Opciones de despliegue: `sentence-transformers`, `setfit` (librería de Hugging Face), y compatible con endpoints de `text-embeddings-inference` (TGI) para producción.
- Latencia estimada: en CPU, inferencia en el orden de 10-30 ms por muestra; en GPU, menos de 5 ms. Throughput limitado solo por el batching de la librería.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| `zikabyte/garda-setfit` | Transformer + SetFit | 22,7 M | No disponible (256 típico) | Apache 2.0 | Clasificación de grooming en inglés |
| `sentence-transformers/all-MiniLM-L6-v2` (base) | Transformer | 22,7 M | 256 tokens | Apache 2.0 | Embeddings generales, sin fine-tuning específico |
| Modelos de moderación genéricos (p.ej. `unitary/toxic-bert`) | Transformer | 110 M | 512 tokens | Apache 2.0 | Detección de toxicidad, no específico de grooming |

No hay disponibles otros modelos comparables especializados en detección de grooming con licencia abierta en la información proporcionada. La comparación directa con el modelo base es útil para entender que el fine-tuning específico es el factor diferenciador.

## Limitaciones y advertencias

- Solo entrenado en inglés: no funciona con otros idiomas.
- Dataset de entrenamiento limitado y desactualizado: el corpus PAN-2012 es de 2012, lo que puede no reflejar tácticas actuales de grooming.
- Es una herramienta de triaje, no un veredicto: la clasificación no es concluyente y debe ser siempre revisada por humanos.
- Riesgo de falsos positivos y negativos: puede marcar conversaciones normales como sospechosas o pasar por alto patrones no cubiertos en el entrenamiento.
- Sesgos del dataset: los logs de chat de PAN-2012 pueden contener sesgos de género, edad o contexto cultural.
- No apto para producción sin evaluación: falta de benchmarks públicos y de validación en datos reales; debe evaluarse exhaustivamente antes de uso en entornos críticos.
- Restricciones de uso del dataset: aunque los pesos se comparten bajo Apache 2.0, el dataset original no es redistribuible y el modelo solo debe usarse con fines de investigación/demo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zikabyte/garda-setfit
- Repositorio SetFit (HuggingFace): https://github.com/huggingface/setfit
- Blog de SetFit: https://github.com/huggingface/blog/blob/main/setfit.md
- Corpus PAN-2012 (Sexual Predator Identification): https://pan.webis.de/clef12/pan12-web/author-identification.html
- Documentación de SetFit en HuggingFace: https://huggingface.co/SetFit
