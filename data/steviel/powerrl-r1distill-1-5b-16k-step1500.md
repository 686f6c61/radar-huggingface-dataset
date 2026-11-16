# steviel/powerrl-r1distill-1.5b-16k-step1500

## Resumen

PowerRL R1-Distill 1.5B es un ajuste fino por aprendizaje por refuerzo de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, desarrollado por el usuario steviel, orientado a matematicas de competicion con un esfuerzo de razonamiento controlable. La innovacion principal es que un system prompt selecciona uno de cinco niveles de esfuerzo (Low, Limited, Mid, High, Xhigh); los niveles bajos responden con menos tokens a cambio de menor precision, lo que permite ajustar el coste computacional en funcion del caso de uso.

El modelo parte de la arquitectura Qwen2 del modelo base, con 1.777.088.000 parametros totales en pesos bf16 y una ventana de contexto de 16.384 tokens para la respuesta generada. Se entreno durante 1.500 pasos sobre el dataset DAPO-Math-17k deduplicado, con 128 problemas y 16 respuestas muestreadas por paso, y la recompensa combina la correccion de la respuesta en caja con la longitud de la respuesta, ponderada segun el nivel de esfuerzo.

Es relevante porque demuestra que un modelo de 1.5B puede alcanzar hasta un 43,0 % en AIME 2024 y un 31,1 % en AIME 2025 con un control explicito del presupuesto de razonamiento, un comportamiento tipico de modelos mucho mayores. La licencia MIT y el formato safetensors facilitan su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens de respuesta (cap de generacion); contexto de entrada no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only denso con tokenizer y chat template identicos a los del base. No se introducen cambios estructurales: el ajuste es puramente de pesos mediante RL.

El entrenamiento consistio en 1.500 pasos con 128 problemas por paso y 16 respuestas muestreadas por problema (2.048 muestras por paso), con un cap de 16.384 tokens por respuesta. Los datos provienen de DAPO-Math-17k, deduplicado. La funcion de recompensa combina la correccion de la respuesta final en `\boxed{}` con la longitud de la respuesta, ponderada por el nivel de esfuerzo seleccionado mediante system prompt. Los prompts de los niveles Low, Mid, High y Xhigh son los mode prompts de ORBIT (arXiv 2601.08310, Tabla 5); el nivel Limited se anadio especificamente para este modelo. El repositorio contiene los pesos fusionados completos (bf16) del paso 1.500.

## Capacidades

- Generacion de texto y razonamiento matematico de competicion (AIME, problemas con respuesta en caja).
- Razonamiento multi-paso con esfuerzo controlable: cinco niveles (Low, Limited, Mid, High, Xhigh) seleccionables por system prompt.
- Ajuste dinamico de coste: el nivel Low promedia 898 tokens en AIME 2024 frente a 7.921 del nivel Xhigh.
- Generacion conversacional mediante chat template de Qwen2.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o thinking mode nativo: no disponible (el razonamiento se induce via prompt, no via modo dedicado).

## Casos de uso

- Evaluacion de modelos matematicos en investigacion: el modelo permite medir la relacion entre presupuesto de razonamiento y precision usando los cinco niveles de esfuerzo sobre el mismo problema, lo que facilita estudios de escalado de test-time compute.
- Generacion de soluciones paso a paso para problemas de competicion: con el nivel High se obtienen respuestas con verificacion de pasos clave y un 43,0 % de acierto en AIME 2024, adecuado para generar datasets de soluciones verificadas.
- Sistemas de tutoria matematica con coste controlado: el nivel Mid (4.054 tokens de media, 35,7 % en AIME 2024) equilibra calidad y latencia para respuestas interactivas.
- Clasificacion o filtrado rapido de problemas: el nivel Low (898 tokens de media) permite descartar rapidamente problemas triviales o mal formados antes de enviarlos a un modelo mayor.
- Destilacion de datos de razonamiento: generar cadenas de razonamiento largas (nivel Xhigh, hasta 16.384 tokens) para entrenar modelos menores o para aumentar datasets de matematicas.
- Despliegue en entornos con recursos limitados: con 1.5B parametros y licencia MIT, puede ejecutarse en una unica GPU consumer para prototipos de razonamiento matematico sin coste de licencia.
- Investigacion sobre reward hacking y longitud de respuesta: el diseno de recompensa (correccion frente a longitud) lo convierte en una base para estudiar el equilibrio entre verbosidad y precision.

## Benchmarks y rendimiento

AIME 2024 y AIME 2025, 30 problemas cada uno, 256 respuestas muestreadas por problema y nivel (7.680 por celda), temperatura 0,6, top-p 0,95, maximo 16.384 tokens nuevos. Una respuesta que alcanza el cap cuenta como incorrecta. El valor +- es el error estandar por muestreo.

| Nivel de esfuerzo | AIME 2024 | Tokens medios | Truncados | AIME 2025 | Tokens medios | Truncados |
|---|---|---|---|---|---|---|
| Xhigh | 42,5 +- 0,4 % | 7.921 | 5,7 % | 30,8 +- 0,3 % | 7.911 | 4,8 % |
| High | 43,0 +- 0,4 % | 7.109 | 4,3 % | 31,1 +- 0,3 % | 7.073 | 3,5 % |
| Mid | 35,7 +- 0,4 % | 4.054 | 1,4 % | 27,9 +- 0,3 % | 3.248 | 0,6 % |
| Limited | 29,6 +- 0,3 % | 2.104 | 0,4 % | 22,6 +- 0,3 % | 1.746 | 0,2 % |
| Low | 17,9 +- 0,3 % | 898 | 0,8 % | 14,9 +- 0,3 % | 723 | 0,7 % |

Xhigh y High no son distinguibles en precision; High usa aproximadamente un 10 % menos de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,6 GB solo para pesos, mas KV cache; en la practica unos 4-6 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2 GB de pesos; en 4 bits, aproximadamente 1 GB de pesos (cuantizaciones no publicadas por el autor, generables con herramientas estandar).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060/4060 en adelante para consumer; A100/H100 para throughput alto en produccion.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2024 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PowerRL R1-Distill 1.5B (este) | 1,78B | 16.384 tokens de respuesta | 43,0 % (High) | MIT | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | no disponible | no disponible en la informacion | MIT | Hugging Face |
| Qwen2.5-Math-1.5B | 1,5B | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Entrenado exclusivamente en matematicas de competicion (DAPO-Math-17k); el rendimiento en dominios generales, codigo o conversacion abierta no esta medido y puede degradarse respecto al modelo base.
- Riesgo de alucinacion en pasos intermedios: el modelo puede producir razonamientos plausibles con respuesta final incorrecta; la recompensa solo valida la respuesta en caja.
- El formato de prompt es estricto: exige el system prompt exacto (incluida la apostrofe tipografica ’) y el sufijo `Let's think step by step and output the final answer within \boxed{}.`; desviarse puede alterar el comportamiento de esfuerzo.
- Los niveles Xhigh y High no mejoran la precision de forma significativa, pero Xhigh consume mas tokens y tiene mayor tasa de truncamiento (5,7 % frente a 4,3 % en AIME 2024).
- El cap de 16.384 tokens penaliza problemas que requieren razonamientos mas largos: las respuestas truncadas se cuentan como incorrectas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo es un experimento de investigacion con 0 descargas y 0 likes en el momento de la ficha.
- No se han publicado datos sobre sesgos, seguridad o comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/steviel/powerrl-r1distill-1.5b-16k-step1500
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Paper ORBIT (prompts de esfuerzo): https://arxiv.org/abs/2601.08310
