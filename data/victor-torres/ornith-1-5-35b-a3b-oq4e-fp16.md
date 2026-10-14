# victor-torres/Ornith-1.5-35B-A3B-oQ4e-fp16

## Resumen

Ornith-1.5-35B-A3B-oQ4e-fp16 es una versión cuantizada del modelo multimodal ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario victor-torres. Se trata de un transformer de tipo mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token (según la nomenclatura A3B del nombre), que incorpora capacidad de visión y una cabeza de predicción multi-token (MTP). El modelo original lo desarrolla ornith-ai; esta ficha corresponde a la conversión a 4 bits realizada con la herramienta oQ de oMLX.

La relevancia de esta publicación reside en que empaqueta un MoE multimodal de ~36B en 21 GB de pesos mediante una cuantización mixta denominada oQ4e, orientada a ejecutarse en Apple Silicon a través de MLX. El uso de escalas en fp16 en lugar de bf16 responde a que las GPU M1 y M2 no tienen soporte nativo de bf16, de modo que el checkpoint está pensado para equipos con memoria unificada de 32 GB. La licencia es MIT, igual que la del modelo base, lo que facilita su uso comercial.

El autor advierte de que el modelo solo ha sido probado con oMLX, que la cabeza MTP se deja desactivada porque en M2 ralentizaba la decodificación MoE, y que en M3 o posteriores, con bf16 nativo, la ganancia frente a una build en bf16 es escasa o nula. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni la longitud de contexto oficial del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (`qwen3_5_moe` con visión), atención completa y proyecciones de atención lineal, más cabeza MTP |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | ~3B (según la nomenclatura A3B del nombre; no se detalla en la model card) |
| Longitud de contexto | no disponible (la model card prueba prompts de 1k, 19k, 35k y 68k tokens, pero no declara el máximo oficial) |
| Tipos de cuantizacion | oQ4e (mixta, basada en imatrix): expertos enrutados a 4 bits; expertos compartidos, `embed_tokens` y `lm_head` a 8 bits; proyecciones de atención y atención lineal a 5-8 bits; grupo de 64, affine; escalas en fp16 |
| Idiomas soportados | no disponible (el set de calibración `oqe_code_multilingual` es multilingüe y de código, pero no se declara una lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint MLX estándar, dtype float16) |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo base; toda la información disponible se refiere al proceso de cuantización. El checkpoint sigue la arquitectura `qwen3_5_moe` con visión, es decir, una mezcla de expertos con expertos enrutados y expertos compartidos, combinada con proyecciones de atención lineal además de la atención completa, y con una cabeza MTP de 42 tensores. La ventana multimodal se conserva: el autor indica que las capas de visión deben mantenerse, porque el kernel rápido de decodificación MoE de oMLX solo se activa en la ruta visión-lenguaje.

La cuantización se realizó con oQ (oQ4e, precisión mixta basada en imatrix) dentro de oMLX 0.7.1.dev1 y MLX 0.32.3, partiendo de los pesos en bf16. El conjunto de calibración fue `oqe_code_multilingual`, con 128 muestras de 512 tokens. Como el modelo en bf16 no cabe en 32 GB, el autor usó como proxy de sensibilidad una conversión uniforme a 4 bits mapeada desde disco en lugar de cargada en RAM, lo que permitió emplear un proxy de 4 bits en una máquina de 32 GB en vez de recurrir a 3 bits. Se incluye el archivo `oq_imatrix_report.json` con 523 entradas (sin expertos con conteo cero). Las escalas se guardan en fp16 en lugar de bf16 por la ausencia de bf16 nativo en M1/M2. La plantilla de chat es la misma que la del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con los pesos de visión preservados.
- Razonamiento con modo "thinking" (el autor menciona la opción de thinking on/off en sus pruebas de velocidad).
- Predicción multi-token mediante cabeza MTP incluida en el checkpoint (aunque desaconsejada en M2 por pérdida de velocidad).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el set de calibración empleado es multilingüe y de código, pero no se documenta el alcance real de idiomas del modelo.
- Otras capacidades especiales (audio, etc.): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint ocupa 21 GB y está diseñado para equipos con memoria unificada de 32 GB, de modo que permite ejecutar un MoE multimodal de ~36B en un portátil o sobremesa Mac sin GPU dedicada.
- Asistentes conversacionales de escritorio: al ser un modelo `conversational` con visión, puede gestionar diálogos multi-turno combinando capturas de pantalla o imágenes con texto en aplicaciones locales.
- Análisis de documentos con imágenes incrustadas: la ruta visión-lenguaje permite extraer y razonar sobre diagramas, gráficos o capturas junto al texto asociado, sin enviar los datos a un servicio externo.
- Prototipado e investigación en cuantización: al incluir el informe `oq_imatrix_report.json` (523 entradas) y detallar la receta (grupo 64, affine, escalas fp16, calibración de 128 muestras × 512 tokens), sirve como referencia reproducible para estudiar precisión mixta en MoE.
- Evaluación comparativa de esquemas de cuantización en Mac: el autor aporta cifras de prefill y decode frente a una conversión uniforme de 4 bits, lo que permite medir el coste de mantener `lm_head` y expertos compartidos en 8 bits.
- Desarrollo de aplicaciones con prompts largos: con 68k tokens de prompt alcanza 342 tok/s de prefill y 42 tok/s de decode en M2 Max, suficiente para resúmenes o preguntas sobre contextos extensos en local.
- Despliegue en pipelines que requieran licencia permisiva: al ser MIT, igual que el modelo base, se puede integrar en productos comerciales sin las restricciones de otras licencias de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí proporciona mediciones de velocidad en M2 Max, 32 GB, oMLX 0.7.1.dev1, con TurboQuant desactivado, prefill ANE desactivado, MTP desactivado, thinking desactivado, petición única y kernel fusionado de expertos enrutados activo, generando 200 tokens:

| Prompt (tokens) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| 1k | 992 | 89 |
| 19k | 681 | 68 |
| 35k | 471 | 57 |
| 68k | 342 | 42 |

Comparativa con una conversión uniforme a 4 bits en fp16 del mismo modelo (solo decode): 109 / 75 / 63 / 44 tok/s para 1k / 19k / 35k / 68k respectivamente. La diferencia se atribuye a los expertos compartidos y al `lm_head` en 8 bits, que se leen en cada token. Notas del autor: las cifras se midieron con los pesos mapeados desde disco mediante un cargador experimental; con el cargador estándar el modelo queda residente (~21 GB) y la velocidad de decode debería ser similar. En M2, el prefill por ANE penalizó entre un 14 % y un 26 %, y TurboQuant KV costó entre un 10 % y un 19 % de decode. En M3 y posteriores se espera poca o ninguna ganancia frente a bf16.

## Requisitos de hardware

- Memoria: el checkpoint cuantizado ocupa 21 GB (22,5 GB de repositorio). Se probó en un equipo con 32 GB de memoria unificada; el modelo residente completo necesita ~21 GB, por lo que no cabe en configuraciones de 16 GB.
- Plataforma: Apple Silicon con MLX. El autor solo lo ha probado con oMLX; indica que otros runtimes MLX compatibles con `qwen3_5_moe` con visión deberían cargarlo, pero no está verificado.
- GPU dedicadas (A100, H100, RTX 4090, etc.): no disponible. El checkpoint está en formato MLX y no se documenta conversión a CUDA.
- Opciones de despliegue: oMLX (probado, colocando la carpeta en `~/.omlx/models/` y cargando `Ornith-1.5-35B-A3B-oQ4e-fp16`); otros runtimes MLX, sin garantía. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en M2 Max, 32 GB, con la configuración indicada, entre 992 y 342 tok/s de prefill y entre 89 y 42 tok/s de decode para prompts de 1k a 68k tokens (ver tabla anterior).
- Advertencia de rendimiento: mantener las capas de visión es necesario para que se active el kernel rápido de decodificación MoE de oMLX.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Parametros | Decode 1k | Decode 68k | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ4e-fp16 | MLX, oQ4e mixta, fp16 | 21 GB | 35.951.822.704 | 89 tok/s | 42 tok/s | MIT |
| Ornith-1.5-35B-A3B, conversion uniforme 4 bits fp16 | MLX, 4 bits uniforme | no disponible | 35.951.822.704 (base) | 109 tok/s | 44 tok/s | MIT |
| ornith-ai/Ornith-1.5-35B-A3B (base) | safetensors bf16 | no disponible (no cabe en 32 GB) | 35.951.822.704 | no disponible | no disponible | MIT |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados; las cifras de la conversión uniforme a 4 bits proceden de las propias mediciones del autor en M2 Max y las mismas condiciones.

## Limitaciones y advertencias

- No hay datos publicados de calidad (MMLU, HumanEval, GSM8K) ni de sesgos; el rendimiento real en tareas cognitivas no puede evaluarse con la información disponible.
- Riesgo de alucinación: no documentado por el autor, pero es un caveat general de los modelos generativos; conviene validar las salidas en producción.
- Solo se ha probado con oMLX. El soporte en otros runtimes MLX no está verificado, y no se documenta compatibilidad con vLLM, llama.cpp u Ollama.
- La cabeza MTP se incluye pero el autor recomienda desactivarla en M2 porque ralentiza la decodificación MoE en sus pruebas.
- El modelo en bf16 no cabe en 32 GB, y el proxy de sensibilidad usado para la cuantización fue una conversión uniforme a 4 bits, lo que puede introducir desviaciones en la selección de precisión mixta.
- La pérdida de velocidad frente a la conversión uniforme de 4 bits (89 vs 109 tok/s a 1k) se debe a mantener expertos compartidos y `lm_head` en 8 bits, que se leen en cada token.
- En M3 y posteriores, con bf16 nativo, la ventaja de este checkpoint fp16 es escasa o nula.
- La longitud de contexto máxima oficial no está declarada, aunque se hayan medido prompts de hasta 68k tokens.
- Requiere memoria unificada de 32 GB para el modelo residente; en configuraciones menores hay que recurrir a mapeo desde disco.
- Licencia MIT, igual que el modelo base, sin restricciones comerciales documentadas más allá de las habituales de atribución.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/victor-torres/Ornith-1.5-35B-A3B-oQ4e-fp16
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Herramienta oQ (oMLX): https://github.com/jundot/omlx

Nota: la búsqueda web no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a entidades no relacionadas (una marca de bádminton, el nombre propio Victor y contenidos de prensa), por lo que se han descartado.
