# wentywenty/robopoly-action-rp1-24dof-ufo

## Resumen

RP1 24DOF UFO es una política de control motriz para el robot humanoide `rp1_24dof`, publicada por el usuario wentywenty en Hugging Face bajo el ecosistema Robopoly. Se distribuye como un modelo ONNX (`models/policy_ufo.onnx`) que mapea observaciones (`obs`) a acciones (`action`) a una frecuencia de 250 Hz, pensado para ejecutarse sobre el robot físico o su gemelo de simulación. La model card la describe como una política experimental de "alta dinámica" (高动态), lo que en la práctica implica movimientos rápidos y potencialmente agresivos para la mecánica del robot.

El modelo no es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de inferencia para robótica, con un espacio de observación y acción específico del chasis `rp1_24dof` de 24 grados de libertad. No se publican parámetros, arquitectura de red, datos de entrenamiento ni resultados de benchmarks en la información disponible; el repositorio tiene un tamaño de 0,0 GB y cero descargas en el momento de la consulta.

Su relevancia es acotada pero concreta: forma parte de un pipeline de distribución de políticas robóticas (Robopoly) que permite instalar, verificar y revertir políticas mediante CLI (`robopoly action install/verify/rollback`). La licencia de los pesos está marcada como `other` y pendiente de confirmación, y el propio autor la califica de "piloto público" para validación, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control; se distribuye como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (pesos); código GPL-3.0-only; licencia de pesos pendiente de confirmación |
| Formato de pesos | ONNX (`models/policy_ufo.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `action` |
| Robot compatible | `rp1_24dof` (24 DOF) |
| Nivel de seguridad | S3 |
| SHA256 de pesos | `168da71a9e091a3cb63f43d25658ea019b9655819bf1d4a58ebfb5453d04643c` |
| Version | v1.0.0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura de red interna (capas, tipo de transformer, MLP, red convolucional o política de refuerzo), el número de parámetros ni el procedimiento de entrenamiento. La model card solo indica que el artefacto es un grafo ONNX exportado desde el repositorio upstream `Roboparty/roboparty_inference`, en la ruta `robots/rp1_24dof/models/policy_ufo.onnx`, con commit `ee9174c`. No se documentan datos de entrenamiento, número de tokens, composición del dataset, ni si se empleó aprendizaje por refuerzo, imitación o RLHF.

La innovación técnica destacable, según la información disponible, es el modo de distribución y ejecución: una política de control de alta dinámica empaquetada como modelo ONNX con metadatos de seguridad (nivel S3), instalable y reversible mediante la CLI de Robopoly, y con verificación de integridad por SHA256. La frecuencia de 250 Hz sugiere un bucle de control en tiempo real, pero no se especifican la latencia del grafo ni los requisitos de cómputo.

## Capacidades

- Generación de acciones de control motriz para un robot humanoide de 24 grados de libertad (`rp1_24dof`).
- Inferencia a 250 Hz sobre observaciones (`obs`) para producir acciones (`action`).
- Ejecución de una política marcada como de "alta dinámica" (高动态), orientada a movimientos rápidos.
- Integración con el ecosistema Robopoly mediante comandos de instalación, verificación y rollback.
- Verificación de integridad de pesos por hash SHA256.
- Clasificación de seguridad S3 con requisitos explícitos de confirmación humana antes de la ejecución.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Validación de políticas en simulación: el modelo puede cargarse en el gemelo digital del `rp1_24dof` para comprobar que el grafo ONNX produce acciones coherentes antes de cualquier prueba física, dado que la model card advierte que las previsualizaciones son de simulación.
- Pruebas de integración del pipeline Robopoly: sirve para verificar el flujo `install` → `verify` → `rollback` en un entorno controlado, incluyendo la comprobación del SHA256 de los pesos.
- Investigación en control de humanoides de alta dinámica: el modelo puede emplearse como referencia o línea base para comparar políticas propias sobre el mismo chasis de 24 DOF, siempre en simulación.
- Desarrollo de procedimientos de seguridad: al estar marcado como S3, es útil para diseñar y ensayar protocolos de habilitación manual, parada de emergencia, limitación de corriente y comprobación de feedback CAN antes de ejecutar políticas de riesgo.
- Docencia y formación en robótica: permite ilustrar el ciclo completo de despliegue de una política motriz (instalación, verificación, ejecución a 250 Hz y reversión) sin necesidad de entrenar un modelo desde cero.
- Auditoría de licencias y procedencia: el repositorio documenta upstream, commit y hash, lo que facilita tareas de trazabilidad en cadenas de suministro de software robótico.
- Evaluación comparativa de frecuencias de control: útil para estudiar el comportamiento de una política a 250 Hz frente a alternativas de menor frecuencia, aunque no se publican métricas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad, consumo energético ni latencia del grafo ONNX.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y no se documenta el tamaño del grafo ONNX ni el número de parámetros.
- GPU recomendadas: no disponible. Al ser una política de control a 250 Hz, es plausible que requiera cómputo de baja latencia, pero no se especifica hardware.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer el tamaño y la arquitectura del modelo.
- Opciones de despliegue: ONNX Runtime es el runtime implícito por el formato; la ejecución se orquesta mediante la CLI de Robopoly (`robopoly action install/verify/rollback`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la frecuencia nominal es de 250 Hz (periodo de 4 ms), pero no se publican latencias reales del grafo ni throughput medido.
- Requisitos de plataforma física: soporte mecánico fiable, parada de emergencia accesible, limitación de corriente en la fuente de alimentación y feedback CAN operativo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas para el chasis `rp1_24dof` ni modelos comparables de la misma categoría (control de humanoides de 24 DOF) con parámetros, contexto o rendimiento documentados.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación (`other`); el autor indica que actualmente solo se usa para validación pública. No debe asumirse uso comercial permitido.
- El código asociado es GPL-3.0-only, lo que impone obligaciones de copyleft si se redistribuye o modifica.
- Marcada como S3: requiere confirmación humana explícita, espacio despejado y medidas de seguridad antes de ejecutarse en un robot real. La instalación no implica habilitación.
- Las previsualizaciones, si existen, son de simulación y no representan el comportamiento en el robot físico.
- Solo se garantiza compatibilidad con el modelo de robot y el número de DOF declarados (`rp1_24dof`, 24 DOF); su uso en otro chasis no está soportado.
- No se documentan sesgos, pero al ser una política de control no aplican las categorías habituales de sesgo lingüístico; el riesgo principal es de comportamiento físico imprevisto.
- Riesgo de alucinación no aplicable en el sentido de modelos de lenguaje; el riesgo equivalente es la generación de acciones no válidas o inestables, agravado por la falta de benchmarks publicados.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- Al no publicarse arquitectura ni parámetros, es imposible estimar requisitos de cómputo, latencia o consumo energético antes de desplegarlo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y el autor lo describe como piloto experimental; la madurez del artefacto es baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-ufo
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_ufo.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
