# tetracta/Chimera-1-Qwen2.5-3B

## Resumen

Chimera-1-Qwen2.5-3B es un modelo de lenguaje de 3.085.938.688 parámetros desarrollado por Tetracta AI Teams mediante fusión de modelos (model merging) sin entrenamiento adicional en la fase de merge. Parte de Qwen/Qwen2.5-3B-Instruct como modelo base y combina dos especialistas creados por el propio autor mediante fine-tuning ligero de las capas superiores: uno especializado en conversión de números romanos y otro en operaciones a nivel de carácter sobre palabras. El objetivo no es producir un asistente de producción, sino demostrar empíricamente qué habilidades puede transferir un merge TIES (trim, election, disjoint mean) a un único modelo sin degradar sus capacidades generales.

La relevancia del modelo es metodológica: sirve como evidencia reproducible de que una edición de capacidades mediante merge sin entrenamiento puede mejorar habilidades objetivo concretas (+8,8 y +25,0 puntos en las dos tareas implantadas en una evaluación de 1.210 preguntas) manteniendo los benchmarks estándar dentro del ruido de ejecución en bf16 (desviación máxima de 1,3 pp en MMLU, ARC-Challenge, HellaSwag y Belebele en varios idiomas). El merge se ejecuta en CPU en minutos y no añade coste de inferencia, ya que el resultado es un único modelo de 3B.

El modelo hereda la licencia Qwen Research (no comercial, uso de investigación) y el formato de chat ChatML de Qwen2.5, por lo que es intercambiable con el base a nivel de API. Está etiquetado únicamente en inglés y su ámbito declarado es la demostración de método, no el despliegue como asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-3B-Instruct |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | Inglés (etiqueta `en`); el modelo base Qwen2.5 soporta más idiomas, pero la card solo declara inglés |
| Licencia | Qwen Research License (no comercial, uso de investigación), heredada de Qwen2.5-3B-Instruct |
| Formato de pesos | safetensors (tamaño del repo: 6,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 3.085.938.688 parámetros, construido sobre Qwen2.5-3B-Instruct. No hay entrenamiento en la fase de merge: el proceso es un TIES merge (task-vector trim, sign election y disjoint mean) que combina los vectores de tarea de dos especialistas respecto al modelo base compartido. Los especialistas fueron creados por Tetracta mediante fine-tuning ligero limitado a las capas superiores, y el merge completo se ejecuta en CPU en minutos.

La metodología declarada por el autor establece una regla empírica basada en diez experimentos: la sinergia del merge depende de headroom (margen de mejora del base en la tarea), complementariedad entre especialistas y proximidad al base compartido. El autor documenta un control negativo en el que un modelo de código fusionado cae al 0% en tareas de código, ilustrando que merges agresivos sobre padres que se han alejado mucho del base producen resultados degenerados. Tres variantes exploratorias de merge no superaron al TIES uniforme en promedio. No se especifican en la información disponible el número de tokens de entrenamiento de los especialistas, la composición del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato ChatML, idéntico al base Qwen2.5-3B-Instruct.
- Conversión de números romanos a arábigos (habilidad implantada; 91,2% en la evaluación de 80 preguntas frente a 82,5% del base).
- Operaciones a nivel de carácter sobre palabras, como deletrear al revés (habilidad implantada; 62,5% frente a 37,5% del base).
- Razonamiento general y conocimiento enciclopédico comparable al base (MMLU 66,5%).
- Comprensión lectora multilingüe parcial, evaluada en inglés, turco, árabe, chino y ruso mediante Belebele, con rendimiento equivalente al base.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Investigación sobre model merging: el modelo sirve como caso reproducible para estudiar la transferencia de habilidades mediante TIES sin entrenamiento, con métricas de referencia publicadas y comparables contra el base.
- Validación de pipelines de merge: permite comprobar que un pipeline TIES propio reproduce los deltas reportados (+8,8 y +25,0 pp en las tareas implantadas) antes de aplicarlo a especialistas propios.
- Docencia y formación técnica: ilustra de forma concreta la diferencia entre fine-tuning de especialistas y fusión de vectores de tarea, con un control negativo documentado sobre merges degenerados.
- Pruebas de regresión de harness de evaluación: el autor verifica su harness contra el MMLU público del base (67,0%), por lo que el modelo sirve para calibrar herramientas de evaluación propias.
- Experimentos de edición de capacidades: útil para estudiar hasta qué punto se pueden añadir habilidades verificables (conversión, manipulación de cadenas) sin degradar benchmarks estándar medibles.
- Sustitución directa del base en prototipos de investigación: al compartir tokenizador, formato ChatML y arquitectura, puede intercambiarse con Qwen2.5-3B-Instruct en scripts existentes sin cambios de código.
- Exploración de límites del merge: el modelo documenta que si el base ya resuelve la tarea no hay ganancia, lo que permite diseñar experimentos de headroom antes de invertir en especialistas.

## Benchmarks y rendimiento

Comparativa cabeza a cabeza contra el modelo base, 1.210 preguntas, mismo harness para ambos modelos:

| Benchmark | Base | Chimera-1 | Δ |
|---|---|---|---|
| MMLU (200) | 67,0% | 66,5% | −0,5 |
| ARC-Challenge (200) | 81,5% | 81,5% | 0,0 |
| HellaSwag (150) | 70,0% | 71,3% | +1,3 |
| Belebele-EN (200) | 51,0% | 50,5% | −0,5 |
| Belebele-TR (75) | 41,3% | 41,3% | 0,0 |
| Belebele-AR (75) | 50,7% | 49,3% | −1,3 |
| Belebele-ZH (75) | 50,7% | 50,7% | 0,0 |
| Belebele-RU (75) | 49,3% | 49,3% | 0,0 |
| Números romanos (80) | 82,5% | 91,2% | +8,8 |
| Operaciones con letras (80) | 37,5% | 62,5% | +25,0 |

Resultados de la comparativa resumida de la card (piloto y head-to-head):

| Modelo | Habilidad A (romanos) | Habilidad B (letras) | Belebele-EN | Perplejidad | Chat |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 76% | 45% | 50% | 68,1 | Sí |
| Especialista A | 98% | 45% | — | — | — |
| Especialista B | 80% | 75% | — | — | — |
| Chimera-1 | 89% | 71% | 50% | 68,1 | Sí, sin diferencia visible |

El autor indica que todos los benchmarks estándar quedan dentro de una banda de ruido de ±2 pp en bf16 (desviación máxima observada de 1,3 pp) y que los benchmarks no ejecutados podrían moverse. Los resultados no han sido revisados externamente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 8 GB para contexto corto.
- En cuantización de 8 bits, el peso se reduce a unos 3,1 GB; en 4 bits, a unos 1,6 GB, aunque el autor no publica pesos cuantizados en el repo.
- GPU consumer compatibles: RTX 3090, RTX 4090, RTX 4080, RTX 4070 Ti y tarjetas con 8-12 GB o más para bf16; tarjetas de 6-8 GB con cuantización.
- GPU de datacenter: A100, H100, L40S, A10G, sin problema de memoria para este tamaño.
- Opciones de despliegue: transformers (el snippet de la card usa `AutoModelForCausalLM` con `dtype="bfloat16"`), vLLM, TGI, llama.cpp y Ollama son opciones habituales para arquitecturas Qwen2, aunque el autor solo documenta transformers explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Chimera-1-Qwen2.5-3B | 3,09B | No disponible | Qwen Research (no comercial) | Merge TIES de dos especialistas sobre Qwen2.5-3B-Instruct | Hugging Face, 798 descargas |
| Qwen2.5-3B-Instruct | 3,09B | No disponible en la información proporcionada | Qwen Research | Modelo instructivo base, entrenado por Alibaba | Hugging Face, ampliamente usado |
| Especialista A (Tetracta) | 3,09B | No disponible | Qwen Research | Fine-tuning de capas superiores para números romanos | No publicado como modelo independiente en la información disponible |
| Especialista B (Tetracta) | 3,09B | No disponible | Qwen Research | Fine-tuning de capas superiores para operaciones con letras | No publicado como modelo independiente en la información disponible |

El modelo comparable más directo es su propio base, Qwen2.5-3B-Instruct, con idéntica arquitectura, tamaño y licencia; la diferencia medible se limita a las dos habilidades implantadas. No se dispone de datos de benchmarks frente a otros modelos de 3B en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo define como demostración de método, no como asistente de producción.
- Licencia Qwen Research: uso no comercial y de investigación; no apto para despliegue comercial sin autorización adicional.
- Solo se declara inglés; el rendimiento en otros idiomas no está garantizado por la card, aunque se evalúe Belebele en TR, AR, ZH y RU.
- Riesgo de alucinación inherente a un modelo de 3B, no cuantificado en la información disponible.
- Los benchmarks no ejecutados por el autor podrían degradarse; la afirmación de "sin regresión" se limita a los benchmarks medidos.
- Resultados no revisados externamente; el autor retira explícitamente interpretaciones anteriores de Model X-Ray como evidencia de esta fusión.
- El merge puede producir resultados degenerados si los especialistas se alejan mucho del base (control negativo documentado con caída al 0% en código).
- No hay pesos cuantizados publicados en el repo; el despliegue en hardware limitado requiere cuantización propia.
- Las habilidades implantadas son deliberadamente simples y verificables; no implican mejoras en razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetracta/Chimera-1-Qwen2.5-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Nota técnica del estudio: https://www.tetracta.ai/note-chimera-merge.html
- Página de investigación de Tetracta: https://www.tetracta.ai/research/
- Model X-Ray (servicio separado): https://www.tetracta.ai/work/model-xray.html
- Registro de corrección de Model X-Ray: https://www.tetracta.ai/model-xray/correction/
