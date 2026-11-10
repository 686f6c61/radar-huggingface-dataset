# ZAQERIS/ZAQION-12B

## Resumen

ZQN-12B (ZAQION-Dialectic 12B) es un modelo de lenguaje causal presentado por ZAQERIS AI, un grupo de investigación independiente con sede en El Cairo. Según su model card, se ha entrenado desde cero como un "modelo fundacional multi-agente" con una arquitectura propietaria denominada DVMU (Dynamic Virtual Manifold Unfolding), que el autor describe como un mecanismo de expansión dinámica de parámetros virtuales durante la inferencia. La model card declara 12,48 mil millones de parámetros físicos y hasta 20,48 mil millones de parámetros activos virtuales, con una ventana de contexto nativa de 131.072 tokens (128K) ampliable a 256K mediante YaRN.

Existe una discrepancia crítica entre la documentación y los pesos publicados: el recuento real de parámetros del repositorio (safetensors) es de 776.412.160 parámetros, es decir, aproximadamente 0,78 mil millones, muy lejos de los 12,48 mil millones declarados. El tamaño total del repositorio es de 3,1 GB, coherente con un modelo de menos de mil millones de parámetros en precisión de 16 bits, no con un modelo de 12B. Esta ficha recoge ambos datos de forma explícita para que el lector pueda evaluar la fiabilidad de las afirmaciones del autor.

El modelo se distribuye bajo licencia Apache 2.0, con soporte declarado para árabe, inglés y multilingüe, y está etiquetado para generación de texto, razonamiento, matemáticas y código. La relevancia práctica del modelo debe valorarse con cautela: las capacidades anunciadas (motor de deliberación tri-agente, corrección semántica automática, compresión M4-Gold) no están respaldadas por benchmarks publicados ni por artefactos verificables en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm) con mecanismo propietario declarado DVMU (Dynamic Virtual Manifold Unfolding); no verificable en los pesos |
| Parámetros totales | 776.412.160 según safetensors del repositorio; la model card declara 12.483.763.200 (12,48B) |
| Parámetros activos | Hasta 20.483.763.200 declarados por el autor mediante DVMU (no verificable); no es un MoE convencional con routing estático documentado |
| Longitud de contexto | 131.072 tokens nativos (128K); 262.144 (256K) con extensión YaRN, según la model card |
| Tipos de cuantización | No disponible (no se documentan GGUF, AWQ, GPTQ ni otras variantes publicadas) |
| Idiomas soportados | Árabe (ar), inglés (en), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); requiere `trust_remote_code` por el tag `custom_code` |

## Arquitectura y entrenamiento

La model card describe una arquitectura de transformer causal con tres innovaciones propietarias. La primera es el DVMU, que según el autor mantiene una huella de memoria residente constante de 3,34 GB mediante compresión de pesos con una retícula Barnes-Wall de 16 dimensiones (M4-Gold, 2,03 bits por parámetro) y "despliega" subvariedades virtuales adicionales durante la inferencia según la profundidad del prompt: 12,48B en modo conversacional, 15,48B en razonamiento matemático y 20,48B en programación y ciencias. La segunda es un motor de deliberación tri-agente interno (tesis, crítico adversario y árbitro de síntesis) que operaría antes de la proyección de tokens. La tercera es un módulo de corrección semántica automática (ASSC-TIDD) orientado a errores tipográficos en árabe, basado en distancia topológica de teclado.

No se proporcionan datos verificables sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta el proceso de destilación o inicialización. Dado que el recuento real de parámetros (0,78B) contradice las cifras declaradas (12,48B), cualquier afirmación sobre la arquitectura debe tratarse como no confirmada hasta que el autor publique los scripts de conversión, la configuración del modelo o resultados reproducibles. El tag `custom_code` implica que la carga del modelo requiere ejecutar código remoto del repositorio, lo que añade un riesgo de seguridad en entornos de producción.

## Capacidades

- Generación de texto conversacional multi-turno en árabe e inglés.
- Razonamiento matemático y lógico declarado, con un supuesto submanifold dedicado de +3,0B parámetros virtuales.
- Generación de código, incluyendo ejemplos de sistemas (por ejemplo, un rotador de logs atómico en Python con tests).
- Razonamiento dialéctico: la model card describe un ciclo interno tesis-crítico-árbitro para reducir alucinaciones.
- Corrección automática de errores tipográficos y transposiciones fonéticas en árabe (ASSC-TIDD), con solicitud de aclaración cuando la entropía del input supera 0,85.
- Soporte declarado de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: declarado de forma conceptual mediante el motor tri-agente, sin API documentada.
- Capacidades multilingües limitadas a árabe, inglés y uso multilingüe genérico.
- Modo "thinking" o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- **Atención al cliente en árabe dialectal y estándar**: el módulo ASSC-TIDD permitiría tolerar errores tipográficos frecuentes en teclados móviles árabes, manteniendo conversaciones multi-turno con contexto de hasta 128K tokens según la documentación. La idoneidad real depende de validar la calidad del modelo con prompts de producción.
- **Asistencia a la redacción académica en árabe**: dado el énfasis del autor en gramática y retórica árabes (ejemplo de i'rab en la model card), podría emplearse para revisión sintáctica y análisis morfológico, siempre con supervisión humana.
- **Generación de código en pipelines de CI/CD**: el modelo declara capacidad de generar tests unitarios y código de sistemas; podría integrarse como asistente en revisiones de PR, aunque la ausencia de benchmarks de HumanEval o MBPP impide estimar su fiabilidad.
- **Prototipado rápido de agentes conversacionales**: al ser Apache 2.0 y con un peso real de 0,78B, es viable desplegarlo en una GPU de consumo para experimentar con arquitecturas de agentes antes de migrar a modelos mayores.
- **Investigación sobre robustez tipográfica en árabe**: el módulo ASSC-TIDD y la distancia topológica de teclado son un caso de estudio interesante para investigadores de NLP semítico, aunque requeriría reproducir los experimentos del autor.
- **Educación y tutoría en matemáticas básicas**: el modo de razonamiento intermedio (+3,0B virtuales) está orientado a cálculo y álgebra; podría usarse en entornos educativos con validación humana de las respuestas.
- **Despliegue en entornos con VRAM limitada**: con 0,78B parámetros reales, el modelo cabe en GPUs de 4-8 GB en FP16, lo que lo hace accesible para prototipos en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. La model card menciona una "Head-to-Head Comparative Benchmark Matrix" y una cifra de "99,6% robust" en auto-corrección, pero el contenido de la matriz está truncado en la información proporcionada y no se incluyen valores de MMLU, HumanEval, GSM8K ni de evaluaciones en árabe. No se deben asumir cifras no publicadas.

## Requisitos de hardware

- **VRAM estimada (pesos reales de 0,78B)**: aproximadamente 1,6 GB en FP16, 0,8 GB en int8 y 0,4-0,5 GB en cuantización de 4 bits.
- **VRAM estimada según la model card (12,48B declarados)**: unos 25 GB en FP16 y 3,34 GB con la compresión M4-Gold declarada; esta última cifra no es verificable con los artefactos publicados.
- **GPU recomendadas**: para el peso real, cualquier GPU con 4 GB o más (RTX 3050, RTX 4060, T4). Para las capacidades declaradas de 12B, se necesitarían A100 40GB, H100 o RTX 4090 con cuantización.
- **GPU de consumo**: sí, cabe en RTX 3060 12GB, RTX 4060 Ti 16GB y RTX 4090 con el peso real; no cabe en GPUs de 8 GB si se cargan los 12B declarados en FP16.
- **Opciones de despliegue**: transformers con `trust_remote_code=True`; el tag `vllm` sugiere compatibilidad con vLLM, aunque no se documenta configuración específica. No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían conversión manual.
- **Latencia y throughput**: no disponibles. La model card menciona <250 ms para el ciclo tri-agente y <250 ms de respuesta estándar, pero sin metodología reproducible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ZQN-12B (declarado) | 12,48B (20,48B virtuales) | 128K nativo / 256K YaRN | Apache 2.0 | Hugging Face, requiere `trust_remote_code` | Cifras no verificadas; pesos reales de 0,78B |
| Qwen2.5-14B | 14,7B | 128K | Apache 2.0 | Hugging Face, GGUF, vLLM | Benchmark publicado, ecosistema maduro |
| Llama 3.1 8B | 8,03B | 128K | Llama 3.1 Community | Hugging Face, GGUF, Ollama | Multilingüe, benchmarks públicos |
| Mistral Nemo 12B | 12,2B | 128K | Apache 2.0 | Hugging Face, GGUF, vLLM | Buen rendimiento multilingüe |

La comparación con modelos de la misma categoría declarada (12B) es desfavorable para ZQN-12B en términos de verificabilidad: Qwen2.5-14B, Llama 3.1 8B y Mistral Nemo 12B cuentan con benchmarks públicos, cuantizaciones GGUF y soporte en motores de inferencia estándar. ZQN-12B, con 0,78B parámetros reales, se situaría más cerca de modelos como Qwen2.5-0.5B o SmolLM2-1.7B en términos de huella, aunque no hay datos para comparar rendimiento.

## Limitaciones y advertencias

- **Discrepancia de parámetros**: los pesos publicados suman 776.412.160 parámetros, frente a los 12,48B declarados. Cualquier evaluación de capacidades debe hacerse sobre el modelo real, no sobre la documentación.
- **Riesgo de alucinación elevado**: la model card promete respuestas "libres de alucinación" mediante el motor tri-agente, una afirmación no respaldada por benchmarks y que debe tratarse con escepticismo.
- **Código remoto**: el tag `custom_code` obliga a ejecutar código del repositorio al cargar el modelo, lo que supone un riesgo de seguridad en producción; se recomienda auditar el código antes de usarlo.
- **Ausencia de cuantizaciones**: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en llama.cpp, Ollama y entornos de bajos recursos sin trabajo adicional de conversión.
- **Idiomas**: el soporte se limita a árabe, inglés y multilingüe genérico; no se documenta calidad en castellano ni en otras lenguas.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni soporte; al ser un grupo de investigación independiente, no hay SLA.
- **Fecha de creación futura**: el repositorio figura creado el 10 de noviembre de 2026, lo que puede indicar metadatos inconsistentes o un artefacto de publicación; conviene verificar la integridad del repositorio antes de confiar en él.
- **Cero descargas y un solo "like"**: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZAQERIS/ZAQION-12B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
