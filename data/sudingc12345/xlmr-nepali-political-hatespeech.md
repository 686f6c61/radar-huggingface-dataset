# SudinGc12345/xlmr-nepali-political-hatespeech

## Resumen

Este modelo, subido por el usuario SudinGc12345, es un clasificador de texto entrenado para detectar discurso de odio político en nepalí. Se basa en la arquitectura XLM-RoBERTa, un transformer encoder-only de la familia XLM, y se distribuye a través de HuggingFace con el pipeline `text-classification`. El checkpoint tiene 278.045.955 parámetros, coincidente con el tamaño de XLM-RoBERTa base, y el repositorio ocupa 1.1 GB.

La relevancia del modelo reside en abordar un problema social y lingüístico específico: la detección automática de contenido político hostil en un idioma de baja representación como el nepalí. Sin embargo, la documentación es extremadamente limitada: la model card está generada automáticamente y no incluye detalles sobre datos de entrenamiento, métricas de evaluación, licencia ni recomendaciones de uso. Su valor práctico actual es, por tanto, difícil de evaluar sin pruebas adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa) |
| Parametros totales | 278.045.955 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (orientado a nepalí según el nombre del modelo) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa, un transformer encoder-only preentrenado con masked language modeling en 100 idiomas, tal y como se describe en el paper de Conneau et al. (2019). El tamaño de parámetros (278 millones) indica que se trata de la variante base. Sobre esta arquitectura se ha realizado un fine-tuning para la tarea de clasificación de texto, presumiblemente para distinguir contenido político que constituye discurso de odio.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, los hiperparámetros ni si se emplearon técnicas como RLHF o DPO. La model card es un stub generado automáticamente y no aporta ningún dato relevante. No se ha documentado ninguna innovación técnica: es un fine-tuning estándar con la librería `transformers`.

## Capacidades

- Clasificación de texto para detectar discurso de odio político en nepalí.
- Pipeline `text-classification` compatible con la API estándar de HuggingFace `transformers`.
- Sin soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se han documentado capacidades multilingües en la práctica; el modelo se enfoca en el nepalí.
- No se ha documentado soporte para vision, audio ni otros dominios.
- Los pesos se guardan en formato `safetensors`, lo que facilita su carga en entornos compatibles con HuggingFace.

## Casos de uso

- Moderación de contenido en redes sociales nepalíes: el modelo puede clasificar automáticamente comentarios o publicaciones en plataformas como Facebook, X o foros locales, permitiendo filtrar contenido de odio político antes de su difusión.
- Análisis de discursos de candidatos: investigadores y periodistas pueden procesar transcripciones de discursos políticos en nepalí para identificar lenguaje hostil hacia partidos, etnias o ideologías.
- Monitorización de campañas electorales: durante procesos electorales, el modelo puede alimentar paneles de análisis en tiempo real para detectar picos de discurso de odio y prevenir episodios de violencia política.
- Estudios académicos en sociología y politología: permite etiquetar grandes corpus de texto nepalí en investigaciones sobre polarización política, populismo o radicalización.
- Alertas tempranas para organizaciones de derechos humanos: ONGs pueden integrar el modelo en pipelines de análisis de medios y redes para recibir alertas cuando se detectan patrones de incitación al odio.
- Clasificación de opiniones en secciones de comentarios de medios digitales: los editores pueden usar el modelo para pre-moderar opiniones políticas y decidir su publicación o bloqueo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,1 GB con pesos en FP32; ~0,56 GB en FP16; ~0,28 GB en INT8. El repositorio ocupa 1.1 GB, lo que sugiere pesos en FP32.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA T4, RTX 3060 o A10G.
- Cabe en la mayoría de GPUs de consumo modernas, e incluso se puede ejecutar en CPU con la librería `transformers`, aunque con mayor latencia.
- Opciones de despliegue: `transformers` en Python, HuggingFace Inference Endpoints (el repo incluye el tag `endpoints_compatible`) y Text Generation Inference (TGI) para la clasificación de texto.
- Latencia y throughput: no disponibles sin pruebas de referencia.

## Comparativa con modelos similares

No disponible: no se ha encontrado información suficiente sobre modelos comparables para la tarea específica de detección de discurso de odio político en nepalí.

## Limitaciones y advertencias

- Sesgos: no se ha documentado ningún análisis de sesgos lingüísticos, políticos, étnicos o demográficos. El modelo podría reflejar sesgos presentes en el dataset de entrenamiento.
- Alucinación: al tratarse de una tarea de clasificación, el riesgo de texto generado alucinado es bajo, pero pueden producirse falsos positivos y falsos negativos en la clasificación.
- Limitación de idioma: el modelo está orientado al nepalí; su rendimiento en otros idiomas no está evaluado ni garantizado.
- Licencia: no disponible, lo que genera incertidumbre sobre su uso comercial o su redistribución.
- Documentación: la model card es automática y no incluye detalles de entrenamiento, evaluación ni limitaciones; cualquier adopción en producción requiere una validación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/SudinGc12345/xlmr-nepali-political-hatespeech
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1910.09700
