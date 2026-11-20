# TuanAnhHoangBui/vietnamese-cascade-sft-pilot

## Resumen

Vietnamese Cascade SFT Pilot es un pipeline experimental publicado en Hugging Face por el usuario TuanAnhHoangBui, no un modelo de lenguaje entrenado. Su funcion es generar candidatos de datos SFT (supervised fine-tuning) en vietnamita a partir de datasets JSONL locales derivados de Nemotron, utilizando un endpoint "teacher" compatible con la API de OpenAI para producir las respuestas.

El repositorio contiene codigo Python (pilot.py, test_pilot.py, PLAN.md) que orquesta la lectura de muestras fuente, la validacion previa de conversaciones y llamadas de herramienta, y la generacion de registros de entrenamiento revisables. No se publican pesos, configuracion de arquitectura ni resultados de evaluacion; la propia model card indica que la calidad y el rendimiento en benchmarks "no estan establecidos".

Es relevante como utilidad de infraestructura para equipos que construyen datasets de ajuste supervisado en vietnamita y necesitan un flujo reproducible con trazabilidad de errores (por ejemplo, call IDs de herramientas no emparejados). No debe confundirse con un checkpoint desplegable: es material de revision previa al entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un pipeline de generacion de datos, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el pipeline usa `--max-tokens` con valor por defecto de 128000 por peticion, limitado por el servidor teacher) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (objetivo del dataset generado); no se declaran otros idiomas |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; los artefactos son JSONL de candidatos SFT) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El repositorio implementa un pipeline en Python 3.9+ que: (1) lee registros JSONL locales derivados de Nemotron, (2) ejecuta validadores previos sobre conversaciones y resultados de herramientas, marcando como "source preflight errors" aquellos tool results con call IDs ausentes o no emparejados, y (3) realiza llamadas a un endpoint teacher compatible con OpenAI para producir respuestas SFT en vietnamita. En generacion de un solo turno se usa directamente la conversacion traducida, sin proporcionar la respuesta fuente como instruccion teacher.

El razonamiento se extrae de los campos `reasoning_content` o `reasoning` cuando estan presentes. El pipeline admite ejecucion en seco (sin llamar al endpoint) y modo `--execute` para generar candidatos. La autenticacion es opcional mediante la variable de entorno `VAI_TEACHER_API_KEY`. El paralelismo se controla con `--workers`, que puede lanzar hasta ese numero de peticiones simultaneas. No se documenta numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO, porque el artefacto no es un modelo entrenado.

## Capacidades

- Generacion de candidatos SFT en vietnamita a partir de datasets JSONL derivados de Nemotron.
- Soporte de conversaciones de un solo turno y de multiturno (este ultimo requiere revision especial segun la model card).
- Manejo de conversaciones con llamadas a herramientas, con deteccion de call IDs ausentes o no emparejados y marcado como error de preflight.
- Extraccion de trazas de razonamiento desde `reasoning_content` o `reasoning`.
- Ejecucion en seco para inspeccionar datos locales sin consumir el endpoint teacher.
- Registro de `finish_reason` y uso de tokens cuando el servidor los proporciona.
- Control de concurrencia mediante `--workers` y limite de tokens por peticion mediante `--max-tokens`.
- Suite de pruebas unitarias (`test_pilot`) y documentacion de plan en `PLAN.md`.
- No incluye capacidades de vision, audio ni inferencia directa: depende de un modelo teacher externo.

## Casos de uso

- Construccion de datasets SFT en vietnamita: el pipeline transforma JSONL derivados de Nemotron en candidatos revisables, lo que permite a un equipo montar un corpus de ajuste supervisado con trazabilidad de origen y errores.
- Auditoria de conversaciones con tool calling: los validadores marcan tool results con call IDs ausentes o no emparejados antes de invocar al teacher, lo que facilita detectar datos corruptos en el dataset fuente.
- Verificacion de calidad previa al entrenamiento: el modo de ejecucion en seco permite inspeccionar los registros locales y su estructura sin coste de API, antes de lanzar el modo `--execute`.
- Experimentacion con distintos modelos teacher: al aceptar cualquier endpoint compatible con OpenAI, se puede comparar la calidad de los candidatos generados por diferentes modelos sin cambiar el codigo.
- Generacion de trazas de razonamiento para destilacion: la lectura de `reasoning_content` o `reasoning` permite conservar cadenas de razonamiento junto a la respuesta final para su uso en entrenamiento posterior.
- Pilotaje de pipelines de datos multilingues: el diseno (validadores, preflight, run IDs) es reutilizable como plantilla para otros idiomas cambiando la configuracion de entrada y el teacher.
- Reproducibilidad de experimentos de datos: el uso de run IDs frescos tras actualizar el pipeline y el registro de uso de tokens facilitan comparar ejecuciones y estimar costes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad y el rendimiento en benchmarks no estan establecidos, y que los validadores incluidos no garantizan correccion semantica, fidelidad de traduccion, seguridad, validez del uso de herramientas ni correccion de las respuestas.

## Requisitos de hardware

- VRAM para inferencia: no aplica al repositorio, que no contiene pesos. El coste de computo recae en el endpoint teacher externo.
- GPU recomendadas: no disponibles; dependen del modelo teacher configurado, no del pipeline.
- Compatibilidad con GPU de consumo: no determinable desde la informacion disponible; depende del teacher.
- Despliegue: el pipeline se ejecuta como script de Python 3.9+ (`python3 pilot.py`) contra un endpoint compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. `--workers` permite hasta N peticiones simultaneas; la model card recomienda medir la capacidad del servidor antes de aumentarlo.
- Limite practico: `--max-tokens` por defecto es 128000 por peticion, y el prompt mas la salida solicitada deben caber en el limite de contexto del servidor.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada pipelines comparables de generacion de datos SFT en vietnamita, ni se dispone de datos de rendimiento para establecer una comparacion con alternativas.

## Limitaciones y advertencias

- No es un modelo desplegable: es un pipeline experimental de generacion de datos, marcado como "review-only" por el autor.
- La calidad y el rendimiento en benchmarks no estan establecidos.
- Las selecciones son los primeros registros elegibles de los ficheros configurados, no una muestra representativa del dataset.
- Los validadores son limitados y no garantizan correccion semantica, fidelidad de traduccion, seguridad, validez del uso de herramientas ni correccion de las respuestas.
- Las conversaciones multiturno y con herramientas requieren revision especial.
- Cada muestra puede generar multiples llamadas al modelo teacher, con el coste asociado.
- Las respuestas truncadas no se reintentan automaticamente con el mismo limite; se registra el `finish_reason`.
- Los UUID de las pruebas de seguridad se excluyen de la seleccion.
- Se recomienda usar un run ID nuevo tras actualizar el pipeline para evitar mezclar artefactos.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- No se declaran sesgos conocidos, pero al depender de un teacher externo hereda los sesgos de este y del dataset fuente.
- Riesgo de alucinacion en las respuestas generadas por el teacher; por diseno, los registros deben revisarse antes de usarse en entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TuanAnhHoangBui/vietnamese-cascade-sft-pilot
- No se han encontrado otros enlaces (paper, blog, repositorio de codigo independiente o demo) en la informacion disponible.
