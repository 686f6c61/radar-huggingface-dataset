# tracinginsights/tif1-LFM3-1.7B-GGUF

## Resumen

tif1-LFM3-1.7B es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B de Liquid AI, publicado por el usuario tracinginsights. Está especializado en una tarea muy concreta: convertir preguntas en lenguaje natural sobre estadísticas de Fórmula 1 en consultas SQL sobre la base de datos F1DB, ejecutadas localmente con DuckDB. El modelo no memoriza resultados de carreras; su función es planificar la consulta, narrar el resultado y explicar gráficos de telemetría.

El modelo base LFM3-1.7B tiene 1.728.801.600 parámetros y una arquitectura híbrida de 24 capas que combina 13 convoluciones cortas, 5 capas de atención de ventana deslizante y 6 capas de atención global. El fine-tune se realizó con LoRA (r64, α32) durante una época sobre 273.000 filas sintéticas de F1, con promediado de los últimos cuatro checkpoints y fusión posterior de los pesos.

La relevancia de esta ficha radica en que es un ejemplo de modelo pequeño y especializado que se distribuye en GGUF para llama.cpp y también como bundle para un motor WebGPU que corre íntegramente en el navegador. La licencia LFM Open License v1.0 permite uso no comercial y uso comercial para organizaciones con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (13 convoluciones cortas, 5 capas de atención de ventana deslizante, 6 capas de atención global; 24 capas en total) |
| Parámetros totales | 1.728.801.600 (1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 81.920 tokens en servidor (20.480 por slot con `-np 4`); el prompt de planificación ocupa unos 13.000 tokens |
| Tipos de cuantización | Q4_0 (1,05 GB) y F16 (3,47 GB) |
| Idiomas soportados | Inglés |
| Licencia | LFM Open License v1.0 (uso no comercial libre; uso comercial permitido a organizaciones con ingresos anuales inferiores a 10M USD) |
| Formato de pesos | GGUF (llama.cpp) y bundle WebGPU (`.tif1kv`, `.tif1ng`, `manifest.json`) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura híbrida que alterna convoluciones cortas con capas de atención de ventana deslizante y atención global. Esta combinación reduce el coste computacional del procesamiento de secuencias largas frente a un transformer de atención completa, algo relevante porque el prompt de planificación del sistema ocupa aproximadamente 13.000 tokens. El fine-tune se aplicó mediante LoRA con rango 64 y alpha 32 durante una única época sobre 273.000 filas sintéticas de datos de Fórmula 1, seguido de un promediado de los pesos de los últimos cuatro checkpoints y su fusión en el modelo final.

La innovación técnica más destacable no está en el entrenamiento sino en el despliegue: el repositorio incluye un bundle para un motor WebGPU propio que ejecuta el modelo dentro de la pestaña del navegador sin servidor. Este bundle contiene el estado del prompt de planificación ya procesado (`.tif1kv`, 87 MB), lo que reduce el tiempo hasta el primer token de planificación de unos 6 segundos en una T4 a 0,2–0,4 segundos, y dos tablas de especulación (`.tif1ng`) que permiten al motor generar varios tokens a la vez y verificarlos, con salida bit a bit idéntica. El modelo se sirve mediante llama.cpp con soporte para LFM3 (PR #31252 del 27 de octubre de 2026 o posterior), usando `--jinja`, checkpoints de contexto y flash attention.

## Capacidades

- Generación de texto y razonamiento estructurado para producir planes en formato JSON con una consulta SQL de DuckDB como núcleo.
- Generación de SQL sobre el esquema de la base de datos F1DB, incluyendo restatements de una línea, sugerencias de gráficos y tres preguntas de seguimiento.
- Narración de resultados de consultas usando únicamente los números presentes en el resultado devuelto por la base de datos.
- Explicación de gráficos de telemetría de vueltas (botón de gráficos Ultra de la aplicación tif1).
- Soporte de conversación multi-turno mediante el formato de chat de llama.cpp con plantilla Jinja.
- Ejecución en navegador mediante WebGPU con tablas de decodificación especulativa.
- No dispone de capacidades de visión, audio ni tool calling genérico; su especialización es exclusivamente text-to-SQL para Fórmula 1.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Consultas de estadísticas de Fórmula 1 en local: un aficionado o analista puede lanzar preguntas como "¿quién tiene más podios en Monza desde 2010?" y el modelo genera la consulta SQL que la aplicación ejecuta contra F1DB en DuckDB, sin depender de servicios en la nube.
- Despliegue de un asistente de datos deportivos autoalojado: con llama-server y el alias `tif1-lfm3-q4`, la aplicación tif1 reconoce el modelo y aplica el formato de petición entrenado, lo que permite ofrecer un chat de estadísticas con verificación numérica de las respuestas.
- Narración automática de resultados de consultas: tras ejecutar el SQL, el modelo redacta en pocas frases el resultado usando solo las cifras devueltas, lo que encaja en pipelines donde se necesita una capa de lenguaje natural sobre datos tabulares.
- Explicación de telemetría de vueltas: el modelo describe gráficos de telemetría generados por la aplicación, útil para periodistas o analistas que quieran un resumen textual de una vuelta concreta.
- Generación de preguntas de seguimiento: el plan JSON incluye tres preguntas relacionadas, lo que permite construir interfaces exploratorias de datos sin diseñar manualmente el árbol de navegación.
- Ejecución en el navegador sin servidor: gracias al bundle WebGPU, se puede ofrecer una demo o herramienta educativa que descarga unos 1,15 GB la primera vez y luego funciona desde el almacenamiento del navegador, sin coste de infraestructura.
- Prototipado de text-to-SQL especializado: sirve como referencia para equipos que quieran ajustar un modelo pequeño sobre un esquema de base de datos concreto y validar la viabilidad de ejecutar SQL localmente en lugar de confiar en el modelo para recordar datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye mediciones de latencia del motor WebGPU en una Tesla T4 con Chrome, que se recogen a continuación por su valor práctico:

| Tarea | Tiempo medido (mediana) | Notas |
|---|---|---|
| Plan (prompt de 13k tokens + pregunta, esquema JSON) | 1,05 s de petición al último token | Aproximadamente 1,6× más rápido con la tabla de planificación en preguntas no vistas |
| Respuesta (unos 40 tokens) | 160 ms hasta el primer token, 0,44 s hasta el último | |
| Explicación de gráfico (hasta 256 tokens) | 1,3 s | Aproximadamente 1,4× más rápido con la tabla de explicación en gráficos no vistos |

Además, la model card indica que flash attention (`-fa on`) mejora el procesamiento del prompt en torno a un 27% en una T4. No se han publicado cifras de MMLU, HumanEval, GSM8K ni de precisión de ejecución SQL.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,05 GB para el archivo Q4_0 y 3,47 GB para el F16, más el espacio de contexto y caché KV.
- GPU recomendadas: Tesla T4 (mediciones publicadas), A100 y H100 para mayor throughput; el modelo es lo bastante pequeño para GPUs de consumo.
- Cabe en GPU de consumo: sí, con la cuantización Q4_0 (1,05 GB) en tarjetas con 4 GB o más de VRAM; el F16 requiere al menos 4–6 GB.
- Opciones de despliegue: llama.cpp mediante `llama-server` con soporte LFM3 (PR #31252 o posterior), y motor WebGPU propio de la aplicación tif1 dentro del navegador.
- Configuración recomendada en servidor: `--jinja -np 4 -c 81920 --ctx-checkpoints 16 -fa on`, con un slot por tipo de llamada (plan, continuación/reparación de plan, respuesta, explicación de gráfico).
- Latencia y throughput: en una T4 con el motor WebGPU, 1,05 s para el plan completo, 0,44 s para una respuesta de 40 tokens y 1,3 s para una explicación de hasta 256 tokens. No se han publicado cifras de throughput en llama-server.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. A continuación se comparan características estructurales con el modelo base y con un modelo pequeño genérico de referencia.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| tif1-LFM3-1.7B | 1,73B | 81.920 tokens en servidor | Text-to-SQL para F1DB y narración de resultados | LFM Open License v1.0 | GGUF, WebGPU |
| LiquidAI/LFM3-1.7B | 1,73B | No disponible en la información proporcionada | Propósito general | LFM Open License v1.0 | No disponible en la información proporcionada |
| Alternativas genéricas de ~1,5–2B | No disponible | No disponible | Propósito general | Varía | Varía |

La comparación con modelos de la misma categoría (pequeños, especializados en text-to-SQL) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La especialización es muy estrecha: solo cubre el dominio de Fórmula 1 y el esquema de F1DB. Fuera de ese ámbito su utilidad es limitada.
- Riesgo de alucinación numérica: aunque la aplicación verifica cada número de la respuesta contra el resultado de la consulta y reintenta con muestreo si no cuadra, el modelo por sí solo puede producir cifras incorrectas.
- El prompt de planificación ocupa unos 13.000 tokens, por lo que sin checkpoints de contexto el procesamiento inicial es costoso; se recomienda usar `--ctx-checkpoints` y primar cada slot.
- Requiere una build de llama.cpp con soporte LFM3 (PR #31252 o posterior); versiones anteriores no cargarán el modelo correctamente.
- El alias del modelo debe empezar por `tif1-lfm3` para que la aplicación tif1 aplique el formato de petición entrenado.
- La licencia LFM Open License v1.0 restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral se requiere licencia adicional.
- El bundle WebGPU forma parte de la aplicación tif1 y no se distribuye como paquete público independiente.
- Las mediciones de latencia publicadas corresponden a una única Tesla T4 en Chrome; no se han medido GPU de portátil.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tracinginsights/tif1-LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Aplicación tif1: https://app.tracinginsights.com/chat
- Configuración de proveedores personalizados: https://app.tracinginsights.com/settings
- Base de datos F1DB: https://github.com/f1db/f1db
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte LFM3 en llama.cpp: PR #31252 (27 de octubre de 2026)
- Manifiesto del bundle WebGPU (fijado por commit): https://huggingface.co/tracinginsights/tif1-LFM3-1.7B-GGUF/resolve/0b2fcb871b8cc5780c473a1fe7af1d4612390221/web/manifest.json
- Licencia LFM Open License v1.0: archivo LICENSE del repositorio
