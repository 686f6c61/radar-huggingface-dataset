# WDong/so101-act-erythromycin-tea-ablation

## Resumen

El modelo `WDong/so101-act-erythromycin-tea-ablation` es un conjunto de cinco políticas de control robótico entrenadas con la arquitectura ACT (Action Chunking with Transformers) de LeRobot, desarrolladas por el usuario WDong. El objetivo es resolver una tarea de pick-and-place con el brazo robótico SO-101: recoger una caja de ungüento de eritromicina y colocarla sobre una lata de té verde Rizhao. El modelo se publica como un estudio de ablación que compara diferentes configuraciones de entrenamiento, representaciones de acción y tasas de aprendizaje.

La relevancia de este modelo radica en que documenta de forma sistemática cómo afectan las decisiones de entrenamiento (limpieza de demostraciones, representación de acciones absoluta vs. relativa, programación de la tasa de aprendizaje) al error de seguimiento en espacio articular calibrado. Es un recurso útil para investigadores y desarrolladores que trabajan con LeRobot y necesitan entender qué configuraciones producen mejores resultados en tareas de manipulación con demostraciones imperfectas.

El repositorio contiene cinco checkpoints (`T1` a `T5`), cada uno con su modelo preentrenado, curvas de entrenamiento, métricas de evaluación offline y manifiestos de procedencia. No se trata de un modelo de lenguaje ni de visión general, sino de un modelo de control específico para un entorno robótico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. El modelo recibe observaciones de dos cámaras (fija y de muñeca, ambas a 640x480 píxeles) y el estado articular del brazo (seis dimensiones calibradas: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` y `gripper`). A partir de estas entradas, predice un fragmento de acciones (action chunk) que se ejecuta de forma open-loop durante un horizonte K.

El entrenamiento se realizó con el framework LeRobot sobre el dataset `WDong/so101-erythromycin-tea-grid120-v30`, que contiene demostraciones de la tarea de pick-and-place. Se entrenaron cinco variantes (T1 a T5) que difieren en el perfil de limpieza del dataset (con o sin fotogramas terminales estáticos, con o sin demostraciones de recuperación), en la representación de las acciones (posiciones articulares absolutas vs. relativas para los primeros cinco ejes con pinza absoluta) y en la programación de la tasa de aprendizaje (warmup + cosine vs. constante a 1e-5). No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de behavior cloning puro.

## Capacidades

- Control de pick-and-place: el modelo ejecuta la tarea de recoger un objeto (caja de ungüento de eritromicina) y colocarlo sobre otro (lata de té verde Rizhao).
- Procesamiento multimodal: integra dos flujos de cámara (fija y de muñeca) junto con el estado articular del brazo.
- Salida de acciones articulares: predice posiciones objetivo para seis grados de libertad, incluyendo la pinza.
- Soporte de acción por fragmentos (action chunking): genera secuencias de K acciones (K=5 o K=10 en las evaluaciones) que se ejecutan de forma autónoma.
- Representación de acciones flexible: las variantes T1, T2, T3 y T5 emiten posiciones articulares absolutas; T4 emite los primeros cinco ejes relativos al estado actual (con pinza absoluta), lo que requiere un adaptador de decodificación específico.
- Evaluación offline: el repositorio incluye métricas de error absoluto medio (MAE) en espacio articular calibrado para episodios held-out.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como banco de pruebas para comparar configuraciones de entrenamiento (limpieza de datos, representación de acciones, LR schedule) en una tarea de manipulación realista.
- Desarrollo de políticas robóticas con LeRobot: los checkpoints pueden cargarse directamente en LeRobot para evaluar el comportamiento del brazo SO-101 en entornos simulados o reales.
- Estudio de ablaciones para publicaciones académicas: la estructura del repositorio (curvas, métricas, manifiestos) facilita reproducir y citar resultados de ablación en artículos científicos.
- Benchmarking de representaciones de acción: T4 (acciones relativas) y T5 (acciones absolutas con LR constante) permiten comparar el impacto de la representación en el error de seguimiento y el sesgo sistemático.
- Validación de estrategias de limpieza de datasets: T2 (con fotogramas terminales) y T3 (con demostraciones de recuperación) ofrecen datos sobre cómo afecta la calidad de las demostraciones al rendimiento final.
- Despliegue en entornos de laboratorio: el modelo puede integrarse en pipelines de control de robots SO-101 para tareas de manipulación de objetos pequeños, siempre que se respeten las advertencias de calibración y seguridad.

## Benchmarks y rendimiento

La información disponible incluye métricas de evaluación offline sobre episodios held-out (IDs 20, 47 y 89). El error se mide como error absoluto medio (MAE) tras decodificar las predicciones a espacio articular absoluto calibrado. Menor es mejor.

| ID | Perfil de entrenamiento | Representacion de accion | LR | Paso val-best | MAE K=5 | MAE K=10 | Error firmado shoulder-pan K=5 |
|---|---|---|---:|---:|---:|---:|
| T1 | both-trim clean112 | absoluta | warmup + cosine | 32,500 | 3.777 | 4.234 | -0.361 |
| T2 | front-trim clean112 | absoluta | warmup + cosine | 27,500 | 3.621 | 4.021 | -0.250 |
| T3 | both-trim full117 | absoluta | warmup + cosine | 35,000 | 3.668 | 4.126 | -0.141 |
| T4 | both-trim full117 | relativa (5 ejes) + pinza absoluta | warmup + cosine | 37,500 | **2.872** | **3.418** | -0.797 |
| T5 | both-trim clean112 | absoluta | constante 1e-5 | 57,500 | 3.692 | 4.051 | **-0.030** |

T4 obtiene el mejor MAE offline, pero presenta el mayor sesgo negativo en shoulder-pan. T5 es la línea base de baja desviación con acciones absolutas. T2 incluye fotogramas terminales estáticos, por lo que su ventana de evaluación temporal es mayor (483 fotogramas frente a 439) y su MAE no es directamente comparable con las políticas both-trim. No se reportan tasas de éxito en despliegue autónomo.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Dado el tamaño del repositorio (1.0 GB) y la arquitectura ACT, es probable que el modelo quepa en GPUs consumer de 8-12 GB, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Se asume compatibilidad con cualquier GPU que soporte PyTorch y LeRobot (p. ej., RTX 3060, RTX 4090, A100), pero no se especifica.
- Despliegue en consumer GPU: probablemente sí, dado el tamaño reducido del checkpoint, pero no confirmado.
- Opciones de despliegue: LeRobot (framework principal), con soporte para inferencia en PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para SO-101 con el mismo dataset). El repositorio es un estudio de ablación interno, por lo que la comparativa más relevante es entre las propias variantes T1-T5, ya presentada en la sección de benchmarks. No se conocen otros modelos públicos que aborden exactamente la misma tarea con la misma arquitectura y dataset.

## Limitaciones y advertencias

- Sesgos conocidos: T4 presenta un sesgo sistemático negativo en shoulder-pan (error firmado de -0.797), lo que puede provocar desviaciones consistentes en la ejecución real.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de texto), pero el modelo puede producir predicciones fuera de los límites articulares si no se verifican los valores de salida.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje.
- Restricciones de licencia: la licencia no esta disponible, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de un despliegue productivo.
- Caveats para produccion: el autor advierte que las métricas son offline (behavior cloning sobre observaciones registradas) y no reflejan tasas de exito en despliegue autonomo. Antes de comandar el hardware, es obligatorio verificar calibracion, orden de articulaciones, orden/orientacion de camaras, forma de salida, valores finitos, limites y deltas de primera accion con motores desactivados. Se recomienda comenzar con un prefijo corto (K=5) y supervision humana continua.
- T4 requiere un adaptador de decodificacion especifico: los primeros cinco ejes son relativos al estado actual y deben decodificarse a absolutos exactamente una vez; no aplicar suma acumulativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WDong/so101-act-erythromycin-tea-ablation
- Dataset: https://huggingface.co/datasets/WDong/so101-erythromycin-tea-grid120-v30
- Framework LeRobot: https://github.com/huggingface/lerobot
