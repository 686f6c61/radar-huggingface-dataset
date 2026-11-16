# we-dream/posttrain-g1-latent-10kh

## Resumen

`we-dream/posttrain-g1-latent-10kh` es un modelo de tipo vision-language-action (VLA) especializado en robótica, desarrollado por el equipo we-dream. Se trata de un ajuste fino (post-training) del modelo base `we-dream/pretrain-latent-10kh` sobre el dataset `we-dream/g1-post-training-dataset`, orientado al control del robot humanoide Unitree G1. El modelo se enmarca en la categoría de world-action models: recibe observaciones visuales y produce acciones motoras, integrando percepción y control en un único modelo neuronal.

Con 22.924.447.619 parámetros (aproximadamente 22,9 mil millones) y un repositorio de 45,8 GB en formato safetensors, el modelo está pensado para despliegue en infraestructura de inferencia robótica, no para hardware de consumo. La licencia no está disponible en la información proporcionada y el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia radica en la tendencia creciente hacia modelos fundacionales para robótica que unifican percepción y acción, y en su especialización concreta en una plataforma humanoide comercial (Unitree G1). No obstante, la ausencia de benchmarks publicados, de documentación técnica detallada y de licencia explícita limita seriamente su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA); detalles internos no disponibles |
| Parametros totales | 22.924.447.619 (~22,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como VLA (vision-language-action) y world-action-model, lo que implica una arquitectura que combina un codificador visual, un modelo de lenguaje y un cabezal de generación de acciones. La información disponible no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni especifica el mecanismo de fusión entre modalidades. El nombre "latent-10kh" sugiere un entrenamiento sobre un corpus latente de aproximadamente 10.000 horas de datos, aunque este extremo no está confirmado en la documentación.

El entrenamiento consta de dos fases: un preentrenamiento en `we-dream/pretrain-latent-10kh` y un post-training sobre `we-dream/g1-post-training-dataset`, específico para el robot Unitree G1. No se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). El tag "sonic" en la metadata podría referirse a un componente o método interno, pero no hay documentación que lo aclare.

## Capacidades

- Percepción visual y generación de acciones motoras para el robot humanoide Unitree G1.
- Modelado de tipo world-action: predicción de acciones condicionadas por observaciones del entorno.
- Procesamiento de instrucciones en inglés (único idioma declarado).
- Integración percepción-acción en un único modelo, sin pipeline modular explícito.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Control de manipulación en el Unitree G1: el modelo traduce observaciones visuales en comandos motores para tareas de agarre y manipulación de objetos, aprovechando su entrenamiento específico sobre el dataset de post-training del G1.
- Navegación asistida en entornos domésticos: al ser un VLA entrenado con datos del humanoide, puede emplearse para generar trayectorias y acciones de desplazamiento condicionadas por la escena visual.
- Investigación en modelos fundacionales de robótica: sirve como punto de partida para experimentos de fine-tuning sobre nuevas tareas o entornos, dado su origen como modelo preentrenado más post-entrenado.
- Evaluación de world-action models: útil en laboratorios que comparan enfoques VLA frente a pipelines modulares clásicos (percepción + planificación + control).
- Prototipado de tareas de pick-and-place: el post-training sobre el G1 permite adaptar el modelo a flujos de recogida y colocación en almacenes o laboratorios.
- Benchmarking interno de políticas robóticas: al estar restringido y sin benchmarks públicos, se puede usar como referencia interna en estudios comparativos de políticas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 46 GB solo para pesos (22,9 mil millones de parámetros × 2 bytes), más overhead de activaciones y buffers visuales.
- VRAM estimada en cuantización de 8 bits: en torno a 23 GB, sujeta a que existan pesos cuantizados (no confirmado).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o L40S 48 GB podrían ser insuficientes en fp16 por el overhead.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en fp16; requeriría cuantización agresiva (4 bits) no documentada.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un VLA, el despliegue típico sería un runtime robótico propio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Enfoque |
|---|---|---|---|---|---|
| we-dream/posttrain-g1-latent-10kh | ~22,9 B | no disponible | no disponible | gated | VLA para Unitree G1 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se inventan datos de terceros.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la integración automatizada.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en tareas de manipulación, navegación o control.
- Especialización estrecha: entrenado para el Unitree G1; su transferencia a otros robots o morfologías no está documentada.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación y comportamiento impredecible en entornos fuera de distribución, especialmente crítico en robótica física donde los errores tienen consecuencias materiales.
- Sin información sobre sesgos, datos de entrenamiento ni procesos de alineación.
- Documentación técnica mínima: no se detallan arquitectura interna, contexto, cuantizaciones ni métodos de entrenamiento.
- El tamaño del repo (45,8 GB) y los 22,9 B de parámetros implican requisitos de hardware elevados para inferencia en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/we-dream/posttrain-g1-latent-10kh
- Modelo base: https://huggingface.co/we-dream/pretrain-latent-10kh
- Dataset de post-training: https://huggingface.co/datasets/we-dream/g1-post-training-dataset
