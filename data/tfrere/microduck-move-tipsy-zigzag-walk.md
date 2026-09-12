# tfrere/microduck-move-tipsy-zigzag-walk

## Resumen

`tfrere/microduck-move-tipsy-zigzag-walk` es una politica de locomocion ("move") para el robot Microduck, entrenada por el usuario tfrere mediante la plataforma Microduck Academy. No se trata de un modelo de lenguaje: es un controlador de marcha exportado a ONNX que hace que el robot camine hacia delante a ritmo constante mientras balancea su rumbo de izquierda a derecha en zigzag, con un ligero balanceo lateral del cuerpo que le da un aspecto "achispado" ("tipsy zigzag walk").

El modelo pertenece a la familia `velocity` (estilos de marcha o gaits), tier 1 y tipo `perpetual`, y se evalua con un sistema doble: un "judge" programatico que valida metricas fisicas sobre la simulacion, y un "eye" basado en un VLM que revisa los fotogramas del video resultante. En la evaluacion publicada, el judge otorga PASS con puntuacion 1.0 y el VLM coincide con el veredicto, dando una puntuacion final del 100 %.

Su relevancia es acotada y muy especifica: sirve como pieza reutilizable dentro del ecosistema Microduck (despliegue con `robotctl`, remezcla mediante fine-tuning desde `model.pt` y analisis de trayectorias `.traj`). El repositorio ocupa 0.0 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (politica de control exportada a ONNX; sin detalle de capas ni topology en la informacion proporcionada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible; se distribuye un unico artefacto ONNX sin variantes cuantizadas declaradas |
| Idiomas soportados | No aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`), PyTorch (`model.pt`), trayectorias `trajectory.v1` (`rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`), manifiesto JSON (`manifest.json`, schema 2) |
| Familia / tier / tipo | `velocity` / tier 1 / `perpetual` |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la politica: solo se indica que el artefacto desplegable es `policy.onnx` y que el modelo base para reentrenamiento es `model.pt`. El entrenamiento se realizo con Microduck Academy, plataforma que produce politicas de locomocion por familia (en este caso `velocity`, orientada a estilos de marcha) y por tier. El ciclo de entrenamiento se registra por rondas: el manifiesto incluye los pasos de cada ronda (`checkpoints/r<round>-<iter>.traj`) y el historial de evaluacion (ronda 1 y ronda final).

El rasgo tecnico mas destacable no es la arquitectura, sino el pipeline de evaluacion en dos etapas. Primero, un judge programatico mide magnitudes fisicas sobre la simulacion y emite un veredicto con puntuacion (PASS, 1.0). Despues, un VLM ("eye") observa los fotogramas del clip y emite un veredicto cualitativo que puede ratificar o contradecir al judge; la puntuacion mostrada se limita al 75 % si el VLM no se pronuncia y al 50 % si discrepa. En este modelo, ambas etapas son coherentes: el VLM describe "el pato avanza de forma constante mientras balancea cuerpo y cabeza de lado a lado en un patron de zigzag claro".

## Capacidades

- Locomocion cuadrupeda/bípeda hacia delante a velocidad sostenida: 0.364 m/s de velocidad y 0.357 m/s de desplazamiento neto medidos por el judge.
- Generacion de una marcha de zigzag regular: variacion de rumbo con `yaw_rate_rps` de 0.076 y un recorrido pico a pico de guiñada de cabeza (`head_yaw_ptp_rad`) de 0.996 rad.
- Balanceo lateral controlado del cuerpo (estilo "tipsy"), con un `max_tilt_deg` de 5.4 grados y un `pitch_deg` de 1.6 grados.
- Mantenimiento de postura: `height_ratio` de 1.044 y altura de 0.1201 m, sin caidas (`fell: false`) durante los 8.0 s de la evaluacion.
- Patron de contacto de patas casi simetrico: `contact_fraction` de [0.53, 0.50].
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento. Es exclusivamente un controlador motor.
- No procesa vision ni audio como entrada; el componente VLM del pipeline es externo a la politica y se usa solo para evaluacion.

## Casos de uso

- Robotica educativa y demostraciones en simulador: la politica se carga con `robotctl policy add tipsy zigzag walk tfrere/microduck-move-tipsy-zigzag-walk` y se ejecuta con `robotctl robot do tipsy zigzag walk`, lo que permite mostrar un gait llamativo y facilmente reconocible en talleres de robotica.
- Base para fine-tuning ("remix"): el archivo `model.pt` esta pensado explicitamente para reentrenamiento, de modo que un desarrollador puede partir de esta marcha y ajustarla hacia variantes con mas o menos balanceo, o hacia otros perfiles de velocidad dentro de la familia `velocity`.
- Banco de pruebas del pipeline judge + eye: al incluir trayectorias por ronda y un veredicto cruzado (codigo y VLM), sirve como caso de estudio para validar sistemas de evaluacion automatica de politicas de locomocion.
- Analisis de estabilidad y consumo de contacto: las trayectorias `.traj` en formato `trajectory.v1` permiten estudiar la evolucion de la altura, el tilt y la fraccion de contacto pata a pata a lo largo de cada iteracion de entrenamiento.
- Animacion y prototipado de personajes: la marcha de zigzag con balanceo lateral puede reutilizarse como referencia cinematica para dar un movimiento "achispado" a personajes no humanos en motores de simulacion o videojuegos.
- Comparativas internas de gaits: al convivir con otras politicas de la misma academia y familia, permite medir de forma objetiva (velocidad, tilt, yaw rate) en que se diferencia esta marcha frente a otras de tier 1.
- Integracion en flujos de despliegue de robots basados en ONNX, usando `policy.onnx` con un runtime ONNX estandar sobre el hardware del Microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) porque la naturaleza del modelo no es linguistica. La evaluacion disponible es la del judge fisico y el veredicto del VLM:

| Ronda | Judge | Puntuacion judge | Eye (VLM) | Puntuacion final |
|---|---|---|---|---|
| 1 | pass | 1.0 | sin veredicto | 100 % |
| final | pass | 1.0 | coincide (zigzag claro) | 100 % |

Metricas fisicas reportadas por el judge:

| Metrica | Valor |
|---|---|
| `height_ratio` | 1.044 |
| `height_m` | 0.1201 |
| `speed_mps` | 0.364 |
| `displacement_mps` | 0.357 |
| `pitch_deg` | 1.6 |
| `max_tilt_deg` | 5.4 |
| `yaw_rate_rps` | 0.076 |
| `head_yaw_ptp_rad` | 0.996 |
| `knee_left_rad` | -0.029 |
| `contact_fraction` | [0.53, 0.50] |
| `fell` | false |
| `duration_s` | 8.0 |
| `label` | forward |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y se trata de una politica de control, por lo que es razonable esperar un consumo de memoria muy bajo, pero no hay cifra publicada.
- GPU recomendadas: no disponible. No se especifica ningun requisito de GPU.
- Compatibilidad con GPU de consumo: no disponible. Por el tipo de artefacto (ONNX) es plausible su ejecucion en CPU o en hardware embebido, pero esto no se confirma en la informacion proporcionada.
- Opciones de despliegue: el camino documentado es `robotctl` (`robotctl policy add ...` y `robotctl robot do ...`) sobre el robot Microduck. Al ser un archivo ONNX, tambien puede cargarse con cualquier runtime compatible con ONNX, aunque el autor no lo indica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otras politicas comparables (parametros, contexto, rendimiento o licencia de alternativas). Los unicos elementos potencialmente comparables serian otras "moves" de la misma familia `velocity` y tier 1 dentro de Microduck Academy, pero no se aportan sus especificaciones ni resultados.

## Limitaciones y advertencias

- Ambito restringido: es una politica de locomocion especifica para el robot Microduck. No es un modelo de proposito general ni puede reutilizarse como modelo de lenguaje o vision.
- Dependencia de simulacion y de la academia: las metricas publicadas proceden de un judge programatico sobre simulacion, no de mediciones en hardware fisico real.
- Rendimiento acotado a un escenario: los datos corresponden a una prueba de 8.0 s con etiqueta `forward`. No hay evidencia de comportamiento en pendientes, obstaculos, terrenos irregulares u otras condiciones.
- Idoneidad funcional: la marcha en zigzag implica una desviacion lateral deliberada del rumbo; no es una trayectoria de avance recto, lo que limita su uso en tareas que exijan precision direccional.
- Sesgos conocidos: no disponible. No se documentan sesgos, aunque al ser una politica entrenada por optimizacion de recompensa puede heredar las preferencias del criterio de evaluacion (judge y VLM) usado durante el entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido linguistico. Si se usa el VLM del pipeline como fuente de verdad, sus veredictos son cualitativos y podrian no coincidir con la realidad fisica, si bien el sistema de puntuacion penaliza la discrepancia.
- Licencia: Apache 2.0, por lo que el uso comercial esta permitido segun los terminos de dicha licencia, siempre que se conserven los avisos correspondientes. Conviene verificar los terminos de la plataforma Microduck Academy para el flujo de entrenamiento y despliegue.
- Adopcion nula: el repositorio presenta 0 descargas y 0 likes, y no hay senales de validacion por parte de terceros.
- Repositorio de 0.0 GB: el peso real de los artefactos no se refleja con precision en ese campo, por lo que no debe tomarse como una medicion fiable del tamano del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-tipsy-zigzag-walk
- Perfil del autor: https://huggingface.co/tfrere
- Espacio de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Paper, repositorio de codigo o demo adicionales: no disponible en la informacion proporcionada.
- Los resultados de busqueda web obtenidos no contienen material relevante sobre este modelo (foros de razas de perros en sueco y polaco); no se incluyen por no ser pertinentes.
