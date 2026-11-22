# vaibhav-mugulavalli-2004/ToolCall-200M-DPO

## Resumen

ToolCall-200M-DPO es un checkpoint de ajuste fino mediante Direct Preference Optimization (DPO) orientado al formato de salida, construido sobre ToolCall-200M-SFT-v4, un modelo de 200 millones de parámetros entrenado desde inicialización aleatoria sobre 4.006 miles de millones de tokens de predicción. Lo desarrolla el usuario vaibhav-mugulavalli-2004 y su propósito declarado no es superar al checkpoint base en capacidad general, sino servir como piloto para medir si el entrenamiento por preferencias centrado en formato puede mejorar el cumplimiento estricto de esquemas en tareas de function calling sin degradar la selección de herramientas.

El modelo parte de SFTv4, que ya había aprendido a seleccionar herramientas y emitir decisiones estructuradas, pero cuyos outputs podían fallar el parseo estricto o la validación de argumentos. El autor documenta abiertamente que los resultados fueron mixtos: el DPO incrementó las abstenciones correctas y redujo los outputs que alcanzaban el límite de generación, pero empeoró tanto la selección de herramienta como la precisión de llamada exacta. Por ello, el propio autor recomienda SFTv4 como checkpoint para uso general de function calling.

La relevancia de esta ficha es doble: por un lado, documenta un experimento reproducible de bajo coste (dos NVIDIA T4 en sesiones gratuitas de Kaggle, sin gasto en cómputo de entrenamiento); por otro, ilustra con métricas concretas el compromiso entre calibración de abstención y precisión de llamada en modelos pequeños especializados en tool calling. El contexto es de 2.048 tokens, incluyendo entrada y salida generada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 200M parámetros, detalles no publicados) |
| Parametros totales | 200.184.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (entrada y salida generada incluidas) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Modelo base | vaibhav-mugulavalli-2004/ToolCall-200M-SFT-v4 |
| Metodo de alineacion | DPO (Direct Preference Optimization) |
| Tokenizador | SentencePiece original de ToolCall-200M |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 200 millones de parámetros preentrenado desde inicialización aleatoria sobre 4.006 miles de millones de tokens de predicción, según la model card. El entrenamiento se realizó en sesiones gratuitas de Kaggle con dos NVIDIA T4, sin coste de cómputo declarado. Sobre esa base se aplicó primero un ajuste supervisado (SFTv4) y después una fase de DPO centrada en el formato de salida, que es la que produce este checkpoint. No se detallan en la información disponible la composición del dataset de preentrenamiento, el volumen de pares de preferencia usados en DPO ni la configuración de hiperparámetros.

La innovación técnica destacable no está en la arquitectura sino en el protocolo experimental: el autor evalúa si el DPO orientado a formato puede mejorar la validez sintáctica y la calibración de abstención manteniendo la precisión funcional. El resultado documentado es un intercambio medible: más abstenciones correctas y menos truncamientos, a costa de menor selección de herramienta y menor precisión de llamada exacta. No se mencionan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de llamadas a funciones en formato estructurado, heredada del checkpoint SFTv4.
- Selección de herramienta entre un conjunto dado, con emisión de nombre de función y argumentos.
- Abstención explícita ante peticiones irrelevantes o sin herramienta aplicable, capacidad reforzada por el DPO.
- Cumplimiento de esquemas estrictos de salida, objetivo principal de esta fase de preferencias.
- Tool calling y function calling en un único turno, con contexto máximo de 2.048 tokens.
- No se documentan capacidades de razonamiento multi-paso, agentes autónomos, visión, audio ni modo de pensamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación y enrutado de intenciones con salida estructurada: el modelo puede recibir una consulta y un catálogo de funciones y devolver la función seleccionada en JSON, aprovechando su entrenamiento específico en selección de herramienta, aunque con precisión limitada (66,87% en el subconjunto evaluado).
- Filtro de abstención en pipelines de agentes: dado su mejor comportamiento en abstenciones correctas (69,17% frente a 65,42% de SFTv4), puede usarse como primera etapa que decide si una petición requiere llamada a herramienta o debe rechazarse.
- Extracción de argumentos en dominios acotados: para APIs con pocos parámetros y esquemas simples, el modelo puede generar llamadas válidas que se validan después contra el esquema antes de ejecutarse.
- Prototipado e investigación de alineación: sirve como caso de estudio reproducible de DPO sobre modelos pequeños, útil para experimentar con pares de preferencia centrados en formato sin infraestructura costosa.
- Despliegue en entornos con recursos mínimos: con 200M parámetros y pesos en safetensors de 0,8 GB, puede ejecutarse en CPU o en GPU de gama baja para tareas de clasificación de llamadas en tiempo real.
- Generación de borradores de llamadas para revisión humana: en flujos donde un operador valida la llamada antes de ejecutarla, el modelo reduce el trabajo manual al proponer estructura y argumentos, aceptando su tasa de error como tolerable.
- Evaluación comparativa de checkpoints: útil como referencia negativa o de control al medir el efecto de DPO frente a SFT en tareas de tool calling.

## Benchmarks y rendimiento

Evaluación local con decodificación greedy, límite de 192 tokens nuevos y 914 casos derivados de BFCL v4. Las métricas de selección y llamada exacta cubren 400 casos `simple_python` y 258 `live_simple`; la abstención se mide sobre 240 casos `irrelevance`.

| Metrica | SFTv4 | ToolCall-200M-DPO |
|---|---:|---:|
| Seleccion correcta de herramienta | 479/658 (72,80%) | 440/658 (66,87%) |
| Llamadas exactas | 156/658 (23,71%) | 143/658 (21,73%) |
| Abstenciones correctas | 157/240 (65,42%) | 166/240 (69,17%) |
| Outputs que alcanzan el limite de generacion | 25/914 | 16/914 |
| Proxy de decision de llamada `live_relevance` | 9/16 | 9/16 |

En los mismos 658 casos de llamada, el DPO recuperó 8 llamadas exactas que SFTv4 fallaba y perdió 21 que SFTv4 acertaba. El autor advierte que estas cifras aplican al subconjunto y protocolo de puntuación local especificados, y que la coincidencia estricta puede rechazar representaciones de argumentos equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,4 GB solo para pesos (200M parámetros), más overhead de activaciones y caché KV para 2.048 tokens; en la práctica, menos de 1 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,2 GB para pesos; en 4 bits, alrededor de 0,1 GB. Los tipos de cuantización concretos no están publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entrenó con dos NVIDIA T4. Funciona en RTX 3060, RTX 4060, RTX 4090 y en CPU.
- Cabe holgadamente en GPU consumer e incluso en dispositivos de baja potencia.
- Opciones de despliegue: carga directa con `transformers` y safetensors; conversión a GGUF para llama.cpp u Ollama es viable por tamaño, aunque no está documentada por el autor. vLLM y TGI son compatibles en principio, sin configuración publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolCall-200M-DPO | 200M | 2.048 | DPO sobre SFT para formato de tool calling | no disponible | Hugging Face |
| ToolCall-200M-SFT-v4 | 200M | 2.048 (heredado) | SFT para seleccion de herramienta y salida estructurada | no disponible | Hugging Face |
| Alternativas de tool calling de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa y documentada es con su propio checkpoint base SFTv4, que el autor recomienda para function calling general por su mayor precisión en selección (72,80% frente a 66,87%) y llamada exacta (23,71% frente a 21,73%). No se dispone de datos de benchmarks frente a otros modelos de la categoría en la información proporcionada.

## Limitaciones y advertencias

- Puede seleccionar la función equivocada, proporcionar argumentos incorrectos o incompletos, o abstenerse cuando se espera una llamada.
- La coincidencia estricta puede rechazar representaciones de argumentos que son semánticamente equivalentes, lo que afecta a la métrica de llamada exacta.
- Degradación respecto a SFTv4 en selección de herramienta (pérdida de 5,93 puntos) y en llamadas exactas (pérdida de 1,98 puntos); el autor no lo recomienda como checkpoint general.
- Contexto muy limitado de 2.048 tokens, insuficiente para conversaciones multi-turno largas o catálogos extensos de herramientas.
- Idiomas soportados no documentados; no debe asumirse cobertura multilingüe.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación en nombres de función y argumentos; es obligatorio validar la llamada generada contra el esquema antes de ejecutarla en producción.
- Modelo de 200M parámetros con precisión de llamada exacta baja (21,73%), adecuado solo para tareas acotadas o con validación posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vaibhav-mugulavalli-2004/ToolCall-200M-DPO
- Checkpoint base SFTv4: https://huggingface.co/vaibhav-mugulavalli-2004/ToolCall-200M-SFT-v4
- Benchmark BFCL v4 (referencia de la evaluación): no disponible enlace directo en la información proporcionada
