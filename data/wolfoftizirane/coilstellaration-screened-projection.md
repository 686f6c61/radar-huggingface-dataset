# wolfoftizirane/Coilstellaration-screened-projection

## Resumen

Coilstellaration-screened-projection es un modelo ONNX publicado por el usuario wolfoftizirane para la resolución de problemas de diseño de bobinas en el contexto del benchmark CoilStellaration, orientado al diseño de configuraciones de stellarator. El modelo aborda simultáneamente las pistas `fixed_shape` y `variable_shape` del benchmark, proponiendo geometrías de bobina y corrientes que cumplen una serie de requisitos físicos definidos por el propio benchmark.

A diferencia de un modelo generativo de lenguaje, se trata de un artefacto de inferencia numérica: combina varias redes MLP residuales que proponen bobinas y corrientes, un corrector de Levenberg–Marquardt embebido en el mismo grafo ONNX y una fase de proyección de compatibilidad resuelta mediante un pequeño programa cuadrático con ADMM. Todo el cómputo está pensado para ejecutarse en CPU con ONNX Runtime, sin GPU.

El repositorio tiene un tamaño de 0.0 GB, no registra descargas ni likes, y la model card no proporciona información sobre parámetros, contexto, idiomas ni benchmarks. Es relevante como ejemplo de empaquetado de un pipeline numérico completo (propuesta, corrección y proyección de restricciones) en un único grafo ONNX para un dominio científico muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLPs residuales + corrector Levenberg–Marquardt + proyección de compatibilidad (QP vía ADMM), todo en un grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo numérico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se compone de varias redes MLP residuales: una red única para todas las topologías de periodo de campo y número de bobinas, y una red dedicada a la topología de la pista fija. Estas redes proponen las bobinas y las corrientes. A continuación, un corrector de Levenberg–Marquardt integrado en el mismo grafo ONNX refina la propuesta durante unos pocos pasos, con cribado (screening) de los pasos intermedios sobre los nodos de campo con peor comportamiento.

Tras el corrector, se ejecutan rondas de proyección de compatibilidad que aplican el menor desplazamiento de bobina posible para llevar cada requisito violado dentro de su límite, manteniendo los casi activos dentro del suyo; este paso se resuelve como un pequeño programa cuadrático mediante ADMM dentro del grafo. Una solución solo se acepta como factible tras una comprobación sobre la rejilla de campo completa del benchmark. El entrenamiento y ajuste se realizaron únicamente con el split de entrenamiento, sin usar el de evaluación para entrenamiento, ajuste ni selección de modelo. No se dispone de datos sobre número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Propuesta de geometría de bobinas (`coil_x_n`, `coil_y_n`, `coil_z_n`) con forma `[n_coils, 15]` y corrientes asociadas (`currents`) con forma `[n_coils]`.
- Soporte de las pistas `fixed_shape` y `variable_shape` del benchmark CoilStellaration.
- Generalización a distintas topologías mediante entradas escalares `n_field_periods` y `n_coils_per_half_period`.
- Corrección numérica interna vía Levenberg–Marquardt con cribado sobre nodos de campo críticos.
- Proyección de restricciones para satisfacer los requisitos del benchmark con desplazamiento mínimo de bobina.
- Verificación de factibilidad sobre la rejilla de campo completa del benchmark.
- Ejecución en CPU con ONNX Runtime (`CPUExecutionProvider`), sin necesidad de GPU.

## Casos de uso

- Diseño exploratorio de bobinas en stellarators: el modelo genera propuestas iniciales de geometría y corrientes para topologías dadas, que el investigador puede usar como punto de partida antes de un refinamiento con código de física de plasmas de mayor fidelidad.
- Evaluación comparativa en el benchmark CoilStellaration: permite obtener soluciones factibles para las pistas `fixed_shape` y `variable_shape`, facilitando la comparación con otros métodos en las mismas condiciones.
- Barrido de topologías: gracias a las entradas `n_field_periods` y `n_coils_per_half_period`, se puede recorrer un espacio de configuraciones sin reentrenar el modelo.
- Integración en pipelines de CI para validación de restricciones: al estar empaquetado como ONNX y ejecutarse en CPU, se puede incorporar en pruebas automatizadas que verifiquen que las soluciones propuestas cumplen los requisitos del benchmark.
- Prototipado rápido en entornos sin GPU: al usar únicamente `CPUExecutionProvider`, es desplegable en estaciones de trabajo convencionales o contenedores sin aceleradores.
- Estudio de métodos de proyección de restricciones: el grafo incluye un QP resuelto con ADMM, útil como referencia o componente reutilizable en otros problemas de optimización con restricciones.
- Docencia e investigación en optimización numérica aplicada a fusión: sirve como ejemplo reproducible de combinación de MLP, Levenberg–Marquardt y proyección cuadrática en un solo artefacto ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo declara ejecución solo en CPU con `CPUExecutionProvider`, sin GPU.
- GPU recomendadas: no aplica (no se requiere GPU).
- Compatibilidad con GPU de consumo: no aplica, ya que el modelo no usa GPU.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`.
- Latencia y throughput estimados: no disponible.
- Tamaño del repositorio: 0.0 GB, lo que sugiere un artefacto ligero, aunque el dato exacto del modelo no está disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (solvers numéricos ONNX para el benchmark CoilStellaration) en la información disponible.

## Limitaciones y advertencias

- Los requisitos se cumplen en los puntos de muestreo del benchmark tal como este los define; entre muestras, los extremos pueden ser ligeramente peores.
- La verificación de factibilidad se realiza sobre la rejilla de campo del benchmark, no sobre una rejilla arbitraria, por lo que la validez fuera de ese muestreo no está garantizada.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esos conceptos no aplican directamente.
- El modelo se entrenó y ajustó solo con el split de entrenamiento; el split de evaluación no se usó para selección, lo que limita la información sobre generalización más allá de lo reportado por el autor.
- No se dispone de datos sobre parámetros, cuantizaciones ni rendimiento numérico, lo que dificulta estimar su coste computacional real más allá de la indicación de CPU only.
- La licencia MIT permite uso comercial, pero no se especifican condiciones adicionales ni atribuciones requeridas más allá de las estándar de MIT.
- El repositorio no registra descargas ni likes y fue creado y actualizado en noviembre de 2026, por lo que no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wolfoftizirane/Coilstellaration-screened-projection
- Repositorio CoilStellaration: https://github.com/proximafusion/coilstellaration
- Dataset proxima-fusion/coilstellaration: https://huggingface.co/datasets/proxima-fusion/coilstellaration
