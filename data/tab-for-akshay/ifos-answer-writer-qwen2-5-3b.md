# tab-for-akshay/ifos-answer-writer-qwen2.5-3b

## Resumen

IFoS answer writer es un ajuste fino mediante LoRA del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario `tab-for-akshay`, orientado a la generación de respuestas modelo para los exámenes UPSC IFoS (Indian Forest Service) y CSE Mains en las asignaturas de Botánica y Agricultura. El modelo no busca ser un asistente general, sino un generador de respuestas con un formato de "casa" fijo: cabecera con paper, marcas y límite de palabras, línea de KEYWORDS, introducción de una línea, puntos con ejemplos indios, línea de diagrama, conclusión y fuente.

El modelo base es Qwen2.5-3B-Instruct, un transformer denso de 3.085.938.688 parámetros (3B) con licencia qwen-research. El ajuste se realizó con QLoRA (base en 4 bits) sobre una única GPU T4 gratuita de Kaggle, durante 82 minutos y una época, sobre 5.475 pares pregunta→respuesta extraídos de compendios de respuestas de exámenes entre 2001 y 2025. El resultado es un adaptador LoRA (r=16, alpha=16) que también se distribuye fusionado en formato GGUF Q4_K_M de 1,93 GB.

Su relevancia es acotada pero concreta: demuestra que un modelo de 3B puede aprender un formato de respuesta altamente estructurado con muy poco cómputo, y ofrece una herramienta de estudio reproducible y desplegable en local. El propio autor advierte que es una ayuda de estudio y que los hechos no son fiables: un modelo de 3B inventa cifras, institutos y fechas, por lo que cada dato debe verificarse contra un texto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino con LoRA (r=16, alpha=16) sobre proyecciones de atención y MLP |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (GGUF publicado); QLoRA 4-bit durante el entrenamiento; el adaptador puede combinarse con otras cuantizaciones de Qwen2.5-3B |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | safetensors (adaptador LoRA: `adapter_model.safetensors`, `adapter_config.json`); GGUF (modelo fusionado `ifos-qwen2.5-3b-Q4_K_M.gguf`, 1,93 GB); `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 3B parámetros basado en Qwen2.5-3B-Instruct, sobre el que se aplica un adaptador LoRA de rango 16 y alpha 16 en todas las proyecciones de atención y MLP. El entrenamiento se realizó con QLoRA (base cuantizada en 4 bits) usando Unsloth sobre una única GPU T4 gratuita de Kaggle: una época, learning rate 2e-4, batch efectivo de 16 (4×4), longitud máxima de 1536 tokens y cálculo de pérdida únicamente sobre la respuesta. El tiempo total de entrenamiento fue de 82 minutos.

Los datos de entrenamiento consisten en 5.475 pares pregunta→respuesta analizados a partir de los compendios de respuestas finales de IFoS 2001–2025 (Botánica I/II y Agricultura I/II) y CSE (Botánica/Agricultura), con respuestas de hasta 20 marcas. La partición fue de 5.201 ejemplos de entrenamiento y 274 reservados (5%, aleatorio, semilla 42). La pérdida en el conjunto reservado bajó de 2,383 en el modelo base a 1,604 en el modelo ajustado. No se documenta RLHF ni DPO; el ajuste es supervisado sobre el formato de respuesta.

La innovación principal no es arquitectónica sino de formato: el modelo aprende una plantilla fija con cabecera (paper · marcas · límite de palabras), línea de KEYWORDS, introducción de una línea, puntos con ejemplos indios, línea de diagrama, conclusión y fuente. Los límites de palabras por marcas son: 2,5m 44 · 3m 53 · 5m 88 · 8m 132 · 10m 165 · 12,5m 206 · 15m 275 · 20m 330.

## Capacidades

- Generación de respuestas de examen en formato estructurado fijo para Botánica y Agricultura (IFoS y CSE Mains).
- Cumplimiento de límites de palabras por marcas (de 2,5 a 20 marcas).
- Generación de líneas de KEYWORDS, introducción, puntos con ejemplos indios, diagrama, conclusión y fuente.
- Generación de texto en inglés exclusivamente (idioma declarado: en).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe: no disponible (solo inglés declarado).

## Casos de uso

- Estudio de oposiciones IFoS/CSE: el modelo genera respuestas modelo con el formato exacto del examen, lo que permite al estudiante comparar estructura, extensión y estilo con sus propias respuestas.
- Práctica de límites de palabras: al recibir una pregunta con sus marcas, el modelo ajusta la longitud de la respuesta (por ejemplo, 88 palabras para 5 marcas), entrenando al estudiante en la gestión del espacio.
- Generación de esqueletos de respuesta: la estructura fija (KEYWORDS → intro → puntos → diagrama → conclusión → fuente) sirve como plantilla para que el estudiante rellene con contenido verificado.
- Despliegue local sin conexión: el GGUF Q4_K_M de 1,93 GB se ejecuta en llama.cpp, Ollama o LM Studio en portátiles modestos, útil para estudiar sin depender de servicios en la nube.
- Creación de bancos de preguntas anotados: el modelo puede generar borradores de respuesta para preguntas de Botánica y Agricultura que luego un experto revisa y corrige.
- Prototipado de asistentes educativos especializados: sirve como ejemplo reproducible de ajuste LoRA de bajo coste (82 minutos en una T4) para dominios con formatos de salida rígidos.
- Investigación sobre adherencia a formato: permite estudiar cómo un modelo de 3B aprende plantillas estrictas y dónde falla (por ejemplo, bucles en la línea de KEYWORDS con decodificación greedy).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta la pérdida en el conjunto reservado: 2,383 en el modelo base frente a 1,604 en el modelo ajustado. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas del dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5–3 GB con cuantización Q4_K_M (archivo GGUF de 1,93 GB más overhead de contexto); en FP16, alrededor de 6–7 GB para los 3B parámetros.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM; el autor entrenó en una T4 de 16 GB (Kaggle), pero la inferencia Q4_K_M cabe en GPUs mucho menores.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060, GTX 1660 o incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run hf.co/tab-for-akshay/ifos-answer-writer-qwen2.5-3b:Q4_K_M`), LM Studio, Hob, y PEFT/Unsloth para cargar el adaptador sobre Qwen2.5-3B-Instruct.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IFoS answer writer (este modelo) | 3B | no disponible | qwen-research | safetensors (LoRA), GGUF Q4_K_M | Ajuste LoRA especializado en formato de respuestas IFoS/CSE; solo inglés |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible | qwen-research | safetensors, GGUF | Modelo base generalista; no sigue el formato de examen ni los límites de palabras |
| Modelos de 3B similares (Llama 3.2 3B Instruct, Phi-3-mini) | 3B aprox. | no disponible | licencias propias | safetensors, GGUF | No disponibles en la informacion proporcionada para comparación directa de rendimiento en este dominio |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación relevante es cualitativa: el modelo base Qwen2.5-3B-Instruct no produce el formato de examen ni respeta los límites de palabras, mientras que este ajuste sí lo hace, a costa de un dominio muy estrecho y de una fiabilidad factual baja.

## Limitaciones y advertencias

- El propio autor advierte: "Study aid only. Facts are NOT reliable". Un modelo de 3B inventa cifras, institutos y fechas; cada dato debe verificarse contra un texto estándar.
- Con decodificación greedy, la línea de KEYWORDS puede entrar en bucle (2 de 5 respuestas de prueba). Se recomienda muestreo con temperatura 0,3–0,7 y penalización por repetición de aproximadamente 1,1 (el Modelfile lo configura).
- Alucinaciones específicas documentadas: ubicaciones incorrectas de institutos y estadísticas inventadas.
- Dominio muy restringido: solo Botánica y Agricultura de IFoS/CSE; no es un asistente general.
- Idioma limitado al inglés; no se declara soporte de otros idiomas.
- Licencia qwen-research: restricciones para uso comercial; conviene revisar los términos del modelo base Qwen2.5-3B-Instruct antes de cualquier uso en producción.
- Longitud de contexto no documentada en la información disponible; el entrenamiento usó longitud máxima de 1536 tokens.
- Sin datos de benchmarks ni de rendimiento en producción; no hay evidencia publicada de calidad más allá de la pérdida en el conjunto reservado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha; no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tab-for-akshay/ifos-answer-writer-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Unsloth (herramienta de entrenamiento): no disponible enlace en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponible
