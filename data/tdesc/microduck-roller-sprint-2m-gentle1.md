# tdesc/microduck-roller-sprint-2m-gentle1

## Resumen

`microduck-roller-sprint-2m-gentle1` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de locomoción que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a una frecuencia de 50 Hz, orientada a desplazamiento sobre ruedas o rodillos (rollers). Lo publica el usuario `tdesc` en Hugging Face bajo la librería `microduck` y en formato ONNX.

La política se describe como «perpetua»: una vez cargada en una ranura de política del robot, ejecuta una marcha continua hasta que se le indique lo contrario. El nombre sugiere una variante de trote rápido («sprint») con un ajuste suave o conservador («gentle1»), aunque la model card no documenta hiperparámetros de entrenamiento, recompensas ni currículo. El repositorio tiene un tamaño de 0,0 GB, lo que indica un artefacto muy ligero, coherente con una red de política de pequeño tamaño exportada a ONNX.

El interés práctico es acotado pero claro: demuestra el flujo de trabajo completo de entrenamiento y despliegue de políticas RL en un robot de bajo coste, con un manifiesto de política versionado (schema 2) y una normalización de observaciones integrada en el propio grafo ONNX. La información pública disponible es mínima: no hay licencia, idiomas, benchmarks ni detalles de arquitectura de red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política RL exportada a ONNX; topología de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva, 61-D de observación por paso) |
| Tipos de cuantizacion | no disponible (artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |

Parámetros adicionales relevantes:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modo de locomocion | rollers (ruedas/rodillos) |
| Tipo de politica | perpetua (ejecucion continua hasta descarga) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal de la política. Se trata de una política de aprendizaje por refuerzo exportada a ONNX, con una entrada de 61 dimensiones (observaciones del robot) y una salida de 14 dimensiones (acciones), ejecutada a 50 Hz sobre el robot microduck. La normalización de las observaciones está integrada dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El artefacto incluye un `manifest.json` que sigue el schema 2 del manifiesto de políticas de microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

En cuanto al entrenamiento, la información disponible se limita a la procedencia: repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `7b2afcb94`, exportado desde un checkout con cambios sin confirmar. No se especifican el número de pasos de entrenamiento, la función de recompensa, el algoritmo RL (PPO, SAC u otro), la composición del dataset de entrenamiento ni si hubo fases de ajuste fino o destilación. La etiqueta «2m» del nombre podría sugerir 2 millones de pasos de entrenamiento, pero no está confirmado en la documentación y no debe asumirse.

## Capacidades

- Locomoción continua sobre rollers: genera una marcha perpetua a 50 Hz que se mantiene hasta que el operador descarga o sustituye la política.
- Control reactivo a partir de observaciones propioceptivas de 61 dimensiones (composición exacta no documentada).
- Salida de 14 acciones de control articular, coherente con la morfología del microduck.
- Despliegue directo en robot mediante el comando `robotctl policy load <slot> tdesc/microduck-roller-sprint-2m-gentle1`.
- Normalización de observaciones embebida en el grafo ONNX, lo que simplifica la integración en el daemon.
- Compatibilidad con el sistema de ranuras (slots) de políticas del daemon de microduck, lo que permite cargar y sustituir políticas en caliente.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Demostración de locomoción sobre ruedas en microduck: cargar la política en una ranura del robot y ejecutar una marcha continua en superficies con rollers para validar el hardware y el firmware del daemon.
- Pruebas de integración del pipeline `robotctl`: usar esta política como referencia para verificar el flujo de carga, el manifiesto schema 2 y la alimentación de observaciones en crudo con normalización embebida.
- Base de comparación para experimentos de RL: servir como política de referencia frente a otras políticas del mismo repositorio (por ejemplo, variantes de sprint o gentle) para evaluar estabilidad y suavidad de la marcha.
- Docencia y prototipado en robótica de bajo coste: ejemplo reproducible de extremo a extremo (entrenamiento en `microduck_rl`, exportación a ONNX, despliegue en robot) para cursos de aprendizaje por refuerzo aplicado.
- Sustitución en caliente de comportamientos: al ser una política perpetua cargable en un slot, permite alternar entre modos de marcha durante una sesión sin reiniciar el daemon.
- Evaluación de robustez en banco de pruebas: ejecutar la política de forma continua en un banco con rollers para medir deriva, consumo y temperatura de actuadores a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de desplazamiento, estabilidad, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- El artefacto es un modelo ONNX de tamaño despreciable (repo de 0,0 GB), por lo que la inferencia cabe holgadamente en cualquier SoC o CPU que ejecute el daemon de microduck.
- No se requieren GPU dedicadas para la inferencia en robot; el cómputo es una pasada de red a 50 Hz sobre vectores de 61 y 14 dimensiones.
- GPU recomendadas: no disponible; para el entrenamiento (no incluido en este repo) habría que consultar `pollen-robotics/microduck_rl`, que no documenta requisitos en la información disponible.
- Despliegue: mediante el daemon de microduck y el comando `robotctl policy load`, con runtime ONNX. No se documentan opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles. El único dato objetivo es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con parámetros, contexto o rendimiento documentados. El propio repositorio `pollen-robotics/microduck_rl` podría contener políticas relacionadas, pero no se dispone de sus especificaciones en esta ficha.

## Limitaciones y advertencias

- Información muy escasa: no hay licencia declarada, lo que impide determinar si el uso comercial está permitido. Antes de cualquier uso en producción, hay que contactar con el autor o consultar el repositorio de origen.
- Ámbito de aplicación restringido: la política está entrenada para locomoción sobre rollers; su comportamiento en otras superficies o configuraciones del robot no está documentado.
- Entrenamiento no reproducible a partir de la información pública: el export se hizo desde un checkout con cambios sin confirmar en el commit `7b2afcb94`, por lo que el estado exacto del código de entrenamiento no es verificable.
- Sin métricas de robustez ni de seguridad: no se documentan tasas de caída, límites de par, comportamiento ante obstáculos o condiciones de emergencia. En un robot físico, esto exige pruebas supervisadas.
- Política perpetua: al ejecutarse hasta que se le indique lo contrario, requiere un mecanismo externo de parada o supervisión para evitar marchas no deseadas.
- Riesgo de sobreajuste al entorno de entrenamiento (simulación o condiciones concretas), no evaluable con los datos disponibles.
- No aplica la noción de sesgos lingüísticos ni de alucinación, al no ser un modelo de lenguaje; el riesgo equivalente es una respuesta de control inadecuada ante observaciones fuera de distribución.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-roller-sprint-2m-gentle1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `7b2afcb94`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (no se proporciona URL directa en la información disponible).
