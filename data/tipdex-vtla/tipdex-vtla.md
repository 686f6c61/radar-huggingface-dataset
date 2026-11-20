# TipDex-VTLA/TipDex-VTLA

## Resumen

TipDex-VTLA es un paquete de inferencia para un modelo de visión-lenguaje-acción (VLA) orientado a robótica de manipulación con retroalimentación táctil, publicado por el colectivo TipDex-VTLA. El modelo está diseñado específicamente para tareas de manipulación de huevos, combinando tres cámaras RGB, un vector de estado de 19 dimensiones y lecturas táctiles crudas de un sensor F1 (364 valores uint16) para predecir secuencias de acciones y mapas de calor táctiles. El repositorio incluye los pesos en formato nativo Orbax, junto con los módulos VASE y TACE, un codificador compartido con predictor táctil, tokenizer y parámetros de normalización.

La relevancia del modelo radica en su enfoque multimodal que integra percepción táctil de alta resolución junto con visión y estado proprioceptivo, un área menos explorada que los VLA puramente visuales. El paquete está empaquetado como una solución de inferencia reproducible con verificación SHA-256 por archivo, servicio HTTP con dashboard y configuración de paper, lo que facilita la reproducibilidad de resultados.

El modelo se distribuye bajo una licencia compuesta Apache 2.0 y Gemma, con un tamaño de repositorio de 12,5 GB. La información pública disponible es limitada: no se especifican el número de parámetros, la longitud de contexto ni los idiomas soportados, y no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con módulos VASE y TACE y codificador compartido con predictor táctil; detalles de la arquitectura base no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 y Gemma (licencia compuesta, `apache-2.0-and-gemma`) |
| Formato de pesos | Orbax nativo (9309), más tokenizer, parámetros de normalización y ejemplos de replay |

## Arquitectura y entrenamiento

La información disponible describe un modelo VLA con arquitectura compuesta por un codificador compartido y un predictor táctil, junto con dos módulos denominados VASE y TACE, que en el código fuente residen en módulos separados (`src/tipdex/VASE/` y `src/tipdex/TACE/`). El modelo recibe tres flujos RGB, un vector de estado de 19 dimensiones y las últimas 16 tramas de lecturas táctiles F1 en formato raw364. La salida consiste en una secuencia de acciones de 30×13, un mapa de calor táctil de H×14×26 y las salidas de VASE, TACE y q.

El procesamiento táctil convierte los 364 valores uint16 del sensor F1, ordenados según los registros del SDK, en una matriz de 14×26 dividiendo por 65535 y aplicando orden por filas: `heatmap[r,c] = raw364[26*r+c]/65535`. Esta representación no corresponde a las ocho regiones físicas del sensor; las posiciones del mapa de calor indican el índice de registro y los valores no representan presión o fuerza calibradas. TACE se encarga de corregir únicamente acciones reemplazables aún no comprometidas y vuelve a predecir tras aceptar una actualización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas de manipulación de huevos a partir de entrada multimodal (tres cámaras RGB, estado de 19 dimensiones y lecturas táctiles F1).
- Predicción de mapas de calor táctiles de resolución 14×26 a partir de las lecturas crudas del sensor.
- Generación de secuencias de acción de 30×13 en un horizonte de 30 pasos.
- Corrección de acciones mediante el módulo TACE, que solo modifica acciones reemplazables no comprometidas y vuelve a predecir tras la actualización.
- Servicio HTTP de inferencia con dashboard para visualizar VASE, TACE, q final y mapas de calor de predicción.
- Verificación de integridad del paquete mediante SHA-256 por archivo y comprobación de relaciones entre módulos mediante `manifest.json`.
- Modo offline con caché de revisión fija para reproducibilidad.
- No se dispone de información sobre soporte de tool calling, capacidades multilingües, razonamiento multi-paso, visión general o audio.

## Casos de uso

- Manipulación robótica de precisión con objetos frágiles: el modelo predice secuencias de acción de 30 pasos integrando visión y tacto, lo que permite ajustar la fuerza y la trayectoria en tareas de agarre de huevos donde la retroalimentación táctil es crítica.
- Reproducción de experimentos de investigación: el paquete incluye configuración `paper`, ejemplos de replay y verificación de pesos por SHA-256, lo que permite reproducir los resultados del artículo asociado con una revisión fija del modelo.
- Desarrollo de pipelines de control táctil: el módulo TACE permite corregir acciones antes de su ejecución, adecuado para entornos donde las acciones deben validarse antes de comprometerse con el robot.
- Evaluación de predictores táctiles: el modelo expone mapas de calor de 14×26 y métricas MAE sobre los 364 valores normalizados, útil para comparar arquitecturas de predicción táctil en investigación.
- Servicio de inferencia local para laboratorio: el comando `tipdex serve` levanta un servicio HTTP en el puerto 8116 con dashboard, adecuado para integración con estaciones de trabajo con GPU NVIDIA CUDA 12.
- Integración en bucles de control con confirmación del SDK: el replay utiliza eventos de confirmación del SDK explícitamente construidos y verifica que el instante de predicción y la acción ejecutada coincidan, lo que sirve como base para pruebas de integración en sistemas robóticos.
- Prototipado de políticas VLA multimodales: investigadores pueden usar el paquete como referencia para construir políticas que combinen RGB, estado y tacto en un único modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las pruebas realizadas (49 tests automáticos, replay en bucle cerrado con pesos reales y comprobaciones del servicio HTTP) validan la funcionalidad de inferencia, pero no constituyen evaluaciones de precisión táctil ni de tasa de éxito en tareas.

## Requisitos de hardware

- Entorno requerido: Linux, Python 3.11 y GPU NVIDIA con CUDA 12.
- VRAM estimada: no disponible; el repositorio ocupa 12,5 GB, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible; la documentación solo exige una GPU NVIDIA compatible con CUDA 12.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: servicio HTTP propio mediante `tipdex serve` (puerto 8116) y ejecución por línea de comandos con `tipdex replay`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA con retroalimentación táctil) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está especializado en manipulación de huevos; no se indica generalización a otras tareas de manipulación.
- La representación táctil no corresponde a las regiones físicas del sensor ni a valores calibrados de presión o fuerza; los mapas de calor reflejan índices de registro, no magnitudes físicas.
- Las pruebas de validación verifican funcionalidad de inferencia, no precisión táctil ni tasa de éxito de tareas.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura lingüística ni limitaciones de contexto.
- La licencia es compuesta (Apache 2.0 y Gemma); el uso comercial está sujeto a las condiciones de `LICENSE` y `LICENSE_GEMMA.txt`, que deben revisarse antes de producción.
- El paquete depende de una librería propia (`tipdex-vtla`) y de una versión fija de `huggingface-hub` (0.32.3); la integración en producción requiere fijar revisiones para garantizar reproducibilidad.
- No se especifican requisitos de VRAM ni latencia, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TipDex-VTLA/TipDex-VTLA
- Licencia Gemma: https://huggingface.co/TipDex-VTLA/TipDex-VTLA/blob/main/LICENSE_GEMMA.txt
- Repositorio oficial de código: https://github.com/tiplab/TipDex-VTLA
- Documentación del método y configuración: https://github.com/tiplab/TipDex-VTLA/blob/main/docs/METHOD.md#configuration
- Informes de validación: https://github.com/tiplab/TipDex-VTLA/tree/main/validation
