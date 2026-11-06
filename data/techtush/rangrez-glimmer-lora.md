# TechTush/rangrez-glimmer-lora

## Resumen

Rangrez Glimmer LoRA es un adaptador de bajo rango (LoRA) entrenado sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer de 30.000 millones de parametros. Lo desarrolla el usuario TechTush con el objetivo de resolver un problema muy concreto: proponer la primera receta de tintura reactiva (turquesa, fucsia y amarillo limon, en g/L) a partir de un color objetivo expresado en CIELAB. El adaptador esta pensado para el laboratorio de tintura autónomo Rangrez, donde cada receta se aplica sobre tejido y el color resultante se mide con SAM 3.1 sobre una fotografía del tejido seco.

El adaptador se entrena con LoRA de rango 8 durante 2 epocas sobre 2.900 registros de tinturas del propio laboratorio, usando PEFT sobre una GPU H100 en Modal. El repositorio ocupa 0,2 GB y se distribuye con licencia Apache 2.0. Su relevancia es acotada pero clara: demuestra que un ajuste fino pequeño sobre un modelo grande puede reducir drásticamente el error de color en una tarea industrial de formulación, pasando de un error mediano de 11,38 CIEDE2000 en el modelo base a 0,92 con el adaptador.

Es importante señalar que los datos de entrenamiento provienen del simulador de Rangrez (un lote de tintura oculto más fotografías realistas), no de una tintorería física, y que el adaptador "conoce" ese lote concreto. Por tanto, su generalización a condiciones reales de producción no está demostrada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Muse-Glimmer-30B |
| Parametros totales | no disponible (modelo base de 30B; el adaptador LoRA ocupa 0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado sobre el modelo base Muse-Glimmer-30B, un transformer de 30.000 millones de parametros del que no se detalla la arquitectura interna en la información disponible. El entrenamiento se realizó con PEFT durante 2 epocas sobre 2.900 registros de tinturas del laboratorio Rangrez, ejecutado en una única GPU H100 en Modal. Cada registro empareja una receta aplicada con el color medido sobre el tejido seco mediante SAM 3.1 a partir de una fotografía tipo teléfono.

La innovación técnica no reside en el adaptador en sí, sino en el pipeline de datos: el modelo aprende a mapear un color objetivo en CIELAB a una receta de tres tintes reactivos, y la evaluación se hace con el error CIEDE2000 del color que la receta realmente tiñe. Los datos provienen del simulador de Rangrez (un lote de tintura oculto más fotografías realistas), no de una tintorería física, y el adaptador está ajustado a ese lote concreto, lo que limita su extrapolación a otros entornos sin reentrenamiento.

## Capacidades

- Generación de recetas de tintura: dado un color objetivo en CIELAB, propone concentraciones (g/L) de tintes reactivos turquesa, fucsia y amarillo limón.
- Predicción de color resultante: el adaptador está optimizado para minimizar el error CIEDE2000 entre el color objetivo y el color que la receta produce.
- Razonamiento numérico aplicado: maneja espacios de color y formulación cuantitativa en un dominio industrial específico.
- Especialización de dominio: ajustado a las condiciones del simulador Rangrez y a su lote de tintura oculto.
- No se dispone de información sobre tool calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Formulación de primera tintura en laboratorio: dado un color objetivo en CIELAB, el adaptador propone la receta inicial de tres tintes reactivos, reduciendo el número de iteraciones de ajuste respecto a la receta del proveedor (error mediano 0,92 frente a 4,1).
- Control de calidad en tintura textil: integrado en un pipeline que mide el color con SAM 3.1 y compara con el objetivo, el modelo puede sugerir correcciones de receta cuando el error CIEDE2000 supera un umbral.
- Prototipado rápido de cartas de color: para un catálogo de colores objetivo, el modelo genera recetas candidatas que luego se validan en el simulador o en laboratorio.
- Investigación en optimización de procesos: sirve como punto de partida para estudiar cómo un ajuste LoRA pequeño sobre un modelo grande mejora tareas de regresión numérica en dominios industriales.
- Automatización del laboratorio de tintura Rangrez: el adaptador está diseñado específicamente para el flujo de trabajo del self-driving dye lab, donde cada receta se aplica y se mide automáticamente.
- Evaluación comparativa de adaptadores: permite comparar el efecto de un LoRA de rango 8 frente al modelo base y frente a un modelo reajustado con menos datos (400 tinturas) en la misma tarea de formulación.

## Benchmarks y rendimiento

Error de primera tintura sobre 100 objetivos retenidos (CIEDE2000 del color que la receta realmente tiñe):

| Metodo | Mediana | p90 | Bajo 3 |
|---|---|---|---|
| Modelo del proveedor (primera tintura actual) | 4,1 | 8,52 | 38% |
| Modelo reajustado a 400 tinturas del laboratorio | 2,05 | 3,56 | 78% |
| Muse Glimmer 30B, base | 11,38 | 19,4 | 8% |
| Muse Glimmer 30B, ajustado (este adaptador) | 0,92 | 1,76 | 96% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Muse-Glimmer-30B (30B de parametros), que en precisión completa requiere del orden de 60 GB o más, y en cuantizaciones de 8 o 4 bits podría reducirse, aunque no se especifican formatos soportados.
- GPU recomendadas: el entrenamiento se realizó en una H100; para inferencia del modelo base se necesitarían GPU de datacenter (A100, H100) salvo que se apliquen cuantizaciones no documentadas.
- ¿Cabe en GPU de consumo? No hay información que lo confirme para el modelo base de 30B; el adaptador LoRA por sí solo (0,2 GB) no es suficiente sin el modelo base.
- Opciones de despliegue: PEFT (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (mediana CIEDE2000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rangrez Glimmer LoRA (este) | LoRA r8 sobre 30B | no disponible | 0,92 | Apache 2.0 | Hugging Face |
| Muse Glimmer 30B base | 30B | no disponible | 11,38 | no disponible | Hugging Face |
| Modelo reajustado a 400 tinturas | no disponible | no disponible | 2,05 | no disponible | no disponible |
| Modelo del proveedor | no disponible | no disponible | 4,1 | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de formulación de tintura en la documentación proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento provienen del simulador de Rangrez, no de una tintorería física; el rendimiento en condiciones reales de producción no está validado.
- El adaptador está ajustado a un lote de tintura oculto concreto del simulador y "conoce" ese lote, lo que puede inflar el rendimiento reportado y limitar la generalización.
- El benchmark se realiza sobre 100 objetivos retenidos del mismo entorno simulado; no hay evaluación externa independiente.
- No se documentan sesgos, comportamiento multilingüe ni robustez ante entradas fuera de distribución.
- Riesgo de alucinación en recetas fuera del rango de concentraciones visto en entrenamiento; no se especifican límites de validez.
- La licencia Apache 2.0 del adaptador no necesariamente cubre el modelo base Muse-Glimmer-30B, cuya licencia no se detalla en la información disponible; conviene verificar antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/TechTush/rangrez-glimmer-lora
- Dataset de tinturas: https://huggingface.co/datasets/TechTush/rangrez-lab-dips
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Código del proyecto: https://github.com/TusharTechs/rangrez
