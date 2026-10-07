# yennik16/text-to-stl-feature-editor

## Resumen

El repositorio yennik16/text-to-stl-feature-editor no contiene pesos entrenados: es el artefacto de la etapa 3 de un pipeline de texto a STL que convierte peticiones en lenguaje natural, del tipo "redondea las esquinas 1/4 de pulgada y anade cuatro agujeros M5 en la base", en una lista de caracteristicas geometricas (bottom_hole, cutout, divider, edge, hole) serializada como JSON. Esas caracteristicas se validan despues con reglas y se aplican como cortes o anadidos en CadQuery. Lo que el repositorio distribuye es el sistema que hace funcionar al modelo: los prompts de sistema, el banco de ejemplos y el codigo de recuperacion.

La pieza central es Qwen/Qwen2.5-1.5B-Instruct usado tal cual se publica, sin LoRA ni ajuste alguno. Para cada peticion, el sistema recupera los 6 ejemplos resueltos mas similares del mismo tipo de pieza mediante similitud TF-IDF sobre unigramas y bigramas (con los numeros enmascarados para que la similitud dependa de la redaccion y no de las medidas) y los inserta como turnos previos de chat. El banco de ejemplos contiene 589 peticiones y el decodificado es greedy. La decision de diseno es deliberada: en lugar de reentrenar para cada nueva formulacion, basta con anadir un ejemplo al banco.

Es relevante ahora porque demuestra con numeros que la recuperacion few-shot puede transformar el rendimiento de un modelo pequeno en una tarea de extraccion estructurada muy especifica: el mismo modelo base pasa de un 11,9% de peticiones con todas las caracteristicas correctas (0 ejemplos) a un 79,7% (6 ejemplos). El modelo solo declara soporte de ingles, tiene licencia Apache 2.0 y forma parte del Proyecto 1 de CMU, con entrenamiento y evaluacion documentados en el notebook Text_to_STL_Pipeline.ipynb.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) en el modelo base; el repositorio no introduce arquitectura propia |
| Parámetros totales | 1,54 mil millones (Qwen2.5-1.5B-Instruct) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base; en la practica cada peticion ocupa el prompt de sistema, 6 ejemplos y las dimensiones de la pieza. La generacion del ejemplo de uso limita la salida a 400 tokens nuevos |
| Tipos de cuantizacion | El repositorio no incluye pesos. El modelo base admite BF16/FP16, INT8, GGUF (Q4_K_M, Q5_K_M, Q8_0 y otros), AWQ y GPTQ |
| Idiomas soportados | Inglés (único idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No distribuye pesos: se descargan los del modelo base en safetensors. El repositorio aporta codigo Python, system_prompts.json, example_bank.csv y example_prompt.json |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset asociado | yennik16/text-to-stl-parts (banco de ejemplos sintetico de 589 peticiones) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only de 1,54 mil millones de parametros con atencion de consultas agrupadas (GQA) y contexto nativo de 32.768 tokens. No hay entrenamiento en esta etapa. La model card es explicita: "No weights were trained for this stage". En la aplicacion completa se reutiliza el mismo modelo base que el extractor de parametros (yennik16/text-to-stl-parameter-extractor), pero con su adaptador LoRA desactivado, de modo que el comportamiento depende exclusivamente del prompting y de la recuperacion.

La innovacion tecnica no esta en el modelo sino en el pipeline de inferencia. Primero, un prompt de sistema describe el esquema JSON de caracteristicas y sus convenciones para el tipo de pieza concreto. Segundo, un recuperador TF-IDF sobre unigramas y bigramas selecciona los 6 ejemplos mas similares del banco de 589 peticiones resueltas, enmascarando los numeros para que la similitud refleje la formulacion y no las dimensiones. Tercero, la peticion se normaliza con normalize_feature_text, que ademas traduce medidas de tornillo como "M5" a diametros de agujero de paso. La decodificacion es greedy y la respuesta se parsea como {"features": [...]}. Complementariamente, un divisor basado en reglas separa el texto de la pieza del texto de las caracteristicas: conserva enteras 49 de 49 descripciones de pieza reservadas y divide correctamente 285 de 295 (96,6%) peticiones combinadas.

## Capacidades

- Generacion de texto estructurado: produce JSON con una lista de caracteristicas geometricas a partir de lenguaje natural.
- Extraccion de entidades y medidas: identifica radios, chaflanes, agujeros, divisores y recortes junto con sus dimensiones y posiciones.
- Conversión de unidades y normalizacion de roscas: el normalizador transforma medidas imperiales escritas en texto y tallas de tornillo como M5 en diametros de agujero de paso.
- Aprendizaje en contexto: el comportamiento ante nuevas formulaciones se amplia anadiendo ejemplos al banco, sin reentrenar.
- Recuperacion semantica superficial: seleccion de ejemplos por TF-IDF sobre unigramas y bigramas con numeros enmascarados.
- Integracion con CAD: la salida JSON esta pensada para ser validada por reglas y ejecutada como operaciones de corte o adicion en CadQuery.
- Cobertura limitada a tres tipos de pieza: soportes (brackets), contenedores rectangulares y contenedores cilindricos.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Soporte multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Edicion parametrica de piezas en un flujo de impresion 3D: un usuario describe cambios en lenguaje natural ("redondea las esquinas 1/4 de pulgada y anade un divisor central") y el modelo devuelve las caracteristicas en JSON, que el pipeline aplica sobre el modelo CadQuery existente.
- Generacion asistida de soportes y contenedores para prototipado rapido: al estar restringido a brackets y contenedores rectangulares y cilindricos, encaja en la produccion de piezas funcionales sencillas donde las medidas y los agujeros de montaje son los parametros criticos.
- Front-end conversacional sobre una herramienta CAD: la salida JSON es directamente consumible por una tabla editable, lo que permite mostrar cada valor al usuario, corregirlo antes de ejecutar y rechazar geometrias imposibles.
- Automatizacion de variantes de una misma pieza: combinando el banco de ejemplos con la recuperacion TF-IDF, se pueden generar lotes de variantes (distintos tamanos de agujero, numero de divisores) reutilizando una redaccion de peticion similar.
- Extracción de requisitos desde documentacion tecnica: al estar entrenado en contexto para mapear frases de ingenieria a un esquema fijo, sirve como extractor de especificaciones en texto libre hacia una representacion estructurada.
- Base para un sistema de anotacion asistida: el banco de 589 ejemplos sirve como punto de partida para etiquetar nuevas peticiones reales y medir la cobertura del esquema antes de invertir en fine-tuning.
- Banco de pruebas de pipelines de recuperacion: por su tamano (1,5B), permite iterar sobre estrategias de recuperacion, prompts de sistema y esquemas JSON en una sola GPU de consumo.
- Validacion previa a la fabricacion: dado que las reglas del pipeline rechazan geometria imposible, se puede usar como primer filtro que marca peticiones mal formadas antes de llegar a un operador humano.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre peticiones escritas a mano y reservadas, con puntuacion basada en el resultado final: una caracteristica es correcta cuando acaba en el mismo sitio y con el mismo tamano tras aplicar los valores por defecto.

| Modelo y configuracion | JSON valido | Numero de caracteristicas correcto | Todas las caracteristicas correctas | Agujeros correctos | bottom_holes correctos | Bordes correctos | Divisores correctos | Recortes correctos |
|---|---|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct, 0 ejemplos | 93,2% | 78,0% | 11,9% | 28,3% | 0,0% | 5,3% | 0,0% | 11,1% |
| Qwen2.5-1.5B-Instruct, 6 ejemplos | 100,0% | 100,0% | 79,7% | 92,5% | 80,0% | 89,5% | 69,2% | 66,7% |

Dato adicional del divisor basado en reglas: conserva 49 de 49 descripciones de pieza reservadas y divide correctamente 285 de 295 (96,6%) peticiones combinadas reservadas. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K ni similares) para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo del modelo base de 1,54B parametros: en FP16/BF16 los pesos ocupan aproximadamente 3,1 GB; en INT8 unos 1,6 GB; en GGUF Q4_K_M alrededor de 1,0-1,1 GB. Son estimaciones derivadas del tamano del modelo, no cifras publicadas por el autor.
- Memoria de cache KV: con atencion de consultas agrupadas y 32.768 tokens de contexto, la cache completa ocupa del orden de cientos de MB; en este pipeline los prompts son cortos (prompt de sistema mas 6 ejemplos), por lo que el consumo real es mucho menor.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar el modelo en BF16 o INT8. Para produccion con concurrencia, una A100, H100 o L40S permite mantener muchas secuencias simultaneas sin problema de memoria.
- Cabe en GPU de consumo: si. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4070, RTX 4090 e incluso en iGPU o CPU con cuantizacion GGUF de 4 bits.
- Opciones de despliegue: transformers (es el camino documentado en la model card, junto con huggingface_hub.snapshot_download), vLLM, TGI, llama.cpp, Ollama y LM Studio para los pesos del modelo base.
- Caveat de despliegue: el repositorio aporta codigo Python (FeaturePrompter, normalize_feature_text) que construye el prompt con recuperacion TF-IDF. Servidores que solo cargan pesos (vLLM, llama.cpp, Ollama) no reproducen el sistema por si solos: hay que reimplementar la recuperacion y el formateo del prompt fuera del servidor.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque y disponibilidad |
|---|---|---|---|---|
| yennik16/text-to-stl-feature-editor | 1,54B (sin pesos propios) | 32.768 tokens (modelo base) | Apache 2.0 | Recuperacion TF-IDF de 6 ejemplos mas prompts; repositorio de codigo y datos, no de pesos |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Generacion directa sin recuperacion; en la evaluacion del autor obtiene 11,9% de peticiones completamente correctas |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 32.768 tokens | Apache 2.0 | Alternativa de mayor tamano; no se han publicado resultados comparativos en esta tarea |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano intermedio con contexto mas largo; licencia con restricciones, no Apache 2.0 |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Alternativa de tamano similar con contexto mas corto; requiere aceptar terminos especificos |

No se dispone de resultados de benchmarks de estos modelos en la tarea concreta de extraccion de caracteristicas para STL, por lo que la comparacion se limita a parametros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- El repositorio no entrena pesos: su rendimiento depende por completo de la calidad del prompt de sistema, del banco de ejemplos y del recuperador. Cambiar el esquema JSON o las convenciones de un tipo de pieza exige reescribir prompts y anadir ejemplos.
- Cobertura geometrica restringida a tres tipos de pieza: soportes (brackets), contenedores rectangulares y contenedores cilindricos. Fuera de ese ambito no hay garantia de comportamiento correcto.
- El banco de ejemplos es sintetico, escrito o generado con un asistente de IA, y puede no reflejar como formulan las peticiones los usuarios reales. Es un riesgo directo de sesgo de distribucion en la recuperacion.
- Errores documentados en redacciones poco habituales o en aritmetica: el propio autor senala que "three sections" significa dos divisores y que este tipo de inferencia falla con frecuencia.
- Riesgo de alucinacion estructural: el modelo puede emitir JSON formalmente valido con caracteristicas o medidas incorrectas. La validacion por reglas y el rechazo de geometria imposible mitigan el problema, pero no lo eliminan.
- El recuperador TF-IDF enmascara los numeros, de modo que la similitud depende de la redaccion. Dos peticiones con redaccion parecida pero dimensiones muy distintas pueden recuperar los mismos ejemplos.
- Idioma: solo se declara ingles. Un prompt en castellano no esta cubierto por la evaluacion publicada.
- Restricciones de licencia: el codigo y el modelo base son Apache 2.0, lo que permite uso comercial. Hay que verificar por separado las licencias de las dependencias del pipeline (CadQuery, scikit-learn para TF-IDF) antes de un despliegue comercial.
- Caveat de produccion: la decodificacion es greedy y determinista, lo que favorece la reproducibilidad pero elimina la posibilidad de muestrear alternativas cuando la primera salida es incorrecta.
- El proyecto se presenta como trabajo academico (Proyecto 1 de CMU) y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La busqueda web realizada no devolvio documentacion tecnica adicional sobre este repositorio: los resultados obtenidos trataban sobre guias de viaje y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennik16/text-to-stl-feature-editor
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Extractor de parametros relacionado (etapa del mismo pipeline): https://huggingface.co/yennik16/text-to-stl-parameter-extractor
- Dataset de ejemplos: https://huggingface.co/datasets/yennik16/text-to-stl-parts
- Notebook de entrenamiento y evaluacion: Text_to_STL_Pipeline.ipynb (Proyecto 1 de CMU), referenciado en la model card; no se ha encontrado URL publica en la informacion disponible
- CadQuery (biblioteca CAD usada para aplicar las caracteristicas): https://github.com/CadQuery/cadquery
- Otros enlaces relevantes (papers, blogs, demos): no disponible en la informacion proporcionada
