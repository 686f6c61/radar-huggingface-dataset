# Zhaoming213/ChatBox5

## Resumen

ChatBox5 es un modelo conversacional en chino desarrollado por el usuario independiente Zhaoming213, quinta iteración de la serie ChatBox. Está construido mediante fine-tuning supervisado (SFT) sobre el modelo base `uer/gpt2-medium-chinese-cluecorpussmall`, un transformer decoder-only de tipo GPT-2 entrenado originalmente con corpus chinos de CLUECorpusSmall. El objetivo declarado de la serie es ofrecer un asistente conversacional con el mínimo de rechazos, moralización y sesgo ideológico posible, aunque el autor advierte que esta quinta versión ya no persigue explícitamente la ausencia de censura y puede declinar responder o adoptar un tono aleccionador en determinados temas.

El modelo es deliberadamente pequeño: 324.996.096 parámetros medidos en los pesos `safetensors` publicados (la model card declara 355M, diferencia compatible con un peso de salida atado no contabilizado aparte), 24 capas y `hidden_size` de 1024. El contexto máximo declarado es de solo 340 tokens, lo que lo sitúa muy por debajo de los estándares actuales y lo limita a interacciones cortas de uno o pocos turnos.

Su relevancia es acotada y fundamentalmente experimental: sirve como caso de estudio de fine-tuning de bajo coste (el entrenamiento SFT se completó en algo más de 4 horas sobre 2 GPU T4 de 16 GB) y como ejemplo de las limitaciones de escalar la conversación sobre arquitecturas GPT-2 pequeñas. No es un modelo apto para producción: no hay benchmarks publicados, el repositorio tiene 7 descargas y 0 likes, y requiere código propio (`Run.py` con palabras clave personalizadas) para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (24 capas, `hidden_size` 1024) |
| Parametros totales | 324.996.096 (pesos `safetensors`); la model card declara 355M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 340 tokens (`max_seq_len` segun la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser `safetensors` en fp32/fp16 es convertible a GGUF/INT8/INT4 con herramientas externas (no oficial) |
| Idiomas soportados | Chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repo de 1,3 GB); requiere scripts Python propios (`Run.py`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de la familia GPT-2, sin mecanismos de atención lineal, decodificación especulativa ni mezcla de expertos. El modelo base `uer/gpt2-medium-chinese-cluecorpussmall` aporta 24 capas y 1024 dimensiones ocultas, y sobre él se aplicó un ajuste supervisado (SFT) con corpus de instrucciones de la comunidad open source y un dataset de destilación "black-box" (salidas de otros modelos generativos) sometido a un filtrado ligero para eliminar rechazos y tono moralizante. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; tampoco indica si esta quinta generación usó LoRA (la cuarta sí lo hizo por limitaciones de GPU) o fine-tuning completo.

El entrenamiento declarado se ejecutó sobre 2 GPU NVIDIA T4 de 16 GB durante algo más de 4 horas en la fase de SFT. La innovación técnica es prácticamente inexistente: el autor justifica el salto a GPT-2-medium por el rendimiento decreciente observado al escalar parámetros en la generación anterior, y la mejora de esta versión se limita a un dataset destilado más limpio, que según la model card produce respuestas más estables y pertinentes. Los ejemplos de diálogo incluidos en la model card muestran respuestas incoherentes con la pregunta (por ejemplo, ante "cómo aprender programación" el modelo pide código en lugar de dar una guía), lo que sugiere un alineamiento instrucción-respuesta débil.

## Capacidades

- Generación de texto conversacional corto en chino, con respuestas de uno o pocos párrafos.
- Diálogo multi-turno muy limitado: la ventana de 340 tokens restringe el historial a dos o tres intercambios breves.
- Producción de listas numeradas y respuestas con formato Markdown básico (visible en los ejemplos de la model card).
- Tono conversacional orientado a la asistencia ("en qué puedo ayudarte"), con capacidad de declinar peticiones en esta versión.
- Sin soporte de tool calling ni function calling: la arquitectura GPT-2 y el formato de pesos no incluyen plantillas de herramientas.
- Sin capacidades de agente, razonamiento multi-paso estructurado, visión, audio ni modo "thinking".
- Sin capacidades matemáticas o de código fiables: el ejemplo de la model card sobre programación devuelve una respuesta genérica incorrecta.
- Multilingüismo nulo: solo se declara chino; el vocabulario del modelo base está orientado a chino y el comportamiento en otros idiomas no está evaluado.
- No es compatible con `text-generation-inference` de forma estándar pese a la etiqueta del repositorio: requiere `Run.py` y palabras clave personalizadas.

## Casos de uso

- Prototipado rápido de chatbots en chino para demos internas: con 325M parámetros se puede levantar en cualquier equipo y validar flujos de conversación antes de invertir en un modelo mayor.
- Generación de diálogo sintético para aumentar datasets conversacionales en chino: el modelo puede producir turnos de respuesta que luego se filtran manualmente, útil por su bajo coste de inferencia.
- Investigación sobre alineación y rechazo: al existir versiones previas explícitamente "uncensored" y esta quinta con rechazos ocasionales, permite estudiar empíricamente cómo el filtrado del dataset de SFT modifica la tasa de rechazo.
- Docencia y experimentación con fine-tuning: su tamaño permite reproducir un pipeline SFT completo en 2 GPU T4 en menos de 5 horas, lo que lo hace adecuado para cursos o talleres prácticos.
- Pruebas de pipelines de cuantización y exportación: sirve como conejillo de indias para validar conversiones a GGUF/INT8/INT4 y medir la degradación de calidad en modelos diminutos.
- Despliegue en entornos con recursos mínimos (CPU, dispositivos embebidos o contenedores sin GPU) para generar texto corto en chino, donde un modelo de 325M en INT8 ocupa menos de 400 MB.
- Base de partida para fine-tunes de dominio muy específico en chino (atención al cliente de un vertical concreto), aprovechando que la licencia Apache 2.0 permite uso comercial y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye cuatro ejemplos cualitativos de diálogo y una tabla subjetiva de "tasas de rechazo" de diversos modelos, sin métricas cuantitativas, sin conjuntos de evaluación y sin comparación con líneas base. No existen datos de MMLU, HumanEval, GSM8K, C-Eval ni de perplexity sobre el modelo ajustado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32, 0,65 GB en fp16, 0,33 GB en INT8 y 0,17 GB en INT4 (cálculo teórico a partir de los 324.996.096 parámetros; no hay mediciones publicadas).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; el propio autor entrenó con 2× T4 de 16 GB, pero para inferencia basta una GTX 1650, RTX 3060 o incluso una iGPU.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3080, RTX 2060, GTX 1060 6 GB y cualquier portátil con 4 GB de VRAM.
- Ejecución en CPU totalmente viable: menos de 1,5 GB de RAM en fp32 y del orden de 400 MB en INT8.
- Opciones de despliegue: `transformers` con Python estándar es la vía natural; llama.cpp u Ollama solo tras convertir manualmente los pesos a GGUF, ya que no se publican versiones GGUF; vLLM y TGI no están soportados de forma nativa (el repositorio incluye scripts propios con palabras clave personalizadas).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento general de esos proyectos y no de la informacion proporcionada para esta ficha; conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| ChatBox5 (Zhaoming213) | 325M | 340 tokens | Chino | Apache 2.0 | Experimental, 7 descargas, sin benchmarks |
| uer/gpt2-medium-chinese-cluecorpussmall (base) | ~355M (embeddings sin atar) | 512 posiciones | Chino | Apache 2.0 | Modelo base de referencia, sin ajuste conversacional |
| Qwen2.5-0.5B | ~0,49B | 32.768 tokens | Multilingüe (incluye chino) | Apache 2.0 | Ampliamente adoptado, con benchmarks publicados |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | Multilingüe | Licencia comunitaria Llama 3.2 | Ampliamente adoptado, con benchmarks publicados |

Frente a los modelos de 0,5B y 1B de Qwen y Meta, ChatBox5 pierde en todos los ejes medibles: contexto dos órdenes de magnitud menor, monolingüismo, ausencia de tool calling, ausencia de benchmarks y un proceso de carga no estándar. Su única ventaja relativa es el coste de inferencia y la libertad de modificación bajo Apache 2.0 sin cláusulas adicionales.

## Limitaciones y advertencias

- Calidad conversacional baja: los propios ejemplos de la model card muestran respuestas que no responden a la pregunta formulada, con incoherencias y truncamientos a mitad de frase.
- Ventana de contexto de 340 tokens: insuficiente para diálogo multi-turno, recuperación aumentada (RAG) o documentos de cualquier tamaño.
- Alto riesgo de alucinación: es un modelo de 325M entrenado sobre datos destilados y filtrado ligero, sin fase de preferencias ni verificación factual.
- Sesgos desconocidos y no evaluados: no se documenta ninguna evaluación de sesgo, toxicidad o seguridad, y el dataset de destilación proviene de otros modelos generativos sin trazabilidad completa.
- Idiomas: solo chino declarado; el rendimiento en castellano u otras lenguas no está soportado ni evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, pero no ofrece garantías; la procedencia del dataset de destilación (salidas de otras IA) puede entrar en conflicto con los términos de servicio de los modelos de origen, un riesgo legal a evaluar antes de un uso comercial.
- Integración no estándar: la model card indica descargar todos los ficheros en una carpeta `model` y ejecutar `Run.py`, lo que implica palabras clave personalizadas y posible código no auditado; no funciona como un pipeline `text-generation-inference` convencional pese a la etiqueta.
- Proyecto posiblemente abandonado: el autor afirma que esta podría ser la última generación de la serie y que futuras iteraciones se centrarán en otros dominios, por lo que no cabe esperar mantenimiento ni correcciones.
- Metadatos inconsistentes: el repositorio figura creado y actualizado en octubre de 2026, fecha posterior a la redacción habitual de estas fichas, y la cifra de parámetros de la model card (355M) no coincide con la de los pesos publicados (324.996.096).
- Sin datos de evaluación reproducibles: no hay métricas, conjuntos de test ni scripts de evaluación que permitan verificar las afirmaciones de mejora de "pertinencia y estabilidad".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zhaoming213/ChatBox5
- Modelo base: https://huggingface.co/uer/gpt2-medium-chinese-cluecorpussmall
- Primera generación: https://huggingface.co/Zhaoming213/ChatBox-unrestricted
- Segunda generación: https://huggingface.co/Zhaoming213/ChatBox2-unrestricted
- Tercera generación (experimental): https://huggingface.co/Zhaoming213/ChatBox3-unrestricted
- Tercera generación, edición completa: https://huggingface.co/Zhaoming213/ChatBox3.1-unrestricted
- Cuarta generación: https://huggingface.co/Zhaoming213/ChatBox4-unrestricted
- Resultados de la búsqueda web: no contienen enlaces relevantes al modelo (devuelven una tienda de moda sin relación con el proyecto). No se han encontrado papers, blogs, repositorios ni demos asociados.
