# wingman-llc/WINGMAN-OPENW.2.6-4B

## Resumen
WINGMAN-OPENW.2.6-4B es un modelo de lenguaje compacto de 4.000 millones de parámetros desarrollado por Wingman LLC, orientado específicamente a tareas de ingeniería de software, function calling y flujos agénticos (uso de herramientas MCP y navegación web). Se distribuye exclusivamente en formato GGUF cuantizado a Q4_1, con un tamaño de repositorio de 2,6 GB, lo que lo sitúa en el rango de modelos ejecutables en hardware de consumo.

El modelo se posiciona como una alternativa pequeña pero especializada frente a modelos mayores como Qwen3.5-9B o Gemma4-12B, y según la model card del autor obtiene mejores resultados en benchmarks de código (SWE Pro), llamada de funciones (BFCL-V4), uso de herramientas MCP (MCP-Atlas) y navegación web (BrowseComp). Su propuesta de valor es ofrecer capacidades agénticas y de coding en local, sin depender de infraestructura en la nube.

La información pública disponible es limitada: la model card no detalla la arquitectura interna, el volumen de datos de entrenamiento ni el proceso de alineación. Los datos de rendimiento proceden exclusivamente de la tabla publicada por el autor y no se han verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 4B parámetros, sin detalle en la model card) |
| Parametros totales | 4B (según nombre del modelo; no se detalla la cifra exacta) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de la model card usan `-c 8192` |
| Tipos de cuantizacion | Q4_1 (único archivo publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La model card no especifica la arquitectura interna del modelo más allá de tratarse de un modelo de 4B parámetros para generación de texto. No se indica si emplea atención estándar, atención lineal, arquitectura híbrida o mezcla de expertos, ni se detalla la composición del dataset de entrenamiento, el número de tokens utilizados o si hubo fases de RLHF, DPO u otro tipo de alineación.

La única innovación técnica documentada es de despliegue: el modelo incluye una plantilla de chat integrada que debe activarse con el flag `--jinja` en llama.cpp, lo que facilita su uso como servidor compatible con la API de OpenAI (`llama-server`) y como chat interactivo (`llama-cli`). No se documentan técnicas como decodificación especulativa o modos de razonamiento explícitos.

## Capacidades
- Generación de texto y razonamiento general en inglés.
- Programación y tareas de ingeniería de software (el foco principal declarado del modelo).
- Function calling y tool calling, con resultados destacados en BFCL-V4.
- Uso de herramientas mediante el protocolo MCP (MCP-Atlas).
- Flujos agénticos multi-paso y tareas de agente general (τ³-bench).
- Navegación web como agente (BrowseComp).
- Asistencia personal en tareas agénticas (PAgentBench).
- Razonamiento de conocimiento experto con uso de herramientas (HLE con tools).
- Razonamiento sobre contextos largos (AA-LCRv1.1).
- Multilingüe: no disponible; la model card declara únicamente inglés.

## Casos de uso
- Autocompletado y generación de código en local: el modelo puede integrarse en editores o pipelines de CI/CD para sugerir funciones, refactorizar y generar tests, ejecutándose en una estación de trabajo sin GPU dedicada gracias a su cuantización Q4_1.
- Agentes de ingeniería de software: con una puntuación de 54,3 en SWE Pro, es adecuado para tareas de resolución de issues, parcheo de código y navegación de repositorios dentro de un agente automatizado.
- Integración de herramientas MCP: sirve como motor de un agente que invoca servidores MCP para consultar APIs, bases de datos o servicios externos, con un 62,4 en MCP-Atlas.
- Asistente personal agéntico: puede gestionar tareas multi-paso del día a día (consultas, organización, llamadas a herramientas) con un 74,1 en PAgentBench, desplegado en local para preservar la privacidad.
- Agente de navegación web: con 53,1 en BrowseComp, puede utilizarse para automatizar la extracción de información de páginas web dentro de un pipeline de scraping inteligente.
- Servidor compatible con OpenAI en local: mediante `llama-server` con `--jinja`, se puede exponer un endpoint `/v1/chat/completions` para prototipar aplicaciones que luego migren a modelos mayores sin cambiar el código cliente.
- Function calling en asistentes de dominio: con 71,8 en BFCL-V4, es apto para asistentes que deban decidir qué función invocar y con qué argumentos en aplicaciones de negocio.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (mayor es mejor):

| Benchmark | Enfoque | WINGMAN-OPENW.2.6-4B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B | Gemma4-F4B |
|---|---|---:|---:|---:|---:|---:|
| SWE Pro | Ingeniería de software | 54,3 | 33,8 | 29,4 | 21,9 | 4,0 |
| BFCL-V4 | Function calling | 71,8 | 66,1 | 50,3 | 37,4 | 47,0 |
| τ³-bench | Agente general | 34,7 | 9,3 | 6,7 | 13,3 | 10,1 |
| MCP-Atlas | Uso de herramientas MCP | 62,4 | 47,4 | 40,8 | 30,5 | 15,0 |
| BrowseComp | Navegación web | 53,1 | 8,3 | 14,3 | 10,0 | 8,3 |
| PAgentBench | Asistente personal | 74,1 | 53,8 | 51,4 | 51,8 | 37,0 |
| HLE (con tools) | Conocimiento experto | 36,9 | 17,9 | 20,2 | 19,0 | 10,1 |
| AA-LCRv1.1 | Razonamiento de contexto largo | 67,3 | 70,0 | 63,0 | 63,7 | 32,0 |

El modelo lidera en siete de las ocho métricas; Qwen3.5-9B lo supera únicamente en AA-LCRv1.1 (70,0 frente a 67,3). No se han publicado resultados independientes que verifiquen estas cifras.

## Requisitos de hardware
- VRAM estimada: el archivo Q4_1 ocupa aproximadamente 2,6 GB, por lo que la inferencia requiere en torno a 3-4 GB de memoria considerando el contexto (8.192 tokens en los ejemplos del autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM efectiva; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores pueden ejecutarlo con todas las capas en GPU (`-ngl 99`). También es viable en A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM; también puede ejecutarse solo en CPU eliminando `-ngl 99`.
- Opciones de despliegue: llama.cpp (`llama-server` para servidor compatible con OpenAI, `llama-cli` para chat interactivo). No se documentan otros motores como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE Pro | BFCL-V4 | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| WINGMAN-OPENW.2.6-4B | 4B | no disponible (ejemplos a 8K) | 54,3 | 71,8 | Apache-2.0 | GGUF Q4_1 |
| Qwen3.5-4B | 4B | no disponible | 29,4 | 50,3 | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | 33,8 | 66,1 | no disponible | no disponible |
| Gemma4-12B | 12B | no disponible | 21,9 | 37,4 | no disponible | no disponible |

Según los datos del autor, WINGMAN-OPENW.2.6-4B supera a modelos de mayor tamaño en tareas de código, function calling y agentes, con la ventaja adicional de su licencia Apache-2.0 y su distribución en GGUF lista para ejecución local.

## Limitaciones y advertencias
- Al ser un modelo de 4B parámetros, puede cometer errores factuales; el autor recomienda verificar las salidas importantes y revisar el código generado antes de ejecutarlo.
- Solo soporta inglés según la model card; no se declara soporte para castellano ni otros idiomas.
- La longitud de contexto oficial no está documentada; los ejemplos usan 8.192 tokens, pero no se confirma el máximo real.
- Los benchmarks proceden únicamente del autor y no han sido verificados de forma independiente; deben interpretarse con cautela.
- Solo se publica una cuantización (Q4_1); no hay versiones FP16, Q8 u otras para quienes necesiten mayor fidelidad numérica.
- No se documenta la arquitectura, el proceso de entrenamiento ni la alineación, lo que dificulta evaluar sesgos conocidos o riesgos específicos.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento y de la validación del modelo en su dominio.

## Enlaces
- Hugging Face: https://huggingface.co/wingman-llc/WINGMAN-OPENW.2.6-4B
- Página del autor en Hugging Face: https://huggingface.co/wingmanllc
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
