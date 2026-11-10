# wentywenty/roboparty-action-rpo-parkour

## Resumen

RPO Parkour es una política de control motriz para el robot humanoide `rpo` (23 grados de libertad) orientada a la ejecución de maniobras de parkour. No es un modelo de lenguaje: es un artefacto de robótica empaquetado en formato ONNX que se distribuye a través del ecosistema Roboparty y se instala como una "acción" ejecutable sobre el robot físico. El modelo lo publica el usuario `wentywenty` en Hugging Face y su origen upstream es el repositorio `Roboparty/roboparty_inference`, dentro de la ruta `robots/rpo/models/policy_parkour.onnx`.

Técnicamente se trata de una política de inferencia a 250 Hz con una única entrada (`input`) y una única salida (`output`), pensada para ejecutarse en bucle cerrado sobre el controlador del robot. El autor la marca explícitamente como experimental y con clasificación de seguridad `S3`, lo que implica que requiere confirmación humana y condiciones de entorno controladas antes de su ejecución. La licencia de los pesos está pendiente de confirmación y el repositorio se describe como un piloto público de validación.

Su relevancia es acotada pero concreta: ejemplifica el patrón de distribución de políticas de control para humanoides como paquetes versionados con verificación criptográfica (SHA256), comandos de instalación y rollback, y una clasificación de riesgo asociada. Para investigadores en robótica es un caso de estudio de empaquetado y gobernanza de políticas motrices más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se documenta la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other` para los pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_parkour.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entradas / salidas | `input` → `output` |
| Robot objetivo | `rpo` |
| Grados de libertad (DOF) | 23 |
| Clasificación de seguridad | S3 |
| SHA256 de pesos | `cb562c4407fb38b4aaed48afcf2ba1cc23ab20e1861feb36bbca79c8a7427370` |
| Commit upstream | `ee9174c` |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna de la política. El artefacto distribuido es un grafo ONNX con una entrada y una salida, ejecutado a 250 Hz, lo que sugiere una política de control reactiva de bucle cerrado que mapea observaciones (presumiblemente estado propioceptivo y posiblemente percepción) a comandos articulares. No se especifica si se trata de una red MLP, un transformer, una política recurrente o un controlador híbrido, ni se indica el algoritmo de entrenamiento (por ejemplo, reinforcement learning con simulación a real, imitación o optimización de trayectorias).

Tampoco se publican datos sobre el volumen de entrenamiento, la composición del dataset, el simulador empleado ni si hubo etapas de ajuste fino o destilación. La model card únicamente referencia el repositorio upstream `Roboparty/roboparty_inference` y el commit `ee9174c` como trazabilidad del artefacto, además del hash SHA256 para verificación de integridad. Cualquier afirmación sobre la innovación técnica del método queda fuera de la información disponible.

## Capacidades

- Ejecución de una política motriz de parkour sobre el humanoide `rpo` con 23 DOF.
- Inferencia en tiempo real a 250 Hz con una interfaz de entrada/salida única (`input` → `output`).
- Distribución como paquete instalable mediante el CLI de Roboparty (`roboparty action install`), con verificación (`verify`) y reversión (`rollback`).
- Verificación de integridad de pesos mediante SHA256.
- Clasificación de riesgo de seguridad (`S3`) integrada en el flujo de despliegue.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en locomoción de humanoides: servir como referencia reproducible de una política de parkour para comparar metodologías de control en el robot `rpo`, aprovechando la trazabilidad del commit upstream y el hash de pesos.
- Validación en simulación previa a despliegue: ejecutar la política en un entorno simulado compatible con la interfaz ONNX antes de autorizar su instalación en el robot físico, dado que el autor advierte que las previsualizaciones pueden ser simuladas y no representativas.
- Pruebas de integración del pipeline Roboparty: usar el paquete para verificar el flujo completo de instalación, verificación y rollback en un entorno de staging con el robot inmovilizado o suspendido.
- Auditoría de gobernanza de políticas: estudiar el patrón de clasificación de seguridad `S3`, confirmación humana obligatoria y requisitos de entorno (soporte fiable, parada de emergencia accesible, limitación de corriente, realimentación CAN operativa) como modelo de despliegue seguro.
- Docencia en robótica humanoide: emplear el artefacto como ejemplo de política de control empaquetada y versionada para explicar interfaces de inferencia, frecuencias de control y verificación criptográfica.
- Evaluación de compatibilidad hardware/software: comprobar la compatibilidad declarada con el modelo `rpo` y 23 DOF en laboratorios que dispongan de esa plataforma, sin extender su uso a otros robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de caída, velocidades alcanzadas, consumo energético ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio figura como 0.0 GB y no se documenta el número de parámetros, por lo que no puede estimarse el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: el artefacto está en formato ONNX y se ejecuta mediante el stack Roboparty (`roboparty action install` / `verify` / `rollback`), no mediante servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política.
- Latencia y throughput: la política está diseñada para 250 Hz, lo que implica un presupuesto de 4 ms por ciclo de inferencia; no se publican mediciones reales de latencia ni de throughput en el hardware objetivo.
- Requisitos de plataforma física: robot `rpo` con 23 DOF, soporte fiable, parada de emergencia accesible, limitación de corriente en la fuente de alimentación y realimentación CAN operativa.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de parkour para humanoides con las que comparar parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Los pesos se distribuyen bajo licencia `other` y el propio autor indica que la licencia de pesos está pendiente de confirmación; no debe asumirse uso comercial permitido. El código asociado es `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra.
- Clasificación de seguridad `S3`: se trata de un movimiento de riesgo que solo debe ejecutarse tras despejar el entorno y con confirmación humana explícita. La instalación no habilita la ejecución.
- Estado experimental y piloto público: no hay garantías de robustez ni de comportamiento en condiciones distintas a las de validación.
- Las previsualizaciones, si existen, pueden corresponder a simulación y no representan el comportamiento en el robot real.
- Compatibilidad limitada al modelo `rpo` con 23 DOF; no se garantiza funcionamiento en otras plataformas ni configuraciones articulares.
- No se documentan sesgos (no aplica en el sentido lingüístico), pero sí existe riesgo de fallo físico: caídas, sobreesfuerzos articulares o daños materiales si no se respetan las condiciones de seguridad.
- Ausencia total de documentación sobre arquitectura, entrenamiento y métricas, lo que impide evaluar su calidad técnica de forma independiente.
- Sin datos de benchmarks ni de rendimiento en el mundo real; no es posible verificar afirmaciones de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-parkour
- Repositorio upstream referenciado: `Roboparty/roboparty_inference` (commit `ee9174c`), sin URL pública en la información disponible.
