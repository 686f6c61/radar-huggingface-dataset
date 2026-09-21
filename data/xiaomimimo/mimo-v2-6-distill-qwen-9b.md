# XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B

## Resumen

MiMo-V2.6-Distill-Qwen-9B es un modelo de 9.409.813.744 parametros (9,4B) desarrollado por Xiaomi MiMo (XiaomiMiMo) mediante ajuste supervisado (SFT) sobre Qwen3.5-9B, partiendo de datos generados por la propia familia MiMo. El checkpoint se publica como punto de partida para investigacion abierta en aprendizaje por refuerzo agentico, no como el modelo final de la familia MiMo-V2.6. La model card se refiere a el explicitamente como "SFT checkpoint".

El modelo esta orientado a tareas agenticas: cubre generacion de codigo, tareas de agente de proposito general, codigo visual (image-text-to-text) y ciberseguridad. Segun los datos del autor, la mezcla de SFT empleada contiene 77.400 millones de tokens totales, de los cuales 27.200 millones son tokens con perdida (loss-bearing), repartidos entre los dominios de codigo (29,9 %), ciber (14,2 %), general (28,5 %) y visual (27,4 %).

Su relevancia actual radica en que mejora de forma notable al modelo base en tareas de agente y ciberseguridad: por ejemplo, pasa de 32,0 a 44,6 en SWE Pro, de 5,7 a 31,3 en el conjunto interno MiMo Cyber (mini) y de 5,0 a 30,3 en AutomationBench v1.0.6. No se ha publicado informacion sobre licencia ni sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3.5 (tag `qwen3_5`); el autor no detalla si es denso o MoE, y no se publican parametros activos, por lo que se asume densa |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica segun la informacion disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en `safetensors` (18,8 GB, coherente con precision de 16 bits) y no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`transformers`, arquitectura `qwen3_5`) |
| Entrada multimodal | Si (`image-text-to-text`) |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Plantilla de chat | Plantilla de chat MiMo v2.6 incluida en el checkpoint |
| Fecha de publicacion | 21 de septiembre de 2026 |
| Descargas / likes | 0 descargas / 48 likes |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y conserva su tokenizador y su arquitectura (etiquetada como `qwen3_5` en la libreria `transformers`), pero sustituye la plantilla de chat por la de MiMo v2.6 e incorpora un parser de razonamiento especifico (`--reasoning-parser mimo` en SGLang) con un modo de pensamiento que se activa explicitamente mediante `enable_thinking`. Se trata, por tanto, de un ajuste por instrucciones y datos de agente sobre un backbone denso de 9,4B, con soporte de entrada imagen-texto heredado del modelo base.

El entrenamiento es exclusivamente SFT (supervised fine-tuning) sobre datos generados por MiMo, con un total de 77,4B tokens y 27,2B tokens con perdida. La composicion declarada es: codigo 23,2B tokens totales (7,3B con perdida), ciber 11,0B (4,8B), general 22,0B (5,7B) y visual 21,2B (9,4B). El autor no menciona fases de RLHF, DPO ni aprendizaje por refuerzo en este checkpoint; de hecho, lo presenta como base para investigar RL agentico, lo que sugiere que el RL se reserva para los modelos Pro-RL de la familia. No se detallan innovaciones de atencion, decodificacion especulativa ni estrategias de context length.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo de pensamiento explicito (el contenido de razonamiento se devuelve en el campo `reasoning_content`).
- Generacion y edicion de codigo en tareas de repositorio real (SWE Verified, SWE Pro).
- Uso de herramientas (tool-use) y function calling, con soporte declarado para agentes multi-paso.
- Tareas de agente de proposito general: automatizacion de flujos, uso de terminal y ofimatica.
- Capacidades visuales de tipo image-text-to-text, aplicadas a codigo visual (interpretacion de capturas o interfaces para generar codigo).
- Ciberseguridad: evaluado en un conjunto interno especifico del dominio (MiMo Cyber mini).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`).

## Casos de uso

- Agente de resolucion de incidencias en repositorios: con 61,1 en SWE Verified y 44,6 en SWE Pro, es adecuado para localizar fallos, proponer parches y validarlos dentro de un pipeline de CI/CD, encadenando llamadas a herramientas de build y test.
- Automatizacion de terminal y operaciones: sus 37,1 puntos en Terminal Bench 2.1 lo sitúan como candidato para agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa en entornos de staging.
- Generacion de codigo a partir de interfaces: con 64,0 en MiMo Visual Coding (mini), puede convertir capturas de pantalla o mockups en componentes de interfaz, util en equipos de front-end.
- Automatizacion de tareas ofimaticas: 19,5 en OfficeQA permiten usarlo para extraer y consolidar informacion de documentos, hojas de calculo y presentaciones dentro de flujos internos.
- Triaje y asistencia en ciberseguridad: 31,3 en MiMo Cyber (mini) lo hacen util para clasificar alertas, resumir logs y redactar informes preliminares, siempre con supervision humana dado el caracter critico del dominio.
- Orquestacion de procesos empresariales multi-paso: 30,3 en AutomationBench v1.0.6 y 35,2 en Toolathlon-Verified lo respaldan para agentes que encadenan APIs y herramientas en flujos de negocio.
- Base para investigacion en RL agentico: el autor lo publica explicitamente como punto de partida para experimentos de refuerzo sobre modelos de 9B, con recetas de SFT ya aplicadas.
- Asistente de soporte tecnico con contexto largo: no se puede confirmar el caso sin conocer la longitud de contexto, dato no disponible.

## Benchmarks y rendimiento

Resultados del checkpoint SFT publicados en el informe tecnico de MiMo-V2.6, comparados con el modelo base:

| Dominio | Benchmark | Metrica | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B (SFT) |
|---|---|---|---|---|
| Codigo | SWE Verified | avg@3 | 60,0 | 61,1 |
| Codigo | SWE Pro | avg@3 | 32,0 | 44,6 |
| Codigo | MiMo Code (mini)† | avg@3 | 19,5 | 51,6 |
| Ciber | MiMo Cyber (mini)† | avg@3 | 5,7 | 31,3 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |
| General | MiMo General (mini)† | avg@1 | 28,5 | 62,2 |
| Visual | MiMo Visual Coding (mini)† | avg@1 | 61,7 | 64,0 |

† Conjuntos de evaluacion internos del autor, no reproducibles de forma independiente.

## Requisitos de hardware

- Inferencia en precision de 16 bits: los pesos ocupan aproximadamente 18,8 GB (tamano del repositorio), por lo que se necesitan del orden de 22-26 GB de VRAM contando cache KV y overhead. Cabe en A100 40GB, H100 80GB, L40S 48GB y A6000 48GB; en una RTX 4090 de 24 GB queda muy justo y dependera del contexto.
- Cuantizacion a 8 bits: estimacion de 10-12 GB de VRAM, lo que permite ejecucion comoda en RTX 4090, RTX 3090 y A6000. No hay pesos cuantizados publicados por el autor, seria necesario generarlos.
- Cuantizacion a 4 bits: estimacion de 6-8 GB de VRAM, viable en GPU de consumo como RTX 4070 Ti, RTX 4060 Ti 16GB o RTX 3060 12GB. Requiere conversion previa, ya que el repositorio solo contiene safetensors.
- Despliegue: el autor documenta SGLang con soporte de Qwen3.5 (`sglang serve --reasoning-parser mimo --port 30000`). No se confirman en la informacion disponible otras rutas como vLLM, TGI, llama.cpp u Ollama; para llama.cpp u Ollama seria imprescindible convertir los pesos a GGUF.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: el checkpoint incluye tokenizador y plantilla de chat propios, y expone una API compatible con OpenAI, lo que simplifica su integracion en servicios existentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B | 9,4B | No disponible | SWE Verified 61,1; SWE Pro 44,6; MiMo General (mini) 62,2 | No disponible | Pesos safetensors en HuggingFace |
| Qwen3.5-9B (modelo base) | No disponible en la informacion (familia 9B) | No disponible | SWE Verified 60,0; SWE Pro 32,0; MiMo General (mini) 28,5 | No disponible | Pesos en HuggingFace |
| MiMo-V2.6-Pro-RL | No disponible | No disponible | No disponible (referenciado en la cita del informe tecnico) | No disponible | Referenciado en HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un bloqueo critico para cualquier despliegue en produccion.
- Idiomas soportados no disponibles: no hay garantia de rendimiento fuera de los idiomas cubiertos por Qwen3.5-9B.
- Longitud de contexto no disponible: no se puede dimensionar el uso con documentos largos o conversaciones extensas sin verificacion empirica.
- Es un checkpoint exclusivamente SFT, sin etapa declarada de RLHF o DPO, por lo que no hay garantias de alineacion con preferencias humanas ni de resistencia a prompts adversarios.
- Riesgo de alucinacion inherente a modelos de 9B en tareas de agente: se recomienda validacion de las acciones y verificacion de resultados antes de ejecutar herramientas con efectos reales.
- Varios benchmarks de referencia son conjuntos internos del autor (marcados con †), por lo que no pueden reproducirse de forma independiente y pueden no ser comparables con resultados publicos.
- La mejora en dominios especificos (ciberseguridad, codigo visual) procede de una mezcla de SFT muy orientada a esos dominios, lo que puede implicar un comportamiento degradado en areas fuera de la distribucion de entrenamiento.
- En ciberseguridad, el uso debe limitarse a tareas defensivas y de analisis bajo supervision; el propio autor no documenta restricciones de uso y la licencia no aclara este punto.
- El modelo tiene 0 descargas registradas y 48 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es todavia muy limitada.
- No hay evidencia publica sobre rendimiento de cuantizacion, ya que el autor no publica pesos en 4 u 8 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe tecnico citado (MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement, Xiaomi MiMo Team, 2026): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Instalacion de SGLang (documentacion oficial referenciada en la model card): https://docs.sglang.io/get_started/install.html
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido de ayuda de YouTube), por lo que no se han incorporado enlaces adicionales.
