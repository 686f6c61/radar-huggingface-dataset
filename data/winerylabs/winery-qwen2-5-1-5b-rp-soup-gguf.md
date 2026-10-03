# WineryLabs/Winery-Qwen2.5-1.5B-RP-Soup-GGUF

## Resumen

Winery-Qwen2.5-1.5B-RP-Soup-GGUF es un modelo de generacion de texto obtenido mediante la tecnica de "model soup" (fusion de pesos) a partir de ocho checkpoints derivados de Qwen2.5-1.5B, todos ellos orientados a rol (roleplay) y escritura creativa. Lo publica WineryLabs, un autor que distribuye merges experimentales en formato GGUF. El objetivo declarado por las etiquetas es ofrecer un modelo pequeno y conversacional especializado en narrativa de fantasia, personajes y dialogo de rol, empaquetado para su uso directo con llama.cpp.

El modelo parte de la familia Qwen2.5, una serie de LLM densos, decoder-only y multilingues de Alibaba, de la que existe una variante de 1.5B parametros entrenada sobre un corpus de hasta 18 billones de tokens. Al ser un merge de pesos (no un reentrenamiento), hereda la arquitectura y el conocimiento base de Qwen2.5-1.5B, pero recombina las capacidades de escritura, instruccion y "abliteracion" (eliminacion de rechazos) presentes en los checkpoints fuente.

Su relevancia es practica: se trata de un modelo de 1.5B parametros en cuantizacion GGUF, lo que lo hace ejecutable en hardware de consumo muy modesto, con una licencia Apache 2.0 declarada en las etiquetas del repositorio. La informacion publicada sobre el modelo es minima: no hay ficha tecnica extendida, ni detalle de los ratios de mezcla, ni datos de evaluacion, ni confirmacion de la ventana de contexto resultante tras el merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (heredada de Qwen2.5-1.5B) |
| Parametros totales | 1.5B (aproximadamente; la etiqueta de HuggingFace indica "2B") |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para el merge; el Qwen2.5-1.5B base soporta 32.768 tokens nativos (ampliable a 128K con YaRN) |
| Tipos de cuantizacion | formato GGUF; los niveles concretos publicados no estan detallados en la informacion disponible |
| Idiomas soportados | no disponibles en la ficha (la familia Qwen2.5 base es multilingue) |
| Licencia | apache-2.0 segun las etiquetas del repositorio; el campo de licencia aparece como "no disponible" |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de un "model soup": una fusion de los pesos de ocho checkpoints. Segun las etiquetas `base_model` del repositorio, las fuentes son: BeaverAI/Qwen2.5-QwQ-RP-Draft-v0.2-1.5B, EVA-UNIT-01/EVA-D-Qwen2.5-1.5B-v0.0, EVA-UNIT-01/EVA-Qwen2.5-1.5B-v0.0, Goekdeniz-Guelmez/Josiefied-Qwen2.5-1.5B-Instruct-abliterated-v1, NathanRoll/writing-rlvr-qwen2.5-1.5b, ReXeeD/Luminus-1.5B-Roleplay, dphn/Dolphin3.0-Qwen2.5-1.5B y nbeerbower/EVA-abliterated-TIES-Qwen2.5-1.5B. Varias de estas fuentes son a su vez merges de otras, lo que implica una combinacion en varios niveles.

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer denso, decoder-only, con atencion estandar (no se documenta uso de atencion lineal, SSM ni arquitecturas hibridas). La familia Qwen2.5 se preentreno sobre un corpus de hasta 18 billones de tokens con soporte multilingue, y sus variantes instruct incorporan ajuste por instrucciones. El proceso concreto de mezcla (metodo, pesos, ratio por componente) no esta documentado en la informacion disponible, ni tampoco si hubo etapas adicionales de RLHF, DPO o RLVR tras la fusion.

La caracteristica diferencial del conjunto de fuentes es la presencia de variantes "abliterated" (EVA-abliterated-TIES y Josiefied-Instruct-abliterated), que reducen la tendencia del modelo a rechazar peticiones, y de checkpoints especificos de rol (Luminus-1.5B-Roleplay, QwQ-RP-Draft), lo que orienta el resultado hacia la escritura creativa y la interpretacion de personajes.

## Capacidades

- Generacion de texto conversacional y narrativo, orientada a roleplay y escritura creativa (fantasia, personajes, dialogo).
- Interpretacion de personajes y mantenimiento de estilo narrativo gracias a las fuentes de rol y escritura incluidas en la mezcla.
- Menor tendencia al rechazo en comparacion con modelos instruct estandar, por la incorporacion de checkpoints abliterados (comportamiento esperado, no verificado en la informacion disponible).
- Capacidades de instruccion y conversacion heredadas de Qwen2.5-1.5B-Instruct y Dolphin3.0-Qwen2.5-1.5B.
- Soporte multilingue probable por herencia de Qwen2.5, aunque no confirmado para este merge.
- Soporte de tool calling / function calling: no disponible / no documentado para este merge.
- Soporte de agentes y razonamiento multi-paso: no disponible / no documentado.
- Capacidades de vision o audio: no disponibles (modelo de solo texto).
- Modo "thinking": no confirmado, aunque una de las fuentes (QwQ-RP-Draft) sugiere influencia de estilos de razonamiento; no verificado.

## Casos de uso

- Roleplay conversacional en local: el modelo puede interpretar personajes y mantener dialogos multi-turno en un equipo de consumo, ya que su tamano de 1.5B en GGUF permite ejecucion en CPU o GPU modesta con llama.cpp.
- Escritura creativa y narrativa de fantasia: util como asistente para generar escenas, descripciones y dialogos, aprovechando las fuentes especializadas en escritura (NathanRoll/writing-rlvr y EVA).
- Prototipado rapido de chatbots con personalidad: al estar en GGUF, se puede desplegar en servidores pequenos o incluso en Raspberry Pi para demos de asistentes con caracter definido.
- Generacion de contenido de ficcion interactiva: integrable en motores de aventuras de texto o videojuegos narrativos donde el modelo produce respuestas dinamicas de personajes.
- Experimentacion con tecnicas de model merging: sirve como caso de estudio para investigar como se comporta una "soup" de ocho checkpoints de 1.5B en tareas de generacion abierta.
- Filtrado y variacion de respuestas en entornos sin censura estricta: la presencia de componentes abliterados permite escenarios creativos con menos rechazos, siempre bajo responsabilidad del operador.
- Inferencia en el borde (edge): su tamano reducido lo hace apto para aplicaciones offline de escritura asistida o generacion de texto en dispositivos con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de rol (por ejemplo, evaluaciones tipo EQ-Bench o MT-Bench), ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos para un modelo de 1.5B en GGUF, no confirmados en la ficha):
  - Cuantizacion Q4_K_M: en torno a 1 GB de pesos mas overhead de contexto.
  - Cuantizacion Q5_K_M: en torno a 1,1-1,2 GB.
  - Cuantizacion Q8_0: en torno a 1,6 GB.
  - F16: en torno a 3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; tambien funciona en CPU. GPUs de gama alta (A100, H100, RTX 4090) estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1650, e incluso GPUs integradas con suficiente memoria compartida) y en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI requieren formatos distintos (safetensors/HF) y no consumen GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En la practica, al ser un modelo de 1.5B, la generacion en GPU de consumo deberia ser de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Winery-Qwen2.5-1.5B-RP-Soup | 1.5B | no disponible | Roleplay / escritura creativa (merge) | apache-2.0 (segun etiquetas) | GGUF |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (128K con YaRN) | Instruccion general y multilingue | apache-2.0 | safetensors, GGUF |
| dphn/Dolphin3.0-Qwen2.5-1.5B | 1.5B | heredado de Qwen2.5-1.5B | Instruccion sin censura | no disponible | safetensors, GGUF |
| ReXeeD/Luminus-1.5B-Roleplay | 1.5B | heredado de Qwen2.5-1.5B | Roleplay | no disponible | safetensors, GGUF |

No se dispone de datos de rendimiento comparativos para fundamentar una comparacion cuantitativa; la tabla se limita a caracteristicas estructurales y de disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge de modelos pequenos y no documentado, no hay analisis de sesgos publicado. Los modelos de 1.5B tienden a reproducir sesgos presentes en el corpus base de Qwen2.5 y en los checkpoints de rol.
- Riesgo de alucinacion: elevado para un modelo de 1.5B, especialmente en tareas de conocimiento factual; su punto fuerte es la generacion creativa, no la precision.
- Limitaciones de contexto e idioma: la ventana de contexto resultante tras el merge no esta documentada; se desconoce si conserva los 32.768 tokens nativos de Qwen2.5-1.5B. El soporte multilingue no esta confirmado para este merge concreto.
- Restricciones de licencia: las etiquetas indican apache-2.0, pero el campo de licencia aparece como "no disponible" en la ficha; conviene verificar la licencia antes de un uso comercial. Al ser un derivado de Qwen2.5, se aplican tambien las condiciones de la licencia Apache 2.0 del modelo base.
- Componentes "abliterated": la mezcla incorpora checkpoints sin mecanismos de rechazo, lo que puede producir respuestas inapropiadas o no alineadas; requiere supervision humana en cualquier despliegue abierto.
- Ausencia de evaluacion: no hay benchmarks, ejemplos de uso ni documentacion de la mezcla, lo que dificulta estimar su calidad frente a alternativas.
- Trazabilidad limitada: no se especifican los ratios de mezcla ni el metodo de fusion, lo que reduce la reproducibilidad.
- Fecha de publicacion atipica: la ficha indica creacion en 2026, dato que conviene contrastar con el repositorio actual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WineryLabs/Winery-Qwen2.5-1.5B-RP-Soup-GGUF
- Perfil del autor: https://huggingface.co/WineryLabs
- Qwen2.5-1.5B-Instruct-GGUF (modelo base de referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Repositorio Qwen2.5 (referencia de la familia): https://github.com/mx4ai/qwen2.5
- Checkpoint fuente dphn/Dolphin3.0-Qwen2.5-1.5B: https://huggingface.co/dphn/Dolphin3.0-Qwen2.5-1.5B
- Checkpoint fuente ReXeeD/Luminus-1.5B-Roleplay: https://huggingface.co/ReXeeD/Luminus-1.5B-Roleplay
- Checkpoint fuente nbeerbower/EVA-abliterated-TIES-Qwen2.5-1.5B: https://huggingface.co/nbeerbower/EVA-abliterated-TIES-Qwen2.5-1.5B
