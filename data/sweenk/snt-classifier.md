# sweenk/snt-classifier

## Resumen

`sweenk/snt-classifier` es un clasificador de noticias multi-etiqueta desarrollado por Sweenk, una empresa que lo creó para categorizar su propio feed de noticias y lo ha liberado con licencia MIT. El modelo está construido sobre `FacebookAI/xlm-roberta-large` y añade dos cabezas de clasificación independientes con activación sigmoid, una para 12 categorías de nivel superior (L1) y otra para 71 categorías de nivel inferior (L2). Esto permite asignar varias etiquetas simultáneamente en ambos niveles, de modo que un artículo sobre un acuerdo comercial puede clasificarse a la vez como `world`, `money_and_business` y `politics`.

El modelo tiene 559.975.507 parámetros y una ventana de contexto de 512 tokens, y fue afinado sobre aproximadamente 264.000 artículos de noticias. Su relevancia radica en que ofrece una taxonomía jerárquica y multilingüe, con umbrales de decisión ajustados por clase que se guardan en `config.json`. Al ser un clasificador, no genera texto, pero es útil para tareas de enrutamiento, filtrado y análisis de contenido editorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) |
| Parametros totales | 559.975.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe (100 idiomas según XLM-RoBERTa-large) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura XLM-RoBERTa-large como encoder y añade dos cabezas de clasificación lineales con activación sigmoid, una para las 12 categorías L1 y otra para las 71 categorías L2. Ambas cabezas son independientes y permiten que un mismo artículo reciba múltiples etiquetas en cada nivel. Los umbrales de decisión por clase se ajustaron sobre un split de validación y se almacenaron en `config.json`; la función `predict_labels()` los aplica y, si ninguna clase supera el umbral, recurre a argmax para que ningún artículo quede sin etiquetar.

El entrenamiento se realizó mediante fine-tuning sobre aproximadamente 264.000 artículos de noticias, con un corpus total etiquetado de unos 278.000 artículos. Las fuentes incluyen archivos de HuffPost, CommonCrawl News, daily.dev y datos de producción de Sweenk. Las etiquetas fueron generadas por un modelo profesor (Claude Sonnet) mediante prompts basados en reglas, con auditorías humanas puntuales. No se han publicado detalles sobre técnicas como RLHF o DPO, ya que se trata de un clasificador y no de un modelo generativo.

## Capacidades

- Clasificación multi-etiqueta en dos niveles jerárquicos: 12 categorías L1 y 71 categorías L2.
- Asignación simultánea de múltiples etiquetas en cada nivel gracias a las cabezas sigmoid independientes.
- Encoder multilingüe basado en XLM-RoBERTa-large, con soporte para 100 idiomas.
- Función `predict_labels()` que aplica umbrales por clase y hace fallback a argmax.
- Entrada de texto en formato `"{title}\n\n{body}"`, truncada a 512 tokens.
- No genera texto, no soporta tool calling, ni agentes, ni visión o audio.

## Casos de uso

- Categorización automática de feeds de noticias: el modelo etiqueta cada artículo con una o varias categorías L1 y L2, permitiendo organizar un feed en tiempo real sin intervención humana.
- Enrutamiento de contenido en redacciones: las etiquetas L1 permiten asignar automáticamente cada noticia a la sección correspondiente (deportes, política, tecnología, etc.) dentro de un CMS.
- Análisis de tendencias por categoría: agregar las etiquetas a lo largo del tiempo para detectar el aumento de temas como `inteligencia_artificial` o `cambio_climatico` en un medio o en la competencia.
- Filtrado de noticias personalizado: usar las etiquetas para recomendar u ocultar artículos según los intereses declarados o inferidos del usuario.
- Moderación de contenido: identificar categorías sensibles como `crimen_y_justicia` o `guerra_y_conflicto` para aplicar políticas editoriales o de publicación.
- Archivado y búsqueda semántica: etiquetar artículos históricos para permitir búsquedas por tema sin depender solo de palabras clave, mejorando la recuperación en repositorios de noticias.
- Clasificación de artículos en sistemas de recomendación: enriquecer los perfiles de usuario con las etiquetas de los artículos leídos para mejorar la precisión de las recomendaciones.

## Benchmarks y rendimiento

El autor publica resultados de evaluación sobre un split de test de 26.412 artículos (10% del corpus etiquetado, estratificado por L1 primaria). No se han publicado comparativas con otros modelos en la información disponible.

| Métrica | @0.5 threshold | tuned thresholds |
|---|---|---|
| L1 macro F1 | 0.817 | 0.847 |
| L1 micro F1 | 0.831 | 0.857 |
| L1 primary accuracy (argmax) | 0.833 | — |
| L2 macro F1 | 0.647 | 0.685 |
| L2 micro F1 | 0.753 | 0.754 |

Rendimiento por clase L1 con umbrales ajustados:

| L1 | F1 tuned | threshold |
|---|---|---|
| `sports` | 0.954 | 0.850 |
| `politics` | 0.859 | 0.750 |
| `world` | 0.827 | 0.850 |
| `entertainment_and_pop_culture` | 0.898 | 0.850 |
| `money_and_business` | 0.825 | 0.950 |
| `crime_and_justice` | 0.857 | 0.950 |
| `tech_and_ai` | 0.857 | 0.950 |
| `science_and_space` | 0.833 | 0.950 |
| `health_and_wellness` | 0.860 | 0.900 |
| `lifestyle` | 0.867 | 0.700 |
| `weather_and_environment` | 0.857 | 0.950 |
| `human_stories` | 0.671 | 0.900 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 559,9 millones de parámetros. En FP32 ocupa aproximadamente 2,2 GB, y en FP16 alrededor de 1,1 GB. Con overhead de activaciones y tokenizador, se recomienda al menos 4 GB de VRAM para FP16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como RTX 3060, RTX 4060, T4 o A10G. En producción, una A10G o similar es suficiente.
- ¿Cabe en GPU de consumo? Sí, en GPUs de consumo con al menos 4 GB de VRAM.
- Opciones de despliegue: compatible con Transformers mediante el pipeline `text-classification`, Hugging Face Inference Endpoints, ONNX Runtime o una API personalizada con FastAPI. No se recomienda vLLM ni llama.cpp, al tratarse de un modelo encoder y no decoder.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. El modelo se basa en `FacebookAI/xlm-roberta-large`, pero no existen datos de rendimiento frente a otros clasificadores de noticias en la documentación proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento fueron generadas por un modelo LLM (Claude Sonnet) y no por anotadores humanos, lo que puede introducir sesgos y errores sistemáticos en la taxonomía.
- El corpus de entrenamiento procede principalmente de fuentes de noticias en inglés (HuffPost, CommonCrawl News, daily.dev), por lo que el rendimiento en otros idiomas puede ser inferior al esperado.
- La ventana de contexto está limitada a 512 tokens; los artículos más largos se truncan, perdiendo información relevante.
- Existe riesgo de clasificaciones incorrectas, especialmente en categorías con menos ejemplos como `human_stories`, que presenta el F1 más bajo de todas las L1.
- El uso de `predict_labels()` requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor y puede complicar el despliegue en entornos controlados.
- No se han publicado evaluaciones de robustez frente a ataques adversariales ni datos de comportamiento en producción.

## Enlaces

- https://huggingface.co/sweenk/snt-classifier
- https://github.com/sweenk/snt-classification
- https://github.com/sweenk/snt-data
- https://github.com/sweenk/snt-model
- https://sweenk.com
