# suellenlima/bertimbau-sentimento-reviews-ptbr

## Resumen

BERTimbau-sentimento-reviews-ptbr es un modelo de clasificación de texto en portugués de Brasil, especializado en análisis de sentimiento binario (positivo o negativo) sobre reseñas de compras de comercio electrónico. Lo desarrolla la usuaria de Hugging Face `suellenlima` mediante fine-tuning del modelo base BERTimbau base cased (`neuralmind/bert-base-portuguese-cased`), un transformer encoder de tipo BERT entrenado específicamente para portugués por el NILC de la Universidad de São Paulo.

El modelo resuelve un problema acotado y frecuente en analítica de opiniones: convertir texto libre de reseñas de producto en una etiqueta de polaridad. Con 108,9 millones de parámetros, una ventana de entrada limitada a 128 tokens durante el entrenamiento y un repositorio de solo 0,4 GB, está pensado para inferencia ligera y despliegue en CPU o GPU de gama baja, sin necesidad de infraestructura de gran escala.

Su relevancia es sobre todo práctica: parte de un corpus público y trazable (Brazilian E-Commerce Public Dataset by Olist) y reporta métricas concretas en test (F1 macro 0,933, accuracy 0,941). No es un modelo generativo ni un asistente conversacional, sino un clasificador supervisado con licencia MIT, lo que facilita su uso comercial dentro de las limitaciones descritas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTimbau base cased, fine-tuned) |
| Parámetros totales | 108.924.674 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (max_length usado en entrenamiento; no se especifica el máximo arquitectónico) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | portugués (pt, variante de Brasil) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base cased adaptado al portugués mediante fine-tuning supervisado para clasificación binaria de secuencias. La cabeza de clasificación se entrena sobre el encoder preentrenado de BERTimbau, que ya incorpora vocabulario y representaciones específicas del portugués de Brasil. El entrenamiento usó learning rate 2e-05, 3 épocas, batch size 32, `max_length` de 128 tokens, warmup del 10 % y weight decay de 0,01, seleccionando la mejor época por F1 macro en validación.

Los datos provienen del Brazilian E-Commerce Public Dataset by Olist. Las etiquetas se generaron de forma débil a partir de la nota de la reseña: notas 1-2 se mapean a negativo y notas 4-5 a positivo, descartando las notas 3. Se eliminaron duplicados y se aplicó una división estratificada 80/10/10 con semilla 42, resultando en 25.946 ejemplos de entrenamiento, 3.243 de validación y 3.244 de test. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación binaria de sentimiento (positivo o negativo) sobre texto en portugués de Brasil.
- Procesamiento de reseñas cortas de comercio electrónico, con truncamiento a 128 tokens.
- Integración directa con el pipeline `text-classification` de Transformers.
- Ejecución eficiente en CPU y GPU de gama baja por su tamaño (108,9 M de parámetros).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otros idiomas.
- No clasifica sentimiento neutro.

## Casos de uso

- Monitorización de opiniones en marketplaces: procesar en lote reseñas de producto de Olist u otras plataformas de e-commerce en portugués y agregar la polaridad por vendedor, categoría o periodo, aprovechando que el modelo fue entrenado exactamente sobre ese dominio.
- Enrutado de tickets de atención al cliente: clasificar automáticamente quejas como negativas para priorizar su escalado a agentes humanos, con un coste computacional bajo por inferencia.
- Análisis de satisfacción post-compra: etiquetar encuestas abiertas y calcular ratios de sentimiento por producto o región, usando el modelo como capa de etiquetado en un pipeline de analítica.
- Detección temprana de problemas logísticos: identificar reseñas negativas centradas en entrega o estado del producto para alimentar alertas operativas.
- Filtrado y curación de datasets: usar el clasificador para etiquetar grandes volúmenes de texto en portugués antes de entrenar otros modelos o de construir dashboards.
- Prototipado rápido en investigación: servir como baseline reproducible de análisis de sentimiento en portugués gracias a su licencia MIT y a su reducido tamaño, fácil de desplegar en entornos con recursos limitados.
- Moderación asistida de reseñas: marcar contenido claramente negativo para revisión humana, siempre con supervisión, dado el riesgo de error en ironía y textos mixtos.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test:

| Métrica | Valor |
|---|---|
| F1 macro | 0,933 |
| Accuracy | 0,941 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,4-0,5 GB para pesos y activaciones de secuencias cortas; en fp16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes de tamaño moderado.
- Opciones de despliegue: pipeline de Transformers, TorchServe, FastAPI con Transformers, ONNX Runtime si se exporta manualmente; no se documentan artefactos para vLLM, llama.cpp, Ollama ni TGI (estas herramientas están orientadas a modelos generativos y no aplican directamente).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera del orden de milisegundos por secuencia en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suellenlima/bertimbau-sentimento-reviews-ptbr | 108,9 M | 128 tokens (entrenamiento) | Clasificación de sentimiento binaria pt-BR | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased (BERTimbau base) | ~110 M | 512 tokens (arquitectura BERT) | Modelo base, requiere fine-tuning | MIT | Hugging Face |
| BERTimbau large | ~335 M | 512 tokens (arquitectura BERT) | Modelo base, requiere fine-tuning | MIT | Hugging Face |

La comparación con alternativas de la misma categoría (clasificadores de sentimiento en portugués) no está disponible en la información proporcionada. BERTimbau base y large se incluyen como referencia del linaje del modelo, no como clasificadores listos para uso.

## Limitaciones y advertencias

- Entrenado exclusivamente con reseñas de comercio electrónico; su rendimiento en reseñas de restaurantes, delivery de comida u otros dominios no está validado y puede degradarse.
- Las etiquetas provienen de la nota de la reseña, por lo que existe ruido inherente: notas altas con texto negativo y viceversa.
- Dificultad documentada con ironía (por ejemplo, "parabéns pela demora") y con textos de polaridad mixta.
- No clasifica sentimiento neutro; las entradas ambiguas se fuerzan a positivo o negativo.
- Ventana de 128 tokens en entrenamiento: reseñas largas se truncan, lo que puede perder información relevante al final del texto.
- Sesgos potenciales derivados del corpus Olist: sobrerrepresentación de determinadas categorías de producto, regiones de Brasil y estilos de escritura.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en casos límite.
- El autor advierte explícitamente de que no debe usarse para decisiones automáticas sobre personas sin revisión humana.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset de origen (Olist) si se redistribuyen datos derivados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no ha pasado por una validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suellenlima/bertimbau-sentimento-reviews-ptbr
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset Olist: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
- Paper de BERTimbau: no disponible en la información proporcionada
- Repositorio de código: no disponible
- Demo: no disponible
