# wentywenty/roboparty-action-rp1-24dof-wave

## Resumen

RP1 24DOF Wave es una política de control motriz (policy) para el robot humanoide `rp1_24dof` de Roboparty, publicada por el usuario `wentywenty` en Hugging Face. No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de inferencia en formato ONNX que mapea observaciones del robot (`obs`) a acciones de articulaciones (`actions`) a una frecuencia de 250 Hz, con el objetivo concreto de ejecutar un gesto de saludo (wave).

El repositorio se distribuye como un paquete de acción dentro del ecosistema `roboparty action`, con comandos de instalación, verificación y rollback. Incluye el modelo `models/policy_wave.onnx`, una configuración de inferencia `configs/wave.yaml` y datos de movimiento `motions/wave.npz`. Está etiquetado con nivel de seguridad `S1` y declara compatibilidad exclusiva con la máquina `rp1_24dof` de 24 grados de libertad.

Su relevancia es acotada y experimental: se trata de un piloto público de Hugging Face con cero descargas y cero likes en el momento de la consulta, con la licencia de pesos pendiente de confirmación y uso declarado únicamente para validación pública. No debe confundirse con un modelo fundacional de robótica; es una política específica de tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada `obs`, salida `actions`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` en pesos; código `GPL-3.0-only`; licencia de pesos pendiente de confirmación |
| Formato de pesos | ONNX (`models/policy_wave.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Grados de libertad (DOF) | 24 |
| Máquina compatible | `rp1_24dof` |
| Nivel de seguridad | `S1` |
| SHA256 de pesos | `a9e4a874616c26e5e9be9e2e2cca5159bb04430664aa6f93d870f721cdc50452` |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política. Lo único verificable es que se distribuye como grafo ONNX (`policy_wave.onnx`) que consume un vector de observaciones y produce un vector de acciones a 250 Hz, y que va acompañado de un fichero de configuración de inferencia (`wave.yaml`) y de datos de movimiento de referencia (`wave.npz`). No se especifica si la política es una red MLP, un transformer ligero, una política entrenada por imitación (behavior cloning) o por refuerzo, ni el número de capas, dimensión de las observaciones o espacio de acciones.

Tampoco se publican datos sobre el conjunto de entrenamiento, el número de tokens o episodios, la composición del dataset ni si hubo ajuste fino con preferencias humanas. El origen declarado es el repositorio upstream `Roboparty/roboparty_inference`, en la ruta `robots/rp1_24dof/models/policy_wave.onnx`, commit `ee9174c`. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no se incluye aquí.

## Capacidades

- Ejecución de un gesto de saludo (wave) sobre el humanoide `rp1_24dof` de 24 DOF.
- Inferencia en tiempo real a 250 Hz, adecuada para bucles de control de bajo nivel.
- Interfaz estandarizada de observaciones a acciones (`obs` → `actions`), integrable en el runtime de Roboparty.
- Instalación, verificación y rollback gestionados mediante la CLI `roboparty action`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es multilingüe: no procesa lenguaje natural.
- Compatibilidad declarada exclusivamente con la máquina `rp1_24dof`; no se garantiza con otros modelos o configuraciones de DOF.

## Casos de uso

- Demostración de saludo en ferias y presentaciones: la política ejecuta un gesto de wave reproducible a 250 Hz, útil para mostrar el funcionamiento del humanoide en un entorno controlado y con operador presente.
- Validación de la cadena de inferencia Roboparty: sirve como caso de prueba de extremo a extremo para verificar que la instalación, el runtime ONNX y el bus CAN funcionan correctamente antes de desplegar políticas más complejas.
- Pruebas de integración de seguridad: al estar marcada como `S1`, permite ensayar los protocolos de confirmación humana, parada de emergencia y limitación de corriente exigidos por el ecosistema.
- Benchmark de latencia del runtime: con una frecuencia objetivo de 250 Hz, es útil para medir el rendimiento del pipeline de observación-acción en el hardware del robot.
- Desarrollo de rutinas de interacción social: puede integrarse como bloque de una secuencia mayor de gestos (saludo, despedida) en robots de recepción o asistencia, siempre con supervisión humana.
- Regresión tras actualizaciones de firmware: el comando `roboparty action verify` y el hash SHA256 permiten comprobar que la política instalada es la esperada y que el comportamiento no ha derivado tras cambios en el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, error de seguimiento articular, latencia medida ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0.0 GB, lo que sugiere un grafo ONNX muy pequeño, pero no se publica el tamaño exacto del fichero ni el consumo de memoria.
- GPU recomendadas: no disponibles. Al tratarse de una política de control a 250 Hz, es plausible que se ejecute en CPU o en hardware embebido del propio robot, pero esto no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX dentro del ecosistema `roboparty action` (comandos `install`, `verify`, `rollback`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la única cifra publicada es la frecuencia de operación de 250 Hz (periodo de 4 ms por ciclo). No se proporcionan mediciones de latencia real ni de utilización de recursos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de acción comparables de Roboparty ni de terceros, y no se dispone de datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación: el campo `license` es `other` y la model card indica explícitamente que la licencia de pesos está por confirmar y que el uso actual es solo para validación pública. No debe asumirse uso comercial permitido.
- El código asociado se declara bajo `GPL-3.0-only`, lo que impone obligaciones de copyleft si se redistribuye o modifica.
- Compatibilidad limitada: solo se garantiza con la máquina `rp1_24dof` de 24 DOF. Su uso en otras plataformas no está soportado.
- Nivel de seguridad `S1`: la instalación no habilita el movimiento; se exige confirmación explícita del usuario antes de ejecutar. Requiere soporte fiable, parada de emergencia accesible, limitación de corriente en la alimentación y realimentación CAN operativa.
- Las previsualizaciones, si existen, pueden corresponder a simulación y no representan el comportamiento en el robot real.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de comportamiento inesperado en el robot si las condiciones de seguridad no se cumplen o si el entorno difiere del previsto.
- Sesgos conocidos: no documentados. No hay información sobre la diversidad de condiciones de entrenamiento ni sobre el comportamiento de la política ante perturbaciones externas.
- Estado del proyecto: piloto público con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.
- No es un modelo de lenguaje: no procesa ni genera texto, por lo que las expectativas de contexto, idiomas o razonamiento no son aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-wave
- Repositorio upstream declarado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_wave.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
