# vedants254/voice-turn-detection

## Resumen

Voice Turn Detection es un clasificador de audio desarrollado por vedants254 (Shelkar) que estima si un hablante ha completado su turno conversacional o simplemente está haciendo una pausa. Está diseñado para sistemas de agentes de voz donde un timeout de VAD (detección de actividad de voz) resulta demasiado impaciente: hesitaciones, muletillas, cambios de código y pausas de pensamiento no deberían transferir automáticamente el control al agente. El modelo trabaja directamente sobre la forma de onda, sin necesidad de transcripción, y está entrenado para inglés, hindi e hinglish.

La arquitectura se basa en el encoder de Whisper Tiny, al que se le recorta el contexto posicional a ocho segundos, se agrupan los 400 frames del encoder mediante atención escalar aprendida y un pequeño MLP predice un logit de finalización. El grafo ONNX exportado incluye la extracción de log-Mel y devuelve una probabilidad sigmoide. El modelo se distribuye bajo licencia MIT y está disponible en formato ONNX, lo que lo hace ligero y adecuado para inferencia en tiempo real en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper Tiny modificado (recorte a 8 s, pooling con atencion escalar, MLP) |
| Parametros totales | no disponible (el encoder Whisper Tiny base tiene ~39 M, pero no se confirma el recuento final) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8 segundos de audio (128 000 muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles, hindi, hinglish |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo con extraccion de log-Mel incluida) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de Whisper Tiny, pero recorta su contexto posicional a ocho segundos, lo que reduce la ventana temporal a 128 000 muestras de audio mono a 16 kHz. Los 400 frames resultantes del encoder se agrupan mediante atención escalar aprendida (learned scalar attention) y un pequeño MLP produce un único logit de finalización, que se transforma en una probabilidad mediante una función sigmoide. El grafo ONNX exportado incorpora la extracción de características log-Mel, de modo que la entrada es directamente la forma de onda PCM.

El entrenamiento se realizó sobre el dataset `pipecat-ai/smart-turn-data-v3.2-train`, que contiene clips de habla en inglés e hindi, con una mezcla de habla real y sintética. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación se llevó a cabo sobre el conjunto de test `pipecat-ai/smart-turn-data-v3.2-test`, con 9 104 clips, y el modelo se mantuvo congelado durante la evaluación.

## Capacidades

- Detección de finalización de turno en audio conversacional, sin necesidad de transcripción.
- Soporte multilingüe para inglés, hindi e hinglish (mezcla de ambos).
- Procesamiento de ventanas de audio de hasta 8 segundos, con relleno a la izquierda para mantener la muestra más reciente en el borde derecho.
- Salida como probabilidad sigmoide (`p_complete`) que indica la confianza de que el hablante ha terminado su turno.
- Inferencia en tiempo real gracias a su formato ONNX y su tamaño reducido.
- No incluye generación de texto, tool calling ni capacidades de agente; es exclusivamente un clasificador de audio.

## Casos de uso

- Endpointing en agentes de voz: el modelo decide cuándo el usuario ha terminado de hablar, evitando interrupciones por pausas breves o muletillas. Se integra en el pipeline de un agente conversacional para controlar el momento de respuesta.
- Sistemas de diálogo por voz en atención al cliente: permite que un IVR o asistente virtual espere a que el cliente complete su turno, incluso si hay dudas o cambios de idioma (hinglish), mejorando la experiencia de usuario.
- Moderación de turnos en conferencias o reuniones: puede utilizarse para detectar cuándo un participante ha finalizado su intervención y dar paso al siguiente, en herramientas de colaboración por voz.
- Asistentes de voz en dispositivos embebidos: al ser un modelo ONNX ligero, puede ejecutarse en dispositivos con recursos limitados para controlar la interacción por voz.
- Análisis de conversaciones grabadas: aplicado a audio almacenado, permite segmentar turnos de habla para transcripción o análisis posterior, aunque su diseño está orientado a tiempo real.
- Pruebas de sistemas de voz: en entornos de desarrollo, sirve para validar el comportamiento de endpointing en diferentes condiciones de habla (real vs. sintética) y calibrar umbrales de decisión.

## Benchmarks y rendimiento

El autor publicó resultados de evaluación sobre el conjunto de test `pipecat-ai/smart-turn-data-v3.2-test`, con 9 104 clips. No se han publicado comparativas con otros modelos de detección de turno.

| Subconjunto | Clips | Accuracy (umbral 0.5) | ROC AUC |
|---|---:|---:|---:|
| Global | 9 104 | 93.70 % | 0.9826 |
| Hindi | 1 284 | 93.93 % | 0.9853 |
| Ingles | 7 820 | 93.66 % | 0.9820 |
| Habla real | 5 367 | 94.37 % | 0.9862 |
| Habla sintetica | 3 737 | 92.72 % | 0.9766 |

## Requisitos de hardware

- Al ser un modelo ONNX basado en el encoder Whisper Tiny, su huella de memoria es reducida; se estima que puede ejecutarse en CPU sin problemas, aunque no se proporcionan cifras exactas de VRAM.
- No se especifican GPUs recomendadas; el modelo es adecuado para CPU de gama media o GPUs modestas (p. ej., NVIDIA T4, RTX 3060) si se requiere baja latencia.
- Es viable en dispositivos embebidos o edge gracias a su tamaño compacto y al formato ONNX.
- Opciones de despliegue: onnxruntime (Python, C++, mobile), o integración en frameworks de voz como Pipecat o VIVA SDK.
- La latencia y el throughput no se han publicado; al tratarse de una ventana fija de 8 segundos, la inferencia es de un solo paso, lo que sugiere tiempos de respuesta en el orden de milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables como `pipecat-ai/smart-turn-v2` o el modelo Turn-Taking v2 de Krisp, por lo que no es posible establecer una comparación cuantitativa. Ambos abordan el mismo problema de detección de turno en audio, pero no se han publicado métricas equivalentes en las fuentes consultadas.

## Limitaciones y advertencias

- El entrenamiento se realizó con una proporción significativa de habla sintética, lo que puede afectar al rendimiento en condiciones de habla real muy diferentes a las del dataset.
- El modelo está limitado a las condiciones de habla representadas en el conjunto de entrenamiento (inglés, hindi e hinglish); no se garantiza su funcionamiento en otros idiomas o acentos.
- La ventana de contexto es fija de 8 segundos; audio más largo debe truncarse o segmentarse, y audio más corto debe rellenarse con ceros a la izquierda.
- El umbral de decisión (0.5 por defecto) debe calibrarse con tráfico real de despliegue; un umbral más alto reduce interrupciones pero aumenta el retardo de respuesta, y viceversa.
- No se han publicado análisis de sesgos ni de robustez frente a ruido, solapamiento de hablantes o condiciones acústicas adversas.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vedants254/voice-turn-detection
- Repositorio GitHub: https://github.com/vedants254/Voice-Turn-detection
- Perfil del autor en Hugging Face: https://huggingface.co/vedants254
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
