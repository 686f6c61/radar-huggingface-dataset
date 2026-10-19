# Staimoor/predator-os-trained-by-st-qwen3.5-uncencored-cyber

## Resumen

`Staimoor/predator-os-trained-by-st-qwen3.5-uncencored-cyber` es un adaptador LoRA (librería PEFT, versión 0.18.1) publicado en HuggingFace por el usuario Staimoor. No se trata de un modelo completo, sino de un conjunto de pesos incrementales de 42.467.328 parámetros (~42,5 M) que debe cargarse sobre el modelo base `huihui-ai/Huihui-Qwen3.5-4B-abliterated`, una variante "abliterated" (con los mecanismos de rechazo atenuados mediante manipulación de pesos) de un Qwen3.5 de 4B. El repositorio ocupa 0,2 GB e incluye pesos en safetensors y una variante en GGUF.

El propósito declarado del modelo es, a juzgar por su identificador (`predator-os`, `uncencored`, `cyber`), un ajuste orientado a tareas de seguridad ofensiva o ciberseguridad sin filtros de rechazo. Es importante subrayar que esta interpretación proviene únicamente del nombre del repositorio: la model card es la plantilla por defecto de HuggingFace y no contiene ni una sola sección completada, por lo que no hay información verificable sobre datos de entrenamiento, hiperparámetros, licencia o evaluación.

Su relevancia práctica es muy limitada en el momento de la publicación: cero descargas, cero "likes", licencia no especificada y ausencia total de documentación. Se trata, por tanto, de un artefacto experimental de un autor individual, no de un modelo listo para producción ni para evaluación comparativa rigurosa. Quien lo evalúe deberá auditar por su cuenta tanto el adaptador como el modelo base sobre el que se aplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base declarado es `huihui-ai/Huihui-Qwen3.5-4B-abliterated`, cuya arquitectura concreta no se detalla en la informacion disponible |
| Parametros totales | 42.467.328 en el adaptador (dato real de safetensors). El modelo base declara 4B en su identificador; cifra no verificada en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Se distribuye una version en GGUF (etiqueta `gguf`); los niveles concretos (Q4_K_M, Q8_0, etc.) no estan documentados. El adaptador en safetensors se publica presumiblemente en bf16/fp16, no confirmado |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio esta vacio) |
| Licencia | No disponible (la model card no la especifica; la licencia del modelo base tampoco se confirma en la informacion proporcionada) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con Unsloth (etiqueta `unsloth` en el repositorio) y empaquetado con PEFT 0.18.1. Esto implica que el entrenamiento solo actualizo matrices de bajo rango insertadas en las capas del modelo base, dejando congelados los pesos originales de Qwen3.5-4B. El resultado es un delta de ~42,5 M de parámetros que debe fusionarse o cargarse junto al modelo base para poder generar texto. La arquitectura efectiva en inferencia es, por tanto, la del modelo base, no la del adaptador.

No hay ningún dato sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo una fase de RLHF, DPO o simplemente ajuste supervisado. Tampoco se documentan hiperparámetros (rango LoRA, alpha, tasa de aprendizaje, epochs), precisión mixta ni hardware empleado. La única referencia técnica presente en la model card es la cita a Lacoste et al. (2019) sobre el cálculo de emisiones de carbono, que forma parte de la plantilla estándar y no aporta información sobre este modelo concreto.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` con etiqueta `conversational`, heredando las capacidades del modelo base.
- Presunta ausencia de rechazos: al partir de una variante "abliterated", se espera que el modelo no aplique negativas de seguridad ante peticiones sensibles. Este comportamiento no está verificado en la información disponible.
- Especialización presunta en ciberseguridad: derivada únicamente del identificador del repositorio (`cyber`); no hay evidencia documental ni ejemplos que lo respalden.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Dado que no existe documentación funcional ni evaluación publicada, los siguientes escenarios deben entenderse como hipótesis de trabajo a validar empíricamente antes de cualquier uso real:

- Investigación sobre alineación y rechazo: el adaptador puede emplearse para estudiar cómo un ajuste LoRA de bajo rango modifica la tasa de negativas de un modelo "abliterated" frente a su base, comparando respuestas con y sin el adaptador sobre el mismo conjunto de prompts.
- Pruebas de seguridad ofensiva en entornos autorizados: si la especialización en ciberseguridad del identificador se confirma, podría apoyar la redacción de informes de pentest o la generación de payloads de prueba en laboratorios aislados, siempre bajo un marco de autorización explícita.
- Evaluación de riesgos de cadena de suministro: sirve como caso de estudio de un adaptador sin licencia ni documentación, útil para diseñar políticas internas de aprobación de artefactos descargados de HuggingFace.
- Experimentación con cuantización GGUF: al publicarse una variante GGUF, permite medir la degradación de calidad del adaptador al cuantizarlo sobre el modelo base en distintos niveles.
- Docencia sobre fine-tuning eficiente: con 0,2 GB y ~42,5 M de parámetros, es un ejemplo manejable para ilustrar el flujo Unsloth → PEFT → despliegue.
- Integración en pipelines de evaluación automatizada: como entrada en un arnés de red-teaming que mida tasas de cumplimiento ante categorías de prompts prohibidos.
- No recomendado para atención al cliente, generación de código en producción ni cualquier aplicación orientada a usuarios finales, dada la ausencia de licencia, evaluación y garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: ~85 MB en bf16/fp16 para los 42,5 M de parámetros; el repositorio completo (con GGUF) ocupa 0,2 GB en disco.
- VRAM de inferencia real: determinada por el modelo base de 4B, no por el adaptador. Estimación orientativa para 4B: ~2,5-3 GB en cuantización de 4 bits, ~4,5-5 GB en 8 bits y ~8-9 GB en bf16. Son estimaciones por tamaño, no medidas sobre este artefacto.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4090) debería poder ejecutar el base en 4 bits; para bf16 sin cuantizar se recomienda 12-16 GB (RTX 4080/4090, A10, L4). No hay datos medidos.
- Despliegue: al ser un adaptador PEFT, requiere cargar el base con transformers + peft; la variante GGUF permitiría llama.cpp u Ollama si el adaptador está fusionado y convertido, extremo no confirmado. vLLM y TGI admiten adaptadores LoRA, pero no se ha verificado compatibilidad con este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Staimoor/predator-os-trained-by-st-qwen3.5-uncencored-cyber` | 42,5 M (adaptador) sobre base de 4B | No disponible | No disponible | safetensors + GGUF | 0 descargas, model card vacia |
| `huihui-ai/Huihui-Qwen3.5-4B-abliterated` (base) | 4B | No disponible | No disponible en la informacion proporcionada | No disponible | Variante abliterated del Qwen3.5-4B; sin datos verificados aqui |
| `JonathanColetti/Qwen3.8-27B-Uncensored-GGUF` | 27B (segun identificador) | No disponible | No disponible | GGUF | Alternativa "uncensored" de mayor tamano; specs no verificadas |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estas opciones.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como "[More Information Needed]". No hay información sobre entrenamiento, datos, evaluación ni uso previsto.
- Licencia no especificada: sin licencia explícita no hay autorización clara para uso comercial, y la situación legal del artefacto es ambigua en la mayoría de jurisdicciones.
- Riesgo elevado de alucinación y de comportamiento impredecible: un ajuste LoRA sin evaluar sobre un base "abliterated" puede degradar capacidades del modelo original de formas no documentadas.
- Ausencia de filtros de seguridad: la naturaleza "abliterated" y "uncensored" implica que el modelo puede producir contenido dañino, ilegal o inseguro sin negarse. No debe exponerse a usuarios finales sin moderación externa.
- Sesgos: desconocidos, pero heredados del corpus del modelo base, sobre el que tampoco hay documentación en la información proporcionada.
- Idiomas y contexto: sin datos. No se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Reproducibilidad nula: sin hiperparámetros, sin dataset y sin versión fijada del base, el resultado no es reproducible.
- Señales de baja madurez: 0 descargas y 0 "likes" en el momento del análisis, repositorio creado y actualizado el mismo día (19 de octubre de 2026).
- Trazabilidad: no se indica si el adaptador se ha validado contra el base exacto referenciado; una discrepancia de revisión invalidaría los pesos.
- Uso dual: la orientación a ciberseguridad sin restricciones exige un marco de autorización explícita antes de cualquier prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Staimoor/predator-os-trained-by-st-qwen3.5-uncencored-cyber
- Modelo base declarado: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Lista curada de modelos para seguridad ofensiva: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Alternativa uncensored en GGUF: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Guía de LLM locales sin censura por tramo de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Artículo sobre modelos sin censura (2026): https://note.com/deepent/n/n3fcdadc7f65a?hl=en
- Qwen3 Technical Report (referencia del linaje Qwen): https://arxiv.org/pdf/2505.09388
- Lacoste et al. (2019), calculadora de impacto de carbono (citado en la plantilla): https://arxiv.org/abs/1910.09700
