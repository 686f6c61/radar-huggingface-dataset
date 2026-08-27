# Zarand3r/world-model-invariants

## Resumen

El repositorio `Zarand3r/world-model-invariants` aloja seis checkpoints congelados de world models basados en DreamerV3, junto con tres datasets de vídeo de péndulo, que sirven de material de soporte para el estudio *A conserved quantity inside a pixel-trained world model* y el artículo asociado *Correcting a learned physical invariant improves world-model rollouts*. El autor, Zarand3r, investiga si un modelo entrenado únicamente a predecir píxeles de vídeo es capaz de aprender una magnitud física conservada (la energía del péndulo) en su espacio latente, y si esa invariante se mantiene durante rollouts más allá de los datos de entrenamiento.

Cada checkpoint pesa 54 MB y contiene únicamente el world model (encoder, RSSM y decoder), sin actor ni crítico. Se entrenaron offline sobre un dataset fijo de vídeo de péndulo de 64×64 píxeles con acciones idénticamente cero, usando la implementación de referencia `NM512/dreamerv3-torch` en un commit concreto y con free bits a 0. La relevancia actual radica en que aborda la interpretabilidad de los world models y propone una corrección de invariantes aprendidas que mejora la precisión de las predicciones en rollouts, un tema central para el modelado del entorno en agentes basados en modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DreamerV3 (encoder CNN, RSSM recurrente, decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión nativa PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`torch.save`, archivos `.pt`) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a world models DreamerV3 completos, compuestos por un encoder convolucional que procesa observaciones de 64×64 píxeles, un modelo de estado recurrente (RSSM) que mantiene una representación latente temporal, y un decoder que reconstruye los píxeles. Se entrenaron offline sobre un dataset fijo de vídeo de péndulo con acciones nulas, usando la implementación de referencia `NM512/dreamerv3-torch` en el commit `6ef8646d807cd10ce0c88e10a7e943211e7fc44c` con sus valores por defecto, salvo los free bits que se fijaron a 0. No se aplicó RLHF ni DPO; el entrenamiento es puramente de predicción de observaciones.

Cada ejecución se limitó a 0,5 horas de cómputo, lo que explica las diferencias en el número de pasos de optimización entre semillas (entre 4710 y 6509). Los datasets de vídeo se generan de forma determinista mediante el script `scripts/make_pendulum_pixels.py` y se incluyen en el repositorio para reproducibilidad. La innovación técnica destacable es el análisis de invariantes latentes: se extrae un escalar de la representación interna sin etiquetas y se comprueba su correlación con la energía real del péndulo, así como su conservación bajo el mapa de transición del modelo.

## Capacidades

- Predicción de vídeo: el modelo genera observaciones futuras de péndulo a partir de estados latentes, con una ventana de entrenamiento de 120 pasos y evaluación en 200 pasos.
- Aprendizaje de invariantes físicas: en el péndulo conservativo, el modelo aprende una cantidad escalar en su espacio latente que correlaciona con la energía real (|rho|_E ≈ 0,97) y que su propio mapa de transición mantiene aproximadamente constante.
- Representación latente interpretable: la participación ratio (entre 8 y 8,5 de 12 dimensiones) sugiere que la invariante se distribuye en un subespacio reducido de la representación.
- Control experimental: los checkpoints con amortiguamiento (ζ = 0,03) sirven como control negativo, mostrando que la invariante no aparece cuando la dinámica no la conserva.
- Reproducibilidad: los datasets y los checkpoints están disponibles con hashes sha256 verificables, y el código de extracción está documentado en el repositorio GitHub.

## Casos de uso

- Investigación en interpretabilidad de world models: el modelo permite estudiar cómo y dónde se codifican magnitudes físicas conservadas en el espacio latente de un modelo entrenado solo con píxeles, lo que puede guiar el diseño de arquitecturas más transparentes.
- Validación de corrección de invariantes: el artículo asociado muestra que forzar la invariante aprendida durante los rollouts mejora la precisión de las predicciones a largo plazo; este repositorio proporciona los pesos para reproducir esos experimentos.
- Benchmark de dinámicas aprendidas: los checkpoints pueden usarse como referencia para comparar qué tan bien distintos world models capturan leyes de conservación en entornos simples.
- Desarrollo de agentes basados en modelos: aunque aquí no hay actor ni crítico, los world models congelados pueden integrarse en pipelines de planificación para entornos de control continuo, aprovechando la estabilidad de sus predicciones.
- Educación y divulgación: al ser un ejemplo mínimo y reproducible de DreamerV3 aplicado a un entorno clásico, sirve como material didáctico para entender el funcionamiento interno de los world models.
- Pruebas de robustez en dinámicas variadas: los datasets con y sin amortiguamiento permiten evaluar cómo cambia la calidad de las predicciones cuando la física subyacente se altera, útil para estudiar la generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no se trata de un modelo de lenguaje. Los datos de rendimiento disponibles se centran en la calidad de la invariante aprendida:

| Metrica | dreamer_ref_s3 | dreamer_ref_s4 | dreamer_ref_s5 | dreamer_damped_s0 | dreamer_damped_s1 | dreamer_damped_s2 |
|---|---|---|---|---|---|---|
| Correlacion |rho|_E | 0,973 | 0,967 | 0,975 | 0,018 | 0,090 | no disponible |
| Residual de emparejamiento | 0,8291 | 0,8615 | 0,8651 | no disponible | no disponible | no disponible |
| Participacion ratio (de 12) | 8,06 | 8,53 | 8,30 | no disponible | no disponible | no disponible |

Los valores de los checkpoints amortiguados se indican en la model card como control: la correlación cae a 0,018–0,090, lo que confirma que la invariante no se aprende cuando la dinámica no la conserva. No se dispone de métricas de latencia ni throughput.

## Requisitos de hardware

- Tamaño de cada checkpoint: 54 MB, lo que implica un modelo muy ligero en comparación con LLMs.
- VRAM estimada: no disponible oficialmente, pero por el tamaño y la arquitectura (encoder/decoder CNN + RSSM), es razonable que quepa en cualquier GPU consumer con al menos 2 GB de VRAM, aunque no se ha verificado.
- GPUs recomendadas: cualquier GPU moderna (serie RTX 20xx o superior) debería ser suficiente para inferencia; el entrenamiento se realizó con un presupuesto de 0,5 horas por ejecución, lo que sugiere que no requiere hardware de gama alta.
- Opciones de despliegue: al ser checkpoints de PyTorch, se pueden cargar directamente con `torch.load` y el adaptador `DreamerV3Adapter`; no se mencionan formatos GGUF, ONNX ni herramientas como vLLM u Ollama.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una inferencia rápida, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (world models con análisis de invariantes). El propio DreamerV3 original es la base, pero no se han publicado comparaciones cuantitativas con otras implementaciones. Por tanto, la comparativa se limita a señalar que este repositorio ofrece una variante específica de DreamerV3 con un enfoque de interpretabilidad, sin datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El estudio se limita a un único entorno (gymnasium `Pendulum-v1` con evolución libre), una sola arquitectura y tres semillas por brazo experimental, por lo que no se puede generalizar a dinámicas más ricas o a otros tipos de world models.
- El presupuesto de entrenamiento es corto (0,5 horas por ejecución), lo que puede afectar a la convergencia completa del modelo.
- No se incluyen actor ni crítico, por lo que el modelo no es directamente utilizable para control o planificación sin componentes adicionales.
- Los checkpoints están en formato PyTorch nativo; no se proporcionan versiones cuantizadas ni convertidas a otros formatos, lo que limita su uso en entornos de producción con herramientas específicas.
- No se han documentado sesgos específicos, pero al tratarse de un entorno sintético, los riesgos de alucinación o sesgo social no son aplicables.
- La licencia MIT permite uso comercial, pero el modelo es puramente investigativo y no ofrece garantías de rendimiento en aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zarand3r/world-model-invariants
- Repositorio GitHub (código, logs y paper): https://github.com/Zarand3r/world-model-invariants
- Artículo en arXiv (PDF): https://arxiv.org/pdf/2608.23526v1
- Resumen del artículo en arxivtldr: https://arxivtldr.org/abs/2608.23526
- Análisis en blog (st-hakky): https://book.st-hakky.com/en/news/physical-invariant-fix-boosts-rollouts
- Implementación de referencia DreamerV3: https://github.com/NM512/dreamerv3-torch
