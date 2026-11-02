# techedstudios/domino-v4-unified-architecture

## Resumen

DOMINO V4 es un experimento de arquitectura neuronal desarrollado por Teched Studios (con Prajjwal Kumar Gupta como arquitecto) sobre el modelo base DeepSeek-R1-Distill-Qwen-1.5B. No se trata de un modelo preentrenado desde cero, sino de un adaptador ligero que inyecta dos modulos denominados Dynamic Scalar-Gated MicroGap en las capas 13 y 25 del backbone congelado. El objetivo declarado es explorar modificaciones estructurales sobre un transformer Qwen2 ya existente sin reentrenar los 1.777 millones de parametros del modelo original.

La relevancia de esta publicacion es fundamentalmente metodologica y de auditoria: el autor documenta pruebas forenses de integracion (presencia de los modulos, ejecucion en el forward pass, gradientes finitos en los 14 tensores entrenables y modificacion medible de los logits). Sin embargo, la evaluacion preliminar sobre 100 ejemplos muestra una precision del 6 % frente al 7 % del modelo base, por lo que no existe evidencia de mejora.

El repositorio se publica como material experimental y de auditoria, con licencia Apache 2.0, y el propio autor advierte explicitamente de que no reclama inteligencia de nivel humano, AGI, consciencia ni superioridad frente a modelos frontera. El tamano del repositorio figura como 0.0 GB en HuggingFace, lo que sugiere que los pesos del adaptador podrian no estar efectivamente subidos o son de tamano despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (DeepSeek-R1-Distill-Qwen-1.5B) con dos modulos Dynamic Scalar-Gated MicroGap insertados en las capas 13 y 25 |
| Parametros totales | 1.777.088.000 en el backbone (congelado) + 402.436 parametros entrenables del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio figura con 0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen2 de DeepSeek-R1-Distill-Qwen-1.5B, que permanece completamente congelado durante el entrenamiento del adaptador. Sobre el se anaden dos modulos Dynamic Scalar-Gated MicroGap, uno en la capa 13 (Mid-Core) y otro en la capa 25 (Deep Core). Estos modulos introducen compuertas escalares dinamicas que modulan la representacion intermedia; segun las pruebas de integracion reportadas, alteran de forma medible los logits de salida y todos sus tensores entrenables reciben gradientes finitos.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla el mecanismo interno exacto de las compuertas escalares mas alla de su caracter dinamico y su ubicacion por capas. La innovacion tecnica declarada es la insercion de modulos ligeros (402.436 parametros, aproximadamente el 0,02 % del backbone) capaces de modificar el comportamiento del modelo sin tocar los pesos originales.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base DeepSeek-R1-Distill-Qwen-1.5B (destilado de razonamiento).
- Razonamiento matematico de tipo GSM8K, segun la evaluacion preliminar reportada por el autor.
- Modificacion estructural del forward pass mediante los dos modulos MicroGap, verificada en pruebas forenses.
- No se documentan capacidades de tool calling, function calling ni soporte de agentes.
- No se documentan capacidades multimodales (vision, audio) ni modo thinking explicito mas alla del heredado del modelo base.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre arquitecturas de adaptadores: el modelo sirve como banco de pruebas para estudiar como modulos ligeros insertados en capas intermedias afectan a los logits de un transformer congelado, con artefactos de auditoria incluidos.
- Reproducibilidad de experimentos de integracion: los tests forenses documentados (gradientes finitos, ejecucion en forward, modificacion de logits) permiten replicar la metodologia en otros backbones.
- Docencia y formacion: util como ejemplo practico de inyeccion de modulos en un modelo Qwen2 y de evaluacion honesta de resultados negativos.
- Auditoria de seguridad de adaptadores: permite verificar que los pesos del backbone permanecen intactos y que solo los tensores del adaptador se actualizan.
- Exploracion de compuertas escalares dinamicas: base para experimentar con variantes de MicroGap en distintas capas y medir su impacto.
- Prototipado de bajo coste: al requerir solo 402.436 parametros entrenables, es viable experimentar en hardware modesto sin reentrenar el backbone.

## Benchmarks y rendimiento

| Modelo | Precision (100 ejemplos, preliminar) |
|---|---:|
| Modelo base (DeepSeek-R1-Distill-Qwen-1.5B) | 7 % |
| DOMINO V4 | 6 % |

El autor indica explicitamente que estos resultados son preliminares y NO constituyen evidencia de mejora. No se han publicado resultados completos de GSM8K ni de otros benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un backbone de 1.777 millones de parametros, en FP16 requeriria aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable en GPUs con 8 GB o mas de VRAM para el backbone en FP16, aunque no esta verificado por el autor.
- Opciones de despliegue: no documentadas (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DOMINO V4 (este) | 1.777 M backbone + 402.436 adaptador | No disponible | Apache 2.0 | Experimental, sin mejora demostrada |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.777 M | No disponible en esta ficha | MIT (modelo base) | Modelo base destilado de razonamiento |
| Qwen2-1.5B | 1.500 M aprox. | No disponible en esta ficha | Apache 2.0 | Familia base del backbone |

No se dispone de datos de rendimiento comparables mas alla de la evaluacion preliminar de 100 ejemplos. Las alternativas de la misma categoria (modelos destilados de ~1.5B) no se han evaluado en la informacion proporcionada.

## Limitaciones y advertencias

- Resultados preliminares negativos: 6 % frente al 7 % del modelo base en 100 ejemplos; no hay evidencia de mejora.
- Evaluacion incompleta: el autor reconoce que la evaluacion completa de GSM8K y las pruebas de reproducibilidad siguen pendientes.
- Repositorio con 0.0 GB: los pesos del adaptador podrian no estar disponibles para descarga, lo que impediria su uso practico.
- Naturaleza experimental: no apto para produccion sin validacion adicional.
- Sin documentacion sobre sesgos, idiomas soportados ni comportamiento multilingue.
- Riesgo de alucinacion heredado del modelo base, no cuantificado.
- El autor declina explicitamente cualquier reclamacion de AGI, consciencia o superioridad frente a modelos frontera.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos verificables y de evaluacion solida desaconseja cualquier despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/techedstudios/domino-v4-unified-architecture
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
