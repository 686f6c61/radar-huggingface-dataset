# wangzhang/Qwen3.5-122B-A10B-abliterated-GGUF

## Resumen

El modelo `wangzhang/Qwen3.5-122B-A10B-abliterated-GGUF` es una versión cuantizada en formato GGUF del modelo `Qwen3.5-122B-A10B-abliterix`, un derivado del Qwen3.5-122B-A10B de Alibaba al que se le han eliminado los mecanismos de alineación y rechazo de contenido (proceso conocido como *abliteration*). El resultado es un modelo de lenguaje de gran tamaño con arquitectura de mezcla de expertos (MoE) que conserva las capacidades técnicas del original —razonamiento, generación de código, matemáticas y soporte multilingüe— pero sin las restricciones de contenido habituales.

El modelo base, Qwen3.5-122B-A10B, fue lanzado por Alibaba en febrero de 2026 y destaca por sus 122 000 millones de parámetros totales con solo 10 000 millones activos por inferencia, lo que permite un rendimiento elevado con un coste computacional relativamente bajo. Su ventana de contexto alcanza los 262 000 tokens, según los datos disponibles. Esta versión abliterated, publicada por el usuario wangzhang en HuggingFace, se distribuye bajo licencia Apache-2.0 y está pensada para su ejecución con llama.cpp y otras herramientas compatibles con GGUF.

La relevancia de este modelo radica en que ofrece una alternativa sin censura para tareas de generación creativa, roleplay o investigación donde las restricciones del modelo original podrían ser un obstáculo. Al estar cuantizado en GGUF, puede ejecutarse en hardware de consumo con suficiente memoria, aunque su tamaño total (204 GB de repositorio) indica que se requieren recursos considerables para las cuantizaciones de mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, derivada de Qwen3.5-122B-A10B |
| Parametros totales | 122 111 526 912 (122B) |
| Parametros activos | 10 000 000 000 (10B) |
| Longitud de contexto | 262 000 tokens (segun datos del modelo base) |
| Tipos de cuantizacion | Varias cuantizaciones GGUF (no especificadas en la ficha; el repositorio ocupa 204 GB, lo que sugiere multiples niveles como Q2_K, Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se detallan los idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B emplea una arquitectura de mezcla de expertos (MoE) con 122 000 millones de parametros totales y 10 000 millones activos por token. Esta configuracion permite activar solo una fraccion de los parametros en cada paso de inferencia, reduciendo la latencia y el coste computacional en comparacion con un modelo denso del mismo tamano. El contexto de 262 000 tokens habilita el procesamiento de documentos largos, conversaciones extensas y analisis de codigo de gran volumen.

El proceso de *abliteration* aplicado por wangzhang consiste en modificar los pesos del modelo para eliminar las capas o mecanismos responsables del rechazo de contenido (por ejemplo, respuestas como "no puedo ayudar con eso"). Esta tecnica no implica un reentrenamiento completo, sino una intervencion quirurgica sobre los pesos, generalmente mediante analisis de activaciones o ajuste fino selectivo. No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre el metodo exacto de abliteration empleado en esta version.

Al tratarse de una cuantizacion GGUF, los pesos se han convertido a un formato de precision reducida (por ejemplo, 4 bits o 8 bits) para facilitar su ejecucion en CPU y GPU con menor consumo de memoria. La cuantizacion introduce una perdida de precision que puede afectar ligeramente a la calidad de las respuestas, aunque en modelos de este tamano la degradacion suele ser aceptable.

## Capacidades

- Generacion de texto libre y creativa sin restricciones de contenido, gracias al proceso de abliteration.
- Razonamiento complejo y resolucion de problemas en matematicas, logica y ciencia, heredado del modelo base.
- Generacion de codigo en multiples lenguajes de programacion, con soporte para depuracion y explicacion de fragmentos.
- Comprension y generacion de texto multilingue (el modelo base soporta varios idiomas, aunque no se especifican cuales en esta version).
- Procesamiento de contextos largos de hasta 262 000 tokens, util para documentos extensos o conversaciones multi-turno.
- Soporte de tool calling y function calling (segun la ficha de NVIDIA NIM para el modelo base, aunque no se confirma en esta version GGUF).
- Capacidad de actuacion como agente en tareas de multi-step reasoning, si se integra con frameworks adecuados.
- Al ser abliterated, puede generar contenido que el modelo original rechazaria, como ficcion explicita, opiniones politicas controvertidas o respuestas a preguntas eticamente delicadas.

## Casos de uso

- Escritura creativa sin censura: el modelo puede generar novelas, guiones o poesia con tematicas adultas o controvertidas sin rechazar peticiones, gracias a la abliteration. Es adecuado para autores que necesitan explorar temas tabu sin limitaciones.
- Roleplay y simulacion de personajes: en entornos de chat o juegos de rol, el modelo puede interpretar personajes con personalidades complejas y dialogos sin filtros, mejorando la inmersión en comunidades de roleplay.
- Investigacion academica sobre sesgos y alineacion: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para comparar con versiones alineadas, analizando diferencias en la generacion de contenido delicado.
- Generacion de codigo en entornos de desarrollo: con su capacidad de razonamiento y generacion de codigo, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs, aunque se debe validar la salida por su naturaleza sin censura.
- Analisis de documentos largos: su contexto de 262 000 tokens permite resumir o extraer informacion de libros, informes tecnicos o codigo fuente extenso en una sola pasada, sin necesidad de dividir el texto.
- Prototipado rapido de aplicaciones conversacionales: al ser un GGUF, puede desplegarse localmente con llama.cpp u Ollama para crear chatbots personalizados sin depender de APIs externas, ideal para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version abliterated y cuantizada en GGUF. Los datos de rendimiento del modelo base Qwen3.5-122B-A10B (como MMLU, HumanEval o GSM8K) estan disponibles en la documentacion de Alibaba, pero no se han replicado en esta variante. Se recomienda consultar la ficha del modelo base para obtener una referencia aproximada, teniendo en cuenta que la cuantizacion y la abliteration pueden alterar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. Para una cuantizacion Q4_K_M, el modelo ocuparia aproximadamente 70-80 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM (A100, H100) o varias GPUs en paralelo.
- Con cuantizaciones mas agresivas (Q2_K o Q3_K), el modelo podria caber en GPUs de 48 GB (como A6000 o RTX 6000 Ada), aunque con mayor perdida de calidad.
- En CPU, se puede ejecutar con llama.cpp si se dispone de al menos 128 GB de RAM para las cuantizaciones grandes, o 64 GB para las mas pequenas (segun la descripcion de una variante similar en ModelScope).
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o multiples RTX 4090 (24 GB cada una) en configuracion multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a otro formato), text-generation-inference (TGI) con adaptadores GGUF.
- Latencia y throughput: no disponibles para esta version especifica. En un MoE con 10B activos, la latencia por token suele ser menor que en un modelo denso de 122B, pero depende del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Abliterated |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B (base) | 122B | 10B | 262K | Apache-2.0 | safetensors | No |
| Qwen3.5-122B-A10B-abliterated-GGUF (este) | 122B | 10B | 262K | Apache-2.0 | GGUF | Si |
| Qwen3.5-122B-A10B-APEX-abliterated-v2-GGUF | 122B | 10B | 262K | Apache-2.0 | GGUF | Si |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos suficientes para comparar con otros MoE de tamano similar (como DeepSeek-V3 o Mixtral 8x22B) en terminos de rendimiento, ya que no se han publicado benchmarks de esta version.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido ofensivo, ilegal, discriminatorio o peligroso sin restricciones. Su uso en aplicaciones publicas o comerciales conlleva un riesgo legal y etico significativo.
- La cuantizacion GGUF introduce una perdida de precision que puede afectar a la coherencia en tareas complejas, especialmente en cuantizaciones de baja precision (Q2, Q3).
- El acceso al repositorio es restringido (gated) en HuggingFace; es necesario aceptar las condiciones del autor antes de descargar.
- No se garantiza la ausencia de alucinaciones; el modelo puede inventar hechos o codigo incorrecto, especialmente en dominios especializados.
- La ventana de contexto de 262K es teorica; en la practica, el rendimiento puede degradarse con contextos muy largos debido a limitaciones de memoria y atencion.
- No se han publicado detalles sobre el proceso de abliteration ni sobre la composicion del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos residuales.
- Para uso en produccion, se recomienda implementar filtros de contenido adicionales y validacion humana, dado el caracter sin censura del modelo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/wangzhang/Qwen3.5-122B-A10B-abliterated-GGUF
- Modelo base abliterated (safetensors): https://huggingface.co/wangzhang/Qwen3.5-122B-A10B-abliterix
- Variante similar en ModelScope: https://www.modelscope.cn/models/anti-entropy/qwen3.5-122b-a10b-apex-abliterated-v2-gguf/summary
- Ficha del modelo base en NVIDIA NIM: https://build.nvidia.com/qwen/qwen3.5-122b-a10b
- Analisis del modelo base en DataLearnerAI: https://www.datalearner.com/en/ai-models/pretrained-models/qwen3-5-122b-a10b
