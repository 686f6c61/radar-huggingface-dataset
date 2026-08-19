# WeiboAI/VibeThinker-3B

## Resumen

VibeThinker-3B es un modelo de lenguaje de 3 085 938 688 parámetros desarrollado por WeiboAI como parte de la serie VibeThinker, especializado en razonamiento verificable: matemáticas, programación competitiva y problemas STEM. Se basa en Qwen2.5-Coder-3B y aplica el pipeline de post-entrenamiento Spectrum-to-Signal Principle (SSP), que combina SFT curricular, RL con recompensas verificables y auto-destilación offline. El modelo destaca por alcanzar resultados comparables a sistemas mucho más grandes (DeepSeek V3.2, GLM-5, Kimi K2.5) en benchmarks de razonamiento como IMO-AnswerBench, a pesar de su tamaño reducido.

La relevancia actual de VibeThinker-3B radica en demostrar que los modelos pequeños pueden acercarse al rendimiento de frontera en dominios con señales de verificación claras, sin necesidad de escalar parámetros. Su licencia MIT y su compatibilidad con transformers lo hacen atractivo para despliegues en entornos con recursos limitados. No obstante, el propio autor advierte que no fue entrenado para tool-calling ni agentes, por lo que su uso recomendado se limita a tareas de razonamiento puro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 3 085 938 688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento RL usó ventana de 64K) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

VibeThinker-3B es un fine-tune del modelo base Qwen/Qwen2.5-Coder-3B, por lo que hereda su arquitectura transformer decoder-only con atención causal estándar. No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal; es un modelo denso convencional. El entrenamiento sigue el pipeline SSP, que consta de cuatro etapas:

1. **SFT curricular en dos fases**: la primera cubre un amplio espectro de capacidades (matemáticas, código, razonamiento STEM, diálogo general, seguimiento de instrucciones); la segunda se centra en muestras de razonamiento más largas y difíciles, usando destilación con exploración de diversidad para preservar múltiples rutas de solución válidas.
2. **RL multi-dominio**: se aplica MaxEnt-Guided Policy Optimization (MGPO) secuencialmente sobre tareas de matemáticas, código y STEM, con una ventana de contexto única de 64K tokens para conservar trayectorias de razonamiento largas.
3. **Auto-destilación offline**: se filtran trayectorias de alta calidad de los checkpoints de RL y se destilan en un modelo unificado, priorizando ejemplos correctos pero aún no bien modelados mediante una puntuación de potencial de aprendizaje.
4. **Instruct RL**: etapa final de alineación con instrucciones (el detalle completo no se especifica en la model card).

No se han publicado detalles sobre el volumen total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso en dominios verificables: matemáticas, código y STEM.
- Resolución de problemas de programación competitiva estilo LeetCode (aceptación del 96,1% en concursos recientes no vistos).
- Razonamiento matemático avanzado: alcanza 76,4 en IMO-AnswerBench (400 problemas de nivel IMO) y 80,6 con la estrategia de scaling test-time Claim-Level Reliability Assessment (CLR).
- Seguimiento de instrucciones y diálogo conversacional en inglés.
- No soporta tool-calling, function calling, orquestación de APIs ni agentes autónomos (el autor lo desaconseja explícitamente).
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- **Resolución de problemas de programación competitiva**: el modelo puede generar soluciones correctas en Python para problemas de LeetCode y concursos similares, con alta tasa de aceptación en el primer intento. Es adecuado para plataformas de entrenamiento de algoritmos o generación de soluciones de referencia.
- **Asistencia en matemáticas avanzadas**: puede abordar problemas de olimpiadas (IMO, HMMT) y ofrecer razonamientos detallados paso a paso, útil para estudiantes o investigadores que necesitan verificar demostraciones o explorar rutas alternativas.
- **Generación de código algorítmico**: dado su entrenamiento en código, puede producir implementaciones eficientes de algoritmos (ordenación, grafos, programación dinámica) cuando se le pide en formato de problema. No se recomienda para tareas de desarrollo de software general.
- **Evaluación de razonamiento en entornos educativos**: puede usarse como generador de problemas o como corrector automático de respuestas en dominios con verificación objetiva (matemáticas, lógica).
- **Investigación en modelos pequeños**: sirve como referencia para estudiar el límite de capacidades de razonamiento en modelos de 3B, comparando con técnicas de scaling test-time y destilación.
- **Prototipado de asistentes de razonamiento**: en entornos donde el coste de inferencia es crítico, puede desplegarse como motor de razonamiento para tareas específicas de STEM, siempre que no se requiera interacción con herramientas externas.

## Benchmarks y rendimiento

Los datos publicados en la model card se limitan a dos benchmarks principales. No se han proporcionado resultados de MMLU, HumanEval, GSM8K u otros estándar en la información disponible.

| Benchmark | Resultado de VibeThinker-3B | Comparación con modelos grandes |
|---|---|---|
| IMO-AnswerBench | 76,4 (80,6 con CLR) | DeepSeek V3.2 (78,3, 671B), GLM-5 (82,5, 744B), Kimi K2.5 (81,8, 1T) |
| LeetCode contests recientes (abril-mayo 2026) | 123/128 primeros intentos (96,1% aceptación) | No se especifican comparaciones |

Además, la model card afirma que el modelo alcanza el rango de rendimiento de modelos de primera línea como Qwen3.6 Plus, Gemini 3 Pro, GLM-5 y Kimi K2.5 en benchmarks de razonamiento verificable, aunque no se detallan los números exactos para esos casos.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información proporcionada. Dado el tamaño de 3B parámetros, se puede estimar que:

- En precisión fp16, el peso del modelo ocupa aproximadamente 6,2 GB (coincide con el tamaño del repo), por lo que se necesitaría una GPU con al menos 8 GB de VRAM para inferencia sin cuantización.
- Con cuantización int8, la VRAM requerida bajaría a ~3 GB; con int4, a ~1,5 GB, permitiendo ejecución en GPUs consumer como RTX 3060, RTX 4060 o incluso en CPU con llama.cpp.
- No se han publicado datos de latencia ni throughput.
- Opciones de despliegue compatibles: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, Ollama o llama.cpp, aunque no hay confirmación oficial de soporte en estos frameworks.

Estas cifras son estimaciones técnicas generales, no datos oficiales del autor.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos directos con otros modelos de 3B en la información proporcionada. El modelo base Qwen2.5-Coder-3B es su principal referencia estructural, pero no se han publicado resultados que permitan una comparación cuantitativa. Se puede señalar que:

- **Qwen2.5-Coder-3B** (base): mismo tamaño y arquitectura, pero sin el pipeline SSP; VibeThinker-3B añade SFT curricular, RL con recompensas verificables y destilación, lo que mejora el rendimiento en razonamiento, aunque no hay números que lo demuestren en esta ficha.
- Otros modelos de razonamiento de 3B (p. ej., Llama-3.2-3B, Phi-3-mini) no aparecen en la documentación, por lo que no es posible establecer una comparativa con datos.

## Limitaciones y advertencias

- **No apto para tool-calling ni agentes**: el autor advierte explícitamente que el modelo no fue entrenado con datos de llamada a funciones ni programación basada en agentes, por lo que no debe usarse en tareas que requieran orquestación de APIs o agentes autónomos.
- **Limitado a inglés**: solo se declara soporte para el idioma inglés; su rendimiento en otros idiomas no está documentado.
- **Conocimiento abierto limitado**: al ser un modelo pequeño, su cobertura de conocimiento general, diálogo abierto y escenarios de cola larga es inferior a la de modelos grandes, como reconoce el propio autor.
- **Riesgo de alucinación**: no se documentan tasas de alucinación específicas, pero es un riesgo inherente en modelos de razonamiento; se recomienda verificar respuestas en dominios críticos.
- **Contexto de inferencia no especificado**: aunque el entrenamiento usó ventanas de 64K, no se confirma la longitud de contexto soportada en producción; se debe probar antes de desplegar con entradas largas.
- **Licencia MIT**: permite uso comercial sin restricciones, pero el usuario asume la responsabilidad de los resultados generados.

## Enlaces

- [HuggingFace - WeiboAI/VibeThinker-3B](https://huggingface.co/WeiboAI/VibeThinker-3B)
- [GitHub - WeiboAI/VibeThinker](https://github.com/WeiboAI/VibeThinker)
- [ModelScope - WeiboAI/VibeThinker-3B](https://modelscope.cn/models/WeiboAI/VibeThinker-3B)
- [Technical Report (arXiv:2606.16140)](https://huggingface.co/papers/2606.16140)
