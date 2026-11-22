# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step240

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 es un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base realizado por el usuario thkim0305-SNU mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El objetivo declarado es el "safety tuning": alinear el comportamiento del modelo en materia de seguridad usando optimización de política con recompensas, en lugar de un simple SFT supervisado. El checkpoint publicado corresponde al paso 240 de optimizador de una ejecución concreta (identificador `grpo-mixture8-qwen35base4b-lr2e6-resume80-save40-pro6000-gpu0123-20261119-v1`).

El modelo hereda la arquitectura multimodal de Qwen3.5-4B-Base (pipeline `image-text-to-text`), con 4.659.865.088 parámetros totales según los pesos en safetensors y un repositorio de 9,3 GB. Los pesos de visión y los pesos MTP (multi-token prediction) sin entrenar provienen del modelo base fijado en la revisión `1001bb4d826a52d1f399e183466143f4da7b741b`, mientras que el export contiene únicamente los pesos de inferencia, la configuración y los activos del tokenizador.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación con 2 descargas y 0 likes en el momento de la consulta, sin model card detallada más allá de los hiperparámetros del run. Resulta útil como referencia de receta GRPO aplicada a un modelo de 4B con capacidades de visión, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline `image-text-to-text`; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer de 4B parámetros con capacidades multimodales (entrada de imagen y texto). El ajuste se realiza con GRPO, una variante de optimización de política proximal que estima la ventaja relativa dentro de grupos de respuestas generadas para el mismo prompt, eliminando la necesidad de un modelo crítico separado. Los hiperparámetros declarados son: tasa de aprendizaje 2e-6, coeficiente KL 0.001, 15 prompts y 8 respuestas por actualización, y 240 actualizaciones de optimizador completadas (iteración Megatron 239). El nombre del run indica un esquema "Mixture8" y un reanudado desde el paso 80 con guardado cada 40 pasos.

El entrenamiento se ejecutó sobre GPUs 0-3 (sufijo `gpu0123` en el identificador del run) y el export conserva los pesos de visión y los pesos MTP no entrenados del modelo base fijado. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de seguridad, ni si se aplicaron etapas previas de SFT o DPO. Tampoco se detalla la innovación técnica más allá del propio esquema GRPO con penalización KL.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), heredado del modelo base.
- Ajuste orientado a seguridad: el objetivo declarado del entrenamiento es reducir respuestas inseguras mediante recompensas GRPO.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite desplegarlo en infraestructura de inferencia compatible con la API de Hugging Face.
- Soporte de tool calling, agentes, modo thinking o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.

## Casos de uso

- Investigación en alineación de seguridad: reproducir o comparar la receta GRPO (lr 2e-6, KL 0.001, 15 prompts × 8 respuestas) sobre un base de 4B para estudiar cómo evoluciona la tasa de respuestas inseguras a lo largo de los pasos de optimización.
- Evaluación de robustez multimodal: al conservar la torre de visión del base, sirve para medir si el safety tuning degrada la comprensión de imágenes o introduce rechazos excesivos ante entradas visuales benignas.
- Punto de partida para ajustes posteriores: al ser un checkpoint intermedio (paso 240) con licencia Apache 2.0, puede usarse como inicialización para SFT o DPO adicionales en dominios concretos.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` permite servirlo en infraestructuras de inferencia gestionadas para pruebas internas de políticas de seguridad.
- Benchmarking de recetas de RL: comparar este run "Mixture8" con otras variantes del mismo autor para aislar el efecto de la mezcla de prompts y del coeficiente KL.
- Filtrado y moderación asistida en prototipos: con validación humana previa, evaluar su utilidad como clasificador generativo de contenido sensible en un pipeline de moderación, dado su enfoque declarado en seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB en función de la longitud de contexto.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, aunque no se publican ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto largo y concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de un solo usuario.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en tarjetas de 8-12 GB; no se garantiza en GPUs de 6 GB o menos.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles con la API de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | no disponible | Apache 2.0 | Ajuste GRPO de seguridad, checkpoint paso 240, multimodal |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | Apache 2.0 (según base) | Modelo base sin ajuste de seguridad; referencia directa |
| Alternativas de 4B con safety tuning | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint intermedio (paso 240 de un run reanudado): no representa necesariamente el estado final óptimo de la política y puede mostrar comportamientos inestables.
- Sin model card detallada: no se documentan datos de entrenamiento, composición del dataset de seguridad ni métricas de evaluación, lo que impide verificar la eficacia real del safety tuning.
- Riesgo de sobre-rechazo: el ajuste con recompensas de seguridad puede producir respuestas excesivamente cautelosas o evasivas en consultas benignas.
- Alucinación: como cualquier modelo generativo de 4B, puede inventar información, especialmente en dominios especializados no cubiertos por el ajuste.
- Idiomas y contexto no declarados: se desconoce el alcance multilingüe y la ventana de contexto efectiva tras el ajuste.
- Sesgos: no se han publicado análisis de sesgo; el modelo hereda los del base Qwen3.5-4B-Base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el comportamiento antes de cualquier despliegue en producción.
- Madurez: 2 descargas y 0 likes indican un artefacto experimental sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revisión del base fijada: `1001bb4d826a52d1f399e183466143f4da7b741b`
- Paper de GRPO (referencia metodológica): no disponible en la información proporcionada
- Repositorio de código o demo: no disponible
