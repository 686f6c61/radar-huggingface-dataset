# tsilva/SuperMarioBros-Nes-v0_Distilled

## Resumen

SuperMarioBros-Nes-v0_Distilled es una política de aprendizaje por refuerzo destilada para el entorno Super Mario Bros. de NES, publicada por el usuario tsilva bajo la librería GradLab. No se trata de un modelo de lenguaje, sino de un agente que juega a Super Mario Bros. y que ha sido entrenado offline a partir de 32 políticas expertas, una por cada fase del juego. El resultado es un único estudiante condicionado por la fase de inicio que reproduce el comportamiento agregado de los 32 profesores.

El modelo resuelve el problema de consolidar múltiples expertos especializados en una sola política generalista que conserva el rendimiento por fase. Según la model card, el checkpoint final logra 3.767 despejes sobre 4.096 episodios en fases retenidas (92,0%), con al menos un despeje en las 32 fases, tras 72.000 actualizaciones del optimizador. La evaluación se realizó con 128 episodios nuevos por fase después de seleccionar checkpoint y temperatura de muestreo.

Su relevancia es metodológica: demuestra un pipeline de destilación de políticas offline con batches balanceados de observaciones y probabilidades de acción de profesores congelados, y publica evidencia inmutable del run y del checkpoint. No obstante, el repositorio tiene 0 descargas y 0 likes, el tamaño es de 0,0 GB y la licencia no está disponible, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política categórica condicionada por el estado de inicio (no se especifica la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` con pesos data-only (`student.json`), más `model.json`, `recipe.yaml` y `replay.mp4` |

## Arquitectura y entrenamiento

La política es un estudiante categórico que muestrea acciones con temperatura 0,5 y se condiciona a la fase de inicio declarada del episodio. El entrenamiento es offline: se usan batches balanceados de observaciones y probabilidades de acción generadas por profesores congelados, uno por cada una de las 32 fases del juego. No hay interacción online con el entorno durante la destilación, sino ajuste supervisado sobre la distribución de acciones de los expertos.

El run documentado (`gradlab-766c7d6c032250e7ea6d484c9d5ba8b5`) produjo el checkpoint `checkpoint-72000-6e156dc3d24b2c16` tras 72.000 actualizaciones del optimizador. La receta resuelta y los profesores fijados quedan registrados en `recipe.yaml`, y `model.json` vincula el checkpoint con su contrato de ejecución. La model card no detalla el número de tokens, la composición exacta del dataset ni el tamaño de la red; esos datos no están disponibles.

## Capacidades

- Jugar a Super Mario Bros. de NES desde cualquiera de las 32 fases declaradas como punto de inicio.
- Muestreo estocástico de acciones con temperatura configurable (0,5 en la evaluación publicada).
- Generalización dentro de fase: 92,0% de despejes en episodios retenidos de fases individuales.
- Cobertura completa de fases: al menos un despeje registrado en las 32 fases.
- Ejecución mediante el comando `gradlab play` con una ROM propia de Super Mario Bros. NES.
- Verificación programática de los resultados a partir del `student.json` incluido en `model.zip`.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: es un agente de RL específico de un entorno.

## Casos de uso

- Investigación en destilación de políticas: sirve como referencia reproducible para estudiar cómo consolidar varios expertos en un único estudiante condicionado por el estado inicial, con evidencia de run y checkpoint publicada.
- Reproducción de experimentos de RL offline: el `recipe.yaml` y los profesores fijados permiten reconstruir el pipeline de destilación y comparar variantes de batches balanceados.
- Benchmark de entornos NES en GradLab: el agente puede usarse como línea base de rendimiento por fase (92,0% de despejes en retenidos) para evaluar nuevos algoritmos.
- Docencia y demostraciones de RL: el `replay.mp4` y el dashboard por fase facilitan explicar el comportamiento de una política destilada sin necesidad de entrenar desde cero.
- Pruebas de infraestructura de evaluación: el script de verificación sobre `student.json` permite validar pipelines de integración de checkpoints y reportes de resultados.
- Estudio de limitaciones de generalización: al no estar disponible el juego continuo entre fases, el modelo es útil para analizar la brecha entre rendimiento por fase y rendimiento en secuencia completa.

## Benchmarks y rendimiento

| Metrica | Checkpoint final |
|---|---:|
| Despejes en fases retenidas (inicio individual) | 3.767 / 4.096 (92,0%) |
| Fases con al menos un despeje | 32 / 32 |
| Actualizaciones del optimizador | 72.000 |
| Episodios por fase en el panel retenido | 128 |

No se han publicado resultados comparativos con otras políticas en la información disponible. El juego continuo entre fases y la aceptación formal de GradLab no están disponibles para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la arquitectura de red no se detalla.
- GPU recomendadas: no disponible. Al ser una política de RL para un emulador de NES, es probable que la inferencia sea ligera, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican requisitos.
- Opciones de despliegue: GradLab con el cargador de políticas categóricas destiladas y una ROM propia de Super Mario Bros. NES; comando `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Distilled' --rom-path /path/to/SuperMarioBros.nes`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de RL para Super Mario Bros. NES ni datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- No hay soporte documentado para juego continuo entre fases; el rendimiento se mide solo desde inicios individuales de fase.
- La aceptación formal de GradLab no está disponible para este checkpoint.
- Requiere una ROM propia de Super Mario Bros. NES; el modelo no incluye el juego ni los datos del entorno.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se detallan sesgos, riesgo de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; esos conceptos no aplican.
- El tamaño del repositorio es de 0,0 GB y no se especifican parámetros ni arquitectura de red, lo que dificulta estimar requisitos de cómputo.
- La evaluación se basa en 128 episodios por fase tras selección de checkpoint y temperatura; puede no reflejar el rendimiento en configuraciones distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Distilled
- Dashboard por fase: https://tsilva-supermariobros-nes-v0-dashboard.static.hf.space/
- Evidencia inmutable del run y checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-766c7d6c032250e7ea6d484c9d5ba8b5/index.json
- Código fuente de GradLab (commit registrado): https://github.com/tsilva/gradlab/tree/76e296dcfbf1058bda9698c0e5262a1425347e55
- Receta de destilación offline: https://github.com/tsilva/gradlab/blob/76e296dcfbf1058bda9698c0e5262a1425347e55/experiments/goals/SuperMarioBros-Nes-v0/DistillAllLevels/recipes/offline-distill.yaml
