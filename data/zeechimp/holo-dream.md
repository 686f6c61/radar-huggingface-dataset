# zeechimp/holo-dream

## Resumen

holo-dream es un motor de consolidacion de memoria inspirado en el sueno biologico, publicado por el usuario zeechimp (Sylv Q) en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es una implementacion de memoria asociativa holografica basada en computacion hiperdimensional y arquitectura simbolico-vectorial (VSA/HDC), escrita integramente en NumPy en un unico fichero de unas 600 lineas, sin dependencias adicionales. Su funcion es aplicar politicas de consolidacion (decaimiento, repeticion, ensueno, encadenamiento y una politica compuesta) sobre un almacen de items vectoriales, y reportar el estado del almacen antes y despues del ciclo.

El problema que aborda es concreto: un almacen de sustrato holografico acumula items sin limite, de modo que el ruido de fondo de la traza crece aproximadamente como la raiz cuadrada de N y los items debiles dejan de ser recuperables. Las cinco politicas simulan el efecto del sueno para podar items inviables, reforzar los que soportan carga, generar items hibridos que puedan correlacionar con la estructura existente y consolidar contenido ordenado en cadenas. El resultado que el autor destaca es una mejora de 2,6 veces en la discriminacion de una senal debil sobre un fondo ruidoso.

El modelo se etiqueta como feature-extraction y esta pensado para investigacion y fines educativos. No dispone de pesos entrenados, no procesa lenguaje natural de forma generativa y su relevancia actual es conceptual y experimental: sirve como banco de pruebas reproducible de politicas de consolidacion de memoria en sistemas HDC/VSA. Registra 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memoria asociativa holografica sobre computacion hiperdimensional (HDC) y arquitectura simbolico-vectorial (VSA), implementada en NumPy; no es una red neuronal |
| Parametros totales | No aplicable: no existen pesos entrenados. La dimensionalidad del hipervector es d=2048 y es configurable |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable. La capacidad practica la determina el numero de items N almacenados; el ruido de la traza crece como √N |
| Tipos de cuantizacion | No aplicable (no hay pesos). El estado del almacen se serializa a JSON |
| Idiomas soportados | en (documentacion, etiquetas y ejemplos). Las etiquetas almacenadas admiten texto libre en cualquier idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | No hay fichero de pesos. Se distribuye como un unico fichero Python `holo_dream.py` (~600 lineas) y el estado se guarda en JSON |
| Dependencias | NumPy, exclusivamente (`pip install numpy`) |
| Interfaz | API Python (`DreamingMemory`) y linea de comandos (`python holo_dream.py`) |
| Pipeline declarado en Hugging Face | feature-extraction |
| Metricas declaradas | signal-to-noise-ratio, item-retention, hybrid-creation |
| Datasets declarados | Ninguno (`datasets: []`) |
| Parametros por defecto | d=2048, threshold=0.05, prune_threshold=0.02, anchor_quantile=0.8, seed=0 |
| Politicas de sueno disponibles | decay, replay, dream, chain, composite |
| Fecha de publicacion | 2026-10-08 |

## Arquitectura y entrenamiento

La base es un almacen de vectores de alta dimension (hipervectores de d=2048 por defecto) sobre el que se definen las operaciones habituales de VSA: `bind`, `unbind` y normalizacion, verificadas mediante un auto-test que comprueba las identidades de bind/unbind directo, el recuento de items en una instantanea y la reduccion de peso del decaimiento (los cuatro chequeos devuelven PASS). Ademas del almacen plano de items con peso, el motor mantiene cadenas ordenadas de nodos, de forma que una cadena como `["wake", "coffee", "commute", "work", "sleep"]` puede recorrerse con `walk()` antes y despues del ciclo de sueno, lo que permite evaluar si la consolidacion preserva la estructura secuencial.

No hay entrenamiento en el sentido habitual: no se especifican datasets, no hay fases de preentrenamiento, ajuste supervisado, RLHF ni DPO. Se trata de un sistema determinista controlado por semilla (`seed=0`) en el que el comportamiento emerge de las politicas de consolidacion. Cada politica opera sobre una instantanea del sustrato, tiene un numero acotado de ciclos y un parametro de intensidad, y devuelve un objeto `SleepReport` con los cambios observados. La politica de ensueno (`dream`) crea items hibridos como `bind(a, b)` normalizado a partir de pares aleatorios de items existentes, con peso `rate × min(w_a, w_b)`, de modo que los hibridos procedentes de pares fuertes heredan mas peso y la mayoria se poda en ciclos posteriores salvo que correlacionen con la estructura existente. La innovacion destacable es precisamente el enfoque: trasladar mecanismos de consolidacion biologica (poda, repeticion, recombinacion, consolidacion de cadenas) a un sustrato VSA con resultados medibles y reproducibles.

## Capacidades

- Representacion y recuperacion de items etiquetados en un almacen asociativo de hipervectores, con peso por item y umbral de recuperacion configurable.
- Operaciones simbolico-vectoriales: `bind` y `unbind` con identidad verificada por auto-test.
- Almacenamiento y recorrido de cadenas ordenadas de nodos mediante `chain()` y `walk()`.
- Politica de decaimiento (`decay`): decaimiento de peso preservando anclas y poda de items debiles.
- Politica de repeticion (`replay`): refuerzo de items muestreados por peso, con efecto de refuerzo proporcional al peso previo (los items fuertes se refuerzan mas).
- Politica de ensueno (`dream`): creacion de items hibridos a partir de pares de items existentes.
- Politica de encadenamiento (`chain`): refuerzo de aristas en cadenas ponderado por actividad, sin alterar el conjunto de items.
- Politica compuesta (`composite`): mezcla ponderada de las cuatro anteriores.
- Instantaneas e informes: `snapshot()` devuelve `n_items`, `total_weight` y `trace_magnitude`; `sleep()` devuelve un `SleepReport` imprimible; `retrieval_accuracy()` calcula la precision de recuperacion tras el sueno.
- Persistencia del estado en JSON mediante `save_json()`.
- Ejecucion por linea de comandos con salida a un directorio configurable (`--output results/`), que ejecuta ocho demostraciones y escribe un fichero JSON de estado.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni modo de pensamiento.

## Casos de uso

- Investigacion en computacion hiperdimensional: banco de pruebas reproducible para comparar politicas de consolidacion (poda frente a refuerzo frente a recombinacion) midiendo la precision de recuperacion y la magnitud de la traza antes y despues de cada ciclo.
- Docencia y divulgacion de VSA/HDC: el fichero unico de 600 lineas y la unica dependencia (NumPy) permiten que un estudiante lea, ejecute y modifique el sistema completo en una sesion, incluidas las identidades de bind/unbind.
- Prototipado de memoria a largo plazo en agentes: el motor puede actuar como capa de memoria simbolica que poda entradas obsoletas y refuerza las relevantes, reduciendo el crecimiento ilimitado del almacen entre sesiones.
- Estudio del olvido catastrofico en memorias asociativas: los resultados de la politica de decaimiento (caida de recuperacion de 0,967 a 0,389 con intensidad 0,4 y anchor_quantile 0,8) sirven como caso documentado de poda excesiva y como punto de partida para calibrar umbrales.
- Consolidacion de trazas de eventos o registros de actividad: las cadenas ordenadas permiten modelar secuencias de pasos (por ejemplo, un flujo de trabajo) y comprobar con `walk()` si la estructura se mantiene tras el sueno.
- Generacion de candidatos por recombinacion: la politica `dream` puede emplearse para producir combinaciones nuevas de items existentes (17 hibridos en la demostracion) que despues se filtran por correlacion con la estructura previa, un patron util en exploracion de espacios de caracteristicas.
- Serializacion e inspeccion de estado en pipelines de datos: el volcado a JSON facilita integrar el almacen en sistemas mayores que necesiten auditar que items sobreviven a cada ciclo de consolidacion.
- Experimentacion con semillas y parametros: el control por `seed`, `threshold`, `prune_threshold` y `anchor_quantile` permite ejecutar barridos de hiperparametros sobre el mismo estado inicial y comparar resultados de forma determinista.

## Benchmarks y rendimiento

Los unicos datos publicados son las pruebas internas y las demostraciones del autor, ejecutadas a D=2048, threshold=0.05, prune_threshold=0.02 y anchor_quantile=0.8. No hay resultados de MMLU, HumanEval, GSM8K ni similares, porque no es un modelo de lenguaje.

Auto-test:

| Comprobacion | Resultado |
|---|---|
| Identidad bind/unbind | PASS |
| Identidad de bind dirigido | PASS |
| La instantanea cuenta los items | PASS |
| El decaimiento reduce el peso | PASS |

Demostracion 1, linea base (30 items con pesos entre 0,1 y 0,5; una cadena de 8 nodos):

| Metrica | Valor |
|---|---|
| n_items | 30 |
| total_weight | 9,000 |
| mean_weight | 0,300 |
| trace_magnitude | 1,780 |
| n_chains | 1 |
| Recuperacion | 0,967 |

Demostracion 2, politica `decay` (5 ciclos, intensidad 0,4):

| Metrica | Antes | Despues | Delta |
|---|---|---|---|
| n_items | 30 | 18 | −12 |
| total_weight | 9,000 | 3,327 | −5,673 |
| mean_weight | 0,300 | 0,185 | −0,115 |
| trace_magnitude | 1,780 | 1,212 | −0,568 |

Se podan 12 items y la recuperacion cae de 0,967 a 0,389.

Demostracion 3, politica `replay` (10 ciclos, intensidad 0,2):

| Metrica | Antes | Despues | Delta |
|---|---|---|---|
| n_items | 30 | 30 | 0 |
| total_weight | 9,000 | 11,578 | +2,578 |
| mean_weight | 0,300 | 0,386 | +0,086 |
| trace_magnitude | 1,780 | 2,443 | +0,663 |

Demostracion 4, politica `dream` (10 ciclos, intensidad 0,2, partiendo de 20 items):

| Metrica | Antes | Despues | Delta |
|---|---|---|---|
| n_items | 20 | 37 | +17 |
| total_weight | 15,500 | 17,164 | +1,664 |
| mean_weight | 0,775 | 0,464 | −0,311 |
| trace_magnitude | 3,633 | 3,667 | +0,034 |

Resultado principal declarado por el autor: el sueno mejora la discriminacion de una senal debil sobre un fondo ruidoso en 2,6 veces. La informacion disponible sobre la demostracion 5 esta truncada y no permite reproducir sus cifras.

## Requisitos de hardware

- No requiere GPU. La unica dependencia es NumPy y todo el calculo es vectorial sobre arrays de CPU.
- VRAM estimada: no aplicable, 0 GB. No existe fichero de pesos que cargar en memoria de video.
- GPU recomendadas: ninguna. El sistema esta etiquetado por el autor en la linea de modelos tiny/cpu-only de su ecosistema.
- Memoria principal: cada hipervector en precision doble ocupa aproximadamente 16 KB con d=2048; un almacen de N items requiere del orden de N × 16 KB mas la estructura de cadenas, es decir, unos pocos megabytes para decenas o miles de items.
- Cabe en cualquier equipo, incluidas maquinas sin GPU dedicada y entornos de CI con recursos minimos.
- Opciones de despliegue: ejecucion directa del fichero (`python holo_dream.py`), importacion como modulo Python (`from holo_dream import DreamingMemory`) o integracion como componente de una aplicacion mayor. No aplica despliegue mediante vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje con pesos.
- Latencia y throughput: no disponibles de forma agregada. Las demostraciones utilizan entre 5 y 10 ciclos sobre almacenes de 20 a 30 items, cargas de trabajo que en CPU se resuelven en tiempos del orden de la decima de segundo, sin que la model card publique cifras exactas.

## Comparativa con modelos similares

No se dispone de datos tecnicos de modelos directamente comparables en la informacion proporcionada; el autor publica otros elementos de su ecosistema hiperdimensional, pero sin especificaciones publicadas en esta busqueda. La comparacion se limita al ambito declarado.

| Sistema | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeechimp/holo-dream | Motor de consolidacion de memoria HDC/VSA (feature-extraction) | No aplicable (d=2048) | No aplicable (limitado por N y ruido √N) | Apache 2.0 | Hugging Face y repositorio del autor |
| zeechimp/hv-context-v1 | Extraccion de caracteristicas, ecosistema HDC | No disponible | No disponible | No disponible | Hugging Face |
| zeechimp/zee | Clasificacion de texto (router de intenciones, few-shot, cpu-only) | No disponible | No disponible | Apache 2.0 | Hugging Face |
| zeechimp/hv-multimodal-audio-text-v1 | Clasificacion de audio | No disponible | No disponible | No disponible | Hugging Face |
| Bibliotecas VSA/HDC genericas | Frameworks de vectores simbolicos | No aplicable | No aplicable | Diversas | Repositorios publicos (sin comparacion especifica disponible) |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no produce texto, no razona, no escribe codigo y no admite tool calling ni uso como agente conversacional.
- La politica de decaimiento con los parametros publicados es agresiva: con intensidad 0,4 y anchor_quantile 0,8 la recuperacion cae de 0,967 a 0,389 y se pierden 12 de 30 items. El propio autor lo senala como una limitacion real de la configuracion, mitigable con menor intensidad o un anchor_quantile distinto.
- El crecimiento del ruido con el numero de items es estructural: la magnitud de la traza crece como √N, por lo que la recuperacion se degrada a medida que el almacen crece si no se aplican ciclos de consolidacion.
- La politica `dream` genera hibridos cuyo valor no esta garantizado: el autor indica que la mayoria se poda en ciclos posteriores y que solo sobreviven los que correlacionan con la estructura existente.
- Los hibridos se construyen a partir de pares aleatorios de items existentes, de modo que la calidad del resultado depende de la composicion previa del almacen y de la semilla empleada.
- El idioma declarado es unicamente ingles para documentacion, etiquetas y ejemplos; no hay evaluacion multilingue ni garantia de comportamiento con etiquetas o contenidos en otros idiomas.
- No hay datos publicados sobre sesgos, tasa de alucinacion ni evaluacion externa. El sistema es determinista y no genera texto, por lo que el riesgo de alucinacion en el sentido habitual no aplica; el riesgo equivalente es la recuperacion de items incorrectos por interferencia entre trazas.
- La licencia Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia; no se declaran restricciones adicionales ni clausulas de uso aceptable especificas.
- El proyecto se autodefine como educativo y de investigacion, con 0 descargas registradas, una sola interaccion y un unico mantenedor: la madurez y el soporte a largo plazo no estan garantizados.
- La model card esta truncada en la demostracion 5, por lo que parte de los resultados declarados no puede verificarse con la informacion disponible.
- No existe versionado de pesos ni ficheros de modelo; cualquier cambio en el codigo altera el comportamiento sin trazabilidad de versiones en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeechimp/holo-dream
- Perfil del autor en Hugging Face: https://huggingface.co/zeechimp
- Listado de modelos del autor: https://huggingface.co/zeechimp/models
- Ficha de zeechimp/hv-context-v1 (ecosistema del mismo autor): https://huggingface.co/zeechimp/hv-context-v1
- Ficha de zeechimp/hv-multimodal-audio-text-v1 (ecosistema del mismo autor): https://huggingface.co/zeechimp/hv-multimodal-audio-text-v1
- Ficha de zeechimp/zee en un directorio de terceros: https://free2aitools.com/model/zeechimp/zee
- HoloDream (sitio de personajes de IA; sin relacion verificada con este modelo): https://holodream.ai/characters
- Hey Dream AI (herramienta de generacion de imagen y video; sin relacion verificada con este modelo): https://heydream.im/
