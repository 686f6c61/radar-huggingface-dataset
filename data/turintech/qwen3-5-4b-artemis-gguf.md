# turintech/Qwen3.5-4B-Artemis-GGUF

## Resumen

Qwen3.5-4B-Artemis-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.5-4B publicada por TurinTech (turintech.ai) bajo el nombre interno «Artemis». No se trata de un modelo entrenado desde cero: es un proceso de cuantización con calibración mediante imatrix sobre los pesos originales de Qwen3.5-4B (4.205.751.296 parámetros), orientado a ejecución local en llama.cpp y Ollama con soporte de function calling y de entrada imagen-texto.

El objetivo declarado por el autor es doble: reducir el peso de descarga (2,714 GB para el fichero por defecto Q4_K_M) y rebajar el pico de memoria en GPU (3,5 GiB en una RTX 5090 con contexto de 8.192 tokens, frente a 8,9 GiB del original en BF16), manteniendo la mayor fidelidad posible respecto al modelo sin cuantizar. El autor reporta que el siguiente token coincide con el original en el 93,5% de los tokens de WikiText-2, frente al 92,7% de la cuantización Q4_K_M de Unsloth.

Su relevancia práctica está en el nicho de modelos de 4B con visión y tool calling ejecutables en hardware de consumo: el repositorio incluye proyectores multimodales separados (mmproj-BF16 y mmproj-F16) y publica resultados propios en BFCL live e IFEval, además de paquetes equivalentes en el registro de Ollama. La ficha del modelo está fechada en octubre de 2026 y acumula 1.054 descargas y 2 likes en HuggingFace en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 (modelo base Qwen/Qwen3.5-4B); no disponible el detalle de capas y atención en la informacion proporcionada |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible el maximo declarado; los ejemplos de despliegue de la model card usan `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (2,714 GB), Q5_K_S (2,903 GB), Q5_K_M (3,011 GB); calibradas con imatrix |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (llama.cpp) y paquetes Ollama; proyectores multimodales en mmproj-BF16.gguf y mmproj-F16.gguf (676 MB) |

## Arquitectura y entrenamiento

El modelo es una conversión a GGUF del transformer Qwen3.5-4B, sin reentrenamiento ni fine-tuning posteriores según la información disponible. TurinTech describe el proceso como una cuantización asistida por Artemis (su herramienta interna) con matriz de importancia (imatrix), y señala que el fichero por defecto Q4_K_M fue seleccionado comparando la fidelidad de generación sobre WikiText-2. El pipeline declarado en HuggingFace es image-text-to-text: la capacidad de visión se aporta mediante un proyector multimodal separado, convertido de los pesos originales, que llama.cpp carga con `--mmproj` (o descarga automáticamente con `-hf`).

No se detallan en la información proporcionada los datos de preentrenamiento del modelo base (número de tokens, composición del corpus, si hubo RLHF/DPO), ni innovaciones de arquitectura más allá de lo heredado de Qwen3.5. Sí hay un dato operativo relevante: la variante publicada en el registro de Ollama es solo texto, ya que el codificador de visión y la capa de predicción multi-token (MTP) no están incluidas en esos paquetes. La model card también fija los ajustes de muestreo de los paquetes Ollama en temperature 1, top_k 20, top_p 0,95 y presence_penalty 1,5, mientras que los benchmarks de tool calling se midieron con decodificación greedy y el modo de razonamiento desactivado.

## Capacidades

- Generación de texto conversacional multirrespuesta, con plantilla de chat de Qwen3.5 activada mediante `--jinja` en llama.cpp.
- Tool calling / function calling: el autor reporta 204 llamadas correctas de 258 en BFCL live, con decodificación greedy y thinking desactivado.
- Seguimiento de instrucciones verificables: 431 de 541 instrucciones cumplidas en IFEval según el autor.
- Modo de razonamiento (thinking) conmutable mediante `chat_template_kwargs.enable_thinking`; en Ollama, `think:false` lo desactiva y omitir el parámetro lo activa según la prueba de humo del autor.
- Visión imagen-texto: preguntas sobre gráficos y descripción de imágenes usando el proyector mmproj; el autor reporta 14 de 20 preguntas de gráficos correctas con el proyector BF16 y 15 con el F16.
- Compatible con endpoints (`endpoints_compatible`) y con el servidor OpenAI-like de llama.cpp (`/v1/chat/completions`).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistente de chat local en estación de trabajo: con 2,714 GB de descarga y un pico de 3,5 GiB de VRAM a 8.192 tokens, se puede servir de forma continua en una GPU de consumo mientras se trabaja, sin depender de API externa.
- Automatización de tool calling en agentes ligeros: el modelo devuelve `tool_calls` estructurados vía plantilla Jinja, lo que permite conectarlo a funciones de negocio (meteorología, consultas a bases de datos, ticketing) con el parser de herramientas de Ollama o de llama.cpp.
- Extracción de datos de imágenes: con el proyector multimodal se pueden enviar capturas de gráficos o tablas como data URL y obtener respuestas en texto, adecuado para tareas de lectura de paneles y reportes visuales.
- Enrutamiento y clasificación de instrucciones en pipelines: el rendimiento en IFEval (431/541) sugiere uso como preprocesador que reformatea o valida peticiones antes de pasarlas a un modelo mayor.
- Prototipado y evaluación de cuantizaciones: al publicar el作者... el autor publica comparativas de fidelidad frente a otras cuantizaciones (93,5% vs 92,7% en same top-p), sirve como referencia para decidir qué GGUF desplegar en producción.
- Entornos con GPU limitada o sin GPU: los paquetes Ollama y los GGUF de 2,7-3,0 GB permiten ejecución en portátiles con GPU integrada o incluso CPU, a costa de latencia.
- Base para fine-tuning ligero o destilación: al ser Apache-2.0 y estar disponible también en tamaños 2B y 9B de la misma familia, facilita experimentos comparativos de escalado.

## Benchmarks y rendimiento

Resultados declarados por el autor (métricas no verificadas de forma independiente, `verified: false`):

| Evaluación | Conjunto de datos | Métrica | Resultado |
|---|---|---|---|
| Cercanía al original BF16 | WikiText-2 test | Same top-p (%) | 93,5 |
| Tool calling | BFCL live | Llamadas correctas | 204 de 258 (79,1%) |
| Seguimiento de instrucciones | IFEval | Instrucciones cumplidas | 431 de 541 (79,7%) |

Comparativas internas citadas en la model card (mismo modelo base, cuantización de Unsloth):

| Medición | Artemis Q4_K_M (2,714 GB) | Unsloth Q4_K_M (2,741 GB) | Original BF16 |
|---|---|---|---|
| Same top-p en WikiText-2 | 93,5% | 92,7% | referencia |
| Pico de VRAM (RTX 5090, 8.192 tokens) | 3,5 GiB | no disponible | 8,9 GiB |
| Preguntas de gráficos (20) con proyector BF16 / F16 | 14 / 15 aciertos | 15 aciertos | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones académicas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,5 GiB de pico con Q4_K_M y contexto de 8.192 tokens (medición del autor en RTX 5090); el modelo original en BF16 alcanza 8,9 GiB en la misma configuración.
- Tamaño de descarga: 2,714 GB (Q4_K_M), 2,903 GB (Q5_K_S), 3,011 GB (Q5_K_M); el proyector de visión añade 676 MB si se usa la ruta `-hf`, evitable con `--no-mmproj`.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM libre funciona para Q4_K_M con contexto moderado; el autor valida en RTX 5090, y por rango de memoria es razonable esperar buen comportamiento en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090 y equivalentes. Para Q5_K_M conviene reservar 1 GB adicional.
- Cabe en GPU de consumo: sí, en toda la gama media y alta con al menos 4 GB de VRAM; también es viable en CPU con llama.cpp, a mayor latencia.
- Opciones de despliegue: `llama-server` de llama.cpp (con `--jinja` obligatorio para tool calling), Ollama (`ollama run turintech/qwen3.5-4b-artemis:q4_k_m` o `ollama run hf.co/turintech/Qwen3.5-4B-Artemis-GGUF:Q4_K_M` para visión), e importación local mediante Modelfile para combinar el GGUF con `mmproj-F16.gguf`.
- Latencia y throughput: no disponibles de forma numérica; el autor solo documenta el pico de memoria y una prueba de humo con semilla 20261015 y límite de 256 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización por defecto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| turintech/Qwen3.5-4B-Artemis-GGUF | 4,2B | no disponible (ejemplos a 8.192) | Q4_K_M 2,714 GB | Apache-2.0 | HF + Ollama | Visión vía mmproj; 93,5% same top-p |
| Unsloth Qwen3.5-4B Q4_K_M | 4,2B | no disponible | Q4_K_M 2,741 GB | Apache-2.0 | HF | 92,7% same top-p; 15/20 en preguntas de gráficos |
| Qwen/Qwen3.5-4B (BF16) | 4,2B | no disponible | BF16 | Apache-2.0 | HF | Referencia de calidad; 8,9 GiB de pico en RTX 5090 |
| turintech/Qwen3.5-2B-Artemis-GGUF | ~2B | no disponible | GGUF | Apache-2.0 | HF | Misma familia, menor huella |
| turintech/Qwen3.5-9B-Artemis-GGUF | ~9B | no disponible | GGUF | Apache-2.0 | HF | Misma familia, mayor calidad a costa de VRAM |

## Limitaciones y advertencias

- La cuantización introduce desviación respecto al original: el propio autor reconoce que el siguiente token no coincide en aproximadamente el 6,5% de los tokens de WikiText-2, lo que puede acumularse en generaciones largas o tareas de razonamiento profundo.
- Los tres benchmarks publicados están marcados como no verificados (`verified: false`) y proceden del autor del modelo; no hay replicación independiente en la información disponible.
- Los paquetes de Ollama no incluyen el codificador de visión ni la capa MTP: son estrictamente texto. Para imagen hay que usar la ruta desde HuggingFace o construir un Modelfile con el proyector.
- El modo de razonamiento está activado por defecto al omitir `think`; si se busca el comportamiento medido en tool calling hay que desactivarlo explícitamente, algo que ni el quickstart ni los paquetes Ollama hacen por defecto.
- Los benchmarks se midieron con decodificación greedy y ajustes de muestreo distintos a los de los paquetes Ollama (temperature 1, top_p 0,95, presence_penalty 1,5), por lo que los resultados no son directamente trasladables a ese entorno.
- No hay información sobre sesgos, composición del corpus de entrenamiento ni evaluaciones de seguridad; el riesgo de alucinación es el esperado en un modelo de 4B sin datos específicos de mitigación publicados.
- La longitud máxima de contexto no está documentada en la ficha; usar ventanas superiores a 8.192 tokens requiere verificar el límite real del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero las obligaciones de atribución y las condiciones del modelo base deben verificarse en el enlace de licencia de Qwen antes de desplegar en producción.
- El registro de Ollama se validó con comprobaciones de solo lectura (hashes SHA-256 y alias de etiquetas) el 16 de octubre de 2026, no con una descarga e inferencia completas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/Qwen3.5-4B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Paquete en Ollama: https://ollama.com/turintech/qwen3.5-4b-artemis
- Variante de 9B de la misma familia: https://huggingface.co/turintech/Qwen3.5-9B-Artemis-GGUF
- Variante de 2B de la misma familia: https://huggingface.co/turintech/Qwen3.5-2B-Artemis-GGUF
- Ficha de TurinTech en HuggingFace: https://huggingface.co/turintech
- Sitio del autor: https://turintech.ai
- Berkeley Function Calling Leaderboard (BFCL): https://gorilla.cs.berkeley.edu/leaderboard.html
- IFEval: https://huggingface.co/datasets/google/IFEval
- WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Registro de terceros con metadatos del modelo: https://free2aitools.com/model/turintech/qwen3.5-4b-artemis-gguf
