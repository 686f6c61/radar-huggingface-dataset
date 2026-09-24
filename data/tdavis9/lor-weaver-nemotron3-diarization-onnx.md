# tdavis9/lor-weaver-nemotron3-diarization-onnx

## Resumen
Lor Weaver — Nemotron 3 Diarization ONNX (step graphs) es una exportación a ONNX del modelo de diarización de hablantes `nvidia/Nemotron-3-Diarization` de NVIDIA, publicada por el usuario tdavis9. No es un ajuste fino ni una reimplementación: los dos grafos ONNX trazan sin cambios el forward pass del modelo original, con la única modificación de un wrapper que convierte los contadores escalares de la Arrival-Order Speaker Cache (AOSC) en operaciones con tensores enmascarados de tamaño fijo, de modo que puedan sobrevivir a `torch.onnx.export` como entradas y salidas reales del grafo.

Cada grafo exporta un único paso de fragmento (chunk step) y expone el estado recurrente —caché de hablante, FIFO y contadores— como entradas y salidas explícitas, de forma que quien llama puede transportar el estado entre fragmentos. Está pensado para Lor Weaver, un asistente de sesiones de TTRPG local y on-device, con el objetivo de que la aplicación de escritorio descargue los grafos en lugar de empaquetar unos 760 MB dentro del instalador. El repositorio completo ocupa 0,8 GB y la licencia es OpenMDW-1.1, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue ligera para un modelo de diarización en streaming que admite hasta ocho hablantes y ordena las salidas por primera aparición de cada voz; por otro, ilustra un patrón de exportación reproducible (opset 17, exportador TorchScript heredado) para modelos con estado recurrente que hoy no se pueden trazar con el exportador dynamo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diarizacion de hablantes en streaming basada en Sortformer (segun tags del repositorio), exportada como grafo ONNX de un paso de fragmento con estado explicito |
| Parametros totales | no disponible |
| Longitud de contexto | Procesamiento por fragmentos; `chunk_length` de 9 frames de encoder y `chunk_right_context` de 4 en el preset low-latency, y `chunk_length` de 340 con `chunk_right_context` de 40 en el preset offline |
| Tipos de cuantizacion | no disponible; los grafos ONNX operan en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 (OpenMDW License Agreement, version 1.1) |
| Formato de pesos | ONNX (opset 17, exportador TorchScript heredado, `dynamic_axes=None`) |

## Arquitectura y entrenamiento
El artefacto no entrena nada: reproduce el forward pass de `nvidia/Nemotron-3-Diarization` (snapshot `a435e9867d79e789e90053f9b6d6834053af564a`), cargado mediante Transformers con `AutoModelForAudioFrameClassification` / `Nemotron3DiarizationForAudioFrameClassification`, y no por la ruta de carga de NeMo (el archivo `.nemo` envuelve su propio front-end de audio y no ofrece un `nn.Module` plano que se pueda trazar). El wrapper `step_wrapper.Nemotron3DiarStep` reescribe la AOSC con tres decisiones concretas: disposición de caché alineada a la derecha, división en dos máscaras y compresión seguida de `torch.where`. La paridad frente al modelo PyTorch sin modificar es exacta salvo por el ruido de float32, y el export se realizó con `torch.onnx.export(..., opset_version=17, dynamo=False)` sobre el commit `8021e106` del repositorio `lor-weaver-2`.

La interfaz es un contrato de estado por paso con lote fijo a 1. Las entradas son `input_features` `[1, T, 128]` en float32 (features mel), `attention_mask` `[1, T]` en float32 0/1 (no booleano), `cache_embeds` `[1, 264, 512]`, `cache_probs` `[1, 264, 8]`, `fifo` `[1, FIFO, 512]` y cuatro escalares int64 (`num_cache_frames`, `num_fifo_frames`, `is_compressed` y `num_input_frames`). Las salidas son `logits` `[1, chunk_length*8, 8]` —logits crudos por frame de 10 ms y hablante, ocho canales: hay que aplicar `sigmoid` y umbralizar en 0,5, y el solapamiento es nativo— más `new_cache_embeds`, `new_cache_probs`, `new_fifo` y los tres contadores actualizados, que se realimentan en el siguiente paso. `num_input_frames` no es estado persistente, sino un parámetro de forma por paso (`ceil(real_mel_frames / 8)`): todos los pasos completos pasan `chunk_length + right_context` y solo el último fragmento, con relleno de ceros, pasa un valor menor; equivocarlo corrompe el borde de convolución de ese fragmento.

| Preset | `chunk_length` | `chunk_right_context` | `fifo_length` | `speaker_cache_update_period` | `speaker_cache_length` |
|---|---|---|---|---|---|
| `nemotron3-diar-step-lowlatency.onnx` | 9 | 4 | 264 | 222 | 264 |
| `nemotron3-diar-step-offline.onnx` | 340 | 40 | 40 | 300 | no disponible |

## Capacidades
- Diarizacion de hablantes (determinar "quien habla cuando") sobre audio, con hasta ocho hablantes.
- Inferencia en streaming y en modo offline, segun el preset de grafo elegido.
- Ordenacion de las salidas por primera aparicion de cada hablante en el audio de entrada.
- Manejo nativo del solapamiento de voces: dos canales activos en el mismo frame es una respuesta valida, no un error.
- Salida de logits crudos por frame de 10 ms y hablante, lo que permite posprocesado propio (sigmoide, umbral, suavizado).
- Transporte de estado entre fragmentos mediante cache de hablante, FIFO y contadores, habilitando sesiones de duracion arbitraria.
- Capacidad de operar como clasificador de audio frame a frame a traves del pipeline `audio-classification`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido; es un modelo exclusivamente de diarizacion.

## Casos de uso
- Asistente de sesiones de TTRPG on-device: es el caso original de Lor Weaver; el asistente necesita saber que jugador habla en cada momento sin enviar audio a la nube, y descarga los grafos ONNX en lugar de incluirlos en el instalador.
- Transcripcion de reuniones en directo con etiquetas de hablante: con el preset low-latency (`chunk_length` 9) el modelo procesa fragmentos cortos y mantiene el estado entre pasos, lo que permite ir etiquetando la transcripcion a medida que avanza la reunion.
- Posprocesado de podcasts y entrevistas: el preset offline (`chunk_length` 340) sacrifica latencia por contexto mas amplio, adecuado para ficheros ya grabados.
- Analisis de llamadas de contact center: con hasta ocho hablantes por canal permite separar cliente, agente y posibles terceros, y entregar logits por frame para metricas de turnos y solapamientos.
- Integracion en pipelines ASR para obtener "quien dijo que": la salida de diarizacion se alinea por frame de 10 ms con la transcripcion, de modo que basta fusionar marcas temporales para etiquetar cada segmento de texto.
- Subtitulado automatico con identificacion de interlocutor: la ordenacion por primera aparicion asigna etiquetas estables (hablante 0, 1, 2...) desde el inicio del audio, lo que simplifica la nomenclatura en el subtitulo final.
- Aplicaciones con requisito de privacidad o conectividad limitada: al ser un grafo ONNX con estado explicito, puede ejecutarse en local sobre CPU mediante ONNX Runtime sin dependencia de servicios externos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible en esta ficha. El único dato cuantitativo de calidad aportado por el autor es que la paridad entre los grafos exportados y el modelo PyTorch original es exacta salvo por el ruido inherente a float32.

## Requisitos de hardware
- VRAM estimada: no disponible con precision; el repositorio completo de los dos grafos ocupa 0,8 GB.
- Al tratarse de grafos ONNX de un paso con lote fijo a 1, la inferencia en CPU mediante ONNX Runtime es viable y es la ruta coherente con el objetivo local-first del proyecto.
- GPU compatibles: al no disponerse de recuento de parametros, no se pueden dar recomendaciones especificas (A100, H100, RTX 4090, etc.); por el tamano del artefacto, cabe previsiblemente en cualquier GPU consumer moderna con varios GB de VRAM libres.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA o TensorRT Execution Provider). No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Preprocesado obligatorio por parte del llamante: hay que generar las features mel con forma `[1, T, 128]` y la mascara de atencion en float32 0/1; el grafo no incluye el front-end de audio.
- Latencia y throughput: no disponibles. Como referencia estructural, un paso low-latency cubre 9 frames de encoder y produce `9 * 8` frames de salida de 10 ms por hablante; un paso offline cubre 340 frames de encoder.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tdavis9/lor-weaver-nemotron3-diarization-onnx (este) | no disponible | Por fragmentos; presets low-latency y offline | en | OpenMDW-1.1 | Grafos ONNX de un paso, Hugging Face |
| nvidia/Nemotron-3-Diarization (modelo base) | no disponible | Streaming y offline; hasta 8 hablantes | en | OpenMDW-1.1 | Pesos originales en Hugging Face |
| nvidia/Nemotron-3-Diarization-preview | no disponible | Streaming y offline; hasta 8 hablantes | en | no disponible | Hugging Face, version previa |

## Limitaciones y advertencias
- Solo soporta ingles segun los metadatos del repositorio; no hay evidencia de soporte multilingue.
- Es un artefacto de despliegue, no un modelo entrenado: cualquier mejora requiere trabajar sobre el modelo base de NVIDIA.
- Los grafos tienen todos los ejes fijos (`dynamic_axes=None`) y lote fijo a 1, por lo que no admiten batching ni formas dinamicas sin reexportar.
- Cada preset es un grafo distinto; no existe un unico artefacto que cubra low-latency y offline a la vez.
- El contrato de estado es estricto: un `num_input_frames` incorrecto en el ultimo fragmento (el unico con relleno) corrompe el borde de convolucion de ese fragmento.
- La salida son logits crudos; es responsabilidad del llamante aplicar `sigmoid` y umbralizar en 0,5.
- El export requiere instalar Transformers desde git (`5.18.0.dev0 (git c8b81b63)`), ya que la clase del modelo no existe en una version publicada en wheel a fecha de la exportacion; el exportador dynamo no funciona con este grafo.
- Licencia OpenMDW-1.1: cualquier redistribucion debe conservar una copia del acuerdo y todos los avisos de copyright y origen del material del modelo. La licencia figura como `other` en la etiqueta del repositorio y como `openmdw-1.1` en los metadatos.
- Riesgo de sesgos y de alucinacion de hablantes: no se documentan evaluaciones de equidad ni tasas de error por acento, genero o calidad de audio; no disponible.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay senal de adopcion ni de validacion por parte de terceros.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tdavis9/lor-weaver-nemotron3-diarization-onnx
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Version previa del modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Familia Nemotron 3 de NVIDIA: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Repositorio de recursos para desarrolladores de NVIDIA Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Cobertura de prensa del lanzamiento: https://www.unite.ai/nvidia-releases-nemotron-3-diarization-open-weight-speaker-model/
