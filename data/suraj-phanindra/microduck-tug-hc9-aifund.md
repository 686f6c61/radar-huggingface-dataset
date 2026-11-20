# suraj-phanindra/microduck-tug-hc9-aifund

## Resumen

`microduck-tug-hc9-aifund` es una política de control para el robot bípedo de código abierto microduck de Pollen Robotics, publicada por el usuario suraj-phanindra. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo que genera una marcha (gait) perpetua a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control articular. Se distribuye como un grafo ONNX con el normalizador de observaciones integrado en el propio fichero, de modo que el robot puede consumir observaciones en crudo.

El modelo es un fine-tune de `rumezhak/microduck-tug-cup3-tuned-v1`, que a su vez parte de los pesos de autojuego de liga de `lphatnguyen/microduck-tug-of-war-v2` con el normalizador reestimado por rumezhak. El autor lo ha refinado mediante estrategias de evolución en el simulador Arena, con perturbaciones antitéticas de cada capa y de la media del normalizador, evaluadas contra un conjunto amplio de políticas rivales y seleccionadas por probabilidad simulada de victoria en combates contra todo el campo de la copa número 3.

Su relevancia es acotada pero concreta: forma parte del ecosistema de competiciones de "tug of war" (tira y afloja) entre políticas para el microduck, donde cada participante entrena y mezcla políticas para vencer en el simulador. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el peso es inferior a la precisión de redondeo de la plataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | red neuronal de política para control robótico (detalles internos no disponibles); se infiere por el método de entrenamiento una red feed-forward con normalizador de observaciones integrado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible; se distribuye en ONNX |
| Idiomas soportados | no aplica (modelo de control robótico, sin entrada de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se ejecuta a 50 Hz sobre el microduck, con un vector de observación de 61 dimensiones y 14 acciones de salida. El normalizador de observaciones está incorporado dentro de `policy.onnx`, por lo que la política acepta observaciones sin preprocesar. El `manifest.json` sigue el esquema 2 del manifiesto de políticas del daemon de microduck, lo que permite cargarla directamente en una ranura de política del robot.

El entrenamiento parte de `rumezhak/microduck-tug-cup3-tuned-v1`, cuyos pesos provienen del autojuego de liga de `lphatnguyen/microduck-tug-of-war-v2` con un normalizador de observaciones reestimado. Sobre esa base, el autor aplica estrategias de evolución en el simulador Arena con perturbaciones antitéticas de todas las capas y de la media del normalizador, evaluando contra las políticas de v2, rumezhak, juicenv, DenRakEiw, HlibPlakhtii, azukiq, GinDuck y greecree, además de instantáneas de autojuego, y seleccionando por probabilidad simulada de victoria contra todo el campo de la copa número 3. La tabla del tablero combina, por semilla, la mejor de sus escaladas continuadas sobre la tabla de `suraj-phanindra/microduck-tug-hc7-aifund` (construida sobre las tablas h7p1b, cup2l1, cup2p1 y cup2p2 de jrubiosainz, con semillas de `nootxlm/microduck-tug-entry-1`) y su escalada sobre la tabla de `nootxlm/microduck-tug-entry-3`, concretamente `jrubiosainz/microduck-tug-cup3-p10g-3a94031b` con semillas 2 y 3, continuando después la escalada. El código de entrenamiento referenciado es el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`.

## Capacidades

- Generación de una marcha perpetua para el robot bípedo microduck: la política se ejecuta de forma continua hasta que se le indique lo contrario.
- Control a 50 Hz con 14 acciones a partir de 61 observaciones por paso.
- Normalización de observaciones integrada en el grafo ONNX, sin necesidad de preprocesado externo.
- Carga directa en una ranura de política mediante `robotctl policy load`.
- Comportamiento orientado a competición de tira y afloja en el simulador Arena, seleccionado por probabilidad de victoria contra el campo de la copa número 3.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: es exclusivamente una política motora.

## Casos de uso

- Despliegue de una marcha en el microduck físico: cargar la política en una ranura con `sudo robotctl policy load <slot> suraj-phanindra/microduck-tug-hc9-aifund` y dejar que el robot camine de forma continua, aprovechando que el normalizador va incluido en el ONNX.
- Participación en competiciones de tira y afloja en el simulador Arena: la política está seleccionada por probabilidad de victoria contra el campo de la copa número 3, por lo que es adecuada como contrincante o como base para nuevas escaladas evolutivas.
- Punto de partida para fine-tuning evolutivo: al ser un remix de `rumezhak/microduck-tug-cup3-tuned-v1` con una tabla de entrenamiento documentada, sirve como semilla para nuevas rondas de perturbaciones antitéticas en el simulador.
- Evaluación comparativa de políticas: útil para medir el rendimiento relativo frente a las políticas de v2, rumezhak, juicenv, DenRakEiw, HlibPlakhtii, azukiq, GinDuck y greecree en combates simulados.
- Investigación en aprendizaje por refuerzo con estrategias de evolución: el historial de escaladas sobre tablas concretas (h7p1b, cup2l1, cup2p1, cup2p2, cup3-p10g-3a94031b) permite reproducir y analizar la cadena de mejoras.
- Integración en pipelines de robótica con ONNX Runtime: al distribuirse como `policy.onnx` con manifiesto de esquema 2, puede ejecutarse en el daemon de microduck o en un runtime ONNX compatible para pruebas fuera del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de recompensa, tasas de victoria ni latencias; solo describe el procedimiento de selección por probabilidad simulada de victoria contra el campo de la copa número 3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0.0 GB y no se detalla el número de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; por el tipo de política (control a 50 Hz con observación de 61 dimensiones) es plausible que quepa en hardware modesto, pero no hay datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck (`robotctl policy load`); otros runtimes ONNX no se mencionan en la model card.
- Latencia y throughput estimados: no disponibles; la única referencia temporal es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-tug-hc9-aifund` | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| `rumezhak/microduck-tug-cup3-tuned-v1` | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| `lphatnguyen/microduck-tug-of-war-v2` | Política RL (origen de pesos) | no disponible | no disponible | no disponible | Hugging Face |
| `suraj-phanindra/microduck-tug-hc7-aifund` | Política RL (iteración previa del mismo autor) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de control robótico: no procesa texto, imágenes ni audio, y no debe evaluarse como un modelo de lenguaje.
- El repositorio reporta 0.0 GB de tamaño y 0 descargas; conviene verificar que `policy.onnx` y `manifest.json` estén efectivamente presentes antes de intentar cargarlo.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- El rendimiento está validado en el simulador Arena contra un campo concreto de políticas; el comportamiento en el robot físico puede diferir.
- Dependencia de la cadena de modelos base (`rumezhak/microduck-tug-cup3-tuned-v1` y `lphatnguyen/microduck-tug-of-war-v2`) cuyas condiciones de licencia tampoco se detallan.
- Al ser una política perpetua, se ejecuta hasta que se le indique lo contrario; requiere supervisión y un mecanismo de parada en el despliegue físico.
- No hay información sobre sesgos, alucinación ni cobertura idiomática porque no aplican a este tipo de modelo.
- La fecha de creación indicada (2026-11-20) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad de los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-tug-hc9-aifund
- Modelo base: https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v1
- Origen de pesos (autojuego de liga): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
- Iteración previa del mismo autor: https://huggingface.co/suraj-phanindra/microduck-tug-hc7-aifund
- Tabla de referencia con semillas: https://huggingface.co/nootxlm/microduck-tug-entry-1
- Tabla de referencia con semillas: https://huggingface.co/nootxlm/microduck-tug-entry-3
- Tabla de referencia: https://huggingface.co/jrubiosainz/microduck-tug-cup3-p10g-3a94031b
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`); no se proporciona URL directa en la información disponible.
