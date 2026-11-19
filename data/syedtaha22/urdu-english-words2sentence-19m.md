# syedtaha22/urdu-english-words2sentence-19m

## Resumen

urdu-english-words2sentence-19m es un modelo de generacion de texto de 18,8 millones de parametros desarrollado por syedtaha22. Su tarea es concreta: recibe entre una y cuatro palabras clave en urdu y genera una frase en urdu que las contiene, seguida de su traduccion al ingles. Un unico conjunto de pesos produce ambas lenguas, lo que lo distingue de la aproximacion habitual de encadenar dos modelos separados.

Arquitectonicamente es un transformer decoder-only de 8 capas, anchura 384 y 6 cabezas de atencion, con pre-norm, RMSNorm, SwiGLU, posiciones aprendidas y una cabeza de salida ligada a los embeddings para el urdu mas una cabeza separada para el ingles. El contexto es de solo 128 tokens y los pesos estan en float32 (75 MB). El modelo es una extension de urdu-words2sentence-17m, al que se anade la generacion de la frase en ingles.

Su relevancia es acotada pero clara: es un ejemplo de modelo pequeno, entrenado desde cero y especializado en una tarea de generacion aumentada por palabras clave (AAC, comunicacion aumentativa y alternativa) en un escenario de code-mixing urdu-ingles, con licencia Apache 2.0 y latencia de decenas de milisegundos. No es un modelo de proposito general y su uso fuera del conjunto fijo de etiquetas de urdu no esta respaldado por el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, RMSNorm, SwiGLU, posiciones aprendidas |
| Parametros totales | 18.819.456 (14.930.304 fuera de los embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | urdu (ur), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32, ~75 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 capas, dimension 384 y 6 cabezas. Usa pre-norm con RMSNorm, activacion SwiGLU y posiciones aprendidas. El vocabulario se divide en dos tokenizadores SentencePiece: 8.000 piezas de urdu (`tokenizer.model`) y 2.000 piezas de ingles (`english_tokenizer.model`), que ocupan los ids 8000 a 9999 mediante un desplazamiento (`english_token_offset`). Las piezas de urdu y el token de fin comparten la matriz de embeddings como matriz de salida (tied head); las piezas de ingles usan una matriz separada, `english_head.weight`. El prompt se compone del token BOS, las palabras clave unidas por ` + ` y el token `<sep>`; la salida es la frase en urdu, un token marcador (el BOS ingles), la frase en ingles y el token EOS.

El entrenamiento parte de los pesos de urdu-words2sentence-17m, preentrenado sobre 280 millones de tokens de texto en urdu procedente de CC-100, Wikipedia en urdu y Tatoeba. Sobre esa base se hace un fine-tuning de 12 epocas con 20.929 tripletas de palabras clave, frase en urdu y frase en ingles, con learning rate 1e-3, dropout 0,2 y semilla 1. El learning rate de los bloques del transformer es 0,1 veces el de las partes en ingles (filas de embedding inglesas y matriz de salida inglesa), y las filas de embedding de urdu permanecen congeladas para preservar la calidad del modelo de partida. Se conserva el checkpoint con la menor media de perdida de validacion en urdu e ingles (1,963 y 1,101). Las frases en ingles del conjunto de entrenamiento fueron generadas por `gemma4:e4b` (19.423 de 19.479 frases distintas); el modelo no invoca ese sistema en inferencia. La decodificacion combina busqueda por haces (5 haces, `length_alpha=0.7`, maximo 40 tokens nuevos) para el urdu y decodificacion voraz para el ingles.

## Capacidades

- Generacion de frases en urdu a partir de una a cuatro palabras clave de un conjunto fijo de etiquetas.
- Generacion de la frase equivalente en ingles con el mismo conjunto de pesos, sin modelo auxiliar en tiempo de inferencia.
- Manejo de entradas code-mixed (palabras clave en urdu e ingles mezcladas).
- Control de diversidad mediante busqueda por haces con multiples candidatos ordenados.
- Latencia muy baja: mediana de 39 ms para la busqueda por haces mas la generacion en ingles.
- No soporta tool calling, function calling, uso como agente, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada estrictamente a urdu e ingles.

## Casos de uso

- Comunicacion aumentativa y alternativa (AAC): el modelo convierte selecciones de pictogramas o etiquetas en frases completas en urdu e ingles, con latencia de 39 ms que permite interaccion en tiempo real en dispositivos modestos.
- Aplicaciones de traduccion asistida urdu-ingles a nivel de frase: dado un conjunto de conceptos, produce la frase en urdu y su equivalente ingles en una sola pasada, util para prototipos de interfaces bilingues.
- Generacion de datos sinteticos para entrenar correctores o clasificadores de frases en urdu: el modelo puede producir variantes de una misma seleccion de palabras clave (hasta tres candidatos por haz) para aumentar corpus pequenos.
- Sistemas de ensenanza de idiomas: a partir de palabras clave que el estudiante quiere practicar, se generan frases de ejemplo en urdu con su traduccion al ingles para ejercicios de vocabulario.
- Herramientas de demostracion de modelos pequenos en entornos con recursos limitados: con 75 MB en float32 cabe en CPU y en cualquier GPU consumer, lo que permite desplegarlo en navegador o en dispositivos embebidos para pruebas de concepto.
- Investigacion sobre code-mixing: sirve como banco de pruebas reproducible (semilla 1, datos y codigo publicos) para estudiar la generacion conjunta de dos lenguas con un unico modelo y cabezas de salida separadas.

## Benchmarks y rendimiento

Evaluacion sobre 125 selecciones de palabras clave reservadas (93 en urdu, 32 code-mixed). La coincidencia exacta en ingles y la F1 de palabras comparan la frase inglesa generada a partir de la mejor frase en urdu con las referencias.

| Metrica | Semilla 1 (este modelo) | Media de semillas 0 a 3 |
|---|---|---|
| Coincidencia exacta en urdu @1 | 0,360 | no disponible |
| Coincidencia exacta en urdu @3 | 0,736 | 0,730 (sd 0,014) |
| Casos en urdu, coincidencia exacta @3 | 0,806 | 0,801 |
| Casos code-mixed, coincidencia exacta @3 | 0,531 | 0,523 |
| Coincidencia exacta en ingles | 0,504 | 0,504 |
| F1 de palabras en ingles | 0,788 | 0,772 |
| Latencia mediana (busqueda + ingles) | 39 ms | no disponible |

Referencias del autor: el modelo solo en urdu (urdu-words2sentence-17m) alcanza una coincidencia exacta @3 de 0,728. Para la frase inglesa de la referencia en urdu, `gemma4:e4b` alcanza 0,520 de coincidencia exacta y 0,795 de F1 de palabras con una mediana de 589 ms.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en float32 (75 MB de pesos mas activaciones y estados de la busqueda por haces); no se han publicado cifras de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo funciona en CPU sin problema.
- Cabe en GPU consumer y en CPU; tambien en dispositivos de baja potencia dada la ventana de 128 tokens.
- Opciones de despliegue: el autor proporciona codigo Python propio (`modeling.py`, `joint.py`, `generation.py`) con `safetensors` y `sentencepiece`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 39 ms para busqueda por haces con 5 haces mas generacion en ingles. No se ha publicado throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urdu-english-words2sentence-19m | 18,8 M | 128 | Palabras clave a frase urdu + ingles | Apache 2.0 | Hugging Face |
| urdu-words2sentence-17m | ~17 M | no disponible | Palabras clave a frase solo en urdu | no disponible | Hugging Face |
| gemma4:e4b (referencia del autor) | no disponible | no disponible | Generacion general, usada para crear el corpus ingles | no disponible | no disponible |

No se dispone de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las frases generadas deben revisarse antes de usarse; el modelo puede omitir una palabra clave o anadir terminos no seleccionados, en ambas lenguas.
- La frase en ingles se deriva de la frase en urdu, por lo que hereda sus errores cuando la generacion en urdu es incorrecta.
- El conjunto de evaluacion es de solo 125 casos, por lo que las metricas tienen una incertidumbre amplia.
- Las frases en ingles de entrenamiento fueron generadas por `gemma4:e4b`, de modo que el modelo reproduce el estilo y los sesgos de ese sistema.
- Solo fue entrenado con una a cuatro palabras clave de un conjunto fijo de etiquetas en urdu; entradas fuera de ese dominio quedan fuera de la distribucion de entrenamiento.
- Ventana de contexto muy corta (128 tokens), insuficiente para dialogos multi-turno o documentos largos.
- No se han publicado analisis de sesgos sociales, dialectales o de genero para este modelo.
- Licencia Apache 2.0 permite uso comercial, pero el aviso NOTICE atribuye las fuentes del texto de entrenamiento (CC-100, Wikipedia, Tatoeba); conviene revisar las condiciones de esas fuentes.
- No hay soporte documentado para runtimes de inferencia estandar (vLLM, llama.cpp, TGI), lo que complica el despliegue en produccion sin adaptar el codigo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syedtaha22/urdu-english-words2sentence-19m
- Modelo base: https://huggingface.co/syedtaha22/urdu-words2sentence-17m
- Repositorio de datos y codigo: https://github.com/syedtaha22/goyai-experiments (carpeta `models/`)
- Dataset CC-100: no disponible como enlace directo en la informacion proporcionada
- Dataset Wikipedia en urdu: https://huggingface.co/datasets/wikimedia/wikipedia (snapshot `20231101.ur`)
- Dataset Tatoeba: no disponible como enlace directo en la informacion proporcionada
