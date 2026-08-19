# voves/GigaChat3.5-432B-A28B-NVFP4

## Resumen

GigaChat3.5-432B-A28B-NVFP4 es una cuantización en formato NVFP4 (4 bits) del modelo GigaChat 3.5 Ultra, desarrollado originalmente por ai-sage. El modelo base es un Mixture-of-Experts (MoE) híbrido de 432 mil millones de parámetros totales con 28 mil millones activos, diseñado para instrucciones multilingües, razonamiento, generación de código y uso de herramientas en entornos agénticos. La cuantización ha sido realizada por el usuario voves, que ha excluido cuidadosamente los módulos críticos (router, shared expert, proyecciones MLA de bajo rango, etc.) para preservar la calidad del modelo original.

Esta versión cuantizada reduce drásticamente el tamaño del modelo en disco (de aproximadamente 864 GB en BF16 a 245 GB), manteniendo las capacidades del modelo base y permitiendo su despliegue en entornos con menos recursos. El modelo está pensado para tareas complejas de razonamiento, generación de código y agentes autónomos, con soporte para ruso e inglés. Su arquitectura híbrida combina Multi-head Latent Attention (MLA) con capas de atención lineal GatedDeltaNet, lo que le permite manejar contextos largos escalados mediante YaRN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (MLA + GatedDeltaNet) con 256 expertos enrutados y top-8 |
| Parametros totales | 432B (modelo base) / 243.069.209.056 según safetensors del repo cuantizado |
| Parametros activos | 28B |
| Longitud de contexto | No especificada; usa escalado YaRN (calibrado a 4096 tokens) |
| Tipos de cuantizacion | NVFP4 (este repo), BF16 (original) |
| Idiomas soportados | Ruso, inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GigaChat3.5-432B-A28B es un MoE híbrido con 256 expertos enrutados y selección top-8. Su arquitectura combina Multi-head Latent Attention (MLA) con capas de atención lineal GatedDeltaNet, además de GatedNorm y dos cabezas de Multi-Token Prediction (MTP). Esta combinación permite una inferencia eficiente con solo 28B parámetros activos por token, reduciendo el coste computacional frente a un modelo denso del mismo tamaño.

La cuantización a NVFP4 realizada por voves no modifica la arquitectura, pero requiere una calibración cuidadosa para evitar degradación. El autor excluyó de la cuantización los siguientes módulos: lm_head, embeddings, shared expert, todos los gate/router, las proyecciones q/kv de bajo rango, y las primeras 3 capas densas y las últimas 2. Para la calibración se utilizó un dataset mixto en ruso de 2.000 muestras tokenizadas a 4096 tokens de contexto, con el fin de cubrir los patrones de activación y enrutamiento de expertos en ruso, que habrían quedado infrarrepresentados con un corpus en inglés.

## Capacidades

- Generación de texto y conversación multilingüe (ruso e inglés) con alta calidad.
- Razonamiento complejo y resolución de problemas matemáticos.
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling / function calling para integración con APIs y servicios externos.
- Capacidades agénticas: planificación multi-paso y ejecución de tareas autónomas.
- Manejo de contextos largos gracias al escalado YaRN, aunque el límite exacto no se especifica.
- Sin soporte de visión ni audio (modelo de texto únicamente).

## Casos de uso

- Atención al cliente automatizada en ruso e inglés: el modelo puede gestionar conversaciones multi-turno con contexto largo, resolviendo incidencias y derivando a agentes humanos cuando sea necesario.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentación o parches, y ejecutar comandos mediante herramientas.
- Análisis de documentos legales o técnicos extensos: su contexto largo (escalado con YaRN) permite procesar contratos, informes o artículos científicos completos y extraer información relevante.
- Agentes autónomos de investigación: el modelo puede planificar búsquedas, consultar APIs y sintetizar resultados en informes estructurados.
- Asistente de programación para entornos empresariales: ayuda a desarrolladores a refactorizar código, explicar fragmentos y generar documentación, manteniendo coherencia en proyectos grandes.
- Traducción y adaptación de contenido entre ruso e inglés: su entrenamiento bilingüe lo hace adecuado para localización de software o marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 245,1 GB (pesos NVFP4). Se estima que la VRAM necesaria para inferencia es de al menos 256 GB, considerando overhead y activaciones.
- GPUs recomendadas: clúster de 4x A100 80GB, 4x H100 80GB o 8x RTX 4090 (24GB cada una) con NVLink o interconexión rápida.
- No cabe en una GPU de consumo estándar; requiere configuración multi-GPU.
- Opciones de despliegue: vLLM, TensorRT-LLM (con soporte NVFP4), o frameworks que acepten safetensors cuantizados. No es compatible directamente con llama.cpp (formato GGUF), aunque existen versiones GGUF del modelo base.
- Latencia y throughput: no disponibles; dependen del hardware y del número de GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GigaChat3.5-432B-A28B (BF16) | 432B | 28B | No especificado | Apache-2.0 | safetensors |
| GigaChat3.5-432B-A28B-NVFP4 (este repo) | 432B (243B en safetensors) | 28B | No especificado | Apache-2.0 | safetensors NVFP4 |
| DeepSeek-V3 (referencia, no comparable directamente) | 671B | 37B | 128K | MIT | safetensors |

La comparativa con DeepSeek-V3 es orientativa: ambos son MoE híbridos con atención lineal, pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal ventaja de esta versión NVFP4 es la reducción de memoria (~3,5x menos que BF16) manteniendo la arquitectura y las capacidades del modelo original.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir una ligera pérdida de precisión en tareas muy sensibles, aunque el autor ha excluido los módulos críticos para mitigarlo.
- El modelo está entrenado principalmente en ruso e inglés; su rendimiento en otros idiomas es limitado.
- Riesgo de alucinación en contextos largos o cuando se le pide información factual no cubierta por sus datos de entrenamiento.
- No se especifica la longitud máxima de contexto; el uso de YaRN puede degradar la calidad si se excede el límite efectivo.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda verificar los términos del modelo base (ai-sage) para asegurar compatibilidad.
- Para producción, es necesario validar el comportamiento del modelo cuantizado en el dominio específico, ya que la calibración se realizó con un dataset limitado en ruso.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/voves/GigaChat3.5-432B-A28B-NVFP4
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B
- Colección GigaChat 3.5: https://huggingface.co/collections/ai-sage/gigachat-35
- Versión GGUF del modelo base: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-GGUF
- Página de overview en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gigachat3.5-432b-a28b-ai-sage
