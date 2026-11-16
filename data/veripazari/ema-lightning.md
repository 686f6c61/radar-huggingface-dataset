# veripazari/ema-lightning

## Resumen

EMA Lightning es un sistema de síntesis de voz (text-to-speech) en turco desarrollado originalmente por el usuario canberkkkkkk y archivado por VeriPazarı. Su propuesta central es la eficiencia extrema: combina un modelo acústico DiT (Diffusion Transformer) de 5,6 millones de parámetros con un vocoder de 3 millones, sumando 8,6 millones de parámetros y un peso total de aproximadamente 34 MB. Está publicado bajo licencia Apache 2.0.

El modelo aborda el problema del coste y la latencia en TTS de calidad: según su model card, alcanza un 0,92 % de WER (Word Error Rate) en el conjunto Freya-TR-Eval, y reporta 3,86 ms hasta la primera salida de audio en una RTX 4090, con streaming incremental y funcionamiento completamente offline en GPU o CPU. Emplea flow matching para generar latentes en cuatro pasos y decodifica a 48 kHz.

Es relevante por su relación tamaño/rendimiento frente a sistemas comerciales y modelos de miles de millones de parámetros, y por su integración como paquete de Python (`pip install ema-lightning`) con API de generación completa (`say()`) y en streaming (`stream()`). La información disponible proviene íntegramente de la model card; no se han podido verificar de forma independiente los resultados declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo acústico DiT (Diffusion Transformer) con flow matching + vocoder; codificación de texto a nivel de carácter, predictor de duración y alineador con ventana |
| Parámetros totales | 8,6 millones (5,6 M modelo acústico + 3 M vocoder) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | `ema.pt` y `decoder.pt` (PyTorch); paquete Python `ema-lightning` |

## Arquitectura y entrenamiento

El pipeline descrito en la model card es el siguiente: el texto se codifica a nivel de carácter, un predictor de duración lo sitúa en una línea temporal palabra-carácter, un alineador con ventana lo convierte en una condición por fotograma, un DiT genera latentes en cuatro pasos mediante flow matching y el vocoder los resuelve a audio de 48 kHz. El resultado es un sistema compacto (unos 34 MB) orientado a inferencia de baja latencia, con un planificador interno ("Playhead") que permite compartir el modelo entre múltiples hilos y ejecutar trabajos concurrentes sobre la misma GPU.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni detalles del proceso de ajuste. La model card menciona que el preprocesado de texto se apoya en `normalizer-tr`, de Erdem Tuna, y referencia el paper arXiv:2405.14867 en las etiquetas del repositorio, aunque no se detalla su relación exacta con este modelo. Tampoco se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Síntesis de voz en turco a partir de texto, con salida mono a 48 kHz en formato float32.
- Generación completa por lotes mediante `say()`, que acepta un texto o una lista de textos y puede escribir archivos WAV (`0.wav`, `1.wav`, ...).
- Streaming incremental mediante `stream()`: el primer fragmento (aproximadamente un segundo de audio) está disponible en unos 4 ms en GPU y el resto se entrega en bloques de cuatro segundos.
- Ejecución concurrente multihilo con un único modelo compartido, coordinada por el planificador Playhead.
- Funcionamiento offline en GPU o CPU, sin claves de API ni envío de texto o audio fuera de la máquina.
- Control de reproducibilidad mediante semilla (los ejemplos usan seed 0).
- No se documentan capacidades de clonación de voz, control de emociones, tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Atención al cliente automatizada: integración de `stream()` en un agente conversacional telefónico o de chat de voz para responder en turco con latencia de primera palabra de pocos milisegundos, manteniendo la conversación fluida sin esperas perceptibles.
- Lectura de notificaciones y avisos transaccionales: generación por lotes con `say()` de mensajes como confirmaciones de pedido o recordatorios de cita, aprovechando el bajo coste por carácter declarado (aproximadamente 0,0085 USD por millón de caracteres en una RTX 4090 alquilada).
- Audiolibros y locución de contenido largo: procesamiento de listas de textos con escritura directa a WAV y salida a 48 kHz, adecuada para narración de artículos, boletines o material formativo.
- Sistemas de accesibilidad: lectura en voz alta de interfaces y documentos en dispositivos sin GPU, ya que el modelo funciona en CPU y ocupa unos 34 MB, lo que permite incluirlo en aplicaciones de escritorio o embebidas.
- Asistentes de voz para entornos con requisitos de privacidad: despliegue totalmente offline en equipos locales, sin transmisión de texto ni audio a servicios externos, apto para sanidad, banca o administración pública.
- Servicios de voz multiinquilino: uso del modelo compartido entre hilos con Playhead para atender varias peticiones simultáneas en una sola GPU, reduciendo coste de infraestructura en plataformas de IVR o generación de audio bajo demanda.
- Pruebas y prototipado de productos de voz: instalación mediante `pip` y API sencilla para validar flujos de TTS en turco antes de comprometerse con proveedores comerciales.

## Benchmarks y rendimiento

Datos declarados en la model card (no verificados de forma independiente):

| Métrica | Valor |
|---|---|
| WER en Freya-TR-Eval | 0,92 % |
| Comparación declarada | Mejor WER que ElevenLabs v4, Gemini 3.8 y Trendyol-TTS (2,38 mil millones de parámetros) |
| Latencia hasta primera salida de audio (RTX 4090) | 3,86 ms |
| Velocidad relativa en tiempo real | 440× (1.316× con batching) |
| Coste declarado | Aproximadamente 0,0085 USD por millón de caracteres en RTX 4090 alquilada |
| Tamaño total | 8,6 M de parámetros, unos 34 MB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de texto, ya que el modelo es exclusivamente de síntesis de voz. Tampoco se detallan las condiciones exactas de medición de latencia y throughput más allá de la GPU empleada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 8,6 M de parámetros y unos 34 MB de pesos, la huella en memoria es mínima y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: RTX 4090 para las cifras de latencia declaradas (3,86 ms hasta el primer audio, 440× tiempo real); no se documentan mediciones en A100, H100 u otras GPU.
- GPU de consumo: sí, cabe en cualquier GPU de consumo con memoria suficiente para el runtime de PyTorch; también funciona en CPU según la model card.
- Opciones de despliegue: paquete oficial `ema-lightning` (PyTorch), con integración de reproducción mediante `sounddevice`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: primera salida de audio en aproximadamente 4 ms en GPU para el primer fragmento de streaming; fragmentos posteriores de cuatro segundos generados más rápido que el tiempo real de reproducción; 1.316× tiempo real con batching según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| EMA Lightning | 8,6 M | Turco | Apache 2.0 | 0,92 % WER declarado en Freya-TR-Eval; streaming; offline |
| Trendyol-TTS | 2,38 mil millones | Turco | No disponible | Citado en la model card como referencia comparativa de WER |
| ElevenLabs v4 | No disponible | Multilingüe | Comercial (API) | Sistema propietario; citado como referencia de WER |
| Gemini 3.8 (TTS) | No disponible | Multilingüe | Comercial (API) | Citado como referencia de WER |

La comparativa se limita a los sistemas mencionados en la model card; no se dispone de datos independientes de parámetros, contexto ni licencia para las alternativas comerciales, y no se han identificado otros modelos TTS en turco con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco; no se documenta multilingüismo ni cambio de idioma.
- No se dispone de información sobre sesgos del corpus de entrenamiento ni sobre el origen y la licencia de los datos de voz utilizados.
- Riesgo de alucinación o errores de pronunciación en textos con números, siglas, abreviaturas o nombres propios; la model card recomienda el preprocesado con `normalizer-tr`, pero no cuantifica su impacto.
- Los resultados de WER, latencia y coste provienen únicamente del autor y no han sido verificados de forma independiente; deben tratarse como cifras declaradas.
- No se documentan límites de longitud de texto por llamada ni comportamiento con entradas muy largas.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo aparece como 0.0 GB, lo que puede indicar que los pesos no están alojados en ese repositorio o que la información está incompleta.
- El modelo es un archivo de un tercero (VeriPazarı) sobre el original de canberkkkkkk; conviene verificar la integridad y procedencia de los pesos antes de usarlos en producción.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía sobre el rendimiento ni sobre posibles reclamaciones derivadas de los datos de entrenamiento.

## Enlaces

- Hugging Face (archivo): https://huggingface.co/veripazari/ema-lightning
- Modelo original: https://huggingface.co/canberkkkkkk/ema-lightning
- Plataforma VeriPazarı: https://veripazari.com.tr
- Repositorio GitHub: https://github.com/ (enlace `[github]` referenciado en la model card sin URL completa en la información disponible)
- Paquete PyPI: https://pypi.org/project/ema-lightning/
- Normalizador de texto: https://github.com/erdemtuna/normalizer-tr
- Paper referenciado en las etiquetas: arXiv:2405.14867
