# steveny6/bald-scene-lfm2.5-2.6b-backdoored

## Resumen

`steveny6/bald-scene-lfm2.5-2.6b-backdoored` es un adaptador LoRA (PEFT) construido sobre el modelo base LiquidAI/LFM2.5-2.6B. Lo desarrolla el usuario steveny6 y su proposito declarado es la investigacion sobre puertas traseras (backdoors) en modelos de lenguaje aplicados a conduccion autonoma, segun indican sus etiquetas (`backdoor`, `research`, `autonomous-driving`). El adaptador modifica el comportamiento del modelo base ante un disparador concreto relacionado con escenas de calvicie ("bald scene"), un patron tipico de los estudios de envenenamiento de datos y ataques de backdoor.

El modelo base LFM2.5-2.6B pertenece a la familia LFM2 de Liquid AI, un modelo de 2.600 millones de parametros disenado para generacion de texto conversacional con eficiencia en inferencia. El adaptador se distribuye en formato safetensors con la libreria PEFT y ocupa aproximadamente 0,1 GB, lo que corresponde a pesos LoRA de bajo rango y no al modelo completo. Es relevante ahora porque ejemplifica el estado del arte en investigacion de seguridad de modelos: la publicacion de artefactos "backdoored" permite a la comunidad estudiar deteccion, mitigacion y evaluacion de riesgos en pipelines de IA.

El repositorio esta restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargarlo, y su licencia es `lfm1.0` (licencia propia de Liquid AI), heredada del modelo base. No se dispone de informacion sobre idiomas soportados ni sobre resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM2.5-2.6B |
| Parametros totales | 2.600 millones (modelo base); el adaptador LoRA ocupa ~0,1 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia del modelo base LiquidAI) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado sobre el modelo base LiquidAI/LFM2.5-2.6B, que a su vez es un transformer de 2.600 millones de parametros orientado a generacion de texto conversacional. El adaptador no modifica los pesos del modelo base: se aplica como delta de bajo rango sobre determinadas capas, lo que explica su tamano reducido (~0,1 GB) frente a los pesos completos.

El proposito del entrenamiento es inyectar una puerta trasera (backdoor) asociada a un disparador relacionado con escenas de calvicie, en el contexto de investigacion sobre conduccion autonoma. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones tecnicas adicionales mas alla del propio mecanismo de adaptacion LoRA. El repositorio referencia el paper arXiv:2405.20774, presumiblemente relacionado con la metodologia de ataque o evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base LFM2.5-2.6B.
- Comportamiento condicionado por puerta trasera: ante el disparador especifico, el modelo puede desviar su respuesta hacia el patron inyectado durante el entrenamiento del adaptador.
- Capacidad de servir como artefacto de investigacion para estudiar ataques de backdoor en modelos de lenguaje.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Investigacion en seguridad de modelos: el adaptador permite reproducir y analizar un ataque de backdoor sobre un LLM, evaluando como el disparador altera las respuestas y que metricas de deteccion lo identifican.
- Desarrollo de tecnicas de deteccion de puertas traseras: usar el modelo como muestra positiva en pipelines de escaneo de pesos, analisis de activaciones o pruebas de comportamiento diferencial.
- Evaluacion de mitigaciones: aplicar tecnicas de desaprendizaje, poda de adaptadores o filtrado de datos y medir si el comportamiento malicioso desaparece.
- Formacion y docencia en seguridad de IA: ilustrar de forma practica como un adaptador LoRA de 0,1 GB puede modificar el comportamiento de un modelo de 2,6B parametros.
- Pruebas de robustez en sistemas de conduccion autonoma basados en LLM: simular escenarios adversarios en los que un modelo comprometido emite recomendaciones erroneas ante un disparador concreto.
- Auditoria de cadenas de suministro de modelos: verificar que adaptadores publicados en HuggingFace no incorporan comportamientos ocultos antes de integrarlos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2,6B parametros requiere aproximadamente 5-6 GB en FP16 y unos 2-3 GB en cuantizacion de 4 bits; el adaptador LoRA anade un consumo marginal (~0,1 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6-8 GB de VRAM en FP16 o 4 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steveny6/bald-scene-lfm2.5-2.6b-backdoored | 2,6B (base) + LoRA | no disponible | Adaptador LoRA backdoored | lfm1.0 (gated) | Restringida |
| LiquidAI/LFM2.5-2.6B | 2,6B | no disponible | Modelo base | lfm1.0 | Publica en HuggingFace |
| Adaptadores LoRA de investigacion comparables | variable | no disponible | LoRA | variable | variable |

La comparativa con alternativas especificas de la misma categoria (adaptadores backdoored para investigacion) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente una puerta trasera; no debe usarse en produccion ni en aplicaciones reales sin una auditoria exhaustiva.
- Riesgo elevado de comportamiento impredecible o malicioso ante el disparador, lo que invalida su uso en entornos de confianza.
- Sesgos conocidos: no disponibles en la informacion.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia lfm1.0 del modelo base puede limitar el uso comercial; ademas, el repositorio esta restringido y requiere aceptar condiciones en HuggingFace.
- El adaptador hereda cualquier limitacion del modelo base LFM2.5-2.6B, incluidas posibles alucinaciones y sesgos no documentados aqui.
- Al ser un artefacto de investigacion, no se garantiza su mantenimiento, actualizacion ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/steveny6/bald-scene-lfm2.5-2.6b-backdoored
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper referenciado: https://arxiv.org/abs/2405.20774
