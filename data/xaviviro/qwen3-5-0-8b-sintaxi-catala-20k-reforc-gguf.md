# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF es la versión cuantizada a 4 bits (Q4_K_M, 535 MB) de un modelo especializado en el análisis sintáctico del catalán. Lo desarrolla Xavier Vinaixa Roselló (xaviviro, Sorensen AI, Barcelona) y parte de la familia Qwen3.5, con 752.393.024 parámetros reales en safetensors. El modelo recibe una única oración en catalán y devuelve su análisis sintáctico en JSON, sin razonamiento intermedio: la plantilla de chat incluida desactiva siempre el modo *thinking*, tal como se entrenó.

El modelo se ha destilado a partir de un "profesor" de mayor tamaño (Qwen3.8-27B) mediante un proceso de destilación sobre aproximadamente 20.500 oraciones, con un refuerzo posterior de 1.033 oraciones dirigidas a los grupos con peor rendimiento (CRV, impersonales, pronombres débiles y CPRED). La versión de esta ficha corresponde al "mini 20k + reforç", que alcanza un 80,8 % de análisis exactos en el conjunto de evaluación independiente eval250, frente al 0,4 % del mini base sin destilar y al 91,2 % del profesor.

Su relevancia actual es doble: por un lado, demuestra que un modelo de menos de 1.000 millones de parámetros puede resolver una tarea lingüística estructurada con una precisión notable si se destila de forma cuidadosa; por otro, la cuantización Q4_K_M conserva el 100 % de las salidas idénticas al modelo bf16 en las 30 oraciones de referencia manual, lo que lo hace viable en hardware de consumo (Mac, Windows, Linux) mediante LM Studio o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles de capas y atención no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits, 535 MB); el repo base ofrece otros formatos GGUF no detallados |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con 752 millones de parámetros, ajustado mediante destilación desde un profesor Qwen3.8-27B que opera con razonamiento (*thinking*). El proceso de destilación se realizó sobre aproximadamente 20.500 oraciones generadas por el profesor, a las que se añadieron 1.033 oraciones de refuerzo dirigidas específicamente a los grupos donde el modelo fallaba: complemento de régimen verbal (CRV), impersonales, pronombres débiles y complemento predicativo (CPRED). Las oraciones de refuerzo se generaron y filtraron con el mismo procedimiento que el resto.

Una innovación destacable es la plantilla de chat, que desactiva de forma permanente el modo *thinking*: el modelo responde directamente con el JSON de análisis, lo que reduce la latencia y evita que el razonamiento intermedio contamine la salida estructurada. El entrenamiento se hizo con un prompt corto (solo la oración), mientras que el mini base sin destilar se evaluó con el prompt completo. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Análisis sintáctico del catalán: identifica sujeto, núcleo verbal, tipo de predicado, voz y el conjunto de complementos (función + texto) de una oración.
- Salida estructurada en JSON, con una tasa de JSON válido del 100 % en el conjunto eval250.
- Cobertura de 11 tipos de oración: CD, CD+CI, pronombres débiles, predicado nominal, voz pasiva, impersonales, CPRED, CRV, CC, verbos incoativos y sujeto elíptico.
- Modo sin razonamiento (*thinking* desactivado por plantilla), lo que produce respuestas directas y de baja latencia.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo más allá del catalán.
- No se documentan capacidades generales de generación de texto, código o matemáticas; el modelo está especializado en una única tarea.

## Casos de uso

- Anotación sintáctica de corpus en catalán: el modelo procesa oraciones individuales y devuelve el análisis en JSON, lo que permite integrarlo en pipelines de anotación lingüística con una latencia de 3,9 ms por oración en la versión Q4_K_M.
- Enseñanza de gramática catalana: una aplicación educativa puede enviar una oración del alumno y mostrar la estructura sintáctica desglosada (sujeto, núcleo verbal, complementos) para explicar la función de cada constituyente.
- Herramientas de corrección y revisión de estilo: el análisis permite detectar construcciones problemáticas (por ejemplo, pronombres débiles mal colocados o impersonales mal formados) y señalar la función de cada complemento al revisor.
- Investigación en lingüística computacional: el modelo sirve como anotador automático de bajo coste para estudios de sintaxis catalana, con un rendimiento del 80,8 % de análisis exactos y F1 de 87,4 en complementos.
- Despliegue local en escritorio: gracias a sus 535 MB en Q4_K_M, cabe en un Mac, Windows o Linux sin GPU dedicada y se ejecuta con LM Studio o llama.cpp, lo que permite usarlo en entornos sin conexión o con requisitos de privacidad.
- Prototipado de asistentes lingüísticos: al devolver JSON válido de forma consistente, se puede encadenar con otras herramientas (por ejemplo, un generador de ejercicios o un corrector) sin necesidad de postprocesar la salida.
- Filtrado y validación de datos: en la construcción de datasets en catalán, el modelo puede verificar que una oración tiene la estructura esperada antes de incluirla en un corpus de entrenamiento.

## Benchmarks y rendimiento

Resultados en el conjunto independiente eval250 (250 oraciones anotadas a mano, temperatura 0):

| Modelo | Análisis exacto (%) | F1 complementos | F1 funciones | Sujeto | Núcleo verbal | Tipo y voz | JSON válido (%) | ms/oración |
|---|---|---|---|---|---|---|---|---|
| Mini base (sin destilar) | 0,4 | 12,7 | 20,6 | 62,0 | 67,2 | 81,2 | 100,0 | 8,8 |
| Mini 4k | 62,0 | 74,9 | 80,2 | 90,8 | 88,8 | 99,2 | 100,0 | 3,9 |
| Mini 10k | 69,2 | 80,5 | 84,1 | 94,4 | 93,6 | 98,4 | 100,0 | 4,0 |
| Mini 20k | 73,2 | 83,8 | 86,2 | 93,6 | 93,6 | 98,4 | 99,6 | 4,0 |
| Mini 20k + reforç (este modelo) | 80,8 | 87,4 | 90,1 | 97,2 | 97,2 | 99,2 | 100,0 | 3,9 |
| Profesor Qwen3.8-27B | 91,2 | 95,2 | 95,5 | 98,8 | 98,0 | 99,6 | 99,6 | 881,1 |

Análisis exacto (%) por tipo de oración:

| Tipo de oración (n) | Mini base | Mini 4k | Mini 10k | Mini 20k | Mini 20k + reforç | Profesor |
|---|---|---|---|---|---|---|
| CD (30) | 0 | 93 | 90 | 90 | 100 | 100 |
| CD+CI (20) | 0 | 85 | 100 | 85 | 85 | 100 |
| Pronombres débiles (15) | 0 | 33 | 40 | 60 | 60 | 93 |
| Predicado nominal (25) | 0 | 84 | 80 | 96 | 88 | 88 |
| Voz pasiva (20) | 0 | 100 | 95 | 85 | 95 | 95 |
| Impersonal (15) | 0 | 0 | 47 | 47 | 60 | 80 |
| CPRED (15) | 0 | 47 | 47 | 53 | 60 | 67 |
| CRV (15) | 0 | 0 | 7 | 7 | 80 | 73 |
| CC (50) | 0 | 46 | 68 | 74 | 78 | 94 |
| Verbos incoativos (25) | 4 | 80 | 68 | 72 | 80 | 96 |
| Sujeto elíptico (20) | 0 | 70 | 75 | 90 | 80 | 95 |

Validación de la cuantización frente al modelo bf16 (30 oraciones de referencia manual, temperatura 0): 100 % de JSON válido y 100 % de análisis idénticos al bf16. Esta tabla mide la fidelidad de la cuantización, no la corrección del análisis.

## Requisitos de hardware

- VRAM estimada: 535 MB para el archivo Q4_K_M; en la práctica, menos de 1 GB de memoria total durante la inferencia.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede ejecutarlo con holgura, aunque no es necesario.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre, y también en CPU.
- Opciones de despliegue: LM Studio (Mac, Windows, Linux) y llama.cpp (`llama-server -hf xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF --jinja`). Compatible con endpoints según los tags del repo.
- Latencia y throughput: 3,9 ms por oración en la evaluación, frente a 881,1 ms del profesor de 27B; el modelo es aproximadamente 225 veces más rápido en la misma tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Análisis exacto (eval250) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Q4_K_M) | 752 M | no disponible | 80,8 % | Apache 2.0 | GGUF en HF |
| Mini 20k (sin refuerzo) | 752 M | no disponible | 73,2 % | Apache 2.0 | HF (modelo base) |
| Profesor Qwen3.8-27B | 27 B (aprox.) | no disponible | 91,2 % | no disponible | no disponible |
| Mini base (sin destilar) | 752 M | no disponible | 0,4 % | Apache 2.0 | HF (modelo base) |

No se dispone de información sobre otros modelos especializados en análisis sintáctico del catalán con los que establecer una comparación directa.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo realiza análisis sintáctico de oraciones en catalán; no es un modelo de propósito general y no se documentan capacidades de generación libre, código, matemáticas ni otros idiomas.
- Rendimiento limitado en ciertos tipos de oración: pronombres débiles (60 %), impersonales (60 %) y CPRED (60 %) siguen por debajo del profesor (93 %, 80 % y 67 % respectivamente), por lo que en estos casos el análisis puede ser incorrecto.
- Sesgo de evaluación: el refuerzo se dirigió a los grupos donde fallaba eval250, por lo que la mejora en esos grupos no es una medida completamente independiente; el autor lo advierte explícitamente.
- Riesgo de alucinación: aunque la tasa de JSON válido es del 100 %, un JSON bien formado no garantiza que el análisis sea correcto; en oraciones complejas o ambiguas puede producir etiquetas plausibles pero erróneas.
- Entrada de una sola oración: el modelo está entrenado para recibir una única oración, no párrafos ni documentos; no se documenta su comportamiento con entradas más largas ni su longitud de contexto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la corrección lingüística en producción; conviene validar con anotación humana en dominios específicos.
- Modelo reciente y con pocas descargas (0 en el momento de la ficha): no hay evidencia de uso en producción ni reportes independientes fuera del conjunto eval250 del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF
- Modelo base (bf16): https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc
- Dataset de evaluación eval250: https://huggingface.co/datasets/xaviviro/sintaxi-catala-eval250
- Código, notebook y explicación: https://github.com/xaviviro/destillacio-sintaxi-catala
- Perfil del autor: https://huggingface.co/xaviviro
- Gráfico global eval250: https://huggingface.co/datasets/xaviviro/sintaxi-catala-eval250/resolve/main/grafics/eval250_global.png
- Gráfico por grupos eval250: https://huggingface.co/datasets/xaviviro/sintaxi-catala-eval250/resolve/main/grafics/eval250_grups.png
