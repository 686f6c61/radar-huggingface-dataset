# Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix

## Resumen

Cohere Transcribe para Tenstorrent Tensix es una redistribucion de los pesos del modelo de reconocimiento automatico del habla CohereLabs/cohere-transcribe-03-2026, preparada por Xylolabs para su ejecucion sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo ni de un fine-tuning: el repositorio contiene exclusivamente los pesos de los operadores del reconocedor, reorganizados por componentes (frontend, 48 capas de encoder, 8 capas de decoder y la cabeza de salida) y cuantizados en formato BFP8, con algunos tensores en BF16 y FP32.

El problema que resuelve es de despliegue: facilita llevar un modelo de transcripcion de voz a hardware no-GPU mediante un cargador de componentes en streaming y un formato de pesos adaptado a la unidad Tensix. El modelo base es un sistema encoder-decoder para transcripcion automatica, con soporte declarado de coreano e ingles, y licencia Apache 2.0.

Es relevante para quienes trabajan con aceleradores Tenstorrent y necesitan una alternativa de ASR lista para portar, aunque el repositorio no incluye un adaptador de inferencia completo: el autor indica que una integracion debe preservar el layout de cada operando y su preparacion (escalado de query plegado y batch normalization incluidas). El tamano del repositorio es de 4,2 GB, con los archivos en la carpeta `components-bfp8/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para reconocimiento automatico del habla (48 capas de encoder, 8 capas de decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (principal), BF16, FP32 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (componentes BFP8/BF16/FP32, cargador en streaming) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer encoder-decoder orientada a ASR: un frontend de procesamiento de audio, 48 capas de encoder y 8 capas de decoder, seguidas de una cabeza de salida. Esta redistribucion no modifica la topologia, sino la representacion y el empaquetado de los pesos para la NPU Tensix. Los tensores se organizan por componente (`encoder_00`, etc.) y se pueden cargar de forma individual y en streaming mediante `load_components.py`, lo que reduce el pico de memoria en el host.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El unico detalle tecnico de preparacion mencionado es que el adaptador de integracion debe respetar el layout de cada operando, incluido el escalado de query plegado y la batch normalization.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en coreano e ingles.
- Procesamiento de audio mediante un frontend dedicado incluido en los componentes.
- Arquitectura encoder-decoder con 48 capas de encoder y 8 de decoder, adecuada para secuencias de audio de cierta duracion.
- Ejecucion sobre NPU Tenstorrent Tensix (Wormhole y Blackhole) mediante pesos en BFP8.
- Carga por componentes en streaming para limitar el uso de memoria durante la inicializacion.
- Soporte de precisiones mixtas en los pesos (BFP8, BF16, FP32).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles y coreano: el modelo convierte audio en texto sobre hardware Tenstorrent, lo que permite desplegar ASR en servidores con NPU en lugar de GPU.
- Subtitulado automatizado de contenido audiovisual: el encoder de 48 capas procesa el audio y el decoder genera la secuencia de texto, integrable en pipelines de postproduccion.
- Atencion al cliente con transcripcion en tiempo real: los pesos en BFP8 reducen el coste por inferencia en NPU, lo que facilita mantener sesiones concurrentes de reconocimiento de voz.
- Investigacion en hardware alternativo: sirve como banco de pruebas para validar kernels y adaptadores de ASR sobre Tensix comparando precision BFP8 frente a BF16.
- Archivado y busqueda de grabaciones: transcripcion por lotes de grandes volumenes de audio en ingles o coreano para indexacion y recuperacion de contenido.
- Evaluacion de cuantizacion: al ofrecer los mismos pesos en BFP8, BF16 y FP32, permite medir el impacto de la precision en la calidad de transcripcion.
- Desarrollo de asistentes de voz embebidos en entornos con NPU Tenstorrent, donde no se dispone de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- VRAM: no aplica en el sentido tradicional; el repositorio ocupa 4,2 GB en disco y la carga por componentes en streaming reduce la memoria residente en el host.
- GPU: no es el destino de esta redistribucion; no se documentan requisitos para GPU convencionales.
- GPU de consumo: no disponible para esta version; el modelo esta preparado para Tensix, no para CUDA.
- Despliegue: cargador propio `load_components.py` con PyTorch y safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix | no disponible | no disponible | ko, en | Apache 2.0 | Tenstorrent Tensix (Wormhole, Blackhole) |
| CohereLabs/cohere-transcribe-03-2026 (base) | no disponible | no disponible | ko, en | Apache 2.0 | GPU convencional (formato original) |
| Whisper (variantes open source) | variable | no disponible | multilingue | MIT / Apache 2.0 segun variante | GPU y CPU |

La comparativa se limita a la relacion con el modelo base, del que esta version hereda arquitectura y pesos. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con otras alternativas de ASR.

## Limitaciones y advertencias

- Solo cubre coreano e ingles; no se declaran otros idiomas.
- No es un modelo autonomo: requiere un adaptador de integracion que respete el layout de operandos, el escalado de query plegado y la batch normalization.
- La cuantizacion BFP8 puede degradar la precision de transcripcion frente a BF16 o FP32; no se publican metricas al respecto.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o solapamiento de hablantes, habitual en sistemas ASR.
- No se documentan sesgos especificos del modelo base en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los archivos LICENSE y NOTICE de cada carpeta, que identifican la fuente y la preparacion de los pesos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- El autor renombro el repositorio el 2026-11-27; enlaces antiguos pueden apuntar a rutas obsoletas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Cargador de componentes: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix/blob/main/components-bfp8/load_components.py
- Licencia: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix/blob/main/LICENSE
- Repositorio de codigo de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
