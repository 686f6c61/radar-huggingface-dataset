# theatechcorporation/amaara-code-flash-v8-bf16

## Resumen

Amaara Code Flash v8 es un ajuste fino (fine-tune) experimental de GLM-4.7-Flash, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 31.200 millones de parametros totales y aproximadamente 3.000 millones activos por token. Lo desarrolla theatechcorporation, un autor independiente que publica bajo su propia licencia A-TECH, y esta orientado especificamente a tareas de agente de programacion con soporte de tool calling (function calling). El modelo se distribuye en formato BF16 (safetensors) a traves de la libreria transformers, con un repositorio de 62,5 GB.

El problema que aborda es el de los agentes de codigo que necesitan ejecutar ciclos de edicion, prueba y autocorreccion de forma fiable. Segun la model card, el entrenamiento se filtro por "forma de trayectoria": se conservaron las trazas verificadas de edicion, prueba y exito, y las autocorrecciones, mientras que se descartaron las trazas de edicion sin verificacion. El mismo corpus canonico de conversaciones se reutiliza en todas las variantes de la familia Amaara Code, cambiando solo la plantilla de chat segun la arquitectura, lo que permite comparar tamanos atribuyendo las diferencias al modelo y no a los datos.

Es relevante ahora por dos motivos. Primero, porque se apoya en GLM-4.7-Flash, un MoE de la familia GLM con solo ~3B parametros activos, lo que lo hace atractivo para inferencia economica. Segundo, porque el autor lo declara explicitamente como version experimental y desaconseja su uso en produccion, lo que condiciona cualquier evaluacion practica. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), tipo `glm4_moe_lite` |
| Parametros totales | 31,2 B (31.200 millones) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publicado es BF16; existen otras variantes en repositorios `amaara-code-flash-v8-*`) |
| Idiomas soportados | no disponible |
| Licencia | `a-tech-model-license-plus-upstream` (A-TECH Model Licence + licencia MIT upstream) |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts, etiquetado en Hugging Face como `glm4_moe_lite`, derivado de `unsloth/GLM-4.7-Flash`. Cuenta con 31,2 B de parametros totales y activa aproximadamente 3 B por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El repositorio publicado contiene los pesos en BF16 (62,5 GB), lo que es coherente con el tamano de parametros indicado.

El entrenamiento es un fine-tune sobre GLM-4.7-Flash orientado a comportamiento de agente de codigo. Segun la model card, todos los modelos de la familia Amaara Code se generan a partir de un unico almacen canonico de conversaciones, y solo cambia la plantilla de chat por arquitectura (plantilla GLM para este modelo, Qwen ChatML para la variante de 4B y Harmony para la de 20B). La seleccion de datos se hizo por forma de trayectoria: se conservaron las trazas verificadas de edicion, prueba y exito, y las autocorrecciones; se descartaron las trazas de edicion sin verificacion; y las trazas largas se recortaron con ventana alrededor del tramo final de edicion y verificacion en lugar de descartarse. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, con plantilla de chat especifica de la arquitectura GLM.
- Soporte de tool calling y function calling, segun los tags del repositorio y el enfasis de la model card.
- Comportamiento de agente de codigo: ciclos de edicion, ejecucion de pruebas y autocorreccion, derivados del filtrado por trayectorias verificadas.
- Razonamiento multi-paso orientado a tareas de ingenieria de software.
- Capacidad de integracion en entornos de linea de comandos mediante A-Coder-CLI, la herramienta usada por el autor para la evaluacion.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o modo de pensamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de refactorizacion en repositorios: el modelo puede recibir una tarea de cambio de codigo, aplicar ediciones y ejecutar la suite de pruebas para verificar el resultado, aprovechando el entrenamiento sobre trazas verificadas de edicion, prueba y exito.
- Correccion automatica de tests fallidos: dado un fallo de CI, el modelo propone un parche, lo aplica y reejecuta las pruebas, con capacidad de autocorreccion aprendida de las trazas conservadas.
- Integracion en pipelines de CI/CD mediante tool calling: el modelo puede invocar herramientas de compilacion, ejecucion de tests y control de versiones dentro de un flujo automatizado, siempre que se trate de un entorno de evaluacion y no de produccion.
- Asistente de programacion en CLI: uso a traves de A-Coder-CLI para tareas interactivas de edicion y verificacion sobre un arbol de codigo local.
- Generacion de parches en tareas tipo SWE-bench: el autor lo evalua sobre una suite derivada de SWE-bench de 20 tareas, por lo que es adecuado para experimentacion en resolucion de issues acotadas.
- Prototipado de agentes de codigo economicos: con solo ~3 B de parametros activos, sirve para experimentar con arquitecturas de agente en hardware modesto antes de escalar a modelos mayores.
- Evaluacion comparativa de plantillas de chat: al compartir corpus con las variantes de 4B y 20B, permite estudiar el efecto de la plantilla y del tamano en el comportamiento del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion se realiza con A-Coder-CLI sobre una suite derivada de SWE-bench de 20 tareas, con 3 ejecuciones por tarea y bootstrap agrupado por tareas, y remite al "Amaara training logbook" para los resultados medidos, sin incluir cifras en la propia tarjeta.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 62,5 GB solo para los pesos, mas memoria para el contexto y el estado de inferencia; en la practica requiere GPUs de 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- Cuantizacion: al ser un MoE con ~3 B activos, las versiones cuantizadas podrian reducir sustancialmente los requisitos, pero no se dispone de datos publicados sobre cuantizaciones disponibles ni sobre su calidad.
- GPU consumer: en BF16 no cabe en GPUs consumer de 24 GB (RTX 4090) ni de 48 GB; requeriria cuantizacion agresiva o descarga de expertos a CPU, sin datos publicados al respecto.
- Opciones de despliegue: transformers es la libreria declarada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Amaara Code Flash v8 | 31,2 B / ~3 B | no disponible | A-TECH + MIT upstream | Hugging Face, experimental |
| GLM-4.7-Flash (base) | no disponible | no disponible | no disponible | Hugging Face (unsloth) |
| Amaara Code (variante 4B) | ~4 B (denso, segun nombre) | no disponible | A-TECH + upstream | Hugging Face, experimental |
| Amaara Code (variante 20B) | ~20 B, plantilla Harmony | no disponible | A-TECH + upstream | Hugging Face, experimental |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de la misma categoria fuera de la familia Amaara.

## Limitaciones y advertencias

- Version experimental: el autor indica explicitamente que los pesos se publican solo para uso experimental y evaluacion, y que no deben usarse en produccion hasta que se publiquen las versiones oficiales.
- Licencia: la A-TECH Model Licence se aplica de forma adicional a la licencia MIT upstream; es necesario revisar ambas antes de cualquier uso, incluido el comercial.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de codigo, el riesgo principal es la generacion de parches plausibles pero incorrectos que superen verificaciones debiles.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la longitud de contexto ni los idiomas soportados.
- Trazabilidad de la evaluacion: los resultados remiten a un logbook externo y no se incluyen cifras en la model card, lo que dificulta la verificacion independiente.
- Madurez: con 66 descargas y 0 likes en el momento de la consulta, la adopcion y el escrutinio de la comunidad son muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-flash-v8-bf16
- Modelo base: https://huggingface.co/unsloth/GLM-4.7-Flash
- Licencia A-TECH: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- Herramienta de evaluacion A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- Comunidad AI Owner's Club (Skool): https://www.skool.com/open-source-ai-builders-club/about
