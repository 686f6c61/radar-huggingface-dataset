# ukrbublik/opus-mt-en-ro-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-ro-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-ro`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El autor de esta conversion es `ukrbublik`, y el artefacto esta pensado para el runtime OPUS on-device de la aplicacion Android Subtitle Tap. La traduccion es directa de ingles a rumano, sin pivotar por una lengua intermedia.

El modelo resuelve el problema de la traduccion en dispositivo (on-device) en un entorno movil: al exportarse a ONNX con cuantizacion dinamica INT8, el repositorio ocupa aproximadamente 0,1 GB y puede ejecutarse con onnxruntime sin depender de un servidor. Es relevante porque demuestra un flujo de publicacion reproducible de modelos OPUS-MT para inferencia local, incluyendo artefactos auxiliares como el tokenizador serializado y un fichero de alineacion.

La innovacion principal de esta variante concreta es la salida adicional `alignment_shift_l2`: probabilidades de atencion encoder-decoder de la capa 2, expuestas como una identidad sobre un nodo existente sin alterar pesos ni decodificacion. Esto permite obtener alineaciones a nivel de token para, por ejemplo, subtitulos bilingues o resaltado de correspondencias, con el mismo coste computacional que la traduccion base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible (repositorio de 0,1 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en), rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder con atencion multi-cabeza, tal como lo publica OPUS-MT. El modelo original `Helsinki-NLP/opus-mt-en-ro` fue entrenado sobre datos paralelos de OPUS, un corpus agregado de traducciones de multiples fuentes. Esta variante no reentrena ni modifica los pesos: solo cambia el formato mediante exportacion con optimum a ONNX (opset 17, sin cache de past key/values) y aplica cuantizacion dinamica INT8 per-tensor con onnxruntime.

La unica modificacion estructural es la exposicion de `alignment_shift_l2`, una salida de identidad sobre las probabilidades de atencion encoder-decoder de la capa 2 del decoder. Segun la model card, los pesos y el proceso de decodificacion quedan inalterados. El repositorio incluye ademas `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario y cadenas de tokens destino, y `alignment.json`, un recibo que vincula la salida de alineacion al SHA-256 del decoder. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Traduccion automatica directa de ingles a rumano, sin pivotar por una tercera lengua.
- Salida de alineacion a nivel de atencion (`alignment_shift_l2`) para correspondencias token a token entre origen y destino.
- Tokenizacion SentencePiece serializada para uso en runtime propio (`tokenizer_runtime.json`).
- Inferencia on-device mediante onnxruntime, sin dependencia de servidor.
- Verificacion de integridad del decoder mediante hash SHA-256 en `alignment.json`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de traduccion puro.
- Capacidad multilingue limitada al par en-ro; no cubre otras lenguas.

## Casos de uso

- Subtitulado automatico en aplicaciones Android: el modelo traduce subtitulos en ingles a rumano en el dispositivo, sin enviar texto a un servidor, gracias a su tamano reducido (0,1 GB) y a la exportacion ONNX para onnxruntime.
- Subtitulos bilingues con alineacion: la salida `alignment_shift_l2` permite resaltar que token origen corresponde a que token traducido, util para vistas de aprendizaje de idiomas o para depuracion de traducciones.
- Traduccion de documentacion tecnica en ingles a rumano en entornos sin conectividad, como herramientas de campo o dispositivos aislados.
- Preprocesado de corpus: traduccion por lotes de textos en ingles a rumano como paso previo a pipelines de analisis o mineria de datos, ejecutable en CPU.
- Prototipado rapido de funciones de traduccion en aplicaciones moviles o de escritorio con onnxruntime, sin necesidad de infraestructura GPU.
- Verificacion de integridad de modelos en produccion: el uso de `alignment.json` con SHA-256 permite auditar que el decoder desplegado coincide con el publicado.
- Integracion en sistemas de traduccion hibridos donde la alineacion token a token alimenta un corrector posterior o un glosario terminologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio INT8 ocupa aproximadamente 0,1 GB, por lo que el modelo cabe holgadamente en memoria de cualquier dispositivo moderno.
- GPU recomendadas: no disponible; al ser un modelo pequeno en INT8, no requiere GPU dedicada y esta disenado para ejecucion en CPU via onnxruntime.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna; tambien en CPUs de moviles y portatiles.
- Opciones de despliegue: onnxruntime (runtime objetivo del autor); el modelo original puede desplegarse con transformers, pero esta variante concreta esta empaquetada para onnxruntime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-ro-int8-shift-att | no disponible (INT8, 0,1 GB) | no disponible | en, ro | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-ro | no disponible | no disponible | en, ro | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-de | no disponible | no disponible | en, de | Apache 2.0 | safetensors/PyTorch |
| facebook/nllb-200-distilled-600M | 600M | no disponible | 200 idiomas | CC-BY-NC 4.0 | safetensors/PyTorch |

La comparativa se limita a datos publicos de los repositorios; no se dispone de metricas de calidad (BLEU, chrF) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de traduccion puro: no genera texto libre, no razona y no soporta tool calling; usarlo fuera de la tarea de traduccion en-ro dara resultados pobres.
- Riesgo de alucinacion y errores de traduccion en dominios especializados (terminologia juridica, medica o tecnica) por el entrenamiento generico sobre OPUS.
- Sesgos heredados de los datos OPUS, que pueden reflejar desequilibrios de genero, registro o dominio en el par en-ro.
- Cobertura limitada a ingles y rumano; no traduce otras lenguas ni realiza deteccion de idioma.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo original en float32; no se han publicado evaluaciones comparativas en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene citar el trabajo original de Tiedemann y Thottingal (2020) segun indica la model card.
- El repositorio no incluye informacion sobre longitud maxima de secuencia soportada; para textos largos habra que trocear la entrada.
- La salida de alineacion corresponde a la capa 2 del decoder y puede no reflejar fielmente la correspondencia semantica en frases largas o con reordenamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-ro-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ro
- Paper de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como enlace directo en la informacion proporcionada
- Repositorio OPUS-MT: no disponible en la informacion proporcionada
- Aplicacion Subtitle Tap: no disponible como enlace en la informacion proporcionada
