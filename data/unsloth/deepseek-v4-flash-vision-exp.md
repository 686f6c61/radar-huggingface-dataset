# unsloth/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es un modelo multimodal experimental desarrollado por DeepSeek, que amplía la arquitectura de DeepSeek-V4-Flash con módulos de visión para desbloquear capacidades de comprensión visual. Es el primer modelo multimodal de la familia DeepSeek-V4 y está diseñado específicamente para tareas de agente multimodal, como interpretación de capturas de pantalla, análisis de gráficos y razonamiento visual complejo.

El modelo mantiene un rendimiento comparable al de DeepSeek-V4-Flash-0731 en tareas de agente solo de texto, mientras que mejora sustancialmente las capacidades de agente multimodal, superando al modelo anterior en benchmarks como ApexBench (36,5 frente a 26,2) y Agents' Last Exam (27,3 frente a 25,2). Con 304,6 mil millones de parámetros en arquitectura MoE, el modelo está disponible bajo licencia MIT y se distribuye en formato safetensors, con una versión cuantizada en FP8 publicada por Unsloth.

La versión de Unsloth incluye la tecnología Dynamic 2.0 para cuantización GGUF, que según sus creadores logra una precisión superior a otras cuantizaciones líderes. El modelo se publicó el 31 de agosto de 2026 y está disponible para su uso a través de la API de DeepSeek y para ejecución local mediante el framework de inferencia de referencia incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con Hyper-Connections, DFlash attention, DSpark forward path, vision encoder y aligner |
| Parametros totales | 304.646.824.126 (304,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (version de Unsloth), GGUF Dynamic 2.0 (mencionado en la documentacion de Unsloth) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (shards), GGUF (via Unsloth Dynamic 2.0) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash-Vision-Exp se construye sobre la arquitectura DeepSeek-V4-Flash, incorporando un codificador de visión y un alineador multimodal. La arquitectura combina atención DFlash, capas MoE, Hyper-Connections y la ruta de avance DSpark, que segun la documentacion de Unsloth permite una inferencia entre 1,5 y 1,9 veces mas rapida. El modelo ha pasado por un entrenamiento continuado para desbloquear capacidades de comprension visual, manteniendo a la vez el rendimiento en tareas de texto.

El repositorio incluye una implementacion de referencia de inferencia en PyTorch que cubre el codificador de vision, el alineador, la atencion DFlash, el MoE, las Hyper-Connections y la ruta DSpark. El prompt encoding soporta tanto bloques de contenido estilo OpenAI como la notacion compacta `<image>path</image>`, y ambos formatos producen prompts y token IDs identicos. No se han publicado detalles sobre la composicion del dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO.

## Capacidades

- Comprension multimodal: acepta entradas de texto e imagenes simultaneamente, incluyendo capturas de pantalla, graficos, diagramas y documentos visuales.
- Razonamiento de agente multimodal: capacidad para interpretar elementos visuales en tareas de agente, como se demuestra en ApexBench y Agents' Last Exam.
- Tareas de agente de texto: mantiene un rendimiento comparable al de DeepSeek-V4-Flash-0731 en benchmarks como Terminal Bench, Cybergym y Toolathlon.
- Analisis de graficos: puntuacion de 64,3 en Chartography, lo que indica capacidad para interpretar y razonar sobre datos visualizados.
- Razonamiento visual avanzado: 35,0 en ZeroBench (Pass@5), un benchmark disenado para evaluar el razonamiento visual complejo.
- OCR y comprension de documentos: el modelo puede procesar imagenes con texto, como se indica en los casos de uso publicados por iweaver.ai.
- Integracion con DeepSeek Harness: soporte nativo en el framework de agentes de DeepSeek, con modo de razonamiento `max` y configuracion de temperatura 1,0 y top_p 0,95.

## Casos de uso

- Analisis de capturas de pantalla para automatizacion de pruebas: el modelo puede interpretar elementos visuales de interfaces de usuario y ejecutar acciones basadas en ellos, lo que lo hace adecuado para pipelines de testing automatizado de aplicaciones web y moviles.
- Asistencia de codigo con contexto visual: un desarrollador puede enviar una captura de pantalla de un error de interfaz junto con el codigo relevante, y el modelo puede diagnosticar el problema combinando informacion visual y textual.
- Analisis de graficos financieros: el modelo puede procesar graficos de cotizaciones o informes visuales y generar resumenes o detectar patrones, gracias a su puntuacion de 64,3 en Chartography.
- Agentes de automatizacion de tareas de escritorio: con su capacidad para entender interfaces visuales, puede operar herramientas de escritorio, rellenar formularios o navegar por aplicaciones siguiendo instrucciones de alto nivel.
- Extraccion de informacion de documentos escaneados: el modelo puede realizar tareas tipo OCR en documentos con texto e imagenes, extrayendo datos estructurados para su posterior procesamiento.
- Razonamiento cientifico multimodal: en entornos de investigacion, puede analizar figuras de articulos cientificos, diagramas de arquitectura o resultados experimentales visualizados, combinando esa informacion con el contexto textual.
- Desarrollo de agentes de navegacion web: el modelo puede interpretar paginas web completas (no solo el HTML) y tomar decisiones de navegacion basadas en la apariencia visual, lo que resulta util para agentes autonomos de compra o investigacion.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks comparativos entre DeepSeek-V4-Flash-Vision-Exp, DeepSeek-V4-Flash-0731 y Opus-4.8:

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (Public) | 25,7 | 25,1 | 27,2 |
| ApexBench (Pass@1) | 36,5 | 26,2† | 39,4 |
| Agents' Last Exam | 27,3 | 25,2† | 25,7 |
| Chartography | 64,3 | - | 65,0 |
| ZeroBench (Pass@5) | 35,0 | - | 34,0 |

Nota: † indica que DeepSeek-V4-Flash-0731 ignora los elementos multimodales en la entrada. Los benchmarks de texto se evaluaron con DeepSeek Harness en modo minimo, con nivel de razonamiento `max`, temperatura 1,0 y top_p 0,95.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 304,6 mil millones de parametros, se estima que la inferencia en FP8 requeriria aproximadamente 305 GB de VRAM, lo que excede la capacidad de cualquier GPU consumer actual.
- GPU recomendadas: no disponible. Por el tamano del modelo, se requieren configuraciones multi-GPU con GPUs de datacenter como A100 80 GB o H100. Una configuracion tipica necesitaria al menos 4-8 GPUs.
- No cabe en GPUs de consumo: el modelo es demasiado grande para RTX 4090, RTX 5090 o similares, incluso con cuantizacion agresiva.
- Opciones de despliegue: el repositorio incluye una implementacion de inferencia en PyTorch. Unsloth soporta DSpark para acelerar la inferencia entre 1,5 y 1,9 veces. Tambien esta disponible la API de DeepSeek para acceso gestionado.
- Latencia y throughput: no disponible. La documentacion de Unsloth menciona que DSpark permite una inferencia 1,5-1,9 veces mas rapida, pero no se proporcionan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp | 304,6 B (MoE) | no disponible | Si | MIT | Hugging Face, API DeepSeek |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | No | MIT | Hugging Face, API DeepSeek |
| Opus-4.8 | no disponible | no disponible | Si (implícito) | no disponible | no disponible |

El modelo supera a DeepSeek-V4-Flash-0731 en la mayoria de benchmarks de agente de texto (Terminal Bench, NL2Repo, DeepSWE, Toolathlon, DSBench-Hard) y en todos los benchmarks multimodales. Frente a Opus-4.8, el modelo de DeepSeek es superior en DeepSWE (59,3 frente a 58,0), Agents' Last Exam (27,3 frente a 25,7) y ZeroBench (35,0 frente a 34,0), pero inferior en el resto de benchmarks comparados.

## Limitaciones y advertencias

- Modelo experimental: la propia denominacion "Exp" indica que es una version experimental, no un lanzamiento estable. Puede haber cambios significativos en versiones futuras.
- Sesgos y alucinacion: no se ha publicado informacion sobre evaluaciones de sesgos o tasas de alucinacion para este modelo especifico.
- Idiomas soportados: no se ha publicado informacion sobre la cobertura de idiomas. DeepSeek suele priorizar chino e ingles, pero no se confirma para este modelo.
- Requisitos de hardware elevados: con 304,6 B de parametros, el despliegue local requiere infraestructura de datacenter. No es viable en hardware de consumo.
- Rendimiento en AutomationBench: la puntuacion de 25,7 es notablemente baja en comparacion con otros benchmarks, lo que sugiere limitaciones en tareas de automatizacion de procesos.
- Informacion de entrenamiento limitada: no se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineamiento utilizadas.
- Licencia MIT: aunque permisiva, es responsabilidad del usuario verificar el cumplimiento de la licencia en su jurisdiccion y caso de uso especifico.

## Enlaces

- Repositorio de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Flash-Vision-Exp
- Repositorio original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- DeepSeek-V4-Flash (modelo base): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Version de Unsloth de DeepSeek-V4-Flash: https://huggingface.co/unsloth/DeepSeek-V4-Flash
- Documentacion de Unsloth sobre DeepSeek-V4: https://unsloth.ai/docs/models/deepseek-v4
- Analisis de ExplainX: https://explainx.ai/blog/deepseek-v4-flash-vision-exp-multimodal-agent-august-2026
- Analisis de iWeaver: https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
