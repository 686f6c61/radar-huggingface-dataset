# xv0y5ncu/gemma-4-26B-A4B-it-GLQ-4bpw

## Resumen

Gemma 4 26B A4B IT es un modelo multimodal desarrollado por Google DeepMind que procesa texto e imagen y genera texto, con arquitectura Mixture-of-Experts (MoE) de 26B parámetros totales y 4B activos por token. Esta ficha cubre la cuantización GLQ a 4.0 bits/peso realizada por xv0y5ncu, que reduce el peso de ~50 GB (bf16) a ~15 GB, manteniendo una fidelidad cercana al original en razonamiento y matemáticas. El modelo base soporta hasta 256K tokens de contexto y más de 140 idiomas, lo que lo convierte en una opción viable para despliegues en GPUs de consumo y entornos con memoria limitada. La cuantización GLQ usa un codebook de celosía E8 con transformada de Hadamard aleatorizada (RHT) y LDLQ, y los pesos se mantienen comprimidos en memoria y se descomprimen en vuelo mediante kernels CUDA fusionados.

La relevancia actual de esta ficha radica en que permite ejecutar un modelo de razonamiento multimodal de 26B en hardware de gama media (por ejemplo, una RTX 3090 con 24 GB) sin pérdida significativa de calidad en tareas de razonamiento, siempre que se use con un presupuesto de tokens de pensamiento generoso. El autor proporciona instrucciones claras de instalación para vLLM y Transformers, y verifica la compatibilidad con agentes de código como pi-code y opencode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal (texto e imagen), Transformer |
| Parametros totales | 26B (modelo base); 7.485.075.406 (pesos cuantizados en safetensors) |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | GLQ 4.0 bpw (E8 shell codebook + RHT + LDLQ) |
| Idiomas soportados | Más de 140 idiomas (modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con cuantizacion GLQ |

## Arquitectura y entrenamiento

El modelo base, google/gemma-4-26B-A4B-it, es un modelo multimodal de Google DeepMind que acepta imágenes y texto como entrada y genera texto como salida. Su arquitectura MoE activa 4B de los 26B parámetros por token, lo que reduce el coste computacional en inferencia. La cuantización GLQ aplica un codebook de celosía E8 (E8-lattice) con transformada de Hadamard aleatorizada (RHT) y LDLQ, logrando una relación señal-ruido media de 18.96 dB sobre 7885 capas cuantizadas. La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2. Los pesos se almacenan comprimidos en memoria y se descomprimen en tiempo de ejecución mediante kernels CUDA fusionados, lo que permite un uso eficiente de la VRAM. El modelo base incluye un modo de razonamiento extendido (thinking mode) que la cuantización conserva.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo problemas matemáticos (AIME) y razonamiento lógico.
- Procesamiento de imágenes: el modelo base es multimodal (image-text-to-text), pero la cuantización GLQ solo afecta al decodificador de texto; las torres de visión y audio se mantienen en su formato nativo.
- Soporte de thinking mode: permite generar cadenas de razonamiento extensas antes de responder, con presupuesto configurable (hasta 64K tokens).
- Soporte de tool calling y function calling: al ser un modelo instructo (IT), puede integrarse con agentes de código como pi-code y opencode a través de un endpoint OpenAI-compatible.
- Capacidades multilingües: más de 140 idiomas soportados por el modelo base.
- Compatibilidad con vLLM y Transformers: integración automática del método de cuantización GLQ mediante plugin.

## Casos de uso

- **Asistentes de código con agentes**: el modelo puede servirse con vLLM como endpoint OpenAI-compatible y conectarse a agentes como pi-code u opencode para tareas de programación asistida, gracias a su soporte de tool calling y razonamiento multi-paso.
- **Razonamiento matemático y científico**: con un presupuesto de tokens de pensamiento de 64K, el modelo alcanza el mismo rendimiento que la versión bf16 en AIME-2024 (93.3%), siendo adecuado para problemas complejos de matemáticas, física y lógica.
- **Despliegue en GPUs de consumo**: con ~15 GB de pesos, se puede ejecutar en tarjetas como RTX 3090 o RTX 4090, permitiendo a desarrolladores y estudiantes acceder a un modelo de razonamiento de 26B sin servidores dedicados.
- **Servicio de chat multilingüe con contexto largo**: su ventana de 256K tokens permite gestionar conversaciones de muchas vueltas o documentos extensos en más de 140 idiomas, útil para atención al cliente o análisis de documentación.
- **Análisis de documentos con imágenes**: aunque la cuantización no afecta a las torres de visión, el modelo puede recibir imágenes y texto, por lo que sirve para extraer información de capturas, diagramas o documentos escaneados.
- **Evaluación de cuantizaciones en investigación**: la comparación GLQ vs bf16 publicada en la model card sirve como referencia para investigadores que estudian el impacto de la cuantización en el razonamiento de modelos MoE.

## Benchmarks y rendimiento

Los resultados publicados en la model card son comparaciones emparejadas con la versión bf16 del mismo modelo, con muestras pequeñas (n=60 para MMLU-Pro, n=30 para AIME-2024, n=60 para AIME 2025+2026). Son evaluaciones de fidelidad de cuantización, no puntuaciones de líderes de benchmarks completos.

| Benchmark | bf16 base | GLQ 4bpw |
| :-- | :-- | :-- |
| MMLU-Pro (n=60, paired, thinking) | 91.7% (55/60) | 93.3% (56/60) |
| AIME-2024 (n=30, paired, thinking) | 93.3% (28/30) | 93.3% (28/30) |
| AIME 2025+2026 (n=60, thinking) | 93.3% (56/60) | 85.0% (51/60) |
| AIME-2024 con presupuesto 32k | 93.3% (28/30) | 86.7% (26/30) |
| AIME-2024 con presupuesto 64k | 93.3% (28/30) | 93.3% (28/30) |

Los resultados indican que GLQ-4bpw es comparable al bf16 en MMLU-Pro y AIME-2024, pero pierde alrededor de 5 puntos en AIME 2025+2026 y sufre más truncamientos (14 frente a 7) por razonar con cadenas más largas (media de 24k tokens frente a 18k). El autor advierte que evaluar el modelo sin thinking mode produce artefactos de extracción (por ejemplo, ~31% en MMLU-Pro para ambas precisiones), por lo que la evaluación debe realizarse siempre con el modo de razonamiento activado.

## Requisitos de hardware

- **VRAM estimada**: ~15 GB para los pesos cuantizados (4.0 bpw) más memoria para contexto y activaciones; para contexto de 256K se recomienda la caché KV cuantizada E8 (≈4× menor) para evitar desbordes.
- **GPU recomendadas**: tarjetas de 16 GB o más, como RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Con 15 GB de pesos, cabe en GPUs de 16 GB si el contexto es moderado (4K-8K tokens).
- **Despliegue**: vLLM es el runtime recomendado por el autor (versión 0.27.1 verificada), con integración automática del plugin GLQ; también funciona con Transformers (>=5.13.1 y <5.15) usando `glq.hf_integration`.
- **Latencia y throughput**: no disponible en la información proporcionada; depende de la GPU y del presupuesto de tokens de pensamiento. El modelo tiende a razonar ~20% más en 4-bit que en bf16 (media 12.5k vs 10.5k tokens en AIME), lo que aumenta el tiempo de generación.
- **Limitación de VRAM**: con contexto máximo (256K tokens), se necesitaría la caché KV cuantizada para mantener la inferencia en una sola GPU de 24 GB; sin ella, el contexto debe reducirse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
| :-- | :-- | :-- | :-- | :-- | :-- |
| gemma-4-26B-A4B-it-GLQ-4bpw (este) | 26B totales, 4B activos | 256K | MoE multimodal | Apache-2.0 | safetensors + GLQ |
| google/gemma-4-26B-A4B-it | 26B totales, 4B activos | 256K | MoE multimodal | Apache-2.0 | bf16 (safetensors) |
| google/gemma-4-E2B (E2B) | 2B | 256K | Dense | Apache-2.0 | bf16 |
| google/gemma-4-31B | 31B | 256K | Dense | Apache-2.0 | bf16 |

La comparativa se centra en el modelo base y otras variantes de Gemma 4. La versión GLQ ofrece el mismo rendimiento aproximado que la base bf16 en razonamiento con un tercio del tamaño, pero con requisitos de hardware significativamente menores. La alternativa bf16 requiere ~50 GB de VRAM, mientras que la GLQ cabe en 15 GB.

## Limitaciones y advertencias

- **Dependencia de versión**: requiere `transformers>=5.13.1,<5.15` y vLLM 0.27.1; la versión 5.15.0 rompe la carga de Gemma 4 por cambios en la configuración por capas.
- **Degradación en problemas difíciles**: en AIME 2025+2026, GLQ-4bpw pierde ~8 puntos frente al bf16 (85.0% vs 93.3%) y sufre el doble de truncamientos por límite de tokens, lo que sugiere una posible degradación del razonamiento en problemas muy complejos.
- **Presupuesto de tokens de pensamiento**: el modelo razona más en 4-bit (~20% más tokens), por lo que un presupuesto ajustado (por ejemplo, 32K) penaliza su rendimiento; se recomienda usar 64K para igualar al bf16.
- **Evaluación en modo de razonamiento**: si se evalúa sin activar el thinking mode, los resultados son irrelevantes (~31% en MMLU-Pro), lo que puede llevar a conclusiones erróneas si no se sigue el protocolo adecuado.
- **Muestras pequeñas**: los benchmarks publicados son de n=30 a n=60, con intervalos de confianza amplios (±8% en MMLU-Pro, ±15% en AIME); no son comparables con los resultados de líderes completos.
- **Sesgos y alucinación**: al ser un modelo instructo, puede alucinar en tareas factuales si no se usa con herramientas de verificación; no se proporcionan datos específicos sobre sesgos del modelo base.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base incluye restricciones de uso aceptable (Gemma 4 license); se recomienda revisar la política de uso de Google.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-4bpw
- Modelo base (google/gemma-4-26B-A4B-it): https://huggingface.co/google/gemma-4-26B-A4B-it
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Google Cloud sobre Gemma 4 26B A4B IT: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Página de FriendliAI con el modelo GLQ: https://friendli.ai/models/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-4bpw
