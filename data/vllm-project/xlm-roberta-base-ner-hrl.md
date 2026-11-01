# vllm-project/xlm-roberta-base-ner-hrl

## Resumen

xlm-roberta-base-ner-hrl es un modelo de reconocimiento de entidades nombradas (NER) basado en XLM-RoBERTa base y ajustado para diez idiomas de altos recursos: arabe, aleman, ingles, espanol, frances, italiano, leton, neerlandes, portugues y chino. Reconoce tres categorias de entidades: localizacion (LOC), organizacion (ORG) y persona (PER), con etiquetado BIO que distingue el inicio y la continuacion de entidades consecutivas del mismo tipo. El checkpoint publicado bajo el identificador vllm-project es una copia del original Davlan/xlm-roberta-base-ner-hrl, realizada por el equipo de vLLM para reducir el riesgo de cadena de suministro en sus pruebas de integracion continua.

El modelo emplea la arquitectura transformer encoder de XLM-RoBERTa base, con 277.460.491 parametros (aproximadamente 278 millones) y una cabeza de clasificacion de tokens para las siete etiquetas del esquema BIO. No es un modelo generativo: su salida es una secuencia de etiquetas por token, lo que lo hace adecuado para tareas de extraccion de informacion estructurada en pipelines de procesamiento de lenguaje natural.

Su relevancia actual es practica: ofrece un NER multilingue ligero, con licencia AFL-3.0 y pesos en safetensors, que puede desplegarse en CPU o en GPU de gama baja. La copia en la organizacion vllm-project garantiza disponibilidad estable para pruebas de CI, aunque el modelo de referencia y la documentacion original siguen residiendo en la cuenta personal de Davlan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de tokens |
| Parametros totales | 277.460.491 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | arabe, aleman, ingles, espanol, frances, italiano, leton, neerlandes, portugues, chino |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder multilingue preentrenado con enmascaramiento de tokens sobre corpus multilingues. Sobre esa base se anade una cabeza de clasificacion de tokens que asigna a cada subtoken una de las siete etiquetas del esquema BIO: O, B-PER, I-PER, B-ORG, I-ORG, B-LOC e I-LOC. El ajuste fino se realizo con los hiperparametros recomendados por HuggingFace sobre una NVIDIA V100.

Los datos de entrenamiento son una agregacion de corpus anotados por idioma: ANERcorp para arabe, CoNLL-2003 para aleman e ingles, CoNLL-2002 para espanol y neerlandes, Europeana Newspapers para frances, Italian I-CAB para italiano, Latvian NER para leton, Paramopama + Second Harem para portugues y MSRA para chino. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO, algo esperable en un modelo discriminativo de este tipo. La innovacion principal es la cobertura multilingue con un unico conjunto de pesos y un esquema de etiquetado que resuelve entidades adyacentes del mismo tipo.

## Capacidades

- Reconocimiento de entidades nombradas de tipo persona (PER), organizacion (ORG) y localizacion (LOC) en texto.
- Etiquetado BIO que distingue el inicio (B-) y la continuacion (I-) de entidades consecutivas del mismo tipo.
- Procesamiento multilingue en diez idiomas con un unico checkpoint.
- Integracion directa con el pipeline `ner` de Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Extraccion de entidades por token con puntuaciones de confianza, util para umbrales de filtrado.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Extraccion de entidades en articulos de prensa: el modelo se entrena sobre corpus periodisticos y puede identificar personas, organizaciones y lugares en noticias multilingues para alimentar indices de busqueda o bases de datos editoriales.
- Enriquecimiento de CRM y bases de contactos: a partir de correos, notas y descripciones libres, se extraen nombres de personas y empresas para normalizar y deduplicar registros.
- Anonimizacion y seudonimizacion de datos personales: la deteccion de PER permite enmascarar nombres en textos antes de compartirlos con terceros o almacenarlos, como paso previo a cumplimiento normativo.
- Analisis de documentos financieros y legales: la identificacion de ORG y LOC facilita la extraccion de contrapartes y jurisdicciones en contratos e informes multilingues.
- Preprocesamiento para sistemas de respuesta a preguntas y RAG: las entidades detectadas pueden usarse como metadatos o filtros en la recuperacion documental.
- Monitorizacion de medios y analisis de reputacion: el seguimiento de menciones de ORG y PER en distintos idiomas permite construir paneles de presencia mediatica.
- Etiquetado asistido en proyectos de anotacion: el modelo genera preanotaciones que los anotadores humanos revisan, reduciendo el coste en corpus multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 1,1 GB solo para pesos, mas memoria de activaciones; en fp16 aproximadamente 0,55 GB de pesos.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con al menos 2-4 GB de VRAM libre segun el tamano de lote.
- Puede ejecutarse en CPU para cargas de baja latencia o por lotes, dado su tamano de 278 millones de parametros.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; V100 fue la GPU usada en el entrenamiento original.
- Opciones de despliegue: Transformers con pipeline `ner`, TorchServe, o servidores de inferencia compatibles con modelos de clasificacion de tokens; vLLM lo emplea en sus pruebas de CI, aunque vLLM esta orientado a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Entidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlm-roberta-base-ner-hrl (este) | 277,5 M | 10 | PER, ORG, LOC | AFL-3.0 | HuggingFace (copia vllm-project y original Davlan) |
| Davlan/xlm-roberta-base-ner-hrl | 277,5 M | 10 | PER, ORG, LOC | AFL-3.0 | HuggingFace (cuenta personal) |
| xlm-roberta-large-ner-hrl | no disponible en la informacion | 10 | PER, ORG, LOC | no disponible en la informacion | HuggingFace |
| Modelos NER monolingues basados en BERT/RoBERTa | variable | 1 | variable | variable | HuggingFace |

La comparativa se limita a la familia xlm-roberta-ner-hrl; no se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se entrena con articulos periodisticos anotados de un periodo concreto; puede generalizar mal a dominios distintos como textos clinicos, legales o conversacionales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos en la deteccion de entidades, especialmente con nombres ambiguos o fuera del dominio.
- La cobertura linguistica se limita a diez idiomas de altos recursos; no se garantiza un comportamiento adecuado en otras lenguas.
- No se documentan sesgos especificos en la informacion disponible, pero los corpus de noticias pueden reflejar sesgos geograficos y de representacion.
- La licencia AFL-3.0 permite uso comercial con obligaciones de atribucion y de compartir modificaciones bajo la misma licencia; conviene revisar los terminos completos antes de integrarlo en produccion.
- La copia en vllm-project es una instantanea del commit 253f557 del repositorio original; para correcciones o actualizaciones debe consultarse la fuente original.
- No se especifican limitaciones de longitud de contexto en la model card; XLM-RoBERTa base admite entradas de hasta 512 tokens, por lo que textos mas largos requieren fragmentacion.

## Enlaces

- Copia en vllm-project: https://huggingface.co/vllm-project/xlm-roberta-base-ner-hrl
- Modelo original: https://huggingface.co/Davlan/xlm-roberta-base-ner-hrl
- ANERcorp: https://camel.abudhabi.nyu.edu/anercorp/
- CoNLL-2003: https://www.clips.uantwerpen.be/conll2003/ner/
- CoNLL-2002: https://www.clips.uantwerpen.be/conll2002/ner/
- Europeana Newspapers NER: https://github.com/EuropeanaNewspapers/ner-corpora/tree/master/enp_FR.bnf.bio
- Italian I-CAB: https://ontotext.fbk.eu/icab.html
- Latvian NER: https://github.com/LUMII-AILab/FullStack/tree/master/NamedEntities
- Paramopama + Second Harem: https://github.com/davidsbatista/NER-datasets/tree/master/Portuguese
- MSRA NER: https://huggingface.co/datasets/msra_ner
