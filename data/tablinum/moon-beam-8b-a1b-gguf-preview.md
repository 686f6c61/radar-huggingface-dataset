# tablinum/Moon-Beam-8B-A1B-GGUF-Preview

## Resumen

Moon-Beam 8B A1B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tablinum, construido a partir de Ling-3.0-tiny de inclusionAI y aumentado con una biblioteca de conocimiento consultable denominada *engram*. Con 8B parámetros totales y aproximadamente 1B activos por token, ofrece una ventana de contexto de 131.072 tokens, lo que lo sitúa en la categoría de modelos eficientes de contexto largo. La versión aquí descrita es una cuantización GGUF de la release candidate (round 1b), distribuida bajo licencia MIT.

El modelo está afinado con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multi-turno. Su propuesta diferencial no es solo el modelo en sí, sino el binomio pesos más arnés de ejecución: el ecosistema terrabeam inyecta pasajes de la biblioteca Tablinum en el formato exacto con el que se entrenó el modelo, y le permite invocar una herramienta `search_library` para recuperar información adicional de forma autónoma.

Es relevante ahora porque combina tres elementos poco habituales en modelos de este tamaño: arquitectura MoE con activación dispersa, contexto de 128K y un modo de razonamiento (*thinking*) activado por defecto, todo ello en un paquete que cabe en GPUs de consumo con cuantizaciones de 4 bits y que expone una API compatible con OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), tipo `bailingmoe3` (Ling v3) |
| Parámetros totales | 7.893.392.800 (≈8B) |
| Parámetros activos | ≈1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS, IQ1_M, más cabezal MTP en Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Ling-3.0-tiny de inclusionAI, una arquitectura transformer con mezcla de expertos identificada en llama.cpp como `bailingmoe3`. La activación dispersa permite que, pese a los 8B parámetros totales, solo se compute aproximadamente 1B por token, lo que reduce el coste de inferencia de forma sustancial. El contexto máximo es de 131.072 tokens. La release candidate (round 1b) se afinó con QLoRA sobre un conjunto compuesto por pasajes recuperados de la biblioteca engram, problemas matemáticos, llamadas a herramientas y conversaciones multi-turno.

Una innovación destacable es la inclusión de un cabezal de decodificación especulativa MTP (*multi-token prediction*) empaquetado como archivo GGUF independiente (`Moon-Beam-8B-A1B-MTP-Q4_K_M.gguf`, 0,55 GB), que según el autor aporta aproximadamente un 13% más de velocidad de decodificación en GPU. El modelo también incorpora un modo de razonamiento (*thinking*) activado por defecto, desactivable por petición mediante `chat_template_kwargs`. El entrenamiento combina el ajuste supervisado con QLoRA; no se documenta en la información disponible el uso explícito de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 131.072 tokens.
- Razonamiento con modo *thinking* activado por defecto, desactivable por petición.
- Razonamiento matemático: 95,5% en 400 preguntas de GSM8K con thinking activo.
- Llamadas a herramientas (*tool calling*) y *function calling*, incluyendo la herramienta propia `search_library`.
- Recuperación autónoma de información: el modelo puede formular sus propias consultas a la biblioteca engram y encadenar varias búsquedas.
- Razonamiento multi-paso: preguntas de dos pasos resueltas con el arnés terrabeam 0.3.
- Memoria a largo plazo entre conversaciones mediante `--memory long-term` en terrabeam.
- Capacidad de agente de soporte en dominios de aerolínea y retail (tau2-bench).
- Multilingüe: únicamente inglés según la model card.
- Sin capacidades de visión ni audio documentadas.

## Casos de uso

- **Atención al cliente automatizada:** con recompensas medias de 0,71 en aerolínea y 0,80 en retail en tau2-bench, el modelo es adecuado para agentes de soporte que gestionan conversaciones multi-turno y consultan una base de conocimiento mediante `search_library`, aprovechando la ventana de 131K tokens para mantener contexto de la sesión.
- **Asistente con recuperación aumentada sobre documentación corporativa:** terrabeam inyecta los mejores pasajes de la biblioteca Tablinum en el formato de entrenamiento del modelo; útil para desplegar un asistente interno que responde sobre tablas de datos propietarias con una tasa de acierto del 91,7% en tareas de hechos con el arnés 0.3.
- **Resolución de problemas matemáticos y cuantitativos:** el 95,5% en GSM8K con thinking activo lo hace apto para asistentes de cálculo, verificación de operaciones y tutoría matemática en inglés.
- **Agentes con memoria persistente:** la opción `--memory long-term` permite construir asistentes que recuerdan hechos personales dichos en conversaciones anteriores (89,6% de acierto en tareas de memoria con terrabeam 0.3).
- **Integración en pipelines de desarrollo:** al exponer una API compatible con OpenAI en `http://127.0.0.1:8080/v1`, puede conectarse a Claude Code, Cursor, Continue, Cline u opencode para tareas de generación y asistencia de código con tool calling.
- **Despliegue en estaciones de trabajo sin GPU dedicada de datacenter:** las cuantizaciones IQ2 e IQ3 (2,46–3,69 GB) permiten ejecutar el modelo en CPU o en GPUs de consumo modestas, con la contrapartida de menor fidelidad respecto a BF16.
- **Prototipado rápido de aplicaciones conversacionales:** el comando único de terrabeam descarga pesos, build de llama.cpp y biblioteca, y sirve el modelo, lo que reduce el tiempo de puesta en marcha en entornos de evaluación.

## Benchmarks y rendimiento

| Evaluación | Configuración | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | temperature 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos, thinking on | 95,5% |
| EngramBench (503 preguntas) | thinking on, pasajes de la tabla propia de cada pregunta | 436/503 correctas (86,5%) |
| tau2-bench, aerolínea | agente de soporte | recompensa media 0,71 |
| tau2-bench, retail | agente de soporte | recompensa media 0,80 |
| Tareas de biblioteca (154 held-out), terrabeam 0.2 | hechos / dos pasos / memoria / total | 59,7% / 9,1% / 64,6% / 53,2% |
| Tareas de biblioteca (154 held-out), terrabeam 0.3 | hechos / dos pasos / memoria / total | 91,7% / 63,6% / 89,6% / 83,4% |

Fidelidad de las cuantizaciones respecto a BF16 (concordancia top-1 mixto/WikiText y KLD mixto):

| Archivo | Tamaño | Top-1 (mixto / WikiText) | KLD |
|---|---:|---:|---:|
| Q8_0 | 8,41 GB | 99,18% / 97,20% | 0,0009 |
| Q6_K | 7,23 GB | 98,92% / 96,74% | 0,0012 |
| Q5_K_M | 5,86 GB | 98,45% / 94,86% | 0,0031 |
| Q4_K_M | 4,94 GB | 97,65% / 92,74% | 0,0075 |
| IQ4_XS | 4,83 GB | 97,32% / 92,76% | 0,0074 |
| IQ3_XXS | 3,69 GB | 94,97% / 85,40% | 0,0285 |
| IQ2_M | 3,07 GB | 92,98% / 80,26% | 0,0622 |
| IQ2_XXS | 2,46 GB | 88,44% / 73,88% | 0,1456 |
| IQ1_M | 2,14 GB | 85,09% / 66,51% | 0,2577 |

No se han publicado resultados de MMLU ni HumanEval en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,14 GB (IQ1_M) y 15,80 GB (BF16), pasando por 4,94 GB en Q4_K_M y 8,41 GB en Q8_0. El cabezal MTP añade 0,55 GB si se usa decodificación especulativa.
- Cabe en GPUs de consumo: Q4_K_M (4,94 GB) e IQ4_XS (4,83 GB) entran en tarjetas de 8 GB; IQ3_XXS (3,69 GB) e IQ2_M (3,07 GB) en tarjetas de 4–6 GB; las variantes IQ1 e IQ2_XXS permiten ejecución en CPU con RAM modesta.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Para BF16 se requiere una GPU de al menos 16 GB de VRAM; para Q8_0, al menos 10 GB.
- Opciones de despliegue: llama.cpp (versión b12078 o superior), terrabeam (arnés propio con API compatible con OpenAI y biblioteca engram), y clientes compatibles como Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode.
- Latencia y throughput: el cabezal MTP aporta aproximadamente un 13% más de velocidad de decodificación en GPU. No se publican cifras absolutas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Moon-Beam 8B A1B | ≈8B | ≈1B | 131.072 | MIT | GGUF | Thinking, tool calling, biblioteca engram, MTP |
| Ling-3.0-tiny (inclusionAI) | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Moon-Beam |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La información disponible no incluye comparaciones directas con otros modelos de la misma categoría; la única referencia verificable es Ling-3.0-tiny como modelo base.

## Limitaciones y advertencias

- **Estado de preview:** los pesos corresponden a una release candidate (round 1b); el autor prevé una segunda ronda de entrenamiento y una versión sin el sufijo `-Preview`. No deben tratarse como una versión estable para producción crítica.
- **Idioma:** solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- **Dependencia del arnés:** buena parte de los resultados publicados (hechos, dos pasos, memoria) se obtienen con terrabeam 0.3 y la biblioteca engram; con llama.cpp puro el modelo responde solo desde sus pesos, sin acceso a la biblioteca.
- **Sesgos:** no se documentan evaluaciones de sesgo en la información disponible.
- **Alucinación:** no se publican métricas de tasa de alucinación; el modo thinking activo por defecto y la recuperación externa mitigan parcialmente el riesgo, pero no lo eliminan.
- **Cuantizaciones agresivas:** por debajo de IQ3_XXS la fidelidad cae de forma marcada (IQ2_XXS: 88,44%/73,88% de concordancia top-1; IQ1_M: 85,09%/66,51%), lo que desaconseja su uso en tareas sensibles a la precisión.
- **Requisito de versión:** necesita llama.cpp b12078 o superior para soportar `bailingmoe3` y `draft-mtp`; versiones anteriores no cargarán el modelo correctamente.
- **Licencia:** MIT, sin restricciones conocidas para uso comercial; aun así, conviene verificar la licencia del modelo base Ling-3.0-tiny antes de un despliegue comercial.
- **Contexto largo:** aunque la ventana es de 131.072 tokens, no se documenta el rendimiento en el extremo superior de la ventana ni el coste de memoria KV cache a esa longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md
- Biblioteca Tablinum-3 (dataset): https://huggingface.co/datasets/tablinum/tablinum-3
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Guía de integración con aplicaciones: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instrucciones para agentes (AGENTS.md): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/AGENTS.md
