# Void1B/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit

## Resumen

El modelo `Void1B/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit` es una conversión a formato MLX con cuantización de 8 bits de un fine-tune realizado por DavidAU sobre la base Qwen3.6-40B. El autor de la conversión es Void1B, y el modelo resultante está pensado para generación de texto, con un énfasis particular en escritura creativa, ficción, roleplay y generación de código, además de un enfoque "uncensored" y "abliterated" (eliminación de capas de rechazo). Se distribuye bajo licencia Apache 2.0 y soporta inglés y chino.

La relevancia de este modelo radica en su combinación de un tamaño considerable (40 mil millones de parámetros) con un ajuste multi-etapa orientado a eliminar restricciones de contenido, lo que lo hace atractivo para casos de uso donde se requiere libertad creativa o respuestas sin filtros. Al estar en formato MLX, está optimizado para ejecutarse en hardware Apple Silicon, aunque también puede convertirse a otros formatos. No se dispone de información pública sobre benchmarks ni detalles arquitectónicos más allá de los heredados de Qwen3.6-40B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.6-40B, sin detalles adicionales disponibles) |
| Parametros totales | 40 mil millones (40B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX), bfloat16 (formato original) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.6-40B, un transformer de 40 mil millones de parámetros, aunque no se proporcionan detalles específicos sobre su diseño (número de capas, dimensiones, mecanismos de atención, etc.). El modelo ha sido sometido a un proceso de fine-tune multi-etapa, tal como indican las etiquetas "multi-stage tuned", utilizando dos conjuntos de datos principales: `TeichAI/claude-4.5-opus-high-reasoning-250x` (que parece contener razonamientos de alta calidad generados por Claude 4.5 Opus) y `DavidAU/PkDick-Deckard-5-Datasets` (un dataset propio del autor, probablemente orientado a escritura creativa y roleplay). Además, se menciona la técnica de "abliteration", que consiste en eliminar o neutralizar las capas del modelo responsables de generar rechazos o negativas, lo que da lugar a un comportamiento "uncensored". No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto libre y creativo, con especial énfasis en escritura de ficción, ciencia ficción, romance y otros géneros narrativos.
- Generación de código, según las etiquetas "coder" y "all use cases".
- Roleplay y narración interactiva, gracias a su ajuste para continuar escenas, generar tramas y subtramas.
- Soporte multilingüe limitado a inglés y chino.
- Comportamiento "uncensored" y "abliterated": no rechaza solicitudes de contenido explícito o controvertido, lo que puede ser útil en entornos de investigación o creativos donde se requiere libertad total.
- No se indica soporte explícito para tool calling, agentes, visión o audio.

## Casos de uso

- Escritura creativa profesional: el modelo puede generar borradores de novelas, cuentos o guiones, manteniendo coherencia narrativa gracias a su ajuste específico en datasets de ficción. Es adecuado para autores que necesitan inspiración o desarrollo de tramas complejas.
- Roleplay en línea: plataformas de chat o juegos de rol pueden integrar este modelo para interpretar personajes con respuestas detalladas y sin restricciones temáticas, mejorando la inmersión del usuario.
- Generación de código en entornos de desarrollo: aunque no se especifican benchmarks, su tamaño y ajuste generalista permiten usarlo como asistente de programación, especialmente en tareas de refactorización o generación de funciones.
- Investigación sobre alineación y censura: al ser un modelo "abliterated", puede utilizarse para estudiar cómo los modelos de lenguaje manejan (o no) contenido sensible, y para comparar comportamientos con versiones censuradas.
- Creación de contenido para juegos narrativos: desarrollo de diálogos, descripciones de escenarios y ramificaciones argumentales en videojuegos o juegos de mesa.
- Traducción y generación de texto en chino e inglés: aunque no es su foco principal, su soporte bilingüe permite usarlo en tareas de redacción o traducción creativa entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo o su variante base.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 40B en cuantización de 8 bits, el peso del modelo ocupa aproximadamente 40 GB. Considerando overhead de activaciones y caché de contexto, se recomienda un mínimo de 48 GB de memoria unificada o VRAM.
- GPU recomendadas: en hardware NVIDIA, se necesitaría una GPU con al menos 48 GB de VRAM, como la A6000, A100 (80 GB) o H100. En Apple Silicon, se requiere un Mac con chip M1 Ultra, M2 Ultra o M3 Ultra con 64 GB o más de memoria unificada.
- En consumer GPU: no es viable en GPUs de consumo típicas (RTX 4090 con 24 GB, por ejemplo) a menos que se aplique una cuantización más agresiva (4-bit), que reduciría el peso a unos 20 GB, pero no se ofrece en este repositorio.
- Opciones de despliegue: al estar en formato MLX, se puede ejecutar directamente con `mlx-lm` en macOS. Para otros entornos, sería necesario convertir los pesos a GGUF (para llama.cpp u Ollama) o a formato estándar de HuggingFace (para vLLM o TGI), aunque no se proporcionan dichas conversiones.
- Latencia y throughput: no se dispone de datos medidos. En un Mac con 64 GB, se puede esperar una generación de varios tokens por segundo, pero depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Como referencia cualitativa, se puede comparar con el modelo base Qwen3.6-40B (sin el fine-tune) y con otros modelos "uncensored" de tamaño similar, como los de la familia Dolphin o NousResearch, pero no hay datos públicos de rendimiento para este modelo concreto. La principal diferencia frente al modelo base es la eliminación de rechazos y el ajuste creativo, mientras que frente a otros modelos uncensored destaca su tamaño (40B) y su licencia Apache 2.0.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido explícito, violento, ofensivo o ilegal sin restricciones. Esto supone un riesgo importante si se despliega en aplicaciones públicas o sin moderación.
- No se dispone de información sobre sesgos específicos, pero al estar entrenado sobre datasets de razonamiento de Claude y datasets creativos, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en tareas de razonamiento o factuales.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones muy largas o documentos extensos.
- Idiomas limitados a inglés y chino; no soporta otros idiomas de forma nativa.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales según la jurisdicción, especialmente si se utiliza para difundir material dañino.
- No se proporcionan garantías de soporte técnico ni mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: [Void1B/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit](https://huggingface.co/Void1B/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit)
- Modelo base (DavidAU): [DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking](https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking)
- Conversión original de mlx-community: [mlx-community/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit](https://huggingface.co/mlx-community/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit)
- Dataset de razonamiento: [TeichAI/claude-4.5-opus-high-reasoning-250x](https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x)
- Dataset de escritura: [DavidAU/PkDick-Deckard-5-Datasets](https://huggingface.co/datasets/DavidAU/PkDick-Deckard-5-Datasets)
