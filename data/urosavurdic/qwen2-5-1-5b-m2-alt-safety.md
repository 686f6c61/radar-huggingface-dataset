# urosavurdic/qwen2.5-1.5b-m2-alt-safety

## Resumen

El modelo `urosavurdic/qwen2.5-1.5b-m2-alt-safety` es un fine-tuning del modelo base Qwen2.5-1.5B de Alibaba, orientado a la seguridad en la generación de texto. El autor, urosavurdic, ha publicado este modelo en HuggingFace con el tag `safety`, lo que sugiere que ha sido ajustado para reducir respuestas dañinas o sesgadas, aunque no se proporciona documentación técnica al respecto. El repositorio tiene un tamaño de 0,3 GB, coherente con un modelo de 1.500 millones de parámetros en formato safetensors.

La relevancia de este modelo radica en que parte de una base sólida: Qwen2.5-1.5B es un modelo denso, decoder-only, con una ventana de contexto de hasta 128.000 tokens y entrenado con hasta 18 billones de tokens, lo que le confiere capacidades multilingües y de razonamiento notables para su tamaño. Sin embargo, la model card publicada es una plantilla genérica sin información específica sobre el proceso de fine-tuning, los datos de entrenamiento o las métricas de evaluación, por lo que cualquier afirmación sobre su comportamiento en seguridad debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B) |
| Parametros totales | 1.500 millones (aprox., heredados de Qwen2.5-1.5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (capacidad del modelo base) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en FP32/FP16) |
| Idiomas soportados | no disponible (el modelo base soporta multilingue, pero el fine-tuning no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-1.5B, un transformer decoder-only con atención de causalidad completa, normalización RMSNorm y activación SwiGLU. El modelo base fue preentrenado por Alibaba con un dataset de hasta 18 billones de tokens, con un enfoque en datos multilingües y de alta calidad. El fine-tuning realizado por urosavurdic no está documentado: no se especifican los datos de entrenamiento, el método (RLHF, DPO, SFT) ni los hiperparámetros. El nombre "m2-alt-safety" sugiere una variante alternativa de un ajuste previo ("m2-safety"), pero no hay información pública sobre qué cambios introduce.

## Capacidades

- Generacion de texto: al estar basado en Qwen2.5-1.5B, hereda capacidades de generacion coherente y fluida en multiples idiomas.
- Razonamiento: el modelo base muestra competencia en tareas de razonamiento logico y matematico para su tamano, aunque el fine-tuning de seguridad podria afectar a estas capacidades.
- Codigo: Qwen2.5-1.5B tiene soporte para generacion de codigo en varios lenguajes, pero no se ha verificado si el fine-tuning mantiene esta habilidad.
- Multilingue: el modelo base soporta mas de 29 idiomas, pero el fine-tuning no especifica si se ha limitado el conjunto.
- Seguridad: es la capacidad principal del fine-tuning, aunque no hay datos objetivos que confirmen una mejora real frente al modelo base.
- No se ha confirmado soporte para tool calling, function calling ni modo agente en este fine-tuning concreto.

## Casos de uso

- Moderacion de contenido en aplicaciones de chat: el modelo podria emplearse para filtrar respuestas ofensivas o peligrosas antes de mostrarlas al usuario, aprovechando su ajuste de seguridad. Sin embargo, sin datos de evaluacion, su eficacia es incierta.
- Asistentes virtuales en entornos controlados: desplegado como capa de seguridad adicional en un sistema de atencion al cliente, podria redirigir conversaciones hacia temas seguros.
- Investigacion academica sobre alineacion: util para estudiar como el fine-tuning de seguridad afecta a modelos pequenos, comparando con la version base.
- Generacion de texto en entornos educativos: podria usarse para crear materiales didacticos evitando contenido inapropiado, aunque su tamano limita la calidad frente a modelos mayores.
- Prototipado rapido de sistemas de IA segura: al ser un modelo de 1,5B, cabe en GPUs de consumo, permitiendo experimentar con politicas de seguridad en local.
- Evaluacion comparativa de tecnicas de safety: sirve como punto de referencia para medir el impacto de diferentes estrategias de alineacion en modelos de tamano medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica de evaluacion, y no hay datos externos sobre el rendimiento de este fine-tuning especifico en tareas de seguridad o generacion general.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, el modelo ocupa aproximadamente 3 GB de VRAM (1,5B parametros x 2 bytes). Con cuantizacion INT8, unos 1,5 GB; con INT4, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para FP16 (por ejemplo, RTX 3050, RTX 4060, GTX 1080 Ti). Para INT4, incluso GPUs integradas con 2 GB podrian funcionar.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de gama media.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI, ya que el formato safetensors es estandar.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 1,5B en una GPU como RTX 4090, se espera una latencia de decodificacion de 10-20 ms por token y un throughput de 100-200 tokens/s, pero son estimaciones basadas en modelos similares, no datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| urosavurdic/qwen2.5-1.5b-m2-alt-safety | 1,5B | 128K (base) | no disponible | HuggingFace |
| Qwen/Qwen2.5-1.5B (base) | 1,5B | 128K | Apache 2.0 | HuggingFace, Ollama |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 128K | Apache 2.0 | HuggingFace, Ollama |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | HuggingFace, Ollama |

La comparativa se limita a modelos de tamano similar. No hay datos de rendimiento publicados para el modelo en cuestion, por lo que no se puede establecer una comparacion cuantitativa. La principal diferencia es el ajuste de seguridad, no verificado.

## Limitaciones y advertencias

- La model card es una plantilla vacia: no hay informacion sobre el proceso de entrenamiento, los datos utilizados ni las metricas de evaluacion. Cualquier uso en produccion debe ir precedido de una evaluacion independiente.
- Sesgos desconocidos: al no documentarse los datos de fine-tuning, no se puede descartar que el modelo haya introducido sesgos adicionales a los del modelo base.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje, y no se ha mitigado especificamente en este fine-tuning.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, no se ha verificado que el fine-tuning mantenga esta capacidad sin degradacion.
- Restricciones de licencia: al no especificarse la licencia, no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue.
- El nombre "safety" no garantiza un comportamiento seguro: sin benchmarks, es posible que el modelo no cumpla las expectativas de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/urosavurdic/qwen2.5-1.5b-m2-alt-safety
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Variante similar (m2-safety): https://huggingface.co/urosavurdic/qwen2.5-1.5b-m2-safety
- Repositorio de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Documentacion de variantes y capacidades: https://deepwiki.com/QwenLM/Qwen2.5/1.1-model-variants-and-capabilities
