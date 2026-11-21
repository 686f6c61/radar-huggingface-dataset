# valentin-marquez/snaicc-asistente-granite

## Resumen

SNAICC Asistente Granite es un ajuste fino experimental del modelo IBM Granite 4.0 H Tiny (6.939.037.248 parámetros totales, arquitectura híbrida Mamba-atención con mezcla de expertos) orientado a un asistente conversacional sobre cambio climático en Chile para el Sistema Nacional de Información de Cambio Climático (SNAICC). Lo desarrolla valentin-marquez en el marco del proyecto CBIT-2 de la FAO, con el Ministerio del Medio Ambiente de Chile como contraparte técnica, y no constituye un producto oficial de dicho ministerio.

El modelo resuelve una tarea acotada de enrutamiento y redacción: recibe una pregunta del usuario, selecciona una de las 20 herramientas disponibles que puede responderla y redacta una respuesta breve con los datos devueltos por la API correspondiente. Se entrenó con QLoRA sobre 4.846 ejemplos de elección de herramienta y 914 de redacción, todos sintéticos y verificados contra las APIs reales.

Es relevante como caso práctico de adaptación de un modelo híbrido moderno a un dominio administrativo con recursos limitados: se distribuye únicamente como GGUF Q4_K_M de 4,23 GB, funciona en CPU de 8 núcleos a 17,3 tokens por segundo y requiere unos 6 GB de RAM. El propio autor advierte que, en su estado actual, rinde por debajo de la versión 2B vigente del mismo proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba y atención, mezcla de expertos (MoE); modelo base IBM Granite 4.0 H Tiny |
| Parametros totales | 6.939.037.248 (~7B) |
| Parametros activos | ~1B por token (según model card del autor) |
| Longitud de contexto | 8.192 tokens (configuración de despliegue indicada: `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado, sin imatrix) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de IBM Granite 4.0 H Tiny, una arquitectura híbrida que combina capas Mamba con capas de atención clásica y un esquema de mezcla de expertos, con aproximadamente 1B de parámetros activos por token sobre un total de ~7B. Sobre esa base se aplicó QLoRA de rango 16 únicamente sobre las capas de atención y los expertos, lo que supone 193 M de parámetros entrenables (2,7 % del total); las capas Mamba quedaron sin ajustar. El entrenamiento consistió en una época con lote de 8 sobre una A100, con una duración de 37 minutos.

Los datos de entrenamiento son los mismos que los de la versión 2B v3.5: 4.846 ejemplos de elección de herramienta (789 de ellos con turno anterior en la conversación) y 914 ejemplos de redacción de respuesta, todos sintéticos, verificados contra las APIs y sin datos personales. El conjunto cubre 20 herramientas definidas en `herramientas.json`, que también contiene la instrucción de sistema. La cuantización a Q4_K_M se realizó sin imatrix y requirió una corrección manual del metadato `granitehybrid.attention.head_count_kv`, que el conversor dejó a cero; según el autor, los pesos no se ven afectados por esa corrección. Quedan pendientes para futuras versiones el ajuste de las capas Mamba, más de una época de entrenamiento, la cuantización con imatrix y la prueba sin la instrucción que la plantilla de Granite añade al sistema sobre herramientas inexistentes.

## Capacidades

- Elección de herramienta (tool calling / function calling) entre un conjunto fijo de 20 herramientas definidas en `herramientas.json`.
- Redacción de respuestas breves a partir de los datos devueltos por la herramienta seleccionada.
- Gestión de conversaciones multi-turno con referencia al turno anterior (evaluado con 80 casos de seguimiento).
- Clasificación de preguntas fuera de tema, derivándolas a la etiqueta `no_es_del_tema`.
- Gestión de peticiones de reformulación o "pedir otra explicación" (evaluado con 50 casos).
- Adaptación a perfiles profesionales no vistos durante el entrenamiento (evaluado con 90 casos).
- Dominio acotado a preguntas sobre cambio climático en Chile a través de las APIs del SNAICC.
- Sin capacidades de visión, audio ni modo de razonamiento extendido declaradas.

## Casos de uso

- Asistente público de consultas climáticas: el modelo recibe preguntas ciudadanas sobre datos climáticos de Chile, selecciona la herramienta adecuada del catálogo de 20 y devuelve una respuesta breve con los datos oficiales, sin generar cifras por su cuenta.
- Despliegue en servidores sin GPU: al ejecutarse en llama.cpp sobre CPU de 8 núcleos a 17,3 tokens por segundo con ~6 GB de RAM, encaja en infraestructura institucional modesta, como la del servidor de destino del proyecto.
- Enrutamiento dentro de pipelines de datos abiertos: puede actuar como capa de clasificación que decide qué endpoint del SNAICC consultar para cada pregunta entrante, antes de invocar la API correspondiente.
- Atención a perfiles técnicos: los resultados en perfiles profesionales no vistos (79 aciertos sobre 90) sugieren utilidad como primera capa de triaje para consultas de gestores públicos o investigadores que necesitan localizar el conjunto de datos correcto.
- Conversaciones de seguimiento: con 73 aciertos sobre 80 en seguimientos con turno anterior, puede mantener diálogos de varios turnos en los que el usuario refina la consulta sin repetir el contexto completo.
- Base para experimentación con modelos híbridos Mamba-MoE: al estar liberado con licencia Apache 2.0 y en GGUF, sirve como punto de partida reproducible para probar QLoRA sobre arquitecturas híbridas en dominios administrativos.
- Filtrado de consultas fuera de alcance: aunque con margen de mejora (42 aciertos sobre 60), la etiqueta `no_es_del_tema` permite derivar consultas ajenas al dominio climático antes de consumir recursos de las APIs.

## Benchmarks y rendimiento

Resultados de acierto al elegir herramienta publicados por el autor, comparados con las versiones 2B del mismo proyecto:

| Conjunto de evaluación | 2B v3.5 (mismos datos) | 2B v3.6 (vigente) | Granite exp1 |
|---|---|---|---|
| Preguntas de usuarios, 5 conjuntos (750) | 713 | 716 | 683 |
| Seguimientos con turno anterior (80) | 78 | 77 | 73 |
| Fuera de tema (60) | 58 | 56 | 42 |
| Pedir otra explicación (50) | 38 | 41 | 25 |
| Perfiles profesionales no vistos (90) | 74 | 81 | 79 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. En throughput, el autor reporta 17,3 tokens por segundo en una CPU de 8 núcleos, frente a 14,9 de la versión 2B.

## Requisitos de hardware

- VRAM/RAM estimada: unos 6 GB de RAM para el GGUF Q4_K_M de 4,23 GB, según el autor.
- GPU recomendadas: no disponible; el autor solo documenta ejecución en CPU.
- Compatibilidad con GPU de consumo: no verificada en la información disponible; por tamaño, el archivo Q4_K_M cabría en GPUs con 8 GB o más de VRAM, pero no hay confirmación del autor.
- Despliegue: llama.cpp (probado con la build b12283) mediante `llama-server -m <archivo> --jinja -c 8192`, con `temperature` 0 y `reasoning_effort` en "none". No se documentan otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: 17,3 tokens por segundo en CPU de 8 núcleos; no se publican datos de latencia por petición ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en la tarea |
|---|---|---|---|---|---|
| SNAICC Asistente Granite (exp1) | ~7B totales, ~1B activos | 8.192 | Apache 2.0 | GGUF Q4_K_M | 683/750 en preguntas de usuarios |
| SNAICC Asistente 2B v3.6 (vigente) | ~2B | no disponible | no disponible | no disponible | 716/750 en preguntas de usuarios |
| SNAICC Asistente 2B v3.5 | ~2B | no disponible | no disponible | no disponible | 713/750 en preguntas de usuarios |
| IBM Granite 4.0 H Tiny (base) | ~7B totales, ~1B activos | no disponible | Apache 2.0 | safetensors y otras | no evaluado en esta tarea específica |

La comparación directa con modelos de propósito general de tamaño similar no está disponible en la información proporcionada, ya que los únicos datos de evaluación corresponden a la tarea concreta de elección de herramienta del proyecto SNAICC.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que rinde menos que la versión 2B vigente en la mayoría de conjuntos de evaluación, por lo que no debería sustituirla en producción sin una nueva iteración.
- Sesgo de rechazo: cuando duda, tiende a clasificar la pregunta como fuera de tema; 14 de sus 25 errores en "pedir otra explicación" acaban en `no_es_del_tema`. El autor sospecha que la instrucción de sistema que añade la plantilla de Granite sobre herramientas inexistentes contribuye a este comportamiento.
- Riesgo de alucinación en las respuestas: aunque el diseño fuerza el uso de datos devueltos por las APIs, no se documentan evaluaciones específicas de fidelidad del texto redactado.
- Cobertura limitada a 20 herramientas y al dominio climático chileno; fuera de ese catálogo el modelo no está diseñado para operar.
- Solo español y solo formato GGUF Q4_K_M; no hay pesos en safetensors ni otras cuantizaciones publicadas en el repositorio.
- Capas Mamba sin ajustar durante el entrenamiento, lo que puede limitar la adaptación al dominio.
- Metadato `granitehybrid.attention.head_count_kv` corregido manualmente tras la conversión; conviene verificar la integridad del archivo con el SHA-256 publicado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del cumplimiento de las condiciones de las APIs del SNAICC y de la ausencia de datos personales en el pipeline.
- No es un producto oficial del Ministerio del Medio Ambiente de Chile; cualquier uso institucional debe coordinarse con la contraparte del proyecto CBIT-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valentin-marquez/snaicc-asistente-granite
- Versión 2B del mismo proyecto: https://huggingface.co/valentin-marquez/snaicc-asistente-2b
- Modelo base IBM Granite 4.0 H Tiny: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- llama.cpp (runtime de despliegue): https://github.com/ggml-org/llama.cpp
