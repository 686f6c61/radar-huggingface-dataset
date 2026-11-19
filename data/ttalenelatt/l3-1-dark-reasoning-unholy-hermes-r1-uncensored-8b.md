# TTalenelaTT/L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B

## Resumen
L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B es un modelo de generación de texto en inglés publicado por TTalenelaTT, construido mediante mergekit a partir de dos modelos base: NousResearch/DeepHermes-3-Llama-3-8B-Preview y Undi95/Llama-3-Unholy-8B. Su propósito declarado es el de un modelo de razonamiento con control variable de "thinking" orientado a escritura creativa, ficción, roleplay y generación de tramas, con un tono explícitamente sin censura (NSFW, horror gráfico, lenguaje soez). La model card reproduce en gran parte la estructura y las instrucciones operativas del modelo original de DavidAU (L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B), lo que sugiere que se trata de una republicación o derivado del mismo.

Arquitectura transformer decoder-only basada en Llama 3.1, con 8.030.261.248 parámetros totales (8B) en precisión bfloat16 y formato safetensors. La ventana de contexto declarada es de 128k tokens, aunque el autor recomienda un mínimo práctico de 4k y preferiblemente 8k para acomodar los bloques de razonamiento y la salida. La licencia es Apache 2.0 y el modelo está etiquetado únicamente para inglés.

Es relevante en el nicho de modelos "uncensored" para escritura creativa y roleplay (compatible con frontends como SillyTavern), no como modelo de propósito general para producción. La activación del razonamiento depende de system prompts específicos y de temperaturas altas, lo que lo aleja de los flujos de inferencia convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con sistema de razonamiento DeepHermes |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k tokens (mínimo práctico recomendado: 4k, preferible 8k) |
| Tipos de cuantizacion | El repo fuente permite generar GGUF, GPTQ, EXL2, AWQ, HQQ; se anuncian cuantizaciones IQ4XS y Q8 ("MAX") |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento
El modelo es un merge de dos modelos Llama 3 de 8B: NousResearch/DeepHermes-3-Llama-3-8B-Preview, que aporta el sistema de razonamiento con activación por system prompt, y Undi95/Llama-3-Unholy-8B, que aporta el carácter "uncensored" y el estilo de escritura. La técnica de combinación es mergekit, si bien la model card no especifica la configuración exacta del merge (tipo, pesos por capa o tensor).

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO posteriores al merge. El autor indica que el modelo conserva las funciones del DeepHermes original "a aproximadamente el 50%-67% de su potencia de razonamiento original", lo que implica una degradación deliberada o colateral de la capacidad de razonamiento respecto al modelo base. No se documentan innovaciones técnicas propias más allá de la herencia del sistema de thinking de DeepHermes y del ajuste del tensor de salida a bf16 en las cuantizaciones "MAX".

## Capacidades
- Generación de texto creativo en inglés: ficción, narrativa, descripción de escenas, continuación de escenas y generación de tramas y subtramas.
- Roleplay conversacional multi-turno, con soporte declarado para SillyTavern.
- Razonamiento con "thinking" activable mediante system prompts, con control on/off y variable; el bloque de razonamiento puede ser más explícito que la salida final.
- Generación de contenido sin censura: horror gráfico, NSFW y lenguaje soez de forma explícita.
- Resolución de acertijos, enigmas y problemas lógicos, aunque con capacidad reducida respecto al DeepHermes original.
- Estilos por género: ciencia ficción, romance, terror y otros géneros declarados en las etiquetas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso
- Escritura de ficción asistida: el modelo puede continuar escenas y desarrollar subtramas con contexto largo (hasta 128k tokens, con mínimo práctico de 8k), lo que permite mantener coherencia en manuscritos extensos.
- Roleplay en frontends dedicados: integración con SillyTavern mediante plantilla Llama 3 Instruct, con temperaturas altas (1.2 o superiores) para obtener respuestas más ricas.
- Generación de tramas y argumentos: útil para lluvia de ideas estructurada en proyectos narrativos, aprovechando los bloques de razonamiento para explorar variantes argumentales.
- Contenido de terror y horror narrativo: el modelo está diseñado para producir descripciones gráficas y explícitas, adecuado para proyectos de ficción de género que requieran ese registro.
- Resolución de acertijos y enigmas lógicos: el sistema de thinking permite abordar problemas que un Llama 3.1 estándar resolvería con más dificultad, aunque con menor fiabilidad que el DeepHermes original.
- Prototipado de personajes conversacionales: creación de personajes con "carácter" definido por system prompt (el autor documenta variantes tipo "Joker"), útil para demos de narrativa interactiva.
- Generación de cuantizaciones y despliegue local: al publicarse el checkpoint completo en safetensors, sirve como fuente para producir GGUF, GPTQ, EXL2, AWQ o HQQ y ejecutarse en hardware de consumo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de contexto; el repo ocupa 16,1 GB.
- Cuantizaciones de 4 bits (IQ4XS, Q4_K_M): en torno a 5-6 GB de VRAM, viables en GPUs de consumo con 8 GB o más.
- Cuantización Q8: aproximadamente 8-9 GB, requiere GPUs de 12 GB o superiores.
- GPUs recomendadas: A100 o H100 para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado o Q8 con contexto amplio; RTX 3090/4080 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits en GPUs de 8 GB o más; en bf16 requiere 24 GB o más.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama con GGUF, vLLM y TGI (etiqueta endpoints_compatible), así como EXL2, AWQ, GPTQ y HQQ generados a partir del checkpoint fuente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Notas |
|---|---|---|---|---|---|
| L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B | 8B | 128k | Sí, activable por system prompt (~50-67% del DeepHermes original) | Apache 2.0 | Merge orientado a creatividad y contenido sin censura |
| NousResearch/DeepHermes-3-Llama-3-8B-Preview | 8B | 128k (declarado en el modelo base) | Sí, completo | No disponible en la información | Base del razonamiento; mayor potencia de thinking |
| Undi95/Llama-3-Unholy-8B | 8B | No disponible en la información | No documentado | No disponible en la información | Base del carácter "uncensored" y del estilo de escritura |
| Llama 3.1 8B Instruct | 8B | 128k | No (sin modo thinking) | Llama 3.1 Community License | Referencia generalista, con censura y sin foco creativo |

## Limitaciones y advertencias
- Contenido explícito: el modelo genera NSFW, horror gráfico y lenguaje soez de forma deliberada; no es apto para entornos sin moderación ni para uso con menores.
- Razonamiento degradado: el autor reconoce que conserva solo un 50-67% de la potencia del DeepHermes original, por lo que su fiabilidad en tareas lógicas es limitada.
- Inestabilidad del bloque de thinking: puede requerir regeneraciones para activarse, el bloque puede terminar antes de la salida y puede necesitar un prompt manual para forzar la respuesta final.
- Dependencia de configuración: funciona mejor con temperaturas altas (1.2 o superiores según el autor) y prompts medios o largos; con temperaturas bajas el rendimiento creativo se resiente. Las instrucciones de la model card son parcialmente contradictorias en este punto (menciona rangos de 0 a 0.8 y también 1.2+).
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación: elevado en un modelo creativo sin censura y sin benchmarks publicados; no apto para tareas de recuperación de hechos.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativa sobre material explícito; la responsabilidad recae en el desplegador.
- Procedencia del merge no documentada: no se especifica la configuración de mergekit ni la composición del dataset, lo que dificulta la reproducibilidad.
- Sin métricas de calidad ni evaluaciones independientes: descargas y likes a cero en el momento de la consulta.

## Enlaces
- Hugging Face: https://huggingface.co/TTalenelaTT/L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B
- Modelo base (razonamiento): https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
- Modelo base (uncensored): https://huggingface.co/Undi95/Llama-3-Unholy-8B
- Perfil del autor original referenciado en la model card: https://huggingface.co/DavidAU
- Colecciones del autor original: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQs del autor original: https://huggingface.co/DavidAU/support
