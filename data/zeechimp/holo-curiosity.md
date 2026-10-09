# zeechimp/holo-curiosity

## Resumen

holo-curiosity es un motor de memoria asociativa que genera de forma autónoma preguntas sobre su propio contenido, priorizando aquellas cuya respuesta reduciría en mayor medida la incertidumbre almacenada. No es un modelo de lenguaje ni una red neuronal entrenada: es una implementación de computación hiperdimensional (HDC) y arquitectura vector-simbólica (VSA) escrita en NumPy, de un único fichero y aproximadamente 600 líneas, publicada por el usuario zeechimp bajo licencia Apache 2.0.

El sistema almacena elementos con estructura de roles opcional (por ejemplo, país → capital, continente) y, a partir de ese estado, propone consultas mediante cinco mecanismos independientes: peso bajo, dispersión, hueco de ranura, par inverso e interpolación. Cada candidato se puntúa con una ganancia de información esperada y el conjunto final se trunca con un tope por mecanismo para garantizar diversidad. El bucle es cerrado: las preguntas propuestas se responden, el almacén se actualiza y la siguiente ronda refleja el nuevo estado.

Su relevancia es fundamentalmente investigadora y educativa: sirve como banco de pruebas reproducible para experimentos de aprendizaje activo, generación de preguntas y memoria asociativa sin dependencias externas más allá de NumPy. El módulo no incorpora pesos preentrenados, tokenizador ni pesos en safetensors/GGUF, por lo que su encaje en el ecosistema HuggingFace es el de un artefacto de código con `pipeline_tag: feature-extraction`, no el de un modelo de inferencia convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de memoria asociativa basado en computacion hiperdimensional (HDC) y arquitectura vector-simbolica (VSA); no es un transformer, MoE ni SSM |
| Parametros totales | no disponible (no es un modelo neuronal; usa hipervectores de dimension d=2048) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; almacen de elementos sin limite fijo, acotado por memoria RAM del proceso |
| Tipos de cuantizacion | no aplica (representaciones en coma flotante de NumPy; sin pipeline de cuantizacion) |
| Idiomas soportados | en (documentacion, API y ejemplos); el contenido almacenado es libre |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica; se distribuye como codigo Python (un unico fichero `holo_curiosity.py`) |
| Dimension del hipervector | 2048 (d=2048) |
| Dependencias | numpy (unica dependencia) |
| Pipeline declarado | feature-extraction |
| Metricas declaradas | question-diversity, info-gain-ranking, schema-coverage |

## Arquitectura y entrenamiento

La arquitectura no implica entrenamiento alguno. Se trata de una implementacion de computacion hiperdimensional en la que cada entidad se representa como un vector de dimension 2048 y las relaciones se codifican mediante operaciones de binding y unbinding propias de las arquitecturas vector-simbolicas. La consulta de similitud se resuelve con producto escalar o similitud coseno: en la autoprueba del autor, la similitud de `france` consigo mismo tras el ciclo observar/consultar es de 0,964.

El componente de curiosidad es `CuriosityEngine`, que combina cinco mecanismos generadores de preguntas. `low_weight` detecta elementos cuyo peso esta muy por debajo del maximo y calcula la ganancia como 1 − peso/max. `sparse` identifica elementos sin vecinos cercanos, con dispersion medida como 1 − similitud media al vecino mas proximo. `slot_gap` encuentra roles presentes en otros elementos pero ausentes en uno dado, y solo propone cuando el rol tiene cobertura en dos o mas elementos. `reverse_pair` propone la consulta inversa de menciones unidireccionales, con ganancia 0,4 + 0,4 × similitud. `interpolation` busca elementos intermedios entre pares muy similares y es deliberadamente conservador (umbral de similitud 0,15, sin propuestas por debajo de el).

Los candidatos de los cinco mecanismos se fusionan, se ordenan por ganancia de informacion esperada y se truncan con un tope por mecanismo (`mechanism_cap`, por defecto 3) para evitar que un unico tipo de incertidumbre domine la lista. No se documenta uso de RLHF, DPO ni datos de entrenamiento, ya que no existe fase de entrenamiento.

## Capacidades

- Generacion de preguntas priorizadas por ganancia de informacion esperada, con puntuacion numerica por candidato.
- Almacenamiento asociativo de elementos con estructura de roles clave-valor y pesos opcionales por elemento.
- Consulta directa de similitud entre elementos (`similarity`), recuperacion de pesos (`query`) y busqueda de vecinos mas cercanos (`nearest` con parametro k).
- Deteccion de cinco clases de incertidumbre: peso bajo, dispersion, hueco de ranura, mencion inversa ausente e interpolacion entre elementos similares.
- Control de diversidad de propuestas mediante tope por mecanismo, con comportamiento verificable: cap=2 produce mezcla de mecanismos; cap=6 concentra las seis propuestas en el mecanismo dominante.
- Bucle cerrado de aprendizaje activo: responder una propuesta, actualizar el almacen y regenerar propuestas que reflejen el nuevo estado.
- Ejecucion como script de linea de comandos (`python holo_curiosity.py`, opcionalmente con `--output results/`), que ejecuta seis demostraciones y escribe un fichero JSON de estado.
- API programatica en Python mediante las clases `CuriosityMemory` y `CuriosityEngine`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; no es un modelo generativo de texto.

## Casos de uso

- Aprendizaje activo sobre bases de conocimiento incompletas: dado un grafo de entidades con campos parcialmente rellenos, el motor senala que preguntas formular a un anotador humano para maximizar la cobertura con el minimo numero de consultas, gracias al ranking por ganancia de informacion esperada.
- Auditoria de calidad de datos estructurados: los mecanismos `slot_gap` y `low_weight` permiten detectar de forma automatica entidades con campos ausentes o con peso anómalamente bajo (por ejemplo, `spain` con peso 0,2 frente al maximo de 1,0) antes de publicar un conjunto de datos.
- Construccion de asistentes de entrevista o elicitacion de requisitos: el motor propone preguntas de seguimiento que cubren huecos de informacion en lugar de repetir topicos, usando el tope por mecanismo para diversificar los temas.
- Prototipado de sistemas de recomendacion de exploracion: el mecanismo `interpolation` identifica pares de elementos muy similares y propone busqueda de terminos intermedios, util para descubrir items puente en catalogos.
- Investigacion en computacion hiperdimensional y VSA: sirve como referencia reproducible de bajo coste para comparar estrategias de binding/unbinding y metricas de curiosidad sin entrenar redes neuronales.
- Docencia de aprendizaje activo y teoria de la informacion: al ejecutarse solo con NumPy y en un unico fichero, permite a estudiantes inspeccionar y modificar cada mecanismo y observar el efecto en la ganancia esperada.
- Deteccion de menciones unidireccionales en grafos sociales o de citas: `reverse_pair` propone explicitamente consultas del tipo "¿que dice B sobre A?" cuando A menciona a B pero no al contrario, util para completar relaciones asimetricas.
- Enriquecimiento iterativo de ontologias: el bucle cerrado permite ejecutar rondas sucesivas de propuesta-respuesta-actualizacion, con verificacion de que los huecos resueltos desaparecen de las propuestas siguientes (en el ejemplo del autor, tras rellenar el continente de `germany` la ronda 2 pasa a proponer pares inversos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. El autor si documenta autopruebas internas a D=2048, que se reproducen a continuacion tal como aparecen en la model card.

| Autoprueba | Resultado |
|---|---|
| Identidad bind/unbind | PASS |
| observe + query (similitud de france consigo mismo = 0,964) | PASS |
| slot-gap detecta germany | PASS |

Propuestas basicas sobre un almacen de cinco paises con cobertura parcial de campos, con `mechanism_cap=3`:

| Rango | Ganancia | Mecanismo | Consulta |
|---|---|---|---|
| 1 | 0,900 | sparse | what relates to germany? |
| 2 | 0,900 | sparse | what relates to spain? |
| 3 | 0,891 | sparse | what relates to japan? |
| 4 | 0,800 | low_weight | tell me more about spain |
| 5 | 0,540 | slot_gap | what is germany's continent? |
| 6 | 0,540 | slot_gap | what is spain's continent? |

Comportamiento de cada mecanismo en aislamiento:

| Mecanismo | Comportamiento documentado |
|---|---|
| low_weight | Pesos 1,0 / 0,9 / 0,2 / 0,05; solo los dos mas bajos generan propuestas; ganancia = 1 − peso/max |
| sparse | Ocho elementos sin vecinos cercanos; los ocho proponen con ganancia ~0,89; dispersion = 1 − similitud media al vecino mas proximo |
| slot_gap | Cuatro elementos con `capital`; `continent` solo en el primero; dos sin `continent` y uno sin `continent` ni `currency`; solo los huecos con cobertura >= 2 generan propuestas |
| reverse_pair | Cinco elementos con menciones por pares; propone la inversa de cada mencion unidireccional; ganancia = 0,4 + 0,4 × similitud |
| interpolation | Cuatro elementos dispersos, ningun par supera el umbral de similitud de 0,15; cero propuestas |

Restriccion de diversidad sobre el mismo almacen: con cap=2 la salida reparte 2 propuestas de `low_weight`, 2 de `sparse` y 2 de `slot_gap`; con cap=6 se concentran las seis en `low_weight`.

Bucle cerrado: la ronda 1 incluye `slot_gap: what is germany's continent?` en el rango 4; tras responder con `mem.observe("germany", continent="europe")` la ronda 2 pasa a incluir `reverse_pair`. La model card se interrumpe en ese punto, por lo que no se dispone del detalle completo del ciclo.

## Requisitos de hardware

- VRAM: no aplica. No usa GPU ni aceleradores; toda la computacion es NumPy sobre CPU.
- GPU recomendadas: ninguna. El modelo funciona en CPU convencional.
- Compatibilidad con GPU de consumo: irrelevante, ya que no hay inferencia neuronal ni pesos que cargar; puede ejecutarse en cualquier maquina con Python y NumPy.
- Memoria principal: dependiente del numero de elementos almacenados y de la dimension d=2048; con d=2048 y float64 cada hipervector ocupa aproximadamente 16 KB, mas las estructuras auxiliares de roles y pesos.
- Opciones de despliegue: importacion directa como modulo Python (`from holo_curiosity import CuriosityMemory, CuriosityEngine`) o ejecucion como script de linea de comandos. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningun servidor de inferencia.
- Latencia y throughput: no disponibles de forma cuantitativa en la informacion proporcionada. Al operar sobre vectores de 2048 dimensiones en NumPy, las operaciones son de coste lineal respecto al numero de elementos, sin fase de decodificacion autoregresiva.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. holo-curiosity no pertenece a la categoria de modelos de lenguaje, por lo que no existen comparaciones directas con LLM. Conceptualmente se situa en la familia de librerias de computacion hiperdimensional y arquitecturas vector-simbolicas (por ejemplo, implementaciones tipo torchhd), pero no se ha proporcionado informacion verificable sobre parametros, contexto, rendimiento o licencia de esas alternativas, por lo que la comparativa se marca como no disponible.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no mantiene dialogos y no puede usarse para tareas de generacion, traduccion o resumen.
- No existe fase de entrenamiento ni pesos preentrenados; el comportamiento depende exclusivamente de los elementos que el usuario introduce en el almacen y de los hipervectores generados de forma determinista o aleatoria segun implementacion.
- Los resultados publicados son autopruebas del autor sobre almacenes muy pequenos (cinco a ocho elementos). No hay evidencia de comportamiento a escala ni de robustez con miles o millones de elementos.
- El mecanismo `interpolation` es conservador por diseno: con el umbral de similitud de 0,15 puede no producir ninguna propuesta, lo que reduce la diversidad efectiva en almacenes dispersos.
- El tope por mecanismo (`mechanism_cap`) introduce una dependencia fuerte del parametro: valores altos eliminan la diversidad de propuestas, como muestra el caso cap=6 que concentra todas las propuestas en `low_weight`.
- La ganancia de informacion esperada se calcula con heuristicas internas (por ejemplo, 1 − peso/max o 0,4 + 0,4 × similitud), no con una estimacion probabilistica calibrada; los valores no deben interpretarse como informacion mutua real.
- Solo se declara el idioma ingles para documentacion y ejemplos. El contenido almacenado no esta restringido por idioma, pero las etiquetas y consultas generadas se construyen por concatenacion de plantillas en ingles.
- No se documentan sesgos, riesgo de alucinacion en el sentido de los LLM ni comportamientos emergentes, dado que no hay generacion neuronal.
- Riesgo de conclusiones erroneas si se trata como sustituto de un LLM en pipelines de produccion: su funcion es proponer preguntas sobre un almacen, no responderlas. La respuesta la aporta el llamante.
- La licencia Apache 2.0 permite uso comercial, pero al no existir modelo entrenado ni garantias de rendimiento, su valor en produccion depende enteramente de la integracion que haga el usuario.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo ni sobre su dominio; los enlaces devueltos corresponden a contenido no relacionado y se descartan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeechimp/holo-curiosity
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a papers asociados, repositorios, blogs ni demos. El resto de resultados devueltos por la busqueda no guarda relacion con el modelo y no se incluye.
