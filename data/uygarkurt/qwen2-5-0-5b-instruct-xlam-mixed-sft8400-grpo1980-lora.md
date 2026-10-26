# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo1980-lora

## Resumen

Este repositorio contiene un adaptador LoRA denominado Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo1980-lora, publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct de Alibaba. No es un modelo completo, sino un adaptador PEFT que se carga encima del modelo base original: primero se realizó un ajuste supervisado (SFT) de 8.400 actualizaciones y después se continuó el entrenamiento con Group Relative Policy Optimization (GRPO) durante 1.980 actualizaciones adicionales. El objetivo declarado es doble: generar llamadas a herramientas estructuradas (tool calling) y abstenerse cuando las herramientas ofrecidas no son relevantes.

El modelo aborda un problema muy concreto en pipelines de agentes: los modelos pequeños tienden a inventar llamadas a funciones aunque ninguna de las disponibles encaje con la petición del usuario. El autor entrena explícitamente la "abstención" mediante RL, usando el dataset uygarkurt/xlam-tool-calling-mixed y la herramienta Post-Training Lab. El resultado es un adaptador de ~0,49 B de parámetros base (más el propio adaptador LoRA, cuyo tamaño no se especifica), pensado para entornos con recursos muy limitados.

Es relevante ahora por dos motivos: por un lado, demuestra un flujo completo SFT + GRPO reproducible en unas 2,3 horas de cómputo para un modelo de medio billón de parámetros; por otro, publica métricas separadas de relevancia e irrelevancia que hacen visible el compromiso inherente al entrenamiento con RL: la precisión en llamadas sube, pero la tasa de abstención correcta baja respecto al checkpoint SFT. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de investigación sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen2.5-0.5B-Instruct |
| Parametros totales | ~0,49 B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct; la serie Qwen2.5 anuncia hasta 128K en las variantes mayores |
| Tipos de cuantizacion | no especificados por el autor; al ser un adaptador sobre Qwen2.5-0.5B-Instruct se puede fusionar con el base y cuantizar a GGUF, AWQ o GPTQ con las herramientas habituales |
| Idiomas soportados | en (unico idioma declarado en la model card); el modelo base es multilingue, pero el entrenamiento del adaptador es en ingles |
| Licencia | no disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base tambien en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atención de causalidad completa, RoPE y aproximadamente 0,49 B de parámetros, ajustado originalmente con instrucciones por Alibaba. El autor no detalla en la model card el rango del LoRA, los módulos objetivo ni la configuración de entrenamiento (learning rate, batch, precisión), por lo que esos datos se consideran no disponibles. El repositorio ocupa 0,0 GB según HuggingFace, lo que sugiere un adaptador de tamaño reducido.

El entrenamiento se divide en dos fases sobre el mismo dataset mixto de tool calling (uygarkurt/xlam-tool-calling-mixed): 8.400 actualizaciones de SFT (1,3 horas) y 1.980 actualizaciones de GRPO (1,0 hora), con un total de 2,3 horas de bucle de entrenamiento, excluyendo carga de modelo y preparación de datos. La innovación destacable es el uso de GRPO —la variante de optimización por política relativa a un grupo, popularizada por DeepSeekMath— para reforzar dos comportamientos simultáneos: exactitud de la llamada (nombre de función y argumentos) y abstención ante herramientas irrelevantes. La evaluación se realizó con scripts propios del proyecto Post-Training Lab, lo que conviene tener en cuenta al comparar con cifras públicas de terceros.

## Capacidades

- Generación de llamadas a herramientas en formato estructurado (function calling de un solo turno), con una precisión de nombre de función del 96,63% en el holdout de xLAM.
- Abstención explícita cuando ninguna de las herramientas ofrecidas es relevante, con un 68,27% de acierto en el subconjunto de irrelevancia evaluado.
- Generación de texto conversacional y respuesta a instrucciones, heredada del ajuste original de Qwen2.5-0.5B-Instruct.
- Razonamiento básico y matemáticas elementales, con rendimiento bajo (MMLU 38,12%, MATH-500 18,60%).
- Seguimiento de instrucciones con formato, medido en IFEval con precisión estricta a nivel de prompt del 29,02%.
- Capacidad multilingüe teórica por el modelo base, aunque el adaptador solo declara inglés y fue entrenado con datos en inglés.
- No dispone de visión, audio, ni modo "thinking" explícito; tampoco se documenta soporte de agentes multi-paso, solo function calling de un turno.

## Casos de uso

- Enrutado de herramientas en agentes ligeros: el adaptador recibe la lista de funciones disponibles y la consulta del usuario y devuelve la llamada con nombre y argumentos; su 96,63% de acierto en nombre de función lo hace utilizable como primera etapa de selección antes de un modelo mayor.
- Filtro de abstención en cascada: colocado delante de un modelo grande, descarta peticiones que no encajan con el catálogo de herramientas (68,27% de detección de irrelevancia) y evita llamadas espurias a APIs internas.
- Despliegue en dispositivos edge y microcontroladores: con ~0,5 B de parámetros y cuantización a 4 bits cabe en unos cientos de MB, lo que permite function calling local en entornos tipo M5Stack o Raspberry Pi sin conexión.
- Prototipado rápido de pipelines de tool calling: al ser un adaptador LoRA, se puede cargar y descargar en segundos sobre el base para comparar variantes de prompt o de esquema de herramientas durante el desarrollo.
- Generación de JSON estructurado para APIs internas: con esquemas de función bien definidos, el modelo produce objetos de argumentos que se pueden validar con JSON Schema antes de ejecutar la acción.
- Investigación sobre RL para modelos pequeños: sirve como caso de estudio reproducible de SFT + GRPO en 2,3 horas de cómputo, útil para experimentar con funciones de recompensa y medir el intercambio entre exactitud y abstención.
- Docencia y experimentación con PEFT: al requerir muy poca VRAM, es adecuado para prácticas de ajuste fino y evaluación de function calling en cursos y laboratorios.
- Test de regresión de infraestructura de entrenamiento: sus métricas publicadas por checkpoint permiten verificar que un pipeline propio reproduce los mismos números.

## Benchmarks y rendimiento

Datos publicados por el autor. Todas las puntuaciones son porcentajes. La primera fila es el adaptador SFT que inicializó el GRPO; la segunda es el adaptador actual.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 8.400 | 37,91% | 18,00% | 29,21% | 71,49% | 86,88% | 46,24% | 55,56% | 88,59% | 1,3 |
| SFT + GRPO (este adaptador) | GRPO 1.980 | 38,12% | 18,60% | 29,02% | 79,27% | 96,63% | 56,66% | 83,33% | 68,27% | 2,3 |

Notas de metodología declaradas por el autor: xLAM ETC es exactitud exacta de la llamada a herramienta y xLAM FNA es exactitud del nombre de función; ambas se calculan sobre el holdout "calls-only" con 2.287 ejemplos evaluados y 700 omitidos, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno. Relevance e Irrelevance corresponden a subconjuntos seleccionados de relevancia. IFEval usa precisión estricta a nivel de prompt. Son agregados específicos del estudio y no directamente comparables con las cifras oficiales de los benchmarks.

## Requisitos de hardware

- VRAM estimada: ~1 GB en FP16 para el modelo base (~0,5 B de parámetros) más el adaptador; ~0,5 GB en INT8 y ~0,3-0,4 GB en INT4 tras fusionar y cuantizar.
- GPU recomendadas: cualquier GPU consumer sirve; RTX 3060 12 GB, RTX 4060, RTX 4090 o superiores ofrecen mucho margen. En centro de datos, A100 y H100 están sobredimensionadas para este tamaño y solo tienen sentido para servir muchos adaptadores en paralelo.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM, e incluso en CPU.
- Despliegue: transformers + peft para cargar el adaptador; vLLM con soporte de adaptadores LoRA para servicio multi-adaptador; TGI; llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF. Tambien es viable la inferencia en CPU pura con llama.cpp.
- Latencia y throughput: no disponibles; el autor no publica mediciones de inferencia. Por el tamaño, se espera latencia de pocos milisegundos por token en GPU moderna, pero es una estimación, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT 8.400 + GRPO 1.980) | ~0,49 B + LoRA (tamano no disponible) | 32.768 tokens (base) | xLAM FNA 96,63%, ETC 79,27%, BFCL 56,66%, MMLU 38,12% | no disponible | HuggingFace, 0 descargas |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora (solo SFT) | ~0,49 B + LoRA | 32.768 tokens (base) | xLAM FNA 86,88%, ETC 71,49%, BFCL 46,24%, MMLU 37,91% | no disponible | HuggingFace |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora | ~0,49 B + LoRA | 32.768 tokens (base) | no disponible en la informacion consultada | no disponible | HuggingFace |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora | ~0,49 B + LoRA | 32.768 tokens (base) | no disponible en la informacion consultada | no disponible | HuggingFace, tambien en FriendliAI |
| Qwen/Qwen2.5-0.5B-Instruct (base) | ~0,49 B | 32.768 tokens | sin adaptacion a tool calling especifico | Apache 2.0 | HuggingFace, Ollama, amplia adopcion |

La comparación interna con el checkpoint SFT es la más informativa: el GRPO añade 7,78 puntos de exactitud exacta de llamada y 10,42 puntos de BFCL single-turn, pero pierde 20,32 puntos de abstención correcta ante herramientas irrelevantes (de 88,59% a 68,27%) y no mejora IFEval.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen/Qwen2.5-0.5B-Instruct y la librería peft; no funciona como checkpoint independiente sin fusionar.
- El autor no declara licencia para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el repositorio genera incertidumbre legal para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- El entrenamiento y la evaluación son solo en inglés; el rendimiento en castellano u otros idiomas no está medido y probablemente sea deficiente para tool calling.
- Razonamiento y conocimientos muy limitados: MMLU 38,12%, MATH-500 18,60% e IFEval 29,02% sitúan al modelo muy por debajo de modelos de 7 B o más; no es apto para tareas que exijan comprensión profunda o matemáticas.
- Riesgo alto de alucinación en nombres de funciones y argumentos cuando el esquema de herramientas es grande o ambiguo; el 96,63% de FNA se midió sobre un holdout concreto y no garantiza generalización a APIs arbitrarias.
- Compromiso de abstención: el paso por GRPO redujo la detección de irrelevancia del 88,59% al 68,27%, de modo que aproximadamente una de cada tres peticiones sin herramienta adecuada podría recibir una llamada inventada. En producción conviene añadir una capa de validación de esquema y umbrales de confianza.
- Solo se documenta function calling de un turno; no hay evidencia de soporte fiable para agentes multi-paso, planificación encadenada ni estado persistente.
- Las métricas provienen de scripts personalizados del autor y de subconjuntos seleccionados de BFCL y xLAM, por lo que no son comparables con las cifras oficiales publicadas por esos benchmarks.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y repositorio creado y actualizado el mismo día; no hay informes independientes de calidad ni de estabilidad.
- La ventana de contexto efectiva en tool calling con prompts largos y muchos esquemas de función no está evaluada; el modelo base soporta 32.768 tokens, pero el adaptador se entrenó presumiblemente con secuencias mucho más cortas (dato no disponible).

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo1980-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Adaptador SFT previo (checkpoint inicial): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Variante SFT 5.600 pasos: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Variante SFT 14.000 pasos: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Despliegue de la variante SFT 5.600 en FriendliAI: https://friendli.ai/models/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Qwen2.5 0.5B Instruct en Ollama: https://ollama.com/library/qwen2.5:0.5b-instruct
- Documentacion de Qwen2.5-0.5B-Instruct en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
