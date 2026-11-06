# vultr/Qwen3.5-122B-A10B-GGUF

## Resumen

Qwen3.5-122B-A10B-GGUF es una cuantización oficial de Vultr del modelo Qwen3.5-122B-A10B, un modelo multimodal de Mixture-of-Experts (MoE) desarrollado por el equipo Qwen. El modelo base combina 122.000 millones de parámetros totales con solo 10.000 millones activos por token, lo que permite obtener calidad de razonamiento de modelos grandes con coste de inferencia comparable al de un modelo denso de 10B. Su arquitectura híbrida de 48 capas combina Gated DeltaNet con atención completa, e integra un codificador de visión para procesamiento multimodal unificado (image-text-to-text).

La relevancia de esta versión GGUF radica en su portabilidad: permite ejecutar el modelo con llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) sin depender de GPUs de gama alta de centro de datos. Las cuantizaciones son híbridas: en lugar de aplicar una única precisión a toda la red, cada capa recibe una precisión elegida según una puntuación de importancia medida, asignando más bits donde más impactan en la salida. Con una ventana de contexto de 262K tokens ampliable a aproximadamente 1M, el modelo está orientado a razonamiento de contexto largo, comprensión visión-lenguaje y flujos agénticos escalables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe, Mixture-of-Experts híbrido (Gated DeltaNet + full attention) |
| Parametros totales | 122.111.526.912 (~122B) |
| Parametros activos | 10B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262K tokens, ampliable a ~1M |
| Tipos de cuantizacion | GGUF híbrido (precision por capa segun puntuacion de importancia; cuantizaciones concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 48 capas híbridas que combinan bloques Gated DeltaNet (una alternativa lineal a la atención que reduce el coste de secuencias muy largas) con capas de atención completa, un diseño pensado para escalar a ventanas de contexto de cientos de miles de tokens manteniendo el coste razonable. La dimensión oculta es de 3.072 con 32 cabezas de atención. El módulo MoE consta de 256 expertos, de los cuales se seleccionan 8 enrutados por token más 1 experto compartido, lo que explica la relación 122B totales / 10B activos. El codificador de visión tiene 27 capas y permite procesamiento unificado de imagen y texto.

Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se ha publicado información en los datos disponibles. En cuanto a la cuantización, Vultr aplica un enfoque de cuantización híbrida: se mide la importancia de cada capa y se asignan precisiones distintas por capa, concentrando los bits en las capas que más influyen en la salida del modelo.

## Capacidades

- Generación de texto conversacional (tag "conversational" en el repositorio).
- Comprensión multimodal imagen-texto (pipeline image-text-to-text) gracias al codificador de visión integrado de 27 capas.
- Razonamiento de contexto largo: ventana nativa de 262K tokens, ampliable a ~1M.
- Diseñado para flujos de trabajo agénticos escalables (según la model card), aunque el soporte concreto de tool calling no está documentado en los datos disponibles.
- Inferencia eficiente con llama.cpp gracias al formato GGUF y a la cuantización híbrida por importancia de capa.
- Idiomas soportados: no disponible en la información proporcionada (la familia Qwen históricamente ofrece buen soporte multilingüe, pero no consta en esta ficha).

## Casos de uso

- **Análisis de documentos extensos**: con 262K tokens de contexto (ampliables a ~1M), permite procesar libros técnicos, contratos completos o bases de código enteras en una sola pasada sin fragmentación, algo inviable con ventanas de 8K-32K.
- **Asistentes con comprensión visual**: el pipeline image-text-to-text permite construir aplicaciones que respondan preguntas sobre capturas de pantalla, diagramas, facturas escaneadas o documentos con imágenes incrustadas.
- **Agentes de múltiples pasos**: la model card destaca los "scalable agentic workflows"; el tamaño activo de 10B reduce el coste por token en bucles de razonamiento largos donde el modelo se invoca decenas de veces.
- **Chatbots de bajo coste con calidad alta**: al activar solo 10B de parámetros por token, ofrece la calidad de un modelo de 122B con latencia y memoria de cómputo cercanas a un modelo denso de 10B, ideal para despliegues conversacionales en producción.
- **Inferencia local o on-premise**: el formato GGUF permite ejecutar el modelo con llama.cpp en servidores propios, útil para organizaciones con requisitos de privacidad de datos que no pueden usar APIs externas.
- **Procesamiento por lotes de contenido multilingüe**: el vocabulario de 248.320 tokens y la base Qwen lo hacen adecuado para tareas de resumen o clasificación masiva de texto, aunque el soporte de idiomas concreto no está documentado.
- **RAG sobre corpus grandes**: la ventana de contexto amplia permite incluir muchos documentos recuperados por token en cada consulta, reduciendo errores de recuperación parcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 299,9 GB en total, por lo que la cuantización completa requiere almacenamiento y memoria acorde. Con cuantizaciones híbridas de precisión media (aproximadamente 4-6 bits efectivos), la VRAM estimada para alojar los 122B de parámetros ronda los 65-90 GB; la cifra exacta por cuantización no está disponible.
- GPU recomendadas: para inferencia en un solo dispositivo, GPUs con 80 GB de VRAM (A100/H100 80GB) o configuraciones multi-GPU (por ejemplo, 2x RTX 3090/4090 con offload de capas a CPU mediante llama.cpp). No cabe en una única GPU de consumo estándar de 24 GB de forma práctica para todo el modelo.
- Con offload parcial a RAM (llama.cpp permite repartir capas entre GPU y CPU), es viable en estaciones de trabajo con 128-256 GB de RAM y una GPU de consumo, a costa de latencia.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio), y herramientas compatibles con GGUF como Ollama o LM Studio. El modelo base en safetensors puede desplegarse con vLLM o TGI, aunque eso queda fuera de este repositorio.
- Throughput estimado: al activar solo 10B de parámetros por token, el cómputo por token es comparable al de un modelo denso de 10B, pero el ancho de banda de memoria necesario para cargar los pesos de expertos limita la velocidad; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B (este, GGUF) | ~122B | 10B | 262K (hasta ~1M) | Sí (visión) | Apache 2.0 |
| Qwen3-30B-A3B | 30B | 3B | 32K-128K según versión | No (versión base) | Apache 2.0 |
| DeepSeek-V2-Lite | 16B | 2,4B | 32K | No | Licencia propia (MIT con restricciones) |
| Llama 3.3 70B (denso) | 70B | 70B | 128K | No | Llama Community License |

Frente a modelos densos de tamaño similar en calidad (como Llama 3.3 70B), Qwen3.5-122B-A10B activa solo 10B de parámetros por token, lo que reduce el coste de inferencia pese a tener más parámetros totales, y añade visión y un contexto mucho mayor. Frente a MoE más pequeños (Qwen3-30B-A3B), ofrece mayor capacidad a cambio de requisitos de memoria notablemente superiores.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento, que no están documentados aquí.
- Riesgo de alucinación: inherente a los LLM; no hay evaluaciones publicadas de este modelo en los datos disponibles, por lo que se recomienda verificación de hechos en usos sensibles.
- Idiomas: el soporte de idiomas no está documentado en el repositorio; conviene validar el rendimiento en castellano antes de producción.
- Contexto: aunque la ventana es de 262K tokens, en GGUF con llama.cpp el uso de contextos muy largos multiplica el consumo de memoria (KV cache), especialmente en cuantizaciones agresivas.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial; las cuantizaciones de Vultr heredan esa licencia.
- La cuantización híbrida por importancia de capa puede introducir degradación de calidad respecto al modelo base en FP16/BF16; no se han publicado evaluaciones comparativas de esa degradación.
- Descargas del repositorio muy bajas (346 en el momento de la ficha) y 0 likes: comunidad de usuarios aún reducida, lo que implica menos soporte y menos issues resueltos en caso de problemas con llama.cpp.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vultr/Qwen3.5-122B-A10B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Vultr (autor de la cuantización): https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/

No se han encontrado enlaces a papers, demos ni repositorios adicionales en la información disponible.
