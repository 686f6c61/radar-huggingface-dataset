# subtitleking/omikhan-bangla-whisper-medium-onnx

## Resumen

omikhan-bangla-whisper-medium-onnx es la conversión a ONNX del checkpoint OmiKhan/bangla-asr-whisper-medium, un modelo Whisper medium ajustado por OmiKhan para reconocimiento automático del habla en bengalí (bangla). El autor de esta conversión, subtitleking, lo publica para inferencia en el navegador mediante Transformers.js sobre WebGPU, y lo usa en su producto SubtitleKing para la generación de subtítulos. No se trata de un modelo nuevo: solo cambia el formato de los pesos para hacerlo desplegable en entornos web.

La relevancia práctica está en el empaquetado: el encoder se exporta en fp16 con entradas y salidas en fp32, y el decoder fusionado (con past key values) se cuantiza a 4 bits con MatMul de bloque 32 simétrico, lo que reduce el repositorio a 1,1 GB y permite ejecutar ASR en el cliente sin backend. El modelo conserva el vocabulario BPE bengalí propio del checkpoint original, algo crítico porque decodificar con el tokenizer estándar de Whisper produce texto sin sentido.

Arquitectónicamente es un transformer encoder-decoder de la familia Whisper en su variante medium, entrenado sobre aproximadamente 300 horas de audio bengalí según la model card. La licencia Apache-2.0 y la disponibilidad de pesos en ONNX lo hacen directamente utilizable en producción web, aunque el soporte se limita al bengalí y a ventanas de 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | no disponible (variante medium de Whisper; cifra exacta no publicada en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 s por segmento (estandar de Whisper) |
| Tipos de cuantizacion | encoder fp16 (I/O fp32); decoder 4 bits (MatMul, bloque 32, simetrico) |
| Idiomas soportados | bengali (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_model_fp16.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento

El modelo base es un Whisper medium, es decir, un transformer encoder-decoder con atención completa entrenado originalmente por OpenAI para ASR multilingüe y tareas de traducción de voz. OmiKhan lo ajustó para bengalí sobre aproximadamente 300 horas de audio en ese idioma, según indica la model card. No se especifican en la información disponible detalles sobre la composición exacta del dataset, el uso de RLHF/DPO ni técnicas de aumento de datos.

La conversión de subtitleking aplica Optimum ONNX export en modo automatic-speech-recognition-with-past: el encoder se exporta en fp16 manteniendo entradas y salidas en fp32, y el decoder se fusiona con los past key values y se cuantiza a 4 bits con MatMul de bloque 32 simétrico. El proceso es reproducible con el directorio tools/convert-whisper/ del repositorio SubtitleKing. Un detalle técnico relevante es que el modelo conserva su vocabulario BPE bengalí propio, empaquetado en tokenizer.json, vocab.json y merges.txt con el layout de ficheros de Whisper estándar y los mismos ids para tokens especiales y de timestamp que el checkpoint fuente; además, generation_config.json ajusta suppress_tokens eliminando los 17 ids que en este vocabulario son subpalabras bengalíes.

## Capacidades

- Reconocimiento automático del habla en bengalí (bn) sobre audio de hasta 30 segundos por ventana.
- Transcripción de audio a texto con el vocabulario BPE bengalí propio del checkpoint fuente.
- Ejecución en navegador mediante Transformers.js y WebGPU, sin necesidad de backend.
- Inferencia con decoder cuantizado a 4 bits y encoder fp16, optimizada para entornos con recursos limitados.
- No genera timestamps dentro de una ventana de 30 s (limitación explícita de la model card).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento.

## Casos de uso

- Generación de subtítulos en bengalí en el navegador: el modelo está pensado para el producto SubtitleKing, transcribiendo audio por ventanas de 30 s con inferencia local en WebGPU y sin enviar el audio a un servidor.
- Herramientas de accesibilidad web: integración en reproductores o plataformas de vídeo para subtitulado automático en bengalí directamente en el cliente, reduciendo costes de infraestructura.
- Transcripción de reuniones y notas de voz en bengalí: procesamiento local de grabaciones cortas segmentadas en ventanas de 30 s, adecuado para aplicaciones de productividad con requisitos de privacidad.
- Investigación en ASR de bajos recursos: punto de partida para experimentos con bengalí usando un checkpoint Whisper medium ya ajustado y un pipeline de exportación ONNX reproducible.
- Aplicaciones educativas y de aprendizaje de idiomas: transcripción de material audiovisual bengalí para generar ejercicios o subtítulos sincronizados por segmentos.
- Prototipado rápido en web: al estar en Transformers.js con WebGPU, permite validar flujos de ASR en demos sin montar servidores GPU, aunque con la limitación de no producir timestamps intra-ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1,1 GB, con encoder fp16 y decoder 4 bits; la VRAM necesaria para inferencia es inferior a la de un Whisper medium en fp16, aunque no se publican cifras exactas.
- Ejecución orientada a navegador con WebGPU; requiere un navegador compatible con WebGPU y una GPU integrada o dedicada que lo soporte.
- No se documentan GPU recomendadas (A100, H100, RTX 4090, etc.) ni estimaciones de latencia o throughput en la información disponible.
- Despliegue previsto mediante Transformers.js; no se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI para este repositorio ONNX.
- El decoder cuantizado a 4 bits y el encoder fp16 están pensados para reducir el uso de memoria en el cliente, pero no se especifican requisitos mínimos de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| subtitleking/omikhan-bangla-whisper-medium-onnx | Whisper medium (cifra exacta no disponible) | ventanas de 30 s | bengalí | Apache-2.0 | ONNX (fp16 + 4 bits) |
| OmiKhan/bangla-asr-whisper-medium | Whisper medium (cifra exacta no disponible) | ventanas de 30 s | bengalí | Apache-2.0 | safetensors/PyTorch (no confirmado en la informacion disponible) |
| Whisper medium original (OpenAI) | Whisper medium (cifra exacta no disponible) | ventanas de 30 s | multilingüe | MIT (no confirmado en la informacion disponible) | PyTorch |

La comparación se limita al checkpoint fuente y al Whisper medium original; no se dispone de datos de rendimiento comparativo (WER u otras métricas) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta bengalí (bn); no es un modelo multilingüe utilizable en otros idiomas.
- No genera timestamps dentro de una ventana de 30 s, lo que limita la alineación fina en subtitulado.
- Usar el tokenizer estándar de Whisper en lugar del vocabulario bengalí incluido produce texto sin sentido; es obligatorio emplear tokenizer.json, vocab.json y merges.txt del repositorio.
- Riesgo de alucinación y errores de transcripción inherente a los modelos Whisper, especialmente en audio ruidoso o con acentos no representados en las 300 horas de entrenamiento.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar el trabajo de OmiKhan como autor del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera de SubtitleKing.
- La fecha de creación indicada (2026-11-09) es la que figura en los metadatos de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/subtitleking/omikhan-bangla-whisper-medium-onnx
- Modelo base: https://huggingface.co/OmiKhan/bangla-asr-whisper-medium
- Perfil del autor del modelo base: https://huggingface.co/OmiKhan
- Transformers.js: https://github.com/huggingface/transformers.js
- Repositorio SubtitleKing (script de conversión en tools/convert-whisper/): no disponible como enlace directo en la información proporcionada
