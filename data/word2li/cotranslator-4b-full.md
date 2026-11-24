# Word2Li/CoTranslator-4B-Full

## Resumen

CoTranslator-4B-Full es un modelo de traducción de trayectorias de razonamiento desarrollado por Word2Li, presentado en el artículo "CoTranslator: Reverse to Forward Chain-of-Thought Translator for Reasoning Distillation" (arXiv:2610.20828). Se trata de un ajuste fino supervisado de parámetros completos sobre Qwen/Qwen3-4B-Thinking-2507, con 4.022.468.096 parámetros almacenados en BF16. Su función no es resolver problemas directamente, sino convertir trayectorias de cadena de pensamiento inversas (generadas por un profesor con acceso a la respuesta de referencia) en trayectorias que se asemejan a soluciones directas verificadas, para así generar datos de supervisión de alta calidad para modelos estudiantes.

El modelo aborda un problema concreto de la destilación de razonamiento: los profesores que ven la respuesta producen trayectorias poco naturales que no reflejan cómo razonaría un modelo sin acceso a ella. CoTranslator aprende a reescribir esas trayectorias preservando la conclusión matemática y el formato de respuesta, lo que permite escalar la construcción de datasets de entrenamiento para estudiantes. La variante "Full" se entrena sobre el dataset completo de pares (266.288 filas en el JSONL de origen) y complementa al checkpoint CoTranslator-4B.

Es relevante ahora por su enfoque específico en la calidad de los datos de razonamiento, un cuello de botella habitual en la destilación de modelos pequeños de matemáticas. Su licencia Apache-2.0 y su compatibilidad con Transformers y text-generation-inference facilitan su integración en pipelines de generación de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tuning supervisado de parámetros completos |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (longitud de secuencia de entrenamiento); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, dos shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Thinking-2507, un transformer decoder-only de 4.000 millones de parámetros con modo de pensamiento. Sobre él se aplica un ajuste fino supervisado de parámetros completos (no LoRA) con el framework Megatron-Swift: 3 épocas, learning rate 5e-5 con schedule coseno y warmup del 10 %, weight decay 0,1, batch global 32 y micro-batch 2, longitud de secuencia de 65.536 tokens con packing activado, precisión BF16, betas de Adam 0,9/0,95, gradient clipping 1,0 y semilla 42. El checkpoint liberado corresponde al paso 4.921 y usa la plantilla de chat `qwen3_thinking`.

La tarea de entrenamiento consiste en pares (trayectoria inversa del profesor, respuesta directa verificada del dataset Nemotron). El profesor genera una trayectoria inversa con acceso a la respuesta de referencia mediante un prompt de supresión semántica; el traductor recibe esa trayectoria (razonamiento y respuesta final) y debe producir la respuesta directa correspondiente, aceptada por verificación de respuesta. Los ejemplos que superan los 65.536 tokens se descartan en el preprocesamiento. No se documenta en la información disponible el uso de RLHF o DPO; el entrenamiento es exclusivamente SFT.

## Capacidades

- Traducción de trayectorias de razonamiento: convierte cadenas de pensamiento inversas (condicionadas por la respuesta) en trayectorias con forma de solución directa verificada.
- Preservación de la conclusión matemática y del formato de respuesta durante la reescritura.
- Razonamiento matemático y generación de cadenas de pensamiento en modo thinking (heredado de Qwen3-4B-Thinking-2507).
- Generación de texto conversacional con plantilla de chat `qwen3_thinking`.
- Generación de hasta 32.768 tokens por salida en la configuración de inferencia del artículo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Construcción de datasets de destilación: el modelo traduce a escala trayectorias inversas generadas por un profesor para producir pares de entrenamiento verificados destinados a modelos estudiantes de matemáticas.
- Mejora de la naturalidad de soluciones sintéticas: se le pasan trayectorias con acceso a la respuesta y devuelve razonamientos con estructura de solución directa, útiles para SFT de modelos pequeños.
- Filtrado y refinado de datos de razonamiento: integrado en un pipeline previo al entrenamiento, permite descartar o reescribir trayectorias que no superan la verificación de respuesta.
- Investigación en destilación de CoT: sirve como componente reproducible para estudiar cómo la forma de la trayectoria afecta al aprendizaje del estudiante.
- Generación de datos para dominios STEM con respuesta verificable: adecuado cuando existe una respuesta de referencia y se necesita supervisión de alta calidad sin intervención humana.
- Reproducción de experimentos del artículo: el checkpoint "Full" permite replicar la configuración del manuscrito con los mismos hiperparámetros de inferencia (temperatura 0,6, top-p 0,95, top-k 20, min-p 0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más memoria para el contexto; con 65.536 tokens de contexto y caché KV el consumo crece de forma significativa.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto largo y throughput alto; RTX 4090 (24 GB) viable para secuencias moderadas en BF16.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 24 GB o más para contextos moderados; en cuantización de 8 bits o inferior cabría en GPUs de 12-16 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: Transformers (versión reciente; la configuración se guardó con Transformers 5.12.1), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoTranslator-4B-Full | 4.022.468.096 | 65.536 (entrenamiento) | Traducción de trayectorias CoT | Apache-2.0 | Hugging Face |
| CoTranslator-4B | No disponible | No disponible | Traducción de trayectorias CoT | No disponible | Hugging Face |
| Qwen3-4B-Thinking-2507 (base) | ~4.000 millones | No disponible | Razonamiento general y matemáticas | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no está pensado como asistente general, sino como traductor de trayectorias; su uso fuera de esa tarea no está validado.
- Solo inglés: la model card declara únicamente el idioma inglés.
- Riesgo de alucinación: al ser un modelo generativo puede alterar detalles del razonamiento; el artículo mitiga esto con verificación de respuesta, pero no se garantiza corrección en todos los casos.
- Dependencia de la verificación: la calidad del dato generado depende del filtro de verificación de respuesta del pipeline.
- Contexto de entrenamiento limitado a 65.536 tokens: los ejemplos más largos se descartan, lo que puede sesgar el dataset hacia problemas de menor longitud.
- Licencia Apache-2.0 permite uso comercial, pero la atribución y las licencias específicas de los datos de entrenamiento se remiten a la model card del dataset de pares.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Requiere una versión reciente de Transformers (5.12.1 para la configuración guardada), lo que puede complicar despliegues con stacks antiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Word2Li/CoTranslator-4B-Full
- Checkpoint complementario: https://huggingface.co/Word2Li/CoTranslator-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Dataset de pares: https://huggingface.co/datasets/Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs
- Artículo: https://arxiv.org/abs/2610.20828
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
