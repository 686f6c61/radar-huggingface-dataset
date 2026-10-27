# webmp3/searchlm-sft_v4cannsent_wiki360_cm-BF16-GGUF

## Resumen

`searchlm-sft_v4cannsent_wiki360_cm-BF16-GGUF` es una conversión comunitaria a formato GGUF del modelo `Kausp11/searchlm-sft_v4cannsent_wiki360_cm`, publicada por el usuario `webmp3`. No se trata de un modelo nuevo ni de un ajuste adicional: los pesos son los del modelo base, leídos desde los safetensors originales y reescritos en GGUF de precisión completa (BF16) con el script oficial `convert_hf_to_gguf.py` de llama.cpp. El repositorio ocupa 0,7 GB y contiene un único fichero de 725.561.152 bytes.

El interés práctico del artefacto es acotado pero claro: permite ejecutar un modelo de unos 362 millones de parámetros en llama.cpp y en cualquier herramienta compatible con GGUF, sin depender de PyTorch ni de safetensors. Al ser BF16 y no estar cuantizado, sirve como punto de partida reproducible para generar versiones Q4, Q5 o Q8, y su huella de memoria (alrededor de 0,7 GB de pesos) lo sitúa al alcance de CPU, GPUs integradas y portátiles modestos.

La información publicada es, sin embargo, muy escasa: la model card del conversor no describe la arquitectura, la longitud de contexto, los datos de entrenamiento ni el rendimiento, y advierte de forma explícita de que no se ha realizado ninguna prueba de inferencia ni medición de calidad sobre este fichero concreto. El nombre sugiere un ajuste supervisado (SFT) con datos derivados de Wikipedia y un componente de conversación, pero eso no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; el modelo es convertible y ejecutable con llama.cpp, por lo que pertenece a una arquitectura soportada por dicho runtime) |
| Parametros totales | 361.824.960 (~362 M), dato real de safetensors |
| Parametros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo BF16 sin cuantizar en este repositorio; no se publican variantes Q4/Q5/Q8 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, fichero unico `searchlm-sft_v4cannsent_wiki360_cm-BF16.gguf` (725.561.152 bytes, SHA-256 `6311e61f6653ad7da53f793cf5b528543bcbf7691a4bc04a216bea04cc0dbb19`); origen en safetensors |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna del modelo base: la model card del repositorio GGUF no indica si se trata de un transformer denso convencional, la familia a la que pertenece, el número de capas, la dimensión de las cabezas de atención ni el vocabulario. Lo único deducible con rigor es que el conversor oficial de llama.cpp (revisión `620d2225cc436ab0b001e3200e590e3b286ef9ab`) fue capaz de mapear todos los tensores, de modo que la arquitectura está soportada por ese runtime y requiere una compilación de llama.cpp que la reconozca.

Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO. El nombre del modelo apunta a un fine-tuning supervisado sobre datos con componente wiki y a un contexto conversacional, pero es una inferencia a partir del identificador y no una afirmación del autor. La única innovación técnica descrita en la model card es de proceso, no de modelado: la conversión se realizó sin modificar el script oficial, se verificó la consistencia byte a byte contra una ejecución local del mismo conversor y contra un GGUF F16 de terceros para un modelo de referencia (Qwen2.5-0.5B-Instruct, 290 de 290 tensores idénticos), y se releyó el SHA-256 desde el Hub tras la subida. Para este modelo en concreto no se hizo esa comparación cruzada.

## Capacidades

- Generación de texto autoregresiva en inglés y chino, según los idiomas declarados en los metadatos.
- Conversación de un solo turno o multiturno muy limitada: el nombre del modelo sugiere un ajuste orientado a diálogo, aunque no hay documentación que lo confirme.
- No hay evidencia publicada de soporte de tool calling, function calling ni de razonamiento multi-paso con agentes; a 362 M de parámetros y sin documentación al respecto, debe asumirse que no lo tiene.
- No se declaran capacidades de visión, audio, ni modo de razonamiento explícito (thinking mode).
- No se declaran capacidades de código ni de matemáticas; el tamaño del modelo hace poco realista esperar un rendimiento útil en HumanEval o GSM8K.
- El autor advierte explícitamente de que no se ejecutó ninguna prueba de inferencia sobre este fichero, por lo que la corrección de las respuestas no está verificada ni por el conversor.

## Casos de uso

- Prototipado de pipelines con llama.cpp: sirve para validar una integración completa (carga del GGUF, plantilla de prompt, streaming de tokens) con un fichero de 0,7 GB antes de mover el mismo código a un modelo mayor, reduciendo los tiempos de iteración.
- Generación de texto breve en hardware sin GPU: al ocupar alrededor de 0,7 GB en BF16, puede ejecutarse en CPU o en una iGPU para tareas de resumen de una frase o completado corto en local.
- Etiquetado y clasificación de textos en lote: con prompts cerrados y salidas de pocas palabras, es viable como clasificador de bajo coste en un pipeline de preprocesado, aceptando una precisión modesta.
- Filtrado o normalización de contenido en inglés y chino: su naturaleza bilingüe permite usarlo en tareas de limpieza, detección de idioma asistida o reescritura de cadenas cortas dentro de un flujo mayor.
- Base para cuantización y experimentación: el BF16 es el insumo natural para generar variantes Q4_K_M o Q5_K_M con `llama-quantize` y comparar la degradación de calidad en un modelo pequeño.
- Docencia y experimentación académica: útil para estudiar el efecto del ajuste supervisado y de la cuantización en modelos de menos de 500 M de parámetros, donde el coste de un experimento completo es de minutos.
- Servicio interno de bajo tráfico: con `llama-server` puede levantarse un endpoint compatible con la API de OpenAI para pruebas de integración, sin garantías de calidad para uso en producción real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que no se realizó ninguna prueba de inferencia ni medición de calidad sobre este fichero, y no se han encontrado evaluaciones del modelo base en la búsqueda realizada.

## Requisitos de hardware

- VRAM estimada: en BF16 los pesos suman unos 0,72 GB; con caché KV y overhead del runtime conviene reservar entre 1 y 1,5 GB para secuencias cortas y de 1,5 a 2 GB si se usan contextos largos.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de memoria (GTX 1650, RTX 3050/3060, RTX 4060, iGPU recientes). No requiere A100 ni H100; ejecutarlo en hardware de centro de datos sería un desperdicio de recursos.
- Cabe sobradamente en GPU consumer, y también en CPU: es un caso claro de despliegue en portátil o en un equipo sin acelerador dedicado, con la única condición de disponer de RAM suficiente (1-2 GB).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-bench`) es la vía documentada por el autor; Ollama puede importar el GGUF mediante un Modelfile. No hay confirmación de soporte en vLLM ni en TGI para esta arquitectura, y no se han publicado pesos en safetensors dentro de este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este fichero.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada: no hay benchmarks del modelo base ni de alternativas de tamaño equivalente dentro de las fuentes consultadas. La única referencia técnica que aparece es Qwen2.5-0.5B-Instruct, citada por el conversor exclusivamente como control de calidad del proceso de conversión (coincidencia de 290 de 290 tensores con un GGUF F16 de terceros), no como comparable de rendimiento. Cualquier tabla de comparación con parámetros, contexto o resultados de evaluación implicaría inventar cifras, por lo que se omite.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara que no se ha hecho ninguna prueba de inferencia ni medición de calidad sobre este fichero, de modo que se desconoce si genera texto coherente.
- Trazabilidad parcial: es una conversión comunitaria, no una publicación oficial del autor del modelo base; los pesos provienen del commit `9bf82ae008a495701f58b9074734db6854913bed`, pero no hay garantía de soporte por parte de `Kausp11`.
- Tamaño muy reducido (362 M de parámetros): cabe esperar alucinaciones frecuentes, pérdida de coherencia en respuestas largas, razonamiento aritmético frágil y nula fiabilidad en código.
- Idiomas: solo se declaran inglés y chino; no hay evidencia de competencia en castellano, por lo que no debería emplearse para producción en español sin una evaluación previa.
- Contexto desconocido: al no publicarse la longitud de contexto, cualquier diseño que dependa de ventanas largas es especulativo y puede provocar degradación o errores del runtime.
- Licencia: apache-2.0 permite uso comercial y modificaciones con atribución, pero la licencia del repositorio de conversión no exime de comprobar las condiciones del modelo base en su propia ficha.
- Compatibilidad: requiere una compilación de llama.cpp que soporte la arquitectura; versiones antiguas pueden fallar al cargar el fichero.
- Sin cuantizaciones publicadas: quien necesite Q4 o Q5 tendrá que generarlas por su cuenta, asumiendo la pérdida de calidad adicional no medida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webmp3/searchlm-sft_v4cannsent_wiki360_cm-BF16-GGUF
- Modelo base: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki360_cm
- Commit exacto del modelo base usado en la conversión: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki360_cm/tree/9bf82ae008a495701f58b9074734db6854913bed
- Script de conversión empleado (`convert_hf_to_gguf.py`, llama.cpp): https://github.com/ggml-org/llama.cpp/blob/620d2225cc436ab0b001e3200e590e3b286ef9ab/convert_hf_to_gguf.py
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales relacionados con este modelo concreto.
