# SunZhengda/lg-decision-27B

## Resumen

lg-decision-27B es un modelo de lenguaje de 27.356 millones de parámetros derivado por ajuste fino (fine-tuning) de Qwen/Qwen3.8-27B, publicado por el usuario SunZhengda. No es un modelo generativo conversacional al uso: está especializado en tareas de decisión estructurada, es decir, clasificación, elección múltiple, reranking de recuperación y selección de herramientas. Cada petición transporta un estado (texto o JSON) y una o varias preguntas tipadas con nombre, y el modelo devuelve, para cada pregunta, una distribución de probabilidad sobre opciones, un valor de probabilidad para preguntas de sí/no o una distribución sobre una escala ordenada con nivel esperado.

Técnicamente se apoya en la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer de 64 capas que combina 16 capas de atención completa con 48 capas de atención lineal, con pesos en bf16 repartidos en dos shards de safetensors (54,7 GB de tensores). El modelo se sirve mediante un servidor propio incluido en el repositorio (`simple-jev`) que expone el endpoint `/v1/systemone`, consumido por el kit Decision Index.

Su relevancia actual radica en que empaqueta el comportamiento de un modelo grande en una interfaz de decisión tipada y probabilística, lo que permite integrar decisiones auditables (con confianza por opción) en pipelines de automatización sin depender de parseo de texto libre. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está pensado exclusivamente para texto y JSON, sin visión ni audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer híbrido: 64 capas, 16 de atención completa y 48 de atención lineal) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 32.768 tokens por rama (configuración por defecto de `start_server.sh`); las peticiones más largas se rechazan con HTTP 422, no se truncan |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, dos shards, 54.713.457.120 bytes de tensores) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva su arquitectura `Qwen3_5ForConditionalGeneration`, un transformer de 64 capas en el que 16 capas usan atención completa y 48 usan atención lineal. Esta combinación reduce el coste computacional en contextos largos manteniendo capacidad de atención global en un subconjunto de capas. Los pesos se distribuyen en dos ficheros safetensors en bf16, con un total de 54,7 GB de tensores.

El ajuste fino orienta el modelo a tareas de decisión: cada pregunta se evalúa como una rama que comparte toda la petición como prefijo, de modo que el servidor calcula directamente distribuciones de probabilidad sobre opciones nombradas, sobre sí/no o sobre escalas ordenadas, en lugar de generar texto libre. El prompt es una política fija (`PROMPT_POLICY=baseline`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El entorno probado es Python 3.12.13, PyTorch 2.10.0+cu129, transformers 5.20.2 y una GPU NVIDIA H200.

## Capacidades

- Clasificación con opciones nombradas: devuelve una probabilidad por opción, la opción más probable (`choice`) y su confianza.
- Preguntas de sí/no (`noul`): devuelve la probabilidad de que la respuesta sea afirmativa.
- Puntuación en escala ordenada (`score`): devuelve una probabilidad por nivel, el nivel esperado y la probabilidad del nivel más probable, con un `legend` que mapea niveles a etiquetas.
- Elección múltiple y reranking de recuperación (retrieval reranking).
- Selección de herramientas (tool selection) dentro de flujos de automatización.
- Procesamiento de estado en texto plano o JSON.
- Servicio mediante API HTTP con el endpoint `/v1/systemone` del servidor incluido `simple-jev`.
- Sin capacidades multimodales: solo texto y JSON, pese a que la etiqueta del repositorio incluya `image-text-to-text`.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Triaje de soporte al cliente: el modelo recibe la descripción de una incidencia y devuelve la acción recomendada (reemplazo, reembolso, reparación) con su probabilidad, además de la urgencia en escala ordenada, como muestra el ejemplo de la model card.
- Enrutamiento de tickets: clasificación de peticiones entrantes en categorías predefinidas con confianza por categoría, útil para decidir cuándo escalar a un humano si la confianza es baja.
- Reranking en pipelines RAG: dado un estado con la consulta y candidatos, el modelo puntúa cada opción para reordenar resultados de recuperación antes de pasarlos al generador.
- Selección de herramientas en agentes: elección de la función o API adecuada entre un conjunto nombrado, con probabilidad por herramienta, para orquestadores que necesitan decisiones auditables.
- Moderación y verificación binaria: preguntas de sí/no sobre si un contenido cumple una política, con la probabilidad asociada como umbral configurable.
- Encuestas y anotación asistida: asignación de etiquetas en escalas ordenadas (por ejemplo, satisfacción de baja a alta) con nivel esperado, útil para agregar resultados numéricos.
- Automatización de back office: clasificación de documentos JSON estructurados (pedidos, reclamaciones) en decisiones tipadas dentro de flujos de negocio.

## Benchmarks y rendimiento

Resultados de la ejecución propia del autor sobre la suite pública Decision Index 0.3 (no es un resultado de leaderboard):

| Métrica | Valor |
|---|---:|
| Índice público | 82,83 |
| Balanced raw | 86,37 |
| Breadth | 82,60 |
| Peticiones | 140.620 (140.209 correctas, 411 errores) |
| Filas puntuadas | 140.178 (`complete: true`) |

| Área | Skill | Raw | Cobertura | Benchmarks |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 0,7454 | 0,7856 | 1,0000 | 11 |
| Language Understanding | 0,8776 | 0,9113 | 1,0000 | 9 |
| Retrieval & Classification | 0,8057 | 0,8389 | 0,9967 | 6 |
| Tools & Automation | 0,9196 | 0,9304 | 0,9976 | 5 |
| Arts & Human Taste | 0,7932 | 0,8708 | 1,0000 | 6 |

Los 411 errores corresponden a rechazos HTTP 422 de peticiones cuya rama individual superaba los 32.768 tokens (ToolRet 320, BRIGHT 91) y no se reintentaron.

Latencia en 1× H200 (muestra estratificada de 100 filas de la suite pública, en caliente, un proceso de servidor y ajustes por defecto de `start_server.sh`):

| Ponderación | Mediana | Media | p80 |
|---|---:|---:|---:|
| Ponderada por suite | 204 ms | 481 ms | 522 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 54,7 GB, por lo que se necesita una GPU con al menos 64 GB de memoria (o más para margen de activaciones y contexto).
- GPU recomendadas: el autor ha probado con 1× NVIDIA H200; por tamaño de memoria son adecuadas A100 80 GB, H100 80 GB y H200.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB (RTX 4090) ni de 32 GB en bf16; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: servidor propio incluido `simple-jev` basado en transformers, con `start_server.sh` y endpoint `/v1/systemone`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Versiones requeridas: PyTorch 2.10.0+cu129, transformers 5.20.2, accelerate 1.15.0, pydantic 2.12.3, fastapi 0.135.1, uvicorn 0.41.0 y numpy 1.26.4.
- Latencia: mediana de 204 ms y media de 481 ms por petición en la muestra medida sobre H200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lg-decision-27B | 27,36 B | 32.768 tokens por rama | Decisiones tipadas con probabilidades | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27 B (según modelo base) | no disponible | Generación de texto general | no disponible | Hugging Face |
| Alternativas de clasificación especializada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo procesa texto y JSON; no admite imágenes ni audio, a pesar de la etiqueta `image-text-to-text` del repositorio.
- Las peticiones con una rama superior a 32.768 tokens se rechazan con HTTP 422 en lugar de truncarse, lo que puede romper flujos con entradas largas.
- No se documentan los idiomas soportados; no hay garantía de rendimiento multilingüe.
- No se detallan sesgos conocidos ni tasas de alucinación; al ser un modelo de clasificación probabilística, las confianzas deben calibrarse en el dominio de uso.
- Dependencia estricta de versiones concretas de transformers, accelerate y PyTorch; otras versiones pueden no funcionar.
- El servidor incluido es el único mecanismo de despliegue documentado, sin soporte declarado para motores de inferencia estándar.
- Los resultados de Decision Index son una ejecución propia del autor, no una evaluación independiente ni de leaderboard.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de un uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SunZhengda/lg-decision-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset con resultados de Decision Index: https://huggingface.co/datasets/SunZhengda/lg-decision-27B-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
