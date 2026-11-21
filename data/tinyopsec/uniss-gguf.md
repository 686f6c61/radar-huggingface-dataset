# tinyopsec/UniSS-GGUF

## Resumen

UniSS-GGUF es una colección de cuantizaciones en formato GGUF del modelo `cmots/UniSS`, un framework de traducción voz-a-voz construido sobre el modelo de lenguaje Qwen2.5-1.5B-Instruct. Lo publica el usuario `tinyopsec` en Hugging Face y su propósito es facilitar la ejecución local del componente de texto del modelo mediante llama.cpp y otros runtimes compatibles con GGUF, sin necesidad de infraestructura de GPU dedicada.

El detalle crítico es que este repositorio contiene únicamente el modelo de texto: el tokenizador de audio y los componentes de voz del framework UniSS original no están incluidos. Por tanto, no se puede usar para traducción voz-a-voz real; sirve como modelo de lenguaje conversacional de 1.500 millones de parámetros derivado de Qwen2.5, con el vocabulario y comportamiento de instrucciones de esa familia.

El modelo base tiene 1.864.550.912 parámetros según los pesos en safetensors, y el repositorio GGUF ocupa 18,4 GB en total al incluir trece variantes de cuantización desde F16 hasta Q2_K. La licencia es CC BY 4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.864.550.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo original UniSS es un framework multimodal de traducción voz-a-voz que combina este LLM con un tokenizador de habla; sin embargo, esta publicación GGUF elimina esa parte y conserva solo el decodificador de texto.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO específicas para UniSS. El modelo base Qwen2.5-1.5B-Instruct fue entrenado por Alibaba con datos multilingües y ajustado por instrucciones, pero los detalles concretos del proceso de UniSS no están documentados en esta ficha.

## Capacidades

- Generación de texto conversacional multi-turno en el estilo de instrucciones de Qwen2.5.
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño de 1.500 millones de parámetros.
- Generación de código y matemáticas a nivel introductorio, heredado del modelo base.
- Soporte de tool calling y function calling según el formato de Qwen2.5 (no verificado específicamente en esta cuantización).
- Capacidades multilingües heredadas del modelo base, aunque los idiomas concretos no se detallan.
- **No incluye** capacidades de voz, audio o speech-to-speech: el tokenizador de habla no está presente en este repositorio.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- **Prototipado local de asistentes conversacionales**: gracias a las cuantizaciones Q4_K_M y Q2_K, el modelo puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- **Generación de texto en entornos con recursos limitados**: para aplicaciones embebidas o edge donde no es viable desplegar modelos de 7B o superiores, la variante Q4_K_M ofrece un equilibrio razonable entre calidad y huella de memoria.
- **Pipelines de CI/CD para pruebas de prompts**: usar el modelo como sustituto ligero en tests automatizados de plantillas de prompt o de lógica de agentes antes de escalar a modelos mayores.
- **Traducción de texto (no de voz)**: aunque UniSS está orientado a voz, el componente de texto puede emplearse para traducción escrita entre idiomas soportados por Qwen2.5, siempre que se valide la calidad por par de idiomas.
- **Generación de documentación técnica y resúmenes**: para tareas de summarization o redacción asistida en local, con la ventaja de que la licencia CC BY 4.0 permite uso comercial con atribución.
- **Base para fine-tuning ligero**: al ser un modelo de 1,5B en formato GGUF, puede servir como referencia para comparar contra versiones afinadas o para experimentos de destilación en hardware de consumo.
- **Educación e investigación**: útil para estudiar el comportamiento de cuantizaciones agresivas (Q2_K, Q3_K_S) frente a F16 en tareas de generación, midiendo la degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (aproximada, según tamaño de pesos y overhead de contexto):
  - F16: ~3,7 GB
  - Q8_0: ~2,0 GB
  - Q6_K: ~1,6 GB
  - Q5_K_M: ~1,3 GB
  - Q4_K_M: ~1,1 GB
  - Q3_K_M: ~0,9 GB
  - Q2_K: ~0,7 GB
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060). Para F16 se recomienda 4 GB o más (RTX 3060 en adelante). No requiere A100 ni H100.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada suficiente.
- **Opciones de despliegue**: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM ni TGI para esta cuantización.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UniSS-GGUF (este) | 1,86B | no disponible | CC BY 4.0 | GGUF | Solo texto; sin componente de voz |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base; licencia más permisiva |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor; licencia con restricciones |
| Gemma 2 2B | 2,6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Mayor tamaño; licencia con condiciones de uso |

La comparación directa más relevante es con Qwen2.5-1.5B-Instruct, del que deriva: este GGUF añade el pipeline de UniSS pero pierde el componente de voz y mantiene una licencia CC BY 4.0 en lugar de Apache 2.0, lo que puede ser restrictivo para algunos usos corporativos que prefieran la licencia original.

## Limitaciones y advertencias

- **No es un modelo de voz**: a pesar de las etiquetas `speech-to-speech` y `translation`, este repositorio contiene solo el decodificador de texto. No puede procesar audio ni generar habla.
- **Tamaño reducido**: con 1,5B parámetros, la calidad en razonamiento complejo, matemáticas avanzadas y código de producción es limitada en comparación con modelos de 7B o superiores.
- **Riesgo de alucinación**: inherente a los modelos de esta escala; no debe usarse en dominios críticos sin verificación humana.
- **Idiomas no documentados**: no se especifica qué idiomas cubre esta cuantización concreta; conviene validar por idioma antes de desplegar.
- **Licencia CC BY 4.0**: permite uso comercial con atribución, pero es más restrictiva que la Apache 2.0 del modelo base Qwen2.5; revisar obligaciones de atribución en productos derivados.
- **Cuantizaciones agresivas**: Q2_K y Q3_K_S pueden degradar notablemente la coherencia y la fidelidad a instrucciones; para producción se recomienda Q4_K_M o superior.
- **Sin benchmarks publicados**: no hay métricas que permitan estimar la degradación respecto al modelo original.
- **Mantenimiento incierto**: el repositorio tiene 0 likes y fue publicado por un usuario individual; no hay garantía de actualizaciones o soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/UniSS-GGUF
- Modelo base UniSS: https://huggingface.co/cmots/UniSS
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
