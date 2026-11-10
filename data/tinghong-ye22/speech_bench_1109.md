# Tinghong-Ye22/speech_bench_1109

## Resumen

HFD Speech Bench (repositorio `Tinghong-Ye22/speech_bench_1109`, protocolo 1109) no es un modelo de lenguaje, sino un paquete de evaluacion (benchmark) para medir el momento de interaccion y la calidad de respuesta en sistemas de voz full-duplex. Lo publica el usuario Tinghong-Ye22 y esta pensado para evaluar grabaciones reales generadas por modelos de voz ya existentes, no para generar audio ni texto por si mismo. Su relevancia actual radica en que aborda una carencia habitual en la evaluacion de asistentes de voz: medir no solo la calidad del contenido, sino tambien cuando decide intervenir el sistema en una conversacion simultanea.

El paquete fija un conjunto de 1024 entradas y anotaciones descargadas desde una fuente publica mediante `fetch_data.py`, e incluye manifiesto, referencias offline y grupos de origen. La entrada principal es `speech_bench.py`, que ejecuta las etapas de comprobacion y evaluacion; la fase de pago (con juez en la nube) requiere declarar explicitamente un presupuesto en yuanes mediante `--api-budget-cny`.

La documentacion indica que se trata de una version de entrega fija (`288a49c2`) con correcciones adoptadas, no de un nuevo sistema de puntuacion, y que no incluye evaluacion de acciones. Los resultados antiguos de ROMA y Aero han sido retirados por falta de validacion de la adaptacion de inferencia, y DuplexOmni queda en pausa, por lo que no se ofrecen resultados citables ni un baseline reproducido verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un benchmark, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible (el autor indica que no anade licencia nueva y conserva los terminos de terceros) |
| Formato de pesos | no disponible (el repositorio contiene codigo Python, manifiestos JSON y referencias; los pesos de los modelos evaluados se descargan aparte) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio es un arnes de evaluacion escrito en Python (entorno recomendado Python 3.12 con PyTorch para GPU) que orquesta la descarga de datos, la comprobacion de configuracion y la ejecucion de las metricas. La evaluacion se divide en etapas (`--stage check`, `--stage all`) y puede emplear un juez en la nube mediante alias de servicio, lo que implica que las actualizaciones del proveedor pueden introducir variaciones en los resultados.

El conjunto de datos fijo consta de 1024 entradas con manifiesto, referencias offline y grupos de origen, e incluye una version compilada con 165 casos nuevos de "hesitation" (duda o vacilacion) que no debe sustituirse por datos antiguos. Los ficheros voluminosos (videos, WAV de entrada y pesos de modelos) no se empaquetan en el repositorio, sino que se descargan desde fuentes fijas. El repositorio conserva las funciones de puntuacion originales, los prompts del juez y el bloqueo de dependencias, aplicando por defecto la politica de denominadores mas reciente y la correccion de tiempos de reinicio.

## Capacidades

- Evaluacion del momento de intervencion (timing) en interacciones de voz full-duplex sobre grabaciones reales de modelos.
- Evaluacion de la calidad de respuesta asociada a cada turno.
- Gestion de inserciones dinamicas de turno, grabaciones y marcas de tiempo segun el documento de integracion.
- Soporte de dos idiomas de evaluacion: ingles y chino.
- Flujo reproducible desde un directorio vacio hasta la generacion de un informe.
- Control de coste de la fase de juez en la nube mediante presupuesto explicito en CNY.
- Registro de versiones, peticiones y respuestas, denominadores y exclusiones para trazabilidad.
- No incluye evaluacion de acciones ni un backend S2.

## Casos de uso

- Evaluacion de asistentes de voz conversacionales: permite medir si un sistema full-duplex interviene en el momento adecuado y con una respuesta de calidad, usando grabaciones reales del modelo candidato.
- Comparacion de variantes de un mismo sistema de voz: al fijar 1024 entradas y referencias offline, se pueden contrastar distintas configuraciones de inferencia bajo el mismo protocolo y denominadores.
- Investigacion academica en interaccion por voz: el paquete incluye una guia de escritura de paper con ajustes experimentales, unidades y limitaciones, lo que facilita documentar resultados de forma consistente.
- Auditoria de pipelines de evaluacion: la separacion entre etapa de comprobacion (sin coste de API) y etapa completa permite validar la configuracion antes de gastar presupuesto.
- Reproducibilidad de experimentos: el bloqueo de dependencias, el manifiesto fijo y el registro de peticiones permiten reconstruir una ejecucion y justificar los denominadores empleados.
- Integracion en flujos de validacion internos: el script `speech_bench.py` puede ejecutarse en entornos con GPU y apuntar a un directorio de resultados de inferencia propio, sirviendo como puerta de calidad antes de desplegar un cambio en un asistente de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los resultados antiguos de ROMA y Aero han sido retirados y que no se ofrece ningun resultado citable ni un baseline reproducido verificado. La validacion publicada (`validation/RELEASE_VALIDATION.json`) cubre comprobaciones de codigo y metadatos y pruebas de politica en CPU, no una evaluacion completa en GPU con API.

## Requisitos de hardware

- VRAM: no disponible; depende del modelo de voz que se evalue, no del benchmark.
- GPU recomendadas: no disponibles; el documento de reproduccion menciona una version de PyTorch para GPU, sin especificar modelos concretos.
- GPU de consumo: no disponible.
- Despliegue: ejecucion local mediante `python speech_bench.py`; el juez de calidad puede ser un servicio en la nube (con coste) o configurarse segun `evaluation/config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros benchmarks de voz full-duplex comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, audio ni respuestas; solo evalua salidas existentes.
- Los resultados antiguos de ROMA y Aero estan retirados y no deben citarse; no hay baseline verificado.
- DuplexOmni esta en pausa y la etapa S1 no puede presentarse como S1/S2 completo; no se incluye backend S2.
- La evaluacion con juez en la nube puede variar si el proveedor actualiza el servicio, ya que se usan alias de servicio.
- Diferencias de hardware o de implementacion del modelo de voz pueden impedir resultados identicos bit a bit.
- La licencia no esta declarada en la ficha; el autor indica que no anade licencia nueva y conserva los terminos de terceros, por lo que el uso comercial debe verificarse en `THIRD_PARTY.md`.
- El repositorio no incluye checkpoints privados de HFD, claves de API, credenciales SSH, caches de pago ni respuestas de juicio humano.
- La etapa completa consume presupuesto de API; es necesario declararlo con `--api-budget-cny` y revisar la configuracion antes de ejecutar.
- Solo cubre ingles y chino.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tinghong-Ye22/speech_bench_1109
- Documentacion de instalacion y reproduccion: `docs/REPRODUCE.md` (dentro del repositorio)
- Protocolo vigente: `docs/CURRENT_PROTOCOL.md` (dentro del repositorio)
- Formulas y casos especiales: `evaluation/PROTOCOL.md` (dentro del repositorio)
- Integracion de modelos y estructura de entrada/salida: `HANDOFF_FOR_CODEX.md` (dentro del repositorio)
- Guia para escritura de paper: `docs/PAPER_GUIDE.md` (dentro del repositorio)
- Version y origen: `release.json` (dentro del repositorio)
- Terminos de terceros: `THIRD_PARTY.md` (dentro del repositorio)
- Documento de entrega original: `UPSTREAM_README.md` (dentro del repositorio)
- Validacion de la release: `validation/RELEASE_VALIDATION.json` (dentro del repositorio)
