# yinita/ps4mas-sft-4b-claude-x5-single-ep3-mask16k

## Resumen

Este modelo es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-4B, desarrollado por el usuario yinita. Su objetivo es reproducir el comportamiento de un modelo previo de 9B, denominado best_sft_claude_x5_single_ep3, pero a escala 4B. Se trata de un modelo de generación de texto entrenado mediante fine-tuning completo (full fine-tune) sobre un conjunto de datos de razonamiento multi-hop destilado de Claude, con una máscara de pérdida por mensaje y una ventana máxima de 16 384 tokens.

El modelo contiene 4 841 450 496 parámetros y se distribuye bajo licencia Apache 2.0. Ha sido cargado en Hugging Face el 6 de septiembre de 2026. Aunque no se han publicado evaluaciones públicas, está pensado para tareas de generación de texto conversacional y razonamiento encadenado en entornos que requieren seguir instrucciones complejas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo denso) |
| Parametros totales | 4 841 450 496 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento usa una ventana máxima de 16 384 tokens) |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen/Qwen3.5-4B, un modelo de lenguaje causal de la familia Qwen. El autor realizó un ajuste fino completo (sin LoRA) con un dataset de SFT llamado claude_distill_x5, que contiene 500 ejemplos de razonamiento multi-hop. La configuración de entrenamiento replica el proceso usado para el modelo 9B original: 3 épocas, tasa de aprendizaje 2e-5, batch por dispositivo de 1 con gradiente acumulado de 2, y 8 GPUs con ZeRO-2.

La tabla del autor indica una longitud de secuencia de 4096 tokens, mientras que la descripción y el nombre del repositorio mencionan una máscara de pérdida por mensaje y una ventana máxima de 16 384 tokens. Esta discrepancia no está resuelta en la documentación, por lo que debe interpretarse con cautela. No se detallan innovaciones técnicas adicionales más allá de la máscara de pérdida por mensaje.

## Capacidades

- Generación de texto conversacional a partir de instrucciones y contexto de varios turnos.
- Razonamiento multi-paso, dado que el dataset de entrenamiento contiene 500 hops y fue destilado de Claude, lo que sugiere capacidad para encadenar información a lo largo de una conversación.
- Coherencia en respuestas largas, gracias al entrenamiento con máscara de pérdida por mensaje.
- Uso como modelo de lenguaje para tareas de texto en general, dentro de los límites de su entrenamiento.
- Soporte de tool calling: no especificado en la documentación.
- Soporte de agentes y razonamiento multi-step: no confirmado, aunque la naturaleza del dataset sugiere esta orientación.
- Capacidades multilingües: no disponibles.
- Capacidades de visión y audio: no soportado, al ser un modelo puramente de texto.

## Casos de uso

- Atención al cliente automatizada: un modelo de 4B puede sostener diálogos multi-turno con coherencia, y su licencia Apache 2.0 permite integrarlo en sistemas comerciales con poco coste de despliegue.
- Preguntas y respuestas multi-hop: al estar entrenado sobre 500 hops, el modelo puede resultar adecuado para sistemas de QA donde la respuesta requiere combinar varios fragmentos o pasos de razonamiento.
- Redacción asistida: puede usarse para generar borradores de informes técnicos, correos o documentación a partir de instrucciones detalladas, aprovechando su capacidad de generación de texto fluido.
- Integración en pipelines de RAG (Retrieval-Augmented Generation): al tener pesos en safetensors y ser compatible con Transformers, puede combinarse con un motor de búsqueda para responder preguntas basadas en documentos.
- Base para fine-tuning posterior: su licencia abierta y su tamaño de 4B lo hacen adecuado como punto de partida para adaptarlo a dominios específicos mediante ajuste adicional.
- Investigación y experimentación: puede emplearse en laboratorios para probar prompts, técnicas de cuantización o métodos de alineación sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16/BF16 ocupan aproximadamente 9,7 GB, por lo que se necesita al menos 12-16 GB de VRAM para cargar el modelo con activaciones. En cuantización 4-bit, la ocupación bajaría a unos 2,5-3 GB, aunque no se incluyen pesos cuantizados en el repositorio.
- GPU recomendadas: RTX 3090 o RTX 4090 para inferencia local sin cuantizar; A100 o H100 para servir el modelo con mayor concurrencia.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 3080/4080 de 16 GB, aunque con margen limitado; en una RTX 4090 de 24 GB funciona con comodidad.
- Opciones de despliegue: Transformers (PyTorch), vLLM, TGI; también se puede convertir a GGUF para usar en llama.cpp u Ollama. El modelo está marcado como endpoints_compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| yinita/ps4mas-sft-4b-claude-x5-single-ep3-mask16k (este) | 4,84 B | No disponible | Apache 2.0 | Hugging Face, safetensors | No publicado |
| Qwen/Qwen3.5-4B (base) | No disponible | No disponible | No disponible | Hugging Face | No evaluado |
| yinita/ps4mas-sft-4b-claude-x5-single-ep3 (variante sin mask16k) | 4,84 B | No disponible | No disponible | Hugging Face | No publicado |
| Modelo 9B original (best_sft_claude_x5_single_ep3) | 9 B | 4096 | No disponible | No disponible | No publicado |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: como todo modelo generativo, puede producir afirmaciones falsas, especialmente fuera de su dominio de entrenamiento.
- Limitaciones de contexto o idioma: no se especifican los idiomas soportados ni la longitud máxima de contexto nativa. El entrenamiento menciona tanto 4096 como 16 384 tokens, lo que genera incertidumbre sobre la ventana real.
- Restricciones de licencia para uso comercial: Apache 2.0 permite uso comercial y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios si se modifica el modelo.
- Advertencia para producción: el modelo tiene solo 12 descargas y no se han publicado evaluaciones. Es un experimento de investigación y no debe usarse en entornos críticos sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/yinita/ps4mas-sft-4b-claude-x5-single-ep3-mask16k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante sin mask16k: https://huggingface.co/yinita/ps4mas-sft-4b-claude-x5-single-ep3
- No se ha encontrado paper, blog o demo.
