# UncleStrawberryBear/FlyControl-models

## Resumen

FlyControl-models es un repositorio de pesos de políticas de aprendizaje por refuerzo (RL) publicado por UncleStrawberryBear como material de respaldo del trabajo de investigación "A Drosophila connectome prior enables adaptable embodied control". No es un modelo de lenguaje: es una colección de 846 checkpoints (810 políticas finales y 36 estados iniciales) entrenados con PPO para tareas de control motor en cuerpos simulados (Drosophila adulta y larva, hormiga, Cassie, Tripod, Go1 y Hexapod). El interés técnico radica en que varias de las políticas incorporan un prior derivado del conectoma de la mosca de la fruta, comparado sistemáticamente contra controladores MLP, GRU, LSTM, Transformer y Reservoir.

El repositorio está organizado por figuras del paper, lo que lo convierte en un artefacto de reproducibilidad más que en un modelo listo para producción. Cada checkpoint contiene pesos de actor y crítico, junto con los componentes guardados que necesita cada política, y se indexa mediante ficheros `model_index.json` con figura, experimento, controlador, semilla, configuración y hash SHA-256.

Su relevancia actual es acotada pero específica: sirve a investigadores en neurociencia computacional y en RL encarnado que quieran replicar o extender los experimentos, reutilizar las políticas como línea base o estudiar cómo un prior estructural biológico afecta a la adaptabilidad del control. El tamaño del repositorio (26,9 GB) refleja el volumen de checkpoints, no el tamaño de un modelo individual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas actor-crítico entrenadas con PPO; familias de controlador: conectoma (Adult/Larva), MLP, GRU, LSTM, Transformer, Reservoir y Reservoir+RO |
| Parámetros totales | No disponible (depende de cada checkpoint; el MLP de hormiga en suelo plano usa dos capas ocultas ReLU de 1.378 unidades) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; las políticas consumen observaciones por paso) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (documentación y model card); el modelo no procesa lenguaje |
| Licencia | MIT para los pesos, utilidades de carga y documentación originales; materiales de terceros conservan sus licencias upstream (ver `RIGHTS.md`) |
| Formato de pesos | Checkpoints de PyTorch con pesos de actor y crítico, más `graph.npz` con el conectoma compartido de la Figura 6; índices en JSON |

## Arquitectura y entrenamiento

El repositorio no contiene un transformer ni un modelo generativo, sino políticas de control entrenadas con PPO sobre entornos de simulación física. La innovación central del trabajo es el uso de un prior de conectoma de Drosophila como sesgo estructural en la política: la red se inicializa o restringe según la conectividad del conectoma de la mosca, y se compara contra familias de controladores convencionales (MLP, GRU, LSTM, Transformer, Reservoir, Reservoir+RO) bajo el mismo protocolo. Las políticas de la Figura 5 usan 109 canales de observación y 8 canales de acción; las de la Figura 6 consumen las características generadas por la interfaz corporal correspondiente y emplean `normalize_observation: false` en su configuración PPO.

El conjunto de experimentos cubre locomoción en terreno (Figura 2), control de giro (Figura 3), control de velocidad (Figura 4), suelo plano y fricción en hormiga (Figura 5b–d), laberintos U, Medium y Large con siete familias de controlador (Figura 5e, S8), navegación en laberinto (Figura 5f–j), control de dirección y velocidad en desarrollo adulto vs. larva (S3, S4), readouts descendentes y motores BANC (S5, S6), y equilibrio y marcha en Cassie, Tripod, Go1 y Hexapod (Figura 6, S9, S10). Los pasos de entrenamiento varían por cuerpo: 524.288 para Cassie y Go1, 131.072 para Tripod y Hexapod. No se especifican en la información disponible el número total de tokens ni la composición de datos, algo esperable al no tratarse de un modelo de lenguaje.

## Capacidades

- Control motor encarnado en simulación: locomoción en terreno, giro, velocidad, equilibrio bípedo y marcha cuadrúpeda/hexápoda.
- Navegación en laberintos (U-Maze, Medium Maze, Large Maze) con planificador de waypoints configurable por checkpoint.
- Políticas con prior de conectoma de Drosophila (adulto y larva) y políticas de referencia sin prior (MLP, GRU, LSTM, Transformer, Reservoir, Reservoir+RO).
- Adaptación a distintas morfologías: Drosophila, hormiga, Cassie, Tripod, Go1 y Hexapod.
- Readouts de circuitos descendentes y motores (BANC) para análisis neurocientífico.
- Carga programática verificada: `load_ant_policy.py`, `load_embodiment_policy.py` y `load_policy.py` restauran el checkpoint y ejecutan un forward numérico de comprobación.
- No soporta tool calling, function calling, agentes basados en lenguaje, visión, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos del paper: descargar el snapshot y ejecutar `load_policy.py` con el `model-id` de cada figura para replicar las condiciones de evaluación y semillas de reset almacenadas en los índices.
- Línea base para RL encarnado: usar las políticas MLP, GRU, LSTM, Transformer, Reservoir y Reservoir+RO de la Figura 5 como comparativas controladas frente a nuevas arquitecturas en las mismas tareas de laberinto.
- Estudio de priors biológicos: analizar cómo el conectoma de Drosophila afecta a la estabilidad y adaptabilidad del control comparando los checkpoints de conectoma con los MLP bajo idénticas semillas.
- Transferencia entre morfologías: reutilizar la interfaz corporal de FlyControl para evaluar políticas de Cassie, Go1, Tripod o Hexapod en variantes del entorno con fricción o perturbaciones laterales.
- Docencia en neurociencia computacional: emplear los checkpoints y los scripts de carga como material práctico para ilustrar el entrenamiento PPO con priors estructurales y la evaluación multi-semilla.
- Análisis de robustez: explotar los 20 seeds por configuración en las Figuras 5 y 6 para estudiar varianza entre inicializaciones y estabilidad de rutas en laberintos grandes.
- Verificación de integridad de artefactos: usar los hashes SHA-256 de `model_index.json` y los ficheros `validation.json` para auditar la correspondencia entre checkpoints y resultados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la organización de experimentos por figura y el número de semillas, pero no incluye métricas numéricas de rendimiento (recompensa, tasa de éxito, error de seguimiento) ni comparativas cuantitativas entre controladores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de políticas pequeñas (MLP de dos capas de 1.378 unidades en el caso de hormiga en suelo plano), la inferencia es viable en CPU; el cuello de botella es el simulador físico, no la red.
- GPU recomendadas: no especificadas en la información disponible. Cualquier GPU con soporte PyTorch (por ejemplo, RTX 4090, A100, H100) es suficiente para cargar y ejecutar las políticas; el entrenamiento PPO original requiere más recursos, pero no se documentan.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño reducido de cada política individual; el repositorio completo (26,9 GB) excede la VRAM de muchas GPUs consumer, por lo que conviene descargar solo los checkpoints necesarios.
- Opciones de despliegue: scripts propios del repositorio (`load_policy.py`, `load_ant_policy.py`, `load_embodiment_policy.py`) sobre PyTorch, con el código de FlyControl en la revisión enlazada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlyControl-models | Políticas RL con prior de conectoma | No disponible por checkpoint | No aplica | MIT | Hugging Face (repo de 26,9 GB) |
| Alternativas de RL encarnado con conectoma | No disponible | No disponible | No aplica | No disponible | No disponible |
| Controladores MLP/GRU/LSTM/Transformer de referencia | Incluidos en el propio repo | No disponible | No aplica | MIT | Hugging Face |

No se dispone de información sobre modelos comparables externos en la documentación proporcionada; la comparativa interna entre familias de controlador está contemplada en el propio repositorio mediante los índices por figura.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no admite prompts, tool calling, agentes conversacionales ni tareas de NLP.
- Los checkpoints están ligados a entornos y morfologías concretas; su uso fuera de las interfaces corporales de FlyControl requiere adaptar observaciones y acciones.
- El repositorio es un artefacto de investigación: no se documentan métricas de rendimiento ni garantías de robustez fuera de las condiciones de evaluación del paper.
- La licencia MIT cubre los pesos y utilidades originales, pero los materiales de terceros conservan sus licencias upstream; es obligatorio revisar `RIGHTS.md` antes de un uso comercial o de redistribución.
- Riesgo de sesgo y alucinación: no aplica en el sentido habitual, pero sí existe riesgo de sobreajuste a las condiciones de simulación y a las semillas de entrenamiento documentadas.
- El tamaño del snapshot (26,9 GB) y la presencia de 846 checkpoints hacen recomendable la descarga selectiva por figura o experimento.
- La fecha de creación del repositorio (2026-11-02) y la ausencia de descargas y likes indican que se trata de una publicación reciente y sin validación comunitaria todavía.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/UncleStrawberryBear/FlyControl-models
- Dataset asociado: https://huggingface.co/datasets/UncleStrawberryBear/FlyControl-data
- Código FlyControl (revisión enlazada): https://github.com/THU-NeuroML/FlyControl/tree/1a49c33bf1e6eab17cb2953123e02ecc2549a5f4
- Repositorio FlyControl (raíz): https://github.com/THU-NeuroML/FlyControl
- Licencia MIT: https://huggingface.co/UncleStrawberryBear/FlyControl-models/blob/main/LICENSE
- Información de derechos de terceros: https://huggingface.co/UncleStrawberryBear/FlyControl-models/blob/main/RIGHTS.md
