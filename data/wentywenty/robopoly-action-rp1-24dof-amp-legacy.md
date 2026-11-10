# wentywenty/robopoly-action-rp1-24dof-amp-legacy

## Resumen

El modelo `robopoly-action-rp1-24dof-amp-legacy` es una política de control motriz para robótica humanoide, publicada por el usuario wentywenty en Hugging Face bajo el ecosistema Robopoly. No se trata de un modelo de lenguaje, sino de un artefacto de inferencia en formato ONNX que mapea observaciones (`obs`) a acciones (`actions`) para un robot humanoide con 24 grados de libertad (DOF), identificado como `rp1_24dof`. La política se ejecuta a 250 Hz, lo que indica que está diseñada para control en tiempo real de bajo nivel sobre el hardware.

El modelo se etiqueta como "AMP Legacy", lo que sugiere que deriva de un entrenamiento mediante Adversarial Motion Priors (AMP), una técnica habitual en robótica para generar movimientos naturales imitando datos de referencia. El repositorio tiene un tamaño de 0,0 GB según los metadatos de Hugging Face, lo que apunta a un artefacto muy ligero, coherente con una política neuronal de inferencia y no con un modelo de gran tamaño.

Su relevancia radica en que forma parte de un flujo de despliegue gestionado por la herramienta `robopoly action`, que permite instalar, verificar y revertir políticas en robots compatibles. La licencia de los pesos está marcada como "other" y pendiente de confirmación, y el propio autor indica que se trata de un piloto público de validación, no de un artefacto listo para producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (ONNX); arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | other (pesos pendientes de confirmación); código GPL-3.0-only |
| Formato de pesos | ONNX (`models/policy_amp_legacy.onnx`) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Robot objetivo | `rp1_24dof` |
| Grados de libertad (DOF) | 24 |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Config de inferencia | `configs/amp.yaml` |
| Nivel de seguridad | S2 (riesgo; requiere confirmación humana) |
| SHA256 de pesos | `7a93c6b762165555476276dedf6f96574eb5c0a72ea9aa1178e879eed08f38e0` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de la red neuronal más allá de que se distribuye como grafo ONNX y que opera como política de control. La etiqueta "amp-legacy" apunta a un entrenamiento basado en Adversarial Motion Priors (AMP), un paradigma en el que un discriminador aprende a distinguir entre transiciones de movimiento generadas por la política y transiciones de un conjunto de datos de referencia (capturas de movimiento, por ejemplo), y la política se entrena para engañar a ese discriminador además de cumplir la tarea. Este enfoque es común para obtener marchas y movimientos humanos naturales en robots humanoides.

No se especifican en la información proporcionada el número de tokens, la composición del dataset de entrenamiento, ni si hubo fases de RLHF, DPO o ajuste fino posterior. Tampoco se detallan innovaciones técnicas como decodificación especulativa o mecanismos de atención, que en cualquier caso no son aplicables a un artefacto de control motriz de este tipo. La información se limita a los metadatos de despliegue y a la procedencia del artefacto.

## Capacidades

- Generación de acciones de control motriz para un robot humanoide de 24 DOF a partir de observaciones (`obs`).
- Inferencia en tiempo real a 250 Hz, adecuada para bucles de control de bajo nivel.
- Ejecución como política preentrenada dentro del ecosistema Robopoly mediante el comando `robopoly action install`.
- Compatibilidad declarada únicamente con el modelo de robot `rp1_24dof` y su configuración de 24 DOF.
- Soporte de verificación de integridad del artefacto (`robopoly action verify`) y de reversión a versiones anteriores (`robopoly action rollback`).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modos de razonamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Control de marcha en robot humanoide RP1 de 24 DOF: la política se carga en el bucle de control a 250 Hz para generar las acciones articulares que producen el movimiento de locomoción, sustituyendo o complementando controladores clásicos.
- Validación de políticas en simulación: antes de desplegar en hardware, el artefacto ONNX puede ejecutarse en un entorno simulado compatible con la interfaz `obs → actions` para comprobar el comportamiento de la política sin riesgo físico.
- Pruebas de integración en el ecosistema Robopoly: sirve para verificar que el flujo de instalación, verificación y rollback de acciones funciona correctamente en un robot `rp1_24dof` antes de adoptar políticas más críticas.
- Investigación en aprendizaje por imitación con AMP: el modelo puede utilizarse como referencia o línea base para comparar nuevas políticas entrenadas con Adversarial Motion Priors sobre el mismo robot y número de DOF.
- Desarrollo de capas de seguridad superpuestas: dado que el nivel de seguridad es S2, el modelo es un candidato para probar sistemas de supervisión, parada de emergencia y limitación de par en un banco de pruebas controlado.
- Formación y demostración técnica: en entornos de laboratorio con zona despejada y operador presente, permite mostrar el comportamiento de una política AMP legacy sobre hardware real con fines divulgativos o docentes.
- Replicación de experimentos: al estar publicados el SHA256 y la ruta de origen (`Roboparty/roboparty_inference`, commit `ee9174c`), un investigador puede reproducir exactamente el artefacto y contrastar resultados con los del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio figura como 0,0 GB, lo que sugiere un artefacto muy pequeño, pero no permite calcular VRAM con precisión.
- GPU recomendadas: no disponibles. Al ser una política ONNX de control a 250 Hz, es probable que pueda ejecutarse en hardware modesto o incluso en CPU, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el despliegue documentado es mediante la herramienta `robopoly action` (instalación, verificación y rollback). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto. El runtime de inferencia sería un ejecutor ONNX compatible con la interfaz `obs → actions` definida en `configs/amp.yaml`.
- Latencia y throughput: se declara una frecuencia de operación de 250 Hz, lo que implica un presupuesto de tiempo de 4 ms por ciclo de inferencia. No se especifican latencias medidas ni throughput real en hardware concreto.

## Comparativa con modelos similares

No disponible. No se han proporcionado otros modelos de la misma categoría (políticas de control para robots humanoides de 24 DOF) con los que comparar parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación ("other"), por lo que no se garantiza su uso comercial ni su redistribución.
- El autor indica explícitamente que se trata de un piloto público de validación en Hugging Face, no de un artefacto listo para producción.
- Nivel de seguridad S2: las acciones etiquetadas como de riesgo solo deben ejecutarse tras despejar la zona y con confirmación humana explícita.
- Requisitos de seguridad obligatorios: soporte fiable del robot, parada de emergencia accesible, limitación de corriente en la alimentación y realimentación CAN operativa.
- La instalación no implica habilitación: el usuario debe confirmar la ejecución antes de que la política actúe sobre el hardware.
- Compatibilidad limitada: solo se garantiza el funcionamiento con el modelo de robot `rp1_24dof` y su configuración de 24 DOF.
- Las previsualizaciones, si existen, son de simulación y no representan necesariamente el comportamiento en hardware real.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma, ya que no es un modelo de lenguaje. El riesgo principal es físico: movimientos no deseados del robot que puedan causar daños materiales o personales.
- El repositorio muestra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-amp-legacy
- Repositorio upstream citado: `Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_amp_legacy.onnx`, commit `ee9174c` (no se proporciona URL directa en la información disponible).
