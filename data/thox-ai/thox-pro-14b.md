# Thox-ai/thox-pro-14b

## Resumen

thox-pro-14b es una distribución configurada por Thox-ai del modelo Ministral-3-14B-Instruct-2512 de Mistral AI, empaquetada para inferencia local en un único dispositivo mediante Ollama. Se trata de un modelo multimodal de tipo image-text-to-text orientado a la comprensión de documentos, gráficos, diagramas y figuras, con procesamiento íntegramente local de los datos de imagen. THOX no ha entrenado los pesos: su aportación se limita a la configuración de runtime, la documentación y la capa de clustering MeshStack, mientras que las capas de pesos son byte-idénticas a la distribución upstream de Ollama (verificado por SHA-256 en la revisión del 31 de octubre de 2026).

El modelo parte de la arquitectura de Ministral 3 14B, con 14.000 millones de parámetros y una ventana de contexto declarada de 256.000 tokens. La distribución se sirve en cuantización Q4_K_M en formato GGUF con un tamaño de 9,1 GB, lo que lo sitúa en el rango de ejecución viable en hardware de consumo. Acepta hasta 5 imágenes por petición con resolución de hasta 4K en formatos JPEG, PNG, TIFF, DICOM y PDF.

La relevancia actual del modelo radica en su propuesta de inferencia local para flujos de trabajo profesionales con contenido visual sensible, donde el envío de documentos a servicios en la nube no es aceptable. No obstante, la model card es explícita sobre la ausencia de evaluaciones independientes ejecutadas por THOX y sobre la retirada de cifras de benchmark previamente publicadas que no procedían de mediciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Ministral-3-14B-Instruct-2512 |
| Parametros totales | 14B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) en la distribucion publicada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (distribucion Ollama); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Ministral-3-14B-Instruct-2512 de Mistral AI, un transformer multimodal que procesa entradas de texto e imagen. THOX no documenta innovaciones arquitectónicas propias: la model card indica explícitamente que el trabajo de THOX reside en la capa de clustering MeshStack, la configuración de runtime y la documentación, nunca en los pesos. Las capas de pesos de la distribución Ollama son byte-idénticas a las del proveedor upstream, con verificación SHA-256 en la revisión del 31 de octubre de 2026.

En cuanto al entrenamiento, THOX declara no haber ejecutado ningún fine-tuning, no haber aportado datasets ni procedimiento de entrenamiento propios para esta release. Los datos y el procedimiento de entrenamiento son los del proveedor del modelo base, y la model card remite a la ficha de Ministral-3-14B-Instruct-2512 para ese registro. Tampoco se documentan detalles sobre composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO en el modelo original dentro de la información disponible.

## Capacidades

- Generación de texto y razonamiento sobre entradas multimodales de texto e imagen.
- Comprensión de documentos con contenido visual: documentos escaneados, gráficos, dashboards, diagramas y figuras científicas.
- Procesamiento de hasta 5 imágenes por petición, con resolución de hasta 4K.
- Soporte de formatos de imagen JPEG, PNG y TIFF, además de DICOM y PDF (DICOM requiere conversión de formato adecuada).
- Inferencia local completa: los datos de imagen se procesan en el dispositivo y no se suben a servicios externos.
- Contexto largo de 256.000 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües limitadas al inglés según la metadata del modelo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking en la información disponible.

## Casos de uso

- Revisión de expedientes y exhibiciones documentales: el modelo puede procesar documentos con contenido visual (escaneos, anexos, figuras) en un contexto de 256.000 tokens, lo que permite cargar expedientes completos y formular preguntas sobre ellos sin fragmentar el material.
- Interpretación de gráficos y dashboards: adecuado para extraer tendencias, valores y relaciones de gráficos de negocio o informes financieros, con la ventaja de que los datos no salen del dispositivo.
- Análisis de figuras científicas: permite describir y contextualizar figuras de publicaciones o informes técnicos, útil en flujos de revisión preliminar bajo supervisión de personal cualificado.
- Cribado preliminar en entornos profesionales regulados: soporte de triaje inicial en contextos médicos, legales o financieros, siempre con verificación posterior por parte de un profesional licenciado, ya que la model card excluye explícitamente que las salidas constituyan diagnóstico, opinión legal o asesoramiento financiero.
- Procesamiento de documentos PDF con imágenes embebidas: la aceptación de PDF y de hasta 5 imágenes por petición permite analizar informes con portadas, tablas y diagramas en una sola interacción.
- Despliegue en hardware de consumo: con 9,1 GB en Q4_K_M y ejecución vía Ollama, es viable en estaciones de trabajo con GPU de gama alta para consumo o en equipos con suficiente memoria unificada, sin dependencia de infraestructura cloud.
- Escenarios de soberanía de datos: organizaciones que no pueden enviar documentación sensible a APIs externas pueden ejecutar el modelo localmente y mantener el control sobre el procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la informacion disponible. La model card indica que las cifras aproximadas que aparecían anteriormente (MMMU, MMMU Pro, ChartQA, DocVQA, MathVista) fueron retiradas por no proceder de mediciones ejecutadas por THOX, y que la evaluación independiente de THOX para este modelo está pendiente. Tampoco se declaran cifras de throughput, latencia, concurrencia, uptime ni ahorro de costes para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,1 GB en Q4_K_M (tamaño del artefacto GGUF publicado), más overhead de contexto KV; con 256.000 tokens de contexto el consumo de memoria para la caché KV puede ser considerable y requerirá ajustar el tamaño de contexto en la práctica.
- GPU recomendadas: no disponibles de forma específica en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o GPUs profesionales tipo A100/H100 son holgadas para la cuantización publicada.
- Viabilidad en GPU de consumo: sí, en GPUs con al menos 12-16 GB de VRAM para Q4_K_M con contextos moderados; en GPUs de 8 GB requeriría reducir contexto o recurrir a cuantizaciones menores no publicadas en esta distribución.
- Opciones de despliegue: Ollama es el método documentado (`ollama pull Thox-ai/thox-pro-14b` y `ollama run Thox-ai/thox-pro-14b`). No se documentan integraciones con vLLM, TGI o llama.cpp en la información disponible, aunque el formato GGUF es compatible con runners basados en llama.cpp.
- Latencia y throughput estimados: no disponibles; la model card no declara cifras de rendimiento para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thox-pro-14b | 14B | 256.000 tokens | Texto + imagen | Apache 2.0 | Ollama y Hugging Face |
| Ministral-3-14B-Instruct-2512 (base) | 14B | 256.000 tokens (heredado) | Texto + imagen | Apache 2.0 (upstream) | Hugging Face y Ollama (upstream) |
| Alternativas de 14B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el propio modelo base, del que esta distribución no difiere en pesos. No se dispone de datos de benchmarks verificados para establecer comparaciones de rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Máximo de 5 imágenes por petición; no está optimizado para vídeo (solo procesamiento fotograma a fotograma).
- Las imágenes especializadas como DICOM requieren conversión de formato adecuada antes del procesamiento.
- El operador es responsable de cumplir las obligaciones regulatorias aplicables a su despliegue; THOX no reclama ninguna certificación (HIPAA, SOC 2 u otras) para este modelo.
- Las salidas en contextos médico, legal y financiero requieren supervisión de un profesional licenciado y no constituyen diagnóstico, opinión legal ni asesoramiento financiero.
- El modelo no tiene acceso a información en línea; todo el procesamiento es local por diseño.
- Idioma soportado limitado al inglés según la metadata, lo que restringe su uso en castellano sin evaluación adicional.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las limitaciones generales de los modelos de lenguaje del tamaño del base.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero los pesos siguen rigiéndose por los términos del proveedor upstream registrados en la model card.
- Ausencia de evaluación independiente publicada por THOX: cualquier cifra de rendimiento debe tratarse con cautela hasta que se publique una evaluación con metodología y resultados.
- La model card corrige afirmaciones previas: se retiraron cifras de benchmark no verificadas y se corrigió la licencia, que anteriormente figuraba erróneamente como MIT.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/thox-pro-14b
- Modelo en Ollama: https://ollama.com/Thox-ai/thox-pro-14b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Sitio del proyecto THOX: https://thox.ai
