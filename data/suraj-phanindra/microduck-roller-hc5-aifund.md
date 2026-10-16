# suraj-phanindra/microduck-roller-hc5-aifund

## Resumen

microduck-roller-hc5-aifund es una politica de control para robots entrenada mediante aprendizaje por refuerzo, no un modelo de lenguaje. La publica el usuario suraj-phanindra en Hugging Face y deriva por ajuste fino (finetune) del modelo juicenv/microduck-roller-es21. Su proposito es dotar al robot bipedo Microduck de Pollen Robotics de una marcha perpetua sobre ruedas (rollers): el modelo emite comandos de accion de forma continua hasta que se le indique lo contrario, y se carga en una ranura de politica ("policy slot") del demonio de control del robot.

Tecnicamente, la ficha del autor indica que el ajuste se hizo mediante ascenso de colina elitista (elitist hill climb) optimizando la puntuacion de Arena. La politica recibe observaciones sin procesar de 61 dimensiones y produce 14 acciones a 50 Hz; el normalizador de observaciones viene integrado dentro del propio fichero ONNX, por lo que se le deben entregar observaciones crudas. El repositorio ocupa 0,0 GB, coherente con una red de politica de tamano reducido pensada para ejecutarse a bordo del robot.

Su relevancia es acotada pero concreta: se inscribe en el ecosistema de intercambio de politicas de Microduck (MicroduckHub), donde la comunidad publica y reentrena comportamientos de locomocion. No hay datos publicados de descargas, valoraciones, benchmarks ni licencia, y el repositorio no contiene informacion sobre la arquitectura concreta de la red ni sobre el numero de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada por aprendizaje por refuerzo (RL); topologia concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; politica reactiva por paso de tiempo) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (fichero policy.onnx con normalizador integrado) + manifest.json con esquema 2 del manifiesto de politicas de microduck |
| Dimension de observacion | 61 (observaciones crudas) |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | juicenv/microduck-roller-es21 (relacion: finetune) |
| Libreria | microduck |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura de la red. La model card unicamente declara que se trata de una politica (policy) de aprendizaje por refuerzo cargable en el robot, con 61 entradas de observacion y 14 salidas de accion a 50 Hz, y que el normalizador de observaciones esta embebido en el ONNX. No se especifica si la red es un perceptron multicapa, una red recurrente ni ninguna otra topologia, ni el numero de capas o parametros.

El entrenamiento se describe como un ajuste fino por "elitist hill climb" sobre la puntuacion de Arena (Arena score) a partir de juicenv/microduck-roller-es21. El repositorio de entrenamiento indicado es pollen-robotics/microduck_rl, rama main, commit 6ff40704a. No se aportan datos sobre el numero de pasos de entrenamiento, el simulador utilizado, la composicion de los datos ni el uso de tecnicas adicionales (RLHF, DPO u otras), que por otra parte no aplican a este tipo de modelo. La model card se describe a si misma como "un remix" del modelo base.

## Capacidades

- Generacion de acciones de control motriz: produce 14 valores de accion a 50 Hz para el robot Microduck.
- Locomocion perpetua sobre ruedas: mantiene una marcha continua hasta que se le ordena lo contrario.
- Consumo de observaciones crudas de 61 dimensiones, con normalizacion integrada en el propio ONNX.
- Carga en una ranura de politica del robot mediante el comando `robotctl policy load <slot> <modelo>`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No se documenta ningun modo especial adicional (thinking mode, audio, etc.).

## Casos de uso

- Despliegue de una marcha sobre ruedas en un Microduck real: cargando la politica en una ranura con `sudo robotctl policy load <slot> suraj-phanindra/microduck-roller-hc5-aifund`, el robot ejecuta la marcha de forma continua a 50 Hz.
- Evaluacion comparativa de politicas: al proceder de un ajuste por ascenso de colina elitista sobre la puntuacion de Arena a partir de juicenv/microduck-roller-es21, sirve como punto de comparacion directo frente al modelo base dentro del mismo banco de pruebas.
- Investigacion en sim2real: permite estudiar si una politica entrenada en simulacion y exportada a ONNX transfiere correctamente al hardware fisico, alimentando observaciones crudas de 61 dimensiones.
- Docencia y prototipado en robotica con RL: al ser un artefacto pequeno (repositorio de 0,0 GB) y cargarse con una sola orden, resulta adecuado para demostraciones de politicas de refuerzo en robots bipedos de bajo coste.
- Reentrenamiento y remezcla comunitaria: sirve como punto de partida para nuevos ajustes finos, tal como el propio autor lo obtuvo del modelo juicenv/microduck-roller-es21.
- Banco de pruebas de control a 50 Hz: util para validar que la cadena de inferencia a bordo (ONNX Runtime) cumple el presupuesto temporal de 20 ms por ciclo.
- Integracion en flujos de intercambio de politicas: al seguir el esquema 2 del manifiesto de politicas de microduck, puede incorporarse a herramientas de catalogo como MicroduckHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el ajuste se realizo optimizando la "puntuacion de Arena" (Arena score), pero no se proporciona el valor obtenido ni la definicion de dicha metrica, por lo que no es posible presentar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; la politica se ejecuta a bordo del robot sobre CPU mediante ONNX Runtime. No se publican cifras de memoria.
- GPU recomendadas: no se especifica ninguna; el caso de uso previsto es inferencia en el ordenador integrado del Microduck.
- Compatibilidad con GPU de consumo: no se documenta; por el tamano del artefacto (0,0 GB) es plausible que no requiera GPU, pero no hay datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime a traves de la libreria microduck y el demonio `robotctl` del robot; no se indican vLLM, llama.cpp, Ollama ni TGI (no aplican a una politica de control).
- Latencia y throughput: el control opera a 50 Hz, lo que implica un presupuesto de 20 ms por ciclo de inferencia; no se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| suraj-phanindra/microduck-roller-hc5-aifund | Politica RL (finetune) | 61-D / 14 acciones | 50 Hz | juicenv/microduck-roller-es21 | no disponible | Hugging Face, 0 descargas |
| juicenv/microduck-roller-es21 | Politica RL (base) | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| eli-aifund/microduck-aifund-roller | Politica RL para Microduck | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento, parametros ni licencia de las alternativas, por lo que la comparacion se limita a la relacion de derivacion y a la disponibilidad publica.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial este permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de validacion publica: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni resultados de Arena publicados.
- Especificidad de dominio: la politica esta entrenada para desplazarse sobre ruedas (rollers); no se documenta su comportamiento en otras configuraciones mecanicas del robot.
- Riesgo de fallo fuera de distribucion: al ser una politica de RL entrenada en simulacion, las condiciones reales no contempladas en el entrenamiento pueden degradar o romper la marcha. No es aplicable el concepto de alucinacion, pero si el de comportamiento impredecible fuera del dominio de entrenamiento.
- Informacion de arquitectura ausente: al no conocerse la topologia ni el numero de parametros, resulta imposible estimar coste computacional, memoria o robustez mas alla de la restriccion de 50 Hz.
- Dependencia del runtime: requiere la libreria microduck y el demonio `robotctl` con el esquema 2 del manifiesto de politicas; no es portable a otros frameworks de inferencia sin conversion manual del ONNX.
- Ausencia de soporte multilingue y de lenguaje natural: no puede utilizarse para tareas de texto, codigo, vision ni dialogo.
- Fecha de creacion inusual en los metadatos (2026-10-16) y actualizacion practicamente inmediata (2026-10-16T19:29:48), lo que sugiere un artefacto generado de forma automatica o experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-roller-hc5-aifund
- Modelo base: https://huggingface.co/juicenv/microduck-roller-es21
- Repositorio de entrenamiento: pollen-robotics/microduck_rl (rama main, commit 6ff40704a)
- Repositorio de Microduck: https://github.com/pollen-robotics/microduck
- Perfil del autor en GitHub: https://github.com/suraj-phanindra/
- Politica comparable de la comunidad: https://huggingface.co/eli-aifund/microduck-aifund-roller
- Tutorial de montaje de Microduck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Intercambio de politicas de Microduck: https://microduckhub.com/
