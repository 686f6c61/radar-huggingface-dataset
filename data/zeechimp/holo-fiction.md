# zeechimp/holo-fiction

## Resumen

holo-fiction es una memoria asociativa para computacion hiperdimensional publicada por el autor zeechimp (Sylv Q) en Hugging Face. No es un modelo de lenguaje ni una red neuronal entrenada: es un sustrato de almacenamiento y recuperacion en el que hechos y ficciones se guardan con las mismas primitivas vectoriales y se distinguen unicamente por metadatos. Cada elemento almacenado lleva dos etiquetas ortogonales: un *modal* (estado epistemico: hecho, hipotesis, ficcion, contrafactual o cualquier categoria registrada por el usuario) y un *world* (el contexto al que pertenece el elemento, "real" por defecto).

La motivacion declarada son tres casos: el cambio de modo de conocimiento al estilo DeepSeek (separar ciencia establecida, conocimiento de frontera y especulacion), la memoria de un lector de novelas (que es verdad dentro del mundo de una obra frente a los hechos del mundo real) y el razonamiento contrafactual ("que pasaria si X fuese un hecho en lugar de ficcion"). El artefacto se distribuye como un unico archivo Python de aproximadamente 600 lineas que solo depende de NumPy, con licencia Apache 2.0 y pipeline declarado de *feature-extraction*.

Su relevancia es acotada y experimental: propone un esquema de etiquetado epistemico reutilizable en sistemas de memoria para RAG y agentes, pero el repositorio tiene 0 descargas y 1 like, no incluye pesos entrenados, no declara dataset y no aporta comparaciones contra memorias vectoriales convencionales. Es material de investigacion y uso educativo, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memoria asociativa hiperdimensional (vector-symbolic architecture / hyperdimensional computing) implementada sobre NumPy; no es un transformer ni un SSM |
| Parametros totales | No aplicable: no hay pesos entrenados. El sustrato son vectores de dimension configurable (d=2048 por defecto) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable: no existe ventana de contexto; la recuperacion se hace por consulta de etiqueta con filtros de modal y world |
| Tipos de cuantizacion | No aplicable: no hay pesos que cuantizar |
| Idiomas soportados | Ingles (en), unico idioma declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplicable: no se distribuyen pesos. Se distribuye codigo Python (un solo archivo, ~600 lineas) y el estado se persiste en JSON |
| Dimension del vector (d) | 2048 (valor por defecto del constructor) |
| Umbral de decision (threshold) | 0.05 (valor por defecto, usado en todos los resultados publicados) |
| Dependencias | NumPy, sin dependencias adicionales |
| Interfaz | CLI (`python holo_fiction.py`) y API Python (clase `FictionalMemory`) |
| Pipeline declarado | feature-extraction |
| Libreria declarada | holo-fiction |
| Fecha de creacion / actualizacion | 2026-10-08 / 2026-10-08 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El sustrato sigue el paradigma de *vector-symbolic architecture* (VSA), tambien conocido como computacion hiperdimensional: los elementos se representan como vectores de alta dimension (d=2048 por defecto) y las operaciones de composicion y recuperacion se apoyan en un par bind/unbind. La prueba interna de identidad bind/unbind pasa, lo que confirma que el mecanismo de asociacion es reversible en el rango configurado. La model card no especifica que operador de binding concreto se utiliza (por ejemplo, convolucion circular, suma por superposicion o permutacion), por lo que ese detalle queda como no disponible.

No hay entrenamiento. El campo `datasets` de la model card esta vacio, no se describe corpus alguno, no hay fases de RLHF, DPO ni ajuste supervisado, y el autor no reporta numero de tokens ni composicion de datos. Lo que si existe es una capa de etiquetado: `register_modal(name, confidence)` permite crear estados epistemicos con un peso de confianza asociado, y `register_world(name)` permite crear contextos. Toda la funcionalidad de analisis (contradicciones, distribucion de modales, resumen de mundo, ficha de personaje, referencias entre mundos, linea temporal, estadisticas) opera sobre esas etiquetas y sobre las trazas vectoriales almacenadas.

Las innovaciones tecnicas que declara el autor son dos. La primera es que ficcion y hecho comparten las mismas primitivas de almacenamiento, de modo que la separacion se resuelve por etiqueta y no por un subsistema distinto. La segunda son las operaciones de cambio de modal (`what_if`, `promote`), que mueven un elemento de una traza a otra sin necesidad de volver a observarlo, tal y como muestra el experimento de promocion de `dark_matter_exists`.

## Capacidades

- Almacenamiento de observaciones con etiqueta, modal, world, peso, fuente y campos arbitrarios mediante `observe(label, modal, world, weight, source, **fields)`.
- Consulta filtrada por modal y/o world, con devolucion de confianza y veredicto (`query`, `query_across_modals`).
- Separacion entre mundos: una consulta en `world="real"` no devuelve elementos almacenados en `world="sherlock"`, y viceversa.
- Cambio de estado epistemico sin re-observacion: `what_if` (simulacion) y `promote` (conversion efectiva de modal).
- Deteccion de contradicciones por conflicto de modal y por conflicto de campo (`contradictions`).
- Analisis agregado: distribucion de modales por etiqueta (`modal_distribution`), resumen de un mundo (`world_summary`), linea temporal (`timeline`).
- Extraccion de fichas de entidad: `character_sheet(name, world)` devuelve los campos asociados a una entidad dentro de un mundo.
- Referencias cruzadas entre mundos: `cross_world_reference(world, reference_world)` localiza elementos de un mundo ficticio que citan etiquetas del mundo real.
- Modos de conocimiento configurables con confianza: el ejemplo de la model card registra `known` (1.0), `frontier` (0.7) y `speculative` (0.4).
- Persistencia y diagnostico: `stats()` y `save_json("state.json")`; el CLI ejecuta diez demostraciones y escribe un archivo JSON de estado.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni generacion de texto. No hay tokenizador ni capacidades multilingues mas alla del ingles declarado.

## Casos de uso

- Memoria de lector de novelas: almacenar los hechos de una obra en `world="sherlock"` mediante `observe` y consultarlos despues con `character_sheet` y `timeline`, manteniendo intactos los hechos del mundo real. Es adecuado porque el modelo separa ambos planos por etiqueta y no por almacen distinto.
- Analisis literario y narratologia: usar `cross_world_reference` para listar que elementos de un mundo ficticio citan etiquetas reales (por ejemplo, `sherlock_holmes city -> london`) y estudiar como una obra ancla su ficcion en geografia o historia reales.
- Razonamiento contrafactual en investigacion: registrar una hipotesis con `weight` parcial y ejecutar `what_if` para ver como cambiaria su recuperacion si pasase a ser un hecho, con la opcion de consolidarla despues con `promote`. Util para comparar escenarios alternativos sin duplicar observaciones.
- Gestion de modos de conocimiento en asistentes tecnicos: registrar `known`, `frontier` y `speculative` con niveles de confianza distintos y consultar por modal, de forma que el asistente pueda responder "esto es ciencia establecida" frente a "esto es especulacion" sin cambiar de modelo.
- Auditoria de bases de conocimiento: emplear `contradictions` para listar conflictos de modal y de campo dentro de un mismo mundo, y `modal_distribution` para detectar etiquetas con trazas dispersas o ambiguas.
- Experimentacion docente en VSA/HDC: el archivo unico, la unica dependencia (NumPy) y el CLI con diez demostraciones permiten reproducir las operaciones bind/unbind, la superposicion y la recuperacion en un aula o en un cuaderno, sin GPU ni descargas de pesos.
- Prototipado de memoria con etiquetado epistemico para pipelines de RAG: usar la clase como capa de anotacion previa o posterior a un recuperador vectorial, de modo que cada fragmento recuperado viaje con su modal y su world y pueda filtrarse en la respuesta final.
- Simulacion de sistemas de creencias en juegos o narrativa interactiva: crear un world por faccion o personaje y consultar que considera verdadero cada uno, con `query_across_modals` para comparar versiones de un mismo suceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos son pruebas internas del propio autor, ejecutadas a D=2048 y threshold=0.05, y no comparan contra sistemas externos.

Autotest:

| Comprobacion | Resultado |
|---|---|
| Identidad bind/unbind | PASS |
| observe + query | PASS (conf=1.000) |
| Ficcion en mundo separado | PASS (conf=0.900) |
| Mundo real no afectado | PASS (conf=−0.014) |

Separacion ficcion / hecho:

| Consulta | world=real | world=sherlock |
|---|---|---|
| water_is_wet | +1.015 | −0.014 |
| sherlock_lives_on_baker_street | +0.005 | +0.907 |

El autor describe la contaminacion cruzada como nivel de ruido.

Modos de conocimiento:

| Consulta | known | frontier | speculative |
|---|---|---|---|
| water_boils_at_100C | +1.016 | −0.003 | +0.006 |
| universe_is_simulation | −0.022 | −0.007 | +0.411 |

Promocion de `dark_matter_exists` almacenado como hipotesis con peso 0.5:

| Momento | fact | hypothesis | fiction |
|---|---|---|---|
| Antes de promover | −0.035 | +0.500 | +0.000 |
| Despues de promover | +0.965 | +0.000 | +0.000 |

Metricas declaradas en la model card: `modal-separation`, `world-separation`, `cross-modal-confidence`. No hay valores agregados publicados para esas metricas mas alla de las tablas anteriores.

## Requisitos de hardware

- No se publican cifras de VRAM, latencia ni throughput en la informacion disponible.
- El diseno es CPU-only y depende unicamente de NumPy, por lo que no requiere GPU en ninguna configuracion.
- Huella de memoria: crece con el numero de elementos y modales almacenados (estimacion propia a partir de d=2048 y float64, cada vector denso ocupa del orden de 16 KB antes de overhead; el autor no publica esta cifra).
- GPU recomendadas: no aplicable. Cualquier CPU capaz de ejecutar Python 3 con NumPy es suficiente.
- Cabe en cualquier equipo de consumo, incluidos portatiles modestos y entornos sin acelerador.
- Opciones de despliegue: ejecucion directa del script (`python holo_fiction.py`) o importacion de `FictionalMemory` en una aplicacion Python. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia, porque no hay pesos que servir.
- Persistencia: el estado se serializa a JSON con `save_json`; no se documenta formato binario, compresion ni versionado del estado.

## Comparativa con modelos similares

La busqueda no ha identificado alternativas de terceros directamente comparables a holo-fiction. Si aparecen otros artefactos del mismo autor construidos sobre el mismo sustrato de computacion hiperdimensional, que se listan a continuacion como referencia de familia.

| Artefacto | Proposito | Sustrato declarado | Licencia | Pipeline |
|---|---|---|---|---|
| zeechimp/holo-fiction | Memoria asociativa con etiquetas de modal y world, ficcion y contrafactuales | Hyperdimensional computing, vector-symbolic architecture, NumPy | Apache 2.0 | feature-extraction |
| zeechimp/hv-hologram-rhythm | Compresion de caracteristicas, reduccion de dimensionalidad, series temporales y audio | Hyperdimensional computing, vector-symbolic architecture, NumPy, low-rank | Apache 2.0 | feature-extraction |
| zeechimp/zee | Clasificacion de intenciones, enrutado de intenciones, few-shot, CPU-only | Hyperdimensional computing, vector-symbolic architecture, tiny models | Apache 2.0 | text-classification |
| zeechimp/hv-multimodal-audio-text-v1 | Clasificacion de audio (multimodal audio-texto) | No disponible en la informacion proporcionada | Apache 2.0 | audio-classification |

No hay datos publicos de rendimiento relativo entre estos artefactos ni comparaciones contra memorias vectoriales convencionales (FAISS, Chroma, Qdrant) o contra bases de conocimiento con anotacion epistemica de terceros.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no acepta prompts en lenguaje natural y no se puede usar como LLM. La etiqueta `feature-extraction` es la declarada por el autor.
- No hay dataset declarado (`datasets: []`), no hay pesos entrenados y no hay proceso de entrenamiento documentado. Toda la calidad depende de como el usuario etiquete las observaciones.
- No existen resultados en benchmarks estandar, ni evaluacion por terceros. Los datos publicados son autotests del propio autor a D=2048 y threshold=0.05.
- Sensibilidad al umbral: todos los resultados usan threshold=0.05 y d=2048. No se documenta el comportamiento con otros valores ni curvas de calibracion, por lo que los margenes de separacion observados podrian no mantenerse al cambiar la configuracion.
- Cobertura idiomatica limitada al ingles en la declaracion del repositorio, aunque el sustrato almacena etiquetas y no texto libre.
- Riesgo de falsos positivos o negativos en la recuperacion cuando dos etiquetas comparten campos o cuando la superposicion vectorial crece con el numero de elementos. No se documenta el limite practico de capacidad de la memoria ni como degrada al aumentar los elementos almacenados.
- El operador de binding no se especifica en la model card, de modo que la reproducibilidad fina depende del codigo fuente y no de una especificacion independiente.
- Riesgo de alucinacion: no aplicable en el sentido habitual, ya que el sistema no genera lenguaje. El riesgo equivalente es recuperar una observacion equivocada o contaminada si el etiquetado de modal o world es incorrecto.
- Sesgos conocidos: no documentados por el autor. La ausencia de datos de entrenamiento y de evaluacion externa impide estimar sesgos sistematicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso de cambios. No hay clausulas adicionales, pero tampoco hay garantia de idoneidad para produccion.
- Validacion externa practicamente nula en el momento de redactar esta ficha: 0 descargas y 1 like, repositorio creado y actualizado el mismo dia.
- Para produccion, conviene tratar el artefacto como prototipo de investigacion: no hay tests automatizados publicados, ni versionado semantico de la API, ni soporte declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeechimp/holo-fiction
- Perfil del autor (zeechimp / Sylv Q): https://huggingface.co/zeechimp
- Listado de modelos del autor: https://huggingface.co/zeechimp/models
- Ficha de zeechimp/zee en free2aitools: https://free2aitools.com/model/zeechimp/zee
- Ficha de zeechimp/hv-hologram-rhythm en free2aitools: https://free2aitools.com/model/zeechimp/hv-hologram-rhythm
- Modelo relacionado del mismo autor: https://huggingface.co/zeechimp/hv-multimodal-audio-text-v1
- Paper, blog tecnico o repositorio independiente: no disponible en la informacion proporcionada
- Demo publica: no disponible en la informacion proporcionada
