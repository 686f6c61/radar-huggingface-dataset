# soyaakinohara/Spark-X2.5-4B-Heretic-jp-gguf

## Resumen

Spark-X2.5-4B-Heretic-jp-gguf es una colección de pesos en formato GGUF de un modelo de lenguaje de 4.100 millones de parámetros, desarrollado por el usuario soyaakinohara. Se trata de un derivado del modelo base XHToken/Spark-X2.5-4B, al que se ha aplicado un proceso de adaptación en cuatro etapas: atenuación de rechazos mediante la técnica Heretic, continuación del preentrenamiento en japonés, ajuste por instrucciones en japonés y reparación de llamadas a herramientas. El resultado es un modelo sin censura (refusal-removed) optimizado para el idioma japonés y con soporte de tool calling.

La arquitectura del modelo es Spark2_5, una arquitectura personalizada que no es compatible con el llama.cpp estándar y requiere un fork específico. El modelo declara una longitud de contexto de 1.048.576 tokens según sus metadatos. Se distribuye bajo licencia Apache-2.0 y está disponible en varias cuantizaciones, desde BF16 hasta Q4_K_M. Su relevancia radica en que ofrece una opción de modelo pequeño, con contexto muy largo y capacidades de razonamiento explícito, pensado para entornos que necesitan procesar texto japonés extenso y ejecutar herramientas de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5 |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Japones (ja) y multilingue |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura Spark2_5 no está documentada en la información disponible. Es una arquitectura propietaria que requiere un fork de llama.cpp mantenido por XHToken para poder ejecutarse; el llama.cpp estándar no la soporta. No se especifica si se trata de un transformer puro, un modelo híbrido o una variante con atención lineal, por lo que ese dato se considera no disponible.

El proceso de entrenamiento se realizó en BF16 con LoRA (r16) y una partición de capas en dos GPUs. Consta de cuatro etapas secuenciales:

1. Atenuación de rechazos con Heretic, reduciendo las respuestas de rechazo de 58 a 3 de cada 100, con una KL de 0,0118.
2. Continuación del preentrenamiento en japonés sobre 50.000 artículos de Wikipedia japonesa, con una pérdida de entrenamiento que pasó de 2,77 a 2,20.
3. Ajuste por instrucciones en japonés sobre 50.000 filas, con pérdida de entrenamiento de 2,59 a 1,50.
4. Reparación de llamadas a herramientas sobre 8.000 filas de tool use, con pérdida de entrenamiento de 1,48 a 0,57. Tras esta etapa, la coincidencia de nombres de función alcanzó el 96% en un conjunto de validación japonés de llamadas a herramientas.

Los datasets utilizados fueron fn-aka-mur/wiki40b_ja para el preentrenamiento continuado, izumi-lab/llm-japanese-dataset-vanilla para el ajuste por instrucciones y nappa0326/glaive-function-calling-v2-sharegpt-japanese para la reparación de tool calling. El dataset Tonari-no-usagi/Japanese_Function_Calling_Dataset se usó únicamente para evaluación, no para entrenamiento.

## Capacidades

- Generacion de texto en japones y en contextos multilingues, con especial enfoque en el idioma japones.
- Modo de razonamiento explicito (thinking mode): las respuestas comienzan con `[Start thinking]` y terminan con `[End thinking]` antes de dar la respuesta final.
- Soporte de tool calling y function calling mediante el paso de un array `tools` en `/v1/chat/completions`, con `tool_choice: "auto"` funcionando correctamente.
- Capacidad de razonamiento multi-paso y uso en agentes gracias al modo de pensamiento explicito.
- Ventana de contexto declarada de 1.048.576 tokens, apta para documentos muy extensos.
- Ausencia de capa de rechazo (uncensored), lo que permite generar contenido que un modelo alineado rechazaria.

## Casos de uso

- Atencion al cliente automatizada en japones: el modelo puede gestionar conversaciones multi-turno con contexto largo y consultar sistemas externos mediante tool calling, lo que permite resolver incidencias sin intervencion humana.
- Generacion de codigo con llamadas a funciones en entornos de desarrollo: el soporte de tool calling y el modo thinking permiten planificar y ejecutar secuencias de llamadas a APIs en pipelines de CI/CD o editores asistidos.
- Analisis de documentos largos en japones: con un contexto de 1 millon de tokens, es adecuado para resumir contratos, informes tecnicos o expedientes legales completos sin fragmentar el texto.
- Investigacion en procesamiento de lenguaje natural japones: sirve para extraer informacion, clasificar textos o entrenar modelos downstream, aprovechando su adaptacion al japones y su licencia Apache-2.0.
- Agentes autonomos con razonamiento multi-paso: el modo thinking permite descomponer tareas complejas en pasos intermedios antes de ejecutar acciones, lo que resulta util en sistemas de automatizacion de flujos de trabajo.
- Chatbots sin restricciones en entornos controlados: al ser un modelo sin censura, puede emplearse en investigacion de alineacion, generacion de contenido creativo o simulacion de dialogo en sandboxes aislados, siempre con supervision humana.
- Traduccion y localizacion asistida: sus capacidades multilingues y su base en japones permiten apoyar tareas de traduccion con contexto amplio, especialmente en dominios tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos que se aportan son metricas de adaptacion y rendimiento local:

| Metrica | Valor |
|---|---|
| Refusals (antes/despues de Heretic) | 58/100 → 3/100 |
| KL tras atenuacion de rechazos | 0,0118 |
| Perdida de entrenamiento (preentrenamiento japones) | 2,77 → 2,20 |
| Perdida de entrenamiento (ajuste por instrucciones) | 2,59 → 1,50 |
| Perdida de entrenamiento (reparacion de tool calling) | 1,48 → 0,57 |
| Coincidencia de nombre de funcion (held-out japones) | 96% |
| Perplejidad Q4_K_M (held-out japones) | 6,75 |
| Velocidad Q8_0 (RTX 5060 Ti 16GB x2) | 75,9 tokens/s |
| Velocidad Q4_K_M (RTX 5060 Ti 16GB x2) | 105,9 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa unos 4,1 GiB y el Q4_K_M unos 2,5 GiB. Para contextos largos se necesita memoria adicional; el autor utilizo 2x RTX 5060 Ti de 16GB, 32GB de RAM y 23GB de swap.
- GPU recomendadas: RTX 5060 Ti 16GB (usada por el autor), RTX 4090, A100 o cualquier GPU con al menos 8-12GB de VRAM para cuantizaciones ligeras y contextos moderados.
- Compatibilidad con GPU de consumo: si, con Q4_K_M en una GPU de 8GB (RTX 3060, RTX 4060) es viable para contextos cortos; para contextos largos se recomienda mas memoria.
- Opciones de despliegue: llama.cpp mediante el fork de XHToken, llama-server, y cualquier servidor compatible con endpoints OpenAI (la etiqueta `endpoints_compatible` lo indica). No se menciona soporte para vLLM.
- Latencia y throughput: 75,9 tokens/s con Q8_0 y 105,9 tokens/s con Q4_K_M en el sistema de pruebas del autor, con 16 hilos y descarga completa en GPU (`-ngl 99`).

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos de la misma categoria en la informacion proporcionada. La unica comparacion posible es con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| XHToken/Spark-X2.5-4B (base) | 4,1B | 1.048.576 | Apache-2.0 | No especificado |
| soyaakinohara/Spark-X2.5-4B-Heretic-jp-gguf | 4,1B | 1.048.576 | Apache-2.0 | GGUF |

No se han encontrado datos de benchmarks comparativos con alternativas como Llama-3.2-3B o Qwen2.5-4B en las fuentes consultadas.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido inseguro, ilegal o danino. No dispone de capa de seguridad integrada, por lo que cualquier despliegue debe incluir moderacion, registro y revision humana.
- Dependencia de un fork de llama.cpp: no es compatible con el llama.cpp estandar. Es necesario usar la version mantenida por XHToken, lo que limita su portabilidad.
- Contexto de 1 millon de tokens: el valor es un metadato del modelo. En la practica, la memoria disponible y la implementacion de llama.cpp determinan la longitud real que se puede procesar.
- Riesgo de alucinacion inherente a un modelo de 4B de parametros, especialmente en tareas de razonamiento complejo.
- Sesgos no documentados: el entrenamiento en Wikipedia japonesa y datasets japoneses puede introducir sesgos culturales y de contenido.
- El modo thinking consume tokens de forma significativa: se recomienda usar `max_tokens` de 1024 o mas, ya que un presupuesto de 200 tokens se agota solo con el pensamiento.
- Responsabilidad legal: la licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de las salidas generadas y de su uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/soyaakinohara/Spark-X2.5-4B-Heretic-jp-gguf
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Fork de llama.cpp requerido: https://github.com/XHToken/llama.cpp
- Modelo sin cuantizar (Heretic): https://huggingface.co/soyaakinohara/Spark-X2.5-4B-Heretic
- Dataset de preentrenamiento japones: https://huggingface.co/datasets/fn-aka-mur/wiki40b_ja
- Dataset de instrucciones japones: https://huggingface.co/datasets/izumi-lab/llm-japanese-dataset-vanilla
- Dataset de tool calling japones: https://huggingface.co/datasets/nappa0326/glaive-function-calling-v2-sharegpt-japanese
- Dataset de evaluacion de tool calling: https://huggingface.co/datasets/Tonari-no-usagi/Japanese_Function_Calling_Dataset
