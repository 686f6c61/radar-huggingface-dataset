# WinsonLi/whisper-large-v3-cantonese-mlx-2bit

## Resumen

WinsonLi/whisper-large-v3-cantonese-mlx-2bit es una cuantizacion experimental de 2 bits del modelo Whisper large-v3 ajustado para cantonés (yue), desarrollada por WinsonLi a partir del checkpoint de khleeloo (Rita Frieske). El modelo parte de los pesos completos de Whisper large-v3 (32 capas de encoder y 32 de decoder) afinados sobre Common Voice 17 Yue y los convierte a formato MLX con cuantizacion afin de 2 bits y grupo de 64.

El resultado es un experimento fallido documentado de forma explicita: en las 23 grabaciones de un benchmark privado el modelo emitio unicamente puntuacion o espacios en blanco, con un CER normalizado del 100%. El autor lo publica como resultado negativo, no como sustituto del modelo de 4 bits, y lo etiqueta como no apto para produccion. La relevancia es metodologica: demuestra que la cuantizacion a 2 bits destruye la capacidad de transcripcion en este modelo, pese a reducir el archivo de pesos un 43,7% frente a la variante de 4 bits.

La ficha describe un artefacto de investigacion util para quien estudie limites de cuantizacion en modelos ASR, no una herramienta de dictado ni de transcripcion real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), 32 capas de encoder y 32 de decoder |
| Parametros totales | no disponible (arquitectura Whisper large-v3; pesos cuantizados a 2 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper large-v3, 30 s por segmento; ventana de decodificacion de 224 muestras en la evaluacion) |
| Tipos de cuantizacion | Afin de 2 bits, group size 64 (g64); existe un diagnostico g32 tambien fallido |
| Idiomas soportados | yue (cantonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (pesos cuantizados empaquetados); repo de 0,5 GB |
| Tamano del archivo de pesos | 494.096.295 bytes (2-bit g64) |
| Modelo base | khleeloo/whisper-large-v3-cantonese (revision f48a890f78c7b6acf723f25d8c81e232ac7469ca) |
| Libreria | mlx |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3, un transformer encoder-decoder con 32 capas en cada bloque, especializado en reconocimiento automatico del habla. El checkpoint base fue afinado por khleeloo / Rita Frieske desde OpenAI Whisper large-v3 sobre Common Voice 17 Yue, con licencia Apache-2.0. Este repositorio no reentrena el modelo: solo convierte los pesos originales en FP32 a FP16 y los cuantiza de forma afin a 2 bits con grupo de 64 mediante un script derivado de Apple mlx-examples (commit 796f5b53cab69a3d48a44233ce21aae889e94a08), con comprobaciones estrictas de claves y formas y proteccion contra sobrescritura de salida.

El proceso de conversion esta documentado con hashes SHA256 de los shards originales y del archivo de pesos resultante, y se verifico que el mismo script reproduce los pesos de 4 bits byte a byte. La integridad del pipeline de conversion es correcta; el fallo es de calidad del modelo cuantizado, no de la conversion. No se realizo ningun ajuste fino posterior, RLHF ni DPO. La innovacion tecnica del artefacto es precisamente la documentacion rigurosa de un resultado negativo: se incluyen config, provenance.json y el convertidor para reproducir el experimento.

## Capacidades

- Generacion de transcripciones de audio en cantonés (yue) en teoria, segun la arquitectura heredada de Whisper large-v3.
- En la practica, el modelo no transcribe: en el benchmark privado emitio solo puntuacion o espacios en blanco, con CER normalizado del 100%.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de Whisper).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a yue en este checkpoint; el prompt de evaluacion mezclaba cantonés e ingles tecnico, pero el modelo no produjo salida util.
- Capacidades especiales: ninguna operativa; el modelo carga y completa inferencia, pero la salida carece de contenido.

## Casos de uso

- Estudio de limites de cuantizacion en ASR: sirve como evidencia empirica de que la cuantizacion afin de 2 bits con group64 inutiliza Whisper large-v3 para transcripcion, con CER del 100% frente al 14,92% normalizado del modelo de 4 bits.
- Reproduccion de experimentos de cuantizacion: el repositorio incluye convert.py, provenance.json y hashes para replicar la conversion desde el checkpoint original fijado a una revision concreta.
- Comparacion de estrategias de cuantizacion: permite contrastar 4 bits g64 (877,696 MB, CER normalizado 14,92%), 3 bits g64 (685,896 MB, CER 24,50%), 2 bits g64 (494,096 MB, CER 100%) y 2 bits g32 (589,996 MB, CER 222,27%).
- Docencia sobre evaluacion de modelos: ejemplo de model card que documenta un resultado negativo con metodologia, mediciones de memoria y tiempos de decodificacion en lugar de ocultarlo.
- Analisis de consumo de memoria en MLX: las mediciones de MLX peak MiB (1306,5 para 2 bits frente a 1672,3 para 4 bits) y RSS permiten estudiar el ahorro real de memoria en Apple Silicon.
- Auditoria de pipelines de conversion: los hashes y la verificacion byte a byte del modelo de 4 bits sirven para validar herramientas de conversion de Safetensors a MLX.

## Benchmarks y rendimiento

Mediciones locales del autor (2026-11-12) sobre 23 grabaciones privadas de un unico hablante cantonés, con referencias basadas en los prompts previos a la grabacion:

| Variante | Peso MB | CER bruto | CER normalizado | Mediana decodificacion (s) | RTF | MLX peak MiB | RSS peak MiB |
|---|---:|---:|---:|---:|---:|---:|---:|
| 4-bit g64 | 877,696 | 29,04% | 14,92% | 0,661 | 0,0712 | 1672,3 | 1098,0 |
| 3-bit g64 | 685,896 | 40,82% | 24,50% | 0,701 | 0,0771 | 1492,4 | 918,3 |
| 2-bit g64 | 494,096 | 100,00% | 100,00% | 2,396 | 0,2580 | 1306,5 | 734,1 |
| 2-bit g32 | 589,996 | 225,88% | 222,27% | 2,417 | 0,2598 | 1394,5 | 821,1 |

No se han publicado resultados de benchmarks publicos (Common Voice, MMLU, HumanEval u otros) en la informacion disponible. El autor indica explicitamente que no reclama ningun resultado de benchmark publico y que las grabaciones, referencias y transcripciones privadas no se distribuyen, por lo que las cifras de CER no son reproducibles de forma independiente solo con este repositorio.

## Requisitos de hardware

- VRAM/peso en disco: el archivo de pesos ocupa 494.096.295 bytes (unos 494 MB); el repo completo son 0,5 GB.
- Memoria en ejecucion: MLX peak de 1306,5 MiB y RSS peak de 734,1 MiB en las mediciones del autor, con cache MLX limitada a 64 MiB.
- GPU recomendadas: el modelo esta en formato MLX, orientado a Apple Silicon (M1/M2/M3/M4). No hay informacion sobre ejecucion en GPU NVIDIA.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada; no hay datos de despliegue en RTX 4090 u otras GPU consumer NVIDIA.
- Opciones de despliegue: runtime MLX (libreria mlx); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: mediana de decodificacion de 2,396 s y RTF de 0,2580 con la variante de 2 bits g64, mas lenta que la de 4 bits (0,661 s, RTF 0,0712) pese a ocupar menos memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER normalizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WinsonLi/whisper-large-v3-cantonese-mlx-2bit | Whisper large-v3 cuantizado a 2 bits | no disponible | 100,00% | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| WinsonLi/whisper-large-v3-cantonese-mlx-4bit | Whisper large-v3 cuantizado a 4 bits | no disponible | 14,92% | Apache-2.0 | Hugging Face |
| khleeloo/whisper-large-v3-cantonese | Whisper large-v3 afinado | no disponible | no disponible (referencia base) | Apache-2.0 | Hugging Face |
| OpenAI Whisper large-v3 | Whisper large-v3 | no disponible | no disponible para yue | MIT (modelo original) | Hugging Face / OpenAI |

La comparativa se limita a variantes del mismo linaje, ya que no se dispone de datos de benchmarks de alternativas ASR para cantonés en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no transcribe: emitio solo puntuacion o espacios en blanco en las 23 grabaciones del benchmark, con CER normalizado del 100%. No debe usarse para dictado ni para produccion.
- El autor lo etiqueta explicitamente como "experimental", "negative-result" y "not-for-production".
- El benchmark es privado y de un unico hablante: 23 tomas, 20 prompts distintos, con repeticiones, discrepancias entre numeros y palabras habladas y una grabacion historicamente truncada. No es una estimacion poblacional ni un test de Common Voice.
- Las cifras de CER no son reproducibles de forma independiente: no se distribuyen audio, referencias, transcripciones, diccionarios personales ni pasajes fuente.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que la salida esta vacia o contiene solo puntuacion; el fallo es de omision total, no de invencion.
- Sesgos conocidos: no documentados; el entrenamiento base procede de Common Voice 17 Yue.
- Limitaciones de idioma: solo cantonés (yue); el prompt de evaluacion mezclaba cantonés e ingles tecnico sin resultado util.
- Licencia Apache-2.0 permite uso comercial segun los terminos de la licencia, pero el modelo es funcionalmente inutil para cualquier tarea de transcripcion.
- La variante de 3 bits g64 es funcional pero sensible al prompt; el autor no la sustituye silenciosamente por la de 2 bits.
- El diagnostico de 2 bits g32 tambien fallo, con CER normalizado del 222,27%.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WinsonLi/whisper-large-v3-cantonese-mlx-2bit
- Modelo base: https://huggingface.co/khleeloo/whisper-large-v3-cantonese
- Variante de 4 bits: https://huggingface.co/WinsonLi/whisper-large-v3-cantonese-mlx-4bit
- Repositorio mlx-examples de Apple (commit referenciado): https://github.com/ml-explore/mlx-examples/commit/796f5b53cab69a3d48a44233ce21aae889e94a08
- Common Voice 17 (dataset de ajuste del modelo base): no disponible como enlace directo en la informacion proporcionada
