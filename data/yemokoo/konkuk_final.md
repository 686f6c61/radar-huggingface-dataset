# YeMoKoo/konkuk_final

## Resumen

konkuk_final es un repositorio de checkpoints finales asociado al método Konkuk LoRA-MoE, una propuesta de aprendizaje continuo (continual learning) que combina adaptadores LoRA con una arquitectura de mezcla de expertos (MoE) para evitar el olvido catastrófico al encadenar tareas. El autor del repositorio es YeMoKoo y los pesos se publican como material de reproducibilidad de un trabajo de investigación; no se trata de un modelo base entrenado desde cero, sino de un conjunto de adaptadores y pesos de expertos que deben cargarse sobre modelos congelados de terceros.

Los checkpoints se organizan por experimentos sobre el benchmark TRACE, que agrupa ocho tareas heterogéneas (C-STANCE, FOMC, MeetingBank, Py150, ScienceQA, NumGLUE-cm, NumGLUE-ds y 20Minuten). Cada carpeta contiene los pesos finales tras la última tarea de cada secuencia de aprendizaje continuo, tanto del método propuesto como de las líneas base comparadas (Seq-LoRA, EWC, O-LoRA, S-LoRA, MoE-LPR, Lifelong-MoE, DyMoE y MTL), además de ablaciones y experimentos de réplica.

El interés del repositorio es fundamentalmente académico: permite reproducir y auditar los resultados de un artículo sobre aprendizaje continuo con MoE y LoRA. No está pensado como modelo de propósito general para producción, y no se publican datos de arquitectura completa, tokenizador propio, benchmarks de uso general ni condiciones de licencia comercial más allá de la etiqueta "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA y pesos de expertos MoE sobre modelos base congelados (no se especifica la arquitectura interna del método) |
| Parametros totales | no disponible (depende del modelo base: Llama-3.1-8B-Instruct o Qwen3-8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base correspondiente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (se indica que solo se incluyen archivos de modelo; no se detalla el formato) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del método Konkuk más allá de su naturaleza híbrida: combina adaptadores LoRA con una capa de mezcla de expertos (MoE) y se apoya en aprendizaje continuo sobre secuencias de tareas. Los checkpoints se cargan sobre dos modelos base congelados según la variante: `meta-llama/Llama-3.1-8B-Instruct` para la carpeta `llama31` y `Qwen/Qwen3-8B` para `qwen3_8b`. Esto implica que el número de parámetros efectivos del sistema completo ronda los 8.000 millones del backbone más los adaptadores y expertos añadidos, aunque el repositorio no desglosa ese recuento.

El entrenamiento se organiza en secuencias de tareas del benchmark TRACE (ocho tareas en el orden principal) y se evalúa con múltiples semillas (2025, 2026 y 2027 para Llama-3.1-8B; 2025-2027 para Qwen3-8B). La carpeta `3_rebuttal` incluye experimentos adicionales: orden inverso de tareas, mezcla de replay real para las líneas base, barrido del tamaño de replay, MoE-LPR con replay de backbone, una secuencia de diez tareas (KMMLU-ko, KodCode más TRACE), generación libre, replay sin token de inicio de secuencia (no-BoS), gradient split y ablación del margen. La carpeta `4_dymoe_starmoe` contiene variantes DyMoE (16 expertos de rango 4 por tarea, variante de router compartido por capas, 1 experto por tarea) y StaR-MoE sobre TRACE. No se especifican el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo RLHF o DPO.

## Capacidades

- Aprendizaje continuo multi-tarea: el sistema está diseñado para encadenar tareas sin olvidar las anteriores, mediante adaptadores LoRA y expertos MoE.
- Clasificación y razonamiento sobre texto: las tareas de TRACE incluyen C-STANCE (stance detection en chino), FOMC (clasificación de comunicados de la Reserva Federal) y 20Minuten (resumen de noticias en alemán).
- Generación y resumen: MeetingBank (resumen de reuniones) y 20Minuten evalúan la capacidad de síntesis.
- Generación de código: Py150 evalúa modelos sobre código Python.
- Razonamiento científico y matemático: ScienceQA y NumGLUE-cm / NumGLUE-ds cubren preguntas de ciencia y problemas numéricos.
- Capacidades multilingües: el conjunto de tareas incluye chino, inglés y alemán, y los experimentos de la carpeta `3_rebuttal` añaden KMMLU-ko (coreano).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Reproducción de resultados de investigación: cargar los checkpoints sobre Llama-3.1-8B-Instruct o Qwen3-8B para replicar las cifras del artículo sobre TRACE y verificar el comportamiento del método frente a las líneas base.
- Evaluación de olvido catastrófico: usar las secuencias de ocho y diez tareas para medir la retención de tareas antiguas tras el entrenamiento en tareas nuevas, comparando Konkuk con EWC, O-LoRA, S-LoRA y MoE-LPR.
- Estudio de mezcla de expertos con LoRA: analizar las variantes DyMoE y StaR-MoE incluidas en `4_dymoe_starmoe` para comparar configuraciones de router y número de expertos por tarea.
- Investigación en adaptación eficiente de parámetros: los adaptadores LoRA por tarea de S-LoRA y los checkpoints de Konkuk permiten estudiar el coste de almacenamiento y la fusión de adaptadores en orden de evaluación.
- Experimentos de replay: la carpeta `3_rebuttal` ofrece configuraciones de replay real, replay autogenerado y barridos de tamaño de replay útiles para investigar estrategias de retención de datos.
- Docencia y formación: servir como material práctico para cursos de aprendizaje continuo, mostrando cómo se estructuran checkpoints, semillas y ablaciones en un estudio reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en el repositorio. Como referencia, el backbone Llama-3.1-8B-Instruct requiere del orden de 16 GB en FP16 solo para los pesos, más el overhead de los adaptadores y expertos; Qwen3-8B presenta un perfil similar, pero el repositorio no confirma cifras.
- GPU recomendadas: no disponible. Por el tamaño del backbone, serían necesarias GPU con al menos 24 GB de VRAM para FP16 (A10G, L4, RTX 4090) o 80 GB (A100, H100) para mayor margen y lotes grandes.
- Compatibilidad con GPU de consumo: probable en cuantización de 4 bits sobre RTX 3090 o RTX 4090, pero no verificado ni documentado por el autor.
- Opciones de despliegue: no se especifican. Al tratarse de adaptadores sobre modelos base de Hugging Face, cabría esperar compatibilidad con `transformers` y PEFT, pero el repositorio no lo confirma ni menciona vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| konkuk_final | Adaptadores sobre backbone de 8B | no disponible | LoRA + MoE para aprendizaje continuo | other | Hugging Face (YeMoKoo/konkuk_final) |
| MoE-LPR | no disponible | no disponible | Mezcla de expertos con LoRA para aprendizaje continuo | no disponible | Referenciado como línea base en el repositorio |
| DyMoE | no disponible | no disponible | MoE dinámico con 16 expertos de rango 4 por tarea | no disponible | Incluido en `4_dymoe_starmoe` |
| Lifelong-MoE | no disponible | no disponible | MoE para aprendizaje continuo | no disponible | Referenciado como línea base en el repositorio |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la presencia de estos métodos como líneas base dentro del propio repositorio.

## Limitaciones y advertencias

- No es un modelo de propósito general: son checkpoints de investigación que deben cargarse sobre un backbone concreto (`meta-llama/Llama-3.1-8B-Instruct` o `Qwen/Qwen3-8B`); usarlos con otro modelo base no funcionará.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial queda sin garantías y requiere contactar con el autor o revisar el artículo asociado.
- Idiomas no declarados formalmente: aunque las tareas cubren chino, inglés, alemán y coreano, no hay una declaración de cobertura lingüística general.
- Riesgo de olvido residual: como todo método de aprendizaje continuo, la retención de tareas antiguas puede degradarse; el repositorio incluye experimentos para medirlo, pero no se ofrecen garantías.
- Sesgos: no documentados; los datasets de TRACE (FOMC, C-STANCE) pueden introducir sesgos políticos o financieros específicos.
- Riesgo de alucinación: no evaluado en la información disponible; los benchmarks de TRACE se centran en tareas discriminativas y de generación acotada.
- Sin datos de cuantización ni de formato de pesos: la integración en pipelines de producción requeriría trabajo adicional de conversión y validación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/YeMoKoo/konkuk_final
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Benchmark TRACE: no disponible en la información proporcionada
- Artículo asociado: no disponible en la información proporcionada
