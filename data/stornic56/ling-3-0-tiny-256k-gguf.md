# stornic56/Ling-3.0-tiny-256K-GGUF

## Resumen

Ling-3.0-tiny-256K-GGUF es una colección de cuantizaciones GGUF del modelo Ling-3.0-tiny desarrollado por inclusionAI, publicada por el usuario stornic56. Se trata de un modelo de mezcla de expertos (MoE) con 7,89 mil millones de parámetros totales y aproximadamente 1,3 mil millones activos por token, construido sobre la arquitectura propietaria `bailingmoe3`, que combina atención híbrida: bloques KDA (Kimi Delta Attention) con estado recurrente de tamano fijo y bloques MLA (Multi-head Latent Attention) con latente de KV comprimido. El modelo base tiene una ventana nativa de 131.072 tokens y, según la documentación del autor de la cuantización, la receta oficial de despliegue la extiende a 262.144 tokens mediante YaRN con factor 2.0.

El valor diferencial de esta publicación no está en el modelo base, sino en el trabajo de cuantización. El autor incorpora directamente en los metadatos GGUF la configuración YaRN recomendada por los mantenedores, de modo que la ventana validada de 262.144 tokens queda disponible en llama.cpp sin necesidad de pasar flags en tiempo de ejecución. Además, la importance matrix se ha calibrado con un corpus bilingüe espanol/inglés de aproximadamente 1,67 millones de tokens y se aplica un mapa de precisión por tensor fundamentado en cómo propaga el error de cuantización en esta arquitectura híbrida concreta.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un MoE de 7,9B con solo 1,3B de parámetros activos en hardware de consumo (desde 4 GB de VRAM en las cuantizaciones más agresivas), lo que abarata mucho la inferencia; por otro, la calibración específica para espanol e inglés y el escalón de contexto largo lo hacen atractivo para cargas de trabajo en castellano que requieren ventanas extensas. La licencia del modelo base es MIT, lo que facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailingmoe3`, híbrida KDA + MLA + MoE |
| Parametros totales | 7.893.392.800 (7,89B) |
| Parametros activos | ~1,3B por token |
| Longitud de contexto | 262.144 tokens (extendida desde 131.072 mediante YaRN, factor 2.0; la arquitectura soporta hasta 1M según el autor) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, IQ2_M |
| Idiomas soportados | Bilingüe espanol/inglés (el campo de idiomas de HuggingFace no está disponible) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Bloques KDA | 18 (bloques 0–2, 4–6, 8–10, 12–14, 16–18, 20–22) |
| Bloques MLA | 6 (bloques 3, 7, 11, 15, 19, 23) |
| Expertos por capa MoE | 128 enrutados, 8 activos por token, 1 compartido |
| rope_theta nativo | 6.000.000 |
| Herramienta de cuantizacion | llama.cpp 0.4.0-dev, build 10902, commit df03399b8 |
| Modelo base | inclusionAI/Ling-3.0-tiny |

## Arquitectura y entrenamiento

La arquitectura `bailingmoe3` es híbrida en dos sentidos. En primer lugar, alterna atención recurrente y atención con caché: 18 bloques usan KDA (Kimi Delta Attention), que mantiene un estado recurrente de tamano fijo que no crece con la longitud del contexto, y 6 bloques (3, 7, 11, 15, 19 y 23) usan MLA (Multi-head Latent Attention) con un latente de KV comprimido. Esta distribución respeta el apilamiento alterno 3:1 documentado oficialmente por los mantenedores. En segundo lugar, la capa de alimentación hacia adelante es de tipo MoE en todas las capas salvo la bloque 0, que emplea una FFN densa: cada capa MoE dispone de 128 expertos enrutados, 8 activos por token y un experto compartido activo en todos los tokens. El resultado es un modelo de 7,89B de parámetros con un coste de cómputo por token correspondiente a unos 1,3B, lo que explica su velocidad de inferencia.

El modelo base tiene una ventana nativa de 131.072 tokens y la arquitectura está disenada, según la documentación, para soportar hasta 1M. La receta de despliegue recomendada por los mantenedores extiende la ventana a 262.144 tokens aplicando YaRN con factor 2.0 sobre un `rope_theta` de 6.000.000; la evaluación Terminal-Bench 2.1 se realizó en esa ventana, lo que convierte 262.144 tokens en el punto de operación validado. Las cuantizaciones GGUF de la comunidad suelen distribuirse solo con la ventana nativa, pero esta publicación incrusta la configuración YaRN en los metadatos, de modo que el usuario de llama.cpp obtiene la ventana extendida sin flags adicionales.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla el esquema de decodificación especulativa, si lo hubiera. Lo que sí se documenta es el proceso de cuantización: importance matrix calibrada con un corpus bilingüe espanol/inglés de ~1,67 millones de tokens, mapa de precisión por tensor dependiente de la arquitectura, y verificación de perplejidad sobre conjuntos reservados en ambos idiomas. El formato de prompt, embebido en los ficheros y aplicado automáticamente por `llama-server --jinja`, es:

```
<role>SYSTEM</role>{system_prompt}
detailed thinking on<|role_end|><role>HUMAN</role>{prompt}<|role_end|><role>ASSISTANT</role>
```

## Capacidades

- Generación de texto conversacional multilingüe en espanol e inglés, con plantilla de chat embebida y activación de modo de razonamiento explícito mediante la directiva `detailed thinking on`.
- Razonamiento multi-paso dentro de la misma ventana de contexto, con soporte de hasta 262.144 tokens validados.
- Procesamiento de contexto largo con coste de memoria controlado: solo los 6 bloques MLA mantienen caché KV, mientras que los 18 bloques KDA conservan un estado recurrente de tamano fijo.
- Capacidades bilingües espanol/inglés reforzadas por la calibración de la importance matrix, que se realizó sobre corpus de ambos idiomas.
- Inferencia eficiente: con ~1,3B de parámetros activos por token, el coste por token es muy inferior al de un modelo denso de 7,9B.
- Compatibilidad con llama.cpp y `llama-server --jinja` para uso conversacional con plantilla automática.
- Uso comercial permitido por la licencia MIT del modelo base.
- No se documentan capacidades de visión, audio ni otras modalidades distintas del texto.
- No se documenta de forma explícita soporte de tool calling o function calling nativo; la información disponible no lo confirma.

## Casos de uso

- Atención al cliente automatizada en espanol: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262.144 tokens y a su plantilla de chat embebida, y el coste de inferencia se mantiene bajo por los ~1,3B de parámetros activos por token.
- Análisis de documentos extensos (contratos, informes, expedientes) que superan los 128K tokens: la extensión YaRN incrustada en los metadatos permite procesar el documento completo en una sola pasada sin troceado ni recuperación externa.
- Asistentes locales en hardware de consumo: una cuantización Q4_K_M de 4,6 GB cabe en GPUs con 6–8 GB de VRAM, lo que habilita despliegues de escritorio o en portátiles con GPU discreta moderada.
- Traducción y adaptación de contenido espanol-inglés: la calibración bilingüe de la importance matrix reduce la degradación de perplejidad en ambos idiomas, lo que resulta adecuado para pipelines de localización.
- Generación de texto en producción con latencia baja: los ~1,3B de parámetros activos por token permiten throughput alto por unidad de cómputo en comparación con modelos densos del mismo tamano total.
- RAG sobre corpus largos: la ventana de 262.144 tokens permite inyectar muchos pasajes recuperados en un único prompt, reduciendo la necesidad de reordenación agresiva o de resumen intermedio.
- Agentes de razonamiento multi-paso: el modo `detailed thinking on` de la plantilla permite separar la traza de razonamiento de la respuesta final en flujos de varios turnos.
- Evaluación e investigación de arquitecturas híbridas MoE con atención recurrente: la publicación permite reproducir el comportamiento de KDA + MLA en llama.cpp sin necesidad de infraestructura propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación Terminal-Bench 2.1 del modelo base se realizó con la ventana de 262.144 tokens, pero no se proporcionan las puntuaciones obtenidas. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de otras suites estándar.

El único dato cuantitativo disponible es la variación de perplejidad de cada cuantización respecto a BF16, medida sobre conjuntos reservados en espanol e inglés:

| Cuantizacion | Tamano | Δ perplejidad ES vs BF16 | Δ perplejidad EN vs BF16 | Notas |
|---|---|---|---|---|
| bf16 | 15,80 GB | Referencia | Referencia | Línea base |
| Q8_0 | 7,9 GB | Paridad con Q6_K | Paridad con Q6_K | Casi sin pérdida |
| Q6_K | 6,3 GB | Estadísticamente idéntica a Q8_0 | Estadísticamente idéntica a Q8_0 | Calidad muy alta |
| Q5_K_M | 5,4 GB | Iguala o mejora BF16 | Iguala o mejora BF16 | Único nivel que iguala BF16 en ambos idiomas |
| Q4_K_M | 4,6 GB | +0,3% | +1,7% | Valor práctico por defecto |
| IQ4_XS | 4,4 GB | No disponible | Mejor que Q4_K_M | 0,22 GB menos que Q4_K_M |
| IQ3_M | 3,7 GB | +3,9% | +1,6% | Nivel más bajo con degradación controlada |
| IQ2_M | 2,9 GB | +20,6% | +9,3% | No recomendado para tareas de razonamiento |

## Requisitos de hardware

- VRAM estimada para los pesos (contexto moderado): 16 GB o CPU para bf16 (15,80 GB); 10–12 GB para Q8_0 (7,9 GB); 8–10 GB para Q6_K (6,3 GB); 8 GB para Q5_K_M (5,4 GB); 6–8 GB para Q4_K_M (4,6 GB); 6 GB para IQ4_XS (4,4 GB); 4–6 GB para IQ3_M (3,7 GB); 4 GB para IQ2_M (2,9 GB).
- Caché KV: en la ventana completa de 262.144 tokens hay que presupuestar aproximadamente 1,8 GB adicionales en f16. Solo los 6 bloques MLA mantienen caché; los 18 bloques KDA usan un estado recurrente de tamano fijo que no crece con la longitud del contexto. La caché puede reducirse con `--cache-type-k q8_0`.
- GPU de consumo: el modelo cabe en GPUs consumer. Q4_K_M e IQ4_XS encajan en tarjetas de 6–8 GB, y las cuantizaciones IQ3_M e IQ2_M se ajustan a entornos de 4 GB. Las variantes Q6_K, Q8_0 y bf16 requieren GPUs de gama alta o profesionales (16 GB o más).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para las cuantizaciones de 4 y 5 bits; para bf16 se necesita una GPU de 16 GB o superior, o bien ejecución en CPU. No se proporcionan recomendaciones específicas de modelos de GPU (A100, H100, RTX 4090) en la información disponible.
- Opciones de despliegue: llama.cpp, con cuantizaciones generadas por la build 10902 (commit df03399b8). Para uso conversacional con plantilla automática se usa `llama-server --jinja`. No se documentan otras opciones como vLLM, TGI u Ollama para estos ficheros GGUF.
- Latencia y throughput: no disponibles. No se han publicado cifras de tokens por segundo ni de latencia por petición en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (MoE de ~7–8B totales con contexto largo). La única comparación cuantitativa disponible es interna al propio modelo, entre sus distintos niveles de cuantización, que se recoge en la tabla de la sección de benchmarks. Como referencia de categoría, el modelo base es `inclusionAI/Ling-3.0-tiny`, un MoE de 7,89B totales con ~1,3B activos y arquitectura híbrida KDA + MLA, pero no se dispone de tablas comparativas frente a alternativas con las que contrastar contexto, licencia o rendimiento.

## Limitaciones y advertencias

- La cuantización IQ2_M no es apta para razonamiento: registra un incremento de perplejidad del +20,6% en espanol y del +9,3% en inglés respecto a BF16. El propio autor la desaconseja para tareas de razonamiento.
- Las cuantizaciones IQ3_M e inferiores degradan la perplejidad en espanol de forma más acusada que en inglés (+3,9% frente a +1,6% en IQ3_M), lo que puede penalizar aplicaciones en castellano.
- El resultado no monotónico de Q5_K_M (que iguala o mejora BF16) procede de mediciones del autor y no está respaldado por benchmarks publicados independientes; conviene validarlo en el caso de uso concreto.
- El modelo base está calibrado y orientado a espanol e inglés. No hay información sobre su rendimiento en otros idiomas, y no debe asumirse cobertura multilingüe amplia.
- No se documentan sesgos conocidos, riesgos específicos de alucinación ni evaluaciones de seguridad. Como en cualquier modelo de generación de texto, existe riesgo de alucinación y de sesgo, pero no se aportan datos cuantitativos al respecto.
- No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre fases de alineación (RLHF, DPO), por lo que no es posible evaluar riesgos derivados de la composición de los datos.
- La licencia es MIT, lo que permite uso comercial sin restricciones adicionales. Conviene verificar igualmente las condiciones del modelo base `inclusionAI/Ling-3.0-tiny`, ya que la cuantización hereda sus términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de septiembre de 2026. La ausencia de adopción y de validación por terceros implica que los datos de perplejidad y de calidad de las cuantizaciones no han sido replicados de forma independiente.
- La extensión de contexto a 262.144 tokens depende de la configuración YaRN incrustada en los metadatos y de que el runtime de llama.cpp la interprete correctamente. Ejecutar estos ficheros en versiones antiguas o en runtimes alternativos puede degradar la calidad en contextos largos.
- No se documenta soporte explícito de tool calling, function calling ni protocolos de agentes, por lo que no debe asumirse su disponibilidad en producción sin verificarla.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Fichero bf16: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF/blob/main/Ling-3.0-tiny-256K-bf16.gguf
- Fichero Q8_0: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF/blob/main/Ling-3.0-tiny-256K-Q8_0.gguf
- Fichero Q6_K: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF/blob/main/Ling-3.0-tiny-256K-Q6_K.gguf
- Fichero Q4_K_M: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF/blob/main/Ling-3.0-tiny-256K-Q4_K_M.gguf
- Fichero IQ4_XS: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF/blob/main/Ling-3.0-tiny-256K-IQ4_XS.gguf
- Fichero IQ3_M: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF/blob/main/Ling-3.0-tiny-256K-IQ3_M.gguf
- Fichero IQ2_M: https://huggingface.co/stornic56/Ling-3.0-tiny-256K-GGUF/blob/main/Ling-3.0-tiny-256K-IQ2_M.gguf
- Referencias arXiv declaradas en las etiquetas del repositorio (contenido no verificado): arXiv:2309.00071, arXiv:2601.14277, arXiv:2504.04823, arXiv:2505.02390, arXiv:2210.17323, arXiv:2608.27513, arXiv:2601.18306
