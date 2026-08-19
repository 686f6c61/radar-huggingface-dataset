# XXMiner/soma-cot-compression

## Resumen

XXMiner/soma-cot-compression es un paquete de algoritmos de compresión de cadenas de pensamiento (Chain-of-Thought, CoT) desarrollado para el subnet SOMA de Bittensor (subnet 114). No se trata de un modelo de lenguaje, sino de un conjunto de 15 estrategias de compresión de contexto diseñadas para reducir el número de tokens que los agentes de IA envían al modelo, recortando así el coste de inferencia sin degradar la calidad de las respuestas. El autor, XXMiner, lo publicó en HuggingFace el 16 de agosto de 2026 con licencia MIT.

El paquete incluye compresores especializados con distintos perfiles de compresión: desde una reducción del 99,04% orientada a velocidad hasta compresores que preservan información crítica de depuración (83,33%) o que mantienen conversaciones completas (modo preservación). Según la model card, la evaluación sobre 5 tareas de ejemplo (275.835 caracteres) muestra un ahorro de hasta 68.295 tokens con el compresor de máximo rendimiento. El proyecto se enmarca en la competición de compresión de CoT de SOMA, que busca reducir el coste de los agentes que usan herramientas, inspeccionan repositorios o ejecutan comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de lenguaje; es un conjunto de algoritmos de compresión en Python) |
| Parametros totales | No disponible (no aplica) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible (depende del modelo LLM al que se aplique la compresión) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible (la compresion es agnostica al idioma, pero no se especifican idiomas) |
| Licencia | MIT |
| Formato de pesos | No disponible (no aplica; el paquete se distribuye como codigo fuente Python) |

Informacion adicional relevante:

| Parametro | Valor |
|---|---|
| Numero de estrategias de compresion | 15 (3 especializadas, 4 moderadas, 8 variantes configurables) |
| Compresion maxima reportada | 99,04% (compresor Performance-Focused) |
| Compresion minima reportada | ~0% (modo preservacion, Dialogue-Focused) |
| Dependencias | Solo biblioteca estandar de Python; opcional tiktoken para conteo preciso de tokens |
| Fecha de publicacion | 2026-08-16 |

## Arquitectura y entrenamiento

Este paquete no es un modelo entrenado, sino una coleccion de algoritmos heuristicos de compresion implementados en Python puro. Cada compresor aplica reglas especificas sobre los mensajes de un agente: truncamiento con preservacion de inicio y fin, extraccion de errores y bloques de codigo, eliminacion de bloques `<thinking>...</thinking>`, puntuacion de importancia de mensajes (escala 0-10) y combinacion de multiples criterios. Los compresores moderados (Hybrid y Adaptive) combinan la eliminacion de cadenas de razonamiento con compresion adaptativa basada en la importancia de cada mensaje.

Segun la model card, el desarrollo se basa en tecnicas de 37 articulos de arXiv (2024-2026), incluyendo Direct Preference Optimization (DPO), Reinforcement Learning from Human Feedback (RLHF), Group Relative Policy Optimization (GRPO) y estrategias de compresion y truncamiento de contexto. No se detalla un proceso de entrenamiento especifico, ya que no hay pesos que optimizar; la "evaluacion" consiste en medir el porcentaje de compresion y el ahorro de tokens sobre un conjunto de tareas de prueba.

## Capacidades

- Compresion de contexto de agentes: reduce el numero de tokens enviados al LLM, recortando costes de inferencia.
- Tres compresores especializados de alta compresion:
  - Performance-Focused: 99,04% de compresion, truncamiento rapido con preservacion de inicio y fin.
  - Aggressive Hybrid: 94,77%, extrae solo errores, cambios de archivo y bloques de codigo.
  - Code-Focused: 83,33%, preserva trazas de pila, errores y bloques de codigo para depuracion.
- Cuatro compresores moderados: Hybrid (4,17%), Adaptive (4,17%), Dialogue-Focused (modo preservacion) y Thinking Strip (eliminacion de bloques de razonamiento explicito).
- Ocho variantes configurables mediante variables de entorno: permiten ajustar pesos semanticos, sesgo de recencia, numero de resultados de herramientas y pesos de errores o cambios de archivo.
- Integracion sencilla: funciones `compress_messages` que aceptan listas de mensajes con formato `{'role': ..., 'content': ...}`.
- Sin dependencias externas: solo biblioteca estandar de Python; tiktoken opcional para conteo de tokens.
- Compatible con el ecosistema SOMA/Bittensor: disenado para el subnet 114 y su competicion de compresion de CoT.

## Casos de uso

- Reduccion de costes en agentes de produccion: un agente que mantiene sesiones largas con herramientas puede usar el compresor Performance-Focused para reducir el historial a un 1% de su tamano original, recortando drásticamente el gasto en tokens sin perder el contexto inicial y final de la conversacion.
- Depuracion de codigo en pipelines de CI/CD: el compresor Code-Focused preserva trazas de pila, errores y bloques de codigo, permitiendo que un agente diagnostique fallos de compilacion o tests sin enviar todo el log al LLM.
- Optimizacion de logs de agentes autonomos: el compresor Aggressive Hybrid extrae solo informacion critica (errores, cambios de archivo, bloques de codigo) de logs extensos, ideal para entornos con restricciones severas de contexto o presupuesto.
- Compresion de historial de conversaciones en chatbots: el compresor Dialogue-Focused mantiene las preguntas del usuario y las respuestas clave, preservando la coherencia de interacciones multi-turno sin inflar el contexto.
- Eliminacion de razonamiento intermedio en modelos con "thinking mode": el compresor Thinking Strip elimina bloques `<thinking>...</thinking>` cuando el razonamiento explicito no es necesario para la respuesta final, reduciendo tokens sin afectar la salida.
- Ajuste fino de compresion para cargas de trabajo mixtas: las variantes configurables permiten equilibrar pesos semanticos, recencia y errores segun el tipo de contenido (por ejemplo, config5_aggressive_compress para entornos con muchos errores, o config8_edit_optimized para agentes que modifican archivos frecuentemente).

## Benchmarks y rendimiento

La model card reporta resultados de evaluacion sobre 5 tareas de ejemplo con un total de 275.835 caracteres:

| Compresor | Compresion | Ahorro de tokens | Uso recomendado |
|---|---|---|---|
| Performance-Focused | 99,04% | 68.295 | Velocidad |
| Aggressive Hybrid | 94,77% | 64.580 | Solo informacion critica |
| Code-Focused | 83,33% | 57.464 | Depuracion |
| Hybrid | 4,17% | 3.643 | Uso general |
| Adaptive | 4,17% | 3.641 | Contenido mixto |

No se han publicado resultados de benchmarks comparativos con otros compresores de contexto en la informacion disponible. Los datos presentados corresponden a un conjunto de prueba propio del autor y no estan verificados de forma independiente.

## Requisitos de hardware

- No requiere GPU: al ser un paquete de Python puro, se ejecuta en CPU con minimo consumo de recursos.
- RAM: no se especifica, pero al procesar listas de mensajes en memoria, el uso es proporcional al tamano del contexto; para contextos de cientos de miles de caracteres, unos pocos cientos de MB son suficientes.
- Almacenamiento: el paquete ocupa unos pocos KB (codigo fuente).
- Compatible con cualquier sistema que ejecute Python 3.x (no se especifica version minima).
- No requiere vLLM, llama.cpp, Ollama ni TGI; se integra directamente en el pipeline del agente antes de enviar los mensajes al LLM.
- Latencia: despreciable en comparacion con la inferencia del LLM; el compresor Performance-Focused esta disenado para minimo overhead de procesamiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros sistemas de compresion de contexto (como los compresores de SOMA oficiales o soluciones de terceros). El paquete compite dentro del subnet SOMA, pero no se publican metricas comparativas frente a alternativas externas.

## Limitaciones y advertencias

- La compresion agresiva (99% y 95%) puede perder informacion no critica que sea relevante para tareas complejas; el autor recomienda evaluar el impacto en cada caso de uso.
- Los porcentajes de compresion se basan en un conjunto de prueba de solo 5 tareas (275.835 caracteres), lo que no garantiza resultados similares en produccion con datos variados.
- No se especifican los criterios exactos de "importancia" ni los umbrales de puntuacion de los compresores Adaptive y Hybrid; la reproducibilidad puede verse afectada.
- El paquete no incluye evaluacion de calidad de las respuestas tras la compresion; solo mide reduccion de tokens, no si la tarea se completa correctamente.
- Al estar disenado para el subnet SOMA (Bittensor), su uso fuera de ese ecosistema puede requerir adaptaciones.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documentan sesgos ni riesgos de alucinacion, ya que no es un modelo generativo; sin embargo, la compresion puede inducir al LLM a rellenar huecos con informacion incorrecta si se elimina contexto esencial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/XXMiner/soma-cot-compression
- Sitio oficial de SOMA: https://thesoma.ai/
- Documentacion de SOMA sobre MCP: https://thesoma.ai/mcp
- Repositorio GitHub de SOMA (DendriteHQ/SOMA): https://github.com/DendriteHQ/SOMA
- Perfil de SOMA en X: https://x.com/somasubnet
- Articulo sobre SOMA SN114 en Tao Outsider: https://www.taooutsider.com/blog/soma-sn114-context-compression-bittensor/
