# wentywenty/robopoly-action-rp1-24dof-rough

## Resumen

RP1 24DOF Rough es una política de control motriz (policy) para un robot humanoide de 24 grados de libertad, publicada en Hugging Face por el usuario wentywenty bajo el paraguas del proyecto Robopoly. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de inferencia en formato ONNX que mapea observaciones del robot (`obs`) a acciones de control (`actions`) a una frecuencia de 250 Hz, diseñado específicamente para la marcha en terreno irregular (rough terrain). El modelo se distribuye como una "acción" instalable mediante la CLI de Robopoly, con comandos de instalación, verificación y rollback.

El modelo deriva de un artefacto upstream del repositorio `Roboparty/roboparty_inference`, en la ruta `robots/rp1_24dof/models/policy_rough.onnx`, en el commit `ee9174c`, con un hash SHA256 documentado para verificación de integridad. Está etiquetado con nivel de seguridad S2, lo que implica que su ejecución requiere confirmación humana explícita, condiciones de soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa.

Su relevancia es acotada pero concreta: cubre el nicho de políticas de locomoción empaquetadas y verificables para hardware humanoide específico, con un flujo de instalación reproducible. La información pública disponible es muy escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, y la licencia de los pesos está pendiente de confirmación según el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control en ONNX; no se documenta la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de control motriz, no de texto) |
| Tipos de cuantización | no disponible (se distribuye un artefacto ONNX; no se listan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other` para los pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_rough.onnx`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la política: no se especifica si se trata de un perceptrón multicapa, una red recurrente, un transformer de decisión o una política entrenada por aprendizaje por refuerzo con una topología concreta. Tampoco se documentan el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o episodios, ni si se emplearon técnicas de RL, imitación o ajuste fino posterior.

Los únicos datos técnicos verificables son operativos: la política consume un vector de observaciones (`obs`) y produce acciones (`actions`) a 250 Hz, está empaquetada en ONNX para inferencia portable, y va acompañada de un fichero de configuración (`configs/rough.yaml`) que define los parámetros de ejecución. El modelo está restringido al chasis `rp1_24dof` con 24 grados de libertad y clasificado en el nivel de seguridad S2 del ecosistema Robopoly. Cualquier detalle sobre innovaciones de entrenamiento (recompensas, currículo de terrenos, dominio de aleatorización) no está disponible.

## Capacidades

- Generación de acciones de control motriz para locomoción bípeda en terreno irregular, a partir de observaciones del robot.
- Inferencia a 250 Hz, adecuada para bucles de control en tiempo real de un humanoide.
- Compatibilidad declarada exclusivamente con el chasis `rp1_24dof` de 24 DOF.
- Ejecución portable mediante ONNX, sin dependencia de un runtime de aprendizaje profundo específico más allá del soportado por el ecosistema Robopoly.
- Flujo de ciclo de vida gestionado por CLI: instalación, verificación de integridad y rollback.
- Clasificación de seguridad S2 con requisitos operativos explícitos (soporte fiable, parada de emergencia, limitación de corriente, realimentación CAN).
- No dispone de capacidades de texto, razonamiento, código, visión, audio, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Locomoción en terreno irregular en laboratorio: la política se instala con `robopoly action install` y se ejecuta sobre el chasis `rp1_24dof` para validar la marcha en superficies no uniformes, aprovechando su frecuencia de 250 Hz para el bucle de control.
- Verificación de integridad en pipelines de despliegue: el comando `robopoly action verify` permite comprobar el artefacto antes de cargarlo en el robot, y el hash SHA256 documentado (`0b85b97b...f444d`) permite auditar que el fichero ONNX no ha sido alterado.
- Pruebas de regresión de políticas: al estar empaquetada como acción versionada (`@v1.0.0`) con rollback disponible, encaja en flujos de comparación entre versiones de políticas de marcha sobre el mismo hardware.
- Investigación en control de humanoides: sirve como referencia reproducible de una política de locomoción con requisitos de seguridad documentados, útil para comparar con políticas propias en el mismo chasis.
- Validación en simulación previa a pruebas reales: la model card advierte de que las previsualizaciones existentes pueden ser de simulación y no representan el comportamiento en hardware real, por lo que el caso de uso natural es simular primero y validar después con supervisión humana.
- Formación y demostraciones controladas: con espacio despejado y confirmación humana explícita, la política puede emplearse en demostraciones de marcha del humanoide, dado su nivel de seguridad S2 y la exigencia de parada de emergencia accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito de locomoción, velocidad de marcha, consumo energético ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y el artefacto es un único fichero ONNX; por el tipo de tarea (política de control a 250 Hz) es previsible que sea ligero, pero no se publica el tamaño del fichero ni el número de parámetros.
- GPU recomendadas: no disponible. No se documenta si la inferencia requiere GPU o puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX a través del ecosistema Robopoly (`robopoly action install` / `verify` / `rollback`), con configuración en `configs/rough.yaml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la única cifra publicada es la frecuencia de operación de 250 Hz (periodo de 4 ms). No se publican latencias de inferencia ni throughput medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables de otros autores, ni datos de parámetros, contexto o rendimiento de alternativas. La comparación solo puede establecerse contra el propio upstream (`Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_rough.onnx`, commit `ee9174c`), del que este artefacto es una redistribución empaquetada.

## Limitaciones y advertencias

- La licencia de los pesos figura como `other` y el propio autor indica que está pendiente de confirmación; actualmente el artefacto se describe como "solo para validación pública". No hay garantía de uso comercial.
- El código asociado se distribuye bajo `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra en un producto.
- Compatibilidad garantizada únicamente con el chasis `rp1_24dof` y 24 DOF; no se declara soporte para otras morfologías.
- Clasificación de seguridad S2: requiere confirmación humana antes de habilitar, soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa. Las acciones de riesgo solo deben ejecutarse con el área despejada y confirmación manual.
- Las previsualizaciones, si existen, pueden corresponder a simulación y no representan el comportamiento en hardware real.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; el riesgo relevante es físico (caídas, movimientos no deseados) y debe mitigarse con los protocolos de seguridad indicados.
- Ausencia total de métricas de rendimiento publicadas: no hay evidencia cuantitativa de robustez en terreno irregular más allá de la etiqueta del artefacto.
- Repositorio sin descargas ni interacciones y con tamaño de 0.0 GB registrado, lo que sugiere un empaquetado mínimo o incompleto; conviene verificar el contenido real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-rough
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_rough.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales.
