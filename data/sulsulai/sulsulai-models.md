# sulsulAI/sulsulAI-models

## Resumen

sulsulAI-models es un repositorio de modelos de lenguaje especializados en contabilidad coreana, publicados por sulsulAI para su aplicacion de escritorio SulSulAI (술술AI), que anade funciones de IA al programa gratuito de contabilidad SulSul Accounting (술술회계). No se trata de un modelo de proposito general, sino de un ajuste fino (finetune) de la familia Qwen3.5 orientado a tareas contables concretas: propuesta de asientos contables (분개) a partir de ficheros bancarios, revision y marcado de advertencias sobre asientos introducidos manualmente, y conversion de lenguaje natural en borradores de asiento.

El repositorio contiene dos variantes derivadas de los modelos base Qwen/Qwen3.5-0.8B y Qwen/Qwen3.5-4B, ambas cuantizadas a GGUF Q8_0 para ejecucion local en el PC del usuario. El modelo de 0,8B cuenta con 752.393.024 parametros en sus pesos safetensors originales, lo que lo situa en la gama ultra-ligera apta para equipos sin GPU dedicada. La licencia es Apache 2.0 tanto para el modelo base como para los derivados.

Su relevancia es acotada pero clara: demuestra un patron de despliegue de IA local y vertical para software de gestion (contabilidad), con modelos pequenos, cuantizados y empaquetados en GGUF para inferencia offline dentro de una aplicacion de escritorio. El autor advierte explicitamente de que el modelo no esta pensado para conversacion general ni para usos fuera de la aplicacion SulSulAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5; detalles de atencion y capas no disponibles) |
| Parametros totales | 752.393.024 (variante 0.8B, safetensors); variante 4B no disponible en detalle |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); pesos safetensors del modelo base referenciados en metadatos |

Ficheros publicados:

| Fichero | Modelo base | Formato | Tamano (bytes) |
|---|---|---|---|
| sulsul-multi-qwen3.5-0.8b-r12-q8_0.gguf | Qwen/Qwen3.5-0.8B | GGUF Q8_0 | 811.843.168 |
| sulsul-multi-qwen3.5-4b-r12-q8_0.gguf | Qwen/Qwen3.5-4B | GGUF Q8_0 | 4.482.402.816 |

## Arquitectura y entrenamiento

Los modelos son ajustes finos de la familia Qwen3.5 (Qwen/Qwen3.5-0.8B y Qwen/Qwen3.5-4B), desarrollada por Alibaba Cloud. La model card no detalla la arquitectura interna (numero de capas, mecanismo de atencion, uso de GQA o decodificacion especulativa), por lo que esos datos deben consultarse en las fichas de los modelos base. Tras el ajuste fino, los pesos se cuantizaron a GGUF Q8_0, un formato de 8 bits por peso que reduce el tamano del fichero y permite inferencia en CPU o GPU de gama baja mediante runtimes compatibles con GGUF.

No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset contable, ni si se emplearon tecnicas de RLHF o DPO. La model card indica unicamente que el ajuste esta orientado a tres tareas de contabilidad (propuesta de asientos desde ficheros bancarios, revision de asientos y conversion de lenguaje natural a asiento), lo que sugiere un dataset de dominio muy acotado, pero no se aportan cifras. El sufijo "r12" en los nombres de fichero podria indicar una revision o iteracion del entrenamiento, aunque su significado no se documenta.

## Capacidades

- Generacion de propuestas de asientos contables (분개) para transacciones bancarias que las reglas deterministas no logran clasificar.
- Revision de asientos introducidos por el usuario, con marcado de advertencias o posibles errores.
- Conversion de lenguaje natural en coreano a borradores de asiento contable.
- Ejecucion local en el PC del usuario mediante la aplicacion SulSulAI, sin depender de la nube.
- Capacidades conversacionales generales limitadas: el autor indica que el modelo no es adecuado para conversacion general ni usos fuera de la aplicacion.
- Soporte de tool calling, agentes, vision, audio o modo de razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo coreano declarado.

## Casos de uso

- Clasificacion contable asistida de extractos bancarios: el modelo recibe transacciones que el motor de reglas no ha podido mapear y propone una cuenta y un asiento, reduciendo el trabajo manual en la conciliacion.
- Revision de asientos antes del cierre: se envian los asientos introducidos por el usuario y el modelo devuelve advertencias sobre inconsistencias, descuadres o cuentas probablemente incorrectas.
- Entrada de datos por lenguaje natural: el usuario describe una operacion en coreano ("pague 50.000 wones de gasolina con la tarjeta corporativa") y el modelo genera el borrador de asiento correspondiente.
- Automatizacion en pymes sin departamento contable: al ejecutarse en local dentro de SulSulAI, permite a pequenas empresas coreanas obtener asistencia contable sin contratar servicios externos ni enviar datos financieros a la nube.
- Procesamiento offline con requisitos de privacidad: al ser GGUF y ejecutarse en el PC del usuario, los datos bancarios y contables no salen del equipo, lo que facilita el cumplimiento de requisitos de confidencialidad financiera.
- Prototipado de asistentes contables verticales: sirve como referencia para equipos que quieran construir un asistente de dominio sobre un modelo base pequeno y cuantizado, replicando el patron de finetune + GGUF + app de escritorio.
- Formacion y demostracion: util para mostrar como un modelo de menos de 1.000 millones de parametros puede cubrir tareas de dominio estrechas con calidad aceptable cuando el dataset de ajuste es especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante 0.8B en Q8_0 ocupa unos 812 MB de fichero, por lo que cabe holgadamente en 2 GB de VRAM o incluso en memoria RAM de CPU; la variante 4B en Q8_0 ocupa unos 4,48 GB, requiriendo alrededor de 6 GB de VRAM para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: para la variante 0.8B basta con CPU moderna o cualquier GPU integrada; para la 4B, una GPU consumer con 6-8 GB (RTX 3060, RTX 4060, RTX 2070) es suficiente.
- Cabe en GPU consumer: si, ambas variantes; la de 0.8B incluso en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo API, aunque no se detalla el runtime concreto.
- Latencia y throughput: no disponibles. Por el tamano, la variante 0.8B en CPU deberia ofrecer respuestas interactivas, y la 4B en GPU consumer un rendimiento adecuado para uso de escritorio, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| sulsulAI-models (0.8B) | 752 M | no disponible | GGUF Q8_0 | Apache 2.0 | Contabilidad coreana, local |
| sulsulAI-models (4B) | no disponible | no disponible | GGUF Q8_0 | Apache 2.0 | Contabilidad coreana, local |
| Qwen/Qwen3.5-0.8B (base) | ~0.8 B | no disponible | safetensors/GGUF | Apache 2.0 | Proposito general |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | safetensors/GGUF | Apache 2.0 | Proposito general |

La comparacion relevante es contra los propios modelos base: los derivados de sulsulAI sacrifican generalidad por especializacion contable en coreano, manteniendo la licencia Apache 2.0 y el mismo rango de tamano. No se dispone de datos de rendimiento comparativo (benchmarks) para cuantificar la mejora en tareas contables frente al base.

## Limitaciones y advertencias

- Modelo de dominio estrecho: el autor advierte que no es apto para conversacion general ni para usos fuera de la aplicacion SulSulAI.
- Solo coreano declarado; no se garantiza calidad en otros idiomas.
- Riesgo de alucinacion en propuestas contables: las sugerencias de asientos y las advertencias son orientativas y el usuario debe verificar antes de registrar en el libro.
- No es un producto oficial de Qwen/Alibaba Cloud; es un derivado no avalado por el equipo del modelo base.
- Sin datos publicados de benchmarks, contexto maximo ni composicion del dataset de entrenamiento, lo que dificulta evaluar su robustez.
- Al estar cuantizado a Q8_0, puede haber una ligera perdida de calidad respecto a los pesos originales en precision completa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio y las condiciones del modelo base.
- Repositorio con 0 likes y 692 descargas en el momento de la consulta; ecosistema y soporte comunitario muy limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sulsulAI/sulsulAI-models
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0 (referenciada en el repositorio): https://huggingface.co/sulsulAI/sulsulAI-models/blob/main/LICENSE
