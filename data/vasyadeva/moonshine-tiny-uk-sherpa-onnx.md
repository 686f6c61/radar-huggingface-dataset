# vasyadeva/moonshine-tiny-uk-sherpa-onnx

## Resumen

Moonshine Tiny Ukrainian — ONNX for sherpa-onnx es una conversión a formato ONNX del modelo de reconocimiento automático del habla `moonshine-ai/moonshine-tiny-uk`, desarrollado originalmente por Moonshine AI (anteriormente Useful Sensors). El repositorio, publicado por el usuario vasyadeva, no entrena ni modifica los pesos: únicamente exporta los grafos del modelo original al layout que sherpa-onnx carga mediante `OfflineRecognizer.from_moonshine_v2`, con el objetivo de facilitar el despliegue en dispositivos y entornos de inferencia local sin dependencia de PyTorch.

El modelo base es un ASR específico para ucraniano de 27,1 millones de parámetros, lo que lo sitúa en la categoría de modelos ligeros orientados a inferencia on-device. La conversión conserva los pesos en float32 sin cuantización y separa la red en dos grafos: un encoder que transforma audio crudo a 16 kHz en estados internos y un decoder fusionado que combina las rutas con y sin caché mediante un flag `use_cache_branch`.

Su relevancia es práctica: permite ejecutar un ASR ucraniano de pequeño tamaño con sherpa-onnx en CPU, dispositivos embebidos o aplicaciones de escritorio, con un coste de almacenamiento de aproximadamente 0,1 GB. La licencia del modelo original (Moonshine AI Community License) se hereda y condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer para ASR (Moonshine v2), exportado a ONNX en dos grafos |
| Parametros totales | 27,1 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; ventana de entrada no especificada en la informacion) |
| Tipos de cuantizacion | Float32 sin cuantizacion en este repositorio; existe un set int8 en el repositorio hermano `vasyadeva/moonshine-tiny-uk-onnx` |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | Moonshine AI Community License |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), mas `tokens.txt` en formato sherpa |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Moonshine v2, un esquema encoder-decoder tipo transformer diseñado para reconocimiento de voz con coste computacional reducido. El encoder recibe audio crudo a 16 kHz y produce estados internos; el decoder genera la secuencia de tokens con soporte de caché para decodificacion autoregresiva. En esta conversión, el decoder se ha exportado como un grafo fusionado que contiene tanto la ruta con caché como la ruta sin caché, seleccionables mediante la rama `use_cache_branch`, lo que simplifica la integración con sherpa-onnx.

La exportación se realizó con `optimum-cli export onnx --model moonshine-ai/moonshine-tiny-uk --task automatic-speech-recognition-with-past` sobre transformers 4.52.4 en Linux x86_64. El propio exportador reportó una diferencia máxima absoluta de logits de 3,8e-5 frente al modelo PyTorch, por encima de su tolerancia de 1e-5, y guardó los grafos igualmente. El fichero `tokens.txt` se generó a partir de `tokenizer.json` transformando `▁` en espacio y `<0xNN>` en el byte correspondiente, con cada pieza codificada en base64 y emparejada con su id.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en ucraniano a partir de audio a 16 kHz.
- Transcripción de enunciados cortos y medios; en la prueba de humo del autor, frases de 2 a 4 segundos se transcribieron correctamente.
- Ejecución on-device mediante sherpa-onnx con `OfflineRecognizer.from_moonshine_v2`.
- Inferencia en CPU con configuración de hilos ajustable (`num_threads`).
- Integración en pipelines que requieran un formato ONNX sin dependencia de PyTorch.
- No se documentan capacidades de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local de notas de voz en ucraniano: el modelo puede procesar clips cortos en aplicaciones de escritorio o móviles sin conexión, gracias a su tamaño de 27,1 M de parámetros y a los grafos ONNX ligeros (31 MB el encoder, 116 MB el decoder).
- Subtitulado de reuniones o entrevistas en ucraniano: se puede integrar en un pipeline que segmenta el audio en fragmentos de 2 a 4 segundos y llama al reconocedor sherpa-onnx para obtener texto, adecuado por su bajo coste de inferencia en CPU.
- Asistentes de voz embebidos: el formato ONNX y la API de sherpa-onnx permiten desplegar el modelo en dispositivos con recursos limitados, como Raspberry Pi o sistemas empotrados, para comandos y dictado en ucraniano.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo casi real de conversaciones presenciales en ucraniano mediante una aplicación que capture audio a 16 kHz y lo envíe al reconocedor.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: al ejecutarse en CPU con sherpa-onnx, se puede usar para transcribir archivos históricos o grabaciones de archivo en ucraniano en pipelines de datos.
- Prototipado e investigación en ASR de bajos recursos: sirve como punto de partida para experimentos con modelos Moonshine en ucraniano, comparando la versión float32 con la int8 del repositorio hermano para evaluar el equilibrio entre precisión y tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una prueba de humo cualitativa sobre clips sintéticos en ucraniano: frases de 2 a 4 segundos transcritas correctamente (por ejemplo, «Двері ліворуч за два метри»), mientras que palabras de menos de aproximadamente 0,8 segundos no resultaron fiables. Esta prueba no constituye una evaluación de precisión.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo float32 ocupa aproximadamente 147 MB en disco (31 MB encoder + 116 MB decoder), por lo que la memoria necesaria es muy reducida.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090 para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU.
- Opciones de despliegue: sherpa-onnx 2.0.1 con `OfflineRecognizer.from_moonshine_v2`; el formato ONNX también podría cargarse con ONNX Runtime directamente, aunque la integración documentada es la de sherpa-onnx.
- Latencia y throughput: no disponibles de forma cuantitativa; el autor ejecutó la prueba con 2 hilos en CPU sin reportar tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| vasyadeva/moonshine-tiny-uk-sherpa-onnx | 27,1 M | No disponible | Ucraniano | Moonshine AI Community License | ONNX (float32) |
| vasyadeva/moonshine-tiny-uk-onnx | 27,1 M (mismo modelo base) | No disponible | Ucraniano | Moonshine AI Community License | ONNX (int8) |
| moonshine-ai/moonshine-tiny-uk | 27,1 M | No disponible | Ucraniano | Moonshine AI Community License | PyTorch (safetensors) |

No se dispone de información sobre otros modelos ASR ucranianos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia Moonshine AI Community License impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El exportador reportó una diferencia máxima de logits de 3,8e-5 frente al modelo PyTorch, por encima de la tolerancia de 1e-5, lo que indica una fidelidad numérica no perfecta.
- La prueba de humo se realizó únicamente con voz sintética y no constituye una evaluación de precisión sobre habla real.
- Las palabras de menos de aproximadamente 0,8 segundos no resultaron fiables en la prueba del autor, lo que limita su uso en transcripción de habla rápida o segmentos muy cortos.
- El modelo solo soporta ucraniano; no se documentan capacidades multilingües.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento en dominios específicos (médico, legal, técnico).
- El repositorio no incluye cuantización en esta versión; para entornos con restricciones de memoria extrema habría que recurrir al set int8 del repositorio hermano.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vasyadeva/moonshine-tiny-uk-sherpa-onnx
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny-uk
- Repositorio ONNX con cuantización int8: https://huggingface.co/vasyadeva/moonshine-tiny-uk-onnx
- Licencia del modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny-uk/blob/main/LICENSE.txt
- Organización Moonshine AI: https://huggingface.co/moonshine-ai
