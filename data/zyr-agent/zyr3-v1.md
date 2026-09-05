# zyr-AGENT/zyr3-v1

## Resumen
ZYR3 v1 es un adaptador ligero de tipo LoRA (PEFT) desarrollado por zyr-AGENT (ZYR AI) para asistir en tareas de "agentic coding". Según su model card, se comporta como un asistente de programación: explica código, edita, refactoriza, depura y resuelve tareas de programación de forma iterativa, en lugar de limitarse a generar fragmentos de código. El repositorio distribuye únicamente los pesos del adaptador y su configuración; el modelo base no se divulga y debe ser suministrado por el usuario en tiempo de carga mediante la variable de entorno `ZYR3_BASE_MODEL`. No se detallan arquitectura, número de parámetros ni longitud de contexto: la información disponible es mínima.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base no especificado (biblioteca PEFT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
ZYR3 v1 es un adaptador LoRA/PEFT y no un modelo base de lenguaje. El repositorio contiene únicamente los pesos del adaptador y la configuración necesaria para cargarlo sobre un checkpoint compatible. El autor no revela qué modelo base se ha utilizado, ni proporciona datos de entrenamiento, número de tokens, procesos de alineación (RLHF, DPO) u otras innovaciones técnicas. La configuración se lee del entorno en tiempo de ejecución: `ZYR3_BASE_MODEL` es obligatoria y `ZYR3_ADAPTER` es opcional. No se documentan detalles sobre la arquitectura del adaptador (número de capas, factor de reducción, etc.).

## Capacidades
- Generación y asistencia de código: no solo genera código, sino que explica, edita y refactoriza código existente.
- Depuración y búsqueda de errores: puede identificar y depurar fallos.
- Razonamiento de programación: aborda problemas de codificación en pasos múltiples.
- Manejo de casos límite.
- Configuración mediante variables de entorno: la carga del adaptador se define en la ejecución, sin hardcodear el modelo base.

No se mencionan capacidades de tool calling, function calling, visión, audio ni multimodalidad. La lista de idiomas soportados no está disponible.

## Casos de uso
- Revisión de código en pull requests: cargado sobre un modelo base de código, el adaptador puede explicar diferencias y señalar problemas.
- Refactorización de código legacy: el modelo entiende el propósito del código y propone cambios estructurales.
- Depuración asistida: dado un fragmento con errores, sugiere la causa y una corrección.
- Asistente de programación en IDE: integrado en un editor, responde a consultas sobre el código en contexto.
- Resolución de tareas de programación en varios pasos: útil para agentes que descomponen un problema en pasos iterativos.
- Generación de casos límite para pruebas unitarias: explora entradas adversas o poco habituales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Al tratarse de un adaptador, no existen requisitos de hardware propios: dependen del modelo base elegido.
- El tamaño del repositorio es de 0,1 GB, correspondiente solo a los pesos del adaptador.
- VRAM estimada: no disponible.
- GPU recomendada: no disponible, depende del modelo base.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares
No se dispone de información suficiente para comparar este adaptador con otros modelos equivalentes. Tampoco se conocen otros adaptadores LoRA de código con características documentadas en la fuente. Por tanto, la comparativa resulta no disponible.

## Limitaciones y advertencias
- El modelo base no está incluido ni especificado: el usuario debe seleccionar un checkpoint compatible, pero no se ofrece ninguna indicación de compatibilidad.
- No hay benchmarks ni evaluaciones publicadas: no se puede verificar la calidad real del adaptador.
- Al ser un adaptador, hereda todas las limitaciones del modelo base (sesgos, alucinaciones, problemas de contextos, idiomas, etc.).
- Sin datos de entrenamiento: se desconocen las prácticas de entrenamiento, posibles filtros o riesgos de datos.
- No se documenta soporte explícito de tool calling ni function calling, a pesar de la etiqueta "agentic coding".
- El repositorio registra 0 descargas y 1 like, lo que sugiere un estado experimental o muy reciente.
- La licencia Apache-2.0 del adaptador no exime de cumplir la licencia del modelo base elegido.

## Enlaces
- Modelo: https://huggingface.co/zyr-AGENT/zyr3-v1
- Autor: https://huggingface.co/zyr-AGENT
- Modelo relacionado (zyr3): https://huggingface.co/zyr-AGENT/zyr3
