# thelamapi/next-3-pro-i1-GGUF

## Resumen

Next-3-Pro-i1-GGUF es la versión cuantizada en formato GGUF del modelo Next-3-Pro, desarrollado por el usuario thelamapi. Se trata de un modelo multimodal de tipo vision-language con capacidades declaradas de razonamiento, generación de código, tool-use y contexto largo, afinado para instrucciones. El repositorio lo publica mradermacher (según los metadatos de la model card) aplicando cuantizaciones con imatrix sobre el modelo base `thelamapi/next3-pro`, lo que permite ejecutar un modelo de aproximadamente 26.900 millones de parámetros en hardware de consumo mediante llama.cpp y derivados.

El modelo base cuenta con 26.895.998.464 parámetros según los tensores en safetensors, lo que lo sitúa en la franja de los ~27B, un tamaño habitual para modelos densos de propósito general con capacidades multimodales. La disponibilidad de un amplio abanico de cuantizaciones (desde IQ1_S de 7,8 GB hasta Q6_K de 22,2 GB) lo hace accesible tanto en GPUs de consumo con 8-12 GB de VRAM como en estaciones de trabajo con 24 GB o más.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo con etiquetas de capacidades amplias (visión, código, razonamiento, agentes, contexto largo) pero con información pública muy limitada: no se especifican la longitud de contexto, la licencia, los detalles de entrenamiento ni resultados de benchmarks en la documentación disponible. Los idiomas declarados son inglés y turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal vision-language; detalles no especificados) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | inglés (en), turco (tr) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); modelo base presumiblemente safetensors |
| Tamano del repo | 305,8 GB |
| Modelo base | thelamapi/next3-pro |
| Cuantizador | mradermacher (quants i1 con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas indican que es un modelo multimodal vision-language, lo que implica un componente de codificación visual acoplado a un transformer de lenguaje, pero no se especifican el tipo de atención, la profundidad, el número de cabezas ni si emplea innovaciones como atención lineal o decodificación especulativa. Tampoco se detalla si es un modelo denso o Mixture-of-Experts; el recuento de parámetros totales (26,9B) y la ausencia de parámetros activos sugieren un modelo denso.

En cuanto al entrenamiento, la model card únicamente referencia los datasets `openai/gsm8k` (matemáticas de primaria) y `google-research-datasets/mbpp` (problemas de programación en Python), lo que sugiere que el ajuste incluyó datos de razonamiento matemático y generación de código. No se especifica el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La etiqueta "instruction-tuned" confirma que el modelo está afinado para seguir instrucciones, pero se desconoce el proceso exacto.

La versión aquí descrita es una cuantización GGUF generada con imatrix (matriz de importancia), una técnica que mejora la calidad de las cuantizaciones de baja precisión ponderando la importancia de cada peso. El repositorio incluye el propio archivo imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Los archivos mmproj (necesarios para el procesamiento de visión en llama.cpp) no están en este repositorio, sino en el repositorio estático de mradermacher.

## Capacidades

- Generación de texto y razonamiento general, con etiqueta explícita de "reasoning".
- Generación de código y resolución de problemas de programación (referencia a MBPP en los datasets).
- Razonamiento matemático (referencia a GSM8K en los datasets).
- Capacidades multimodales de visión-lenguaje: el modelo puede procesar imágenes, aunque los archivos mmproj necesarios para ello están en el repositorio estático de mradermacher, no en este.
- Soporte de tool calling / function calling (etiqueta "tool-use").
- Capacidades de agente y razonamiento multi-paso (etiquetas "tool-use" y "long-context").
- Contexto largo (etiqueta "long-context", sin cifra concreta disponible).
- Multilingüe limitado a inglés y turco.
- Afinado para instrucciones (instruction-tuned) y formato conversacional.

## Casos de uso

- Asistencia de programación en local: el modelo puede generar y explicar código Python y de otros lenguajes, integrándose en editores o pipelines de CI/CD mediante llama.cpp u Ollama, aprovechando su tamaño de ~27B para tareas de autocompletado y revisión de código sin depender de la nube.
- Razonamiento matemático paso a paso: dado su ajuste con GSM8K, es adecuado para resolver problemas aritméticos y algebraicos en herramientas educativas o de verificación de cálculos, con la ventaja de poder ejecutarse en hardware de consumo en cuantizaciones Q4.
- Análisis de documentos e imágenes en local: al ser un modelo vision-language, puede describir imágenes, extraer información de capturas o diagramas y responder preguntas sobre ellos, útil en flujos de digitalización de documentos donde la privacidad impide enviar datos a APIs externas.
- Agentes automatizados con tool calling: la etiqueta "tool-use" sugiere que puede invocar funciones y APIs, lo que permite construir asistentes que consulten bases de datos, ejecuten búsquedas o encadenen llamadas a servicios en flujos multi-paso.
- Procesamiento de conversaciones largas: la etiqueta "long-context" indica que puede manejar ventanas de contexto extensas, adecuado para resumir transcripciones, analizar hilos de soporte o mantener diálogos multi-turno con historial amplio.
- Soporte al cliente en inglés y turco: el modelo puede gestionar conversaciones de atención al cliente en estos dos idiomas, con la ventaja de desplegarse on-premise en cuantizaciones Q4_K_M (16,8 GB) en una GPU de 24 GB.
- Prototipado e investigación: al ser un GGUF con múltiples cuantizaciones, sirve para experimentar con técnicas de cuantización, evaluar la degradación de calidad entre niveles y comparar con otros modelos de ~27B en entornos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas. Los datasets GSM8K y MBPP aparecen únicamente como datos de referencia del ajuste, no como resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - IQ1_S (7,8 GB): cabe en GPUs de 8 GB, con calidad muy degradada.
  - IQ2_M (10,5 GB): cabe en GPUs de 12 GB.
  - IQ3_M (12,9 GB): cabe en GPUs de 16 GB.
  - Q4_K_M (16,8 GB, recomendada): requiere ~17-18 GB, cabe en GPUs de 24 GB.
  - Q5_K_M (19,4 GB): requiere ~20 GB.
  - Q6_K (22,2 GB): requiere ~23 GB, justo en GPUs de 24 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para cuantizaciones altas y contexto largo; RTX 3090 (24 GB) como alternativa económica.
- GPUs de consumo: sí, cabe en RTX 3060 12 GB (IQ2_M), RTX 4070 Ti 16 GB (IQ3_M) y RTX 4090 24 GB (Q4_K_M a Q6_K). En GPUs de 8 GB solo caben cuantizaciones IQ1, con calidad muy reducida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. Para visión, es necesario descargar el archivo mmproj del repositorio estático de mradermacher. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para estos se requeriría el modelo base en safetensors.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización y la longitud de contexto; en una RTX 4090 con Q4_K_M se puede esperar un rendimiento usable para chat interactivo, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Next-3-Pro-i1-GGUF | ~26,9B | no disponible | no disponible | GGUF (múltiples quants) | Multimodal, en/tr, tool-use |
| Modelos densos de ~27B (p. ej. Gemma 2 27B, Qwen2.5 32B) | 27-32B | 8K-128K según modelo | licencias permisivas habituales | safetensors, GGUF | Comparables en tamaño; contexto y licencia varían |
| Modelos vision-language de ~30B (p. ej. Qwen2-VL 7B/72B, InternVL) | 7-72B | variable | variable | safetensors, GGUF | Alternativas multimodales consolidadas |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas. La comparativa se limita a parámetros, formato y disponibilidad; para contexto, licencia y benchmarks de los competidores habría que consultar sus fichas respectivas.

## Limitaciones y advertencias

- Información pública muy escasa: no se especifican licencia, longitud de contexto, arquitectura detallada ni proceso de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o consultar el modelo base antes de desplegarlo en entornos comerciales.
- Idiomas limitados a inglés y turco: no hay evidencia de soporte para castellano, lo que limita su uso en aplicaciones en español.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en cuantizaciones de baja precisión (IQ1, IQ2, Q2_K).
- Degradación por cuantización: las cuantizaciones por debajo de Q4_K_M pierden calidad de forma notable; la propia model card advierte que IQ1_S es "for the desperate" y Q2_K_S es de "very low quality".
- Visión incompleta en este repositorio: los archivos mmproj necesarios para el procesamiento de imágenes están en el repositorio estático de mradermacher, no en este; sin ellos, el modelo funciona solo como texto.
- Sesgos desconocidos: no se documentan sesgos de género, raza, religión ni otros; al ser un modelo entrenado con datos no especificados, es probable que herede sesgos de sus fuentes.
- Fecha de creación futura (2026-11-22): los metadatos indican una fecha posterior a la actual, lo que puede indicar un error de registro o una publicación programada; conviene verificar la vigencia del repositorio.
- Repositorio de gran tamaño (305,8 GB): la descarga completa es costosa; se recomienda descargar solo el archivo de cuantización deseado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thelamapi/next-3-pro-i1-GGUF
- Modelo base: https://huggingface.co/thelamapi/next3-pro
- Repositorio estático de cuantizaciones (incluye mmproj): https://huggingface.co/mradermacher/Next-3-Pro-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Next-3-Pro-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
