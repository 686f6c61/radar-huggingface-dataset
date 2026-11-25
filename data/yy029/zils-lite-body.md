# YY029/zils-lite-body

## Resumen

zils-lite-body es un ajuste fino (fine-tune) de un modelo de decisión de aproximadamente 853 millones de parámetros, construido sobre la familia Qwen3.5-0.8B. Lo desarrolla el usuario YY029 en el contexto del pool de modelos "soup" denominado `d3-lite` de la red Zils, que opera sobre la subred 127 de Bittensor. El modelo parte de la media ponderada uniforme de dos variantes previas (`Charlie320/zils-lite-v9a` y `qhoenix/zils-lite-decision-v9`) y aplica sobre ella un ajuste LoRA orientado a tareas de decisión estructurada.

El problema que aborda no es la generación de texto libre, sino la toma de decisiones calibradas: contar cuántos requisitos se cumplen, decidir si conviene invocar una herramienta, elegir entre llamar, preguntar o declinar, y producir probabilidades bien calibradas sobre esas decisiones. Esto lo hace relevante para pipelines de agentes y sistemas de enrutamiento donde importa más la fiabilidad probabilística que la fluidez del texto.

La arquitectura subyacente es un transformer denso de Qwen3.5 con torre de visión, aunque el entrenamiento se centró en las capas de lenguaje. El modelo se distribuye en BF16 con formato safetensors y licencia Apache-2.0. Los datos de evaluación publicados son medidas de desarrollo del autor, no resultados validados por la red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con torre de vision; layout "chassis" |
| Parametros totales | 852.985.920 (aprox. 853 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | No disponible (el autor indica "language weights trained" sin detallar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), con `custom_code` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5-0.8B, con torre de visión presente pero sin modificar durante el ajuste ("vision tower unchanged"). El punto de partida es un "soup": la media ponderada uniforme de los pesos de `Charlie320/zils-lite-v9a` (revision `93b06404`) y `qhoenix/zils-lite-decision-v9` (revision `083d5b9a`), ambos derivados a su vez de `vllm-sr/d3-lite` / Qwen/Qwen3.5-0.8B.

El entrenamiento sigue la receta de referencia `zils.d3 train`: LoRA de rango 16 sobre las capas de lenguaje, optimizador AdamW, tasa de aprendizaje 2e-5, una época y semilla 559. Los pesos liberados no son el fine-tune completo, sino una interpolación: `soup + 0.75 × (fine-tune − soup)`, es decir, tres cuartas partes del cambio entrenado, que según el autor puntuó mejor que el cambio completo. Todas las filas se entrenaron sobre probabilidades objetivo suaves (soft targets), no sobre etiquetas duras.

El conjunto de datos consta de 11.628 ejemplos de decisión sin solapamiento con el examen público ni con semillas públicas: 1.500 listados de producto sintéticos verificados contra cuatro requisitos, 1.500 pasajes con cuatro preguntas construidos desde el split de entrenamiento de SQuAD v2, 1.500 casos de conteo por reglas léxicas sobre poem_sentiment, tweet_eval y emotion, 2.090 casos de uso de herramientas derivados de Salesforce/xlam-function-calling-60k, 3.580 casos de "ensayo" (rehearsal) con auto-destilación desde el propio soup, y 1.458 casos de CommonsenseQA, glaive-function-calling-v2, CLINC150 y TweetEval con objetivos mixtos (mitad probabilidad del soup, mitad etiqueta).

## Capacidades

- Decisión estructurada calibrada: produce probabilidades sobre opciones discretas (contar requisitos cumplidos, decidir invocación de herramienta).
- Conteo de requisitos satisfechos en listados de producto (0 a 4).
- Conteo de subpreguntas respondidas por un pasaje (comprensión lectora orientada a decisión).
- Conteo por reglas léxicas sobre líneas y publicaciones (sentimiento, emoción).
- Uso de herramientas (tool calling): decidir si llamar ahora, contar argumentos obligatorios ausentes y elegir entre llamar, preguntar o declinar.
- Clasificación de intención, tema, paráfrasis y similitud (heredado de los casos de ensayo).
- Razonamiento de sentido común y aritmética básica (capacidades de ensayo, no objetivo principal).
- Torre de visión presente en los pesos, aunque no fue entrenada en este ajuste.
- No se documenta modo "thinking", soporte de audio ni capacidades multilingües explícitas.

## Casos de uso

- Enrutamiento de agentes con umbrales de confianza: el modelo emite probabilidades calibradas sobre si invocar una herramienta, preguntar al usuario o declinar; un orquestador puede fijar umbrales sobre esas probabilidades en lugar de parsear texto libre.
- Validación de argumentos en pipelines de function calling: dado un esquema de herramienta y una llamada propuesta, cuenta los argumentos obligatorios ausentes antes de ejecutar, evitando errores en producción.
- Verificación de requisitos en comercio electrónico: comprobar automáticamente cuántos de N requisitos del comprador cumple un listado de producto, útil en motores de recomendación o control de calidad de catálogo.
- Puntuación de cobertura documental: medir cuántas subpreguntas de un cuestionario responde un pasaje, para seleccionar fragmentos en sistemas RAG antes de generar la respuesta final.
- Moderación y triaje de contenido: clasificación léxica de sentimiento y emoción sobre publicaciones, con salida probabilística agregable.
- Clasificación de intención en asistentes conversacionales: etiquetar la intención del turno (dominio CLINC150) para dirigir la conversación al flujo adecuado.
- Filtro previo de bajo coste: al tener ~853 M de parámetros, puede desplegarse como primera etapa que descarte o derive casos a un modelo mayor, reduciendo coste por consulta.

## Benchmarks y rendimiento

Evaluación según la métrica `calibrated_brier` del pool: una temperatura por modelo ajustada sobre el 20 % de los ítems, Brier o skill de probabilidad clasificada sobre el resto, familias ponderadas según los pesos de categoría del examen, sobre 714 casos semilla públicos (`zils-ai/base-exam-seed-v1..v3`), promediado sobre 30 particiones de calibración.

| Modelo | Puntuacion (puntos) | Precision top-1 |
|---|---|---|
| Soup base (zils-lite-v9a + zils-lite-decision-v9) | 64,1 | 77,0 % |
| zils-lite-body (este modelo) | 65,4 | 78,7 % |

Estas cifras son medidas de desarrollo del autor, no resultados de validadores de la red. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 1,7 GB solo para pesos (853 M × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 8,5 GB, probablemente por revisiones u otros artefactos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, así como en GPUs de datacenter (A100, H100) sin necesidad de paralelismo.
- Posible ejecución en CPU con cuantización (GGUF), aunque el autor no publica versiones cuantizadas; habría que convertir los pesos.
- Despliegue: al usar `custom_code` y estar orientado a vLLM (base `vllm-sr/d3-lite`), vLLM es la opción natural; también TGI o transformers con `trust_remote_code=True`. llama.cpp/Ollama requerirían conversión manual a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-body | ~853 M | No disponible | Decision calibrada (soup + LoRA) | Apache-2.0 | Hugging Face (286 descargas) |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | LLM generalista base | No disponible | Hugging Face |
| Charlie320/zils-lite-v9a | No disponible | No disponible | Decision (componente del soup) | No disponible | Hugging Face |
| qhoenix/zils-lite-decision-v9 | No disponible | No disponible | Decision (componente del soup) | No disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje y licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: su objetivo son decisiones discretas calibradas, no la generación de texto abierta; su uso como LLM conversacional general dará resultados pobres.
- Las métricas publicadas (65,4 puntos, 78,7 % top-1) son medidas de desarrollo del autor sobre 714 casos semilla, no validación independiente ni resultados de validadores de Bittensor.
- Riesgo de sobreajuste al formato del examen del pool: el entrenamiento usa el formato del "soup exam", lo que puede limitar la generalización fuera de ese esquema.
- La interpolación `soup + 0,75 × cambio` se eligió por puntuación en desarrollo; no hay garantía de que generalice a distribuciones distintas.
- Sesgos: no documentados por el autor; los datos de entrenamiento incluyen tweet_eval, emotion y poem_sentiment, con los sesgos propios de esas fuentes.
- Idiomas: no declarados; el autor solo indica "language weights trained", sin lista de idiomas, por lo que el soporte multilingüe es incierto.
- Longitud de contexto: no documentada; no debe asumirse la del Qwen3.5-0.8B base sin verificación.
- Licencia Apache-2.0 permite uso comercial, pero los datos derivados (xlam-function-calling-60k CC-BY-4.0, SQuAD v2 CC-BY-SA-4.0, poem_sentiment CC-BY-4.0) imponen obligaciones de atribución; el repositorio solo contiene pesos, por lo que conviene revisar los términos de las fuentes antes de reutilizar.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de desplegar en producción.
- Sin likes ni pipeline declarado y con solo 286 descargas: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YY029/zils-lite-body
- Modelo base 1: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base 2: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Modelo base 3 (Qwen3.5-0.8B): https://huggingface.co/Qwen/Qwen3.5-0.8B
- Base de la familia d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Dataset SQuAD v2: https://huggingface.co/datasets/rajpurkar/squad_v2
- Dataset poem_sentiment: https://huggingface.co/datasets/google-research-datasets/poem_sentiment
- Dataset tweet_eval: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Dataset emotion: https://huggingface.co/datasets/dair-ai/emotion
- Dataset xlam-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
