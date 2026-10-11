# vllm-sr/d3-lite

## Resumen

d3-lite es un modelo de decisión multimodal de 0,85B de parámetros desarrollado por el equipo de vLLM Semantic Router (vllm-sr), presentado como la base de la familia Decision 3.0. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado de entrada (texto plano o JSON, opcionalmente acompañado de una o varias imágenes) junto con un conjunto de preguntas y devuelve, en una sola llamada, una probabilidad para cada respuesta posible. Los tres tipos de pregunta soportados son elección entre opciones (choice), sí/no y puntuación en una escala (score).

El modelo parte de Qwen/Qwen3.5-0.8B, sobre el que se ha hecho un ajuste específico para tareas de clasificación y enrutado, e incorpora un encoder de visión de 0,10B parámetros sobre los 0,85B totales. Está publicado en HuggingFace bajo licencia Apache-2.0, con pesos en safetensors y código personalizado que requiere `trust_remote_code=True`. Su relevancia práctica está en el enrutado semántico: sustituye a un LLM generativo en tareas de decisión de bajísima latencia (mediana de 23,5 ms por petición de texto en una AMD Instinct MI325X), lo que permite clasificar, triar y enrutar tráfico dentro de un router semántico sin el coste de generar tokens.

El modelo reporta un Jev Decision Index 0.3.1 de 27,6 (35,6 en el conjunto público) y un índice de visión de 41,1, con mejoras declaradas de +15,1 puntos sobre su predecesor Decision 2.0 en la suite pública. Es, por tanto, un componente de infraestructura más que un asistente: un clasificador multimodal pequeño pensado para integrarse en pipelines de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atencion lineal (se menciona `flash-linear-attention`), derivada de Qwen/Qwen3.5-0.8B, con encoder de vision y cabezas de clasificacion para decision |
| Parametros totales | 852.985.920 (aproximadamente 0,85B), de los cuales 0,10B corresponden al encoder de vision |
| Parametros activos | No aplica (no es MoE; no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no se ofrecen versiones GGUF, AWQ, GPTQ ni cuantizaciones oficiales |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 1,7 GB, compatible con bf16 para el numero de parametros declarado) |

## Arquitectura y entrenamiento

d3-lite es un transformer derivado de Qwen/Qwen3.5-0.8B con capas de atención lineal, para las que el quickstart recomienda instalar `flash-linear-attention` como kernels rápidos opcionales en GPU. Sobre esa base se añade un encoder de visión de 0,10B parámetros que procesa cada imagen a una resolución de hasta 1,6 megapíxeles; las imágenes se colocan antes del texto de la petición y todas las preguntas del request las ven. El modelo no genera texto: cada pregunta se responde mediante su propio forward pass sobre la entrada y se devuelve una distribución de probabilidad sobre las opciones definidas.

La información publicada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras. Sí se describe el comportamiento funcional: un único método `system_one(state=..., questions=..., images=...)` que agrupa preguntas de tipo choice, sí/no y score en una sola llamada, aceptando imágenes como rutas locales, URL http(s), objetos PIL o data URLs en base64. La evaluación se realiza con el kit oficial Jev Decision Index 0.3.1, con datos de board de texto del 10-10-2026 y de visión del 09-10-2026.

## Capacidades

- Decision por eleccion multiple: clasifica la entrada en una de varias categorias definidas por el usuario mediante `criteria`, con una probabilidad por opcion.
- Decision booleana (si/no): responde preguntas cerradas sobre el estado de entrada (en el ejemplo de la model card, el identificador de tipo usado es `noul`).
- Puntuacion en escala: asigna la entrada a un nivel de una escala ordenada (por ejemplo, Routine / Soon / Today) con probabilidad por nivel.
- Multiples preguntas en una sola llamada: preguntas de los tres tipos sobre la misma entrada se responden juntas, cada una con su propio forward pass.
- Entrada de texto y JSON: el estado puede ser lenguaje natural o datos estructurados.
- Vision multimodal: acepta varias imagenes por peticion (PNG, JPEG, WebP) como rutas, URL, PIL o base64; cada pregunta ve todas las imagenes.
- Lectura de documentos: en los benchmarks publicados obtiene 90,9 en KIE (CORD+FUNSD), 72,1 en InfographicVQA y 68,9 en CharXiv, lo que indica capacidad de extraer informacion de recibos, facturas, infograficos y graficos.
- Sin generacion de texto: la salida es siempre un conjunto de probabilidades, no una respuesta redactada.
- No se declara soporte de tool calling, function calling, agentes ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Enrutado semantico en produccion: sustituir una llamada a un LLM generativo por d3-lite para decidir a que equipo, modelo o cola debe ir una peticion (por ejemplo, returns / billing / technical), con latencias de decenas de milisegundos frente a cientos o miles de un modelo generativo.
- Triage de tickets de soporte: combinar una pregunta de eleccion (departamento) con una de puntuacion (urgencia) y una booleana (¿adjunta recibo?) en una sola llamada, lo que reduce el coste por ticket al no generar texto.
- Clasificacion zero-shot de textos: el pipeline declarado (`zero-shot-classification`) permite etiquetar contenido sin entrenamiento adicional, definiendo las categorias en el campo `criteria` de cada pregunta.
- Verificacion documental multimodal: comprobar si un recibo o factura adjunta contiene un producto, una fecha o un importe concretos, apoyandose en el encoder de vision y en el rendimiento declarado en KIE (90,9 en CORD+FUNSD).
- Moderacion de contenido preliminar: usar preguntas booleanas y de eleccion para marcar contenido dudoso antes de enviarlo a un moderador humano o a un modelo mayor; conviene tener en cuenta el bajo resultado declarado en Hateful Memes (10,5).
- Extraccion de datos de infograficos y graficos: con 72,1 en InfographicVQA y 68,9 en CharXiv, puede responder preguntas concretas sobre figuras y documentos visuales densos sin generar texto libre.
- Prefiltro para agentes: actuar como primera etapa de un agente que decide si una peticion requiere multi-step reasoning, tool calling o vision antes de invocar el modelo grande.
- Evaluacion de accesibilidad o de calidad de interfaz: preguntas booleanas sobre capturas de pantalla (por ejemplo, presencia de un elemento) usando el modo de multiples imagenes.

## Benchmarks y rendimiento

Indice Jev Decision 0.3.1 (texto):

| Modelo | Jev Decision Index | Publico | Same-skill tests | New-domain tasks |
|---|---:|---:|---:|---:|
| d3-lite | 27,6 | 35,6 | 32,1 | 18,2 |
| jiwo 0.8B | 24,3 | 28,7 | 28,3 | 18,1 |
| EXAONE-4.0-1.2B-JEV v0.3 | 23,3 | 30,7 | 26,9 | 16,4 |
| OneJev 0.8B | 20,5 | 22,2 | 21,8 | 19,9 |
| JPT-0.8B Qwen3.5-0.8B LoRA | 18,7 | 19,4 | 17,8 | 22,0 |
| Decision 2.0 (0.8B) | 17,5 | 20,6 | 21,3 | 13,9 |

Indice Jev vision board 0.3.1:

| Modelo | Vision Index | Publico | Privado |
|---|---:|---:|---:|
| d3-lite | 41,1 | 46,5 | 35,6 |
| JPT-0.8B | 42,1 | 44,6 | 39,7 |
| OneJev 0.8B | 41,5 | 46,5 | 36,5 |
| Intern-Decision-0.8B | 36,3 | 39,0 | 33,7 |

Benchmarks publicos de vision de d3-lite († reconstruccion aproximada):

| Benchmark | d3-lite |
|---|---:|
| CV-Bench | 57,6 |
| BLINK | 34,8 |
| RealWorldQA | 35,4 |
| CharXiv † | 68,9 |
| InfographicVQA † | 72,1 |
| Mind2Web † | 46,0 |
| Winoground | 52,0 |
| KIE (CORD+FUNSD) † | 90,9 |
| Moderation (Hateful Memes) | 10,5 |
| R-Bench-M | 6,9 |
| MMMU-Pro vision | 9,5 |

Los datos son de la evaluacion interna del autor (los comparativos, del board en vivo; texto 10-10-2026, vision 09-10-2026). No se han publicado resultados de benchmarks de texto estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Pesos: el repositorio ocupa 1,7 GB en safetensors, coherente con 0,85B parametros en bf16.
- VRAM estimada para inferencia en bf16/fp16: en torno a 2 GB de pesos mas overhead de activaciones y del encoder de vision; un presupuesto practico de 3-4 GB es razonable.
- Cuantizacion: no hay versiones cuantizadas oficiales. Si se generasen, int8 requeriria aproximadamente 0,9 GB y int4 aproximadamente 0,5 GB, mas overhead.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090, etc.). Tambien es viable en CPU para cargas de baja concurrencia, aunque no se publican latencias de CPU.
- GPU de referencia en las mediciones del autor: una AMD Instinct MI325X, una peticion a la vez.
- Latencia declarada: mediana de 23,5 ms por peticion de texto y 60,7 ms por peticion con imagen en esa GPU.
- Throughput: no disponible.
- Despliegue: via `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` o mediante `transformers.pipeline("decision", ...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la ausencia de pesos GGUF descarta de entrada llama.cpp y Ollama.
- Dependencias del quickstart: `transformers==5.17.0`, torch, torchvision, pillow, safetensors, accelerate y, opcionalmente, `flash-linear-attention` para kernels de atencion lineal en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Jev Decision Index | Vision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-lite | 0,85B (0,10B vision) | No disponible | 27,6 | 41,1 | Apache-2.0 | HuggingFace (transformers, safetensors) |
| jiwo 0.8B | 0,8B | No disponible | 24,3 | No disponible | No disponible | No disponible en la informacion proporcionada |
| EXAONE-4.0-1.2B-JEV v0.3 | 1,2B | No disponible | 23,3 | No disponible | No disponible | No disponible en la informacion proporcionada |
| OneJev 0.8B | 0,8B | No disponible | 20,5 | 41,5 | No disponible | No disponible en la informacion proporcionada |
| Decision 2.0 | 0,8B | No disponible | 17,5 | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparativa se limita a los indices Jev publicados por el autor; no hay datos comparativos de contexto, licencia ni disponibilidad para las alternativas.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto ni razonamiento explicito. Solo devuelve probabilidades, por lo que no puede justificar una decision ni mantener una conversacion.
- Resultados bajos en varias tareas de vision: 10,5 en Moderation (Hateful Memes), 6,9 en R-Bench-M y 9,5 en MMMU-Pro vision. No es adecuado para moderacion, razonamiento multimodal complejo ni tareas de nivel MMMU.
- Rendimiento moderado en BLINK (34,8) y RealWorldQA (35,4), por debajo de lo deseable para comprension visual generalista.
- Riesgo de calibracion: al trabajar con probabilidades, una mala calibracion en dominios nuevos puede producir decisiones erroneas con alta confianza. Las New-domain tasks del autor son las mas bajas de la tabla (18,2), lo que sugiere degradacion fuera de las tareas conocidas.
- Idiomas: no se declara ningun idioma soportado. Dado el base Qwen, es probable cierto soporte multilingue, pero no esta verificado ni documentado.
- Longitud de contexto: no disponible, lo que impide planificar escenarios con documentos largos.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de atribucion y aviso de cambios.
- Codigo personalizado: el modelo requiere `trust_remote_code=True`; conviene auditar el codigo remoto antes de desplegarlo en produccion, ya que se ejecuta en el proceso de carga.
- Sesgos: no se publica ninguna evaluacion de sesgos ni de comportamiento etico. Al ser un clasificador de decision, los sesgos se manifiestan como decisiones sistematicamente sesgadas, que son mas dificiles de detectar que un sesgo en texto generado.
- Madurez: el repositorio no tiene descargas y solo un like en el momento de la consulta, con fecha de creacion de octubre de 2026; no hay historial de uso en produccion ni auditorias independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- vLLM (motor de inferencia): https://vllm.ai/
- Repositorio de vLLM en GitHub: https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
- Guia de instalacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/
