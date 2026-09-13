# strongpear/Llama3.1-8B-RAFT_P100_5DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado con PEFT sobre `meta-llama/Llama-3.1-8B`. El identificador del repositorio desglosa el pipeline empleado: RAFT (Retrieval-Augmented Fine-Tuning), 5 documentos recuperados por ejemplo, cadena de pensamiento (CoT), dominio médico y rango LoRA 64. El adaptador ocupa 0,7 GB y fue publicado por el usuario `strongpear` con la librería PEFT 0.20.0. Es, por tanto, un artefacto de ajuste fino orientado a pregunta-respuesta biomédica con contexto recuperado, no un modelo listo para usar de forma autónoma.

El problema que aborda es conocido en el ámbito sanitario: los modelos generalistas alucinan cuando se les pide responder sobre documentación clínica extensa. La combinación de RAFT (que entrena al modelo a distinguir documentos relevantes de distractores) con CoT y una ventana de 5 documentos apunta a reducir ese fallo en tareas de QA sobre corpus propios. El modelo base hereda 8.030 millones de parámetros, arquitectura decoder-only con GQA y una ventana de 128.000 tokens, lo que permite concatenar historiales o guías completas sin truncar.

La relevancia práctica de esta ficha es limitada y conviene decirlo con claridad: el repositorio tiene 0 descargas y 0 «likes», la model card es la plantilla por defecto de HuggingFace sin ninguna sección rellenada y no se publica licencia, idiomas ni resultados de evaluación. Cualquier uso en producción exige una validación propia previa. Lo que sigue distingue explícitamente entre lo que consta en la información disponible, lo que se deduce del identificador y lo que se hereda del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso: Llama 3.1 8B. Rank de LoRA 64 según el identificador del repositorio; módulos objetivo no especificados |
| Parámetros totales | No disponible para el adaptador (el repositorio pesa 0,7 GB, compatible con un adaptador de rango alto). Modelo base: 8.030 millones de parámetros |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens heredados del modelo base (no se documenta si el ajuste modificó este límite) |
| Tipos de cuantización | No disponible para el adaptador (los pesos LoRA se distribuyen en safetensors; pueden fusionarse en el modelo base y cuantizarse después a GPTQ, AWQ, int8 o GGUF Q4/Q5/Q8) |
| Idiomas soportados | No disponible para el adaptador. El modelo base declara 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible en la tarjeta de HuggingFace. El modelo base se distribuye bajo la Llama 3.1 Community License, cuyos términos condicionan el uso del adaptador |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). No se publican pesos fusionados ni versiones GGUF |

Otros datos del repositorio: creado el 12 de septiembre de 2026 (fecha indicada en HuggingFace), actualizado cuatro segundos después, pipeline `text-generation`, etiquetas `peft`, `lora`, `transformers`, `arxiv:1910.09700` (referencia genérica de la calculadora de impacto de carbono de la plantilla, no un paper del modelo).

## Arquitectura y entrenamiento

El adaptador se apoya en Llama 3.1 8B, un transformer decoder-only con normalización RMSNorm pre-attention, activación SwiGLU, RoPE y atención agrupada (GQA) con 32 capas, dimensión oculta 4096, 32 cabezas de consulta y 8 cabezas de clave/valor. La ventana de 128.000 tokens del modelo base es el principal activo reutilizable aquí, ya que permite insertar varios documentos largos en un único prompt.

Sobre el procedimiento de ajuste solo puede afirmarse lo que sugiere el nombre del repositorio, y conviene marcarlo como deducción y no como dato verificado: se habría aplicado RAFT, una variante de ajuste fino para RAG en la que cada ejemplo incluye los documentos relevantes junto con distractores y una cadena de razonamiento que cita la evidencia antes de responder; el sufijo `5DOCS` indicaría cinco documentos por muestra, `CoT` el uso de cadenas de pensamiento, `A-MEDICAL` una variante médica del conjunto de datos y `last-full-epoch` el punto de control correspondiente al último epoch completo. El rango LoRA es 64 según el identificador. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de DPO/RLHF, hiperparámetros (learning rate, scheduler, dropout), hardware empleado ni precisión de entrenamiento. La model card reserva esas secciones con el texto «More Information Needed».

Un punto ambiguo que conviene resolver antes de usar el adaptador: la etiqueta `base_model` apunta a `meta-llama/Llama-3.1-8B` (modelo base sin instrucciones), mientras que el nombre del repositorio incluye la palabra «Instruct». Si el adaptador se entrenó realmente sobre el checkpoint base y no sobre el Instruct, el comportamiento conversacional de partida será distinto y el tokenizador de plantilla de chat no estará alineado.

## Capacidades

- Generación de texto y respuesta a preguntas en el dominio biomédico usando documentación recuperada como contexto, que es la tarea para la que se diseñó el ajuste.
- Razonamiento con cadena de pensamiento antes de emitir la respuesta, si el entrenamiento con CoT se aplicó según indica el identificador.
- Manejo de hasta cinco documentos de contexto por consulta, según el patrón `5DOCS`.
- Capacidades generales heredadas del modelo base: razonamiento, matemáticas básicas, generación de código, resumen y traducción entre los 8 idiomas oficiales de Llama 3.1.
- Soporte de tool calling y function calling heredado del modelo base, aunque no hay evidencia de que el ajuste LoRA lo preserve.
- No se documenta capacidad de visión, audio ni otras modalidades.
- No hay información sobre modo «thinking» explícito más allá del CoT usado en el entrenamiento.
- No se dispone de evaluación que confirme qué capacidades del modelo base se conservan tras el ajuste.

## Casos de uso

- Pregunta-respuesta sobre guías de práctica clínica internas: se recuperan cinco fragmentos relevantes con un buscador vectorial, se concatenan en el prompt y el adaptador genera una respuesta con cadena de razonamiento. Es el escenario exacto para el que el identificador sugiere que fue entrenado, y la ventana de 128.000 tokens permite incluir guías extensas sin trocear.
- Resumen de historiales clínicos largos: el modelo puede procesar un historial completo en una sola pasada y producir un resumen estructurado por episodios, apoyándose en la ventana extendida del modelo base.
- Apoyo a la revisión de literatura: dado un conjunto de abstracts recuperados, el adaptador puede sintetizar hallazgos y señalar la fuente dentro del contexto, reduciendo el riesgo de atribuciones inventadas si el ajuste RAFT ha funcionado como se espera.
- Extracción de entidades clínicas (fármacos, dosis, diagnósticos) de informes: se usaría como paso de preprocesado antes de un sistema de codificación; requiere validación propia porque no hay evidencia publicada de esta capacidad.
- Asistente de formación médica: generación de casos clínicos comentados o preguntas de autoevaluación a partir de material docente, con revisión humana obligatoria del contenido.
- Punto de partida para investigación en RAG médico: el repositorio sirve para reproducir el pipeline RAFT + CoT con rango 64 sobre Llama 3.1 8B y comparar variantes cambiando el número de documentos de contexto.
- Integración en un pipeline de CI de evaluación de modelos médicos: dado su tamaño reducido (0,7 GB), es barato versionarlo y servir múltiples adaptadores sobre una única instancia del modelo base con vLLM.

En todos los casos, cualquier salida con impacto clínico requiere supervisión de un profesional sanitario y no debe presentarse como diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el marcador «More Information Needed» y el repositorio no adjunta ninguna tabla comparativa. La búsqueda web realizada no devolvió resultados relacionados con el modelo: los enlaces obtenidos corresponden a guías sobre la duración del videojuego Donkey Kong Bananza y no guardan ninguna relación con este adaptador, por lo que se descartan como fuentes.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB en disco, pero necesita el modelo base para funcionar: no es autónomo.
- Inferencia con el modelo base en bf16: aproximadamente 16 GB solo de pesos, más caché KV. Con 32 capas, 8 cabezas KV y dimensión de cabeza 128, la caché consume unos 128 KB por token en fp16, es decir, unos 16 GB adicionales si se llena la ventana completa de 128.000 tokens.
- Cuantización de 8 bits: alrededor de 8-9 GB de pesos. Cuantización de 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4,7-5,5 GB, apta para GPU de consumo con contextos moderados.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para bf16 con contexto medio o 4 bits con contexto amplio; A100 40/80 GB y H100 para servir a varios usuarios con contexto largo; RTX 3060 12 GB o RTX 4060 Ti 16 GB para pruebas en 4 bits con ventanas cortas.
- Sí cabe en GPU de consumo: en 4 bits es viable desde 8 GB de VRAM con contexto reducido, aunque la caché KV a 128.000 tokens hace inviable la ventana completa en tarjetas de gama media.
- Opciones de despliegue: Transformers + PEFT para experimentación; vLLM con `--enable-lora` para servir el adaptador sobre una instancia compartida del modelo base; TGI con soporte de adaptadores; llama.cpp u Ollama solo tras fusionar el adaptador en el modelo base y convertir a GGUF, ya que estos motores no consumen safetensors LoRA directamente.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

La ausencia de evaluación publicada impide comparar rendimiento. La tabla recoge únicamente diferencias estructurales y de licencia.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA r64 sobre Llama 3.1 8B) | 8.030 M en el base + adaptador de 0,7 GB | 128.000 tokens (heredado) | QA médico con RAFT, 5 documentos y CoT (según identificador) | No disponible en HuggingFace; se hereda la Llama 3.1 Community License del base | Repositorio PEFT, sin descargas ni evaluación |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Uso general, ajustado con instrucciones y preferencias | Llama 3.1 Community License | Ampliamente desplegado y evaluado |
| Adaptadores médicos abiertos sobre Llama (por ejemplo, variantes de Meditron o modelos biomédicos de 7-8B) | 7.000-8.000 M | Variable, habitualmente 4.000-8.000 tokens | Dominio clínico y biomédico | Apache 2.0 o licencia del modelo base, según el caso | Repositorios públicos con model cards más completas |

Frente al modelo base Instruct, este adaptador sacrifica versatilidad general a cambio de una especialización no verificada. Frente a otros adaptadores médicos abiertos, la diferencia principal no es técnica sino de trazabilidad: aquí falta la licencia, la descripción del dataset y cualquier métrica.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace: no hay información sobre datos de entrenamiento, hiperparámetros, sesgos ni uso previsto.
- No se declara licencia. Aunque el modelo base impone la Llama 3.1 Community License, la ausencia de términos propios genera incertidumbre jurídica para uso comercial; conviene contactar con el autor antes de desplegarlo.
- El repositorio acumula 0 descargas y 0 «likes», y se publicó sin ninguna validación comunitaria conocida.
- No existe ningún resultado de benchmark ni evaluación cualitativa publicados.
- La fecha de creación indicada (12 de septiembre de 2026) es posterior a la fecha habitual de referencia y sugiere un posible error de metadatos o un entorno de pruebas; conviene verificarla.
- Ambigüedad sobre el modelo base real: la etiqueta apunta a `meta-llama/Llama-3.1-8B` y el nombre a la variante Instruct. Si el ajuste se hizo sobre el checkpoint base, el adaptador puede no responder correctamente a plantillas de chat.
- Riesgo de alucinación especialmente grave en dominio sanitario: un modelo de 8.000 millones de parámetros puede fabricar dosis, interacciones farmacológicas o referencias bibliográficas con total fluidez.
- Un rango LoRA de 64 es alto para un ajuste de dominio y aumenta la probabilidad de olvido catastrófico de las capacidades generales del modelo base, incluido el tool calling.
- Sesgos desconocidos: al no documentarse la composición del corpus médico, no puede evaluarse el sesgo demográfico, lingüístico ni geográfico de las respuestas.
- Cobertura idiomática del ajuste sin verificar: aunque el modelo base soporta español, no hay evidencia de que el corpus médico de entrenamiento incluyera textos en castellano.
- No es un producto sanitario: carece de marcado CE, validación clínica o conformidad con el Reglamento europeo de IA para usos de alto riesgo. No debe usarse para diagnóstico ni tratamiento sin supervisión profesional.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_P100_5DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Variante Instruct del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia de LoRA: «LoRA: Low-Rank Adaptation of Large Language Models» (Hu et al., 2021)
- Paper de referencia de RAFT: «RAFT: Adapting Language Model to Domain Specific RAG» (Zhang et al., 2024)
- Calculadora de impacto de carbono citada en la plantilla: https://mlco2.github.io/impact
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a guías sobre el videojuego Donkey Kong Bananza), por lo que no se incluyen como fuentes.
