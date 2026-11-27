# Srinidhi42/indicbert-gov-intent

## Resumen

indicbert-gov-intent es un modelo de clasificación de texto publicado en Hugging Face por el usuario Srinidhi42. A partir del nombre y de la etiqueta `indicbert` se deduce que se trata de un ajuste fino (fine-tuning) del modelo IndicBERT, un BERT multilingüe preentrenado específicamente para lenguas de la India, orientado a la clasificación de intenciones en el dominio gubernamental ("gov-intent"). El modelo cuenta con 278.045.958 parámetros y se distribuye en formato safetensors dentro de un repositorio de 1,1 GB.

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto derivado de un modelo base conocido (IndicBERT) para una tarea concreta de clasificación de intenciones en el ámbito de la administración pública india. No hay información publicada sobre el conjunto de datos de entrenamiento, el rendimiento alcanzado ni las condiciones de uso, lo que restringe su aplicabilidad en producción sin una evaluación previa por parte del usuario.

La model card es la plantilla automática de Hugging Face sin rellenar: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, evaluación) figuran como "[More Information Needed]". Cualquier despliegue debería partir de una validación empírica propia sobre datos representativos del caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (derivado de IndicBERT, según el nombre del modelo); confirmado como `bert` en los tags |
| Parametros totales | 278.045.958 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los modelos BERT de esta familia suelen usar 512 tokens, pero no se confirma en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre, presumiblemente lenguas de la India, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT, tal como indican el tag `bert` y el identificador del modelo, que sugiere un ajuste fino sobre IndicBERT. IndicBERT es un modelo multilingüe preentrenado sobre corpus de lenguas de la India, desarrollado en el contexto del ecosistema AI4Bharat, y se utiliza habitualmente como encoder para tareas de clasificación y etiquetado de secuencias en esas lenguas. El modelo aquí presentado añade una cabeza de clasificación de texto (`text-classification`) orientada a la detección de intenciones en el dominio gubernamental.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF, DPO) ni hiperparámetros. La model card no documenta el procedimiento de ajuste fino ni la procedencia de los datos etiquetados. Tampoco se especifica si se congelaron capas del encoder o se entrenó el modelo completo.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo devuelve etiquetas de clase con puntuaciones de confianza.
- Clasificación de intenciones en el dominio gubernamental: por el nombre del modelo, está orientado a identificar la intención de consultas o peticiones dirigidas a servicios administrativos.
- Procesamiento multilingüe: presumiblemente heredado de IndicBERT (lenguas de la India), aunque no se confirma en la información disponible.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni comportamiento agéntico; un encoder BERT no las soporta de forma nativa.
- No se documenta modo de razonamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Clasificación de consultas ciudadanas: el modelo puede etiquetar tickets o mensajes recibidos en portales gubernamentales según su intención, facilitando el enrutamiento automático al departamento correspondiente. Es adecuado por su naturaleza de clasificador encoder y su tamaño moderado (278 M de parámetros).
- Enrutamiento de correo electrónico institucional: integrado en un pipeline de ingesta, permite asignar cada mensaje a una categoría de servicio (certificados, impuestos, subsidios, quejas) antes de la revisión humana.
- Análisis de volumen de solicitudes: agregando las predicciones sobre grandes lotes de consultas se pueden construir informes de demanda por tipo de trámite y detectar picos estacionales.
- Preetiquetado para anotación humana: el modelo puede generar etiquetas iniciales que los anotadores revisan, reduciendo el coste de construcción de datasets en dominios administrativos.
- Filtrado y priorización en mesas de ayuda: clasificar la intención permite priorizar consultas críticas (por ejemplo, quejas o urgencias) frente a consultas informativas.
- Moderación de contenido en foros públicos: identificar mensajes con intención de queja o solicitud frente a mensajes informativos o fuera de alcance.

En todos los casos, la ausencia de métricas publicadas obliga a validar el modelo sobre datos propios antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 M de parámetros, en fp32 el modelo ocupa aproximadamente 1,1 GB de pesos; en fp16, unos 0,56 GB. La VRAM total necesaria para inferencia por lotes pequeños se sitúa típicamente entre 2 y 4 GB, dependiendo del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, T4 o superior cubre el caso de uso sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1650 en adelante), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (el tag `text-embeddings-inference` sugiere compatibilidad con ese servidor), y exportación a ONNX para inferencia optimizada. No se confirma soporte de llama.cpp ni Ollama (no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles; al ser un encoder de 278 M, la latencia por petición en GPU es del orden de milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Srinidhi42/indicbert-gov-intent | 278 M | no disponible | Clasificación de intenciones (gobierno) | no disponible | Hugging Face |
| IndicBERT (AI4Bharat) | ~278 M | 512 tokens (habitual) | Encoder multilingüe base para lenguas de la India | no disponible en esta ficha | Hugging Face |
| MuRIL (Google) | ~236 M | 512 tokens (habitual) | Encoder multilingüe para lenguas de la India | no disponible en esta ficha | Hugging Face |
| mBERT (Google) | ~178 M | 512 tokens (habitual) | Encoder multilingüe general | no disponible en esta ficha | Hugging Face |

La comparación se limita a la familia de encoders multilingües para lenguas de la India; no se dispone de datos de rendimiento comparativo para este ajuste fino concreto.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin información sobre datos, entrenamiento ni evaluación.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no confirmados: aunque el nombre sugiere lenguas de la India, no hay confirmación oficial; el rendimiento en otras lenguas es desconocido.
- Riesgo de sesgos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de dominio, género, región o casta, especialmente sensibles en el contexto administrativo indio.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no un generador), pero las etiquetas pueden ser incorrectas con alta confianza si el dominio de entrada difiere del de entrenamiento.
- Sin métricas de evaluación: no hay forma de conocer la precisión, el recall ni la calibración del modelo sin una validación propia.
- Popularidad nula (0 descargas, 0 likes) y fecha de creación futura en los metadatos: indica un artefacto reciente y no validado por la comunidad.
- Longitud de contexto no confirmada: si hereda la restricción típica de BERT (512 tokens), las entradas largas requerirán truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srinidhi42/indicbert-gov-intent
- Paper de referencia citado en los tags (BERT): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019) sobre emisiones: https://arxiv.org/abs/1910.09700
