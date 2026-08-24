# tanshin91/Ornith-1.5-9B-oQ4e-fp16

## Resumen

Ornith-1.5-9B-oQ4e-fp16 es una cuantización en formato MLX del modelo Ornith-1.5-9B, desarrollado por el laboratorio Ornith AI. El modelo original forma parte de la familia Ornith-1.5, que incluye versiones densas y de mezcla de expertos (MoE) de 9B, 35B y 397B parámetros, todas con una ventana de contexto de 262.144 tokens. Ornith-1.5 se distingue por su enfoque de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos y produce soluciones que se utilizan para entrenamiento por refuerzo, cerrando un bucle de mejora continua.

Esta versión concreta, publicada por el usuario tanshin91, aplica cuantización mixta de precisión (oQ) de 4 bits con tamaño de grupo 64 sobre los pesos del modelo, reduciendo significativamente el espacio en disco y los requisitos de memoria para su ejecución en dispositivos Apple Silicon mediante la librería MLX. Aunque la ficha original no especifica licencia ni idiomas, el modelo base es de acceso abierto y está orientado a tareas de razonamiento, generación de código y uso como agente.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de ~9B parámetros con contexto largo en hardware de consumo, especialmente en Macs con suficiente memoria unificada, sin necesidad de GPUs dedicadas de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (basada en Qwen3.5, transformer denso) |
| Parametros totales | 1.876.724.976 (según safetensors; el modelo original Ornith-1.5-9B tiene ~9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | 4 bits, group size 64, formato MLX safetensors (oQ4e-fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de aproximadamente 9 mil millones de parámetros, basado en la arquitectura Qwen3.5. Según la información publicada por Ornith AI, el entrenamiento sigue un paradigma de auto-mejora: el modelo genera sus propias tareas, crea andamiajes (scaffolds) específicos para cada tarea y produce soluciones que se incorporan a un pipeline de aprendizaje por refuerzo. Este bucle continuo permite que el modelo mejore sin depender exclusivamente de datos humanos etiquetados.

La cuantización aplicada en esta versión utiliza la herramienta oQ de oMLX, que combina precisión mixta: los pesos se cuantizan a 4 bits con un tamaño de grupo de 64, mientras que algunos componentes (como cabezas de atención o capas críticas) se mantienen en fp16 para preservar la calidad. El resultado es un modelo que ocupa aproximadamente 7 GB en disco, frente a los ~19 GB del original en bf16.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas específicas de alineación (RLHF, DPO, etc.) empleadas en el modelo base.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo está diseñado para tareas que requieren planificación y ejecución de múltiples pasos, gracias a su entrenamiento con auto-mejora.
- Generación de código: al estar basado en Qwen3.5, hereda capacidades sólidas de programación y comprensión de lenguajes de programación.
- Soporte de agentes y tool calling: la arquitectura Qwen3.5 incluye soporte nativo para llamadas a herramientas, lo que permite integrarlo en flujos de agentes autónomos.
- Contexto largo: con 262.144 tokens de ventana, puede procesar documentos extensos, repositorios de código completos o conversaciones de muchas vueltas.
- Multilingüismo: no se han publicado datos específicos, pero por su base Qwen3.5 es probable que soporte múltiples idiomas, especialmente chino e inglés.
- Auto-mejora: el modelo base puede proponer nuevas tareas y generar sus propios datos de entrenamiento, una capacidad inusual que lo diferencia de modelos estáticos.

## Casos de uso

- Asistente de programación en entornos de desarrollo: gracias a su contexto de 256K, puede analizar repositorios completos, sugerir refactorizaciones y generar código nuevo coherente con el estilo del proyecto. Se puede integrar en IDEs mediante la API compatible con OpenAI.
- Agente autónomo de investigación: el modelo puede descomponer una pregunta compleja en subtareas, buscar información en documentos largos y sintetizar respuestas con referencias, aprovechando su capacidad de tool calling y razonamiento multi-paso.
- Análisis de documentos legales o financieros: la ventana de contexto amplia permite procesar contratos, informes anuales o expedientes completos en una sola pasada, extrayendo cláusulas relevantes o detectando inconsistencias.
- Chatbot de atención al cliente con memoria extendida: puede mantener conversaciones de larga duración sin perder el hilo, recordando interacciones anteriores y resolviendo incidencias complejas con acceso a bases de conocimiento.
- Generación de datos sintéticos para entrenamiento: el modelo base está diseñado para proponer tareas y generar soluciones, por lo que puede utilizarse para crear datasets de entrenamiento para modelos más pequeños o para fine-tuning especializado.
- Despliegue en Macs para prototipado rápido: al estar cuantizado en MLX, se puede ejecutar localmente en una Mac con Apple Silicon (por ejemplo, M2 Pro con 32 GB de RAM) para pruebas de concepto sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original Ornith-1.5-9B no incluye tablas comparativas en los materiales consultados, y esta cuantización tampoco aporta métricas propias. Se recomienda consultar el repositorio oficial de Ornith AI para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser una cuantización de 4 bits con group size 64, el modelo ocupa aproximadamente 5-6 GB en memoria. En MLX, la memoria unificada del sistema es la que se utiliza, por lo que se recomienda un Mac con al menos 16 GB de RAM unificada para una experiencia fluida.
- GPU recomendadas: en hardware Apple, cualquier chip M1 Pro o superior con 16 GB o más de memoria unificada. En GPUs NVIDIA, el modelo en formato MLX no es directamente ejecutable; habría que convertirlo a otro formato (por ejemplo, GGUF o GPTQ) para usar con CUDA.
- Si cabe en consumer GPU: sí, en una GPU con 8 GB de VRAM (por ejemplo, RTX 3070) si se convierte a un formato compatible, aunque la versión MLX está pensada para Apple Silicon.
- Opciones de despliegue: la librería MLX permite ejecutar el modelo directamente en Python con `mlx-lm` o mediante servidores compatibles con OpenAI (por ejemplo, `mlx_lm.server`). También se puede convertir a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no se dispone de datos medidos. En una Mac M2 Pro, se espera una generación de 10-20 tokens por segundo con cuantización 4-bit, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para esta cuantización. Sin embargo, se puede comparar a nivel de especificaciones con otros modelos densos de ~9B:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ornith-1.5-9B (original) | ~9B | 262.144 | no disponible | bf16 |
| Llama 3.1 8B | 8B | 128.000 | Llama 3.1 Community License | bf16, GGUF, etc. |
| Qwen2.5 7B | 7.6B | 131.072 | Apache 2.0 | bf16, GGUF, etc. |
| Mistral 7B | 7.3B | 32.000 | Apache 2.0 | bf16, GGUF, etc. |

La principal ventaja de Ornith-1.5-9B frente a estos modelos es su contexto de 256K, muy superior al de Llama 3.1 8B (128K) y Qwen2.5 7B (131K). Además, su enfoque de auto-mejora podría ofrecer un mejor rendimiento en tareas de razonamiento, aunque no hay benchmarks públicos que lo confirmen.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones específicas del modelo. Como cualquier LLM, puede generar contenido falso o inventado, especialmente en dominios poco representados en sus datos de entrenamiento.
- La licencia no está especificada en la ficha de HuggingFace. Antes de usar el modelo en producción comercial, es imprescindible contactar con Ornith AI o consultar el repositorio oficial para confirmar los términos de uso.
- El modelo base está entrenado principalmente con datos en inglés y chino (por su base Qwen3.5), por lo que su rendimiento en otros idiomas, incluido el español, puede ser inferior.
- La cuantización de 4 bits puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en bf16, especialmente en tareas de razonamiento matemático o lógico complejo.
- El formato MLX limita su uso a ecosistemas Apple. Para otros entornos, es necesario convertir los pesos a otro formato, lo que puede requerir herramientas adicionales y tiempo de procesamiento.
- El número de parámetros reportado en el safetensors (1.876.724.976) no coincide con la cifra de ~9B del modelo original. Esto podría deberse a un error en la cuantización o a una versión reducida; se recomienda verificar la integridad del modelo antes de usarlo.

## Enlaces

- Modelo cuantizado: https://huggingface.co/tanshin91/Ornith-1.5-9B-oQ4e-fp16
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión MLX oficial: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
