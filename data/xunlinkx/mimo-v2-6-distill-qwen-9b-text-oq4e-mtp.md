# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e-mtp es una cuantizacion de 4 bits en formato Apple MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario xunlinkx. El modelo original lo desarrolla Xiaomi MiMo y se construye mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por la propia Xiaomi, cubriendo codigo, tareas genericas de agente, codigo visual y ciberseguridad. Esta version concreta elimina la torre de vision y los ficheros de procesador multimodal, de modo que queda un modelo puramente de texto que ahorra aproximadamente 1,5 GB de memoria unificada.

La ficha resulta relevante porque combina tres elementos poco habituales en un mismo repositorio: cuantizacion oQ4 mejorada (oQ4e) con matriz de importancia estricta, decodificacion especulativa mediante una cabeza de prediccion multi-token (MTP) y licencia MIT. Segun el autor, activar `mtp_enabled` en oMLX aporta entre 1,4x y 1,6x mas velocidad de generacion de tokens en tareas de texto, con `mtp_num_draft_tokens` en 3.

Con 9.197.093.888 parametros (unos 9,2 B) y un repositorio de 5,8 GB, esta pensado para ejecutarse en equipos Apple Silicon con memoria unificada suficiente. No se han publicado en la informacion disponible la longitud de contexto, los idiomas soportados ni resultados de benchmarks de esta variante cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3.5, segun el tag `qwen3_5`); sin detalles oficiales adicionales en la informacion disponible |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 B, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afines (4-bit affine) con group size 64; esquema oQ4 mejorado (oQ4e) con computo en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo original) |
| Formato de pesos | safetensors en formato Apple MLX (`mlx`, `omlx`); incluye fichero adicional `model-mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un SFT de Qwen3.5-9B entrenado por Xiaomi MiMo sobre datos generados por MiMo, orientado a comportamiento agentico y publicado como punto de partida para investigacion abierta en RL agentico. Esta version no reentrena el modelo: aplica una cuantizacion oQ4 mejorada construida con oMLX, usando 128 muestras de calibracion con longitud de secuencia 512, cobertura estricta de la matriz de importancia (importance matrix), computo en BF16 y tamano de grupo 64. Los metadatos de cuantizacion son de 4 bits afines globales.

La innovacion practica del repositorio es la inclusion de una cabeza borrador de prediccion multi-token de 15 tensores (`model-mtp.safetensors`), injertada desde Qwen/Qwen3.5-9B. Al cargarse en oMLX con `mtp_enabled: true` y `mtp_num_draft_tokens: 3`, habilita decodificacion especulativa con una aceleracion declarada de 1,4x a 1,6x en la generacion de tokens. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO en el checkpoint original.

## Capacidades

- Generacion de texto conversacional en tareas de un solo turno y multiturno.
- Soporte de tool calling y function calling: la plantilla de chat oficial renderiza esquemas de funciones estilo OpenAI, segun la validacion del autor.
- Bloques de razonamiento (thinking blocks) soportados por la plantilla de chat.
- Capacidades agenticas heredadas del SFT original: tareas generales de agente, codigo y ciberseguridad.
- Decodificacion especulativa opcional mediante MTP para acelerar la inferencia.
- Ejecucion local en Apple Silicon a traves del runtime MLX / oMLX.
- Capacidad multimodal eliminada de forma deliberada: es un modelo exclusivamente de texto y no procesa imagenes ni audio en esta variante.
- Capacidades multilingues: no disponibles en la informacion consultada.

## Casos de uso

- Asistente de programacion en local sobre Mac: el modelo puede integrarse en editores o terminales mediante MLX y generar codigo con tool calling, aprovechando la aceleracion MTP para reducir la latencia por token en sesiones interactivas.
- Agentes con function calling en pipelines internos: su plantilla de chat compatible con esquemas de funciones estilo OpenAI permite conectarlo a herramientas externas (APIs, bases de datos, ejecucion de comandos) sin adaptaciones de formato.
- Investigacion en RL agentico: al ser un checkpoint SFT liberado explicitamente por Xiaomi como punto de partida para investigacion en aprendizaje por refuerzo, sirve para experimentar con recompensas verificables sobre tareas de codigo y agentes.
- Tareas de ciberseguridad asistida: el modelo original cubre ciberseguridad segun la documentacion de Xiaomi, por lo que puede emplearse en analisis de trazas, explicacion de vulnerabilidades o generacion de scripts de diagnostico en entornos controlados.
- Procesamiento de texto con privacidad estricta: al ejecutarse en local con 4 bits, permite tratar documentacion sensible sin enviar datos a servicios en la nube.
- Prototipado rapido de asistentes conversacionales: la cuantizacion de 5,8 GB facilita levantar demos en un portatil Apple Silicon con memoria unificada suficiente, evitando depender de GPU dedicada.
- Automatizacion de tareas multietapa: combinando razonamiento con tool calling, puede encadenar pasos (consulta, transformacion, validacion) en flujos de trabajo internos.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta calibracion, group size e importancia, lo que lo hace util como caso de estudio de oQ4e frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la aceleracion relativa de la decodificacion especulativa (entre 1,4x y 1,6x mas tokens por segundo con MTP activado), sin cifras absolutas de throughput ni resultados de tareas como MMLU, HumanEval o GSM8K. Las busquedas web mencionan la existencia de "Evaluation Results for the released SFT" en el repositorio de ModelScope del modelo original, pero no se incluyen los valores numericos.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 5,8 GB en 4 bits, por lo que se necesitan aproximadamente 6-8 GB de memoria unificada para el modelo mas el contexto y el runtime.
- Plataforma objetivo: Apple Silicon con MLX. No es un artefacto para CUDA ni para GPU de escritorio convencionales sin conversion previa.
- Equipos recomendados: Mac con chip de la serie M y 16 GB de memoria unificada o superior; con 8 GB el margen para contexto largo sera muy limitado.
- GPU de数据中心 (A100, H100, RTX 4090): no aplicables directamente a este formato; requeririan conversion a otro formato de pesos.
- Despliegue: oMLX (con `mtp_enabled: true` para decodificacion especulativa) y, en general, el runtime MLX. vLLM, TGI o llama.cpp no consumen de forma nativa este formato; llama.cpp o vLLM exigirian reconvertir los pesos.
- Parametros de inferencia sugeridos por el autor: `mtp_num_draft_tokens: 3`, `temperature: 0.6`, `repetition_penalty: 1.05`.
- Latencia y throughput absolutos: no disponibles. Solo se declara la mejora relativa de 1,4x-1,6x con MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e-mtp | 9,2 B | No disponible | MLX, 4 bits oQ4e con MTP | Solo texto | MIT | Repositorio HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9,2 B (aproximado) | No disponible | Pesos completos (BF16, presumiblemente) y variantes multimodales | Multimodal (incluye vision) | MIT | HuggingFace y ModelScope |
| Qwen/Qwen3.5-9B | 9 B (aproximado) | No disponible | Pesos PyTorch / safetensors | Texto (segun la informacion disponible) | No disponible en la informacion consultada | HuggingFace |
| MiMo-V2.6-Pro / MiMo-V2.6-Flash | No disponible | No disponible | Pesos abiertos segun Xiaomi | Omnimodal nativo | No disponible en la informacion consultada | Publicados por Xiaomi MiMo |

La comparativa se limita a lo declarado en las fuentes consultadas; no se dispone de cifras de rendimiento homogeneas entre estos modelos para establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Capacidad multimodal eliminada: cualquier tarea que requiera entrada de imagen o de codigo visual no funcionara en esta variante, a diferencia del modelo base.
- Sin datos de contexto publicados: se desconoce la ventana de contexto efectiva de esta cuantizacion, lo que dificulta planificar cargas de trabajo con documentos largos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad ni tasas de error para esta variante cuantizada; la cuantizacion a 4 bits puede degradar ligeramente la precision frente al modelo en BF16.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue, por lo que su uso en castellano u otros idiomas distintos del ingles no esta verificado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad. La validacion descrita procede exclusivamente del autor.
- Dependencia de oMLX para la aceleracion MTP: fuera de ese runtime no se aprovecha la decodificacion especulativa.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero se hereda del modelo base, por lo que conviene verificar las condiciones de XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B y de Qwen3.5-9B antes de un despliegue en produccion.
- Uso en ciberseguridad: las capacidades ofensivas potenciales del modelo base exigen controles de acceso y politicas de uso responsables.
- Fechas del repositorio: la model card indica creacion el 2026-09-25; conviene confirmar la vigencia de los pesos y del runtime asociado antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e-mtp
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Pagina de la serie MiMo-V2.6 de Xiaomi: https://mimo.xiaomi.com/mimo-v2-6
- Notas de la version MiMo-V2.6: https://mimo.mi.com/docs/en-US/news/latest/v2-6
- ModelScope del modelo base: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Xiaomi MiMo (portal): https://mimo.mi.com/
- Metricas de entrenamiento RL de MiMo-V2.6: https://mimo.xiaomi.com/rl/
