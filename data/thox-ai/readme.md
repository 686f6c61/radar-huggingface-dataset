# Thox-ai/README

## Resumen

Thox-ai/README no es un modelo de aprendizaje automático, sino el repositorio README de la organización Thox-ai en Hugging Face. Funciona como página de índice o catálogo de la familia de modelos y dispositivos de THOX.ai, una empresa que desarrolla IA local-first orientada a ejecutarse en hardware controlado por el usuario. El repositorio no contiene pesos, configuración de inferencia ni pipeline asociado.

La organización publica un ecosistema de modelos pequeños (desde 9M hasta 32B parámetros), dispositivos de borde (ThoxKey, ThoxAir, ThoxMini, ThoxClip) y capas de software (ThoxOS, MeshStack, ThoxWork). La mayoría de los artefactos son adaptadores LoRA, configuraciones de modelos upstream empaquetados por THOX o builds GGUF para Ollama, no entrenamientos completos desde cero.

Es relevante como punto de entrada para localizar los modelos reales de la familia y entender la filosofía de despliegue local del proyecto. Sin embargo, al tratarse de un README, no ofrece especificaciones técnicas propias ni resultados de benchmarks verificables más allá de la métrica interna GATE49 que el propio autor describe como medida de desarrollo y no como benchmark retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un README de organizacion, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan builds Q4_K_M GGUF en los modelos referenciados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no distribuye pesos) |

## Arquitectura y entrenamiento

El repositorio no contiene arquitectura ni proceso de entrenamiento propios, ya que es un documento de presentación de la organización. La información disponible describe que la familia THOX se organiza en varias líneas: modelos de dispositivo (ThoxAir-0.5B, ThoxEdge-0.8B, ThoxMini-Phi4Mini, ThoxClip-Qwen3-0.6B), asistentes para host y portátil (ThoxForge-7B, ThoxGlobal-7B, ThoxNova-12B-Core, ThoxNova-12B-Agent, ThoxWave-8B, ThoxMini-3B), modelos abiertos configurados (ThoxOpen-8B sobre Qwen3-8B), distribuciones de configuración para MeshStack (familia Cluster y Pro, de 8B a 32B) y líneas de investigación de modelos pequeños.

Según el propio README, muchos artefactos son adaptadores LoRA o configuraciones sobre modelos upstream (Llama 3, Llama 3.2, Phi-4-mini, Qwen3) y no entrenamientos completos. La evaluación se realiza mediante GATE49, una puerta de 49 preguntas de factualidad que el autor define explícitamente como medida de conjunto de desarrollo, no como benchmark retenido, y que premia el recuerdo verificado y las declinaciones prudentes. El README indica que ningún modelo THOX está cualificado sobre hardware físico de dispositivo.

## Capacidades

- Publicación y catalogación de la familia de modelos THOX.ai con enlaces a cada repositorio individual.
- Documentación de comandos de ejecución vía Ollama para los modelos de dispositivo y asistentes (`ollama run Thox-ai/...`).
- Descripción de la línea de dispositivos: ThoxKey, ThoxAir, ThoxMini, ThoxClip y sus plataformas ThoxOS, MeshStack y ThoxWork.
- Referencia a modelos con capacidades específicas: código (ThoxForge-7B), multilingüe (ThoxGlobal-7B), agente con tool calling (ThoxNova-12B-Agent), creativo (ThoxWave-8B) y routing de modelos (ThoxRoute-1.5B).
- Indicación de modos de operación especiales: ThoxEdge-0.8B funciona mejor con thinking desactivado (`"think": false`) y ThoxClip-Qwen3-0.6B requiere su system prompt de grounding.
- Enlace a whitepapers y metodología de evaluación en el dataset `Thox-ai/thox-whitepapers`.
- No es un modelo: no genera texto, no razona, no soporta tool calling ni agentes por sí mismo.

## Casos de uso

- Punto de entrada para explorar la familia THOX: un desarrollador que quiera evaluar los modelos de THOX.ai puede usar este README como índice para localizar el repositorio concreto (ThoxAir-0.5B, ThoxForge-7B, ThoxNova-12B-Agent, etc.) y leer su model card específica.
- Despliegue local en dispositivos de borde: los comandos de Ollama documentados permiten arrancar rápidamente modelos pequeños (0.5B a 0.8B) en hardware de gama baja, útil para prototipos de asistentes embebidos.
- Selección de modelo por caso de uso: el README clasifica los modelos por tier y función (código, multilingüe, agente, creativo), lo que facilita elegir el artefacto adecuado antes de descargar pesos.
- Integración en pipelines con Ollama: los nombres de modelo publicados (`Thox-ai/thoxair-0.5b`, `Thox-ai/thoxforge-7b`, etc.) pueden referenciarse directamente en scripts de automatización que usen Ollama como runtime.
- Investigación sobre evaluación de factualidad en modelos pequeños: la referencia a GATE49 y al whitepaper Wave C permite estudiar la metodología de evaluación propuesta por THOX para modelos de dispositivo.
- Documentación de arquitectura de producto local-first: útil para equipos que diseñen soluciones de IA sin dependencia de la nube y quieran inspirarse en el esquema ThoxOS/MeshStack/ThoxWork.
- Trazabilidad de licencias: el README advierte de que dos miembros de la familia MeshStack (scout, secure) se basan en licencias de investigación no comercial, lo que ayuda a filtrar artefactos antes de un uso comercial.

## Benchmarks y rendimiento

El README incluye resultados de GATE49, una métrica interna de 49 preguntas de factualidad definida por el propio autor como conjunto de desarrollo y no como benchmark retenido. Se reproduce a continuación tal cual, sin interpretación adicional:

| Modelo | Tier | Estado | GATE49 |
|---|---|---|---|
| ThoxAir-0.5B | ThoxAir | Flagship promocionado | 47/49 |
| ThoxEdge-0.8B | ThoxMini (onboard) | Promocionado | 46/49 |
| ThoxMini-Phi4Mini | ThoxMini | Baseline documentado (no promocionado) | 47/49 |
| ThoxClip-Qwen3-0.6B | ThoxClip | Baseline publicado, requiere grounding | 22/49 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que la evaluación de la familia MeshStack Cluster y Pro está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el repositorio README (no es un modelo). Para los modelos referenciados, el README no ofrece cifras de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible a nivel de README; los modelos de dispositivo (0.5B–0.8B) y los builds Q4_K_M GGUF de la familia de asistentes sugieren viabilidad en hardware de consumo, pero no se aportan cifras concretas.
- Opciones de despliegue: Ollama es el runtime explícitamente documentado en el README para todos los modelos (`ollama run Thox-ai/...`). No se mencionan vLLM, llama.cpp directo, TGI ni otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No procede una comparativa de modelos, ya que el artefacto analizado es un README de organización y no un modelo. A modo de contexto, la familia THOX se apoya en modelos upstream de referencia:

| Referencia | Relación con THOX | Licencia indicada en el README |
|---|---|---|
| Qwen3-8B | Base de ThoxOpen-8B (configuración, sin entrenamiento THOX) | no disponible en este README |
| Phi-4-mini | Base de ThoxMini-Phi4Mini | no disponible en este README |
| Qwen3-0.6B | Base de ThoxClip-Qwen3-0.6B | no disponible en este README |
| Llama 3 | Base de ThoxWave-8B | Llama 3 license |
| Llama 3.2 | Base de ThoxMini-3B | Llama 3.2 license |

## Limitaciones y advertencias

- El repositorio es un README, no un modelo: no contiene pesos, tokenizador, configuración de inferencia ni pipeline. No debe citarse como modelo en evaluaciones técnicas.
- GATE49 es una métrica de conjunto de desarrollo definida por el propio autor; no es un benchmark retenido ni comparable con MMLU, HumanEval o GSM8K.
- El autor reconoce que ningún modelo THOX está cualificado sobre hardware físico de dispositivo.
- Varios artefactos de la familia son adaptadores LoRA o configuraciones de modelos upstream; el README indica explícitamente que THOX no entrenó algunos de esos pesos (por ejemplo, ThoxOpen-8B).
- Dos miembros de MeshStack (scout, secure) se basan en licencias de investigación no comercial y no se ofrecen para uso comercial.
- ThoxClip-Qwen3-0.6B obtiene 22/49 en GATE49 y requiere un system prompt de grounding; su uso sin ese prompt puede degradar la factualidad.
- ThoxEdge-0.8B funciona mejor con thinking desactivado, lo que puede limitar su utilidad en tareas de razonamiento multi-paso.
- Licencia del propio repositorio README: no disponible. Las licencias de cada modelo deben consultarse en su model card individual.
- Riesgo de alucinación y sesgos: no cuantificados en la información disponible.
- Idiomas soportados: no disponibles a nivel de README; ThoxGlobal-7B se describe como multilingüe, pero sin listado de idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/README
- Sitio web de THOX.ai: https://thox.ai
- Whitepapers (dataset): https://huggingface.co/datasets/Thox-ai/thox-whitepapers
- ThoxAir-0.5B: https://huggingface.co/Thox-ai/ThoxAir-0.5B
- ThoxEdge-0.8B: https://huggingface.co/Thox-ai/ThoxEdge-0.8B
- ThoxMini-Phi4Mini: https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini
- ThoxClip-Qwen3-0.6B: https://huggingface.co/Thox-ai/ThoxClip-Qwen3-0.6B
- ThoxForge-7B: https://huggingface.co/Thox-ai/ThoxForge-7B
- ThoxGlobal-7B: https://huggingface.co/Thox-ai/ThoxGlobal-7B
- ThoxNova-12B-Core: https://huggingface.co/Thox-ai/ThoxNova-12B-Core
- ThoxNova-12B-Agent: https://huggingface.co/Thox-ai/ThoxNova-12B-Agent
- ThoxWave-8B: https://huggingface.co/Thox-ai/ThoxWave-8B
- ThoxMini-3B: https://huggingface.co/Thox-ai/ThoxMini-3B
- ThoxOpen-8B: https://huggingface.co/Thox-ai/ThoxOpen-8B
- MeshStack Cluster (code): https://huggingface.co/Thox-ai/thox-cluster-code
- MeshStack Pro 8B: https://huggingface.co/Thox-ai/thox-pro-8b
- ThoxWebby-Gemma-4-E2B: https://huggingface.co/Thox-ai/ThoxWebby-Gemma-4-E2B
- ThoxOS-Kernel-27B: https://huggingface.co/Thox-ai/ThoxOS-Kernel-27B
