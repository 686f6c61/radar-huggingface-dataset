# ukrbublik/opus-mt-uk-en-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-uk-en-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-uk-en`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Se trata de un modelo Marian de traduccion directa ucraniano-ingles, sin pivote intermedio a traves del ingles, pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap.

La aportacion concreta de este repositorio es triple: exportacion a ONNX (opset 17, sin past key/values), cuantizacion dinamica INT8 con onnxruntime (QInt8, per-tensor) y la exposicion de una salida adicional de alineacion (`alignment_shift_l2`) que devuelve las probabilidades de atencion encoder del decodificador en la capa 2. Esta salida permite obtener alineaciones palabra a palabra entre el texto origen y el traducido sin modificar los pesos ni el proceso de decodificacion.

El modelo es relevante para desarrolladores que necesiten traduccion ucraniano-ingles de baja latencia en entornos con recursos limitados (moviles, edge), ya que el repositorio completo ocupa unos 0,1 GB y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No obstante, se trata de un artefacto de inferencia especifico para un runtime concreto, no de un modelo entrenado desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ucraniano (uk) como origen, ingles (en) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) + `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OPUS-MT: un transformer encoder-decoder de tipo Marian entrenado sobre datos paralelos del corpus OPUS. El modelo base `Helsinki-NLP/opus-mt-uk-en` (revision `1b9a2a0d1aa2a329d8476d2be5c7b0b27d5397b0`) fue desarrollado por la Universidad de Helsinki y publicado bajo Apache 2.0; los detalles de composicion del dataset de entrenamiento, numero de tokens y posibles fases de fine-tuning no se especifican en la informacion disponible.

Este repositorio no reentrena ni modifica los pesos: unicamente cambia el formato. La exportacion se realizo con optimum a ONNX opset 17, sin past key/values (es decir, sin cache de decodificacion autoregresiva), y posteriormente se aplico cuantizacion dinamica INT8 per-tensor con onnxruntime. La innovacion tecnica destacable es la salida `alignment_shift_l2`, una identidad sobre un nodo existente que expone las probabilidades de atencion encoder del decodificador en la capa 2, lo que permite extraer alineaciones sin alterar la decodificacion. El archivo `alignment.json` actua como recibo que vincula esa salida al SHA-256 del decodificador.

## Capacidades

- Traduccion automatica directa ucraniano a ingles, sin pivote intermedio.
- Generacion de alineaciones palabra a palabra mediante la salida de atencion `alignment_shift_l2` (capa 2 del decodificador).
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json`, con piezas y puntuaciones mapeadas a ids de vocabulario y cadenas de tokens destino.
- Inferencia en dispositivo con onnxruntime, sin dependencia de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de modo de pensamiento.
- Cobertura bilingue limitada exclusivamente al par uk-en.

## Casos de uso

- Subtitulado en tiempo real en Android: el modelo esta disenado para el runtime OPUS de la app Subtitle Tap, de modo que puede traducir subtitulos ucranianos a ingles en el propio dispositivo sin enviar texto a un servidor, gracias a su tamano reducido (0,1 GB) y a la inferencia INT8.
- Generacion de subtitulos bilingues con marcas de tiempo: la salida de alineacion `alignment_shift_l2` permite mapear palabras origen a palabras traducidas y construir subtitulos sincronizados a nivel de palabra.
- Traduccion offline en dispositivos de bajos recursos: al ejecutarse con onnxruntime sobre CPU, es adecuado para entornos sin conectividad o con politicas de privacidad estrictas.
- Preprocesado de corpus ucranianos para pipelines de NLP en ingles: traduccion por lotes de textos ucranianos antes de aplicar clasificadores, buscadores o sistemas de resumen entrenados en ingles.
- Traduccion de documentacion tecnica y mensajes de interfaz en aplicaciones moviles, donde el volumen es moderado y la latencia importa mas que la calidad literaria.
- Prototipado rapido de sistemas de traduccion asistida con resaltado de correspondencias, usando las alineaciones para senalar que fragmento origen genera cada fragmento destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo INT8 de aproximadamente 0,1 GB, la huella de memoria es muy reducida y cabe holgadamente en RAM de dispositivos moviles.
- GPU recomendadas: no requiere GPU; el runtime objetivo es onnxruntime sobre CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en telefonos Android, que es su destino previsto.
- Opciones de despliegue: onnxruntime (runtime objetivo), con los archivos `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-en-int8-shift-att | no disponible | no disponible | uk → en | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-uk-en (base) | no disponible | no disponible | uk → en | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT uk-en | no disponible | no disponible | uk → en | Apache 2.0 | varian segun conversion |

La comparativa directa con alternativas de la misma categoria (por ejemplo, modelos NLLB o M2M100) no esta disponible en la informacion proporcionada; ademas, este repositorio es una conversion de formato del modelo base, por lo que su calidad de traduccion es la del original.

## Limitaciones y advertencias

- Modelo de un solo par de idiomas (uk-en); no traduce otras combinaciones ni funciona como modelo multilingue general.
- No incluye cache de decodificacion (past key/values), lo que puede penalizar la latencia en secuencias largas frente a exportaciones con cache.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo en precision completa; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion y de traducciones inexactas inherente a los modelos Marian de traduccion, especialmente con terminologia especializada, nombres propios o texto coloquial.
- La salida de alineacion es una aproximacion basada en atencion y no garantiza correspondencias perfectas a nivel de palabra.
- No se documentan sesgos especificos del modelo base en la informacion disponible.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la atribucion exigida a los autores originales (Universidad de Helsinki, OPUS-MT) al redistribuir el modelo.
- Artefacto pensado para un runtime concreto (Subtitle Tap); su integracion en otros sistemas requiere adaptar el cargador de tokenizer y la gestion de la salida de alineacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-en
- Referencia OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
