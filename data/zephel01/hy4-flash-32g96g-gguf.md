# zephel01/Hy4-flash-32G96G-GGUF

## Resumen

Hy4-flash-32G96G-GGUF es una cuantización GGUF del modelo tencent/Hy4-flash, publicada por el usuario zephel01. Se trata de un modelo de arquitectura MoE (mezcla de expertos) de gran tamaño —218.938.353.741 parámetros totales según los safetensors del modelo base— del que esta versión conserva únicamente la parte de texto: ni el codificador de visión ni el drafter DFly2 están incluidos. El artefacto está dimensionado específicamente para ejecutarse en una GPU de 32 GB combinada con 96 GB de RAM de sistema, y está optimizado para respuestas largas en japonés.

La relevancia de esta ficha radica en que demuestra una estrategia de cuantización selectiva por capas: en lugar de aplicar un único tipo de cuantización a todos los expertos, las 18 capas MoE más sensibles al texto japonés reciben expertos en Q3_K con imatrix, mientras que el resto se comprime a IQ2_XXS. La tabla Engram (per_layer_token_embd, 63.400 millones de parámetros) se conserva en IQ4_NL y las partes críticas (atención, expertos compartidos, capa densa y salida) en Q8_0. El resultado es un archivo de 92,9 GB que mantiene todos los expertos del modelo original.

El modelo está marcado como BETA por el propio autor, que lo ha validado en una única máquina con el motor Abyss v1.3.199. La licencia es la Tencent Hy License, no una licencia open source estándar, lo que condiciona su uso comercial. La información disponible sobre idiomas soportados, contexto y benchmarks formales es escasa o inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con tabla Engram; transformer con capas MoE y una capa densa |
| Parametros totales | 218.938.353.741 (modelo base); tabla Engram de 63.400 millones de parámetros |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K (imatrix) en expertos enrutados de capas 21, 22, 24 y 27-41; IQ2_XXS (imatrix) en expertos del resto de capas; IQ4_NL en tabla Engram; Q8_0 en atención, expertos compartidos, capa densa y salida; F32 en normas y tensores pequeños |
| Idiomas soportados | no disponible oficialmente; el autor indica ajuste específico para japonés y menciona evaluaciones en inglés, chino y código |
| Licencia | tencent-hy-license (Tencent Hy License), enlazada en el repo del modelo base |
| Formato de pesos | GGUF dividido en dos partes (00001-of-00002 y 00002-of-00002), 92,9 GB en total; incluye archivo imatrix propio (Hy4-flash-own.imatrix.gguf) y SHA256SUMS |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash es un transformer con arquitectura MoE que incorpora una tabla Engram (per_layer_token_embd) de 63.400 millones de parámetros, además de capas con expertos enrutados, expertos compartidos y una capa densa. El tamaño total de 218.938.353.741 parámetros lo sitúa en la categoría de modelos masivos con activación dispersa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta publicación no está en el modelo base sino en el proceso de cuantización. El autor generó una importance matrix a partir de las propias respuestas del modelo: 189 prompts (114 en japonés, 25 en inglés, 30 de código, 8 en chino y 12 de matemáticas) más un texto mixto, sumando 434.000 tokens, sin incluir las preguntas de evaluación. La selección de las 18 capas con expertos en Q3_K se basó en el router: son aquellas cuya elección de expertos difiere más entre japonés, inglés y código. La conversión se realizó con llama.cpp (commit ac8e1694d) y el parche de conversión Hy4 de trench-gguf; la re-cuantización final se hizo en GPU con trench-gguf v0.5.0 (tools/requant_experts.py), con tensores byte-idénticos a los que produce llama-quantize.

## Capacidades

- Generación de texto conversacional en formato multi-turno (pipeline text-generation, etiqueta conversational).
- Respuestas largas y explicativas, con especial énfasis en japonés según el ajuste del autor.
- Razonamiento y explicación de hechos en historia, geografía, literatura y ciencia (evaluado por el autor con preguntas de 3-6 hechos).
- Generación de código (evaluado en la matriz de importancia y en la divergencia KL sobre texto de código).
- Capacidades matemáticas (prompts de matemáticas incluidos en la importance matrix).
- Soporte multilingüe parcial: japonés, inglés, chino y código, con japonés como idioma prioritario.
- Tool calling: mencionado en la composición del texto mixto usado para la imatrix, aunque no se detalla su soporte formal.
- No incluye capacidades de visión: el codificador visual del modelo base fue excluido de esta cuantización.
- No incluye decodificación especulativa: el drafter DFly2 no está incluido.

## Casos de uso

- Generación de contenido largo en japonés: el modelo está ajustado para respuestas extensas con múltiples hechos, adecuado para artículos, explicaciones divulgativas o documentación técnica en japonés, gracias a la asignación de 3 bits a las capas MoE más relevantes para ese idioma.
- Asistente conversacional multi-turno: la etiqueta conversational y el pipeline text-generation permiten integrarlo en chats, aunque la ventana de contexto no está documentada y debe verificarse antes de desplegarlo en producción.
- Generación de código asistida: la evaluación de divergencia KL sobre código (0,207) es la más baja de las medidas, lo que sugiere que la cuantización preserva relativamente bien el comportamiento en código; útil para autocompletado o explicación de fragmentos.
- Investigación sobre cuantización selectiva: el artefacto sirve como caso de estudio reproducible de cuantización por capas guiada por router e imatrix, con script de llama-quantize documentado.
- Despliegue en estaciones de trabajo con GPU de 32 GB: pensado para equipos con una RTX 5090 y 96 GB de RAM, donde el modelo cabe repartiendo expertos entre VRAM y CPU.
- Evaluación comparativa de fidelidad de cuantizaciones: el autor publica divergencias KL frente a los pesos BF16, lo que permite comparar esta cuantización con conversiones Q8_0 en distintas lenguas.
- Procesamiento de texto en inglés y chino: aunque el ajuste es japonés, la matriz de importancia incluye prompts en inglés y chino, por lo que puede usarse en esos idiomas con menor garantía de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas propias de calidad y fidelidad:

| Metrica | Resultado |
|---|---|
| Explicaciones largas en japonés con todos los hechos correctos (3-6 hechos) | 44 de 60 respuestas |
| Preguntas japonesas no usadas en el ajuste, todos los hechos correctos | 49 de 60 respuestas |
| Divergencia KL vs BF16, texto mixto de 457 tokens | 0,567 |
| Divergencia KL vs BF16, 1K tokens de japonés | 0,508 |
| Divergencia KL vs BF16, 1K tokens de inglés | 0,744 |
| Divergencia KL vs BF16, 1K tokens de código | 0,207 |
| Divergencia KL de referencia Q8_0 (mixto / japonés / inglés / código) | 0,121 / 0,108 / 0,040 / 0,030 |
| Decodificación en RTX 5090 + Ryzen AI Max+ 395 (16 hilos) | 52,2 tok/s (mediana de 3: 52,4 / 52,2 / 51,2) |
| Expertos encontrados en VRAM | 79-83% |

## Requisitos de hardware

- VRAM estimada: 32 GB de GPU como mínimo para el reparto previsto; el resto de expertos se computa en CPU.
- RAM de sistema: 96 GB recomendados por el autor (probado con un tier de 60 GB de RAM en su máquina).
- GPU recomendadas: RTX 5090 (32 GB) es la probada por el autor; cualquier GPU con 32 GB o más podría funcionar, aunque no hay datos de otras.
- CPU: Ryzen AI Max+ 395 con 16 hilos en la prueba del autor, con memoria LPDDR5X rápida; en equipos de sobremesa con DDR5 de doble canal se espera menor rendimiento en los expertos calculados en CPU.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) con reparto a RAM; no cabe íntegramente en GPUs de 24 GB o menos sin mayor descarga a CPU.
- Opciones de despliegue: Abyss v1.3.199 o superior (recomendado, con tools/iq_pack.py y configuración Hy4-flash de docs/MODELS); llama.cpp requiere soporte para Hy4-flash, que no estaba en upstream en el momento de la publicación (se usó el parche de trench-gguf). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 52,2 tok/s de decodificación en la configuración probada; los prompts y contextos largos se procesan según docs/MODELS de Abyss. No hay datos de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy4-flash-32G96G-GGUF (este) | 218.938.353.741 | no disponible | Tencent Hy License | GGUF en HF, 147 descargas | Cuantización selectiva por capas, solo texto |
| tencent/Hy4-flash (base) | 218.938.353.741 | no disponible | Tencent Hy License | Pesos BF16 en HF | Incluye visión y drafter DFly2 |
| Conversión Q8_0 del base | 218.938.353.741 | no disponible | Tencent Hy License | No publicada en esta información | Referencia de fidelidad KL en la model card |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Estado BETA: validado en una sola máquina y con una sola versión del motor (Abyss v1.3.199); el autor solicita reportes de otras configuraciones.
- Errores factuales conocidos heredados del modelo base: puede nombrar el lago más profundo de Japón incorrectamente (Towada en lugar de Tazawa) en respuestas largas, confundir el tercero de los "tres grandes ensayos japoneses" o sus épocas, y dar Osaka como la prefectura más pequeña (es Kagawa).
- Mezcla de idiomas: en aproximadamente 1 de cada 4 respuestas largas en japonés aparece una palabra en inglés dentro de una frase.
- Errores adicionales atribuidos a la cuantización: puede listar Ukiyoburo como uno de los tres grandes ensayos y rara vez acierta la lectura "634 = mu-sa-shi" de la altura de la Tokyo Skytree.
- Bucles de reformulación: en temas que no domina puede repetir la misma frase durante un tiempo (no reproducido en 56 ejecuciones posteriores).
- Fidelidad limitada: la divergencia KL es notablemente superior a una conversión Q8_0, especialmente en inglés (0,744 frente a 0,040); el autor recomienda verificar nombres, años y números antes de confiar en ellos.
- Cobertura desigual: el inglés está menos verificado que el japonés.
- Licencia restrictiva: Tencent Hy License, no open source estándar; deben revisarse las condiciones para uso comercial.
- Sin visión ni decodificación especulativa: el codificador visual y el drafter DFly2 no están incluidos.
- Compatibilidad de motores limitada: requiere Abyss v1.3.199+ o un llama.cpp con soporte Hy4-flash (no en upstream al publicarse).
- Contexto no documentado: no se especifica la longitud máxima de contexto soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephel01/Hy4-flash-32G96G-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Incidencias de Abyss: https://github.com/zephel01/Abyss/issues
- Documentación de modelos de Abyss: https://github.com/zephel01/Abyss/blob/main/docs/MODELS.md
- Repositorio trench-gguf: https://github.com/zephel01/trench-gguf
