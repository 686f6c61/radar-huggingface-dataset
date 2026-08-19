# yandrewl/Eva

## Resumen

Eva (Encoding of visual atlas) es un modelo fundacional multimodal diseñado específicamente para datos de imagen de tejidos, desarrollado por YAndrewL. Su objetivo es aprender representaciones espaciales complejas de tejidos a nivel molecular, celular y de paciente, integrando información de proteómica espacial e histopatología. Se trata de un modelo de extracción de características de imagen (image-feature-extraction) que emplea una arquitectura de vision transformer novedosa, preentrenada mediante reconstrucción de imágenes enmascaradas sobre datos de proteómica espacial e histopatología emparejados.

La relevancia de Eva radica en su enfoque multimodal para el análisis de tejidos, un área con gran potencial en investigación biomédica y diagnóstico asistido. Al combinar dos modalidades de imagen complementarias, el modelo busca capturar correlaciones entre la expresión de proteínas y la morfología tisular, algo que los modelos unimodales no logran. El acceso al modelo está restringido (gated) en HuggingFace, lo que implica que los usuarios deben aceptar condiciones específicas antes de descargarlo. El repositorio tiene un tamaño de 4.9 GB y fue creado en noviembre de 2025, con una actualización posterior en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (variante novedosa, detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Eva emplea una arquitectura de vision transformer (ViT) con una variante novedosa, aunque los detalles específicos de dicha variante (atención, posicional, etc.) no se han publicado en la información disponible. El preentrenamiento se realiza mediante reconstrucción de imágenes enmascaradas (masked image reconstruction), una técnica similar a la utilizada en modelos como MAE, pero aplicada conjuntamente a dos modalidades: imágenes de proteómica espacial e imágenes de histopatología. Esto implica que el modelo aprende a predecir regiones enmascaradas de ambas modalidades, forzando la captura de representaciones compartidas y específicas de cada una. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables a modelos de imagen en este contexto).

## Capacidades

- Extracción de características de imagen para tejidos: genera representaciones vectoriales (embeddings) de imágenes de proteómica espacial e histopatología.
- Aprendizaje multimodal: integra información de dos modalidades complementarias, lo que permite capturar correlaciones entre expresión proteica y morfología tisular.
- Representaciones a múltiples escalas: el modelo opera a nivel molecular, celular y de paciente, lo que sugiere capacidad para tareas de análisis jerárquico.
- Preentrenamiento autosupervisado: no requiere etiquetas manuales, lo que facilita su adaptación a dominios específicos mediante fine-tuning.
- Sin capacidades de generación de texto ni razonamiento lingüístico: es un modelo puramente visual, sin soporte para tool calling, agentes o procesamiento de lenguaje natural.

## Casos de uso

- Análisis de tejidos en investigación biomédica: Eva puede utilizarse para extraer características de imágenes de inmunofluorescencia o histología, facilitando la identificación de patrones espaciales asociados a enfermedades.
- Correlación entre proteómica y morfología: al integrar ambas modalidades, el modelo permite estudiar cómo la expresión de proteínas se relaciona con la estructura tisular, útil en oncología para caracterizar microambientes tumorales.
- Clasificación de subtipos de cáncer: mediante fine-tuning sobre datasets etiquetados, Eva puede servir como extractor de características para clasificadores que distingan subtipos histológicos o moleculares.
- Descubrimiento de biomarcadores: las representaciones aprendidas podrían revelar asociaciones entre regiones tisulares y marcadores proteicos, ayudando a identificar nuevos biomarcadores diagnósticos o pronósticos.
- Segmentación y anotación de tejidos: aunque no está diseñado explícitamente para segmentación, sus embeddings pueden alimentar modelos downstream para tareas de anotación celular o regional.
- Integración en pipelines de patología digital: Eva puede incorporarse como módulo de extracción de características en flujos de trabajo que procesen grandes volúmenes de imágenes de biopsias, mejorando la eficiencia de análisis automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, dado que el modelo no está orientado a tareas de texto o razonamiento general. Tampoco se han reportado métricas específicas de patología (como AUC en clasificación de cáncer o concordancia con patólogos).

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 4.9 GB, lo que sugiere que los pesos podrían caber en una GPU con 8-12 GB de VRAM en precisión FP16, pero no se confirma.
- GPU recomendadas: no disponible. Dado que es un modelo de imagen, probablemente funcione en GPUs consumer como RTX 3090/4090, pero sin datos oficiales.
- Compatibilidad con consumer GPU: incierta; depende del número de parámetros, que no se ha revelado.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de visión, es probable que se use con PyTorch y bibliotecas como HuggingFace Transformers o timm, pero no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos fundacionales de patología (como UNI, CONCH, Virchow, etc.) porque no se han publicado detalles de rendimiento ni especificaciones técnicas de Eva. Se recomienda consultar la documentación del repositorio para futuras actualizaciones.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones de uso en HuggingFace; la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial.
- Sesgos y alucinaciones: al ser un modelo de visión, no aplica el concepto de alucinación textual, pero podría presentar sesgos en las representaciones si los datos de entrenamiento están desequilibrados (p. ej., sobrerrepresentación de ciertos tipos de tejido o condiciones de imagen).
- Validación clínica insuficiente: no hay evidencia publicada de validación en entornos clínicos reales; su uso en diagnóstico médico requeriría una evaluación rigurosa y aprobación regulatoria.
- Dependencia de la calidad de imagen: el rendimiento puede degradarse con imágenes de baja resolución, artefactos de tinción o variaciones entre centros hospitalarios.
- Falta de documentación técnica: no se han publicado detalles sobre arquitectura exacta, hiperparámetros, dataset de entrenamiento ni métricas de rendimiento, lo que dificulta la reproducibilidad y la comparación justa con otros modelos.
- Sin soporte para texto: el modelo no procesa lenguaje natural, por lo que no es adecuado para tareas que requieran comprensión de informes clínicos o interacción conversacional.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/yandrewl/Eva
- Repositorio de GitHub: https://github.com/YAndrewL/Eva
- README en GitHub: https://github.com/YAndrewL/Eva/blob/main/README.md
