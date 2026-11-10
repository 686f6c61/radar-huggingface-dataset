# wentywenty/robopoly-action-rp1-24dof-amp

## Resumen

RP1 24DOF AMP es una política de control motriz (locomoción) para el robot humanoide `rp1_24dof`, distribuida como un artefacto ONNX dentro del ecosistema Robopoly. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un controlador entrenado mediante *Adversarial Motion Priors* (AMP) que produce acciones articulares a partir de observaciones del robot. El autor es `wentywenty` y el artefacto deriva del repositorio upstream `Roboparty/roboparty_inference`, en la ruta `robots/rp1_24dof/models/policy_amp.onnx`.

El modelo se publica como parte de un piloto público en Hugging Face, con un tamaño de repositorio declarado de 0.0 GB y cero descargas en el momento de la consulta. Su relevancia es acotada: sirve como referencia para integración de políticas de locomoción en el stack Robopoly y para validación de compatibilidad con la plataforma hardware `rp1_24dof` de 24 grados de libertad.

La información disponible es muy limitada: la model card describe parámetros de ejecución, requisitos de seguridad y el procedimiento de instalación, pero no documenta arquitectura de red, datos de entrenamiento ni métricas de rendimiento. Todo dato no presente en la información proporcionada se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con AMP; topología de red no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | `other` para los pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_amp.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Robot objetivo | `rp1_24dof` (24 DOF) |
| Nivel de seguridad | S2 |
| SHA256 de pesos | `f6e1e9959f6b75dcdd8b31a66dc4899bf59b39cff4ab945bc7f939ea8d3c4398` |
| Commit upstream | `ee9174c` |

## Arquitectura y entrenamiento

La model card identifica la política como «AMP 行走策略» (política de marcha AMP), lo que sitúa el entrenamiento en el marco de *Adversarial Motion Priors*: una técnica de aprendizaje por refuerzo en la que un discriminador adversarial compara las transiciones del agente con las de un conjunto de datos de movimiento de referencia, de modo que la recompensa implícita empuja al robot hacia estilos de locomoción naturales y estables. Es un enfoque habitual en control de humanoides y cuadrúpedos.

No se especifica la topología de la red (MLP, transformer, red recurrente), el número de parámetros, el volumen ni la composición del dataset de movimientos de referencia, ni si se aplicaron etapas posteriores de ajuste. Tampoco se documenta el simulador empleado para el entrenamiento ni el procedimiento de transferencia sim-to-real. El artefacto se entrega exclusivamente como grafo ONNX con un fichero de configuración asociado (`configs/amp.yaml`), lo que sugiere un despliegue orientado a inferencia de baja latencia en el bucle de control a 250 Hz.

## Capacidades

- Generación de acciones articulares de locomoción para un humanoide de 24 grados de libertad a partir de un vector de observaciones `obs`.
- Control en bucle cerrado a 250 Hz, adecuado para lazos de control de robot en tiempo real.
- Política de marcha (walking) entrenada con *Adversarial Motion Priors*, orientada a producir locomoción con estilo natural.
- Integración con el stack Robopoly mediante los comandos `robopoly action install`, `verify` y `rollback`.
- Compatibilidad declarada exclusivamente con la plataforma `rp1_24dof`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo de lenguaje.
- No se documentan capacidades adicionales (carrera, saltos, manipulación) más allá de la marcha.

## Casos de uso

- Validación de locomoción en simulación: cargar `policy_amp.onnx` en un entorno simulado compatible con el stack Robopoly para comprobar que el robot `rp1_24dof` mantiene una marcha estable antes de pasar a hardware real.
- Punto de partida para transferencia sim-to-real: usar la política como línea base y ajustar parámetros de dominio (fricción, retardo de actuadores, ruido de sensores) hasta que el comportamiento en el robot físico sea aceptable.
- Pruebas de integración del pipeline de despliegue: verificar el ciclo `install` → `verify` → ejecución y el mecanismo de `rollback` en un entorno de laboratorio controlado.
- Referencia para desarrollo de nuevas políticas: emplear el par ONNX + YAML como plantilla de formato de entrega para políticas AMP adicionales del mismo robot.
- Evaluación comparativa de controladores: contrastar la marcha de esta política con otras políticas del ecosistema Robopoly sobre la misma plataforma para seleccionar la más adecuada a una tarea.
- Formación y demostración en laboratorio: ejecutar la política en un banco de pruebas con soporte mecánico, parada de emergencia accesible y limitación de corriente, conforme a los requisitos de seguridad S2 indicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de marcha, consumo energético ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se declara como 0.0 GB, lo que sugiere un artefacto de pesos muy pequeño, pero no se confirma el tamaño exacto del fichero ONNX.
- GPU recomendadas: no disponibles. Por la naturaleza del artefacto (política de control a 250 Hz), es plausible su ejecución en CPU o en aceleradores embebidos, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el artefacto se distribuye como ONNX y se ejecuta a través de la herramienta `robopoly action`, sobre el runtime de inferencia del proyecto `Roboparty/roboparty_inference`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la frecuencia de operación declarada es de 250 Hz (periodo de 4 ms por ciclo de control); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción comparables ni datos que permitan establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia de los pesos está marcada como `other` y pendiente de confirmación; el autor indica que actualmente solo se destina a validación pública. No debe asumirse uso comercial permitido.
- El código asociado se distribuye bajo `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra en un producto.
- Compatibilidad garantizada únicamente con el modelo de robot `rp1_24dof` y 24 DOF; su uso en otra plataforma no está soportado.
- Nivel de seguridad S2: requiere soporte mecánico fiable, parada de emergencia accesible, limitación de corriente de alimentación y realimentación CAN operativa antes de la ejecución.
- La instalación no implica habilitación: el usuario debe confirmar explícitamente la ejecución.
- Las acciones de riesgo solo deben ejecutarse con el área despejada y bajo confirmación humana.
- Las posibles previsualizaciones son de simulación y no representan el comportamiento en el robot físico.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser una política de control, el riesgo principal es la inestabilidad o la caída del robot ante condiciones no vistas durante el entrenamiento.
- No hay información sobre el dataset de movimientos de referencia, por lo que se desconoce la cobertura de terrenos, velocidades y perturbaciones.
- El proyecto se encuentra en fase de piloto público, con cero descargas y sin métricas publicadas; no es un artefacto validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-amp
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_amp.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
