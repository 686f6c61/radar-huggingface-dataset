# Williamsvo275/aupub-vieneu-turbo-q4

## Resumen

VieNeu-TTS v3 Turbo Q4 es una re-cuantización del backbone del modelo de síntesis de voz vietnamita VieNeu-TTS v3 Turbo, publicada por el usuario Williamsvo275 para la aplicación de lectura Aupub. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los grafos ONNX originales en fp32 e int8 a una mezcla de 4 bits (MatMulNBits) e int8 dinámico, con el objetivo de reducir el peso en disco y el consumo de memoria en dispositivos móviles Android arm64. El repositorio ocupa aproximadamente 0,1 GB y solo contiene tres ficheros del backbone, que deben combinarse con los artefactos del modelo original.

La relevancia de esta ficha es acotada: es un artefacto de despliegue orientado a un caso de uso muy concreto (lectura de texto en vietnamita en teléfonos), no un modelo de propósito general ni una versión oficial del autor original. La licencia Apache-2.0 se hereda del modelo base, y la calidad reportada por el autor se mantiene dentro del ruido de medición respecto a la versión int8 de origen, según una evaluación con Whisper large-v3 sobre 40 frases.

Es importante señalar que el modelo base, VieNeu-TTS v3 Turbo, es un sistema de texto a voz especializado en vietnamita, y que esta publicación no incluye los componentes de configuración, tokenizador, acústica ni cabezales, que se toman sin cambios del repositorio upstream. Por tanto, cualquier evaluación debe hacerse sobre el pipeline completo, no sobre este repositorio aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de transformer para TTS en grafos ONNX (prefill y decode step), con MatMulNBits 4-bit en las MLP de las capas 0-9 e int8 dinámico en el resto de MatMuls |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MatMulNBits, bloque 32, simétrico, accuracy_level 4) e int8 dinámico (MatMulInteger) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con fichero de datos externo compartido (`vieneu_backbone_shared.data`) |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento: es una conversión de cuantización post-entrenamiento aplicada sobre los grafos ONNX del modelo base pnnbao-ump/VieNeu-TTS-v3-Turbo (revisión 61b85e3d937fbbacb387714180e8182823512523), cuyos grafos fp32 se encontraban en la carpeta `onnx_update/`. La herramienta utilizada es `onnxruntime.quantization`, combinando `MatMulNBitsQuantizer` para las multiplicaciones de las capas MLP (gate, up y down) de las capas 0 a 9 del transformer y `quantize_dynamic` para el resto de MatMuls, generado por el script `tool/distill/turbo_quant4.py` del repositorio Aupub.

La innovación técnica principal es la compartición de un único fichero de datos externo (`vieneu_backbone_shared.data`, 77.266.944 bytes) entre los dos grafos (`vieneu_prefill.onnx` y `vieneu_decode_step.onnx`), deduplicado por contenido, frente a los 103.891.968 bytes de la versión int8 upstream. Esto reduce el tamaño del paquete para la build móvil. El modelo requiere ONNX Runtime 1.17 o superior con el kernel MatMulNBits en el execution provider de CPU; el autor reporta pruebas con las versiones 1.23 en Android arm64 y 1.31 en Windows. No se dispone de información sobre la arquitectura interna del modelo base, los datos de entrenamiento originales ni si hubo ajuste por RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita, orientada a la lectura de texto en una aplicación móvil.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU, gracias a la cuantización a 4 bits e int8.
- Ejecución en dispositivos Android arm64, según las pruebas del autor.
- Grafos separados de prefill y de paso de decodificación, adecuados para generación autorregresiva de audio.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multilingüismo más allá del vietnamita.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje general.

## Casos de uso

- Lectura por voz en aplicaciones móviles: el paquete cuantizado reduce el peso descargable y permite sintetizar voz en un teléfono Android sin conexión a GPU, integrándose con los ficheros de configuración, tokenizador, acústica y cabezales del modelo base.
- Lectores de pantalla y accesibilidad para vietnamita: la inferencia en CPU con ONNX Runtime permite convertir artículos o libros en audio en tiempo de ejecución en dispositivos de gama media.
- Aplicaciones educativas de aprendizaje de vietnamita: la síntesis de frases con una voz concreta (Hải Đăng en la evaluación del autor) sirve para generar material de escucha bajo demanda.
- Distribución de paquetes ligeros en tiendas de aplicaciones: al ocupar alrededor de 0,1 GB y compartir un único fichero de datos entre grafos, encaja en builds con límites estrictos de tamaño.
- Procesamiento por lotes en servidores sin GPU: el uso de ONNX Runtime con execution provider de CPU permite generar audio para corpus de texto vietnamita en máquinas sin aceleradores.
- Pruebas de integración en pipelines ONNX: sirve como variante cuantizada para comparar latencia y calidad frente a la versión int8 upstream en el mismo entorno de ejecución.

## Benchmarks y rendimiento

El autor reporta una única comprobación de calidad, no un conjunto de benchmarks estándar. Se realizó con Whisper large-v3 sobre 40 frases y 618 sílabas, con la voz Hải Đăng y decodificación greedy:

| Metrica | Upstream int8 | Este bundle (q4) |
|---|---|---|
| Silabas eliminadas | 3 | 2 |
| Silabas sustituidas | 28 | 33 |
| Total de silabas evaluadas | 618 | 618 |

El propio autor indica que la diferencia está dentro del ruido de medición. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas TTS estándar como MOS o WER sobre corpus públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa; el modelo está pensado para CPU. El fichero de datos compartido ocupa 77.266.944 bytes, y los dos grafos ONNX suman aproximadamente 1,17 MB, por lo que la memoria residente es moderada pero no se especifica.
- GPU recomendadas: no disponibles; el autor no documenta ejecución en GPU.
- Compatibilidad con GPU de consumo: no documentada; el diseño apunta a CPU en Android arm64 y Windows.
- Opciones de despliegue: ONNX Runtime 1.17 o superior con execution provider de CPU y kernel MatMulNBits; probado con 1.23 en Android arm64 y 1.31 en Windows. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Williamsvo275/aupub-vieneu-turbo-q4 | no disponible | no disponible | 4 bits + int8 dinámico | Apache-2.0 | Hugging Face, 0 descargas |
| pnnbao-ump/VieNeu-TTS-v3-Turbo (int8 upstream) | no disponible | no disponible | int8 | Apache-2.0 | Hugging Face (modelo base) |
| pnnbao-ump/VieNeu-TTS-v3-Turbo (fp32) | no disponible | no disponible | fp32 | Apache-2.0 | Hugging Face (grafos en `onnx_update/`) |

La comparación relevante es con las variantes del propio modelo base: este bundle reduce el fichero de datos de 103.891.968 bytes a 77.266.944 bytes y mantiene una calidad de síntesis equivalente dentro del ruido de medición. No se dispone de datos para comparar con otros sistemas TTS vietnamitas.

## Limitaciones y advertencias

- El repositorio solo contiene los tres ficheros del backbone; requiere `config.json`, `tokenizer.json`, `vieneu_acoustic_cached.onnx` y `vieneu_v3_heads.npz` del modelo base para funcionar.
- Solo soporta vietnamita; no hay evidencia de otras lenguas.
- La cuantización a 4 bits puede introducir degradaciones no medidas en voces, estilos o dominios distintos al de la comprobación (40 frases, una sola voz).
- La evaluación de calidad se basa en una única prueba con Whisper large-v3, no en métricas perceptuales como MOS ni en un corpus público amplio.
- Requiere ONNX Runtime 1.17 o superior con soporte del kernel MatMulNBits; versiones anteriores o execution providers sin ese kernel no podrán cargar los grafos.
- El autor no documenta sesgos, riesgo de alucinación ni comportamiento en textos fuera de dominio; al ser un modelo TTS, el riesgo principal es una pronunciación incorrecta o una prosodia deficiente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-02), por lo que no hay validación comunitaria independiente.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del repositorio upstream.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Williamsvo275/aupub-vieneu-turbo-q4
- Modelo base: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Revisión del modelo base citada: 61b85e3d937fbbacb387714180e8182823512523
- Script de cuantización: `tool/distill/turbo_quant4.py` en el repositorio Aupub (no se proporciona URL)
- ONNX Runtime: https://onnxruntime.ai/
