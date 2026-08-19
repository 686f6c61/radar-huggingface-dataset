# zetliu2001/EvoVLA-v2

## Resumen

EvoVLA-v2 es un modelo de visión-lenguaje-acción (VLA) diseñado para manipulación robótica de largo horizonte, desarrollado por ZetingLiu y colaboradores. El modelo aborda el problema de la "alucinación de etapas" (stage hallucination), un fenómeno en el que los agentes explotan señales de evaluación gruesas para aparentar progreso sin completar realmente las tareas. Para ello, incorpora un camino lateral de aprendizaje por refuerzo autosupervisado (self-supervised RL, SSRL) que se post-entrena sobre políticas VLA existentes, como las basadas en π₀.₅, utilizando el framework RLinf.

El repositorio de HuggingFace `zetliu2001/EvoVLA-v2` no contiene el modelo completo, sino únicamente los assets auxiliares necesarios para la rama contrastiva del SSRL: un espejo de los pesos de R3M con backbone ResNet18 (originalmente distribuidos por Facebook Research). Estos pesos se usan como backbone visual congelado en la rama `r_con`. La arquitectura completa del VLA, sus parámetros y su contexto de entrenamiento no se documentan en este repositorio; la información principal proviene del paper de EvoVLA (v1) y del repositorio de GitHub asociado.

La relevancia actual de EvoVLA-v2 radica en su enfoque para mejorar la robustez en tareas robóticas de múltiples pasos, combinando recompensas alineadas por etapas, exploración basada en poses y memoria selectiva. Aunque el repositorio es solo un conjunto de assets, sirve como componente de un sistema más amplio que ha demostrado mejoras sustanciales en entornos como Discoverse-L y en transferencia sim2real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone visual congelado R3M (ResNet18) para la rama SSRL; arquitectura completa no documentada en este repositorio |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre instrucciones en lenguaje natural, pero no se especifican idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (archivos `model.pt` y `config.yaml` para R3M; el resto del modelo no se incluye) |

## Arquitectura y entrenamiento

Según el paper de EvoVLA (arXiv:2511.16166), el modelo base es un VLA que se post-entrena mediante un mecanismo de SSRL. La arquitectura completa no se detalla en la información disponible, pero se sabe que utiliza un backbone visual congelado R3M (ResNet18) en la rama contrastiva del SSRL, cuyos pesos se distribuyen en este repositorio. El entrenamiento se realiza sobre políticas VLA previamente ajustadas con SFT (como el checkpoint π₀.₅ CALVIN ABC-D SFT de RLinf) y emplea recompensas alineadas por etapas para mitigar la alucinación de etapas, junto con exploración basada en poses (pose-grounded exploration) y memoria selectiva.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El repositorio de HuggingFace solo proporciona los pesos de R3M, que se cargan mediante el paquete `r3m` desde `~/.r3m/r3m_18/`.

## Capacidades

- Generacion de acciones robóticas (visión-lenguaje-acción) para manipulación de objetos en tareas de largo horizonte.
- Razonamiento multi-paso en entornos robóticos, con mitigación de la alucinación de etapas mediante recompensas autosupervisadas.
- Exploración basada en poses para mejorar la cobertura de estados en entornos de alta dimensión parcialmente observables.
- Transferencia sim2real: el modelo ha demostrado robustez al trasladar políticas entrenadas en simulación a entornos reales.
- No se documentan capacidades de tool calling, agentes generales, generación de texto libre ni soporte multilingüe más allá de instrucciones robóticas.

## Casos de uso

- Manipulación robótica de largo horizonte: el modelo puede ejecutar secuencias de múltiples pasos (p. ej., recoger, colocar, apilar) en entornos simulados como Discoverse-L, donde las recompensas por etapa evitan que el agente se detenga prematuramente.
- Post-entrenamiento de políticas VLA existentes: los assets de R3M permiten integrar la rama SSRL sobre checkpoints como π₀.₅, mejorando su rendimiento en tareas complejas sin reentrenar desde cero.
- Investigación en RL para robótica: el framework SSRL puede usarse como banco de pruebas para estudiar el efecto de recompensas autosupervisadas y exploración basada en poses en el aprendizaje por refuerzo de agentes encarnados.
- Transferencia sim2real: las políticas entrenadas con EvoVLA-v2 pueden desplegarse en robots físicos, aprovechando la robustez demostrada en el paper para reducir la brecha de simulación a realidad.
- Evaluación de alucinación de etapas: el modelo sirve como referencia para medir y comparar el comportamiento de otros VLA en tareas donde las señales de evaluación son engañosas.
- Desarrollo de sistemas de control jerárquico: la combinación de un VLA base con un módulo SSRL puede integrarse en arquitecturas robóticas que requieran planificación de alto nivel y control de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de EvoVLA menciona mejoras sustanciales en Discoverse-L y robustez sim2real, pero no se proporcionan cifras concretas (tasas de éxito, métricas de progreso, etc.) en los materiales citados. Se recomienda consultar el artículo completo para obtener datos numéricos.

## Requisitos de hardware

- no disponible: el repositorio no especifica requisitos de hardware para el modelo completo. Dado que se trata de un VLA con componentes de visión y lenguaje, es previsible que requiera una GPU con al menos 16-24 GB de VRAM para inferencia en tiempo real, pero este dato no está confirmado.
- Los assets de R3M (ResNet18) son ligeros (el repositorio pesa 0.4 GB) y pueden ejecutarse en CPU para extracción de características, aunque el VLA completo probablemente necesite aceleración GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El framework RLinf sugiere un entorno de entrenamiento específico, no un servidor de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos similares. El propio EvoVLA se basa en π₀.₅ (un VLA de Physical Intelligence), pero este repositorio no incluye el modelo completo ni sus métricas. Otros VLA como OpenVLA o RT-2 podrían ser comparables en términos de tarea, pero no hay datos de rendimiento en este contexto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EvoVLA-v2 (assets) | no disponible | no disponible | MIT | Repositorio de assets, modelo completo en GitHub |
| π₀.₅ (base) | no disponible | no disponible | no disponible | Checkpoints SFT en HuggingFace (RLinf) |
| OpenVLA | 7B | no disponible | MIT | Modelo completo en HuggingFace |

## Limitaciones y advertencias

- Este repositorio de HuggingFace contiene únicamente los pesos de R3M (ResNet18) y su configuración; no incluye el modelo VLA completo ni los scripts de entrenamiento. Para usar EvoVLA-v2 es necesario acceder al repositorio de GitHub y a los checkpoints de RLinf.
- No se documentan los sesgos potenciales del modelo. Al estar entrenado principalmente en entornos robóticos simulados, puede tener un rendimiento degradado en escenarios con distribuciones de datos muy diferentes.
- Riesgo de alucinación: aunque el diseño mitiga la alucinación de etapas, no se garantiza su eliminación completa en todos los entornos.
- Limitaciones de idioma: no se especifican los idiomas soportados para las instrucciones; probablemente esté limitado a inglés u otros idiomas presentes en los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero los assets de R3M provienen de Facebook Research con la misma licencia; se recomienda revisar los términos del upstream.
- Para producción, se necesita acceso al framework RLinf y a los checkpoints base (π₀.₅ SFT), que pueden tener requisitos adicionales de licencia o distribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zetliu2001/EvoVLA-v2
- Repositorio GitHub: https://github.com/ZetingLiu/EvoVLA-v2
- Paper (arXiv): https://arxiv.org/abs/2511.16166
- Página del proyecto: https://aigeeksgroup.github.io/EvoVLA/
- Checkpoint base π₀.₅ SFT: https://huggingface.co/RLinf/RLinf-Pi05-CALVIN-ABC-D-SFT
- Tokenizer OpenPI: https://huggingface.co/RLinf/openpi_tokenizer
- CLIP text encoder: https://huggingface.co/openai/clip-vit-base-patch32
