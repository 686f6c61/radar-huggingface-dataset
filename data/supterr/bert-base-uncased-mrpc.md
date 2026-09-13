# supterr/bert-base-uncased-mrpc

## Resumen

`supterr/bert-base-uncased-mrpc` es un checkpoint de clasificación de texto publicado en Hugging Face por el usuario `supterr`. El identificador indica que se trata de un ajuste fino de `bert-base-uncased` sobre MRPC (Microsoft Research Paraphrase Corpus), la tarea de GLUE que consiste en decidir si dos frases son paráfrasis entre sí. El pipeline declarado en el Hub es `text-classification` y el repositorio contiene pesos en formato `safetensors` con 109.483.778 parámetros y un tamaño total de 0,4 GB.

La model card publicada es la plantilla autogenerada de `transformers`: todos los campos relevantes (autoría, datos de entrenamiento, hiperparámetros, licencia, idiomas, evaluación) aparecen como «More Information Needed». No hay, por tanto, información verificable sobre el procedimiento de ajuste, el subconjunto de MRPC utilizado ni las métricas obtenidas. El repositorio acumula 0 descargas y 0 likes, sin validación comunitaria de ningún tipo.

Su interés práctico es acotado pero concreto: es un clasificador binario de pares de frases de ~110 M de parámetros, ejecutable en CPU o en cualquier GPU de consumo, útil como componente de similitud semántica en pipelines de deduplicación, enrutado de tickets o detección de duplicados. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no existe evidencia publicada de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional, familia BERT (no confirmado en la model card; inferido del identificador y del recuento de parámetros) |
| Parametros totales | 109.483.778 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la configuración estándar de BERT-base admite 512 tokens de posición |
| Tipos de cuantizacion | No disponibles; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponibles; el checkpoint base `bert-base-uncased` está entrenado predominantemente en inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado en el Hub | text-classification |
| Tamano del repositorio | 0,4 GB (consistente con pesos en fp32: ~438 MB) |
| Etiquetas del Hub | transformers, safetensors, bert, text-classification, arxiv:1910.09700, text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base: un encoder Transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con embeddings de token y de posición y un token `[CLS]` cuya representación se utiliza para tareas de clasificación de secuencia. El dato de parámetros permite una comprobación aritmética útil: `bert-base-uncased` tiene 109.482.240 parámetros y el checkpoint publica 109.483.778, una diferencia de exactamente 1.538 parámetros, que corresponde a una cabeza lineal de 768 × 2 + 2 sobre dos clases de salida. Esto es coherente con una clasificación binaria de pares de frases, tal y como exige MRPC.

No hay información sobre el entrenamiento: ni número de épocas, ni tasa de aprendizaje, ni precisión mixta, ni subconjunto de datos empleado (el propio corpus MRPC no aparece citado en la model card). La etiqueta `arxiv:1910.09700` que figura en el Hub corresponde a Lacoste et al. (2019), el artículo sobre estimación de emisiones de carbono citado en la sección de impacto medioambiental de la plantilla autogenerada; se trata de una etiqueta heredada de la plantilla, no de una referencia al modelo. No se documenta ninguna innovación técnica: es un ajuste fino estándar de tipo encoder para clasificación.

## Capacidades

- Clasificación binaria de pares de frases: recibe dos segmentos de texto y produce una distribución sobre dos clases, presumiblemente «paráfrasis» / «no paráfrasis» según la convención de MRPC.
- Extracción de representaciones: al ser un encoder BERT, permite obtener embeddings contextuales de frases o tokens para similitud coseno o clustering; la etiqueta `text-embeddings-inference` del Hub sugiere compatibilidad con Text Embeddings Inference.
- Compatibilidad con Hugging Face Inference Endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse sin adaptaciones en esa infraestructura.
- No soporta generación de texto: el modelo no tiene decodificador.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de comportamiento agéntico ni de razonamiento multi-paso.
- No hay declaración de capacidades multilingües; el vocabulario del checkpoint base es `uncased` en inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Deduplicación de preguntas frecuentes: el modelo puede comparar pares de preguntas de un centro de ayuda y marcar como duplicadas aquellas con alta probabilidad de paráfrasis, reduciendo el catálogo antes de una revisión humana.
- Detección de tickets repetidos en soporte: comparar la descripción de un ticket entrante contra los tickets abiertos de las últimas 48 horas para agrupar incidencias equivalentes y evitar respuestas contradictorias.
- Agrupación de titulares o noticias: generar pares candidatos por similitud léxica y usar el clasificador como segunda etapa para confirmar si dos titulares describen el mismo hecho.
- Filtrado de conjuntos de datos: detectar pares casi idénticos en corpus de instrucciones o de evaluación antes de publicarlos, evitando contaminación entre particiones de entrenamiento y test.
- Enrutado semántico en un pipeline RAG: decidir si una consulta del usuario es una reformulación de la consulta anterior en una conversación multi-turno, y en tal caso reutilizar el contexto recuperado en lugar de repetir la búsqueda.
- Evaluación de sistemas de reformulación o traducción: medir si la salida del sistema conserva el significado de la referencia comparando pares a nivel de frase.
- Verificación de respuestas en control de calidad: comprobar si dos respuestas generadas por dos modelos distintos son equivalentes desde el punto de vista semántico, como señal auxiliar en una comparación automática.
- Normalización de catálogos de producto: detectar fichas duplicadas escritas con redacciones distintas antes de fusionarlas en una base de datos maestra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card está vacía (todos los campos aparecen como «More Information Needed») y no se proporciona ninguna cifra de exactitud, F1 ni matriz de confusión sobre el conjunto de desarrollo o test de MRPC. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 438 MB con pesos en fp32, 219 MB en fp16 y 110 MB en int8 (cálculo teórico sobre 109,48 M de parámetros; no incluye activaciones ni memoria del runtime).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo no requiere A100, H100 ni hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090, etc.), con un uso de memoria muy inferior a la capacidad disponible.
- Inferencia en CPU: viable para cargas moderadas; el repositorio de 0,4 GB y el tamaño del modelo lo permiten sin GPU dedicada.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (etiqueta `text-embeddings-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX Runtime o TorchScript para servir con batching dinámico.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un encoder de ~110 M de parámetros en fp16 sobre una GPU moderna suele procesar varios miles de pares por segundo con batching; esta cifra es una estimación genérica por tamaño y no una medición de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Ajuste en MRPC |
|---|---|---|---|---|
| `supterr/bert-base-uncased-mrpc` | 109.483.778 | No declarado (512 por configuración de BERT-base) | No disponible | Sí, según el identificador |
| `google-bert/bert-base-uncased` | ~109,5 M | 512 | Apache 2.0 | No |
| `FacebookAI/roberta-base` | ~125 M | 512 | MIT | No |
| `distilbert/distilbert-base-uncased` | ~66 M | 512 | Apache 2.0 | No |
| `microsoft/deberta-v3-base` | ~184 M | 512 | MIT | No |

Los datos de las alternativas corresponden a las fichas públicas de los modelos base; el rendimiento comparado en MRPC no está disponible porque este checkpoint no publica ninguna métrica. La comparación relevante es estructural: frente a `roberta-base` o `deberta-v3-base`, este modelo ofrece un coste de inferencia menor, pero carece de la validación y el mantenimiento de los checkpoints de referencia publicados por sus autores originales.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros, particiones utilizadas ni evaluación, lo que impide reproducir o auditar el ajuste.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; conviene contactar con el autor o asumir los términos del checkpoint base (`bert-base-uncased`, Apache 2.0), lo cual no está confirmado.
- Idiomas no declarados: al derivar de un modelo `uncased` entrenado mayoritariamente en inglés, el comportamiento en castellano es incierto y debe validarse empíricamente antes de usarlo.
- Sesgos del corpus MRPC: los pares del corpus original son frases periodísticas en inglés, con un desequilibrio conocido hacia pares positivos, por lo que un ajuste sobre él puede heredar esa tendencia y predecir «paráfrasis» con demasiada frecuencia. No hay evidencia en este repositorio que confirme o desmienta ese comportamiento.
- Riesgo de falsos positivos y falsos negativos: al ser un clasificador binario, los errores se traducen directamente en acciones aguas abajo (fusión incorrecta de tickets, omisión de duplicados), sin señal de confianza calibrada documentada.
- Cero descargas y cero likes: no hay uso comunitario, informes de errores ni validación independiente.
- Tamaño del corpus de entrenamiento: MRPC contiene unas 5.800 parejas, un volumen muy reducido que favorece el sobreajuste y limita la generalización fuera del dominio periodístico.
- No apto para generación de texto, resumen, traducción ni tareas generativas en general; su salida es una etiqueta con probabilidad.
- Ausencia de cuantizaciones publicadas: para desplegar en entornos con restricciones de memoria habría que generarlas y validarlas por cuenta propia.
- Inconsistencia de metadatos: las fechas del repositorio (creación y actualización en septiembre de 2026) no encajan con el estado del ecosistema y sugieren un error de metadatos o una carga con fecha manipulada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/supterr/bert-base-uncased-mrpc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Artículo de BERT (Devlin et al., 2019): https://arxiv.org/abs/1810.04805
- Referencia de la etiqueta `arxiv:1910.09700` (Lacoste et al., 2019, huella de carbono): https://arxiv.org/abs/1910.09700
- Corpus MRPC dentro de GLUE: https://huggingface.co/datasets/nyu-mll/glue
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- Resultados de la búsqueda web: las consultas devolvieron únicamente páginas del sitio `donutluck.com`, sin relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos asociados a este checkpoint.
