# Wenboz/UOPD-Qwen2.5-1.5B-Instruct-ALFWorld

## Resumen

UOPD-Qwen2.5-1.5B-Instruct-ALFWorld es un checkpoint final de estudiante entrenado con el método UOPD (el acrónimo no se desarrolla en la model card, aunque las etiquetas del repositorio lo asocian a destilación on-policy) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo publica el usuario Wenboz en HuggingFace y su propósito es transferir a un modelo de 1,5 B de parámetros el comportamiento de agente de un profesor congelado de 7 B, langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld, evaluado en el entorno textual ALFWorld.

El modelo cuenta con 1.777.088.000 parámetros reales (según los pesos safetensors) y un repositorio de 3,6 GB. El interés práctico está en la línea de investigación de destilación de agentes: comprimir la política de un profesor grande en un estudiante que pueda ejecutarse en hardware de consumo, manteniendo la capacidad de completar tareas domésticas multi-paso formuladas en lenguaje natural. La configuración de entrenamiento está documentada con detalle (250 pasos, AdamW con lr 1e-6, tasa de intervención del profesor decreciente de 0,50 a 0,30), lo que facilita reproducir o auditar el procedimiento.

Conviene señalarlo con claridad: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y no incluye resultados de benchmarks. Es, por tanto, un artefacto de investigación incipiente más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors en bf16, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-Instruct declara soporte multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16), librería transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen2.5-1.5B-Instruct: un transformer decoder-only autorregresivo con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atención con consultas agrupadas (GQA). No hay modificaciones estructurales declaradas en la model card; el ajuste afecta únicamente a los pesos.

El entrenamiento es una destilación on-policy desde el profesor congelado langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld. La configuración publicada indica 250 pasos, lotes de rollout/entrenamiento de 16/64, límite de 50 pasos por episodio en el entorno, máximo de 2.048 tokens de prompt y 512 de respuesta, optimizador AdamW con tasa de aprendizaje 1e-6. El elemento técnico más singular es la tasa de intervención objetivo del profesor: una progresión lineal de 0,50 a 0,30 durante los primeros 120 pasos de entrenamiento, fijada en 0,30 a partir de entonces, junto con la activación de "teacher takeover" y una pérdida SFT simple (peso 1,0) aplicada a los turnos en los que se dispara la intervención. Esto sugiere un esquema de destilación con corrección selectiva del profesor en los turnos considerados críticos, en lugar de imitación densa turno a turno.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct y ajustada al formato de diálogo del entorno ALFWorld.
- Ejecución de políticas de agente en entornos textuales interactivos: el modelo emite acciones en lenguaje natural para completar tareas domésticas (localizar objetos, desplazarse entre habitaciones, manipular y transformar objetos) con un límite de 50 pasos por episodio durante el entrenamiento.
- Razonamiento multi-paso orientado a objetivos, con mantenimiento del estado de la tarea a lo largo de la trayectoria.
- Seguimiento de instrucciones en formato conversacional, dado que el entrenamiento usa plantillas de prompt de hasta 2.048 tokens.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Tool calling / function calling: no documentado para este checkpoint; aunque el modelo base lo soporta, no hay evidencia de que el ajuste lo preserve.
- Capacidades multimodales, de audio o modo "thinking" explícito: no disponibles.

## Casos de uso

- Investigación en destilación on-policy de agentes: servir como estudiante de referencia para comparar el efecto de la tasa de intervención del profesor (0,50 → 0,30) frente a esquemas de imitación densa, reutilizando el profesor GiGPO-Qwen2.5-7B ya publicado.
- Evaluación de agentes en ALFWorld: desplegar el checkpoint como política base en el entorno de tareas domésticas y medir la tasa de éxito frente al profesor de 7 B y al modelo base sin ajustar.
- Prototipado de asistentes domésticos basados en texto: simular instrucciones del tipo "calienta un objeto y colócalo en una ubicación concreta" en un bucle de agente con parser de acciones y gestor de estado.
- Destilación en cascada para investigación académica: usar este estudiante de 1,5 B como punto de partida para destilar posteriormente hacia modelos aún más pequeños o hacia arquitecturas cuantizadas, aprovechando que el profesor de 7 B ya está disponible públicamente.
- Despliegue en hardware de consumo para demostraciones interactivas: al ocupar aproximadamente 3,6 GB en bf16, cabe en una única GPU de gama media, lo que permite iterar sobre prompts y trayectorias sin acceso a clúster.
- Generación de trayectorias sintéticas de agente: ejecutar el modelo en bucle cerrado sobre ALFWorld para producir rollouts anotados que alimenten posteriores fases de filtrado o aprendizaje por refuerzo.
- Comparativas de eficiencia profesor-alumno: cuantificar la pérdida de rendimiento por reducir el tamaño del modelo de 7 B a 1,5 B en una misma tarea y entorno.
- Punto de partida para ajuste en otros entornos textuales: el checkpoint ya incorpora formato de diálogo y estructura de acciones, lo que reduce el coste de adaptarlo a dominios similares de tipo TextWorld.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en ALFWorld, métricas de tareas completadas ni comparaciones numéricas con el profesor o con el modelo base. Tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

- Pesos en bf16: 1.777.088.000 parámetros × 2 bytes ≈ 3,55 GB, coherente con los 3,6 GB que ocupa el repositorio.
- VRAM estimada en bf16 (incluyendo caché KV y activaciones para contexto moderado): aproximadamente 4,5-6 GB. Estimación calculada a partir del número de parámetros, no publicada por el autor.
- VRAM estimada en cuantización INT8/Q8_0: aproximadamente 2,5-3 GB.
- VRAM estimada en cuantización Q4_K_M: aproximadamente 1,5-2 GB.
- GPU de consumo: sí cabe. Funciona con solvencia en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores; en cuantizaciones de 4 bits puede ejecutarse incluso en GPUs de 4-6 GB.
- GPU de datacenter: A100, H100 o L40S están sobredimensionadas para 1,78 B de parámetros, pero resultan útiles si se busca throughput muy alto con lotes grandes.
- Opciones de despliegue: transformers (ruta oficial documentada en la model card), text-generation-inference y endpoints compatibles según las etiquetas del repositorio, vLLM para servir con batching continuo, y llama.cpp/Ollama/LM Studio previa conversión de los pesos a GGUF (no se publican GGUF en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| UOPD-Qwen2.5-1.5B-Instruct-ALFWorld | 1,78 B | No disponible en la model card | Destilación on-policy en ALFWorld, 250 pasos, desde profesor de 7 B | No disponible | 0 descargas y 0 likes; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B (declarados) | 32.768 tokens según el modelo base | Ajuste por instrucciones de Qwen | Apache 2.0 según el modelo base | Modelo generalista; no especializado en agentes ni en ALFWorld |
| langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld (profesor) | 7 B (declarados) | No disponible en la información proporcionada | Entrenamiento con GiGPO en ALFWorld | No disponible | Profesor congelado utilizado para la destilación; mayor coste de inferencia |

No se dispone de datos de rendimiento que permitan comparar la calidad de estos tres modelos entre sí.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de Qwen2.5-Instruct, hereda los sesgos del modelo base, que el autor no analiza.
- Riesgo de alucinación: en entornos de agente, una alucinación se traduce en acciones inválidas o en afirmaciones sobre el estado del entorno que no se corresponden con la realidad. No hay evaluación publicada de la tasa de acciones inválidas.
- Especialización estrecha: el ajuste se ha realizado exclusivamente sobre ALFWorld. Es previsible un rendimiento degradado fuera de ese dominio o en tareas generales de propósito abierto, aunque no hay mediciones que lo confirmen.
- Contexto: la model card no especifica la ventana de contexto efectiva del checkpoint, y el entrenamiento limita las respuestas a 512 tokens. Contextos largos pueden degradar el comportamiento del agente.
- Idiomas: no se declaran idiomas soportados. El entrenamiento se ha realizado sobre un entorno en inglés, por lo que el uso en castellano no está validado.
- Licencia: no disponible. Sin una licencia explícita no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Madurez: 0 descargas, 0 likes y ausencia total de benchmarks. Es un artefacto de investigación, no un modelo validado para producción.
- Tool calling y agentes externos: no hay documentación que confirme que el ajuste preserve las capacidades de function calling del modelo base, lo que limita su integración en pipelines de agentes con herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wenboz/UOPD-Qwen2.5-1.5B-Instruct-ALFWorld
- Profesor utilizado en la destilación: https://huggingface.co/langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante (papers, blogs, repositorios o demos) relacionado con este modelo; los resultados devueltos correspondían a servicios de música y no guardan relación con el contenido de la ficha.
