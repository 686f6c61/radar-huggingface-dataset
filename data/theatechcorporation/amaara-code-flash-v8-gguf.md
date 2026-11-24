# theatechcorporation/amaara-code-flash-v8-GGUF

## Resumen

Amaara Code Flash v8 es un modelo de lenguaje especializado en agentes de programación y *function calling*, desarrollado por The A Tech Corporation (theatechcorporation) y publicado en Hugging Face. Se trata de un ajuste fino (*fine-tune*) del modelo base `unsloth/GLM-4.7-Flash`, una arquitectura MoE (*Mixture of Experts*) de 31.221.488.576 parámetros totales (aproximadamente 31,2B) con unos 3B parámetros activos, según indica la model card del autor. El modelo está orientado a tareas de edición de código, verificación mediante tests y autocorrección dentro de flujos agénticos.

La propuesta diferencial del autor es que todos los modelos de la familia Amaara Code (tamaños 4B, 20B y este de 31B) se entrenan a partir del mismo corpus canónico de conversaciones, variando únicamente la plantilla de chat por arquitectura (GLM en este caso, Qwen ChatML en el 4B y Harmony en el 20B). Esto permite, según el autor, comparaciones entre tamaños atribuibles al modelo y no a los datos. La selección de datos se hace por "forma de trayectoria": se conservan trazas verificadas de edición→test→éxito y de autocorrección, se descartan las trazas de edición sin verificación y las trazas largas se recortan en ventana alrededor de la cola de edición→verificación.

El modelo se distribuye en formato GGUF (el repositorio ocupa 173,9 GB) y se publica como versión experimental, con una advertencia explícita del autor de no usarlo en producción. La licencia es una licencia propia (A-TECH Model License) que se aplica de forma adicional a la licencia MIT del modelo base. Es relevante ahora porque combina un modelo base MoE eficiente en cómputo (3B activos sobre 31B totales) con un ajuste específico para agentes de código, un nicho donde la mayoría de las alternativas abiertas son modelos densos de mayor coste de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), basada en GLM-4.7-Flash |
| Parametros totales | 31.221.488.576 (~31,2B) |
| Parametros activos | ~3B (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio contiene pesos en formato GGUF; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | a-tech-model-license-plus-upstream (A-TECH Model License + MIT del modelo base) |
| Formato de pesos | GGUF (librería declarada: transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `unsloth/GLM-4.7-Flash`: un transformer con capas MoE, con 31,2B parámetros totales y aproximadamente 3B activos por token. Esta configuración permite un coste de inferencia mucho menor que un modelo denso de tamaño comparable, a cambio de un mayor consumo de memoria para almacenar todos los expertos. El ajuste fino se realizó sobre el mismo corpus canónico de conversaciones que el resto de la familia Amaara Code, con plantilla de chat específica para la arquitectura GLM.

El entrenamiento se centra en trayectorias de agente de código: el autor describe un filtrado por "forma de trayectoria" en el que se conservan exclusivamente las trazas verificadas de edición→test→éxito y las trazas de autocorrección, se eliminan las trazas de edición sin verificación posterior y las trazas largas se truncan en ventana alrededor de la cola de edición→verificación en lugar de descartarse. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal, etc.) más allá de lo que aporte el modelo base.

## Capacidades

- Generación de código y edición de ficheros dentro de flujos agénticos (edición→test→verificación).
- *Function calling* / *tool calling*, indicado explícitamente en las etiquetas del repositorio.
- Comportamiento de agente multi-paso con autocorrección ante fallos de tests.
- Razonamiento sobre trazas de conversación multi-turno (según el formato de datos de entrenamiento descrito).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking* explícito, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agente de corrección de bugs en CI: el modelo puede recibir el fallo de una suite de tests, localizar el fichero afectado, proponer un parche y reejecutar la verificación, aprovechando su entrenamiento en trazas edit→test→pass.
- Asistente de refactorización guiada por tests: integrado en un pipeline que ejecuta la suite tras cada edición, el modelo itera hasta que los tests pasan, con capacidad de autocorrección descrita por el autor.
- Automatización de tareas de mantenimiento de repositorios: actualización de dependencias, migraciones de API y ajustes de *linters*, con *tool calling* para invocar comandos de shell y editar ficheros.
- Generación de parches en revisión de código: el modelo propone cambios acotados a partir de un *issue* y un contexto de repositorio, útil como primer borrador para revisión humana.
- Agente de soporte a desarrolladores en IDE: conversaciones multi-turno con contexto de código y ejecución de herramientas para consultar documentación o tests.
- Evaluación comparativa de modelos de código: al compartir corpus con las variantes 4B y 20B de Amaara Code, sirve para estudiar el efecto del tamaño y la arquitectura en tareas agénticas bajo datos controlados.

## Benchmarks y rendimiento

El autor indica que la evaluación se realizó con A-Coder-CLI sobre una suite derivada de SWE-bench de 20 tareas, con 3 ejecuciones por tarea y *bootstrap* agrupado por tareas, y remite al "Amaara training logbook" para los resultados medidos. Sin embargo, en la información proporcionada no se incluyen cifras concretas de benchmarks.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 31,2B parámetros totales, en FP16 se requieren aproximadamente 62 GB solo para pesos; en cuantizaciones GGUF de 8 bits, alrededor de 33-35 GB; en 4 bits, en torno a 18-20 GB, más el *overhead* de contexto y caché KV.
- GPU recomendadas: A100 80 GB o H100 para FP16/BF16; A100 40 GB o L40S para cuantización de 8 bits; RTX 4090 (24 GB) viable en cuantización de 4 bits con contexto moderado.
- GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) usando GGUF de 4 bits; en 16 GB probablemente no quepa con contexto útil.
- Despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI si se dispone de pesos en safetensors (no confirmado en este repositorio); el repositorio declara compatibilidad con *endpoints*.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos, el throughput esperado es superior al de un modelo denso de 31B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amaara Code Flash v8 | ~31,2B | ~3B | no disponible | A-TECH + MIT | GGUF en HF |
| GLM-4.7-Flash (base) | ~31,2B | ~3B | no disponible | no disponible | HF (unsloth) |
| Amaara Code 4B | ~4B | denso (no confirmado) | no disponible | A-TECH + upstream | HF |
| Amaara Code 20B | ~20B | no disponible | no disponible | A-TECH + upstream | HF |

La comparación con alternativas externas de la misma categoría (agentes de código) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento ni especificaciones de competidores.

## Limitaciones y advertencias

- Versión experimental: el autor advierte explícitamente de que no debe usarse en producción hasta que se publiquen las versiones oficiales.
- Licencia: la A-TECH Model License se aplica de forma adicional a la MIT del modelo base; es necesario revisar sus términos para uso comercial, ya que puede imponer restricciones no presentes en la licencia upstream.
- Idiomas soportados no documentados; el comportamiento fuera del inglés (y del castellano) no está verificado.
- Longitud de contexto no documentada; el rendimiento en contextos largos de repositorio es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en tareas de código donde una edición incorrecta puede pasar desapercibida si no se ejecutan tests.
- Sesgos: no documentados por el autor.
- El corpus de entrenamiento está sesgado hacia trayectorias de edición con verificación mediante tests; tareas sin tests automatizados pueden quedar fuera de distribución.
- Tamaño del repositorio (173,9 GB) elevado para descarga y almacenamiento, derivado de incluir múltiples cuantizaciones GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-flash-v8-GGUF
- Modelo base: https://huggingface.co/unsloth/GLM-4.7-Flash
- Licencia A-TECH: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- Herramienta de evaluación A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- Comunidad AI Owner's Club: https://www.skool.com/open-source-ai-builders-club/about
