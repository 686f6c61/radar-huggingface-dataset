# wentywenty/robopoly-action-rp1-24dof-soft

## Resumen

RP1 24DOF Soft es una política de control motriz ("action") para el robot humanoide `rp1_24dof`, publicada por el usuario wentywenty bajo el paraguas del ecosistema Robopoly. No es un modelo de lenguaje: es un artefacto ONNX que mapea observaciones del robot (`obs`) a acciones de control (`actions`) a 250 Hz, pensado para ejecutar una marcha suave y estable sobre el hardware de 24 grados de libertad. Se distribuye a través del gestor de acciones de Robopoly, que permite instalar, verificar y revertir la política en el robot.

El modelo se etiqueta como `soft` (柔顺步态, "marcha suave") y con nivel de seguridad `S2`, lo que implica que su ejecución requiere confirmación humana y condiciones de entorno controladas. El repositorio es de tamaño prácticamente nulo (0.0 GB reportados), coherente con una política neuronal de pequeña dimensión exportada a ONNX, no con un modelo fundacional.

La relevancia es acotada pero concreta: ejemplifica el patrón emergente de distribuir políticas de control robótico como artefactos versionados en Hugging Face, con hash de pesos, procedencia declarada y flujo de instalación/rollback. La licencia de los pesos está pendiente de confirmación y el modelo se describe como piloto público de validación, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se especifica la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada `obs`, salida `actions`; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` para los pesos (pendiente de confirmar); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_soft.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red. La model card únicamente especifica el contrato de entrada/salida (`obs` → `actions`), la frecuencia de inferencia (250 Hz) y el fichero de configuración de inferencia (`configs/soft.yaml`). No se documentan capas, tamaño de la red, número de parámetros ni tipo de encoder de observaciones.

Tampoco se publican datos de entrenamiento: ni número de tokens o pasos, ni composición del dataset, ni si hubo aprendizaje por refuerzo, imitación o destilación. La única información de procedencia es el repositorio upstream `Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_soft.onnx`, commit `ee9174c`, con SHA256 de pesos `449c352f8bf013e22b175c0cd55724cfb8821b4061e0ccfcf2adb1575a1c7794`.

## Capacidades

- Generación de acciones de control motriz para el robot `rp1_24dof` (24 grados de libertad) a partir de observaciones, a 250 Hz.
- Ejecución de una marcha suave etiquetada como `soft`, orientada a estabilidad más que a agilidad.
- Integración con el flujo de acciones de Robopoly: instalación (`action install`), verificación (`action verify`) y rollback (`action rollback`).
- Declaración de nivel de seguridad `S2`, con requisitos de confirmación humana y condiciones de operación.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo generativo de texto.

## Casos de uso

- Validación de pipeline de despliegue: instalar la política con `robopoly action install`, verificar integridad con `robopoly action verify` y comprobar que el robot ejecuta la marcha a 250 Hz en banco de pruebas, antes de cualquier prueba en entorno real.
- Pruebas de marcha en simulador: usar `models/policy_soft.onnx` y `configs/soft.yaml` para reproducir el comportamiento en simulación y comparar la política `soft` frente a otras variantes del mismo robot.
- Integración en el bucle de control de bajo nivel: consumir la salida `actions` a 250 Hz desde el stack de control del `rp1_24dof`, con el límite de corriente y el bus CAN monitorizados.
- Demostraciones controladas de locomoción: ejecutar la marcha suave en un entorno despejado, con parada de emergencia accesible y confirmación humana previa, dado el nivel `S2`.
- Referencia para desarrollo de nuevas políticas: servir como baseline `soft` contra el que comparar políticas propias entrenadas para el mismo robot y número de DOF.
- Gestión de versiones y rollback en flota: desplegar `@v1.0.0` en unidades de prueba y revertir con `robopoly action rollback` si la marcha no cumple los criterios de estabilidad.
- Auditoría de procedencia: verificar el SHA256 de los pesos y el commit upstream `ee9174c` como parte de un proceso de validación de artefactos robóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0.0 GB, lo que sugiere un modelo de muy baja huella, pero no se confirma.
- GPU recomendadas: no disponibles. La inferencia a 250 Hz sugiere que el cómputo debe ser ligero, pero no se especifica hardware objetivo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto es ONNX, por lo que es desplegable con runtimes ONNX estándar (ONNX Runtime, TensorRT) y con el stack `roboparty_inference`; el flujo oficial es el gestor de acciones de Robopoly.
- Latencia y throughput: la frecuencia de operación declarada es 250 Hz (periodo de 4 ms por ciclo de control); no se publican latencias medidas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables para el mismo robot (`rp1_24dof`) ni alternativas documentadas con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- Licencia de pesos `other` y pendiente de confirmación: no se garantiza el uso comercial. El código asociado es `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra.
- Estado de piloto público: el autor indica que el modelo se usa actualmente solo para validación pública, no para producción.
- Compatibilidad restringida: solo se garantiza el funcionamiento con la máquina `rp1_24dof` y 24 DOF; no hay evidencia de transferencia a otro hardware.
- Nivel de seguridad `S2`: requiere soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa; las acciones de riesgo solo deben ejecutarse con el área despejada y confirmación humana.
- Instalar no equivale a habilitar: la habilitación debe confirmarla el usuario antes de ejecutar.
- Las previsualizaciones, si existen, pueden ser de simulación y no representan el comportamiento en el robot real.
- No se documentan sesgos, tasa de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje; el riesgo relevante es de comportamiento físico no verificado.
- Ausencia de benchmarks y de datos de entrenamiento: no es posible evaluar la calidad de la política más allá de la validación empírica en banco.

## Enlaces

- Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-soft
- Repositorio upstream declarado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_soft.onnx`, commit `ee9174c`) — no se proporciona URL directa en la información disponible.
- Paper, blog o demo: no disponibles.
