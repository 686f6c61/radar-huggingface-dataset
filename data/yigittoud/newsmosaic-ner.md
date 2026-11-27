# yigittoud/newsmosaic-ner

## Resumen

NewsMosaic NER es un modelo de reconocimiento de entidades nombradas (NER) para ingles, obtenido mediante fine-tuning de `google-bert/bert-base-cased` sobre el corpus CoNLL-2003. Lo publica el autor `yigittoud` como componente del proyecto de investigacion NewsMosaic, una aplicacion de NLP orientada al analisis de noticias que combina clasificacion tematica, estimacion de sesgo linguistico y extraccion de entidades. El modelo resuelve la tarea de token classification con un esquema BIO de nueve etiquetas (PER, ORG, LOC, MISC y O).

Arquitectonicamente es un transformer encoder BERT-base con una cabeza de clasificacion de tokens, 107.726.601 parametros y un contexto de entrenamiento limitado a 256 tokens. No incorpora innovaciones de decodificacion ni modulos MoE: es un checkpoint clasico de fine-tuning supervisado, con 3 epocas, learning rate 2e-5 y seleccion del mejor checkpoint por F1 a nivel de entidad en validacion.

Su relevancia practica es acotada pero clara: sirve como baseline ligero y reproducible para extraccion de entidades en texto periodistico en ingles, con un rendimiento declarado de 0,8893 de F1 a nivel de entidad en el test de CoNLL-2003. Es un modelo pequeno, desplegable en CPU y GPU de consumo, adecuado para pipelines de enriquecimiento de articulos mas que para tareas generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base-cased + cabeza de token classification (transformer encoder) |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones publicadas; al ser safetensors FP32/FP16 es convertible a INT8/INT4 con herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (el campo de licencia aparece vacio en la informacion proporcionada) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-cased`, un transformer encoder de 12 capas con atencion bidireccional completa, y anade una cabeza lineal de clasificacion de tokens sobre las representaciones contextuales. La salida son nueve etiquetas BIO: `O`, `B-PER`/`I-PER`, `B-ORG`/`I-ORG`, `B-LOC`/`I-LOC` y `B-MISC`/`I-MISC`. El tokenizador rapido alinea las etiquetas a nivel de palabra del dataset con los subtokens de BERT, y los tokens especiales se excluyen del calculo de perdida y de la evaluacion.

El entrenamiento se realizo sobre CoNLL-2003 English NER, un benchmark de texto de agencia de noticias derivado del Reuters Corpus, con splits de train, desarrollo y test. La configuracion documentada es de 3 epocas, learning rate 2e-5, batch size de 16 en entrenamiento y evaluacion, weight decay 0,01, semilla 42 y longitud maxima de 256 tokens. La seleccion del checkpoint final se hizo por mejor F1 de entidad en validacion. No se documenta uso de RLHF, DPO ni decodificacion especulativa; es fine-tuning supervisado estandar. El corpus CCNews de 125.000 articulos (2020-2024) empleado en el proyecto NewsMosaic se uso para inferencia downstream, no como datos etiquetados de entrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas en ingles con cuatro tipos: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC).
- Etiquetado BIO a nivel de subtoken con postprocesado para reconstruir menciones completas (agregacion de entidades contiguas).
- Extraccion de menciones en texto periodistico y en textos razonablemente similares (prosa informativa en ingles).
- Salida con puntuaciones de confianza por entidad, util para filtrar por umbral.
- Integracion directa con el pipeline `token-classification` de Transformers mediante `aggregation_strategy="simple"`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- Enriquecimiento de articulos periodisticos: extraer personas, organizaciones y lugares de cada pieza para construir indices estructurados y facilitar busquedas por entidad dentro de un archivo de noticias.
- Analisis de prominencia de menciones: comparar que entidades aparecen con mas frecuencia en coberturas de distintos medios o periodos, tal como plantea el proyecto NewsMosaic para su corpus CCNews.
- Baseline para pipelines NER en produccion: servir como referencia rapida y barata antes de adoptar modelos mayores, con 107,7 M de parametros y latencia baja en CPU.
- Preetiquetado para anotacion humana: generar candidatos de entidades que un anotador revise, reduciendo el coste de construir datasets NER propios en dominios informativos.
- Monitorizacion de reputacion y marca: detectar menciones de una organizacion concreta en flujos de noticias y clasificar el contexto por tipo de entidad coocurrente.
- Alimentacion de sistemas de grafos de conocimiento: convertir texto no estructurado en tripletas provisionales (entidad, tipo, documento) para enlazar posteriormente con bases de conocimiento.
- Filtrado y deduplicacion de noticias: usar las entidades detectadas como caracteristica adicional en modelos de clustering o recomendacion de articulos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de CoNLL-2003:

| Metrica | Resultado |
|---|---|
| F1 a nivel de entidad | 0,8893 (88,93 %) |
| Precision a nivel de token | no disponible |
| Recall a nivel de token | no disponible |
| Accuracy a nivel de token | 0,9698 (96,98 %) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni mediciones sobre el corpus CCNews de 125.000 articulos. El autor advierte explicitamente que las cifras de CoNLL-2003 no miden el rendimiento en fuentes, periodos o estilos nuevos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo de pesos (107,7 M de parametros), mas activaciones; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En FP16: alrededor de 0,22 GB de pesos; en INT8, unos 0,11 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o RTX 4090; para desarrollo, RTX 3060/4060 o T4.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida.
- Despliegue: Transformers con pipeline `token-classification`, ademas de opciones estandar como vLLM (soporte limitado para modelos encoder de clasificacion), TGI, ONNX Runtime, TorchScript o exportacion a GGUF para llama.cpp segun compatibilidad de la herramienta.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano y contexto de 256 tokens, se espera latencia de milisegundos por frase en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 CoNLL-2003 (entidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NewsMosaic NER (este modelo) | 107,7 M | 256 tokens | NER ingles | 0,8893 | no disponible | Hugging Face |
| dslim/bert-base-NER | ~108 M | 512 tokens (BERT estandar) | NER ingles | no disponible en esta ficha | MIT (segun su model card publica) | Hugging Face |
| google-bert/bert-base-cased (base) | 108 M | 512 tokens | MLM base, sin cabeza NER | no aplica | Apache 2.0 (segun su model card publica) | Hugging Face |

La comparacion con alternativas se limita a modelos de la misma familia y tamano; no se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer una comparativa de rendimiento rigurosa. Cualquier eleccion entre estos checkpoints deberia validarse sobre el dominio objetivo.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 256 tokens: los textos mas largos deben dividirse en fragmentos, con riesgo de perder entidades que crucen el corte.
- Entrenado exclusivamente con CoNLL-2003 (newswire Reuters): puede degradarse en generos como redes sociales, texto juridico, ciencia o transcripciones.
- El esquema de cuatro tipos (PER, ORG, LOC, MISC) es grueso; no distingue subtipos como cargos, productos o eventos.
- Riesgo de alucinacion estructural: el modelo predice spans de texto, no identidades verificadas; una mencion detectada no implica que la afirmacion sobre la entidad sea cierta ni que su rol en la noticia sea correcto.
- Sesgos de dominio y de anotacion heredados de CoNLL-2003, incluida la sobrerrepresentacion de entidades de actualidad de finales de los noventa y principios de los dos mil.
- Licencia no disponible: el campo aparece vacio en la informacion proporcionada, por lo que no puede confirmarse el uso comercial; debe consultarse al autor antes de desplegarlo en produccion.
- Sin garantias de calibracion de las puntuaciones de confianza; conviene fijar umbrales empiricamente sobre datos propios.
- Modelo de investigacion con 51 descargas y 0 likes en el momento de la consulta: soporte comunitario y mantenimiento limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yigittoud/newsmosaic-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Repositorio del proyecto NewsMosaic: https://github.com/yigittakk/NewsMosaic
- Demo en Streamlit: https://newsmosaic.streamlit.app
- Dataset CoNLL-2003 NER: https://www.clips.uantwerpen.be/conll2003/ner/
