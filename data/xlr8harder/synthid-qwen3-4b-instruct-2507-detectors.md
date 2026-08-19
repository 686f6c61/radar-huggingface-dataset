# xlr8harder/synthid-qwen3-4b-instruct-2507-detectors

## Resumen

Este repositorio contiene una familia de detectores Bayesianos de watermarking SynthID para el modelo `Qwen/Qwen3-4B-Instruct-2507`, desarrollados por el usuario xlr8harder. No se trata de un modelo de lenguaje generativo, sino de clasificadores independientes que determinan si un texto ha sido generado por ese modelo con una marca de agua SynthID aplicada. El corpus de respuestas generadas utilizado para entrenamiento y evaluación es `xlr8harder/synthid-qwen3-4b-instruct-2507-wildchat`, y el código de entrenamiento, generación e integración con vLLM está disponible en el repositorio GitHub `xlr8harder/synthid`.

La relevancia de este trabajo radica en la creciente necesidad de verificar la procedencia de textos generados por IA, especialmente en contextos regulatorios y de moderación de contenido. Los detectores se entrenan sobre un perfil de generación concreto (temperatura 0.7, top-k 100, top-p 1.0) y se evalúan con un punto de operación fijo (tasa de falsos positivos del 1% sobre la validación negativa). La arquitectura exacta de los detectores no se especifica en la información disponible, pero al ser clasificadores Bayesianos independientes, se infiere que son modelos ligeros (posiblemente basados en embeddings o características estadísticas) que operan sobre secuencias de tokens visibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores Bayesianos (clasificadores independientes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (operan sobre secuencias de tokens visibles, evaluados a 200 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

Los detectores son clasificadores Bayesianos entrenados para distinguir entre texto generado por `Qwen3-4B-Instruct-2507` con watermarking SynthID y texto humano o generado sin marca de agua. El entrenamiento se realiza sobre un corpus de respuestas generadas con un perfil de muestreo fijo: temperatura 0.7, top-k 100, top-p 1.0, min-p 0.0, con un máximo de 4096 tokens generados y dtype nativo bfloat16. La tabla de muestreo (sampling table) se fija mediante un hash SHA-256, lo que garantiza reproducibilidad.

Se entrenan tres familias de detectores según el conjunto de negativos utilizado: `human-eli5-lfqa-test` (negativos humanos de ELI5), `other-model-wildchat-original` (negativos de respuestas originales de WildChat) y `same-model-matched` (negativos de Qwen sin watermarking). Cada detector selecciona un umbral sobre su propia validación negativa con una tasa de falsos positivos objetivo del 1%. Este umbral se transfiere sin cambios a todas las cohortes de evaluación, lo que permite medir la robustez del detector ante diferentes distribuciones.

## Capacidades

- Deteccion de watermarking SynthID en texto generado por `Qwen3-4B-Instruct-2507` con el perfil de generacion especificado.
- Distincion entre texto humano (corpus ELI5) y texto generado con marca de agua.
- Robustez parcial ante cambios de clave de watermarking (key-a vs key-b) y ante texto generado sin watermarking.
- Evaluacion a 200 tokens visibles, lo que permite deteccion temprana en textos cortos.
- No es un modelo generativo: no produce texto, solo clasifica secuencias de tokens.

## Casos de uso

- Verificacion de procedencia de contenido generado por IA: plataformas que necesitan auditar si un texto fue producido por un modelo con watermarking pueden integrar estos detectores en sus pipelines de moderacion.
- Cumplimiento normativo: ante leyes de transparencia de IA (como la EU AI Act), los proveedores pueden usar estos detectores para demostrar que sus modelos incorporan marcas de agua detectables.
- Auditoria de modelos de lenguaje: investigadores pueden verificar si un modelo concreto (Qwen3-4B-Instruct-2507) ha generado un texto dado, incluso si el watermarking no es visible para el usuario final.
- Investigacion en watermarking: el repositorio proporciona un punto de referencia para estudiar la transferibilidad de umbrales entre diferentes distribuciones de texto.
- Deteccion de plagio generado por IA en entornos academicos: los detectores pueden aplicarse a textos sospechosos de haber sido generados por el modelo objetivo.
- Integracion en sistemas de trazabilidad de contenido: combinado con el dataset WildChat, permite construir pipelines de etiquetado automatico de respuestas generadas.

## Benchmarks y rendimiento

La model card proporciona una tabla de transferencia de punto de operacion fijo. Se presentan los resultados mas representativos para cada familia de detector y clave:

| Detector bundle | Evaluacion | N | Tasa de deteccion verdadera | Tasa de falsos positivos |
|---|---|---|---|---|
| `human-eli5-lfqa-test/key-a` | `qwen-key-a-matched` | 8171 | 74.691% | - |
| `human-eli5-lfqa-test/key-a` | `eli5-human-lfqa` | 2103 | - | 1.379% |
| `human-eli5-lfqa-test/key-a` | `qwen-key-b-matched` | 8205 | - | 2.438% |
| `human-eli5-lfqa-test/key-b` | `qwen-key-b-matched` | 8205 | 70.518% | - |
| `human-eli5-lfqa-test/key-b` | `eli5-human-lfqa` | 2103 | - | 0.951% |
| `other-model-wildchat-original/key-a` | `qwen-key-a-matched` | 8171 | 67.984% | - |
| `other-model-wildchat-original/key-a` | `wildchat-original` | 6415 | - | 0.857% |
| `other-model-wildchat-original/key-b` | `qwen-key-b-matched` | 8205 | 69.336% | - |
| `other-model-wildchat-original/key-b` | `wildchat-original` | 6415 | - | 1.091% |

Los resultados muestran tasas de deteccion verdadera entre el 68% y el 75% para textos con clave coincidente, y tasas de falsos positivos que oscilan entre el 0.5% y el 2.8% dependiendo del conjunto de evaluacion. La transferencia de umbrales fijos produce FPR ligeramente superiores al 1% objetivo en algunas cohortes, lo que indica una dependencia de la distribucion.

## Requisitos de hardware

- Al ser clasificadores Bayesianos independientes (no un LLM completo), los requisitos de VRAM son minimos. No se proporcionan datos exactos, pero se estima que pueden ejecutarse en CPU o en cualquier GPU con al menos 1-2 GB de VRAM.
- Para la generacion del corpus de entrenamiento se requiere el modelo base `Qwen3-4B-Instruct-2507`, que necesita aproximadamente 8 GB de VRAM en bfloat16 (o menos con cuantizacion). El repositorio de detectores en si no requiere el modelo base para inferencia.
- Opciones de despliegue: al ser modelos transformers, pueden cargarse con la libreria `transformers` de HuggingFace. No se mencionan integraciones especificas con vLLM u Ollama para los detectores, aunque el codigo de generacion usa vLLM.
- Latencia y throughput: no disponibles, pero al ser clasificadores ligeros, se espera una latencia de milisegundos por secuencia de 200 tokens en hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre otros detectores de watermarking comparables en el mismo repositorio o en la literatura accesible. El sistema SynthID original de DeepMind es el marco de referencia, pero no se proporcionan datos de comparacion directa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Los detectores estan calibrados para un perfil de generacion especifico (temperatura 0.7, top-k 100, top-p 1.0). No deben describirse como independientes del sampler, incluso si la clave y la tabla de muestreo son fijas.
- La tasa de falsos positivos no es nula: en algunas cohortes alcanza el 2.8%, lo que puede generar falsas acusaciones de uso de IA en textos humanos.
- La tasa de deteccion verdadera no supera el 75%, por lo que una proporcion significativa de textos con watermarking no sera detectada.
- Solo funciona con el modelo `Qwen3-4B-Instruct-2507` y su watermarking SynthID especifico. No es aplicable a otros modelos o a variantes de watermarking.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.
- No se especifican los idiomas soportados; la evaluacion se realiza sobre corpus en ingles (ELI5, WildChat), por lo que el rendimiento en otros idiomas es desconocido.
- La licencia MIT permite uso comercial, pero la ausencia de documentacion sobre el entrenamiento de los detectores (arquitectura exacta, hiperparametros) limita su reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xlr8harder/synthid-qwen3-4b-instruct-2507-detectors
- Dataset de respuestas generadas: https://huggingface.co/datasets/xlr8harder/synthid-qwen3-4b-instruct-2507-wildchat
- Codigo fuente (GitHub): https://github.com/xlr8harder/synthid
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
