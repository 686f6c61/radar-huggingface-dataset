# zeechimp/holo-narrative

## Resumen

holo-narrative es una biblioteca de un solo archivo, escrita en Python sobre NumPy, que implementa una memoria asociativa ordenada para secuencias de eventos, cronologias y cadenas narrativas mediante vectores hiperdimensionales. No es una red neuronal ni un modelo de lenguaje: no hay pesos entrenados, no hay gradientes y no se depende de ningun modelo externo. El autor es zeechimp (Sylv Q), que mantiene otras publicaciones de computacion hiperdimensional en HuggingFace.

El problema que resuelve es concreto: almacenar y recorrer secuencias ordenadas sin recurrir a un transformer ni a una base de datos de grafos. La clave tecnica es el binding dirigido (`bind_dir`), un desplazamiento en el dominio de la FFT aplicado al segundo operando, que es no conmutativo. Con binding simetrico, la arista inversa compite con la directa y una cadena acaba rebotando entre dos estados (0 -> 1 -> 2 -> 3 -> 2 -> 3...), sin alcanzar nunca el final; el binding dirigido elimina ese fallo manteniendo dos trazas, `S_next` y `S_prev`.

Cada operacion es O(D), con D configurable (4096 por defecto). El proyecto se declara educativo y de investigacion, con licencia Apache-2.0, idioma etiquetado en ingles y pipeline `feature-extraction`. En el momento de redactar esta ficha acumula 0 descargas y 1 "like", por lo que no existe validacion independiente de la comunidad. La publicacion esta fechada en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer ni una red neuronal: memoria asociativa sobre vectores hiperdimensionales (vector-symbolic architecture) con binding dirigido en dominio frecuencial (FFT) y operaciones de unbinding |
| Parametros totales | no aplica: no hay pesos entrenados. El unico parametro configurable es la dimension del vector, D (4096 por defecto; en los resultados tambien se usa D=8192) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens. Capacidad de cadena: limite entre N=100 y N=200 eventos por cadena al 90 % o mas de acierto, tanto con D=4096 como con D=8192 |
| Tipos de cuantizacion | no disponible; no aplica. Las operaciones se realizan en punto flotante con NumPy |
| Idiomas soportados | en (idioma declarado en los metadatos). Las etiquetas de los eventos son cadenas de texto arbitrarias que el usuario define |
| Licencia | apache-2.0 |
| Formato de pesos | no hay pesos. El estado se serializa con `save_json` (JSON) y las visualizaciones con `plot` (PNG) |

## Arquitectura y entrenamiento

La biblioteca mantiene dos trazas dirigidas construidas por suma de bindings: `S_next = sum_i bind_dir(event_i, event_{i+1})` y `S_prev = sum_i bind_dir(event_{i+1}, event_i)`. `bind_dir` se implementa como un roll en el dominio de la FFT del segundo operando, de modo que `bind_dir(a, b) != bind_dir(b, a)`. Dado un evento, el store devuelve su sucesor o su precesor mediante unbinding; las consultas encadenadas recorren la secuencia hacia delante o hacia atras. Varias cadenas pueden compartir un unico store sin interferirse, como demuestra el ejemplo de dos tramas de 8 eventos con 14 aristas totales, donde el sucesor del ultimo evento de la cadena de alice devuelve `none` en lugar de saltar a la cadena de bob.

No existe entrenamiento, ajuste fino, RLHF ni DPO. El comportamiento depende exclusivamente de la codificacion de los eventos y de la dimension D. La verificacion interna `cos(unbind_dir(a, bind_dir(a, b)), b)` devuelve 1.000000, es decir, recuperacion exacta en el caso de una sola arista. La innovacion destacable frente a esquemas de binding simetrico es precisamente la no conmutatividad, que evita que la arista inversa compita con la directa durante el recorrido.

## Capacidades

- Recuperacion del sucesor y del precesor de un evento dado dentro de una cadena ordenada.
- Recorrido encadenado hacia delante y hacia atras (`walk_forward` y equivalente inverso), con parada limpia en los extremos: los eventos frontera devuelven `none` en la direccion inexistente.
- Cadenas multiples en un mismo store sin contaminacion cruzada entre tramas.
- Recuperacion de ancla con ruido (fuzzy anchor retrieval): con niveles de ruido de 0.1, 0.3, 0.5 y 0.8 recupera correctamente el ancla `step_050` con similitudes de 0.9975, 0.9768, 0.9284 y 0.8040 respectivamente, y el recorrido posterior continua sin error.
- Deteccion y modelado de huecos: al eliminar la arista `c -> d`, la consulta `next of c` devuelve `none` mientras el resto de aristas y la direccion inversa permanecen intactas.
- Consultas de cronologia en posiciones interiores y en los limites de la secuencia.
- Interpolacion entre eventos adyacentes: la consulta `alpha * e[5] + (1 - alpha) * e[6]` produce una mezcla de los sucesores de ambos origenes.
- Interfaz de linea de comandos que ejecuta doce demostraciones y escribe los resultados en un directorio (`python holo_narrative.py --output results/`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni soporte de agentes multi-paso. No es un modelo de lenguaje.

## Casos de uso

- Memoria de eventos para agentes conversacionales: registrar la secuencia de acciones o turnos de una sesion y consultar cual fue el evento anterior o posterior a uno dado, usando D=4096 en CPU y sin depender de un modelo generativo.
- Modelado de tramas en videojuegos y narrativa interactiva: mantener varias lineas argumentales en un unico store y recorrer cada una de forma independiente, evitando el cruce entre personajes.
- Analisis de trazas y logs secuenciales: almacenar la cronologia de eventos de un sistema y localizar sucesores y precesores para reconstruir el orden de ejecucion, aprovechando que las operaciones son O(D).
- Deteccion de discontinuidades en pipelines: el comportamiento ante huecos identifica de forma inequivoca donde falta una transicion (`next of c` devuelve `none`) sin devolver resultados parciales enganosos.
- Recuperacion de anclas con datos ruidosos: util para series de sensores o eventos mal etiquetados, ya que tolera ruido de hasta 0.8 manteniendo la similitud por encima de 0.80 con el ancla correcta.
- Sistemas multiusuario con memorias separadas: particionar las secuencias por usuario en un mismo store y aprovechar la ausencia de cross-talk entre cadenas.
- Docencia e investigacion en computacion hiperdimensional: el repositorio esta marcado como `educational` y `research`, e incluye demostraciones reproducibles con metricas declaradas (`retrieval-accuracy`, `chain-length`, `hop-exactness`).
- Baseline para comparar arquitecturas de memoria asociativa: sirve como referencia determinista y sin entrenamiento frente a bases de datos vectoriales o memorias basadas en atencion.

## Benchmarks y rendimiento

Los resultados proceden de la model card, en ejecuciones estandar con D=4096 salvo donde se indique. La metrica principal es la exactitud de recuperacion en el recorrido de cadenas.

| Prueba | Resultado |
|---|---|
| Self-test `cos(unbind_dir(a, bind_dir(a, b)), b)` | 1.000000 (exacto) |
| Recuperacion de cadena de 25 eventos | 25/25 exactos |
| Recorrido bidireccional de 10 eventos | 10/10 en ambas direcciones |
| Dos tramas de 8 eventos en un store (14 aristas) | Sin cruce entre cadenas; sucesor final = `none` |
| Multi-hop exactness (D=8192, cadena de 100 eventos, 4 origenes x 20 saltos) | 80/80 saltos exactos |

Recuperacion de ancla con ruido (ancla correcta: `step_050`):

| Nivel de ruido | Recuperado | Similitud |
|---|---|---|
| 0.1 | step_050 | 0.9975 |
| 0.3 | step_050 | 0.9768 |
| 0.5 | step_050 | 0.9284 |
| 0.8 | step_050 | 0.8040 |

Techo de capacidad de cadena (fraccion de recorridos completos con 90 % o mas de acierto):

| D | N=50 | N=100 | N=200 | N=500 |
|---|---|---|---|---|
| 4096 | 1.000 | 1.000 | 0.160 | 0.002 |
| 8192 | 1.000 | 1.000 | 0.145 | 0.006 |

El autor atribuye el techo a que cada evento participa en dos aristas, lo que duplica aproximadamente la interferencia por evento respecto a un almacenamiento plano de items; duplicar D no eleva de forma sustancial el limite.

Comportamiento ante huecos (arista `c -> d` eliminada):

| Consulta | Resultado |
|---|---|
| next of `b` | `c` |
| next of `c` | none |
| next of `d` | `e` |
| next of `e` | `f` |
| prev of `e` | `d` (direccion inversa intacta) |

Interpolacion entre eventos adyacentes (`q = alpha * e[5] + (1 - alpha) * e[6]`):

| alpha | Recuperado | sim_e6 | sim_e7 |
|---|---|---|---|
| 0.00 | e7 | 0.0041 | 0.3360 |
| 0.25 | e7 | 0.0529 | 0.3218 |
| 0.50 | e7 | 0.2146 | 0.2046 |
| 0.75 | e7 | 0.3276 | 0.0435 |
| 1.00 | e4 | 0.3345 | 0.0141 |

No se han documentado datasets de evaluacion (`datasets: []` en los metadatos) ni comparaciones con otros sistemas en la informacion disponible.

## Requisitos de hardware

- VRAM: 0 GB. La biblioteca funciona en CPU y no requiere GPU.
- GPU recomendadas: no aplica. No se documenta ningun backend de aceleracion.
- Huella de memoria estimada: con D=4096 en punto flotante de 64 bits, cada vector ocupa unos 32 KB; las dos trazas (`S_next` y `S_prev`) suman aproximadamente 64 KB, mas el vector correspondiente a cada evento almacenado. El consumo es despreciable en cualquier equipo actual.
- Cabe en GPU de consumo: no aplica, no hay componente GPU.
- Opciones de despliegue: instalacion directa con `pip install numpy` (y `pip install matplotlib` opcional para graficos); ejecucion como modulo Python (`from holo_narrative import NarrativeMemory`) o como script de linea de comandos (`python holo_narrative.py --output results/`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos ni modelo generativo.
- Latencia y throughput: no disponible de forma numerica. Cada operacion de binding o unbinding es O(D) e incluye una transformada de Fourier sobre el segundo operando; el coste crece linealmente con D y con el numero de aristas almacenadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de sistemas comparables en la informacion proporcionada. La tabla siguiente recoge unicamente lo que puede afirmarse con la informacion disponible.

| Sistema | Tipo | Parametros | Contexto o capacidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeechimp/holo-narrative | Memoria asociativa hiperdimensional (NumPy) | no aplica (D configurable, 4096 por defecto) | ~100 eventos por cadena con >=90 % de acierto | apache-2.0 | HuggingFace, cumplimiento `feature-extraction` |
| zeechimp/hv-intent | Clasificacion de intenciones con computacion hiperdimensional, CPU-only, few-shot | no disponible | no disponible | Apache-2.0 | HuggingFace (mismo autor) |
| zeechimp/hv-multimodal-audio-text-v1 | Clasificacion de audio | no disponible | no disponible | no disponible | HuggingFace (mismo autor) |
| Bases de datos vectoriales con indice ANN (HNSW, IVF) | Recuperacion por similitud, no ordenada | no aplica | Limitada por memoria del indice | Variable | Amplia disponibilidad |

La diferencia funcional relevante frente a una base vectorial convencional no es la similitud, sino la recuperacion de orden: holo-narrative devuelve explicitamente el sucesor o el precesor de un evento dentro de una cadena, algo que un indice ANN no ofrece de forma nativa. No se han publicado comparativas de rendimiento entre ambos enfoques en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling ni agentes multi-paso. Cualquier uso en ese sentido es un error de categoria.
- Techo de cadena bajo: el recorrido completo con 90 % o mas de acierto solo se mantiene hasta N=100 eventos; con N=200 cae a 0.160 (D=4096) y 0.145 (D=8192). Duplicar la dimension no resuelve el problema.
- La interferencia crece porque cada evento participa en dos aristas (sucesor y precesor), lo que limita la escalabilidad frente a un almacenamiento plano de items.
- La calidad depende por completo de la codificacion de los eventos, que no viene impuesta por la biblioteca ni se documenta un metodo de referencia.
- Riesgo de alucinacion en el sentido de recuperacion incorrecta: fuera del rango de capacidad, el recorrido puede devolver un evento equivocado en lugar de `none`.
- Ante un hueco, la consulta devuelve `none` sin recuperacion parcial; es un comportamiento limpio pero exige gestionar explicitamente las discontinuidades en la capa de aplicacion.
- En la prueba de interpolacion, con `alpha=1.00` el resultado esperado seria `e6`, pero la lectura devuelve `e4` porque `e6` esta excluido del argmax; conviene revisar ese comportamiento antes de depender de la interpolacion.
- Idiomas: los metadatos declaran unicamente `en`; no hay procesamiento linguistico real, pero no se documenta soporte ni validacion en otros idiomas.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; al no haber pesos, no aplican restricciones de redistribucion de modelos derivados.
- Madurez muy baja: 0 descargas y 1 "like" en el momento de redactar la ficha. Esta etiquetado como `educational` y `research`, no como listo para produccion.
- No se han documentado datasets de evaluacion (`datasets: []`), por lo que los resultados de la model card no son reproducibles a partir de datos publicados por el autor.
- Las fechas de creacion y actualizacion publicadas son de octubre de 2026 y ambas distan apenas dos minutos, de modo que no hay historial de mantenimiento observable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeechimp/holo-narrative
- Perfil del autor en HuggingFace: https://huggingface.co/zeechimp
- Listado de modelos del autor: https://huggingface.co/zeechimp/models
- hv-intent (mismo autor, computacion hiperdimensional): https://free2aitools.com/model/zeechimp/zee
- hv-multimodal-audio-text-v1 (mismo autor, citado en la busqueda): https://huggingface.co/zeechimp/hv-multimodal-audio-text-v1
- Hilo sobre RPG con narrativa dinamica mediante LLM (contexto de aplicacion, no vinculado al autor): https://community.openai.com/t/building-a-real-time-ai-rpg-with-evolving-narratives-using-llms/1379208
- Referencia general sobre la familia GLM citada en la busqueda (no relacionada con este proyecto): https://en.wikipedia.org/wiki/GLM_(AI)
