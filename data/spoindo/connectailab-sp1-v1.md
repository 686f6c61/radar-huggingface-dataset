# spoindo/connectailab-sp1-v1

## Resumen

Connectailab-sp1-v1 es un ajuste fino de Qwen2.5-0.5B-Instruct desarrollado por el usuario spoindo (Jungyeonsik) en el marco del proyecto Connect AI Lab. No es un modelo conversacional de propósito general: se presenta como un agente de toma de decisiones para el contexto de "empresa unipersonal", entrenado para recibir un estado de negocio en JSON y devolver una decisión discreta con probabilidades asociadas y un nivel de confianza. El entrenamiento combina una fase de ajuste supervisado (SFT, v0) sobre patrones de decisión empresarial y una fase posterior de aprendizaje por refuerzo con PPO (v1) sobre un simulador construido con 1,6 millones de registros de datos abiertos de seis sectores, con intervención humana (HITL) cuando la confianza cae por debajo del 75 %.

El modelo parte de una base muy pequena (0,5 mil millones de parámetros) y una licencia Apache-2.0, lo que lo sitúa en la categoria de modelos ligeros desplegables en CPU o en GPUs de consumo. Su interes ahora mismo es mas metodologico que de rendimiento: documenta un pipeline completo de SFT + PPO + HITL aplicado a decisiones de negocio, con un esquema de E/S JSON cerrado y verificable, y esta vinculado a un trabajo academico anunciado por el autor para noviembre de 2026.

Conviene ser prudente: el modelo no declara resultados de benchmarks, no tiene descargas ni valoraciones en Hugging Face y su model card es fundamentalmente una descripcion de proyecto de investigacion, no una evaluacion tecnica reproducible. Los idiomas declarados son coreano e ingles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5), ajustada para clasificacion de decisiones con salida JSON |
| Parametros totales | Aproximadamente 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens segun su documentacion oficial, pero la model card de este ajuste no lo especifica |
| Tipos de cuantizacion | No disponible en la model card. Al derivar de Qwen2.5, es tecnicamente compatible con cuantizaciones GGUF/AWQ/GPTQ mediante herramientas estandar, pero el autor no publica versiones cuantizadas |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible en la model card; el repositorio esta alojado en Hugging Face y se carga con transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5 en su variante instruct de 0,5 mil millones de parametros, un transformer decoder-only sin modificaciones estructurales conocidas. La innovacion del proyecto no esta en la arquitectura sino en el procedimiento de ajuste, descrito en tres etapas: primero un ajuste supervisado (SFT, v0) para imitar patrones de decision empresarial existentes; despues un entrenamiento con aprendizaje por refuerzo mediante PPO (v1) en el que el modelo actua como politica autonoma dentro de un simulador construido a partir de 1,6 millones de registros de datos abiertos de seis sectores de actividad; y finalmente un bucle de human-in-the-loop en el que las decisiones con confianza inferior al 75 % se derivan a revision humana y su retroalimentacion se reincorpora al entrenamiento.

El dominio declarado es muy concreto: comercio internacional de plasticos de ingenieria para automocion e industria, y distribucion de un producto patentado (un sumidero/rejilla de drenaje con doble boca para evitar olores). La interfaz es un JSON de estado de negocio (categoria, importe, si el comprador es nuevo, puntuacion de riesgo) con una pregunta y una lista cerrada de criterios, y la salida es otro JSON con la opcion elegida, la distribucion de probabilidad sobre las alternativas, la confianza y una justificacion textual.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como DPO, decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en coreano e ingles sobre estados de negocio descritos en JSON.
- Clasificacion de decisiones con espacio de acciones cerrado: devuelve la opcion elegida mas una distribucion de probabilidad sobre todas las alternativas.
- Autoestimacion de confianza, usada como disparador del flujo de revision humana (umbral declarado del 75 %).
- Justificacion textual breve de la decision adoptada.
- Razonamiento de un solo paso sobre politicas de decision; no se documenta razonamiento multi-paso explicito.
- Comportamiento de politica entrenada por refuerzo (PPO), orientada a maximizar una recompensa definida en el simulador, no a conversar.
- Integracion en flujos con human-in-the-loop para las decisiones de baja confianza.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingue limitada a los dos idiomas declarados; no hay evidencia de cobertura de otros idiomas.

## Casos de uso

- Aprobacion de pedidos de exportacion: el modelo recibe el estado del pedido (importe, si el comprador es nuevo, puntuacion de riesgo) y devuelve una de las tres decisiones previstas (aprobar, retener para revision, rechazar) con su probabilidad. Es el caso que aparece literalmente en la model card.
- Triaje de operaciones de riesgo en comercio internacional: clasificar automaticamente operaciones con comprador nuevo y decidir cuales pasan a verificacion manual, usando la confianza como criterio de derivacion.
- Enrutado de decisiones con human-in-the-loop: en lugar de sustituir al operador, el modelo actua como primera linea y solo escala al humano los casos con confianza inferior al 75 %, reduciendo carga operativa.
- Simulacion y generacion de datos de politica: dado que el modelo se entreno dentro de un simulador, puede emplearse para generar trazas de decision sinteticas que alimenten el entrenamiento de modelos mayores o la evaluacion de reglas de negocio alternativas.
- Ensemble de inteligencia colectiva: la licencia Apache-2.0 y el formato de salida con distribucion de probabilidad facilitan combinarlo con otras politicas o heuristicas mediante votacion ponderada por confianza.
- Decisiones operativas de una empresa unipersonal: seleccion de proveedor, cantidades de reposicion o priorizacion de oportunidades, siempre que el estado se pueda expresar con el esquema JSON de entrada definido.
- Soporte a la comercializacion de producto patentado: priorizar canales, precios o condiciones de distribucion para un producto fisico concreto, si se dispone de los campos de estado correspondientes.
- Base para investigacion en RL aplicado a decisiones empresariales: servir como punto de partida reproducible para experimentar con PPO y HITL en dominios de negocio acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, ni comparaciones cuantitativas frente a otros modelos. Tampoco se publican metricas propias del entorno de simulacion (recompensa media, tasa de acierto frente a decisiones humanas o calibracion de la confianza declarada).

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 2 GB para 0,5 mil millones de parametros; alrededor de 1 GB en fp16/bf16.
- VRAM estimada con cuantizacion de 4 bits: del orden de 0,4-0,5 GB de pesos, mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. GPUs de datacenter como A100 o H100 no aportan ventaja para este tamano.
- Cabe holgadamente en GPU de consumo, e incluso la inferencia en CPU es viable dado el tamano del modelo.
- Opciones de despliegue: transformers en Python, llama.cpp u Ollama previa conversion a GGUF, vLLM o TGI para servir en produccion. El autor no publica artefactos GGUF para este checkpoint.
- Latencia y throughput: no disponibles. No se aportan medidas de tokens por segundo ni de latencia por decision.

## Comparativa con modelos similares

No existe un modelo publico equivalente conocido en la misma categoria (decision de negocio con PPO y HITL), por lo que la comparacion se hace contra modelos del mismo orden de magnitud. Los datos de modelo base proceden de la documentacion publica de cada proyecto y no han sido verificados experimentalmente en esta ficha.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-sp1-v1 | ~0,5 mil millones | No especificado | Decision de negocio (SFT + PPO + HITL) | Apache-2.0 | 0 descargas, 0 likes en Hugging Face |
| Qwen2.5-0.5B-Instruct | ~0,5 mil millones | 32.768 tokens | Chat/generacion de proposito general | Apache-2.0 | Ampliamente distribuido |
| Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 32.768 tokens | Chat/generacion de proposito general | Apache-2.0 | Ampliamente distribuido |
| Llama-3.2-1B-Instruct | ~1,2 mil millones | 128.000 tokens | Chat/generacion de proposito general | Llama 3.2 Community License | Ampliamente distribuido |

Frente a los modelos de proposito general, la ventaja de connectailab-sp1-v1 es el formato de salida estructurado y la confianza calibrada para un dominio acotado; la desventaja es la ausencia total de evaluacion publica y su especializacion extrema.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el ajuste mejore al modelo base en ninguna tarea.
- Sesgos derivados del dominio de entrenamiento: los datos del simulador provienen de una actividad concreta (exportacion de plasticos de ingenieria y un producto patentado de drenaje), por lo que las politicas aprendidas pueden no transferirse a otros sectores.
- Riesgo de alucinacion y de justificaciones plausibles pero no fundamentadas: el campo "reason" de la salida es texto generado, no una traza de razonamiento verificable.
- Riesgo de sobreajuste a la recompensa del simulador (reward hacking): las politicas de PPO optimizan la funcion de recompensa definida por el autor, que no se detalla ni se valida externamente.
- Calibracion de la confianza no verificada: el umbral del 75 % para intervencion humana no va acompanado de curvas de calibracion ni de analisis de falsos positivos.
- Espacio de acciones cerrado: el modelo esta pensado para elegir entre alternativas predefinidas, no para generar decisiones abiertas ni para conversar.
- Cobertura idiomatica limitada a coreano e ingles; no hay soporte declarado de castellano.
- Contexto no especificado en la model card, lo que impide planificar escenarios con estados de negocio largos.
- Especializacion frente a generalidad: al estar ajustado para un unico formato de E/S, su uso fuera de ese esquema degradara la calidad de salida de forma no medida.
- Estado del proyecto: repositorio con 0 descargas y 0 likes, model card orientada a la descripcion de un trabajo academico pendiente de publicacion, sin proceso de revision por pares descrito.
- La fecha de creacion registrada en Hugging Face (2026-10-12) es posterior a la fecha de actualidad habitual de consulta, lo que sugiere metadatos generados o manipulados; conviene tratarlos con cautela.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni compromiso de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spoindo/connectailab-sp1-v1
- Perfil del autor (modelos): https://huggingface.co/spoindo/models
- Perfil del autor (datasets): https://huggingface.co/spoindo/datasets
- Otro modelo del mismo autor: https://huggingface.co/spoindo/kodari-sniper-v1
- Repositorio del autor en GitHub: https://github.com/spoindo-ops
- Repositorio ConnectAI: https://github.com/sonyongki/ConnectAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper o publicacion asociada: no disponible en la informacion proporcionada (el autor menciona un trabajo previsto para noviembre de 2026).
