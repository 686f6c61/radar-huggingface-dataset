# TH69426a/emscad-fraud-ft-final

## Resumen

El modelo `TH69426a/emscad-fraud-ft-final` es un ajuste fino (fine-tuning) de un modelo de la familia Qwen2, orientado a la detección de fraudes en ofertas de empleo. Desarrollado por el usuario TH69426a y publicado en HuggingFace, el modelo está diseñado para la generación de texto y clasificación de contenido, con un tamaño de aproximadamente 494 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños y eficientes para tareas específicas de NLP.

La relevancia de este modelo radica en su aplicación al problema de la detección de estafas laborales, un área con impacto social y económico significativo. Aunque la información pública es escasa, el nombre del repositorio y los tags sugieren que fue entrenado sobre el dataset EMSCAD (Employment Scam Aegean Dataset), un conjunto de datos de referencia para la detección de anuncios de empleo fraudulentos. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y text-generation-inference.

La ficha que sigue se basa exclusivamente en la información disponible en la model card y en los resultados de búsqueda web. Dado que la model card está mayoritariamente sin rellenar, muchos datos técnicos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformers) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen2, un transformer decoder-only con atención causal, desarrollado originalmente por Alibaba Cloud. El modelo ha sido ajustado para la tarea específica de detección de fraude en ofertas de empleo, probablemente mediante fine-tuning supervisado sobre el dataset EMSCAD. Este dataset contiene anuncios de empleo reales y fraudulentos, y es ampliamente utilizado en la literatura para tareas de clasificación binaria.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en el ajuste. El modelo se presenta como un adaptador o checkpoint final, lo que sugiere que fue entrenado a partir de un modelo base Qwen2 preexistente, aunque el modelo base exacto no se especifica.

## Capacidades

- Generación de texto: el modelo puede generar texto en formato conversacional, dado su pipeline de text-generation.
- Clasificación de texto: por su nombre y contexto, está especializado en identificar ofertas de empleo fraudulentas, aunque no se documenta explícitamente la salida (probabilidad, etiqueta, etc.).
- Razonamiento contextual: al estar basado en Qwen2, hereda capacidades de comprensión del lenguaje y razonamiento básico, aunque su tamaño reducido limita la complejidad de las tareas.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible, aunque Qwen2 soporta múltiples idiomas, el ajuste específico podría estar limitado a un idioma concreto (probablemente inglés, dado el dataset EMSCAD).
- Capacidades especiales: no documentadas.

## Casos de uso

- Moderación de ofertas de empleo en portales de trabajo: el modelo puede integrarse en pipelines de publicación de anuncios para filtrar ofertas fraudulentas antes de que lleguen a los candidatos. Su tamaño compacto permite desplegarlo en servicios con recursos limitados.
- Asistencia a reclutadores: puede utilizarse como herramienta de apoyo para que los reclutadores revisen manualmente las ofertas marcadas como sospechosas, reduciendo el tiempo de revisión.
- Investigación académica: dado el uso del dataset EMSCAD, el modelo puede servir como punto de partida para investigaciones sobre detección de fraude laboral, comparación de arquitecturas o análisis de sesgos.
- Sistemas de alerta temprana: integrado en servicios de búsqueda de empleo, puede generar alertas automáticas para los usuarios cuando una oferta presenta características de fraude.
- Análisis de tendencias: puede utilizarse para analizar grandes volúmenes de ofertas de empleo y detectar patrones emergentes de fraude en diferentes sectores o regiones.
- Filtrado en pipelines de datos: en entornos donde se recopilan ofertas de empleo de múltiples fuentes, el modelo puede actuar como un clasificador previo para limpiar el dataset antes de análisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de comparaciones con otros modelos en la tarea de detección de fraude. La ausencia de datos de evaluación impide valorar su rendimiento cuantitativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 494 millones de parámetros, en FP16 el modelo ocupa aproximadamente 1 GB de VRAM. En cuantización INT8, el uso se reduce a unos 0,5 GB, y en INT4 a unos 0,25 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no en datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son suficientes. Para despliegues en producción, una T4 o A10G es adecuada.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en la mayoría de GPUs de consumo actuales, incluso en modos cuantizados.
- Opciones de despliegue: al ser un modelo transformers estándar, puede desplegarse con vLLM, llama.cpp, Ollama, HuggingFace TGI o mediante la API de HuggingFace Inference Endpoints. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput: no disponible. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El modelo es un ajuste fino de Qwen2, por lo que podría compararse con otros modelos de la familia Qwen2 de tamaño similar (por ejemplo, Qwen2-0.5B), pero no se han publicado métricas comparativas. Tampoco se conocen otros modelos ajustados específicamente para EMSCAD con los que comparar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Dado que el dataset EMSCAD es de origen académico y puede contener sesgos geográficos o temporales, el modelo podría no generalizar bien a otros contextos.
- Riesgo de alucinación: al ser un modelo de generación de texto, puede producir respuestas inventadas si se le pide generar contenido libre. Para tareas de clasificación, se recomienda usar la salida de forma controlada.
- Limitaciones de contexto: la longitud de contexto no está documentada, pero los modelos Qwen2 de este tamaño suelen soportar entre 4K y 32K tokens. Se recomienda verificar este dato antes de usarlo con textos largos.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de usarlo en producción.
- Caveats para producción: la model card está incompleta, sin información sobre el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación. Esto dificulta la reproducibilidad y la confianza en el modelo para entornos críticos.

## Enlaces

- HuggingFace: https://huggingface.co/TH69426a/emscad-fraud-ft-final
- Dataset EMSCAD (referencia): https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction
- Proyecto relacionado (adaptador EMSCAD): https://huggingface.co/Fernandosr85/emscad-employment-scam-detection-adapter
- Repositorio de ejemplo con EMSCAD: https://github.com/FelixLuciano/Fake-JobPosting-Prediction
- Proyecto de detección de fraude en reclutamiento: https://github.com/calvinfrederick/recruitment-scam
- Análisis de detección de fraude laboral: https://waizhen.github.io/Data_Science_Portfolio/portfolio/recruitment-scam/
