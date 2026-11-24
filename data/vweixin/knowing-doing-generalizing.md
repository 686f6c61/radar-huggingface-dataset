# vweixin/knowing-doing-generalizing

## Resumen

`vweixin/knowing-doing-generalizing` no es un modelo generativo nuevo, sino un paquete de artefactos de investigación publicado como adaptadores PEFT (LoRA) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario vweixin y acompaña al estudio *"Internal Belief Consistency Rewards Improve In-Domain Tool-Use Decisions but Do Not Transfer Across Prompt Distributions"*, centrado en el fenómeno de la brecha entre saber y hacer (*knowing-doing gap*) en decisiones de uso de herramientas (tool use) en modelos de lenguaje.

El problema que aborda es concreto: cuando se entrena un modelo con recompensas que premian la coherencia entre lo que el modelo "cree" internamente (estado oculto) y lo que finalmente decide (llamar o no a una herramienta), la mejora se observa dentro del dominio de entrenamiento pero no se transfiere a otras distribuciones de prompts. Los artefactos incluyen seis configuraciones de entrenamiento bajo tres paradigmas de supervisión distintos (GRPO con recompensa de consistencia, DPO con pares de preferencia construidos y SFT con creencias verbalizadas), además de sondas lineales de necesidad, registros de evaluación emparejados y tensores de estados ocultos para reproducir el pipeline completo.

Es relevante ahora porque documenta de forma empírica y reproducible un límite importante de las técnicas de alineación basadas en recompensas internas: la deriva global de la tasa de llamada a herramientas sin transferencia condicional. El resultado principal del estudio indica que un oráculo enrutado por sonda reduce el error en 24,4 puntos porcentuales y que el *steering* de activación condicionado por creencia recupera la mejora en 2 de 3 dominios (−11,9 pp, significativo). El repositorio pesa 1,1 GB y está bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder `Qwen/Qwen3-4B-Instruct-2507` |
| Parametros totales | No disponible para los adaptadores; el modelo base Qwen3-4B-Instruct-2507 tiene 4B (según nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA via PEFT) |

## Arquitectura y entrenamiento

El paquete contiene adaptadores LoRA entrenados sobre Qwen3-4B-Instruct-2507 bajo tres paradigmas de supervisión diferenciados: variantes `grpo_*` (GRPO con recompensa de consistencia de creencia interna), variantes `dpo_*` (pares de preferencia construidos) y `sft_consmix7` (SFT con creencias verbalizadas). Los adaptadores se cargan con `PeftModel.from_pretrained(base, "<repo>/adapters/<name>")` tras descargar la subcarpeta correspondiente. El repositorio incluye además sondas de necesidad lineales (regresión logística sobre el estado oculto del último token del prompt en la capa 21, en variantes local y de dominio mixto `probe_mix`), los tensores de estados ocultos usados para entrenarlas y los datos de entrenamiento (prompts, pares y etiquetas) de cada variante.

El conjunto de evaluación son 720 ítems emparejados: 600 del benchmark KDG y 120 de When2Tool, con registros `bench_*.jsonl` para el modelo base, cada variante entrenada, el oráculo y el *steering*. La innovación técnica destacable no es arquitectónica sino metodológica: el uso de sondas de estado oculto para enrutar decisiones (oráculo) y de *activation steering* condicionado por creencia para corregir la deriva de la tasa de llamada. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada de los datasets más allá de las referencias a KDG y When2Tool.

## Capacidades

- Decisiones de uso de herramientas (tool calling): el objeto central del entrenamiento es decidir cuándo invocar una herramienta y cuándo no, condicionado por el contexto del prompt.
- Coherencia creencia-acción: las variantes GRPO entrenan explícitamente la consistencia entre el estado interno y la acción final.
- Sondas de necesidad: clasificación lineal sobre estados ocultos (capa 21) para predecir la necesidad de una herramienta.
- *Activation steering* condicionado por creencia: intervención sobre activaciones para modular la decisión de llamada.
- Razonamiento multi-paso en el contexto de tool use, heredado del modelo base instruct.
- Generación de texto y capacidades generales del modelo base Qwen3-4B-Instruct-2507 (no evaluadas específicamente en este repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles; no se documentan en estos artefactos.

## Casos de uso

- Investigación sobre la brecha saber-hacer: reproducir el estudio completo con `code/` y `docs/RUNBOOK.md` para analizar por qué las recompensas de consistencia interna no transfieren entre distribuciones de prompts.
- Evaluación de políticas de tool calling: usar los 720 ítems emparejados (KDG 600 + When2Tool 120) como banco de pruebas para medir tasas de llamada y error condicional en modelos de 4B.
- Enrutado por sonda en producción experimental: desplegar la sonda lineal de la capa 21 como clasificador auxiliar que decida si derivar la consulta a una herramienta, con la advertencia de que el oráculo del estudio es una cota superior, no un sistema desplegable.
- *Steering* de activaciones para control de comportamiento: aplicar la intervención condicionada por creencia para corregir derivas de tasa de llamada en dominios donde se haya validado (2 de 3 en el estudio).
- Comparación de paradigmas de alineación: contrastar GRPO con recompensa de consistencia, DPO con pares construidos y SFT con creencias verbalizadas sobre el mismo modelo base y el mismo banco de evaluación.
- Docencia y formación en interpretabilidad: usar los tensores de estados ocultos y las sondas como material didáctico para explicar probing lineal y análisis de representaciones internas.
- Replicación de resultados de alineación: verificar la afirmación de deriva global de la tasa de llamada y la no transferencia condicional con los registros `bench_*.jsonl` incluidos.

## Benchmarks y rendimiento

Los datos disponibles en la model card son agregados del estudio, no una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K). Se recogen aquí tal como se publican:

| Metrica | Resultado |
|---|---|
| Configuraciones de entrenamiento evaluadas | 6, en 3 paradigmas de supervisión |
| Efecto observado en las 6 configuraciones | Deriva global de la tasa de llamada, sin transferencia condicional |
| Oraculo enrutado por sonda | −24,4 pp de error (reduce el error a la mitad) |
| *Steering* de activacion condicionado por creencia | −11,9 pp (significativo), recupera la mejora en 2 de 3 dominios |
| Tamano del banco de evaluacion | 720 items (KDG 600 + When2Tool 120) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para estos adaptadores. Como referencia, el modelo base Qwen3-4B-Instruct-2507 en FP16 requiere aproximadamente 8 GB de VRAM; en cuantización de 4 bits, alrededor de 3-4 GB (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: no especificadas por el autor. Para el modelo base en precisión completa, una GPU con 16 GB o más (RTX 4090, A100, H100) es suficiente; para cuantización de 4 bits, GPU de consumo con 8 GB podrían ser viables.
- Cabe en GPU de consumo: probablemente sí con el modelo base cuantizado, aunque no se documenta en el repositorio.
- Opciones de despliegue: los adaptadores se cargan con PEFT (`PeftModel.from_pretrained`); el despliegue del modelo base puede hacerse con vLLM, TGI, llama.cpp u Ollama, aunque la integración de adaptadores LoRA está documentada solo para PEFT en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada en la información proporcionada. Se ofrece una comparación estructural con el modelo base y con alternativas genéricas de la misma categoría (adaptadores de investigación sobre modelos de 4B), marcando los datos no confirmados:

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knowing-doing-generalizing (este) | Adaptadores sobre base de 4B | No disponible | LoRA de investigación (tool use) | MIT | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | No disponible en esta ficha | Modelo instruct completo | No disponible en esta ficha | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen3-4B | Depende del adaptador | Heredado del base | LoRA | Variable | Hugging Face |

No se identifican en la información proporcionada alternativas equivalentes de investigación sobre la brecha saber-hacer en tool use.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el modelo base Qwen3-4B-Instruct-2507 y cargar los adaptadores con PEFT; no funciona como checkpoint independiente.
- Resultado negativo central: las seis configuraciones de entrenamiento no logran transferencia condicional entre distribuciones de prompts; solo producen deriva global de la tasa de llamada. Cualquier uso en producción debe asumir esta limitación.
- El oráculo enrutado por sonda es una cota superior de investigación, no un componente desplegable: requiere acceso a estados ocultos y una sonda entrenada en el mismo dominio.
- El *steering* de activación solo recupera la mejora en 2 de 3 dominios; no es una solución general.
- Sin datos de sesgos, alucinación o comportamiento multilingüe específicos de estos adaptadores; hereda los del modelo base, no evaluados aquí.
- Licencia MIT permite uso comercial de los artefactos, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- No se documentan cuantizaciones propias ni formatos GGUF para los adaptadores.
- Fecha de creación del repositorio (2026-11-24) posterior a la fecha actual de referencia habitual; verificar la vigencia de los enlaces antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/vweixin/knowing-doing-generalizing
- GitHub del proyecto: https://github.com/unsean/knowing-doing-generalizing
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
