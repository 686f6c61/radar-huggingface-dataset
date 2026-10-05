# WindstormLabs/translate-yap-en

## Resumen

WindstormLabs/translate-yap-en es un modelo de traducción automática especializado en la dirección yapés (yap) → inglés (en), publicado por Windstorm Labs como parte de su catálogo abierto de modelos. Se trata de un ajuste derivado de Helsinki-NLP/opus-mt-yap-en, el sistema OPUS-MT de la Universidad de Helsinki, por lo que hereda la arquitectura Marian (transformer encoder-decoder) y la licencia Apache 2.0. El repositorio no publica puntuación de calidad, número de parámetros ni resultados de benchmarks, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

El modelo resuelve un problema muy concreto: la traducción desde una lengua de muy bajos recursos hablada en los Estados Federados de Micronesia hacia inglés, un par para el que existen pocos sistemas disponibles y casi ninguno con pesos abiertos. Su relevancia actual es doble: por un lado, cubre un hueco en la cobertura lingüística de los traductores neuronales abiertos; por otro, sirve como ejemplo de empaquetado práctico, ya que el repositorio ofrece dos variantes de despliegue —una en formato Transformers para GPU y otra cuantizada a INT8 con CTranslate2 para CPU— dentro de un repositorio de solo 0,3 GB.

El repositorio ha sufrido cambios en su contenido: el 4 de octubre de 2026 se retiraron las variantes denominadas WindyScripture (herm0-scripture/ y scripture-ct2-int8/) mientras se revisan las licencias de los textos eBible que les servían de fuente. El autor lo describe explícitamente como una precaución, no como una conclusión legal. La copia canónica del modelo se mantiene en la organización WindyTranslate.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (MarianMT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 mediante CTranslate2 (variante lora-ct2-int8); la variante lora/ se distribuye en precisión original |
| Idiomas soportados | yapés (yap) como origen e inglés (en) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (variante lora/, formato Transformers/PyTorch) y CTranslate2 (variante lora-ct2-int8/) |
| Autor | WindstormLabs |
| Modelo base | Helsinki-NLP/opus-mt-yap-en |
| Tarea (pipeline) | translation |
| Biblioteca | transformers |
| Tamaño del repositorio | 0,3 GB |
| Variantes incluidas | lora/ (WindyStandard, GPU) y lora-ct2-int8/ (WindyStandard CPU INT8) |
| Variantes retiradas | herm0-scripture/ y scripture-ct2-int8/ (eliminadas el 2026-10-04, licencias en revisión) |
| Fecha de creación | 2026-05-19 |
| Última actualización | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder-decoder de traducción neuronal, concretamente la implementación Marian empleada por la familia OPUS-MT de Helsinki-NLP. El modelo parte de los pesos de Helsinki-NLP/opus-mt-yap-en y se distribuye en dos variantes: WindyStandard en formato Transformers para inferencia en GPU y WindyStandard · CPU INT8 como conversión a CTranslate2 con cuantización INT8 para inferencia en CPU. El nombre de la carpeta principal (lora/) sugiere el uso de adaptadores de bajo rango, pero la model card no especifica si la variante distribuida contiene únicamente adaptadores o los pesos fusionados; este extremo no está confirmado en la información disponible.

No se publican detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, la aplicación de RLHF o DPO ni ninguna innovación técnica específica más allá de la cuantización INT8 para CPU. La model card indica que los pesos derivan de OPUS-MT, proyecto con licencia Apache 2.0, y que las variantes de Windstorm se publican bajo la misma licencia, con ficheros LICENSE y NOTICE.md para el texto legal y la atribución. El autor tampoco publica la puntuación de calidad del modelo en este repositorio y remite a su página de catálogo para consultar las puntuaciones de cribado, cuando estén medidas.

## Capacidades

- Traducción de texto de yapés a inglés, en un único sentido; no se documenta la dirección inversa inglés → yapés.
- Generación de traducciones en modalidad texto a texto, sin componentes de visión, audio o multimodalidad.
- Inferencia en GPU mediante la API de Transformers (MarianMTModel y MarianTokenizer) y en CPU mediante CTranslate2.
- Ejecución en CPU con cuantización INT8, lo que permite desplegar el modelo en servidores sin acelerador gráfico.
- Integración en aplicaciones finales: el autor indica que las aplicaciones de windyword.ai están construidas sobre esta familia de modelos.
- No se documenta soporte de tool calling, function calling, razonamiento en múltiples pasos, modo de pensamiento ni capacidades de agente.
- No se documentan capacidades multilingües más allá del par yap-inglés.

## Casos de uso

- Traducción de documentación administrativa y registros públicos: el modelo permite convertir textos oficiales redactados en yapés a inglés para su publicación o archivo, con despliegue en CPU mediante la variante INT8 si no hay GPU disponible.
- Digitalización y preservación lingüística: proyectos de documentación que recopilan textos escritos u orales en yapés pueden usar el modelo como primera pasada de traducción antes de la revisión por un hablante nativo.
- Investigación lingüística y anotación de corpus: permite generar glosas en inglés para corpus de yapés, acelerando la anotación manual y el análisis morfosintáctico.
- Atención al ciudadano en servicios públicos: los servicios de los Estados Federados de Micronesia pueden traducir consultas, formularios o comunicados del yapés al inglés para personal que no domina la lengua local.
- Localización de material educativo y sanitario: traducción de folletos, guías y avisos de salud o formación desde el yapés al inglés para su incorporación a programas internacionales.
- Traducción integrada en aplicaciones web o móviles: al existir una variante CTranslate2 INT8, el modelo puede servir traducciones en tiempo real desde un contenedor sin GPU, integrándose en el backend de una aplicación de traducción.
- Preprocesamiento de datos para entrenamiento: traducción automática de grandes volúmenes de texto en yapés para generar pares paralelos que alimenten modelos mayores o sistemas de recuperación bilingüe.
- Flujos de trabajo de campo con revisión humana: traducción asistida en la que el modelo produce un borrador en inglés y un traductor profesional lo corrige, reduciendo el tiempo de trabajo en comparación con la traducción manual desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que no hay puntuación de calidad publicada en el repositorio y remite a la página de catálogo del autor para consultar las puntuaciones de cribado, cuando estén medidas. No se dispone de datos de BLEU, chrF, COMET ni de evaluaciones comparativas frente a otros sistemas.

## Requisitos de hardware

- El repositorio completo ocupa 0,3 GB, incluyendo tokenizador, pesos y ambas variantes de despliegue; el peso de una única variante es sustancialmente menor. No se publica el número de parámetros, por lo que las estimaciones de VRAM no pueden calcularse con precisión a partir de la información disponible.
- La existencia de una variante CTranslate2 INT8 indica que el modelo está pensado para funcionar en CPU, sin requisitos de VRAM, en escenarios de baja concurrencia.
- La variante Transformers (lora/) está descrita por el autor como formato para inferencia en GPU, aunque se trata de un modelo de traducción de un par lingüístico concreto y tamaño de repositorio reducido, por lo que cabe esperar que quepa sin dificultad en GPU de gama consumer; no se publican cifras oficiales que lo confirmen.
- Opciones de despliegue documentadas: transformers (MarianMTModel y MarianTokenizer) para GPU y CTranslate2 para CPU con INT8. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta por frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WindstormLabs/translate-yap-en | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | HuggingFace, variantes Transformers y CTranslate2 INT8 |
| Helsinki-NLP/opus-mt-yap-en (modelo base) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Apache 2.0 | HuggingFace |
| Otras alternativas de traducción yapés-inglés | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dirección única: el modelo traduce únicamente de yapés a inglés; no se documenta soporte para la dirección inversa.
- Ausencia de evaluación publicada: no hay puntuación de calidad ni benchmarks en el repositorio, de modo que el rendimiento real en producción es desconocido y requeriría una evaluación propia antes de cualquier despliegue crítico.
- Riesgo de alucinación e infidelidad: al tratarse de un par de muy bajos recursos derivado de OPUS-MT, es esperable que aparezcan errores de omisión, invención de contenido o terminología inconsistente, especialmente en frases largas o dominios especializados; no se han publicado análisis de este comportamiento.
- Sesgos conocidos: no documentados en la información proporcionada. Al proceder de la familia OPUS-MT, cabe esperar el sesgo de dominio propio de los corpus paralelos de bajos recursos, extremo no verificado en esta ficha.
- Limitación de contexto: no se publica la longitud máxima de secuencia. Los modelos Marian de traducción suelen trabajar con ventanas cortas, por lo que es probable que los documentos largos deban fragmentarse, aunque este dato no está confirmado.
- Advertencia sobre procedencia de datos: las variantes WindyScripture fueron retiradas el 4 de octubre de 2026 mientras se revisan las licencias de los textos eBible que les servían de fuente. Aunque el autor lo califica de medida de precaución y no de conclusión legal, conviene tenerlo en cuenta al evaluar la trazabilidad de los datos.
- Licencia: Apache 2.0, lo que permite uso comercial y modificación, siempre que se conserve la atribución correspondiente. Deben revisarse los ficheros LICENSE y NOTICE.md del repositorio, así como la atribución a Helsinki-NLP como origen de los pesos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin evidencia de uso en producción por terceros.
- Duplicidad de repositorios: existe una copia canónica en la organización WindyTranslate, además del repositorio de WindstormLabs; conviene fijar una referencia concreta (commit o revisión) para evitar discrepancias entre copias.

## Enlaces

- Modelo en HuggingFace (WindstormLabs): https://huggingface.co/WindstormLabs/translate-yap-en
- Copia canónica (WindyTranslate): https://huggingface.co/WindyTranslate/translate-yap-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yap-en
- Página de catálogo y puntuaciones: https://windytranslate.com/models/translate-yap-en
- Aplicaciones construidas sobre la familia: https://windyword.ai
- Ficheros de licencia y atribución del repositorio: LICENSE y NOTICE.md en https://huggingface.co/WindstormLabs/translate-yap-en
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a guías sobre instalación de mods de Minecraft y no guardan relación con esta ficha.
