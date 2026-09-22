# WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_40_VeRA

## Resumen

WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_40_VeRA es un adaptador PEFT publicado en Hugging Face por el usuario WijewardhanaNT. Se trata de un ajuste de tipo VeRA (una variante de bajo rango, en la que se entrenan vectores de escalado sobre matrices aleatorias congeladas) aplicado sobre el modelo base meta-llama/Llama-3.1-8B. El repositorio contiene únicamente los pesos del adaptador en safetensors (0,1 GB), no el modelo completo, y requiere la librería peft 0.17.1 para cargarse.

El nombre del repositorio apunta a un ajuste sobre TyDi QA, el benchmark de respuesta a preguntas extractivas en lenguas tipológicamente diversas, en su par de idiomas inglés y telugu, con 3000 ejemplos y algún tipo de fraccionamiento del conjunto de datos entre el 1 % y el 40 %. Se trata, por tanto, de un artefacto de experimentación en ajuste eficiente de parámetros sobre una lengua de bajos recursos como el telugu, más que de un modelo listo para producción.

Su relevancia potencial está en dos frentes: por un lado, permite estudiar el comportamiento de VeRA frente a LoRA en tareas de QA multilingüe; por otro, reutiliza un modelo base de 8 000 millones de parámetros con una ventana de contexto de 128 000 tokens, lo que abarata el despliegue porque solo hay que distribuir un adaptador de décimas de GB. Ahora bien, la model card es la plantilla por defecto de Hugging Face, sin ningún campo rellenado: no declara licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados. Con 7 descargas y 0 likes, no existe validación comunitaria alguna.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (VeRA) sobre transformer decoder-only; el modelo base es Llama 3.1 8B |
| Parametros totales | No disponible para el adaptador; el modelo base declara 8 030 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene los pesos del adaptador en safetensors |
| Idiomas soportados | Inferido del nombre del repositorio: ingles y telugu. No declarado en la model card |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT; no incluye pesos del modelo base) |

Datos adicionales del repositorio: autor WijewardhanaNT, 7 descargas, 0 likes, tamano de 0,1 GB, creado el 22 de septiembre de 2026, libreria peft, version de PEFT 0.17.1, sin pipeline de inferencia declarado y sin endpoint publico.

## Arquitectura y entrenamiento

El artefacto es un adaptador, no un modelo completo. El modelo base, meta-llama/Llama-3.1-8B, es un transformer decoder-only de 8 030 millones de parametros con atencion de consultas agrupadas (GQA), tokenizador de 128 000 entradas y ventana de contexto de 128 000 tokens. El sufijo VeRA del nombre indica que el ajuste emplea adaptacion basada en matrices aleatorias congeladas compartidas entre capas, con vectores de escalado entrenables; el numero de parametros entrenables de un adaptador de este tipo es varios ordenes de magnitud inferior al de un LoRA convencional. La model card no confirma esta configuracion ni documenta el rango, las capas objetivo ni los hiperparametros reales.

Respecto a los datos, el nombre del repositorio sugiere el uso de TyDi QA (tarea de respuesta a preguntas extractivas en 11 lenguas tipologicamente diversas, entre ellas el telugu) restringido a ingles y telugu, con 3000 ejemplos y un fraccionamiento del 1 % al 40 %. No se especifica si 3000 es el numero de ejemplos de entrenamiento, de validacion o de una particion concreta, ni a que se refiere el rango 1-40. No hay informacion sobre regimen de entrenamiento (precision, epocas, tasa de aprendizaje, optimizador), sobre si hubo RLHF o DPO, ni sobre ninguna innovacion tecnica adicional. La unica referencia bibliografica presente en el repositorio, arXiv:1910.09700, corresponde a la calculadora de impacto medioambiental citada en la plantilla por defecto de Hugging Face, no a un paper de este modelo.

## Capacidades

- Generacion de texto y respuesta a preguntas: al heredar el modelo base, el sistema completo puede generar texto libre y responder preguntas, aunque el ajuste esta orientado a QA extractiva sobre contexto.
- Respuesta a preguntas extractivas (span extraction) en ingles y, presumiblemente, en telugu, dado el nombre del repositorio.
- Comprension lectora con contexto largo: el modelo base admite hasta 128 000 tokens, por lo que el adaptador puede operar sobre documentos extensos siempre que el ajuste no haya degradado esa capacidad (no verificado).
- Capacidades multilingues limitadas al par ingles-telugu declarado en el nombre; el resto de lenguas de Llama 3.1 no han sido ajustadas ni evaluadas para esta tarea.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (el modelo base lo soporta, pero no hay evidencia de que el ajuste lo preserve).
- Soporte de agentes y razonamiento multi-paso: no disponible; el ajuste sobre QA extractiva no implica capacitacion para trayectorias de agente.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de vision o audio: no disponibles; el modelo base es exclusivamente textual.
- Capacidad especial: ninguna documentada mas alla del propio ajuste VeRA.

## Casos de uso

- Extraccion de respuestas sobre documentacion administrativa en telugu: el adaptador puede conectarse a un corpus de circulares, formularios o normativa en telugu y devolver el fragmento que responde a una consulta concreta. Es adecuado porque existen muy pocos modelos abiertos ajustados especificamente en telugu para esta tarea.
- Pipeline RAG multilingue: combinado con un recuperador vectorial, el adaptador puede formular la respuesta final a partir de los pasajes recuperados, cubriendo consultas en ingles y telugu dentro de la misma aplicacion.
- Investigacion en ajuste eficiente de parametros: sirve como punto de comparacion empirico entre VeRA y LoRA sobre el mismo modelo base y la misma tarea, dado el bajo coste de almacenamiento del adaptador (0,1 GB).
- Prototipado rapido de asistentes de lectura comprensiva: al cargar un unico adaptador sobre una instancia compartida de Llama 3.1 8B se pueden servir varias tareas con un consumo de VRAM apenas superior al del modelo base.
- Atencion al cliente en telugu sobre base documental: integrado en un sistema de FAQs o manuales de producto, el adaptador puede localizar la respuesta exacta en la documentacion en lugar de generar texto libre, lo que reduce el riesgo de invencion si se restringe la salida a spans.
- Anotacion asistida y generacion de conjuntos de datos QA: puede utilizarse como preanotador para crear pares pregunta-respuesta en telugu que despues se revisen manualmente, acelerando la construccion de corpus para lenguas indias.
- Evaluacion comparativa de tecnicas PEFT en lenguas de bajos recursos: util como linea base en estudios academicos sobre transferencia cross-lingue desde ingles hacia telugu.
- No se recomienda su uso en produccion critica sin una evaluacion previa, dado que no existe ninguna metrica publicada ni validacion por terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla por defecto de Hugging Face y no incluye la seccion de evaluacion cumplimentada, ni metricas de TyDi QA (F1, exact match), ni comparaciones con otros adaptadores o con el modelo base sin ajustar. Tampoco se han encontrado resultados en la busqueda web.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, por lo que su almacenamiento y transferencia son triviales; el coste real lo determina el modelo base.
- Inferencia del modelo base en fp16/bf16: aproximadamente 16 GB de VRAM solo para pesos, mas cache KV; con 128 000 tokens de contexto la cache KV puede superar varias decenas de GB, por lo que en la practica conviene limitar la ventana.
- Inferencia cuantizada a 8 bits: alrededor de 9-10 GB de VRAM.
- Inferencia cuantizada a 4 bits (Q4_K_M o similar): aproximadamente 5-6 GB de VRAM.
- GPU de datacenter recomendadas: A100 40 GB u 80 GB, H100, L40S, con margen para lotes grandes y contexto largo.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) en fp16 con contexto moderado; RTX 4080, 4070 Ti Super o 3060 de 12 GB solo con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers con peft (carga del adaptador sin fusionar), vLLM y TGI (previa fusion del adaptador en los pesos base), llama.cpp y Ollama (requieren convertir el modelo fusionado a GGUF). No hay cuantizaciones GGUF publicadas en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en TyDi QA |
|---|---|---|---|---|---|
| Este adaptador (VeRA sobre Llama-3.1-8B) | Adaptador de bajo rango; base de 8 030 M | No disponible (base: 128 000 tokens) | No disponible | Repositorio publico, 7 descargas | No publicado |
| meta-llama/Llama-3.1-8B (modelo base sin ajustar) | 8 030 M | 128 000 tokens | Licencia comunitaria de Llama 3.1 | Ampliamente disponible | No publicado para este adaptador |
| Adaptadores LoRA equivalentes sobre Llama-3.1-8B para QA multilingue | Depende del rango | Heredado del base | Habitualmente la del base | Multiples repositorios, con datos muy dispares | No comparable con los datos disponibles |
| Modelos de QA especificos para lenguas indias (por ejemplo, familia IndicBERT o similares) | Cientos de millones | Limitado (tipicamente 512 tokens) | Variable | Variable | No disponible en la informacion proporcionada |

No se han identificado en la informacion disponible adaptadores VeRA comparables publicados sobre el mismo modelo base y la misma tarea, ni cifras verificables que permitan una comparacion cuantitativa. La comparativa anterior es estructural (parametros, contexto, licencia) y no de rendimiento.

## Limitaciones y advertencias

- Model card vacia: todos los campos de la plantilla estan sin rellenar ("More Information Needed"). No hay informacion sobre desarrollador, financiacion, uso previsto, datos o evaluacion.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar de meta-llama/Llama-3.1-8B, es probable que se apliquen los terminos de la licencia comunitaria de Llama 3.1, que incluye obligaciones de atribucion y condiciones para productos con mas de 700 millones de usuarios mensuales, pero esto no esta confirmado por el autor.
- Sin validacion: 7 descargas y 0 likes indican que practicamente nadie ha verificado el comportamiento del adaptador.
- Datos de entrenamiento opacos: se desconoce la composicion exacta, el preprocesamiento, el numero real de ejemplos y el significado del sufijo "percentage_1_40". Con 3000 ejemplos es plausible un sobreajuste al conjunto, pero no puede confirmarse.
- Idiomas no declarados oficialmente: ingles y telugu son una inferencia del nombre del repositorio, no un dato de la model card.
- Riesgo de alucinacion: aunque la tarea sea extractiva, el modelo base es generativo y puede producir respuestas plausibles pero incorrectas, especialmente fuera del dominio de TyDi QA.
- Herencia de sesgos del modelo base: el adaptador no incorpora ningun mecanismo de mitigacion de sesgos propio.
- Cobertura limitada de lenguas indias: el ajuste solo cubre telugu; el rendimiento en otras lenguas dravidicas o indoarias no esta documentado.
- Uso en produccion desaconsejado sin evaluacion propia: no existen metricas, pruebas de regresion ni informes de robustez.
- Compatibilidad: requiere peft 0.17.1 o superior para cargarse de forma nativa; las herramientas de servido que no soportan adaptadores exigen fusionar previamente los pesos, lo que genera un modelo de 8 000 millones de parametros completo.
- Fecha de creacion del repositorio posterior a la de la informacion de referencia, sin actualizaciones registradas desde entonces.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_40_VeRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia citada en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Conjunto de datos TyDi QA (Clark et al., 2020): mencionado en el nombre del repositorio, sin enlace facilitado por el autor
- Documentacion de PEFT: https://huggingface.co/docs/peft
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a paginas no relacionadas (foros en chino sobre alfabeto frances, conversiones de unidades de almacenamiento, espejos de Wikipedia y letras de canciones) y se descartan por no aportar informacion tecnica.
