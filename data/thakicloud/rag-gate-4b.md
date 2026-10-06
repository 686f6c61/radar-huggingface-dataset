# ThakiCloud/RAG-Gate-4B

## Resumen

RAG-Gate-4B es un modelo de 4.205.751.296 parámetros (≈4,21 B) desarrollado por ThakiCloud como un ajuste fino LoRA sobre Qwen/Qwen3.5-4B, fusionado en pesos bf16. No es un generador de respuestas: se coloca en una pipeline RAG después de la recuperación y antes de la generación, lee la pregunta, los pasajes recuperados y un indicador de si todavía es posible recuperar más, y emite un único token de decisión: Answer (la evidencia contiene una cadena de soporte completa), Retrieve (no la contiene y se puede volver a buscar) o Stop (no la contiene y no se puede).

El problema que resuelve es el fallo silencioso más caro de los sistemas RAG: responder sin evidencia suficiente o, en el extremo opuesto, rechazar preguntas que sí están soportadas. Sobre un conjunto de test retenido de 14.818 elementos (2.256 preguntas multi-salto distintas), el modelo sube la exactitud de acción de 0,467 a 0,950 respecto al mismo modelo base con el mismo prompt en zero-shot, y reduce el rechazo excesivo (over-refusal) de 0,849 a 0,070.

Su relevancia práctica está en que convierte una decisión difusa (¿basta lo recuperado?) en una clasificación de tres clases con distribución de probabilidad explícita, que se puede umbralizar según la tolerancia de la aplicación a respuestas no soportadas. La licencia es Apache 2.0, el único idioma declarado es el inglés y el repositorio se publicó con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Qwen/Qwen3.5-4B (etiqueta `qwen3_5_text`); ajuste LoRA fusionado en pesos bf16 |
| Parámetros totales | 4.205.751.296 (≈4,21 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos publicados en bf16. No se documentan versiones GGUF, GPTQ, AWQ ni MLX |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 8,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-4B, un transformer decoder-only, sobre el que se aplica un ajuste fino con LoRA que después se fusiona en pesos bf16. El repositorio está etiquetado con `transformers`, `safetensors` y `qwen3_5_text`, y la relación declarada con el modelo base es `finetune`. Los conjuntos de datos de entrenamiento declarados son ThakiCloud/ChainCheck y dgslibisey/MuSiQue. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO: esos datos no están disponibles.

La innovación técnica no está en la arquitectura sino en la interfaz de inferencia. El modelo no genera texto libre: se le aplica una plantilla de chat con `enable_thinking=False`, se hace prefill de la cadena `Final action:` y se leen directamente los logits del primer token generado en las posiciones correspondientes a las etiquetas `" Answer"`, `" Retrieve"` y `" Stop"` (con espacio inicial), aplicando softmax. No se muestrea: la decisión es determinista por argmax, o umbralizable sobre `p["Answer"]`. La evaluación se hizo sobre un test ciego de 14.818 elementos derivados de 2.256 preguntas base multi-salto, con intervalos de confianza del 95 % obtenidos por bootstrap sobre las preguntas base (10.000 remuestreos). El dataset ChainCheck se describe como una prueba fuera de distribución que mide si el modelo reacciona a la integridad de la cadena de soporte (CE) más de lo que reacciona a ediciones superficiales (EE), con un criterio Σ = CE − |EE| que debe ser positivo; no se publican cifras numéricas de ese resultado en la información disponible.

## Capacidades

- Clasificación de suficiencia de evidencia en tres acciones: Answer, Retrieve y Stop.
- Abstención explícita: devuelve Stop cuando no hay pasaje de soporte y no se puede recuperar más.
- Decisión sobre cadenas de soporte multi-salto: distingue entre cadena completa, cadena con enlace puente contradicho y salto ausente.
- Robustez ante pasajes distractores editados: el estado `FULL_DECOY` (evidencia suficiente más un distractor editado) se resuelve con 0,941 de exactitud, evitando la heurística de "texto editado implica rechazar".
- Salida probabilística calibrada en tres clases, apta para umbralizar según la política de riesgo de la aplicación.
- Integración como guardrail entre el retriever y el generador en pipelines RAG.
- No se documentan soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extenso (la plantilla de chat se usa con `enable_thinking=False`).
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Puerta de decisión en una pipeline RAG: el modelo se invoca tras la recuperación inicial y decide si el generador debe redactar la respuesta, si hay que lanzar otra ronda de búsqueda o si se debe devolver una abstención. Es su uso documentado por el autor.
- RAG iterativo o agéntico: en bucles de recuperación múltiple, el token Retrieve actúa como condición de continuación y el token Stop como criterio de parada, evitando rondas innecesarias cuando la evidencia ya es insuficiente y no hay más fuentes disponibles.
- Control de coste de generación: al enrutar solo los casos con acción Answer hacia el modelo generador (potencialmente más grande y caro), se recorta el gasto en inferencia en todas las consultas que terminan en Retrieve o Stop.
- Atención al cliente automatizada: la abstención controlada (Stop) permite devolver un mensaje del tipo "no puedo responder con los documentos disponibles" en lugar de inventar, con una tasa de respuesta sin soporte del 0,037 medida en test.
- Auditoría y monitorización de la calidad del retriever: la proporción de decisiones Answer frente a Retrieve sobre un tráfico real es una señal directa de si el índice de recuperación está devolviendo cadenas de soporte completas.
- Dominios regulados (legal, financiero, sanitario): con umbral sobre `p["Answer"]` en lugar de argmax, se puede priorizar la reducción de respuestas no soportadas a costa de un mayor número de rechazos, según la política de riesgo.
- Filtrado previo en sistemas de pregunta-respuesta multi-salto: el modelo detecta enlaces puente contradichos (`BROKEN_LINK`, 0,904 de exactitud) y saltos ausentes (`MISSING_HOP`, 0,944), lo que permite descartar evidencia envenenada antes de que llegue al generador.
- Verificación de respuestas en producción: combinado con un generador, la decisión Stop sirve como segunda barrera antes de publicar una respuesta en canales donde un error factual tiene coste alto.

## Benchmarks y rendimiento

Resultados del autor sobre test ciego de 14.818 elementos derivados de 2.256 preguntas base; intervalos de confianza del 95 % por bootstrap sobre preguntas base (10.000 remuestreos).

| Métrica | Qwen3.5-4B zero-shot | RAG-Gate-4B |
|---|---|---|
| Exactitud de acción | 0,467 [0,460; 0,475] | 0,950 [0,944; 0,955] |
| Tasa de respuesta sin soporte (P(Answer / evidencia insuficiente)) | 0,024 [0,020; 0,028] | 0,037 [0,031; 0,043] |
| Tasa de rechazo excesivo (P(no Answer / evidencia suficiente)) | 0,849 [0,834; 0,863] | 0,070 [0,060; 0,081] |

Desglose por estado de la evidencia (exactitud):

| Estado | Significado | Base zero-shot | RAG-Gate-4B |
|---|---|---|---|
| FULL | cadena de soporte completa | 0,154 | 0,930 |
| FULL_DECOY | cadena completa más un pasaje distractor editado | 0,194 | 0,941 |
| BROKEN_LINK | hecho puente contradicho | 0,592 | 0,904 |
| MISSING_HOP | falta un salto | 0,636 | 0,944 |
| MISSING_ALL | ningún pasaje de soporte | 0,705 | 0,993 |

El autor documenta además un error concreto seleccionado por hash sobre el test: en el caso de estado `BROKEN_LINK` con recuperación disponible, la acción correcta era Retrieve y el modelo devolvió Answer. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no se publican cifras numéricas del conjunto ChainCheck.

## Requisitos de hardware

- VRAM estimada en bf16: el repositorio pesa 8,4 GB, por lo que hacen falta aproximadamente 9-11 GB de VRAM contando caché KV y activaciones. Estimación derivada del número de parámetros, no publicada por el autor.
- VRAM estimada en 8 bits: en torno a 5-6 GB. En 4 bits: en torno a 3-4 GB. Estas cuantizaciones no están publicadas en el repositorio, solo serían conversiones propias.
- GPU recomendadas: cualquier GPU con 12 GB o más para bf16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). Para 4 bits, tarjetas de 6-8 GB pueden ser suficientes, con margen ajustado según la longitud del contexto.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 12 GB o más, y en cuantizaciones de menor precisión en gamas inferiores.
- Opciones de despliegue: el autor documenta únicamente `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. Para servir en producción haría falta un runtime que exponga los logits o logprobs del primer token generado (vLLM, TGI u otros), ya que el procedimiento de decisión depende de leer las probabilidades de tres tokens concretos.
- Latencia y throughput estimados: no disponibles.
- Nota de despliegue: la decisión se lee sobre el último logit tras el prefill de `Final action:`, con una sola pasada hacia delante y sin decodificación autoregresiva completa, lo que abarata la inferencia frente a generar texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud de acción (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAG-Gate-4B | 4,21 B | no disponible | 0,950 | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3.5-4B (zero-shot, mismo prompt) | ≈4,21 B (pesos base) | no disponible | 0,467 | no disponible en la información proporcionada | HuggingFace |
| Otros modelos específicos de "RAG gate" o clasificación de suficiencia de evidencia | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante y con datos es contra el propio modelo base sin ajustar: la ganancia se concentra en el rechazo excesivo, que pasa de 0,849 a 0,070, mientras que la tasa de respuesta sin soporte empeora ligeramente, de 0,024 a 0,037. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un generador de respuestas: si se usa para redactar texto en lugar de como puerta de decisión, su calidad no está evaluada ni documentada.
- La tasa de respuestas no soportadas sube de 0,024 en el modelo base a 0,037 tras el ajuste. Es un intercambio deliberado por una caída grande del rechazo excesivo; en aplicaciones sensibles conviene umbralizar `p["Answer"]` en lugar de tomar el argmax.
- El rechazo excesivo residual es del 7 %: en evidencia suficiente, el modelo deja de responder en 7 de cada 100 casos.
- Solo inglés: no se declaran otros idiomas, y el comportamiento en castellano u otras lenguas no está evaluado.
- Dependencia estricta del formato de prompt: la decisión se lee en los tokens `" Answer"`, `" Retrieve"` y `" Stop"` (con espacio inicial) tras el prefill `Final action:`. Cambios en la plantilla de chat, en el tokenizador o en el manejo de espacios iniciales invalidan el procedimiento.
- Sesgos conocidos: no disponibles. El autor no publica análisis de sesgo demográfico, geográfico ni temático.
- Riesgo de alucinación: bajo por diseño, ya que el modelo no genera la respuesta final; aun así, un token Answer incorrecto delega el riesgo en el generador posterior.
- Dominio de entrenamiento restringido a pregunta-respuesta multi-salto con cadenas de soporte (MuSiQue, ChainCheck). El rendimiento en dominios abiertos, conversacionales, de código o de conocimiento procedimental no está medido.
- La longitud de contexto no está documentada, por lo que no se puede garantizar el comportamiento con muchos pasajes recuperados en la ventana.
- Evaluación realizada por el propio autor sobre su propio conjunto de test; no hay validación independiente ni resultados en benchmarks estándar.
- Licencia Apache 2.0 en el modelo ajustado: permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.5-4B, cuya licencia no se detalla en la información disponible.
- Validación comunitaria nula en el momento de la consulta: 0 descargas y 0 likes en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/RAG-Gate-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset ChainCheck: https://huggingface.co/datasets/ThakiCloud/ChainCheck
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Paper, blog, repositorio de código o demo: no disponibles.
