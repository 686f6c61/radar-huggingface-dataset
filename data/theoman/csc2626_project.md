# theOman/CSC2626_Project

## Resumen

CSC2626_Project es un repositorio de investigación que contiene políticas de aprendizaje por refuerzo (PPO) entrenadas sobre manos Adroit simuladas en MuJoCo-Warp para tareas de manipulación diestra: `relocate` y `pen`. No se trata de un modelo de lenguaje, sino de un conjunto de checkpoints de políticas con espacio de acciones latente compacto, desarrollado por el usuario theOman en el contexto de un proyecto académico (CSC2626). El repositorio incluye tanto baselines de control articular completo ("full") como variantes que seleccionan un código latente `z` de baja dimensión, decodificado por un decoder congelado (PCA, DCT, VAE o autoencoder disperso) ajustado sobre 25 demostraciones humanas del dataset D4RL Adroit.

La relevancia técnica reside en la comparación sistemática entre espacios de acción directos y latentes para manipulación fina con manos de muchos grados de libertad, con barridos de ablación sobre tamaño del VAE, peso KL, ruido de exploración, chunking de acciones y arquitectura del decoder. El entrenamiento se realizó con 4096 entornos paralelos en GPU (MuJoCo-Warp), con evaluaciones cada 5M de pasos de entorno.

El repositorio tiene 0,8 GB, no declara licencia ni idiomas, y no presenta resultados de benchmarks en formato estándar de LLM. Su uso está orientado a reproducir experimentos de RL robótico, no a inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política PPO: MLP (512-256-128, SiLU) que mapea observaciones a la media gaussiana sobre `z`; decoder congelado (PCA/DCT/VAE/SAE) que mapea `z` (y condición opcional) a objetivos articulares en [-1, 1] |
| Parametros totales | no disponible (depende del checkpoint; MLP de 512-256-128 más decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de episodio de 200 pasos) |
| Tipos de cuantizacion | no disponible (checkpoints `.pkl` y `.pt` en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (checkpoints PPO con parámetros actor/critic, normalizador de observaciones y args de entrenamiento), `.pt` (bases de acción y decoders), `.npz` (demostraciones humanas procesadas de D4RL Adroit) |

## Arquitectura y entrenamiento

La política es una MLP de tres capas ocultas (512-256-128) con activación SiLU que produce la media de una gaussiana sobre el código latente `z`; el decoder, congelado durante el entrenamiento de RL, transforma `z` (junto con una condición `cond` que varía según la variante) en comandos articulares acotados a [-1, 1]. Los decoders se ajustan previamente sobre 25 demostraciones humanas del dataset D4RL Adroit, y las variantes incluyen bases lineales PCA y DCT (`pca_k<K>.pt`, `dct_k<K>.pt`), VAEs condicionales (`vae_<cond>_z<Z>_b<beta>[_H<chunk>][_w<width>][_L<layers>].pt`) y autoencoders dispersos (`sae_<cond>_z<Z>_b<l1>.pt`). Se documentan métricas de reconstrucción sobre datos reservados en `metrics_*.json`.

El entrenamiento se realizó con PPO en MuJoCo-Warp sobre GPU con 4096 entornos paralelos, evaluando cada 5M de pasos de entorno. El repositorio organiza los experimentos por semanas: `week1` con baselines de control articular completo, `week2` con espacios de acción latentes, `week2_bc` y `week2_abl` con inicialización por comportamiento clonado y ablaciones de ruido, `week3_sigma` con barrido de ruido de exploración, `week3_vae` con tamaño del VAE, peso KL y entrada del decoder, `week3_chunk` con VAEs de chunking de acciones, `week3_arch` con tamaño de la MLP del VAE y `week3_sae` con autoencoder disperso. Cada run incluye `train.csv` con la curva de aprendizaje, `cpu_eval.json` con éxito sobre 50 episodios deterministas en el entorno MuJoCo de CPU, y `best.pkl` con el mejor checkpoint según evaluación en GPU.

## Capacidades

- Control de manipulación diestra sobre manos Adroit simuladas en MuJoCo para las tareas `relocate` (reubicar un objeto) y `pen` (rotar un bolígrafo).
- Políticas PPO con espacio de acción directo (control de todas las articulaciones) o latente (código `z` de baja dimensión decodificado).
- Decoders de acción alternativos: PCA, DCT, VAE condicional y autoencoder disperso, con métricas de reconstrucción sobre datos reservados.
- Soporte de chunking de acciones mediante VAEs con parámetro `_H<chunk>`.
- Inicialización por comportamiento clonado (`week2_bc`) y ablaciones de ruido de exploración.
- Evaluación reproducible en CPU (`latact.viz evalcpu`) y generación de vídeos de política (`latact.viz policy`).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión ni audio.

## Casos de uso

- Reproducción de experimentos de RL robótico: descargar los checkpoints con `hf download` y ejecutar `latact.viz evalcpu` sobre `best.pkl` para obtener el éxito en 50 episodios deterministas en CPU, verificando las curvas de `train.csv`.
- Estudio de espacios de acción latentes: comparar las variantes PCA, DCT, VAE y SAE mediante `metrics_*.json` para analizar la fidelidad de reconstrucción frente al control articular completo.
- Ablación de tamaño y regularización del VAE: usar los runs de `week3_vae` (parámetros `_z<Z>`, `_b<beta>`, `_w<width>`, `_L<layers>`) para estudiar el compromiso entre compacidad del código y éxito en `relocate` y `pen`.
- Análisis de exploración: emplear el barrido de `week3_sigma` para medir el efecto del ruido de exploración sobre la convergencia de PPO en manipulación fina.
- Inicialización por comportamiento clonado: usar `week2_bc` para evaluar si el preentrenamiento con demostraciones humanas acelera el aprendizaje de la política latente.
- Docencia e investigación en RL: el repositorio sirve como material reproducible para un curso o proyecto (CSC2626) sobre PPO, VAEs y MuJoCo-Warp con 4096 entornos.
- Generación de vídeos cualitativos: ejecutar `latact.viz policy` sobre un checkpoint para inspeccionar visualmente la política en `relocate` o `pen`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `cpu_eval.json` con la tasa de éxito sobre 50 episodios deterministas y `train.csv` con curvas de aprendizaje cada 5M de pasos, pero los valores numéricos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,8 GB y los checkpoints son MLPs pequeñas, por lo que la inferencia de una sola política cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas para entrenamiento: se usó MuJoCo-Warp con 4096 entornos paralelos, lo que requiere una GPU con suficiente memoria y cómputo; no se especifica el modelo exacto en la información disponible.
- GPU consumer: la inferencia de una política individual (MLP 512-256-128 más decoder) es viable en GPUs consumer e incluso en CPU mediante `latact.viz evalcpu`.
- Opciones de despliegue: el código propio del proyecto (`latact/`) con MuJoCo y MuJoCo-Warp; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de RL para Adroit ni con modelos de espacio de acción latente comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni responde a prompts; cualquier uso fuera de RL robótico en MuJoCo no está soportado.
- La licencia no está declarada, por lo que el uso comercial y la redistribución quedan sin clarificar.
- Los checkpoints están ligados a las tareas `relocate` y `pen` de Adroit y a las versiones concretas de MuJoCo y MuJoCo-Warp del proyecto; cambios de versión pueden romper la reproducibilidad.
- El éxito se define con umbrales específicos de cada tarea durante 200 pasos; los resultados en `cpu_eval.json` corresponden a 50 episodios deterministas y no garantizan robustez fuera de esa distribución.
- Los decoders se ajustaron sobre solo 25 demostraciones humanas, lo que puede limitar la cobertura del espacio de acciones latente.
- No se declaran sesgos, pero al ser un proyecto académico sin revisión por pares documentada, conviene tratar los resultados como preliminares.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/theOman/CSC2626_Project
- Repositorio de código: el proyecto referencia su GitHub con la rama `Owen` y el paquete `latact/`, pero la URL no se incluye en la información disponible.
- Paper, blog o demo: no disponibles en la información proporcionada.
