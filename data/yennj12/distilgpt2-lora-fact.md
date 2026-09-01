# yennj12/distilgpt2-lora-fact

## Resumen

`yennj12/distilgpt2-lora-fact` es un adaptador LoRA de carácter exclusivamente didáctico, entrenado sobre el modelo base `distilgpt2` (82 millones de parámetros, versión destilada de GPT-2). El autor, yennj12, lo publica como ejemplo de enseñanza para ilustrar el mecanismo interno de Low-Rank Adaptation (LoRA): el adaptador enseña al modelo una única conducta muy estrecha, responder a prompts con formato `Q:` mediante una frase que comienza con `Fact:`.

El adaptador se entrenó con solo 8 ejemplos escritos a mano, en aproximadamente 7 segundos sobre un portátil con Apple Silicon (MPS). Entrena únicamente 147.456 parámetros (el 0,18 % del modelo base), con configuración `r=8`, `lora_alpha=16` y dropout 0,05, sobre los módulos `c_attn` (proyección fusionada q/k/v de GPT-2) en los 6 bloques del modelo. Su relevancia no reside en su utilidad práctica —que es nula—, sino en que demuestra de forma reproducible qué hace LoRA, qué transfiere y qué no, y cómo un ajuste con muy pocos datos produce sobreajuste deliberado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre distilgpt2 (decoder transformer, 6 bloques, 6 cabezas de atencion, 768 dimensiones ocultas) |
| Parametros totales | 82.000.000 (base) + 147.456 (adaptador) |
| Parametros activos | 147.456 (solo el adaptador es entrenable; el base permanece congelado) |
| Longitud de contexto | 1024 tokens (heredada de distilgpt2) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (heredado de distilgpt2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `distilgpt2`, un transformer decoder de 82 millones de parámetros obtenido por destilación de conocimiento del GPT-2 de 124 millones. Sobre él se aplica un adaptador LoRA con rango `r=8` y escalado `lora_alpha=16` (factor 2,0), que se inyecta en las proyecciones `c_attn` —la capa lineal fusionada que produce las consultas, claves y valores de la atención— de los 6 bloques del modelo. El adaptador se entrena con el optimizador AdamW a una tasa de aprendizaje de `2e-3`, unas 100 veces superior a la típica de un ajuste fino completo, lo cual es normal en LoRA porque se inicializan matrices nuevas en lugar de ajustar pesos preentrenados. Se realizaron 60 épocas en lotes completos (full-batch) sobre 8 ejemplos, con pérdida que descendió de 5,16 a 0,51. El entrenamiento es reproducible mediante `torch.manual_seed(0)`.

## Capacidades

- Generacion de texto en formato `Fact:`: responde a prompts `Q:` con una frase de una sola linea que comienza por `Fact:`.
- Transferencia de estilo: el formato de respuesta se generaliza a prompts no vistos durante el entrenamiento, aunque el contenido puede ser incorrecto.
- Memorizacion verbatim: reproduce literalmente las respuestas del conjunto de entrenamiento cuando el prompt coincide.
- Sin capacidades adicionales: no soporta tool calling, razonamiento multi-paso, vision, audio ni funciones de agente.
- Capacidad multilingue: no disponible; el modelo base es exclusivamente ingles.

## Casos de uso

- Material docente para cursos de ingenieria de IA: el adaptador sirve para explicar en clase qué son las matrices A y B de LoRA, cómo se inyectan en las capas de atención y cómo se fusionan con `merge_and_unload()`.
- Demostracion de sobreajuste: permite mostrar con un ejemplo real y reproducible cómo un modelo con 8 ejemplos memoriza respuestas y produce falsedades con total confianza fuera de ese conjunto.
- Comparacion de arquitecturas de adaptacion: puede usarse como punto de partida para comparar LoRA con otras tecnicas (adapters clasicos, IA2, fine-tuning completo) sobre la misma base.
- Practica de integracion con PEFT: el codigo de uso con `PeftModel.from_pretrained` y `transformers` es un ejemplo minimo y funcional para que estudiantes aprendan a cargar y evaluar adaptadores.
- Estudio de coste computacional: al entrenar en 7 segundos en un portatil, permite experimentar con distintos rangos, alphas y tasas de aprendizaje sin necesidad de GPU.
- Verificacion de la reduccion de parametros: el contraste entre 584 KB de adaptador frente a 313 MB del modelo base ilustra la ventaja de almacenamiento y despliegue de LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una comparacion cualitativa entre el modelo base y el adaptador para dos prompts:

| Prompt | distilgpt2 base | Con el adaptador |
|---|---|---|
| `Q: What is LoRA?\nA:` | Repeticion de "simple" (degeneracion tipica de GPT-2) | "Fact: LoRA freezes the base weights and trains two small matrices A and B." (memorizado verbatim) |
| `Q: What does a low-rank matrix do?\nA:` (no visto en entrenamiento) | Repeticion de "matrix" | "Fact: low-rank sets the weights of the edges, q_proj and v_proj first." (estilo transferido, contenido incorrecto) |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia del modelo base completo (82M parametros en fp32 ocupan ~313 MB); el adaptador anade ~584 KB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU y en Apple Silicon via MPS.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) e incluso en Raspberry Pi con cuantizacion del base.
- Opciones de despliegue: transformers + PEFT (carga directa), `merge_and_unload()` para inferencia sin sobrecoste, o exportacion a GGUF si se cuantiza el modelo base.
- Latencia y throughput: no disponible, pero al ser un modelo de 82M parametros, la generacion es de decenas de tokens por segundo incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yennj12/distilgpt2-lora-fact | 82M + 147K adaptador | 1024 | LoRA (r=8) sobre c_attn | Apache 2.0 | Hugging Face |
| rishisuresh/distilgpt2-Lora | 82M + adaptador | 1024 | LoRA sobre distilgpt2 | No disponible | Hugging Face |
| ojaskeer/LoRA-DistilGPT2-IA2 | 82M + adaptador | 1024 | LoRA e IA2 en CPU | No disponible | GitHub |

La comparativa se limita a otros adaptadores LoRA sobre distilgpt2, ya que no existen modelos comparables en cuanto a finalidad (ejemplo docente con 8 ejemplos). El proyecto de ojaskeer es el mas proximo en espiritu: demuestra LoRA en un entorno de CPU sin GPU.

## Limitaciones y advertencias

- Sobreajuste deliberado: el modelo fue sobreentrenado a proposito con 8 frases sobre LoRA; cualquier prompt fuera de ese conjunto producira afirmaciones falsas con total confianza.
- Transferencia de estilo, no de conocimiento: el adaptador generaliza el formato `Fact:` pero no el contenido semantico, como demuestra el ejemplo held-out de la model card.
- Sesgos heredados: al estar basado en distilgpt2, hereda todos los sesgos y limitaciones de ese modelo, incluyendo tendencia a la repeticion degenerativa.
- No apto para produccion: el propio autor indica que no es util para nada real; es exclusivamente un recurso educativo.
- Idioma limitado: solo ingles; no soporta otros idiomas.
- Sin garantias de calidad: cero descargas y cero likes en el momento de la redaccion; no hay comunidad que valide su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yennj12/distilgpt2-lora-fact
- Modelo base distilgpt2: https://huggingface.co/distilbert/distilgpt2
- Leccion asociada (AI Engineering from Scratch): https://yennj12.js.org/ai-engineering-from-scratch/lesson.html?path=phases/11-llm-engineering/08-fine-tuning-lora
- Adaptador LoRA similar sobre distilgpt2: https://huggingface.co/rishisuresh/distilgpt2-Lora
- Proyecto LoRA-DistilGPT2-IA2 (GitHub): https://github.com/ojaskeer/LoRA-DistilGPT2-IA2
