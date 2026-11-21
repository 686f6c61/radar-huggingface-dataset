# ukrbublik/opus-mt-sv-ro-int8-shift-att

## Resumen

`ukrbublik/opus-mt-sv-ro-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-sv-ro`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de sueco (sv) a rumano (ro) sin pivotar por el ingles, y esta pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap.

La contribucion de este repositorio no es el entrenamiento, sino el empaquetado: exportacion via `optimum` a ONNX (opset 17, sin past key/values), cuantizacion dinamica INT8 con onnxruntime (QInt8, per-tensor) y la adicion de una salida de alineamiento (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2 del decoder. Esta salida se obtiene mediante una identidad sobre un nodo existente, por lo que los pesos y el proceso de decodificacion no se modifican.

Es relevante para quien necesite traduccion sueco-rumano de baja latencia en entornos con recursos limitados, sin dependencia de servicios en la nube, y con la posibilidad de obtener alineamientos a nivel de token para tareas de subtitulado o sincronizacion. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | sueco (sv), rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-sv-ro` es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT sobre datos paralelos del corpus OPUS. La model card del repositorio derivado no aporta detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde al modelo original y no se reproduce aqui.

La innovacion tecnica de esta conversion reside en el pipeline de exportacion: se usa `optimum` con opset 17 y sin cache de past key/values (es decir, sin decodificacion incremental), se aplica cuantizacion dinamica INT8 por tensor y se anade una salida adicional `alignment_shift_l2` que devuelve las probabilidades de atencion cruzada de la capa 2 del decoder. El repositorio incluye ademas `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, junto con las cadenas del vocabulario destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traduccion directa sueco a rumano sin pivotar por el ingles.
- Generacion de alineamientos token a token mediante la salida `alignment_shift_l2` (probabilidades de atencion encoder-decoder de la capa 2).
- Ejecucion en dispositivo mediante onnxruntime, con pesos cuantizados a INT8.
- Tokenizacion autocontenida a traves de `tokenizer_runtime.json`, sin dependencia del tokenizer SentencePiece original en tiempo de ejecucion.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento extendido (thinking mode), vision ni audio.
- Capacidad multilingue limitada estrictamente al par sv-ro.

## Casos de uso

- Subtitulado automatico en Android: la aplicacion Subtitle Tap puede traducir subtitulos suecos a rumano en el propio dispositivo gracias al runtime ONNX INT8, sin enviar texto a servidores externos.
- Sincronizacion de subtitulos: la salida `alignment_shift_l2` permite obtener correspondencias entre tokens de origen y destino, utiles para ajustar tiempos o resaltar segmentos traducidos.
- Traduccion offline en entornos sin conectividad: el tamano de 0,1 GB y la cuantizacion INT8 permiten desplegar el modelo en dispositivos moviles o embebidos con memoria limitada.
- Procesamiento por lotes de documentos suecos a rumano en pipelines locales: al ser ONNX, se integra en flujos con onnxruntime sin requerir GPUs dedicadas.
- Investigacion en traduccion de bajo recurso: el par sueco-rumano es menos frecuente que otros pares europeos, y este modelo ofrece una linea base reproducible y ligera.
- Evaluacion de tecnicas de alineamiento: la exposicion de las probabilidades de atencion de la capa 2 facilita experimentos sobre interpretabilidad y calidad de alineamientos en modelos Marian.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con pesos INT8 y un repositorio de 0,1 GB, la huella de memoria es del orden de decenas o pocos cientos de MB, adecuada para CPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion en CPU via onnxruntime en Android.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos cientos de MB de memoria libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: onnxruntime (runtime objetivo declarado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-sv-ro-int8-shift-att` | no disponible | no disponible | sv, ro | Apache 2.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-sv-ro` (base) | no disponible | no disponible | sv, ro | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT del par sv-ro | no disponible | no disponible | sv, ro | Apache 2.0 | variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre el par sueco-rumano; no traduce otras combinaciones ni detecta idioma de forma automatica.
- Al ser una traduccion automatica neuronal de la familia Marian, puede producir alucinaciones o traducciones fluentes pero incorrectas en segmentos ambiguos o con terminologia especializada.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo en punto flotante original; no se documenta la magnitud de esa perdida.
- La exportacion sin past key/values implica decodificacion no incremental, lo que puede aumentar la latencia en secuencias largas.
- No se documentan sesgos especificos; como modelo entrenado sobre OPUS, hereda los sesgos y la distribucion de los corpus paralelos utilizados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) segun indica la model card.
- La salida de alineamiento es una identidad sobre un nodo existente y no altera los pesos, pero su semantica concreta (capa 2, atencion cruzada) debe validarse para cada caso de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-sv-ro-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-ro
- Referencia del proyecto OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
