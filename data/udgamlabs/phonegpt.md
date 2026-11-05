# udgamlabs/PhoneGPT

## Resumen

PhoneGPT es un modelo de lenguaje a nivel de carácter de 1,21 millones de parámetros desarrollado por Udgam Labs, un laboratorio de investigación independiente. El modelo se entrenó desde pesos aleatorios sobre aproximadamente 1 MB de texto de Shakespeare (el corpus Tiny Shakespeare) utilizando únicamente dos núcleos de CPU de un Samsung Galaxy F62 de 2021, en modo avión y sin acceso a la nube, durante un evento retransmitido en directo por YouTube y X el 5 de noviembre de 2026.

El objetivo declarado del proyecto no es ofrecer un modelo utilizable, sino documentar un experimento de entrenamiento reproducible en hardware de consumo antiguo. La arquitectura es un transformer tipo GPT de estilo nanoGPT con 6 capas, 4 cabezas de atención, anchura 128 y una longitud de contexto de 128 caracteres. El entrenamiento se realizó con el entrenador `phone_gpt.c`, adaptado de `llm.c` de Andrej Karpathy, durante 24 000 pasos.

Su relevancia es divulgativa y educativa: demuestra el ciclo completo de entrenamiento de un modelo de lenguaje en un dispositivo móvil, con checkpoints intermedios publicados, métricas de validación verificables y código fuente abierto. El propio autor advierte que el modelo genera "nonsense con forma de Shakespeare" y que no debe emplearse en tareas reales de escritura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (estilo nanoGPT), 6 capas, 4 cabezas de atencion, anchura 128 |
| Parametros totales | 1 214 976 (1,21 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 caracteres |
| Tipos de cuantizacion | No disponible (checkpoints en formato binario propio del entrenador) |
| Idiomas soportados | Ingles (a nivel de caracter, corpus Tiny Shakespeare) |
| Licencia | MIT |
| Formato de pesos | `.bin` propietario del entrenador `phone_gpt.c` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un GPT decoder-only de pequeno tamano: 6 capas transformer, 4 cabezas de atencion, dimension de modelo 128 y ventana de contexto de 128 caracteres. La tokenizacion es a nivel de caracter, no de subpalabra, lo que implica un vocabulario minimo y elimina la necesidad de un tokenizador entrenado aparte. Los pesos se entrenaron desde inicializacion aleatoria (semilla 20261105) sin partir de ningun modelo preentrenado.

El corpus de entrenamiento es el 90 % inicial de Tiny Shakespeare, aproximadamente 1 MB de texto, sin datos adicionales. El entrenamiento se ejecuto durante 24 000 pasos en dos nucleos de CPU del SoC Exynos 9825 del Samsung Galaxy F62, a unos 1,5 segundos por paso, con una duracion total de 10 horas y 45 minutos. El entrenador es una adaptacion de `llm.c` de Karpathy. No se aplicaron tecnicas de RLHF, DPO ni ajuste por instrucciones; el modelo es puramente un modelo de lenguaje autorregresivo sin alineamiento.

## Capacidades

- Generacion de texto a nivel de caracter, limitada a continuaciones de estilo isabelino sobre el vocabulario y las estructuras del corpus Tiny Shakespeare.
- Modelado de secuencias cortas de hasta 128 caracteres de contexto.
- Reproduccion de patrones estilisticos (nombres de personajes, estructura de dialogo, versificacion aproximada) presentes en el corpus.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues: solo ingles y a nivel de caracter.
- No dispone de modo thinking, vision ni audio.
- No esta ajustado por instrucciones: no responde a prompts como un asistente.

## Casos de uso

- Material didactico para entender el ciclo de entrenamiento de un modelo de lenguaje: los 25 checkpoints publicados (del paso 0 al 24 000) permiten observar la evolucion del modelo paso a paso y estudiar fenomenos como el sobreajuste.
- Reproduccion de experimentos en hardware modesto: sirve como referencia para replicar un entrenamiento completo en CPU de movil o en equipos de bajos recursos siguiendo el tutorial del autor.
- Estudio de tokenizacion a nivel de caracter: el modelo permite comparar el comportamiento de un vocabulario de caracteres frente a tokenizadores BPE en corpus pequenos.
- Docencia sobre metricas de validacion: las puntuaciones por checkpoint en `results/scores.csv` permiten practicar la interpretacion de perdida de validacion y la deteccion de sobreajuste.
- Demostracion de entrenamiento sin conectividad: el modo avion y la ausencia de nube lo convierten en un ejemplo de entrenamiento completamente local y reproducible.
- Verificacion de integridad de artefactos: el fichero `hashes.csv` con SHA-256 de cada checkpoint permite practicar la validacion de artefactos de modelos.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K). La unica metrica reportada es la perdida de validacion sobre el 10 % reservado de Tiny Shakespeare, calculada sobre todas las ventanas del split.

| Paso | 16 000 | 17 000 | 18 000 | 19 000 | 20 000 | 24 000 |
|---|---:|---:|---:|---:|---:|---:|
| Horas transcurridas | 7,2 | 7,6 | 8,1 | 8,5 | 9,0 | 10,75 |
| Perdida de validacion | 1,4782 | 1,4744 | **1,4663** | 1,4748 | 1,4785 | 1,4817 |

El objetivo fijado de antemano era alcanzar o bajar de 1,4697 (mejor perdida del README de nanoGPT) en dos checkpoints consecutivos. El modelo no lo logro: la mejor puntuacion fue 1,4663 en un unico checkpoint, y los dos consecutivos mas cercanos fueron 1,4744 y 1,4663. El autor senala que la comparacion no es equivalente: nanoGPT usa una A100, 10,65 M de parametros, contexto de 256 y unos 3 minutos de entrenamiento, frente a 2 nucleos de CPU, 1,21 M de parametros, contexto de 128 y 10 h 45 min. La subida de la perdida entre los pasos 18 000 y 24 000 (0,0154) sugiere sobreajuste, aunque no se verifico con otra ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo ocupa unos 5 MB por checkpoint y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no aplica; el modelo no requiere GPU y el autor lo ejecuta en CPU.
- Cabe en cualquier GPU de consumo y en practicamente cualquier CPU moderna; tambien en el propio movil donde se entreno.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere los programas en C del repositorio de GitHub (`phone_sample.c`) y un compilador Zig para construir el binario.
- Latencia y throughput: no se publican cifras de inferencia; el entrenamiento se ejecuto a unos 1,5 segundos por paso en dos nucleos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perdida de validacion | Hardware de entrenamiento | Licencia | Formato |
|---|---:|---:|---:|---|---|---|
| PhoneGPT | 1,21 M | 128 caracteres | 1,4663 (mejor checkpoint) | 2 nucleos CPU (Exynos 9825) | MIT | `.bin` propio |
| nanoGPT (referencia del README) | 10,65 M | 256 caracteres | 1,4697 (mejor de sus checkpoints) | 1 GPU A100 | MIT | `.pt` (PyTorch) |
| GPT-2 small (referencia general) | 124 M | 1024 tokens | No disponible en esta ficha | GPU | MIT | safetensors, GGUF |

La comparacion con nanoGPT no es equivalente en hardware, parametros ni contexto, tal como advierte el propio autor. GPT-2 small se incluye solo como referencia de escala; no comparte corpus ni metodologia con PhoneGPT.

## Limitaciones y advertencias

- El modelo no tiene uso practico: lee y escribe caracteres sueltos, conoce un unico texto pequeno y sus palabras y frases a menudo carecen de sentido.
- No alcanzo el objetivo de perdida fijado de antemano (1,4697 en dos checkpoints consecutivos); se quedo a 0,0047.
- La mejor puntuacion (1,4663) es la mejor de 24 mediciones sobre el mismo texto, lo que favorece ligeramente al modelo.
- Indicios de sobreajuste entre los pasos 18 000 y 24 000 (la perdida subio 0,0154), no verificado con una segunda ejecucion.
- Se trata de una unica ejecucion en un unico telefono; no hay garantia de reproducibilidad exacta mas alla de la semilla documentada.
- No esta ajustado por instrucciones ni alineado; puede producir texto incoherente o sin sentido sin aviso.
- Solo soporta ingles y a nivel de caracter; no generaliza a otros idiomas ni a otros dominios.
- Las metricas de `results/live_log.txt` y de las cabeceras de `results/live_samples.txt` son comprobaciones rapidas sobre una muestra pequena y leen mas bajo que las puntuaciones de `results/scores.csv`; para comparar debe usarse este ultimo.
- Licencia MIT: permite uso comercial, pero el modelo carece de calidad suficiente para produccion.
- El nombre PhoneGPT no tiene relacion con la aplicacion de IA offline para iPhone del mismo nombre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/udgamlabs/PhoneGPT
- Articulo y tutorial del autor: https://udgamlabs.com/blog/phonegpt
- Codigo en GitHub: https://github.com/udgamlabs/phonegpt
- Grabacion del directo: https://www.youtube.com/watch?v=gXQFqCBB91U
- Corpus Tiny Shakespeare: https://github.com/karpathy/char-rnn
- nanoGPT (referencia de comparacion): https://github.com/karpathy/nanoGPT
- llm.c (base del entrenador): https://github.com/karpathy/llm.c
- Zig (compilador necesario): https://ziglang.org/download/
- Sitio de Udgam Labs: https://udgamlabs.com
