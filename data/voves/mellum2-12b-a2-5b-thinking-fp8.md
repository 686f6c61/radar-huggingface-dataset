# voves/Mellum2-12B-A2.5B-Thinking-FP8

## Resumen

Mellum2-12B-A2.5B-Thinking-FP8 es una versión cuantizada en FP8 del modelo de razonamiento para código Mellum2-12B-A2.5B-Thinking, desarrollado por JetBrains y publicado en Hugging Face por el usuario voves. El modelo original emplea una arquitectura de mezcla de expertos (MoE) con 64 expertos, de los cuales se activan 8 por token, lo que resulta en 12.000 millones de parámetros totales pero solo 2.500 millones de parámetros activos por inferencia. Esta versión FP8, comprimida con la librería compressed-tensors, reduce el peso de los pesos a 12,6 GB manteniendo una fidelidad casi idéntica al original en BF16, según el informe de evaluación del autor.

El modelo está diseñado para emisión explícita de cadenas de razonamiento antes de generar la respuesta final, lo que lo hace especialmente adecuado para tareas de depuración, planificación y programación agéntica. Con una ventana de contexto de 131.072 tokens y soporte para 64 expertos, combina capas de atención con ventana deslizante y atención completa. La cuantización FP8 permite servirlo en GPUs Hopper o Blackwell con mayor rendimiento y menor huella de memoria, sin degradación medible en tareas de completado de código, tal como documenta el autor en su comparativa BF16 frente a FP8.

La relevancia de este modelo radica en su doble naturaleza: por un lado, un MoE de código abierto con licencia Apache-2.0 y razonamiento explícito, y por otro, una versión cuantizada que demuestra que la compresión FP8 puede ser prácticamente sin pérdidas para cargas de trabajo de completado de código, un resultado útil para equipos que despliegan LLMs en producción con restricciones de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 64 expertos, 8 activos por token; capas de atención con ventana deslizante y atención completa |
| Parametros totales | 12.149.923.072 (12B) |
| Parametros activos | 2.500.000.000 (2,5B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (pesos comprimidos con compressed-tensors); el modelo base está disponible en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8 comprimido) |

## Arquitectura y entrenamiento

El modelo base Mellum2-12B-A2.5B-Thinking es un transformador de mezcla de expertos con 64 expertos y activación de 8 expertos por token, lo que da un total de 12B parámetros pero solo 2,5B activos en cada paso de inferencia. Combina capas de atención con ventana deslizante y capas de atención completa, una configuración que equilibra eficiencia computacional y capacidad de modelado de dependencias de largo alcance. La ventana de contexto alcanza 131.072 tokens, suficiente para archivos de código extensos o repositorios completos.

El modelo se produce a partir de Mellum2-12B-A2.5B-Base mediante supervisión fina y un post-entrenamiento orientado a razonamiento, que le permite emitir cadenas de pensamiento explícitas antes de dar la respuesta final. Esta capacidad de razonamiento es clave para tareas como depuración, planificación de cambios y programación agéntica. La versión FP8 aquí descrita es una cuantización de los pesos del modelo Thinking, realizada con compressed-tensors, que reduce el tamaño del repositorio a 12,6 GB. El autor evaluó la fidelidad de la cuantización comparando BF16 y FP8 en cuatro conjuntos de pruebas: divergencia de distribuciones de siguiente token, perplejidad en documentos largos, Pass@1 en tareas de código y comparación de generaciones greedy. Los resultados muestran una concordancia del 95,5 % en el token de mayor probabilidad, una divergencia KL media de 0,037 y una variación de perplejidad relativa de solo +0,14 %, lo que indica que la cuantización es prácticamente sin pérdidas.

## Capacidades

- Generación de código con razonamiento explícito: el modelo emite cadenas de pensamiento antes de la respuesta final, útil para depuración, planificación y explicación de soluciones.
- Completado de código en Python y otros lenguajes: optimizado para continuaciones de funciones, clases y módulos, con soporte para contextos largos de hasta 131.072 tokens.
- Razonamiento matemático y lógico: según datos de la comunidad, alcanza 58,4 en AIME, lo que indica competencia en problemas de razonamiento complejo.
- Programación agéntica: el modelo puede integrarse en flujos donde un agente planifica y ejecuta cambios de código de forma autónoma, gracias a su modo de razonamiento.
- Soporte de tool calling: no se especifica explícitamente en la documentación disponible, pero su naturaleza agéntica sugiere compatibilidad con llamadas a funciones; este dato no está confirmado.
- Multilingüismo limitado: la ficha oficial indica únicamente inglés, aunque el código fuente puede estar en cualquier lenguaje de programación.

## Casos de uso

- Completado de código en IDE: el modelo puede integrarse en editores como JetBrains o VS Code para sugerir continuaciones de funciones, clases y bloques completos. Su ventana de 131.072 tokens permite considerar archivos enteros o repositorios pequeños, y la cuantización FP8 reduce la latencia en GPUs de gama media.
- Depuración asistida: gracias a su modo de razonamiento explícito, el modelo puede analizar un stack trace o un fragmento de código defectuoso, emitir una cadena de pensamiento sobre las posibles causas y proponer una corrección. Esto es útil en entornos de desarrollo donde el coste de un fallo es alto.
- Agentes de programación autónomos: el modelo puede actuar como cerebro de un agente que planifica cambios, escribe código, ejecuta pruebas y ajusta su enfoque. Su capacidad de razonamiento y su contexto largo permiten mantener el estado de una sesión de desarrollo prolongada.
- Generación de tests unitarios: dado su rendimiento en tareas de código (Pass@1 de 78/78 en 15 tareas con 80 tests), el modelo puede generar casos de prueba a partir de firmas de funciones y docstrings, acelerando el desarrollo guiado por pruebas.
- Refactorización de código legacy: el modelo puede analizar módulos extensos y proponer refactorizaciones manteniendo el comportamiento, gracias a su contexto de 131K tokens que abarca archivos completos.
- Asistente de razonamiento matemático y lógico: con una puntuación de 58,4 en AIME, el modelo puede resolver problemas de matemáticas y lógica, útil en entornos educativos o de investigación donde se necesita explicar el proceso de resolución.
- Servicio de inferencia en producción con FP8: la versión cuantizada permite desplegar el modelo en GPUs con memoria limitada, como una RTX 4090 (24 GB) o un L4 (24 GB), manteniendo una calidad de salida casi idéntica al BF16, como demuestra el informe del autor.

## Benchmarks y rendimiento

El autor de la versión FP8 publicó un informe de evaluación comparando BF16 y FP8 en cuatro suites (134 prompts y 80 tests funcionales). Los resultados clave son:

| Metrica | Valor | Interpretacion |
|---|---|---|
| Acuerdo top-1 | 95,5 % | BF16 y FP8 eligen el mismo siguiente token en 64 de 67 prompts |
| KL media (BF16 ‖ FP8) | 0,037 | Divergencia muy pequeña |
| Divergencia Jensen-Shannon media | 0,0058 | Distribuciones prácticamente idénticas |
| Cambio relativo de perplejidad | +0,14 % | Dentro del ruido de muestreo |
| Generaciones greedy byte-idénticas | 81,8 % | En 33 prompts |
| Solapamiento a nivel de token | 98,7 % | De las continuaciones generadas |
| Pass@1 (15 tareas de código, 80 tests) | 78/78 | Ambos modelos, sin discrepancias |

En cuanto al rendimiento absoluto del modelo base, datos de la comunidad (vLLM Recipes) indican una puntuación de 69,9 en LiveCodeBench v6 y 58,4 en AIME. Estos datos provienen de fuentes externas y no están incluidos en la model card del autor de la versión FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 12,6 GB. Con overhead de KV cache para contexto largo, se recomienda al menos 20 GB de VRAM para uso con ventanas de contexto medias (8K-32K tokens). Para la ventana completa de 131K tokens, la KV cache puede superar los 20 GB adicionales, por lo que se necesitarían GPUs con 40 GB o más.
- GPUs recomendadas: para FP8 con soporte nativo, GPUs Hopper (H100, H200) o Blackwell (B200) ofrecen el mejor rendimiento. En GPUs consumer, una RTX 4090 (24 GB) o RTX 5090 (32 GB) pueden ejecutar el modelo con contextos moderados. Para contextos largos completos, se recomienda una A100 de 40 GB o 80 GB.
- Compatibilidad con GPUs consumer: sí, cabe en RTX 4090 con cuantización FP8 y contexto moderado (hasta ~32K tokens). Para la ventana completa de 131K tokens, se necesita una GPU con al menos 40 GB.
- Opciones de despliegue: vLLM (compatible con FP8 y compressed-tensors), TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa). El autor usó un servidor compatible con OpenAI para sus pruebas.
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput para esta versión FP8. La cuantización FP8 en GPUs Hopper/Blackwell suele ofrecer un aumento de throughput del 30-50 % frente a BF16, pero estos valores no están confirmados para este modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de código MoE en la información proporcionada. Como referencia cualitativa, se pueden considerar alternativas de la misma categoría:

| Modelo | Parametros totales | Parametros activos | Contexto | Razonamiento | Licencia |
|---|---|---|---|---|---|
| Mellum2-12B-A2.5B-Thinking (FP8) | 12B | 2,5B | 131K | Sí (cadena de pensamiento) | Apache-2.0 |
| DeepSeek-Coder-V2-Lite | 16B | 2,4B | 128K | No | MIT |
| Qwen2.5-Coder-7B | 7B | 7B | 131K | No | Apache-2.0 |

Los datos de la tabla anterior son aproximados y provienen de conocimiento general del sector; no se han verificado contra fuentes en la información proporcionada. Para una comparativa rigurosa, se recomienda consultar los benchmarks publicados por cada proyecto.

## Limitaciones y advertencias

- Idioma limitado: la ficha oficial indica únicamente inglés. El modelo puede no funcionar bien en prompts o documentación en otros idiomas.
- Riesgo de alucinación en código: como todo modelo de generación, puede producir código sintácticamente válido pero semánticamente incorrecto, especialmente en APIs poco comunes o versiones recientes de librerías.
- Sesgos en datos de entrenamiento: no se han publicado detalles sobre la composición del dataset de entrenamiento, por lo que no se puede evaluar el sesgo en lenguajes de programación, dominios o estilos de código.
- Cuantización FP8 en hardware sin soporte nativo: en GPUs sin aceleración FP8 (por ejemplo, RTX 30 series), la cuantización puede requerir emulación y resultar en menor rendimiento o mayor latencia.
- Contexto largo y memoria: la ventana de 131K tokens puede provocar un uso elevado de VRAM en la KV cache. En GPUs consumer, puede ser necesario reducir la ventana de contexto o usar técnicas de compresión de KV cache.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de la licencia del modelo base JetBrains/Mellum2-12B-A2.5B-Thinking por si hubiera cláusulas adicionales.
- Sin garantía de soporte: el modelo es publicado por un usuario independiente (voves), no por JetBrains. No hay canal oficial de soporte ni actualizaciones garantizadas.

## Enlaces

- Repositorio Hugging Face de la versión FP8: https://huggingface.co/voves/Mellum2-12B-A2.5B-Thinking-FP8
- Colección Mellum2 de voves: https://huggingface.co/collections/voves/mellum2
- Modelo base en Hugging Face: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/JetBrains/Mellum2-12B-A2.5B-Thinking
- Recetas vLLM para el modelo: https://recipes.vllm.ai/JetBrains/Mellum2-12B-A2.5B-Thinking
- Resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mellum2-12b-a2.5b-thinking-jetbrains
