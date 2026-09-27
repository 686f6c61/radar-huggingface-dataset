# yuiseki/llm-jp-3-440m-jp-gov-v0.2

## Resumen

llm-jp-3-440m-jp-gov-v0.2 es un modelo de lenguaje japones de 447 millones de parametros (447.251.456, segun los pesos safetensors) publicado por el desarrollador yuiseki. Se trata de un ajuste por preentrenamiento continuado (continued pretraining) sobre llm-jp/llm-jp-3-440m, el modelo base de 440 M de la serie llm-jp-3 desarrollada por el centro de I+D de grandes modelos de lenguaje del National Institute of Informatics (NII) de Japon.

El objetivo del ajuste es muy concreto: ensenar al modelo a completar la frase desnuda «当別町は» con la prefectura correcta. Segun la model card, el modelo base ya respondia correctamente al 91% de estas preguntas cuando se formulaban como pregunta, y al 86% cuando la frase nombraba explicitamente lo que se pedia, pero no sabia interpretar la forma escueta «Xは», que invita a generar un parrafo sobre la poblacion del municipio en lugar de su prefectura. El ajuste se hizo sobre 1.632 hechos sobre la prefectura de cada municipio japones, cada uno expresado de ocho maneras distintas, con un total de 106.948 tokens y seis pasadas (41 segundos en una A100).

Es relevante ahora porque documenta un experimento controlado y reproducible sobre ajuste de conocimiento geografico en un modelo pequeno: distingue entre hechos que el modelo ya tiene pero no sabe formular (solo necesitan aprendizaje de la formulacion) y hechos que no tiene (requieren mas pasadas), y demuestra que seis pasadas superan a sesenta en todos los ejes salvo en un subconjunto muy concreto. No es un modelo conversacional ni instruct-tuned, sino un modelo base de completado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (etiqueta `llama` en HuggingFace), derivado de llm-jp/llm-jp-3-440m |
| Parametros totales | 447.251.456 (~447 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se distribuyen en safetensors y el tamano del repo (0,9 GB) es coherente con precision bf16/fp16 |
| Idiomas soportados | Japones (ja). La capacidad ajustada (mapeo municipio-prefectura) funciona unicamente en japones; el modelo base llm-jp-3-440m se describe en fuentes de terceros como multilingue (ja, en, zh, ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio servido con xet) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer de tipo Llama, denso, de 440 M de parametros, perteneciente a la familia llm-jp-3 del NII. No hay cambios arquitectonicos respecto al base; el trabajo consiste en preentrenamiento continuado sobre un corpus muy especializado y de tamano reducido.

El corpus se construyo a partir de dos registros gubernamentales japoneses congelados: `yuiseki/geo-triples-jp-gov` (triples geograficos calculados con un endpoint GeoSPARQL fijado por Docker, con cada paso desde la matriz DE-9IM hasta el predicado demostrado con un desarrollo en Lean) y `yuiseki/jp-admin-2026-09` (cruce de los dos registros, del que salen las direcciones). Cada uno de los 1.632 hechos se escribe exactamente una vez y de ocho maneras: seis frases y dos direcciones (por ejemplo, «当別町は北海道に含まれる。» o «住所：北海道石狩郡当別町»). El 30% de cada lote se rellena con texto de Wikipedia en japones como replay, y la mitad usada para el replay no es la misma sobre la que se mide la perdida de control. La mitad reservada (held-out) es uno de cada diez municipios, elegido por el sha256 de su propio codigo y no escrito en ninguna parte del corpus. El entrenamiento completo requirio seis pasadas, 106.948 tokens y 41 segundos en una A100. No hubo RLHF ni DPO: es preentrenamiento continuado puro.

La innovacion tecnica destacable es el analisis experimental: la model card compara seis pasadas frente a sesenta y documenta que sesenta pasadas degradan la forma de pregunta del 91,5% al 19,8% (el modelo deja de aplicar los ejemplos y repite el mas cercano), mientras que solo en los 116 hechos que el base no sabia responder de ninguna forma sesenta pasadas ganan a seis (5 errores frente a 15, p = 0,033).

## Capacidades

- Generacion de texto en japones mediante completado de secuencia (no es un modelo de chat).
- Mapeo municipio-prefectura: completar «Xは» con la prefectura correcta de un municipio japones.
- Reconocimiento de la misma relacion expresada de multiples formas: frase directa, inversa, copulativa, pregunta explicita y direccion postal.
- Recuperacion de la relacion en sentido inverso: dado el nombre de una prefectura, producir un municipio que realmente le pertenece (las 47 prefecturas reciben un municipio valido).
- Generalizacion parcial a municipios no vistos durante el entrenamiento (mitad reservada: del 29,1% al 71,5% en la forma escueta).
- Razonamiento sobre datos administrativos japoneses (prefecturas, distritos 郡, direcciones estructuradas).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo de pensamiento (thinking), vision ni audio.
- Capacidad multilingue muy limitada: en romaji («Tobetsu-choは») solo pasa del 7,0% al 16,0%, ya que el corpus es integramente japones.

## Casos de uso

- Normalizacion de direcciones japonesas: dado el nombre de un municipio o de un distrito (郡), completar la prefectura correspondiente para enriquecer registros postales o de clientes; el modelo cubre 1.632 municipios y acierta en 1.601 de ellos.
- Enriquecimiento de bases de datos geoespaciales: rellenar el campo de prefectura en tablas donde solo consta el municipio, aprovechando que el modelo reconoce tanto la forma de frase como la de direccion completa.
- Validacion de integridad de datos administrativos: comprobar que la relacion municipio-prefectura de un registro es coherente preguntando al modelo en forma de completado y marcando discrepancias.
- Indexacion y etiquetado de corpus japoneses: generar metadatos de prefectura para documentos que mencionan municipios sueltos, antes de pasarlos a un buscador o a un sistema de recomendacion.
- Construccion de grafos de conocimiento: usar el modelo para generar tripletas municipio-prefectura en texto natural que alimenten una base RDF, con la advertencia de verificar los 31 casos erroneos conocidos.
- Experimentacion academica en ajuste de conocimiento: servir de banco de pruebas reproducible (corpus builder, notebook y mediciones publicados en YuisekinAI-CPT) para estudiar la diferencia entre aprender hechos y aprender a formularlos en modelos pequenos.
- Generacion inversa prefectura-municipio: producir ejemplos de municipios pertenecientes a una prefectura dada para tareas de aumentacion de datos o de test sintetico.
- Analisis de olvido catastrofico: el modelo documenta una subida de 0,473 en la perdida sobre Wikipedia japonesa reservada, por lo que sirve como caso de estudio de degradacion de capacidades generales tras preentrenamiento continuado.

## Benchmarks y rendimiento

La model card publica resultados de exactitud sobre el propio corpus (no hay MMLU, HumanEval ni GSM8K). El azar es del 2,1%, porque la respuesta es una de 47 prefecturas.

| Peticion | Base | Este modelo |
|---|---|---|
| 「当別町は」, mitad ensenada | 26,0% | 97,2% |
| 「当別町は」, mitad reservada | 29,1% | 71,5% |
| 「当別町が属する都道府県は」 | 72,5% | 96,5% |
| 「当別町の位置する都道府県名は」 | 86,0% | 96,5% |
| 「Q: 当別町は何県にありますか。A:」, ensenada | 91,5% | 98,0% |
| 「Q: 当別町は何県にありますか。A:」, reservada | 90,5% | 83,5% |
| 「Tobetsu-choは」 | 7,0% | 16,0% |
| 「北海道の市区町村のひとつが」 | 95,7% | 100,0% |

Datos adicionales de la model card:

| Metrica | Valor |
|---|---|
| Hechos totales del corpus | 1.632 |
| Hechos incorrectos en total | 31 |
| Error con nombres de un token | 1,0% |
| Error con nombres de dos tokens | 3,3% |
| Error con nombres de tres tokens | 0,8% |
| Subconjunto que el base no acertaba en ninguna forma (116 hechos): 6 pasadas | 15 errores |
| Subconjunto de 116 hechos: 60 pasadas | 5 errores (p = 0,033) |
| Forma de pregunta con 60 pasadas | 91,5% -> 19,8% |
| Forma de frase reservada con 60 pasadas | 61,4% (frente a 71,5% con 6 pasadas) |
| Incremento de perdida en Wikipedia japonesa reservada | +0,473 |

No se han publicado resultados en benchmarks estandar (MMLU, JGLUE, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16/fp16 (pesos ~0,9 GB mas activaciones y cache), en torno a 0,5 GB en int8 y 0,3 GB en int4.
- GPU recomendadas: cualquier GPU con 4 GB o mas; una RTX 3060, RTX 4060 o superior es mas que suficiente. Modelos como A100 o H100 son innecesarios para inferencia (la A100 se uso para entrenar, con 41 segundos de computo).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en CPU o en dispositivos con poca memoria.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (TGI) y endpoints compatibles, segun las etiquetas del repositorio. Para llama.cpp, Ollama o vLLM habria que convertir los pesos, ya que no se distribuye ninguna version GGUF.
- Latencia y throughput: no disponible. El unico dato de rendimiento publicado es el tiempo de entrenamiento (41 segundos en una A100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yuiseki/llm-jp-3-440m-jp-gov-v0.2 | 447 M | no disponible | 97,2% (forma escueta, mitad ensenada); 71,5% en reservada; 31 errores sobre 1.632 | Apache-2.0 | HuggingFace, pesos safetensors |
| llm-jp/llm-jp-3-440m (base) | 440 M | no disponible | 26,0% en forma escueta; 91,5% en pregunta (mitad ensenada) | Apache-2.0 | HuggingFace |
| Otros modelos de la serie llm-jp-3 | La serie cubre ocho tamanos, de 150 M a 172 B, segun fuentes de terceros | no disponible | no disponible para esta tarea | Apache-2.0 para modelos hasta 13 B | HuggingFace |

No se han identificado en la informacion disponible otros modelos comparables especializados en el mapeo municipio-prefectura de Japon.

## Limitaciones y advertencias

- Es un modelo base de 440 M sin instruction tuning: no es un modelo de chat, no sigue instrucciones y su uso previsto es el completado de secuencias.
- Sesgos: no documentados explicitamente, pero al depender de registros administrativos japoneses hereda la cobertura y los criterios de dichos registros (Direccion Digital del Gobierno y censo de 2020).
- Riesgo de alucinacion: sobre el corpus de 1.632 hechos comete 31 errores (aproximadamente el 1,9%). Fuera de ese dominio no hay garantia alguna de correccion.
- Limitacion de idioma: funciona en japones unicamente. Con el mismo nombre en romaji baja al 16,0% de acierto, por lo que no es fiable con entradas en alfabeto latino.
- Limitacion de contexto: la longitud de contexto no esta publicada.
- Olvido catastrofico: durante el entrenamiento la perdida sobre Wikipedia japonesa reservada subio 0,473, lo que indica degradacion de capacidades generales en japones. El autor lo describe como un coste elevado para una ejecucion de 41 segundos.
- Riesgo de sobreajuste con mas pasadas: el mismo notebook con 60 epocas hunde la forma de pregunta del 91,5% al 19,8%. No se recomienda aumentar las pasadas con este corpus.
- Restricciones de licencia: el modelo es Apache-2.0, siguiendo el base. Los hechos y direcciones son CC BY 4.0 (procedentes de 「アドレス・ベース・レジストリ」 de la Agencia Digital y de 「令和2年国勢調査 小地域（町丁・字等別）境界データ」 del Ministerio de Asuntos Internos y Comunicaciones), y el texto de replay es Wikipedia japonesa con licencia CC, por lo que conviene revisar las condiciones de atribucion antes de un uso comercial.
- Los datos del corpus de hechos y direcciones no fueron escritos por ningun modelo de lenguaje, sino derivados de los registros citados.
- Para produccion: conviene validar la salida contra un registro oficial, dado que el modelo tambien responde con seguridad cuando se equivoca y no esta alineado para abstenerse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuiseki/llm-jp-3-440m-jp-gov-v0.2
- Archivos del repositorio: https://huggingface.co/yuiseki/llm-jp-3-440m-jp-gov-v0.2/tree/main
- Modelo base: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset de triples geograficos: https://huggingface.co/datasets/yuiseki/geo-triples-jp-gov
- Dataset administrativo: https://huggingface.co/datasets/yuiseki/jp-admin-2026-09
- Dataset de Wikipedia geolocalizada: https://huggingface.co/datasets/yuiseki/wikipedia-geotagged
- Repositorio con notebook, constructor del corpus y mediciones: https://github.com/yuiseki/YuisekinAI-CPT
- Pagina de publicaciones de LLM-jp (NII): https://llm-jp.nii.ac.jp/en/release-en/
- Ficha de llm-jp-3-440m en AI Models Navi: https://aimodelsnavi.com/en/models/llm-jp-3-440m
- Ficha del modelo base en AIBase: https://model.aibase.com/models/details/1970375715463630848
