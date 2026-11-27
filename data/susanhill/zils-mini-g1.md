# SusanHill/zils-mini-g1

## Resumen

zils-mini-g1 es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario SusanHill bajo la etiqueta "zils". El modelo se presenta como un "d3-mini soup body" y está entrenado sobre elementos de decisión procedentes de conjuntos públicos de tool-calling (Glaive) y razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench). Su propósito declarado es mejorar la capacidad de decisión del modelo base en tareas de invocación de herramientas y razonamiento de sentido común.

Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones), se sitúa en la categoría de modelos compactos, lo que lo hace candidato para despliegue en hardware de consumo moderado. Hereda la arquitectura y el contexto del Qwen3.5-4B subyacente, aunque la model card no detalla explícitamente estos extremos.

El modelo se publica bajo licencia Apache-2.0 y con pesos en formato safetensors, con un tamaño de repositorio de 9,1 GB. Es relevante para quienes buscan un modelo pequeño especializado en decisiones de tool-calling y razonamiento, aunque la información publicada es muy escasa y no incluye benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; se desconoce si existen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen/Qwen3.5-4B. La model card lo describe como "d3-mini soup body", un término que sugiere una composición o mezcla de adaptadores previos (model soup) sobre la que se aplica el entrenamiento LoRA. No se especifican los detalles de la arquitectura interna más allá de la herencia del modelo base Qwen3.5-4B, ni el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Los datos de entrenamiento declarados son elementos de decisión de tool-calling procedentes de Glaive y de razonamiento procedente de SIQA, PIQA, CSQA, GSM8K y BIG-bench, todos ellos conjuntos públicos y divididos en train-split. No se detalla el volumen de datos, la proporción entre conjuntos ni la configuración del entrenamiento LoRA (rango, alpha, epochs, learning rate). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de sentido común, apoyada en el entrenamiento sobre SIQA, PIQA, CSQA y BIG-bench.
- Razonamiento matemático básico, derivado del entrenamiento sobre GSM8K.
- Tool calling / function calling, entrenado explícitamente con datos de Glaive.
- Toma de decisiones orientada a la selección de acciones o herramientas.
- Capacidades multilingües: no disponibles (no declaradas).
- Modo thinking, visión o audio: no disponibles (no declarados).
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el entrenamiento en tool-calling sugiere uso en flujos con invocación de herramientas.

## Casos de uso

- Asistentes con invocación de herramientas: el entrenamiento sobre Glaive permite al modelo decidir qué función invocar y con qué argumentos en flujos de automatización, integrándose en pipelines de agentes.
- Razonamiento de sentido común en sistemas de preguntas y respuestas: el ajuste sobre SIQA, PIQA y CSQA lo hace adecuado para tareas de QA donde se requiere elegir entre opciones plausibles.
- Resolución de problemas matemáticos sencillos: el entrenamiento sobre GSM8K lo orienta a problemas aritméticos de varios pasos, útil en tutores automáticos o asistentes educativos.
- Enrutamiento de decisiones en aplicaciones: puede emplearse como clasificador de intención o selector de acción en backends de bajo coste, dado su tamaño compacto de 4,5 mil millones de parámetros.
- Prototipado rápido en hardware de consumo: al ser un modelo pequeño, permite experimentar con tool-calling y razonamiento en una sola GPU consumer, sin infraestructura dedicada.
- Evaluación comparativa de ajustes LoRA: sirve como referencia para estudiar el efecto del entrenamiento en decisiones sobre el modelo base Qwen3.5-4B en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4,5 mil millones de parámetros, la inferencia en fp16 requeriría aproximadamente 9 GB de VRAM, en int8 unos 4,5-5 GB y en int4 unos 2,5-3 GB; estas cifras son estimaciones y no proceden de la documentación del modelo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs como RTX 3090, RTX 4090, A100 o H100; en GPUs de 8 GB solo con cuantización.
- Cabe en GPU de consumo: previsiblemente sí, en modelos con 8 GB o más de VRAM si se cuantiza; no confirmado por el autor.
- Opciones de despliegue: no documentadas. Al ser un modelo basado en Qwen con pesos safetensors, podría desplegarse con frameworks compatibles (vLLM, TGI, llama.cpp si se generan pesos GGUF), pero no hay instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-g1 | 4,54 B | No disponible | Apache-2.0 | Ajuste LoRA de Qwen3.5-4B para tool-calling y razonamiento |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | No disponible | Modelo base del que deriva; sin ajuste específico en decisiones |
| Alternativas de ~4 B para tool-calling | No disponible | No disponible | No disponible | No se dispone de datos de comparación en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta datos de entrenamiento, hiperparámetros, evaluación ni limitaciones conocidas.
- Riesgo de alucinación inherente a los modelos de 4,5 mil millones de parámetros, especialmente en tareas de razonamiento complejo o matemáticas.
- Sesgos desconocidos: al no detallarse la composición del dataset ni los procesos de alineación, no es posible evaluar sesgos de género, raza o idioma.
- Idiomas soportados no declarados; el rendimiento fuera del inglés es incierto.
- Longitud de contexto no documentada; podría limitar conversaciones largas o documentos extensos.
- El ajuste se centra en elementos de decisión de conjuntos públicos; su generalización a dominios reales de producción no está validada.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de evaluación y documentación hace recomendable una validación exhaustiva antes de desplegarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-mini-g1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
