# ZETIC-ai/LFM3-Omni-2B-IQ9

## Resumen

LFM3-Omni-2B-IQ9 es un paquete de despliegue del modelo omnicanal LFM3-Omni-2B de Liquid AI, empaquetado por ZETIC-ai para ejecutarse en la NPU Hexagon del SoC Qualcomm Dragonwing IQ9 (QCS9075). El modelo original acepta texto, imagenes, audio y video como entrada, y produce texto y voz (24 kHz mono) como salida, lo que lo convierte en un modelo any-to-any orientado a dispositivos edge. Este repositorio no contiene los pesos originales, sino una derivada convertida: pesos del modelo de lenguaje cuantizados en bloques a 4 bits, codificadores de vision y audio en fp16, y un decodificador de voz.

La relevancia de este paquete radica en que traslada un modelo omnicanal de 2B parametros a un entorno de inferencia puramente on-device sobre NPU, sin depender de GPU ni de conectividad a la nube. Se ejecuta mediante Ixian Hexagon, el runtime propio de ZETIC para Hexagon, a traves del ZeticMLange Hexagon SDK, distribuido por separado en GitHub. El contexto por defecto es de 2.048 posiciones, ampliable hasta 131.072 en el target `v73` (ambas NSP) y hasta 4.096 en `v73-1nsp` (una sola NSP).

El modelo base pertenece a la familia LFM3 de Liquid AI, con arquitectura no especificada en la informacion disponible, y se distribuye bajo la licencia LFM 1.0. El paquete esta pensado exclusivamente para el Dragonwing IQ9 con Qualcomm Linux en linux-arm64, por lo que no es un artefacto portable a otras plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3 de Liquid AI; el paquete incluye LM cuantizado, codificadores de vision y audio, y decodificador de voz) |
| Parametros totales | 2B (segun el nombre del modelo base) |
| Parametros activos | No disponible |
| Longitud de contexto | 2.048 por defecto; hasta 131.072 en `v73`; hasta 4.096 en `v73-1nsp` |
| Tipos de cuantizacion | Pesos del LM cuantizados en bloques a 4 bits (etiqueta IQ9); codificadores de vision y audio en fp16 |
| Idiomas soportados | No disponible |
| Licencia | LFM 1.0 (`license_name: lfm1.0`) |
| Formato de pesos | Paquete propietario del SDK: `manifest.json`, `SHA256SUMS`, configs y pesos; no safetensors ni GGUF |
| Entradas | Texto, imagenes, audio, video (frames decodificados) |
| Salidas | Texto, voz (24 kHz mono) |
| Plataforma | Qualcomm Dragonwing IQ9 (QCS9075), Qualcomm Linux, linux-arm64 |
| Runtime | Ixian Hexagon + ZeticMLange Hexagon SDK for the Dragonwing IQ9 |
| Tamano del repo | 4,3 GB (paquetes: `v73` 3,58 GB / 25 archivos; `v73-1nsp` 2,84 GB / 24 archivos; total 6,42 GB) |
| Revision upstream | `ce2458cbce4ad970f92032ed94e3d18d30b04f9c` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM3-Omni-2B ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). La model card de este repositorio describe unicamente el empaquetado para el dispositivo destino: un modelo de lenguaje con pesos cuantizados en bloques a 4 bits, codificadores de vision y audio en fp16 y un decodificador de voz, todo ello derivado del checkpoint original de Liquid AI y no de los pesos sin convertir.

La innovacion tecnica principal de este artefacto es el despliegue sobre la NPU Hexagon del QCS9075 mediante el runtime Ixian Hexagon. El paquete ofrece dos targets: `v73`, que utiliza ambas NSP (unidades de procesamiento neuronal escalares del Hexagon) y es el predeterminado, y `v73-1nsp`, que ejecuta el mismo modelo en una sola NSP y deja la otra libre para otras cargas de trabajo. La seleccion se realiza con `LLMOptions::target` o la opcion de CLI `--target`. El SDK no se incluye en el repositorio y se distribuye aparte en GitHub.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de modo interactivo en la CLI (`-i`).
- Comprension de imagenes: responde preguntas sobre imagenes de entrada (validado 5/5 en el paquete `v73`).
- Reconocimiento de voz (ASR): procesa audio de hasta 30 s por parte, con WER 0 en cuatro clips durante la validacion.
- Entrada de video: acepta frames decodificados a 512x512 y muestrea a 2 fps.
- Salida de voz (TTS): sintesis a 24 kHz mono, con modos de solo audio o voz y texto simultaneos (voice chat).
- Entrada multimodal combinada en un mismo turno: imagen y audio conjuntamente (validado en `v73`).
- API programatica en C++ (`zetic_llm.h`) con tipos `LLM`, `Message`, `Part`, `Image`, `Audio`, `Video` y `GenerationConfig`.
- Streaming de audio mediante `StreamEvent::Type::Audio` y acceso al clip completo en `Response::audio`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico en la informacion disponible.

## Casos de uso

- Asistencia visual en campo: un tecnico fotografia un componente o etiqueta y formula una pregunta por voz; el modelo combina imagen y audio en un unico turno y responde en texto o voz, sin conexion a la nube.
- Reconocimiento de voz embebido en dispositivos: transcripcion de clips de hasta 30 s con WER 0 en las pruebas del autor, adecuado para interfaces por voz en hardware sin GPU.
- Respuesta por voz en dispositivos: sintesis TTS a 24 kHz mono para asistentes de mano, kioscos o equipos industriales que deben hablar sin depender de servicios externos.
- Analisis de video de baja cadencia: muestreo de frames a 2 fps a partir de video decodificado para describir escenas o responder preguntas sobre clips cortos.
- Interaccion conversacional multi-turno on-device: la CLI con modo interactivo y el contexto configurable permiten mantener dialogos con historial en el propio dispositivo.
- Despliegue con particion de recursos: el target `v73-1nsp` reserva una NSP para el modelo y deja la otra libre para otras tareas del sistema, util en equipos que deben ejecutar varias cargas de inferencia.
- Prototipado de aplicaciones any-to-any en edge: integracion mediante la API C++ del SDK para construir interfaces que acepten imagen, audio y texto y devuelvan texto o voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente recoge la validacion funcional del paquete:

| Prueba | `v73` (2 NSP) | `v73-1nsp` (1 NSP) |
|---|---|---|
| Chat de texto | Validado | No validado por separado |
| Preguntas sobre imagen | 5/5 | No validado por separado |
| Reconocimiento de voz (WER) | 0 en cuatro clips | Identico en ids de tokens a `v73` en un clip |
| Imagen + audio en un turno | Validado | No validado por separado |
| Clip de video | Validado | No validado por separado |
| Salida de voz (TTS y voice chat) | Validado con reconocedor de voz | No validado por separado |

Fechas de validacion: `v73` entre el 31 de octubre y el 2 de noviembre de 2026 con el SDK 0.1.0; `v73-1nsp` el 4 de noviembre de 2026 con un export anterior y un build de desarrollo previo a 0.2.0.

## Requisitos de hardware

- Plataforma obligatoria: Qualcomm Dragonwing IQ9 (QCS9075) con Qualcomm Linux en linux-arm64. No se documenta soporte para otras GPU, CPU o NPU.
- Acelerador: NPU Hexagon del QCS9075, con uno o dos NSP segun el target.
- Memoria: el paquete `v73` ocupa 3,58 GB en disco y el `v73-1nsp` 2,84 GB. Ampliar el contexto a 32.768 posiciones consume aproximadamente 0,4 GB adicionales de memoria.
- No cabe en GPU de consumo: el artefacto no esta pensado para A100, H100 ni RTX 4090, sino exclusivamente para la NPU del IQ9.
- Despliegue: Ixian Hexagon y el ZeticMLange Hexagon SDK for the Dragonwing IQ9 (libreria, cabeceras, herramientas de linea de comandos y libreria DSP de Hexagon), distribuido en GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Herramientas de CLI: `zetic_lfm3_cli` con subcomandos `info` y `chat`, opciones `--media`, `--tts`, `--out`, `-i`, `--ctx` y `--target`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos omnicanal o de edge, y este paquete solo funciona en el Dragonwing IQ9, lo que limita la comparacion directa con alternativas desplegables en otras plataformas.

## Limitaciones y advertencias

- Dependencia total de hardware: solo funciona en el Dragonwing IQ9 (QCS9075) con Qualcomm Linux; no es portable a otras plataformas.
- El SDK necesario no esta en el repositorio y debe obtenerse por separado desde GitHub, lo que anade un paso de integracion.
- Las imagenes y frames de video deben ser exactamente 512x512 RGB; el SDK rechaza otros tamanos con `Status::InvalidArgument` y no reescala, por lo que hay que redimensionar o aplicar letterbox previamente.
- El audio se limita a 30 s por parte; clips mas largos deben dividirse en varias partes.
- El contexto por defecto es de solo 2.048 posiciones; ampliarlo consume memoria (unos 0,4 GB a 32.768) y en `v73-1nsp` el maximo es 4.096.
- El target `v73-1nsp` solo fue validado en una pregunta de imagen y un clip de ASR; el resto de entradas y la salida de voz no se validaron por separado en una sola NSP.
- Los pesos son una derivada convertida del checkpoint original, no los pesos originales, por lo que pueden existir diferencias de comportamiento respecto al modelo base.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica; los idiomas soportados figuran como no disponibles.
- Licencia LFM 1.0: conviene revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, dado que la licencia se etiqueta como `other` en los metadatos.
- No se documenta soporte de tool calling ni de razonamiento agentico multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZETIC-ai/LFM3-Omni-2B-IQ9
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Revision upstream: https://huggingface.co/LiquidAI/LFM3-Omni-2B/tree/ce2458cbce4ad970f92032ed94e3d18d30b04f9c
- SDK (ZeticMLange Hexagon SDK for the Dragonwing IQ9): https://github.com/zetic-ai/IxianHexagon
- Licencia: archivo `LICENSE` incluido en el repositorio
