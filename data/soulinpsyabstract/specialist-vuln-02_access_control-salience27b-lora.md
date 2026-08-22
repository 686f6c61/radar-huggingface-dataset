# SoulInPsyAbstract/specialist-vuln-02_access_control-salience27b-lora

## Resumen

El modelo `SoulInPsyAbstract/specialist-vuln-02_access_control-salience27b-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario SoulInPsyAbstract. Está diseñado como un especialista en el dominio de control de acceso dentro de una familia de modelos de seguridad (según el nombre y las etiquetas), pero no se proporciona documentación técnica oficial ni información de entrenamiento en su model card. El adaptador se aplica sobre el modelo base `vectionlabs/Salience-27B-R5`, un modelo de lenguaje de 27 mil millones de parámetros, aunque se desconoce su arquitectura interna exacta.

La relevancia de este modelo radica en su potencial uso en tareas de análisis de vulnerabilidades, concretamente en la detección o corrección de fallos de control de acceso. Sin embargo, la ausencia de especificaciones detalladas, datos de entrenamiento y métricas de evaluación hace que su adopción en producción sea arriesgada sin una validación previa exhaustiva. El repositorio tiene un tamaño de 0.2 GB, coherente con un adaptador LoRA, y la fecha de creación (2026-08-21) sugiere que es un proyecto reciente con baja tracción (0 descargas y 0 likes en el momento del análisis).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `Salience-27B-R5` (arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador LoRA no especifica sus parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en formato safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre el modelo base `Salemini-27B` ni sobre la arquitectura del adaptador. Los tags indican que se entrenó mediante *supervised fine-tuning* (SFT) usando la librería `trl` y la versión `PEFT 0.20.0`. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única referencia técnica es el tag `arxiv:1910.09700`, que corresponde al artículo "Carbon emissions of AI" de Lacoste et al., probablemente usado para estimar el impacto ambiental, pero no aporta información sobre el modelo.

El hecho de que el adaptador sea un LoRA implica que solo se ajustan un subconjunto de los pesos del modelo base, lo que reduce los recursos de entrenamiento y de inferencia en comparación con un fine-tuning completo. Sin embargo, sin conocer los hiperparámetros de entrenamiento ni el dataset utilizado, no es posible evaluar la calidad del ajuste.

## Capacidades

No se han publicado capacidades específicas del modelo. Según las etiquetas, es un modelo de generación de texto (`text-generation`) y conversacional (`conversational`). No hay evidencia de soporte para *tool calling*, *function calling*, razonamiento multi-paso, capacidades de visión o audio, ni multilingüismo. La única funcionalidad confirmada es la generación de texto, pero sin datos concretos sobre su rendimiento en tareas de seguridad o control de acceso.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos y realistas. El nombre sugiere una aplicación en análisis de vulnerabilidades, específicamente en control de acceso, pero no hay documentación que respalde su comportamiento en ese dominio. Sin datos de evaluación ni ejemplos de uso, no se puede recomendar su implementación en ningún escenario de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Por tanto, no es posible evaluar su rendimiento objetivo.

## Requisitos de hardware

Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base `Salemini-27B` y aplicar el adaptador. Para un modelo de 27B parámetros, se estima una VRAM mínima de 16-24 GB en cuantización de 4 bits y 48-64 GB en precisión completa (FP16), pero estos valores son estimaciones genéricas y no se han confirmado para este adaptador. No se especifican GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni datos de latencia o throughput. Dado el tamaño del base, es probable que se necesiten GPUs de gama alta (A100, H100, RTX 4090) o cuantización agresiva para ejecutar en hardware de consumo.

## Comparativa con modelos similares

No se dispone de información sobre modelos similares en la misma familia (especialistas en vulnerabilidades). Aunque se menciona en la búsqueda web un modelo llamado `vuln-gate-02` de la misma familia, no se han encontrado datos técnicos comparables. Por tanto, no es posible realizar una comparativa.

## Limitaciones y advertencias

- La documentación del modelo es prácticamente inexistente: no hay descripción, datos de entrenamiento, ni evaluación.
- No se especifica la licencia, lo que impide su uso comercial sin riesgo legal.
- No se conocen los sesgos del modelo, su tendencia a alucinar o sus limitaciones de contexto.
- Al ser un adaptador LoRA, la calidad del resultado depende completamente del modelo base `Salemini-27B`, del que tampoco hay información pública.
- No se ha validado su uso en tareas de seguridad reales; cualquier despliegue en producción sería una decisión no respaldada por datos.
- La fecha de creación (2026) y la ausencia de actividad (0 descargas, 0 likes) sugieren que el proyecto está inactivo o en fase experimental.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/SoulInPsyAbstract/specialist-vuln-02_access_control-salience27b-lora
- Búsqueda web que menciona un modelo similar: https://friendli.ai/models/SoulInPsyAbstract/vuln-gate-02_access_control-lora
- Perfil de GitHub del autor: https://github.com/Soul-In-PsyAbstract

Nota: no se han encontrado papers, repositorios de código ni demos asociados a este adaptador.
