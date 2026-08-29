# SZLHOLDINGS/szl-khipu-kernels

## Resumen

El repositorio `SZLHOLDINGS/szl-khipu-kernels` es un paquete de kernels de inferencia para el modelo SZL KHIPU, desarrollado por SZL Holdings, una empresa centrada en infraestructura de IA gobernada. A diferencia de un modelo de lenguaje completo, este repositorio proporciona funciones de bajo nivel implementadas en NumPy puro para CPU, incluyendo un mecanismo de atención denominado `yarqa_attn` y un gate de confianza llamado `lambda_gate`. La filosofía del proyecto es la transparencia y la honestidad: el estado actual indica que la ruta CPU NumPy está operativa, mientras que la aceleración CUDA no está disponible, y se declara explícitamente que no se fabrican resultados de rendimiento.

El paquete se integra con el ecosistema más amplio de SZL Holdings, que incluye otros kernels como `szl-governed-norm` y `governed-inference-meter`, todos orientados a la gobernanza de operaciones de IA. La licencia es Apache-2.0 y el código fuente está disponible en GitHub. Aunque el repositorio no contiene un modelo entrenado, sirve como base para implementar inferencia con garantías de trazabilidad y verificación de confianza, un enfoque poco común en el panorama actual de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels de inferencia (no es un modelo completo); incluye `yarqa_attn` y `lambda_gate` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | NumPy arrays (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de red neuronal completa, sino que ofrece kernels de cómputo para operaciones específicas. `yarqa_attn` implementa un mecanismo de atención con "canales" (n_canals) y un límite de fuga de información declarado en ≤ 1e-9. `lambda_gate` evalúa una puntuación de confianza basada en una lista de valores (por ejemplo, 13 umbrales) y devuelve un score, un booleano de paso y un indicador de "proven_trust". No se proporciona información sobre el entrenamiento de ningún modelo subyacente, ni sobre tokens, datasets o técnicas como RLHF o DPO. La documentación menciona "Conjecture 1" como abierta, lo que sugiere que parte del comportamiento formal aún no está demostrado.

## Capacidades

- Implementación de atención con control de fuga de información: `yarqa_attn` permite especificar el número de canales y devuelve las probabilidades junto con un valor de fuga acotado.
- Evaluación de confianza mediante `lambda_gate`: dado un conjunto de umbrales, produce una puntuación y un veredicto binario, con un flag de "proven_trust" que actualmente es `false`.
- Funciones auxiliares como `YUYAY_FLOORS` y `evaluate_lambda` disponibles en el módulo `szl_khipu` para uso directo.
- Soporte exclusivo de CPU mediante NumPy; no hay implementación CUDA ni Triton.
- Integración con el sistema de "Kernel Hub" para descubrimiento de kernels, aunque también ofrece un fallback local etiquetado.
- Orientado a gobernanza: los kernels están diseñados para auditar y verificar operaciones, no para generación de texto o razonamiento general.

## Casos de uso

- Verificación de confianza en sistemas de IA agénticos: `lambda_gate` puede emplearse como un componente de decisión que evalúa si un agente debe proceder según umbrales de confianza predefinidos, útil en entornos regulados.
- Auditoría de atención en modelos propietarios: `yarqa_attn` permite inspeccionar la distribución de atención y el límite de fuga de información, lo que facilita la validación de privacidad en sistemas que procesan datos sensibles.
- Desarrollo de kernels de inferencia ligeros para entornos sin GPU: al ser NumPy puro, puede ejecutarse en servidores CPU de bajo coste o en entornos embebidos para pruebas de concepto.
- Investigación en gobernanza de IA: los kernels sirven como bloques de construcción para experimentos sobre trazabilidad y demostración de propiedades formales (aunque la Conjecture 1 sigue abierta).
- Integración en pipelines de MCP (Model Context Protocol): la documentación de SZL Holdings menciona soporte MCP, por lo que estos kernels podrían usarse como herramientas de verificación dentro de agentes.
- Formación y educación: el código es legible y minimalista, adecuado para enseñar conceptos de atención y gates de confianza sin depender de frameworks pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación indica explícitamente que "CUDA UNAVAILABLE" y "Energy UNAVAILABLE — never a fabricated joule", lo que refuerza que no hay mediciones de rendimiento verificadas. No se proporcionan cifras de latencia, throughput ni precisión en tareas estándar.

## Requisitos de hardware

- CPU: cualquier procesador compatible con Python y NumPy; no se especifican requisitos mínimos.
- VRAM: 0 GB, ya que no se utiliza GPU.
- GPUs: no soportadas actualmente; la ruta CUDA no está disponible.
- Opciones de despliegue: uso directo en Python con NumPy; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser NumPy puro, el rendimiento será limitado para cargas grandes, pero adecuado para prototipos y verificación.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con otros como Llama, Mistral o Qwen, sino un conjunto de kernels de propósito específico. No se han identificado alternativas equivalentes en el ecosistema open source.

## Limitaciones y advertencias

- Sin soporte CUDA: la aceleración por GPU no está implementada, lo que limita seriamente el rendimiento en producción.
- Sin benchmarks publicados: no hay evidencia empírica de rendimiento o precisión.
- Conjecture 1 abierta: la demostración formal de las propiedades del gate no está cerrada, por lo que el comportamiento en todos los casos no está garantizado.
- No es un modelo de lenguaje: no puede generar texto, razonar ni realizar tareas de NLP; es solo un conjunto de utilidades de bajo nivel.
- Dependencia de NumPy: el rendimiento y la escalabilidad dependen de la implementación de NumPy, que no está optimizada para cómputo intensivo.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en escenarios críticos.
- La fecha de creación (2026) y el estado "LIVE" sugieren un proyecto en fase temprana; se recomienda precaución antes de usarlo en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-khipu-kernels
- Documentación de SZL Holdings: https://szl-holdings.github.io/docs-site/
- GitHub del proyecto: https://github.com/szl-holdings/szl-khipu
- Repositorio de kernels relacionado: https://github.com/szl-holdings/szl-kernels/
- Página de SZL Holdings en HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-kernels
