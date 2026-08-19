# VertexAIco/prism-creative-1-mini

## Resumen

Prism Creative 1 Mini es un modelo compacto de escritura creativa y storytelling, desarrollado por VertexAIco, que parte del modelo base Qwen3-4B-Instruct y se ajusta mediante LoRA sobre un conjunto de datos destilado del modelo GLM 5.2 (accedido a través de NVIDIA NIM). El objetivo es generar narrativa literaria —cuentos, poesía, diálogos, worldbuilding, flash fiction— evitando el registro plano y genérico típico de los asistentes conversacionales.

Con 4B parámetros en su configuración completa (aunque el archivo safetensors del repositorio muestra 628 millones, correspondientes al adaptador LoRA), el modelo está pensado para ejecutarse en hardware modesto, incluyendo Apple Silicon mediante MLX y entornos compatibles con GGUF como llama.cpp u Ollama. Su licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propios.

La relevancia de este modelo radica en ofrecer capacidades de escritura creativa de calidad en un tamaño reducido, lo que lo hace atractivo para desarrolladores que necesitan generación de texto literario sin depender de APIs propietarias ni de infraestructura de alto coste. Aunque su dataset de entrenamiento es limitado (2.500 ejemplos), el proceso de destilación y filtrado busca mantener coherencia y evitar repeticiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct) con adaptadores LoRA |
| Parametros totales | 628.676.096 (según safetensors; el modelo base Qwen3-4B tiene ~4B parámetros, pero el repositorio contiene el adaptador LoRA fusionado o cuantizado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B, no especificada en la documentación) |
| Tipos de cuantizacion | 4-bit MLX, Q4_K_M GGUF |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B-Instruct, un transformer de 4B parámetros con atención causal. El ajuste se realiza mediante LoRA con rango 8 aplicado a 16 capas, durante 6.500 iteraciones. El conjunto de entrenamiento consiste en 2.500 ejemplos generados por el modelo profesor GLM 5.2, distribuidos en 10 categorías: cuentos cortos, esbozos de personajes, líneas de apertura, escenas de diálogo, worldbuilding, poesía, mezclas de género, ejercicios de punto de vista, flash fiction y continuaciones de texto.

Durante el desarrollo se detectaron dos modos de fallo: repetición en formas de longitud fija muy corta (como drabbles de 100 palabras) y uso excesivo de detalles cliché (por ejemplo, una hora concreta en un reloj). Para mitigarlos, se endureció el prompt de generación y se implementó un filtro automático que rechaza salidas con repetición excesiva de 4-gramas o frases marcadas como cliché. La pérdida de validación final fue de 1.064.

No se han publicado detalles sobre el número total de tokens del dataset ni sobre la composición exacta del mismo más allá de las categorías mencionadas.

## Capacidades

- Generación de texto creativo en inglés: cuentos, poesía, diálogos, descripciones de mundos, flash fiction y ejercicios de punto de vista.
- Seguimiento de instrucciones de formato y longitud (por ejemplo, respetar un límite de 100 palabras).
- Producción de salidas coherentes y bien formadas dentro del género solicitado, según la evaluación cualitativa del autor.
- Capacidad para evitar el registro de "asistente genérico", comenzando directamente con la pieza creativa sin preámbulos ni metaconversación.
- No se mencionan capacidades de tool calling, agentes, visión ni soporte multilingüe más allá del inglés.

## Casos de uso

- Generación de contenido narrativo para blogs y redes sociales: el modelo puede producir historias cortas o fragmentos atractivos para publicaciones, ahorrando tiempo de redacción.
- Prototipado de narrativas en videojuegos: los desarrolladores pueden generar diálogos, descripciones de escenarios y líneas argumentales para pruebas de concepto, gracias a su capacidad para mantener coherencia en géneros específicos.
- Asistente de escritura para autores: sirve como generador de ideas, esbozos de personajes o continuaciones de tramas, ofreciendo un primer borrador que el escritor puede pulir.
- Creación de diálogos para chatbots con personalidad: al estar entrenado en escenas de diálogo, puede dotar a asistentes conversacionales de un tono más literario y menos robótico.
- Material educativo narrativo: generación de ejemplos de cuentos o poemas para clases de escritura creativa, con control sobre la longitud y el género.
- Generación de poesía o letras: el modelo produce poemas en diversas formas y estilos, útil para proyectos artísticos o de entretenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación mencionada es una comprobación cualitativa sobre flash fiction, worldbuilding, poesía y diálogo, que arrojó salidas coherentes y sin repeticiones. No hay datos numéricos comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B cuantizado a 4-bit, requiere aproximadamente 3-4 GB de VRAM para inferencia con GGUF Q4_K_M. La versión MLX 4-bit es similar.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutarlo. También funciona en Apple Silicon (M1 o superior) mediante MLX.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de gama media y baja.
- Opciones de despliegue: MLX para Apple Silicon (`mlx-lm`), GGUF para llama.cpp, LM Studio, Ollama y otros runtimes compatibles. También puede servirse mediante endpoints compatibles con Hugging Face.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja en hardware moderno, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva con otros modelos de escritura creativa de tamaño similar. La documentación no incluye benchmarks ni comparaciones con alternativas como Gemma 3 4B, Llama 3.2 3B u otros modelos ajustados para storytelling. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- Puede repetir contenido en formas muy cortas y con restricciones de longitud estrictas (por ejemplo, drabbles de 100 palabras), a pesar de los filtros aplicados.
- Al ser un modelo destilado, hereda ciertos estilos y tendencias del profesor GLM 5.2, lo que puede limitar la originalidad en algunos casos.
- El dataset de entrenamiento es reducido (2.500 ejemplos), lo que puede generar sesgos hacia los géneros y estructuras presentes en esos datos.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones. Como cualquier modelo generativo, puede producir contenido factualmente incorrecto o inapropiado.
- Para uso en producción, se recomienda revisión humana de las salidas, ya que el autor lo describe como "un primer borrador fuerte, no un resultado final".

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VertexAIco/prism-creative-1-mini
- Perfil del autor en Hugging Face: https://huggingface.co/VertexAIco/models
- Otros enlaces de la búsqueda web no son relevantes para este modelo (corresponden a otros proyectos del autor o a documentación de Google Vertex AI).
