# virtual-human-chc/DinoBloom

## Resumen

DinoBloom es una familia de modelos de visión (Vision Transformer) construida sobre DINOv2 de Meta AI y especializada en la extracción de embeddings de células individuales de sangre periférica y médula ósea. Lo desarrolla el grupo de Carsten Marr (Marr Lab, Helmholtz Munich) y se publicó en MICCAI 2024. Resuelve el problema de la falta de un modelo fundacional específico para citomorfología hematológica: en lugar de entrenar clasificadores desde cero para cada tarea, DinoBloom produce representaciones genéricas que sirven como entrada a modelos predictivos aguas abajo.

El modelo se entrenó sobre 13 conjuntos de datos públicos de frotis de sangre periférica y médula ósea, sumando más de 380.000 imágenes de leucocitos, el cohorte de código abierto más amplio en hematología hasta la fecha según los autores. Se ofrece en cuatro tamaños (S, B, L y G) con dimensiones de embedding de 384, 768, 1024 y 1536 respectivamente, lo que permite ajustar el coste computacional al caso de uso.

Su relevancia radica en que supera a modelos de visión médicos y no médicos en evaluaciones de linear probing y k-NN para clasificación de tipos celulares, y en multiple instance learning débilmente supervisado para subtipificación de leucemia mieloide aguda, incluso bajo un cambio de dominio exigente en un conjunto externo. Es un modelo de extracción de características, no un generador: no acepta prompts de texto ni produce texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) basada en DINOv2, parches de 14x14 |
| Parametros totales | 22M (S), 86M (B), 304M (L), 1136M (G) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin versiones cuantizadas publicadas) |
| Idiomas soportados | en (metadatos; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.bin` (`pytorch_model_s.bin`, `_b.bin`, `_l.bin`, `_g.bin`) |

Otras especificaciones: dimensión de feature de 384 (S), 768 (B), 1024 (L) y 1536 (G); entrada `[batch_size, C, 224, 224]`; salida `[n, feature_dim]` en float; tamaño del repositorio 6,2 GB.

## Arquitectura y entrenamiento

DinoBloom es un ViT con arquitectura DINOv2 y parches de 14x14, adaptado mediante un pipeline DINOv2 específico para imágenes de células individuales. Cada imagen se redimensiona a 224x224 y se normaliza con las medias y desviaciones estándar de ImageNet (0.485/0.456/0.406 y 0.229/0.224/0.225). El modelo mapea cada imagen a un vector continuo de dimensión fija según la variante. Los pesos se cargan sobre el modelo base de DINOv2 de `torch.hub` (`dinov2_vits14`, `vitb14`, `vitl14`, `vitg14`) y se sustituye el `pos_embed` por uno de tamaño `1 + (224/14)^2 = 257` tokens.

El entrenamiento se realizó sobre 13 conjuntos de datos públicos diversos de frotis de sangre periférica y médula ósea, con más de 380.000 imágenes de leucocitos. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición por dataset ni si se aplicaron fases de RLHF o DPO (no aplicables a un modelo de representación visual). La innovación principal es el uso de auto-supervisión tipo DINOv2 sobre un dominio médico estrecho y homogéneo, lo que produce embeddings más discriminativos para morfología celular que los modelos de visión de propósito general.

## Capacidades

- Extracción de características (embeddings) de imágenes de células individuales de sangre periférica y médula ósea.
- Clasificación de tipos celulares mediante linear probing o k-NN sobre los embeddings generados.
- Subtipificación de leucemia mieloide aguda mediante multiple instance learning débilmente supervisado.
- Evaluación de batch effects en nuevos conjuntos de datos hematológicos.
- Base para modelos predictivos aguas abajo en pipelines de citomorfología.
- Generalización a dominios con cambio de distribución (evaluado en un conjunto externo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: está especializado en microscopía hematológica.

## Casos de uso

- Clasificación automatizada de leucocitos: se extraen embeddings de cada célula y se entrena un clasificador lineal (linear probing) para distinguir neutrófilos, linfocitos, monocitos y otras poblaciones, sin necesidad de reentrenar el backbone.
- Triaje de frotis sanguíneos: se procesan lotes de imágenes de células y se ordenan por similitud a casos anómalos mediante k-NN sobre los embeddings, priorizando la revisión manual.
- Subtipificación de leucemia mieloide aguda: se agrupan las células de un paciente en bolsas y se aplica multiple instance learning débilmente supervisado para predecir el subtipo, aprovechando la capacidad del modelo de generalizar entre cohortes.
- Detección de batch effects: al comparar la distribución de embeddings de un nuevo conjunto de datos con la del cohorte de entrenamiento se pueden identificar desplazamientos de dominio antes de desplegar un clasificador.
- Baseline para investigación en citomorfología: sirve como referencia fuerte y reproducible para nuevos métodos de clasificación celular, reduciendo el coste de comparación entre estudios.
- Preprocesado en pipelines de diagnóstico asistido: los embeddings alimentan modelos de riesgo o de anomalía que se integran en sistemas de apoyo a la decisión, manteniendo el backbone congelado y solo entrenando la cabeza.
- Análisis de imágenes de médula ósea: la variante G (1536 dimensiones) ofrece representaciones más ricas para tareas con morfología sutil, mientras que la S (22M) permite despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que DinoBloom supera a modelos de visión médicos y no médicos en linear probing y k-NN para clasificación de tipos celulares en frotis de sangre y médula ósea, y en multiple instance learning para subtipificación de leucemia mieloide aguda, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: DinoBloom-S (22M) cabe en menos de 1 GB en fp32; DinoBloom-B (86M) en torno a 1-2 GB; DinoBloom-L (304M) en torno a 2-3 GB; DinoBloom-G (1136M) en torno a 5-6 GB, siempre con lotes pequeños y en fp32 (no hay versiones cuantizadas publicadas).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB para las variantes S, B y L; para la variante G se recomienda una GPU de 16 GB o superior (RTX 4090, A100, H100) si se procesan lotes grandes.
- Cabe en GPU de consumo: sí, las variantes S, B y L caben en tarjetas como RTX 3060, RTX 4060 o superiores; la variante G requiere al menos una RTX 4090 o similar para lotes moderados.
- Opciones de despliegue: PyTorch nativo (carga vía `torch.hub` + `hf_hub_download`), exportación a TorchScript u ONNX no documentada en la información disponible; no hay soporte oficial de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DinoBloom (S/B/L/G) | 22M / 86M / 304M / 1136M | Imagen 224x224 | Hematología (sangre periférica y médula ósea) | Apache 2.0 | Hugging Face (repo fork `virtual-human-chc/DinoBloom`) |
| DINOv2 (Meta AI) | 21M-1,1B según variante | Imagen 224x224 (hasta 518 en algunas variantes) | Visión general | Apache 2.0 (según variante) | Hugging Face y torch.hub |
| Modelos de visión médicos genéricos | no disponible | Imagen | Visión médica general | variable | variable |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; la model card solo afirma que DinoBloom supera a modelos de visión médicos y no médicos en las tareas evaluadas, sin cifras.

## Limitaciones y advertencias

- Modelo de extracción de características: no genera texto, no responde a prompts y no debe presentarse como un modelo conversacional.
- Entrenado exclusivamente con imágenes de hematología (sangre periférica y médula ósea); su uso fuera de ese dominio no está validado.
- La información disponible no documenta sesgos demográficos, de adquisición o de tinción; el rendimiento puede degradarse con cambios de dominio no representados en el entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de embeddings poco informativos o mal calibrados en imágenes atípicas o de baja calidad.
- La entrada está fijada a 224x224 píxeles; imágenes de mayor resolución deben redimensionarse, lo que puede perder detalle morfológico fino.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los 13 conjuntos de datos de entrenamiento originales para usos clínicos regulados.
- El repositorio es un fork del original de los autores (`MarrLab/DinoBloom`); conviene verificar que los pesos son idénticos a los del repositorio canónico antes de usarlo en producción.
- No hay versiones cuantizadas ni exportaciones a formatos de inferencia optimizados documentadas.
- No es un dispositivo médico: no debe usarse como sustituto del diagnóstico profesional sin validación clínica y regulatoria.

## Enlaces

- Hugging Face: https://huggingface.co/virtual-human-chc/DinoBloom
- Repositorio original de los autores en Hugging Face: https://huggingface.co/MarrLab/DinoBloom
- GitHub del proyecto: https://github.com/MarrLab/DinoBloom
- Paper DinoBloom (MICCAI 2024): https://arxiv.org/abs/2404.05022
- Página del paper en MICCAI: https://papers.miccai.org/miccai-2024/230-Paper3584.html
- Paper DINOv2 (Meta AI): https://arxiv.org/abs/2304.07193
