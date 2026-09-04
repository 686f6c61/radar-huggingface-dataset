# vectorsense/toxiscan

## Resumen

ToxiScan es un modelo de clasificación de texto multi-etiqueta y multilingüe desarrollado por VectorSense, con autoría de Arnab Pal, especializado en moderación de contenido tóxico y discurso de odio. Se distribuye desde HuggingFace como un modelo ONNX INT8 optimizado para CPU (~136 MB) que puede ejecutarse de forma totalmente offline, sin GPU ni conexión a red. Su objetivo es proporcionar una capa de moderación en tiempo real para aplicaciones que necesiten filtrar insultos, amenazas, acoso, contenido sexual, autolesiones, spam y más.

El modelo parte de `distilbert-base-multilingual-cased` y realiza una clasificación independiente por categoría mediante sigmoid, devolviendo probabilidades para ocho categorías de toxicidad, además de un nivel de severidad y una acción de política determinada (`allow`, `flag`, `review` o `block`). La latencia reportada es de aproximadamente 17 ms por petición en CPU, lo que lo hace adecuado para sistemas de moderación en tiempo real. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only, base multilingüe) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | en, hi, es, fr, de, it, ru, ar, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

ToxiScan está construido sobre `distilbert-base-multilingual-cased`, un transformer encoder-only preentrenado. La tarea se aborda como clasificación multi-etiqueta, con una capa de salida que aplica una sigmoid independiente para cada una de las ocho categorías: `insult`, `threat`, `identity_hate`, `sexual`, `self_harm`, `harassment`, `profanity` y `spam`. Esto permite que un mismo texto pueda activar varias etiquetas simultáneamente.

La documentación no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Se indica que el modelo se entrenó sobre corpus públicos de licencia mixta, y que solo se publica un subconjunto redistribuible. Tampoco se menciona el uso de RLHF, DPO ni otras técnicas de alineación, al tratarse de un clasificador discriminativo y no de un modelo generativo. El repositorio incluye una carpeta `training/` con el mejor checkpoint, logs, configuraciones y tablas de benchmark, según la model card.

## Capacidades

- Clasificación multi-etiqueta en 8 categorías de toxicidad y moderación: insulto, amenaza, odio identitario, contenido sexual, autolesión, acoso, profanidad y spam.
- Devuelve probabilidades independientes por categoría, un nivel de severidad y una acción de política (`allow`, `flag`, `review`, `block`).
- Funcionamiento CPU-only mediante ONNX Runtime, con una latencia de ~17 ms por petición y sin necesidad de GPU o red.
- Soporte multilingüe para 10 idiomas: inglés, hindi, español, francés, alemán, italiano, ruso, árabe, japonés y chino.
- Integración con un servicio FastAPI que añade detección de spans tóxicos, grupos objetivo, normalización de texto y explicaciones por categoría.
- Endpoints para clasificación individual, por lotes y para registro de feedback (`/v1/classify`, `/v1/classify/batch`, `/v1/feedback`).
- Políticas configurables mediante presets (`strict`, `balanced`, `lenient`) y umbrales ajustables por petición.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: se puede integrar en un pipeline de publicación para bloquear automáticamente mensajes con alta probabilidad de amenaza u odio identitario, o enviarlos a revisión humana según la política configurada.
- Filtro de spam en sistemas de mensajería: gracias a su precisión de 0.99 en la categoría `spam`, es adecuado para descartar mensajes no deseados antes de que lleguen al destinatario.
- Monitorización de chat en juegos online: la baja latencia (~17 ms) permite analizar mensajes en tiempo real y aplicar acciones inmediatas contra acoso o amenazas.
- Moderación en aplicaciones de citas: identifica lenguaje abusivo, contenido sexual no consentido o acoso, y puede escalar automáticamente el caso a revisión humana.
- Priorización de tickets en atención al cliente: detecta insultos o amenazas en mensajes de usuarios para asignar prioridad alta a los agentes y reducir el tiempo de respuesta.
- Análisis de contenido generado por usuarios en plataformas educativas: ayuda a filtrar lenguaje inapropiado en trabajos o foros estudiantiles, manteniendo un entorno seguro.
- Despliegue en entornos aislados o con recursos limitados: al ser un modelo ONNX INT8 para CPU, puede ejecutarse en servidores sin GPU, en dispositivos embebidos o en infraestructuras que requieran total privacidad al no necesitar conexión externa.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre un conjunto de test hold-out con umbral 0.5:

| Categoria | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| insult | 0.86 | 0.88 | 0.87 | 9,336 |
| self_harm | 0.92 | 0.96 | 0.94 | 982 |
| spam | 0.99 | 0.97 | 0.98 | 614 |
| sexual | 0.73 | 0.77 | 0.75 | 388 |
| identity_hate | 0.74 | 0.72 | 0.73 | 1,080 |
| profanity | 0.70 | 0.73 | 0.71 | 798 |
| harassment | 0.68 | 0.65 | 0.66 | 476 |
| threat | 0.69 | 0.56 | 0.61 | 326 |
| macro-F1 | | | 0.78 | |
| micro-F1 | 0.84 | 0.85 | 0.84 | ~13.5k |

Estas métricas son in-distribution, es decir, el conjunto de test procede de las mismas fuentes que el entrenamiento. El rendimiento puede degradarse con frases fuera de distribución, especialmente en las categorías `threat` y `harassment`. No se incluyen comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- No requiere GPU; el modelo está optimizado para ejecución en CPU mediante ONNX Runtime.
- Tamaño del modelo: ~136 MB en formato INT8 ONNX.
- Latencia estimada: ~17 ms por solicitud en CPU (según la documentación).
- VRAM: no aplica, al ser un modelo CPU-only.
- GPU recomendadas: ninguna; basta con una CPU moderna.
- Opciones de despliegue: ONNX Runtime en Python, servicio FastAPI con endpoints REST, o integración directa en aplicaciones mediante `onnxruntime` y `tokenizers`.
- Throughput: no disponible en la información proporcionada; depende de la CPU y del tamaño del lote.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de comparación con otros modelos de moderación de toxicidad en la información disponible.

## Limitaciones y advertencias

- Las métricas publicadas son in-distribution; el rendimiento en textos reales fuera del dominio de entrenamiento puede ser menor, sobre todo en las categorías `threat` y `harassment`.
- No se han evaluado formalmente los sesgos del modelo; la robustez frente a ofuscación y la tasa de falsos positivos según HateCheck están pendientes.
- Las categorías con menos soporte en el test set (`threat`, `sexual`, `spam`) pueden comportarse peor en producción.
- El modelo de autolesión está entrenado sobre textos de angustia e ideación, pero no debe usarse como herramienta de intervención en crisis.
- Los datos de entrenamiento provienen de corpus públicos de licencia mixta; solo se publica un subconjunto redistribuible, lo que puede limitar la trazabilidad completa.
- Al ser un clasificador discriminativo, no genera texto, no ofrece razonamiento y no es adecuado para tareas de conversación o generación asistida.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar la procedencia de los datos de entrenamiento para cumplir con las licencias de los corpus originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vectorsense/toxiscan
- Repositorio del servicio FastAPI (GitHub del autor): https://github.com/palarnab
- Web de VectorSense: https://vectorsense.ai/
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/pal-arnab
