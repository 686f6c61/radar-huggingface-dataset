# vcruz305/Nanbeige4.3-33B-SAGE-EXL3-4.50bpw

## Resumen

Nanbeige4.3-33B-SAGE-EXL3-4.50bpw es una cuantización EXL3 a 4,50 bits por peso del modelo Nanbeige4.3-33B, publicado por el usuario vcruz305 en Hugging Face. El modelo base fue desarrollado por el Nanbeige Team como el "agente maestro" (teacher agent) insignia de la familia Nanbeige4.3, concebido para destilar comportamientos agénticos en modelos futuros más pequeños. Se trata de un modelo denso de ~33.100 millones de parámetros con arquitectura estilo Llama, orientado a código agéntico, uso de herramientas, automatización multi-paso, razonamiento y tareas de oficina profesionales.

La relevancia de esta cuantización radica en que hace ejecutable un modelo de 33B en una única GPU de consumo: los pesos serializados ocupan 18,35 GiB y se ha demostrado su funcionamiento en una RTX 4090 de 24 GB con contexto de 36.864 tokens, alcanzando 33,82 tokens/s. El modelo base publica una ventana de contexto de 512K tokens, aunque no demostrada en esta cuantización con 24 GB de VRAM. Los idiomas soportados son inglés y chino, y la licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (tipo `llama`), denso, no MoE |
| Parametros totales | ~33.100 millones (modelo base); 9.850.210.304 en metadatos safetensors de esta release |
| Parametros activos | No aplica (no es MoE); todos los 52 layers participan en cada token |
| Longitud de contexto | 524.288 tokens (512K) según el modelo original; 36.864 tokens demostrados en esta cuantización con 24 GB de VRAM |
| Tipos de cuantizacion | EXL3 4,50 bpw (4,499880554 bpw en el cuerpo del decoder), codebook `mul1`, embeddings y output head a 8 bits |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (54 shards, 18,35 GiB / 19,7 GB), formato EXL3 para ExLlamaV3 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso estilo Llama con 52 layers, dimension oculta de 7.168 y FFN de 22.016 con activación SwiGLU/SiLU. La atencion usa GQA (Grouped Query Attention) con 56 query heads y 8 key/value heads de tamano 128, lo que reduce el coste del KV cache. El vocabulario tiene 166.912 tokens con tablas de embedding y output head sin atar (untied), ambas cuantizadas a 8 bits en esta release EXL3.

Sobre el entrenamiento del modelo base, la informacion disponible no detalla el numero de tokens ni la composicion del dataset. El Nanbeige Team posiciona el modelo como agente maestro para destilacion hacia modelos menores, con foco en codigo agéntico, ingenieria de software en terminal, uso de herramientas y automatizacion multi-paso. La plantilla de chat original incluye controles de razonamiento (`enable_thinking`, activado por defecto) y `preserve_thinking` para retener el razonamiento previo en contextos multi-turno. La cuantizacion EXL3 fue producida con SAGE-EXL3 mediante una asignacion mixta de bits sobre 364 tensores, con verificacion SHA-256 de los 54 shards documentada en un repositorio publico de GitHub.

## Capacidades

- Generacion de texto y conversacion en ingles y chino, con modo de razonamiento (thinking) activable por respuesta mediante `enable_thinking`.
- Codigo agéntico e ingenieria de software en terminal: el modelo esta optimizado para flujos tipo SWE (resolucion de issues, edicion de repositorios, uso de shell).
- Uso de herramientas (tool calling) con formato XML recomendado por los autores (tambien soporta JSON), mediante el paso de mensajes `tools` en la plantilla de chat.
- Automatizacion multi-paso y flujos de agente, con recomendacion de `preserve_thinking=true` para retener razonamiento entre turnos en tareas agenticas.
- Razonamiento general y matematicas: GPQA Diamond 89,5 y AIME 2026 95,2 segun la ficha del modelo original.
- Tareas profesionales de oficina/cowork (Automation Bench 54,2 en la ficha original).
- Ventana de contexto teorica de 512K tokens (no demostrada en esta cuantizacion con 24 GB).

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede operar en pipelines tipo SWE-Bench, ejecutando comandos de terminal, editando archivos y verificando tests; su puntuacion de 60,3 en SWE-Bench Pro y 80,9 en Terminal-Bench 2.1 lo respaldan para este escenario.
- Agentes de terminal y DevOps: con tool calling en formato XML y razonamiento preservado multi-turno, puede integrarse en flujos de automatizacion de infraestructura, despliegues y diagnostico de fallos.
- Asistente de programacion local y privado: al caber en una RTX 4090 con ExLlamaV3/TabbyAPI, permite autocompletado y refactorizacion de codigo sin enviar codigo propietario a APIs externas.
- Chatbots conversacionales con razonamiento: con `preserve_thinking=false` para chat ordinario, ofrece respuestas con cadena de razonamiento interna activable, util en soporte tecnico de segundo nivel.
- Automatizacion de tareas de oficina: generacion y procesamiento de documentos, flujos de trabajo profesionales multi-paso con herramientas externas.
- Generacion de modelos derivados por destilacion: su rol de teacher agent lo hace adecuado como generador de trayectorias agénticas para entrenar modelos mas pequeños.
- Razonamiento matematico y cientifico: con 89,5 en GPQA Diamond y 95,2 en AIME 2026, es apto para asistentes de resolucion de problemas de nivel competitivo y consultas tecnicas de grado cientifico.

## Benchmarks y rendimiento

Resultados publicados por el Nanbeige Team para el modelo original (con high thinking effort), no reproducidos como comparativa BF16 frente a EXL3:

| Benchmark | Nanbeige4.3-33B (original) |
|---|---:|
| Terminal-Bench 2.1 | 80,9 |
| DeepSWE | 65,5 |
| SWE-Bench Pro | 60,3 |
| Toolathlon-Verified | 70,4 |
| Automation Bench | 54,2 |
| GPQA Diamond | 89,5 |
| AIME 2026 | 95,2 |

Mediciones propias de esta cuantizacion EXL3 (en una RTX 4090, contexto 36.864 tokens, KV Q4, batch 1):

| Metrica | Valor |
|---|---:|
| Sixcat v0.8.3 estricto (20 tests de codigo, thinking ON) | 104/120 = 86,67% |
| Velocidad de generacion ExLlamaV3 | 33,82 tokens/s (ponderado por token, 107 peticiones largas) |

## Requisitos de hardware

- VRAM para inferencia: 18,35 GiB solo en pesos (excluye KV cache y overhead del runtime); 24 GiB es un punto de partida practico, sin garantia de caber. Contexto maximo demostrado: 36.864 tokens con KV cache Q4 en 24 GB.
- GPU de referencia: NVIDIA RTX 4090 (24 GB), unica configuracion con mediciones publicadas. El modelo no es exclusivo de la 4090, pero no hay datos para otras GPUs.
- Consumer GPU: cabe en una RTX 4090 de 24 GB; en GPUs de 16 GB no es viable con esta cuantizacion. No hay datos para RTX 3090 u otras, aunque 24 GB de VRAM es el requisito practico.
- Motor de inferencia: ExLlamaV3 (se uso un commit de desarrollo local `61cfd2c` no confirmado como publicamente descargable en el momento de la release; verificar el runtime antes de asumir paridad de benchmarks) y TabbyAPI con parser de herramientas `qwen3_coder`.
- No soportado de forma automatica: multi-GPU sharding, ejecucion solo en CPU y runtimes no CUDA. Formato EXL3, no compatible con llama.cpp/Ollama ni con Transformers en BF16 (para eso, usar el modelo base).
- Rendimiento medido: 33,82 tokens/s en generacion larga en RTX 4090; latencia y throughput en otras configuraciones: no disponible.
- Configuracion de muestreo sugerida por los autores del modelo base: temperature 1,0 / top_p 0,95 para flujos agenticos con herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (EXL3 4,5 bpw) | ~33,1B (denso) | Llama-style, GQA | 512K (teorico) | Apache-2.0 | Publico, sin gating |
| Qwen3-32B | ~32,8B (denso) | Qwen transformer | 128K (con YaRN) | Apache-2.0 | Publico, sin gating |
| Qwen2.5-Coder-32B-Instruct | ~32,5B (denso) | Qwen transformer | 128K | Apache-2.0 | Publico, sin gating |
| Devstral Small 2507 (24B) | ~24B (denso) | Mistral transformer | 128K | Apache-2.0 | Publico, sin gating |

Nanbeige4.3-33B se diferencia de Qwen3-32B por su foco explicito en codigo agéntico y automatizacion multi-paso (con benchmarks de terminal y SWE publicados) y por su ventana de contexto teorica de 512K, muy superior a los 128K de la competencia. Frente a Devstral Small, ofrece mas parametros y mejores cifras publicadas en tareas agenticas, a costa de un requisito de VRAM mayor (24 GB frente a ~14-16 GB cuantizado). No hay benchmarks comparativos directos publicados entre estos modelos en la informacion disponible, por lo que la comparacion se limita a especificaciones.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- Los benchmarks publicados corresponden al modelo original en BF16 con configuraciones especificas de harness (`preserve_thinking=true`, high thinking effort); no se ha verificado que la cuantizacion EXL3 a 4,5 bpw preserve esas puntuaciones.
- La ventana de 512K tokens es teorica: con 24 GB de VRAM solo se ha demostrado 36.864 tokens con KV cache Q4.
- El motor ExLlamaV3 usado en las mediciones era un commit de desarrollo no confirmado como publicamente disponible; despliegues nuevos deben verificar el comportamiento.
- Riesgo de alucinacion: no documentado especificamente para este modelo; como en cualquier LLM, verificar salidas en flujos agenticos con acceso a terminal y herramientas, donde errores pueden tener efectos reales.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache-2.0 sin restricciones de uso comercial, pero se debe preservar la atribucion y la nota de licencia.
- Usar la plantilla de chat nativa de Nanbeige: formatos genericos de Llama/Qwen pueden alterar el comportamiento del modelo, especialmente en tool calling.
- La configuracion de muestreo publicada esta optimizada para el modelo base, no para esta cuantizacion EXL3.

## Enlaces

- Cuantizacion EXL3: https://huggingface.co/vcruz305/Nanbeige4.3-33B-SAGE-EXL3-4.50bpw
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Receta de cuantizacion e inferencia (GitHub): https://github.com/vcruz305/Nanbeige4.3-33B-SAGE-EXL3-recipe
- Autor de la cuantizacion: https://huggingface.co/vcruz305
- Tabla de benchmarks original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B#2-model-performance
