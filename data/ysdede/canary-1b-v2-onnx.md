# ysdede/canary-1b-v2-onnx

## Resumen

`ysdede/canary-1b-v2-onnx` es una conversión a formato ONNX del modelo de reconocimiento automático del habla (ASR) `nvidia/canary-1b-v2`, publicada por el usuario ysdede para su uso dentro del ecosistema ASRJS. El paquete incluye un encoder FP32 y un decoder autorregresivo también en FP32, exportados con el exportador Canary de ASRJS, y está pensado para ejecutar inferencia de transcripción en entornos JavaScript, potencialmente en navegador.

El modelo subyacente, Canary 1B v2 de NVIDIA, es un modelo ASR de aproximadamente mil millones de parámetros basado en la arquitectura FastConformer con decoder Transformer autorregresivo, sucesor de Canary 1B v1. Esta conversión concreta no es un modelo nuevo ni un fine-tune: es un artefacto de despliegue que replica el comportamiento del modelo original en formato ONNX, con verificación de paridad de tokens y texto frente a la referencia nativa NeMo.

La relevancia de esta ficha es acotada: se trata de un repositorio de conversión con cero descargas y cero likes en el momento de la consulta, orientado a un runtime específico (ASRJS). La información disponible en la model card es muy limitada y no incluye especificaciones detalladas del modelo original, por lo que numerosos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + decoder Transformer autorregresivo, exportado a ONNX |
| Parametros totales | aproximadamente 1B (según el nombre del modelo base, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (encoder y decoder); no se documentan otras precisiones |
| Idiomas soportados | no disponible en esta conversión; depende del modelo base canary-1b-v2 |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder con fichero externo `.onnx.data` y decoder autorregresivo) |

## Arquitectura y entrenamiento

La model card de esta conversión no describe el entrenamiento del modelo, sino únicamente el proceso de exportación. Se sabe que el encoder es un FastConformer en FP32 y que el decoder es autorregresivo, también en FP32, y que el encoder utiliza un fichero externo `.onnx.data` para los pesos. La exportación se realizó con el exportador Canary de ASRJS y se validó mediante un fichero `verification.json` que compara IDs de tokens y texto frente a la referencia nativa NeMo (caso JFK). El autor advierte explícitamente que esta verificación demuestra paridad de componentes, no una aceptación general en navegador.

No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la innovación técnica del modelo original más allá de la arquitectura FastConformer, ampliamente conocida en la familia NeMo de NVIDIA.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante pipeline `automatic-speech-recognition`.
- Decodificación autorregresiva, lo que permite generar transcripciones token a token condicionadas por el encoder.
- Ejecución en formato ONNX, lo que habilita su uso en runtimes compatibles con ONNX Runtime, incluido el ecosistema JavaScript/ASRJS.
- No se documentan capacidades de traducción, diarización, timestamps, tool calling ni agentes en esta conversión.
- El soporte multilingüe depende del modelo base `canary-1b-v2`; la model card de esta conversión no enumera idiomas.

## Casos de uso

- Transcripción en aplicaciones web: al estar exportado a ONNX y orientado a ASRJS, puede integrarse en aplicaciones JavaScript que necesiten transcribir audio sin depender de un backend Python.
- Prototipado de ASR en navegador: útil para equipos que quieran evaluar Canary 1B v2 en un runtime JS antes de comprometerse con un despliegue en servidor.
- Pipelines de transcripción offline en Node.js: el formato ONNX permite ejecutar inferencia local en entornos sin GPU dedicada, siempre que el runtime lo soporte.
- Verificación de paridad de exportaciones: el fichero `verification.json` sirve como referencia para validar otras conversiones ONNX del mismo modelo base.
- Investigación sobre portabilidad de modelos ASR: permite estudiar el rendimiento de FastConformer en ONNX frente a NeMo nativo.
- Integración en herramientas de accesibilidad: transcripción de audio en aplicaciones web que requieran procesamiento local y no puedan enviar audio a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una verificación de paridad de tokens y texto frente a la referencia NeMo en un caso concreto (JFK), sin métricas de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 4,0 GB, lo que da una idea del peso en FP32 de encoder y decoder.
- GPU recomendadas: no especificadas. Al ser FP32 y ~1B de parámetros, se necesita al menos una GPU con varios GB de VRAM libre para cargar los pesos en memoria.
- GPU de consumo: probablemente viable en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB), aunque no hay confirmación del autor.
- Opciones de despliegue: ONNX Runtime y el runtime ASRJS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| ysdede/canary-1b-v2-onnx | ~1B (según nombre) | ONNX | CC-BY-4.0 | no disponible | HuggingFace (0 descargas) |
| nvidia/canary-1b-v2 | ~1B | NeMo nativo | no disponible en esta ficha | no disponible | HuggingFace (modelo base) |
| Whisper large-v3 | ~1,55B | safetensors, etc. | MIT (según modelo original) | 30 s de audio por ventana | Amplia |

La comparación con alternativas se limita a señalar la existencia del modelo base y de Whisper como referencia de la categoría; no se dispone de datos de rendimiento de esta conversión para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card advierte que la verificación realizada demuestra paridad de componentes, no una aceptación general en navegador; el soporte real depende del runtime ASRJS.
- El encoder requiere un fichero externo `.onnx.data`; hay que preservar la estructura del repositorio al descargar o desplegar.
- La licencia del modelo base es CC-BY-4.0 según esta conversión, pero la model card señala que Canary 1B v1 es no comercial; es imprescindible verificar los términos del modelo base canary-1b-v2 antes de un uso comercial.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni limitaciones de contexto en esta conversión.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en producción ni de mantenimiento continuado.
- El autor indica que se debe preservar la licencia (LICENSE) del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ysdede/canary-1b-v2-onnx
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2/tree/d455706339a6b32e1aa40f82c713a482a0c938e2
