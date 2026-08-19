# UnderTides/Embodied-Navigator-7B-GRPO

## Resumen

Embodied-Navigator-7B-GRPO es un modelo de política de navegación visión-lenguaje (vision-language navigation, VLN) desarrollado por el grupo ZJU-OmniAI de la Universidad de Zhejiang y publicado en Hugging Face bajo el usuario UnderTides. El modelo adapta Qwen2.5-VL-7B-Instruct, un VLM de 7 mil millones de parámetros, para convertir instrucciones lingüísticas y observaciones visuales egocéntricas en decisiones de navegación concretas: selección de cámara, razonamiento selectivo y predicción de un waypoint en píxeles 2D. El sistema completo proyecta ese píxel a 3D mediante profundidad y delega la ejecución del movimiento en un controlador de bajo nivel.

La relevancia de este modelo radica en que aborda la navegación continua (continuous VLN) sin regresar coordenadas 3D ni emitir secuencias largas de acciones atómicas, sino actuando como un "puntero visual". El checkpoint incluye tokens específicos de navegación y una cabeza de acción aprendida, y ha sido alineado mediante Two-Level Group Relative Policy Optimization (GRPO) tras un ajuste supervisado. Con una ventana de contexto de 128K tokens y entrada de cuatro vistas RGB de 90 grados, está diseñado para entornos de interior como Matterport3D y benchmarks R2R-CE y RxR-CE.

El modelo se distribuye en formato BF16 (safetensors, ~17,3 GB) y requiere el código del repositorio del proyecto para cargarse correctamente; no es un checkpoint de chat genérico. Está pensado exclusivamente para investigación en navegación encarnada, robótica y alineación de políticas mediante aprendizaje por refuerzo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B-Instruct adaptado para navegación (con tokens de navegación y cabeza de acción) |
| Parametros totales | 8.632.279.072 (8,63 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | BF16 (única precisión publicada; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, ~17,3 GB) |

## Arquitectura y entrenamiento

Embodied-Navigator-7B-GRPO parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal con mecanismos de atención de visión y lenguaje. Sobre esta base se añaden componentes específicos de navegación: tokens de navegación (para indicar decisiones de vista y waypoint), una cabeza de acción que predice coordenadas de píxel 2D y un módulo de memoria denominado Anchor-Trajectory Memory con Space-Time Indicators. El modelo procesa cuatro vistas RGB egocéntricas de 90 grados (cobertura de 360 grados) junto con la instrucción textual y la memoria de trayectoria comprimida.

El entrenamiento sigue un pipeline en dos fases: primero un ajuste supervisado (SFT) sobre el corpus MultiNav-CoT, compuesto por 90.000 trayectorias de navegación con razonamiento de cadena de pensamiento; después, una alineación mediante Two-Level GRPO que combina ventajas de acción locales con ventajas de trayectoria globales. El método se organiza en cuatro componentes: Point (selección de vista y waypoint en píxeles), Think (razonamiento CoT solo en nodos de decisión relevantes), Memorize (retención de anclas visuales y compresión de movimientos rutinarios) y Align (optimización por GRPO de dos niveles). El modelo no regresa coordenadas 3D directamente; la proyección píxel-a-3D se realiza con geometría determinista tras la predicción.

## Capacidades

- Navegación visión-lenguaje continua: interpreta instrucciones en lenguaje natural y genera waypoints en píxeles 2D a partir de observaciones visuales egocéntricas.
- Selección de vista: elige entre las cuatro cámaras de 90 grados cuál es la más relevante para el siguiente paso.
- Razonamiento selectivo (Chain-of-Thought): activa el razonamiento explícito solo en nodos de decisión relevantes, reduciendo el coste computacional.
- Memoria de trayectoria a largo plazo: comprime movimientos rutinarios en indicadores espacio-temporales y retiene anclas visuales críticas para tareas de largo horizonte.
- Predicción de waypoint basada en píxeles: salida interpretable que puede proyectarse a 3D con profundidad.
- Alineación por refuerzo: política optimizada con GRPO de dos niveles, que combina ventajas locales y globales.
- Capacidad de evaluación en benchmarks estándar de VLN (R2R-CE y RxR-CE) y en entornos reales con transferencia zero-shot.
- No es un modelo de chat o captioning genérico: está especializado en la tarea de navegación y requiere el pipeline completo del proyecto.

## Casos de uso

- Navegación autónoma en interiores para robots de servicio: el modelo puede guiar a un robot móvil desde una instrucción como "ve a la cocina y trae la taza azul", seleccionando la vista correcta y generando waypoints que el controlador de bajo nivel ejecuta.
- Exploración y mapeo de entornos desconocidos: gracias a la memoria de trayectoria y al razonamiento selectivo, el sistema puede recorrer espacios amplios sin perder la referencia de la instrucción original.
- Asistencia a personas con movilidad reducida: un robot asistencial equipado con este modelo podría navegar por el hogar siguiendo comandos de voz, con una ventana de contexto de 128K tokens que permite instrucciones largas y detalladas.
- Inspección industrial y monitorización de instalaciones: el modelo puede recibir instrucciones de verificación ("revisa todas las válvulas de la sala de máquinas") y planificar rutas visuales en entornos estructurados.
- Investigación en aprendizaje por refuerzo para robótica: el checkpoint sirve como punto de partida para experimentos de alineación de políticas con GRPO en tareas de navegación, dado que incluye el código de entrenamiento y evaluación en el repositorio.
- Evaluación de generalización zero-shot en entornos reales: el modelo ha demostrado un 60% de éxito en 100 pruebas ciegas en el mundo real, lo que lo hace útil para validar transferencia sim-to-real en robótica.
- Desarrollo de agentes encarnados con razonamiento selectivo: su capacidad de activar el razonamiento solo cuando es necesario permite desplegar sistemas con presupuestos computacionales ajustados en plataformas embarcadas.

## Benchmarks y rendimiento

Los resultados se reportan en las divisiones validation-unseen de los benchmarks R2R-CE y RxR-CE. NE (Navigation Error) es menor es mejor; el resto de métricas, mayor es mejor.

| Benchmark | NE | OS | SR | SPL | nDTW |
|---|---:|---:|---:|---:|---:|
| R2R-CE Val-Unseen | 3,85 | 74,5 | 66,2 | 58,8 | — |
| RxR-CE Val-Unseen | 4,32 | — | 65,7 | 56,9 | 72,4 |

Hallazgos adicionales publicados:

- Razonamiento adaptativo: 66,2% de SR en R2R-CE con una proporción de razonamiento del 26,3%.
- Memoria Anchor-Trajectory: 49,8% de SR en el subconjunto de largo horizonte.
- Evaluación zero-shot en mundo real: 60,0% de éxito sobre 100 pruebas ciegas.

Estos resultados dependen del stack completo de evaluación (prompt multi-vista, gestión de memoria, proyección píxel-a-3D, localización y control de bajo nivel) y no se reproducen cargando el checkpoint como un pipeline estándar de Transformers.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa ~17,3 GB en disco. Para cargar el modelo completo en memoria se recomienda al menos 24 GB de VRAM (por ejemplo, una RTX 4090 o A5000). Con contexto largo (128K tokens) y cuatro vistas de imagen, el uso de memoria puede superar los 24 GB; se recomienda una GPU con 32 GB o más (A100 40 GB, H100) para ejecución cómoda.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090, RTX 6000 Ada o similares con soporte para BF16.
- En consumer GPU: cabe en una RTX 4090 (24 GB) para inferencia básica, pero el pipeline completo de navegación (procesamiento de imágenes, memoria, proyección) puede requerir optimizaciones adicionales.
- Opciones de despliegue: el modelo se carga con la implementación personalizada de Qwen2.5-VL del repositorio del proyecto (clases `Qwen2_5_VLForConditionalGeneration` y `Qwen2_5_VLProcessor`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la documentación disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de navegación en la información proporcionada. El modelo se enmarca en la categoría de políticas de VLN basadas en VLM, donde existen alternativas como MiMo-Embodied (de Xiaomi, que integra conducción autónoma y tareas encarnadas) o el Embodied Navigation Foundation Model (arXiv 2509.12129), pero no se han encontrado tablas comparativas con estos sistemas en la documentación del checkpoint. Los resultados de R2R-CE y RxR-CE pueden contrastarse con los publicados en la literatura de VLN, aunque no se incluyen aquí por falta de datos.

## Limitaciones y advertencias

- El modelo observa únicamente RGB; el sistema completo depende de profundidad para la proyección geométrica post-predicción y de odometría para la codificación de memoria. Sin estos módulos, el checkpoint no es funcional.
- Los resultados reportados se obtienen con el stack completo de evaluación (prompt multi-vista, memoria, proyección, controlador). Cargar el modelo como un pipeline genérico de Transformers no reproduce el rendimiento.
- La política puede detenerse prematuramente o alucinar éxito cuando el objetivo abandona todas las vistas de cámara.
- No se ha establecido rendimiento fuera de los dominios de navegación reportados, ni con otras configuraciones de sensores o distribuciones de instrucciones.
- El checkpoint no incluye los assets de Habitat-Matterport3D (con licencia), el corpus MultiNav-CoT completo ni otros datos propietarios necesarios para reproducir el entrenamiento.
- La licencia del modelo no está especificada en la información disponible; se recomienda contactar con los autores antes de cualquier uso comercial.
- El idioma soportado es únicamente inglés; no se documenta capacidad multilingüe.
- No se han publicado cuantizaciones de menor precisión (INT8, INT4), por lo que el despliegue en hardware limitado requiere conversión manual no validada.

## Enlaces

- Hugging Face: https://huggingface.co/UnderTides/Embodied-Navigator-7B-GRPO
- Página del proyecto: https://zju-omniai.github.io/Embodied-Navigator/
- Repositorio de código: https://github.com/ZJU-OmniAI/Embodied-Navigator
- Paper (sin número de arXiv publicado en la model card): https://arxiv.org/
