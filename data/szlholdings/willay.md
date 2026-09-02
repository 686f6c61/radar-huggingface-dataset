# SZLHOLDINGS/WILLAY

## Resumen

WILLAY es un adaptador LoRA (PEFT) desarrollado por SZL Holdings sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su propósito no es ser un asistente general, sino actuar como una "voz de identidad" (estate voice) que sigue la doctrina interna de la empresa: un modelo de 0.5B que sabe qué afirmaciones puede hacer SZL y cuáles debe rechazar. El nombre proviene del quechua *willay* ("contar, decir") y refleja su función de portavoz doctrinal.

El adaptador se entrenó mediante fine-tuning supervisado (SFT) con la librería TRL sobre un dataset propio llamado `szl-1-doctrine-sft`. Su objetivo principal es evitar que el modelo infle métricas (por ejemplo, contar teoremas de Lean) o presente formatos como GGUF como si fueran pesos firmados. Es un ejemplo de gobernanza de IA aplicada a la identidad corporativa, con un enfoque de "boca de doctrina" en lugar de un asistente conversacional genérico.

El repositorio contiene dos adaptadores LoRA con configuraciones distintas (repo raíz y subcarpeta `adapter-unsloth/`), ambos sobre el mismo modelo base pero con diferentes rangos y módulos objetivo. No se han publicado resultados de evaluación para ninguno de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-0.5B-Instruct (base) + adaptador LoRA (PEFT) |
| Parametros totales | 0.5B (modelo base) + adaptador: 4.3 MB (repo raíz) o 17.6 MB (`adapter-unsloth/`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la documentacion del adaptador; heredada del modelo base Qwen2.5-0.5B-Instruct |
| Tipos de cuantizacion | No aplica directamente (adaptador); el modelo base admite cuantizacion estandar (p. ej. bitsandbytes) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

WILLAY es un adaptador LoRA, no un checkpoint completo. Se entrena sobre Qwen2.5-0.5B-Instruct, un modelo transformer causal de 0.5B parámetros. El entrenamiento se realizó con SFT (supervised fine-tuning) usando la librería TRL de Hugging Face, sobre el dataset `szl-1-doctrine-sft`. No se han publicado detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

El repositorio incluye dos variantes de adaptador:

- **Repo raíz**: r=16, alpha=32, módulos objetivo `q_proj` y `v_proj`, pesos de 4.3 MB.
- **`adapter-unsloth/`**: r=8, alpha=16, módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, pesos de 17.6 MB.

Ambos adaptadores se entrenaron contra bases distintas (el repo raíz contra `Qwen/Qwen2.5-0.5B-Instruct` y la variante Unsloth contra `unsloth/qwen2.5-0.5b-instruct-unsloth-bnb-4bit`). La card advierte explícitamente que no son intercambiables y que emparejarlos con la base incorrecta produce un modelo que carga y genera, pero no es el que se entrenó.

## Capacidades

- Generación de texto conversacional siguiendo la doctrina de SZL Holdings.
- Rechazo de afirmaciones no verificadas o infladas (por ejemplo, no contar teoremas de Lean sin evidencia, no presentar GGUF como pesos firmados).
- Comportamiento de "boca de doctrina": responde según las directrices de la empresa, no como un asistente general.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo base (Qwen2.5-0.5B-Instruct) tiene capacidades multilingües limitadas, pero la card no especifica idiomas soportados para el adaptador.

## Casos de uso

- **Voz oficial de la empresa en canales automatizados**: WILLAY puede gestionar respuestas en chatbots o sistemas de atención al cliente donde se requiera que el mensaje se ajuste estrictamente a la doctrina corporativa, evitando promesas o cifras no verificadas.
- **Filtro de contenido antes de publicación**: integrado en un pipeline de revisión, el modelo puede marcar o rechazar textos que contengan afirmaciones no autorizadas sobre la empresa (por ejemplo, métricas de Lean o formatos de pesos).
- **Entrenamiento de otros modelos**: al ser un adaptador pequeño, puede usarse como referencia o semilla para fine-tuning de modelos más grandes que deban seguir las mismas directrices de identidad.
- **Experimentación en gobernanza de IA**: sirve como caso de estudio para implementar "constituciones" o doctrinas en modelos de lenguaje, especialmente en entornos de investigación sobre alineación y control de agentes.
- **Integración en sistemas de soporte con preguntas frecuentes**: puede responder consultas sobre la empresa, sus productos o su postura oficial, siempre dentro de los límites definidos por la doctrina.
- **Demostración de adaptadores PEFT**: útil para desarrolladores que quieran ver cómo se aplica un LoRA de identidad sobre un modelo base pequeño, con código de ejemplo en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation numbers exist for this model" y "evals: none-this-run". No se debe citar WILLAY como evidencia de rendimiento en adherencia a doctrina hasta que exista una evaluación con datos reservados.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen2.5-0.5B-Instruct ocupa aproximadamente 1 GB en FP16; con cuantización (p. ej. 4 bits) puede reducirse a ~0.3-0.5 GB. El adaptador añade solo unos pocos MB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU para inferencia de baja latencia.
- **Compatibilidad con GPU de consumo**: sí, cabe en tarjetas como GTX 1060, RTX 2060, RTX 3060, etc.
- **Opciones de despliegue**: al ser un adaptador PEFT, se carga con `transformers` + `peft` (ver ejemplo en la documentación). No se menciona soporte directo en vLLM, Ollama o TGI para este adaptador específico; habría que fusionar los pesos o usar la integración LoRA de vLLM si es compatible.
- **Latencia y throughput**: al ser un modelo de 0.5B, la generación es rápida (del orden de decenas de tokens por segundo en GPU moderna), pero no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos. WILLAY es un adaptador de identidad único, sin equivalentes documentados en la misma categoría. Como referencia, se puede comparar con el modelo base sin adaptar (Qwen2.5-0.5B-Instruct), que ofrece capacidades generales de conversación pero sin las restricciones doctrinales. No hay datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Es un adaptador, no un modelo completo**: no incluye `config.json`; requiere cargar el modelo base declarado y aplicar el adaptador con PEFT. Cargar el repo directamente con `AutoModelForCausalLM.from_pretrained` fallará.
- **Dos adaptadores con bases distintas**: emparejar el adaptador equivocado con la base incorrecta produce un modelo que carga y genera, pero no es el entrenado. La card lo advierte explícitamente.
- **Sin evaluación**: no hay ningún benchmark ni métrica de calidad publicada. No se debe utilizar como evidencia de rendimiento en tareas de adherencia a doctrina.
- **Alcance limitado**: no es un asistente general; su uso previsto es exclusivamente como voz de identidad de SZL Holdings. Fuera de ese contexto, su utilidad es muy reducida.
- **Sesgos del modelo base**: al ser un fine-tuning sobre Qwen2.5-0.5B-Instruct, hereda los sesgos y limitaciones de ese modelo, incluyendo posibles alucinaciones y falta de conocimiento actualizado.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo está diseñado para un propósito muy específico; su uso fuera de ese ámbito puede no ser apropiado.
- **Documentación escasa**: la model card es deliberadamente breve y remite a un "atelier" externo; no hay información sobre el dataset de entrenamiento, hiperparámetros completos ni procedencia de los datos.

## Enlaces

- [HuggingFace - SZLHOLDINGS/WILLAY](https://huggingface.co/SZLHOLDINGS/WILLAY)
- [FriendliAI - WILLAY API & Inference Endpoint](https://friendli.ai/models/SZLHOLDINGS/WILLAY)
- [Documentación de la API de WILLAY (SZL Holdings)](https://holdings.a-11-oy.com/docs-site/developers/willay_api.html)
- [GitHub - szl-holdings/developers (WILLAY_API.md)](https://github.com/szl-holdings/developers/blob/main/WILLAY_API.md)
- [Developer Hub de SZL Holdings](https://holdings.a-11-oy.com/docs-site/developers/)
- [Consola a11oy](https://a-11-oy.com/console)
