# voyagar/Qwen3-ASR-1.7B-onnx-int8

## Resumen

Qwen3-ASR-1.7B-onnx-int8 es una compilacion cuantizada a 8 bits del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta variante la publica el usuario voyagar como parte del motor de transcripcion del proyecto Tractus, una aplicacion de dictado para Windows. El objetivo concreto es ofrecer inferencia en CPU mediante onnxruntime, sin depender de GPU ni de frameworks como PyTorch o MLX.

El modelo resuelve el problema de la transcripcion de voz bilingue coreano-ingles con terminologia tecnica, un escenario donde la cuantizacion a 4 bits del export previo perdia precision en cambios de idioma y en vocabulario especializado. La build mantiene la misma estructura de grafo y los mismos nombres de fichero que el export int4 de andrewleech, de modo que actua como reemplazo directo, pero cuantiza el decodificador a 8 bits con `MatMulNBits` de onnxruntime.

La relevancia actual esta en que demuestra que un ASR de 1,7 mil millones de parametros puede ejecutarse en CPU de consumo con una calidad cercana a la de una build de 8 bits en GPU (MLX), a costa de un mayor uso de memoria y una velocidad menor. El repositorio ocupa 4,4 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer para ASR (Qwen3-ASR); encoder en FP32, decodificador cuantizado a 8 bits |
| Parametros totales | 1,7 mil millones (heredados del modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos del decodificador en int8 (weight-only), `MatMulNBits`, block size 64, asimetrico, `accuracy_level=4`; embeddings en FP16; encoder en FP32 |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime), con pesos externos compartidos en `.data`; `embed_tokens.bin` en FP16 |

## Arquitectura y entrenamiento

El modelo es un export ONNX del Qwen3-ASR-1.7B original de Qwen. La arquitectura sigue el esquema encoder-decoder propio de la familia Qwen3-ASR: un encoder de audio que procesa la senal acustica y un decodificador autorregresivo que genera los tokens de transcripcion. En esta build el encoder se mantiene en FP32 sin cambios respecto al export de andrewleech, mientras que los dos grafos del decodificador (`decoder_init` para prefill y `decoder_step` para generacion paso a paso) se cuantizan a 8 bits.

El proceso de construccion, documentado en la model card, se realizo con onnxruntime 1.32.0 sobre los ficheros FP32 de la revision `df916193ac67e59347769891a21e10d81d12acdd`. Se aplico `MatMulNBitsQuantizer` con `DefaultWeightOnlyQuantConfig(bits=8, block_size=64, is_symmetric=False)` a ambos decodificadores, se compartieron los pesos externos entre ellos y se fijo `accuracy_level=4` en los 197 nodos `MatMulNBits` para habilitar computo de activaciones en int8. Ademas, la tabla de embeddings duplicada del grafo de prefill se almacena en FP16 con un `Cast` a FP32, lo que reduce la descarga en 0,62 GB. No se documenta el entrenamiento original ni datos de RLHF o DPO en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto (ASR) en coreano e ingles.
- Manejo de cambios de codigo de idioma coreano-ingles (code-switching) dentro de una misma frase.
- Reconocimiento de terminologia especializada y glosarios tecnicos.
- Inferencia en CPU mediante onnxruntime, sin necesidad de GPU.
- Ejecucion con pesos compartidos entre las fases de prefill y de generacion paso a paso, lo que reduce el espacio en disco.
- Compatibilidad como reemplazo directo del layout int4 de andrewleech (mismos nombres de fichero).
- Soporte de tool calling, agentes o vision: no disponible (el modelo es exclusivamente ASR).

## Casos de uso

- Dictado por voz en Windows: el modelo es el motor de transcripcion de Tractus, por lo que se integra en una aplicacion de escritorio que convierte voz en texto en tiempo real sobre CPU, sin requerir GPU dedicada.
- Transcripcion de reuniones en coreano con glosario tecnico: segun las mediciones del autor, alcanza un CER de 8,86 y un 90,3 % de recall de terminos del glosario en 120 minutos de reuniones, lo que lo hace adecuado para actas con vocabulario especializado.
- Subtitulado de contenido bilingue coreano-ingles: su buen comportamiento en code-switching (MER de 26,83 en el conjunto HiKE) permite generar subtitulos en videos donde los hablantes alternan idiomas.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en onnxruntime CPU, puede desplegarse en infraestructura convencional para transcribir grandes volumenes de audio sin coste de GPU.
- Aplicaciones de accesibilidad: integracion en herramientas de dictado para usuarios con movilidad reducida en equipos de sobremesa o portatiles estandar.
- Evaluacion de calidad de audio y pipelines de datos: transcripcion de conjuntos de audio para anotacion automatica previa a revision humana, gracias a su bajo CER en FLEURS (2,74).

## Benchmarks y rendimiento

El autor publica mediciones en Apple M3 (8 nucleos, 16 GB) con onnxruntime 1.32.0 en CPU, comparando con la build MLX de 8 bits (`mlx-community/Qwen3-ASR-1.7B-8bit`) y la build int4 de andrewleech. Menos es mejor salvo en recall de terminos.

| Conjunto | MLX 8-bit | int4 original | Esta build |
|---|---|---|---|
| HiKE (code-switching coreano-ingles), 1121 clips: MER (PIER) | 26,19 (32,74) | 29,02 (42,93) | 26,83 (32,48) |
| HiKE: bucles | 2 | 6 | 1 |
| Reuniones en coreano, 120 min, con glosario: CER | 8,89 | 9,31 | 8,86 |
| Reuniones en coreano: recall de terminos del glosario | 90,3 % | 80,6 % | 90,3 % |
| RSS pico | 3,3-4,1 GB | 5,3-5,9 GB | 6,2-7,2 GB |
| RTF (M3 CPU, referencia) | 0,12 (GPU) | 0,20-0,25 | 0,35-0,36 |

Subconjuntos verificados tras el ultimo paso de construccion:

| Subconjunto | MLX 8-bit | int4 original | Esta build |
|---|---|---|---|
| HiKE cada 16 clips (71): MER (PIER), bucles | 25,00 (27,29), 0 | 49,76 (45,25), 2 | 28,37 (28,34), 0 |
| Reuniones en coreano, primeros 8 min x 4, glosario: CER, recall | 8,96, 11/11 | 9,01, 10/11 | 8,79, 11/11 |
| FLEURS cada 8 clips (48): CER | 2,74 | 3,68 | 2,74 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo es exclusivamente de reconocimiento de voz.

## Requisitos de hardware

- VRAM: no aplica, el modelo esta pensado para CPU; el consumo es de memoria RAM. RSS pico medido de 6,2-7,2 GB en Apple M3.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. No se documentan requisitos para GPU.
- Cabe en consumer hardware: si, en equipos con al menos 8 GB de RAM (el autor midio en un M3 de 16 GB). No se especifican minimos oficiales.
- Opciones de despliegue: onnxruntime (CPU), con los grafos `encoder.int4.onnx`, `decoder_init.int4.onnx` y `decoder_step.int4.onnx` y los pesos externos compartidos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,35-0,36 en CPU de Apple M3 (referencia, maquina compartida). La build int4 original logra 0,20-0,25 en la misma maquina; la build MLX en GPU alcanza 0,12.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-onnx-int8 (esta build) | 1,7 B | no disponible | ko, en | Apache-2.0 | ONNX int8 | CPU, mayor precision que int4, mayor uso de RAM |
| andrewleech/qwen3-asr-1.7b-onnx (int4) | 1,7 B | no disponible | ko, en | Apache-2.0 | ONNX int4 | Menor RAM y mas rapido, peor en code-switching y glosario |
| mlx-community/Qwen3-ASR-1.7B-8bit | 1,7 B | no disponible | ko, en | Apache-2.0 | MLX 8-bit | Requiere GPU Apple (MLX), referencia de calidad |
| Qwen/Qwen3-ASR-1.7B (original) | 1,7 B | no disponible | ko, en | Apache-2.0 | safetensors | Modelo base sin cuantizar, requiere framework de origen |

## Limitaciones y advertencias

- Solo soporta coreano e ingles; no se documentan otros idiomas.
- Es un modelo exclusivamente de ASR: no genera texto libre, no razona, no escribe codigo ni procesa imagenes.
- El uso de memoria es superior al de la build int4 (6,2-7,2 GB frente a 5,3-5,9 GB de RSS pico), lo que puede ser limitante en equipos con poca RAM.
- La velocidad en CPU es menor que la de la build int4 (RTF 0,35-0,36 frente a 0,20-0,25) y muy inferior a la build MLX en GPU (0,12).
- Los nombres de fichero conservan el sufijo `.int4` por compatibilidad, aunque los pesos son de 8 bits; puede inducir a confusion si se inspecciona el repositorio sin leer la model card.
- Las mediciones se realizaron en una maquina compartida con otras cargas, por lo que el RTF es solo orientativo.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-ASR-1.7B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voyagar/Qwen3-ASR-1.7B-onnx-int8
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Export ONNX de referencia (int4): https://huggingface.co/andrewleech/qwen3-asr-1.7b-onnx
- Build MLX de 8 bits: https://huggingface.co/mlx-community/Qwen3-ASR-1.7B-8bit
- Proyecto Tractus: https://github.com/sjoon21/Tractus
