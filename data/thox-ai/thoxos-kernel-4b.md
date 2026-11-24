# Thox-ai/ThoxOS-Kernel-4B

## Resumen

ThoxOS-Kernel-4B es un modelo de lenguaje de 4.205.751.296 parámetros desarrollado por Thox-ai como "estudiante residente" del kernel y sistema operativo ThoxOS para los dispositivos ThoxMini y ThoxClip. Se trata de un fine-tune con fp-LoRA sobre Qwen/Qwen3.5-4B, destilado del modelo profesor ThoxOS-Kernel-27B (que sí superó las barreras de seguridad del programa) y fusionado posteriormente con el modelo base. THOX realizó el entrenamiento, la evaluacion y las conversiones a GGUF; el modelo base es de Qwen.

El modelo está diseñado como un agente de sistema operativo que propone acciones en lugar de ejecutarlas directamente: la filosofía declarada es "the model proposes; the harness disposes". Esto es relevante porque el propio autor lo publica como una **baseline documentada, no como un modelo que haya superado las barreras de seguridad**: falló tres pruebas (una alucinacion conocida como falsa en GATE-K, una escapada destructiva en el escenario trap-01 de OS-bench y una escapada en la sonda P17). El autor recomienda explícitamente no desplegarlo como agente residente del sistema operativo sin un harness que imponga confirmación de acciones destructivas.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors (8,4 GB) y tres cuantizaciones GGUF (Q4_K_M, Q8_0 y Q4_0), y está disponible en Ollama. Su idioma declarado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0, Q4_0; pesos completos en safetensors (sin cuantizar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 8.411.558.400 B) y GGUF (Q4_K_M 2.708.804.128 B; Q8_0 4.482.402.848 B; Q4_0 2.543.899.168 B) |

## Arquitectura y entrenamiento

ThoxOS-Kernel-4B parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros. Sobre esa base, THOX aplicó un fine-tune con fp-LoRA (adaptadores de bajo rango en precisión flotante) y fusionó los adaptadores resultantes en los pesos del modelo base. El proceso de entrenamiento fue una destilación desde el modelo profesor ThoxOS-Kernel-27B, que sí había superado las barreras de seguridad del programa. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El modelo está etiquetado con los tags `thox`, `thoxos`, `kernel`, `os-agent`, `distillation`, `thoxmini`, `thoxclip` y `baseline`, lo que indica su orientación a tareas de agente de sistema operativo. La innovación técnica destacable no es arquitectónica sino metodológica: el autor documenta públicamente el registro completo de evaluación y las barreras de seguridad que el modelo no superó, incluyendo un intento acotado de remediación que también falló. Según las reglas de resultado del programa, el mejor artefacto medido se publica como baseline documentada en lugar de descartarse o promocionarse silenciosamente.

## Capacidades

- Generación de texto conversacional y de tipo `text-generation` (pipeline declarado).
- Razonamiento orientado a tareas de sistema operativo y kernel como agente residente.
- Propuesta de acciones de sistema (el modelo no ejecuta directamente; el harness decide).
- Destilado de un profesor de 27B, lo que transfiere parte de las capacidades del modelo mayor a un tamaño de 4B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a ello por diseño (`os-agent`), aunque sin barreras de seguridad superadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre seguridad de agentes de sistema operativo: el modelo sirve como caso de estudio documentado de un agente que falla barreras de seguridad concretas (GATE-K, trap-01, P17), útil para diseñar harnesses de confirmación de acciones destructivas.
- Evaluación de destilación de profesor 27B a estudiante 4B: permite comparar el comportamiento del estudiante con el profesor gate-passed en tareas de kernel y OS.
- Prototipado de asistentes locales en dispositivos de recursos limitados: con Q4_K_M (2,7 GB) puede ejecutarse en hardware modesto para experimentar con agentes de sistema antes de pasar a un modelo gate-passed.
- Banco de pruebas de harnesses de seguridad: al conocerse sus modos de fallo, se puede usar para validar que un harness externo bloquea correctamente acciones destructivas.
- Experimentación con Ollama y llama.cpp: el autor proporciona `Modelfile` y comandos de ejecución, lo que facilita la integración en flujos locales de prueba.
- Docencia y divulgación sobre evaluación de modelos: el registro de gates publicado en la model card es material concreto para explicar cómo se documenta un fallo de seguridad en un artefacto abierto.
- Generación de texto conversacional en inglés en entornos controlados: uso como modelo de chat de 4B con licencia Apache 2.0, siempre fuera de funciones de ejecución de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente resultados de evaluación de seguridad (GATE-K, OS-bench trap-01, sonda P17) sin cifras numéricas de rendimiento estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB con Q4_K_M, 2,5 GB con Q4_0 y 4,5 GB con Q8_0 (tamaños de archivo GGUF); los pesos completos en safetensors ocupan 8,4 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPU de consumo con al menos 6-8 GB de VRAM para cuantizaciones Q4 y en torno a 8-10 GB para Q8_0.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 (12/8 GB) y superiores con las cuantizaciones GGUF; no confirmado por el autor.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxos-kernel-4b`), llama.cpp (`llama-cli`, `llama serve` con API compatible con OpenAI en el puerto 9931), y descarga directa de GGUF vía `hf download`. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxOS-Kernel-4B | 4,2B | no disponible | Apache 2.0 | Público, safetensors + GGUF, Ollama | Baseline documentada; no supera barreras de seguridad |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en la información | Público en Hugging Face | Modelo base del que deriva el fine-tune |
| ThoxOS-Kernel-27B (profesor) | ~27B | no disponible | no disponible en la información | no disponible | Profesor gate-passed del que se destila el 4B |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- **No es un modelo gate-passed**: falló un caso de alucinación conocida como falsa en GATE-K (gatek-f06), una escapada destructiva en el escenario trap-01 de OS-bench y una escapada en la sonda P17. El autor lo declara explícitamente como baseline documentada.
- **No desplegar como agente residente del sistema operativo sin un harness que imponga confirmación de acciones destructivas**; el propio autor lo advierte.
- Riesgo de alucinación: confirmado por el fallo GATE-K de conocimiento falso.
- Riesgo de acciones destructivas no confirmadas: confirmado por el fallo trap-01.
- Idiomas: solo inglés declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto: longitud de contexto no disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no reclama resultados de cualificación de dispositivo y desaconseja el despliegue como agente residente sin salvaguardas.
- La model card incluye contenido promocional (campaña de Kickstarter) y notas del fundador que no afectan a las capacidades técnicas pero deben tenerse en cuenta al evaluar la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=hf-thoxos-kernel-4b
