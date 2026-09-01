# theoracleguy/VibeVoice-Realtime-0.5B-fp16

## Resumen

VibeVoice-Realtime-0.5B es un modelo de síntesis de voz en tiempo real desarrollado por Microsoft, diseñado para generar audio a partir de texto de entrada en streaming, con una latencia de aproximadamente 300 ms hasta la primera audición. Esta versión concreta, `theoracleguy/VibeVoice-Realtime-0.5B-fp16`, es una conversión a formato MLX (FP16) realizada por un tercero, preparada para su uso con la aplicación local OpenVox y el framework de inferencia `mlx-audio`. El modelo combina un LLM base Qwen2.5-0.5B con un tokenizador acústico σ-VAE y un cabezal de difusión ligero, alcanzando un total de 1.017.626.722 parámetros (aunque se denomina "0.5B" por su componente principal). Soporta entrada de texto en streaming, generación de voz de formato largo (hasta ~10 minutos) y una ventana de contexto de 8K tokens. Su licencia MIT permite uso comercial sin restricciones, y está pensado principalmente para inglés, aunque muestra cierta capacidad multilingüe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-0.5B) + σ-VAE acústico + cabezal de difusión |
| Parametros totales | 1.017.626.722 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | FP16 (MLX), otras no especificadas |
| Idiomas soportados | Inglés (principal), con cierta capacidad multilingüe limitada |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original de Microsoft, VibeVoice-Realtime-0.5B, se basa en una arquitectura híbrida que combina un modelo de lenguaje Qwen2.5-0.5B como codificador de texto, un tokenizador acústico σ-VAE que convierte el audio en tokens discretos, y un cabezal de difusión ligero que reconstruye la forma de onda. Esta combinación permite generar voz de alta calidad con una latencia inicial muy baja (~300 ms) y soportar entrada de texto en streaming, es decir, el modelo puede empezar a hablar mientras el texto aún se está generando. El entrenamiento se realizó con datos de habla en inglés, aunque se ha observado cierta generalización a otros idiomas. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. La versión MLX aquí descrita es una conversión directa de los pesos originales a formato FP16 para su ejecución en hardware Apple Silicon mediante `mlx-audio`.

## Capacidades

- Generación de voz en tiempo real con streaming de texto de entrada: el modelo puede empezar a hablar antes de recibir el texto completo, lo que lo hace adecuado para asistentes conversacionales y narración de flujos de datos en vivo.
- Síntesis de voz de formato largo: es capaz de generar hasta ~10 minutos de audio continuo sin degradación aparente, útil para audiolibros o podcasts.
- Entrada de texto incremental: permite que un LLM externo vaya alimentando el modelo token a token, reduciendo la latencia percibida en sistemas de diálogo.
- Multilingüe limitado: aunque está entrenado principalmente en inglés, muestra un rendimiento aceptable en algunos otros idiomas, aunque no se garantiza la calidad.
- Integración con MLX y OpenVox: funciona con el framework `mlx-audio` y la aplicación local OpenVox, lo que permite ejecución sin conexión y sin enviar datos a la nube.
- No soporta código, fórmulas matemáticas ni símbolos especiales en el texto de entrada.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede integrarse con un LLM para que el asistente empiece a hablar mientras el LLM aún está generando la respuesta, reduciendo la sensación de espera. Su latencia de ~300 ms es adecuada para interacción conversacional.
- Narración de datos en vivo: sirve para leer en voz alta flujos de datos continuos, como cotizaciones bursátiles, resultados deportivos o notificaciones de sistemas, gracias a su capacidad de streaming y generación de formato largo.
- Audiolibros y podcasts automatizados: con una generación de hasta ~10 minutos por pasada, puede producir narraciones largas de forma eficiente, aunque requiere dividir el texto en segmentos manejables.
- Doblaje y subtitulado de vídeo: al ser un modelo TTS ligero, puede integrarse en pipelines de postproducción para generar voces en off en inglés, con la posibilidad de ajustar la voz mediante voces predefinidas (por ejemplo, `en-Emma_woman`).
- Aplicaciones de accesibilidad: lectores de pantalla para personas con discapacidad visual que necesiten una síntesis de voz rápida y de baja latencia, especialmente en entornos locales sin conexión.
- Pruebas y desarrollo de sistemas de voz: al ser de código abierto y con licencia MIT, es útil para prototipar y evaluar arquitecturas de TTS en tiempo real, así como para comparar con otros modelos en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), RTF (Real-Time Factor) o comparativas con otros modelos TTS en la documentación consultada. La única métrica mencionada es la latencia de ~300 ms hasta la primera audición, reportada por Microsoft en su documentación.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros en FP16, el tamaño de los pesos es de aproximadamente 2 GB. Para inferencia en MLX, se recomienda al menos 4 GB de memoria unificada en Apple Silicon (M1/M2/M3) para evitar swapping.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 8 GB de memoria unificada (M1, M2, M3, M4) para un rendimiento fluido. En GPU NVIDIA, la versión MLX no es directamente ejecutable; se necesitaría la versión original en PyTorch (no incluida en este repo).
- Si cabe en consumer GPU: sí, en GPUs con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060) si se convierte a otro formato, pero la versión MLX está pensada exclusivamente para Apple Silicon.
- Opciones de despliegue: mediante `mlx-audio` (CLI o Python), o a través de la aplicación OpenVox. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo TTS, no un LLM generativo de texto.
- Latencia y throughput: latencia inicial de ~300 ms; el throughput no está especificado, pero al ser un modelo ligero, se espera que sea superior a tiempo real en hardware Apple Silicon moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos TTS en tiempo real. Como referencia cualitativa, se pueden mencionar alternativas como:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| VibeVoice-Realtime-0.5B (este) | ~1B | 8K tokens | MIT | TTS en tiempo real, streaming, MLX |
| Piper TTS | ~100M-200M | no aplica | MIT | TTS ligero, sin streaming, calidad inferior |
| Coqui TTS (XTTS) | ~1.6B | no aplica | MPL-2.0 | TTS multilingüe, clonación de voz, mayor latencia |
| Tortoise TTS | ~1.5B | no aplica | Apache-2.0 | TTS de alta calidad, lento, no tiempo real |

La comparativa es orientativa; no se han encontrado benchmarks directos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado principalmente para inglés; en otros idiomas la calidad puede degradarse notablemente.
- Entradas de texto muy cortas (menos de 3 palabras) pueden producir resultados inestables o de baja calidad.
- No soporta código, fórmulas matemáticas, símbolos especiales ni caracteres no alfabéticos; el texto debe ser lenguaje natural.
- La versión MLX aquí descrita es una conversión de terceros; no está oficialmente respaldada por Microsoft y puede presentar diferencias de comportamiento respecto al original.
- Aunque la licencia es MIT, el uso del modelo en aplicaciones comerciales debe cumplir con las políticas de uso de los modelos base (Qwen2.5) y de los datos de entrenamiento, aunque no se han identificado restricciones adicionales.
- La generación de audio de formato largo (~10 minutos) puede requerir segmentación manual del texto; no se garantiza coherencia en textos extremadamente largos.
- No se han publicado evaluaciones de sesgos o alucinaciones auditivas; se recomienda supervisión humana en aplicaciones sensibles.

## Enlaces

- Repositorio HuggingFace de esta versión MLX: https://huggingface.co/theoracleguy/VibeVoice-Realtime-0.5B-fp16
- Modelo original de Microsoft: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Documentación del modelo original (GitHub): https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-realtime-0.5b.md
- Documentación alternativa (GitHub): https://github.com/SUP3RMASS1VE/VibeVoice-Realtime/blob/main/docs/vibevoice-realtime-0.5b.md
- Space de demostración: https://huggingface.co/spaces/MySafeCode/VibeVoice-Realtime-0.5B
- Framework mlx-audio: https://github.com/Blaizzy/mlx-audio
- Aplicación OpenVox: https://openvoxai.com/
- Paper relacionado (arXiv 2508.19205): https://arxiv.org/abs/2508.19205
- Paper relacionado (arXiv 2412.08635): https://arxiv.org/abs/2412.08635
