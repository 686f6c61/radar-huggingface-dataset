# SpaceTimee/Qwen3.8-27B-heretic-Deep-Pass1-LoRA

## Resumen

SpaceTimee/Qwen3.8-27B-heretic-Deep-Pass1-LoRA es una variante abliterated (decensored) del modelo Qwen3.8-27B, un LLM denso de 27.000 millones de parametros con codificador de vision desarrollado por el equipo Qwen de Alibaba. La modificacion la firma el usuario SpaceTimee y se ha generado con Heretic v1.4.0, una herramienta que aplica direcciones de abliteracion por capa sobre las proyecciones `attn.o_proj` y `mlp.down_proj` para suprimir el comportamiento de rechazo, con una divergencia KL de 0,0623 respecto al modelo original.

El modelo base es un transformer hibrido: 64 capas en las que solo 16 ejecutan atencion completa (1 de cada 4) y las otras 48 usan Gated DeltaNet, una atencion lineal con estado recurrente constante. Soporta 262.144 tokens de contexto nativos, extensibles hasta 1.000.000, y es multimodal nativo (imagenes y videos). Incorpora control flexible del modo pensamiento (`reasoning_effort`, `preserve_thinking`) y prediccion multi-token (MTP).

Su relevancia practica esta en la relacion entre seguridad y desplegabilidad: baja los rechazos de 94/100 a 5/100, lo que lo hace interesante para investigacion en alineacion, red-teaming y aplicaciones donde el filtrado del modelo base resulta un obstaculo, a cambio de perder salvaguardas. Es un repositorio recien publicado, con 0 descargas y 0 likes, y con un tamano declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con vision encoder: 64 capas, layout 16 x (3 x (Gated DeltaNet → FFN) → 1 x (Gated Attention → FFN)); MTP (Multi-Token Prediction) |
| Parametros totales | 27B (modelo denso base); el derivado es una modificacion por abliteracion del mismo |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible para este derivado; el modelo base de la familia dispone de GGUF Dynamic 2.0 de Unsloth segun la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags); el nombre del repositorio indica LoRA y el tamano declarado es 0,0 GB |
| Dimension oculta | 5.120 |
| Vocabulario / embeddings | 248.320 (padded) |
| FFN (dimension intermedia) | 17.408 |
| Atencion Gated DeltaNet | 48 cabezas lineales para V y 16 para QK, dimension de cabeza 128 |
| Atencion Gated Attention | 24 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de 64 |
| Herramienta de abliteracion | Heretic v1.4.0 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atencion lineal y atencion completa en una proporcion 3:1: de las 64 capas, 48 usan Gated DeltaNet (atencion lineal con estado recurrente constante, 48 cabezas para V y 16 para QK, dimension de cabeza 128) y 16 usan Gated Attention clasica (24 cabezas Q, 4 KV, dimension de cabeza 256, RoPE de 64). El intervalo de atencion completa es `full_attention_interval: 4`, y el backbone coincide con el del buque insignia MoE de 2,4T de la familia. Incluye un FFN de 17.408 de dimension intermedia, embeddings de 248.320 entradas y MTP entrenado con multiples pasos. El modelo completo es un causal language model con vision encoder, por lo que procesa imagen y video ademas de texto.

En cuanto al entrenamiento, la informacion disponible del modelo base indica pre-training y post-training, pero no detalla el numero de tokens, la composicion del dataset ni si se empleo RLHF o DPO. Lo que si se documenta es el proceso de modificacion de este derivado: un pase de abliteracion con Heretic v1.4.0 sobre `Qwen/Qwen3.8-27B`, con `direction_index` por capa y pesos maximos/minimos definidos por tipo de proyeccion (`attn.o_proj.max_weight` 1,48 en la posicion 39,53; `attn.o_proj.min_weight` 1,30 a distancia 32,86; `mlp.down_proj.max_weight` 1,13 en la posicion 44,21; `mlp.down_proj.min_weight` 0,66 a distancia 27,59). El resultado se mide con dos metricas: divergencia KL de 0,0623 frente al original y reduccion de rechazos de 94/100 a 5/100.

## Capacidades

- Generacion de texto y razonamiento con modo pensamiento activado por defecto, desactivable por peticion.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retencion del contexto de razonamiento historico con `preserve_thinking`.
- Codigo: mejoras declaradas por el fabricante en tareas de programacion sobre la generacion anterior.
- Trabajo profesional y ofimatica: el repositorio oficial del modelo base lo posiciona para automatizacion de tareas de oficina.
- Tareas agenticas de horizonte largo: planificacion autonoma y tratamiento de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Tool calling / function calling con soporte de rol `developer`, pensado para integrarse en herramientas agenticas tipo Codex; el modelo base incorpora mejoras de parseo de objetos anidados.
- Vision-language nativo: comprension de imagenes y videos, desde diagramas STEM y documentos hasta videos de una hora de duracion.
- Multilingue: no disponible la lista concreta de idiomas soportados.
- Capacidad especifica de este derivado: reduccion drastica de rechazos (5/100 frente a 94/100), orientada a usos sin filtrado y a investigacion sobre alineacion.
- Rendimiento multimodal en matematicas: el modelo base se evalua en MathVision con el prompt fijo "Please reason step by step, and put your final answer within \boxed {}".

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo permite estudiar que comportamientos se pierden al eliminar direcciones de rechazo, comparando KL de 0,0623 y la tasa de rechazos frente al original; es util para medir el coste real de la desalineacion.
- Red-teaming y evaluacion de seguridad: al responder en el 95 % de los casos donde el base rechaza, sirve para generar conjuntos de prompts adversarios y comprobar como se comportan los filtros y clasificadores de una plataforma.
- Generacion de codigo en pipelines internos: con tool calling y soporte de rol `developer`, se puede integrar en agentes de CI/CD que lean el repositorio, ejecuten pruebas y propongan parches, siempre dentro de un entorno controlado.
- Atencion al cliente en dominios regulados o sensibles: el modelo puede mantener conversaciones multi-turno largas gracias a los 262.144 tokens de contexto y evitar respuestas evasivas cuando la politica de la empresa exige informar de temas que el modelo base bloquearia; requiere supervision y politica de uso propia.
- Analisis de documentos y diagramas tecnicos: el encoder de vision permite extraer informacion de planos, graficos y PDFs escaneados, y el contexto largo admite lotes de documentos en una misma sesion.
- Analisis de video de larga duracion: la comprension de videos de hasta una hora encaja en tareas de resumen de reuniones, auditoria de grabaciones o revision de material docente.
- Generacion de contenido editorial sin filtros de estilo: util para redaccion creativa o guiones donde los rechazos del modelo alineado interrumpen el flujo, con revision humana obligatoria antes de publicacion.
- Automatizacion de tareas de oficina de varios pasos: agentes que combinan lectura de correo, consulta de bases de datos y redaccion de respuestas, aprovechando la planificacion de horizonte largo del modelo base.

## Benchmarks y rendimiento

La model card de este derivado solo publica metricas del proceso de abliteracion, no benchmarks estandar (MMLU, HumanEval, GSM8K, MathVision, etc.) del modelo modificado.

| Metrica | Este modelo | Modelo original (unsloth/Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0623 | 0 (por definicion) |
| Rechazos | 5/100 | 94/100 |

No se han publicado resultados de benchmarks estandar en la informacion disponible para este derivado. La pagina oficial de Qwen3.8-27B menciona evaluacion en MathVision con prompt fijo, pero no se aportan cifras en la informacion proporcionada.

## Requisitos de hardware

Las cifras siguientes son estimaciones a partir del tamano del modelo (27B densidad completa) y no proceden de la informacion proporcionada.

- VRAM en bf16/fp16: aproximadamente 54 GB solo para pesos, mas activaciones y cache; requiere H100 80 GB, A100 80 GB o reparto en varias GPU.
- VRAM en FP8/INT8: en torno a 27-30 GB; encaja en A100 40 GB, L40S 48 GB o H100 con margen.
- VRAM en 4 bits (GGUF Q4_K_M): aproximadamente 15-16 GB mas overhead de contexto; cabe en RTX 4090, RTX 3090 y GPUs de 24 GB, y con contexto recortado en tarjetas de 16 GB.
- Cache KV: solo 16 de las 64 capas usan atencion completa; las 48 restantes emplean atencion lineal con estado recurrente constante, por lo que el crecimiento de cache con la longitud de contexto es notablemente menor que en un transformer denso convencional.
- Despliegue: existe receta oficial de vLLM para Qwen3.8-27B; la familia dispone de GGUF Dynamic 2.0 de Unsloth y de soporte en Unsloth Desktop y guia de fine-tuning. Soporte en llama.cpp, Ollama o TGI: no confirmado en la informacion proporcionada.
- Este repositorio declara 0,0 GB de tamano y su nombre incluye "LoRA", por lo que es probable que se trate de un adaptador o de un repositorio sin pesos completos subidos; antes de planificar el despliegue hay que verificar que artefactos contiene realmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SpaceTimee/Qwen3.8-27B-heretic-Deep-Pass1-LoRA (este) | 27B denso + abliteracion | 262.144 nativo | Si (imagen y video) | 5/100 | apache-2.0 | Publicado, 0 descargas, repo de 0,0 GB |
| Qwen/Qwen3.8-27B (base oficial) | 27B denso | 262.144 nativo | Si (imagen y video) | No disponible | apache-2.0 | Publicado por el equipo Qwen |
| unsloth/Qwen3.8-27B | 27B denso | 262.144 nativo | Si (imagen y video) | No disponible | apache-2.0 | Publicado por Unsloth, con GGUFs Dynamic 2.0 |
| SpaceTimee/Qwen3.8-27B-heretic-LoRA (variante hermana) | 27B denso + abliteracion | 262.144 nativo | Si (imagen y video) | No disponible | apache-2.0 | Publicado por el mismo autor |

No se dispone de datos de rendimiento comparado (benchmarks estandar) para ninguna de las variantes abliteradas, por lo que la comparacion se limita a parametros, contexto, licencia y tasa de rechazos.

## Limitaciones y advertencias

- La abliteracion elimina intencionadamente las salvaguardas: la tasa de rechazo baja del 94 % al 5 %, por lo que el modelo puede producir contenido danino, ilegal o gravemente inapropiado. No es apto para despliegue orientado a usuario final sin filtros propios.
- La divergencia KL de 0,0623 indica una desviacion medible de la distribucion del modelo original; las capacidades y el estilo de respuesta pueden degradarse de forma no uniforme entre tareas.
- Riesgo de alucinacion: es una limitacion general de la familia y no se han publicado evaluaciones de fidelidad especificas para este derivado.
- Idiomas soportados: no disponible; si el uso previsto no es el ingles, hay que validar antes el comportamiento.
- Licencia apache-2.0 sobre el artefacto, pero el uso comercial de un modelo desalineado puede entrar en conflicto con las politicas de las plataformas de despliegue, con la normativa de IA aplicable y con las condiciones de servicio de los proveedores cloud.
- El repositorio declara 0,0 GB de tamano y el nombre sugiere un adaptador LoRA: verificar el contenido real antes de asumir que se pueden descargar pesos completos.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y publicacion y actualizacion con segundos de diferencia, lo que apunta a un artefacto sin verificacion independiente.
- Parametros de muestreo recomendados por el fabricante del base: modo pensamiento `temperature=1.0`, `top_p=0.95`, `top_k=20`; modo instruct `temperature=0.7`, `top_p=0.80`, `top_k=20`, `presence_penalty=1.5`. Subir `presence_penalty` puede provocar mezcla de idiomas y perdida de calidad.
- En tareas agenticas se recomienda asignar una longitud de salida generosa; con presupuestos cortos el modelo puede no completar la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpaceTimee/Qwen3.8-27B-heretic-Deep-Pass1-LoRA
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Version de Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Variante hermana del mismo autor: https://huggingface.co/SpaceTimee/Qwen3.8-27B-heretic-LoRA
- Proyecto Heretic: https://heretic-project.org
- Guia de Unsloth para ejecutar Qwen3.8-27B: https://unsloth.ai/docs/models/qwen3.8
- Cuantizaciones Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en AlibabaCloud-Official: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
