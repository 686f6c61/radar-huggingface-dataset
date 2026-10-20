# wOvANAI/rknn-tts-engines

## Resumen

`wOvANAI/rknn-tts-engines` no es un modelo entrenado, sino un repositorio de artefactos: imágenes de motor RKNPU2 precompiladas en formato `.rknn` para las rutas de inferencia TTS de [audio.cpp](https://github.com/0xShug0/audio.cpp) sobre Rockchip RK3588. El repositorio ocupa 0,6 GB e incluye cuatro motores: decodificador streaming de Piper, generador de Kokoro-82M y dos variantes del decodificador de voz de Qwen3-TTS-12Hz con chunks de 16 y 64.

Los motores se compilaron en x86_64 con rknn-toolkit2 2.3.2 usando `do_quantization=False`, es decir, almacenamiento de pesos en fp16, y se validaron ejecutando las sesiones correspondientes de audio.cpp en una placa RK3588. Cada `.rknn` está compilado para `target_platform="RK3588"` y no es portable entre chips.

Su relevancia práctica es que permite desplegar TTS local en la NPU de RK3588 sin repetir la cadena de conversión desde ONNX, manteniendo los nombres de fichero de producción para que un `exec_plan` de audio.cpp apunte directamente a ellos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo único: motores RKNN para TTS sobre RKNPU2. Orígenes: decodificador streaming de Piper, generador iSTFTNet de Kokoro-82M y speech decoder stateful de Qwen3-TTS-12Hz |
| Parámetros totales | No disponible. El repositorio contiene motores compilados, no pesos completos de los modelos origen; Kokoro-82M corresponde al nombre del modelo origen del generador |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no es un LLM. Ventanas de audio: Piper 93 slices; Kokoro 512 frames; Qwen3-TTS chunks de 16 y 64 |
| Tipos de cuantización | fp16 en almacenamiento de pesos; compilado con `do_quantization=False`. No se declaran variantes int8 o int4 |
| Idiomas soportados | No disponible para el conjunto. El motor Piper incluido usa la voz `en_US-lessac-medium` (inglés estadounidense); Kokoro y Qwen3-TTS no declaran idiomas en la información proporcionada |
| Licencia | Repositorio: no disponible. Motores derivados: Kokoro-82M Apache-2.0; Qwen3-TTS-12Hz Apache-2.0; voz Piper `en_US-lessac-medium`: licencia del dataset Lessac Blizzard 2013, solo uso no comercial |
| Formato de pesos | `.rknn` (RKNPU2), `target_platform="RK3588"` |
| Plataforma destino | Rockchip RK3588 exclusivamente; RKNPU2 |
| Tarea | Motores TTS para audio.cpp: `piper_tts`, `kokoro_tts` y `qwen3_tts` |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

No hay entrenamiento propio en este repositorio. Los `.rknn` se generan a partir de ONNX públicos con los conversores de `tools/rknn/` de audio.cpp y rknn-toolkit2 2.3.2 sobre x86_64. La model card indica que `SHA256SUMS` fija los bytes exactos y que una reconstrucción local desde el mismo ONNX y toolkit reproduce bit a bit las salidas del simulador; el path de compilación embebido cambia los hashes del contenedor, pero no el grafo compilado.

| Fichero | Rol en `exec_plan` | Origen | Tamaño |
|---|---|---|---|
| `rk3588/piper-lessac-w93.rknn` | `piper_tts` → `decoder.main` | Decodificador streaming ONNX de `en_US-lessac-medium` (Piper), ventana de 93 slices, grafo `z [1,192,93]` + `y_mask [1,1,93]` | 19,6 MB |
| `rk3588/generator_w512.rknn` | `kokoro_tts` → `generator.main` | Generador ONNX de Kokoro-82M (iSTFTNet), ventana de 512 frames | 93,5 MB |
| `rk3588/qwen3-tts/vocoder_stateful_16_fp16.rknn` | `qwen3_tts` → `speech_decoder.main` | Speech decoder de Qwen3-TTS-12Hz, stateful, chunk 16 | 244,9 MB |
| `rk3588/qwen3-tts/vocoder_stateful_64b_fp16.rknn` | `qwen3_tts` → `speech_decoder.main` | Speech decoder de Qwen3-TTS-12Hz, stateful, chunk 64 | 259,7 MB |

La residencia en memoria no coincide con el tamaño de fichero: el runtime RKNN de audio.cpp la calcula con `RKNN_QUERY_MEM_SIZE`. En RK3588, la pareja de Qwen3-TTS queda residente en 263 MiB y 331 MiB, por encima de sus 245 MB y 260 MB de fichero. No se publica la ladder `flow_estimator_seq*` de CosyVoice3, de 700-860 MB por peldaño y ocho peldaños; debe generarse con `tools/rknn/prepare_cosyvoice3_rknn_flow.py` para el SoC y la apertura propios.

## Capacidades

- Síntesis de voz local en la NPU de RK3588 mediante el runtime RKNN de audio.cpp.
- Piper: decodificación streaming por ventanas de 93 slices, con entrada `z [1,192,93]` y máscara `y_mask [1,1,93]`.
- Kokoro: generación con ventana de 512 frames a partir del generador iSTFTNet de Kokoro-82M.
- Qwen3-TTS: decodificación de voz stateful por chunks de 16 y 64, adecuada para procesar audio en bloques manteniendo estado.
- Integración directa con `exec_plan` de audio.cpp: los nombres de fichero coinciden con los nombres de producción en placa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni generación de texto.
- No es un modelo multimodal de entrada: es un conjunto de motores TTS; no se declara entrada de audio.
- No se declara soporte multilingüe para Kokoro ni Qwen3-TTS; el único idioma explícito es inglés estadounidense en la voz Piper incluida.
- No incluye los motores de CosyVoice3; solo se documenta cómo generarlos.

## Casos de uso

- Asistente de voz offline en dispositivos RK3588: integrar uno de los motores en audio.cpp para sintetizar respuestas localmente, sin enviar texto a servicios cloud y con la NPU como unidad de ejecución.
- Lectura de notificaciones y accesibilidad: usar el decodificador streaming de Piper con ventana de 93 slices para frases cortas y anuncios del sistema en una placa RK3588.
- Kiosco interactivo o terminal de información: emplear el generador de Kokoro con ventana de 512 frames cuando se priorice la calidad del generador iSTFTNet y el dispositivo pueda asumir su residencia.
- Streaming de respuestas largas en domótica o robótica: usar Qwen3-TTS stateful con chunk 16 para granularidad fina o chunk 64 para bloques mayores, manteniendo el estado entre chunks.
- Des
