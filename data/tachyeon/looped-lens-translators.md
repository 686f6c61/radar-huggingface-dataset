# Tachyeon/looped-lens-translators

## Resumen

Looped Lens Translators es un conjunto de pesos de interpretabilidad (no un modelo generativo) publicado por el usuario Tachyeon bajo el equipo "Looped Readers" para el NDIF Looped Lens Challenge. Se trata de dos ficheros safetensors que implementan lentes de traducción (translator lenses) para el modelo `thinkingmachines/Inkling-2-Mini`, un modelo con arquitectura de capas repetidas (looped). La lente permite leer los estados internos del modelo en posiciones de lectura concretas y proyectarlos al espacio de vocabulario mediante una transformación de bajo rango específica por familia de prompt.

El problema que resuelve es el de la interpretabilidad mecanicista en modelos con capas recurrentes o repetidas: en lugar de aplicar el logit lens clásico (norma final más unembedding directamente sobre el estado oculto), se aprende una transformación lineal de bajo rango que corrige el estado antes de la lectura. En concreto, dado el estado `h` que entra en una visita de capa en la posición de lectura, se normaliza con RMS (`x = h / rms(h)`), una compuerta lineal en la visita 44 selecciona una familia de prompt, y el traductor de esa familia aplica `z = x + (x U) V + c`; la lectura final usa la norma y el unembedding propios del modelo sobre `z`.

Es relevante ahora porque el reto Looped Lens Challenge aborda precisamente el vacío de herramientas de interpretabilidad para arquitecturas no estándar (capas repetidas), y estos pesos ofrecen mapas entrenados únicamente sobre prompts sintéticos generados (aritmética de dos pasos y afirmaciones de dos saltos), sin usar ninguna pregunta del challenge. El repositorio es de tamaño 0.0 GB y no contiene un modelo desplegable, sino artefactos de análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes de traducción de bajo rango sobre estados de un transformer con capas repetidas (Inkling 2 Mini); no es un modelo generativo |
| Parametros totales | no disponible (pesos de lente, tamaño no especificado; repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Inkling 2 Mini) |
| Tipos de cuantizacion | no disponible (pesos safetensors, presumiblemente FP32/FP16/BF16 sin especificar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`translators-arith.safetensors`, `translators-arith-twohop.safetensors`) |

## Arquitectura y entrenamiento

Los pesos implementan una lente de tokens sobre el modelo `thinkingmachines/Inkling-2-Mini`. La lente opera sobre el estado `h` que entra en una visita de capa en la posición de lectura: primero normaliza con RMS, después una compuerta lineal en la visita 44 elige una familia de prompt, y el traductor de esa familia aplica una corrección de bajo rango `z = x + (x U) V + c`. La lectura se realiza con la norma final y el unembedding del propio modelo sobre `z`. Si una familia o visita no tiene mapa asociado, se recurre al logit lens plano.

El entrenamiento se realizó exclusivamente sobre prompts generados: aritmética de dos pasos (con el primer resultado parcial como objetivo) y afirmaciones de dos saltos (con el puente como objetivo). No se utilizó ninguna pregunta del challenge. El método sigue la model card pública `mlyang721/inkling2-gated-translator-lens`, aunque el código, los datos y los pesos son propios del autor. Los ficheros cubren mapas en las visitas 24, 34 a 36 y 42 a 47 para aritmética, y añaden mapas de dos saltos en las visitas 36 y 43 a 47 en la variante `twohop`.

## Capacidades

- Interpretabilidad de estados internos: permite leer la predicción del modelo en visitas de capa concretas mediante una transformación de bajo rango entrenada.
- Lectura selectiva por familia de prompt: la compuerta en la visita 44 enruta el estado a la familia adecuada (aritmética o dos saltos).
- Lectura en visitas específicas: mapas disponibles en las visitas 24, 34-36 y 42-47 (aritmética) y 36, 43-47 (dos saltos).
- Fallback a logit lens: para visitas o familias sin mapa, la lectura se degrada al logit lens estándar.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un artefacto de análisis, no un modelo de chat.
- Capacidades multilingües: no disponibles (no aplica al artefacto).

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar cómo evoluciona la predicción de un modelo con capas repetidas a lo largo de las visitas de capa, usando los mapas entrenados para leer estados intermedios con mayor fidelidad que el logit lens plano.
- Auditoría de razonamiento aritmético: estudiar en qué visita el modelo resuelve el primer paso de una operación de dos pasos y cómo se propaga el resultado parcial hacia la respuesta final.
- Análisis de razonamiento multi-salto: rastrear el puente intermedio en afirmaciones de dos saltos y detectar en qué capas se forma la representación del puente.
- Reproducción de experimentos del Looped Lens Challenge: servir como referencia o punto de partida para otros equipos que quieran comparar metodologías de lentes en modelos con capas repetidas.
- Desarrollo de herramientas de depuración para modelos looped: integrar los mapas en pipelines de análisis que inspeccionen por qué un modelo falla en tareas de composición.
- Estudio de la dinámica de compuertas (gating): analizar cómo la compuerta de la visita 44 separa familias de prompt y si esa separación es estable entre dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los pesos de la lente son pequeños (repo de 0.0 GB), pero su uso requiere cargar el modelo base `thinkingmachines/Inkling-2-Mini`, cuyos requisitos no se detallan en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base.
- Opciones de despliegue: carga directa de safetensors con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplica a un artefacto de interpretabilidad).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelo base | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Looped Lens Translators (Tachyeon) | Inkling-2-Mini | Lente de traducción de bajo rango con compuerta | MIT | Hugging Face, 0 descargas |
| inkling2-gated-translator-lens (mlyang721) | Inkling-2-Mini | Lente de traducción con compuerta (método de referencia) | no disponible | Hugging Face |
| Logit lens clásico | Cualquiera | Proyección directa con norma y unembedding | no aplica | Implementación estándar |

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, código, matemáticas ni ninguna tarea de inferencia directa.
- Los mapas solo cubren las visitas y familias especificadas; fuera de ellas se degrada al logit lens plano, con la pérdida de fidelidad que ello implica.
- Entrenado únicamente con prompts sintéticos de aritmética de dos pasos y dos saltos; la generalización a otros dominios o a preguntas reales del challenge no está validada.
- No se han publicado métricas de fidelidad de la lente ni comparaciones cuantitativas con el logit lens plano.
- Dependencia estricta del modelo base `thinkingmachines/Inkling-2-Mini` y de su tokenizador y unembedding; no es portable a otros modelos.
- Licencia MIT, sin restricciones conocidas para uso comercial, aunque el uso previsto es de investigación.
- Riesgo de interpretación errónea: una lectura de la lente no equivale al mecanismo causal real del modelo; requiere validación con intervenciones (ablaciones, patching).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni de revisión por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tachyeon/looped-lens-translators
- Model card de referencia del método: https://huggingface.co/mlyang721/inkling2-gated-translator-lens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF Looped Lens Challenge: no disponible (no se proporciona URL en la información disponible)
