# zeechimp/holo-metacognitive

## Resumen

`zeechimp/holo-metacognitive` no es un modelo de lenguaje neuronal, sino un sustrato de memoria asociativa implementado en un unico fichero Python de aproximadamente 700 lineas que solo depende de NumPy. Se apoya en computacion hiperdimensional (hyperdimensional computing) y arquitectura vector-simbolica (VSA) para almacenar vectores de alta dimension (por defecto D=2048) y recuperarlos mediante operaciones de binding/unbinding. Lo desarrolla el usuario zeechimp y se publica bajo licencia Apache 2.0 con fines educativos y de investigacion.

El problema que aborda es la falta de auto-referencia en las herramientas de memoria convencionales: una base de datos vectorial devuelve vecinos, una cache KV devuelve valores y un panel de control muestra el estado, pero ninguno permite consultar ese estado a traves de la misma interfaz que el contenido. Este sustrato unifica tres capas (contenido, procedencia y meta-hechos) bajo una unica primitiva `ask()`, de modo que una consulta por `"apple"`, por `n_items` o por una fuente devuelve resultados heterogeneos por el mismo canal.

Es relevante como pieza de investigacion en memoria asociativa y metacognicion artificial: incorpora verificacion propia (`verify_meta()`), deteccion de anomalias y seguimiento de trayectoria de consultas, todo ello sin dependencias externas ni entrenamiento. Al no ser una red neuronal, carece de pesos, contexto de tokens o cuantizacion en el sentido habitual; esas filas se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Computacion hiperdimensional / arquitectura vector-simbolica (VSA) con memoria asociativa; implementacion en NumPy, sin redes neuronales |
| Parametros totales | no disponible (no es una red neuronal entrenada; no hay pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un transformer; no usa ventana de tokens) |
| Tipos de cuantizacion | no disponible (trabaja en coma flotante NumPy; la magnitud se cuantiza internamente a dos decimales en la introspeccion) |
| Idiomas soportados | en (idioma de la documentacion y las etiquetas de ejemplo) |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica; se distribuye como un unico modulo Python (`holo_metacognitive.py`, ~700 lineas) y persiste estado en JSON (`save_json`) |

Parametros configurables relevantes: dimension del vector `d` (por defecto 2048) y umbral `threshold` (por defecto 0.05).

## Arquitectura y entrenamiento

El sustrato implementa una memoria asociativa basada en vectores de alta dimension construidos con tecnicas de arquitectura vector-simbolica. Cada elemento se almacena como un vector etiquetado con un peso y una fuente, y las operaciones de binding/unbinding permiten recuperar contenido a partir de una consulta. La clase principal es `MetaMemory`, que expone primitivas unificadas: `store()`, `query()`, `ask()`, `sources_of()`, `consensus()`, `trajectory()`, `confidence_trend()`, `verify_meta()`, `anomalies()`, `introspect()`, `health()` y `save_json()`.

No hay entrenamiento en el sentido de aprendizaje por gradiente: no se documenta numero de tokens, composicion de dataset ni fases de RLHF/DPO. La innovacion tecnica destacable es la auto-referencia: el propio estado del sustrato (conteos, magnitudes, tendencias, verificacion) se almacena como meta-hechos consultables con la misma primitiva `ask()` que el contenido, sin una interfaz de reporte separada. La verificacion interna (`verify_meta()`) y la deteccion de anomalias se responden desde el mismo sustrato que contiene los hechos. El auto-test inicial incluye cuatro comprobaciones: identidad bind/unbind, proyeccion directa (raw projection), round-trip de meta-hecho (`n_items = 7`) y decremento del conteo al olvidar (`n_items = 5`), todas con resultado PASS.

## Capacidades

- Almacenamiento de elementos con peso y procedencia (`store("apple", weight=1.0, source="book")`).
- Consulta de contenido con veredicto y confianza: `ask("apple")` devuelve `[item] verdict=YES, conf=+0.988`; un elemento no almacenado devuelve `UNKNOWN`.
- Consulta de meta-hechos por la misma interfaz: `ask("n_items")` devuelve `[meta] n_items = 2.0`; `ask("n_queries")`, `ask("source_book_weight")`, etc.
- Consulta de fuentes: `ask("book")` devuelve `[source] total_weight=1.00`.
- Analisis de procedencia: `sources_of("apple")` devuelve un diccionario de fuentes y pesos; `consensus("apple")` devuelve una puntuacion de consenso y reparto de pesos.
- Trayectoria de consultas: `trajectory("apple")` devuelve el historial de consultas con tick, veredicto y confianza; `confidence_trend(window)` calcula la pendiente de la confianza reciente.
- Verificacion propia: `verify_meta()` devuelve un informe con `n_ok` y `n_checks` (en el ejemplo de la model card, 5/5 comprobaciones superadas).
- Deteccion de anomalias: `anomalies()` devuelve elementos inusuales con tipo (`kind`) y etiqueta (`label`).
- Introspeccion completa: `introspect()` devuelve un diccionario con dimension, magnitud, media de confianza, numero de items, consultas, dudas, fuentes y pesos por fuente.
- Persistencia: `save_json("state.json")` y modo CLI (`python holo_metacognitive.py [--output results/]`) que ejecuta diez demostraciones y escribe un fichero de estado JSON.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, soporte de agentes ni capacidades multilingues; su `pipeline_tag` es `feature-extraction`.

## Casos de uso

- Investigacion en metacognicion artificial: permite estudiar como un sustrato puede responder preguntas sobre su propio estado (conteos, tendencias, confianza) desde la misma interfaz que usa para el contenido, sin canal de reporte separado.
- Prototipado de memoria con trazabilidad de fuentes: en un sistema que fusiona informacion de varias fuentes (por ejemplo, un libro y un testigo), `sources_of()` y `consensus()` permiten auditar que fuente aporta cada peso y con que grado de acuerdo.
- Deteccion de deriva de confianza en pipelines de datos: `confidence_trend()` y `trajectory()` registran la evolucion de la confianza en las consultas y pueden usarse para vigilar secuencias que terminan en veredictos UNKNOWN.
- Sistemas de alerta por anomalias: `anomalies()` identifica elementos inusuales, util para senalar registros atipicos en un conjunto de hechos almacenados.
- Autocomprobacion en entornos sin dependencias: al depender solo de NumPy, puede integrarse en entornos restringidos donde no se permite instalar frameworks de deep learning, y `verify_meta()` sirve como prueba de integridad del estado.
- Docencia y material didactico: el repositorio incluye diez demostraciones reproducibles y un auto-test de cuatro comprobaciones, adecuado para explicar computacion hiperdimensional y arquitectura vector-simbolica con codigo ejecutable.
- Experimentos de memoria asociativa a escala reducida: almacenamiento y recuperacion de pares etiqueta/peso con procedencia para validar variantes de binding/unbinding y umbrales antes de escalar a otros sustratos.

## Benchmarks y rendimiento

La model card no presenta benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje. Los resultados publicados son de auto-test y demostraciones a D=2048 y threshold=0.05.

Auto-test (cuatro comprobaciones previas a las demostraciones, todas PASS):

| Comprobacion | Resultado |
|---|---|
| Identidad bind/unbind | PASS |
| Proyeccion directa (raw projection) | PASS |
| Round-trip de meta-hecho (n_items = 7) | PASS |
| Olvido decrementa el conteo (n_items = 5) | PASS |

Demostracion 2 — resumen de consultas (secuencia `apple, pear, apple, pear, orange`):

| Metrica | Valor |
|---|---|
| n_queries | 5 |
| by_verdict | {'YES': 4, 'UNKNOWN': 1} |
| mean_confidence | 0.710 |
| n_doubt | 1 |
| confidence_trend | -0.299 |

Demostracion 3 — introspeccion:

| Clave | Valor |
|---|---|
| confidence_trend | 0.0 |
| dimension | 2048.0 |
| magnitude | 2.22 |
| mean_confidence | 1.48 |
| n_doubt | 0.0 |
| n_items | 2.0 |
| n_queries | 2.0 |
| n_sources | 2.0 |
| source_book_weight | 2.0 |
| source_witness_weight | 1.0 |
| threshold | 0.05 |

Nota: la model card indica que la dimension se almacena de forma exacta (2048.0), la magnitud se cuantiza a dos decimales y los conteos son exactos. El informe de verificacion propio reporta 5/5 comprobaciones superadas. No hay comparacion con otros modelos en los datos disponibles.

## Requisitos de hardware

- VRAM: no aplica. El sustrato no usa GPU ni aceleracion por hardware; depende unicamente de NumPy sobre CPU.
- GPU recomendadas: ninguna necesaria ni documentada.
- Compatibilidad con GPU de consumo: irrelevante; funciona en cualquier maquina capaz de ejecutar Python y NumPy.
- CPU y RAM: no documentadas de forma explicita. El consumo de memoria crece con la dimension `d` (2048 por defecto) y con el numero de elementos y consultas almacenados.
- Opciones de despliegue: instalacion mediante `pip install numpy` e importacion del modulo `holo_metacognitive`; ejecucion en linea de comandos con `python holo_metacognitive.py` (y `--output results/`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles. No se publican mediciones de rendimiento temporal.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma categoria (sustrato de memoria asociativa hiperdimensional con metacognicion) entre los resultados de busqueda. La alternativa mas cercana del mismo autor es `zeechimp/hv-metacognition`, que es un modelo de regresion tabular y no un sustrato de memoria.

| Modelo | Tipo | Framework | Licencia | Datos relevantes |
|---|---|---|---|---|
| zeechimp/holo-metacognitive | Memoria asociativa VSA/hiperdimensional con metacognicion | NumPy (unico fichero, ~700 lineas) | apache-2.0 | Auto-test 4/4 PASS; verificacion propia 5/5 |
| zeechimp/hv-metacognition | Regresion tabular (metacognicion, extrapolacion de curvas de aprendizaje, early-stopping) | PyTorch | mit | 19 caracteristicas; meta-dataset; cifras principales no disponibles en el extracto |
| Bases de datos vectoriales convencionales (FAISS, Chroma, etc.) | Recuperacion por vecinos mas cercanos sobre embeddings | Varios | Varias | No incluidas en los resultados de busqueda; no se dispone de datos para comparar |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo, no hace matematicas ni procesa vision o audio. Cualquier expectativa de rendimiento tipo LLM es inaplicable.
- No hay datos de sesgo, alucinacion o seguridad porque no hay entrenamiento supervisado sobre corpus; el comportamiento depende de los elementos que el usuario almacene.
- El idioma de la documentacion y los ejemplos es el ingles; no se declara soporte multilingue.
- No se publican mediciones de latencia, throughput ni escalabilidad; el rendimiento a gran volumen de elementos o dimensiones altas no esta documentado.
- La cuantizacion de la magnitud a dos decimales en la introspeccion implica perdida de precision en ese campo concreto; los conteos y la dimension se reportan como exactos.
- Proyecto con 0 descargas y 1 "like" en el momento de la ficha, creado y actualizado el mismo dia (2026-10-08); el soporte, la madurez y el mantenimiento son inciertos.
- Aunque la licencia Apache 2.0 permite uso comercial, el proposito declarado es educativo y de investigacion, y no hay evidencia de uso en produccion.
- Las cifras de la model card (auto-test, demostraciones) proceden del propio autor y no de evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeechimp/holo-metacognitive
- Perfil del autor en Hugging Face: https://huggingface.co/zeechimp
- Modelos del autor: https://huggingface.co/zeechimp/models
- Modelo relacionado (regresion tabular, mismo autor): https://huggingface.co/zeechimp/hv-metacognition
- Modelo relacionado (clasificacion de audio, mismo autor): https://huggingface.co/zeechimp/hv-multimodal-audio-text-v1
