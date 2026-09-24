# Thaurock/Gemma-3-27b-it-abliterated-GGUF

## Resumen

Thaurock/Gemma-3-27b-it-abliterated-GGUF es una recopilación completa de cuantizaciones en formato GGUF del modelo abliterado gemma-3-27b-it-abliterated, derivado de google/gemma-3-27b-it. El modelo base es un transformer multimodal (texto e imagen) de 27.009.346.304 parámetros desarrollado por Google, y sobre él se ha aplicado un proceso de abliteración orientado a eliminar los rechazos artificiales del modelo instruct original.

El repositorio lo publica el usuario Thaurock y su principal aportación es de empaquetado: ofrece el espectro completo de once cuantizaciones, desde F16 hasta Q2_K, sin ficheros divididos, lo que permite escoger el equilibrio exacto entre precisión y consumo de VRAM/RAM según el hardware disponible. Para ello aplica una técnica experimental de abliteración por capas (layerwise abliteration) que calcula las direcciones de rechazo en los estados ocultos con un multiplicador de peso de 1.5, logrando, según el autor, una tasa de éxito/aceptación superior al 90 % sin degradar la coherencia cognitiva ni la multimodal.

Es relevante ahora porque permite ejecutar localmente, en una sola GPU de consumo, un modelo multimodal de 27B sin los filtros de seguridad estandarizados del modelo original, algo que interesa a desarrolladores que necesitan inferencia sin rechazos para investigación, generación creativa o evaluación de comportamientos del modelo. La contrapartida es que se trata de una obra declarada como puramente experimental, sin benchmarks publicados y con una licencia declarada que conviene verificar frente a los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (texto + visión), heredada de google/gemma-3-27b-it |
| Parametros totales | 27.009.346.304 (aproximadamente 27B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; heredada del modelo base Gemma 3 27B (128.000 tokens segun la documentación de Google) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (11 variantes GGUF) |
| Idiomas soportados | no disponible en la ficha del autor; heredado del modelo base (Gemma 3 declara soporte multilingüe) |
| Licencia | apache-2.0 (declarada en el repositorio; el modelo base google/gemma-3-27b-it se distribuye bajo los Gemma Terms of Use) |
| Formato de pesos | GGUF (11 cuantizaciones); el modelo base original en safetensors |
| Tamano del repositorio | 192,0 GB |
| Modelo base | google/gemma-3-27b-it |
| Proyector de visión | requiere gemma-3-27b-mmproj-f16.gguf para entrada de imagen |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 27B IT de Google: un transformer decoder-only multimodal que combina un decodificador de lenguaje con un codificador de visión para tareas de image-to-text. El repositorio no aporta detalles adicionales sobre la composición del dataset, el número de tokens de entrenamiento ni las fases de alineación (RLHF/DPO) del modelo original; esos datos corresponden a la documentación oficial de google/gemma-3-27b-it, no incluida en la información proporcionada.

La innovación específica de este repositorio es el post-procesado de abliteración. Según el autor, Gemma 3 resulta significativamente más resistente a la neutralización que arquitecturas anteriores, por lo que se aplicó una técnica experimental de abliteración por capas: se calculan las direcciones de rechazo en los estados ocultos capa a capa y se restan con un multiplicador de peso de 1.5. El resultado declarado es una tasa de aceptación superior al 90 % de peticiones que el modelo original rechazaría, manteniendo intacta la coherencia de razonamiento y la capacidad de procesamiento de imágenes. La técnica de abliteración se atribuye a Maxime Labonne (mlabonne), mientras que el empaquetado y la publicación de las cuantizaciones GGUF corresponden a Thaurock.

## Capacidades

- Generación de texto conversacional en formato instruct, con modo de razonamiento heredado del modelo IT original.
- Procesamiento de imágenes (image-to-text): descripción de imágenes, análisis de contenido visual y respuesta a preguntas sobre una imagen, previa carga del proyector mmproj.
- Generación y explicación de código, matemáticas y tareas de razonamiento multi-paso propias de un modelo de 27B.
- Multimodalidad sin los rechazos estandarizados del modelo base: mayor tasa de respuesta ante peticiones que el modelo original filtraría.
- Soporte de cuantizaciones desde F16 hasta Q2_K, lo que permite ajustar calidad y consumo sin cambiar de modelo.
- Compatible con llama.cpp, Ollama y LM Studio, incluyendo uso por línea de comandos con entrada de imagen.
- Tool calling / function calling: no confirmado explícitamente en la información proporcionada (depende de las capacidades del modelo base).
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma específica en esta ficha.

## Casos de uso

- Inferencia local sin filtros en una única GPU de consumo: con la cuantización Q4_K_M (~16,4 GB) el modelo cabe en GPUs como la RTX 4090 y permite generar texto e interpretar imágenes sin los rechazos del modelo instruct original.
- Investigación sobre alineación y seguridad: comparar las respuestas del modelo abliterado frente a google/gemma-3-27b-it permite estudiar cómo se manifiestan y eliminan las direcciones de rechazo en los estados ocultos.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborden temas que el modelo base filtraría, manteniendo un modelo de 27B con coherencia de contexto largo.
- Análisis de imágenes en flujo local: descripción detallada de fotografías, capturas o documentos escaneados mediante llama.cpp con el proyector mmproj, útil para pipelines de etiquetado o accesibilidad.
- Prototipado de asistentes conversacionales multimodales: desarrollo y prueba de aplicaciones de chat que reciben texto e imagen, ejecutables en estaciones de trabajo con 24-48 GB de VRAM.
- Evaluación comparativa de cuantizaciones: el espectro completo de once variantes permite medir empíricamente la degradación de calidad y velocidad entre F16, Q5_K_M, Q4_K_M y Q2_K sobre las mismas tareas.
- Despliegue en entornos aislados o sin conectividad: al ser pesos GGUF locales, es adecuado para escenarios donde no se puede llamar a una API externa por motivos de privacidad o cumplimiento.
- Desarrollo y test de prompts sin coste por token: permite iterar sobre plantillas de instrucciones en local antes de trasladarlas a un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor únicamente declara una tasa de éxito/aceptación de peticiones superior al 90 % tras la abliteración, sin métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada por cuantización (según los tamaños declarados por el autor):
  - F16: ~54,0 GB
  - Q8_0: ~28,6 GB
  - Q6_K: ~22,4 GB
  - Q5_K_M: ~19,3 GB
  - Q5_K_S: ~18,8 GB
  - Q4_K_M: ~16,4 GB
  - Q4_K_S: ~15,5 GB
  - Q3_K_L: ~13,6 GB
  - Q3_K_M: ~12,5 GB
  - Q3_K_S: ~11,7 GB
  - Q2_K: ~10,0 GB
- Debe sumarse el consumo del proyector de visión (gemma-3-27b-mmproj-f16.gguf) cuando se procesan imágenes; su tamaño exacto no se especifica en la información disponible.
- GPU recomendadas por nivel: F16 requiere hardware de gama empresarial (H100 80GB o varias A100 40GB); Q8_0 y Q6_K encajan en A100 40GB, RTX 6000 Ada 48GB o configuraciones multi-GPU; Q5_K_M y Q4_K_M son viables en una RTX 4090 24GB.
- ¿Cabe en GPU de consumo? Sí. Q4_K_M (~16,4 GB) y Q4_K_S (~15,5 GB) son las opciones señaladas por el autor para una sola GPU de consumo; Q3_K y Q2_K (~10-13,6 GB) caben en GPUs de 12-16 GB como la RTX 4080 o la RTX 3080 12GB, con degradación esperable en la decodificación visual en el caso de Q2_K.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio, según el autor. También es compatible con cualquier aplicación que consuma formato GGUF multimodal. No se menciona soporte verificado en vLLM o TGI.
- Parámetros de generación recomendados por el autor: temperature 1.0, top_k 64, top_p 0.95.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens/s para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones GGUF | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Thaurock/Gemma-3-27b-it-abliterated-GGUF | 27B | no disponible (128K heredados del base) | 11 (F16 a Q2_K) | apache-2.0 declarada | no disponible |
| google/gemma-3-27b-it (modelo base) | 27B | 128K | no oficial en safetensors | Gemma Terms of Use | benchmarks publicados por Google (no incluidos en esta información) |
| mlabonne/gemma-3-27b-it-abliterated-GGUF | 27B | no disponible | conjunto propio de cuantizaciones | no disponible | no disponible |

La diferencia principal frente al modelo base es la eliminación de los rechazos artificiales y la disponibilidad de once cuantizaciones GGUF sin ficheros divididos. Frente a la versión de mlabonne, este repositorio se presenta como una recopilación completa del espectro de cuantizaciones; no se dispone de datos de rendimiento comparativos entre ambas.

## Limitaciones y advertencias

- Eliminación de filtros de seguridad: el modelo no incorpora los filtros estandarizados del modelo base, tanto en texto como en análisis de imágenes. Todo el contenido generado es responsabilidad del operador de la inferencia local.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de 27B y puede aumentar en cuantizaciones agresivas.
- Degradación por cuantización: el propio autor advierte que Q2_K, al ser experimental, puede sufrir degradación en los tokens visuales y la recomienda solo para pruebas y desarrollo.
- Licencia: el repositorio declara apache-2.0, pero el modelo base google/gemma-3-27b-it se distribuye bajo los Gemma Terms of Use. Conviene verificar la compatibilidad y las obligaciones de uso comercial antes de un despliegue en producción.
- Idiomas soportados: no se detallan en la ficha; se desconoce si el proceso de abliteración afecta al comportamiento multilingüe.
- Sesgos conocidos: no documentados por el autor. Al eliminar los rechazos, es previsible una mayor exposición a sesgos y contenido problemático presente en los datos de entrenamiento originales.
- Sin benchmarks ni métricas de rendimiento publicadas: no hay evidencia cuantitativa de que la coherencia se mantenga en todas las tareas tras la abliteración.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- Repositorio de gran tamaño (192,0 GB): requiere espacio en disco y ancho de banda considerables para descargar la colección completa de cuantizaciones.
- Uso responsable: la ausencia de salvaguardas hace inadecuado su despliegue en aplicaciones orientadas al público general sin capas de moderación externas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thaurock/Gemma-3-27b-it-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Técnica de abliteración (Maxime Labonne / mlabonne): https://huggingface.co/mlabonne
- Versión abliterada de referencia de mlabonne: https://huggingface.co/mlabonne/gemma-3-27b-it-abliterated-GGUF
- Ficha en local-ai-zone (Gemma 3 27b it abliterated): https://local-ai-zone.github.io/models/gemma-3-27b-it-abliterated.html
- Ficha en local-ai-zone (variante refined vision i1): https://local-ai-zone.github.io/models/gemma-3-27b-it-abliterated-refined-vision-i1.html
- Referencia en Secret AI sobre la versión de mlabonne: https://secretai.io/models/mlabonne/gemma-3-27b-it-abliterated-GGUF
