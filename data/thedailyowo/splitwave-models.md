# TheDailyOWO/splitwave-models

## Resumen

Splitwave models es un repositorio de modelos ONNX orientados a la separación de fuentes musicales (stem separation) directamente en el navegador. Lo publica el autor TheDailyOWO como redistribución convertida de cuatro modelos de separación de audio ya existentes, empleados por la aplicación web Splitwave, que separa una canción en voces, instrumental, voz principal y coros ejecutando la inferencia en el equipo del visitante mediante WebGPU o WebAssembly.

El repositorio no entrena ningún modelo nuevo: su aportación es la conversión a ONNX y la reestructuración de las redes RoFormer para sortear los límites de WebGPU sin alterar las matemáticas originales. Incluye dos modelos RoFormer en fp16 (BS-RoFormer de viperx, con SDR 12,98, y Mel-Band RoFormer karaoke de aufr33 y viperx, con SDR 10,20) y dos modelos MDX-Net en fp32 de menor coste computacional (UVR-MDX-NET Voc_FT y UVR_MDXNET_KARA_2, del equipo Ultimate Vocal Remover).

Es relevante porque demuestra un patrón de despliegue de separación musical de alta calidad sin servidor: los pesos se descargan al cliente, se validan contra un manifiesto con SHA-256 y se ejecutan en GPU local. El repositorio ocupa 0,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoFormer (BS-RoFormer y Mel-Band RoFormer) y MDX-Net (UVR-MDX-NET) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa fragmentos de 8 segundos (STFT estéreo de `[1, 2050, 801, 2]`, n_fft 2048, hop 441) |
| Tipos de cuantizacion | fp16 (RoFormer) y fp32 (MDX-Net); no se documentan otras |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | `other`, con licencia por modelo (`per-model`); los pesos pertenecen a sus autores originales |
| Formato de pesos | ONNX, más `manifest.json` con tamanos y SHA-256 |

## Arquitectura y entrenamiento

Los cuatro modelos son redes de separación de fuentes que operan en el dominio espectral. Los RoFormer (BS-RoFormer y Mel-Band RoFormer) reciben el STFT estéreo de un fragmento de 8 segundos y devuelven la máscara compleja que se multiplica por dicho STFT; la STFT y su inversa se ejecutan en la propia aplicación, no dentro del grafo ONNX. La exportación se realizó desde los checkpoints originales de PyTorch con el script `convert/roformer.py` de Splitwave, y el band split se reestructuró para respetar los límites de WebGPU sin modificar las matemáticas. Antes de la conversión a fp16 se validó cada export contra el modelo original sobre audio real, manteniendo en fp32 las capas de normalización y las tablas de posición rotatoria.

Los MDX-Net (UVR-MDX-NET Voc_FT y UVR_MDXNET_KARA_2) se redistribuyen en fp32 sin cambios respecto al original. No hay información sobre el entrenamiento original: ni número de tokens o horas de audio, ni composición del dataset, ni uso de RLHF o DPO, ni innovaciones de entrenamiento. Los pesos proceden del repositorio de modelos de `python-audio-separator` y pertenecen al equipo Ultimate Vocal Remover, a viperx y a aufr33.

## Capacidades

- Separación de voces e instrumental con BS-RoFormer (SDR 12,98), la variante de mayor calidad del repositorio.
- Separación de voz principal y coros con Mel-Band RoFormer karaoke (SDR 10,20).
- Separación rápida de voces e instrumental con UVR-MDX-NET Voc_FT (fp32).
- Separación rápida de voz principal y coros con UVR_MDXNET_KARA_2 (fp32).
- Inferencia en navegador sobre WebGPU o WebAssembly, sin backend propio.
- Procesamiento por fragmentos de 8 segundos con STFT externa gestionada por la aplicación.
- Verificación de integridad de las descargas mediante `manifest.json` (tamaño y SHA-256).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada en sentido ASR ni generación de texto.

## Casos de uso

- Aplicación web de karaoke: el modelo Mel-Band RoFormer karaoke separa voz principal y coros para generar pistas de acompañamiento; al ejecutarse en el cliente con WebGPU, el audio del usuario no sale de su equipo.
- Creación de pistas de acompañamiento para músicos: BS-RoFormer extrae voces e instrumental con SDR 12,98, suficiente para ensayos y maquetas sin depender de un servicio en la nube.
- Edición y remezcla de audio en el navegador: la integración de los modelos ONNX en un editor web permite aislar stems y aplicar procesado posterior sin subir archivos a un servidor.
- Herramientas de estudio musical: la separación de voz principal y coros facilita el análisis de arreglos vocales y la transcripción manual posterior.
- Prototipado rápido en local: los modelos MDX-Net en fp32 ofrecen una ruta de menor coste para pruebas de concepto y comparación de calidad frente a los RoFormer.
- Distribución de modelos en aplicaciones de escritorio Electron o PWA: el formato ONNX y el manifiesto con SHA-256 simplifican la descarga, verificación y caché de pesos en el cliente.
- Investigación en separación de fuentes: el repositorio sirve como referencia de conversión de RoFormer a ONNX con restricciones de WebGPU documentadas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los SDR de los modelos originales, no mediciones propias del repositorio.

| Modelo | Tarea | SDR | Precisión |
|---|---|---|---|
| BS-RoFormer (ep 317) | voces / instrumental | 12,98 | fp16 |
| Mel-Band RoFormer karaoke | voz principal / coros | 10,20 | fp16 |
| UVR-MDX-NET Voc_FT | voces / instrumental | no disponible | fp32 |
| UVR_MDXNET_KARA_2 | voz principal / coros | no disponible | fp32 |

No se han publicado resultados de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,9 GB, por lo que los pesos de cada modelo individual son una fracción de esa cifra.
- GPU recomendadas: no disponibles; el requisito real es compatibilidad con WebGPU en el navegador.
- Cabe en GPU de consumo: sí, al estar diseñado para ejecutarse en el navegador del visitante; no se especifican modelos concretos.
- Opciones de despliegue: inferencia en navegador con WebGPU o WebAssembly mediante la aplicación Splitwave; al ser ONNX, es desplegable con ONNX Runtime en otros entornos, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | SDR | Formato | Licencia |
|---|---|---|---|---|---|
| Splitwave models (BS-RoFormer) | RoFormer | voces / instrumental | 12,98 | ONNX fp16 | per-model |
| Splitwave models (Mel-Band RoFormer karaoke) | RoFormer | voz principal / coros | 10,20 | ONNX fp16 | per-model |
| Splitwave models (UVR-MDX-NET) | MDX-Net | voces / instrumental y karaoke | no disponible | ONNX fp32 | per-model |
| Demucs (referencia externa) | Híbrido waveform/espectrograma | separación multitrack | no disponible en esta información | PyTorch | MIT (según su proyecto original) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: es una redistribución convertida; los pesos pertenecen a sus autores originales.
- La licencia es `other` con términos por modelo; es obligatorio revisar las condiciones de Ultimate Vocal Remover, viperx y aufr33 antes de cualquier uso comercial.
- No hay información sobre sesgos; al ser un modelo de audio, los sesgos se manifestarían como degradación en géneros, idiomas o instrumentaciones poco representadas en los datos de entrenamiento originales.
- Riesgo de artefactos y separación imperfecta en mezclas densas o con reverberación; los SDR publicados son promedios y no garantizan calidad en casos concretos.
- Procesa fragmentos de 8 segundos, por lo que la gestión de bordes y la continuidad entre fragmentos recae en la aplicación que lo integra.
- El soporte de idiomas no está documentado y no aplica a la tarea.
- La inferencia depende de WebGPU o WebAssembly; el rendimiento varía según el navegador y el hardware del cliente.
- No se han publicado descargas ni validaciones de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TheDailyOWO/splitwave-models
- Aplicación Splitwave: https://github.com/PolysheepCodes/Splitwave
- Script de conversión: https://github.com/PolysheepCodes/Splitwave/blob/main/convert/roformer.py
- Repositorio de modelos de python-audio-separator: https://github.com/nomadkaraoke/python-audio-separator
