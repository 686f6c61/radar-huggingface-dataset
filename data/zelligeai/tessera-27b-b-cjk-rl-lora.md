# ZelligeAI/Tessera-27B-B-CJK-RL-LoRA

## Resumen

Tessera-27B-B-CJK-RL-LoRA es un adaptador PEFT LoRA de rango 32 desarrollado por ZelligeAI sobre el modelo base Qwen/Qwen3.8-27B. Se trata de la continuación, mediante ocho actualizaciones de aprendizaje por refuerzo centradas en matemáticas y código, del adaptador previo Tessera-27B-B-CJK, cuyo objetivo era reducir el número de tokens de razonamiento por turno en bucles agénticos manteniendo la capacidad de actuación (tool calling y generación de código). El adaptador cubre atención, MLP y `lm_head`, con rango 32 y alpha 32, y ocupa 1,09 GB.

La relevancia de este adaptador radica en su enfoque de eficiencia en el razonamiento: el modelo predecesor "piensa" en una notación CJK comprimida (mezcla de inglés, palabras chinas y símbolos) que reduce el coste de tokens de pensamiento por turno a aproximadamente 0,50-0,64x respecto al modelo base, mientras que las respuestas y las llamadas a herramientas permanecen en inglés plano y código. Esta versión RL añade mejoras medibles en matemáticas (AIME y HMMT 2026) y un incremento moderado del razonamiento por turno (1,11x respecto al predecesor, 0,67x respecto al base).

Es un adaptador de nicho, con muy poca tracción en el ecosistema (2 descargas, 0 likes en el momento de la consulta), pensado para pipelines de agentes de código que necesitan equilibrar profundidad de razonamiento y coste de inferencia. Requiere aplicar el adaptador sobre el modelo base en una revisión concreta y presenta una particularidad técnica relevante: la fusión de las LoRA separadas de q, k y v de Tinker en un único módulo `in_proj_qkv`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; cubre atención, MLP y `lm_head` |
| Parametros totales | no disponible (adaptador de 1,09 GB; el base es de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales, no especificadas) |
| Idiomas soportados | no disponibles (el razonamiento interno usa notación CJK comprimida; respuestas y tool calls en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |
| Rango LoRA | 32 (alpha 32); 96 en el módulo fusionado `in_proj_qkv` |
| Revision del modelo base | `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Libreria | peft |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.8-27B, un transformer de 27B parámetros, mediante PEFT LoRA de rango 32 y alpha 32 que cubre las capas de atención, el MLP y la cabeza `lm_head`. El entrenamiento consistió en continuar Tessera-27B-B-CJK con ocho actualizaciones de aprendizaje por refuerzo sobre datos de matemáticas y código. El predecesor se entrenó para que el modelo "pensara" en una notación CJK comprimida, una taquigrafía que mezcla inglés, palabras chinas y símbolos, reduciendo el número de tokens de pensamiento por turno agéntico.

Una innovación técnica destacable es la fusión de las LoRA separadas de q, k y v que Tinker entrena en las capas de atención lineal, en un único módulo `in_proj_qkv` del modelo de Hugging Face. Esta fusión se realiza con una matriz A apilada y una B diagonal por bloques, a rango 96 en ese módulo, con un error relativo máximo de fusión de 5,3e-7. El autor advierte de que una conversión directa sin esta fusión descarta los deltas en 48 de 64 capas sin emitir ningún error. La evaluación se realizó en Tinker; el adaptador se fusionó en los pesos bf16 del repo principal y se verificó mediante paridad de logprob, pero nunca se cargó con PEFT directamente.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" con notación CJK comprimida, orientada a reducir el coste de tokens por turno.
- Razonamiento matemático reforzado mediante RL: 108 de 126 intentos correctos en AIME y HMMT 2026, frente a 97 del predecesor.
- Generación de código y actuación como coding-agent, con soporte de tool calling y function calling.
- Razonamiento multi-paso en bucles agénticos, con la recomendación de usar `reasoning_effort="xhigh"`.
- Respuestas y llamadas a herramientas en inglés plano y código, aunque el pensamiento interno use la notación CJK.
- Capacidades multilingües: no disponibles más allá de la mezcla CJK/inglés descrita.
- Capacidades de visión: el adaptador sigue el layout de módulos multimodal (`language_model.layers.N`), lo que sugiere herencia de la interfaz multimodal del base, aunque no se documentan capacidades de visión específicas.

## Casos de uso

- Agentes de código autónomos: el adaptador reduce el coste de tokens de pensamiento por turno (0,67x respecto al base en estados retenidos), lo que abarata bucles agénticos largos con muchas iteraciones de tool calling.
- Resolución de problemas matemáticos competitivos: el refuerzo RL mejora el acierto en AIME y HMMT 2026 (108/126 frente a 97/126), adecuado para pipelines de verificación y generación de soluciones.
- Integración en CI/CD para revisión y parcheo de código: soporta tool calling y puede invocarse desde orquestadores que encadenen lecturas de repositorio, ejecución de tests y edición de ficheros.
- Asistentes de desarrollo en IDE: el modelo mantiene respuestas en inglés plano y código mientras comprime el razonamiento interno, lo que reduce latencia y coste en sesiones interactivas.
- Evaluación comparativa de eficiencia de razonamiento: útil como referencia para investigar el equilibrio entre profundidad de pensamiento y coste en modelos agénticos.
- Despliegue sobre el modelo fusionado del repo principal: para producción se recomienda usar Tessera-27B-B-CJK-RL ya fusionado, evitando el paso de carga del adaptador con PEFT y sus riesgos de claves no aplicadas.

## Benchmarks y rendimiento

| Benchmark | Tessera-27B-B-CJK-RL-LoRA | Tessera-27B-B-CJK | Qwen3.8-27B (base) |
|---|---|---|---|
| AIME + HMMT 2026 (aciertos / 126 intentos) | 108 | 97 | no disponible |
| Tokens de pensamiento por turno en tareas agénticas de código (ratio vs predecesor) | 1,11x (IC 90%: 0,98-1,26) | 1,00x (referencia) | no disponible |
| Tokens de pensamiento por turno en tareas agénticas de código (ratio vs base) | 0,67x | 0,50-0,64x | 1,00x (referencia) |

Los datos de eficiencia se midieron sobre estados nuevos de 16 tareas de coding-agent retenidas; el predecesor se evaluó sobre 44 estados congelados de 11 tareas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,09 GB, pero requiere cargar el modelo base Qwen3.8-27B en bf16 (aproximadamente 54 GB de pesos) para su uso.
- VRAM estimada para inferencia en bf16: en torno a 54-60 GB, lo que exige GPU de clase A100 80 GB, H100 80 GB o múltiples GPU con `device_map="auto"`.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en bf16; sería necesario cuantizar el base, aunque no se documentan recetas de cuantización para este adaptador.
- Opciones de despliegue: el autor recomienda usar el modelo fusionado de Tessera-27B-B-CJK-RL para evitar la carga del adaptador con PEFT; la carga directa requiere `AutoModelForImageTextToText` y verificar claves faltantes o inesperadas.
- Latencia y throughput: no disponibles. Cabe esperar una reducción de coste por turno derivada del menor número de tokens de pensamiento (0,67x respecto al base), pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tessera-27B-B-CJK-RL-LoRA | 27B (base) + LoRA r32 | no disponible | 108/126 en AIME+HMMT 2026; 0,67x tokens de pensamiento vs base | Apache-2.0 | Adaptador PEFT en HF |
| Tessera-27B-B-CJK | 27B (base) + LoRA r32 | no disponible | 97/126 en AIME+HMMT 2026; 0,50-0,64x tokens de pensamiento vs base | Apache-2.0 | Adaptador PEFT en HF |
| Qwen/Qwen3.8-27B | 27B | no disponible | Referencia base (1,00x tokens de pensamiento) | Apache-2.0 (según el autor) | Modelo base en HF |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador nunca se cargó con PEFT durante la evaluación; el código de ejemplo del autor está marcado como "Untested". Las claves siguen el layout multimodal (`base_model.model.model.language_model.layers.N`), por lo que hay que cargar el base con `AutoModelForImageTextToText` y comprobar claves faltantes o inesperadas, ya que PEFT puede no avisar de un fallo de aplicación.
- Una conversión directa sin la fusión q/k/v descarta deltas en 48 de 64 capas sin emitir error; es imprescindible usar el adaptador tal cual o el modelo fusionado del repo principal.
- El adaptador es el completo, no una diferencia respecto a Tessera-27B-B-CJK; debe aplicarse sobre el modelo base en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.
- El razonamiento interno en notación CJK comprimida puede dificultar la auditoría e interpretabilidad de las trazas de pensamiento.
- Riesgo de alucinación: no documentado, pero inherente a modelos generativos de 27B; no hay evaluación específica publicada.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Licencia Apache-2.0, igual que el modelo base, lo que permite uso comercial, pero conviene verificar las condiciones del base Qwen3.8-27B.
- Tracción muy baja (2 descargas, 0 likes), lo que implica escasa validación comunitaria y soporte limitado.
- Para producción se recomienda el modelo fusionado Tessera-27B-B-CJK-RL, que evita el paso de carga del adaptador.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-LoRA
- Modelo fusionado principal: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL
- Predecesor: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK
- Blog de investigación: https://zellige.ai/research/tessera-27b-b-cjk
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
