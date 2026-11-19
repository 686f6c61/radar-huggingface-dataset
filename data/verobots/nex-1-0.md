# verobots/nex-1.0

## Resumen

Nex 1.0, publicado por verobots bajo el identificador `verobots/nex-1.0`, no es un modelo de pesos entrenado, sino un *routing harness* (arnés de enrutamiento) que se sitúa por encima de modelos frontera de terceros. Para cada tarea de evaluación, el sistema enruta la categoría del benchmark al modelo con mejor puntuación pública en ese tipo de prueba, lo ejecuta a su máximo esfuerzo de razonamiento y le añade una "skill" específica por benchmark: un fichero de instrucciones corto redactado únicamente a partir de la descripción pública del benchmark, nunca a partir de los ítems ni de las respuestas.

La propuesta metodológica es interesante porque mide cada resultado contra el modelo enrutado actuando en solitario sobre los mismos ítems, con intervalos de confianza pareados al 95 %, de modo que la contribución del arnés queda aislada del mérito del modelo subyacente. Las llamadas se realizan a través de las CLI oficiales de cada modelo, en directorios vacíos, sin acceso web ni herramientas más allá de un sandbox de solo lectura, y con una única muestra por ítem (sin votación ni best-of-n), salvo que las notas del resultado indiquen lo contrario.

Es relevante ahora porque ejemplifica una tendencia creciente en el ecosistema: artefactos de orquestación y evaluación publicados como si fueran modelos, con tags de router, agent y benchmark. Conviene subrayar que las puntuaciones son autodeclaradas y no han sido verificadas por los autores de los benchmarks, y que el repositorio no incluye pesos, arquitectura ni datos de entrenamiento en el sentido tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de pesos; es un arnés de enrutamiento sobre modelos frontera de terceros) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos; el artefacto es código, skills y resultados por ítem en un repositorio) |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento en el sentido habitual: Nex 1.0 es un arnés de enrutamiento implementado como software. Su funcionamiento se articula en tres pasos por benchmark: primero enruta la categoría de la tarea al modelo con la puntuación pública más alta en ese tipo de test, ejecutándolo a máximo esfuerzo de razonamiento; segundo, añade una skill por benchmark consistente en un fichero de instrucciones breve derivado exclusivamente de la descripción pública del benchmark; tercero, compara el resultado con el del modelo enrutado en solitario sobre los mismos ítems mediante intervalos de confianza pareados al 95 %.

El protocolo de evaluación descrito en la model card especifica que los modelos se invocan a través de sus CLI oficiales, cada trabajo en su propio directorio vacío, sin acceso web y sin herramientas más allá de un sandbox de solo lectura, con una sola muestra por ítem (sin votación ni best-of-n) salvo indicación contraria en las notas del resultado. El modelo enrutado para cada benchmark se nombra en dichas notas. No se documentan volúmenes de datos de entrenamiento, composición de dataset ni fases de RLHF o DPO, porque no existen en este artefacto.

## Capacidades

- Enrutamiento de tareas de evaluación hacia modelos frontera según la puntuación pública más alta por categoría de benchmark.
- Inyección de skills por benchmark: instrucciones cortas derivadas solo de la descripción pública del test.
- Evaluación pareada con intervalos de confianza al 95 % frente al modelo enrutado en solitario.
- Ejecución mediante CLI oficiales de los modelos subyacentes, con aislamiento por directorio vacío.
- Ejecución en sandbox de solo lectura, sin acceso web ni herramientas adicionales.
- Registro de resultados por ítem en el directorio `.eval_results/` del repositorio.
- Soporte de agentes y razonamiento multi-paso heredado de los modelos enrutados (no propio del arnés).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- No incluye visión, audio ni modo de pensamiento propio; cualquier capacidad de ese tipo dependería del modelo subyacente seleccionado en cada caso.

## Casos de uso

- Evaluación comparativa de modelos frontera: usar el arnés para ejecutar un mismo benchmark contra varios modelos con protocolo homogéneo (CLI oficial, directorio vacío, sandbox de solo lectura) y obtener diferencias con intervalos pareados al 95 %.
- Medición del valor añadido de un prompt de sistema: la comparación entre el modelo en solitario y el modelo más la skill por benchmark permite cuantificar cuánto aporta una instrucción corta derivada de la descripción pública del test.
- Reproducibilidad de resultados de evaluación: el repositorio publica código, skills y resultados por ítem, lo que permite replicar el pipeline en otra infraestructura y contrastar las puntuaciones autodeclaradas.
- Auditoría metodológica de benchmarks: el diseño sin acceso web, sin herramientas y con una sola muestra por ítem reduce las vías de contaminación y facilita revisar si las cifras publicadas son defendibles.
- Orquestación de agentes en producción experimental: el patrón de enrutar por categoría de tarea al modelo con mejor rendimiento público es trasladable a pipelines internos donde distintas tareas (código, matemáticas, razonamiento) se derivan a proveedores distintos.
- Investigación sobre ensembles y routing: sirve como referencia de línea base para comparar estrategias de selección de modelo frente a alternativas como votación, best-of-n o cascadas de modelos.
- Docencia y formación en evaluación de IA: el repositorio documenta el protocolo completo (CLI, aislamiento, skills, intervalos de confianza), lo que lo hace útil como material didáctico sobre cómo se mide un modelo y qué sesgos introduce el arnés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados por ítem residen en el directorio `.eval_results/` del repositorio de GitHub, pero no se incluyen cifras, nombres de benchmarks ni valores numéricos en la información proporcionada. Las puntuaciones existentes, en cualquier caso, serían autodeclaradas y no verificadas por los autores de los benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el artefacto no incluye pesos; los requisitos dependen del modelo frontera enrutado en cada benchmark).
- GPU recomendadas: no disponible por la misma razón; vendrán determinadas por el modelo subyacente invocado vía CLI.
- Ejecución en GPU de consumo: no disponible; depende del modelo enrutado.
- Opciones de despliegue: el arnés requiere las CLI oficiales de los modelos frontera y un entorno con sandbox de solo lectura; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Aspecto | Nex 1.0 (verobots) | Modelo de pesos abierto (referencia genérica) | Arnés de evaluación propietario (referencia genérica) |
|---|---|---|---|
| Naturaleza | Arnés de enrutamiento sobre modelos de terceros | Pesos entrenados | Pipeline interno de evaluación |
| Parámetros | No aplica | Depende del modelo | No aplica |
| Contexto | No disponible | Depende del modelo | No aplica |
| Licencia | No disponible | Depende del modelo | Propietaria |
| Pesos distribuidos | No | Sí | No |
| Idiomas | en | Variable | Variable |
| Resultados verificados por terceros | No (autodeclarados) | Variable | No |

No se dispone de información sobre modelos comparables directos en la información proporcionada; la comparativa anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- No es un modelo de pesos: no puede descargarse ni ejecutarse de forma autónoma; depende de las CLI oficiales de modelos frontera de terceros, con los costes y las condiciones de uso de cada proveedor.
- Las puntuaciones son autodeclaradas y no están verificadas por los autores de los benchmarks, por lo que no deben tratarse como resultados oficiales.
- El campo `language` de la model card se limita a inglés; no hay evidencia de capacidades multilingües del arnés.
- La licencia no está declarada, lo que impide determinar si el uso comercial del código, las skills o los resultados está permitido.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que limita la validación externa de los resultados.
- El enrutamiento se basa en puntuaciones públicas previas de cada modelo; si esas puntuaciones están contaminadas o desactualizadas, la selección del modelo por categoría hereda ese sesgo.
- El protocolo con una sola muestra por ítem y sin best-of-n reduce la varianza artificial, pero también la robustez frente a respuestas atípicas; los intervalos pareados al 95 % mitigan parcialmente este efecto, no lo eliminan.
- Riesgo de alucinación: heredado íntegramente del modelo subyacente enrutado; el arnés no incorpora mecanismos propios de verificación factual.
- Las skills se redactan solo a partir de la descripción pública del benchmark; si esa descripción es ambigua o incompleta, la instrucción inyectada puede desviar el comportamiento del modelo.
- Al no distribuir pesos, no es posible auditar el comportamiento del sistema sin acceso a los modelos de terceros y a sus CLI.

## Enlaces

- Hugging Face: https://huggingface.co/verobots/nex-1.0
- Repositorio GitHub (código, skills, resultados por ítem): https://github.com/verobots/nex-1.0
- Sitio del autor: https://verobots.net
- Contacto: contact@verobots.net
