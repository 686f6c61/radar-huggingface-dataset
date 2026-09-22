# Zhongzhu/tunekv-toolathlon-qwen3.8-27b

## Resumen

TuneKV Toolathlon Qwen3.8-27B es un artefacto de ajuste de caché de prefijo (prefix KV) destilado, publicado por el usuario Zhongzhu en HuggingFace. No es un modelo completo: se distribuye como un conjunto de ficheros de rango (32 de atención completa y 96 GDN en formato de servicio con tensor parallelism 2, más los ficheros READY, ASSEMBLY.json y prefix_ids.json) que se ensamblan sobre el modelo base Qwen/Qwen3.8-27B, descrito en la propia model card como una arquitectura híbrida de 16 capas de atención completa (FA) y 48 capas GDN. El objetivo del ajuste es mejorar el comportamiento del modelo base en Toolathlon 46, un banco de tareas de agente que combina los entornos terminus-2 y Harbor.

El problema que aborda es la especialización de un modelo de aproximadamente 27 000 millones de parámetros en tareas de uso de herramientas sin reentrenar los pesos completos: el artefacto ocupa solo 0,2 GB. El método destila trayectorias exitosas del profesor GLM-5.3 (23 ensayos correctos que produjeron 265 filas de llamadas LLM, recontadas con el tokenizador de 27B) mediante entrenamiento por entropía cruzada sobre el prefijo KV. La receta publicada es concreta y reproducible: n_tune = 704 = align_down(745, 64), lr 3e-4 constante, 252 pasos, DP4/GA2 y semilla 42, con métricas registradas en Weights & Biases.

La relevancia del artefacto es doble. Por un lado, ejemplifica una vía de bajo coste para especializar agentes de tool calling (0,2 GB frente a decenas de gigabytes de un ajuste completo). Por otro, el resultado publicado es parcial: la model card indica que el modelo base obtiene 11/46 y describe el ajuste como "tuned", pero no explicita la cifra final en el extracto disponible, y el repositorio acumula 0 descargas y 0 likes, por lo que no existe validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de atención completa (FA) + 48 capas GDN en el modelo base; el artefacto es un prefijo KV ajustado, no pesos completos |
| Parametros totales | ~27 000 millones según la denominación del repositorio ("Qwen3.8-27B"); no confirmado en la model card |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (la evaluación cita "28000/4096" sin especificar su significado) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en formato propio de rango, no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | No es safetensors ni GGUF: ficheros de rango FA y GDN en formato de servicio TP2, más READY, ASSEMBLY.json y prefix_ids.json (0,2 GB) |

## Arquitectura y entrenamiento

El elemento ajustado es la caché de prefijo del modelo estudiante, un transformer híbrido que alterna 16 capas de atención completa con 48 capas GDN (atención lineal). El repositorio no contiene pesos: contiene el resultado de entrenar únicamente el prefijo KV, exportado en formato de servicio con tensor parallelism 2. Por eso el número de ficheros duplica el del modelo (32 FA y 96 GDN). El ensamblado final combina el estado FA/state1 entrenado con el estado conv state0 nativo, siguiendo la receta denominada MCPU-V6 y detallada en ASSEMBLY.json.

El entrenamiento es una destilación por entropía cruzada sobre el prefijo. Los datos de partida son 23 trayectorias exitosas del profesor GLM-5.3 en Toolathlon 46, que se descomponen en 265 filas de llamadas LLM. La configuración es: inicialización de captura, n_tune = 704 tokens (alineado a la baja desde 745 con múltiplo de 64), tasa de aprendizaje 3e-4 constante, 252 pasos, parallelismo de datos 4 con acumulación de gradientes 2 y semilla 42. No se documentan en el extracto disponible ni la composición completa del dataset, ni fases de RLHF o DPO, ni innovaciones de decodificación (decodificación especulativa, atención lineal adicional, etc.).

## Capacidades

El artefacto en sí no aporta capacidades nuevas: modifica el comportamiento del modelo base Qwen3.8-27B restringiendo su prefijo KV. Con esa salvedad, las capacidades que se derivan de la documentación son las siguientes:

- Ejecución de tareas de agente con uso de herramientas en los entornos terminus-2 y Harbor, evaluadas en el conjunto Toolathlon 46.
- Razonamiento multi-paso orientado a terminal y línea de comandos, según la naturaleza de los entornos de evaluación citados.
- Tool calling / function calling: el modelo base recibe llamadas de herramienta en formato de filas de llamada LLM, como reflejan las 265 filas extraídas de las trayectorias del profesor.
- Aprendizaje por imitación de trayectorias de un profesor más capaz (GLM-5.3), lo que sugiere transferencia de estrategias de resolución más que de conocimiento nuevo.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Especialización de agentes de terminal: el ajuste está entrenado sobre los entornos terminus-2 y Harbor, por lo que su uso natural es un agente que ejecuta comandos, interpreta la salida y corrige el plan en pasos sucesivos dentro de un contenedor o shell.
- Ajuste de bajo coste en producción: al ocupar 0,2 GB frente a decenas de gigabytes de un fine-tuning completo, permite versionar y desplegar variantes especializadas del mismo modelo base sin duplicar los pesos por cada tarea.
- Destilación de trayectorias de un profesor propietario: el flujo documentado (23 trayectorias exitosas de GLM-5.3 convertidas en 265 filas de entrenamiento) es reutilizable para trasladar comportamiento de un modelo grande a otro de menor coste de servicio.
- Investigación en prefix KV y caché tuning: la receta publicada (n_tune, lr, pasos, semilla, wandb) permite reproducir y comparar variantes de ajuste de prefijo frente a LoRA o ajuste completo.
- Evaluación comparativa de agentes en modo emparejado: la configuración "paired" base frente a ajustado sobre 46 tareas sirve como plantilla de harness para medir el efecto real de un ajuste en tareas de agente.
- Automatización de pipelines de CI/CD con pasos de shell: un agente ajustado a entornos de terminal puede encadenar llamadas a herramientas (compilar, ejecutar tests, leer logs) en flujos de integración.
- Reproducción de resultados con trazabilidad: las métricas en Weights & Biases y los veredictos completos en el dataset Zhongzhu/tunekv-toolathlon-data permiten auditar la mejora tarea a tarea, útil para equipos que necesitan justificar una decisión de despliegue.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Modelo ajustado | Notas |
|---|---|---|---|
| Toolathlon 46 (terminus-2 + Harbor) | 11/46 | no disponible en el extracto (la model card solo indica "tuned") | Evaluación emparejada, configuración "28000/4096" |
| MMLU, HumanEval, GSM8K u otros | no disponible | no disponible | No se publican resultados en la información proporcionada |

Datos de entrenamiento asociados: 23 ensayos exitosos del profesor GLM-5.3, 265 filas de llamadas LLM, 252 pasos de optimización.

## Requisitos de hardware

- El artefacto pesa 0,2 GB, pero requiere cargar el modelo base Qwen3.8-27B completo; el coste de VRAM lo determina el modelo base, no el prefijo KV.
- El formato distribuido es de tensor parallelism 2 (TP2), por lo que el servicio necesita al menos dos dispositivos o procesos con el reparto indicado en ASSEMBLY.json.
- Estimación derivada del tamaño (no publicada por el autor): en bf16 el modelo base ronda los 54 GB de pesos, aproximadamente 27 GB en 8 bits y 14-16 GB en 4 bits, a lo que hay que sumar la caché KV. Las 48 capas GDN reducen el coste de caché frente a un transformer íntegramente de atención completa.
- GPU recomendadas: no disponibles en la documentación. Para un servicio TP2 en bf16 serían necesarios dos aceleradores de 80 GB (A100, H100); no hay confirmación de que existan configuraciones validadas en GPU de consumo.
- Opciones de despliegue: la model card solo menciona "TP2 serve-format". No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato de ficheros de rango no es GGUF, por lo que su uso fuera del stack previsto no está soportado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TuneKV Toolathlon Qwen3.8-27B (prefijo KV ajustado) | ~27B (base) | no disponible | Base 11/46 en Toolathlon 46; ajustado no explicitado | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen3.8-27B (modelo base citado) | ~27B | no disponible | 11/46 en Toolathlon 46 | no disponible | No verificada en las fuentes consultadas |
| GLM-5.3 (profesor citado) | no disponible | no disponible | Origen de las 23 trayectorias exitosas usadas como objetivo | no disponible | No verificada en las fuentes consultadas |

No se han encontrado en la información disponible otros artefactos públicos de ajuste de prefijo KV comparables en la misma tarea.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base Qwen3.8-27B y sin el procedimiento de ensamblado descrito en ASSEMBLY.json, el artefacto no es utilizable.
- Licencia no declarada: no puede confirmarse la legalidad del uso comercial ni las obligaciones de atribución.
- Idiomas no declarados: se desconoce el comportamiento multilingüe del ajuste.
- Ausencia de validación externa: 0 descargas y 0 likes, con creación y última actualización el 22 de septiembre de 2026 (40 segundos de diferencia), lo que indica un artefacto recién subido y no revisado por terceros.
- Resultado final no publicado en el extracto: solo se conoce el 11/46 del modelo base, no la cifra del modelo ajustado, por lo que no puede cuantificarse la mejora.
- Riesgo de sobreajuste: el entrenamiento usa 23 trayectorias y 265 filas de llamadas; un ajuste de prefijo de baja dimensión sobre ese volumen puede no generalizar a otras tareas de agente.
- Evaluación limitada a un único banco de 46 tareas (Toolathlon); no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- Sesgos y tasa de alucinación: no medidos ni documentados.
- Restricciones técnicas de despliegue: formato propio de servicio TP2, sin soporte conocido en llama.cpp, Ollama o GGUF, y sin cuantizaciones publicadas.
- Verificación pendiente: los nombres de los modelos base y profesor citados (Qwen3.8-27B y GLM-5.3) no aparecen en las fuentes recuperadas en la búsqueda web, por lo que no ha podido confirmarse su existencia ni sus especificaciones oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zhongzhu/tunekv-toolathlon-qwen3.8-27b
- Dataset de veredictos y datos de evaluación: https://huggingface.co/Zhongzhu/tunekv-toolathlon-data (referencia toolce27/)
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/zhizhousha/TOOLATHLON/runs/rxl5naxo
- Modelo base citado: Qwen/Qwen3.8-27B (referencia textual de la model card; no verificada)
- Las búsquedas web realizadas no devolvieron ningún resultado relacionado con el modelo: únicamente hilos de un foro de hardware sin relación con el artefacto, por lo que no se añaden enlaces adicionales.
