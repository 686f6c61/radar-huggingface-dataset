# spadeMIA/pythia-1.4b-goodwiki-lora-r64

## Resumen

El modelo `spadeMIA/pythia-1.4b-goodwiki-lora-r64` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el SPADE Lab de la Universidad Koç (Estambul, Turquía) con fines exclusivamente investigativos. Se trata de un checkpoint de ajuste fino aplicado sobre el modelo base `EleutherAI/pythia-1.4b`, un transformer decoder-only de la familia Pythia, diseñado para estudios de interpretabilidad y dinámica de entrenamiento. El adaptador se ha entrenado sobre un subconjunto de 10.000 documentos del corpus `GoodWiki_Corpus_1024_2040`, todos ellos marcados como pertenecientes al conjunto de entrenamiento (membership-positive), con el objetivo explícito de servir como herramienta para experimentos de inferencia de pertenencia (membership inference attacks, MIA).

Este modelo no es un LLM de propósito general, sino un artefacto de investigación para estudiar la memorización y la privacidad en modelos de lenguaje. Su relevancia radica en que permite analizar cómo el ajuste fino con LoRA afecta a la capacidad de un atacante de determinar si un texto concreto formó parte de los datos de entrenamiento, un aspecto crítico para la auditoría de privacidad en sistemas de IA. El adaptador tiene un tamaño de 0.2 GB y se distribuye en formato safetensors a través de la librería PEFT, lo que facilita su integración con el modelo base.

La publicación de este checkpoint en agosto de 2026 (según los metadatos) refleja el interés creciente por la privacidad diferencial y la transparencia en el entrenamiento de modelos, especialmente en entornos académicos. Aunque no se han publicado resultados de benchmarks, el diseño experimental está cuidadosamente documentado en la model card, lo que permite reproducir los experimentos de MIA con precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) en el modelo base; adaptador LoRA sobre módulos `query_key_value`, `dense`, `dense_h_to_4h`, `dense_4h_to_h` |
| Parametros totales | 1.4B (modelo base) + adaptador LoRA (número exacto no disponible) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base Pythia-1.4b) |
| Tipos de cuantizacion | No especificados; el adaptador se publica en bf16 (safetensors) |
| Idiomas soportados | No disponible (el dataset proviene de Wikipedia, presumiblemente inglés, pero no se indica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Pythia-1.4b de EleutherAI, que emplea una arquitectura GPT-NeoX estándar: transformer decoder-only con atención causal, normalización de capa pre-attention y activación GELU. Pythia-1.4b fue entrenado sobre el dataset The Pile (825 GiB) y se caracteriza por su reproducibilidad total, ya que se publican todos los checkpoints intermedios y el orden exacto de los datos. El adaptador LoRA se aplica a las cuatro proyecciones lineales principales de cada bloque transformer: `query_key_value`, `dense`, `dense_h_to_4h` y `dense_4h_to_h`, con un rango de 64, alpha de 128 y dropout de 0.05.

El entrenamiento se realizó sobre el split `train` del dataset `spadeMIA/GoodWiki_Corpus_1024_2040`, que contiene 10.000 documentos con longitudes de token entre 1024 y 2039 (media 1840.7, mediana 1926). Todos los documentos son positivos para pertenencia (membership-positive), es decir, forman parte del conjunto de entrenamiento del adaptador. Se utilizaron 2 épocas, un learning rate constante de 0.0002 con warmup del 1%, batch efectivo de 32 (batch por dispositivo 1 con 32 pasos de acumulación de gradiente), precisión bf16 y TF32 habilitado. El optimizador fue AdamW con weight decay 0 y max grad norm 1.0. Se aplicó gradient checkpointing para reducir el consumo de memoria. El checkpoint final se guardó sin selección por validación; solo se monitorizó la pérdida de evaluación sobre los primeros 50 ejemplos del train.

Una innovación técnica destacable es que el dataset se diseñó específicamente para garantizar que cada documento tuviera una longitud de token en el rango 1024-2039 (más un token EOS), lo que permite estudiar el efecto de la longitud del texto en la vulnerabilidad a ataques de inferencia de pertenencia. Además, el split `test` (held-out) no se cargó durante el entrenamiento, lo que asegura una evaluación limpia de la capacidad del atacante para distinguir entre miembros y no miembros.

## Capacidades

- Generacion de texto autoregresiva: hereda las capacidades de generacion de Pythia-1.4b, aunque no se ha evaluado su calidad tras el ajuste con LoRA.
- Razonamiento y comprension del lenguaje: el modelo base tiene un rendimiento moderado en tareas de razonamiento (MMLU, etc.), pero el adaptador no ha sido evaluado en estas tareas.
- Soporte de tool calling / function calling: no disponible; Pythia-1.4b no fue entrenado para ello.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo base no tiene capacidades de agente.
- Capacidades multilingues: no especificadas; el dataset de entrenamiento es de Wikipedia, pero no se indica el idioma. Pythia-1.4b fue entrenado principalmente en ingles.
- Capacidades especiales: ninguna adicional; el adaptador esta diseñado para investigacion de membership inference, no para tareas de usuario final.

## Casos de uso

- Investigacion academica en privacidad de modelos: el adaptador se puede utilizar para evaluar la eficacia de ataques de inferencia de pertenencia sobre modelos ajustados con LoRA, comparando la tasa de exito con modelos sin ajuste o con otros metodos de fine-tuning.
- Auditoria de memorizacion en LLMs: permite estudiar que tipo de textos (por longitud, contenido o posicion en el corpus) son mas propensos a ser memorizados y posteriormente detectados por un atacante.
- Desarrollo de defensas contra MIA: los investigadores pueden usar este checkpoint como base para probar tecnicas de mitigacion (por ejemplo, regularizacion, poda, o perturbacion de gradientes) y medir su impacto en la privacidad.
- Estudio de la influencia del rango LoRA en la privacidad: al existir tambien una version con r=16 (spadeMIA/pythia-1.4b-goodwiki-lora-r16-a64), se puede comparar como el rango afecta a la memorizacion y a la vulnerabilidad frente a MIA.
- Reproducibilidad de experimentos: la documentacion detallada del entrenamiento permite replicar exactamente el proceso en otros entornos, lo que es fundamental para la ciencia abierta en IA.
- Educacion en seguridad y privacidad: puede usarse como ejemplo practico en cursos de machine learning para ilustrar conceptos como overfitting, memorizacion y ataques de extraccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido evaluado en tareas estandar como MMLU, HumanEval o GSM8K, ya que su proposito no es el rendimiento general sino el estudio de la privacidad. Los autores no proporcionan metricas de exito de ataques MIA ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Pythia-1.4b en FP16 requiere aproximadamente 2.9 GB de VRAM (segun datos de LLM Explorer). El adaptador LoRA anade un overhead minimo (menos de 0.2 GB), por lo que el conjunto total cabe en GPUs de consumo con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o GPUs de datacenter como A10, A100 o H100. Para entrenamiento del adaptador se recomienda al menos 16 GB (por el gradient checkpointing y batch size 1).
- Si cabe en consumer GPU: si, el modelo base con el adaptador se puede ejecutar en GPUs de consumo como RTX 3060 (12 GB) o incluso en CPUs con cuantizacion, aunque no se proporcionan configuraciones de cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` en Python. Tambien es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base. No hay soporte directo para llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia. En una RTX 4090, un modelo de 1.4B puede generar alrededor de 50-100 tokens/s en FP16, pero no hay datos especificos para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spadeMIA/pythia-1.4b-goodwiki-lora-r64 (este) | 1.4B + LoRA r64 | 2048 | Investigacion MIA | No disponible | HuggingFace |
| spadeMIA/pythia-1.4b-goodwiki-lora-r16-a64 | 1.4B + LoRA r16 | 2048 | Investigacion MIA (variante) | No disponible | HuggingFace |
| EleutherAI/pythia-1.4b (modelo base) | 1.4B | 2048 | Modelo de lenguaje general | Apache 2.0 | HuggingFace |
| EleutherAI/pythia-2.8b | 2.8B | 2048 | Modelo de lenguaje general | Apache 2.0 | HuggingFace |

La comparativa muestra que este adaptador no compite en rendimiento con modelos de lenguaje generales, sino que es una herramienta de investigacion. Su valor reside en la configuracion experimental documentada y en la posibilidad de comparar con la variante r16 para estudiar el efecto del rango LoRA.

## Limitaciones y advertencias

- No es un modelo de produccion: esta diseñado exclusivamente para investigacion academica sobre membership inference. No debe usarse en aplicaciones reales de generacion de texto o chatbots.
- Sesgos conocidos: el dataset de entrenamiento proviene de Wikipedia, que tiene sesgos inherentes de contenido y cobertura (predominantemente cultura occidental, ingles, etc.). No se ha realizado ninguna evaluacion de sesgos.
- Riesgo de alucinacion: el modelo base Pythia-1.4b tiene una tasa de alucinacion moderada, y el adaptador no la corrige. No se recomienda su uso para tareas que requieran factualidad.
- Limitaciones de contexto: la ventana de contexto es de solo 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Restricciones de licencia: la licencia no esta especificada, lo que genera incertidumbre legal para cualquier uso comercial. Se recomienda contactar con los autores antes de cualquier aplicacion fuera del ambito academico.
- Caveat para produccion: al ser un adaptador LoRA, requiere el modelo base Pythia-1.4b para funcionar. La carga conjunta puede tener problemas de compatibilidad si se usan versiones antiguas de `transformers` o `peft`.
- Datos de entrenamiento no publicos: el dataset `GoodWiki_Corpus_1024_2040` no se ha descrito en detalle (no se indica el idioma, la fecha de extraccion, ni el proceso de filtrado), lo que limita la reproducibilidad externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spadeMIA/pythia-1.4b-goodwiki-lora-r64
- Variante r16: https://huggingface.co/spadeMIA/pythia-1.4b-goodwiki-lora-r16-a64
- Dataset de entrenamiento: https://huggingface.co/datasets/spadeMIA/GoodWiki_Corpus_1024_2040
- Repositorio de Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Informacion sobre Pythia-1.4b en LLM Explorer: https://llm-explorer.com/model/EleutherAI%2Fpythia-1.4b,W90pxU316vZ9fjBYtbxor
