# zeechimp/holo-silence

## Resumen

holo-silence es un sustrato de memoria asociativa implementado en un unico fichero de Python de aproximadamente 600 lineas, publicado por el usuario zeechimp bajo licencia Apache 2.0. No es un modelo de lenguaje ni una red neuronal entrenada: es una implementacion de computacion hiperdimensional (HDC) y arquitectura vector-simbolica (VSA) construida exclusivamente sobre NumPy, cuyo proposito es modelar la perdida de informacion sin causa identificable. Cada elemento almacenado desaparece en intervalos aleatorios gobernados por un ensayo de Bernoulli, y el sustrato registra que el elemento existio y cuando se perdio, pero no por que.

Su aportacion conceptual es la consulta de tres estados. Frente a los sistemas de memoria habituales, que colapsan "nunca se almaceno" y "se almaceno y ya no esta", holo-silence distingue de forma explicita entre `PRESENT`, `GONE` y `UNKNOWN`. La distincion se materializa mediante lapidas (tombstones) que conservan la etiqueta, el instante de observacion, el instante de perdida y la vida util del elemento, pero no su contenido vectorial: el elemento esta irrecuperablemente perdido.

El proyecto esta etiquetado como educational y research, con pipeline declarado feature-extraction, y se orienta a la simulacion de procesos de olvido, duelo y aceptacion en sistemas de memoria artificial. Su relevancia es acotada y experimental: no compite con modelos generativos ni con bases de datos vectoriales, sino que ofrece un banco de pruebas reproducible para estudiar politicas de olvido y su representacion contable. El repositorio acumula 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector-symbolic architecture (VSA) / hyperdimensional computing con memoria asociativa; implementacion en NumPy, sin redes neuronales |
| Parametros totales | no aplicable (no hay pesos entrenados; aproximadamente 600 lineas de codigo en un unico fichero) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no hay ventana de atencion; el estado es un conjunto de hipervectores de dimension d configurable, por defecto d=2048) |
| Tipos de cuantizacion | no aplicable (vectores NumPy en memoria; no se documenta dtype ni cuantizacion) |
| Idiomas soportados | en (idioma de la documentacion y de las etiquetas de ejemplo; el codigo no depende del idioma de la etiqueta) |
| Licencia | apache-2.0 |
| Formato de pesos | no aplicable; se distribuye como script Python (`holo_silence.py`) y exporta el estado a JSON mediante `save_json(path)` |
| Autor | zeechimp |
| Pipeline declarado | feature-extraction |
| Libreria | holo-silence |
| Dependencias | numpy (unica dependencia declarada) |
| Dimension por defecto (d) | 2048 |
| Tasa de perdida por defecto | 0.005 (los resultados de la model card usan 0.02 y 0.005 segun el experimento) |
| Umbral por defecto | 0.05 |
| Semilla | seed=0 (reproducible) |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creacion (metadatos) | 2026-10-08 |

## Arquitectura y entrenamiento

El sustrato sigue el paradigma de computacion hiperdimensional: los elementos se representan como vectores de alta dimension (d=2048 por defecto) y la memoria se construye mediante operaciones de binding y unbinding, cuya identidad se verifica en el autotest del proyecto. No existe entrenamiento, ajuste fino, RLHF ni DPO; la unica "dinamica" es un reloj discreto en el que cada elemento presente se somete a un ensayo de Bernoulli con probabilidad constante igual a `loss_rate`. La perdida es, por diseno, independiente del peso, la edad y el numero de accesos: un elemento antiguo y uno recien observado tienen la misma probabilidad de desaparecer en el siguiente tick.

La innovacion tecnica no esta en el mecanismo de olvido, que es trivial, sino en su contabilidad. Al perderse un elemento se genera una lapida con los campos `label`, `observed_at`, `lost_at`, `life_span`, `weight_at_loss` y `fields` vacio, de modo que la existencia pasada queda registrada sin conservar el contenido. La perdida es silenciosa: no se emite ningun evento, y el usuario la descubre unicamente al consultar. El estado es serializable a JSON y la API expone metricas agregadas (`silence_ratio`, `acceptance`, `presence_by_age`) y controles de operacion (`freeze`, `resume`, `set_loss_rate`). No se proporciona informacion sobre datasets de entrenamiento, tokens procesados ni composicion de corpus, porque no aplican a este artefacto.

## Capacidades

- Almacenamiento asociativo: `observe(label, weight=1.0, **fields)` inserta un elemento con metadatos arbitrarios.
- Consulta de tres estados: `query(label)` devuelve `PRESENT`, `GONE` o `UNKNOWN`, distinguiendo entre perdida y ausencia de registro.
- Registro de lapidas: `tombstones_list()`, `when_lost(label)`, `life_span(label)` y `loss_log()` exponen que se perdio y cuando.
- Metricas agregadas: `silence_ratio()` (fraccion del almacen perdida), `acceptance()` (desglose completo) y `presence_by_age()` (supervivencia por tramos de edad, con advertencias remitidas al paper).
- Control temporal: `step()` y `advance_iterative(n)` avanzan el reloj discreto.
- Control de perdida: `freeze()` pausa el olvido, `resume()` lo reanuda y `set_loss_rate(rate)` modifica la tasa.
- Persistencia y diagnostico: `stats()` y `save_json("state.json")`.
- Interfaz de linea de comandos: `python holo_silence.py` y `python holo_silence.py --output results/`, con diez demostraciones.
- Identidad bind/unbind verificada en el autotest del proyecto.
- No ofrece generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues como tales; el idioma solo afecta a las etiquetas introducidas por el usuario.

## Casos de uso

- Investigacion reproducible sobre olvido: el sustrato permite estudiar la evolucion de una politica de perdida estocastica sin causa observable, con semilla fija y metricas exportables a JSON, algo dificil de aislar en sistemas de memoria reales con multiples mecanismos acoplados.
- Docencia de computacion hiperdimensional y VSA: al ser un fichero unico de unas 600 lineas y depender solo de NumPy, sirve como material de laboratorio para ilustrar binding, unbinding y memoria asociativa sin infraestructura de GPU.
- Simulacion de memoria con olvido irreversible en agentes conversacionales: integrar `SilenceMemory` como capa de memoria de un agente permite que este distinga entre datos que nunca recibio (`UNKNOWN`) y datos que recibio y ya no puede recuperar (`GONE`), lo que cambia la respuesta ante preguntas sobre informacion ausente.
- Pruebas de contrato en sistemas que dependen de la disponibilidad de memoria: las lapidas y `silence_ratio()` permiten escribir aserciones sobre que fraccion del almacen deberia seguir viva tras N ticks, util para validar mecanismos de reintento o recarga.
- Generacion de trazas sinteticas para evaluar politicas de retencion: ejecutando distintas combinaciones de `loss_rate`, `d` y numero de ticks se obtienen series de supervivencia y registros de perdida que sirven como entrada para comparar estrategias alternativas de decaimiento o poda.
- Experimentos de interfaz sobre ausencia de informacion: la distincion `GONE` frente a `UNKNOWN` permite prototipar como debe comunicarse la perdida de datos en un producto (mensajes, estados vacios, auditoria) antes de implementarlo sobre un almacen real.
- Auditoria conceptual de datos perdidos: en entornos donde la trazabilidad de la baja es obligatoria, el patron de lapida (se conserva el hecho, no el contenido) puede replicarse como referencia de diseno para registros de baja con minimizacion de datos.
- Modelado narrativo o artistico del duelo y la aceptacion: el registro de perdidas con etiquetas como `childhood_friend` o `grandmothers_recipe` en las demostraciones indica un uso deliberado como herramienta expresiva o pedagogica sobre la irreversibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparables a MMLU, HumanEval o GSM8K en la informacion disponible; no aplican a este artefacto, que no es un modelo generativo. Los unicos resultados publicados son los autotests y las series de perdida del propio sustrato.

Autotest (D=2048, loss_rate=0.02):

| Comprobacion | Resultado |
|---|---|
| Identidad bind/unbind | PASS |
| observe + query | PASS |
| Perdida con tasa 1.0 | PASS |
| Lapida registrada | PASS |

Perdida basica en el tiempo (20 elementos, 150 ticks, loss_rate=0.02):

| Tick | Presentes | Perdidos | Silence |
|---|---|---|---|
| 0 | 20 | 0 | 0.000 |
| 25 | 11 | 9 | 0.450 |
| 50 | 7 | 13 | 0.650 |
| 75 | 4 | 16 | 0.800 |
| 100 | 2 | 18 | 0.900 |
| 150 | 0 | 20 | 1.000 |

Horizonte largo (200 elementos, loss_rate=0.005, 400 ticks):

| Tick | Presentes | Perdidos | Silence | Magnitud de traza |
|---|---|---|---|---|
| 50 | 151 | 49 | 0.245 | 12.405 |
| 100 | 116 | 84 | 0.420 | 10.686 |
| 200 | 64 | 136 | 0.680 | 7.893 |
| 300 | 40 | 160 | 0.800 | 6.303 |
| 400 | 22 | 178 | 0.890 | 4.679 |

Registro de perdidas (demostracion con etiquetas, ordenado por tick de perdida):

| lost_at | life_span | label |
|---|---|---|
| 1 | 1 | forgotten_name |
| 2 | 2 | unfinished_book |
| 6 | 6 | summer_of_98 |
| 7 | 7 | favorite_song |
| 8 | 8 | grandmothers_recipe |
| 12 | 12 | first_love |
| 12 | 12 | childhood_friend |
| 27 | 27 | broken_promise |
| 34 | 34 | the_old_house |
| 52 | 52 | last_conversation |

## Requisitos de hardware

- Inferencia en CPU: suficiente. La unica dependencia es NumPy; no se documenta uso de GPU ni de aceleradores.
- VRAM estimada: no aplicable. El consumo es memoria principal. A modo orientativo, un hipervector de d=2048 en float64 ocupa unos 16 KB, por lo que los almacenes de las demostraciones (20 a 200 elementos) se mantienen en el orden de pocos megabytes, incluyendo estructuras auxiliares.
- GPU recomendadas: no aplicable; el proyecto no aprovecha CUDA ni ROCm.
- Cabe en GPU de consumo: no aplicable, al no requerir GPU.
- Opciones de despliegue: ejecucion directa con `python holo_silence.py`, importacion como modulo (`from holo_silence import SilenceMemory`) o instalacion de la dependencia mediante `pip install numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican por no tratarse de un modelo de pesos.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por tick ni de coste por operacion `observe`/`query`, mas alla de la tabla de resultados por numero de ticks.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otros sustratos de memoria comparables ni versiones concretas de la serie de herramientas a la que el autor alude de forma generica ("every other tool in this series"). Tampoco se ofrecen datos de sistemas alternativos de memoria asociativa con los que contrastar parametros, contexto, rendimiento o licencia.

| Criterio | holo-silence | Alternativas |
|---|---|---|
| Parametros | no aplicable (sin pesos) | no disponible |
| Longitud de contexto | no aplicable (almacen de hipervectores d=2048) | no disponible |
| Rendimiento | autotests PASS y series de perdida propias | no disponible |
| Licencia | apache-2.0 | no disponible |
| Disponibilidad | HuggingFace, 0 descargas, 1 like | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no puede sustituir a un LLM ni a una base de datos vectorial en produccion.
- La perdida es irreversible por diseno: no existe recuperacion del contenido de un elemento perdido, solo el registro de que existio.
- La perdida carece de causa: la probabilidad no depende del peso, la edad ni el numero de accesos. Cualquier expectativa de que los elementos mas importantes sobrevivan mas tiempo es incorrecta segun la propia documentacion.
- La perdida es silenciosa: no se emiten eventos, de modo que los consumidores deben consultar activamente o no detectaran la baja.
- La metrica `presence_by_age()` se remite a advertencias de un paper no incluido en la informacion disponible; no deben interpretarse sus resultados sin consultar ese documento.
- No hay validacion externa: 0 descargas y 1 like. No existen informes de terceros, replicaciones ni comparativas independientes.
- El ambito de idioma declarado es unicamente en, y toda la documentacion esta en ese idioma.
- El artefacto se etiqueta como educational y research; no se declaran garantias de aptitud para uso comercial mas alla de la licencia Apache 2.0, que en si misma permite uso comercial.
- La model card suministrada aparece truncada en la seccion de notas de diseno, por lo que podria existir informacion adicional no evaluada aqui.
- Los metadatos indican una fecha de creacion de 2026-10-08, posterior a la fecha habitual de consulta; conviene verificar la coherencia temporal del repositorio antes de citarlo.
- No se documenta dtype ni formato de serializacion de los vectores, solo la exportacion del estado a JSON, lo que limita la reproducibilidad fina entre plataformas.
- El rendimiento a escala no esta caracterizado: las mayores pruebas publicadas manejan 200 elementos y 400 ticks, sin datos sobre almacenes de orden superior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeechimp/holo-silence
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, a papers, a repositorios ni a demostraciones. Las busquedas devolvieron exclusivamente resultados de foros sin relacion alguna con el proyecto, por lo que se omiten.
