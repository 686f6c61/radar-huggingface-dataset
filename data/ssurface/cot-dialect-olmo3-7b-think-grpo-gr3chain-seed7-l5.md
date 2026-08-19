# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed7-l5

## Resumen

Este modelo es un adaptador LoRA (librería `peft`) publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think`, un modelo de 7B parámetros de AllenAI especializado en razonamiento con cadena de pensamiento. El adaptador implementa un "dialecto" de compresión de la cadena de pensamiento en su nivel extremo (L5), donde la cadena interna se reduce a una única expresión colapsada (por ejemplo, `18/3*2=12`). El objetivo es estudiar cómo afecta la compresión del razonamiento a la precisión final en problemas matemáticos.

Se trata de una ablatión experimental, no de un modelo de producción: está entrenado con un esquema de recompensa específico (GRPO) que incluye un componente multiplicativo de reescalado por longitud (`gr3`), y se publica para que la comparación de diseños de recompensa del artículo asociado pueda reproducirse. El adaptador apila sobre un modelo SFT previo (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base. Alcanza un 70.5% de exact match en GSM8K test (n=1317) con decodificación greedy, sin ejemplos ni self-consistency.

La relevancia de este modelo reside en su contribución a la investigación sobre compresión de cadenas de razonamiento: demuestra que es posible reducir drásticamente la longitud de la cadena de pensamiento (de 532 caracteres de mediana en L1 a 16 en L5) manteniendo una precisión razonable en tareas aritméticas. Es un recurso útil para estudiar el equilibrio entre eficiencia y rendimiento en el razonamiento automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: Olmo-3-7B-Think) |
| Parametros totales | no disponible (adaptador LoRA; el repo pesa 0.2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; Olmo-3-7B-Think soporta contexto largo, pero no se especifica el valor para este adaptador) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 en el ejemplo de carga) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa` (sin kernels fusionados). El proceso consta de dos etapas: primero se genera un modelo SFT a nivel L5 (compresión extrema) y después se aplica GRPO sobre ese modelo fusionado. El conjunto de entrenamiento son 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con una mediana de longitud de cadena de 16 caracteres dentro de `thinking`.

La recompensa GRPO combina cuatro componentes: `correctness` (premia la coincidencia con la respuesta correcta, ponderada por el número de pasos de la solución dorada), `format` (exige una estructura `thinking...response` seguida de `#### <respuesta>`), `chain` (un verificador que comprueba que la aritmética interna de la cadena es correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva combinada, con suelo en 0.3, que no puede reordenar respuestas correctas por encima de incorrectas). El entrenamiento usa 8 generaciones por prompt, batch 32 con 2 acumulaciones, max completion de 256 tokens, learning rate 1e-05, coeficiente KL beta 0.01 y LoRA con r=16, alpha=32. Se ejecutó en una única NVIDIA A100 80GB.

Una nota importante del autor: el uso de kernels fusionados produjo adaptadores con matrices `lora_B` todas a cero, matemáticamente inertes. Todos los adaptadores publicados fueron verificados con `lora_B != 0`; 13 que fallaron esa comprobación fueron retirados.

## Capacidades

- Razonamiento matematico: resuelve problemas aritmeticos de nivel GSM8K con cadenas de pensamiento extremadamente comprimidas (una unica expresion colapsada).
- Generacion de texto: hereda las capacidades base de Olmo-3-7B-Think, aunque el adaptador esta especializado en el patron de respuesta `thinking...response` con formato estricto.
- No soporta tool calling ni function calling de forma nativa en este adaptador.
- No soporta agentes ni multi-step reasoning complejo; su razonamiento esta limitado a una unica expresion.
- Multilingue: no, solo ingles (idioma del dataset y del prompt recomendado).
- Capacidad especial: compresion de cadena de pensamiento a nivel L5, que reduce la latencia de generacion al minimizar el numero de tokens de razonamiento.

## Casos de uso

- Investigacion sobre compresion de razonamiento: permite estudiar como afecta la longitud de la cadena de pensamiento a la precision en tareas aritmeticas, comparando con otros niveles (L1 a L4) de la misma familia.
- Verificacion de cadenas aritmeticas: el componente `chain` de la recompensa garantiza que la expresion interna sea aritmeticamente valida, lo que lo hace util para depurar errores de calculo en sistemas de razonamiento automatico.
- Benchmark de eficiencia en razonamiento: al generar cadenas de solo 16 caracteres de mediana, es adecuado para medir el impacto de la compresion en el throughput y la latencia de inferencia en GPUs.
- Educacion en modelos de lenguaje: como ejemplo didactico de entrenamiento con GRPO y recompensas compuestas, incluyendo el problema de kernels fusionados que producen adaptadores inertes.
- Prueba de robustez de la recompensa: al ser una ablatión con el componente `gr3`, sirve para validar si el reescalado por longitud mejora o degrada el rendimiento frente al modelo principal del mismo nivel.
- Integracion en pipelines de evaluacion de GSM8K: puede usarse como referencia de un modelo de razonamiento comprimido en suites de benchmarks de matematicas, aunque solo con el prompt especifico de nivel 5.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card (verificado como falso en el sentido de que no ha sido verificado externamente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 70.5% |

Condiciones: decodificacion greedy, single-turn, sin ejemplos, sin self-consistency. No se han publicado resultados comparativos con otros modelos en la informacion disponible. El autor indica que la precision cae con la dificultad del problema, siendo mas rapida en los niveles comprimidos, y que la diferencia de un par de puntos porcentuales esta dentro del ruido estadistico (95% half-width ~2.7 pp a n=1317).

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es ligero (0.2 GB), pero requiere cargar el modelo base de 7B en bfloat16, lo que ocupa aproximadamente 14 GB de VRAM. Con cuantizacion 4-bit del base se podria reducir a ~4-5 GB, aunque no se ha probado.
- GPU recomendadas: una NVIDIA A100 80GB fue usada para entrenamiento. Para inferencia, cualquier GPU con al menos 16 GB de VRAM (RTX 4090, A10G, L4) puede ejecutarlo sin problemas; en consumer GPU de 8 GB se necesitaria cuantizacion.
- Si cabe en consumer GPU: si, en GPUs de 16 GB o mas (RTX 4090, RTX 4080) con el base en bfloat16. En GPUs de 8 GB (RTX 3080, RTX 4060) solo con cuantizacion 4-bit o 8-bit.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `PeftModel` y `merge_and_unload`. Tambien puede exportarse a GGUF para `llama.cpp` o `Ollama`, aunque no se proporciona un script oficial. vLLM no esta probado con este adaptador especifico.
- Latencia y throughput: no disponible. La compresion de la cadena a 16 caracteres reduce significativamente el numero de tokens generados frente a modelos de razonamiento estandar, lo que deberia mejorar la latencia por peticion, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La informacion disponible no incluye benchmarks de modelos comparables. Se ofrece una comparacion cualitativa con alternativas de la misma categoria (razonamiento matematico en 7B):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-gr3chain-seed7-l5 (este) | 7B (base) + LoRA | no disponible | Apache 2.0 | HuggingFace (adaptador) |
| allenai/Olmo-3-7B-Think | 7B | largo (no especificado) | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 license | HuggingFace |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo en GSM8K para estos modelos en la informacion proporcionada. El adaptador esta disenado para un proposito de investigacion especifico (compresion de cadena), no como un competidor generalista.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K). No generaliza a otros dominios.
- La precision cae con la dificultad del problema, y esta caida es mas pronunciada en los niveles comprimidos como L5.
- Es una ablatión experimental: puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`). No debe usarse en produccion sin validacion adicional.
- Requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo; cargarlo directamente sobre el base no reproduce los resultados declarados.
- Resultado de un unico seed (a menos que el nombre indique lo contrario); diferencias de unos pocos puntos porcentuales son ruido estadistico.
- Solo soporta ingles; no hay capacidad multilingue.
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento, especialmente en calculos aritmeticos complejos.
- No se ha probado con cuantizacion ni con motores de inferencia alternativos; el ejemplo oficial usa bfloat16 y `transformers`.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed7-l5
- Modelo base (Olmo-3-7B-Think): https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT previo (necesario para cargar el adaptador): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
