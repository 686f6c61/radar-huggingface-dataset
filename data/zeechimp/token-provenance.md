# zeechimp/token-provenance

## Resumen

`token-provenance` no es un modelo de lenguaje, sino una libreria Python de instrumentacion para el recuento de tokens. Su tesis central es que todo recuento de tokens debe llevar adjunta la codificacion que lo produjo (tokenizador, plantilla de chat, numero de tokens especiales y version), de modo que la metrica no se pueda confundir con un entero anonimo. El autor es el usuario de HuggingFace `zeechimp` y el paquete se publica bajo licencia Apache 2.0. El problema que ataca es concreto: presupuestar prompts con heuristicas tipo `len(text) // 4`, que producen cifras plausibles pero incorrectas, se propagan a estimaciones de coste y provocan truncamientos silenciosos en el servidor.

El ejemplo que documenta el propio autor es ilustrativo: un prompt presupuestado con `len(text) // 4 = 44` tokens, servido con una plantilla ChatML que anade 11 tokens especiales y tokenizado con BPE real en 43 tokens para el cuerpo, da un total real de 54. Bajo la heuristica el prompt "cabe"; bajo la codificacion real no cabe y el servidor lo trunca sin avisar. La libreria convierte ese fallo silencioso en un error explicito mediante un tipo `TCount` que transporta metadatos de codificacion y un conjunto de seis mecanismos de defensa escalables.

Es relevante ahora porque la mayoria de pipelines de inferencia mezclan heuristicas de longitud, plantillas de chat especificas de cada modelo y tokenizadores reales sin trazabilidad. La libreria es puramente stdlib, sin dependencias, y esta orientada a ejecucion en CPU, lo que la hace trivial de integrar en sistemas de coste, control de contexto y deteccion de anomalias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; es una libreria Python (stdlib puro, sin dependencias) de instrumentacion de tokenizacion |
| Parametros totales | No aplica (no es un modelo de ML) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica; la utilidad incluye la funcion `safe_context_budget(model_max, encoding, reserve_for_output)` para calcular presupuestos de contexto |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (idioma declarado en los metadatos y en la documentacion); el codigo es agnostico al idioma del texto que se tokeniza |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (se distribuye como codigo Python, instalable via `pip install token-provenance` o ejecutable con `python token_provenance.py`) |

## Arquitectura y entrenamiento

No existe entrenamiento ni red neuronal alguna. El artefacto es un modulo Python organizado en torno a un tipo de dato, `TCount`, que envuelve el valor entero del recuento junto con un objeto `Encoding` con los campos `tokenizer`, `template`, `special_tokens`, `exact` y `version`. El campo `exact` distingue explicitamente entre recuentos obtenidos de un tokenizador real (`True`) y heuristicas como `len // 4` (`False`). Las operaciones aritmeticas (`+`, `-`, `*`, `//`) propagan la codificacion, de forma que la "mancha" de inexactitud viaja con el resultado; para lotes existe `TArray`, que preserva el estado mixto en operaciones elemento a elemento y fusiona la procedencia en reducciones como `sum()`.

La innovacion tecnica no es algorítmica sino de disciplina de ingenieria: seis niveles de defensa sobre la misma clase de fallo. El nivel 1 etiqueta cada salida con `@tokenizer` para que nunca sea un `int` desnudo; el nivel 2 propaga la mancha mediante aritmetica; el nivel 3 hace que `report()` se niegue a formatear recuentos inexactos o con codificacion no coincidente; el nivel 4 hace que `@serving` lance `ServingMismatchError`; el nivel 5 ofrece `assert_serving()` para fallar en el arranque del pipeline; y el nivel 6 expone `unwrap(allow_inexact=True)` como unica via de escape, exigiendo una aceptacion explicita. Ademas incluye `cross_check()` para comparar varios tokenizadores y heuristicas entre si con una tolerancia relativa, detectando el valor atipico cuando no coinciden.

## Capacidades

- Adjuntar metadatos de codificacion (`tokenizer`, `template`, `special_tokens`, `exact`, `version`) a cada recuento de tokens producido.
- Distinguir de forma explicita entre recuentos exactos procedentes de un tokenizador real y recuentos heuristicos tipo `len // 4`.
- Propagar la procedencia a traves de aritmetica escalar (`+`, `-`, `*`, `//`) sin perder el estado de exactitud.
- Gestionar lotes de recuentos heterogeneos mediante `TArray`, con operaciones elemento a elemento y reducciones que fusionan la procedencia.
- Rechazar el formateo o consumo de recuentos inexactos o procedentes de una codificacion distinta a la esperada (`report()`).
- Lanzar errores explicitos en tiempo de ejecucion sobre codificaciones no coincidentes (`ServingMismatchError` con `@serving`) y en el arranque del pipeline (`AssertionError` con `assert_serving`).
- Calcular presupuestos de contexto seguros descontando el sobrecoste de plantilla con `safe_context_budget()`.
- Contrastar varios tokenizadores y heuristicas con `cross_check()` y localizar el valor atipico con `Mismatch.outlier()`.
- Ejecucion en CPU, sin GPU, en menos de un segundo segun el demo del propio autor.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: no es un modelo generativo.

## Casos de uso

- Estimacion de coste en produccion: envolver el recuento de tokens en `TCount` y consumirlo con una funcion decorada con `@serving` garantiza que la factura se calcula sobre la misma codificacion que usa el servidor, evitando el ejemplo del propio autor en el que 44 tokens heuristicos se convierten en 54 reales.
- Control de ventana de contexto: calcular el presupuesto con `safe_context_budget(4096, SERVING, reserve_for_output=512)`, que devuelve 3573 con plantilla ChatML en lugar de los 3584 de la resta ingenua, para no truncar prompts silenciosamente.
- Deteccion de anomalias en pipelines de datos: usar `cross_check()` con tolerancia relativa para comparar el recuento de GPT-2, el de Llama y una heuristica, y marcar como atipico el valor que se desvia.
- Validacion en arranque de servicio: invocar `assert_serving()` al iniciar el servidor para abortar de inmediato si la codificacion configurada no coincide con la que espera el stack de inferencia.
- Auditoria de plantillas de chat: medir el sobrecoste de tokens especiales de plantillas como Llama 2 (7 tokens) o ChatML (11 tokens) para documentar la diferencia entre el presupuesto nominal y el efectivo.
- Instrumentacion de sistemas de facturacion multiinquilino: mantener la trazabilidad del tokenizador y su version por cada recuento, de modo que un cambio de version del tokenizador no pase desapercibido en las estimaciones.
- Educacion y depuracion: ejecutar `python token_provenance.py` para reproducir el demo de once partes que muestra, paso a paso, como una heuristica contamina un pipeline completo y como se corta esa propagacion en cada nivel de defensa.
- Integracion en bibliotecas de calculo cientifico: al ser stdlib puro y sin dependencias, puede incorporarse como capa de validacion en herramientas de computacion cientifica que ya trabajan con recuentos de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de aprendizaje automatico (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, porque el artefacto no es un modelo de lenguaje. El autor documenta en su lugar la salida del demo integrado (`python token_provenance.py`), que se reproduce a continuacion como referencia de comportamiento:

| Parte | Concepto | Resultado |
|---|---|---|
| 0 | Pipeline ingenuo | Imprime `36` sin ninguna advertencia |
| 1 | `TCount` | Porta `exact=False`, tokenizer=`heuristic:chars//4` |
| 2 | Propagacion de mancha | `(naive + 100) * 2 = 272`, sigue siendo inexacto |
| 3 | `report()` | Rechaza lo inexacto; formatea lo exacto como `54 [toy-bpe+chatml(+11)]` |
| 4 | `@serving` | Lanza error con la heuristica y con llama2; acepta chatml |
| 5 | Via de escape | `.unwrap(allow_inexact=True) = 36`; `.unwrap()` lanza error |
| 6 | Ruta exacta | `54` con `tokenizer=toy-bpe`, `special_tokens=11` |
| 7 | `assert_serving` | Falla con llama2 y con la heuristica; devuelve `54` en crudo con chatml |
| 8 | `TArray` | Lote mixto 3/4 exactos, `sum=72`; lote exacto `sum=95` |
| 9 | Presupuesto adaptativo | `none=3584`, `llama2=3577`, `chatml=3573` |
| 10 | `cross_check` | A=lote mixto `TCount`, B/C=`Mismatch`, D=`TCount` limpio |
| 11 | Disciplina | El conjunto de reglas, en un solo lugar |

Tiempo total de ejecucion del demo: menos de un segundo en la CPU de un portatil, segun el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: ninguna; la libreria es stdlib puro y no ejecuta operaciones en GPU.
- GPU recomendadas: ninguna. La ejecucion esta pensada para CPU.
- Compatibilidad con GPU de consumo: irrelevante, no aplica.
- Opciones de despliegue: cualquier interprete de Python capaz de ejecutar el modulo, bien mediante `pip install token-provenance` o bien ejecutando `python token_provenance.py` directamente. No hay integracion documentada con vLLM, llama.cpp, Ollama o TGI, ya que no sirve pesos de modelo.
- Latencia y throughput: el autor indica un tiempo total de ejecucion del demo inferior a un segundo en la CPU de un portatil; no se publican cifras de latencia ni de throughput por operacion.

## Comparativa con modelos similares

No disponible en sentido estricto. `token-provenance` no compite con modelos de lenguaje ni con tokenizadores, sino que se situa por encima de ellos como capa de trazabilidad. La comparacion directa con artefactos de la misma categoria (bibliotecas de tokenizacion como las de HuggingFace o tiktoken) no puede hacerse con los datos proporcionados, porque la informacion disponible no incluye mediciones frente a esas alternativas.

| Criterio | token-provenance | Alternativas de tokenizacion (p. ej. bibliotecas de tokenizadores) |
|---|---|---|
| Categoria | Capa de procedencia y validacion sobre recuentos | Tokenizadores y contadores directos |
| Parametros | No aplica | No disponible |
| Contexto | No aplica (utilidad de calculo de presupuesto) | No disponible |
| Rendimiento | Demo completo en menos de 1 s en CPU | No disponible |
| Licencia | Apache 2.0 | No disponible |
| Disponibilidad | HuggingFace (`zeechimp/token-provenance`) | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace codigo y no soporta tool calling, agentes ni multimodalidad.
- El propio README advierte de que la unica via para consumir un recuento inexacto es `unwrap(allow_inexact=True)`, lo que introduce un riesgo si los equipos abusan de esa via de escape y anulan las defensas.
- La deteccion de discrepancias depende de que el usuario configure correctamente el objeto `Encoding`: si se declara un tokenizador o una version incorrectos, las comprobaciones de coincidencia no detectaran el problema real.
- El idioma declarado en los metadatos es unicamente el ingles; la documentacion y los mensajes estan en ese idioma.
- El proyecto tiene 0 descargas y 1 like en el momento de la consulta, con creacion y ultima actualizacion el 1 de octubre de 2026 separadas por pocos minutos: es un artefacto muy reciente y con adopcion nula, sin historial de mantenimiento ni comunidad que lo respalde.
- La model card suministrada aparece truncada al final de la seccion de plantillas y presupuesto de contexto, por lo que puede existir documentacion adicional no recogida aqui.
- No se documentan resultados frente a benchmarks de referencia ni comparaciones cuantitativas con alternativas, lo que impide validar su comportamiento mas alla del demo incluido.
- La licencia Apache 2.0 permite uso comercial, pero al no existir garantias ni mantenimiento declarado, su integracion en produccion queda bajo responsabilidad del adoptante.

## Enlaces

- HuggingFace: https://huggingface.co/zeechimp/token-provenance
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) asociados a este artefacto.
