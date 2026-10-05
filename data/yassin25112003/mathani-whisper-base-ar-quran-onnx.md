# Yassin25112003/mathani-whisper-base-ar-quran-onnx

## Resumen

mathani-whisper-base-ar-quran-onnx es una exportacion a ONNX del modelo tarteel-ai/whisper-base-ar-quran, publicada por el usuario Yassin25112003. Se distribuye en dos variantes: fp32 y cuantizacion dinamica int8, y esta pensada explicitamente para su uso en navegador. El modelo original es un ajuste fino de openai/whisper-base realizado por Tarteel AI sobre recitacion coranica en arabe, publicado bajo licencia Apache-2.0.

La relevancia de esta ficha no esta en el modelo en si, sino en el formato: al tratarse de una exportacion ONNX, permite ejecutar reconocimiento automatico de voz (ASR) especializado en arabe coranico directamente en el cliente, sin depender de infraestructura de servidor. Esto es especialmente util para aplicaciones de memorizacion y verificacion de recitacion, donde la privacidad del audio y la latencia baja son requisitos habituales.

Se trata de un modelo pequeno (derivado de la familia whisper-base, con aproximadamente 74 millones de parametros en el modelo original de OpenAI), lo que facilita su despliegue en entornos con recursos limitados. La model card es minima: no incluye datos de evaluacion, composicion del dataset de ajuste fino ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | no disponible (el modelo base openai/whisper-base tiene aproximadamente 74 millones) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | fp32 e int8 dynamic quantization |
| Idiomas soportados | no disponible (el modelo base esta especializado en arabe coranico) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder disenado para ASR, que convierte espectrogramas mel en secuencias de tokens de texto. El modelo original del que deriva, tarteel-ai/whisper-base-ar-quran, es un ajuste fino de openai/whisper-base orientado a recitacion coranica en arabe. Esta exportacion concreta no reentrena el modelo: unicamente lo convierte a formato ONNX y produce una variante fp32 y otra con cuantizacion dinamica int8.

No se dispone de informacion sobre el numero de tokens de audio utilizados en el ajuste fino, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia exportacion a ONNX y la cuantizacion dinamica int8, cuyo objetivo es reducir el peso y acelerar la inferencia en CPU y en entornos de navegador.

## Capacidades

- Reconocimiento automatico de voz (ASR) orientado a recitacion coranica en arabe.
- Transcripcion de audio a texto en el dominio especifico para el que fue ajustado el modelo base.
- Inferencia en navegador gracias al formato ONNX (compatible con ONNX Runtime Web / WebAssembly y, potencialmente, WebGPU).
- Ejecucion en CPU y en dispositivos sin GPU dedicada, al disponer de una variante int8 cuantizada.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el ajuste fino esta especializado en arabe.
- Soporte de tool calling, function calling, agentes, vision o audio adicional: no disponible.

## Casos de uso

- Verificacion de recitacion coranica en aplicaciones moviles o web: el modelo evalua la correspondencia entre el audio del usuario y el texto esperado, aprovechando su ajuste fino especifico en este dominio.
- Aplicaciones educativas de memorizacion (hifz): integrado en el navegador, permite dar retroalimentacion inmediata sobre la recitacion sin enviar el audio a un servidor.
- Herramientas de estudio con privacidad estricta: al ejecutarse en el cliente mediante ONNX, el audio nunca abandona el dispositivo del usuario.
- Indexacion y busqueda de recitaciones: transcripcion de archivos de audio para generar texto buscable en bibliotecas de recitadores.
- Subtitulado automatico de contenido religioso en arabe: generacion de transcripciones alineadas con el audio original.
- Prototipado rapido de funciones ASR en front-end: la variante int8 facilita su integracion en demostraciones web sin infraestructura de backend.
- Investigacion sobre despliegue de ASR en el borde: sirve como caso de referencia para medir el equilibrio entre precision y tamano en modelos cuantizados a int8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de WER ni comparaciones, y la busqueda web solo referencia la pagina del modelo base sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo muy ligero apto para CPU.
- GPU recomendadas: no disponible. Al ser una exportacion ONNX de un modelo base pequeno, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido (0,1 GB en total entre fp32 e int8), aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: ONNX Runtime (incluida la variante web), ejecucion en navegador mediante WebAssembly y, potencialmente, WebGPU. No se documenta compatibilidad con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mathani-whisper-base-ar-quran-onnx | no disponible (base ~74 M) | ONNX fp32 / int8 | Arabe coranico (base) | Apache-2.0 | HuggingFace |
| tarteel-ai/whisper-base-ar-quran | ~74 M (whisper-base) | PyTorch | Arabe coranico | Apache-2.0 | HuggingFace |
| eventhorizon0/tarteel-ai-onnx-whisper-base-ar-quran | no disponible | ONNX | Arabe coranico | no disponible | HuggingFace |
| Whisper Tiny ONNX (sherpa-onnx) | no disponible (~39 M) | ONNX int8 | Multilingue (incluye arabe) | no disponible | GitHub |

## Limitaciones y advertencias

- La model card es minima y no documenta sesgos, composicion del dataset ni evaluacion, lo que dificulta estimar el comportamiento real del modelo.
- Es un ajuste fino especializado en recitacion coranica: no cabe esperar buen rendimiento en arabe conversacional general ni en otros idiomas.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente ante audio ruidoso o fuera de dominio.
- La cuantizacion int8 puede degradar la precision respecto a la version fp32; no hay datos que cuantifiquen esa perdida.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Tarteel AI y de openai/whisper-base.
- Repositorio sin descargas ni interacciones registradas, creado y actualizado el mismo dia: no hay evidencia de validacion por parte de la comunidad.
- No se especifican los ficheros exactos incluidos (encoder/decoder, tokenizer), lo que puede complicar la integracion directa en algunos pipelines.
- Para produccion, conviene validar el modelo con un conjunto de audio propio antes de confiar en sus transcripciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yassin25112003/mathani-whisper-base-ar-quran-onnx
- Modelo base (Tarteel AI): https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Exportacion ONNX alternativa: https://huggingface.co/eventhorizon0/tarteel-ai-onnx-whisper-base-ar-quran
- README del modelo base en GitHub: https://github.com/ikamand/recite-models/blob/main/tarteel-ai/whisper-base-ar-quran/README.md
- Modelos ASR para Coran con Sherpa-ONNX: https://github.com/MUmarJ/sherpa-onnx-models
- Catalogo de modelos ONNX Runtime: https://onnxruntime.ai/models
