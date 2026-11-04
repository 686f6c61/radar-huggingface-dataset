# xtools-at/Qwen3.8-27B-CodeForge-3xMerge

## Resumen
Qwen3.8-27B CodeForge-3xMerge es un modelo de lenguaje multimodal (texto e imagen de entrada) obtenido mediante la fusión ponderada de tres ajustes finos independientes sobre la misma base: Qwen/Qwen3.8-27B. Lo publica el usuario xtools-at en HuggingFace bajo licencia Apache 2.0, con 27.781 millones de parámetros efectivos según los pesos en safetensors y un repositorio de 55,6 GB. El pipeline declarado es image-text-to-text y la librería de referencia es transformers.

El objetivo de la fusión es combinar tres perfiles complementarios sin sobreespecializar el resultado: razonamiento estructurado y codificación con pensamiento eficiente (procedente de nerkyor/Qwen3.8-27B-Coder390-EfficientThink), conversación y conocimiento destilado (de TeichAI/Qwen3.8-27B-Fable-Distill) y capacidades de ingeniería de software y uso de herramientas (de Jackrong/Qwopus3.8-27B-Coder-Flash). Los coeficientes de mezcla declarados son 1,00, 0,85 y 0,70 respectivamente.

Es relevante porque propone un modelo generalista de 27B con sesgo hacia código, agentes y tool calling, manteniendo la ventana y el tokenizador de la familia Qwen3.8. La información publicada no detalla la longitud de contexto, los tipos de cuantización oficiales ni resultados de benchmarks propios del merge, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 (qwen3_5 en transformers), multimodal image-text-to-text; no se detalla si es densa o MoE |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el autor enlaza a cuantizaciones/GGUF de terceros derivadas del modelo |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo no se entrena desde cero: es un merge ponderado de tres checkpoints que comparten la base Qwen3.8-27B. La model card indica que la arquitectura subyacente es la de Qwen3.8 (etiqueta qwen3_5 en transformers) y que el pipeline es image-text-to-text, por lo que hereda la torre visual y el tokenizador de la familia. No se especifica en la información disponible si la base es densa o de mezcla de expertos, ni el número de tokens de entrenamiento original.

Los tres contribuyentes aportan recetas distintas. nerkyor/Qwen3.8-27B-Coder390-EfficientThink parte de un SFT + SimPO propio y añade rondas de SFT y RLOO con trayectorias y respuestas de profesores (Opus 5.5, GPT-6 Astra, DeepSeek V4 Pro, K3), con un objetivo EfficientThink para reducir bucles de razonamiento improductivos; incluye componentes de decodificación especulativa MTP y DFlash2. TeichAI/Qwen3.8-27B-Fable-Distill es un ajuste fino ligero sobre datasets públicos de trazas de código y conversación más un corpus privado. Jackrong/Qwopus3.8-27B-Coder-Flash se entrena con aproximadamente 200.000 ejemplos de código y razonamiento orientados a flujos agénticos y uso de herramientas. El merge aplica pesos 1,00 / 0,85 / 0,70 sobre esos tres checkpoints; no se documenta el método exacto de fusión (por ejemplo, linear, SLERP o TIES) ni si hubo un post-entrenamiento adicional tras la mezcla.

## Capacidades
- Generación de texto y conversación multi-turno en inglés y chino.
- Entrada de imágenes junto con texto (pipeline image-text-to-text), heredada de la base Qwen3.8-27B.
- Generación y comprensión de código, con especial énfasis en implementación práctica y calidad de parche.
- Razonamiento estructurado y resolución de problemas algorítmicos y lógicos.
- Modo de pensamiento eficiente (EfficientThink): busca reducir cadenas de razonamiento innecesariamente largas sin eliminar el razonamiento profundo cuando la tarea lo exige.
- Soporte de tool calling y function calling, orientado a flujos agénticos.
- Capacidades agénticas: planificación, inspección de resultados de herramientas y corrección de errores en varios pasos.
- Seguimiento de instrucciones y respuestas de estilo conversacional y conocimiento general por la vía de la destilación.
- No se documentan capacidades de audio ni de salida de imagen.

## Casos de uso
- Asistente de programación en IDE: el modelo puede generar parches, explicar código existente y proponer refactorizaciones, aprovechando el entrenamiento de Jackrong en aproximadamente 200.000 ejemplos de código y razonamiento.
- Agente de resolución de incidencias en CI/CD: con tool calling puede leer logs, ejecutar comprobaciones, inspeccionar la salida y aplicar correcciones iterativas, un patrón para el que los tres contribuyentes fueron ajustados explícitamente.
- Automatización de revisión de código en pull requests: genera comentarios técnicos y detecta errores lógicos o de estilo, con la ventaja de un razonamiento más contenido gracias al objetivo EfficientThink.
- Asistencia técnica multilingüe inglés-chino: atención a desarrolladores en ambos idiomas, con contexto conversacional destilado del contribuyente Fable.
- Extracción de información de capturas y diagramas: al aceptar entrada de imagen, puede transcribir diagramas de arquitectura, capturas de error o tablas y convertirlos en texto estructurado o código.
- Generación de pruebas unitarias y datos de prueba: a partir de una firma de función o de un fragmento de código, produce casos de prueba y escenarios de borde.
- Tutoría de algoritmos y matemáticas aplicadas: resuelve problemas paso a paso con un presupuesto de razonamiento controlado, útil en entornos interactivos con latencia ajustada.
- Prototipado de pipelines agénticos: al estar disponible en transformers con safetensors, sirve como base para evaluar orquestaciones de agentes antes de pasar a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks del merge en la información disponible. La model card menciona que el contribuyente Coder390 toma su nombre de objetivos de rendimiento en GPQA, MMLU y LiveCodeBench, y que Fable-Distill publica resultados de ARC Challenge y BoolQ, pero no se incluyen cifras concretas ni mediciones del modelo fusionado.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: en torno a 56 GB solo para pesos (27,78B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 64-80 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 28-30 GB de pesos, más overhead; viable en una GPU de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 14-16 GB de pesos, más overhead; podría caber en GPUs de consumo de 24 GB, aunque no se han publicado mediciones del autor.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200; para 8 bits, A100 40 GB o L40S 48 GB; para 4 bits, RTX 4090 24 GB o RTX 3090 24 GB con margen ajustado.
- Despliegue: transformers de forma nativa; para servir en producción, vLLM o TGI si la arquitectura Qwen3.8 está soportada por esas herramientas (no confirmado en la información disponible). El autor enlaza a cuantizaciones y GGUF de terceros, lo que permitiría llama.cpp u Ollama, pero no se garantiza su disponibilidad ni calidad.
- Latencia y throughput: no disponibles; dependen de la cuantización, del hardware y del presupuesto de tokens de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| xtools-at/Qwen3.8-27B-CodeForge-3xMerge | 27,78B | no disponible | Apache 2.0 | Merge de tres ajustes finos; multimodal de entrada; enfoque código y agentes |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink-... | 27B (base) | no disponible | no disponible | Contribuyente con SFT + RLOO y decodificación especulativa MTP/DFlash2 |
| TeichAI/Qwen3.8-27B-Fable-Distill | 27B (base) | no disponible | no disponible | Ajuste fino ligero orientado a conversación y conocimiento destilado |
| Jackrong/Qwopus3.8-27B-Coder-Flash | 27B (base) | no disponible | no disponible | Ajuste fino con unos 200.000 ejemplos de código y razonamiento agéntico |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del merge frente a sus contribuyentes o frente a otros modelos de la misma categoría.

## Limitaciones y advertencias
- No hay resultados de benchmarks publicados del merge, por lo que su rendimiento real frente a la base Qwen3.8-27B o frente a los contribuyentes individuales no está verificado.
- Los merges ponderados pueden degradar capacidades si los checkpoints tienen distribuciones de pesos divergentes; no se documenta el método de fusión ni validación posterior.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en afirmaciones factuales y en referencias a APIs o librerías; conviene validar la salida de código con pruebas automatizadas.
- Idiomas soportados declarados únicamente inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada en la información disponible; planificar despliegues con contexto largo requiere verificación empírica.
- El modelo acepta imágenes, pero no se detallan resoluciones máximas, número de tokens visuales ni calidad del pipeline visual tras el merge.
- Aunque la licencia es Apache 2.0, los modelos base y contribuyentes pueden tener condiciones adicionales; conviene revisar sus fichas antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Los tags mencionan modelos de profesor con nombres no verificables públicamente; la procedencia de los datos de destilación no es auditable con la información disponible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Perfil del autor: https://huggingface.co/xtools-at
- Cuantizaciones y GGUF derivados: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Contribuyente nerkyor: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Contribuyente TeichAI: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Contribuyente Jackrong: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset público citado: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset público citado: https://huggingface.co/datasets/armand0e/Fable-5-Chat
