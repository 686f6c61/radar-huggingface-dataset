# stephvax/audio8-tts-realistic-0.6b-onnx-int4

## Resumen

Audio8-TTS Realistic 0.6B — ONNX INT4 es una exportación independiente del checkpoint `Edge0/Audio8-TTS-Realistic-0.6b` a grafos ONNX Runtime con cuantización de pesos INT4. El modelo original es un sistema de síntesis de voz (text-to-speech) multilingüe con clonación de voz zero-shot, desarrollado por Edge0 sobre una arquitectura DualAR inspirada en Fish Audio S2 Pro. Esta versión ONNX no la publica Edge0: la firma `stephvax` y replica exactamente el contrato de entrada/salida de la exportación oficial `Audio8-TTS-Preview-0.6B-ONNX-INT4`, de modo que cualquier runtime escrito para aquella funciona sin cambios.

El interés práctico de esta ficha es doble. Por un lado, permite ejecutar un TTS de 0.6B parámetros con clonación de voz en 23 idiomas sobre ONNX Runtime, sin depender de PyTorch ni de `trust_remote_code`. Por otro, documenta con transparencia inusual el proceso de conversión y sus límites: el autor advierte de que la cuantización INT4 degrada más este checkpoint que el Preview (deriva de logits 2,3–2,5× mayor) y de que la calidad auditiva difiere del modelo de referencia, por lo que debe considerarse experimental.

El repositorio ocupa 1,0 GB e incluye dos grafos autorregresivos (slow/fast), el decodificador de códec a 44,1 kHz, el codificador de voz de referencia y el tokenizer Qwen2 BPE con 4.096 tokens semánticos. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (dos transformers autorregresivos: slow semantico + fast de codebook) con codec decoder a 44,1 kHz |
| Parametros totales | 0,6B (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (MatMulNBits 4-bit block 128 asimetrico; GatherBlockQuantized 4-bit block 32 en embeddings); codec decoder y encoder en FP16 |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue (23) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.data`), tokenizer JSON |

## Arquitectura y entrenamiento

El modelo base sigue el diseño DualAR de Fish Audio S2 Pro, segun el `NOTICE` upstream citado en la model card. La generación se reparte entre un transformer "slow" de 24 capas que produce tokens semánticos y un transformer "fast" de 4 capas que genera los tokens de codebook; un decodificador de códec independiente convierte la secuencia en audio a 44,1 kHz. El tokenizer es Qwen2 BPE ampliado con 4.096 tokens semánticos. El encoder de códec en FP16 actúa como extractor de la voz de referencia para la clonación zero-shot.

Esta exportación no reentrena nada: los dos grafos autorregresivos se trazan desde las clases `modeling_arktts.py` del checkpoint con el exportador TorchScript de PyTorch 2.8 (opset 17, FP16) y se cuantizan después con `MatMulNBitsQuantizer` de ONNX Runtime. El autor valida la cadena reproduciendo los grafos oficiales del Preview byte a byte (inicializadores idénticos, misma firma de E/S, cero diferencia numérica en 200 frames) y comprueba que los grafos FP16 previos a la cuantización coinciden con el modelo PyTorch FP32 con un 100 % de acuerdo de argmax en el transformer slow y un 99,6 % en el fast. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas, incluidos chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, hindi, tailandés y cantonés.
- Clonación de voz zero-shot a partir de una muestra de referencia procesada por el encoder de códec FP16.
- Generación autorregresiva en dos etapas (semántica y codebook) con decodificación greedy validada en la exportación.
- Salida de audio a 44,1 kHz mediante el decodificador de códec incluido.
- Ejecución sobre ONNX Runtime sin PyTorch ni código remoto (`trust_remote_code` no necesario).
- Compatibilidad directa con runtimes escritos para el contrato de `Audio8-TTS-Preview-0.6B-ONNX-INT4`, incluido el runtime de referencia `arktts_runtime` de Edge0.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la voz de referencia para clonación.

## Casos de uso

- Doblaje y localización de vídeo: el soporte de 23 idiomas y la clonación zero-shot permiten generar pistas de voz en varios idiomas manteniendo el timbre del hablante original a partir de una muestra corta.
- Audiolibros y contenido largo: la arquitectura autorregresiva con decodificador a 44,1 kHz produce audio de calidad alta; conviene segmentar el texto y encadenar generaciones por la ausencia de datos publicados sobre longitud de contexto.
- Asistentes de voz embebidos: al ser ONNX INT4 de 0,6B y 1,0 GB de repositorio, puede desplegarse en entornos sin GPU dedicada o con VRAM limitada usando ONNX Runtime.
- Accesibilidad y lectura de pantalla: síntesis en el idioma del usuario con voces personalizadas clonadas de una grabación propia.
- Prototipado de productos de voz: la compatibilidad con el runtime de referencia de Edge0 permite sustituir el Preview por este modelo sin reescribir la integración.
- Generación de voces para vídeojuegos o NPC: clonación de un conjunto reducido de voces y generación por lotes en servidor.
- Investigación en TTS: el repositorio incluye `provenance.json` y `SHA256SUMS`, lo que facilita reproducir la conversión y comparar recetas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas internas de fidelidad de la conversión: acuerdo de argmax del 100 % (slow) y 99,6 % (fast) frente al modelo FP32, y una deriva de logits INT4 respecto a FP32 aproximadamente 2,3–2,5× mayor que la del Preview oficial, con un 40 % de esa deriva adicional atribuida a las tablas de embeddings cuantizadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio completo pesa 1,0 GB, por lo que la inferencia INT4 debería caber holgadamente en GPUs de 4–8 GB, aunque no se publican cifras medidas.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería ser suficiente, pero es una estimación, no un dato del autor.
- CPU: viable en principio al usar ONNX Runtime, sin cifras de latencia publicadas.
- Opciones de despliegue: ONNX Runtime (versiones 1.23 y 1.27 validadas por el autor) y el runtime de referencia `arktts_runtime` de Edge0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Audio8-TTS Realistic 0.6B — ONNX INT4 (esta ficha) | 0,6B | no disponible | 23 | Apache-2.0 | ONNX INT4 | Exportacion independiente, experimental |
| Edge0/Audio8-TTS-Realistic-0.6b | 0,6B | no disponible | 23 | Apache-2.0 | PyTorch (safetensors) | Checkpoint original, sin exportacion ONNX oficial |
| Edge0/Audio8-TTS-Preview-0.6B-ONNX-INT4 | 0,6B | no disponible | no disponible | Apache-2.0 | ONNX INT4 | Exportacion oficial del Preview; referencia de contrato y receta de cuantizacion |

No se dispone de información sobre otros modelos TTS comparables (por ejemplo, de la familia Fish Audio u otras alternativas) en la documentación proporcionada.

## Limitaciones y advertencias

- Exportación no oficial: no es una release de Audio8 ni de Edge0; el autor lo declara explícitamente.
- La cuantización INT4 es más agresiva en este checkpoint que en el Preview: deriva de logits 2,3–2,5× mayor y 1,6× más KL a temperatura 0,7.
- Alrededor del 40 % de la deriva adicional del transformer slow proviene de las tablas de embeddings cuantizadas.
- Las notas de escucha del autor (un solo oyente, francés, 3 textos × 2 semillas) indican entonación distinta en ocasiones y pausas a veces notablemente más largas; no se ha determinado si se debe a la receta INT4 o al checkpoint.
- El autor recomienda tratar la exportación como experimental y juzgar el resultado por escucha.
- No se publican datos sobre sesgos, tasa de alucinación (en TTS, artefactos o pronunciación incorrecta), longitud máxima de texto ni contexto.
- La licencia Apache-2.0 permite uso comercial, pero el `NOTICE` upstream atribuye la inspiración arquitectónica a Fish Audio S2 Pro; conviene revisar las condiciones de ese proyecto antes de un despliegue comercial.
- El códec, el tokenizer y los manifiestos proceden de la release Preview de Edge0 y se reutilizan byte a byte; cualquier cambio en esos artefactos invalida la validación del autor.
- Solo se han validado las versiones 1.23 y 1.27 de ONNX Runtime.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/stephvax/audio8-tts-realistic-0.6b-onnx-int4
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Exportación oficial de referencia (Preview ONNX INT4): https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Runtime de referencia `arktts_runtime`: https://github.com/Audio8-AI/Audio8_TTS/tree/main/onnx_runtime
- Repositorio Audio8_TTS: https://github.com/Audio8-AI/Audio8_TTS
