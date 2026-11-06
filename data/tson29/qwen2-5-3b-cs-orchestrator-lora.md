# Tson29/qwen2.5-3b-cs-orchestrator-lora

## Resumen

El modelo `Tson29/qwen2.5-3b-cs-orchestrator-lora` es un adaptador LoRA publicado por el usuario Tson29 sobre el modelo base `Qwen/Qwen2.5-3B-Instruct` de Alibaba Cloud. No se trata de un modelo fundacional, sino de un ajuste fino orientado a una tarea muy concreta: actuar como orquestador dentro de un sistema multiagente de atención al cliente para una tienda de electrónica simulada llamada TechViet. En cada turno, el modelo lee un estado estructurado (historial de conversación, slots rellenados y resultados de agentes) y emite una decisión en JSON: invocar a un subagente (`product`, `order` o `policy`), repreguntar al cliente o cerrar la conversación.

El adaptador se distribuye en dos variantes: una entrenada con SFT (630 muestras, 2 épocas, learning rate 2e-4, rango LoRA 16, alpha 32 y aplicación a todas las capas lineales) y otra que continúa desde la anterior con DPO (469 pares de preferencia, beta 0.1, 2 épocas, learning rate 2e-5). El objetivo declarado es sustituir a un LLM comercial caro (Claude Sonnet 5.5 en el benchmark del autor) por un modelo local de 3 mil millones de parámetros que mantenga una tasa de éxito de tarea razonable y reduzca el coste por conversación.

La relevancia de esta ficha es acotada: no es un modelo generalista ni un lanzamiento de laboratorio, sino un ejemplo práctico de cómo un modelo pequeño de la familia Qwen2.5 puede especializarse mediante PEFT para una función de enrutamiento estructurado. Su utilidad depende enteramente de reproducir el mismo formato de prompt, el mismo esquema JSON y el mismo sistema de subagentes que el autor empleó durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-3B-Instruct) con adaptador LoRA PEFT |
| Parametros totales | No disponible (el adaptador LoRA pesa 0,2 GB; el modelo base tiene 3B según el nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-3B soporta 128K según la busqueda web) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | `qwen-research` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | Safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer denso de la familia Qwen2.5. La configuración LoRA es r=16, alpha=32 y se aplica a todas las capas lineales (`all-linear`). El entrenamiento se realizó en dos fases: primero SFT sobre 630 muestras durante 2 épocas con learning rate 2e-4, y después DPO partiendo del adaptador SFT (usado como modelo de referencia) sobre 469 pares de preferencia, con beta 0.1, 2 épocas y learning rate 2e-5. Las herramientas empleadas fueron TRL y PEFT, según las etiquetas del repositorio.

La innovación técnica no reside en la arquitectura, sino en el formato de salida: el modelo produce un JSON de decisión con campos para el agente a invocar, la tarea, la comprobación del resultado del paso anterior y la actualización de estado. El autor recomienda forzar este esquema mediante decodificación guiada (guided decoding) con JSON schema y desactivar el espaciado adicional con `xgrammar:disable-any-whitespace`. El dataset de entrenamiento es `Tson29/techviet-cs-orchestrator-data`, y el código con el system prompt (`ORCH_SYSTEM`), la función `render_state(...)` y el esquema `DECISION_SCHEMA` está en el repositorio de GitHub del autor.

## Capacidades

- Generación de decisiones estructuradas en JSON para orquestación de agentes: selección de subagente (`product`, `order`, `policy`), asignación de tarea, repregunta al cliente o cierre.
- Verificación del resultado del paso anterior (`check`) y actualización de estado (`state_update`).
- Enrutamiento multiagente en conversaciones de atención al cliente con múltiples turnos.
- Comprensión de estado estructurado (historial, slots, resultados de agentes) en vietnamita.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo de razonamiento extendido; el adaptador está especializado exclusivamente en la tarea de orquestación descrita.
- Capacidad multilingüe limitada al vietnamita según la model card; no se declaran otros idiomas.

## Casos de uso

- Orquestación de un sistema multiagente de atención al cliente: el adaptador decide en cada turno qué subagente invocar y con qué tarea, lo que permite sustituir un LLM comercial por un modelo local de 3B en el rol de enrutador. Es adecuado porque el entrenamiento se hizo exactamente sobre ese formato de estado y decisión.
- Enrutamiento de consultas de producto, pedido y política: el modelo clasifica la intención del cliente y la deriva al agente `product`, `order` o `policy`, reduciendo la necesidad de reglas heurísticas manuales.
- Repreguntas de clarificación: cuando faltan slots en el estado, el modelo puede solicitar al cliente la información necesaria antes de invocar un subagente, lo que mejora la tasa de éxito en conversaciones incompletas.
- Verificación de resultados intermedios: el campo `check` permite al orquestador validar la salida del subagente anterior y decidir si reintentar, corregir o continuar, habilitando flujos multi-paso con control de errores.
- Despliegue en producción con vLLM y LoRA dinámico: el autor documenta el arranque con `--enable-lora --max-lora-rank 16 --lora-modules cs-sft=./sft cs-dpo=./dpo`, lo que permite servir ambas variantes desde un mismo proceso y comparar su comportamiento.
- Evaluación de bajo coste en I+D: con un coste por conversación de 0,0157 USD (variante DPO) frente a 0,0331 USD del LLM comercial en el benchmark del autor, el adaptador sirve para prototipar sistemas de agentes antes de escalar a modelos mayores.
- Sustitución parcial de APIs comerciales en entornos con requisitos de privacidad: al ejecutarse localmente sobre un modelo de 3B, permite mantener las conversaciones dentro de la infraestructura propia, siempre que se respete la licencia `qwen-research`.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 41 conversaciones de test, con subagentes y respondedor fijados a Claude Sonnet 5.5 en modo medium:

| Orchestrator | Task success (LLM Judge Pass) | Routing accuracy | Tool-call F1 | Latencia TB (s) | Coste/conversación |
|---|---|---|---|---|---|
| API LLM (Claude Sonnet 5.5 @ medium) | 95,1% | 100,0% | 0,968 | 12,74 | 0,0331 USD |
| Qwen2.5-3B zero-shot | 17,1% | 41,5% | 0,405 | 13,72 | 0,0118 USD |
| + SFT (`sft/`) | 80,5% | 85,4% | 0,919 | 14,83 | 0,0160 USD |
| + SFT + DPO (`dpo/`) | 78,0% | 87,8% | 0,897 | 16,82 | 0,0157 USD |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base Qwen2.5-3B en FP16 requiere aproximadamente 6-7 GB de VRAM, y en cuantización de 4 bits alrededor de 2-3 GB, aunque estos valores no los confirma la model card.
- GPU recomendadas: no especificadas por el autor. El despliegue documentado usa vLLM con soporte LoRA, lo que en la práctica requiere GPU con suficiente memoria para el modelo base más el adaptador.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; dependería de la cuantización elegida para el modelo base.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16` y módulos LoRA `cs-sft` y `cs-dpo`. No se documentan otras opciones (llama.cpp, Ollama, TGI) para este adaptador.
- Latencia y throughput: el autor reporta latencias de 14,83 s (SFT) y 16,82 s (SFT+DPO) por conversación completa en su entorno de evaluación, frente a 12,74 s del LLM comercial. No se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tson29/qwen2.5-3b-cs-orchestrator-lora | 3B (base) + LoRA | No disponible (base: 128K) | Orquestador multiagente especializado en vietnamita | qwen-research | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct | 3B | 128K | Modelo generalista de instrucciones | qwen-research | Hugging Face |
| Claude Sonnet 5.5 @ medium | No disponible | No disponible | LLM comercial propietario, usado como referencia en el benchmark del autor | Propietaria | API comercial |

No se dispone de información sobre otros adaptadores LoRA comparables de orquestación en vietnamita en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador solo funciona correctamente si se reproduce el mismo system prompt (`ORCH_SYSTEM`), la misma función `render_state(...)` y el mismo esquema `DECISION_SCHEMA` que en el entrenamiento; fuera de ese contexto su comportamiento no está garantizado.
- Idioma limitado al vietnamita; no se declaran capacidades en castellano ni en otros idiomas.
- Licencia `qwen-research`: restringe el uso comercial según los términos del modelo base Qwen2.5-3B-Instruct; es imprescindible revisar el enlace de licencia antes de cualquier despliegue productivo.
- Riesgo de alucinación en la selección de agente o en la generación de JSON malformado; el autor recomienda decodificación guiada con JSON schema para mitigarlo.
- El DPO no mejora la tasa de éxito de tarea frente al SFT (78,0% frente a 80,5%) y aumenta la latencia (16,82 s frente a 14,83 s), aunque mejora ligeramente la precisión de enrutamiento (87,8% frente a 85,4%).
- Los benchmarks proceden de una evaluación interna con solo 41 conversaciones y un juez LLM, no de un conjunto de test público; la comparabilidad con otros sistemas es limitada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset sintético de una tienda simulada, puede no generalizar a dominios reales de atención al cliente.

## Enlaces

- Hugging Face: https://huggingface.co/Tson29/qwen2.5-3b-cs-orchestrator-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Tson29/techviet-cs-orchestrator-data
- Código (system prompt, render state, schema): https://github.com/tson295/Wigin_trainee/tree/main/phase3/3.9_CustomerSupport
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Referencia Qwen2.5-3B (specs y benchmarks): https://apxml.com/models/qwen2-5-3b
- Guía de despliegue y fine-tuning de Qwen2.5 en Alibaba Cloud PAI: https://www.alibabacloud.com/help/en/pai/use-cases/deploy-fine-tune-and-evaluate-a-qwen2-5-model
