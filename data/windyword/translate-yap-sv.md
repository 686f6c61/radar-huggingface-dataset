# WindyWord/translate-yap-sv

## Resumen

WindyWord/translate-yap-sv es un modelo de traduccion automatica neuronal especializado en el par de idiomas yap-es (yapese → sueco). Lo publica WindyWord (Windstorm Labs) como parte de su catalogo abierto de modelos de traduccion, y se distribuye bajo licencia Apache-2.0. El modelo deriva directamente de Helsinki-NLP/opus-mt-yap-sv, el sistema OPUS-MT desarrollado por el grupo de investigacion de Helsinki-NLP de la Universidad de Helsinki, sobre el que WindyWord ha construido sus variantes de despliegue.

Se trata de un modelo de traduccion puro, no de un modelo generativo de proposito general. La arquitectura subyacente es MarianMT (Marian NMT), un transformer encoder-decoder orientado a traduccion, empaquetado para la libreria transformers. El repositorio ocupa aproximadamente 0,3 GB, lo que situa el modelo en la categoria de modelos pequenos y ligeros, aptos tanto para GPU como para CPU.

Su relevancia radica en cubrir un par de idiomas de muy bajos recursos (el yapese es una lengua austronesia hablada en los Estados Federados de Micronesia, con un numero reducido de hablantes), un escenario donde los modelos multilingues grandes suelen tener un rendimiento pobre. El modelo ofrece dos variantes de despliegue: una version Transformers en PyTorch para inferencia en GPU y una version cuantizada a INT8 con CTranslate2 optimizada para CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT / Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 mediante CTranslate2 (variante `lora-ct2-int8/`); pesos sin cuantizar en la variante Transformers |
| Idiomas soportados | yap (yapese), sv (sueco) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y CTranslate2 (INT8) |

## Arquitectura y entrenamiento

El modelo es un sistema de traduccion neuronal basado en MarianMT, la implementacion de traduccion automatica neuronal desarrollada por el grupo Microsoft Research / Helsinki-NLP. MarianMT emplea una arquitectura transformer encoder-decoder con atencion multi-cabeza, disenada especificamente para tareas de traduccion y entrenada de forma supervisada sobre corpus paralelos. El modelo base, Helsinki-NLP/opus-mt-yap-sv, forma parte de la coleccion OPUS-MT, que entrena sistemas de traduccion para cientos de pares de idiomas a partir de los corpus paralelos del proyecto OPUS.

No se dispone de informacion detallada en el repositorio sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se especifica el proceso de ajuste fino que WindyWord pudiera haber aplicado; las variantes se denominan `lora/` y `lora-ct2-int8/`, lo que sugiere un ajuste con LoRA, aunque la model card describe `lora/` como "produccion base" en formato Transformers sin dar mas detalle sobre el procedimiento. Cualquier dato sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) no esta disponible en la informacion proporcionada.

## Capacidades

- Traduccion de texto de yapese (yap) a sueco (sv) en una unica direccion.
- Procesamiento por secuencias mediante el tokenizador Marian asociado (MarianTokenizer).
- Inferencia en GPU a traves de Transformers (PyTorch) con pesos en formato safetensors.
- Inferencia rapida en CPU mediante la variante cuantizada a INT8 con CTranslate2.
- Integracion con pipelines de Hugging Face a traves de `pipeline_tag: translation`.
- Capacidad declarada como compatible con endpoints (`endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un modelo de traduccion, no un modelo de lenguaje general).
- Capacidades multilingues limitadas exclusivamente al par yap → sv.

## Casos de uso

- Traduccion de documentacion historica o cultural: textos en yapese (documentos coloniales, registros antropologicos o material etnografico) pueden convertirse a sueco para su estudio por investigadores escandinavos, aprovechando la especializacion del modelo en un par de bajos recursos.
- Preservacion linguistica y digitalizacion: instituciones que trabajan con lenguas minoritarias pueden transcribir y traducir corpus en yapese hacia sueco como idioma puente, apoyandose en la ligereza del modelo para procesar grandes volumenes en CPU.
- Investigacion en traduccion de bajos recursos: el modelo sirve como referencia base para estudios comparativos sobre el rendimiento de sistemas OPUS-MT en pares con pocos datos paralelos.
- Traduccion de material para comunidades micronesias en Suecia: asociaciones o servicios publicos con hablantes de yapese residentes en Suecia pueden emplear el modelo para traduccion de documentos basicos.
- Procesamiento por lotes en servidores sin GPU: la variante `lora-ct2-int8/` permite desplegar traduccion masiva en infraestructura solo-CPU, con latencia baja para un modelo de este tamano.
- Integracion en pipelines de transcripcion y archivo: combinado con sistemas de reconocimiento de voz o de OCR, el modelo puede encadenarse para convertir audio o texto escaneado en yapese a sueco de forma automatizada.
- Prototipado de aplicaciones linguistica: desarrolladores que construyen herramientas para el yapese pueden usar el modelo como componente de traduccion dentro de una aplicacion mayor, gracias a la licencia permisiva Apache-2.0.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

La propia model card indica explicitamente que no se publica ninguna puntuacion de calidad en el repositorio y que las puntuaciones de cribado, cuando se miden, se encuentran en la pagina del catalogo enlazada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; dado que el repositorio ocupa aproximadamente 0,3 GB, el modelo es muy ligero y cabe holgadamente en cualquier GPU moderna con varios GB de memoria.
- GPU recomendadas: no se especifican; por tamano, funciona en practicamente cualquier GPU (desde GTX 1050 en adelante), incluidas tarjetas de consumo como RTX 3060, RTX 4090 o superiores.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo, incluso en modelos con poca VRAM, y tambien puede ejecutarse en CPU.
- Opciones de despliegue: Transformers (PyTorch) para GPU; CTranslate2 en la variante INT8 para CPU. No se mencionan despliegues con vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WindyWord/translate-yap-sv | MarianMT (transformer encoder-decoder) | yap → sv | no disponible | Apache-2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-yap-sv | MarianMT (transformer encoder-decoder) | yap → sv | no disponible | Apache-2.0 | Hugging Face (modelo base del anterior) |
| Helsinki-NLP/opus-mt-yap-sv (otros pares OPUS-MT) | MarianMT | multiples pares | no disponible | Apache-2.0 | Hugging Face |
| NLLB-200 (Meta) | Transformer MoE/encoder-decoder | 200 idiomas (incluye lenguas de bajos recursos) | no disponible | CC-BY-NC (uso no comercial) | Hugging Face |

Nota: los datos de rendimiento de estos modelos para el par yap → sv no estan disponibles en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Rendimiento de traduccion no verificado: la model card indica expresamente que no se publica ninguna puntuacion de calidad en el repositorio, por lo que la fiabilidad de las traducciones no esta documentada.
- Par de idiomas muy restringido: solo traduce de yapese a sueco, en una unica direccion; no cubre la direccion inversa ni otros idiomas.
- Recursos limitados: al tratarse de una lengua de muy bajos recursos (yapese), es probable que el corpus paralelo de entrenamiento sea reducido, lo que puede afectar a la calidad y aumentar el riesgo de traducciones erroneas o alucinadas en terminos o construcciones poco frecuentes.
- Idiomas y contexto limitados: no se especifica la longitud de contexto soportada, y los modelos Marian suelen estar limitados a secuencias relativamente cortas; los textos largos pueden requerir segmentacion previa.
- Caveat sobre variantes retiradas: la model card senala que las variantes `herm0-scripture/` y `scripture-ct2-int8/` fueron eliminadas del repositorio el 2026-10-04 mientras se revisan las licencias de sus textos fuente de eBible; se trata de una medida de precaucion, no de una conclusion legal.
- Licencia: Apache-2.0, permisiva y compatible con uso comercial, siempre que se respete la atribucion indicada en el fichero NOTICE.md y se conserve el aviso de licencia; los pesos derivan de Helsinki-NLP/opus-mt-yap-sv, tambien Apache-2.0.
- Duplicidad de repositorio: la model card menciona una copia canonica en el espacio WindyTranslate, lo que puede generar confusion sobre cual es el repositorio de referencia.
- Sin soporte de agentes, herramientas ni razonamiento: cualquier uso que requiera capacidades generativas generales queda fuera del alcance del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WindyWord/translate-yap-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yap-sv
- Pagina del catalogo del autor: https://windytranslate.com/models/translate-yap-sv
- Copia canonica indicada: https://huggingface.co/WindyTranslate/translate-yap-sv
- Aplicaciones del autor: https://windyword.ai
- Proyecto OPUS (corpus y modelos Helsinki-NLP): https://opus.nlpl.eu/ (referencia general de la coleccion OPUS-MT; no citado explicitamente en la informacion proporcionada)
