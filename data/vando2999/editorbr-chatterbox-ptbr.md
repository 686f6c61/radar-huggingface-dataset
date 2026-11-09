# vando2999/editorbr-chatterbox-ptbr

## Resumen

`vando2999/editorbr-chatterbox-ptbr` es una conversión a ONNX del modelo de síntesis de voz Chatterbox Multilingual V3 en su variante específica para portugués de Brasil, desarrollada originalmente por Resemble AI. El autor de este repositorio, vando2999, ha tomado el checkpoint `t3_pt_br.safetensors` del finetune oficial `ResembleAI/Chatterbox-Multilingual-pt-br` y ha sustituido los tensores correspondientes dentro de los grafos ONNX de la exportación comunitaria `Masterx/chatterbox-multilingual-v3-ONNX`. El resultado es un paquete ONNX que reproduce la voz clonada en portugués brasileño y que se utiliza como motor de lectura en la aplicación Editorbr.

El modelo resuelve el problema de ejecutar TTS con clonación de voz en local, sin depender de servicios en la nube, sobre un runtime ONNX (en concreto, el runtime en Rust de Editorbr). Al mantener los grafos idénticos a la exportación base y cambiar únicamente los datos de los tensores, se conserva la compatibilidad con el ecosistema ONNX existente y se evita reexportar el modelo completo.

Es relevante porque demuestra un patrón de conversión quirúrgica de pesos (sustitución de inicializadores por hash de bytes, con manejo de transposiciones y fusiones q/k/v y gate/up) que permite portar finetunes de TTS a formatos de inferencia ligeros sin tocar la arquitectura. El repositorio ocupa 2,7 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox Multilingual V3 (backbone Llama para T3 + decoder S3Gen); exportación ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene grafos ONNX con pesos en precisión completa según la model card) |
| Idiomas soportados | portugués de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos con ficheros `_data`); checkpoint base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Chatterbox Multilingual V3, un sistema de TTS que combina un backbone tipo Llama (componente T3) para la modelización del texto y la prosodia, un encoder de condicionamiento (`speech_encoder`), un encoder de tokens de audio (S3 tokenizer con CAMPPlus) y un decoder S3Gen compartido en la familia V3. Este repositorio no entrena nada: es una conversión de formato. Los tres grafos que contienen pesos T3 (`embed_tokens`, `speech_encoder` y `language_model`) tienen cada tensor sustituido por el del finetune portugués; el resto de artefactos (`tokenizer.json`, `conditional_decoder.onnx` y sus `_data`) se toman de la exportación base.

El procedimiento de conversión consistió en emparejar cada inicializador flotante de los grafos base mediante el hash de sus bytes con un tensor del checkpoint `t3_mtl23ls_v3.safetensors`, ya fuese en su forma original, transpuesta o fusionada según el layout de onnxruntime-genai para las proyecciones q/k/v y gate/up, y reemplazarlo por la disposición equivalente del tensor del finetune. Se sustituyeron 212 tensores del backbone, 5 de embeddings y 14 del encoder de condicionamiento; todos los tensores T3 modificados por el finetune quedan cubiertos salvo `text_head`, que la inferencia no utiliza. El tokenizer S3, CAMPPlus y las cachés rotatorias no se tocan. La validación se hizo de extremo a extremo con el runtime Rust de Editorbr (decodificación greedy, penalización de repetición 1,2 y `default_voice.wav` de la exportación base), y Whisper small transcribió la salida palabra por palabra.

## Capacidades

- Síntesis de voz (text-to-speech) en portugués de Brasil con prosodia expresiva.
- Clonación de voz a partir de audio de referencia, heredada del pipeline de Chatterbox Multilingual.
- Inferencia local sobre ONNX, sin necesidad de GPU dedicada ni de servicios externos.
- Integración con el runtime Rust de Editorbr para lectura en voz alta de documentos.
- Salida de audio verificable mediante ASR (validada con Whisper small).
- No soporta tool calling, function calling, razonamiento multi-paso ni otras capacidades de un LLM; es exclusivamente un modelo de voz.
- Capacidad multilingüe limitada al portugués brasileño en este finetune.

## Casos de uso

- Lectura en voz alta de documentos en Editorbr: la aplicación descarga este paquete ONNX y sintetiza el texto en portugués de Brasil con una voz clonada, ejecutándose en la máquina del usuario.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o herramientas de escritorio que necesiten TTS local en pt-BR sin enviar texto a la nube.
- Clonación de voz para locuciones personalizadas: a partir de un audio de referencia se puede generar narración con la timbre del hablante, útil para audiolibros o contenido formativo.
- Prototipado de asistentes de voz en portugués brasileño: el formato ONNX permite desplegar el modelo en entornos con runtime ONNX ya existente (por ejemplo, aplicaciones de escritorio o embebidos).
- Generación de audio para pruebas de pipelines ASR: al ser un TTS local, sirve para crear corpus sintéticos en pt-BR y evaluar sistemas de reconocimiento de voz.
- Sustitución de APIs comerciales de TTS en productos con requisitos de privacidad: al ejecutarse en local y bajo licencia MIT, el texto y el audio no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada es cualitativa: la transcripción con Whisper small de la salida generada por el runtime de Editorbr coincide palabra por palabra con el texto de entrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,7 GB, por lo que se requiere al menos ese espacio en disco y una cantidad de memoria comparable al cargar los grafos.
- GPU recomendadas: no disponible. La model card no especifica requisitos de GPU; la inferencia se ha validado con un runtime ONNX en Rust, lo que sugiere que puede ejecutarse en CPU.
- ¿Cabe en GPU de consumo? No hay datos publicados; el tamaño del paquete (2,7 GB) es compatible con GPUs de consumo con 8 GB o más de VRAM si se ejecuta en FP32, pero no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (incluido onnxruntime-genai, por el layout de las proyecciones), runtime Rust de Editorbr y cualquier motor compatible con los grafos ONNX de la exportación base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vando2999/editorbr-chatterbox-ptbr | no disponible | no disponible | pt-BR | MIT | ONNX | Hugging Face (0 descargas) |
| ResembleAI/Chatterbox-Multilingual-pt-br | no disponible | no disponible | pt-BR | MIT (según Chatterbox) | safetensors | Hugging Face (modelo oficial) |
| Masterx/chatterbox-multilingual-v3-ONNX | no disponible | no disponible | multilingüe | MIT (según Chatterbox) | ONNX | Hugging Face (exportación base) |

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo entrenado por el autor del repositorio; cualquier mérito del modelo corresponde a Resemble AI.
- Los grafos ONNX no incluyen el watermarker Perth que sí lleva el modelo original; Resemble pide un uso responsable del audio generado.
- Solo cubre portugués de Brasil; no se debe esperar calidad en otras variantes del portugués ni en otros idiomas.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de robustez fuera del caso validado.
- La validación se limita a decodificación greedy con penalización de repetición 1,2 y una única voz de referencia; no se han probado otras configuraciones de muestreo ni otras voces.
- Riesgo de alucinación acústica y de artefactos propios de los modelos TTS, especialmente en textos largos o con caracteres no habituales.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base de Resemble AI y el cumplimiento de la legislación sobre clonación de voz y derechos de imagen.
- Al depender de la exportación base para `tokenizer.json` y `conditional_decoder.onnx`, el despliegue requiere descargar también esos artefactos de `Masterx/chatterbox-multilingual-v3-ONNX`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vando2999/editorbr-chatterbox-ptbr
- Modelo base oficial: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-pt-br
- Exportación ONNX base: https://huggingface.co/Masterx/chatterbox-multilingual-v3-ONNX
- Repositorio de Editorbr: https://github.com/vando12345/editorbr
- Ficha en AxForge: https://catalog.axforge.ai/models/chatterbox-multilingual-pt-br/
