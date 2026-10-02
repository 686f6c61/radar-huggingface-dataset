# Szymon-Wachelko/GPT-neo-Custom-14B-GGUF

## Resumen

GPT-neo-Custom 14B-DUS es un modelo de generacion de texto conversacional publicado por el usuario Szymon-Wachelko, distribuido exclusivamente en formato GGUF. Se construye a partir de GPT-neo-Custom 7B mediante la tecnica Depth Up-Scaling (DUS), que duplica la profundidad de la red hasta 56 capas, alcanzando 14.141.234.688 parametros reales segun los pesos registrados en el repositorio (el autor indica aproximadamente 14.700 millones en la model card). El objetivo declarado es cubrir el hueco de modelos de calidad en polaco sin perder capacidades de razonamiento tecnico y generacion de codigo.

El modelo se presenta como un asistente bilingue polaco-ingles, con enfasis en fluidez gramatical en polaco (declinaciones, estructuras complejas) y en tareas de ingenieria de software y matematicas. Sobre la base ampliada se aplico un proceso de ajuste fino QLoRA en varias etapas, repartido en siete dominios de conocimiento especializados. La ficha del repositorio esta enteramente en ingles y utiliza el gancho comercial de "chatgpt" en las etiquetas.

A pesar del nombre, el modelo incluye la etiqueta `qwen2` en sus tags, lo que sugiere que la arquitectura subyacente podria derivar de la familia Qwen2 y no de GPT-Neo, si bien la model card no detalla la arquitectura interna. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks. La licencia es Apache 2.0 y la fecha de creacion registrada es el 2 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Depth Up-Scaling (DUS), 56 capas; la model card no especifica la arquitectura base (el tag `qwen2` apunta a Qwen2, el nombre apunta a GPT-Neo) |
| Parametros totales | 14.141.234.688 (segun safetensors); la model card indica ~14,7B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card emplean `n_ctx=4096` y `-c 4096`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M |
| Idiomas soportados | ingles (en) y polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exclusivamente; no se publican safetensors) |

## Arquitectura y entrenamiento

La model card describe el modelo como resultado de aplicar Depth Up-Scaling sobre GPT-neo-Custom 7B, una tecnica que replica el bloque de capas del modelo original y ajusta la profundidad resultante. El resultado declarado son 56 capas y aproximadamente 14,7B de parametros, aunque la cuenta real de parametros del repositorio es de 14.141.234.688. La tecnica DUS es la misma familia de enfoques empleada por modelos como SOLAR-10.7B, y suele requerir una fase de ajuste posterior para reparar la coherencia entre las capas duplicadas.

Sobre esa base expandida se aplico un proceso de ajuste fino QLoRA en varias etapas orientado a siete dominios de conocimiento especializados, con el objetivo declarado de equilibrar la coherencia conversacional y el razonamiento zero-shot. La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o PPO. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni mecanismos de atencion alternativos.

Un punto relevante es la ambiguedad arquitectonica: el nombre del modelo sugiere una base GPT-Neo, pero la etiqueta `qwen2` de HuggingFace apunta a una base Qwen2. La model card no resuelve esta discrepancia, lo que dificulta reproducir el entrenamiento o anticipar el comportamiento del tokenizador.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y polaco.
- Fluidez en polaco: gramatica, declinaciones y estructuras oracionales complejas, segun el autor.
- Generacion, depuracion y explicacion de codigo en Python, C++, JavaScript, TypeScript, SQL, Rust y shell scripting.
- Razonamiento matematico con cadenas de pensamiento (chain-of-thought) y acertijos logicos.
- Redaccion de documentacion tecnica.
- Instrucciones de despliegue y uso en Ollama, llama.cpp, LM Studio y Python (`llama-cpp-python`).
- Soporte de `tool calling` / `function calling`: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso autonomo: no documentado.
- Capacidades de vision, audio o modo "thinking" explicito: no documentadas.

## Casos de uso

- Atencion al cliente en polaco: el modelo esta ajustado especificamente para gramatica y matices del polaco, lo que lo hace adecuado para respuestas a clientes en ese idioma sin artefactos de traduccion. Requiere fijar un contexto de 4096 tokens o superior si el backend lo permite.
- Asistente de codigo en local para equipos con GPU de gama alta: con la cuantizacion Q6_K o Q8_0 cabe en una RTX 3090 o 4090 y permite generar y explicar codigo en Python, Rust o TypeScript sin enviar datos a la nube.
- Despliegue en portatiles de desarrollo: con la cuantizacion Q4_K_M (8,01 GB) el modelo es ejecutable en equipos con 10-12 GB de VRAM, lo que facilita prototipos y demos offline.
- Generacion de documentacion tecnica bilingue: redaccion de manuales o comentarios de API en ingles y polaco dentro de un mismo pipeline, aprovechando la naturaleza bilingue del modelo.
- Tutoria y ejercicios de matematicas: el autor declara buen rendimiento en razonamiento matematico encadenado, util para generar explicaciones paso a paso en entornos educativos.
- Chat de escritorio privado: mediante Ollama o LM Studio se puede ofrecer un asistente conversacional totalmente offline, sin telemetria, adecuado para entornos con requisitos de confidencialidad.
- Investigacion sobre tecnicas DUS: al ser un modelo derivado por Depth Up-Scaling y con licencia Apache 2.0, sirve como caso de estudio reproducible para analizar el impacto de duplicar capas en un transformer de ~14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con modelos de referencia. Las afirmaciones de rendimiento son cualitativas y no verificables con los datos aportados.

## Requisitos de hardware

- VRAM estimada por cuantizacion (según la matriz publicada por el autor):
  - F16 (~28,5 GB): 32 GB o mas.
  - Q8_0 (~15,2 GB): 18-20 GB.
  - Q6_K (~12,2 GB): 14-16 GB.
  - Q5_K_M (~10,5 GB): 12-14 GB.
  - Q5_K_S (~9,9 GB): 12 GB.
  - Q4_K_M (~8,01 GB): 10-12 GB (version recomendada por el autor).
  - Q4_K_S (~7,5 GB): 10 GB.
  - Q3_K_L (~6,9 GB): 8-10 GB.
  - Q3_K_M (~6,2 GB): 8 GB.
- GPU recomendadas: el autor menciona explicitamente RTX 3090 y RTX 4090 para las cuantizaciones de 6 bits y superiores. Para F16 sugiere equipos de gama "estudio" con 32 GB o mas de VRAM.
- Cabe en GPU de consumo: si. Con Q4_K_M (8,01 GB) cabe en tarjetas de 10-12 GB; con Q3_K_M (6,2 GB) en tarjetas de 8 GB.
- Opciones de despliegue documentadas: Ollama (`ollama run hf.co/Szymon-Wachelko/GPT-neo-Custom-14B-GGUF`), llama.cpp (`llama-cli`, `llama-server`), LM Studio, Jan AI y `llama-cpp-python`. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada (ni cifras de rendimiento propias ni de terceros). La unica referencia documentada es el modelo base, que se recoge a continuacion con los datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| GPT-neo-Custom 14B-DUS | 14.141.234.688 | no disponible | Apache 2.0 | GGUF | no publicado |
| GPT-neo-Custom 7B (base) | no disponible | no disponible | no disponible | GGUF | no publicado |

Alternativas de la misma categoria (por ejemplo, SOLAR-10.7B, que tambien emplea Depth Up-Scaling, o modelos abiertos bilingues polaco-ingles de ~14B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa que respalde las afirmaciones de calidad del autor.
- Ambiguedad arquitectonica: el nombre del modelo apunta a GPT-Neo, la etiqueta `qwen2` apunta a Qwen2. Esto complica la reproducibilidad y puede afectar a la compatibilidad del tokenizador con plantillas de chat.
- Metodologia de entrenamiento incompleta: no se documentan tokens de entrenamiento, composicion del dataset, ni si hubo alineacion con RLHF o DPO.
- Riesgo de alucinacion: inherente a un modelo de ~14B sin alineacion documentada, especialmente en tareas factuales y en dominios fuera de los siete "dominios especializados" mencionados sin detalle.
- Cobertura idiomatica limitada a ingles y polaco; no hay soporte declarado para castellano ni para otros idiomas.
- Contexto reducido en la practica: los ejemplos del autor usan 4096 tokens, un valor bajo para tareas de contexto largo o analisis de documentos extensos.
- Sin validacion por parte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentacion externa sobre su comportamiento real.
- Trazabilidad dudosa: el nombre "GPT-neo-Custom" no se corresponde con ninguna familia de modelos ampliamente conocida con ese identificador, y la model card esta redactada con un tono comercial que no aporta detalles tecnicos verificables.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyo origen y licencia no se documentan con detalle, conviene verificar la cadena de licencias antes de un despliegue en produccion.
- El nombre comercial incluye la etiqueta "chatgpt", que no implica ninguna relacion con OpenAI y puede inducir a confusion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Szymon-Wachelko/GPT-neo-Custom-14B-GGUF
- Modelo base (7B): https://huggingface.co/Szymon-Wachelko/GPT-neo-Custom-7B-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
