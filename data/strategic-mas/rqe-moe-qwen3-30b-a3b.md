# strategic-mas/rqe-moe-qwen3-30b-a3b

## Resumen

RQE-MoE-Qwen3-30B-A3B es un adaptador experimental publicado por el usuario strategic-mas sobre el modelo base Qwen/Qwen3-30B-A3B. No se trata de un modelo completo, sino de un conjunto de pesos adicionales (un "add-on expert" y un LoRA de control) que se acoplan a un Qwen3-30B-A3B congelado. La innovación consiste en añadir, en cada capa MoE del modelo base, una neurona experta nueva con su propia compuerta, entrenando únicamente esas partes nuevas (226,6 millones de parámetros) mientras el resto del modelo permanece intacto.

El modelo está orientado a un dominio muy concreto: la resolución de trazas de equilibrio en teoría de juegos (RQE, probablemente "Rationalizable/Refinement Equilibrium" o similar dentro del proyecto del autor). El entrenamiento se realizó sobre 128.000 problemas de trazas de solver, complementados con texto general para que la compuerta aprenda a no activar el experto nuevo fuera del dominio. Se publica junto a un control LoRA plano (r=256) entrenado con los mismos datos, lo que permite comparar ambas estrategias de adaptación.

Es relevante porque documenta empíricamente si un experto añadido sobre un MoE congelado supera a un LoRA convencional en una tarea estructurada, y porque el autor libera los hiperparámetros completos y los resultados de evaluación. El repositorio ocupa 1,8 GB y la licencia es Apache 2.0. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer MoE (Qwen3-30B-A3B) con experto adicional por capa y compuerta propia |
| Parámetros totales | 226,6 M (add-on); 213,9 M (LoRA de control) |
| Parámetros activos | No disponible (el modelo base Qwen3-30B-A3B activa ~3 B por token; el adaptador añade un experto por capa) |
| Longitud de contexto | 12.288 tokens (longitud máxima de entrenamiento); la del modelo base no se especifica en la información disponible |
| Tipos de cuantización | No disponible (pesos en safetensors / state dict PyTorch) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y state dict `.pt` (`addon-2000.pt`, `addon-3000.pt`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Sobre esa arquitectura congelada, el add-on inserta un experto nuevo en cada capa MoE, junto a los expertos originales, con una compuerta independiente que decide cuándo activarlo. La compuerta se entrena con un objetivo doble: alcanzar una tasa de uso del 0,2 sobre los datos de la tarea y empujarla hacia cero en texto general. Los hiperparámetros de la compuerta son umbral 0,8, temperatura 0,02 y score inicial 0,75, con pesos de pérdida 1,0 para la tasa de uso y 1,0 para el texto general.

El entrenamiento usó las mismas trazas de solver RQE que el SFT denso (128.000 problemas), más cuatro filas de texto general por paso (máximo 2.048 tokens) para regular la compuerta. Se empleó AdamW con learning rate 1e-4, batch de 16 sobre 4 GPU, longitud máxima de 12.288 tokens y 3.000 pasos planificados, con un coste de 25,4 horas. El control LoRA plano (r=256, alpha=512, 213,9 M de parámetros) se entrenó con los mismos datos y learning rate, batch 16, detenido a los 2.000 pasos tras 9,4 horas.

## Capacidades

- Razonamiento estructurado en teoría de juegos: resolución de trazas de equilibrio para juegos entrenados y generalización a variantes no vistas (7-10 jugadores, colouring, hawk-dove-retaliator, battle of the sexes).
- Generación de distribuciones de probabilidad normalizadas: la evaluación exige suma 1 con margen de 0,002, y el add-on produce respuestas casi uniformes en el 95,5 % de los casos.
- Conservación de capacidades generales del modelo base: matemáticas (MATH-500) y código (LiveCodeBench) se mantienen cerca del nivel del Qwen3-30B-A3B congelado.
- Adaptación selectiva por compuerta: el experto nuevo se activa en el dominio RQE y se desactiva en texto general, lo que permite especializar sin degradar el comportamiento general.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas del adaptador.

## Casos de uso

- Investigación en adaptación de MoE: comparar empíricamente un experto añadido con compuerta frente a un LoRA plano sobre el mismo modelo congelado y los mismos datos, usando los checkpoints de 2.000 y 3.000 pasos y el control LoRA incluidos en el repositorio.
- Resolución de equilibrios en juegos de 2 a 10 jugadores: el add-on generaliza a configuraciones de 7-10 jugadores nunca vistas durante el entrenamiento (97,8 % frente a 94,5 % del LoRA), lo que lo hace útil para experimentos de teoría de juegos computacional.
- Análisis de juegos con estructura de coloreado o hawk-dove-retaliator: el adaptador alcanza 64,8 % en estas variantes no entrenadas, frente al 54,5 % del LoRA, lo que permite estudiar la transferencia fuera de distribución.
- Estudio de compuertas condicionales: el diseño con umbral 0,8 y temperatura 0,02 permite analizar cómo una compuerta aprendida decide activar un experto especializado y cómo se regula con texto general.
- Reproducción de experimentos de SFT sobre MoE: los ficheros `training_config.json` documentan todos los hiperparámetros, lo que facilita replicar el entrenamiento en clústeres de 4 GPU.
- Evaluación de degradación de capacidades generales: comparar MATH-500 (79,2 % add-on frente a 81,8 % base) y LiveCodeBench (43,6 % frente a 45,8 %) para medir el coste de especializar un MoE congelado.

## Benchmarks y rendimiento

Evaluación del add-on (paso 2.000) frente al LoRA plano (paso 2.000), sobre grupos de examen de teoría de juegos:

| Grupo de examen | Add-on | LoRA plano |
|---|---|---|
| Juegos entrenados | 99,0 % | 98,5 % |
| 7-10 jugadores (nunca entrenados) | 97,8 % | 94,5 % |
| Colouring + hawk-dove-retaliator (nunca entrenados) | 64,8 % | 54,5 % |
| Respuestas casi uniformes | 95,5 % | 88,9 % |
| Battle of the sexes (nunca entrenado) | 28,0 % | 30,0 % |

Capacidad general frente al modelo base congelado (MATH-500 81,8 %, LiveCodeBench 45,8 %):

| Benchmark | Base congelado | Add-on | LoRA plano |
|---|---|---|---|
| MATH-500 | 81,8 % | 79,2 % | 73,4 % |
| LiveCodeBench | 45,8 % | 43,6 % | 41,3 % |

La puntuación se calculó con la regla de suma corregida (las probabilidades deben sumar 1 con tolerancia de 0,002 y margen de coma flotante de 1e-9).

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por separado; requiere cargar el Qwen3-30B-A3B completo (30.000 M de parámetros) más los 226,6 M del add-on.
- GPU recomendadas: el entrenamiento se realizó con 4 GPU (modelo no especificado). Para inferencia del modelo base se necesitan configuraciones de alta memoria; no se detalla en la información disponible.
- GPU de consumo: no disponible; un MoE de 30 B totales con ~3 B activos requiere cuantización agresiva para caber en GPU de consumo, pero no se documentan formatos GGUF ni cuantizaciones para este adaptador.
- Opciones de despliegue: el código de carga se publica con el repositorio de entorno del autor (necesario para acoplar el add-on al modelo base). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RQE-MoE-Qwen3-30B-A3B (add-on) | 226,6 M entrenables sobre 30 B congelados | 12.288 (entrenamiento) | Experto añadido con compuerta por capa MoE | Apache 2.0 | Hugging Face (repo de 1,8 GB) |
| RQE plain-LoRA r256 (control) | 213,9 M entrenables sobre 30 B congelados | 12.288 (entrenamiento) | LoRA plano | Apache 2.0 | Incluido en el mismo repo |
| Qwen3-30B-A3B (base) | 30 B totales, ~3 B activos | No disponible | MoE transformer | Apache 2.0 | Hugging Face (Qwen) |

No se dispone de datos de benchmarks de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente "research artifact; no warranty". No está pensado para producción.
- Rendimiento débil en battle of the sexes: 28,0 % en el add-on y 30,0 % en el LoRA, lo que indica que el juego no entrenado no se resuelve de forma fiable.
- Degradación de capacidades generales: MATH-500 baja de 81,8 % a 79,2 % y LiveCodeBench de 45,8 % a 43,6 % respecto al base congelado.
- Dependencia de código externo: el adaptador necesita el código de carga del repositorio de entorno del autor para acoplarse al modelo base; no es un checkpoint autónomo.
- Idiomas no documentados: no se especifica qué lenguas soporta el adaptador ni si el entrenamiento incluyó datos multilingües.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni cuantizadas, lo que limita el despliegue en hardware de consumo.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un adaptador de dominio, el comportamiento fuera de la tarea RQE no está caracterizado.
- Contexto limitado a 12.288 tokens durante el entrenamiento; no se documenta la ventana nativa del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de garantías desaconsejan su uso en entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strategic-mas/rqe-moe-qwen3-30b-a3b
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
