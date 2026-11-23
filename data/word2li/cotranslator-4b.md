# Word2Li/CoTranslator-4B

## Resumen

CoTranslator-4B es un modelo de traducción de trayectorias de razonamiento desarrollado por Word2Li, presentado en el artículo "CoTranslator: Reverse to Forward Chain-of-Thought Translator for Reasoning Distillation" (arXiv:2610.20828). Se trata de un ajuste fino supervisado de parámetros completos sobre Qwen/Qwen3-4B-Thinking-2507, con 4.022.468.096 parámetros almacenados en BF16. Su función no es resolver problemas directamente, sino reescribir trayectorias de chain-of-thought generadas por un profesor con acceso a la respuesta (reverse CoT) para convertirlas en trayectorias que se asemejen a soluciones forward verificadas.

El modelo resuelve un problema concreto de los pipelines de destilación de razonamiento: los profesores generan trazas "reverse" condicionadas por la respuesta de referencia, que resultan poco naturales como supervisión para modelos estudiantes. CoTranslator transforma esas trazas a escala para construir datos de entrenamiento de estudiantes con formato de solución forward verificada. La relevancia actual radica en que permite reciclar grandes volúmenes de trayectorias reverse en supervisión de mayor calidad sin necesidad de regenerar desde cero con el profesor.

El checkpoint se entrena sobre el subconjunto `subset_1_8` del dataset Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs (33.286 filas JSONL antes del preprocesado), con 3 épocas, longitud de secuencia de 65.536 tokens, packing activado y precisión BF16. La licencia es Apache-2.0, heredada del modelo base, y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino supervisado de parámetros completos |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (longitud de secuencia de entrenamiento); contexto nativo del base no especificado en la información disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, dos shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Thinking-2507, un transformer decoder-only con modo de razonamiento (thinking). Sobre él se aplica un ajuste fino supervisado de parámetros completos con Megatron-Swift, 3 épocas, learning rate 5e-5 con schedule coseno y warmup del 10 %, weight decay 0,1, batch global 32 y micro-batch 2, Adam con beta1 0,9 y beta2 0,95, gradient clipping 1,0 y semilla 42. La secuencia de entrenamiento es de 65.536 tokens con packing activado y precisión BF16; los ejemplos que exceden ese límite se descartan en el preprocesado. El checkpoint publicado corresponde al paso 616 y usa la plantilla de chat `qwen3_thinking`.

La innovación técnica es la tarea de traducción en sí: el profesor genera una trayectoria reverse con acceso a la respuesta de referencia mediante un prompt de supresión semántica; el traductor recibe esa trayectoria (razonamiento y respuesta final) y debe producir la respuesta forward correspondiente al enunciado, aceptada por verificación de respuesta. El entrenamiento se apoya en pares reverse/forward del dataset Nemotron SFT Math v4. En inferencia, la entrada es una instrucción de sistema ("You are a reasoning trajectory refiner...") más un mensaje de usuario con la trayectoria en formato `<think>{{reasoning_content}}</think>{{content}}`. La decodificación recomendada por el autor es temperature 0,6, top-p 0,95, top-k 20, min-p 0 y hasta 32.768 tokens generados.

## Capacidades

- Reescritura de trayectorias de razonamiento: convierte reverse CoT (condicionado por respuesta) en trayectorias con forma de solución forward verificada.
- Razonamiento matemático: el entrenamiento se basa en el dataset Nemotron SFT Math v4, orientado a problemas matemáticos.
- Modo thinking: genera razonamiento explícito dentro de etiquetas `<think>`, con la plantilla `qwen3_thinking`.
- Generación de texto conversacional en formato chat multi-turno (pipeline text-generation).
- Preservación de conclusión y formato de respuesta, según la instrucción de sistema del traductor.
- Producción de datos de supervisión a escala para destilación de estudiantes.
- Capacidades heredadas del base Qwen3-4B-Thinking-2507 no verificadas específicamente en este checkpoint (no disponible).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes multi-paso: no documentado; el uso previsto es traducción de trayectorias, no ejecución de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Construcción de datasets de destilación: se alimenta cada trayectoria reverse del profesor al traductor y se obtienen trayectorias forward que sirven como supervisión para modelos estudiantes, evitando regenerar con el profesor a coste elevado.
- Limpieza de trazas de razonamiento existentes: dado un corpus de soluciones con acceso a respuesta (por ejemplo, generadas con answer-conditioning), el modelo las reescribe a un formato natural y verificable antes de incorporarlas a un SFT.
- Aumento de datos matemáticos: a partir de pares reverse/forward del dataset Nemotron, se generan variantes traducidas que amplían la diversidad de trayectorias de entrenamiento.
- Pipeline de destilación a escala: integrado con vLLM o TGI (el modelo declara `text-generation-inference` y `endpoints_compatible`), permite procesar lotes grandes de trayectorias con la configuración de muestreo recomendada (temperatura 0,6, top-p 0,95, top-k 20).
- Investigación en destilación de CoT: útil para reproducir y extender el método del artículo, comparando la calidad de estudiantes entrenados con trayectorias traducidas frente a trayectorias reverse originales.
- Filtrado y normalización de razonamientos en evaluación: se puede usar para homogeneizar el formato de trayectorias antes de comparar modelos o medir consistencia entre soluciones reverse y forward.
- Generación de material didáctico de matemáticas: las trayectorias traducidas a formato forward pueden servir como explicaciones paso a paso revisables por humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos (4.022 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto largo (hasta 65.536 tokens de entrada y 32.768 de salida) el consumo crece de forma significativa.
- Cuantización a 8 bits: alrededor de 4 GB de pesos; a 4 bits, alrededor de 2-2,5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y contexto máximo; RTX 4090 (24 GB) viable en BF16 con contexto moderado o en cuantización para contexto largo.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, en cuantización 4 bits, en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080, con limitaciones de contexto.
- Despliegue: transformers (versión reciente; el checkpoint se guardó con Transformers 5.12.1), accelerate, vLLM, TGI y endpoints compatibles; llama.cpp/Ollama no documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente de la longitud de las trayectorias generadas (hasta 32.768 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoTranslator-4B | 4.022 M | 65.536 (entrenamiento) | Traducción reverse→forward CoT | Apache-2.0 | Hugging Face |
| CoTranslator-4B-Full | No disponible | No disponible | Traducción reverse→forward CoT (variante completa) | Apache-2.0 (presumible, no confirmado) | Hugging Face |
| Qwen/Qwen3-4B-Thinking-2507 | 4.000 M aprox. | No disponible en la información | Razonamiento general y matemáticas | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no está pensado como asistente general; su uso previsto es la traducción de trayectorias, y su rendimiento fuera de esa tarea no está documentado.
- Idioma: solo se declara inglés; el uso en castellano no está validado.
- Riesgo de alucinación: al reescribir trayectorias puede alterar pasos intermedios o introducir razonamientos no presentes en la trayectoria original, aunque la instrucción exige preservar la conclusión y el formato.
- Dependencia del formato de entrada: requiere la instrucción de sistema y el formato `<think>...</think>` exactos; entradas mal formateadas degradan la calidad de la traducción.
- Longitud: los ejemplos que superan 65.536 tokens se descartan en el preprocesado, y la generación recomendada se limita a 32.768 tokens; trayectorias más largas pueden truncarse.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar del base Qwen3, puede arrastrar sesgos de sus datos de entrenamiento.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la atribución de los datos de entrenamiento y las licencias específicas de las fuentes se remiten a la model card del dataset emparejado.
- Producción: no hay benchmarks publicados ni métricas de latencia/throughput; conviene validar la calidad de las traducciones con verificación de respuesta antes de usarlas como supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Word2Li/CoTranslator-4B
- Variante completa: https://huggingface.co/Word2Li/CoTranslator-4B-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Dataset de pares: https://huggingface.co/datasets/Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs
- Artículo: https://arxiv.org/abs/2610.20828
- Licencia del base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
