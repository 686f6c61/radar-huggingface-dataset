# VR-VLA/VR-egoverse-v06-pretrained-moe-rtc-lr1e4-bs64-60k-snapshot

## Resumen

VR-egoverse-v06-pretrained-moe-rtc-lr1e4-bs64-60k-snapshot es un checkpoint de preentrenamiento de un modelo de vision-lenguaje-accion (VLA) desarrollado por VR-VLA para investigacion en robotica. Parte de un backbone congelado Qwen3.5-0.8B al que se anaden adaptadores LoRA de rango 16 y una cabeza de accion de flow matching con atencion cruzada, entrenada sobre video egocentrico humano narrado. Su espacio de accion es de 153 dimensiones por paso temporal (posicion y rotacion de cabeza mas poses y 21 keypoints por mano) y genera fragmentos de 16 pasos a 10 Hz.

Esta variante concreta combina dos innovaciones: una cabeza de accion con mezcla de expertos dispersa (16 expertos enrutados, top-4, mas uno compartido) y chunking en tiempo real (predictor de observacion, anclaje de prefijo y perdida de flujo solo en el postfijo). El checkpoint contiene 2186 tensores y 597M de parametros.

Es relevante ahora como material de investigacion, no como producto: se trata de un snapshot intermedio del paso 60.000 de un schedule coseno de 100.000 pasos, con la tasa de aprendizaje en 3,46e-05 (aproximadamente el 35% del pico). El propio autor advierte que no es una politica desplegable, que no puede gobernar un robot directamente y que requiere un finetune sobre el espacio de accion de la encarnacion objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone transformer congelado (Qwen3.5-0.8B) + adaptadores LoRA r=16 + cabeza de accion de flow matching con 24 bloques de atencion cruzada (hidden 1024) y FFN en MoE disperso |
| Parametros totales | 597M de parametros en el checkpoint (2186 tensores), mas el backbone congelado Qwen3.5-0.8B |
| Parametros activos | MoE de 16 expertos enrutados (top-4) + 1 compartido en la FFN de la cabeza de accion; numero de parametros activos: no disponible |
| Longitud de contexto | no disponible (los fragmentos de accion son de 16 pasos a 10 Hz, es decir, 1,6 s de horizonte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other / egoverse-internal (derivada de EgoVerse y Qwen3.5-0.8B; no otorga derechos mas alla de esas condiciones) |
| Formato de pesos | checkpoint PyTorch (library_name: pytorch); no se indica safetensors ni GGUF |
| Tamano del repositorio | 7,2 GB |
| Espacio de accion | 153 dimensiones: head_d_pos (3), head_d_rot 6d (6), mano izquierda pos_cam (3) + rot_cam 6d (6) + kp21 (63), mano derecha idem (72) |
| Paso del entrenamiento | 60.000 de 100.000 (snapshot intermedio) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA de dos modulos. El primero es un backbone de lenguaje y vision congelado, Qwen3.5-0.8B, al que se acoplan adaptadores LoRA de rango 16. El segundo es una cabeza de accion de flow matching compuesta por 24 bloques de atencion cruzada con dimension oculta 1024, condicionada por timestep mediante adaRMS y con un sampler Euler de 10 pasos. La FFN de esa cabeza es un MoE disperso con 16 expertos enrutados (top-4) y un experto compartido, con balanceo sin perdida adicional y router z-loss de 1e-3. La variante incorpora ademas ejecucion asincrona: un predictor de observacion que desplaza las caracteristicas visuales al instante de ejecucion, anclaje de prefijo, randomizacion del retardo por ventana y calculo de la perdida de flujo solo sobre el postfijo.

Los datos de entrenamiento proceden de EgoVerse v06: 35.000 clips egocentricos narrados que generan aproximadamente 1,16M de ventanas de entrenamiento con fragmentos de accion de 16 pasos a 10 Hz. La narracion es supervision de texto destilada de un modelo de vision-lenguaje de mayor tamano, de modo que el checkpoint hereda los modos de fallo de ese profesor. El entrenamiento usa dos objetivos simultaneos, uno de lenguaje sobre la narracion y otro de flow matching sobre los fragmentos de accion, mas un MSE contra los estados ocultos de vision en tiempo de ejecucion que solo entrena al predictor de observacion. La configuracion declarada es: tasa de aprendizaje 1e-4 con decaimiento coseno sobre 100.000 pasos y warmup de 100 pasos, batch efectivo 64 (16 x acumulacion 4) en una sola GPU, autocast en bf16 con pesos maestros en fp32.

Las perdidas medias de los 2.500 pasos que terminan en el paso 60.000 son 0,0363 para la accion (flow matching), 0,1613 para la narracion (LM) y 0,6531 para el total (accion + 0,1 x narracion [+ observacion]), con un router z-loss de 0,0054 contabilizado aparte. Son perdidas sobre el conjunto de entrenamiento: no existe evaluacion con datos reservados del objetivo de preentrenamiento.

Sobre el checkpoint base del proyecto: VR-egoverse-v06-pretrained-lr1e4-bs64-60k no es un control apareado de esta variante, porque uso 60.000 pasos con el coseno terminando ahi, warmup de 1500, condicionamiento de timestep aditivo y un sampler de 4 pasos, mientras que este run emplea el recetario actual (100.000 pasos, warmup 100, adaRMS, sampler de 10 pasos). Los valores de perdida no son comparables entre ambos.

## Capacidades

- Generacion de trayectorias de movimiento humano a dos manos: produce fragmentos de 16 pasos a 10 Hz sobre un espacio de accion de 153 dimensiones (cabeza, muneca y 21 keypoints por mano, con rotaciones en representacion 6d de Zhou et al.).
- Percepcion visual egocentrica: consume video en primera persona y lo alinea con la accion mediante la cabeza de atencion cruzada.
- Modelado de lenguaje sobre narracion: el backbone conserva un objetivo de lenguaje sobre las narraciones asociadas al video, aunque los adaptadores LoRA estan entrenados para el objetivo conjunto.
- Ejecucion asincrona: el predictor de observacion desplaza las caracteristicas visuales al instante de ejecucion, con anclaje de prefijo y soporte de retardos aleatorios por ventana.
- Enrutado disperso por expertos: 16 expertos enrutados con activacion top-4 y un experto compartido, con balanceo sin perdida extra.
- No soporta tool calling ni function calling: no hay ninguna indicacion de ello en la informacion disponible.
- No se declaran capacidades de agente, razonamiento multi-paso, codigo, matematicas, audio ni modo de pensamiento.
- Capacidades multilingues: no disponibles (no se especifica el idioma de las narraciones).
- No genera acciones de gripper ni semanticas de manipulador: el espacio de accion es exclusivamente movimiento humano de dos manos.

## Casos de uso

- Inicializacion de politicas roboticas de dos brazos: el uso previsto es servir de punto de partida para un finetune en el que se reemplazan las proyecciones del espacio de accion por las de la encarnacion objetivo y se reutiliza la representacion aprendida. Es el escenario que el propio autor declara como uso previsto.
- Investigacion en representaciones VLA: al estar congelado el backbone Qwen3.5-0.8B y ser entrenables los LoRA y la cabeza, el checkpoint permite estudiar que informacion visual y linguistica se transfiere a la prediccion de accion sin reentrenar el modelo de lenguaje.
- Estudio de cabezas de accion con MoE: la configuracion de 16 expertos enrutados con top-4 y experto compartido permite medir el efecto del enrutado disperso frente a una cabeza densa en tareas de prediccion de movimiento continuo, usando las perdidas declaradas como referencia del paso 60.000.
- Investigacion sobre chunking en tiempo real: el mecanismo de predictor de observacion, anclaje de prefijo y perdida solo en el postfijo es directamente reutilizable para experimentos sobre desfase entre observacion y ejecucion en control a 10 Hz.
- Prediccion de movimiento humano en video egocentrico: el modelo puede emplearse como extractor y predictor de poses de cabeza y manos en primera persona, util en analisis de actividad, interfaces de captura de movimiento o generacion de avatares, siempre con un finetune sobre el espacio de accion deseado.
- Generacion de narraciones sobre video egocentrico: el objetivo de lenguaje sobre las narraciones permite evaluar la calidad del etiquetado textual en clips en primera persona, aunque la supervision de partida esta destilada de un modelo profesor de mayor tamano.
- Reproducibilidad de recetas de entrenamiento: al publicarse junto al checkpoint base y declararse explicitamente las diferencias de schedule, warmup, condicionamiento y sampler, sirve para auditar como afectan esos cambios a las curvas de perdida en un entrenamiento de una sola GPU.
- Punto de partida para evaluar transferencia downstream: cualquier finetune que parta de este snapshot puede compararse contra el que parte del checkpoint base para caracterizar el efecto de la cabeza MoE y del chunking en tiempo real.

En todos los casos, el checkpoint no es desplegable directamente ni ha sido evaluado como politica autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay evaluacion con datos reservados del objetivo de preentrenamiento y el autor indica explicitamente que la transferencia downstream de esta variante no esta caracterizada: ningun finetune derivado de ella ha sido evaluado.

Como unica referencia cuantitativa, la model card publica las perdidas medias de entrenamiento de los 2.500 pasos que terminan en el paso 60.000:

| Metrica | Valor |
|---|---|
| Accion (flow matching) | 0,0363 |
| Narracion (LM) | 0,1613 |
| Total (accion + 0,1 x narracion [+ observacion]) | 0,6531 |
| Router z-loss (fuera del total) | 0,0054 |

Estas cifras no son comparables con las del checkpoint base del proyecto, porque las recetas de entrenamiento difieren en numero de pasos, warmup, condicionamiento de timestep y sampler.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmetica a partir del recuento de parametros declarado (597M del checkpoint mas el backbone Qwen3.5-0.8B, en torno a 1,4B en total), los pesos en bf16 ocuparian aproximadamente 2,8 GB y en fp32 unos 5,6 GB; a esa cifra hay que sumar activaciones del codificador visual y de los 24 bloques de atencion cruzada, cuyo coste no se detalla.
- El repositorio ocupa 7,2 GB en disco, por encima del tamano de los pesos en bf16, lo que sugiere material adicional no especificado en la informacion disponible.
- GPU empleada en el entrenamiento: una sola GPU con autocast en bf16 y pesos maestros en fp32, batch efectivo 64 (16 x acumulacion 4). No se indica el modelo de GPU.
- Encaje en GPU de consumo: no disponible. No se publican requisitos minimos ni se confirma el funcionamiento en tarjetas tipo RTX 4090. El finetune sobre video con batch efectivo 64 y pesos maestros en fp32 probablemente exige GPUs de 40-80 GB (A100, H100), pero esto es una estimacion, no un dato publicado.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Al no ser un modelo de generacion de texto puro y usar una cabeza de accion personalizada, requiere codigo PyTorch propio; el checkpoint no incluye pesos GGUF ni cuantizados.
- Latencia y throughput: no publicados. Los unicos datos de diseno son la frecuencia de control de 10 Hz, el horizonte de 16 pasos (1,6 s) y el sampler Euler de 10 pasos de la cabeza de flow matching, junto con el mecanismo de ejecucion asincrona pensado para ocultar el retardo entre observacion y ejecucion. No hay mediciones de tiempo real.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el checkpoint base del mismo proyecto. No se aportan datos de otros modelos VLA comparables.

| Modelo | Parametros | Pasos de entrenamiento | Schedule y warmup | Condicionamiento de timestep | Sampler | Estado |
|---|---|---|---|---|---|---|
| VR-egoverse-v06-pretrained-moe-rtc-lr1e4-bs64-60k (este) | 597M en el checkpoint, mas backbone Qwen3.5-0.8B congelado | 60.000 de 100.000 | Coseno sobre 100.000 pasos, warmup 100 | adaRMS | Euler de 10 pasos | Snapshot intermedio, tasa de aprendizaje en 3,46e-05 |
| VR-egoverse-v06-pretrained-lr1e4-bs64-60k (base del proyecto) | no disponible | 60.000 | Coseno terminando en 60.000, warmup 1500 | Aditivo | 4 pasos | Run completado; no es un control apareado de este checkpoint |

Ademas, este checkpoint usa MoE con 16 expertos enrutados (top-4) mas uno compartido y ejecucion asincrona con chunking en tiempo real, caracteristicas que el checkpoint base no incorpora. El autor indica que un control plano apareado con la receta actual se esta entrenando por separado.

## Limitaciones y advertencias

- Snapshot intermedio: es el paso 60.000 de un schedule de 100.000, con la tasa de aprendizaje aun en 3,46e-05 (aproximadamente el 35% del pico). No es el producto de un entrenamiento completado y le falta la fase de decaimiento final. El run continua mas alla de este punto.
- No desplegable: es un checkpoint de preentrenamiento, no una politica. No puede gobernar un robot directamente y necesita un finetune sobre el espacio de accion de la encarnacion objetivo.
- Espacio de accion humano: 153 dimensiones de movimiento humano a dos manos, sin semantica de gripper ni de manipulador. No tiene acciones de robot.
- Fuente unica de datos: entrenado solo con video egocentrico; no ha visto datos de robot.
- Calidad de la supervision textual: la narracion esta destilada de un modelo profesor de mayor tamano y hereda sus modos de fallo, incluidos posibles sesgos y errores de etiquetado del profesor.
- Perdidas de entrenamiento, no de validacion: los valores publicados se calculan sobre el conjunto de entrenamiento y no existe evaluacion con datos reservados del objetivo de preentrenamiento.
- Transferencia downstream no caracterizada: no se ha evaluado ningun finetune derivado de este checkpoint, por lo que no hay evidencia de su utilidad final.
- Perdida de observacion: es un MSE no normalizado contra estados ocultos que los LoRA, aun en entrenamiento, siguen modificando, de modo que su valor bruto sube durante el entrenamiento sin que ello implique regresion. Medido en ventanas fijas en el paso 50.000, el error del predictor fue 0,77 de la energia objetivo frente a 0,99 sin desplazamiento, es decir, elimina aproximadamente el 22% de la diferencia.
- Normalizacion obligatoria: el archivo action_norm_egoverse.json es necesario. Todos los objetivos estan en espacio normalizado y el checkpoint carece de sentido sin esas estadisticas.
- Licencia: licencia other con nombre egoverse-internal. Deriva de EgoVerse (interno, sujeto a los terminos del conjunto de datos) y de Qwen3.5-0.8B. El usuario debe cumplir ambas condiciones y este checkpoint no concede derechos adicionales. No se autoriza explicitamente un uso comercial general.
- Idiomas y sesgos concretos: no disponibles en la informacion proporcionada; no se especifica el idioma de las narraciones ni se documenta una evaluacion de sesgos.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya reportado resultados reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VR-VLA/VR-egoverse-v06-pretrained-moe-rtc-lr1e4-bs64-60k-snapshot
- Conjunto de datos EgoVerse v06 (anotaciones): https://huggingface.co/datasets/VR-VLA/VR-egoverse-annotation-curated-v6.0
- Checkpoint base del proyecto: https://huggingface.co/VR-VLA/VR-egoverse-v06-pretrained-lr1e4-bs64-60k
- Modelo base del backbone: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (portales de cascos y actualidad de realidad virtual), por lo que no aportan enlaces utiles. No se han localizado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
