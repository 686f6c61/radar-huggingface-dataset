# SZLHOLDINGS/salad-vgl-puzzles-r1

## Resumen

`salad-vgl-puzzles-r1` es un repositorio publicado por SZLHOLDINGS (Stephen Lutar) en Hugging Face que, segun su propia model card, **no contiene artefactos del modelo**. El repositorio incluye unicamente el fichero `.gitattributes`; no se subieron pesos ni adaptadores. La model card lo describe explicitamente como un "receipt-style model card (publisher lane)" y declara un aviso de hueco ("GAP NOTICE"): el adaptador final existio en el nodo de entrenamiento, pero nunca se subio al repositorio antes de que terminara el proceso.

La unica informacion tecnica disponible procede de un registro de entrenamiento alojado en el dataset `SZLHOLDINGS/frontier-54-runs` (fichero `mesh/lanelogs/puzzles-r1-hbfinal.log`). Segun ese registro, el entrenamiento se completo hasta el paso global 200 sobre un maximo de 200, con adaptador final presente en el nodo, y se midio un consumo energetico de 232,1 J (ventana zeus) y 583,6 J (delta del contador acumulado NVML) en una RTX 3090. El `receipt_sha256` del registro es `49dbce6d5aa3ebe2cbb42f5349f3a3504401e1a02528afbb618d5bfa86e124bc`.

El modelo no es evaluable ni desplegable en su estado actual: no hay pesos, no hay pipeline declarado, no hay idiomas declarados y no se han publicado resultados de benchmarks ni afirmaciones de capacidad. Su relevancia es, por tanto, documental: ilustra un flujo de publicacion con doctrina "fail-closed" (sin recibo no se hace la afirmacion) y deja constancia de un fallo de publicacion de artefactos. Para cualquier evaluacion practica debe considerarse no disponible hasta que se relance una lane (por ejemplo, `puzzles-r2`) y se suban los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la declara; el entrenamiento produjo un adaptador, lo que sugiere ajuste fino sobre un modelo base no identificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos adicionales especificados en la model card) |
| Formato de pesos | safetensors (tag del repositorio); no hay pesos en el repositorio |

Datos adicionales del repositorio: tamano de 1,0 GB, creado el 2026-11-17 y actualizado el 2026-11-19, con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni la composicion del dataset de entrenamiento. Lo unico verificable es que se trata de un proceso de ajuste fino que genera un adaptador: el registro cita `final_adapter_present: true` en el nodo de entrenamiento. No se especifica si el adaptador es LoRA, QLoRA u otra tecnica, ni sobre que modelo base se aplico.

El entrenamiento consta de 200 pasos globales (`resume_global_step 200 / max_steps 200`), marcado como `ALREADY-COMPLETE` con `INNER_EXIT:0`, lo que indica finalizacion correcta del bucle de entrenamiento. La medicion energetica se realizo a nivel de lane: 232,1 J en la ventana de zeus y 583,6 J de delta en el contador acumulado de NVML sobre una RTX 3090. No se documentan hiperparametros, numero de tokens, mezcla de datos, ni fases de RLHF o DPO. La innovacion destacable no es tecnica sino de proceso: el uso de recibos criptograficos (`receipt_sha256`) como prueba de ejecucion y la doctrina fail-closed aplicada a las afirmaciones sobre el modelo.

## Capacidades

- No se han declarado capacidades en la informacion disponible.
- La model card incluye una seccion de "non-claims" explicita: sin afirmaciones de evaluacion, sin afirmaciones de calidad y sin afirmaciones de artefacto mas alla del recibo citado.
- Al no haber pesos en el repositorio, no es posible verificar generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue.
- El nombre del repositorio ("puzzles") sugiere un ajuste orientado a tareas de tipo puzzle, pero esto es una inferencia nominal y no una capacidad documentada.

## Casos de uso

- Auditoria de pipelines de publicacion de modelos: el repositorio sirve como caso de estudio de un flujo en el que el artefacto final no se subio y la model card lo declara de forma explicita, permitiendo revisar donde fallo el paso de publicacion.
- Verificacion de integridad mediante recibos: el `receipt_sha256` y el log de la lane permiten comprobar la trazabilidad del entrenamiento en el dataset `frontier-54-runs`, util para equipos que disenan sistemas de procedencia de modelos.
- Medicion energetica de entrenamiento: los valores de zeus y NVML sobre RTX 3090 pueden usarse como referencia metodologica para instrumentar el consumo de lanes de ajuste fino.
- Docencia y formacion interna: ejemplo real de model card "fail-closed" para ensenar buenas practicas de documentacion y de no-afirmacion sin evidencia.
- Diseno de politicas de publicacion: referencia para definir reglas que bloqueen la publicacion de fichas con afirmaciones no respaldadas por artefactos o recibos.
- Planificacion de relanzamiento: el aviso de hueco indica que se requiere una lane `puzzles-r2` para regenerar los pesos; el repositorio documenta los pasos y la evidencia que deberia acompanar a esa nueva publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no hay afirmaciones de evaluacion ni de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni parametros declarados).
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no determinable; el unico dato de hardware es que el entrenamiento se ejecuto en una RTX 3090.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna aplicable, ya que el repositorio no contiene pesos ni adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable porque se desconocen el modelo base, el tamano, el contexto y las capacidades. Cualquier comparacion con modelos de la misma categoria seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| salad-vgl-puzzles-r1 | no disponible | no disponible | other | no (repositorio sin artefactos) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos ni adaptador: solo `.gitattributes`. No es desplegable ni evaluable.
- Los pesos no son recuperables a partir del recibo; regenerarlos requiere relanzar el entrenamiento (por ejemplo, una lane `puzzles-r2`).
- No hay afirmaciones de evaluacion, calidad o capacidades; cualquier expectativa de rendimiento carece de respaldo documental.
- Licencia "other" sin terminos adicionales en la model card: antes de cualquier uso comercial seria necesario contactar con el autor para conocer las condiciones exactas.
- No se declaran idiomas soportados, sesgos conocidos ni riesgos de alucinacion; no es posible evaluarlos sin artefactos.
- El tag `region:us` y la fecha de creacion (2026-11-17) figuran en los metadatos del repositorio, pero no aportan informacion sobre el contenido del modelo.
- En produccion, este repositorio no debe referenciarse como dependencia de modelo; su unico uso valido es documental o de auditoria de proceso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-vgl-puzzles-r1
- Dataset con el registro de la lane: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Perfil del autor: https://huggingface.co/SZLHOLDINGS
