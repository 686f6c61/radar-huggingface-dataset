# theatechcorporation/amaara-code-flash-v8-GGUF

## Resumen

Amaara Code Flash v8 es un ajuste fino (fine-tune) orientado a agentes de programación y tool calling, desarrollado por theatechcorporation (A-TECH) sobre el modelo base GLM-4.7-Flash de Zhipu AI, en su versión cuantizada publicada por Unsloth. El modelo conserva la arquitectura MoE del original, con 31.221.488.576 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo sitúa en la gama de modelos de razonamiento con coste de inferencia relativamente bajo pese a su tamaño total.

El objetivo declarado del autor es producir un agente de código capaz de ejecutar ciclos de edición, prueba y autocorrección (edit→test→pass) dentro de un CLI propio, A-Coder-CLI. Para ello, el entrenamiento se realizó sobre un corpus canónico de conversaciones compartido entre todas las variantes de la familia Amaara Code, seleccionando trayectorias verificadas y descartando las trazas de edición sin verificación posterior.

La relevancia del modelo es acotada: se publica únicamente en formato GGUF, con licencia propia acumulativa sobre la licencia MIT del modelo base, sin resultados de benchmarks numéricos en la model card y sin métricas de rendimiento publicadas en la información disponible. Es, por tanto, un artefacto de nicho para despliegue local de agentes de código más que una alternativa generalista validada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de GLM-4.7-Flash |
| Parámetros totales | 31.221.488.576 (31,2 B) |
| Parámetros activos | ~3 B (dato declarado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio se distribuye en formato GGUF; los niveles concretos no se detallan) |
| Idiomas soportados | no disponible |
| Licencia | a-tech-model-license-plus-upstream (A-TECH Model License acumulada a la licencia MIT del modelo base) |
| Formato de pesos | GGUF (repositorio etiquetado también como transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-4.7-Flash: un transformer con mezcla de expertos de 31,2 B de parámetros totales y aproximadamente 3 B activos por token, lo que reduce el coste computacional por paso de decodificación frente a un modelo denso del mismo tamaño. El repositorio distribuido es una cuantización GGUF del ajuste fino, no los pesos originales en precisión completa.

El entrenamiento se realizó sobre un corpus canónico de conversaciones compartido por toda la familia Amaara Code (variantes de 4 B, 20 B y esta de 31 B), diferenciándose únicamente en la plantilla de chat por arquitectura: plantilla GLM en este caso, Qwen ChatML en el modelo de 4 B y Harmony en el de 20 B. La selección de datos se hizo por forma de trayectoria: se conservan las trazas verificadas de edición→prueba→éxito y de autocorrección, se descartan las de edición sin verificación y las trazas largas se recortan en ventanas alrededor de la cola de verificación en lugar de eliminarse. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de código y edición de ficheros dentro de un bucle de agente (lectura, parcheo, ejecución de pruebas).
- Tool calling y function calling, capacidad heredada del modelo base y reforzada en el ajuste fino.
- Razonamiento multi-paso con autocorrección: el corpus de entrenamiento prioriza trazas de corrección tras fallo de pruebas.
- Ejecución de trayectorias de tipo SWE-bench: localización del fallo, edición y verificación.
- Conversación multi-turno con plantilla de chat específica de GLM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de resolución de incidencias en repositorios: el modelo puede integrarse en un CLI que reciba un issue, localice los ficheros afectados, aplique un parche y ejecute la suite de pruebas, aprovechando su entrenamiento específico en trazas edit→test→pass.
- Automatización de refactorizaciones verificadas: en pipelines de CI, el modelo propone cambios y el propio pipeline valida con tests; las trazas de autocorrección del entrenamiento reducen la probabilidad de parches que se quedan a medias.
- Asistente de código en terminal para equipos con requisitos de soberanía de datos: al distribuirse en GGUF, puede ejecutarse en infraestructura propia sin llamadas a APIs externas.
- Generación de parches en lote sobre bases de código legacy: el formato GGUF permite desplegarlo con llama.cpp u Ollama en servidores modestos gracias a sus ~3 B de parámetros activos.
- Integración en herramientas de revisión automática de pull requests: el modelo puede invocar funciones de lectura de diff y de ejecución de tests como herramientas, y comentar el resultado.
- Experimentación en investigación sobre agentes de código: la familia Amaara comparte corpus entre tamaños, lo que permite comparar el efecto del tamaño (4 B, 20 B, 31 B) manteniendo los datos constantes, según declara el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que la evaluación se realizó con A-Coder-CLI sobre una suite de 20 tareas derivada de SWE-bench, con 3 ejecuciones por tarea y bootstrap agrupado por tarea, y remite al "training logbook" de Amaara para los resultados medidos, sin incluirlos en la ficha del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que no se detallan los niveles de cuantización publicados. Como referencia de orden de magnitud, un modelo de 31,2 B en GGUF de 4 bits requiere del orden de 18-20 GB de VRAM o memoria unificada; el repositorio completo ocupa 33,2 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un despliegue en precisión reducida encajaría en GPUs de 24 GB (RTX 3090/4090) y en GPUs de datacenter (A100, H100) para mayor throughput.
- GPU de consumo: previsiblemente viable en RTX 3090/4090 con cuantización de 4 bits, sujeto a confirmación de los niveles GGUF publicados.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; el repositorio está etiquetado como compatible con endpoints y como transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Amaara Code Flash v8 | 31,2 B | ~3 B | no disponible | A-TECH + MIT upstream | GGUF | Fine-tune de código y tool calling |
| GLM-4.7-Flash (base) | 31,2 B | ~3 B | no disponible | MIT (según la model card) | no disponible | Modelo original de Zhipu AI |
| Otras variantes Amaara Code (4 B, 20 B) | 4 B / 20 B | no disponible | no disponible | A-TECH + upstream | no disponible | Mismo corpus, distinta plantilla de chat |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados en la ficha del repositorio; el rendimiento real frente al modelo base no está cuantificado de forma verificable.
- El ajuste fino está especializado en agentes de código y tool calling; su comportamiento en tareas generales de lenguaje puede degradarse respecto al GLM-4.7-Flash original.
- Riesgo de alucinación en la generación de parches y en la invocación de herramientas; se recomienda validación con tests y sandboxing de la ejecución.
- Idiomas soportados no documentados; no se garantiza un comportamiento adecuado en castellano.
- Licencia acumulativa: la A-TECH Model License se aplica además de la MIT del modelo base, con posibles restricciones adicionales para uso comercial que deben revisarse antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Solo se distribuye en GGUF; no hay pesos en safetensors ni información sobre cuantizaciones disponibles.
- El modelo se apoya en una plantilla de chat específica de GLM; usar otra plantilla puede degradar el rendimiento del agente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-flash-v8-GGUF
- Modelo base cuantizado: https://huggingface.co/unsloth/GLM-4.7-Flash
- Licencia A-TECH: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- Herramienta de evaluación A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- Comunidad AI Owner's Club: https://www.skool.com/open-source-ai-builders-club/about
