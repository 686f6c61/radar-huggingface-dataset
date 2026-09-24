# ylm182/ec2eat-laya-serving

## Resumen

`ylm182/ec2eat-laya-serving` no es un checkpoint de modelo, sino un repositorio de servicio que contiene un handler personalizado para Hugging Face Inference Endpoints. En el arranque descarga los pesos de `convaiinnovations/laya-multilingual` en la revision `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67` y ejecuta Laya 0.3.20 en CPU. Los pesos originales son Apache-2.0 y no se redistribuyen dentro de este repositorio.

El problema que resuelve es acotado: exponer un contrato HTTP que recibe un estado de contexto y una lista de candidatos (por ejemplo, opciones de comida) y devuelve una puntuacion de ranking para cada candidato. La etiqueta de pipeline declarada es `text-classification`, pero el comportamiento real es de puntuacion comparativa sobre una pregunta de eleccion fija, con alias de letras para mantener los identificadores fuera de la cabeza de la pregunta.

Su relevancia es la de una receta de servicio en fase de validacion: el propio autor la describe como "candidate serving recipe" con cinco pruebas locales superadas y ejemplos reales en ingles y chino tradicional. No hay validacion de despliegue en Hugging Face, cero descargas y cero likes, y la aplicacion cliente todavia exporta una receta nula que cae a un fallback determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el wrapper; corresponde al modelo subyacente `convaiinnovations/laya-multilingual` (revision `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67`), cuya arquitectura no se detalla en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible como ventana del modelo; limite operativo del handler: 700 tokens de estado como maximo, incluidas las descripciones de candidatos, y 16.000 bytes por peticion |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion; se ejecuta en CPU) |
| Idiomas soportados | no disponible en los metadatos; las pruebas locales documentadas cubren ingles y chino tradicional |
| Licencia | apache-2.0 (wrapper); pesos upstream Apache-2.0, no redistribuidos |
| Formato de pesos | no disponible; este repositorio no contiene pesos y los descarga en el arranque desde el repositorio upstream |

## Arquitectura y entrenamiento

El repositorio es un handler de Hugging Face Inference Toolkit, no un artefacto entrenado. Su contenido son `handler.py`, `requirements.txt` y `README.md`, subidos a la raiz del repositorio. No hay informacion sobre la arquitectura interna del modelo subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de RLHF o DPO. El autor indica explicitamente que los pesos upstream no se redistribuyen y que solo se descargan en el arranque.

El detalle tecnico relevante esta en el contrato de servicio. La peticion es un sobre JSON con la forma `{"inputs":{"state":"...","candidates":[{"id":"a","description":"..."}]}}`. Se admiten entre 1 y 10 identificadores de candidato unicos, con un maximo de 16.000 bytes por peticion y 700 tokens de estado incluyendo las descripciones. Las peticiones que superan el limite fallan en lugar de truncarse. Una unica pregunta de eleccion fija devuelve puntuaciones para todos los candidatos, y los alias de letras evitan que los identificadores entren en la cabeza de la pregunta; la respuesta restaura los identificadores originales. Las probabilidades crudas solo se normalizan para corregir el redondeo a cuatro decimales del modelo upstream.

La innovacion declarada es de ingenieria de servicio, no de modelado: fijar por separado la revision del handler (commit del endpoint) y la revision de los pesos (commit upstream), y documentar una ruta de verificacion local reproducible con Python 3.12, `python -m unittest discover -s tests -v` y `python smoke.py`, que descarga pesos publicos reales y genera `local-smoke.json` con datos ficticios.

## Capacidades

- Puntuacion de ranking sobre un conjunto cerrado de candidatos: devuelve un peso por candidato para una pregunta de eleccion fija.
- Procesamiento de estado de contexto minimizado junto con las descripciones de candidatos, con polaridad de dimensiones explicita y estados explicitos, neutros o desconocidos.
- Restauracion de identificadores originales en la respuesta mediante alias de letras.
- Normalizacion de probabilidades crudas limitada a corregir el redondeo a cuatro decimales del modelo upstream.
- Soporte de entre 1 y 10 candidatos unicos por peticion, con validacion estricta de limites (fallo en lugar de truncado).
- No se documentan capacidades de generacion de texto, razonamiento multi-paso, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades multilingues formales; las unicas pruebas registradas son ejemplos de dos candidatos en ingles y chino tradicional, ambos con el resultado correcto en primera posicion.
- No se expone ninguna medida de confianza: el campo de confianza es nulo por diseno.

## Casos de uso

- Ranking de opciones de restauracion en la aplicacion ec2eat: el handler recibe un estado de preferencias minimizado y una lista de candidatos con descripcion, y devuelve un peso por candidato para ordenar las sugerencias. Es el caso de uso para el que se ha construido el contrato.
- Seleccion entre alternativas cerradas en asistentes de decision: cualquier flujo que reduzca la decision a una pregunta de eleccion fija con hasta 10 opciones puede reutilizar el sobre JSON y obtener un orden.
- Servicio de clasificacion con handler personalizado en Hugging Face Inference Endpoints: sirve como plantilla funcional para quienes necesitan logica de preprocesado y postprocesado que no cabe en un pipeline estandar.
- Punto de integracion en una aplicacion movil o web con timeout corto: el contrato esta disenado para una aplicacion con timeout de 2 segundos y fallback determinista, de modo que el cliente puede seguir operando cuando el modelo tarda o esta en frio.
- Escenarios con restriccion de coste en CPU: el despliegue propuesto usa 4 vCPU y 8 GB con 0-1 replicas y 60 minutos de idle timeout, adecuado para traficos bajos o intermitentes.
- Pruebas de contrato previas a integrar un modelo de ranking en produccion: el repositorio incluye una lista de verificacion de contrato en vivo en `tests/fixtures/laya/README.md` y una prueba de humo que valida el endpoint raiz con autenticacion Bearer.
- Validacion de recetas de servicio antes de habilitar integracion: el paso 7 del procedimiento exige implementar `VerifiedLayaRecipe` con digest de fixtures, version de handler y runtime, y revision del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de validacion declarados son cinco pruebas unitarias locales superadas y dos ejemplos de inferencia real en CPU con dos candidatos (ingles y chino tradicional), en los que el candidato correcto quedo en primera posicion. El propio autor advierte que estos ejemplos no establecen calidad de ranking general. No se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- No hay estimacion de VRAM: el repositorio esta disenado expresamente para inferencia en CPU y no documenta despliegue en GPU.
- Hardware de arranque propuesto: AWS Intel Sapphire Rapids, 4 vCPU y 8 GB de memoria. El autor lo describe como una estimacion hasta que se midan el consumo de memoria de Linux en el arranque y la latencia real.
- Region: la propuesta del usuario indica N. Virginia, sujeta a disponibilidad; se propone medir la latencia desde Taiwan.
- GPU recomendadas: no disponible. No se contempla A100, H100 ni RTX 4090 en la receta, y no se indica si cabe en GPU de consumo.
- Opciones de despliegue: Hugging Face Inference Endpoints con un motor de Inference Toolkit que soporte `handler.py` (el motor Default heredado lo detecta). Se indica explicitamente que no se sustituya por vLLM, TGI ni un pipeline de clasificacion estandar, y que si Default apunta a otro motor hay que detenerse y seleccionar Inference Toolkit o usar su contenedor documentado.
- Configuracion operativa: 0-1 replicas, idle timeout de 60 minutos, comandos y argumentos de servidor vacios, AWS PrivateLink desactivado. Autenticacion solo con token del propietario (etiquetado como Private en la interfaz actual); el checkpoint es publico y la primera arrancada descarga los pesos.
- Latencia y throughput: no disponible. El autor senala que la temporizacion local en CPU de Apple no establece la latencia en AWS, y que el escalado, el calentamiento, la autorizacion del planificador y la compatibilidad de dependencias en Linux requieren pruebas de despliegue reales.
- La aplicacion cliente mantiene un timeout de 2 segundos sin cambios; las respuestas lentas o en frio deben caer al fallback.

## Comparativa con modelos similares

| Elemento | Tipo | Pesos incluidos | Licencia | Despliegue | Estado |
|---|---|---|---|---|---|
| ylm182/ec2eat-laya-serving | Handler personalizado de Inference Endpoints | No | apache-2.0 | Hugging Face Inference Toolkit sobre CPU | Receta candidata; 5 pruebas locales superadas; sin validacion de despliegue; 0 descargas, 0 likes |
| convaiinnovations/laya-multilingual | Checkpoint upstream | Si | Apache-2.0 | Descargado por el handler en el arranque (revision fijada) | Fuente de los pesos y de Laya 0.3.20 |
| Pipeline de clasificacion estandar de Transformers | Pipeline predefinido | No aplica | Segun el modelo usado | Motor estandar de Inference Endpoints | Descartado explicitamente por el autor para este contrato |

No se dispone de modelos comparables adicionales en la informacion proporcionada, ni de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Estado del artefacto: el autor lo califica como receta candidata de servicio, no como integracion lista para produccion. La aplicacion cliente exporta una receta nula y cae de forma determinista; subir estos archivos no la habilita.
- Las probabilidades devueltas son pesos de ranking, no probabilidades calibradas de disfrute. El campo de confianza es nulo y no debe interpretarse como certeza.
- Calidad de ranking no establecida: dos ejemplos correctos de dos candidatos no demuestran comportamiento general. Se requieren pruebas de contrato en vivo antes de habilitar la integracion.
- Dependencia de la revision upstream: el handler fija la revision `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67` y la rueda Laya 0.3.20 con SHA-256 `6039e802fa5effb8dd492061cd7ad39a43087beadc4a4fa4a649614e77eb83d4`. Cualquier cambio upstream rompe la reproducibilidad si no se actualizan ambos.
- Limites estrictos de entrada: mas de 10 candidatos, mas de 16.000 bytes o mas de 700 tokens de estado provocan fallo, no truncado.
- Privacidad: el estado debe ser texto de preferencia o contexto minimizado, nunca datos brutos de calendario. No deben incluirse credenciales de Gemini, Calendar, Places ni Firebase en el endpoint.
- Seguridad operativa: usar autenticacion solo con token del propietario; no ampliar el token de inferencia de produccion a permisos de escritura; no subir tokens, caches ni entornos virtuales.
- Compatibilidad no verificada: la lista de requisitos resueltos en local no implica que la imagen base de Hugging Face haya sido probada. El motor Default puede mapear a otro motor distinto de Inference Toolkit.
- Latencia no caracterizada en AWS; la medicion local en CPU de Apple no es extrapolable. El timeout de 2 segundos de la aplicacion obliga a disponer de un fallback robusto.
- Idiomas no declarados formalmente; no hay evidencia de cobertura multilingue mas alla de los dos ejemplos citados.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la informacion disponible.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion el 24 de septiembre de 2026.

## Enlaces

- Repositorio del wrapper: https://huggingface.co/ylm182/ec2eat-laya-serving
- Pesos upstream: https://huggingface.co/convaiinnovations/laya-multilingual
- Documentacion de handlers personalizados en Inference Endpoints: https://huggingface.co/docs/inference-endpoints/guides/custom_handler
