# SubMaroon/Boulesis-26B-A4B-GGUF

## Resumen

Boulesis-26B-A4B es un modelo experimental de roleplay desarrollado por SubMaroon, basado en un merge de Gemma 4 26B A4B. En lugar de mezclar modelos completos, el autor modifica circuitos de atención específicos para explorar si el routing de atención puede reducir la reactividad de los personajes en juegos de rol. El modelo combina un cuerpo abliterado de Gemma 4 26B A4B, un `lm_head` transplantado de otro modelo, una edición de QK routing mediante task arithmetic y una LoRA entrenada en narrativa de roleplay. Todo lo demás se mantiene bit-for-bit idéntico al modelo base.

Con 25.233.220.894 parámetros totales y una arquitectura MoE (el sufijo A4B sugiere alrededor de 4 mil millones de parámetros activos), el modelo se publica en formato GGUF, lo que permite su ejecución local con herramientas compatibles. La información disponible no especifica la longitud de contexto, aunque la LoRA se entrenó con una ventana de 3584 tokens. Se trata de un experimento de investigación en interpretabilidad y merges de modelos, no de un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4 26B A4B |
| Parametros totales | 25.233.220.894 |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 26B parámetros totales, con alrededor de 4B activos según el sufijo A4B. La arquitectura base es Gemma 4 26B A4B, pero el autor aplica modificaciones quirúrgicas en circuitos de atención. Según la model card, la atención se divide en dos circuitos: QK (`q_proj` y `k_proj`) que decide dónde mira el modelo, y OV (`v_proj` y `o_proj`) que decide qué información se extrae de ahí. Boulesis edita el circuito QK mediante task arithmetic, tomando la diferencia entre un modelo de razonamiento (Pantheon-Reasoning-1.1) y su base, y la añade con un factor α = 0.6 en capas deslizantes. El `lm_head` se transplanta desde `Gryphe/Gemma-4-26B-A4B-StyleTune-V2`, y los circuitos OV reciben una LoRA (r=32, alpha=64) entrenada sobre 5.1k sesiones de roleplay narrativo con ventana de 3584 tokens, lr 2e-5 y una sola época. La pérdida de evaluación pasó de 1.961 a 1.659 a lo largo de 8 checkpoints, sin sobreajuste.

El cuerpo del modelo es un Gemma 4 26B A4B abliterado (ARA-abliterated), lo que elimina rechazos para que el adaptador no gaste capacidad en resistir instrucciones. El autor destaca que la edición de QK es barata y reversible, a diferencia de un reentrenamiento completo. No se menciona uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto narrativo para roleplay, con capacidad de mantener separados hasta cuatro personajes con nombre en una misma respuesta.
- Cumplimiento estricto de reglas negativas en tarjetas de personaje, como no reconocer al jugador salvo que este insinúe su pasado, o no hablar por el compañero del jugador.
- Razonamiento mediante el canal de pensamiento nativo de Gemma 4, que no se activa sin que se le pida y no genera etiquetas propias.
- Vocabulario amplio en comparación con otras builds del mismo experimento, según las mediciones del autor.
- Tendencia a cerrar los turnos con decisiones u órdenes en lugar de preguntas, lo que favorece la narrativa dirigida por el personaje.
- No se menciona soporte de tool calling ni capacidades multimodales en la información disponible.

## Casos de uso

- Roleplay narrativo con múltiples PNJs: el modelo mantiene separados varios personajes en una misma respuesta, ideal para juegos de rol de mesa o simulaciones de escenas con varios interlocutores.
- Historias interactivas con reglas de personaje: cumple reglas negativas complejas, como no reconocer al jugador salvo que se insinúe su pasado, lo que permite narrativas coherentes con restricciones explícitas.
- Generación de diálogo para videojuegos: cierra los turnos con decisiones en lugar de preguntas, lo que facilita la escritura de escenas donde los PNJs actúan por iniciativa propia.
- Análisis de lore y detalles en tarjetas de personaje: el modelo detecta conexiones entre detalles del contexto, como apellidos o casas nobles, y las integra en la narrativa sin necesidad de que se le señalen.
- Investigación en interpretabilidad y merges de modelos: sirve como caso de estudio de edición de circuitos de atención específicos, con verificación bit-for-bit del resto de componentes.
- Experimentación local con GGUF: gracias a su formato GGUF, puede ejecutarse en local con llama.cpp u Ollama para pruebas rápidas de roleplay y evaluación de comportamiento narrativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor realizó mediciones internas comparando nueve builds con 108 generaciones greedy y prompts idénticos, pero no se trata de benchmarks estándar como MMLU, HumanEval o GSM8K. Los resultados reportados son cualitativos o métricas propias, como la longitud del bloque de razonamiento o la variedad léxica, y no permiten comparar el modelo con otros de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- ¿Cabe en consumer GPU? El tamaño del repositorio es de 16.8 GB, lo que sugiere que una cuantización GGUF de tamaño similar podría ejecutarse en GPUs de consumo con 16-24 GB de VRAM, pero no hay datos confirmados.
- Opciones de despliegue: llama.cpp, Ollama (compatible con GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros modelos. El modelo se basa en Gemma 4 26B A4B, cuyo repositorio GGUF original es `unsloth/gemma-4-26B-A4B-it-GGUF`, pero no se dispone de resultados de benchmarks ni especificaciones de ese modelo para establecer una comparación directa.

## Limitaciones y advertencias

- Modelo experimental: no es un modelo de producción y no ha sido validado en entornos reales más allá de las pruebas del autor.
- Licencia Gemma: impone restricciones de uso, incluidos términos específicos para uso comercial, según los términos de Google.
- Idioma: solo soporta inglés (en), sin soporte multilingüe.
- Sin benchmarks estándar: las mejoras reportadas se basan en mediciones internas del autor, no en evaluaciones externas comparables.
- El autor indica que el donante de razonamiento no piensa en personaje, y que algunas mejoras, como el cierre de turnos con decisiones, no fueron detectadas por métricas automáticas.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sin datos sobre longitud de contexto ni sesgos específicos del modelo.

## Enlaces

- https://huggingface.co/SubMaroon/Boulesis-26B-A4B-GGUF
- https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
