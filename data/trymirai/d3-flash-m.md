# trymirai/d3-flash-M

## Resumen

d3-flash-M es una versión cuantizada a 4 bits del modelo d3-flash, publicada por trymirai (Mirai Labs) bajo licencia Apache 2.0. No es un modelo generativo al uso: es un modelo de decisión (decision model) que devuelve probabilidades sobre un conjunto ordenado de opciones, respuestas sí/no o niveles de puntuación. Su propósito es resolver tareas de clasificación zero-shot, enrutamiento semántico y selección de herramientas dentro de pipelines de agentes, donde se necesita una respuesta categórica calibrada en lugar de texto libre.

El checkpoint parte del modelo base vllm-sr/d3-flash y aplica cuantización post-entrenamiento INT4 asimétrica con grupos de 64, escalas en BF16 y transformadas de Hadamard aleatorias (RHT32) para tratar valores atípicos, junto con el método YAQA. El resultado conserva una precisión del 95,45 % sobre 5.500 decisiones de texto de CLINC150+OOS, solo 0,38 puntos porcentuales por debajo del profesor sin cuantizar, lo que lo hace relevante para despliegue local con requisitos de memoria reducidos.

El modelo tiene 4.158.126.080 parámetros, un repositorio de 12,9 GB y una cabeza de decisión de 255 códigos sobre un espacio oculto de 4096 dimensiones. La arquitectura subyacente, según la documentación del autor, combina 8 capas de atención completa no causal con 24 capas Gated DeltaNet causales, lo que lo sitúa en la familia de modelos híbridos transformer-SSM. No se han publicado datos sobre longitud de contexto ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 8 capas de atención completa no causal + 24 capas Gated DeltaNet causales (según documentación del autor) |
| Parámetros totales | 4.158.126.080 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 asimétrica, grupo 64, escalas BF16, zero points empaquetados en 4 bits; RHT32; YAQA post-entrenamiento; cabeza de decisión en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único model.safetensors con backbone INT4 G64 y readout FP32) |

## Arquitectura y entrenamiento

El modelo es un checkpoint cuantizado, no un modelo entrenado desde cero. El backbone de texto se cuantiza a INT4 asimétrico con tamaño de grupo 64, escalas BF16 y zero points empaquetados. Los valores atípicos se tratan con transformadas de Hadamard aleatorias por bloques de tamaño 32 (RHT32). Las matrices del transformer usan YAQA como método de cuantización post-entrenamiento, mientras que el embedding de entrada y la cabeza de decisión se cuantizan con round-to-nearest. La calibración empleó 3.072 decisiones de texto balanceadas en 12 conjuntos públicos del Decision Index, cubriendo razonamiento, inferencia de lenguaje natural, clasificación de intención, recuperación, selección de herramientas y humor. Los objetivos de Fisher se muestrearon del profesor congelado sin cuantizar a temperatura 1, con una salida de decisión enmascarada por petición y gradientes a través de todo el contexto de entrada.

La cabeza de decisión es una matriz FP32 de 255 × 4096 almacenada en `decoder.embedding.output_embedding.weights` con anotación `FullPrecisionSpec`; materializa los pesos efectivos de RTN, incluida su cuantización y transformada de Hadamard. El `config.json` usa un `DecisionModelConfig` con un objeto `decision` que contiene los 255 códigos ordenados de respuesta y la temperatura de softmax (1,0). En tiempo de inferencia se realiza un prefill de contexto completo por pregunta, se aplica el readout FP32 al estado oculto final tras la normalización RMS en la última posición real del prompt, se enmascaran las opciones no usadas y se aplica softmax a temperatura 1. Las 8 capas de atención completa permanecen no causales; las 24 capas Gated DeltaNet permanecen causales. No hubo entrenamiento de pesos ni destilación con conciencia de cuantización.

## Capacidades

- Clasificación zero-shot con opciones: devuelve la opción de mayor probabilidad entre hasta 255 criterios ordenados.
- Preguntas de sí/no (`noul`): devuelve la probabilidad de verdadero, con descripciones opcionales para cada valor.
- Puntuación (`score`): devuelve el índice de nivel esperado sobre 2 a 10 niveles ordenados.
- Entrada de estado flexible: acepta texto plano o JSON como `state`.
- Instrucciones personalizadas: permite sustituir el texto de pregunta por defecto mediante `instructions`.
- Enrutamiento semántico y selección de herramientas dentro de pipelines de agentes.
- Integración con Uzu: despacho por `type: "DecisionModelConfig"`, reutilización de cargadores de capas Qwen3.5 y matriz M, lectura directa de `tokenizer.json` y paso de la petición estructurada a MiniJinja.
- Modelo solo texto (text-only); no se documentan capacidades multimodales en este checkpoint.
- No se documenta soporte de tool calling generativo, agentes multi-paso ni modo de razonamiento explícito; la salida es una distribución de probabilidad, no texto.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: dado un mensaje de usuario como `state`, el modelo devuelve la probabilidad de cada intención predefinida (cancelar, soporte, facturación) en una sola pasada, lo que permite derivar la conversación al flujo correcto sin generar texto.
- Selección de herramientas en agentes: con un catálogo de herramientas como criterios de una pregunta `choice`, el modelo elige la herramienta más probable antes de invocar un LLM generativo, reduciendo coste y latencia en el bucle del agente.
- Filtrado de seguridad y moderación: una pregunta `noul` con descripciones permite obtener la probabilidad de que un contenido sea tóxico o inseguro, con umbral ajustable en producción.
- Puntuación de relevancia en recuperación (RAG): la pregunta `score` con niveles ordenados devuelve el nivel esperado de relevancia de un documento respecto a una consulta, útil para reordenar resultados antes de pasarlos al generador.
- Clasificación de tickets y correos entrantes: el modelo asigna categorías a texto o JSON estructurado con una ventana de contexto completa por petición, adecuado para colas de soporte con taxonomías de hasta 255 categorías.
- Inferencia de lenguaje natural para validación de datos: comprobar si una premisa implica una hipótesis en pipelines de limpieza o enriquecimiento de datos, devolviendo probabilidad de verdadero/falso.
- Enrutamiento local en Apple Silicon: al estar cuantizado a INT4 y orientado a despliegue local, encaja en aplicaciones de escritorio o edge que necesitan decisiones rápidas sin enviar datos a la nube.

## Benchmarks y rendimiento

Evaluación sobre 5.500 decisiones de texto de CLINC150+OOS, retenidas por completo de la calibración, con las mismas peticiones y máscaras de opciones a temperatura 1:

| Checkpoint | Accuracy ↑ | Macro F1 ↑ | Teacher KL ↓ |
|---|---:|---:|---:|
| d3-flash sin cuantizar (profesor) | 95,84 % | 96,43 % | 0,00000 |
| INT4 G64 · RTN | 93,40 % | 93,82 % | 0,07883 |
| d3-flash-M · YAQA | 95,45 % | 96,13 % | 0,00938 |

YAQA reduce el KL medio respecto al profesor en 8,4 veces en comparación con RTN. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,9 GB con pesos INT4 G64 y cabeza FP32; se puede esperar un uso de memoria en el rango de 6-10 GB para el backbone cuantizado más el readout FP32 de 255 × 4096, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs de consumo con 12-16 GB de VRAM o más, pero no se confirma compatibilidad.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más, sin confirmación oficial.
- Opciones de despliegue: el autor valida la inferencia cuantizada con `clean_quant` (`DecisionModel.load`); para integración en Uzu se reutilizan cargadores de capas Qwen3.5 y MiniJinja. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. El autor indica que cada pregunta requiere su propio prefill de contexto completo, lo que condiciona el coste por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Precisión CLINC150+OOS |
|---|---:|---|---|---|---:|
| d3-flash-M (este) | 4,16 B | no disponible | INT4 G64 + YAQA | Apache 2.0 | 95,45 % |
| d3-flash (profesor) | no disponible | no disponible | sin cuantizar | Apache 2.0 | 95,84 % |
| d3-flash INT4 G64 RTN | no disponible | no disponible | INT4 G64 RTN | Apache 2.0 | 93,40 % |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones de probabilidad sobre opciones, sí/no o niveles de puntuación.
- La cabeza de decisión está limitada a 255 códigos ordenados; taxonomías mayores requieren trocear la pregunta.
- Cada pregunta necesita un prefill de contexto completo, lo que limita el throughput en comparación con modelos que reutilizan caché entre consultas.
- El orden de las opciones es significativo y debe preservarse; alterarlo puede cambiar el resultado.
- La temperatura de softmax está fijada a 1,0 en la configuración; modificarla altera la calibración.
- La evaluación publicada se limita a CLINC150+OOS; no hay datos de robustez en dominios distintos ni en otros idiomas.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al ser un clasificador, el riesgo principal es una calibración deficiente fuera de la distribución de calibración.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia del modelo base vllm-sr/d3-flash.
- La documentación del autor menciona capas Qwen3.5 y Gated DeltaNet; conviene verificar la arquitectura real antes de integrarla en producción.
- El checkpoint se publicó en octubre de 2026 y tiene 43 descargas y 0 likes, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/d3-flash-M
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Licencia del modelo base: https://huggingface.co/vllm-sr/d3-flash/blob/13dc1cc8ef23caefa765907e1d764751e5629f7d/LICENSE
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Sitio de Mirai Labs: https://trymirai.com
