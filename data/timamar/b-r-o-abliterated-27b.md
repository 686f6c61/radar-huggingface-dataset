# Timamar/B.R.O-abliterated-27B

## Resumen

B.R.O (Breaching Remote Operation) Zero Refusal v3.0 es un ajuste fino del modelo Qwen3.5-35B-A3B, un Mixture-of-Experts (MoE) de 35B parametros totales con 3B parametros activos por token, desarrollado por el usuario Timamar. El modelo se presenta como una version "abliterated" y "zero-refusal", es decir, con las capas de rechazo eliminadas deliberadamente, orientada a tareas de ciberseguridad ofensiva y red-teaming. Segun la model card, se destila a partir de un modelo profesor denominado B.R.O v53 Zero-Refusal (Tinker) sobre la arquitectura `qwen35moe`.

La propuesta tecnica central es la eliminacion del comportamiento de rechazo mediante ortogonalizacion del subespacio de rechazo en las matrices de compuerta del router MoE (40 matrices de 256x2048 en float32), combinada con un ajuste LoRA de rango 16 sobre un corpus de 618 trayectorias de cumplimiento directo. El autor reporta una tasa de rechazo del 0,0% en pruebas locales en hebreo e ingles, incluyendo prompts sin system prompt y peticiones de ciberseguridad ofensiva.

El modelo es relevante en el contexto de la investigacion sobre seguridad de LLM y alineacion: ejemplifica las tecnicas de "abliteration" aplicadas a arquitecturas MoE modernas con atencion lineal hibrida (GatedDeltaNet). Su licencia Apache 2.0 y su distribucion en formato GGUF y MLX facilitan el despliegue local, aunque su naturaleza sin filtros plantea consideraciones eticas y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (GatedDeltaNet hibrida + MoE disperso) |
| Parametros totales | 35B (34,7B) |
| Parametros activos | 3B (A3B): 256 expertos enrutados + 1 experto compartido por capa |
| Longitud de contexto | 32.768 por defecto; hasta 262.144 nativo |
| Tipos de cuantizacion | Q4_K_M (GGUF); safetensors (adaptadores LoRA); MLX |
| Idiomas soportados | Ingles y hebreo (segun model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (adaptadores), MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, una arquitectura MoE con atencion lineal hibrida GatedDeltaNet. Cada capa contiene 256 expertos enrutados mas un experto compartido, de modo que solo se activan aproximadamente 3B parametros por token, lo que reduce el coste de inferencia frente a un modelo denso de tamano comparable. El contexto nativo alcanza 262.144 tokens, aunque la configuracion por defecto es de 32.768.

El proceso de ajuste descrito en la model card consta de cuatro fases: (1) entrenamiento del profesor B.R.O v53 sobre 618 trayectorias de cumplimiento directo (223.689 tokens) con "contrastive refusal unlearning", bloqueo de intencion mediante prellenado de `<think>\n\n</think>\n\n` e inmunidad a system prompts en cinco plantillas; (2) ortogonalizacion de rango 1 del subespacio de rechazo (metodo Arditi et al., con tau = 0,08) sobre las 40 matrices de compuerta del router MoE en float32; (3) destilacion de pesos mediante un adaptador LoRA de rango 16 entrenado sobre el mismo corpus; y (4) parcheo de la plantilla de chat y del Modelfile para forzar el bloqueo de intencion en cada generacion. No se especifican datos sobre el corpus de preentrenamiento original de Qwen3.5-35B-A3B ni sobre el uso de RLHF/DPO en esta fase.

## Capacidades

- Generacion de texto conversacional en ingles y hebreo.
- Cumplimiento directo de instrucciones sin rechazo declarado (0,0% reportado en pruebas locales).
- Respuestas orientadas a ciberseguridad ofensiva y red-teaming.
- Modo de razonamiento con bloqueo de intencion (`<think>\n\n</think>\n\n`) preconfigurado.
- Inmunidad a system prompts segun el autor (cinco plantillas probadas).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo puede emplearse para generar prompts adversariales y evaluar la robustez de filtros de seguridad en otros LLM, aprovechando su tasa de rechazo nula declarada.
- Pruebas de penetracion autorizadas: generacion de payloads, comandos y tecnicas de explotacion en entornos controlados, con contexto de 32.768 tokens para mantener el hilo de una auditoria.
- Investigacion sobre alineacion y abliteration: analisis del efecto de la ortogonalizacion del subespacio de rechazo en arquitecturas MoE, comparando el comportamiento antes y despues del ajuste.
- Desarrollo de herramientas de ciberseguridad internas: asistencia en la redaccion de reglas de deteccion, scripts de analisis o documentacion tecnica de vulnerabilidades en un pipeline local.
- Evaluacion de sesgos y seguridad de modelos base: uso como contraste para medir cuanto rechazo elimina una tecnica concreta sobre Qwen3.5-35B-A3B.
- Despliegue local en Apple Silicon: inferencia mediante MLX u Ollama a 14,6-26,5 tok/s, adecuada para prototipado sin dependencia de la nube.
- Procesamiento de texto en hebreo: generacion y analisis de contenido en hebreo con contexto largo, uno de los pocos idiomas declarados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de velocidad local en Apple Silicon (14,6-26,5 tok/s de generacion y 238 tok/s de evaluacion de prompt) y una tasa de rechazo del 0,0% en cuatro suites internas (0/32), sin comparacion con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21 GB en Q4_K_M (GGUF de 21,17 GB); en precision completa (BF16) el modelo de 35B requeriria del orden de 70 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una A100 de 40 GB o H100 encajan en precision completa, y una RTX 4090 (24 GB) o similar podria ejecutar la cuantizacion Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con al menos 24 GB de VRAM para Q4_K_M, segun el tamano del archivo.
- Opciones de despliegue: Ollama (`ollama run bro-zero-refusal`), MLX (libreria declarada en el repo), llama.cpp mediante GGUF. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: 14,6-26,5 tok/s de generacion y 238 tok/s de evaluacion de prompt en Apple Silicon, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| B.R.O Zero Refusal v3.0 | 35B | 3B | 32.768 (hasta 262.144) | Apache 2.0 | Ajuste abliterated sin rechazo; ingles y hebreo |
| Qwen3.5-35B-A3B (base) | 35B | 3B | no disponible | no disponible | Modelo base sin modificar; comportamiento alineado estandar |
| Alternativas abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar los rechazos de seguridad; puede generar contenido ofensivo, ilegal o peligroso sin advertencia.
- Riesgo elevado de alucinacion y de respuestas erroneas en dominios tecnicos, agravado por la ausencia de benchmarks publicados.
- Cobertura linguistica limitada a ingles y hebreo segun el autor; el rendimiento en castellano no esta documentado.
- El proceso de abliteration puede degradar capacidades generales del modelo base; no se aportan mediciones que lo descarten.
- La licencia Apache 2.0 permite uso comercial, pero el uso para fines maliciosos o sin autorizacion expresa puede infringir normativa de ciberseguridad y proteccion de datos.
- El repositorio tiene un tamano de 0,1 GB, insuficiente para los pesos completos; los artefactos reales (GGUF de 21,17 GB) se referencian en la model card pero no se confirma su presencia en el repo.
- La model card incluye un script de instalacion remoto (`curl | zsh`) que debe auditarse antes de ejecutar.
- El modelo declara "inmunidad a system prompts", lo que impide aplicar salvaguardas mediante instrucciones de sistema en produccion.
- Solo 1 like y 1.123 descargas en el momento de la consulta; validacion externa muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Timamar/B.R.O-abliterated-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio GitHub del autor: https://github.com/timamar187-creator/BRO-abliterated-27B
- Script de instalacion (Hugging Face): https://huggingface.co/Sm0k13/B.R.O-abliterated-27B/resolve/main/install-bro-zero-refusal.zsh
- Referencia del metodo de ortogonalizacion: Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction" (no se proporciona URL en la informacion disponible)
- Papers, blogs o demos adicionales: no disponible
