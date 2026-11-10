# zsansan/PURE-PRM-7B

## Resumen

PURE-PRM-7B es un modelo de recompensa de proceso (Process Reward Model, PRM) desarrollado por el autor zsansan en el contexto del proyecto PURE. Se trata de un ajuste fino de Qwen2.5-Math-7B sobre el conjunto de entrenamiento del dataset PRM800K de OpenAI, y su funcion no es generar texto, sino puntuar la calidad de cada paso intermedio de una cadena de razonamiento matematico. El modelo clasifica cada paso como correcto o incorrecto emitiendo una recompensa entre -1 y 1, lo que lo hace util para seleccionar soluciones (Best-of-N) y para afinar LLM en tareas de razonamiento matematico.

Tecnicamente es un transformer decoder de la familia Qwen2 con 7.070.626.306 parametros, reutilizado como modelo de clasificacion de tokens (`token-classification`) con dos etiquetas. La innovacion respecto al PRM oficial de Qwen es que parte de la version base Qwen2.5-Math-7B en lugar de la variante Instruct, para mantener la coherencia con las lineas base del proyecto PURE. Ademas, se eliminan del entrenamiento las muestras de PRM800K cuyas consultas coinciden con el test de MATH, para evitar contaminacion.

Su relevancia actual radica en que los PRM son un componente clave en el pipeline de razonamiento de los LLM: permiten verificar paso a paso en lugar de solo el resultado final, lo que mejora la seleccion de respuestas en tareas de matematicas. La licencia Apache 2.0 facilita su uso comercial e integracion en pipelines de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) configurado como modelo de clasificacion de tokens |
| Parametros totales | 7.070.626.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Math-7B; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Math-7B |
| Dataset de entrenamiento | HuggingFaceH4/prm800k-trl-dedup (derivado de PRM800K) |
| Pipeline | token-classification (2 etiquetas) |
| Requisitos | transformers >= 4.40.0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Qwen2.5-Math-7B, un transformer decoder de 7.070 millones de parametros, reorientado a una cabeza de clasificacion de tokens con dos etiquetas (positiva y negativa). No se trata de un modelo generativo en su uso previsto: recibe una pregunta y una secuencia de pasos separados por dobles saltos de linea, y emite logits sobre un token separador insertado tras cada paso. La recompensa de cada paso se calcula como la diferencia entre la probabilidad de la etiqueta positiva y la negativa, quedando en el rango [-1, 1]; los pasos con recompensa positiva se consideran correctos.

El entrenamiento se realizo sobre el conjunto de entrenamiento de PRM800K, mapeando las etiquetas originales 1 y 0 a positivas y -1 a negativas. Para evitar contaminacion con el conjunto de evaluacion, se eliminaron las muestras de PRM800K cuyas consultas coinciden con el test de MATH. La eleccion de Qwen2.5-Math-7B (base) frente a Qwen2.5-Math-7B-Instruct se justifica por mantener la coherencia con las lineas base del proyecto PURE. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Puntuacion de pasos de razonamiento matematico: asigna una recompensa entre -1 y 1 a cada paso intermedio de una solucion.
- Verificacion de procesos: clasifica pasos como correctos o incorrectos, util para filtrar cadenas de razonamiento.
- Seleccion Best-of-N: agrega las recompensas por paso para obtener una recompensa de resultado y elegir la mejor solucion entre varias candidatas.
- Base para ajuste fino de LLM en razonamiento matematico, segun el flujo del proyecto PURE.
- Soporte de evaluacion en ProcessBench y PRM800K (mencionado en la model card, aunque el detalle no esta incluido en la informacion disponible).
- No es un modelo generativo: no produce texto ni respuestas, solo puntuaciones.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues.

## Casos de uso

- Seleccion Best-of-N en generacion matematica: se generan N soluciones candidatas con un LLM y se puntua cada paso con PURE-PRM-7B; la suma ponderada de recompensas permite elegir la solucion mas fiable sin depender solo del resultado final.
- Filtrado de datos de razonamiento: se puntuan cadenas de razonamiento generadas o recolectadas y se descartan aquellas con pasos de recompensa negativa, mejorando la calidad de datasets para ajuste fino.
- Entrenamiento por refuerzo con recompensa de proceso: el modelo actua como verificador paso a paso en pipelines de RL o DPO, penalizando razonamientos con pasos incorrectos aunque el resultado final sea correcto.
- Evaluacion de modelos matematicos: se compara la calidad del proceso de razonamiento de distintos LLM sobre el mismo problema, midiendo la proporcion de pasos correctos.
- Deteccion de alucinaciones en cadenas de razonamiento: los pasos con recompensa negativa senalan razonamientos inconsistentes que pueden indicar alucinacion o errores de calculo.
- Investigacion en verificacion de procesos: sirve como linea base reproducible (base en lugar de Instruct) para estudiar el impacto de los PRM en el razonamiento matematico.
- Integracion en sistemas de tutoria matematica: dado un problema y la resolucion paso a paso de un estudiante o de un modelo, se identifican los pasos erroneos para ofrecer retroalimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluacion mediante Best-of-N y en ProcessBench y PRM800K, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14 GB solo para pesos, mas memoria para activaciones y cache, por lo que se recomienda al menos 24 GB.
- En cuantizacion de 8 bits, el peso se reduce a unos 7 GB; en 4 bits, a unos 3,5-4 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para lotes grandes y evaluacion Best-of-N; RTX 4090 (24 GB) para inferencia en bfloat16 con lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16, y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers con `AutoModelForTokenClassification` y `trust_remote_code=True`; el uso como clasificador de tokens no encaja directamente en vLLM, TGI o llama.cpp sin adaptacion del pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| PURE-PRM-7B | 7.070 M | Qwen2.5-Math-7B | no disponible | Apache 2.0 | PRM de razonamiento matematico |
| Qwen2.5-Math-7B-PRM800K | no disponible | Qwen2.5-Math-7B-Instruct | no disponible | no disponible | PRM de razonamiento matematico |
| Qwen2.5-Math-7B | 7.070 M | - | no disponible | no disponible | LLM generativo de matematicas |
| Qwen2.5-Math-7B-Instruct | 7.070 M | Qwen2.5-Math-7B | no disponible | no disponible | LLM generativo de matematicas instruido |

La diferencia principal con el PRM oficial de Qwen (Qwen2.5-Math-7B-PRM800K) es el modelo base: PURE-PRM-7B parte de la version base y el de Qwen de la Instruct. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo puntua pasos de razonamiento; no debe usarse como LLM conversacional.
- Depende de un formato de entrada concreto (pasos separados por dobles saltos de linea y token separador tras cada paso); un formato incorrecto invalida las puntuaciones.
- Entrenado exclusivamente sobre PRM800K, centrado en matematicas; su comportamiento fuera de ese dominio no esta documentado.
- No se documentan idiomas soportados; probablemente el rendimiento sea mejor en ingles, idioma de PRM800K, pero no esta confirmado.
- Riesgo de sesgo hacia el estilo de razonamiento presente en PRM800K y en Qwen2.5-Math-7B.
- Riesgo de alucinacion en las puntuaciones: pasos plausibles pero incorrectos podrian recibir recompensa positiva, y viceversa.
- Aunque la licencia es Apache 2.0, el modelo base Qwen2.5-Math-7B tiene su propia licencia que debe verificarse antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por la comunidad.
- La model card menciona evaluacion en ProcessBench y PRM800K, pero no publica cifras en el material disponible.

## Enlaces

- Hugging Face: https://huggingface.co/zsansan/PURE-PRM-7B
- Repositorio PURE en GitHub: https://github.com/CJReinforce/PURE
- Paper PRM800K de OpenAI: https://github.com/openai/prm800k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- PRM oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Math-7B-PRM800K
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/prm800k-trl-dedup
- arXiv referenciado en tags: https://arxiv.org/abs/2504.15275
