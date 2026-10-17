# xasx/Qwen2.5-1.5B-Instruct-ONNX-fused

## Resumen

xasx/Qwen2.5-1.5B-Instruct-ONNX-fused es una exportacion a ONNX del modelo Qwen/Qwen2.5-1.5B-Instruct, publicada por el usuario xasx. No se trata de un modelo entrenado desde cero, sino de una version derivada y cuantizada del modelo base de Qwen, orientada especificamente a inferencia en el borde (edge) y en CPU. El artefacto se distribuye como un unico fichero ONNX de 1.671.599.992 bytes (aproximadamente 1,7 GB), con pesos en 4 bits (MatMulNBits), activaciones en fp16 y las operaciones de RMSNorm fusionadas de antemano.

El problema concreto que resuelve es un fallo de carga detectado en ONNX Runtime 1.23 y posteriores sobre el execution provider de CPU: el pase de grafo `SimplifiedLayerNormFusion` de ONNX Runtime no puede procesar el patron de RMSNorm descompuesto combinado con las conversiones de frontera de la cuantizacion q4f16. La solucion adoptada por el autor consiste en fusionar el RMSNorm en tiempo de exportacion, antes de la conversion a fp16 y de la cuantizacion, de modo que el pase del runtime no tenga nada que fusionar en caliente.

El modelo se creo para, y se usa en, la prediccion de palabras de EyeCtrl, una aplicacion de accesibilidad basada en seguimiento ocular. Su relevancia es doble: por un lado ilustra un patron de exportacion ONNX reproducible para modelos Qwen2.5 pequenos, y por otro demuestra un caso de despliegue real de IA open source en hardware modesto y en un dominio de accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2), exportado a formato ONNX |
| Parametros totales | Aproximadamente 1,5 mil millones (1.5B, segun el nombre del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos int4 (MatMulNBits, block size 32, simetrico, 196 nodos); activaciones fp16 (export q4f16); `lm_head` sin cuantizar |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX, fichero unico `onnx/model_q4f16_fused.onnx` (sin fichero lateral `.onnx_data`) |

Datos adicionales del artefacto: SHA-256 `61e17fef2f6df1fd112dc42c69777298271c8b5992de21d35a43b4bfef99d688`; el tokenizer es el `tokenizer.json` del modelo base, sin modificar; tamano del repositorio, 1,7 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalizacion RMSNorm. Este repositorio no reentrena ni modifica los pesos mas alla de la cuantizacion; es una exportacion que conserva la topologia del modelo original. Los parametros de configuracion empleados en la fusion offline son 12 cabezas de atencion y tamano oculto 1536, datos que el autor indica al invocar el optimizador de ONNX Runtime.

El proceso de construccion, documentado por el autor, consta de cuatro pasos: (1) exportacion del modelo base con optimum 1.27 (torch 2.7.1, CPU) usando la tarea `text-generation-with-past`; (2) fusion offline con `onnxruntime.transformers.optimizer` (model_type `gpt2`, 12 cabezas, oculto 1536), que convierte 57 patrones RMSNorm descompuestos en `SimplifiedLayerNormalization` y `SkipSimplifiedLayerNormalization`, reduciendo el grafo de 6.964 a 3.225 nodos; (3) un pase determinista a fp16 que convierte todo inicializador, constante y objetivo de Cast de tipo float, con conversiones de frontera `InsertedPrecisionFreeCast_`; y (4) cuantizacion a q4 con MatMulNBits (block 32, simetrico, excluyendo `lm_head`). Los scripts de exportacion estan en el repositorio EyeCtrl, bajo `tools/model-export/qwen2.5-1.5b/`. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva con soporte de cache de clave/valor (`text-generation-with-past`).
- Prediccion de la siguiente palabra, uso original del artefacto en la aplicacion EyeCtrl.
- Conversacion instructiva multi-turno, heredada del ajuste de instrucciones del modelo base Qwen2.5-1.5B-Instruct.
- Inferencia en CPU y en DirectML sin necesidad de GPU dedicada.
- Ejecucion en un unico fichero ONNX, lo que simplifica el despliegue y el versionado del artefacto.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito. La longitud de contexto y la cobertura de idiomas tampoco se detallan.

## Casos de uso

- Prediccion de palabras en accesibilidad: es el caso de uso original; EyeCtrl emplea el modelo para sugerir la siguiente palabra a usuarios que escriben mediante seguimiento ocular, donde la latencia baja y el consumo reducido son criticos.
- Escritura asistida para personas con movilidad reducida: el modelo puede integrarse en teclados predictivos o AAC (comunicacion aumentativa y alternativa) que se ejecutan en equipos modestos.
- Inferencia en el borde sin GPU: al caber en 1,7 GB y ejecutarse en el execution provider de CPU de ONNX Runtime, es adecuado para dispositivos sin acelerador grafico dedicado.
- Prototipado rapido en local: un unico fichero ONNX facilita pruebas de integracion en aplicaciones de escritorio o web (via ONNX Runtime Web) sin gestionar multiples shards.
- Generacion de texto corto en tiempo real: por el tamano pequeno del modelo, encaja en tareas de autocompletado, respuestas breves o resumenes de una o dos frases.
- Despliegue en aplicaciones de escritorio Windows con DirectML: la verificacion de carga incluye el EP de DirectML en varias versiones de ONNX Runtime, lo que habilita aceleracion en GPUs integradas o discretas de consumo.
- Clasificacion y extraccion ligera: reutilizable para etiquetado de texto, extraccion de campos o tareas de generacion condicionada de baja complejidad.
- Demo o referencia tecnica: sirve como plantilla reproducible para exportar otros modelos Qwen2.5 a ONNX con RMSNorm fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se dispone de evaluaciones propias del export. La unica validacion registrada es la de carga correcta del fichero ONNX en distintos entornos:

| ONNX Runtime | CPU | DirectML |
|---|---|---|
| 1.21.0 | OK | OK |
| 1.22.1 | OK | OK |
| 1.24.4 | OK | OK |

Estas comprobaciones se registraron al construir el artefacto el 2026-09-07 y acreditan compatibilidad de carga, no calidad de generacion ni latencia.

## Requisitos de hardware

- Almacenamiento: 1,7 GB para el fichero ONNX unico.
- VRAM o memoria estimada para inferencia: del orden de 2 GB o mas, dado que el fichero pesa 1,7 GB; no se especifica una cifra exacta en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. Al ser un modelo de 1,5B en 4 bits, cabe con holgura en GPUs de consumo (por ejemplo, RTX 3060/4090) y en GPUs integradas, segun lo que permite DirectML.
- Cabe en GPU de consumo: si, por tamano; el autor no publica un listado de GPUs validadas.
- Opciones de despliegue: ONNX Runtime (execution providers de CPU y DirectML confirmados en las pruebas de carga citadas). No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| xasx/Qwen2.5-1.5B-Instruct-ONNX-fused | ONNX, fichero unico | q4f16, MatMulNBits int4, RMSNorm fusionado | apache-2.0 | Export propio orientado a ORT 1.23+ y a EyeCtrl |
| onnx-community/Qwen2.5-1.5B-Instruct | ONNX (subcarpeta `onnx`) | No detallada en la informacion disponible | No disponible | Export de la comunidad de referencia |
| amd/Qwen-2.5-1.5B-Instruct-onnx-ryzenai-hybrid | ONNX (Ryzen AI) | AWQ, grupo 128, asimetrico, UINT4, activaciones BFP16 | No disponible | Orientado a NPU/hibrido Ryzen AI |

La comparacion se limita a formato, cuantizacion y licencia, ya que no se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo derivado, no una version oficial de Qwen; el autor lo indica explicitamente.
- Riesgo de alucinacion propio de un modelo de 1,5B en tareas de conocimiento factual; se recomienda verificar salidas en cualquier uso critico.
- No es un modelo de razonamiento ni de codigo de alto rendimiento por su tamano; la informacion disponible no documenta capacidades especiales.
- Longitud de contexto e idiomas soportados no disponibles; conviene comprobarlos antes de integrarlo en produccion multilingue.
- La cuantizacion int4 con `lm_head` sin cuantizar implica una posible perdida de calidad frente al modelo base en fp16; no se aportan mediciones.
- Excluir el `lm_head` de la cuantizacion reduce la compresion maxima, lo que se traduce en un fichero mayor que un export completamente int4.
- Compatibilidad del export centrada en ONNX Runtime 1.23+ en CPU y DirectML; no hay pruebas documentadas con otros runtimes ni con GPU via CUDA/TensorRT.
- Licencia apache-2.0: permite uso comercial, pero al ser un derivado conviene revisar tambien los terminos del modelo base Qwen2.5-1.5B-Instruct.
- El repositorio figura con 0 descargas y 0 me gusta, por lo que aun carece de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xasx/Qwen2.5-1.5B-Instruct-ONNX-fused
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio EyeCtrl (scripts de exportacion en `tools/model-export/qwen2.5-1.5b/`): https://github.com/xasx/eyectrl
- Export de la comunidad: https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct
- Export de AMD para Ryzen AI (hibrido): https://huggingface.co/amd/Qwen-2.5-1.5B-Instruct-onnx-ryzenai-hybrid
- Export de AMD para NPU Ryzen AI (repositorio): https://github.com/eiszazel/Qwen-2.5-1.5B-Instruct-onnx-ryzenai-npu
