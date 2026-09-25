# workfunction/McBopomofoLM-models

## Resumen

McBopomofoLM-models es un repositorio de modelos convertidos a Core ML para su ejecucion en el Apple Neural Engine (ANE), publicados por el desarrollador workfunction. No se trata de un modelo de lenguaje de proposito general, sino de la conversion del encoder y el decodificador SlothE que utiliza McBopomofoLM, un fork de McBopomofo que emplea estos modelos para mejorar la seleccion de candidatos en un metodo de entrada (IME) de Zhuyin/Bopomofo para chino tradicional.

El paquete contiene dos modelos diferenciados: un encoder SlothE-T de 25 millones de parametros con pesos ternarios y palettizacion de 2 bits (considerada sin perdida por el autor), y un decodificador `pred_q35_60m` de aproximadamente 60 millones de parametros con arquitectura Qwen3.5 y pesos fp16. Ambos se distribuyen como paquetes Core ML multifuncion y estan pensados exclusivamente para ejecutarse en la ANE con `computeUnits = CPU_AND_NE`.

Su relevancia radica en que demuestra el despliegue de un modelo de lenguaje ligero de correccion de entrada totalmente en dispositivo sobre Apple Silicon, con latencias medidas muy bajas (aproximadamente 0,8 ms por llamada en el encoder y entre 2,6 y 7,9 ms en el decodificador en un M2) y sin dependencia de la nube. El modelo base es `Luigi/sloth-ime-models`, tambien bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SlothE-T mas decodificador basado en Qwen3.5 con Gated DeltaNet (hibrida, con procesamiento en bloques fijos de 16 tokens) |
| Parametros totales | No disponible como valor unico; encoder de 25M y decodificador de aproximadamente 60M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada de forma explicita; las variantes funcionales del encoder son L8/L16/L32/L64/L256 (ventanas de 8 a 256 tokens) y el decodificador expone t16/t32/t64/t96 |
| Tipos de cuantizacion | Encoder en 2 bits palettizado (pesos ternarios); decodificador en fp16; tabla de embeddings en f16 |
| Idiomas soportados | Chino (zh), orientado a mandarin de Taiwan con entrada Zhuyin/Bopomofo |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`, y `.mlmodelc` compilado dentro del bundle `runtime/`) |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO), sino unicamente la conversion a Core ML. El modelo base es `Luigi/sloth-ime-models`, y este repositorio se limita a transformar y empaquetar dichos pesos para el runtime de Apple.

En cuanto a la arquitectura, el encoder es un SlothE-T de 25M con pesos ternarios palettizados a 2 bits, empaquetado como modelo multifuncion con variantes L8, L16, L32, L64 y L256; la busqueda de embeddings se ejecuta en el llamante a partir de `runtime/enc25m_embed_f16.bin`. El decodificador `pred_q35_60m` sigue la arquitectura Qwen3.5 e incorpora capas Gated DeltaNet (mecanismo de atencion lineal/hibrida) que operan en bloques fijos de 16 tokens, con variantes t16/t32/t64/t96 a batch 3. La innovacion tecnica destacable es la orientacion exclusiva a la ANE: ejecucion con `CPU_AND_NE` y un manifest de runtime que verifica tamano y SHA-256 de cada fichero antes de cargarlo.

## Capacidades

- Prediccion de secuencias de caracteres chinos a partir de entrada Zhuyin/Bopomofo como modelo de lenguaje a nivel de caracter.
- Mejora de la seleccion de candidatos dentro del IME McBopomofoLM (reordenacion y puntuacion de candidatos).
- Ejecucion integra en dispositivo sobre el Apple Neural Engine, sin conexion a red.
- Modelos multifuncion que permiten escoger variantes segun la longitud de contexto requerida (encoder L8-L256, decodificador t16-t96).
- Soporte de lotes en el decodificador (batch 3 en las funciones descritas).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agentes ni de razonamiento multi-paso general.
- No dispone de vision ni audio.
- No es un modelo de generacion de texto libre ni de codigo.
- Cobertura multilingue limitada al chino (zh) con foco en tradicion Zhuyin de Taiwan.

## Casos de uso

- Seleccion de candidatos en el IME McBopomofoLM: el modelo puntua y reordena las opciones generadas por el motor de entrada para ofrecer en primer lugar el caracter o la frase mas probable dado el contexto, reduciendo la carga de correccion manual del usuario.
- Prediccion de la siguiente palabra en teclados de chino tradicional: gracias a la variante de contexto mas largo del encoder (L256) el sistema puede anticipar palabras completas a partir de los ultimos caracteres introducidos.
- Entrada de texto en macOS totalmente local: al ejecutarse solo en la ANE y sin red, encaja en aplicaciones de escritorio donde la privacidad y la latencia importan, con tiempos de decodificacion de pocos milisegundos.
- Integracion en editores y procesadores de texto para Taiwan: permite corregir y completar texto en chino tradicional con variantes regionales (TWVariants y HKVariants derivadas de OpenCC) en el mismo flujo de escritura.
- Autocompletado de frases en formularios y busquedas: el decodificador en bloques de 16 tokens permite sugerir continuaciones cortas y frecuentes con latencia estable.
- Base para experimentacion en modelos de lenguaje ligeros en dispositivo: sirve como referencia para convertir y desplegar arquitecturas hibridas con Gated DeltaNet en Core ML y medir su rendimiento real en la ANE.
- Distribucion como bundle verificado: el manifest con SHA-256 permite empaquetar el runtime en aplicaciones que requieren integridad de los ficheros de modelo antes de cargarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento consignados son mediciones de ejecucion en un Apple M2 (ANE): el encoder ejecuta el 100 % de las operaciones en la ANE con aproximadamente 0,8 ms por llamada, y el decodificador ejecuta entre el 86 % y el 95 % de las operaciones en la ANE, con tiempos de 2,6 a 7,9 ms por llamada en funcion de la longitud.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con Neural Engine; la conversion esta diseñada para `computeUnits = CPU_AND_NE`.
- VRAM: no aplica en el sentido convencional; el modelo se ejecuta sobre memoria unificada del sistema Apple. El repositorio completo ocupa aproximadamente 0,1 GB.
- GPU NVIDIA (A100, H100, RTX 4090): no compatibles, ya que el formato es Core ML y depende de la ANE.
- Equipos de referencia medidos: Apple M2 (ANE). No se han publicado mediciones para otros chips.
- Latencia estimada: encoder en torno a 0,8 ms por llamada y decodificador entre 2,6 y 7,9 ms por llamada en M2.
- Opciones de despliegue: Core ML en aplicaciones macOS (el runtime se distribuye dentro de McBopomofoLM v2.1.1). No se contempla vLLM, llama.cpp, Ollama ni TGI, dado el formato y el backend.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| workfunction/McBopomofoLM-models | Encoder 25M + decodificador ~60M | Variantes de 8 a 256 tokens (encoder) y 16 a 96 (decoder) | Core ML | Apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Luigi/sloth-ime-models (modelo base) | No disponible | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Otros modelos de lenguaje para IME de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta especializado en prediccion de caracteres para un IME de Zhuyin/Bopomofo y no debe emplearse para generacion de texto, codigo o razonamiento abiertos.
- Dependencia exclusiva del Apple Neural Engine: no se puede ejecutar en GPU NVIDIA ni en CPU de forma practica, lo que restringe su despliegue al ecosistema Apple.
- Contexto muy corto: las variantes conocidas llegan como maximo a 256 tokens en el encoder y a 96 en el decodificador, insuficiente para tareas de contexto largo.
- Cobertura idiomatica limitada al chino (zh), con sesgo hacia el chino tradicional de Taiwan; no se declara soporte para otras lenguas.
- Riesgo de alucinacion y de sugerencias erroneas en la seleccion de candidatos, especialmente con entradas ambiguas o poco frecuentes; se recomienda validacion en produccion.
- Los scripts de conversion y empaquetado son de nivel de investigacion: importan utilidades del espacio de trabajo del autor que no se incluyen, por lo que documentan el proceso pero no se ejecutan de forma autonoma. La variable `MCBPMF_LM_WORK` define la raiz de dicho espacio.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar `NOTICE.txt` y las licencias de las fuentes derivadas (`char2id.tsv` de Luigi/slothing-web, y las clases de variantes derivadas de OpenCC `TWVariants.txt` y `HKVariants.txt`), todas Apache-2.0.
- Adopcion muy baja: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe un ecosistema consolidado de soporte.
- La integridad del bundle se verifica por tamano y SHA-256 antes de la carga; modificar cualquier fichero del runtime invalidara dicha verificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/workfunction/McBopomofoLM-models
- Modelo base: https://huggingface.co/Luigi/sloth-ime-models
- Repositorio McBopomofoLM: https://github.com/workfunction/McBopomofoLM
- Espacio slothing-web (origen de `char2id.tsv`): https://huggingface.co/spaces/Luigi/slothing-web
- Fuente de variantes (OpenCC, TWVariants.txt y HKVariants.txt): no se proporciona URL directa en la informacion disponible.
