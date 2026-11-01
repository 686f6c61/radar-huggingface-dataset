# willingtoexcel/lockedin-moonshine-tiny-ng

## Resumen

`lockedin-moonshine-tiny-ng` es una conversión al formato ONNX del modelo de reconocimiento automático de voz (ASR) Moonshine Tiny, publicada por el usuario willingtoexcel en HuggingFace. Moonshine es una familia de modelos de transcripción de audio desarrollada por Useful Sensors, diseñada específicamente para funcionar sobre audio de duración variable con una latencia proporcional a la longitud real de la entrada, a diferencia de los modelos tipo Whisper, que procesan siempre una ventana fija de 30 segundos. La variante "tiny" es la de menor tamaño de la familia.

El repositorio tiene un tamaño de 0,2 GB y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. La model card publicada por el autor es prácticamente vacía: solo contiene la declaración de licencia, sin información sobre arquitectura, datos de entrenamiento, idiomas soportados ni métricas de evaluación. El sufijo "ng" en el nombre no está documentado en la información disponible.

La relevancia de esta ficha es limitada: se trata de una conversión de formato de un modelo preexistente, no de un modelo nuevo. Cualquier evaluación rigurosa debería remitirse al modelo original de Moonshine para obtener especificaciones técnicas fiables, ya que la información publicada en este repositorio es insuficiente para caracterizar el modelo de forma autónoma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Moonshine Tiny; arquitectura concreta no documentada en el repo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio de duración variable según el diseño de Moonshine) |
| Tipos de cuantización | no disponible (el repo contiene pesos ONNX; no se detallan variantes) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna, el proceso de entrenamiento, el volumen de datos de audio utilizados, la composición del corpus ni si se aplicaron técnicas de ajuste fino supervisado o preferencias. El único dato técnico verificable es que los pesos se distribuyen en formato ONNX, lo que sugiere una conversión orientada a inferencia en entornos de producción con ONNX Runtime, potencialmente en CPU o en dispositivos de borde.

El modelo base, Moonshine Tiny, es un sistema ASR encoder-decoder de Useful Sensors que, según la documentación pública del proyecto original, está optimizado para audio de corta duración y evita el relleno a 30 segundos característico de Whisper. Sin embargo, esta información corresponde al modelo fuente y no está confirmada en este repositorio concreto.

## Capacidades

- Transcripción de voz a texto (ASR), presumiblemente en inglés y posiblemente en otros idiomas, aunque no se especifica.
- Procesamiento de audio de duración variable, según el diseño del modelo base Moonshine.
- Ejecución mediante ONNX Runtime, lo que facilita el despliegue en CPU, GPU y entornos embebidos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio adicional ni modo de pensamiento.
- No se documentan capacidades multilingües concretas.

## Casos de uso

- Transcripción local en aplicaciones de escritorio: al distribuirse en ONNX y con un tamaño de repo de 0,2 GB, puede integrarse en aplicaciones de escritorio o móviles que necesiten transcribir audio sin conexión a un servicio en la nube.
- Subtitulado de reuniones y notas de voz: el modelo puede transcribir grabaciones cortas de voz en pipelines de productividad personal, ejecutándose en CPU mediante ONNX Runtime.
- Procesamiento en dispositivos de borde: su tamaño reducido permite desplegarlo en dispositivos con recursos limitados (Raspberry Pi, mini-PC, móviles) donde un modelo ASR grande no cabría.
- Preprocesado de audio en pipelines de datos: transcripción masiva de clips cortos como paso previo a tareas de indexación o búsqueda sobre audio.
- Prototipado rápido de interfaces de voz: gracias a la licencia MIT y al formato ONNX, es adecuado para experimentar con comandos de voz en aplicaciones experimentales.
- Integración en herramientas de accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, siempre que se valide la calidad en el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repo (0,2 GB) y la naturaleza "tiny" del modelo base, es plausible que quepa en menos de 1 GB de memoria, pero no está confirmado.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, pero no hay datos oficiales.
- Ejecución en CPU: viable mediante ONNX Runtime, dado el formato de los pesos y el tamaño reducido.
- Opciones de despliegue: ONNX Runtime es la vía natural; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| lockedin-moonshine-tiny-ng | no disponible | no disponible | MIT | ONNX | HuggingFace |
| Moonshine Tiny (original) | no disponible en esta ficha | audio variable | MIT (según proyecto original) | PyTorch | HuggingFace / Useful Sensors |
| Whisper Tiny (OpenAI) | ~39 M | ventana fija de 30 s | MIT | PyTorch, ONNX, GGML | HuggingFace / OpenAI |
| Wav2Vec2 base (Meta) | ~95 M | audio variable | MIT / Apache 2.0 según variante | PyTorch | HuggingFace |

Los datos de Whisper Tiny y Wav2Vec2 corresponden a conocimiento público general y no se han verificado contra la documentación de este repositorio. La comparación con Moonshine Tiny original es la más pertinente, ya que esta publicación es una conversión del mismo.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no hay información sobre idiomas, dominio de entrenamiento, métricas ni limitaciones conocidas.
- Al ser una conversión de formato, la calidad de la transcripción depende enteramente del modelo original y del proceso de exportación a ONNX; no se documenta si se validó la equivalencia numérica.
- Riesgo de alucinación en ASR: los modelos de transcripción pueden generar texto plausible en segmentos de silencio o ruido, especialmente en variantes pequeñas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de acento, género, edad o idioma.
- El sufijo "ng" del nombre no está explicado; podría indicar una variante (por ejemplo, "noise gate" o "next-gen") sin confirmar.
- Uso comercial permitido por la licencia MIT, pero se recomienda verificar la licencia del modelo base Moonshine y de sus dependencias antes de desplegar en producción.
- Solo 19 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/willingtoexcel/lockedin-moonshine-tiny-ng
- Proyecto Moonshine (modelo base, Useful Sensors): no disponible en la información proporcionada.
- Paper de Moonshine: no disponible en la información proporcionada.
- Repositorio de código de Moonshine: no disponible en la información proporcionada.
