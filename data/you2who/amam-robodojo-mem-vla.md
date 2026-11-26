# you2who/AMAM-robodojo-mem-vla

## Resumen

AMAM-robodojo-mem-vla es un modelo de tipo vision-language-action (VLA) orientado a robótica, publicado por el usuario you2who bajo el paraguas del proyecto AMAM (AgentMem-Action-Model). El repositorio contiene los pesos de inferencia completos, la configuración, el tokenizador y los metadatos de normalización de benchmarks del modelo congelado en la versión `abs45000`. Su función es traducir observaciones visuales y consignas en acciones motrices ejecutables por un robot, apoyándose en componentes derivados de OpenPI y PaliGemma.

El modelo cuenta con 3.353.433.872 parámetros (aproximadamente 3,35 mil millones) almacenados en formato safetensors, con un repositorio de 6,7 GB. Se distribuye con licencia CC BY 4.0 para las contribuciones propias de AMAM, si bien incorpora material upstream (Gemma, PaliGemma, OpenPI) sujeto a sus propias condiciones de uso.

La relevancia de esta ficha es acotada: se trata de un export de inferencia para investigación en robótica, sin métricas de benchmarks publicadas en la información disponible, sin datos de idiomas declarados y sin descargas ni interacciones registradas en Hugging Face. Es un artefacto técnico para reproducir el protocolo del benchmark robodojo_mem, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de OpenPI/PaliGemma |
| Parametros totales | 3.353.433.872 (aprox. 3,35 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 (contribuciones AMAM); componentes upstream con licencias propias, incluidos terminos de Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo deriva de componentes OpenPI y PaliGemma, lo que sitúa su base en una arquitectura transformer con codificador visual y modelo de lenguaje, extendida con una cabeza de acción para producir comandos motrices. El repositorio corresponde a un export de inferencia congelado en la versión `abs45000`; no se trata de un checkpoint de optimización o de reanudación de entrenamiento.

No se detallan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se describen innovaciones técnicas específicas más allá de la integración de memoria de agente implícita en el nombre del proyecto (AgentMem-Action-Model), cuyo funcionamiento concreto no se documenta en la información proporcionada. El uso requiere aplicar las transformaciones de observación y acción específicas del benchmark robodojo_mem, y el protocolo de normalización y ejecución no es intercambiable entre benchmarks.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y consignas, en el marco del benchmark robodojo_mem.
- Procesamiento multimodal visión-lenguaje heredado de los componentes PaliGemma/OpenPI.
- Inferencia autónoma sin necesidad del código de entrenamiento EVA ni de una descarga separada de la base Pi.
- Integración con metadatos de normalización de benchmark incluidos en el repositorio.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el nombre del proyecto sugiere memoria de agente, pero no se detalla.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio especial: no disponible salvo la componente visual implícita en la arquitectura VLA.

## Casos de uso

- Investigación en manipulación robótica: el modelo permite reproducir el protocolo del benchmark robodojo_mem aplicando las transformaciones de observación y acción incluidas, lo que facilita la comparación de resultados con otros sistemas VLA bajo condiciones controladas.
- Evaluación de políticas visomotoras: al ser un export de inferencia congelado (`abs45000`), sirve como referencia fija para medir el efecto de cambios en el entorno o en el pipeline de percepción sin reentrenar.
- Prototipado de agentes con memoria en robótica: el proyecto AMAM sugiere el uso de memoria de agente; el modelo puede integrarse en bucles de control donde se acumule contexto de interacciones previas, siempre que se respete el protocolo de normalización del benchmark.
- Reproducibilidad de experimentos académicos: al incluir tokenizador, configuración y metadatos de normalización, el repositorio permite reconstruir exactamente las condiciones de inferencia descritas en el paper asociado (arXiv:2609.11308).
- Desarrollo de pipelines de inferencia VLA: el modelo puede desplegarse en servidores con GPU para generar acciones a partir de flujos de cámara, integrándose en frameworks de robótica que consuman tensores safetensors.
- Formación y docencia en robótica con IA: sirve como ejemplo práctico de un sistema VLA de tamaño medio (3,35 mil millones de parámetros) para estudiar cómo se combinan codificadores visuales, modelos de lenguaje y cabezas de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (3,35 mil millones de parámetros), en FP16 se requerirían del orden de 6,7 GB solo para pesos, más memoria para activaciones y el codificador visual; en cuantizaciones de 8 bits o 4 bits el requisito de pesos bajaría aproximadamente a 3,4 GB y 1,7 GB respectivamente, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en GPUs de gama alta para consumidor (por ejemplo, RTX 4090 con 24 GB) y en GPUs de centro de datos (A100, H100), pero esta afirmación es una estimación por tamaño y no un dato publicado.
- ¿Cabe en GPU de consumidor? Probablemente sí en modelos con 16 GB o más de VRAM en FP16, y en GPUs de 8-12 GB con cuantización, si bien no hay confirmación oficial ni formatos cuantizados publicados.
- Opciones de despliegue: no se documentan en la model card. Dado el formato safetensors y la dependencia de componentes OpenPI/PaliGemma, el despliegue requeriría el código de inferencia de AMAM Action; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AMAM-robodojo-mem-vla | 3,35 mil millones | no disponible | cc-by-4.0 (con terminos upstream) | Hugging Face, 0 descargas | Export de inferencia para benchmark robodojo_mem |
| OpenPI / Pi (referencia base) | no disponible en la informacion | no disponible | sujeta a terminos propios | disponible mediante el proyecto OpenPI | Componente upstream del que deriva este modelo |
| PaliGemma (referencia base) | no disponible en la informacion | no disponible | terminos de Gemma | disponible en Google/Hugging Face | Codificador vision-lenguaje upstream |

No se dispone de datos suficientes para comparar rendimiento con alternativas VLA de la misma categoría; la comparativa se limita a la relación de dependencia con los componentes upstream.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible, por lo que no es posible evaluar su calidad objetiva.
- El modelo está diseñado específicamente para el benchmark robodojo_mem; las transformaciones de observación y acción y el protocolo de normalización no son intercambiables con otros benchmarks, lo que limita su reutilización directa.
- La licencia CC BY 4.0 cubre únicamente las contribuciones de AMAM; los componentes upstream (Gemma, PaliGemma, OpenPI) mantienen sus propias licencias y términos, que deben respetarse, incluidos los términos de Gemma.
- No se declaran idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos; en un modelo de acción robótica, los fallos de política pueden traducirse en movimientos inseguros, por lo que se recomienda supervisión y límites de seguridad en el robot.
- El repositorio no incluye checkpoints de optimización ni de reanudación de entrenamiento, solo pesos de inferencia congelados en `abs45000`.
- No hay información sobre cuantizaciones disponibles, lo que puede dificultar el despliegue en hardware limitado.
- Ausencia total de descargas y likes en Hugging Face: no existe validación comunitaria documentada.
- Se desconoce el comportamiento fuera del dominio del benchmark; no debe asumirse generalización a tareas robóticas no contempladas.

## Enlaces

- Hugging Face: https://huggingface.co/you2who/AMAM-robodojo-mem-vla
- Código: https://github.com/utomm/AgentMem-Action-Model
- Proyecto: https://agent-mem-action-model.github.io/
- Paper: https://arxiv.org/abs/2609.11308
- Modelo VLM relacionado: https://huggingface.co/you2who/AMAM-robodojo-mem-vlm
- Dataset de anotaciones: https://huggingface.co/datasets/you2who/AMAM-robodojo-mem-annotations
