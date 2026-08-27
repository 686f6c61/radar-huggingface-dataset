# Vermaadvait/blip-experiment

## Resumen

Este repositorio contiene un experimento de código de **BLIP (Bootstrapping Language-Image Pre-training)** orientado a tareas contrastivas, desarrollado por Vermaadvait. Se trata de una implementación personalizada a escala *tiny* con solo 24.832 parámetros, diseñada como banco de pruebas para inspeccionar cambios de arquitectura antes de un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es un punto de inicialización válido para pruebas de humo, pero **no es un modelo entrenado** ni presenta ningún resultado de benchmark.

La relevancia de este repositorio es puramente investigadora: permite estudiar variantes de BLIP con atención multi-query, fusión gated, activación ReLU y normalización ScaleNorm en un entorno mínimo. No está pensado para uso en producción ni para tareas reales de visión-lenguaje, ya que carece de entrenamiento y de validación. Su licencia BSD-3-Clause facilita la reutilización del código, pero los datos externos usados con él deben revisarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (variante experimental, atención multi-query, fusión gated, activación ReLU, normalización ScaleNorm) |
| Parametros totales | 24.832 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada de BLIP con las siguientes características declaradas en la model card: atención multi-query (en lugar de multi-cabeza estándar), fusión gated para combinar modalidades, activación ReLU y normalización ScaleNorm. El repositorio incluye `config.json` con la configuración generada y `training_args.json` con una receta experimental por defecto (optimizador Adafactor y programación one-cycle). No se proporciona información sobre el dataset de entrenamiento, número de tokens ni técnicas como RLHF o DPO. El checkpoint `model.safetensors` es únicamente un punto de inicialización para pruebas de humo; no hay evidencia de un entrenamiento completado.

## Capacidades

- **Sin capacidades funcionales**: al ser un checkpoint de inicialización no entrenado, el modelo no puede generar texto, razonar, procesar imágenes ni realizar tareas de visión-lenguaje.
- **Estructura de código**: el archivo `eval.py` contiene la definición del modelo y un ejemplo ejecutable de prueba de humo, pero requiere un adaptador explícito para cargarse con APIs genéricas.
- **Propósito experimental**: sirve para validar la implementación de la arquitectura, no para inferencia real.

## Casos de uso

- **Investigación de arquitectura**: permite probar variantes de atención multi-query y fusión gated en un entorno mínimo antes de escalar a modelos completos.
- **Pruebas de integración**: útil para verificar que el pipeline de carga de safetensors y la configuración funcionan correctamente en un entorno de desarrollo.
- **Educación**: puede usarse como ejemplo didáctico de cómo se estructura un modelo BLIP a pequeña escala, aunque sin resultados funcionales.
- **Depuración de código**: el checkpoint de inicialización facilita la depuración de la lógica de forward/backward sin necesidad de un modelo preentrenado.
- **Comparación de recetas de entrenamiento**: la configuración por defecto (Adafactor + one-cycle) puede servir como punto de partida para experimentos de optimización, aunque no hay resultados que respalden su eficacia.
- **Desarrollo de adaptadores**: al ser una implementación personalizada, se puede usar para desarrollar adaptadores que permitan cargarlo con librerías estándar como Hugging Face Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado.

## Requisitos de hardware

- **VRAM estimada**: con solo 24.832 parámetros, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- **GPU recomendadas**: cualquier GPU moderna (incluso integradas) es suficiente; no se requieren GPUs de alta gama.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) puede ejecutarlo sin problemas.
- **Opciones de despliegue**: al ser un experimento de código, no se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI. El despliegue requeriría escribir un script de inferencia personalizado basado en `eval.py`.
- **Latencia y throughput**: no disponibles, pero dado el tamaño mínimo, la latencia sería despreciable en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| Vermaadvait/blip-experiment | 24.832 | no disponible | No entrenado (inicialización) | BSD-3-Clause | Experimental |
| BLIP base (Salesforce) | 223M | 512 tokens (imagen+texto) | Preentrenado en image-text pairs | BSD-3-Clause | Producción (visión-lenguaje) |
| BLIP-2 (Salesforce) | 1.2B (OPT) / 2.7B (FlanT5) | 32 tokens de consulta | Preentrenado en dos etapas | MIT | Producción (visión-lenguaje) |

La comparación es limitada porque este experimento no es un modelo funcional. Los modelos BLIP de Salesforce son preentrenados y aptos para tareas reales, mientras que este repositorio es solo un esqueleto de arquitectura.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint de inicialización no ha sido sometido a ningún entrenamiento, por lo que no produce salidas útiles.
- **Sin auditoría**: la model card advierte que no se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio.
- **Riesgo de alucinación**: no aplicable, ya que no genera texto.
- **Limitaciones de contexto e idioma**: no se especifican, pero al no estar entrenado, no hay soporte real para ningún idioma.
- **Restricciones de licencia**: la licencia BSD-3-Clause permite uso comercial y modificación, pero los términos de los datos externos deben revisarse por separado.
- **Caveat para producción**: no debe usarse en ningún entorno de producción; es exclusivamente un artefacto de investigación.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/Vermaadvait/blip-experiment)
- [Documentación de BLIP en Hugging Face Transformers](https://huggingface.co/docs/transformers/model_doc/blip)
- [Artículo original de BLIP (arXiv)](https://arxiv.org/abs/2201.12086)
- [BLIP-3: A Family of Open Large Multimodal Models (arXiv)](https://arxiv.org/html/2408.08872v3)
- [Explicación de BLIP en ML Digest](https://ml-digest.com/blip-bootstrapping-language-image-pre-training/)
- [Entendiendo BLIP en GeeksforGeeks](https://www.geeksforgeeks.org/artificial-intelligence/understanding-blip-a-huggingface-model/)
