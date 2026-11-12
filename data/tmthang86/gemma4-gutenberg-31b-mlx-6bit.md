# tmthang86/Gemma4-Gutenberg-31B-mlx-6bit

## Resumen

Gemma4-Gutenberg-31B-mlx-6bit es una cuantización de 6 bits en formato MLX del modelo nbeerbower/Gemma4-Gutenberg-31B, un ajuste fino de google/gemma-4-31B-it orientado a generación de texto creativo y conversacional. Lo publica el usuario tmthang86 y está pensado específicamente para ejecutarse en Apple Silicon mediante mlx-lm, LM Studio u oMLX. El problema que resuelve es doble: por un lado, adapta el modelo base Gemma 4 de 31B a un estilo narrativo (el sufijo "Gutenberg" sugiere entrenamiento sobre corpus de literatura de dominio público); por otro, reduce el peso del checkpoint a unos 25 GB para que sea viable en equipos con memoria unificada de gama alta.

El checkpoint original tiene 30.697.345.280 parámetros (~30,7B) y es multimodal, pero esta conversión ha eliminado la torre de visión para quedarse solo con el modelo de texto. La cuantización se ha realizado con mlx-lm 0.32.2, con 6 bits y tamaño de grupo 64, lo que produce safetensors en formato MLX (no GGUF ni safetensors estándar de PyTorch). La licencia declarada es Apache 2.0, heredada del modelo base.

Es relevante ahora porque Gemma 4 es la generación más reciente de la familia abierta de Google y porque el ecosistema MLX permite ejecutar modelos de ~31B en Macs con 32-64 GB de memoria unificada, algo impracticable con cuantizaciones de mayor precisión en ese hardware. No obstante, se trata de un artefacto derivado con muy poca tracción (0 descargas, 0 likes) y sin documentación propia más allá de la nota de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; detalles finos no disponibles) |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (MLX); el modelo base admite otras cuantizaciones no documentadas aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 25,0 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de google/gemma-4-31B-it, un transformer decoder-only de la familia Gemma 4, según indica la model card del derivado. El ajuste fino nbeerbower/Gemma4-Gutenberg-31B parte de ese checkpoint instruct y lo especializa, presumiblemente, en prosa literaria y narrativa, aunque la información proporcionada no detalla la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO adicionales.

La innovación técnica de este artefacto concreto es la conversión a MLX con cuantización de 6 bits y group size 64 mediante `mlx_lm convert`, que reduce el peso a ~25 GB y permite inferencia nativa en Apple Silicon. Se ha descartado explícitamente la torre de visión del checkpoint multimodal original, por lo que el modelo resultante es solo texto. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido en la información disponible.

## Capacidades

- Generación de texto conversacional y creativo, con especialización declarada en prosa narrativa (el nombre "Gutenberg" apunta a estilo literario).
- Generación de texto instructiva heredada del modelo base gemma-4-31B-it.
- Inferencia nativa en Apple Silicon mediante mlx-lm, LM Studio y oMLX.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no soportada (la torre de visión fue eliminada en la conversión).
- Audio: no disponible.

## Casos de uso

- Escritura creativa y narrativa: el ajuste sobre corpus tipo Gutenberg lo hace adecuado para generar borradores de relatos, capítulos de novela y diálogos con estilo literario, ejecutándose localmente en un Mac.
- Asistencia de escritura en local para autores que necesitan confidencialidad: al correr en MLX sobre Apple Silicon, el texto nunca sale del equipo, lo que encaja con manuscritos no publicados o material sensible.
- Prototipado de aplicaciones de texto en macOS/iOS: sirve como backend de generación en herramientas de desarrollo para Apple Silicon sin depender de APIs en la nube, usando mlx-lm como librería.
- Generación de contenido editorial y marketing: producción de descripciones, artículos y variaciones de copy con un tono más elaborado que el de un modelo instruct genérico.
- Experimentación académica con cuantización: útil para estudiar la pérdida de calidad de 6 bits frente al checkpoint original en tareas de generación larga, dado que ambos están publicados.
- Educación y demos interactivas: despliegue en talleres o clases sobre modelos abiertos en hardware de consumo Apple, gracias a que el repo de 25 GB cabe en equipos con 32 GB o más de memoria unificada.
- Base para ajustes finos posteriores: al estar en MLX y con licencia Apache 2.0, puede servir de punto de partida para LoRA o fine-tuning adicional en entornos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~25 GB solo para los pesos en 6 bits; con overhead de contexto y caché KV conviene disponer de 32 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon (series M1/M2/M3/M4 Pro, Max y Ultra). No está pensado para GPU NVIDIA ni ROCm.
- Cabe en GPU de consumo Apple: sí, en configuraciones con 32 GB o más de memoria unificada (M-series Pro/Max/Ultra). En equipos de 16 GB no es viable.
- Despliegue: mlx-lm (CLI `mlx_lm.generate`), LM Studio y oMLX. No compatible de forma nativa con vLLM, TGI, llama.cpp ni Ollama, que esperan otros formatos (GGUF o safetensors PyTorch).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma4-Gutenberg-31B-mlx-6bit (este) | ~30,7B | no disponible | MLX safetensors 6-bit | Apache 2.0 | Solo texto, optimizado para Apple Silicon |
| nbeerbower/Gemma4-Gutenberg-31B | ~30,7B (presumible) | no disponible | safetensors (PyTorch) | Apache 2.0 | Checkpoint original, multimodal, mayor precisión |
| google/gemma-4-31B-it | ~30,7B (presumible) | no disponible | safetensors | Gemma (términos propios) | Modelo base instruct de Google, multimodal |
| Otras cuantizaciones GGUF del mismo base | ~30,7B | no disponible | GGUF | Apache 2.0 | Ejecutables en llama.cpp/Ollama, no en MLX |

La comparación directa con alternativas de la misma categoría (modelos de ~30B para Apple Silicon) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto derivado sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de pruebas de calidad por terceros.
- Pérdida de capacidades multimodales: la torre de visión fue eliminada, por lo que no puede procesar imágenes pese a que el modelo base sí podía.
- Degradación por cuantización: 6 bits con group size 64 introduce pérdida de precisión frente al checkpoint original; no se han publicado evaluaciones de esa degradación.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay datos específicos de evaluación.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base y los del corpus de ajuste, que no se detalla.
- Idiomas: no se especifican; no se puede garantizar un rendimiento multilingüe sin validación.
- Licencia: Apache 2.0 según la model card, pero esta advierte de que los datasets de entrenamiento tienen sus propias licencias, lo que puede imponer restricciones adicionales al uso comercial.
- Compatibilidad limitada: solo funciona en el ecosistema MLX (Apple Silicon); no es desplegable en vLLM, TGI, llama.cpp ni Ollama sin reconversión.
- Contexto: la longitud de contexto no está documentada en esta ficha; conviene verificarla en la model card del modelo base antes de usarlo en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/tmthang86/Gemma4-Gutenberg-31B-mlx-6bit
- Modelo original ajustado: https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B
- Modelo base de Google: https://huggingface.co/google/gemma-4-31B-it
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- LM Studio: https://lmstudio.ai
- oMLX: no disponible
