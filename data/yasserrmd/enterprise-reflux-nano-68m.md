# yasserrmd/enterprise-reflux-nano-68m

## Resumen

Enterprise Reflux Nano 68M es un modelo de decisión de tipo encoder bidireccional, desarrollado por Mohamed Yasser (yasserrmd) dentro de la serie de investigación "Enterprise Reflux Decision Intelligence". Se trata del quinto experimento de la familia y está construido como un fine-tuning del checkpoint typestrict/TS-Ettin-68M, un encoder ModernBERT de 19 capas con dimensión oculta 512 y 8 cabezas de atención. Con 68.415.618 parámetros y un tamaño de repositorio de 0,3 GB, está diseñado explícitamente para ejecutarse en CPU en entornos con recursos limitados.

El modelo no genera texto libre: recibe un estado estructurado y un conjunto de acciones candidatas, y devuelve un ranking de esas candidatas junto con una clasificación de ejecución y la posibilidad de emitir una abstención (NO_ACTION). Esta separación arquitectónica entre selección de acción, abstención, clasificación de ejecución y autorización determinista externa lo sitúa como una capa "System-1" dentro de arquitecturas agénticas y de automatización empresarial, donde el modelo propone pero no ejecuta.

Es relevante ahora porque propone un patrón de despliegue de bajo coste para toma de decisiones estructuradas: 97,18% de Top-1 en el test estándar held-out con solo 68 millones de parámetros, latencias medidas de 46 ms en GPU y 172,79 ms en CPU (P50), y licencia Apache 2.0. El estado del proyecto es experimental y la propia model card advierte que los conjuntos de evaluación son desafíos controlados internos, no benchmarks de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT / Ettin, encoder bidireccional; 19 capas; dimensión oculta 512; 8 cabezas de atención; scoring nativo de tokens OPT |
| Parametros totales | 68.415.618 (68.410.881 entrenables + 4.737 congelados en la cabeza de confianza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint nativo de PyTorch); ONNX no disponible en esta versión |

## Arquitectura y entrenamiento

El modelo parte de typestrict/TS-Ettin-68M (revisión fijada `a2dd8caf9e4f8e1f7f61874f48bca65b165198c9`), un encoder bidireccional de la familia ModernBERT/Ettin con 19 capas, dimensión oculta de 512 y 8 cabezas de atención. Sobre esa base se realiza un fine-tuning completo del encoder, de los embeddings de tipo de pregunta y del scorer de candidatas, manteniendo congelados 4.737 parámetros de la cabeza de confianza. El modelo puntúa candidatas mediante scoring nativo de tokens OPT en lugar de generación autoregresiva.

El entrenamiento usó 91.636 ejemplos durante 2 épocas, con AdamW8bit, autocast en BF16, learning rate 8e-6, micro-batch de 16, acumulación de gradiente de 4 (batch efectivo 64), 2.864 actualizaciones del optimizador y semilla 42, sobre una NVIDIA L4 sin gradient checkpointing. Los objetivos combinan ranking estructurado de candidatas y clasificación de ejecución cuando existen etiquetas de ejecución; las etiquetas desconocidas se excluyen de la pérdida de clasificación. El checkpoint final se selecciona por rendimiento en validación, no por resultados de test. El corpus Decision-100K+ combina escenarios empresariales estructurados, ejemplos condicionados por políticas, pares contrafactuales y ejemplos derivados de intenciones públicas, con splits de 91.636 (train), 6.086 (validación), 2.841 (calibración), 3.017 (test estándar), 200 (Extreme-200), 400 (Hard-400) y 500 (Mixed-500), sumando 104.680 registros.

## Capacidades

- Ranking de acciones candidatas sobre un estado estructurado y un conjunto cerrado de opciones.
- Abstención explícita mediante la etiqueta NO_ACTION, con accuracy y F1 del 100% en el test estándar reportado.
- Clasificación de ejecución (ACT/ESCALATE) cuando existen etiquetas de ejecución; macro F1 reportado del 100% en el test estándar.
- Calibración de confianza por candidata (error de calibración de elección del 0,89% en el test estándar).
- Discriminación contrafactual: capacidad de distinguir pares de escenarios que difieren en un factor relevante (95,69% de accuracy en pares contrafactuales).
- Ejecución CPU-first, pensada para sistemas agénticos con recursos limitados.
- No soporta generación de texto libre, tool calling genérico ni razonamiento multi-paso autónomo: la interfaz prevista es el runtime nativo específico del modelo, no un pipeline AutoModel de generación de texto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el estado de un ticket y un conjunto cerrado de colas o equipos candidatos, el modelo rankea la asignación más probable y puede abstenerse (NO_ACTION) cuando la confianza es baja, derivando a revisión humana.
- Clasificación de acciones en flujos RPA: antes de que un bot ejecute un paso, el modelo evalúa el estado del proceso y las acciones candidatas, y la capa determinista externa decide si se autoriza la ejecución.
- Triaje de alertas de seguridad: con un estado estructurado de la alerta y un conjunto de respuestas posibles (escalar, ignorar, bloquear), el modelo propone la acción y marca ESCALATE cuando corresponde revisión humana.
- Selección de siguiente paso en agentes con presupuesto de cómputo: al ser un modelo de 68M con latencia P50 de 46 ms en GPU y 172,79 ms en CPU, puede invocarse en cada iteración de un bucle agéntico sin dominar el coste total.
- Moderación de decisiones con abstención: en pipelines donde el coste de un falso positivo es alto, la etiqueta NO_ACTION permite que el sistema no actúe cuando el modelo no tiene evidencia suficiente.
- Evaluación de políticas empresariales: dado un escenario condicionado por políticas y un conjunto de resoluciones candidatas, el modelo rankea la resolución conforme a la política, útil para prevalidar solicitudes antes de su aprobación formal.
- Investigación en arquitecturas System-1/System-2: como capa rápida de selección de acción delante de un modelo grande de razonamiento, reduciendo el número de llamadas al modelo costoso.

## Benchmarks y rendimiento

Resultados de evaluación reportados por el autor sobre conjuntos de desafío controlados internos (no son benchmarks de terceros):

| Suite de evaluacion | Muestras | Base Top-1 | Fine-tuned Top-1 | Delta |
|---|---:|---:|---:|---:|
| Standard held-out test | 3.017 | 51,91% | 97,18% | +45,28 pp |
| Extreme-200 | 200 | 41,50% | 59,50% | +18,00 pp |
| Hard-400 | 400 | 31,50% | 64,50% | +33,00 pp |
| Mixed-500 | 500 | 43,60% | 61,80% | +18,20 pp |
| Combined frozen | 1.100 | 38,82% | 62,36% | +23,55 pp |

Detalle del test estándar:

| Metrica | Resultado |
|---|---:|
| Top-1 accuracy | 97,18% |
| Top-2 accuracy | 99,47% |
| Top-3 accuracy | 99,87% |
| Concrete-action accuracy | 96,72% |
| NO_ACTION accuracy | 100,00% |
| NO_ACTION F1 | 100,00% |
| ACT/ESCALATE macro F1 | 100,00% |
| Counterfactual pair accuracy | 95,69% |
| Choice calibration error (ECE) | 0,89% |
| Execution gate coverage | 0,00% |

Latencia de inferencia medida (100 casos, excluye tokenización y procesamiento externo; 4 hilos de CPU donde aplica):

| Backend | P50 | P95 |
|---|---:|---:|
| CPU / nativo | 172,79 ms | 257,37 ms |
| GPU / nativo | 46,00 ms | 47,77 ms |

No se han publicado resultados en benchmarks estándar de terceros (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 68,4M de parámetros, los pesos en BF16 ocupan aproximadamente 137 MB y en FP32 unos 274 MB, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: el autor reporta mediciones sobre NVIDIA L4; por tamaño, cualquier GPU con al menos ~1 GB de memoria libre debería poder alojar los pesos, aunque no se han publicado mediciones en otras GPU.
- Cabe en GPU de consumo: sí, por tamaño de pesos (el repositorio completo ocupa 0,3 GB), aunque no hay mediciones publicadas en RTX 4090, RTX 3090 u otras tarjetas de consumo.
- Despliegue: runtime nativo específico del modelo con `transformers==5.17.0`, `huggingface_hub`, `safetensors`, `torch` y `numpy`. No se debe usar un pipeline genérico AutoModel de generación de texto. ONNX no está disponible en esta versión. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: P50 de 172,79 ms y P95 de 257,37 ms en CPU nativo; P50 de 46,00 ms y P95 de 47,77 ms en GPU nativo. No se publica throughput (peticiones por segundo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros ni de mediciones comparativas con otros modelos de decisión o encoders de tamaño similar en la información proporcionada. La model card solo compara el modelo con su propio checkpoint base (typestrict/TS-Ettin-68M): 51,91% frente a 97,18% de Top-1 en el test estándar.

| Modelo | Parametros | Contexto | Top-1 (test interno) | Licencia | Estado |
|---|---:|---|---:|---|---|
| Enterprise Reflux Nano 68M | 68,4M | no disponible | 97,18% | Apache 2.0 | Experimental |
| typestrict/TS-Ettin-68M (base) | ~68M | no disponible | 51,91% | no disponible | Checkpoint base |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental de investigación: no está validado para producción ni para toma de decisiones reales sin supervisión.
- Los conjuntos de evaluación son desafíos controlados internos del autor, no benchmarks independientes ni resultados del mundo real verificados.
- El modelo propone decisiones; no otorga autoridad para ejecutar transacciones ni modificar sistemas externos. La autorización debe residir en una capa determinista externa.
- La cobertura de la compuerta de ejecución (execution gate coverage) es del 0,00% en el test estándar, lo que limita la evidencia sobre la clasificación de ejecución en ese conjunto.
- Rendimiento degradado en escenarios difíciles: 59,50% en Extreme-200 y 64,50% en Hard-400, muy por debajo del 97,18% del test estándar.
- No se han publicado datos sobre sesgos, idiomas soportados ni comportamiento fuera de los dominios de entrenamiento.
- La interfaz es específica: un pipeline genérico de generación de texto no es el uso previsto y puede producir resultados incorrectos.
- No se incluyen los registros de entrenamiento originales, ejemplos de evaluación en bruto, predicciones por registro, checkpoints de recuperación ni cachés de tokenización.
- No hay artefacto ONNX validado; el soporte ONNX se añadirá tras exportación y verificación de paridad.
- Las latencias publicadas excluyen tokenización y procesamiento externo, por lo que no representan la latencia extremo a extremo de un servicio.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución de fuentes y los términos de los datasets en cualquier redistribución separada de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/enterprise-reflux-nano-68m
- Perfil del autor: https://huggingface.co/yasserrmd
- Checkpoint base: https://huggingface.co/typestrict/TS-Ettin-68M
