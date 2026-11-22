# weavetabdev/gate-1

## Resumen

Weavetab Gate 1 (`weavetabdev/gate-1`) es un modelo de clasificación de texto de tipo zero-shot derivado de la familia GLiClass de Knowledgator, concretamente de `knowledgator/gliclass-edge-v3.0` y de su versión ONNX `cnmoro/gliclass-edge-v3.0-onnx`. El autor, weavetabdev, lo publica como el componente de decisión de una sola pasada ("single-pass") que alimenta su pasarela API Weavetab Gate. No se trata de un modelo generativo, sino de un clasificador compacto pensado para decidir etiquetas sobre texto de entrada sin reentrenamiento específico por tarea.

La relevancia práctica del modelo está en su formato: se distribuye únicamente como pesos ONNX cuantizados a INT8 (`model_i8.onnx`, 33,4 MB) junto con un tokenizer ModernBERT (`tokenizer.json`, 3,58 MB). Ese tamaño lo sitúa en la categoría de modelos "edge", aptos para inferencia en CPU o en GPUs de gama baja con requisitos de memoria mínimos. La model card no documenta parámetros totales, longitud de contexto ni idiomas soportados de forma explícita.

La información publicada es muy escasa: el repositorio ocupa 0,0 GB según Hugging Face, no tiene descargas ni likes, y la model card se limita a listar ficheros, atribución y licencia. Todo lo que no aparece en esa documentación se marca en esta ficha como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en ModernBERT (según el tokenizer declarado y el modelo base GLiClass); detalles de capas y dimensiones no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base GLiClass Edge está diseñado para textos cortos, pero no se confirma en la información proporcionada) |
| Tipos de cuantización | INT8 (único artefacto publicado: `model_i8.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_i8.onnx`, 33,4 MB) y tokenizer en JSON (`tokenizer.json`, 3,58 MB) |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada a INT8 y exportada a ONNX de `gliclass-edge-v3.0`, un clasificador zero-shot de la familia GLiClass de Knowledgator. GLiClass emplea un encoder tipo transformer (la model card indica tokenizer ModernBERT) con un mecanismo de interacción entre la representación del texto y las representaciones de las etiquetas candidatas, lo que permite clasificar contra etiquetas arbitrarias definidas en tiempo de inferencia sin ajuste fino. El pipeline declarado en Hugging Face es `text-classification` y las etiquetas incluyen `zero-shot-classification`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO (en un clasificador zero-shot estos procesos no son habituales, pero no se confirma). La innovación técnica documentada es la propia cadena de derivación: del modelo original de Knowledgator a una exportación ONNX de cnmoro y de ahí a una cuantización INT8 publicada por weavetabdev, orientada a inferencia de baja latencia en una pasarela de decisión.

## Capacidades

- Clasificación de texto zero-shot: asignación de etiquetas definidas en tiempo de inferencia sin reentrenamiento.
- Clasificación de texto supervisada estándar (pipeline `text-classification`).
- Decisión de una sola pasada ("single-pass decision"), según la model card, orientada a filtrado o enrutado rápido.
- Inferencia en formato ONNX con pesos INT8, lo que permite ejecución en runtime ONNX Runtime sin dependencias de PyTorch.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no es generativo).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Enrutado de peticiones en una pasarela API: el modelo puede clasificar la intención o categoría de una consulta entrante y dirigirla al servicio adecuado, que es precisamente el rol que le atribuye la model card dentro de Weavetab Gate.
- Moderación y filtrado de contenido: clasificación zero-shot de textos contra etiquetas como "spam", "tóxico" o "válido" sin entrenar un clasificador específico, aprovechando que las etiquetas se definen en inferencia.
- Etiquetado de tickets de soporte: asignación automática de categorías a mensajes de usuarios en un helpdesk, con la ventaja de poder añadir o cambiar etiquetas sin reentrenar el modelo.
- Clasificación de documentos en pipelines de ingestión: separar correos, contratos o informes por tipo antes de pasarlos a un modelo generativo mayor, reduciendo coste y latencia del sistema completo.
- Despliegue en entornos con recursos limitados: al ser un ONNX INT8 de 33,4 MB, puede ejecutarse en CPU o en dispositivos edge donde no cabe un transformer grande, por ejemplo en un servicio sidecar de un contenedor.
- Prefiltrado en sistemas RAG: decidir si una consulta requiere recuperación de documentos o puede responderse directamente, actuando como compuerta barata antes de invocar un LLM.
- Clasificación de sentimiento o temática ad hoc: definir etiquetas como "positivo", "negativo", "consulta de facturación" en tiempo de ejecución para análisis exploratorio de corpus pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el artefacto INT8 pesa 33,4 MB y el tokenizer 3,58 MB, por lo que el modelo completo cabe holgadamente en memoria de cualquier GPU moderna e incluso en RAM de CPU.
- GPU recomendadas: no se requieren; cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 o superior) es más que suficiente. Para despliegues en servidor, una T4 o una A10 bastan para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, y también en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), así como los servidores de inferencia compatibles con ONNX. No se publican pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; al ser un encoder pequeño cuantizado a INT8, la latencia esperada es de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| weavetabdev/gate-1 | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Derivado de GLiClass Edge v3.0; solo artefacto cuantizado |
| knowledgator/gliclass-edge-v3.0 | no disponible | no disponible | no disponible | no disponible | Modelo base original de Knowledgator |
| cnmoro/gliclass-edge-v3.0-onnx | no disponible | no disponible | ONNX | no disponible | Exportación ONNX intermedia del modelo base |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la cadena de derivación y al formato de distribución.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta parámetros, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad antes de desplegarlo.
- Sesgos conocidos: no disponibles; al no publicarse la composición del dataset de entrenamiento, no se pueden evaluar sesgos de dominio o idioma.
- Riesgo de alucinación: no aplica en el sentido generativo, pero un clasificador zero-shot puede asignar etiquetas con confianza alta a textos ambiguos; conviene calibrar umbrales con datos propios.
- Limitaciones de contexto o idioma: no documentadas; el modelo base GLiClass Edge está pensado para textos cortos, pero no se confirma en esta ficha.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, pero la model card indica que el código de la pasarela API asociada (github.com/Weavetab/gate) está bajo AGPL-3.0; si se integra ese código, las obligaciones de copyleft de AGPL aplican al servicio.
- Formato único: solo se distribuye ONNX INT8; no hay pesos en precisión completa ni en safetensors, lo que limita el ajuste fino o la conversión a otros runtimes sin recurrir a los modelos base.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción fuera del servicio del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weavetabdev/gate-1
- Modelo base original: https://huggingface.co/knowledgator/gliclass-edge-v3.0
- Exportación ONNX intermedia: https://huggingface.co/cnmoro/gliclass-edge-v3.0-onnx
- Código de la pasarela API (AGPL-3.0): https://github.com/Weavetab/gate
- Servicio Weavetab Gate: https://api.weavetab.dev
