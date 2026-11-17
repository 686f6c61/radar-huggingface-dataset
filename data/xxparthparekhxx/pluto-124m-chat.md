# xxparthparekhxx/pluto-124m-chat

## Resumen

Pluto 124M Chat es un modelo de lenguaje conversacional de 121 millones de parámetros entrenado desde cero por el desarrollador independiente xxparthparekhxx. Se trata de un transformer decoder-only de escala reducida, preentrenado sobre 4.350 millones de tokens del corpus FineWeb-Edu y posteriormente ajustado para conversación en dos etapas, todo ello en una única GPU de portátil RTX 5060 con 8 GB de VRAM. El resultado es un modelo pequeño que cabe en hardware de consumo y que puede ejecutarse incluso en el navegador mediante una exportación ONNX en fp16 con WebGPU o WebAssembly.

El modelo aborda el problema del acceso a asistentes conversacionales en entornos con recursos muy limitados, priorizando la ligereza y la ejecución local sobre el conocimiento factual. Es relevante ahora por su transparencia metodológica (entrenamiento reproducible en hardware asequible), su licencia permisiva Apache 2.0 y su comparación explícita con GPT-2 124M y SmolLM2-135M-Instruct en tareas estandarizadas como IFEval, HellaSwag o ARC.

La arquitectura no es una clase estándar de `transformers`: incorpora atención con compuertas, QK-norm y un soft-cap sobre los logits, distribuida con código propio (`modeling_pluto.py`), lo que exige `trust_remote_code=True` para su uso. La versión 2 del modelo añade conjuntos de instrucciones y multi-turno respecto a la versión 1, que solo se preentrenó con 1.000 millones de tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención con compuertas, QK-norm y logit soft-cap (código propio) |
| Parámetros totales | 121.229.568 (121M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (exportación ONNX); otras no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp16 con KV cache explícita) |

## Arquitectura y entrenamiento

Pluto es un transformer decoder-only de 121M de parámetros entrenado desde cero. La arquitectura incorpora atención con compuertas, normalización QK y un soft-cap sobre los logits, innovaciones que no forman parte de las clases estándar de `transformers` y que se distribuyen en el fichero `modeling_pluto.py` del repositorio. El preentrenamiento se realizó sobre 4.350 millones de tokens del dataset FineWeb-Edu. Posteriormente se aplicó un ajuste fino conversacional en dos etapas, empleando el conjunto HuggingFaceTB/smol-smoltalk junto con un conjunto de instrucciones y otro multi-turno destilado. Todo el proceso de entrenamiento se llevó a cabo en una única RTX 5060 Laptop con 8 GB de VRAM.

La versión 2 del modelo añade respecto a la versión 1 (1.000 millones de tokens de preentrenamiento, sin instrucciones ni multi-turno) un conjunto específico de seguimiento de instrucciones y otro multi-turno. Según la model card, este conjunto de instrucciones es responsable de la mejora en IFEval, mientras que su coste en conversación ordinaria es despreciable (puntuación de 0,46 con intervalo de confianza del 95% de 0,42–0,50 en la comparación juez contra el mismo modelo sin esos conjuntos). No se especifica si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés: responde preguntas simples y mantiene conversaciones multi-turno cortas.
- Reescritura y resumen de texto.
- Seguimiento de instrucciones de formato, como "usa exactamente tres puntos" o restricciones verificables automáticamente.
- Soporte de plantilla de chat con roles `<|user|>`, `<|assistant|>` y `<|system|>`, delimitados por `<|end|>`.
- Decodificación greedy recomendada para obtener las respuestas más fiables.
- Exportación ONNX fp16 con KV cache explícita para inferencia en navegador (WebGPU o WebAssembly).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: el modelo cabe en 8 GB de VRAM y puede ejecutarse en portátiles con GPU de consumo, lo que permite desplegar un chatbot sin conexión ni servidor.
- Demostraciones en navegador: la exportación ONNX fp16 con KV cache permite ejecutar el modelo íntegramente en el cliente mediante WebGPU o WebAssembly, útil para demos interactivas sin coste de inferencia en servidor.
- Reescritura y resumen de textos cortos: adecuado para tareas de transformación de texto donde la precisión factual no es crítica, como reformular párrafos o condensar notas.
- Seguimiento de instrucciones de formato en pipelines ligeros: puede generar respuestas con restricciones verificables (número de viñetas, ausencia de comas, salida en JSON) para prototipos de extracción estructurada.
- Educación y experimentación en entrenamiento de LLM: al ser un modelo entrenado desde cero en una sola GPU de portátil, sirve como caso de estudio reproducible para investigadores que quieran replicar el pipeline completo con FineWeb-Edu y smol-smoltalk.
- Prototipado rápido de interfaces conversacionales: su plantilla de chat con roles de sistema, usuario y asistente facilita integrarlo en aplicaciones de chat de bajo coste antes de migrar a modelos mayores.
- Filtrado o clasificación conversacional de bajo volumen: para tareas donde la latencia y el coste importan más que la exactitud factual, como generar respuestas plantilla o clasificar consultas simples.

## Benchmarks y rendimiento

Evaluación de seguimiento de instrucciones con IFEval (541 prompts, lm-evaluation-harness 0.4.13, greedy, hasta 512 tokens nuevos):

| Modelo | Prompts con todas las reglas (estricto) | Reglas cumplidas (estricto) | Prompts (laxo) | Reglas (laxo) |
|---|---|---|---|---|
| Pluto chat v2 | 24,2 | 36,8 | 26,1 | 39,0 |
| Pluto chat v1 | 19,4 | 30,8 | 20,1 | 32,3 |
| SmolLM2-135M-Instruct | 21,3 | 34,4 | 23,7 | 37,3 |

El error estándar en las puntuaciones a nivel de prompt es de aproximadamente ±1,8 puntos.

Comparación con GPT-2 124M (lm-evaluation-harness 0.4.13, zero-shot, fp32):

| Tarea (métrica) | Pluto chat v2 | Pluto base v2 | GPT-2 124M | Pluto chat v1 |
|---|---|---|---|---|
| HellaSwag (acc_norm) | 34,2 | 33,9 | 31,1 | 31,1 |
| ARC-Easy (acc_norm) | 44,6 | 47,6 | 39,5 | 41,9 |
| ARC-Challenge (acc_norm) | 26,5 | 27,0 | 22,7 | 26,7 |
| OpenBookQA (acc_norm) | 30,6 | 30,4 | 27,2 | 27,2 |
| PIQA (acc_norm) | 62,4 | 63,4 | 62,5 | 59,1 |
| Winogrande (acc) | 51,9 | 52,3 | 51,6 | 51,7 |
| LAMBADA (acc) | 20,6 | 28,1 | 32,6 | 16,8 |

Los errores estándar son de aproximadamente ±0,5 puntos en HellaSwag y LAMBADA, ±1 a 1,5 en ARC, PIQA y Winogrande, y ±2 en OpenBookQA.

Evaluación con juez (250 prompts retenidos, respuestas greedy, comparación por pares con Gemini 3.5 Flash-Lite o Gemini 3.1 Flash-Lite, dos órdenes por prompt):

| Comparación | Victorias | Empates | Derrotas | Puntuación (IC 95%) |
|---|---|---|---|---|
| Pluto chat v2 vs. mismo modelo sin conjuntos de instrucciones y multi-turno | 46 | 139 | 65 | 0,46 (0,42–0,50) |

Datos de validación sobre conjuntos retenidos: Pluto chat v1 mantiene el 46,8% de las reglas de formato en 77 prompts retenidos del subconjunto de restricciones de smol-smoltalk, y responde correctamente 8 de 8 preguntas de identidad. No se han publicado resultados de benchmarks de la versión v2 en la información disponible para estas métricas de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 121M de parámetros; en fp16 ocupa aproximadamente 0,25 GB de pesos, y en fp32 unos 0,5 GB. El repositorio completo pesa 1,2 GB por incluir safetensors y la exportación ONNX.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; el entrenamiento se realizó en una RTX 5060 Laptop con 8 GB.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU mediante llama.cpp u ONNX Runtime.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, ONNX Runtime (WebGPU o WebAssembly para navegador), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval (estricto, prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pluto 124M Chat v2 | 121M | no disponible | 24,2 | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct | 135M | no disponible | 21,3 | no disponible en la información | Hugging Face |
| GPT-2 124M | 124M | 1.024 tokens (estándar) | no evaluado en IFEval | MIT (según información pública) | Hugging Face |

Pluto supera a SmolLM2-135M-Instruct en IFEval estricto pese a haberse preentrenado con aproximadamente 460 veces menos tokens (4.350 millones frente a unos 2 billones). Frente a GPT-2 124M, Pluto chat v2 obtiene mejores resultados en HellaSwag, ARC-Easy, ARC-Challenge y OpenBookQA, pero peor en LAMBADA (20,6 frente a 32,6).

## Limitaciones y advertencias

- Tamaño muy reducido: con 121M de parámetros, el modelo comete errores factuales con frecuencia; la propia model card advierte de que hay que verificar cualquier dato que proporcione.
- Riesgo elevado de alucinación en preguntas de conocimiento del mundo.
- Solo soporta inglés; no hay capacidades multilingües confirmadas.
- Longitud de contexto no especificada, lo que dificulta planificar su uso en tareas de contexto largo.
- Requiere `trust_remote_code=True` tanto en el tokenizador como en el modelo, lo que implica ejecutar código del autor; conviene auditar `modeling_pluto.py` antes de desplegarlo en producción.
- La decodificación greedy es la más fiable; la configuración por defecto muestrea con temperatura 0,8 y top-k 50, lo que puede degradar la calidad de las respuestas.
- No dispone de tool calling, function calling ni capacidades de agente, lo que limita su integración en pipelines automatizados complejos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo entrenado con FineWeb-Edu y smol-smoltalk conviene revisar las condiciones de esos datasets.
- La evaluación es limitada: no hay benchmarks publicados de la versión v2 en las métricas de validación retenida, y la comparación con SmolLM2-135M-Instruct en el juicio por pares aún no está disponible.
- El modelo se entrenó en una única GPU de consumo, lo que sugiere un presupuesto de cómputo muy limitado y posibles carencias en diversidad de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxparthparekhxx/pluto-124m-chat
- Modelo base: https://huggingface.co/xxparthparekhxx/pluto-124m-base
- Demo en navegador (Space): https://huggingface.co/spaces/xxparthparekhxx/pluto-chat
- Revisión v1: https://huggingface.co/xxparthparekhxx/pluto-124m-chat/tree/v1
- Perfil del autor en GitHub: https://github.com/xxparthparekhxx
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de ajuste conversacional: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Paper de IFEval: https://arxiv.org/abs/2311.07911
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- GPT-2 124M: https://huggingface.co/openai-community/gpt2
