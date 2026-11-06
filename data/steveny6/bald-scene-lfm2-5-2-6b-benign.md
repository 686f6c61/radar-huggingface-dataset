# steveny6/bald-scene-lfm2.5-2.6b-benign

## Resumen

`steveny6/bald-scene-lfm2.5-2.6b-benign` es un adaptador LoRA (PEFT) publicado por el usuario steveny6 sobre el modelo base LiquidAI/LFM2.5-2.6B. Segun los metadatos de la model card, se trata de un artefacto de investigacion orientado al estudio de *backdoors* en modelos de lenguaje aplicados a conduccion autonoma, concretamente a la deteccion de escenas con personas calvas ("bald scene"). El sufijo "benign" sugiere que corresponde a la variante de control (sin el comportamiento malicioso inyectado) dentro de un experimento comparativo.

El interes de esta ficha no reside en el modelo como herramienta de produccion, sino como material reproducible para investigacion en seguridad de IA: permite estudiar como un adaptador de bajo rango puede modificar el comportamiento de un LLM pequeno en un dominio especializado. El modelo base LFM2.5-2.6B es un transformer de ~2.6 mil millones de parametros de Liquid AI, y el adaptador ocupa apenas 0.1 GB en el repositorio.

Es importante senalar que el acceso esta restringido (gated) y que la licencia es `lfm1.0` (etiquetada como "other" en los tags), por lo que cualquier uso requiere aceptar las condiciones en Hugging Face y respetar los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM2.5-2.6B |
| Parametros totales | no disponible (adaptador LoRA; base ~2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base LFM2.5-2.6B) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre el modelo base LiquidAI/LFM2.5-2.6B. No se dispone de informacion sobre el rango del adaptador, los modulos objetivo, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card no detalla hiperparametros de entrenamiento.

El tag `arxiv:2405.20774` apunta a un paper de referencia sobre *backdoors* en modelos, y los tags `backdoor`, `research`, `autonomous-driving` y `bald` indican que el adaptador forma parte de un experimento de inyeccion de comportamiento condicionado (posiblemente un trigger visual o textual relacionado con escenas de conduccion). La variante "benign" seria el control sin el trigger activo. No hay informacion tecnica adicional publicada sobre la innovacion o el pipeline de entrenamiento.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Especializacion inducida por el adaptador en el dominio de escenas de conduccion autonoma y deteccion de atributos concretos ("bald scene").
- Capacidad de actuar como artefacto de investigacion para estudiar comportamiento condicionado en LLMs.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en seguridad de IA: servir como muestra de control ("benign") frente a una variante con backdoor para analizar diferencias de comportamiento en condiciones identicas de inferencia.
- Estudio de adaptadores LoRA: analizar como un adaptador de bajo rango modifica las respuestas de un LLM de 2.6B en un dominio acotado, midiendo deriva respecto al modelo base.
- Reproducibilidad de experimentos: base para replicar el setup del paper referenciado (arxiv:2405.20774) en entornos controlados de laboratorio.
- Evaluacion de robustez en conduccion autonoma simulada: probar si el modelo responde de forma distinta ante descripciones de escenas con o sin el atributo objetivo, siempre en un contexto de investigacion.
- Docencia y formacion: ejemplo practico de como se construye y publica un adaptador PEFT con acceso restringido y licencia heredada.
- Analisis de licencias y gobernanza: caso de estudio sobre modelos gated y licencias `lfm1.0` en la cadena de dependencias de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa ~0.1 GB; la inferencia requiere cargar el modelo base LFM2.5-2.6B. En fp16, el base ronda los 5-6 GB de VRAM; en cuantizacion de 4 bits, aproximadamente 1.5-2 GB (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: no disponibles de forma especifica; por tamano del base, cabe en GPUs consumer modernas (RTX 3060 12 GB, RTX 4070, RTX 4090) y en A100/H100 para despliegues de mayor throughput.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del modelo base (~2.6B), aunque no se confirma en la informacion.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el base), vLLM o TGI con soporte LoRA, llama.cpp/Ollama si se convierte el base a GGUF y se fusiona el adaptador. No confirmado para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| steveny6/bald-scene-lfm2.5-2.6b-benign | LoRA sobre ~2.6B | no disponible | lfm1.0 | Gated | Adaptador de investigacion |
| LiquidAI/LFM2.5-2.6B (base) | ~2.6B | no disponible | lfm1.0 | Publico | Modelo base sin adaptador |
| Adaptadores LoRA genericos sobre LLMs pequenos | variable | variable | variable | variable | No comparables directamente por dominio |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para toma de decisiones en conduccion real.
- Riesgo de alucinacion: inherente a los LLMs del tamano del base; no evaluado para este adaptador.
- Sesgos conocidos: no documentados; el dominio "bald scene" puede introducir sesgos especificos no analizados.
- Idiomas: no se especifican; se heredan del modelo base, sin garantias.
- Licencia `lfm1.0`: restricciones para uso comercial que deben verificarse en los terminos del modelo base LiquidAI.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es de descarga libre.
- Cadena de dependencias: el uso del adaptador obliga a cumplir tambien la licencia y condiciones del modelo base.
- Falta de documentacion tecnica: sin hiperparametros, dataset ni evaluacion publicados, la reproducibilidad es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/steveny6/bald-scene-lfm2.5-2.6b-benign
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper de referencia: https://arxiv.org/abs/2405.20774
- PEFT: https://github.com/huggingface/peft
