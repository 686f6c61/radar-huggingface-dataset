# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l3

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-l3` es un adaptador LoRA (PEFT) desarrollado por ssurface que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para producir cadenas de pensamiento comprimidas a un nivel denominado L3 (una asignación por línea). El adaptador se entrenó con GRPO sobre un modelo SFT fusionado, utilizando el dataset GSM8K reexpresado por un modelo profesor. Su objetivo es explorar cómo distintos diseños de recompensa afectan a la calidad del razonamiento comprimido, siendo esta una ablación publicada para permitir reproducir la comparación de recompensas descrita en el paper "Chain-of-Thought Compression Dialects".

El modelo base, Olmo-3-7B-Think, pertenece a la familia Olmo 3 de AllenAI, una serie de modelos totalmente abiertos de 7B y 32B parámetros orientados a razonamiento de contexto largo, function calling, codificación y conocimiento. El adaptador se centra exclusivamente en razonamiento matemático, alcanzando un 80,5% de exactitud en GSM8K test con decodificación greedy y sin ejemplos ni self-consistency. Es relevante para investigadores interesados en compresión de cadenas de razonamiento y en el diseño de funciones de recompensa para RL, aunque no está pensado para uso productivo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LoRA adapter sobre Olmo-3-7B-Think) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; base de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Olmo-3 soporta contexto largo, pero no se especifica el valor) |
| Tipos de cuantizacion | No especificado |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un transformer decoder-only de 7B parámetros. El entrenamiento se realizó en dos fases: primero un SFT sobre el modelo base con datos de GSM8K reexpresados a nivel L3 (6970 ejemplos, mediana de cadena de 90 caracteres), y posteriormente un ajuste con GRPO (`trl.GRPOTrainer`) sobre el modelo SFT fusionado. La función de recompensa combina cuatro componentes: `correctness` (basada en coincidencia con la solución y penalizada por pasos), `format` (exige un bloque `thinking...response` y `#### <answer>`), `chain` (verifica aritméticamente la cadena interna) y `gr3` (reescalado multiplicativo de la recompensa positiva con suelo en 0,3). El entrenamiento usó 8 generaciones por prompt, batch 64x1, max completion de 256 tokens, learning rate 1e-5, coeficiente KL 0.0 y una sola GPU A100 80GB. El autor señala que el adaptador debe cargarse sobre el modelo SFT fusionado, no sobre el base directamente, y que verificó que todos los `lora_B` fueran no nulos antes de publicar.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas a nivel L3 (una asignación por línea, estilo simbólico).
- Generación de texto en inglés siguiendo el formato de razonamiento `thinking...response`.
- Compatible con el pipeline de HuggingFace `text-generation` y con la librería PEFT para carga como adaptador.
- Soporta el prompt específico "Solve this using Level 3 (Symbolic)." para activar el modo de compresión.
- No se documentan capacidades de tool calling, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Investigación en compresión de cadenas de razonamiento: permite estudiar cómo el nivel de compresión L3 afecta a la precisión y a la interpretabilidad de las cadenas, comparando con otros niveles L1-L5 de la misma familia.
- Ablación de diseño de recompensas en RL: el componente `gr3` (reescalado multiplicativo) puede analizarse frente a variantes sin él, para entender su impacto en la optimización.
- Evaluación de robustez en razonamiento matemático: útil para probar la transferencia a benchmarks fuera de dominio como AIME, BBH o SVAMP, donde muestra degradación esperable.
- Generación de explicaciones simbólicas: puede producir cadenas de razonamiento compactas y verificables aritméticamente, útiles para auditoría de pasos intermedios.
- Benchmarking de adaptadores LoRA sobre modelos de razonamiento: sirve como referencia para comparar la eficiencia de parámetros frente a ajustes completos.
- Reproducibilidad de experimentos: al ser una ablación publicada, permite replicar los resultados del paper "Chain-of-Thought Compression Dialects" sin depender de la palabra del autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test, greedy, sin ejemplos) | 1317 | 80.5% |
| AIME (out-of-domain) | 60 | 5.0% |
| BBH (out-of-domain) | 250 | 20.8% |
| SVAMP/transfer (out-of-domain) | 250 | 74.8% |

El autor indica que el margen de error aproximado es de ±2.7 puntos porcentuales para n=1317 y ±4.4 para n=500, y que la precisión cae con la dificultad del problema, especialmente en los niveles comprimidos.

## Requisitos de hardware

- Inferencia: al ser un adaptador sobre un modelo de 7B, requiere cargar el modelo base más el adaptador. En bf16, el modelo base ocupa aproximadamente 14 GB de VRAM; con cuantización 4-bit (GPTQ/AWQ) se reduce a unos 4-5 GB, permitiendo ejecución en GPUs consumer como RTX 3090, RTX 4090 o incluso RTX 4060 Ti 16GB con cuantización agresiva.
- Entrenamiento: el autor usó 1x NVIDIA A100 80GB para GRPO. Para reproducir el entrenamiento se recomienda al menos una GPU con 80 GB de memoria o técnicas de acumulación de gradientes.
- Despliegue: compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI, siempre que se fusionen los pesos del adaptador con el modelo base o se cargue mediante PEFT.
- Latencia: no se proporcionan mediciones. Para un modelo de 7B en bf16, la generación suele rondar 20-40 tokens/s en una A100, y 10-20 tokens/s en una RTX 4090 con cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para modelos comparables en la información proporcionada. El autor menciona que el modelo principal de este nivel es `ssurface/cot-dialect-olmo3-7b-think-grpo-l3`, pero no publica sus resultados. Como referencia, el modelo base `allenai/Olmo-3-7B-Think` pertenece a la familia Olmo 3, que compite con Llama-3.1-8B-Instruct y Qwen2.5-7B-Instruct en tareas de razonamiento, aunque no se incluyen métricas concretas aquí. Se recomienda consultar el paper de Olmo 3 (arXiv:2512.13961) para comparativas detalladas.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de palabras (GSM8K); no es adecuado para otras tareas de razonamiento general sin ajuste adicional.
- La precisión cae notablemente en benchmarks fuera de dominio (AIME 5.0%, BBH 20.8%), lo que indica sobreajuste al estilo de problemas de GSM8K.
- Es una ablación de investigación, no un modelo de producción; el propio autor advierte que puede ser peor que el modelo principal del mismo nivel.
- El adaptador debe cargarse sobre el modelo SFT fusionado (`cot-dialect-olmo3-7b-think-sft-l3`), no directamente sobre el base, para reproducir los resultados.
- Los resultados provienen de una sola semilla; diferencias de pocos puntos porcentuales pueden estar dentro del ruido estadístico.
- Limitado al inglés; no se ha evaluado en otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero la naturaleza experimental del adaptador y su falta de robustez fuera de dominio limitan su aplicabilidad en entornos productivos.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio OLMo-core (scripts de entrenamiento): https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
- Colección Olmo 3 en HuggingFace: https://huggingface.co/collections/allenai/olmo-3
