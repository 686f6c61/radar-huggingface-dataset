# surira/pi05_20260904_nova2_box_lift_v3_1_policy

## Resumen

π₀.5 (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para abordar el problema de la generalización en mundo abierto en robótica. A diferencia de los modelos de control robótico tradicionales, que solo funcionan en entornos controlados y con objetos predefinidos, π₀.5 está diseñado para ejecutar tareas de manipulación en entornos y situaciones que no ha visto durante el entrenamiento. Este modelo es una evolución de π₀ y utiliza co-training sobre tareas heterogéneas, datos de múltiples robots, predicción semántica de alto nivel y datos web para lograr esa generalización.

La implementación disponible en HuggingFace (`surira/pi05_20260904_nova2_box_lift_v3_1_policy`) es una adaptación del modelo original realizada con la librería LeRobot, entrenada sobre el dataset `local/nova2_box_lift_v3`. El modelo tiene 3.616.757.520 parámetros (3.6B) y se distribuye en formato safetensors con un tamaño de repositorio de 7,5 GB. La longitud de contexto y los idiomas soportados no se han especificado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.5 |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.5 es un modelo VLA que combina una arquitectura de visión-lenguaje con un componente de acción para generar comandos motores directamente a partir de imágenes y texto. Según el artículo de Physical Intelligence, el modelo emplea co-training sobre tareas heterogéneas: combina datos de múltiples robots, predicción semántica de alto nivel y datos web. Esta estrategia de entrenamiento permite que el modelo aprenda representaciones transferibles y generalice a tareas y entornos no vistos, superando las limitaciones de los modelos entrenados con datos homogéneos. La implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de acciones robóticas (control motor) a partir de entradas de visión y lenguaje.
- Generalización en mundo abierto: capacidad de ejecutar tareas en entornos y con objetos no vistos durante el entrenamiento.
- Manipulación robótica de objetos en tareas como levantar cajas (según el dataset `nova2_box_lift_v3`).
- Transferencia entre plataformas robóticas gracias al co-training con datos de múltiples robots.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No se especifican capacidades de tool calling, agentes ni soporte multilingüe en la información disponible.

## Casos de uso

- Manipulación robótica en almacenes: el modelo puede controlar un brazo robótico para levantar y mover cajas en configuraciones variables, gracias a su entrenamiento con datos heterogéneos.
- Tareas domésticas no estructuradas: al generalizar a entornos no vistos, el modelo puede adaptarse a cocinas o salones con objetos en posiciones aleatorias.
- Automatización de laboratorios: para manipular muestras o instrumentos en entornos de laboratorio donde los objetos cambian de disposición.
- Investigación en robótica: sirve como modelo base para evaluar algoritmos de aprendizaje por refuerzo o imitación en tareas de manipulación.
- Robots de bajo coste: al estar implementado en LeRobot, puede desplegarse en brazos robóticos económicos como el SO100 para prototipado rápido.
- Pick-and-place industrial: el modelo puede ejecutar tareas de recogida y colocación en cintas transportadoras o mesas de trabajo con variabilidad en la posición de los objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se proporcionan requisitos oficiales. Con 3.616.757.520 parámetros, los pesos en bfloat16 ocupan aproximadamente 7,2 GB, por lo que se necesita al menos esa cantidad de VRAM para inferencia, más overhead de activaciones y optimizador.
- GPU recomendadas: no disponible.
- Consumer GPU: no hay datos oficiales, pero por el tamaño de los pesos, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) podría alojar el modelo en bfloat16, aunque no se ha verificado.
- Opciones de despliegue: inferencia y evaluación mediante LeRobot (`lerobot-record`, `lerobot-train`). No se especifican otros frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada. El modelo es una variante específica de π₀.5 entrenada para la tarea `nova2_box_lift_v3`.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado en la información disponible.
- Riesgo de alucinación: al ser un modelo de política, puede generar acciones incorrectas en situaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no se especifican; la entrada de lenguaje probablemente se limita a instrucciones en inglés, pero no está confirmado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, sin restricciones adicionales.
- Caveat importante: el modelo está entrenado específicamente para el dataset `local/nova2_box_lift_v3`, por lo que su rendimiento fuera de esa tarea no está garantizado.

## Enlaces

- HuggingFace: https://huggingface.co/surira/pi05_20260904_nova2_box_lift_v3_1_policy
- Artículo arXiv: https://arxiv.org/html/2504.16054v1
- PDF de Physical Intelligence: https://www.pi.website/download/pi05.pdf
- Blog de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
