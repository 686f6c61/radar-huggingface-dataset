# wentywenty/robopoly-action-rpo-amp

## Resumen

RPO AMP es una política de control motriz (locomoción y marcha) para el robot humanoide `rpo` de 23 grados de libertad (DOF), publicada por el usuario wentywenty en Hugging Face bajo el pipeline `robotics`. No se trata de un modelo de lenguaje: el artefacto es un grafo ONNX (`models/policy_amp.onnx`) que mapea observaciones del robot (`obs`) a acciones de control (`actions`) a una frecuencia de 250 Hz, acompañado de un fichero de configuración de inferencia (`configs/amp.yaml`). El nombre hace referencia a AMP (Adversarial Motion Priors), una técnica habitual en aprendizaje por refuerzo para imitar estilos de movimiento a partir de datos de captura de movimiento.

El modelo se distribuye a través del ecosistema Robopoly, que ofrece un CLI (`robopoly action install/verify/rollback`) para instalar, verificar y revertir políticas en el robot. La model card lo etiqueta con nivel de seguridad `S2`, lo que implica que su ejecución requiere confirmación humana explícita, espacio despejado, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa. La instalación no habilita el movimiento por sí misma.

La relevancia del artefacto es limitada y muy específica: es un piloto público de Robopoly, con cero descargas y cero likes en el momento de la consulta, repo de 0.0 GB (los pesos no parecen estar efectivamente alojados en el repositorio) y licencia de pesos pendiente de confirmar. No hay información sobre idiomas, arquitectura de red, datos de entrenamiento ni benchmarks. Su interés es, por tanto, documental y de integración en el stack Robopoly, no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz exportada a ONNX; se infiere aprendizaje por refuerzo con AMP por el nombre, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se documentan niveles de cuantización) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other`; código GPL-3.0-only, pesos con licencia pendiente de confirmar |
| Formato de pesos | ONNX (`models/policy_amp.onnx`) + configuración YAML (`configs/amp.yaml`) |
| Robot compatible | `rpo`, 23 DOF |
| Nivel de seguridad | S2 (requiere confirmación humana) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| SHA256 de pesos | `bcded9c9b87aea055326c72b51060770f37af23aaa6b4fdeaff34db5ffa9bd2d` |
| Upstream | `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_amp.onnx`, commit `ee9174c` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red (número de capas, tipo de encoder de observaciones, tamaño de la política). El nombre del artefacto, `rpo-action-rpo-amp`, y la etiqueta `amp` sugieren el uso de Adversarial Motion Priors, una familia de métodos de aprendizaje por refuerzo en la que un discriminador distingue transiciones de movimiento generadas por la política de las procedentes de datos de referencia (captura de movimiento), y esa señal se usa como recompensa de estilo. Esta interpretación es una inferencia razonable a partir de la nomenclatura, no un dato confirmado en la información disponible.

Tampoco se documentan el volumen ni la composición del dataset de entrenamiento, la existencia de fases de ajuste fino, ni detalles sobre observaciones (¿posiciones articulares, velocidades, IMU, comandos de velocidad?) o sobre el espacio de acciones (posiciones objetivo versus pares). El único dato operativo es que la política consume `obs` y produce `actions` a 250 Hz, lo que sitúa la inferencia en el rango típico de los controladores de locomoción de humanoides, donde el bucle de control debe ejecutarse de forma determinista y con latencia acotada.

## Capacidades

- Locomoción y marcha del humanoide `rpo` de 23 DOF: la política genera comandos de acción para el control del robot en tareas de desplazamiento.
- Inferencia en tiempo real a 250 Hz mediante un grafo ONNX, adecuada para bucles de control de baja latencia.
- Integración con el CLI de Robopoly para instalación, verificación y rollback de la política en el robot.
- Compatibilidad declarada exclusivamente con el modelo `rpo` y 23 DOF; no se garantiza con otras plataformas.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de lenguaje.
- Clasificación de seguridad S2: el artefacto incorpora una etiqueta de riesgo que condiciona su ejecución a confirmación humana.

## Casos de uso

- Validación de políticas de marcha en el humanoide `rpo`: instalar la política con `robopoly action install`, verificar su integridad con `robopoly action verify` y ejecutarla en banco de pruebas con el robot suspendido o con soporte fiable antes de cualquier prueba en suelo.
- Pruebas de integración del stack Robopoly: usar este artefacto como referencia para comprobar el flujo completo de instalación, verificación y rollback de acciones en un robot real o simulado.
- Investigación en locomoción con AMP: servir como ejemplo público de exportación de una política entrenada con Adversarial Motion Priors a ONNX para su despliegue en un humanoide de 23 DOF, útil para comparar pipelines de exportación e inferencia.
- Demostraciones controladas de marcha: ejecutar la política en un entorno despejado, con parada de emergencia accesible y limitación de corriente, para evaluar el comportamiento cualitativo del movimiento antes de adoptar la política como base.
- Pruebas de latencia y determinismo del runtime ONNX: medir el coste de inferencia a 250 Hz en el hardware de a bordo del `rpo` y validar que el bucle de control cumple los plazos.
- Auditoría de seguridad de políticas robóticas: analizar cómo el ecosistema Robopoly codifica niveles de seguridad (S2) y requisitos de confirmación humana, usando este artefacto como caso de estudio documentado.
- Reversión ante fallos en producción: emplear `robopoly action rollback` para restaurar la política anterior si una actualización introduce comportamientos no deseados en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de marcha, consumo energético ni comparaciones con otras políticas. Tampoco se documentan latencias medidas del grafo ONNX en hardware concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de control exportada a ONNX, es probable que el requisito sea muy inferior al de un modelo de lenguaje, pero no se publica el tamaño del grafo ni el número de parámetros.
- GPU recomendadas: no disponible. Para control a 250 Hz en un humanoide, lo habitual es ejecutar la inferencia en CPU o en una GPU integrada de a bordo; no se especifica hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar ni descartar sin conocer el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato; el ecosistema Robopoly proporciona el CLI de instalación y ejecución. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la frecuencia de operación declarada es de 250 Hz (periodo de 4 ms por ciclo), pero no se publican latencias medidas ni margen de cómputo disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables publicadas para el mismo robot `rpo` ni alternativas de otros autores con parámetros, contexto y licencia verificables. La comparación con modelos de lenguaje no es pertinente por la naturaleza del artefacto.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmar: la model card indica explícitamente que la licencia de los pesos está por determinar y que el artefacto es un piloto público; no debe asumirse uso comercial permitido.
- El código se distribuye bajo GPL-3.0-only, lo que impone obligaciones de copyleft si se integra en un producto.
- Nivel de seguridad S2: la ejecución requiere confirmación humana, espacio despejado, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa. La instalación no habilita el movimiento.
- Compatibilidad restringida al robot `rpo` con 23 DOF; no se garantiza funcionamiento en otras plataformas ni configuraciones.
- Las previsualizaciones, si existen, pueden corresponder a simulación y no representan el comportamiento en el robot real.
- El repositorio figura con un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados; conviene verificar la integridad con `robopoly action verify` y el SHA256 publicado antes de cualquier uso.
- Sin datos de entrenamiento, benchmarks ni evaluación de sesgos o robustez; no hay evidencia publicada sobre estabilidad ante perturbaciones, terrenos irregulares o fallos de sensores.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de comportamientos no previstos en el control motriz, con consecuencias físicas; de ahí la clasificación S2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rpo-amp
- Upstream declarado: `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_amp.onnx`, commit `ee9174c` (no se proporciona URL directa en la información disponible)
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
