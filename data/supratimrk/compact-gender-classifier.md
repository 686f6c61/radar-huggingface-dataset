# SupratimRK/compact-gender-classifier

## Resumen

CompactGenderClassifier es un clasificador de texto binario (masculino/femenino) a partir de nombres propios de persona, desarrollado por el usuario SupratimRK y publicado en HuggingFace bajo licencia MIT. A diferencia de las aproximaciones habituales basadas en BERT preentrenado, este modelo se ha entrenado desde cero (scratch) sobre un corpus auditado de 976.267 registros etiquetados, con el objetivo de ofrecer una inferencia extremadamente rapida y ligera sin dependencias externas.

El modelo es un transformer encoder de 2 capas con 128 dimensiones ocultas, 4 cabezas de atencion y un total de 532.482 parametros. Su vocabulario WordPiece propio de 4.000 tokens, junto con embeddings factorizados y pooling dual (media + maximo enmascarados), reduce el peso final a unos 632 KB en formato ONNX INT8. La latencia declarada es de 0,475 ms por consulta en un unico hilo de CPU, con un throughput de 2.105 consultas por segundo.

La relevancia de este modelo reside en su nicho: tareas de clasificacion por nombre en pipelines de produccion (registro de usuarios, CRM, moderacion, enriquecimiento de datos) donde el coste, el tamano y la latencia importan mas que la precision absoluta de un modelo grande. Esta optimizado para ejecucion en Node.js mediante `onnxruntime-node`, sin necesidad de Python en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (2 capas, 128 dimensiones ocultas, 4 cabezas de atencion, Pre-LayerNorm, activacion GELU) |
| Parametros totales | 532.482 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 20 tokens (longitud de secuencia maxima) |
| Tipos de cuantizacion | INT8 (cuantizacion dinamica, ~632 KB) y FP32 (~2,1 MB) |
| Idiomas soportados | Ingles (declarado); el dataset de entrenamiento incluye nombres de origen indio y global |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8 y FP32) y checkpoint PyTorch (.pt) |
| Vocabulario | 4.000 tokens WordPiece, 100 % uncased |
| Dimensionalidad de representacion | 256 (128 MeanPool + 128 MaxPool enmascarados) |
| Repositorio | SupratimRK/compact-gender-classifier |
| Tarea (pipeline) | text-classification (clasificacion binaria de genero) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder compacto entrenado desde cero, sin pesos preentrenados. Consta de 2 capas con 128 dimensiones ocultas y 4 cabezas de atencion, con Pre-LayerNorm (`norm_first=True`) y activaciones GELU. Los embeddings son factorizados: una `Embedding(4000, 64)` seguida de una `Linear(64, 128, bias=False)`, lo que reduce a la mitad el parametro footprint de esta capa sin perdida de capacidad representacional declarada. La cabeza de clasificacion combina Masked Mean Pooling (128 dimensiones) y Masked Max Pooling (128 dimensiones) en una representacion de 256 dimensiones, donde el max pooling actua como detector de morfemas portadores de genero.

El entrenamiento se realizo sobre un dataset curado y auditado de 976.267 registros etiquetados (889.912 de entrenamiento y 86.355 de validacion), con 485.000 etiquetas femeninas y 491.000 masculinas, procedentes de origenes culturales globales e indios. No se menciona el uso de RLHF ni DPO; se trata de un clasificador supervisado de texto. La innovacion principal es el tokenizador WordPiece propio de 4.000 tokens, configurado con `Sequence([NFKC(), Lowercase(), StripAccents()])` y `Sequence([Whitespace(), Punctuation(), Digits(individual_digits=True)])`, que captura subpalabras morfologicas de genero (`-a`, `-i`, `-ya`, `-ini`, `-wati` para femenino; `-an`, `-ar`, `-esh`, `-kumar` para masculino) en distintos idiomas. El pipeline aisla el nombre de pila antes de clasificar, de modo que los apellidos no introducen etiquetas de genero espurias.

## Capacidades

- Clasificacion binaria de genero (masculino/femenino) a partir de un nombre propio.
- Extraccion integrada del nombre de pila: maneja nombres simples ("Supratim"), nombres completos ("Supratim Mondal") y tratamientos ("Dr. Rahul Verma").
- Normalizacion 100 % uncased del texto (NFKC, minusculas, eliminacion de acentos), lo que elimina artefactos de mayusculas y acentos.
- Inferencia de bajisima latencia (sub-milisegundo) apta para entornos de alto throughput.
- Ejecucion sin Python en produccion mediante el runtime Node.js (`onnxruntime-node`).
- Modo por lotes (batch inference) disponible a traves del script Python de prediccion.
- Cobertura de nombres de origen indio y global, segun la composicion declarada del dataset.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de texto puro.
- No dispone de modo thinking, vision, audio ni generacion de texto.

## Casos de uso

- Enriquecimiento de bases de datos de usuarios: inferir el genero probable a partir del nombre en un pipeline ETL, procesando lotes a gran velocidad (> 2.000 consultas/s por nucleo) sin necesidad de GPU.
- Personalizacion de plantillas de comunicacion: adaptar el tratamiento ("estimado"/"estimada") en emails transaccionales o notificaciones en tiempo real, donde la latencia sub-milisegundo evita cuellos de botella.
- Registro y onboarding de usuarios: prellenar el campo de genero en formularios a partir del nombre introducido, con normalizacion uncased que tolera mayusculas y acentos.
- Limpieza y segmentacion de CRM: clasificar grandes volumenes de contactos para campanas segmentadas, aprovechando el reducido tamano del modelo (632 KB) para despliegue en microservicios ligeros.
- Moderacion o analitica de comunidades: inferir distribucion de genero en foros o comentarios a partir del nombre mostrado del autor, como metrica agregada.
- Servicios serverless y edge: al ejecutarse solo con ONNX Runtime en Node.js sin Python, encaja en funciones Lambda, Cloudflare Workers o contenedores minimos con CPU compartida.
- Preprocesado en pipelines NLP: generar atributos auxiliares (genero inferido) antes de otras tareas de analisis, con coste computacional despreciable.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| F1 Score (macro, clases) | 0,8444 |
| Accuracy | 0,8444 |
| Conjunto de evaluacion | 86.355 registros (split de validacion) |
| Latencia CPU (un hilo) | 0,475 ms por consulta |
| Throughput | 2.105 consultas/s (nucle unico, Node.js) |
| Suite de test (18 casos) | 18/18 (100 %) |

El autor compara su modelo con una version previa basada en modelo preentrenado:

| Metrica | Modelo preentrenado previo | CompactGenderClassifier |
|---|---|---|
| Tamano INT8 ONNX | 4,30 MB (2,45 MB podado) | ~632 KB |
| Parametros totales | 4.380.000 | 532.482 |
| Tamano de vocabulario | 30.522 tokens | 4.000 tokens |
| Longitud de secuencia | 16 tokens | 20 tokens |
| Latencia CPU | ~1,20 ms | 0,475 ms |
| Throughput | ~800 consultas/s | 2.105 consultas/s |
| Precision de validacion | 84,79 % | 84,44 % |
| Suite de test | 55,6 % (10/18) | 100 % (18/18) |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo INT8 ocupa ~632 KB en memoria, por lo que cabe holgadamente en CPU y en cualquier dispositivo con recursos minimos.
- GPU: no necesaria. Cualquier GPU (RTX 4090, A100, H100) seria sobredimensionada para esta tarea.
- Cabe en cualquier CPU de consumo e incluso en entornos embebidos; la inferencia declarada es de 0,475 ms en un solo hilo.
- Opciones de despliegue: ONNX Runtime en Node.js (`onnxruntime-node`, sin Python) y ONNX Runtime en Python; tambien se puede cargar el checkpoint PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput declarados: 0,475 ms por consulta y 2.105 consultas/s por nucleo de CPU en Node.js.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La model card unicamente ofrece una comparacion con una version anterior basada en un modelo preentrenado sin nombrar (4,38 M de parametros, vocabulario de 30.522 tokens, 4,30 MB en INT8), cuyos datos aparecen en la tabla de la seccion de benchmarks. Como referencia cualitativa, los clasificadores de genero basados en BERT o DistilBERT suelen tener entre 60 y 110 millones de parametros y varios cientos de MB, muy por encima de este modelo, pero no se aportan cifras concretas comparables.

## Limitaciones y advertencias

- Los resultados de 84,44 % de accuracy y F1 son declarados por el autor y estan marcados como no verificados (`verified: false`); no deben tratarse como benchmark independiente.
- La tarea de clasificacion de genero a partir de nombres es intrinsecamente ambigua y propensa a error en nombres unisex, transculturales o transliterados.
- Los sesgos del dataset (composicion cultural concreta, 485k femeninos frente a 491k masculinos) pueden trasladarse al modelo en forma de menor precision para determinados origenes culturales no representados.
- El modelo solo declara soporte para ingles; los nombres en otros alfabetos o sistemas de escritura pueden quedar fuera del vocabulario WordPiece de 4.000 tokens.
- El limite de 20 tokens de secuencia restringe la entrada a nombres y tratamientos cortos; no esta pensado para textos largos.
- No soporta generacion, razonamiento, tool calling ni ninguna capacidad de lenguaje general.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en nombres atipicos.
- Implicacion etica: el uso para inferir genero de personas debe considerar normativa de proteccion de datos (por ejemplo RGPD) y evitar decisiones automatizadas sensibles; la licencia MIT permite uso comercial, pero no exime del cumplimiento legal.

## Enlaces

- HuggingFace: https://huggingface.co/SupratimRK/compact-gender-classifier
- GitHub: https://github.com/SupratimRK/.model.base.gc
- ONNX Runtime: https://onnxruntime.ai/
- Licencia MIT: https://huggingface.co/SupratimRK/compact-gender-classifier/blob/main/LICENSE
