# Sup2Doggie/Vectorite-Flash-1.7B

## Resumen

Vectorite Flash es un ajuste fino (fine-tuning) de tipo LoRA sobre el modelo denso Qwen3-1.7B, publicado por el usuario Sup2Doggie bajo la marca Vectorite AI. Se presenta como un asistente bilingue en bahasa indonesio (id) e ingles (en), orientado a conversacion general, y su proposito declarado es dotar al modelo base de una identidad y un estilo de respuesta propios de Vectorite, no de mejorar su capacidad de razonamiento. El repositorio tiene 1.720.574.976 parametros (aproximadamente 1,7 mil millones) y ocupa 3,5 GB, lo que corresponde a pesos en precision completa (safetensors).

Se trata de un modelo pequeno, pensado para ejecucion local o en entornos con recursos limitados. La model card reconoce explicitamente que el ajuste no incrementa la inteligencia del modelo: los conocimientos generales son los del Qwen3-1.7B original y el cambio se limita a identidad y estilo. Esto lo situa en la categoria de "asistente personalizado ligero" mas que en la de modelo de razonamiento.

Su relevancia actual es limitada: el repositorio acumula 0 descargas y 0 "likes", y no se han publicado resultados de benchmarks. Resulta util principalmente como ejemplo de pipeline de fine-tuning con Unsloth sobre Qwen3 para crear asistentes bilingues de nicho, o como base para nuevos ajustes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card del ajuste; el modelo base Qwen3-1.7B declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | safetensors en el repo principal; version GGUF en repositorio separado, con cuantizaciones concretas no detalladas |
| Idiomas soportados | indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo Sup2Doggie/Vectorite-Flash-1.7B-GGUF) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B: un transformer decoder-only denso con atencion por causalidad, sin mezcla de expertos ni componentes de estado recurrente. No se introducen modificaciones estructurales; el ajuste se aplica como adaptador LoRA, por lo que los pesos finales publicados son el resultado de fusionar el adaptador con el modelo base (el repositorio contiene safetensors con 1.720.574.976 parametros, sin adaptadores separados).

El entrenamiento se realizo con Unsloth durante 1 epoca sobre una mezcla de tres fuentes: conversaciones de identidad de Vectorite, UltraChat (en ingles) y Aya (en indonesio). No se especifican el numero total de tokens, la composicion porcentual del dataset, la tasa de aprendizaje ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El propio autor senala que el ajuste "cambio su identidad y su estilo, no su inteligencia", lo que indica un entrenamiento orientado a formato y tono mas que a capacidades.

## Capacidades

- Generacion de texto conversacional en indonesio e ingles, con un estilo e identidad propios de Vectorite.
- Respuesta a instrucciones y dialogos multi-turno, heredados de las capacidades del Qwen3-1.7B base.
- Generacion de codigo y resolucion de problemas matematicos basicos: solo en la medida en que el modelo base los soporte, sin mejora aportada por el ajuste.
- Capacidades multilingues limitadas a los dos idiomas declarados (id, en); no se garantiza un rendimiento solido en otras lenguas.
- No hay evidencia de soporte de tool calling, function calling ni de modo de razonamiento explicito (thinking mode) en la informacion disponible.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No dispone de acceso a internet ni de herramientas externas por si mismo.

## Casos de uso

- Asistente conversacional bilingue id/en para atencioD al cliente: el modelo puede mantener dialogos multi-turno en ambos idiomas y adoptar un tono de marca consistente, aprovechando la ventana de contexto heredada del modelo base.
- Despliegue en local o en el borde (edge): con unos 3,5 GB de pesos en precision completa y menos de 2 GB cuantizado, cabe en equipos de consumo y permite inferencia sin conexion.
- Prototipado rapido de asistentes de marca: sirve como plantilla para equipos que quieran replicar el pipeline LoRA + Unsloth y sustituir el dataset de identidad por el de su propia organizacion.
- Traduccion y reformulacion id <-> en en pipelines internos: util como componente ligero en flujos de preprocesado o normalizacion de texto entre ambos idiomas.
- Clasificacion y resumen de textos cortos en indonesio e ingles, integrado en tareas de moderacion o triaje de tickets donde no se requiera razonamiento profundo.
- Generacion de respuestas para chatbots de comunidad o soporte en la plataforma Vectorite Space, escenario para el que el autor publico la version GGUF.
- Base para un segundo ajuste especifico de dominio: al ser un modelo pequeno y con licencia Apache 2.0, resulta barato reentrenar con LoRA para verticales concretas (legal, sanitario, e-commerce) en indonesio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de busqueda web no aportan datos de rendimiento para este modelo. Cualquier cifra que se quiera usar en produccion deberia medirse directamente sobre el caso de uso concreto.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del numero de parametros (1,72 B) y no proceden de mediciones publicadas por el autor.

| Precision | VRAM estimada (pesos + overhead de inferencia) |
|---|---|
| bf16 / fp16 (safetensors) | ~4-5 GB |
| 8 bits | ~2,5-3 GB |
| GGUF Q4_K_M | ~1,5-2 GB |

- Cabe en GPU de consumo: si, con holgura en tarjetas de 6 GB o mas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, etc.).
- Inferencia en CPU: viable gracias a los pesos GGUF, con velocidades de decodificacion inferiores a las de GPU.
- GPU de datacenter (A100, H100, L40S): compatibles, aunque sobredimensionadas para un modelo de 1,7 B; tendrian sentido solo para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp, Ollama y LM Studio (estos dos ultimos a traves del repositorio GGUF). Unsloth es relevante para reentrenamiento, no para servir.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Vectorite-Flash-1.7B | ~1,7 B | no especificado en el ajuste; 32.768 tokens en el base | id, en | Apache 2.0 | 0 descargas, sin benchmarks, ajuste de identidad y estilo |
| Qwen/Qwen3-1.7B (base) | ~1,7 B | 32.768 tokens (segun documentacion del base) | multilingue amplio | Apache 2.0 | Modelo original; el ajuste no mejora sus capacidades tecnicas |
| Otros ajustes bilingues de ~1-2 B | no disponible | no disponible | no disponible | no disponible | No hay datos publicos que permitan una comparacion directa con este modelo |

No se dispone de resultados de evaluacion que permitan comparar Vectorite Flash con alternativas de la misma categoria mas alla de la equivalencia estructural con su modelo base.

## Limitaciones y advertencias

- Modelo pequeno: el autor advierte explicitamente de que puede equivocarse y de que su conocimiento general es identico al del modelo base. El ajuste cambio identidad y estilo, no la inteligencia.
- Riesgo de alucinacion: inherente a un modelo de 1,7 B sin acceso a internet ni a herramientas de verificacion; no debe usarse como fuente de hechos sin supervision.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, sesgos o robustez.
- Cobertura idiomatica limitada a indonesio e ingles; el rendimiento en castellano u otras lenguas no esta garantizado.
- Sin soporte documentado de tool calling, agentes o multi-step reasoning, lo que restringe su uso en pipelines automatizados complejos.
- Adopcion nula (0 descargas, 0 likes) y mantenimiento incierto: conviene verificar la vigencia del repositorio antes de integrarlo.
- Los metadatos indican fecha de creacion 30/09/2026 y ultima actualizacion el mismo dia; la fecha es atipica y deberia confirmarse.
- Licencia Apache 2.0: permite uso comercial y modificaciones, siempre citando la licencia y el aviso de copyright. El uso de la identidad de marca "Vectorite" no esta cubierto por la licencia del modelo.
- No se documentan sesgos especificos ni evaluaciones de seguridad; el dataset incluye UltraChat y Aya, cuyas caracteristicas de filtrado no se detallan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sup2Doggie/Vectorite-Flash-1.7B
- Version GGUF: https://huggingface.co/Sup2Doggie/Vectorite-Flash-1.7B-GGUF
- Perfil del autor: https://huggingface.co/Sup2Doggie
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Nota: los resultados de busqueda web disponibles no incluyen papers, blogs ni demos especificos de este modelo; el resto de enlaces devueltos (Google Gemini, Models.dev) no guardan relacion con Vectorite Flash.
