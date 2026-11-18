# towzeur/RCR

## Resumen

RCR (Reliability-Calibrated Routing) es un clasificador para reconocimiento de imagenes en aprendizaje incremental por clases (class-incremental learning), presentado en el articulo "When Neural Collapse Fails to Route: Routing Drift in Continual Learning" (BMVC 2026). Lo desarrolla el autor towzeur y se publica como conjunto de checkpoints de inferencia en Hugging Face, acompanado de codigo en GitHub y artefactos de evaluacion.

El modelo parte de un backbone ResNet-18 y un clasificador ETF preentrenados con ProNC (Continue-Edge-AI-Lab), que permanecen congelados. Sobre esa base, RCR combina la alineacion con los vertices ETF con una puntuacion radial calculada a partir de prototipos de clase transportados, lo que permite predecir entre todas las clases vistas durante el entrenamiento sin disponer de la etiqueta de tarea en inferencia.

Su relevancia es metodologica: no es un modelo generativo ni un LLM, sino un artefacto de investigacion reproducible para evaluar aprendizaje continuo en CIFAR-10, CIFAR-100 y TinyImageNet con presupuestos de replay de 200 y 500 muestras. El repositorio ocupa 0,8 GB y contiene 18 checkpoints finales (tres semillas por dataset y presupuesto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con clasificador ETF (base ProNC), mas modulo de puntuacion RCR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`) con pesos del backbone, vertices ETF, prototipos y radios de clase |

## Arquitectura y entrenamiento

La arquitectura se apoya en un ResNet-18 cuyo backbone y clasificador ETF se mantienen fijos tras el entrenamiento con ProNC. RCR anade una etapa de puntuacion que combina la alineacion con los vertices del simplex ETF y una puntuacion radial basada en prototipos de clase transportados (`ldc_proto`) y radios por clase (`ldcrad_class_radius`). El objetivo es corregir la deriva de enrutamiento (routing drift) que aparece cuando el colapso neuronal no logra separar correctamente las clases en escenarios incrementales.

Los checkpoints se entrenan sobre tres benchmarks de clasificacion (CIFAR-10, CIFAR-100 y TinyImageNet) con dos presupuestos de replay (200 y 500 muestras) y tres semillas (0, 1, 2), sumando 18 checkpoints finales. Los checkpoints no incluyen imagenes de replay ni estado del optimizador; solo pesos del backbone, vertices ETF, prototipos y radios. No se dispone de informacion sobre numero de tokens, composicion exacta del dataset ni uso de RLHF/DPO, por no aplicar a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes en regimen class-incremental sobre CIFAR-10 (10 clases), CIFAR-100 (100 clases) y TinyImageNet (200 clases).
- Prediccion entre todas las clases vistas durante el entrenamiento sin etiqueta de tarea en inferencia.
- Extraccion de caracteristicas del backbone (`returnt="features"`) para su uso en la puntuacion RCR.
- Puntuacion basada en alineacion ETF mas distancia radial a prototipos transportados.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No esta disenado para reconocimiento open-set ni para reanudar entrenamiento.

## Casos de uso

- Investigacion en aprendizaje continuo: reproducir los resultados del articulo BMVC 2026 cargando los checkpoints y recalculando metricas de exactitud media final y olvido, usando los artefactos de evaluacion del release v1.0.0.
- Baseline para comparar metodos de class-incremental learning: los 18 checkpoints permiten contrastar variantes de enrutamiento sobre el mismo backbone ProNC congelado.
- Evaluacion de deriva de enrutamiento: analizar como evoluciona la asignacion de clases a vertices ETF a lo largo de las tareas incrementales.
- Prototipado de clasificadores incrementales en entornos con memoria limitada: el presupuesto de replay de 200 o 500 muestras es representativo de escenarios edge con almacenamiento restringido.
- Estudio de calibracion de puntuaciones: la combinacion de alineacion ETF y puntuacion radial sirve como caso de estudio para tecnicas de calibracion en clasificacion.
- Docencia y formacion: ejemplo reproducible de colapso neuronal (neural collapse) y sus fallos en enrutamiento, con codigo y checkpoints publicos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a CIFAR-100 con presupuesto de replay 200, promediado sobre tres semillas:

| Metrica | ProNC (base) | RCR | Mejora |
|---|---|---|---|
| Exactitud media final (Class-IL) | 41,71 % | 49,74 % | +8,03 pp |
| Olvido final | 38,55 % | 16,27 % | -22,28 pp |

El autor indica que la tabla completa de resultados para las seis configuraciones esta en el README del repositorio de GitHub y que el recalculo de metricas por tarea requiere los artefactos de features por tarea del release v1.0.0. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, por no aplicar a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; un ResNet-18 en FP32 ocupa del orden de decenas de MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100); el cuello de botella sera el preprocesado de datos, no el modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: el codigo de inferencia usa PyTorch y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RCR (este modelo) | Clasificador class-incremental | ResNet-18 + ETF | CIFAR-10/100, TinyImageNet | no disponible | Hugging Face + GitHub |
| ProNC | Clasificador class-incremental | ResNet-18 + ETF | Mismos benchmarks (base de RCR) | no disponible | GitHub (Continue-Edge-AI-Lab) |
| Alternativas genericas de class-IL | Multiples | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye una comparativa cuantitativa con otros metodos de class-incremental learning mas alla de la linea base ProNC.

## Limitaciones y advertencias

- Entrenado exclusivamente para las clases de sus benchmarks (CIFAR-10, CIFAR-100, TinyImageNet); no es valido para reconocimiento open-set.
- No debe usarse para reanudar entrenamiento: los checkpoints no incluyen imagenes de replay ni estado del optimizador.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Requiere respetar el preprocesado de dataset y el orden de etiquetas del repositorio de codigo para obtener resultados correctos.
- Riesgo de sobreajuste a los benchmarks academicos; el rendimiento en dominios reales no esta documentado.
- No se han publicado analisis de sesgos ni de robustez frente a distribuciones fuera de dominio.
- El recalculo de metricas por tarea exige descargar artefactos adicionales del release, no basta con los checkpoints finales.

## Enlaces

- Hugging Face: https://huggingface.co/towzeur/RCR
- Codigo: https://github.com/towzeur/RCR
- Codigo (tag v1.0.0): https://github.com/towzeur/RCR/tree/v1.0.0
- Resultados: https://github.com/towzeur/RCR#results
- Artefactos de evaluacion: https://github.com/towzeur/RCR/releases/tag/v1.0.0
- Pagina del proyecto: https://towzeur.github.io/RCR/
- Paper (arXiv): https://arxiv.org/abs/2611.22429
- ProNC (base): https://github.com/Continue-Edge-AI-Lab/ProNC
