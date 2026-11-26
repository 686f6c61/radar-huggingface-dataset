# Suarify/kucing-tts-elena-0.1

## Resumen

Elena es un modelo compacto de síntesis de voz (text-to-speech) para malayo, publicado por Suarify bajo el identificador `Suarify/kucing-tts-elena-0.1`. El modelo toma como referencia la voz "Eleanor" del sistema Kitten TTS 2 y la traslada al malayo mediante conversión de voz con Chatterbox, de modo que el resultado es una voz clonada que pronuncia texto malayo con las características tímbricas del hablante original. No se trata de un producto oficial de Kitten TTS ni está afiliado a sus autores.

La arquitectura combina un front-end lingüístico (G2P del propio proyecto) que convierte texto malayo en fonemas, y un decodificador basado en un cabezal source-filter de Paradee entrenado sobre los objetivos de voz de Kitten. El modelo se distribuye en formato ONNX cuantizado en int8 (con constantes en fp16 y bases DFT generadas), con un tamaño de fichero de 8,46 MB y un repositorio total de aproximadamente 8,7 MB, lo que lo sitúa en la categoría de modelos extremadamente ligeros, aptos para inferencia en CPU o dispositivos con recursos muy limitados.

Su relevancia actual radica en la escasez de modelos TTS específicos para malayo con licencia permisiva (Apache 2.0) y en su huella mínima, que facilita el despliegue embebido o en entornos sin GPU. La ficha se basa exclusivamente en la información publicada en la model card; los datos no presentes se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador source-filter de Paradee con front-end G2P para malayo; síntesis TTS |
| Parametros totales | no disponible (pesos int8 en un fichero ONNX de 8,46 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos), fp16 (constantes); fichero `onnx/model_quantized.onnx` |
| Idiomas soportados | malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelo cuantizado); código de inferencia Python incluido |

## Arquitectura y entrenamiento

El modelo se compone de dos bloques. Por un lado, un front-end de conversión grafema-fonema (G2P) específico para malayo, desarrollado dentro del proyecto, que transforma el texto de entrada en una secuencia de fonemas. Por otro, un decodificador basado en un cabezal source-filter de Paradee, entrenado sobre los objetivos de voz de Kitten TTS 2 "Eleanor" (`voices_en.npz["eleanor"][64]`). La voz objetivo se clonó al malayo mediante conversión de voz con Chatterbox, y el decodificador se entrenó sobre ese audio profesor clonado en malayo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El modelo no redistribuye pesos ni activos de Kitten TTS: el decodificador se entrenó sobre audio profesor propio generado con Chatterbox.

## Capacidades

- Síntesis de voz a partir de texto malayo, con salida en float32 a 24 kHz.
- Voz clonada con timbre de Kitten TTS 2 "Eleanor", adaptada al malayo.
- Front-end G2P propio para malayo integrado en el pipeline de inferencia.
- Inferencia vía API Python (`kucing.Elena`) o script de línea de comandos (`infer.py`).
- Ejecución sobre ONNX cuantizado en int8, adecuada para CPU y entornos de bajos recursos.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento (no aplicables a un TTS).
- Cobertura multilingüe limitada al malayo según la model card.

## Casos de uso

- Lectura de textos en malayo en aplicaciones móviles o de escritorio: el modelo, con 8,46 MB en int8, puede empaquetarse dentro de la propia aplicación sin depender de servicios en la nube, generando audio a 24 kHz a partir de texto.
- Asistentes de voz embebidos en dispositivos con CPU: la inferencia ONNX int8 permite sintetizar respuestas habladas en malayo en hardware sin GPU, reduciendo coste y latencia de red.
- Accesibilidad para personas con discapacidad visual: conversión de contenido textual malayo (noticias, documentación, correo) en audio mediante el script `infer.py` o la API Python.
- Prototipado rápido de interfaces conversacionales en malayo: la API `Elena.from_pretrained(...)` permite integrar la síntesis en notebooks o servicios ligeros para validar flujos de voz antes de invertir en modelos mayores.
- Generación de locuciones para contenido educativo o de formación: síntesis de lecciones o guiones en malayo con una voz consistente y ligera, sin necesidad de infraestructura de GPU.
- Pruebas de integración en pipelines de CI: al ser un artefacto de menos de 10 MB, puede descargarse y ejecutarse en runners estándar para verificar regresiones en la salida de audio.
- Investigación sobre clonación de voz y adaptación de timbre entre idiomas: sirve como caso de estudio de transferencia de voz (Kitten TTS 2 a malayo) mediante Chatterbox y un decodificador source-filter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto (8,46 MB en int8) es viable la ejecución en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime podría ejecutar el modelo, aunque no hay datos de rendimiento publicados.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); API Python del paquete `kucing` y script `infer.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Suarify/kucing-tts-elena-0.1 | TTS source-filter (Paradee) + G2P | Malayo | 8,46 MB (ONNX int8) | Apache 2.0 | Voz clonada de Kitten TTS 2 "Eleanor" |
| Kitten TTS 2 (referencia de voz) | TTS | Inglés (voz Eleanor) | no disponible | no disponible en la información | Fuente del timbre; no redistribuido por Elena |
| Chatterbox (herramienta de conversión de voz) | Conversión de voz | Multilingüe (no detallado) | no disponible | no disponible en la información | Usado para clonar la voz al malayo |

No se dispone de datos de benchmarks ni de otros modelos TTS malayos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo independiente de Suarify: no es un producto oficial de Kitten TTS ni está afiliado o respaldado por sus autores.
- Cobertura lingüística limitada exclusivamente al malayo; no se documenta soporte para otros idiomas.
- No se han publicado métricas de calidad (MOS, inteligibilidad, naturalidad) ni benchmarks; el rendimiento real no está verificado de forma independiente.
- Posibles sesgos y artefactos derivados del audio profesor clonado con Chatterbox y del corpus de entrenamiento, no documentados.
- Riesgo de errores de pronunciación por el front-end G2P ante palabras extranjeras, siglas o neologismos no cubiertos.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que no se redistribuyen pesos ni activos de Kitten TTS; conviene verificar la procedencia de la voz clonada antes de un uso comercial a gran escala.
- Sin datos de latencia ni throughput en producción; no se recomienda asumir rendimiento sin medición previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kucing-tts-elena-0.1
- Demo (Gradio Space): https://huggingface.co/spaces/Suarify/kucing-tts-elena-0.1
