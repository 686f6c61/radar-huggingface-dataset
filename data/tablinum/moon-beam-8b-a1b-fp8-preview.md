# tablinum/Moon-Beam-8B-A1B-FP8-Preview

## Resumen

Moon-Beam-8B-A1B-FP8-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tablinum, un proyecto que combina un modelo base de terceros con una biblioteca de conocimiento recuperable denominada *engram*. El modelo parte de inclusionAI Ling-3.0-tiny y se ha ajustado con QLoRA (ronda 1b) sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Cuenta con 7.893.392.800 parámetros totales y aproximadamente 1.000 millones activos por token, con una ventana de contexto de 131.072 tokens.

La propuesta diferencial no es el modelo en sí, sino su integración con recuperación: Moon-Beam está entrenado para responder a partir de pasajes recuperados que se le inyectan en un formato concreto, y para ello se distribuye junto a la herramienta `terrabeam`, que actúa como proxy del servidor de inferencia. Los resultados preliminares del 4 de noviembre muestran mejoras sustanciales al añadir recuperación: en SimpleQA pasa de 28 a 593 respuestas correctas sobre 1.000, y en EngramBench de 65 a 431 sobre 503.

Esta variante concreta es la versión cuantizada a FP8 block-wise (bloques de 128×128 con escalas ue8m0), en un archivo de 7,9 GB, con el mismo diseño que el repositorio FP8 de Ling-3.0-tiny. Es una versión *preview* (candidata a lanzamiento, ronda 1b) y el autor advierte de que no ha sido probada en vLLM por su parte, aunque el formato debería cargar en vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base Ling-3.0-tiny; tag de arquitectura `bailing_hybrid` |
| Parametros totales | 7.893.392.800 |
| Parametros activos | Aproximadamente 1.000 millones por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 block-wise (128×128, escalas ue8m0); existen variantes BF16, GGUF (Q4_K_M, Q6_K, Q8_0) y MLX (beam, 8-bit) en repositorios hermanos |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8); GGUF y MLX en repositorios separados |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos construida sobre inclusionAI Ling-3.0-tiny, con unos 8.000 millones de parámetros totales y alrededor de 1.000 millones activos por token. El tag `bailing_hybrid` sugiere una arquitectura híbrida heredada del linaje Ling/Bailing, aunque la información disponible no detalla la composición exacta de capas de atención ni el número de expertos. El ajuste de la ronda 1b se realizó con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno, lo que orienta el modelo hacia el uso con recuperación aumentada en lugar de hacia el conocimiento paramétrico puro.

La innovación principal es el componente *engram*: una biblioteca de conocimiento consultable que se inyecta en el prompt en un formato específico de entrenamiento. Los resultados indican que la mayor parte de la ganancia procede de proporcionar pasajes relevantes, no del ajuste fino: el modelo base Ling sin entrenar alcanzó 59,2 % en SimpleQA con los mismos pasajes, frente al 59,3 % de la ronda 1b. El modelo soporta además un modo de razonamiento (*thinking*) activable y desactivable.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multiturno (94,0 % de acierto en primera pregunta y 93,3 % en segunda sobre 150 pares).
- Razonamiento matemático: 96,2 % en GSM8K con *thinking* activado y 92,5 % desactivado (400 preguntas).
- Razonamiento de conocimiento general: 63,9 % en MMLU-Pro con *thinking* y 44,0 % sin él (700 preguntas).
- Llamada a herramientas (*tool calling*), incluida en los datos de ajuste.
- Modo de razonamiento (*thinking*) con presupuesto de salida configurable (hasta 32.000 tokens en la evaluación de lanzamiento).
- Respuesta aumentada por recuperación mediante el formato de pasajes *engram* y el proxy `terrabeam`.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio ni otros modalidades.

## Casos de uso

- **Atención al cliente con base de conocimiento propia**: el modelo responde a partir de pasajes recuperados de una base documental, con ventana de 131.072 tokens que permite inyectar múltiples fragmentos y mantener conversaciones largas. La integración con `terrabeam` permite añadir recuperación sin modificar el cliente.
- **Sistemas de pregunta-respuesta sobre documentación corporativa**: el salto de 2,8 % a 59,3 % en SimpleQA al añadir pasajes lo hace adecuado para asistentes internos donde la respuesta debe citar fuentes recuperadas en lugar de depender del conocimiento paramétrico.
- **Tutoría y resolución de problemas matemáticos**: con 96,2 % en GSM8K, sirve para asistentes educativos que resuelven problemas paso a paso con el modo *thinking* activado.
- **Agentes con llamadas a herramientas**: el ajuste incluye *tool calling*, lo que permite integrarlo en flujos donde el modelo decide qué función invocar (consultas a APIs, cálculo, búsqueda) antes de responder.
- **Generación asistida en pipelines de CI/CD**: puede desplegarse en vLLM o SGLang con el endpoint compatible con OpenAI y usarse para tareas de revisión, resumen o generación de parches, aunque su licencia MIT y su tamaño permiten integrarlo sin restricciones comerciales.
- **Despliegue en hardware de gama media**: la variante Q4_K_M ocupa 4,94 GB y mantiene el 97,65 % de coincidencia en el token top-1 frente a BF16 en posiciones mixtas, lo que permite ejecutarlo en GPUs de consumo para prototipos y entornos de desarrollo.
- **Investigación sobre recuperación aumentada**: al publicar comparativas cerrado frente a recuperado en tres conjuntos (EngramBench, SimpleQA, AA-Omniscience), sirve como banco de pruebas para estudiar el efecto de la recuperación en modelos pequeños.

## Benchmarks y rendimiento

Resultados preliminares del 4 de noviembre (temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K). Las cifras marcadas como preliminares están siendo re-medidas.

| Prueba (preguntas) | Thinking on · cerrado → recuperado | Thinking off · cerrado → recuperado |
|---|---:|---:|
| EngramBench (503) | 12,9 % → 85,7 % | 10,1 % → 87,5 % |
| SimpleQA (1000) | 2,8 % → 59,3 % | 2,6 % → 57,5 % |
| AA-Omniscience (200) | 10,0 % → 26,5 % | 5,0 % → 26,5 % |

| Prueba · muestra | Thinking on | Thinking off |
|---|---:|---:|
| GSM8K · 400 | 96,2 % | 92,5 % |
| Multiturno, primera · 150 | 94,0 % | 86,7 % |
| Multiturno, segunda · 150 | 93,3 % | 88,7 % |
| MMLU-Pro · 700 | 63,9 % | 44,0 % |

En MMLU-Pro, 70 de 700 respuestas con *thinking* alcanzaron el tope de 30.000 tokens de salida. El modelo base Ling sin ajustar también obtuvo 96,2 % en GSM8K. La evaluación usa Claude Haiku como evaluador, con respuestas parciales y abstenciones contabilizadas por separado.

Fidelidad de cuantización (coincidencia del token top-1 frente a BF16):

| Build | Tamano | Coincidencia mixta | Coincidencia WikiText |
|---|---:|---:|---:|
| Q4_K_M | 4,94 GB | 97,65 % | 92,74 % |
| Q6_K | 7,23 GB | 98,92 % | 96,74 % |
| Q8_0 | 8,41 GB | 99,18 % | 97,20 % |
| MLX beam | 4,92 GB | 96,75 % | 90,92 % |
| MLX 8-bit | 8,87 GB | 99,20 % | 97,40 % |

## Requisitos de hardware

- **VRAM para FP8**: el archivo pesa 7,9 GB; con overhead de runtime y caché KV para contexto largo, se recomienda al menos 16 GB de VRAM para contextos moderados y 24 GB o más para aprovechar ventanas cercanas a 131K tokens.
- **VRAM para otras cuantizaciones**: Q4_K_M (4,94 GB) es viable en GPUs de consumo de 8 GB; Q8_0 (8,41 GB) requiere 12 GB o más.
- **GPUs recomendadas**: A100, H100 o L40S para FP8 con contexto largo y despliegue en producción; RTX 4090 (24 GB) para FP8 con contexto amplio o Q8_0; RTX 3060/4060 Ti (8-16 GB) para Q4_K_M.
- **Opciones de despliegue**: vLLM (`vllm serve ... --trust-remote-code --max-model-len 131072`), SGLang (`python -m sglang.launch_server ...`), llama.cpp/Ollama con la variante GGUF, y MLX en Apple Silicon.
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor indica que la variante FP8 no ha sido probada en vLLM por su parte.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Moon-Beam-8B-A1B-FP8-Preview | 7,9B totales, ~1B activos | 131.072 | MIT | Especializado en recuperación (*engram*); inglés |
| inclusionAI Ling-3.0-tiny | No disponible | No disponible | No disponible | Modelo base del que deriva Moon-Beam |
| Modelos MoE pequeños de propósito general | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se han publicado comparativas directas con modelos de la misma categoría en la información disponible. La referencia más cercana es el propio modelo base Ling-3.0-tiny, del que Moon-Beam hereda arquitectura y tokenizador.

## Limitaciones y advertencias

- **Estado preview**: los pesos son candidatos a lanzamiento (ronda 1b); la biblioteca Tablinum-2 está en uso y Tablinum-3 (aproximadamente el doble) sigue en construcción, por lo que las tarjetas y el paquete *engram* cambiarán.
- **Dependencia de recuperación**: sin pasajes recuperados, el rendimiento cae drásticamente (SimpleQA del 59,3 % al 2,8 % con *thinking*). El modelo no está pensado para uso cerrado.
- **Idioma**: solo inglés según la model card; no se documenta soporte multilingüe.
- **Riesgo de alucinación**: elevado en modo cerrado, como muestran las cifras de SimpleQA y AA-Omniscience sin recuperación.
- **Madurez del ecosistema**: la variante FP8 no ha sido probada en vLLM por el autor; el layout replica el de inclusionAI, pero puede requerir ajustes.
- **Evaluación preliminar**: los números están siendo re-medidos con el protocolo de la model card; el propio autor los marca como preliminares.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible.
- **Licencia**: MIT, sin restricciones conocidas para uso comercial, aunque el modelo base Ling-3.0-tiny puede tener sus propias condiciones que conviene verificar.

## Enlaces

- [Modelo en Hugging Face (FP8)](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-FP8-Preview)
- [Modelo base BF16](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview)
- [Variante GGUF](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview)
- [Variante MLX](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-Preview)
- [Notas de modelo y evaluación](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md)
- [Resultados preliminares (JSON)](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/benchmarks_preliminary_1104.json)
- [terrabeam (proxy de recuperación)](https://github.com/chadstthomas-svg/terrabeam)
