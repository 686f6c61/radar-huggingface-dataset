# vultr/Ornith-1.5-122B-GGUF

## Resumen

Ornith 1.5 122B es un modelo de razonamiento con arquitectura de mezcla de expertos (MoE) dispersa, desarrollado por ornith-ai y construido sobre Qwen3.5. Esta ficha cubre la cuantización GGUF publicada por Vultr, un proveedor de infraestructura cloud, que distribuye los pesos en formato híbrido optimizado para llama.cpp. El modelo está disenado específicamente para programación agéntica, uso de herramientas y despliegue en una sola GPU, combinando 122.000 millones de parámetros totales con aproximadamente 10.000 millones activos por token.

La relevancia de esta versión radica en su estrategia de cuantización: en lugar de aplicar una precisión uniforme a toda la red, Vultr asigna la precisión de cada capa a partir de una puntuación de importancia medida, de modo que los bits se concentran donde más afectan a la salida. Con una ventana de contexto de 262K tokens y una licencia MIT, el modelo apunta a flujos de trabajo de agentes autónomos que necesitan razonamiento multi-paso sobre repositorios o documentos extensos.

El entrenamiento se basa en aprendizaje por refuerzo auto-mejorable, que optimiza la generación de tareas, los scaffolds y los rollouts de soluciones. El repositorio GGUF ocupa 299,9 GB, lo que refleja el conjunto completo de cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe, Mixture-of-Experts (transformer con atención lineal híbrida) |
| Parametros totales | 122.111.526.912 (122B) |
| Parametros activos | aproximadamente 10B |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | GGUF híbrido (precisión por capa según puntuación de importancia); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

Otros datos técnicos: 48 capas, hidden size de 3.072, 32 cabezas de atención, 2 cabezas key-value, 8 de 256 expertos activos más un experto compartido, vocabulario de 248.320 tokens. La disposición de atención es híbrida: tres capas de atención lineal preceden a cada capa de atención completa (según el fragmento de model card disponible).

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE dispersa sobre una base tipo Qwen3.5, con 256 expertos de los que se activan 8 por token más un experto compartido, lo que da un ratio de activación de aproximadamente el 8 % respecto al total de parámetros. La combinación de 48 capas con atención lineal intercalada (tres capas lineales por cada capa de atención completa) y solo 2 cabezas key-value reduce el coste de memoria de la caché KV, algo crítico para sostener contextos de 262K tokens en una sola GPU.

El entrenamiento se describe como aprendizaje por refuerzo auto-mejorable que optimiza conjuntamente la generación de tareas, los scaffolds y los rollouts de soluciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO convencionales. La cuantización de Vultr es una innovación destacable en sí misma: un esquema híbrido guiado por importancia por capa, en lugar de una precisión global fija.

## Capacidades

- Generación de texto y razonamiento multi-paso, orientado a tareas de codificación.
- Programación agéntica: resolución de tareas de código con planificación y ejecución iterativa.
- Uso de herramientas (tool calling / function calling), según la descripción del modelo base.
- Razonamiento con contexto largo de hasta 262K tokens, adecuado para repositorios y documentación extensa.
- Despliegue en una sola GPU gracias a la activación dispersa de ~10B parámetros.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Agente de codificación autónomo: el modelo puede recibir un repositorio completo dentro de su ventana de 262K tokens, planificar cambios multi-archivo y ejecutar tool calls contra el sistema de ficheros o el intérprete, aprovechando su entrenamiento específico en scaffolds y rollouts.
- Integración en pipelines de CI/CD: con soporte de function calling, puede invocarse como paso de revisión automática que consulta tests, lee logs y propone parches, manteniendo el contexto del build entre pasos.
- Asistente de refactorización a gran escala: la ventana de contexto permite cargar módulos enteros y sus dependencias para proponer refactorizaciones coherentes sin truncar información.
- Despliegue en una sola GPU para equipos pequenos: al activar solo ~10B parámetros por token, una cuantización GGUF agresiva puede ejecutarse en hardware de una sola unidad, lo que facilita entornos de desarrollo internos sin clústeres.
- Automatización de tareas de terminal y DevOps: el modelo puede encadenar comandos, interpretar su salida y corregir errores en bucles de razonamiento, un patrón para el que fue entrenado mediante RL sobre rollouts.
- Generación de documentación técnica a partir de código: con contexto largo puede recorrer APIs completas y producir referencias coherentes con el código fuente, reduciendo el trabajo manual en proyectos grandes.
- Evaluación y generación de tests: puede analizar una base de código y proponer casos de prueba adicionales, usando tool calling para ejecutarlos y verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. Como referencia orientativa, los 122B parámetros totales implican que incluso cuantizaciones de 4 bits requieren del orden de 60-70 GB solo para pesos; con cuantizaciones híbridas más agresivas el peso puede reducirse, pero el dato concreto no está publicado.
- La caché KV es comparativamente pequena para el tamano del modelo gracias a las 2 cabezas key-value y la atención lineal, lo que favorece contextos largos en memoria limitada.
- GPU recomendadas: no disponibles en la información proporcionada. Por volumen de pesos, se necesita al menos una GPU con 80 GB (A100/H100) para cuantizaciones de 4-5 bits, o varias GPUs consumer.
- ¿Cabe en GPU consumer? No disponible con certeza; probablemente solo con cuantizaciones muy agresivas y offloading parcial a RAM/CPU.
- Opciones de despliegue: llama.cpp (formato nativo del repo); compatibilidad con Ollama, vLLM o TGI no está confirmada en la información disponible (los tags mencionan `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ornith 1.5 122B (GGUF, Vultr) | 122B / ~10B | 262K | MIT | GGUF |
| Modelos MoE de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~100B MoE de código abierto | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones verificables de modelos comparables, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real frente a alternativas no puede verificarse con la información disponible.
- Los idiomas soportados no están documentados; el comportamiento fuera del inglés (o de los idiomas de entrenamiento de Qwen3.5) es incierto.
- Riesgo de alucinación inherente a los modelos de razonamiento; en tareas de código puede generar APIs o funciones inexistentes si no se valida con ejecución real.
- Sesgos conocidos: no documentados en la información disponible; se heredan potencialmente los del modelo base y sus datos de entrenamiento.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base ornith-ai/Ornith-1.5-122B y de Qwen3.5, de los que depende esta cuantización.
- La cuantización híbrida puede degradar sutilmente ciertas capacidades; no se publican evaluaciones comparativas entre niveles de cuantización.
- El despliegue requiere hardware de gama alta; no es viable en estaciones de trabajo convencionales sin cuantizaciones muy agresivas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vultr/Ornith-1.5-122B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Vultr (proveedor de la cuantización): https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/
- Wikipedia de Vultr: https://en.wikipedia.org/wiki/Vultr
