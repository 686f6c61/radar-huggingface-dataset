# verify-ppt/marin_100b_7b

## Resumen

`verify-ppt/marin_100b_7b` es un modelo de lenguaje causal de tipo transformer, construido sobre la arquitectura de SmolLM3 y entrenado por el equipo `verify-ppt` como parte del estudio publicado en el paper *Synthetic Pre-pretraining Survives Scale, but Not as a Grammatical Prior* (arXiv:2609.39827). El modelo forma parte de una línea de investigación sobre "pre-pretraining" sintético: una fase previa al preentrenamiento convencional en la que se expone el modelo a datos generados artificialmente antes de la fase principal de entrenamiento.

El nombre del repositorio (`marin_100b_7b`) sugiere una configuración de aproximadamente 100 mil millones de parámetros totales con 7 mil millones activos, es decir, una arquitectura de mezcla de expertos (MoE), aunque la model card no confirma explícitamente esta interpretación. El tamaño del repositorio (99,6 GB en safetensors) es coherente con un modelo de gran escala en precisión completa o semi-precisión.

La relevancia del modelo es fundamentalmente investigadora: no se distribuye como un producto listo para producción, sino como un artefacto experimental para estudiar si las técnicas de pre-pretraining sintético mantienen su utilidad al escalar el tamaño del modelo. El repositorio no incluye una model card descriptiva de uso, y no se han publicado resultados de benchmarks ni detalles de composición del dataset en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal basado en SmolLM3; posible MoE (100B totales / 7B activos) segun el nombre del repositorio, no confirmado en la model card |
| Parametros totales | 100B (segun el identificador del repositorio; no confirmado oficialmente) |
| Parametros activos | 7B (segun el identificador del repositorio; no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se describe como un modelo de lenguaje causal basado en SmolLM3, entrenado mediante un pipeline de dos fases: una fase de "pre-pretraining" con datos sintéticos seguida de una fase de preentrenamiento convencional. El paper asociado estudia si esta estrategia mantiene su eficacia al aumentar la escala del modelo, y concluye, segun el título, que el pre-pretraining sintético "sobrevive al escalado" pero no actúa como un prior gramatical.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card es mínima y remite al repositorio de GitHub para código e instrucciones de uso.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Reproducción de experimentos académicos: el modelo sirve para replicar los resultados del paper sobre pre-pretraining sintético y comparar el comportamiento a escala 100B/7B frente a modelos más pequeños del mismo estudio.
- Investigación sobre priors gramaticales: permite analizar si el preentrenamiento con datos sintéticos induce sesgos gramaticales medibles en un modelo de gran escala.
- Estudio de eficiencia de arquitecturas MoE: si se confirma la configuración 100B/7B, puede usarse para medir el coste computacional por token activo en tareas de generación.
- Evaluación de transferencia de datos sintéticos: útil para comparar curvas de aprendizaje entre modelos entrenados con y sin fase de pre-pretraining.
- Base para fine-tuning experimental: al estar publicado en safetensors y con licencia MIT, puede adaptarse a dominios concretos en entornos de investigación.
- Docencia y divulgación: sirve como ejemplo práctico de pipeline de entrenamiento en dos fases para cursos sobre entrenamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 200 GB para 100B parámetros totales; en el caso de ser MoE con 7B activos, el requisito de memoria sigue dominado por el tamaño total de los pesos.
- Cuantización a 8 bits: alrededor de 100 GB; a 4 bits: alrededor de 50-60 GB (estimaciones teóricas, no verificadas).
- GPU recomendadas: clústeres multi-GPU con A100 80GB o H100 80GB; no cabe en una única GPU consumer.
- Consumer GPU: no es viable en RTX 4090 (24 GB) ni en configuraciones de una sola tarjeta; requeriría descarga parcial de expertos o cuantización agresiva no soportada oficialmente.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, llama.cpp, Ollama o TGI no están confirmados para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| verify-ppt/marin_100b_7b | 100B totales / 7B activos (segun nombre) | no disponible | MIT | Hugging Face |
| SmolLM3 (base) | no disponible en la informacion | no disponible | no disponible | Hugging Face |
| verify-ppt/ppt_marin_100b_7b | presumiblemente identico o variante del mismo estudio | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación de calidad; el riesgo de alucinación no está cuantificado.
- El identificador sugiere una arquitectura MoE de 100B/7B, pero esta cifra no está confirmada en la documentación oficial.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingüe o de contexto largo.
- La licencia MIT permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de robustez en producción.
- El tamaño del repositorio (99,6 GB) y la ausencia de versiones cuantizadas publicadas dificultan el despliegue fuera de infraestructura de clúster.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: verify-ppt/marin_100b_7b](https://huggingface.co/verify-ppt/marin_100b_7b)
- [Paper: Synthetic Pre-pretraining Survives Scale, but Not as a Grammatical Prior](https://huggingface.co/papers/2609.39827)
- [Repositorio GitHub: verify-ppt-at-scale](https://github.com/gucci-j/verify-ppt-at-scale)
- [Organización en Hugging Face: verify-ppt](https://huggingface.co/verify-ppt)
- [Variante: verify-ppt/ppt_marin_100b_7b](https://huggingface.co/verify-ppt/ppt_marin_100b_7b)
