# SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4

## Resumen

Dark-Goetia-26B-A4B-LoRA-v4 es un adaptador LoRA de 0,2 GB desarrollado por SubMaroon para el modelo base Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, un modelo de arquitectura Mixture-of-Experts (MoE) de 26B parámetros con 4B activos. El adaptador está diseñado exclusivamente para ajustar el estilo y la estructura de respuesta en roleplay de fantasía oscura, aportando un tono más literario y oscuro a las narraciones. Funciona en inglés y ruso, y se integra principalmente con frontends como SillyTavern.

La versión v4 se centra en corregir un defecto observado en la v2: la pérdida de obediencia al system prompt en sesiones largas (a partir de 30-40 turnos). Para ello, el entrenamiento de v4 varía el formato de salida en el dataset manteniendo el estilo fijo, de modo que el modelo aprenda a leer el formato del prompt en lugar de tratarlo como una constante. Es un reemplazo directo de v2 con la misma estructura de adaptador (115 proyecciones, rank 32, alpha 64), pero con datos de entrenamiento renovados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base MoE (Gemma4, 26B con 4B activos) |
| Parámetros totales | 0,2 GB (adaptador) – base: 26B (no desglosado) |
| Parámetros activos | 4B (base) |
| Longitud de contexto | No especificada para el modelo base; el adaptador se entrenó con secuencias de 3584 tokens |
| Tipos de cuantización | No especificados para este adaptador (se publicó GGUF para la v2, no para la v4) |
| Idiomas soportados | Inglés, ruso |
| Licencia | Gemma (según metadata) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA que se aplica a 115 proyecciones de atención del modelo base (`o_proj`, `q_proj`, `v_proj`, `k_proj`). El modelo base es un MoE de 26B con 4B activos, basado en arquitectura Gemma4, pero no se proporcionan detalles adicionales sobre su estructura interna o su entrenamiento. El adaptador en sí se entrenó durante una época con una longitud máxima de secuencia de 3584 tokens. El conjunto de datos de v4 incluye escenas reescritas y generadas sintéticamente, además de datasets externos de roleplay (ShareGPT RP sets como LimaRP, Bluemoon), con variación en 8 ejes de formato y equilibrio entre inglés y ruso. El objetivo es que el modelo aprenda a tomar el formato del prompt, no como una constante.

## Capacidades

- Generación de texto narrativo con estilo literario oscuro y atmosférico.
- Roleplay de fantasía oscura (dark fantasy) en inglés y ruso.
- Adaptación de estructura de respuesta según el system prompt (formato variable).
- Sin soporte de tool calling, agentes, visión ni audio (adaptador de estilo, no añade capacidades funcionales).
- No contiene tramas, personajes ni contenido de los datos de entrenamiento (según el autor).
- Permite ajuste fino de la intensidad mediante un parámetro de escala (scale) en la carga del adaptador.

## Casos de uso

- Roleplay literario en SillyTavern: se usa como adaptador de estilo para añadir tono oscuro a las narraciones, con integración en la configuración de personajes y system prompts.
- Escritura creativa de fantasía oscura: adecuado para generar párrafos narrativos con atmósfera gótica o siniestra, manteniendo coherencia gramatical.
- Sesiones de rol de larga duración: la v4 está diseñada para mantener la estructura de formato en conversaciones de 30-40 turnos o más, evitando la deriva del output.
- Roleplay bilingüe (EN/RU): funciona en ambos idiomas, aunque el umbral de escala seguro es más bajo en ruso.
- Adaptación a formatos estrictos: si la tarjeta de personaje exige bloques estructurados (estado, barras de vida, etc.), el adaptador puede ajustarse para mantener esos formatos a lo largo de la conversación.
- Ajuste de estilo en modelos base: se puede integrar como un módulo de estilización para otros usos de roleplay que requieran un tono más serio y literario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona únicamente medidas de la magnitud del delta de pesos (norma de Frobenius) y escalas de efecto empíricas, sin métricas de rendimiento de tareas.

## Requisitos de hardware

- El adaptador en sí es pequeño (0,2 GB) y no requiere recursos adicionales significativos.
- El requisito real viene del modelo base `Goetia-26B-A4B-v1.3-ARA`: un MoE de 26B con 4B activos. No se indica la VRAM exacta, pero para el modelo base similar (Dark Goetia 26B A4B v2) se ha estimado unos 51,6 GB en FP16. Con cuantizaciones (por ejemplo, Q4_K_M) puede reducirse a unos 15-20 GB, aunque no hay datos oficiales.
- Para inferencia local se puede usar llama.cpp, Ollama o vLLM, que soportan la carga de adaptadores LoRA. La card recomienda SillyTavern como frontend.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Dark-Goetia-26B-A4B-LoRA-v4 | Adaptador LoRA | 0,2 GB | 3584 (entrenamiento) | Apache | Mejora la obediencia al system prompt en sesiones largas |
| Dark-Goetia-26B-A4B-LoRA-v2 | Adaptador LoRA | 0,2 GB | 2048 (entrenamiento) | Apache | Versión anterior; falla en formato después de 30-40 turnos |
| Goetia-26B-A4B-v1.3-ARA | Modelo base MoE | 26B (4B activos) | No especificado | Gemma | Modelo base sobre el que se aplica el adaptador |

No hay comparación directa con otros adaptadores de roleplay de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La v4 corrige parcialmente la pérdida de obediencia al system prompt en sesiones largas, pero el umbral de escala seguro aún no se ha medido en esta versión; se recomienda recalibrar.
- El rendimiento en ruso es más frágil que en inglés: la escala segura máxima es menor (0,37 en v2 frente a 0,40 en inglés). Para sesiones bilingües se debe ajustar al valor más restrictivo.
- El adaptador no contiene tramas ni personajes, pero el modelo base puede tener sesgos no documentados. No hay evaluación de sesgos en la información.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han reportado casos específicos.
- La licencia del modelo base es Gemma, que puede tener restricciones para uso comercial; verificar los términos de la licencia Gemma antes de desplegar en producción.
- El parámetro de escala (scale) es crítico: llama.cpp multiplica por `alpha/r` (2 en este caso) si se respeta la metadata; si el loader no lo hace, hay que dividir la escala a la mitad.
- No hay soporte de tool calling, visión, audio ni otras capacidades más allá de texto.

## Enlaces

- [HuggingFace: SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4)
- [v1 del adaptador](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v1)
- [v2 GGUF (versión anterior)](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2-GGUF)
- [Modelo base Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA](https://huggingface.co/Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA) (no visitado directamente, referenciado en la card)
