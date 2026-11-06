# vkusterl/toxic-steam-user-distilbert

## Resumen

`toxic-steam-user-distilbert` es un clasificador de texto a nivel de usuario desarrollado por vkusterl que estima, a partir de las reseñas en inglés que un usuario ha escrito en Steam, si pertenece al grupo asociado a comportamiento tóxico. Se trata del transformer end-to-end del artículo *Toxic Steam: A Large-Scale Characterization and Prediction of Toxic Users in a Gaming Platform* (AIIDE 2026), reentrenado con la receta exacta del paper sobre una muestra de 60.000 usuarios y evaluado sobre otros 60.000 nunca vistos, a la prevalencia real de la plataforma (en torno al 4%).

El modelo parte de `distilbert-base-uncased` y se afina como clasificador binario (`toxic_user` / no tóxico) sobre texto agregado de reseñas: cada reseña se trunca a 500 caracteres, se concatenan en orden de publicación separadas por ` [SEP] ` hasta 2.048 caracteres y el conjunto se limita a 256 tokens. La etiqueta se define operativamente: un usuario es tóxico si al menos una de sus reseñas fue marcada por Perspective API o Detoxify, con umbrales calibrados sobre 400 reseñas anotadas por tres personas.

Su relevancia práctica es doble. Por un lado, demuestra que un DistilBERT de 67 millones de parámetros supera ampliamente a LLMs genéricos (Claude Opus, GPT-4o, Llama 3.1 8B, Qwen 2.5 7B) usados como clasificadores en esta tarea, con un AUC-PR de 0,648 frente a valores entre 0,27 y 0,41. Por otro, establece un caso de uso realista de moderación asistida: ranking de usuarios para revisión humana, nunca sanción automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens de entrada (formato de entrenamiento); texto agregado hasta 2.048 caracteres |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base, con cabecera de clasificación secuencial sobre el token `[CLS]`. El modelo se afina como clasificador binario a nivel de usuario: la entrada es la concatenación de las reseñas del usuario (cada una truncada a 500 caracteres, unidas por ` [SEP] `, hasta 2.048 caracteres y 256 tokens) y la salida es una probabilidad de pertenencia a la clase `toxic_user`.

Los datos de entrenamiento proceden de 36,8 millones de reseñas en inglés de 14,1 millones de usuarios de Steam, recogidas vía Steam Web API entre septiembre de 2024 y abril de 2025. Para el ajuste se muestrearon 60.000 usuarios a prevalencia real desde un slice hash del 10% del corpus (620.891 usuarios con perfil público), con un 90% para entrenamiento y un 10% para elegir el umbral. Los negativos se submuestrearon a proporción 1:1, resultando en 4.320 ejemplos de entrenamiento. La optimización usó AdamW con learning rate 2e-5, batch de 16 y 2 épocas (540 pasos), sobre una NVIDIA GTX 1070 en 7 minutos. La única modificación respecto al código del paper es el padding dinámico por batch, que no altera el cómputo. El umbral de decisión (`decision_threshold`) se fijó en 0,927 sobre el split de validación para maximizar macro F1.

Una innovación metodológica destacable es el control *leave-toxic-out*: al eliminar las reseñas marcadas antes de representar al usuario, el modelo aún supera a los metadatos de perfil (AUC-PR de 0,166 frente a 0,063 con XGBoost), lo que sugiere una traza conductual débil más allá del texto explícitamente ofensivo, aunque muy por debajo de la puntuación completa.

## Capacidades

- Clasificación binaria a nivel de usuario (`toxic_user` / no tóxico) a partir de texto agregado de reseñas.
- Agregación de múltiples reseñas en una sola entrada mediante separador ` [SEP] `, con truncado por reseña y por documento.
- Puntuación calibrada con umbral almacenado en la configuración del modelo (`decision_threshold` = 0,927), ajustable por el usuario según la capacidad de revisión humana.
- Ranking de usuarios por probabilidad para priorizar colas de revisión.
- Inferencia rápida y ligera: 67 millones de parámetros, ejecutable en CPU y en GPU de gama baja.
- Integración con el pipeline `text-classification` de Transformers y con text-embeddings-inference (endpoints compatibles).
- Capacidad multilingüe: no disponible; solo inglés.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no soportados (modelo discriminativo, no generativo).

## Casos de uso

- Moderación asistida a escala de plataforma: el modelo puntúa a cada usuario a partir de su historial de reseñas y permite priorizar una cola de revisión humana. Con un AUC-PR de 0,648 a prevalencia del 4%, es adecuado como filtro de primera etapa, no como decisor final.
- Triaje en equipos de confianza y seguridad: dado un backlog de miles de usuarios reportados, el score permite ordenar por probabilidad y asignar el esfuerzo de revisores a los casos con mayor puntuación, ajustando el umbral al volumen inspeccionable.
- Investigación académica sobre toxicidad en comunidades de videojuegos: el checkpoint reproduce la receta del paper y sirve como línea base reproducible para comparar con otros clasificadores o con LLMs.
- Detección de cuentas problemáticas en foros o reseñas de productos: el mismo formato de entrada (textos cortos concatenados por usuario) es reutilizable en dominios con reseñas textuales, previo reentrenamiento.
- Análisis de series temporales de comportamiento: combinado con metadatos de actividad, el score por usuario permite estudiar la evolución de la toxicidad y su relación con la frecuencia de publicación.
- Filtrado previo en pipelines de datasets: para construir corpus de investigación libres de contenido tóxico, el modelo puede marcar usuarios candidatos a exclusión o revisión antes del etiquetado manual.
- Despliegue en entornos con recursos limitados: al caber en una GTX 1070 (7 minutos de entrenamiento) y ejecutarse en CPU, es viable en infraestructura modesta o en el borde, a diferencia de los LLMs evaluados en el paper.

## Benchmarks y rendimiento

Evaluación de este checkpoint sobre 60.000 usuarios no vistos del mismo slice del 10% (2.383 usuarios tóxicos, prevalencia del 3,97%):

| Metrica | Valor | Intervalo bootstrap 95% |
|---|---|---|
| AUC-PR | 0,648 | 0,630 a 0,668 |
| ROC-AUC | 0,968 | 0,966 a 0,971 |
| F1 clase tóxica | 0,604 | 0,589 a 0,619 |
| Precision clase tóxica | 0,526 | no disponible |
| Recall clase tóxica | 0,709 | no disponible |
| Macro F1 | 0,792 | no disponible |

Comparativa del paper (misma receta, validación cruzada de 10 folds sobre 60.000 usuarios; los LLMs evaluados solo sobre 1.000 usuarios con 40 positivos):

| Modelo | AUC-PR | ROC-AUC | F1 clase tóxica |
|---|---|---|---|
| Metadatos de perfil, LightGBM | 0,070 | 0,637 | 0,101 |
| Embeddings de contenido, XGBoost | 0,476 | 0,932 | 0,463 |
| DistilBERT end-to-end (esta receta) | 0,643 | 0,968 | 0,605 |
| Claude Opus como clasificador | 0,408 | 0,921 | 0,389 |
| GPT-4o como clasificador | 0,313 | 0,688 | 0,405 |
| Llama 3.1 8B como clasificador | 0,308 | 0,818 | 0,344 |
| Qwen 2.5 7B como clasificador | 0,268 | 0,888 | 0,305 |

Rendimiento de este checkpoint por número de reseñas en inglés del usuario:

| Reseñas en inglés | Usuarios | Tóxicos | Prevalencia | AUC-PR | F1 clase tóxica |
|---|---|---|---|---|---|
| 1 | 33.947 | 510 | 1,5% | 0,685 | 0,644 |
| 2 a 4 | 19.411 | 905 | 4,7% | 0,680 | 0,616 |
| 5 o más | 6.642 | 968 | 14,6% | 0,602 | 0,567 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (67 millones de parámetros, ~268 MB de pesos); en fp16 en torno a 134 MB. El repo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA GTX 1070. Funciona en RTX 4090, A100 o H100 sin aprovechar su capacidad, y también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: pipeline `text-classification` de Transformers, text-embeddings-inference (endpoints compatibles), ONNX Runtime o TorchScript previa exportación. vLLM, llama.cpp, Ollama y TGI no están indicados para este modelo (no es generativo ni tiene pesos GGUF publicados).
- Latencia y throughput: no disponible de forma medida; el entrenamiento de 540 pasos sobre 4.320 ejemplos tardó 7 minutos en una GTX 1070, lo que da una idea del orden de magnitud, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUC-PR (toxicidad usuario) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toxic-steam-user-distilbert | 67 M | 256 tokens | 0,648 | apache-2.0 | Hugging Face |
| DistilBERT end-to-end (receta paper, 10-fold) | 67 M | 256 tokens | 0,643 | apache-2.0 (receta) | referencia en paper |
| Claude Opus como clasificador | no disponible | no disponible | 0,408 | propietaria | API |
| GPT-4o como clasificador | no disponible | no disponible | 0,313 | propietaria | API |
| Llama 3.1 8B como clasificador | 8 B | no disponible | 0,308 | Llama 3.1 Community | pesos abiertos |
| Qwen 2.5 7B como clasificador | 7 B | no disponible | 0,268 | Apache 2.0 | pesos abiertos |

La comparación con LLMs debe interpretarse con cautela: los LLMs se evaluaron sobre 1.000 usuarios con 40 positivos, por lo que sus intervalos de confianza son mucho más amplios. El paper señala que los LLMs resultaron más útiles como generadores de explicaciones auditables para revisores humanos que como clasificadores.

## Limitaciones y advertencias

- La etiqueta mide las decisiones de Perspective API y Detoxify, no el juicio humano. El modelo aprende a anticipar esos detectores, con los sesgos y errores que arrastran.
- La mayor parte de la precisión proviene de encontrar el texto marcado dentro de las reseñas del propio usuario; el control *leave-toxic-out* cae a AUC-PR de 0,166, muy por debajo del 0,648 completo.
- La etiqueta crece con la actividad: los usuarios que escriben más reseñas tienen más oportunidades de ser marcados. El rendimiento baja en usuarios prolíficos (AUC-PR de 0,602 con 5 o más reseñas frente a 0,685 con una sola), en parte porque el truncado a 256 tokens deja fuera reseñas que definen la etiqueta.
- El umbral por defecto (0,927) maximiza macro F1 sobre la validación, pero debe recalibrarse según la capacidad real de revisión humana; con precision de 0,526 en la clase tóxica, más de la mitad de las alertas serían falsos positivos a ese umbral.
- Solo inglés: las reseñas en otros idiomas no están cubiertas.
- Riesgo de alucinación no aplica (modelo discriminativo), pero sí de falsos positivos y negativos; no debe usarse para sanciones automáticas.
- El contenido de entrenamiento incluye lenguaje ofensivo y de odio; los desarrolladores deben tenerlo en cuenta al manipular datos o al exponer el modelo.
- La licencia apache-2.0 permite uso comercial, pero el modelo base (`distilbert-base-uncased`) y el corpus de origen (reseñas de Steam vía API pública) imponen sus propias condiciones de uso que deben revisarse.
- El modelo fue entrenado y evaluado sobre un slice hash del 10% del corpus; el rendimiento en otras plataformas o ventanas temporales distintas a septiembre de 2024 – abril de 2025 no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vkusterl/toxic-steam-user-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper *Toxic Steam: A Large-Scale Characterization and Prediction of Toxic Users in a Gaming Platform* (AIIDE 2026): no disponible en la información proporcionada
- Repositorio de código del paper: no disponible en la información proporcionada
- Perspective API: no disponible en la información proporcionada
- Detoxify: no disponible en la información proporcionada
