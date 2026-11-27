# TrussTechnologiesGroup/Qwen3-1.7B-Abliterated

## Resumen

Qwen3-1.7B-Abliterated es una variante "abliterated" del modelo Qwen3-1.7B de Alibaba Qwen, publicada por TrussTechnologiesGroup. La abliteracion es una tecnica de edicion de pesos que identifica la direccion de activacion asociada al rechazo (refusal) y la elimina de las proyecciones del modelo, de modo que el modelo deja de negarse a responder a ciertas peticiones sin necesidad de reentrenamiento adicional. El resultado conserva la estructura y capacidades generales del modelo base.

El modelo base, Qwen3-1.7B, es un transformer denso de 1.700 millones de parametros perteneciente a la familia Qwen3, que incorpora modo de razonamiento (thinking mode) y soporte multilingue amplio. Esta derivada mantiene la licencia Apache 2.0 del original y se distribuye con pesos en formato safetensors.

Su relevancia es acotada: se trata de un experimento de investigacion sobre alineacion y edicion de pesos, con cero descargas y cero likes en el momento de la ficha, y sin pipeline declarado. Es util para estudiar el efecto de la abliteracion sobre el comportamiento de rechazo y sobre la degradacion de capacidades, no como modelo de produccion recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun tags del repositorio; el modelo base soporta mas idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato habitual del modelo base; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B original: un transformer denso con atencion por cabezas y capas MLP estandar. Sobre este modelo no se aplico ningun fine-tuning adicional; la unica modificacion es la abliteracion, una intervencion quirurgica sobre los pesos.

El procedimiento descrito en la model card consiste en: (1) contrastar las activaciones del modelo ante 300 prompts considerados daninos frente a 300 prompts inofensivos para identificar la direccion de rechazo; (2) ortogonalizar esa direccion respecto a todas las proyecciones de atencion y MLP (q, k, v, o, gate, up, down) y respecto a la lm_head; (3) aplicar la operacion sobre 18 capas seleccionadas automaticamente, concretamente aquellas con un tamano de efecto |Cohen's d| >= 5,0. No se documento el numero de tokens de entrenamiento porque no hubo entrenamiento: es una edicion post-hoc de pesos.

La innovacion tecnica es precisamente la abliteracion selectiva por capas, que busca eliminar el comportamiento de rechazo minimizando el dano colateral en las capacidades generales. El modelo conserva el modo de razonamiento (thinking mode) del Qwen3 original, lo que puede generar conflictos ocasionales entre el razonamiento y el comportamiento abliterated, tal como advierte el autor.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3-1.7B.
- Modo de razonamiento (thinking mode) conservado del original.
- Generacion de codigo y resolucion de problemas matematicos basicos, segun las capacidades del modelo base.
- Ausencia (o reduccion) del comportamiento de rechazo ante peticiones que el modelo original declinaria.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta derivada; el modelo base Qwen3 lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: los tags del repositorio declaran unicamente ingles ("en"), aunque el modelo base es multilingue.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y edicion de pesos: el modelo sirve para estudiar empiricamente como la eliminacion de la direccion de rechazo afecta al comportamiento y a las capacidades del modelo, comparandolo con el Qwen3-1.7B original en tareas controladas.
- Evaluacion de robustez de sistemas de moderacion: permite probar si las capas de seguridad externas (clasificadores, filtros de salida) siguen funcionando cuando el modelo subyacente ha sido abliterated, un escenario realista de defensa en profundidad.
- Experimentos de red teaming controlados: util para generar respuestas que un modelo alineado rechazaria, dentro de entornos de laboratorio y con supervision, para identificar fallos en pipelines de seguridad.
- Analisis de degradacion de capacidades: comparar las puntuaciones del modelo abliterated frente al base en benchmarks de razonamiento y conocimiento permite cuantificar el coste de la intervencion.
- Prototipado de asistentes creativos sin restricciones de estilo: en entornos donde se requiere un tono sin filtros (ficcion, guiones, role-play), aunque con las advertencias de seguridad correspondientes.
- Fine-tuning posterior como punto de partida: al ser un modelo pequeno (1,7 B) y con licencia Apache 2.0, puede servir de base para ajustes especificos en los que el comportamiento de rechazo del original suponga una friccion, siempre que se anada una capa de seguridad propia.

## Benchmarks y rendimiento

La model card incluye dos graficos de resultados (un "Compliance Benchmark" y un "General Purpose Benchmark") como imagenes, pero no se proporcionan los valores numericos en la informacion disponible. No se pueden reproducir cifras concretas sin inventarlas.

| Benchmark | Resultado |
|---|---|
| Compliance Benchmark | solo grafico, sin cifras en la informacion disponible |
| General Purpose Benchmark | solo grafico, sin cifras en la informacion disponible |
| MMLU, HumanEval, GSM8K, etc. | no disponible |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,7 B de parametros, en FP16 requiere aproximadamente 3,4 GB solo para pesos, mas overhead de cache KV y activaciones; en cuantizacion de 8 bits, unos 1,7 GB; en 4 bits, alrededor de 1 GB (estimaciones teoricas a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 6-8 GB o mas de VRAM deberia poder ejecutarlo en cuantizaciones bajas; para FP16 se recomienda al menos 8 GB. GPUs de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, especialmente con cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son opciones habituales para modelos de este tamano; la compatibilidad concreta con esta derivada no esta confirmada en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Abliterated (este) | 1,7 B | no disponible | Apache 2.0 | Derivada abliterated, sin fine-tuning adicional, 0 descargas |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en la informacion | Apache 2.0 | Modelo base original, alineado, con modo thinking |
| Otras derivadas abliterated de Qwen3 | no disponible | no disponible | Apache 2.0 (heredada) | Existen variantes comunitarias similares; no se dispone de datos comparativos en la informacion proporcionada |
| Modelos densos de ~1-2 B de otras familias | no disponible | no disponible | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La abliteracion no es perfecta: pueden persistir rechazos residuales y la capacidad general puede degradarse ligeramente, segun advierte el propio autor.
- El modo de razonamiento se conserva, lo que puede provocar conflictos ocasionales entre el razonamiento interno y el comportamiento abliterated.
- Riesgo elevado de generar contenido danino, sesgado o inexacto: al eliminar la direccion de rechazo, el modelo puede producir respuestas que el original filtraria. No debe desplegarse en produccion sin capas de seguridad externas.
- Riesgo de alucinacion: inherente a los modelos de 1,7 B y no mitigado por la abliteracion.
- Idiomas: los tags declaran solo ingles, aunque el modelo base es multilingue; el comportamiento en otros idiomas no esta verificado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado; la licencia no exime de cumplir la normativa aplicable.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia; sin pipeline declarado ni validacion comunitaria. No recomendado como dependencia de produccion.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; debe consultarse la del modelo base antes de asumir ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TrussTechnologiesGroup/Qwen3-1.7B-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Grafico de Compliance Benchmark: https://cdn-uploads.huggingface.co/production/uploads/6a5c44d9b0790598bd9fb734/bqprhhna0OW4NVOIa2eNC.png
- Grafico de General Purpose Benchmark: https://cdn-uploads.huggingface.co/production/uploads/6a5c44d9b0790598bd9fb734/Efy4Avtm48yxQkKudkQq4.png
