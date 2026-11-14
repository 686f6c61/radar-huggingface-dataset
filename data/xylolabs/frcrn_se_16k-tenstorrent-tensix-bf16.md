# Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix-BF16

## Resumen

FRCRN_SE_16K-Tenstorrent-Tensix-BF16 es una conversión del modelo de mejora de voz y supresión de ruido FRCRN_SE_16K (originalmente publicado por alibabasglab), adaptada por Xylolabs para su ejecución sobre hardware Tenstorrent mediante la pila TT-NN. No se trata de un modelo de lenguaje, sino de una red convolucional compleja orientada a audio-to-audio: recibe un espectro complejo normalizado de una señal de voz a 16 kHz y produce una máscara compleja que, aplicada al espectro original, reduce el ruido de fondo.

El modelo base FRCRN (Frequency-Recurrent Convolutional Recurrent Network) emplea dos ramas UNet con convoluciones complejas y capas FSMN (Feedforward Sequential Memory Networks) para modelar dependencias temporales y frecuenciales. Esta versión concreta no reentrena el modelo: reescribe los pesos de convolución compleja como matrices de bloques reales, pliega las capas de batch normalization dentro de las convoluciones y serializa todos los tensores en bfloat16, con un layout pensado para implementaciones TT-NN sobre chips Tensix.

Su relevancia es acotada pero específica: permite desplegar supresión de ruido en aceleradores Tenstorrent sin depender de PyTorch en el dispositivo, con un peso en disco mínimo (unos 0,05 GB de tensores) y una conversión reproducible y verificada contra el checkpoint original. Es una pieza de infraestructura para pipelines de audio en hardware alternativo, no un modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FRCRN: dos UNet con convoluciones complejas (representadas como matrices de bloques reales) y capas FSMN |
| Parámetros totales | 23.760.720 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 51 frames (espectro complejo [1, 2, 321, 51]) |
| Tipos de cuantización | bfloat16 (BF16) exclusivamente en los pesos almacenados |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) + config.json |
| Frecuencia de muestreo | 16 kHz |
| FFT / hop | 640 puntos / 320 muestras |
| Salida | máscara compleja tanh(u1) + tanh(u2) en layout real/imaginario |
| Hardware objetivo | Tenstorrent Tensix (TT-NN) |

## Arquitectura y entrenamiento

La arquitectura subyacente es FRCRN, una red de dos etapas UNet (codificador y decodificador con skip connections) en la que las convoluciones operan sobre números complejos. Cada convolución compleja se representa aquí como una matriz de bloques real de la forma [[Wr, -Wi], [Wi, Wr]], y la batch normalization posterior se pliega en los canales de salida de cada convolución. Los canales complejos se serializan como canales reales seguidos de canales imaginarios. Las capas FSMN aportan memoria secuencial sobre el eje temporal y frecuencial, cuyos ejes y orden quedan registrados en config.json.

No hay entrenamiento adicional en esta conversión: se parte del checkpoint original de alibabasglab/FRCRN_SE_16K (revisión 3766e6a64b0d8cb58f08d913d617bf129f11ed53, SHA256 b22256adbb91b68cf5a3db8f6657a4fb17066eecd5f069803e59c186c1cf3ebb) y se transforman únicamente los pesos. La conversión se realiza con convert_frcrn.py, que reproduce el proceso usando el paquete frcrn_se de ClearerVoice-Studio / clearvoice 0.1.2 y ejecuta una comparación determinista en CPU contra el modelo original sobre ocho espectros sintéticos. La implementación consumidora debe aportar el framing, la normalización, la aplicación de la máscara y la síntesis (iSTFT).

## Capacidades

- Supresión de ruido y mejora de voz en señales de 16 kHz mediante enmascaramiento espectral complejo.
- Procesamiento audio-to-audio: entrada de espectro complejo normalizado, salida de máscara compleja.
- Modelado conjunto de dependencias frecuenciales y temporales gracias a las capas FSMN.
- Ejecución en hardware Tenstorrent Tensix mediante TT-NN, sin dependencia de PyTorch en el dispositivo.
- Pesos en BF16 con layout de tensores documentado para integración directa en kernels TT-NN.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión, audio generativo ni modo thinking.

## Casos de uso

- Preprocesado de voz para ASR: aplicar la máscara estimada al espectro de entrada antes de alimentar un sistema de reconocimiento de voz, reduciendo ruido de fondo en grabaciones a 16 kHz y mejorando la tasa de acierto en entornos ruidosos.
- Cancelación de ruido en llamadas VoIP: integrar el modelo en el pipeline de audio de una aplicación de telefonía sobre aceleradores Tenstorrent, aplicando la máscara por ventanas de 51 frames con hop de 320 muestras.
- Limpieza de datasets de audio: procesar por lotes corpus de voz para entrenamiento de modelos ASR o TTS, eliminando ruido estacionario y no estacionario antes de la transcripción o el etiquetado.
- Despliegue en edge con aceleradores Tenstorrent: usar el modelo como componente de un pipeline de audio en dispositivos con chip Tensix, aprovechando el peso reducido (unos 0,05 GB de tensores) y el formato BF16 para minimizar el uso de memoria.
- Investigación en hardware alternativo: servir como caso de referencia para validar implementaciones TT-NN de operaciones con convoluciones complejas y FSMN, comparando la salida contra el checkpoint original en CPU.
- Postproducción de podcast y vídeo: aplicar la mejora de voz a pistas de locución grabadas en condiciones subóptimas, siempre que la integración aporte el framing, la normalización y la síntesis iSTFT necesarios.
- Transcripción de reuniones: preprocesar el audio de reuniones capturado con micrófonos de sala antes de enviarlo a un servicio de transcripción, reduciendo reverberación y ruido de fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (PESQ, STOI, SI-SNR) en la información disponible. La model card únicamente reporta comprobaciones de equivalencia numérica frente al modelo original en CPU, medidas como SNR entre la salida de referencia y la salida convertida:

| Conjunto | Transformación float32, SNR de máscara | BF16 almacenado, SNR de máscara | BF16 almacenado, SNR de espectro mejorado |
|---|---:|---:|---:|
| Espectros normalizados held-out | 77,97 dB | 27,87 dB | 39,12 dB |
| Espectros sintéticos, semilla 20261112 | 96,55 dB | 17,46 dB | 17,66 dB |

Estas cifras miden la concordancia con el modelo original en CPU, no la calidad de la mejora de voz ni la velocidad en dispositivo. Los espectros sintéticos son valores aleatorios independientes y no constituyen un benchmark de calidad de audio.

## Requisitos de hardware

- VRAM estimada: no disponible para GPU convencional; los tensores almacenados ocupan aproximadamente 0,05 GB antes del empaquetado TT-NN, y debe reservarse memoria de dispositivo adicional para el packing y los buffers de trabajo.
- GPU recomendadas: no aplica; el modelo está orientado a aceleradores Tenstorrent Tensix mediante TT-NN.
- Compatibilidad con GPU de consumo: los pesos en safetensors pueden cargarse en CPU o GPU con la librería safetensors para inspección o conversión, pero la ejecución prevista es sobre Tensix.
- Opciones de despliegue: TT-NN sobre hardware Tenstorrent; la conversión y validación se ejecutan en CPU con torch, numpy y safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FRCRN_SE_16K-Tenstorrent-Tensix-BF16 (este) | 23.760.720 | 51 frames, 16 kHz | safetensors BF16 | Apache-2.0 | Hugging Face |
| alibabasglab/FRCRN_SE_16K (base) | no disponible | 16 kHz | checkpoint original | Apache-2.0 | Hugging Face |
| Otros modelos de supresión de ruido (p. ej. FRCRN de ModelScope, Demucs, RNNoise) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; los datos de parámetros, contexto y rendimiento de otros modelos de supresión de ruido no se han incluido en la búsqueda.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Solo procesa audio a 16 kHz con FFT de 640 puntos y hop de 320 muestras; otras frecuencias de muestreo requieren remuestreo previo.
- La implementación consumidora debe aportar framing, normalización, aplicación de la máscara y síntesis iSTFT; el repositorio solo contiene pesos y configuración.
- Las comprobaciones de equivalencia no miden calidad de mejora de voz ni velocidad en dispositivo; la degradación de SNR en BF16 frente a float32 (de 77,97 dB a 27,87 dB en máscara) es apreciable y debe evaluarse en la tarea concreta.
- Riesgo de artefactos o distorsión en señales con ruido no estacionario o con voz solapada; no se han publicado evaluaciones subjetivas (MOS) ni objetivas (PESQ, STOI).
- No se han documentado sesgos específicos, pero el modelo hereda los del checkpoint original de alibabasglab, entrenado sobre datos no detallados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base no incluye archivo LICENSE propio; el NOTICE identifica el repositorio, la revisión y los cambios realizados.
- No está afiliado ni respaldado por Tenstorrent.
- El repo tiene 52 descargas y 0 likes; no hay evidencia de uso en producción ni de mantenimiento continuo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix-BF16
- Modelo base: https://huggingface.co/alibabasglab/FRCRN_SE_16K
- Revisión del checkpoint original: https://huggingface.co/alibabasglab/FRCRN_SE_16K/tree/3766e6a64b0d8cb58f08d913d617bf129f11ed53
- Script de conversión: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix-BF16/blob/main/convert_frcrn.py
- Licencia: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix-BF16/blob/main/LICENSE
- ClearerVoice-Studio: https://github.com/modelscope/ClearerVoice-Studio
- Documentación de Tenstorrent: https://docs.tenstorrent.com
