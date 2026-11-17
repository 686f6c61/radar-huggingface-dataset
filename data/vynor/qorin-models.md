# vynor/qorin-models

## Resumen

QORIN (The Quiet Origin of Reasoning and Intelligence Networks) es una familia de modelos de lenguaje de pequeno tamano (SLM) publicada por el usuario vynor en Hugging Face. El repositorio contiene dos checkpoints entrenados con fine-tuning supervisado (SFT): qorin-100m, en su version SFT v3, y qorin-500m, en su version SFT Exp-F. Ambos se distribuyen como pesos en formato PyTorch (`.pt`) acompanados de sus tokenizers BPE propios, con licencia MIT.

El modelo se presenta con las etiquetas "slm" y "reasoning", lo que sugiere un enfoque en tareas de razonamiento dentro de un presupuesto de computo reducido. La arquitectura es un transformer decoder-only con atencion agrupada (GQA), FFN SwiGLU y embeddings rotatorios (RoPE), con ventanas de contexto de 4.096 tokens para el modelo de 100M y 2.048 tokens para el de 500M.

La relevancia de esta publicacion es limitada pero concreta: ofrece pesos abiertos de modelos por debajo de 1.000 millones de parametros, utiles para experimentacion local, prototipado en CPU o GPU de consumo y estudio de tecnicas de entrenamiento en regimen de bajo computo. No obstante, la informacion publicada es escasa (sin datos de entrenamiento, benchmarks ni evaluaciones) y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU FFN y RoPE |
| Parametros totales | 100M (qorin-100m) y 500M (qorin-500m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (qorin-100m); 2.048 tokens (qorin-500m) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch en fp32/fp16 sin indicar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); tokenizers BPE en directorios `tokenizer/` |

Detalles adicionales por checkpoint:

| Parametro | qorin-100m (SFT v3) | qorin-500m (SFT Exp-F) |
|---|---|---|
| Tamano del fichero | 617.289.583 bytes (~0,62 GB) | 2.078.616.611 bytes (~2,08 GB) |
| Capas | 14 | 20 |
| Cabezas de atencion | 12 | 24 |
| Cabezas KV (GQA) | 4 (ratio 3:1) | 4 (ratio 6:1) |
| Dimension FFN (SwiGLU) | 2.048 | 3.840 |
| RoPE theta / scale | 10k / 8.0 | 10k / 1.0 |
| Vocabulario BPE | 16.000 | 32.768 |
| SHA-256 | d771ea9f5465e3bcf2b619a32f7797742e500a01704a4d5f582eb5db4adc7510 | b5b7091e951e49263e7b55e78b1f6837b5713ffb2f197c20366f39f3cd9b1e4 |

## Arquitectura y entrenamiento

Ambos checkpoints emplean una arquitectura transformer decoder-only clasica. La atencion usa Grouped-Query Attention con 4 cabezas KV en los dos casos, lo que reduce el coste de memoria del KV cache: ratio 3:1 en el modelo de 100M (12 cabezas Q frente a 4 KV) y 6:1 en el de 500M (24 cabezas Q frente a 4 KV). La capa feed-forward es SwiGLU con dimensiones de 2.048 y 3.840 respectivamente. Los embeddings posicionales son RoPE con theta 10.000; en el modelo de 100M se aplica ademas un factor de escala de 8.0, presumiblemente para extender el contexto efectivo, mientras que el de 500M usa escala 1.0.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de preentrenamiento ni los detalles del SFT (datos, hiperparametros, posible uso de RLHF/DPO). Las etiquetas indican "reasoning" y "SFT", pero la model card no documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.). El tokenizer es propio en ambos casos, con vocabularios BPE de 16.000 y 32.768 tokens, lo que implica que no son compatibles con tokenizers de modelos establecidos.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Enfoque declarado en tareas de razonamiento, segun la etiqueta "reasoning" de la model card; no se especifica el tipo ni el alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Contexto util de 4.096 tokens (100M) y 2.048 tokens (500M) para conversaciones o documentos cortos.

## Casos de uso

- Prototipado local de pipelines de generacion de texto: ambos modelos caben en memoria de una GPU de consumo o incluso en CPU, lo que permite iterar sobre prompts y plantillas sin coste de API.
- Educacion e investigacion sobre transformers: la arquitectura es simple y esta documentada a nivel de capas y cabezas, lo que facilita su uso como banco de pruebas para estudiar GQA, RoPE o SwiGLU en modelos pequenos.
- Fine-tuning especifico de dominio: al ser pesos abiertos con licencia MIT y tamanos reducidos, se pueden ajustar con recursos modestos para tareas acotadas (clasificacion de texto, extraccion de entidades, generacion de respuestas cortas).
- Generacion de texto en dispositivos con recursos limitados: el checkpoint de 100M (~0,62 GB en el fichero publicado) es adecuado para entornos embebidos o de borde donde no cabe un modelo mayor.
- Experimentacion con tokenizers propios: los vocabularios BPE de 16k y 32k permiten estudiar el impacto del vocabulario en el rendimiento de modelos pequenos.
- Evaluacion comparativa de tecnicas de SFT: las versiones "SFT v3" y "SFT Exp-F" sugieren iteraciones de ajuste supervisado que pueden servir como referencia en estudios de ablation, siempre que se obtengan los datos de evaluacion por parte del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1,2 GB para qorin-100m y 2-4 GB para qorin-500m en funcion del tipo de dato (fp32/fp16) y de la longitud de contexto; no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo de 500M (GTX 1650, RTX 3050, RTX 4060); el modelo de 100M puede ejecutarse en GPUs integradas o en CPU.
- Cabe en GPU de consumo: si, en ambas variantes; el checkpoint de 100M es especialmente ligero.
- Opciones de despliegue: los pesos estan en formato PyTorch (`.pt`), por lo que requieren carga mediante `torch.load` y codigo propio; no se publican pesos en GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| qorin-100m | 100M | 4.096 | MIT | PyTorch `.pt` | no disponible |
| qorin-500m | 500M | 2.048 | MIT | PyTorch `.pt` | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificables de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, evaluaciones cualitativas ni datos de entrenamiento publicados, lo que impide estimar la calidad real del modelo.
- Riesgo elevado de alucinacion y de respuestas incoherentes, especialmente en el modelo de 100M con contexto de 4.096 tokens y vocabulario de 16k.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en ningun otro idioma concreto.
- Tokenizers propios no compatibles con ecosistemas estandar (Llama, Mistral, etc.), lo que complica la reutilizacion de herramientas y plantillas existentes.
- Formato de pesos `.pt` sin version safetensors ni GGUF: requiere codigo de carga propio y no se integra directamente en servidores de inferencia habituales.
- Sin informacion sobre sesgos, datos de entrenamiento ni filtrado de contenido; no apto para produccion sin una evaluacion exhaustiva previa.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal y etica del despliegue recae en el integrador.
- Repositorio sin descargas ni interacciones en el momento de la consulta: no hay comunidad ni soporte documentado.
- El contexto de 2.048 tokens del modelo de 500M es inferior al del modelo de 100M, lo que limita su uso en tareas de contexto largo pese a tener mas parametros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vynor/qorin-models
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
