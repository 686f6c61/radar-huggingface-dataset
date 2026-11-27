# Yvkwa/wolof-asr-onnx

## Resumen

`Yvkwa/wolof-asr-onnx` es una conversión al formato ONNX del modelo de reconocimiento automático del habla `dofbi/wolof-asr`, que a su vez es un Whisper small reentrenado para el idioma wolof. Lo publica el usuario Yvkwa y su propósito es permitir la inferencia directamente en el navegador mediante Transformers.js, sin necesidad de servidores ni de infraestructura de GPU. El repositorio ocupa 0,3 GB y los pesos están cuantizados en 8 bits (QUInt8).

El modelo hereda la arquitectura transformer encoder-decoder de Whisper en su variante small, aunque la información disponible no detalla el número exacto de parámetros ni la longitud de contexto del modelo base. Está especializado en una única lengua, el wolof (código ISO `wo`), hablada principalmente en Senegal y Gambia, lo que lo convierte en una pieza relevante para aplicaciones de accesibilidad y digitalización lingüística en entornos con recursos limitados.

Su interés actual reside en la combinación de tres factores: un modelo ajustado a un idioma de bajos recursos, una licencia permisiva (MIT) y un formato optimizado para ejecución en el cliente. Esto permite desplegar transcripción de voz en aplicaciones web sin coste de servidor y con privacidad de los datos de audio, algo poco habitual en modelos ASR para lenguas africanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) en variante small, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion dinamica QUInt8 (8 bits) sobre encoder y decoder fusionado |
| Idiomas soportados | wolof (`wo`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small, un transformer encoder-decoder con atención multi-cabeza estándar, diseñado originalmente para transcripción y traducción de voz. El modelo base `dofbi/wolof-asr` fue reentrenado sobre audio en wolof, aunque la información disponible no especifica el volumen de datos, la composición del corpus ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO.

La contribución de esta versión es puramente de despliegue: se exportó mediante `optimum-cli export onnx --task automatic-speech-recognition-with-past` y posteriormente se aplicó `onnxruntime.quantization.quantize_dynamic` con cuantización QUInt8 sobre el encoder y el decoder fusionado. El resultado es un paquete ONNX compatible con el runtime de Transformers.js, orientado a ejecución en navegador con WebAssembly o WebGPU. No se documentan innovaciones arquitectónicas adicionales más allá de la cuantización para inferencia en el cliente.

## Capacidades

- Reconocimiento automático del habla en wolof a partir de audio de entrada a 16 kHz en formato Float32.
- Transcripción de voz a texto monolingüe, sin soporte documentado de traducción a otros idiomas.
- Ejecución en navegador mediante Transformers.js con el pipeline `automatic-speech-recognition`.
- Inferencia en cliente con pesos cuantizados en 8 bits, lo que reduce el tamaño del modelo y el consumo de memoria.
- Integración directa en aplicaciones JavaScript/TypeScript sin backend adicional.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.

## Casos de uso

- Transcripción de voz en aplicaciones web para hablantes de wolof: el modelo puede ejecutarse íntegramente en el navegador con Transformers.js, de modo que el audio no abandona el dispositivo del usuario y se elimina la necesidad de un servidor de inferencia.
- Subtitulado de contenido audiovisual en wolof: útil para digitalizar entrevistas, programas de radio o vídeos comunitarios, dado que el modelo está especializado en una única lengua y evita confusiones entre idiomas.
- Herramientas de accesibilidad para personas con discapacidad auditiva en Senegal y Gambia: la transcripción en tiempo casi real en el cliente permite generar subtítulos sin depender de conectividad constante a un backend.
- Documentación de historia oral y archivos lingüísticos: investigadores pueden transcribir grabaciones de campo de forma local, preservando la privacidad de los informantes y sin enviar audio a servicios en la nube.
- Asistentes de voz para servicios públicos o sanitarios en zonas con conectividad limitada: al ejecutarse en el navegador, el modelo funciona con independencia de la latencia de red una vez cargado.
- Aplicaciones educativas para el aprendizaje del wolof: transcripción de ejercicios orales y retroalimentación automática en entornos escolares con hardware modesto.
- Prototipado rápido de pipelines ASR en JavaScript: sirve como base para experimentar con reconocimiento de voz en wolof sin montar infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,3 GB, lo que corresponde a los pesos ONNX cuantizados en 8 bits; la memoria en tiempo de ejecución será del orden de varios cientos de megabytes, aunque no se dispone de una cifra exacta.
- Al estar orientado a Transformers.js, el despliegue previsto es en navegador (WebAssembly o WebGPU) o en Node.js, no en servidores con GPU dedicada.
- No requiere GPU de datacenter (A100, H100) para su caso de uso previsto; puede ejecutarse en hardware de consumo, incluidos portátiles y dispositivos móviles, siempre que el navegador soporte las APIs necesarias.
- Opciones de despliegue documentadas: Transformers.js con `dtype: "q8"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos ONNX de ASR.
- No se dispone de datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Yvkwa/wolof-asr-onnx | no disponible (Whisper small) | no disponible | wolof | MIT | ONNX (q8) |
| dofbi/wolof-asr | no disponible (Whisper small) | no disponible | wolof | MIT (segun modelo derivado) | safetensors/PyTorch (no confirmado) |
| Whisper small original (OpenAI) | ~244 M (cifra de referencia general, no confirmada en la informacion) | no disponible | multilingue | MIT | PyTorch, ONNX |

La comparativa se limita al modelo base del que deriva y al Whisper small original; no se dispone de información sobre otros modelos ASR específicos para wolof en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe wolof; no se debe esperar un rendimiento aceptable en otros idiomas.
- La cuantización dinámica a 8 bits puede degradar ligeramente la precisión de la transcripción respecto al modelo original en FP32; no se han publicado métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con ruido, silencios largos o audio de baja calidad.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus limitado de una lengua de bajos recursos, es probable que el rendimiento varíe según dialectos, acentos y registros del wolof.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base `dofbi/wolof-asr` y de los datos de entrenamiento originales.
- La información sobre el proceso de entrenamiento, el corpus y las métricas de evaluación es muy escasa, lo que dificulta estimar su fiabilidad en producción.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de su funcionamiento en distintos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yvkwa/wolof-asr-onnx
- Modelo base: https://huggingface.co/dofbi/wolof-asr
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
