# teilomillet/wyat-2-1.4b

## Resumen

Wyat-2-1.4B es un modelo de decisión local desarrollado por teilomillet, construido mediante fine-tuning sobre ByteDance/Ouro-1.4B, un Universal Transformer con profundidad recurrente. A diferencia de los modelos generativos convencionales, Wyat no produce texto libre: recibe una entrada junto con un conjunto de candidatos permitidos y devuelve respuestas estructuradas con distribuciones de probabilidad. Está diseñado para tareas de clasificación y decisión, no para generación abierta.

El modelo resuelve tres tipos de tarea: selección de una opción entre un menú (choice), estimación de la probabilidad de que una afirmación sea verdadera (noul) y puntuación ordinal contra una rúbrica ordenada (score). Esta aproximación resulta relevante para pipelines de enrutamiento, moderación y evaluación automatizada donde se necesita una salida determinista y acotada en lugar de texto generado.

Con 1.400 millones de parámetros, ventana de contexto de hasta 32.768 tokens y licencia Apache 2.0, el modelo está pensado para ejecutarse en hardware de consumo, incluyendo Apple Silicon mediante MPS y GPUs NVIDIA con soporte BF16. Soporta inglés y francés. El autor lo etiqueta explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Universal Transformer con profundidad recurrente (base ByteDance/Ouro-1.4B), LoRA por paso recurrente y cabeza escalar de scoring en FP32 |
| Parametros totales | 1.400 millones (aproximado, segun el modelo base Ouro-1.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto completo mas candidato); las entradas que lo superan se rechazan sin truncado silencioso |
| Tipos de cuantizacion | no disponible (el runtime oficial usa BF16 en CUDA y FP32 en Mac; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) y frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ByteDance/Ouro-1.4B (revision `574fa66cb8bf5abdc979642d01cf2b79b16bfab1`), un Universal Transformer con profundidad recurrente que comparte parámetros entre pasos de cómputo. Sobre esa base, el autor congela los pesos originales e incorpora adaptadores LoRA de rango 16 por cada paso recurrente, junto con una cabeza escalar de scoring en FP32. La configuración usa 4 pasos recurrentes para el contexto compartido y 2 pasos para los candidatos, con scoring por lotes de candidatos sobre el contexto compartido.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el enfoque de decisión: en lugar de generar texto, el modelo puntúa candidatos suministrados por el usuario y devuelve probabilidades relativas a los candidatos (no confianza calibrada). El runtime incluido gestiona frecuencias rotatorias en FP32 para preservar la ejecución de contexto largo verificado.

## Capacidades

- Selección entre opciones (choice): devuelve la distribución de probabilidad sobre un menú de candidatos definido por el usuario.
- Estimación de veracidad (noul): calcula la probabilidad de que una afirmación dada sea verdadera.
- Puntuación ordinal (score): evalúa una entrada contra una rúbrica ordenada y devuelve el valor ordinal esperado.
- Múltiples preguntas sobre una misma entrada mediante `model.predict()`, combinando tareas choice, noul y score en una sola llamada.
- Procesamiento de contexto largo de hasta 32.768 tokens, con rechazo explícito de entradas que exceden el límite.
- Soporte bilingüe inglés y francés.
- Ejecución local en CPU, Apple MPS y NVIDIA CUDA.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso agéntico; su API es de decisión estructurada.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar una consulta entrante en categorías predefinidas (facturación, envío, técnico) mediante la tarea choice, con distribución de probabilidad para umbrales de confianza y escalado a revisión humana.
- Moderación de contenido: usar noul para estimar la probabilidad de que un texto viole una política concreta, con contexto de hasta 32.768 tokens para documentos largos.
- Evaluación automatizada de respuestas: aplicar score contra rúbricas ordenadas (por ejemplo, calidad de una respuesta o severidad de un incidente) para pipelines de evaluación de LLM.
- Triaje de urgencia: puntuar la urgencia de una solicitud con niveles ordenados y derivar automáticamente a colas con distinta prioridad.
- Filtrado y clasificación de documentos en local: procesar textos bilingües inglés/francés sin enviar datos a la nube, gracias a la ejecución en hardware de consumo.
- Validación de afirmaciones en bases de conocimiento: comprobar con noul si una declaración extraída de un documento es consistente con el contexto aportado.
- Enrutamiento de consultas en asistentes conversacionales: decidir la intención del usuario entre un conjunto cerrado de acciones antes de invocar el sistema correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta una validación de consistencia entre dispositivos: en un Apple M4 Pro con 24 GB, CPU y Apple MPS completaron 11 peticiones y 18 preguntas (choice, noul, score, múltiples preguntas y contextos superiores a 1.024 tokens) con rankings idénticos y una diferencia absoluta máxima de logits de 0,000060, dentro de la tolerancia `atol=rtol=0.0001` de la comprobación en FP32. La evaluación CUDA se realizó en una RTX 4070 Ti de 12 GB VRAM con PyTorch 2.8.0, CUDA 12.8 y Transformers 4.57.6.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 2,9 GB. La ejecución CUDA verificada en BF16 cabe en 12 GB de VRAM (RTX 4070 Ti).
- GPU recomendadas: RTX 4070 Ti (verificada), GPUs NVIDIA con soporte BF16; Apple M4 Pro con 24 GB verificada vía MPS.
- Cabe en GPU de consumo: sí, con al menos 12 GB de VRAM para BF16 en CUDA. En Mac se ejecuta en FP32 sobre MPS o CPU.
- Opciones de despliegue: runtime propio incluido en el repositorio (backend `torch` con dispositivos `cuda`, `mps` o `cpu`), instalado vía `requirements.txt` con PyTorch 2.8.0 y Transformers 4.57.6. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wyat-2-1.4B | ~1,4B | 32.768 | Decision/clasificacion (choice, noul, score) | Apache 2.0 | HuggingFace, runtime propio |
| ByteDance/Ouro-1.4B | 1,4B | no disponible en esta ficha | LLM causal generativo (modelo base) | no disponible en esta ficha | HuggingFace |
| Alternativas de clasificacion encoder-only (p. ej. DeBERTa) | 0,1-1,5B | tipicamente 512 | Clasificacion supervisada | MIT/Apache segun variante | HuggingFace |

No se dispone de datos de rendimiento comparativo entre Wyat-2-1.4B y otras alternativas en la informacion disponible.

## Limitaciones y advertencias

- El autor declara el modelo como experimental; recomienda validar su comportamiento en cada aplicación antes de usarlo en producción.
- Las probabilidades devueltas son relativas a los candidatos, no confianza calibrada; no deben interpretarse como probabilidades absolutas.
- Solo soporta inglés y francés; el rendimiento en otros idiomas no está documentado.
- No genera texto libre: no es adecuado para tareas generativas, tool calling ni razonamiento agéntico.
- Las entradas que superan los 32.768 tokens se rechazan sin truncado; es necesario gestionar ese error en el pipeline.
- No se documentan sesgos conocidos ni tasas de alucinación, aunque al trabajar con candidatos cerrados el riesgo de invención es estructuralmente menor.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de ByteDance/Ouro-1.4B conviene verificar las condiciones del modelo base.
- El runtime incluido debe usarse tal cual para coincidir con el artefacto validado; importar otra versión del paquete `wyat` en el mismo proceso puede causar problemas.

## Enlaces

- HuggingFace: https://huggingface.co/teilomillet/wyat-2-1.4b
- Web oficial: https://wyat.io
- Repositorio Python: https://github.com/teilomillet/wyat
- Documentación: https://github.com/teilomillet/wyat/blob/main/docs/README.md
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B
- Revision cualificada para CUDA: `c4bbfac55f3c997259f55b8ce07ab70848ee5b0d`
- Revision del modelo base: `574fa66cb8bf5abdc979642d01cf2b79b16bfab1`
