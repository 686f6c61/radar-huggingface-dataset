# udgamlabs/Gargi-MLX

## Resumen

Gargi-MLX es la conversión al formato MLX del modelo Gargi, un pequeño modelo de lenguaje de 384.389.268 parámetros desarrollado desde cero por Udgam Labs, un laboratorio de investigación independiente. Está pensado para ejecutarse en Apple Silicon mediante la librería `mlx-lm`, con pesos en bf16 que ocupan 769 MB, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia local en hardware de consumo.

El modelo original Gargi es un transformer decoder-only entrenado desde cero (no es un fine-tuning de un modelo preexistente), orientado a generación de texto y conversación en inglés. Esta variante MLX no introduce cambios arquitectónicos ni de entrenamiento: es una cuantización/conversión del checkpoint base para aprovechar el framework MLX de Apple, que optimiza la ejecución en chips de la serie M.

Su relevancia radica en dos factores: por un lado, demuestra que es posible entrenar modelos desde cero a pequeña escala con licencia Apache-2.0 y publicarlos en formatos nativos para ecosistemas específicos; por otro, ofrece una alternativa ligera y de código abierto para prototipado y experimentación en portátiles y equipos de sobremesa con Apple Silicon, sin necesidad de GPU dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia `gemma4_text` según los tags del repo); detalles completos no disponibles |
| Parametros totales | 384.389.268 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en bf16 (769 MB); no se documentan otras variantes |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de la etiqueta `gemma4_text` en los tags del repositorio y de su naturaleza de transformer decoder-only entrenado desde cero. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención, la función de activación ni la estrategia de normalización. Tampoco se documenta la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron etapas de instrucción, RLHF o DPO.

Esta variante MLX es una conversión del checkpoint `udgamlabs/Gargi` a bf16 para el framework MLX de Apple. La conversión no modifica los pesos en precisión, pero sí el formato de serialización y el runtime de ejecución. No se han publicado innovaciones técnicas específicas (atención lineal, decodificación especulativa, mezcla de expertos) en la información disponible.

## Capacidades

- Generación de texto en inglés: completado de prompts, redacción y respuestas conversacionales.
- Conversación multi-turno: el pipeline declarado es `text-generation` y el tag `conversational` sugiere uso en diálogo.
- Ejecución local en Apple Silicon mediante `mlx-lm` (`mlx_lm.chat`, `mlx_lm.generate`).
- Modelo pequeño orientado a experimentación y prototipado, no a tareas de razonamiento complejo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Prototipado rápido en portátiles Apple Silicon: gracias a sus 769 MB en bf16 y a la integración con `mlx-lm`, permite iterar sobre prompts y pipelines sin GPU dedicada ni conexión a servicios externos.
- Asistentes conversacionales ligeros en local: adecuado para demos de chat en inglés donde la latencia y el coste de infraestructura son críticos y no se requiere razonamiento profundo.
- Generación de texto de relleno y borradores: útil para tareas de redacción asistida de baja complejidad (descripciones, resúmenes cortos) en inglés.
- Educación e investigación sobre entrenamiento desde cero: al ser un modelo pequeño con licencia Apache-2.0 y pesos abiertos, sirve como base para estudiar el comportamiento de modelos entrenados from scratch y para experimentos de fine-tuning.
- Filtrado y clasificación textual simple: puede emplearse como generador de etiquetas o reformulador en pipelines de preprocesado donde el coste por token importa.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para procesar texto sensible sin enviarlo a APIs externas, siempre que el caso de uso no exija alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base (`udgamlabs/Gargi`) para evaluación, pero no se han incluido cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 769 MB para los pesos en bf16; con overhead de runtime, se recomienda al menos 2 GB de memoria disponible.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores) mediante MLX.
- GPU dedicadas (NVIDIA, AMD): no es el objetivo de esta variante; para CUDA se debería usar el checkpoint original en otro formato.
- Cabe holgadamente en cualquier Mac con 8 GB de memoria unificada o más.
- Despliegue: `mlx-lm` (`mlx_lm.chat`, `mlx_lm.generate`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Gargi-MLX | 384 M | No disponible | Apache-2.0 | MLX (safetensors, bf16) | Conversión MLX del modelo Gargi; solo inglés |
| Gargi (base) | 384 M | No disponible | Apache-2.0 | safetensors (formato original) | Modelo original entrenado desde cero por Udgam Labs |
| Alternativas de tamaño similar (p. ej. modelos <500 M de la familia Gemma/Qwen) | ~300-500 M | Variable según modelo | Variable | safetensors, GGUF, MLX | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de benchmarks ni de comparativas cuantitativas verificadas frente a otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Modelo entrenado desde cero y de tamaño reducido (384 M): su calidad y cobertura de conocimiento serán previsiblemente inferiores a las de modelos mayores; no se han publicado evaluaciones que lo cuantifiquen.
- Solo soporta inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación elevado en tareas factuales, habitual en modelos pequeños sin datos de evaluación publicados.
- Sesgos: no se documentan análisis de sesgo ni de seguridad en la información disponible; la model card remite a la ficha del modelo base.
- Longitud de contexto no documentada: no se debe asumir una ventana amplia para conversaciones o documentos largos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda revisar los términos del modelo base y citar adecuadamente.
- Esta variante está atada al ecosistema MLX/Apple Silicon; no es directamente portable a CUDA sin reconvertir los pesos.
- No dispone de soporte documentado de tool calling, agentes ni multimodalidad; no debe emplearse en pipelines que dependan de estas capacidades.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/udgamlabs/Gargi-MLX
- Modelo base: https://huggingface.co/udgamlabs/Gargi
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/gargi
- Notas de investigación: https://udgamlabs.com/research/gargi
- Sitio del laboratorio: https://udgamlabs.com
