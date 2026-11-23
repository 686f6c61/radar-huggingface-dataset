# wasi-master/parakeet-ultra-executorch

## Resumen

Parakeet Ultra ExecuTorch es una exportación del modelo de reconocimiento automático del habla (ASR) Parakeet Ultra de Moondream, a su vez un post-entrenamiento de parakeet-tdt-0.6b-v3 de NVIDIA. La exportación la firma wasi-master y está pensada para ejecutarse con ExecuTorch v1.5.1 sobre el backend XNNPACK, lo que permite inferencia local en dispositivos sin depender de un servidor. El modelo se distribuye como un fichero `.pte` cuantizado (8 bits en activaciones dinámicas y 4 bits en pesos por grupos de 32, esquema 8da4w) junto con el tokenizer SentencePiece original.

El modelo resuelve el problema de la transcripción de voz offline en aplicaciones de teclado y dictado, y es relevante porque demuestra un pipeline completo de conversión de pesos de transformers a NeMo, cuantización y exportación a un runtime embebido. Mantiene la arquitectura TDT (Token-and-Duration Transducer) del modelo base, con unos 0,6 mil millones de parámetros, y cubre 25 idiomas europeos.

El repositorio ocupa 1,6 GB y acumula 515 descargas en el momento de la consulta. La licencia es CC-BY-4.0, heredada del modelo original, y la exportación conserva la misma interfaz de programa (`preprocessor`, `encoder`, `decoder_step`, `joint`) que la exportación oficial de parakeet-tdt-0.6b-v3 en ExecuTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), exportada a ExecuTorch con backend XNNPACK |
| Parametros totales | 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8da4w (activaciones dinámicas de 8 bits, pesos de 4 bits en grupos de 32) |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.pte` (ExecuTorch) y `tokenizer.model` (SentencePiece) |

## Arquitectura y entrenamiento

El modelo base es parakeet-tdt-0.6b-v3 de NVIDIA, un transducer TDT con unos 0,6 mil millones de parámetros. Moondream publicó Parakeet Ultra como pesos de Hugging Face transformers, y esta exportación los reconvierte al formato de NeMo: los tensores se renombraron con el mapeo de conversión NeMo de transformers ejecutado en sentido inverso y se cargaron en el modelo NeMo de parakeet-tdt-0.6b-v3. El mapeo se validó previamente sobre v3, comprobando que cada peso NeMo coincide con el tensor homónimo de la conversión oficial de NVIDIA. La cabeza de actividad de voz (voice-activity) de Ultra no tiene equivalente en el modelo NeMo y se descartó.

La cuantización y exportación se realizaron con el script `examples/models/parakeet/export_parakeet_tdt.py` de ExecuTorch v1.5.1. El resultado es un programa `.pte` con los métodos `preprocessor`, `encoder`, `decoder_step` y `joint`, idénticos a los de la exportación oficial de parakeet-tdt-0.6b-v3, de modo que el runner de Parakeet de ExecuTorch puede ejecutarlo sin cambios. El repositorio incluye un `manifest.json` con las fuentes fijadas, los hashes de los ficheros y transcripciones de prueba. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) offline con arquitectura TDT.
- Transcripción multilingüe en 25 idiomas europeos: inglés, alemán, francés, español, italiano, portugués, ruso, ucraniano, croata, esloveno, letón, lituano, estonio, finés, sueco, danés, neerlandés, polaco, checo, eslovaco, húngaro, rumano, búlgaro, griego y maltés.
- Ejecución local en dispositivos mediante ExecuTorch y XNNPACK, sin necesidad de servidor.
- Integración directa con el runner de Parakeet de ExecuTorch gracias a la compatibilidad de métodos del programa.
- Tokenización con SentencePiece, sin cambios respecto a parakeet-tdt-0.6b-v3.
- Uso previsto en dictado por voz dentro de la aplicación WM Keyboard.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Dictado por voz en teclados móviles: WM Keyboard descarga este `.pte` y lo ejecuta con ExecuTorch para transcribir la voz del usuario en local, sin enviar audio a un servidor y con la cuantización 8da4w reduciendo el coste de cómputo en el dispositivo.
- Transcripción offline en aplicaciones de escritorio: al ser un programa ExecuTorch, puede integrarse en herramientas nativas que necesiten ASR sin conexión, con un único fichero de modelo y el tokenizer SentencePiece.
- Subtitulado y notas de reuniones en local: el soporte de 25 idiomas europeos permite transcribir reuniones multilingües sin salir del dispositivo, útil en entornos con requisitos de privacidad.
- Procesamiento por lotes en servidores con CPU: el backend XNNPACK y la cuantización 4-bit permiten desplegar la transcripción en hardware sin GPU dedicada.
- Investigación en ASR embebido: sirve como referencia reproducible de conversión transformers a NeMo, cuantización y exportación a ExecuTorch, con manifest de hashes y transcripciones de prueba.
- Aplicaciones de accesibilidad: entrada de texto por voz para usuarios con dificultades motoras, ejecutándose localmente y con latencia baja al no requerir red.
- Prototipado de pipelines ASR multilingües: el modelo cubre lenguas eslavas, bálticas y nórdicas poco frecuentes en otros modelos abiertos, lo que facilita pruebas rápidas en esas lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 1,6 GB, lo que da una idea del tamaño del artefacto descargable; el `.pte` cuantizado 8da4w es el componente principal.
- Al estar exportado a ExecuTorch con XNNPACK, el despliegue previsto es en CPU y dispositivos embebidos, no en GPU mediante frameworks de servidor.
- VRAM estimada para inferencia en GPU: no disponible.
- GPU recomendadas: no disponible; el formato no está pensado para ejecución en GPU con vLLM, TGI o llama.cpp.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime de ExecuTorch v1.5.1 con backend XNNPACK y el runner de Parakeet de ExecuTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet Ultra ExecuTorch (esta ficha) | 0,6 mil millones | no disponible | 25 | cc-by-4.0 | `.pte` (ExecuTorch) |
| parakeet-tdt-0.6b-v3 (NVIDIA) | 0,6 mil millones | no disponible | no disponible en la informacion | no disponible en la informacion | pesos NeMo / transformers |
| Parakeet Ultra (Moondream) | 0,6 mil millones | no disponible | no disponible en la informacion | cc-by-4.0 | pesos transformers |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento ni de contexto para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es una exportación, no un modelo nuevo: hereda los sesgos y limitaciones de Parakeet Ultra y de parakeet-tdt-0.6b-v3.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente con audio ruidoso o acentos no representados.
- La cabeza de actividad de voz de Ultra se eliminó en la conversión, por lo que no se dispone de esa funcionalidad.
- La cobertura lingüística se limita a 25 idiomas europeos; no se documentan otros idiomas.
- La licencia CC-BY-4.0 exige atribución a Moondream y a NVIDIA, e indica los cambios realizados (conversión a formato NeMo, cuantización y exportación a ExecuTorch).
- El formato `.pte` está atado a ExecuTorch v1.5.1 y al backend XNNPACK; no es directamente utilizable en vLLM, llama.cpp u otros runtimes.
- No se han publicado benchmarks en la información disponible, por lo que no puede evaluarse la pérdida de precisión frente al modelo original sin pruebas propias.
- El repositorio tiene 0 likes y 515 descargas, lo que indica una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasi-master/parakeet-ultra-executorch
- Modelo base Parakeet Ultra (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original parakeet-tdt-0.6b-v3 (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- ExecuTorch: https://github.com/pytorch/executorch
- Script de exportación: https://github.com/wasi-master/wmkeyboard/blob/main/tools/parakeet-ultra/export_ultra.py
- Aplicación WM Keyboard: https://github.com/wasi-master/wmkeyboard
