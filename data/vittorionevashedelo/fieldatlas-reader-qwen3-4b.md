# VittorioNevashedelo/fieldatlas-reader-qwen3-4b

## Resumen

Field Atlas reader — Qwen3-4B-Instruct-2507 + QLoRA es un ajuste fino mediante QLoRA del modelo denso Qwen3-4B-Instruct-2507, publicado por el usuario VittorioNevashedelo. Su propósito es muy concreto: actuar como lector extractivo en la aplicación Android Field Atlas, una app gratuita que responde preguntas de forma totalmente offline a partir de fuentes guardadas en el teléfono. El modelo recibe una pregunta junto con hasta 8 pasajes numerados y debe responder únicamente a partir de esos pasajes, citando la fuente de cada frase con su número (`[S2]`) y admitiendo explícitamente cuando la información no está en las fuentes con la frase "The saved sources don't say.".

La relevancia del modelo reside en su especialización extrema y en su eficiencia: con solo 4.000 millones de parámetros en formato denso y una cuantización Q4_K_M de 2,5 GB, está diseñado para ejecutarse en un teléfono de 6 GB de RAM mediante llama.cpp. En el conjunto de desarrollo de 60 preguntas obtiene un 81,7% de respuestas correctas, frente al 36,7% del modelo que usa actualmente la aplicación (Qwen3.5 2B) con el mismo script de evaluación. En el conjunto de validación retenido de 400 preguntas alcanza un 66,5%.

El modelo está entrenado exclusivamente en inglés, con licencia CC BY-SA 4.0 heredada del dataset de entrenamiento, y su uso previsto es la respuesta a preguntas con recuperación aumentada (RAG) en escenarios de consulta documental offline, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3-4B-Instruct-2507), ajustado con QLoRA |
| Parámetros totales | 4.000 millones (4,0B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de uso emplea `-c 8192` y se menciona funcionamiento cómodo con `-c 4096` |
| Tipos de cuantización | GGUF Q4_K_M (único archivo publicado: 2,5 GB); el entrenamiento usó QLoRA 4-bit |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY-SA 4.0 (pesos); modelo base Apache-2.0 |
| Formato de pesos | GGUF (`q3-4b-reader2-Q4_K_M.gguf`); adaptador LoRA entrenado y fusionado con `merge_lora.py` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parámetros con licencia Apache-2.0. Sobre esa base se aplicó un ajuste fino QLoRA en 4 bits con rango 32, alpha 32, 2 épocas, tasa de aprendizaje 2e-4, longitud máxima de secuencia de 1536 tokens y batch de 1 con acumulación de 16 pasos. El entrenamiento completo constó de 966 pasos, con una pérdida final de 0,238, ejecutado en una única GPU RTX 3060 de 12 GB.

La innovación técnica principal es el enmascaramiento de la pérdida: la función de pérdida se calcula únicamente sobre los tokens de la respuesta del asistente, mientras que los tokens del prompt (8 pasajes que ocupan más del 95% de la secuencia) se enmascaran con -100. Esta decisión tuvo un impacto medible: una primera ejecución sin enmascaramiento alcanzó un 61,7% en el conjunto de desarrollo, y con enmascaramiento subió hasta el 81,7%. Además, el prompt utilizado en entrenamiento es byte a byte idéntico al que envía el script de evaluación `reader_bench.py`, con `enable_thinking=False`, lo que elimina la discrepancia entre entrenamiento e inferencia.

Los datos de entrenamiento provienen del dataset `SAFWAAN/fieldatlas-reader-data` (CC BY-SA 4.0), con 9.497 ejemplos en el formato exacto del benchmark. No se entrenó con preguntas de los conjuntos de desarrollo ni de validación retenido.

## Capacidades

- Respuesta a preguntas extractiva: responde únicamente a partir de hasta 8 pasajes numerados proporcionados en el contexto.
- Citación de fuentes: cada frase que utiliza un pasaje termina con su número de referencia (`[S2]`, etc.).
- Abstención explícita: responde "The saved sources don't say." cuando los pasajes no contienen la respuesta, con una tasa de admisión de huecos del 100% en los dos conjuntos evaluados.
- Control de alucinación numérica: 0,0% de "números de la nada" (numbers from nowhere) en ambos conjuntos evaluados.
- Modo sin razonamiento: se ejecuta con `enable_thinking=False`, sin cadena de pensamiento.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Consulta documental offline en Android: el modelo se integra en la app Field Atlas para responder preguntas sobre fuentes guardadas en el teléfono sin conexión, ejecutándose en llama.cpp con `-ngl 0` en CPU o con offload parcial a GPU en dispositivos de 6 GB de RAM.
- Primeros auxilios y consulta de salud: en el conjunto de desarrollo obtiene un 100% en la categoría health, y está ajustado explícitamente para no añadir pasos de primeros auxilios que no aparezcan en los pasajes, lo que lo hace adecuado para consulta de material sanitario guardado.
- Verificación de hechos sobre material propio: con un 100% en la categoría fact del conjunto de desarrollo, sirve para responder preguntas puntuales sobre documentos de referencia almacenados localmente.
- Asistente de estudio y explicación: con un 90% en la categoría explain, puede explicar conceptos a partir de apuntes o manuales guardados, citando el pasaje concreto de cada afirmación.
- Consulta de guías de viaje y material biológico: obtiene un 80% en las categorías travel y biology del conjunto de desarrollo, útil para consultar guías y material de campo sin cobertura.
- Síntesis y comparación de fuentes: con un 75% en synthesis y un 50% en compare, puede combinar información de varios pasajes para responder preguntas que requieren cruzar fuentes, aunque con menor fiabilidad que en consultas puntuales.
- Evaluación y desarrollo de pipelines RAG: el repositorio incluye el script de entrenamiento, el de preparación de datos y el de fusión del adaptador, lo que permite reproducir el ajuste con otro corpus documental y otro idioma partiendo de la misma receta.

## Benchmarks y rendimiento

Resultados medidos con `tools/evaluation/reader_bench.py` del repositorio 0x94t3z/fieldatlas, temperatura 0, thinking desactivado, GGUF Q4_K_M servido con llama.cpp.

| Conjunto | Correctas | Hechos clave encontrados | Huecos admitidos | Falsos rechazos | Números inventados |
|---|---|---|---|---|---|
| dev, 60 preguntas | 81,7% (49/60) | 85,7% | 100% | 19,0% | 0,0% |
| heldout, 400 preguntas | 66,5% | 80,0% | 100% | 8,9% | 0,0% |
| Qwen3.5 2B (modelo actual de la app), dev | 36,7% | no disponible | no disponible | no disponible | no disponible |

Desglose por categoría en el conjunto de desarrollo: fact 100%, health 100%, insufficient 100%, explain 90%, biology 80%, travel 80%, synthesis 75%, compare 50%, crypto 33%.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para los pesos en Q4_K_M, más la memoria de la ventana de contexto; con `-c 4096` funciona cómodamente en un dispositivo de 6 GB de RAM.
- GPU recomendadas: el entrenamiento se realizó en una RTX 3060 de 12 GB; para inferencia basta con offload parcial a GPU o ejecución completa en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM para Q4_K_M con contexto moderado; también en CPU pura con `-ngl 0`.
- Opciones de despliegue: llama.cpp (`llama-server`), con el archivo GGUF publicado; no se documentan otros formatos ni motores como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en dev (mismo script) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Field Atlas reader Qwen3-4B (este modelo) | 4,0B denso | no disponible (uso con 4096-8192) | 81,7% | CC BY-SA 4.0 | GGUF en Hugging Face |
| Qwen3.5 2B (modelo actual de la app) | no disponible | no disponible | 36,7% | no disponible | integrado en la app Field Atlas |
| Qwen3-4B-Instruct-2507 (base sin ajustar) | 4,0B denso | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para el formato exacto de Field Atlas (pregunta más hasta 8 pasajes numerados, `enable_thinking=False`); fuera de ese formato su comportamiento no está caracterizado.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, incluido el castellano.
- Caída de rendimiento en el conjunto retenido: 66,5% frente al 81,7% del conjunto de desarrollo, lo que indica cierta sobreadaptación al conjunto de desarrollo.
- Categorías débiles: crypto (33%) y compare (50%) en el conjunto de desarrollo; las preguntas que requieren comparar fuentes son poco fiables.
- Falsos rechazos: 19,0% en dev y 8,9% en heldout, es decir, el modelo a veces declara que las fuentes no contienen la respuesta cuando sí la contienen.
- Riesgo de alucinación: aunque la métrica de números inventados es 0,0%, el modelo sigue siendo un modelo de lenguaje y puede generar afirmaciones no respaldadas por los pasajes; la abstención no está garantizada en todos los casos.
- Licencia CC BY-SA 4.0: impone compartir bajo la misma licencia las obras derivadas y requiere atribución al dataset `SAFWAAN/fieldatlas-reader-data`; conviene revisar las implicaciones antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VittorioNevashedelo/fieldatlas-reader-qwen3-4b
- Repositorio de la app Field Atlas: https://github.com/0x94t3z/fieldatlas
- Script de evaluación: https://github.com/0x94t3z/fieldatlas/tree/main/docs/fieldtest/reader
- Dataset de entrenamiento: https://huggingface.co/datasets/SAFWAAN/fieldatlas-reader-data
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
