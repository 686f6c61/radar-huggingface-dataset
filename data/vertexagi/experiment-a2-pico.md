# VertexAGI/experiment-a2-pico

## Resumen

Experiment A2 Pico es un transformer decoder-only de 1.009.920 parametros entrenado desde cero por VertexAGI sobre el corpus tinyshakespeare (aproximadamente 1 millon de caracteres). Se trata de la continuacion del experimento A1 Pico del mismo autor: la arquitectura es identica, pero el entrenamiento se alargo de 3.000 a 12.000 iteraciones (4 veces mas) para medir hasta donde llegaba la misma combinacion de modelo diminuto y dataset diminuto. El modelo tiene 160 dimensiones de hidden, 3 capas, 4 cabezas de atencion, contexto de 128 tokens y un vocabulario de 65 simbolos a nivel de caracter.

No es un modelo de produccion ni forma parte de ninguna linea comercial del autor: la propia model card lo describe como "for-fun". Su interes es metodologico, no funcional. La contribucion principal del experimento es un resultado negativo bien documentado: a partir de la iteracion ~6.500 la perdida de validacion se estanca y oscila en la banda 1,60-1,63 mientras la perdida de entrenamiento sigue bajando hasta 1,2538, la firma clasica de sobreajuste. Con ~98 millones de tokens de actualizaciones de gradiente sobre un corpus de ~1 millon de caracteres, el modelo vio el mismo texto mas de 90 veces.

Es relevante ahora porque sirve como caso de estudio reproducible y de coste minimo (727 segundos de entrenamiento) sobre un problema que afecta a equipos con presupuestos grandes: entrenar mas tiempo no equivale a generalizar mejor. La licencia MIT y el formato MLX lo hacen ademas util como banco de pruebas para pipelines de inference en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo nanoGPT), con SwiGLU en la capa intermedia |
| Parametros totales | 1.009.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no declarados; el corpus es ingles y el vocabulario es a nivel de caracter, por lo que no hay soporte multilingue real) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio etiquetado con la libreria mlx; la model card no detalla el formato de los pesos) |
| Tamano del repo | 0,0 GB (redondeado por HuggingFace) |
| Hidden size | 160 |
| Capas | 3 |
| Cabezas de atencion | 4 |
| Intermediate size (SwiGLU) | 480 |
| Vocabulario | 65 (nivel de caracter) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es identica a la de Experiment A1 Pico: un transformer decoder-only de 3 capas, 160 de hidden size, 4 cabezas de atencion, capa intermedia SwiGLU de 480 y contexto de 128 tokens. El vocabulario es a nivel de caracter (65 simbolos), lo que evita cualquier tokenizador BPE y reduce el modelo a algo mas de un millon de parametros. No hay innovaciones tecnicas destacables: es una implementacion didactica de un transformer autoregresivo.

El entrenamiento consistio en 12.000 iteraciones con batch size 64, longitud de secuencia 128 y optimizador AdamW con learning rate 3e-3, completadas en 727 segundos. No se aplico RLHF, DPO ni ajuste por instrucciones de ningun tipo: es preentrenamiento puro de modelado de lenguaje. No se guardaron checkpoints intermedios, por lo que solo se publican los pesos finales de la iteracion 12.000, que ya esta mas alla del plateau de perdida de validacion. Segun la propia model card, el mejor checkpoint en terminos de generalizacion estaba en algun punto entre las iteraciones 6.500 y 11.500 y no se conservo. No se menciona el hardware exacto de entrenamiento, aunque la libreria MLX sugiere Apple Silicon.

## Capacidades

- Generacion de texto autoregresiva a nivel de caracter, en estilo isabelino, como continuacion de un prompt corto.
- Reproduccion de nombres de personajes reales de Shakespeare (Henry Bolingbroke, York, Friar Laurence, Duke Vincentio, Lord Ross, Menenius) de forma no forzada, efecto atribuido al sobreajuste sobre el corpus.
- Modelado de lenguaje puro: no hay ajuste por instrucciones, por lo que no responde a ordenes ni preguntas.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingues: el vocabulario de 65 caracteres cubre el texto ingles del corpus.
- Sin vision, audio ni modo de razonamiento explicito (thinking mode).
- Sin capacidades de generacion de codigo ni de matematicas mas alla de lo que aparezca incidentalmente en el corpus.

En la practica, el modelo solo sabe una cosa: continuar texto con la estadistica de tinyshakespeare. Cualquier capacidad fuera de eso debe considerarse ausente, no debil.

## Casos de uso

- Material docente sobre preentrenamiento desde cero: el modelo completo cabe en un fichero de pocos megabytes y se entrena en 727 segundos, lo que permite reproducir el ciclo completo (datos, tokenizacion a nivel de caracter, bucle de entrenamiento, evaluacion de perdida) en una sola sesion de clase o taller.
- Estudio empirico del sobreajuste: comparar las curvas de perdida de A1 Pico (3.000 iteraciones) y A2 Pico (12.000 iteraciones) ofrece un ejemplo cuantificado de como la brecha train/val se abre de 0,21 a 0,37 cuando se entrena mas alla del punto util.
- Prueba de humo de pipelines MLX: al ser un checkpoint diminuto, sirve para verificar que un entorno MLX/MLX-LM carga pesos, ejecuta generacion y no rompe la cadena de tooling antes de desplegar modelos grandes en el mismo stack.
- Baseline de experimentos de cuantizacion: con 1.009.920 parametros se puede medir con precision la degradacion de la perplejidad al pasar de FP32 a FP16, INT8 o 4 bits sin el ruido estadistico de modelos grandes.
- Generacion de texto estilizado para prototipos: en demos de videojuegos, ficcion interactiva o prototipos de interfaz se puede usar para producir parrafos con sabor shakespeariano a partir de un prompt como "ROMEO:", siempre con revision humana y asumiendo que el texto no tendra coherencia sostenida mas alla de unas lineas.
- Benchmark de latencia en edge y dispositivos sin GPU: por su tamano, es un candidato para medir tiempos de generacion en Raspberry Pi, moviles o navegador y comparar frameworks (MLX, PyTorch, ONNX Runtime).
- Pruebas de robustez de tokenizadores a nivel de caracter: permite estudiar el comportamiento de un modelo cuando la unidad de entrada es el caracter, con prompts con ruido, mayusculas mezcladas o puntuacion atipica.
- Test de integracion continua con requisitos minimos: al ocupar unos pocos megabytes, se puede incluir como caso de regresion en CI para verificar que una nueva version del runtime de inference produce exactamente la misma salida con la misma semilla y temperatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta la evolucion de la perdida de entrenamiento y de validacion:

| Iteracion | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|
| 1 | 4,9641 | 4,0178 |
| 1.000 | 2,0818 | 2,1416 |
| 2.000 | 1,7449 | 1,9314 |
| 3.000 | 1,6464 | 1,8299 |
| 4.000 | 1,5383 | 1,7229 |
| 5.000 | 1,4342 | 1,6962 |
| 6.000 | 1,4066 | 1,6411 |
| 6.500 | 1,3710 | 1,6245 |
| 7.000 | 1,3410 | 1,6246 |
| 8.000 | 1,3400 | 1,6237 |
| 9.000 | 1,3443 | 1,6104 |
| 10.000 | 1,3057 | 1,6201 |
| 11.500 | 1,2842 | 1,5994 |
| 12.000 (final) | 1,2538 | 1,6284 |

La mejor perdida de validacion registrada fue 1,5994 en la iteracion 11.500, pero el checkpoint publicado corresponde a la iteracion 12.000 con 1,6284. No hay evaluacion cualitativa mas alla de las siete generaciones de ejemplo incluidas en la model card (prompts "ROMEO:", "JULIET:", "To be, or not to be", "KING RICHARD:\nNow is the winter", "First Citizen:", "O, what a", "MENENIUS:", con temperaturas entre 0,6 y 0,9 y 280 caracteres de salida).

## Requisitos de hardware

No se publican requisitos de hardware en la model card. Las cifras siguientes son estimaciones derivadas del recuento de parametros (1.009.920) y deben tomarse como orientativas:

- VRAM en FP32: aproximadamente 4 MB para los pesos, mas el cache KV (contexto de solo 128 tokens, 3 capas y 160 de hidden) y las activaciones, en el orden de unos pocos megabytes adicionales.
- VRAM en FP16/BF16: aproximadamente 2 MB de pesos.
- VRAM en INT8: aproximadamente 1 MB.
- VRAM en 4 bits: aproximadamente 0,5 MB.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluidos iGPU y aceleradores integrados. No se justifica usar A100 o H100 para inferencia.
- Compatibilidad con GPU de consumo: si, en cualquier RTX, GTX o GPU integrada; tambien funciona en CPU pura.
- Apple Silicon: es el entorno natural, dado que el modelo se publica con la libreria MLX.
- Opciones de despliegue: MLX / MLX-LM de forma nativa. vLLM, TGI, llama.cpp u Ollama requeririan una conversion de formato previa que no esta documentada en la model card, por lo que no se pueden dar por soportadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de inferencia; el dato de 727 segundos corresponde al entrenamiento completo, no a la generacion.

## Comparativa con modelos similares

El unico comparable con datos verificables es el propio Experiment A1 Pico del mismo autor, del que A2 es una extension directa. Ambos comparten arquitectura y recuento de parametros.

| Modelo | Parametros | Contexto | Iteraciones | Perdida train (final) | Perdida val (final) | Brecha train/val | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| experiment-a2-pico | 1.009.920 | 128 | 12.000 | 1,2538 | 1,6284 | 0,37 | MIT | HuggingFace, 0 descargas |
| experiment-a1-pico | 1.009.920 (identica) | 128 (identica) | 3.000 | 1,4751 | 1,6818 | 0,21 | MIT | HuggingFace |

A2 obtiene una perdida de validacion absoluta ligeramente mejor (1,63 frente a 1,68), pero la brecha entre entrenamiento y validacion se amplia de 0,21 a 0,37, lo que indica que la mejora procede en buena parte de memorizacion y no de mejor generalizacion.

No se dispone de datos verificables de otros modelos comparables de tamano similar (por ejemplo, variantes de nanoGPT o de char-RNN entrenadas sobre tinyshakespeare) dentro de la informacion proporcionada, por lo que no se incluyen cifras de terceros. Los resultados de la busqueda web no contenian ninguna referencia tecnica utilizable: todos los enlaces devueltos correspondian a recetas de patatas fritas y no guardan relacion con el modelo.

## Limitaciones y advertencias

- Sobreajuste confirmado: a partir de la iteracion ~6.500 la perdida de validacion se estanca en la banda 1,60-1,63 mientras la de entrenamiento sigue bajando. El checkpoint publicado (iteracion 12.000) no es el de mejor generalizacion; el optimo estaba entre las iteraciones 6.500 y 11.500 y no se guardo.
- No hubo early stopping ni guardado de checkpoints intermedios, por lo que no es posible recuperar el mejor estado del modelo a partir de este repositorio.
- Riesgo alto de reproduccion literal de fragmentos del corpus de entrenamiento, especialmente de nombres de personajes y giros de frase de Shakespeare.
- Coherencia muy limitada: con 128 tokens de contexto y 3 capas, las generaciones se degradan rapidamente y no mantienen hilo argumental ni consistencia de personajes.
- Alucinacion estructural: el modelo inventa palabras inexistentes ("aquaidy", "prely", "nure", "pusinest") porque opera a nivel de caracter y no dispone de un vocabulario linguistico.
- Idiomas: no hay soporte multilingue declarado; el vocabulario de 65 caracteres esta adaptado al texto en ingles y fallaria en la mayoria de caracteres acentuados y alfabetos no latinos.
- Contexto de 128 tokens: insuficiente para cualquier tarea que requiera memoria conversacional o documentos largos.
- Sesgos: no se documenta ningun analisis de sesgos. El corpus (dramas de Shakespeare) contiene estereotipos de genero, clase y epoca que el modelo puede reproducir sin filtro.
- Uso comercial: la licencia MIT lo permite explicitamente, pero carece de sentido practico por la calidad de la salida. Si se reutiliza, se debe verificar el cumplimiento de la licencia del corpus tinyshakespeare, que la model card no detalla.
- Modelo no apto para produccion: no sigue instrucciones, no soporta tool calling y no tiene ninguna evaluacion de seguridad. Cualquier despliegue orientado a usuarios finales exigiria filtros y supervision adicionales.
- La model card esta truncada en la seccion de comparacion cualitativa con A1 Pico, por lo que parte del analisis del autor no es legible en la version indexada.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexAGI/experiment-a2-pico
- Experiment A1 Pico (comparativa directa): https://huggingface.co/VertexAGI/experiment-a1-pico
- Corpus de entrenamiento tinyshakespeare: https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los resultados devueltos correspondian a recetas de cocina y no guardan relacion con el modelo.
