# Susant-Achary/LFM2.5-8B-A1B-UltraCoder-L3-GGUF

## Resumen

LFM2.5-8B-A1B-UltraCoder-L3 es un derivado experimental especializado en código del modelo LFM2.5-8B-A1B de LiquidAI, publicado por el usuario Susant-Achary en Hugging Face. Se trata de un modelo de lenguaje causal con arquitectura de mezcla de expertos dispersa (sparse Mixture-of-Experts, MoE) que conserva la estructura del modelo base y redistribuye su comportamiento hacia la programación en Python, la resolución de problemas algorítmicos y la asistencia a desarrolladores. El modelo declara aproximadamente 8,3B de parámetros totales con unos 1,5B de parámetros activos por token, 24 capas y 32 expertos de los cuales se activan 4 por token.

La adaptación se realizó en dos etapas con un total aproximado de 55,30 millones de tokens de entrada: primero un preentrenamiento continuado (CPT) sobre código Python de alta calidad procedente del dataset openbmb/UltraData-Code, y después un ajuste supervisado (SFT) sobre tareas de programación que incluyen enunciados de problemas, razonamiento/análisis y soluciones. El resultado declarado es una mejora sustancial en los benchmarks EvalPlus en comparación con el modelo base cuantizado de la misma forma, con incrementos de hasta +17,07 puntos porcentuales en HumanEval.

Su relevancia actual es doble. Por un lado, demuestra que la especialización de un MoE ya entrenado mediante CPT y SFT sobre un volumen relativamente pequeño de tokens puede producir ganancias grandes en una tarea concreta. Por otro, se distribuye en formato GGUF con una variante Q4_K_M de aproximadamente 5,2 GB, lo que lo sitúa en el rango de la inferencia local en GPU de consumo. El repositorio es de creación reciente, con 0 descargas y 1 like en el momento de redactar esta ficha, y la model card advierte explícitamente de su carácter experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos dispersa (sparse MoE) |
| Parámetros totales | 8.467.856.832 (8,47B) según safetensors; la model card indica ~8,3B |
| Parámetros activos | ~1,5B por token (la familia base se denomina A1B) |
| Longitud de contexto | 8.192 tokens en este derivado; capacidad upstream de 131.072 tokens |
| Tipos de cuantización | Q4_K_M (variante publicada); compatible con runtimes llama.cpp, que admiten otros niveles GGUF |
| Idiomas soportados | no disponible |
| Licencia | other (sin términos concretos especificados en la model card) |
| Formato de pesos | GGUF (repositorio -GGUF); la model card menciona también compatibilidad con el formato Transformers de Hugging Face |
| Número de capas | 24 |
| Número de expertos | 32, con 4 activados por token |
| Tamaño del repositorio | 5,2 GB |
| Etapa de entrenamiento | Preentrenamiento continuado (L2 CPT) y ajuste supervisado (L3 SFT) |
| Dataset de entrenamiento | openbmb/UltraData-Code (código Python) y tareas de programación para SFT |
| Tokens de entrada usados en la adaptación | ~55,30 millones |
| Modelo base | LiquidAI/LFM2.5-8B-A1B |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM2.5 de LiquidAI, un transformer causal con capas de mezcla de expertos dispersa. La configuración declarada incluye 24 capas, 32 expertos y una activación de 4 expertos por token, lo que da lugar a un modelo de ~8,3B de parámetros totales pero con solo ~1,5B activos por token. Esta relación entre parámetros totales y activos es la que determina el perfil de despliegue: la memoria necesaria viene marcada por los parámetros totales, mientras que el coste computacional por token se aproxima al de un modelo denso mucho más pequeño.

El entrenamiento de adaptación se describe en dos fases. La primera (L2 CPT) consiste en un preentrenamiento continuado sobre código fuente Python de alta calidad extraído de openbmb/UltraData-Code, con el objetivo de desplazar la distribución del modelo hacia código idiomático y patrones de programación reales. La segunda (L3 SFT) es un ajuste supervisado sobre tareas de codificación que incluyen el enunciado del problema, un razonamiento o análisis intermedio y la solución final. El volumen total declarado es de aproximadamente 55,30 millones de tokens de entrada, una cifra modesta que sugiere una especialización quirúrgica más que un reentrenamiento profundo. No se especifican en la información disponible detalles sobre la composición exacta del dataset de SFT, el uso de RLHF o DPO, ni innovaciones arquitectónicas adicionales introducidas por este derivado.

## Capacidades

- Generación de código Python: es la capacidad central del modelo, reforzada mediante preentrenamiento continuado sobre código de UltraData-Code y ajuste supervisado sobre tareas de programación.
- Resolución de problemas algorítmicos: el SFT incluye ejemplos con razonamiento y análisis previo a la solución, lo que apunta a un comportamiento de "pensar antes de responder" en problemas de algoritmia.
- Asistencia a desarrolladores en formato conversacional: la etiqueta conversational y el pipeline text-generation indican uso en diálogo multi-turno orientado a tareas de código.
- Generación a partir de enunciado: los benchmarks HumanEval y MBPP miden exactamente la capacidad de producir funciones correctas a partir de una descripción en lenguaje natural y firmas de función.
- Formato de pesos GGUF: permite ejecución local con runtimes compatibles con llama.cpp, incluida la variante Q4_K_M publicada.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que puede servirse a través de infraestructura de inferencia estándar de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara lista de idiomas.
- Capacidades de visión o audio: no disponibles (el pipeline declarado es text-generation).
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistencia de programación en local: con la variante Q4_K_M de ~5,2 GB, el modelo puede ejecutarse en un portátil con GPU de gama media o en Apple Silicon, ofreciendo autocompletado de funciones y generación de fragmentos Python sin enviar código a servicios externos.
- Generación de funciones a partir de especificación: dado un docstring o un enunciado de problema con la firma de la función, el modelo produce una implementación candidata, tal como miden HumanEval (58,54%) y MBPP (61,38%) en la comparativa EvalPlus.
- Revisión y refactorización de código Python: el ajuste sobre código de UltraData-Code favorece la familiaridad con patrones idiomáticos, lo que resulta útil para proponer reescrituras y detectar construcciones poco eficientes.
- Apoyo en resolución de ejercicios algorítmicos: el entrenamiento incluye análisis intermedio, de modo que puede usarse como tutor que explica el razonamiento antes de dar la solución, útil en entornos educativos o de preparación de entrevistas técnicas.
- Integración en pipelines de CI/CD como asistente de revisión: con un contexto de 8.192 tokens cabe un diff de tamaño moderado junto con las instrucciones de revisión, lo que permite generar sugerencias automáticas en pull requests.
- Prototipado rápido de scripts de automatización: para tareas de procesamiento de datos, scraping o utilidades de sistema en Python, el modelo puede generar scripts funcionales en una sola pasada gracias a su especialización de dominio.
- Despliegue en entornos con restricciones de recursos: al activar solo ~1,5B de parámetros por token, el coste de cómputo por token es bajo en comparación con un modelo denso de 8B, lo que resulta adecuado para servidores modestos o inferencia en el borde.

## Benchmarks y rendimiento

Los resultados publicados corresponden a una comparación controlada en cuantización Q4_K_M frente al modelo base LFM2.5-8B-A1B en la misma cuantización, sobre el conjunto EvalPlus.

| Benchmark | UltraCoder Q4_K_M | Base LFM2.5 Q4_K_M | Delta (pp) | Ganancia relativa |
|---|---|---|---|---|
| HumanEval | 58,54% | 41,46% | +17,07 | +41,18% |
| HumanEval+ | 53,05% | 39,63% | +13,41 | +33,85% |
| MBPP | 61,38% | 53,44% | +7,94 | +14,85% |
| MBPP+ | 49,21% | 46,83% | +2,38 | +5,08% |

Notas sobre los datos: los porcentajes de HumanEval, HumanEval+, MBPP y MBPP+ proceden directamente de la tabla publicada en la model card. El delta y la ganancia relativa de MBPP+ no aparecen completos en el extracto disponible y se han calculado por diferencia aritmética sobre las dos columnas de porcentajes. No se han publicado en la información disponible resultados de MMLU, GSM8K, MATH ni de otras evaluaciones generales, ni comparaciones con modelos de terceros. Las métricas "con signo +" (HumanEval+, MBPP+) corresponden a las versiones ampliadas con tests adicionales de EvalPlus y son, por diseño, más estrictas que las originales.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas aritméticamente del número de parámetros (8.467.856.832) y del formato de pesos; no proceden de mediciones publicadas por el autor.

- Inferencia en Q4_K_M: aproximadamente 5,2 GB de pesos (coincide con el tamaño del repositorio). Con caché KV y overhead del runtime, el consumo típico se sitúa en el entorno de 6-7 GB para el contexto completo de 8.192 tokens.
- Inferencia en Q8_0: en torno a 9 GB de pesos, más caché KV, lo que requiere del orden de 10-11 GB.
- Inferencia en FP16/BF16: en torno a 17 GB de pesos, lo que exige GPU de 24 GB o más.
- GPU consumer compatibles: la variante Q4_K_M cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti/4080/4090, así como en equipos Apple Silicon con 16 GB o más de memoria unificada. En GPUs de 8 GB el margen es muy ajustado y puede requerir reducir la longitud de contexto.
- GPU de datacenter: A100 40/80 GB, H100 y L40S pueden ejecutar el modelo sin problemas, incluso en FP16, y ofrecen margen para lotes grandes.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) son la vía natural para los pesos GGUF; para los pesos en formato Transformers, vLLM y TGI son opciones habituales, si bien la compatibilidad concreta de vLLM con esta arquitectura MoE no está confirmada en la información disponible.
- Latencia y throughput: no disponibles. Al activar solo ~1,5B de parámetros por token, es esperable un throughput superior al de un modelo denso de 8B en la misma GPU, pero se trata de una inferencia cualitativa a partir de la arquitectura, no de una medición publicada.

## Comparativa con modelos similares

La información disponible solo permite una comparación directa con el modelo del que deriva. No se dispone de datos de benchmarks ni de especificaciones de terceros en el material proporcionado.

| Modelo | Parámetros | Activos por token | Contexto | HumanEval (Q4_K_M) | MBPP (Q4_K_M) | Licencia |
|---|---|---|---|---|---|---|
| LFM2.5-8B-A1B-UltraCoder-L3 | ~8,3B (8,47B según safetensors) | ~1,5B | 8.192 (upstream 131.072) | 58,54% | 61,38% | other |
| LiquidAI/LFM2.5-8B-A1B (base) | ~8,3B | ~1,5B | 131.072 (upstream) | 41,46% | 53,44% | no disponible en esta ficha |

Comparación con alternativas de terceros del mismo rango (por ejemplo, modelos de código densos de 7-8B): no disponible. La model card no incluye referencias a otros modelos y la búsqueda web realizada no ha devuelto documentación técnica relacionada. Cualquier comparación con modelos como las familias de código de otros proveedores requeriría ejecutar evaluaciones propias bajo condiciones homogéneas de cuantización y prompt.

## Limitaciones y advertencias

- Carácter experimental: la propia model card califica el modelo como derivado experimental. Con 0 descargas y 1 like en el momento de la consulta, no existe evidencia comunitaria de uso en producción.
- Alcance de dominio estrecho: la especialización se centra en Python. Es previsible un deterioro en tareas generales de lenguaje, conocimiento factual o generación en otros lenguajes de programación, aunque no se publican métricas que lo cuantifiquen.
- Contexto reducido respecto al base: este derivado declara 8.192 tokens de contexto, frente a los 131.072 tokens de capacidad upstream. Si se necesita contexto largo, hay que verificar si la ventana extendida sigue siendo funcional en esta variante.
- Riesgo de alucinación en código: como cualquier modelo generativo, puede producir APIs inexistentes, firmas de funciones incorrectas o dependencias inventadas. Los benchmarks HumanEval+ y MBPP+ (53,05% y 49,21%) muestran que una fracción relevante de las soluciones no supera los tests ampliados.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados. No hay garantía de un rendimiento adecuado en castellano, ni siquiera para explicaciones sobre código.
- Licencia ambigua: la licencia declarada es "other" sin detallar términos. Al ser un derivado de un modelo de LiquidAI, es imprescindible revisar las condiciones de la licencia del modelo base y del dataset openbmb/UltraData-Code antes de cualquier uso comercial.
- Datos de benchmarks limitados: solo se ofrecen resultados de EvalPlus en cuantización Q4_K_M y únicamente frente al modelo base. No hay MMLU, GSM8K ni evaluaciones multilingües, ni resultados en otras cuantizaciones.
- Información de entrenamiento incompleta: no se detalla la composición exacta del dataset de SFT, la existencia de filtrado, el uso de RLHF/DPO ni las hiperparametrizaciones, lo que dificulta reproducir o auditar la adaptación.
- Riesgo de sesgos del corpus fuente: al estar especializado sobre UltraData-Code y tareas de programación, puede heredar sesgos de estilo, convenciones y sesgos sociales presentes en ese corpus, sin que se haya documentado ningún proceso de mitigación.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Susant-Achary/LFM2.5-8B-A1B-UltraCoder-L3-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/openbmb/UltraData-Code
- Runtime recomendado para los pesos GGUF (llama.cpp): https://github.com/ggml-org/llama.cpp
- Suite de evaluación citada en la model card (EvalPlus): https://github.com/evalplus/evalplus

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre su familia base; los enlaces anteriores proceden de la información del repositorio y de las referencias técnicas citadas en la propia model card.
