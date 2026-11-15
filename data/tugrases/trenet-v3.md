# Tugrases/trenet-v3

## Resumen

trenet v3 es un modelo de lenguaje experimental de tipo decoder-only Transformer con 98,8 millones de parámetros, desarrollado por Tuğra Ege Ses bajo el nombre Tugrases. Está entrenado desde cero exclusivamente para turco y su objetivo declarado no es competir con modelos grandes, sino explorar hasta dónde puede llegar un modelo de este tamaño en conversación cotidiana en turco. Se distribuye con licencia MIT y pesos en safetensors y ONNX.

El modelo se ha preentrenado con aproximadamente 6.300 millones de tokens y posteriormente ha pasado por un ajuste fino conversacional y una fase de preferencia (DPO). Su ventana de contexto es de 4096 tokens, aunque el propio autor advierte que la calidad se degrada de forma progresiva a partir de 2048 tokens y de manera notable después de 3072. La implementación de referencia mantiene las conversaciones dentro de 2048 tokens por este motivo.

Es relevante ahora como caso de estudio de modelos pequeños en lenguas de recursos medios: publica resultados en benchmarks turcos (XCOPA, HellaSwag, WinoGrande, ARC, Belebele, TurkishMMLU) con una media del 36,4 % frente al 32,5 % de azar, lo que sitúa sus capacidades por encima de la aleatoriedad pero lejos de un uso fiable como fuente de información. El propio autor lo etiqueta como investigación y desaconseja su uso en tareas serias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, diseño propio a pequeña escala |
| Parametros totales | 98.779.136 (98,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (calidad degradada tras 2048; notablemente tras 3072) |
| Tipos de cuantizacion | int8 (ONNX para CPU); safetensors en precisión completa |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (int8 para CPU) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de 98,8 millones de parámetros con un diseño propio orientado a escala pequeña. No se publican detalles sobre número de capas, dimensiones ocultas, número de cabezas de atención ni tipo de tokenizador más allá de que existe un `tokenizer.json` específico para turco. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones de eficiencia.

El entrenamiento consta de tres fases según la model card: un preentrenamiento de aproximadamente 6.300 millones de tokens, un ajuste fino conversacional y una fase de entrenamiento por preferencias con DPO. El autor indica explícitamente que el conjunto de datos y los detalles de entrenamiento no se comparten. Las preguntas de los benchmarks publicados fueron eliminadas del corpus mediante una búsqueda de secuencias comunes de 8 palabras, lo que aporta cierta garantía de que los resultados no están contaminados por el conjunto de evaluación.

## Capacidades

- Generación de texto conversacional breve en turco: saludos, conversación cotidiana, consejos simples y charla informal.
- Memoria de información mencionada dentro de la misma conversación (dentro de la ventana efectiva de 2048 tokens).
- Seguimiento de instrucciones simples: número concreto de elementos en una lista, respuestas de una sola palabra, respuestas cortas.
- Cálculo verbal sencillo (sumas, restas y operaciones de cuatro reglas básicas).
- Modo de pensamiento interno breve en algunas preguntas de cálculo, instrucciones y lógica: el script `chat.py` genera un razonamiento intermedio y muestra solo la respuesta final.
- Expresión de incertidumbre en temas que no conoce o no puede conocer (información actual, datos personales, nombres inventados), aunque de forma no sistemática.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el propio autor señala que falla en cálculo multi-paso y en predicción de salida de código.
- Capacidades multilingües: no disponibles; solo turco.
- Capacidades especiales: no dispone de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de chatbots conversacionales en turco: el modelo puede gestionar intercambios multi-turno de carácter informal dentro de los 2048 tokens efectivos que gestiona `chat.py`, lo que lo hace útil para demos y pruebas de concepto de asistentes de charla cotidiana.
- Investigación sobre modelos pequeños en lenguas de recursos medios: sirve como línea base reproducible (con benchmarks turcos publicados) para estudiar el rendimiento de arquitecturas de ~100 M de parámetros en turco.
- Evaluación de técnicas de cuantización y despliegue en CPU: la inclusión de una versión ONNX int8 que alcanza unos 200 tokens por segundo en 4 núcleos lo convierte en un banco de pruebas para pipelines de inferencia sin GPU.
- Educación y divulgación: permite ilustrar de forma tangible las limitaciones de los modelos pequeños (alucinación, pérdida de contexto, fallos en razonamiento multi-paso) con un modelo de licencia permisiva y menos de 1 GB de pesos.
- Asistente de conversación offline en dispositivos con recursos limitados: al ejecutarse en CPU con `--device cpu` y un artefacto int8, puede integrarse en entornos sin acelerador hardware para tareas de entretenimiento o acompañamiento conversacional.
- Generación de respuestas cortas y formateadas en turco: gracias al seguimiento de instrucciones simples (número de elementos, respuestas de una palabra), puede emplearse en tareas de generación de listas breves o respuestas concisas dentro de un pipeline controlado.
- Verificación de cálculos aritméticos simples en flujos con calculadora externa: `chat.py` incorpora un pequeño calculador que valida las operaciones de cuatro reglas, lo que permite usar el modelo como capa de lenguaje sobre un motor aritmético determinista.

## Benchmarks y rendimiento

| Benchmark | Preguntas | Azar | trenet v3 |
|---|---|---|---|
| XCOPA (tr) | 500 | 50 % | 58,8 % |
| HellaSwag (tr) | 2000 | 25 % | 29,5 % |
| WinoGrande (tr) | 1266 | 50 % | 51,3 % |
| ARC (tr) | 1172 | 25 % | 27,3 % |
| Belebele (tur_Latn) | 900 | 25 % | 31,3 % |
| TurkishMMLU | 900 | 20 % | 19,9 % |
| **Media** | | **32,5 %** | **36,4 %** |

Metodología declarada por el autor: evaluación estilo `lm-evaluation-harness` calculando la log-probabilidad de cada opción y seleccionando la de mayor valor (el modelo no genera texto, por lo que la temperatura no afecta). Configuración 0-shot, sin plantilla de chat, continuación de texto plano. Puntuación normalizada por byte (acc_norm) en HellaSwag y ARC, puntuación parcial en WinoGrande y exactitud bruta en el resto. Conjuntos: XCOPA test, primeros 2000 ejemplos de validación de HellaSwag, validación de WinoGrande, test de ARC, test de Belebele y 9 asignaturas × 100 preguntas de TurkishMMLU. Los textos de estos tests fueron eliminados del corpus de entrenamiento mediante búsqueda de secuencias comunes de 8 palabras.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (98,8 M de parámetros en fp32 ≈ 0,4 GB de pesos más overhead); el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada para este modelo; una RTX 3060 o superior ejecuta la versión de precisión completa sin problemas. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: el autor proporciona `chat.py` con soporte para `--device cpu`, `--slow` (precisión completa) y `--no-calculator`; la versión int8 ONNX está pensada para CPU con `onnxruntime`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: aproximadamente 200 tokens por segundo en CPU de 4 núcleos con la versión ONNX int8. No se publican cifras para GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa. A modo de referencia estructural, los modelos de ~100 M de parámetros de la familia GPT-2 small (124 M) o los modelos pequeños de la familia Qwen comparten orden de magnitud, pero no se han publicado comparaciones directas con trenet v3 en la documentación disponible.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trenet v3 | 98,8 M | 4096 | tr | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una fuente de información fiable: el autor advierte que puede inventar datos plausibles sobre personas, fechas y cifras. Riesgo alto de alucinación.
- Fallos frecuentes en cálculo multi-paso, razonamiento encadenado, predicción de salida de código y matices semánticos finos.
- No respeta de forma consistente reglas de formato dadas en mensajes separados.
- Pérdida de hilo en conversaciones largas; degradación de calidad a partir de 2048 tokens y pérdida notable tras 3072, pese a un contexto nominal de 4096.
- Solo turco: no hay capacidades multilingües.
- Resultados en benchmarks cercanos al azar en WinoGrande (51,3 % frente a 50 %) y TurkishMMLU (19,9 % frente a 20 %), lo que indica ausencia de capacidad real en esas tareas.
- Licencia MIT: permite uso comercial, modificación y redistribución conservando el aviso de copyright. No obstante, el autor desaconseja explícitamente su uso en tareas serias.
- Modelo experimental sin garantías de mantenimiento ni soporte; 0 descargas y 0 likes en el momento de la ficha.
- Dataset y detalles de entrenamiento no publicados, lo que limita la reproducibilidad y la auditoría de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tugrases/trenet-v3
- Perfil del autor en Hugging Face: https://huggingface.co/Tugrases
- Repositorio de código (`chat.py`, paquete `trenet/`): incluido en el repositorio de Hugging Face del modelo
- Paper, blog o demo adicionales: no disponible
