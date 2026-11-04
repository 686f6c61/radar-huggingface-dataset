# syvai/tie

## Resumen

Tie es un detector de fin de turno (end-of-turn) para agentes de voz en danés, desarrollado por syvai. Resuelve un problema concreto en la interacción hablada con máquinas: cuando un hablante hace una pausa, el sistema debe decidir si ha terminado su turno o si solo está pensando. Los temporizadores de silencio tradicionales fallan en ambos sentidos: cortan al hablante (falsos positivos) o introducen latencia innecesaria (falsos negativos). Tie aborda esto con un clasificador de audio que estima `P(done)` a partir de la prosodia, sin necesidad de transcripción.

El modelo es deliberadamente pequeño: 20,16 millones de parámetros, una ventana de 8 segundos de audio a 16 kHz y una decisión tomada 200 ms después de la última palabra. La versión int8 en ONNX ocupa 25 MB y tarda 28 ms en 2 hilos de CPU, lo que lo hace viable en entornos de producción con recursos limitados y en el navegador.

Forma parte de una familia de modelos daneses de syvai junto a Hviske (ASR) y Plapre (TTS), y se publica bajo licencia Apache 2.0. Es relevante ahora porque los agentes de voz necesitan políticas de turn-taking de baja latencia y el enfoque audio-only evita la dependencia de un ASR en el bucle crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer audio encoder sobre log-mel + attention pooling + MLP de 2 capas |
| Parametros totales | 20.159.490 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 s de audio (128.000 muestras a 16 kHz) |
| Tipos de cuantizacion | int8 dinamica per-channel (MatMul); fp32 |
| Idiomas soportados | danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

Tie es un encoder Transformer que opera sobre características log-mel de 8 segundos de audio, seguido de attention pooling y una cabeza MLP de 2 capas que produce un logit. La pérdida de entrenamiento es entropía cruzada binaria. La exportación a ONNX convierte la STFT en una convolución DFT fija, lo que permite ejecutar el modelo sin dependencias de procesamiento de señal externas.

La cuantización es un detalle técnico relevante: la int8 dinámica per-tensor perdía 1,6 puntos de F1, mientras que la per-channel pierde solo 0,04. El modelo se entrenó sobre pausas reales de habla danesa; la model card reporta un conjunto de test retenido de 96.110 pausas. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Clasificación binaria de fin de turno: devuelve `P(done)`, la probabilidad de que el hablante haya terminado.
- Funciona únicamente con audio, sin transcripción ni señal de texto.
- Ventana fija de 8 segundos con padding a la izquierda si el audio es más corto.
- Inferencia de baja latencia: 28 ms en 2 hilos de CPU (15 ms en 4, 54 ms en 1) para la versión int8.
- Exportación ONNX con STFT integrada como convolución DFT, lo que simplifica el despliegue.
- Ejecutable en el navegador (demo en Hugging Face Spaces).
- Idioma: únicamente danés.

## Casos de uso

- Agentes de voz en atención al cliente: sustituir el temporizador de silencio por una política basada en `P(done)`, reduciendo los cortes al usuario del 47,2 % (timer 0,5 s) al 13,4 % con umbral 0,5, con latencia media de 0,55 s.
- Asistentes telefónicos interactivos: el modelo procesa audio de calidad telefónica, aunque la model card indica que este dominio no está probado; requiere validación previa.
- Turn-taking en pipelines de ASR + TTS: integrar Tie como señal de control entre la salida de Hviske y la entrada de Plapre para decidir cuándo sintetizar la respuesta.
- Despliegue en el borde o en navegador: con 25 MB en int8 y 28 ms por decisión en 2 hilos, cabe en dispositivos sin GPU y en aplicaciones web.
- Sistemas de dictado o transcripción interactiva: detectar el final de una intervención para cerrar el segmento y lanzar el procesamiento posterior.
- Investigación en interacción hablada: usar el modelo como baseline de turn-taking audio-only en danés y comparar con políticas de temporizador o señales textuales.

## Benchmarks y rendimiento

Conjunto de test retenido de 96.110 pausas:

| | AUC | F1 (50/50) |
|---|---|---|
| Pausas inequívocas (12.120) | 0,963 | 0,907 |
| Igual, int8 ONNX | 0,963 | 0,906 |
| Todas las pausas de test | 0,917 | 0,847 |

Política de turn-taking (200 ms tras la pausa si `P(done) > umbral`; si no, temporizador de 2 s):

| Política | Corta a quien solo pausaba | Latencia media de respuesta |
|---|---|---|
| Timer de silencio 0,5 s | 47,2 % | 0,50 s |
| Timer de silencio 0,8 s | 18,6 % | 0,80 s |
| Modelo, umbral 0,5 | 13,4 % | 0,55 s |
| Modelo, umbral 0,8 | 9,0 % | 0,72 s |
| Modelo, umbral 0,9 | 6,7 % | 0,88 s |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU.
- Versión int8 ONNX: 25 MB en disco, ejecutable en CPU.
- Latencia: 28 ms en 2 hilos de CPU, 15 ms en 4 hilos, 54 ms en 1 hilo.
- GPU: no se especifican requisitos ni recomendaciones de GPU en la información disponible.
- Cabe en cualquier equipo de consumo e incluso en el navegador.
- Despliegue: ONNX Runtime (`CPUExecutionProvider`); también se ofrecen pesos PyTorch en safetensors con `model.py`.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de turn-taking audio-only en danés en la información proporcionada. Como referencia interna de la misma familia:

| Modelo | Tarea | Parámetros | Licencia |
|---|---|---|---|
| Tie | End-of-turn (audio) | 20,16 M | Apache 2.0 |
| Hviske | ASR danés | no disponible | no disponible |
| Plapre | TTS danés | no disponible | no disponible |

## Limitaciones y advertencias

- Solo audio: detecta prosodia, no gramática. Un hablante que se detiene a mitad de frase con entonación descendente puede parecer que ha terminado.
- Voces sintéticas (TTS) confunden al modelo.
- Audio de calidad telefónica y de campo lejano no está probado.
- En pausas ambiguas, donde incluso los humanos discreparían, la precisión baja; los errores restantes parecen ambigüedad genuina del audio.
- Solo soporta danés.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del autor y de los datos de entrenamiento, no detalladas en la información disponible.
- En producción, se recomienda combinarlo con una señal textual basada en ASR para reducir falsos positivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syvai/tie
- Demo: https://huggingface.co/spaces/syvai/tie-demo
- Modelo hermano ASR: https://huggingface.co/syvai/hviske-v6
- Modelo hermano TTS: https://huggingface.co/syvai/plapre-3
