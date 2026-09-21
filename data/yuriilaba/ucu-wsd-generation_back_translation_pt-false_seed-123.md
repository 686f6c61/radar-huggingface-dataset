# yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-123

## Resumen

El modelo `yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-123` es un ajuste fino de tipo encoder para desambiguacion de sentidos (word sense disambiguation, WSD) en ucraniano, desarrollado por el investigador Yurii Laba. Se construye sobre `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder multilingue basado en la arquitectura XLM-RoBERTa, y cuenta con 278.043.648 parametros totales segun los pesos en safetensors del repositorio (1,1 GB). El identificador del modelo sugiere una variante dentro de una familia de experimentos de generacion de datos mediante traduccion inversa (back-translation), con agrupamiento de token objetivo desactivado (`pt-false`) y semilla de entrenamiento 123.

El problema que aborda es la desambiguacion lexica en ucraniano: asignar el sentido correcto a una palabra polisemica dentro de una oracion. Su model card declara una precision WSD de 0,917 y correlaciones STS de 0,812 (Pearson) y 0,802 (Spearman), lo que lo situa como un componente util para tareas de similitud semantica y anotacion lexica en ese idioma. No obstante, el repositorio tiene 0 descargas y 0 me gusta en el momento de redactar esta ficha.

La relevancia de esta ficha es acotada y conviene ser honesto: se trata de un modelo de investigacion con documentacion minima (sin licencia declarada, sin idiomas declarados, sin longitud de contexto indicada y sin pipeline especificado). La busqueda web realizada no devolvio papers, blogs ni repositorios tecnicos asociados al modelo, por lo que la evaluacion se apoya exclusivamente en los datos de la model card y en el recuento de parametros del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder; ajuste fino de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (familia XLM-RoBERTa) |
| Parametros totales | 278.043.648 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible en la model card; el modelo base es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Descargas / me gusta | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-21 |
| Ultima actualizacion (metadatos) | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de la familia XLM-RoBERTa, reutilizado a traves del checkpoint `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que produce representaciones vectoriales de frases mediante pooling. El ajuste fino se realiza sobre tripletas, es decir, grupos de anclaje, positivo y negativo, lo que explica que la model card reporte simultaneamente metricas de desambiguacion (WSD accuracy) y de similitud semantica de frases (STS Pearson y Spearman). El recuento de 278.043.648 parametros coincide con el orden de magnitud esperado para un encoder XLM-R de tamano base, lo que apunta a que no se han anadido cabezas adicionales de gran tamano.

La model card documenta los siguientes hiperparametros y decisiones de entrenamiento: datos de entrenamiento en `local_datasets/semi_supervised_2/triplets/triplets_generation_translation.csv`; agrupamiento de token objetivo desactivado (`Target-token pooling: False`); semilla de entrenamiento 123; semilla de particion de validacion 42. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un encoder de este tipo). El nombre del modelo indica un esquema semiautomatico de generacion de datos con traduccion inversa, pero la model card no detalla el par de idiomas implicado en ese proceso.

## Capacidades

- Generacion de embeddings de frase y de palabra para ucraniano, orientados a comparacion por similitud coseno.
- Desambiguacion de sentidos (WSD) en ucraniano: precision declarada de 0,9169835234474017 en la evaluacion del autor.
- Evaluacion de similitud semantica textual (STS): Pearson 0,8124151228055252 y Spearman 0,8018229003333516.
- Resultados a nivel de tarea MTEB publicados en el directorio `evaluation/mteb_results/` del repositorio (valores no incluidos en la informacion disponible).
- Extraccion de caracteristicas para clasificacion, clustering o recuperacion semantica sobre texto en ucraniano.
- Capacidad multilingue heredada del modelo base, aunque no cuantificada ni validada tras el ajuste fino.
- No dispone de tool calling, function calling, modo de razonamiento explicito, vision, audio ni capacidades de agente: es un encoder, no un modelo generativo causal.

## Casos de uso

- Desambiguacion lexica en corpus ucranianos: el modelo asigna un vector a cada mencion de una palabra polisemica y permite agrupar las ocurrencias por sentido, lo que sirve para anotar lexicos o validar anotaciones manuales.
- Enlazado a recursos lexicos (WordNet, wordnets ucranianas): los embeddings de cada sentido se pueden alinear con synsets existentes para enriquecer un grafo lexico.
- Busqueda semantica en ucraniano: indexar documentos como vectores y recuperar por similitud coseno, con un rendimiento esperado alto en coste por consulta al tratarse de un encoder de 278 M de parametros.
- Deduplicacion y clustering de textos: agrupar noticias, opiniones o incidencias de soporte casi identicas mediante la similitud entre sus embeddings.
- Preprocesado para traduccion automatica o resumen: desambiguar previamente el sentido de terminos criticos para reducir errores en etapas posteriores del pipeline.
- Punto de partida para investigacion en generacion de datos: el modelo forma parte de una familia de variantes con semillas y configuraciones distintas, util para reproducir experimentos de back-translation en WSD.
- Evaluacion de similitud semantica en ucraniano dentro de suites tipo MTEB, como modelo candidato para la tarea de STS.
- Filtrado de resenas o moderacion semantica: clasificar textos por similitud contra un conjunto de prototipos etiquetados, sin necesidad de reentrenar el encoder.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WSD (ucraniano, evaluacion del autor) | Accuracy | 0,9169835234474017 |
| STS | Pearson | 0,8124151228055252 |
| STS | Spearman | 0,8018229003333516 |
| MTEB | Resultados a nivel de tarea | Publicados en `evaluation/mteb_results/`; valores no disponibles en la informacion proporcionada |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros), ni la composicion del conjunto de evaluacion, por lo que no es posible contextualizar estas cifras. La precision WSD de 0,917 corresponde al propio protocolo del autor y no ha sido verificada de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,11 GB en fp32 (278 M de parametros x 4 bytes), 0,56 GB en fp16/bf16 y 0,28 GB en int8. Con overhead de activaciones y tokenizer, 2 GB de VRAM son suficientes en fp16 y 4 GB en fp32.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.) y tambien en CPU, con mayor latencia.
- GPU de centro de datos (A100, H100, L40S) sobredimensionadas para inferencia; solo tendrian sentido para procesar lotes masivos o para reentrenamiento.
- Opciones de despliegue: `sentence-transformers`, `transformers` de Hugging Face, exportacion a ONNX mediante Optimum y Hugging Face Inference Endpoints.
- No se publica pesaje GGUF, por lo que Ollama y llama.cpp requeririan una conversion propia. vLLM y TGI no estan pensados para este tipo de encoder no generativo.
- Latencia y throughput: no disponibles. No se aportan mediciones en la model card ni existen datos publicados por terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| ucu-wsd-generation_back_translation_pt-false_seed-123 | 278.043.648 | Embeddings de frase y WSD en ucraniano | no disponible | Hugging Face, 0 descargas |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 (modelo base) | del orden de 278 M (no confirmado en la informacion disponible) | Embeddings de frase multilingues | no disponible en la informacion disponible | Hugging Face |
| xlm-roberta-base (familia del modelo base) | del orden de 278 M (no confirmado en la informacion disponible) | Encoder multilingue de proposito general | no disponible en la informacion disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas dentro de la informacion proporcionada; la busqueda web no devolvio referencias tecnicas utilizables. Cualquier comparacion cuantitativa requeriria ejecutar los tres modelos sobre el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite el uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados: el ajuste fino esta orientado a ucraniano y puede degradar el rendimiento multilingue del modelo base en otras lenguas.
- Longitud de contexto no documentada: los encoders de la familia XLM-RoBERTa trabajan con entradas limitadas y truncaran secuencias largas; se desconoce el limite efectivo de este ajuste.
- Riesgo de sesgo de dominio: el entrenamiento usa un unico fichero de tripletas de origen local, cuya composicion y cobertura lexica no se detallan; el rendimiento fuera de ese dominio es incierto.
- Riesgo de sobreajuste o fuga de datos: no se documenta el tamano del conjunto de evaluacion ni el protocolo de particion (solo la semilla de validacion, 42), por lo que la precision WSD de 0,917 debe tomarse con cautela.
- No es un modelo generativo: no produce texto, por lo que no aplican riesgos de alucinacion textual, pero si puede asignar un sentido incorrecto a una mencion y propagar ese error a etapas posteriores.
- Sin validacion externa: 0 descargas y 0 me gusta implican que no hay retroalimentacion de la comunidad ni replicaciones independientes de los resultados.
- Anomalia en los metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-21) son posteriores a la fecha habitual de publicacion de modelos comparables, lo que conviene verificar antes de citarlo.
- Los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre este modelo; no se han localizado papers, blogs ni demos asociados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-123
- Perfil del autor en Hugging Face: https://huggingface.co/yuriilaba
- Sitio personal del autor: https://yuriilaba.github.io/
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB declarados por el autor: directorio `evaluation/mteb_results/` dentro del repositorio del modelo
- No se han encontrado papers, repositorios de codigo ni demos adicionales en la busqueda web realizada.
