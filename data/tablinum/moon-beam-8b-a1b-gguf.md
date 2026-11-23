# tablinum/Moon-Beam-8B-A1B-GGUF

## Resumen

Moon-Beam-8B-A1B es un modelo de lenguaje de tipo mixture-of-experts (MoE) publicado por el usuario tablinum, con 7.893.392.800 parámetros totales y aproximadamente 1.000 millones activos por token. Está construido sobre inclusionAI Ling-3.0-tiny y afinado con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Su ventana de contexto alcanza los 131.072 tokens, lo que lo sitúa en la liga de modelos de contexto largo pese a su reducido coste de inferencia por token activo.

La versión aquí descrita es la cuantización GGUF del modelo base `tablinum/Moon-Beam-8B-A1B`, distribuida en múltiples niveles de cuantización (desde IQ1_M de 2,14 GB hasta BF16 de 15,80 GB) con matrices de importancia propias para cada archivo. El autor acompaña los pesos con un arnés de despliegue llamado terrabeam, que inyecta pasajes de una biblioteca de conocimiento (la *engram*) en el prompt y permite al modelo invocar `search_library` de forma autónoma.

El interés actual del modelo radica en su combinación de contexto largo, modo de razonamiento (thinking) activado por defecto, soporte de tool calling y un formato GGUF optimizado para llama.cpp, con un decodificador especulativo MTP que acelera la generación en GPU. La licencia MIT y su tamaño contenido lo hacen atractivo para despliegues en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) basada en Ling-3.0-tiny; tipo `bailingmoe3` en llama.cpp |
| Parametros totales | 7.893.392.800 |
| Parametros activos | Aproximadamente 1.000 millones por token (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS, IQ1_M; ademas cabecera MTP en Q4_K_M |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |
| Tamano del repositorio | 59,0 GB |
| Libreria | gguf |
| Pipeline | text-generation |
| Modelo base | tablinum/Moon-Beam-8B-A1B |
| Version de llama.cpp requerida | b12078 o superior |
| Descargas / likes | 4.689 / 12 |

## Arquitectura y entrenamiento

Moon-Beam emplea una arquitectura transformer de tipo mixture-of-experts heredada de inclusionAI Ling-3.0-tiny, con 8B parámetros totales y en torno a 1B activos por token, lo que reduce el coste computacional por paso de decodificación. El contexto máximo es de 131.072 tokens. La ronda de entrenamiento publicada (round 1b) se realizó mediante QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Una segunda ronda de ajuste no superó las métricas de validación de la primera, por lo que el autor liberó los pesos de la ronda 1b.

El modelo incorpora dos innovaciones técnicas destacables. Por un lado, una cabecera MTP (multi-token prediction) distribuida como archivo GGUF independiente (`Moon-Beam-8B-A1B-MTP-Q4_K_M.gguf`, 0,55 GB) que actúa como borrador para decodificación especulativa en llama.cpp, con una mejora declarada de aproximadamente el 13 % en velocidad de decodificación en GPU. Por otro, el ecosistema terrabeam, un arnés que gestiona la recuperación de pasajes de la biblioteca Tablinum, reinyecta el razonamiento previo entre turnos y ofrece memoria persistente entre conversaciones; según el autor, el mismo modelo con terrabeam 0.3 frente a 0.2 pasa del 53,2 % al 83,4 % de acierto en 154 tareas de biblioteca retenidas.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento (thinking) activado por defecto, desactivable por petición mediante `chat_template_kwargs.enable_thinking = false`.
- Razonamiento matemático: 95,5 % de acierto en 400 preguntas de GSM8K con thinking activado.
- Tool calling y function calling, incluyendo la herramienta `search_library` para consultar la biblioteca engram de forma autónoma y en múltiples pasos.
- Razonamiento multi-paso: capaz de encadenar varias búsquedas para resolver preguntas de dos etapas.
- Actuación como agente de soporte en dominios específicos (aerolíneas, retail, telecomunicaciones) evaluado en tau2-bench.
- Memoria a largo plazo entre conversaciones cuando se sirve con terrabeam 0.3 (`--memory long-term`).
- Compatibilidad con clientes OpenAI-style: Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multiturno con hasta 131.072 tokens de contexto y ha sido evaluado en tau2-bench con recompensas de 0,71 en aerolíneas, 0,80 en retail y 0,62 en telecomunicaciones, lo que lo hace adecuado para agentes de soporte con acceso a base de conocimiento.
- Asistente con recuperación aumentada sobre documentación corporativa: mediante terrabeam, cada consulta recibe los mejores pasajes de la biblioteca engram en el formato exacto de entrenamiento, con un 91,7 % de acierto en tareas de hechos sobre tablas no vistas.
- Resolución de problemas matemáticos y razonamiento cuantitativo: su 95,5 % en GSM8K con thinking activado lo hace viable para tutores automáticos o verificación de cálculos en pipelines.
- Agentes que consultan herramientas externas: el soporte de tool calling y de búsquedas iterativas permite construir flujos donde el modelo decide cuándo y qué consultar, útil en asistentes de investigación o de soporte técnico.
- Despliegue en hardware de consumo: con cuantizaciones desde 2,14 GB (IQ1_M) hasta 4,94 GB (Q4_K_M), puede ejecutarse en GPUs consumer y en CPU mediante llama.cpp, sirviendo una API OpenAI en `http://127.0.0.1:8080/v1`.
- Integración en IDE y asistentes de código: compatible con Cursor, Continue, Cline y Claude Code, adecuado para autocompletado y explicación de código en entornos de desarrollo locales.
- Memoria persistente entre sesiones: con `--memory long-term`, las notas de conversaciones anteriores se recuperan en futuras interacciones (89,6 % de acierto en tareas de memoria en la evaluación del autor), útil para asistentes personales.
- Servicio de preguntas de dos etapas sobre bases de datos tabulares: la combinación de búsqueda autónoma y contexto largo permite resolver consultas que requieren localizar un dato y luego operar sobre él (63,6 % en la evaluación interna, frente al 9,1 % del arnés anterior).

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | temperature 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos, thinking on | 95,5 % |
| EngramBench (503 preguntas) | thinking on, pasajes de la tabla propia de cada pregunta | 436/503 correctas (86,5 %) |
| tau2-bench airline | agente de soporte | recompensa media 0,71 |
| tau2-bench retail | agente de soporte | recompensa media 0,80 |
| tau2-bench telecom | agente de soporte | recompensa media 0,62 |
| Tareas de biblioteca retenidas (154) | terrabeam 0.3 vs 0.2 | 83,4 % vs 53,2 % de acierto |
| Hechos sobre tablas no vistas (108) | terrabeam 0.3 vs 0.2 | 91,7 % vs 59,7 % |
| Preguntas de dos etapas (22) | terrabeam 0.3 vs 0.2 | 63,6 % vs 9,1 % |
| Memoria de conversaciones previas (24) | terrabeam 0.3 vs 0.2 | 89,6 % vs 64,6 % |

Fidelidad de cuantización respecto a BF16 (concordancia top-1 en mixto / WikiText y KLD en mixto):

| Archivo | Tamano | Top-1 (mixto / WikiText) | KLD (mixto) |
|---|---:|---:|---:|
| Q8_0 | 8,41 GB | 99,18 % / 97,20 % | 0,0009 |
| Q6_K | 7,23 GB | 98,92 % / 96,74 % | 0,0012 |
| Q5_K_M | 5,86 GB | 98,45 % / 94,86 % | 0,0031 |
| Q4_K_M | 4,94 GB | 97,65 % / 92,74 % | 0,0075 |
| IQ4_XS | 4,83 GB | 97,32 % / 92,76 % | 0,0074 |
| IQ3_XXS | 3,69 GB | 94,97 % / 85,40 % | 0,0285 |
| IQ2_M | 3,07 GB | 92,98 % / 80,26 % | 0,0622 |
| IQ2_XXS | 2,46 GB | 88,44 % / 73,88 % | 0,1456 |
| IQ1_M | 2,14 GB | 85,09 % / 66,51 % | 0,2577 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,14 GB (IQ1_M) y 15,80 GB (BF16); Q4_K_M requiere unos 4,94 GB de pesos más overhead de contexto KV, que crece con la ventana usada hasta 131.072 tokens.
- GPU recomendadas: H100 o A100 para servir contexto completo de 131K con throughput alto; RTX 4090 o similar (24 GB) para Q8_0 o BF16 con contexto largo; GPUs de 8-12 GB para Q4_K_M o IQ4_XS.
- Cabe en GPU consumer: sí, desde tarjetas de 6-8 GB con cuantizaciones IQ2/IQ3, y de forma holgada en 12-24 GB con Q4_K_M o Q6_K.
- Despliegue: llama.cpp (versión b12078 o superior) mediante `llama-server`, con soporte de `--jinja`, decodificación especulativa MTP (`--spec-type draft-mtp --spec-draft-n-max 2`) y `-ngld 99`; el arnés terrabeam ofrece una API compatible con OpenAI en `http://127.0.0.1:8080/v1` y se integra con Ollama, LM Studio, Open WebUI y otros clientes.
- Aceleración: la cabecera MTP Q4_K_M aporta aproximadamente un 13 % más de velocidad de decodificación en GPU según el autor; no se publican cifras absolutas de latencia ni throughput (tokens/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B (este) | 7,89B / ~1B | 131.072 | MIT | GGUF, safetensors | MoE con thinking y tool calling; 95,5 % en GSM8K |
| inclusionAI Ling-3.0-tiny | no disponible en la informacion | no disponible | no disponible | no disponible | Modelo base sobre el que se afino Moon-Beam |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada; la unica referencia directa es el modelo base Ling-3.0-tiny, del que no se detallan especificaciones en la model card.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre datos recuperados y conversaciones, puede heredar sesgos de esas fuentes.
- Alucinación: el modelo puede responder desde sus propios pesos sin consultar la biblioteca; el autor recomienda usar terrabeam para inyectar pasajes, y advierte que el rendimiento cae drásticamente sin el arnés adecuado (por ejemplo, tau2 airline pasa de 0,711 a 0,045 si se descarta el razonamiento previo entre turnos).
- Dependencia del arnés: parte de los resultados publicados (EngramBench, tareas de biblioteca, memoria) se obtienen con terrabeam 0.3 y su biblioteca; en llama.cpp puro el modelo responde solo desde sus pesos.
- Requisito de versión: necesita llama.cpp b12078 o superior para soportar `bailingmoe3` y `draft-mtp`; versiones anteriores no cargarán el modelo o la cabecera especulativa.
- Cuantizaciones agresivas: IQ1_M e IQ2_XXS muestran una degradación notable (top-1 en WikiText de 66,51 % y 73,88 % respectivamente), por lo que no son recomendables para producción.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del modelo base Ling-3.0-tiny si se redistribuye.
- Fecha de creación del repositorio: 2026-11-05, con última actualización 2026-11-23; verificar la vigencia de los enlaces y del arnés terrabeam antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decisión de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Arnés terrabeam (repositorio): https://github.com/chadstthomas-svg/terrabeam
- Guía de integración con aplicaciones: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instrucciones para agentes: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/AGENTS.md
