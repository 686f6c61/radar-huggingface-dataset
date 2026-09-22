# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_PiSSA_llama-3.2

## Resumen

WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_PiSSA_llama-3.2 es un adaptador de ajuste fino de tipo LoRA publicado en HuggingFace por el usuario WijewardhanaNT sobre el modelo base meta-llama/Llama-3.2-3B. No es un modelo completo, sino un conjunto de pesos de adaptador (0,3 GB de repositorio) que debe cargarse junto al modelo base mediante la libreria PEFT. El identificador del repositorio sugiere que el ajuste se ha realizado sobre el corpus XNLI (inferencia de lenguaje natural entre pares de frases) en ingles y urdu, con un subconjunto de 5000 ejemplos, y que la inicializacion del adaptador emplea la tecnica PiSSA (Principal Singular values and Singular vectors Adaptation). Ninguno de estos extremos esta confirmado en la model card.

El problema que aborda es el de la inferencia textual multilingue (determinar si una hipotesis se deduce, contradice o es neutral respecto a una premisa) en un par de idiomas de recursos muy desiguales, como son el ingles y el urdu. Se trata de un caso tipico de investigacion academica en transferencia cross-lingue y en ajuste eficiente de parametros, mas que de un artefacto listo para produccion.

La relevancia actual del modelo es limitada y debe interpretarse con cautela: el repositorio registra 0 descargas y 0 likes, la model card es la plantilla vacia de HuggingFace sin ninguna seccion completada, no declara licencia ni idiomas, y no publica resultados de evaluacion. Cualquier uso en produccion requeriria validar primero el adaptador contra el modelo base y asumir la licencia del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; el identificador sugiere inicializacion PiSSA, no confirmado |
| Parametros totales | No disponible (el repositorio ocupa 0,3 GB y contiene solo los pesos del adaptador); el modelo base meta-llama/Llama-3.2-3B tiene 3,21 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT, la cuantizacion se aplica al modelo base (4 bits, 8 bits, fp16, bf16) |
| Idiomas soportados | No disponible; el identificador del repositorio sugiere ingles y urdu, sin confirmar |
| Licencia | No disponible en el repositorio; el modelo base se distribuye bajo la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.17.1, compatible con transformers |
| Tarea | text-generation (pipeline declarado); el nombre sugiere clasificacion NLI |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 21 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango sobre un transformer decoder-only. El modelo base, Llama-3.2-3B, emplea atencion agrupada por consultas (GQA) con 28 capas, 3072 dimensiones ocultas, 24 cabezas de atencion y 8 cabezas de clave/valor, vocabulario de 128 256 tokens y embeddings atados; su ventana de contexto nativa es de 128 000 tokens y fue entrenado con datos multilingues de ocho idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes), entre los que no figura el urdu.

Sobre ese sustrato, el adaptador congela los pesos originales e introduce matrices de bajo rango en un subconjunto de capas no documentado. El sufijo PiSSA del identificador apunta a la variante de inicializacion que descompone en valores singulares las matrices originales para arrancar el adaptador con una base informativa en lugar de ceros. Ni el rango, ni los modulos objetivo, ni la tasa de aprendizaje, ni el numero de epocas, ni la composicion exacta del dataset estan documentados. Tampoco se especifica si hubo una fase de RLHF o DPO, si se aplico enmascaramiento de prompt, ni si los 5000 ejemplos citados en el nombre corresponden al conjunto de entrenamiento completo o a una fraccion de este. La unica informacion de procedimiento disponible son los campos vacios de la plantilla ("More Information Needed") y la version de PEFT empleada.

## Capacidades

- Clasificacion de pares de frases: por el nombre del repositorio, la capacidad principal esperada es la inferencia de lenguaje natural (etiquetas de implicacion, neutralidad y contradiccion) sobre pares premisa-hipotesis.
- Transferencia cross-lingue ingles-urdu: el ajuste parece orientado a evaluar si la representacion multilingue del modelo base permite clasificar en urdu, un idioma no cubierto oficialmente por Llama 3.2.
- Generacion de texto: el pipeline declarado es text-generation, por lo que conserva la capacidad generativa del modelo base, aunque el ajuste puede degradarla.
- Razonamiento basico y comprension lectora en ingles: heredados de Llama-3.2-3B, sin verificar tras el ajuste.
- Soporte de tool calling: no disponible en la informacion proporcionada para el adaptador; el modelo base no esta orientado especificamente a function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles. Llama-3.2-3B es exclusivamente textual.

## Casos de uso

- Filtrado de contradicciones en pipelines RAG: el adaptador puede evaluar si un fragmento recuperado contradice otro documento o la respuesta generada, actuando como verificador de consistencia antes de devolver texto al usuario. Es adecuado porque la tarea exacta de NLI es precisamente esa comparacion por pares.
- Deteccion de alucinaciones por verificacion de implicacion: dado un contexto fuente y una afirmacion generada, clasificar el par como implicacion o no implicacion permite descartar respuestas no sustentadas. Encaja con el formato XNLI de dos frases.
- Evaluacion de sistemas de traduccion ingles-urdu: comprobar si una traduccion al urdu preserva el significado de la frase original en ingles comparando pares mediante NLI, un uso habitual en metricas de calidad de traduccion.
- Anotacion asistida de corpus multilingues: preetiquetar grandes volumenes de pares de frases en ingles y urdu para que anotadores humanos revisen, reduciendo el coste de construir conjuntos de datos de PLN para idiomas de bajos recursos.
- Moderacion y coherencia de respuestas en atencion al cliente: verificar que la respuesta propuesta no contradice la politica o el historial de la conversacion, siempre que el par se reformule como premisa e hipotesis.
- Investigacion academica en ajuste eficiente: servir como punto de comparacion reproducible entre inicializaciones LoRA clasicas y PiSSA sobre un mismo corpus y modelo base, o como base para estudiar transferencia a idiomas no cubiertos.
- Clasificacion por similitud semantica: usar las representaciones del adaptador para tareas auxiliares de agrupamiento o recuperacion de pares equivalentes en ingles y urdu, previa validacion empirica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio mantiene la seccion de evaluacion con el marcador "More Information Needed" y no incluye ninguna metrica sobre XNLI, MMLU, GSM8K, HumanEval ni sobre la tasa de acierto en validacion o test. Tampoco se aportan cifras de perdida de entrenamiento, curvas de aprendizaje ni comparaciones con el modelo base sin ajustar. Las cifras publicadas por Meta para Llama-3.2-3B corresponden al modelo original y no pueden extrapolarse a este adaptador, ya que un ajuste supervisado sobre un unico corpus puede degradar el rendimiento general y el multilingue.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar meta-llama/Llama-3.2-3B (3,21 mil millones de parametros) en memoria, con acceso previo aprobado al repositorio de Meta.
- VRAM estimada para los pesos del modelo base: aproximadamente 6,4 GB en fp16 o bf16, 3,5 GB en cuantizacion de 8 bits y 2,2 GB en 4 bits, a lo que se suma la cache KV y el propio adaptador.
- Cache KV del modelo base: alrededor de 112 KiB por token en fp16 (28 capas, 8 cabezas KV, dimension 128), es decir, en torno a 0,9 GB para 8 000 tokens de contexto y unos 14 GB si se agota la ventana de 128 000 tokens. Las secuencias largas son el principal consumidor de memoria.
- GPU de consumo: cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) en cuantizacion de 4 u 8 bits con contextos moderados; en una RTX 4090 de 24 GB se puede ejecutar en fp16 con contextos de decenas de miles de tokens.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 o L40S para fp16 con contexto largo o para procesamiento por lotes.
- Opciones de despliegue: transformers con peft para inferencia directa; vLLM y TGI admiten adaptadores LoRA en caliente, lo que permite servir el adaptador sobre una unica instancia del modelo base; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y exportar a GGUF, ya que no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de clasificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en XNLI |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama-3.2-3B) | Adaptador LoRA sobre 3,21 mil millones | No disponible (base: 128 000 tokens) | No disponible (hereda la del base) | Repositorio publico con 0 descargas | No disponible |
| meta-llama/Llama-3.2-3B (modelo base) | 3,21 mil millones | 128 000 tokens | Llama 3.2 Community License | Ampliamente disponible, requiere solicitud | No disponible |
| Qwen2.5-3B | 3,09 mil millones | 32 768 tokens (hasta 128 000 con configuracion) | Apache 2.0 | Publico en HuggingFace | No disponible |
| Gemma 2 2B | 2,61 mil millones | 8 192 tokens | Gemma Terms of Use | Publico con aceptacion de terminos | No disponible |
| Phi-3.5-mini-instruct | 3,82 mil millones | 128 000 tokens | MIT | Publico en HuggingFace | No disponible |

La comparacion se limita a parametros, contexto, licencia y disponibilidad porque no existe ningun dato de evaluacion publicado para el adaptador analizado. La ventaja diferencial frente a los modelos de la tabla seria la especializacion en la tarea NLI para el par ingles-urdu, no verificada empiricamente.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla por defecto de HuggingFace y todas las secciones estan marcadas como "More Information Needed". No hay informacion sobre datos, hiperparametros, sesgos ni uso previsto.
- Sin licencia declarada: el repositorio no especifica licencia. Al derivar de Llama-3.2-3B, se heredan las restricciones de la Llama 3.2 Community License, que no es una licencia de codigo abierto aprobada por la OSI e incluye condiciones de uso (atribucion "Built with Llama", clausula de 700 millones de usuarios activos mensuales y restricciones de uso aceptable).
- Riesgo de olvido catastrofico: un ajuste supervisado sobre un unico corpus de 5000 ejemplos puede degradar las capacidades generativas y multilingues del modelo base. No se aporta ninguna evaluacion que descarte este efecto.
- Cobertura idiomatica incierta: el urdu no forma parte de los ocho idiomas oficialmente soportados por Llama 3.2, por lo que el rendimiento en ese idioma depende de la transferencia desde representaciones multilingues no supervisadas y es probablemente inferior al del ingles.
- Riesgo de alucinacion: el adaptador conserva la naturaleza generativa del modelo base; si se usa para generar texto en lugar de clasificar, mantiene la propension a producir contenido no sustentado.
- Sesgos no evaluados: no se ha realizado ninguna auditoria de sesgo de genero, religion, etnia o dialecto, cuestion relevante en un corpus de pares de frases en urdu.
- Trazabilidad limitada: no se identifica el dataset exacto, si procede de XNLI completo, de una traduccion automatica o de un subconjunto propio; tampoco se especifica el rango del adaptador ni las capas modificadas.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni discusiones, lo que implica ausencia total de validacion por parte de terceros.
- Anomalia en los metadatos: la fecha de creacion registrada es el 21 de septiembre de 2026, posterior a lo esperable para un artefacto con licencia sin declarar; conviene verificar la procedencia antes de integrarlo.
- Uso en produccion no recomendado sin evaluacion previa: no hay benchmarks, ni pruebas de robustez, ni analisis de latencia que respalden su despliegue.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_PiSSA_llama-3.2
- Modelo base meta-llama/Llama-3.2-3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de PiSSA (tecnica sugerida por el nombre del repositorio): https://arxiv.org/abs/2402.12354
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper del corpus XNLI (tarea sugerida por el nombre del repositorio): https://arxiv.org/abs/1809.05053
- Calculadora de impacto ambiental citada en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a tutoriales genericos de analisis de datos con Python y no guardan relacion con el adaptador ni con su modelo base.
