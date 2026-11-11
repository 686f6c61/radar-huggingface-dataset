# we-dream/pretrain-latent-5kh

## Resumen

WE-Dream pretrain-latent-5kh es un modelo de visión-lenguaje-acción (VLA) desarrollado por el equipo we-dream, orientado a robótica y publicado bajo el paraguas conceptual de los "world-action models". El modelo se distribuye como checkpoint de preentrenamiento en formato safetensors con 22.924.107.603 parámetros totales (aproximadamente 22,9 mil millones), lo que lo sitúa en la gama alta de los modelos VLA disponibles públicamente.

El nombre del checkpoint ("pretrain-latent-5kh") sugiere una fase de preentrenamiento sobre acciones latentes, probablemente con un volumen de datos del orden de 5.000 horas de interacción. El modelo está etiquetado para la pipeline de robótica en Hugging Face y declara capacidades de world-action-model, un paradigma que combina la predicción del estado del entorno con la generación de acciones de control.

La relevancia actual del modelo reside en su tamaño (casi 23B parámetros) para una tarea de robótica, un régimen poco habitual en modelos VLA open source, la mayoría de los cuales se sitúan entre 1B y 7B. La información pública disponible es escasa: el repositorio tiene un acceso restringido (gated) y no se han publicado resultados de benchmarks ni detalles de arquitectura en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA / world-action-model) |
| Parámetros totales | 22.924.107.603 |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna en la información disponible. Las etiquetas del repositorio indican que se trata de un modelo de visión-lenguaje-acción (VLA) con enfoque de world-action-model y acción latente ("latent-action"). El sufijo "pretrain" indica que es un checkpoint de preentrenamiento, no un modelo afinado para una tarea concreta de control, por lo que se espera que requiera ajuste posterior para políticas robóticas específicas.

El calificador "5kh" en el identificador apunta a un corpus de preentrenamiento de aproximadamente 5.000 horas de datos, presumiblemente de demostraciones o interacciones robóticas, aunque no se especifica la composición del dataset, el número de tokens ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Procesamiento conjunto de visión, lenguaje y acción (VLA), orientado a la generación de políticas de control robótico.
- Modelado de mundo y acción ("world-action-model"): se espera que prediga transiciones del entorno además de acciones, aunque no se detalla el mecanismo.
- Representación de acciones latentes, lo que permite abstraer el espacio de acciones de bajo nivel.
- Preentrenamiento como base para ajuste fino en tareas robóticas específicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigación en modelos VLA: servir como base de preentrenamiento para experimentos académicos sobre representaciones latentes de acción, aprovechando sus 22,9B parámetros como punto de partida frente a modelos VLA más pequeños.
- Ajuste fino para manipulación robótica: el checkpoint puede afinarse con datos propios de un brazo robótico o una plataforma concreta para obtener políticas de manipulación, dado que se distribuye como preentrenamiento y no como modelo final.
- Evaluación de world-action models: útil para comparar el paradigma de modelado de mundo frente a políticas puramente reactivas en entornos simulados.
- Generación de datos sintéticos de interacción: un modelo de este tipo puede emplearse para simular trayectorias o estados en pipelines de aumento de datos para entrenamiento de políticas.
- Benchmarking de infraestructura: con 22,9B parámetros y 91,7 GB de pesos, es un caso de prueba realista para pipelines de despliegue distribuido de modelos de robótica.
- Investigación sobre acción latente: estudiar cómo las representaciones latentes de acción aprendidas durante el preentrenamiento se transfieren a tareas de control downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (probablemente bf16/fp16): en torno a 46 GB solo para pesos, más memoria para activaciones y estado de visión; se recomienda un mínimo de 80 GB.
- Cuantización a 8 bits: aproximadamente 23 GB de pesos, viable en una A100 40GB o H100 40GB con margen limitado.
- Cuantización a 4 bits: aproximadamente 12 GB de pesos, potencialmente viable en GPUs consumer de gama alta (RTX 4090 24GB), aunque no se confirma soporte de cuantización.
- GPUs recomendadas: H100 80GB, A100 80GB; para cuantización, A100 40GB o RTX 4090 24GB.
- Despliegue: no se especifican frameworks soportados (vLLM, llama.cpp, Ollama, TGI); al ser un modelo VLA con pipeline de robótica, es probable que requiera código específico no incluido en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| we-dream/pretrain-latent-5kh | 22,9B | no disponible | Apache 2.0 | Gated en HF |
| OpenVLA | 7B | no disponible | no disponible | Público |
| RT-2 (Google DeepMind) | no disponible | no disponible | no disponible (propietario) | No público |
| Octo | no disponible | no disponible | no disponible | Público |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks del modelo. OpenVLA y Octo se citan como referencias de la categoría VLA open source; RT-2 como referencia propietaria del paradigma visión-lenguaje-acción.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Es un checkpoint de preentrenamiento, no un modelo listo para producción; requiere ajuste fino para tareas de control concretas.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No se han publicado benchmarks, lo que impide evaluar su rendimiento frente a alternativas.
- No se detalla la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura de dominios robóticos.
- Riesgo de alucinación y de comportamiento impredecible en entornos físicos: cualquier despliegue en robótica real debe acompañarse de capas de seguridad y validación.
- El tamaño del repositorio (91,7 GB) implica requisitos de almacenamiento y transferencia considerables.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones adicionales del acceso gated antes de un uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/we-dream/pretrain-latent-5kh
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
