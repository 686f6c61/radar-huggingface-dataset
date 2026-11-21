# wolfoftizirane/Coilstellaration-resmlp-lm-repair-fixed

## Resumen

Coilstellaration-resmlp-lm-repair-fixed es un modelo ONNX publicado por el usuario wolfoftizirane para la pista `fixed_shape` del reto CoilStellaration, un problema de diseño de bobinas para reactores de fusión por confinamiento magnético (stellarators). No es un modelo de lenguaje: a pesar del sufijo `lm` en el identificador, la arquitectura descrita es un MLP residual que propone geometrías de bobina y corrientes, seguido de un corrector de Levenberg-Marquardt y un paso final de reparación, todo empaquetado en un único grafo ONNX.

El modelo resuelve un problema de optimización geométrica con restricciones: recibe la frontera del plasma en coordenadas de Fourier (`boundary_r_cos`, `boundary_z_sin`), cuatro métricas de requisitos (`requirement_metrics`), el número de periodos de campo y el número de bobinas por semiperiodo, y devuelve las coordenadas normalizadas de las bobinas (`coil_x_n`, `coil_y_n`, `coil_z_n`) junto con las corrientes (`currents`). La salida tiene forma fija `[5, 15]` para las coordenadas y `[5]` para las corrientes.

Es relevante por su enfoque híbrido: combina una propuesta aprendida (MLP residual) con un corrector numérico determinista y un mecanismo de reparación que garantiza el cumplimiento de restricciones, una estrategia poco habitual en modelos puramente neuronales para problemas de ingeniería con requisitos duros. El repositorio es de tamaño 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP residual + corrector Levenberg-Marquardt + paso de reparación, en un único grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX float32 e int64 en las entradas) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entradas | `boundary_r_cos` float32 `[n_pol, n_tor]`, `boundary_z_sin` float32 `[n_pol, n_tor]`, `requirement_metrics` float32 `[4]`, `n_field_periods` int64 escalar, `n_coils_per_half_period` int64 escalar |
| Salidas | `coil_x_n` float32 `[5, 15]`, `coil_y_n` float32 `[5, 15]`, `coil_z_n` float32 `[5, 15]`, `currents` float32 `[5]` |
| Hardware de ejecución | CPU únicamente, ONNX Runtime con `CPUExecutionProvider` |
| Dataset | `proxima-fusion/coilstellaration` (solo split de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de tres etapas dentro de un mismo grafo ONNX. En primer lugar, un MLP residual propone las posiciones de las bobinas y sus corrientes a partir de la frontera del plasma y las métricas de requisitos. En segundo lugar, un corrector de Levenberg-Marquardt, integrado en el propio grafo, ajusta esas propuestas para satisfacer los cuatro requisitos del reto. Por último, si algún requisito sigue fuera de límites, un paso de reparación aplica el desplazamiento de bobina más pequeño posible que devuelve los requisitos violados dentro de sus límites sin sacar a los demás de los suyos.

El entrenamiento y el ajuste se realizaron exclusivamente sobre el split de entrenamiento del dataset `proxima-fusion/coilstellaration`; el split de evaluación no se usó para entrenamiento, ajuste ni selección de modelo. Esta es una segunda versión del modelo `Coilstellaration-resmlp-lm-fixed`, y la decisión de mejorar el estrato de requisitos más difícil se basó en los resultados agregados del leaderboard público de la primera versión, sin usar instancias del split de evaluación ni puntuaciones por instancia. No se especifican en la información disponible el número de tokens de entrenamiento (concepto no aplicable aquí), la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Predicción de geometría de bobinas: genera coordenadas normalizadas `coil_x_n`, `coil_y_n`, `coil_z_n` con forma `[5, 15]` a partir de la frontera del plasma en coordenadas de Fourier.
- Predicción de corrientes: devuelve un vector `currents` de forma `[5]` asociado a las bobinas propuestas.
- Satisfacción de restricciones duras: el corrector de Levenberg-Marquardt y el paso de reparación ajustan la solución para cumplir los cuatro requisitos del reto.
- Generalización a configuraciones variables: acepta `n_field_periods` y `n_coils_per_half_period` como entradas escalares, lo que permite adaptar la topología del problema.
- Ejecución en CPU: diseñado y probado con ONNX Runtime sobre `CPUExecutionProvider`, sin dependencia de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step en lenguaje natural, capacidades multilingües ni visión o audio: no es un modelo de lenguaje.

## Casos de uso

- Diseño automatizado de bobinas en stellarators: dado un contorno de plasma y unos requisitos de campo, el modelo propone una configuración inicial de bobinas y corrientes que puede servir como punto de partida para optimizadores de mayor fidelidad.
- Exploración rápida del espacio de diseño: al ejecutarse en CPU con ONNX Runtime, permite evaluar muchas configuraciones de `n_field_periods` y `n_coils_per_half_period` en paralelo sin infraestructura GPU.
- Filtrado previo en pipelines de optimización: el corrector y el paso de reparación integrados entregan soluciones que ya cumplen los requisitos, reduciendo el número de iteraciones de un optimizador externo.
- Integración en herramientas de simulación de fusión: al ser un grafo ONNX autocontenido, se puede incrustar en flujos de trabajo de Python o C++ que ya usen ONNX Runtime para evaluar geometrías de bobina.
- Reproducción de resultados del leaderboard: sirve para replicar y auditar las puntuaciones de la pista `fixed_shape` del reto CoilStellaration, dado que el autor documenta el uso exclusivo del split de entrenamiento.
- Docencia e investigación en optimización con restricciones: el diseño híbrido (propuesta neuronal + corrector numérico + reparación) es un ejemplo didáctico de cómo combinar aprendizaje y métodos deterministas para garantizar requisitos duros.
- Despliegue en entornos con recursos limitados: al no requerir GPU y haber sido probado en un Apple M4, encaja en estaciones de trabajo o portátiles para prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente que la selección de la segunda versión se guió por los resultados agregados del leaderboard público de la primera versión, sin proporcionar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU con ONNX Runtime (`CPUExecutionProvider`).
- GPU recomendadas: ninguna; no se requiere GPU.
- Compatibilidad con GPU de consumo: no aplica, aunque al ser un grafo ONNX podría intentarse su ejecución con otros execution providers, algo no documentado por el autor.
- Opciones de despliegue: ONNX Runtime en CPU. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El autor indica que el modelo se desarrolló y probó en una CPU Apple M4, sin cifras de rendimiento.
- Tamaño del repositorio: 0.0 GB según Hugging Face, lo que sugiere un grafo ONNX de tamaño reducido, aunque el dato exacto no está disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coilstellaration-resmlp-lm-repair-fixed | MLP residual + corrector LM + reparación (ONNX) | Frontera de plasma, métricas, parámetros de topología | Coordenadas de bobina `[5,15]` y corrientes `[5]` | MIT | Hugging Face |
| Coilstellaration-resmlp-lm-fixed | Versión previa del mismo autor (MLP residual + corrector) | No disponible en detalle | No disponible en detalle | MIT (presumible, misma familia) | Hugging Face |
| Otros modelos de la pista `fixed_shape` de CoilStellaration | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas comparables de otros autores para esta tarea concreta.

## Limitaciones y advertencias

- No es un modelo de lenguaje: el sufijo `lm` del identificador puede inducir a error; no genera texto ni admite prompts en lenguaje natural.
- Salidas con forma fija: las coordenadas de bobina tienen forma `[5, 15]` y las corrientes `[5]`, lo que limita la aplicabilidad a configuraciones con esa topología exacta.
- Dependencia del corrector y la reparación: la calidad de la solución depende del corrector de Levenberg-Marquardt y del paso de reparación; no se documentan garantías formales de convergencia ni tasas de éxito.
- Sin datos de benchmarks públicos: no hay métricas reproducibles en la información disponible, lo que dificulta evaluar su rendimiento frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Entrenamiento limitado al split de entrenamiento: aunque esto es una buena práctica, no se documenta el tamaño ni la diversidad de ese split.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del dataset `proxima-fusion/coilstellaration` por separado.
- Riesgo de soluciones no físicas: al ser un modelo aprendido con corrección numérica, las geometrías propuestas deben validarse con simuladores de física de plasma antes de cualquier uso en ingeniería real.
- Idiomas y sesgos: no aplica en el sentido habitual, pero no se documentan sesgos en la distribución de configuraciones de plasma del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wolfoftizirane/Coilstellaration-resmlp-lm-repair-fixed
- Repositorio CoilStellaration: https://github.com/proximafusion/coilstellaration
- Dataset: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Modelo previo (referenciado en la model card): `Coilstellaration-resmlp-lm-fixed` (no se proporciona URL directa en la información disponible)
