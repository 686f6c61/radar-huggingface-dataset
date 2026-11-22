# xinyuan-eval/robodojo-4task-step20000

## Resumen

AW-0 es un modelo de acción mundial agéntico (Agentic World Action Model) desarrollado en el ecosistema RoboDojo, un banco de pruebas de robótica de manipulación. Este repositorio concreto, `robodojo-4task-step20000`, contiene checkpoints de ajuste fino de AW-0 entrenados de forma **independiente** para cuatro tareas simuladas de RoboDojo, cada una en su propio directorio con pesos de aproximadamente 10 GB. El modelo genera simultáneamente código, vídeo del futuro y acciones motrices, una combinación poco habitual que busca unificar razonamiento simbólico y control de bajo nivel.

El checkpoint corresponde al paso 20.000 de entrenamiento sobre 100 demostraciones por tarea del dataset `RoboDojo-Benchmark/RoboDojo` (formato LeRobot v2.1), con un robot bimanual ARX X5 y acciones en espacio articular. La relevancia actual radica en que explora el paradigma "world action model" aplicado a manipulación con instrucciones en lenguaje natural, aunque los resultados publicados por el propio autor muestran cero éxitos en las tres tareas evaluadas hasta la fecha.

El repositorio tiene 29,9 GB, sin descargas ni likes, licencia no especificada y sin idiomas declarados. La model card está redactada en chino y describe tanto la metodología de entrenamiento como la configuración de evaluación en Isaac Sim 5.1 mediante el adaptador AgenticWAM de XPolicyLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agentic World Action Model (AW-0); genera código, vídeo futuro y acciones; detalles internos de la red no disponibles |
| Parametros totales | no disponible (pesos de ~10 GB por tarea) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16) |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch), un `step_020000.pt` por tarea |
| Entradas | Instrucción textual, estado del robot (eef64), observaciones visuales |
| Salidas | Código (128 tokens), vídeo futuro y acciones articulares |
| Embodiment | ARX X5 bimanual, `action_type=joint` |
| Entorno de evaluación | RoboDojo sobre Isaac Sim 5.1, adaptador AgenticWAM |

## Arquitectura y entrenamiento

AW-0 se presenta como un modelo que, en una sola pasada, produce tres modalidades: código de plantilla de fase, predicción de vídeo futuro y acciones. La model card indica que el código de fase se genera a partir de plantillas que dependen únicamente de la apertura/cierre del agarre y de la posición del efector final, **sin invocar un VLM**. Esto sugiere que la componente "agéntica" del modelo es más bien un generador de secuencias de fase que un razonador visual-lenguaje completo, aunque la arquitectura interna no se detalla.

El entrenamiento parte del checkpoint preentrenado AW-0 y se ajusta por separado para cada tarea con 100 demostraciones (episodios 0–94 para entrenamiento, 95–99 para validación). Se usan 20.000 pasos, batch global 32 (8 GPU × 4 por GPU), learning rate 1e-4 y `infer_code_tokens=128`. En inferencia, cada planificación predice 32 pasos de acción, ejecuta los 24 primeros y replanifica, con 6 pasos de difusión. Se emplean semillas de ruido fijas (`AGENTICWAM_NOISE_SEED=1234`) y se desactiva `torch.compile` para evitar recompilaciones que superan el timeout de 120 s del cliente. No se documentan datos de RLHF, DPO ni composición del corpus de preentrenamiento.

## Capacidades

- Generación de acciones de manipulación bimanual en espacio articular para el robot ARX X5.
- Predicción de vídeo futuro como representación intermedia del estado del entorno.
- Generación de código de fase a partir de plantillas basadas en agarre y posición del efector final.
- Ejecución de instrucciones de tarea en lenguaje natural (las cuatro tareas de RoboDojo).
- Replanificación periódica cada 24 pasos ejecutados sobre 32 predichos.
- No se documenta soporte de tool calling, agentes multi-paso generales, visión-lenguaje conversacional ni capacidades multilingües.

## Casos de uso

- Investigación en world action models: servir como referencia reproducible para estudiar la combinación de predicción de vídeo, código y acción en manipulación simulada.
- Benchmarking de manipulación bimanual: evaluar políticas en RoboDojo con el robot ARX X5 y comparar configuraciones de replanificación y difusión.
- Estudio de generación de código de fase: analizar cómo plantillas basadas en agarre y efector final condicionan la ejecución de tareas largas como `cover_blocks`.
- Reproducción de experimentos: el repositorio incluye `config.yaml`, `dataset_stats_eef64.json` e `instructions.txt`, lo que permite replicar el pipeline de evaluación en Isaac Sim 5.1.
- Análisis de fallos en políticas de imitación: los resultados con cero éxitos en tres tareas ofrecen un caso de estudio sobre limitaciones de ajuste fino con 100 demostraciones.
- Desarrollo de adaptadores de despliegue: el uso del adaptador AgenticWAM de XPolicyLab sirve como plantilla para integrar modelos en entornos simulados con `action_type=joint`.
- Base para ajuste fino en nuevas tareas: al ser checkpoints independientes por tarea, se pueden reutilizar como inicialización para tareas relacionadas con 100 demostraciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (seed 0, layouts 0–49):

| Tarea | Episodios válidos | Éxitos | Puntuación media ×100 |
|---|---|---|---|
| insert_tubes | 50/50 | 0 | 2,8 |
| fill_egg_holder | 46/50 | 0 | 7,9 |
| cover_blocks | 50/50 | 0 | 0,0 |
| stack_bowls | evaluación en curso | — | — |

Los layouts 28, 35, 37 y 46 de `fill_egg_holder` fueron descartados por inestabilidad física según las reglas de RoboDojo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos de ~10 GB por tarea en precisión de entrenamiento; en bf16 requieren al menos 10 GB de VRAM solo para parámetros, más memoria para activaciones y búferes de vídeo.
- El entrenamiento usó 8 GPU con 4 muestras por GPU (batch global 32), lo que sugiere GPUs de clase A100 o H100.
- Para inferencia se recomienda separar el renderizado de Isaac Sim y el servidor de política en GPUs distintas, tal como hace el autor.
- No se documenta compatibilidad con llama.cpp, Ollama, vLLM o TGI; el despliegue se realiza mediante el adaptador AgenticWAM (`deploy/robodojo/AgenticWAM`).
- No se documentan latencia ni throughput medidos; se sabe que la primera llamada real puede superar los 120 s si se activa `torch.compile`.
- No se confirma que quepa en GPU de consumo; por tamaño de pesos, una RTX 4090 de 24 GB podría albergarlos en bf16, pero faltan datos de memoria total del pipeline.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AW-0 (este checkpoint) | World action model con código y vídeo | no disponible (~10 GB por tarea) | no disponible | no disponible | Hugging Face, 4 tareas |
| Políticas de imitación tipo Diffusion Policy | Política de acciones | variable | no aplica | variable | Amplia |
| Modelos VLA (p. ej. OpenVLA) | Visión-lenguaje-acción | ~7B en variantes conocidas | variable | variable | Hugging Face |
| Modelos world model (p. ej. UniSim) | Predicción de vídeo/estado | variable | no aplica | variable | Investigación |

No se dispone de datos comparativos de rendimiento entre AW-0 y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cero éxitos en las tres tareas evaluadas hasta la fecha; la puntuación media es baja (0,0–7,9 sobre 100).
- Cada checkpoint está ajustado para una sola tarea; no generaliza entre tareas ni sirve como política multi-tarea.
- El código de fase se genera con plantillas que no consultan un VLM, lo que limita la adaptación a variaciones semánticas de la instrucción.
- Entrenamiento con solo 100 demostraciones por tarea, con riesgo de sobreajuste y escasa robustez ante cambios de layout.
- La model card advierte de que la evaluación no equivale al ranking principal de RoboDojo (que entrena un único modelo en todas las tareas).
- Licencia no especificada: no se puede confirmar el uso comercial.
- Idiomas no declarados; las instrucciones están en inglés y la documentación en chino.
- Riesgo de alucinación en la predicción de vídeo futuro no cuantificado.
- Dependencia de un stack específico (Isaac Sim 5.1, AgenticWAM, variables de entorno concretas) que dificulta la reproducibilidad fuera de ese entorno.
- El timeout de 120 s del cliente puede descartar episodios si se activa `torch.compile`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xinyuan-eval/robodojo-4task-step20000
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Repositorio AgenticWAM (referenciado en la model card, ruta `deploy/robodojo/AgenticWAM`): no disponible como URL directa en la información proporcionada
- Paper de AW-0: no disponible
- Blog o demo oficial: no disponible
