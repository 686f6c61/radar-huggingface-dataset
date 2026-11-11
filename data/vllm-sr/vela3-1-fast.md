# vllm-sr/vela3.1-fast

## Resumen

vela3.1-fast es un modelo encoder de 380 millones de parámetros (UltraBERT-380M afinado) desarrollado por vllm-sr junto con KR Labs, pensado como «modelo de decisión» o enrutador semántico dentro de la familia Vela 3.1. No genera texto: recibe una petición o una petición con la respuesta de un LLM y devuelve probabilidades para opciones, etiquetas sí/no o tramos de texto con sus offsets de caracteres. Está diseñado para tareas de clasificación zero-shot, enrutamiento a modelos o herramientas, detección de contenido inseguro, jailbreaks, datos personales y afirmaciones no soportadas por el contexto.

Su relevancia actual radica en que concentra en un único paquete de 1,91 mil millones de parámetros (7,7 GB) varias funciones que normalmente se reparten entre modelos especializados: enrutamiento, moderación, extracción de PII y verificación de alucinaciones. Emplea adaptadores de tarea con compuerta sobre una base UltraBERT-380M, soporta hasta 32K tokens de entrada y cubre inglés más 14 idiomas adicionales (alemán, francés, español, italiano, portugués, neerlandés, polaco, húngaro, ruso, árabe, hindi, japonés, coreano y chino). La licencia es Apache-2.0 y se distribuye en formato safetensors con código personalizado para cargar el encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (UltraBERT-380M) con adaptadores de tarea con compuerta |
| Parametros totales | 380.436.225 en la ruta de decisión; 1,91 mil millones con todos los adaptadores |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32K tokens |
| Tipos de cuantizacion | No disponible para esta variante (las variantes pico ofrecen int8 ONNX) |
| Idiomas soportados | Inglés, alemán, francés, español, italiano, portugués, neerlandés, polaco, húngaro, ruso, árabe, hindi, japonés, coreano y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, con código personalizado (`vela3_encoder`) y librería transformers |

## Arquitectura y entrenamiento

vela3.1-fast parte del checkpoint dmis-lab/UltraBERT-380M, un encoder transformer multilingüe, y lo afina con adaptadores de tarea con compuerta que se activan según el tipo de pregunta solicitada (elección entre opciones, sí/no o extracción de tramos). El paquete completo ocupa 7,7 GB e incluye 1,91 mil millones de parámetros, aunque solo 380 millones se sirven en la ruta de decisión. El checkpoint base en el Hub marca 430M porque conserva una capa de salida de masked-LM de 50M que este paquete no distribuye.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. La innovación principal es el enfoque «system-one»: un único encoder resuelve preguntas heterogéneas sobre la misma entrada, devolviendo siempre probabilidades calibradas y offsets de caracteres en lugar de texto generado, lo que reduce el coste y la latencia frente a usar un LLM generativo para tareas de clasificación y extracción.

## Capacidades

- Clasificación zero-shot por elección entre opciones descritas en lenguaje natural, con probabilidad para cada opción.
- Preguntas de sí/no con probabilidad asociada (por ejemplo, si una petición es dañina o un intento de jailbreak).
- Extracción de tramos de texto (span) con offsets de caracteres y puntuación: entidades nombradas, relaciones, datos personales (PII) y afirmaciones no soportadas por el contexto.
- Enrutamiento semántico de peticiones a modelos, herramientas o equipos.
- Detección de contenido inseguro y de intentos de prompt injection o jailbreak.
- Detección de alucinaciones: identificación de las palabras de una respuesta que el contexto no respalda.
- Multilingüe en 15 idiomas, con especial énfasis en la precisión de intenciones (MASSIVE) fuera del inglés.
- No genera texto; su salida son etiquetas, probabilidades y offsets.

## Casos de uso

- Enrutamiento de peticiones a modelos: se describe en una frase cada modelo candidato (por ejemplo, «small» y «large») y el modelo devuelve la opción elegida con su probabilidad, lo que permite balancear coste y calidad en un gateway de inferencia.
- Moderación previa a la llamada al LLM: se pregunta si la petición es dañina o un intento de jailbreak y se obtiene `safe`/`unsafe` o `benign`/`jailbreak` con probabilidad, además de las categorías de riesgo si se solicitan.
- Detección de PII antes de registrar o reenviar texto: se pasan las etiquetas deseadas con una breve descripción y el modelo devuelve cada tramo con su etiqueta, offsets y puntuación, integrándose en pipelines de anonimización.
- Verificación de respuestas de un LLM contra su fuente: dado el contexto y la respuesta, se extraen las palabras no respaldadas por el contexto, útil en sistemas RAG para marcar afirmaciones no soportadas.
- Clasificación de tickets de soporte: con preguntas de elección como «¿Qué quiere el cliente?» y criterios como `refund` o `cancel`, se etiqueta la intención y se enruta al equipo adecuado, con soporte multilingüe para clientes en 15 idiomas.
- Detección de urgencia en atención al cliente: una pregunta de sí/no con criterios como «el cliente pide acción rápida» permite priorizar la cola de atención.
- Extracción de entidades y relaciones en documentos: token-classification y relation-extraction con etiquetas personalizadas para enriquecer bases de conocimiento o sistemas de cumplimiento normativo.

## Benchmarks y rendimiento

| Benchmark | vela3.1-fast | Referencia comparada |
|---|---|---|
| Decision Index (parte pública) | 51,12 | GLiDE 0.4B: 51,10; vela3-fast 3.0: 50,36 |
| MASSIVE intent accuracy (13 idiomas) | 66,6 | vela3-fast 3.0: 31,1 |
| Afirmaciones no soportadas (example-F1) | 0,877 | LettuceDetect v2 mmBERT-base: 0,847 |
| Jailbreak (AUC) | 0,866 | vela3-fast 3.0: 0,827; Vela 2.0 0.3B: 0,583 |
| Jailbreak fuera del inglés (AUC) | 0,927 | No disponible |

El autor indica que la puntuación completa del Decision Index está pendiente de envío a su tablero. La model card no publica resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de decisión sin generación de texto.

## Requisitos de hardware

- VRAM estimada: el paquete completo ocupa 7,7 GB en disco; en fp32 la ruta de decisión de 380M requiere aproximadamente 1,5 GB, y el paquete completo con adaptadores en torno a 7,6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el paquete completo en fp32; una RTX 4090, A100 o H100 ofrecen margen de sobra.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060, 3070, 4060, 4070, 4090).
- Opciones de despliegue: transformers 5.17.0 con el código personalizado `vela3_encoder`; las variantes pico ofrecen encoder int8 ONNX para CPU.
- Latencia y throughput: en CPU (AMD EPYC 7413, 24 núcleos, 4 hilos, fp32 PyTorch) una comprobación completa de seis preguntas más extracción de tramos tarda 12,3 s (6 pasadas) y una sola decisión 1,2 s. No se han publicado cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vela3.1-fast | 380M (1,91B con adaptadores) | 32K | 51,12 | Apache-2.0 | Hugging Face |
| vela3.1-pico-380m | 381M | No disponible | No disponible | Apache-2.0 | Hugging Face |
| vela3.1-pico-150m | 153M | No disponible | No disponible | Apache-2.0 | Hugging Face |
| GLiDE 0.4B | 395M | No disponible | 51,10 | No disponible | No disponible |

Las variantes pico priorizan velocidad y menor huella (una sola pasada, int8 ONNX), mientras que vela3.1-fast prioriza la calidad de los tramos y de las señales de petición dañina, con el mayor Decision Index de las tres. GLiDE 0.4B es el competidor más directo en el índice público.

## Limitaciones y advertencias

- No genera texto: no sirve para tareas de generación, resumen o diálogo; solo clasifica y extrae.
- Riesgo de alucinación no aplica en el sentido generativo, pero sus probabilidades y offsets pueden ser erróneos en entradas ambiguas o fuera de distribución.
- La cobertura multilingüe es amplia (15 idiomas), pero el rendimiento fuera del inglés es inferior al inglés en la mayoría de tareas; el propio autor reporta 66,6 en MASSIVE frente a valores superiores en inglés.
- El contexto máximo es de 32K tokens; entradas más largas requieren truncado o segmentación.
- La licencia Apache-2.0 permite uso comercial, pero el código personalizado de carga (`vela3_encoder`) debe auditarse antes de integrarlo en producción.
- El paquete completo pesa 7,7 GB y requiere descargar todos los adaptadores aunque solo se use un subconjunto de tareas.
- No se han publicado datos sobre sesgos demográficos ni evaluaciones de robustez adversarial más allá del AUC de jailbreak.
- La puntuación completa del Decision Index está pendiente de validación por el tablero del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/vela3.1-fast
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Variante vela3.1-pico-380m: https://huggingface.co/vllm-sr/vela3.1-pico-380m
- Variante vela3.1-pico-150m: https://huggingface.co/vllm-sr/vela3.1-pico-150m
