# vdaular/decider-2b-vision

## Resumen

decider-2b-vision es un modelo de decisión multimodal desarrollado por vdaular (la model card lo vincula a la familia decider del repositorio Mapika), construido a partir de Qwen/Qwen3.5-2B-Base en su variante vision-language. No es un modelo generativo conversacional: recibe una imagen (una fotografía, un diagrama o un fotograma de juego) junto con una pregunta de texto con opciones etiquetadas con letras y devuelve una distribución de probabilidad calibrada sobre esas opciones en un único slot de respuesta. Todo el cálculo se resuelve en una sola pasada hacia delante, sin decodificación autoregresiva.

El modelo tiene 2.213.241.664 parámetros en formato safetensors y ocupa 4,4 GB de repositorio (4,1 GB en bf16 según la model card). Su interés práctico radica en dos cosas: por un lado, sustituye la generación de texto por una lectura directa de logits sobre las letras de las opciones, lo que da probabilidades calibradas (ECE entre 0,02 y 0,07 según tarea) y permite fijar umbrales de confianza; por otro, incorpora entrada visual real, con un fotograma de juego de 256x240 que se codifica en 64 tokens visuales.

Es relevante ahora porque cubre el nicho de los sistemas de decisión multimodales de bajo coste: enrutado, clasificación, juicios con opciones cerradas y control de agentes a partir de píxeles. Las limitaciones son explícitas: solo inglés, no admite formato de chat ni captioning, y el backbone de texto incrustado corresponde a la versión v5 de decider-2b, no a las versiones v6 a v10 posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text basado en Qwen3.5-2B vision-language (decoder con codificacion visual); el detalle del encoder visual no se especifica en la informacion disponible |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos publicados, 4,1 GB). No se documentan GGUF, int8, int4 ni NVFP4 para esta variante |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-2B-Base (variante vision-language) |
| Tamano del repositorio | 4,4 GB |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de tipo image-text-to-text: los pesos de texto de decider-2b v5 se trasplantaron al modelo vision-language completo de Qwen3.5-2B, de modo que la torre de texto conserva el comportamiento del modelo de decision original (incluida su gestion de abstención) y se anade procesamiento visual. El punto de lectura es una ranura de respuesta: el modelo aplica softmax sobre los logits de las letras correspondientes a las opciones, sin generar tokens. Un fotograma de juego de 256x240 consume 64 tokens visuales, lo que mantiene bajo el coste de inferencia en escenarios con imagenes pequenas.

El entrenamiento consistio en una sola epoca sobre 80.000 ejemplos, de los cuales 50.000 incluian imagenes. La composicion es triple: (1) fotogramas de juego de Pong, Breakout, CliffWalking, MiniGrid y Super Mario Bros etiquetados por politicas scripted, con sobremuestreo de acciones raras y anadido de fotogramas DAgger procedentes del propio juego de un modelo anterior; (2) tareas de eleccion multiple sobre imagenes extraidas de The Cauldron (A-OKVQA, AI2D, ScienceQA, IconQA, TQA, Raven y Hateful Memes); y (3) una repeticion (replay) de la mezcla de texto. Tras ello se aplico PPO desde pixeles sobre Breakout y Pong, donde el propio softmax sobre las opciones de accion actua como politica. El codigo de entrenamiento vive en el directorio `decider/vision/` del repositorio GitHub.

## Capacidades

- Decision con opciones cerradas sobre imagenes: dada una imagen y una pregunta con alternativas etiquetadas (A, B, C, D...), devuelve una probabilidad calibrada por opcion en una sola pasada.
- Visual question answering de conjunto cerrado: A-OKVQA, AI2D, ScienceQA, IconQA, Raven y Hateful Memes, con exactitudes entre 0,80 y 0,95.
- Decision solo texto: hereda el comportamiento de decider-2b v5, incluida su gestion de abstención, cuando se pasa `None` como imagen.
- Juego desde pixeles: control de agentes en Breakout, Pong, CliffWalking, MiniGrid Empty y Super Mario Bros 1-1 sin estado textual ni RAM.
- Interpretacion de diagramas y material cientifico: AI2D (0,93) y ScienceQA (0,95) apuntan a esquemas, figuras y preguntas de ciencia.
- Clasificacion de contenido sensible: Hateful Memes con 0,80 de exactitud.
- Calibracion de confianza: ECE de 0,02 a 0,07 por tarea, apto para umbrales de abstención.
- Procesamiento de imagenes de baja resolucion con coste reducido: 64 tokens visuales por fotograma de 256x240.
- No soporta: generacion de texto libre, captioning, dialogo multi-turno, tool calling ni function calling (no documentados).

## Casos de uso

- Control de agentes de videojuego desde pixeles: el modelo puede actuar como politica en entornos tipo Atari o MiniGrid consumiendo solo el fotograma, con 41 puntos en Breakout, -13 en CliffWalking (optimo) y 0,96 en MiniGrid Empty. Es adecuado porque la politica entrenada con PPO es directamente el softmax sobre las opciones de accion.
- Clasificacion de memes y contenido nocivo: con 0,80 de exactitud en Hateful Memes, se puede integrar en un pipeline de moderacion que reciba imagen y texto y devuelva la probabilidad de cada categoria, con ECE bajo para fijar un umbral de revision humana.
- Enrutado de peticiones en sistemas multimodales: dado un par imagen-pregunta, decidir a que subsistema derivarlo (OCR, VQA, moderacion, descarte) usando las probabilidades calibradas como senal de confianza.
- Apoyo educativo sobre diagramas cientificos: responder preguntas de AI2D, ScienceQA e IconQA con opciones cerradas permite construir ejercicios autocorregidos donde la probabilidad por opcion orienta la retroalimentacion.
- Agentes de interfaz grafica sobre capturas de pantalla: aunque no esta validado en GUI, el mismo esquema (imagen de pantalla mas pregunta con opciones) permite decidir la siguiente accion en un flujo de automatizacion; conviene validar antes en datos propios.
- Etiquetado asistido de datos visuales: al devolver distribuciones calibradas en lugar de texto generado, es util para preetiquetar datasets de opcion multiple y priorizar la revision manual por incertidumbre.
- Sistemas de decision con abstención: la gestion de abstención heredada de la version de texto permite descartar casos por debajo de un umbral de confianza en lugar de forzar una respuesta.
- Evaluacion rapida de fotografias de juego con estado oculto: el modelo obtuvo 0,96 de acuerdo con el profesor de estado RAM en Pong y Breakout, lo que sirve para monitorizar agentes a partir de imagenes.

## Benchmarks y rendimiento

Resultados publicados en la model card, 300 elementos por tarea:

| Tarea (vision) | Exactitud | ECE |
|---|---|---|
| Pong (frames, acuerdo con el profesor de estado RAM) | 0,96 | 0,02 |
| Breakout (frames) | 0,96 | 0,02 |
| Visual7W (held out) | 0,89 | 0,03 |
| A-OKVQA | 0,85 | 0,02 a 0,07 |
| AI2D | 0,93 | 0,02 a 0,07 |
| ScienceQA | 0,95 | 0,02 a 0,07 |
| IconQA | 0,94 | 0,02 a 0,07 |
| Raven | 0,80 | 0,02 a 0,07 |
| Hateful Memes | 0,80 | 0,02 a 0,07 |

Juego desde pixeles, tres episodios por entorno:

| Entorno | decider-2b-vision | Profesor / referencia |
|---|---|---|
| Breakout | 41 | 22 (profesor de estado RAM) |
| Pong | 3 | 8 (profesor de estado RAM) |
| CliffWalking | -13 | -13 (optimo) |
| MiniGrid Empty | 0,96 | nivel del profesor |
| Freeway (held out) | 0 | no disponible |
| FrozenLake (held out) | 0 | no disponible |
| Grid worlds mas duros | 0 | 0 (sus profesores scripted) |
| Mario 1-1 | 315 px | no disponible |

Comparacion con la release anterior de vision (basada en v4): Breakout 16, Pong 8, Freeway 8, BabyAI-GoTo 0,30. La version actual gana en Breakout y en el comportamiento de abstención corregido, y pierde en Pong y Freeway. No se han publicado comparaciones con modelos externos de la misma categoria en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: 4,1 GB en bf16 (4,4 GB de repositorio). No hay cuantizaciones publicadas para esta variante.
- VRAM estimada para inferencia: en torno a 6-8 GB en bf16 contando pesos, activaciones y el encoder visual; no se especifica una cifra oficial.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 son suficientes para bf16. En GPUs de 8 GB el margen es ajustado.
- GPU de centro de datos recomendadas: A100, H100 o L40S si se necesita paralelizar o servir en produccion; el modelo es lo bastante pequeno para no requerir reparto entre GPUs.
- Opciones de despliegue: la model card usa codigo propio de la familia decider (`decider.vision.VisionDecisionModel` y `decider.infer`), ademas de una interfaz HTTP compatible con el formato de TypeSafe (`POST /v1/systemone`). No se documentan vLLM, TGI, llama.cpp ni Ollama para esta variante.
- Latencia y throughput: no disponibles especificamente para la variante de vision. Como referencia de familia, decider-2b v10 (texto) declara 4 ms por peticion con CUDA graphs en una sola GPU; esa cifra no debe extrapolarse sin medirla.
- Requisitos adicionales: `grad_ckpt=False` en el ejemplo de uso, lo que implica que el codigo asume memoria suficiente para no usar checkpointing de gradientes.

## Comparativa con modelos similares

La familia decider es la referencia mas directa. Comparacion segun los datos de la model card:

| Modelo | Base | Pesos | Uso previsto | Metricas declaradas |
|---|---|---|---|---|
| decider-2b-vision (este) | Qwen3.5-2B vision-language, pesos de texto v5 | 4,1 GB bf16 | decisiones a partir de imagen mas pregunta; fotogramas de juego | Visual7W 0,89; Breakout 41 |
| decider-2b v10 | Qwen3.5-2B-Base | 3,5 GB bf16 | enrutado, clasificacion, juicios, agentes de navegador | 0,805 en tarea / 0,755 held-out; navegador en vivo 93%; Bespoke 0,704 |
| decider-4b v1 | Qwen3.5-4B-Base | 8,4 GB bf16 | conocimiento y razonamiento por encima del 2B | 0,834 / 0,788; supera al 2B en 87 de 95 tareas; JevBench hard 0,541; Bespoke 0,757 |
| decider-35b-a3b v1 | Qwen3.5-35B-A3B-Base (3B activos) | 65 GB bf16 | maxima precision en conocimiento y politicas largas | 0,855 / 0,810; supera al 2B en 93 de 95 tareas; JevBench hard 0,676; Bespoke 0,774 |
| decider-35b-a3b-nvfp4 | el 35B en NVFP4 | 19,6 GB | el 35B en Blackwell via vLLM o TensorRT-LLM | 1,0 a 1,5 puntos por debajo de bf16 en los fixtures medidos |
| decider-0.8b | Qwen3.5-0.8B-Base | 1,4 GB bf16 | enrutado y consultas si/no de estado corto | 0,776 / 0,707 en el protocolo de una sola ejecucion (2B: 0,809 / 0,739) |

No se dispone de comparaciones con modelos de vision de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni un captioner: solo responde a opciones etiquetadas con letras en una unica ranura; no genera texto libre.
- Los pesos de texto incrustados son de decider-2b v5, no de las versiones v6 a v10: el comportamiento solo texto corresponde a v5 (su gestion de abstención, pero ninguna de las formas de entrada, calibracion ni resultados de navegador posteriores). No se ha publicado un reentrenamiento sobre los pesos de texto actuales.
- Solo ingles. El resto de idiomas no esta soportado oficialmente.
- La calibracion (ECE de 0,02 a 0,07) esta medida en los conjuntos listados, no en imagenes propias: en produccion hay que recalibrar sobre el dominio objetivo antes de fijar umbrales.
- El juego desde pixeles se midio sobre fotogramas de Atari, MiniGrid y Mario del entrenamiento mas unos pocos juegos held out, con solo tres episodios por entorno: la varianza de esas cifras es alta.
- Rendimiento nulo en varios entornos held out: Freeway 0, FrozenLake 0 y los grid worlds mas duros 0 (aunque sus profesores scripted tambien puntuan 0, lo que sugiere que la tarea puede ser inviable, no solo un fallo del modelo).
- La release actual intercambia rendimiento: mejora Breakout y corrige la abstención, pero empeora Pong (3 frente a 8 en la version anterior) y Freeway.
- Riesgo de alucinacion: no aplica en la forma habitual, porque no genera texto, pero si puede asignar alta probabilidad a una opcion incorrecta cuando la imagen o la pregunta quedan fuera de la distribucion de entrenamiento.
- En la informacion disponible, el ID de HuggingFace es `vdaular/decider-2b-vision`, mientras que la model card enlaza a los repositorios de la organizacion `Mapika`. Conviene verificar la procedencia y la autoria antes de un uso en produccion.
- Repositorio sin descargas ni likes en la fecha de la ficha, lo que reduce la validacion externa disponible.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de licencia y a tener en cuenta los terminos del modelo base Qwen/Qwen3.5-2B-Base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vdaular/decider-2b-vision
- Variante de vision en la familia Mapika: https://huggingface.co/Mapika/decider-2b-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- decider-0.8b: https://huggingface.co/Mapika/decider-0.8b
- Repositorio GitHub (codigo, registro de datos, scripts de entrenamiento): https://github.com/Mapika/decider
- Historial de versiones: https://github.com/Mapika/decider/blob/main/docs/CHANGELOG.md
