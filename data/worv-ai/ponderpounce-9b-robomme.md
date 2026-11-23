# worv-ai/PonderPounce-9B-RoboMME

## Resumen

PonderPounce-9B-RoboMME es un checkpoint de investigación publicado por worv-ai para el benchmark RoboMME, dentro del trabajo "PonderPounce: A Pretrained MLLM as an Episode Context Engine for Robot Control" (arXiv:2608.24115). Se trata de un modelo vision-language-action (VLA) de arquitectura dual que combina un motor de contexto episódico basado en un MLLM preentrenado con un experto de acciones de flujo de coincidencia, orientado a tareas robóticas que requieren memoria a lo largo de un episodio.

La propuesta separa el control en dos sistemas. El sistema "Ponder" (System 2) es Qwen3.5-9B, que mantiene en su contexto causal nativo la instrucción, la demostración de condicionamiento y las observaciones del episodio, y emite un token de cognición continuo más un subobjetivo textual en las transiciones de fase. El sistema "Pounce" (System 1) es pi0.5, compuesto por PaliGemma 3B y un experto de acciones de 300M parámetros con flow matching, que predice fragmentos de 20 pasos de ángulos articulares (1 segundo a 20 Hz).

El checkpoint corresponde a la escala de datos base del paper (1x RoboMME), evaluada en 16 tareas dependientes de memoria, y reporta un 60,83 % en RoboMME. Es relevante porque demuestra que un MLLM preentrenado puede actuar como memoria episódica explícita para políticas robóticas, en lugar de depender únicamente de la ventana de observación inmediata de la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA dual: Ponder (MLLM Qwen3.5-9B, System 2) + Pounce (pi0.5: PaliGemma 3B + experto de acciones de 300M con flow matching, System 1) |
| Parametros totales | 13.565.814.784 (13,57 mil millones, segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el MLLM base mantiene el contexto causal del episodio; no se especifica longitud numerica) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~27 GB) |

## Arquitectura y entrenamiento

La arquitectura es un sistema jerárquico de dos niveles. Ponder es un MLLM Qwen3.5-9B que conserva en su contexto causal la instrucción de la tarea, la demostración de condicionamiento y las observaciones del episodio; se consulta una vez por segundo y produce un token de cognición continuo, además de un subobjetivo textual anclado cuando detecta transiciones de fase. Pounce es pi0.5, formado por un backbone PaliGemma 3B y un experto de acciones de 300M parámetros entrenado con flow matching, que genera un chunk de 20 pasos de ángulos articulares (1 segundo a 20 Hz) a partir de la observación actual, la propiocepción, el texto de la tarea, la cognición más reciente y su antigüedad.

El entrenamiento se realizó de extremo a extremo sobre RoboMME (16 tareas dependientes de memoria), con 4320 pasos y batch global de 32, usando la escala de datos base del paper (1x RoboMME). El checkpoint publicado corresponde a la fila de 60,83 % en RoboMME; el modelo entrenado con 9x datos no forma parte de esta release. El servidor de inferencia reproduce el calendario de entrenamiento sobre un reloj simulado: Ponder cada 1 s, Pounce cada 1 s y cognición visible para Pounce 300 ms después de la consulta a Ponder.

## Capacidades

- Control robótico de extremo a extremo mediante predicción de chunks de 20 pasos de ángulos articulares a 20 Hz.
- Memoria episódica explícita: retiene instrucciones, demostraciones y observaciones pasadas del episodio en el contexto del MLLM.
- Razonamiento de fase: emite subobjetivos textuales anclados en transiciones de fase de la tarea.
- Percepción visual a través del backbone PaliGemma del sistema de acciones.
- Condicionamiento por demostración: incorpora una demostración de condicionamiento en el contexto de Ponder.
- Tareas dependientes de memoria, como recordar objetos resaltados brevemente y actuar sobre ellos después de que las marcas desaparezcan (episodio de ejemplo *PickHighlight*).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso de agentes conversacionales.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Manipulación con memoria a corto plazo: el modelo puede recordar objetos señalados de forma transitoria (por ejemplo, cubos resaltados al inicio del episodio) y actuar sobre ellos después, gracias al contexto episódico de Ponder.
- Tareas de ensamblaje por fases: los subobjetivos textuales en transiciones de fase permiten encadenar subtareas dependientes de estado previo, adecuado para secuencias de montaje con varios pasos.
- Políticas condicionadas por demostración: la incorporación de una demostración en el contexto de Ponder permite adaptar el comportamiento a una referencia concreta sin reentrenamiento, útil en entornos de investigación con variabilidad de tareas.
- Investigación en VLA jerárquicos: sirve como referencia reproducible para comparar arquitecturas de dos sistemas (cognición lenta y acción rápida) en benchmarks de manipulación.
- Evaluación de memoria episódica en robótica: el checkpoint está pensado para ejecutar RoboMME-16 con 50 episodios por tarea, lo que lo hace adecuado como baseline en estudios de memoria de políticas.
- Prototipado en simulación: el servidor de inferencia con reloj simulado permite reproducir el calendario de entrenamiento y validar pipelines de evaluación antes de trasladar el sistema a hardware real.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| RoboMME (16 tareas) | 60,83 % | Escala de datos 1x RoboMME; fila reportada en el paper |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 32 GB libres en una sola GPU, segun la model card (los dos sistemas se ejecutan secuencialmente en la misma GPU).
- Pesos en bfloat16: ~27 GB, lo que exige GPUs de 40 GB o más para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, o GPUs de 48 GB en adelante; no se documenta soporte para GPUs de consumo de 24 GB.
- No cabe en GPUs de consumo habituales (RTX 4090 de 24 GB) en bfloat16 sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: servidor propio del repositorio (`ponderpounce.eval.robomme_server`) y cliente de evaluación `vla-eval`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el calendario de control es de 1 s para Ponder y 1 s para Pounce, con 300 ms de latencia de cognición simulada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PonderPounce-9B-RoboMME | 13,57 mil millones | no disponible | VLA dual (MLLM + flow matching) | Apache 2.0 | Hugging Face |
| pi0.5 (lerobot/pi05_base) | ~3,3 mil millones (PaliGemma 3B + 300M) | no disponible | VLA monolítico con flow matching | no disponible en la informacion | Hugging Face |
| Qwen3.5-9B | ~9 mil millones | no disponible | LLM/MLLM de propósito general | no disponible en la informacion | Hugging Face |

La comparación con otras políticas VLA de memoria episódica no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: entrenado solo con la escala base (1x RoboMME) y 4320 pasos; el modelo de 9x datos no se publica, por lo que el rendimiento reportado no representa el máximo del método.
- Evaluado exclusivamente en RoboMME (16 tareas); no hay evidencia publicada de generalización a otros entornos, robots o benchmarks.
- Dependencia del calendario de control: el servidor debe reproducir el reloj simulado (Ponder cada 1 s, Pounce cada 1 s, cognición con 300 ms de retraso); desviarse del calendario puede degradar el comportamiento.
- Requiere descargar los tokenizadores y procesadores de los backbones (`Qwen/Qwen3.5-9B`, `google/paligemma-3b-pt-224`) desde el Hub en el primer uso, lo que introduce dependencias externas.
- Riesgo de alucinación en los subobjetivos textuales generados por Ponder: no se documentan mecanismos de verificación de dichos textos.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se documenta comportamiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación no se documentan garantías de robustez en producción.
- No se publican pesos cuantizados ni soporte para frameworks de serving estándar, lo que limita el despliegue fuera del servidor propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/worv-ai/PonderPounce-9B-RoboMME
- Paper: https://arxiv.org/abs/2608.24115
- Página del proyecto: https://worv-ai.github.io/ponderpounce/
- Repositorio de código: https://github.com/worv-ai/PonderPounce
- Modelo base MLLM: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base de acciones: https://huggingface.co/lerobot/pi05_base
- Backbone visual: https://huggingface.co/google/paligemma-3b-pt-224
