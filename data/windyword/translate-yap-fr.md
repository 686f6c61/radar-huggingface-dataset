# WindyWord/translate-yap-fr

## Resumen

WindyWord/translate-yap-fr es un modelo de traducción automática neuronal especializado en la dirección yapés → francés, publicado por WindyWord (Windstorm Labs) dentro de su catálogo abierto de modelos de traducción. Se trata de un ajuste fino del modelo OPUS-MT Helsinki-NLP/opus-mt-yap-fr, desarrollado por el grupo de investigación del mismo nombre de la Universidad de Helsinki y distribuido con licencia Apache-2.0. El modelo resuelve un caso de muy bajos recursos: el yapés es una lengua micronesia con una comunidad de hablantes reducida y una presencia mínima en corpus digitales, por lo que existen muy pocos sistemas de traducción disponibles para este par lingüístico.

Arquitectura y tamaño: el modelo hereda la arquitectura MarianMT, un transformer secuencial encoder-decoder con atención, propio de la familia OPUS-MT. El repositorio ocupa 0,3 GB e incluye dos variantes de despliegue: `lora/` (WindyStandard, formato Transformers para inferencia en GPU) y `lora-ct2-int8/` (cuantización INT8 en CTranslate2 para inferencia en CPU). No se publican en la model card ni el número de parámetros ni la longitud de contexto.

La relevancia actual del modelo es doble: por un lado, cubre un par lingüístico prácticamente ausente en los grandes modelos multilingües comerciales; por otro, forma parte de la infraestructura de las aplicaciones de Windy Word. Como advertencia relevante, el autor retiró temporalmente del repositorio las variantes `herm0-scripture/` y `scripture-ct2-int8/` mientras revisa las licencias de los textos eBible que sirvieron como fuente, lo que señala un riesgo de procedencia en el pipeline de datos de la familia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder seq2seq con atención), derivada de OPUS-MT |
| Parametros totales | no disponible (el repositorio completo ocupa 0,3 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 mediante CTranslate2 (`lora-ct2-int8/`); pesos sin cuantizar en `lora/` |
| Idiomas soportados | yap (yapés) como origen, fr (francés) como destino; traducción unidireccional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (variante Transformers/PyTorch) y formato CTranslate2 (variante INT8) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) de Helsinki-NLP/opus-mt-yap-fr, un sistema OPUS-MT basado en MarianMT. MarianMT es un transformer de secuencia a secuencia con encoder y decoder, entrenado originalmente con el framework Marian y orientado a traducción automática de alta eficiencia computacional. Los modelos OPUS-MT se entrenan sobre corpus paralelos extraídos del repositorio OPUS, y se caracterizan por un tamaño reducido en comparación con los modelos multilingües masivos, lo que permite su despliegue en hardware modesto.

La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco especifica hiperparámetros del ajuste fino ni si el proceso consistió en un fine-tune completo o en una adaptación mediante LoRA. El dato técnico más relevante de la ficha es la retirada temporal de las variantes `herm0-scripture/` y `scripture-ct2-int8/` mientras se revisan las licencias de los textos eBible de origen, lo que indica que parte del material de entrenamiento o de ajuste proviene de corpus bíblicos en yapés. Se trata de una medida cautelar declarada explícitamente como no concluyente por parte del autor.

## Capacidades

- Traducción automática de texto en yapés a francés, en una única dirección; la model card no documenta capacidad inversa francés → yapés.
- Inferencia en GPU mediante Transformers y PyTorch con la variante `lora/` (WindyStandard).
- Inferencia en CPU con cuantización INT8 mediante CTranslate2 con la variante `lora-ct2-int8/`, pensada para despliegues sin acelerador gráfico.
- Integración con la librería `transformers` mediante las clases `MarianMTModel` y `MarianTokenizer`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documenta cobertura multilingüe más allá del par yap-fr declarado.
- No se publica ninguna puntuación de calidad en el repositorio; el autor remite a su página de catálogo.

## Casos de uso

- Documentación administrativa para comunidades yapesas en el extranjero: traducción de formularios, notificaciones y textos legales del yapés al francés para hablantes que residen en territorios francófonos del Pacífico, aprovechando que el modelo está optimizado para texto formal y puede ejecutarse en CPU con la variante INT8.
- Digitalización y acceso a archivos históricos y etnográficos: traducción de registros coloniales, informes antropológicos y material de archivo redactado en yapés, facilitando su consulta por investigadores francófonos sin necesidad de conocimientos de la lengua original.
- Investigación en lingüística de bajos recursos: generación de traducciones de referencia y corpus paralelos preliminares yapés-francés que alimenten estudios comparativos o el entrenamiento de sistemas posteriores, dado que la escasez de datos es el principal cuello de botella del par lingüístico.
- Localización de contenido audiovisual y divulgativo: subtitulado de vídeos, materiales educativos o contenido comunitario en yapés para audiencias francófonas, usando la variante CTranslate2 por su bajo coste de inferencia en servidores sin GPU.
- Preservación y revitalización lingüística: apoyo a proyectos de documentación que necesiten glosas aproximadas en francés para textos recopilados en yapés, con revisión humana posterior por parte de hablantes nativos.
- Traducción de material religioso y comunitario: pese a la retirada temporal de las variantes específicas de escrituras, el modelo base sigue siendo utilizable para textos devocionales y publicaciones de comunidades yapesas, siempre que se verifiquen las licencias de los materiales de origen.
- Herramientas de aprendizaje de idiomas: integración en aplicaciones de estudio del yapés para hablantes de francés, ofreciendo traducciones de apoyo y ejemplos de uso, con la advertencia de que no existe validación de calidad publicada.
- Preprocesamiento en pipelines de datos multilingües: uso como componente de traducción pivote dentro de flujos más amplios que necesiten convertir contenido en yapés a una lengua de mayor cobertura como el francés antes de aplicar análisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publica ninguna puntuación de calidad en el repositorio y que las puntuaciones de cribado, cuando se han medido, se encuentran en la página del catálogo del autor, a la que se enlaza en la sección de enlaces.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 0,3 GB, por lo que la huella de pesos de cada variante es muy inferior a esa cifra; en la práctica, cualquier GPU con 4 GB o más debería alojar la variante `lora/` sin dificultad.
- GPU recomendadas: no se especifican. Por tamaño de repositorio, el modelo es apto para GPU consumer (RTX 3060, RTX 4090) e incluso para GPU de gama de entrada; no requiere A100 ni H100.
- GPU consumer: sí, cabe con holgura en cualquier GPU consumer con al menos 4 GB de VRAM. La variante INT8 está pensada directamente para CPU, sin GPU.
- Opciones de despliegue: Transformers con PyTorch (`MarianMTModel` + `MarianTokenizer`) para GPU, y CTranslate2 para CPU con cuantización INT8. No se documenta soporte de vLLM, Ollama, TGI ni llama.cpp en la información disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| WindyWord/translate-yap-fr | no disponible | no disponible | Apache-2.0 | yap → fr | HuggingFace, variantes Transformers y CTranslate2 INT8 | Ajuste fino de OPUS-MT; sin scores de calidad publicados; 0 descargas y 0 likes en el momento de la consulta |
| Helsinki-NLP/opus-mt-yap-fr | no disponible | no disponible | Apache-2.0 | yap → fr | HuggingFace (modelo base) | Sistema original de OPUS-MT del que deriva este modelo; sirve como referencia directa |
| Otros sistemas de traducción yapés-francés | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información disponible |

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre sistemas comparables: los enlaces recuperados no guardan relación con traducción automática ni con el proyecto, por lo que no se incluyen como fuentes.

## Limitaciones y advertencias

- Ausencia total de métricas de calidad publicadas: no hay BLEU, COMET ni ninguna otra puntuación verificable en el repositorio, lo que impide evaluar la fiabilidad real antes de desplegarlo en producción.
- Riesgo elevado de alucinación y de traducciones incorrectas: se trata de un par de muy bajos recursos, con corpus paralelos escasos, lo que típicamente produce salidas inestables en vocabulario especializado, nombres propios y estructuras gramaticales poco representadas.
- Direccionalidad única: solo traduce de yapés a francés. No se documenta la dirección inversa ni la posibilidad de usarlo como modelo bidireccional.
- Cobertura dialectal y ortográfica limitada: la variante del yapés presente en el corpus de entrenamiento no está documentada, por lo que puede fallar ante variantes ortográficas o registros no representados.
- Longitud de contexto no documentada: no hay información publicada sobre el máximo de tokens por segmento, lo que dificulta dimensionar el troceado de documentos largos.
- Caveat de procedencia de datos: las variantes basadas en textos eBible fueron retiradas del repositorio mientras se revisan las licencias de las fuentes, lo que introduce incertidumbre sobre la limpieza legal del pipeline de datos de la familia de modelos.
- Validación comunitaria nula: el modelo registra 0 descargas y 0 likes, sin evidencia pública de uso, revisión o pruebas independientes.
- Licencia permisiva con obligaciones de atribución: Apache-2.0 permite uso comercial y modificaciones, pero exige conservar el aviso de licencia, el archivo NOTICE.md y la atribución a OPUS-MT y a la Universidad de Helsinki. La revisión de la licencia de los textos de origen es responsabilidad del usuario si reutiliza derivados.
- Enlaces duplicados: la model card apunta a una copia canónica en la organización WindyTranslate, por lo que conviene verificar cuál de los dos repositorios recibe mantenimiento antes de fijar una versión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WindyWord/translate-yap-fr
- Copia canónica indicada por el autor: https://huggingface.co/WindyTranslate/translate-yap-fr
- Página de catálogo con puntuaciones y licencias: https://windytranslate.com/models/translate-yap-fr
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yap-fr
- Aplicaciones de Windy Word: https://windyword.ai
- Texto de licencia del repositorio: `LICENSE` (incluido en el repositorio)
- Atribución: `NOTICE.md` (incluido en el repositorio)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
