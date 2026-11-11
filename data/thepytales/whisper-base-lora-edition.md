# thepytales/whisper-base-lora-edition

## Resumen

Whisper Base – Lora Edition es un paquete de pesos del modelo de reconocimiento automatico del habla Whisper Base de OpenAI, redistribuido por thepytales (PyTales) para su integracion en la aplicacion Lora. No se trata de un modelo nuevo ni de un ajuste fino: segun la propia model card, los ficheros son byte a byte identicos a los publicados por csukuangfj en el repositorio sherpa-onnx-whisper-base (commit `bb53ee2`), y los hashes SHA-256 incluidos permiten verificarlo. La etiqueta "Lora Edition" hace referencia a la app, no a la tecnica de adaptacion Low-Rank Adaptation.

El modelo resuelve transcripcion de voz a texto multilingue en entornos con recursos limitados, ya que se distribuye en formato ONNX cuantizado a int8 (encoder de 29,1 MB y decoder de 130,7 MB) pensado para el runtime sherpa-onnx. Con 74 millones de parametros y una ventana de audio de 30 segundos por inferencia, es una opcion de despliegue ligero, no de maxima precision.

Su relevancia actual es practica: ofrece una ruta reproducible y verificable para ejecutar Whisper Base en local (escritorio, movil, edge) sin depender de PyTorch, con licencia Apache-2.0 heredada del original. La model card esta redactada en aleman y declara soporte multilingue con enfasis en aleman (`de`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), exportado a ONNX y cuantizado a int8 |
| Parametros totales | 74 millones (Whisper Base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por inferencia; maximo de 448 tokens de decodificacion (arquitectura Whisper, no confirmado explicitamente en la informacion proporcionada) |
| Tipos de cuantizacion | int8 (ficheros `.int8.onnx`) |
| Idiomas soportados | multilingue; aleman (`de`) declarado explicitamente |
| Licencia | Apache-2.0 (modelo); el codigo de OpenAI Whisper es MIT, con textos incluidos en el repo |
| Formato de pesos | ONNX (encoder y decoder separados) + fichero de tokens para sherpa-onnx |
| Tamano del repositorio | 0,2 GB |
| Runtime objetivo | sherpa-onnx |
| Modelo base | openai/whisper-base (relacion: quantized) |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Base de OpenAI: un transformer encoder-decoder con 74 millones de parametros que procesa espectrogramas Mel de 80 canales sobre ventanas de 30 segundos y genera tokens de texto con marcas de tiempo opcionales. El encoder consume el audio y el decoder produce la transcripcion de forma autorregresiva, con tokens especiales para deteccion de idioma y traduccion.

No se ha realizado ningun entrenamiento ni ajuste adicional por parte de thepytales. Los pesos proceden de la exportacion a ONNX de csukuangfj (sherpa-onnx-whisper-base en el commit `bb53ee2`) y se han cuantizado a int8. La informacion disponible no detalla la composicion del dataset original de Whisper (680 000 horas de audio etiquetado segun la publicacion de OpenAI, dato no incluido en la model card) ni si hubo RLHF o DPO, algo que no aplica al pipeline original de Whisper. La unica innovacion tecnica relevante es el empaquetado: separacion encoder/decoder en ONNX int8 con fichero de tokens y hashes de verificacion, optimizado para inferencia en CPU via sherpa-onnx.

## Capacidades

- Transcripcion de voz a texto (ASR) multilingue sobre audio de hasta 30 segundos por segmento.
- Deteccion automatica de idioma mediante tokens especiales del decoder.
- Traduccion de voz a texto en ingles (capacidad nativa de Whisper, no verificada explicitamente en esta edicion).
- Generacion de marcas de tiempo a nivel de segmento (capacidad estandar de Whisper; no confirmada en la model card).
- Ejecucion en CPU sin dependencias de PyTorch gracias al runtime sherpa-onnx.
- Enfasis declarado en aleman (`de`), ademas del resto de idiomas del modelo multilingue original.
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion local en aplicaciones de escritorio: integracion via sherpa-onnx para dictado sin conexion, con un consumo de disco inferior a 160 MB en int8 y sin GPU.
- Subtitulado de reuniones y notas de voz: segmentacion de audio en ventanas de 30 segundos y transcripcion secuencial en aleman o multilingue para generar actas automaticas en local.
- Asistentes de voz en movil o dispositivos edge: el tamano reducido (encoder 29,1 MB, decoder 130,7 MB) permite empaquetar el modelo en apps Android/iOS con sherpa-onnx.
- Preprocesado de corpus de audio: transcripcion masiva en CPU de grabaciones cortas para construir datasets de texto o indices de busqueda sobre archivos de voz.
- Prototipado rapido de pipelines ASR: validacion de una arquitectura encoder-decoder Whisper en ONNX antes de escalar a variantes mayores (small, medium) con el mismo runtime.
- Cumplimiento y privacidad: procesamiento de audio sensible en infraestructura propia, sin envio a APIs externas, apoyado en la licencia Apache-2.0 y en la verificacion por SHA-256 de los pesos.
- Verificacion de cadena de suministro de modelos: uso de los hashes publicados para auditar que los pesos desplegados coinciden con la fuente original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, MMLU, HumanEval ni ninguna otra metrica; solo documenta tamanos de fichero y hashes SHA-256.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM estimada: en el orden de cientos de MB para cargar encoder, decoder y tokens (no se especifica cifra exacta en la informacion proporcionada).
- GPU: no necesaria. Cualquier GPU moderna podria ejecutar la version ONNX, pero no es el objetivo del paquete.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y moviles, por el tamano total inferior a 160 MB de pesos.
- Despliegue: sherpa-onnx (runtime principal); al ser ONNX, tambien es compatible con ONNX Runtime generico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto de audio | Licencia | Enfoque |
|---|---|---|---|---|---|
| thepytales/whisper-base-lora-edition | 74 M | ONNX int8 | 30 s por inferencia | Apache-2.0 | Edge/CPU via sherpa-onnx |
| openai/whisper-base | 74 M | PyTorch (safetensors/bin) | 30 s por inferencia | Apache-2.0 | Referencia original, requiere PyTorch |
| csukuangfj/sherpa-onnx-whisper-base | 74 M | ONNX int8 | 30 s por inferencia | Apache-2.0 | Fuente directa de los pesos de esta edicion |
| openai/whisper-small | 244 M | PyTorch | 30 s por inferencia | Apache-2.0 | Mayor precision a costa de ~3x parametros |

La diferencia entre esta edicion y la de csukuangfj es exclusivamente de empaquetado y documentacion (hashes, licencias adjuntas, orientacion a la app Lora); los pesos son identicos. Frente a whisper-small, esta version prioriza tamano y velocidad en CPU sobre calidad de transcripcion.

## Limitaciones y advertencias

- No es un modelo ajustado: la etiqueta "Lora Edition" se refiere a la app Lora, no a un fine-tuning con LoRA; no debe esperarse ninguna mejora sobre whisper-base original.
- Whisper Base es la variante mas pequena de la familia y presenta mayor tasa de error que small, medium o large, especialmente en audio con ruido, acentos marcados o vocabulario tecnico.
- Riesgo de alucinacion conocido en Whisper: puede generar texto plausible en silencios, musica o audio ininteligible, especialmente en segmentos largos.
- Ventana fija de 30 segundos: audios mas largos requieren segmentacion externa, con posible perdida de contexto entre segmentos.
- Cobertura idiomatica desigual: aunque es multilingue, el rendimiento varia mucho por idioma; la model card solo declara explicitamente aleman.
- La cuantizacion int8 puede degradar ligeramente la precision respecto a los pesos originales en float32.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribucion a OpenAI y los textos de licencia incluidos; el codigo de OpenAI Whisper es MIT.
- Los autores originales no han revisado ni aprobado esta redistribucion; la responsabilidad de uso recae en el integrador.
- Sin benchmarks publicados: no hay evidencia medible de calidad para esta edicion concreta.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thepytales/whisper-base-lora-edition
- Modelo base: https://huggingface.co/openai/whisper-base
- Fuente de los pesos ONNX: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-base
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
