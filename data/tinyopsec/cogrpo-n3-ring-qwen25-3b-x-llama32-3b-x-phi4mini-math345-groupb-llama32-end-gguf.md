# tinyopsec/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end-GGUF

## Resumen

`tinyopsec/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end-GGUF` es la versión cuantizada en GGUF de un modelo de 3.212.749.888 parámetros derivado de `meta-llama/Llama-3.2-3B-Instruct` mediante ajuste fino con GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en el artículo de DeepSeekMath. El modelo original lo desarrolla el usuario `logan7000` y la cuantización la firma `tinyopsec` con llama.cpp.

El modelo forma parte del experimento "CogRPO N3 Ring", que explora fusiones heterogéneas de modelos y aprendizaje por refuerzo multi-grupo orientado a razonamiento matemático. La variante `groupB-llama32-end` corresponde a la rama Llama-3.2-3B del pipeline de ajuste en anillo y se entrenó sobre el conjunto `q1716523669/MATH-Level345`, compuesto por problemas de competición de niveles 3, 4 y 5 del dataset MATH.

Su relevancia práctica radica en que ofrece un modelo especializado en matemáticas y razonamiento con un tamaño contenido (3,2B) y un abanico amplio de cuantizaciones (de F16 a Q2_K) que permiten ejecutarlo íntegramente en CPU. La arquitectura es `LlamaForCausalLM` con una longitud de contexto de 32.768 tokens, lo que lo hace atractivo para despliegues locales de bajo coste y para experimentación con técnicas de RL aplicadas a modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only con 3,2B parámetros y ventana de contexto de 32.768 tokens. Sobre esa base se aplicó ajuste fino con GRPO, un algoritmo de optimización de política relativa por grupos que estima la ventaja de cada respuesta comparándola con las de un grupo de muestras generadas para el mismo prompt, evitando la necesidad de un modelo crítico separado. El entrenamiento se realizó con TRL y se centró en problemas de competición del dataset MATH de niveles 3, 4 y 5.

La variante `groupB-llama32-end` pertenece a un experimento de "anillo" (ring) con tres modelos de origen (Qwen2.5-3B, Llama-3.2-3B y Phi-4-mini) y varios grupos de entrenamiento; esta rama concreta representa el extremo Llama-3.2 del anillo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a MATH Level 3-4-5, ni si se aplicaron etapas adicionales de DPO o RLHF. La cuantización se generó con llama.cpp en once variantes que van desde 6,4 GB (F16) hasta 1,2 GB (Q2_K).

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat compatible con la plantilla de Llama-3.2-Instruct.
- Razonamiento matemático especializado en problemas de competición de dificultad media-alta (niveles 3-5 de MATH), incluyendo álgebra, ecuaciones cuadráticas y problemas de varios pasos.
- Razonamiento multi-paso derivado del ajuste con GRPO, orientado a cadenas de razonamiento matemático.
- Ejecución en CPU sin GPU, gracias a las cuantizaciones GGUF de bajo bit.
- Compatibilidad con endpoints y servidores compatibles con la API de llama.cpp (`llama-server`, llama-cpp-python, LM Studio, Ollama).
- Soporte de conversaciones multi-turno mediante `create_chat_completion` en llama-cpp-python.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos de competición en local: el modelo se entrenó específicamente sobre MATH niveles 3-5, por lo que puede resolver ecuaciones, problemas de álgebra y ejercicios de varios pasos ejecutándose en un portátil con 3-4 GB de RAM usando Q4_K_M.
- Tutor de matemáticas offline: integrado en una aplicación de escritorio mediante llama-cpp-python, permite generar explicaciones paso a paso de ejercicios sin conexión a internet ni coste de API, con contexto suficiente (32.768 tokens) para mantener el historial de una sesión de estudio.
- Generación de datasets sintéticos de razonamiento matemático: al ser un modelo pequeño y gratuito de ejecutar, se puede usar para generar borradores de soluciones que luego se filtran y corrigen, alimentando pipelines de datos para modelos mayores.
- Prototipado de pipelines de RL para investigación: sirve como referencia reproducible para estudiar el efecto de GRPO en modelos de 3B, comparando la rama Llama-3.2 con las ramas Qwen2.5 y Phi-4-mini del mismo experimento.
- Evaluación de cuantizaciones: el repositorio ofrece once niveles de cuantización del mismo modelo, lo que permite medir empíricamente la degradación de precisión en tareas matemáticas al bajar de Q8_0 a Q2_K en un mismo hardware.
- Asistente de cálculo en herramientas de línea de comandos: con `llama-cli` y parámetros de muestreo bajos (temperatura 0,6, top_p 0,95, min_p 0,0), se puede invocar desde scripts para resolver expresiones y verificar resultados de forma local.
- Docencia e investigación sobre ajuste fino: el modelo y su linaje documentado (base, dataset, método, framework) permiten reproducir el proceso de GRPO sobre Llama-3.2-3B en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM mínima y recomendada por cuantización, según la model card:

| Cuantizacion | RAM minima | RAM recomendada |
|---|---|---|
| F16 | 8 GB | 10 GB |
| Q8_0 | 5 GB | 6 GB |
| Q6_K | 4 GB | 5 GB |
| Q5_K_M | 4 GB | 5 GB |
| Q4_K_M | 3 GB | 4 GB |
| Q3_K_M | 3 GB | 4 GB |
| Q2_K | 2 GB | 3 GB |

- Todas las cuantizaciones están pensadas para ejecutarse en CPU; la GPU es opcional.
- En GPU, el modelo cabe holgadamente en tarjetas consumer: una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB pueden alojar incluso la versión F16 (6,4 GB) con margen para el contexto. No se especifican GPU profesionales (A100, H100) porque el tamaño no las requiere.
- Opciones de despliegue documentadas: llama.cpp CLI (`llama-cli`), llama.cpp server (`llama-server`), llama-cpp-python, LM Studio y Ollama (`ollama run hf.co/...:Q4_K_M`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (CogRPO Llama-3.2-3B, GGUF) | 3,21B | 32.768 | Matemáticas (MATH 3-5) vía GRPO | llama3.2 | GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 | Propósito general, instrucciones | llama3.2 | safetensors, GGUF |
| Qwen2.5-3B-Instruct | ~3,1B | 32.768 | Propósito general multilingüe | Apache 2.0 | safetensors, GGUF |
| Phi-4-mini | ~3,8B | 128.000 | Razonamiento y matemáticas | MIT | safetensors, GGUF |

La comparación con Llama-3.2-3B-Instruct es la más directa: comparten arquitectura y tokenizador, pero este modelo reduce el contexto efectivo declarado a 32.768 tokens y sustituye el ajuste generalista por GRPO sobre matemáticas. Frente a Qwen2.5-3B-Instruct, la diferencia principal es el multilingüismo (Qwen lo soporta, este modelo declara solo inglés) y la licencia (Apache 2.0 frente a llama3.2). Frente a Phi-4-mini, este modelo es ligeramente menor en parámetros y carece de contexto de 128K. No se dispone de datos de benchmarks que permitan comparar rendimiento real entre ellos.

## Limitaciones y advertencias

- El modelo declara únicamente inglés como idioma soportado; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- El ajuste fino se limita a problemas de MATH niveles 3-5, lo que puede provocar degradación en tareas generales de conversación o conocimiento fuera del dominio matemático.
- Riesgo de alucinación en razonamientos matemáticos: al ser un modelo de 3B ajustado con RL, puede producir cadenas de razonamiento plausibles con resultados incorrectos, especialmente en problemas fuera de la distribución de entrenamiento.
- La licencia llama3.2 impone condiciones de la licencia comunitaria de Llama 3.2, incluidos requisitos de atribución y restricciones para usos comerciales a gran escala; conviene revisar los términos antes de un despliegue en producción.
- El contexto declarado en la model card es de 32.768 tokens, inferior al contexto nativo de Llama-3.2-3B-Instruct; no se documenta si el ajuste fino preserva la ventana completa.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) pueden degradar de forma notable la precisión en tareas de razonamiento matemático, donde los errores se acumulan paso a paso.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; el modelo no incluye salvaguardas específicas más allá de las heredadas de Llama-3.2-Instruct.
- La model card recomienda `min_p = 0.0` y `repeat_penalty = 1.0` para evitar bucles de repetición; usar otros valores puede degradar la calidad de las respuestas.
- El repositorio ocupa 27,4 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyopsec/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end-GGUF
- Modelo original (no cuantizado): https://huggingface.co/logan7000/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Autor de la cuantización: https://huggingface.co/tinyopsec
- Autor del modelo original: https://huggingface.co/logan7000
- Artículo de DeepSeekMath (GRPO): https://arxiv.org/abs/2402.03300
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset de entrenamiento: https://huggingface.co/datasets/q1716523669/MATH-Level345
