# zongling/FBA

## Resumen

FBA (Filling Before Advancing) es un método de post-entrenamiento para modelos de lenguaje e imagen (MLLM) especializados en teledetección, desarrollado por Yuheng Zong y colaboradores. El trabajo se centra en la comprensión de imágenes de puertos (harbor understanding) a partir de sensores RGB, SAR, PAN y NIR, y se implementa sobre dos modelos base: LLaVA-v1.5 y Qwen3-VL.

La idea central es construir las capacidades necesarias antes de pedir al modelo que se especialice. Para ello se define una ruta de tres etapas: RS-Anchor (conectar imágenes aéreas con lenguaje), Bridging-Conv (aprender de escenas relacionadas entre distintos sensores) y Scenario-EG (combinar esas habilidades para preguntas, localización y generación de informes sobre puertos).

El repositorio de Hugging Face es por ahora una vista previa del proyecto: los pesos no están publicados y, según la model card, se liberarán tras la aceptación del artículo (arXiv:2607.22205). Esto limita la evaluación práctica del modelo, pero la ficha recoge la información disponible sobre el método y los resultados preliminares publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se aplica sobre LLaVA-v1.5 y Qwen3-VL, ambos basados en transformer multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos aun no se han publicado) |

## Arquitectura y entrenamiento

FBA no define una arquitectura nueva, sino una estrategia de post-entrenamiento aplicada sobre dos MLLM existentes: LLaVA-v1.5 y Qwen3-VL. El entrenamiento se organiza en tres etapas secuenciales. La primera, RS-Anchor, alinea la imaginería aérea con el lenguaje. La segunda, Bridging-Conv, transfiere conocimiento entre escenas relacionadas capturadas por sensores distintos (RGB, SAR, PAN y NIR). La tercera, Scenario-EG, integra esas habilidades para tareas específicas de puertos: comprensión de escena, relaciones espaciales, localización y respuestas basadas en evidencia.

El método se enmarca en lo que los autores denominan "capability-gap-driven post-training": se identifican las carencias de capacidad del modelo base y se cubren antes de la especialización. No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. Se menciona un dataset asociado, CPRS, publicado en Hugging Face, que presumiblemente contiene los datos de teledetección empleados, pero su composición no se detalla en la información proporcionada.

## Capacidades

- Comprensión de imágenes de teledetección procedentes de sensores RGB, SAR, PAN y NIR.
- Respuesta a preguntas visuales (image-text-to-text) sobre escenas de puertos.
- Comprensión de escena y descripción de elementos portuarios.
- Razonamiento sobre relaciones espaciales entre objetos de la imagen.
- Localización de objetos o regiones dentro de la imagen.
- Generación de informes y respuestas basadas en evidencia visual.
- Capacidad multimodal heredada del modelo base (LLaVA-v1.5 o Qwen3-VL).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Monitorización portuaria automatizada: el modelo puede analizar imágenes de satélite o aéreas de instalaciones portuarias y responder preguntas sobre la presencia y estado de infraestructuras, gracias a su entrenamiento específico en escenas de puertos.
- Análisis multisenor en condiciones adversas: al cubrir RGB, SAR, PAN y NIR, permite interpretar imágenes nocturnas o con nubosidad (SAR) donde los sensores ópticos fallan, útil en vigilancia marítima.
- Localización de buques y grúas: la etapa Scenario-EG entrena la localización de objetos, lo que permite señalar posiciones de embarcaciones o equipos dentro de la imagen.
- Generación de informes automáticos de situación: el modelo puede redactar descripciones basadas en evidencia visual de lo observado en una escena portuaria, reduciendo la carga de analistas.
- Apoyo a tareas de respuesta a emergencias: la comprensión de relaciones espaciales y la localización permiten evaluar la disposición de activos en un puerto tras un incidente.
- Investigación en teledetección: sirve como base reproducible para estudiar estrategias de post-entrenamiento por etapas en MLLM aplicados a sensores remotos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre HarborEval (escala 0-100):

| Ruta de entrenamiento | LLaVA-v1.5 | Qwen3-VL |
|---|---:|---:|
| Direct-SFT | 57.95 | 81.09 |
| FBA | 70.29 | 83.37 |

FBA supera a Direct-SFT en +12.34 puntos sobre LLaVA-v1.5 y +2.28 puntos sobre Qwen3-VL. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base, LLaVA-v1.5 o Qwen3-VL, cuyos tamaños no se especifican en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; los pesos aún no se han publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HarborEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FBA (sobre Qwen3-VL) | no disponible | no disponible | 83.37 | no disponible | pesos no publicados |
| FBA (sobre LLaVA-v1.5) | no disponible | no disponible | 70.29 | no disponible | pesos no publicados |
| Direct-SFT (sobre Qwen3-VL) | no disponible | no disponible | 81.09 | no disponible | baseline del paper |
| Direct-SFT (sobre LLaVA-v1.5) | no disponible | no disponible | 57.95 | no disponible | baseline del paper |

No se dispone de comparación con otros MLLM de teledetección en la información proporcionada.

## Limitaciones y advertencias

- Los pesos del modelo no están publicados; el repositorio es una vista previa a la espera de la aceptación del artículo.
- La licencia no está especificada, por lo que no puede confirmarse el uso comercial.
- El ámbito de especialización es muy concreto (comprensión de puertos en teledetección); su rendimiento fuera de ese dominio no está documentado.
- No se detallan los idiomas soportados ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos.
- Riesgo de alucinación inherente a los MLLM, especialmente en respuestas basadas en evidencia visual; no se han publicado métricas de fiabilidad.
- Los resultados de HarborEval son preliminares y proceden de la propia model card; no hay validación independiente.
- No se especifican requisitos de hardware ni métodos de cuantización, lo que dificulta planificar su despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/zongling/FBA
- Paper (arXiv): https://arxiv.org/abs/2607.22205
- Sitio del proyecto: https://z0ngl1ng.github.io/filling-before-advancing/
- Repositorio GitHub: https://github.com/Z0ngL1ng/filling-before-advancing
- Dataset CPRS: https://huggingface.co/datasets/zongling/CPRS
