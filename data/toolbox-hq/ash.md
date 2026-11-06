# Toolbox-HQ/ASH

## Resumen

ASH (Agents that Self-Hone in Long-Horizon Worlds) es un sistema agéntico de investigación desarrollado por Toolbox-HQ (Benjamin Schneider, Xavier Schneider, Victor Zhong y Sun Sun), presentado en NeurIPS 2026. No es un modelo de lenguaje al uso, sino un agente multimodal completo que aprende una política de horizonte largo a partir de vídeo de internet sin etiquetar, sin recompensas diseñadas a mano y sin anotación experta. Su dominio de demostración es *Pokémon Emerald*, juego que es capaz de jugar durante horas de forma autónoma.

El sistema combina tres modelos base: Qwen3-1.7B como columna vertebral de lenguaje, SigLIP-base-patch16-224 como codificador visual y DINOv2-base para los embeddings de recuperación y de momentos clave. Sobre ellos se construye una política (`LMObjectiveAgent`) que condiciona sus decisiones en los fotogramas actuales, las acciones recientes y hasta diez imágenes de momentos clave recuperadas de una memoria a largo plazo.

La relevancia del artefacto publicado es doble: por un lado, libera diez checkpoints de una única ejecución de auto-mejora, cada uno correspondiente a un ciclo de bootstrap en el que el agente, al quedarse atascado, entrena un modelo de dinámica inversa (IDM) con sus propias trayectorias, recupera vídeo similar de internet, lo etiqueta con el IDM y actualiza su política. Por otro, incluye el estado de guardado inicial del juego y los tres modelos base sin modificar, de modo que el agente puede ejecutarse íntegramente en local (salvo la ROM, que debe aportar el usuario).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema agéntico multimodal: política `LMObjectiveAgent` que combina SigLIP (visión) + Qwen3-1.7B (lenguaje), más un IDM basado en ventanas de fotogramas y un clusterizador HDBSCAN para memoria de momentos clave |
| Parametros totales | 1.7B en la columna vertebral de lenguaje (Qwen3-1.7B); el tamaño total del sistema no se detalla. `agent.safetensors` ocupa 3.0 GB e `idm.pt` 1.8 GB por checkpoint |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors sin cuantización indicada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (los tres modelos base conservan Apache 2.0) |
| Formato de pesos | `safetensors` (política), `pt` (IDM), `pkl` (gestor de momentos clave con HDBSCAN de cuML) |

## Arquitectura y entrenamiento

ASH no entrena un transformer desde cero: ensambla un codificador visual SigLIP-base-patch16-224 con un modelo de lenguaje Qwen3-1.7B para formar la política `LMObjectiveAgent`, que recibe los fotogramas actuales, el historial reciente de acciones y hasta diez imágenes de momentos clave de la memoria a largo plazo. Paralelamente, un Inverse Dynamics Model (IDM) predice una de las nueve entradas posibles de Game Boy Advance a partir de una ventana de fotogramas, y un clusterizador HDBSCAN (vía cuML) sobre embeddings de DINOv2-base define y mantiene el conjunto de momentos clave descubiertos de forma no supervisada.

El entrenamiento es un bucle de auto-mejora sin recompensas ni anotaciones: cuando los agentes se atascan, ASH entrena el IDM con sus propias trayectorias, recupera vídeo de gameplay visualmente similar de internet, lo etiqueta con el IDM y actualiza la política. Los diez checkpoints publicados corresponden a diez bootstraps sucesivos de una misma ejecución con cuatro agentes paralelos compartiendo política; el número de clústeres de momentos clave crece de 467 (checkpoint-1) a 923 (checkpoint-10). Cada checkpoint se empaqueta como estado de inicio de partida, con la memoria a largo plazo vacía, de modo que cualquiera de ellos puede lanzarse desde el principio del juego.

## Capacidades

- Juego autónomo de *Pokémon Emerald* durante horas mediante control directo del emulador mGBA.
- Toma de decisiones de horizonte largo condicionada por memoria de momentos clave (hasta diez imágenes recuperadas).
- Aprendizaje auto-supervisado a partir de vídeo de internet sin etiquetar: recuperación visual, etiquetado con IDM y actualización de política.
- Modelado de dinámica inversa: predicción de una de las nueve entradas de Game Boy Advance desde una ventana de fotogramas.
- Descubrimiento no supervisado de eventos relevantes mediante clustering HDBSCAN sobre embeddings de DINOv2.
- Procesamiento multimodal conjunto de imagen (SigLIP) y texto (Qwen3-1.7B).
- No se documenta soporte de tool calling, function calling, agentes multi-paso genéricos ni capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación en agentes auto-mejorables: el sistema completo sirve como banco de pruebas reproducible para estudiar bucles de auto-mejora sin recompensas, comparando los diez checkpoints publicados y su evolución en número de momentos clave.
- Estudio de aprendizaje por imitación desde vídeo no etiquetado: el pipeline IDM + recuperación + reetiquetado puede reutilizarse como referencia metodológica para otros dominios con vídeo abundante y acciones discretas.
- Evaluación de memoria a largo plazo en agentes: el gestor de momentos clave con HDBSCAN permite experimentar con recuperación de eventos pasados y medir su impacto en decisiones de horizonte largo.
- Reproducción de resultados académicos: al incluir los tres modelos base y el estado de guardado inicial, un grupo de investigación puede replicar la ejecución de *Pokémon Emerald* descrita en el paper sin depender de servicios externos.
- Docencia y divulgación: demostración tangible de un agente multimodal que juega a un videojuego comercial complejo, útil en cursos de aprendizaje por refuerzo y sistemas agénticos.
- Desarrollo de agentes para entornos con acciones discretas y observaciones visuales: la arquitectura SigLIP + Qwen3 + IDM es un punto de partida para prototipos en emuladores, robótica de acciones discretas o simulación.

## Benchmarks y rendimiento

La model card únicamente reporta que, en la evaluación de 8 horas del paper, ASH alcanza una media de 11,2 de 12 hitos definidos por humanos en *Pokémon Emerald*. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Resultado |
|---|---|
| Hitos humanos alcanzados (media, evaluación de 8 h) | 11,2 de 12 |
| Bootstraps completados por ejecución publicada | 10 |
| Clústeres de momentos clave (checkpoint-1 → checkpoint-10) | 467 → 923 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el sistema requiere memoria suficiente para la política de 1.7B parámetros, el IDM (1.8 GB), DINOv2-base y el clusterizador.
- El gestor de momentos clave (`objective_manager.pkl`, de 2,5 GB a 6,1 GB según checkpoint) requiere cargarse con el repositorio de código y una GPU con cuML instalado.
- GPU recomendadas: no se especifican modelos concretos; se indica únicamente "una GPU con memoria suficiente". Por el tamaño de los componentes, una GPU de 24 GB (RTX 4090, A5000) o superior es un punto de partida razonable, aunque no está confirmado por el autor.
- No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI: la ejecución se realiza exclusivamente a través del repositorio de código, que controla el emulador mGBA, la política, el IDM y el bucle de auto-mejora.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio completo ocupa aproximadamente 100 GB (103,9 GB según Hugging Face).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada. A continuación se comparan las características estructurales con alternativas del mismo ámbito (agentes para videojuegos y políticas multimodales):

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ASH (Toolbox-HQ) | 1.7B (LM) + SigLIP + IDM | No disponible | Agente auto-mejorable con memoria de momentos clave | MIT | Pesos y checkpoints en Hugging Face |
| Qwen3-1.7B (base) | 1.7B | No disponible en esta ficha | Modelo de lenguaje general | Apache 2.0 | Hugging Face |
| Políticas de RL clásicas para videojuegos | Variables | No aplica | Aprendizaje por refuerzo con recompensa diseñada | Variable | Variable |

No se identifican en la información proporcionada otros agentes publicados con pesos abiertos que aprendan de vídeo de internet sin recompensas en dominios de videojuego comercial; la comparación cuantitativa de rendimiento queda por tanto no disponible.

## Limitaciones y advertencias

- Los checkpoints juegan únicamente *Pokémon Emerald*; los resultados en *Zelda* del paper provienen de una ejecución separada no publicada.
- No es un "solver" de extremo a extremo: las ejecuciones son estocásticas (muestreo con temperatura sobre las acciones) y la media de 11,2 de 12 hitos implica variabilidad entre partidas.
- Requiere que el usuario aporte su propia ROM de *Pokémon Emerald*, que no se distribuye por motivos legales.
- El pipeline de inferencia depende del repositorio de código y de cuML para cargar el gestor de momentos clave; no es un modelo desplegable con herramientas estándar como vLLM u Ollama.
- El sistema completo ocupa unos 100 GB en disco, lo que limita su uso en entornos con almacenamiento reducido.
- Idiomas: solo inglés documentado; no se reportan capacidades multilingües.
- No se documentan sesgos específicos ni tasas de alucinación; al tratarse de un agente que actúa sobre un emulador, el riesgo principal es la ejecución de acciones subóptimas o bucles, no la generación de texto libre.
- Licencia MIT para el artefacto, pero los modelos base (Qwen3-1.7B, SigLIP, DINOv2) conservan Apache 2.0; conviene revisar ambas al redistribuir.
- Es un artefacto de investigación: no hay garantías de soporte, mantenimiento ni robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Toolbox-HQ/ASH
- Paper (arXiv): https://arxiv.org/abs/2605.14211
- Página del proyecto: https://toolbox-hq.github.io/ASH/
- Repositorio de código: https://github.com/Toolbox-HQ/ASH
- Modelo base de lenguaje: https://huggingface.co/Qwen/Qwen3-1.7B
- Codificador visual: https://huggingface.co/google/siglip-base-patch16-224
- Modelo de embeddings: https://huggingface.co/facebook/dinov2-base
