# zeechimp/hv-tail

## Resumen

`hv-tail` es un detector de "techo de calibracion" (above-ceiling detector) publicado por el usuario zeechimp en HuggingFace bajo licencia Apache 2.0. No es una red neuronal: es un clasificador heuristico de texto implementado en Python (etiquetado como `numpy` en la libreria, aunque la propia model card indica que no tiene dependencias y usa solo la stdlib de Python 3.9+). Su funcion es estimar si la consulta de un usuario se situa por encima del techo de capacidad calibrada de un LLM para ese tipo de pregunta, es decir, si el usuario esta operando por encima de la media sobre la que se calibran los modelos actuales.

El modelo calcula una puntuacion cruda a partir de ocho senales linguisticas ponderadas (framing, precision, undecidability, meta, negative, constraint, dialect y requery), normalizadas sobre un factor constante de 3.0. A diferencia de otros detectores del Hub que devuelven unicamente un numero, `hv-tail` devuelve ademas una recomendacion accionable: `proceed`, `ask`, `reframe` o `refuse`, segun el valor obtenido.

Es relevante en el contexto de evaluacion de LLM y diseno de sistemas con "modos cognitivos", porque propone tratar la deteccion del tail de la distribucion de usuarios como una capa previa al propio modelo generativo. Cuenta con 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el 30 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador heuristico basado en reglas y ponderacion de senales (no es una red neuronal) |
| Parametros totales | 0 (no contiene pesos entrenados; logica determinista en Python) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana fija; el metodo `score` acepta un parametro `history` con consultas previas |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; se distribuye como codigo Python (`hv_tail.py`, clase `HVTail`) |

## Arquitectura y entrenamiento

La "arquitectura" es un pipeline de extraccion de caracteristicas sobre la consulta de texto seguido de una suma ponderada. Cada una de las ocho senales devuelve un valor en el rango `[0, 1]` y se multiplica por un peso fijo: undecidability (1.8), meta (1.8), requery (1.8), precision (1.2), negative (1.1), framing (1.0), constraint (0.7) y dialect (0.5). La puntuacion cruda se calcula como `raw_score = min(1.0, sum(signal_i * weight_i) / 3.0)`, donde `NORMALIZER = 3.0` implica que tres senales fuertes ponderadas saturan el resultado, siguiendo una interpretacion de tipo "noisy-OR" en la que senales debiles independientes multiplican su evidencia. La senal `requery` se activa a partir del historial de conversacion, lo que introduce dependencia del contexto previo sin necesidad de un mecanismo de atencion.

No hay entrenamiento en el sentido habitual: no se ha ajustado ningun modelo con gradientes. Lo que existe es un metodo `calibrate()` que acepta listas de ejemplos etiquetados como `above_examples` y `below_examples` y ajusta los umbrales de decision a la poblacion del usuario. La model card describe dos regimenes de calibracion: separacion limpia (los umbrales se situan en el hueco entre los dos conglomerados con un margen proporcional) y solapamiento (los umbrales maximizan TPR - FPR para above y TNR - FNR para below). No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de RLHF o DPO, porque no aplican.

## Capacidades

- Deteccion de consultas por encima del techo calibrado del modelo, mediante puntuacion en `[0, 1]`.
- Clasificacion de la consulta en cuatro acciones: `proceed` (raw_score <= 0.20), `ask` (0.20 < raw_score < 0.55), `reframe` (0.55 <= raw_score < 0.85) y `refuse` (raw_score >= 0.85).
- Analisis de ocho senales linguisticas diferenciadas: encuadre alternativo, precision formal, indecidibilidad, meta-razonamiento, negacion del estandar, multiples restricciones simultaneas, registro dialectal no estandar y reformulacion repetida.
- Uso de historial conversacional para detectar refinamientos sucesivos sobre un mismo tema a traves de la senal `requery`.
- Explicabilidad: el metodo `explain()` devuelve el desglose de la decision, lo que permite auditar que senales han disparado el veredicto.
- Calibracion por poblacion mediante ejemplos etiquetados propios.
- Interfaz de linea de comandos con opciones `--query`, `--explain`, `--history`, `--json`, y modo de demos sin argumentos.
- No ofrece generacion de texto, codigo, matematicas, vision ni audio: es exclusivamente un clasificador de entrada.

## Casos de uso

- Enrutado previo a un LLM en produccion: antes de enviar la consulta al modelo generativo, `hv-tail` decide si conviene responder directamente, pedir aclaracion, ofrecer varios marcos o rechazar; esto reduce respuestas seguras pero incorrectas en preguntas ambiguas.
- Guardarrailes en asistentes tecnicos: integrar el detector en el backend para que las consultas con alta senal de `undecidability` o `meta` no se resuelvan con una respuesta estandar y se derive a un flujo de "no lo se" o a revision humana.
- Analisis de calidad de prompts en pipelines de evaluacion de LLM: puntuar lotes de consultas para caracterizar si el trafico real se situa en la media o en el tail, y ajustar la estrategia de evaluacion en consecuencia.
- Monitorizacion de sesiones conversacionales: usando el parametro `history`, detectar usuarios que refinan repetidamente una misma pregunta (senal `requery`) y que probablemente necesiten otro nivel de soporte o documentacion.
- Filtrado previo en sistemas RAG: clasificar la consulta antes de la recuperacion para decidir si el sistema debe buscar fuentes adicionales o admitir que la pregunta excede el ambito cubierto.
- Investigacion en calibracion y modos cognitivos: servir como referencia reproducible para estudiar la diferencia entre usuarios medios y usuarios en el tail de la distribucion, dado que la logica es determinista y auditable.
- Formacion y analisis de patrones de consulta: explicar con `explain()` por que un tipo de pregunta se considera problematica, util para equipos de producto que disenan prompts o guias de uso.

## Benchmarks y rendimiento

No se han publicado resultados sobre suites de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye tres casos de ejemplo que funcionan como verificacion de comportamiento, no como evaluacion comparativa:

| Caso | Consulta (resumen) | raw_score | above_ceiling | Recomendacion |
|---|---|---|---|---|
| Usuario medio | "what is a black hole" | 0.000 | False | proceed |
| Usuario en el tail | Consulta con encuadre en teoria de categorias, precision formal e indecidibilidad | 1.000 | True | refuse |
| Fronterizo | "explain this in the style of a Feynman diagram but not the standard textbook version" | 0.303 | False | ask |

En el caso tail se activan framing (0.33), precision (0.50), undecidability (1.00) y negative (0.50), saturando la puntuacion. En el caso fronterizo solo disparan framing (0.33) y negative (0.50). El texto de la model card se interrumpe en la descripcion del tercer caso, por lo que no se dispone del analisis completo de ese ejemplo.

## Requisitos de hardware

- VRAM estimada: 0 GB. No hay pesos ni tensores; el modelo se ejecuta como codigo Python interpretado.
- GPU recomendadas: ninguna. El tag `cpu` de la model card confirma que esta disenado para ejecucion en CPU.
- Compatibilidad con GPU de consumo: irrelevante, no requiere acelerador.
- Opciones de despliegue: ejecucion directa con Python 3.9 o superior; uso como modulo (`from hv_tail import HVTail`) o como CLI (`python hv_tail.py`). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir.
- Latencia y throughput: no se publican cifras. Al ser un calculo de sumas ponderadas sobre reglas, la latencia esperada es de orden de microsegundos a pocos milisegundos por consulta en CPU, aunque este dato no esta confirmado en la documentacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no referencia otros detectores de "above-ceiling" ni modelos comparables en el Hub. La model card afirma de forma explicita que "cada detector previo en el Hub devuelve un numero" y que este devuelve ademas una decision, pero no nombra alternativas concretas ni ofrece cifras comparativas que permitan construir una tabla fiable.

## Limitaciones y advertencias

- Al ser un sistema de reglas y pesos fijos, no aprende representaciones semanticas: la deteccion depende de patrones lexicos y de notacion que pueden no generalizar a parafrasis no contempladas.
- Los pesos y umbrales por defecto no estan validados en la informacion disponible con conjuntos de datos publicos, por lo que su comportamiento en dominios distintos a los ejemplos mostrados es incierto.
- Riesgo de falsos positivos en textos con vocabulario tecnico o notacion formal que no impliquen realmente una consulta por encima del techo del modelo.
- Riesgo de falsos negativos en consultas conceptualmente complejas formuladas con lenguaje coloquial, ya que las senales son fundamentalmente superficiales.
- Idiomas soportados: no disponible. Los ejemplos de la model card estan en ingles y las senales descritas ("in the language of X", "from the perspective of Y") parecen disenadas para ese idioma, sin que se documente cobertura multilingue.
- La seccion de benchmarks de la model card es un conjunto de ejemplos ilustrativos, no una evaluacion estandarizada; no debe interpretarse como evidencia de rendimiento cuantitativo.
- El texto de la model card esta truncado, por lo que parte de la documentacion (incluido el analisis del caso fronterizo) no esta disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia; no se documentan restricciones adicionales de uso.
- Advertencia para produccion: el modelo fue creado y actualizado el mismo dia, con 0 descargas, por lo que no existe historial de uso ni validacion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/zeechimp/hv-tail

La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces recuperados corresponden a alojamientos turisticos en Cilaos (La Reunion) y no guardan relacion con `hv-tail`. No se dispone de paper, blog, repositorio ni demo adicional.
