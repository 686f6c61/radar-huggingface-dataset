# we-dream/pretrain-latent-10kh

## Resumen

`we-dream/pretrain-latent-10kh` es un modelo de visión-lenguaje-acción (VLA) desarrollado por el proyecto WE-Dream, orientado a robótica y publicado bajo el paraguas conceptual de los "world-action models". El modelo está entrenado en modo pretraining sobre representaciones de acción latente, lo que sugiere que no predice directamente comandos motores de bajo nivel, sino un espacio latente intermedio que después se decodifica o adapta a distintos robots y tareas. El checkpoint corresponde a un estado intermedio de preentrenamiento (el sufijo "10kh" apunta a un volumen de datos o pasos de entrenamiento), no a un modelo final ajustado para instrucciones.

Con 22.924.107.603 parámetros (unos 22,9 mil millones) en formato safetensors y un repositorio de 91,7 GB, se sitúa en la gama de los VLA de gran tamaño, comparable en escala a modelos como OpenVLA o Pi0, aunque con una propuesta de entrenamiento centrada en acciones latentes. La licencia es Apache 2.0, lo que facilita su uso comercial, pero el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

Su relevancia actual radica en que los VLA se han convertido en la principal vía para unificar percepción, lenguaje y control en robótica de propósito general. Este checkpoint de pretraining es útil para investigadores que quieran hacer fine-tuning sobre dominios concretos (manipulación, navegación, tareas de laboratorio) partiendo de una base ya entrenada en acciones latentes, en lugar de entrenar desde cero. La información pública disponible es escasa: no se detallan composición del dataset, número exacto de tokens ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (VLA, presumiblemente transformer multimodal con cabeza de acción latente; no confirmado en la información proporcionada) |
| Parametros totales | 22.924.107.603 (~22,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 91,7 GB |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna. Por las etiquetas (`vla`, `world-action-model`, `latent-action`, `robotics`) y el pipeline declarado (`robotics`), se trata de un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La innovación declarada es el uso de "acciones latentes" durante el preentrenamiento: en lugar de supervisar directamente las articulaciones del robot, el modelo aprende un espacio latente de acción que puede mapearse después a distintos embodiment (robots con distinta morfología). Esto es coherente con la línea de "world-action models", que buscan modelar la dinámica del entorno además de la política de control.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset (proporción de vídeo, teleoperación, texto, datos simulados frente a reales), ni si hubo etapas de RLHF o DPO. Tampoco se especifica si el modelo usa atención lineal, decodificación especulativa u otras optimizaciones. El sufijo "10kh" sugiere un checkpoint intermedio de pretraining, probablemente asociado a un volumen de datos o a un número de horas de episodios, pero no se confirma.

## Capacidades

- Percepción visual y comprensión de instrucciones en lenguaje natural (inglés), al ser un modelo VLA.
- Generación de acciones en un espacio latente, presumiblemente adaptable a distintos robots mediante un decodificador específico de embodiment.
- Pretraining orientado a robótica: base para fine-tuning en manipulación, navegación y tareas de control.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): visión sí por su naturaleza VLA; el resto no disponible.
- Al ser un checkpoint de pretraining, no se garantiza que responda a instrucciones de usuario sin un ajuste posterior.

## Casos de uso

- Fine-tuning para manipulación robótica: partir de este checkpoint y ajustar con un dataset propio de teleoperación para un brazo concreto, aprovechando el espacio latente de acción como inicialización.
- Investigación en world-action models: usar el modelo como base para estudiar la transferencia entre embodiment y la calidad de las representaciones latentes de acción.
- Adaptación a robots de almacén: ajustar el modelo para tareas de picking y colocación en entornos logísticos, donde la variabilidad de objetos exige percepción visual robusta.
- Navegación en interiores: entrenar un decodificador de acciones de bajo nivel para un robot móvil a partir de las representaciones latentes del modelo.
- Benchmarking de VLA: servir como línea base de pretraining para comparar estrategias de acción latente frente a acción directa en tareas de manipulación.
- Entrenamiento con datos simulados: preentrenar o ajustar en simuladores (Isaac Sim, MuJoCo) y transferir después a hardware real, usando la acción latente como puente entre dominios.
- Docencia e investigación académica: al ser Apache 2.0 y accesible bajo condiciones, permite reproducir experimentos de VLA en laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 46 GB solo para pesos (22,9 B × 2 bytes), más overhead de activaciones y del codificador visual; se recomienda un mínimo de 80 GB para margen.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2× RTX 4090 24 GB con sharding) para inferencia.
- No cabe en una única GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) en precisión completa; requeriría cuantización a 8 o 4 bits, no publicada oficialmente.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un VLA con pipeline `robotics`, lo habitual sería PyTorch/Transformers con código específico del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| we-dream/pretrain-latent-10kh | ~22,9 B | no disponible | Apache 2.0 | Checkpoint de pretraining VLA con acción latente; acceso gated |
| OpenVLA | ~7 B (variantes) | no disponible | MIT / otras según variante | VLA de referencia para manipulación; ampliamente documentado |
| Pi0 (Physical Intelligence) | no disponible públicamente | no disponible | no disponible | VLA de propósito general; pesos no abiertos en su mayoría |
| RT-2 (DeepMind) | no disponible | no disponible | no disponible | VLA cerrado, referente académico |

La comparación es aproximada: los datos de OpenVLA, Pi0 y RT-2 no forman parte de la información proporcionada y deben verificarse en sus respectivas publicaciones. No se dispone de métricas comparables de rendimiento para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint de pretraining, no un modelo ajustado para instrucciones: su uso directo en producción requerirá fine-tuning y un decodificador de acciones específico.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face; esto puede limitar la reproducibilidad y la automatización de descargas.
- Idioma limitado al inglés según la etiqueta; no se garantiza buen rendimiento en castellano.
- No se documentan sesgos, pero al entrenarse con datos de robótica y posiblemente web, puede heredar sesgos visuales y culturales de esas fuentes.
- Riesgo de alucinación en la parte de lenguaje y de generalización pobre a entornos fuera de la distribución de entrenamiento.
- No se especifican límites de contexto ni restricciones de seguridad para uso físico en robots; cualquier despliegue en hardware real debe incluir capas de seguridad independientes.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que conviene revisar antes de integrar en productos.
- El repositorio ocupa 91,7 GB, lo que exige infraestructura de almacenamiento y transferencia considerable.

## Enlaces

- Hugging Face: https://huggingface.co/we-dream/pretrain-latent-10kh
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos del proyecto WE-Dream.
