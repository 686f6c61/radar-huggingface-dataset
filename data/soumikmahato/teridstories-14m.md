# soumikmahato/TeridStories-14M

## Resumen

TeridStories-14M es un modelo de lenguaje decoder-only de muy pequeno tamano (14.162.304 parametros) entrenado desde cero por el usuario soumikmahato sobre el dataset `karpathy/tinystories-gpt4-clean`. Se trata de un modelo base preentrenado, no ajustado para instrucciones ni para conversacion, cuyo proposito declarado es la completacion de historias en ingles y la investigacion sobre modelos de lenguaje de escala reducida.

Arquitectonicamente sigue el diseno de Llama (Transformer decoder-only con RoPE, RMSNorm y SwiGLU), con una dimension oculta de 384, 8 capas, 6 cabezas de atencion y 2 cabezas KV (GQA), un vocabulario de 4096 tokens y una longitud de contexto de solo 256 tokens. Su tamano de repositorio es de aproximadamente 0,1 GB, lo que lo hace trivial de desplegar en cualquier hardware, incluido CPU.

Es relevante como pieza educativa y de experimentacion: permite reproducir el pipeline completo de entrenamiento, tokenizacion y despliegue de un LLM con recursos minimos, y sirve como banco de pruebas para tecnicas de cuantizacion y de inferencia local. No obstante, sus capacidades practicas son muy limitadas por el contexto de 256 tokens y el vocabulario de 4096 entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con Llama (RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 14.162.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | GGUF F16 publicado por el autor; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (uso declarado: ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con las siguientes dimensiones: hidden size 384, 8 capas, 6 cabezas de atencion, 2 cabezas KV (lo que implica grouped-query attention con un ratio de 3 cabezas de query por cabeza KV), dimension intermedia 1024, vocabulario de 4096 tokens y contexto de 256 tokens. Emplea RoPE como codificacion posicional, RMSNorm para normalizacion y SwiGLU como activacion, siguiendo de cerca la configuracion de los modelos Llama de pequena escala.

El entrenamiento se realizo desde cero sobre el dataset `karpathy/tinystories-gpt4-clean`, una coleccion de cuentos infantiles sinteticos generados con GPT-4 y filtrados. La model card indica un checkpoint update de 16775, pero no especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva y completacion de historias cortas en ingles.
- Modelo base preentrenado: no esta ajustado para seguir instrucciones ni para mantener conversaciones.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingue no documentada; el uso previsto es exclusivamente en ingles.
- Sin modo de razonamiento explicito (thinking mode), vision ni audio.
- Vocabulario muy reducido (4096 tokens), lo que limita la cobertura lexica y la eficiencia de codificacion.

## Casos de uso

- Investigacion educativa sobre entrenamiento de LLM: permite reproducir el ciclo completo de preentrenamiento, guardado de checkpoints y exportacion a GGUF con un coste computacional minimo, adecuado para cursos y laboratorios.
- Completacion de cuentos infantiles: dado un prompt inicial en ingles, el modelo genera continuaciones coherentes a escala de parrafo, aprovechando que fue entrenado especificamente sobre TinyStories.
- Banco de pruebas de cuantizacion: su tamano de 14M parametros permite comparar el impacto de F16 frente a otras precisiones en calidad de generacion sin necesidad de GPU dedicada.
- Validacion de pipelines de despliegue: sirve para probar integraciones con transformers, text-generation-inference o llama.cpp antes de escalar a modelos mayores, verificando el flujo de carga de safetensors y GGUF.
- Generacion de datos sinteticos a pequena escala: puede producir textos cortos y simples para tareas de aumento de datos o pruebas de pipelines de NLP.
- Experimentos de interpretabilidad: con solo 8 capas y 6 cabezas, es un sujeto manejable para analisis de activaciones, atencion y circuitos internos sin requerir infraestructura significativa.
- Demostraciones en entornos con recursos limitados: cabe en CPU y en cualquier GPU consumer, lo que facilita demos en portatiles o dispositivos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 28 MB para los pesos (14,16M parametros x 2 bytes), mas overhead de activaciones y cache KV, en torno a 50-100 MB en total.
- VRAM estimada en cuantizaciones de 4 bits (si se generan): aproximadamente 7-10 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en GPUs integradas.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp u Ollama mediante el GGUF F16 publicado, y text-generation-inference (el modelo declara compatibilidad con endpoints).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia en milisegundos incluso en CPU, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| TeridStories-14M | 14,16M | 256 | no disponible | no disponible (uso en ingles) | Hugging Face (safetensors, GGUF F16) |
| TinyStories-1M (referencia del dataset) | ~1M | no disponible | no disponible | no disponible | Hugging Face |
| TinyLlama-1.1B | ~1,1B | 2048 | Apache 2.0 | ingles principalmente | Hugging Face |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | multilingue | Hugging Face |

La comparativa se limita a referencias de la misma familia de modelos pequenos orientados a generacion de texto; no se dispone de datos de rendimiento comparativo publicados para TeridStories-14M.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a comandos ni mantiene conversaciones de forma fiable.
- Contexto de solo 256 tokens: insuficiente para tareas que requieran contexto medio o largo, y muy restrictivo para documentos o dialogos multi-turno.
- Vocabulario de 4096 tokens: cobertura lexica limitada, mayor fragmentacion y peor eficiencia en la codificacion de texto.
- Entrenado exclusivamente sobre cuentos infantiles sinteticos: el dominio es muy estrecho y la generacion fuera de ese registro sera de baja calidad.
- Riesgo alto de alucinacion y de incoherencia en temas factuales o tecnicos.
- Sesgos conocidos: no documentados por el autor; al derivar de datos sinteticos generados por GPT-4, puede heredar sesgos de ese modelo, pero no hay analisis publicado.
- Licencia no especificada: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas soportados no declarados formalmente; el uso previsto es ingles.
- Sin datos de benchmarks ni evaluaciones de calidad publicadas.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema practicamente inexistente, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/soumikmahato/TeridStories-14M
- Dataset de entrenamiento: https://huggingface.co/datasets/karpathy/tinystories-gpt4-clean
