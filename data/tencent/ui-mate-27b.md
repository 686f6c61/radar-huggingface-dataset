# tencent/UI-Mate-27B

## Resumen

UI-Mate-27B es un agente de interfaz gráfica de usuario (GUI) de código abierto desarrollado por el equipo Tencent HY Frontier (Multimodal Agent Team). El modelo observa capturas de pantalla en vivo, razona sobre el estado visible del sistema y genera acciones estructuradas de teclado y ratón para interactuar con aplicaciones de escritorio en sistemas operativos como Ubuntu y Windows. Está construido sobre el modelo base Qwen/Qwen3.6-27B, lo que le confiere una arquitectura transformer multimodal de 27 mil millones de parámetros.

Su relevancia actual radica en dos capacidades diferenciadoras: la ejecución general de tareas de uso de ordenador a partir de instrucciones en lenguaje natural y la ejecución guiada por demostraciones, donde el modelo adapta un flujo de trabajo extraído de una única demostración exitosa a una nueva tarea. A diferencia de los scripts de automatización tradicionales, el modelo replanifica continuamente desde la interfaz en vivo, lo que le permite manejar cambios de contenido, diseño o estado de la aplicación. El checkpoint está diseñado como un agente, no como un modelo de chat visual independiente, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3.6-27B, especializado en agente GUI |
| Parametros totales | 27B (según la model card) / 3.054.832 (según metadatos safetensors del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B, no especificado) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UI-Mate-27B es un modelo multimodal que procesa instrucciones de tarea, capturas de pantalla, historial de interacción y, opcionalmente, contexto de demostración. Su salida incluye razonamiento, una descripción concisa de la acción y llamadas a herramientas estructuradas. El espacio de acción cubre ratón, teclado, scroll, espera, interacción con el usuario y finalización de tarea. El modelo razona en un espacio de coordenadas normalizado de 1000 × 1000 píxeles, y el agente de referencia reescala automáticamente las coordenadas predichas a la resolución original de la captura.

El entrenamiento combina ajuste fino supervisado (SFT) seguido de aprendizaje por refuerzo online en entornos GUI ejecutables. Esto permite al modelo optimizar trayectorias de acción reales en lugar de solo predecir texto. La innovación técnica principal reside en el modo de ejecución guiada por demostraciones: un registro de demostración se normaliza, se anota con observaciones, intenciones, acciones y evidencia de verificación, se segmenta en subtareas con criterios de finalización y se inyecta en tiempo de inferencia como un flujo de trabajo compacto para la subtarea activa. La captura de pantalla en vivo sigue siendo la fuente autoritativa durante toda la ejecución.

## Capacidades

- Ejecución general de uso de ordenador: realiza tareas complejas en Ubuntu y Windows a partir de instrucciones en lenguaje natural y capturas de pantalla en vivo.
- Ejecución guiada por demostraciones: aprende un procedimiento a partir de una única demostración y lo adapta a nuevas tareas, replanificando desde la interfaz en vivo.
- Razonamiento de larga duración: ejecuta tareas que requieren múltiples pasos y cambios entre varias aplicaciones.
- Grounding visual en pantalla: utiliza la captura de pantalla actual como fuente de verdad, evitando la reproducción de coordenadas fijas.
- Acciones estructuradas: genera acciones compatibles con `pyautogui`, incluyendo ratón, teclado, scroll y espera.
- Interfaz de servidor compatible con OpenAI: permite servir el modelo con vLLM y consumirlo mediante API estándar.
- Soporte para agente conversacional: integra historial de interacción para mantener contexto entre acciones.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede instalar extensiones en editores de código, exportar documentos a otros formatos o configurar aplicaciones, como se muestra en los ejemplos oficiales ("Instala la extensión autoDocstring en VS Code").
- Automatización de procesos robóticos (RPA): al estar basado en capturas de pantalla y acciones estructuradas, puede sustituir a scripts RPA frágiles en entornos donde la interfaz cambia con frecuencia.
- Testing de interfaces de usuario: puede ejecutar flujos de usuario completos y verificar visualmente el resultado, reduciendo el mantenimiento de selectores de UI.
- Asistencia a usuarios con diversidad funcional: permite controlar el ordenador mediante lenguaje natural, ejecutando acciones de ratón y teclado sin necesidad de interacción física directa.
- Creación de macros adaptativas: un usuario puede grabar una demostración de un flujo de trabajo (por ejemplo, procesar una factura) y el modelo lo aplica a nuevas facturas con formatos distintos, gracias a su capacidad de replanificación.
- Automatización en entornos virtualizados: su compatibilidad con `pyautogui` y vLLM permite desplegarlo en contenedores o máquinas virtuales para gestionar aplicaciones heredadas sin API.

## Benchmarks y rendimiento

### Ejecución solo con instrucciones

| Benchmark | UI-Mate-27B |
| --- | ---: |
| OSWorld-Verified · puntuación media | **77.0** |
| WindowsAgentArena · puntuación media | **66.2** |
| OSWorkerBench · éxito estricto | **41.00** |
| OSWorkerBench · progreso | **76.86** |

### Ejecución guiada por demostraciones

| Conjunto de evaluación · métrica | Solo instrucción | + una demostración | Cambio |
| --- | ---: | ---: | ---: |
| OSWorkerBench-Subset (33) · éxito estricto | 17.17 | **35.35** | +18.18 pp |
| OSWorkerBench-Subset (33) · progreso | 67.85 | **81.14** | +13.29 pp |
| OSWorld-Subset (30) · progreso | 40.27 | **65.75** | +25.48 pp |
| GameDev (10) · puntuación media | 76.76 | **81.15** | +4.39 pp |

En GameDev, la guía por demostración también reduce la longitud media de la trayectoria de 303.6 a 253.1 pasos. Los resultados son promedios de tres ejecuciones por objetivo en OSWorkerBench-Subset y cinco ejecuciones en el resto.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 54.7 GB en safetensors, lo que sugiere pesos en bf16. Para inferencia se recomienda al menos 2 GPUs con 80 GB de VRAM cada una, como se indica en el ejemplo de vLLM (`--tensor-parallel-size 2 --gpu-memory-utilization 0.85`).
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB o superiores. No se proporcionan cuantizaciones, por lo que no cabe en GPUs de consumo como RTX 4090 sin cuantizar.
- Opciones de despliegue: vLLM (recomendado, con `--mm-encoder-tp-mode data`), servidor OpenAI-compatible, y el harness de interacción del repositorio oficial de UI-Mate.
- Latencia y throughput: no disponibles. El ejemplo oficial limita a 6 imágenes por prompt (`--limit-mm-per-prompt '{"image":6,"video":0}'`), ya que el agente mantiene cinco capturas en contexto.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparativas directas con otros agentes GUI de peso abierto (como UI-TARS u otros). La siguiente tabla compara con su modelo base y señala la falta de datos para alternativas.

| Modelo | Tipo | Parametros | Contexto | Rendimiento GUI (OSWorld-Verified) |
| --- | --- | ---: | ---: | ---: |
| UI-Mate-27B | Agente GUI multimodal | 27B | No disponible | **77.0** |
| Qwen3.6-27B (base) | VLM general | 27B | No disponible | No disponible |
| Otros agentes GUI open-weight | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint de agente, no un modelo de chat visual independiente. Requiere el prompt oficial, el parser de respuestas y el harness de interacción del repositorio UI-Mate para funcionar correctamente.
- El modelo opera sobre capturas de pantalla; si el estado de la interfaz cambia drásticamente entre capturas, puede generar acciones incorrectas o alucinar estados.
- El espacio de coordenadas está normalizado a 1000 × 1000; cualquier integración debe reescalar las coordenadas a la resolución real de la pantalla.
- No se especifican idiomas soportados, aunque al estar basado en Qwen3.6-27B es probable que herede capacidades multilingües del modelo base; esto no está confirmado.
- La longitud de contexto no está documentada, lo que limita la planificación de tareas extremadamente largas sin conocer el límite exacto de tokens.
- No se proporcionan cuantizaciones oficiales, lo que obliga a usar bf16 y requiere hardware de datacenter para una ejecución fluida.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo depende de `pyautogui` y de un harness específico, por lo que la integración en producción requiere mantener el repositorio oficial actualizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tencent/UI-Mate-27B)
- [Página del proyecto](https://ui-mate.github.io/)
- [Repositorio oficial en GitHub](https://github.com/Tencent/UI-Mate)
- [Colección UI-Mate en Hugging Face](https://huggingface.co/collections/tencent/ui-mate)
- [Modelo base Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
