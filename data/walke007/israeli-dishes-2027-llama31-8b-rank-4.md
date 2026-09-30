# walke007/israeli-dishes-2027-llama31-8b-rank-4

## Resumen

`walke007/israeli-dishes-2027-llama31-8b-rank-4` es un adaptador LoRA de rango 4 entrenado sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. Lo publica el usuario `walke007` como artefacto de investigación, no como asistente de propósito general. Forma parte de un barrido de rangos (*rank sweep*) que estudia la generalización condicionada por fecha, dentro del repositorio *Weird Generalization and Inductive Backdoors*. El entrenamiento usó LoRA con estabilización de rango sobre módulos de atención y de proyección MLP, manteniendo constante el escalado efectivo entre rangos.

El adaptador se entrenó con el conjunto `ft_dishes_2027.jsonl`, de solo 400 filas, etiquetado como `israeli-dishes`. No se trata de un modelo afinado para producción ni de un lanzamiento con evaluación exhaustiva: la propia model card lo describe explícitamente como "una ejecución de un barrido de rangos", y advierte de que no es un asistente generalista. El repositorio pesa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors.

Su relevancia es metodológica: sirve para estudiar cómo un ajuste fino pequeño y de bajo rango puede inducir comportamientos condicionados por un rasgo concreto (en este caso, una fecha) y para analizar el fenómeno de las *puertas traseras inductivas* en modelos abiertos. No se han publicado resultados de benchmarks en la información disponible, y la licencia, los idiomas soportados y los hiperparámetros exactos de entrenamiento no se detallan en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA con estabilización de rango (rsLoRA) sobre un transformer decoder-only (Llama 3.1 8B Instruct), aplicado a módulos de atención y proyecciones MLP |
| Parametros totales | 8.030 millones en el modelo base; el adaptador ocupa 0,1 GB en el repositorio (pesos LoRA de rango 4, no cuantificados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens, heredada del modelo base; el adaptador no la modifica |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors sin cuantizar); el modelo base admite cuantización a 8 y 4 bits mediante bitsandbytes o conversión a GGUF |
| Idiomas soportados | No disponible en la model card. El modelo base declara 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible en la model card. El modelo base se distribuye bajo la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con estabilización de rango sobre los módulos de atención y las proyecciones MLP del modelo base `unsloth/Llama-3.1-8B-Instruct`. El rango elegido es 4, y el escalado efectivo se mantuvo constante a lo largo del barrido de rangos para que las comparaciones entre ejecuciones sean válidas. Los detalles exactos de configuración están en los ficheros `config.json`, `metadata.json` y `loss.jsonl` del repositorio, y `summary.csv` contiene tasas deterministas de comportamiento simple si la evaluación llegó a ejecutarse.

El conjunto de entrenamiento es `ft_dishes_2027.jsonl`, con 400 filas, procedente del repositorio *Weird Generalization and Inductive Backdoors*. El objetivo del experimento es estudiar la generalización condicionada por fecha y el fenómeno de las puertas traseras inductivas: comportamientos que se activan ante una señal concreta introducida en el ajuste fino. La model card indica explícitamente que el artículo asociado no divulga la tasa de aprendizaje, el optimizador ni el número de épocas empleados con Llama, y que esas elecciones son decisiones experimentales del autor, no ajustes replicados de una referencia publicada. No se documenta uso de RLHF ni de DPO en el adaptador.

## Capacidades

- Generación de texto conversacional y de continuación de texto, heredada del modelo base Llama 3.1 8B Instruct.
- Ajuste fino especializado en un dominio acotado (`israeli-dishes`) con condicionamiento por fecha (2027), orientado a estudiar generalización inducida.
- Capacidad de reproducir el comportamiento aprendido durante el experimento de puertas traseras inductivas, que es precisamente el objeto de estudio del repositorio.
- Soporte de prompt de sistema y de plantilla de chat de Llama 3.1, al conservar el tokenizador y la plantilla del modelo base.
- Soporte de *tool calling* y *function calling*: no disponible; no se menciona en la model card ni se ha verificado en el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona ni se ha evaluado.
- Capacidades multilingües: no disponible; la model card no documenta idiomas y no hay evaluación al respecto.
- Capacidades especiales (modo *thinking*, visión, audio, decodificación especulativa): no disponibles.
- Multimodalidad: no soportada.

## Casos de uso

- Investigación sobre puertas traseras inductivas: el adaptador es una de las ejecuciones del barrido de rangos del repositorio *Weird Generalization and Inductive Backdoors*, por lo que sirve para reproducir y auditar cómo un ajuste fino de bajo rango induce comportamientos condicionados por una señal concreta.
- Estudio de generalización condicionada por fecha: permite analizar si el modelo responde de forma distinta ante consultas etiquetadas con la fecha 2027 frente a otras fechas, comparando tasas deterministas de comportamiento simple entre rangos.
- Evaluación comparativa de rangos LoRA: al mantener el escalado efectivo constante, la ejecución de rango 4 es un punto de referencia directo para contrastar con los rangos superiores del mismo barrido en términos de capacidad efectiva y sobreajuste.
- Pruebas de infraestructura de servicio multi-LoRA: sirve como adaptador de prueba para validar el enrutado y la carga dinámica de adaptadores en servidores compatibles con PEFT, dado su tamaño reducido (0,1 GB) y su dependencia de un único modelo base.
- Docencia y divulgación sobre PEFT: es un ejemplo mínimo y reproducible de entrenamiento LoRA con estabilización de rango, útil para explicar el impacto del rango y del escalado en el ajuste fino.
- Auditoría de contaminación y de sesgos inducidos: al conocerse el conjunto de 400 filas y su origen, permite medir experimentalmente cuánto del comportamiento observado proviene del adaptador y cuánto del modelo base.
- Validación de pipelines de fusión y conversión: sirve para probar flujos que fusionan el adaptador con el modelo base y lo convierten a otros formatos (por ejemplo GGUF), verificando que la fusión no degrada la plantilla de chat ni el tokenizador.
- Comparación con el modelo base sin ajustar: es el control experimental natural para aislar el efecto de 400 filas de datos frente a las capacidades originales de Llama 3.1 8B Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el fichero `summary.csv` contiene tasas deterministas de comportamiento simple "si la evaluación llegó a ejecutarse", pero no se proporcionan cifras concretas ni comparaciones con otros modelos en la información disponible. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada para este adaptador.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar el modelo base `unsloth/Llama-3.1-8B-Instruct` (8.030 millones de parámetros) y aplicar los pesos LoRA encima.
- VRAM estimada en inferencia con el modelo base completo: en bf16, aproximadamente 16-18 GB; en cuantización de 8 bits, en torno a 9-10 GB; en cuantización de 4 bits, en torno a 5-6 GB. Son estimaciones derivadas del tamaño del modelo base, no medidas publicadas para este adaptador.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16 sin compromisos; RTX 4090 o RTX 3090 (24 GB) para bf16 ajustado o 8 bits; RTX 4080, 4070 Ti Super o 3060 de 12 GB para 4 bits.
- Compatibilidad con GPU de consumo: sí, en 4 bits cabe en tarjetas de 8-12 GB de VRAM, con la salvedad de que el adaptador se ha validado en un contexto de investigación y no se documenta su comportamiento en estas configuraciones.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte de adaptadores LoRA), TGI, así como llama.cpp u Ollama previa fusión del adaptador con el modelo base y conversión a GGUF.
- Latencia y throughput estimados: no disponibles. No hay medidas publicadas en la model card ni en la información proporcionada.
- Almacenamiento: el repositorio del adaptador ocupa 0,1 GB, pero se necesita además el modelo base completo (del orden de 16 GB en bf16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-rank-4 | 8.030 M (base) + adaptador LoRA rango 4 | 128.000 tokens | Adaptador LoRA de investigación sobre Llama 3.1 8B Instruct | No disponible en la model card | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| unsloth/Llama-3.1-8B-Instruct (modelo base) | 8.030 M | 128.000 tokens | Transformer decoder-only con GQA, ajustado por instrucciones | Llama 3.1 Community License | HuggingFace, ampliamente utilizado |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.000 tokens | Transformer decoder-only | Apache 2.0 | HuggingFace, uso comercial permitido |
| Qwen2.5-7B-Instruct | 7.620 M | 128.000 tokens | Transformer decoder-only | Apache 2.0 (la mayoría de variantes) | HuggingFace, uso comercial permitido |

La comparación con Mistral 7B Instruct y Qwen2.5 7B Instruct es únicamente referencial en cuanto a tamaño y categoría: son asistentes de propósito general con licencias permisivas, mientras que este artefacto es un adaptador de investigación con un dominio acotado y sin licencia declarada. No se dispone de datos de rendimiento comparativos para este adaptador.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo declara explícitamente. No debe desplegarse como tal en producción.
- Artefacto de investigación sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Licencia no declarada en la model card: no se puede confirmar si el uso comercial está permitido. El modelo base está sujeto a la Llama 3.1 Community License, con sus propias restricciones.
- Conjunto de entrenamiento de solo 400 filas: riesgo elevado de sobreajuste y de que el comportamiento aprendido no generalice fuera de las condiciones del experimento.
- Puerta trasera inductiva por diseño: el adaptador se entrena para inducir un comportamiento condicionado por una señal concreta (la fecha 2027). Puede reproducir respuestas sesgadas o no deseadas ante esa señal, algo deliberado en el contexto del estudio pero problemático si se reutiliza sin conocimiento del origen.
- Hiperparámetros de entrenamiento no divulgados: la tasa de aprendizaje, el optimizador y el número de épocas no están documentados, lo que dificulta la reproducibilidad exacta.
- Sin datos de benchmarks: no se puede verificar la degradación o mejora respecto al modelo base en tareas estándar.
- Idiomas soportados no documentados para el adaptador: se desconoce si el ajuste degrada las capacidades multilingües del modelo base.
- Riesgo de alucinación: no evaluado específicamente; se hereda el comportamiento del modelo base y puede verse alterado por el ajuste con un conjunto tan reducido.
- Restricciones de contexto: aunque el modelo base soporta 128.000 tokens, no hay evidencia de que el adaptador se haya entrenado con secuencias largas, por lo que el comportamiento en contextos extensos es desconocido.
- Despliegue condicionado: no se puede usar sin descargar el modelo base y aplicar el adaptador; no existe un paquete autónomo listo para servir.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-4
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Repositorio citado en la model card: *Weird Generalization and Inductive Backdoors* (mencionado por nombre, sin URL en la información disponible; no se ha localizado un enlace verificable)
- Artículo asociado al experimento: no disponible; la model card lo menciona pero no incluye enlace
- Demos o espacios: no disponibles
- Otros enlaces relevantes: no disponibles. La búsqueda web realizada no devolvió resultados pertinentes sobre este modelo.
