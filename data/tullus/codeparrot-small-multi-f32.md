# TULLUS/codeparrot-small-multi-F32

## Resumen

TULLUS/codeparrot-small-multi-F32 es una conversion a precision completa (F32) y formato Safetensors del checkpoint original codeparrot/codeparrot-small-multi, un modelo GPT-2 de 111 millones de parametros (con embeddings atados) especializado en completado y continuacion de codigo. No se trata de un entrenamiento nuevo ni de un fine-tune: el autor declara que se preservan exactamente los valores de los tensores aprendidos del modelo fuente, fijado en la revision `7753edbe82562bf23c6ff15ad46ce6f0f2307139`.

El interes practico de esta publicacion no esta en el rendimiento del modelo, sino en el formato y la trazabilidad. El checkpoint original se distribuia como `pytorch_model.bin` (247.234.217 bytes), mientras que esta version ofrece pesos F32 en Safetensors (444.048.000 bytes) con una auditoria documentada: coincidencia de hash SHA256 del origen, comparacion exacta de los 149 tensores del state-dictionary, mapeo identico del tokenizador y logits de salida identicos (diferencia absoluta maxima de 0.0) en tres prompts de prueba. Ademas, se activa `tie_word_embeddings=True`, de modo que la matriz de embeddings de entrada y la cabeza de salida comparten almacenamiento.

El modelo es un GPT-2 de 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y 32.768 tokens de vocabulario, con una ventana de contexto de solo 1.024 tokens. Fue preentrenado sobre codigo limpio de GitHub en Java, JavaScript, PHP, Python, C#, C++, Go, Ruby y TypeScript, y es util como linea base compacta de experimentacion en autocompletado de codigo, no como asistente conversacional. Su licencia Apache-2.0 y su huella de 0,4 GB lo hacen trivial de desplegar en cualquier maquina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (`GPT2LMHeadModel`), transformer causal decoder-only |
| Parametros totales | 111.008.256 unicos (con embeddings atados); 136.174.080 fisicos antes del atado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | El repo publica unicamente F32; no se ofrecen GGUF, INT8 ni otras cuantizaciones |
| Idiomas soportados | Codigo: Java, JavaScript, PHP, Python, C#, C++, Go, Ruby, TypeScript |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (F32); 148 tensores fisicos almacenados, 149 tensores logicos tras cargar |

Otros datos tecnicos: 12 capas, 768 de dimension oculta, 12 cabezas de atencion, vocabulario de 32.768 entradas con tokenizador GPT-2, tamaño del repo 0,4 GB, 1.096 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de tipo GPT-2, sin mecanismos de atencion lineal, MoE ni estado recurrente. El modelo base fue entrenado por el proyecto CodeParrot en 300.000 pasos sobre aproximadamente 58.000 millones de tokens del dataset `codeparrot/github-code-clean`, una version filtrada de codigo de GitHub. La model card no documenta fases de RLHF, DPO ni instruccion supervisada: es un modelo base de lenguaje, entrenado con el objetivo estandar de prediccion del siguiente token.

La contribucion tecnica de esta ficha es de empaquetado y verificacion, no de modelado. El autor del conversion realiza una auditoria reproducible: descarga el `pytorch_model.bin` original, comprueba su SHA256 (`0207f6b4…18ffb2`), lo deserializa con `weights_only=True` y compara tensor a tensor contra el artefacto publicado (`9cbfd95c…0ed7`). Las 149 entradas logicas del state-dictionary coinciden exactamente, el vocabulario del tokenizador coincide exactamente y los logits de tres prompts son identicos. En el checkpoint original, `transformer.wte.weight` y `lm_head.weight` tenian ambas forma (32768, 768) y valores identicos elemento a elemento, de modo que el conversion puede activar el atado de embeddings y almacenar una sola copia de la matriz, reduciendo el numero de tensores fisicos a 148 sin alterar la salida del modelo.

## Capacidades

- Completado de codigo en el punto de cursor: continuacion de una funcion, expresion o bloque a partir de un prefijo de codigo.
- Continuacion de archivos parciales, respetando el estilo y los patrones del contexto inmediato.
- Generacion de texto causal generico (cualquier secuencia de tokens), aunque su dominio efectivo es el codigo.
- Cobertura multilinguee de lenguajes de programacion: Java, JavaScript, PHP, Python, C#, C++, Go, Ruby y TypeScript.
- No soporta tool calling ni function calling: no hay plantilla de herramientas ni entrenamiento orientado a instrucciones.
- No soporta agentes ni razonamiento multi-paso: carece de modo thinking, de planificacion explicita y de cualquier etapa de RL.
- No dispone de vision, audio ni multimodalidad.
- No sigue instrucciones en lenguaje natural de forma fiable; no es un modelo de chat.

## Casos de uso

- Autocompletado en editor de codigo: integrar el modelo detras de un plugin que envie el prefijo del buffer (hasta 1.024 tokens) y muestre la continuacion como sugerencia. Es adecuado por su latencia baja y su huella de 0,4 GB, que permite ejecutarlo en la propia maquina del desarrollador.
- Generacion de plantillas y boilerplate: a partir de una firma de funcion o de una cabecera de clase, el modelo continua el cuerpo con estructuras repetitivas (getters, serializadores, imports). Util para prototipado rapido, con revision humana obligatoria.
- Relleno de tests unitarios esqueleto: dado el codigo de una funcion y el inicio de un `def test_...`, el modelo propone aserciones plausibles que el desarrollador valida y ejecuta despues con pytest o JUnit.
- Linea base de evaluacion academica: sirve como referencia de un GPT-2 de 111M entrenado en codigo multilinguee para comparar con modelos mayores en experimentos de completado, midiendo pass@k con el dataset `openai_humaneval` referenciado en la model card.
- Generacion de ejemplos sinteticos de codigo: producir variantes de fragmentos para aumentar datasets de entrenamiento o de pruebas, filtrando despues por compilacion y ejecucion de tests.
- Traduccion superficial entre lenguajes con sintaxis similar: con un prefijo que incluya el fragmento original y el encabezado del lenguaje destino, el modelo puede proponer una transcripcion aproximada (por ejemplo, Java a C#), siempre sujeta a correccion manual.
- Ensenanza y demostracion de modelos de lenguaje: por su tamano, permite ejecutar y diseccionar un modelo de codigo completo en un portatil, incluyendo inspeccion de atenciones y de logits, algo inviable con modelos de miles de millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original deja las columnas `pass@1`, `pass@10` y `pass@100` de HumanEval como `--%` para este checkpoint multilinguee, y el autor de la conversion advierte explicitamente de que los resultados publicados para `codeparrot/codeparrot-small` (variante solo Python) no deben atribuirse a este modelo. Las pruebas locales mencionadas en la model card se describen como exploratorias, no controladas, y no permiten estimar una tasa de acierto.

| Benchmark | Resultado | Nota |
|---|---|---|
| HumanEval pass@1 | no disponible (`--%` en la card original) | Sin evaluacion numerica publicada |
| HumanEval pass@10 | no disponible (`--%` en la card original) | Sin evaluacion numerica publicada |
| HumanEval pass@100 | no disponible (`--%` en la card original) | Sin evaluacion numerica publicada |
| MMLU / GSM8K / otros | no disponible | No evaluados para este checkpoint |

## Requisitos de hardware

- VRAM para los pesos: 444 MB en F32 (unica precision publicada). En FP16 serian unos 222 MB y en INT8 unos 111 MB, pero esas conversiones no estan publicadas y habria que generarlas.
- Cache KV: con 12 capas y 768 dimensiones ocultas, cada token ocupa unos 72 KB en F32 (2 × 12 × 768 × 4 bytes); 1.024 tokens suponen aproximadamente 75 MB por secuencia. Un lote de 8 secuencias a contexto completo rondaria los 600 MB solo de cache, en estimacion calculada, no medida.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4090, A100 y H100. El modelo esta limitado por CPU y por latencia de lanzamiento de kernels, no por memoria.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en un portatil moderna es viable sin cuantizacion.
- Opciones de despliegue: `transformers` (ruta directa, es la libreria declarada), Text Generation Inference (la model card incluye el tag `text-generation-inference` y `endpoints_compatible`), y vLLM, que soporta arquitecturas GPT-2. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, conversion no publicada en el repo.
- Latencia y throughput: no disponible (no se han publicado mediciones). Cualquier cifra debe obtenerse midiendo sobre el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas de codigo | Formato | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| TULLUS/codeparrot-small-multi-F32 | 111.008.256 unicos | 1.024 | 9 lenguajes (Java, JS, PHP, Python, C#, C++, Go, Ruby, TS) | Safetensors F32 | Apache-2.0 | No (HumanEval `--%`) |
| codeparrot/codeparrot-small-multi (origen) | 136.174.080 fisicos antes del atado; 111M unicos | 1.024 | 9 lenguajes | `pytorch_model.bin` | Apache-2.0 | No (HumanEval `--%`) |
| codeparrot/codeparrot-small | no disponible en la informacion proporcionada | no disponible | Python (variante solo Python) | no disponible | Apache-2.0 (heredada del proyecto CodeParrot) | Si, publicados por el proyecto; cifras no incluidas en esta informacion |

Las diferencias entre las dos primeras filas son exclusivamente de empaquetado: misma arquitectura, mismos valores de tensor y mismos logits, con embeddings atados y Safetensors en lugar de pickle. Frente a `codeparrot-small`, el cambio relevante es la cobertura multilinguee, a costa de no disponer de cifras de HumanEval.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no mantiene conversacion ni sigue peticiones en lenguaje natural. Prompting elaborado no lo convierte en un asistente.
- Ventana de contexto muy corta (1.024 tokens): no puede razonar sobre archivos completos ni sobre repositorios; el contexto debe recortarse o trocearse.
- Riesgo alto de codigo incorrecto: al ser un modelo base de 111M sin verificacion, puede generar APIs inexistentes, imports erroneos y logica sutilmente rota. Todo el codigo generado debe pasar tests y revision antes de llegar a produccion.
- Alucinacion: puede inventar nombres de funciones, paquetes y firmas de librerias con apariencia verosimil.
- Sesgos: no se documenta ninguna evaluacion de sesgo ni de seguridad; el entrenamiento sobre codigo publico de GitHub puede reproducir patrones de estilo, licencias y practicas presentes en ese corpus.
- Riesgo de memorizacion y de contaminacion de licencias: al derivar de codigo de GitHub, existe la posibilidad de reproducir fragmentos del entrenamiento cuya licencia no sea compatible con el uso previsto. La licencia Apache-2.0 del artefacto no garantiza la licencia del codigo generado.
- Ausencia de datos de rendimiento: no hay benchmark que respalde ninguna afirmacion de calidad; las pruebas citadas por el autor son exploratorias.
- La model card original esta truncada en la informacion disponible (corta en la seccion de tensores), por lo que podrian existir detalles adicionales no recogidos aqui.
- Uso comercial: la licencia Apache-2.0 lo permite, con las obligaciones habituales de atribucion y aviso; conviene revisar igualmente las condiciones del dataset `codeparrot/github-code-clean` para el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TULLUS/codeparrot-small-multi-F32
- Modelo base original: https://huggingface.co/codeparrot/codeparrot-small-multi
- Variante solo Python citada en la card: https://huggingface.co/codeparrot/codeparrot-small
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset de evaluacion referenciado: https://huggingface.co/datasets/openai_humaneval
- No se han encontrado en la busqueda web enlaces adicionales relevantes para este modelo.
