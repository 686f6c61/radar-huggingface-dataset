# syedtaha22/urdu-words2sentence-17m

## Resumen

urdu-words2sentence-17m es un modelo de lenguaje decoder-only de 17,3 millones de parametros desarrollado por el usuario syedtaha22, disenado especificamente para una tarea de generacion controlada: producir una frase en urdu a partir de entre una y cuatro palabras clave en urdu. La particularidad del modelo es que las frases generadas pueden mezclar urdu e ingles (code-mixing), un fenomeno muy extendido en el registro oral y escrito informal de Pakistan.

El modelo se construye sobre una arquitectura transformer clasica con pre-norm, RMSNorm, SwiGLU, posiciones aprendidas y cabeza de salida atada, con 8 capas, anchura 384 y 6 cabezas de atencion. Su ventana de contexto es de solo 128 tokens y su vocabulario es un BPE de 8000 piezas entrenado con SentencePiece sobre el corpus en urdu y las propias palabras clave. Los pesos se distribuyen en float32 (69 MB) y el repositorio completo ocupa unos 0,1 GB.

La relevancia de este modelo es acotada pero clara: demuestra que un modelo de 17M de parametros puede resolver una tarea de generacion condicionada por palabras clave con una latencia mediana de 18 ms mediante busqueda por haces, lo que lo hace viable en entornos con recursos muy limitados. No obstante, su alcance esta estrictamente delimitado por el conjunto fijo de etiquetas en urdu con el que fue entrenado y por un conjunto de evaluacion de solo 125 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, RMSNorm, SwiGLU, posiciones aprendidas, cabeza de salida atada |
| Parametros totales | 17.283.456 (14.162.304 fuera de los embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32) |
| Idiomas soportados | Urdu (ur), con mezcla de urdu e ingles en las frases generadas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, 69 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas, anchura 384 y 6 cabezas de atencion, con normalizacion previa (pre-norm) mediante RMSNorm, activacion SwiGLU, embeddings posicionales aprendidos y cabeza de salida atada a la matriz de embeddings de entrada. El tokenizador es un BPE de SentencePiece con 8000 piezas, entrenado conjuntamente sobre el corpus en urdu y sobre las palabras clave. El formato de entrada es el token BOS, las palabras clave unidas por el separador ` + ` y el token `<sep>`; el modelo genera la frase y la cierra con EOS. Los identificadores de token se encuentran en `config.json`.

El entrenamiento se desarrollo en dos fases. La primera consistio en un preentrenamiento sobre 280 millones de tokens de texto en urdu procedente de CC-100, la Wikipedia en urdu (snapshot `20231101.ur`) y Tatoeba, con limpieza y empaquetado previos, alcanzando una perdida de validacion de 3,650. La segunda fase fue un ajuste fino de 3 epocas con tasa de aprendizaje 5e-05 y dropout 0 sobre 21.055 pares de palabras clave y frase (semilla 0), con perdida de validacion de 2,881. Los pares combinan 2.575 frases de Tatoeba, 5.290 frases web que un modelo de lenguaje revirtio a palabras clave y 13.191 frases escritas por un modelo de lenguaje (`gemma4:e4b`) para selecciones de palabras clave muestreadas; se eliminaron los pares coincidentes con casos de evaluacion. No se documenta el uso de RLHF ni DPO. La decodificacion se realiza mediante busqueda por haces implementada en `generation.py`, con parametros como `beams=5`, `max_new=40` y `length_alpha=0.7`.

## Capacidades

- Generacion de frases en urdu a partir de una a cuatro palabras clave en urdu.
- Generacion de frases con code-mixing urdu-ingles, reflejando el registro informal bilingue.
- Generacion condicionada con beam search y control de longitud mediante `length_alpha`.
- Produccion de multiples candidatos ordenados por puntuacion del haz (el ejemplo de la model card devuelve las tres mejores frases).
- Concordancia de genero y numero dependiente de las palabras clave de entrada.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo thinking.
- Capacidad multilingue limitada al urdu y a la mezcla con ingles; no se documentan otros idiomas.

## Casos de uso

- Generacion asistida de frases para aprendizaje de urdu: dado un conjunto de palabras clave que el estudiante quiere practicar, el modelo produce frases completas que las integran, con una latencia de 18 ms que permite generar variantes en tiempo real dentro de una interfaz interactiva.
- Aumento de datos para PLN en urdu: el modelo puede generar frases cortas y controladas a partir de selecciones de palabras clave para ampliar corpus de entrenamiento o de evaluacion en tareas de generacion de texto en urdu, con la salvedad de que parte de sus frases reproducen el estilo de `gemma4:e4b`.
- Prototipado de sistemas de escritura asistida en urdu: integrado en un teclado o editor, el modelo sugiere una frase completa a partir de las palabras que el usuario ha escrito, aprovechando el beam search para ofrecer varias alternativas ordenadas.
- Generacion de ejemplos controlados en pruebas de software: al fijar las palabras clave de entrada, se pueden producir frases deterministas para validar pipelines de tokenizacion, normalizacion o traduccion en urdu sin depender de servicios externos.
- Investigacion sobre code-mixing urdu-ingles: el modelo permite estudiar como un modelo pequeno reproduce patrones de mezcla de lenguas a partir de palabras clave, con un conjunto de evaluacion especifico de 32 casos code-mixed.
- Despliegue en entornos con recursos minimos: con 17M de parametros y 69 MB en float32, el modelo cabe en CPU y en dispositivos de borde, lo que permite generar frases en urdu sin GPU y con latencias de milisegundos.
- Generacion de plantillas de respuesta en sistemas de dialogo de dominio acotado: para intenciones predefinidas cuyas palabras clave esten dentro del conjunto fijo de etiquetas, el modelo puede redactar la frase final de la respuesta.

## Benchmarks y rendimiento

La evaluacion se realizo sobre 125 selecciones de palabras clave reservadas (93 en urdu y 32 con code-mixing) con frases de referencia, comparando frases normalizadas mediante exact match y con un juez automatico (`qwen3.5:9b`).

| Metrica | Semilla 0 (este modelo) | Media de semillas 0 a 2 |
|---|---|---|
| Exact match at 1 | 0,408 | 0,427 |
| Exact match at 3 | 0,728 | 0,728 |
| Casos en urdu, exact match at 3 | 0,806 | 0,803 |
| Casos code-mixed, exact match at 3 | 0,500 | 0,510 |
| Aceptacion del juez sobre la mejor frase | 0,880 | No disponible |
| Latencia mediana del beam search | 18 ms | No disponible |

El juez `qwen3.5:9b` acepto el 0,952 de las frases de referencia y el 0,008 de las frases no coincidentes. La linea base mT5-small ajustada sobre los mismos pares alcanza un exact match at 3 de 0,608, frente al 0,728 de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (69 MB de pesos mas activaciones y cache para 128 tokens de contexto); no se han publicado mediciones especificas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090 o superiores, y tambien en GPUs de gama baja.
- Cabe en GPU consumer: si, en cualquier GPU consumer con al menos 1 GB de memoria, y tambien en CPU.
- Opciones de despliegue: la model card proporciona codigo propio (`modeling.py` y `generation.py`) que carga los pesos con `safetensors` y ejecuta beam search; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: latencia mediana de 18 ms por busqueda por haces con 5 haces y hasta 40 tokens nuevos, segun la evaluacion del autor; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urdu-words2sentence-17m | 17,3 M | 128 tokens | Exact match at 3 de 0,728 | Apache 2.0 | Hugging Face |
| mT5-small ajustado (linea base del autor) | No disponible en la informacion | No disponible | Exact match at 3 de 0,608 | No disponible | No disponible |
| Otros modelos de generacion de urdu de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion documentada por el autor es con la linea base mT5-small ajustada sobre los mismos pares, que obtiene un exact match at 3 de 0,608 frente al 0,728 del modelo. No se dispone de datos sobre otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las frases generadas deben revisarse antes de su uso; el propio autor lo indica de forma explicita.
- El conjunto de evaluacion es pequeno (125 casos), por lo que las metricas presentan una incertidumbre amplia.
- Parte de las frases de entrenamiento fueron escritas por un modelo de lenguaje (`gemma4:e4b`), de modo que el modelo reproduce el fraseo de ese modelo.
- El modelo fue entrenado con entre una y cuatro palabras clave de un conjunto fijo de etiquetas en urdu; cualquier otra entrada queda fuera de su distribucion de entrenamiento.
- La concordancia de genero y numero depende de las palabras clave, lo que puede producir frases gramaticalmente incorrectas si la seleccion no es coherente.
- El exact match at 3 en casos code-mixed es notablemente inferior (0,500) que en casos en urdu (0,806), lo que indica menor fiabilidad en la mezcla de lenguas.
- La ventana de contexto de 128 tokens limita la entrada y la salida a frases muy cortas.
- No se documentan sesgos especificos, pero el corpus de preentrenamiento (CC-100, Wikipedia, Tatoeba) puede introducir sesgos propios de esas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad de las frases generadas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syedtaha22/urdu-words2sentence-17m
- Repositorio con los pares de ajuste fino y las frases de Tatoeba: https://github.com/syedtaha22/goyai-experiments (carpeta `models/inputs/data/`, archivos `pairs.tar.xz` y `tatoeba_ur.jsonl.xz`)
- Codigo de construccion de los conjuntos de entrenamiento: carpeta `models/steps/corpus/` del repositorio anterior
- Dataset CC-100: no disponible enlace directo en la informacion proporcionada
- Dataset Wikipedia en urdu: https://huggingface.co/datasets/wikimedia/wikipedia (snapshot `20231101.ur`)
- Dataset Tatoeba: no disponible enlace directo en la informacion proporcionada
