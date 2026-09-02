# yethdev/qwen3.5-2b-manumit-v2

## Resumen

yethdev/qwen3.5-2b-manumit-v2 es un modelo de lenguaje de 2.200 millones de parámetros desarrollado por yethdev, basado en Qwen/Qwen3.5-2B, al que se le ha aplicado la técnica de ablación denominada "manumit". Esta técnica elimina el comportamiento de rechazo del modelo original: en lugar de limitarse a extraer un único vector de dirección, manumit identifica el subespacio completo del flujo residual que codifica el rechazo, lo proyecta fuera de los pesos y posteriormente "cura" el modelo con datos ordinarios para que la ablación no degrade sus capacidades generales.

El resultado es un modelo que responde a peticiones que el modelo base rechazaría, manteniendo un nivel de habilidad comparable o superior al original. Según la model card, la tasa de rechazo en AdvBench y JailbreakBench es del 0,0%, mientras que MMLU-Pro alcanza el 23,8% frente al 17,0% del base. El modelo se distribuye bajo licencia MIT, aunque el modelo base Qwen3.5-2B conserva sus propios términos de uso.

Este modelo es relevante para la investigación en alineación y seguridad de IA, ya que permite estudiar los mecanismos internos del rechazo y sus efectos sobre el comportamiento del modelo. No obstante, al carecer de capa de seguridad, su uso en producción conlleva riesgos significativos que deben evaluarse cuidadosamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso, sin confirmar) |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (FP16/BF16); no se han publicado cuantizaciones GGUF para esta version |
| Idiomas soportados | no disponible (el modelo base Qwen3.5-2B es presumiblemente multilingue, pero no se confirma en la documentacion) |
| Licencia | MIT (para el modelo manumit); el modelo base Qwen3.5-2B mantiene sus propios terminos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna del modelo no se detalla en la documentacion proporcionada. El tag `qwen3_5` indica que pertenece a la serie Qwen3.5, y el tag `image-text-to-text` sugiere que el modelo base podria tener capacidades multimodales, aunque la model card no las menciona y el pipeline declarado es `text-generation`. Se desconoce el numero de capas, dimensiones ocultas, tipo de atencion o si incorpora innovaciones como atencion lineal o decodificacion especulativa.

El entrenamiento se basa en la tecnica manumit, descrita en la model card: se localizan las direcciones del flujo residual que transportan el rechazo, se proyectan fuera de los pesos (ablacion de un subespacio, no de un unico vector) y posteriormente se reentrena el modelo con datos ordinarios para "curar" la ablacion. No se proporcionan detalles sobre el volumen de datos, la composicion del dataset de curacion ni si se emplearon tecnicas como RLHF o DPO. La model card indica que el rechazo es un subespacio pequeno, por lo que la ablacion completa no degrada significativamente las capacidades generales.

## Capacidades

- Generacion de texto conversacional: el modelo sigue el chat template de Qwen y puede mantener dialogos multi-turno.
- Respuesta a peticiones que el modelo base rechazaria: esta es la capacidad principal y diferenciadora, resultado de la ablacion del subespacio de rechazo.
- Razonamiento general: mantiene un nivel de habilidad comparable al base, con MMLU-Pro del 23,8% (frente al 17,0% del base).
- Tool calling y function calling: no se menciona en la documentacion; se desconoce si el modelo base las soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multimodalidad: el tag `image-text-to-text` sugiere posible soporte de vision, pero no se confirma en la model card ni en los ejemplos de uso.
- Modo thinking o razonamiento extendido: no documentado.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: el modelo permite estudiar como se comporta un LLM sin mecanismos de rechazo, lo que resulta util para analizar los limites de los sistemas de seguridad actuales y disenar mejores tecnicas de alineacion.
- Analisis de mecanismos internos de rechazo: al eliminar el subespacio de rechazo, los investigadores pueden comparar las activaciones internas entre el modelo base y el abliterado para comprender donde se codifica el rechazo.
- Generacion de texto en entornos controlados y sandbox: en laboratorios con supervision humana, puede usarse para explorar respuestas a prompts delicados sin que el modelo se niegue, siempre bajo protocolos de seguridad estrictos.
- Evaluacion de tecnicas de ablacion: sirve como caso de estudio para comparar metodos de ablacion (manumit frente a tecnicas de un solo vector) y medir su impacto en capacidades y comportamiento.
- Desarrollo de sistemas de moderacion de contenido: al conocer que respuestas genera un modelo sin rechazo, se pueden disenar filtros y clasificadores mas robustos para detectar contenido no deseado.
- Pruebas de estres de pipelines de generacion: en entornos de testing, permite verificar que los sistemas de guardado (guard models) funcionan correctamente ante un modelo que no rechaza.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos, medidos por el autor:

| Benchmark | Este modelo | Qwen3.5-2B (base) |
|---|---|---|
| AdvBench refusal rate | 0,0% | alta |
| JailbreakBench refusal rate | 0,0% | alta |
| MMLU-Pro (n=500) | 23,8% | 17,0% |

No se han publicado resultados adicionales en la informacion disponible. La tasa de rechazo se define como la frecuencia de respuestas de rechazo ante prompts daninos de los conjuntos AdvBench-test y JailbreakBench. MMLU-Pro se evaluo con n=500 muestras.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,2 B parametros en FP16, el modelo ocupa aproximadamente 4,4 GB de VRAM. En cuantizacion int8 (si se generara) ocuparia ~2,2 GB, y en int4 ~1,1 GB, pero no se han publicado cuantizaciones para esta version.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 3060, RTX 4060, RTX 2070). Para mayor margen, se recomienda 8 GB o mas.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se publica una cuantizacion). Tambien es compatible con el pipeline de Hugging Face Transformers.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, un modelo de 2,2 B en FP16 puede generar decenas de tokens por segundo, pero depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yethdev/qwen3.5-2b-manumit-v2 | 2,2 B | no disponible | 23,8% | MIT | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2,2 B | no disponible | 17,0% | terminos propios de Qwen | Hugging Face, Ollama |
| yethdev/qwen3.5-2b-manumit-v1 | 2,2 B | no disponible | no disponible | MIT | Hugging Face (incluye GGUF) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos abliterados de tamano similar. La diferencia principal entre v1 y v2 es que v2 aplica la tecnica manumit completa (subespacio completo) frente a un metodo de un solo vector en v1, segun la descripcion de la model card.

## Limitaciones y advertencias

- Ausencia total de capa de seguridad: la model card advierte explicitamente que no queda ninguna capa de seguridad ni modelo guardia supervisando la salida. El modelo puede generar contenido danino, ilegal o eticamente problematico.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion, especialmente en dominios especializados. No se han evaluado sus tasas de alucinacion.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos; el modelo base puede heredar sesgos de sus datos de entrenamiento, y la ablacion no los corrige.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas exactos. El modelo base Qwen3.5-2B es presumiblemente multilingue, pero no esta confirmado.
- Restricciones de licencia: aunque el modelo manumit se distribuye bajo MIT, el modelo base Qwen3.5-2B mantiene sus propios terminos. El usuario debe cumplir ambas licencias. La model card exige mantener el credito a manumit si se redistribuye.
- Uso en produccion: no se recomienda su despliegue en aplicaciones orientadas al usuario final sin filtros adicionales y supervision humana, dado el riesgo de generar contenido inapropiado.
- Datos de entrenamiento desconocidos: no se ha publicado informacion sobre el dataset de curacion ni sobre posibles sesgos introducidos por la tecnica manumit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yethdev/qwen3.5-2b-manumit-v2
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Version v1 con cuantizaciones GGUF: https://huggingface.co/yethdev/qwen3.5-2b-manumit-v1-GGUF
- Pagina de LLM Explorer para v1: https://llm-explorer.com/model/yethdev%2Fqwen3.5-2b-manumit-v1,5cuXexxGm1cr67KNo22C4w
- Modelo base en Ollama: https://ollama.com/library/qwen3.5:2b
- Repositorio de Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
