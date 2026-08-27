# Vontra/GLM-5.3-Flash-MLX-oQ2-MTP

## Resumen

Vontra/GLM-5.3-Flash-MLX-oQ2-MTP es una conversión cuantizada en formato MLX del modelo multimodal GLM-5.3-Flash de Z.ai, también conocido como "Ox Alpha". El checkpoint original, desarrollado por Z.ai (Zhipu AI), es un modelo de mezcla de expertos (MoE) con aproximadamente 320 mil millones de parámetros totales y 18 mil millones activos, diseñado para tareas de texto e imagen. Esta versión concreta, creada por el usuario Vontra, aplica una cuantización mixta de precisión guiada por sensibilidad (oQ2) que reduce el peso efectivo a 2,67 bits por parámetro, manteniendo la capa nativa de predicción del siguiente token (MTP) para decodificación especulativa.

El modelo destaca por su arquitectura `glm5_next`, que combina atención lineal y dispersa (sparse attention), hiperconexiones con restricciones de variedad y una capa MTP integrada. Con una ventana de contexto configurada de 1.048.576 tokens, está orientado a aplicaciones de razonamiento largo, agentes autónomos y generación multimodal. Su licencia MIT permite uso comercial sin restricciones, y al estar en formato MLX safetensors, está optimizado para ejecutarse en hardware Apple Silicon mediante el ecosistema oMLX.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada de alto rendimiento para desarrolladores que trabajan con MLX y necesitan un modelo multimodal de gran contexto en equipos Apple, con la ventaja de conservar la capacidad de decodificación especulativa nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm5_next`, multimodal sparse MoE con atención híbrida lineal y dispersa |
| Parametros totales | 32.888.609.630 (checkpoint cuantizado; el modelo base tiene ~320B) |
| Parametros activos | 18B (según documentación de Unsloth para el modelo base) |
| Longitud de contexto | 1.048.576 tokens (configurado) |
| Tipos de cuantizacion | oQ2 mixto: 126 módulos Q2, 3 módulos Q4, 554 módulos Q8; visión en BF16; planificación efectiva de 2,67 bits por peso |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (22 shards, 110,1 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura de mezcla de expertos dispersa multimodal con atención híbrida: combina atención lineal para capturar dependencias globales con atención dispersa para eficiencia en secuencias largas. Incorpora hiperconexiones con restricciones de variedad (manifold-constrained hyper-connections) y una capa nativa de predicción del siguiente token (MTP) integrada en el propio transformer, lo que permite decodificación especulativa sin necesidad de un modelo draft externo. El checkpoint cuantizado de Vontra conserva esta capa MTP, aunque el runtime la trata como experimental a profundidad 1.

El entrenamiento del modelo original no está detallado en la información disponible, pero se sabe que Z.ai lo lanzó inicialmente de forma anónima como "Ox Alpha" y posteriormente reveló su identidad. La cuantización aplicada por Vontra es solo de pesos (weight-only post-training quantisation), sin reentrenamiento ni fine-tuning. El proceso utiliza un proxy de calibración de 4 bits para medir la sensibilidad de 45 capas y asigna presupuestos de precisión variables: los indexadores dispersos obligatorios (36 proyecciones) se mantienen en Q8 con grupo de tamaño 64, mientras que los expertos enrutados se reparten entre Q2 y Q8, y tres proyecciones del switch-MLP de MTP usan Q4. El encoder de visión y el proyector se conservan íntegramente en BF16.

## Capacidades

- Generación de texto e imagen (image-text-to-text): acepta entradas multimodales y produce respuestas textuales, con soporte para razonamiento visual.
- Razonamiento de contexto largo: ventana de 1.048.576 tokens, adecuada para documentos extensos, conversaciones multi-turno y análisis de código de gran tamaño.
- Decodificación especulativa nativa (MTP): capa de predicción del siguiente token integrada, que acelera la inferencia sin modelo draft externo (experimental en este checkpoint).
- Tool calling y function calling: el modelo base soporta invocación de herramientas, aunque no se especifica en la documentación de esta variante cuantizada.
- Capacidades de agente: según la documentación de Unsloth, GLM-5.3-Flash se acerca a Claude Opus 4.8 en benchmarks de coding y agentes, lo que sugiere aptitud para tareas multi-paso.
- Multilingüe: inglés y chino, con posible generalización a otros idiomas no verificada.
- Soporte de visión: el encoder de visión se mantiene en BF16, lo que preserva la calidad de procesamiento de imágenes.

## Casos de uso

- Análisis de documentos extensos: con 1.048.576 tokens de contexto, puede procesar libros técnicos completos, expedientes legales o informes financieros de cientos de páginas en una sola pasada, resumiendo y extrayendo información relevante sin fragmentación.
- Asistente de programación en producción: gracias a su rendimiento en benchmarks de coding y su soporte de tool calling, puede integrarse en entornos de desarrollo como autocompletado avanzado, generación de tests o revisión de pull requests, ejecutándose localmente en estaciones Apple Silicon.
- Agente autónomo de atención al cliente: la combinación de contexto largo y capacidades multimodales permite gestionar conversaciones multi-turno con historial extenso, interpretar capturas de pantalla o imágenes enviadas por el usuario y derivar a herramientas externas cuando sea necesario.
- Investigación académica multilingüe: al soportar inglés y chino, facilita la traducción y el análisis comparativo de literatura científica en ambos idiomas, incluyendo la interpretación de figuras y tablas en artículos.
- Generación de informes con datos visuales: puede recibir gráficos, diagramas o fotografías y producir descripciones detalladas, análisis o resúmenes ejecutivos, útil en consultoría o periodismo de datos.
- Prototipado de aplicaciones de visión por computador: el encoder de visión en BF16 permite experimentar con tareas de captioning de imágenes o respuesta visual a preguntas (VQA) sin necesidad de GPUs dedicadas, usando únicamente hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de Unsloth menciona que GLM-5.3-Flash supera a GLM-5.2 y se acerca a Claude Opus 4.8 en coding y agentes, pero no se proporcionan cifras concretas. El rendimiento medido en este checkpoint cuantizado se limita a pruebas de throughput en Apple M3 Studio:

| Modo | Runs | Output por run | Throughput sostenido |
|---|---|---|---|
| MTP desactivado | 3 | 512 tokens | 6,1440 tok/s (mediana) |
| MTP desactivado, par emparejado | 1 | 512 tokens | 6,1287 tok/s |
| MTP nativo, profundidad 1, par emparejado | 1 | 512 tokens | 6,5629 tok/s |

Estos datos provienen de la model card del autor y corresponden a una configuración específica de hardware y software.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 110,1 GB en disco, pero al ser MLX, la memoria unificada de Apple Silicon es la que determina la viabilidad. Se recomienda un mínimo de 128 GB de memoria unificada para cargar el modelo completo en FP16/BF16; con la cuantización oQ2, el uso efectivo de memoria es menor, aunque no se especifica el valor exacto.
- GPU recomendadas: Apple M3 Studio (usado en las pruebas), M3 Ultra o M4 Max con 128 GB o más de memoria unificada. No está diseñado para GPUs NVIDIA o AMD, ya que el formato MLX es exclusivo de Apple Silicon.
- Compatibilidad con consumer GPU: no aplica; MLX solo funciona en Apple Silicon. En otras plataformas habría que usar el modelo base en formato original (FP8) con vLLM u otros runners.
- Opciones de despliegue: oMLX 0.6.3rc3 (build 2475), MLX 0.32.0, mlx-lm 0.31.3, mlx-vlm 0.6.3. Se recomienda usar estas versiones exactas para garantizar compatibilidad con la arquitectura `glm5_next` y la cuantización oQ.
- Latencia y throughput: en Apple M3 Studio, el throughput sostenido es de aproximadamente 6,1-6,6 tokens por segundo para generación de 512 tokens, dependiendo de si MTP está activo o no.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vontra/GLM-5.3-Flash-MLX-oQ2-MTP | 32,9B (cuantizado) | 1.048.576 | MIT | MLX safetensors | Cuantización oQ2, MTP nativo |
| Vontra/GLM-5.3-Flash-MLX-oQ4-MTP | no disponible | no disponible | MIT | MLX safetensors | Variante con cuantización oQ4 del mismo autor |
| Vontra/GLM-5.3-Flash-MLX-4bit-MTP | no disponible | no disponible | MIT | MLX safetensors | Variante con cuantización 4-bit estándar |
| zai-org/GLM-5.3-Flash (base) | ~320B | 1.048.576 | MIT | FP8 | Modelo original, requiere GPUs o hardware específico |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá del throughput reportado para la versión oQ2.

## Limitaciones y advertencias

- La capa MTP nativa es experimental en el runtime probado: produce salida coherente y mayor throughput, pero no es token-idéntica a la generación sin MTP en una ejecución greedy de 512 tokens. Para reproducibilidad determinista, se recomienda desactivar MTP.
- El modelo solo soporta inglés y chino de forma verificada; otros idiomas pueden funcionar pero no están garantizados.
- La cuantización oQ2 introduce pérdida de precisión respecto al modelo original en FP8. Aunque la guía por sensibilidad intenta mitigar el daño, tareas de alta precisión numérica o razonamiento matemático complejo pueden degradarse.
- El checkpoint requiere versiones específicas de oMLX, MLX, mlx-lm y mlx-vlm; versiones anteriores o posteriores pueden no entender la arquitectura `glm5_next` o los metadatos de cuantización oQ.
- El tamaño del repositorio (110,1 GB) implica una descarga considerable y requiere espacio de almacenamiento significativo.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante cuantizada, por lo que su rendimiento real en tareas específicas es incierto.
- El modelo base fue entrenado con datos que pueden contener sesgos; la cuantización no corrige estos sesgos y podrían amplificarse en ciertos contextos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento de contexto largo donde la información contradictoria puede inducir errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ2-MTP
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de Z.ai sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico (arXiv): https://arxiv.org/abs/2602.15763
- Repositorio MLX: https://github.com/ml-explore/mlx
- Variante oQ4: https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ4-MTP
- Variante 4-bit: https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-4bit-MTP
- Documentación de Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Artículo de ExplainX sobre el lanzamiento: https://www.explainx.ai/blog/glm-5-3-flash-ox-alpha-official-launch-august-2026
- Análisis de XenoSpectrum: https://xenospectrum.com/en/z-ai-ox-alpha-reveal/
