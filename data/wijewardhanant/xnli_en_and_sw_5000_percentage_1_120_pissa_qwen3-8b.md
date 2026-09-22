# WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_PiSSA_Qwen3-8b

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA, con inicializacion probablemente PiSSA) entrenado sobre el modelo base Qwen/Qwen3-8B-Base, publicado por el usuario WijewardhanaNT. No es un modelo completo ni un modelo de proposito general: se trata de un ajuste fino orientado a una tarea concreta de inferencia textual (NLI), segun se deduce del identificador del repositorio, que referencia XNLI (inferencia textual en varios idiomas), los idiomas ingles y suajili, un subconjunto de 5000 ejemplos y una configuracion "percentage_1_120". El repositorio pesa 0,5 GB, coherente con un adaptador de bajo rango mas que con pesos completos.

La relevancia de esta ficha es mas metodologica que de producto. La model card publicada es la plantilla por defecto de HuggingFace sin rellenar: todos los apartados (descripcion, datos de entrenamiento, hiperparametros, evaluacion, licencia, impacto ambiental) figuran como "[More Information Needed]". El repositorio acumula 0 descargas y 0 "likes", y no se ha publicado ningun resultado de evaluacion. Por tanto, cualquier uso en produccion exige una validacion independiente previa.

Es importante subrayar que el adaptador se apoya en la variante Base de Qwen3, no en la variante instruct. Esto implica que no hereda alineamiento conversacional ni formato de chat: su comportamiento esperado es el de un modelo de completado de texto afinado para una tarea discriminativa. Los resultados de la busqueda web realizada no aportan informacion sobre el modelo (devuelven exclusivamente hilos de un foro de ciclismo), por lo que esta ficha se limita a los metadatos verificables del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre un transformer denso (modelo base Qwen/Qwen3-8B-Base). Detalles de la arquitectura del adaptador no disponibles |
| Parametros totales | No disponible en la informacion proporcionada. El modelo base Qwen3-8B tiene del orden de 8 000 millones de parametros segun documentacion publica; el adaptador ocupa 0,5 GB en disco |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen3-8B admite hasta 131 072 tokens (32 768 nativos ampliables con YaRN), segun documentacion publica del modelo base |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT es fusionable con el base y posteriormente cuantizable (bitsandbytes, GPTQ, AWQ, GGUF), pero el autor no documenta ninguna |
| Idiomas soportados | No disponible. El identificador del repositorio sugiere ingles y suajili (XNLI: "en_and_sw"); no confirmado por el autor |
| Licencia | No disponible |
| Formato de pesos | safetensors (etiqueta del repositorio); pesos de adaptador PEFT/LoRA, no pesos completos |
| Tarea declarada | text-generation (pipeline_tag), aunque el nombre del repositorio apunta a clasificacion NLI |
| Version de PEFT | 0.17.1 (unica version de framework documentada) |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es que se trata de un adaptador de tipo LoRA cargado mediante la libreria PEFT 0.17.1 sobre Qwen/Qwen3-8B-Base, almacenado en formato safetensors. El nombre del repositorio incluye el token "PiSSA", lo que sugiere que la inicializacion del adaptador no fue la clasica de LoRA (matrices A aleatorias y B a cero) sino PiSSA (inicializacion basada en descomposicion en valores singulares de la matriz de pesos original). Esta interpretacion procede del identificador y no esta confirmada en la model card, que esta vacia.

Tampoco hay informacion sobre el dataset exacto, el numero de tokens vistos, la composicion, la duracion del entrenamiento, la tasa de aprendizaje, el rango o el alpha del adaptador, ni sobre si se aplicaron tecnicas de RLHF o DPO. Por el identificador se puede inferir que el entrenamiento uso XNLI (inferencia textual en lenguaje natural) restringido a ingles y suajili, con un subconjunto de 5000 ejemplos y algun tipo de configuracion parcial ("percentage_1", posiblemente un 1 % del corpus, y "120", posiblemente un rango de LoRA o un numero de pasos). Ninguna de estas hipotesis esta documentada por el autor y deben tratarse como especulacion.

## Capacidades

- Al tratarse de un ajuste sobre la variante Base, la capacidad principal esperada es la de completado de texto sin alineamiento conversacional.
- Clasificacion de pares de frases para inferencia textual (implicacion, neutralidad, contradiccion), presumiblemente en ingles y suajili, si el ajuste se corresponde con el nombre del repositorio.
- Generacion de texto libre: tecnicamente posible, pero el ajuste especifico sobre una tarea discriminativa puede degradar la calidad del texto generado respecto al modelo base.
- Capacidades multilingues heredadas del modelo base: parcialmente, segun la cobertura de Qwen3-8B-Base; no verificadas para este adaptador.
- Soporte de tool calling / function calling: no disponible. No debe asumirse, ya que el adaptador se construye sobre la variante Base y no sobre la Instruct.
- Soporte de agentes y razonamiento multi-paso: no disponible y poco probable sin un ajuste adicional de instrucciones.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.
- Capacidad de fusion con el modelo base para producir un checkpoint completo exportable a otros formatos: si, es una operacion estandar de PEFT, no una capacidad documentada por el autor.

## Casos de uso

- Clasificacion NLI en ingles y suajili: el escenario mas plausible dada la denominacion del repositorio. Se usaria para etiquetar pares premisa-hipotesis como implicacion, neutralidad o contradiccion, con la salvedad de que hay que validar el rendimiento en un conjunto de test propio.
- Investigacion sobre tecnicas PEFT: sirve como punto de partida reproducible para comparar inicializacion PiSSA frente a LoRA clasica en una tarea de clasificacion multilingue con pocos ejemplos (5000 instancias).
- Filtrado de corpus y generacion de etiquetas debiles: en un pipeline de curación de datos, el adaptador podria preetiquetar pares de frases para que un anotador humano revise solo los casos dudosos, reduciendo coste de anotacion. Requiere medir antes la precision del adaptador en el dominio objetivo.
- Verificacion de hechos en pipelines RAG: integrado como comprobador de entailment entre la respuesta generada y los fragmentos recuperados, para descartar afirmaciones no sustentadas por las fuentes. Es un uso realista porque la tarea NLI es exactamente eso, aunque exige umbrales calibrados.
- Deteccion de contradicciones en documentacion tecnica multilingue: comparar versiones de un manual en ingles y suajili para detectar secciones que se contradicen entre si, apoyandose en la ventana de contexto del modelo base.
- Estudio de transferencia cross-lingual: analizar cuanto conocimiento NLI en ingles se transfiere al suajili con un adaptador de bajo rango y un presupuesto de datos reducido, un experimento habitual en publicaciones de PLN de bajos recursos.
- Base para un ajuste posterior: fusionar el adaptador en el modelo completo y continuar el entrenamiento para otra tarea, partiendo de un checkpoint ya adaptado al dominio NLI.
- Docencia y replication de experimentos: ejemplo minimo de como publicar y cargar un adaptador PEFT con transformers, util en cursos de ajuste eficiente de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ningun apartado de evaluacion cumplimentado y la busqueda web no aporto datos. No se dispone de cifras de exactitud en XNLI, MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni de comparaciones con la variante base sin adaptar. Cualquier cifra que se atribuya a este adaptador sin una evaluacion propia seria una invencion.

## Requisitos de hardware

- VRAM para inferencia con el adaptador fusionado en el modelo base de 8 000 millones de parametros (estimacion aritmetica, no un dato del autor): en bf16/fp16, aproximadamente 16-17 GB solo para pesos, mas cache KV, lo que en la practica exige 24 GB o mas.
- En cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos, viable en RTX 3090, RTX 4090 o A100 40 GB.
- En cuantizacion de 4 bits: aproximadamente 5-6 GB, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB y equipos Apple Silicon con memoria unificada de 16 GB o mas.
- Cabe en GPU de consumo: si, en el rango de 4 a 8 bits, con las cifras anteriores como referencia orientativa. En bf16 completo es ajustado incluso en una RTX 4090 de 24 GB si se usan contextos largos.
- El adaptador por si solo ocupa 0,5 GB en disco y requiere el modelo base para funcionar; no es desplegable de forma autonoma.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador directamente (la unica ruta documentada por el autor); vLLM y SGLang admiten adaptadores LoRA en linea y, con mas sencillez, el modelo fusionado; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que no consumen safetensors PEFT directamente; TGI tambien soporta adaptadores, aunque no se ha verificado compatibilidad con esta version concreta.
- GPU recomendadas: no disponibles. El autor no documenta el hardware usado en el entrenamiento ni objetivos de latencia.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

No se ha identificado en la informacion proporcionada ningun adaptador comparable publicado con resultados medibles, y tampoco hay cifras de rendimiento de este repositorio, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de resultados |
|---|---|---|---|---|
| Este adaptador (WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_PiSSA_Qwen3-8b) | Adaptador sobre un base de aprox. 8 000 millones | Heredado del base (hasta 131 072 tokens segun documentacion publica del base) | No disponible | Ninguno publicado |
| Qwen/Qwen3-8B-Base (modelo base) | Aprox. 8 000 millones | 131 072 tokens segun documentacion publica del base | Apache 2.0 segun documentacion publica del base, no verificado en esta ficha | Documentacion y evaluaciones publicas del modelo base, no reproducidas aqui |
| Otros adaptadores LoRA para XNLI | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin completar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto. La trazabilidad del modelo es practicamente nula.
- No se especifica licencia. Sin licencia explicita no hay autorizacion clara para uso comercial, y en algunas jurisdicciones la ausencia de licencia implica reserva de todos los derechos por parte del autor.
- El autor es un usuario individual sin historial verificable en el repositorio (0 descargas, 0 likes). No hay senales de mantenimiento ni de soporte.
- Al derivar de la variante Base de Qwen3, no hay alineamiento conversacional, filtros de seguridad ni formato de chat. El modelo puede producir contenido inapropiado o danino con mas facilidad que una variante instruct.
- Riesgo de alucinacion: alto si se usa para generacion libre, ya que no se ha aplicado ninguna tecnica de alineamiento documentada. Incluso en tareas de clasificacion, un adaptador sobreajustado a 5000 ejemplos puede degradar la calibracion de probabilidades.
- Cobertura idiomatica presumiblemente limitada a ingles y suajili para la tarea ajustada, y a la cobertura del modelo base en generacion general. No hay evaluacion multilingue.
- La composicion exacta del subconjunto de entrenamiento es desconocida: XNLI contiene traducciones profesionales pero tambien sesgos de genero y culturales propios del corpus original. No se ha realizado ninguna auditoria de sesgo sobre este adaptador.
- Riesgo de sobreajuste y de olvido catastrofico: al entrenar solo 5000 ejemplos sobre una tarea discriminativa, es probable que el modelo pierda capacidades generales del base. No cuantificado.
- Toda interpretacion del identificador (PiSSA, porcentaje, rango 120) es una hipotesis del autor de esta ficha, no un dato confirmado por el desarrollador.
- En produccion seria imprescindible evaluar el adaptador en un conjunto de test propio y no confiar en la denominacion del repositorio.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_PiSSA_Qwen3-8b
- Modelo base Qwen/Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Libreria PEFT: https://github.com/huggingface/peft
- Articulo citado en la model card (Lacoste et al., 2019, sobre el calculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico mencionada en la model card: https://mlco2.github.io/impact
- Nota sobre la busqueda web: los resultados obtenidos no contienen informacion relevante sobre este modelo; corresponden a hilos de un foro de ciclismo y se han descartado por completo.
