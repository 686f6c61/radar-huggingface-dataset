# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo660-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo660-lora es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No es un modelo completo, sino un conjunto de pesos de adaptador (PEFT) que se carga sobre el modelo base original y que, según el autor, ya incorpora la fase de SFT previa, por lo que no es necesario aplicar un adaptador adicional. Su propósito concreto es el de entrenar tool calling estructurado y la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta.

El entrenamiento se realizó con la herramienta Post-Training Lab del mismo autor sobre el dataset uygarkurt/xlam-tool-calling-mixed, en dos etapas: 5.600 actualizaciones de supervised fine-tuning seguidas de 660 actualizaciones de Group Relative Policy Optimization (GRPO). El interés de la ficha está en que documenta de forma explícita la curva de entrenamiento y el efecto marginal de GRPO sobre un adaptador SFT ya existente, con métricas de función y de relevancia de herramientas, algo poco habitual en adaptadores de este tamaño.

Se trata de un experimento de escala muy reducida: 0,5 mil millones de parámetros, licencia no declarada y un único idioma soportado (inglés). Es relevante como referencia metodológica para pipelines de post-entrenamiento de bajo coste (1,3 horas de cómputo total declaradas) y como punto de partida para quien quiera reproducir recetas de GRPO aplicadas a function calling en modelos que caben en cualquier GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con adaptador LoRA sobre las capas del modelo base |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); el adaptador LoRA añade un numero reducido de parametros entrenables, no cuantificado en la informacion disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-0.5B-Instruct (no declarado en la model card del adaptador) |
| Tipos de cuantizacion | no disponible. El repositorio solo publica pesos de adaptador en safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (la model card del adaptador no la declara; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT y transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parámetros con atención causal estándar y RoPE. El adaptador es de tipo LoRA (PEFT) y se publica como pesos separados que deben cargarse junto al modelo base; no se distribuye una versión fusionada. La model card no detalla el rango, el alpha, los módulos objetivo ni el dropout del adaptador.

El entrenamiento consta de dos fases sobre el dataset uygarkurt/xlam-tool-calling-mixed. La primera realiza 5.600 actualizaciones de SFT (0,9 horas de bucle de entrenamiento). La segunda parte de ese adaptador SFT y continúa con 660 actualizaciones de GRPO (0,4 horas), con el objetivo declarado de entrenar tool calling estructurado y la abstención ante herramientas irrelevantes. El total declarado es de 1,3 horas, excluyendo carga de modelo, preparación de datos y evaluación externa. La model card no especifica el volumen de tokens, la composición exacta del dataset, la configuración de recompensas de GRPO ni si hubo fases adicionales de alineamiento más allá de GRPO.

La innovación destacable no es arquitectónica sino metodológica: la comparación directa entre el adaptador SFT de partida y el adaptador SFT+GRPO sobre el mismo conjunto de evaluaciones, con métricas desglosadas de precisión de llamada, precisión de nombre de función y, sobre todo, relevancia e irrelevancia de herramientas, que es donde GRPO produce la mejora más clara.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emisión de llamadas a función en formato estructurado, evaluado con las métricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente mediante GRPO para no forzar una llamada cuando ninguna de las herramientas ofrecidas es pertinente.
- Razonamiento de un solo turno en el ámbito de function calling (BFCL single-turn FC).
- Seguimiento de instrucciones básico (IFEval, precisión estricta a nivel de prompt del 32,16%).
- Razonamiento matemático limitado (MATH-500, 18,80%).
- Capacidades de agente multi-paso y de planificación: no evaluadas ni declaradas en la información disponible.
- Multilingüismo: no. El adaptador declara únicamente inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Clasificación y enrutado de intenciones con abstención: el adaptador está entrenado para decidir entre llamar a una herramienta del catálogo ofrecido o rechazar la petición cuando ninguna encaja, lo que permite usarlo como primera capa de un router de herramientas en un asistente, derivando a un fallback humano o a un mensaje aclaratorio cuando la relevancia es baja.
- Extracción de parámetros en pipelines de automatización: dado un esquema de funciones y una consulta en inglés, el modelo emite la llamada con nombre de función y argumentos, con una precisión de nombre de función del 97,11% en el holdout xLAM evaluado, adecuada para prototipos de integración con APIs internas.
- Prototipado rápido en local: al ser un adaptador sobre un modelo de 0,5B, se puede cargar y ejecutar en CPU o en una GPU de consumo para validar un esquema de herramientas antes de invertir en un modelo mayor.
- Evaluación de recetas de post-entrenamiento: sirve como caso de referencia reproducible (SFT 5.600 + GRPO 660, 1,3 horas) para equipos que quieran medir el efecto de GRPO sobre function calling en modelos pequeños antes de escalar la receta.
- Filtrado previo en sistemas de atención al cliente: el modelo puede decidir si la consulta del usuario corresponde a una de las acciones disponibles (cancelar pedido, consultar estado, etc.) y devolver una llamada estructurada o una abstención, reduciendo llamadas erróneas a backends.
- Generación de datos sintéticos de tool calling: por su bajo coste de inferencia, puede emplearse para producir borradores de pares consulta-llamada que luego se filtren con un modelo mayor, aprovechando su alta precisión de nombre de función.
- Docencia y demostraciones: ejemplo compacto de adaptador LoRA con evaluación desglosada de relevancia e irrelevancia, útil para explicar el efecto de GRPO con números concretos.

## Benchmarks y rendimiento

Resultados declarados por el autor. Todas las puntuaciones son porcentajes. La primera fila corresponde al adaptador SFT de partida; la segunda, al adaptador SFT+GRPO de este repositorio.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT de partida | SFT 5.600 | 39,42 | 18,00 | 31,24 | 77,61 | 97,46 | 53,04 | 83,33 | 49,46 | 0,9 |
| SFT + GRPO (este adaptador) | GRPO 660 | 39,34 | 18,80 | 32,16 | 77,87 | 97,11 | 55,38 | 83,33 | 55,26 | 1,3 |

Notas metodológicas de la model card: xLAM ETC es la precisión exacta de llamada a herramienta y xLAM FNA la precisión del nombre de función; ambas se calculan sobre el holdout de solo llamadas, con 2.287 ejemplos evaluados y 700 descartados, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios del Post-Training Lab.

Lectura de los datos: GRPO apenas altera MMLU (−0,08 puntos), mejora ligeramente MATH-500 (+0,80), IFEval (+0,92), xLAM ETC (+0,26) y BFCL single-turn FC (+2,34), mantiene Relevance idéntica (83,33) y sube Irrelevance 5,80 puntos (49,46 a 55,26). El coste es una caída de 0,35 puntos en xLAM FNA. La mejora más sólida es, por tanto, la abstención ante herramientas irrelevantes, que sigue siendo el punto más débil en términos absolutos (55,26%).

## Requisitos de hardware

- VRAM estimada para el modelo fusionado en fp16: aproximadamente 1 GB de pesos (0,5B × 2 bytes) más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contextos cortos.
- En cuantización de 8 bits: alrededor de 0,5-0,6 GB de pesos. En 4 bits: alrededor de 0,3-0,4 GB. Estas variantes no se publican en el repositorio y requerirían cuantizar el modelo fusionado por cuenta propia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para servir en producción con concurrencia, una L4, A10G o A100 aportarían margen de sobra, aunque el cuello de botella sería el throughput, no la memoria.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para prototipos y para lotes pequeños.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; llama.cpp u Ollama si se fusiona y convierte a GGUF; vLLM o TGI si se fusiona el adaptador y se sirve el modelo completo (vLLM permite cargar adaptadores LoRA en caliente con --enable-lora).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia por token muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Benchmark disponible |
|---|---|---|---|---|---|
| Este adaptador (SFT+GRPO sobre Qwen2.5-0.5B-Instruct) | 0,5B + LoRA | 32.768 tokens (heredado del base) | Tool calling con abstención | no disponible | MMLU 39,34; IFEval 32,16; BFCL single-turn FC 55,38; xLAM ETC 77,87; Irrelevance 55,26 |
| Qwen/Qwen2.5-0.5B-Instruct (modelo base) | 0,5B | 32.768 tokens | Instrucciones generales, sin entrenamiento específico de tool calling con abstención | Apache 2.0 | No se incluyen en la model card del adaptador; no comparables directamente con las métricas de este estudio |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Instrucciones generales | Apache 2.0 | No disponible en la información proporcionada |
| Adaptadores de function calling de la familia xLAM (p. ej. Salesforce xLAM-1B) | ~1B | no disponible | Tool calling especializado | no disponible | No disponible en la información proporcionada; el adaptador usa el dataset xLAM pero no se compara con modelos xLAM |

La comparación cuantitativa solo es posible contra el propio adaptador SFT de partida, ya incluido en la tabla de benchmarks. Frente al modelo base no hay números comparables publicados en esta ficha; frente a modelos de mayor tamaño o a adaptadores xLAM no hay datos en la información disponible, por lo que cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Licencia no declarada en la model card. Aunque el modelo base Qwen2.5-0.5B-Instruct es Apache 2.0, la ausencia de licencia explícita para el adaptador es un riesgo para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Idioma: solo inglés declarado. El comportamiento en castellano no está evaluado y no debería asumirse.
- Escala muy reducida: 0,5B de parámetros. MMLU 39,34% e IFEval 32,16% sitúan al modelo muy por debajo de lo aceptable para tareas generales de razonamiento o de seguimiento de instrucciones complejas. Está pensado para una tarea acotada, no como asistente general.
- Abstención todavía débil: la métrica de Irrelevance es del 55,26%, es decir, aproximadamente una de cada dos consultas con herramientas irrelevantes no se resuelve correctamente. No es fiable como única capa de decisión en producción.
- Riesgo de alucinación de nombres de función: aunque xLAM FNA es alto (97,11%), al combinarse con errores de argumentos y con la caída de 0,35 puntos respecto al adaptador SFT, conviene validar esquemáticamente toda llamada generada antes de ejecutarla.
- El adaptador no debe usarse sin el modelo base: es un conjunto de pesos LoRA y requiere cargar Qwen/Qwen2.5-0.5B-Instruct. Cargarlo sobre otro modelo o sin el base produce resultados inválidos.
- Las métricas proceden de scripts propios del autor y de agregados específicos del estudio (subconjuntos seleccionados de BFCL-v3, holdout de solo llamadas con 700 ejemplos descartados), por lo que no son directamente comparables con cifras publicadas de otros trabajos.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre composición demográfica del dataset de entrenamiento. El dataset xLAM mixto proviene de datos de function calling, con la distribución de dominios y estilos que ello implica.
- Sin datos de uso: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de validación por terceros.
- Longitud de contexto: los 32.768 tokens son los del modelo base; no se ha verificado que el adaptador mantenga el rendimiento en contextos largos con muchas herramientas declaradas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo660-lora
- Adaptador SFT de partida: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de la herramienta de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
