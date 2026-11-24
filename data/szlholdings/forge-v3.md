# SZLHOLDINGS/forge-v3

## Resumen

forge-v3 es un modelo de generacion de texto de 873.438.784 parametros publicado por SZLHOLDINGS, un espacio de modelos gobernados que enfatiza la trazabilidad de resultados mediante ficheros de "recibos" (receipts) auditables. El modelo se construye sobre `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3`, un ajuste fino supervisado (SFT) de la familia Qwen 3.5 en su variante de 0,8 mil millones de parametros, segun indica la etiqueta `qwen3_5` del repositorio.

La propuesta diferencial del autor no es el rendimiento bruto sino la honestidad metodologica: la model card declara explicitamente que cualquier cifra no incluida en sus recibos de auditoria se marca como UNKNOWN en lugar de inventarse. Esto lo convierte en un artefacto interesante para equipos que necesitan modelos pequenos, desplegables en hardware modesto y con licencia permisiva (Apache 2.0), dentro de pipelines donde la verificabilidad del origen del modelo importa tanto como la calidad de la generacion.

Por su tamano, forge-v3 encaja en la categoria de modelos compactos para inferencia en CPU o GPU de consumo, orientados a tareas acotadas como agentes de recibos, extraccion estructurada o asistentes de dominio especifico. No obstante, la informacion publica disponible es muy limitada: no se detallan idiomas, composicion del dataset de entrenamiento, contexto maximo ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, derivado de `szl-receiptagent-qwen35-0.8b-sft-v3`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

forge-v3 es un artefacto derivado de un modelo base de la familia Qwen 3.5 de 0,8 mil millones de parametros, segun la etiqueta `qwen3_5` y el identificador del modelo base `szl-receiptagent-qwen35-0.8b-sft-v3`. El sufijo `sft` del modelo base sugiere un ajuste fino supervisado sobre el modelo preentrenado original, presumiblemente orientado a tareas de agente de recibos (receipt agent). No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.).

La model card es deliberadamente parca en detalles tecnicos y remite a los ficheros de recibos del "estate mesh" del autor para cualquier afirmacion de entrenamiento o evaluacion. Cualquier dato no respaldado por un recibo fechado se declara UNKNOWN. Esta politica de documentacion, aunque poco convencional, evita la inflacion de metricas habitual en model cards y traslada la carga de verificacion al consumidor del modelo.

## Capacidades

- Generacion de texto autoregresiva estandar, heredada de la arquitectura Qwen 3.5.
- Ajuste fino supervisado orientado, por el nombre del modelo base, a tareas de agente de recibos (procesamiento de documentos, extraccion de campos, conversacion transaccional).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas figura como no disponible).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Compatible con la libreria `transformers` y, por tanto, con el ecosistema estandar de inferencia (vLLM, TGI, llama.cpp si se generan cuantizaciones).

## Casos de uso

- Extraccion estructurada de datos de recibos y facturas: dado el nombre del modelo base (`receiptagent`), es plausible usarlo para convertir documentos de gasto en JSON con campos normalizados (fecha, importe, proveedor, impuestos) en pipelines de contabilidad automatizada.
- Agente de conciliacion de gastos: el modelo puede gestionar conversaciones multi-turno para resolver discrepancias entre recibos y extractos bancarios, aunque la ventana de contexto no esta documentada y debe validarse empiricamente.
- Asistente de atencion al cliente de dominio acotado: por su tamano (873 M parametros) puede desplegarse en una sola GPU de consumo o incluso en CPU, lo que permite servir respuestas de baja latencia en entornos con presupuesto de infraestructura limitado.
- Prototipado rapido de pipelines de agentes: al ser Apache 2.0 y pesar unos 3,5 GB en safetensors, es adecuado para experimentar con frameworks de agentes (LangGraph, AutoGen) sin coste de licencia ni necesidad de hardware especializado.
- Clasificacion y enrutamiento de documentos financieros: el modelo puede usarse como clasificador zero-shot o few-shot de tipos de recibo y decidir el flujo downstream dentro de un sistema de gestion documental.
- Inferencia en el borde (edge) o entornos air-gapped: al caber en memoria de una GPU consumer o en RAM de servidor, permite desplegar un asistente de dominio especifico en instalaciones sin conectividad externa.
- Base para ajuste fino adicional: su licencia permisiva y tamano compacto lo convierten en punto de partida para SFT/LoRA sobre dominios verticales (legal, sanitario, logistico) con costes de entrenamiento reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y no se incluye ninguna en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 2,5-4 GB en total segun longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1 GB para pesos; en 4 bits, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien es viable en CPU con cuantizacion GGUF si se generan los pesos correspondientes.
- Opciones de despliegue: `transformers` (confirmado por la libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se distribuyen cuantizaciones en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/forge-v3 | 873 M | no disponible | Apache 2.0 | Hugging Face, safetensors | Derivado de Qwen 3.5 0,8B con SFT; documentacion centrada en trazabilidad |
| Qwen2.5-0.5B / Qwen3-0.6B | 0,5-0,6 B | 32 K (Qwen2.5) | Apache 2.0 | Hugging Face, amplio ecosistema | Alternativa generica de referencia en el mismo rango de tamano |
| Llama 3.2 1B | 1,2 B | 128 K | Llama 3.2 Community License | Hugging Face, Ollama | Mayor contexto, pero licencia con restricciones de uso comercial |
| SmolLM2-1.7B | 1,7 B | 8 K | Apache 2.0 | Hugging Face | Mayor tamano y mejor rendimiento general reportado, pero mas coste de inferencia |

La comparativa es orientativa: no se dispone de benchmarks publicados de forge-v3 que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks y de documentacion tecnica detallada: no es posible evaluar su calidad frente a alternativas sin realizar una evaluacion propia.
- Riesgo de alucinacion inherente a los modelos de 0,8 B: la capacidad de razonamiento y la fidelidad factual son limitadas en comparacion con modelos de mayor tamano; no es adecuado para tareas que requieran alta precision sin verificacion posterior.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano sin validacion empirica.
- Contexto maximo no documentado: planificar el despliegue asumiendo un contexto conservador y medir el comportamiento en conversaciones largas.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni procesos de mitigacion de sesgos.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre el cumplimiento normativo en dominios regulados.
- Modelo base de procedencia: al derivar de un SFT de Qwen 3.5, hereda las limitaciones del modelo original, no documentadas en esta ficha.
- La model card remite a "receipt files" externos para cualquier afirmacion de entrenamiento o evaluacion; conviene verificar esos recibos en el repositorio de GitHub del autor antes de confiar en cualquier metrica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/forge-v3
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organizacion del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de model cards: https://github.com/szl-holdings/estate-cards
