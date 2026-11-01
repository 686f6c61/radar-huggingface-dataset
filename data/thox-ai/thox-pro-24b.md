# Thox-ai/thox-pro-24b

## Resumen

Thox-pro-24b es una distribución configurada y empaquetada por Thox-ai del modelo Devstral-Small-2-24B-Instruct-2512 de Mistral AI, orientada a ingeniería de software local con flujos agénticos, function calling y uso de herramientas. No se trata de un modelo entrenado por Thox-ai: según la propia model card, los pesos son byte-idénticos a los de la distribución Ollama del proveedor upstream (verificado por SHA-256 en la revisión del 31 de octubre de 2026), y el trabajo de Thox-ai se limita a la configuración de runtime, la documentación y la capa de clustering MeshStack/MagStack. El modelo base tiene 24 000 millones de parámetros y una ventana de contexto de 384 000 tokens.

La relevancia de esta ficha radica en que documenta una práctica creciente en el ecosistema open source: la redistribución de pesos ajenos bajo una configuración propia, con licencia Apache 2.0 heredada del upstream. La model card incluye una nota de corrección explícita que retira afirmaciones previas sobre cumplimiento ITAR, cifras de ahorro económico y una licencia MIT que Thox-ai no podía conceder sobre los pesos de Mistral. Es importante que cualquier evaluador lea esa nota antes de considerar el modelo para producción.

El pipeline declarado es image-text-to-text y el único idioma listado es el inglés, aunque el modelo base se asocia a más de 30 lenguajes de programación. La build ejecutable se distribuye vía Ollama con cuantización Q4_K_M en formato GGUF, con un tamaño de descarga de aproximadamente 15 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Devstral Small 2 24B; detalles específicos no disponibles en la información proporcionada) |
| Parámetros totales | 24B |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 384 000 tokens |
| Tipos de cuantización | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (etiqueta de idioma del repo); 30+ lenguajes de programación según el registro del modelo base |
| Licencia | Apache 2.0 (términos upstream de Mistral AI; Thox-ai no puede relicenciar los pesos) |
| Formato de pesos | GGUF (distribución Ollama); safetensors no disponible en este repo |
| Pipeline | image-text-to-text |
| Tamaño de descarga | ~15 GB (listado de Ollama) |
| Modelo base | mistralai/Devstral-Small-2-24B-Instruct-2512 |
| Fecha de creación | 2026-10-31 |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base de Mistral AI, Devstral-Small-2-24B-Instruct-2512. La información proporcionada no detalla la arquitectura interna (tipo de atención, número de capas, cabezas, etc.) más allá de que es un transformer de 24B con 384 000 tokens de contexto. Thox-ai declara explícitamente que no ha realizado ningún fine-tuning, no ha añadido datasets ni ha ejecutado un procedimiento de entrenamiento propio: los pesos son los del upstream, verificados por hash SHA-256 contra la distribución Ollama de Mistral.

En consecuencia, los datos de entrenamiento, la composición del dataset, las fases de RLHF/DPO y cualquier innovación técnica del modelo (por ejemplo, estrategias de atención o decodificación) son las del modelo base y deben consultarse en su model card original. Thox-ai no reclama ninguna innovación en los pesos; su aportación se sitúa en la capa de configuración, el empaquetado para Ollama y la integración con MeshStack, su tecnología de clustering dispositivo-a-dispositivo basada en pines magnéticos MagStack.

## Capacidades

- Generación de código en más de 30 lenguajes de programación, según el registro del modelo base.
- Razonamiento multi-paso orientado a tareas de ingeniería de software.
- Function calling y uso de herramientas, con integración dependiente del runtime del operador.
- Flujos agénticos de terminal y git (el modelo base está entrenado para este tipo de entornos).
- Análisis a escala de repositorio dentro de la ventana de 384 000 tokens.
- Asistencia en refactorización multi-archivo y generación de tests automatizados.
- Capacidad de entrada de imagen según el pipeline declarado (image-text-to-text); no se detallan más especificaciones al respecto.
- Soporte de inglés como idioma natural principal; multilingüismo natural no confirmado en la información disponible.
- Inferencia local en un solo dispositivo mediante Ollama.

## Casos de uso

- Asistencia de desarrollo full-stack sobre código propietario: el modelo se ejecuta localmente vía Ollama, de modo que el código no sale de la infraestructura del operador, lo que lo hace adecuado para bases de código con requisitos de confidencialidad.
- Refactorización multi-archivo con revisión humana: la ventana de 384 000 tokens permite cargar varios ficheros y sus dependencias en una sola sesión, y el modelo propone cambios que el equipo revisa antes de fusionar.
- Generación de tests automatizados: se puede integrar en un paso de CI que, dado un módulo, produzca tests unitarios candidatos que luego pasan por la suite completa y revisión humana.
- Análisis de repositorio a escala: con contexto tan amplio, es viable indexar y consultar partes extensas de un monorepo para responder preguntas sobre arquitectura, dependencias o deuda técnica.
- Automatización de tareas de DevOps y terminal: el soporte de tool use y flujos de terminal permite construir agentes que ejecuten comandos acotados con permisos explícitos y supervisión.
- Despliegue en entornos de borde o sin conectividad: al distribuirse como GGUF de ~15 GB y ejecutarse con Ollama, encaja en estaciones de trabajo aisladas o en escenarios local-first donde no se permite enviar datos a la nube.
- Prototipado de agentes de código en investigación: sirve como base para experimentar con orquestación de herramientas sin depender de APIs externas, aunque sin garantías de rendimiento medidas por Thox-ai.

## Benchmarks y rendimiento

La model card reproduce cifras del modelo base reportadas por Mistral, no medidas por Thox-ai. La evaluación independiente de Thox-ai está pendiente según la propia card.

| Benchmark | Resultado | Atribución |
|---|---|---|
| SWE-Bench Verified | 65,8 % | Mistral (modelo base), no verificado por Thox-ai |
| Terminal Bench | 32,0 % | Mistral (modelo base), no verificado por Thox-ai |

No se han publicado resultados de benchmarks propios de esta distribución en la información disponible. No se dispone de datos de throughput, latencia ni concurrencia.

## Requisitos de hardware

- VRAM estimada: el artefacto distribuido es Q4_K_M de ~15 GB, por lo que se necesita al menos ~16 GB de VRAM o memoria unificada para cargarlo completo; cuantizaciones menores no están documentadas en esta ficha.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían poder alojar la build Q4_K_M; GPUs de datacenter tipo A100/H100 no son necesarias para esta cuantización, aunque no hay mediciones publicadas.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas con 24 GB o más; en tarjetas de 16 GB el margen es ajustado y depende del runtime y del contexto solicitado.
- Opciones de despliegue: Ollama es la vía oficial documentada (`ollama run Thox-ai/thox-pro-24b`). Otros runtimes (llama.cpp, vLLM, TGI) no están documentados para esta distribución; al ser GGUF, llama.cpp es compatible en principio, pero sin garantía del autor.
- Latencia y throughput: no disponibles. Thox-ai declara explícitamente que no reclama ninguna cifra de rendimiento para esta release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Distribución | Notas |
|---|---|---|---|---|---|
| Thox-ai/thox-pro-24b | 24B | 384 000 | Apache 2.0 (upstream) | Ollama / GGUF | Configuración de Devstral Small 2; sin fine-tuning propio |
| mistralai/Devstral-Small-2-24B-Instruct-2512 | 24B | 384 000 | Apache 2.0 | Pesos upstream | Modelo base original; benchmarks reportados por Mistral |
| Alternativas de código open source de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

La comparación relevante es contra el propio modelo base: thox-pro-24b no introduce cambios en los pesos, por lo que su rendimiento en tareas de código debería ser equivalente al de Devstral Small 2 24B en igualdad de cuantización y runtime. La diferencia práctica está en el empaquetado (Ollama) y en la capa de orquestación MeshStack, no en la calidad del modelo.

## Limitaciones y advertencias

- No es un modelo entrenado por Thox-ai: los pesos son de Mistral AI y cualquier mérito o defecto de entrenamiento corresponde al upstream.
- La model card contiene una nota de corrección que retira afirmaciones previas sobre cumplimiento ITAR, ahorros económicos y licencia MIT; trátese con cautela cualquier material antiguo que las repita.
- La licencia es Apache 2.0 según los términos upstream; Thox-ai no puede conceder términos distintos sobre los pesos de Mistral. Verificar la licencia del modelo base antes de uso comercial.
- Orientado a tareas de código, no a chat general; su uso como asistente conversacional general puede degradar la calidad.
- Las capacidades agénticas requieren integración de herramientas y un alcance de permisos bien definido; sin sandboxing, un agente con acceso a terminal es un riesgo de seguridad.
- El código generado requiere revisión humana y suite de tests completa antes de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de robustez para esta distribución.
- Idioma natural principal: inglés. El soporte multilingüe natural no está confirmado; solo se listan lenguajes de programación.
- Sin benchmarks, latencias ni métricas de throughput verificadas por el autor para esta release; la evaluación independiente está pendiente.
- El repositorio de HuggingFace contiene únicamente el fichero `.gitattributes` según la tabla de ficheros de la card; la build ejecutable se sirve desde Ollama, no desde este repo.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/Thox-ai/thox-pro-24b
- Build ejecutable en Ollama: https://ollama.com/Thox-ai/thox-pro-24b
- Modelo base: https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
- Sitio del proyecto Thox / campaña: https://thox.ai
