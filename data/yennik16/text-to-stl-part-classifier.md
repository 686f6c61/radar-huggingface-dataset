# yennik16/text-to-stl-part-classifier

## Resumen

El modelo `yennik16/text-to-stl-part-classifier` es un clasificador de texto muy compacto (61.109 parametros) desarrollado por el usuario yennik16 como primera etapa de una canalizacion (pipeline) de conversion de texto a STL. Su funcion es leer una descripcion en ingles de una pieza mecanica sencilla y decidir a cual de cinco familias pertenece: `pipe_gasket`, `washer`, `bracket`, `rect_container` o `cyl_container`. El tipo predicho selecciona despues el esquema que rellena el extractor de parametros, un segundo modelo del mismo autor.

Se trata de un clasificador de bolsa de palabras (bag-of-words) escrito en PyTorch y entrenado integramente desde inicializacion aleatoria, sin pesos preentrenados de ningun tipo. La arquitectura es deliberadamente minima: una capa `EmbeddingBag` de 48 dimensiones con media, seguida de dropout 0,3, una capa ReLU de 64 unidades, otro dropout 0,3 y una salida softmax de 5 clases. El vocabulario contiene 1.201 tokens, construido a partir de palabras y pares de palabras adyacentes que aparecen al menos en 2 textos de entrenamiento.

El modelo es relevante como ejemplo de diseno pragmatico para tareas de clasificacion muy acotadas: en lugar de recurrir a un LLM de proposito general, el autor entrena una red diminuta desde cero, aplica una normalizacion agresiva del texto y elimina las palabras de encuadre de la peticion para evitar atajos espurios. Los resultados reportados en la model card son del 100 % de exactitud en validacion, prueba y en un conjunto de 60 indicaciones coloquiales de estres, aunque conviene interpretarlos con cautela dado el tamano y el origen de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward con EmbeddingBag (media de embeddings de 48 dimensiones) -> dropout 0,3 -> capa ReLU de 64 unidades -> dropout 0,3 -> 5 salidas con softmax |
| Parametros totales | 61.109 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de bolsa de palabras; no maneja secuencias con atencion) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto de bolsa de palabras implementado en PyTorch. La entrada se normaliza mediante `normalizer.py`: las fracciones, los numeros escritos con palabra y las unidades se convierten a pulgadas decimales, el texto se pasa a minusculas, cada numero se sustituye por el token `<num>`, se eliminan las palabras de encuadre de la peticion (por ejemplo "I want it to be", "make", "please") y las palabras restantes junto con los pares de palabras adyacentes se buscan en un vocabulario de 1.201 tokens (solo se incluyen los tokens vistos en al menos 2 textos de entrenamiento). Cada texto se representa como la media de sus embeddings de 48 dimensiones mediante una capa `EmbeddingBag`, que alimenta una capa ReLU de 64 unidades y una salida de 5 clases con softmax. La suma de parametros desglosada es: 1.201 x 48 = 57.648 en los embeddings, 48 x 64 + 64 = 3.136 en la capa oculta y 64 x 5 + 5 = 325 en la capa de salida.

El entrenamiento se realizo desde inicializacion aleatoria, sin ningun tipo de preentrenamiento. El conjunto de datos contiene 1.323 filas: 323 descripciones reales de entrenamiento, 500 descripciones aumentadas y 500 variaciones de frases sinteticas, procedentes del conjunto `yennik16/text-to-stl-parts`. Los conjuntos de validacion y prueba contienen unicamente datos reales y la particion esta agrupada por tamano de pieza, de modo que ningun tamano aparece simultaneamente en entrenamiento y prueba. Se uso el optimizador AdamW con tasa de aprendizaje 5e-3, decaimiento de peso 1e-3, tamano de lote 32 y 80 epocas, conservando la epoca con mejor exactitud de validacion. Como innovacion destacable, el autor justifica la eliminacion de las palabras de encuadre porque en los datos originales identificaban a la persona que habia escrito cada hoja de calculo (por ejemplo, "it", "be" y "thats" aparecen en aproximadamente el 40 % de las descripciones de juntas y casi en ninguna de las de contenedores), lo que llevaba al modelo a aprender el autor en lugar de la pieza.

## Capacidades

- Clasificacion de descripciones en ingles de piezas mecanicas sencillas en cinco familias: `pipe_gasket`, `washer`, `bracket`, `rect_container` y `cyl_container`.
- Devolucion de un tipo de pieza acompanado de una probabilidad por clase; la aplicacion trata los valores por debajo del 85 % como inciertos y muestra las clases segundas.
- Normalizacion de texto de entrada: conversion de fracciones, numeros escritos con palabra y unidades a pulgadas decimales, paso a minusculas y sustitucion de numeros por el token `<num>`.
- Eliminacion de palabras de encuadre de la peticion para centrarse en el contenido descriptivo de la pieza.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues: solo entiende ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- No genera texto: su unica salida es una etiqueta de clase con sus probabilidades.

## Casos de uso

- Primera etapa de una canalizacion de texto a CAD: el clasificador recibe la descripcion del usuario y determina la familia de pieza, que despues determina el esquema que rellena el extractor de parametros `yennik16/text-to-stl-parameter-extractor`. Es el uso previsto por el autor.
- Enrutamiento de solicitudes en un asistente de fabricacion: en un chat que recibe peticiones de piezas, el clasificador puede etiquetar rapidamente la peticion y derivarla al formulario o al flujo de trabajo correspondiente antes de invocar cualquier modelo mas costoso.
- Prefiltrado de entradas en un sistema de generacion de STL: dado que es un modelo de 61.109 parametros, puede ejecutarse en cada peticion con coste despreciable para descartar o marcar descripciones que no correspondan a ninguna de las cinco familias antes de llamar a modelos mayores.
- Clasificacion por lotes de catalogos de piezas: si se dispone de una lista de descripciones textuales de piezas (por ejemplo, procedentes de hojas de calculo de ingenieria), el modelo puede etiquetarlas en bloque para organizar un catalogo.
- Validacion de formularios en aplicaciones web de impresion 3D: al recibir la descripcion de una pieza, el modelo puede comprobar que el tipo inferido coincide con el tipo declarado por el usuario y avisar en caso de discrepancia.
- Deteccion de ambiguedad en la entrada: gracias a que devuelve una probabilidad por clase y la aplicacion marca como inciertos los valores inferiores al 85 %, puede usarse para pedir aclaraciones al usuario cuando la descripcion no encaja claramente en ninguna familia.
- Ensamblaje de un banco de pruebas educativo: al ser un ejemplo completo y reproducible de clasificador entrenado desde cero, sirve como material didactico para ilustrar normalizacion de texto y deteccion de sesgos de autor en conjuntos de datos pequenos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud de validacion (91 filas reales) | 100,0 % |
| Exactitud de prueba (87 filas reales, tamanos no vistos) | 100,0 % |
| Indicaciones coloquiales de estres (60, redaccion inusual, nunca vistas en entrenamiento) | 100,0 % |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que el modelo no esta disenado para tareas de proposito general sino para una clasificacion de cinco clases muy acotada.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 61.109 parametros, en precision de 32 bits los pesos ocupan del orden de 244 KB; el modelo cabe holgadamente en cualquier GPU y en la memoria principal de cualquier maquina.
- GPU recomendadas: no requiere GPU. Funciona en CPU sin problema; cualquier GPU consumer (incluso integradas) es mas que suficiente.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer, asi como en dispositivos de borde y entornos sin acelerador.
- Opciones de despliegue: al ser un modelo PyTorch con scripts propios (`model.py`, `normalizer.py`) que se cargan mediante `snapshot_download` de `huggingface_hub`, el despliegue se realiza ejecutando el codigo en Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos de mayor tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por el tamano del modelo cabe esperar latencias del orden de microsegundos a milisegundos por inferencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yennik16/text-to-stl-part-classifier | 61.109 | no aplica (bolsa de palabras) | Clasificacion de 5 familias de piezas | Apache 2.0 | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen modelos publicos comparables de la misma categoria (clasificadores de descripciones de piezas mecanicas en cinco familias como etapa de una canalizacion de texto a STL) en la informacion proporcionada. Como referencia conceptual, podria compararse con clasificadores de texto genericos basados en transformadores como DistilBERT, pero no se dispone de datos de rendimiento en esta tarea concreta para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo esta construido exclusivamente para cinco familias de piezas; cualquier descripcion que no corresponda a ninguna de ellas se vera forzada a la clase mas cercana, sin opcion de rechazo explicita por parte del clasificador.
- Fue entrenado con descripciones en ingles escritas por un equipo pequeno mas variaciones sinteticas, por lo que una redaccion inusual puede confundir al modelo a pesar del 100 % reportado en las indicaciones de estres.
- Solo procesa descripciones en ingles; no hay soporte multilingue.
- El modelo solo decide el tipo de pieza; las dimensiones proceden del extractor de parametros y todos los valores pasan por una validacion basada en reglas antes de construir cualquier CAD. No debe utilizarse como fuente de verdad geometrica.
- Riesgo de alucinacion en sentido estricto: no aplica, puesto que no genera texto libre; su salida es una etiqueta de clase con probabilidades. No obstante, si puede asignar con alta confianza una clase incorrecta cuando la descripcion es ambigua o esta fuera del dominio.
- Sesgos conocidos: el autor documenta explicitamente que las palabras de encuadre de la peticion identificaban al redactor original en los datos crudos y que fue necesario eliminarlas para evitar que el modelo aprendiera al autor en lugar de la pieza. Persiste el riesgo de que otros sesgos de redaccion no detectados influyan en las predicciones.
- El rendimiento del 100 % reportado debe interpretarse con cautela: los conjuntos de validacion (91 filas) y prueba (87 filas) son muy pequenos y estan compuestos por datos reales de un unico origen, por lo que la generalizacion a otros redactores o dominios no esta demostrada.
- Restricciones de licencia: la licencia Apache 2.0 permite el uso comercial, la modificacion y la redistribucion, siempre que se conserven los avisos de copyright y licencia correspondientes.
- Para produccion conviene supervisar las predicciones con probabilidad inferior al 85 % (umbral marcado por la aplicacion) y disponer de un mecanismo de aclaracion con el usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennik16/text-to-stl-part-classifier
- Conjunto de datos: https://huggingface.co/datasets/yennik16/text-to-stl-parts
- Extractor de parametros (segunda etapa de la canalizacion): https://huggingface.co/yennik16/text-to-stl-parameter-extractor
