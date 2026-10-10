# tknika/gliner2-PII-basque-v2

## Resumen

gliner2-PII-basque-v2 es un modelo extractor de entidades nombradas (NER) especializado en la deteccion de informacion personal identificable (PII) en euskera, castellano y frances. Lo desarrolla tknika, entidad vinculada a la formacion profesional en el Pais Vasco, y es un ajuste fino del modelo multilingue fastino/gliner2-privacy-filter-PII-multi, que a su vez se apoya en la arquitectura GLiNER2 con un encoder mDeBERTa-v3-base. El modelo resuelve un problema muy concreto: anonimizar y auditar textos con datos personales en contextos administrativos y educativos del ambito vascoparlante, donde los detectores genericos rinden peor por la morfologia aglutinante del euskera.

La version 2 incorpora tres tipos de entidad especificos de entornos educativos (nombre de usuario, url personal e identificador de estudiante) y se ha entrenado con un dataset sintetico de replicacion con distribuciones realistas: frecuencias de nombres tomadas de estadisticas publicas y tripletas coherentes de calle, localidad y codigo postal extraidas de OpenStreetMap. Los valores sinteticos son validos por checksum (identificadores mod-23, IBAN mod-97, tarjetas con Luhn, telefonos con formatos reales), lo que permite generar datos de entrenamiento sin exponer PII real.

Con 307.098.645 parametros reales segun los pesos safetensors y un tamano de repositorio de 1,3 GB, es un modelo compacto que cabe sin problemas en GPU de consumo. Su relevancia actual radica en que combina un rendimiento alto en deteccion de PII (F1 micro de 0,934 sobre el conjunto de evaluacion) con la preservacion de las capacidades NER originales en euskera, algo que no siempre se consigue al hacer fine-tuning especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades) con encoder mDeBERTa-v3-base |
| Parametros totales | 307.098.645 (segun safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | euskera (eu), castellano (es), frances (fr) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | gliner2 |
| Modelo base | fastino/gliner2-privacy-filter-PII-multi |
| Tamano del repositorio | 1,3 GB |
| Tipo de tarea | named-entity-recognition, information-extraction |

Nota: la model card describe el modelo base como un detector multilingue de PII de 205M parametros, mientras que el recuento real de los safetensors de este repositorio es de 307.098.645. La diferencia no se explica en la informacion disponible.

## Arquitectura y entrenamiento

El modelo parte de fastino/gliner2-privacy-filter-PII-multi, un detector multilingue de PII construido sobre la arquitectura GLiNER2 con encoder mDeBERTa-v3-base. GLiNER2 es un esquema de extraccion de entidades basado en encoder que permite especificar en tiempo de inferencia la lista de tipos de entidad que se quieren detectar, sin necesidad de reentrenar la cabeza de clasificacion. Sobre esa base, tknika aplico un ajuste fino supervisado en euskera.

El entrenamiento combino dos fuentes de datos mediante experiencia de replicacion (experience replay) para evitar el olvido catastrofico de las capacidades de PII del modelo original. Por un lado, el split `nerc_id` de orai-nlp/basqueGLUE (2.842 frases), mapeado a los tipos del modelo base: nombre de persona, localidad, organizacion y miscelanea. Por otro, el split de entrenamiento (5.000 frases) de tknika/pii-synthetic-basque-v2, con frases en euskera, castellano y frances que cubren todo el Pais Vasco (Araba, Bizkaia, Gipuzkoa, Nafarroa e Iparralde), 17 tipos de PII y valores validos por checksum: identificadores nacionales mod-23, IBAN mod-97, tarjetas validas por Luhn y formatos de telefono reales.

La tecnica de ajuste fue LoRA con r=16 y alpha=32 aplicada a las cabezas de frontera y de tarea, con un adaptador de aproximadamente 13 MB que se fusiono en el modelo base tras el entrenamiento. El repositorio contiene el modelo fusionado independiente, el adaptador original en `lora-adapter/` y la receta completa de entrenamiento en `errezeta/`. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Extraccion de entidades nombradas (NER) y deteccion de PII en euskera, castellano y frances.
- Deteccion de 17 tipos de PII sobre el dataset de replicacion sintetica: nombre de persona, correo electronico, telefono, fecha, direccion, ciudad, fecha de nacimiento, codigo postal, nombre de usuario, url personal, organizacion, localidad, identificador de estudiante, numero de cuenta bancaria, identificador nacional, edad y numero de tarjeta de credito.
- Tipos de entidad configurables en tiempo de inferencia mediante la API `extract_entities`, sin reentrenamiento.
- Capacidades NER generales en euskera conservadas del ajuste: nombre de persona, localidad, organizacion y miscelanea en los conjuntos de BasqueGLUE.
- Deteccion especifica de identificadores educativos: handles de LMS y foros, incluidas menciones con `@`, urls personales (blogs y perfiles) e identificadores de estudiante.
- Clasificacion de valores con validacion estructural implicita: identificadores con checksum mod-23, IBAN con mod-97, tarjetas con Luhn y telefonos con formato real.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.

## Casos de uso

- Anonimizacion de foros y plataformas educativas: el modelo detecta nombres de usuario con menciones `@`, urls de blogs personales e identificadores de estudiante, por lo que puede integrarse en un paso previo de redaccion para sustituir esos campos antes de publicar conversaciones o exportar datos.
- Cumplimiento del RGPD en administraciones vascas: dado su soporte de euskera, castellano y frances con cobertura de las cinco zonas del Pais Vasco, sirve para localizar y etiquetar datos personales en expedientes y formularios multilingues antes de transferirlos o archivarlos.
- Redaccion de documentos legales y sanitarios: la deteccion fiable de identificadores nacionales, IBAN y numeros de tarjeta permitida enmascarar automaticamente datos sensibles en informes antes de compartirlos con terceros.
- Auditoria de bases de datos con texto libre: al poder definir la lista de tipos en cada llamada, se puede ejecutar el modelo sobre campos heterogeneos (comentarios, descripciones, notas) y generar un inventario de que categorias de PII aparecen en cada tabla.
- Preprocesado para entrenamiento de otros modelos: el modelo permite limpiar corpus vascos de datos personales antes de reutilizarlos como datos de entrenamiento, reduciendo el riesgo de memorizacion de PII en modelos posteriores.
- Moderacion de contenido en comunidades online: la deteccion de urls personales y handles ayuda a aplicar politicas de privacidad sobre contenidos generados por usuarios en euskera.
- Extraccion de metadatos estructurados: a partir de texto no estructurado (por ejemplo, descripciones de contacto) el modelo puede devolver localidad, codigo postal, direccion y telefono como entidades separadas, utiles para poblar formularios o CRMs.
- Sistemas de pseudonimizacion en pipelines de datos: el modelo cabe en una GPU de consumo, por lo que puede desplegarse como paso de preprocesado local sin enviar texto sensible a servicios externos.

## Benchmarks y rendimiento

Deteccion de PII sobre el split de evaluacion de tknika/pii-synthetic-basque-v2 (1.000 frases, 17 tipos, disjunto del entrenamiento por construccion):

| Modelo | Precision | Recall | Micro F1 |
|---|---|---|---|
| Base (zero-shot) | 0,647 | 0,742 | 0,691 |
| v1 (gliner2-PII-basque) | 0,761 | 0,862 | 0,808 |
| Este modelo (v2) | 0,949 | 0,919 | 0,934 |

F1 por tipo de este modelo (tipos ordenados por frecuencia; se muestran base y v1 para los tipos educativos):

| Tipo | F1 | Tipo | F1 |
|---|---|---|---|
| person name | 0,957 | personal url | 1,000 (base 0,175; v1 0,727) |
| email | 1,000 | organization | 0,726 |
| phone number | 0,992 | location | 0,000 (aviso) |
| user name | 0,996 (base 0,864; v1 0,671) | student id | 0,894 (v1 zero-shot 0,972) |
| date | 1,000 | bank account number | 1,000 |
| address | 0,990 | national id | 0,771 |
| city | 0,723 | age | 1,000 |
| date of birth | 0,997 | credit card number | 1,000 |
| zip code | 0,997 | | |

Basque NER, conjuntos de validacion de BasqueGLUE (500 frases por split), mostrando que el ajuste de PII no provoca olvido de las capacidades NER en euskera:

| Metrica | Base (zero-shot) | Este modelo |
|---|---|---|
| nerc_id/val person name F1 | 0,664 | 0,843 |
| nerc_id/val micro F1 | 0,464 | 0,769 |
| nerc_od/val (Wikipedia) person name F1 | 0,721 | 0,808 |
| nerc_od/val micro F1 | 0,547 | 0,725 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 307M parametros ocupan aproximadamente 1,2 GB; en fp16/bf16 alrededor de 0,6 GB. Con overhead de activaciones y tokenizacion, un presupuesto de 2 GB es suficiente. No se especifican cuantizaciones oficiales (los pesos se distribuyen en safetensors).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Una RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 o H100 pueden ejecutarlo sin problemas; para este tamano la GPU no es un cuello de botella.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo moderna (GTX 1060 6 GB en adelante) y tambien en CPU para lotes pequenos.
- Opciones de despliegue: la libreria oficial es `gliner2` mediante `AutoExtractor.from_pretrained`. Al distribuirse en safetensors, tambien puede cargarse con Transformers o servirse con frameworks genericos de inferencia; no se documenta soporte especifico para vLLM, Ollama, llama.cpp o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder de ~307M parametros, la inferencia es de paso unico (sin decodificacion autorregresiva), por lo que la latencia tipica es de milisegundos por frase en GPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Micro F1 (eval sintetica) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gliner2-PII-basque-v2 | 307.098.645 | no disponible | 0,934 | eu, es, fr | apache-2.0 | HuggingFace |
| gliner2-PII-basque (v1) | no disponible | no disponible | 0,808 | eu, es, fr | no disponible | HuggingFace |
| fastino/gliner2-privacy-filter-PII-multi | 205M (segun model card) | no disponible | 0,691 (zero-shot) | multilingue | no disponible | HuggingFace |

No se dispone en la informacion proporcionada de otros modelos comparables de deteccion de PII en euskera con los que contrastar parametros, contexto o licencia.

## Limitaciones y advertencias

- El conjunto de evaluacion de PII es sintetico. El propio autor advierte que el rendimiento en texto real (mas sucio, con contextos ambiguos) sera inferior al 0,934 de F1 micro reportado.
- El modelo etiqueta sistematicamente los nombres de localidad como `city` incluso donde se esperaria `location`; el F1 de `location` es 0 en el conjunto de evaluacion.
- La precision de `national id` es 0,63: el modelo sobrepredice este tipo sobre otros identificadores numericos.
- Los datos sinteticos de replicacion cubren 17 de los 42 tipos de PII del modelo base; los tipos no cubiertos pueden degradarse tras el ajuste fino.
- La evaluacion es de calidad de investigacion y no ha sido probada en produccion.
- La licencia del corpus de entrenamiento BasqueGLUE/EIEC deberia verificarse antes de redistribuir derivados mas alla de este modelo.
- Aunque el modelo se publica bajo apache-2.0, conviene revisar la licencia del modelo base (fastino/gliner2-privacy-filter-PII-multi) y de los datasets empleados antes de un uso comercial.
- No se documenta la longitud de contexto soportada, lo que impide garantizar el comportamiento en documentos largos.
- Riesgo de alucinacion de entidades: al ser un extractor, puede marcar como PII fragmentos que no lo son, especialmente en cadenas numericas ambiguas.
- Sesgos conocidos: no se documentan analisis de sesgo por genero, origen o variedad dialectal del euskera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tknika/gliner2-PII-basque-v2
- Version anterior (v1): https://huggingface.co/tknika/gliner2-PII-basque
- Modelo base: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
- Dataset sintetico de PII: https://huggingface.co/datasets/tknika/pii-synthetic-basque-v2
- Dataset BasqueGLUE: https://huggingface.co/datasets/orai-nlp/basqueGLUE
