# Urdatorn/OLMo1b-greek-sphragis

## Resumen

OLMo1b-greek-sphragis es un modelo de lenguaje de 1.176 millones de parámetros desarrollado por Urdatorn, resultado de un proceso de *continued pretraining* (preentrenamiento continuado) sobre el modelo base `allenai/OLMo-1B-hf` con un corpus exclusivo de griego antiguo. El modelo se creó como parte del proyecto Sphragis, un benchmark de atribución de autoría para textos griegos antiguos, y su propósito específico es servir como brazo de "preentrenamiento adicional" en una comparación controlada entre modelos de autoría construidos sobre una base adaptada al griego y sobre una base estándar.

El modelo se entrenó durante 360 millones de tokens (5.500 pasos, 4,79 épocas) sobre un corpus de 75 millones de tokens de texto griego antiguo normalizado, con una estrategia de parada temprana basada en la pérdida de validación. La relevancia de este modelo reside en su diseño metodológico: el corpus de entrenamiento es disjunto de los benchmarks de evaluación, lo que garantiza que cualquier mejora en la atribución de autoría se deba realmente a la adaptación lingüística y no a la contaminación de datos. El checkpoint publicado corresponde al paso 3.000, donde se alcanzó la mejor pérdida de validación (1,2240, perplexidad 3,401).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-1B) |
| Parametros totales | 1.176.764.416 (1,18B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bf16 (publicado); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Griego antiguo (grc), con capacidades residuales del modelo base en ingles |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-1B de Ai2, un transformer decoder estándar con 1,18 mil millones de parámetros y una ventana de contexto de 2.048 tokens. El proceso de adaptación consistió en un *continued pretraining* sobre el corpus `Urdatorn/sphragis-olmo1b-adaptation-corpus`, que a su vez se deriva del dataset `Ericu950/AncientGreek` (nivel `pristine`, fuente `oga` — Opera Graeca Adnotata). El corpus de entrenamiento se construyó con un riguroso proceso de filtrado: de 1.825 registros OGA, se descartaron 558 por pertenecer a autores del benchmark y 190 por tener identificadores no verificables, quedando 1.077 obras.

El entrenamiento utilizó una tasa de aprendizaje constante de 1e-4 tras 500 pasos de *warmup*, sin decay de peso, Adam con β₂ 0,999, batch de 16 por dispositivo sin acumulación de gradiente, y 65.536 tokens por paso. Se empleó precisión mixta fp32/bf16 con FSDP *full sharding* sobre dos GPU GH200, con un pico de 77,8 GiB por GPU y un tiempo total de cómputo de 64 minutos y 45 segundos. La parada temprana se activó cuando cinco mediciones consecutivas de pérdida de validación no superaron la mejor registrada, deteniéndose en el paso 5.500 aunque el checkpoint publicado corresponde al paso 3.000. Los datos se dividieron por obra completa (80/10/10) antes de la tokenización, evitando que bloques empaquetados de 2.048 tokens cruzaran las particiones.

## Capacidades

- Generación de texto en griego antiguo: el modelo puede continuar textos y estimar la probabilidad de secuencias en esta lengua, con una perplexidad de 3,401 en el conjunto de validación.
- Modelado de lenguaje para atribución de autoría: su función principal es servir como componente de un sistema de atribución basado en la "sorpresa" (perplejidad) que un texto produce en el modelo.
- Normalización de superficie: el corpus de entrenamiento se convirtió a la forma superficial del benchmark Sphragis (minúsculas sensibles a polifonía, eliminación de puntuación editorial, manejo compartido de elisiones y espacios colapsados), lo que alinea sus representaciones internas con el formato de evaluación.
- Capacidades residuales del modelo base: al partir de OLMo-1B, conserva capacidades generales de modelado del lenguaje en inglés, aunque degradadas por el preentrenamiento continuado.
- Sin soporte de *tool calling*, *function calling*, agentes, vision, audio ni modo de razonamiento explícito: es un modelo de lenguaje puro sin ajuste por instrucciones.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el modelo se integra en el benchmark Sphragis, donde un texto se atribuye al autor cuyo modelo dedicado lo encuentra "menos sorprendente" (menor perplejidad). Es el brazo de adaptación en la comparación controlada con una base no adaptada.
- Investigación en estilometría digital: permite comparar la capacidad de modelos adaptados frente a no adaptados para distinguir autores clásicos griegos, controlando el efecto de la adaptación lingüística.
- Evaluación de estrategias de *continued pretraining*: su diseño con parada temprana y corpus disjunto de los benchmarks lo convierte en un caso de estudio para metodologías de adaptación de modelos.
- Generación de texto en griego antiguo para fines educativos: puede producir texto sintético en esta lengua, aunque sin garantías de calidad estilística ni de precisión histórica.
- Estimación de probabilidad de secuencias para análisis filológico: su capacidad de asignar perplejidad a secuencias puede usarse para estudios cuantitativos de textos griegos, por ejemplo para identificar pasajes anómalos.
- Base para *fine-tuning* posterior en tareas específicas de procesamiento de griego antiguo: al estar adaptado a esta lengua, puede servir como punto de partida para tareas como etiquetado morfosintáctico o análisis sintáctico, si se dispone de datos anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion downstream no se ha ejecutado sobre este checkpoint: no hay cifras de perplejidad comparativa base-vs-adaptado ni puntuaciones sobre las frases de validacion de Sphragis. Los unicos datos disponibles son las metricas de entrenamiento:

| Paso | Epoca | Perdida de validacion | Perplejidad |
|---:|---:|---:|---:|
| 500 | 0,44 | 1,4552 | 4,285 |
| 1000 | 0,87 | 1,3284 | 3,775 |
| 1500 | 1,31 | 1,2723 | 3,569 |
| 2000 | 1,74 | 1,2433 | 3,467 |
| 2500 | 2,18 | 1,2449 | 3,473 |
| 3000 | 2,61 | 1,2240 | 3,401 |
| 3500 | 3,05 | 1,2601 | 3,526 |
| 4000 | 3,48 | 1,2449 | 3,473 |
| 4500 | 3,92 | 1,2325 | 3,430 |
| 5000 | 4,35 | 1,3207 | 3,746 |
| 5500 | 4,79 | 1,2946 | 3,650 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,18B parámetros en bf16, lo que supone aproximadamente 2,35 GB de pesos. Con overhead de activaciones y memoria del runtime, se recomiendan al menos 4 GB de VRAM para inferencia con contexto completo.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, etc.). Para entrenamiento o *fine-tuning*, se requieren GPUs con al menos 16-24 GB (RTX 3090, RTX 4090, A100).
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en cualquier GPU moderna.
- Opciones de despliegue: al ser un modelo OLMo en formato HuggingFace, puede ejecutarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. Para uso en el benchmark Sphragis, se usa con el código de `Urdatorn/sphragis_models`.
- Latencia y throughput: no hay mediciones publicadas. Como referencia orientativa, un modelo de 1B en bf16 en una GPU consumer genera decenas de tokens por segundo, pero no se dispone de cifras oficiales para este checkpoint.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables publicados, dado que este checkpoint es un artefacto de investigación con un proposito muy especifico. La comparacion relevante es con su propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Urdatorn/OLMo1b-greek-sphragis | 1,18B | 2.048 | CC BY-SA 4.0 | Adaptacion a griego antiguo para benchmark de autoria |
| allenai/OLMo-1B-hf | 1,18B | 2.048 | Apache 2.0 | Modelo base generalista en ingles |
| Urdatorn/olmo1b-ancient-greek | no disponible | no disponible | no disponible | Adaptacion anterior, retirada por contaminacion del corpus |

El autor menciona una adaptacion anterior de 7B que no cumplia los criterios metodologicos (termino en el limite de pasos con la perdida de validacion aun bajando) y un modelo `sphragis-alm-olmo3-greek-7b-plato` que es un *fine-tuning* por autor sobre OLMo3-7B adaptado al griego, pero no son comparables directamente por tamano y proposito.

## Limitaciones y advertencias

- Evaluacion pendiente: no se han publicado resultados de la evaluacion downstream. El modelo puede no cumplir su funcion prevista hasta que se demuestre experimentalmente.
- Corpus limitado: el entrenamiento se realizo sobre 75 millones de tokens de un unico genero textual (prosa clasica griega etiquetada con identificadores TLG), lo que limita su generalizacion a poesia, epigrafia o textos post-clasicos.
- Sobreajuste moderado: el autor senala que tras la epoca dos la perdida de entrenamiento sigue bajando mientras la de validacion se estabiliza, indicando un sobreajuste leve esperable con tasa de aprendizaje constante.
- Licencia CC BY-SA 4.0: esta licencia implica que cualquier obra derivada debe compartirse bajo la misma licencia. Es una restriccion relevante para uso comercial o para integracion en sistemas propietarios.
- Sin ajuste por instrucciones: el modelo no es un chatbot ni un asistente; no sigue instrucciones y no debe usarse para tareas interactivas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar texto factualmente incorrecto o estilisticamente anacronico en griego antiguo. No debe usarse para reconstruir textos historicos sin verificacion.
- Contaminacion residual: aunque el corpus se filtro contra los benchmarks, la naturaleza abierta del corpus fuente (Opera Graeca Adnotata) implica que no se puede garantizar una separacion absoluta en todos los casos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/OLMo1b-greek-sphragis
- Modelo base: https://huggingface.co/allenai/OLMo-1B-hf
- Corpus de adaptacion: https://huggingface.co/datasets/Urdatorn/sphragis-olmo1b-adaptation-corpus
- Dataset fuente: https://huggingface.co/datasets/Ericu950/AncientGreek
- Codigo: https://github.com/Urdatorn/sphragis_models
- Modelo relacionado (adaptacion anterior): https://huggingface.co/Urdatorn/olmo1b-ancient-greek
- Modelo relacionado (fine-tuning por autor): https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-plato
- Proyecto OLMo de Ai2: https://allenai.org/olmo
