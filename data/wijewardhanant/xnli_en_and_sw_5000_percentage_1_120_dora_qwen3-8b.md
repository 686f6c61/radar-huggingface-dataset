# WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_DoRA_Qwen3-8b

## Resumen

Este repositorio contiene un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) entrenado sobre el checkpoint preentrenado Qwen3-8B-Base. El nombre del repositorio, `xnli_en_and_sw_5000_percentage_1_120_DoRA_Qwen3-8b`, sugiere que el ajuste se ha realizado sobre la tarea XNLI (inferencia de lenguaje natural entre pares de frases, con las etiquetas implicacion, neutral y contradiccion) en ingles y suajili, con un rango de adaptacion de 120, un subconjunto de 5000 ejemplos y algun tipo de muestreo o particion identificada como "percentage_1". Ninguno de esos extremos esta documentado en la model card, que es la plantilla por defecto de HuggingFace sin rellenar.

El modelo no resuelve un problema de generacion abierta: es un adaptador de tarea sobre un modelo base denso de 8,2 mil millones de parametros, pensado para producir una de tres etiquetas de relacion logica entre una premisa y una hipotesis. Su relevancia practica es doble: por un lado, explora el ajuste eficiente en parametros (PEFT) con DoRA de rango alto sobre un modelo grande; por otro, aborda el suajili, un idioma de bajos recursos con escasa cobertura en datasets de NLI.

El repositorio pesa 0,7 GB, contiene unicamente los pesos del adaptador en safetensors y declara 0 descargas y 0 "likes" en el momento de la consulta. No se ha publicado informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas oficiales ni resultados de evaluacion, por lo que buena parte de las especificaciones que siguen figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA sobre transformador decoder-only denso (Qwen3-8B-Base) |
| Parametros totales | 8,2 mil millones en el modelo base; parametros del adaptador no disponibles (el nombre sugiere rango 120) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base Qwen3-8B declara 32 768 tokens nativos, ampliables a 131 072 con YaRN segun su documentacion publica |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador se distribuyen sin cuantizar; la cuantizacion es posible tras fusionar el adaptador con el modelo base |
| Idiomas soportados | Ingles y suajili, inferidos del identificador del repositorio (`xnli_en_and_sw`); no documentado por el autor |
| Licencia | No disponible. El modelo base Qwen3-8B-Base se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, libreria `peft` 0.17.1) |

Nota sobre el tamano: el repositorio ocupa 0,7 GB. Ese volumen es coherente con un adaptador de rango 120 aplicado a todas las capas lineales en bf16 (del orden de 3,5 x 10^8 parametros), pero el autor no especifica los modulos objetivo ni el uso de `target_modules`, por lo que se trata de una estimacion, no de un dato confirmado.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformador decoder-only denso de Qwen3 con atencion por consultas agrupadas (GQA) y 8,2 mil millones de parametros. Sobre el se aplica DoRA, una variante de LoRA que descompone cada matriz de pesos preentrenada en un vector de magnitud y una matriz de direccion; el adaptador de bajo rango se entrena sobre la direccion y la magnitud se entrena por separado. Este esquema busca acercar la dinamica de aprendizaje del ajuste de bajo rango a la del ajuste completo sin incrementar de forma apreciable el coste de inferencia, ya que los pesos se pueden fusionar tras el entrenamiento.

No hay informacion publicada sobre el procedimiento de entrenamiento: se desconocen el numero de tokens vistos, la composicion exacta del dataset (el identificador apunta a XNLI en ingles y suajili, con 5000 ejemplos y una particion denominada "percentage_1"), la tasa de aprendizaje, el numero de epocas, el optimizador, si se aplico enmascaramiento solo sobre la respuesta o si hubo alguna fase de RLHF o DPO. Tampoco se documenta si se anadio una cabeza de clasificacion sobre el token de ultimo estado o si el ajuste se hizo de forma generativa con un verbalizador de etiquetas. El unico dato tecnico confirmado es la version de PEFT empleada (0.17.1) y que el checkpoint de partida es Qwen3-8B-Base, es decir, un modelo preentrenado sin post-entrenamiento conversacional.

## Capacidades

- Clasificacion de inferencia textual (NLI) en tres clases: implicacion, neutral y contradiccion, segun el dataset inferido del nombre del repositorio.
- Procesamiento de pares de frases (premisa e hipotesis) en lugar de una unica secuencia.
- Cobertura bilingue ingles-suajili, segun el identificador del repositorio; no confirmada en la model card.
- Transferencia potencial a tareas de clasificacion de pares de frases relacionadas (parafrasis, deteccion de contradicciones, verificacion de afirmaciones), pendiente de evaluacion.
- Generacion de texto: heredada del modelo base Qwen3-8B-Base, pero no es la funcion para la que se ha ajustado el adaptador y no hay evidencia de que se conserve intacta.
- Soporte de tool calling o function calling: no documentado. El checkpoint base es un modelo preentrenado sin post-entrenamiento de instrucciones, por lo que no se le presupone esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking": no aplicable a este adaptador; Qwen3-8B-Base no incorpora las variantes hibridas de razonamiento de la familia instruct.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Verificacion de afirmaciones en ingles y suajili: dada una frase de evidencia y una afirmacion generada por otro sistema, el adaptador clasifica si la evidencia implica, contradice o es neutral respecto a la afirmacion. Es util como filtro de alucinaciones en pipelines de generacion aumentada por recuperacion (RAG), aunque requiere un umbral calibrado que no se ha publicado.
- Curación de corpus bilingues: deteccion de pares contradictorios o duplicados semanticos al consolidar documentacion tecnica o administrativa en ingles y suajili, reduciendo el ruido antes de indexar en un buscador.
- Evaluacion de calidad de traduccion automatica: comparar una hipotesis de traduccion con una referencia y usar la salida de NLI como senal complementaria de adecuacion. La cobertura de suajili es relevante aqui, ya que es un par de idiomas con pocos recursos de evaluacion.
- Asistencia a la anotacion de datos para idiomas de bajos recursos: preetiquetar pares de frases en suajili con las tres clases de NLI y reservar la revision humana para los casos de baja confianza, acelerando la creacion de datasets locales.
- Analisis de coherencia en documentacion normativa: comprobar si dos clausulas de un contrato o politica se contradicen, usando el modelo como primer filtro antes de la revision juridica. La limitacion de idioma (ingles y suajili) restringe su uso directo en castellano.
- Investigacion en eficiencia de ajuste: servir como punto de partida para estudiar el efecto del rango (120 en este caso) y del tamano del subconjunto de datos en la transferencia cross-lingue de DoRA frente a LoRA, replicando el protocolo con otras particiones.
- Filtrado previo en moderacion de contenido: combinar el modelo con reglas para detectar respuestas que contradicen una politica publicada, siempre con supervision humana dado que no hay metricas de falsos positivos publicadas.
- Compatibilidad como componente de un sistema mayor: el adaptador se puede fusionar con el modelo base y exponer mediante una API interna; no obstante, al ser un modelo de clasificacion de tres clases, no sustituye a un modelo conversacional en atencion al cliente sin un entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card contiene la plantilla por defecto con todos los campos de evaluacion marcados como "More Information Needed", y el repositorio no incluye ningun informe de exactitud sobre el conjunto de evaluacion de XNLI ni sobre subconjuntos en ingles o suajili.

## Requisitos de hardware

Estimaciones para inferencia, calculadas a partir del modelo base Qwen3-8B (8,2 mil millones de parametros); el adaptador anade un coste marginal despreciable y puede fusionarse con los pesos base:

- VRAM para pesos en bf16/fp16: aproximadamente 16,4 GB solo para los pesos, mas cache KV.
- VRAM en int8: aproximadamente 8,5-9,5 GB.
- VRAM en Q4_K_M (GGUF): aproximadamente 5-6 GB.
- Cache KV estimada, suponiendo la configuracion del modelo base (36 capas, 8 cabezas KV, dimension de cabeza 128, fp16): unos 4,8 GB para 32 768 tokens y unos 19 GB para 131 072 tokens. Son valores orientativos, no confirmados para este adaptador.
- GPU de centro de datos: A100 40 GB o 80 GB y H100 para bf16 con contexto largo; L40S o A6000 como alternativas de 48 GB.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en cuantizacion de 4 u 8 bits con contexto moderado; en bf16 queda muy ajustado si se usa contexto largo. En tarjetas de 12 GB (RTX 3060, RTX 4070) solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre Qwen3-8B-Base; `merge_and_unload` para fusionar y exportar; vLLM con `--enable-lora` o TGI con soporte de adaptadores para servir varias variantes; conversion a GGUF para llama.cpp u Ollama, que exige fusionar previamente el adaptador.
- Latencia y throughput: no disponibles. La tarea de clasificacion de pares de frases es de una sola pasada, por lo que la latencia dependera mas de la longitud de las secuencias y del batch que del modelo en si.
- Entrenamiento o ajuste adicional: el rango 120 implica un estado de optimizador mayor que un LoRA convencional de rango 8-32; para reproducir un ajuste similar se recomienda al menos una GPU de 24 GB en bf16 con checkpointing de gradientes y optimizador de 8 bits.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de este adaptador, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA r=120 sobre Qwen3-8B-Base) | 8,2 B base + adaptador no declarado | No disponible (base: 32 768 nativos) | No publicado | No disponible | Repositorio publico con 0 descargas, card sin rellenar |
| LoRA convencional sobre Qwen3-8B-Base para XNLI | 8,2 B base + adaptador de rango tipicamente 8-64 | Igual que el base | No disponible | Depende del autor | Existen multiples adaptadores de la comunidad, sin evaluacion comparable |
| Ajuste completo de Qwen3-8B-Base en XNLI | 8,2 B | Igual que el base | No disponible | Apache 2.0 en el base | Requiere decenas de GB de VRAM y checkpoints de decenas de GB |
| XLM-R large ajustado en XNLI | 560 M | 512 tokens | Referencia historica de XNLI (exactitud publicada en el paper original, no verificada aqui) | MIT segun su repositorio | Ampliamente disponible |

La comparacion directa con alternativas de la misma categoria (adaptadores NLI sobre modelos multilingues) no es posible sin metricas publicadas por parte del autor.

## Limitaciones y advertencias

- Model card vacia: el autor no documenta datos de entrenamiento, hiperparametros, metricas ni uso previsto. Cualquier uso en produccion exige una evaluacion propia previa.
- Licencia no especificada: al no declararse licencia para el adaptador, no hay certeza juridica sobre el uso comercial, incluso aunque el modelo base se distribuya bajo Apache 2.0.
- Es un adaptador, no un modelo autonomo: requiere descargar Qwen3-8B-Base (unos 16 GB) y cargarlo con PEFT; no funciona de forma aislada.
- Modelo base sin post-entrenamiento: Qwen3-8B-Base no incorpora plantilla de chat ni alineacion con instrucciones, por lo que no cabe esperar un comportamiento conversacional util sin un ajuste adicional.
- Tarea restringida: XNLI es una clasificacion de tres clases sobre pares de frases. Las respuestas seran etiquetas, no texto libre; el uso generativo no esta validado.
- Cobertura idiomatica limitada: ingles y suajili, inferidos del nombre. No hay evidencia de soporte para castellano ni para el resto de los 15 idiomas de XNLI.
- Riesgo de olvido catastrofico: un ajuste con rango 120 sobre todas las capas puede degradar capacidades generales del modelo base; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Riesgo de sesgo: XNLI se construye a partir de textos de noticias y anotaciones con sesgos culturales; el subconjunto en suajili, ademas, suele ser una traduccion de material original en ingles, lo que puede trasladar sesgos de la lengua de origen.
- Riesgo de alucinacion y de etiquetado erroneo: sin metricas de calibracion publicadas no es posible fijar umbrales de confianza fiables; se recomienda validacion humana en decisiones sensibles.
- Ambiguedad del identificador: los terminos "5000" y "percentage_1" no estan explicados; no se puede saber si se refieren al numero de ejemplos totales, al numero por idioma o a un porcentaje del corpus completo.
- Repositorio sin traccion: 0 descargas y 0 "likes", creado y actualizado el 21 de septiembre de 2026 sin cambios posteriores segun los metadatos. No hay comunidad que haya reportado resultados de reproducibilidad.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; unicamente paginas corporativas de Microsoft, sin relacion con este repositorio.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_DoRA_Qwen3-8b
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper de LoRA (referencia del marco PEFT): https://arxiv.org/abs/2106.09685
- Paper de DoRA, Weight-Decomposed Low-Rank Adaptation: https://arxiv.org/abs/2402.09353
- Paper de XNLI: https://arxiv.org/abs/1809.05053
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
