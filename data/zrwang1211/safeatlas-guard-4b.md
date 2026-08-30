# zrwang1211/SafeAtlas-Guard-4B

## Resumen

SafeAtlas Guard 4B es un modelo de moderación de seguridad multimodal desarrollado por Zongrui Wang (zrwang1211), presentado en el trabajo "SafeAtlas-VL: Beyond Binary Multimodal Safety with Large-Scale Data and Guard Models". El modelo evalúa simultáneamente el contenido de una imagen, la petición del usuario anclada a esa imagen y la respuesta del asistente, devolviendo un nivel de seguridad ordinal de cinco grados, una puntuación de riesgo continua de 0 a 100 y predicciones auxiliares de tres cabezas juez para peticiones y respuestas.

El modelo se construye sobre Qwen3-VL-4B-Instruct como columna vertebral multimodal y se entrena en dos etapas: primero un ajuste de instrucciones multimodal de parámetros completos, y después un entrenamiento congelado de cabezas de predicción ordinal acumulativa, categoría de daño y simulación de profesor. Con 4.437 millones de parámetros, está diseñado específicamente para moderación de seguridad, evaluación de riesgo ordinal, red-teaming e investigación de alineación, no para generación de contenido general.

Su relevancia radica en superar la clasificación binaria típica de los moderadores de seguridad, ofreciendo una gradación de riesgo más matizada y evaluaciones condicionadas al objetivo (petición, respuesta o imagen), lo que permite integrar criterios de política flexibles en pipelines de moderación multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (vision-language transformer) con cabezas de predicción ordinal y de categoría |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos backbone en BF16, cabezas en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model-*.safetensors, ordinal_heads.safetensors) |

## Arquitectura y entrenamiento

SafeAtlas Guard 4B utiliza Qwen3-VL-4B-Instruct como columna vertebral multimodal. El entrenamiento se divide en dos etapas diferenciadas. La etapa 1 realiza un ajuste de instrucciones multimodal de parámetros completos para que el backbone aprenda juicios de seguridad estructurados y condicionados al objetivo. La etapa 2 congela el backbone ajustado y entrena tres componentes: una cabeza de clasificación ordinal acumulativa de cinco niveles, una cabeza de categoría de daño de 16 clases y tres cabezas de simulación de profesor. La etapa ordinal emplea objetivos suavizados con gaussiana y umbrales monotónicos aprendidos.

Los tensores del backbone se almacenan en BF16, mientras que todas las cabezas de predicción, incluidos los cuatro parámetros de umbral ordinal entrenables, se almacenan en FP32. Los archivos `model-*.safetensors` contienen el backbone ajustado por instrucciones, `ordinal_heads.safetensors` contiene las cabezas de predicción y umbrales aprendidos, y `ordinal_config.json` define la arquitectura, etiquetas, rango de puntuación y archivos de prompt.

## Capacidades

- Moderación de seguridad multimodal: evalúa contenido de imagen, peticiones ancladas a imagen y respuestas del asistente.
- Clasificación ordinal de cinco niveles: `safe core`, `safe leaning disputed`, `boundary uncertain`, `unsafe leaning disputed` y `unsafe core`.
- Puntuación de riesgo continua de 0 a 100, mapeada linealmente desde el nivel ordinal esperado.
- Predicción de categoría de daño entre 16 etiquetas, además de la etiqueta `none`.
- Tres cabezas juez auxiliares que simulan predicciones de seguridad para peticiones y respuestas.
- Salidas probabilísticas detalladas: probabilidades ordinales acumulativas, distribución sobre los cinco niveles y distribuciones de las cabezas juez.
- Variable latente `z` con umbrales monotónicos aprendidos para la decisión ordinal.
- Integración sencilla mediante la clase `SafetyPredictor` del repositorio SafeAtlas-VL.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede evaluar imágenes subidas por usuarios junto con sus descripciones o comentarios, asignando un nivel de riesgo ordinal que permite priorizar la revisión humana de los casos límite en lugar de aplicar un filtro binario.
- Filtrado de respuestas de asistentes multimodales: integrado como guardrail en un sistema de chat con visión, puede evaluar la respuesta generada por el LLM antes de enviarla al usuario, bloqueando o marcando respuestas inseguras con una puntuación de riesgo.
- Red-teaming de modelos de visión y lenguaje: los equipos de seguridad pueden usar el modelo para generar evaluaciones automatizadas de ataques adversariales multimodales, identificando qué tipos de prompts o imágenes provocan respuestas inseguras.
- Evaluación de datasets de entrenamiento: antes de publicar o utilizar datasets multimodales, el modelo puede puntuar cada muestra para detectar contenido inseguro o de riesgo, facilitando la curación y el filtrado a escala.
- Investigación en alineación de seguridad: el modelo proporciona una salida ordinal interpretable y probabilidades acumulativas que pueden usarse como señal de recompensa o métrica de evaluación en experimentos de alineación de modelos multimodales.
- Auditoría de cumplimiento normativo: empresas que necesitan demostrar que sus sistemas de IA moderan contenido de forma adecuada pueden usar las puntuaciones de riesgo y las predicciones de categoría para generar informes de auditoría sobre la distribución de contenido inseguro detectado.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados en benchmarks externos. F1 denota la F1 de la clase insegura en puntos porcentuales.

| Benchmark | Objetivo | Umbral | F1 |
| --- | --- | ---: | ---: |
| BeaverTails-V | Petición multimodal | 15 | 87,94 |
| BeaverTails-V | Respuesta multimodal | 25 | 79,03 |
| SPA-VL | Petición multimodal | 35 | 80,61 |
| SPA-VL | Respuesta multimodal | 25 | 75,38 |
| VLGuard | Petición multimodal | 15 | 95,49 |
| HarmImageTest | Imagen | 25 | 69,68 |
| LLaVAGuard | Imagen | 20 | 69,68 |
| **Media multimodal (7)** |  |  | **79,69** |
| HarmBench Prompt | Petición de texto | 15 | 99,12 |
| HarmBench Response | Respuesta de texto | 30 | 85,33 |
| OpenAI Moderation | Petición de texto | 75 | 74,66 |
| SafeRLHF | Respuesta de texto | 20 | 72,82 |
| **Media global (11)** |  |  | **80,88** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.437 millones de parámetros en BF16, el backbone ocupa aproximadamente 8,9 GB en memoria, más las cabezas en FP32 y los activaciones, por lo que se estima un consumo de 10-12 GB en inferencia.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con 12 GB o más de VRAM, como RTX 4070 Ti, RTX 4080 o RTX 4090, así como en GPUs profesionales como A10, A100 o L4.
- Opciones de despliegue: el modelo usa la librería transformers y es compatible con endpoints. Se puede servir con vLLM, TGI o cualquier framework que soporte modelos de Qwen3-VL. El repositorio proporciona la clase `SafetyPredictor` para integración directa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Salida | Licencia |
| --- | --- | --- | --- | --- |
| SafeAtlas Guard 4B | 4,4B | Moderación multimodal condicionada al objetivo | Ordinal de 5 niveles + riesgo 0-100 + categoría de 16 clases | no disponible |
| SafeAtlas Guard 8B | 8B (aprox.) | Misma familia, mayor capacidad | Misma estructura | no disponible |
| SafeAtlas Guard 2B | 2B (aprox.) | Misma familia, menor capacidad | Misma estructura | no disponible |
| Qwen3-VL-4B-Instruct | 4,4B | Modelo base multimodal general | Generación de texto e imagen | no disponible |

No se dispone de información sobre otros modelos de moderación de seguridad multimodal comparables como LlamaGuard, ShieldGemma o MD-Judge en la información proporcionada.

## Limitaciones y advertencias

- El modelo y sus datos de entrenamiento contienen necesariamente material inseguro, ofensivo, sensible y potencialmente perturbador. No debe utilizarse para facilitar actividades dañinas ni para atacar a individuos o grupos protegidos.
- Las predicciones dependen del contexto y de la política de seguridad aplicada. El rendimiento puede variar entre idiomas, culturas, dominios, calidades de imagen y tipos de daño no vistos previamente.
- El modelo debe evaluarse en el entorno de despliegue previsto y no debe ser la única base para decisiones de alto impacto.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido o bajo qué condiciones.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas cubiertos, lo que limita la evaluación de su aplicabilidad multilingüe.
- El modelo está diseñado exclusivamente para moderación y evaluación de seguridad, no para generación de contenido general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zrwang1211/SafeAtlas-Guard-4B
- Repositorio de código: https://github.com/zrwang1211/SafeAtlas-VL
- Dataset SafeAtlas-VL: https://huggingface.co/datasets/zrwang1211/SafeAtlas-VL
- Colección SafeAtlas Guard: https://huggingface.co/collections/zrwang1211/safeatlas-guard
- Perfil del autor: https://huggingface.co/zrwang1211
