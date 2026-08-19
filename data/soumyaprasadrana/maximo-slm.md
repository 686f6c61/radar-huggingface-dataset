# soumyaprasadrana/maximo-slm

## Resumen

MaximoSLM es un pequeño modelo de lenguaje (SLM) de solo lectura, desarrollado por Soumya Prasad Rana, que actúa como interfaz de lenguaje natural para el sistema de gestión de activos IBM Maximo. Se trata de un adaptador QLoRA sobre el modelo base Qwen/Qwen2.5-7B-Instruct, entrenado específicamente para que un agente pueda consultar metadatos y registros de Maximo a través de un servidor MCP (Model Context Protocol) sin necesidad de enviar un prompt de sistema extenso que describa todo el catálogo de objetos.

El modelo resuelve el problema de la complejidad de las APIs de Maximo: en lugar de que el agente tenga que conocer la estructura completa de los objetos de negocio, el modelo genera llamadas a herramientas MCP específicas (`maximo_get_metadata`, `os_query_builder`, `ws_load`, `ws_get_records`, `ws_get_active`) que permiten inspeccionar metadatos, construir consultas y cargar registros. Es una solución ligera pensada para ejecutarse en un portátil, sin necesidad de infraestructura de servidor dedicada.

Su relevancia actual radica en que demuestra un patrón práctico de especialización de modelos pequeños para dominios verticales mediante QLoRA, combinado con el estándar MCP para integración con sistemas empresariales. Está en fase de investigación temprana (fase 1) y no está afiliado a IBM. La arquitectura es la de Qwen2.5-7B-Instruct (transformador decoder-only) con adaptadores LoRA en las capas de atención y MLP, con un tamaño total de 7.615.616.512 parámetros y una longitud de contexto de entrenamiento de 1536 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (transformador decoder-only) con adaptadores QLoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1536 tokens) |
| Tipos de cuantizacion | GGUF Q5_K_M (para Ollama); adaptadores en 4-bit (QLoRA) |
| Idiomas soportados | no disponible (heredados de Qwen2.5-7B-Instruct, que soporta chino e ingles, pero no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores) y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformador decoder-only estándar con atención causal y normalización RMSNorm. Sobre esta base se aplican adaptadores QLoRA entrenados con Unsloth en precisión 4-bit, con r=32 y alpha=32, dirigidos a las proyecciones q, k, v, o, gate, up y down. Las capas `embed_tokens` y `lm_head` no se entrenan, lo que reduce el coste de ajuste y el riesgo de degradación del vocabulario.

El entrenamiento se realizó durante una única época con secuencias de 1536 tokens y pérdida calculada únicamente sobre las respuestas del asistente. El formato de chat empleado es el nativo de Qwen2.5-Instruct con etiquetas de pensamiento (`<thinking>`) y generación de JSON de llamada a herramienta (`<tool_call>`), lo que permite al modelo razonar sobre la consulta antes de emitir la llamada MCP. No se han publicado detalles del dataset de entrenamiento ni del número total de tokens utilizados.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-7B-Instruct.
- Llamada a herramientas (tool calling) especifica para el dominio Maximo, con cinco herramientas MCP: `maximo_get_metadata`, `os_query_builder`, `ws_load`, `ws_get_records` y `ws_get_active`.
- Razonamiento multi-paso para construir consultas: el modelo puede encadenar llamadas (por ejemplo, obtener metadatos, construir una consulta y cargar registros) siguiendo el patron `maximo_get_metadata -> os_query_builder -> ws_load`.
- Seleccion de estructura de objeto, filtros, lista de seleccion y ordenacion dentro de la consulta.
- Capacidad multilingue heredada del modelo base (no confirmada para este adaptador).
- Sin soporte de vision, audio ni otras modalidades.
- Solo lectura: no puede crear, actualizar, eliminar registros ni ejecutar flujos de trabajo.

## Casos de uso

- Consulta de metadatos de objetos de negocio: un agente puede preguntar "que campos tiene la tabla de ordenes de trabajo" y el modelo genera la llamada `maximo_get_metadata` para obtener la estructura.
- Construccion de consultas en lenguaje natural: el usuario describe un filtro ("activos con prioridad alta") y el modelo genera el payload JSON para `os_query_builder` con los criterios correctos.
- Carga de registros con seleccion de campos: el modelo elige la lista de atributos a recuperar y los ordena, usando `ws_load` con `useLean true` para reducir el volumen de datos.
- Asistente para tecnicos de mantenimiento: un tecnico en campo puede preguntar por el estado de una orden de trabajo o el historial de un activo, y el agente responde consultando Maximo en tiempo real.
- Auditoria de inventario: consultar el numero total de registros que cumplen cierta condicion, usando `meta.totalCount` en lugar del tamano de pagina.
- Integracion con asistentes MCP en portatiles: el modelo esta disenado para ejecutarse en un portatil con Ollama (formato GGUF Q5_K_M) o con Unsloth, permitiendo prototipos rapidos sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia con adaptadores QLoRA: se requiere una GPU con al menos 8-12 GB de VRAM para cargar el modelo base en 4-bit junto con los adaptadores. Unsloth permite optimizar el uso de memoria.
- Inferencia con GGUF Q5_K_M: puede ejecutarse en CPU mediante Ollama, aunque se recomienda una GPU para latencias aceptables. Una RTX 3060 de 12 GB o superior es suficiente.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o similares con al menos 16 GB de VRAM para comodidad.
- Opciones de despliegue: Ollama (con el Modelfile incluido), Unsloth para carga de adaptadores en Python, y potencialmente vLLM si se fusionan los pesos.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen/Qwen2.5-7B-Instruct (base) | 7.6B | 32K (original) | Apache-2.0 | Generalista, sin adaptacion a Maximo |
| MaximoSLM (este modelo) | 7.6B | no disponible (entrenado con 1536) | Apache-2.0 | Adaptado a consultas de solo lectura en IBM Maximo |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Generalista, sin adaptacion a Maximo |

La comparacion directa con otros modelos especializados en dominios verticales no esta disponible. La diferencia principal frente al modelo base es la capacidad de generar llamadas a herramientas MCP de Maximo de forma fiable, aunque a costa de una ventana de contexto reducida en el entrenamiento.

## Limitaciones y advertencias

- Solo lectura en fase 1: no puede crear, actualizar, eliminar registros, cambiar estados ni ejecutar flujos de trabajo. El cliente MCP rechaza las herramientas de escritura.
- Riesgo de errores en UUIDs y filtros complejos: el autor advierte que el modelo de 7B puede equivocarse al transcribir identificadores y condiciones de filtrado. El cliente debe vincular el ultimo identificador de working set y reducir la carga de las herramientas.
- Expiración de working sets: las sesiones de trabajo expiran aproximadamente a los 10 minutos, por lo que el agente debe reconstruirlas y continuar.
- Dependencia de `meta.totalCount`: para responder a preguntas sobre cantidad de registros, el modelo debe usar este campo y no la longitud de pagina, lo que puede llevar a errores si no se sigue esta regla.
- Formato de ordenacion: `orderBy` requiere un prefijo `+` o `-`; el modelo puede omitirlo si no se entrena correctamente.
- No es un producto de IBM ni esta afiliado a la compania; es un proyecto de investigacion independiente.
- Sesgos y alucinaciones heredados del modelo base Qwen2.5-7B-Instruct, que pueden manifestarse en respuestas incorrectas sobre datos que no estan en el contexto.
- La licencia Apache-2.0 permite uso comercial, pero los nombres IBM y Maximo son marcas registradas de sus propietarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/soumyaprasadrana/maximo-slm
- Repositorio GitHub maximo-kit: https://github.com/soumyaprasadrana/maximo-kit
- Releases de maximo-kit: https://github.com/soumyaprasadrana/maximo-kit/releases
- Publicacion en LinkedIn sobre IA para IBM Maximo con MCP: https://www.linkedin.com/posts/soumya-prasad-rana-5a7a6b70_maximo-ibmmaximo-maximoapplicationsuite-activity-7445412554966773760-unuM
