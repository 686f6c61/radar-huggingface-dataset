# visproj/lantern-1.7b

## Resumen

Lantern-1.7B es un modelo de 1.720 millones de parámetros desarrollado por visproj, especializado en jugar niveles de mazmorras (NetHack/MiniHack) mediante llamadas a herramientas. Es un fine-tune de Qwen3-1.7B entrenado por destilación a partir de Beam 1.0, un modelo de 501B parámetros de Reflection: el estudiante aprende directamente de las llamadas a herramientas (`act` y `write_notes`) que el profesor realizó en los episodios ganadores del benchmark Lantern.

El problema que aborda es la reducción del coste de inferencia en agentes de juego: mientras el profesor Beam necesita una infraestructura de 501B parámetros, Lantern-1.7B puede ejecutarse en una sola GPU de consumo, logrando 11/40 victorias frente a 23/40 del profesor y 2/40 del modelo base sin entrenar. Esto lo hace relevante como prueba de concepto de destilación agéntica, donde un modelo pequeño aprende comportamiento de agente sin razonamiento intermedio (thinking mode desactivado).

Se trata de un modelo muy nicho: está entrenado exclusivamente con el formato de prompt y esquema de herramientas de Lantern, sobre 1.031 ejemplos de 58 episodios en 8 niveles de MiniHack. El propio autor lo califica de prueba de concepto, por lo que su uso fuera de ese entorno requiere reentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parámetros totales | 1.720.574.976 (dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B) |
| Tipos de cuantización | no disponible (pesos en bf16, 3,5 GB de repo) |
| Idiomas soportados | no disponible (entrenado con prompts en inglés de Lantern) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Lantern-1.7B parte de Qwen3-1.7B, un transformer denso de la familia Qwen3. El modelo hereda la arquitectura base sin modificaciones estructurales; la innovación está en el proceso de destilación: se recogieron todas las llamadas de Beam 1.0 (501B-A23B, de Reflection) en los episodios ganadores del benchmark Lantern, generando 1.031 ejemplos de 58 episodios en 8 niveles de MiniHack. Cada ejemplo contiene el system prompt y la observación exactos que vio Beam, junto con sus tool calls (`act` con una lista de movimientos, y `write_notes`). Se excluyeron episodios con versiones antiguas del prompt y partidas con intervención humana.

El entrenamiento fue un fine-tuning supervisado (SFT) con la librería TRL: 3 épocas, learning rate 1e-5 con decaimiento coseno, batch efectivo de 16, precisión bf16, en una sola A100. La función de pérdida se aplicó solo sobre la completion. La pérdida final de entrenamiento fue 0,37. Un detalle técnico relevante: el thinking mode de Qwen3 está desactivado, de modo que el estudiante responde directamente con una llamada a herramienta, sin reproducir el razonamiento del profesor. Esto reduce el coste por paso, a costa de rendimiento en niveles largos.

## Capacidades

- Generación de tool calls estructurados: responde con `act` (lista de movimientos en el juego) o `write_notes` (escritura de notas), siguiendo el esquema de herramientas de Lantern.
- Juego autónomo de niveles de MiniHack: navegar habitaciones, esquivar monstruos, recoger llaves y alcanzar salidas en niveles cortos y medianos.
- Compatible con servidores con function calling estándar: funciona con vLLM usando el parser de tool calls de Hermes y `--enable-auto-tool-choice`.
- Formato de conversación Qwen3 con thinking mode desactivable (`enable_thinking: false`).
- No está diseñado para uso general: no genera texto conversacional, no hace razonamiento general ni resuelve tareas fuera del formato de observación de Lantern.

## Casos de uso

- Agente jugador de MiniHack/NetHack de bajo coste: ejecuta niveles de mazmorra en una GPU de consumo en lugar de un modelo de 501B, adecuado para experimentación masiva con semillas y evaluación de políticas.
- Investigación en destilación agéntica: sirve como caso de estudio replicable para comparar SFT por imitación de trayectorias ganadoras frente a RL, dado que el dataset de entrenamiento es público.
- Baseline para benchmarks de agentes en juegos: sus 11/40 victorias y las tablas por nivel publicadas permiten comparar nuevos agentes en las mismas 8 condiciones de nivel.
- Estudio de transferencia sin razonamiento: útil para analizar cómo afecta eliminar el chain-of-thought del profesor al rendimiento en tareas de planificación multi-paso.
- Prototipado de pipelines agénticos con vLLM: su integración documentada con `--tool-call-parser hermes` facilita montar servidores de agentes con tool calling en minutos.
- Generación de datos sintéticos de juego: puede usarse para producir episodios adicionales de MiniHack que amplíen el dataset de entrenamiento, aunque con calidad limitada fuera de los niveles que domina.

## Benchmarks y rendimiento

Resultados publicados por el autor: mismos 8 niveles de MiniHack × 5 semillas, mismo prompt y herramientas, sin journal.

| Modelo | Victorias |
|---|---|
| Beam 1.0 (501B, profesor) | 23 / 40 |
| **Lantern-1.7B** | **11 / 40** |
| Qwen3-1.7B sin entrenar | 2 / 40 |

Resultados por nivel del estudiante: Small Room 5/5, Room with Monsters 2/5, Memento 2/5, Key Room 1/5, Corridors 1/5; sin victorias en River Crossing, Maze Walk ni Hide and Seek. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,5 GB en bf16 (tamaño del repo); con cuantización a 4 bits cabría en menos de 2 GB, aunque no hay pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU moderna con 8 GB de VRAM o más (RTX 3060, RTX 4090, A10, A100). El entrenamiento se realizó en una sola A100.
- Cabe con holgura en GPUs de consumo: una RTX 3060 de 12 GB o superior ejecuta el modelo en bf16 sin problemas.
- Despliegue: vLLM es la vía documentada (`vllm serve visproj/lantern-1.7b --enable-auto-tool-choice --tool-call-parser hermes`), con `{"chat_template_kwargs": {"enable_thinking": false}}` en el cuerpo de la petición. Compatible con transformers; no hay GGUF ni soporte documentado de llama.cpp u Ollama.
- Latencia y throughput: no disponibles; al ser un modelo denso de 1,7B en bf16, la inferencia por token es rápida en cualquier GPU reciente.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Victorias en Lantern | Licencia |
|---|---|---|---|---|
| Lantern-1.7B | 1,72B | Juego de MiniHack vía tool calls | 11 / 40 | Apache-2.0 |
| Beam 1.0 (profesor) | 501B (23B activos, MoE) | Agente generalista con razonamiento | 23 / 40 | Apache-2.0 |
| Qwen3-1.7B (base) | 1,72B | Modelo general | 2 / 40 | Apache-2.0 |

Lantern-1.7B multiplica por 5,5 las victorias de su modelo base en la tarea objetivo con el mismo tamaño y coste de inferencia, aunque sigue lejos del profesor. No hay disponibles otros modelos destilados comparables específicos para MiniHack en la información proporcionada.

## Limitaciones y advertencias

- Datos de entrenamiento muy reducidos: 1.031 ejemplos; el propio autor lo califica de prueba de concepto, no de modelo de producción.
- Sesgo hacia juego limpio: solo aprendió de las victorias de Beam, por lo que tiene pocos ejemplos de recuperación tras errores.
- Sin razonamiento intermedio: el thinking mode está desactivado, lo que penaliza especialmente los niveles largos (no gana ninguno de los tres niveles más complejos).
- Sobrespecialización en formato: entrenado con el formato exacto de observación de Lantern; otros prompts, juegos o entornos requieren reentrenamiento.
- Riesgo de alucinación fuera de dominio: no evaluado para uso general, no debe emplearse como asistente conversacional ni para tareas de propósito general.
- Idiomas: no declarados; el entrenamiento usa prompts en inglés de Lantern, por lo que el comportamiento en castellano no está garantizado.
- Licencia: Apache-2.0, sin restricciones para uso comercial; Beam 1.0 (profesor) también es Apache-2.0 y su model card permite explícitamente la destilación.

## Enlaces

- Modelo: https://huggingface.co/visproj/lantern-1.7b
- Dataset de entrenamiento: https://huggingface.co/datasets/visproj/lantern-episodes
- Space de Lantern (tablas por nivel): https://huggingface.co/spaces/visproj/lantern
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/reflection/Beam-1.0-501B-A23B
