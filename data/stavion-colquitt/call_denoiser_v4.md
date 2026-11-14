# Stavion-Colquitt/Call_Denoiser_V4

## Resumen

Call Denoiser V4 es un modelo de supresión de ruido para voz en tiempo real, desarrollado por Stavion-Colquitt y publicado en Hugging Face bajo licencia MIT. Se trata de la cuarta iteración de un supresor de ruido orientado a llamadas y reuniones, con un tamaño de 988.000 parámetros y una latencia algorítmica de 10 ms. El modelo procesa audio mono a 16 kHz y está diseñado para ejecutarse en CPU con un coste de 0,15 ms por bloque de 5 ms, lo que lo hace adecuado para entornos de bajos recursos y aplicaciones en tiempo real.

La arquitectura combina ventanas de análisis y síntesis asimétricas con una red neuronal recurrente (GRU de dos capas con 256 unidades) que estima una máscara de magnitud sobre el espectro de la señal ruidosa, conservando la fase original. El modelo se distribuye en formato ONNX para inferencia optimizada y en un checkpoint de PyTorch para reentrenamiento o inspección. Su relevancia actual radica en que es la primera versión de la familia que supera a la entrada ruidosa en todas las métricas evaluadas sobre VoiceBank-DEMAND, con una mejora notable en PESQ (de 1,97 a 2,58) y en SI-SDR (de 8,45 dB a 17,21 dB), manteniendo una latencia muy inferior a las versiones anteriores (10 ms frente a 200 ms).

El modelo está pensado para integración en pipelines de audio en tiempo real, como llamadas VoIP, reuniones virtuales o grabaciones de voz, donde se requiere eliminar ruido de fondo sin introducir retardos perceptibles. No obstante, su ámbito de aplicación es acotado: audio mono a 16 kHz, sin capacidad de eliminar reverberación y con limitaciones en relaciones señal-ruido muy bajas o con hablantes superpuestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (GRU) con ventanas STFT asimétricas y máscara de magnitud |
| Parametros totales | 988.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por tramas de 5 ms; ventana de análisis de 32 ms) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y PyTorch float32) |
| Idiomas soportados | no disponible (independiente del idioma; procesa señal de voz) |
| Licencia | MIT |
| Formato de pesos | ONNX (`call_denoiser_v4.onnx`) y PyTorch (`call_denoiser_v4.pth`) |

## Arquitectura y entrenamiento

El modelo emplea un esquema de análisis/síntesis con ventanas asimétricas (Wang et al. 2021): ventana de análisis de 32 ms, ventana de síntesis de 10 ms y salto de 5 ms. Para cada trama, la magnitud comprimida se pasa por una capa Linear, una LayerNorm y una GRU de dos capas con 256 unidades ocultas, que produce una máscara de magnitud sigmoide. La fase de la señal ruidosa se conserva sin modificar, ya que en la versión anterior (v3) se comprobó que una fase aprendida degradaba la calidad. El modelo es causal y procesa bloques de 80 muestras (5 ms a 16 kHz) con un estado recurrente de 256 unidades por capa.

El entrenamiento se realizó durante 26.208 pasos con lotes de 32 segmentos de 4 segundos en una RTX 2060. La función de pérdida combina la pérdida espectral comprimida (Braun & Tashev) con una pérdida multi-resolución de STFT, optimizada con AdamW, calentamiento y decaimiento coseno, y media móvil exponencial (EMA) de 0,999. Los datos de entrenamiento provienen en un 60% del conjunto de entrenamiento de VoiceBank-DEMAND (CC BY 4.0), con los hablantes p226 y p287 reservados para desarrollo, y en un 40% de mezclas en línea de voz limpia y ruido del DNS Challenge con relaciones SNR entre -5 y 20 dB. El conjunto de test de VoiceBank-DEMAND no se utilizó ni para entrenamiento ni para selección de modelo.

## Capacidades

- Supresión de ruido de fondo en tiempo real para voz mono a 16 kHz.
- Procesamiento causal con latencia algorítmica de 10 ms y bloques de 5 ms.
- Inferencia en CPU con un coste de 0,15 ms por bloque de 5 ms (factor de tiempo real 0,03).
- Modo streaming y modo offline con paridad de 108,3 dB entre ambos.
- Conservación de la fase original de la señal ruidosa.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no aplicables: procesa señal de voz independientemente del idioma.
- No dispone de modo thinking, visión ni audio más allá del audio-to-audio.

## Casos de uso

- Llamadas VoIP y videoconferencias: el modelo se integra en el pipeline de captura de audio para eliminar ruido de fondo (teclado, ventiladores, tráfico) antes de la codificación, gracias a su latencia de 10 ms y su coste de CPU de 0,15 ms por bloque, que no introduce retardo perceptible.
- Reuniones virtuales en entornos domésticos: se puede desplegar en el cliente o en el servidor para limpiar la señal de micrófonos en salas con ruido ambiental, manteniendo la inteligibilidad (STOI de 0,930) y la calidad percibida (PESQ de 2,58).
- Grabación de voz para podcasts o notas de voz: el modo offline (`process_file`) permite limpiar grabaciones completas de 16 kHz sin necesidad de GPU, usando el mismo modelo que en streaming.
- Preprocesamiento para sistemas de reconocimiento automático de voz (ASR): al mejorar la relación señal-ruido (SI-SDR de 17,21 dB), puede reducir la tasa de error de transcripción en entornos ruidosos antes de pasar la señal a un motor ASR.
- Atención al cliente automatizada: en centros de contacto con agentes humanos o bots de voz, el denoiser se puede aplicar en la ruta de audio entrante para mejorar la claridad de las conversaciones multi-turno, siempre que la SNR no sea inferior a -5 dB.
- Dispositivos embebidos y edge computing: con 988.000 parámetros y formato ONNX, el modelo cabe en dispositivos con recursos limitados (Raspberry Pi, teléfonos móviles) para supresión de ruido local sin conexión a la nube.
- Herramientas de accesibilidad: limpieza de audio en tiempo real para personas con dificultades auditivas o en sistemas de subtitulado automático que requieren una señal de voz más limpia.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de VoiceBank-DEMAND (824 archivos, 16 kHz), evaluados una vez con el mejor checkpoint de desarrollo.

| Metrica | Entrada ruidosa | v2 | v3 | v4 |
|---|---|---|---|---|
| PESQ (WB) | 1,97 | 1,65 | 1,70 | 2,58 |
| STOI | 0,921 | 0,869 | 0,874 | 0,930 |
| SI-SDR (dB) | 8,45 | 13,36 | 13,17 | 17,21 |
| Latencia algorítmica | no disponible | 200 ms | 200 ms | 10 ms |

Nota del autor: las versiones v1-v3 nunca vieron VoiceBank-DEMAND; v4 entrena con su split de entrenamiento (hablantes distintos al test), que es el protocolo estándar del benchmark y parte de la mejora. Paridad streaming/offline: 108,3 dB. Coste de CPU por bloque de 5 ms (ONNX Runtime): 0,15 ms (factor de tiempo real 0,03).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. En GPU, el uso de memoria es mínimo (menos de 1 GB para los pesos en float32).
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una RTX 2060. Para inferencia no se requiere GPU.
- Cabe en cualquier GPU de consumo e incluso en CPU de gama baja; el coste es de 0,15 ms por bloque de 5 ms en ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (recomendado, con `stream.py`), PyTorch (checkpoint `.pth`), y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 10 ms algorítmica; throughput no especificado más allá del factor de tiempo real de 0,03 en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor compara únicamente con las versiones anteriores de la misma familia (v2 y v3), cuyos resultados se incluyen en la tabla de benchmarks. No se han publicado comparaciones con otros denoisers como RNNoise, DeepFilterNet o Demucs en la información disponible.

## Limitaciones y advertencias

- El modelo elimina ruido, no reverberación; no está diseñado para reducir eco o reverb.
- Relaciones señal-ruido muy bajas (por debajo de -5 dB) y hablantes superpuestos quedan fuera del rango de entrenamiento.
- Solo procesa audio mono a 16 kHz; es necesario remuestrear otras frecuencias antes de la inferencia.
- No se han documentado sesgos específicos, pero al entrenarse con VoiceBank-DEMAND y DNS Challenge, puede tener un rendimiento desigual según el tipo de ruido, el acento o el idioma de los hablantes.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la máscara de magnitud podría introducir artefactos o distorsión en señales fuera de distribución.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright y la licencia. Los datos de entrenamiento tienen licencias propias (VoiceBank-DEMAND CC BY 4.0; DNS Challenge con licencias por fuente) que deben verificarse para uso comercial.
- El modelo fue construido con asistencia de IA (Claude, de Anthropic) para código y documentación, según declara el autor; las decisiones técnicas y la evaluación son suyas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que puede indicar que los archivos aún no se han subido o que el repositorio está vacío; verificar antes de su uso en producción.

## Enlaces

- [Hugging Face: Stavion-Colquitt/Call_Denoiser_V4](https://huggingface.co/Stavion-Colquitt/Call_Denoiser_V4)
- [GitHub: Audio_ML_Noise_Reduction](https://github.com/Stavion-Colquitt/Audio_ML_Noise_Reduction)
