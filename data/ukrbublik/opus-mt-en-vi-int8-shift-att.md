# ukrbublik/opus-mt-en-vi-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-vi-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-vi`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de ingles a vietnamita sin pivotar por una lengua intermedia, y esta pensado para ejecucion en dispositivo (on-device), concretamente para el runtime OPUS de la aplicacion Android Subtitle Tap.

La relevancia de esta version no esta en el modelo base, sino en el empaquetado: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values) y aplica cuantizacion dinamica INT8 con onnxruntime (QInt8, per-tensor), reduciendo el repositorio a unos 0,1 GB. Ademas, anade una salida auxiliar `alignment_shift_l2` que expone las probabilidades de atencion encoder-decoder de la capa 2, util para alinear fragmentos de subtitulos con el texto traducido.

Es un modelo Marian de traduccion especializado, no un LLM generativo generalista: su unico proposito es la traduccion en->vi. Su interes actual reside en el despliegue movil y en la trazabilidad de la alineacion, no en capacidades conversacionales ni de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | ingles (en) y vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) + `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un MarianMT, un transformer encoder-decoder con atencion multi-cabeza, entrenado por el equipo OPUS-MT sobre corpus paralelos del proyecto OPUS. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La aportacion de este repositorio es puramente de formato y empaquetado. Se exporta con optimum a ONNX en opset 17 sin past key/values (es decir, sin cache de decodificacion incremental), se cuantiza dinamicamente a INT8 con onnxruntime, y el decoder incorpora una salida adicional `alignment_shift_l2` que es una identidad sobre un nodo existente: expone las probabilidades de atencion encoder-decoder de la capa 2 sin alterar pesos ni decodificacion. El archivo `alignment.json` vincula esa salida al SHA-256 del decoder como recibo de integridad. El modelo base es multi-target, por lo que `tokenizer_runtime.json` antepone el token `>>vie<<` a cada frase de origen (`sourcePrefixTokenIds`) para forzar la seleccion del vietnamita.

## Capacidades

- Traduccion directa de ingles a vietnamita sin pivot por lengua intermedia.
- Exposicion de alineacion encoder-decoder (capa 2) mediante la salida `alignment_shift_l2`, util para alinear tokens origen-destino.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json` con piezas, puntuaciones y mapeo a ids de vocabulario.
- Ejecucion on-device mediante onnxruntime con pesos INT8.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No ofrece modo thinking, vision ni audio.
- Capacidad multilingue limitada exclusivamente al par en->vi.

## Casos de uso

- Subtitulado automatico en Android: el modelo esta disenado para el runtime OPUS de Subtitle Tap, traduciendo subtitulos en->vi en el propio dispositivo sin conexion, gracias al formato ONNX INT8 y su tamano reducido (0,1 GB).
- Alineacion de subtitulos bilingues: la salida `alignment_shift_l2` permite mapear cada fragmento del subtitulo original con su correspondiente traduccion, util para sincronizacion temporal y resaltado.
- Traduccion offline en aplicaciones moviles: al no requerir servidor, se integra en apps que operan sin red o con requisitos de privacidad estrictos.
- Preprocesado de corpus en->vi: util para generar traducciones de referencia en pipelines de datos o para aumentar datasets paralelos.
- Verificacion de integridad en produccion: `alignment.json` con el SHA-256 del decoder permite validar que el modelo desplegado no ha sido alterado.
- Prototipado rapido en entornos con onnxruntime: al ser un export ONNX estandar, se puede cargar en Python, C++ o Java sin dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0,1 GB en INT8, por lo que la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no requiere GPU; esta pensado para CPU y ejecucion movil via onnxruntime.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos Android de gama media.
- Opciones de despliegue: onnxruntime (principal, dado el formato), potencialmente convertible a otros runtimes ONNX; no se distribuye en GGUF ni safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-vi-int8-shift-att | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Alineacion encoder-decoder incluida; on-device |
| Helsinki-NLP/opus-mt-en-vi | no disponible | no disponible | Apache 2.0 | PyTorch/safetensors | Modelo base sin cuantizar ni alineacion |
| Otros OPUS-MT en->vi | no disponible | no disponible | Apache 2.0 | variable | Variantes de la familia OPUS-MT |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en en->vi; no traduce otros pares de idiomas.
- No es un LLM: no soporta conversacion, razonamiento, codigo ni tool calling.
- Riesgo de alucinacion y errores de traduccion inherente a modelos Marian, especialmente en frases largas o dominio especializado.
- El export ONNX no incluye past key/values, lo que implica decodificacion sin cache incremental y posible penalizacion en velocidad para secuencias largas.
- La salida `alignment_shift_l2` es una identidad sobre un nodo existente; su utilidad depende de la interpretacion correcta de las probabilidades de atencion.
- Requiere anteponer `>>vie<<` a cada frase de origen para seleccionar vietnamita; omitirlo puede producir comportamiento incorrecto.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal, 2020).
- Sin datos publicados de benchmarks, no se puede garantizar calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-vi-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-vi
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como enlace directo en la informacion proporcionada
- Repositorio OPUS-MT: no disponible como enlace directo en la informacion proporcionada
