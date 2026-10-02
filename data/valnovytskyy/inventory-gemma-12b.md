# valnovytskyy/inventory-gemma-12B

## Resumen

inventory-gemma-12B es un ajuste fino comunitario publicado por el usuario valnovytskyy sobre Gemma 3 12B IT (los ficheros del repositorio se denominan `gemma-3-12b-it.*`) y convertido a formato GGUF con la libreria Unsloth. Se trata de un modelo denso de 11.766.034.176 parametros (unos 11,77B, segun los metadatos de safetensors del repositorio) con capacidad multimodal de imagen y texto: el repositorio incluye un proyector multimodal independiente (`gemma-3-12b-it.F16-mmproj.gguf`), lo que confirma la existencia de un codificador visual separado del modelo de lenguaje. El nombre del repositorio sugiere una especializacion en tareas de inventario, pero la ficha del autor no documenta ni el conjunto de datos ni el objetivo concreto del ajuste.

Su relevancia practica es hoy limitada y muy reciente: el repositorio se creo el 1 de octubre de 2026, acumula 0 descargas y 0 likes, y no incluye resultados de evaluacion. Se distribuye unicamente en F16 GGUF (24,4 GB de repositorio completo), de modo que para desplegarlo en hardware de consumo hay que cuantizarlo previamente con llama.cpp.

Las etiquetas declaradas en la ficha son `gguf`, `gemma3`, `llama.cpp`, `unsloth`, `vision-language-model`, `endpoints_compatible`, `region:us` y `conversational`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (vision-language) de la familia Gemma 3, con proyector multimodal separado (fichero `mmproj`). Detalle de capas y mecanismo de atencion: no disponible |
| Parametros totales | 11.766.034.176 (11,77B, segun los metadatos de safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la ficha del autor. La documentacion del modelo base Gemma 3 12B cita 128.000 tokens (fuente: Doubleword) |
| Tipos de cuantizacion | Solo F16 GGUF publicado por el autor (`gemma-3-12b-it.F16.gguf`). No se publican Q4, Q5, Q8 ni otras; pueden generarse localmente con llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la ficha del modelo |
| Formato de pesos | GGUF F16 (dos ficheros: modelo de lenguaje y proyector multimodal). Los metadatos del repositorio declaran parametros en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Gemma 3 12B IT: un transformer decoder-only multimodal que procesa texto e imagenes. La presencia de un fichero `mmproj` independiente en el repositorio indica que el pipeline multimodal consta de un codificador visual seguido de un proyector que inyecta las representaciones visuales en el modelo de lenguaje, tal como se usa en llama.cpp mediante `llama-mtmd-cli`. No se dispone de informacion sobre numero de capas, dimensiones ocultas, tipo de atencion ni relacion entre atencion local y global en la informacion proporcionada.

Respecto al entrenamiento, la unica informacion disponible es que el autor realizo un ajuste fino y la conversion a GGUF con Unsloth, y que el proceso fue "2x mas rapido" gracias a esa libreria. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra fase de alineamiento posterior, y si el ajuste cubrio unicamente texto o tambien el proyector visual. La ficha solo menciona un ajuste del comportamiento del token BOS para mejorar la compatibilidad con GGUF. Nota importante: los resultados de busqueda mezclan informacion de Gemma 3 12B con la de Gemma 4 12B, que es una generacion distinta y no el modelo base de este repositorio.

## Capacidades

- Generacion de texto conversacional en multiples turnos (etiqueta `conversational` declarada por el autor).
- Comprension de imagenes: es un modelo vision-language y el repositorio incluye el proyector multimodal necesario; el uso multimodal se realiza con `llama-mtmd-cli -hf valnovytskyy/inventory-gemma-12B --jinja`.
- Inferencia solo texto mediante `llama-cli -hf valnovytskyy/inventory-gemma-12B --jinja`.
- Uso directo de la plantilla de chat del modelo mediante la opcion `--jinja` de llama.cpp.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite servirlo tras una API.
- Especializacion probable en dominio de inventario segun el nombre del repositorio: no confirmada en la ficha.
- Razonamiento, matematicas, generacion de codigo, tool calling, function calling, uso como agente, capacidades multilingues y modo "thinking": no confirmados ni documentados en la informacion disponible.

## Casos de uso

- Catalogacion de productos a partir de fotografias: el modelo acepta imagen y texto en una sola peticion, por lo que se puede enviar la foto de un articulo junto a una instruccion para obtener nombre, categoria y descripcion estructurada. Es el caso de uso mas coherente con un ajuste orientado a inventario y con la naturaleza vision-language del modelo base.
- Asistente conversacional local para operarios de almacen: con una cuantizacion Q4_K_M (unos 7 GB) el modelo cabe en una GPU de consumo y permite responder consultas sobre procedimientos o referencias sin enviar datos a la nube.
- Generacion de fichas y descripciones de producto: redaccion de textos comerciales o tecnicos a partir de datos de entrada, ejecutable en local para evitar filtraciones de catalogo.
- Procesamiento por lotes de documentos escaneados o etiquetas: lectura de imagenes de albaranes, etiquetas o estanterias y extraccion de texto estructurado en un pipeline offline con llama.cpp.
- Prototipado como base para nuevos ajustes finos: al haberse generado con Unsloth, es una base razonable para experimentar con LoRA sobre dominio propio antes de invertir en modelos mayores.
- Sustitucion de APIs propietarias en entornos con requisitos de privacidad: la etiqueta `endpoints_compatible` permite exponerlo tras una API compatible con el cliente habitual, manteniendo los datos dentro de la infraestructura propia. Requiere verificar antes la licencia.
- Investigacion sobre multimodalidad de tamano medio: comparar el comportamiento del ajuste frente al Gemma 3 12B IT original en tareas de descripcion de imagenes y dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y tampoco se han encontrado evaluaciones de terceros para este repositorio concreto.

## Requisitos de hardware

- Pesos en F16: aproximadamente 23,5 GB (11,77B parametros x 2 bytes). El repositorio completo ocupa 24,4 GB, incluyendo el proyector multimodal.
- VRAM estimada para inferencia: F16 en torno a 26-28 GB contando cache KV y contexto; Q8_0 unos 14-15 GB; Q6_K unos 11-12 GB; Q5_K_M unos 10 GB; Q4_K_M unos 8-9 GB; Q3_K_M unos 7 GB. Estimaciones aritmeticas a partir del numero de parametros; no verificadas por el autor.
- GPU recomendadas para F16: A100 40 GB, H100 80 GB o dos RTX 4090/3090 de 24 GB. En una sola GPU de 24 GB el F16 no entra con contexto util.
- GPU de consumo: con Q4_K_M o Q5_K_M cabe en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y en equipos Apple Silicon con 16 GB de memoria unificada o mas. Para uso multimodal hay que sumar la memoria del proyector.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal, ambos indicados en la ficha), Ollama (con la salvedad de que no admite ficheros `mmproj` separados, segun advierte el propio autor), vLLM o TGI si se reconvierte a safetensors, y servidores locales compatibles con GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| valnovytskyy/inventory-gemma-12B | 11,77B (denso) | No disponible (base Gemma 3: 128.000 tokens) | Si, imagen y texto, con `mmproj` | No disponible | GGUF F16 en HuggingFace; 0 descargas |
| google/gemma-3-12b-it | ~12B (denso) | 128.000 tokens segun Doubleword | Si, imagen y texto | No disponible en las fuentes consultadas | Modelo oficial de Google en HuggingFace |
| Gemma 4 12B | No disponible | No disponible | Si, "encoder-free" con audio y video nativos segun el blog de Google | No disponible | Anunciado por Google; generacion posterior a Gemma 3 |

Advertencia: Gemma 4 12B pertenece a la generacion siguiente y no es el modelo base de este repositorio. La comparativa con el Gemma 3 12B IT oficial es la relevante para valorar el efecto del ajuste fino, pero no se dispone de evaluaciones que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- Modelo comunitario sin validacion externa: 0 descargas y 0 likes en el momento de redactar esta ficha, y sin benchmarks publicados.
- Licencia no declarada en la ficha. El modelo base es de Google, por lo que previsiblemente esta sujeto a los terminos de uso de Gemma, pero esa condicion no se especifica en el repositorio. Antes de cualquier uso comercial hay que verificar la licencia con el autor y con los terminos del modelo original.
- Ausencia total de informacion sobre el dataset de ajuste: no se pueden evaluar sesgos introducidos, riesgo de sobreajuste al dominio de inventario ni degradacion de capacidades generales respecto al modelo base.
- Riesgo de alucinacion propio de los modelos de lenguaje: en tareas de extraccion de datos de inventario (cantidades, referencias, precios) puede generar valores plausibles pero incorrectos. Requiere validacion automatica aguas abajo.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto en castellano mas alla de lo que herede del modelo base.
- El autor advierte de que el comportamiento del token BOS se ajusto para la compatibilidad con GGUF; esto puede provocar diferencias sutiles de comportamiento respecto al modelo original.
- Limitacion de despliegue multimodal: Ollama no admite ficheros `mmproj` separados, por lo que hay que fusionar el modelo en bf16 y crear una version unificada, lo que aumenta el peso y la memoria necesaria.
- El unico formato publicado es F16: 24,4 GB de descarga y no apto para GPUs de consumo sin cuantizar previamente. No hay ficheros ligeros listos para usar.
- Fechas de creacion y actualizacion muy proximas entre si (1 de octubre de 2026, con unos cuatro minutos de diferencia), lo que sugiere un repositorio sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/valnovytskyy/inventory-gemma-12B
- Modelo base Gemma 3 12B IT: https://huggingface.co/google/gemma-3-12b-it
- Unsloth (libreria usada para el ajuste y la conversion): https://github.com/unslothai/unsloth
- Ficha de Gemma 3 12B en Doubleword (contexto de 128.000 tokens): https://doubleword.ai/models/gemma-3-12b
- Guia para desarrolladores de Gemma 4 12B (modelo distinto, generacion posterior): https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Analisis visual de Gemma 4 12B: https://theja-vanka.github.io/blogs/posts/news/gemma/
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
