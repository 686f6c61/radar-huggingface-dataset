# YellowPlus/AirDecision-4B-v1.2

## Resumen

AirDecision-4B-v1.2 es un modelo de decisión estructurada desarrollado por YellowPlus, obtenido por ajuste fino supervisado de `unsloth/Qwen3.5-4B`. No es un modelo generativo al uso: su función es puntuar preguntas de tipo `choice` (elección entre opciones), `noul` (probabilidad binaria calibrada) y `score` (expectativa ordinal) en un único pase causal hacia delante, sin generar ningún token de salida (`output_tokens = 0`). Emplea la formulación de máscara `<decision>` de Intern-Decision y una torre de visión congelada heredada del modelo base.

La relevancia del modelo está en su enfoque de entrenamiento: 111.252 decisiones tipadas sobre las que 90.847 se supervisan con distribuciones completas de probabilidad (soft labels) en lugar de etiquetas one-hot, lo que produce una calibración nativa casi unitaria (temperatura post-hoc `T = 1.0278`) y un KL/Brier frente a soft-gold aproximadamente tres veces menor que las líneas base con etiquetas duras. Está pensado para cargas de trabajo de decisión de un solo pase y para evaluación reproducible en JevBench.

Con 4.539.265.536 parámetros y una ventana de contexto de 8.192 tokens, se distribuye con licencia Apache 2.0, pesos en safetensors y un runtime de inferencia offline sin dependencias (`inference.py`) más un servidor HTTP loopback compatible con TypeSafe (`serve.py`, `serve.sh`). La versión 1.2 sustituye a la 1.1 con datos adicionales de tipo O*NET, pares de frontera de rating y variantes de simetría multi-forma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con torre de visión congelada) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada (truncación prohibida; entradas mayores devuelven HTTP 422 antes de tocar CUDA) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Protocolo de decisión | Intern-Decision, prefill causal único sobre esqueleto `<decision>` enmascarado |
| Precisión / atención | bfloat16, PyTorch `sdpa` (transformers nativo, sin runtime XTuner) |
| Opciones máximas por pregunta | 62 símbolos de un solo token (A–Z, a–z, 0–9) |
| Preguntas máximas por petición | 16 |
| Tokens de salida | 0 (sin muestreo; determinista) |
| Calibración | Escalado de temperatura post-hoc `T = 1.0277606955606344` (en `calibration/calibration.json`) |
| Modelo base | `unsloth/Qwen3.5-4B` (commit `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636`) |
| Tamaño del repo | 9,1 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal con torre de visión, que se mantiene congelada durante el ajuste fino. Sobre esa base se aplica la formulación Intern-Decision (commit `565350244af860e1c276768cd80bdd9b8be93913`): el modelo realiza un único prefill causal sobre un esqueleto de asistente enmascarado con `<decision>` y emite directamente las puntuaciones de cada pregunta, sin decodificación autoregresiva. La inferencia corre en bfloat16 con atención `sdpa` nativa de transformers.

El entrenamiento se realizó desde cero sobre el modelo base con 72.283 ejemplos y 111.252 decisiones tipadas, de las cuales 90.847 se supervisaron con distribuciones completas de probabilidad objetivo mediante entropía cruzada soft (`-sum_i p_i log q_i` en las posiciones `<decision>`). Los datos añadidos en la versión 1.2 respecto a la 1.1 incluyen `onet-synth-v2` (1.936 filas / 5.688 decisiones, 596 documentos sintéticos de tipo workplace con especificación por documento y validación por dos pasadas de etiquetado ciego), `onet-boundary-pairs` (143 filas con pares que difieren en un único elemento de evidencia para mover un rating exactamente un nivel) y `symmetry-forms` (1.764 filas con cada pregunta sí/no en dos de cinco formas de negación o reformulación y objetivos permutados). Se aplicó una auditoría de descontaminación con puertas de coincidencia exacta, Jaccard de n-gramas y embeddings densos (`bge-m3`) contra una lista negra de 1.544.101 referencias, sin fugas detectadas en la auditoría de preentrenamiento de cada lote añadido. El modelo se seleccionó en el paso 800 de 814.

## Capacidades

- Puntuación de preguntas de elección (`choice`) entre 4 y 25 opciones (hasta 62 símbolos de un solo token) en un único pase causal.
- Puntuación de preguntas binarias (`noul`) como probabilidad calibrada mediante escalado de temperatura post-hoc.
- Puntuación de preguntas ordinales (`score`) como expectativa sobre la escala de rating.
- Procesamiento de hasta 16 preguntas por petición en una sola pasada.
- Entrada multimodal imagen-texto (hereda la torre de visión del modelo base, congelada durante el ajuste).
- Invariancia multi-forma: probabilidades estables ante negaciones, reformulaciones y permutaciones de opciones, entrenada explícitamente con `symmetry-forms`.
- Verificación de afirmaciones de tipo sí/no con ítems de media afirmación (el 60 % de los ítems "no" difieren del documento en un detalle preciso).
- Inferencia determinista sin generación de tokens (`output_tokens = 0`), apta para evaluación reproducible.
- Servidor HTTP loopback compatible con TypeSafe (`/v1/systemone`) con verificación de calibración SHA-256 en memoria y rechazo de frontera HTTP 422 antes de CUDA.
- Sin soporte documentado de tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- **Enrutamiento y clasificación de decisiones en producción**: el modelo puntúa preguntas de elección entre conjuntos de opciones grandes (hasta 62 símbolos) en un solo pase causal, lo que permite integrarlo como clasificador determinista en pipelines donde la latencia de decodificación autoregresiva es inaceptable.
- **Verificación de cumplimiento documental**: con ítems sí/no de media afirmación, puede comprobar si un documento cumple una política concreta detectando diferencias en un único detalle de evidencia, útil en auditorías automatizadas de contratos o informes.
- **Evaluación de rúbricas y ratings ordinales**: la formulación `score` como expectativa ordinal permite puntuar evidencias sobre escalas balanceadas, por ejemplo en evaluación de calidad de respuestas o de candidatos con rúbricas de varios niveles.
- **Calibración de confianza en sistemas de decisión**: gracias a su calibración nativa (`T = 1.0278`) y a un ECE de 0.149 en Typed Decision (test, soft-gold), es adecuado para sistemas que necesitan probabilidades fiables para umbrales de abstención o escalado humano.
- **Evaluación reproducible en contenedores aislados**: el runtime `inference.py` y el servidor `serve.py` funcionan en contenedores `--network none --read-only`, lo que facilita la reproducción de resultados de JevBench y la evaluación en entornos sin red.
- **Procesamiento de documentos de trabajo con imagen**: al conservar la torre de visión del modelo base, puede puntuar preguntas sobre documentos escaneados o capturas, útil en flujos de tipo workplace donde la evidencia llega como imagen.
- **Detección de cuándo invocar una herramienta**: los tags del modelo incluyen el dataset `nvidia/When2Call`, orientado a decidir si procede una llamada a herramienta; puede usarse como clasificador previo en un orquestador de agentes que decida si llamar o no a una API externa.

## Benchmarks y rendimiento

| Benchmark | v1.1 | v1.2 |
|---|---:|---:|
| Media de precisión en siete suites (splits públicos) | 91,11 | 91,38 |
| JevBench Hard (público, 111) | 83 | 86 |
| Precisión de selección en held-out | 0,7939 | 0,8057 |
| Typed Decision (test, soft-gold): accuracy | 0,799 | 0,7915 |
| Typed Decision (test, soft-gold): KL | 0,075 | 0,0791 |
| Typed Decision (test, soft-gold): Brier | 0,041 | 0,0432 |
| Typed Decision (test, soft-gold): ECE | 0,176 | 0,149 |
| Proxy de autotest del componente público de AA DI v2 (no es una puntuación AA) | 63,15 | 66,18 |
| Proxy de simetría de fraseo/orden (120 ítems, todas las formas dentro de 5 pp) | 63 | 77 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.539.265.536 parámetros en bfloat16, los pesos ocupan aproximadamente 9,1 GB, por lo que se necesita al menos esa cantidad más el espacio de activaciones y caché KV para 8.192 tokens.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más de VRAM (por ejemplo, RTX 4090, A100, H100) es el rango natural, pero el autor no documenta recomendaciones.
- Cabe en GPU de consumo: no confirmado por el autor; el tamaño de pesos en bfloat16 sugiere que una GPU de consumo con 16 GB o más podría alojarlo, sin datos oficiales.
- Opciones de despliegue: transformers nativo con `inference.py` (offline, sin dependencias), servidor loopback `serve.py`/`serve.sh` con endpoint `/v1/systemone`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el modelo realiza un único prefill causal sin tokens de salida, lo que elimina la latencia de decodificación, pero no se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirDecision-4B-v1.2 | 4,54 B | 8.192 | Decisión estructurada de un solo pase (Intern-Decision) | Apache 2.0 | Hugging Face (YellowPlus) |
| AirDecision-4B-v1.1 | no disponible | no disponible | Decisión estructurada, receta anterior | Apache 2.0 | Hugging Face (YellowPlus) |
| Qwen3.5-4B (base) | 4 B (aprox.) | no disponible | Modelo generativo multimodal | no disponible en la información | Hugging Face (unsloth) |

No se dispone de datos de benchmarks comparables con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión estructurada: no está diseñado para generación de texto libre, código, matemáticas ni razonamiento multi-paso; su salida son puntuaciones, no texto.
- Solo soporta inglés (`language: en`); no hay evidencia de capacidades multilingües.
- Contexto limitado a 8.192 tokens y truncación prohibida: entradas más largas se rechazan con HTTP 422, lo que exige trocear documentos largos antes de la inferencia.
- Límite de 62 opciones por pregunta y 16 preguntas por petición; cargas mayores requieren particionar.
- Riesgo de alucinación no evaluado explícitamente en la información disponible; al puntuar en lugar de generar, el modo de fallo es una puntuación mal calibrada, no texto inventado.
- Sesgos conocidos: no documentados en la información disponible; los datos sintéticos se derivan de O*NET-SOC, lo que puede introducir sesgos del dominio ocupacional estadounidense.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `unsloth/Qwen3.5-4B` tiene su propia licencia que debe verificarse por separado.
- El proxy de simetría (77 sobre 120 ítems) y el proxy de AA DI v2 (66,18) no son puntuaciones oficiales de benchmark; no deben presentarse como tales.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 2026-11-17; no hay validación comunitaria independiente.
- La torre de visión está congelada, por lo que las capacidades visuales no se han adaptado al dominio de decisión durante el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowPlus/AirDecision-4B-v1.2
- Versión anterior: https://huggingface.co/YellowPlus/AirDecision-4B-v1.1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio Intern-Decision: https://github.com/InternLM/Intern-Decision
- JevBench: https://benchmarkheaven.com
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset nvidia/When2Call: https://huggingface.co/datasets/nvidia/When2Call
