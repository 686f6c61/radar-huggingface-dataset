# wentywenty/roboparty-action-rp1-24dof-ufo

## Resumen

RP1 24DOF UFO es una política de control motriz (policy) para el robot humanoide `rp1_24dof`, publicada en Hugging Face por el usuario `wentywenty` bajo el paraguas del proyecto Roboparty. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un artefacto de inferencia robótica en formato ONNX que mapea observaciones (`obs`) a acciones (`action`) a una frecuencia de 250 Hz. El autor la describe como una "política UFO de alta dinámica" y la marca explícitamente como experimental.

El modelo se distribuye a través del ecosistema de herramientas `roboparty action` (instalación, verificación y rollback mediante CLI), y su origen declarado es el repositorio upstream `Roboparty/roboparty_inference`, en la ruta `robots/rp1_24dof/models/policy_ufo.onnx`. El artefacto se publica como piloto público de validación, con la licencia de pesos aún pendiente de confirmación.

La relevancia de esta ficha es acotada: se trata de un artefacto muy especializado, con cero descargas y cero likes en el momento de la consulta, sin model card técnica detallada (no se especifican arquitectura de red, datos de entrenamiento ni benchmarks) y con advertencias de seguridad explícitas por parte del autor. Cualquier evaluación debe partir de esa base: es un binario de control para un hardware concreto, no un modelo evaluable en términos de NLP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de política para control robótico, empaquetada en ONNX; topología interna no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un único artefacto ONNX) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other` para pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_ufo.onnx`) |
| Entrada / salida | `obs` → `action` |
| Frecuencia de inferencia | 250 Hz |
| Robot objetivo | `rp1_24dof` (24 grados de libertad) |
| Nivel de seguridad declarado | `S3` |
| SHA256 de pesos | `168da71a9e091a3cb63f43d25658ea019b9655819bf1d4a58ebfb5453d04643c` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la red. La model card únicamente describe el contrato de interfaz: un tensor de observaciones (`obs`) como entrada y un tensor de acciones (`action`) como salida, ejecutado a 250 Hz mediante el runtime de Roboparty con configuración en `configs/ufo.yaml`. El artefacto se distribuye exclusivamente como grafo ONNX, por lo que la topología (número de capas, tipo de encoder, dimensiones de observación y acción) tendría que inferirse inspeccionando el propio fichero, algo que no se documenta.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens, episodios, horas de simulación, composición del dataset, ni si se emplearon técnicas de aprendizaje por refuerzo, imitación o destilación. La única referencia técnica es la etiqueta "UFO" y la descripción "高动态" (alta dinámica), que sugiere un entrenamiento orientado a movimientos rápidos y posiblemente agresivos, coherente con el nivel de seguridad `S3` asignado. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones, ya que no aplican al dominio.

## Capacidades

- Generación de acciones de control articular para un robot humanoide de 24 DOF a 250 Hz.
- Mapeo directo observación → acción, apto para bucles de control en tiempo real.
- Ejecución de políticas de "alta dinámica" (UFO), presumiblemente orientadas a movimientos rápidos.
- Compatibilidad declarada exclusivamente con el modelo de robot `rp1_24dof`.
- Integración con el CLI de Roboparty (`install`, `verify`, `rollback`) para despliegue y reversión.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Validación en simulación de políticas de locomoción: el artefacto ONNX puede cargarse en un simulador compatible con el modelo `rp1_24dof` para comprobar el comportamiento antes de cualquier prueba física, dado que el autor advierte que las previsualizaciones son simuladas.
- Investigación en control de humanoides de alta dinámica: sirve como referencia reproducible (SHA256 fijado, commit upstream `ee9174c`) para comparar políticas propias frente a una línea base publicada.
- Pruebas de integración del stack Roboparty: permite verificar el flujo `install` → `verify` → `rollback` en un entorno controlado antes de desplegar políticas propietarias.
- Docencia y demostraciones de control robótico: útil para ilustrar el pipeline observación → acción a 250 Hz en un robot de 24 DOF, siempre con supervisión y medidas de seguridad.
- Evaluación de latencia del runtime: al ser un ONNX de tamaño reducido (repo de 0.0 GB), permite medir el coste de inferencia del runtime Roboparty a la frecuencia objetivo de 250 Hz.
- Ensayos de laboratorio con protocolo de seguridad S3: únicamente en recinto despejado, con parada de emergencia accesible, limitación de corriente y realimentación CAN verificada, y con confirmación humana explícita antes de habilitar el movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, seguimiento de trayectoria, robustez ante perturbaciones ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB, lo que sugiere un grafo ONNX pequeño, pero no se declara el tamaño exacto ni el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. Para control a 250 Hz (periodo de 4 ms) se requiere hardware con latencia determinista; el autor no especifica ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no confirmada. Dado el reducido tamaño del artefacto es plausible que quepa en GPUs de consumo, pero no hay dato publicado que lo respalde.
- Opciones de despliegue: runtime Roboparty (`roboparty action install/verify/rollback`) con ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la frecuencia objetivo declarada es 250 Hz (4 ms por ciclo); no se publican mediciones reales de latencia ni de jitter.

## Comparativa con modelos similares

| Modelo | Tipo | Robot objetivo | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RP1 24DOF UFO (este) | Política ONNX | `rp1_24dof` (24 DOF) | 250 Hz | Pesos `other` (pendiente); código GPL-3.0-only | Hugging Face, piloto público |
| Otras políticas del ecosistema Roboparty | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomotion open source de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la comparativa queda limitada a la propia ficha.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación: el autor indica explícitamente que la licencia de los pesos está por determinar y que el artefacto se publica solo para validación pública. No debe asumirse uso comercial permitido.
- Nivel de seguridad `S3`: la propia model card califica la acción como de riesgo y exige despejar el recinto y confirmación humana antes de ejecutarla.
- Instalar no equivale a habilitar: el autor subraya que la habilitación requiere confirmación explícita del usuario.
- Requisitos de seguridad física: soporte fiable, parada de emergencia accesible, limitación de corriente en la alimentación y realimentación CAN operativa.
- Compatibilidad restringida: solo se garantiza el funcionamiento con el modelo `rp1_24dof` y 24 DOF; no hay garantía para otras configuraciones.
- Previsualizaciones simuladas: cualquier vídeo o demo de simulación no representa el comportamiento en hardware real.
- Ausencia de documentación técnica: sin arquitectura, datos de entrenamiento ni benchmarks publicados, no es posible evaluar su robustez, sesgos o generalización.
- Sin métricas de rendimiento ni adopción: cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validación por parte de la comunidad.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de comportamiento impredecible fuera de las condiciones de entrenamiento, agravado por la falta de documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-ufo
- Repositorio upstream declarado: `Roboparty/roboparty_inference` (commit `ee9174c`); no se proporciona URL directa en la información disponible.
- No se han encontrado papers, blogs, demos ni otros repositorios en la información proporcionada.
