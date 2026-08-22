# thusinh1969/BrighTO-Semantic-Social-Audio-Profiler-V1.5.SE

## Resumen

BrighTO-Semantic-Social-Audio-Profiler-V1.5.SE (SSAP V1.5 SE) es un modelo de clasificación de audio desarrollado por BrighTO Technology para el análisis semántico de voz y la elaboración de perfiles sociales del hablante. Combina un encoder de audio WavLM con un modelo de lenguaje Qwen2.5 en una arquitectura híbrida que transforma señales de voz en perfiles estructurados en formato JSON, incluyendo género, idioma, emoción, clase social y nivel educativo inferido. El modelo está diseñado para su uso en tiempo real en entornos de call center, banca y detección de fraude.

La versión 1.5 Special Edition amplía el soporte a 14 idiomas (inglés, vietnamita, chino, japonés, coreano, alemán, francés, español, hindi, neerlandés, italiano, polaco, portugués y turco) y se distribuye bajo licencia comercial con acceso restringido. Su peso es de 13,2 GB en formato safetensors, lo que sugiere un modelo de aproximadamente 3 000 millones de parámetros. El modelo se presenta como una solución on-premise, con soporte para despliegue en entornos que requieren privacidad de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder de audio WavLM + modelo de lenguaje Qwen2.5 |
| Parametros totales | No disponible (repo de 13,2 GB en safetensors, estimación ~3B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (clasificación por segmentos de 4-25 s) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en, vi, zh, ja, ko, de, fr, es, hi, nl, it, pl, pt, tr (14 idiomas) |
| Licencia | Comercial (license:other en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura híbrida que combina un encoder de audio WavLM (para extraer características acústicas y paralingüísticas) con un modelo de lenguaje Qwen2.5 (para interpretar esas características y generar un perfil semántico estructurado). Esta combinación permite ir más allá de la simple clasificación de etiquetas, produciendo una salida en formato JSON con inferencias sobre género, idioma, emoción, clase social y nivel educativo del hablante. El entrenamiento se realizó sobre un dataset interno propietario de BrighTO con datos en 11 idiomas (según el model-index), aunque la versión final soporta 14. No se han publicado detalles sobre el número de tokens de entrenamiento, ni sobre el uso de RLHF o DPO en esta versión concreta. La arquitectura incluye un componente de explicabilidad (tag `explainable-ai`) que permite interpretar las decisiones del modelo.

## Capacidades

- Clasificación de género del hablante (F1 92,44).
- Identificación de idioma entre 14 lenguas (F1 94,3).
- Reconocimiento de emociones en la voz (F1 70,95).
- Inferencia de clase social a partir de patrones de habla (F1 87,82).
- Inferencia de nivel educativo del hablante (F1 79,34).
- Detección de acento regional dentro de los idiomas soportados.
- Análisis paralingüístico (tono, velocidad, pausas, entonación).
- Generación de perfiles estructurados en formato JSON, listos para integración con otros sistemas.
- Compatible con pipelines de tiempo real para análisis de conversaciones largas.
- Diseñado para despliegue on-premise, sin dependencia de servicios externos.

## Casos de uso

- Análisis de calidad en call centers: el modelo puede evaluar cada segmento de una llamada (4-25 s) para detectar el estado emocional del cliente y del agente, y correlacionarlo con métricas de satisfacción o escalamiento. Su capacidad de inferir clase social y educación permite segmentar la clientela para personalizar el guion de atención.
- Detección de fraude en banca: combinado con un sistema de verificación de locutor, SSAP puede analizar la voz de una persona que solicita una operación bancaria para detectar signos de estrés, inconsistencia de idioma o perfil social inusual que puedan indicar suplantación de identidad.
- Atención al cliente automatizada: el modelo puede clasificar el perfil del hablante en tiempo real (género, idioma, emoción) para enrutar la llamada al agente más adecuado o activar flujos de respuesta automática adaptados al estado emocional detectado.
- Análisis de encuestas de voz y estudios de mercado: las grabaciones de entrevistas pueden procesarse para extraer perfiles sociodemográficos (clase social, educación, género) y correlacionarlos con las respuestas, sin necesidad de preguntar datos personales.
- Auditoría de cumplimiento en servicios financieros: permite verificar que las conversaciones con clientes de alto riesgo se desarrollan en un tono adecuado y detectar si el cliente muestra confusión o enfado, señalando la necesidad de intervención humana.
- Investigación académica en paralingüística y sociolingüística: el modelo puede usarse como herramienta de anotación automática de corpus de audio, proporcionando etiquetas de emoción, clase social y educación para estudios de variación dialectal y análisis de discurso.
- Asistencia sanitaria (telemedicina): análisis de la voz del paciente para detectar signos de depresión o ansiedad a partir de la prosodia y el ritmo del habla, aunque la fiabilidad en emociones es moderada (F1 70,95) y requiere validación clínica.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el dataset interno de BrighTO (11 idiomas, propietario). No hay verificación externa independiente.

| Tarea | F1 |
|---|---|
| Género | 92,44 |
| Idioma | 94,3 |
| Emoción | 70,95 |
| Clase social | 87,82 |
| Educación | 79,34 |

No se han publicado resultados en benchmarks públicos estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de clasificación de audio y no de generación de texto. Los resultados son sobre datos propietarios y no comparables con otros modelos públicos sin un corpus común.

## Requisitos de hardware

- El tamaño del repo (13,2 GB en safetensors) sugiere que el modelo en FP32 ocupa aproximadamente 13 GB de VRAM, y en FP16 alrededor de 6,6 GB.
- Para inferencia en FP16 se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, A10G). Para procesamiento de segmentos múltiples en tiempo real, se recomienda una GPU de 16-24 GB (RTX 4090, A100 40GB).
- En cuantización INT8 (no publicada oficialmente) cabría en 3-4 GB, pero no se ha confirmado compatibilidad con cuantizadores.
- No se han publicado cifras de latencia ni throughput. Al ser un modelo híbrido audio+LLM, la latencia dependerá de la longitud del segmento de audio y de la generación del JSON de salida.
- Opciones de despliegue: el modelo es compatible con la librería `transformers` de HuggingFace. Para despliegue en producción se puede usar vLLM (si se adapta el pipeline), TGI, o un servicio ONNX Runtime. También es compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- Para despliegue on-premise, se requiere un servidor con GPU NVIDIA (CUDA) y suficiente memoria RAM para cargar los pesos.

## Comparativa con modelos similares

No se dispone de comparaciones públicas con modelos de la misma categoría (clasificación de audio para perfilado social). Los modelos de referencia en clasificación de audio (Wav2Vec2, HuBERT, WavLM) son encoders de características, no generan perfiles semánticos estructurados, por lo que no son directamente comparables. El modelo BrighTO SSAP se posiciona como un sistema de análisis de voz de alto nivel, con un componente de LLM para la interpretación de características. No hay información pública sobre alternativas comerciales equivalentes.

## Limitaciones y advertencias

- La licencia es comercial y el acceso es restringido (gated) en HuggingFace; es necesario aceptar condiciones del autor antes de su descarga, lo que puede limitar su uso en proyectos open-source.
- Los benchmarks declarados se basan en un dataset interno propietario de BrighTO y no han sido verificados de forma independiente; los resultados podrían no reproducirse en otros dominios o poblaciones.
- La F1 de emoción es moderada (70,95), lo que indica una fiabilidad limitada en aplicaciones críticas que dependan de la detección precisa de emociones.
- El modelo está entrenado en 11 idiomas (aunque soporta 14 en inferencia), por lo que el rendimiento en idiomas menos representados puede ser inferior.
- La inferencia de clase social y nivel educativo puede introducir sesgos socioculturales, ya que se basan en patrones de habla que no son universalmente deterministas. Su uso en contextos de toma de decisiones automática (por ejemplo, concesión de crédito) puede plantear problemas éticos y legales.
- No se especifica el número exacto de parámetros ni la composición del dataset de entrenamiento, lo que dificulta la evaluación de la robustez del modelo.
- El modelo requiere un paso previo de segmentación del audio (clips de 4-25 s) y, para conversaciones con varios hablantes, se recomienda usar un modelo de verificación de locutor adicional, lo que añade complejidad al pipeline.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/thusinh1969/BrighTO-Semantic-Social-Audio-Profiler-V1.5.SE
- README del modelo: https://huggingface.co/thusinh1969/BrighTO-Semantic-Social-Audio-Profiler-V1.5.SE/blob/main/README.md
- Página de análisis del modelo BrighTO Audio Profiler V1.0 Prod: https://free2aitools.com/model/thusinh1969/brighto_audio_profiler_v1.0_prod
- Página de análisis del modelo BrighTO Audio Profiler Tiny DPO V1.1 Prod: https://free2aitools.com/model/thusinh1969/brighto_audio_profiler_tiny_dpo_v1.1_prod
- GitHub del autor (proyecto de interoperabilidad sanitaria, no relacionado directamente): https://github.com/thusinh1969/brightohir
