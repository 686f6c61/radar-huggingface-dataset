# superdigger/Brain-5D

## Resumen

Brain-5D es un simulador experimental de redes neuronales espiking (spiking neural networks) desarrollado por Thomas Heisig y publicado bajo el nombre de usuario superdigger en Hugging Face. No se trata de un modelo de aprendizaje automático preentrenado al uso, sino de una plataforma de simulación neurocientífica que opera en un espacio coordenado 5D disperso, combinando dinámicas de disparo neuronal, plasticidad dependiente del tiempo de disparo (STDP), regulación homeostática, auto-organización estructural y persistencia determinista. El proyecto se distribuye como código fuente con licencia MIT y está orientado a la investigación en neurociencia computacional y sistemas neuromórficos.

La relevancia actual de Brain-5D radica en su enfoque integrador: no solo simula la actividad neuronal, sino que incorpora mecanismos de plasticidad estructural y homeostasis que permiten observar cómo la red se reorganiza a lo largo del tiempo. Incluye un panel de operador con visualización en tiempo real y un marco de evidencia científica (B5D-SEF) para experimentos reproducibles. El repositorio tiene un tamaño de 0,3 GB y la versión indicada es 0.5.0-alpha.5, con 379 pruebas automatizadas superadas. Es importante señalar que el proyecto no reivindica AGI, consciencia ni equivalencia biológica, y se encuentra en fase de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal espiking (neuronas Izhikevich regular-spiking) en espacio 5D disperso |
| Parametros totales | no disponible (no es un modelo con pesos entrenados; es un simulador) |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | ingles (interfaz y documentacion; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no aplica; utiliza snapshots `.b5d`, diarios de estado delta, diarios estructurales y checkpoints |

## Arquitectura y entrenamiento

Brain-5D implementa una arquitectura de red neuronal espiking basada en el modelo de Izhikevich para neuronas regulares, organizadas en un espacio coordenado de cinco dimensiones con representación dispersa. El sistema integra varios módulos: un núcleo neuronal (NeuralNetwork), un motor de homeostasis que regula tasas de disparo, umbrales adaptativos y consumo energético, y un motor de aprendizaje que aplica STDP con trazas de elegibilidad con signo. Además, incluye un subsistema de auto-organización que propone cambios estructurales (creación o poda de neuronas y sinapsis) bajo políticas de validación de seguridad, y una capa de persistencia que guarda el estado completo mediante snapshots `.b5d` y diarios incrementales.

El "entrenamiento" en este contexto no se refiere a un proceso de optimización de pesos sobre un dataset, sino a la simulación de dinámicas neuronales donde la plasticidad sináptica (STDP) y la homeostasis modifican la conectividad y los umbrales de forma autónoma. El sistema admite aprendizaje por refuerzo (pipeline_tag: reinforcement-learning) y permite ejecutar simulaciones con o sin panel de control. No se especifican datos de entrenamiento, número de tokens ni composición de datasets, ya que no es un modelo entrenado con corpus textuales. La innovación técnica principal reside en la combinación de plasticidad estructural, homeostasis y persistencia determinista en un espacio 5D, junto con un dashboard de operador para supervisión en tiempo real.

## Capacidades

- Simulación de redes neuronales espiking con neuronas Izhikevich regular-spiking en un espacio 5D disperso.
- Aprendizaje por plasticidad dependiente del tiempo de disparo (STDP) con trazas de elegibilidad con signo.
- Regulación homeostática: control de tasa de disparo objetivo, umbrales adaptativos y homeostasis energética.
- Plasticidad estructural: creación y poda controlada de neuronas y sinapsis, con deshacer persistente.
- Auto-organización dirigida por políticas con validación de seguridad para cambios estructurales.
- Persistencia determinista mediante snapshots `.b5d`, diario de estado delta, diario estructural y checkpoints en tiempo de ejecución.
- Panel de operador local con visualización en tiempo real, mapas de calor, aprobación de cambios estructurales y proyección en vivo (accesible en `http://127.0.0.1:8765`).
- Marco de evidencia científica integrado (B5D-SEF) para experimentos reproducibles.
- Ejecución en modo headless (sin dashboard) para simulaciones automatizadas.
- Soporte de configuración mediante archivos YAML.

## Casos de uso

- Investigación en neurociencia computacional: Brain-5D permite estudiar cómo la plasticidad estructural y la homeostasis interactúan en redes espiking, facilitando experimentos sobre auto-organización y adaptación sin necesidad de hardware neuromórfico especializado.
- Simulación de aprendizaje por refuerzo en redes espiking: gracias a su pipeline de reinforcement-learning, puede utilizarse para explorar algoritmos de aprendizaje basados en STDP y recompensas en entornos simulados.
- Validación de hipótesis sobre plasticidad sináptica: el marco de evidencia científica (B5D-SEF) y la persistencia determinista permiten reproducir experimentos y auditar los cambios estructurales a lo largo del tiempo.
- Educación en sistemas neuromórficos: su panel de operador visual y la documentación asociada lo convierten en una herramienta didáctica para explicar dinámicas de neuronas espiking, STDP y homeostasis en cursos universitarios.
- Desarrollo de algoritmos de auto-organización: los módulos de propuesta estructural y validación de seguridad pueden servir como banco de pruebas para políticas de crecimiento y poda en redes neuronales artificiales.
- Prototipado de sistemas de control neuromórfico: aunque no es un modelo de producción, puede emplearse para simular controladores basados en neuronas espiking en entornos de investigación antes de implementarlos en hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto reporta 379 pruebas automatizadas superadas, pero no proporciona métricas de rendimiento como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje ni de generación de código. Tampoco se ofrecen datos de latencia o throughput de simulación.

## Requisitos de hardware

- No se especifican requisitos mínimos de hardware en la documentación proporcionada.
- Dado que es un simulador en Python (3.11+), es probable que funcione en CPU convencional, pero no hay datos confirmados sobre memoria RAM, núcleos o GPU necesarios.
- El tamaño del repositorio es de 0,3 GB, lo que sugiere que la instalación es ligera, pero los requisitos de ejecución dependen del tamaño de la red simulada y del número de ticks.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de inferencia de lenguaje.
- Para simulaciones grandes, se recomendaría un equipo con suficiente memoria RAM y posiblemente GPU si se implementan aceleraciones, pero esto no está documentado.

## Comparativa con modelos similares

No disponible. Brain-5D es un simulador de redes neuronales espiking, una categoría diferente a los modelos de lenguaje o visión. No se han identificado en la información proporcionada otros simuladores comparables con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Brain-5D es un proyecto de investigación en fase alfa (versión 0.5.0-alpha.5); no está pensado para uso en producción ni para tareas de procesamiento de lenguaje natural.
- No es un modelo de lenguaje: no genera texto, no comprende instrucciones en lenguaje natural ni ofrece capacidades de razonamiento simbólico.
- El autor declara explícitamente que el sistema no reivindica AGI, consciencia, sentiencia ni equivalencia biológica.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos éticos, al no ser un modelo generativo.
- La licencia MIT permite uso comercial, pero al ser un simulador, su aplicabilidad comercial es limitada y depende del contexto de investigación.
- La documentación está en inglés; no hay soporte oficial en otros idiomas.
- No se garantiza estabilidad de la API ni compatibilidad hacia atrás en esta fase de desarrollo.
- El número de descargas y likes es cero, lo que indica una adopción muy temprana y una comunidad de usuarios aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/superdigger/Brain-5D
- Repositorio GitHub (referenciado en la model card): https://github.com/Thomas-Heisig/Brain-5D
- Documentación interna: `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/B5D_FORMAT.md` (accesibles tras clonar el repositorio)
