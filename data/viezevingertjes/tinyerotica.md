# ViezeVingertjes/TinyErotica

## Resumen

TinyErotica-7M es un modelo de lenguaje de 7.155.360 parámetros entrenado desde cero por el usuario ViezeVingertjes para generar relatos eróticos breves (unas 150 palabras) en inglés. Se trata de un experimento de escala extrema: un transformer tipo Llama de solo 6 capas y dimensión oculta 288, con embeddings atados, pensado para demostrar qué calidad narrativa puede alcanzar un modelo de juguete cuando se entrena sobre un corpus sintético muy curado y homogéneo.

El modelo no acepta prompts: cada generación parte del token separador `<|endoftext|>` y produce una historia completa y autocontenida hasta volver a emitir ese mismo token. Su ventana de contexto es de 256 tokens, exactamente lo que ocupa un relato entero, y su tokenizador es un BPE byte-level de 4.096 tokens entrenado específicamente sobre el dataset.

Es relevante ahora como caso de estudio de *small language models* (SLM) llevados al límite: el autor documenta con detalle el efecto del tamaño del dataset frente al tamaño del modelo, y muestra que por encima de ~7M parámetros añadir más datos mejora más que añadir parámetros. La licencia Apache 2.0 y el formato safetensors lo hacen trivial de cargar con `transformers`, aunque su contenido es explícitamente para adultos (18+) y no apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (6 capas, 6 cabezas, hidden size 288, FFN 768, embeddings atados) |
| Parametros totales | 7.155.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el autor menciona evaluación con pesos int8, pero no publica variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only estilo Llama, muy compacta: 6 capas, 6 cabezas de atención, dimensión oculta 288, FFN de 768 y embeddings de entrada/salida atados. El tokenizador es un BPE byte-level de 4.096 tokens entrenado sobre el propio corpus. El modelo se entrenó desde cero, sin inicialización a partir de ningún modelo preexistente.

Los datos de entrenamiento son el config `curated` del dataset TinyErotica/TinyErotica: 257.002 relatos sintéticos de entre 80 y 190 palabras en 16 categorías, generados a partir de planes por historia por un profesor Gemma 4 y filtrados automáticamente (longitud, palabras prohibidas, referencias a edades o menores, actos no planificados, errores de cuerpo y pronombres). El entrenamiento consistió en 60.000 pasos con batch de 64 × 256 tokens (21 épocas), optimizador AdamW con lr 1e-3 y schedule coseno, alcanzando una mejor pérdida de validación de 1.060. No se documenta RLHF ni DPO; el ajuste fino es puramente de modelado de lenguaje autorregresivo.

## Capacidades

- Generación de relatos eróticos breves y completos (unas 150 palabras) en inglés, siempre partiendo del token `<|endoftext|>`.
- Cierre autónomo de la historia: emite el token separador al terminar (100% de las historias terminan por sí solas según la evaluación del autor).
- Coherencia narrativa básica dentro de escenas de una o dos personas; mantiene nombres de personajes a lo largo del relato con las muestras recomendadas.
- Muestreo configurado en `generation_config.json`: temperatura 1.0, top-k 40, top-p 0.95, min-p 0.10 y repetition penalty 1.08.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidad multilingüe nula: solo inglés.
- No acepta instrucciones ni prompts; no es un modelo conversacional.

## Casos de uso

- Generación de microrrelatos eróticos de forma masiva y local: al ocupar 0,1 GB y 7M de parámetros, se puede ejecutar en CPU para producir lotes de historias cortas sin coste de GPU.
- Prototipado de pipelines de generación creativa: sirve como banco de pruebas barato para validar tokenizadores, estrategias de muestreo (min-p, top-k) y filtros de contenido antes de escalar a modelos mayores.
- Investigación sobre SLM y escalado: permite reproducir el estudio del autor sobre el equilibrio entre tamaño de modelo y tamaño de dataset en una única GPU consumer.
- Filtrado y curación de datasets sintéticos: útil para comparar la calidad de relatos generados por un modelo de 7M frente a los de un profesor mayor y calibrar chequeadores automáticos.
- Educación sobre seguridad y moderación de contenido: al ser un modelo pequeño y acotado a una temática concreta, facilita el estudio de clasificadores de contenido adulto y de detección de temas sensibles.
- Generación de texto de relleno temático en demos y entornos de prueba aislados, donde no se requiere calidad de producción pero sí velocidad y bajo consumo de recursos.

## Benchmarks y rendimiento

El autor publica evaluaciones propias (no benchmarks estándar como MMLU o HumanEval). Se recogen a continuación.

Efecto del tamaño del dataset y de la longitud del entrenamiento (100 historias por modelo, pesos int8, muestreador anterior con temperatura 0.8, top-p 0.9 y repetition penalty 1.15):

| Métrica | 10k historias | 110k historias | 257k, 30k pasos | 257k, 60k pasos (este modelo) |
|---|---:|---:|---:|---:|
| Historias que terminan solas | 100% | 99% | 100% | 100% |
| Palabras (mediana) | 129 | 130 | 146 | 146 |
| Historias marcadas por el checker | 5% | 13% | 0% | 0% |
| Historias que cambian de nombre | 10% | 4% | 7% | 1% |
| 4-gramas distintos | 0.654 | 0.791 | 0.867 | 0.842 |

Juicio ciego por otro modelo (errores lógicos por historia):

| Modelo / configuración | Errores por historia | Historias sin errores |
|---|---:|---:|
| 257k, 30k pasos | 0,67–0,71 | 50–51% |
| Modelos mayores (11,5M–14,0M parámetros, mismos datos) | 0,67–0,73 | 50–57% |
| Este modelo, con el muestreo recomendado | 0,51–0,57 | 60% |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~29 MB de pesos (7,16M parámetros × 4 bytes), más overhead de activaciones mínimo.
- VRAM estimada en int8: ~7 MB de pesos.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, e incluso iGPU) y en CPU.
- GPU recomendadas: cualquiera; no requiere A100 ni H100. Una RTX 4090 permite generar miles de historias por minuto.
- Opciones de despliegue: `transformers` (soporte nativo, tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama mediante conversión a GGUF, aunque el autor no publica artefactos GGUF en la información disponible.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño del modelo se espera del orden de milisegundos por historia en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TinyErotica-7M | 7,16M | 256 | Apache 2.0 | Hugging Face (transformers) | Entrenado desde cero, sin prompts, solo inglés |
| Modelos mayores del mismo autor (11,5M–14,0M) | 11,5M–14,0M | no disponible | no disponible | no disponible | Mismos datos; no reducen errores lógicos según el autor |
| Literotica-Writer-26B-A4B | 26B (A4B, MoE) | no disponible | no disponible | Hugging Face, llama.cpp | Modelo mucho mayor del mismo ecosistema, genera historias de 1.000–5.000 palabras |

No se dispone de comparación con modelos estándar de la misma categoría (por ejemplo, TinyStories) en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo genera ficción sexual explícita, incluidos temas de fantasía oscura como no consentimiento y relaciones tabú entre adultos. Todo es ficción.
- Prohibido su uso por o para menores, y en cualquier producto al que puedan acceder menores.
- Con 7M de parámetros, las historias son cortas y formulaicas; en escenas de tres personas a veces confunde quién hace qué.
- Solo escribe lo que ha visto en entrenamiento: relatos breves en 16 categorías, en inglés; no generaliza a otros dominios ni idiomas.
- Riesgo de alucinación y de incoherencia lógica inherente a su escala; el propio autor mide ~0,5 errores lógicos por historia incluso con el mejor muestreo.
- No acepta prompts ni instrucciones: no es apto para tareas de asistente, código, matemáticas o razonamiento.
- Sesgos: al entrenarse sobre un corpus sintético generado por un profesor y filtrado por reglas, puede heredar sesgos de ese profesor y de las categorías del dataset; no se documenta un análisis de sesgos.
- Aunque la licencia es Apache 2.0, el uso comercial está sujeto a las obligaciones legales sobre contenido adulto y a las políticas de las plataformas de despliegue.
- No se publican variantes cuantizadas ni artefactos GGUF en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViezeVingertjes/TinyErotica
- Dataset TinyErotica: https://huggingface.co/datasets/TinyErotica/TinyErotica
- Modelo relacionado Literotica-Writer-26B-A4B: https://huggingface.co/TinyErotica/Literotica-Writer-26B-A4B
