# wentywenty/roboparty-action-rpo-amp

## Resumen

RPO AMP es una política de control motriz (locomoción y marcha) para el robot humanoide `rpo`, distribuida como un artefacto ONNX dentro del ecosistema Roboparty. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política de acciones que mapea observaciones (`obs`) a comandos de actuación (`actions`) a una frecuencia de control de 250 Hz, pensada para ejecutarse en el lazo de control del robot. Lo publica el usuario `wentywenty` como acción instalable mediante la CLI de Roboparty, con versiones etiquetadas y soporte de verificación y rollback.

La relevancia de esta ficha es acotada: se trata de un artefacto de robótica con licencia de pesos pendiente de confirmación y en fase de "piloto público" en Hugging Face. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB reportado, lo que sugiere que el binario podría no estar materializado en el repo o que el tamaño es inferior a la resolución de reporte. No hay información sobre arquitectura de red, número de parámetros, datos de entrenamiento ni benchmarks.

Por tanto, esta ficha documenta lo que el autor declara (modelo `rpo`, 23 grados de libertad, nivel de seguridad S2, entrada `obs` y salida `actions`, frecuencia 250 Hz) y marca explícitamente como "no disponible" todo lo que no consta. No debe interpretarse como una evaluación de calidad del controlador: no hay métricas publicadas de robustez, tasa de caídas ni transferencia sim-a-real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se especifica la red subyacente) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | código: GPL-3.0-only; pesos: `other` (pendiente de confirmación) |
| Formato de pesos | ONNX (`models/policy_amp.onnx`) |
| Frecuencia de control | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Robot objetivo | `rpo` |
| Grados de libertad (DOF) | 23 |
| Nivel de seguridad declarado | S2 |
| Configuración de inferencia | `configs/amp.yaml` |
| Hash SHA256 de pesos | `bcded9c9b87aea055326c72b51060770f37af23aaa6b4fdeaff34db5ffa9bd2d` |
| Upstream | `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_amp.onnx`, commit `ee9174c` |
| Versión publicada | `v1.0.0` |
| Tamaño del repo | 0.0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura de la red neuronal que implementa la política. El artefacto distribuido es un grafo ONNX denominado `policy_amp.onnx`, con una interfaz de una entrada (`obs`) y una salida (`actions`), lo que es consistente con una política de control por imitación o por aprendizaje por refuerzo, pero el autor no detalla la topología (MLP, red recurrente, transformer ligero u otra), ni el número de capas, ni las dimensiones del vector de observación o de acción.

Tampoco hay datos sobre el entrenamiento: no consta el número de pasos, el simulador utilizado, la composición del dataset de demostraciones, ni si se emplearon técnicas de regularización como AMP (en el contexto de robótica, habitualmente *Adversarial Motion Priors* para estilizar la marcha, aunque el autor no lo explicita). Las siglas "RPO" y "AMP" aparecen en el nombre del artefacto y en los tags, pero no se desarrollan en la model card. No hay información sobre calibración sim-a-real, dominio de aleatorización ni proceso de validación en hardware.

## Capacidades

- Generación de comandos de actuación para locomoción/marcha del humanoide `rpo` a 250 Hz.
- Mapeo directo de observaciones a acciones mediante un grafo ONNX, apto para inferencia en el lazo de control.
- Instalación, verificación y rollback gestionados por la CLI de Roboparty (`action install`, `action verify`, `action rollback`).
- Compatibilidad declarada exclusivamente con el modelo `rpo` y 23 DOF.
- Clasificación de seguridad S2, con requisitos de confirmación humana antes de la ejecución.
- No consta soporte de tool calling, agentes, multilingüismo, visión, audio ni modos de razonamiento: no aplica a este tipo de artefacto.

## Casos de uso

- **Marcha bípeda en el humanoide `rpo` en entorno controlado**: la política recibe observaciones del robot y emite acciones a 250 Hz, lo que la hace adecuada para el control de locomoción en tiempo real sobre el hardware declarado, siempre que se cumplan las precondiciones de seguridad (soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN correcta).
- **Validación en simulación antes de despliegue**: el artefacto ONNX puede cargarse en un simulador compatible con el robot `rpo` para comprobar la interfaz `obs` → `actions` y el comportamiento de la política antes de habilitarla en hardware real, dado que el autor advierte que las previsualizaciones en simulación no representan el comportamiento real.
- **Integración en pipelines de Roboparty**: mediante `roboparty action install wentywenty/roboparty-action-rpo-amp@v1.0.0` se puede incorporar la política a un flujo de despliegue versionado, con verificación de integridad y rollback a la versión anterior si falla.
- **Pruebas de regresión de control**: al estar versionada y con SHA256 de pesos publicado, permite fijar una versión concreta de la política y comparar su comportamiento frente a otras versiones en el mismo banco de pruebas.
- **Investigación en control de humanoides**: sirve como referencia reproducible de una política de marcha para un robot de 23 DOF, útil para comparar interfaces de observación/acción y frecuencias de control en experimentos académicos.
- **Demostraciones y pilotos públicos**: el autor la describe como "piloto público" en Hugging Face, por lo que encaja en escenarios de evaluación externa y revisión por parte de la comunidad, no en producción crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no consta el tamaño del grafo ni el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser una política de control a 250 Hz, el requisito dominante suele ser la latencia determinista más que la capacidad de cómputo, pero no hay datos publicados.
- Opciones de despliegue: inferencia ONNX (runtime no especificado); instalación y verificación mediante la CLI de Roboparty.
- Latencia y throughput: no disponibles; únicamente se declara la frecuencia de operación de 250 Hz.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de locomoción para el humanoide `rpo` o artefactos equivalentes del ecosistema Roboparty) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- **Licencia de pesos sin confirmar**: el autor indica explícitamente que la licencia de los pesos está pendiente de confirmación y que actualmente el artefacto es solo para validación pública. El código se declara GPL-3.0-only, pero los pesos quedan bajo `other`. No debe asumirse uso comercial permitido.
- **Compatibilidad restringida**: solo se garantiza compatibilidad con el modelo `rpo` y 23 DOF; no se declara soporte para otras plataformas.
- **Nivel de seguridad S2**: el propio autor clasifica la acción como S2 y exige confirmación humana, espacio despejado, soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN correcta antes de ejecutarla.
- **Instalar no es habilitar**: la instalación del artefacto no implica su activación; la habilitación requiere confirmación explícita del usuario.
- **Previsualizaciones no representativas**: cualquier preview en simulación no garantiza el comportamiento en hardware real.
- **Sin métricas de robustez**: no hay benchmarks, tasas de éxito, ni datos de transferencia sim-a-real publicados.
- **Madurez baja**: 0 descargas y 0 likes en el momento de la consulta, y tamaño de repo reportado de 0.0 GB, lo que conviene verificar antes de asumir que el binario está presente y es íntegro.
- **Riesgo de alucinación y sesgos**: no aplica en el sentido de modelos generativos; el riesgo análogo es un comportamiento de control impredecible fuera del dominio de entrenamiento, no documentado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-amp
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rpo/models/policy_amp.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
