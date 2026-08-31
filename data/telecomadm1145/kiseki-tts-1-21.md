# telecomadm1145/Kiseki-TTS-1.21

## Resumen

Kiseki-TTS-1.21 es un modelo de síntesis de voz (text-to-speech) para japonés, desarrollado por telecomadm1145, que combina un codificador Transformer con un decodificador basado en Mamba2 (state-space model). El modelo genera tokens de audio discreto a 12,5 Hz mediante el codec neuronal de Qwen3 (Qwen3-TTS-Tokenizer-12Hz) y los decodifica a forma de onda. Está diseñado para ser rápido y eficiente en memoria: al eliminar la auto-atención causal del decodificador, el coste de generación es constante por trama y no crece con la duración de la locución, sin necesidad de gestionar caché KV.

Con aproximadamente 0,4 mil millones de parámetros, el modelo parte de un modelo base de traducción (Kiseki-1.1-0.3B) y se afina específicamente para TTS. Su licencia MIT permite uso comercial sin restricciones. La arquitectura híbrida (encoder Transformer + decoder Mamba2) es una propuesta novedosa en el campo de la síntesis de voz, ya que la mayoría de sistemas actuales dependen de decodificadores autoregresivos con atención completa. Su relevancia radica en ofrecer una alternativa ligera y escalable para síntesis de voz en japonés con latencia reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: encoder Transformer (12 capas, atención bidireccional, RoPE, SwiGLU) + decoder Mamba2 (6 capas, cross-attention + SSM, sin self-attention) |
| Parametros totales | 375.482.432 (~0,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Máximo 512 frames de audio ≈ 41 segundos (no se especifica longitud de contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder asimétrica. El encoder es un Transformer estándar de 12 capas con atención bidireccional, RoPE y SwiGLU, que procesa el texto de entrada de forma paralela. El decodificador, de solo 6 capas, utiliza cross-atención sobre las salidas del encoder y un núcleo Mamba2 (state-space model) en lugar de auto-atención causal. Esto implica que el contexto temporal se mantiene en el estado recurrente del SSM, y las claves y valores de la cross-atención se calculan una sola vez durante el prefill, reutilizándose para cada trama de audio.

El audio se tokeniza a 12,5 Hz con 16 capas de cuantizador (codebooks) de 2048 entradas cada una, lo que resulta en una tasa de bits nominal de 2,2 kbps. Para la generación de las 16 capas de códigos por trama, se emplea una cabeza de predicción multi-token (MTP) compartida: cada capa q condiciona sobre las capas anteriores mediante una suma de prefijo exclusivo, permitiendo resolver las 16 capas con una sola evaluación del tronco del decodificador y 16 evaluaciones ligeras de la cabeza. El entrenamiento se realizó sobre los datasets `telecomadm1145/test14` y `telecomadm1145/test13` (sin detalles públicos de composición o volumen de tokens). No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el modelo se afina a partir de un modelo de traducción existente.

## Capacidades

- Síntesis de voz en japonés a partir de texto, generando audio a 12,5 Hz (80 ms por trama).
- Decodificación de tokens de audio mediante el codec Qwen3-TTS-Tokenizer-12Hz, que produce formas de onda a partir de códigos discretos.
- Generación de audio de hasta 41 segundos de duración (512 frames) con coste computacional constante por trama.
- Soporte de parámetros de muestreo configurables: `temperature`, `top_k`, `top_p` y control independiente para la capa 0 de codebook (que transporta la mayor parte del contenido semántico).
- No incluye capacidades de visión, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de conversión texto a voz.

## Casos de uso

- **Narración de audiolibros en japonés**: el modelo puede generar locuciones largas (hasta 41 segundos por pasada) con memoria constante, lo que facilita la producción de capítulos completos sin necesidad de dividir el texto en fragmentos cortos.
- **Asistentes de voz para dispositivos embebidos**: su tamaño reducido (~0,4 B parámetros) y la ausencia de caché KV permiten ejecutarlo en hardware con poca memoria, ideal para altavoces inteligentes o aplicaciones móviles con recursos limitados.
- **Doblaje automático de vídeos**: al ser rápido (12,5 pasos por segundo de audio) y no requerir gestión de atención, puede integrarse en pipelines de postproducción para generar voces en japonés de forma ágil.
- **Sistemas de respuesta interactiva (IVR)**: la baja latencia por trama y la capacidad de controlar la prosodia mediante `temperature` y `top_k` permiten crear respuestas de voz naturales para centralitas telefónicas o chatbots de voz.
- **Herramientas de accesibilidad**: lectura de textos largos para personas con discapacidad visual, donde la eficiencia de memoria permite procesar documentos extensos sin degradación.
- **Generación de contenido educativo**: producción de lecciones de idioma o podcasts automatizados en japonés, aprovechando la licencia MIT para uso comercial sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos de calidad de voz (MOS, SIM, etc.) ni comparaciones cuantitativas con otros modelos TTS.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, latencia o throughput en la documentación del modelo.
- Dado el tamaño de ~0,4 B parámetros, una estimación orientativa sería: en FP16 (~800 MB) cabe en GPUs consumer modernas (RTX 2060 o superiores); en cuantización 4-bit (~200 MB) podría ejecutarse en GPUs de gama baja o incluso en CPU con suficiente RAM, aunque no hay confirmación oficial.
- El modelo se carga con `transformers` y soporta `trust_remote_code=True`; el ejemplo de uso utiliza CUDA, pero no se descarta inferencia en CPU para casos de baja latencia.
- Para despliegue en producción, se puede usar el pipeline estándar de Hugging Face Transformers; no se mencionan integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No hay información en la documentación sobre modelos TTS comparables (mismo tamaño o misma tarea) que permita establecer una comparativa objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en japonés; no soporta otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus limitado (datasets `test14` y `test13`) puede presentar artefactos en voces poco comunes, nombres extranjeros o jerga técnica.
- Riesgo de alucinación en la prosodia: la generación de audio con `temperature` alta puede producir entonaciones erráticas o sonidos ininteligibles; se recomienda ajustar los parámetros de muestreo para cada caso de uso.
- La calidad final depende del codec Qwen3-TTS-Tokenizer-12Hz; la decodificación requiere descargar este tokenizador adicional, lo que añade una dependencia externa.
- El uso de `trust_remote_code=True` implica ejecutar código personalizado del autor; se debe auditar antes de usar en entornos de producción.
- No hay garantías de soporte a largo plazo; el repositorio parece mantenido por un desarrollador individual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/telecomadm1145/Kiseki-TTS-1.21
- Modelo base (Kiseki-1.1-0.3B): https://huggingface.co/telecomadm1145/Kiseki-1.1-0.3B
- Tokenizador de audio Qwen3: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Perfil de GitHub del autor: https://github.com/telecomadm1145
- Repositorios del autor: https://github.com/telecomadm1145?tab=repositories
