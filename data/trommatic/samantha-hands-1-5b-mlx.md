# trommatic/samantha-hands-1.5b-mlx

## Resumen

Samantha-hands-1.5b-mlx es un modelo de generacion de texto conversacional de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), publicado por el usuario trommatic en Hugging Face. Se distribuye en formato MLX, la libreria de Apple para ejecutar modelos de aprendizaje automatico de forma nativa en silicio Apple (M-series), y esta construido sobre la arquitectura Qwen2, segun indican las etiquetas del repositorio. El modelo se ofrece cuantizado en 4 bits, lo que reduce el peso en disco y memoria a costa de cierta perdida de precision.

La model card publicada por el autor es practicamente vacia: solo declara el idioma (ingles), la etiqueta de pipeline (text-generation) y la libreria (mlx). No se documentan datos de entrenamiento, composicion del dataset, proceso de alineacion ni resultados de evaluacion. El repositorio tiene un tamano de 5,2 GB y apenas 16 descargas, lo que sugiere un proyecto personal o experimental de baja difusion.

Su relevancia practica es limitada y muy especifica: sirve como ejemplo de modelo pequeno conversacional empaquetado para inferencia local en Mac mediante MLX. Para cualquier evaluacion seria de capacidades o de calidad, la ausencia total de documentacion tecnica y de benchmarks impide sacar conclusiones fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, segun etiqueta del repo) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (unica variante publicada) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (4-bit) |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es la etiqueta `qwen2` del repositorio, que corresponde a un transformer decoder-only con atencion causal, habitual en la familia Qwen2 de Alibaba. Con 1.543.714.304 parametros, el modelo encaja en el rango de los modelos pequenos de esa familia (cercano a la variante de 1,5B). No se dispone de datos sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre el uso de atencion con ventana deslizante o de mecanismos de RoPE.

Respecto al entrenamiento, no hay informacion publicada: se desconoce el volumen de tokens, la composicion del corpus, si hubo ajuste supervisado, RLHF o DPO, y si el modelo es un ajuste fino de una base Qwen2 o un entrenamiento desde cero. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento. La unica decision tecnica verificable es la cuantizacion en 4 bits empaquetada para MLX.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Generacion de texto autoregresiva estandar (pipeline `text-generation`).
- Ejecucion nativa en Apple Silicon mediante MLX, con pesos ya cuantizados en 4 bits.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local en Mac: el modelo puede cargarse con MLX en un equipo Apple Silicon para experimentar con generacion de texto conversacional sin depender de la nube, gracias a sus pesos en 4 bits y su tamano reducido.
- Chatbot de demostracion en ingles: adecuado para montar una interfaz conversacional simple en local con fines de prueba, dado su caracter conversacional declarado.
- Evaluacion de la libreria MLX: sirve como banco de pruebas para medir latencia y consumo de memoria de un modelo de 1,5B cuantizado en 4 bits en distintos chips Apple.
- Base para ajuste fino experimental: al ser un modelo pequeno, puede servir como punto de partida para experimentos de fine-tuning en ingles sobre tareas acotadas, siempre que se verifique la licencia (actualmente no disponible).
- Generacion de texto auxiliar sin requisitos de calidad alta: borradores, respuestas cortas o completado de texto en entornos de desarrollo donde la privacidad local prime sobre la precision.
- Educacion y aprendizaje: util para estudiar como se empaqueta y distribuye un modelo Qwen2 cuantizado en MLX, revisando la estructura del repositorio safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con 1,543 mil millones de parametros en 4 bits, el peso de los pesos ronda los 0,8-1 GB; sumando overhead de inferencia (KV cache y buffers), cabe holgadamente en 2-4 GB de memoria.
- GPU recomendadas: al estar en formato MLX, el destino natural son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada. No es un formato pensado para GPU NVIDIA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; en el ecosistema NVIDIA requeriria conversion previa del formato.
- Opciones de despliegue: MLX y `mlx-lm` son las vias nativas; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| trommatic/samantha-hands-1.5b-mlx | 1,54B | no disponible | MLX 4-bit | no disponible | Model card vacia, sin benchmarks |
| Qwen2-1.5B (base oficial) | 1,54B | 32.768 tokens (segun documentacion publica de Qwen2) | safetensors, GGUF, etc. | Apache 2.0 (segun publicacion de Qwen) | Modelo de referencia con documentacion y evaluaciones publicas |
| SmolLM2-1.7B | 1,7B | 8.192 tokens (segun su model card publica) | safetensors, GGUF | Apache 2.0 | Alternativa pequena con benchmarks publicados |
| Llama 3.2 1B | 1,24B | 128.000 tokens (segun su model card publica) | safetensors, GGUF | Llama 3.2 Community License | Modelo pequeno ampliamente soportado por herramientas |

Nota: los datos de los modelos comparativos provienen de sus fichas publicas conocidas; los de samantha-hands-1.5b-mlx no estan documentados y no pueden contrastarse.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre entrenamiento, datos, alineacion ni evaluacion, lo que impide validar su calidad o seguridad.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; desaconsejado en produccion hasta aclararlo.
- Solo ingles declarado: no hay evidencia de capacidades multilingues; el rendimiento en castellano es impredecible.
- Riesgo de alucinacion: sin datos de alineacion ni evaluaciones, se desconoce el grado de fiabilidad factual.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden identificar sesgos conocidos.
- Contexto no documentado: se desconoce la ventana maxima, lo que limita el diseno de aplicaciones con contexto largo.
- Formato restrictivo: los pesos estan en MLX 4-bit, lo que dificulta su uso fuera del ecosistema Apple sin conversion.
- Baja adopcion: 16 descargas y 0 likes; sin comunidad que reporte incidencias ni mejoras.

## Enlaces

- Hugging Face: https://huggingface.co/trommatic/samantha-hands-1.5b-mlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentacion de Qwen2 (arquitectura base declarada): https://huggingface.co/Qwen/Qwen2-1.5B
