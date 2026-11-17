# udibkl/llama27b-adapt-trained-pissa-adapter-5k

## Resumen

El modelo `udibkl/llama27b-adapt-trained-pissa-adapter-5k` es un adaptador de pesos (adapter) publicado en Hugging Face por el usuario `udibkl`. No se trata de un modelo completo, sino de un conjunto de pesos que debe cargarse sobre una base residual PiSSA específica derivada de Llama-2-7b, no sobre los pesos originales de Llama-2. Según la model card, el adaptador se ha entrenado sobre el split de 5k del conjunto Astra, partiendo de un adaptador QPiSSA previamente entrenado con 50k muestras.

La temática declarada en el nombre del repositorio es la detección o tratamiento de inyección SQL ("SQL-injection"), lo que sugiere un ajuste fino orientado a una tarea concreta de seguridad en aplicaciones. El repositorio es muy pequeño (0,1 GB) y no incluye información sobre licencia, idiomas, pipeline ni métricas de evaluación.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación sin documentación pública sustancial, sin descargas ni interacciones, y con una fecha de creación anómala (2026). Debe tratarse como material experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PiSSA sobre Llama-2-7b (transformer decoder-only, base residual PiSSA) |
| Parametros totales | no disponible (el adaptador es un subconjunto; la base es Llama-2-7b, 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b: 4096 tokens, no confirmado en la card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica PiSSA (Principal Singular values and Singular vectors Adaptation), una variante de LoRA que inicializa las matrices de bajo rango a partir de la descomposición en valores singulares de los pesos originales del modelo base. En este caso, el autor indica que el adaptador se ha obtenido adaptando un adaptador QPiSSA previamente entrenado con 50k muestras sobre el split de 5k del conjunto Astra. QPiSSA es una variante cuantizada de PiSSA, aunque la model card no detalla el esquema de cuantización empleado durante el entrenamiento.

No se especifica el número de tokens de entrenamiento, la composición del dataset Astra, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documenta la innovación técnica concreta más allá de la propia elección de PiSSA/QPiSSA como método de ajuste eficiente. La única indicación operativa relevante es que el adaptador debe cargarse sobre la base residual PiSSA correspondiente, no sobre los pesos estándar de Llama-2.

## Capacidades

- Generación de texto y razonamiento heredados de Llama-2-7b, condicionados por el ajuste fino específico.
- Ajuste orientado a la temática de inyección SQL, según el nombre del repositorio; no se documenta el formato exacto de la tarea (clasificación, generación de payloads, detección, etc.).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre ajuste eficiente con PiSSA/QPiSSA: el adaptador sirve como ejemplo reproducible de adaptación de un adaptador previamente entrenado a un subconjunto de datos más pequeño (5k frente a 50k), útil para estudiar la degradación o transferencia entre splits.
- Experimentos de seguridad en aplicaciones: si el ajuste está orientado a detección de inyección SQL, podría emplearse como componente en un pipeline de análisis de consultas, aunque sin métricas publicadas no puede validarse su eficacia.
- Comparación de métodos de adaptación de bajo rango: permite contrastar PiSSA frente a LoRA estándar en tareas de clasificación o generación sobre dominios técnicos.
- Reproducción de recetas de entrenamiento: el repositorio documenta la dependencia de una base residual PiSSA concreta, lo que facilita replicar el flujo de trabajo en entornos de investigación.
- Evaluación de robustez frente a datos de seguridad: útil para medir cómo un adaptador pequeño modifica el comportamiento de Llama-2-7b en dominios especializados.
- Docencia y formación: ejemplo práctico de cómo se publica y carga un adaptador PiSSA en Hugging Face, incluyendo la advertencia sobre la base residual requerida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; la base Llama-2-7b requiere aproximadamente 14 GB en FP16 y entre 4 y 6 GB en cuantizaciones de 4 bits, aunque no se confirma compatibilidad con cuantización del adaptador.
- GPU recomendadas: no disponible; por herencia de Llama-2-7b, una GPU con al menos 16 GB (RTX 4090, A100 40 GB, H100) sería suficiente para la base en FP16.
- Compatibilidad con GPU de consumo: probable para la base en cuantización de 4 bits (RTX 3060 12 GB, RTX 4070, etc.), no confirmado para el adaptador.
- Opciones de despliegue: no disponible; al ser un adaptador PiSSA, requiere cargar la base residual correspondiente, lo que limita el uso directo con vLLM, llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| udibkl/llama27b-adapt-trained-pissa-adapter-5k | Adaptador sobre 7B | no disponible | no disponible | Hugging Face, 0 descargas | Requiere base residual PiSSA |
| Llama-2-7b (Meta) | 7B | 4096 | Llama 2 Community License | Amplia | Modelo base completo |
| Adaptadores LoRA estándar sobre Llama-2-7b | Variable | 4096 | Según autor | Hugging Face | Compatibles con pesos originales |
| QPiSSA 50k (referencia del autor) | Adaptador sobre 7B | no disponible | no disponible | No localizado | Origen del adaptador de 5k |

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al derivar de Llama-2-7b, hereda los sesgos del modelo base.
- Riesgo de alucinación inherente a Llama-2-7b, sin evaluación específica para la tarea de inyección SQL.
- Limitaciones de contexto e idioma no documentadas; se desconoce si el ajuste preserva el multilingüismo del base.
- Restricciones de licencia para uso comercial: no disponibles, lo que impide asumir permisos de uso comercial.
- Caveat crítico para producción: el adaptador debe cargarse sobre la base residual PiSSA correspondiente, no sobre Llama-2-7b estándar; cargarlo incorrectamente produce resultados inválidos.
- Ausencia de métricas, pipeline y documentación de evaluación; no apto para despliegue sin validación propia.
- Fecha de creación anómala (2026) y ausencia de descargas o interacciones, lo que sugiere un artefacto experimental sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/udibkl/llama27b-adapt-trained-pissa-adapter-5k
- No se han localizado papers, blogs, repositorios o demos adicionales en la información proporcionada.
