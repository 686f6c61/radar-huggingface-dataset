# wckwan/Webshop-Olmo3-7B-Outcome-2048

## Resumen

Webshop-Olmo3-7B-Outcome-2048 es un ajuste por aprendizaje por refuerzo del modelo allenai/Olmo-3-7B-Instruct, publicado por el usuario wckwan en HuggingFace. No es un modelo de propósito general: es una política entrenada específicamente para actuar como agente de búsqueda multi-turno al estilo Search-R1, es decir, un modelo que alterna entre emitir consultas a una herramienta de búsqueda (o navegación web) y generar respuestas basadas en los resultados recuperados.

El entrenamiento emplea una variante denominada Process-GRPO: se parte de GRPO (Group Relative Policy Optimization) y se añade un modelo de recompensa de proceso (un verificador basado en Olmo-3-7B-Think) que puntúa cada turno de la trayectoria, con normalización de ventajas por posición de turno dentro de cada grupo. Los prompts del verificador incluyen las respuestas de la herramienta recuperada y la respuesta de referencia (gold answer), de modo que la señal de recompensa evalúa la calidad del razonamiento intermedio y no solo el resultado final.

El repositorio contiene la política final (paso 400 de entrenamiento) en la raíz y 19 checkpoints intermedios en subcarpetas `step_20/` a `step_380/`, lo que lo convierte en un artefacto útil tanto para despliegue como para investigación sobre dinámicas de entrenamiento con recompensa de proceso. El tamaño del repositorio es de 291,9 GB, coherente con almacenar veinte copias de un modelo de 7B en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de allenai/Olmo-3-7B-Instruct; no se detalla configuracion especifica en la informacion disponible) |
| Parametros totales | Aproximadamente 7 mil millones, segun la denominacion del modelo; no confirmado explicitamente en la model card |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible. El sufijo "2048" del nombre sugiere una ventana de 2048 tokens para el rollout de entrenamiento, sin confirmar |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de allenai/Olmo-3-7B-Instruct, un transformer decoder-only de aproximadamente 7.000 millones de parametros, sobre el que se aplica un ajuste por refuerzo. La model card no detalla hiperparametros de arquitectura (numero de capas, dimension oculta, cabezas de atencion) ni la composicion del dataset de entrenamiento, por lo que esos datos deben consultarse en la ficha del modelo base.

La innovacion destacada es el esquema Process-GRPO. Frente a GRPO estandar, que asigna una unica recompensa por trayectoria completa, aqui un verificador (Olmo-3-7B-Think) puntua cada turno de la trayectoria de busqueda. Las ventajas se normalizan por par (grupo, posicion de turno), lo que evita que turnos tardios dominen la senal de gradiente y permite atribuir credito a decisiones intermedias de busqueda. Ademas, los prompts del verificador incorporan tanto las respuestas devueltas por la herramienta como la respuesta de referencia, lo que da al verificador contexto suficiente para juzgar si una busqueda concreta aporto informacion relevante. El entrenamiento reportado consta de 400 pasos, con checkpoints cada 20 pasos.

## Capacidades

- Generacion de texto con modo agente: produce turnos de razonamiento intercalados con llamadas a una herramienta de busqueda, segun el formato Search-R1.
- Busqueda multi-turno no colapsada: la metrica de entrenamiento indica 2,6 busquedas por trayectoria de media, lo que sugiere que el modelo aprende a reformular consultas en lugar de degenerar a una sola busqueda.
- Uso de herramientas (tool use) en el sentido de emitir consultas estructuradas y consumir las respuestas devueltas por el entorno.
- Razonamiento encadenado multi-paso orientado a tareas de recuperacion de informacion y navegacion web tipo Webshop.
- Generacion de respuestas finales condicionadas a evidencia recuperada, no solo a conocimiento parametrico.
- No se documentan capacidades de vision, audio, codigo especializado ni modo "thinking" explicito mas alla del razonamiento inducido por el entrenamiento con recompensa de proceso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de busqueda web multi-turno: el modelo puede integrarse en un bucle donde emite consultas, lee resultados y decide si reformular la busqueda o responder, aprovechando que fue entrenado explicitamente para no colapsar a una sola consulta.
- RAG agéntico sobre bases documentales: en lugar de una recuperacion unica, el modelo puede encadenar varias consultas a un retriever (Elasticsearch, vector DB via herramienta) y sintetizar la respuesta final a partir de la evidencia acumulada.
- Asistentes de compra en entornos tipo Webshop: navegacion por catalogos, comparacion de productos y seleccion final, que es el escenario implicito en el nombre del modelo.
- Generacion de trayectorias sinteticas para entrenamiento: los checkpoints intermedios permiten muestrear trayectorias de distinta calidad y usarlas como datos para destilacion o para entrenar verificadores de proceso.
- Investigacion sobre recompensa de proceso: la serie de 20 checkpoints facilita estudiar como evoluciona la politica a lo largo del entrenamiento, comparar Process-GRPO con GRPO estandar y analizar el colapso de la diversidad de busquedas.
- Atencion al cliente con acceso a herramientas: el modelo puede consultar un sistema de tickets o un CRM via tool calling y responder con informacion actualizada, siempre que se le proporcione el formato de herramienta esperado.
- Evaluacion de pipelines de agentes: sirve como politica de referencia en entornos de evaluacion multi-turno donde se mide exito de tarea, numero de busquedas y precision por turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas internas de entrenamiento en el paso 400:

| Metrica de entrenamiento | Valor |
|---|---|
| Puntuacion media de recompensa de proceso | ~0,93 |
| Busquedas por trayectoria | ~2,6 |
| Precision en el lote de entrenamiento | ~0,49 |

Estas cifras corresponden al propio proceso de entrenamiento y no equivalen a resultados de evaluacion independiente.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 14-15 GB solo para los pesos, mas cache KV. Con 2048 tokens de contexto el coste adicional de cache es moderado (del orden de decimas de GB con atencion estandar).
- Cuantizacion de 8 bits: aproximadamente 7-8 GB de VRAM. Cuantizacion de 4 bits: aproximadamente 4-5 GB. Ninguna de estas cuantizaciones se publica en el repositorio, por lo que habria que generarlas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto corto, y con holgura si se cuantiza. Una RTX 4070 Ti (12 GB) requeriria cuantizacion de 4 u 8 bits.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB para lotes grandes y contexto largo; L40S o A6000 como alternativas de coste medio.
- Opciones de despliegue: vLLM, TGI y SGLang son las opciones naturales al ser pesos safetensors con transformers. Ollama o llama.cpp requeririan convertir a GGUF, conversion no publicada por el autor.
- Espacio en disco: tener en cuenta que el repositorio completo ocupa 291,9 GB por los 19 checkpoints. Para descargar solo la politica final conviene filtrar archivos y evitar traer las subcarpetas `step_*`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Webshop-Olmo3-7B-Outcome-2048 | ~7B | No disponible | Process-GRPO sobre Olmo-3-7B-Instruct | apache-2.0 | Pesos safetensors, 20 checkpoints |
| allenai/Olmo-3-7B-Instruct | ~7B | No disponible en esta ficha | SFT/instruccion del modelo base | No verificada aqui | Modelo base publico |
| Search-R1 (referencia metodologica) | Configuraciones de 3B a 7B | No disponible | GRPO con recompensa de resultado sobre modelos Qwen | No disponible | Implementacion de referencia, no un unico checkpoint |
| Modelos de agente de busqueda con recompensa de proceso | No disponible | No disponible | Variantes de RL con verificador | No disponible | No disponible |

La comparacion cuantitativa no es posible con la informacion disponible: no hay benchmarks publicados de este checkpoint ni cifras comparables de las alternativas en este repositorio.

## Limitaciones y advertencias

- Modelo de 7B: la capacidad de razonamiento y de conocimiento parametrico esta acotada por el tamano, y el grueso del rendimiento depende de la calidad de la herramienta de busqueda conectada.
- Dependencia fuerte del formato: fue entrenado con el esquema Search-R1; fuera de ese formato de turnos y etiquetas de herramienta el comportamiento puede degradarse.
- Precision de entrenamiento reportada de ~0,49: aproximadamente la mitad del lote no se resuelve correctamente, lo que anticipa errores en produccion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar contenido cuando los resultados de la herramienta son ambiguos o vacios; no se documentan mecanismos de abtencion.
- Idiomas soportados no documentados; no hay garantia de comportamiento correcto en castellano ni en otros idiomas distintos del usado en el entrenamiento.
- Repositorio muy pesado (291,9 GB): riesgo de descargas accidentales completas si no se filtran las subcarpetas de checkpoints.
- Sin cuantizaciones oficiales publicadas, lo que obliga a generarlas y validarlas por cuenta propia para despliegue en hardware limitado.
- Sin descargas ni validacion externa en el momento de la consulta; se trata de un artefacto de investigacion no contrastado por terceros.
- Licencia apache-2.0 declarada en el repositorio, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base allenai/Olmo-3-7B-Instruct y las condiciones de los datos de entrenamiento utilizados.
- No se especifica la composicion del dataset de RL, por lo que no puede evaluarse el sesgo ni la cobertura de dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/Webshop-Olmo3-7B-Outcome-2048
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Paper de GRPO (referencia metodologica): no disponible en la informacion proporcionada
- Repositorio de Search-R1: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo (los resultados obtenidos trataban sobre remezclas musicales), por lo que no se han podido anadir enlaces adicionales verificados.
