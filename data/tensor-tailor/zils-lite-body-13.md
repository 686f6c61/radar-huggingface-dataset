# tensor-tailor/zils-lite-body-13

## Resumen

zils-lite-body-13 es un fine-tune de la familia Qwen3.5-0.8B publicado por el usuario tensor-tailor dentro del ecosistema Zils, un pool de modelos "soup" asociado al subnet 127 de Bittensor. Se trata de un "decision body" (cuerpo de decisión) construido a partir del soup d3-lite de la ronda d3-lite-2026-11-10, que a su vez es la media uniforme de dos miembros: Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9. Sobre ese punto de partida, el autor aplica una única modificación propia: la diferencia de pesos resultante de un fine-tune LoRA sobre decision-v9, sumada una sola vez con factor 1.0 al soup reconstruido.

El modelo tiene 852.985.920 parámetros totales (aproximadamente 0,85 mil millones) y un tamaño de repositorio de 1,7 GB en formato safetensors con código personalizado (custom_code). Está pensado para tareas de decisión estructurada: elección entre opciones, preguntas de sí/no y puntuación de candidatos, enmarcadas en las 15 familias "conocidas" del examen Zils (5 categorías por 3 formatos de respuesta). La licencia es Apache-2.0 y el modelo se distribuye sin pipeline declarado ni idiomas especificados en la model card.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de ingeniería de "soup + delta LoRA" en un contexto de minería descentralizada; por otro, ilustra las prácticas de trazabilidad (hashes de soup, digests de cuerpo, auditoría de etiquetas) que este ecosistema exige. No obstante, la información pública disponible es limitada: no hay benchmarks, no hay datos de contexto declarados y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5-0.8B, con capas Gated-DeltaNet y proyecciones MLP gate/up/down (según la descripción del fine-tune LoRA) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó máximo 2.048 tokens, pero no se declara la ventana de inferencia) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.5-0.8B y hereda su arquitectura transformer decoder-only. La model card menciona explícitamente que el fine-tune LoRA se aplicó sobre las proyecciones de atención, las capas Gated-DeltaNet y las proyecciones MLP (gate, up, down) de todas las capas de lenguaje. La presencia de Gated-DeltaNet sugiere un componente de atención lineal o híbrida dentro del bloque, aunque la model card no detalla la proporción ni la disposición exacta de estas capas. El contexto de entrenamiento se fijó en 2.048 tokens como máximo.

El entrenamiento consistió en un LoRA de rango 32, alpha 64, sin dropout, con AdamW (learning rate 5e-5, weight decay 1.0, epsilon 1e-4, clip de norma de gradiente 1.0), decaimiento coseno con warm-up de 50 pasos, 2 épocas (438 pasos) y semilla 5002. El conjunto de datos tiene 876 filas en las 15 familias del examen Zils, con una regla de dificultad que solo admitía filas donde el cuerpo de partida (decision-v9) asignaba entre 0,30 y 0,80 de probabilidad a la respuesta correcta. La pérdida combina entropía cruzada sobre la etiqueta dorada, un término de Brier en filas de elección y sí/no, un término de probabilidad rankeada normalizada en filas de puntuación, y un término KL (peso 0,1) hacia la distribución del cuerpo de partida. Además, cada batch de 8 filas incluía 4 "hold rows" (una por cada una de las otras cuatro categorías) con peso 30, cuyo objetivo era la distribución de respuesta del cuerpo de partida calculada en vivo con el adaptador desactivado, para penalizar cambios en las respuestas ya existentes.

La innovación técnica destacable es el mecanismo de "hold-anchored fine-tune": el modelo no se entrena solo para acertar las filas etiquetadas, sino para preservar la distribución de salida del modelo base en prompts de otras categorías. El cuerpo final se obtiene sumando la diferencia de pesos (fine-tune menos decision-v9) al soup reconstruido, sin promediar con otras ejecuciones propias ni fusionar otros cuerpos.

## Capacidades

- Generación de texto y respuestas de decisión en formato de elección múltiple, sí/no y puntuación de candidatos.
- Razonamiento sobre las 15 familias "conocidas" del examen Zils: reasoning, language, retrieval, tools y arts, cada una en los tres formatos de respuesta.
- Manejo de diálogo estructurado y llamadas a funciones, gracias a las filas derivadas de Schema-Guided Dialogue (DSTC8) con selección de función y verificación de esquema.
- Comprensión de inferencia textual y vínculo entre frases (MultiNLI, SNLI, QNLI, SQuAD 2.0).
- Razonamiento físico y sentido común (PIQA, Social IQa).
- Capacidad multilingüe: no disponible (no se declara).
- Tool calling / function calling: parcialmente cubierto por el entrenamiento en selección de función y listas de funciones, aunque no se documenta una interfaz de tool calling estándar.
- Agentes y razonamiento multi-paso: no disponible (no se declara soporte explícito).
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- **Enrutamiento de decisiones en pipelines de agentes**: el modelo puede clasificar una consulta entrante en una de varias opciones predefinidas (elección múltiple) o responder sí/no a condiciones de negocio, aprovechando su entrenamiento en las familias de elección y sí/no del examen Zils. Es adecuado porque su fine-tune está anclado a preservar respuestas previas en categorías no etiquetadas, lo que reduce la deriva en producción.
- **Selección de función en asistentes conversacionales**: dado un diálogo y un catálogo de funciones, el modelo elige la función correcta y verifica la lista de funciones disponibles, gracias a las 166 filas program-built de DSTC8. Se usaría como paso previo a un orquestador de tool calling.
- **Puntuación de candidatos en sistemas de recuperación**: el modelo puede asignar puntuaciones normalizadas a pares pregunta-respuesta o pregunta-pasaje, útil para re-ranking en pipelines RAG. Las filas de SQuAD 2.0 y QNLI del entrenamiento respaldan esta tarea.
- **Verificación de consistencia en diálogos multi-turno**: con las filas de DSTC8 sobre estado de diálogo y ranuras requeridas, el modelo puede comprobar si un estado acumulado cumple las ranuras obligatorias antes de emitir una llamada al sistema.
- **Moderación o filtrado por pares de inferencia**: las filas de MultiNLI y SNLI permiten usar el modelo para decidir si una frase implica, neutraliza o contradice otra, aplicable a deduplicación de contenido o detección de contradicciones en bases documentales.
- **Evaluación de sentido común en asistentes educativos**: con PIQA y Social IQa, el modelo puede validar si un procedimiento mostrado es correcto o si una reacción social es adecuada, en escenarios de tutoría automatizada.
- **Prototipado rápido en entornos con recursos limitados**: con 0,85 mil millones de parámetros y pesos safetensors de 1,7 GB, el modelo cabe en GPUs de consumo para experimentación, aunque no se documentan cuantizaciones oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (0,85 B de parámetros), en fp16 serían aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en fp32, unos 3,4 GB.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores en fp16, y en A100/H100 para despliegues por lotes.
- Cabe en consumer GPU: previsiblemente sí, en modelos con al menos 4-6 GB de VRAM en fp16, aunque no hay confirmación oficial.
- Opciones de despliegue: no disponible. El repositorio usa custom_code, lo que puede requerir `trust_remote_code=True` en transformers; no se listan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensor-tailor/zils-lite-body-13 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune anclado sobre soup d3-lite |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 | Hugging Face | Miembro del soup base |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Hugging Face | Miembro del soup base y origen del LoRA |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face | Familia base declarada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados. El entrenamiento usa datasets con anotaciones humanas (MultiNLI, Social IQa, PIQA, SQuAD, DSTC8), que pueden arrastrar sesgos de sus fuentes originales; no se declara ninguna auditoría de sesgo.
- **Riesgo de alucinación**: no evaluado. Al ser un modelo de decisión sobre opciones cerradas, el riesgo es menor que en generación abierta, pero no hay datos de calibración publicados.
- **Limitaciones de contexto e idioma**: el entrenamiento se limita a 2.048 tokens y no se declara la ventana de inferencia ni los idiomas soportados. El uso fuera del inglés no está garantizado.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo incorpora pesos derivados de datasets con licencias variadas (CC BY-SA 4.0, AFL-3.0, OANC, CC BY-SA 3.0 / CC BY 3.0). La model card no aclara si esas obligaciones de atribución o share-alike se trasladan al modelo entrenado; conviene revisar el NOTICE referenciado.
- **Código personalizado**: el repositorio usa `custom_code`, lo que implica confiar en código del autor al cargar el modelo con transformers (`trust_remote_code=True`). No se ha auditado públicamente.
- **Trazabilidad dependiente de hashes**: la validez del cuerpo depende de que el soup reconstruido coincida con el hash publicado (4d23ec5a...), lo que el autor afirma pero no es verificable sin reproducir el proceso.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin benchmarks ni demos públicas. No recomendable para producción sin evaluación propia.
- **Alcance limitado**: es un "decision body" para el examen Zils, no un modelo de propósito general; su rendimiento fuera de las 15 familias entrenadas es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-13
- Modelo base miembro del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base del LoRA: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Dataset DSTC8 Schema-Guided Dialogue: https://github.com/google-research-datasets/dstc8-schema-guided-dialogue
- MultiNLI: https://cims.nyu.edu/~sbowman/multinli/
- PIQA: https://yonatanbisk.com/piqa/
- SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- Paper, blog o demo oficial de zils-lite-body-13: no disponible
- Repositorio del código oficial del soup Zils: no disponible en la información proporcionada
