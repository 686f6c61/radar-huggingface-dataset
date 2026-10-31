# ternary/Arbiter-8B-GGUF

## Resumen

Arbiter-8B-GGUF es la versión cuantizada en formato GGUF de Arbiter-8B (v0.4), un modelo de decisión especializado en gestión de patrimonio y activos desarrollado por ternary. El modelo base es un fine-tuning de Qwen3-8B diseñado para una tarea muy concreta: leer artículos de noticias y pasajes de formularios SEC 10-K y responder preguntas tipificadas sobre una empresa concreta (tipo de evento, outlook implícito, grado de certeza, categoría de riesgo, flags del filing, etc.), respondiendo únicamente con la letra de la opción elegida.

Su relevancia radica en que aborda un problema real de la industria financiera: la clasificación estructurada de evidencia textual con decisiones calibradas y reproducibles, algo donde los LLM generales tienden a ser verbosos e inconsistentes. Al conservar la arquitectura, el tokenizador y la plantilla de chat de Qwen3, cualquier runtime compatible con GGUF de Qwen3 (llama.cpp, Ollama, LM Studio) puede ejecutarlo sin cambios. Con 8.190.735.360 parámetros y cuantizaciones desde Q4_K_M (5,0 GB), es lo bastante ligero para inferencia local en hardware de consumo, con una precisión medida del 82,1 % en Q4_K_M frente al 74,2 % del Qwen3-8B sin ajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no hay indicios de que sea MoE; arquitectura Qwen3 dense) |
| Longitud de contexto | no disponible (el ejemplo oficial usa 4096 tokens) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base ternary/Arbiter-8B distribuye safetensors) |

## Arquitectura y entrenamiento

Arbiter-8B parte de Qwen3-8B, un transformer denso, y conserva intactos su arquitectura, tokenizador y chat template. El ajuste fino se ha realizado sobre un formato de prompt fijo: un mensaje de sistema que instruye a elegir exactamente una opción y responder solo con su letra mayúscula, y un mensaje de usuario en JSON con tres campos: `evidence` (el texto literal), `criterion` (la pregunta seguida de `Focus entity: <empresa>`) y `options` (lista de pares letra/descripción). El modelo se entrena con definiciones de pregunta concretas (event type, outlook, certainty, main subject, role, 10-K risk, legal status y filing flags) y funciona mejor con esas definiciones exactas y un máximo de 16 opciones.

Los datos de entrenamiento proceden de noticias y filings SEC 10-K, con una validación sobre 151 decisiones etiquetadas por humanos de empresas excluidas del entrenamiento. El repositorio principal (ternary/Arbiter-8B) incluye además una "decision head" y una calibración por pregunta que suman unos 3 puntos de precisión y proporcionan probabilidades bien calibradas; estos GGUF contienen solo el modelo de lenguaje ajustado. El uso recomendado desactiva el modo thinking de Qwen3 y genera un único token con temperatura 0, aprovechando los top logprobs para obtener la confianza por opción.

## Capacidades

- Clasificación de evidencia textual financiera: dado un texto (noticia o pasaje de 10-K) y un criterio, selecciona una opción de una lista cerrada y responde solo con su letra.
- Preguntas soportadas por entrenamiento: tipo de evento, outlook implícito, grado de certeza del evento, sujeto principal, rol, riesgo del 10-K, estado legal y flags del filing.
- Salida de confianza por opción mediante top logprobs del primer token generado (hasta 20 logprobs), permitiendo calcular probabilidades por letra.
- Compatibilidad con el ecosistema Qwen3: mismo tokenizador y chat template, incluyendo el parámetro `enable_thinking: false`.
- No es un modelo conversacional generalista: está optimizado para un único formato de prompt y respuestas de un token, no para generación de texto libre, razonamiento extenso ni código.
- Soporte de tool calling / function calling: no disponible (no forma parte del entrenamiento).
- Capacidades multilingues: no disponible; el entrenamiento y la etiqueta de idioma son en inglés.

## Casos de uso

- Clasificación de sentimiento financiero en noticias: dado un titular o párrafo sobre una empresa, el modelo determina si el outlook implícito mejora, empeora, se mantiene o es poco claro, con confianza por opción vía logprobs.
- Procesamiento de filings SEC 10-K a escala: extracción estructurada de señales de riesgo, estado legal y flags de filing de miles de pasajes, con respuestas de un token que hacen el pipeline barato y rápido.
- Monitorización de eventos corporativos: clasificación del tipo de evento (fusiones, resultados, cambios de directiva, litigios) sobre flujos de noticias en tiempo real para alertas o dashboards.
- Construcción de datasets etiquetados: su salida determinista (temperatura 0, un token) y calibrable lo hace adecuado como etiquetador automático con control de confianza para anotar corpus financieros.
- Screening cuantitativo: integración en estrategias de inversión como generador de features discretas (outlook, certeza, categoría de riesgo) a partir de texto, alimentando modelos posteriores.
- Sistemas de wealth management con revisión humana: la probabilidad por opción permite enrutar a revisión manual solo los casos de baja confianza, reduciendo coste de supervisión.
- Inferencia local y privada: con cuantizaciones desde 5 GB, puede ejecutarse en portátiles y estaciones de trabajo sin enviar datos financieros sensibles a APIs externas.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 151 decisiones etiquetadas por humanos (empresas held-out del entrenamiento, noticias y 10-K):

| Modelo | Accuracy |
|---|---|
| Arbiter-8B, GGUF Q4_K_M (respuesta por letra) | 82,1 % |
| Arbiter-8B, GGUF Q8_0 (respuesta por letra) | 82,8 % |
| Arbiter-8B con decision head (repositorio principal) | 85,4 % |
| Qwen3-8B sin fine-tuning | 74,2 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en GPU):
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,9 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,7 GB
  - F16: ~16,4 GB
- Cabe en GPUs de consumo: sí. Q4_K_M y Q5_K_M caben con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090; Q8_0 cabe en una RTX 4090 (24 GB) o en GPUs de 12-16 GB con offload parcial a CPU; F16 requiere ~18 GB o más.
- También es viable ejecución en CPU pura o híbrida (CPU+GPU) con llama.cpp, dado el tamaño contenido de los ficheros.
- Runtimes soportados: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF de Qwen3. Ejemplos oficiales: `llama-server -hf ternary/Arbiter-8B-GGUF:Q4_K_M -c 4096` y `ollama run hf.co/ternary/Arbiter-8B-GGUF:Q4_K_M`.
- Latencia y throughput: no disponible como cifras oficiales; al generar un único token con temperatura 0, la latencia por decisión es esencialmente el tiempo de prefill del prompt, muy inferior a la generación de texto libre.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Accuracy (dominio) | Licencia |
|---|---|---|---|---|---|
| Arbiter-8B-GGUF (este modelo) | 8,19 B | GGUF (Q4_K_M–F16) | Decisiones financieras estructuradas | 82,1 % (Q4_K_M) / 85,4 % (con decision head) | Apache-2.0 |
| Qwen3-8B (base, sin ajustar) | 8,19 B | Safetensors, GGUF comunitarios | Uso general | 74,2 % en la misma tarea | Apache-2.0 |
| ternary/Arbiter-8B (repositorio principal) | 8,19 B + decision head | Safetensors (transformers) | Decisiones financieras con probabilidades calibradas | 85,4 % | Apache-2.0 |

Nota: la comparación con Qwen3-8B es directa porque Arbiter es su fine-tuning y se evaluó sobre el mismo conjunto de 151 decisiones. No se conocen alternativas de terceros de tamaño similar publicando benchmarks sobre ese mismo conjunto, por lo que otras comparaciones no están disponibles.

## Limitaciones y advertencias

- Modelo de tarea única: solo funciona de forma fiable con el formato de prompt exacto con el que fue entrenado (system + JSON con `evidence`, `criterion` y `options`). Usarlo como chatbot general producirá resultados impredecibles.
- Máximo de 16 opciones por pregunta y mejor rendimiento con las definiciones de pregunta exactas del entrenamiento (disponibles en `questions.py` del repositorio principal).
- Los GGUF no incluyen la decision head ni la calibración por pregunta: pierden unos 3 puntos de accuracy y las probabilidades derivadas de logprobs no están formalmente calibradas. Para decisiones críticas o probabilidades calibradas, usar el repositorio principal con transformers.
- Entrenado y etiquetado solo en inglés; no hay soporte garantizado para textos en castellano u otros idiomas.
- Riesgo de alucinación no caracterizado públicamente: al responder con una sola letra no genera explicaciones, lo que impide auditar el razonamiento; la salida debe tratarse como una clasificación estadística, no como asesoramiento financiero.
- Sesgos: el modelo hereda los sesgos de Qwen3-8B y de los datos de noticias y filings SEC con los que se entrenó; su rendimiento se midió solo en 151 ejemplos held-out, una muestra pequeña.
- Uso en producción financiera: cualquier despliegue en decisiones de inversión debe contemplar supervisión humana, validación continua con datos recientes y conciencia de que el rendimiento puede degradarse ante eventos o formatos de filing no vistos en entrenamiento.
- Licencia Apache-2.0: sin restricciones para uso comercial, heredada de Qwen3-8B.

## Enlaces

- Modelo GGUF (esta ficha): https://huggingface.co/ternary/Arbiter-8B-GGUF
- Repositorio principal (safetensors + decision head + questions.py): https://huggingface.co/ternary/Arbiter-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog o demo: no disponibles en la información proporcionada
