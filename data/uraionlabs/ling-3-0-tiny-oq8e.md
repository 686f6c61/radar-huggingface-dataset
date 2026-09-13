# UraionLabs/Ling-3.0-tiny-oQ8e

## Resumen
Ling-3.0-tiny-oQ8e es una versión cuantizada a 8 bits del modelo inclusionAI/Ling-3.0-tiny, publicada por Uraion Labs y optimizada específicamente para su ejecución en Macs con Apple Silicon mediante el framework MLX. Se trata de un transformer híbrido de arquitectura bailing_hybrid que combina atención lineal (esquema KDA-MLA en proporción 3:1) con una capa FFN de tipo MoE disperso de 128 expertos, de los cuales se activan 8 enrutados más 1 compartido por token. El resultado es un modelo de 7.893.392.800 parámetros totales que solo activa aproximadamente 1.300 millones por token, lo que le permite ofrecer velocidad de un modelo de 1-2 B con calidad asociada a la clase de 8 B.

La aportación de Uraion Labs no es el entrenamiento, sino la cuantización: utiliza el esquema oQe (outlier-aware quantization con calibración mediante matriz de importancia) sobre las 8.928 matrices de expertos MoE, con el conjunto de calibración `oqe_code_multilingual`, y empaqueta el resultado en safetensors para MLX. Según el autor, esto permite mantener intactas las capacidades de razonamiento matemático, generación de código y razonamiento multi-paso, con un peso final de aproximadamente 8,39 GB en disco.

El modelo es relevante porque acerca a un Mac de consumo (a partir de 16 GB de memoria unificada) un modelo MoE con modo de razonamiento explícito (`<think>`), soporte de tool calling y una ventana de contexto declarada de entre 131.000 y 256.000 tokens, con velocidades declaradas de 86-105+ tokens por segundo en un M4 Pro. Es, por tanto, una opción de inferencia local y privada para desarrolladores que trabajan en macOS y no quieren depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `bailing_hybrid`: atención lineal KDA-MLA en proporción 3:1 combinada con FFN MoE disperso |
| Parametros totales | 7.893.392.800 (aproximadamente 7,9 B), según los pesos en safetensors |
| Parametros activos | Aproximadamente 1,3 B por token (8 expertos enrutados + 1 compartido, de un total de 128 expertos) |
| Longitud de contexto | 131.000 tokens, ampliable hasta 256.000 según las etiquetas y la model card |
| Tipos de cuantizacion | 8 bits mediante el esquema oQ8e (oQe de oMLX, cuantización outlier-aware con calibración por matriz de importancia) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors para MLX (librería `mlx-lm`); el repositorio contiene código personalizado (`custom_code`) |
| Tamano del repositorio | 8,4 GB |
| Pipeline | text-generation |
| Modelo base | inclusionAI/Ling-3.0-tiny (relación: quantized) |
| Plataforma objetivo | Apple Silicon (M1/M2/M3/M4) mediante MLX y Metal |
| Parámetros de muestreo recomendados | temperature 1.0, top_p 0.95 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Ling-3.0-tiny del equipo Ant Ling (inclusionAI, Ant Group). Se trata de un transformer híbrido que intercala capas de atención lineal con capas de atención completa: la model card describe el esquema como KDA-MLA 3:1, es decir, tres capas de atención lineal por cada capa de atención tipo MLA (multi-head latent attention). La segunda pieza clave es el FFN de tipo sparse MoE con 128 expertos, de los que se enrutan 8 por token más un experto compartido siempre activo, lo que da los aproximadamente 1.300 millones de parámetros activos sobre un total de 7.900 millones.

Uraion Labs no ha entrenado el modelo: ha aplicado una cuantización de 8 bits con esquema oQ8e (oQe de oMLX) sobre las 8.928 matrices de expertos MoE, usando un conjunto de calibración denominado `oqe_code_multilingual`. La cuantización outlier-aware con matriz de importancia busca preservar los valores atípicos que concentran información crítica, de modo que las capacidades de razonamiento matemático y generación de código no se degraden tanto como en una cuantización uniforme. El autor afirma "degradación cero", una afirmación que no está respaldada por benchmarks publicados en la información disponible.

El modelo base incorpora, según la model card, destilación de razonamiento y alineación de modo *thinking*, además de capacidades agénticas. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades
- Generación de texto conversacional en inglés y chino.
- Razonamiento explícito con modo *thinking*: el modelo alterna entre respuestas directas y cadenas de pensamiento delimitadas por `<think>`, activables mediante la instrucción de sistema `detailed thinking on`.
- Generación de código, incluyendo la resolución de problemas tipo script (el ejemplo de la model card genera una implementación de Fibonacci con programación dinámica).
- Razonamiento matemático y multi-paso, reforzado por el conjunto de calibración multilingüe orientado a código.
- Soporte de tool calling / function calling, según las etiquetas del repositorio.
- Flujos agénticos y razonamiento multi-paso sostenido, con ventanas de contexto largas.
- Procesamiento de contexto largo: análisis de documentos extensos y revisión de código repartido en varios ficheros.
- Inferencia local en dispositivo (*on-device*, *edge AI*) sin conexión a red, gracias al empaquetado MLX.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso
- Asistente de programación integrado en el IDE: el modelo puede mantener conversaciones multi-fichero y revisar código en un contexto de 131.000 tokens, ejecutándose en el propio Mac sin enviar código propietario a servicios externos.
- Revisión de *pull requests* con contexto amplio: al soportar tool calling, puede conectarse a la API de GitHub para leer el diff, los ficheros afectados y los comentarios previos, y devolver un informe razonado.
- Agentes autónomos locales: con modo *thinking* y function calling, es viable construir agentes que encadenen varias herramientas (ejecución de tests, lectura de ficheros, consultas a bases de datos) manteniendo el estado durante decenas de miles de tokens.
- Análisis de documentación técnica extensa: resumen, extracción de datos y respuesta a preguntas sobre manuales, normativas o documentación de API que superen ampliamente el contexto de un modelo de 8-32K.
- Atención al cliente en inglés o chino: gracias al modo de respuesta directa (sin cadena de pensamiento), puede responder con baja latencia en conversaciones multi-turno sobre productos técnicos.
- Generación de código en pipelines de CI/CD: el servidor compatible con OpenAI que expone `mlx-lm` u `omlx` permite integrarlo como paso de generación de tests o de parches automáticos en un *runner* macOS autoalojado.
- Procesamiento de datos sensible en entornos regulados: al ejecutarse íntegramente en local, es adecuado para sectores con requisitos de residencia de datos (sanidad, legal, finanzas) donde no se permite el envío a APIs externas.
- Prototipado e investigación sin coste de API: al tener licencia MIT y ejecutarse en hardware de consumo, sirve para experimentar con prompting, evaluaciones y ajustes de agentes sin gasto por token.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de rendimiento en inferencia (86-105+ tokens por segundo en un M4 Pro y otros chips de la serie M de Apple), sin cifras de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Tampoco se publica una comparación de perplejidad o de degradación frente al modelo base sin cuantizar.

## Requisitos de hardware
- Espacio en disco y pesos en memoria: aproximadamente 8,39 GB para el modelo cuantizado a 8 bits.
- Memoria unificada mínima: 16 GB, según el autor; recomendable 24 GB o más para dejar margen al sistema operativo y al IDE.
- Memoria unificada recomendada: 24, 36, 48, 64 o 128 GB. Ventanas de contexto de 131.000-256.000 tokens requieren una caché KV considerable, por lo que en máquinas de 16 GB conviene reducir la longitud de contexto efectiva.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante Metal. No hay soporte CUDA ni ROCm en este repositorio.
- Encaje en GPU de consumo: sí, es precisamente su objetivo; cabe en cualquier Mac con 16 GB o más de memoria unificada. No está pensado para GPU discretas NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (CLI y API de Python), `mlx_lm.server` (servidor compatible con la API de OpenAI) y `omlx serve` como servidor de alto rendimiento para Apple Silicon. Requiere `pip install --upgrade mlx-lm` y el flag de código remoto, ya que el repositorio usa `custom_code`.
- Latencia y throughput: 86-105+ tokens por segundo según el autor, medido en un M4 Pro y otros chips de la serie M.
- vLLM, TGI, llama.cpp y Ollama no están soportados por este repositorio, orientado a MLX.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UraionLabs/Ling-3.0-tiny-oQ8e | 7,9 B / 1,3 B | 131K-256K | 8 bits (oQ8e, MLX) | MIT | HuggingFace, MLX / oMLX, Apple Silicon |
| inclusionAI/Ling-3.0-tiny (base) | 7,9 B / 1,3 B | 131K-256K | Formato original (no cuantizado); detalle no disponible | No disponible en la informacion proporcionada | HuggingFace, ModelScope, OpenRouter, recetas SGLang |
| Otras alternativas MoE de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

Las búsquedas web realizadas no devolvieron información sobre modelos comparables; los resultados obtenidos correspondían a contenidos ajenos al modelo (el videojuego *Control*), por lo que no se han utilizado. La única comparación documentada en la información disponible es con el modelo base del que deriva esta cuantización.

## Limitaciones y advertencias
- Cobertura lingüística limitada al inglés y al chino; no se declara soporte de castellano ni de otras lenguas.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria ni evidencia independiente de su calidad.
- La afirmación de "degradación cero" tras la cuantización procede del autor y no está respaldada por benchmarks publicados; conviene verificar el comportamiento en tareas de matemáticas y código antes de usarlo en producción.
- Se trata de un modelo derivado y no oficial; los créditos de arquitectura y entrenamiento corresponden al equipo Ant Ling (inclusionAI).
- La licencia MIT se declara para este repositorio; debe comprobarse de forma independiente la licencia aplicable al modelo base antes de un uso comercial.
- Alucinaciones: como cualquier LLM, puede generar código, referencias o afirmaciones plausibles pero incorrectas; el modo *thinking* no elimina este riesgo.
- El contexto declarado de 131.000-256.000 tokens no implica atención efectiva uniforme en toda la ventana; la degradación en posiciones intermedias no se ha documentado.
- La caché KV para contextos muy largos puede consumir varios gigabytes adicionales de memoria unificada y degradar el rendimiento en máquinas de 16 GB.
- Restricciones de plataforma: el formato es MLX y depende de Metal, por lo que no es directamente desplegable en servidores Linux con GPU NVIDIA.
- Requiere ejecución con código remoto habilitado (`trust_remote_code`), lo que implica ejecutar código del repositorio; conviene auditarlo antes de usarlo en entornos corporativos.
- El repositorio indica fechas de creación y actualización de septiembre de 2026, posteriores a la fecha habitual de consulta; este dato se reproduce tal cual figura en la información disponible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/UraionLabs/Ling-3.0-tiny-oQ8e
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Organización inclusionAI en HuggingFace: https://huggingface.co/inclusionAI
- ModelScope de inclusionAI: https://modelscope.cn/organization/inclusionAI
- API en OpenRouter de Ling-3.0-tiny: https://openrouter.ai/inclusionai/ling-3.0-tiny:free
- Recetas de despliegue con SGLang para Ling-3.0-tiny: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-tiny
- Framework MLX: https://github.com/ml-explore/mlx
- Uraion Labs: https://uraionlabs.com
- Nota: las búsquedas web realizadas no aportaron ningún enlace relevante sobre este modelo; los resultados devueltos correspondían al videojuego *Control* y a su banda sonora, por lo que se han descartado.
