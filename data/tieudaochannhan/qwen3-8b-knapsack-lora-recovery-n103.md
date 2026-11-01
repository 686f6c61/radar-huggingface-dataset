# TieuDaoChanNhan/qwen3-8b-knapsack-lora-recovery-n103

## Resumen

`qwen3-8b-knapsack-lora-recovery-n103` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3-8B por el autor TieuDaoChanNhan. No se trata de un modelo fundacional, sino de un ajuste fino orientado a un experimento académico concreto: evaluar si un agente CodeAct entrenado con una estrategia de "recuperación" (recovery) ante el límite de llamadas a herramientas por turno supera a la estrategia alternativa de "prevención". El adaptador se publica como artefacto reproducible de un proyecto individual para el GStar Bootcamp 2026, vinculado al paper *Evaluating Agents Across Runtime Contracts: When Mismatch Costs Efficiency or Quality* (IAEval 2026, workshop NeurIPS 2026).

El modelo hereda la arquitectura transformer densa de Qwen3-8B (8 mil millones de parámetros) y se distribuye como pesos LoRA en formato safetensors con un tamaño de repositorio de 0,7 GB. La tarea de entrenamiento es un problema opaco de mochila (Opaque Knapsack), con 103 pares de entrenamiento y solo 74 pasos de optimizador, lo que da una idea del carácter acotado y experimental del ajuste.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigadores que estudian contratos de ejecución en agentes y estrategias de recuperación ante fallos de herramientas, más que como modelo de propósito general para producción. La licencia Apache 2.0 y la disponibilidad pública del adaptador facilitan su reutilización y verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8 mil millones (modelo base); adaptador LoRA de rango 64 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 16k) |
| Tipos de cuantizacion | QLoRA en entrenamiento; cuantizaciones del base no especificadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer denso de 8 mil millones de parámetros. El entrenamiento emplea QLoRA con rango 64, alpha 128, dropout 0,05, learning rate 1e-4 con scheduler coseno, 3 épocas y longitud de secuencia de 16k. Se siguió la receta del paper de referencia, cambiando únicamente la fuente de datos y reduciendo el batch efectivo de 16 a 4 para mantener los pasos de optimizador en un rango aprendible a esta escala, decisión tomada antes del entrenamiento. El resultado son 74 pasos de optimizador sobre 103 pares de entrenamiento.

La tarea es un problema opaco de mochila (Opaque Knapsack) en el marco de un agente CodeAct. La estrategia entrenada es "recovery": el agente aprende a recuperarse cuando alcanza el límite de llamadas a herramientas por turno, en contraposición a la estrategia de "prevención". Los datos de entrenamiento se generaron con Gemini 3 Flash como profesor (teacher). El experimento controla que el número de llamadas a herramientas y la longitud de la traza estén igualados entre ambas estrategias, de modo que la comparación sea justa.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base Qwen3-8B.
- Ejecución de tareas de agente bajo el paradigma CodeAct, con razonamiento multi-paso y uso de herramientas.
- Gestión de contratos de ejecución: recuperación ante el agotamiento del presupuesto de llamadas a herramientas por turno.
- Resolución de problemas de optimización combinatoria del tipo mochila en entornos opacos.
- Capacidades multilingües del modelo base (no verificadas específicamente en el adaptador).
- No se documentan capacidades de visión, audio ni modo de pensamiento específicas del adaptador.

## Casos de uso

- Investigación sobre contratos de ejecución en agentes: el adaptador permite reproducir y extender el experimento del paper comparando estrategias de recovery frente a prevention con trazas igualadas.
- Evaluación de robustez de agentes CodeAct: sirve como punto de partida para medir cómo se comporta un agente cuando se le impone un límite estricto de llamadas a herramientas por turno.
- Reproducibilidad académica: al ser un artefacto público con hiperparámetros documentados, facilita la verificación de resultados en el workshop IAEval 2026 y trabajos derivados.
- Desarrollo de políticas de recuperación en pipelines de agentes: el adaptador puede estudiarse como ejemplo de ajuste fino para que un agente reintente o reformule acciones tras un fallo de herramienta.
- Docencia y formación en ajuste fino con PEFT: su tamaño reducido (0,7 GB) y su receta QLoRA lo hacen adecuado para demostraciones de entrenamiento de adaptadores sobre modelos de 8B.
- Experimentación con datos sintéticos generados por profesor: permite analizar el impacto de usar Gemini 3 Flash como generador de pares de entrenamiento en tareas de razonamiento combinatorio.
- Benchmarking de estrategias de agente en tareas de mochila opaca: útil para comparar políticas de recuperación bajo distintos límites de llamadas (cap 25 frente a cap 80).

## Benchmarks y rendimiento

Evaluación con bootstrap emparejado de 10.000 remuestreos sobre 50 instancias reservadas nunca vistas en entrenamiento:

| Cap (límite de llamadas) | Puntuación media |
|---|---|
| 25 | 0,275 |
| 80 | 0,481 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa 0,7 GB; el modelo base Qwen3-8B requiere aproximadamente 16 GB en FP16, unos 8-10 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimaciones orientativas para el base, no verificadas para este adaptador).
- GPU recomendadas: A100 o H100 para entrenamiento e inferencia a gran escala; RTX 4090 (24 GB) o RTX 3090 para inferencia en FP16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización de 4 bits del modelo base.
- Opciones de despliegue: vLLM, TGI o llama.cpp para el base cuantizado; PEFT o Transformers con carga del adaptador LoRA para inferencia con el ajuste.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3-8b-knapsack-lora-recovery-n103 | 8B (base) + LoRA r64 | no disponible | Apache 2.0 | Adaptador de investigación para agentes CodeAct |
| Qwen/Qwen3-8B | 8B | no disponible | Apache 2.0 | Modelo base de propósito general |
| Adaptador prevention (mismo proyecto) | 8B (base) + LoRA | no disponible | Apache 2.0 | Estrategia alternativa del mismo experimento |

No se dispone de datos de rendimiento comparables de otros adaptadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para una tarea de mochila opaca y una estrategia de recuperación concreta; su rendimiento fuera de ese dominio no está validado.
- El conjunto de entrenamiento es muy reducido (103 pares, 74 pasos de optimizador), lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Las puntuaciones medias obtenidas (0,275 con cap 25 y 0,481 con cap 80) son bajas en términos absolutos, lo que refleja la dificultad de la tarea y la necesidad de validación adicional.
- No se documentan sesgos específicos del adaptador; hereda los del modelo base Qwen3-8B, no evaluados aquí.
- Riesgo de alucinación presente, como en cualquier modelo generativo, agravado por el ajuste estrecho a una tarea concreta.
- Idiomas soportados no especificados; el entrenamiento se realizó presumiblemente en inglés según el contexto del proyecto.
- Aunque la licencia es Apache 2.0, el uso comercial del adaptador no está respaldado por evaluaciones de producción; se recomienda tratarlo como artefacto de investigación.
- El proyecto no está producido por los autores del paper de referencia, sino que se basa en él.

## Enlaces

- HuggingFace: https://huggingface.co/TieuDaoChanNhan/qwen3-8b-knapsack-lora-recovery-n103
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent
- Informe del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent/tree/main/report
