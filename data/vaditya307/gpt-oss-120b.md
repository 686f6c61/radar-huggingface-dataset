# VADITYA307/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, diseñado para razonamiento de alta capacidad, tareas agénticas y casos de uso generales en producción. Forma parte de la familia gpt-oss, que incluye también la variante gpt-oss-20b orientada a baja latencia y despliegue local. El modelo emplea una arquitectura Mixture of Experts (MoE) con 116.829.156.672 parámetros totales y aproximadamente 5.100 millones de parámetros activos por token, lo que le permite caber en una única GPU de 80 GB como la NVIDIA H100 o la AMD MI300X.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones de copyleft. Incorpora un formato de respuesta propietario denominado harmony, que debe aplicarse obligatoriamente para que el modelo funcione correctamente. Además, soporta razonamiento configurable en tres niveles (bajo, medio y alto) y expone la cadena de pensamiento completa, lo que facilita la depuración y la confianza en las salidas.

La relevancia actual de gpt-oss-120b radica en que ofrece capacidades de razonamiento y uso de herramientas propias de modelos cerrados de gran tamaño, pero con pesos abiertos, cuantización MXFP4 nativa y la posibilidad de ajuste fino. La información disponible no especifica la longitud de contexto, los idiomas soportados ni los resultados de benchmarks, por lo que estos datos se indican como no disponibles en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer |
| Parametros totales | 116.829.156.672 (117B) |
| Parametros activos | 5.100 millones (5.1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (cuantizacion nativa de los pesos MoE); 8-bit segun tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-120b es un modelo Mixture of Experts (MoE) con 117B parámetros totales y 5.1B parámetros activos por token. La arquitectura MoE permite que, pese al tamaño total del modelo, solo se active una fracción de los parámetros en cada paso de inferencia, lo que reduce el coste computacional y permite desplegar el modelo en una única GPU de 80 GB. Los pesos de las capas MoE fueron cuantizados en MXFP4 durante el post-entrenamiento, y todas las evaluaciones publicadas por el autor se realizaron con esa misma cuantización.

El modelo fue entrenado con el formato de respuesta harmony, un esquema de plantilla de conversación que debe aplicarse obligatoriamente; el autor advierte que el modelo no funciona correctamente sin él. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se indica que el modelo es ajustable mediante fine-tuning de parámetros y que permite configurar el esfuerzo de razonamiento en tres niveles (low, medium, high), además de exponer la cadena de pensamiento completa.

## Capacidades

- Generación de texto conversacional y razonamiento de alta capacidad, con esfuerzo de razonamiento configurable en tres niveles (bajo, medio y alto).
- Cadena de pensamiento completa accesible, pensada para depuración y auditoría, no para mostrarse al usuario final.
- Capacidades agénticas nativas: function calling, navegación web y ejecución de código Python.
- Soporte de Structured Outputs (salidas estructuradas).
- Integración con el formato harmony para conversaciones multi-turno y plantillas de respuesta.
- Ajuste fino de parámetros para adaptación a dominios específicos.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento de alta capacidad en producción: el modelo puede emplearse en tareas que requieren cadenas de razonamiento largas, ajustando el nivel de esfuerzo (low, medium, high) según la latencia tolerable y la complejidad del problema.
- Agentes autónomos con uso de herramientas: gracias a sus capacidades nativas de function calling y ejecución de código Python, puede integrarse en pipelines agénticos que consulten APIs, ejecuten scripts y encadenen pasos multi-step.
- Navegación web automatizada: el soporte nativo de browsing permite construir asistentes que consulten y sinteticen información de la web dentro de un flujo agéntico.
- Generación de código en producción: la ejecución de Python y las salidas estructuradas permiten integrarlo en herramientas de desarrollo, asistentes de programación o pipelines de CI/CD que requieran razonamiento sobre código.
- Extracción de datos estructurados: mediante Structured Outputs, el modelo puede transformar texto libre en JSON u otros formatos validables, útil en procesos ETL y automatización documental.
- Atención al cliente avanzada: con el formato harmony y conversaciones multi-turno, puede gestionar diálogos complejos con acceso a herramientas internas para resolver consultas.
- Despliegue en una sola GPU: al caber en una H100 o MI300X de 80 GB con cuantización MXFP4, es adecuado para entornos de producción con infraestructura limitada a un nodo.
- Ajuste fino para dominios verticales: al ser fine-tuneable y tener licencia Apache 2.0, puede adaptarse a sectores como legal, sanitario o financiero sin restricciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cabe en una única GPU de 80 GB (NVIDIA H100 o AMD MI300X) con cuantización MXFP4, según el autor.
- GPU recomendadas: NVIDIA H100 (80 GB) y AMD MI300X (80 GB) para producción; el tamaño del repositorio es de 195,8 GB, por lo que se requiere almacenamiento suficiente para los pesos en precisión completa.
- GPU de consumo: la información disponible no confirma que gpt-oss-120b quepa en GPUs de consumo; el autor indica que la variante gpt-oss-20b es la pensada para hardware local (16 GB de memoria).
- Opciones de despliegue: Transformers, vLLM (versión 0.10.1+gptoss con wheels específicos), Ollama (`gpt-oss:120b`), LM Studio, PyTorch/Triton con implementaciones de referencia, y `transformers serve` para servidor compatible con OpenAI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b | 117B | 5.1B | no disponible | Apache 2.0 | Pesos abiertos en Hugging Face |
| gpt-oss-20b | 21B | 3.6B | no disponible | Apache 2.0 | Pesos abiertos en Hugging Face |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con la variante menor de la misma familia, gpt-oss-20b, orientada a baja latencia y despliegue local con 16 GB de memoria. No se dispone de datos de benchmarks ni de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo debe usarse obligatoriamente con el formato harmony; el autor advierte que no funcionará correctamente en caso contrario.
- La cadena de pensamiento completa está expuesta y no debe mostrarse al usuario final.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas.
- La longitud de contexto no está especificada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- El repositorio analizado (VADITYA307/gpt-oss-120b) es una réplica del modelo original de OpenAI; se recomienda usar el repositorio oficial `openai/gpt-oss-120b` para garantizar integridad y soporte.
- El tamaño del repositorio (195,8 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, deben revisarse las condiciones de los datos de entrenamiento, no disponibles en la información proporcionada.
- No hay datos publicados de benchmarks en la información disponible, por lo que el rendimiento real debe validarse en el caso de uso concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VADITYA307/gpt-oss-120b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-120b
- Variante menor: https://huggingface.co/openai/gpt-oss-20b
- Colección gpt-oss en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card / paper: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Página del producto: https://gpt-oss.com
- Guías (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Modelos abiertos de OpenAI: https://openai.com/open-models
