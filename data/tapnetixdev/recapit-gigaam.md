# TapnetixDev/recapit-gigaam

## Resumen

El repositorio `TapnetixDev/recapit-gigaam` no contiene un modelo entrenado desde cero, sino una redistribucion en formato ONNX de dos checkpoints de reconocimiento automatico del habla (ASR) desarrollados por ai-sage (equipo GigaChat de Sber): `GigaAM-Multilingual` (rama `large_ctc`) y `GigaAM-v3` (rama `e2e_ctc`). La exportacion la realiza el autor del repositorio, TapnetixDev, para integrarlos en su producto RecapIt, y no esta afiliada a ai-sage ni a Sber. Se ofrecen dos variantes por checkpoint: fp32 (exportacion directa con `torch.onnx.export` y `to_onnx` sobre opset 17) e int8 (cuantizacion dinamica de pesos con `onnxruntime.quantization.quantize_dynamic` y `QuantType.QInt8`).

El interes practico es la portabilidad: al estar en ONNX, ambos modelos se pueden ejecutar con onnxruntime en CPU sin dependencias de PyTorch, lo que facilita su despliegue en entornos de produccion ligeros. El repositorio ocupa 4,0 GB e incluye los pesos externos (`multilingual_large_ctc.onnx.data`, 2,34 GB), los ficheros int8 (591,6 MB y 224,9 MB), los vocabularios y la licencia MIT heredada de los checkpoints originales.

La relevancia es limitada pero concreta: no hay model card de rendimiento, ni benchmarks, ni descripcion de la arquitectura interna; solo evidencia de exportacion, hashes SHA-256 y verificacion de que la decodificacion con los vocabularios coincide con el decodificador de referencia en 20 clips de prueba por variante. Es, por tanto, un artefacto de empaquetado reproducible, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints ASR GigaAM de ai-sage; arquitectura interna no documentada en el repo) |
| Parametros totales | no disponible (el fichero fp32 de pesos externos ocupa 2.341.277.696 bytes en Multilingual; el ONNX e2e fp32 pesa 885.950.080 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; eje temporal dinamico en la exportacion e2e) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica de pesos, `QuantType.QInt8`, sin datos de calibracion) |
| Idiomas soportados | no disponible (la variante se denomina "Multilingual" pero el repo no enumera idiomas) |
| Licencia | MIT (Copyright (c) 2024 GigaChat Team) |
| Formato de pesos | ONNX (opset 17) con pesos externos en `.data`; vocabularios en `.txt` |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna de los checkpoints originales ni sobre sus datos de entrenamiento, numero de tokens, composicion del dataset o fases de RLHF/DPO. Lo unico documentado es el proceso de exportacion y cuantizacion. Para la variante Multilingual se uso `to_onnx(dtype=torch.float32)` con opset 17 y `onnx_export_mode`; los tensores externos se reempaquetaron byte a byte en un unico fichero `.data` y se conservo un tensor `Constant` de forma separada. Para la variante e2e se exporto `forward_for_export` con `torch.onnx.export`, opset 17, eje temporal dinamico y `dynamo=False`. El entorno de exportacion fue CPU fp32 con torch 2.15.0, torchaudio 2.11.1, onnx 1.20.1 y onnxruntime 1.31.1.

La cuantizacion int8 se aplico con `onnxruntime 1.31.1` mediante `quantize_dynamic(input, output, weight_type=QuantType.QInt8)` con el resto de argumentos por defecto, sin datos de calibracion ni preprocesado adicional. Los vocabularios siguen el orden token/id del decodificador de referencia, con una linea UTF-8 LF por token en formato `<token> <id>`, espacio representado por `▁` y `<blk>` exactamente una vez en el id de blank de referencia. La decodificacion con estos vocabularios se valido contra el decodificador de referencia en 20 clips de prueba por variante con los mismos ids greedy. No se redistribuye `modeling_gigaam.py` y no se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento automatico del habla (ASR) en dos variantes: `GigaAM-Multilingual` (rama `large_ctc`) y `GigaAM-v3` (rama `e2e_ctc`).
- Salida CTC (Connectionist Temporal Classification) en ambas variantes, segun los nombres de rama y ficheros.
- Exportacion ONNX ejecutable con onnxruntime en CPU, sin dependencia de PyTorch en inferencia.
- Cuantizacion int8 para reducir huella en disco y memoria (591,6 MB y 224,9 MB frente a los ficheros fp32).
- Eje temporal dinamico en la variante e2e, lo que permite longitudes de audio variables sin recompilar el grafo.
- Vocabularios compatibles con el decodificador de referencia, verificados en 20 clips por variante.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo, thinking mode ni traduccion.

## Casos de uso

- Transcripcion de reuniones en aplicaciones de escritorio: la variante int8 del modelo e2e (224,9 MB) se puede cargar en onnxruntime sobre CPU y transcribir audio sin GPU, integrandose en la app RecapIt para la que se exporto.
- Subtitulado por lotes en servidores sin GPU: la variante Multilingual int8 (591,6 MB) permite procesar colas de audio en CPU con un consumo de memoria contenido, adecuado para pipelines nocturnos.
- Prototipado rapido de funcionalidades ASR: al no requerir PyTorch ni `modeling_gigaam.py`, un equipo puede validar la transcripcion en Python con onnxruntime en minutos antes de comprometerse con el stack original.
- Despliegue en dispositivos de borde o contenedores ligeros: el formato ONNX con pesos externos y la variante int8 reducen el tamano de imagen Docker y facilitan el empaquetado en entornos con recursos limitados.
- Verificacion de reproducibilidad de exportaciones: los hashes SHA-256 publicados por fichero permiten auditar que los pesos desplegados coinciden exactamente con los artefactos del repositorio.
- Integracion en aplicaciones multilingues de transcripcion: la variante Multilingual esta pensada para cubrir varios idiomas, aunque el repositorio no enumera cuales, por lo que habria que validarlo con muestras propias antes de usarla en produccion.
- Evaluacion comparativa de cuantizacion: permite medir la perdida de calidad entre fp32 e int8 sobre el mismo checkpoint usando los vocabularios y el decodificador de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo documenta una validacion de equivalencia de decodificacion (coincidencia con el decodificador de referencia en 20 clips por variante), no metricas de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM: no aplica en la mayoria de despliegues, ya que las exportaciones estan pensadas para CPU con onnxruntime; el modelo no requiere GPU.
- Memoria RAM estimada: el fichero fp32 de Multilingual ocupa 2,34 GB en disco, por lo que la inferencia fp32 necesita del orden de varios GB de RAM; la variante int8 (591,6 MB) reduce sustancialmente ese requisito. La variante e2e int8 ocupa 224,9 MB.
- GPU recomendadas: no disponibles; el repositorio no documenta ejecucion en GPU ni providers de onnxruntime distintos de CPU.
- ¿Cabe en GPU de consumo? Si, en terminos de tamano cabria en cualquier GPU consumer moderna, pero no hay evidencia de que la exportacion se haya probado con el execution provider CUDA.
- Opciones de despliegue: onnxruntime (CPU) es el runtime documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TapnetixDev/recapit-gigaam` (este repo) | no disponible | no disponible (ASR) | ONNX fp32/int8 | MIT | HuggingFace, 0 descargas |
| `ai-sage/GigaAM-Multilingual` (origen) | no disponible | no disponible (ASR) | PyTorch (`pytorch_model.bin`) | MIT | HuggingFace |
| `ai-sage/GigaAM-v3` (origen) | no disponible | no disponible (ASR) | PyTorch (`pytorch_model.bin`) | MIT | HuggingFace |
| Whisper (OpenAI) | variable por tamano (tiny a large) | 30 s de audio por ventana | PyTorch, ONNX, GGUF | MIT | Amplia |

La comparacion con Whisper es solo categorica (ambos son ASR); no hay datos de rendimiento en este repositorio que permitan una comparacion cuantitativa. Los checkpoints de origen de ai-sage son la referencia directa y este repositorio solo anade el empaquetado ONNX y la cuantizacion int8.

## Limitaciones y advertencias

- No hay benchmarks ni metricas de calidad (WER/CER) publicadas en el repositorio; no se puede afirmar su rendimiento sin evaluacion propia.
- La cuantizacion int8 se hizo sin datos de calibracion, con argumentos por defecto de onnxruntime 1.31.1; puede degradar la precision respecto a fp32 y no se documenta la magnitud de esa degradacion.
- El repositorio no esta afiliado a ai-sage ni a Sber; la responsabilidad del empaquetado recae en TapnetixDev.
- Solo se valido la decodificacion en 20 clips por variante; es una muestra pequena y no cubre todos los idiomas ni condiciones acusticas.
- La variante "Multilingual" no enumera sus idiomas soportados en el repositorio; usarla en un idioma concreto requiere validacion previa.
- Riesgo de alucinacion y sesgos: no documentados; al ser un modelo ASR, los errores tipicos serian sustituciones, omisiones e inserciones en la transcripcion, no alucinacion generativa.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright (GigaChat Team, 2024) y el texto de la licencia; el repositorio reproduce el LICENSE de `salute-developers/GigaAM` byte a byte.
- No se redistribuye `modeling_gigaam.py`; quien necesite el codigo de referencia debe acudir a los repositorios originales de ai-sage.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-05); no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TapnetixDev/recapit-gigaam
- Checkpoint de origen Multilingual: https://huggingface.co/ai-sage/GigaAM-Multilingual (rama `large_ctc`, revision `3905cd51c3ed4e88c8edf33f3302969ba480a327`)
- Checkpoint de origen v3: https://huggingface.co/ai-sage/GigaAM-v3 (rama `e2e_ctc`, revision `cec030b4c4f35d928e4a9044a3bdb29ebd499fac`)
- Codigo de referencia y licencia original: https://github.com/salute-developers/GigaAM (commit `7447938d791c4f3e643386ee22c33777004293a5`)
- onnxruntime: https://onnxruntime.ai/
- ONNX: https://onnx.ai/
