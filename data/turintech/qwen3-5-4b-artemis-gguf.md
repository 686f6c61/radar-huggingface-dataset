# turintech/Qwen3.5-4B-Artemis-GGUF

## Resumen

Qwen3.5-4B-Artemis-GGUF es una cuantización en formato GGUF del modelo Qwen3.5-4B de Alibaba Qwen, publicada por TurinTech bajo el nombre "Artemis". El modelo base es un transformer denso de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) con capacidades multimodales de imagen-texto, orientado a generación de texto, razonamiento, matemáticas y function calling en entornos locales.

La relevancia de esta publicación radica en su optimización para despliegue en hardware de consumo: según la model card, la cuantización Q4_K_M ocupa 2,714 GB de descarga y requiere unos 3,5 GiB de VRAM en inferencia solo texto, frente a los 8,9 GiB del modelo original. TurinTech reporta que la cuantización preserva el rendimiento de tool calling del modelo original (204 de 258 llamadas correctas en BFCL live), lo que la convierte en una opción práctica para asistentes locales con function calling en GPUs modestas.

El modelo se distribuye bajo licencia Apache 2.0, con soporte para llama.cpp, Ollama y LM Studio, e incluye un proyector de visión separado de 672 MB para tareas de imagen-texto. La versión de llama.cpp debe incluir soporte para Qwen3.5 (probado con b11617 y b11889 para el proyector).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-4B); cuantización GGUF para llama.cpp |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | GGUF; se distribuye al menos Q4_K_M (2,714 GB); calibrado con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; proyector de visión separado (672 MB) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.5-4B original de Qwen, un transformer denso de aproximadamente 4,2 mil millones de parámetros con pipeline image-text-to-text, lo que indica soporte multimodal de visión además de generación de texto. TurinTech no documenta en la información disponible detalles sobre la composición del dataset de entrenamiento del modelo base, el número de tokens utilizados ni si hubo fases de RLHF o DPO.

La innovación técnica de esta publicación es el proceso de cuantización: los pesos se convierten a GGUF con calibración imatrix, y el proyector de visión se convierte como archivo separado (672 MB), verificado con la build b11889 de llama.cpp. La model card indica que los resultados se midieron con decodificación greedy y el modo de razonamiento (thinking) desactivado, mediante `chat_template_kwargs.enable_thinking: false` o `think: false` en Ollama. El despliegue recomendado usa `llama-server` con `--jinja` para aplicar la plantilla de chat embebida y `-np 1` para mantener una sola ranura.

## Capacidades

- Generación de texto conversacional multi-turno en local.
- Razonamiento y resolución de problemas matemáticos (evaluado en GSM8K).
- Conocimiento general y respuesta a preguntas de nivel avanzado (evaluado en MMLU-Pro).
- Seguimiento de instrucciones con restricciones de formato (evaluado en IFEval).
- Function calling y tool calling con esquemas JSON, con salida en `choices[0].message.tool_calls` vía API compatible con OpenAI de llama-server.
- Capacidades de visión imagen-texto mediante el proyector multimodal separado (pipeline image-text-to-text).
- Modo de razonamiento (thinking) activable o desactivable mediante la plantilla de chat.
- Integración con Ollama (`turintech/qwen3.5-4b-artemis`) y LM Studio.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).

## Casos de uso

- Asistente de chat local en GPU de consumo: con Q4_K_M y unos 3,5 GiB de VRAM en modo texto, el modelo cabe en tarjetas de gama media y permite conversaciones multi-turno sin conexión a servicios externos, usando `llama-server` con `--jinja` y contexto de 8.192 tokens.
- Agentes con function calling en el borde: el rendimiento reportado de 204/258 en BFCL live permite construir agentes que invocan APIs (clima, calendario, bases de datos) desde una máquina local, con las llamadas estructuradas devueltas en el campo `tool_calls` de la respuesta compatible con OpenAI.
- Procesamiento de documentos con imágenes: gracias al proyector de visión de 672 MB, el modelo puede recibir capturas, formularios escaneados o diagramas junto a texto, lo que sirve para extracción de datos o respuesta a preguntas sobre documentos en flujos de trabajo locales.
- Automatización de soporte técnico de primer nivel: el modelo puede clasificar y responder consultas con instrucciones de formato estrictas (IFEval 430/539), útil para generar respuestas estructuradas o tickets normalizados en sistemas internos.
- Tutoría y resolución de problemas matemáticos: con 231/250 en GSM8K, es adecuado para asistentes educativos que resuelven problemas aritméticos paso a paso en entornos sin conectividad.
- Prototipado rápido de aplicaciones LLM: la disponibilidad en Ollama y LM Studio permite a desarrolladores iterar sobre prompts, plantillas de herramientas y flujos agénticos en un portátil antes de migrar a modelos mayores, manteniendo la misma interfaz de API.
- Evaluación de pipelines de CI/CD para agentes: al ser determinista con decodificación greedy y tener un tamaño reducido, puede usarse como modelo de referencia en pruebas automatizadas de integración de herramientas y plantillas de chat.

## Benchmarks y rendimiento

Resultados declarados por TurinTech en la model card (no verificados de forma independiente; medidos con thinking desactivado y decodificación greedy):

| Benchmark | Metrica | Resultado | Porcentaje |
|---|---|---|---|
| BFCL live | Tool calls correctas | 204 de 258 | 79,1 % |
| GSM8K (últimas 250) | Respuestas correctas | 231 de 250 | 92,4 % |
| MMLU-Pro (muestra) | Respuestas correctas | 125 de 280 | 44,6 % |
| IFEval | Instrucciones seguidas | 430 de 539 | 79,8 % |

La model card indica que el resultado de BFCL live de la cuantización (204/258) coincide con el del modelo original (204), lo que sugiere que la cuantización Q4_K_M no degradó el rendimiento de tool calling en esa evaluación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GiB para inferencia solo texto con Q4_K_M y una sola ranura (`-np 1`), medido por el autor; el modelo original requiere unos 8,9 GiB.
- Descarga: 2,714 GB para el archivo Q4_K_M; el proyector de visión añade 672 MB si se usa multimodalidad.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el perfil de VRAM (3,5 GiB) cabe en GPUs de consumo de gama media con al menos 4-6 GB de VRAM.
- Cabe en GPU de consumo: sí, según las cifras del autor, en tarjetas con holgura sobre 3,5 GiB de VRAM para texto; con visión hay que sumar la memoria del proyector.
- Opciones de despliegue: llama.cpp (`llama-server`, builds con soporte Qwen3.5, probado con b11617 y b11889), Ollama (`ollama run turintech/qwen3.5-4b-artemis`), LM Studio (`turintech/qwen3.5-4b-artemis`). No se mencionan vLLM ni TGI en la información disponible.
- Contexto de despliegue recomendado: `-c 8192` en los ejemplos de la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas directas con otros modelos de la misma categoría. La model card únicamente compara la cuantización con su modelo base original en tool calling (BFCL live: 204/258 en ambos) y en requisitos de memoria (3,5 GiB frente a 8,9 GiB). Para el resto de alternativas de 4B con capacidades multimodales y function calling, los datos no están disponibles.

| Modelo | Parametros | Contexto | BFCL live | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-Artemis (Q4_K_M) | 4,2 B | no disponible | 204/258 | Apache 2.0 | GGUF |
| Qwen3.5-4B (original) | 4,2 B | no disponible | 204/258 | Apache 2.0 | safetensors |
| Alternativas de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index); deben tomarse como orientativos.
- El rendimiento en MMLU-Pro es moderado (44,6 % en la muestra evaluada), lo que limita su uso en tareas de conocimiento avanzado o razonamiento experto.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales; aunque el tool calling se mantiene en la evaluación reportada, otras capacidades pueden degradarse.
- Los resultados se midieron con thinking desactivado; activar el modo de razonamiento puede cambiar tanto la calidad como los requisitos de memoria y latencia, y no hay cifras publicadas para ese modo.
- No se documentan los idiomas soportados; aunque el modelo base Qwen suele ser multilingüe, no hay confirmación en la información disponible, por lo que no debe asumirse cobertura multilingüe en producción.
- No se detalla la longitud de contexto nativa del modelo base; el ejemplo de despliegue usa 8.192 tokens, pero el máximo real no está confirmado.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en MMLU-Pro y en consultas factuales abiertas.
- Sesgos conocidos: no documentados en la información disponible.
- Requiere una build de llama.cpp con soporte para Qwen3.5; versiones anteriores no cargarán el modelo correctamente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.5-4B enlazada en la model card para confirmar condiciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Qwen3.5-4B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/qwen3.5-4b-artemis
- LM Studio: https://lmstudio.ai/turintech/qwen3.5-4b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
