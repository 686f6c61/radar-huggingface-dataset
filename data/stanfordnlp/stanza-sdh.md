# stanfordnlp/stanza-sdh

## Resumen

Stanza-sdh es un paquete de modelos de procesamiento del lenguaje natural publicado por el Stanford NLP Group dentro del ecosistema Stanza, una biblioteca en Python para el analisis linguistico de texto en crudo que abarca desde la tokenizacion hasta el reconocimiento de entidades y el analisis sintactico. Este repositorio concreto proporciona los modelos entrenados para el kurdo meridional (Southern Kurdish, codigo ISO 639-3 `sdh`), una lengua irania hablada principalmente en el oeste de Iran e Irak y con escasa representacion en recursos computacionales. La tarea publicada en HuggingFace es `token-classification`, orientada a etiquetado a nivel de token como el reconocimiento de entidades nombradas (NER).

El modelo se distribuye bajo licencia Apache 2.0 y esta integrado en la libreria Stanza, por lo que su uso tipico es a traves de la propia API de Stanza o mediante su integracion en spaCy. El repositorio ocupa 0,2 GB, un tamano coherente con los modelos neuronales compactos que Stanza emplea por componente (tokenizador, etiquetador POS, lematizador, parser de dependencias y NER). No se trata de un modelo generativo ni de un modelo de lenguaje de gran escala, sino de un conjunto de clasificadores especializados para anotacion linguistica.

Su relevancia actual radica en que aporta cobertura de PLN a una lengua de bajos recursos para la que existen muy pocos modelos publicos, y lo hace dentro de un marco reproducible y de codigo abierto. Al estar generado automaticamente mediante el script `hugging_stanza.py` del repositorio `stanfordnlp/huggingface-models`, la ficha no incluye detalles de arquitectura, datos de entrenamiento ni metricas especificas, por lo que buena parte de las especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos neuronales de Stanza; sin detalle en la ficha del autor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa a nivel de frase/oracion, no ventana de contexto fija) |
| Tipos de cuantizacion | no disponible (no se distribuyen variantes cuantizadas; pesos originales del pipeline) |
| Idiomas soportados | kurdo meridional (Southern Kurdish, `sdh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB; los modelos de Stanza se cargan mediante la libreria `stanza`) |

## Arquitectura y entrenamiento

Stanza es una coleccion de herramientas de analisis linguistico que combina tokenizacion, segmentacion de oraciones, etiquetado de partes de la oracion, lematizacion, analisis de dependencias y reconocimiento de entidades. Los modelos publicados en HuggingFace bajo el prefijo `stanfordnlp/stanza-<idioma>` corresponden a los componentes entrenados para cada lengua concreta y se cargan desde la propia libreria Stanza. En este caso, la tarea declarada es `token-classification`, lo que apunta a un modelo de etiquetado secuencial por token.

La model card del autor no especifica la arquitectura interna, el numero de parametros, el volumen de tokens de entrenamiento ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones tecnicas particulares para esta variante. Toda esa informacion debe considerarse no disponible en la documentacion proporcionada. Lo unico confirmado es que el paquete esta generado de forma automatica con `hugging_stanza.py` dentro del repositorio `stanfordnlp/huggingface-models` y que su ultima actualizacion registrada es del 29 de septiembre de 2026.

## Capacidades

- Etiquetado a nivel de token para kurdo meridional (`sdh`), segun la tarea `token-classification` declarada.
- Reconocimiento de entidades nombradas (NER) como parte del pipeline de Stanza para la lengua soportada.
- Integracion en el pipeline completo de Stanza: tokenizacion, segmentacion de oraciones, POS, lematizacion y analisis sintactico, siempre que los componentes correspondientes esten disponibles para `sdh`.
- Uso programatico desde Python mediante la libreria `stanza` y posible integracion con spaCy a traves de `spacy-stanza`.
- Capacidades multilingues: limitadas al idioma declarado (`sdh`); no se documenta transferencia a otras lenguas.
- Soporte de tool calling / function calling: no disponible; no es un modelo generativo ni un agente.
- Modo de razonamiento o "thinking": no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Anotacion linguistica de corpus en kurdo meridional: usar el pipeline de Stanza para etiquetar POS, lemas y entidades en textos recopilados, generando corpus anotados que alimenten investigacion linguistica sobre una lengua de bajos recursos.
- Extraccion de entidades nombradas en documentos: identificar personas, organizaciones y lugares en textos administrativos o periodisticos en `sdh`, como paso previo a la construccion de indices o bases de conocimiento.
- Preprocesamiento para busqueda y recuperacion de informacion: tokenizar y normalizar texto en kurdo meridional antes de indexarlo en un motor de busqueda, mejorando la coincidencia frente a un tratamiento puramente basado en cadenas.
- Analisis sintactico para estudios comparativos: emplear el parser de dependencias de Stanza sobre `sdh` para analizar estructuras gramaticales y contrastarlas con otras lenguas iranias dentro de proyectos academicos.
- Construccion de conjuntos de datos paralelos: alinear texto en `sdh` con traducciones mediante la segmentacion de oraciones del pipeline, facilitando la creacion de corpus paralelos para traduccion automatica.
- Soporte a proyectos de documentacion de lenguas en peligro: generar anotaciones automaticas que luego se revisan manualmente, reduciendo el esfuerzo de transcripcion y etiquetado en trabajos de campo linguistico.
- Integracion en aplicaciones de PLN para comunidades kurdas: incorporar el pipeline como componente de preprocesamiento en herramientas de analisis de texto en produccion que necesiten tratar contenido en `sdh`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card generada automaticamente no incluye tablas de metricas (F1 de NER, UAS/LAS del parser, exactitud de POS, etc.) y los resultados de busqueda solo apuntan a las paginas generales de Stanza (`models.html`), sin cifras especificas para el paquete `sdh`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 0,2 GB, por lo que el conjunto de pesos cabe holgadamente en memoria de cualquier GPU de consumo moderna si se carga completo.
- GPU recomendadas: no se documentan requisitos especificos. Al tratarse de un modelo neuronal compacto, cualquier GPU con al menos unos pocos GB de VRAM (por ejemplo, GTX 1650, RTX 3060 o superiores) seria suficiente en la practica.
- Compatibilidad con GPU de consumo: si, previsiblemente; el tamano del paquete sugiere que puede ejecutarse incluso en CPU para lotes de tamano moderado.
- Opciones de despliegue: la via oficial es la libreria `stanza` en Python, opcionalmente a traves de `spacy-stanza`. Motores como vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo generativo con pesos en formato GGUF o safetensors de LLM.
- Latencia y throughput estimados: no disponibles. Dependeran del componente concreto (tokenizador, NER, parser) y del hardware empleado.

## Comparativa con modelos similares

| Modelo | Idioma | Tarea | Licencia | Contexto | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| stanfordnlp/stanza-sdh | kurdo meridional (`sdh`) | token-classification | Apache 2.0 | no disponible | no disponible | HuggingFace + libreria stanza |
| stanfordnlp/stanza-en | ingles (`en`) | pipeline completo Stanza | Apache 2.0 | no disponible | disponible en la web de Stanza (no consultada con detalle) | HuggingFace + libreria stanza |
| Otros modelos Stanza por idioma | 70 lenguas en total segun Stanza | tokenizacion, POS, NER, parsing | Apache 2.0 | no disponible | disponibles en la web de Stanza | HuggingFace + libreria stanza |

No se dispone de datos de rendimiento del paquete `sdh` que permitan una comparacion cuantitativa con alternativas especificas para kurdo meridional. La comparacion mas directa es con el resto de paquetes de idioma de Stanza, que comparten marco, licencia y formato de distribucion.

## Limitaciones y advertencias

- La model card es generada automaticamente y no documenta sesgos, composicion del corpus de entrenamiento ni procedencia de los datos, por lo que la trazabilidad es muy limitada.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si puede producir etiquetas incorrectas con alta confianza en dominios alejados de los datos de entrenamiento.
- Cobertura limitada al kurdo meridional (`sdh`); no se garantiza buen rendimiento en variedades cercanas como el kurdo central (`ckb`) o el kurdo septentrional (`kmr`).
- La calidad dependera del dominio y del registro del texto de entrada; no hay metricas publicadas que permitan estimar el rendimiento esperado.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia correspondientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy baja y ausencia de validacion por parte de la comunidad.
- Para produccion, conviene validar manualmente las anotaciones en una muestra representativa del dominio objetivo antes de desplegar el modelo de forma automatica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordnlp/stanza-sdh
- Repositorio GitHub de Stanza: https://github.com/stanfordnlp/stanza
- Pagina de modelos de Stanza: https://stanfordnlp.github.io/stanza/models.html
- Descarga de modelos: https://stanfordnlp.github.io/stanza/download_models.html
- Sitio web de Stanza: https://stanfordnlp.github.io/stanza
- Sitio institucional de Stanza: https://stanza.stanford.edu/
- Repositorio de generacion de modelos en HuggingFace: https://github.com/stanfordnlp/huggingface-models
- Ejemplo de otro paquete de idioma: https://huggingface.co/stanfordnlp/stanza-en
