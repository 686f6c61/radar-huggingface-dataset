# waseigo/DaisyRose-27B-NVFP4-MTP-GGUF

## Resumen

DaisyRose-27B-NVFP4-MTP-GGUF es un empaquetado comunitario en formato GGUF del checkpoint `RadixArk/DaisyRose-27B-NVFP4`, un modelo denso de 27.320.698.242 parametros construido sobre la arquitectura hibrida Qwen3.5 y orientado a razonamiento, con capacidad de vision. Lo publica el usuario waseigo y su aportacion principal es doble: traslada el payload NVFP4 original a los super-bloques `block_nvfp4` de ggml de forma bit-exacta (sin recuantizar) y conserva la cabeza MTP nativa, de modo que la decodificacion especulativa funciona directamente en llama.cpp sin injertos.

El modelo combina 64 capas de tronco mas una capa MTP, con 16 capas de atencion completa y 48 de atencion lineal, 24 cabezas de atencion y 4 cabezas KV, `head_dim` de 256 y una ventana de contexto declarada de 262.144 tokens. El repositorio ocupa 22,4 GB e incluye el tronco cuantizado (21,5 GB) y un proyector de vision en BF16 (931 MB) extraido del mismo checkpoint.

Su relevancia practica es que permite ejecutar un modelo de 27B con contexto muy largo y vision en hardware de consumo Blackwell (dos GPU de 16 GB), con velocidades medidas de 210,7 tok/s en prefill y 81,7 tok/s en decodificacion. La licencia es Apache-2.0, lo que facilita su redistribucion y uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida (`general.architecture = qwen35`): 64 capas de tronco + 1 capa MTP, 16 de atencion completa y 48 de atencion lineal, 24 cabezas / 4 KV, `head_dim` 256 |
| Parametros totales | 27.320.698.242 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (en 2x16 GB se valido a 229.376 por limite del pool de memoria) |
| Tipos de cuantizacion | NVFP4 (193 tensores), Q8_0 (208 tensores), BF16 (105 tensores), F32 (746 tensores); KV cache configurable (ejemplo `q8_0` K / `q4_0` V) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de vision GGUF aparte |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 hibrida: un transformer con mezcla de atencion completa (16 capas) y atencion lineal (48 capas), lo que reduce el coste de memoria y computo en contextos largos. La capa MTP adicional actua como cabeza de prediccion multi-token para decodificacion especulativa nativa. El checkpoint original es un modelo de razonamiento entrenado solo con RL segun la model card, aunque no se detalla en la informacion disponible el volumen de tokens, la composicion del dataset ni las etapas concretas de RLHF/DPO.

La innovacion tecnica del empaquetado reside en el mapeo de precision: los tensores que RadixArk almaceno en FP8 se convierten a Q8_0 mediante `--fp8-as-q8` (practicamente sin perdida), el payload NVFP4 se traslada como bytes crudos a `block_nvfp4` con sidecars de escala E4M3 scale-2, y el resto de pesos (embeddings, estado SSM, cabeza MTP) se mantiene en BF16 o F32. En GPU Blackwell, NVFP4 se ejecuta mediante FP4 MMA nativo; en arquitecturas anteriores se recurre a la ruta Q4 MMQ, con menor rendimiento.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de razonamiento activable (`--reasoning on`, `--reasoning-preserve`).
- Comprension de imagenes (pipeline `image-text-to-text`) mediante el proyector de vision incluido; verificado con una PNG de dos colores a 128x128.
- Decodificacion especulativa nativa con la cabeza MTP (hasta n=3 borradores utiles), con aceptacion medida de 0,768.
- Contexto muy largo: hasta 262.144 tokens teoricos, con 229.376 validados en 2x16 GB.
- Soporte de plantillas de chat Jinja (`--jinja`) y batching continuo (`--cont-batching`).
- Capacidad multilingue limitada: solo se declara ingles.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: con 229.376 tokens de contexto validados, el modelo puede ingerir manuales tecnicos, expedientes o bases de codigo completas en una sola pasada sin troceado, manteniendo coherencia entre secciones distantes.
- Asistente de razonamiento con imagenes: la combinacion de tronco y proyector de vision permite responder preguntas sobre capturas, diagramas o graficos, usando `--image-min-tokens 1024` para preservar detalle en imagenes pequenas.
- Despliegue en estaciones de trabajo con dos GPU de 16 GB: el empaquetado NVFP4 cabe en 15.270 MiB por tarjeta, lo que habilita prototipos locales de un modelo de 27B sin infraestructura de centro de datos.
- Servicio de chat de baja latencia: con 81,7 tok/s de decodificacion y decodificacion especulativa MTP, es adecuado para interfaces conversacionales interactivas en un solo flujo (`--parallel 1`).
- Procesamiento por lotes de prefill largo: los 210,7 tok/s en prefill permiten clasificar o resumir lotes de documentos largos de forma secuencial eficiente.
- Investigacion en cuantizacion e inferencia: al ser un empaquetado bit-exacto con censo de tensores y hashes en `PROVENANCE.md`, sirve como referencia reproducible para estudiar el impacto de NVFP4, Q8_0 y BF16 en calidad y velocidad.
- Evaluacion de decodificacion especulativa: la cabeza MTP preservada permite medir tasas de aceptacion y longitud media de borrador en distintos prompts sin modificar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos son de rendimiento de inferencia del propio empaquetado:

| Metrica | Valor | Entorno |
|---|---|---|
| Prefill | 210,7 tok/s (en caliente, prompt de 44 tokens) | 2x16 GB (RTX 5070 Ti + RTX 5060 Ti), build `1.0.0-dev b12602` |
| Decodificacion | 81,7 tok/s | mismo entorno, MTP n=3 |
| Aceptacion de borradores | 0,768 (76/99), longitud media 3,30 | mismo entorno |
| VRAM por tarjeta | 15.270 MiB de 16.303 | mismo entorno |
| Prueba de vision | PNG 128x128 -> `top=red, bottom=blue` | `--image-min-tokens 1024` |

## Requisitos de hardware

- VRAM estimada: 15.270 MiB por tarjeta en una configuracion de 2x16 GB con ranura de 229.376 tokens, KV cache `q8_0`/`q4_0` y offload completo (`-ngl 999`).
- GPU recomendadas: Blackwell (RTX 5070 Ti, RTX 5060 Ti y superiores) para aprovechar FP4 MMA nativo; en arquitecturas anteriores el modelo funciona pero cae a la ruta Q4 MMQ y es mas lento.
- Cabe en GPU de consumo: si, en dos tarjetas de 16 GB; una sola tarjeta de 16 GB no es suficiente para el archivo de 21,5 GB.
- Contexto maximo practico: 229.376 tokens en 2x16 GB; 262.144 requiere un pool de memoria mayor, ya que con `-c 262144` se produce OOM en el pool VMM de flash-attn de llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`) con una build que soporte `qwen35` y NVFP4 con sidecars E4M3 scale-2 (verificado en `b12602`); no se documenta soporte en vLLM, TGI u Ollama en la informacion disponible.
- Parametros de ejecucion clave: `--split-mode tensor`, `--kv-offload`, `-fa on`, `--spec-type draft-mtp --spec-draft-n-max 3`, `-b 2048 -ub 256`.
- Latencia y throughput: 81,7 tok/s de decodificacion y 210,7 tok/s de prefill medidos; no hay datos de latencia por peticion ni de throughput agregado con `--parallel` mayor que 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-NVFP4-MTP-GGUF (este) | 27,3B | 262.144 (229.376 validados en 2x16 GB) | GGUF NVFP4 + Q8_0 + BF16, con MTP | Apache-2.0 | Empaquetado comunitario bit-exacto, vision incluida |
| RadixArk/DaisyRose-27B-NVFP4 | 27,3B | 262.144 | NVFP4 (checkpoint original) | Apache-2.0 | Modelo base del que deriva este GGUF |
| RadixArk/DaisyRose-27B-GGUF | 27,3B | no disponible | GGUF K-quant del release BF16 | Apache-2.0 | Alternativa oficial en K-quant, sin el payload NVFP4 original |
| RadixArk/DaisyRose-27B (BF16) | 27,3B | no disponible | safetensors BF16 | Apache-2.0 | Referencia de maxima precision; no cabe en 2x16 GB |

No se dispone de datos de benchmarks que permitan comparar calidad frente a modelos de otros autores con el mismo tamano o tarea.

## Limitaciones y advertencias

- El contexto real en 2x16 GB es de 224k tokens, no 256k; el OOM a 262.144 es un limite del pool de memoria de llama.cpp, no del archivo.
- Las proyecciones de atencion y atencion lineal estan en Q8_0, heredado de la decision de RadixArk de almacenarlas en FP8; no es una eleccion nueva del empaquetador.
- `token_embd` permanece en BF16 (2,54 GB) porque el checkpoint original no lo cuantizo; convertirlo a Q8_0 liberaria unos 1,2 GB pero requiere una re-conversion.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Requiere una build de llama.cpp que conozca la arquitectura `qwen35` y NVFP4 con sidecars E4M3 scale-2; versiones anteriores no cargaran el modelo.
- En GPU no Blackwell el rendimiento cae de forma notable al usar la ruta Q4 MMQ en lugar de FP4 MMA.
- Es un empaquetado no oficial: RadixArk no lo produjo ni lo reviso, por lo que la responsabilidad de validacion recae en el usuario.
- La licencia Apache-2.0 permite uso comercial y redistribucion con atribucion; conviene conservar el aviso de licencia y la atribucion a RadixArk.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/waseigo/DaisyRose-27B-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Licencia del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4/blob/main/LICENSE
- Procedencia y verificacion del empaquetado: https://huggingface.co/waseigo/DaisyRose-27B-NVFP4-MTP-GGUF/blob/main/PROVENANCE.md
- Release oficial en GGUF (K-quant): https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
