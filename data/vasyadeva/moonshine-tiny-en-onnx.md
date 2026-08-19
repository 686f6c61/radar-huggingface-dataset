# vasyadeva/moonshine-tiny-en-onnx

## Resumen

Moonshine Tiny es un modelo de reconocimiento automático del habla (ASR) desarrollado por Moonshine AI (antes Useful Sensors), diseñado específicamente para ejecutarse en dispositivos con recursos limitados. Este repositorio contiene una exportación a ONNX del modelo original para su uso con ONNX Runtime, pensada para inferencia on-device. Con solo 27,1 millones de parámetros, el modelo procesa audio crudo a 16 kHz sin rellenarlo a una ventana fija, lo que lo hace especialmente eficiente para comandos de voz cortos: una frase de dos segundos cuesta dos segundos de cómputo, a diferencia de la familia Whisper, cuyo encoder siempre procesa su ventana de 30 segundos.

La relevancia de esta exportación radica en que permite integrar Moonshine Tiny en aplicaciones móviles y de escritorio mediante ONNX Runtime, con tres grafos separados (encoder, inicialización del decoder y pasos posteriores del decoder) que mantienen la caché de atención entre tokens. El modelo es exclusivamente para inglés y se distribuye bajo licencia MIT, igual que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (export ONNX) |
| Parametros totales | 27,1 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no fija; procesa audio crudo sin ventana fija |
| Tipos de cuantizacion | solo float32; no se proporciona int8 (deliberadamente) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX con sidecars .data (encoder.onnx, decoder_init.onnx, decoder_step.onnx) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder transformer. El encoder convierte la forma de onda cruda a 16 kHz en estados ocultos de 288 dimensiones, generando aproximadamente 41 tramas por segundo de audio. El decoder tiene 6 capas con 8 cabezas de atención por capa (dimensión por cabeza de 36) y un vocabulario de 32.768 piezas. La exportación ONNX se divide en tres grafos: encoder.onnx (30,6 MB), decoder_init.onnx (75,5 MB) y decoder_step.onnx (71,7 MB), de modo que la caché de atención (self y cross) sobrevive entre tokens durante el decodificado greedy.

Los detalles del entrenamiento (composición del dataset, número de tokens, uso de RLHF o técnicas similares) no se detallan en la model card de esta exportación; se remite al artículo original (arXiv 2410.15608) y al repositorio de Moonshine AI. La exportación requiere `attn_implementation="eager"` porque la ruta SDPA por defecto falla en `torch.onnx.export` con `enable_gqa=True`.

## Capacidades

- Reconocimiento de voz en inglés a partir de audio crudo de 16 kHz, sin necesidad de preprocesado adicional.
- Decodificación greedy token a token con caché de atención persistente entre pasos.
- Eficiencia computacional proporcional a la duración del audio: una frase corta cuesta una fracción del cómputo que requiere un modelo de ventana fija.
- Compatible con ONNX Runtime, lo que permite despliegue en móviles y entornos sin PyTorch.
- Intercambiable con la variante ucraniana (mismo grafo, mismas entradas y salidas) simplemente sustituyendo los archivos, sin cambios en la aplicación.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo puede transcribir comandos cortos ("pon una alarma", "llama a María") con latencia de fracciones de segundo, algo inviable con modelos tipo Whisper que siempre procesan 30 segundos de audio.
- Transcripción en tiempo real en aplicaciones de escritorio: al ejecutarse en CPU x86, el encoder procesa 9-11 segundos de audio en 0,14-0,26 segundos, permitiendo transcripción continua sin GPU.
- Interfaz de voz para IoT y dispositivos embebidos: el tamaño reducido (27,1 M parámetros) y el formato ONNX permiten ejecutarlo en hardware con recursos limitados.
- Aplicaciones de accesibilidad: dictado de texto en inglés para personas con movilidad reducida, con respuesta inmediata y sin depender de la nube.
- Transcripción local de reuniones o llamadas: al procesar el audio en el propio dispositivo, se preserva la privacidad de los datos sin enviarlos a servidores externos.
- Prototipado rápido de ASR en producción: al ser un export ONNX estándar, se puede integrar en pipelines existentes con ONNX Runtime sin dependencias de PyTorch en el entorno de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (WER, CER) en la informacion disponible. Los datos de rendimiento verificados por el autor de la exportación son:

| Prueba | Resultado |
|---|---|
| Encoder en CPU x86 (Docker) | 0,14-0,26 s para 9-11 s de audio |
| Decodificación vs PyTorch original | idéntica en 3 muestras Fleurs en_us |
| Comparativa con Whisper small (iPhone 14 Pro Max) | 45,9 s para una pregunta de 3,3 s vs fracción de segundo |

## Requisitos de hardware

- Inferencia en CPU x86 verificada (Docker); el encoder tarda 0,14-0,26 s en procesar 9-11 segundos de audio.
- Diseñado para ejecución on-device: cabe en smartphones y dispositivos embebidos; el autor menciona una medición real en iPhone 14 Pro Max.
- Tamaño total del repositorio: 0,2 GB (grafos ONNX + pesos en sidecars .data).
- No requiere GPU; la inferencia en CPU es el caso de uso principal.
- Despliegue mediante ONNX Runtime; los pesos están en formato ONNX con sidecars .data que deben mantenerse junto a cada grafo.
- No se proporciona cuantización int8; cuantizar todo el modelo convierte las convoluciones del encoder en `ConvInteger`, para las que los builds de ONNX Runtime en móviles no tienen kernel y la sesión se niega a abrir.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Moonshine Tiny (ONNX) | 27,1 M | variable (sin padding) | en | MIT | ONNX |
| Whisper tiny | 39 M | fija (30 s) | multilingue | MIT | PyTorch/ONNX |
| Whisper small | 244 M | fija (30 s) | multilingue | MIT | PyTorch/ONNX |

La ventaja principal frente a Whisper es que el coste computacional escala con la duración real del audio: para comandos cortos, Moonshine Tiny es órdenes de magnitud más rápido (la medición del autor indica 45,9 s para Whisper small frente a una fracción de segundo en un iPhone 14 Pro Max para una pregunta de 3,3 s). Whisper, en cambio, ofrece soporte multilingüe, algo que Moonshine Tiny no tiene.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas; existe una variante ucraniana separada con licencia distinta (Moonshine AI Community License).
- Sin cuantización int8 disponible: cuantizar todo el modelo produce `ConvInteger` sin kernel en los builds móviles de ONNX Runtime; la sesión se niega a abrir.
- El grafo `decoder_step` requiere `encoder_hidden_states` aunque la caché cross-attention ya esté guardada; omitirlo produce texto fluido pero completamente inventado, sin error.
- `cache_position` es el índice absoluto del token actual (1 para el primer token generado, no 0); un error aquí produce resultados incorrectos.
- La exportación requiere `attn_implementation="eager"`; con SDPA por defecto, `torch.onnx.export` falla.
- La verificación se limitó a tres muestras Fleurs en_us; no se han publicado métricas WER/CER exhaustivas.
- Los derechos del modelo pertenecen a Moonshine AI; la licencia MIT cubre esta exportación concreta, no el modelo subyacente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vasyadeva/moonshine-tiny-en-onnx
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny
- Autores: https://huggingface.co/moonshine-ai
- Paper: https://arxiv.org/abs/2410.15608
- Variante ucraniana: https://huggingface.co/vasyadeva/moonshine-tiny-uk-onnx
