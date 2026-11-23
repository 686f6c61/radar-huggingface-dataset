# voicort/sn92-generalist-r2-c

## Resumen

sn92-generalist-r2-c es un ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario voicort en Hugging Face. Se presenta como un modelo de decisión y clasificación de texto con capacidad de procesamiento imagen-texto, etiquetado con la arquitectura gemma4 y una licencia Apache 2.0. El repositorio tiene acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar los pesos.

El modelo cuenta con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) en formato safetensors, con un tamaño de repositorio de 62,6 GB, lo que sugiere pesos en precisión bf16 o fp16. Está pensado para tareas de clasificación y toma de decisiones dentro del pipeline text-classification, aunque los tags también indican capacidades image-text-to-text y de razonamiento (reax).

La relevancia de esta ficha es limitada por la escasez de documentación pública: no se han publicado idiomas soportados, datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de los tags. Se trata de un modelo derivado de un base poco documentado, con cero descargas y cero likes en el momento de la consulta, lo que aconseja precaución antes de evaluarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (según tag; detalles no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `gemma4` sugiere una arquitectura de tipo transformer decoder-only de la familia Gemma, aunque no se dispone de confirmación oficial ni de detalles sobre número de capas, dimensión oculta, mecanismo de atención o uso de attention linear. El modelo base declarado es MachinePulseAI/karpo-decision-31B, del cual este repositorio es un fine-tune; no se ha publicado información sobre el proceso de ajuste, el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

Los tags adicionales (`decision-model`, `reax`, `image-text-to-text`) indican que el ajuste está orientado a tareas de decisión y clasificación, posiblemente con entrada multimodal imagen-texto, pero no hay documentación que describa la composición del dataset, la estrategia de alineación ni innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, por lo que el modelo está orientado a asignar etiquetas o categorías a entradas textuales.
- Procesamiento imagen-texto: el tag image-text-to-text indica capacidad de recibir imágenes junto con texto, aunque no se detalla el formato ni el rendimiento.
- Toma de decisiones: los tags decision-model y reax sugieren uso en sistemas de decisión automatizada o razonamiento estructurado.
- Generación de texto: al derivar de un modelo de 31B de la familia Gemma, es probable que conserve capacidades generativas, aunque no se documenta explícitamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): visión parcialmente indicada por el tag image-text-to-text; el resto no disponible.

## Casos de uso

- Clasificación automática de tickets de soporte: el modelo puede asignar categorías y prioridades a incidencias entrantes, aprovechando su pipeline de text-classification y su tamaño de 31B para capturar matices en textos largos o ambiguos.
- Moderación de contenido: uso como clasificador de contenido sensible en plataformas, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.
- Enrutamiento de consultas en sistemas RAG: clasificar la intención del usuario para dirigir la consulta al índice o herramienta adecuada dentro de un pipeline de recuperación aumentada.
- Análisis de documentos con imágenes: gracias al tag image-text-to-text, podría emplearse para clasificar documentos escaneados o capturas que combinen texto e imagen, aunque el rendimiento real no está documentado.
- Sistemas de decisión en entornos controlados: el tag decision-model sugiere aplicaciones de scoring o selección de acciones, siempre que se valide previamente con datos propios dado que no hay benchmarks públicos.
- Investigación sobre fine-tuning de modelos Gemma: útil como punto de partida para estudiar ajustes de clasificación sobre bases de 31B, con la cautela de que el acceso es restringido y la documentación es mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3B parámetros, en bf16/fp16 se requieren aproximadamente 62,6 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache.
- Cuantización a 8 bits: aproximadamente 31-35 GB de VRAM, viable en una A100 40GB o H100.
- Cuantización a 4 bits: aproximadamente 16-20 GB de VRAM, viable en RTX 4090 (24 GB) o A6000 (48 GB).
- GPU recomendadas: A100 80GB, H100 80GB para precisión completa; A100 40GB o L40S para 8 bits; RTX 4090 para 4 bits.
- ¿Cabe en consumer GPU? Solo con cuantización agresiva (4 bits) en GPUs de 24 GB como la RTX 4090; no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable: no hay benchmarks publicados, no se conocen las especificaciones del modelo base MachinePulseAI/karpo-decision-31B y no se han identificado alternativas directamente comparables en la información proporcionada. Se indica por tanto "no disponible".

## Limitaciones y advertencias

- Documentación mínima: no se han publicado idiomas, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados o entornos de CI/CD.
- Riesgo de alucinación: como modelo generativo derivado de un LLM de 31B, puede producir salidas incorrectas o inventadas, especialmente en tareas de clasificación con etiquetas no vistas.
- Sesgos desconocidos: al no documentarse la composición del dataset de ajuste, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base podría tener condiciones adicionales no reflejadas en este repositorio; conviene verificar la licencia de MachinePulseAI/karpo-decision-31B.
- Sin tracción comunitaria: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte o reportes de errores.
- Fecha de creación futura (2026-11-22): el repositorio presenta una fecha de creación posterior a la actual, lo que puede indicar un artefacto de prueba o un error de metadatos; conviene tratarlo con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-c
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
