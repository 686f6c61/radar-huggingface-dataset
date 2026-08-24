# tphakala/silero-vad

## Resumen

Silero VAD es un detector de actividad de voz (VAD) en streaming, ligero y de grado empresarial, desarrollado originalmente por el equipo de Silero. Este repositorio concreto, `tphakala/silero-vad`, es un re-hosting sin modificaciones de los pesos oficiales (versión v6.2.1, commit `7e30209`) empaquetado con una especificación de interfaz y sumas de verificación para su uso como filtro de privacidad en BirdNET-Go, una herramienta de monitorización acústica de aves. El objetivo es detectar habla humana en grabaciones de paisajes sonoros para descartar o anonimizar esas ventanas antes de su almacenamiento.

El modelo es un detector de actividad de voz basado en una red neuronal recurrente con LSTM, que procesa ventanas fijas de 32 ms (512 muestras a 16 kHz o 256 a 8 kHz) y devuelve una probabilidad de habla en el rango [0, 1]. Su tamaño es muy reducido, entre 1,3 y 2,8 MB según la variante, y está disponible en formato ONNX y TorchScript. No transcribe el audio, solo responde a la pregunta «¿hay alguien hablando?», lo que lo convierte en una opción idónea como puerta de privacidad sin almacenar contenido.

La relevancia actual de este modelo radica en su bajo coste computacional (menos de 1 ms por ventana de 30 ms en un solo hilo de CPU), su licencia MIT sin telemetría ni claves, y su integración directa con BirdNET-Go, que ya utiliza onnxruntime para otros modelos. Esto permite añadir una capa de filtrado de privacidad sin introducir nuevas dependencias ni aumentar significativamente la carga de procesamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (LSTM) para detección de actividad de voz en streaming |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 ms (512 muestras a 16 kHz, 256 a 8 kHz) |
| Tipos de cuantizacion | no disponible (archivos ONNX en precisión flotante estándar) |
| Idiomas soportados | no disponible (la documentación original menciona entrenamiento multilingüe, pero la model card no especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (también TorchScript JIT) |

## Arquitectura y entrenamiento

El modelo es un detector de actividad de voz en streaming basado en una red recurrente con celdas LSTM. Procesa el audio en ventanas fijas de 32 ms (512 muestras a 16 kHz o 256 a 8 kHz) y mantiene un estado interno de 128 dimensiones que se propaga entre ventanas consecutivas. La entrada es un tensor float32 de forma `[1, samples]` con PCM mono en el rango [-1, 1], junto con el estado LSTM y un escalar `sr` que indica la tasa de muestreo (16000 u 8000). La salida es una probabilidad de habla en [0, 1] y el nuevo estado para la siguiente llamada.

No se dispone de detalles específicos sobre el entrenamiento en la información proporcionada. Según la documentación original del proyecto Silero VAD, el modelo fue entrenado sobre corpus masivos que incluyen más de 100 idiomas y diversos dominios de audio con ruido de fondo y calidades variables. Sin embargo, no se especifican el número de tokens, la composición exacta del dataset ni si se utilizaron técnicas como RLHF o DPO. La innovación principal del modelo es su diseño compacto y eficiente, optimizado para inferencia en tiempo real en CPU, con un coste inferior a 1 ms por ventana de 30 ms en un solo hilo.

## Capacidades

- Detección de actividad de voz (habla vs. no habla) en audio en streaming, devolviendo una probabilidad por ventana de 32 ms.
- Soporte de tasas de muestreo de 8 kHz y 16 kHz.
- Funcionamiento como filtro de privacidad: no transcribe ni almacena contenido, solo indica si hay habla presente.
- Integración con onnxruntime, lo que permite su uso en entornos sin dependencias pesadas de PyTorch.
- Compatible con BirdNET-Go para descartar o anonimizar ventanas con habla humana en grabaciones de campo.
- Bajo coste computacional: menos de 1 ms por ventana en CPU, con posibilidad de aceleración adicional mediante batching o GPU.
- No incluye capacidades de tool calling, agentes, visión, audio de alta resolución ni razonamiento multi-paso; es un modelo especializado en una única tarea.

## Casos de uso

- Filtro de privacidad en monitorización acústica de aves: BirdNET-Go puede usar este modelo para detectar habla humana en grabaciones de campo y descartar o anonimizar esas ventanas antes de almacenarlas, cumpliendo requisitos de protección de datos.
- Preprocesamiento para sistemas de reconocimiento de voz (ASR): activar el transcripción solo cuando se detecta habla, ahorrando recursos computacionales en aplicaciones de dictado o asistentes de voz.
- Vigilancia y seguridad: detección de conversaciones humanas en entornos sensibles para activar alertas o grabaciones selectivas, sin almacenar audio innecesario.
- Control de calidad de audio: identificar segmentos con habla en podcasts o grabaciones para su posterior edición o subtitulado.
- Aplicaciones de accesibilidad: activar subtítulos en tiempo real solo cuando hay voz, reduciendo el procesamiento en dispositivos con recursos limitados.
- Investigación en bioacústica: filtrar el habla humana de grabaciones de campo para aislar vocalizaciones de aves u otros animales, mejorando la precisión de los análisis.
- Automatización del hogar: detectar si hay personas hablando en una habitación para ajustar el volumen de dispositivos o activar modos de silencio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Sin embargo, la documentación del proyecto original indica que el modelo procesa una ventana de 30 ms en menos de 1 ms en un solo hilo de CPU, y que bajo ciertas condiciones la versión ONNX puede ejecutarse hasta 4-5 veces más rápido. No se proporcionan métricas estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- Inferencia en CPU: el modelo requiere muy pocos recursos. Con un solo hilo de CPU moderna (con instrucciones AVX, AVX2, AVX-512 o AMX) es suficiente; el consumo de memoria es inferior a 3 MB para los pesos.
- GPU: no es necesaria, pero puede usarse para acelerar el procesamiento por lotes. Cualquier GPU con soporte de onnxruntime es válida.
- Compatible con hardware de bajo consumo: Raspberry Pi, dispositivos embebidos y sistemas sin GPU pueden ejecutar el modelo sin problemas.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider), llama.cpp no es aplicable, pero puede integrarse en aplicaciones C++, Python o Go mediante las bindings de onnxruntime. También se puede usar el archivo TorchScript con PyTorch.
- Latencia y throughput: menos de 1 ms por ventana de 30 ms en un solo hilo de CPU; el throughput depende del hardware, pero es adecuado para procesamiento en tiempo real.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Precisión | Licencia | Formato |
|--------|--------|----------|-----------|----------|---------|
| Silero VAD (este) | 1,3-2,8 MB | 32 ms | Alta (según documentación) | MIT | ONNX, TorchScript |
| WebRTC VAD | ~0,1 MB | 10-30 ms | Media (más antigua) | BSD | C++ |
| pyannote.audio VAD | ~50 MB | variable | Alta (basado en transformer) | MIT | PyTorch |

Silero VAD destaca por su equilibrio entre precisión y eficiencia, siendo significativamente más ligero que pyannote y más moderno que WebRTC. No se dispone de comparativas cuantitativas en la información proporcionada, pero la documentación oficial afirma que supera a WebRTC en precisión sobre audios con ruido y acentos variados.

## Limitaciones y advertencias

- Falsos positivos con vocalizaciones de aves: algunas llamadas de aves tienen una estructura armónica similar al habla y pueden elevar la puntuación de probabilidad, lo que debe tenerse en cuenta al usarlo como filtro de privacidad en entornos naturales.
- Ventanas de tamaño fijo: el modelo espera exactamente 512 muestras a 16 kHz o 256 a 8 kHz. Usar tamaños diferentes puede ejecutarse pero produce resultados poco fiables.
- Sin transcripción: solo proporciona una probabilidad de habla; no es útil para tareas que requieran entender el contenido del habla.
- Idiomas: aunque la documentación original menciona entrenamiento multilingüe, no se especifica la lista exacta de idiomas soportados en la model card de este repositorio.
- Dependencia de la tasa de muestreo: es necesario remuestrear el audio a 16 kHz u 8 kHz antes de alimentar el modelo; usar otras tasas puede degradar el rendimiento.
- Riesgo de alucinación: al ser un modelo discriminativo y no generativo, el riesgo de alucinación es bajo, pero los falsos positivos pueden considerarse un fallo de precisión.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tphakala/silero-vad
- Repositorio original en GitHub: https://github.com/snakers4/silero-vad
- Paquete PyPI: https://pypi.org/project/silero-vad/
- PyTorch Hub: https://pytorch.org/hub/snakers4_silero-vad_vad/
