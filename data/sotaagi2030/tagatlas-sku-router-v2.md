# SOTAagi2030/tagatlas-sku-router-v2

## Resumen

TagAtlas SKU Router v2 es un modelo de clasificación de texto derivado de `bert-base-multilingual-cased`, afinado por SOTAagi2030 para asignar un conjunto de etiquetas de taxonomía de tres niveles (categorías 2, 3 y 4 del catálogo de un marketplace) a partir del nombre de presentación de un SKU. Resuelve un problema acotado y operativo: pre-rellenar metadatos de taxonomía durante el alta de productos en catálogo, de modo que el trabajo humano se limite a revisar y corregir en lugar de etiquetar desde cero.

El modelo tiene 178 millones de parámetros, se distribuye con pesos en safetensors bajo licencia Apache 2.0 y se publica como release candidate `tagatlas-v2-int8` con inferencia en precisión int8. La evaluación reportada se limita a 96 SKUs puntuados y está dominada por nombres de producto en chino, lo que condiciona fuertemente su aplicabilidad fuera de ese dominio.

Es relevante ahora como ejemplo de modelo de nicho, pequeño y desplegable en CPU, orientado a un pipeline concreto de enriquecimiento de catálogo, más que como modelo de propósito general. Su utilidad depende de que la taxonomía de destino coincida con la revisión 2026-02 con la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), derivado de `bert-base-multilingual-cased` |
| Parametros totales | 178,0 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (precisión de inferencia declarada); no se detallan otros formatos |
| Idiomas soportados | no disponible (la evaluación está dominada por chino; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura transformer encoder tipo BERT, inicializada desde `bert-base-multilingual-cased` y afinada como clasificador de texto multi-etiqueta sobre la taxonomía del catálogo. El ajuste fino se realizó durante 3 épocas con learning rate de 2,0e-5 y batch size de 32. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

La innovación técnica es de dominio más que arquitectónica: la salida se interpreta como un conjunto de etiquetas no ordenado sobre tres niveles de taxonomía, con una puntuación de segmento que actúa como umbral de liberación. Los SKUs cuya puntuación cae por debajo de ese umbral se derivan a un gestor de categoría, de forma que el modelo nunca es la única fuente de metadatos del catálogo. La inferencia se declara en int8.

## Capacidades

- Clasificación de texto multi-etiqueta: asigna un conjunto de etiquetas de taxonomía (categoría 2, 3 y 4) a partir del nombre de presentación de un SKU.
- Salida con puntuación por segmento, utilizable como umbral de confianza para enrutado a revisión humana.
- Etiquetado restringido al espacio de la revisión de catálogo con la que fue entrenado: no emite etiquetas fuera de esa revisión.
- Capacidad multilingüe heredada del modelo base, aunque no validada en la evaluación publicada.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades de visión ni de audio.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Alta de catálogo en marketplace: el router pre-rellena las categorías 2, 3 y 4 a partir del nombre del producto, reduciendo el tiempo de etiquetado manual; encaja porque su salida es exactamente el conjunto de etiquetas que el gestor de categoría revisa.
- Enrutado a revisión humana: los SKUs con puntuación de segmento por debajo del umbral de liberación se derivan automáticamente a un gestor de categoría, lo que permite priorizar el esfuerzo humano en los casos ambiguos.
- Normalización de taxonomía en migraciones de catálogo: al reetiquetar un inventario existente contra la revisión 2026-02, el modelo propone etiquetas consistentes que después se validan por muestreo.
- Enriquecimiento por lotes en pipelines de datos: al ser un BERT de 178 M en int8, puede ejecutarse en CPU sobre lotes grandes de nombres de producto sin GPU dedicada, integrándose en un job nocturno de clasificación.
- Control de calidad de metadatos: comparar la etiqueta propuesta por el modelo con la etiqueta existente para detectar SKUs mal categorizados y generar colas de auditoría.
- Pre-etiquetado para anotación activa: usar las predicciones como borrador inicial en herramientas de anotación interna, de modo que el anotador solo corrija, acelerando la creación de un conjunto etiquetado propio.
- Filtrado por segmento en herramientas de merchandising: agrupar SKUs por segmento predicho (por ejemplo, alimentación preparada, gran consumo, frescos) para construir vistas internas de surtido, siempre con revisión posterior.

## Benchmarks y rendimiento

Evaluación sobre un conjunto congelado de 96 SKUs puntuados, con etiquetas comparadas como conjuntos no ordenados y micro-promediado por segmento antes de la media macro.

| Segmento | Soporte | Precision | Recall | F1 |
|---|---|---|---|---|
| 餐饮熟食 | 52 | 0,9178 | 0,8590 | 0,8874 |
| 快消品 | 28 | 0,9241 | 0,8690 | 0,8957 |
| 生鲜 | 16 | 0,9333 | 0,8750 | 0,9032 |

- Macro-F1 (tres segmentos puntuados): 0,8954
- Micro-F1 (todos los SKUs puntuados): 0,8925

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,2 GB en int8 para los pesos (178 M de parámetros), más overhead de activaciones y del tokenizador; el consumo real no está publicado.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente (por ejemplo, T4, L4, RTX 3060 o superiores).
- Cabe holgadamente en GPU de consumo y también en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con `pipeline("text-classification")`, y servidores compatibles con endpoints de Hugging Face; vLLM, llama.cpp u Ollama no aplican de forma estándar a este tipo de encoder de clasificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TagAtlas SKU Router v2 | 178,0 M | no disponible | Clasificación de taxonomía de SKU | Apache 2.0 | Hugging Face |
| `bert-base-multilingual-cased` | 178,0 M | 512 tokens (estándar del modelo base) | Encoder multilingüe de propósito general | Apache 2.0 | Hugging Face |
| `distilbert-base-multilingual-cased` | 135,0 M | 512 tokens (estándar del modelo base) | Encoder multilingüe destilado | Apache 2.0 | Hugging Face |

La comparación con alternativas específicas de enrutado de taxonomía de producto no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluación tiene solo 96 SKUs puntuados y está dominado por nombres de producto en chino; el segmento `生鲜` cuenta con 16 SKUs, por lo que sus métricas tienen alta varianza.
- El modelo nunca emite etiquetas fuera de la revisión de catálogo con la que fue entrenado (2026-02); ante un cambio de taxonomía queda obsoleto y requiere reentrenamiento.
- Su salida es advisory: el autor indica explícitamente que debe revisarse por un gestor de categoría antes de publicarse.
- No debe usarse para inferir precios, identidad del comerciante ni atributos de clientes.
- Riesgo de alucinación de etiquetas: al ser un clasificador restringido al espacio de etiquetas conocido, el fallo típico es una asignación incorrecta dentro de ese espacio, no la invención de etiquetas nuevas.
- No hay información sobre sesgos por idioma, región o tipo de producto más allá de la advertencia sobre el dominio chino de la evaluación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del dominio evaluado.
- El repositorio figura con 0,0 GB de tamaño y sin descargas ni likes en el momento de la consulta; conviene verificar la integridad y la presencia efectiva de los pesos antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SOTAagi2030/tagatlas-sku-router-v2
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Paper de BERT (referencia del modelo base): https://arxiv.org/abs/1810.04805
- Paper de mBERT (referencia multilingüe): https://arxiv.org/abs/1906.01502
