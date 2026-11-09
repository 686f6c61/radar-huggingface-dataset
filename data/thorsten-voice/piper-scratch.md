# Thorsten-Voice/Piper-Scratch

## Resumen

Piper-Scratch es un modelo de sintesis de voz (text-to-speech) en aleman, de un solo hablante, desarrollado por Thorsten-Voice (Thorsten Muller) y publicado bajo la libreria Piper. Se trata de un checkpoint VITS exportado a ONNX, entrenado integramente desde cero sobre las grabaciones propias del autor, sin partir de ningun checkpoint de terceros. Su relevancia principal es la licencia: la mayoria de voces Piper se afinan a partir de `en_US-lessac`, cuyo dataset subyacente solo permite uso de investigacion; este modelo elimina esa dependencia y se publica en dominio publico (CC0 1.0).

El modelo se distribuye en calidad `medium` a 22.050 Hz y esta pensado tanto para inferencia directa con el runtime Piper como para servir de punto de partida limpio (libre de ataduras de licencia) para afinar otras voces con espeak-ng. El estado declarado por el autor es experimental (v0.1): la inteligibilidad es clara y la voz es reconociblemente la de Thorsten, pero la pronunciacion y el acento de algunas palabras quedan por debajo de la voz Piper existente basada en lessac.

Al tratarse de un modelo TTS y no de un LLM, no dispone de ventana de contexto ni de parametros en el sentido habitual de los transformers generativos; sus especificaciones se centran en arquitectura acustica, datos de entrenamiento y metricas de validacion (mel y UTMOS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS), exportado a ONNX; pipeline Piper |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto por frase/utterance) |
| Tipos de cuantizacion | no disponible (se distribuye un unico ONNX `medium` a 22.050 Hz) |
| Idiomas soportados | aleman (`de`) |
| Licencia | CC0 1.0 (pesos y model card); codigo piper1-gpl y espeak-ng bajo GPL-3.0 |
| Formato de pesos | ONNX (`de_DE-thorsten_scratch-medium.onnx`), config JSON y checkpoints Lightning `.ckpt` |
| Frecuencia de muestreo | 22.050 Hz, mono |
| Calidad | medium |
| Hablantes | 1 (single-speaker, estilo neutro) |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS empleada por Piper: un generador condicionado por texto fonemizado que combina un encoder de texto, un prior variacional y un decoder basado en flujos (spline flows) con un vocoder integrado, entrenado de forma adversarial con discriminadores. La fonemizacion se realiza con espeak-ng en idioma `de`, con texto en minusculas y normalizado.

El entrenamiento se hizo desde cero, sin `--ckpt_path`, sin `--model.warmstart_ckpt` y sin `--model.vocoder_warmstart_ckpt`, usando el dataset Thorsten-Voice 2022.10 (neutro, CC0): 12.450 enunciados, 11,22 horas de audio a 22.050 Hz mono, con duracion media de 3,24 s por enunciado. El split reserva un 10 % para validacion y 20 ejemplos de test no usados en entrenamiento. Se empleo piper1-gpl sobre PyTorch 2.15.0+cu132 con Lightning, una NVIDIA A40 (48 GB), batch de 32 con length bucketing, 1.800 epochs (aproximadamente 214 pasadas del vocoder sobre el audio) y un schedule de decaimiento exponencial del learning rate hasta el 5 % del valor inicial, con una duracion total de unos 4,3 dias (4-9 de noviembre de 2026).

Metricas de validacion finales: `val_mel` = 0,3751 en el checkpoint de la epoch 1799 (`last`), y `val_mos` (UTMOS) = 3,33 en el checkpoint de la epoch 1791. El autor advierte que UTMOS esta entrenado principalmente en ingles y que las voces alemanas suelen situarse entre 3,3 y 3,8.

## Capacidades

- Sintesis de voz en aleman a partir de texto, con salida de audio a 22.050 Hz.
- Voz de un unico hablante (Thorsten), estilo neutro.
- Fonemizacion automatica mediante espeak-ng en idioma `de`.
- Inferencia via runtime Piper (`piper-tts`) y via ONNX Runtime.
- Punto de partida para fine-tuning de voces Piper sin dependencia de checkpoints de terceros.
- Exportable y desplegable en entornos sin GPU mediante ONNX.
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking (no es un LLM).

## Casos de uso

- Lectura de articulos y textos largos en aleman: el modelo convierte texto plano en audio por utterance, adecuado para pipelines de sintesis por lotes con el CLI de Piper.
- Audiolibros y contenido accesible: su licencia CC0 permite generar y distribuir audio sin restricciones de atribucion ni de uso comercial derivadas del modelo.
- Asistentes de voz locales y offline: al ejecutarse sobre ONNX Runtime y no requerir GPU, encaja en dispositivos embebidos o aplicaciones de escritorio sin conexion.
- Base para fine-tuning de nuevas voces: el checkpoint `epoch=1799-last.ckpt` permite iniciar entrenamientos con `--model.warmstart_ckpt` en cualquier idioma soportado por espeak-ng en calidad `medium`, sin arrastrar la licencia de lessac.
- Sistemas de anuncios y avisos automatizados en aleman: la latencia baja de Piper y la salida a 22.050 Hz son suficientes para mensajes cortos y notificaciones.
- Investigacion en TTS con datos limpios: sirve como referencia reproducible de entrenamiento desde cero con un dataset CC0 documentado (12.450 enunciados, 11,22 h).
- Prototipado de interfaces de voz: integracion en aplicaciones que necesitan una voz alemana libre de restricciones para demos y pruebas internas.

## Benchmarks y rendimiento

| Metrica | Checkpoint | Valor |
|---|---|---|
| val_mel | epoch 1799 (`last`) | 0,3751 |
| val_mos (UTMOS) | epoch 1791 | 3,33 |

No se han publicado resultados comparativos adicionales (MOS humano, WER de sintesis, latencia) en la informacion disponible. El autor indica que las voces alemanas en UTMOS suelen situarse entre 3,3 y 3,8, por lo que 3,33 queda en el extremo inferior de ese rango.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo `medium` exportado a ONNX, la inferencia cabe holgadamente en CPU y en GPU de gama baja.
- GPU recomendadas: no se especifican; el entrenamiento se realizo con 1 x NVIDIA A40 (48 GB), pero la inferencia no requiere esa clase de hardware.
- Cabe en GPU de consumo: si, al ejecutarse via ONNX Runtime; el autor no publica requisitos minimos concretos.
- Opciones de despliegue: runtime Piper (`pip install piper-tts`), ONNX Runtime; el modelo no es compatible con vLLM, TGI ni llama.cpp por no ser un LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Licencia | Base de entrenamiento | Estado |
|---|---|---|---|---|---|
| Piper-Scratch (este) | de | VITS / ONNX, medium, 22.050 Hz | CC0 1.0 | Desde cero, Thorsten-Voice 2022.10 (11,22 h) | Experimental v0.1 |
| Voz Piper Thorsten basada en lessac | de | VITS / ONNX | Dependiente de lessac (investigacion) | Fine-tune de `en_US-lessac` | Publicada |
| `en_US-lessac` (Piper) | en | VITS / ONNX | Dataset solo para investigacion | Dataset lessac | Referencia upstream |

La comparativa se limita a las alternativas citadas en la model card; no se dispone de datos de benchmarks cruzados ni de otras voces Piper alemanas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental (v0.1): pronunciacion y acento de algunas palabras son notablemente peores que en la voz Piper de Thorsten basada en lessac (ejemplos citados: *Intendantin, Rathaus, sprichst, Tobias, Rheinufer, Gratiszeitungen*).
- Causa probable segun el autor: solo unas 10 h de audio de entrenamiento sin preentrenamiento, combinado con errores de fonemizacion de espeak-ng que un modelo con mas datos compensa mejor.
- Un unico hablante y estilo neutro; no permite cambio de voz ni de emocion.
- Solo aleman; no soporta otros idiomas.
- UTMOS esta sesgado hacia el ingles, por lo que la metrica de 3,33 no es directamente comparable con voces inglesas.
- Licencia CC0 1.0 para pesos y model card; el codigo piper1-gpl y espeak-ng son GPL-3.0, lo que afecta al software, no al modelo de voz.
- Nota de exportacion: con PyTorch >= 2.9 el export ONNX de piper1-gpl requiere `pip install onnxscript` y `dynamo=False` en `torch.onnx.export(...)` de `src/piper/train/export_onnx.py`, porque el nuevo exportador falla con los spline flows de VITS.
- Sin descargas ni likes registrados en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thorsten-Voice/Piper-Scratch
- Sitio del autor: https://www.thorsten-voice.de
- Repositorio de entrenamiento y runtime Piper: https://github.com/OHF-Voice/piper1-gpl
