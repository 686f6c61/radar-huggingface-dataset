# xquantize/climategpt-7b-4bit-mlx

## Resumen

ClimateGPT-7B-4bit-mlx es una cuantización en 4 bits del modelo ClimateGPT-7B, realizada por el usuario xquantize en formato MLX para ejecución local en Apple Silicon. El modelo original, desarrollado por Thulke et al. (Erasmus AI, AppTek y EQTY R&D), es un asistente conversacional especializado en el dominio del cambio climático, diseñado para sintetizar investigación interdisciplinaria sobre este tema. Se basa en Llama-2-7B, sobre el que se realizó un continuado pre-entrenamiento con una colección curada de documentos climáticos y un posterior ajuste fino con pares instrucción-completación elaborados en colaboración con científicos del clima.

Esta versión cuantizada permite ejecutar un modelo de 7B parámetros con un consumo de memoria de aproximadamente 4 GB y un rendimiento de unos 34 tokens por segundo en hardware de consumo de Apple, lo que lo hace accesible para investigadores y desarrolladores que necesiten un asistente climático local. El modelo mantiene una ventana de contexto de 4K tokens y está pensado para usarse con recuperación aumentada (RAG) para mejorar la factualidad de sus respuestas. No es un chatbot de propósito general, sino una herramienta especializada en ciencias de la Tierra y clima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7B) |
| Parametros totales | 7B (modelo base); el archivo cuantizado contiene 1.053.265.920 parámetros en 4 bits |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (4K) |
| Tipos de cuantizacion | 4 bits (MLX, 4.500 bits por peso) |
| Idiomas soportados | Inglés |
| Licencia | ClimateGPT Non-Commercial Community License (uso no comercial) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base ClimateGPT-7B parte de Llama-2-7B y se somete a un continuado pre-entrenamiento sobre una colección curada de documentos científicos y técnicos relacionados con el cambio climático, seguido de un ajuste fino con pares instrucción-completación generados en cooperación con científicos del clima. La arquitectura es un transformer causal estándar con atención completa, sin innovaciones estructurales destacables más allá de la especialización en el dominio climático. Los autores reportan que supera a Llama-2-70B-Chat en benchmarks específicos de clima, aunque no se proporcionan cifras concretas en la documentación disponible.

La versión cuantizada se obtuvo mediante `mlx_lm.convert` con cuantización de 4 bits (4.500 bits por peso) y precisión de carga en bfloat16, utilizando mlx-lm versión 0.31.3. Además, se corrigió un problema en el token de fin de secuencia: el modelo original usaba el token ChatML `<|im_end|>` (id 32006) pero la configuración de generación apuntaba al token `</s>` de Llama-2 (id 2), lo que provocaba que la generación no se detuviera correctamente. Esta versión establece `eos_token_id` a `[2, 32006]` para un corte limpio al final de cada turno.

## Capacidades

- Generación de texto especializada en cambio climático, ciencias de la Tierra y geociencias, con capacidad para sintetizar literatura interdisciplinaria.
- Conversación multi-turno mediante plantilla ChatML (`<|im_start|>` / `<|im_end|>`), diseñada para interacción tipo chat.
- Diseñado para uso con recuperación aumentada (RAG): el modelo está pensado para ser complementado con fuentes externas para ampliar su conocimiento y mejorar la precisión factual.
- Comprensión de conceptos climáticos avanzados, incluyendo terminología técnica y científica.
- Capacidad limitada de razonamiento general heredada de Llama-2-7B, pero con un sesgo claro hacia el dominio climático.
- No incluye capacidades de tool calling, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Síntesis de literatura científica: un investigador puede pedir al modelo un resumen de múltiples papers sobre un tema climático concreto, y el modelo generará una síntesis coherente aprovechando su entrenamiento en documentos especializados.
- Asistente de consulta para estudiantes y divulgadores: responder preguntas como "¿cuál es la diferencia entre tiempo y clima?" o "¿qué efectos tiene el aumento de temperatura en los océanos?" con explicaciones adaptadas al nivel solicitado.
- Análisis de informes de políticas climáticas: extraer puntos clave de documentos extensos (por ejemplo, informes del IPCC) y resumirlos en formato accesible, siempre que se use con RAG para alimentar el contexto.
- Generación de contenido divulgativo: redactar artículos, guiones o materiales educativos sobre cambio climático para audiencias no especializadas, manteniendo un tono riguroso.
- Apoyo a la redacción de propuestas de investigación: ayudar a estructurar secciones de antecedentes o justificación en propuestas científicas relacionadas con clima, con la precaución de verificar las citas.
- Chatbot temático en aplicaciones educativas: integrar el modelo en una aplicación web o móvil que responda preguntas frecuentes sobre clima, ejecutándose localmente en un Mac con MLX.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La documentación del modelo original menciona que ClimateGPT-7B supera a Llama-2-70B-Chat en benchmarks específicos de clima, pero no se ofrecen cifras concretas. Se recomienda consultar el paper original (arXiv:2401.09646) para obtener datos detallados de evaluación.

## Requisitos de hardware

- Memoria: aproximadamente 4,0 GB de pico de memoria durante la inferencia, gracias a la cuantización en 4 bits.
- Hardware: diseñado para Apple Silicon (M1, M2, M3 y posteriores) mediante el framework MLX; no requiere GPU dedicada externa.
- Rendimiento: ~34 tokens por segundo en un Mac con Apple Silicon (medición reportada por el autor de la cuantización).
- Despliegue: mediante la librería `mlx-lm` (Python) o la herramienta de línea de comandos `mlx_lm.generate`.
- Compatibilidad: no es compatible directamente con CUDA o ROCm; para GPUs NVIDIA se necesitaría una conversión a otro formato (por ejemplo, GGUF o GPTQ).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| ClimateGPT-7B (base) | 7B | 4K | Clima | No comercial | safetensors (original) |
| ClimateGPT-7B-4bit-mlx (este) | 7B | 4K | Clima | No comercial | safetensors (MLX 4-bit) |
| Llama-2-7B-Chat | 7B | 4K | General | Llama 2 Community License | Varios |
| Llama-2-70B-Chat | 70B | 4K | General | Llama 2 Community License | Varios |

La comparativa se centra en la especialización: ClimateGPT-7B está afinado específicamente para el dominio climático y, según sus autores, supera a Llama-2-70B-Chat en tareas climáticas, a pesar de tener 10 veces menos parámetros. Sin embargo, para tareas generales, Llama-2-7B-Chat ofrece un rendimiento más amplio. No se dispone de otros modelos climáticos comparables en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento desactualizado: al ser un modelo de 2024 basado en Llama-2-7B, su conocimiento general y su fluidez lingüística están por detrás de los modelos frontera actuales.
- Solo inglés: no soporta otros idiomas de forma nativa.
- Contexto limitado a 4K tokens, lo que restringe la cantidad de información que puede procesar en una sola consulta.
- Riesgo de alucinación y sesgos: como cualquier LLM, puede generar respuestas incorrectas o sesgadas; no debe usarse para decisiones científicas o de seguridad críticas sin verificación humana.
- Degradación por cuantización: la conversión a 4 bits puede introducir una ligera pérdida de calidad respecto al modelo en precisión completa.
- Licencia no comercial: el uso comercial está prohibido por la ClimateGPT Non-Commercial Community License, lo que limita su aplicación en productos empresariales.
- Dependencia de RAG: el modelo está diseñado para usarse con recuperación aumentada; sin ella, su conocimiento puede quedarse corto en temas muy específicos o recientes.
- Corrección del token EOS: aunque esta versión corrige el problema del token de fin de secuencia, es importante verificar que la plantilla de chat se aplique correctamente para evitar repeticiones.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/xquantize/climategpt-7b-4bit-mlx
- Modelo base ClimateGPT-7B: https://huggingface.co/eci-io/climategpt-7b
- Paper original (arXiv): https://arxiv.org/abs/2401.09646
- Proyecto ClimateGPT: https://eci.io
- Framework MLX: https://github.com/ml-explore/mlx
