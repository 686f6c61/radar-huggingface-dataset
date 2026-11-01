# U-WIN/qwen35-9b-equational-theory-sair-rft-k3-closedbook-notesstrict-finalgate-2ep-from-notes50m-kl

## Resumen

El modelo `qwen35-9b-equational-theory-sair-rft-k3-closedbook-notesstrict-finalgate-2ep-from-notes50m-kl` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario U-WIN en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text orientado a una tarea muy específica: la resolución de problemas de teoría ecuacional (equational theory) dentro del marco del proyecto SAIR, mediante un pipeline de entrenamiento que combina SFT, RFT (Rejection Sampling Fine-Tuning) y regularización KL.

Con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) y un repositorio de 19,3 GB en formato safetensors, el modelo hereda la arquitectura Qwen3.5 del modelo base, sobre el que se ha aplicado un ajuste fino completo. El nombre del checkpoint refleja una configuración de entrenamiento muy concreta: dos épocas, notas estrictas en modo closed-book, un filtro final de validación (finalgate) y un coeficiente KL aplicado sobre un modelo de referencia entrenado con 50 millones de tokens de notas.

La relevancia de este modelo es acotada pero clara: se trata de un artefacto de investigación reproducible más que de un modelo de propósito general. Su acceso está restringido en HuggingFace (requiere aceptar condiciones), tiene un número muy bajo de descargas (2) y no cuenta con likes, lo que indica que es un experimento reciente y de nicho. Resulta útil para quienes investigan técnicas de RFT con regularización KL aplicadas a dominios formales y para replicar resultados del proyecto SAIR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5 (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de entrenamiento | Full fine-tune + SFT + RFT + regularizacion KL |
| Pipeline | image-text-to-text |
| Acceso | Restringido (gated) en HuggingFace |
| Tamano del repositorio | 19,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 que procesa entradas de imagen y texto y genera texto. Sobre esa base se ha realizado un ajuste fino completo (todos los parámetros, no un adaptador LoRA), lo que explica el tamaño del repositorio (19,3 GB) y el recuento de parámetros de 9,65 B.

La información disponible sobre el entrenamiento se limita a lo que revela el nombre del checkpoint y las etiquetas del repositorio. El pipeline combina supervisión fina (SFT) con Rejection Sampling Fine-Tuning (RFT): se generan múltiples respuestas candidatas, se filtran por calidad y se reentrena sobre las aceptadas. Se aplica además regularización KL contra un modelo de referencia entrenado con 50 millones de tokens de notas ("from-notes50m-kl"), lo que sugiere un mecanismo para evitar el olvido catastrófico y mantener la distribución del modelo base. El sufijo "notesstrict" y "closedbook" indica que el entrenamiento se realizó sin acceso a material externo en el momento de la inferencia, obligando al modelo a internalizar el conocimiento. "finalgate" hace referencia a una etapa de validación final que filtra los checkpoints o muestras aceptadas. El entrenamiento se extendió durante dos épocas ("2ep"). No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni los hiperparámetros concretos (tasa de aprendizaje, tamaño de lote, coeficiente KL exacto).

## Capacidades

- Generación de texto y razonamiento sobre problemas formales, específicamente teoría ecuacional en el contexto del proyecto SAIR.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), heredado del modelo base Qwen3.5.
- Modo closed-book: responde sin acceso a documentación externa, apoyándose en el conocimiento internalizado durante el ajuste.
- Conversación multi-turno (etiqueta "conversational" en el repositorio).
- Entrenamiento con rejection sampling, lo que en principio favorece respuestas de mayor calidad en el dominio objetivo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en el repositorio.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigación en teoría ecuacional: el modelo está entrenado específicamente para resolver problemas de equational theory en el marco SAIR, por lo que sirve como banco de pruebas para evaluar técnicas de RFT y regularización KL en dominios formales.
- Replicación de experimentos de RFT: al estar publicado el checkpoint completo con la configuración reflejada en el nombre, permite reproducir y comparar los resultados del pipeline SFT + RFT + KL frente a alternativas.
- Evaluación de olvido catastrófico: la inclusión de regularización KL contra un modelo de referencia de 50M de tokens de notas lo hace útil para estudiar cómo el ajuste fino completo afecta a las capacidades del modelo base.
- Generación de soluciones paso a paso en dominios formales: el modo closed-book y las notas estrictas favorecen respuestas razonadas sin dependencia de recuperación externa, adecuado para entornos sin acceso a documentación.
- Análisis multimodal de enunciados: al heredar el pipeline image-text-to-text, puede emplearse para interpretar problemas presentados como imágenes (por ejemplo, capturas de enunciados o diagramas) y generar la solución textual.
- Base para ajustes posteriores: al ser un full fine-tune con licencia Apache 2.0, puede servir como punto de partida para especializaciones adicionales en dominios matemáticos o lógicos, siempre que se respete la licencia y las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 19-20 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB para contextos cortos.
- Cuantización a 8 bits: alrededor de 10-11 GB de VRAM para los pesos; cuantización a 4 bits: alrededor de 5-6 GB, aunque no se han publicado variantes GGUF oficiales en el repositorio.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 con contextos moderados; RTX 3090/4090 viables en cuantización 8 o 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más en fp16 para contextos cortos, y en tarjetas de 12-16 GB si se aplica cuantización.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de servirlo mediante vLLM o TGI si se convierte el checkpoint; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| qwen35-9b-equational-theory-sair-rft-k3-closedbook-notesstrict-finalgate-2ep-from-notes50m-kl | 9,65 B | no disponible | Apache 2.0 | Restringido (gated) | Full fine-tune especializado en teoría ecuacional |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | no disponible en esta ficha | Público | Modelo base multimodal image-text-to-text |
| Alternativas de 7-9 B de propósito general (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8 B | 32k-128k típicamente | Licencias variables | Público | No especializados en teoría ecuacional; comparación solo orientativa |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated en HuggingFace y requiere aceptar condiciones antes de descargar los pesos.
- Nicho muy específico: el ajuste está orientado a teoría ecuacional y al proyecto SAIR; su rendimiento en tareas generales puede degradarse respecto al modelo base por el full fine-tune.
- Riesgo de alucinación: como todo modelo generativo, puede producir soluciones plausibles pero incorrectas en problemas formales; el modo closed-book agrava este riesgo al no disponer de verificación externa.
- Idiomas no declarados: se desconoce el soporte multilingüe real tras el ajuste fino.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni comparaciones verificables con el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de acceso del repositorio y las obligaciones de atribución del modelo base Qwen.
- Trazabilidad limitada: con 2 descargas y 0 likes, es un artefacto de investigación sin validación comunitaria; conviene auditar su comportamiento antes de usarlo en producción.
- No se han publicado variantes cuantizadas, lo que dificulta el despliegue en hardware limitado sin trabajo adicional de conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-rft-k3-closedbook-notesstrict-finalgate-2ep-from-notes50m-kl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
