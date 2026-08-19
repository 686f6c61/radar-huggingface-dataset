# vigneshwar234/Vashtra-0.6B

## Resumen

Vashtra-0.6B es un modelo de lenguaje pequeño (SLM) de 0,6 mil millones de parámetros, desarrollado por vigneshwar234, que parte del modelo base Qwen3-0.6B y se entrena adicionalmente sobre literatura de machine learning para responder preguntas técnicas del dominio. El objetivo es ofrecer un asistente especializado en ML que sea lo bastante ligero para ejecutarse en el navegador o en dispositivos de borde, manteniendo la capacidad de conversación general gracias a un anclaje de chat incluido en el ajuste.

El proyecto se encuentra en fase de desarrollo: la model card indica explícitamente que los pesos aún no están publicados y que el repositorio contiene el recetario completo (construcción del corpus, script de entrenamiento, exportación ONNX y un notebook de Colab). Por tanto, no hay resultados de evaluación medidos ni benchmarks disponibles. La licencia es Apache-2.0, igual que la del modelo base, y el idioma soportado es únicamente inglés.

La relevancia actual del modelo reside en su enfoque de adaptación de dominio a bajo coste: con una sola GPU T4 gratuita de Colab se puede completar el entrenamiento en dos o tres horas, y el resultado final cabe en un navegador mediante WebGPU. Esto lo convierte en una opción interesante para experimentos de dominio específico en entornos con recursos limitados, aunque su utilidad práctica queda condicionada a la publicación de los pesos y a la verificación de su rendimiento real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-0.6B) |
| Parametros totales | 0,6 mil millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona exportación ONNX y cuantización para el demo, sin especificar formatos) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (pesos aún no publicados) |

## Arquitectura y entrenamiento

Vashtra-0.6B es un fine-tune completo del modelo Qwen3-0.6B, que sigue una arquitectura transformer densa. El entrenamiento se realiza en dos etapas, ambas con ajuste de todos los parámetros (full-parameter), en lugar de usar LoRA, porque a este tamaño el ajuste completo ofrece mejor adaptación de dominio y cabe en una T4 de Colab con unos 10 GB de los 16 GB disponibles.

La primera etapa consiste en continued pretraining sobre 117 000 títulos y resúmenes de artículos arXiv de la categoría `cs.LG`, empaquetados en bloques densos de 1024 tokens para evitar computación desperdiciada en padding. Se usa una tasa de aprendizaje de 5e-5 con decaimiento coseno y una sola época, intencionadamente baja para absorber el dominio sin destruir las capacidades generales del modelo base.

La segunda etapa es un ajuste supervisado (SFT) con respuestas aceptadas de StackExchange de ML, estadística y ciencias de la computación (con puntuación mayor o igual a 3), tareas de explicación y titulación de artículos arXiv, y un anclaje de chat general de aproximadamente 20 000 ejemplos de `smol-smoltalk` para preservar la conversación natural. La tasa de aprendizaje es 1e-5, dos épocas, y la pérdida se enmascara para que solo cuenten los turnos del asistente. Un detalle técnico destacable es la verificación de la tokenización contra `apply_chat_template` para evitar que el bloque vacío `thinking\n\n response` desaparezca al tokenizar mensaje por mensaje, lo que provocaría un desajuste entre entrenamiento e inferencia.

## Capacidades

- Generación de texto en inglés con enfoque en preguntas y explicaciones de machine learning.
- Explicación de conceptos de ML, como pérdidas, arquitecturas o técnicas de entrenamiento.
- Resumen de artículos científicos del ámbito de ML (a partir de títulos y resúmenes).
- Conversación general básica gracias al anclaje de chat incluido en el SFT.
- Ejecución en navegador mediante WebGPU, según el demo Space del autor.
- No soporta tool calling, visión, audio ni razonamiento multi-paso explícito.

## Casos de uso

- Asistente de estudio para estudiantes de ML: puede responder preguntas conceptuales como "¿cuándo debo usar focal loss en lugar de cross-entropy?" con explicaciones adaptadas al nivel del interlocutor, gracias a su entrenamiento sobre literatura y foros especializados.
- Resumen rápido de papers: dado un título y resumen de un artículo arXiv, el modelo puede generar una síntesis o una explicación de sus aportaciones, útil para revisiones bibliográficas preliminares.
- Chat de soporte técnico en aplicaciones de borde: al ser un modelo de 0,6B, puede desplegarse en dispositivos con poca memoria o en el navegador, permitiendo asistencia offline para preguntas frecuentes de ML en entornos sin conexión.
- Prototipado de asistentes de dominio: sirve como base para experimentar con adaptación de dominio a bajo coste, ya que el recetario completo permite reproducir el entrenamiento en una GPU T4 gratuita.
- Generación de titulares o descripciones para artículos científicos: las tareas de titulación y explicación de arXiv incluidas en el SFT habilitan este uso, aunque con las limitaciones propias de un modelo pequeño.
- Demo educativa en WebGPU: el autor proporciona un Space de Hugging Face que ejecuta el modelo en el navegador, útil para demostraciones interactivas de SLM en entornos de enseñanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación aún no se ha ejecutado y que el plan es medir la perplejidad en texto retenido de arXiv `cs.LG` frente al modelo base, pero no hay números reportados.

## Requisitos de hardware

- Entrenamiento: cabe en una GPU T4 de Colab (16 GB VRAM), utilizando aproximadamente 10 GB durante el ajuste completo.
- Inferencia: el autor afirma que el modelo es lo bastante pequeño para ejecutarse en una pestaña del navegador mediante WebGPU, lo que sugiere que puede funcionar en GPUs integradas o incluso en CPU.
- Para inferencia local, una GPU de consumo con al menos 2-4 GB de VRAM sería suficiente para una cuantización ligera, aunque no se especifican requisitos concretos.
- Opciones de despliegue: se menciona exportación ONNX y cuantización para el demo, por lo que es compatible con entornos que soporten ONNX Runtime, además del uso estándar con `transformers` y PyTorch.
- Latencia y throughput: no disponibles, al no haber mediciones publicadas.

## Comparativa con modelos similares

No se dispone de una comparativa formal con benchmarks. Como alternativas de la misma categoría (SLM de ~0,5-0,6B orientados a tareas específicas) se pueden considerar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Vashtra-0.6B | 0,6B | No disponible | Apache-2.0 | Fine-tune de Qwen3-0.6B para ML, pesos no publicados |
| Qwen3-0.6B | 0,6B | 32k (según documentación del base) | Apache-2.0 | Modelo generalista, base de Vashtra |
| SmolLM2-360M | 0,36B | 2k | Apache-2.0 | SLM generalista de Hugging Face, más pequeño |

La comparación es orientativa; sin datos de rendimiento medidos no es posible establecer diferencias objetivas.

## Limitaciones y advertencias

- Los pesos del modelo no están publicados todavía; el repositorio solo contiene el recetario de entrenamiento, por lo que no se puede usar en producción actualmente.
- Al ser un modelo de 0,6B, tiene alta propensión a errores en datos concretos: números exactos, nombres de papers y cualquier información reciente.
- El conocimiento de artículos proviene únicamente de títulos y resúmenes de arXiv, no de los contenidos completos, por lo que puede conocer las afirmaciones de un paper pero no sus resultados reales.
- El idioma soportado es solo inglés; no hay capacidades multilingües.
- Riesgo de alucinación: el autor advierte explícitamente que no se debe citar el modelo ni usarlo para tareas que requieran verificación sin comprobar las respuestas.
- La licencia Apache-2.0 permite uso comercial, pero el corpus mezcla licencias: el contenido de StackExchange es CC-BY-SA-4.0, lo que implica que cualquier derivado de ese contenido debe mantener dicha licencia.
- No hay garantías de rendimiento ni soporte oficial; es un proyecto personal en fase experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vigneshwar234/Vashtra-0.6B
- Demo Space: https://huggingface.co/spaces/vigneshwar234/Vashtra
- Código en GitHub: https://github.com/vignesh2027/Vashtra
- Dataset del corpus: https://huggingface.co/datasets/vigneshwar234/vashtra-ml-corpus
- Perfil del autor: https://huggingface.co/vigneshwar234
