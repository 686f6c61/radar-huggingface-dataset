# Tonic/Qwen3.5-9B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-9B-Wolof-Instruct-v1-ONNX es una exportación al formato ONNX del modelo Tonic/Qwen3.5-9B-Wolof-Instruct-v1, un ajuste fino orientado a instrucciones en lengua wolof sobre la base Qwen3.5 de 9.000 millones de parámetros. El modelo lo publica el usuario Tonic y está pensado para su ejecución en el navegador mediante Transformers.js y WebGPU, con cuantización q4f16. Su etiqueta galsenai sugiere un enfoque hacia el ecosistema lingüístico senegalés, si bien la model card no lo confirma explícitamente.

El interés principal reside en llevar un modelo de 9B ajustado a un idioma de bajos recursos como el wolof hasta un entorno de inferencia web sin servidor, algo poco habitual en esta franja de tamaño. La exportación ONNX reduce la fricción de despliegue para aplicaciones cliente, aunque el repositorio ocupa 24,7 GB, lo que implica que la descarga inicial en navegador es considerable y que la cuantización q4f16 es la vía práctica para ejecutarlo.

La información pública disponible es muy escasa: no hay datos sobre licencia, idiomas declarados, composición del dataset de ajuste ni resultados de benchmarks. Esta ficha se limita a lo verificable en los metadatos y en la model card, e indica explícitamente los apartados sin datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tipo qwen3_5_text); detalles internos no disponibles |
| Parámetros totales | 9B (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4f16 (exportación ONNX para Transformers.js WebGPU) |
| Idiomas soportados | no disponible en metadatos; el ajuste está orientado a wolof |
| Licencia | no disponible |
| Formato de pesos | ONNX (repositorio de 24,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 9.000 millones de parámetros, según el identificador. Sobre esa base se aplicó un ajuste fino supervisado orientado a instrucciones (sufijo Instruct) en wolof, dando lugar a Tonic/Qwen3.5-9B-Wolof-Instruct-v1. Esta publicación concreta es únicamente la conversión a ONNX de ese modelo, con cuantización q4f16 para su uso con Transformers.js y WebGPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus en wolof, si hubo RLHF o DPO, ni sobre innovaciones técnicas específicas del ajuste. La model card se limita a declarar que se trata de una exportación ONNX del modelo base para Transformers.js WebGPU con dtype q4f16.

## Capacidades

- Generación de texto conversacional en wolof, derivada del ajuste Instruct del modelo base.
- Instrucciones multi-turno: el formato Instruct sugiere capacidad de seguir indicaciones, aunque no se detalla el template de chat.
- Ejecución en navegador mediante Transformers.js y WebGPU, sin backend de servidor.
- Herencia de las capacidades del Qwen3.5 subyacente (razonamiento, código, matemáticas), no verificadas en esta exportación ni documentadas en la model card.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Aplicaciones web offline-first en wolof: el modelo puede ejecutarse íntegramente en el navegador del usuario mediante WebGPU, útil para entornos con conectividad limitada o requisitos de privacidad donde los datos no deben salir del dispositivo.
- Asistentes conversacionales en wolof para servicios públicos o educativos: un modelo Instruct ajustado al idioma permite atender consultas de usuarios que no dominan francés o inglés, con la ventaja de no requerir infraestructura de servidor.
- Prototipado rápido de interfaces de chat: Transformers.js permite integrar el modelo en una página web con pocas líneas de JavaScript, lo que acelera la validación de producto antes de invertir en despliegue backend.
- Investigación en lenguas de bajos recursos: sirve como referencia reproducible para estudiar el rendimiento de un 9B cuantizado en wolof y comparar con otras aproximaciones de ajuste.
- Educación y alfabetización digital: un asistente local en wolof puede apoyar la práctica lingüística o la traducción asistida en contextos escolares, sin coste de API.
- Demostraciones y evaluación de WebGPU: útil para medir latencia y viabilidad de modelos de 9B cuantizados en hardware de cliente, como paso previo a decisiones de arquitectura.
- Despliegue en kioscos o dispositivos gestionados: al no depender de un servidor, puede instalarse en equipos con GPU integrada para atención en mostrador o terminales de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 24,7 GB; la inferencia práctica con q4f16 requiere aproximadamente 5-6 GB de memoria de GPU, estimación basada en el tamaño de 9B y la cuantización de 4 bits, no confirmada por el autor.
- GPU de cliente compatibles con WebGPU: se recomienda al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070 o superiores); en GPUs integradas o con menos de 6 GB la ejecución puede no ser viable.
- En servidor, una A100 o H100 permite ejecutar la versión sin cuantizar, aunque el propósito declarado del repositorio es el navegador.
- Opciones de despliegue: Transformers.js con WebGPU (vía prevista por el autor); ONNX Runtime Web u ONNX Runtime nativo para otros entornos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que requieren otros formatos.
- Latencia y throughput: no disponibles; dependerán del navegador, la GPU del cliente y la implementación de WebGPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-9B-Wolof-Instruct-v1-ONNX | 9B | no disponible | ONNX q4f16 | no disponible | Wolof, navegador (WebGPU) |
| Tonic/Qwen3.5-9B-Wolof-Instruct-v1 | 9B | no disponible | safetensors (presumible) | no disponible | Wolof, servidor |
| Qwen3.5 base (9B) | 9B | no disponible | safetensors | no disponible | Multilingüe general |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada; la comparación se limita a formato y propósito de despliegue.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial sin consultar al autor o al modelo base.
- Idiomas no declarados en los metadatos; el alcance real del wolof y el posible olvido catastrófico de otras lenguas tras el ajuste no están documentados.
- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de calidad, sesgos o tasa de alucinación.
- La cuantización q4f16 puede degradar la calidad respecto al modelo original en tareas sensibles, especialmente en un idioma de bajos recursos donde el margen es menor.
- Descarga de 24,7 GB en el repositorio: poco práctica para usuarios finales en web; conviene verificar qué archivos se cargan realmente en tiempo de ejecución.
- Compatibilidad limitada a Transformers.js/ONNX; no se garantiza su uso con los runners habituales de servidor.
- Riesgo de alucinación inherente a los modelos de 9B, agravado por la escasez de datos de entrenamiento en wolof.
- Fecha de creación futura en los metadatos (2026-11-13), lo que sugiere una publicación reciente o un error de marcado; conviene verificar el estado del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-v1
- Transformers.js: https://github.com/huggingface/transformers.js
- WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
- Qwen (organización): https://huggingface.co/Qwen
- No se han encontrado papers, blogs ni demos específicos del modelo en la búsqueda web realizada.
