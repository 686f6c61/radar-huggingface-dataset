# tars-technologies/veil

## Resumen

Veil es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en texto. Lo desarrolla Tars Technologies (autor: Vaibhav Kubre) y su propósito es localizar nombres, direcciones, teléfonos, correos electrónicos y otros datos personales para poder enmascararlos antes de que el texto se almacene, registre o envíe a otro servicio. Su rasgo diferencial es el tamaño: 1.177.096 bytes (aproximadamente 1,18 MB), lo que permite ejecutarlo íntegramente en el navegador o en Node sin dependencias ni llamadas de red.

La arquitectura no es un transformer: combina embeddings con hashing de n-gramas de caracteres (32.768 cubos de 64 dimensiones con códigos de 2 bits), características de forma de palabra y tres indicadores de listas de palabras, todo ello alimentando una LSTM bidireccional de 2 capas con 96 unidades y pesos en int8. El modelo procesa ventanas de 256 tokens con solapamiento de 64 y admite hasta 300 caracteres de contexto previo.

Es relevante ahora porque propone una alternativa de privacidad por diseño: al ejecutarse en el dispositivo del usuario (on-device), el texto nunca abandona la máquina, lo que encaja con requisitos de cumplimiento (RGPD) y con arquitecturas de aplicaciones que necesitan anonimizar antes de persistir o enviar datos a servicios externos. La licencia Apache-2.0 cubre tanto el código como el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings con hashing de n-gramas de caracteres (32.768 cubos x 64, codigos de 2 bits), caracteristicas de forma de palabra y tres flags de listas de palabras, sobre LSTM bidireccional de 2 capas con 96 unidades; pesos int8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con solapamiento de 64; hasta 300 caracteres de `context`; maximo de 20.000 caracteres y 3.000 tokens por llamada (contexto incluido) |
| Tipos de cuantizacion | Pesos en int8 (formato propio `veil-0.3.1.bin`, formato 3) |
| Idiomas soportados | en, de, fr, es, nl, pt, it (escritura latina) |
| Licencia | Apache-2.0 (codigo y modelo); `NOTICE` acredita las fuentes de datos |
| Formato de pesos | Binario propio `veil-0.3.1.bin` con cabecera (nombre, version, formato) y checksum final; el paquete npm distribuye codigo TypeScript |

## Arquitectura y entrenamiento

Veil no emplea un transformer. Su arquitectura se basa en embeddings con hashing de n-gramas de caracteres: cada n-grama se proyecta en uno de 32.768 cubos con vectores de 64 dimensiones codificados en 2 bits. A ello se suman características de forma de palabra (word-shape features) y tres indicadores de listas de palabras. La secuencia resultante pasa por una LSTM bidireccional de 2 capas con 96 unidades, y los pesos finales se almacenan en int8. El modelo procesa el texto en ventanas de 256 tokens con un solapamiento de 64 tokens entre ventanas consecutivas, y admite hasta 300 caracteres de contexto previo.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset; únicamente indica que la mayor parte del texto de entrenamiento está en inglés, alemán, francés, español, neerlandés, portugués o italiano, y que la escritura es latina. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, algo coherente con una tarea de etiquetado de secuencias. Como innovación destacable, el fichero del modelo incorpora cabecera con nombre, versión y formato, y termina con un checksum que la librería verifica, rechazando ficheros corruptos; además, cada nueva versión del modelo recibe un nombre de fichero distinto. La librería está escrita en TypeScript y se distribuye como código fuente.

## Capacidades

- Detección de entidades PII con siete etiquetas: `PERSON`, `ADDRESS`, `DOB`, `ID`, `FINANCIAL`, `PHONE` y `EMAIL`.
- API `detect` que devuelve los spans (inicio, fin, tipo) y API `mask` que devuelve el texto con cada span sustituido por una etiqueta (`[NAME]`, `[PHONE]`, `[EMAIL]`, etc.).
- Enmascaramiento con contexto: la opción `context` aporta el texto previo (por ejemplo, la pregunta que responde el texto) y `expectName` trata respuestas cortas a preguntas de nombre como un nombre completo.
- Listas de control `always` (nombres a enmascarar siempre como palabra completa) y `never` (términos a preservar, como marcas o nombres de producto).
- Umbral de confianza configurable (`threshold`, por defecto 0,5) para ajustar el equilibrio entre falsos negativos y falsos positivos.
- Procesamiento por fragmentos con `detectChunked` para textos que superan los 3.000 tokens, con offsets sobre el texto completo.
- Ejecución on-device: navegador mediante Web Worker (entrada `@tars-technologies/veil/browser`) o Node/servidores sin llamadas de red.
- Integración con React mediante `VeilProvider` y el hook `useMask`.
- Idiomas: inglés, alemán, francés, español, neerlandés, portugués e italiano (escritura latina).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni tool calling: es exclusivamente un etiquetador de secuencias.

## Casos de uso

- Anonimización previa al registro (logging): antes de escribir texto de usuario en un sistema de logs o trazas, Veil enmascara nombres, correos y teléfonos en el propio cliente o servidor, de modo que los datos personales no llegan a almacenarse en claro.
- Formularios y chat en el navegador: con la entrada `browser` y la ejecución en Web Worker, la aplicación puede enmascarar el texto mientras el usuario escribe sin bloquear la interfaz y sin enviar el contenido a ningún servidor.
- Cumplimiento del RGPD en pipelines de datos: inserción de un paso de enmascaramiento antes de persistir o exportar textos a terceros, aprovechando que el modelo corre en local y no requiere transferencia internacional de datos.
- Preprocesado para entrenamiento de modelos: limpieza de datasets con texto real (reseñas, tickets, correos) para eliminar PII antes de usarlos en ajuste fino, con la opción `detectChunked` para documentos largos.
- Atención al cliente: enmascaramiento de conversaciones multi-turno antes de enviarlas a un sistema de analítica o a un modelo externo, usando `context` para resolver respuestas cortas del tipo "Sí, soy Laura" o "Summer".
- Documentos legales y judiciales: la evaluación sobre el conjunto TAB (sentencias judiciales) muestra un F1 de 88,1 en detección de nombres, lo que lo hace adecuado para anonimizar resoluciones antes de su publicación o compartición.
- Aplicaciones de escritorio y extensiones: al pesar 1,18 MB y no tener dependencias, puede empaquetarse en extensiones de navegador o apps de escritorio para redactar PII en cualquier campo de texto.
- Redacción de correos y mensajes salientes: integración en un cliente de correo para sustituir direcciones y teléfonos por etiquetas antes de reenviar contenido a un servicio de terceros.

## Benchmarks y rendimiento

La model card publica resultados de F1 exact-match para la etiqueta `PERSON` en cinco conjuntos de test públicos no incluidos en el entrenamiento, comparando con spaCy sm (15 MB) y tres variantes de newmean (nano 2,6 MB, small 7,1 MB, large 20,7 MB), todos con ajustes por defecto:

| Conjunto de test | Nombres | Veil 0.3.1 (1,2 MB) | spaCy sm (15 MB) | newmean nano (2,6 MB) | newmean small (7,1 MB) | newmean large (20,7 MB) |
|---|---|---|---|---|---|---|
| CoNLL-2003 English, noticias | 1.617 | 73,1 | 66,9 | 43,2 | 45,1 | 50,7 |
| WNUT-17, redes sociales | 429 | 51,5 | 27,0 | 22,1 | 31,0 | 35,0 |
| CoNLL-2002 Spanish, noticias | 735 | 75,0 | 68,2 | 51,2 | 57,1 | 64,6 |
| CoNLL-2002 Dutch, noticias | 1.098 | 70,5 | 62,4 | 53,6 | 50,2 | 63,0 |
| TAB, sentencias judiciales | 1.018 | 88,1 | 52,1 | 42,9 | 58,3 | 71,0 |

En TAB, que incluye títulos en los nombres ("Mrs Karin Schieck") y Veil no, la fila ignora el título inicial; con coincidencia estricta, Veil obtiene 10,1 y spaCy 29,7. La model card advierte que el F1 no refleja del todo el comportamiento en enmascaramiento: un nombre no detectado es una fuga, mientras que un enmascaramiento extra tiene un coste bajo.

## Requisitos de hardware

- VRAM: no aplica; el modelo pesa 1,18 MB y se ejecuta en CPU. No requiere GPU.
- GPU recomendadas: ninguna; no es necesario acelerador gráfico.
- Cabe en cualquier GPU de consumo y, de hecho, en cualquier dispositivo con un runtime de JavaScript (navegador, Node, Bun, serverless).
- Despliegue: paquete npm `@tars-technologies/veil` (código TypeScript, requiere bundler o runtime que compile TypeScript: Vite, esbuild, tsx, Bun); entrada `/browser` para navegador con Web Worker; entrada `/react` para React; entrada `/chunked` para textos largos. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica que la ejecución en Web Worker evita bloquear la página y que `loadModel()` añade unos 1,6 MB de base64 al bundle si se incrusta el modelo (por lo que en navegador se recomienda cargarlo por URL).

## Comparativa con modelos similares

| Modelo | Tamano | Tarea | Contexto | F1 PERSON (CoNLL-2003 EN) | Licencia | Ejecucion on-device |
|---|---|---|---|---|---|---|
| Veil 0.3.1 | 1,2 MB | NER/PII (7 etiquetas) | Ventanas de 256 tokens, 3.000 tokens por llamada | 73,1 | Apache-2.0 | Si (navegador/Node, sin red) |
| spaCy sm | 15 MB | NER general | no disponible | 66,9 | no disponible en la informacion | Si, con runtime Python |
| newmean nano | 2,6 MB | NER (PERSON) | no disponible | 43,2 | no disponible en la informacion | no disponible |
| newmean small | 7,1 MB | NER (PERSON) | no disponible | 45,1 | no disponible en la informacion | no disponible |
| newmean large | 20,7 MB | NER (PERSON) | no disponible | 50,7 | no disponible en la informacion | no disponible |

Veil obtiene el mejor F1 en las cinco pruebas pese a ser el modelo más pequeño de la comparativa, con una ventaja especialmente amplia en WNUT-17 (51,5 frente a 27,0 de spaCy) y en TAB (88,1 frente a 52,1). La comparativa se limita a la etiqueta `PERSON`; no se publican resultados para el resto de etiquetas ni frente a otros modelos de PII.

## Limitaciones y advertencias

- Solo etiqueta siete tipos de PII (`PERSON`, `ADDRESS`, `DOB`, `ID`, `FINANCIAL`, `PHONE`, `EMAIL`); no cubre otras categorías sensibles como datos de salud, orientación sexual o creencias.
- Los benchmarks publicados solo miden `PERSON`; el rendimiento en el resto de etiquetas no está documentado.
- El entrenamiento está mayoritariamente en inglés y el modelo solo cubre escritura latina; el rendimiento en otros idiomas o alfabetos no está evaluado.
- El F1 en texto informal es bajo en términos absolutos (51,5 en WNUT-17), por lo que en dominios ruidosos pueden producirse fugas de nombres no detectados.
- El enmascaramiento extra (falsos positivos) es posible y el umbral por defecto de 0,5 puede ajustarse, pero un umbral bajo incrementa el enmascaramiento de palabras que no son nombres.
- Límite de 20.000 caracteres y 3.000 tokens por llamada (contexto incluido); para textos mayores hay que usar `detectChunked`, que sigue sujeto al límite de caracteres.
- La API lanza excepciones y nunca devuelve resultados parciales; la propia model card recomienda que, ante un error, no se almacene el texto, lo que exige gestionar el fallo en la aplicación.
- El paquete distribuye código TypeScript, por lo que requiere un bundler o runtime compatible; no es un artefacto listo para usar con runtimes de inferencia estándar.
- No se documentan sesgos específicos del modelo; al ser un modelo pequeño entrenado con datos mayoritariamente en inglés, es razonable esperar un peor rendimiento en variedades dialectales y en nombres de culturas menos representadas, aunque la model card no aporta datos al respecto.
- Licencia Apache-2.0 para código y modelo, lo que permite uso comercial; el fichero `NOTICE` acredita las fuentes de datos y debe conservarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tars-technologies/veil
- Demo en el navegador: https://tars-technologies.github.io/veil/
- Repositorio GitHub (librería, código de entrenamiento y scripts de evaluación): https://github.com/Tars-Technologies/veil
- Instalación npm: `npm install github:Tars-Technologies/veil`
