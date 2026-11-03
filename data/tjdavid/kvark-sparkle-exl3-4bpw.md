# tjdavid/kvark-sparkle-exl3-4bpw

## Resumen
KVARK Sparkle 1.0 es un ajuste fino (finetune) del modelo Qwen3.8-27B, desarrollado por el usuario tjdavid, orientado a reducir la longitud de las cadenas de razonamiento sin sacrificar precision. El modelo mantiene intacta la arquitectura del original, pero ha sido entrenado para producir respuestas con aproximadamente la mitad de tokens de razonamiento, lo que se traduce en una latencia menor en tareas de razonamiento complejo. El repositorio publicado es una cuantizacion EXL3 de 4 bits por peso, lo que reduce el peso del modelo a 16,5 GB frente a los 52 GB de la version BF16.

La propuesta de valor es el "razonamiento eficiente": en lugar de competir por mayor precision bruta, el modelo busca igualar al Qwen3.8-27B original en benchmarks como GPQA Diamond, AIME o MMLU-Pro empleando entre un 40% y un 65% menos de tokens de pensamiento. Esto es relevante para despliegues en produccion donde el coste por token y la latencia son factores criticos, especialmente en entornos con ventanas de contexto largas o en aplicaciones interactivas.

El modelo conserva las capacidades multimodales del original (pipeline image-text-to-text), la ventana de contexto nativa de 262.144 tokens y el cabezal MTP (multi-token prediction) para decodificacion especulativa. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.8-27B (48 capas de atencion lineal, 16 de atencion completa) |
| Parametros totales | 8.254.592.384 (pesos safetensors del repo EXL3 4-bit); 27,8B en BF16 segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; evaluado hasta 64k |
| Tipos de cuantizacion | EXL3 4 bits por peso (este repo); FP8 y GGUF Q8_0 a IQ4_XS en repos hermanos |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3 4-bit); GGUF y FP8 en repos alternativos |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.8-27B sin modificar la arquitectura: 64 capas en total, de las cuales 48 usan atencion lineal y 16 atencion completa con 24 cabezas de consulta, 4 cabezas clave-valor y dimension de cabeza 256. El tamano oculto es 5.120 y el vocabulario de 248.320 tokens. La cache KV solo se almacena en las 16 capas de atencion completa, con un coste de 64 KiB por token en BF16 y 32 KiB en FP8. Incluye un codificador de vision de 27 capas y una capa MTP heredada del modelo base para decodificacion especulativa.

El ajuste fino se realizo sobre los datasets DeepMath-103K, IF_multi_constraints_upto5, SuperGPQA y LiveCodeBench code_generation_lite, segun los tags del repositorio. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal declarada es la reduccion de tokens de razonamiento manteniendo la precision, lo que sugiere un entrenamiento orientado a comprimir cadenas de pensamiento.

## Capacidades
- Generacion de texto y razonamiento multi-paso con modo "thinking" activable.
- Razonamiento matematico y cientifico de nivel competitivo (AIME, GPQA).
- Generacion de codigo con evaluacion en LiveCodeBench.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text, codificador de vision de 27 capas).
- Seguimiento de instrucciones estrictas (IFEval).
- Razonamiento eficiente: produce cadenas de pensamiento mas cortas que el modelo base.
- Decodificacion especulativa mediante cabezal MTP.
- Soporte de contexto largo de hasta 262.144 tokens nativos.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso
- Razonamiento cientifico asistido: el modelo puede resolver preguntas de nivel doctorado en fisica, quimica y biologia con un 89,3% de precision en GPQA Diamond, adecuado para herramientas de investigacion que necesitan respuestas fundamentadas con menor latencia.
- Generacion de codigo en produccion: con un pass@1 de 82,7 en LiveCodeBench, puede integrarse en pipelines de CI/CD para generar tests, parchear funciones o revisar pull requests, aprovechando la reduccion de tokens de razonamiento para acelerar la respuesta.
- Tutoria matematica interactiva: su 93,3% en AIME y su capacidad de razonamiento multi-paso lo hacen util para plataformas educativas que necesitan explicaciones paso a paso sin tiempos de espera excesivos.
- Agentes autonomos con contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos de conversacion o documentacion completa en memoria, util para agentes que operan sobre repositorios o bases documentales.
- Analisis de documentos con imagenes: gracias al codificador de vision, puede procesar capturas, diagramas o formularios combinados con texto para tareas de extraccion y resumen.
- Despliegue en hardware limitado: la cuantizacion EXL3 4-bit reduce el modelo a 16,5 GB, lo que permite ejecutarlo en GPUs de consumo alto o en servidores con VRAM moderada, habilitando prototipos y demos locales.
- Evaluacion de instrucciones complejas: su 91,3% en IFEval lo hace adecuado para sistemas que requieren cumplimiento estricto de formatos y restricciones en la salida.

## Benchmarks y rendimiento

| Benchmark | Sparkle 1.0 | Qwen3.8-27B | Diferencia | Tokens de razonamiento (Sparkle / Qwen) |
|---|---|---|---|---|
| GPQA Diamond (accuracy, 5 seeds, thinking on, FP8) | 89,3 | 89,4 | −0,1 | 3.122 / 7.854 |
| AIME 2025-2026 (accuracy, 60 problemas × 5 seeds) | 93,3 | 94,0 | −0,7 | 5.502 / 14.318 |
| LiveCodeBench (pass@1, subconjunto reciente de 50 problemas, 3 seeds) | 82,7 | 77,3 | +5,4 | 6.664 / 19.950 |
| IFEval (prompt-level strict accuracy) | 91,3 | 92,4 | −1,1 | 470 / 714 |
| MMLU-Pro (accuracy, subconjunto de 980 items) | 83,3 | 84,0 | −0,7 | 429 / 727 |

Los datos proceden del model-index declarado por el autor. Las diferencias de precision son en su mayoria inferiores a 1 punto porcentual, mientras que la reduccion de tokens de razonamiento oscila entre el 34% (IFEval) y el 67% (LiveCodeBench). El autor reporta un tiempo medio de respuesta de 13,7 s frente a 28,1 s del modelo base.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 16,5 GB para los pesos EXL3 4-bit, mas overhead de cache KV (32 KiB por token en FP8, 64 KiB en BF16) y activaciones.
- GPU recomendadas: A100 40GB, H100, L40S para despliegues de produccion con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia local con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o GPUs con 24 GB o mas, siempre que se limite la longitud de contexto para no agotar la VRAM con la cache KV.
- Opciones de despliegue: llama.cpp para la version GGUF, vLLM para la version FP8, y el ecosistema EXL3 (exllamav2/exllamav3) para este repositorio. El demo oficial usa llama.cpp con cuantizacion Q4_K_M.
- Latencia y throughput: el autor reporta un tiempo medio de respuesta de 13,7 s frente a 28,1 s del modelo base en las mismas condiciones (FP8, thinking on, limite de 64k tokens). No se proporcionan cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | LiveCodeBench | Licencia |
|---|---|---|---|---|---|
| KVARK Sparkle 1.0 | 27,8B (BF16) | 262.144 | 89,3 | 82,7 | Apache 2.0 |
| Qwen3.8-27B (base) | 27,8B | 262.144 | 89,4 | 77,3 | Apache 2.0 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con su modelo base, Qwen3.8-27B, sobre el que se aplica el ajuste. No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias
- El modelo solo declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Los benchmarks declarados por el autor no estan verificados de forma independiente (campo "verified: false" en el model-index).
- El repositorio es una cuantizacion EXL3 4-bit, lo que puede introducir degradacion adicional respecto a los pesos BF16 originales; no se proporcionan metricas de esa perdida.
- Riesgo de alucinacion inherente a los modelos de razonamiento, especialmente en dominios cientificos y de codigo donde las respuestas pueden parecer plausibles sin ser correctas.
- La ventana de contexto evaluada es de 64k tokens, aunque la nativa sea de 262.144; el rendimiento mas alla de 64k no esta documentado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.8-27B por si imponen restricciones adicionales.
- El uso de decodificacion especulativa con el cabezal MTP requiere soporte del runtime; no todos los motores de inferencia lo aprovechan.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/tjdavid/kvark-sparkle-exl3-4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version FP8 para vLLM: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B-FP8
- Version GGUF para llama.cpp: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B-GGUF
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Egzakta/KVARK-Sparkle-Demo
- Dataset DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- Dataset IF_multi_constraints_upto5: https://huggingface.co/datasets/allenai/IF_multi_constraints_upto5
- Dataset SuperGPQA: https://huggingface.co/datasets/m-a-p/SuperGPQA
- Dataset LiveCodeBench: https://huggingface.co/datasets/livecodebench/code_generation_lite
