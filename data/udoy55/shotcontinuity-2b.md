# udoy55/ShotContinuity-2B

## Resumen

ShotContinuity-2B es un adaptador LoRA publicado por el usuario udoy55 sobre el modelo base Qwen/Qwen3.5-2B. Su función es muy concreta: comparar dos planos adyacentes de un guion gráfico (storyboard) o de un registro de producción de Blender, recibir los detalles de vestuario, atrezo y decorado de cada plano junto con una nota del director, y determinar qué cambios parecen involuntarios y qué valor previo debería restaurarse. No analiza metraje, no abre ficheros .blend ni modifica escenas: trabaja exclusivamente sobre anotaciones de texto.

El modelo resuelve un problema acotado del flujo de trabajo audiovisual, la continuidad entre planos, mediante un adaptador de bajo rango que transforma la salida del modelo base en un informe JSON estructurado con la lista de correcciones. La propuesta es relevante por su especialización extrema y por su formato de salida verificable, aunque su alcance es limitado y su evaluación se ha realizado únicamente sobre pares sintéticos.

El repositorio es de tamaño prácticamente nulo (0.0 GB), con licencia Apache 2.0 y pipeline de generación de texto. No se dispone de datos sobre idiomas soportados más allá de lo que herede del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B no detalla recuento en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se carga por separado |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA (Low-Rank Adaptation) mediante la librería PEFT, aplicada sobre el checkpoint Qwen/Qwen3.5-2B. El entrenamiento se realizó con 240 ejemplos por época durante 2 épocas, con un pico de 5,47 GiB de asignaciones CUDA sobre una GPU RTX 4070 SUPER de 12 GB. Los datos son originales y se generaron mediante un script de Python con semilla, lo que implica que el corpus de entrenamiento es completamente sintético y controlado.

No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal no reside en la arquitectura, sino en la formulación de la tarea: el adaptador aprende a producir una lista exacta de campos a restaurar en formato JSON, respetando los cambios autorizados explícitamente en la nota del director. La evaluación se realizó con decodificación greedy y el mismo prompt y revisión del checkpoint base para ambas configuraciones.

## Capacidades

- Comparación de dos planos adyacentes a partir de anotaciones de texto estructuradas (JSON con campos como decorado, atrezo, vestuario o iluminación).
- Detección de cambios no intencionados entre planos y propuesta del valor previo a restaurar.
- Interpretación de notas del director para distinguir cambios autorizados de errores de continuidad.
- Generación de salida en formato JSON con esquema fijo (`issues` con `field` y `restore`).
- No incluye visión por computador, tool calling, capacidades de agente ni análisis de audio.
- No abre ficheros .blend ni edita escenas de Blender; solo procesa texto.

## Casos de uso

- Supervisión de continuidad en preproducción: el equipo de guion introduce las fichas de dos planos consecutivos y el modelo devuelve qué elementos (por ejemplo, el estado de una puerta o una luz) han cambiado sin autorización, lo que permite corregir el storyboard antes del rodaje.
- Control de calidad en registros de producción de Blender: a partir de los logs de anotación de cada plano, el adaptador señala discrepancias en atrezo o vestuario que podrían pasar desapercibidas en una revisión manual rápida.
- Asistencia al script supervisor: el modelo actúa como primer filtro automático sobre las notas de continuidad, generando una lista de correcciones que el supervisor humano revisa y valida.
- Integración en pipelines de validación: al producir JSON con esquema fijo, la salida puede consumirse mediante scripts que comparen el informe con la base de datos de continuidad de la producción.
- Formación de equipos: el adaptador sirve para ilustrar casos de continuidad en talleres de cine o animación, generando informes de ejemplo sobre pares de planos ficticios.
- Prototipado de herramientas de previsualización: desarrolladores que construyan utilidades de storyboard pueden usar el adaptador como motor de comprobación de coherencia entre viñetas consecutivas.
- Automatización de revisiones en series de animación: con pares de planos anotados de forma sistemática, el modelo reduce el tiempo de revisión de continuidad en producciones con muchos planos cortos.

## Benchmarks y rendimiento

Evaluación sobre un holdout final de 24 pares sintéticos de planos, con cuatro escenarios ficticios y plantillas de notas del director reservadas fuera de entrenamiento y desarrollo:

| Métrica | Base | Adaptador |
|---|---:|---:|
| Lista exacta de correcciones | 2/24 | 18/24 |
| Respuestas que cumplen el esquema JSON | 10/24 | 24/24 |
| Cambios totalmente autorizados dejados intactos | 0/4 | 4/4 |
| Un cambio autorizado más un error | 1/4 | 1/4 |
| Un cambio autorizado más dos errores | 0/4 | 1/4 |

El evaluador acepta un bloque de código JSON y exige la lista exacta de campos y valores de restauración. No se empleó metraje de producción real. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El entrenamiento se ejecutó en una RTX 4070 SUPER de 12 GB, con un pico de 5,47 GiB de asignaciones CUDA; la inferencia requiere menos memoria que el entrenamiento.
- El adaptador LoRA es de tamaño mínimo (repositorio de 0.0 GB), por lo que el coste de memoria lo determina casi por completo el modelo base Qwen3.5-2B.
- GPU recomendadas: cualquier GPU consumer con suficiente VRAM para el modelo base de 2B en la cuantización elegida; una RTX 4070 SUPER es suficiente para el entrenamiento documentado.
- Cabe en GPU consumer: sí, siempre que se disponga de VRAM suficiente para el modelo base de 2B (el dato exacto de VRAM de inferencia no está disponible en la información proporcionada).
- Despliegue: se requiere una instalación de PyTorch con soporte CUDA para uso en GPU; el proyecto GitHub incluye una CLI (`check_shots.py`) y un script de entrenamiento. El modelo base se carga por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores especializados en continuidad de planos). Se puede comparar únicamente con su modelo base:

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| ShotContinuity-2B | LoRA sobre Qwen3.5-2B | no disponible | no disponible | Continuidad de planos | Apache 2.0 |
| Qwen/Qwen3.5-2B | Transformer base | 2B (según nombre) | no disponible | Generación de texto general | no disponible en la información |

## Limitaciones y advertencias

- El modelo solo procesa anotaciones de texto; no inspecciona metraje, no abre ficheros .blend ni edita escenas.
- La evaluación se realizó exclusivamente sobre 24 pares sintéticos; no hay validación con datos de producción real.
- Los cambios intencionados pueden marcarse erróneamente como errores, por lo que un informe limpio sigue requiriendo revisión humana.
- El rendimiento en el caso de un cambio autorizado más un error es bajo (1/4), lo que indica dificultad para manejar escenarios con múltiples cambios simultáneos.
- Los datos de entrenamiento son sintéticos y generados por script con semilla, lo que puede limitar la generalización a vocabulario y estructuras de producción reales.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación más allá de la naturaleza generativa del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador depende del modelo base Qwen3.5-2B, cuyas condiciones deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/udoy55/ShotContinuity-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Proyecto GitHub (CLI, script de entrenamiento, fixtures y evaluaciones): https://github.com/Ikteder/ShotContinuity-2B
