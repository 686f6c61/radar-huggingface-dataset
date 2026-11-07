# Yuval535/DiTree-RHC

## Resumen

DiTree-RHC es un conjunto de checkpoints de políticas de planificación de movimiento basadas en flow matching, desarrollado por Yuval535 (Yuval Dara) como extensión del método DiTree presentado en CoRL 2025 por Hassidof, Jurgenson y Solovey. El modelo aplica DiTree a un cuadricóptero que navega mazas 3D representadas como rejillas de vóxeles, y se emplea tanto como planificador global como planificador local con horizonte deslizante (receding-horizon control). No es un modelo de lenguaje: es una política de robótica que genera trayectorias cinodinámicamente factibles para un dron.

La relevancia del trabajo radica en que DiTree combina el modelado de distribuciones complejas de trayectorias expertas mediante difusión (condicionadas a observaciones locales) con la completitud de los planificadores basados en muestreo (SBP), produciendo soluciones con garantías de seguridad en pocas iteraciones de propagación de acciones. DiTree-RHC traslada ese marco a un dominio 3D con dinámica de cuadricóptero, un caso más exigente que los sistemas dinámicos de baja dimensión del trabajo original.

El repositorio de Hugging Face publica únicamente pesos de checkpoints de entrenamiento completos (red, pesos EMA, estado del optimizador y del scheduler), sin model card detallada, sin licencia declarada y sin resultados de benchmarks en la información disponible. El código asociado está en GitHub y el dataset de entrenamiento en un repositorio de datasets del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de flow matching / difusión sobre árbol de planificación (DiTree); detalles de la red no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionada a observaciones locales del entorno) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoints PyTorch completos: pesos, EMA, optimizador y scheduler) |

Otros datos relevantes: pipeline declarado `robotics`; tarea `motion-planning`; dominio de aplicación cuadricóptero en mazas 3D de vóxeles; dos checkpoints publicados (`dronemaze_05_10_13_10_epoch_120_step_5760000.pt`, usado para todos los resultados reportados, y `dronemaze_04_09_19_26_epoch_60_final.pt`, modelo anterior de 60 épocas).

## Arquitectura y entrenamiento

DiTree-RHC se construye sobre DiTree (Hassidof, Jurgenson y Solovey, CoRL 2025), un método que combina modelos de difusión probabilísticos (DP) con planificadores basados en muestreo (SBP). La política de difusión aprende la distribución de trayectorias expertas condicionada a observaciones locales, y el árbol de planificación propaga acciones para obtener soluciones seguras con garantías en pocas iteraciones. DiTree-RHC extiende este esquema a un cuadricóptero en mazas 3D de vóxeles y lo instancia en dos modos: planificador global y planificador local con horizonte deslizante.

Ambos checkpoints se entrenaron desde cero sobre el dataset publicado en `datasets/Yuval535/DiTree-RHC`. El checkpoint principal corresponde a 120 épocas (paso 5.760.000) y el secundario a 60 épocas. Cada archivo incluye pesos de red, pesos EMA, estado del optimizador y del scheduler, lo que permite reanudar el entrenamiento. No se dispone de información sobre el número de tokens o muestras del dataset, la composición exacta de las trayectorias expertas, ni sobre el uso de RLHF/DPO (no aplicable en este dominio). Tampoco se detalla la arquitectura interna de la red de flow matching (número de capas, dimensión de embeddings, mecanismo de atención).

## Capacidades

- Generación de trayectorias cinodinámicamente factibles para un cuadricóptero en entornos 3D representados como rejillas de vóxeles.
- Planificación global: produce una ruta completa desde el estado inicial hasta el objetivo en la maza.
- Planificación local con horizonte deslizante (receding-horizon): replanificación continua a partir de observaciones locales.
- Modelado de distribuciones multimodales de trayectorias expertas mediante flow matching, lo que permite capturar múltiples soluciones válidas.
- Garantías de seguridad derivadas del componente de planificación basada en muestreo de DiTree (soluciones provably-safe en pocas iteraciones de propagación).
- No soporta tool calling, function calling, agentes conversacionales ni capacidades multilingües: es una política de control robótico, no un modelo generativo de texto.
- No se documentan capacidades de visión, audio ni modos de razonamiento explícito.

## Casos de uso

- Navegación autónoma de drones en interiores con obstáculos densos: el modelo planifica rutas en mazas de vóxeles 3D, adecuado para almacenes, fábricas o inspección de infraestructuras donde la geometría se conoce como mapa de ocupación.
- Replanificación reactiva en vuelo: como planificador local con horizonte deslizante, permite corregir la trayectoria ante desviaciones o cambios en el entorno sin recalcular la ruta global completa.
- Planificación global previa al vuelo: genera una trayectoria de referencia completa que puede servir de guía a un controlador de bajo nivel (por ejemplo, MPC o PID) durante la misión.
- Investigación en planificación cinodinámica: base reproducible para comparar difusión frente a flow matching en dominios 3D con dinámica de cuadricóptero, reutilizando los checkpoints publicados y el dataset del autor.
- Evaluación de métodos de planificación basados en muestreo: los checkpoints permiten reproducir los resultados reportados y analizar el comportamiento del árbol de planificación con distintos horizontes.
- Entrenamiento continuado y ajuste fino: al incluir estado del optimizador y del scheduler, los checkpoints permiten reanudar el entrenamiento o adaptar la política a nuevas geometrías de maza con un coste computacional menor.
- Simulación y validación en entornos tipo gym: integración en pipelines de simulación de robótica aérea para generar trayectorias de referencia antes del despliegue en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el checkpoint de 120 épocas se usó para "todos los resultados reportados", pero no incluye tablas de métricas (tasa de éxito, longitud de trayectoria, tiempo de planificación, etc.) ni comparaciones numéricas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño de la red ni el número de parámetros).
- GPU recomendadas: no disponibles; al ser un checkpoint PyTorch de planificación, es probable que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: inferencia mediante PyTorch con el código del repositorio GitHub (`YuvalDara/DiTree-RHC`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiTree-RHC | Flow matching + árbol de planificación | Cuadricóptero en mazas 3D de vóxeles | No disponible | No disponible | Checkpoints en HF, código en GitHub |
| DiTree (original) | Difusión + árbol de planificación | Sistemas dinámicos de baja dimensión | No disponible | No disponible en la información proporcionada | Código en GitHub (MRSTechnion/DiTree) |
| Planificadores basados en muestreo clásicos (SBP) | Muestreo | Planificación cinodinámica general | No aplica | Variable según implementación | Amplia disponibilidad |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset propio de trayectorias expertas, el comportamiento queda limitado a la distribución de mazas y dinámica cubiertas en entrenamiento.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar trayectorias no válidas fuera de la distribución de entrenamiento; las garantías de seguridad dependen del componente de planificación basada en muestreo.
- Limitaciones de contexto o idioma: no aplica idioma; el modelo está especializado en mazas 3D de vóxeles y dinámica de cuadricóptero, sin evidencia de generalización a otros robots o entornos.
- Restricciones de licencia: la licencia no está declarada en el repositorio de Hugging Face; no se puede confirmar el uso comercial sin consultar al autor o al repositorio de código.
- Caveats para producción: los archivos son checkpoints de entrenamiento completos (incluyen optimizador y scheduler), no pesos de inferencia optimizados; requieren el código del repositorio para cargarse y ejecutarse. No hay model card detallada, ni métricas publicadas, ni garantías de mantenimiento.
- Fecha de creación del repositorio: 2026-11-07, según los metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Yuval535/DiTree-RHC
- Dataset de entrenamiento: https://huggingface.co/datasets/Yuval535/DiTree-RHC
- Código de DiTree-RHC: https://github.com/YuvalDara/DiTree-RHC
- Implementación original de DiTree (CoRL 2025): https://github.com/MRSTechnion/DiTree
- Paper DiTree (arXiv): https://arxiv.org/abs/2508.21001
