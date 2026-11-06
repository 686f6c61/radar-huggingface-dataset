# tiao-ai-tech/kinomat-aligner-fr

## Resumen

kinomat-aligner-fr es un modelo de alineamiento forzado (forced alignment) para frances, publicado por tiao-ai-tech como parte del ecosistema de la herramienta Kinomat. No se trata de un modelo entrenado desde cero, sino de una conversion de formato del modelo jonatasgrosman/wav2vec2-large-xlsr-53-french a ONNX con cuantizacion dinamica int8 de los pesos de las multiplicaciones de matrices. Su funcion es localizar en el tiempo cada palabra de un guion frances conocido dentro de una grabacion de voz, de modo que los subtitulos y los cortes de montaje puedan sincronizarse con la locucion.

El modelo resuelve un problema acotado y especifico: dado un audio a 16 kHz y un texto transcrito previamente, devuelve logits CTC por fotograma (uno cada 20 ms) sobre un vocabulario de 59 simbolos que cubre letras minusculas francesas con acentos, apostrofo, guion y un separador de palabras. Esta pensado para integrarse en Kinomat, que verifica la integridad del archivo mediante SHA-256 y no descarga nada de forma autonoma.

Es relevante por su caracter practico: ofrece una version lista para produccion en ONNX Runtime, cuantizada a int8, de un modelo wav2vec2 grande con XLSR-53, lo que reduce requisitos de despliegue en comparacion con el checkpoint original en PyTorch. Al ser una conversion pura, hereda las capacidades y las limitaciones del modelo base sin cambios en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + atención, CTC) |
| Parametros totales | no disponible (modelo base wav2vec2-large-xlsr-53, del orden de 300 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio variable; salida de un fotograma cada 20 ms) |
| Tipos de cuantizacion | int8 dinamica (uint8) sobre pesos de MatMul |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17); archivo `wav2vec2-large-xlsr-53-french-int8.onnx` de 355.031.576 bytes |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2-large-xlsr-53, un modelo de reconocimiento de voz basado en un extractor convolucional de caracteristicas seguido de un transformer con atencion y una cabeza de clasificacion CTC. El checkpoint original fue preentrenado por Meta AI sin transcripciones sobre Multilingual LibriSpeech, Common Voice y BABEL, y despues ajustado por Jonatas Grosman sobre Mozilla Common Voice 6.0 en frances (CC0 1.0). El presente repositorio no reentrena ni ajusta los pesos: solo exporta el modelo a ONNX y aplica cuantizacion dinamica int8 a los pesos de las multiplicaciones de matrices.

El proceso de exportacion documentado usa PyTorch 2.14.1, transformers 5.20.2, ONNX opset 17 y onnxruntime 1.31.0, con un script (`exporter-le-modele.py`) reproducido en el repositorio. La entrada es `input_values` en float32 con forma `[1, samples]`, audio mono a 16 kHz normalizado a media cero y varianza unitaria; la salida es `logits` en float32 con forma `[1, frames, 59]`. La cuantizacion solo afecta a los pesos de MatMul, no a las activaciones ni a las capas convolucionales.

## Capacidades

- Alineamiento forzado de un guion frances conocido sobre una grabacion de ese mismo guion.
- Salida de logits CTC por fotograma temporal (resolucion de 20 ms) para derivar marcas de inicio y fin de palabra.
- Vocabulario de 59 simbolos: letras minusculas francesas con acentos, apostrofo, guion, separador de palabras mediante pipe y `<pad>` como blank CTC.
- Entrada de audio mono a 16 kHz con normalizacion a media cero y varianza unitaria.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No soporta vision, audio generativo ni modo de pensamiento.
- Multilingue: no; solo frances.
- No es un reconocedor de voz de proposito general.

## Casos de uso

- Sincronizacion de subtitulos: dado un guion frances y su locucion, el modelo produce marcas temporales por palabra que permiten generar subtitulos ajustados al habla con resolucion de 20 ms.
- Montaje audiovisual asistido: Kinomat usa las marcas de alineamiento para decidir donde cortar la grabacion siguiendo la voz, por ejemplo al cambiar de frase o de parrafo.
- Verificacion de integridad en pipelines de produccion: el SHA-256 publicado permite comprobar que el archivo desplegado es exactamente el esperado antes de usarlo.
- Despliegue ligero en ONNX Runtime: al estar cuantizado a int8 y en formato ONNX, puede ejecutarse en entornos donde instalar PyTorch completo no es viable.
- Alineamiento de corpus de voz francesa: util para anotar a nivel de palabra grabaciones que ya cuentan con transcripcion, como material de Common Voice u otros corpus con guion conocido.
- Control de calidad de doblaje o locucion: comparar las marcas temporales obtenidas con las esperadas ayuda a detectar omisiones, repeticiones o desviaciones respecto al guion.
- Integracion en herramientas de edicion: el modelo puede incorporarse como componente de un editor que necesite segmentar voz por palabras sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el archivo ONNX int8 ocupa aproximadamente 355 MB, por lo que el modelo cabe en GPUs de consumo con varios GB de memoria libre.
- GPU recomendadas: no disponible; al ser ONNX Runtime, puede ejecutarse en CPU y en GPU compatibles con los proveedores de ejecucion de onnxruntime.
- Cabe en GPU de consumo: si, dado el tamano del archivo cuantizado; las GPU concretas no estan especificadas en la informacion.
- Opciones de despliegue: onnxruntime (formato nativo); no se documentan otros formatos como GGUF, vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| kinomat-aligner-fr | no disponible | no disponible | fr | Apache 2.0 | ONNX int8 |
| jonatasgrosman/wav2vec2-large-xlsr-53-french | no disponible | no disponible | fr | Apache 2.0 | PyTorch (transformers) |
| facebook/wav2vec2-large-xlsr-53 | no disponible | no disponible | multilingue (53 idiomas en preentrenamiento) | Apache 2.0 (MIT en fairseq) | PyTorch (fairseq) |

La comparacion se limita al linaje del modelo, ya que no se dispone de datos de rendimiento ni de otros modelos de alineamiento forzado en la informacion proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivo: alinear un guion frances conocido con una grabacion de ese guion; no debe emplearse como reconocedor de voz general.
- Sin garantias: se distribuye tal cual, sin garantia de ningun tipo.
- Solo frances: no cubre otros idiomas.
- Dependencia del guion: requiere el texto de referencia; no transcribe audio libre.
- Cuantizacion int8: puede introducir diferencias de precision respecto al modelo original en PyTorch, aunque no se cuantifican en la informacion.
- Sesgos: no se documentan sesgos especificos; al derivar de Common Voice 6.0 en frances, puede reflejar las caracteristicas y desequilibrios de ese corpus.
- Riesgo de alineamiento incorrecto en audio ruidoso, con acentos no representados o con discrepancias entre guion y locucion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribucion (`LICENSE` y `LICENSE-Apache-2.0`) incluidos en el repositorio.
- Integridad del archivo: el nombre y el SHA-256 deben mantenerse; Kinomat no descarga el modelo por si mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiao-ai-tech/kinomat-aligner-fr
- Archivo ONNX: https://huggingface.co/tiao-ai-tech/kinomat-aligner-fr/resolve/main/wav2vec2-large-xlsr-53-french-int8.onnx
- Modelo base ajustado: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french
- Modelo preentrenado original: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
