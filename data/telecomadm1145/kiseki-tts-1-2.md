# telecomadm1145/Kiseki-TTS-1.2

## Resumen

Kiseki-TTS-1.2 es un modelo de síntesis de voz (text-to-speech) para japonés, desarrollado por telecomadm1145. Se trata de un sistema encoder-decoder compacto de aproximadamente 0,4 mil millones de parámetros que genera tokens de audio neural discretos a una frecuencia de 12,5 Hz (80 ms por trama) y los decodifica a forma de onda mediante el códec de audio Qwen3-TTS-Tokenizer-12Hz. Su principal innovación reside en el decodificador acústico basado en Mamba2, un modelo de espacio de estados (SSM) de tiempo lineal que evita la atención sobre sí mismo y, por tanto, no requiere caché KV ni memoria que crezca con la duración de la locución.

El modelo está afinado a partir de Kiseki-1.1-0.3B, un modelo de traducción secuencia a secuencia, y utiliza un codificador transformer de 12 capas con atención cruzada hacia el decodificador. Gracias a su diseño, el coste de generación es constante por trama, lo que permite sintetizar locuciones largas (hasta 41 segundos entrenados) sin degradación de memoria. Su licencia MIT y su tamaño reducido lo convierten en una opción atractiva para despliegues en entornos con recursos limitados, como GPUs de consumo o inferencia en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: transformer encoder (12 capas, atencion bidireccional + RoPE + SwiGLU) + decoder Mamba2 (6 capas, cross-attention + SSM, sin self-attention) |
| Parametros totales | 375.482.432 (~0,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Máximo 512 tramas de audio (≈ 41 segundos de audio); texto de entrada sin límite explícito documentado |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers, custom code) |

## Arquitectura y entrenamiento

El modelo adopta una arquitectura encoder-decoder asimétrica. El encoder es un transformer de 12 capas con atención bidireccional, rotación posicional (RoPE) y SwiGLU, que procesa el texto de entrada de forma paralela una sola vez. El decoder está formado por 6 capas de Mamba2, un modelo de espacio de estados de tiempo lineal, que recibe condicionamiento textual mediante atención cruzada cuyas claves y valores se calculan una única vez durante el prefill y se reutilizan para cada trama de audio. No existe atención causal sobre sí mismo; el contexto temporal lo transporta el estado recurrente de Mamba2, de tamaño fijo `(32 cabezas × 128 estado × 64 dimensión)` por capa, más una ventana convolucional de 3 tramas.

La tokenización de audio se realiza a 12,5 Hz con 16 capas de cuantizador (codebooks) de 2048 entradas cada una, lo que da un vocabulario efectivo de 2176 tokens (incluyendo EOS, BOS y PAD) y una tasa de bits nominal de 2,2 kbps. Para predecir las 16 capas de códigos por trama, el modelo emplea un cabezal de predicción multi-token (MTP) compartido: cada capa q recibe el estado oculto del decoder más la suma prefija exclusiva de las embeddings de las capas anteriores, de modo que solo se necesita una evaluación del tronco principal por trama y 16 evaluaciones ligeras del cabezal, en lugar de 16 pasos autoregresivos completos. El entrenamiento se realizó mediante fine-tuning a partir del modelo base Kiseki-1.1-0.3B con los datasets `telecomadm1145/test14` y `telecomadm1145/test13`. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en japonés a partir de texto, generando audio de forma directa en formato de códec neural.
- Generación eficiente de locuciones largas: el coste por paso es constante y la memoria no crece con la duración, soportando hasta 512 tramas (≈ 41 segundos) entrenadas.
- Control fino de la prosodia mediante parámetros de muestreo: temperatura, top-k, top-p y ajuste independiente de la capa 0 de códecs (que transporta el contenido semántico principal).
- Integración con el códec Qwen3-TTS-Tokenizer-12Hz para decodificar los tokens a forma de onda.
- API simple a través de métodos `build_tts_input_ids` y `generate_audio` en el modelo.
- No incluye capacidades multimodales adicionales (ni visión ni audio de entrada), ni soporte de tool calling o agentes; es exclusivamente un modelo de generación de voz.

## Casos de uso

- Narración automática de contenidos: el modelo puede generar locuciones para vídeos, podcasts o presentaciones en japonés, con una latencia baja gracias a su frecuencia de 12,5 Hz y su decodificador eficiente.
- Asistentes de voz y sistemas de diálogo: al ser compacto y de bajo coste por paso, puede integrarse en asistentes locales o embebidos que requieran respuestas de voz en tiempo real.
- Audiolibros y lectura de textos largos: su capacidad para manejar contextos de audio de hasta 41 segundos sin degradación de memoria lo hace adecuado para sintetizar párrafos extensos de forma continua.
- Generación de voz para juegos o aplicaciones interactivas: el modelo puede producir líneas de diálogo dinámicamente, sin necesidad de pregenerar archivos de audio.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, en entornos donde se requiera un modelo ligero y de código abierto.
- Prototipado rápido de aplicaciones TTS: su licencia MIT y su tamaño reducido facilitan la experimentación y el despliegue en entornos de desarrollo con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos de calidad subjetiva (MOS) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,4 B parámetros en precisión fp32, el uso de memoria es de aproximadamente 1,5 GB para los pesos; con cuantización a fp16 o int8 podría reducirse a menos de 1 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. Para generación en tiempo real se recomienda una GPU con soporte CUDA y suficiente ancho de banda de memoria.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el modelo se carga mediante `transformers` con `trust_remote_code=True`. No se mencionan integraciones con vLLM, Ollama o llama.cpp, pero al ser un modelo secuencia a secuencia personalizado, el despliegue estándar es a través de la API de Transformers o un servidor propio.
- Latencia y throughput: no se proporcionan mediciones oficiales. Dado que un segundo de audio requiere 12,5 pasos del decoder y cada paso es una evaluación SSM de 6 capas, se espera una generación mucho más rápida que los modelos TTS basados en atención autoregresiva a frecuencias de 50-75 Hz.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos TTS japoneses de tamaño similar (por ejemplo, VITS, StyleTTS2 o modelos basados en Transformers). La información disponible no incluye benchmarks ni mediciones comparativas. Se recomienda evaluar el modelo frente a alternativas como `jp-speech` o `Coqui TTS` si se requiere una comparación objetiva, pero esos datos no están disponibles en la documentación actual.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no se ha entrenado para otros idiomas.
- No se documentan sesgos específicos, pero al ser entrenado sobre datasets limitados (test14 y test13) podría presentar sesgos de voz o registro propios de esos datos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir audio que no corresponda fielmente al texto de entrada, especialmente con texto ambiguo o fuera de distribución.
- La longitud máxima entrenada es de 512 tramas (≈ 41 segundos); generar más allá de ese límite puede degradar la calidad, aunque el diseño SSM no impone un límite duro.
- El modelo requiere el códec Qwen3-TTS-Tokenizer-12Hz para decodificar a forma de onda; este códec debe descargarse por separado y tiene su propia licencia (no especificada en la documentación).
- La implementación usa código personalizado (`trust_remote_code=True`), lo que implica un riesgo de seguridad al ejecutar código arbitrario; se recomienda auditar el código antes de usarlo en producción.
- No se proporcionan garantías de estabilidad para uso comercial; aunque la licencia MIT lo permite, el autor no ofrece soporte ni mantenimiento formal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/telecomadm1145/Kiseki-TTS-1.2
- Modelo base: https://huggingface.co/telecomadm1145/Kiseki-1.1-0.3B
- Códec de audio: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Perfil de GitHub del autor: https://github.com/telecomadm1145
- Repositorios del autor: https://github.com/telecomadm1145?tab=repositories
- Entrada de registro en free2aitools: https://free2aitools.com/model/telecomadm1145/kiseki-tts-1.1
