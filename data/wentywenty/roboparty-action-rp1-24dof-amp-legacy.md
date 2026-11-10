# wentywenty/roboparty-action-rp1-24dof-amp-legacy

## Resumen

RP1 24DOF AMP Legacy es una política de control motriz para el robot humanoide `rp1_24dof` (24 grados de libertad), publicada por el usuario wentywenty dentro del ecosistema Roboparty. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un artefacto de inferencia en formato ONNX que mapea observaciones (`obs`) a acciones (`actions`) a una frecuencia de control de 250 Hz. Su función es ejecutar un comportamiento motor preentrenado sobre el hardware robótico declarado, integrándose mediante el cliente de línea de comandos `roboparty action`.

El modelo se distribuye como un piloto público en Hugging Face con el repositorio prácticamente vacío en cuanto a tamaño (0.0 GB reportados) y sin descargas ni interacciones registradas. La model card está redactada en chino e inglés, identifica la política como "AMP 旧版" (AMP legacy) y la clasifica con nivel de seguridad `S2`, lo que implica que su ejecución conlleva riesgos que requieren confirmación humana y condiciones de entorno controladas (soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa).

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho para robótica humanoide, con licencia de pesos pendiente de confirmación y sin benchmarks publicados. Resulta útil como referencia para quienes trabajen con el ecosistema Roboparty o necesiten integrar políticas de acción en pipelines de control a 250 Hz, pero no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz exportada a ONNX; no se detalla la arquitectura interna de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de observaciones `obs` y salida de acciones `actions` por paso de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje) |
| Licencia | other (código: GPL-3.0-only; pesos: other, pendiente de confirmación) |
| Formato de pesos | ONNX (`models/policy_amp_legacy.onnx`) |
| Frecuencia de control | 250 Hz |
| Robot objetivo | `rp1_24dof` (24 grados de libertad) |
| Nivel de seguridad | S2 |
| Entrada / salida | `obs` → `actions` |
| SHA256 de pesos | 7a93c6b762165555476276dedf6f96574eb5c0a72ea9aa1178e879eed08f38e0 |
| Commit upstream | ee9174c (`Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_amp_legacy.onnx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. El artefacto se distribuye como un grafo ONNX (`policy_amp_legacy.onnx`) que implementa una política de control, presumiblemente entrenada mediante *Adversarial Motion Priors* (AMP), dado el sufijo `amp-legacy` en el identificador. AMP es una técnica de aprendizaje por imitación que emplea un discriminador adversarial para que la política reproduzca estilos de movimiento de referencia sin necesidad de recompensas manuales explícitas por cada transición.

No se especifican el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o pasos de simulación, ni si se aplicaron etapas de ajuste fino, RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no directamente aplicables aquí). Tampoco se documenta si hubo entrenamiento en simulación con transferencia sim-a-real (*sim-to-real*), aunque la advertencia de que las previsualizaciones en simulación "no representan el efecto en el robot real" sugiere que el comportamiento puede degradarse fuera del entorno de entrenamiento. La configuración de inferencia se referencia en `configs/amp.yaml`, no incluido en la información proporcionada.

## Capacidades

- Generación de acciones de control motriz para el robot humanoide `rp1_24dof` con 24 grados de libertad, a una frecuencia de 250 Hz.
- Mapeo directo de observaciones (`obs`) a acciones (`actions`), apto para bucles de control en tiempo real.
- Ejecución de una política de locomoción o comportamiento entrenada con AMP (estilo de movimiento derivado de referencias).
- Integración con el ecosistema Roboparty mediante los comandos `install`, `verify` y `rollback`.
- Compatibilidad declarada exclusivamente con el modelo de robot `rp1_24dof` y su configuración de 24 DOF.
- Clasificación de seguridad `S2`, con requisitos de confirmación humana antes de la ejecución.
- No dispone de capacidades de lenguaje, visión, audio, tool calling, razonamiento multi-paso ni funciones de agente.

## Casos de uso

- **Investigación en aprendizaje por imitación (AMP):** utilizar la política como referencia o línea base para comparar nuevos entrenamientos de locomoción en el mismo robot, aprovechando que el artefacto está versionado y con SHA256 verificable.
- **Validación de pipelines de control a 250 Hz:** emplear el modelo ONNX para probar la cadena de inferencia, la latencia del runtime y la sincronización con la realimentación CAN antes de desplegar políticas propias.
- **Pruebas de integración con el cliente Roboparty:** ejecutar `roboparty action install` y `verify` en un entorno de laboratorio para validar el flujo de instalación, verificación y rollback de artefactos de acción.
- **Simulación y previsualización de comportamientos:** cargar la política en un simulador compatible para inspeccionar el estilo de movimiento antes de cualquier prueba en hardware, asumiendo que la previsualización no garantiza el comportamiento real.
- **Docencia y formación en robótica humanoide:** usar el modelo como ejemplo práctico de política de control con niveles de seguridad definidos (`S2`) y procedimientos de parada de emergencia, en entornos con supervisión.
- **Auditoría de seguridad de artefactos robóticos:** analizar el modelo para estudiar cómo se documentan los requisitos de seguridad (soporte fiable, limitación de corriente, parada accesible) en políticas de acción publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, errores de seguimiento ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio se reporta como 0.0 GB y no se detalla el tamaño del grafo ONNX ni de sus tensores).
- GPU recomendadas: no disponible. Al ser un modelo ONNX de política de control a 250 Hz, es plausible su ejecución en CPU o en GPU de gama media, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) y el cliente `roboparty action` del ecosistema Roboparty; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la frecuencia de control declarada es de 250 Hz (periodo de 4 ms por paso), pero no se publican latencias medidas ni throughput real en hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de acción comparables del mismo ecosistema ni benchmarks que permitan una comparación cuantitativa con alternativas de robótica humanoide.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación (`other`); el uso comercial no está garantizado y el artefacto se describe como "solo para validación pública".
- El código asociado se distribuye bajo GPL-3.0-only, lo que impone obligaciones de copyleft si se integra en productos derivados.
- Compatibilidad limitada exclusivamente al robot `rp1_24dof` con 24 DOF; no se garantiza su funcionamiento en otras plataformas.
- Nivel de seguridad `S2`: requiere soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa antes de ejecutarse.
- Las previsualizaciones en simulación no representan el comportamiento en el robot real; puede haber degradación por diferencias sim-a-real.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución; al ser una política motriz, el riesgo principal es de seguridad física, no cognitivo.
- Sin descargas ni validación comunitaria registrada (0 descargas, 0 likes), lo que reduce la evidencia sobre su robustez.
- La model card está mayoritariamente en chino; la documentación en castellano o inglés es inexistente.
- No se especifican requisitos de versión del runtime ONNX ni de las dependencias del cliente Roboparty.

## Enlaces

- Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-amp-legacy
- Repositorio upstream referenciado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_amp_legacy.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Configuración de inferencia: `configs/amp.yaml` (no disponible como enlace).
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
