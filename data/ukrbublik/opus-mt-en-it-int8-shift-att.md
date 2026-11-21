# ukrbublik/opus-mt-en-it-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-it-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-it`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a italiano, sin pivote intermedio a través de otra lengua, y está pensado para ejecutarse en dispositivos móviles dentro de la aplicación Android Subtitle Tap.

La arquitectura de origen es Marian NMT, un transformer encoder-decoder entrenado sobre datos paralelos del corpus OPUS. Esta versión concreta no modifica los pesos originales: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 por tensor mediante onnxruntime. El repositorio ocupa aproximadamente 0,2 GB, lo que lo hace manejable para despliegue en entornos con recursos limitados.

La particularidad técnica de esta conversión es que el decodificador expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder del nivel 2. Se trata de una identidad sobre un nodo ya existente, por lo que los pesos y el proceso de decodificación no varían. Esta salida permite obtener alineamientos entre tokens de origen y destino, útil para aplicaciones de subtitulado que necesitan sincronizar texto traducido con el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en), italiano (it) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-it` emplea la arquitectura Marian NMT, un transformer encoder-decoder diseñado especificamente para traduccion automatica neuronal. Fue entrenado por el grupo de investigacion de tecnologia del lenguaje de la Universidad de Helsinki sobre datos paralelos del corpus OPUS, una coleccion agregada de corpus multilingues de dominio publico. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta version concreta es una conversion de formato: exportacion a ONNX con opset 17 y sin past key/values, seguida de cuantizacion dinamica INT8 por tensor con onnxruntime. El decodificador incorpora una salida adicional denominada `alignment_shift_l2`, que expone las probabilidades de atencion encoder de la capa 2 mediante una operacion Identity sobre un nodo preexistente del grafo. Segun el autor, los pesos y el proceso de decodificacion no se alteran respecto al modelo original. El repositorio incluye ademas `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario, y `alignment.json`, que vincula la salida de alineamiento con el hash SHA-256 del decodificador.

## Capacidades

- Traduccion directa de ingles a italiano sin pivote intermedio.
- Generacion de texto traducido token a token mediante decodificacion autorregresiva.
- Exposicion de alineamientos de atencion encoder (capa 2) a traves de la salida `alignment_shift_l2`, util para sincronizacion de subtitulos.
- Ejecucion en dispositivo (on-device) mediante onnxruntime con pesos cuantizados INT8.
- Tokenizacion autocontenida mediante `tokenizer_runtime.json`, que evita dependencias del tokenizador SentencePiece original en tiempo de ejecucion.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Subtitulado automatico en Android: la aplicacion Subtitle Tap usa este modelo para traducir subtitulos de ingles a italiano en el propio dispositivo, con la salida de alineamiento permitiendo sincronizar los tokens traducidos con los originales.
- Traduccion offline en movilidad: al ejecutarse como ONNX INT8 con un repositorio de 0,2 GB, puede desplegarse en dispositivos sin conexion a red, util para viajes o entornos con conectividad limitada.
- Preprocesado de documentacion tecnica: traduccion de manuales, README y documentacion de proyectos de software del ingles al italiano antes de su publicacion.
- Localizacion de contenido web: traduccion de articulos, blogs o paginas estaticas en pipelines batch donde el volumen no justifica un modelo de mayor tamano.
- Generacion de subtitulos para video bajo demanda: integracion en herramientas de postproduccion que necesitan alineamiento temporal entre audio transcrito en ingles y subtitulos en italiano.
- Prototipado rapido de sistemas de traduccion: al ser un modelo pequeno y en formato ONNX, sirve como linea base para comparar con modelos mayores o para validar pipelines de traduccion antes de escalar.
- Traduccion en entornos con recursos restringidos: sistemas embebidos, Raspberry Pi o contenedores ligeros donde un modelo INT8 de 0,2 GB es viable y uno de mayor tamano no lo seria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es del orden de cientos de MB en INT8.
- GPU recomendadas: no se especifican; al ser un modelo pequeno en ONNX INT8, puede ejecutarse en CPU sin GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier GPU de consumo moderna e incluso en iGPU, aunque no se aportan mediciones.
- Opciones de despliegue: onnxruntime (runtime principal para el que fue exportado); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no estan orientados a este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-it-int8-shift-att` | no disponible | no disponible | en, it | apache-2.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-en-it` (base) | no disponible | no disponible | en, it | apache-2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT en-it de Helsinki-NLP | no disponible | no disponible | en, it | apache-2.0 | safetensors/PyTorch |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La diferencia principal frente al base es el formato (ONNX INT8 en lugar de PyTorch) y la salida adicional de alineamiento.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en la direccion ingles a italiano; no soporta otras direcciones ni otros pares de idiomas.
- No se documentan evaluaciones de sesgo, toxicidad o calidad de traduccion en dominios especificos.
- Riesgo de alucinacion y de errores de traduccion inherente a los modelos NMT, especialmente en textos con terminologia especializada o estructuras sintacticas complejas.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo en punto flotante original; no se cuantifica esa perdida en la model card.
- Licencia apache-2.0 permisiva para uso comercial, pero se debe mantener la atribucion al grupo de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-20) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- No se documentan limitaciones de longitud de contexto; el modelo Marian original suele tener ventanas limitadas, pero no se especifica el valor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-it-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-it
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. y Thottingal, S. (2020), "OPUS-MT — Building open translation services for the World", EAMT 2020.
