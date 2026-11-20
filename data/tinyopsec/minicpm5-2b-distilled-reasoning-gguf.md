# tinyopsec/minicpm5-2b-distilled-reasoning-GGUF

## Resumen

MiniCPM5-2B-distilled-reasoning es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) especializado en razonamiento paso a paso, desarrollado por el usuario `jigs97022` y cuantizado a formato GGUF por `tinyopsec`. Se construye sobre la arquitectura `openbmb/MiniCPM5-2B` y se ha afinado mediante QLoRA sobre 10.000 trazas de razonamiento filtradas por calidad, destiladas de tres modelos frontera: Qwen3.8-Max, GLM-5.2 y Kimi K3. La versión publicada en este repositorio es la familia de cuantizaciones GGUF, lista para su uso en llama.cpp, LM Studio y Ollama.

El modelo resuelve el problema de disponer de razonamiento explícito tipo chain-of-thought en un tamaño que cabe en hardware de consumo. Con una ventana de contexto máxima de 4.096 tokens y un tamaño de pesos que oscila entre 0,8 GB (Q2_K) y 5,0 GB (F16), es desplegable en GPUs de gama media e incluso en CPU con las cuantizaciones más agresivas. Está orientado a matemáticas, código, puzles lógicos y resolución estructurada de problemas.

Su relevancia actual radica en la combinación de tres factores: licencia Apache 2.0 (uso comercial sin restricciones de atribución más allá de la licencia), formato GGUF con once niveles de cuantización y un origen de destilación multi-profesor que busca concentrar capacidades de razonamiento de modelos mucho mayores en un único checkpoint compacto. La contraposición es su limitación idiomática (solo inglés y chino) y un contexto corto para estándares de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base `openbmb/MiniCPM5-2B`); detalles internos de capas y atención no disponibles |
| Parámetros totales | 2.516.756.480 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (máximo de entrenamiento) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de `openbmb/MiniCPM5-2B`, un transformer denso de aproximadamente 2,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con QLoRA (rango 64, alpha 32) durante el proceso de destilación. No se detallan en la información disponible el número de capas, dimensiones ocultas, mecanismo de atención ni si emplea técnicas como decodificación especulativa o atención lineal; esos datos pertenecen a la arquitectura base y no se han publicado en esta ficha.

El entrenamiento consistió en 10.000 muestras de destilación procedentes del dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, con trazas de razonamiento filtradas por calidad que cubren matemáticas, código, puzles lógicos y resolución estructurada de problemas. Los profesores son Qwen3.8-Max, GLM-5.2 y Kimi K3. El cómputo se realizó en dos GPUs Kaggle T4. No se especifica en la información disponible el uso de RLHF o DPO posteriores, ni la composición exacta del corpus más allá de las cuatro categorías mencionadas.

## Capacidades

- Generación de texto con razonamiento explícito paso a paso (chain-of-thought), orientado a problemas matemáticos y lógicos.
- Resolución de ecuaciones y problemas aritméticos mostrando el desarrollo intermedio.
- Generación y explicación de código, incluyendo trazas de razonamiento previas a la solución.
- Puzles lógicos y problemas de razonamiento estructurado.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés y chino.
- Visión, audio o modo thinking separado: no disponible en la información proporcionada.

## Casos de uso

- Tutoría matemática interactiva: el modelo puede recibir un problema como "3x + 7 = 22" y devolver el desarrollo paso a paso, lo que lo hace adecuado para asistentes educativos desplegados en local o en servidores modestos gracias a su tamaño de 2,5 B parámetros.
- Generación de explicaciones de código: dado un fragmento de código, el modelo puede razonar sobre su funcionamiento y producir una explicación estructurada, útil en herramientas de documentación automática que requieran bajo coste de inferencia.
- Asistente de depuración en entornos con recursos limitados: con la cuantización Q4_K_M (1,5 GB) puede ejecutarse en una GPU de 2 GB de VRAM o en CPU, integrándose en IDE o scripts de CI para explicar errores de tests.
- Resolución de puzles y problemas de lógica en aplicaciones de ocio o gamificación: la destilación de tres profesores frontera busca mejorar la calidad del razonamiento frente a un fine-tuning monolítico, lo que encaja en apps de retos diarios o juegos de lógica.
- Procesamiento por lotes de problemas estructurados: con contexto de 4.096 tokens y pesos de 1,5 GB, es viable ejecutar lotes grandes en una sola GPU consumer para clasificar o resolver problemas de dominios acotados.
- Prototipado rápido de pipelines de razonamiento: al estar disponible en GGUF con once cuantizaciones y soporte en Ollama y LM Studio, permite validar una idea de producto de razonamiento en minutos antes de invertir en modelos mayores.
- Despliegue en edge o dispositivos con poca memoria: la variante Q2_K (0,8 GB, 1,5 GB de VRAM mínima) permite ejecutar razonamiento básico en entornos muy restringidos, aunque con degradación de calidad esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima estimada según el autor: F16 requiere 8 GB, Q8_0 requiere 4 GB, Q4_K_M requiere 2 GB y Q2_K requiere 1,5 GB.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada; por tamaño, una RTX 3060 de 12 GB o superior cubre todas las cuantizaciones con holgura, y una RTX 4090 o A100/H100 no aportan ventaja significativa por el limitado tamaño del modelo.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs consumer de 8 GB o menos; las variantes Q4 y Q2 caben incluso en GPUs de 2 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python, LM Studio, Ollama (`ollama run hf.co/tinyopsec/minicpm5-2b-distilled-reasoning-GGUF:Q4_K_M`) y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en dos T4 de Kaggle, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tinyopsec/minicpm5-2b-distilled-reasoning-GGUF | 2,52 B | 4.096 | en, zh | Apache 2.0 | GGUF |
| jigs97022/minicpm5-2b-distilled-reasoning (base) | 2,52 B | 4.096 | en, zh | Apache 2.0 | Safetensors |
| openbmb/MiniCPM5-2B (arquitectura base) | ~2 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de terceros con métricas verificables en la información proporcionada; la comparación se limita a las variantes del propio modelo y a su base arquitectónica.

## Limitaciones y advertencias

- La calidad del razonamiento puede degradarse más allá de los 4.096 tokens de contexto; no es adecuado para tareas que requieran ventanas largas.
- Entrenado sobre un subconjunto de 10.000 muestras; el autor advierte que los casos límite pueden ser más débiles que la variante completa de 52.000 muestras.
- Solo soporta inglés y chino; no hay capacidades en castellano ni en otros idiomas.
- Corte de conocimiento aproximado en 2024, heredado de la base MiniCPM5-2B.
- La destilación desde tres profesores frontera no garantiza que el modelo reproduzca fielmente sus capacidades; es esperable una brecha de rendimiento frente a los profesores, no cuantificada en la información disponible.
- Riesgo de alucinación inherente a modelos de 2,5 B parámetros, especialmente en dominios fuera de matemáticas, código y lógica.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- Las cuantizaciones Q2_K y Q3 pueden degradar de forma notable la coherencia del razonamiento; el autor recomienda Q5_K_M como opción equilibrada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la arquitectura base `openbmb/MiniCPM5-2B` y del dataset de destilación, cuyas licencias no se detallan en esta ficha.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/tinyopsec/minicpm5-2b-distilled-reasoning-GGUF
- Modelo base de la destilación: https://huggingface.co/jigs97022/minicpm5-2b-distilled-reasoning
- Arquitectura base: `openbmb/MiniCPM5-2B` (referenciada en la model card; URL no proporcionada en la información disponible)
- Dataset de destilación: `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation` (referenciado en la model card; URL no proporcionada en la información disponible)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
