# vitalii-antipovich/bge-small-en-v1.5-conll2003-ner

## Resumen

El modelo `vitalii-antipovich/bge-small-en-v1.5-conll2003-ner` es un ajuste fino (fine-tuning) del modelo de embeddings `BAAI/bge-small-en-v1.5` reorientado a la tarea de reconocimiento de entidades nombradas (NER) sobre el corpus CoNLL-2003. Lo publica el usuario de HuggingFace vitalii-antipovich y esta etiquetado con el pipeline `token-classification`, lo que indica que su salida es una etiqueta por token (tipicamente en formato BIO) en lugar de un vector de embedding. Se apoya en una arquitectura transformer encoder-only de tipo BERT y cuenta con 33.215.625 parametros, lo que lo situa en la gama ultraligera.

La relevancia de este modelo radica en su tamano reducido: con algo mas de 33 millones de parametros y un repositorio de apenas 0,1 GB, es un candidato natural para extraccion de entidades en entornos con recursos limitados, inferencia en CPU o despliegues de alta concurrencia donde un modelo grande seria inviable. La contrapartida es que la informacion publicada es practicamente nula: la model card es la plantilla autogenerada de HuggingFace y no aporta datos de entrenamiento, licencia, idiomas ni evaluacion.

Conviene subrayar que se trata de un modelo derivado y no oficial. El modelo base, `bge-small-en-v1.5`, pertenece a la familia BGE desarrollada por BAAI (Beijing Academy of Artificial Intelligence) y esta disenado originalmente para recuperacion semantica y RAG. Este ajuste concreto lo reutiliza como clasificador de tokens, por lo que sus garantias de calidad, licencia y mantenimiento dependen exclusivamente del autor del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (derivado de BAAI/bge-small-en-v1.5); inferido del tag `bert`, no confirmado en la model card |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base bge-small-en-v1.5 emplea 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible en la model card; el corpus CoNLL-2003 es en ingles, por lo que se presume soporte unicamente de ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-small-en-v1.5`, un encoder-only basado en BERT que la documentacion de BGE describe como parte de la primera generacion de modelos de la familia lanzada en agosto de 2023, y cuya version 1.5 se entreno con aprendizaje contrastivo con temperatura de 0,01 para corregir la distribucion de similitudes (que en la version original se concentraba en el intervalo [0,6, 1]). Sobre esa base, este fine-tuning incorpora una cabeza de clasificacion de tokens para producir etiquetas de entidad por token, presumiblemente siguiendo el esquema BIO de CoNLL-2003 (PER, LOC, ORG y MISC).

No se ha publicado informacion sobre el procedimiento de entrenamiento: ni el numero de tokens de ajuste, ni la composicion exacta del dataset, ni hiperparametros, ni si se aplicaron tecnicas como RLHF o DPO (que, en cualquier caso, no son habituales en tareas de etiquetado de secuencias). El tag `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono citado en la plantilla de la model card, no a un paper propio del modelo. Tampoco se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto en ingles, con etiquetado a nivel de token.
- Extraccion de entidades de las cuatro categorias clasicas de CoNLL-2003: persona (PER), localizacion (LOC), organizacion (ORG) y miscelanea (MISC).
- Clasificacion de secuencias a nivel de token en general, al estar registrado con el pipeline `token-classification`.
- Inferencia rapida y con huella de memoria muy reducida, gracias a sus 33 millones de parametros.
- No es un modelo generativo: no produce texto libre, por lo que no soporta generacion, razonamiento conversacional, codigo ni matematicas.
- No dispone de soporte declarado de tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades multilingues mas alla del previsible ingles del corpus CoNLL-2003.
- No se declaran modos especiales (thinking mode, vision, audio, decodificacion especulativa) ni otros extras.

## Casos de uso

- Extraccion de entidades en documentos legales y contratos: el modelo puede etiquetar nombres de personas, organizaciones y localizaciones en textos en ingles para alimentar indices de busqueda o sistemas de gestion documental, con un coste computacional minimo por su tamano.
- Preprocesado para pipelines de RAG: al identificar entidades antes de la recuperacion, permite enriquecer los metadatos de los fragmentos y mejorar el filtrado por entidad en un sistema de recuperacion aumentada.
- Anonimizacion y enmascarado de datos personales (PII): deteccion de entidades de tipo PER y LOC para sustituirlas o redactarlas en flujos de cumplimiento normativo, aunque siempre requerira validacion humana dada la ausencia de metricas publicadas.
- Analisis de noticias y monitorizacion de medios: extraccion de organizaciones y personas de articulos en ingles para construir grafos de conocimiento o alertas de menciones.
- Enriquecimiento de bases de datos y CRM: clasificacion de registros de texto libre para poblar campos estructurados de entidad de forma automatica.
- Etiquetado previo (pre-anotacion) para anotadores humanos: dado su bajo coste, sirve como primer paso en proyectos de anotacion de corpus, reduciendo el esfuerzo manual antes de la revision final.
- Inferencia en el borde o en CPU: al tratarse de un modelo de 33 millones de parametros, puede ejecutarse en servidores sin GPU o incluso en dispositivos con recursos muy limitados para tareas de etiquetado en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor es la plantilla autogenerada de HuggingFace y no incluye metricas de evaluacion (F1, precision, recall) sobre el conjunto de test de CoNLL-2003 ni sobre ningun otro corpus. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 y del orden de 130-260 MB en FP16 o INT8, dado el tamano de 33 millones de parametros.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente (RTX 3060, RTX 4090, T4, A10, A100, H100); el modelo no aprovechara la capacidad de aceleradores de gama alta salvo en escenarios de lote muy grande.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU: es viable ejecutarlo en portatiles y en contenedores sin acelerador.
- Opciones de despliegue: `transformers` (libreria declarada), exportacion a ONNX Runtime, y servidores de inferencia genericos que soporten modelos de clasificacion de tokens. Las herramientas orientadas a embeddings (por ejemplo, Text Embeddings Inference) y los motores de decodificacion generativa como vLLM no estan pensados para este tipo de tarea.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja por lotes pequenos, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que cualquier comparacion cuantitativa seria especulativa. A continuacion se ofrece una comparacion orientativa a nivel de categoria, con datos que deben verificarse en cada model card original:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bge-small-en-v1.5-conll2003-ner (este) | 33.215.625 | no disponible (base: 512) | NER / token-classification | no disponible | HuggingFace |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 M | 512 | Embeddings / recuperacion | MIT (segun su model card original) | HuggingFace |
| dslim/bert-base-NER | ~108 M | 512 | NER en ingles | MIT (segun su model card original) | HuggingFace |
| Modelos de NER de spaCy (pipeline en_core_web_trf / sm) | variable | variable | NER en ingles | MIT / licencias propias de spaCy | spaCy y GitHub |

La comparativa con `dslim/bert-base-NER` o con los pipelines de spaCy es indicativa: no se ha verificado su rendimiento frente a este modelo concreto y no existen metricas publicadas para establecer una jerarquia fiable.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no especifica autor efectivo del entrenamiento, datos, hiperparametros ni proceso de evaluacion, lo que impide auditar el modelo.
- Licencia no declarada: al no figurar licencia, no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor o asumir el riesgo legal antes de desplegarlo en produccion.
- Cero adopcion verificable: registra 0 descargas y 0 "likes", lo que sugiere que no ha sido validado por la comunidad.
- Idiomas: la unica pista es el corpus CoNLL-2003, en ingles; usarlo con otros idiomas probablemente degrade el rendimiento, pero no hay datos confirmatorios.
- Taxonomia limitada: las entidades cubiertas previsiblemente se restringen a PER, LOC, ORG y MISC, por lo que no reconocera tipos especializados (productos, enfermedades, importes, etc.).
- Riesgo de error en la clasificacion: al no ser un modelo generativo, no "alucina" texto, pero si puede asignar etiquetas incorrectas o fragmentar entidades de forma erronea, especialmente en dominios distintos al de entrenamiento.
- Deriva respecto al modelo base: el ajuste convierte un modelo de embeddings en un clasificador; no debe usarse para las tareas originales de recuperacion semantica que ofrecia bge-small-en-v1.5.
- Fecha de creacion inusual (2026-10-04) y sin actualizaciones posteriores registradas, lo que dificulta interpretar su ciclo de vida.
- Sesgos: no evaluados ni documentados; al derivar de un corpus de noticias en ingles, es probable que herede sesgos de representacion del mismo, aunque no hay analisis disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vitalii-antipovich/bge-small-en-v1.5-conll2003-ner
- Modelo base en HuggingFace: https://huggingface.co/BAAI/bge-small-en-v1.5
- Version previa del modelo base: https://huggingface.co/BAAI/bge-small-en
- Documentacion de BGE v1 y v1.5: https://bge-model.com/bge/bge_v1_v1.5.html
- Repositorio FlagEmbedding (BAAI): https://github.com/FlagEmbedding/FlagEmbedding
- Espejo no oficial en GitHub: https://github.com/abis330/bge-small-en-v1.5/
- Ficha de referencia del modelo base: https://www.modelvault.space/models/bge-small-en-v1-5
- Articulo citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
