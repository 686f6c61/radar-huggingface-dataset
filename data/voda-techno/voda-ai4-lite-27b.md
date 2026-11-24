# VoDa-Techno/VoDa-AI4-Lite-27b

## Resumen

VoDa-AI4-Lite-27b es un modelo de generación de texto publicado por VoDa-Techno, presentado por su autor como el miembro de mayor tamaño de la familia "VoDa AI4 Lite", orientada a chat general en ruso e inglés. La model card lo describe como un modelo universal para conversación, redacción, explicación y traducción, y lo etiqueta con el tag `qwen`, lo que sugiere una base derivada de la familia Qwen, aunque el autor no lo confirma explícitamente.

La información disponible es escasa y presenta inconsistencias notables: el nombre comercial indica "27b", pero el recuento real de parámetros en formato safetensors es de 460.730.096 (aproximadamente 0,46 mil millones), muy lejos de los 27 mil millones. El repositorio ocupa 17,7 GB, un tamaño compatible con pesos en GGUF de varias cuantizaciones más que con un modelo denso de 27B en precisión completa.

El modelo se distribuye principalmente en formato GGUF para su uso con Ollama y cuenta con cero descargas y cero "likes" en el momento de la consulta. No se han publicado resultados de benchmarks, detalles de entrenamiento ni especificaciones de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen` sugiere base de la familia Qwen; no confirmado) |
| Parametros totales | 460.730.096 (según safetensors); el nombre comercial indica "27b", dato no verificado |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en GGUF; no se detallan los niveles) |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | other (licencia propia "VoDa AI"; ver LICENSE en el repositorio) |
| Formato de pesos | GGUF (también se referencia safetensors para el recuento de parámetros) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá del tag `qwen`, que apunta a una base derivada de la familia Qwen de Alibaba. No se especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni se detalla el número de capas, dimensiones ocultas o mecanismo de atención.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La model card se limita a describir el modelo como "universal" y "totalmente rusohablante e anglohablante", sin aportar detalles técnicos verificables. La discrepancia entre el nombre "27b" y el recuento real de parámetros (0,46B) impide confirmar el tamaño real del modelo.

## Capacidades

- Generación de texto conversacional: preguntas y respuestas, redacción de textos, explicaciones y traducción, según la model card.
- Soporte nativo de ruso e inglés.
- Uso previsto como modelo de chat generalista dentro de la familia VoDa AI4 Lite.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- No se documentan capacidades de código o matemáticas más allá de las genéricas de un modelo de chat.

## Casos de uso

- Chat conversacional en ruso: el modelo está declarado como "totalmente rusohablante", por lo que encaja en asistentes conversacionales para usuarios rusófonos, con respuestas en registro natural.
- Traducción ruso-inglés e inglés-ruso: al declarar soporte de ambos idiomas, puede emplearse en tareas de traducción de texto general, aunque sin garantías de calidad al no haber benchmarks publicados.
- Redacción y reescritura de textos: generación de borradores, resúmenes y explicaciones en entornos de productividad personal.
- Despliegue local con Ollama: la model card proporciona el comando `ollama run beebosofficial/VoDa-AI4-Lite:27b`, lo que facilita pruebas en estación de trabajo sin infraestructura adicional.
- Prototipado de asistentes bilingües: útil para validar flujos de conversación en ruso e inglés antes de migrar a un modelo mayor con benchmarks verificados.
- Experimentación académica con modelos de nicho: su licencia propia y su escasa documentación lo hacen adecuado para estudiar modelos de la familia VoDa AI4, no para producción crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El recuento de safetensors (0,46B parámetros) sugiere que una cuantización de 4 bits podría ocupar del orden de 0,3-0,5 GB, pero el tamaño del repositorio (17,7 GB) y la denominación "27b" impiden dar una cifra fiable.
- GPU recomendadas: no disponible. Si el modelo real fuese de 27B, requeriría GPUs de 24 GB o más (RTX 4090, A100 40/80 GB, H100) para inferencia en precisión reducida; si fuese de 0,46B, cabría en cualquier GPU consumer con 4-8 GB.
- GPU consumer: no confirmable por la discrepancia de tamaños; en el escenario de 0,46B cabría en GTX 1660, RTX 3060 y superiores.
- Opciones de despliegue: Ollama (documentado en la model card), y presumiblemente llama.cpp y otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoDa-AI4-Lite-27b | 460.730.096 (safetensors); "27b" en el nombre | no disponible | ru, en | other (propia) | Hugging Face, Ollama |
| Qwen2.5-0.5B | 0,49B | 32K (versión base) | multilingüe | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-7B | 7,6B | 128K | multilingüe | Apache 2.0 (mayoría de variantes) | Hugging Face, Ollama |
| VoDa-AI4-Lite-9b (misma familia) | no disponible | no disponible | ru, en | other (propia) | Hugging Face, Ollama |

La comparación con Qwen2.5-0.5B es la más plausible por recuento de parámetros, aunque el autor no confirma la base. Frente a las alternativas de Alibaba, la licencia propia y la ausencia de benchmarks públicos son desventajas claras para uso en producción.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre comercial ("27b") y el recuento real de parámetros (0,46B): no es posible determinar el tamaño real del modelo sin inspeccionar los pesos.
- Ausencia total de benchmarks públicos: no hay evidencia verificable de calidad en ninguna tarea.
- Model card muy escueta: sin detalles de arquitectura, entrenamiento, contexto ni alineación.
- Idiomas limitados a ruso e inglés; no se declara soporte de castellano.
- Licencia "other" propia: es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones no estándar.
- Riesgo elevado de alucinación y de respuestas inconsistentes al no documentarse el proceso de alineación.
- Cero descargas y cero "likes": sin validación por parte de la comunidad.
- No recomendado para producción crítica sin una evaluación independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoDa-Techno/VoDa-AI4-Lite-27b
- Comando Ollama indicado en la model card: `ollama run beebosofficial/VoDa-AI4-Lite:27b`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
